#!/usr/bin/env node
/**
 * Does NHC list a live storm? Run hourly by .github/workflows/storms-watch.yml,
 * so the answer reaches Kyle without any session open.
 *
 * It reads production's own /weather/api/storms (the route that already checks
 * NHC's CurrentStorms.json) and acts on one fact, activeCount:
 *
 *   0 -> above 0   open an issue (GitHub emails the owner) and FAIL the run
 *                  (GitHub emails a failed scheduled run too: spend.yml
 *                  already relies on that). Once, at the transition.
 *   above 0, issue already open   say nothing: a storm can last for days, and
 *                  an email an hour for a week gets filtered. The open issue IS
 *                  the memory that Kyle has been told.
 *   back to 0      close the issue with a note, quietly.
 *   could not check (non-200, not JSON, no activeCount)   FAIL, loudly. The
 *                  route answers 502 when NHC cannot be read, on purpose, so
 *                  "could not check" never reads as "no storms" here either.
 *
 * STORM_WATCH_TEST=true (the workflow's manual `test` input) pretends one storm
 * is listed, titled [test], so the email path can be proved end to end; the
 * next ordinary run sees count 0 with the issue open and closes it again.
 *
 * Nothing here writes to production: one GET, then `gh` against this repo.
 */

import { writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const STORMS_URL = 'https://branyontech.com/weather/api/storms';
export const LABEL = 'storm-watch';
const CONSOLE = 'https://branyontech.com/weather/#radar';

/** The route's answer, reduced to what the decision and the issue need; or why it cannot be read. */
export function summarize(status, text) {
  if (status !== 200) return { ok: false, why: `HTTP ${status}` };
  let body;
  try { body = JSON.parse(text); } catch { return { ok: false, why: 'the answer was not JSON' }; }
  if (!body || typeof body.activeCount !== 'number' || !Array.isArray(body.storms)) {
    return { ok: false, why: 'the answer has no activeCount and storms' };
  }
  return {
    ok: true,
    count: body.activeCount,
    checked: typeof body.checked === 'string' ? body.checked : null,
    storms: body.storms.slice(0, 5).map((s) => ({
      id: String(s && s.id || ''), name: String(s && s.name || ''), classification: s && s.classification || null,
      windKt: s && Number.isFinite(s.windKt) ? s.windKt : null, updated: s && s.updated || null,
      parts: s && s.parts && typeof s.parts === 'object' ? s.parts : null,
    })),
  };
}

const label = (s) => `${s.name || s.id}${s.classification || s.windKt != null ? ` (${[s.classification, s.windKt != null ? `${Math.round(s.windKt)} kt` : null].filter(Boolean).join(' ')})` : ''}`;

/** The issue to open when the first storm is listed. */
export function issueFor(summary, test = false) {
  const names = summary.storms.map(label).join(', ');
  const title = `${test ? '[test] ' : ''}NHC lists ${summary.count} live storm${summary.count === 1 ? '' : 's'}${names ? `: ${names}` : ''}`.slice(0, 120);
  const text = `${test ? '**This is a test**: no storm is listed. The next hourly run closes this issue.\n\n' : ''}`
    + `NHC's CurrentStorms.json lists **${summary.count}** active storm${summary.count === 1 ? '' : 's'} (checked ${summary.checked || 'just now'}).\n\n`
    + (summary.storms.length ? summary.storms.map((s) => `- **${label(s)}** \`${s.id}\`${s.updated ? `, advisory ${s.updated}` : ''}${s.parts ? `. Parts: ${Object.entries(s.parts).map(([k, v]) => `${k} ${v}`).join(', ')}` : ''}`).join('\n') + '\n\n' : '')
    + `Look at it on the console: ${CONSOLE}\nand against NHC's own page: https://www.nhc.noaa.gov/\n\n`
    + '**Not an official source.** The console is a hobby site: use NHC and your local NWS office for warnings.\n\n'
    + '## What to look at on the first live storm\n\n'
    + '1. The `CurrentStorms.json` field names the route reads (`id`, `binNumber`, `name`, `classification`, `intensity`, `pressure`, `latitudeNumeric`, `longitudeNumeric`, `movementDir`, `movementSpeed`, `lastUpdate`, `publicAdvisory`) were NHC\'s documented schema and have never been seen live: check none came back null.\n'
    + '2. The cone: the ArcGIS layer is found by the name `<binNumber> Forecast Cone` (for example `EP1`, `AT1`): `parts.cone` should be `ok`.\n'
    + '3. The model runs (AVNO, EMXI, HFSA, HFSB, CTCX): EMXI has never been seen on a real storm.\n'
    + '4. The YOU card, the "NOT AN OFFICIAL SOURCE" strip and the advisory age, against NHC\'s page.\n'
    + '5. The wind radii at the centre, against NHC\'s advisory text.\n'
    + '6. The similar-past-tracks section: plausible, and worded as similarity.\n'
    + '7. `/api/storms` latency, and any `[soft] storm` or `[slow]` line in the Lambda\'s CloudWatch logs.\n\n'
    + 'This issue closes itself when NHC lists no storm. While a storm stays listed it stays quiet: you are told once.\n';
  return { title, text };
}

/** What to do, from the summary and whether an alert issue is already open. */
export function decide(summary, issueOpen, test = false) {
  if (!summary.ok) return { action: 'fail', why: `could not check NHC through the site: ${summary.why}` };
  if (summary.count > 0) return issueOpen ? { action: 'none', why: `${summary.count} live, already reported` } : { action: 'open', ...issueFor(summary, test) };
  return issueOpen ? { action: 'close', why: 'NHC lists no storm now' } : { action: 'none', why: 'no active storms' };
}

function gh(args) {
  const r = spawnSync('gh', args, { encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

async function main() {
  const test = process.env.STORM_WATCH_TEST === 'true';
  let summary;
  if (test) {
    summary = { ok: true, count: 1, checked: new Date().toISOString(), storms: [{ id: 'test', name: 'TEST', classification: null, windKt: null, updated: null, parts: null }] };
  } else {
    try {
      const res = await fetch(STORMS_URL, { signal: AbortSignal.timeout(25000) });
      summary = summarize(res.status, await res.text());
    } catch (e) {
      summary = { ok: false, why: `${e.name || 'Error'}: ${e.message}` };
    }
  }

  // Whether Kyle has already been told: an open issue with our label. If gh cannot say, assume not.
  const listed = summary.ok ? gh(['issue', 'list', '--label', LABEL, '--state', 'open', '--json', 'number', '--jq', '.[0].number // empty']) : { ok: false, out: '' };
  const openNumber = listed.ok && /^\d+$/.test(listed.out) ? listed.out : null;
  const d = decide(summary, openNumber != null, test);
  console.log(`storm-watch: ${d.action}${d.why ? ` (${d.why})` : ''}${d.title ? ` -> ${d.title}` : ''}`);

  if (d.action === 'open') {
    gh(['label', 'create', LABEL, '--color', 'd93f0b', '--description', 'NHC lists a live storm', '--force']);
    const file = join(tmpdir(), `storm-watch-${process.pid}.md`);
    await writeFile(file, d.text);
    const made = gh(['issue', 'create', '--title', d.title, '--body-file', file, '--label', LABEL]);
    if (!made.ok) console.error(`storm-watch: could not open the issue: ${made.err}`);
    // Fail the run either way: a failed scheduled run is mailed, so a broken issue path still reaches Kyle.
    process.exitCode = 1;
  } else if (d.action === 'close') {
    const closed = gh(['issue', 'close', openNumber, '--comment', 'NHC lists no active storm now, so this alert is closed. It reopens as a new issue the next time one is listed.']);
    if (!closed.ok) console.error(`storm-watch: could not close issue ${openNumber}: ${closed.err}`);
  } else if (d.action === 'fail') {
    console.error(`storm-watch: ${d.why}`);
    process.exitCode = 1;
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, `### Storm watch\n\n${d.action}${d.why ? `: ${d.why}` : ''}${d.title ? `\n\n${d.title}` : ''}\n`, { flag: 'a' });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
