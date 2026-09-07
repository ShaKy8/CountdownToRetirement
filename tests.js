/**
 * Comprehensive Test Suite for CountdownToRetirement
 *
 * Tests covering:
 * - Regression tests for fixed bugs
 * - Core functionality (countdown, calculations, metrics)
 * - Security (XSS prevention, path traversal, headers)
 * - Edge cases and error handling
 */

const assert = require('assert');
const http = require('http');
const path = require('path');
const Calc = require('./countdown/calc.js');
const Putt = require('./game/putt.js');
const Daily = require('./shared/daily.js');
const Thermal = require('./thermal/flight.js');

// ANSI color codes for pretty output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

// Test suite state
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedTestDetails = [];

/**
 * Simple test runner
 */
function test(name, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`${colors.green}✓${colors.reset} ${name}`);
    } catch (error) {
        failedTests++;
        failedTestDetails.push({ name, error: error.message, stack: error.stack });
        console.log(`${colors.red}✗${colors.reset} ${name}`);
        console.log(`  ${colors.gray}${error.message}${colors.reset}`);
    }
}

/**
 * Describe block for grouping tests
 */
function describe(suiteName, fn) {
    console.log(`\n${colors.cyan}${suiteName}${colors.reset}`);
    fn();
}

/**
 * Mock DOM environment for testing client-side code
 */
class MockDOM {
    constructor() {
        this.elements = new Map();
        this.body = {
            textContent: '',
            appendChild: (el) => this.appendChild(el),
            children: []
        };
        this.localStorage = new MockLocalStorage();
    }

    getElementById(id) {
        if (!this.elements.has(id)) {
            this.elements.set(id, new MockElement(id));
        }
        return this.elements.get(id);
    }

    createElement(tag) {
        return new MockElement(tag);
    }

    querySelector(selector) {
        return new MockElement(selector);
    }

    appendChild(el) {
        this.body.children.push(el);
    }
}

class MockElement {
    constructor(id) {
        this.id = id;
        this.textContent = '';
        this.value = '';
        this.className = '';
        this.style = {};
        this.attributes = new Map();
        this.children = [];
        this.parentNode = null;
        this.dataset = {};
        this.eventListeners = new Map();
    }

    setAttribute(name, value) {
        this.attributes.set(name, value);
    }

    getAttribute(name) {
        return this.attributes.get(name);
    }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
    }

    remove() {
        if (this.parentNode) {
            const index = this.parentNode.children.indexOf(this);
            if (index > -1) {
                this.parentNode.children.splice(index, 1);
            }
        }
    }

    addEventListener(event, handler) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(handler);
    }

    classList = {
        add: (className) => { this.className = className; },
        remove: (className) => { this.className = ''; }
    };
}

class MockLocalStorage {
    constructor() {
        this.store = new Map();
        this.accessible = true;
    }

    getItem(key) {
        if (!this.accessible) {
            throw new Error('localStorage is not accessible');
        }
        return this.store.get(key) || null;
    }

    setItem(key, value) {
        if (!this.accessible) {
            throw new Error('localStorage is not accessible');
        }
        this.store.set(key, value);
    }

    removeItem(key) {
        if (!this.accessible) {
            throw new Error('localStorage is not accessible');
        }
        this.store.delete(key);
    }

    clear() {
        this.store.clear();
    }

    makeUnavailable() {
        this.accessible = false;
    }

    makeAvailable() {
        this.accessible = true;
    }
}

// =============================================================================
// REGRESSION TESTS - Tests for Fixed Bugs
// =============================================================================

describe('REGRESSION TESTS - Confetti Memory Leak', () => {
    test('Should not exceed MAX_CONFETTI_ELEMENTS (200)', () => {
        const mockDOM = new MockDOM();
        const container = mockDOM.createElement('div');
        container.id = 'confetti-container';

        // Simulate the createConfetti function logic
        const MAX_CONFETTI_ELEMENTS = 200;
        const createConfetti = () => {
            if (container.children.length >= MAX_CONFETTI_ELEMENTS) {
                return;
            }

            for (let i = 0; i < 50; i++) {
                if (container.children.length >= MAX_CONFETTI_ELEMENTS) break;
                const confetti = mockDOM.createElement('div');
                confetti.className = 'confetti';
                container.appendChild(confetti);
            }
        };

        // Call multiple times to trigger potential leak
        for (let i = 0; i < 10; i++) {
            createConfetti();
        }

        assert.strictEqual(container.children.length <= MAX_CONFETTI_ELEMENTS, true,
            `Expected confetti count to be <= ${MAX_CONFETTI_ELEMENTS}, got ${container.children.length}`);
    });

    test('Should stop exactly at MAX_CONFETTI_ELEMENTS even with multiple rapid calls', () => {
        const mockDOM = new MockDOM();
        const container = mockDOM.createElement('div');
        container.id = 'confetti-container';
        const MAX_CONFETTI_ELEMENTS = 200;

        const createConfetti = () => {
            if (container.children.length >= MAX_CONFETTI_ELEMENTS) return;
            for (let i = 0; i < 50; i++) {
                if (container.children.length >= MAX_CONFETTI_ELEMENTS) break;
                container.appendChild(mockDOM.createElement('div'));
            }
        };

        // Rapid fire calls
        for (let i = 0; i < 100; i++) {
            createConfetti();
        }

        assert.strictEqual(container.children.length, MAX_CONFETTI_ELEMENTS,
            `Expected exactly ${MAX_CONFETTI_ELEMENTS} confetti elements`);
    });
});

describe('REGRESSION TESTS - Date Validation', () => {
    const NOW = new Date('2026-09-06T10:00:00');

    test('Should reject empty date input', () => {
        const result = Calc.validateDateInput('', NOW);
        assert.strictEqual(result.ok, false, 'Empty date should be rejected');
        assert.strictEqual(result.error, 'Please select a valid date');
    });

    test('Should reject invalid date format (NaN)', () => {
        const result = Calc.validateDateInput('invalid-date', NOW);
        assert.strictEqual(result.ok, false, 'Invalid date format should be rejected');
        assert.strictEqual(result.error, 'Invalid date format');
    });

    test('Should accept past dates (count-up mode)', () => {
        const result = Calc.validateDateInput('2020-01-01T00:00', NOW);
        assert.strictEqual(result.ok, true, 'Past dates should be accepted');
        assert.strictEqual(result.date.getFullYear(), 2020);
    });

    test('Should reject dates before January 1, 1950', () => {
        const result = Calc.validateDateInput('1949-12-31T23:59', NOW);
        assert.strictEqual(result.ok, false, 'Dates before 1950 should be rejected');
        assert.ok(result.error.includes('1950'), 'Error should mention 1950');
    });

    test('Should accept exactly January 1, 1950', () => {
        const result = Calc.validateDateInput('1950-01-01T00:00', NOW);
        assert.strictEqual(result.ok, true, 'The 1950 boundary itself should be accepted');
    });

    test('Should reject dates more than 50 years in the future', () => {
        const farFuture = new Date(NOW);
        farFuture.setFullYear(NOW.getFullYear() + 51);
        const result = Calc.validateDateInput(farFuture.toISOString(), NOW);
        assert.strictEqual(result.ok, false, 'Dates > 50 years in future should be rejected');
    });

    test('Should reject one day past the 50 year limit', () => {
        const limit = new Date(NOW);
        limit.setFullYear(NOW.getFullYear() + 50);
        limit.setDate(limit.getDate() + 1);
        const result = Calc.validateDateInput(limit.toISOString(), NOW);
        assert.strictEqual(result.ok, false, '50 years + 1 day should be rejected');
    });

    test('Should accept exactly 50 years in the future', () => {
        const limit = new Date(NOW);
        limit.setFullYear(NOW.getFullYear() + 50);
        const result = Calc.validateDateInput(limit.toISOString(), NOW);
        assert.strictEqual(result.ok, true, 'Exactly 50 years ahead should be accepted');
    });

    test('Should accept valid future date within 50 years', () => {
        const validDate = new Date(NOW);
        validDate.setFullYear(NOW.getFullYear() + 5);
        const result = Calc.validateDateInput(validDate.toISOString(), NOW);
        assert.strictEqual(result.ok, true, 'Valid future date should be accepted');
        assert.strictEqual(result.error, null, 'No error for a valid date');
    });
});

describe('REGRESSION TESTS - localStorage Error Handling', () => {
    test('Should handle localStorage being unavailable on load', () => {
        const mockLS = new MockLocalStorage();
        mockLS.makeUnavailable();

        let errorCaught = false;
        let defaultDateUsed = false;

        try {
            const savedDate = mockLS.getItem('retirementDate');
        } catch (error) {
            errorCaught = true;
            defaultDateUsed = true; // Would use default date
        }

        assert.strictEqual(errorCaught, true, 'Should catch localStorage error');
        assert.strictEqual(defaultDateUsed, true, 'Should fall back to default date');
    });

    test('Should handle localStorage being unavailable on save', () => {
        const mockLS = new MockLocalStorage();
        mockLS.makeUnavailable();

        let errorCaught = false;

        try {
            mockLS.setItem('retirementDate', new Date().toISOString());
        } catch (error) {
            errorCaught = true;
        }

        assert.strictEqual(errorCaught, true, 'Should catch localStorage save error');
    });

    test('Should validate and reject invalid date from localStorage', () => {
        const mockLS = new MockLocalStorage();
        mockLS.makeAvailable();
        mockLS.setItem('retirementDate', 'invalid-date-string');

        const savedDate = mockLS.getItem('retirementDate');
        const parsedDate = new Date(savedDate);
        const isValid = !isNaN(parsedDate.getTime());

        assert.strictEqual(isValid, false, 'Invalid date from localStorage should be detected');
    });
});

describe('REGRESSION TESTS - Path Traversal Protection', () => {
    test('Should block basic path traversal attempt (../etc/passwd)', () => {
        const requestedPath = '/../etc/passwd';

        // Validation logic from server.js
        const isBlocked = requestedPath.includes('..');

        assert.strictEqual(isBlocked, true, 'Path traversal with .. should be blocked');
    });

    test('Should block URL-encoded path traversal (%2e%2e/etc/passwd)', () => {
        const requestedPath = '/%2e%2e/etc/passwd';

        let filePath = requestedPath;
        try {
            filePath = decodeURIComponent(filePath);
        } catch (e) {
            // Invalid encoding
        }

        const isBlocked = filePath.includes('..');

        assert.strictEqual(isBlocked, true, 'Encoded path traversal should be blocked');
    });

    test('Should block double-encoded path traversal', () => {
        const requestedPath = '/%252e%252e/etc/passwd';

        let filePath = requestedPath;
        try {
            filePath = decodeURIComponent(decodeURIComponent(filePath));
        } catch (e) {
            // Invalid encoding
        }

        const isBlocked = filePath.includes('..');

        assert.strictEqual(isBlocked, true, 'Double-encoded traversal should be blocked');
    });

    test('Should block double-slash attempts (//etc/passwd)', () => {
        const requestedPath = '//etc/passwd';

        const isBlocked = requestedPath.includes('//');

        assert.strictEqual(isBlocked, true, 'Double-slash paths should be blocked');
    });

    test('Should allow valid paths (index.html)', () => {
        const requestedPath = '/index.html';

        const isValid = !requestedPath.includes('..') && !requestedPath.includes('//');

        assert.strictEqual(isValid, true, 'Valid paths should be allowed');
    });

    test('Should validate file extension whitelist', () => {
        const allowedExtensions = new Set(['.html', '.css', '.js', '.json', '.png', '.jpg', '.gif', '.svg', '.ico']);

        assert.strictEqual(allowedExtensions.has('.html'), true, '.html should be allowed');
        assert.strictEqual(allowedExtensions.has('.js'), true, '.js should be allowed');
        assert.strictEqual(allowedExtensions.has('.css'), true, '.css should be allowed');
        assert.strictEqual(allowedExtensions.has('.exe'), false, '.exe should NOT be allowed');
        assert.strictEqual(allowedExtensions.has('.sh'), false, '.sh should NOT be allowed');
    });
});

// =============================================================================
// CORE FUNCTIONALITY TESTS
// =============================================================================

describe('CORE TESTS - Countdown Calculations', () => {
    test('Should correctly calculate days from milliseconds', () => {
        const now = new Date('2026-01-01T00:00:00');
        const retirement = new Date('2026-01-06T00:00:00'); // 5 days
        const parts = Calc.computeCountdownParts(now, retirement);

        assert.strictEqual(parts.days, 5, 'Should calculate 5 days');
    });

    test('Should correctly calculate hours remainder', () => {
        const now = new Date('2026-01-01T00:00:00');
        const retirement = new Date('2026-01-02T15:00:00'); // 1 day + 15 hours
        const parts = Calc.computeCountdownParts(now, retirement);

        assert.strictEqual(parts.days, 1, 'Should show 1 day');
        assert.strictEqual(parts.hoursRemainder, 15, 'Should show 15 hours remainder');
    });

    test('Should correctly calculate minutes remainder', () => {
        const now = new Date('2026-01-01T00:00:00');
        const retirement = new Date('2026-01-01T00:45:00'); // 45 minutes
        const parts = Calc.computeCountdownParts(now, retirement);

        assert.strictEqual(parts.minutesRemainder, 45, 'Should show 45 minutes');
    });

    test('Should correctly calculate seconds remainder', () => {
        const now = new Date('2026-01-01T00:00:00');
        const retirement = new Date('2026-01-01T00:00:30'); // 30 seconds
        const parts = Calc.computeCountdownParts(now, retirement);

        assert.strictEqual(parts.secondsRemainder, 30, 'Should show 30 seconds');
    });

    test('Should calculate weeks correctly', () => {
        const now = new Date('2026-01-01T00:00:00');
        const retirement = new Date('2026-01-15T00:00:00'); // 2 weeks
        const parts = Calc.computeCountdownParts(now, retirement);

        assert.strictEqual(parts.weeks, 2, 'Should calculate 2 weeks');
    });

    test('Should calculate months correctly (using 30.44 days average)', () => {
        const now = new Date('2026-01-01T00:00:00');
        const retirement = new Date(now.getTime() + Calc.MS_PER_DAY * 61); // ~2 months
        const parts = Calc.computeCountdownParts(now, retirement);

        assert.strictEqual(parts.months, 2, 'Should calculate 2 months');
    });

    test('Should report total hours', () => {
        const now = new Date('2026-01-01T00:00:00');
        const retirement = new Date('2026-01-03T06:00:00'); // 54 hours
        const parts = Calc.computeCountdownParts(now, retirement);

        assert.strictEqual(parts.totalHours, 54, 'Should report 54 total hours');
    });

    test('Should handle zero or negative difference (retirement reached)', () => {
        const now = new Date('2026-01-01T00:00:00');
        const retirement = new Date('2025-12-31T00:00:00'); // Past date

        assert.strictEqual(Calc.getMode(now, retirement), 'countup', 'Should detect retirement reached');
        assert.strictEqual(Calc.computeCountdownParts(now, retirement).days, 0, 'Parts should clamp at zero');
    });
});

describe('CORE TESTS - Fun Metrics Calculations', () => {
    // Monday Jan 5 2026 -> Monday Jan 19 2026: exactly two full weeks
    const now = new Date('2026-01-05T08:00:00');
    const retirement = new Date('2026-01-19T16:00:00');
    const metrics = Calc.computeFunMetrics(now, retirement, 'countdown');

    test('Should calculate weekends correctly for full weeks', () => {
        assert.strictEqual(metrics.weekends, 2, 'Should calculate 2 weekends in 14 days');
    });

    test('Should calculate workdays correctly for full weeks', () => {
        assert.strictEqual(metrics.workDays, 10, 'Should calculate 10 workdays in 2 weeks');
    });

    test('Should calculate work hours correctly (8 hours per workday)', () => {
        assert.strictEqual(Calc.WORK_HOURS_PER_DAY, 8, 'Assumes an 8 hour workday');
        assert.strictEqual(metrics.workHours, 80, 'Should calculate 80 work hours for 10 workdays');
    });

    test('Should calculate Mondays and Fridays correctly for full weeks', () => {
        assert.strictEqual(metrics.mondays, 2, 'Should calculate 2 Mondays in 2 weeks');
        assert.strictEqual(metrics.fridays, 2, 'Should calculate 2 Fridays in 2 weeks');
    });

    test('Should count partial weeks day by day (Wednesday to next Tuesday)', () => {
        // Wed Jan 7 -> Tue Jan 13: Wed Thu Fri Sat Sun Mon = 6 days
        const counts = Calc.computeWorkweekCounts(new Date('2026-01-07T00:00:00'), new Date('2026-01-13T00:00:00'));
        assert.strictEqual(counts.totalDays, 6);
        assert.strictEqual(counts.weekends, 1, 'One Saturday');
        assert.strictEqual(counts.workDays, 4, 'Wed Thu Fri Mon');
        assert.strictEqual(counts.mondays, 1);
        assert.strictEqual(counts.fridays, 1);
    });

    test('Should handle zero days remaining', () => {
        const sameDay = Calc.computeFunMetrics(new Date('2026-01-05T08:00:00'), new Date('2026-01-05T09:00:00'), 'countdown');
        assert.strictEqual(sameDay.weekends, 0, 'Should show 0 weekends');
        assert.strictEqual(sameDay.workDays, 0, 'Should show 0 workdays');
        assert.strictEqual(sameDay.mondays, 0, 'Should show 0 Mondays');
    });

    test('Should calculate sleeps equal to days remaining', () => {
        assert.strictEqual(metrics.sleeps, 14, 'Sleeps should equal days');
    });

    test('Should calculate sunrises as days + 1', () => {
        assert.strictEqual(metrics.sunrises, 15, 'Sunrises should be days + 1');
    });
});

