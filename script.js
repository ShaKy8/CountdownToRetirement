// Retirement date management
let retirementDate = new Date('2026-01-30T16:00:00');

// Load saved date from localStorage
function loadSavedDate() {
    const savedDate = localStorage.getItem('retirementDate');
    if (savedDate) {
        retirementDate = new Date(savedDate);
        document.getElementById('retirement-date').value = formatDateForInput(retirementDate);
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

// Update retirement date
document.getElementById('update-date').addEventListener('click', () => {
    const newDate = document.getElementById('retirement-date').value;
    retirementDate = new Date(newDate);
    localStorage.setItem('retirementDate', retirementDate.toISOString());
    createConfetti();
    showNotification('🎉 Retirement date updated!');
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

    // Calculate fun metrics
    updateFunMetrics(now, retirementDate, days);

    // Update progress bar
    updateProgress(now, retirementDate);

    // Update thermometer
    updateThermometer(now, retirementDate, days);

    // Update hourglass
    updateHourglass(now, retirementDate);

    // Update milestones
    updateMilestones(days, hours);

    // Update motivation quote
    updateMotivation(days);
}

function updateFunMetrics(now, retirement, days) {
    // Count weekends
    let weekends = 0;
    let workDays = 0;
    let mondays = 0;
    let fridays = 0;

    const currentDate = new Date(now);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate < retirement) {
        const dayOfWeek = currentDate.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            if (dayOfWeek === 6) weekends++; // Count Saturdays as start of weekend
        } else {
            workDays++;
            if (dayOfWeek === 1) mondays++;
            if (dayOfWeek === 5) fridays++;
        }

        currentDate.setDate(currentDate.getDate() + 1);
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

function updateProgress(now, retirement) {
    // Calculate progress from employment start date
    const startDate = new Date('2018-10-01T00:00:00');

    const totalTime = retirement - startDate;
    const elapsed = now - startDate;
    const percentage = Math.max(0, Math.min(100, (elapsed / totalTime) * 100));

    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = percentage.toFixed(1) + '%';

    // Update end date display
    const endDateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('end-date').textContent = retirement.toLocaleDateString('en-US', endDateOptions);

    let description = '';
    if (percentage < 25) {
        description = '🌱 The journey has begun!';
    } else if (percentage < 50) {
        description = '🚶 Making steady progress!';
    } else if (percentage < 75) {
        description = '🏃 More than halfway there!';
    } else if (percentage < 90) {
        description = '🎯 The finish line is in sight!';
    } else {
        description = '🚀 Almost there! So close!';
    }

    document.getElementById('progress-description').textContent = description;
}

function updateThermometer(now, retirement, days) {
    // Calculate progress from start date to retirement
    const startDate = new Date('2018-10-01T00:00:00');
    const totalTime = retirement - startDate;
    const elapsed = now - startDate;
    const percentage = Math.max(0, Math.min(100, (elapsed / totalTime) * 100));

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

function updateHourglass(now, retirement) {
    // Calculate progress from start date to retirement
    const startDate = new Date('2018-10-01T00:00:00');
    const totalTime = retirement - startDate;
    const elapsed = now - startDate;
    const percentage = Math.max(0, Math.min(100, (elapsed / totalTime) * 100));

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

    // Update label with seconds remaining
    const labelElement = document.getElementById('hourglass-label');
    if (labelElement) {
        labelElement.textContent = secondsRemaining.toLocaleString() + ' Seconds Left';
    }

    // Adjust sand stream speed based on remaining time
    const sandStreamElement = document.getElementById('sand-stream');
    if (sandStreamElement && percentage > 0 && percentage < 100) {
        // Show sand stream only when sand is flowing
        sandStreamElement.style.opacity = topPercentage > 0 ? '1' : '0';
    }
}

function updateMilestones(days, hours) {
    // Define all milestones in reverse chronological order (furthest to closest)
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

    const milestonesHTML = allMilestones.map(m => {
        let state = '';
        let displayIcon = '';

        if (days <= m.threshold) {
            // Milestone achieved (passed)
            state = 'achieved';
            displayIcon = '✅';
        } else if (days <= m.threshold + 30 && days > m.threshold) {
            // Currently active milestone (within 30 days of achieving it)
            state = 'active';
            displayIcon = m.icon;
        } else {
            // Locked milestone (future)
            state = 'locked';
            displayIcon = '🔒';
        }

        return `<div class="milestone ${state}" data-threshold="${m.threshold}">
            <div class="milestone-icon-wrapper">
                <span class="milestone-icon">${displayIcon}</span>
                <span class="milestone-emoji">${m.emoji}</span>
            </div>
            <span class="milestone-text">${m.text}</span>
            <span class="milestone-days">${m.threshold} days</span>
        </div>`;
    }).join('');

    document.getElementById('milestones').innerHTML = milestonesHTML;
}

function updateMotivation(days) {
    const quotes = [
        "🌟 Every day brings you closer to your dream!",
        "💪 You've worked hard for this moment!",
        "🎉 The best is yet to come!",
        "🏖️ Soon you'll have all the time in the world!",
        "✨ Freedom is just around the corner!",
        "🌅 New adventures await!",
        "🎊 Your well-deserved break is coming!",
        "🦋 Get ready to spread your wings!",
        "🌴 Paradise is calling your name!",
        "🎯 You're crushing this countdown!"
    ];

    const quoteIndex = Math.floor(Date.now() / 10000) % quotes.length;
    document.getElementById('motivation-quote').textContent = quotes[quoteIndex];
}

function resetCountdown() {
    localStorage.removeItem('retirementDate');
    location.reload();
}

function celebrateRetirement() {
    document.body.innerHTML = `
        <div class="celebration">
            <h1 class="celebration-title">🎉🎊 CONGRATULATIONS! 🎊🎉</h1>
            <h2 class="celebration-subtitle">YOU'RE OFFICIALLY RETIRED!</h2>
            <p class="celebration-message">Welcome to the best chapter of your life! 🏖️</p>
            <div class="celebration-emoji">🥳🍾🎈🌟✨🎆</div>
            <button class="reset-button" onclick="resetCountdown()">Back to Countdown</button>
        </div>
        <div id="confetti-container"></div>
    `;

    // Create massive confetti
    setInterval(() => createConfetti(), 300);
}

// Confetti animation
function createConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3', '#54a0ff'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        container.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
    }
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Create animated stars background
function createStars() {
    const starsContainer = document.querySelector('.stars');
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
setInterval(updateCountdown, 1000);

// Celebrate milestones with confetti
let lastDays = null;
setInterval(() => {
    const days = Math.floor((retirementDate - new Date()) / (1000 * 60 * 60 * 24));
    if (lastDays !== null && days !== lastDays && (days === 100 || days === 50 || days === 30 || days === 7 || days === 1)) {
        createConfetti();
        showNotification(`🎉 Milestone: ${days} days remaining!`);
    }
    lastDays = days;
}, 1000);
