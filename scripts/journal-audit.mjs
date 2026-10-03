/*
 * The journal gate: Coming up, Places and the bookshelf on the retirement
 * clock, and the year in review, checked in a real browser against what the
 * data says they should draw.
 *
 * Each page is loaded at 1280x800, 390x844 and 320x700, on four "todays"
 * (?today=, which moves only the journal's clock, never the retirement day
 * count): 2026-10-03 (everything ahead), 2026-10-08 (Grants Pass under way),
 * 2027-02-20 (Panama under way, the first anniversary inside it) and
 * 2026-12-31 (the year complete). Expected values come from journal.js run
 * here in Node on the same stats.json -- the page must agree with the rules.
 *
 * Fails on: sideways scroll; a card count, state, "next" line or anniversary
 * callout that disagrees with the rules; a pin per place-group that is not
 * there, or two pins whose 28px targets overlap; a dashed arc that is not a
 * trip still to come; a spine per book that is missing; any animation left
 * running under reduced motion; a year slide whose numbers are not the
 * rules'; a year page that breaks when localStorage throws; console errors.
 *
 *   PORT=8137 node scripts/dev-server.mjs &
 *   node scripts/journal-audit.mjs http://localhost:8137
 */
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromiumPath } from './lib/chromium.mjs';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const J = require('../countdown/journal.js');
const C = require('../countdown/calc.js');
const stats = JSON.parse(fs.readFileSync(path.join(ROOT, 'countdown', 'stats.json'), 'utf8'));
const ORIGIN = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const SIZES = [[1280, 800], [390, 844], [320, 700]];
const DATES = ['2026-10-03', '2026-10-08', '2027-02-20', '2026-12-31'];

