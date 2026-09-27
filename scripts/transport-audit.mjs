/*
 * One transport: the radar and the scrubber.
 *
 * The radar used to run its own loop over its own frame index with its own
 * pause button on the map, and never read store.cursor. So on the RADAR view
 * the footer's rewind, play and forward moved the readout while the picture
 * kept looping, and the map's pause left the footer alone: "the buttons don't
 * work". Now the frame shown is the one nearest the cursor, the loop drives
 * the cursor at the radar's own cadence, and the two play buttons are one
 * flag. This gate proves each half of that from the outside, on the deployed
 * copy, and the trap that review found: a pause that the clock's re-sync
 * would undo twenty seconds later.
 *
 *   PORT=8137 node scripts/dev-server.mjs &
 *   node scripts/transport-audit.mjs http://localhost:8137
 */
import { spawn } from 'node:child_process';
import { chromiumPath } from './lib/chromium.mjs';
import http from 'node:http';

const ORIGIN = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const port = 8600 + (process.pid % 90);

const chrome = spawn(chromiumPath(), ['--headless=new', `--remote-debugging-port=${port}`,
  '--no-sandbox', '--window-size=1280,900', '--use-gl=angle', '--use-angle=swiftshader',
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
  if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); return; }
  if (m.method) ev.push(m); };
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
const rows = [];
const check = (name, got, ok, want) => rows.push({ name, got, ok: ok(got), want });

/*
 * Headless Chromium produces almost no animation frames on its own - about
 * four a second here - and the radar loop advances on them, with the frame
 * delta clamped to 0.2s, so a 1.1s hold took four seconds of wall time. A
 * screenshot request forces a frame, so waiting for a change means asking
 * for frames while waiting, as the other gates learned.
 */
async function pumpUntil(cond, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    await S('Page.captureScreenshot', { format: 'jpeg', quality: 1 });
    if (await cond()) return true;
    await wait(60);
  }
  return false;
}

/* What the page shows and the store holds, in one round trip. */
const STATE = `(() => { const s = window.ATMOS.store;
  return { playing: s.playing, following: s.following, cursor: s.cursor, atNow: s.atNow, view: s.view,
    footer: document.querySelector('.tl-play').textContent, map: document.getElementById('r-play').textContent,
    readout: document.querySelector('.tl-delta').textContent, rtime: document.getElementById('r-time').textContent }; })()`;
const state = () => E(STATE);
/* The frames, as the radar has them, and the one nearest a time. */
const FRAMES = `(() => { const r = window.ATMOS.store.radar; if (!r) return null;
  return [...(r.radar?.past || []), ...(r.radar?.nowcast || [])].map(f => f.time * 1000); })()`;
const nearest = (frames, t) => { let b = 0, bd = Infinity; frames.forEach((f, i) => { const d = Math.abs(f - t); if (d < bd) { bd = d; b = i; } }); return frames[b]; };
const hm = t => E(`window.ATMOS.store.fmt.hm(${t})`);

