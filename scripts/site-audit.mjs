/*
 * The rest of the site on a phone.
 *
 * scripts/mobile-audit.mjs covers /weather/. This covers everything else,
 * plus the one check neither had: TEXT HARD-CLIPPED INSIDE ITS OWN BOX.
 * That is invisible to an overflow check — nothing leaves the viewport — and
 * it is how "Los Angeles / California · US" spent a release rendering as
 * "Los Ang / CALIFORNI" in the console's top bar.
 *
 * Clipping with `text-overflow: ellipsis` is a decision. Clipping without one
 * is a bug, so that is the line this draws.
 *
 * Touch targets are held to WCAG 2.5.8 rather than to a flat 44px: 24x24 CSS
 * px always, and 44x44 whenever another target sits within 12px of it. A flat
 * 44 would have forced the landing page's six text links -- 36px tall with
 * 16px of air around them, and nothing else near -- to grow boxes that pull
 * their underlines away from the words. That is a worse page, not a more
 * accessible one.
 *
 *   node scripts/dev-server.mjs &
 *   node scripts/site-audit.mjs
 *   node scripts/site-audit.mjs http://localhost:8000 320 700
 */
import { spawn } from 'node:child_process';
import { chromiumPath } from './lib/chromium.mjs';
import http from 'node:http';

const ORIGIN = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const W = Number(process.argv[3] || 390);
const H = Number(process.argv[4] || 844);
const port = 9000 + (process.pid % 90);

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
await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
// The console keys its render tier off a coarse pointer, and every one of
// these pages is being judged as a phone.
await S('Emulation.setEmulatedMedia', { features: [
  { name: 'pointer', value: 'coarse' }, { name: 'any-pointer', value: 'coarse' },
  { name: 'hover', value: 'none' }] });
await S('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
const E = async e => (await S('Runtime.evaluate',
  { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;

const NAME = "(el)=>{const c=(typeof el.className==='string'?el.className:'')||el.id||el.tagName;"
  + "return String(c).trim().split(/\\s+/).slice(0,2).join('.')||el.tagName;}";

const PAGES = [
  ['/', '/', 1800],
  ['/countdown/', '/countdown/index.html', 2200],
  ['/game/', '/game/', 4500],
  ['/slingshot/', '/slingshot/', 4500],
  ['/weather/', '/weather/', 13000],
];

const rows = [];
for (const [label, path, settle] of PAGES) {
  ev = [];
  await S('Page.navigate', { url: ORIGIN + path });
  await wait(settle);

  const overflow = await E('document.documentElement.scrollWidth - window.innerWidth');

  /*
   * Anything a finger is meant to hit. Skipped: elements parked off-screen
   * (the skip links live at left:-9999px until focused) and anything a
   * parent has hidden.
   */
  const small = await E(`(()=>{const nm=${NAME};const out=[];
    const t=[];
    document.querySelectorAll('button,a[href],[role=button],input,select,summary').forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.width<=0||r.height<=0) return;
      if(r.right<0||r.bottom<0||r.left>innerWidth||r.top>innerHeight) return;
      if(el.type==='hidden') return;
      t.push({el,r});});
    // Edge-to-edge distance to the nearest other target.
    const near=(a)=>{let m=Infinity;
      for(const b of t){ if(b.el===a.el||a.el.contains(b.el)||b.el.contains(a.el)) continue;
        const dx=Math.max(0, Math.max(a.r.left-b.r.right, b.r.left-a.r.right));
        const dy=Math.max(0, Math.max(a.r.top-b.r.bottom, b.r.top-a.r.bottom));
        m=Math.min(m, Math.hypot(dx,dy));}
      return m;};
    for(const a of t){
      const w=a.r.width, h=a.r.height;
      const tiny = w<23.5||h<23.5;                       // WCAG 2.5.8 floor
      const crowded = (w<43.5||h<43.5) && near(a)<12;    // ...and its spacing exception
      if(tiny||crowded)
        out.push(nm(a.el)+' '+Math.round(w)+'x'+Math.round(h)
          +(crowded&&!tiny?' (neighbour '+Math.round(near(a))+'px)':''));}
    return out;})()`);

  /*
   * Text cut off inside its own box with no ellipsis to say so. An
   * intermediate wrapper that never shrinks is the usual cause: the ellipsis
   * rule sits on the child, the child measures itself against the wrapper's
   * full width, and the grandparent hard-clips the lot.
   */
  const clipped = await E(`(()=>{const nm=${NAME};const out=[];
    document.querySelectorAll('*').forEach(el=>{
      if(!el.textContent.trim()) return;
      const r=el.getBoundingClientRect();
      if(r.width<4||r.height<4) return;
      const s=getComputedStyle(el);
      if(s.overflowX!=='hidden'&&s.overflowX!=='clip') return;
      if(s.textOverflow==='ellipsis') return;              // truncation by choice
      if(el.scrollWidth-el.clientWidth<=1) return;
      out.push(nm(el)+' '+el.clientWidth+'<'+el.scrollWidth+' "'+el.textContent.trim().replace(/\\s+/g,' ').slice(0,24)+'"');});
    return [...new Set(out)];})()`);

  const errs = ev.filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
    .map(e => e.params.entry.text).filter(t => !/favicon/.test(t));

  rows.push({ label, overflow, small, clipped, errs });
}

console.log(`\n  ${ORIGIN}  at ${W}x${H}\n`);
let fails = 0;
for (const r of rows) {
  const bad = (r.overflow > 0 ? 1 : 0) + (r.small.length ? 1 : 0)
    + (r.clipped.length ? 1 : 0) + (r.errs.length ? 1 : 0);
  fails += bad;
  console.log(' ', bad ? 'FAIL' : 'PASS', r.label);
  console.log(`      horizontal overflow  ${r.overflow}px`);
  console.log(`      touch targets        ${r.small.length ? r.small.join(', ') : 'none'}`);
  console.log(`      hard-clipped text    ${r.clipped.length ? r.clipped.join(' | ') : 'none'}`);
  console.log(`      console errors       ${r.errs.length}${r.errs.length ? ' -> ' + r.errs[0].slice(0, 80) : ''}`);
}
console.log('\n ', fails ? `${fails} check(s) failing` : 'all pages clean');
chrome.kill();
process.exit(fails ? 1 : 0);
