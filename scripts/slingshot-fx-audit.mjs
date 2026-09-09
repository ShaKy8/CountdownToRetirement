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
 * IT MUST PUMP FRAMES. Headless Chromium produces none on its own, so
 * requestAnimationFrame never fires and the whole game loop is frozen: nothing
 * decays, and under reduced motion — where the flight is skipped in a single
 * frame — a shot never even lands. Every wait below is a series of forced
 * paints. The first version of this gate read that frozen state as a leaking
 * particle pool.
 *
 *   node scripts/dev-server.mjs &
 *   node scripts/slingshot-fx-audit.mjs
 */
import { spawn } from 'node:child_process';
import http from 'node:http';

const ORIGIN = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const port = 8800 + (process.pid % 90);

const chrome = spawn('/usr/bin/chromium', ['--headless=new', `--remote-debugging-port=${port}`,
  '--no-sandbox', '--window-size=900,900', '--use-gl=angle', '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader', '--disable-gpu-sandbox',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank'],
  { stdio: 'ignore' });
const get = p => new Promise((r, j) => http.get({ host: '127.0.0.1', port, path: p },
  x => { let d = ''; x.on('data', c => d += c); x.on('end', () => r(JSON.parse(d))); }).on('error', j));
const wait = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { await get('/json/version'); break; } catch { await wait(250); } }
const { webSocketDebuggerUrl } = await get('/json/version');
const ws = new WebSocket(webSocketDebuggerUrl);
let id = 0; const P = new Map(); let ev = [];
ws.onmessage = e => { const m = JSON.parse(e.data);
  if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } else if (m.method) ev.push(m); };
await new Promise(r => ws.onopen = r);
const send = (me, pa = {}, s) => new Promise(r => { const i = ++id; P.set(i, r);
  ws.send(JSON.stringify({ id: i, method: me, params: pa, sessionId: s })); });
const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);
await S('Runtime.enable'); await S('Page.enable'); await S('Log.enable');

const E = async e => {
  const r = await S('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'threw');
  return r.result?.result?.value;
};
const key = (k) => E(`window.dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(k)},bubbles:true}))`);

/*
 * Wait, while forcing paints so the game's rAF loop actually advances.
 *
 * A one-pixel clip: the point is to make the compositor produce a frame, not
 * to look at anything, and encoding a full 900x900 PNG sixty times over made
 * this gate take minutes instead of seconds.
 */
const CLIP = { x: 0, y: 0, width: 1, height: 1, scale: 1 };
async function pump(ms, step = 100) {
  for (let t = 0; t < ms; t += step) {
    await S('Page.captureScreenshot', { format: 'png', clip: CLIP });
    await wait(step);
  }
}

/*
 * Pump, and watch. Debris lives 320-600ms, so sampling once after the wait
 * measures the empty pool afterwards rather than the effect — which is how the
 * first version of this gate concluded that nothing was spawning at all.
 */
async function pumpWatch(ms, step = 100) {
  let peak = 0, scars = 0;
  for (let t = 0; t < ms; t += step) {
    await S('Page.captureScreenshot', { format: 'png', clip: CLIP });
    peak = Math.max(peak, await E('window.SLINGSHOT_FX.particles()') || 0);
    scars = Math.max(scars, await E('window.SLINGSHOT_FX.scars()') || 0);
    await wait(step);
  }
  return { peak, scars };
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
    for (let n = 0; n < nudge; n++) await key(i % 2 ? 'ArrowLeft' : 'ArrowRight');
    if (i % 3 === 2) for (let n = 0; n < 4; n++) await key('ArrowUp');
    await key(' ');
    const seen = await pumpWatch(900);
    peak = Math.max(peak, seen.peak);
    peakScars = Math.max(peakScars, seen.scars);
  }
  await pump(2000);   // everything should have decayed by now
  return {
    peak,
    peakScars,
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
