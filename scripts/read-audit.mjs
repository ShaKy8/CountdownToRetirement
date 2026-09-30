/*
 * Can every word on the weather console be read?
 *
 * Kyle: HUMIDITY, PRESSURE and the 16-day lows were too hard to read. A
 * census of all six views at 1920x1080 found 1,036 runs of text, 882 of them
 * under 12px and 564 under 4.5:1 - two causes, not 900 bugs: the faint grey
 * (#3a5064, ~2:1) was the colour of most labels, and the smallest sizes were
 * 7-10px. This is that census, as a gate.
 *
 * Every DOM text run and every canvas label (fillText is wrapped, so chart
 * text reports its font, colour, alpha and box) is measured against the REAL
 * pixels behind it in a screenshot - not against a token - because most
 * panels are translucent over the sky. An outlined label (strokeText under
 * fillText, charts.js haloText) is measured against its outline. Text that is
 * scrolled out of a panel or covered is skipped: elementFromPoint must land
 * on it. Headless draws no frames, so view fade-ins are finished first; an
 * early run measured whole views at opacity 0.
 *
 * Fails on: text under 11.5px; under 4.5:1 (3:1 at 24px, or 18.66px bold);
 * text hard-clipped without an ellipsis at a desktop size.
 *
 * And at the other end, since Kyle found the console "light gray text on a
 * black background, very hard on the eyes" once it passed all of the above:
 * GLARE, small text over 14:1 (light glyphs on near-black bloom; the console
 * was 16.7:1), and a NEAR-BLACK GROUND, any text whose measured ground has a
 * luminance under 0.008 (the slate panels are ~0.015; the old ground 0.0015).
 * Large display numerals are exempt from the glare ceiling.
 *
 * SHOTS=dir saves each measured screenshot as dir/<size>-<view>.png. One named
 * exception: the "//" in the ATMOS//NET logo, which is art.
 *
 *   PORT=8137 node scripts/dev-server.mjs &
 *   node scripts/read-audit.mjs http://localhost:8137/weather/            # 1920x1080, 1280x800, 390x844
 *   node scripts/read-audit.mjs http://localhost:8137/weather/ 1440 900   # one size
 */
import { spawn } from 'node:child_process';
import { chromiumPath } from './lib/chromium.mjs';
import http from 'node:http';
import fs from 'node:fs';
import zlib from 'node:zlib';

const URL = process.argv[2] || 'http://localhost:8000/weather/';
const SIZES = process.argv[3] ? [[Number(process.argv[3]), Number(process.argv[4] || 900)]] : [[1920, 1080], [1280, 800], [390, 844]];
const ALLOW = [
  { t: '//', where: 'topbar', why: 'the ATMOS//NET logo is art' },
  { t: '◈', where: 'topbar', why: 'the location pin is a glyph, not words' },
];
const allowed = (x) => ALLOW.some(a => x.t === a.t && x.where === a.where);

