/**
 * RetirementCalc - pure date math for the countdown / count-up page.
 *
 * No DOM access. Loaded in the browser via <script src="calc.js"> (attaches
 * window.RetirementCalc) and in Node via require() for the test suite.
 */
(function (root) {
    'use strict';

    // ------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const DEFAULT_RETIREMENT_ISO = '2026-02-27T16:00:00';
    const EMPLOYMENT_START_DATE = new Date('2018-10-01T00:00:00');

    // Assumptions behind the "freedom" metrics
    const WORK_HOURS_PER_DAY = 8;
    const COMMUTES_PER_WORKDAY = 2;
    const COMMUTE_MINUTES_EACH_WAY = 30;
    const MEETINGS_PER_WORKDAY = 3;
    const ALARMS_PER_WORKDAY = 1;

    // Custom-date validation bounds
    const MIN_DATE = new Date('1950-01-01T00:00:00');
    const MAX_YEARS_AHEAD = 50;

    // Countdown milestones (days remaining), descending as displayed
    const COUNTDOWN_MILESTONES = [
        { threshold: 730, icon: '🎯', text: '2 Years to Go', emoji: '📅' },
        { threshold: 365, icon: '🎆', text: 'One Year Left', emoji: '🗓️' },
        { threshold: 180, icon: '🌸', text: '6 Months Away', emoji: '⏳' },
        { threshold: 100, icon: '💯', text: 'Double Digits', emoji: '🎊' },
        { threshold: 50, icon: '⚡', text: '50 Days Left', emoji: '🎉' },
        { threshold: 30, icon: '🎪', text: 'One Month', emoji: '📆' },
        { threshold: 7, icon: '⭐', text: 'Final Week', emoji: '🎯' },
        { threshold: 1, icon: '🔥', text: 'LAST DAY!', emoji: '🚀' }
    ];

    // Day counts that trigger confetti in countdown mode
    const COUNTDOWN_CONFETTI_DAYS = [100, 50, 30, 7, 1];

    // Count-up milestones (days retired), ascending as displayed
    const COUNTUP_MILESTONES = [
        { threshold: 7, icon: '🌅', text: 'One Week Free', emoji: '🌿' },
        { threshold: 30, icon: '🌙', text: 'One Month', emoji: '📆' },
        { threshold: 100, icon: '💯', text: '100 Days', emoji: '🌻' },
        { threshold: 182, icon: '🌸', text: 'Six Months', emoji: '⏳' },
        { threshold: 365, icon: '🎂', text: 'One Year', emoji: '🗓️' },
        { threshold: 500, icon: '🌟', text: '500 Days', emoji: '🌊' },
        { threshold: 730, icon: '🌳', text: 'Two Years', emoji: '📅' },
        { threshold: 1000, icon: '🏔️', text: '1,000 Days', emoji: '✨' },
        { threshold: 1095, icon: '🍂', text: 'Three Years', emoji: '🍁' },
        { threshold: 1826, icon: '🌈', text: 'Five Years', emoji: '🎈' },
        { threshold: 3652, icon: '🏆', text: 'Ten Years', emoji: '🎇' }
    ];

    // "Retired longer than..." comparisons, ascending
    const COMPARISONS = [
        { days: 90, label: 'a school semester' },
        { days: 126, label: 'an NFL regular season' },
        { days: 162, label: 'an MLB regular season' },
        { days: 210, label: 'a one-way trip to Mars' },
        { days: 280, label: 'a full-term pregnancy' },
        { days: 365, label: 'a year on Earth' },
        { days: 687, label: 'a year on Mars' },
        { days: 1000, label: 'a thousand days' },
        { days: 2921, label: 'the Apollo program' },
        { days: 3652, label: 'a decade' }
    ];

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    function startOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function addDays(date, n) {
        const d = new Date(date);
        d.setDate(d.getDate() + n);
        return d;
    }

    function daysInMonth(year, monthIndex) {
        return new Date(year, monthIndex + 1, 0).getDate();
    }

    // Add whole months, clamping the day-of-month (Jan 31 + 1 month = Feb 28/29)
    function addMonthsClamped(date, months) {
        const d = new Date(date);
        const day = d.getDate();
        d.setDate(1);
        d.setMonth(d.getMonth() + months);
        d.setDate(Math.min(day, daysInMonth(d.getFullYear(), d.getMonth())));
        return d;
    }

    // Whole calendar days between two midnight-normalized dates (DST-safe)
    function calendarDaysBetween(startDate, endDate) {
        return Math.round((startOfDay(endDate) - startOfDay(startDate)) / MS_PER_DAY);
    }

    // ------------------------------------------------------------------
    // Mode + countdown parts
    // ------------------------------------------------------------------
    function getMode(now, target) {
        return (target - now) > 0 ? 'countdown' : 'countup';
    }

    function computeCountdownParts(now, target) {
        const diff = Math.max(0, target - now);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30.44);

        return {
            diff,
            days,
            hours,
            minutes,
            seconds,
            weeks,
            months,
            hoursRemainder: hours % 24,
            minutesRemainder: minutes % 60,
            secondsRemainder: seconds % 60,
            totalHours: hours
        };
    }

    // ------------------------------------------------------------------
    // Count-up elapsed time
    // ------------------------------------------------------------------
    // Calendar days since the target date. Stable for the whole day regardless
    // of the retirement time-of-day, and agrees with computeMonthsDays().
    function computeElapsedDays(now, target) {
        return Math.max(0, calendarDaysBetween(target, now));
    }

    function computeMonthsDays(target, now) {
        const t = startOfDay(target);
        const n = startOfDay(now);
        if (n <= t) return { months: 0, days: 0 };

        let months = (n.getFullYear() - t.getFullYear()) * 12 + (n.getMonth() - t.getMonth());
        if (addMonthsClamped(t, months) > n) months--;
        const days = calendarDaysBetween(addMonthsClamped(t, months), n);
        return { months, days };
    }

    function formatMonthsDays(parts) {
        const { months, days } = parts;
        const dayText = `${days} ${days === 1 ? 'day' : 'days'}`;
        if (months <= 0) return dayText;
        const monthText = `${months} ${months === 1 ? 'month' : 'months'}`;
        return `${monthText}, ${dayText}`;
    }

    // ------------------------------------------------------------------
    // Work-week counting (math instead of a per-day loop)
    // ------------------------------------------------------------------
    // Counts calendar days in the half-open window [startDate, endDate).
    function computeWorkweekCounts(startDate, endDate) {
        const start = startOfDay(startDate);
        const totalDays = calendarDaysBetween(start, endDate);

        if (totalDays <= 0) {
            return { totalDays: 0, weekends: 0, workDays: 0, mondays: 0, fridays: 0 };
        }

        const fullWeeks = Math.floor(totalDays / 7);
        const remainingDays = totalDays % 7;

        let weekends = fullWeeks; // one Saturday per full week
        let workDays = fullWeeks * 5;
        let mondays = fullWeeks;
        let fridays = fullWeeks;

        const startDayOfWeek = start.getDay();
        for (let i = 0; i < remainingDays; i++) {
            const dayOfWeek = (startDayOfWeek + i) % 7;
            if (dayOfWeek === 6) {
                weekends++;
            } else if (dayOfWeek !== 0) {
                workDays++;
                if (dayOfWeek === 1) mondays++;
                if (dayOfWeek === 5) fridays++;
            }
        }

        return { totalDays, weekends, workDays, mondays, fridays };
    }

    function computeFunMetrics(now, target, direction) {
        if (direction === 'countup') {
            // Window: the day after retirement through today (inclusive)
            const days = computeElapsedDays(now, target);
            const counts = computeWorkweekCounts(addDays(startOfDay(target), 1), addDays(startOfDay(now), 1));
            const commutes = counts.workDays * COMMUTES_PER_WORKDAY;
            return {
                days,
                weekends: counts.weekends,
                workDays: counts.workDays,
                workHours: counts.workDays * WORK_HOURS_PER_DAY,
                sleeps: days,
                sunrises: days,
                mondays: counts.mondays,
                fridays: days, // every day is Friday now
                commutes,
                commuteHours: (commutes * COMMUTE_MINUTES_EACH_WAY) / 60,
                meetings: counts.workDays * MEETINGS_PER_WORKDAY,
                alarms: counts.workDays * ALARMS_PER_WORKDAY
            };
        }

        // Countdown: today through the day before retirement
        const days = Math.max(0, Math.floor((target - now) / MS_PER_DAY));
        const counts = computeWorkweekCounts(now, target);
        return {
            days,
            weekends: counts.weekends,
            workDays: counts.workDays,
            workHours: counts.workDays * WORK_HOURS_PER_DAY,
            sleeps: days,
            sunrises: days + 1,
            mondays: counts.mondays,
            fridays: counts.fridays
        };
    }

    // ------------------------------------------------------------------
    // Progress
    // ------------------------------------------------------------------
    function computeProgress(now, target, employmentStart) {
        const start = employmentStart || EMPLOYMENT_START_DATE;
        const totalTime = target - start;
        const elapsed = now - start;
        const percentage = Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
        return { totalTime, elapsed, percentage };
    }

    function progressDescription(percentage) {
        if (percentage < 25) return 'The journey has begun!';
        if (percentage < 50) return 'Making steady progress!';
        if (percentage < 75) return 'More than halfway there!';
        if (percentage < 90) return 'The finish line is in sight!';
        return 'Almost there! So close!';
    }

    // ------------------------------------------------------------------
    // Milestones
    // ------------------------------------------------------------------
    function milestoneStates(days, milestones, direction) {
        if (direction === 'countup') {
            let activeAssigned = false;
            return milestones.map(m => {
                let state;
                let displayIcon;
                let stateLabel;
                if (days >= m.threshold) {
                    state = 'achieved';
                    displayIcon = '✅';
                    stateLabel = 'Reached';
                } else if (!activeAssigned) {
                    activeAssigned = true;
                    state = 'active';
                    displayIcon = m.icon;
                    stateLabel = 'Next up';
                } else {
                    state = 'locked';
                    displayIcon = '🔒';
                    stateLabel = 'Upcoming';
                }
                return Object.assign({}, m, { state, displayIcon, stateLabel });
            });
        }

        return milestones.map(m => {
            let state;
            let displayIcon;
            let stateLabel;
            if (days <= m.threshold) {
                state = 'achieved';
                displayIcon = '✅';
                stateLabel = 'Completed';
            } else if (days <= m.threshold + 30) {
                state = 'active';
                displayIcon = m.icon;
                stateLabel = 'In progress';
            } else {
                state = 'locked';
                displayIcon = '🔒';
                stateLabel = 'Upcoming';
            }
            return Object.assign({}, m, { state, displayIcon, stateLabel });
        });
    }

    // Progress toward the next milestone, measured from retirement day itself
    // (day 0), not from the previous milestone. The bar, hourglass and
    // thermometer all label their span "Retired -> <next milestone>", so the
    // fill has to be days/next: 191 days retired is 52% of the way to one
    // year, not 5% of the 182-day gap between six months and one year.
    function nextMilestoneProgress(days, milestones) {
        const sorted = milestones.slice().sort((a, b) => a.threshold - b.threshold);
        let prevMilestone = null;
        let nextMilestone = null;

        for (const m of sorted) {
            if (m.threshold <= days) {
                prevMilestone = m;
            } else if (!nextMilestone) {
                nextMilestone = m;
            }
        }

        const prev = prevMilestone ? prevMilestone.threshold : 0;
        if (!nextMilestone) {
            return { prev, next: null, prevMilestone, nextMilestone: null, fraction: 1, percentage: 100, complete: true };
        }

        const next = nextMilestone.threshold;
        const fraction = next > 0 ? Math.max(0, Math.min(1, days / next)) : 1;
        return { prev, next, prevMilestone, nextMilestone, fraction, percentage: fraction * 100, complete: false };
    }

    function crossedMilestone(prevDays, days, direction, thresholds) {
        if (prevDays === null || prevDays === undefined || prevDays === days) return null;

        if (direction === 'countup') {
            const list = thresholds || COUNTUP_MILESTONES.map(m => m.threshold);
            const crossed = list.filter(t => prevDays < t && days >= t);
            return crossed.length ? Math.max(...crossed) : null;
        }

        const list = thresholds || COUNTDOWN_CONFETTI_DAYS;
        const crossed = list.filter(t => prevDays > t && days <= t);
        return crossed.length ? Math.min(...crossed) : null;
    }

    // ------------------------------------------------------------------
    // Comparisons
    // ------------------------------------------------------------------
    function comparisonsUnlocked(days, comparisons, limit) {
        const list = comparisons || COMPARISONS;
        const max = typeof limit === 'number' ? limit : 4;
        const unlockedAll = list.filter(c => days >= c.days);
        const unlocked = max > 0 ? unlockedAll.slice(-max) : unlockedAll;
        const next = list.find(c => c.days > days) || null;
        return { unlocked, next };
    }

    // ------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------
    function validateDateInput(value, now) {
        if (!value) {
            return { ok: false, date: null, error: 'Please select a valid date' };
        }

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return { ok: false, date: null, error: 'Invalid date format' };
        }

        if (date < MIN_DATE) {
            return { ok: false, date: null, error: 'Date cannot be before January 1, 1950' };
        }

        const maxDate = new Date(now || Date.now());
        maxDate.setFullYear(maxDate.getFullYear() + MAX_YEARS_AHEAD);
        if (date > maxDate) {
            return { ok: false, date: null, error: `Date cannot be more than ${MAX_YEARS_AHEAD} years in the future` };
        }

        return { ok: true, date, error: null };
    }

    const RetirementCalc = {
        MS_PER_DAY,
        DEFAULT_RETIREMENT_ISO,
        EMPLOYMENT_START_DATE,
        WORK_HOURS_PER_DAY,
        COMMUTES_PER_WORKDAY,
        COMMUTE_MINUTES_EACH_WAY,
        MEETINGS_PER_WORKDAY,
        ALARMS_PER_WORKDAY,
        MIN_DATE,
        MAX_YEARS_AHEAD,
        COUNTDOWN_MILESTONES,
        COUNTDOWN_CONFETTI_DAYS,
        COUNTUP_MILESTONES,
        COMPARISONS,
        startOfDay,
        addDays,
        addMonthsClamped,
        calendarDaysBetween,
        getMode,
        computeCountdownParts,
        computeElapsedDays,
        computeMonthsDays,
        formatMonthsDays,
        computeWorkweekCounts,
        computeFunMetrics,
        computeProgress,
        progressDescription,
        milestoneStates,
        nextMilestoneProgress,
        crossedMilestone,
        comparisonsUnlocked,
        validateDateInput
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = RetirementCalc;
    }
    if (root) {
        root.RetirementCalc = RetirementCalc;
    }
})(typeof window !== 'undefined' ? window : null);
