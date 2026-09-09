/*
 * Step 0: does a model beat the rules, and if so which one?
 *
 * TONIGHT already answers "is tonight worth going outside" deterministically.
 * `verdict()` ships with no API key and is what gets served when the model is
 * unreachable or the budget is spent, so it is the BAR, not the baseline: a
 * model earns the call only by being clearly better than the sentence we can
 * already write for free. This prints them side by side against real
 * forecasts and makes you decide with your eyes.
 *
 * The key is read from ~/.config/anthropic/branyontech-key (or
 * ANTHROPIC_API_KEY) and is never printed, never written, never sent anywhere
 * but api.anthropic.com.
 *
 *   node scripts/model-bake-off.mjs
 *   node scripts/model-bake-off.mjs --places 5 --origin http://localhost:8000
 *   node scripts/model-bake-off.mjs --key-file ~/somewhere/else
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const ORIGIN = arg('origin', 'https://branyontech.com').replace(/\/$/, '');
const WANT = Number(arg('places', 3));
const HOUR = 3600e3;

/* ---- the key, from outside the repo ---- */
const KEY_FILE = arg('key-file', path.join(os.homedir(), '.config', 'anthropic', 'branyontech-key'));
let KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY && fs.existsSync(KEY_FILE)) KEY = fs.readFileSync(KEY_FILE, 'utf8').trim();
if (!KEY) {
  console.error(`\nNo key.\n  --key-file <path>, or ${KEY_FILE}, or ANTHROPIC_API_KEY.\n`);
  process.exit(1);
}
if (!/^sk-ant-/.test(KEY)) {
  // Catches a file holding a whole `export FOO=...` line, or the wrong file
  // entirely, before it becomes a confusing 401.
  console.error(`\nThat file does not look like an API key (expected it to start sk-ant-).\n`);
  process.exit(1);
}

/* Prices per million tokens, input/output. Checked Sep 2026 -- correct these
 * if they have moved; every cost figure below derives from them. */
const MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5', in: 1, out: 5 },
  { id: 'claude-sonnet-5', label: 'Sonnet 5', in: 2, out: 10 },
  { id: 'claude-opus-5', label: 'Opus 5', in: 5, out: 25 },
];

const loadModule = async (rel) => {
  const src = fs.readFileSync(path.join(HERE, '..', rel), 'utf8');
  return import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
};
const A = await loadModule('weather/js/lib/astro.js');
const T = await loadModule('weather/js/lib/tonight.js');

const PLACES = [
  ['Los Angeles', 34.05, -118.24],
  ['Reykjavik', 64.15, -21.94],
  ['Singapore', 1.35, 103.82],
  ['Sydney', -33.87, 151.21],
  ['Tromso', 69.65, 18.96],
].slice(0, WANT);

/*
 * The register is brief.js's: "a flat, factual register -- the useful bits,
 * ordered by how much they should change your plans." The model is given the
 * assessment, never the raw forecast: the rules decide what is true and the
 * model only decides how to say it. That keeps the arithmetic in code, where
 * it can be tested.
 */
const SYSTEM = `You write one sentence for a weather console, answering "is tonight worth going outside to look up?"

The console has a house voice. These are real lines from it:
  "It is raining now and should ease within 12 minutes."
  "It is raining now, with no break in the next six hours."
  "Very dry air, dew point 34 degrees. Expect static and chapped lips."
  "Sunset is at 7:41pm, with golden hour beginning 7:02pm."

Declarative, present tense, no evaluative adjectives, figures stated plainly. Where it adds a consequence it does so impersonally ("Expect static"), never "you should" or "you might want to".

Decide what to say, in this order:
- Tonight has a run of 3 or more clear moonless hours: say tonight, and when. Do NOT mention later nights; they are noise when tonight already works.
- Tonight has under 1 hour and a later night is clearly better: lead with the later night. That is the news.
- Tonight is in between: say what the window is and what limits it — cloud, or the run being short. Name a later night only if it is more than twice as long.
- No darkness at all: say so plainly.

Rules:
- ONE sentence, under 25 words. Shorter is better.
- Use ONLY the figures given. Never invent a time, a duration, or a number.
- Times exactly as given, 24-hour. Percentages as digits with a % sign.
- Never use: excellent, perfect, great, ideal, stunning, beautiful, spectacular, gorgeous, washout, treat, "worth it", "make the most of", "don't miss". No exclamation marks.
- Do not restate every field. Choose.
- Return the sentence and nothing else. No preamble, no quotation marks.`;

