/**
 * Journal - what is coming up, where Kyle has been, and what a year held.
 *
 * Pure, like calc.js: no DOM, no network, and "today" is always passed in.
 * Loaded in the browser as a classic script (window.Journal) and in Node via
 * require() for tests.js and scripts/bake-home.mjs, so the homepage count, the
 * clock, the map and the year in review all use one rule for "has happened".
 *
 * Every entry in countdown/stats.json carries an ISO `date` (YYYY-MM-DD, or
 * YYYY-MM when only the month is known) and optionally an `end`. `when` stays
 * free text for display. Upcoming is derived, never stored: an entry counts
 * once its start date has arrived, and until then it is a countdown. So the
 * record keeps itself; nothing has to be moved from one list to another.
 */
(function (root) {
    'use strict';

    const MS_PER_DAY = 86400000;
    const EARTH_MILES = 3958.8;
    const LISTS = [['trips', 'place'], ['concerts', 'who'], ['projects', 'what'], ['books', 'title']];

    const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
    const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
    // Whole calendar days, safe across DST (a local day is 23 or 25 hours twice a year).
    const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / MS_PER_DAY);

    /** 'YYYY-MM-DD' or 'YYYY-MM' -> local midnight on that day (the 1st), or null. */
    function parseDate(s) {
        const m = typeof s === 'string' && s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
        if (!m) return null;
        const y = +m[1], mo = +m[2] - 1, d = m[3] ? +m[3] : 1;
        const out = new Date(y, mo, d);
        // Reject rollovers such as 2026-02-31.
        return out.getFullYear() === y && out.getMonth() === mo && out.getDate() === d ? out : null;
    }

    /** The last day an ISO value covers: a month means its last day. */
    function lastDayOf(s) {
        const d = parseDate(s);
        if (!d) return null;
        return /^\d{4}-\d{2}$/.test(s) ? new Date(d.getFullYear(), d.getMonth() + 1, 0) : d;
    }

    /** { start, end } for an entry; null when it has no usable date. */
    function span(entry) {
        const start = parseDate(entry && entry.date);
        if (!start) return null;
        const end = lastDayOf(entry.end || entry.date);
        return { start, end: end && end >= start ? end : lastDayOf(entry.date) };
    }

    /**
     * Has it happened? An entry counts once its start date arrives. One with
     * no date (an older file, or a hand-added line) counts, as it always did.
     */
    function hasStarted(entry, today) {
        const s = span(entry);
        return !s || s.start <= startOfDay(today);
    }

    /** The entries of one list the clock and the homepage count, by their shared rules. */
    function countable(stats, list, key, today) {
        const a = stats && stats[list];
        if (!Array.isArray(a)) return [];
        return a.filter((e) => e && typeof e === 'object' && !Array.isArray(e)
            && typeof e[key] === 'string' && e[key].trim() && e.reading !== true
            && hasStarted(e, today));
    }

    /**
     * Everything still ahead or under way, soonest first: trips and concerts
     * whose last day has not passed. `state` is future, tomorrow, today or now.
     */
    function upcoming(stats, today) {
        const t = startOfDay(today);
        const out = [];
        for (const [list, key] of [['trips', 'place'], ['concerts', 'who']]) {
            for (const e of (stats && Array.isArray(stats[list]) ? stats[list] : [])) {
                const s = e && typeof e[key] === 'string' && span(e);
                if (!s || s.end < t) continue;
                const until = daysBetween(t, s.start);
                const length = daysBetween(s.start, s.end) + 1;
                const state = until > 1 ? 'future' : until === 1 ? 'tomorrow'
                    : until === 0 ? 'today' : 'now';
                out.push({
                    kind: list === 'trips' ? 'trip' : 'concert',
                    title: e[key].trim(), when: e.when || '', note: e.note || '', url: e.url || '',
                    lat: typeof e.lat === 'number' ? e.lat : null, lon: typeof e.lon === 'number' ? e.lon : null,
                    start: s.start, end: s.end, daysUntil: until, length, state,
                    day: state === 'now' || state === 'today' ? daysBetween(s.start, t) + 1 : 0,
                });
            }
        }
        // Soonest first; on the same day a trip leads a concert (it is the bigger thing).
        return out.sort((a, b) => a.start - b.start || (a.kind === 'trip' ? -1 : 1) || a.title.localeCompare(b.title));
    }

    /**
     * Retirement milestones that land inside an entry's dates: "One year
     * retired lands on day 12". milestones is calc.COUNTUP_MILESTONES.
     */
    function milestonesDuring(item, retired, milestones) {
        const r = startOfDay(retired);
        const out = [];
        for (const m of milestones || []) {
            const date = addDays(r, m.threshold);
            if (date >= startOfDay(item.start) && date <= startOfDay(item.end)) {
                out.push({ threshold: m.threshold, text: m.text, icon: m.icon, date,
                    dayOfEntry: daysBetween(item.start, date) + 1 });
            }
        }
        return out;
    }

    /** Great-circle distance in statute miles. */
    function greatCircleMiles(a, b) {
        const rad = Math.PI / 180;
        const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
        const h = Math.sin(dLat / 2) ** 2
            + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
        return 2 * EARTH_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
    }

    /** A trip's stops after its main place (a cruise's ports), in order; only well-formed ones. */
    function stopsOf(trip) {
        return (trip && Array.isArray(trip.stops) ? trip.stops : []).filter((s) =>
            s && typeof s.place === 'string' && s.place.trim() && typeof s.lat === 'number' && typeof s.lon === 'number');
    }

    /** One trip's miles: home, the place, each stop in turn, and home again. */
    function routeMiles(home, trip) {
        if (!home || typeof home.lat !== 'number' || typeof trip.lat !== 'number' || typeof trip.lon !== 'number') return 0;
        const legs = [home, trip, ...stopsOf(trip), home];
        let m = 0;
        for (let i = 1; i < legs.length; i++) m += greatCircleMiles(legs[i - 1], legs[i]);
        return m;
    }

    /** Every trip's route, summed. */
    function milesTraveled(home, trips) {
        return (trips || []).reduce((sum, t) => sum + routeMiles(home, t), 0);
    }

    /** The places the map draws: visited, and still to come. Repeat visits share a pin. */
    function places(stats, today) {
        const seen = new Map();
        for (const e of (stats && Array.isArray(stats.trips) ? stats.trips : [])) {
            if (!e || typeof e.place !== 'string' || typeof e.lat !== 'number' || typeof e.lon !== 'number') continue;
            const s = span(e);
            const future = !!s && s.start > startOfDay(today);
            // The trip's place, then its stops: each stop is a pin of its own,
            // and its arc leaves from the stop before it, so a cruise draws
            // the voyage rather than a fan of lines from home.
            let from = null;
            for (const pt of [{ place: e.place, lat: e.lat, lon: e.lon }, ...stopsOf(e)]) {
                const k = pt.place.trim();
                const p = seen.get(k) || { place: k, lat: pt.lat, lon: pt.lon, visits: [], next: null, from };
                if (future) { if (!p.next || s.start < p.next.start) p.next = { start: s.start, when: e.when, note: e.note || '' }; }
                else p.visits.push({ when: e.when, note: e.note || '' });
                seen.set(k, p);
                from = { lat: pt.lat, lon: pt.lon };
            }
        }
        return [...seen.values()];
    }

    /** A book's spine: colour, height and lean from its title, so it never changes. */
    function spineFor(title) {
        let h = 0x811c9dc5;
        for (const ch of String(title)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
        // Cloth-bound colours that hold white type above 4.5:1.
        const CLOTH = ['#7a2e2e', '#2f4a6b', '#3d5a3b', '#5b3a6b', '#6b4a1f', '#1f5257', '#6b2f4f', '#3b3f6b'];
        return {
            color: CLOTH[h % CLOTH.length],
            height: 0.8 + ((h >>> 3) % 21) / 100,          // 80%-100% of the shelf
            width: 34 + ((h >>> 9) % 11),                    // 34-44 px
            lean: (((h >>> 13) % 5) - 2) * 0.6,              // -1.2deg to 1.2deg
            band: ((h >>> 17) % 3),                          // which gilt band style
        };
    }

    /** Everything the year in review says, for one calendar year, as of today. */
    function yearStats(stats, year, today, calc, retired) {
        const t = startOfDay(today);
        const inYear = (e) => { const s = span(e); return !!s && s.start.getFullYear() === year && s.start <= t; };
        const pick = (list, key) => countable(stats, list, key, t).filter(inYear);
        const trips = pick('trips', 'place'), concerts = pick('concerts', 'who');
        const projects = pick('projects', 'what'), books = pick('books', 'title');

        const home = stats && stats.home;
        const tripMiles = trips.map((tr) => ({ place: tr.place, when: tr.when, miles: routeMiles(home, tr) }));
        const acts = new Map();
        for (const c of concerts) acts.set(c.who, (acts.get(c.who) || 0) + 1);
        const mostSeen = [...acts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] || null;

        // Retired days in the year, through today: from the day after
        // retirement (calc's own window) or Jan 1, whichever is later.
        const r = startOfDay(retired);
        const from = new Date(Math.max(addDays(r, 1), new Date(year, 0, 1)));
        const until = new Date(Math.min(addDays(t, 1), new Date(year + 1, 0, 1)));   // exclusive
        const counts = calc && until > from ? calc.computeWorkweekCounts(from, until)
            : { totalDays: 0, weekends: 0, workDays: 0, mondays: 0 };
        const milestones = (calc ? calc.COUNTUP_MILESTONES : []).map((m) => ({ ...m, date: addDays(r, m.threshold) }));

        return {
            year, partial: t < new Date(year, 11, 31), through: t < new Date(year + 1, 0, 1) ? t : new Date(year, 11, 31),
            retiredDays: counts.totalDays,
            mondays: counts.mondays, workDays: counts.workDays,
            alarms: calc ? counts.workDays * calc.ALARMS_PER_WORKDAY : 0,
            meetings: calc ? counts.workDays * calc.MEETINGS_PER_WORKDAY : 0,
            hours: calc ? counts.workDays * calc.WORK_HOURS_PER_DAY : 0,
            trips, concerts, projects, books,
            miles: Math.round(tripMiles.reduce((s, x) => s + x.miles, 0)),
            longest: tripMiles.sort((a, b) => b.miles - a.miles)[0] || null,
            mostSeen: mostSeen && mostSeen[1] > 1 ? { who: mostSeen[0], times: mostSeen[1] } : null,
            milestones: milestones.filter((m) => m.date.getFullYear() === year && m.date <= t),
            nextMilestone: milestones.find((m) => m.date > t) || null,
            booked: upcoming(stats, t).filter((u) => u.state !== 'now'),
        };
    }

    /** ?today=YYYY-MM-DD, for testing and time travel; otherwise the real date. */
    function todayFrom(search, now) {
        const m = typeof search === 'string' && search.match(/[?&]today=(\d{4}-\d{2}-\d{2})/);
        return (m && parseDate(m[1])) || startOfDay(now || new Date());
    }

    const Journal = {
        LISTS, parseDate, lastDayOf, span, hasStarted, countable, upcoming, milestonesDuring,
        greatCircleMiles, routeMiles, milesTraveled, places, stopsOf, spineFor, yearStats, todayFrom, daysBetween,
    };
    if (typeof module !== 'undefined' && module.exports) module.exports = Journal;
    if (root) root.Journal = Journal;
})(typeof window !== 'undefined' ? window : null);
