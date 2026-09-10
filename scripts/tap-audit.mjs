/*
 * Phase 5 gate — tap to inspect.
 *
 * Does a readout summoned by a finger survive the finger lifting, land clear
 * of the hand, go away again, and stay out of the way of a scroll? And does
 * the mouse still hover the way it always did?
 *
 * Assertions are made on PIXELS OF THE READOUT BOX, not on whole-canvas
 * equality: the console keeps loading data while the test runs, so two
 * snapshots seconds apart legitimately differ — a model update moves every
 * bar on the chart and a naive diff reads that as the readout.
 *
 * Run it against the DEPLOYED copy, the same as scripts/mobile-audit.mjs:
 *
 *   node scripts/dev-server.mjs &
 *   node scripts/tap-audit.mjs
 */
import { spawn } from 'node:child_process';
import { chromiumPath } from './lib/chromium.mjs';
import http from 'node:http';

const URL = process.argv[2] || 'http://localhost:8000/weather/';
const port = 9300 + (process.pid % 90);
const chrome = spawn(chromiumPath(), ['--headless=new', `--remote-debugging-port=${port}`,
  '--no-sandbox', '--window-size=390,844', '--use-gl=angle', '--use-angle=swiftshader',
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

const phone = async () => {
  await S('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await S('Emulation.setEmulatedMedia', { features: [
    { name: 'pointer', value: 'coarse' }, { name: 'any-pointer', value: 'coarse' },
    { name: 'hover', value: 'none' }] });
  await S('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
};
const desktop = async () => {
  await S('Emulation.setTouchEmulationEnabled', { enabled: false });
  await S('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await S('Emulation.setEmulatedMedia', { features: [
    { name: 'pointer', value: 'fine' }, { name: 'any-pointer', value: 'fine' },
    { name: 'hover', value: 'hover' }] });
};
await phone();

const E = async e => {
  const r = await S('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'threw');
  return r.result?.result?.value;
};
await S('Page.navigate', { url: URL });
await wait(14000);

const rows = [];
const check = (name, got, ok, want) => rows.push({ name, got, ok: ok(got), want });

const view = async v => { await E(`window.ATMOS.setView('${v}')`); await wait(2400); };
const rect = async id => E(`(()=>{const r=document.getElementById('${id}').getBoundingClientRect();
  return {x:r.x,y:r.y,w:r.width,h:r.height};})()`);
const snap = async id => E(`(()=>{const c=document.getElementById('${id}');
  const g=c.getContext('2d');const d=g.getImageData(0,0,c.width,c.height).data;
  const out=[];for(let i=0;i<d.length;i+=4)out.push(d[i]+d[i+1]*7+d[i+2]*13+d[i+3]*17);return out;})()`);

/**
 * The readout is a near-opaque near-black plate. Sample a patch rather than
 * a pixel: the plate carries text, and a glyph is not the plate colour.
 */
const plate = async (id, fx, fy) => E(`(()=>{const c=document.getElementById('${id}');
  const g=c.getContext('2d'), R=7;
  const x=Math.max(0,Math.min(c.width-R*2,Math.round(c.width*${fx})-R));
  const y=Math.max(0,Math.min(c.height-R*2,Math.round(c.height*${fy})-R));
  const d=g.getImageData(x,y,R*2,R*2).data;
  let n=0,t=0;
  for(let i=0;i<d.length;i+=4){t++;if(d[i+3]>200&&d[i]<40&&d[i+1]<50&&d[i+2]<70)n++;}
  return n/t > 0.4;})()`);

const tap = async (x, y, { dx = 0, dy = 0 } = {}) => {
  await S('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 4 && (dx || dy); i++) {
    await S('Input.dispatchTouchEvent',
      { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / 4, y: y + (dy * i) / 4 }] });
  }
  await S('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await wait(450);
};

/* ------------------------------- the scroll contract ------------------- */

check('chart canvas touch-action',
  await E("getComputedStyle(document.getElementById('d2-clim')).touchAction"),
  v => v === 'pan-y', 'pan-y');