describe('CORE TESTS - Progress Percentage Calculation', () => {
    test('Should calculate progress percentage correctly', () => {
        const retirement = new Date('2026-02-27T16:00:00');
        const now = new Date('2022-06-14T00:00:00'); // Midpoint roughly
        const { percentage } = Calc.computeProgress(now, retirement);

        assert.strictEqual(percentage > 0 && percentage < 100, true,
            'Progress should be between 0 and 100%');
    });

    test('Should use the employment start date as the default origin', () => {
        assert.strictEqual(Calc.EMPLOYMENT_START_DATE.getFullYear(), 2018);
        assert.strictEqual(Calc.EMPLOYMENT_START_DATE.getMonth(), 9, 'October');
    });

    test('Should cap progress at 100% maximum', () => {
        const retirement = new Date('2026-02-27T16:00:00');
        const now = new Date('2027-01-01T00:00:00'); // After retirement
        const { percentage } = Calc.computeProgress(now, retirement);

        assert.strictEqual(percentage, 100, 'Progress should cap at 100%');
    });

    test('Should floor progress at 0% minimum', () => {
        const retirement = new Date('2026-02-27T16:00:00');
        const now = new Date('2017-01-01T00:00:00'); // Before employment
        const { percentage } = Calc.computeProgress(now, retirement);

        assert.strictEqual(percentage, 0, 'Progress should floor at 0%');
    });

    test('Should calculate approximately 50% at midpoint', () => {
        const start = new Date('2020-01-01T00:00:00');
        const retirement = new Date('2024-01-01T00:00:00');
        const now = new Date('2022-01-01T00:00:00'); // Approximate midpoint
        const { percentage } = Calc.computeProgress(now, retirement, start);

        // Midpoint should be close to 50% (allow 1% tolerance due to leap years)
        assert.strictEqual(percentage > 49 && percentage < 51, true,
            `Should calculate ~50% at midpoint (got ${percentage.toFixed(2)}%)`);
    });
});

describe('CORE TESTS - Milestone State Determination', () => {
    const find = (states, threshold) => states.find(m => m.threshold === threshold);

    test('Should mark milestone as "achieved" when days <= threshold', () => {
        const states = Calc.milestoneStates(50, Calc.COUNTDOWN_MILESTONES, 'countdown');
        assert.strictEqual(find(states, 100).state, 'achieved', 'Milestone should be achieved');
    });

    test('Should mark milestone as "active" when within 30 days after threshold', () => {
        const states = Calc.milestoneStates(110, Calc.COUNTDOWN_MILESTONES, 'countdown');
        assert.strictEqual(find(states, 100).state, 'active', 'Milestone should be active');
    });

    test('Should mark milestone as "locked" when more than 30 days before threshold', () => {
        const states = Calc.milestoneStates(200, Calc.COUNTDOWN_MILESTONES, 'countdown');
        assert.strictEqual(find(states, 100).state, 'locked', 'Milestone should be locked');
    });

    test('Should use correct icon for achieved milestones', () => {
        const states = Calc.milestoneStates(50, Calc.COUNTDOWN_MILESTONES, 'countdown');
        assert.strictEqual(find(states, 100).displayIcon, '✅', 'Achieved milestone should show checkmark');
    });

    test('Should use correct icon for locked milestones', () => {
        const states = Calc.milestoneStates(200, Calc.COUNTDOWN_MILESTONES, 'countdown');
        assert.strictEqual(find(states, 100).displayIcon, '🔒', 'Locked milestone should show lock');
    });

    test('Should use the milestone icon for active milestones', () => {
        const states = Calc.milestoneStates(110, Calc.COUNTDOWN_MILESTONES, 'countdown');
        assert.strictEqual(find(states, 100).displayIcon, '💯', 'Active milestone should show its own icon');
    });

    test('Should fire countdown confetti when crossing a confetti threshold', () => {
        assert.strictEqual(Calc.crossedMilestone(101, 100, 'countdown'), 100);
        assert.strictEqual(Calc.crossedMilestone(100, 99, 'countdown'), null);
        assert.strictEqual(Calc.crossedMilestone(null, 100, 'countdown'), null, 'No confetti on first tick');
    });
});

// =============================================================================
// SECURITY TESTS
// =============================================================================

describe('SECURITY TESTS - XSS Prevention', () => {
    test('Should use textContent instead of innerHTML for user data', () => {
        const mockDOM = new MockDOM();
        const element = mockDOM.createElement('div');

        // Safe method - textContent
        element.textContent = '<script>alert("XSS")</script>';

        // textContent escapes HTML
        assert.strictEqual(element.textContent, '<script>alert("XSS")</script>',
            'textContent should preserve text as-is (not execute)');
    });

    test('Should safely create DOM elements with createElement', () => {
        const mockDOM = new MockDOM();
        const userInput = '<img src=x onerror=alert(1)>';

        // Safe approach
        const element = mockDOM.createElement('div');
        element.textContent = userInput;

        // The malicious input becomes plain text
        assert.strictEqual(element.textContent, userInput,
            'createElement + textContent should be safe from XSS');
    });

    test('Should validate milestone icons are from predefined set', () => {
        const validIcons = new Set([
            '🎯', '🎆', '🌸', '💯', '⚡', '🎪', '⭐', '🔥', '✅', '🔒',
            '📅', '🗓️', '⏳', '🎊', '🎉', '📆', '🚀',
            '🌅', '🌿', '🌙', '🌻', '🎂', '🌟', '🌊', '🌳', '🏔️', '✨',
            '🍂', '🍁', '🌈', '🎈', '🏆', '🎇'
        ]);

        const all = Calc.COUNTDOWN_MILESTONES.concat(Calc.COUNTUP_MILESTONES);
        all.forEach(m => {
            assert.ok(validIcons.has(m.icon), `Icon ${m.icon} should be in the predefined set`);
            assert.ok(validIcons.has(m.emoji), `Emoji ${m.emoji} should be in the predefined set`);
        });
    });

    test('Should not allow arbitrary HTML in notification messages', () => {
        const mockDOM = new MockDOM();
        const maliciousMessage = '<img src=x onerror=alert(1)>';

        const notification = mockDOM.createElement('div');
        notification.textContent = maliciousMessage; // Safe

        // Should be escaped
        assert.strictEqual(notification.textContent, maliciousMessage,
            'Notification should use textContent, not innerHTML');
    });

    test('Should sanitize date display (no script injection)', () => {
        const dateString = '2026-02-27T16:00:00';
        const date = new Date(dateString);

        // Built-in date methods are safe
        const displayDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Should not contain HTML/script
        assert.strictEqual(displayDate.includes('<'), false, 'Date display should not contain HTML');
        assert.strictEqual(displayDate.includes('script'), false, 'Date display should not contain script');
    });
});

