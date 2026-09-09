/*
 * TONIGHT's rules, against real forecasts.
 *
 * weather/js/lib/tonight.js is pure — no DOM, no network, no zero-argument
 * `new Date()` — so unlike the console's views it can be run and checked
 * directly. What it cannot be is `require()`d: package.json has no
 * `"type": "module"`, so Node reads a `.js` file as CommonJS and chokes on
 * `export`. Both modules are self-contained, so they load here from a data:
 * URL instead of being given a build step or a compatibility shim.
 *
 * The invariants are the ones a wrong answer would break, plus one
 * regression: scores that all saturate at 100. The first version clamped only
 * the sum, so every night with a four-hour clear run scored full marks and
 * five consecutive clear nights ranked identically — which is exactly the
 * question the feature exists to answer.
 *
 *   node scripts/tonight-check.mjs                    # against production's API
 *   node scripts/tonight-check.mjs http://localhost:8000
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ORIGIN = (process.argv[2] || 'https://branyontech.com').replace(/\/$/, '');
const HOUR = 3600e3;

const loadModule = async (rel) => {
  const src = fs.readFileSync(path.join(HERE, '..', rel), 'utf8');
  return import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
};

const A = await loadModule('weather/js/lib/astro.js');
const T = await loadModule('weather/js/lib/tonight.js');

/* A spread that exercises the branches: mid-latitude north, high north where
 * astronomical darkness runs out, and the southern hemisphere for sign errors. */
const PLACES = [
  ['Los Angeles', 34.05, -118.24],
  ['Reykjavik', 64.15, -21.94],
  ['Tromso', 69.65, 18.96],
  ['Sydney', -33.87, 151.21],
  ['Singapore', 1.35, 103.82],
];

const fail = [];
const check = (place, name, ok, detail) => { if (!ok) fail.push(`${place}: ${name} — ${detail}`); };
const allScores = [];

for (const [name, lat, lon] of PLACES) {
  let bundle;
  try {
    bundle = await (await fetch(`${ORIGIN}/weather/api/bundle?lat=${lat}&lon=${lon}`)).json();
  } catch (e) {
    fail.push(`${name}: could not fetch a forecast — ${e.message}`);
    continue;
  }
  const H = bundle.forecast?.data?.hourly;
  if (!H?.time) { fail.push(`${name}: bundle had no hourly series`); continue; }

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

  check(name, 'a week of nights', nights.length === T.NIGHTS, `got ${nights.length}`);

  const dark = nights.filter((n) => n.dark);
  // Every inhabited latitude has *some* usable darkness in every season, even
  // if it is only civil twilight; getting none back means the fallback chain
  // from astronomical to nautical to civil is broken.
  check(name, 'darkness resolves', dark.length === nights.length,
    `${nights.length - dark.length} of ${nights.length} nights found none`);

  for (const n of nights) {
    const w = tf.weekday(n.day);
    if (!n.dark) continue;
    check(name, `${w} dark window ordered`, n.dark.to > n.dark.from,
      `${tf.hm(n.dark.from)}–${tf.hm(n.dark.to)}`);
    check(name, `${w} dark window plausible`, n.dark.hours > 0 && n.dark.hours < 20,
      `${n.dark.hours.toFixed(1)}h`);
    check(name, `${w} score in range`, n.score >= 0 && n.score <= 100, String(n.score));
    check(name, `${w} good <= clear <= sampled`,
      n.goodHours <= n.clearHours && n.clearHours <= n.samples.length,
      `${n.goodHours}/${n.clearHours}/${n.samples.length}`);
    for (const s of n.samples) {
      check(name, `${w} samples inside the dark window`,
        s.t >= n.dark.from - HOUR && s.t <= n.dark.to + HOUR, tf.hm(s.t));
    }
    if (n.best) {
      check(name, `${w} best window inside the dark window`,
        n.best.from >= n.dark.from - HOUR && n.best.to <= n.dark.to + HOUR,
        `${tf.hm(n.best.from)}–${tf.hm(n.best.to)}`);
      check(name, `${w} best window has length`, n.best.to > n.best.from, 'zero');
      check(name, `${w} a best window implies good hours`, n.goodHours > 0, '0 good hours');
    }
    allScores.push(n.score);
  }

  const v = T.verdict(nights, tf);
  check(name, 'verdict is a sentence', typeof v === 'string' && v.length > 20 && v.endsWith('.'), JSON.stringify(v));
  // Whenever tonight has a real window, the verdict must say when it is.
  if (nights[0]?.best && nights[0].best.to - nights[0].best.from >= 2 * HOUR) {
    check(name, 'verdict names the window', v.includes(tf.hm(nights[0].best.from)), v);
  }

  const worst = nights.reduce((a, b) => (b.score < a.score ? b : a));
  const bestN = nights.reduce((a, b) => (b.score > a.score ? b : a));
  console.log(`\n  ${name}`);
  console.log('    night  dark          good clear  cloud  moon  best window      score');
  for (const n of nights) {
    if (!n.dark) { console.log(`    ${tf.weekday(n.day)}    no darkness`); continue; }
    const w = n.best ? `${tf.hm(n.best.from)}-${tf.hm(n.best.to)}` : '-';
    console.log(`    ${tf.weekday(n.day)}    ${tf.hm(n.dark.from)}-${tf.hm(n.dark.to)}`
      + `${String(n.goodHours).padStart(6)}${String(n.clearHours).padStart(6)}`
      + `${(n.cloudMean == null ? '-' : Math.round(n.cloudMean) + '%').padStart(7)}`
      + `${(Math.round(n.moonLit * 100) + '%').padStart(6)}  ${w.padEnd(15)}${String(n.score).padStart(5)}`);
  }
  console.log(`    spread ${worst.score}–${bestN.score}`);
  console.log(`    verdict: ${v}`);
}

/*
 * The regression that mattered: with only the sum clamped, any night with a
 * four-hour clear run scored 100 and a run of good nights was unrankable.
 */
const distinct = new Set(allScores).size;
check('overall', 'scores discriminate', distinct >= 6,
  `only ${distinct} distinct values across ${allScores.length} nights`);
check('overall', 'not everything is perfect', allScores.filter((s) => s === 100).length < allScores.length * 0.6,
  `${allScores.filter((s) => s === 100).length} of ${allScores.length} nights scored 100`);

console.log('');
if (fail.length) {
  for (const f of fail.slice(0, 20)) console.log('  FAIL ' + f);
  console.log(`\n  ${fail.length} check(s) failing\n`);
  process.exit(1);
}
console.log(`  all checks pass — ${allScores.length} nights across ${PLACES.length} places, `
  + `${distinct} distinct scores\n`);
