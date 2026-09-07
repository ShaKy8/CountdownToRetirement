/**
 * THERMAL - pure flight rules.
 *
 * Same contract as game/putt.js: a classic script with the repo's dual-export
 * shim, no DOM, no storage, no network, and no zero-argument `new Date()`.
 * Sun altitude, wind and the clock are all handed in, which is what lets
 * tests.js fly thousands of deterministic flights in Node.
 *
 * The game is dolphin-soaring cross-country. One button chooses airspeed, and
 * the correct play - slow down in lift, speed up in sink - is the MacCready
 * speed-to-fly rule. That is where the skill lives.
 */
(function (root) {
    'use strict';

    // In the browser root.Daily is already set by the preceding <script>, so
    // the require() branch is never reached and `require` is never referenced.
    const Daily = (root && root.Daily) || require('../shared/daily.js');
    const clamp = Daily.clamp;

    // ------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------

    const FLY = {
        G: 9.81,
        DT: 1 / 120,

        // Cruise. 26 m/s at 0.95 m/s sink is L/D 27 - a real modern glider. There
        // is no longer a speed to choose: the button chooses a FLIGHT MODE.
        V_CRUISE: 26.0,
        SINK_CRUISE: 0.95,

        // Banked flight sinks a little more and goes nowhere. The 0.10 m/s is
        // almost beside the point - what circling really costs is all 26 m/s of
        // forward speed, which is a 26:0 difference rather than the 0.43 m/s the
        // old model managed. Set this to 1.25 and no thermal on a weak day can be
        // climbed at all.
        SINK_CIRCLE: 1.05,

        // Half-life of rolling in and out. The pow() form in step() is exactly
        // timestep-invariant; a linear (target-bank)*RATE*dt is not.
        ROLL_HALF: 0.9,

        // RENDERER ONLY. The simulation stays one-dimensional - simulate(), every
        // autopilot and the tuning harness depend on it.
        TURN_RATE: 0.32,
        BANK_ANGLE: 0.80,
        TURN_RADIUS: 52,

        RIDGE_DECAY: 200,
        RIDGE_GAIN: 1.6,
        RIDGE_MAX: 4.0,
        WIND_ALONG_MAX: 12,

        RELEASE_AGL: 420,     // m above the release point, capped by the column
        TIME_LIMIT: 1200,     // s of flight
        TIME_SCALE: 4,        // sim seconds per wall second - a 20 s circle reads as 5
        MAX_STEPS: 120 * (1200 + 120)
    };

    const WORLD = {
        BASE_ALT: 250,        // m, the terrain's mean
        CHUNK_M: 2000,
        OCTAVES: [[3200, 150], [900, 60], [260, 25], [80, 8]]   // [wavelength m, amplitude m]
    };

    // ------------------------------------------------------------------
    // Terrain
    //
    // Bit-exact everywhere. Only imul / floor / add / multiply, never
    // Math.sin: IEEE-754 +,* and floor are correctly rounded and identical
    // across JS engines, transcendentals are not - and the ridge line has to
    // be the same for everyone even though the flight sim need not be.
    // ------------------------------------------------------------------

    function hash1(seed, i) {
        let h = Math.imul(seed ^ i, 0x27d4eb2d);
        h ^= h >>> 15;
        h = Math.imul(h, 0x85ebca6b);
        h ^= h >>> 13;
        return h >>> 0;
    }

    function vnoise1(seed, t) {
        const i = Math.floor(t);
        const f = t - i;
        const a = hash1(seed, i) / 4294967296;
        const b = hash1(seed, i + 1) / 4294967296;
        const s = f * f * (3 - 2 * f);
        return a + (b - a) * s;
    }

    /** Ground height in metres. A pure function of x - no chunks, no seams. */
    function terrain(seed, x) {
        let h = WORLD.BASE_ALT;
        for (let i = 0; i < WORLD.OCTAVES.length; i++) {
            const wave = WORLD.OCTAVES[i][0];
            const amp = WORLD.OCTAVES[i][1];
            h += (vnoise1((seed + Math.imul(i, 0x9e37)) >>> 0, x / wave) - 0.5) * 2 * amp;
        }
        return h;
    }

    function terrainSlope(seed, x) {
        return (terrain(seed, x + 5) - terrain(seed, x - 5)) / 10;
    }

    // ------------------------------------------------------------------
    // Thermals
    // ------------------------------------------------------------------

    function thermalsInChunk(seed, cond, c) {
        const rng = Daily.makeRng(Daily.hashSeed('th:' + seed + ':' + c));
        const out = [];
        const start = c * WORLD.CHUNK_M;
        // A walk rather than round(CHUNK_M / spacing): rounding quantised the
        // density to whole thermals per chunk, so a 1400 m spacing and a 2500 m
        // spacing both produced exactly one, and cloud cover stopped mattering.
        let px = start + rng() * cond.thermalSpacing;
        let n = 0;
        while (px < start + WORLD.CHUNK_M) {
            out.push({
                // Derived, not drawn from rng: pulling an extra number here
                // would shift every thermal in the world.
                id: Daily.hashSeed('rg:' + seed + ':' + c + ':' + n++),
                x: px,
                r: cond.coreRadius * (0.75 + 0.5 * rng()),
                strength: cond.wStarEff * (0.6 + 0.8 * rng()),
                base: 60 + rng() * 80,
                top: cond.cloudbase * (0.75 + 0.25 * rng())
            });
            px += cond.thermalSpacing * (0.6 + 0.8 * rng());
        }
        return out;
    }

    /** Every thermal that could reach x. Stateless: cold queries match walked ones. */
    function thermalsNear(seed, cond, x) {
        const c = Math.floor(x / WORLD.CHUNK_M);
        let out = [];
        for (let k = c - 1; k <= c + 1; k++) {
            out = out.concat(thermalsInChunk(seed, cond, k));
        }
        return out;
    }

    /**
     * Vertical air speed inside one thermal.
     *
     * Weak near the ground, dying at cloudbase, with the sink ring real
     * thermals actually have - and leaning downwind with height, so on a windy
     * day the column walks out from under you.
     */
    /** How far downwind the column has leaned by this height. */
    function thermalTilt(th, agl, windAlong) {
        // Math.max(1, undefined) is NaN, and a NaN here silently poisons the
        // whole flight rather than throwing.
        const strength = isFinite(th.strength) ? Math.max(1, th.strength) : 1;
        return clamp(windAlong * (agl - th.base) / strength, -600, 600);
    }

    function thermalW(th, x, h, windAlong, ground) {
        const agl = h - ground;
        if (agl < 0) return 0;
        const tilt = thermalTilt(th, agl, windAlong);
        const q = Math.abs((x - (th.x + tilt)) / th.r);
        if (q >= 2) return 0;
        let shape;
        if (q <= 1) {
            shape = 1 - q * q;
        } else {
            shape = -0.35 * (1 - (q - 1.5) * (q - 1.5) * 4);
        }
        // w/w* in the convective boundary layer is a function of z/zi, not of an
        // absolute height. Fixed 150/250 m ramps overlap on a shallow column and
        // cap the profile at about half - measured, a 350 m cloudbase could only
        // ever deliver 49% of its core strength however strong it was. That, not
        // weakness, is why shallow days were dead.
        const depth = Math.max(200, th.top - th.base);
        const a = clamp((agl - th.base) / (0.25 * depth), 0, 1);
        const b = clamp((th.top - agl) / (0.35 * depth), 0, 1);
        const vprof = a * a * (3 - 2 * a) * b * b * (3 - 2 * b);
        return th.strength * shape * vprof;
    }

    /**
     * Ridge lift. The flow follows the ground, so surface vertical velocity is
     * wind x slope, decaying with height. The sign flips with wind direction,
     * so the same ridge lifts on the windward face and sinks on the lee - and
     * it is exactly zero in calm air.
     */
    function ridgeW(seed, x, h, windAlong) {
        const g = terrainSlope(seed, x);
        // u * dh/dx is the air simply following the ground; the gain is
        // streamline compression over a crest, which is why a good ridge lifts
        // harder than the bare slope suggests.
        const surf = clamp(windAlong * g * FLY.RIDGE_GAIN, -FLY.RIDGE_MAX, FLY.RIDGE_MAX);
        const agl = Math.max(0, h - terrain(seed, x));
        return surf * Math.exp(-agl / FLY.RIDGE_DECAY);
    }

    /**
     * Chunks are pure functions of (seed, cond, index), so caching them on the
     * world is memoisation, not state - a cold query returns what a walked one
     * does, which a test asserts. Without it every one of the ~50k steps in a
     * flight re-seeds and re-rolls three chunks, and a tuning sweep takes
     * minutes instead of seconds.
     */
    function chunkCached(world, c) {
        let v = world.chunks.get(c);
        if (v === undefined) {
            v = thermalsInChunk(world.seed, world.cond, c);
            world.chunks.set(c, v);
            if (world.chunks.size > 8) {
                world.chunks.delete(world.chunks.keys().next().value);
            }
        }
        return v;
    }

    // Scratch, set by airVelocity and read by the step that just called it. The
    // tracking term needs the strength of the column acting here, and walking the
    // same thermals a second time to find it doubled the cost of every step.
    let lastStrength = 0;

    function airVelocity(world, x, h) {
        const ground = terrain(world.seed, x);
        let bestW = 0;
        lastStrength = 0;
        // Air that is not rising is sinking - the compensating downdraft around
        // every thermal. This is what makes altitude a budget rather than a
        // gift, and it is why flying well matters.
        let w = -world.cond.ambient;
        w += ridgeW(world.seed, x, h, world.cond.windAlong);
        const c = Math.floor(x / WORLD.CHUNK_M);
        for (let k = c - 1; k <= c + 1; k++) {
            const ths = chunkCached(world, k);
            for (let i = 0; i < ths.length; i++) {
                const tw = thermalW(ths[i], x, h, world.cond.windAlong, ground);
                w += tw;
                if (tw > bestW) { bestW = tw; lastStrength = ths[i].strength; }
            }
        }
        return w;
    }


    // ------------------------------------------------------------------
    // Rings
    //
    // A stack of hoops up the middle of every thermal. They are the answer to
    // "I cannot tell what I am supposed to do": the lift is invisible, so the
    // rings draw it. Chasing them IS learning to read the air, which is why
    // they are placed from the same profile the lift uses rather than sprinkled
    // for decoration - a test pins that every ring sits where thermalW > 0.
    // ------------------------------------------------------------------

    const RING = {
        DH: 110,        // m between rings up the column
        R: 70,          // m collection radius
        JITTER: 0.15,   // fraction of the core radius the stack may wander
        ALT: 8,         // m of bonus height per ring at chain 1
        MAX_MULT: 3.0,
        DROP: 45        // m below the last ring taken that breaks the chain
    };

    /** Deterministic from the thermal alone, memoised on it. */
    function ringsFor(th) {
        if (th.rings) return th.rings;
        const rng = Daily.makeRng(th.id);
        const depth = Math.max(200, th.top - th.base);
        const lo = th.base + 0.30 * depth;
        const hi = th.top - 0.30 * depth;
        const n = Math.max(2, Math.min(14, Math.floor((hi - lo) / RING.DH)));
        const out = [];
        for (let i = 0; i < n; i++) {
            out.push({
                agl: lo + (hi - lo) * (i + 0.5) / n,
                off: (rng() - 0.5) * 2 * RING.JITTER * th.r
            });
        }
        th.rings = out;
        return out;
    }

    /** Where a ring is horizontally - it leans with the column. */
    function ringX(th, ring, windAlong) {
        return th.x + thermalTilt(th, ring.agl, windAlong) + ring.off;
    }

    // ------------------------------------------------------------------
    // Weather -> gameplay
    // ------------------------------------------------------------------

    /**
     * Thermal strength from the depth of the mixing layer.
     *
     * This used CAPE, which was wrong and made most real days unplayable. CAPE
     * measures potential for DEEP convection - thunderstorms - and across ten
     * live forecasts it read 0-250 J/kg nearly everywhere, so flying perfectly
     * scored the same as doing nothing in 27 of 30 conditions.
     *
     * What actually sets glider thermal strength is the convective velocity
     * scale w* ~ (g/theta * H * zi)^(1/3): how deep the air is mixing, times how
     * hard the sun is driving it. `boundary_layer_height` is zi directly, and
     * across the same ten forecasts it ranged 80-2990 m - and ranked the places
     * the way pilots would, with Phoenix, Albuquerque and Minden on top and
     * Seattle, London and a marine-layer Los Angeles morning at the bottom.
     *
     * The cube root is the physics; the offset and gain are tuned so the real
     * range maps onto a range the game can feel.
     */
    function blhToWStar(blhMetres, flux) {
        const zi = typeof blhMetres === 'number' && isFinite(blhMetres) ? Math.max(0, blhMetres) : 0;
        const f = clamp(typeof flux === 'number' && isFinite(flux) ? flux : 0, 0, 1);
        return clamp(0.62 * (Math.cbrt(zi * f) - 3.1), 1.6, 6.0);
    }

    /**
     * How hard the sun is driving the surface. Sun angle sets the ceiling;
     * sunshine_duration (seconds of unblocked sun in the hour) is what cloud
     * actually leaves of it - which is why a Los Angeles marine-layer morning
     * reads dead even with the sun 30 degrees up.
     */
    function heatFlux(solar, sunshineFrac) {
        const sf = clamp(typeof sunshineFrac === 'number' && isFinite(sunshineFrac) ? sunshineFrac : 1, 0, 1);
        return clamp(solar, 0, 1) * (0.25 + 0.75 * sf);
    }

    // Deliberately non-monotonic, because the truth is: cumulus mark thermals,
    // overcast kills them.
    const CU_TABLE = [[0.00, 0.80], [0.15, 1.00], [0.45, 1.00], [0.75, 0.45], [1.00, 0.12]];

    function cloudFrequency(fraction) {
        const f = clamp(typeof fraction === 'number' && isFinite(fraction) ? fraction : 0, 0, 1);
        for (let i = 0; i < CU_TABLE.length - 1; i++) {
            const a = CU_TABLE[i], b = CU_TABLE[i + 1];
            if (f >= a[0] && f <= b[0]) {
                const t = b[0] === a[0] ? 0 : (f - a[0]) / (b[0] - a[0]);
                return a[1] + (b[1] - a[1]) * t;
            }
        }
        return CU_TABLE[CU_TABLE.length - 1][1];
    }

    /**
     * Surface heat flux goes as sin(sunAlt) and the convective velocity scale
     * as its cube root; the gate below 12 degrees is the two facts every pilot
     * knows - thermals switch on about an hour after sunrise and die about an
     * hour before sunset.
     */
    function solarFactor(sunAltRad) {
        if (typeof sunAltRad !== 'number' || !isFinite(sunAltRad)) return 0;
        const s = Math.sin(sunAltRad);
        if (s <= 0) return 0;
        const deg = sunAltRad * 180 / Math.PI;
        const gate = clamp((deg - 3) / 9, 0, 1);
        return clamp(Math.cbrt(s) * (0.15 + 0.85 * gate), 0, 1);
    }

    function cloudbaseFrom(tempF, dewF, blhMetres) {
        const lcl = (typeof tempF === 'number' && typeof dewF === 'number' &&
            isFinite(tempF) && isFinite(dewF)) ? 125 * (tempF - dewF) * 5 / 9 : 1500;
        const zi = typeof blhMetres === 'number' && isFinite(blhMetres) ? blhMetres : lcl;
        // The working ceiling is the lower of the two. Phoenix can have a
        // 3400 m condensation level over a 2450 m mixing layer; the thermals
        // stop at the mixing layer.
        return clamp(Math.min(lcl, Math.max(zi, 250)), 350, 3500);
    }

    const MPH_TO_MPS = 0.44704;

    /**
     * Turn raw weather into the handful of numbers the flight model reads.
     * `course` is the bearing the glider flies, in radians from north.
     */
    /**
     * Ambient sink - the air between the lift.
     *
     * Mass continuity: thermals covering a fraction f and rising at meanW force
     * the rest of the air down at meanW*f/(1-f). This was abandoned once because
     * it diverges as f approaches 1, and straight-line dolphin soaring needed f
     * near 1. Capping the lift fraction at 0.30 is what makes it safe again, and
     * it restores the thing every pilot knows: a booming day has enormous sink
     * between the lift, which is the reason you have to climb at all.
     *
     * The 0.90 cap is load-bearing. At 1.8 the five strongest afternoons became
     * unplayable - L/D falls to 12.7 and neither the sled nor correct play can
     * connect.
     */
    function ambientSink(cond) {
        const f = Math.min(0.30, 2 * cond.coreRadius / Math.max(1, cond.thermalSpacing));
        return clamp(0.667 * cond.wStarEff * f / (1 - f), 0.20, 0.90);
    }

    function buildConditions(raw, sunAltRad, course) {
        const solar = solarFactor(sunAltRad);
        const flux = heatFlux(solar, raw.sunshine);
        const blh = typeof raw.blh === 'number' && isFinite(raw.blh) ? raw.blh : 700;
        const wStar = blhToWStar(blh, flux);
        const cloudFrac = clamp((typeof raw.cloudLow === 'number' && isFinite(raw.cloudLow)
            ? raw.cloudLow : 0) / 100, 0, 1);

        /*
         * Thermals sit about two boundary-layer depths apart and are a fifth of
         * that across. The previous model inflated the cores and collapsed the
         * spacing into "streets" so that a glider crossing them in a straight
         * line was always in lift - which is exactly why holding the button and
         * never releasing was the best strategy on 15 of 40 days.
         *
         * Circling wants the opposite. Narrow cores and honest spacing make
         * FINDING and CENTRING a thermal the skill. The spacing is capped at
         * 2400 m because beyond that the glider cannot reliably connect one
         * column to the next and the sled ride wins again.
         */
        const coreRadius = clamp(0.10 * blh, 90, 320);
        const thermalSpacing = clamp(
            2.0 * blh / clamp(cloudFrequency(cloudFrac), 0.55, 1), 700, 2400);

        const windMps = Math.max(0, (typeof raw.windMph === 'number' && isFinite(raw.windMph)
            ? raw.windMph : 0)) * MPH_TO_MPS;
        const windToward = (((typeof raw.windDeg === 'number' && isFinite(raw.windDeg)
            ? raw.windDeg : 0) + 180) % 360) * Math.PI / 180;

        const cond = {
            wStar: wStar,
            wStarEff: wStar,
            solar: solar,
            flux: flux,
            blh: blh,
            cloudFrac: cloudFrac,
            coreRadius: coreRadius,
            thermalSpacing: thermalSpacing,
            cloudbase: cloudbaseFrom(raw.tempF, raw.dewF, blh),
            windMps: windMps,
            windToward: windToward,
            windAlong: clamp(windMps * Math.cos(windToward - course),
                -FLY.WIND_ALONG_MAX, FLY.WIND_ALONG_MAX),
            source: raw.source === 'live' ? 'live' : 'synthetic'
        };
        cond.ambient = ambientSink(cond);
        return cond;
    }

    /** Reads any bundle shape; returns null - never throws - when it cannot. */
    function extractConditions(bundle, now) {
        const s = Daily.sampleHourly(bundle, now, {
            boundary_layer_height: 'linear',
            cloud_cover_low: 'linear',
            wind_speed_10m: 'linear',
            wind_direction_10m: 'angle',
            sunshine_duration: 'linear?',
            temperature_2m: 'linear?',
            dew_point_2m: 'linear?',
            cape: 'linear?'
        });
        if (!s) return null;
        return {
            // FEET. Open-Meteo is asked for inches of precipitation, and that
            // silently switches EVERY length field to feet - visibility,
            // freezing level and this one - declared only in hourly_units.
            // Reading it as metres would make every mixing layer three times
            // too deep and every day a booming one.
            blh: s.values.boundary_layer_height * 0.3048,
            sunshine: s.values.sunshine_duration === undefined
                ? 1 : clamp(s.values.sunshine_duration / 3600, 0, 1),
            cloudLow: s.values.cloud_cover_low,
            windMph: s.values.wind_speed_10m,
            windDeg: s.values.wind_direction_10m,
            tempF: s.values.temperature_2m === undefined ? 70 : s.values.temperature_2m,
            dewF: s.values.dew_point_2m === undefined ? 48 : s.values.dew_point_2m,
            cape: s.values.cape === undefined ? 0 : s.values.cape,
            source: 'live'
        };
    }

    function syntheticWeather(seed) {
        const rng = Daily.makeRng(Daily.mixSeed(seed, 4271));
        // Spanning what the real forecasts actually do: 80-2990 m of mixing
        // layer across ten cities, median 765.
        return {
            blh: Math.round(300 + rng() * 2000),
            sunshine: Math.round((0.5 + rng() * 0.5) * 100) / 100,
            cloudLow: Math.round(rng() * 55),
            windMph: Math.round((3 + rng() * 14) * 10) / 10,
            windDeg: Math.floor(rng() * 360),
            tempF: 78,
            dewF: 48,
            cape: 0,
            source: 'synthetic'
        };
    }

    function resolveWeather(bundle, now, seed) {
        return extractConditions(bundle, now) || syntheticWeather(seed);
    }

    // ------------------------------------------------------------------
    // Flight
    // ------------------------------------------------------------------

    function makeWorld(seed, cond) {
        return { seed: seed, cond: cond, ground0: terrain(seed, 0), chunks: new Map() };
    }

    /**
     * Aerotow release, not a launch off a hill.
     *
     * Dropping the glider at a fixed height over whatever happened to be at x=0
     * was a coin flip on a wide-spacing day, and it handed out most of a
     * mediocre score for free. The tug drops you in the first thermal, which is
     * what actually happens and what makes every day open with a decision
     * instead of a search.
     */
    function createFlight(world) {
        // Spacing can exceed the chunk size, so chunk 0 is often empty - scan
        // forward until a column turns up rather than falling back to a
        // hand-made one over open ground.
        let first = null;
        for (let c = 0; c < 4 && !first; c++) {
            const found = thermalsInChunk(world.seed, world.cond, c)
                .filter(function (t) { return t.x > 200; });
            if (found.length) first = found[0];
        }
        if (!first) first = { x: 600, base: 100, top: 800, r: 150, strength: 1, id: 1 };
        const g = terrain(world.seed, first.x);
        const depth = Math.max(200, first.top - first.base);
        // Release just below the bottom of the ring stack: the first hoop has to
        // be reachable from the tow, or the opening climb has nothing in it.
        // 0.22 of the depth is inside the ramp where the lift is already strong,
        // and still below the first ring at 0.30. Releasing at the base itself
        // put the glider where the profile is exactly zero.
        const agl = Math.max(120, first.base + 0.22 * depth);
        // The column leans downwind with height, so releasing at the thermal's
        // ground position drops you hundreds of metres clear of the core.
        const x = first.x + thermalTilt(first, agl, world.cond.windAlong);
        const h = g + agl;
        return {
            x: x, x0: x, h: h, bank: 0, hold: false, t: 0,
            startAlt: h, climbTotal: 0, peakX: first.x, peakAlt: h, endAlt: h,
            alive: true, landed: false, w: 0, wAir: 0,
            taken: {}, chain: 0, chainAlt: 0, rings: 0, bestChain: 0
        };
    }


    /**
     * One fixed step. Returns a NEW state; never mutates its input.
     *
     * Hold banks the glider into a turn: it climbs wherever the air is rising
     * and gives up all of its forward speed to do it. Release rolls out and
     * cruises. That is the whole game, and the decision it creates is the one
     * real pilots fly - leave when your achieved climb drops below the average
     * climb you expect to find next.
     */
    function step(world, state, dt, fly) {
        const F = fly || FLY;
        if (!state.alive) return state;

        // Exactly timestep-invariant: bank(t) is a true exponential, so four
        // steps of dt/4 land on the same number as one step of dt. A linear
        // (target - bank) * RATE * dt does not, and the dt test catches it.
        const k = Math.pow(0.5, dt / F.ROLL_HALF);
        const bank = state.hold ? 1 - (1 - state.bank) * k : state.bank * k;

        const wAir = airVelocity(world, state.x, state.h);
        const sink = F.SINK_CRUISE + (F.SINK_CIRCLE - F.SINK_CRUISE) * bank;
        const dh = wAir - sink;
        /*
         * Forward speed, and the tracking term that makes circling mean
         * something.
         *
         * A column leans downwind with height. A glider that merely drifts with
         * the wind climbs out of its own thermal within a minute, because it
         * rises faster than the lean carries it sideways - and with no lateral
         * control it can never get back. That made every climb end in the same
         * place regardless of how well it was flown.
         *
         * Circling IS centring: a pilot follows the core. While banked the
         * glider tracks the lean of the column it is in, at exactly the rate the
         * geometry implies, d(tilt)/d(agl) = windAlong / strength.
         */
        let track = 0;
        if (bank > 0.05 && lastStrength > 0) {
            track = bank * (world.cond.windAlong / lastStrength) * Math.max(0, wAir - sink);
        }
        const vx = (F.V_CRUISE + world.cond.windAlong) * (1 - bank) + track;

        let x1 = state.x + vx * dt;
        let h1 = state.h + dh * dt;
        const t1 = state.t + dt;

        // Rings. A crossing test rather than a proximity one, so a ring counts
        // once however fast you pass it and whatever the timestep.
        let taken = state.taken;
        let chain = state.chain;
        let chainAlt = state.chainAlt;
        let rings = state.rings;
        let bonus = 0;
        if (chain > 0 && h1 < chainAlt - RING.DROP) chain = 0;

        // Two cheap rejects before the expensive work: a ring can only be
        // crossed if its altitude lies in the slice this step swept, and a
        // thermal can only matter if it is roughly overhead. Without them this
        // loop walks every ring of every nearby thermal 120 times a second.
        const loH = Math.min(state.h, h1);
        const hiH = Math.max(state.h, h1);
        const c = Math.floor(x1 / WORLD.CHUNK_M);
        for (let ci = c - 1; ci <= c + 1; ci++) {
            const ths = chunkCached(world, ci);
            for (let i = 0; i < ths.length; i++) {
                const th = ths[i];
                if (Math.abs(x1 - th.x) > th.r + RING.R + 620) continue;
                const mask = taken[th.id] || 0;
                if (mask === -1) continue;
                const rs = ringsFor(th);
                const ground = terrain(world.seed, th.x);
                for (let r = 0; r < rs.length; r++) {
                    if (mask & (1 << r)) continue;
                    const alt = ground + rs[r].agl;
                    if (alt < loH || alt > hiH) continue;
                    if (Math.abs(x1 - ringX(th, rs[r], world.cond.windAlong)) > RING.R) continue;
                    if (taken === state.taken) taken = Object.assign({}, taken);
                    taken[th.id] = (taken[th.id] || 0) | (1 << r);
                    chain += 1;
                    rings += 1;
                    chainAlt = alt;
                    bonus += RING.ALT * Math.min(RING.MAX_MULT, 1 + 0.25 * (chain - 1));
                }
            }
        }
        h1 += bonus;

        const ground = terrain(world.seed, x1);
        const landed = h1 <= ground;
        const alive = !landed && t1 < F.TIME_LIMIT;

        return {
            x: x1,
            x0: state.x0,
            h: landed ? ground : h1,
            bank: bank,
            hold: state.hold,
            t: t1,
            startAlt: state.startAlt,
            // Height the AIR gave you, plus ring bonuses, so the shared L/D
            // stays honest about what the flight actually consumed.
            climbTotal: state.climbTotal + (wAir > 0 ? wAir * dt : 0) + bonus,
            peakX: Math.max(state.peakX, x1),
            peakAlt: Math.max(state.peakAlt, h1),
            endAlt: landed ? ground : h1,
            alive: alive,
            landed: landed,
            w: dh,          // the GLIDER - what a vario reads
            wAir: wAir,     // the AIR    - what the columns are drawn from
            taken: taken,
            chain: chain,
            chainAlt: chainAlt,
            rings: rings,
            bestChain: Math.max(state.bestChain, chain)
        };
    }

    /** Run a whole flight under an autopilot. Deterministic; used by tests and tuning. */
    function simulate(world, policy, opts) {
        const o = opts || {};
        const dt = o.dt || FLY.DT;
        const cap = o.maxSteps || FLY.MAX_STEPS;
        let s = createFlight(world);
        const trace = [];
        let steps = 0;
        while (s.alive && steps < cap) {
            s = Object.assign({}, s, { hold: !!policy(s, s.wAir, world) });
            s = step(world, s, dt, o.fly);
            steps++;
            if (o.trace && steps % 30 === 0) trace.push({ x: s.x, h: s.h, w: s.w, wAir: s.wAir });
        }
        return { state: s, steps: steps, trace: trace, score: scoreFlight(s) };
    }

    // Slow down in lift, speed up in sink. This is the whole skill, and a bad
    // policy scoring far worse than this one is how we know the skill is real.
    // Autopilots. They reason about the AIR (wAir); the player reads the vario.
    function policyRelease() { return false; }          // never circle - the no-input baseline
    function policyHold() { return true; }              // always circle
    function policyGreedy(state, wAir) { return wAir > FLY.SINK_CIRCLE; }
    function policyBad(state, wAir) { return wAir < 0; }

    /**
     * Circle while the climb beats `mc`, but leave near the top of the column.
     *
     * The ceiling is not optional. Without it `mc` alone cannot express "leave
     * before the lift dies", and policyGreedy demonstrates why: circling
     * whenever the air rises finds a stable equilibrium at the top of the
     * column, where it climbs a few metres over several minutes and travels
     * almost nowhere. Naive play scores close to zero, which is the skill
     * gradient this game never had.
     */
    function policyMacCready(mc, ceilFrac) {
        return function (state, wAir, world) {
            const agl = state.h - terrain(world.seed, state.x);
            if (agl > ceilFrac * world.cond.cloudbase) return false;
            return (wAir - FLY.SINK_CIRCLE) > mc;
        };
    }

    function policyRidgeCircle(world) {
        return function (state, wAir) {
            const agl = state.h - terrain(world.seed, state.x);
            if (agl > 260) return wAir > FLY.SINK_CIRCLE;
            if (agl < 70) return wAir > 0;
            return wAir > FLY.SINK_CIRCLE * 0.6;
        };
    }

    // Kept so older callers and the harness keep working.
    const policyGood = policyGreedy;

    // ------------------------------------------------------------------
    // Scoring and sharing
    // ------------------------------------------------------------------

    function scoreFlight(state) {
        // Height the flight actually consumed: what it started with, plus what
        // the air gave it, less what it landed with.
        const consumed = state.startAlt + state.climbTotal - state.endAlt;
        return {
            distance: Math.round(Math.max(0, state.peakX - state.x0)),
            climb: Math.round(state.climbTotal),
            duration: Math.round(state.t),
            // How well you flew, as opposed to how good your day was. Nearly
            // invariant to thermal strength, which a raw distance is not.
            glide: consumed > 1
                ? Math.round((Math.max(0, state.peakX - state.x0) / consumed) * 10) / 10 : 0
        };
    }

    function formatDistance(m) {
        if (!isFinite(m)) return '0 m';
        return m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(1) + ' km';
    }

    const BARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

    /** The shape of the flight in ten cells - one grapheme each. */
    function altitudeSparkline(trace, cells) {
        const n = cells || 10;
        if (!trace || trace.length === 0) return BARS[0].repeat(n);
        let lo = Infinity, hi = -Infinity;
        for (let i = 0; i < trace.length; i++) {
            if (trace[i].h < lo) lo = trace[i].h;
            if (trace[i].h > hi) hi = trace[i].h;
        }
        const span = hi - lo;
        let out = '';
        for (let i = 0; i < n; i++) {
            const idx = Math.min(trace.length - 1,
                Math.floor(i * trace.length / n));
            const f = span > 0.5 ? (trace[idx].h - lo) / span : 0.5;
            out += BARS[clamp(Math.round(f * (BARS.length - 1)), 0, BARS.length - 1)];
        }
        return out;
    }

    function skyGlyph(cloudFrac) {
        if (cloudFrac < 0.15) return '☀️';
        if (cloudFrac <= 0.60) return '⛅';
        return '☁️';
    }

    function buildShare(result) {
        const windWord = result.windAlong > 1 ? 'tail' : (result.windAlong < -1 ? 'head' : 'cross');
        return [
            'THERMAL #' + result.day + ' — ' + formatDistance(result.distance),
            result.spark,
            'L/D ' + result.glide + ' · ☀ ' + Math.round(result.solar * 100) + '%' +
                ' · 🌬 ' + Math.round(result.windMph) + 'mph ' + windWord +
                ' · ' + skyGlyph(result.cloudFrac),
            'Streak ' + result.streak,
            'branyontech.com/thermal/'
        ].join('\n');
    }

    // ------------------------------------------------------------------
    // Persisted state
    // ------------------------------------------------------------------

    // v2: the flight model changed, so a carried-over `best` would be a record
    // set under different physics and would poison the personal-best on day one.
    const STORAGE_KEY = 'thermal.v2';

    const store = Daily.makeStore({
        version: 1,
        counters: { played: 0, best: 0 },
        dayFields: {
            dist: { kind: 'int', min: 0, required: true },
            glide: { kind: 'int', default: 0 },
            climb: { kind: 'int', default: 0 },
            dur: { kind: 'int', default: 0 },
            rings: { kind: 'int', default: 0 },
            chain: { kind: 'int', default: 0 },
            solar: { kind: 'int', default: 0 },
            wind: { kind: 'int', default: 0 },
            source: { kind: 'enum', values: ['live', 'synthetic'], default: 'synthetic' }
        },
        settings: {
            sound: { kind: 'bool', default: false },
            geo: { kind: 'enum', values: ['set', 'denied'], default: null }
        },
        bump: function (state, result) {
            return {
                played: state.played + 1,
                best: Math.max(state.best, result.dist || 0)
            };
        },
        maxDays: 30
    });

    // ------------------------------------------------------------------
    // Tuning harness - a hundred flights as text beats one in a browser
    // ------------------------------------------------------------------

    function flightToAscii(world, trace, cols, rows) {
        const w = cols || 78;
        const r = rows || 18;
        if (!trace.length) return '(no flight)';
        const maxX = trace[trace.length - 1].x;
        let lo = Infinity, hi = -Infinity;
        for (let i = 0; i < trace.length; i++) {
            const g = terrain(world.seed, trace[i].x);
            if (Math.min(trace[i].h, g) < lo) lo = Math.min(trace[i].h, g);
            if (trace[i].h > hi) hi = trace[i].h;
        }
        const grid = [];
        for (let y = 0; y < r; y++) grid.push(new Array(w).fill(' '));
        const rowFor = function (h) {
            return clamp(Math.round((1 - (h - lo) / Math.max(1, hi - lo)) * (r - 1)), 0, r - 1);
        };
        for (let c = 0; c < w; c++) {
            const x = (c / (w - 1)) * maxX;
            grid[rowFor(terrain(world.seed, x))][c] = '#';
        }
        for (let i = 0; i < trace.length; i++) {
            const c = clamp(Math.round((trace[i].x / Math.max(1, maxX)) * (w - 1)), 0, w - 1);
            grid[rowFor(trace[i].h)][c] = trace[i].wAir > 0.2 ? '+' : (trace[i].wAir < -0.2 ? 'v' : '-');
        }
        return grid.map(function (line) { return line.join(''); }).join('\n');
    }

    const Thermal = {
        FLY: FLY,
        WORLD: WORLD,
        CU_TABLE: CU_TABLE,
        STORAGE_KEY: STORAGE_KEY,
        MPH_TO_MPS: MPH_TO_MPS,

        seedForDay: function (day) { return Daily.seedForDay('thermal', day); },
        puzzleDay: Daily.puzzleDay,
        msUntilNextPuzzle: Daily.msUntilNextPuzzle,

        hash1: hash1,
        vnoise1: vnoise1,
        terrain: terrain,
        terrainSlope: terrainSlope,
        thermalsInChunk: thermalsInChunk,
        thermalsNear: thermalsNear,
        thermalW: thermalW,
        thermalTilt: thermalTilt,
        ringsFor: ringsFor,
        ringX: ringX,
        RING: RING,
        ridgeW: ridgeW,
        airVelocity: airVelocity,

        makeWorld: makeWorld,
        createFlight: createFlight,
        step: step,
        simulate: simulate,
        policyGood: policyGood,
        policyBad: policyBad,
        policyHold: policyHold,
        policyRelease: policyRelease,
        policyGreedy: policyGreedy,
        policyMacCready: policyMacCready,
        policyRidgeCircle: policyRidgeCircle,

        ambientSink: ambientSink,
        blhToWStar: blhToWStar,
        heatFlux: heatFlux,
        cloudFrequency: cloudFrequency,
        solarFactor: solarFactor,
        cloudbaseFrom: cloudbaseFrom,
        buildConditions: buildConditions,
        extractConditions: extractConditions,
        syntheticWeather: syntheticWeather,
        resolveWeather: resolveWeather,

        scoreFlight: scoreFlight,
        formatDistance: formatDistance,
        altitudeSparkline: altitudeSparkline,
        skyGlyph: skyGlyph,
        buildShare: buildShare,
        flightToAscii: flightToAscii,

        emptyState: store.emptyState,
        parseState: store.parseState,
        serializeState: store.serializeState,
        recordDaily: store.recordDaily
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Thermal;
    }
    if (root) {
        root.Thermal = Thermal;
    }
})(typeof window !== 'undefined' ? window : null);
