/**
 * Retirement clock - dual mode page logic.
 *
 * Countdown mode: target date in the future (days / hours / minutes / seconds).
 * Count-up mode:  target date in the past (days retired, freedom metrics).
 *
 * All date math lives in calc.js (window.RetirementCalc). This file only
 * touches the DOM.
 */
const Calc = window.RetirementCalc;

// Retirement date management
let retirementDate = new Date(Calc.DEFAULT_RETIREMENT_ISO);

const MAX_CONFETTI_ELEMENTS = 200;
const CELEBRATION_CONFETTI_DURATION = 30000; // Stop confetti after 30 seconds
const CELEBRATION_CONFETTI_INTERVAL = 300;

// State
let currentMode = null;          // 'countdown' | 'countup'
let celebrating = false;
let lastCountdownDays = null;    // confetti tracking (countdown)
let lastCountupDays = null;      // render + confetti tracking (count-up)
let lastMilestoneDays = null;    // milestone DOM cache
let personalStatsRequested = false;

// Interval / timeout handles for cleanup
let tickInterval = null;
let celebrationConfettiInterval = null;
let celebrationTimeout = null;

const METRIC_ELEMENT_IDS = {
    weekends: 'weekends',
    workDays: 'work-days',
    workHours: 'work-hours',
    sleeps: 'sleeps',
    sunrises: 'sunrises',
    mondays: 'mondays',
    fridays: 'fridays',
    commutes: 'commutes',
    commuteHours: 'commute-hours',
    meetings: 'meetings',
    alarms: 'alarms'
};

const COUNTDOWN_QUOTES = [
    "Every day brings you closer to your dream!",
    "You've worked hard for this moment!",
    "The best is yet to come!",
    "Soon you'll have all the time in the world!",
    "Freedom is just around the corner!",
    "New adventures await!",
    "Your well-deserved break is coming!",
    "Get ready to spread your wings!",
    "Paradise is calling your name!",
    "You're crushing this countdown!"
];

const COUNTUP_QUOTES = [
    "No alarm tomorrow either.",
    "The calendar is yours now.",
    "Slow mornings are the whole point.",
    "Every sunrise on your own schedule.",
    "Time well earned, spent well.",
    "The best chapter, one day at a time.",
    "Nothing due. Nowhere to be.",
    "Rest is not a reward. It's the plan.",
    "Today is whatever you make it.",
    "Still retired. Still good."
];

const DATE_OPTIONS_SHORT = { year: 'numeric', month: 'short', day: 'numeric' };
const DATE_OPTIONS_LONG = { year: 'numeric', month: 'long', day: 'numeric' };

// ----------------------------------------------------------------------
// Small DOM helpers
// ----------------------------------------------------------------------
function byId(id) {
    return document.getElementById(id);
}

function setText(id, text) {
    const el = byId(id);
    if (el) el.textContent = text;
}

function formatNumber(value) {
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: 1 });
}