const port = 9600 + (process.pid % 90);
const chrome = spawn(chromiumPath(), ['--headless=new', `--remote-debugging-port=${port}`, '--no-sandbox',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
const get = (p) => new Promise((r, j) => http.get({ host: '127.0.0.1', port, path: p }, (x) => { let d = ''; x.on('data', (c) => d += c); x.on('end', () => r(JSON.parse(d))); }).on('error', j));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rows = [];
const check = (name, ok, got, want) => rows.push({ name, ok: !!ok, got: String(got), want: String(want) });

try {
    for (let i = 0; i < 60; i++) { try { await get('/json/version'); break; } catch { await wait(250); } }
    const ws = new WebSocket((await get('/json/version')).webSocketDebuggerUrl);
    let id = 0; const pending = new Map(); const errors = [];
    ws.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
        if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.split('\n')[0]);
        if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value || a.description).join(' '));
    };
    await new Promise((r) => ws.onopen = r);
    const send = (method, params = {}, sessionId) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
    const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
    const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
    const S = (m, p) => send(m, p, sessionId);
    await S('Runtime.enable'); await S('Page.enable');
    const E = async (expr) => (await S('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
    const load = async (url, W, H, { reduce = false, before = '' } = {}) => {
        await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 600 });
        await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }] });
        const script = before ? (await S('Page.addScriptToEvaluateOnNewDocument', { source: before })).result?.identifier : null;
        await S('Page.navigate', { url }); await wait(3200);
        for (let i = 0; i < 4; i++) { await S('Page.captureScreenshot', { format: 'jpeg', quality: 1 }); await wait(100); }
        if (script) await S('Page.removeScriptToEvaluateOnNewDocument', { identifier: script });
    };

    const retired = new Date(C.DEFAULT_RETIREMENT_ISO);
    for (const date of DATES) {
        const today = new Date(`${date}T12:00:00`);
        // What the rules say, for this "today".
        const items = J.upcoming(stats, today);
        const groups = items.filter((x, i) => !(i && x.kind === 'concert' && items[i - 1].title === x.title && +items[i - 1].start === +x.start));
        const now = groups.find((x) => x.state === 'now');
        const anniversaries = groups.flatMap((x) => J.milestonesDuring(x, retired, C.COUNTUP_MILESTONES)).length;
        const places = J.places(stats, today);
        const futureArcs = places.filter((p) => !p.visits.length && p.next).length;
        const books = J.countable(stats, 'books', 'title', today).length + stats.books.filter((b) => b.reading).length;

        for (const [W, H] of SIZES) {
            const at = `${date} ${W}x${H}`;
            await load(`${ORIGIN}/countdown/?today=${date}`, W, H);
            const r = await E(`(() => {
                const pins = [...document.querySelectorAll('.places-pin')].map((p) => p.getBoundingClientRect());
                let overlap = 0;
                for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) {
                    const a = pins[i], b = pins[j];
                    if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) overlap++;
                }
                return { overflow: document.documentElement.scrollWidth - innerWidth,
                    cards: document.querySelectorAll('.coming-card').length,
                    states: [...document.querySelectorAll('.coming-card')].map((c) => (c.className.match(/is-(\\w+)/) || [])[1]),
                    next: document.getElementById('next-up').textContent,
                    milestones: document.querySelectorAll('.coming-milestone').length,
                    pins: pins.length, small: pins.filter((p) => p.width < 24 || p.height < 24).length, overlap,
                    future: document.querySelectorAll('.places-arc--future').length,
                    spines: document.querySelectorAll('.spine').length,
                    tiles: [...document.querySelectorAll('.personal-metrics .metric-value')].map((x) => x.textContent).join(',') };
            })()`);
            check(`${at} clock: no sideways scroll`, r.overflow <= 0, r.overflow, '<= 0');
            check(`${at} Coming up: one card per entry (same-day shows grouped)`, r.cards === groups.length, r.cards, groups.length);
            check(`${at} Coming up: states`, r.states.join() === groups.map((x) => x.state).join(), r.states.join(), groups.map((x) => x.state).join());
            const wantNext = now ? `Right now: day ${now.day} of ${now.title.split(',')[0]}` : `Next: ${groups[0].title.split(',')[0]}`;
            check(`${at} the line under the hero`, r.next.startsWith(wantNext), r.next, `${wantNext}…`);
            check(`${at} anniversary callouts`, r.milestones === anniversaries, r.milestones, anniversaries);
            check(`${at} map: pins are 24px or more, none overlapping`, r.pins > 0 && !r.small && !r.overlap, `${r.pins} pins, ${r.small} small, ${r.overlap} overlaps`, 'none small or overlapping');
            check(`${at} map: a dashed arc per trip still to come`, r.future === futureArcs, r.future, futureArcs);
            check(`${at} shelf: a spine per book`, r.spines === books, r.spines, books);
            const tiles = J.LISTS.map(([l, k]) => J.countable(stats, l, k, today).length).join(',');
            check(`${at} the tiles count only what has happened`, r.tiles === tiles, r.tiles, tiles);

            const year = date.slice(0, 4);
            await load(`${ORIGIN}/year/?today=${date}&year=${year}`, W, H);
            const ys = J.yearStats(stats, +year, today, C, retired);
            const y = await E(`(() => {
                const v = (id) => +(document.getElementById(id)?.dataset.to || -1);
                const shown = (id) => !document.getElementById(id).hidden;
                return { overflow: document.documentElement.scrollWidth - innerWidth,
                    days: v('cover-days'), mondays: v('f-mondays'), miles: shown('s-miles') ? v('m-miles') : 0,
                    concerts: shown('s-concerts') ? v('c-count') : 0, books: shown('s-books') ? v('b-count') : 0,
                    built: shown('s-built') ? v('p-count') : 0, title: document.getElementById('cover-title').textContent };
            })()`);
            check(`${at} year: no sideways scroll`, y.overflow <= 0, y.overflow, '<= 0');
            const want = { days: ys.retiredDays, mondays: ys.mondays, miles: ys.miles, concerts: ys.concerts.length, books: ys.books.length, built: ys.projects.length, title: year };
            for (const k of Object.keys(want)) check(`${at} year: ${k}`, String(y[k]) === String(want[k]), y[k], want[k]);
        }
    }

    // Reduced motion: nothing on either page keeps moving.
    await load(`${ORIGIN}/countdown/?today=2026-10-03`, 1280, 800, { reduce: true });
    const anim = await E(`document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.target?.closest?.('.journal-extra')).length`);
    check('reduced motion: the journal sections are still', anim === 0, anim, 0);

    // The year page with game records, and with storage that throws.
    const seed = `(() => { try {
        const day = (s) => Math.round((Date.UTC(+s.slice(0,4), +s.slice(5,7)-1, +s.slice(8,10)) - Date.UTC(2026,0,1)) / 864e5);
        const days = {}; for (const [d, st, w] of [['2026-09-10',1,4],['2026-09-11',3,22],['2026-09-12',2,9]]) days[day(d)] = { strokes: st, par: 3, windMph: w, windDeg: 0, source: 'live', cells: 0 };
        localStorage.setItem('oneputt.v1', JSON.stringify({ v: 1, lastDay: day('2026-09-12'), days, streak: 3, bestStreak: 3, played: 3, aces: 1, settings: { sound: false, geo: false } }));
    } catch (e) {} })()`;
    await load(`${ORIGIN}/year/?today=2026-10-03&year=2026`, 1280, 800, { before: seed });
    const g = await E(`document.getElementById('g-games').innerText`);
    check('year: this browser\'s ONE PUTT rounds are read', /Rounds played\s*3/.test(g) && /Aces\s*1/.test(g) && /22 mph/.test(g), g.replace(/\s+/g, ' ').slice(0, 90), 'Rounds played 3, Aces 1, windiest 22 mph');
    await E(`localStorage.clear(), 1`);
    await load(`${ORIGIN}/year/?today=2026-10-03&year=2026`, 390, 844, { before: `Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });` });
    const blocked = await E(`({ title: document.getElementById('cover-title').textContent, games: document.getElementById('g-games').innerText })`);
    check('year: a browser that blocks storage still gets the year', blocked.title === '2026' && /No rounds/.test(blocked.games), blocked.title, '2026, games say no rounds');

    check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | ') || 0, 0);
    ws.close();
} finally {
    chrome.kill();
}

const bad = rows.filter((r) => !r.ok);
for (const r of rows) if (!r.ok || process.env.VERBOSE) console.log(`  ${r.ok ? 'PASS' : 'FAIL'} ${r.name.padEnd(64)} ${r.got}${r.ok ? '' : `   want ${r.want}`}`);
console.log(`\n  ${rows.length - bad.length}/${rows.length} passed${bad.length ? `, ${bad.length} FAILED` : ''}\n`);
process.exit(bad.length ? 1 : 0);
