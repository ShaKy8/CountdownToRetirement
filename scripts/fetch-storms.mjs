#!/usr/bin/env node
/**
 * Build the weather console's hurricane archive from NHC's HURDAT2 best
 * tracks. Usage:
 *
 *   node scripts/fetch-storms.mjs <outDir>                       # from NHC
 *   node scripts/fetch-storms.mjs <outDir> --from-file al.txt ep.txt [--plain] [--fixture]
 *
 * --plain writes uncompressed files (what a dev server can serve as they are).
 * --fixture skips the believability floors, for the small committed samples in
 * tests/fixtures/; the workflow never passes it, and a test says so.
 *
 * HURDAT2 is revised about once a year (the file name carries the year and a
 * date, so the name changes with it). This reads NHC's directory listing for
 * the newest of each basin, and if the published index already names those
 * files it stops: nothing to download, nothing to upload. Otherwise it parses,
 * checks the result against what has to be true of any real archive, encodes
 * it with the console's own stormpack.js, and writes content-hashed files plus
 * an index that points at them. The index is written last, so it can never
 * name a file that is not there.
 *
 * Like fetch-sats.mjs it never retries, stops at the first failure and writes
 * nothing it does not believe. A failed run leaves the last archive in S3.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { parseHurdat2 } from './lib/hurdat.mjs';
import { encodeArchive, encodeRadii } from '../weather/js/lib/stormpack.js';

const HURDAT = 'https://www.nhc.noaa.gov/data/hurdat/';
const PUBLISHED_INDEX = 'https://branyontech.com/storms/index.json';
const UA = 'branyontech.com weather console (kbshaver@gmail.com)';

/** Fewest storms and fixes that can be believed, and the first year each starts. */
export const BASINS = {
  al: { prefix: 'AL', name: /^hurdat2-1851-(\d{4})-(\d{6})\.txt$/, minStorms: 1800, minFixes: 50000, first: 1851 },
  ep: { prefix: 'EP', name: /^hurdat2-nepac-1949-(\d{4})-(\d{6})\.txt$/, minStorms: 1100, minFixes: 30000, first: 1949 },
};
/** All four files together, gzipped. The two track files were 237 KB when this was written. */
export const MAX_GZ_BYTES = 600 * 1024;

/**
 * Newest HURDAT2 file name for a basin in NHC's directory listing, or null.
 * Newest is by the year in the name, then by its MMDDYY suffix read as
 * year, month, day -- 092326 is 2026-09-23, later than 040425.
 */
export function discover(listing, basin) {
  const found = new Set();
  for (const m of String(listing).matchAll(/hurdat2-[a-z0-9-]+\.txt/g)) found.add(m[0]);
  let best = null, bestKey = '';
  for (const name of found) {
    const m = BASINS[basin].name.exec(name);
    if (!m) continue;
    const s = m[2];
    const key = `${m[1]}${s.slice(4, 6)}${s.slice(0, 2)}${s.slice(2, 4)}`;
    if (key > bestKey) { best = name; bestKey = key; }
  }
  return best;
}

/** Believe a parsed basin, or say why not. `prev` is the published index entry, if any. */
export function acceptable(basin, storms, rejected, prev = null) {
  const b = BASINS[basin];
  const fixes = storms.reduce((a, s) => a + s.fixes.length, 0);
  if (storms.length < b.minStorms) return `${basin}: ${storms.length} storms, fewer than ${b.minStorms}`;
  if (fixes < b.minFixes) return `${basin}: ${fixes} fixes, fewer than ${b.minFixes}`;
  if (rejected.length > Math.max(3, storms.length / 200)) return `${basin}: ${rejected.length} storms rejected as malformed`;
  const through = Math.max(...storms.map((s) => s.year));
  if (prev && through < prev.through) return `${basin}: data ends ${through}, before the published ${prev.through}`;
  if (!storms.some((s) => s.year === b.first)) return `${basin}: nothing from ${b.first}`;
  if (basin === 'al') {
    const katrina = storms.find((s) => s.id === 'AL122005');
    if (!katrina || Math.max(...katrina.fixes.map((f) => f.wind ?? 0)) < 150) return 'al: Katrina is missing or too weak';
  }
  return null;
}

