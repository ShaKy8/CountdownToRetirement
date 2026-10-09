'use strict';

// Execute the shipped UI script unchanged. Only the browser, clock, audio and
// precomputed flight are fixtures; input handlers, replay, rendering, scoring
// and clipboard feedback all run through their real production code.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
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
            elements.set(id, new Element(['launch', 'free', 'share', 'sound', 'today'].includes(id) ? 'button' : 'div'));
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
    const levels = [], confirmations = [], radii = [];
    const rect = { left: 0, top: 0, width: options.width ?? 800, height: options.height ?? 900 };
    let savedRaw = options.saved || null;
    const timers = [], intervals = [];
    const handlers = {};
    let frameCallback = null;
    let now = 0;
    const context2d = {
        createRadialGradient(...args) {
            assert.ok(args.every(Number.isFinite), 'Gradient coordinates must be finite');
            assert.ok(args[2] >= 0 && args[5] >= 0, 'Gradient radii must be non-negative');
            radii.push(args[2], args[5]);
            return { addColorStop() {} };
        }
    };
    for (const method of ['setTransform', 'clearRect', 'fillRect', 'save', 'restore', 'translate',
        'beginPath', 'arc', 'fill', 'stroke', 'moveTo', 'lineTo', 'setLineDash']) {
        context2d[method] = function (...args) {
            if (method === 'arc') assert.ok(args[2] >= 0, 'Canvas arc radius must be non-negative');
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
    stage.getBoundingClientRect = () => rect;
    stage.setPointerCapture = () => {};
    byId('share').textContent = 'Copy result';
    const window = {
        Daily,
        Slingshot: {
            ...Sling,
            puzzleDay: options.realDate ? Sling.puzzleDay : () => 251,
            makeLevel(seed) {
                const result = options.realLevels ? Sling.makeLevel(seed) : level;
                levels.push({ seed, level: result });
                return result;
            },
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
            getItem: () => { if (options.storageError) throw new Error('storage denied'); return savedRaw; },
            setItem(key, value) { if (options.storageError) throw new Error('storage denied'); writes.push({ key, value }); savedRaw = value; }
        },
        location: { search: options.search || '' },
        devicePixelRatio: options.dpr ?? 1,
        confirm(message) { confirmations.push(message); return options.confirm !== false; },
        matchMedia: query => ({ matches: query.includes('reduced-motion') && !!options.reducedMotion }),
        performance: { now: () => now },
        addEventListener(type, handler) { handlers[type] = handler; },
        requestAnimationFrame(callback) { frameCallback = callback; },
        setTimeout(callback, delay) { timers.push({ callback, delay }); },
        setInterval(callback, delay) { intervals.push({ callback, delay }); }
    };
    const document = { getElementById: byId, addEventListener(type, handler) { handlers[type] = handler; } };
    const navigator = options.clipboard === undefined ? {} : { clipboard: options.clipboard };
    vm.runInNewContext(options.source || source, { window, document, navigator, URLSearchParams, Element, Date: options.Date || Date }, { filename: 'slingshot/script.js' });
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
        byId, key, level, flight, flyCalls, audioEvents, flying, probePositions, writes, window, handlers, intervals,
        document, rect, levels, confirmations, radii,
        setSaved(value) { savedRaw = value; },
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
        },
        runNextTimer(delay) {
            const index = timers.findIndex(timer => timer.delay === delay);
            assert.ok(index >= 0, 'a matching timer must be scheduled');
            timers.splice(index, 1)[0].callback();
        }
    };
}

function expectedPoint(harness, index) {
    const k = Math.min(800 / (Sling.WORLD.w + 24), (900 - 200 - 70) / (Sling.WORLD.h + 24));
    const ox = (800 - Sling.WORLD.w * k) / 2;
    const oy = 200 + ((900 - 200 - 70) - Sling.WORLD.h * k) / 2;
    return [ox + harness.flight[index * 2] * k, oy + harness.flight[index * 2 + 1] * k];
}


module.exports = { makeHarness, expectedPoint, Element, source };
