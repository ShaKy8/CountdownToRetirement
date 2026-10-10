'use strict';

// These are modeled Safari/iPhone event-order regressions, not physical iPhone
// tests. The VM models propagation, passive listeners, viewport movement and
// capture failure; only a real device can verify WebKit's native event delivery.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const L = require('../light-lasso/engine.js');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'light-lasso/index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'light-lasso/script.js'), 'utf8');

function harness({ capture = 'supported' } = {}) {
  const nodes = new Map(), frames = [], states = [], captures = [], observers = [];
  const drawingStarts = new WeakMap(), focusCalls = [];
  let now = 0, rect = { left: 16, top: 180, width: 358, height: 408 };
  const context = new Proxy({}, {
    get(target, key) {
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
      return target[key] || (() => {});
    },
    set(target, key, value) { target[key] = value; return true; }
  });
  function eventTarget(id) {
    return {
      id, listeners: {},
      addEventListener(type, fn, options = {}) {
        const normalized = typeof options === 'boolean' ? { capture: options } : options;
        (this.listeners[type] ||= []).push({ fn, ...normalized });
      },
      removeEventListener(type, fn) {
        this.listeners[type] = (this.listeners[type] || []).filter(entry => entry.fn !== fn);
      }
    };
  }
  const document = Object.assign(eventTarget('document'), {
    hidden: false, activeElement: null,
    getElementById(id) { return nodes.get(id) || null; }
  });
  document.body = eventTarget('body');
  const window = Object.assign(eventTarget('window'), {
    devicePixelRatio: 3, matchMedia: () => ({ matches: true })
  });
  for (const [, id] of html.matchAll(/\bid="([^"]+)"/g)) {
    const node = Object.assign(eventTarget(id), {
      hidden: ['result', 'pause-panel', 'help-panel'].includes(id), textContent: '', disabled: false,
      width: 720, height: 820, style: {}, attrs: {}, classList: { toggle() {} },
      setAttribute(key, value) { this.attrs[key] = value; },
      focus(options) { document.activeElement = this; focusCalls.push({ id, options }); },
      getBoundingClientRect() { return { ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height }; },
      getContext() { return context; },
      setPointerCapture() { if (capture === 'throws') throw Error('Pointer capture unavailable'); },
      releasePointerCapture() {}, hasPointerCapture() { return capture === 'supported'; }
    });
    if (capture === 'missing') { delete node.setPointerCapture; delete node.releasePointerCapture; delete node.hasPointerCapture; }
    nodes.set(id, node);
  }
  window.Lasso = { ...L,
    create(seed) {
      const state = L.create(seed);
      let drawing = state.drawing;
      drawingStarts.set(state, 0);
      Object.defineProperty(state, 'drawing', {
        get() { return drawing; },
        set(value) { drawing = value; if (value) drawingStarts.set(state, drawingStarts.get(state) + 1); },
        enumerable: true
      });
      states.push(state); return state;
    },
    capture(state, points) {
      const result = L.capture(state, points);
      captures.push({ state, points: Array.from(points, p => ({ x: p.x, y: p.y })), result });
      return result;
    }
  };
  const sandbox = {
    window, document, localStorage: { getItem() { return null; }, setItem() {} },
    ResizeObserver: class {
      constructor(fn) { observers.push(fn); }
      observe() {} disconnect() {}
    },
    requestAnimationFrame: fn => frames.push(fn),
    crypto: { getRandomValues(a) { a[0] = 17342; } }, console, Date, Math, Set, Uint32Array
  };
  vm.runInNewContext(source, sandbox, { filename: 'light-lasso/script.js' });

  // Events from the canvas bubble through document/window. Document-targeted
  // events simulate a pointer leaving the canvas without usable capture.
  function dispatch(target, type, props = {}) {
    if (typeof target === 'string') target = nodes.get(target);
    const event = {
      type, target, currentTarget: null, code: '', pointerId: 1, isPrimary: true,
      pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1,
      clientX: 0, clientY: 0, repeat: false, cancelable: true, defaultPrevented: false,
      preventDefault() { if (this.cancelable && !this._passive) this.defaultPrevented = true; },
      stopPropagation() { this._stopped = true; },
      ...props
    };
    const route = target === window ? [window] : target === document ? [document, window] : [target, document, window];
    function invoke(node, capturePhase) {
      event.currentTarget = node;
      for (const entry of node.listeners[type] || []) {
        if (!!entry.capture !== capturePhase) continue;
        event._passive = !!entry.passive;
        entry.fn(event);
      }
    }
    for (const node of [...route].reverse()) { invoke(node, true); if (event._stopped) break; }
    if (!event._stopped) for (const node of route) { invoke(node, false); if (event._stopped) break; }
    event._passive = false;
    return event;
  }
  const field = nodes.get('field');
  const fire = (id, type = 'click', props = {}) => dispatch(id, type, props);
  const frame = (seconds = 1 / 60) => {
    now += seconds * 1000;
    const next = frames.shift(); assert.ok(next, 'animation remains scheduled'); next(now);
  };
  const toClient = (p, geometry = rect) => ({ clientX: geometry.left + p.x / L.WIDTH * geometry.width, clientY: geometry.top + p.y / L.HEIGHT * geometry.height });
  const touch = (identifier, p, geometry = rect) => ({ identifier, target: field, ...toClient(p, geometry) });
  const touchEvent = (type, changedTouches, touches = type === 'touchend' || type === 'touchcancel' ? [] : changedTouches, target = field) => dispatch(target, type, {
    changedTouches, touches, targetTouches: touches.filter(t => t.target === target)
  });
  function circle(state = states.at(-1)) {
    const entity = state.entities.find(e => e.type === 'light' && !state.entities.some(other => other !== e && Math.hypot(other.x - e.x, other.y - e.y) < 40));
    assert.ok(entity, 'fixture has an isolated light');
    return Array.from({ length: 25 }, (_, i) => ({ x: entity.x + Math.cos(i / 24 * Math.PI * 2) * 24, y: entity.y + Math.sin(i / 24 * Math.PI * 2) * 24 }));
  }
  function touchCatch(identifier = 11) {
    const points = circle();
    touchEvent('touchstart', [touch(identifier, points[0])]);
    points.slice(1).forEach(p => touchEvent('touchmove', [touch(identifier, p)]));
    touchEvent('touchend', [touch(identifier, points.at(-1))]);
    return states.at(-1);
  }
  function pointerCatch({ pointerId = 1, pointerType = 'mouse', movesOnDocument = false, loseCapture = false } = {}) {
    const points = circle(), props = { pointerId, pointerType };
    fire('field', 'pointerdown', { ...props, ...toClient(points[0]) });
    const target = movesOnDocument ? document : field;
    points.slice(1).forEach((p, i) => {
      if (loseCapture && i === 6) {
        fire('field', 'lostpointercapture', props);
        assert.equal(states.at(-1).drawing, true, 'lost capture alone preserves the stroke');
      }
      dispatch(target, 'pointermove', { ...props, ...toClient(p) });
    });
    dispatch(target, 'pointerup', { ...props, ...toClient(points.at(-1)) });
    return states.at(-1);
  }
  return {
    nodes, field, document, window, states, captures, focusCalls, drawingStarts,
    fire, dispatch, frame, toClient, touch, touchEvent, circle, touchCatch, pointerCatch,
    getRect: () => ({ ...rect }), setRect(value) { rect = { ...rect, ...value }; },
    resize() { observers.forEach(fn => fn()); dispatch(window, 'resize'); }
  };
}

