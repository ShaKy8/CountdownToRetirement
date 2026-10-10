/*
 * LIGHT LASSO: deterministic rules, with no DOM, storage, or network access.
 * The board is always 720 x 820. Time advances in 1/120-second ticks; a step
 * accepts at most 0.25 seconds, so a suspended tab cannot consume a whole run.
 * The caller pauses hidden tabs and sets state.drawing during an active loop.
 * Drawing never slows motion, but it defers every spawn. Newborn lights and
 * embers have visible, harmless entrance periods of 0.3 and 0.6 seconds.
 *
 * Release closes the loop. Centers on its edge are inside. Self-crossings,
 * tiny loops, excessive string, and malformed strokes do nothing. A valid
 * empty loop or any active ember resets the combo, never the score. Clean
 * catches within four seconds build 1x, 2x, then 3x; score is 10*n*n*combo.
 * Preview and release use exactly the same geometry and eligibility rules.
 */
(function (root) {
    'use strict';

    const WIDTH = 720, HEIGHT = 820, DURATION = 75;
    const FIXED_DT = 1 / 120, MAX_DT = 0.25, MAX_PERIMETER = 1000;
    const MIN_AREA = 500, MAX_POINTS = 512, COMBO_WINDOW = 4, CLOSE_TOLERANCE = 18;
    const LIGHT_COUNT = 20, MAX_EMBERS = 6, SPAWN_GAP = 18;
    const LIGHT_WARMUP = 0.3, EMBER_WARMUP = 0.6;
    const EPS = 1e-7, MAX_STORED_SCORE = 9999999;

    function hashSeed(value) {
        if (typeof value === 'number' && Number.isFinite(value)) return value >>> 0;
        const text = typeof value === 'string' ? value : 'light-lasso';
        let hash = 2166136261;
        for (let i = 0; i < text.length; i++) {
            hash = Math.imul(hash ^ text.charCodeAt(i), 16777619) >>> 0;
        }
        return hash;
    }

    function random(state) {
        let x = state._rng;
        x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
        state._rng = x >>> 0;
        return state._rng / 4294967296;
    }

    function finitePoint(point) {
        return point !== null && typeof point === 'object' &&
            Number.isFinite(point.x) && Number.isFinite(point.y);
    }

    function distance(a, b) {
        const dx = a.x - b.x, dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function pathLength(points) {
        if (!Array.isArray(points) || points.length > MAX_POINTS || !points.every(finitePoint)) return Infinity;
        if (points.length < 2) return 0;
        let length = 0;
        for (let i = 0; i < points.length; i++) length += distance(points[i], points[(i + 1) % points.length]);
        return length;
    }

    function area(points) {
        if (!Array.isArray(points) || points.length < 3 || points.length > MAX_POINTS || !points.every(finitePoint)) return 0;
        let twice = 0;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            twice += points[j].x * points[i].y - points[i].x * points[j].y;
        }
        return Math.abs(twice) / 2;
    }

    function cross(a, b, c) {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    }

    function onSegment(point, a, b) {
        return Math.abs(cross(a, b, point)) <= EPS &&
            point.x >= Math.min(a.x, b.x) - EPS && point.x <= Math.max(a.x, b.x) + EPS &&
            point.y >= Math.min(a.y, b.y) - EPS && point.y <= Math.max(a.y, b.y) + EPS;
    }

    function pointInPolygon(point, points) {
        if (!finitePoint(point) || !Array.isArray(points) || points.length < 3 ||
            points.length > MAX_POINTS || !points.every(finitePoint)) return false;
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const a = points[j], b = points[i];
            if (onSegment(point, a, b)) return true;
            if ((a.y > point.y) !== (b.y > point.y) &&
                point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
        }
        return inside;
    }

    function intersects(a, b, c, d) {
        const abC = cross(a, b, c), abD = cross(a, b, d);
        const cdA = cross(c, d, a), cdB = cross(c, d, b);
        if (((abC > EPS && abD < -EPS) || (abC < -EPS && abD > EPS)) &&
            ((cdA > EPS && cdB < -EPS) || (cdA < -EPS && cdB > EPS))) return true;
        return (Math.abs(abC) <= EPS && onSegment(c, a, b)) ||
            (Math.abs(abD) <= EPS && onSegment(d, a, b)) ||
            (Math.abs(cdA) <= EPS && onSegment(a, c, d)) ||
            (Math.abs(cdB) <= EPS && onSegment(b, c, d));
    }

    function geometry(input) {
        const result = { valid: false, reason: 'invalid', polygon: [], perimeter: 0, area: 0, x: WIDTH / 2, y: HEIGHT / 2 };
        if (!Array.isArray(input) || input.length > MAX_POINTS || !input.every(finitePoint)) return result;
        const points = [];
        for (const point of input) {
            if (point.x < 0 || point.x > WIDTH || point.y < 0 || point.y > HEIGHT) return result;
            if (!points.length || distance(points[points.length - 1], point) > EPS) points.push({ x: point.x, y: point.y });
        }
        if (points.length > 1 && distance(points[0], points[points.length - 1]) <= EPS) points.pop();
        // A hand-drawn circle often runs a few pixels past its own start.
        // Trim only its short terminal tail; interior crossings still fail.
        if (points.length >= 6) {
            while (points.length > 3 && distance(points[0], points[points.length - 1]) <= CLOSE_TOLERANCE) points.pop();
        }
        result.polygon = points;
        result.perimeter = pathLength(points);
        result.area = area(points);
        if (points.length) {
            result.x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
            result.y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
        }
        if (result.perimeter > MAX_PERIMETER + EPS) { result.reason = 'too-long'; return result; }
        if (points.length < 3) { result.reason = 'too-small'; return result; }
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                if (j === i + 1 || (i === 0 && j === points.length - 1)) continue;
                if (intersects(points[i], points[(i + 1) % points.length], points[j], points[(j + 1) % points.length])) {
                    result.reason = 'crossed'; return result;
                }
            }
        }
        if (result.area < MIN_AREA - EPS) { result.reason = 'too-small'; return result; }
        result.valid = true;
        result.reason = 'ready';
        return result;
    }

    function isActive(state, entity) {
        return !!entity && state.time - entity.born + EPS >=
            (entity.type === 'ember' ? EMBER_WARMUP : LIGHT_WARMUP);
    }

    function nextMultiplier(state) {
        return state.combo > 0 && state.time - state.lastCatch <= COMBO_WINDOW + EPS ?
            Math.min(3, state.combo + 1) : 1;
    }

    function preview(state, points) {
        const result = Object.assign(geometry(points), {
            lights: [], embers: [], captured: [], points: 0, multiplier: 1
        });
        if (state.ended) { result.valid = false; result.reason = 'ended'; return result; }
        if (!result.valid) return result;
        for (const entity of state.entities) {
            if (isActive(state, entity) && pointInPolygon(entity, result.polygon)) {
                (entity.type === 'ember' ? result.embers : result.lights).push(entity);
            }
        }
        result.multiplier = nextMultiplier(state);
        if (result.embers.length) result.reason = 'ember';
        else if (!result.lights.length) result.reason = 'empty';
        else {
            result.points = 10 * result.lights.length * result.lights.length * result.multiplier;
            result.x = result.lights.reduce((sum, e) => sum + e.x, 0) / result.lights.length;
            result.y = result.lights.reduce((sum, e) => sum + e.y, 0) / result.lights.length;
        }
        return result;
    }

    function capture(state, points) {
        const result = preview(state, points);
        if (!result.valid) return result;
        state.loops++;
        if (result.reason === 'ember' || result.reason === 'empty') {
            state.combo = 0;
            state.lastCatch = -COMBO_WINDOW - 1;
            state.misses++;
            return result;
        }
        const ids = new Set(result.lights.map(entity => entity.id));
        result.captured = result.lights.map(entity => Object.assign({}, entity));
        state.entities = state.entities.filter(entity => !ids.has(entity.id));
        state.score += result.points;
        state.combo = result.multiplier;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        state.lastCatch = state.time;
        state.caught += result.lights.length;
        state._refillAt = state.time + 0.3;
        result.reason = 'catch';
        return result;
    }

    function clearSpot(state, x, y, radius) {
        return state.entities.every(entity => {
            const dx = entity.x - x, dy = entity.y - y;
            const gap = radius + entity.r + SPAWN_GAP;
            return dx * dx + dy * dy >= gap * gap;
        });
    }

    function spawn(state, type, anchor, initial) {
        const radius = type === 'ember' ? 12 : 9, margin = radius + 26;
        let spot = null;
        // Try a loose cluster first, then the whole board. All work is bounded.
        for (let attempt = 0; attempt < 96; attempt++) {
            const clustered = anchor && attempt < 36;
            const x = clustered ? anchor.x + (random(state) - 0.5) * 180 : margin + random(state) * (WIDTH - margin * 2);
            const y = clustered ? anchor.y + (random(state) - 0.5) * 180 : margin + random(state) * (HEIGHT - margin * 2);
            if (x >= margin && x <= WIDTH - margin && y >= margin && y <= HEIGHT - margin && clearSpot(state, x, y, radius)) {
                spot = { x: Math.round(x * 2) / 2, y: Math.round(y * 2) / 2 };
                // Rounding must not reduce the promised separation.
                if (clearSpot(state, spot.x, spot.y, radius)) break;
                spot = null;
            }
        }
        if (!spot) return false;
        let vx = random(state) * 2 - 1, vy = random(state) * 2 - 1;
        const norm = Math.sqrt(vx * vx + vy * vy) || 1;
        if (vx === 0 && vy === 0) vx = 1;
        const speed = type === 'ember' ? 20 + random(state) * 10 : 22 + random(state) * 12;
        state.entities.push({
            id: state._nextId++, type, x: spot.x, y: spot.y, r: radius,
            vx: vx / norm * speed, vy: vy / norm * speed,
            phase: random(state) * 6.283185307179586,
            born: initial ? -1 : state.time,
            _turnAt: state._ticks + 120 + Math.floor(random(state) * 180)
        });
        return true;
    }

    function newAnchor(state) {
        return { x: 110 + random(state) * (WIDTH - 220), y: 110 + random(state) * (HEIGHT - 220) };
    }

    function refill(state, initial, lightsAllowed) {
        let lights = state.entities.filter(entity => entity.type === 'light').length;
        let anchor = lights < LIGHT_COUNT && lightsAllowed !== false ? newAnchor(state) : null, group = 0;
        while (lightsAllowed !== false && lights < LIGHT_COUNT) {
            if (!spawn(state, 'light', anchor, initial)) break;
            lights++;
            if (++group % 4 === 0) anchor = newAnchor(state);
        }
        const target = Math.min(MAX_EMBERS, 4 + Math.floor(state.time / 25));
        let embers = state.entities.filter(entity => entity.type === 'ember').length;
        while (embers < target) {
            if (!spawn(state, 'ember', null, initial)) break;
            embers++;
        }
        if (lightsAllowed !== false) state._refillAt = state.time + 0.3;
    }

    function create(seed) {
        const normalized = hashSeed(seed);
        const state = {
            seed: normalized, time: 0, duration: DURATION, score: 0,
            combo: 0, bestCombo: 0, caught: 0, loops: 0, misses: 0,
            entities: [], ended: false, drawing: false, lastCatch: -COMBO_WINDOW - 1,
            _rng: normalized || 0x9e3779b9, _ticks: 0, _accumulator: 0,
            _nextId: 1, _refillAt: 0
        };
        refill(state, true);
        return state;
    }

    function tick(state) {
        state._ticks++;
        state.time = Math.min(DURATION, state._ticks * FIXED_DT);
        if (state.combo && state.time - state.lastCatch > COMBO_WINDOW + EPS) state.combo = 0;
        for (const entity of state.entities) {
            if (state._ticks >= entity._turnAt) {
                // Small rational rotation; no trigonometry in the simulation.
                const bend = (random(state) - 0.5) * 0.35;
                const factor = 1 / Math.sqrt(1 + bend * bend), oldX = entity.vx;
                entity.vx = (entity.vx - entity.vy * bend) * factor;
                entity.vy = (entity.vy + oldX * bend) * factor;
                entity._turnAt = state._ticks + 120 + Math.floor(random(state) * 180);
            }
            entity.x += entity.vx * FIXED_DT;
            entity.y += entity.vy * FIXED_DT;
            const margin = entity.r + 16;
            if (entity.x < margin) { entity.x = margin * 2 - entity.x; entity.vx = Math.abs(entity.vx); }
            if (entity.x > WIDTH - margin) { entity.x = 2 * (WIDTH - margin) - entity.x; entity.vx = -Math.abs(entity.vx); }
            if (entity.y < margin) { entity.y = margin * 2 - entity.y; entity.vy = Math.abs(entity.vy); }
            if (entity.y > HEIGHT - margin) { entity.y = 2 * (HEIGHT - margin) - entity.y; entity.vy = -Math.abs(entity.vy); }
        }
        if (state.time >= DURATION) { state.ended = true; state.drawing = false; return; }
        const needsEmber = state.entities.filter(entity => entity.type === 'ember').length < Math.min(MAX_EMBERS, 4 + Math.floor(state.time / 25));
        if (!state.drawing && (state.time + EPS >= state._refillAt || needsEmber)) {
            refill(state, false, state.time + EPS >= state._refillAt);
        }
    }

    function step(state, dt) {
        if (state.ended || typeof dt !== 'number' || !Number.isFinite(dt) || dt <= 0) return state;
        state._accumulator += Math.min(dt, MAX_DT);
        while (state._accumulator + 1e-12 >= FIXED_DT && !state.ended) {
            state._accumulator = Math.max(0, state._accumulator - FIXED_DT);
            tick(state);
        }
        if (state.ended) state._accumulator = 0;
        return state;
    }

    function validDay(day) {
        if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
        const year = Number(day.slice(0, 4)), month = Number(day.slice(5, 7)), date = Number(day.slice(8));
        if (year < 1900 || month < 1 || month > 12 || date < 1) return false;
        const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        return date <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    }

    function localDay(date) {
        const value = date === undefined ? new Date() : date;
        if (!value || typeof value.getTime !== 'function' || !Number.isFinite(value.getTime())) return '';
        return String(value.getFullYear()).padStart(4, '0') + '-' +
            String(value.getMonth() + 1).padStart(2, '0') + '-' + String(value.getDate()).padStart(2, '0');
    }

    function dailySeed(day) {
        const value = day === undefined ? localDay() : day;
        return hashSeed('light-lasso-v1:' + (validDay(value) ? value : 'unknown-day'));
    }

    function validScore(value) {
        return Number.isSafeInteger(value) && value >= 0 && value <= MAX_STORED_SCORE;
    }

    function parseRecords(raw) {
        const clean = { version: 1, best: 0, days: {} };
        try {
            if (typeof raw === 'string') {
                if (raw.length > 65536) return clean;
                raw = JSON.parse(raw);
            }
            if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.version !== 1) return clean;
            if (validScore(raw.best)) clean.best = raw.best;
            if (!raw.days || typeof raw.days !== 'object' || Array.isArray(raw.days)) return clean;
            const days = Object.keys(raw.days);
            if (days.length > 1000) return clean;
            const valid = days.filter(day => validDay(day) && validScore(raw.days[day])).sort();
            for (const day of valid) clean.best = Math.max(clean.best, raw.days[day]);
            for (const day of valid.slice(-31)) clean.days[day] = raw.days[day];
        } catch (_) { return { version: 1, best: 0, days: {} }; }
        return clean;
    }

    function record(records, day, score) {
        const clean = parseRecords(records);
        if (!validScore(score) || (day !== null && !validDay(day))) return clean;
        clean.best = Math.max(clean.best, score);
        if (day !== null) clean.days[day] = Math.max(clean.days[day] || 0, score);
        return parseRecords(clean);
    }

    const api = {
        WIDTH, HEIGHT, DURATION, FIXED_DT, MAX_DT, MAX_PERIMETER, MIN_AREA, MAX_POINTS, CLOSE_TOLERANCE,
        COMBO_WINDOW, LIGHT_COUNT, MAX_EMBERS, SPAWN_GAP, LIGHT_WARMUP, EMBER_WARMUP,
        create, step, preview, capture, isActive, area, pointInPolygon, pathLength,
        hashSeed, localDay, dailySeed, validDay, parseRecords, record
    };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.Lasso = api;
})(typeof window !== 'undefined' ? window : null);
