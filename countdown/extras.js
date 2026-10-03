/*
 * The retirement clock's three journal sections: Coming up, Places, and the
 * bookshelf. A module, loaded after script.js, which hands over stats.json as
 * window.__stats and a 'stats:loaded' event, so the file is fetched once.
 *
 * Every rule about dates lives in journal.js (pure, tested). This file only
 * draws. Destination weather is the console's own code, imported from
 * /weather/js/lib only when something is inside the 16-day forecast; if that
 * fails for any reason the card simply has no forecast strip.
 */
import { drawPlaces } from './places.js';

const J = window.Journal;
const C = window.RetirementCalc;
const TODAY = J.todayFrom(location.search);
const RETIRED = new Date(C.DEFAULT_RETIREMENT_ISO);
const FORECAST_DAYS = 16;                 // Open-Meteo's horizon, lambda forecastURL

const $ = (id) => document.getElementById(id);
const h = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const fmtDay = (d, opts) => d.toLocaleDateString('en-US', opts || { weekday: 'short', month: 'short', day: 'numeric' });
const plural = (n, one, many) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const ICON = { trip: '✈️', concert: '🎶' };

function show(id) { const n = $(id); if (n) n.hidden = false; }

/* ------------------------------------------------------------ coming up */

/** Two shows by one act on one day are one card: "2 shows". */
function groupSameDay(items) {
    const out = [];
    for (const it of items) {
        const prev = out[out.length - 1];
        if (prev && prev.kind === 'concert' && it.kind === 'concert' && prev.title === it.title
            && +prev.start === +it.start) {
            prev.shows = (prev.shows || 1) + 1;
            // "· 2 PM, Golden Gate" and "· 7:30 PM, Golden Gate" become one note
            // naming both times, or the card would only mention the first show.
            const time = /\b\d{1,2}(?::\d{2})? ?[AP]M\b/;
            const a = prev.note.match(time), b = it.note.match(time);
            if (a && b && prev.note.replace(time, '') === it.note.replace(time, '')) {
                prev.note = prev.note.replace(time, `${prev.times || a[0]} and ${b[0]}`);
                prev.times = `${prev.times || a[0]}, ${b[0]}`;
            }
            continue;
        }
        out.push({ ...it });
    }
    return out;
}

function countLabel(it) {
    if (it.state === 'now') return { n: `Day ${it.day}`, unit: `of ${it.length}` };
    if (it.state === 'today') return { n: 'Today', unit: it.kind === 'trip' ? 'you go' : "it's on" };
    if (it.state === 'tomorrow') return { n: '1', unit: 'day' };
    return { n: it.daysUntil.toLocaleString('en-US'), unit: 'days' };
}

function linkLabel(url, stats) {
    const p = (stats.projects || []).find((x) => x && x.url === url);
    return p ? `${p.what} →` : 'More →';
}

function renderComing(stats) {
    const items = groupSameDay(J.upcoming(stats, TODAY));
    const list = $('coming-list');
    if (!list || !items.length) return;
    list.textContent = '';

    for (const it of items) {
        const li = h('li', `coming-card coming-card--${it.kind} is-${it.state}`);
        const c = countLabel(it);
        const count = h('div', 'coming-count');
        count.append(h('span', 'coming-n', c.n), h('span', 'coming-unit', c.unit));
        const body = h('div', 'coming-body');
        const kind = `${ICON[it.kind]} ${it.kind === 'trip' ? 'Trip' : 'Concert'} · ${it.when}`
            + (it.shows > 1 ? ` · ${it.shows} shows` : '');
        body.append(h('p', 'coming-kind', kind), h('h3', 'coming-title', it.title));
        if (it.note) body.append(h('p', 'coming-note', it.note));
        for (const m of J.milestonesDuring(it, RETIRED, C.COUNTUP_MILESTONES)) {
            const where = it.kind === 'trip'
                ? (it.length > 1 ? `day ${m.dayOfEntry} of the trip` : 'the day you travel')
                : 'the day of the show';
            body.append(h('p', 'coming-milestone',
                `${m.icon} ${m.text} retired lands on ${where} — ${fmtDay(m.date, { weekday: 'long', month: 'long', day: 'numeric' })}.`));
        }
        if (it.url && /^(\/(?!\/)\S*|https:\/\/\S+)$/.test(it.url)) {
            const a = h('a', 'coming-link', linkLabel(it.url, stats));
            a.href = it.url;
            body.append(a);
        }
        const wx = h('div', 'coming-weather');
        wx.hidden = true;
        body.append(wx);
        li.append(count, body);
        list.append(li);

        if (it.lat != null && it.lon != null) {
            const inRange = it.daysUntil <= FORECAST_DAYS - 1;
            if (inRange) forecastInto(wx, it).catch(() => { wx.hidden = true; });
            else {
                const arrives = new Date(it.start); arrives.setDate(arrives.getDate() - (FORECAST_DAYS - 1));
                body.insertBefore(h('p', 'coming-wait', `Forecast for ${it.kind === 'trip' ? 'the trip' : 'the day'} arrives ${fmtDay(arrives, { month: 'short', day: 'numeric' })}.`), wx);
            }
        }
    }

    // The line under the big day count: the next thing, or the thing under way.
    const now = items.find((x) => x.state === 'now');
    const next = items.find((x) => x.state !== 'now');
    const line = $('next-up');
    if (line) {
        line.textContent = now
            ? `Right now: day ${now.day} of ${now.title.split(',')[0]} ${ICON[now.kind]}`
            : next.state === 'today' ? `Today: ${next.title.split(',')[0]} ${ICON[next.kind]}`
            : `Next: ${next.title.split(',')[0]} ${next.state === 'tomorrow' ? 'tomorrow' : `in ${plural(next.daysUntil, 'day', 'days')}`} ${ICON[next.kind]}`;
        show('next-up');
    }
    show('coming-section');
}