// ----------------------------------------------------------------------
// Saved date handling
// ----------------------------------------------------------------------
function loadSavedDate() {
    try {
        const savedDate = localStorage.getItem('retirementDate');
        if (savedDate) {
            const parsedDate = new Date(savedDate);
            // Validate the parsed date is valid
            if (isNaN(parsedDate.getTime())) {
                console.warn('Invalid date in localStorage, using default');
                localStorage.removeItem('retirementDate');
                return;
            }
            retirementDate = parsedDate;
        }
    } catch (error) {
        console.warn('Unable to access localStorage:', error);
        showNotification('Unable to load saved date');
    }
    const input = byId('retirement-date');
    if (input) input.value = formatDateForInput(retirementDate);
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Update retirement date with validation
byId('update-date').addEventListener('click', () => {
    const newDateValue = byId('retirement-date').value;
    const result = Calc.validateDateInput(newDateValue, new Date());

    if (!result.ok) {
        showNotification(result.error);
        return;
    }

    retirementDate = result.date;

    // Save to localStorage with error handling
    try {
        localStorage.setItem('retirementDate', retirementDate.toISOString());
    } catch (error) {
        console.warn('Unable to save to localStorage:', error);
        showNotification('Date updated but could not be saved');
    }

    // A freshly set date never triggers the celebration; jump straight to its mode
    currentMode = null;
    resetTrackers();
    createConfetti();
    showNotification('Retirement date updated!');
    tick();
});

byId('reset-date').addEventListener('click', resetCountdown);
byId('celebration-continue').addEventListener('click', endCelebration);

function resetTrackers() {
    lastCountdownDays = null;
    lastCountupDays = null;
    lastMilestoneDays = null;
}

function resetCountdown() {
    clearAllIntervals();

    try {
        localStorage.removeItem('retirementDate');
    } catch (error) {
        console.warn('Unable to clear localStorage:', error);
    }
    location.reload();
}

function clearAllIntervals() {
    if (tickInterval) clearInterval(tickInterval);
    if (celebrationConfettiInterval) clearInterval(celebrationConfettiInterval);
    if (celebrationTimeout) clearTimeout(celebrationTimeout);
    tickInterval = null;
    celebrationConfettiInterval = null;
    celebrationTimeout = null;
}

// ----------------------------------------------------------------------
// Mode switching
// ----------------------------------------------------------------------
function applyMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;
    resetTrackers();

    document.body.classList.toggle('mode-countdown', mode === 'countdown');
    document.body.classList.toggle('mode-countup', mode === 'countup');

    // Show / hide mode-specific blocks
    document.querySelectorAll('[data-mode]').forEach(el => {
        el.hidden = el.dataset.mode !== mode;
    });

    // Swap per-mode text labels
    document.querySelectorAll('[data-text-countdown]').forEach(el => {
        const text = mode === 'countup' ? el.dataset.textCountup : el.dataset.textCountdown;
        if (text) el.textContent = text;
    });

    // Swap per-mode aria labels on the decorative visuals
    document.querySelectorAll('[data-aria-countdown]').forEach(el => {
        const label = mode === 'countup' ? el.dataset.ariaCountup : el.dataset.ariaCountdown;
        if (label) el.setAttribute('aria-label', label);
    });

    if (mode === 'countup') {
        const since = retirementDate.toLocaleDateString('en-US', DATE_OPTIONS_LONG);
        setText('page-title', `Retired Since ${since}`);
        setText('page-subtitle', 'Every day is a Saturday now.');
        document.title = `Retired Since ${since}`;
        loadPersonalStats();
    } else {
        setText('page-title', "Kyle's Countdown to Retirement");
        setText('page-subtitle', 'The Journey to Freedom Begins...');
        document.title = "Kyle's Countdown to Retirement";
    }
}

function tick() {
    if (celebrating) return;

    const now = new Date();
    const mode = Calc.getMode(now, retirementDate);

    // The only path to the celebration: a live countdown reaching zero
    if (currentMode === 'countdown' && mode === 'countup') {
        celebrateRetirement();
        return;
    }

    applyMode(mode);

    if (mode === 'countdown') {
        renderCountdown(now);
    } else {
        renderCountup(now);
    }
}

// ----------------------------------------------------------------------
// Countdown rendering
// ----------------------------------------------------------------------
function renderCountdown(now) {
    const parts = Calc.computeCountdownParts(now, retirementDate);

    setText('days', parts.days);
    setText('hours', parts.hoursRemainder);
    setText('minutes', parts.minutesRemainder);
    setText('seconds', parts.secondsRemainder);
    setText('months', parts.months);
    setText('weeks', parts.weeks);
    setText('total-hours', parts.totalHours.toLocaleString());

    renderMetrics(Calc.computeFunMetrics(now, retirementDate, 'countdown'));

    const { percentage } = Calc.computeProgress(now, retirementDate);
    renderProgressBar({
        percentage,
        heading: 'Journey to Freedom',
        startIcon: '🚀',
        startDate: Calc.EMPLOYMENT_START_DATE,
        startLabel: 'Day One',
        startAria: `Start: Day One, ${Calc.EMPLOYMENT_START_DATE.toLocaleDateString('en-US', DATE_OPTIONS_LONG)}`,
        endIcon: '🏝️',
        endDate: retirementDate,
        endLabel: 'Freedom Day',
        endAria: 'End: Freedom Day',
        barAria: 'Journey to retirement progress',
        description: Calc.progressDescription(percentage)
    });
    renderThermometer(percentage, parts.days);
    renderHourglass(percentage, percentage.toFixed(1) + '% Complete');
    renderMilestones(parts.days, 'countdown');
    updateMotivation('countdown');

    const crossed = Calc.crossedMilestone(lastCountdownDays, parts.days, 'countdown');
    if (crossed !== null) {
        createConfetti();
        showNotification(`Milestone: ${crossed} days remaining!`);
    }
    lastCountdownDays = parts.days;
}

