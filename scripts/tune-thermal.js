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
        // policyRelease is the TRUE no-input baseline - never touch the button.
        // policyGreedy is the NAIVE player: circle in anything that rises, which
        // finds a stable equilibrium at the top of a column and goes nowhere.
        // best is the MacCready grid, because "leave near the top" cannot be
        // expressed by a climb threshold alone.
        const pols = [['idle', T.policyRelease], ['hold', T.policyHold],
                      ['greedy', T.policyGreedy], ['bad', T.policyBad]];
        for (const [k, pol] of pols) {
            const ds = [];
            for (let d = 0; d < 12; d++) ds.push(T.simulate(T.makeWorld(T.seedForDay(d), cond), pol, {}).score.distance);
            out[k] = med(ds);
        }
        let mcBest = 0, circFrac = 0, landed = 0, dur = 0;
        for (const mc of [0.3, 0.7, 1.2, 2, 3]) {
            for (const cf of [0.5, 0.7, 0.9, 1.2]) {
                const ds = [], cf2 = [], la = [], du = [];
                for (let d = 0; d < 12; d++) {
                    const w = T.makeWorld(T.seedForDay(d), cond);
                    const r = T.simulate(w, T.policyMacCready(mc, cf), { trace: true });
                    ds.push(r.score.distance);
                    cf2.push(r.trace.filter(t => t.w > t.wAir - 1.0).length / Math.max(1, r.trace.length));
                    la.push(r.state.landed ? 1 : 0);
                    du.push(r.state.t / T.FLY.TIME_SCALE);
                }
                const m = med(ds);
                if (m > mcBest) { mcBest = m; circFrac = med(cf2); landed = la.reduce((a, b) => a + b, 0) / la.length; dur = med(du); }
            }
        }
        out.mc = mcBest; out.circ = circFrac; out.landed = landed; out.dur = dur;
        out.best = Math.max(out.mc, out.idle, out.hold, out.greedy);
        rows.push({
            name, hour, cape: Math.round(s.raw.cape), cloud: Math.round(s.raw.cloudLow),
            sun: Math.round(s.sunAlt * 180 / Math.PI), solar: cond.solar,
            base: Math.round(cond.cloudbase), wstar: cond.wStarEff,
            spacing: Math.round(cond.thermalSpacing), ...out
        });
    }
}

console.log('city          hr  base   w*  spac |  best  idle  hold greedy | skill  dur land');
for (const r of rows) {
    const skill = r.idle > 0 ? (r.best / r.idle) : 0;
    console.log(
        r.name.padEnd(13), String(r.hour).padStart(2),
        String(r.base).padStart(5), r.wstar.toFixed(1).padStart(4), String(r.spacing).padStart(5),
        '|', (r.best / 1000).toFixed(1).padStart(5), (r.idle / 1000).toFixed(1).padStart(5),
        (r.hold / 1000).toFixed(1).padStart(5), (r.greedy / 1000).toFixed(1).padStart(5),
        '|', skill.toFixed(2).padStart(5), Math.round(r.dur) + 's', Math.round(100 * r.landed) + '%');
}

const active = rows.filter(r => r.solar > 0.3);
const ratio = a => med(active.map(r => r.idle > 0 ? r.best / r.idle : 0));
console.log('\ndaylight rows:', active.length,
    '| median best', (med(active.map(r => r.best)) / 1000).toFixed(1) + ' km',
    '| median skill (best/idle)', ratio().toFixed(2));
console.log('rows where skill > 1.25:', active.filter(r => r.best / r.idle > 1.25).length, 'of', active.length);
console.log('hold ever wins:', active.filter(r => r.hold >= r.best).length, 'rows   (must be 0)');
console.log('median best/hold:', med(active.map(r => r.best / Math.max(1, r.hold))).toFixed(1),
    '| median best/greedy:', med(active.map(r => r.best / Math.max(1, r.greedy))).toFixed(2));
console.log('median circling fraction:', (100 * med(active.map(r => r.circ))).toFixed(0) + '%',
    '| landing rate:', (100 * med(active.map(r => r.landed))).toFixed(0) + '%',
    '| median duration:', Math.round(med(active.map(r => r.dur))) + 's');