/** The trip's (or the show's) days from the destination forecast, and the best night for stars. */
async function forecastInto(box, it) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    // Absolute path: from /countdown/ a relative "api/..." is a 404 that
    // CloudFront never routes to the Lambda (the ONE PUTT lesson).
    const res = await fetch(`/weather/api/bundle?lat=${it.lat.toFixed(3)}&lon=${it.lon.toFixed(3)}`, { signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`bundle ${res.status}`);
    const bundle = await res.json();
    const f = bundle && bundle.forecast && bundle.forecast.ok && bundle.forecast.data;
    const D = f && f.daily;
    if (!D || !Array.isArray(D.time)) throw new Error('no daily forecast');

    const util = await import('/weather/js/lib/util.js');
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const from = iso(it.start), to = iso(it.end), today = iso(TODAY);
    const days = [];
    D.time.forEach((t, i) => { if (t >= from && t <= to && t >= today) days.push(i); });
    if (!days.length) throw new Error('no overlap');

    const strip = h('ol', 'wx-strip');
    for (const i of days.slice(0, 7)) {
        const d = new Date(`${D.time[i]}T12:00:00`);
        const li = h('li', 'wx-day');
        const code = D.weather_code ? D.weather_code[i] : null;
        const label = util.wx(code).long || util.wx(code).label;
        li.setAttribute('aria-label', `${fmtDay(d, { weekday: 'long' })}: ${label}, high ${Math.round(D.temperature_2m_max[i])}°, low ${Math.round(D.temperature_2m_min[i])}°`);
        li.append(h('span', 'wx-dow', fmtDay(d, { weekday: 'short' })),
            h('span', 'wx-glyph', util.wxGlyph(code, true)),
            h('span', 'wx-hi', `${Math.round(D.temperature_2m_max[i])}°`),
            h('span', 'wx-lo', `${Math.round(D.temperature_2m_min[i])}°`));
        const rain = D.precipitation_probability_max ? D.precipitation_probability_max[i] : null;
        if (rain != null && rain >= 20) li.append(h('span', 'wx-rain', `${Math.round(rain)}%`));
        strip.append(li);
    }
    box.textContent = '';
    box.append(h('p', 'wx-where', `Forecast for ${it.title.split(',')[0]}`), strip);

    // A trip gets TONIGHT's verdict too: the best night there for stars.
    if (it.kind === 'trip' && f.hourly && Array.isArray(f.hourly.time)) {
        try {
            const [T, A] = await Promise.all([import('/weather/js/lib/tonight.js'), import('/weather/js/lib/astro.js')]);
            const off = (f.utc_offset_seconds || 0) * 1000;
            const hours = f.hourly.time.map((s, i) => ({ t: Date.parse(`${s}Z`) - off, cloud: f.hourly.cloud_cover ? f.hourly.cloud_cover[i] : null }));
            const count = Math.min(FORECAST_DAYS - 1, it.daysUntil + it.length);
            const nights = T.assessNights(hours, it.lat, it.lon, Date.now(), {
                sunTimes: A.sunTimes, moonPosition: A.moonPosition, moonIllumination: A.moonIllumination, toDeg: A.toDeg,
            }, count, off);
            // A night belongs to the day whose noon precedes it, so the trip's
            // nights are its first day's through its second-to-last day's: the
            // night before you fly in, and the night after you fly home, are not
            // yours there. (A one-day trip keeps its one night.)
            const startMs = +it.start, lastNight = it.length > 1 ? +it.end : +it.end + 86400000;
            const during = nights.filter((n) => n.day >= startMs && n.day < lastNight);
            const best = during.sort((a, b) => b.goodHours - a.goodHours || b.score - a.score)[0];
            if (best) {
                box.append(h('p', 'wx-stars', best.goodHours >= 1
                    ? `🔭 Best night there for stars: ${fmtDay(new Date(best.day), { weekday: 'long' })}, ${plural(best.goodHours, 'clear moonless hour', 'clear moonless hours')}.`
                    : '🔭 No clear, moonless night there in the forecast.'));
            }
        } catch (e) { /* the strip is enough */ }
    }
    box.hidden = false;
}

/* ------------------------------------------------------------- places */

