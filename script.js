// Retirement date management
let retirementDate = new Date('2026-02-27T16:00:00');

// Shared constants to avoid duplication
const EMPLOYMENT_START_DATE = new Date('2018-10-01T00:00:00');
const MAX_CONFETTI_ELEMENTS = 200;
const CELEBRATION_CONFETTI_DURATION = 30000; // Stop confetti after 30 seconds

// Store interval references for cleanup
let countdownInterval = null;
let milestoneInterval = null;
let celebrationConfettiInterval = null;

// Load saved date from localStorage with error handling
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
            document.getElementById('retirement-date').value = formatDateForInput(retirementDate);
        }
    } catch (error) {
        console.warn('Unable to access localStorage:', error);
        showNotification('Unable to load saved date');
    }
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
document.getElementById('update-date').addEventListener('click', () => {
    const newDateValue = document.getElementById('retirement-date').value;

    // Validate input is not empty
    if (!newDateValue) {
        showNotification('Please select a valid date');
        return;
    }

    const newDate = new Date(newDateValue);

    // Validate date is valid
    if (isNaN(newDate.getTime())) {
        showNotification('Invalid date format');
        return;
    }

    // Validate date is in the future
    const now = new Date();
    if (newDate <= now) {
        showNotification('Retirement date must be in the future');
        return;
    }

    // Validate date is not too far in the future (50 years max)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 50);
    if (newDate > maxDate) {
        showNotification('Date cannot be more than 50 years in the future');
        return;
    }

    retirementDate = newDate;

    // Save to localStorage with error handling
    try {
        localStorage.setItem('retirementDate', retirementDate.toISOString());
    } catch (error) {
        console.warn('Unable to save to localStorage:', error);
        showNotification('Date updated but could not be saved');
    }

    createConfetti();
    showNotification('Retirement date updated!');
    updateCountdown();
});

// Countdown calculations
function updateCountdown() {
    const now = new Date();
    const diff = retirementDate - now;

    if (diff <= 0) {
        celebrateRetirement();
        return;
    }

    // Calculate time units
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);

    // Update main countdown
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours % 24;
    document.getElementById('minutes').textContent = minutes % 60;
    document.getElementById('seconds').textContent = seconds % 60;

    // Update alternate views
    document.getElementById('months').textContent = months;
    document.getElementById('weeks').textContent = weeks;
    document.getElementById('total-hours').textContent = hours.toLocaleString();

    // Calculate fun metrics (optimized - no loop)
    updateFunMetrics(now, retirementDate, days);

    // Calculate shared progress values once
    const progressData = calculateProgress(now, retirementDate);

    // Update progress bar
    updateProgress(progressData);

    // Update thermometer
    updateThermometer(progressData, days);

    // Update hourglass
    updateHourglass(progressData, now, retirementDate);

    // Update milestones (only when days change)
    updateMilestones(days);

    // Update motivation quote
    updateMotivation(days);
}

// Shared progress calculation to avoid duplication
function calculateProgress(now, retirement) {
    const totalTime = retirement - EMPLOYMENT_START_DATE;
    const elapsed = now - EMPLOYMENT_START_DATE;
    const percentage = Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
    return { totalTime, elapsed, percentage };
}

// Optimized fun metrics calculation using math instead of loops
function updateFunMetrics(now, retirement, days) {
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(retirement);
    endDate.setHours(0, 0, 0, 0);

    // Calculate total days
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

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
    let weekends = fullWeeks; // Each full week has 1 weekend (Saturday)
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

    // Calculate work hours (8 hours per work day)
    const workHours = workDays * 8;

    document.getElementById('weekends').textContent = weekends;
    document.getElementById('work-days').textContent = workDays.toLocaleString();
    document.getElementById('work-hours').textContent = workHours.toLocaleString();
    document.getElementById('sleeps').textContent = days;
    document.getElementById('sunrises').textContent = days + 1;
    document.getElementById('mondays').textContent = mondays;
    document.getElementById('fridays').textContent = fridays;
}

function updateProgress(progressData) {
    const { percentage } = progressData;

    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = percentage.toFixed(1) + '%';

    // Update ARIA progressbar value
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.setAttribute('aria-valuenow', Math.round(percentage));
    }

    // Update end date display
    const endDateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('end-date').textContent = retirementDate.toLocaleDateString('en-US', endDateOptions);

    let description = '';
    if (percentage < 25) {
        description = 'The journey has begun!';
    } else if (percentage < 50) {
        description = 'Making steady progress!';
    } else if (percentage < 75) {
        description = 'More than halfway there!';
    } else if (percentage < 90) {
        description = 'The finish line is in sight!';
    } else {
        description = 'Almost there! So close!';
    }

    document.getElementById('progress-description').textContent = description;
}

function updateThermometer(progressData, days) {
    const { percentage } = progressData;

    // Update thermometer liquid height
    const liquidElement = document.getElementById('thermometer-liquid');
    if (liquidElement) {
        liquidElement.style.height = percentage + '%';
    }

    // Update days counter in bulb
    const daysElement = document.getElementById('thermometer-days');
    if (daysElement) {
        daysElement.textContent = days;
    }
}