async function get(url, what) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (res.status !== 200) {
    console.error(`${what}: HTTP ${res.status} -- stopping, not retrying`);
    process.exit(1);
  }
  return res;
}

async function published() {
  try {
    const res = await fetch(PUBLISHED_INDEX, { headers: { 'User-Agent': UA } });
    return res.status === 200 ? await res.json() : null;
  } catch { return null; }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function main(argv) {
  const outDir = argv[0];
  const plain = argv.includes('--plain');
  const fixture = argv.includes('--fixture');
  const from = argv.indexOf('--from-file');
  const prevIndex = from < 0 ? await published() : null;

  const texts = {}, names = {};
  if (from >= 0) {
    const files = argv.slice(from + 1).filter((a) => !a.startsWith('--'));
    ['al', 'ep'].forEach((b, i) => { names[b] = basename(files[i]); });
    for (const [i, b] of ['al', 'ep'].entries()) texts[b] = await readFile(files[i], 'utf8');
  } else {
    const listing = await (await get(HURDAT, 'directory listing')).text();
    for (const b of Object.keys(BASINS)) {
      names[b] = discover(listing, b);
      if (!names[b]) { console.error(`${b}: no HURDAT2 file found in the listing -- stopping`); process.exit(1); }
    }
    if (prevIndex && prevIndex.src && prevIndex.src.al === names.al && prevIndex.src.ep === names.ep) {
      console.log(`unchanged: ${names.al}, ${names.ep}`);
      return;
    }
    for (const b of Object.keys(BASINS)) {
      texts[b] = await (await get(HURDAT + names[b], names[b])).text();
      await wait(2000);
    }
  }

  await mkdir(outDir, { recursive: true });
  const built = new Date().toISOString();
  const index = { v: 1, built, files: {}, through: {}, counts: {}, src: names };
  const out = {};
  let gzTotal = 0;
  for (const b of Object.keys(BASINS)) {
    const { storms, rejected } = parseHurdat2(texts[b]);
    const why = fixture ? null : acceptable(b, storms, rejected, prevIndex && prevIndex.counts && { through: prevIndex.through[b] });
    if (why) { console.error(`${why} -- stopping`); process.exit(1); }
    const body = JSON.stringify(encodeArchive(storms, { basin: b, src: names[b] }));
    const bytes = plain ? Buffer.from(body) : gzipSync(body, { level: 9 });
    gzTotal += gzipSync(body, { level: 9 }).length;
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
    index.files[b] = `${b}.${hash}.json`;
    // The wind radii (2004 on) are their own file, fetched only when a modern storm's wind is drawn.
    const rBody = JSON.stringify(encodeRadii(storms, { basin: b, src: names[b] }));
    const rBytes = plain ? Buffer.from(rBody) : gzipSync(rBody, { level: 9 });
    gzTotal += gzipSync(rBody, { level: 9 }).length;
    index.files[`${b}r`] = `${b}-radii.${createHash('sha256').update(rBytes).digest('hex').slice(0, 8)}.json`;
    out[index.files[`${b}r`]] = rBytes;
    console.log(`${b} radii: ${rBytes.length} bytes`);
    index.through[b] = Math.max(...storms.map((s) => s.year));
    index.counts[b] = { storms: storms.length, fixes: storms.reduce((a, s) => a + s.fixes.length, 0) };
    out[index.files[b]] = bytes;
    console.log(`${b}: ${storms.length} storms, ${index.counts[b].fixes} fixes, ${rejected.length} rejected, ${bytes.length} bytes`);
  }
  if (gzTotal > MAX_GZ_BYTES) { console.error(`archive is ${gzTotal} bytes gzipped, over ${MAX_GZ_BYTES} -- stopping`); process.exit(1); }

  for (const [name, bytes] of Object.entries(out)) await writeFile(join(outDir, name), bytes);
  await writeFile(join(outDir, 'index.json'), plain ? JSON.stringify(index) : gzipSync(JSON.stringify(index), { level: 9 }));
  console.log(`wrote ${Object.keys(out).length} files and index.json to ${outDir}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!process.argv[2]) { console.error('usage: fetch-storms.mjs <outDir> [--from-file al.txt ep.txt] [--plain] [--fixture]'); process.exit(2); }
  main(process.argv.slice(2));
}
