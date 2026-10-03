/*
 * The year in review. Every number comes from somewhere real:
 *   countdown/stats.json   trips, concerts, books, projects, home (journal.js decides what counts)
 *   countdown/calc.js      Mondays, alarms, meetings, over the year's retired days
 *   this browser           ONE PUTT and SLINGSHOT records (localStorage; same origin)
 *   /weather/api/yearwx    the year's weather at home (city-level, from stats.json)
 * A slide with nothing to say hides itself. ?year=2026 picks the year;
 * ?today=YYYY-MM-DD time-travels, as on the clock.
 */
import { drawPlaces } from '/countdown/places.js';

const J = window.Journal, C = window.RetirementCalc, D = window.Daily;
const params = new URLSearchParams(location.search);
const TODAY = J.todayFrom(location.search);
const RETIRED = new Date(C.DEFAULT_RETIREMENT_ISO);
const FIRST = RETIRED.getFullYear();
const LAST = TODAY.getFullYear();
const YEAR = Math.min(LAST, Math.max(FIRST, parseInt(params.get('year'), 10) || LAST));

const $ = (id) => document.getElementById(id);
const h = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const num = (n) => Math.round(n).toLocaleString('en-US');
const plural = (n, one, many) => `${num(n)} ${n === 1 ? one : many}`;
const fmt = (d, o) => d.toLocaleDateString('en-US', o || { month: 'long', day: 'numeric' });
const isoDay = (s) => new Date(`${s}T12:00:00`);
const ORDINAL = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setCount(id, value) { const n = $(id); if (n) { n.dataset.to = String(Math.round(value)); n.textContent = num(value); } }
function hide(id) { const n = $(id); if (n) n.hidden = true; }

/* ---------------------------------------------------------------- slides */

function years() {
    const nav = $('years');
    if (!nav || LAST === FIRST) return;
    for (let y = FIRST; y <= LAST; y++) {
        const a = h('a', '', String(y));
        const q = new URLSearchParams(location.search); q.set('year', String(y));
        a.href = `?${q}`;
        if (y === YEAR) a.setAttribute('aria-current', 'page');
        nav.append(a);
    }
}

function cover(ys) {
    document.title = `${YEAR}${ys.partial ? ' so far' : ''} · Year in Review`;
    $('cover-title').textContent = String(YEAR);
    const n = YEAR - FIRST;
    $('cover-kicker').textContent = `Year ${ORDINAL[n] || n + 1} of retirement`;
    setCount('cover-days', ys.retiredDays);
    $('cover-through').textContent = ys.partial ? ` · so far, through ${fmt(TODAY)}` : '';
}

function freedom(ys) {
    setCount('f-mondays', ys.mondays);
    setCount('f-alarms', ys.alarms);
    setCount('f-meetings', ys.meetings);
    setCount('f-hours', ys.hours);
}

async function miles(stats, ys) {
    if (!ys.trips.length || !stats.home) return hide('s-miles');
    setCount('m-miles', ys.miles);
    $('m-trips').textContent = `there and back from ${stats.home.place.split(',')[0]}, on ${plural(ys.trips.length, 'trip', 'trips')}`;
    if (ys.longest && ys.longest.miles) {
        $('m-longest').textContent = `Farthest: ${ys.longest.place} — ${num(Math.round(ys.longest.miles / 10) * 10)} miles there and back.`;
    }
    try {
        const land = await (await fetch('/countdown/land.json')).json();
        const places = J.places({ trips: ys.trips }, TODAY);
        drawPlaces($('m-map'), {
            home: stats.home, places, land, drawIn: !reduceMotion,
            describe: (p) => `${p.place} · ${p.visits.map((v) => v.when).join(', and ')}`,
            onSelect: (_, s) => { $('m-longest').textContent = s; },
        });
    } catch (e) { hide('m-map'); }
}

function concerts(ys) {
    if (!ys.concerts.length) return hide('s-concerts');
    setCount('c-count', ys.concerts.length);
    $('c-word').textContent = ys.concerts.length === 1 ? 'concert' : 'concerts';
    const ul = $('c-list');
    const seen = new Map();
    for (const c of ys.concerts) seen.set(c.who, (seen.get(c.who) || 0) + 1);
    for (const [who, n] of seen) ul.append(h('li', '', n > 1 ? `${who} ×${n}` : who));
    if (ys.mostSeen) $('c-most').textContent = `Most seen: ${ys.mostSeen.who}, ${ys.mostSeen.times} times.`;
}

