/*
 * ONE PUTT's feel: the drop, the splash, the sparks, the slow motion, the
 * idle flag - and the three ways it must degrade.
 *
 * Feel cannot be gated; the only real test is playing a day at ?fx=2 and then
 * at ?fx=0. What CAN be gated is what would degrade silently: a particle pool
 * that never drains, an off switch that is nominal, a reduced-motion path that
 * still moves, a windup that delays the ball at fx=0, and a drop that never
 * shows the card. And the one thing that must hold whatever plays: a make is a
 * make. The gate asks the rules for the day's ace line, keys it in exactly -
 * the search runs on the keyboard's own lattice - and requires the sink, the
 * drop, the delayed card and the ⛳ cell.
 *
 * THE LOOP IS DRIVEN BY A CLOCK, NOT BY FRAMES. SLINGSHOT's gate advances by
 * counting rAF callbacks, and ONE PUTT requests no frame while the ball is
 * still: after the first rest, on load, and everywhere below that asserts "no
 * idle frames", a frame-counting pump would wait forever. Here a setTimeout
 * ticker advances a synthetic clock 16ms a tick whether or not a callback is
 * pending; a shimmed requestAnimationFrame queues its callback for the next
 * tick and is handed that clock. frame(now) takes its time from the rAF
 * argument and clamps the delta to 100ms, so game time is exact. Peaks are
 * sampled inside the page on every tick: debris lives a few hundred ms, and
 * sampling from outside once per round trip measures the empty pool after.
 *
 *   PORT=8137 node scripts/dev-server.mjs &
 *   node scripts/oneputt-fx-audit.mjs http://localhost:8137
 */
import { spawn } from 'node:child_process';
import { chromiumPath } from './lib/chromium.mjs';
import http from 'node:http';

const ORIGIN = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const port = 8700 + (process.pid % 90);

const chrome = spawn(chromiumPath(), ['--headless=new', `--remote-debugging-port=${port}`,
  '--no-sandbox', '--window-size=520,900', '--use-gl=angle', '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader', '--disable-gpu-sandbox',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--autoplay-policy=no-user-gesture-required', 'about:blank'],
  { stdio: 'ignore' });
const get = p => new Promise((r, j) => http.get({ host: '127.0.0.1', port, path: p },
  x => { let d = ''; x.on('data', c => d += c); x.on('end', () => r(JSON.parse(d))); }).on('error', j));
const wait = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { await get('/json/version'); break; } catch { await wait(250); } }
const { webSocketDebuggerUrl } = await get('/json/version');
const ws = new WebSocket(webSocketDebuggerUrl);
let id = 0; const P = new Map(); let ev = [];
ws.onmessage = e => { const m = JSON.parse(e.data);
  if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); return; }
  if (m.method) ev.push(m); };
await new Promise(r => ws.onopen = r);
const send = (me, pa = {}, s) => new Promise(r => { const i = ++id; P.set(i, r);
  ws.send(JSON.stringify({ id: i, method: me, params: pa, sessionId: s })); });
const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);
await S('Runtime.enable'); await S('Page.enable'); await S('Log.enable');
await S('Emulation.setDeviceMetricsOverride', { width: 520, height: 900, deviceScaleFactor: 1, mobile: false });

/** Game milliseconds per tick: the 60fps the game expects. */
const STEP_MS = 16;

