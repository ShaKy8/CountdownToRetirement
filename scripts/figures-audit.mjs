/*
 * The two margin figures on /countdown/: the sky arc on the right -- the sun
 * (count-up) or the moon (countdown) crossing from one horizon to the other
 * -- and the milestone trail on the left, every milestone as a stop on one
 * path with the sun at today.
 *
 * Both drawings are checked against the geometry in calc.js, not against
 * themselves: the rendered centre of the sun has to land where skyArcPoint()
 * and milestoneTrail() say, to a pixel, in both modes, with and without
 * reduced motion. Neither figure may move at all -- a transition on the arc's
 * body would interpolate the chord of the arc, and slide the sun backwards
 * through the sky every time a milestone is crossed and the fraction drops.
 * And no label on the trail may overlap another, at a tall viewport and a
 * short one, because the sun's count can sit a pixel from a stop.
 *
 *   PORT=8137 node scripts/dev-server.mjs &
 *   node scripts/figures-audit.mjs http://localhost:8137
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

console.log(`\nMARGIN FIGURES — ${ORIGIN}/countdown/ at ${W}x${H}\n`);

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

// ---- the trail ----
const TRAIL = `(()=>{const c=document.getElementById('trail-container'); if(!c) return null;
  const track=c.querySelector('.trail-track'), tr=track.getBoundingClientRect();
  const sun=document.getElementById('trail-sun'), sr=sun.getBoundingClientRect();
  const stops=[...c.querySelectorAll('.trail-stop')];
  const labels=[...c.querySelectorAll('.trail-stop-label'), document.getElementById('trail-sun-label')]
    .map(el=>{const r=el.getBoundingClientRect(); return {t:el.textContent.trim(), l:r.left, r:r.right, top:r.top, b:r.bottom};});
  let overlaps=[];
  for(let i=0;i<labels.length;i++) for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];
    if(a.l<b.r-0.5&&b.l<a.r-0.5&&a.top<b.b-0.5&&b.top<a.b-0.5) overlaps.push(a.t+' / '+b.t);}
  const inside=labels.every(x=>x.l>=c.getBoundingClientRect().left-0.5&&x.r<=c.getBoundingClientRect().right+0.5);
  return {trackTop:tr.top, trackH:tr.height, sunY:sr.top+sr.height/2,
    states:stops.map(s=>s.className.replace('trail-stop is-','')),
    texts:stops.map(s=>s.querySelector('.trail-stop-label').textContent),
    count:document.getElementById('trail-sun-count').textContent,
    unit:document.getElementById('trail-sun-unit').textContent,
    overlaps, inside, animations:c.getAnimations({subtree:true}).length,
    display:getComputedStyle(c).display};})()`;

for (const [mode, height] of [['countup', 800], ['countup', 640], ['countdown', 800], ['countdown', 640]]) {
  const tag = `trail, ${mode} at ${height} tall`;
  await S('Emulation.setDeviceMetricsOverride', { width: W, height, deviceScaleFactor: 1, mobile: false });
  await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await S('Page.navigate', { url: ORIGIN + '/countdown/index.html' });
  for (let i = 0; i < 40; i++) {
    if (await E("!!document.getElementById('trail-sun') && typeof renderTrail === 'function'")) break;
    await wait(200);
  }
  const date = mode === 'countdown' ? '2028-01-01T16:00' : '2026-02-27T16:00';
  await E(`(()=>{const i=document.getElementById('retirement-date'); i.value='${date}';
    document.getElementById('update-date').click(); return 1;})()`);
  await wait(300);
  // Neutralise the page's own renders, then draw a known day and measure.
  await E("window.__trail = renderTrail; renderTrail = () => {}; 1");
  const days = mode === 'countup' ? 209 : 400;
  const span = 2705;
  await E(`lastTrailKey = null; __trail(${days}, '${mode}', ${span}), 1`);
  for (let i = 0; i < 2; i++) { await S('Page.captureScreenshot', { format: 'jpeg', quality: 1 }); await wait(60); }
  const s = await E(TRAIL);
  if (!s) { gate(false, `${tag}: the figure is on the page`); continue; }
  const list = mode === 'countup' ? Calc.COUNTUP_MILESTONES : Calc.COUNTDOWN_MILESTONES;
  const trail = Calc.milestoneTrail(days, list, mode, span);
  gate(s.states.length === trail.stops.length + 1 && s.states[0] === 'origin',
    `${tag}: the origin and every stop are drawn`, `${s.states.length} for ${trail.stops.length + 1}`);
  gate(s.states.slice(1).join(',') === trail.stops.map(x => x.state).join(','),
    `${tag}: passed, next and ahead match the geometry`, s.states.slice(1).join(','));
  gate(s.texts[s.texts.length - 1] === (mode === 'countup' ? 'Ten Years' : 'Freedom Day'),
    `${tag}: the top stop is the end of the road`, s.texts[s.texts.length - 1]);
  const expectedY = s.trackTop + s.trackH * (1 - trail.marker.t);
  gate(Math.abs(s.sunY - expectedY) <= 1, `${tag}: the sun is where the geometry puts it`,
    `${(s.sunY - expectedY).toFixed(2)}px off at t=${trail.marker.t.toFixed(3)}`);
  gate(s.count === String(days) && s.unit === (mode === 'countup' ? 'days' : 'left'),
    `${tag}: the count beside the sun is the day count`, `${s.count} ${s.unit}`);
  gate(s.overlaps.length === 0, `${tag}: no label overlaps another`, s.overlaps.join(' | '));
  gate(s.inside, `${tag}: every label is inside the panel`);
  gate(s.animations === 0, `${tag}: nothing in the figure animates`, `${s.animations} running`);
  /*
   * The worst case for collisions is a sun a hair past a stop, with its
   * count level with that stop's label. Try the day after every stop.
   */
  const near = [];
  for (const m of list) {
    const d = mode === 'countup' ? m.threshold + 1 : m.threshold - 1;
    await E(`lastTrailKey = null; __trail(${d}, '${mode}', ${span}), 1`);
    const n = await E(TRAIL);
    if (n.overlaps.length) near.push(`day ${d}: ${n.overlaps.join(', ')}`);
  }
  gate(near.length === 0, `${tag}: no overlap with the sun a day past any stop`, near.join(' | '));
}

// A phone or tablet has no margin for the trail either.
await S('Emulation.setDeviceMetricsOverride', { width: 1024, height: 800, deviceScaleFactor: 1, mobile: false });
{
  const s = await E(TRAIL);
  gate(s && s.display === 'none', 'trail: hidden at 1024 and below', s ? s.display : 'no figure');
}
await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });

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
