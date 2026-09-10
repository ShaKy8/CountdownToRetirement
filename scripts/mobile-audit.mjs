/*
 * Mobile audit for the weather console.
 *
 * Loads every view at iPhone size in headless Chromium and asserts the things
 * that made /weather/ unusable on a phone. Deliberately NOT wired into CI - it
 * needs a browser and takes about a minute - but it is the check to run before
 * touching the console's layout.
 *
 *   node scripts/dev-server.mjs &
 *   node scripts/mobile-audit.mjs
 *   node scripts/mobile-audit.mjs https://branyontech.com/weather/
 *   node scripts/mobile-audit.mjs http://localhost:8000/weather/ 1440 900
 *
 * Point it at /weather/ on the DEV SERVER, not at ../Weather's own server: the
 * deployed copy carries a back-link that the source does not, and that one
 * extra top-bar child was enough to push the settings button off screen and
 * widen every view by 26px. The source passed while production failed.
 *
 * At desktop width the touch-target, font-size and render-tier rows are
 * expected to fail - they are mobile gates, and seeing the original desktop
 * values there is how you know the media query is scoped correctly.
 *
 * Baseline before any of this work, at 390x844:
 *   content 983px wide, 5 top-bar controls off screen, 38 targets under 44px,
 *   smallest font 6.9px, no safe-area insets, scrubber not draggable.
 */
import { spawn } from 'node:child_process';
import { chromiumPath } from './lib/chromium.mjs';
import http from 'node:http';

const URL = process.argv[2] || 'http://localhost:8000/weather/';
const W = Number(process.argv[3] || 390);
const H = Number(process.argv[4] || 844);
const port = 9400 + (process.pid % 90);

const chrome = spawn(chromiumPath(), ['--headless=new', `--remote-debugging-port=${port}`,
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
// setDeviceMetricsOverride does not imply a coarse pointer, and the console
// keys its mobile render tier off exactly that.
await S('Emulation.setEmulatedMedia', { features: [
  { name: 'pointer', value: 'coarse' }, { name: 'any-pointer', value: 'coarse' },
  { name: 'hover', value: 'none' }] });
await S('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
const E = async e => (await S('Runtime.evaluate',
  { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;

await S('Page.navigate', { url: URL });
await wait(11000);

const rows = [];
const push = (name, value, ok, note) => rows.push({ name, value, ok, note });

push('horizontal overflow', await E('document.documentElement.scrollWidth - window.innerWidth') + 'px',
  v => parseInt(v) <= 0, '= 0');

// Every view: elements whose right edge leaves the viewport.
const views = ['deck', 'radar', 'sky', 'air', 'data'];
let worst = 0;
const per = [];
for (const v of views) {
  await E(`(()=>{try{window.ATMOS.setView('${v}')}catch(e){}})()`);
  await wait(2200);
  const n = await E(`(()=>{let n=0;document.querySelectorAll('#view-${v} *').forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.width<=2||r.height<=2||r.right<=${W}+2) return;
    // Content inside a deliberately horizontal scroller is not overflow.
    let p=el.parentElement;
    while(p&&p!==document.body){const st=getComputedStyle(p);
      if(st.overflowX==='auto'||st.overflowX==='scroll') return; p=p.parentElement;}
    n++;}); return n;})()`);
  per.push(v + ':' + n); worst = Math.max(worst, n);
}
push('elements past the right edge', per.join(' '), () => worst === 0, 'all views 0');

await E("(()=>{try{window.ATMOS.setView('deck')}catch(e){}})()"); await wait(1500);

push('controls outside the viewport',
  await E(`(()=>{const bad=[];document.querySelectorAll('#topbar button, #topbar a, #scrub button').forEach(el=>{
    const r=el.getBoundingClientRect(); if(r.width>0&&(r.right>${W}+1||r.left<-1)) bad.push(el.id||el.textContent.trim().slice(0,8));});
    return bad.length ? bad.length+' ('+bad.slice(0,6).join(',')+')' : '0';})()`),
  v => v === '0', '= 0');

push('touch targets under 44px',
  await E(`(()=>{let n=0;document.querySelectorAll('button,a,[role=button],input,.tenday-col,.res-item').forEach(el=>{
    const r=el.getBoundingClientRect(); if(r.width>0&&r.height>0&&(r.width<43.5||r.height<43.5)) n++;}); return n;})()`),
  v => v === 0, '= 0');

push('smallest rendered font',
  await E(`(()=>{let m=99;document.querySelectorAll('*').forEach(el=>{
    if(!el.firstChild||el.firstChild.nodeType!==3||!el.textContent.trim())return;
    const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return;
    const f=parseFloat(getComputedStyle(el).fontSize); if(f<m)m=f;}); return m;})()`) + 'px',
  v => parseFloat(v) >= 12, '>= 12px');

push('scrubber canvas width',
  await E(`(()=>{const c=document.querySelector('#scrub canvas'); return c?Math.round(c.getBoundingClientRect().width):0;})()`) + 'px',
  v => parseInt(v) > 250, '> 250px');

push('scrubber touch-action',
  await E(`(()=>{const c=document.querySelector('#scrub canvas'); return c?getComputedStyle(c).touchAction:'no canvas';})()`),
  v => v !== 'auto' && v !== 'no canvas', 'not auto');

push('search input font-size',
  await E(`(()=>{const i=document.querySelector('.search-input'); if(!i)return 'n/a';
    return parseFloat(getComputedStyle(i).fontSize);})()`),
  v => v === 'n/a' || v >= 16, '>= 16px (iOS auto-zoom)');

push('safe-area used', await E(`[...document.styleSheets].some(s=>{try{return [...s.cssRules].some(r=>{
  const t=r.cssText||''; return t.includes('safe-area-inset')||(r.cssRules&&[...r.cssRules].some(x=>(x.cssText||'').includes('safe-area-inset')));})}catch(e){return false}})`),
  v => v === true, 'true');

push('render tier on mobile', await E("document.documentElement.dataset.q ?? '(unset)'"),
  v => v === '0' || v === '1' || v === '2', '<= 2 on a phone');

const errs = ev.filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
  .map(e => e.params.entry.text).filter(t => !/favicon/.test(t));
push('console errors', errs.length, v => v === 0, '= 0');

console.log(`\n  ${URL}  at ${W}x${H}\n`);
let fails = 0;
for (const r of rows) {
  const ok = r.ok(r.value);
  if (!ok) fails++;
  console.log(' ', ok ? 'PASS' : 'FAIL', String(r.name).padEnd(30),
    String(r.value).padEnd(26), r.note);
}
console.log('\n ', fails ? `${fails} gate(s) failing` : 'all gates green');
if (errs.length) console.log('  errors:', errs.slice(0, 3));
chrome.kill();
process.exit(0);
