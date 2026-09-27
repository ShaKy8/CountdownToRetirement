/*
 * The sky right now, on the landing page.
 *
 * tests.js proves the palette model: every minute of the day, text on sky,
 * from the numbers in home.js. This gate proves the PAGE: for every hour it
 * asks the script to paint that hour, then reads what the browser actually
 * computed -- the body's gradient with its var()s resolved, the colour of
 * every visible run of text, the hover colour -- and checks the contrast of
 * what is on screen. That is what catches the cascade going wrong: a var
 * the stylesheet stopped reading, a colour set on the wrong element, an
 * inline property beating a media query it should have yielded to.
 *
 * It also checks the three ways the page must degrade: with a contrast
 * preference (the script stands aside), with scripts off (the cream page
 * as it always was), and on a small phone (still one screen, with the
 * longer email address).
 *
 *   PORT=8137 node scripts/dev-server.mjs &
 *   node scripts/home-audit.mjs http://localhost:8137
 */
import { spawn } from 'node:child_process';
import { chromiumPath } from './lib/chromium.mjs';
import { createRequire } from 'node:module';
import http from 'node:http';

const Sky = createRequire(import.meta.url)('../home.js');
const ORIGIN = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const port = 9200 + (process.pid % 90);

const chrome = spawn(chromiumPath(), ['--headless=new', `--remote-debugging-port=${port}`,
  '--no-sandbox', '--window-size=1280,800', '--use-gl=angle', '--use-angle=swiftshader',
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
await S('Runtime.enable'); await S('Page.enable'); await S('DOM.enable'); await S('CSS.enable');
const E = async e => (await S('Runtime.evaluate',
  { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;

const fails = [];
const gate = (ok, name, detail = '') => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? '  — ' + detail : ''}`);
  if (!ok) fails.push(name);
};

/*
 * What the browser painted, read back. The gradient string comes from
 * getComputedStyle with every var() resolved to rgb()/rgba(); the two
 * gradient colours, the glow and its position are parsed out of it. Text
 * colours are read from every element that has its own text, and the hover
 * colour by forcing :hover on the first link.
 */
const READ = `(async()=>{
  const bg=getComputedStyle(document.body).backgroundImage;
  // radial-gradient(... at X% -10%, GLOW 0%, transparent 70%), linear-gradient(TOP, BOTTOM):
  // 'transparent' serialises as rgba(0, 0, 0, 0), so the glow is the first
  // colour and the gradient's two are the last two.
  const cols=[...bg.matchAll(/rgba?\\(([^)]+)\\)/g)].map(m=>m[1].split(',').map(Number));
  const at=bg.match(/at\\s+([\\d.]+)%/);
  // Text painted on the SKY: elements with their own opaque background
  // (the skip link, plum on cream inverted) are judged against that, not
  // the page -- and contrast is symmetric, so the pair is already covered.
  const texts=[...document.querySelectorAll('body *')].filter(el=>[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))
    .filter(el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.backgroundColor==='rgba(0, 0, 0, 0)';})
    .map(el=>({tag:el.tagName+(el.className?'.'+String(el.className).split(' ')[0]:''), color:getComputedStyle(el).color}));
  const a=document.querySelector('.links a');
  return {glow:cols[0], top:cols[cols.length-2], bottom:cols[cols.length-1], glowX:at?Number(at[1]):null, texts,
    underline:getComputedStyle(a).borderBottomColor,
    inline:document.documentElement.style.getPropertyValue('--bg'),
    theme:document.querySelector('meta[name="theme-color"]').getAttribute('content'),
    links:document.querySelectorAll('.links a').length, sh:document.documentElement.scrollHeight, ih:innerHeight};})()`;

const lum = rgb => Sky.luminance(rgb.slice(0, 3));
const parse = s => (s.match(/[\d.]+/g) || []).map(Number);
// Composite the glow over a gradient colour at its full alpha.
const over = (c, g) => c.map((v, i) => v + (g[i] - v) * (g[3] === undefined ? 1 : g[3]));
function boundsOf(r) {
  const corners = [r.top, r.bottom, over(r.top, r.glow), over(r.bottom, r.glow)];
  const lo = [0, 1, 2].map(i => Math.min(...corners.map(c => c[i])));
  const hi = [0, 1, 2].map(i => Math.max(...corners.map(c => c[i])));
  return { min: lum(lo), max: lum(hi) };
}
const worst = (rgb, b) => Math.min(Sky.contrast(lum(rgb), b.min), Sky.contrast(lum(rgb), b.max));

async function load(w, h, opts = {}) {
  await S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 1000 });
  await S('Emulation.setEmulatedMedia', { features: [
    { name: 'prefers-contrast', value: opts.contrast ? 'more' : 'no-preference' },
    { name: 'forced-colors', value: 'none' }] });
  await S('Emulation.setScriptExecutionDisabled', { value: !!opts.noScript });
  await S('Page.navigate', { url: ORIGIN + '/' });
  for (let i = 0; i < 40; i++) {
    if (await E("document.readyState === 'complete'")) break;
    await wait(150);
  }
  await S('Page.captureScreenshot', { format: 'jpeg', quality: 1 });
}

console.log(`\nTHE SKY RIGHT NOW — ${ORIGIN}/\n`);

for (const [w, h] of [[1280, 800], [390, 844]]) {
  await load(w, h);
  const tag = `${w}x${h}`;
  let prevX = -1, sunOk = true, worstText = 99, worstHover = 99, worstUnderline = 99, themeOk = true, glowOk = true;
  const bad = [];
  for (let hour = 0; hour < 24; hour++) {
    const p = await E(`BranyonSky.apply(${hour * 60}), 1`);
    const r = await E(READ);
    if (!r || !r.top || !r.bottom || !r.glow) { bad.push(`${hour}:00 gradient not readable`); continue; }
    const b = boundsOf(r);
    for (const t of r.texts) {
      const c = worst(parse(t.color), b);
      worstText = Math.min(worstText, c);
      if (c < 4.5) bad.push(`${hour}:00 ${t.tag} ${c.toFixed(2)}`);
    }
    const u = worst(parse(r.underline), b);
    worstUnderline = Math.min(worstUnderline, u);
    if (u < 3) bad.push(`${hour}:00 underline ${u.toFixed(2)}`);
    // Hover is text too. Force the pseudo-class on the first link and read it.
    const { result: { root } } = await S('DOM.getDocument', { depth: 1 });
    const { result: { nodeId } } = await S('DOM.querySelector', { nodeId: root.nodeId, selector: '.links a' });
    await S('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover'] });
    const hoverColor = await E("getComputedStyle(document.querySelector('.links a')).color");
    await S('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
    const hc = worst(parse(hoverColor), b);
    worstHover = Math.min(worstHover, hc);
    if (hc < 4.5) bad.push(`${hour}:00 hover ${hc.toFixed(2)}`);
    // The sun crosses left to right through the day.
    const rise = Sky.STOPS.find(s => s.glow[3] === 0 && s.at < 720).at / 60;
    const set = [...Sky.STOPS].reverse().find(s => s.glow[3] === 0 && s.at > 720).at / 60;
    if (hour >= rise && hour <= set) { if (r.glowX < prevX - 0.01) sunOk = false; prevX = r.glowX; }
    if (r.glowX === null) glowOk = false;
    const model = Sky.paletteAt(hour * 60);
    if (r.theme !== model.themeColor) themeOk = false;
  }
  gate(bad.length === 0, `${tag}: every hour reads as painted — text and hover 4.5:1, underline 3:1`,
    bad.length ? bad.slice(0, 5).join(' | ') : `worst text ${worstText.toFixed(2)}, hover ${worstHover.toFixed(2)}, underline ${worstUnderline.toFixed(2)}`);
  gate(glowOk && sunOk, `${tag}: the sun crosses left to right`, glowOk ? '' : 'glow position not readable');
  gate(themeOk, `${tag}: the browser chrome colour follows the sky`);

  /*
   * THE GATE HAS TO BE ABLE TO FAIL. Paint the text the colour of the sky
   * and the same measurement must say so; if it does not, everything above
   * measured nothing.
   */
  await E(`(()=>{const s=document.documentElement.style; s.setProperty('--text', getComputedStyle(document.body).backgroundColor==='rgba(0, 0, 0, 0)'? s.getPropertyValue('--bg') : getComputedStyle(document.body).backgroundColor); return 1;})()`);
  const broken = await E(READ);
  const bb = boundsOf(broken);
  const h1 = broken.texts.find(t => t.tag.startsWith('H1'));
  gate(h1 && worst(parse(h1.color), bb) < 1.5, `${tag}: the measurement fails when the text is painted the sky's colour`,
    h1 ? `${worst(parse(h1.color), bb).toFixed(2)}:1` : 'no h1');
  await E('BranyonSky.apply(720), 1');
}