// ----------------------------------------------------------------------
// Count-up rendering
// ----------------------------------------------------------------------
function renderCountup(now) {
    updateMotivation('countup');

    const days = Calc.computeElapsedDays(now, retirementDate);
    if (days === lastCountupDays) return; // nothing changes until midnight

    setText('countup-days', days.toLocaleString());
    setText('countup-breakdown', Calc.formatMonthsDays(Calc.computeMonthsDays(retirementDate, now)));

    renderMetrics(Calc.computeFunMetrics(now, retirementDate, 'countup'));

    const progress = Calc.nextMilestoneProgress(days, Calc.COUNTUP_MILESTONES);
    const retirementDay = Calc.startOfDay(retirementDate);
    const retirementLong = retirementDate.toLocaleDateString('en-US', DATE_OPTIONS_LONG);

    if (progress.complete) {
        const last = progress.prevMilestone;
        renderProgressBar({
            percentage: 100,
            heading: 'Every milestone reached',
            startIcon: '🏝️',
            startDate: retirementDate,
            startLabel: 'Retired',
            startAria: `Start: Retired ${retirementLong}`,
            endIcon: last ? last.icon : '🏆',
            endDate: Calc.addDays(retirementDay, progress.prev),
            endLabel: last ? last.text : 'Done',
            endAria: `End: ${last ? last.text : 'Done'}`,
            barAria: 'Retirement milestone progress',
            description: 'Every milestone reached. The rest is yours.'
        });
        renderHourglass(100, 'Every milestone reached');
    } else {
        const next = progress.nextMilestone;
        const remaining = progress.next - days;
        const pctRounded = Math.round(progress.percentage);
        renderProgressBar({
            percentage: progress.percentage,
            heading: `On the way to ${next.text}`,
            startIcon: '🏝️',
            startDate: retirementDate,
            startLabel: 'Retired',
            startAria: `Start: Retired ${retirementLong}`,
            endIcon: next.icon,
            endDate: Calc.addDays(retirementDay, progress.next),
            endLabel: next.text,
            endAria: `End: ${next.text}, ${progress.next} days retired`,
            barAria: `Progress toward ${next.text}`,
            description: `${pctRounded}% of the way to ${next.text.toLowerCase()}, ${remaining} ${remaining === 1 ? 'day' : 'days'} to go.`
        });
        renderHourglass(progress.percentage, `${progress.percentage.toFixed(1)}% to ${next.text}`);
    }

    renderThermometer(progress.percentage, days);
    setText('thermo-prev-label', 0); // tube starts at the retirement day
    setText('thermo-next-label', progress.next === null ? progress.prev : progress.next);

    renderMilestones(days, 'countup');
    renderComparisons(days);

    const crossed = Calc.crossedMilestone(lastCountupDays, days, 'countup');
    if (crossed !== null) {
        const milestone = Calc.COUNTUP_MILESTONES.find(m => m.threshold === crossed);
        createConfetti();
        showNotification(`Milestone reached: ${milestone ? milestone.text : crossed + ' days'}`);
    }
    lastCountupDays = days;
}

// ----------------------------------------------------------------------
// Shared renderers
// ----------------------------------------------------------------------
function renderMetrics(metrics) {
    Object.keys(METRIC_ELEMENT_IDS).forEach(key => {
        if (key in metrics) {
            setText(METRIC_ELEMENT_IDS[key], formatNumber(metrics[key]));
        }
    });
}

function renderProgressBar(opts) {
    const { percentage } = opts;

    const fill = byId('progress-fill');
    if (fill) fill.style.width = percentage + '%';
    setText('progress-text', percentage.toFixed(1) + '%');

    const progressBar = byId('progress-bar');
    if (progressBar) {
        progressBar.setAttribute('aria-valuenow', Math.round(percentage));
        progressBar.setAttribute('aria-label', opts.barAria);
    }

    setText('progress-heading', opts.heading);
    setText('start-icon', opts.startIcon);
    setText('start-date', opts.startDate.toLocaleDateString('en-US', DATE_OPTIONS_SHORT));
    setText('start-label', opts.startLabel);
    setText('end-icon', opts.endIcon);
    setText('end-date', opts.endDate.toLocaleDateString('en-US', DATE_OPTIONS_SHORT));
    setText('end-label', opts.endLabel);

    const startMarker = byId('start-marker');
    if (startMarker) startMarker.setAttribute('aria-label', opts.startAria);
    const endMarker = byId('end-marker');
    if (endMarker) endMarker.setAttribute('aria-label', opts.endAria);

    setText('progress-description', opts.description);
}

