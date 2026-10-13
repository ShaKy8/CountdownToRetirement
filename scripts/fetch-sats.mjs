#!/usr/bin/env node
/**
 * Fetch CelesTrak orbital elements, once, for the weather console's
 * SATELLITES layer. Usage: node scripts/fetch-sats.mjs <outDir>
 *
 * CelesTrak's usage policy (celestrak.org/usage-policy.php): download once
 * per 2-hour update, and "immediately stop querying when it receives any
 * non-HTTP 200 response" -- repeats get 403 and enough errors put the IP in
 * the firewall. So this never retries, stops at the first failure, and writes
 * a group only when it looks complete. Whatever is already in S3 stays until
 * the next good run.
 *
 * It runs from a schedule, not from visitors: one fetch per group per cycle
 * however many people open the page. Exit status is non-zero if anything was
 * not fetched, so the workflow shows red and the upload step is skipped.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

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

export function trim(records) {
  return records.map((r) => Object.fromEntries(KEEP.map((k) => [k, r[k]])));
}

export function acceptable(group, records) {
  return Array.isArray(records)
    && records.length >= GROUPS[group]
    && records.every((r) => r && r.NORAD_CAT_ID != null && typeof r.EPOCH === 'string');
}

async function main(outDir) {
  await mkdir(outDir, { recursive: true });
  const fetched = new Date().toISOString();
  for (const group of Object.keys(GROUPS)) {
    const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status !== 200) {
      console.error(`${group}: HTTP ${res.status} -- stopping, not retrying`);
      process.exit(1);
    }
    const records = await res.json();
    if (!acceptable(group, records)) {
      console.error(`${group}: ${Array.isArray(records) ? records.length : 'no'} records, not believed -- stopping`);
      process.exit(1);
    }
    const body = JSON.stringify({ group, fetched, records: trim(records) });
    await writeFile(join(outDir, `${group}.json`), gzipSync(body, { level: 9 }));
    console.log(`${group}: ${records.length} records, ${body.length} bytes`);
    await new Promise((r) => setTimeout(r, 2000));   // gentle between groups
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!process.argv[2]) { console.error('usage: fetch-sats.mjs <outDir>'); process.exit(2); }
  main(process.argv[2]);
}
