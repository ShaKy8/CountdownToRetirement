'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../light-lasso/engine.js');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'light-lasso/index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'light-lasso/script.js'), 'utf8');
function harness({ blocked = false, stored = {} } = {}) {
  const nodes = new Map(), listeners = {}, windowListeners = {}, frames = [], states = [], audioCreations = [];
  let now = 0;
  const context = new Proxy({}, { get(target, prop) {
    if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => ({ addColorStop() {} });
    return target[prop] || (() => {});
  }, set(target, prop, value) { target[prop] = value; return true; } });
  const document = { hidden: false, activeElement: null, getElementById: (id) => nodes.get(id) || null,
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); } };
  for (const [, id] of html.matchAll(/\bid="([^"]+)"/g)) {
    assert.ok(!nodes.has(id), 'unique id ' + id);
    nodes.set(id, { id, hidden: ['result', 'pause-panel', 'help-panel'].includes(id), textContent: '', disabled: false,
      style: {}, attrs: {}, listeners: {}, width: 720, height: 820,
      classList: { toggle() {} },
      setAttribute(key, value) { this.attrs[key] = value; },
      addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
      focus() { const old = document.activeElement; document.activeElement = this; if (old && old !== this) (old.listeners.blur || []).forEach(fn => fn({})); },
      getBoundingClientRect() { return { left: 0, top: 0, width: 720, height: 820 }; },
      setPointerCapture() {}, releasePointerCapture() {}, getContext() { return context; }
    });
  }
  const storage = { getItem(key) { if (blocked) throw Error('unavailable'); return stored[key] || null; }, setItem(key, value) { if (blocked) throw Error('unavailable'); stored[key] = value; } };
  const api = { ...L, create(seed) { const state = L.create(seed); states.push(state); return state; } };
  const window = { Lasso: api, devicePixelRatio: 1, matchMedia: () => ({ matches: false }),
    addEventListener(type, fn) { (windowListeners[type] ||= []).push(fn); },
    AudioContext: function () { audioCreations.push(true); this.state = 'running'; this.currentTime = 0; this.suspend = this.resume = () => Promise.resolve(); this.createOscillator = () => ({ frequency: { setValueAtTime() {} }, connect() {}, disconnect() {}, start() {}, stop() {} }); this.createGain = () => ({ gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }); }
  };
  const sandbox = { window, document, localStorage: storage, ResizeObserver: class { constructor(fn) { this.fn = fn; } observe() { this.fn(); } },
    requestAnimationFrame: fn => frames.push(fn), crypto: { getRandomValues(a) { a[0] = 17342; } }, console, Date, Math, Set, Uint32Array };
  vm.runInNewContext(source, sandbox, { filename: 'light-lasso/script.js' });
  const fire = (id, type = 'click', props = {}) => {
    const event = { code: '', pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0, clientX: 0, clientY: 0, repeat: false, preventDefault() { this.defaultPrevented = true; }, ...props };
    (nodes.get(id).listeners[type] || []).forEach(fn => fn(event)); return event;
  };
  const frame = (seconds = 1 / 60) => { now += seconds * 1000; const next = frames.shift(); assert.ok(next, 'animation is scheduled'); next(now); };
  const advance = seconds => { for (let i = 0; i < seconds * 60; i++) frame(); };
  const globalEvent = (type, props = {}) => (windowListeners[type] || []).forEach(fn => fn(props));
  const documentEvent = (type, props = {}) => (listeners[type] || []).forEach(fn => fn(props));
  const cleanCatch = () => {
    const state = states.at(-1);
    const e = state.entities.find(e => e.type === 'light' && !state.entities.some(other => other.type === 'ember' && Math.hypot(other.x - e.x, other.y - e.y) < 40));
    assert.ok(e); const pts = Array.from({ length: 25 }, (_, i) => ({ x: e.x + Math.cos(i / 24 * Math.PI * 2) * 24, y: e.y + Math.sin(i / 24 * Math.PI * 2) * 24 }));
    fire('field', 'pointerdown', { clientX: pts[0].x, clientY: pts[0].y });
    pts.slice(1).forEach(p => fire('field', 'pointermove', { clientX: p.x, clientY: p.y }));
    fire('field', 'pointerup', { clientX: pts.at(-1).x, clientY: pts.at(-1).y }); return state;
  };
  return { nodes, states, stored, document, fire, frame, advance, globalEvent, documentEvent, cleanCatch, audioCreations };
}

