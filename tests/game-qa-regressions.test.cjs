'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { makeHarness } = require('./game-qa-slingshot-harness.cjs');
const Daily = require('../shared/daily.js');
const Sling = require('../slingshot/orbit.js');
const Putt = require('../game/putt.js');

function clockAtMidnight(options = {}) {
    let clock = +new Date(2026, 9, 9, 23, 59, 30);
    class ClockDate extends Date {
        constructor(...args) { super(...(args.length ? args : [clock])); }
        static now() { return clock; }
    }
    const day = Daily.puzzleDay(new ClockDate());
    const h = makeHarness({ realDate: true, Date: ClockDate, ...options });
    return { h, day, advance(days = 1) { clock = +new Date(2026, 9, 9 + days, 0, 0, 30); } };
}
function tick(h) { h.intervals.forEach(timer => timer.callback()); }
function finish(h, now = 16) { h.key(' '); h.step(now); h.runTimers(0); }
function state(h) { return JSON.parse(h.writes.at(-1).value); }

test('midnight announces a daily outside the result card without replacing the current puzzle', () => {
    const { h, day, advance } = clockAtMidnight();
    const initialSeed = h.levels[0].seed;
    advance(); tick(h);
    assert.equal(h.byId('puzzle-no').textContent, '#' + day);
    assert.equal(h.levels.length, 1);
    assert.equal(h.levels[0].seed, initialSeed);
    assert.equal(h.byId('daily-update').hidden, false);
    assert.match(h.byId('daily-message').textContent, new RegExp('#' + (day + 1) + ' is ready'));
    assert.equal(h.byId('next-label').textContent, "Today's launch");
    assert.equal(h.byId('next-in').textContent, 'ready');
    assert.match(h.byId('mode-label').textContent, /2026-10-09/);
    h.click('today');
    assert.equal(h.byId('puzzle-no').textContent, '#' + (day + 1));
    assert.equal(h.levels.at(-1).seed, Sling.seedForDay(day + 1));
    assert.equal(h.byId('daily-update').hidden, true);
    assert.equal(h.byId('next-label').textContent, 'Next launch in');
    assert.match(h.byId('next-in').textContent, /23h 59m/);
    assert.equal(h.confirmations.length, 0, 'an untouched round can be explicitly switched without a warning');
});

test('a flight crossing midnight completes on its original day, then the next daily records separately', () => {
    const { h, day, advance } = clockAtMidnight({ reducedMotion: true });
    h.click('launch'); h.key(' ');
    advance(); tick(h);
    assert.equal(h.byId('today').disabled, true);
    h.click('today');
    assert.equal(h.levels.length, 1, 'even a synthetic click cannot replace an in-flight puzzle');
    h.step(16); h.runTimers(0);
    assert.equal(state(h).days[day].shots, 1);
    assert.equal(state(h).days[day + 1], undefined);
    assert.match(h.byId('card-share').textContent, new RegExp('SLINGSHOT #' + day));
    assert.equal(h.byId('today').disabled, false);
    h.click('today'); h.click('launch'); finish(h, 32);
    assert.equal(state(h).days[day].shots, 1);
    assert.equal(state(h).days[day + 1].shots, 1);
    assert.equal(state(h).played, 2);
    assert.equal(state(h).streak, 2);
    tick(h); h.click('today');
    assert.equal(h.writes.length, 2, 'same-day repeats never add a score');
});

for (const confirm of [false, true]) test(`switching an attempted round ${confirm ? 'accepts' : 'cancels'} explicit discard confirmation`, () => {
    const { h, day, advance } = clockAtMidnight({ reducedMotion: true, outcome: 'crash', confirm });
    h.click('launch'); finish(h);
    h.key('ArrowUp');
    const speed = h.byId('g-speed').textContent;
    advance(); tick(h); h.click('today');
    assert.equal(h.confirmations.length, 1);
    assert.match(h.confirmations[0], /unfinished round will be discarded/);
    assert.equal(h.byId('puzzle-no').textContent, '#' + (day + Number(confirm)));
    assert.equal(h.byId('g-shots').textContent, confirm ? 0 : 1);
    assert.equal(h.levels.length, confirm ? 2 : 1);
    assert.equal(h.writes.length, 0);
    if (!confirm) {
        assert.equal(h.byId('g-speed').textContent, speed);
        finish(h, 32);
        assert.equal(h.byId('g-shots').textContent, 2, 'cancel resumes the original round');
    }
});