function renderThermometer(percentage, days) {
    const liquidElement = byId('thermometer-liquid');
    if (liquidElement) liquidElement.style.height = percentage + '%';
    setText('thermometer-days', days);
}

function renderHourglass(percentage, labelText) {
    const topPercentage = 100 - percentage;

    const sandTopElement = byId('sand-top');
    if (sandTopElement) sandTopElement.style.height = topPercentage + '%';

    const sandBottomElement = byId('sand-bottom');
    if (sandBottomElement) sandBottomElement.style.height = percentage + '%';

    setText('hourglass-label', labelText);

    const sandStreamElement = byId('sand-stream');
    if (sandStreamElement) {
        sandStreamElement.style.opacity = (percentage > 0 && percentage < 100) ? '1' : '0';
    }
}

function renderMilestones(days, direction) {
    // Only rebuild if days changed
    if (days === lastMilestoneDays) return;
    lastMilestoneDays = days;

    const source = direction === 'countup' ? Calc.COUNTUP_MILESTONES : Calc.COUNTDOWN_MILESTONES;
    const states = Calc.milestoneStates(days, source, direction);
    const unit = direction === 'countup' ? 'days retired' : 'days';

    const container = byId('milestones');
    if (!container) return;
    container.textContent = ''; // Clear safely

    states.forEach(m => {
        // Create elements safely (no innerHTML XSS risk)
        const milestone = document.createElement('div');
        milestone.className = `milestone ${m.state}`;
        milestone.dataset.threshold = m.threshold;
        milestone.setAttribute('role', 'listitem');
        milestone.setAttribute('aria-label', `${m.text}, ${m.threshold} ${unit}. Status: ${m.stateLabel}`);

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'milestone-icon-wrapper';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'milestone-icon';
        iconSpan.setAttribute('aria-hidden', 'true');
        iconSpan.textContent = m.displayIcon;

        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'milestone-emoji';
        emojiSpan.setAttribute('aria-hidden', 'true');
        emojiSpan.textContent = m.emoji;

        iconWrapper.appendChild(iconSpan);
        iconWrapper.appendChild(emojiSpan);

        const textSpan = document.createElement('span');
        textSpan.className = 'milestone-text';
        textSpan.textContent = m.text;

        const daysSpan = document.createElement('span');
        daysSpan.className = 'milestone-days';
        daysSpan.textContent = `${m.threshold.toLocaleString()} ${unit}`;

        milestone.appendChild(iconWrapper);
        milestone.appendChild(textSpan);
        milestone.appendChild(daysSpan);

        container.appendChild(milestone);
    });
}

function renderComparisons(days) {
    const section = byId('comparisons-section');
    const list = byId('comparisons');
    if (!section || !list) return;

    const { unlocked, next } = Calc.comparisonsUnlocked(days);
    list.textContent = '';

    unlocked.forEach(c => {
        const item = document.createElement('li');
        item.className = 'comparison-item';

        const label = document.createElement('span');
        label.className = 'comparison-label';
        label.textContent = c.label;

        const length = document.createElement('span');
        length.className = 'comparison-days';
        length.textContent = `${c.days.toLocaleString()} days`;

        item.appendChild(label);
        item.appendChild(length);
        list.appendChild(item);
    });

    if (next) {
        const remaining = next.days - days;
        setText('comparisons-next', `Next: ${next.label}, in ${remaining.toLocaleString()} ${remaining === 1 ? 'day' : 'days'}.`);
    } else {
        setText('comparisons-next', 'Longer than everything on the list.');
    }

    section.hidden = unlocked.length === 0 || currentMode !== 'countup';
}

function updateMotivation(direction) {
    const quotes = direction === 'countup' ? COUNTUP_QUOTES : COUNTDOWN_QUOTES;
    const quoteIndex = Math.floor(Date.now() / 10000) % quotes.length;
    setText('motivation-quote', quotes[quoteIndex]);
}

// ----------------------------------------------------------------------
// The list panels (trips, concerts)
//
// Hover alone would make these invisible on a phone, so each tile is a button
// and a tap toggles it. Hover is transient; an explicit tap pins it open until
// something dismisses it - the same split the weather console's readouts use,
// for the same reason.
//
// ONE KEY EACH, NOT A FLAG PER LIST. Both panels span the whole grid, so two
// open at once is one drawn on top of the other. With a single openKey and a
// single pinnedKey that state cannot be written down, let alone reached.
// ----------------------------------------------------------------------
const LISTS = {
    trips: { title: 'place' },
    concerts: { title: 'who' },
    projects: { title: 'what', link: 'url' }
};
let openKey = null;
let pinnedKey = null;