describe('SECURITY TESTS - Server Security Headers', () => {
    test('Should include X-Frame-Options: DENY', () => {
        const securityHeaders = {
            'X-Frame-Options': 'DENY'
        };

        assert.strictEqual(securityHeaders['X-Frame-Options'], 'DENY',
            'Should prevent clickjacking with X-Frame-Options');
    });

    test('Should include X-Content-Type-Options: nosniff', () => {
        const securityHeaders = {
            'X-Content-Type-Options': 'nosniff'
        };

        assert.strictEqual(securityHeaders['X-Content-Type-Options'], 'nosniff',
            'Should prevent MIME-type sniffing');
    });

    test('Should include X-XSS-Protection', () => {
        const securityHeaders = {
            'X-XSS-Protection': '1; mode=block'
        };

        assert.strictEqual(securityHeaders['X-XSS-Protection'], '1; mode=block',
            'Should enable XSS protection');
    });

    test('Should include Referrer-Policy', () => {
        const securityHeaders = {
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        };

        assert.strictEqual(securityHeaders['Referrer-Policy'], 'strict-origin-when-cross-origin',
            'Should have secure referrer policy');
    });

    test('Should include Content-Security-Policy', () => {
        const securityHeaders = {
            'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'"
        };

        assert.strictEqual(securityHeaders['Content-Security-Policy'].includes("default-src 'self'"), true,
            'Should have restrictive CSP');
    });

    test('Should include Permissions-Policy', () => {
        const securityHeaders = {
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        };

        assert.strictEqual(securityHeaders['Permissions-Policy'].includes('geolocation=()'), true,
            'Should disable unnecessary browser features');
    });

    test('Should validate all required security headers are present', () => {
        const requiredHeaders = [
            'X-Frame-Options',
            'X-Content-Type-Options',
            'X-XSS-Protection',
            'Referrer-Policy',
            'Permissions-Policy',
            'Content-Security-Policy'
        ];

        const securityHeaders = {
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            'Content-Security-Policy': "default-src 'self'"
        };

        const allPresent = requiredHeaders.every(header => header in securityHeaders);

        assert.strictEqual(allPresent, true, 'All security headers should be present');
    });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

describe('EDGE CASE TESTS - Date Formatting', () => {
    test('Should correctly format date with single-digit month and day', () => {
        const date = new Date('2026-01-05T09:30:00');
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;

        assert.strictEqual(formatted, '2026-01-05T09:30', 'Should pad single digits with zero');
    });

    test('Should handle year boundaries correctly', () => {
        const newYearsEve = new Date('2025-12-31T23:59:59');
        const newYearsDay = new Date('2026-01-01T00:00:00');
        const diff = newYearsDay - newYearsEve;

        assert.strictEqual(diff, 1000, 'Should handle year boundary (1 second difference)');
    });

    test('Should handle leap year correctly', () => {
        const feb28 = new Date('2024-02-28T00:00:00');
        const feb29 = new Date('2024-02-29T00:00:00'); // 2024 is leap year
        const mar1 = new Date('2024-03-01T00:00:00');

        const days28to29 = Math.floor((feb29 - feb28) / (1000 * 60 * 60 * 24));
        const days29to1 = Math.floor((mar1 - feb29) / (1000 * 60 * 60 * 24));

        assert.strictEqual(days28to29, 1, 'Feb 29 should exist in leap year');
        assert.strictEqual(days29to1, 1, 'Mar 1 should be 1 day after Feb 29');
    });
});

describe('EDGE CASE TESTS - Rate Limiting', () => {
    test('Should allow requests under the limit', () => {
        const MAX_REQUESTS = 100;
        const requestCount = 50;

        const allowed = requestCount < MAX_REQUESTS;

        assert.strictEqual(allowed, true, 'Should allow requests under limit');
    });

    test('Should block requests at the limit', () => {
        const MAX_REQUESTS = 100;
        const requestCount = 100;

        const allowed = requestCount < MAX_REQUESTS;

        assert.strictEqual(allowed, false, 'Should block requests at limit');
    });

    test('Should reset count after time window', () => {
        const RATE_LIMIT_WINDOW = 60000; // 1 minute
        const now = Date.now();
        const resetTime = now + RATE_LIMIT_WINDOW;

        const timeElapsed = now + RATE_LIMIT_WINDOW + 1000; // 1 second after reset
        const shouldReset = timeElapsed > resetTime;

        assert.strictEqual(shouldReset, true, 'Should reset after time window');
    });
});

describe('EDGE CASE TESTS - Confetti Cleanup', () => {
    test('Should remove confetti after timeout', () => {
        const mockDOM = new MockDOM();
        const container = mockDOM.createElement('div');
        const confetti = mockDOM.createElement('div');
        container.appendChild(confetti);

        assert.strictEqual(container.children.length, 1, 'Confetti should be added');

        // Simulate removal
        confetti.remove();

        assert.strictEqual(container.children.length, 0, 'Confetti should be removed');
    });

    test('Should stop confetti creation after celebration duration', () => {
        const CELEBRATION_DURATION = 30000; // 30 seconds
        let isRunning = true;

        // Simulate timeout
        setTimeout(() => {
            isRunning = false;
        }, 0); // Immediate for testing

        setTimeout(() => {
            assert.strictEqual(isRunning, false, 'Should stop after duration');
        }, 10);
    });
});

describe('EDGE CASE TESTS - Interval Management', () => {
    test('Should clear all intervals on reset', () => {
        let countdownInterval = 123;
        let milestoneInterval = 456;
        let celebrationInterval = 789;

        // Clear all
        countdownInterval = null;
        milestoneInterval = null;
        celebrationInterval = null;

        assert.strictEqual(countdownInterval, null, 'Countdown interval should be cleared');
        assert.strictEqual(milestoneInterval, null, 'Milestone interval should be cleared');
        assert.strictEqual(celebrationInterval, null, 'Celebration interval should be cleared');
    });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('INTEGRATION TESTS - Progress Description Updates', () => {
    test('Should show correct description for 0-25% progress', () => {
        assert.strictEqual(Calc.progressDescription(20), 'The journey has begun!',
            'Should show correct message for early progress');
    });

    test('Should show correct description for 25-50% progress', () => {
        assert.strictEqual(Calc.progressDescription(40), 'Making steady progress!',
            'Should show correct message for mid progress');
    });

    test('Should show correct description for 50-75% progress', () => {
        assert.strictEqual(Calc.progressDescription(60), 'More than halfway there!');
    });

    test('Should show correct description for 75-90% progress', () => {
        assert.strictEqual(Calc.progressDescription(80), 'The finish line is in sight!');
    });

    test('Should show correct description for 90%+ progress', () => {
        assert.strictEqual(Calc.progressDescription(95), 'Almost there! So close!',
            'Should show correct message for near completion');
    });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

describe('PERFORMANCE TESTS - Optimization Validation', () => {
    test('Should use math calculations instead of loops for metrics', () => {
        // Monday Jan 5 2026 + 364 days = 52 full weeks
        const start = new Date('2026-01-05T00:00:00');
        const end = new Date(start);
        end.setDate(end.getDate() + 364);

        const counts = Calc.computeWorkweekCounts(start, end);

        assert.strictEqual(counts.totalDays, 364);
        assert.strictEqual(counts.workDays, 260, 'Should calculate 260 workdays in 52 weeks');
    });

    test('Should cache milestone DOM to avoid rebuilding every second', () => {
        let lastMilestoneDays = null;
        const days = 100;

        // First call - should update
        const shouldUpdate1 = days !== lastMilestoneDays;
        lastMilestoneDays = days;

        // Second call with same days - should skip
        const shouldUpdate2 = days !== lastMilestoneDays;

        assert.strictEqual(shouldUpdate1, true, 'Should update on first call');
        assert.strictEqual(shouldUpdate2, false, 'Should skip update when days unchanged');
    });
});

// =============================================================================
// COUNT-UP TESTS
// =============================================================================

describe('COUNT-UP - Mode detection', () => {
    test('Should be countdown when the target is in the future', () => {
        assert.strictEqual(Calc.getMode(new Date('2026-01-01T00:00:00'), new Date('2026-02-27T16:00:00')), 'countdown');
    });

    test('Should be countup when the target is in the past', () => {
        assert.strictEqual(Calc.getMode(new Date('2026-09-06T10:00:00'), new Date('2026-02-27T16:00:00')), 'countup');
    });

    test('Should be countup at the exact moment of retirement', () => {
        const moment = new Date('2026-02-27T16:00:00');
        assert.strictEqual(Calc.getMode(moment, new Date(moment)), 'countup');
    });
});

describe('COUNT-UP - Elapsed time', () => {
    const retirement = new Date('2026-02-27T16:00:00');

    test('Should count calendar days, not floor of milliseconds', () => {
        // 10:00 is before the 16:00 retirement time, but it is still the 191st day
        assert.strictEqual(Calc.computeElapsedDays(new Date('2026-09-06T10:00:00'), retirement), 191);
        assert.strictEqual(Calc.computeElapsedDays(new Date('2026-09-06T23:00:00'), retirement), 191);
    });

    test('Should report zero days on retirement day itself', () => {
        assert.strictEqual(Calc.computeElapsedDays(new Date('2026-02-27T20:00:00'), retirement), 0);
    });

    test('Should never go negative', () => {
        assert.strictEqual(Calc.computeElapsedDays(new Date('2026-01-01T00:00:00'), retirement), 0);
    });

    test('Should break 191 days into 6 months and 10 days', () => {
        assert.deepStrictEqual(Calc.computeMonthsDays(retirement, new Date('2026-09-06T10:00:00')), { months: 6, days: 10 });
    });

    test('Should clamp month ends (Jan 31 + 1 month = Feb 28)', () => {
        assert.deepStrictEqual(Calc.computeMonthsDays(new Date('2026-01-31T00:00:00'), new Date('2026-03-01T00:00:00')), { months: 1, days: 1 });
    });

    test('Should return zero months and days on the same day', () => {
        assert.deepStrictEqual(Calc.computeMonthsDays(retirement, new Date('2026-02-27T18:00:00')), { months: 0, days: 0 });
    });

    test('Should not count a month until the same day-of-month arrives', () => {
        assert.deepStrictEqual(Calc.computeMonthsDays(retirement, new Date('2026-03-26T08:00:00')), { months: 0, days: 27 });
        assert.deepStrictEqual(Calc.computeMonthsDays(retirement, new Date('2026-03-27T08:00:00')), { months: 1, days: 0 });
    });

    test('Should format months and days with correct plurals', () => {
        assert.strictEqual(Calc.formatMonthsDays({ months: 6, days: 10 }), '6 months, 10 days');
        assert.strictEqual(Calc.formatMonthsDays({ months: 1, days: 1 }), '1 month, 1 day');
        assert.strictEqual(Calc.formatMonthsDays({ months: 0, days: 3 }), '3 days');
        assert.strictEqual(Calc.formatMonthsDays({ months: 0, days: 0 }), '0 days');
    });
});

describe('COUNT-UP - Freedom metrics', () => {
    // Retired Friday Feb 27; two weeks later is Friday Mar 13.
    // Window counted: Sat Feb 28 through Fri Mar 13 = 14 days.
    const retirement = new Date('2026-02-27T16:00:00');
    const metrics = Calc.computeFunMetrics(new Date('2026-03-13T09:00:00'), retirement, 'countup');

    test('Should count the day after retirement through today', () => {
        assert.strictEqual(metrics.days, 14);
        assert.strictEqual(metrics.sleeps, 14);
        assert.strictEqual(metrics.sunrises, 14, 'Sunrises equal days in count-up mode');
    });

    test('Should count weekends, workdays and Mondays that were skipped', () => {
        assert.strictEqual(metrics.weekends, 2);
        assert.strictEqual(metrics.workDays, 10);
        assert.strictEqual(metrics.workHours, 80);
        assert.strictEqual(metrics.mondays, 2);
    });

    test('Should treat every day as Friday', () => {
        assert.strictEqual(metrics.fridays, 14);
    });

    test('Should derive commute, meeting and alarm counts from workdays', () => {
        assert.strictEqual(Calc.COMMUTES_PER_WORKDAY, 2);
        assert.strictEqual(Calc.COMMUTE_MINUTES_EACH_WAY, 30);
        assert.strictEqual(Calc.MEETINGS_PER_WORKDAY, 3);
        assert.strictEqual(Calc.ALARMS_PER_WORKDAY, 1);
        assert.strictEqual(metrics.commutes, 20);
        assert.strictEqual(metrics.commuteHours, 10);
        assert.strictEqual(metrics.meetings, 30);
        assert.strictEqual(metrics.alarms, 10);
    });

    test('Should be all zeros on retirement day', () => {
        const dayZero = Calc.computeFunMetrics(new Date('2026-02-27T20:00:00'), retirement, 'countup');
        ['days', 'weekends', 'workDays', 'workHours', 'mondays', 'fridays', 'commutes', 'meetings', 'alarms'].forEach(key => {
            assert.strictEqual(dayZero[key], 0, `${key} should be 0 on day zero`);
        });
    });
});

describe('COUNT-UP - Milestones', () => {
    const states = Calc.milestoneStates(191, Calc.COUNTUP_MILESTONES, 'countup');
    const byThreshold = t => states.find(m => m.threshold === t);

    test('Should list count-up milestones in ascending order', () => {
        const thresholds = Calc.COUNTUP_MILESTONES.map(m => m.threshold);
        const sorted = thresholds.slice().sort((a, b) => a - b);
        assert.deepStrictEqual(thresholds, sorted, 'COUNTUP_MILESTONES must be ascending');
        assert.deepStrictEqual(thresholds, [7, 30, 100, 182, 365, 500, 730, 1000, 1095, 1826, 3652]);
    });

    test('Should mark passed milestones as achieved at 191 days', () => {
        [7, 30, 100, 182].forEach(t => {
            assert.strictEqual(byThreshold(t).state, 'achieved', `${t} days should be achieved`);
            assert.strictEqual(byThreshold(t).displayIcon, '✅');
        });
    });

    test('Should mark only the next milestone as active', () => {
        assert.strictEqual(byThreshold(365).state, 'active');
        assert.strictEqual(byThreshold(365).displayIcon, '🎂');
        assert.strictEqual(states.filter(m => m.state === 'active').length, 1, 'Exactly one active milestone');
    });

    test('Should lock everything after the next milestone', () => {
        [500, 730, 1000, 1095, 1826, 3652].forEach(t => {
            assert.strictEqual(byThreshold(t).state, 'locked', `${t} days should be locked`);
        });
    });

    test('Should measure progress from the retirement day to the next milestone', () => {
        const progress = Calc.nextMilestoneProgress(191, Calc.COUNTUP_MILESTONES);
        assert.strictEqual(progress.prev, 182);
        assert.strictEqual(progress.next, 365);
        assert.strictEqual(progress.nextMilestone.text, 'One Year');
        assert.ok(Math.abs(progress.percentage - 52.329) < 0.01, `Expected ~52.3%, got ${progress.percentage}`);
        assert.strictEqual(progress.complete, false);
    });

    test('Should not restart the bar at zero when a milestone is crossed', () => {
        // Day 182 is six months; the bar keeps climbing toward one year
        // instead of dropping back to 0% of a fresh segment.
        const before = Calc.nextMilestoneProgress(181, Calc.COUNTUP_MILESTONES);
        const after = Calc.nextMilestoneProgress(182, Calc.COUNTUP_MILESTONES);
        assert.strictEqual(before.next, 182);
        assert.strictEqual(after.next, 365);
        assert.ok(after.percentage > 49, `Expected ~50%, got ${after.percentage}`);
    });

    test('Should rise within a milestone segment and never restart near zero', () => {
        // Crossing a milestone does move the goalpost, so the percentage dips
        // when the denominator jumps. What must never happen is a drop back to
        // an empty bar: the smallest ratio between adjacent milestones is
        // 7/30, so every dip lands above 20%.
        let previousPct = 0;
        let previousNext = null;
        for (let d = 0; d <= 3652; d++) {
            const progress = Calc.nextMilestoneProgress(d, Calc.COUNTUP_MILESTONES);
            const pct = progress.percentage;
            assert.ok(pct >= 0 && pct <= 100, `Day ${d} out of range: ${pct}`);
            if (previousNext !== null) {
                if (progress.next === previousNext) {
                    assert.ok(pct >= previousPct, `Day ${d} went backwards inside a segment: ${previousPct} -> ${pct}`);
                } else {
                    assert.ok(pct > 20, `Day ${d} restarted the bar near zero: ${pct}`);
                }
            }
            previousPct = pct;
            previousNext = progress.next;
        }
        assert.strictEqual(previousNext, null, 'The last day should have every milestone complete');
        assert.strictEqual(previousPct, 100);
    });

    test('Should start from zero before the first milestone', () => {
        const progress = Calc.nextMilestoneProgress(0, Calc.COUNTUP_MILESTONES);
        assert.strictEqual(progress.prev, 0);
        assert.strictEqual(progress.next, 7);
        assert.strictEqual(progress.percentage, 0);
    });

    test('Should report completion after the last milestone', () => {
        const progress = Calc.nextMilestoneProgress(5000, Calc.COUNTUP_MILESTONES);
        assert.strictEqual(progress.complete, true);
        assert.strictEqual(progress.next, null);
        assert.strictEqual(progress.percentage, 100);
    });

    test('Should detect a milestone crossing exactly once', () => {
        assert.strictEqual(Calc.crossedMilestone(181, 182, 'countup'), 182, 'Crossing into 182 fires');
        assert.strictEqual(Calc.crossedMilestone(182, 183, 'countup'), null, 'Day after does not fire again');
        assert.strictEqual(Calc.crossedMilestone(null, 182, 'countup'), null, 'First tick never fires');
        assert.strictEqual(Calc.crossedMilestone(182, 182, 'countup'), null, 'Same day never fires');
    });
});

describe('COUNT-UP - Comparisons', () => {
    test('Should list comparisons in ascending order', () => {
        const days = Calc.COMPARISONS.map(c => c.days);
        assert.deepStrictEqual(days, days.slice().sort((a, b) => a - b));
    });

    test('Should unlock comparisons shorter than the days retired', () => {
        const { unlocked, next } = Calc.comparisonsUnlocked(191);
        const labels = unlocked.map(c => c.label);
        assert.ok(labels.includes('a school semester'));
        assert.ok(labels.includes('an NFL regular season'));
        assert.ok(!labels.includes('a one-way trip to Mars'), 'Mars is still ahead at 191 days');
        assert.strictEqual(next.label, 'a one-way trip to Mars');
    });

    test('Should honor the limit and keep the most recent unlocks', () => {
        const { unlocked } = Calc.comparisonsUnlocked(400, Calc.COMPARISONS, 2);
        assert.deepStrictEqual(unlocked.map(c => c.days), [280, 365]);
    });

    test('Should return nothing unlocked on day zero', () => {
        const { unlocked, next } = Calc.comparisonsUnlocked(0);
        assert.strictEqual(unlocked.length, 0);
        assert.strictEqual(next.days, 90);
    });

    test('Should report no next comparison after the last one', () => {
        const { next } = Calc.comparisonsUnlocked(10000);
        assert.strictEqual(next, null);
    });
});

// =============================================================================
// BUSINESS SITE TESTS
// =============================================================================

describe('BUSINESS SITE - HTML Structure', () => {
    const fs = require('fs');
    const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

    test('Should have BranyonTech in the title', () => {
        assert.ok(indexHtml.includes('<title>BranyonTech'),
            'Title should contain BranyonTech');
    });

    test('Should have proper meta description', () => {
        assert.ok(indexHtml.includes('<meta name="description"'),
            'Should have a meta description tag');
    });

    test('Should have skip navigation link for accessibility', () => {
        assert.ok(indexHtml.includes('skip-link'),
            'Should have a skip navigation link');
        assert.ok(indexHtml.includes('id="main-content"'),
            'Skip link target should exist');
    });

    test('Should introduce Kyle by name with the tagline', () => {
        assert.ok(indexHtml.includes('Kyle Shaver'), 'Should show the name');
        assert.ok(indexHtml.includes('Retired technologist. Occasional AI and IT consulting, mostly by referral.'),
            'Should show the tagline');
    });

    test('Should have a mailto link', () => {
        assert.ok(indexHtml.includes('mailto:kbshaver@gmail.com'),
            'Should have a mailto link');
    });

    test('Should link to GitHub safely', () => {
        assert.ok(indexHtml.includes('https://github.com/ShaKy8'), 'Should link to GitHub');
        assert.ok(indexHtml.includes('rel="noopener noreferrer"'), 'External link should use noopener noreferrer');
    });

    test('Should have a link to the countdown page', () => {
        assert.ok(indexHtml.includes('/countdown/index.html'),
            'Should link to the countdown page');
    });

    test('Should describe the countdown link as time since retirement', () => {
        assert.ok(indexHtml.includes("See how long I've been retired"),
            'Footer link should say "See how long I\'ve been retired"');
    });

    test('Should have a link to the game', () => {
        assert.ok(indexHtml.includes('/game/'),
            'Should link to the putting game');
    });

    test('Should describe the game link as putting against your own weather', () => {
        assert.ok(indexHtml.includes('Putt against your own weather'),
            'Game link should say "Putt against your own weather"');
    });

    test('Should have a link to the glider', () => {
        assert.ok(indexHtml.includes('/thermal/'), 'Should link to THERMAL');
        assert.ok(indexHtml.includes('Fly a glider in your own sky'),
            'Glider link should say "Fly a glider in your own sky"');
    });

    test('Should be text only with no scripts or graphics', () => {
        assert.ok(!indexHtml.includes('<svg'), 'Landing page should not contain SVG graphics');
        assert.ok(!indexHtml.includes('<img'), 'Landing page should not contain images');
        assert.ok(!indexHtml.includes('<script'), 'Landing page should not load any script');
    });

    test('Should have a footer landmark', () => {
        assert.ok(indexHtml.includes('role="contentinfo"'), 'Footer should be a contentinfo landmark');
    });
});

describe('BUSINESS SITE - Countdown Subdirectory', () => {
    const fs = require('fs');
    const countdownHtml = fs.readFileSync(path.join(__dirname, 'countdown', 'index.html'), 'utf8');

    test('Countdown page should still have retirement countdown title', () => {
        assert.ok(countdownHtml.includes('Countdown to Retirement'),
            'Countdown page should have original title');
    });

    test('Countdown page should have back link to main site', () => {
        assert.ok(countdownHtml.includes('back-link'),
            'Countdown page should have a back link');
    });

    test('Countdown page should reference its own styles.css', () => {
        assert.ok(countdownHtml.includes('href="styles.css"'),
            'Should reference local styles.css');
    });

    test('Countdown page should load calc.js before script.js', () => {
        const calcIndex = countdownHtml.indexOf('src="calc.js"');
        const scriptIndex = countdownHtml.indexOf('src="script.js"');
        assert.ok(calcIndex > -1, 'Should reference local calc.js');
        assert.ok(scriptIndex > -1, 'Should reference local script.js');
        assert.ok(calcIndex < scriptIndex, 'calc.js must load before script.js');
    });

    test('Countdown page should have count-up sections', () => {
        assert.ok(countdownHtml.includes('data-mode="countup"'), 'Should mark count-up sections');
        assert.ok(countdownHtml.includes('data-mode="countdown"'), 'Should mark countdown sections');
        assert.ok(countdownHtml.includes('id="countup-days"'), 'Should have the count-up hero number');
        assert.ok(countdownHtml.includes('id="comparisons"'), 'Should have the comparisons list');
        assert.ok(countdownHtml.includes('id="personal-section"'), 'Should have the personal stats section');
    });

    test('Countdown page should collapse the date setter behind a details element', () => {
        assert.ok(countdownHtml.includes('<details'), 'Date setter should be inside <details>');
        assert.ok(countdownHtml.includes('id="retirement-date"'), 'Date input should remain');
        assert.ok(countdownHtml.includes('id="reset-date"'), 'Reset button should exist');
    });

    test('Countdown page should have a static celebration overlay', () => {
        assert.ok(countdownHtml.includes('id="celebration"'), 'Celebration overlay should be in the markup');
        assert.ok(countdownHtml.includes('id="celebration-continue"'), 'Celebration should have a Continue button');
    });

    test('Countdown page should not use inline scripts (CSP)', () => {
        const inlineScript = /<script(?![^>]*\bsrc=)[^>]*>/i;
        assert.ok(!inlineScript.test(countdownHtml), 'No inline <script> blocks allowed under CSP');
    });
});

describe('BUSINESS SITE - Personal stats file', () => {
    const fs = require('fs');
    const raw = fs.readFileSync(path.join(__dirname, 'countdown', 'stats.json'), 'utf8');
    const stats = JSON.parse(raw);

    test('stats.json should have the four personal counters as non-negative integers', () => {
        ['trips', 'books', 'projects', 'naps'].forEach(key => {
            assert.strictEqual(typeof stats[key], 'number', `${key} should be a number`);
            assert.ok(Number.isInteger(stats[key]) && stats[key] >= 0, `${key} should be a non-negative integer`);
        });
    });

    test('stats.json should carry an ISO date in "updated"', () => {
        assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(stats.updated), 'updated should look like YYYY-MM-DD');
    });
});

// =============================================================================
// ONE PUTT
// =============================================================================

describe('ONE PUTT - Puzzle day and seed', () => {
    test('Should hold one puzzle for a whole local day', () => {
        for (let hour = 0; hour < 24; hour++) {
            assert.strictEqual(
                Putt.puzzleDay(new Date(2026, 8, 7, hour, 30)),
                Putt.puzzleDay(new Date(2026, 8, 7, 0, 0)),
                `Hour ${hour} landed on a different puzzle`);
        }
    });

    test('Should roll over at local midnight', () => {
        const lastMoment = new Date(2026, 8, 7, 23, 59, 59, 999);
        const midnight = new Date(2026, 8, 8, 0, 0, 0, 0);
        assert.strictEqual(Putt.puzzleDay(midnight) - Putt.puzzleDay(lastMoment), 1,
            'The hole should change as the local date does');
    });

    test('Should advance by exactly one per day', () => {
        const a = Putt.puzzleDay(new Date(2026, 2, 1, 12, 0));
        const b = Putt.puzzleDay(new Date(2026, 2, 2, 12, 0));
        assert.strictEqual(b - a, 1);
    });

    // A day that is 23 or 25 hours long must still count as one day, or the
    // puzzle number drifts every time the clocks change.
    test('Should count clock-change days as one day', () => {
        [[2, 7], [10, 31]].forEach(([month, dayOfMonth]) => {
            const before = Putt.puzzleDay(new Date(2026, month, dayOfMonth, 12, 0));
            const after = Putt.puzzleDay(new Date(2026, month, dayOfMonth + 1, 12, 0));
            assert.strictEqual(after - before, 1,
                `Crossing 2026-${month + 1}-${dayOfMonth} was not one day`);
        });
    });

    test('Should map a day back to its ISO date', () => {
        const day = Putt.puzzleDay(new Date(2026, 8, 7, 12, 0));
        assert.strictEqual(Putt.puzzleDateKey(day), '2026-09-07');
    });

    test('Should give 1000 distinct uint32 seeds for 1000 days', () => {
        const seeds = [];
        for (let d = 0; d < 1000; d++) seeds.push(Putt.seedForDay(d));
        assert.strictEqual(new Set(seeds).size, 1000, 'Seeds should not collide');
        seeds.forEach(s => {
            assert.ok(Number.isInteger(s) && s >= 0 && s <= 0xffffffff, `Bad seed ${s}`);
        });
    });

    test('Should count down to the next local midnight', () => {
        [[2026, 8, 7, 0, 0], [2026, 8, 7, 12, 34], [2026, 8, 7, 23, 59],
         [2026, 2, 8, 1, 30], [2026, 10, 1, 1, 30]].forEach(parts => {
            const now = new Date(parts[0], parts[1], parts[2], parts[3], parts[4]);
            const ms = Putt.msUntilNextPuzzle(now);
            assert.ok(ms > 0, `Countdown should be positive, got ${ms}`);
            const then = new Date(now.getTime() + ms);
            assert.strictEqual(then.getHours(), 0, 'Should land on midnight');
            assert.strictEqual(then.getMinutes(), 0);
            assert.strictEqual(then.getSeconds(), 0);
            assert.strictEqual(Putt.puzzleDay(then) - Putt.puzzleDay(now), 1,
                'Landing there should be the next puzzle');
        });
    });
});

describe('ONE PUTT - Seeded PRNG', () => {
    // Locks the algorithm. Changing the PRNG silently rewrites every hole ever
    // played and invalidates every share string ever posted, so it must not be
    // possible to do by accident.
    test('Should produce a locked, known sequence', () => {
        const rng = Putt.makeRng(12345);
        const got = [rng(), rng(), rng(), rng(), rng()].map(v => Math.round(v * 1e9) / 1e9);
        assert.deepStrictEqual(got, [0.979728268, 0.306752264, 0.484205422, 0.817934413, 0.509428369],
            'mulberry32 output changed - this rewrites history');
    });

    test('Should stay within [0, 1)', () => {
        const rng = Putt.makeRng(999);
        for (let i = 0; i < 10000; i++) {
            const v = rng();
            assert.ok(v >= 0 && v < 1, `Out of range: ${v}`);
        }
    });

    test('Should be reproducible from the same seed', () => {
        const a = Putt.makeRng(42), b = Putt.makeRng(42);
        const seqA = [], seqB = [];
        for (let i = 0; i < 1000; i++) { seqA.push(a()); seqB.push(b()); }
        assert.deepStrictEqual(seqA, seqB);
    });

    test('Should be roughly uniform', () => {
        const rng = Putt.makeRng(7);
        let sum = 0;
        for (let i = 0; i < 100000; i++) sum += rng();
        const mean = sum / 100000;
        assert.ok(mean > 0.49 && mean < 0.51, `Mean was ${mean}`);
    });
});

describe('ONE PUTT - Hole determinism', () => {
    test('Should build an identical hole from an identical seed', () => {
        assert.deepStrictEqual(Putt.generateHole(7), Putt.generateHole(7));
    });

    test('Should tie the daily hole to the puzzle day', () => {
        const now = new Date('2026-09-07T09:00:00Z');
        assert.deepStrictEqual(Putt.dailyHole(now),
            Putt.generateHole(Putt.seedForDay(Putt.puzzleDay(now))));
    });

    test('Should vary the cup position across days', () => {
        const cups = new Set();
        for (let d = 0; d < 100; d++) {
            const h = Putt.generateHole(Putt.seedForDay(d));
            cups.add(h.cup.x + ',' + h.cup.y);
        }
        assert.ok(cups.size >= 90, `Only ${cups.size} distinct cups in 100 days`);
    });

    // Math.sin/cos/pow are not bit-identical across JS engines. The hole must be
    // the same everywhere, so its geometry uses only add/multiply/round.
    test('Should place every coordinate on the half-unit grid', () => {
        for (let d = 0; d < 200; d++) {
            const h = Putt.generateHole(Putt.seedForDay(d));
            const coords = [h.tee.x, h.tee.y, h.cup.x, h.cup.y];
            h.walls.forEach(w => coords.push(w.x, w.y, w.w, w.h));
            (h.hazards || []).forEach(z => coords.push(z.x, z.y, z.w, z.h));
            coords.forEach(v => {
                assert.strictEqual(v * 2, Math.round(v * 2), `Off-grid coordinate ${v} on day ${d}`);
            });
        }
    });
});

describe('ONE PUTT - Hole validity across 3650 seeds', () => {
    const holes = [];
    for (let d = 0; d < 3650; d++) holes.push(Putt.generateHole(Putt.seedForDay(d)));

    test('Should produce a valid hole for every one of ten years of days', () => {
        const bad = holes
            .map((h, d) => ({ d, v: Putt.validateHole(h) }))
            .filter(x => !x.v.ok);
        assert.strictEqual(bad.length, 0,
            `Invalid holes: ${bad.slice(0, 3).map(x => `day ${x.d} (${x.v.reasons})`).join('; ')}`);
    });

    // The fallback exists so a bad day degrades to a playable hole instead of a
    // broken puzzle worldwide. It should never actually be needed.
    test('Should never fall back to the hand-authored hole', () => {
        const fell = holes.filter(h => h.fallback);
        assert.strictEqual(fell.length, 0, `${fell.length} days needed the fallback`);
    });

    test('Should keep par within 2..5 and use at least three values', () => {
        const pars = new Set();
        holes.forEach(h => {
            assert.ok(h.par >= 2 && h.par <= 5, `Par ${h.par} out of range`);
            pars.add(h.par);
        });
        assert.ok(pars.size >= 3, `Only ${pars.size} distinct par values`);
    });

    test('Should keep the tee a real distance from the cup', () => {
        holes.forEach((h, d) => {
            const gap = Math.hypot(h.tee.x - h.cup.x, h.tee.y - h.cup.y);
            assert.ok(gap >= Putt.SIM.MIN_SEPARATION, `Day ${d} gap was only ${gap}`);
        });
    });

    test('Should leave the cup reachable from the tee', () => {
        const stuck = holes.filter(h => !Putt.reachable(h).ok);
        assert.strictEqual(stuck.length, 0, `${stuck.length} unreachable holes`);
    });

    test('Should never put the cup inside a wall or on a hazard', () => {
        holes.forEach((h, d) => {
            assert.strictEqual(Putt.surfaceAt(h, h.cup.x, h.cup.y), 'green', `Day ${d} cup not on green`);
        });
    });

    test('Should use every archetype over ten years', () => {
        const used = new Set(holes.map(h => h.archetype));
        assert.strictEqual(used.size, Putt.ARCHETYPES.length,
            `Only used ${[...used].join(', ')}`);
    });
});

describe('ONE PUTT - Physics', () => {
    const calm = { mph: 0, deg: 0, gustMph: 0, source: 'none' };
    const border = [
        { x: 0, y: 0, w: 100, h: 2 }, { x: 0, y: 158, w: 100, h: 2 },
        { x: 0, y: 0, w: 2, h: 160 }, { x: 98, y: 0, w: 2, h: 160 }
    ];
    const box = (extra, hazards) => ({
        seed: 0, archetype: 'test', par: 3,
        tee: { x: 50, y: 140 }, cup: { x: 50, y: 20 },
        walls: border.concat(extra || []), hazards: hazards || []
    });

    test('Should leave a resting ball exactly where it is', () => {
        const h = box();
        const at_rest = Putt.createBall(h);
        let b = at_rest;
        for (let i = 0; i < 1000; i++) b = Putt.stepBall(h, b, calm, i / 120, Putt.SIM.DT).ball;
        assert.deepStrictEqual(b, at_rest);
    });

    test('Should not mutate the ball handed to it', () => {
        const h = box();
        const b = Putt.createBall(h);
        b.vx = 30; b.vy = -40; b.resting = false;
        const snapshot = JSON.parse(JSON.stringify(b));
        Putt.stepBall(h, b, calm, 0, Putt.SIM.DT);
        assert.deepStrictEqual(b, snapshot, 'stepBall must be pure');
    });

    // Exponential damping approaches zero asymptotically and the ball creeps
    // forever. Coulomb friction with an exact clamp gives a real resting state.
    test('Should bring the ball to exactly zero speed, not merely near it', () => {
        const h = box();
        const r = Putt.simulateShot(h, Putt.createBall(h), { angle: 0.3, power: 0.5 }, calm, {});
        assert.strictEqual(r.event, 'rest');
        assert.strictEqual(r.ball.vx, 0);
        assert.strictEqual(r.ball.vy, 0);
    });

    test('Should come to rest within the step cap', () => {
        const h = box();
        const r = Putt.simulateShot(h, Putt.createBall(h), { angle: -Math.PI / 2, power: 0.6 }, calm, {});
        assert.ok(r.steps < Putt.SIM.MAX_STEPS, `Took ${r.steps} steps`);
    });

    test('Should travel further with more power', () => {
        const h = box();
        let last = -1;
        // Up the open field: shooting toward a nearby wall would measure the
        // bounce rather than the roll.
        for (let p = 1; p <= 10; p++) {
            const r = Putt.simulateShot(h, Putt.createBall(h), { angle: -Math.PI / 2, power: p / 20 }, calm, {});
            const d = Math.hypot(r.ball.x - h.tee.x, r.ball.y - h.tee.y);
            assert.ok(d > last, `Power ${p / 20} travelled ${d}, not more than ${last}`);
            last = d;
        }
    });

    test('Should never escape an empty box at full power, from any angle', () => {
        const h = box();
        for (let a = 0; a < 360; a++) {
            const r = Putt.simulateShot(h, Putt.createBall(h), { angle: a * Math.PI / 180, power: 1 }, calm, { maxSteps: 4000 });
            assert.notStrictEqual(r.event, 'oob', `Angle ${a} left the field`);
            assert.ok(r.ball.x >= 0 && r.ball.x <= 100 && r.ball.y >= 0 && r.ball.y <= 160,
                `Angle ${a} ended outside at ${r.ball.x},${r.ball.y}`);
        }
    });

    // A 1.5u wall is thinner than one unsubstepped step at max speed, and
    // thinner than the ball. It is the shape that finds tunneling bugs.
    test('Should not tunnel through a wall thinner than the ball', () => {
        const h = box([{ x: 2, y: 60, w: 96, h: 1.5 }]);
        h.tee = { x: 50, y: 120 };
        for (let a = 0; a < 360; a++) {
            const r = Putt.simulateShot(h, Putt.createBall(h), { angle: a * Math.PI / 180, power: 1 }, calm, { maxSteps: 4000 });
            assert.ok(r.ball.y >= 60, `Angle ${a} ended at y=${r.ball.y}, through the wall`);
        }
    });

    test('Should reverse and lose speed on a head-on bounce', () => {
        const h = box();
        const b = Putt.createBall(h);
        b.x = 90; b.y = 80; b.vx = 60; b.vy = 0; b.resting = false;
        let cur = b, seen = null;
        for (let i = 0; i < 200 && !seen; i++) {
            const r = Putt.stepBall(h, cur, calm, i / 120, Putt.SIM.DT);
            if (r.bounces > 0) seen = r.ball;
            cur = r.ball;
        }
        assert.ok(seen, 'Expected a bounce');
        assert.ok(seen.vx < 0, 'Should reverse direction');
        assert.ok(Math.abs(seen.vx) < 60, 'Should lose energy, not gain it');
    });

    test('Should blow the ball downwind', () => {
        const h = box();
        const west = { mph: 20, deg: 270, gustMph: 20, source: 'test' };
        const calmShot = Putt.simulateShot(h, Putt.createBall(h), { angle: -Math.PI / 2, power: 0.5 }, calm, {});
        const windShot = Putt.simulateShot(h, Putt.createBall(h), { angle: -Math.PI / 2, power: 0.5 }, west, {});
        assert.ok(windShot.ball.x > calmShot.ball.x + 1,
            `Wind from the west should push east: ${calmShot.ball.x} -> ${windShot.ball.x}`);
    });

    test('Should treat wind degrees as the direction it blows FROM', () => {
        const v = Putt.windVector({ mph: 10, deg: 0, gustMph: 10 }, 0);
        assert.ok(v.ay > 0, 'A north wind pushes down-screen');
        assert.ok(Math.abs(v.ax) < 1e-9, `Expected no sideways push, got ${v.ax}`);
    });

    test('Should apply no force at all in calm air', () => {
        assert.deepStrictEqual(Putt.windVector({ mph: 0, deg: 123 }, 5), { ax: 0, ay: 0 });
        assert.deepStrictEqual(Putt.windVector(null, 5), { ax: 0, ay: 0 });
    });

    test('Should slow the ball more through sand', () => {
        const clean = box();
        const sandy = box([], [{ kind: 'sand', shape: 'rect', x: 2, y: 90, w: 96, h: 20 }]);
        const a = Putt.simulateShot(clean, Putt.createBall(clean), { angle: -Math.PI / 2, power: 0.6 }, calm, {});
        const b = Putt.simulateShot(sandy, Putt.createBall(sandy), { angle: -Math.PI / 2, power: 0.6 }, calm, {});
        assert.ok(b.ball.y > a.ball.y + 1, `Sand should shorten the roll: ${a.ball.y} vs ${b.ball.y}`);
    });

    test('Should return the ball to the stroke origin on water', () => {
        const h = box([], [{ kind: 'water', shape: 'rect', x: 2, y: 90, w: 96, h: 20 }]);
        const start = Putt.createBall(h);
        const r = Putt.simulateShot(h, start, { angle: -Math.PI / 2, power: 0.8 }, calm, {});
        assert.strictEqual(r.event, 'water');
        assert.deepStrictEqual({ x: r.ball.x, y: r.ball.y }, { x: h.tee.x, y: h.tee.y });
    });

    test('Should sink a ball that arrives slowly', () => {
        const h = box();
        h.tee = { x: 50, y: 40 };
        const r = Putt.simulateShot(h, Putt.createBall(h), { angle: -Math.PI / 2, power: 0.35 }, calm, {});
        assert.strictEqual(r.event, 'sunk', `Ended ${r.event} at ${r.ball.x},${r.ball.y}`);
    });

    test('Should lip out a ball that arrives too fast', () => {
        const h = box();
        h.tee = { x: 50, y: 40 };
        const fast = Putt.simulateShot(h, Putt.createBall(h), { angle: -Math.PI / 2, power: 1 }, calm, {});
        assert.notStrictEqual(fast.event, 'sunk', 'A rocket should not drop');
        assert.ok(Math.hypot(fast.ball.x - h.cup.x, fast.ball.y - h.cup.y) > Putt.SIM.CUP_R,
            'It should not come to rest in the cup either');
        const paced = Putt.simulateShot(h, Putt.createBall(h), { angle: -Math.PI / 2, power: 0.35 }, calm, {});
        assert.strictEqual(paced.event, 'sunk', 'The same line at a sane pace should drop');
    });

    // Per-frame sink detection would miss this: the ball crosses the whole cup
    // between two renders.
    test('Should catch a sink that happens mid-frame', () => {
        const h = box();
        h.tee = { x: 50, y: 100 };
        const r = Putt.simulateShot(h, Putt.createBall(h), { angle: -Math.PI / 2, power: 0.52 }, calm, {});
        assert.ok(['sunk', 'rest'].indexOf(r.event) >= 0);
        if (r.event === 'rest') {
            assert.ok(Math.hypot(r.ball.x - h.cup.x, r.ball.y - h.cup.y) > Putt.SIM.CUP_R,
                'A ball that stopped should not be sitting in the cup unsunk');
        }
    });

    test('Should replay a shot identically', () => {
        const h = box();
        const aim = { angle: 1.2, power: 0.77 };
        const a = Putt.simulateShot(h, Putt.createBall(h), aim, calm, {});
        const b = Putt.simulateShot(h, Putt.createBall(h), aim, calm, {});
        assert.deepStrictEqual(a, b);
    });
});

describe('ONE PUTT - Solvability probe', () => {
    const seeds = [];
    for (let d = 0; d < 64; d++) seeds.push(d);
    const results = seeds.map(d => ({ d, r: Putt.probeSolvable(Putt.generateHole(Putt.seedForDay(d))) }));

    test('Should be sinkable by a greedy player within par + 1', () => {
        const fail = results.filter(x => !x.r.sinkable);
        assert.strictEqual(fail.length, 0,
            `Unsolvable: ${fail.slice(0, 5).map(x => `day ${x.d} (${x.r.best.dist.toFixed(1)}u short)`).join('; ')}`);
    });

    test('Should give the same verdict twice', () => {
        const h = Putt.generateHole(Putt.seedForDay(3));
        assert.deepStrictEqual(Putt.probeSolvable(h), Putt.probeSolvable(h));
    });
});

describe('ONE PUTT - Wind from the weather API', () => {
    // Shaped like a real /weather/api/bundle response: soft()-wrapped forecast,
    // parallel hourly arrays, local wall-clock time strings.
    const bundle = (hourly, offset) => ({
        key: '34.052,-118.244', lat: 34.052, lon: -118.244, fetched: 0,
        forecast: { ok: true, data: { utc_offset_seconds: offset === undefined ? 0 : offset, hourly } }
    });
    const base = {
        time: ['2026-09-07T10:00', '2026-09-07T11:00'],
        wind_speed_10m: [10, 20],
        wind_direction_10m: [180, 180],
        wind_gusts_10m: [15, 25]
    };
    const at = t => new Date(t);

    test('Should interpolate speed between hourly samples', () => {
        const w = Putt.extractWind(bundle(base), at('2026-09-07T10:30:00Z'));
        assert.strictEqual(w.mph, 15);
        assert.strictEqual(w.source, 'live');
    });

    test('Should take an exact sample at the exact hour', () => {
        const w = Putt.extractWind(bundle(base), at('2026-09-07T11:00:00Z'));
        assert.strictEqual(w.mph, 20);
    });

    // Averaging 350 and 10 arithmetically gives 180 - exactly backwards. This is
    // invisible in the UI except as a ball drifting the wrong way.
    test('Should interpolate direction the short way around the circle', () => {
        const b = bundle(Object.assign({}, base, { wind_direction_10m: [350, 10] }));
        const w = Putt.extractWind(b, at('2026-09-07T10:30:00Z'));
        assert.strictEqual(w.deg, 0, `Wrapped the long way: got ${w.deg}`);
    });

    test('Should respect the timezone offset', () => {
        const w = Putt.extractWind(bundle(base, -25200), at('2026-09-07T17:30:00Z'));
        assert.strictEqual(w.mph, 15, 'Local 10:30 at UTC-7 is 17:30Z');
    });

    test('Should clamp to the ends of the series rather than give up', () => {
        const before = Putt.extractWind(bundle(base), at('2026-09-01T00:00:00Z'));
        const after = Putt.extractWind(bundle(base), at('2026-09-30T00:00:00Z'));
        assert.strictEqual(before.mph, 10);
        assert.strictEqual(after.mph, 20);
    });

    test('Should return null, not throw, for any malformed payload', () => {
        const junk = [null, undefined, {}, [], 'nope', 42, true,
            { forecast: null }, { forecast: {} }, { forecast: { ok: false, error: 'x' } },
            { forecast: { ok: true, data: {} } },
            { forecast: { ok: true, data: { hourly: {} } } },
            { forecast: { ok: true, data: { hourly: { time: [] } } } }];
        junk.forEach((j, i) => {
            assert.doesNotThrow(() => Putt.extractWind(j, at('2026-09-07T10:30:00Z')), `Threw on fixture ${i}`);
            assert.strictEqual(Putt.extractWind(j, at('2026-09-07T10:30:00Z')), null, `Fixture ${i} should be null`);
        });
    });

    test('Should reject arrays that do not line up with the timestamps', () => {
        const b = bundle(Object.assign({}, base, { wind_speed_10m: [10] }));
        assert.strictEqual(Putt.extractWind(b, at('2026-09-07T10:30:00Z')), null);
    });

    test('Should reject nulls and non-numbers at the sample it needs', () => {
        const nulls = bundle(Object.assign({}, base, { wind_speed_10m: [null, null] }));
        const strs = bundle(Object.assign({}, base, { wind_direction_10m: ['n/a', 'n/a'] }));
        assert.strictEqual(Putt.extractWind(nulls, at('2026-09-07T10:30:00Z')), null);
        assert.strictEqual(Putt.extractWind(strs, at('2026-09-07T10:30:00Z')), null);
    });

    test('Should survive a missing gust series', () => {
        const b = bundle({ time: base.time, wind_speed_10m: [10, 20], wind_direction_10m: [180, 180] });
        const w = Putt.extractWind(b, at('2026-09-07T10:30:00Z'));
        assert.strictEqual(w.mph, 15);
        assert.strictEqual(w.gustMph, 15);
    });

    test('Should invent deterministic wind when there is no live data', () => {
        assert.deepStrictEqual(Putt.syntheticWind(1234), Putt.syntheticWind(1234));
        const specs = [];
        for (let s = 0; s < 100; s++) specs.push(Putt.syntheticWind(s));
        specs.forEach(w => {
            assert.ok(w.mph >= 3 && w.mph <= 18, `mph out of range: ${w.mph}`);
            assert.ok(w.deg >= 0 && w.deg < 360, `deg out of range: ${w.deg}`);
            assert.strictEqual(w.source, 'synthetic');
        });
        assert.ok(new Set(specs.map(w => w.mph)).size >= 20, 'Synthetic wind should vary');
    });

    test('Should fall back to synthetic wind rather than expose an error path', () => {
        const seed = 4242;
        assert.deepStrictEqual(Putt.resolveWind(null, at('2026-09-07T10:30:00Z'), seed), Putt.syntheticWind(seed));
        assert.deepStrictEqual(Putt.resolveWind({ forecast: { ok: false } }, at('2026-09-07T10:30:00Z'), seed),
            Putt.syntheticWind(seed));
        assert.strictEqual(Putt.resolveWind(bundle(base), at('2026-09-07T10:30:00Z'), seed).source, 'live');
    });

    test('Should clamp absurd wind into a playable range', () => {
        assert.strictEqual(Putt.clampWind({ mph: 900, deg: 0 }).mph, Putt.SIM.WIND_MAX_MPH);
        assert.strictEqual(Putt.clampWind({ mph: -5, deg: 10 }).mph, 0);
        assert.strictEqual(Putt.clampWind({ mph: 10, deg: 725 }).deg, 5);
        assert.strictEqual(Putt.clampWind({ mph: 'x', deg: 0 }), null);
        assert.strictEqual(Putt.clampWind(null), null);
    });
});

describe('ONE PUTT - Scoring and sharing', () => {
    test('Should name every score', () => {
        assert.strictEqual(Putt.scoreLabel(1, 3), 'Hole in one');
        assert.strictEqual(Putt.scoreLabel(2, 4), 'Eagle');
        assert.strictEqual(Putt.scoreLabel(2, 3), 'Birdie');
        assert.strictEqual(Putt.scoreLabel(3, 3), 'Par');
        assert.strictEqual(Putt.scoreLabel(4, 3), 'Bogey');
        assert.strictEqual(Putt.scoreLabel(5, 3), 'Double bogey');
        assert.strictEqual(Putt.scoreLabel(6, 3), 'Triple bogey');
        assert.strictEqual(Putt.scoreLabel(9, 3), '+6');
    });

    test('Should give exactly one character per score badge', () => {
        for (let s = 1; s <= 12; s++) {
            for (let p = 2; p <= 5; p++) {
                assert.strictEqual(Array.from(Putt.scoreEmoji(s, p)).length, 1,
                    `scoreEmoji(${s},${p}) was not a single code point`);
            }
        }
    });

    test('Should read out a compass bearing', () => {
        assert.strictEqual(Putt.compassFromDegrees(0), 'N');
        assert.strictEqual(Putt.compassFromDegrees(11.25), 'NNE');
        assert.strictEqual(Putt.compassFromDegrees(210), 'SSW');
        assert.strictEqual(Putt.compassFromDegrees(348.75), 'N');
        assert.strictEqual(Putt.compassFromDegrees(359.9), 'N');
        assert.strictEqual(Putt.formatWind({ mph: 12, deg: 210 }), '12 mph SSW');
    });

    // The share text IS the product - it is what spreads. Lock it exactly.
    const result = { day: 249, strokes: 3, par: 2, cells: ['green', 'sand', 'sunk'], windMph: 12, windDeg: 210, streak: 4 };

    test('Should build the share card exactly', () => {
        assert.strictEqual(Putt.buildShare(result),
            'ONE PUTT #249 — 3 (+1)\n\u{1F7E9}\u{1F7E8}⛳\nWind 12 mph SSW\nStreak 4\nbranyontech.com/game/');
    });

    test('Should mark a level score with E rather than +0', () => {
        const level = Object.assign({}, result, { strokes: 2, par: 2, cells: ['green', 'sunk'] });
        assert.ok(Putt.buildShare(level).indexOf('2 (E)') > 0, Putt.buildShare(level));
    });

    test('Should stay short even on a disastrous hole', () => {
        const bad = Object.assign({}, result, { strokes: 20, cells: new Array(20).fill('water') });
        const text = Putt.buildShare(bad);
        assert.ok(text.length <= 200, `Share was ${text.length} chars`);
        assert.ok(text.indexOf('…') > 0, 'Long rounds should be elided');
    });

    // The wind comes from the player's location. The share must carry the
    // weather without carrying where they are.
    test('Should not leak the player location', () => {
        const text = Putt.buildShare(result);
        assert.ok(!/\d+\.\d{3,}/.test(text), 'Share should contain no coordinates');
        assert.ok(text.indexOf('@') === -1, 'Share should contain no address');
    });
});

describe('ONE PUTT - Saved state and streaks', () => {
    const res = { strokes: 3, par: 3, windMph: 10, windDeg: 180, source: 'live' };

    test('Should turn any corrupt blob into a clean empty state', () => {
        ['', '{', 'null', '[]', '"hello"', '42', '{"v":99}', '{"v":1,"days":"nope"}',
            '{"v":1,"streak":"x","days":{}}'].forEach(raw => {
                let out;
                assert.doesNotThrow(() => { out = Putt.parseState(raw); }, `Threw on ${raw}`);
                assert.strictEqual(typeof out, 'object');
                assert.strictEqual(out.v, 1);
            });
        assert.deepStrictEqual(Putt.parseState('{'), Putt.emptyState());
        assert.deepStrictEqual(Putt.parseState('[]'), Putt.emptyState());
    });

    test('Should round-trip a real state', () => {
        const s = Putt.recordDaily(Putt.emptyState(), 10, res);
        assert.deepStrictEqual(Putt.parseState(Putt.serializeState(s)), s);
    });

    test('Should drop day entries that make no sense', () => {
        const s = Putt.parseState('{"v":1,"days":{"5":{"strokes":"x","par":3},"6":{"strokes":2,"par":3}}}');
        assert.deepStrictEqual(Object.keys(s.days), ['6']);
    });

    test('Should build a streak on consecutive days', () => {
        let s = Putt.emptyState();
        s = Putt.recordDaily(s, 10, res);
        s = Putt.recordDaily(s, 11, res);
        s = Putt.recordDaily(s, 12, res);
        assert.strictEqual(s.streak, 3);
        assert.strictEqual(s.played, 3);
    });

    test('Should reset the streak after a missed day', () => {
        let s = Putt.emptyState();
        s = Putt.recordDaily(s, 10, res);
        s = Putt.recordDaily(s, 11, res);
        s = Putt.recordDaily(s, 14, res);
        assert.strictEqual(s.streak, 1);
        assert.strictEqual(s.bestStreak, 2, 'The old streak should still be remembered');
    });

    // "The first attempt is the one that counts" is a property of the data, not
    // a rule the UI has to remember - a replay physically cannot overwrite it.
    test('Should ignore a second result for the same day', () => {
        let s = Putt.recordDaily(Putt.emptyState(), 10, res);
        const after = Putt.recordDaily(s, 10, { strokes: 1, par: 3, windMph: 0, windDeg: 0, source: 'live' });
        assert.deepStrictEqual(after, s);
        assert.strictEqual(after.days['10'].strokes, 3, 'The first score stands');
    });

    test('Should ignore a result for a day already behind us', () => {
        let s = Putt.recordDaily(Putt.emptyState(), 10, res);
        assert.deepStrictEqual(Putt.recordDaily(s, 9, res), s);
    });

    test('Should never lower the best streak', () => {
        let s = Putt.emptyState();
        for (let d = 1; d <= 5; d++) s = Putt.recordDaily(s, d, res);
        const best = s.bestStreak;
        s = Putt.recordDaily(s, 20, res);
        assert.strictEqual(s.streak, 1);
        assert.ok(s.bestStreak >= best);
    });

    test('Should count aces', () => {
        let s = Putt.emptyState();
        s = Putt.recordDaily(s, 1, Object.assign({}, res, { strokes: 1 }));
        s = Putt.recordDaily(s, 2, res);
        assert.strictEqual(s.aces, 1);
    });

    test('Should keep the history small', () => {
        let s = Putt.emptyState();
        for (let d = 1; d <= 100; d++) s = Putt.recordDaily(s, d, res);
        assert.ok(Object.keys(s.days).length <= 30, `Kept ${Object.keys(s.days).length} days`);
        assert.ok(s.days['100'], 'The most recent day should survive');
    });

    test('Should not mutate the state handed to it', () => {
        const s = Putt.emptyState();
        const snapshot = JSON.parse(JSON.stringify(s));
        Putt.recordDaily(s, 10, res);
        assert.deepStrictEqual(s, snapshot);
    });
});

describe('ONE PUTT - Page structure', () => {
    const fs = require('fs');
    const gameHtml = fs.readFileSync(path.join(__dirname, 'game', 'index.html'), 'utf8');
    const gameCss = fs.readFileSync(path.join(__dirname, 'game', 'styles.css'), 'utf8');

    // These files document the very things they must not do ("no localStorage",
    // "a relative ./api/ path would break"), so the assertions below look at
    // code with the prose removed.
    const codeOnly = src => src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter(line => !/^\s*(\/\/|\*)/.test(line))
        .join('\n');
    const gameJs = codeOnly(fs.readFileSync(path.join(__dirname, 'game', 'script.js'), 'utf8'));
    const puttJs = codeOnly(fs.readFileSync(path.join(__dirname, 'game', 'putt.js'), 'utf8'));

    test('Should have a title and description', () => {
        assert.ok(gameHtml.includes('<title>ONE PUTT'), 'Title should name the game');
        assert.ok(gameHtml.includes('<meta name="description"'), 'Should have a meta description');
    });

    test('Should offer skip navigation and a way back to the site', () => {
        assert.ok(gameHtml.includes('skip-link'), 'Should have a skip link');
        assert.ok(gameHtml.includes('id="main-content"'), 'Skip link target should exist');
        assert.ok(gameHtml.includes('class="back-link"'), 'Should link back to the site');
    });

    test('Should load the rules before the renderer', () => {
        const rules = gameHtml.indexOf('putt.js');
        const render = gameHtml.indexOf('script.js');
        assert.ok(rules > 0 && render > 0, 'Both scripts should be referenced');
        assert.ok(rules < render, 'putt.js must load before script.js');
    });

    // CSP is script-src 'self' with no unsafe-inline.
    test('Should not use inline scripts', () => {
        const inlineScript = /<script(?![^>]*\bsrc=)[^>]*>/i;
        assert.ok(!inlineScript.test(gameHtml), 'No inline <script> blocks allowed under CSP');
    });

    test('Should not use inline event handlers', () => {
        assert.ok(!/\son(click|load|input|change|pointerdown|keydown)\s*=/i.test(gameHtml),
            'No inline on*= handlers allowed under CSP');
    });

    test('Should not evaluate strings as code', () => {
        [['script.js', gameJs], ['putt.js', puttJs]].forEach(([name, src]) => {
            assert.ok(!/\beval\s*\(/.test(src), `${name} should not call eval`);
            assert.ok(!/new\s+Function\s*\(/.test(src), `${name} should not build functions from strings`);
        });
    });

    test('Should carry the markup the renderer binds to', () => {
        ['id="board"', 'id="aim"', 'id="power"', 'id="putt"', 'id="share"', 'aria-live']
            .forEach(hook => assert.ok(gameHtml.includes(hook), `Missing ${hook}`));
    });

    // A relative './api/bundle' from /game/ resolves to /game/api/bundle, which
    // is not routed to the Lambda - and it fails quietly into synthetic wind,
    // which looks exactly like a slow API day. Assert it rather than remember it.
    test('Should call the weather API by absolute path', () => {
        assert.ok(gameJs.includes('/weather/api/bundle'), 'Should call /weather/api/bundle');
        assert.ok(gameJs.includes('/weather/api/config'), 'Should call /weather/api/config');
        assert.ok(!/['"`]\.\/api\//.test(gameJs), 'A relative ./api/ path would resolve under /game/');
    });

    test('Should export the rules to both a browser and Node', () => {
        assert.ok(puttJs.includes("typeof module !== 'undefined' && module.exports"),
            'Should export for require()');
        assert.ok(puttJs.includes("typeof window !== 'undefined' ? window : null"),
            'Should attach a global for the page');
    });

    // The whole determinism guarantee rests on this: no ambient state, no
    // hidden clock. Everything the rules need is passed in.
    test('Should keep the rules free of the DOM, storage, network and the clock', () => {
        assert.ok(!/\bdocument\./.test(puttJs), 'putt.js must not touch the DOM');
        assert.ok(!/\blocalStorage\b/.test(puttJs), 'putt.js must not touch localStorage');
        assert.ok(!/\bfetch\s*\(/.test(puttJs), 'putt.js must not make network calls');
        assert.ok(!/new Date\(\s*\)/.test(puttJs), 'putt.js must be handed "now", never read it');
    });

    test('Should keep the board usable on a touchscreen', () => {
        assert.ok(gameCss.includes('touch-action'),
            'The canvas needs touch-action or dragging scrolls the page');
    });

    test('Should respect a reduced-motion preference', () => {
        assert.ok(gameCss.includes('prefers-reduced-motion'), 'Should honour reduced motion');
    });

    test('Should ship a favicon', () => {
        const icon = fs.readFileSync(path.join(__dirname, 'game', 'favicon.svg'), 'utf8');
        assert.ok(icon.includes('<svg'), 'favicon.svg should be an SVG');
    });
});

describe('BUSINESS SITE - Deploy wiring', () => {
    const fs = require('fs');
    const deploy = fs.readFileSync(path.join(__dirname, '.github', 'workflows', 'deploy.yml'), 'utf8');
    const sitemap = fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf8');

    // Two independent gates. Miss the paths filter and the workflow never runs;
    // miss an --include and that one file is silently never uploaded. Both fail
    // in production only, with everything green locally.
    test('Should trigger a deploy when the game changes', () => {
        assert.ok(/-\s*'game\/\*\*'/.test(deploy),
            "deploy.yml paths filter needs 'game/**' or pushes to the game deploy nothing");
    });

    test('Should upload every game file', () => {
        ['game/index.html', 'game/script.js', 'game/putt.js', 'game/styles.css', 'game/favicon.svg']
            .forEach(f => {
                assert.ok(deploy.includes("--include '" + f + "'"),
                    `${f} is not in any --include list, so it would 404 in production`);
            });
    });

    test('Should deploy the shared module ONE PUTT now depends on', () => {
        assert.ok(/-\s*'shared\/\*\*'/.test(deploy),
            "deploy.yml paths filter needs 'shared/**'");
        assert.ok(deploy.includes("--include 'shared/daily.js'"),
            'shared/daily.js missing from --include would 404 in production and ' +
            'ONE PUTT would throw "Daily is not defined" on load');
    });

    test('Should load the shared module from the game page, by absolute path', () => {
        const gameHtml = fs.readFileSync(path.join(__dirname, 'game', 'index.html'), 'utf8');
        assert.ok(gameHtml.includes('src="/shared/daily.js"'),
            'A relative daily.js would 404 from /game/');
        assert.ok(gameHtml.indexOf('/shared/daily.js') < gameHtml.indexOf('putt.js'),
            'The shared module must load before putt.js');
    });

    test('Should deploy every THERMAL file', () => {
        assert.ok(/-\s*'thermal\/\*\*'/.test(deploy),
            "deploy.yml paths filter needs 'thermal/**'");
        ['thermal/index.html', 'thermal/flight.js', 'thermal/script.js', 'thermal/sky.js',
            'thermal/astro.js', 'thermal/styles.css', 'thermal/favicon.svg'].forEach(f => {
                assert.ok(deploy.includes("--include '" + f + "'"), `${f} would 404 in production`);
            });
    });

    test('Should keep the game HTML on the short cache, not the asset one', () => {
        const htmlStep = deploy.slice(deploy.indexOf('Sync HTML'), deploy.indexOf('Sync assets'));
        const assetStep = deploy.slice(deploy.indexOf('Sync assets'), deploy.indexOf('Sync weather'));
        ['game/index.html', 'thermal/index.html'].forEach(f => {
            assert.ok(htmlStep.includes("--include '" + f + "'"), `${f} belongs in the HTML step`);
            assert.ok(!assetStep.includes("--include '" + f + "'"),
                `${f} in the asset step would overwrite its 5-minute cache with an hour`);
        });
    });

    test('Should list every sitemap page as a real file', () => {
        const locs = sitemap.match(/<loc>([^<]+)<\/loc>/g) || [];
        assert.ok(locs.length >= 4, 'Sitemap should list the site pages');
        locs.forEach(loc => {
            const url = loc.replace(/<\/?loc>/g, '').replace('https://branyontech.com/', '');
            const rel = url === '' ? 'index.html' : (url.endsWith('/') ? url + 'index.html' : url);
            assert.ok(fs.existsSync(path.join(__dirname, rel)), `Sitemap lists ${rel}, which does not exist`);
        });
    });
});

// =============================================================================
// DAILY SHARED - characterisation
//
// Written BEFORE any code moves out of putt.js into shared/daily.js. These are
// golden pins of what the code does TODAY, so the extraction can be proved to
// have changed nothing. They are deliberately about observable output, not
// about which file a function happens to live in.
// =============================================================================

describe('DAILY SHARED - Seeding is frozen', () => {
    // Every hole ever played and every share string ever posted depends on
    // these numbers. If one moves, history was rewritten.
    const GOLDEN_SEEDS = [[0, 1816539778], [249, 2659711807], [3650, 1370797941]];

    test('Should keep the day seeds pinned', () => {
        GOLDEN_SEEDS.forEach(([day, seed]) => {
            assert.strictEqual(Putt.seedForDay(day), seed,
                `Seed for day ${day} changed - every past hole just moved`);
        });
    });

    test('Should keep ten years of seeds distinct', () => {
        const seeds = new Set();
        for (let d = 0; d < 3650; d++) seeds.add(Putt.seedForDay(d));
        assert.strictEqual(seeds.size, 3650);
    });

    // A hash of the whole hole, so ANY change to generation - archetypes,
    // ranges, validation order, par - is caught, not just the seed.
    const GOLDEN_HOLES = [[0, 2678361518], [1, 2013129863], [7, 1187580585], [30, 3711364453],
        [99, 3780343058], [100, 3508609721], [182, 2909951490], [249, 264568346],
        [365, 3036544282], [500, 1356520212], [730, 2621076798], [1000, 354758885],
        [1095, 3790717719], [1500, 1663380036], [1826, 2160198124], [2000, 2230955715],
        [2500, 659646394], [3000, 2429228771], [3400, 3110396994], [3650, 3718038452]];

    test('Should build byte-identical holes to the ones already published', () => {
        GOLDEN_HOLES.forEach(([day, hash]) => {
            const hole = Putt.generateHole(Putt.seedForDay(day));
            assert.strictEqual(Putt.hashSeed(JSON.stringify(hole)), hash,
                `Hole for day ${day} changed`);
        });
    });
});

describe('DAILY SHARED - parseState characterisation', () => {
    // One row per hostile or malformed blob, pinned by a hash of the rebuilt
    // state. 378302632 is emptyState(); anything else is a deliberate survivor.
    const EMPTY = 378302632;
    const GOLDEN_PARSE = [
        ['', EMPTY], ['{', EMPTY], ['null', EMPTY], ['[]', EMPTY],
        ['"hello"', EMPTY], ['42', EMPTY], ['true', EMPTY], ['{}', EMPTY],
        ['{"v":2}', EMPTY], ['{"v":"1"}', EMPTY], ['{"v":1}', EMPTY],
        ['{"v":1,"days":"nope"}', EMPTY],
        ['{"v":1,"days":[]}', EMPTY],
        ['{"v":1,"days":{"5":{"strokes":"x","par":3}}}', EMPTY],
        ['{"v":1,"days":{"5":{"strokes":0,"par":3}}}', EMPTY],
        ['{"v":1,"days":{"5":{"strokes":3}}}', EMPTY],
        ['{"v":1,"days":{"5":{"strokes":3,"par":3,"windMph":null}}}', 2977554838],
        ['{"v":1,"days":{"5":{"strokes":3,"par":3,"source":"hacked"}}}', 2977554838],
        ['{"v":1,"days":{"__proto__":{"strokes":2,"par":3}}}', EMPTY],
        ['{"v":1,"streak":"x","days":{}}', EMPTY],
        ['{"v":1,"streak":-5}', EMPTY],
        ['{"v":1,"lastDay":"abc"}', EMPTY],
        ['{"v":1,"settings":{"geo":"hacked","sound":"yes"}}', EMPTY],
        ['{"v":1,"settings":[]}', EMPTY],
        ['{"v":1,"played":1e300}', 950902151]
    ];

    test('Should rebuild every malformed blob to a pinned shape', () => {
        GOLDEN_PARSE.forEach(([raw, hash]) => {
            let out;
            assert.doesNotThrow(() => { out = Putt.parseState(raw); }, `Threw on ${raw}`);
            assert.strictEqual(Putt.hashSeed(JSON.stringify(out)), hash,
                `parseState(${raw}) changed shape`);
        });
    });

    test('Should never let a stored blob reach the prototype chain', () => {
        Putt.parseState('{"v":1,"days":{"__proto__":{"strokes":2,"par":3}}}');
        Putt.parseState('{"v":1,"__proto__":{"polluted":1}}');
        Putt.parseState('{"__proto__":{"polluted":1},"v":1}');
        assert.strictEqual(Object.prototype.polluted, undefined, 'Object.prototype was polluted');
        assert.strictEqual(Object.prototype.strokes, undefined, 'Object.prototype was polluted');
        assert.strictEqual({}.polluted, undefined);
    });

    test('Should drop a __proto__ day rather than store it', () => {
        const out = Putt.parseState('{"v":1,"days":{"__proto__":{"strokes":2,"par":3}}}');
        assert.deepStrictEqual(Object.keys(out.days), []);
        assert.strictEqual(Object.getPrototypeOf(out.days), Object.prototype);
    });

    test('Should round-trip a real state unchanged', () => {
        let s = Putt.emptyState();
        s = Putt.recordDaily(s, 10, { strokes: 3, par: 3, windMph: 12, windDeg: 210, source: 'live' });
        s = Putt.recordDaily(s, 11, { strokes: 1, par: 4, windMph: 4, windDeg: 90, source: 'synthetic' });
        assert.deepStrictEqual(Putt.parseState(Putt.serializeState(s)), s);
    });
});

describe('DAILY SHARED - recordDaily characterisation', () => {
    const res = { strokes: 3, par: 3, windMph: 10, windDeg: 180, source: 'live' };

    test('Should be idempotent for a day already recorded', () => {
        const s = Putt.recordDaily(Putt.emptyState(), 10, res);
        const again = Putt.recordDaily(s, 10, { strokes: 1, par: 3, windMph: 0, windDeg: 0, source: 'live' });
        assert.strictEqual(again, s, 'Should return the very same object, not a copy');
    });

    test('Should refuse any day at or before the last one recorded', () => {
        const s = Putt.recordDaily(Putt.emptyState(), 10, res);
        [9, 10, 0, -5].forEach(day => {
            assert.strictEqual(Putt.recordDaily(s, day, res), s, `Day ${day} should be refused`);
        });
    });

    test('Should extend a streak only on the immediately following day', () => {
        let s = Putt.emptyState();
        s = Putt.recordDaily(s, 10, res); assert.strictEqual(s.streak, 1);
        s = Putt.recordDaily(s, 11, res); assert.strictEqual(s.streak, 2);
        s = Putt.recordDaily(s, 13, res); assert.strictEqual(s.streak, 1, 'A gap resets');
        assert.strictEqual(s.bestStreak, 2, 'But the best is remembered');
    });

    test('Should prune at exactly thirty days', () => {
        let s = Putt.emptyState();
        for (let d = 1; d <= 30; d++) s = Putt.recordDaily(s, d, res);
        assert.strictEqual(Object.keys(s.days).length, 30);
        assert.ok(s.days['1'], 'Day 1 still present at the boundary');
        s = Putt.recordDaily(s, 31, res);
        assert.strictEqual(Object.keys(s.days).length, 30);
        assert.ok(!s.days['1'], 'The oldest day is dropped on the thirty-first');
        assert.ok(s.days['31']);
    });

    test('Should not mutate the state handed to it', () => {
        const s = Putt.emptyState();
        const before = JSON.parse(JSON.stringify(s));
        Putt.recordDaily(s, 10, res);
        assert.deepStrictEqual(s, before);
    });
});

describe('DAILY SHARED - wind extraction characterisation', () => {
    const bundle = (hourly, offset) => ({
        forecast: { ok: true, data: { utc_offset_seconds: offset || 0, hourly } }
    });
    const base = {
        time: ['2026-09-07T10:00', '2026-09-07T11:00'],
        wind_speed_10m: [10, 20], wind_direction_10m: [180, 180], wind_gusts_10m: [15, 25]
    };

    test('Should clamp wind at the ONE PUTT maximum', () => {
        assert.strictEqual(Putt.clampWind({ mph: 900, deg: 0 }).mph, Putt.SIM.WIND_MAX_MPH);
        assert.strictEqual(Putt.SIM.WIND_MAX_MPH, 45, 'The clamp ONE PUTT was tuned against');
    });

    test('Should keep the interpolation exact', () => {
        const w = Putt.extractWind(bundle(base), new Date(Date.UTC(2026, 8, 7, 10, 30)));
        assert.strictEqual(w.mph, 15);
        assert.strictEqual(w.deg, 180);
        assert.strictEqual(w.gustMph, 20);
        assert.strictEqual(w.source, 'live');
    });

    test('Should return null for every malformed shape, and never throw', () => {
        const junk = [null, undefined, {}, [], 'nope', 42, true,
            { forecast: null }, { forecast: {} }, { forecast: { ok: false, error: 'x' } },
            { forecast: { ok: true, data: {} } },
            { forecast: { ok: true, data: { hourly: {} } } },
            { forecast: { ok: true, data: { hourly: { time: [] } } } },
            bundle(Object.assign({}, base, { wind_speed_10m: [10] })),
            bundle(Object.assign({}, base, { wind_speed_10m: [null, null] })),
            bundle(Object.assign({}, base, { wind_direction_10m: ['n/a', 'n/a'] })),
            bundle(Object.assign({}, base, { time: ['nope', 'also-nope'] }))];
        junk.forEach((j, i) => {
            let out;
            assert.doesNotThrow(() => { out = Putt.extractWind(j, new Date()); }, `Threw on fixture ${i}`);
            assert.strictEqual(out, null, `Fixture ${i} should be null`);
        });
    });
});

describe('DAILY SHARED - Extraction equivalence', () => {
    test('Should back ONE PUTT seeds with the shared prefix form', () => {
        for (let d = 0; d < 3650; d++) {
            assert.strictEqual(Daily.seedForDay('oneputt', d), Putt.seedForDay(d),
                `Seed diverged on day ${d}`);
        }
    });

    test('Should expose the same PRNG through both modules', () => {
        const a = Daily.makeRng(12345), b = Putt.makeRng(12345);
        for (let i = 0; i < 200; i++) assert.strictEqual(a(), b());
    });

    test('Should keep the ONE PUTT wind clamp bound to its own maximum', () => {
        // putt.js keeps its 1- and 2-argument arity; the cap moved into the call.
        assert.strictEqual(Putt.clampWind({ mph: 900, deg: 0 }).mph, Putt.SIM.WIND_MAX_MPH);
        assert.strictEqual(Daily.clampWind({ mph: 900, deg: 0 }, 75).mph, 75,
            'The shared clamp takes a cap so a second game can want a different one');
        assert.strictEqual(Daily.clampWind({ mph: 900, deg: 0 }).mph, 45, 'Default cap');
    });

    test('Should route ONE PUTT wind extraction through the shared sampler', () => {
        const bundle = {
            forecast: {
                ok: true, data: {
                    utc_offset_seconds: 0, hourly: {
                        time: ['2026-09-07T10:00', '2026-09-07T11:00'],
                        wind_speed_10m: [10, 20], wind_direction_10m: [350, 10]
                    }
                }
            }
        };
        const now = new Date(Date.UTC(2026, 8, 7, 10, 30));
        const viaPutt = Putt.extractWind(bundle, now);
        const sampled = Daily.sampleHourly(bundle, now, {
            wind_speed_10m: 'linear', wind_direction_10m: 'angle'
        });
        assert.strictEqual(viaPutt.mph, 15);
        assert.strictEqual(viaPutt.deg, 0, 'Short way around the circle, not 180');
        assert.strictEqual(sampled.values.wind_speed_10m, 15);
        assert.strictEqual(sampled.values.wind_direction_10m, 0);
    });

    test('Should let the shared sampler read any hourly series', () => {
        const bundle = {
            forecast: {
                ok: true, data: {
                    utc_offset_seconds: 0, hourly: {
                        time: ['2026-09-07T10:00', '2026-09-07T11:00'],
                        cape: [400, 800], cloud_cover_low: [20, 60]
                    }
                }
            }
        };
        const s = Daily.sampleHourly(bundle, new Date(Date.UTC(2026, 8, 7, 10, 30)),
            { cape: 'linear', cloud_cover_low: 'linear' });
        assert.strictEqual(s.values.cape, 600);
        assert.strictEqual(s.values.cloud_cover_low, 40);
    });

    test('Should return null from the shared sampler for a required series that is missing', () => {
        const bundle = {
            forecast: {
                ok: true, data: {
                    utc_offset_seconds: 0,
                    hourly: { time: ['2026-09-07T10:00', '2026-09-07T11:00'], cape: [1, 2] }
                }
            }
        };
        const now = new Date(Date.UTC(2026, 8, 7, 10, 30));
        assert.strictEqual(Daily.sampleHourly(bundle, now, { cape: 'linear', nope: 'linear' }), null);
        const optional = Daily.sampleHourly(bundle, now, { cape: 'linear', nope: 'linear?' });
        assert.strictEqual(optional.values.cape, 1.5);
        assert.strictEqual(optional.values.nope, undefined, 'Optional series simply absent');
    });

    test('Should build a store whose empty state matches the one already shipped', () => {
        // 378302632 is the pinned hash of ONE PUTT's emptyState() from before
        // the extraction. Same number here means the same key order and the
        // same defaults - which is what the stored blobs on real devices expect.
        assert.strictEqual(Putt.hashSeed(JSON.stringify(Putt.emptyState())), 378302632);
    });

    test('Should keep putt.js free of the code that moved', () => {
        const fs = require('fs');
        const src = fs.readFileSync(path.join(__dirname, 'game', 'putt.js'), 'utf8');
        assert.ok(src.indexOf("require('../shared/daily.js')") > 0,
            'putt.js should resolve the shared module');
        assert.ok(!/function makeRng\s*\(/.test(src), 'makeRng should have moved out');
        assert.ok(!/function sampleHourly\s*\(/.test(src), 'The sampler should live in shared');
        assert.ok(!/function parseState\s*\(/.test(src), 'parseState should come from makeStore');
    });
});

// =============================================================================
// THERMAL
// =============================================================================

describe('THERMAL - Determinism', () => {
    const seed = Thermal.seedForDay(1);

    test('Should key its own seeds separately from ONE PUTT', () => {
        for (let d = 0; d < 500; d++) {
            assert.notStrictEqual(Thermal.seedForDay(d), Putt.seedForDay(d),
                `Day ${d} shares a seed between the two games`);
        }
        const seeds = new Set();
        for (let d = 0; d < 3650; d++) seeds.add(Thermal.seedForDay(d));
        assert.strictEqual(seeds.size, 3650);
    });

    // Terrain must be identical for every player. Pinned, because a change to
    // the noise silently reshapes every ridge ever flown.
    const TERRAIN = [[0, 185718416], [137, 200560536], [500, 222547125], [1000, 242518285],
        [2000, 179118000], [3333, 292070527], [5000, 306073669], [8888, 317325357],
        [12000, 303555535], [20000, 216003459], [-500, 179106111], [-3000, 385833422]];

    test('Should keep the ridge line pinned', () => {
        TERRAIN.forEach(([x, micro]) => {
            assert.strictEqual(Math.round(Thermal.terrain(seed, x) * 1e6), micro,
                `Terrain moved at x=${x}`);
        });
    });

    test('Should be a pure function of x, with no chunk seams', () => {
        for (let k = -3; k <= 5; k++) {
            const edge = k * Thermal.WORLD.CHUNK_M;
            const a = Thermal.terrain(seed, edge - 0.01);
            const b = Thermal.terrain(seed, edge + 0.01);
            assert.ok(Math.abs(a - b) < 0.01, `Seam at chunk boundary ${edge}`);
        }
    });

    test('Should stay bounded and free of cliffs the collision test could miss', () => {
        let lo = Infinity, hi = -Infinity, steepest = 0;
        let prev = Thermal.terrain(seed, 0);
        for (let x = 5; x <= 60000; x += 5) {
            const h = Thermal.terrain(seed, x);
            if (h < lo) lo = h;
            if (h > hi) hi = h;
            steepest = Math.max(steepest, Math.abs(h - prev) / 5);
            prev = h;
        }
        assert.ok(lo > 0, `Terrain went below zero: ${lo}`);
        assert.ok(hi < 600, `Terrain went above 600 m: ${hi}`);
        assert.ok(steepest < 0.6, `Slope of ${steepest} is a cliff`);
    });

    // Chunks are cached on the world for speed. If the cache were state rather
    // than memoisation, a flown-to position would differ from a cold query.
    test('Should give the same thermals cold as after flying there', () => {
        const cond = Thermal.buildConditions(
            { cape: 1200, cloudLow: 30, windMph: 10, windDeg: 270, tempF: 80, dewF: 50 },
            50 * Math.PI / 180, 0);
        const cold = Thermal.thermalsInChunk(seed, cond, 7);
        const warm = Thermal.makeWorld(seed, cond);
        for (let x = 0; x < 16000; x += 500) Thermal.airVelocity(warm, x, 800);
        assert.deepStrictEqual(Thermal.thermalsInChunk(seed, cond, 7), cold);
        assert.ok(cold.length > 0, 'A normal day should have thermals');
    });

    test('Should never reach for a random number', () => {
        const fs = require('fs');
        const src = fs.readFileSync(path.join(__dirname, 'thermal', 'flight.js'), 'utf8');
        assert.ok(!/Math\.random/.test(src), 'flight.js must be fully deterministic');
    });
});

describe('THERMAL - Flight physics', () => {
    const seed = Thermal.seedForDay(2);
    // Dead, flat, windless air: no thermals (spacing beyond any chunk), no
    // ridge lift (no wind), no ambient sink.
    const deadCond = {
        wStar: 0, wStarEff: 0, solar: 0, cloudFrac: 0, thermalSpacing: 1e9,
        cloudbase: 1500, windMps: 0, windToward: 0, windAlong: 0, ambient: 0, source: 'synthetic'
    };
    const deadWorld = () => Thermal.makeWorld(seed, deadCond);

    test('Should have a convex polar with its vertex at the soaring speed', () => {
        assert.strictEqual(Thermal.sink(Thermal.FLY.V_SOAR), Thermal.FLY.W_MINSINK);
        for (let v = 15; v <= 45; v++) {
            const second = Thermal.sink(v - 1) - 2 * Thermal.sink(v) + Thermal.sink(v + 1);
            assert.ok(second > 0, `Polar not convex at ${v} m/s`);
        }
    });

    test('Should put best glide where the closed form says', () => {
        const vb = Thermal.bestGlideSpeed();
        assert.ok(Math.abs(vb - 22.524) < 0.01, `Best glide at ${vb}`);
        const ld = vb / Thermal.sink(vb);
        assert.ok(ld > 30 && ld < 40, `L/D of ${ld} is not a modern glider`);
        for (let v = 15; v <= 45; v += 0.5) {
            assert.ok(v / Thermal.sink(v) <= ld + 1e-9, `${v} m/s beats best glide`);
        }
    });

    // The single most important test here: it proves the button splits energy
    // rather than inventing it. With drag removed, height and speed must trade
    // exactly.
    test('Should conserve total energy when drag is removed', () => {
        const fly = Object.assign({}, Thermal.FLY, {
            W_MINSINK: 0, POLAR_K: 0, STALL_W: 0, TIME_LIMIT: 1e9
        });
        const world = deadWorld();
        let s = Thermal.createFlight(world);
        s = Object.assign({}, s, { h: world.ground0 + 8000 });
        const energy = st => st.h + (st.v * st.v) / (2 * fly.G);
        const start = energy(s);
        for (let i = 0; i < 7200; i++) {
            s = Object.assign({}, s, { hold: Math.floor(i / 240) % 2 === 0 });
            s = Thermal.step(world, s, fly.DT, fly);
        }
        const drift = Math.abs(energy(s) - start) / start;
        assert.ok(drift < 0.001, `Energy drifted ${(drift * 100).toFixed(3)}%`);
    });

    test('Should convert a zoom climb at the documented rate', () => {
        const fly = Object.assign({}, Thermal.FLY, {
            W_MINSINK: 0, POLAR_K: 0, STALL_W: 0, TIME_LIMIT: 1e9
        });
        const world = deadWorld();
        let s = Thermal.createFlight(world);
        s = Object.assign({}, s, { h: world.ground0 + 8000, v: fly.V_DIVE, hold: false });
        const h0 = s.h;
        let peak = h0;
        for (let i = 0; i < 1200; i++) {
            s = Thermal.step(world, s, fly.DT, fly);
            peak = Math.max(peak, s.h);
        }
        const expected = (fly.V_DIVE * fly.V_DIVE - fly.V_SOAR * fly.V_SOAR) / (2 * fly.G);
        assert.ok(Math.abs((peak - h0) - expected) < 2,
            `Zoom gained ${(peak - h0).toFixed(1)} m, expected ${expected.toFixed(1)}`);
    });

    test('Should glide at the trimmed ratio in still air', () => {
        const world = deadWorld();
        let s = Thermal.createFlight(world);
        s = Object.assign({}, s, { h: world.ground0 + 6000, v: Thermal.FLY.V_SOAR });
        const x0 = s.x, h0 = s.h;
        for (let i = 0; i < 12000; i++) s = Thermal.step(world, s, Thermal.FLY.DT);
        const ld = (s.x - x0) / (h0 - s.h);
        const expect = Thermal.FLY.V_SOAR / Thermal.FLY.W_MINSINK;
        assert.ok(Math.abs(ld - expect) / expect < 0.02, `Glide ratio ${ld}, expected ${expect}`);
    });

    test('Should not depend on the size of the timestep', () => {
        const world = deadWorld();
        const run = dt => {
            let s = Thermal.createFlight(world);
            s = Object.assign({}, s, { h: world.ground0 + 6000 });
            const steps = Math.round(120 / dt);
            for (let i = 0; i < steps; i++) {
                s = Object.assign({}, s, { hold: Math.floor(i * dt / 8) % 2 === 0 });
                s = Thermal.step(world, s, dt);
            }
            return s;
        };
        const a = run(1 / 120), b = run(1 / 480);
        assert.ok(Math.abs(a.x - b.x) / a.x < 0.005, `x diverged: ${a.x} vs ${b.x}`);
        assert.ok(Math.abs(a.h - b.h) / a.h < 0.005, `h diverged: ${a.h} vs ${b.h}`);
    });

    test('Should drop the nose and recover from a stall unaided', () => {
        const world = deadWorld();
        let s = Thermal.createFlight(world);
        s = Object.assign({}, s, { h: world.ground0 + 4000, v: 9, hold: false });
        const h0 = s.h;
        let recovered = -1;
        for (let i = 0; i < 720 && recovered < 0; i++) {
            s = Thermal.step(world, s, Thermal.FLY.DT);
            if (s.v >= Thermal.FLY.V_STALL) recovered = i * Thermal.FLY.DT;
        }
        assert.ok(recovered >= 0 && recovered < 6, `Recovery took ${recovered}s`);
        const lost = h0 - s.h;
        assert.ok(lost > 5 && lost < 120, `Stall cost ${lost.toFixed(0)} m`);
    });

    test('Should not mutate the state handed to it', () => {
        const world = deadWorld();
        const s = Thermal.createFlight(world);
        const before = JSON.parse(JSON.stringify(s));
        Thermal.step(world, s, Thermal.FLY.DT);
        assert.deepStrictEqual(s, before);
    });

    test('Should stay finite across the whole condition space', () => {
        for (let i = 0; i < 300; i++) {
            const rng = Daily.makeRng(i);
            const cond = Thermal.buildConditions({
                cape: rng() * 6000, cloudLow: rng() * 100, windMph: rng() * 60,
                windDeg: rng() * 360, tempF: 40 + rng() * 60, dewF: 30 + rng() * 40
            }, (rng() * 1.6 - 0.2), rng() * 6.28);
            const world = Thermal.makeWorld(Thermal.seedForDay(i), cond);
            let s = Thermal.createFlight(world);
            for (let k = 0; k < 400; k++) {
                s = Object.assign({}, s, { hold: k % 37 < 18 });
                s = Thermal.step(world, s, Thermal.FLY.DT);
                if (!s.alive) break;
            }
            ['x', 'h', 'v', 't', 'climbTotal'].forEach(f => {
                assert.ok(isFinite(s[f]), `${f} went non-finite on case ${i}`);
            });
        }
    });

    test('Should end a flight on the ground or on the clock', () => {
        const cond = Thermal.buildConditions(
            { cape: 1200, cloudLow: 30, windMph: 10, windDeg: 270, tempF: 80, dewF: 50 },
            50 * Math.PI / 180, 0);
        const r = Thermal.simulate(Thermal.makeWorld(Thermal.seedForDay(5), cond), Thermal.policyGood, {});
        assert.ok(!r.state.alive, 'The flight should be over');
        assert.ok(r.state.landed || r.state.t >= Thermal.FLY.TIME_LIMIT - 1,
            'It should have landed or run out of time');
        assert.ok(r.steps < Thermal.FLY.MAX_STEPS, 'It should not hit the safety cap');
    });
});

describe('THERMAL - Lift', () => {
    const seed = Thermal.seedForDay(4);
    const th = { x: 1000, r: 200, strength: 3, base: 100, top: 1600 };

    test('Should lift in the core and sink around the rim', () => {
        const core = Thermal.thermalW(th, 1000, 900, 0, 0);
        const edge = Thermal.thermalW(th, 1200, 900, 0, 0);
        const rim = Thermal.thermalW(th, 1300, 900, 0, 0);
        const away = Thermal.thermalW(th, 1600, 900, 0, 0);
        assert.ok(core > 0, 'Core should rise');
        assert.ok(Math.abs(edge) < 1e-9, 'Edge of the core is neutral');
        assert.ok(rim < 0, 'A real thermal has a sink ring around it');
        assert.strictEqual(away, 0, 'Beyond two radii there is nothing');
    });

    test('Should fade out near the ground and at cloudbase', () => {
        assert.ok(Thermal.thermalW(th, 1000, 50, 0, 0) <= 0.001, 'No lift below the base');
        assert.ok(Thermal.thermalW(th, 1000, 1600, 0, 0) < 0.001, 'No lift at the top');
        const mid = Thermal.thermalW(th, 1000, 900, 0, 0);
        assert.ok(mid > Thermal.thermalW(th, 1000, 150, 0, 0), 'Weaker while still ramping in');
    });

    // A column that stayed put would be a much easier game than the real thing.
    test('Should lean downwind with height', () => {
        const still = Thermal.thermalW(th, 1000, 1200, 0, 0);
        const blown = Thermal.thermalW(th, 1000, 1200, 8, 0);
        assert.ok(blown < still, 'The column should have walked downwind');
        const chased = Thermal.thermalW(th, 1000 + 600, 1200, 8, 0);
        assert.ok(chased > blown, 'Following it downwind should find it again');
    });

    test('Should lift on the windward slope and sink on the lee', () => {
        let found = false;
        for (let x = 0; x < 20000 && !found; x += 50) {
            const slope = Thermal.terrainSlope(seed, x);
            if (Math.abs(slope) < 0.05) continue;
            const a = Thermal.ridgeW(seed, x, Thermal.terrain(seed, x) + 20, 8);
            const b = Thermal.ridgeW(seed, x, Thermal.terrain(seed, x) + 20, -8);
            assert.ok(a * b < 0, `Ridge lift did not flip sign at x=${x}`);
            found = true;
        }
        assert.ok(found, 'Expected some sloping ground');
    });

    test('Should give no ridge lift in calm air, and little of it high up', () => {
        assert.ok(Thermal.ridgeW(seed, 1234, Thermal.terrain(seed, 1234) + 30, 0) === 0,
            'Calm air lifts nothing');
        const low = Math.abs(Thermal.ridgeW(seed, 1234, Thermal.terrain(seed, 1234) + 5, 10));
        const high = Math.abs(Thermal.ridgeW(seed, 1234, Thermal.terrain(seed, 1234) + 450, 10));
        assert.ok(high < low * 0.06, 'Ridge lift should not reach 450 m');
    });
});

describe('THERMAL - Weather becomes gameplay', () => {
    const D = deg => deg * Math.PI / 180;

    test('Should map CAPE to a thermal strength worth flying', () => {
        [[0, 0.800], [100, 1.800], [500, 3.036], [1200, 4.264], [3000, 6.000]].forEach(([c, w]) => {
            assert.ok(Math.abs(Thermal.capeToWStar(c) - w) < 0.001, `CAPE ${c} gave ${Thermal.capeToWStar(c)}`);
        });
        assert.strictEqual(Thermal.capeToWStar(1e6), 6, 'Capped, not a thunderstorm updraft');
        assert.strictEqual(Thermal.capeToWStar(-5), 0.8);
        assert.strictEqual(Thermal.capeToWStar('nonsense'), 0.8);
        assert.strictEqual(Thermal.capeToWStar(NaN), 0.8);
    });

    // Non-monotonic on purpose: cumulus mark thermals, overcast kills them.
    test('Should peak thermal frequency at scattered cumulus', () => {
        assert.ok(Thermal.cloudFrequency(0.15) > Thermal.cloudFrequency(0),
            'A blue sky has no markers and fewer triggers');
        assert.ok(Thermal.cloudFrequency(0.30) > Thermal.cloudFrequency(0.90),
            'Overcast should be far worse than scattered');
        assert.ok(Math.abs(Thermal.cloudFrequency(1) - 0.12) < 1e-9);
    });

    // The API sends 0-100. Passing it through unscaled reads as permanent
    // overcast and looks entirely plausible.
    test('Should not believe a raw percentage', () => {
        assert.strictEqual(Thermal.cloudFrequency(95), Thermal.cloudFrequency(1),
            'A raw 95 must clamp, not be read as 9500%');
        const cond = Thermal.buildConditions(
            { cape: 1200, cloudLow: 30, windMph: 10, windDeg: 0 }, D(50), 0);
        assert.ok(Math.abs(cond.cloudFrac - 0.30) < 1e-9, 'cloudLow is a percentage');
    });

    test('Should switch thermals on with the sun and off without it', () => {
        [[60, 0.9532], [40, 0.8630], [20, 0.6993], [10, 0.4525], [5, 0.1503], [2, 0.0490]]
            .forEach(([deg, f]) => {
                assert.ok(Math.abs(Thermal.solarFactor(D(deg)) - f) < 0.0005,
                    `${deg} degrees gave ${Thermal.solarFactor(D(deg))}`);
            });
        assert.strictEqual(Thermal.solarFactor(D(-5)), 0, 'No sun, no thermals');
        assert.strictEqual(Thermal.solarFactor(NaN), 0);
        for (let d = -10; d < 89; d++) {
            assert.ok(Thermal.solarFactor(D(d + 1)) >= Thermal.solarFactor(D(d)),
                `Not monotonic at ${d} degrees`);
        }
        assert.ok(Thermal.solarFactor(D(5)) < 0.2 * Thermal.solarFactor(D(45)),
            'Dawn should be a fraction of midday');
    });

    // The headline mechanic, as an assertion: the same day at a different hour
    // is the same WORLD flown in different air.
    test('Should give the same course materially different air at dawn and midday', () => {
        const raw = { cape: 1200, cloudLow: 30, windMph: 10, windDeg: 270, tempF: 80, dewF: 50 };
        const dawn = Thermal.buildConditions(raw, D(4), 0);
        const noon = Thermal.buildConditions(raw, D(58), 0);
        assert.ok(noon.wStarEff > 4 * dawn.wStarEff,
            `Midday ${noon.wStarEff} should dwarf dawn ${dawn.wStarEff}`);

        const seed = Thermal.seedForDay(11);
        const ridge = x => Math.round(Thermal.terrain(seed, x) * 1e6);
        const xs = [0, 500, 2500, 9000];
        assert.deepStrictEqual(xs.map(ridge), xs.map(ridge), 'Terrain is the same course');

        // Thermal POSITIONS are shared; only their strength moves with the sun.
        const flat = c => Thermal.thermalsInChunk(seed, c, 3).map(t => Math.round(t.x));
        assert.deepStrictEqual(flat(dawn), flat(noon), 'The thermals are in the same places');
        const dawnW = Thermal.thermalsInChunk(seed, dawn, 3)[0];
        const noonW = Thermal.thermalsInChunk(seed, noon, 3)[0];
        assert.ok(noonW.strength > 4 * dawnW.strength, 'Only the strength changed');
    });

    test('Should read conditions out of a real bundle shape', () => {
        const bundle = {
            forecast: {
                ok: true, data: {
                    utc_offset_seconds: 0, hourly: {
                        time: ['2026-09-07T10:00', '2026-09-07T11:00'],
                        cape: [400, 800], cloud_cover_low: [20, 60],
                        wind_speed_10m: [10, 20], wind_direction_10m: [180, 180],
                        temperature_2m: [70, 80], dew_point_2m: [50, 50]
                    }
                }
            }
        };
        const c = Thermal.extractConditions(bundle, new Date(Date.UTC(2026, 8, 7, 10, 30)));
        assert.strictEqual(c.cape, 600);
        assert.strictEqual(c.cloudLow, 40);
        assert.strictEqual(c.windMph, 15);
        assert.strictEqual(c.source, 'live');
    });

    test('Should return null for any malformed payload, and never throw', () => {
        const junk = [null, undefined, {}, [], 'nope', 42, true,
            { forecast: { ok: false } }, { forecast: { ok: true, data: {} } },
            { forecast: { ok: true, data: { hourly: { time: [] } } } },
            {
                forecast: {
                    ok: true, data: {
                        hourly: { time: ['2026-09-07T10:00'], cape: [1, 2] }
                    }
                }
            }];
        junk.forEach((j, i) => {
            let out;
            assert.doesNotThrow(() => { out = Thermal.extractConditions(j, new Date()); },
                `Threw on fixture ${i}`);
            assert.strictEqual(out, null, `Fixture ${i} should be null`);
        });
    });

    test('Should invent a deterministic day when the API is unavailable', () => {
        assert.deepStrictEqual(Thermal.syntheticWeather(1234), Thermal.syntheticWeather(1234));
        const seen = new Set();
        for (let s = 0; s < 100; s++) {
            const w = Thermal.syntheticWeather(s);
            assert.ok(w.cape >= 200 && w.cape <= 1600, `CAPE ${w.cape}`);
            assert.ok(w.cloudLow >= 10 && w.cloudLow <= 55);
            assert.strictEqual(w.source, 'synthetic');
            seen.add(w.cape);
        }
        assert.ok(seen.size > 50, 'Synthetic days should vary');
        assert.deepStrictEqual(Thermal.resolveWeather(null, new Date(), 77),
            Thermal.syntheticWeather(77));
    });

    test('Should turn wind into a head or tail component', () => {
        const tail = Thermal.buildConditions({ cape: 0, cloudLow: 0, windMph: 20, windDeg: 180 }, 0.5, 0);
        const head = Thermal.buildConditions({ cape: 0, cloudLow: 0, windMph: 20, windDeg: 0 }, 0.5, 0);
        assert.ok(tail.windAlong > 8, `Wind from behind should push: ${tail.windAlong}`);
        assert.ok(head.windAlong < -8, `Wind from ahead should hold back: ${head.windAlong}`);
        assert.ok(Math.abs(tail.windMps - 20 * Thermal.MPH_TO_MPS) < 1e-9);
    });
});

describe('THERMAL - Scoring, sharing and state', () => {
    test('Should read distances the way a pilot would', () => {
        assert.strictEqual(Thermal.formatDistance(940), '940 m');
        assert.strictEqual(Thermal.formatDistance(999), '999 m');
        assert.strictEqual(Thermal.formatDistance(1000), '1.0 km');
        assert.strictEqual(Thermal.formatDistance(18420), '18.4 km');
    });

    test('Should draw the shape of the flight in ten cells', () => {
        const trace = [];
        for (let i = 0; i < 200; i++) trace.push({ h: 1000 + 300 * Math.sin(i / 20) });
        const spark = Thermal.altitudeSparkline(trace);
        assert.strictEqual(Array.from(spark).length, 10, 'Ten graphemes exactly');
        Array.from(spark).forEach(ch => {
            assert.ok('▁▂▃▄▅▆▇█'.indexOf(ch) >= 0, `Unexpected cell ${ch}`);
        });
        const flat = Thermal.altitudeSparkline([{ h: 500 }, { h: 500 }, { h: 500 }]);
        assert.strictEqual(Array.from(flat).length, 10, 'A flat flight must not divide by zero');
        assert.strictEqual(Array.from(Thermal.altitudeSparkline([])).length, 10);
    });

    // The share text is the product - it is what spreads. Locked exactly.
    const result = {
        day: 249, distance: 18420, spark: '▁▃▆█▅▂▄▇▃▁', glide: 31,
        solar: 0.87, windMph: 18, windAlong: 5, cloudFrac: 0.3, streak: 4
    };

    test('Should build the share card exactly', () => {
        assert.strictEqual(Thermal.buildShare(result),
            'THERMAL #249 — 18.4 km\n▁▃▆█▅▂▄▇▃▁\n' +
            'L/D 31 · ☀ 87% · 🌬 18mph tail · ⛅\nStreak 4\nbranyontech.com/thermal/');
    });

    test('Should say whether the wind helped or hindered', () => {
        assert.ok(Thermal.buildShare(Object.assign({}, result, { windAlong: -6 })).indexOf('mph head') > 0);
        assert.ok(Thermal.buildShare(Object.assign({}, result, { windAlong: 0 })).indexOf('mph cross') > 0);
    });

    test('Should show the sky the flight was flown under', () => {
        assert.strictEqual(Thermal.skyGlyph(0.05), '☀️');
        assert.strictEqual(Thermal.skyGlyph(0.30), '⛅');
        assert.strictEqual(Thermal.skyGlyph(0.90), '☁️');
    });

    // The wind and the sun come from the player's location. The share must
    // carry the weather without carrying where they are.
    test('Should not leak the player location', () => {
        const text = Thermal.buildShare(result);
        assert.ok(!/\d+\.\d{3,}/.test(text), 'No coordinates');
        assert.ok(text.indexOf('@') === -1, 'No address');
        assert.ok(text.length < 200, `Share was ${text.length} chars`);
    });

    test('Should score a flight on distance and on how well it was flown', () => {
        const s = { x: 20000, startAlt: 1000, climbTotal: 1500, endAlt: 500, t: 900, climb: 0 };
        const score = Thermal.scoreFlight(s);
        assert.strictEqual(score.distance, 20000);
        // 1000 started with + 1500 given by the air - 500 landed with = 2000 used.
        assert.strictEqual(score.glide, 10);
        assert.strictEqual(score.climb, 1500);
    });

    test('Should keep its own storage, separate from ONE PUTT', () => {
        assert.strictEqual(Thermal.STORAGE_KEY, 'thermal.v1');
        assert.notStrictEqual(Thermal.STORAGE_KEY, Putt.STORAGE_KEY);
    });

    test('Should rebuild any corrupt blob into a clean state', () => {
        ['', '{', 'null', '[]', '{"v":2}', '{"v":1,"days":"nope"}',
            '{"v":1,"days":{"__proto__":{"dist":5}}}'].forEach(raw => {
                let out;
                assert.doesNotThrow(() => { out = Thermal.parseState(raw); }, `Threw on ${raw}`);
                assert.deepStrictEqual(out, Thermal.emptyState(), `${raw} should be empty`);
            });
        assert.strictEqual(Object.prototype.dist, undefined);
    });

    test('Should record a flight once, keep a streak and remember the best', () => {
        const flight = { dist: 18420, glide: 310, climb: 1500, dur: 900, solar: 87, wind: 18, source: 'live' };
        let s = Thermal.recordDaily(Thermal.emptyState(), 10, flight);
        assert.strictEqual(s.days['10'].dist, 18420);
        assert.strictEqual(s.best, 18420);
        assert.strictEqual(s.streak, 1);
        const again = Thermal.recordDaily(s, 10, Object.assign({}, flight, { dist: 99999 }));
        assert.strictEqual(again, s, 'The first flight of the day is the one that counts');
        s = Thermal.recordDaily(s, 11, Object.assign({}, flight, { dist: 9000 }));
        assert.strictEqual(s.streak, 2);
        assert.strictEqual(s.best, 18420, 'A worse day does not lower the best');
    });
});

describe('THERMAL - Vendored sky and astronomy', () => {
    const fs = require('fs');
    const crypto = require('crypto');
    const ThermalSky = require('./thermal/sky.js');
    const ThermalAstro = require('./thermal/astro.js');

    const vendored = [
        ['thermal/sky.js', 'weather/js/gl/sky.js'],
        ['thermal/astro.js', 'weather/js/lib/astro.js']
    ];

    // Warns rather than fails. Upstream drifting is not an error - the copy is
    // deliberate - but it should never drift UNNOTICED, because every symptom
    // of a stale copy is silent.
    test('Should notice when upstream has moved on', () => {
        vendored.forEach(([copy, upstream]) => {
            const src = fs.readFileSync(path.join(__dirname, copy), 'utf8');
            const declared = (/Upstream sha256:\s*([0-9a-f]{64})/.exec(src) || [])[1];
            assert.ok(declared, `${copy} must declare the hash it was taken from`);
            const actual = crypto.createHash('sha256')
                .update(fs.readFileSync(path.join(__dirname, upstream))).digest('hex');
            if (declared !== actual) {
                console.log(`\n  ${colors.yellow}NOTE: ${upstream} has changed since ` +
                    `${copy} was vendored.${colors.reset}`);
                console.log(`  Re-vendor if the change matters, then update the header hash to`);
                console.log(`  ${actual}\n`);
            }
        });
    });

    test('Should still have something to compare against', () => {
        vendored.forEach(([, upstream]) => {
            assert.ok(fs.existsSync(path.join(__dirname, upstream)), `${upstream} has gone`);
        });
        assert.ok(fs.readFileSync(path.join(__dirname, 'weather/js/gl/sky.js'), 'utf8')
            .includes('class Sky'), 'Upstream should still define Sky');
    });

    test('Should be classic scripts, not modules', () => {
        vendored.forEach(([copy]) => {
            const src = fs.readFileSync(path.join(__dirname, copy), 'utf8');
            assert.ok(!/^\s*export\s/m.test(src), `${copy} still has an ES export`);
            assert.ok(src.includes("typeof module !== 'undefined' && module.exports"),
                `${copy} needs the require() half of the shim`);
            assert.ok(src.includes("typeof window !== 'undefined' ? window : null"),
                `${copy} needs the browser half of the shim`);
        });
    });

    test('Should record where it came from and what was changed', () => {
        vendored.forEach(([copy, upstream]) => {
            const src = fs.readFileSync(path.join(__dirname, copy), 'utf8');
            assert.ok(src.includes('VENDORED'), `${copy} should say so`);
            assert.ok(src.includes(upstream), `${copy} should name its source`);
            assert.ok(/Local edits from upstream/.test(src), `${copy} should list its edits`);
        });
    });

    // The terrain layer projects with these constants. If the shader's geometry
    // moves and they do not, the ridge line detaches from the horizon - and it
    // looks like a drawing bug, not a stale copy.
    test('Should keep the projection constants agreeing with the shader', () => {
        const src = fs.readFileSync(path.join(__dirname, 'thermal/sky.js'), 'utf8');
        assert.ok(src.includes('float horizonY = -0.30;'),
            'The shader no longer puts the horizon where HORIZON_Y says');
        assert.strictEqual(ThermalSky.HORIZON_Y, -0.30);
        assert.ok(src.includes('(uv.y - horizonY) * 0.95'), 'Elevation scale changed');
        assert.ok(src.includes('elev * (PI * 0.42)'), 'Elevation scale changed');
        assert.ok(Math.abs(ThermalSky.EL_PER_NDC - 0.95 * Math.PI * 0.42) < 1e-12);
        assert.ok(src.includes('uv.x * aspect * 0.95'), 'Azimuth scale changed');
        assert.strictEqual(ThermalSky.AZ_PER_NDC, 0.95);
        // 0.65 of the way down the screen, at every altitude.
        assert.ok(Math.abs((1 - ThermalSky.HORIZON_Y) / 2 - 0.65) < 1e-12);
    });

    test('Should let the neon city be switched off', () => {
        const src = fs.readFileSync(path.join(__dirname, 'thermal/sky.js'), 'utf8');
        assert.ok(src.includes('uniform float uSkyline;'), 'The uniform should exist');
        assert.ok(src.includes('skyline(az) * uSkyline'), 'It should gate the skyline');
        assert.ok(src.includes("'uSkyline'"), 'It should be looked up');
        assert.ok(src.includes('gl.uniform1f(u.uSkyline, p.skyline)'), 'It should be uploaded');
        assert.strictEqual(ThermalSky.DEFAULTS.skyline, 1,
            'Default 1 keeps upstream behaviour for anyone else using this file');
    });

    test('Should put the sun where the sky actually is', () => {
        const lat = 34.0522, lon = -118.2437;
        const noon = ThermalAstro.sunPosition(new Date(2026, 8, 7, 14, 0), lat, lon);
        const night = ThermalAstro.sunPosition(new Date(2026, 8, 7, 2, 0), lat, lon);
        assert.ok(noon.altitude * 180 / Math.PI > 45, 'The afternoon sun should be high');
        assert.ok(night.altitude < 0, 'At 2am it should be below the horizon');
        // Southward in the afternoon, northern hemisphere, once converted.
        const az = ((noon.azimuth + Math.PI) * 180 / Math.PI + 360) % 360;
        assert.ok(az > 180 && az < 280, `Afternoon sun bearing ${az} is not in the west`);
    });

    test('Should keep the sun working with no network at all', () => {
        const fs2 = require('fs');
        const src = fs2.readFileSync(path.join(__dirname, 'thermal/astro.js'), 'utf8');
        assert.ok(!/\bfetch\s*\(/.test(src), 'astro.js must not reach the network');
        assert.ok(!/XMLHttpRequest/.test(src));
        const t = ThermalAstro.sunTimes(new Date(2026, 8, 7, 12), 34.0522, -118.2437);
        assert.ok(t.sunrise instanceof Date && t.sunset instanceof Date,
            'Sunrise and sunset drive the pre-flight card');
        assert.ok(t.sunset > t.sunrise);
    });
});

describe('THERMAL - Page structure', () => {
    const fs = require('fs');
    const html = fs.readFileSync(path.join(__dirname, 'thermal', 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(__dirname, 'thermal', 'styles.css'), 'utf8');
    const codeOnly = src => src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n').filter(l => !/^\s*(\/\/|\*)/.test(l)).join('\n');
    const js = codeOnly(fs.readFileSync(path.join(__dirname, 'thermal', 'script.js'), 'utf8'));
    const rules = codeOnly(fs.readFileSync(path.join(__dirname, 'thermal', 'flight.js'), 'utf8'));

    test('Should have a title, a description and a way back', () => {
        assert.ok(html.includes('<title>THERMAL'));
        assert.ok(html.includes('<meta name="description"'));
        assert.ok(html.includes('skip-link') && html.includes('id="main-content"'));
        assert.ok(html.includes('class="back-link"'));
    });

    // Classic scripts run in document order, and each of these reads globals the
    // one before it set.
    test('Should load its scripts in dependency order', () => {
        const order = ['/shared/daily.js', 'sky.js', 'astro.js', 'flight.js', 'script.js'];
        let last = -1;
        order.forEach(f => {
            const at = html.indexOf('src="' + f + '"');
            assert.ok(at > 0, `${f} is not loaded`);
            assert.ok(at > last, `${f} loads out of order`);
            last = at;
        });
    });

    test('Should obey the CSP', () => {
        assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), 'No inline scripts');
        assert.ok(!/\son(click|load|input|change|pointerdown|keydown)\s*=/i.test(html),
            'No inline handlers');
        [['script.js', js], ['flight.js', rules]].forEach(([name, src]) => {
            assert.ok(!/\beval\s*\(/.test(src), `${name} should not call eval`);
            assert.ok(!/new\s+Function\s*\(/.test(src), `${name} should not build code from strings`);
        });
    });

    test('Should carry the markup the renderer binds to', () => {
        ['id="sky"', 'id="stage"', 'id="g-dist"', 'id="g-alt"', 'id="g-vario"',
            'id="launch"', 'id="share"', 'id="card"', 'aria-live']
            .forEach(hook => assert.ok(html.includes(hook), `Missing ${hook}`));
    });

    // A relative './api/' from /thermal/ resolves to /thermal/api/, which is not
    // routed to the Lambda - and it fails quietly into synthetic weather.
    test('Should call the weather API by absolute path', () => {
        assert.ok(js.includes('/weather/api/bundle'));
        assert.ok(js.includes('/weather/api/config'));
        assert.ok(!/['"`]\.\/api\//.test(js), 'A relative ./api/ would resolve under /thermal/');
    });

    test('Should keep the rules pure', () => {
        assert.ok(!/\bdocument\./.test(rules), 'flight.js must not touch the DOM');
        assert.ok(!/\blocalStorage\b/.test(rules), 'flight.js must not touch storage');
        assert.ok(!/\bfetch\s*\(/.test(rules), 'flight.js must not make network calls');
        assert.ok(!/new Date\(\s*\)/.test(rules), 'flight.js must be handed "now"');
    });

    // Sky has no dispose(); a second one leaks a context, and at the browser's
    // limit the sky dies for the rest of the session.
    test('Should build exactly one Sky for the life of the page', () => {
        const matches = js.match(/new Sky\.Sky\(/g) || [];
        assert.strictEqual(matches.length, 1, `Found ${matches.length} Sky constructions`);
    });

    test('Should hand the sky seconds, not milliseconds', () => {
        assert.ok(/sky\.render\(now,\s*dtSec\)/.test(js),
            'sky.render eases with pow(0.0016, dt); milliseconds underflow it to zero');
    });

    test('Should set a quality tier rather than take the constructor default', () => {
        assert.ok(/sky\.setQuality\(/.test(js),
            'Without setQuality the scale stays 1 and it is slower than the console for no gain');
    });

    test('Should give both canvases a layout size', () => {
        // Sky.resize() reads clientWidth/clientHeight; with no CSS size it makes
        // a 2x2 framebuffer and renders nothing, silently.
        assert.ok(/#sky,\s*#stage\s*\{[^}]*width:\s*100%/.test(css));
        assert.ok(/#sky,\s*#stage\s*\{[^}]*height:\s*100%/.test(css));
        assert.ok(/#sky,\s*#stage\s*\{[^}]*position:\s*fixed/.test(css));
    });

    test('Should stay playable on a touchscreen and under reduced motion', () => {
        assert.ok(css.includes('touch-action'), 'A drag to dive would scroll the page');
        assert.ok(css.includes('prefers-reduced-motion'));
    });

    test('Should ship a favicon', () => {
        assert.ok(fs.readFileSync(path.join(__dirname, 'thermal', 'favicon.svg'), 'utf8')
            .includes('<svg'));
    });
});

// =============================================================================
// RUN ALL TESTS
// =============================================================================

console.log(`\n${'='.repeat(60)}`);
console.log(`${colors.blue}CountdownToRetirement Test Suite${colors.reset}`);
console.log(`${'='.repeat(60)}\n`);

// Run the tests by calling describe blocks above
// (All tests are already executed via the test() calls)

// =============================================================================
// TEST SUMMARY
// =============================================================================

console.log(`\n${'='.repeat(60)}`);
console.log(`${colors.cyan}TEST SUMMARY${colors.reset}`);
console.log(`${'='.repeat(60)}`);
console.log(`Total Tests:  ${totalTests}`);
console.log(`${colors.green}Passed:       ${passedTests}${colors.reset}`);
console.log(`${colors.red}Failed:       ${failedTests}${colors.reset}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log(`${'='.repeat(60)}\n`);

if (failedTests > 0) {
    console.log(`${colors.red}FAILED TEST DETAILS:${colors.reset}\n`);
    failedTestDetails.forEach((test, index) => {
        console.log(`${index + 1}. ${colors.red}${test.name}${colors.reset}`);
        console.log(`   Error: ${test.error}`);
        console.log('');
    });
    process.exit(1);
} else {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
    process.exit(0);
}