test('a delayed old result cannot open over the new preflight or new flight', () => {
    const { h, day, advance } = clockAtMidnight();
    h.click('launch'); h.key(' ');
    for (let now = 100; now <= 2000; now += 100) h.step(now);
    assert.equal(h.byId('say').textContent, 'Arrived in 1.');
    advance(); tick(h); h.click('today');
    assert.equal(h.byId('card-title').textContent, 'Launch #' + (day + 1));
    h.click('launch'); h.key(' ');
    h.runTimers(1100);
    assert.equal(h.byId('card').hidden, true);
    assert.equal(h.byId('g-shots').textContent, 1);
    assert.equal(h.writes.length, 1);
});

test('an old delayed result cannot replace a newly completed daily during its result pause', () => {
    const { h, day, advance } = clockAtMidnight({ path: [20, 50, 22, 51] });
    h.click('launch'); h.key(' ');
    h.setSaved(Sling.serializeState(Sling.recordDaily(Sling.emptyState(), day, {
        shots: 3, par: 3, bodies: 1, outcomes: 3
    })));
    h.step(100);
    advance(); tick(h); h.click('today'); h.click('launch'); h.key(' '); h.step(200);
    assert.equal(h.byId('card').hidden, true);
    h.runNextTimer(1100);
    assert.equal(h.byId('card').hidden, true, 'the old timer cannot reveal its three-shot score on the new daily');
    h.runNextTimer(1100);
    assert.match(h.byId('card-line').textContent, /^1 shot/);
    assert.match(h.byId('card-share').textContent, new RegExp('SLINGSHOT #' + (day + 1) + '.*1'));
});

test('a completed revisit stops claiming yesterday was already played today and preserves its share', () => {
    const day = Daily.puzzleDay(new Date(2026, 9, 9));
    const saved = Sling.recordDaily(Sling.emptyState(), day, { shots: 3, par: 3, bodies: 1, outcomes: 3 });
    const { h, advance } = clockAtMidnight({ saved: JSON.stringify(saved) });
    const share = h.byId('card-share').textContent;
    assert.match(h.byId('card-line').textContent, /already played today/);
    advance(); tick(h);
    assert.match(h.byId('card-line').textContent, /already played on 2026-10-09/);
    assert.equal(h.byId('card-share').textContent, share);
    assert.equal(h.byId('share').hidden, false);
    h.click('today');
    assert.equal(h.byId('launch').hidden, false);
    assert.equal(h.byId('card-share').hidden, true);
    assert.equal(h.confirmations.length, 0);
});

for (const event of ['focus', 'pageshow', 'visibilitychange']) test(`${event} catches a throttled overnight tab without waiting for its interval`, () => {
    const { h, day, advance } = clockAtMidnight();
    h.click('launch');
    advance(3);
    h.document.hidden = false;
    h.handlers[event]();
    assert.equal(h.byId('daily-update').hidden, false);
    assert.match(h.byId('daily-message').textContent, new RegExp('#' + (day + 3) + ' is ready'));
    assert.equal(h.byId('card').hidden, true, 'returning never interrupts gameplay with a result card');
    h.click('today');
    assert.equal(h.levels.at(-1).seed, Sling.seedForDay(day + 3));
});

test('a hidden visibility event waits until the tab becomes visible', () => {
    const { h, advance } = clockAtMidnight();
    advance(); h.document.hidden = true; h.handlers.visibilitychange();
    assert.equal(h.byId('daily-update').hidden, true);
    h.document.hidden = false; h.handlers.visibilitychange();
    assert.equal(h.byId('daily-update').hidden, false);
});

test('daily availability is announced only when its message changes, not on every tick or shot', () => {
    const { h, advance } = clockAtMidnight({ reducedMotion: true });
    const announcement = h.byId('daily-message');
    let value = announcement.textContent, changes = 0;
    Object.defineProperty(announcement, 'textContent', {
        get() { return value; }, set(next) { changes++; value = next; }
    });
    h.click('launch'); tick(h);
    assert.equal(changes, 0);
    advance(); tick(h);
    assert.equal(changes, 1);
    tick(h); h.handlers.focus(); h.handlers.pageshow(); h.handlers.visibilitychange(); finish(h);
    assert.equal(changes, 1, 'unchanged live-region content must not be rewritten');
    advance(2); tick(h);
    assert.equal(changes, 2, 'a different available daily is a new announcement');
    h.click('today'); tick(h);
    assert.equal(changes, 3, 'switching clears the old announcement once');
    assert.equal(announcement.textContent, '');
});

