/*
 * The sky arc on /countdown/ -- the sun (count-up) or the moon (countdown)
 * crossing from one horizon to the other.
 *
 * The drawing is checked against the geometry in calc.js, not against
 * itself: the body's rendered centre has to land where skyArcPoint() says,
 * to a pixel, in both modes, with and without reduced motion. And the figure
 * must not move at all -- a transition on the body would interpolate the
 * chord of the arc, and slide the sun backwards through the sky every time a
 * milestone is crossed and the fraction drops.
 *
 *   PORT=8137 node scripts/dev-server.mjs &
 *   node scripts/sky-arc-audit.mjs http://localhost:8137
 */
import { spawn } from 'node:child_process';
import { chromiumPath } from './lib/chromium.mjs';
import { createRequire } from 'node:module';
import http from 'node:http';

const Calc = createRequire(import.meta.url)('../countdown/calc.js');
const ORIGIN = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const W = 1280, H = 800;
const port = 9200 + (process.pid % 90);

const chrome = spawn(chromiumPath(), ['--headless=new', `--remote-debugging-port=${port}`,
  '--no-sandbox', `--window-size=${W},${H}`, '--use-gl=angle', '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', 'about:blank'], { stdio: 'ignore' });
const get = p => new Promise((r, j) => http.get({ host: '127.0.0.1', port, path: p },
  x => { let d = ''; x.on('data', c => d += c); x.on('end', () => r(JSON.parse(d))); }).on('error', j));
const wait = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { await get('/json/version'); break; } catch { await wait(250); } }
const { webSocketDebuggerUrl } = await get('/json/version');
const ws = new WebSocket(webSocketDebuggerUrl);
let id = 0; const P = new Map(); const errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data);
  if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value).join(' ')); };
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

const FRACTION = 0.573;
const STATE = `(()=>{const c=document.getElementById('sky-arc-container');
  const svg=c&&c.querySelector('svg'); if(!svg) return null;
  const sr=svg.getBoundingClientRect();
  const vis=el=>getComputedStyle(el).display!=='none';
  const sun=svg.querySelector('.sky-arc-sun'), moon=svg.querySelector('.sky-arc-moon');
  const body=vis(sun)?sun:moon; const br=body.getBoundingClientRect();
  const hz=svg.querySelector('.sky-arc-horizon').getBoundingClientRect();
  return {mode:document.body.classList.contains('mode-countup')?'countup':'countdown',
    sunShown:vis(sun), moonShown:vis(moon),
    scale:sr.width/200, sx:sr.left, sy:sr.top,
    bx:br.left+br.width/2, by:br.top+br.height/2, horizonY:hz.top+hz.height/2,
    animations:c.getAnimations({subtree:true}).length,
    display:getComputedStyle(c).display,
    label:document.getElementById('sky-arc-label').textContent,
    start:document.getElementById('sky-arc-start').textContent,
    icon:document.getElementById('sky-arc-end-icon').textContent,
    forced:matchMedia('(forced-colors: active)').matches,
    glowShown:vis(svg.querySelector('.sky-arc-glow'))};})()`;

