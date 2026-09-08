/*
 * Pinch zoom on the radar map.
 *
 * Drives real two-finger touch sequences through CDP and asks the map where
 * it ended up. The map keeps no DOM readout of its position, so the radar
 * view hands its SlippyMap out through window.ATMOS.views.radar.map.
 *
 * Run it against the DEPLOYED copy, as with the other audits:
 *
 *   node scripts/dev-server.mjs &
 *   node scripts/pinch-audit.mjs
 */
import { spawn } from 'node:child_process';
import http from 'node:http';

const URL = process.argv[2] || 'http://localhost:8000/weather/';
const W = 390, H = 844;
const port = 9100 + (process.pid % 90);
const chrome = spawn('/usr/bin/chromium', ['--headless=new', `--remote-debugging-port=${port}`,
  '--no-sandbox', `--window-size=${W},${H}`, '--use-gl=angle', '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader', '--disable-gpu-sandbox',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank'],
  { stdio: 'ignore' });
const get = p => new Promise((r, j) => http.get({ host: '127.0.0.1', port, path: p },
  x => { let d = ''; x.on('data', c => d += c); x.on('end', () => r(JSON.parse(d))); }).on('error', j));
const wait = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { await get('/json/version'); break; } catch { await wait(250); } }
const { webSocketDebuggerUrl } = await get('/json/version');
const ws = new WebSocket(webSocketDebuggerUrl);
let id = 0; const P = new Map(); const ev = [];
ws.onmessage = e => { const m = JSON.parse(e.data);
  if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } else if (m.method) ev.push(m); };
await new Promise(r => ws.onopen = r);
const send = (me, pa = {}, s) => new Promise(r => { const i = ++id; P.set(i, r);
  ws.send(JSON.stringify({ id: i, method: me, params: pa, sessionId: s })); });
const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);
await S('Runtime.enable'); await S('Page.enable'); await S('Log.enable');
await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
await S('Emulation.setEmulatedMedia', { features: [
  { name: 'pointer', value: 'coarse' }, { name: 'any-pointer', value: 'coarse' },
  { name: 'hover', value: 'none' }] });
