'use strict';

// Execute the shipped UI script unchanged. Only the browser, clock, audio and
// precomputed flight are fixtures; input handlers, replay, rendering, scoring
// and clipboard feedback all run through their real production code.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const Daily = require('../shared/daily.js');
const Sling = require('../slingshot/orbit.js');
const source = fs.readFileSync(path.join(__dirname, '../slingshot/script.js'), 'utf8');

class Element {
    constructor(tagName = 'div', parentElement = null) {
        this.tagName = tagName.toUpperCase();
        this.parentElement = parentElement;
        this.attributes = {};
        this.handlers = {};
        this.style = {};
        this.textContent = '';
        this.hidden = false;
        this.isContentEditable = false;
    }
    addEventListener(type, handler) { this.handlers[type] = handler; }
    setAttribute(name, value) { this.attributes[name] = value; }
    closest(selectors) {
        const matches = selectors.split(',').map(selector => selector.trim());
        for (let element = this; element; element = element.parentElement) {
            if (matches.some(selector => {
                if (selector === '[contenteditable]') return 'contenteditable' in element.attributes;
                const role = /^\[role="([^"]+)"\]$/.exec(selector);
                return role ? element.attributes.role === role[1] : element.tagName.toLowerCase() === selector;
            })) return element;
        }
        return null;
    }
}

function makeHarness(options = {}) {
    const elements = new Map();
    const byId = id => {
        if (!elements.has(id)) {
            elements.set(id, new Element(['launch', 'free', 'share', 'sound'].includes(id) ? 'button' : 'div'));
        }
        return elements.get(id);
    };
    const flight = options.path || Array.from({ length: 89 }, (_, index) => [20 + index, 50 + index / 4]).flat();
    const checkedPath = new Proxy(flight, {
        get(target, property) {
            if (typeof property === 'string' && /^-?\d+(?:\.\d+)?$/.test(property)) {
                assert.ok(Number.isInteger(Number(property)), 'path access must use a whole coordinate index');
                assert.ok(Number(property) >= 0 && Number(property) < target.length, 'path access must be in bounds');
            }
            return Reflect.get(target, property);
        }
    });
    const level = {
        launch: { x: 20, y: 50 }, target: { x: 170, y: 90, r: 6 },
        planets: [{ x: 100, y: 80, r: 20 }], par: 3
    };
    const flyCalls = [], audioEvents = [], flying = [], probePositions = [], writes = [];
    const timers = [];
    const handlers = {};
    let frameCallback = null;
    let now = 0;
    const context2d = {
        createRadialGradient() { return { addColorStop() {} }; }
    };
    for (const method of ['setTransform', 'clearRect', 'fillRect', 'save', 'restore', 'translate',
        'beginPath', 'arc', 'fill', 'stroke', 'moveTo', 'lineTo', 'setLineDash']) {
        context2d[method] = function (...args) {
            for (const arg of args) {
                if (typeof arg === 'number') assert.ok(Number.isFinite(arg), method + ' received a non-finite coordinate');
            }
            if (method === 'arc' && this.fillStyle === '#fff' && args[2] === 3.5) {
                probePositions.push(args.slice(0, 2));
            }
        };
    }
    const stage = byId('stage');
    stage.tagName = 'CANVAS';
    stage.getContext = () => context2d;
    stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 900 });
    stage.setPointerCapture = () => {};
    byId('share').textContent = 'Copy result';
    const window = {
        Daily,
        Slingshot: {
            ...Sling,
            puzzleDay: () => 251,
            makeLevel: () => level,
            fly(...args) {
                flyCalls.push(args);
                return { path: checkedPath, outcome: options.outcome || 'hit', near: 12, body: 0, x: 80, y: 80 };
            }
        },
        SlingshotAudio: {
            available: () => true,
            arm() {},
            event(...args) { audioEvents.push(args); },
            flying(...args) {
                assert.ok(args.every(Number.isFinite), 'audio progress and proximity must be finite');
                flying.push(args);
            },
            setEnabled: on => on
        },
        localStorage: {
            getItem: () => null,
            setItem(key, value) { writes.push({ key, value }); }
        },
        location: { search: options.search || '' },
        matchMedia: query => ({ matches: query.includes('reduced-motion') && !!options.reducedMotion }),
        performance: { now: () => now },
        addEventListener(type, handler) { handlers[type] = handler; },
        requestAnimationFrame(callback) { frameCallback = callback; },
        setTimeout(callback, delay) { timers.push({ callback, delay }); },
        setInterval() {}
    };
    const document = { getElementById: byId };
    const navigator = options.clipboard === undefined ? {} : { clipboard: options.clipboard };
    vm.runInNewContext(source, { window, document, navigator, URLSearchParams, Element }, { filename: 'slingshot/script.js' });
    function key(key, extra = {}) {
        const event = {
            key, target: stage, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false,
            defaultPrevented: false, isComposing: false,
            preventDefault() { this.defaultPrevented = true; }, ...extra
        };
        handlers.keydown(event);
        return event;
    }
    return {
        byId, key, level, flight, flyCalls, audioEvents, flying, probePositions, writes, window,
        click(id) { byId(id).handlers.click(); },
        step(timestamp) {
            now = timestamp;
            assert.equal(typeof frameCallback, 'function', 'the real game loop must schedule another frame');
            const callback = frameCallback;
            frameCallback = null;
            callback(now);
        },
        runTimers(delay) {
            const due = timers.filter(timer => timer.delay === delay);
            for (const timer of due) {
                timers.splice(timers.indexOf(timer), 1);
                timer.callback();
            }
        }
    };
}