check('scrubber touch-action',
  await E("getComputedStyle(document.querySelector('.tl-canvas')).touchAction"),
  v => v === 'none', 'none (unchanged)');

/* ------------------------------- sticky readout ------------------------ */

await view('data');
const r = await rect('d2-clim');
// Touch the lower left; the readout is then expected upper right.
const px = r.x + r.w * 0.30, py = r.y + r.h * 0.75;
const PLATE = [0.80, 0.15];

const A = await snap('d2-clim');
await tap(px, py);
const B = await snap('d2-clim');

const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; };
const changed = diff(A, B);
check('readout survives the lift', changed, v => v > 5000, '> 5000 px drawn');
check('readout is on screen', await plate('d2-clim', ...PLATE), v => v === true, 'true');

// Placement is asserted on the plate itself rather than on a whole-canvas
// diff: the console keeps loading, and a data update moves every bar.
const underFinger = [];
for (const [fx, fy] of [[0.30, 0.75], [0.24, 0.70], [0.36, 0.80]]) {
  underFinger.push(await plate('d2-clim', fx, fy));
}
check('nothing drawn under the finger', underFinger.join(','),
  v => v === 'false,false,false', 'no plate at or beside the touch');

await tap(px, py);
check('a second tap on the spot dismisses it',
  await plate('d2-clim', ...PLATE), v => v === false, 'false');

await tap(px, py);
const rs = await rect('d2-spread');
await tap(rs.x + rs.w * 0.5, rs.y + rs.h * 0.4);
check('tapping another chart clears it',
  await plate('d2-clim', ...PLATE), v => v === false, 'false');

await tap(px, py);
const held = await plate('d2-clim', ...PLATE);
await view('deck'); await view('data');
check('a view change drops it',
  [held, await plate('d2-clim', ...PLATE)].join('/'), v => v === 'true/false', 'true/false');

/* --------------------------- the tap discriminator --------------------- */

await view('deck');
const rm = await rect('d-meteo');
const cur = () => E('window.ATMOS.store.cursor');
await E('window.ATMOS.store.playing = false');

const c0 = await cur();
await tap(rm.x + rm.w * 0.75, rm.y + rm.h * 0.5, { dx: 40 });
check('a slide along the chart is not a pick', (await cur()) - c0, v => v === 0, '0 ms moved');

await tap(rm.x + rm.w * 0.75, rm.y + rm.h * 0.5);
check('a tap is a pick', Math.abs((await cur()) - c0) > 60e3, v => v === true, 'cursor moved');

/* ------------------------------ the mouse, unchanged ------------------- */

await desktop();
await wait(1200);
await view('data');
const rd = await rect('d2-clim');
const mx = rd.x + rd.w * 0.30, my = rd.y + rd.h * 0.75;
// The box goes up and to the right of a mouse pointer, so this samples
// inside it rather than in the corner a finger would have pushed it to.
const NEAR = [0.30 + 60 / rd.w, 0.75 - 50 / rd.h];
await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: mx, y: my, buttons: 0 });
await wait(400);
check('mouse hover still draws a readout',
  await plate('d2-clim', ...NEAR), v => v === true, 'plate beside the pointer');
check('mouse readout follows the pointer, not pinned',
  await plate('d2-clim', ...PLATE), v => v === false, 'nothing in the corner');
await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 4, y: 4, buttons: 0 });
await wait(400);
check('mouse leaving clears it',
  await plate('d2-clim', ...NEAR), v => v === false, 'plate gone');

const errs = ev.filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
  .map(e => e.params.entry.text).filter(t => !/favicon/.test(t));
check('console errors', errs.length, v => v === 0, '0');

console.log(`\n  ${URL}\n`);
let fails = 0;
for (const x of rows) {
  if (!x.ok) fails++;
  console.log(' ', x.ok ? 'PASS' : 'FAIL', String(x.name).padEnd(40), String(x.got).padEnd(10), x.want);
}
console.log('\n ', fails ? `${fails} gate(s) failing` : 'all gates green');
if (errs.length) console.log('  errors:', errs.slice(0, 3));
chrome.kill();
process.exit(fails ? 1 : 0);