test('practice stays unscored across midnight until the explicit daily switch', () => {
    const { h, day, advance } = clockAtMidnight({ search: '?level=7', reducedMotion: true });
    h.click('launch'); advance(); tick(h); finish(h);
    assert.equal(h.writes.length, 0);
    assert.match(h.byId('card-line').textContent, /not scored/);
    assert.equal(h.byId('share').hidden, true);
    h.click('today'); h.click('launch'); finish(h, 32);
    assert.deepEqual(Object.keys(state(h).days), [String(day + 1)]);
});

test('the newly selected daily restores an existing score instead of allowing it to be overwritten', () => {
    const day = Daily.puzzleDay(new Date(2026, 9, 9));
    const saved = Sling.recordDaily(Sling.emptyState(), day + 1, { shots: 3, par: 3, bodies: 1, outcomes: 3 });
    const { h, advance } = clockAtMidnight({ saved: JSON.stringify(saved) });
    advance(); tick(h); h.click('today');
    assert.equal(h.byId('launch').hidden, true);
    assert.match(h.byId('card-line').textContent, /3 shots.*already played today/);
    assert.match(h.byId('card-share').textContent, new RegExp('SLINGSHOT #' + (day + 1)));
    assert.equal(h.writes.length, 0);
});

test('an overnight switch rereads a completed daily from another tab without overwriting it', () => {
    const { h, day, advance } = clockAtMidnight({ reducedMotion: true });
    h.click('launch'); finish(h);
    let latest = Sling.parseState(h.writes.at(-1).value);
    latest = Sling.recordDaily(latest, day + 1, { shots: 4, par: 3, bodies: 1, outcomes: 3 });
    h.setSaved(Sling.serializeState(latest));
    advance(); tick(h); h.click('today');
    assert.equal(h.byId('launch').hidden, true);
    assert.match(h.byId('card-line').textContent, /4 shots.*already played today/);
    assert.match(h.byId('card-share').textContent, new RegExp('SLINGSHOT #' + (day + 1) + '.*4'));
    assert.equal(h.writes.length, 1);
    h.click('sound');
    assert.equal(state(h).days[day + 1].shots, 4);
    assert.equal(state(h).played, 2);
});

test('finishing yesterday after another tab completed today never replaces the newer score', () => {
    const { h, day, advance } = clockAtMidnight({ reducedMotion: true });
    h.click('launch'); h.key(' ');
    const latest = Sling.recordDaily(Sling.emptyState(), day + 1, { shots: 4, par: 3, bodies: 1, outcomes: 3 });
    h.setSaved(Sling.serializeState(latest));
    advance(); h.step(16); h.runTimers(0);
    assert.equal(state(h).days[day + 1].shots, 4);
    assert.equal(state(h).days[day], undefined, 'the store intentionally refuses results older than its last recorded day');
    assert.equal(state(h).played, 1);
    assert.match(h.byId('card-line').textContent, /not recorded: a later launch is already saved/);
    h.click('today');
    assert.match(h.byId('card-line').textContent, /4 shots/);
});

test('missing persistent storage does not erase an in-memory completed day when switching', () => {
    const { h, day, advance } = clockAtMidnight({ reducedMotion: true });
    h.click('launch'); finish(h);
    h.setSaved(null);
    advance(); tick(h); h.click('today'); h.click('launch'); finish(h, 32);
    assert.equal(state(h).days[day].shots, 1);
    assert.equal(state(h).days[day + 1].shots, 1);
    assert.equal(state(h).played, 2);
});

test('denied storage preserves both in-memory daily wins and their streak across a switch', () => {
    const { h, advance } = clockAtMidnight({ reducedMotion: true, storageError: true });
    h.click('launch'); finish(h);
    advance(); tick(h); h.click('today'); h.click('launch'); finish(h, 32);
    assert.equal(h.writes.length, 0);
    assert.equal(h.byId('b-streak').textContent, '🔥 2');
    assert.match(h.byId('card-share').textContent, /Streak 2/);
    assert.doesNotMatch(h.byId('card-line').textContent, /not recorded/);
});

