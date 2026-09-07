/**
 * Tune THERMAL against weather that actually happened.
 *
 * The first tuning pass used invented conditions - cape 1200, tempF 80, dewF 50
 * - and produced a game that looked excellent in simulation and was dead on
 * arrival. Against ten live forecasts, flying perfectly scored the same as
 * doing nothing in 27 of 30 conditions. This is the harness that found that,
 * and it should be re-run before changing any of the weather constants.
 *
 *   node scripts/fetch-wx.sh      # cache bundles for ten cities
 *   node scripts/tune-thermal.js  # sweep them
 *
 * Reads cached bundles from the directory in WX below so a sweep costs no
 * network and is repeatable.
 */
const fs = require('fs'), path = require('path');
const T = require('../thermal/flight.js');
const A = require('../thermal/astro.js');
const WX = process.env.THERMAL_WX || path.join(__dirname, '..', '.wx-cache');
const cities = JSON.parse(fs.readFileSync(path.join(WX, 'cities.json'), 'utf8'));

// Local mid-morning / midday / late afternoon at each place, sampled from the
// bundle's own hourly series so the conditions match the hour.
function atLocalHour(bundle, lat, lon, hour) {
    const off = bundle.forecast.data.utc_offset_seconds;
    const now = new Date();
    const localMidnightUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - off * 1000;
    const when = new Date(localMidnightUTC + hour * 3600000);
    const raw = T.extractConditions(bundle, when);
    if (!raw) return null;
    return { raw, when, sunAlt: A.sunPosition(when, lat, lon).altitude };
}

function med(a) { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; }

const rows = [];
for (const [name, lat, lon] of cities) {
    const bundle = JSON.parse(fs.readFileSync(path.join(WX, name.replace(/ /g, '_') + '.json'), 'utf8'));
    for (const hour of [9, 13, 17]) {
        const s = atLocalHour(bundle, lat, lon, hour);
        if (!s) continue;
        const cond = T.buildConditions(s.raw, s.sunAlt, 0);
        const out = {};
        // "good" is MacCready-zero: slow in anything rising. On a strong day
        // the right cruise speed rises, so a fixed threshold stops being
        // optimal - which is a skill gradient, not a bug. Measure the BEST
        // available policy against doing nothing.
        const pols = [['good', T.policyGood], ['bad', T.policyBad], ['idle', T.policyRelease],
                      ['fast', T.policyHold], ['ridge', null]];
        for (const [k, pol] of pols) {
            const ds = [];
            for (let d = 0; d < 12; d++) {
                const w = T.makeWorld(T.seedForDay(d), cond);
                ds.push(T.simulate(w, pol || T.policyRidge(w), {}).score.distance);
            }
            out[k] = med(ds);
        }
        out.best = Math.max(out.good, out.bad, out.fast, out.ridge);
        rows.push({
            name, hour, cape: Math.round(s.raw.cape), cloud: Math.round(s.raw.cloudLow),
            sun: Math.round(s.sunAlt * 180 / Math.PI), solar: cond.solar,
            base: Math.round(cond.cloudbase), wstar: cond.wStarEff,
            spacing: Math.round(cond.thermalSpacing), ...out
        });
    }
}

console.log('city          hr  CAPE cld sun° solar base  w*   spac | good   bad  idle ridge  best | skill');
for (const r of rows) {
    const skill = r.idle > 0 ? (r.best / r.idle) : 0;
    console.log(
        r.name.padEnd(13), String(r.hour).padStart(2),
        String(r.cape).padStart(5), String(r.cloud).padStart(3),
        String(r.sun).padStart(4), (r.solar * 100).toFixed(0).padStart(4) + '%',
        String(r.base).padStart(5), r.wstar.toFixed(1).padStart(4), String(r.spacing).padStart(5),
        '|', (r.good / 1000).toFixed(1).padStart(5), (r.bad / 1000).toFixed(1).padStart(5),
        (r.idle / 1000).toFixed(1).padStart(5),
        (r.ridge / 1000).toFixed(1).padStart(5),
        (r.best / 1000).toFixed(1).padStart(5), '|', skill.toFixed(2));
}
const active = rows.filter(r => r.solar > 0.3);
console.log('\ndaylight rows:', active.length,
    '| median good', (med(active.map(r => r.good)) / 1000).toFixed(1) + ' km',
    '| median best', (med(active.map(r => r.best)) / 1000).toFixed(1) + ' km',
    '| median skill (best/idle)', med(active.map(r => r.best / r.idle)).toFixed(2));
const alive = active.filter(r => r.best / r.idle > 1.08);
console.log('rows with a real game in them:', alive.length, 'of', active.length,
    '(' + Math.round(100 * alive.length / active.length) + '%)');