function ready(options) { const h = harness(options); h.fire('start'); return h; }
function assertPath(h, points) {
  const actual = h.captures.at(-1).points;
  assert.equal(actual.length, points.length, 'only the owned event stream contributes samples');
  points.forEach((point, i) => {
    assert.ok(Math.abs(actual[i].x - point.x) < 1e-8, 'sample ' + i + ' keeps its logical x');
    assert.ok(Math.abs(actual[i].y - point.y) < 1e-8, 'sample ' + i + ' keeps its logical y');
  });
}
function assertCaughtOnce(h, state = h.states.at(-1), points = 10) {
  assert.equal(state.drawing, false, 'released stroke no longer draws');
  assert.equal(state.score, points, 'real engine awards the expected clean catch');
  assert.equal(state.caught, 1);
  assert.equal(state.loops, 1);
  assert.equal(h.captures.filter(c => c.state === state).length, 1, 'capture runs exactly once');
}

test('modeled native touch uses non-passive listeners, prevents scrolling and scores once', () => {
  const h = ready(), points = h.circle(), state = h.states.at(-1);
  assert.ok(h.field.listeners.touchstart?.some(entry => entry.passive === false), 'canvas touchstart explicitly opts out of passive handling');
  assert.ok([h.field, h.document, h.window].some(node => node.listeners.touchmove?.some(entry => entry.passive === false)), 'touchmove explicitly opts out of passive handling');
  const start = h.touchEvent('touchstart', [h.touch(7, points[0])]);
  assert.equal(start.defaultPrevented, true); assert.equal(state.drawing, true);
  for (const p of points.slice(1)) assert.equal(h.touchEvent('touchmove', [h.touch(7, p)]).defaultPrevented, true);
  h.touchEvent('touchend', [h.touch(7, points.at(-1))]);
  h.touchEvent('touchend', [h.touch(7, points.at(-1))]);
  assertCaughtOnce(h); assertPath(h, points);
});