function expectedPoint(harness, index) {
    const k = Math.min(800 / (Sling.WORLD.w + 24), (900 - 200 - 70) / (Sling.WORLD.h + 24));
    const ox = (800 - Sling.WORLD.w * k) / 2;
    const oy = 200 + ((900 - 200 - 70) - Sling.WORLD.h * k) / 2;
    return [ox + harness.flight[index * 2] * k, oy + harness.flight[index * 2 + 1] * k];
}

for (const hz of [60, 90, 120, 144]) {
    test(`replay advances and arrives at the same elapsed time at ${hz} Hz`, () => {
        const harness = makeHarness();
        harness.click('launch');
        assert.equal(harness.key(' ').defaultPrevented, true);
        let arrivalMs = null;
        for (let frame = 1; frame <= hz * 3; frame++) {
            const elapsed = frame * 1000 / hz;
            harness.step(elapsed);
            const lastPoint = harness.probePositions.at(-1);
            const possiblePoints = Array.from({ length: 89 }, (_, index) => expectedPoint(harness, index));
            assert.ok(possiblePoints.some(point => point[0] === lastPoint[0] && point[1] === lastPoint[1]),
                'the drawn probe must use a complete recorded x/y pair');
            if (harness.byId('say').textContent === 'Arrived in 1.') { arrivalMs = elapsed; break; }
        }
        assert.notEqual(arrivalMs, null, 'the replay must finish rather than stall');
        assert.ok(arrivalMs >= 2000 - 1e-6 && arrivalMs <= 2000 + 1000 / hz + 1e-6,
            `88 point intervals at 44/second should take 2000ms, observed ${arrivalMs}ms`);
        assert.deepEqual(harness.probePositions.at(-1), expectedPoint(harness, 88));
        assert.equal(harness.writes.length, 1, 'arrival records the daily once');
        assert.equal(JSON.parse(harness.writes[0].value).days['251'].shots, 1);
        harness.step(arrivalMs + 1000 / hz);
        assert.equal(harness.writes.length, 1, 'later frames must not record the same arrival again');
        harness.runTimers(1100);
        assert.equal(harness.byId('share').hidden, false);
        assert.match(harness.byId('card-share').textContent, /SLINGSHOT #251/);
    });
}

test('fractional replay uses a complete pair for proximity and retains sub-frame progress', () => {
    const harness = makeHarness();
    harness.click('launch');
    harness.key(' ');
    harness.step(1000 / 144);
    assert.deepEqual(harness.probePositions.at(-1), expectedPoint(harness, 0));
    harness.step(2000 / 144);
    harness.step(3000 / 144);
    harness.step(4000 / 144);
    assert.deepEqual(harness.probePositions.at(-1), expectedPoint(harness, 1));
    const dx = harness.flight[2] - harness.level.target.x;
    const dy = harness.flight[3] - harness.level.target.y;
    const expectedNear = Daily.clamp(1 - Math.hypot(dx, dy) / (Sling.NEAR_MISS * 2.5), 0, 1);
    assert.ok(Math.abs(harness.flying.at(-1)[1] - expectedNear) < 1e-12);
});

test('an interrupted animation clamps elapsed catch-up to 100ms', () => {
    const harness = makeHarness();
    harness.click('launch');
    harness.key(' ');
    harness.step(1000);
    assert.deepEqual(harness.probePositions.at(-1), expectedPoint(harness, 4));
    assert.equal(harness.byId('say').textContent, 'Away…');
});

for (const outcome of ['hit', 'crash', 'lost', 'timeout']) {
    test(`reduced motion completes ${outcome} in one frame without animated flight`, () => {
        const harness = makeHarness({ reducedMotion: true, outcome });
        harness.click('launch');
        harness.key(' ');
        harness.step(1000 / 144);
        assert.notEqual(harness.byId('say').textContent, 'Away…');
        assert.equal(harness.flying.length, 0);
        assert.equal(harness.window.SLINGSHOT_FX.particles(), 0);
        assert.equal(harness.window.SLINGSHOT_FX.rings(), 0);
        assert.equal(harness.window.SLINGSHOT_FX.shake(), 0);
        assert.equal(harness.window.SLINGSHOT_FX.scars(), outcome === 'crash' ? 1 : 0);
        assert.equal(harness.writes.length, outcome === 'hit' ? 1 : 0);
        if (outcome === 'hit') {
            harness.runTimers(0);
            assert.equal(harness.byId('share').hidden, false);
        }
        harness.step(2000 / 144);
        assert.equal(harness.audioEvents.filter(([event]) => event !== 'launch').length, 1);
    });
}

for (const flight of [[], [10], [10, 20], [10, 20, 30], [10, 20, 30, 40, 50]]) {
    test(`replay safely handles ${flight.length} coordinates, including incomplete trailing pairs`, () => {
        const harness = makeHarness({ path: flight });
        harness.click('launch');
        harness.key(' ');
        harness.step(100);
        assert.equal(harness.byId('say').textContent, 'Arrived in 1.');
        assert.equal(harness.writes.length, 1);
        if (flight.length >= 2) {
            assert.deepEqual(harness.probePositions.at(-1), expectedPoint(harness, Math.floor(flight.length / 2) - 1));
        } else {
            assert.equal(harness.probePositions.length, 0);
        }
    });
}

test('native and editable controls retain all keyboard defaults, including nested targets', () => {
    const harness = makeHarness();
    harness.click('launch');
    harness.step(0);
    const initialAim = harness.flyCalls.at(-1).slice(1, 4);
    const controls = ['button', 'a', 'input', 'select', 'textarea', 'summary'].map(tag => new Element(tag));
    const editable = new Element();
    editable.attributes.contenteditable = 'true';
    controls.push(editable, new Element('span', editable));
    const inheritedEditable = new Element();
    inheritedEditable.isContentEditable = true;
    controls.push(inheritedEditable, new Element('span', controls[0]), new Element('span', controls[1]));
    for (const role of ['button', 'link']) {
        const control = new Element();
        control.attributes.role = role;
        controls.push(control);
    }
    for (const target of controls) {
        for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar', 'Enter']) {
            assert.equal(harness.key(key, { target }).defaultPrevented, false, `${target.tagName} must retain ${key}`);
            assert.equal(harness.byId('g-shots').textContent, 0);
            harness.step(0);
            assert.deepEqual(harness.flyCalls.at(-1).slice(1, 4), initialAim, 'native control keys must not change aim');
        }
    }
    // The browser's subsequent native button click still works exactly once.
    harness.key(' ', { target: harness.byId('sound') });
    harness.click('sound');
    assert.equal(harness.byId('sound').attributes['aria-pressed'], 'true');
    assert.equal(harness.byId('g-shots').textContent, 0);
});

