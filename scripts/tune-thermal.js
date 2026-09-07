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

const SEEDS = Number(process.env.THERMAL_SEEDS || 5);

/**
 * Fly one flight and measure what makes it a GAME, not just what it scores.
 *
 * Button transitions are debounced at half a wall second. Raw per-step counts
 * are meaningless: the policy is evaluated 120 times a second and a threshold
 * crossing chatters dozens of times, which reported 2666 inputs/min for a
 * decision structure a human would play at 75.
 */
function measure(world, policy) {
    const dt = T.FLY.DT;
    let s = T.createFlight(world);
    const gap = 0.5 * T.FLY.TIME_SCALE;
    let inputs = 0, lastHold = null, lastT = -99, lowT = 0, steps = 0, minAgl = Infinity;
    while (s.alive && steps < T.FLY.MAX_STEPS) {
        const hold = !!policy(s, s.wAir, world);
        if (lastHold === null) { lastHold = hold; lastT = s.t; }
        else if (hold !== lastHold && (s.t - lastT) >= gap) { inputs++; lastHold = hold; lastT = s.t; }
        const agl = s.h - T.terrain(world.seed, s.x);
        if (agl < 100) lowT += dt;
        if (agl < minAgl) minAgl = agl;
        s = T.step(world, Object.assign({}, s, { hold: hold }), dt);
        steps++;
    }
    const wall = s.t / T.FLY.TIME_SCALE;
    return {
        dist: T.scoreFlight(s).distance, wall: wall, landed: s.landed,
        ipm: wall > 0 ? inputs / wall * 60 : 0,
        lowFrac: s.t > 0 ? lowT / s.t : 0,
        minAgl: minAgl
    };
}

const rows = [];
for (const [name, lat, lon] of cities) {
    const bundle = JSON.parse(fs.readFileSync(path.join(WX, name.replace(/ /g, '_') + '.json'), 'utf8'));
    for (const hour of [9, 13, 17]) {
        const s = atLocalHour(bundle, lat, lon, hour);
        if (!s) continue;
        const cond = T.buildConditions(s.raw, s.sunAlt, 0);
        const out = {};
        // policyRelease is the TRUE no-input baseline - never touch the button.
        // policyHold pulls up forever, which now means stalling forever; it must
        // never win. policyGreedy is the NAIVE player: pull up whenever the air
        // rises, with no thought for airspeed or for the ground ahead.
        const pols = [['idle', T.policyRelease], ['hold', T.policyHold],
                      ['greedy', T.policyGreedy], ['bad', T.policyBad]];
        for (const [k, pol] of pols) {
            const ds = [];
            for (let d = 0; d < SEEDS; d++) ds.push(T.simulate(T.makeWorld(T.seedForDay(d), cond), pol, {}).score.distance);
            out[k] = med(ds);
        }
        // Speed-to-fly, swept. Which (mc, vFloor, margin) triple wins is itself
        // diagnostic: a low vFloor winning means the stall is too forgiving.
        let mcBest = 0, ipm = 0, landed = 0, dur = 0, low = 0, zero = 0, win = '', mag = 0;
        for (const mc of [0, 0.8, 1.8]) {
            for (const vf of [26, 31, 36]) {
                for (const mg of [50, 110, 200]) {
                    const ds = [], ip = [], la = [], du = [], lo = [], ma = [];
                    for (let d = 0; d < SEEDS; d++) {
                        const w = T.makeWorld(T.seedForDay(d), cond);
                        const r = measure(w, T.policyMacCready(mc, vf, mg));
                        ds.push(r.dist); ip.push(r.ipm); la.push(r.landed ? 1 : 0);
                        du.push(r.wall); lo.push(r.lowFrac); ma.push(r.minAgl);
                    }
                    const m = med(ds);
                    if (m > mcBest) {
                        mcBest = m; ipm = med(ip); dur = med(du); low = med(lo); mag = med(ma);
                        landed = la.reduce((a, b) => a + b, 0) / la.length;
                        zero = ip.filter(v => v === 0).length;
                        win = mc + '/' + vf + '/' + mg;
                    }
                }
            }
        }
        out.mc = mcBest; out.ipm = ipm; out.landed = landed; out.dur = dur;
        out.low = low; out.zero = zero; out.win = win; out.minAgl = mag;
        out.best = Math.max(out.mc, out.idle, out.hold, out.greedy);
        rows.push({
            name, hour, cloud: Math.round(s.raw.cloudLow),
            sun: Math.round(s.sunAlt * 180 / Math.PI), solar: cond.solar,
            base: Math.round(cond.cloudbase), wstar: cond.wStarEff,
            spacing: Math.round(cond.thermalSpacing), ...out
        });
    }
}

