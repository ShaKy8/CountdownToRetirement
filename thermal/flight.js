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

        /*
         * Airspeed is the game.
         *
         * The button does not command height - it commands SPEED, and height
         * falls out of energy conservation. Hold slows you down and converts
         * speed into height; release speeds you up and spends height to get it.
         * That is what a glider's stick actually does, and it is the only
         * one-button control that keeps the world scrolling while you climb.
         *
         * V_HOLD is deliberately BELOW V_STALL. Holding does not settle at
         * min-sink, it drives you THROUGH min-sink into a stall in about three
         * seconds. Measured: with the hold target at min-sink instead, flying
         * always-slow tied the best terrain-aware policy exactly - the same
         * disease as the circling model, one constant input being optimal.
         * The stall is what makes the button a resource you pump.
         */
        V_HOLD: 18.0,
        V_FAST: 55.0,
        V_STALL: 21.0,
        // Asymmetric, and it has to be. You can haul back on the stick and
        // convert 30 m/s into height in a few seconds; you cannot bunt the same
        // energy back the other way without pulling negative g. Symmetric at
        // 1.1 s the push-over dumped 80 m in three seconds and every flight was
        // over in eleven.
        V_HALF_UP: 1.2,       // s, slowing down (pulling up)
        V_HALF_DN: 4.0,       // s, speeding up (pushing over)
        V_START: 38.0,        // on tow release

        // sink(v) = S0 + K(v-VM)^2 + C(v-VM)^3 + stall. Min sink 0.60 at 24 m/s,
        // best glide L/D 43 at 30, and 3.6 m/s of sink at 55 - so speed is real
        // and expensive, which is what makes the choice a choice.
        POLAR_S0: 0.60,
        POLAR_K: 0.0028,
        POLAR_C: 0.0000115,
        POLAR_VM: 24.0,
        STALL_K: 1.6,

        /*
         * Ridge lift, and it is now load-bearing rather than flavour.
         *
         * At decay 200 / gain 1.6 it paid about 1.6 m/s at 60 m AGL against
         * thermals worth 3-6, so the optimal play was to climb away and never
         * come back down - measured, a well-flown flight spent 23% of its time
         * below 100 m and the deck was aspirational.
         *
         * Concentrated low (decay 120) and made strong (gain 2.8), skimming a
         * windward face beats a mediocre thermal. It still nets to zero over
         * undulating terrain taken at one height - windward gain is lee loss -
         * but the glider now CHOOSES its height, so diving to the deck on the
         * upslope and climbing away over the crest is a real technique. That
         * asymmetry is the reward for flying dangerously low.
         */
        RIDGE_DECAY: 200,
        RIDGE_GAIN: 1.6,
        RIDGE_MAX: 4.0,
        WIND_ALONG_MAX: 12,

        // Low. The flight is meant to live at 40-120 m AGL, where the terrain
        // rises at 5-20 m/s in front of you and ridge lift actually pays.
        RELEASE_AGL: 290,
        // A two-minute flight, and roughly half of them end on the clock rather
        // than on the ground. At 480 s the ground always won first, which made
        // the timer decorative.
        TIME_LIMIT: 175,      // s of flight
        // 1.5, not 4. At constant 24-55 m/s, scale 4 is 100-220 m/s of
        // wall-clock ground speed - far too fast to thread terrain at 60 m AGL.
        TIME_SCALE: 1.35,
        MAX_STEPS: 120 * (175 + 60)
    };

    const WORLD = {
        BASE_ALT: 250,        // m, the terrain's mean
        CHUNK_M: 2000,
        OCTAVES: [[3200, 150], [900, 60], [260, 25], [80, 8]]   // [wavelength m, amplitude m]
    };

    /**
     * How far into a column the lift takes to come up, and how far from the top
     * it dies away. Used by the lift profile AND by the ring stack, so the two
     * cannot drift apart.
     *
     * Relative to the depth, because w/w* in the convective boundary layer is a
     * function of z/zi rather than of an absolute height - fixed 150/250 m ramps
     * overlapped on a shallow column and capped it at about half its strength.
     * But CAPPED in absolute metres too: a real thermal is working within a
     * couple of hundred metres of its base however deep it is, and uncapped a
     * 1650 m column had a 410 m dead zone at the bottom, which is exactly where
     * a glider that never stops moving forward arrives.
     */
    function ramps(th) {
        const depth = Math.max(200, th.top - th.base);
        return { in: Math.min(0.25 * depth, 220), out: Math.min(0.35 * depth, 320) };
    }

    /**
     * Sink rate in still air at airspeed v, m/s, positive down.
     *
     * A quadratic-plus-cubic polar about min-sink speed, which is the standard
     * shape, plus a stall term below V_STALL that grows as (deficit)^1.5. The
     * stall term is not decoration: it is the fail state, and it is what stops
     * "hold the button forever" from being a winning strategy.
     */
    function sinkAt(v, fly) {
        const F = fly || FLY;
        const d = v - F.POLAR_VM;
        let s = F.POLAR_S0 + F.POLAR_K * d * d;
        if (d > 0) s += F.POLAR_C * d * d * d;
        const stall = F.V_STALL - v;
        if (stall > 0) s += F.STALL_K * Math.pow(stall, 1.5);
        return s;
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
        const r = ramps(th);
        const a = clamp((agl - th.base) / r.in, 0, 1);
        const b = clamp((th.top - agl) / r.out, 0, 1);
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
        let bestW = 0;
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
                if (tw > bestW) bestW = tw;
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
        // 30 m, not 110. A glider that never stops moving forward crosses a
        // column in a few seconds and climbs tens of metres in it, not hundreds
        // - so a stack spaced for circling flight is unreachable content. At
        // 30 m a good pull-up through a core takes three or four rings, which
        // is a gate you thread rather than a ladder you park under.
        DH: 25,
        // The hoop's radius is the CORE's, floored and capped, not a constant.
        // A fixed 90 m was narrower than every core in the game, and a glider
        // doing 40 m/s crosses 90 m in two seconds - so it flew out the side of
        // the hoop halfway through the pull-up that was meant to thread it.
        R_MIN: 130,
        R_MAX: 260,
        R_FRAC: 0.95,
        JITTER: 0.15,   // fraction of the core radius the stack may wander
        ALT: 6,         // m of bonus height per ring at chain 1
        MAX_MULT: 3.0,
        // 60, not 40. One pull-up through a core gains about 80 m - three
        // rings - and the chain has to survive the short push-over between two
        // pull-ups in the SAME column, or nothing above three is reachable.
        DROP: 60
    };

    /** Deterministic from the thermal alone, memoised on it. */
    function ringsFor(th) {
        if (th.rings) return th.rings;
        const rng = Daily.makeRng(th.id);
        const r = ramps(th);
        // Starts just inside the ramp, where a glider arriving on a glide
        // actually is, and stops inside the upper one. Both bounds come from
        // the SAME ramps() the lift profile uses, which is what makes "every
        // ring sits where thermalW > 0" true by construction rather than by
        // coincidence - and that is the assertion the ring layer rests on.
        const lo = th.base + 0.55 * r.in;
        // The stack still grows with the day - a deep booming column is worth
        // more - but it stays inside the band a glider that never stops moving
        // forward can actually reach. A twenty-ring ladder to cloudbase would
        // be unreachable content, which is what the old 110 m spacing was.
        const span = Math.min(9, 3 + (th.top - th.base) / 320) * RING.DH;
        const hi = Math.min(th.top - 0.55 * r.out, lo + span);
        const n = Math.max(2, Math.min(10, Math.round((hi - lo) / RING.DH)));
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
    /** How wide the hoop is, in metres either side of its centre. */
    function ringRadius(th) {
        return clamp(RING.R_FRAC * th.r, RING.R_MIN, RING.R_MAX);
    }

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
        const agl = Math.max(120, Math.min(FLY.RELEASE_AGL, first.base + 0.22 * depth));
        // The column leans downwind with height, so releasing at the thermal's
        // ground position drops you hundreds of metres clear of the core.
        const x = first.x + thermalTilt(first, agl, world.cond.windAlong);
        const h = g + agl;
        return {
            x: x, x0: x, h: h, v: FLY.V_START, hold: false, t: 0,
            startAlt: h, climbTotal: 0, peakX: first.x, peakAlt: h, endAlt: h,
            alive: true, landed: false, w: 0, wAir: 0, stalled: false,
            taken: {}, chain: 0, chainAlt: 0, rings: 0, bestChain: 0
        };
    }


    /**
     * One fixed step. Returns a NEW state; never mutates its input.
     *
     * Hold pulls up: airspeed bleeds toward V_HOLD and the energy comes out as
     * height. Release pushes over: airspeed builds toward V_FAST and the energy
     * for it comes out of altitude. Total energy is conserved exactly - the
     * button only chooses how it is SPLIT - and the air adds or removes energy
     * through wAir, drag removes it through the polar.
     *
     * The decision this creates is the one real pilots fly: slow down in lift,
     * speed up in sink. But you cannot simply hold, because V_HOLD is below the
     * stall, and you cannot simply release, because 55 m/s costs 3.6 m/s of
     * sink. Neither extreme survives, which is the whole point.
     */
    function step(world, state, dt, fly) {
        const F = fly || FLY;
        if (!state.alive) return state;

        // Exactly timestep-invariant: v(t) is a true exponential, so four steps
        // of dt/4 land on the same number as one step of dt. A linear
        // (target - v) * RATE * dt does not, and the dt test catches it.
        const vTarget = state.hold ? F.V_HOLD : F.V_FAST;
        const k = Math.pow(0.5, dt / (state.hold ? F.V_HALF_UP : F.V_HALF_DN));
        const v1 = vTarget + (state.v - vTarget) * k;

        const wAir = airVelocity(world, state.x, state.h);
        const sink = sinkAt(state.v, F);

        /*
         * Total energy height, E = h + v^2/2g. The air and drag change E; the
         * button redistributes it. Solving for h1 rather than integrating a
         * climb rate is what makes the trade exact - a pull-up from 55 to 24
         * m/s returns all 125 m of it, no more and no less.
         */
        const E = state.h + state.v * state.v / (2 * F.G);
        const dh = wAir - sink;
        let h1 = E + dh * dt - v1 * v1 / (2 * F.G);

        // Ground speed. Never zero, so the world always scrolls and the glider
        // always translates on screen - the failure the circling model could not
        // avoid by construction.
        const vx = state.v + world.cond.windAlong;

        let x1 = state.x + vx * dt;
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
                if (Math.abs(x1 - th.x) > th.r + RING.R_MAX + 620) continue;
                const mask = taken[th.id] || 0;
                if (mask === -1) continue;
                const rs = ringsFor(th);
                const ground = terrain(world.seed, th.x);
                for (let r = 0; r < rs.length; r++) {
                    if (mask & (1 << r)) continue;
                    const alt = ground + rs[r].agl;
                    if (alt < loH || alt > hiH) continue;
                    if (Math.abs(x1 - ringX(th, rs[r], world.cond.windAlong)) > ringRadius(th)) continue;
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
            v: v1,
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
            // What a vario reads: the glider's own vertical speed, INCLUDING
            // the energy trade. Pulling up shows a big positive spike even in
            // dead air, which is correct and is what makes the move legible.
            w: (h1 - state.h) / dt,
            wAir: wAir,     // the AIR - what the columns are drawn from
            stalled: v1 < F.V_STALL,
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

    /*
     * Autopilots. They reason about the AIR (wAir); the player reads the vario.
     *
     * Every one of them has to respect the stall now, which is exactly the
     * constraint the player is under. A policy that just returns true flies into
     * the ground, which is why policyHold no longer wins on any row.
     */
    function policyRelease() { return false; }   // never touch it - the no-input baseline
    function policyHold() { return true; }       // hold forever - stalls, and dies

    /**
     * The naive player, and the error is a real one: they fly the VARIO.
     *
     * `state.w` includes the glider's own energy trade, so pulling up makes the
     * needle jump - which makes them pull up harder. It is a positive feedback
     * loop that ends in a stall, and it is the classic beginner mistake. They
     * only let go once the stall warning is actually sounding.
     *
     * Reasoning about wAir instead would not be naive at all: that is
     * MacCready-zero speed-to-fly, and it scores within 10% of skilled.
     */
    function policyGreedy(state) {
        if (state.v < FLY.V_STALL + 1) return false;
        return state.w > 0;
    }

    function policyBad(state, wAir) { return wAir < 0 && state.v > FLY.V_STALL + 3; }

    /**
     * MacCready speed-to-fly, plus the two things that keep a glider alive:
     * never stall, and trade speed for height when the ground is coming up.
     *
     * `mc` is the climb you expect to find next - hold (slow down) only when the
     * air here beats it. `vFloor` is how much airspeed the pilot insists on
     * keeping in hand, and `margin` how much clearance over the terrain ahead.
     * Which triple wins on a given day is itself diagnostic.
     */
    function policyMacCready(mc, vFloor, margin) {
        const vf = vFloor === undefined ? 28 : vFloor;
        const mg = margin === undefined ? 140 : margin;
        // The lookahead is memoised on a 50 m bucket. Walking six terrain
        // octaves 120 times a second made a tuning sweep take minutes; a pilot
        // looks up the valley every few seconds, not every 8 milliseconds.
        let bucket = -1, worst = -Infinity;
        return function (state, wAir, world) {
            if (state.v < vf) return false;              // recover / never stall
            const b = Math.floor(state.x / 50);
            if (b !== bucket) {
                bucket = b;
                worst = -Infinity;
                for (let d = 150; d <= 900; d += 150) {
                    const g = terrain(world.seed, state.x + d);
                    if (g > worst) worst = g;
                }
            }
            // Zoom: the ridge ahead is higher than we can glide over, so spend
            // speed on height now while there is still speed to spend.
            if (state.h < worst + mg && state.v > vf + 6) return true;
            // Hysteresis, or the threshold chatters at 120 Hz and the measured
            // input rate becomes meaningless.
            return wAir > mc + (state.hold ? -0.3 : 0.3);
        };
    }

    /**
     * Ridge running: stay on the deck where ridgeW pays. The only thing that
     * works on a day with no thermals at all, and the reason a dawn flight is
     * playable rather than a sled ride.
     */
    function policyRidgeRun(world) {
        return function (state, wAir) {
            if (state.v < 26) return false;
            const agl = state.h - terrain(world.seed, state.x);
            if (agl < 60) return true;
            return wAir > (agl > 220 ? 0.6 : 0.0);
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
    // v3. The energy model changes what a distance MEANS - a v2 best was flown
    // under a circling model with a different time scale and speed range, so
    // carrying it over would poison the personal-best event on day one.
    const STORAGE_KEY = 'thermal.v3';

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
        ringRadius: ringRadius,
        RING: RING,
        ridgeW: ridgeW,
        sinkAt: sinkAt,
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
        policyRidgeRun: policyRidgeRun,

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