test('a second tab winning the same daily keeps its first recorded score and share', () => {
    const { h, day } = clockAtMidnight({ reducedMotion: true });
    h.click('launch'); h.key(' ');
    const latest = Sling.recordDaily(Sling.emptyState(), day, { shots: 4, par: 3, bodies: 1, outcomes: 3 });
    h.setSaved(Sling.serializeState(latest));
    h.step(16); h.runTimers(0);
    assert.equal(state(h).days[day].shots, 4);
    assert.match(h.byId('card-line').textContent, /4 shots.*already played today/);
    assert.match(h.byId('card-share').textContent, new RegExp('SLINGSHOT #' + day + '.*4'));
});

for (const [width, height] of [[800, 250], [320, 240], [1440, 120], [240, 250], [320, 270], [320, 269], [1, 1], [800, 900]]) {
    test(`the actual renderer and pointer/keyboard input stay finite at ${width}×${height}`, () => {
        const h = makeHarness({ width, height, realLevels: true, reducedMotion: true, outcome: 'crash' });
        h.step(0); h.click('launch');
        assert.equal(h.key('ArrowUp').defaultPrevented, true);
        const stage = h.byId('stage');
        stage.handlers.pointerdown({ pointerId: 1, clientX: width * 0.8, clientY: height * 0.65 });
        stage.handlers.pointerup(); h.step(16);
        assert.equal(h.byId('g-shots').textContent, 1);
        assert.ok(h.radii.length > 0 && h.radii.every(radius => Number.isFinite(radius) && radius > 0));
        assert.ok(h.flyCalls.every(args => args.slice(1, 4).every(Number.isFinite)));
        assert.equal(h.key('ArrowRight').defaultPrevented, true, 'a failed flight remains controllable');
    });
}

test('resizing through zero, invalid, narrow and short measurements keeps a valid transform and active game', () => {
    const h = makeHarness({ reducedMotion: true, outcome: 'crash' });
    h.click('launch');
    let now = 0;
    for (const [width, height] of [[800, 250], [0, 0], [NaN, 250], [300, Infinity], [120, 200], [800, 900]]) {
        Object.assign(h.rect, { width, height }); h.handlers.resize(); h.step(now += 16);
        assert.equal(h.key('ArrowRight').defaultPrevented, true);
    }
    finish(h, now + 16);
    assert.equal(h.byId('g-shots').textContent, 1);
    assert.ok(h.radii.every(radius => Number.isFinite(radius) && radius > 0));
});