async function load(mode, reduced) {
  await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await S('Emulation.setEmulatedMedia', { features: [
    { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
  await S('Page.navigate', { url: ORIGIN + '/countdown/index.html' });
  for (let i = 0; i < 40; i++) {
    if (await E("!!document.getElementById('sky-arc-body') && typeof renderSkyArc === 'function'")) break;
    await wait(200);
  }
  // A future date is countdown mode; the default is Kyle's, in the past.
  const date = mode === 'countdown' ? '2028-01-01T16:00' : '2026-02-27T16:00';
  await E(`(()=>{const i=document.getElementById('retirement-date'); i.value='${date}';
    document.getElementById('update-date').click(); return 1;})()`);
  await wait(300);
  for (let i = 0; i < 3; i++) { await S('Page.captureScreenshot', { format: 'jpeg', quality: 1 }); await wait(60); }
}

console.log(`\nSKY ARC — ${ORIGIN}/countdown/ at ${W}x${H}\n`);

for (const mode of ['countup', 'countdown']) {
  for (const reduced of [false, true]) {
    const tag = `${mode}${reduced ? ', reduced motion' : ''}`;
    await load(mode, reduced);
    let s = await E(STATE);
    if (!s) { gate(false, `${tag}: the figure is on the page`); continue; }
    gate(s.mode === mode, `${tag}: the page is in ${mode} mode`, s.mode);
    gate(mode === 'countup' ? s.sunShown && !s.moonShown : s.moonShown && !s.sunShown,
      `${tag}: ${mode === 'countup' ? 'the sun, not the moon' : 'the moon, not the sun'}`,
      `sun ${s.sunShown}, moon ${s.moonShown}`);
    gate(s.animations === 0, `${tag}: nothing in the figure animates`, `${s.animations} running`);
    gate(mode === 'countup' ? s.start === 'Retired' && s.icon !== '🏝️' : s.start === 'Day One' && s.icon === '🏝️',
      `${tag}: the horizons are named for the mode`, `${s.start} → ${s.icon}`);
    gate(/^\d+\.\d% to /.test(s.label), `${tag}: the caption carries the number and names the far horizon`, s.label);

    /*
     * Place the body ourselves at a known fraction and measure where it
     * landed. In countdown mode the page re-renders every second and would
     * put the moon back, so the page's own calls are turned into no-ops
     * first: renderCountdown looks the function up by name each time.
     *
     * One frame is pumped before reading. Under reduced motion the global
     * `transition-duration: 0.01ms` rule makes a 0.01ms transition on the
     * transform, so a synchronous read sees the OLD position; after one frame
     * it is done, while a real transition would barely have started.
     */
    await E("window.__place = renderSkyArc; renderSkyArc = () => {}; 1");
    const place = async f => {
      await E(`__place({fraction:${f},label:'x',startLabel:'a',endLabel:'b',endIcon:'c'}), 1`);
      await S('Page.captureScreenshot', { format: 'jpeg', quality: 1 });
    };
    await place(FRACTION);
    s = await E(STATE);
    const p = Calc.skyArcPoint(FRACTION);
    const ex = s.sx + p.x * s.scale, ey = s.sy + p.y * s.scale;
    const off = Math.hypot(s.bx - ex, s.by - ey);
    gate(off <= 1, `${tag}: the body is where the geometry puts it`,
      `${off.toFixed(2)}px off at fraction ${FRACTION}`);
    gate(s.by < s.horizonY, `${tag}: and above the horizon`, `body ${s.by.toFixed(1)}, horizon ${s.horizonY.toFixed(1)}`);
    // A transition would still be mid-flight one frame in; a transform is not.
    await place(0);
    const t = await E(STATE);
    const p0 = Calc.skyArcPoint(0);
    gate(Math.abs(t.bx - (t.sx + p0.x * t.scale)) <= 1,
      `${tag}: it moves in one step, not a transition`, `${(t.bx - (t.sx + p0.x * t.scale)).toFixed(2)}px from the horizon`);
  }
}

// Forced colours: fills are not forced, so the glows go and the arc stays.
await S('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }, { name: 'prefers-reduced-motion', value: 'no-preference' }] });
await S('Page.navigate', { url: ORIGIN + '/countdown/index.html' });
for (let i = 0; i < 40; i++) { if (await E("!!document.getElementById('sky-arc-body')")) break; await wait(200); }
for (let i = 0; i < 3; i++) { await S('Page.captureScreenshot', { format: 'jpeg', quality: 1 }); await wait(100); }
let s = await E(STATE);
gate(s && s.forced, 'forced colours: the emulation took', s ? `matches ${s.forced}` : 'no figure');
gate(s && !s.glowShown, 'forced colours: the glow is gone', s ? `glow ${s.glowShown}` : 'no figure');
await S('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'none' }] });

// A phone or tablet has no margin for a margin figure.
await S('Emulation.setDeviceMetricsOverride', { width: 1024, height: 800, deviceScaleFactor: 1, mobile: false });
s = await E(STATE);
gate(s && s.display === 'none', 'hidden at 1024 and below', s ? s.display : 'no figure');

gate(errors.length === 0, 'no console errors', errors.slice(0, 3).join(' | '));

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join(', ')}` : 'all gates pass'}\n`);
ws.close(); chrome.kill();
process.exit(fails.length ? 1 : 0);