function listEls(key) {
    return {
        card: byId(`stat-${key}-card`),
        panel: byId(`stat-${key}-detail`),
        ul: byId(`stat-${key}-list`)
    };
}

/**
 * The entries worth showing. stats.json is edited by hand, so an entry that is
 * not an object, or has no title -- a trip's place, a concert's who, a
 * project's what -- is dropped rather than allowed to break the page.
 *
 * THE COUNT AND THE PANEL BOTH COME FROM HERE. Counting the raw array while
 * the panel counted what it could render put "6" on a tile that opened onto
 * two lines -- the same drift as storing the number beside the list, moved
 * from two files into two code paths.
 *
 * A link survives only as a root-relative path or an https URL. The file is
 * hand-edited and the panel is on a public page: "javascript:" is a script,
 * and an http link to a site that is https is a warning in the console.
 */
function usableEntries(list, spec) {
    if (!Array.isArray(list) || !spec || !spec.title) return [];
    return list.reduce((out, entry) => {
        if (!entry || typeof entry !== 'object') return out;
        const text = key => (typeof entry[key] === 'string' ? entry[key].trim() : '');
        const title = text(spec.title);
        const url = spec.link ? text(spec.link) : '';
        if (title) {
            out.push({
                title,
                when: text('when'),
                note: text('note'),
                url: /^(\/(?!\/)\S*|https:\/\/\S+)$/.test(url) ? url : ''
            });
        }
        return out;
    }, []);
}

function renderList(key, entries) {
    const { card, ul } = listEls(key);
    if (!ul || !card) return;

    ul.textContent = '';
    /*
     * Newest first. stats.json stays oldest-first, because a new entry is
     * appended at the bottom and the file order IS the chronology -- "when" is
     * free text ("May–June 2026") and cannot be sorted. But the panel scrolls
     * once it outgrows the room beside the tile, and the entry that falls off
     * the end should be March, not the one everyone just asked about.
     */
    entries.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        // A project with a public URL is a link to the thing itself. Site
        // pages stay in this tab; anything off-site opens beside it, and
        // says so to the opener.
        const name = document.createElement(entry.url ? 'a' : 'span');
        name.className = 'entry-title';
        name.textContent = entry.title;
        if (entry.url) {
            name.href = entry.url;
            if (entry.url.startsWith('https://')) {
                name.target = '_blank';
                name.rel = 'noopener';
            }
        }
        li.appendChild(name);
        // No date yet is just the title: the dates are Kyle's to fill in and
        // the panel has to read properly before he does.
        if (entry.when) {
            const date = document.createElement('span');
            date.className = 'entry-when';
            date.textContent = entry.when;
            li.appendChild(date);
        }
        // Why we went, or where it was. Optional, and an entry without one
        // stays one line.
        if (entry.note) {
            const note = document.createElement('span');
            note.className = 'entry-note';
            note.textContent = entry.note;
            li.appendChild(note);
        }
        ul.appendChild(li);
    });

    card.classList.toggle('metric-card--expands', entries.length > 0);
    if (!entries.length) hideList(key);
    else if (openKey === key) showList(key);
}

// The back link is fixed to the top corner and paints over whatever slides
// beneath it, so where the two overlap, the usable screen starts below the link.
function backLinkInset(gridRect) {
    const back = document.querySelector('.back-link');
    const b = back ? back.getBoundingClientRect() : null;
    return b && b.right > gridRect.left && b.left < gridRect.right ? Math.max(0, b.bottom) : 0;
}

/*
 * Says whether there is more of the list below what is showing, which is what
 * the fade at its bottom edge means. NOT "is it clipped": a list scrolled to
 * its end is still clipped and has nothing more below, and a fade left on
 * there dims the last entry for no reason.
 *
 * A clipped list is also made focusable. Safari never focuses a scroller, so
 * without this a keyboard has no way to reach the entries that do not fit.
 */
function syncMore(key) {
    const { ul } = listEls(key);
    if (!ul) return;
    const hidden = ul.scrollHeight - ul.clientHeight;
    ul.classList.toggle('has-more-below', hidden - ul.scrollTop > 1);
    if (hidden > 1) ul.setAttribute('tabindex', '0');
    else ul.removeAttribute('tabindex');
}