const factsFor = (nights, tf) => {
  const shape = (n) => ({
    night: tf.weekday(n.day),
    darkFrom: n.dark ? tf.hm(n.dark.from) : null,
    darkTo: n.dark ? tf.hm(n.dark.to) : null,
    clearMoonlessHours: n.dark ? Number(n.goodHours) : 0,
    longestRun: n.best ? `${tf.hm(n.best.from)}-${tf.hm(n.best.to)}` : null,
    meanCloudPct: n.cloudMean == null ? null : Math.round(n.cloudMean),
    moonLitPct: Math.round(n.moonLit * 100),
    score: n.score,
  });
  return { tonight: shape(nights[0]), comingNights: nights.slice(1).map(shape) };
};

/* Every figure the model is allowed to say, as strings. Anything numeric in
 * the output that is not in here was invented. */
const allowed = (facts) => {
  const set = new Set();
  const add = (v) => { if (v != null) String(v).split(/[^0-9:]+/).filter(Boolean).forEach((s) => set.add(s)); };
  const walk = (o) => Object.values(o).forEach((v) => {
    if (v && typeof v === 'object') walk(v); else add(v);
  });
  walk(facts);
  // A time may be rendered 21:30, 9:30 or 9. Accept the parts.
  for (const s of [...set]) if (s.includes(':')) s.split(':').forEach((p) => { set.add(p); set.add(String(Number(p))); });
  for (const s of [...set]) set.add(String(Number(s)));
  return set;
};

const BANNED = /\b(excellent|perfect|great|ideal|stunning|beautiful|spectacular|gorgeous|washout|treat|worth it|make the most|don't miss|amazing|lovely)\b|!/i;

const unverified = (text, ok) =>
  [...new Set((text.match(/\d{1,2}:\d{2}|\d+/g) || []))].filter((n) => !ok.has(n) && !ok.has(String(Number(n))));

async function ask(model, facts) {
  const t0 = Date.now();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': KEY,
    },
    body: JSON.stringify({
      model, max_tokens: 300, system: SYSTEM,
      messages: [{ role: 'user', content: JSON.stringify(facts) }],
    }),
  });
  const ms = Date.now() - t0;
  if (!res.ok) {
    const body = await res.text();
    // Never echo headers; the body carries the API's own message only.
    return { error: `${res.status} ${body.slice(0, 200)}`, ms };
  }
  const j = await res.json();
  const text = (j.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  return { text, ms, usage: j.usage };
}

const money = (n) => (n < 0.01 ? `${(n * 100).toFixed(3)}c` : `$${n.toFixed(4)}`);
const totals = new Map(MODELS.map((m) => [m.id, { cost: 0, ms: [], words: [], bad: 0, slips: 0, long: 0 }]));

console.log(`\nTONIGHT — the rules vs the models, on live forecasts from ${ORIGIN}\n`);

