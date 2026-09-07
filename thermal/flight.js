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
        V_STALL: 13.0,        // m/s
        V_SOAR: 18.0,         // min-sink speed - the release target
        V_DIVE: 30.0,         // the hold target - cruise, not a dive
        W_MINSINK: 0.55,      // m/s sink at V_SOAR
        POLAR_K: 0.0030,      // parabolic polar curvature
        K_PITCH: 0.90,        // 1/s pitch response
        A_MAX: 8.0,           // m/s^2 - about 0.8g, so 42->18 is not instant
        STALL_W: 0.50,        // extra sink per (m/s below stall)^2
        STALL_RECOVER: 6.0,   // m/s^2 nose-down authority while stalled
        // 300 m is close to a floor, not a free choice: thermal lift ramps in
        // over the first 150 m above its base, so a lower launch never reaches
        // usable air and every flight collapses to a 40-second sled ride.
        START_ALT: 300,       // m above the launch point
        RIDGE_DECAY: 200,     // m e-folding height for ridge lift
        RIDGE_GAIN: 1.6,      // streamline compression over a crest
        RIDGE_MAX: 4.0,       // m/s
        WIND_ALONG_MAX: 15,   // m/s
        BALANCE: 0.90,        // tunes how lossy the day is to a passive pilot
        TIME_LIMIT: 1200,      // s of flight - the task is distance in fixed time
        TIME_SCALE: 6,        // sim seconds per wall-clock second (renderer only)
        MAX_STEPS: 120 * (1200 + 120)  // the clock ends flights; this only catches runaways
    };

    const WORLD = {
        BASE_ALT: 250,        // m, the terrain's mean
        CHUNK_M: 2000,
        OCTAVES: [[3200, 150], [900, 60], [260, 25], [80, 8]]   // [wavelength m, amplitude m]
    };

    /**
     * Sink rate at a given airspeed - a parabolic glider polar.
     *
     * Best glide falls out as sqrt(V_SOAR^2 + W_MINSINK/POLAR_K) = 19.5 m/s at
     * about 34:1, which is a real and aspirational machine. Tests pin both.
     */
    function sink(v, fly) {
        const F = fly || FLY;
        let w = F.W_MINSINK + F.POLAR_K * (v - F.V_SOAR) * (v - F.V_SOAR);
        if (v < F.V_STALL) w += F.STALL_W * (F.V_STALL - v) * (F.V_STALL - v);
        return w;
    }

    function bestGlideSpeed(fly) {
        const F = fly || FLY;
        return Math.sqrt(F.V_SOAR * F.V_SOAR + F.W_MINSINK / F.POLAR_K);
    }

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
        while (px < start + WORLD.CHUNK_M) {
            out.push({
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
    function thermalW(th, x, h, windAlong, ground) {
        const agl = h - ground;
        if (agl < 0) return 0;
        const tilt = clamp(windAlong * (agl - th.base) / Math.max(1, th.strength), -600, 600);
        const q = Math.abs((x - (th.x + tilt)) / th.r);
        if (q >= 2) return 0;
        let shape;
        if (q <= 1) {
            shape = 1 - q * q;
        } else {
            shape = -0.35 * (1 - (q - 1.5) * (q - 1.5) * 4);
        }
        const a = clamp((agl - th.base) / 150, 0, 1);
        const b = clamp((th.top - agl) / 250, 0, 1);
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

    function airVelocity(world, x, h) {
        const ground = terrain(world.seed, x);
        // Air that is not rising is sinking - the compensating downdraft around
        // every thermal. This is what makes altitude a budget rather than a
        // gift, and it is why flying well matters.
        let w = -world.cond.ambient;
        w += ridgeW(world.seed, x, h, world.cond.windAlong);
        const c = Math.floor(x / WORLD.CHUNK_M);
        for (let k = c - 1; k <= c + 1; k++) {
            const ths = chunkCached(world, k);
            for (let i = 0; i < ths.length; i++) {
                w += thermalW(ths[i], x, h, world.cond.windAlong, ground);
            }
        }
        return w;
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
        return clamp(0.62 * (Math.cbrt(zi * f) - 3.1), 0.6, 6.0);
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
     * This was first derived from mass continuity (thermals covering fraction f
     * and rising at meanW force the rest to sink meanW*f/(1-f)). That is sound
     * meteorology and a bad game: the formula diverges as f grows, so widening
     * the lift enough to be dolphin-soarable also made the sink between it
     * enormous, and every flight ended in two kilometres. It is kept mild and
     * only mildly solar-scaled instead - a strong day is rougher, but not
     * self-defeatingly so.
     */
    function ambientSink(solar) {
        return 0.25 * (0.6 + 0.4 * clamp(solar, 0, 1));
    }

    function buildConditions(raw, sunAltRad, course) {
        const solar = solarFactor(sunAltRad);
        const flux = heatFlux(solar, raw.sunshine);
        const blh = typeof raw.blh === 'number' && isFinite(raw.blh) ? raw.blh : 700;
        const wStar = blhToWStar(blh, flux);
        const cloudFrac = clamp((typeof raw.cloudLow === 'number' && isFinite(raw.cloudLow)
            ? raw.cloudLow : 0) / 100, 0, 1);
        /*
         * Thermals sit roughly two boundary-layer depths apart and are about a
         * fifth of that across - both real results, and together they mean a
         * glider crossing them in a straight line is in lift about 15% of the
         * time whatever the day. That is survivable if you can circle. This
         * glider cannot, so on its own it makes every day equally unflyable,
         * which is exactly what the first real-weather sweep measured.
         *
         * What makes straight-line soaring work in reality is ORGANISATION: on a
         * deep day with some wind, thermals line up into streets, and a pilot
         * flies along one for tens of kilometres barely turning. That is the
         * mechanic this game is actually about, so it is modelled directly -
         * deep mixing plus moderate wind lines the lift up, which draws the
         * spacing in and stretches the cores until they nearly join.
         */
        const windMpsRaw = Math.max(0, (typeof raw.windMph === 'number' && isFinite(raw.windMph)
            ? raw.windMph : 0)) * MPH_TO_MPS;
        const street = clamp((blh - 250) / 900, 0, 1) * clamp((windMpsRaw - 0.8) / 3.5, 0, 1);
        const base = clamp(2.0 * blh, 700, 2600) / Math.max(0.25, cloudFrequency(cloudFrac));
        const spacing = base * (1 - 0.78 * street);
        const windMps = Math.max(0, (typeof raw.windMph === 'number' && isFinite(raw.windMph)
            ? raw.windMph : 0)) * MPH_TO_MPS;
        const windToward = (((typeof raw.windDeg === 'number' && isFinite(raw.windDeg)
            ? raw.windDeg : 0) + 180) % 360) * Math.PI / 180;
        return {
            wStar: wStar,
            wStarEff: wStar,
            solar: solar,
            flux: flux,
            blh: blh,
            street: street,
            cloudFrac: cloudFrac,
            thermalSpacing: spacing,
            // Thermal diameter is about a fifth of the mixing depth; a street
            // is far longer than it is wide, so along-track it reads as a much
            // broader band of lift.
            coreRadius: clamp(0.10 * blh, 90, 320) * (1 + 1.6 * street),
            cloudbase: cloudbaseFrom(raw.tempF, raw.dewF, blh),
            ambient: ambientSink(solar),
            windMps: windMps,
            windToward: windToward,
            windAlong: clamp(windMps * Math.cos(windToward - course),
                -FLY.WIND_ALONG_MAX, FLY.WIND_ALONG_MAX),
            source: raw.source === 'live' ? 'live' : 'synthetic'
        };
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

    function createFlight(world) {
        const h = world.ground0 + FLY.START_ALT;
        return {
            x: 0, h: h, v: FLY.V_SOAR + 4, hold: false, stalled: false, t: 0,
            startAlt: h, climbTotal: 0, peakAlt: h, endAlt: h, alive: true, landed: false, w: 0
        };
    }

    /**
     * One fixed step. Returns a NEW state; never mutates its input.
     *
     * The button adds no energy - it chooses how total energy E = h + v^2/2g is
     * split between height and speed. Release and dv < 0, so -(v/g)dv > 0 and
     * the lost airspeed reappears as a zoom climb. Using the MIDPOINT velocity
     * in that term makes the split exactly energy-conserving rather than nearly
     * so, which is what lets a test assert it instead of tolerating it.
     */
    function step(world, state, dt, fly) {
        const F = fly || FLY;
        if (!state.alive) return state;

        const v0 = state.v;
        let dv = clamp(F.K_PITCH * ((state.hold ? F.V_DIVE : F.V_SOAR) - v0), -F.A_MAX, F.A_MAX);
        let stalled = false;
        if (v0 < F.V_STALL) {
            // The nose drops whatever the player is asking for.
            stalled = true;
            dv = F.STALL_RECOVER;
        }

        const wAir = airVelocity(world, state.x, state.h);
        const dEdt = wAir - sink(v0, F);
        const vMid = v0 + 0.5 * dv * dt;
        const dh = dEdt - (vMid / F.G) * dv;

        const v1 = Math.max(1, v0 + dv * dt);
        const vz = dh;
        const vh = Math.sqrt(Math.max(0, v0 * v0 - vz * vz));
        const x1 = state.x + (vh + world.cond.windAlong) * dt;
        const h1 = state.h + dh * dt;

        const ground = terrain(world.seed, x1);
        const t1 = state.t + dt;
        // Two ways to finish. Without the clock, "fly as far as you can" is
        // solved by always flying best glide and the button is decorative;
        // with it, distance becomes cross-country SPEED, which is the number
        // real pilots actually chase and the reason to dolphin-soar.
        const alive = h1 > ground && t1 < F.TIME_LIMIT;
        const landed = h1 <= ground;

        return {
            x: x1,
            h: landed ? ground : h1,
            v: v1,
            hold: state.hold,
            stalled: stalled,
            t: t1,
            startAlt: state.startAlt,
            climbTotal: state.climbTotal + (wAir > 0 ? wAir * dt : 0),
            peakAlt: Math.max(state.peakAlt, h1),
            endAlt: landed ? ground : h1,
            alive: alive,
            landed: landed,
            w: wAir
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
            s = Object.assign({}, s, { hold: !!policy(s, s.w, world) });
            s = step(world, s, dt, o.fly);
            steps++;
            if (o.trace && steps % 30 === 0) trace.push({ x: s.x, h: s.h, v: s.v, w: s.w });
        }
        return { state: s, steps: steps, trace: trace, score: scoreFlight(s) };
    }

    // Slow down in lift, speed up in sink. This is the whole skill, and a bad
    // policy scoring far worse than this one is how we know the skill is real.
    function policyGood(state, w) { return w <= 0; }
    function policyBad(state, w) { return w > 0; }
    function policyHold(state) { return true; }
    function policyRelease(state) { return false; }

    /**
     * A ridge runner: get down to the slope and stay there.
     *
     * Measured, this LOSES to simply drifting on a shallow day, and the reason
     * is structural rather than a tuning miss. Ridge lift is wind times slope,
     * so it is positive on every windward face and equally negative on every
     * lee face; a glider crossing undulating ground in one direction nets zero.
     * Real ridge soaring works because the pilot beats back and forth along a
     * single face, which this one-directional glider cannot do.
     *
     * Ridge lift therefore earns its place as local texture - a windward slope
     * is a genuine boost and a lee slope a genuine cost, so the ground is worth
     * reading - and not as a way to save a dead day. Kept as a policy because
     * it is what proved that.
     */
    function policyRidge(world) {
        return function (state, w) {
            const agl = state.h - terrain(world.seed, state.x);
            if (agl > 160) return true;       // dive down to the band
            if (agl < 70) return false;       // too low, hold what height there is
            return w <= 0;                     // in the band, dolphin it
        };
    }

    // ------------------------------------------------------------------
    // Scoring and sharing
    // ------------------------------------------------------------------

    function scoreFlight(state) {
        // Height the flight actually consumed: what it started with, plus what
        // the air gave it, less what it landed with.
        const consumed = state.startAlt + state.climbTotal - state.endAlt;
        return {
            distance: Math.round(state.x),
            climb: Math.round(state.climbTotal),
            duration: Math.round(state.t),
            // How well you flew, as opposed to how good your day was. Nearly
            // invariant to thermal strength, which a raw distance is not.
            glide: consumed > 1 ? Math.round((state.x / consumed) * 10) / 10 : 0
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

    const STORAGE_KEY = 'thermal.v1';

    const store = Daily.makeStore({
        version: 1,
        counters: { played: 0, best: 0 },
        dayFields: {
            dist: { kind: 'int', min: 0, required: true },
            glide: { kind: 'int', default: 0 },
            climb: { kind: 'int', default: 0 },
            dur: { kind: 'int', default: 0 },
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
            grid[rowFor(trace[i].h)][c] = trace[i].w > 0.2 ? '+' : (trace[i].w < -0.2 ? 'v' : '-');
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
        ridgeW: ridgeW,
        airVelocity: airVelocity,

        sink: sink,
        bestGlideSpeed: bestGlideSpeed,
        makeWorld: makeWorld,
        createFlight: createFlight,
        step: step,
        simulate: simulate,
        policyGood: policyGood,
        policyBad: policyBad,
        policyHold: policyHold,
        policyRelease: policyRelease,
        policyRidge: policyRidge,

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
