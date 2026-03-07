// Freedom Counter - Counting UP from retirement!
const RETIREMENT_DATE = new Date('2026-02-27T16:00:00');

// Shared constants
const MAX_CONFETTI_ELEMENTS = 200;
const FIRST_YEAR_MS = 365.25 * 24 * 60 * 60 * 1000; // First year as progress reference

// Store interval references for cleanup
let countUpInterval = null;
let milestoneCheckInterval = null;

// Count-up calculations
function updateCountUp() {
    const now = new Date();
    const diff = now - RETIREMENT_DATE;

    if (diff < 0) {
        showPreRetirementMessage();
        return;
    }

    // Calculate time units
    const totalSeconds = Math.floor(diff / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);

    // Update main counter
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = totalHours % 24;
    document.getElementById('minutes').textContent = totalMinutes % 60;
    document.getElementById('seconds').textContent = totalSeconds % 60;

    // Update alternate views
    document.getElementById('months').textContent = months;
    document.getElementById('weeks').textContent = weeks;
    document.getElementById('total-hours').textContent = totalHours.toLocaleString();

    // Calculate fun metrics
    updateFunMetrics(RETIREMENT_DATE, now, days);

    // Calculate progress (first year as reference window)
    const progressData = calculateProgress(now);

    // Update progress bar
    updateProgress(progressData, days);

    // Update thermometer
    updateThermometer(progressData, days);

    // Update hourglass
    updateHourglass(progressData);

    // Update milestones (only when days change)
    updateMilestones(days);

    // Update motivation quote
    updateMotivation(days);
}

// Progress calculation - uses a rolling year window
function calculateProgress(now) {
    const elapsed = now - RETIREMENT_DATE;
    // Progress within current year of freedom (resets each year)
    const yearProgress = (elapsed % FIRST_YEAR_MS) / FIRST_YEAR_MS;
    const totalYears = elapsed / FIRST_YEAR_MS;
    const percentage = Math.min(100, yearProgress * 100);
    return { elapsed, percentage, totalYears };
}

// Fun metrics: count up from retirement
function updateFunMetrics(retirementStart, now, days) {
    const startDate = new Date(retirementStart);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(0, 0, 0, 0);

    const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
        document.getElementById('weekends').textContent = '0';
        document.getElementById('work-days').textContent = '0';
        document.getElementById('work-hours').textContent = '0';
        document.getElementById('sleeps').textContent = '0';
        document.getElementById('sunrises').textContent = '0';
        document.getElementById('mondays').textContent = '0';
        document.getElementById('fridays').textContent = '0';
        return;
    }

    // Calculate full weeks and remaining days
    const fullWeeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;

    // Base counts from full weeks
    let weekends = fullWeeks;
    let workDays = fullWeeks * 5;
    let mondays = fullWeeks;
    let fridays = fullWeeks;

    // Count remaining days
    const startDayOfWeek = startDate.getDay();
    for (let i = 0; i < remainingDays; i++) {
        const dayOfWeek = (startDayOfWeek + i) % 7;
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            if (dayOfWeek === 6) weekends++;
        } else {
            workDays++;
            if (dayOfWeek === 1) mondays++;
            if (dayOfWeek === 5) fridays++;
        }
    }

    // Calculate work hours skipped (8 hours per work day)
    const workHours = workDays * 8;

    document.getElementById('weekends').textContent = weekends;
    document.getElementById('work-days').textContent = workDays.toLocaleString();
    document.getElementById('work-hours').textContent = workHours.toLocaleString();
    document.getElementById('sleeps').textContent = days;
    document.getElementById('sunrises').textContent = days + 1;
    document.getElementById('mondays').textContent = mondays;
    document.getElementById('fridays').textContent = fridays;
}

function updateProgress(progressData, days) {
    const { percentage } = progressData;

    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = days + ' days free';

    // Update ARIA progressbar value
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.setAttribute('aria-valuenow', Math.round(percentage));
    }

    let description = '';
    if (days < 7) {
        description = 'The adventure has just begun!';
    } else if (days < 30) {
        description = 'Getting the hang of this freedom thing!';
    } else if (days < 100) {
        description = 'Living the dream, one day at a time!';
    } else if (days < 365) {
        description = 'A seasoned retiree in the making!';
    } else {
        description = 'A full year of freedom and counting!';
    }

    document.getElementById('progress-description').textContent = description;
}

function updateThermometer(progressData, days) {
    const { percentage } = progressData;

    const liquidElement = document.getElementById('thermometer-liquid');
    if (liquidElement) {
        liquidElement.style.height = percentage + '%';
    }

    const daysElement = document.getElementById('thermometer-days');
    if (daysElement) {
        daysElement.textContent = days;
    }
}