test('modeled Safari pointerdown before touchstart is adopted without resetting or double-starting', () => {
  const h = ready(), points = h.circle(), state = h.states.at(-1);
  h.nodes.get('sound').focus(); const focusCount = h.focusCalls.length;
  h.fire('field', 'pointerdown', { pointerId: 73, pointerType: 'touch', ...h.toClient(points[0]) });
  assert.equal(state.drawing, true);
  h.touchEvent('touchstart', [h.touch(908, points[0])]);
  assert.equal(h.drawingStarts.get(state), 1, 'compatibility pointer and native touch share one start');
  assert.equal(h.focusCalls.length, focusCount, 'touch input does not force focus and move the visual viewport');
  for (const type of ['pointermove', 'pointerup', 'pointercancel', 'lostpointercapture']) {
    h.fire('field', type, { pointerId: 73, pointerType: 'touch', ...h.toClient({ x: 0, y: 0 }) });
    assert.equal(state.drawing, true, type + ' cannot terminate or corrupt the native-owned stroke');
    assert.equal(h.captures.length, 0);
  }
  points.slice(1).forEach(p => h.touchEvent('touchmove', [h.touch(908, p)]));
  h.touchEvent('touchend', [h.touch(908, points.at(-1))]);
  h.fire('field', 'pointerup', { pointerId: 73, pointerType: 'touch', ...h.toClient(points.at(-1)) });
  assertCaughtOnce(h); assertPath(h, points);
});

test('modeled Safari touchstart before compatibility pointerdown keeps native ownership', () => {
  const h = ready(), points = h.circle(), state = h.states.at(-1);
  h.touchEvent('touchstart', [h.touch(18, points[0])]);
  h.fire('field', 'pointerdown', { pointerId: 82, pointerType: 'touch', ...h.toClient({ x: 0, y: 0 }) });
  assert.equal(h.drawingStarts.get(state), 1);
  points.slice(1).forEach(p => {
    h.touchEvent('touchmove', [h.touch(18, p)]);
    h.dispatch(h.document, 'pointermove', { pointerId: 82, pointerType: 'touch', ...h.toClient({ x: L.WIDTH, y: L.HEIGHT }) });
  });
  h.touchEvent('touchend', [h.touch(18, points.at(-1))]);
  h.dispatch(h.document, 'pointerup', { pointerId: 82, pointerType: 'touch' });
  assertCaughtOnce(h);
});

test('touch identifiers survive a second finger starting, ending and cancelling', () => {
  const h = ready(), points = h.circle(), state = h.states.at(-1);
  const other = h.touch(99, { x: L.WIDTH, y: L.HEIGHT });
  let primary = h.touch(4, points[0]);
  h.touchEvent('touchstart', [primary]);
  h.touchEvent('touchstart', [other], [other, primary]);
  assert.equal(h.drawingStarts.get(state), 1, 'a second finger cannot restart the loop');
  points.slice(1).forEach((p, i) => {
    primary = h.touch(4, p);
    h.touchEvent('touchmove', i % 2 ? [other, primary] : [primary], [other, primary], h.document);
    if (i === 5) h.touchEvent('touchend', [other], [primary], h.document);
    if (i === 8) h.touchEvent('touchcancel', [other], [primary], h.document);
    assert.equal(state.drawing, true, 'only the tracked identifier can end the gesture');
  });
  h.touchEvent('touchend', [other, primary], [], h.document);
  assertCaughtOnce(h);
});

