/*
 * SLINGSHOT's impact effects.
 *
 * Feel cannot be gated — the only real test is playing a day at ?fx=2 and then
 * at ?fx=0 and saying which is better. What CAN be gated is everything that
 * would degrade the game silently: a particle pool that never drains, an off
 * switch that is nominal rather than real, and a reduced-motion path that
 * still moves.
 *
 * The game is driven through the handlers it already has: `#launch` starts it,
 * arrow keys nudge the aim, Space fires. State comes back through
 * window.SLINGSHOT_FX, because none of it has a DOM readout.
 *
 * THE GAME LOOP HAS TO BE DRIVEN, because headless Chromium produces no frames
 * on its own: requestAnimationFrame never fires, nothing decays, and under
 * reduced motion — where the flight is skipped in a single frame — a shot never
 * even lands. An early version of this gate read that frozen state as a leaking
 * particle pool.
 *
 * It is driven by SHIMMING rAF ONTO TIMERS, with a synthetic clock that
 * advances a fixed 16ms per callback. `frame(now)` in script.js takes its
 * timestamp from the rAF argument and clamps the delta to 100ms, so this makes
 * game time exact rather than approximate — and it needs no compositor frames
 * at all.
 *
 * Two mechanisms were measured and rejected first, which is worth writing down
 * because both look right:
 *
 * - Forcing every frame with `Page.captureScreenshot` (what this used to do)
 *   costs a software-rendered paint per frame. About three hundred of them,
 *   plus a 100ms sleep after each, is why fifteen assertions took 5m34s — and
 *   a gate that slow does not get run, which makes it not a gate.
 * - `Page.startScreencast` delivers roughly 6fps under swiftshader, so the
 *   waits spent their time waiting. It was slower AND wrong.
 * - `Emulation.setVirtualTimePolicy` advances the clock 5000ms in 102ms of
 *   wall time, but fired exactly ONE rAF callback: it drives timers and the
 *   clock, not the compositor.
 *
 * What this no longer exercises is the browser's real frame scheduling — but
 * headless never exercised that either, since it produced no frames at all.
 * What it does exercise, exactly, is the thing the effects are made of: what
 * happens to them as dt accumulates.
 *
 * Because everything below rests on the loop actually running, the frame count
 * is itself asserted. If the shim were dropped or the loop stopped, every
 * "the pool drains" check would pass by measuring a game that never started.
 *
 *   node scripts/dev-server.mjs &
 *   node scripts/slingshot-fx-audit.mjs
 */
import { spawn } from 'node:child_process';
import { chromiumPath } from './lib/chromium.mjs';
import http from 'node:http';

const ORIGIN = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const port = 8800 + (process.pid % 90);

