/*
 * The list panels on /countdown/ -- the trips, concerts and projects tiles.
 *
 * ASSERTS ON DOM STATE, NEVER ON COMPUTED OPACITY. Headless Chromium produces
 * no frames unless something asks it to, so a CSS transition sits frozen at its
 * start value and getComputedStyle reports a number that is true of no moment
 * the user would ever see. `hidden`, `classList` and `aria-expanded` are set
 * synchronously and are always current.
 *
 * Every gate that was written for the trips tile runs for BOTH tiles. Then the
 * gates that only exist because there are two: one panel open at a time, and
 * who wins when a second tile is touched. Then a synthetic forty-entry list,
 * because the branch for "longer than the screen" must not wait for the real
 * data to grow into it before anything checks it.
 *
 *   PORT=8137 node scripts/dev-server.mjs &
 *   node scripts/lists-audit.mjs http://localhost:8137
 *   node scripts/lists-audit.mjs http://localhost:8137 320 700
 */
import { spawn } from 'node:child_process';
import { chromiumPath } from './lib/chromium.mjs';
import { readFileSync } from 'node:fs';
import http from 'node:http';

const ORIGIN = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const W = Number(process.argv[3] || 390);
const H = Number(process.argv[4] || 844);
const port = 9200 + (process.pid % 90);

const stats = JSON.parse(readFileSync(new URL('../countdown/stats.json', import.meta.url), 'utf8'));

// The tiles that open, and the key each entry is titled by. Mirrors LISTS in
// countdown/script.js.
const TILES = [
  { key: 'trips', title: 'place', noun: 'trip' },
  { key: 'concerts', title: 'who', noun: 'concert' },
  { key: 'projects', title: 'what', noun: 'project', link: 'url' },
];

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
// focus() on a page that does not believe it has focus fires no focus event,
// and focus is half of every tap here.
await S('Emulation.setFocusEmulationEnabled', { enabled: true });