async function renderPlaces(stats) {
    const root = $('places-map');
    const home = stats.home;
    const places = J.places(stats, TODAY);
    if (!root || !home || !places.length) return;
    let land;
    try { land = await (await fetch('land.json')).json(); } catch (e) { return; }

    const miles = (p) => Math.round(J.greatCircleMiles(home, p) / 10) * 10;
    const describe = (p) => {
        const parts = [`${p.visits.length ? '📍' : '✈️'} ${p.place}`];
        if (p.visits.length) parts.push(p.visits.map((v) => v.when).join(', and '));
        if (p.next) {
            const until = J.daysBetween(TODAY, p.next.start);
            parts.push(`${p.visits.length ? 'again ' : ''}${p.next.when} (${until === 0 ? 'today' : until === 1 ? 'tomorrow' : `in ${plural(until, 'day', 'days')}`})`);
        }
        const note = (p.next && !p.visits.length ? p.next.note : (p.visits[p.visits.length - 1] || {}).note);
        if (note) parts.push(note);
        parts.push(`${miles(p).toLocaleString('en-US')} miles from home`);
        return parts.join(' · ');
    };
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Visible BEFORE drawing: pins cluster by the map's rendered width, and a
    // hidden section measures 0 -- which drew a phone's map with a desktop's
    // pins, six of them overlapping. journal-audit caught it.
    show('places-section');
    const draw = (drawIn) => drawPlaces(root, {
        home, places, land, describe, drawIn,
        onSelect: (p, sentence) => { const d = $('places-detail'); if (d) d.textContent = sentence; },
    });
    draw(!reduce);
    // Pins cluster by on-screen distance, so a new width can mean new pins.
    let lastW = root.clientWidth, t = 0;
    window.addEventListener('resize', () => {
        clearTimeout(t);
        t = setTimeout(() => { if (Math.abs(root.clientWidth - lastW) > 40) { lastW = root.clientWidth; draw(false); } }, 200);
    });

    const done = J.countable(stats, 'trips', 'place', TODAY);
    const total = J.milesTraveled(home, done);
    const ahead = places.filter((p) => p.next).length;
    const cap = $('places-caption');
    if (cap) {
        cap.textContent = `≈ ${(Math.round(total / 100) * 100).toLocaleString('en-US')} miles there and back from ${home.place.split(',')[0]} since February`
            + ` · ${plural(done.length, 'trip', 'trips')}` + (ahead ? ` · ${ahead} still to come` : '');
    }
    const d = $('places-detail');
    if (d) d.textContent = 'Tap a pin.';
    show('places-section');
}

/* ------------------------------------------------------------ the shelf */

function renderShelf(stats) {
    const ul = $('shelf-books');
    const books = (stats.books || []).filter((b) => b && typeof b.title === 'string' && b.title.trim());
    const read = J.countable(stats, 'books', 'title', TODAY);
    const reading = books.filter((b) => b.reading === true);
    if (!ul || !(read.length + reading.length)) return;
    ul.textContent = '';
    const caption = $('shelf-caption');

    const add = (b, isReading) => {
        const s = J.spineFor(b.title);
        const li = h('li', 'spine-slot');
        const btn = h('button', 'spine' + (isReading ? ' spine--reading' : '') + ` spine--band${s.band}`);
        btn.type = 'button';
        btn.style.setProperty('--c', s.color);
        btn.style.setProperty('--h', String(s.height));
        btn.style.setProperty('--w', `${s.width}px`);
        btn.style.setProperty('--lean', `${isReading ? 7 : s.lean}deg`);
        const who = (b.note || '').split('·')[0].trim();
        const said = isReading ? `${b.title}${who ? `, by ${who}` : ''}. Reading now.`
            : `${b.title}${who ? `, by ${who}` : ''}. Finished ${b.when || ''}.`.replace(/ \.$/, '.');
        btn.setAttribute('aria-label', said);
        btn.append(h('span', 'spine-title', b.title));
        if (isReading) btn.append(h('span', 'spine-ribbon'));
        btn.addEventListener('click', () => { if (caption) caption.textContent = said; });
        li.append(btn);
        ul.append(li);
    };
    read.forEach((b) => add(b, false));
    reading.forEach((b) => add(b, true));

    const thisYear = read.filter((b) => { const s = J.span(b); return !s || s.start.getFullYear() === TODAY.getFullYear(); }).length;
    if (caption) {
        caption.textContent = `${plural(thisYear, 'book', 'books')} read in ${TODAY.getFullYear()}`
            + (reading.length ? ` · Reading now: ${reading.map((b) => b.title).join(', ')}` : '');
    }
    show('shelf-section');
}

/* ---------------------------------------------------------------- start */

function render(stats) {
    if (!stats || typeof stats !== 'object') return;
    try { renderComing(stats); } catch (e) { console.warn('Coming up:', e); }
    try { renderShelf(stats); } catch (e) { console.warn('Shelf:', e); }
    renderPlaces(stats).catch((e) => console.warn('Places:', e));
    const y = $('year-link');
    if (y) { y.firstElementChild.textContent = `Your ${TODAY.getFullYear()} so far →`; y.hidden = false; }
}

if (window.__stats) render(window.__stats);
else window.addEventListener('stats:loaded', (e) => render(e.detail), { once: true });