test('primary touchcancel abandons the loop without scoring and permits the next touch', () => {
  const h = ready(), points = h.circle(), state = h.states.at(-1);
  h.touchEvent('touchstart', [h.touch(12, points[0])]);
  points.slice(1).forEach(p => h.touchEvent('touchmove', [h.touch(12, p)]));
  h.touchEvent('touchcancel', [h.touch(12, points.at(-1))], [], h.document);
  assert.equal(state.drawing, false); assert.equal(state.score, 0); assert.equal(h.captures.length, 0);
  h.touchEvent('touchend', [h.touch(12, points.at(-1))]);
  h.touchCatch(13); assertCaughtOnce(h);
});

test('touches outside the canvas remain scrollable and cannot start a loop', () => {
  const h = ready(), state = h.states.at(-1), outside = { ...h.touch(1, { x: 200, y: 200 }), target: h.document.body };
  for (const type of ['touchstart', 'touchmove', 'touchend']) {
    const event = h.touchEvent(type, [outside], type === 'touchend' ? [] : [outside], h.document.body);
    assert.equal(event.defaultPrevented, false, type + ' outside the canvas remains browser-owned');
    assert.equal(state.drawing, false);
  }
  assert.equal(state.time, 0); assert.equal(state.score, 0);
  h.touchCatch(); assertCaughtOnce(h);
});

for (const pointerType of ['mouse', 'pen', 'touch']) {
  for (const capture of ['missing', 'throws', 'supported']) {
    test(pointerType + ' document fallback survives ' + capture + ' capture and lostpointercapture', () => {
      const h = ready({ capture });
      h.pointerCatch({ pointerId: 27, pointerType, movesOnDocument: true, loseCapture: true });
      assertCaughtOnce(h);
    });
  }
  test(pointerType + ' true pointercancel cancels document-owned input and allows another loop', () => {
    const h = ready({ capture: 'throws' }), state = h.states.at(-1), points = h.circle();
    h.fire('field', 'pointerdown', { pointerId: 9, pointerType, ...h.toClient(points[0]) });
    points.slice(1).forEach(p => h.dispatch(h.document, 'pointermove', { pointerId: 9, pointerType, ...h.toClient(p) }));
    h.dispatch(h.document, 'pointercancel', { pointerId: 9, pointerType });
    assert.equal(state.drawing, false); assert.equal(state.score, 0); assert.equal(h.captures.length, 0);
    h.pointerCatch({ pointerId: 10, pointerType, movesOnDocument: true }); assertCaughtOnce(h);
  });
}

for (const nextId of [1, 42]) {
  test('a new primary pointerdown recovers a missing final event with pointer id ' + nextId, () => {
    const h = ready(), state = h.states.at(-1);
    h.fire('field', 'pointerdown', { pointerId: 1, ...h.toClient({ x: 10, y: 10 }) });
    h.dispatch(h.document, 'pointermove', { pointerId: 1, ...h.toClient({ x: 90, y: 90 }) });
    assert.equal(state.drawing, true);
    h.pointerCatch({ pointerId: nextId, movesOnDocument: true }); assertCaughtOnce(h);
  });
}

test('a secondary pointerdown cannot replace an active primary pointer', () => {
  const h = ready(), state = h.states.at(-1), points = h.circle();
  h.fire('field', 'pointerdown', { pointerId: 1, pointerType: 'touch', ...h.toClient(points[0]) });
  h.fire('field', 'pointerdown', { pointerId: 2, pointerType: 'touch', isPrimary: false, ...h.toClient({ x: 0, y: 0 }) });
  h.dispatch(h.document, 'pointercancel', { pointerId: 2, pointerType: 'touch', isPrimary: false });
  assert.equal(state.drawing, true); assert.equal(h.drawingStarts.get(state), 1);
  points.slice(1).forEach(p => h.dispatch(h.document, 'pointermove', { pointerId: 1, pointerType: 'touch', ...h.toClient(p) }));
  h.dispatch(h.document, 'pointerup', { pointerId: 1, pointerType: 'touch', ...h.toClient(points.at(-1)) });
  assertCaughtOnce(h);
});

