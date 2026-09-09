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
// The trips panel
//
// Hover alone would make this invisible on a phone, so the tile is a button
// and a tap toggles it. Hover is transient; an explicit tap pins it open until
// something dismisses it - the same split the weather console's readouts use,
// for the same reason.
// ----------------------------------------------------------------------
let tripsPinned = false;

/**
 * The trips worth showing. stats.json is edited by hand, so an entry that is
 * not an object, or has no place, is dropped rather than allowed to break the
 * page.
 *
 * THE COUNT AND THE PANEL BOTH COME FROM HERE. Counting the raw array while
 * the panel counted what it could render put "6" on a tile that opened onto
 * two lines -- the same drift as storing the number beside the list, moved
 * from two files into two code paths.
 */
function usableTrips(list) {
    if (!Array.isArray(list)) return [];
    return list.reduce((out, entry) => {
        if (!entry || typeof entry !== 'object') return out;
        const place = typeof entry.place === 'string' ? entry.place.trim() : '';
        if (place) out.push({ place, when: typeof entry.when === 'string' ? entry.when.trim() : '' });
        return out;
    }, []);
}

function renderTrips(trips) {
    const ul = byId('trip-list');
    const card = byId('stat-trips-card');
    if (!ul || !card) return;

    ul.textContent = '';
    trips.forEach(trip => {
        const li = document.createElement('li');
        const name = document.createElement('span');
        name.className = 'trip-place';
        name.textContent = trip.place;
        li.appendChild(name);
        // No date yet is just the place: the dates are Kyle's to fill in and
        // the panel has to read properly before he does.
        if (trip.when) {
            const date = document.createElement('span');
            date.className = 'trip-when';
            date.textContent = trip.when;
            li.appendChild(date);
        }
        ul.appendChild(li);
    });

    card.classList.toggle('metric-card--expands', trips.length > 0);
    if (!trips.length) hideTrips();
}

function showTrips() {
    const card = byId('stat-trips-card');
    const panel = byId('stat-trips-detail');
    const ul = byId('trip-list');
    if (!card || !panel || !ul || !ul.children.length) return;

    // The panel spans the grid so it cannot run off a narrow screen; the caret
    // is what still points at the tile you asked about.
    const grid = byId('personal-metrics');
    if (grid) {
        const c = card.getBoundingClientRect();
        const g = grid.getBoundingClientRect();
        panel.style.setProperty('--caret-x', `${Math.round(c.left - g.left + c.width / 2)}px`);
    }
    panel.hidden = false;
    card.classList.add('is-open');
    card.setAttribute('aria-expanded', 'true');
}

function hideTrips() {
    const card = byId('stat-trips-card');
    const panel = byId('stat-trips-detail');
    if (!card || !panel) return;
    card.classList.remove('is-open');
    card.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
}

function tripsOpen() {
    const card = byId('stat-trips-card');
    return !!card && card.classList.contains('is-open');
}

function wireTripsPanel() {
    const card = byId('stat-trips-card');
    if (!card) return;

    /*
     * Toggles the PINNED state, not what happens to be on screen. A real tap
     * focuses the button before it clicks it, and focus opens the panel -- so
     * a handler that read "is it open?" would find its own focus handler's
     * work and close again in the same gesture. Nothing but a programmatic
     * .click(), which skips focus, would ever have shown otherwise.
     */
    card.addEventListener('click', () => {
        tripsPinned = !tripsPinned;
        if (tripsPinned) showTrips(); else hideTrips();
    });
    /*
     * Guarded by the event's own pointer type, not by a media query. A laptop
     * with a touchscreen matches (hover: hover) and is still touched, and a
     * touch reports pointerenter immediately before the tap and pointerleave
     * on the lift -- so a media-query guard would open the panel and shut it
     * again in the same gesture.
     */
    const fine = event => event.pointerType && event.pointerType !== 'touch';
    card.addEventListener('pointerenter', event => { if (fine(event)) showTrips(); });
    card.addEventListener('pointerleave', event => {
        if (fine(event) && !tripsPinned) hideTrips();
    });
    card.addEventListener('focus', showTrips);
    card.addEventListener('blur', () => { if (!tripsPinned) hideTrips(); });

    document.addEventListener('click', event => {
        if (tripsOpen() && !card.contains(event.target)) { tripsPinned = false; hideTrips(); }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && tripsOpen()) { tripsPinned = false; hideTrips(); }
    });
    // The caret is measured, so it has to be measured again when things move.
    window.addEventListener('resize', () => { if (tripsOpen()) showTrips(); });
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
            ['trips', 'books', 'projects', 'naps'].forEach(key => {
                const card = byId(`stat-${key}-card`);
                const value = stats[key];
                /*
                 * A list counts itself. Storing the number beside the list
                 * would let the two disagree the first time a trip is added to
                 * one and not the other, and the number is the part everyone
                 * sees.
                 */
                const isList = Array.isArray(value);
                const count = isList ? usableTrips(value).length : value;
                const valid = typeof count === 'number' && Number.isFinite(count)
                    && count >= 0 && (!isList || count > 0);
                if (card) card.hidden = !valid;
                if (valid) {
                    setText(`stat-${key}`, formatNumber(count));
                    populated++;
                }
            });
            renderTrips(usableTrips(stats.trips));

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
wireTripsPanel();
tick();
tickInterval = setInterval(tick, 1000);