await S('Page.addScriptToEvaluateOnNewDocument', { source: `
  (() => {
    let t = 0, ticks = 0, frames = 0, handle = 0, queue = [];
    const peak = { particles: 0, rings: 0, rate: 1, drop: false, shake: 0, windup: 0 };
    window.__fxFrames = () => frames;
    window.__fxTicks = () => ticks;
    window.__fxPeak = () => ({ ...peak });
    window.__fxReset = () => { peak.particles = 0; peak.rings = 0; peak.rate = 1; peak.drop = false; peak.shake = 0; peak.windup = 0; };
    window.requestAnimationFrame = (cb) => { const h = ++handle; queue.push({ h, cb }); return h; };
    window.cancelAnimationFrame = (h) => { queue = queue.filter(q => q.h !== h); };
    const tick = () => {
      t += ${STEP_MS}; ticks++;
      const run = queue; queue = [];
      for (const q of run) { frames++; q.cb(t); }
      /* Sampled after the frame, every tick. */
      const F = window.ONEPUTT_FX;
      if (F) {
        peak.particles = Math.max(peak.particles, F.particles());
        peak.rings = Math.max(peak.rings, F.rings());
        peak.rate = Math.min(peak.rate, F.rate());
        peak.shake = Math.max(peak.shake, F.shake());
        peak.windup = Math.max(peak.windup, F.windup());
        if (F.dropping()) peak.drop = true;
      }
      setTimeout(tick, 0);
    };
    setTimeout(tick, 0);
    /* Waiting happens in here: advancing 150 ticks is one round trip. */
    window.__fxAdvance = (want) => new Promise((done) => {
      const target = ticks + want;
      (function check() { ticks >= target ? done(ticks) : setTimeout(check, 0); })();
    });
  })();
` });