test('the daily switch and announcement are real page controls outside the result card', () => {
    const html = fs.readFileSync(path.join(__dirname, '../slingshot/index.html'), 'utf8');
    assert.ok(html.indexOf('id="daily-update"') < html.indexOf('id="card"'));
    assert.match(html, /id="daily-message" role="status" aria-live="polite"/);
    assert.match(html, /<button type="button" id="today">Play today's launch<\/button>/);
});

// Run the actual shipped summary functions against real game stores, with only
// DOM elements supplied by this fixture. The calculation is never reimplemented.
const yearSource = fs.readFileSync(path.join(__dirname, '../year/year.js'), 'utf8');
const yearFunctions = yearSource.slice(yearSource.indexOf('function gameRecord('), yearSource.indexOf('\nasync function weather('));
function yearHarness(year, last, states) {
    class Node {
        constructor(tag, cls, text) { this.tag = tag; this.className = cls; this.textContent = text || ''; this.children = []; }
        append(...children) { this.children.push(...children); }
    }
    const nodes = new Map();
    const byId = id => { if (!nodes.has(id)) nodes.set(id, new Node('div')); return nodes.get(id); };
    const num = n => Math.round(n).toLocaleString('en-US');
    const ctx = vm.createContext({ YEAR: year, FIRST: 2026, LAST: last, D: Daily,
        localStorage: { getItem: key => states[key] ? JSON.stringify(states[key]) : null },
        window: { OnePutt: Putt, Slingshot: Sling }, $: byId,
        h: (tag, cls, text) => new Node(tag, cls, text), num,
        plural: (n, one, many) => num(n) + ' ' + (n === 1 ? one : many),
        isoDay: date => new Date(date + 'T12:00:00'), fmt: (date, options) => date.toLocaleDateString('en-US', options)
    });
    vm.runInContext(yearFunctions, ctx);
    return { record: (api, key, field, word) => ctx.gameRecord(api, key, field, word),
        cards() { ctx.games(); return byId('g-games').children; }, byId };
}
function rounds(api, dates) {
    let saved = api.emptyState();
    for (const date of dates) saved = api.recordDaily(saved, Daily.puzzleDay(new Date(date + 'T12:00:00')), {
        shots: 1, strokes: 1, par: 3, bodies: 1, outcomes: 3, windMph: 8, windDeg: 0
    });
    return saved;
}
for (const [api, key, field, word] of [[Sling, 'bullseyes', 'shots', 'Bullseyes'], [Putt, 'aces', 'strokes', 'Aces']]) {
    test(`${word}: selected-year streak stops at New Year rather than leaking a lifetime seven-day streak`, () => {
        const saved = rounds(api, ['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03', '2027-01-04', '2027-01-05']);
        assert.equal(saved.bestStreak, 7);
        const prior = yearHarness(2026, 2027, { [api.STORAGE_KEY]: saved }).record(api, key, field, word);
        const current = yearHarness(2027, 2027, { [api.STORAGE_KEY]: saved }).record(api, key, field, word);
        assert.equal(prior.played, 2); assert.equal(prior.ones, 2); assert.equal(prior.bestStreak, 2);
        assert.equal(current.played, 5); assert.equal(current.bestStreak, 5);
    });
    test(`${word}: gaps break the selected-year streak, and another year's longer streak is excluded`, () => {
        const saved = rounds(api, ['2026-10-01', '2026-10-02', '2026-10-04', '2027-01-01', '2027-01-02', '2027-01-03']);
        const result = yearHarness(2026, 2027, { [api.STORAGE_KEY]: saved }).record(api, key, field, word);
        assert.equal(result.bestStreak, 2); assert.equal(result.played, 3);
    });
}

test('first-year legacy totals stay available without pretending a lost lifetime streak is a retained streak', () => {
    const saved = rounds(Sling, ['2026-10-01', '2026-10-02', '2026-10-03']);
    Object.assign(saved, { played: 50, bullseyes: 10, bestStreak: 45 });
    const h = yearHarness(2026, 2026, { [Sling.STORAGE_KEY]: saved });
    const result = h.record(Sling, 'bullseyes', 'shots', 'Bullseyes');
    assert.equal(result.played, 50); assert.equal(result.ones, 10); assert.equal(result.bestStreak, 3);
    const card = h.cards()[1], labels = card.children.find(node => node.tag === 'dl').children.map(node => node.textContent);
    assert.ok(labels.includes('Best recorded streak')); assert.ok(labels.includes('3 days'));
    assert.match(h.byId('g-note').textContent, /older daily records may be missing/);
    assert.match(h.byId('g-note').textContent, /totals include earlier 2026 plays/);
});

test('retention truncation reports only the selected-year retained streak and discloses missing history', () => {
    let saved = Sling.emptyState();
    const first = Daily.puzzleDay(new Date(2026, 0, 1));
    for (let index = 0; index < 430; index++) saved = Sling.recordDaily(saved, first + index, { shots: 2, par: 3, bodies: 1, outcomes: 3 });
    const h = yearHarness(2026, 2027, { [Sling.STORAGE_KEY]: saved });
    const result = h.record(Sling, 'bullseyes', 'shots', 'Bullseyes');
    assert.equal(result.played, 335); assert.equal(result.bestStreak, 335);
    assert.equal(saved.bestStreak, 430);
    h.cards(); assert.match(h.byId('g-note').textContent, /saved history for 2026/);
    assert.match(h.byId('g-note').textContent, /older daily records may be missing/);
});

test('an empty historical selection says no saved rounds for that year instead of displaying a lifetime best', () => {
    const saved = rounds(Sling, ['2027-01-01', '2027-01-02']);
    const h = yearHarness(2026, 2027, { [Sling.STORAGE_KEY]: saved });
    assert.equal(h.record(Sling, 'bullseyes', 'shots', 'Bullseyes'), null);
    assert.ok(h.cards()[1].children.some(node => /No saved rounds for 2026/.test(node.textContent)));
    assert.match(h.byId('g-note').textContent, /Older daily records may no longer be available/);
});