test('Ctrl, Alt, Meta, composition and already-consumed keys leave the game untouched', () => {
    const harness = makeHarness();
    harness.click('launch');
    harness.step(0);
    const initialAim = harness.flyCalls.at(-1).slice(1, 4);
    for (const flag of ['ctrlKey', 'altKey', 'metaKey', 'isComposing', 'defaultPrevented']) {
        for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar']) {
            const event = harness.key(key, { [flag]: true });
            assert.equal(event.defaultPrevented, flag === 'defaultPrevented');
            assert.equal(harness.byId('g-shots').textContent, 0);
            harness.step(0);
            assert.deepEqual(harness.flyCalls.at(-1).slice(1, 4), initialAim);
        }
    }
    for (const key of ['Shift', 'Control', 'Alt', 'Meta', 'Enter', 'Tab']) {
        assert.equal(harness.key(key).defaultPrevented, false);
    }
});

test('canvas and background keyboard controls keep normal aim, Shift fine aim, speed and single launch', () => {
    const harness = makeHarness();
    harness.click('launch');
    harness.step(0);
    const startingAngle = Math.atan2(harness.flyCalls.at(-1)[2], harness.flyCalls.at(-1)[1]);
    const speed = harness.byId('g-speed').textContent;
    assert.equal(harness.key('ArrowRight').defaultPrevented, true);
    assert.equal(harness.key('ArrowLeft', { shiftKey: true }).defaultPrevented, true);
    harness.step(0);
    const angle = Math.atan2(harness.flyCalls.at(-1)[2], harness.flyCalls.at(-1)[1]);
    assert.ok(Math.abs(angle - startingAngle - 0.45 * Math.PI / 180) < 1e-12);
    assert.equal(harness.key('ArrowUp', { target: new Element('body') }).defaultPrevented, true);
    assert.equal(harness.byId('g-speed').textContent, speed + 2);
    harness.key('ArrowDown');
    assert.equal(harness.byId('g-speed').textContent, speed);
    harness.key('Spacebar');
    assert.equal(harness.byId('g-shots').textContent, 1);
    assert.equal(harness.key(' ').defaultPrevented, false, 'a held or repeated key must not launch again in flight');
    assert.equal(harness.byId('g-shots').textContent, 1);
});