// A contrast preference: the script stands aside and the stylesheet's
// high-contrast :root wins. Inline vars on <html> would have beaten it.
await load(1280, 800, { contrast: true });
{
  const r = await E(READ);
  const bgc = await E('getComputedStyle(document.body).backgroundColor');
  gate(r.inline === '', 'prefers-contrast: more — the script sets nothing on <html>', `--bg inline: "${r.inline}"`);
  gate(bgc === 'rgb(255, 255, 255)', 'prefers-contrast: more — the high-contrast white page', bgc);
  await E('BranyonSky.apply(0), 1');
  gate((await E(READ)).inline === '', 'prefers-contrast: more — even when asked to paint, it declines');
}

// Scripts off: the cream page, as it always was, seven links and all.
await load(1280, 800, { noScript: true });
{
  const r = await E(READ);
  const morning = Sky.paletteAt(510).sky;
  const hex = rgb => '#' + rgb.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  gate(r.inline === '' && hex(r.top) === morning.top && hex(r.bottom) === morning.bottom,
    'scripts off — the mid-morning cream from :root', `${hex(r.top)} / ${hex(r.bottom)}`);
  gate(r.links === 7, 'scripts off — all seven links', String(r.links));
}
await S('Emulation.setScriptExecutionDisabled', { value: false });

// Still one screen on a phone, with the address where "Email" was.
for (const [w, h] of [[390, 844], [375, 667], [320, 700], [360, 640]]) {
  await load(w, h);
  const r = await E(READ);
  gate(r.sh <= r.ih, `${w}x${h}: one screen, no scrolling`, `${r.sh}px in ${r.ih}px`);
}

gate(errors.length === 0, 'no console errors', errors.slice(0, 3).join(' | '));

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join(', ')}` : 'all gates pass'}\n`);
ws.close(); chrome.kill();
process.exit(fails.length ? 1 : 0);
