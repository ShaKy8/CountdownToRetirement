/**
 * Daily - the machinery every daily game on this site needs.
 *
 * Extracted from game/putt.js once a second daily game existed, so there is one
 * copy of the DST-safe local-date arithmetic, one copy of the Open-Meteo
 * interpolation with its null-safety, and one copy of the storage rebuild.
 *
 * Same shape as countdown/calc.js and game/putt.js: a classic script (not an ES
 * module) wrapped in an IIFE that attaches a global for the page and exports for
 * Node, so tests.js can require() the exact code the browser runs.
 *
 * Nothing in here touches document, localStorage, fetch, or a zero-argument
 * `new Date()`. Callers hand in "now".
 */
(function (root) {
    'use strict';

    function clamp(v, lo, hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    // ------------------------------------------------------------------
    // Time and seeding
    // ------------------------------------------------------------------

    // The puzzle is keyed to the player's LOCAL CALENDAR DATE, so it rolls over
    // at local midnight - as Wordle does.
    //
    // Note this still gives everyone the same puzzle, because the seed comes
    // from the date itself (2026-09-07) and not from an instant: two people both
    // playing their own Sep 7 derive the same seed, even though Tokyo starts
    // sixteen hours before Los Angeles. The puzzle number travels with the date,
    // so "#249" is never ambiguous either.
    const EPOCH_UTC_MS = Date.UTC(2026, 0, 1);
    const DAY_MS = 86400000;

    /**
     * Days from the epoch to the local calendar date `now` falls on.
     *
     * Date.UTC() of the LOCAL y/m/d normalises each date to a UTC midnight
     * instant, so the subtraction is exact whole days regardless of the player's
     * offset - and immune to DST, which would otherwise make some days 23 or 25
     * hours long and drift the count.
     */
    function puzzleDay(now) {
        const localMidnightUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        return Math.round((localMidnightUTC - EPOCH_UTC_MS) / DAY_MS);
    }

    function puzzleDateKey(day) {
        const d = new Date(EPOCH_UTC_MS + day * DAY_MS);
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        return d.getUTCFullYear() + '-' + m + '-' + dd;
    }

    /**
     * Milliseconds until the next LOCAL midnight. Built from local date parts
     * rather than by adding 24h, so the clocks-change days are still right.
     */
    function msUntilNextPuzzle(now) {
        const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
        return next.getTime() - now.getTime();
    }

    /** xmur3 string hash - spreads a short string into a well-mixed uint32. */
    function hashSeed(str) {
        let h = 1779033703 ^ String(str).length;
        for (let i = 0; i < String(str).length; i++) {
            h = Math.imul(h ^ String(str).charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
        }
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^ (h >>> 16)) >>> 0;
    }

    /**
     * A game's seed for a given day. The prefix keeps two games on the same date
     * from sharing a seed - and it is part of every puzzle ever generated, so it
     * is as frozen as the PRNG below.
     */
    function seedForDay(prefix, day) {
        return hashSeed(prefix + ':' + day);
    }

    /**
     * mulberry32. LOCKED BY TEST: changing this rewrites every puzzle that has
     * ever been played and invalidates every share string ever posted. If it
     * must change, that is a new storage epoch, not an edit.
     */
    function makeRng(seed) {
        let a = seed >>> 0;
        return function () {
            a = (a + 0x6d2b79f5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), 1 | t);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function rngInt(rng, min, max) {
        return min + Math.floor(rng() * (max - min + 1));
    }

    /** Uniform in [min,max], snapped to `step`. */
    function rngRange(rng, min, max, step) {
        const v = min + rng() * (max - min);
        const s = step || 0.5;
        return Math.round(v / s) * s;
    }

    function mixSeed(seed, salt) {
        return (seed ^ Math.imul(salt + 1, 0x9e3779b9)) >>> 0;
    }

    // ------------------------------------------------------------------
    // Sampling the weather API
    // ------------------------------------------------------------------

    const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

    function compassFromDegrees(deg) {
        const d = ((Number(deg) % 360) + 360) % 360;
        return COMPASS[Math.round(d / 22.5) % 16];
    }

    function formatWind(spec) {
        if (!spec) return 'calm';
        return Math.round(spec.mph) + ' mph ' + compassFromDegrees(spec.deg);
    }

    // Strict on purpose. Number(null) and Number('') are both 0, so a coercing
    // check would turn a dropped upstream field into a confident "0" rather than
    // falling back. Open-Meteo sends real JSON numbers.
    function num(v) {
        return typeof v === 'number' && isFinite(v) ? v : null;
    }

    /**
     * Interpolate named hourly series from an /api/bundle payload at `now`.
     *
     * `spec` maps each series name to a mode: 'linear', 'angle' (interpolated
     * the short way around the circle), or either with a trailing '?' to mark it
     * optional. Returns `{ at, values }`, or null - never throws - for every
     * malformed shape, so callers have no error path.
     *
     * Reads hourly, never `current`: weather/js/state.js:298-306 documents
     * `current` as the noisy current step of a 15-minute model series.
     */
    function sampleHourly(bundle, now, spec) {
        if (!bundle || typeof bundle !== 'object' || Array.isArray(bundle)) return null;
        const fc = bundle.forecast;
        if (!fc || typeof fc !== 'object' || fc.ok !== true || !fc.data) return null;
        const d = fc.data;
        const h = d.hourly;
        if (!h || typeof h !== 'object') return null;
        const times = h.time;
        if (!Array.isArray(times) || times.length === 0) return null;

        const names = Object.keys(spec);
        const series = {};
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const optional = spec[name].charAt(spec[name].length - 1) === '?';
            const arr = h[name];
            if (!Array.isArray(arr) || arr.length !== times.length) {
                if (optional) { series[name] = null; continue; }
                return null;
            }
            series[name] = arr;
        }

        // Open-Meteo returns local wall-clock strings; convert as
        // weather/js/state.js:22 does.
        const offset = isFinite(Number(d.utc_offset_seconds)) ? Number(d.utc_offset_seconds) : 0;
        const at = now.getTime();
        const stamp = function (i) {
            const t = Date.parse(times[i] + 'Z');
            return isFinite(t) ? t - offset * 1000 : NaN;
        };

        const first = stamp(0);
        const last = stamp(times.length - 1);
        if (!isFinite(first) || !isFinite(last)) return null;

        let i0 = 0, i1 = 0, frac = 0;
        if (at <= first) {
            i0 = i1 = 0;
        } else if (at >= last) {
            i0 = i1 = times.length - 1;
        } else {
            for (let i = 0; i < times.length - 1; i++) {
                const a = stamp(i), b = stamp(i + 1);
                if (!isFinite(a) || !isFinite(b)) continue;
                if (at >= a && at <= b) {
                    i0 = i; i1 = i + 1;
                    frac = b === a ? 0 : (at - a) / (b - a);
                    break;
                }
            }
        }

        const values = {};
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const mode = spec[name];
            const optional = mode.charAt(mode.length - 1) === '?';
            const arr = series[name];
            if (arr === null) { values[name] = undefined; continue; }
            const v0 = num(arr[i0]), v1 = num(arr[i1]);
            if (v0 === null || v1 === null) {
                if (optional) { values[name] = undefined; continue; }
                return null;
            }
            if (mode.indexOf('angle') === 0) {
                // Interpolate the SHORT way around the circle. Averaging 350 and
                // 10 arithmetically gives 180 - exactly backwards, and invisible
                // except as something drifting the wrong way.
                const delta = ((v1 - v0 + 540) % 360) - 180;
                values[name] = ((v0 + delta * frac) % 360 + 360) % 360;
            } else {
                values[name] = v0 + (v1 - v0) * frac;
            }
        }
        return { at: at, values: values };
    }

    function clampWind(spec, maxMph) {
        if (!spec || typeof spec !== 'object') return null;
        const cap = isFinite(Number(maxMph)) ? Number(maxMph) : 45;
        const mph = Number(spec.mph);
        const deg = Number(spec.deg);
        if (!isFinite(mph) || !isFinite(deg)) return null;
        const m = clamp(mph, 0, cap);
        const g = isFinite(Number(spec.gustMph)) ? clamp(Number(spec.gustMph), 0, cap + 15) : m;
        const out = {
            mph: m,
            deg: ((deg % 360) + 360) % 360,
            gustMph: Math.max(m, g),
            source: spec.source || 'live'
        };
        if (spec.at !== undefined) out.at = spec.at;
        return out;
    }

    function syntheticWind(seed) {
        const rng = makeRng(mixSeed(seed, 977));
        const mph = Math.round((3 + rng() * 15) * 10) / 10;
        const deg = Math.floor(rng() * 360);
        const gust = Math.round((mph + rng() * 6) * 10) / 10;
        return { mph: mph, deg: deg, gustMph: gust, source: 'synthetic' };
    }

    function extractWind(bundle, now, maxMph) {
        const s = sampleHourly(bundle, now, {
            wind_speed_10m: 'linear',
            wind_direction_10m: 'angle',
            wind_gusts_10m: 'linear?'
        });
        if (!s) return null;
        const mph = s.values.wind_speed_10m;
        const gust = s.values.wind_gusts_10m === undefined ? mph : s.values.wind_gusts_10m;
        return clampWind({
            mph: mph, deg: s.values.wind_direction_10m,
            gustMph: gust, source: 'live', at: s.at
        }, maxMph);
    }

    function resolveWind(bundle, now, seed, maxMph) {
        return extractWind(bundle, now, maxMph) || syntheticWind(seed);
    }

    // ------------------------------------------------------------------
    // Persisted state
    // ------------------------------------------------------------------

    function intOr(v, fallback) {
        const n = Number(v);
        return isFinite(n) ? Math.floor(n) : fallback;
    }

    /**
     * A storage store for one daily game, built from a field schema.
     *
     * The schema drives a rebuild field by field, which is what keeps the
     * security property generic: parseState never returns the blob it parsed, so
     * a corrupt or hostile value cannot reach the game. Anything unexpected
     * degrades to emptyState() - the game plays, only history is lost.
     *
     * Key insertion order here is the key order of the serialised JSON, and the
     * golden hashes in tests.js pin it. Reorder the schema and they fail, which
     * is the intent.
     */
    function makeStore(schema) {
        const counterNames = Object.keys(schema.counters || {});
        const dayNames = Object.keys(schema.dayFields || {});
        const settingNames = Object.keys(schema.settings || {});
        const maxDays = schema.maxDays || 30;

        function emptyState() {
            const s = { v: schema.version, lastDay: null, days: {}, streak: 0, bestStreak: 0 };
            counterNames.forEach(function (n) { s[n] = schema.counters[n]; });
            s.settings = {};
            settingNames.forEach(function (n) {
                const f = schema.settings[n];
                s.settings[n] = f.default === undefined ? (f.kind === 'bool' ? false : null) : f.default;
            });
            return s;
        }

        function readDay(d) {
            if (!d || typeof d !== 'object') return null;
            const out = {};
            for (let i = 0; i < dayNames.length; i++) {
                const name = dayNames[i];
                const f = schema.dayFields[name];
                if (f.kind === 'int') {
                    const v = intOr(d[name], null);
                    if (v === null || (f.min !== undefined && v < f.min)) {
                        if (f.required) return null;
                        out[name] = f.default === undefined ? 0 : f.default;
                    } else {
                        out[name] = v;
                    }
                } else if (f.kind === 'num') {
                    out[name] = isFinite(Number(d[name])) ? Number(d[name])
                        : (f.default === undefined ? 0 : f.default);
                } else if (f.kind === 'enum') {
                    out[name] = f.values.indexOf(d[name]) >= 0 ? d[name] : f.default;
                } else {
                    out[name] = d[name] === true;
                }
            }
            return out;
        }

        function parseState(raw) {
            let o;
            try {
                o = JSON.parse(raw);
            } catch (e) {
                return emptyState();
            }
            if (!o || typeof o !== 'object' || Array.isArray(o)) return emptyState();
            if (o.v !== schema.version) return emptyState();

            const out = emptyState();
            out.lastDay = o.lastDay === null || o.lastDay === undefined ? null : intOr(o.lastDay, null);
            out.streak = Math.max(0, intOr(o.streak, 0));
            out.bestStreak = Math.max(0, intOr(o.bestStreak, 0));
            counterNames.forEach(function (n) {
                out[n] = Math.max(0, intOr(o[n], schema.counters[n]));
            });

            if (o.days && typeof o.days === 'object' && !Array.isArray(o.days)) {
                const keys = Object.keys(o.days);
                for (let i = 0; i < keys.length; i++) {
                    const k = keys[i];
                    // A stored blob is attacker-controlled in the sense that
                    // anything with access to the origin can write localStorage.
                    // `out.days[k] = ...` with k === '__proto__' does not add a
                    // key - it reassigns the object's prototype, so later lookups
                    // return values that were never stored. JSON.parse creates a
                    // real own '__proto__' property, unlike an object literal.
                    if (k === '__proto__') continue;
                    const day = readDay(o.days[k]);
                    if (day) out.days[k] = day;
                }
            }
            if (o.settings && typeof o.settings === 'object' && !Array.isArray(o.settings)) {
                settingNames.forEach(function (n) {
                    const f = schema.settings[n];
                    if (f.kind === 'bool') {
                        out.settings[n] = o.settings[n] === true;
                    } else {
                        out.settings[n] = f.values.indexOf(o.settings[n]) >= 0
                            ? o.settings[n]
                            : (f.default === undefined ? null : f.default);
                    }
                });
            }
            return out;
        }

        function serializeState(state) {
            return JSON.stringify(state);
        }

        /**
         * Idempotent per day, and a no-op for any day at or before lastDay. That
         * is what makes "the first attempt is the one that counts" a property of
         * the data rather than a rule the UI has to remember.
         */
        function recordDaily(state, day, result) {
            const key = String(day);
            if (Object.prototype.hasOwnProperty.call(state.days, key)) return state;
            if (state.lastDay !== null && day <= state.lastDay) return state;

            const next = { v: schema.version, lastDay: day, days: {} };
            next.streak = state.lastDay !== null && day === state.lastDay + 1 ? state.streak + 1 : 1;
            next.bestStreak = state.bestStreak;
            const bumped = schema.bump ? schema.bump(state, result) : {};
            counterNames.forEach(function (n) {
                next[n] = bumped[n] !== undefined ? bumped[n] : state[n];
            });
            next.settings = {};
            settingNames.forEach(function (n) { next.settings[n] = state.settings[n]; });

            const keys = Object.keys(state.days);
            for (let i = 0; i < keys.length; i++) next.days[keys[i]] = state.days[keys[i]];
            next.days[key] = readDay(result) || readDay({});
            next.bestStreak = Math.max(next.bestStreak, next.streak);

            const all = Object.keys(next.days).map(Number).sort(function (a, b) { return a - b; });
            while (all.length > maxDays) {
                delete next.days[String(all.shift())];
            }
            return next;
        }

        return {
            emptyState: emptyState,
            parseState: parseState,
            serializeState: serializeState,
            recordDaily: recordDaily
        };
    }

    const Daily = {
        EPOCH_UTC_MS: EPOCH_UTC_MS,
        DAY_MS: DAY_MS,
        COMPASS: COMPASS,

        clamp: clamp,
        puzzleDay: puzzleDay,
        puzzleDateKey: puzzleDateKey,
        msUntilNextPuzzle: msUntilNextPuzzle,
        hashSeed: hashSeed,
        seedForDay: seedForDay,
        makeRng: makeRng,
        rngInt: rngInt,
        rngRange: rngRange,
        mixSeed: mixSeed,

        compassFromDegrees: compassFromDegrees,
        formatWind: formatWind,
        sampleHourly: sampleHourly,
        clampWind: clampWind,
        syntheticWind: syntheticWind,
        extractWind: extractWind,
        resolveWind: resolveWind,

        makeStore: makeStore
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Daily;
    }
    if (root) {
        root.Daily = Daily;
    }
})(typeof window !== 'undefined' ? window : null);