function decodePNG(buf) {
  let p = 8, w, h, ct, idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; }
    if (type === 'IDAT') idat.push(data);
    p += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = ct === 6 ? 4 : 3, stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0, b = y ? out[(y - 1) * stride + x] : 0, c = (x >= bpp && y) ? out[(y - 1) * stride + x - bpp] : 0;
      let v = line[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      out[y * stride + x] = v & 255;
    }
  }
  return { w, h, px: (x, y) => { x = Math.max(0, Math.min(w - 1, x | 0)); y = Math.max(0, Math.min(h - 1, y | 0)); const i = y * stride + x * bpp; return [out[i], out[i + 1], out[i + 2]]; } };
}
const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const port = 9300 + (process.pid % 90);
const chrome = spawn(chromiumPath(), ['--headless=new', `--remote-debugging-port=${port}`, '--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
const get = p => new Promise((r, j) => http.get({ host: '127.0.0.1', port, path: p }, x => { let d = ''; x.on('data', c => d += c); x.on('end', () => r(JSON.parse(d))); }).on('error', j));
const wait = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { await get('/json/version'); break; } catch { await wait(250); } }
const ws = new WebSocket((await get('/json/version')).webSocketDebuggerUrl);
let id = 0; const Pm = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && Pm.has(m.id)) { Pm.get(m.id)(m); Pm.delete(m.id); } };
await new Promise(r => ws.onopen = r);
const send = (me, pa = {}, s) => new Promise(r => { const i = ++id; Pm.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: pa, sessionId: s })); });
const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);
await S('Runtime.enable'); await S('Page.enable');
const E = async e => { const r = await S('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r.result?.result?.value; };

// Canvas labels: text, CSS-px font size, the colour and alpha it was drawn in,
// and its box in the canvas's CSS pixels. Reset per full clear.
await S('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
  const P = CanvasRenderingContext2D.prototype, fill = P.fillText, clear = P.clearRect, stroke = P.strokeText;
  let lastStroke = null;
  P.strokeText = function (text, x, y) { lastStroke = { c: this.canvas, t: String(text), x, y, style: this.strokeStyle, w: this.lineWidth }; return stroke.apply(this, arguments); };
  const store = new Map(); window.__lab = store;
  P.clearRect = function (x, y, w, h) { const c = this.canvas; if (c && x <= .5 && y <= .5 && w >= c.clientWidth - 1) store.set(c, []); return clear.apply(this, arguments); };
  P.fillText = function (text, x, y) {
    try {
      const c = this.canvas; let a = store.get(c); if (!a) store.set(c, a = []);
      const m = this.measureText(String(text)), t = this.getTransform(), k = c.width / (c.clientWidth || c.width);
      const px = (this.font.match(/([\\d.]+)px/) || [0, 0])[1] * t.a / k;
      const halo = lastStroke && lastStroke.c === c && lastStroke.t === String(text) && lastStroke.x === x && lastStroke.y === y && lastStroke.w >= 2 ? lastStroke.style : null;
      lastStroke = null;
      a.push({ halo, t: String(text), fill: typeof this.fillStyle === 'string' ? this.fillStyle : '#888888', alpha: this.globalAlpha,
        bold: /(^|\\s)(bold|[6-9]00)\\s/.test(this.font), px,
        x: (t.a * (x - m.actualBoundingBoxLeft) + t.e) / k, y: (t.d * (y - m.actualBoundingBoxAscent) + t.f) / k,
        w: t.a * (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) / k, h: t.d * (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / k });
    } catch (e) {}
    return fill.apply(this, arguments);
  };
})();` });

const all = [], clipped = [];
for (const [W, H] of SIZES) {
await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 800 });
await S('Page.navigate', { url: URL });
for (let i = 0; i < 80; i++) { if (await E("!!(window.ATMOS && window.ATMOS.store.hours.length)")) break; await wait(250); }
await wait(4000);
const views = await E("[...document.querySelectorAll('nav [data-view], [role=tab][data-view]')].map(b => b.dataset.view)") || ['deck', 'radar', 'sky', 'air', 'data'];

const toRGB = (s) => {
  if (!s) return null;
  if (s[0] === '#') { const h = s.length === 4 ? s.slice(1).split('').map(c => c + c).join('') : s.slice(1, 7); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
  const n = (s.match(/[\d.]+/g) || []).map(Number);
  if (/^color\(srgb/.test(s)) return n.slice(0, 3).map(v => Math.round(v * 255));
  return n.slice(0, 3);
};

for (const v of [...new Set(views)]) {
  await E(`window.ATMOS.setView('${v}')`);
  await wait(3500);
  // Measure a still screen: the radar loop moves the cursor, so NOW lights and
  // unlights as it passes the latest frame, and a screenshot mid-switch
  // measures a lit button's dark text on an unlit ground.
  await E("(() => { const s = window.ATMOS.store; s.playing = false; s.emit('play', false); return 1; })()");
  await wait(400);
  // Headless draws no frames, so the view's fade-in never advances: finish it.
  await E('document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }), 1');
  await S('Page.captureScreenshot', { format: 'jpeg', quality: 1 });
  await wait(300);
  const dom = await E(`(() => {
    const out = [];
    const view = document.querySelector('.view.active');
    const roots = [view, document.getElementById('topbar'), document.getElementById('scrub')].filter(Boolean);
    for (const root of roots) {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      while (w.nextNode()) {
        const n = w.currentNode, el = n.parentElement;
        if (!n.textContent.trim() || seen.has(el)) continue;
        seen.add(el);
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
        // On screen, not merely in the viewport: the topmost element at the
        // box's centre must be this element or inside it. Text scrolled out of
        // a panel, or covered, is not something anyone is reading.
        const cx = Math.min(innerWidth - 1, Math.max(0, r.x + Math.min(r.width, 40) / 2)), cy = Math.min(innerHeight - 1, Math.max(0, r.y + r.height / 2));
        const top = document.elementFromPoint(cx, cy);
        if (!top || !(top === el || el.contains(top) || top.contains(el))) continue;
        let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
        // Measure only the part a scroller shows. A row half out of a
        // scrolling panel sampled the gap beyond the panel's edge as its
        // ground; less than half visible is not being read.
        let vx0 = r.left, vy0 = r.top, vx1 = r.right, vy1 = r.bottom;
        for (let e = el.parentElement; e; e = e.parentElement) {
          const o = getComputedStyle(e);
          if (o.overflowY === 'visible' && o.overflowX === 'visible') continue;
          const q = e.getBoundingClientRect();
          vx0 = Math.max(vx0, q.left); vy0 = Math.max(vy0, q.top); vx1 = Math.min(vx1, q.right); vy1 = Math.min(vy1, q.bottom);
        }
        if (vy1 - vy0 < r.height / 2 || vx1 - vx0 < 1) continue;
        const cls = (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/)[0] : '') || el.id && '#' + el.id || el.tagName.toLowerCase();
        const panel = el.closest('.panel');
        const ph = panel ? (panel.querySelector('.hd')?.firstChild?.textContent || panel.className).trim().slice(0, 22) : root.id || 'view';
        out.push({ kind: 'dom', where: ph, sel: el.tagName.toLowerCase() + cls, t: el.textContent.trim().replace(/\\s+/g, ' ').slice(0, 30),
          color: cs.color, op, px: parseFloat(cs.fontSize), bold: +cs.fontWeight >= 600, x: vx0, y: vy0, w: vx1 - vx0, h: vy1 - vy0, clip: [vx0, vy0, vx1, vy1] });
      }
    }
    return out;
  })()`);
  const cans = await E(`(() => {
    const out = [];
    for (const [c, a] of window.__lab) {
      if (!c.isConnected) continue;
      const inView = c.closest('.view.active') || c.closest('#scrub');
      if (!inView) continue;
      const r = c.getBoundingClientRect(); if (!r.width) continue;
      const panel = c.closest('.panel');
      const ph = panel ? (panel.querySelector('.hd')?.firstChild?.textContent || panel.className).trim().slice(0, 22) : (c.closest('#scrub') ? 'scrubber' : 'canvas');
      for (const l of a) { if (!l.t.trim()) continue;
        const px = Math.min(innerWidth - 1, Math.max(0, r.x + l.x + l.w / 2)), py = Math.min(innerHeight - 1, Math.max(0, r.y + l.y + l.h / 2));
        if (document.elementFromPoint(px, py) !== c) continue;
        out.push({ kind: 'canvas', halo: l.halo, where: ph, sel: 'canvas#' + (c.id || c.className), t: l.t.slice(0, 30), color: l.fill, op: l.alpha, px: l.px, bold: l.bold,
          x: r.x + l.x, y: r.y + l.y, w: l.w, h: l.h }); }
    }
    return out;
  })()`);
  const { result: { data } } = await S('Page.captureScreenshot', { format: 'png' });
  if (process.env.SHOTS) fs.writeFileSync(`${process.env.SHOTS}/${W}x${H}-${v}.png`, Buffer.from(data, 'base64'));
  const png = decodePNG(Buffer.from(data, 'base64'));
  for (const it of [...(dom || []), ...(cans || [])]) {
    const col = toRGB(it.color); if (!col) continue;
    // Effective text colour: its alpha/opacity composited over the ground.
    const G = [];
    const [cx0, cy0, cx1, cy1] = it.clip || [-1e9, -1e9, 1e9, 1e9];
    for (let y = Math.max(cy0, it.y - 2); y < Math.min(cy1, it.y + it.h + 2); y += 1)
      for (let x = Math.max(cx0, it.x - 3); x < Math.min(cx1, it.x + it.w + 3); x += Math.max(1, it.w / 60)) G.push(png.px(x, y));
    G.sort((a, b) => lum(a) - lum(b));
    // The ground is the pixels least like the text: text is usually lighter,
    // so take the darker half's median as typical ground; else the lighter.
    const light = lum(col) > 0.18;
    const half = light ? G.slice(0, Math.ceil(G.length / 2)) : G.slice(Math.floor(G.length / 2));
    let ground = half[Math.floor(half.length / 2)];
    if (it.halo) {
      const h = (it.halo.match(/[\d.]+/g) || []).map(Number), ha = h.length > 3 ? h[3] : 1;
      if (h.length >= 3) ground = ground.map((g, i) => h[i] * ha + g * (1 - ha));
    }
    const a = Math.max(0, Math.min(1, it.op ?? 1));
    const eff = col.map((c, i) => c * a + ground[i] * (1 - a));
    const large = it.px >= 24 || (it.bold && it.px >= 18.66);
    all.push({ size: `${W}x${H}`, view: v, ...it, ground, eff: eff.map(Math.round), contrast: +cr(eff, ground).toFixed(2), large });
  }
  // Larger labels are how clipping appears: text cut off inside its own box
  // with no ellipsis to say so. Desktop only; the phone has mobile-audit.
  if (W >= 800) {
    const cut = await E(`[...document.querySelectorAll('.view.active *, #topbar *, #scrub *')].filter(el => {
      const cs = getComputedStyle(el);
      if (cs.overflowX !== 'hidden' && cs.overflowX !== 'clip') return false;
      if (cs.textOverflow === 'ellipsis' || !el.textContent.trim() || el.querySelector('canvas')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && el.scrollWidth > el.clientWidth + 1 && el.children.length === 0;
    }).map(el => (el.className || el.tagName) + ' "' + el.textContent.trim().slice(0, 24) + '"')`);
    for (const c of cut || []) clipped.push(`${W}x${H} ${v}: ${c}`);
  }
}
}
ws.close(); chrome.kill();

const GLARE = 14, BLACK = 0.008;
const why = (x) => x.px < 11.5 ? 'small' : x.contrast < (x.large ? 3 : 4.5) ? 'faint'
  : !x.large && x.contrast > GLARE ? 'glare' : lum(x.ground) < BLACK ? 'black ground' : null;
const fails = all.filter(x => !allowed(x) && why(x));
console.log(`\n  ${URL}\n`);
for (const [W, H] of SIZES) {
  const k = `${W}x${H}`, here = all.filter(x => x.size === k), bad = fails.filter(x => x.size === k);
  const worst = here.filter(x => !allowed(x)).reduce((m, x) => Math.min(m, x.contrast), 99);
  const small = here.filter(x => !allowed(x)).reduce((m, x) => Math.min(m, x.px), 99);
  const most = here.filter(x => !allowed(x) && !x.large).reduce((m, x) => Math.max(m, x.contrast), 0);
  const darkest = here.filter(x => !allowed(x)).reduce((m, x) => Math.min(m, lum(x.ground)), 1);
  console.log(`  ${bad.length ? 'FAIL' : 'PASS'} ${k.padEnd(10)} ${String(here.length).padStart(5)} runs of text  smallest ${small.toFixed(1)}px  contrast ${worst.toFixed(2)}-${most.toFixed(2)}:1  darkest ground ${darkest.toFixed(4)}`);
  const tally = {}; for (const x of bad) tally[why(x)] = (tally[why(x)] || 0) + 1;
  if (bad.length) console.log('         ' + Object.entries(tally).map(([k, n]) => `${n} ${k}`).join(', '));
  for (const x of bad.slice(0, 12)) console.log(`         ${why(x).padEnd(12)} ${x.contrast.toFixed(2)}:1 ${x.px.toFixed(1)}px  ground ${lum(x.ground).toFixed(4)}  ${x.view}/${x.where}: "${x.t}" [${x.sel}] ${x.color}`);
}
console.log(`  ${clipped.length ? 'FAIL' : 'PASS'} hard-clipped text   ${clipped.length ? clipped.slice(0, 6).join(' | ') : 'none'}`);
console.log(`\n  allowed: ${ALLOW.map(a => `"${a.t}" (${a.why})`).join('; ')}`);
const n = fails.length + clipped.length;
console.log(n ? `\n  ${n} failure(s)\n` : '\n  all readable\n');
process.exit(n ? 1 : 0);