function showList(key) {
    const { card, panel, ul } = listEls(key);
    if (!card || !panel || !ul || !ul.children.length) return;

    // Whoever is shown takes the grid. Every caller gets this, so no caller
    // has to remember it.
    if (openKey && openKey !== key) hideList(openKey);

    /*
     * Horizontally the panel spans the GRID, so it can never run off the side
     * of a narrow screen. Vertically it anchors to the TILE.
     *
     * Anchoring both to the grid was the bug: at 320px the grid collapses to
     * one column and is four tiles tall, so "above the grid" put the panel off
     * the top of the viewport and "below the grid" put it off the bottom. The
     * tile is the thing the panel is about, and in a single-column layout it
     * is already full width, so there is nothing to gain by using the grid.
     */
    const grid = byId('personal-metrics');
    panel.hidden = false;
    if (grid) {
        const c = card.getBoundingClientRect();
        const g = grid.getBoundingClientRect();
        const gap = 10;
        panel.style.setProperty('--caret-x', `${Math.round(c.left - g.left + c.width / 2)}px`);

        const roomAbove = c.top - gap - 8 - backLinkInset(g);
        const roomBelow = window.innerHeight - c.bottom - gap - 8;

        /*
         * Measure at natural height, THEN choose a side, THEN cap to the room
         * on the side actually chosen. Capping first with the larger of the
         * two rooms and then landing on the smaller one is what clipped the
         * last trip mid-word.
         *
         * Lifting the cap to measure also throws away the list's scroll
         * position, and this runs on every window scroll -- so a reader half
         * way down a long list was snapped back to the top each time the
         * phone's URL bar moved. Held here and put back below.
         */
        const readingAt = ul.scrollTop;
        ul.style.maxHeight = '';
        // Above is preferred, below is the fallback. Measured after
        // unhiding — a hidden element has no height.
        const below = panel.offsetHeight > roomAbove && roomBelow > roomAbove;
        // The cap goes on the list, not the panel: the caret is drawn outside
        // the panel's box and any overflow on it clips the caret away.
        const chrome = panel.offsetHeight - ul.offsetHeight;
        ul.style.maxHeight = `${Math.max(96, (below ? roomBelow : roomAbove) - chrome)}px`;
        ul.scrollTop = readingAt;
        panel.classList.toggle('is-below', below);
        if (below) {
            panel.style.top = `${Math.round(c.bottom - g.top + gap)}px`;
            panel.style.bottom = 'auto';
        } else {
            panel.style.bottom = `${Math.round(g.bottom - c.top + gap)}px`;
            panel.style.top = 'auto';
        }
    }
    openKey = key;
    document.body.classList.toggle('list-open', openKey !== null);
    card.classList.add('is-open');
    card.setAttribute('aria-expanded', 'true');
    syncMore(key);
}

/*
 * A tap lands with the tile wherever it happens to be, and mid-screen there is
 * not room for the whole list on either side of it: at 320x700 six trips need
 * 330px and the better side had 257. The SCREEN has the room -- tile and list
 * together are under 500px -- it is just split in two by the tile. So when a
 * tap leaves the list clipped, move the page until the tile sits high enough
 * for the list to fit beneath it. The scroll listener re-places the panel as
 * the page moves, and lifts the cap once the room is there.
 *
 * Only for a tap or a click, which pins the panel. Hover and focus must never
 * move the page out from under a pointer that is only passing over.
 */
function makeRoomFor(key) {
    const { card, panel, ul } = listEls(key);
    const grid = byId('personal-metrics');
    if (!card || !panel || !ul || !grid || panel.hidden) return;

    const clippedBy = ul.scrollHeight - ul.clientHeight;
    if (clippedBy <= 0) return;

    const c = card.getBoundingClientRect();
    const natural = panel.offsetHeight + clippedBy;
    // Where the tile's bottom edge has to be for the list to fit under it --
    // but never so high that the tile itself goes under the back link. If the
    // list is too long for any position, that ceiling is the most room there is.
    const ceiling = backLinkInset(grid.getBoundingClientRect()) + 8 + c.height;
    const target = Math.max(ceiling, window.innerHeight - 18 - natural - 2);
    const delta = Math.round(c.bottom - target);
    if (delta <= 0) return;

    const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollBy({ top: delta, behavior: calm ? 'auto' : 'smooth' });
}