const E = async e => (await S('Runtime.evaluate',
  { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;

const fails = [];
const gate = (ok, name, detail = '') => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? '  — ' + detail : ''}`);
  if (!ok) fails.push(name);
};

// The one readout of a panel's state, in one place.
const STATE = k => `(()=>{const c=document.getElementById('stat-${k}-card');
  const p=document.getElementById('stat-${k}-detail');
  const u=document.getElementById('stat-${k}-list');
  const g=document.getElementById('personal-metrics');
  if(!c||!p||!u||!g) return null;
  const pr=p.getBoundingClientRect(), gr=g.getBoundingClientRect(), cr=c.getBoundingClientRect();
  const ur=u.getBoundingClientRect();
  const bl=document.querySelector('.back-link'), br=bl?bl.getBoundingClientRect():null;
  const inset=br&&br.right>gr.left&&br.left<gr.right?Math.max(0,br.bottom):0;
  const lis=[...u.querySelectorAll('li')];
  const inView=li=>{if(!li)return false;const r=li.getBoundingClientRect();
    return r.top>=ur.top-1&&r.bottom<=ur.bottom+1&&r.top>=-1&&r.bottom<=innerHeight+1;};
  return {open:c.classList.contains('is-open'), expanded:c.getAttribute('aria-expanded'),
    hidden:p.hidden, count:document.getElementById('stat-${k}').textContent.trim(),
    sibling:c.nextElementSibling===p,
    items:lis.map(li=>li.textContent.trim()),
    links:[...u.querySelectorAll('a[href]')].map(a=>({href:a.getAttribute('href'),
      blank:a.target==='_blank', rel:a.rel, h:Math.round(a.getBoundingClientRect().height)})),
    caret:p.style.getPropertyValue('--caret-x'),
    clipped:u.scrollHeight>u.clientHeight+1,
    moreBelow:u.scrollHeight-u.clientHeight-u.scrollTop>1,
    fade:u.classList.contains('has-more-below'), tab:u.getAttribute('tabindex'),
    listTop:Math.round(u.scrollTop),
    firstInView:inView(lis[0]), lastInView:inView(lis[lis.length-1]),
    height:Math.round(pr.height),
    roomHere:Math.round(p.classList.contains('is-below')
      ? innerHeight - cr.bottom - 18 : cr.top - 18 - inset),
    inset:Math.round(inset),
    natural:Math.round(pr.height+(u.scrollHeight-u.clientHeight)),
    tileH:Math.round(cr.height),
    sideways:u.scrollWidth-u.clientWidth,
    left:Math.round(pr.left), right:Math.round(pr.right), vw:innerWidth,
    bottom:Math.round(pr.bottom), top:Math.round(pr.top), cardTop:Math.round(cr.top),
    cardBottom:Math.round(cr.bottom), below:p.classList.contains('is-below'), vh:innerHeight,
    cardLeft:Math.round(cr.left), cardRight:Math.round(cr.right),
    gLeft:Math.round(gr.left), gRight:Math.round(gr.right),
    overflow:document.documentElement.scrollWidth-innerWidth};})()`;

/*
 * How many panels are open, counted three ways, because the three are set by
 * three separate lines and "one open" has to be true of all of them. And the
 * section's z-index, which is the PURPOSE of body.list-open: if the script and
 * the stylesheet ever disagree about that class name, every DOM-state gate
 * still passes while the panel paints underneath the next glass section.
 */
const OPEN = `(()=>({panels:document.querySelectorAll('.metric-detail:not([hidden])').length,
  cards:document.querySelectorAll('.metric-card.is-open').length,
  expanded:document.querySelectorAll('.metric-card[aria-expanded="true"]').length,
  z:getComputedStyle(document.getElementById('personal-section')).zIndex}))()`;
const exactly = (o, n) => o.panels === n && o.cards === n && o.expanded === n;

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
    if (await E(`${JSON.stringify(TILES.map(t => t.key))}.every(k =>
      document.querySelectorAll('#stat-' + k + '-list li').length > 0)`)) break;
    await wait(200);
  }
}

// A real tap focuses before it clicks. A programmatic .click() alone skips
// focus -- which is also exactly what Safari does with a mouse, so that path
// gets its own helper and its own gates rather than being an accident.
const click = k => E(`(()=>{const c=document.getElementById('stat-${k}-card');
  c.focus(); c.click(); return 1;})()`);
const clickOnly = k => E(`document.getElementById('stat-${k}-card').click(), 1`);
const key = k => E(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}',bubbles:true})), 1`);
const outside = () => E(`document.getElementById('personal-heading').click(), 1`);
// pointerType is what the handlers actually read, so the gate has to send it.
const hover = (k, t, type = 'mouse') => E(`document.getElementById('stat-${k}-card')
  .dispatchEvent(new PointerEvent('pointer${t}',{bubbles:false,pointerType:'${type}'})), 1`);
const closeAll = async () => { await key('Escape'); await E('document.activeElement && document.activeElement.blur(), 1'); };

// A tap that leaves the list clipped scrolls the page to make room, smoothly,
// and the panel is re-placed as it goes -- so read the state once it settles.
//
// Headless Chromium draws no frames unless something asks for one, and a smooth
// scroll only advances on a frame: left alone it stalls part-way and reports a
// position no visitor would ever be left at. A screenshot is a request for a
// frame, so take (and discard) one per step until the page stops moving.
const settle = async () => { let last = -1, still = 0;
  for (let i = 0; i < 80 && still < 3; i++) {
    await S('Page.captureScreenshot', { format: 'jpeg', quality: 1 });
    const y = await E('Math.round(scrollY)');
    still = y === last ? still + 1 : 0; last = y; await wait(50); } };

/*
 * Pump until a frame has provably run. The page's own rAF callbacks were
 * queued before ARM's, so by the time this flag is set they have run too --
 * and a gate about "what the next frame does" that never saw a frame would
 * pass by measuring nothing.
 */
const ARM = 'window.__raf=0; requestAnimationFrame(()=>{window.__raf=1;});';
const pump = async () => {
  for (let i = 0; i < 40; i++) {
    await S('Page.captureScreenshot', { format: 'jpeg', quality: 1 });
    if (await E('window.__raf === 1')) return true;
    await wait(30);
  }
  return false;
};

console.log(`\nLIST PANELS — ${ORIGIN}/countdown/ at ${W}x${H}\n`);

/*
 * The gates for a list the screen CANNOT hold. `!holds || !clipped` on its own
 * asserts nothing at all once the list is too long, and a list of concerts is
 * too long for a 320x700 phone within a year. So say what a good outcome is
 * there: the tile as high as it may go, the list beneath it using what is
 * left, the newest entry showing, and the oldest reachable by scrolling.
 */
async function longListGates(k, s, oldest, tag) {
  gate(s.cardTop <= s.inset + 8 + 3, `${tag}: the tile went as high as it may`,
    `tile top ${s.cardTop}, ceiling ${s.inset + 8}`);
  gate(s.below, `${tag}: the list sits below the tile`);
  gate(s.height >= s.roomHere - 6, `${tag}: and uses the room it has`,
    `panel ${s.height}px into ${s.roomHere}px`);
  gate(s.firstInView, `${tag}: the newest entry is fully showing`);
  gate(s.fade && s.tab === '0', `${tag}: it says there is more below, and a keyboard can reach it`,
    `fade ${s.fade}, tabindex ${s.tab}`);
  await E(`(()=>{const u=document.getElementById('stat-${k}-list');u.scrollTop=u.scrollHeight;${ARM}return 1;})()`);
  await pump();
  const e = await E(STATE(k));
  gate(e.lastInView && e.items[e.items.length - 1].includes(oldest),
    `${tag}: scrolled to the end, the oldest entry is fully showing`, e.items[e.items.length - 1]);
  gate(!e.fade && !e.moreBelow, `${tag}: and the fade lifts, though the list is still clipped`,
    `fade ${e.fade}, clipped ${e.clipped}`);
  await E(`document.getElementById('stat-${k}-list').scrollTop = 0, 1`);
}

// ---- coarse pointer: the phone, where hover does not exist ----
await load(true);

for (const { key: k, title, noun, link } of TILES) {
  console.log(`\n  ${k.toUpperCase()}\n`);
  const list = stats[k];
  const usable = list.filter(t => t && typeof t[title] === 'string' && t[title].trim());
  let s = await E(STATE(k));
  if (!s) { gate(false, `${k}: the tile, panel and list are on the page`); continue; }

  gate(s.hidden === true && s.expanded === 'false' && !s.open, `${k}: starts closed`);
  gate(s.count === String(usable.length), `${k}: the count is the length of the list`,
    `shows ${s.count}, list has ${usable.length}`);
  // The stylesheet fades the panel in with `+`. Anywhere else in the DOM it
  // stays at opacity 0 -- which no DOM-state gate can see.
  gate(s.sibling, `${k}: the panel is the tile's next sibling`);

  await click(k); await settle(); s = await E(STATE(k));
  let o = await E(OPEN);
  gate(s.hidden === false && s.expanded === 'true' && s.open, `${k}: a tap opens it`);
  gate(exactly(o, 1) && o.z === '40', `${k}: one panel open, and its section is raised`,
    `${o.panels}/${o.cards}/${o.expanded} open, z-index ${o.z}`);
  gate(s.items.length === usable.length, `${k}: every ${noun} is listed`,
    `${s.items.length} of ${usable.length}`);
  /*
   * Scrolling is a fine answer when the stacked entries genuinely do not fit
   * either side of the tile. What is NOT fine is capping against the room on
   * the side NOT chosen, which cut the last trip in half while 250px sat
   * unused. So: if it scrolls, it must be using all the room it has.
   */
  gate(!s.clipped || s.height >= s.roomHere - 6,
    s.clipped ? `${k}: it scrolls, but only after using the room it has` : `${k}: no ${noun} is cut off`,
    `panel ${s.height}px into ${s.roomHere}px of room`);
  /*
   * "It uses the room it has" let 320x700 pass while the list scrolled inside
   * a 257px box on a 700px screen. The room was there, split in two by a tile
   * sitting mid-screen. If the screen can hold the tile and the whole list
   * under the back link, a tap has to end with the whole list showing.
   */
  const holds = s.vh - s.inset - 8 - s.tileH - 18 >= s.natural;
  console.log(`        ${k}: list needs ${s.natural}px, tile ${s.tileH}px, screen ${s.vh}px — ${holds ? 'it fits' : 'LONGER THAN THE SCREEN'}`);
  if (holds) gate(!s.clipped, `${k}: a tap makes room for the whole list`);
  gate(s.fade === s.moreBelow && (s.tab === '0') === s.clipped,
    `${k}: the fade and the tabindex say what is true`,
    `fade ${s.fade} / more below ${s.moreBelow}, tabindex ${s.tab} / clipped ${s.clipped}`);
  // The file is oldest-first (new entries are appended); the panel is
  // newest-first, so that what scrolls out of reach is the oldest.
  gate(s.items.length > 0 && s.items[0].includes(usable[usable.length - 1][title].trim()),
    `${k}: the newest ${noun} is listed first`, `${s.items[0]}`);
  const missing = usable.filter(t => !s.items.some(i => i.includes(t[title].trim())));
  gate(missing.length === 0, `${k}: every name appears`, missing.map(t => t[title]).join(', '));
  gate(s.right <= s.vw + 1 && s.left >= -1, `${k}: the panel stays on screen`,
    `${s.left}..${s.right} in ${s.vw}`);
  gate(s.overflow <= 0, `${k}: the page does not scroll sideways while open`, `${s.overflow}px`);
  // Above the tile where there is room, below it where there is not.
  gate(s.below ? s.top >= s.cardBottom - 1 : s.bottom <= s.cardTop + 1,
    `${k}: the panel sits ${s.below ? 'below' : 'above'} the tile`,
    `panel ${s.top}..${s.bottom}, tile ${s.cardTop}..${s.cardBottom}`);
  /*
   * THE CHECK THAT WAS MISSING. Horizontal overflow and "above the tile" both
   * passed at 320px while three of five trips sat off the top of the screen:
   * nothing overflowed the document, the panel was simply outside the viewport.
   */
  gate(s.top >= -1 && s.bottom <= s.vh + 1, `${k}: the whole panel is on screen`,
    `panel ${s.top}..${s.bottom} in a ${s.vh}px viewport`);
  const caretX = s.gLeft + parseFloat(s.caret);
  gate(caretX >= s.cardLeft && caretX <= s.cardRight,
    `${k}: the caret points at its own tile`, `${Math.round(caretX)} in ${s.cardLeft}..${s.cardRight}`);
  /*
   * Both found by adding a sixth trip with a note, and both passed every gate
   * above. The fixed back link paints over a panel that reaches the top of the
   * screen, hiding the first entry; and in the stacked phone layout the note
   * wrapped into a second COLUMN, which the list then scrolled sideways to show.
   */
  gate(s.below || s.top >= s.inset - 1, `${k}: the panel clears the back link`,
    `panel top ${s.top}, link ends at ${s.inset}`);
  gate(s.sideways <= 1, `${k}: the list does not scroll sideways`, `${s.sideways}px`);
  if (link) {
    // A project with a URL is a link; one without is not. Off-site links open
    // beside the page and say so to the opener; site pages stay in this tab.
    const linked = usable.filter(t => typeof t[link] === 'string' && t[link].trim());
    gate(s.links.length === linked.length, `${k}: every entry with a URL is a link, and only those`,
      `${s.links.length} links for ${linked.length} URLs`);
    gate(s.links.every(a => a.href.startsWith('/') ? !a.blank : (a.blank && a.rel === 'noopener')),
      `${k}: off-site links open beside the page with noopener; site pages do not`);
    gate(s.links.every(a => a.h >= 23.5), `${k}: every link clears the 24px touch floor`,
      s.links.map(a => a.h).join(','));
  }
  if (!holds) await longListGates(k, s, usable[0][title].trim(), k);

  // A tap ON THE LIST is not a tap outside it. The panel is the tile's sibling,
  // so a handler that asks only "is it inside the tile?" closes the list under
  // the finger that was reading it.
  await E(`document.querySelector('#stat-${k}-list li').click(), 1`); s = await E(STATE(k));
  gate(s.hidden === false, `${k}: a tap on the list itself does not close it`);

  await click(k); s = await E(STATE(k)); o = await E(OPEN);
  gate(s.hidden === true && s.expanded === 'false', `${k}: a second tap closes it`);
  gate(exactly(o, 0) && o.z !== '40', `${k}: and the section comes back down`,
    `${o.panels}/${o.cards}/${o.expanded} open, z-index ${o.z}`);

  await click(k); await key('Escape'); s = await E(STATE(k));
  gate(s.hidden === true && s.expanded === 'false', `${k}: Escape closes it`);

  await click(k); await outside(); s = await E(STATE(k));
  gate(s.hidden === true && s.expanded === 'false', `${k}: a tap outside closes it`);

  // A lift is not a leave. pointerleave fires on every touch release, so if the
  // tap path listened to it the panel would shut the instant it opened.
  await click(k); await hover(k, 'leave', 'touch'); s = await E(STATE(k));
  gate(s.hidden === false, `${k}: a touch lift does not close a tapped panel`);

  /*
   * Closed in the same breath as a scroll. The re-place is deferred to the
   * next frame, and one that decided WHICH panel when it was scheduled reopens
   * a panel that Escape has just closed -- during exactly the smooth scroll a
   * tap starts. The frame is proven to have run, or this measures nothing.
   */
  await settle();
  await E(`(()=>{window.dispatchEvent(new Event('scroll'));
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));${ARM}return 1;})()`);
  const ran = await pump(); s = await E(STATE(k));
  gate(ran && s.hidden === true && !s.open, `${k}: a panel closed mid-scroll stays closed`,
    ran ? '' : 'no frame ran, so nothing was tested');

  /*
   * Scrolled so the tile sits high in the viewport, which is where a reader who
   * scrolled to this section actually leaves it. At scroll-top there is room
   * above and the panel never has to flip, so the original bug -- three of five
   * trips off the top of the screen at 320px -- was invisible to this gate.
   */
  await closeAll();
  await E(`document.getElementById('stat-${k}-card').scrollIntoView({block:'start'}), 1`);
  await wait(150);
  await click(k); await settle(); s = await E(STATE(k));
  // `s.bottom > s.top` is load-bearing: a closed panel measures 0..0, which
  // satisfies "inside the viewport" without proving anything at all.
  gate(s.bottom > s.top && s.top >= -1 && s.bottom <= s.vh + 1,
    `${k}: still fully on screen when scrolled to`,
    `panel ${s.top}..${s.bottom} in ${s.vh}, sitting ${s.below ? 'below' : 'above'}`);
  gate(s.items.length === usable.length
    && (!s.clipped || s.height >= s.roomHere - 6),
    `${k}: and still lists every ${noun}, using the room it has`,
    `${s.items.length} of ${usable.length}, ${s.height}px into ${s.roomHere}px`);
  await closeAll();
  await E('scrollTo(0, 0), 1'); await wait(150); await settle();
}

// ---- two tiles, one grid ----
console.log('\n  TWO TILES, ONE GRID\n');
const [A, B] = TILES.map(t => t.key);

await click(A); await settle();
await click(B); await settle();
let a = await E(STATE(A)), b = await E(STATE(B)), o = await E(OPEN);
gate(b.open && !a.open && a.hidden === true, `a tap on ${B} takes over from a pinned ${A}`);
gate(exactly(o, 1) && o.z === '40', 'exactly one panel is open, and the section is still raised',
  `${o.panels}/${o.cards}/${o.expanded} open, z-index ${o.z}`);
await click(B); o = await E(OPEN);
gate(exactly(o, 0), `and one more tap on ${B} closes it — the pin moved with the panel`,
  `${o.panels}/${o.cards}/${o.expanded} open`);
await closeAll(); await E('scrollTo(0, 0), 1'); await settle();

// Safari does not focus a button on a mouse click, so the click handler has to
// take over on its own, without focus having done it first.
await clickOnly(A); await settle();
await clickOnly(B); await settle();
a = await E(STATE(A)); b = await E(STATE(B)); o = await E(OPEN);
gate(b.open && !a.open && exactly(o, 1), `a click with no focus takes over too`,
  `${o.panels}/${o.cards}/${o.expanded} open`);

// The take-over, mid-scroll: the frame scheduled for A must not bring A back.
await closeAll(); await E('scrollTo(0, 0), 1'); await settle();
await click(A); await settle();
await E(`(()=>{window.dispatchEvent(new Event('scroll'));
  const c=document.getElementById('stat-${B}-card'); c.focus(); c.click();${ARM}return 1;})()`);
const tookOver = await pump(); await settle();
a = await E(STATE(A)); b = await E(STATE(B)); o = await E(OPEN);
gate(tookOver && b.open && !a.open && exactly(o, 1), 'a take-over mid-scroll still ends with one panel',
  `${o.panels}/${o.cards}/${o.expanded} open`);
await closeAll(); await E('scrollTo(0, 0), 1'); await settle();

// ---- a list longer than any screen ----
console.log('\n  FORTY ENTRIES\n');
const LONG = B;
await E(`renderList('${LONG}', Array.from({length:40},(_,i)=>({title:'Synthetic Act '+(i+1),
  when:'Jan '+(i%28+1)+', 2027', note:'🎸 Somewhere with a stage'}))), 1`);
await click(LONG); await settle();
let s = await E(STATE(LONG));
gate(s.items.length === 40 && s.clipped, 'forty entries render, and do not fit',
  `${s.items.length} entries, list needs ${s.natural}px of ${s.vh}px`);
await longListGates(LONG, s, 'Synthetic Act 1', 'long list');
gate(s.top >= -1 && s.bottom <= s.vh + 1 && s.sideways <= 1 && s.overflow <= 0,
  'long list: the panel is still wholly on screen', `panel ${s.top}..${s.bottom} in ${s.vh}`);

/*
 * The reader's place in the list. Every window scroll re-places the panel, and
 * re-placing lifts the height cap to measure -- which resets scrollTop. On a
 * phone the URL bar collapsing is a window scroll, so a reader half way down
 * was thrown back to the top for touching the page.
 */
await E(`document.getElementById('stat-${LONG}-list').scrollTop = 180, 1`);
const before = (await E(STATE(LONG))).listTop;
await E(`(()=>{window.dispatchEvent(new Event('scroll'));${ARM}return 1;})()`);
const replaced = await pump(); s = await E(STATE(LONG));
gate(replaced && before > 0 && Math.abs(s.listTop - before) <= 1,
  'long list: re-placing the panel keeps the reader\'s place', `scrollTop ${before} → ${s.listTop}`);
await closeAll();

// Opened by focus alone, so NOT pinned -- the state in which blur closes it.
await E(`document.getElementById('stat-${LONG}-card').focus(), 1`);
await E(`document.getElementById('stat-${LONG}-list').focus(), 1`);
s = await E(STATE(LONG));
gate(s.open && await E(`document.activeElement === document.getElementById('stat-${LONG}-list')`),
  'long list: Tab from the tile into the list does not close it');
await E('document.activeElement.blur(), 1'); s = await E(STATE(LONG));
gate(!s.open && s.hidden === true, 'long list: and leaving the list does');
await closeAll(); await E('scrollTo(0, 0), 1'); await wait(150);

// ---- fine pointer: the desktop, where hover is the whole interaction ----
console.log('\n  MOUSE\n');
await load(false);
for (const { key: k } of TILES) {
  await hover(k, 'enter'); s = await E(STATE(k));
  gate(s.hidden === false && s.expanded === 'true', `${k}: hover opens it on a mouse`);
  await hover(k, 'leave'); s = await E(STATE(k));
  gate(s.hidden === true && s.expanded === 'false', `${k}: moving away closes it`);

  await click(k); await hover(k, 'leave'); s = await E(STATE(k));
  gate(s.hidden === false, `${k}: a click pins it open past the mouse leaving`);
  await closeAll();
}

// Explicit gestures take over; a mouse on its way somewhere else does not.
await click(A); await settle();
await hover(B, 'enter'); a = await E(STATE(A)); b = await E(STATE(B));
gate(a.open && !b.open, `a mouse crossing ${B} does not take a pinned ${A}'s place`);
await hover(B, 'leave'); a = await E(STATE(A)); o = await E(OPEN);
gate(a.open && exactly(o, 1) && o.z === '40', 'and its leaving does not pull the section down from under it',
  `${o.panels}/${o.cards}/${o.expanded} open, z-index ${o.z}`);
await closeAll();
// Open by focus, so unpinned: a narrower guard ("while A is PINNED") let the
// mouse open a second panel on top of this one.
await E(`document.getElementById('stat-${A}-card').focus(), 1`);
await hover(B, 'enter'); o = await E(OPEN); a = await E(STATE(A));
gate(a.open && exactly(o, 1), `nor does it take a focused ${A}'s`,
  `${o.panels}/${o.cards}/${o.expanded} open`);
await closeAll();

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join(', ')}` : 'all gates pass'}\n`);
ws.close(); chrome.kill();
process.exit(fails.length ? 1 : 0);
