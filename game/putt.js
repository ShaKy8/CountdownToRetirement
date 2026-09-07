/**
 * ONE PUTT - pure game logic.
 *
 * Deterministic and DOM-free, in the same shape as countdown/calc.js: a classic
 * script (not an ES module) wrapped in an IIFE that attaches a global for the
 * page and exports for Node, so tests.js can require() the exact code the
 * browser runs.
 *
 * Nothing in here touches document, localStorage, fetch, or a zero-argument
 * `new Date()`. Every function that needs "now" is handed it. That is what
 * makes the hole of the day reproducible in a test.
 */
(function (root) {
    'use strict';

    // In the browser root.Daily is already set by the preceding <script>, so
    // the require() branch is never reached and `require` is never referenced.
    const Daily = (root && root.Daily) || require('../shared/daily.js');

    // Names ONE PUTT has always used, now backed by the shared module. The
    // wind helpers stay bound to SIM.WIND_MAX_MPH so the public arity here is
    // unchanged - callers and 231 tests do not know anything moved.
    const clamp = Daily.clamp;
    const hashSeed = Daily.hashSeed;
    const makeRng = Daily.makeRng;
    const rngInt = Daily.rngInt;
    const rngRange = Daily.rngRange;
    const mixSeed = Daily.mixSeed;
    const puzzleDay = Daily.puzzleDay;
    const puzzleDateKey = Daily.puzzleDateKey;
    const msUntilNextPuzzle = Daily.msUntilNextPuzzle;
    const compassFromDegrees = Daily.compassFromDegrees;
    const formatWind = Daily.formatWind;
    const COMPASS = Daily.COMPASS;
    const EPOCH_UTC_MS = Daily.EPOCH_UTC_MS;
    const DAY_MS = Daily.DAY_MS;
    const syntheticWind = Daily.syntheticWind;

    function seedForDay(day) { return Daily.seedForDay('oneputt', day); }
    function clampWind(spec) { return Daily.clampWind(spec, SIM.WIND_MAX_MPH); }
    function extractWind(bundle, now) { return Daily.extractWind(bundle, now, SIM.WIND_MAX_MPH); }
    function resolveWind(bundle, now, seed) {
        return Daily.resolveWind(bundle, now, seed, SIM.WIND_MAX_MPH);
    }

    // Every generated coordinate lands on a half-unit grid. The simulation does
    // not need to be bit-identical across browsers (the score is a stroke count
    // and the wind differs per player anyway) but the HOLE does, and
    // Math.sin/cos/pow are not guaranteed identical across JS engines. So the
    // geometry uses only add/multiply/round, and a test asserts the grid.
    function snap(v) {
        return Math.round(v * 2) / 2;
    }

    // ------------------------------------------------------------------
    // Field and simulation constants
    // ------------------------------------------------------------------

    // A logical field in *units*, never pixels. The renderer scales.
    const FIELD = { w: 100, h: 160, wall: 2, margin: 6 };

    const SIM = {
        DT: 1 / 120,
        BALL_R: 1.1,
        CUP_R: 2.2,
        MAX_SPEED: 88,
        RESTITUTION: 0.72,
        DECEL: 22,
        MU: { green: 1.0, fringe: 1.7, sand: 2.6, water: 1.0 },
        DRAG_K: 0.04,
        WIND_GAIN: 0.55,
        WIND_MAX_MPH: 45,
        GUST_PERIOD: 4.7,
        CAPTURE_SPEED: 26,
        MAX_STEPS: 4000,
        MIN_SEPARATION: 60,
        MIN_GAP: 6,
        LATTICE: 2
    };

    function borderWalls() {
        const t = FIELD.wall;
        return [
            { x: 0, y: 0, w: FIELD.w, h: t },
            { x: 0, y: FIELD.h - t, w: FIELD.w, h: t },
            { x: 0, y: 0, w: t, h: FIELD.h },
            { x: FIELD.w - t, y: 0, w: t, h: FIELD.h }
        ];
    }

    // ------------------------------------------------------------------
    // Hole archetypes
    //
    // Deliberately NOT free-form random geometry. Each archetype is a
    // hand-authored shape with parameters drawn from narrow ranges, so the
    // space of possible holes is bounded by construction and validateHole is a
    // backstop rather than the only line of defence.
    // ------------------------------------------------------------------

    const TEE_Y = 142;
    const CUP_Y = 24;

    // Tee and cup jitter vertically as well as horizontally, so a hundred
    // consecutive days do not all put the cup on the same line.
    function teeY(rng) { return rngRange(rng, TEE_Y - 8, TEE_Y + 4, 0.5); }
    function cupY(rng) { return rngRange(rng, CUP_Y - 6, CUP_Y + 10, 0.5); }

    const ARCHETYPES = [
        {
            name: 'straight-lane-with-pillar',
            build: function (rng) {
                const w = rngRange(rng, 16, 28, 0.5);
                const y = rngRange(rng, 70, 90, 0.5);
                return {
                    tee: { x: rngRange(rng, 30, 70, 0.5), y: teeY(rng) },
                    cup: { x: rngRange(rng, 30, 70, 0.5), y: cupY(rng) },
                    walls: [{ x: snap(50 - w / 2), y: y, w: w, h: 5 }],
                    hazards: []
                };
            }
        },
        {
            name: 'dogleg',
            build: function (rng) {
                const w = rngRange(rng, 55, 70, 0.5);
                const y = rngRange(rng, 76, 92, 0.5);
                const flip = rng() < 0.5;
                // A shelf off one wall; the ball has to come round the open end.
                const wall = flip
                    ? { x: FIELD.wall, y: y, w: w, h: 5 }
                    : { x: snap(FIELD.w - FIELD.wall - w), y: y, w: w, h: 5 };
                return {
                    tee: { x: flip ? rngRange(rng, 18, 38, 0.5) : rngRange(rng, 62, 82, 0.5), y: teeY(rng) },
                    cup: { x: flip ? rngRange(rng, 62, 82, 0.5) : rngRange(rng, 18, 38, 0.5), y: cupY(rng) },
                    walls: [wall],
                    hazards: []
                };
            }
        },
        {
            name: 'sand-moat',
            build: function (rng) {
                const y = rngRange(rng, 68, 86, 0.5);
                const h = rngRange(rng, 12, 20, 0.5);
                return {
                    tee: { x: rngRange(rng, 28, 72, 0.5), y: teeY(rng) },
                    cup: { x: rngRange(rng, 28, 72, 0.5), y: cupY(rng) },
                    walls: [],
                    hazards: [{ kind: 'sand', shape: 'rect', x: FIELD.wall, y: y, w: FIELD.w - 2 * FIELD.wall, h: h }]
                };
            }
        },
        {
            name: 'island-approach',
            build: function (rng) {
                const y = rngRange(rng, 60, 76, 0.5);
                const gap = rngRange(rng, 18, 28, 0.5);
                const left = rngRange(rng, 22, 52, 0.5);
                const h = rngRange(rng, 10, 14, 0.5);
                return {
                    tee: { x: snap(left + gap / 2), y: teeY(rng) },
                    cup: { x: snap(left + gap / 2), y: cupY(rng) },
                    walls: [],
                    hazards: [
                        { kind: 'water', shape: 'rect', x: FIELD.wall, y: y, w: snap(left - FIELD.wall), h: h },
                        { kind: 'water', shape: 'rect', x: snap(left + gap), y: y, w: snap(FIELD.w - FIELD.wall - left - gap), h: h }
                    ]
                };
            }
        },
        {
            name: 'twin-gates',
            build: function (rng) {
                const aGap = rngRange(rng, 16, 26, 0.5);
                const bGap = rngRange(rng, 16, 26, 0.5);
                const aEnd = snap(FIELD.w - FIELD.wall - aGap);
                const bStart = snap(FIELD.wall + bGap);
                return {
                    tee: { x: rngRange(rng, 30, 70, 0.5), y: teeY(rng) },
                    cup: { x: rngRange(rng, 30, 70, 0.5), y: cupY(rng) },
                    walls: [
                        { x: FIELD.wall, y: rngRange(rng, 96, 106, 0.5), w: snap(aEnd - FIELD.wall), h: 5 },
                        { x: bStart, y: rngRange(rng, 58, 68, 0.5), w: snap(FIELD.w - FIELD.wall - bStart), h: 5 }
                    ],
                    hazards: []
                };
            }
        },
        {
            name: 'water-channel',
            build: function (rng) {
                const wide = rngRange(rng, 18, 26, 0.5);
                const flip = rng() < 0.5;
                const x = flip ? FIELD.wall : snap(FIELD.w - FIELD.wall - wide);
                const safeLo = flip ? snap(FIELD.wall + wide + 8) : 26;
                const safeHi = flip ? 74 : snap(FIELD.w - FIELD.wall - wide - 8);
                return {
                    tee: { x: rngRange(rng, safeLo, safeHi, 0.5), y: teeY(rng) },
                    cup: { x: rngRange(rng, safeLo, safeHi, 0.5), y: cupY(rng) },
                    walls: [],
                    hazards: [{ kind: 'water', shape: 'rect', x: x, y: 44, w: wide, h: rngRange(rng, 60, 78, 0.5) }]
                };
            }
        }
    ];

    /** Hand-authored, always valid. The net under generateHole. */
    const FALLBACK_HOLE = {
        seed: 0,
        archetype: 'fallback',
        par: 3,
        tee: { x: 50, y: TEE_Y },
        cup: { x: 50, y: CUP_Y },
        walls: borderWalls(),
        hazards: [],
        attempts: 0,
        fallback: true,
        pathLength: FIELD.h - CUP_Y - (FIELD.h - TEE_Y)
    };

    function buildCandidate(seed) {
        const rng = makeRng(seed);
        const a = ARCHETYPES[rngInt(rng, 0, ARCHETYPES.length - 1)];
        const part = a.build(rng);
        return {
            seed: seed,
            archetype: a.name,
            tee: part.tee,
            cup: part.cup,
            walls: borderWalls().concat(part.walls),
            hazards: part.hazards
        };
    }

    // ------------------------------------------------------------------
    // Surfaces and geometry
    // ------------------------------------------------------------------

    function inRect(r, x, y) {
        return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
    }

    function surfaceAt(hole, x, y) {
        const hz = hole.hazards || [];
        for (let i = 0; i < hz.length; i++) {
            if (hz[i].kind === 'water' && inRect(hz[i], x, y)) return 'water';
        }
        for (let i = 0; i < hz.length; i++) {
            if (hz[i].kind === 'sand' && inRect(hz[i], x, y)) return 'sand';
        }
        for (let i = 0; i < hz.length; i++) {
            if (hz[i].kind === 'fringe' && inRect(hz[i], x, y)) return 'fringe';
        }
        return 'green';
    }

    /** Blocked = wall or water, inflated by the ball radius. */
    function blockedAt(hole, x, y) {
        const r = SIM.BALL_R;
        for (let i = 0; i < hole.walls.length; i++) {
            const w = hole.walls[i];
            if (x >= w.x - r && x <= w.x + w.w + r && y >= w.y - r && y <= w.y + w.h + r) return true;
        }
        const hz = hole.hazards || [];
        for (let i = 0; i < hz.length; i++) {
            const z = hz[i];
            if (z.kind !== 'water') continue;
            if (x >= z.x - r && x <= z.x + z.w + r && y >= z.y - r && y <= z.y + z.h + r) return true;
        }
        return false;
    }

    /**
     * BFS over a coarse lattice, from one point outward. Returns the distance
     * field so callers can ask "how far from here, going around things" rather
     * than "how far as the crow flies" - which is the wrong question the moment
     * a wall is in the way.
     */
    function bfsField(hole, from) {
        const step = SIM.LATTICE;
        const cols = Math.floor(FIELD.w / step);
        const rows = Math.floor(FIELD.h / step);
        const blocked = new Uint8Array(cols * rows);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                blocked[r * cols + c] = blockedAt(hole, c * step + step / 2, r * step + step / 2) ? 1 : 0;
            }
        }
        const cell = function (p) {
            return clamp(Math.floor(p.y / step), 0, rows - 1) * cols +
                clamp(Math.floor(p.x / step), 0, cols - 1);
        };
        const dist = new Int32Array(cols * rows).fill(-1);
        const start = cell(from);
        if (blocked[start]) return { dist: dist, cols: cols, rows: rows, step: step, blocked: blocked, cell: cell };
        const queue = new Int32Array(cols * rows);
        let head = 0, tail = 0;
        dist[start] = 0;
        queue[tail++] = start;
        const dc = [1, -1, 0, 0];
        const dr = [0, 0, 1, -1];
        while (head < tail) {
            const cur = queue[head++];
            const cc = cur % cols;
            const cr = (cur - cc) / cols;
            for (let k = 0; k < 4; k++) {
                const nc = cc + dc[k], nr = cr + dr[k];
                if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
                const ni = nr * cols + nc;
                if (blocked[ni] || dist[ni] !== -1) continue;
                dist[ni] = dist[cur] + 1;
                queue[tail++] = ni;
            }
        }
        return { dist: dist, cols: cols, rows: rows, step: step, blocked: blocked, cell: cell };
    }

    function reachable(hole) {
        const f = bfsField(hole, hole.tee);
        const d = f.dist[f.cell(hole.cup)];
        return d < 0 ? { ok: false, pathLength: 0 } : { ok: true, pathLength: d * f.step };
    }

    function parForPathLength(len) {
        return clamp(2 + Math.floor((len - 60) / 50), 2, 5);
    }

    function dist2(a, b) {
        const dx = a.x - b.x, dy = a.y - b.y;
        return dx * dx + dy * dy;
    }

    function validateHole(hole) {
        const reasons = [];
        const m = FIELD.margin;
        const pts = [['tee', hole.tee], ['cup', hole.cup]];
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i][1];
            if (p.x < m || p.x > FIELD.w - m || p.y < m || p.y > FIELD.h - m) {
                reasons.push(pts[i][0] + '-out-of-margin');
            }
        }
        if (dist2(hole.tee, hole.cup) < SIM.MIN_SEPARATION * SIM.MIN_SEPARATION) {
            reasons.push('tee-cup-too-close');
        }
        const cupPad = SIM.BALL_R + 0.5;
        for (let i = 0; i < hole.walls.length; i++) {
            const w = hole.walls[i];
            const cx = clamp(hole.cup.x, w.x, w.x + w.w);
            const cy = clamp(hole.cup.y, w.y, w.y + w.h);
            const dx = hole.cup.x - cx, dy = hole.cup.y - cy;
            if (dx * dx + dy * dy < (SIM.CUP_R + cupPad) * (SIM.CUP_R + cupPad)) {
                reasons.push('cup-in-wall');
                break;
            }
        }
        for (let i = 0; i < hole.walls.length; i++) {
            if (inRect(hole.walls[i], hole.tee.x, hole.tee.y)) { reasons.push('tee-in-wall'); break; }
        }
        if (surfaceAt(hole, hole.cup.x, hole.cup.y) !== 'green') reasons.push('cup-not-green');
        if (surfaceAt(hole, hole.tee.x, hole.tee.y) === 'water') reasons.push('tee-in-water');
        if (blockedAt(hole, hole.tee.x, hole.tee.y)) reasons.push('tee-blocked');
        if (blockedAt(hole, hole.cup.x, hole.cup.y)) reasons.push('cup-blocked');

        const reach = reachable(hole);
        if (!reach.ok) reasons.push('unreachable');

        return { ok: reasons.length === 0, reasons: reasons, pathLength: reach.pathLength };
    }

    /**
     * Cannot return an invalid hole. A day that somehow defeats 32 attempts
     * degrades to a hand-authored hole rather than to a broken puzzle for
     * every player at once.
     */
    function generateHole(seed) {
        for (let a = 0; a < 32; a++) {
            const cand = buildCandidate(mixSeed(seed, a));
            const v = validateHole(cand);
            if (v.ok) {
                cand.seed = seed;
                cand.par = parForPathLength(v.pathLength);
                cand.pathLength = v.pathLength;
                cand.attempts = a;
                cand.fallback = false;
                return cand;
            }
        }
        const fb = JSON.parse(JSON.stringify(FALLBACK_HOLE));
        fb.seed = seed;
        fb.attempts = 32;
        return fb;
    }

    function dailyHole(now) {
        return generateHole(seedForDay(puzzleDay(now)));
    }

    /** Debug harness: a hundred holes as text in a second beats any amount of guessing. */
    function holeToAscii(hole) {
        const step = 2;
        const rows = [];
        for (let y = 0; y < FIELD.h; y += step) {
            let line = '';
            for (let x = 0; x < FIELD.w; x += step) {
                const cx = x + step / 2, cy = y + step / 2;
                if (dist2({ x: cx, y: cy }, hole.cup) < SIM.CUP_R * SIM.CUP_R) line += 'H';
                else if (dist2({ x: cx, y: cy }, hole.tee) < 4) line += 'o';
                else {
                    let wall = false;
                    for (let i = 0; i < hole.walls.length; i++) {
                        if (inRect(hole.walls[i], cx, cy)) { wall = true; break; }
                    }
                    if (wall) line += '#';
                    else {
                        const s = surfaceAt(hole, cx, cy);
                        line += s === 'water' ? '~' : (s === 'sand' ? ':' : (s === 'fringe' ? ',' : ' '));
                    }
                }
            }
            rows.push(line);
        }
        return rows.join('\n');
    }

    // ------------------------------------------------------------------
    // Physics
    // ------------------------------------------------------------------

    function createBall(hole) {
        return {
            x: hole.tee.x, y: hole.tee.y, vx: 0, vy: 0,
            resting: true, sunk: false, overCup: false,
            strokeOrigin: { x: hole.tee.x, y: hole.tee.y }
        };
    }

    function aimToVelocity(aim) {
        const power = clamp(aim.power, 0, 1);
        const speed = power * SIM.MAX_SPEED;
        return { vx: Math.cos(aim.angle) * speed, vy: Math.sin(aim.angle) * speed };
    }

    /**
     * Wind as an acceleration. `deg` is meteorological - the direction the wind
     * blows FROM - so a north wind (0) pushes the ball toward +y, down-screen.
     */
    function windVector(windSpec, tSeconds) {
        if (!windSpec || !(windSpec.mph > 0)) return { ax: 0, ay: 0 };
        const mph = clamp(windSpec.mph, 0, SIM.WIND_MAX_MPH);
        const gust = Math.max(0, (windSpec.gustMph || mph) - mph) * 0.5;
        const eff = mph + gust * Math.sin((2 * Math.PI * tSeconds) / SIM.GUST_PERIOD);
        const radTo = ((windSpec.deg || 0) + 180) * Math.PI / 180;
        return {
            ax: SIM.WIND_GAIN * eff * Math.sin(radTo),
            ay: SIM.WIND_GAIN * eff * -Math.cos(radTo)
        };
    }

    /**
     * Penetration of a ball centre against one wall, treating the ball as a
     * point against the rect inflated by BALL_R, and resolving on the
     * minimum-translation axis.
     *
     * Picking the normal from "which wall did I hit" instead of the
     * min-translation axis is the classic corner leak - the ball squirts
     * through the seam between two touching rects.
     */
    function penetration(w, x, y, px, py) {
        const r = SIM.BALL_R;
        const minx = w.x - r, maxx = w.x + w.w + r;
        const miny = w.y - r, maxy = w.y + w.h + r;
        if (x <= minx || x >= maxx || y <= miny || y >= maxy) return null;
        const dl = x - minx, dr = maxx - x, dt = y - miny, db = maxy - y;

        // Prefer the side the ball came FROM. On a wall thinner than twice the
        // ball radius, a deep penetration is nearer the far face, and pure
        // minimum-translation would helpfully push the ball out the other
        // side - i.e. straight through the wall.
        if (px !== undefined) {
            if (px <= minx) return { depth: dl, nx: -1, ny: 0 };
            if (px >= maxx) return { depth: dr, nx: 1, ny: 0 };
            if (py <= miny) return { depth: dt, nx: 0, ny: -1 };
            if (py >= maxy) return { depth: db, nx: 0, ny: 1 };
        }
        const m = Math.min(dl, dr, dt, db);
        if (m === dl) return { depth: dl, nx: -1, ny: 0 };
        if (m === dr) return { depth: dr, nx: 1, ny: 0 };
        if (m === dt) return { depth: dt, nx: 0, ny: -1 };
        return { depth: db, nx: 0, ny: 1 };
    }

    function resolveCollisions(hole, s, px, py) {
        let bounces = 0;
        // Overlapping walls resolve in sequence, and pushing out of one can
        // shove the ball into another - so iterate, deepest first.
        for (let pass = 0; pass < 4; pass++) {
            let best = null;
            for (let i = 0; i < hole.walls.length; i++) {
                const p = penetration(hole.walls[i], s.x, s.y, px, py);
                if (p && (!best || p.depth > best.depth)) best = p;
            }
            if (!best) break;
            s.x += best.nx * best.depth;
            s.y += best.ny * best.depth;
            const dot = s.vx * best.nx + s.vy * best.ny;
            // Only reflect when moving INTO the surface, else the ball sticks
            // and jitters against the wall.
            if (dot < 0) {
                s.vx -= (1 + SIM.RESTITUTION) * dot * best.nx;
                s.vy -= (1 + SIM.RESTITUTION) * dot * best.ny;
                bounces++;
            }
        }
        return bounces;
    }

    function stepBall(hole, ball, windSpec, tSeconds, dt) {
        if (ball.sunk) return { ball: ball, event: 'sunk', bounces: 0 };
        let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (speed === 0) {
            return { ball: ball, event: 'rest', bounces: 0 };
        }

        const s = {
            x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy,
            resting: false, sunk: false, overCup: ball.overCup,
            strokeOrigin: ball.strokeOrigin
        };

        // 1. wind
        const w = windVector(windSpec, tSeconds);
        s.vx += w.ax * dt;
        s.vy += w.ay * dt;

        // 2. Coulomb friction with an exact clamp to zero. Exponential damping
        // approaches zero asymptotically and the ball creeps forever at 1e-9
        // u/s; this gives a real resting state, and the test asserts === 0.
        const surface = surfaceAt(hole, s.x, s.y);
        speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        const dec = (SIM.MU[surface] || 1) * SIM.DECEL * dt;
        if (speed <= dec) {
            return {
                ball: { x: s.x, y: s.y, vx: 0, vy: 0, resting: true, sunk: false, overCup: false, strokeOrigin: s.strokeOrigin },
                event: 'rest', bounces: 0
            };
        }
        const scale = (speed - dec) / speed;
        s.vx *= scale;
        s.vy *= scale;

        // 3. mild linear drag in the high-speed regime
        s.vx *= (1 - SIM.DRAG_K * dt);
        s.vy *= (1 - SIM.DRAG_K * dt);

        // 4. adaptive substepping. Guard two of three against tunneling: even
        // if MAX_SPEED is later raised or a bug injects a large velocity, the
        // ball never advances more than half a radius between collision tests.
        speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        const n = Math.max(1, Math.ceil((speed * dt) / (SIM.BALL_R * 0.5)));
        const sub = dt / n;
        let bounces = 0;
        const captureR = SIM.CUP_R - SIM.BALL_R * 0.35;

        for (let i = 0; i < n; i++) {
            const px = s.x, py = s.y;
            s.x += s.vx * sub;
            s.y += s.vy * sub;

            if (surfaceAt(hole, s.x, s.y) === 'water') {
                return {
                    ball: {
                        x: s.strokeOrigin.x, y: s.strokeOrigin.y, vx: 0, vy: 0,
                        resting: true, sunk: false, overCup: false, strokeOrigin: s.strokeOrigin
                    },
                    event: 'water', bounces: bounces
                };
            }

            bounces += resolveCollisions(hole, s, px, py);

            // Sink test runs per SUBSTEP: a fast putt can straddle a 2.2u cup
            // between two frames and never register.
            const dx = s.x - hole.cup.x, dy = s.y - hole.cup.y;
            const over = (dx * dx + dy * dy) <= captureR * captureR;
            if (over) {
                const sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
                if (sp <= SIM.CAPTURE_SPEED) {
                    return {
                        ball: {
                            x: hole.cup.x, y: hole.cup.y, vx: 0, vy: 0,
                            resting: true, sunk: true, overCup: true, strokeOrigin: s.strokeOrigin
                        },
                        event: 'sunk', bounces: bounces
                    };
                }
                if (!s.overCup) {
                    // Lip-out: too fast to drop, but the cup takes a bite.
                    s.vx *= 0.88; s.vy *= 0.88;
                    s.vx += -dx * 0.35; s.vy += -dy * 0.35;
                }
            }
            s.overCup = over;

            if (s.x < -2 || s.y < -2 || s.x > FIELD.w + 2 || s.y > FIELD.h + 2) {
                return {
                    ball: {
                        x: clamp(s.x, SIM.BALL_R, FIELD.w - SIM.BALL_R),
                        y: clamp(s.y, SIM.BALL_R, FIELD.h - SIM.BALL_R),
                        vx: 0, vy: 0, resting: true, sunk: false, overCup: false,
                        strokeOrigin: s.strokeOrigin
                    },
                    event: 'oob', bounces: bounces
                };
            }
        }

        return { ball: s, event: 'moving', bounces: bounces };
    }

    function simulateShot(hole, ball, aim, windSpec, opts) {
        const o = opts || {};
        const v = aimToVelocity(aim);
        let b = {
            x: ball.x, y: ball.y, vx: v.vx, vy: v.vy,
            resting: false, sunk: false, overCup: false,
            strokeOrigin: { x: ball.x, y: ball.y }
        };
        const cap = o.maxSteps || SIM.MAX_STEPS;
        const marks = [];
        let t = o.t0 || 0;
        let steps = 0;
        let bounces = 0;
        while (steps < cap) {
            const r = stepBall(hole, b, windSpec, t, SIM.DT);
            b = r.ball;
            bounces += r.bounces;
            steps++;
            t += SIM.DT;
            if (o.trace) marks.push({ x: b.x, y: b.y });
            if (r.event !== 'moving') {
                return { ball: b, event: r.event, steps: steps, elapsed: t, bounces: bounces, marks: marks };
            }
        }
        return { ball: b, event: 'timeout', steps: steps, elapsed: t, bounces: bounces, marks: marks };
    }

    /**
     * Fire a deterministic lattice of zero-wind shots through the real physics,
     * greedily taking the closest approach and playing on from there.
     *
     * BFS reachability only says a path exists. This says a player can actually
     * get down in a sane number of strokes - and it has to be multi-stroke,
     * because these holes are par 3: "sinkable from the tee in one" was never
     * the right question.
     */
    function probeSolvable(hole, opts) {
        const o = opts || {};
        const angles = o.angles || 24;
        const powers = o.powers || 5;
        const maxStrokes = o.maxStrokes || (hole.par + 1);
        const calm = { mph: 0, deg: 0, gustMph: 0, source: 'none' };
        const field = bfsField(hole, hole.cup);
        const pathDist = function (p) {
            const d = field.dist[field.cell(p)];
            return d < 0 ? Infinity : d * field.step;
        };
        let pos = { x: hole.tee.x, y: hole.tee.y };
        let prevDist = pathDist(pos);
        let tried = 0;
        let best = { dist: prevDist, aim: null };

        for (let stroke = 0; stroke < maxStrokes; stroke++) {
            const from = createBall(hole);
            from.x = pos.x; from.y = pos.y;
            let round = { dist: Infinity, aim: null, end: null };
            for (let i = 0; i < angles; i++) {
                const angle = (i / angles) * Math.PI * 2;
                for (let p = 1; p <= powers; p++) {
                    const aim = { angle: angle, power: p / powers };
                    const r = simulateShot(hole, from, aim, calm, { maxSteps: 1200 });
                    tried++;
                    if (r.event === 'sunk') {
                        return { sinkable: true, strokes: stroke + 1, best: { dist: 0, aim: aim }, tried: tried };
                    }
                    const d = pathDist(r.ball);
                    if (d < round.dist) round = { dist: d, aim: aim, end: { x: r.ball.x, y: r.ball.y } };
                }
            }
            if (round.dist < best.dist) best = { dist: round.dist, aim: round.aim };
            // No progress this stroke means no progress ever - the lattice is
            // deterministic, so replaying it from the same spot gives the same
            // answer.
            if (!round.end || round.dist >= prevDist - 0.5) break;
            prevDist = round.dist;
            pos = round.end;
        }
        return { sinkable: false, strokes: null, best: best, tried: tried };
    }

    // ------------------------------------------------------------------
    // Scoring and sharing
    // ------------------------------------------------------------------

    function scoreLabel(strokes, par) {
        if (strokes === 1) return 'Hole in one';
        const diff = strokes - par;
        if (diff <= -3) return 'Albatross';
        if (diff === -2) return 'Eagle';
        if (diff === -1) return 'Birdie';
        if (diff === 0) return 'Par';
        if (diff === 1) return 'Bogey';
        if (diff === 2) return 'Double bogey';
        if (diff === 3) return 'Triple bogey';
        return '+' + diff;
    }

    // Single code points only, so one cell is one grapheme.
    function scoreEmoji(strokes, par) {
        if (strokes === 1) return '\u{1F3C6}';
        const diff = strokes - par;
        if (diff <= -2) return '\u{1F985}';
        if (diff === -1) return '\u{1F426}';
        if (diff === 0) return '\u{1F7E2}';
        if (diff === 1) return '\u{1F7E1}';
        if (diff === 2) return '\u{1F7E0}';
        return '\u{1F534}';
    }

    const CELL = { green: '\u{1F7E9}', sand: '\u{1F7E8}', water: '\u{1F7E6}', wall: '⬜', sunk: '⛳' };

    function buildShare(result) {
        const strokes = result.strokes;
        const par = result.par;
        const diff = strokes - par;
        const sign = diff === 0 ? 'E' : (diff > 0 ? '+' + diff : String(diff));
        const cells = (result.cells || []).slice(0, 12).map(function (c) {
            return CELL[c] || CELL.green;
        }).join('');
        const overflow = (result.cells || []).length > 12 ? '…' : '';
        const lines = [
            'ONE PUTT #' + result.day + ' — ' + strokes + ' (' + sign + ')',
            cells + overflow,
            'Wind ' + formatWind({ mph: result.windMph, deg: result.windDeg }),
            'Streak ' + result.streak,
            'branyontech.com/game/'
        ];
        return lines.join('\n');
    }

    // ------------------------------------------------------------------
    // Persisted state
    // ------------------------------------------------------------------

    const STORAGE_KEY = 'oneputt.v1';

    // Field order here is the key order of the serialised JSON, which the
    // golden hashes in tests.js pin. Reordering it fails them, by design.
    const store = Daily.makeStore({
        version: 1,
        counters: { played: 0, aces: 0 },
        dayFields: {
            strokes: { kind: 'int', min: 1, required: true },
            par: { kind: 'int', required: true },
            windMph: { kind: 'num', default: 0 },
            windDeg: { kind: 'num', default: 0 },
            source: { kind: 'enum', values: ['live', 'synthetic'], default: 'synthetic' }
        },
        settings: {
            sound: { kind: 'bool', default: false },
            geo: { kind: 'enum', values: ['set', 'denied'], default: null }
        },
        bump: function (state, result) {
            return { played: state.played + 1, aces: state.aces + (result.strokes === 1 ? 1 : 0) };
        },
        maxDays: 30
    });

    const emptyState = store.emptyState;
    const parseState = store.parseState;
    const serializeState = store.serializeState;
    const recordDaily = store.recordDaily;

    const OnePutt = {
        EPOCH_UTC_MS: EPOCH_UTC_MS,
        DAY_MS: DAY_MS,
        FIELD: FIELD,
        SIM: SIM,
        ARCHETYPES: ARCHETYPES,
        FALLBACK_HOLE: FALLBACK_HOLE,
        STORAGE_KEY: STORAGE_KEY,
        COMPASS: COMPASS,

        puzzleDay: puzzleDay,
        puzzleDateKey: puzzleDateKey,
        msUntilNextPuzzle: msUntilNextPuzzle,
        hashSeed: hashSeed,
        seedForDay: seedForDay,
        makeRng: makeRng,
        rngInt: rngInt,
        rngRange: rngRange,

        buildCandidate: buildCandidate,
        validateHole: validateHole,
        reachable: reachable,
        parForPathLength: parForPathLength,
        generateHole: generateHole,
        dailyHole: dailyHole,
        holeToAscii: holeToAscii,
        surfaceAt: surfaceAt,

        createBall: createBall,
        aimToVelocity: aimToVelocity,
        windVector: windVector,
        stepBall: stepBall,
        simulateShot: simulateShot,
        probeSolvable: probeSolvable,

        compassFromDegrees: compassFromDegrees,
        formatWind: formatWind,
        clampWind: clampWind,
        syntheticWind: syntheticWind,
        extractWind: extractWind,
        resolveWind: resolveWind,

        scoreLabel: scoreLabel,
        scoreEmoji: scoreEmoji,
        buildShare: buildShare,

        emptyState: emptyState,
        parseState: parseState,
        serializeState: serializeState,
        recordDaily: recordDaily
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = OnePutt;
    }
    if (root) {
        root.OnePutt = OnePutt;
    }
})(typeof window !== 'undefined' ? window : null);
