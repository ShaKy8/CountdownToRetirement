/*
 * SLINGSHOT - pure rules.
 *
 * A daily orbital puzzle. You launch a probe from a pad and must reach a
 * beacon; between them sit bodies whose gravity bends the path, and the direct
 * line is always blocked, so every level has to be flown around something.
 * Score is the number of shots, exactly as ONE PUTT scores strokes.
 *
 * Nothing here touches the DOM, storage, the network or a zero-argument
 * `new Date()` - callers hand in "now". That is what makes the whole game
 * testable in Node, and it is asserted by a test.
 *
 * ---------------------------------------------------------------------------
 * Why this shape, written down because two previous games failed for reasons
 * this design exists to avoid:
 *
 *   THERMAL's outcome was a 175-second integral and averages are never
 *   surprising; measured, optimal play was 2.1 button presses per minute. Here
 *   a shot is a single irrevocable commit that resolves in about two seconds
 *   and either arrives or does not.
 *
 *   A demolition prototype needed rigid bodies that stack, bond and fracture,
 *   and that could not be made stable - a tower demolished itself with nobody
 *   touching it. There are NO CONTACTS here at all: one point mass, a fixed
 *   force field, and a circle to hit.
 * ---------------------------------------------------------------------------
 *
 * Determinism: every operation in the integrator is + - * / and sqrt, all
 * correctly rounded by IEEE-754 and identical across JS engines. Math.sin and
 * friends are NOT correctly rounded, so direction enters `fly` as a unit
 * vector rather than an angle and level coordinates snap to a half-unit grid.
 * Two people playing day 251 fly bit-identical trajectories.
 */