const chrome = spawn(chromiumPath(), ['--headless=new', `--remote-debugging-port=${port}`,
  // Small, at device scale 1. Every frame is software-rendered and the whole
  // gate is thousands of frames, so pixel count is the floor on how fast it
  // can run. None of the invariants below depend on the size.
  '--no-sandbox', '--window-size=520,620', '--use-gl=angle', '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader', '--disable-gpu-sandbox',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
'about:blank'],
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
await S('Emulation.setDeviceMetricsOverride',
  { width: 520, height: 620, deviceScaleFactor: 1, mobile: false });

/** Game milliseconds per shimmed frame — 16 is the 60fps the game expects. */
const STEP_MS = 16;

/*
 * Installed before any page script runs, so the game's very first
 * `window.requestAnimationFrame(frame)` already gets the shim. The clock it
 * hands back is synthetic and monotonic, which is what makes game time exact.
 */
await S('Page.addScriptToEvaluateOnNewDocument', { source: `
  (() => {
    let t = 0, n = 0;
    const peak = { particles: 0, scars: 0 };

    window.__fxFrames = () => n;
    window.__fxPeak = () => ({ ...peak });
    window.__fxReset = () => { peak.particles = 0; peak.scars = 0; };

    window.requestAnimationFrame = (cb) => setTimeout(() => {
      t += ${STEP_MS}; n++;
      cb(t);
      /*
       * Sampled here, after the frame has run, and on EVERY frame. Debris
       * lives 320-600ms, so sampling from the outside once per round trip
       * measures the empty pool afterwards rather than the effect — which is
       * how an early version of this gate concluded nothing was spawning.
       */
      const F = window.SLINGSHOT_FX;
      if (F) {
        const p = F.particles(), sc = F.scars();
        if (p > peak.particles) peak.particles = p;
        if (sc > peak.scars) peak.scars = sc;
      }
    }, 0);
    window.cancelAnimationFrame = (h) => clearTimeout(h);

    /* Waiting happens in here, so advancing 150 frames is ONE round trip
       rather than 150 of them. That was the whole remaining cost. */
    window.__fxAdvance = (want) => new Promise((done) => {
      const target = n + want;
      (function check() { n >= target ? done(n) : setTimeout(check, 0); })();
    });
  })();
` });

const E = async e => {
  const r = await S('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'threw');
  return r.result?.result?.value;
};
/*
 * A whole shot's keystrokes in one round trip. Sent one at a time they were
 * about 340 evaluates across the three runs and the single largest cost left
 * in this gate; the aim handlers read the event and adjust a number, so there
 * is nothing for a frame to do in between.
 */
const keys = (list) => E(`(${JSON.stringify(list)}).forEach(
  k => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })));1`);

/** Advance the game by `ms` of game time. One round trip, whatever the count. */
const pump = (ms) => E(`window.__fxAdvance(${Math.ceil(ms / STEP_MS)})`);

/**
 * Advance, and report the highest the pools got on the way. The peaks are
 * tracked frame by frame inside the page; this just brackets them.
 */
async function pumpWatch(ms) {
  await E('window.__fxReset()');
  await pump(ms);
  const p = await E('window.__fxPeak()') || {};
  return { peak: p.particles || 0, scars: p.scars || 0 };
}

const rows = [];
const check = (name, got, ok, want) => rows.push({ name, got, ok: ok(got), want });

/** Load a level, start it, and fire `n` shots with the aim nudged between each. */
async function play(query, { motion = true, shots = 8, nudge = 9 } = {}) {
  ev = [];
  await S('Emulation.setEmulatedMedia', { features: [
    { name: 'prefers-reduced-motion', value: motion ? 'no-preference' : 'reduce' }] });
  await S('Page.navigate', { url: `${ORIGIN}/slingshot/${query}` });
  await pump(2500);
  await E("document.getElementById('launch').click()");
  await pump(400);
  let peak = 0, peakScars = 0;
  for (let i = 0; i < shots; i++) {
    const seq = Array(nudge).fill(i % 2 ? 'ArrowLeft' : 'ArrowRight');
    if (i % 3 === 2) seq.push('ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp');
    seq.push(' ');
    await keys(seq);
    const seen = await pumpWatch(900);
    peak = Math.max(peak, seen.peak);
    peakScars = Math.max(peakScars, seen.scars);
  }
  await pump(2000);   // everything should have decayed by now
  return {
    peak,
    peakScars,
    frames: await E('window.__fxFrames ? window.__fxFrames() : 0'),
    restParticles: await E('window.SLINGSHOT_FX.particles()'),
    restRings: await E('window.SLINGSHOT_FX.rings()'),
    restShake: await E('window.SLINGSHOT_FX.shake()'),
    scars: await E('window.SLINGSHOT_FX.scars()'),
    fxLevel: await E('window.SLINGSHOT_FX.level()'),
    errors: ev.filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
      .map(e => e.params.entry.text).filter(t => !/favicon/.test(t)),
    exceptions: ev.filter(e => e.method === 'Runtime.exceptionThrown')
      .map(e => (e.params.exceptionDetails.exception?.description || '').split('\n')[0]),
  };
}

/* --------------------------------------------- full effects, normal motion */

const full = await play('?level=4242&fx=2');
check('effects actually fire', full.peak, v => v > 0, '> 0 particles at some point');
check('particles stay capped', full.peak, v => v <= 120, '<= MAX_FX');
check('the pool drains', `${full.restParticles} left, ${full.restRings} rings`,
  () => full.restParticles === 0 && full.restRings === 0, 'nothing still alive');
check('the kick settles', full.restShake, v => v === 0, '0');
check('scars stay capped', full.scars, v => v <= 10 * 4, '<= MAX_SCARS per body');
/*
 * If the screencast stopped, rAF never fires, nothing ever spawns and nothing
 * ever decays — and every drain check above passes by measuring a game that
 * never ran. This is the assertion that makes the others mean something.
 */
check('the loop actually ran', full.frames, v => v > 500, '> 500 frames');
check('no console errors', full.errors.length, v => v === 0, '0');
check('no exceptions', full.exceptions.length, v => v === 0, '0');

/* ------------------------------------------------- the off switch is real */

const off = await play('?level=4242&fx=0', { shots: 6 });
check('fx=0 reads as off', off.fxLevel, v => v === 0, '0');
check('fx=0 spawns nothing', `${off.peak} particles`, () => off.peak === 0, 'never any');
check('fx=0 never kicks', off.restShake, v => v === 0, '0');
check('fx=0 still runs clean', off.errors.length + off.exceptions.length, v => v === 0, '0');

/* ------------------------------------------------------- reduced motion */

const calm = await play('?level=4242&fx=2', { motion: false, shots: 6 });
check('reduced motion: no debris', `${calm.peak} particles`, () => calm.peak === 0, 'never any');
check('reduced motion: no shake', calm.restShake, v => v === 0, '0');
/*
 * Scars are not motion, and they are the part that teaches, so they must
 * survive the reduced-motion path even though everything else is stripped.
 */
check('reduced motion: scars survive', calm.peakScars, v => v > 0, '> 0');
check('reduced motion: runs clean', calm.errors.length + calm.exceptions.length, v => v === 0, '0');

console.log(`\n  ${ORIGIN}/slingshot/\n`);
let fails = 0;
for (const r of rows) {
  if (!r.ok) fails++;
  console.log(' ', r.ok ? 'PASS' : 'FAIL', String(r.name).padEnd(32), String(r.got).padEnd(22), r.want);
}
console.log('\n ', fails ? `${fails} gate(s) failing` : 'all gates green');
for (const s of [full, off, calm]) if (s.errors.length) console.log('  errors:', s.errors.slice(0, 2));
chrome.kill();
process.exit(fails ? 1 : 0);