/*
 * A no-op for a list that is not the one open. A hover that yielded to another
 * tile's panel still fires its pointerleave, and an unconditional hide there
 * would drop the body class -- and with it the raised section -- out from
 * under the panel that IS open.
 */
function hideList(key) {
    if (openKey !== key) return;
    openKey = null;
    // A closed panel is not pinned, however it came to close.
    if (pinnedKey === key) pinnedKey = null;
    document.body.classList.toggle('list-open', openKey !== null);

    const { card, panel, ul } = listEls(key);
    if (!card || !panel) return;
    card.classList.remove('is-open');
    card.setAttribute('aria-expanded', 'false');
    // Reopened, it starts at the newest entry rather than wherever it was left.
    if (ul) ul.scrollTop = 0;
    panel.hidden = true;
}

function wireListPanels() {
    /*
     * Guarded by the event's own pointer type, not by a media query. A laptop
     * with a touchscreen matches (hover: hover) and is still touched, and a
     * touch reports pointerenter immediately before the tap and pointerleave
     * on the lift -- so a media-query guard would open the panel and shut it
     * again in the same gesture.
     */
    const fine = event => event.pointerType && event.pointerType !== 'touch';

    Object.keys(LISTS).forEach(key => {
        const { card, panel, ul } = listEls(key);
        if (!card || !panel || !ul) return;

        /*
         * Toggles the PINNED state, not what happens to be on screen. A real
         * tap focuses the button before it clicks it, and focus opens the
         * panel -- so a handler that read "is it open?" would find its own
         * focus handler's work and close again in the same gesture. Nothing
         * but a programmatic .click(), which skips focus, would ever have
         * shown otherwise.
         */
        card.addEventListener('click', () => {
            pinnedKey = pinnedKey === key ? null : key;
            if (pinnedKey === key) { showList(key); makeRoomFor(key); } else hideList(key);
        });
        /*
         * EXPLICIT GESTURES TAKE OVER, HOVER YIELDS. A tap, a click and a Tab
         * all say "this tile", so they close the other panel. A mouse crossing
         * a tile on its way somewhere else says nothing, and must not shut a
         * panel somebody is reading.
         */
        card.addEventListener('pointerenter', event => {
            if (!fine(event) || (openKey && openKey !== key)) return;
            showList(key);
        });
        card.addEventListener('pointerleave', event => {
            if (fine(event) && pinnedKey !== key) hideList(key);
        });
        card.addEventListener('focus', () => showList(key));
        /*
         * A clipped list is focusable, so Tab goes from the tile INTO the
         * panel. That is not leaving: hiding on it would take the list away
         * from the keyboard at the moment it arrived.
         */
        card.addEventListener('blur', event => {
            if (pinnedKey !== key && !panel.contains(event.relatedTarget)) hideList(key);
        });
        panel.addEventListener('focusout', event => {
            const to = event.relatedTarget;
            if (pinnedKey !== key && to !== card && !panel.contains(to)) hideList(key);
        });
        ul.addEventListener('scroll', () => syncMore(key), { passive: true });
    });

    // Registered once, for whichever list is open -- not once per list.
    document.addEventListener('click', event => {
        if (!openKey) return;
        const { card, panel } = listEls(openKey);
        // The panel is the tile's SIBLING, not its child. Testing the tile
        // alone made a tap on the list itself an "outside" tap, which shut a
        // list the reader was in the middle of scrolling.
        if (!card.contains(event.target) && !panel.contains(event.target)) hideList(openKey);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && openKey) hideList(openKey);
    });
    /*
     * The placement is measured, so it has to be measured again when the page
     * moves under it. Scroll matters as much as resize: open the panel at the
     * top of the page and then scroll down to read it, and a choice of "above"
     * that was right when you tapped puts it off the top of the screen. rAF
     * so a flung scroll does not run this per event.
     *
     * WHICH list is decided inside the frame, not when it is scheduled. A
     * frame is long enough for Escape to land, or for the other tile to take
     * over, and a callback that remembered the old answer reopened a panel
     * that had just been closed -- during exactly the smooth scroll a tap
     * starts.
     */
    let placing = 0;
    const replace = () => {
        if (!openKey || placing) return;
        placing = requestAnimationFrame(() => { placing = 0; if (openKey) showList(openKey); });
    };
    window.addEventListener('resize', replace);
    window.addEventListener('scroll', replace, { passive: true });
}