test('shell and script agree on every DOM id', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]);
  for (const [, id] of source.matchAll(/\$\('([^']+)'\)/g)) assert.ok(ids.includes(id), id);
  assert.equal(ids.length, new Set(ids).size);
});
test('boot is silent and waits for intentional play', () => {
  const h = harness(); h.advance(4); assert.equal(h.states.at(-1).time, 0); assert.equal(h.audioCreations.length, 0); assert.equal(h.nodes.get('intro').hidden, false);
});
test('start waits for first gesture, then a mouse loop earns points', () => {
  const h = harness(); h.fire('start'); h.advance(2); assert.equal(h.states.at(-1).time, 0);
  const state = h.cleanCatch(); assert.ok(state.score > 0); assert.equal(state.drawing, false); assert.equal(h.nodes.get('score').textContent, state.score.toLocaleString());
  h.advance(1); assert.ok(state.time > 0.9); assert.equal(h.nodes.get('time').textContent, 74);
});
test('pause, help, resume and restart have no time leaks', () => {
  const h = harness(); h.fire('start'); h.cleanCatch(); h.advance(2); const original = h.states.at(-1), at = original.time;
  h.fire('pause'); h.advance(5); assert.equal(original.time, at);
  h.fire('help'); h.advance(2); h.fire('close-help'); assert.equal(h.nodes.get('pause-panel').hidden, false);
  h.fire('resume'); h.advance(2); assert.ok(original.time > at + 1.8);
  h.fire('restart'); assert.equal(h.states.at(-1).score, 0); assert.equal(h.states.at(-1).time, 0); assert.equal(h.states.at(-1).seed, original.seed);
});
test('pointer cancellation and extra fingers never score or stick', () => {
  const h = harness(); h.fire('start'); const s = h.states.at(-1);
  h.fire('field', 'pointerdown', { clientX: 200, clientY: 200 });
  h.fire('field', 'pointerdown', { pointerId: 2, isPrimary: false, clientX: 400, clientY: 400 });
  h.fire('field', 'pointercancel'); assert.equal(s.drawing, false); assert.equal(s.score, 0);
  h.cleanCatch(); assert.ok(s.score > 0);
});
test('backgrounding during a stroke pauses and releases the stroke', () => {
  const h = harness(); h.fire('start'); h.fire('field', 'pointerdown', { clientX: 200, clientY: 200 }); h.advance(1);
  const s = h.states.at(-1), at = s.time; h.document.hidden = true; h.documentEvent('visibilitychange'); h.advance(10);
  assert.equal(s.time, at); assert.equal(s.drawing, false); assert.equal(h.nodes.get('pause-panel').hidden, false);
});
test('backgrounding help from ready returns to paused ready without starting clock', () => {
  const h = harness(); h.fire('start'); h.fire('help'); h.document.hidden = true; h.documentEvent('visibilitychange'); h.fire('close-help');
  assert.equal(h.nodes.get('pause-panel').hidden, false); h.document.hidden = false; h.fire('resume'); h.advance(2); assert.equal(h.states.at(-1).time, 0);
});
test('keyboard controls can start, cancel, pause and resume without pointer input', () => {
  const h = harness(); h.fire('start'); h.fire('keyboard-mode'); h.fire('field', 'keydown', { code: 'Space' });
  assert.equal(h.states.at(-1).drawing, true); h.fire('field', 'keydown', { code: 'ArrowRight' }); h.advance(0.5); h.globalEvent('keyup', { code: 'ArrowRight' });
  h.fire('field', 'keydown', { code: 'Escape' }); assert.equal(h.states.at(-1).drawing, false); assert.equal(h.nodes.get('pause-panel').hidden, true);
  h.fire('field', 'keydown', { code: 'Escape' }); assert.equal(h.nodes.get('pause-panel').hidden, false); h.fire('resume'); assert.equal(h.nodes.get('pause-panel').hidden, true);
});
test('daily completion persists best and instant replay is a fresh run', () => {
  const h = harness(); h.fire('start'); const s = h.cleanCatch(); h.advance(76);
  assert.equal(s.ended, true); assert.equal(h.nodes.get('result').hidden, false); assert.equal(h.nodes.get('time').textContent, 0);
  const record = JSON.parse(h.stored['branyon.light-lasso.v1']); assert.equal(record.days[L.localDay()], s.score);
  h.fire('again'); assert.equal(h.nodes.get('result').hidden, true); assert.equal(h.states.at(-1).score, 0);
});
test('shuffle completion updates all-time best without changing daily', () => {
  const h = harness(); h.fire('shuffle'); const s = h.cleanCatch(); h.advance(76);
  const record = JSON.parse(h.stored['branyon.light-lasso.v1']); assert.equal(record.best, s.score); assert.deepEqual(record.days, {});
});
test('blocked localStorage still permits full game and truthful result copy', () => {
  const h = harness({ blocked: true }); h.fire('start'); h.cleanCatch(); h.advance(76);
  assert.equal(h.nodes.get('result').hidden, false); assert.match(h.nodes.get('storage-note').textContent, /this visit/);
});
test('sound needs user toggle and does not block gameplay', () => {
  const h = harness(); assert.equal(h.audioCreations.length, 0); h.fire('sound'); assert.equal(h.audioCreations.length, 1);
  assert.equal(h.nodes.get('sound').attrs['aria-pressed'], 'true'); h.fire('start'); h.cleanCatch(); h.fire('sound'); assert.equal(h.nodes.get('sound').attrs['aria-pressed'], 'false');
});
test('shipping lists, stamps, and discoverability include all game files', () => {
  const deploy = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
  for (const file of ['index.html', 'engine.js', 'script.js', 'styles.css', 'favicon.svg']) assert.ok(deploy.includes("--include 'light-lasso/" + file + "'"), file);
  assert.ok(deploy.includes("- 'light-lasso/**'"));
  assert.ok(fs.readFileSync(path.join(root, 'scripts/stamp-assets.mjs'), 'utf8').includes('light-lasso/index.html'));
  for (const file of ['index.html', '404.html', 'sitemap.xml']) assert.ok(fs.readFileSync(path.join(root, file), 'utf8').includes('/light-lasso/'), file);
});
test('game remains static and CSP-compatible with no remote services', () => {
  assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|https?:\/\//);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>[\s\S]+?<\/script>|\son\w+=|https?:\/\//);
  assert.match(html, /name="viewport"[^>]*width=device-width/); assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1/);
});
