import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { GROUPS } from './fetch-sats.mjs';

export const MIN_INTERVAL_MS = 2 * 60 * 60 * 1000 + 60_000;
export const JOB_BUDGET_MS = 20 * 60 * 1000;
export const STATE_KEY = 'sats/_fetch-state.json';
const DATA_KEYS = Object.keys(GROUPS).map((g) => `sats/${g}.json`);

/** Include actual published objects when bootstrapping the new guard. */
export function nextAllowed(objects, state) {
  let until = 0;
  if (state !== null) {
    until = Date.parse(state.notBefore);
    if (!Number.isFinite(until)) throw new Error('Invalid satellite cooldown state; refusing to fetch');
  }
  for (const item of objects) {
    if (!DATA_KEYS.includes(item.Key)) continue;
    const modified = Date.parse(item.LastModified);
    if (!Number.isFinite(modified)) throw new Error('Invalid S3 snapshot timestamp; refusing to fetch');
    until = Math.max(until, modified + MIN_INTERVAL_MS);
  }
  return until;
}

/** All callers share the workflow's concurrency group. Persist the reservation
 * BEFORE touching CelesTrak, so failed/partial/cancelled runs also count.
 * No credentials are written into the state object or logs.
 */
export async function reserve({ list, read, write, now = Date.now }) {
  const objects = await list();
  const state = objects.some((x) => x.Key === STATE_KEY) ? await read() : null;
  const time = now();
  const until = nextAllowed(objects, state);
  if (time < until) {
    console.log(`Keeping S3 snapshot; next CelesTrak request allowed after ${new Date(until).toISOString()}`);
    return false;
  }
  // If cancelled before finish(), the reservation outlives every possible
  // request in this job by at least two hours (workflow timeout: 20 minutes).
  await write({ notBefore: new Date(time + JOB_BUDGET_MS + MIN_INTERVAL_MS).toISOString() });
  return true;
}

export async function finish({ write, now = Date.now }) {
  await write({ notBefore: new Date(now() + MIN_INTERVAL_MS).toISOString() });
}

async function cli(mode) {
  const bucket = process.env.S3_BUCKET, temp = process.env.RUNNER_TEMP;
  if (!bucket || !temp || !['reserve', 'finish'].includes(mode)) throw new Error('Use reserve|finish with S3_BUCKET and RUNNER_TEMP');
  const run = promisify(execFile);
  const aws = async (...args) => (await run('aws', args, { encoding: 'utf8', timeout: 60_000 })).stdout;
  const file = join(temp, 'sats-fetch-state.json');
  const io = {
    list: async () => {
      const data = JSON.parse(await aws('s3api', 'list-objects-v2', '--bucket', bucket, '--prefix', 'sats/', '--output', 'json'));
      if (data.Contents !== undefined && !Array.isArray(data.Contents)) throw new Error('Invalid S3 listing');
      return data.Contents || [];
    },
    read: async () => {
      await aws('s3api', 'get-object', '--bucket', bucket, '--key', STATE_KEY, file);
      return JSON.parse(await readFile(file, 'utf8'));
    },
    write: async (state) => {
      await writeFile(file, JSON.stringify(state));
      await aws('s3api', 'put-object', '--bucket', bucket, '--key', STATE_KEY,
        '--body', file, '--content-type', 'application/json', '--cache-control', 'no-store');
    },
  };
  if (mode === 'finish') await finish(io);
  else {
    const ready = await reserve(io);
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `ready=${ready}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  cli(process.argv[2]).catch((error) => { console.error(error); process.exitCode = 1; });
}