// ----------------------------------------------------------------------
// Personal stats (countdown/stats.json)
// ----------------------------------------------------------------------
function loadPersonalStats() {
    if (personalStatsRequested) return;
    personalStatsRequested = true;

    const section = byId('personal-section');
    if (!section || typeof fetch !== 'function') return;

    fetch('stats.json', { cache: 'no-cache' })
        .then(response => {
            if (!response.ok) throw new Error(`stats.json returned ${response.status}`);
            return response.json();
        })
        .then(stats => {
            if (!stats || typeof stats !== 'object') throw new Error('stats.json is not an object');

            let populated = 0;
            // One filter per list, used for the number AND for the panel. A
            // list under a key that is not in LISTS has no title to look for,
            // so it counts as empty and hides its tile.
            const entriesOf = key => usableEntries(stats[key], LISTS[key]);
            ['trips', 'concerts', 'projects', 'books'].forEach(key => {
                const card = byId(`stat-${key}-card`);
                const value = stats[key];
                /*
                 * A list counts itself. Storing the number beside the list
                 * would let the two disagree the first time a trip is added to
                 * one and not the other, and the number is the part everyone
                 * sees.
                 */
                const isList = Array.isArray(value);
                const count = isList ? entriesOf(key).length : value;
                const valid = typeof count === 'number' && Number.isFinite(count)
                    && count >= 0 && (!isList || count > 0);
                if (card) card.hidden = !valid;
                if (valid) {
                    setText(`stat-${key}`, formatNumber(count));
                    populated++;
                }
            });
            Object.keys(LISTS).forEach(key => renderList(key, entriesOf(key)));

            if (typeof stats.updated === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(stats.updated)) {
                const [y, m, d] = stats.updated.split('-').map(Number);
                const updated = new Date(y, m - 1, d);
                setText('stats-updated', `As of ${updated.toLocaleDateString('en-US', DATE_OPTIONS_LONG)}`);
            } else {
                setText('stats-updated', '');
            }

            section.hidden = populated === 0 || currentMode !== 'countup';
        })
        .catch(error => {
            console.warn('Personal stats unavailable:', error);
            section.hidden = true;
        });
}

// ----------------------------------------------------------------------
// Celebration (live countdown reaching zero)
// ----------------------------------------------------------------------
function celebrateRetirement() {
    if (celebrating) return;
    celebrating = true;

    const overlay = byId('celebration');
    if (!overlay) {
        endCelebration();
        return;
    }

    document.body.classList.add('celebrating');
    overlay.hidden = false;
    setText('celebration-alert', 'Congratulations! You are officially retired!');
    overlay.focus();

    createConfetti();
    celebrationConfettiInterval = setInterval(createConfetti, CELEBRATION_CONFETTI_INTERVAL);
    celebrationTimeout = setTimeout(endCelebration, CELEBRATION_CONFETTI_DURATION);
}

function endCelebration() {
    if (celebrationConfettiInterval) clearInterval(celebrationConfettiInterval);
    if (celebrationTimeout) clearTimeout(celebrationTimeout);
    celebrationConfettiInterval = null;
    celebrationTimeout = null;

    const overlay = byId('celebration');
    if (overlay) overlay.hidden = true;
    setText('celebration-alert', '');
    document.body.classList.remove('celebrating');

    celebrating = false;
    applyMode('countup');
    tick();

    const title = byId('page-title');
    if (title) title.setAttribute('tabindex', '-1');
    if (title) title.focus();
}

// ----------------------------------------------------------------------
// Confetti, notifications, stars
// ----------------------------------------------------------------------
function createConfetti() {
    const container = byId('confetti-container');
    if (!container) return;

    // Limit total confetti elements to prevent memory leak
    if (container.children.length >= MAX_CONFETTI_ELEMENTS) {
        return;
    }

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3', '#54a0ff'];

    for (let i = 0; i < 50; i++) {
        if (container.children.length >= MAX_CONFETTI_ELEMENTS) break;

        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        container.appendChild(confetti);

        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 5000);
    }
}

// Notification system with ARIA support
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    notification.setAttribute('aria-atomic', 'true');
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Create animated stars background
function createStars() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;

    starsContainer.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        starsContainer.appendChild(star);
    }
}

// ----------------------------------------------------------------------
// Initialize
// ----------------------------------------------------------------------
loadSavedDate();
createStars();
wireListPanels();
tick();
tickInterval = setInterval(tick, 1000);