for (const [name, lat, lon] of PLACES) {
  let bundle;
  try {
    bundle = await (await fetch(`${ORIGIN}/weather/api/bundle?lat=${lat}&lon=${lon}`)).json();
  } catch (e) { console.log(`  ${name}: no forecast (${e.message})\n`); continue; }
  const H = bundle.forecast?.data?.hourly;
  if (!H?.time) {
    // Sydney hit this once and had 432 hourly entries minutes later, so the
    // interesting question is whether the API said no or the payload was thin.
    const why = bundle.forecast?.ok === false ? 'forecast.ok was false'
      : bundle.forecast ? `data keys: ${Object.keys(bundle.forecast.data || {}).join(', ') || 'none'}`
        : 'no forecast envelope at all';
    console.log(`  ${name}: no hourly series — ${why}\n`);
    continue;
  }

  const off = (bundle.forecast.data.utc_offset_seconds ?? 0) * 1000;
  const hours = H.time.map((s, i) => ({
    t: Date.parse(`${s.includes('T') ? s : `${s}T00:00:00`}Z`) - off,
    cloud: H.cloud_cover?.[i] ?? null,
  }));
  const tf = {
    hm: (t) => new Date(t + off).toISOString().slice(11, 16),
    weekday: (t) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(t + off).getUTCDay()],
  };
  const nights = T.assessNights(hours, lat, lon, Date.now(), {
    sunTimes: A.sunTimes, moonPosition: A.moonPosition,
    moonIllumination: A.moonIllumination, toDeg: A.toDeg,
  }, T.NIGHTS, off);

  const facts = factsFor(nights, tf);
  const ok = allowed(facts);
  const t = facts.tonight;

  console.log(`  ${'='.repeat(72)}`);
  console.log(`  ${name}  —  tonight: ${t.clearMoonlessHours}h clear+moonless, `
    + `run ${t.longestRun || 'none'}, cloud ${t.meanCloudPct ?? '-'}%, moon ${t.moonLitPct}%, score ${t.score}`);
  console.log(`  best of the week: ${facts.comingNights.reduce((a, b) => (b.score > a.score ? b : a), t).night}\n`);
  console.log(`    RULES (free)   ${T.verdict(nights, tf)}\n`);

  for (const m of MODELS) {
    const r = await ask(m.id, facts);
    const agg = totals.get(m.id);
    if (r.error) { console.log(`    ${m.label.padEnd(14)} ERROR ${r.error}`); continue; }
    const cost = (r.usage.input_tokens / 1e6) * m.in + (r.usage.output_tokens / 1e6) * m.out;
    agg.cost += cost; agg.ms.push(r.ms); agg.words.push(r.text.split(/\s+/).length);
    const bad = unverified(r.text, ok);
    if (bad.length) agg.bad++;
    const slip = r.text.match(BANNED);
    if (slip) agg.slips++;
    const words = r.text.split(/\s+/).length;
    if (words > 25) agg.long++;
    console.log(`    ${m.label.padEnd(14)} ${r.text}`);
    console.log(`    ${''.padEnd(14)} ${String(r.ms).padStart(5)}ms  `
      + `${r.usage.input_tokens}in/${r.usage.output_tokens}out  ${money(cost)}`
      + (bad.length ? `  ⚠ figures not in the data: ${bad.join(', ')}` : '')
      + (slip ? `  ⚠ register: "${slip[0]}"` : '')
      + (words > 25 ? `  ⚠ ${words} words` : ''));
    console.log();
  }
}

const med = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : 0);
console.log(`  ${'='.repeat(72)}\n  Per call, and at 200 calls a day for a month:\n`);
for (const m of MODELS) {
  const g = totals.get(m.id);
  if (!g.ms.length) continue;
  const per = g.cost / g.ms.length;
  console.log(`    ${m.label.padEnd(12)} ${money(per)}/call   $${(per * 200 * 30).toFixed(2)}/mo`
    + `   ${String(med(g.ms)).padStart(5)}ms median   ${med(g.words)} words`
    + (g.bad ? `   ⚠ ${g.bad} invented` : '') + (g.slips ? `   ⚠ ${g.slips} register` : '')
    + (g.long ? `   ⚠ ${g.long} over-long` : ''));
}
console.log(`\n  Total spent on this run: ${money([...totals.values()].reduce((a, b) => a + b.cost, 0))}\n`);