(function (root) {
    'use strict';

    // In the browser root.Daily is already set by the preceding <script>, so
    // the require() branch is never reached and `require` is never referenced.
    const Daily = (root && root.Daily) || require('../shared/daily.js');

    const SEED_PREFIX = 'slingshot';

    /*
     * Timescale.
     *
     * Trajectory SHAPE depends only on the ratio of speed to sqrt(GM), so
     * scaling every speed by k and G by k^2 leaves paths identical and flies
     * them k times faster. An earlier scale put a solved shot at a median 14.5 s
     * with the hard ones at 25-37 s, which is dead time you cannot influence.
     * These constants put a flight at about two seconds - the length of a ONE
     * PUTT roll.
     */
    const SIM = {
        DT: 1 / 120,
        G: 9.0,
        SOFT: 1.5,          // softening length, keeps 1/r^2 finite at the core
        MAX_T: 15,          // s before a shot is declared lost
        BOUND: 420,         // distance from origin beyond which it has escaped
        V_MIN: 18,
        V_MAX: 102
    };

    /*
     * MASS_SCALE is the most important number in this file.
     *
     * Deflection of a flyby is tan(theta/2) = GM / (b * v^2). At MASS_SCALE 1
     * that worked out to about one degree, and measured across 30 levels the
     * median path curved a total of 2 degrees - the probe flew straight past
     * every planet and the slingshot slung nothing. The game was "aim slightly
     * wide", which is not a game. At 70 the median path curves 41 degrees.
     *
     * Raising it trades drama against learnability: stronger gravity bends more
     * but is more chaotic, so fewer generated levels pass the smooth-gradient
     * test in validateLevel. That only costs generation retries.
     */
    const MASS_SCALE = 70;

    const WORLD = { w: 300, h: 170 };

    const clamp = Daily.clamp;

    // ------------------------------------------------------------------
    // Level generation
    // ------------------------------------------------------------------

    function range(r, lo, hi) { return lo + r() * (hi - lo); }

    /* Coordinates snap to a half-unit grid so a level is bit-identical
       everywhere, exactly as ONE PUTT does for its holes. */
    function snap(v) { return Math.round(v * 2) / 2; }

    function segmentHitsCircle(ax, ay, bx, by, cx, cy, r) {
        const dx = bx - ax, dy = by - ay;
        const len2 = dx * dx + dy * dy;
        let t = len2 > 0 ? ((cx - ax) * dx + (cy - ay) * dy) / len2 : 0;
        t = clamp(t, 0, 1);
        const px = ax + dx * t - cx, py = ay + dy * t - cy;
        return px * px + py * py <= r * r;
    }

    function buildLevel(seed) {
        const r = Daily.makeRng(seed);
        const launch = { x: 26, y: snap(range(r, 45, 125)) };
        const target = { x: WORLD.w - 26, y: snap(range(r, 45, 125)), r: 13 };
        const n = 1 + ((r() * 2.999) | 0);          // 1-3 bodies
        const planets = [];
        let guard = 0;
        while (planets.length < n && guard++ < 400) {
            const rad = snap(range(r, 9, 19));
            const p = {
                x: snap(range(r, 90, WORLD.w - 90)),
                y: snap(range(r, 30, WORLD.h - 30)),
                r: rad,
                m: snap(rad * rad * 1.15 * MASS_SCALE)
            };
            // Never swallow the pad or the beacon, and never overlap a sibling.
            if (Math.hypot(p.x - launch.x, p.y - launch.y) < p.r + 34) continue;
            if (Math.hypot(p.x - target.x, p.y - target.y) < p.r + 30) continue;
            let clash = false;
            for (let i = 0; i < planets.length; i++) {
                const q = planets[i];
                if (Math.hypot(p.x - q.x, p.y - q.y) < p.r + q.r + 16) clash = true;
            }
            if (clash) continue;
            planets.push(p);
        }
        const level = { seed: seed, launch: launch, target: target, planets: planets };
        level.blocked = planets.some(function (p) {
            return segmentHitsCircle(launch.x, launch.y, target.x, target.y, p.x, p.y, p.r + 3);
        });
        return level;
    }

    /**
     * Reject levels that are not worth playing.
     *
     * Same idea as ONE PUTT's validateHole, doing more work because two
     * different things can go wrong with a gravity puzzle:
     *
     *   1. No solution at all.
     *   2. A solution you cannot LEARN. Measured across 40 seeds, about half of
     *      all levels have a flat error surface: miss by one degree and you land
     *      150 units away, miss by five and you land 153 away. The number never
     *      tells you which way to correct, because a near miss on a close
     *      gravity assist throws you somewhere else entirely. ONE PUTT's error
     *      surface is the opposite - 1 degree still sinks, 2 leaves a tap-in,
     *      5 leaves a longer one - and that gradient is what teaches.
     *
     * Costs about 19 ms, so it runs at page load rather than being baked in.
     */
    function validateLevel(lv) {
        const base = Math.atan2(lv.target.y - lv.launch.y, lv.target.x - lv.launch.x);
        const sols = [];
        for (let off = -70; off <= 70; off += 2) {
            const a = base + off * Math.PI / 180;
            const dx = Math.cos(a), dy = Math.sin(a);
            for (let v = SIM.V_MIN; v <= SIM.V_MAX; v += 6) {
                if (fly(lv, dx, dy, v, { dt: 1 / 60 }).outcome === 'hit') {
                    sols.push({ a: a, v: v });
                }
            }
        }
        if (!sols.length) return null;

        // Judge the FASTEST arrival: it is the one a player is most likely to
        // stumble into, so its neighbourhood is what difficulty really means.
        let best = null, bestT = Infinity;
        for (let i = 0; i < sols.length; i++) {
            const t = fly(lv, Math.cos(sols[i].a), Math.sin(sols[i].a), sols[i].v, {}).t;
            if (t < bestT) { bestT = t; best = sols[i]; }
        }
        const shot = function (da) {
            const a = best.a + da * Math.PI / 180;
            return fly(lv, Math.cos(a), Math.sin(a), best.v, { dt: 1 / 120 });
        };
        let lo = 0, hi = 0;
        for (let d = 0.1; d < 10; d += 0.1) { if (shot(-d).outcome === 'hit') lo = d; else break; }
        for (let d = 0.1; d < 10; d += 0.1) { if (shot(d).outcome === 'hit') hi = d; else break; }
        const win = lo + hi;
        const m1 = shot(1).near, m10 = shot(10).near;
        const smooth = m1 < 40 && m10 > m1 * 1.4;
        return {
            ok: win >= 1.2 && smooth && bestT <= 9,
            rank: (smooth ? 100 : 0) + win,
            win: win, smooth: smooth, t: bestT,
            a: best.a, v: best.v, count: sols.length
        };
    }

    /**
     * Par, from the width of the aim window.
     *
     * A real measurement rather than a guess: a level whose correct aim spans
     * four degrees is genuinely easier to find than one spanning one and a half.
     */
    function parFor(solution) {
        if (!solution) return 3;
        // Thresholds are the measured terciles of the aim window over 60 days
        // (1.20 / 1.40 / 1.60 / 1.80 / 3.90), so par lands in even thirds
        // instead of dumping 24 of 40 levels into the hardest bucket.
        if (solution.win >= 1.8) return 2;
        if (solution.win >= 1.4) return 3;
        return 4;
    }

    /**
     * The day's level. Retries, mixing the seed, until validateLevel is happy;
     * a level that never validates falls back to the best one seen, which is
     * still solvable - the game must never be unplayable.
     */
    function makeLevel(seed) {
        let fallback = null, fbRank = -1;
        for (let k = 0; k < 14; k++) {
            const lv = buildLevel((Math.imul(seed, 2654435761) + k * 40503) >>> 0);
            if (!lv.blocked) continue;
            const v = validateLevel(lv);
            if (!v) continue;
            lv.solution = v;
            lv.par = parFor(v);
            if (v.ok) { lv.seed = seed; lv.tries = k + 1; return lv; }
            if (v.rank > fbRank) { fbRank = v.rank; fallback = lv; }
        }
        const lv = fallback || buildLevel(seed >>> 0);
        if (!lv.solution) { lv.solution = validateLevel(lv); lv.par = parFor(lv.solution); }
        lv.seed = seed;
        return lv;
    }

    // ------------------------------------------------------------------
    // Flight
    // ------------------------------------------------------------------

    /** Gravitational acceleration at a point, from every body. */
    function accel(level, x, y, out) {
        let ax = 0, ay = 0;
        for (let i = 0; i < level.planets.length; i++) {
            const p = level.planets[i];
            const dx = p.x - x, dy = p.y - y;
            const d2 = dx * dx + dy * dy + SIM.SOFT * SIM.SOFT;
            const f = SIM.G * p.m / (d2 * Math.sqrt(d2));
            ax += dx * f; ay += dy * f;
        }
        out[0] = ax; out[1] = ay;
    }

    /**
     * Fly one shot to its conclusion.
     *
     * Velocity Verlet: symplectic, second order, and built only from + - * /
     * and sqrt. `dirX/dirY` is a UNIT vector - keeping Math.cos out of the rules
     * is what makes the trajectory bit-identical on every engine.
     *
     * Returns one of four outcomes, and `near`, the closest the probe ever came
     * to the beacon. That number is the feedback the whole design rests on: it
     * is what lets a player say "I was 40 out, now I am 12 out".
     */
    function fly(level, dirX, dirY, speed, opts) {
        const o = opts || {};
        const dt = o.dt || SIM.DT;
        const path = o.path ? [] : null;
        let x = level.launch.x, y = level.launch.y;
        let vx = dirX * speed, vy = dirY * speed;
        const a = [0, 0], a2 = [0, 0];
        accel(level, x, y, a);
        let t = 0, steps = 0, near = Infinity;
        const maxSteps = Math.ceil(SIM.MAX_T / dt);

        while (steps++ < maxSteps) {
            x += vx * dt + 0.5 * a[0] * dt * dt;
            y += vy * dt + 0.5 * a[1] * dt * dt;
            accel(level, x, y, a2);
            vx += 0.5 * (a[0] + a2[0]) * dt;
            vy += 0.5 * (a[1] + a2[1]) * dt;
            a[0] = a2[0]; a[1] = a2[1];
            t += dt;
            if (path && steps % 3 === 0) { path.push(x, y); }

            const tdx = x - level.target.x, tdy = y - level.target.y;
            const td = Math.sqrt(tdx * tdx + tdy * tdy);
            if (td < near) near = td;
            if (td < level.target.r) {
                if (path) path.push(x, y);
                return { outcome: 'hit', t: t, x: x, y: y, near: 0, path: path };
            }
            for (let i = 0; i < level.planets.length; i++) {
                const p = level.planets[i];
                const dx = x - p.x, dy = y - p.y;
                if (dx * dx + dy * dy < p.r * p.r) {
                    return { outcome: 'crash', t: t, x: x, y: y, near: near, path: path, body: i };
                }
            }
            if (x * x + y * y > SIM.BOUND * SIM.BOUND) {
                return { outcome: 'lost', t: t, x: x, y: y, near: near, path: path };
            }
        }
        return { outcome: 'timeout', t: t, x: x, y: y, near: near, path: path };
    }

    // ------------------------------------------------------------------
    // Scoring and sharing
    // ------------------------------------------------------------------

    const NEAR_MISS = 30;

    /*
     * One glyph per shot, so the share string reads as a story rather than a
     * number. This is the single most portable idea in ONE PUTT, whose
     * "green, sand, water, green, in" says what the round felt like.
     *
     * Each shot is one of four outcomes, which is exactly two bits - so a whole
     * round packs into a single integer and survives a reload through the
     * existing `int` field kind. Without that, revisiting the page after you had
     * played showed a score with no share card and no way to get one back.
     */
    const SHOT = { CRASH: 0, LOST: 1, NEAR: 2, HIT: 3 };
    const SHOT_GLYPH = ['🟥', '🟦', '🟨', '🎯'];
    const PACK_MAX = 12;                  // the share truncates here anyway

    function shotCode(outcome, near) {
        if (outcome === 'hit') return SHOT.HIT;
        if (outcome === 'crash') return SHOT.CRASH;
        return (near !== undefined && near < NEAR_MISS) ? SHOT.NEAR : SHOT.LOST;
    }

    function glyphForCode(code) { return SHOT_GLYPH[code] || SHOT_GLYPH[SHOT.LOST]; }
    function glyphFor(outcome, near) { return glyphForCode(shotCode(outcome, near)); }

    /** Base-4, least significant shot first. Zero means "nothing recorded". */
    function packShots(codes) {
        let v = 0;
        for (let i = Math.min(codes.length, PACK_MAX) - 1; i >= 0; i--) {
            v = v * 4 + (codes[i] & 3);
        }
        return v;
    }

    function unpackShots(packed, n) {
        const out = [];
        let v = Math.max(0, Math.floor(packed) || 0);
        for (let i = 0; i < Math.min(n, PACK_MAX); i++) {
            out.push(v % 4);
            v = Math.floor(v / 4);
        }
        return out;
    }

    /**
     * Rebuild a round's glyphs from a stored day.
     *
     * A real round always ends in an arrival, whose code is 3, so a packed
     * value of 0 cannot be a genuine round - it means the day was recorded
     * before outcomes were stored. Those fall back to an approximation, which
     * is what ONE PUTT does for the same situation, rather than inventing a
     * detailed story that never happened.
     */
    function cellsFromDay(d) {
        if (!d || !d.shots) return [];
        if (d.outcomes) {
            return unpackShots(d.outcomes, d.shots).map(glyphForCode);
        }
        const n = Math.min(d.shots, PACK_MAX);
        const out = new Array(Math.max(0, n - 1)).fill(SHOT_GLYPH[SHOT.LOST]);
        out.push(SHOT_GLYPH[SHOT.HIT]);
        return out;
    }

    function scoreLabel(shots, par) {
        if (shots === 1) return 'BULLSEYE';
        if (shots <= par - 1) return 'UNDER PAR';
        if (shots === par) return 'ON PAR';
        if (shots === par + 1) return 'ONE OVER';
        return 'LONG WAY ROUND';
    }

    function scoreEmoji(shots, par) {
        if (shots === 1) return '🏆';
        if (shots <= par - 1) return '⭐';
        if (shots === par) return '🟢';
        if (shots === par + 1) return '🟡';
        return '🔴';
    }

    function buildShare(o) {
        const rel = o.shots - o.par;
        const relStr = rel === 0 ? 'E' : (rel > 0 ? '+' + rel : String(rel));
        const cells = o.cells.length > 12
            ? o.cells.slice(0, 12).join('') + '…'
            : o.cells.join('');
        const lines = [
            'SLINGSHOT #' + o.day + ' — ' + o.shots + ' (' + relStr + ')',
            cells,
            o.bodies + (o.bodies === 1 ? ' body' : ' bodies') + ' · par ' + o.par
        ];
        if (o.streak > 1) lines.push('Streak ' + o.streak);
        lines.push('branyontech.com/slingshot/');
        return lines.join('\n');
    }

    /** An ASCII dump of a level. Used by the tests and for headless debugging. */
    function levelToAscii(level, path, cols, rows) {
        const w = cols || 74, h = rows || 20;
        const grid = [];
        for (let y = 0; y < h; y++) grid.push(new Array(w).fill(' '));
        const cx = function (x) { return clamp(Math.round(x / WORLD.w * (w - 1)), 0, w - 1); };
        const cy = function (y) { return clamp(Math.round(y / WORLD.h * (h - 1)), 0, h - 1); };
        for (let i = 0; i < level.planets.length; i++) {
            const p = level.planets[i];
            for (let a = 0; a < 64; a++) {
                const th = a / 64 * Math.PI * 2;
                grid[cy(p.y + Math.sin(th) * p.r)][cx(p.x + Math.cos(th) * p.r)] = 'O';
            }
        }
        if (path) {
            for (let i = 0; i + 1 < path.length; i += 2) {
                const gx = cx(path[i]), gy = cy(path[i + 1]);
                if (grid[gy][gx] === ' ') grid[gy][gx] = '.';
            }
        }
        grid[cy(level.launch.y)][cx(level.launch.x)] = 'A';
        grid[cy(level.target.y)][cx(level.target.x)] = 'X';
        return grid.map(function (r) { return r.join(''); }).join('\n');
    }

    // ------------------------------------------------------------------
    // Saved state
    // ------------------------------------------------------------------

    const STORAGE_KEY = 'slingshot.v1';

    const store = Daily.makeStore({
        version: 1,
        counters: { played: 0, bullseyes: 0 },
        dayFields: {
            shots: { kind: 'int', min: 1, required: true },
            par: { kind: 'int', required: true },
            bodies: { kind: 'int', default: 1 },
            // The round's shots, packed two bits each, so the share card can be
            // rebuilt when you come back to a day you have already played.
            outcomes: { kind: 'int', default: 0 }
        },
        settings: {
            sound: { kind: 'bool', default: false }
        },
        bump: function (state, result) {
            return {
                played: state.played + 1,
                bullseyes: state.bullseyes + (result.shots === 1 ? 1 : 0)
            };
        },
        maxDays: 30
    });

    const api = {
        SIM: SIM,
        WORLD: WORLD,
        MASS_SCALE: MASS_SCALE,
        NEAR_MISS: NEAR_MISS,
        SEED_PREFIX: SEED_PREFIX,
        STORAGE_KEY: STORAGE_KEY,

        puzzleDay: Daily.puzzleDay,
        msUntilNextPuzzle: Daily.msUntilNextPuzzle,
        seedForDay: function (day) { return Daily.seedForDay(SEED_PREFIX, day); },

        buildLevel: buildLevel,
        validateLevel: validateLevel,
        makeLevel: makeLevel,
        parFor: parFor,
        segmentHitsCircle: segmentHitsCircle,
        snap: snap,

        fly: fly,
        accel: accel,

        SHOT: SHOT,
        PACK_MAX: PACK_MAX,
        glyphFor: glyphFor,
        glyphForCode: glyphForCode,
        shotCode: shotCode,
        packShots: packShots,
        unpackShots: unpackShots,
        cellsFromDay: cellsFromDay,
        scoreLabel: scoreLabel,
        scoreEmoji: scoreEmoji,
        buildShare: buildShare,
        levelToAscii: levelToAscii,

        emptyState: store.emptyState,
        parseState: store.parseState,
        serializeState: store.serializeState,
        recordDaily: store.recordDaily
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.Slingshot = api;
    }
})(typeof window !== 'undefined' ? window : null);
