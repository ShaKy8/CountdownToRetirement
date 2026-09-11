#!/usr/bin/env node
/*
 * The weekly spend check: what the site cost this month, from both bills.
 *
 * Two bills, two sources:
 *
 *   AWS        Cost Explorer, month-to-date and last month, by service. A
 *              Cost Explorer call costs $0.01, so this makes exactly one.
 *
 *   Anthropic  The Lambda logs one JSON line per model call with the token
 *              counts the API returned (lambda/index.mjs, the ELSEWHERE
 *              route). A CloudWatch Insights query sums them and this prices
 *              them at the published rates, so no Admin key is needed. When
 *              ANTHROPIC_ADMIN_KEY is set, the organisation's cost report is
 *              fetched as well and printed beside the estimate as the
 *              authoritative figure; the key is never printed.
 *
 * Prints a table, writes it to $GITHUB_STEP_SUMMARY when run in Actions, and
 * exits 1 when either bill is on course to pass its limit, or when a source
 * returns nothing. A check that cannot see the bill must not report a quiet
 * month, and a failed scheduled run is what GitHub sends mail about.
 *
 *   aws login                            # a live session; Actions uses OIDC
 *   node scripts/spend-check.mjs
 *   AWS_LIMIT=8 ANTHROPIC_LIMIT=5 node scripts/spend-check.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const LOG_GROUP = `/aws/lambda/${process.env.LAMBDA_FUNCTION || 'atmos-weather-api'}`;
const AWS_LIMIT = Number(process.env.AWS_LIMIT || 5);
const ANTHROPIC_LIMIT = Number(process.env.ANTHROPIC_LIMIT || 5);

// Dollars per million tokens, first-party API rates as of 2026-09-10. The
// model name has to match what the Lambda sends; a test pins the two together.
const RATES = {
  'claude-sonnet-5': { input: 2.0, output: 10.0 },
};
// The Lambda started logging usage on this date; a month that began before it
// is only partly visible in the logs, and the report says so.
const LOGGING_SINCE = '2026-09-10';

// ---- dates, all UTC -------------------------------------------------------
const now = new Date();
const y = now.getUTCFullYear(), m = now.getUTCMonth(), d = now.getUTCDate();
const iso = (t) => t.toISOString().slice(0, 10);
const monthStart = new Date(Date.UTC(y, m, 1));
const prevStart = new Date(Date.UTC(y, m - 1, 1));
const tomorrow = new Date(Date.UTC(y, m, d + 1));       // Cost Explorer's End is exclusive
const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const project = (mtd) => (mtd / d) * daysInMonth;

// ---- helpers ----------------------------------------------------------------
const aws = (args) => JSON.parse(execFileSync('aws', [...args, '--output', 'json'], { encoding: 'utf8' }));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const usd = (n) => (n == null ? '—' : `$${n.toFixed(2)}`);
const problems = [];

// ---- AWS: one Cost Explorer call for last month and this one ---------------
let awsPrev = null, awsMtd = null, awsTop = [];
try {
  const ce = aws(['ce', 'get-cost-and-usage',
    '--time-period', `Start=${iso(prevStart)},End=${iso(tomorrow)}`,
    '--granularity', 'MONTHLY', '--metrics', 'UnblendedCost',
    '--group-by', 'Type=DIMENSION,Key=SERVICE']);
  for (const r of ce.ResultsByTime || []) {
    const rows = (r.Groups || []).map((g) => [g.Keys[0], Number(g.Metrics.UnblendedCost.Amount)]);
    const total = rows.reduce((s, [, a]) => s + a, 0);
    if (r.TimePeriod.Start === iso(monthStart)) {
      awsMtd = total;
      awsTop = rows.filter(([, a]) => a >= 0.005).sort((a, b) => b[1] - a[1]).slice(0, 6);
    } else if (r.TimePeriod.Start === iso(prevStart)) {
      awsPrev = total;
    }
  }
  if (awsMtd == null) problems.push('Cost Explorer returned no month-to-date bucket');
} catch (e) {
  problems.push(`Cost Explorer: ${String(e.message || e).split('\n')[0]}`);
}

// ---- Anthropic: the Lambda's own usage lines, summed by Insights -------------
async function insights(queryString) {
  const { queryId } = aws(['logs', 'start-query', '--log-group-name', LOG_GROUP,
    '--start-time', String(Math.floor(monthStart / 1000)),
    '--end-time', String(Math.floor(now / 1000)),
    '--query-string', queryString]);
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    const r = aws(['logs', 'get-query-results', '--query-id', queryId]);
    if (r.status === 'Complete') {
      return Object.fromEntries((r.results[0] || []).map((f) => [f.field, Number(f.value)]));
    }
    if (['Failed', 'Cancelled', 'Timeout'].includes(r.status)) throw new Error(`query ${r.status}`);
  }
  throw new Error('query did not complete');
}

let calls = null, tokIn = 0, tokOut = 0, invocations = null, estimate = null;
try {
  const [u, inv] = await Promise.all([
    insights('filter @message like /"metric":"anthropic"/'
      + ' | parse @message /"input_tokens":(?<tin>\\d+)/'
      + ' | parse @message /"output_tokens":(?<tout>\\d+)/'
      + ' | stats count() as calls, sum(tin) as tokIn, sum(tout) as tokOut'),
    insights('filter @type = "REPORT" | stats count() as n'),
  ]);
  calls = u.calls || 0; tokIn = u.tokIn || 0; tokOut = u.tokOut || 0;
  invocations = inv.n || 0;
  const rate = RATES['claude-sonnet-5'];
  estimate = (tokIn * rate.input + tokOut * rate.output) / 1e6;
} catch (e) {
  problems.push(`CloudWatch Logs: ${String(e.message || e).split('\n')[0]}`);
}

// ---- Anthropic: the real number, when there is a key that can read it -------
let reported = null;
const adminKey = process.env.ANTHROPIC_ADMIN_KEY;
if (adminKey) {
  try {
    let page = null, total = 0;
    do {
      const url = new URL('https://api.anthropic.com/v1/organizations/cost_report');
      url.searchParams.set('starting_at', monthStart.toISOString());
      url.searchParams.set('ending_at', tomorrow.toISOString());
      if (page) url.searchParams.set('page', page);
      const res = await fetch(url, {
        headers: { 'anthropic-version': '2023-06-01', 'x-api-key': adminKey,
          'user-agent': 'branyontech-spend-check/1.0 (https://branyontech.com)' },
      });
      if (!res.ok) throw new Error(`cost_report ${res.status}`);
      const j = await res.json();
      for (const b of j.data || []) for (const r of b.results || []) total += Number(r.amount) || 0;
      page = j.has_more ? j.next_page : null;
    } while (page);
    reported = total / 100;                      // amounts are in cents
  } catch (e) {
    problems.push(`Anthropic cost report: ${String(e.message || e).split('\n')[0]}`);
  }
}

// ---- verdict ----------------------------------------------------------------
const anthropicMtd = reported ?? estimate;
const awsProj = awsMtd == null ? null : project(awsMtd);
const anthProj = anthropicMtd == null ? null : project(anthropicMtd);
const over = [];
if (awsProj != null && awsProj > AWS_LIMIT) over.push(`AWS is on course for ${usd(awsProj)} against a ${usd(AWS_LIMIT)} limit`);
if (anthProj != null && anthProj > ANTHROPIC_LIMIT) over.push(`Anthropic is on course for ${usd(anthProj)} against a ${usd(ANTHROPIC_LIMIT)} limit`);

const lines = [];
lines.push(`## Spend check, ${iso(now)} (day ${d} of ${daysInMonth})`, '');
lines.push('| | Last month | This month so far | On course for | Limit |');
lines.push('|---|---:|---:|---:|---:|');
lines.push(`| AWS | ${usd(awsPrev)} | ${usd(awsMtd)} | ${usd(awsProj)} | ${usd(AWS_LIMIT)} |`);
lines.push(`| Anthropic${reported == null ? ' (estimated from logs)' : ''} | — | ${usd(anthropicMtd)} | ${usd(anthProj)} | ${usd(ANTHROPIC_LIMIT)} |`);
lines.push('');
if (awsTop.length) {
  lines.push('AWS this month, by service:', '');
  for (const [k, a] of awsTop) lines.push(`- ${usd(a)} ${k}`);
  lines.push('');
}
if (calls != null) {
  lines.push(`Model calls this month: ${calls} (${tokIn} in, ${tokOut} out tokens) across ${invocations} Lambda invocations.`);
  if (reported != null) lines.push(`Anthropic's own figure: ${usd(reported)}; the log estimate was ${usd(estimate)}.`);
  else lines.push('No ANTHROPIC_ADMIN_KEY, so the Anthropic line is priced from the logs.');
  if (iso(monthStart) < LOGGING_SINCE) lines.push(`Usage logging began ${LOGGING_SINCE}; calls before that are not in the estimate.`);
  lines.push('');
}
for (const p of problems) lines.push(`- ⚠ ${p}`);
for (const o of over) lines.push(`- ❌ ${o}`);
if (!problems.length && !over.length) lines.push('✅ Both bills inside their limits.');

const out = lines.join('\n');
console.log(out);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out + '\n');
if (problems.length || over.length) process.exit(1);