function showResult(harness) {
    harness.click('launch');
    harness.key(' ');
    harness.step(16);
    harness.runTimers(0);
    assert.equal(harness.byId('share').hidden, false);
}

test('Copy result says Copied only after the clipboard write resolves', async () => {
    let resolveWrite;
    let copiedText;
    const harness = makeHarness({ reducedMotion: true, clipboard: {
        writeText(text) { copiedText = text; return new Promise(resolve => { resolveWrite = resolve; }); }
    } });
    showResult(harness);
    harness.click('share');
    assert.equal(harness.byId('share').textContent, 'Copy result', 'pending clipboard work is not success');
    assert.equal(copiedText, harness.byId('card-share').textContent);
    resolveWrite();
    await Promise.resolve();
    assert.equal(harness.byId('share').textContent, 'Copied');
    assert.equal(harness.byId('say').textContent, 'Result copied.');
    harness.runTimers(1600);
    assert.equal(harness.byId('share').textContent, 'Copy result');
});

for (const [name, clipboard] of [
    ['rejection', { writeText: () => Promise.reject(new Error('Permission denied')) }],
    ['unavailable API', undefined],
    ['missing writeText', {}],
    ['synchronous exception', { writeText() { throw new Error('SecurityError'); } }]
]) {
    test(`Copy result provides honest manual fallback on ${name}`, async () => {
        const harness = makeHarness({ reducedMotion: true, clipboard });
        showResult(harness);
        const original = harness.byId('card-share').textContent;
        harness.click('share');
        await Promise.resolve();
        assert.equal(harness.byId('share').textContent, 'Copy result');
        assert.match(harness.byId('say').textContent, /could not copy.*select the result.*copy it manually/i);
        assert.equal(harness.byId('card-share').textContent, original);
        assert.equal(harness.byId('card-share').hidden, false);
        harness.runTimers(1600);
        assert.notEqual(harness.byId('share').textContent, 'Copied');
    });
}

test('Copy result can be retried after failure without keeping the failed status', async () => {
    let attempt = 0;
    const harness = makeHarness({ reducedMotion: true, clipboard: {
        writeText: () => ++attempt === 1 ? Promise.reject(new Error('Denied')) : Promise.resolve()
    } });
    showResult(harness);
    harness.click('share');
    await Promise.resolve();
    assert.match(harness.byId('say').textContent, /Could not copy/);
    harness.click('share');
    await Promise.resolve();
    assert.equal(harness.byId('share').textContent, 'Copied');
    assert.equal(harness.byId('say').textContent, 'Result copied.');
});