await S('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
const E = async e => {
  const r = await S('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'threw');
  return r.result?.result?.value;
};
await S('Page.navigate', { url: URL });
await wait(14000);
await E("window.ATMOS.setView('radar')");
await wait(3000);

const rows = [];
const check = (name, got, ok, want) => rows.push({ name, got, ok: ok(got), want });

const M = () => E(`(()=>{const m=window.ATMOS.views.radar.map;
  return {lat:m.lat, lon:m.lon, zoom:m.zoom, w:m.w, h:m.h,
          min:m.minZoom, max:m.maxZoom};})()`);
const rect = () => E(`(()=>{const r=document.getElementById('r-map').getBoundingClientRect();
  return {x:r.x,y:r.y,w:r.width,h:r.height};})()`);
/** Geography under a canvas point, so "did the anchor hold" is answerable. */
const at = (x, y) => E(`window.ATMOS.views.radar.map.unproject(${x}, ${y})`);
const setView = (lat, lon, z) => E(`window.ATMOS.views.radar.map.setView(${lat}, ${lon}, ${z})`);

const touch = (type, pts) =>
  S('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y })) });

/** A two-finger pinch about (cx, cy): `from` px apart, ending `to` px apart. */
async function pinch(cx, cy, from, to, { steps = 6, dx = 0, dy = 0 } = {}) {
  const pair = (gap, ox = 0, oy = 0) =>
    [[cx - gap / 2 + ox, cy + oy], [cx + gap / 2 + ox, cy + oy]];
  await touch('touchStart', pair(from));
  for (let i = 1; i <= steps; i++) {
    const f = i / steps;
    await touch('touchMove', pair(from + (to - from) * f, dx * f, dy * f));
    await wait(16);
  }
  await touch('touchEnd', []);
  await wait(300);
}

const r = await rect();
const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
const lx = r.w / 2, ly = r.h / 2;                  // the same point, canvas-local

/* ------------------------------------------------ zoom follows the fingers */

await setView(34.05, -118.24, 7);
await wait(400);
await pinch(cx, cy, 90, 180);
let m = await M();
check('spreading two fingers 2x zooms in one level',
  (m.zoom - 7).toFixed(2), v => Math.abs(Number(v) - 1) < 0.12, '+1.00');

await setView(34.05, -118.24, 7);
await wait(400);
await pinch(cx, cy, 180, 90);
m = await M();
check('closing them 2x zooms out one level',
  (m.zoom - 7).toFixed(2), v => Math.abs(Number(v) + 1) < 0.12, '-1.00');

/* ------------------------------------------- the anchor holds under the hand */

await setView(34.05, -118.24, 7);
await wait(400);
// Pinch about a point well off centre; that geography must not move.
const ax = r.x + r.w * 0.28, ay = r.y + r.h * 0.72;
const before = await at(r.w * 0.28, r.h * 0.72);
await pinch(ax, ay, 80, 170);
const after = await at(r.w * 0.28, r.h * 0.72);
check('the point between the fingers stays put',
  `${Math.abs(after[0] - before[0]).toFixed(3)},${Math.abs(after[1] - before[1]).toFixed(3)}`,
  () => Math.abs(after[0] - before[0]) < 0.02 && Math.abs(after[1] - before[1]) < 0.02,
  '< 0.02 deg of drift');

/* ------------------------------------------------------ one finger still pans */

await setView(34.05, -118.24, 7);
await wait(400);
const p0 = await M();
await touch('touchStart', [[cx, cy]]);
for (let i = 1; i <= 5; i++) { await touch('touchMove', [[cx - i * 12, cy]]); await wait(16); }
await touch('touchEnd', []);
await wait(300);
const p1 = await M();
check('one finger still pans, and only pans',
  `${(p1.lon - p0.lon).toFixed(3)}deg  z${(p1.zoom - p0.zoom).toFixed(3)}`,
  () => p1.lon - p0.lon > 0.02 && Math.abs(p1.zoom - p0.zoom) < 1e-9 && Math.abs(p1.lat - p0.lat) < 1e-6,
  'east, no zoom, no drift in lat');

/* ------------------------------------------ the two-finger state machine */

/*
 * These two dispatch PointerEvents directly. CDP's touch API cannot release
 * one of two fingers -- `touchEnd` takes no touch points and ends the whole
 * sequence -- and going from two pointers to one is exactly where the old
 * handler failed. The handlers read nothing but pointerId, clientX and
 * clientY, so this exercises the real state machine.
 */
const pe = (type, id, x, y) => E(`(()=>{document.getElementById('r-map').dispatchEvent(
  new PointerEvent('${type}', { pointerId: ${id}, pointerType: 'touch', isPrimary: ${id === 1},
    clientX: ${x}, clientY: ${y}, bubbles: true, cancelable: true })); return true;})()`);

const ax2 = Math.round(cx - 60), ay2 = Math.round(cy - 40);
const bx2 = Math.round(cx + 60), by2 = Math.round(cy + 40);

await setView(34.05, -118.24, 7);
await wait(400);
await pe('pointerdown', 1, ax2, ay2);
await pe('pointerdown', 2, bx2, by2);
const q0 = await M();
// Move the FIRST finger a little. The old handler kept one `drag` and
// ignored pointerId, so this delta was measured from where the SECOND
// finger landed, 144px away, and threw the map across the state.
await pe('pointermove', 1, ax2 + 10, ay2);
const q1 = await M();
await pe('pointerup', 1, ax2 + 10, ay2);
await pe('pointerup', 2, bx2, by2);
check('a second finger does not hijack the first',
  `${Math.abs(q1.lat - q0.lat).toFixed(3)},${Math.abs(q1.lon - q0.lon).toFixed(3)}`,
  () => Math.abs(q1.lat - q0.lat) < 0.25 && Math.abs(q1.lon - q0.lon) < 0.25,
  '< 0.25 deg');

await setView(34.05, -118.24, 7);
await wait(400);
await pe('pointerdown', 1, ax2, ay2);
await pe('pointerdown', 2, bx2, by2);
await pe('pointerup', 1, ax2, ay2);          // one finger lifts, one stays down
const b0 = await M();
await pe('pointermove', 2, bx2 - 40, by2);   // and the one that stayed drags west
const b1 = await M();
await pe('pointerup', 2, bx2 - 40, by2);
check('the finger left behind keeps panning',
  `${(b1.lon - b0.lon).toFixed(3)}deg  z${(b1.zoom - b0.zoom).toFixed(3)}`,
  () => b1.lon - b0.lon > 0.1 && Math.abs(b1.zoom - b0.zoom) < 1e-9,
  'pans east, no zoom');

/* ------------------------------------------------------------ clamped zoom */

await setView(34.05, -118.24, 10.6);
await wait(400);
await pinch(cx, cy, 60, 300);
m = await M();
check('pinching past the top clamps', m.zoom, v => v === m.max, `= maxZoom ${m.max}`);

await setView(34.05, -118.24, 3.4);
await wait(400);
// The starting gap has to fit on the canvas or neither finger lands on it.
await pinch(cx, cy, 240, 48);
m = await M();
check('pinching past the bottom clamps', m.zoom, v => v === m.min, `= minZoom ${m.min}`);

/* --------------------- the radar layer past the end of its own tile pyramid */

/*
 * RainViewer's public radar serves real tiles to z 7 and the same
 * "Zoom Level Not Supported" placeholder above it, everywhere in the world.
 * Pinching used to reach that in one gesture, and it tiled itself across the
 * map in letters a hundred pixels tall.
 *
 * Spy on what the layer is ASKED for rather than on what the network did:
 * tiles are cached across the whole session, so a broken cap would simply
 * make no requests at all and a network check would pass.
 */
const askedFor = async (zoom) => {
  await setView(34.05, -118.24, zoom);
  await wait(400);
  return E(`(()=>{const m=window.ATMOS.views.radar.map;
    const l=m.layers.find((x)=>x.name==='radar');
    const seen=[]; const orig=l.url;
    l.url=(z,x,y)=>{seen.push(z); return orig(z,x,y);};
    m.render();
    l.url=orig;
    return seen.length ? Math.max(...seen) : null;})()`);
};

await setView(34.05, -118.24, 7);
await wait(400);
await pinch(cx, cy, 70, 260);                        // well past z 7 in one go
m = await M();
check('a pinch past the radar\'s deepest tile still zooms',
  m.zoom.toFixed(1), () => m.zoom > 7.5, '> 7.5');
check('but the radar is never asked above z 7',
  await askedFor(9.4), v => v === 7, '7');
check('and below that it is asked for what it is showing',
  await askedFor(5), v => v === 5, '5');

/* ------------------------------------- Safari's own gesture must be refused */

check('the map refuses the browser gesture',
  await E(`(()=>{const c=document.getElementById('r-map');
    const e=new Event('gesturestart',{cancelable:true,bubbles:true});
    c.dispatchEvent(e); return e.defaultPrevented;})()`),
  v => v === true, 'gesturestart preventDefault');

check('map touch-action',
  await E("getComputedStyle(document.getElementById('r-map')).touchAction"),
  v => v === 'none', 'none');

const errs = ev.filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
  .map(e => e.params.entry.text).filter(t => !/favicon|tile|rainviewer|arcgis/i.test(t));
check('console errors', errs.length, v => v === 0, '0');

console.log(`\n  ${URL}  radar at ${W}x${H}\n`);
let fails = 0;
for (const x of rows) {
  if (!x.ok) fails++;
  console.log(' ', x.ok ? 'PASS' : 'FAIL', String(x.name).padEnd(44), String(x.got).padEnd(18), x.want);
}
console.log('\n ', fails ? `${fails} gate(s) failing` : 'all gates green');
if (errs.length) console.log('  errors:', errs.slice(0, 3));
chrome.kill();
process.exit(fails ? 1 : 0);
