/*
 * The trips panel on /countdown/.
 *
 * ASSERTS ON DOM STATE, NEVER ON COMPUTED OPACITY. Headless Chromium produces
 * no frames unless something asks it to, so a CSS transition sits frozen at its
 * start value and getComputedStyle reports a number that is true of no moment
 * the user would ever see. `hidden`, `classList` and `aria-expanded` are set
 * synchronously and are always current.
 *
 *   node scripts/dev-server.mjs &
 *   node scripts/trips-audit.mjs
 *   node scripts/trips-audit.mjs http://localhost:8000 320 700
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import http from 'node:http';

const ORIGIN = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const W = Number(process.argv[3] || 390);
const H = Number(process.argv[4] || 844);
const port = 9200 + (process.pid % 90);

const stats = JSON.parse(readFileSync(new URL('../countdown/stats.json', import.meta.url), 'utf8'));

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
let id = 0; const P = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } };
await new Promise(r => ws.onopen = r);
const send = (me, pa = {}, s) => new Promise(r => { const i = ++id; P.set(i, r);
  ws.send(JSON.stringify({ id: i, method: me, params: pa, sessionId: s })); });
const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);
await S('Runtime.enable'); await S('Page.enable');

const E = async e => (await S('Runtime.evaluate',
  { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;

const fails = [];
const gate = (ok, name, detail = '') => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? '  — ' + detail : ''}`);
  if (!ok) fails.push(name);
};

// The one readout of the panel's state, in one place.
const STATE = `(()=>{const c=document.getElementById('stat-trips-card');
  const p=document.getElementById('stat-trips-detail');
  const g=document.getElementById('personal-metrics');
  if(!c||!p||!g) return null;
  const pr=p.getBoundingClientRect(), gr=g.getBoundingClientRect(), cr=c.getBoundingClientRect();
  return {open:c.classList.contains('is-open'), expanded:c.getAttribute('aria-expanded'),
    hidden:p.hidden, count:document.getElementById('stat-trips').textContent.trim(),
    items:[...p.querySelectorAll('li')].map(li=>li.textContent.trim()),
    caret:p.style.getPropertyValue('--caret-x'),
    left:Math.round(pr.left), right:Math.round(pr.right), vw:innerWidth,
    bottom:Math.round(pr.bottom), cardTop:Math.round(cr.top),
    cardLeft:Math.round(cr.left), cardRight:Math.round(cr.right),
    hover:matchMedia('(hover: hover)').matches,
    gLeft:Math.round(gr.left), gRight:Math.round(gr.right),
    overflow:document.documentElement.scrollWidth-innerWidth};})()`;

const setPointer = coarse => S('Emulation.setEmulatedMedia', { features: [
  { name: 'pointer', value: coarse ? 'coarse' : 'fine' },
  { name: 'any-pointer', value: coarse ? 'coarse' : 'fine' },
  { name: 'hover', value: coarse ? 'none' : 'hover' }] });

async function load(coarse) {
  // mobile:true forces hover:none and pointer:coarse regardless of what
  // setEmulatedMedia asks for, so it has to follow the pointer under test.
  // Without the override at all, innerWidth ignores the window flag and every
  // measurement is taken against the wrong viewport.
  await S('Emulation.setDeviceMetricsOverride',
    { width: W, height: H, deviceScaleFactor: 2, mobile: coarse });
  await setPointer(coarse);
  await S('Emulation.setTouchEmulationEnabled', { enabled: coarse, maxTouchPoints: coarse ? 5 : 0 });
  await S('Page.navigate', { url: ORIGIN + '/countdown/index.html' });
  // Wait for stats.json to land rather than guessing at it: a cold server
  // answers slower than any fixed sleep is willing to admit, and the count
  // then reads 0 for reasons that have nothing to do with the panel.
  for (let i = 0; i < 60; i++) {
    if (await E("document.querySelectorAll('#trip-list li').length > 0")) break;
    await wait(200);
  }
}

const click = () => E(`(()=>{const c=document.getElementById('stat-trips-card');
  c.focus(); c.click(); return 1;})()`);
const key = k => E(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}',bubbles:true})), 1`);
const outside = () => E(`document.getElementById('personal-heading').click(), 1`);
// pointerType is what the handlers actually read, so the gate has to send it.
const hover = (t, type = 'mouse') => E(`document.getElementById('stat-trips-card')
  .dispatchEvent(new PointerEvent('pointer${t}',{bubbles:false,pointerType:'${type}'})), 1`);

console.log(`\nTRIPS PANEL — ${ORIGIN}/countdown/ at ${W}x${H}\n`);

// ---- coarse pointer: the phone, where hover does not exist ----
await load(true);
let s = await E(STATE);
if (!s) { console.log(' FAIL  the tile and panel are not on the page'); process.exit(1); }

gate(s.hidden === true && s.expanded === 'false' && !s.open, 'starts closed');
gate(s.count === String(stats.trips.length), 'the count is the length of the list',
  `shows ${s.count}, list has ${stats.trips.length}`);

await click(); s = await E(STATE);
gate(s.hidden === false && s.expanded === 'true' && s.open, 'a tap opens it');
gate(s.items.length === stats.trips.length, 'every trip is listed',
  `${s.items.length} of ${stats.trips.length}`);
const missing = stats.trips.filter(t => !s.items.some(i => i.includes(t.place)));
gate(missing.length === 0, 'every place name appears', missing.map(t => t.place).join(', '));
gate(s.right <= s.vw + 1 && s.left >= -1, 'the panel stays on screen',
  `${s.left}..${s.right} in ${s.vw}`);
gate(s.overflow <= 0, 'the page does not scroll sideways while open', `${s.overflow}px`);
// Above the tile, not below it. The grid is two columns on a phone, so a
// panel underneath puts its caret against the bottom row and appears to be
// describing whichever tile is down there instead.
gate(s.bottom <= s.cardTop + 1, 'the panel sits above the tile',
  `panel ends ${s.bottom}, tile starts ${s.cardTop}`);
const cx = parseFloat(s.caret);
const caretX = s.gLeft + cx;
gate(caretX >= s.cardLeft && caretX <= s.cardRight,
  'the caret points at the trips tile', `${Math.round(caretX)} in ${s.cardLeft}..${s.cardRight}`);

await click(); s = await E(STATE);
gate(s.hidden === true && s.expanded === 'false', 'a second tap closes it');

await click(); await key('Escape'); s = await E(STATE);
gate(s.hidden === true && s.expanded === 'false', 'Escape closes it');

await click(); await outside(); s = await E(STATE);
gate(s.hidden === true && s.expanded === 'false', 'a tap outside closes it');

// A lift is not a leave. pointerleave fires on every touch release, so if the
// tap path listened to it the panel would shut the instant it opened.
await click(); await hover('leave', 'touch'); s = await E(STATE);
gate(s.hidden === false, 'a touch lift does not close a tapped panel');

// ---- fine pointer: the desktop, where hover is the whole interaction ----
await load(false);
await hover('enter'); s = await E(STATE);
gate(s.hidden === false && s.expanded === 'true', 'hover opens it on a mouse');
await hover('leave'); s = await E(STATE);
gate(s.hidden === true && s.expanded === 'false', 'moving away closes it');

await click(); await hover('leave'); s = await E(STATE);
gate(s.hidden === false, 'a click pins it open past the mouse leaving');

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join(', ')}` : 'all gates pass'}\n`);
ws.close(); chrome.kill();
process.exit(fails.length ? 1 : 0);