function books(stats, ys) {
    const reading = YEAR === LAST ? (stats.books || []).filter((b) => b && b.reading === true && typeof b.title === 'string') : [];
    if (!ys.books.length && !reading.length) return hide('s-books');
    setCount('b-count', ys.books.length);
    $('b-word').textContent = ys.books.length === 1 ? 'book read' : 'books read';
    const ul = $('b-shelf');
    const add = (b, isReading) => {
        const s = J.spineFor(b.title);
        const li = h('li', 'spine-slot');
        const sp = h('span', `spine spine--band${s.band}` + (isReading ? ' spine--reading' : ''));
        sp.style.setProperty('--c', s.color); sp.style.setProperty('--h', String(s.height));
        sp.style.setProperty('--w', `${s.width}px`); sp.style.setProperty('--lean', `${isReading ? 7 : s.lean}deg`);
        sp.setAttribute('role', 'img');
        sp.setAttribute('aria-label', `${b.title}${b.note ? `, by ${b.note.split('·')[0].trim()}` : ''}${isReading ? ', reading now' : ''}`);
        sp.append(h('span', 'spine-title', b.title));
        if (isReading) sp.append(h('span', 'spine-ribbon'));
        li.append(sp); ul.append(li);
    };
    ys.books.forEach((b) => add(b, false));
    reading.forEach((b) => add(b, true));
    if (reading.length) $('b-reading').textContent = `Reading now: ${reading.map((b) => b.title).join(', ')}.`;
}

function built(ys) {
    if (!ys.projects.length) return hide('s-built');
    setCount('p-count', ys.projects.length);
    $('p-word').textContent = ys.projects.length === 1 ? 'thing' : 'things';
    const ul = $('p-list');
    for (const p of ys.projects) {
        const li = h('li');
        const url = typeof p.url === 'string' && /^(\/(?!\/)\S*|https:\/\/\S+)$/.test(p.url) ? p.url : '';
        const t = url ? h('a', '', p.what) : h('span', '', p.what);
        if (url) { t.href = url; if (url.startsWith('https://')) { t.target = '_blank'; t.rel = 'noopener'; } }
        li.append(t, h('small', '', p.when));
        ul.append(li);
    }
}

/** This browser's records for one game, for the year; null when it has none. */
function gameRecord(api, key, scoreField, oneWord) {
    let state = null;
    try { state = api.parseState(localStorage.getItem(api.STORAGE_KEY)); } catch (e) { return null; }
    if (!state || !state.played) return null;
    const days = Object.entries(state.days || {})
        .map(([d, r]) => ({ date: D.puzzleDateKey(+d), r }))
        .filter((x) => x.date && x.date.startsWith(`${YEAR}-`));
    // Before October 2026 the games kept only 30 days, so for their first
    // year the lifetime counters are the truer count of what was played.
    const counters = YEAR === FIRST && YEAR === LAST;
    const played = Math.max(days.length, counters ? state.played : 0);
    const ones = Math.max(days.filter((x) => x.r[scoreField] === 1).length, counters ? state[key] || 0 : 0);
    const best = days.reduce((m, x) => (x.r[scoreField] && (!m || x.r[scoreField] < m.r[scoreField]) ? x : m), null);
    const windiest = days.reduce((m, x) => (typeof x.r.windMph === 'number' && (!m || x.r.windMph > m.r.windMph) ? x : m), null);
    return { played, ones, oneWord, bestStreak: state.bestStreak || 0, best, windiest };
}

function games() {
    const box = $('g-games');
    const list = [
        ['ONE PUTT', '/game/', window.OnePutt && gameRecord(window.OnePutt, 'aces', 'strokes', 'Aces')],
        ['SLINGSHOT', '/slingshot/', window.Slingshot && gameRecord(window.Slingshot, 'bullseyes', 'shots', 'Bullseyes')],
    ];
    let any = false;
    for (const [name, href, g] of list) {
        const card = h('div', 'game');
        card.append(h('h3', '', name));
        if (g) {
            any = true;
            const dl = h('dl');
            const row = (k, v) => dl.append(h('dt', '', k), h('dd', '', v));
            row('Rounds played', num(g.played));
            row(g.oneWord, num(g.ones));
            row('Best streak', plural(g.bestStreak, 'day', 'days'));
            if (g.windiest && g.windiest.r.windMph >= 1) row('Windiest round', `${Math.round(g.windiest.r.windMph)} mph, ${fmt(isoDay(g.windiest.date), { month: 'short', day: 'numeric' })}`);
            card.append(dl);
        } else {
            card.append(h('p', 'small', 'No rounds on this device yet.'));
        }
        const a = h('a', '', `Play today's ${name} →`); a.href = href;
        card.append(a);
        box.append(card);
    }
    $('g-note').textContent = any
        ? 'From this browser: the games keep their records where you play them.'
        : 'The games keep their records in the browser you play them in, and this one has none yet.';
}