console.log('city          hr  base   w*  spac |  best  idle  hold greedy | skill inp/m  dur land  low  minAGL mc/vf/margin');
for (const r of rows) {
    const skill = r.idle > 0 ? (r.best / r.idle) : 0;
    console.log(
        r.name.padEnd(13), String(r.hour).padStart(2),
        String(r.base).padStart(5), r.wstar.toFixed(1).padStart(4), String(r.spacing).padStart(5),
        '|', (r.best / 1000).toFixed(1).padStart(5), (r.idle / 1000).toFixed(1).padStart(5),
        (r.hold / 1000).toFixed(1).padStart(5), (r.greedy / 1000).toFixed(1).padStart(5),
        '|', skill.toFixed(2).padStart(5), Math.round(r.ipm).toString().padStart(5),
        (Math.round(r.dur) + 's').padStart(5), Math.round(100 * r.landed) + '%',
        (Math.round(100 * r.low) + '%').padStart(4), (Math.round(r.minAgl) + 'm').padStart(5), r.win);
}

const active = rows.filter(r => r.solar > 0.3);
const M = {
    best: med(active.map(r => r.best)) / 1000,
    skill: med(active.map(r => r.idle > 0 ? r.best / r.idle : 0)),
    over125: active.filter(r => r.best / Math.max(1, r.idle) > 1.25).length,
    holdWins: active.filter(r => r.hold >= r.best).length,
    vHold: med(active.map(r => r.best / Math.max(1, r.hold))),
    vGreedy: med(active.map(r => r.best / Math.max(1, r.greedy))),
    ipm: med(active.map(r => r.ipm)),
    zero: active.reduce((a, r) => a + r.zero, 0),
    landed: med(active.map(r => r.landed)),
    dur: med(active.map(r => r.dur)),
    low: med(active.map(r => r.low)),
    minAgl: med(active.map(r => r.minAgl))
};
console.log('\ndaylight rows:', active.length, '| median best', M.best.toFixed(1) + ' km');

// The acceptance gates, as a check. Each names what it is defending against,
// because every one of them is a failure this game has actually shipped.
const GATES = [
    ['inputs/min (debounced)     ', M.ipm, v => v >= 30, '>= 30   there must be something to DO'],
    ['zero-input flights         ', M.zero, v => v === 0, '= 0     no flight should play itself'],
    ['best / hold-forever        ', M.vHold, v => v >= 2.0, '>= 2.0  holding must not be a strategy'],
    ['rows where hold wins       ', M.holdWins, v => v === 0, '= 0     not on ANY day'],
    ['best / never-touch-it      ', M.skill, v => v >= 1.8, '>= 1.8  input must beat no input'],
    ['rows with skill > 1.25     ', M.over125, v => v >= 0.7 * active.length, '>= 70%  on most days, not just good ones'],
    ['best / naive               ', M.vGreedy, v => v >= 1.4, '>= 1.4  knowing how must beat trying'],
    // How close a WELL-FLOWN flight actually comes to the ground. This, not
    // time-below-a-line, is the threat: on a booming day climbing away is
    // genuinely correct soaring, so a median time-low gate was measuring a
    // design wish rather than the game. Coming within a few tens of metres at
    // some point in every flight is the claim that matters.
    ['closest approach (m AGL)  ', M.minAgl, v => v <= 40, '<= 40m  every flight must actually scrape'],
    ['flight time below 100m AGL ', 100 * M.low, v => v >= 15, '>= 15%  and spend real time on the deck'],
    ['ends on the ground         ', 100 * M.landed, v => v >= 40 && v <= 70, '40-70%  the clock is not the only ending'],
    ['duration (wall seconds)    ', M.dur, v => v >= 120 && v <= 240, '120-240s'],
];
console.log('');
let failed = 0;
for (const [label, value, ok, why] of GATES) {
    const pass = ok(value);
    if (!pass) failed++;
    const shown = typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(2) : String(value);
    console.log(' ', pass ? 'PASS' : 'FAIL', label, shown.padStart(7), '  ' + why);
}
console.log('\n' + (failed ? failed + ' gate(s) failing' : 'all gates green'));
if (process.argv.includes('--fail-under') && failed) process.exit(1);