function updateHourglass(progressData, now, retirement) {
    const { percentage } = progressData;

    // Invert percentage for top sand (starts full, ends empty)
    const topPercentage = 100 - percentage;

    // Calculate seconds remaining
    const diff = retirement - now;
    const secondsRemaining = Math.max(0, Math.floor(diff / 1000));

    // Update top sand level (empties as time passes)
    const sandTopElement = document.getElementById('sand-top');
    if (sandTopElement) {
        sandTopElement.style.height = topPercentage + '%';
    }

    // Update bottom sand level (fills as time passes)
    const sandBottomElement = document.getElementById('sand-bottom');
    if (sandBottomElement) {
        sandBottomElement.style.height = percentage + '%';
    }

    // Update label with percentage complete
    const labelElement = document.getElementById('hourglass-label');
    if (labelElement) {
        labelElement.textContent = percentage.toFixed(1) + '% Complete';
    }

    // Adjust sand stream visibility
    const sandStreamElement = document.getElementById('sand-stream');
    if (sandStreamElement && percentage > 0 && percentage < 100) {
        sandStreamElement.style.opacity = topPercentage > 0 ? '1' : '0';
    }
}

// Cache for milestone DOM to avoid rebuilding every second
let lastMilestoneDays = null;

function updateMilestones(days) {
    // Only rebuild if days changed
    if (days === lastMilestoneDays) return;
    lastMilestoneDays = days;

    const allMilestones = [
        { threshold: 730, icon: '🎯', text: '2 Years to Go', emoji: '📅' },
        { threshold: 365, icon: '🎆', text: 'One Year Left', emoji: '🗓️' },
        { threshold: 180, icon: '🌸', text: '6 Months Away', emoji: '⏳' },
        { threshold: 100, icon: '💯', text: 'Double Digits', emoji: '🎊' },
        { threshold: 50, icon: '⚡', text: '50 Days Left', emoji: '🎉' },
        { threshold: 30, icon: '🎪', text: 'One Month', emoji: '📆' },
        { threshold: 7, icon: '⭐', text: 'Final Week', emoji: '🎯' },
        { threshold: 1, icon: '🔥', text: 'LAST DAY!', emoji: '🚀' }
    ];

    const container = document.getElementById('milestones');
    container.textContent = ''; // Clear safely

    allMilestones.forEach(m => {
        let state = '';
        let displayIcon = '';
        let stateLabel = '';

        if (days <= m.threshold) {
            state = 'achieved';
            displayIcon = '✅';
            stateLabel = 'Completed';
        } else if (days <= m.threshold + 30 && days > m.threshold) {
            state = 'active';
            displayIcon = m.icon;
            stateLabel = 'In progress';
        } else {
            state = 'locked';
            displayIcon = '🔒';
            stateLabel = 'Upcoming';
        }

        // Create elements safely (no innerHTML XSS risk)
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

    const quoteIndex = Math.floor(Date.now() / 10000) % quotes.length;
    document.getElementById('motivation-quote').textContent = quotes[quoteIndex];
}

function resetCountdown() {
    // Clear any running intervals
    clearAllIntervals();

    try {
        localStorage.removeItem('retirementDate');
    } catch (error) {
        console.warn('Unable to clear localStorage:', error);
    }
    location.reload();
}

function clearAllIntervals() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (milestoneInterval) clearInterval(milestoneInterval);
    if (celebrationConfettiInterval) clearInterval(celebrationConfettiInterval);
}

function celebrateRetirement() {
    // Clear existing intervals
    clearAllIntervals();

    // Create celebration screen safely (no innerHTML XSS)
    document.body.textContent = '';

    const celebration = document.createElement('main');
    celebration.className = 'celebration';
    celebration.setAttribute('role', 'main');

    const title = document.createElement('h1');
    title.className = 'celebration-title';
    title.textContent = 'CONGRATULATIONS!';

    const subtitle = document.createElement('h2');
    subtitle.className = 'celebration-subtitle';
    subtitle.textContent = "YOU'RE OFFICIALLY RETIRED!";

    const message = document.createElement('p');
    message.className = 'celebration-message';
    message.textContent = 'Welcome to the best chapter of your life!';

    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'celebration-emoji';
    emojiDiv.setAttribute('aria-hidden', 'true');
    emojiDiv.textContent = '🥳🍾🎈🌟✨🎆';

    const resetButton = document.createElement('button');
    resetButton.className = 'reset-button';
    resetButton.textContent = 'Back to Countdown';
    resetButton.addEventListener('click', resetCountdown);

    celebration.appendChild(title);
    celebration.appendChild(subtitle);
    celebration.appendChild(message);
    celebration.appendChild(emojiDiv);
    celebration.appendChild(resetButton);

    const confettiContainer = document.createElement('div');
    confettiContainer.id = 'confetti-container';
    confettiContainer.setAttribute('aria-hidden', 'true');

    document.body.appendChild(celebration);
    document.body.appendChild(confettiContainer);

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.className = 'sr-only';
    announcement.textContent = 'Congratulations! You are officially retired!';
    document.body.appendChild(announcement);

    // Create confetti with automatic stop after 30 seconds
    celebrationConfettiInterval = setInterval(() => createConfetti(), 300);

    setTimeout(() => {
        if (celebrationConfettiInterval) {
            clearInterval(celebrationConfettiInterval);
            celebrationConfettiInterval = null;
        }
    }, CELEBRATION_CONFETTI_DURATION);
}

// Confetti animation with element limit
function createConfetti() {
    const container = document.getElementById('confetti-container');
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

// Initialize
loadSavedDate();
createStars();
updateCountdown();
countdownInterval = setInterval(updateCountdown, 1000);

// Celebrate milestones with confetti
let lastDays = null;
milestoneInterval = setInterval(() => {
    const days = Math.floor((retirementDate - new Date()) / (1000 * 60 * 60 * 24));
    if (lastDays !== null && days !== lastDays && (days === 100 || days === 50 || days === 30 || days === 7 || days === 1)) {
        createConfetti();
        showNotification(`Milestone: ${days} days remaining!`);
    }
    lastDays = days;
}, 1000);