for (const input of ['touch', 'pointer']) {
  test(input + ' freezes phone scale and backing size while following the current canvas origin', () => {
    const h = ready(), state = h.states.at(-1), points = h.circle(), originalRect = h.getRect();
    const backing = { width: h.field.width, height: h.field.height };
    const send = (kind, p) => {
      // The field may move with browser chrome, while the active board keeps
      // its original CSS size. Contacts follow that newly rendered origin.
      const geometry = { ...h.getRect(), width: originalRect.width, height: originalRect.height };
      return input === 'touch'
        ? h.touchEvent('touch' + kind, [h.touch(54, p, geometry)])
        : h.dispatch(kind === 'start' ? h.field : h.document, 'pointer' + (kind === 'start' ? 'down' : kind === 'end' ? 'up' : 'move'), { pointerId: 54, ...h.toClient(p, geometry) });
    };
    send('start', points[0]);
    assert.equal(h.nodes.get('board').style.width, originalRect.width + 'px', 'board CSS width is stable during the gesture');
    assert.equal(h.nodes.get('board').style.height, originalRect.height + 'px');
    points.slice(1).forEach((p, i) => {
      if (i === 5) {
        h.setRect({ left: 31, top: 75, width: 310, height: 370 }); h.resize(); h.frame();
        assert.equal(h.field.width, backing.width, 'ResizeObserver cannot erase the active canvas');
        assert.equal(h.field.height, backing.height);
        assert.equal(state.drawing, true);
      }
      send('move', p);
    });
    send('end', points.at(-1)); assertCaughtOnce(h); assertPath(h, points);
    assert.equal(h.nodes.get('board').style.width, '', 'responsive board sizing resumes after release');
    assert.equal(h.nodes.get('board').style.height, '');
    h.frame();
    assert.equal(h.field.width, 620, 'the deferred backing update applies after release');
    assert.equal(h.field.height, 740);
  });
}

test('cancelling a native touch also applies a deferred resize', () => {
  const h = ready(), point = h.circle()[0];
  h.touchEvent('touchstart', [h.touch(1, point)]);
  h.setRect({ width: 300, height: 360 }); h.resize();
  h.touchEvent('touchcancel', [h.touch(1, point)]); h.frame();
  assert.equal(h.field.width, 600); assert.equal(h.field.height, 720);
  assert.equal(h.states.at(-1).drawing, false); assert.equal(h.captures.length, 0);
  h.touchCatch(2); assertCaughtOnce(h);
});

for (const trigger of ['hidden', 'pagehide']) {
  test(trigger + ' pauses an active native touch and resume accepts a fresh identifier', () => {
    const h = ready(), state = h.states.at(-1), points = h.circle();
    h.touchEvent('touchstart', [h.touch(11, points[0])]); h.frame(); h.frame();
    if (trigger === 'hidden') { h.document.hidden = true; h.dispatch(h.document, 'visibilitychange'); }
    else h.dispatch(h.window, 'pagehide');
    const time = state.time; h.frame(1); h.frame(1);
    assert.equal(state.time, time); assert.equal(state.drawing, false); assert.equal(h.nodes.get('pause-panel').hidden, false);
    h.touchEvent('touchend', [h.touch(11, points.at(-1))]);
    assert.equal(h.captures.length, 0);
    h.document.hidden = false; h.dispatch(h.window, 'pageshow'); h.fire('resume');
    h.touchCatch(12); assertCaughtOnce(h);
  });
}

for (const action of ['help', 'restart', 'quit']) {
  test(action + ' clears native ownership and stale events cannot affect the reopened game', () => {
    const h = ready(), points = h.circle(), original = h.states.at(-1);
    h.touchEvent('touchstart', [h.touch(22, points[0])]);
    points.slice(1).forEach(p => h.touchEvent('touchmove', [h.touch(22, p)]));
    h.fire(action);
    assert.equal(original.drawing, false); assert.equal(original.score, 0);
    if (action === 'help') h.fire('close-help');
    if (action === 'quit') h.fire('start');
    h.touchEvent('touchmove', [h.touch(22, points[8])]);
    h.touchEvent('touchend', [h.touch(22, points.at(-1))]);
    assert.equal(h.states.at(-1).drawing, false); assert.equal(h.captures.length, 0);
    const nextPoints = h.circle();
    h.touchEvent('touchstart', [h.touch(23, nextPoints[0])]);
    h.touchEvent('touchmove', [h.touch(22, points[8])], [h.touch(23, nextPoints[0])]);
    h.touchEvent('touchend', [h.touch(22, points.at(-1))], [h.touch(23, nextPoints[0])]);
    assert.equal(h.states.at(-1).drawing, true, 'late events from the closed gesture cannot stop the new one');
    nextPoints.slice(1).forEach(p => h.touchEvent('touchmove', [h.touch(23, p)]));
    h.touchEvent('touchend', [h.touch(23, nextPoints.at(-1))]);
    assertCaughtOnce(h); assertPath(h, nextPoints);
  });
}