async function weather(stats) {
    const home = stats.home;
    if (!home) return hide('s-weather');
    try {
        const res = await fetch(`/weather/api/yearwx?lat=${home.lat}&lon=${home.lon}&year=${YEAR}`);
        if (!res.ok) throw new Error(String(res.status));
        const w = await res.json();
        if (!w.days) throw new Error('no days');
        const dl = $('w-stats');
        const stat = (label, value, sub) => {
            const div = h('div'); const dd = h('dd', '', value);
            if (sub) dd.append(h('small', '', sub));
            div.append(h('dt', '', label), dd); dl.append(div);
        };
        if (w.hottest) stat('Hottest day', `${w.hottest.f}°`, fmt(isoDay(w.hottest.date)));
        if (w.coldest) stat('Coldest night', `${w.coldest.f}°`, fmt(isoDay(w.coldest.date)));
        if (w.wettest) stat('Wettest day', `${w.wettest.inches}″`, fmt(isoDay(w.wettest.date)));
        stat('Days it rained', num(w.rainyDays), `${w.rain}″ in all`);
        stat('Days at 90° or more', num(w.ninetyDays));
        $('w-note').textContent = `${home.place.split(',')[0]}, ${YEAR}`
            + (w.through && w.through < `${YEAR}-12-31` ? `, through ${fmt(isoDay(w.through))} (the weather archive runs a few days behind).` : '.');
    } catch (e) { hide('s-weather'); }
}

function milestones(ys) {
    const ol = $('ms-list');
    for (const m of ys.milestones) ol.append(h('li', '', `${m.icon} ${m.text} — ${fmt(m.date)}`));
    if (ys.nextMilestone) {
        const until = J.daysBetween(TODAY, ys.nextMilestone.date);
        $('ms-next').textContent = `Next: ${ys.nextMilestone.icon} ${ys.nextMilestone.text}, ${fmt(ys.nextMilestone.date, { month: 'long', day: 'numeric', year: 'numeric' })}`
            + (YEAR === LAST ? ` — in ${plural(until, 'day', 'days')}.` : '.');
    }
    if (!ys.milestones.length && !ys.nextMilestone) hide('s-milestones');
}

function booked(ys) {
    const ol = $('n-list');
    const items = YEAR === LAST ? ys.booked : [];
    const seen = new Set();
    for (const u of items) {
        const k = `${u.title}|${+u.start}`;
        if (seen.has(k)) continue;
        seen.add(k);
        const li = h('li');
        li.append(h('b', '', `${u.kind === 'trip' ? '✈️' : '🎶'} ${u.title}`),
            h('span', '', `${u.when} · ${u.state === 'tomorrow' ? 'tomorrow' : u.state === 'today' ? 'today' : `in ${plural(u.daysUntil, 'day', 'days')}`}`));
        ol.append(li);
    }
    $('next-title').textContent = items.length ? 'Already booked' : (ys.partial ? 'Still to come' : `On to ${YEAR + 1}`);
    $('n-end').textContent = ys.partial ? 'The rest of the year is still being written.' : `See you in ${YEAR + 1}.`;
}

/* ------------------------------------------------------- numbers that count */

function countUp(root) {
    for (const n of root.querySelectorAll('.count')) {
        const to = +n.dataset.to || 0;
        if (reduceMotion || to < 2) { n.textContent = num(to); continue; }
        const t0 = performance.now(), dur = 900;
        const step = (t) => {
            const k = Math.min(1, (t - t0) / dur);
            n.textContent = num(to * (1 - Math.pow(1 - k, 3)));
            if (k < 1) requestAnimationFrame(step);
        };
        n.textContent = '0';
        requestAnimationFrame(step);
    }
}

function watchSlides() {
    if (!('IntersectionObserver' in window) || reduceMotion) return;
    const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
    }, { threshold: 0.4 });
    document.querySelectorAll('.slide').forEach((s) => io.observe(s));
}

/* ---------------------------------------------------------------- start */

async function start() {
    years();
    let stats;
    try {
        const res = await fetch('/countdown/stats.json', { cache: 'no-cache' });
        stats = await res.json();
    } catch (e) {
        $('cover-kicker').textContent = 'The year could not be loaded just now.';
        return;
    }
    const ys = J.yearStats(stats, YEAR, TODAY, C, RETIRED);
    cover(ys); freedom(ys); concerts(ys); books(stats, ys); built(ys); milestones(ys); booked(ys);
    try { games(); } catch (e) { hide('s-games'); }
    await Promise.all([miles(stats, ys), weather(stats)]);
    document.body.classList.add('is-ready');
    watchSlides();
}

start();
