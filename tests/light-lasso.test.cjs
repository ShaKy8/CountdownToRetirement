'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const Lasso = require('../light-lasso/engine.js');

const rectangle = (x = 100, y = 100, w = 200, h = 200) => [
    { x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }
];
const square = rectangle();
function entity(id, x = 200, y = 200, type = 'light', born = -1) {
    return { id, x, y, type, born, r: type === 'ember' ? 12 : 9, vx: 0, vy: 0, phase: 0, _turnAt: 999999 };
}
function scene(entities) {
    const state = Lasso.create(123);
    state.entities = entities || [entity(1)];
    state._nextId = 100;
    return state;
}
function advance(state, seconds, dt = 0.25) {
    let remaining = seconds;
    while (remaining > 1e-10) {
        const slice = Math.min(remaining, dt);
        Lasso.step(state, slice);
        remaining -= slice;
    }
    return state;
}
function snapshot(state) {
    const copy = structuredClone(state);
    delete copy._accumulator;
    return copy;
}
function count(state, type) { return state.entities.filter(e => e.type === type).length; }

test('browser IIFE and CommonJS expose the same dependency-free API', () => {
    const source = fs.readFileSync(require.resolve('../light-lasso/engine.js'), 'utf8');
    const context = { window: {} };
    vm.runInNewContext(source, context);
    assert.deepEqual(Object.keys(context.window.Lasso), Object.keys(Lasso));
    assert.equal(context.window.Lasso.create(7).entities.length, 24);
    assert.doesNotMatch(source, /\b(?:document|localStorage|fetch|XMLHttpRequest|AudioContext)\s*[.(]/);
    assert.doesNotMatch(source, /Math\.(?:random|sin|cos)\(/);
});

test('public constants pin the shared logical board and rules', () => {
    assert.equal(Lasso.WIDTH, 720);
    assert.equal(Lasso.HEIGHT, 820);
    assert.equal(Lasso.DURATION, 75);
    assert.equal(Lasso.FIXED_DT, 1 / 120);
    assert.equal(Lasso.MAX_PERIMETER, 1000);
    assert.equal(Lasso.MIN_AREA, 500);
    assert.equal(Lasso.LIGHT_COUNT, 20);
    assert.equal(Lasso.MAX_EMBERS, 6);
});

test('same seed yields exactly the same initial state and simulation', () => {
    const a = Lasso.create('an evening'), b = Lasso.create('an evening');
    assert.deepEqual(a, b);
    for (let i = 0; i < 500; i++) {
        const dt = [1 / 60, 1 / 120, 0.05][i % 3];
        Lasso.step(a, dt); Lasso.step(b, dt);
    }
    assert.deepEqual(a, b);
    assert.notDeepEqual(a.entities, Lasso.create('another evening').entities);
});

test('numeric, zero, malformed and string seeds are deterministic and finite', () => {
    for (const seed of [0, 1, -1, 4294967295, NaN, Infinity, null, undefined, {}, '0', 'winter']) {
        const a = Lasso.create(seed), b = Lasso.create(seed);
        assert.deepEqual(a, b);
        assert.equal(a.entities.length, 24);
        assert.ok(Number.isInteger(a.seed));
    }
    assert.equal(Lasso.hashSeed(4294967297), 1);
});

test('initial placement is non-overlapping, in bounds, active and exactly 20+4 over 500 seeds', () => {
    for (let seed = 0; seed < 500; seed++) {
        const state = Lasso.create(seed);
        assert.equal(count(state, 'light'), 20);
        assert.equal(count(state, 'ember'), 4);
        const ids = new Set();
        for (let i = 0; i < state.entities.length; i++) {
            const e = state.entities[i];
            ids.add(e.id);
            assert.ok(e.x > e.r && e.x < Lasso.WIDTH - e.r);
            assert.ok(e.y > e.r && e.y < Lasso.HEIGHT - e.r);
            assert.ok(Lasso.isActive(state, e));
            const speed = Math.sqrt(e.vx ** 2 + e.vy ** 2);
            assert.ok(speed >= 20 - 1e-9 && speed <= 34 + 1e-9);
            for (let j = i + 1; j < state.entities.length; j++) {
                const other = state.entities[j];
                assert.ok(Math.hypot(e.x - other.x, e.y - other.y) >= e.r + other.r + Lasso.SPAWN_GAP - 1e-9);
            }
        }
        assert.equal(ids.size, 24);
    }
});

test('representative seeded meadows offer an immediate clean multi-light opening', () => {
    for (let seed = 0; seed < 100; seed++) {
        const state = Lasso.create(seed);
        let best = 0;
        for (const light of state.entities.filter(e => e.type === 'light')) {
            for (const radius of [50, 75, 100, 125, 150]) {
                const loop = Array.from({ length: 24 }, (_, i) => ({
                    x: light.x + Math.cos(i * Math.PI / 12) * radius,
                    y: light.y + Math.sin(i * Math.PI / 12) * radius
                }));
                const result = Lasso.preview(state, loop);
                if (result.valid && result.embers.length === 0) best = Math.max(best, result.lights.length);
            }
        }
        assert.ok(best >= 4, 'seed ' + seed + ' needs an inviting opening catch');
    }
});

test('fixed ticks are independent of 30/60/120 Hz frame partition', () => {
    const states = [30, 60, 120].map(fps => advance(Lasso.create(73), 12, 1 / fps));
    assert.deepEqual(snapshot(states[0]), snapshot(states[1]));
    assert.deepEqual(snapshot(states[1]), snapshot(states[2]));
    assert.equal(states[0].time, 12);
});

test('fractional frame remainder is carried rather than discarded', () => {
    const state = Lasso.create(73);
    Lasso.step(state, Lasso.FIXED_DT / 3);
    assert.equal(state.time, 0);
    Lasso.step(state, Lasso.FIXED_DT / 3);
    assert.equal(state.time, 0);
    Lasso.step(state, Lasso.FIXED_DT / 3);
    assert.equal(state.time, Lasso.FIXED_DT);
});

test('negative, non-numeric and non-finite dt are ignored; huge dt is capped', () => {
    const state = Lasso.create(73), before = structuredClone(state);
    for (const dt of [0, -1, NaN, Infinity, -Infinity, '1', null, undefined, {}]) Lasso.step(state, dt);
    assert.deepEqual(state, before);
    Lasso.step(state, 100000);
    assert.equal(state.time, 0.25);
    assert.equal(state._ticks, 30);
});

test('a run ends at exactly 75 seconds and freezes all future steps/captures', () => {
    const state = advance(Lasso.create(11), 74.75);
    assert.equal(state.ended, false);
    state.drawing = true;
    Lasso.step(state, 0.25);
    assert.equal(state.time, 75);
    assert.equal(state.ended, true);
    assert.equal(state.drawing, false);
    const before = structuredClone(state);
    Lasso.step(state, 1);
    assert.equal(Lasso.capture(state, square).reason, 'ended');
    assert.deepEqual(state, before);
});

test('all numeric simulation state remains finite and density bounded throughout 30 complete runs', () => {
    function assertFinite(value) {
        for (const item of Object.values(value)) {
            if (typeof item === 'number') assert.ok(Number.isFinite(item));
            else if (item && typeof item === 'object') assertFinite(item);
        }
    }
    for (let seed = 0; seed < 30; seed++) {
        const state = Lasso.create(seed);
        for (let tick = 0; tick < 300; tick++) {
            Lasso.step(state, 0.25);
            assert.ok(state.entities.length <= 26);
            for (const e of state.entities) {
                assert.ok(e.x >= e.r && e.x <= Lasso.WIDTH - e.r);
                assert.ok(e.y >= e.r && e.y <= Lasso.HEIGHT - e.r);
            }
        }
        assertFinite(state);
        assert.equal(state.time, 75);
    }
});

test('world continues moving at full speed during a live stroke', () => {
    const a = Lasso.create(8), b = Lasso.create(8);
    b.drawing = true;
    advance(a, 0.25); advance(b, 0.25);
    assert.deepEqual(a.entities, b.entities);
    assert.notDeepEqual(a.entities, Lasso.create(8).entities);
});

test('embers increase at exactly 25 and 50 seconds and never exceed six', () => {
    const state = Lasso.create(2);
    advance(state, 24.75);
    assert.equal(count(state, 'ember'), 4);
    Lasso.step(state, 0.25);
    assert.equal(count(state, 'ember'), 5);
    assert.equal(state.entities.at(-1).born, 25);
    advance(state, 24.75);
    assert.equal(count(state, 'ember'), 5);
    Lasso.step(state, 0.25);
    assert.equal(count(state, 'ember'), 6);
    advance(state, 25);
    assert.equal(count(state, 'ember'), 6);
});

test('new embers and replacement lights never spawn beneath an active stroke', () => {
    const state = Lasso.create(2);
    state.entities = state.entities.filter(e => e.type === 'ember');
    state.drawing = true;
    advance(state, 51);
    assert.equal(state.entities.length, 4);
    state.drawing = false;
    Lasso.step(state, Lasso.FIXED_DT);
    assert.equal(count(state, 'light'), 20);
    assert.equal(count(state, 'ember'), 6);
    assert.ok(state.entities.filter(e => e.born > 0).every(e => !Lasso.isActive(state, e)));
});

test('replacement lights wait 0.3 seconds and are harmless for their entrance', () => {
    const state = scene([entity(1)]);
    assert.equal(Lasso.capture(state, square).points, 10);
    advance(state, 0.29);
    assert.equal(count(state, 'light'), 0);
    advance(state, 0.02);
    assert.equal(count(state, 'light'), 20);
    assert.ok(state.entities.filter(e => e.type === 'light').every(e => !Lasso.isActive(state, e)));
    advance(state, 0.31);
    assert.ok(state.entities.filter(e => e.type === 'light').every(e => Lasso.isActive(state, e)));
});

test('new placements remain separated from every existing entity', () => {
    for (let seed = 0; seed < 100; seed++) {
        const state = Lasso.create(seed);
        state.entities = state.entities.filter(e => e.type === 'ember');
        advance(state, 0.3);
        const born = state.entities.filter(e => e.born >= 0);
        assert.equal(born.length, 20);
        for (const e of born) for (const other of state.entities) {
            if (e.id === other.id) continue;
            assert.ok(Math.hypot(e.x - other.x, e.y - other.y) >= e.r + other.r + Lasso.SPAWN_GAP - 1e-8);
        }
    }
});

test('warmup boundaries use the same eligibility for light and ember preview/capture', () => {
    const state = scene([entity(1, 200, 200, 'light', 0), entity(2, 220, 200, 'ember', 0)]);
    state.time = 0.29;
    assert.equal(Lasso.preview(state, square).reason, 'empty');
    state.time = 0.3;
    assert.equal(Lasso.preview(state, square).points, 10);
    state.time = 0.59;
    assert.equal(Lasso.preview(state, square).reason, 'ready');
    state.time = 0.6;
    assert.equal(Lasso.preview(state, square).reason, 'ember');
    assert.equal(Lasso.capture(state, square).points, 0);
    assert.equal(state.entities.length, 2);
});

test('area and closed path length are winding-independent', () => {
    assert.equal(Lasso.area(square), 40000);
    assert.equal(Lasso.area([...square].reverse()), 40000);
    assert.equal(Lasso.pathLength(square), 800);
    assert.equal(Lasso.pathLength([...square, square[0]]), 800);
    assert.equal(Lasso.pathLength([{ x: 0, y: 0 }, { x: 3, y: 4 }]), 10);
});

test('point-in-polygon includes every edge and vertex but excludes outside centers', () => {
    for (const p of [{ x: 200, y: 200 }, ...square, { x: 100, y: 200 }, { x: 300, y: 200 }, { x: 200, y: 100 }, { x: 200, y: 300 }]) {
        assert.equal(Lasso.pointInPolygon(p, square), true);
        assert.equal(Lasso.pointInPolygon(p, [...square].reverse()), true);
    }
    for (const p of [{ x: 99.999, y: 200 }, { x: 300.001, y: 200 }, { x: 200, y: 99.999 }, { x: 200, y: 300.001 }]) {
        assert.equal(Lasso.pointInPolygon(p, square), false);
    }
});

test('concave polygons correctly exclude the notch in either winding', () => {
    const shape = [{ x: 100, y: 100 }, { x: 300, y: 100 }, { x: 300, y: 300 }, { x: 200, y: 200 }, { x: 100, y: 300 }];
    assert.equal(Lasso.pointInPolygon({ x: 200, y: 150 }, shape), true);
    assert.equal(Lasso.pointInPolygon({ x: 200, y: 260 }, shape), false);
    assert.equal(Lasso.preview(scene([entity(1, 200, 150), entity(2, 200, 260)]), shape).lights.length, 1);
});

test('the release closing segment counts towards string length and containment', () => {
    const triangle = [{ x: 100, y: 100 }, { x: 400, y: 100 }, { x: 400, y: 400 }];
    const result = Lasso.preview(scene(), triangle);
    assert.equal(result.reason, 'too-long');
    assert.ok(result.perimeter > 1000);
    const small = [{ x: 100, y: 100 }, { x: 300, y: 100 }, { x: 300, y: 300 }];
    assert.equal(Lasso.capture(scene([entity(1, 240, 180)]), small).points, 10);
});

test('center containment, rather than disk contact, decides captures', () => {
    const state = scene([entity(1, 99, 200), entity(2, 100, 220), entity(3, 101, 250)]);
    const result = Lasso.capture(state, square);
    assert.deepEqual(result.captured.map(e => e.id), [2, 3]);
    assert.deepEqual(state.entities.map(e => e.id), [1]);
});

test('exact minimum area and maximum string boundaries are inclusive', () => {
    assert.equal(Lasso.preview(scene(), rectangle(100, 100, 25, 20)).valid, true);
    assert.equal(Lasso.preview(scene(), rectangle(100, 100, 24.99, 20)).reason, 'too-small');
    assert.equal(Lasso.preview(scene(), rectangle(100, 100, 250, 250)).valid, true);
    assert.equal(Lasso.preview(scene(), rectangle(100, 100, 250.01, 250)).reason, 'too-long');
});

test('whole-board farming is rejected by the finite string budget', () => {
    const state = Lasso.create(99), before = structuredClone(state);
    const result = Lasso.capture(state, rectangle(0, 0, 720, 820));
    assert.equal(result.reason, 'too-long');
    assert.deepEqual(state, before);
});

test('bow-ties, touching lobes and backtracked boundary segments are rejected', () => {
    const strokes = [
        [{ x: 100, y: 100 }, { x: 300, y: 300 }, { x: 100, y: 300 }, { x: 300, y: 100 }],
        [{ x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 200 }, { x: 100, y: 100 }, { x: 100, y: 200 }, { x: 50, y: 200 }],
        [{ x: 100, y: 100 }, { x: 300, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 200 }, { x: 100, y: 200 }]
    ];
    for (const stroke of strokes) assert.equal(Lasso.preview(scene(), stroke).reason, 'crossed');
});

test('duplicate adjacent samples and explicit closing points do not invalidate a loop', () => {
    const repeated = [square[0], square[0], square[1], square[1], square[2], square[3], square[0], square[0]];
    const normal = Lasso.preview(scene(), square), duplicate = Lasso.preview(scene(), repeated);
    assert.equal(duplicate.reason, 'ready');
    assert.equal(duplicate.points, normal.points);
    assert.equal(duplicate.perimeter, normal.perimeter);
    assert.deepEqual(duplicate.polygon, square);
});

test('a short near-start overshoot is trimmed without forgiving interior crossings', () => {
    const overshoot = [
        { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 300, y: 100 },
        { x: 300, y: 200 }, { x: 300, y: 300 }, { x: 200, y: 300 },
        { x: 100, y: 300 }, { x: 100, y: 200 }, { x: 100, y: 105 }, { x: 106, y: 95 }
    ];
    const result = Lasso.preview(scene(), overshoot);
    assert.equal(result.reason, 'ready');
    assert.equal(result.area, 40000);
    assert.equal(result.polygon.length, 8);
    const crossed = [overshoot[0], { x: 300, y: 300 }, { x: 100, y: 300 }, { x: 300, y: 100 }, { x: 200, y: 100 }, { x: 105, y: 105 }];
    assert.equal(Lasso.preview(scene(), crossed).reason, 'crossed');
});

test('dense paths remain bounded and valid up to the explicit sample limit', () => {
    const loop = Array.from({ length: Lasso.MAX_POINTS }, (_, i) => ({
        x: 300 + 100 * Math.cos(i * Math.PI * 2 / Lasso.MAX_POINTS),
        y: 300 + 100 * Math.sin(i * Math.PI * 2 / Lasso.MAX_POINTS)
    }));
    const state = scene([entity(1, 300, 300)]);
    assert.equal(Lasso.preview(state, loop).points, 10);
    assert.equal(Lasso.preview(state, [...loop, loop[0]]).valid, false);
});

const malformedStrokes = [null, undefined, {}, 'circle', [], [{ x: 1, y: 1 }],
    [{ x: NaN, y: 1 }], [{ x: Infinity, y: 1 }], [{ x: '100', y: 100 }], [null],
    [{ x: -1, y: 100 }, ...square], [{ x: 721, y: 100 }, ...square],
    [{ x: 100, y: 821 }, ...square], Array.from({ length: Lasso.MAX_POINTS + 1 }, () => ({ x: 200, y: 200 }))];
for (const [index, points] of malformedStrokes.entries()) test(`malformed/degenerate stroke ${index + 1} cannot mutate a run`, () => {
    const state = scene(); state.combo = 3; state.lastCatch = 0;
    const before = structuredClone(state), result = Lasso.capture(state, points);
    assert.equal(result.valid, false);
    assert.equal(result.points, 0);
    assert.deepEqual(state, before);
});

test('preview is pure and scores exactly what an immediate release catches', () => {
    const state = scene([entity(1), entity(2, 220, 220)]), before = structuredClone(state), points = structuredClone(square);
    const result = Lasso.preview(state, square);
    assert.deepEqual(state, before);
    assert.deepEqual(square, points);
    const caught = Lasso.capture(state, square);
    assert.equal(result.points, caught.points);
    assert.deepEqual(result.lights, caught.lights);
    assert.deepEqual(result.polygon, caught.polygon);
    assert.equal(result.reason, 'ready');
    assert.equal(caught.reason, 'catch');
    assert.equal(caught.x, 210);
    assert.equal(caught.y, 210);
    assert.equal(caught.points, 40);
});

test('preview is recomputed at release after lights drift out of a loop', () => {
    const state = scene();
    assert.equal(Lasso.preview(state, square).points, 10);
    state.entities[0].x = 400;
    assert.equal(Lasso.capture(state, square).reason, 'empty');
    assert.equal(state.score, 0);
});

test('score rewards multi-catches quadratically; captures cannot be counted twice', () => {
    const state = scene([entity(1), entity(2, 210, 210), entity(3, 220, 220)]);
    const result = Lasso.capture(state, square);
    assert.equal(result.points, 90);
    assert.equal(state.score, 90);
    assert.equal(state.caught, 3);
    assert.equal(state.loops, 1);
    assert.equal(state.entities.length, 0);
    assert.equal(result.captured.length, 3);
    result.captured[0].x = 999;
    assert.equal(result.lights[0].x, 200, 'effect snapshots do not alias entities');
    assert.equal(Lasso.capture(state, square).points, 0);
    assert.equal(state.score, 90);
});

test('clean catches build 1x, 2x, 3x, then remain capped at 3x', () => {
    const state = scene();
    for (let i = 1; i <= 5; i++) {
        state.entities = [entity(i)];
        state.time = i;
        const result = Lasso.capture(state, square);
        assert.equal(result.multiplier, Math.min(3, i));
        assert.equal(result.points, 10 * Math.min(3, i));
    }
    assert.equal(state.score, 120);
    assert.equal(state.combo, 3);
    assert.equal(state.bestCombo, 3);
    assert.equal(state.caught, 5);
    assert.equal(state.loops, 5);
    assert.equal(state.misses, 0);
});

test('combo window includes exactly four seconds but not the next tick', () => {
    const state = scene();
    Lasso.capture(state, square);
    state.entities = [entity(2)];
    state.time = 4;
    assert.equal(Lasso.capture(state, square).multiplier, 2);
    state.entities = [entity(3)];
    state.time = 8 + Lasso.FIXED_DT;
    assert.equal(Lasso.capture(state, square).multiplier, 1);
});

test('step expires the visible combo without changing the score or best combo', () => {
    const state = scene();
    Lasso.capture(state, square);
    advance(state, 4);
    assert.equal(state.combo, 1);
    Lasso.step(state, Lasso.FIXED_DT);
    assert.equal(state.combo, 0);
    assert.equal(state.score, 10);
    assert.equal(state.bestCombo, 1);
});

test('a valid empty loop resets combo but never deducts points or ends the run', () => {
    const state = scene();
    Lasso.capture(state, square);
    const result = Lasso.capture(state, square);
    assert.equal(result.valid, true);
    assert.equal(result.reason, 'empty');
    assert.equal(state.combo, 0);
    assert.equal(state.score, 10);
    assert.equal(state.misses, 1);
    assert.equal(state.loops, 2);
    assert.equal(state.ended, false);
});

test('one or more embers void the entire catch without removing anything or deducting points', () => {
    const state = scene();
    Lasso.capture(state, square);
    state.entities = [entity(2), entity(3, 220, 220, 'ember'), entity(4, 250, 250, 'ember')];
    const before = structuredClone(state.entities), result = Lasso.capture(state, square);
    assert.equal(result.reason, 'ember');
    assert.equal(result.points, 0);
    assert.equal(result.captured.length, 0);
    assert.deepEqual(state.entities, before);
    assert.equal(state.score, 10);
    assert.equal(state.combo, 0);
    assert.equal(state.misses, 1);
    assert.equal(state.ended, false);
});

test('tiny, crossed, and too-long releases preserve combo and do not count as attempts', () => {
    const state = scene();
    Lasso.capture(state, square);
    const before = structuredClone(state);
    for (const points of [rectangle(200, 200, 5, 5), rectangle(0, 0, 720, 820), [square[0], square[2], square[1], square[3]]]) {
        assert.equal(Lasso.capture(state, points).valid, false);
        assert.deepEqual(state, before);
    }
});

test('storage defaults safely for malformed JSON, incompatible versions and invalid root values', () => {
    const empty = { version: 1, best: 0, days: {} };
    for (const raw of [null, undefined, '', '{', 'null', '[]', '0', 'true', 1, [], { version: 2, best: 100 }, ' '.repeat(65537)]) {
        assert.deepEqual(Lasso.parseRecords(raw), empty);
    }
});

test('storage sanitizes numeric scores and dates and cannot pollute object prototypes', () => {
    const raw = '{"version":1,"best":-10,"days":{"2026-10-10":40,"2026-10-11":"100","2026-02-30":50,"2026-10-12":2.5,"2026-10-13":1e99,"2026-10-14":-1,"__proto__":{"polluted":true},"constructor":20}}';
    assert.deepEqual(Lasso.parseRecords(raw), { version: 1, best: 40, days: { '2026-10-10': 40 } });
    assert.equal({}.polluted, undefined);
    for (const value of [NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER, '10']) {
        assert.equal(Lasso.parseRecords({ version: 1, best: value, days: {} }).best, 0);
    }
});

test('records retain the 31 newest valid calendar dates and preserve an older all-time best', () => {
    let records = null;
    for (let i = 1; i <= 60; i++) {
        records = Lasso.record(records, Lasso.localDay(new Date(2026, 0, i, 12)), i === 1 ? 9990 : i * 10);
    }
    assert.equal(Object.keys(records.days).length, 31);
    assert.equal(Object.keys(records.days)[0], '2026-01-30');
    assert.equal(Object.keys(records.days).at(-1), '2026-03-01');
    assert.equal(records.best, 9990);
    assert.equal(records.days['2026-01-01'], undefined);
});

test('repeated daily runs only improve the best and never mutate the supplied records', () => {
    const old = { version: 1, best: 100, days: { '2026-10-10': 100 } }, before = structuredClone(old);
    const worse = Lasso.record(old, '2026-10-10', 50);
    assert.deepEqual(worse, old);
    const better = Lasso.record(old, '2026-10-10', 200);
    assert.equal(better.best, 200);
    assert.equal(better.days['2026-10-10'], 200);
    assert.deepEqual(old, before);
    assert.deepEqual(Lasso.parseRecords(JSON.stringify(better)), better);
});

test('shuffle records update all-time only; other malformed dates/scores do nothing', () => {
    const old = { version: 1, best: 100, days: { '2026-10-10': 100 } };
    assert.deepEqual(Lasso.record(old, null, 200), { version: 1, best: 200, days: old.days });
    for (const day of [undefined, '', {}, '2026-02-30', '2026-1-1']) assert.deepEqual(Lasso.record(old, day, 200), old);
    for (const score of [Infinity, NaN, -1, 1.5, '200']) assert.deepEqual(Lasso.record(old, null, score), old);
});

test('corrupt storage getters and excessive key counts fail closed without exceptions', () => {
    const hostile = { version: 1, get best() { throw new Error('hostile getter'); } };
    assert.deepEqual(Lasso.parseRecords(hostile), { version: 1, best: 0, days: {} });
    const days = Object.fromEntries(Array.from({ length: 1001 }, (_, i) => ['bad-' + i, i]));
    assert.deepEqual(Lasso.parseRecords({ version: 1, best: 40, days }), { version: 1, best: 40, days: {} });
});

test('calendar validation handles real dates and Gregorian leap years', () => {
    for (const day of ['2026-10-10', '2024-02-29', '2000-02-29', '2026-12-31']) assert.equal(Lasso.validDay(day), true);
    for (const day of ['2026-02-29', '2100-02-29', '2026-04-31', '2026-00-01', '2026-13-01', '2026-01-00', '2026-1-01', '1899-12-31']) assert.equal(Lasso.validDay(day), false);
    assert.equal(Lasso.localDay(new Date('invalid')), '');
    assert.equal(Lasso.localDay(null), '');
});

test('daily seeds are pinned to the local calendar date rather than a UTC instant', () => {
    assert.equal(Lasso.localDay(new Date(2026, 9, 10, 0, 1)), '2026-10-10');
    assert.equal(Lasso.localDay(new Date(2026, 9, 10, 23, 59)), '2026-10-10');
    assert.equal(Lasso.dailySeed('2026-10-10'), Lasso.dailySeed('2026-10-10'));
    assert.notEqual(Lasso.dailySeed('2026-10-10'), Lasso.dailySeed('2026-10-11'));
    assert.equal(Lasso.dailySeed('bad'), Lasso.dailySeed(null));
    assert.equal(Lasso.dailySeed('2026-10-10'), 4265195906, 'changing the seed salt silently changes saved daily boards');
});

for (const zone of ['America/Los_Angeles', 'Australia/Lord_Howe', 'Pacific/Auckland']) test(`local days survive midnight and DST in ${zone}`, () => {
    const script = `const assert=require('node:assert/strict');const L=require(${JSON.stringify(require.resolve('../light-lasso/engine.js'))});
        for(const [y,m,d] of [[2026,2,8],[2026,10,1],[2026,3,5],[2026,9,4]]){
            const early=new Date(y,m,d,0,1),late=new Date(y,m,d,23,59),next=new Date(y,m,d+1,0,1);
            assert.equal(L.localDay(early),L.localDay(late));
            assert.notEqual(L.localDay(late),L.localDay(next));
            assert.equal(L.dailySeed(L.localDay(early)),L.dailySeed(L.localDay(late)));
        }`;
    const result = spawnSync(process.execPath, ['-e', script], { env: { ...process.env, TZ: zone }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
});
