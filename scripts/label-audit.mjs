/*
 * Chart labels: which ones collide, and which run off the canvas.
 *
 * Canvas text is invisible to the DOM, so this wraps fillText and has every
 * label report its own ink box (actualBoundingBox*, not a font-size guess),
 * resetting on each full clearRect so only the LAST render of a canvas
 * counts. Then it looks for pairs that intersect and boxes that leave the
 * bitmap.
 *
 * Run it against the DEPLOYED copy, as with the other two audits, and run it
 * at BOTH widths: three of the collisions it first found were wrong on the
 * desktop as well.
 *
 *   node scripts/dev-server.mjs &
 *   node scripts/label-audit.mjs                                  # 390x844
 *   node scripts/label-audit.mjs http://localhost:8000/weather/ 1440 900
 *
 * CENSUS=1 also prints the label count per canvas, which is how you tell a
 * fix from a regression: a chart that stopped colliding by dropping half its
 * axis is not fixed.
 */
import { spawn } from 'node:child_process';
import { chromiumPath } from './lib/chromium.mjs';
import http from 'node:http';

const URL = process.argv[2] || 'http://localhost:8000/weather/';
const W = Number(process.argv[3] || 390), H = Number(process.argv[4] || 844);
const port = 9200 + (process.pid % 90);
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
let id = 0; const P = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } };
await new Promise(r => ws.onopen = r);
const send = (me, pa = {}, s) => new Promise(r => { const i = ++id; P.set(i, r);
  ws.send(JSON.stringify({ id: i, method: me, params: pa, sessionId: s })); });
const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);
await S('Runtime.enable'); await S('Page.enable');
await S('Emulation.setDeviceMetricsOverride',
  { width: W, height: H, deviceScaleFactor: 2, mobile: W < 800 });
if (W < 800) {
  await S('Emulation.setEmulatedMedia', { features: [
    { name: 'pointer', value: 'coarse' }, { name: 'any-pointer', value: 'coarse' },
    { name: 'hover', value: 'none' }] });
  await S('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}

const PROBE = `(() => {
  const P = CanvasRenderingContext2D.prototype;
  const fill = P.fillText, clear = P.clearRect;
  const store = new Map();
  window.__labels = store;
  P.clearRect = function (x, y, w, h) {
    const c = this.canvas;
    if (c && x <= 0.5 && y <= 0.5 && w >= c.clientWidth - 1) store.set(c.id || c.className, []);
    return clear.apply(this, arguments);
  };
  P.fillText = function (text, x, y) {
    try {
      const c = this.canvas, k = c.id || c.className;
      let a = store.get(k); if (!a) store.set(k, a = []);
      const s = String(text);
      // Ink extents, not a font-size guess: actualBoundingBox* is measured
      // from the alignment point and already accounts for align and baseline.
      const m = this.measureText(s);
      const x0 = x - m.actualBoundingBoxLeft, y0 = y - m.actualBoundingBoxAscent;
      a.push({ t: s, x: x0, y: y0,
        w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
        h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent });
    } catch (e) { /* never break a render */ }
    return fill.apply(this, arguments);
  };
})();`;
await S('Page.addScriptToEvaluateOnNewDocument', { source: PROBE });

const E = async e => {
  const r = await S('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'threw');
  return r.result?.result?.value;
};
await S('Page.navigate', { url: URL });
await wait(14000);

const report = []; const census = [];
for (const v of ['deck', 'radar', 'sky', 'air', 'data']) {
  await E(`window.ATMOS.setView('${v}')`);
  await wait(2600);
  const per = await E(`(()=>{const out=[];
    for (const [k, a] of window.__labels) {
      const el = document.getElementById(k);
      if (!el || !el.isConnected) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !el.closest('.view.active') && !el.closest('#scrub')) continue;
      out.push({ id: k, w: r.width, h: r.height, labels: a });
    }
    return out;})()`);
  for (const c of per) {
    const L = c.labels.filter(l => l.t.trim());
    let hits = [], off = [];
    for (let i = 0; i < L.length; i++) {
      const a = L[i];
      if (a.x < -1 || a.x + a.w > c.w + 1) off.push(a.t + ` [${a.x.toFixed(0)}..${(a.x + a.w).toFixed(0)} of ${c.w.toFixed(0)}]`);
      for (let j = i + 1; j < L.length; j++) {
        const b = L[j];
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ox > 1 && oy > 1) hits.push(`"${a.t}" x "${b.t}" (${ox.toFixed(0)}x${oy.toFixed(0)})`);
      }
    }
    census.push(`${v}/${c.id} ${L.length}`);
    if (hits.length || off.length) {
      report.push({ view: v, id: c.id, n: L.length, hits, off });
    }
  }
}

console.log(`\n  ${URL}  at ${W}x${H}\n`);
let tot = 0, tof = 0;
for (const r of report) {
  tot += r.hits.length; tof += r.off.length;
  console.log(`  ${r.view}/${r.id}  ${r.n} labels`);
  for (const h of r.hits.slice(0, 6)) console.log('      overlap  ' + h);
  if (r.hits.length > 6) console.log(`      ... ${r.hits.length - 6} more`);
  for (const o of r.off.slice(0, 4)) console.log('      off-canvas ' + o);
  if (r.off.length > 4) console.log(`      ... ${r.off.length - 4} more`);
}
console.log(`\n  TOTAL  ${tot} overlapping label pairs, ${tof} labels off the canvas\n`);
if (process.env.CENSUS) console.log('  CENSUS ' + census.sort().join('  '));
chrome.kill();
process.exit(tot + tof ? 1 : 0);