const E = async e => {
  const r = await S('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'threw');
  return r.result?.result?.value;
};

/** Keystrokes in one round trip: strings, or { key, shift }. */
const keys = (list) => E(`(${JSON.stringify(list)}).forEach(k => {
  const o = typeof k === 'string' ? { key: k } : k;
  window.dispatchEvent(new KeyboardEvent('keydown', { key: o.key, shiftKey: !!o.shift, bubbles: true }));
});1`);
const pump = (ms) => E(`window.__fxAdvance(${Math.ceil(ms / STEP_MS)})`);
/** Advance until the ball is at rest, at most `ms` of game time. */
async function roll(ms) {
  for (let spent = 0; spent < ms; spent += 320) {
    await pump(320);
    if (!(await E('window.ONEPUTT_FX.animating()'))) return spent + 320;
  }
  return ms;
}
async function pumpWatch(ms) {
  await E('window.__fxReset()');
  await roll(ms);
  return await E('window.__fxPeak()') || {};
}

const rows = [];
const check = (name, got, ok, want) => rows.push({ name, got, ok: ok(got), want });
const errorsSeen = () => ({
  errors: ev.filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
    .map(e => e.params.entry.text).filter(t => !/favicon/.test(t)),
  exceptions: ev.filter(e => e.method === 'Runtime.exceptionThrown')
    .map(e => (e.params.exceptionDetails.exception?.description || '').split('\n')[0]),
});

async function load(query, { motion = true } = {}) {
  ev = [];
  await S('Emulation.setEmulatedMedia', { features: [
    { name: 'prefers-reduced-motion', value: motion ? 'no-preference' : 'reduce' }] });
  await S('Page.navigate', { url: `${ORIGIN}/game/${query}` });
  for (let i = 0; i < 40; i++) {
    if (await E("document.readyState === 'complete' && !!window.ONEPUTT_FX")) break;
    await wait(100);
  }
  await pump(300);
}

/** Load, then fire `shots` strokes with the aim nudged between each. */
async function play(query, { motion = true, shots = 6 } = {}) {
  await load(query, { motion });
  let peak = { particles: 0, rings: 0, rate: 1, shake: 0, windup: 0 };
  for (let i = 0; i < shots; i++) {
    const seq = Array(9).fill(i % 2 ? 'ArrowLeft' : 'ArrowRight');
    if (i % 3 === 2) seq.push('ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp');
    seq.push(' ');
    await keys(seq);
    const seen = await pumpWatch(6000);
    peak.particles = Math.max(peak.particles, seen.particles || 0);
    peak.rings = Math.max(peak.rings, seen.rings || 0);
    peak.rate = Math.min(peak.rate, seen.rate === undefined ? 1 : seen.rate);
    peak.shake = Math.max(peak.shake, seen.shake || 0);
    peak.windup = Math.max(peak.windup, seen.windup || 0);
  }
  await pump(2000);   // everything should have decayed by now
  const idleBefore = await E('window.ONEPUTT_FX.idleFrames()');
  await pump(1000);
  const idleAfter = await E('window.ONEPUTT_FX.idleFrames()');
  return {
    peak,
    frames: await E('window.__fxFrames()'),
    restParticles: await E('window.ONEPUTT_FX.particles()'),
    restRings: await E('window.ONEPUTT_FX.rings()'),
    restShake: await E('window.ONEPUTT_FX.shake()'),
    fxLevel: await E('window.ONEPUTT_FX.level()'),
    idleFrames: idleAfter - idleBefore,
    ...errorsSeen(),
  };
}

/** The day's ace line, keyed in exactly, and what followed. */
async function make(query, { motion = true } = {}) {
  await load(query, { motion });
  const lineDisabledBefore = await E("document.getElementById('line').disabled");
  const ace = await E(`(() => { const F = window.ONEPUTT_FX;
    const r = window.OnePutt.findAceLine(F.hole(), F.wind()); return r.aim ? { k: r.k, pct: r.pct } : null; })()`);
  if (!ace) return { ace: null };
  const seq = [];
  for (let i = 0; i < Math.abs(ace.k); i++) seq.push({ key: ace.k < 0 ? 'ArrowLeft' : 'ArrowRight', shift: true });
  for (let p = 50; p !== ace.pct; p += ace.pct > p ? 2 : -2) seq.push(ace.pct > p ? 'ArrowUp' : 'ArrowDown');
  await keys(seq);
  const readout = await E("document.getElementById('power-out').textContent");
  await keys([' ']);
  await E('window.__fxReset()');
  const spent = await roll(8000);
  const peak = await E('window.__fxPeak()');
  const event = await E('window.ONEPUTT_FX.lastEvent()');
  const hiddenAtRest = await E("document.getElementById('result').hidden");
  await pump(64);
  const hiddenAfterFrame = await E("document.getElementById('result').hidden");
  await wait(1300);   // the card's delay is real time
  await pump(64);
  const hiddenLater = await E("document.getElementById('result').hidden");
  const share = await E("document.getElementById('result-share').textContent");
  const lineDisabledAfter = await E("document.getElementById('line').disabled");
  // The line: its search must find the same aim, and it plays.
  await E("document.getElementById('line').click()");
  await wait(600);
  await pump(400);
  const said = await E("document.getElementById('say').textContent");
  const lineShown = await E('window.ONEPUTT_FX.lineShown()');
  return { ace, readout, spent, peak, event, hiddenAtRest, hiddenAfterFrame, hiddenLater, share,
    lineDisabledBefore, lineDisabledAfter, said, lineShown, ...errorsSeen() };
}

const SEED = process.env.SEED || '1234';
const Q = `?seed=${SEED}&wind=0@0`;

/* --------------------------------------------- full effects, normal motion */

const full = await play(`${Q}&fx=2`);
check('effects actually fire', full.peak.particles, v => v > 0, '> 0 particles at some point');
check('particles stay capped', full.peak.particles, v => v <= 120, '<= MAX_FX');
check('the pool drains', `${full.restParticles} left, ${full.restRings} rings`,
  () => full.restParticles === 0 && full.restRings === 0, 'nothing still alive');
check('the kick settles', full.restShake, v => v === 0, '0');
check('the putter winds up', full.peak.windup, v => v > 0, '> 0 ms seen');
check('the idle flag flaps', full.idleFrames, v => v > 0, '> 0 idle frames a second');
check('the loop actually ran', full.frames, v => v > 500, '> 500 frames');
check('no console errors', full.errors.length, v => v === 0, full.errors[0] || '0');
check('no exceptions', full.exceptions.length, v => v === 0, full.exceptions[0] || '0');

/* ------------------------------------------------------------- the make */

const made = await make(`${Q}&fx=2`);
check('the day has an ace line', made.ace, v => !!v, 'findAceLine found one');
if (made.ace) {
  check('the line is keyed in exactly', made.readout, v => v === `${made.ace.pct}%`, `${made.ace.pct}%`);
  check('and it sinks', made.event, v => v === 'sunk', 'sunk');
  check('the drop was seen', made.peak.drop, v => v === true, 'dropping observed');
  check('slow motion at the cup', made.peak.rate, v => v < 1, '< 1');
  check('the card waits for the drop', `${made.hiddenAtRest}/${made.hiddenAfterFrame}/${made.hiddenLater}`,
    () => made.hiddenAtRest === true && made.hiddenAfterFrame === true && made.hiddenLater === false,
    'hidden, hidden, then shown');
  check('the share ends in the cup', made.share.split('\n')[1], v => /⛳$/.test(v || ''), '…⛳');
  check('the line is offered only when done', `${made.lineDisabledBefore}/${made.lineDisabledAfter}`,
    () => made.lineDisabledBefore === true && made.lineDisabledAfter === false, 'true/false');
  check('and shows the same line', made.said, v => /^The ace was here: \d+° at \d+%\.$/.test(v) && v.endsWith(` at ${made.ace.pct}%.`),
    `…at ${made.ace.pct}%.`);
  check('the line plays', made.lineShown, v => v === true, 'true');
  check('the make ran clean', made.errors.length + made.exceptions.length, v => v === 0, made.errors[0] || made.exceptions[0] || '0');
}

/* ------------------------------------------------- the off switch is real */

const off = await play(`${Q}&fx=0`, { shots: 4 });
check('fx=0 reads as off', off.fxLevel, v => v === 0, '0');
check('fx=0 spawns nothing', `${off.peak.particles} particles`, () => off.peak.particles === 0, 'never any');
check('fx=0 never kicks', off.peak.shake, v => v === 0, '0');
check('fx=0 never winds up', off.peak.windup, v => v === 0, '0');
/* The nudged shots above rarely reach the cup, where slow motion lives, so
   the rate is read off the keyed-in make: that roll goes through it. */
const offMake = await make(`${Q}&fx=0`);
check('fx=0 never slows', `${off.peak.rate} / make ${offMake.peak && offMake.peak.rate}`,
  () => off.peak.rate === 1 && offMake.peak && offMake.peak.rate === 1, '1 / 1');
check('fx=0 shows the card at once', offMake.hiddenAfterFrame, v => v === false, 'shown within a frame');
check('fx=0 has no idle loop', off.idleFrames, v => v === 0, '0');
check('fx=0 still runs clean', off.errors.length + off.exceptions.length, v => v === 0, '0');

/* ------------------------------------------------------- reduced motion */

const calm = await play(`${Q}&fx=2`, { motion: false, shots: 4 });
check('reduced motion: no debris', `${calm.peak.particles} particles`, () => calm.peak.particles === 0, 'never any');
check('reduced motion: no shake', calm.peak.shake, v => v === 0, '0');
check('reduced motion: no windup', calm.peak.windup, v => v === 0, '0');
check('reduced motion: no idle loop', calm.idleFrames, v => v === 0, '0');
const calmMake = await make(`${Q}&fx=2`, { motion: false });
check('reduced motion: no slow motion', `${calm.peak.rate} / make ${calmMake.peak && calmMake.peak.rate}`,
  () => calm.peak.rate === 1 && calmMake.peak && calmMake.peak.rate === 1, '1 / 1');
if (calmMake.ace) {
  check('reduced motion: a make still lands', calmMake.event, v => v === 'sunk', 'sunk');
  check('reduced motion: the card shows at once', calmMake.hiddenAfterFrame, v => v === false, 'shown within a frame');
}
check('reduced motion: runs clean', calm.errors.length + calm.exceptions.length + calmMake.errors.length, v => v === 0, '0');

console.log(`\n  ${ORIGIN}/game/  seed ${SEED}\n`);
let fails = 0;
for (const r of rows) {
  if (!r.ok) fails++;
  console.log(' ', r.ok ? 'PASS' : 'FAIL', String(r.name).padEnd(38), String(r.got).padEnd(26), r.want);
}
console.log('\n ', fails ? `${fails} gate(s) failing` : 'all gates green');
for (const s of [full, made, off, offMake, calm, calmMake]) if (s.errors && s.errors.length) console.log('  errors:', s.errors.slice(0, 2));
chrome.kill();
process.exit(fails ? 1 : 0);