function updateHourglass(progressData) {
    const { percentage } = progressData;

    // Bottom sand fills as freedom accumulates
    const sandBottomElement = document.getElementById('sand-bottom');
    if (sandBottomElement) {
        sandBottomElement.style.height = percentage + '%';
    }

    // Top sand depletes (within the year cycle)
    const sandTopElement = document.getElementById('sand-top');
    if (sandTopElement) {
        sandTopElement.style.height = (100 - percentage) + '%';
    }

    // Update label
    const labelElement = document.getElementById('hourglass-label');
    if (labelElement) {
        labelElement.textContent = 'Freedom!';
    }

    // Sand stream visibility
    const sandStreamElement = document.getElementById('sand-stream');
    if (sandStreamElement) {
        sandStreamElement.style.opacity = '1';
    }
}

// Cache for milestone DOM to avoid rebuilding every second
let lastMilestoneDays = null;

function updateMilestones(days) {
    if (days === lastMilestoneDays) return;
    lastMilestoneDays = days;

    const allMilestones = [
        { threshold: 1, icon: '🎯', text: 'Day One of Freedom', emoji: '🎉' },
        { threshold: 7, icon: '⭐', text: 'First Week Free', emoji: '🌟' },
        { threshold: 30, icon: '🎪', text: 'One Month Retired', emoji: '📆' },
        { threshold: 100, icon: '💯', text: '100 Days of Freedom', emoji: '🎊' },
        { threshold: 180, icon: '🌸', text: 'Half Year Free', emoji: '⏳' },
        { threshold: 365, icon: '🎆', text: 'One Year Retired!', emoji: '🗓️' },
        { threshold: 500, icon: '🌍', text: '500 Days Free', emoji: '🚀' },
        { threshold: 730, icon: '🔥', text: 'Two Years Retired!', emoji: '🎯' }
    ];

    const container = document.getElementById('milestones');
    container.textContent = '';

    allMilestones.forEach(m => {
        let state = '';
        let displayIcon = '';
        let stateLabel = '';

        if (days >= m.threshold) {
            state = 'achieved';
            displayIcon = '✅';
            stateLabel = 'Achieved';
        } else if (days >= m.threshold - 30 && days < m.threshold) {
            state = 'active';
            displayIcon = m.icon;
            stateLabel = 'Coming soon';
        } else {
            state = 'locked';
            displayIcon = '🔒';
            stateLabel = 'Upcoming';
        }

        const milestone = document.createElement('div');
        milestone.className = `milestone ${state}`;
        milestone.dataset.threshold = m.threshold;
        milestone.setAttribute('role', 'article');
        milestone.setAttribute('aria-label', `${m.text}, ${m.threshold} days. Status: ${stateLabel}`);

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'milestone-icon-wrapper';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'milestone-icon';
        iconSpan.setAttribute('aria-hidden', 'true');
        iconSpan.textContent = displayIcon;

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
        daysSpan.textContent = m.threshold + ' days';

        milestone.appendChild(iconWrapper);
        milestone.appendChild(textSpan);
        milestone.appendChild(daysSpan);

        container.appendChild(milestone);
    });
}

function updateMotivation(days) {
    const quotes = [
        "Every day of freedom is a gift you gave yourself!",
        "Retirement: where every hour is happy hour!",
        "No alarm clocks, no deadlines, just sunshine!",
        "Living proof that patience pays off!",
        "The best chapter of your life is being written right now!",
        "Trading emails for adventures, one day at a time!",
        "Remember when you used to count DOWN? Look at you now!",
        "Retired and loving every single second of it!",
        "Your only meeting today: with happiness!",
        "Freedom looks good on you!"
    ];

    const quoteIndex = Math.floor(Date.now() / 10000) % quotes.length;
    document.getElementById('motivation-quote').textContent = quotes[quoteIndex];
}

function showPreRetirementMessage() {
    document.getElementById('days').textContent = '0';
    document.getElementById('hours').textContent = '0';
    document.getElementById('minutes').textContent = '0';
    document.getElementById('seconds').textContent = '0';
    document.getElementById('progress-description').textContent = 'Retirement hasn\'t started yet! Hang in there!';
}

// Confetti animation with element limit
function createConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;

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

// Initialize
createStars();
updateCountUp();
countUpInterval = setInterval(updateCountUp, 1000);

// Celebrate milestones with confetti
let lastDays = null;
const milestoneDays = [1, 7, 30, 100, 180, 365, 500, 730];
milestoneCheckInterval = setInterval(() => {
    const days = Math.floor((new Date() - RETIREMENT_DATE) / (1000 * 60 * 60 * 24));
    if (lastDays !== null && days !== lastDays && milestoneDays.includes(days)) {
        createConfetti();
        showNotification(`Milestone: ${days} days of freedom!`);
    }
    lastDays = days;
}, 1000);