async function clickAt(sel) {
  const b = await E(`(() => { const el = document.querySelector('${sel}'); if (!el) return null;
    const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  if (!b) throw new Error('no ' + sel);
  await S('Input.dispatchMouseEvent', { type: 'mousePressed', x: b.x, y: b.y, button: 'left', clickCount: 1 });
  await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: b.x, y: b.y, button: 'left', clickCount: 1 });
}
async function tapAt(sel) {
  const b = await E(`(() => { const el = document.querySelector('${sel}'); if (!el) return null;
    const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  if (!b) throw new Error('no ' + sel);
  await S('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x, y: b.y }] });
  await S('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function load(hash, { phone = false } = {}) {
  ev = [];
  await S('Emulation.setDeviceMetricsOverride', phone
    ? { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }
    : { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await S('Emulation.setTouchEmulationEnabled', { enabled: phone, maxTouchPoints: phone ? 5 : 1 });
  await S('Page.navigate', { url: `${ORIGIN}/weather/${hash}` });
  // Data and radar frames both have to be in before anything below means anything.
  for (let i = 0; i < 100; i++) {
    const ready = await E(`!!(window.ATMOS && window.ATMOS.store.hours.length && window.ATMOS.store.radar
      && document.getElementById('r-time').textContent !== '—')`).catch(() => false);
    if (ready) break;
    await wait(200);
  }
  await wait(1200);
}
const errorsSeen = () => ev.filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
  .map(e => e.params.entry.text).filter(t => !/favicon|tile|arcgis|rainviewer/i.test(t))
  .concat(ev.filter(e => e.method === 'Runtime.exceptionThrown')
    .map(e => (e.params.exceptionDetails.exception?.description || '').split('\n')[0]));

/* ------------------------------------------------------------- cold */

await load('#radar');
const frames = await E(FRAMES);
check('the radar has frames', frames ? frames.length : 0, v => v >= 3, '>= 3');
const a = await state();
check('cold on RADAR: the loop runs', a.playing, v => v === true, 'store.playing');
check('cold: the two buttons agree', `${a.footer} / ${a.map}`, v => v === '❚❚ / ❚❚', '❚❚ / ❚❚');
await pumpUntil(async () => (await state()).rtime !== a.rtime, 6000);
const b = await state();
check('the loop drives the cursor', `${a.readout} -> ${b.readout}`, () => b.readout !== 'NOW' || b.cursor !== a.cursor, 'readout leaves NOW');
check('the loop changes the frame', `${a.rtime} -> ${b.rtime}`, () => a.rtime !== b.rtime, 'r-time changes');
{
  const want = await hm(nearest(frames, b.cursor));
  check('the frame shown is the cursor\'s', `${b.rtime} vs nearest ${want}`, () => b.rtime === want, 'equal');
}

/* --------------------------------------------------- the footer's play */

await clickAt('#scrub [data-act="play"]');
await wait(300);
const c = await state();
check('footer ▶ pauses the radar', `${c.playing} ${c.footer} / ${c.map}`, () => c.playing === false && c.footer === '▶' && c.map === '▶', 'false ▶ / ▶');
await wait(1500);
const c2 = await state();
check('paused, the frame holds', `${c.rtime} -> ${c2.rtime}`, () => c.rtime === c2.rtime, 'unchanged over 1.5s');

/*
 * The trap review found: the loop had parked the cursor on a past frame with
 * `following` still true, and a pause leaves it true; syncToNow runs every
 * 20s of accumulated frame time while following && !playing and would snap
 * the cursor - and so the frame - back to now. The wait drives frames,
 * because that 20s is counted in rAF deltas and headless barely produces
 * any on its own.
 */
await pumpUntil(async () => false, 25000);
const c3 = await state();
check('a pause holds past the clock re-sync', `${c.rtime} -> ${c3.rtime}, cursor moved ${Math.round((c3.cursor - c.cursor) / 1000)}s, following ${c3.following}`,
  () => c.rtime === c3.rtime && Math.abs(c3.cursor - c.cursor) < 1000, 'unchanged after 25s');

/* ------------------------------------------------------ rewind, forward */

for (let i = 0; i < 3; i++) await clickAt('#scrub [data-act="back"]');
await wait(300);
const d = await state();
{
  const want = await hm(nearest(frames, d.cursor));
  const earliest = await hm(Math.min(...frames));
  check('◀◀ ×3: the picture follows the readout', `${d.readout}, r-time ${d.rtime}, nearest ${want}`, () => d.rtime === want, 'r-time = frame nearest cursor');
  check('◀◀ ×3 clamps to the earliest frame', `${d.rtime} vs ${earliest}`, () => d.rtime === earliest, 'earliest');
  check('◀◀ keeps the map paused', d.map, v => v === '▶', '▶');
}
await clickAt('#scrub [data-act="fwd"]'); await clickAt('#scrub [data-act="fwd"]');
await wait(300);
const e2 = await state();
{
  const want = await hm(nearest(frames, e2.cursor));
  check('▶▶ ×2: the picture follows', `${e2.readout}, r-time ${e2.rtime}, nearest ${want}`, () => e2.rtime === want, 'r-time = frame nearest cursor');
}

/* --------------------------------------------------------- the map's ❚❚ */

await clickAt('#r-play');
await pumpUntil(async () => (await state()).rtime !== e2.rtime, 6000);
const f = await state();
check('map ❚❚ resumes, and the footer agrees', `${f.playing} ${f.footer} / ${f.map}`, () => f.playing === true && f.footer === '❚❚' && f.map === '❚❚', 'true ❚❚ / ❚❚');
check('and the frames advance', `${e2.rtime} -> ${f.rtime}`, () => e2.rtime !== f.rtime, 'r-time changes');

/* ----------------------------------------------------------------- NOW */

await clickAt('#scrub [data-act="now"]');
await wait(300);
const g = await state();
{
  const want = await hm(nearest(frames, Date.now()));
  check('NOW: the frame nearest now, readout NOW', `${g.readout}, ${g.rtime} vs ${want}`, () => g.readout === 'NOW' && g.rtime === want, 'NOW, nearest');
  check('NOW stops play', g.playing, v => v === false, 'false');
}

/* --------------------------------------------------- leaving the radar */

await load('#radar');
await wait(2500);   // let the loop park the cursor somewhere in the past
await E("window.ATMOS.setView('deck')");
await wait(300);
const k = await state();
check('RADAR then DECK, never scrubbed: the deck is live', `atNow ${k.atNow}, playing ${k.playing}, following ${k.following}`,
  () => k.atNow === true && k.playing === false && k.following === true, 'live, stopped, following');
await E("window.ATMOS.setView('radar')");
await wait(500);
await clickAt('#scrub [data-act="back"]');
await wait(200);
await E("window.ATMOS.setView('deck')");
await wait(300);
const l = await state();
check('RADAR, ◀◀, DECK: the scrub is kept', `${l.readout}, following ${l.following}`,
  () => l.following === false && Math.abs((l.cursor - Date.now()) + 3600e3) < 120e3, '−1h, not following');
const desktopErrors = errorsSeen();

/* --------------------------------------------------------------- phone */

await load('#radar', { phone: true });
const p0 = await state();
await tapAt('#r-play');
await wait(300);
const p1 = await state();
check('phone: a tap on the map\'s ❚❚ pauses', `${p0.playing} -> ${p1.playing}, footer ${p1.footer}`, () => p0.playing === true && p1.playing === false && p1.footer === '▶', 'true -> false, ▶');
await tapAt('#scrub [data-act="back"]');
await wait(300);
const p2 = await state();
{
  const fr = await E(FRAMES);
  const want = await hm(nearest(fr, p2.cursor));
  check('phone: a tap on ◀◀ moves the picture', `${p2.readout}, ${p2.rtime} vs ${want}`, () => p2.rtime === want && p2.cursor < p1.cursor, 'follows');
}
const phoneErrors = errorsSeen();
check('no console errors or exceptions', desktopErrors.length + phoneErrors.length, v => v === 0,
  (desktopErrors[0] || phoneErrors[0] || '0').slice(0, 80));

console.log(`\n  ${ORIGIN}/weather/#radar\n`);
let fails = 0;
for (const r of rows) {
  if (!r.ok) fails++;
  console.log(' ', r.ok ? 'PASS' : 'FAIL', String(r.name).padEnd(46), String(r.got).padEnd(40), r.want);
}
console.log('\n ', fails ? `${fails} gate(s) failing` : 'all gates green');
chrome.kill();
process.exit(fails ? 1 : 0);
