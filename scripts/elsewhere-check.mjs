/*
 * ELSEWHERE's rules, against real forecasts.
 *
 * Like tonight-check.mjs: the module is pure, so it can be run and checked
 * directly rather than driven through a browser. What this catches is the
 * class of bug that makes a ranking look plausible and be wrong — a comfort
 * curve that says 39C is better than 21C, a unit mix-up that scores a
 * pleasant afternoon as unbearable, an order that reshuffles between refreshes.
 *
 *   node scripts/elsewhere-check.mjs                    # against production
 *   node scripts/elsewhere-check.mjs http://localhost:8000
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ORIGIN = (process.argv[2] || 'https://branyontech.com').replace(/\/$/, '');

const src = fs.readFileSync(path.join(HERE, '..', 'weather', 'js', 'lib', 'elsewhere.js'), 'utf8');
const X = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));

const stats = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'countdown', 'stats.json'), 'utf8'));
const PLACES = stats.trips.filter((t) => typeof t.lat === 'number' && typeof t.lon === 'number');

/* Where the visitor is, as far as the public API is concerned. */
const HOME = { name: 'Los Angeles', lat: 34.05, lon: -118.24 };

const fail = [];
const check = (name, ok, detail) => { if (!ok) fail.push(`${name} — ${detail}`); };

async function conditions(name, lat, lon) {
  const b = await (await fetch(`${ORIGIN}/weather/api/bundle?lat=${lat}&lon=${lon}`)).json();
  const d = b.forecast?.data;
  if (!d?.current) return null;
  const localHour = Number(String(d.current.time || '').slice(11, 13));
  return X.fromCurrent(name, d.current, d.current_units, {
    localHour: Number.isFinite(localHour) ? localHour : null,
  });
}

const here = await conditions(HOME.name, HOME.lat, HOME.lon);
if (!here) { console.error('no forecast for home'); process.exit(1); }

const there = [];
for (const p of PLACES) {
  const c = await conditions(p.place, p.lat, p.lon);
  if (c) there.push(c); else fail.push(`${p.place} — no current conditions`);
}

/* --- the rules must not have been handed the wrong units --- */
for (const c of [here, ...there]) {
  // Nowhere on Earth is habitable outside this, so anything outside it means
  // Fahrenheit reached a Celsius field — the failure that scores a pleasant
  // afternoon as unbearable while looking like a working ranking.
  check(`${c.name}: temperature is Celsius`, c.tempC > -60 && c.tempC < 55,
    `${c.tempC?.toFixed(1)}C — Fahrenheit in a Celsius field?`);
  check(`${c.name}: wind is km/h`, c.windKmh >= 0 && c.windKmh < 250, `${c.windKmh}`);
  check(`${c.name}: cloud is a percentage`,
    c.cloudPct === null || (c.cloudPct >= 0 && c.cloudPct <= 100), `${c.cloudPct}`);
}

/* --- the comfort curve is a curve, not a magnitude --- */
const at = (t) => X.comfort({ tempC: t, cloudPct: 0, precipMm: 0, windKmh: 0 });
check('warmer is not automatically better', at(39) < at(21), `39C scored ${at(39)}, 21C ${at(21)}`);
check('colder is not automatically better', at(-5) < at(21), `-5C scored ${at(-5)}, 21C ${at(21)}`);
check('the curve peaks at comfortable', at(21) >= at(15) && at(21) >= at(27),
  `${at(15)} / ${at(21)} / ${at(27)}`);
check('rain outranks cloud',
  X.comfort({ tempC: 21, precipMm: 2, cloudPct: 0, windKmh: 0 })
  < X.comfort({ tempC: 21, precipMm: 0, cloudPct: 100, windKmh: 0 }),
  'a soaking should cost more than an overcast');
/* Clamping only the sum is what made TONIGHT's clear nights all score 100. */
check('terms clamp individually',
  X.comfort({ tempC: 21, precipMm: 500, cloudPct: 0, windKmh: 0 }) > 0,
  'an absurd input should not drive the whole score negative');

/* --- the ranking --- */
const rows = X.rank(here, there);
check('every place ranks', rows.length === there.length, `${rows.length} of ${there.length}`);
check('the order is descending', rows.every((r, i) => i === 0 || rows[i - 1].score >= r.score),
  rows.map((r) => r.score).join(' '));
check('the order is stable', JSON.stringify(X.rank(here, there)) === JSON.stringify(rows),
  'the same inputs gave a different order twice');
check('the order is stable under shuffling',
  JSON.stringify(X.rank(here, [...there].reverse()).map((r) => r.name))
  === JSON.stringify(rows.map((r) => r.name)),
  'input order should not change the ranking');
for (const r of rows) {
  check(`${r.name}: better agrees with the score`,
    r.better === (r.score > X.comfort(here)), `better=${r.better} ${r.score} vs ${X.comfort(here)}`);
  check(`${r.name}: says something`, X.phrase(r).length > 0, 'empty phrase');
}

const v = X.verdict(HOME.name, rows);
check('the verdict is a sentence', typeof v === 'string' && v.length > 20 && v.endsWith('.'), v);
check('the verdict counts in plain English', !/\b1 [a-z ]*(others|hours)\b/.test(v), v);

console.log(`\n  ELSEWHERE — against ${HOME.name} (${X.comfort(here)}/100), from ${ORIGIN}\n`);
console.log(`    ${'place'.padEnd(30)} score  temp    what\n`);
for (const r of rows) {
  console.log(`    ${(r.better ? '↑ ' : '  ') + r.name.padEnd(28)}`
    + `${String(r.score).padStart(5)}  ${(Math.round(r.tempC) + 'C').padStart(5)}   ${X.phrase(r)}`);
}
console.log(`\n    here: ${here.name}, ${Math.round(here.tempC)}C, ${X.headline(here)}`);
console.log(`\n    verdict: ${v}`);

if (fail.length) {
  console.log(`\n  ${fail.length} FAILED`);
  for (const f of fail) console.log('   ', f);
  process.exit(1);
}
console.log(`\n  all checks pass — ${rows.length} places\n`);