test('the round deadline cancels a native gesture safely and replay is usable', () => {
  const h = ready(), state = h.states.at(-1), points = h.circle();
  h.touchEvent('touchstart', [h.touch(55, points[0])]);
  points.slice(1).forEach(p => h.touchEvent('touchmove', [h.touch(55, p)]));
  // Move the exposed engine state to two ticks before its normal deadline.
  // This keeps the UI test focused while still running the real step/finish path.
  state._ticks = L.DURATION / L.FIXED_DT - 2; state.time = state._ticks * L.FIXED_DT;
  h.frame(); h.frame(0.05);
  assert.equal(state.ended, true); assert.equal(state.drawing, false); assert.equal(state.score, 0);
  assert.equal(h.nodes.get('result').hidden, false);
  h.touchEvent('touchend', [h.touch(55, points.at(-1))]);
  assert.equal(h.captures.length, 0);
  h.fire('again'); h.touchCatch(56); assertCaughtOnce(h);
});


test('a fresh native touch recovers a swallowed end event without scoring the abandoned loop', () => {
  const h = ready(), state = h.states.at(-1);
  h.touchEvent('touchstart', [h.touch(1, { x: 10, y: 10 })]);
  h.touchEvent('touchmove', [h.touch(1, { x: 90, y: 90 })]);
  assert.equal(state.drawing, true);
  h.touchCatch(2); assertCaughtOnce(h);
});

test('an empty native cancel still abandons ownership and allows a fresh stroke', () => {
  const h = ready(), state = h.states.at(-1);
  h.touchEvent('touchstart', [h.touch(1, h.circle()[0])]);
  h.touchEvent('touchcancel', [], [], h.document);
  assert.equal(state.drawing, false); assert.equal(h.captures.length, 0);
  h.touchCatch(2); assertCaughtOnce(h);
});

test('native touch replaces an unfinished keyboard loop without carrying over its path', () => {
  const h = ready(), state = h.states.at(-1);
  h.fire('keyboard-mode'); h.fire('field', 'keydown', { code: 'Space' });
  assert.equal(state.drawing, true);
  const points = h.circle(), focusCount = h.focusCalls.length;
  h.touchEvent('touchstart', [h.touch(90, points[0])]);
  assert.equal(h.nodes.get('keyboard-mode').attrs['aria-pressed'], 'false');
  assert.equal(h.focusCalls.length, focusCount, 'touch handoff does not steal focus');
  assert.equal(h.captures.length, 0, 'abandoned keyboard path is not captured');
  points.slice(1).forEach(p => h.touchEvent('touchmove', [h.touch(90, p)]));
  h.touchEvent('touchend', [h.touch(90, points.at(-1))]);
  assertCaughtOnce(h); assertPath(h, points);
});


for (const input of ['touch', 'pointer']) {
  test(input + ' keeps a logical circle intact when browser chrome shifts the canvas origin up 100px', () => {
    const h = ready(), state = h.states.at(-1), points = h.circle(), initial = h.getRect();
    const backing = { width: h.field.width, height: h.field.height };
    const send = (kind, p) => input === 'touch'
      ? h.touchEvent('touch' + kind, [h.touch(61, p)])
      : h.dispatch(kind === 'start' ? h.field : h.document, 'pointer' + (kind === 'start' ? 'down' : kind === 'end' ? 'up' : 'move'), { pointerId: 61, ...h.toClient(p) });
    send('start', points[0]);
    points.slice(1).forEach((p, i) => {
      if (i === 8) {
        // Position-only layout changes need not notify ResizeObserver. The
        // finger still traces the same logical light at its new screen origin.
        h.setRect({ top: initial.top - 100 });
        assert.equal(h.getRect().width, initial.width);
        assert.equal(h.getRect().height, initial.height);
      }
      send('move', p);
      assert.equal(state.drawing, true);
    });
    send('end', points.at(-1));
    assertCaughtOnce(h); assertPath(h, points);
    assert.equal(h.field.width, backing.width);
    assert.equal(h.field.height, backing.height);
  });
}
