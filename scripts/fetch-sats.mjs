#!/usr/bin/env node
/**
 * Fetch CelesTrak orbital elements, once, for the weather console's
 * SATELLITES layer. Usage: node scripts/fetch-sats.mjs <outDir>
 *
 * CelesTrak's usage policy (celestrak.org/usage-policy.php): download once
 * per 2-hour update, and "immediately stop querying when it receives any
 * non-HTTP 200 response" -- repeats get 403 and enough errors put the IP in
 * the firewall. So this never re-asks after an answer, stops at the first
 * failure, and writes a group only when it looks complete. The one exception
 * is a confirmed TCP connect timeout, before the HTTPS request could be sent.
 * That alone is tried again (CONNECT_TRIES in all, a pause between).
 * DNS/TLS failures, HTTP statuses and incomplete bodies stop the run.
 * Whatever is already in S3 stays until the next good run.
 *
 * It runs from a schedule, not from visitors: one fetch per group per cycle
 * however many people open the page. Exit status is non-zero if anything was
 * not fetched, so the workflow shows red and the upload step is skipped.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { requestOnce } from './lib/sats-http.mjs';

/** group -> the fewest records that can be believed. Starlink is ~11,000. */
export const GROUPS = {
  stations: 5,
  visual: 30,
  weather: 20,
  science: 20,
  starlink: 1000,
};

/** The fields SGP4 needs, plus the names we print. Nothing else is kept. */
export const KEEP = [
  'OBJECT_NAME', 'OBJECT_ID', 'NORAD_CAT_ID', 'EPOCH', 'MEAN_MOTION',
  'ECCENTRICITY', 'INCLINATION', 'RA_OF_ASC_NODE', 'ARG_OF_PERICENTER',
  'MEAN_ANOMALY', 'BSTAR', 'MEAN_MOTION_DOT', 'MEAN_MOTION_DDOT',
];

const UA = 'branyontech.com weather console (kbshaver@gmail.com)';

export const CONNECT_TRIES = 3;
export const CONNECT_PAUSE_MS = 30000;

/** One GET, tried again only on a confirmed TCP connect timeout. */
export async function getOnce(url, init, {
  fetchImpl = requestOnce, tries = CONNECT_TRIES, pauseMs = CONNECT_PAUSE_MS,
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
} = {}) {
  for (let n = 1; ; n++) {
    try {
      return await fetchImpl(url, init);
    } catch (e) {
      if (e?.retryableConnectTimeout !== true || n >= tries) throw e;
      console.error(`TCP connect timeout (${n} of ${tries}) -- pausing ${pauseMs} ms`);
      await sleep(pauseMs);
    }
  }
}

export function trim(records) {
  return records.map((r) => Object.fromEntries(KEEP.map((k) => [k, r[k]])));
}

export function acceptable(group, records) {
  return Array.isArray(records)
    && records.length >= GROUPS[group]
    && records.every((r) => r && r.NORAD_CAT_ID != null && typeof r.EPOCH === 'string');
}

export async function main(outDir, {
  get = getOnce,
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
} = {}) {
  const files = [];
  console.log(`Satellite fetch: Node ${process.version}; runner=${process.env.RUNNER_OS || 'local'}; image=${process.env.ImageVersion || 'unknown'}`);
  for (const group of Object.keys(GROUPS)) {
    const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`;
    console.log(`${group}: retrieving ${url}`);
    const res = await get(url, { headers: { 'User-Agent': UA } });
    if (res.status !== 200) {
      throw new Error(`${group}: HTTP ${res.status} -- stopping, not retrying; inspect CelesTrak usage policy`);
    }
    const records = await res.json();
    if (!acceptable(group, records)) {
      throw new Error(`${group}: ${Array.isArray(records) ? records.length : 'no'} records, not believed -- stopping`);
    }
    const fetched = new Date().toISOString();
    const body = JSON.stringify({ group, fetched, records: trim(records) });
    files.push([`${group}.json`, gzipSync(body, { level: 9 })]);
    console.log(`${group}: ${records.length} records, ${body.length} bytes`);
    await sleep(2000);   // gentle between groups
  }
  // A partial download never changes even the local snapshot.
  await mkdir(outDir, { recursive: true });
  for (const [name, body] of files) await writeFile(join(outDir, name), body);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) { console.error('usage: fetch-sats.mjs <outDir>'); process.exit(2); }
  main(process.argv[2]).catch((error) => {
    console.error(error);
    console.error('Satellite refresh failed; Publish is skipped and existing S3 data is preserved.');
    process.exitCode = 1;
  });
}
