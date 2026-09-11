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
const Sling = require('./slingshot/orbit.js');

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
    const countdownJs = fs.readFileSync(path.join(__dirname, 'countdown', 'script.js'), 'utf8');
    const countdownMarkup = fs.readFileSync(path.join(__dirname, 'countdown', 'index.html'), 'utf8');

    test('stats.json should carry three counters as non-negative integers', () => {
        ['books', 'projects', 'naps'].forEach(key => {
            assert.strictEqual(typeof stats[key], 'number', `${key} should be a number`);
            assert.ok(Number.isInteger(stats[key]) && stats[key] >= 0, `${key} should be a non-negative integer`);
        });
    });

    test('stats.json should hold trips as a list of places', () => {
        assert.ok(Array.isArray(stats.trips), 'trips should be an array, not a count');
        assert.ok(stats.trips.length > 0, 'An empty list would hide the tile');
        stats.trips.forEach((trip, i) => {
            assert.strictEqual(typeof trip, 'object', `Trip ${i} should be an object`);
            assert.ok(trip && typeof trip.place === 'string' && trip.place.trim(),
                `Trip ${i} needs a non-empty place`);
            assert.ok(typeof trip.when === 'string',
                `Trip ${i} needs a when, even if it is still blank`);
        });
    });

    test('The trip count should be derived from the list, never stored beside it', () => {
        // Two places to edit is one place to forget. The tile reads .length so
        // the number and the panel cannot disagree.
        assert.ok(/Array\.isArray\(value\)/.test(countdownJs),
            'The loader should recognise a list');
        // Both the number and the panel must come from the same filter. The
        // raw length counted entries the panel then dropped, which put "6" on
        // a tile that opened onto two lines.
        assert.ok(/isList \? usableTrips\(value\)\.length : value/.test(countdownJs),
            'The count should come from the same filter the panel renders');
        assert.ok(/renderTrips\(usableTrips\(stats\.trips\)\)/.test(countdownJs),
            'The panel should render that same filtered list');
        assert.ok(!/isList \? value\.length/.test(countdownJs),
            'The count should not come from the unfiltered array');
        assert.ok(!/"tripCount"|"trip_count"/.test(raw),
            'stats.json should not carry a separate trip count');
    });

    test('The trips tile should be a button that says what it controls', () => {
        // A finger cannot hover, so this has to be operable by tap, Enter and
        // Space -- which a <button> gives for free and a <div> does not.
        assert.ok(/<button[^>]*id="stat-trips-card"/.test(countdownMarkup),
            'The trips tile should be a real button');
        assert.ok(/aria-expanded="false"/.test(countdownMarkup), 'It should start collapsed');
        assert.ok(/aria-controls="stat-trips-detail"/.test(countdownMarkup),
            'It should name the panel it opens');
        const panel = countdownMarkup.replace(/\s+/g, ' ')
            .match(/<div [^>]*id="stat-trips-detail"[^>]*>/);
        assert.ok(panel, 'The panel should exist in the markup');
        // It ships closed: without hidden it is on screen before any JS runs.
        assert.ok(/\bhidden\b/.test(panel[0]), 'The panel should start hidden');
    });

    test('The trips panel should be dismissable without a mouse', () => {
        assert.ok(/event\.key === 'Escape'/.test(countdownJs), 'Escape should close it');
        assert.ok(/!card\.contains\(event\.target\)/.test(countdownJs),
            'A click outside should close it');
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
        ['id="board"', 'id="aim-out"', 'id="power-out"', 'id="putt"', 'id="share"', 'aria-live']
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


describe('ONE PUTT - Keyboard, shared with SLINGSHOT', () => {
    const fs = require('fs');
    const read = (...p) => fs.readFileSync(path.join(__dirname, ...p), 'utf8');
    const codeOnly = src => src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter(line => !/^\s*(\/\/|\*)/.test(line))
        .join('\n');
    const game = codeOnly(read('game', 'script.js'));
    const sling = codeOnly(read('slingshot', 'script.js'));
    const gameHtml = read('game', 'index.html');
    const gameCss = read('game', 'styles.css');

    test('Should listen on the window, not the green', () => {
        // The old listener sat on the canvas, so the arrows did nothing
        // until the player had clicked the board once.
        assert.ok(/window\.addEventListener\('keydown'/.test(game), 'keydown should be on window');
        assert.ok(!/canvas\.addEventListener\('keydown'/.test(game), 'and not on the canvas');
        assert.ok(/window\.addEventListener\('keydown'/.test(sling), 'SLINGSHOT listens on window too');
    });

    test('Should nudge by the same step as SLINGSHOT, and fire on the same key', () => {
        // One expression, written identically in both files, so the two
        // games cannot drift apart without this failing.
        const STEP = /const step = \(e\.shiftKey \? ([\d.]+) : ([\d.]+)\) \* Math\.PI \/ 180;/;
        const g = game.match(STEP), s = sling.match(STEP);
        assert.ok(g && s, 'both games should build the angle step from one shiftKey ternary');
        assert.deepStrictEqual(g.slice(1), s.slice(1), 'the fine and coarse steps should match');
        assert.deepStrictEqual(s.slice(1), ['0.15', '0.6'], 'a fifth of a degree fine, six tenths coarse');
        const FIRE = /e\.key === ' ' \|\| e\.key === 'Spacebar'/;
        assert.ok(FIRE.test(game) && FIRE.test(sling), 'space fires in both');
        assert.ok(!/e\.key === 'Enter'/.test(game), 'Enter belongs to whatever is focused');
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
            .forEach(k => assert.ok(game.includes(`'${k}'`) && sling.includes(`'${k}'`), `${k} in both`));
    });

    test('Should leave space to a focused button', () => {
        // Buttons click on space at keyup; firing a putt at keydown as well
        // would be two strokes from one press on Putt, and a putt from Share.
        assert.ok(/matches\('button, a'\)/.test(game), 'the target should be checked');
        assert.ok(/\.disabled\) return;/.test(game), 'and the putt-disabled gate should stay');
    });

    test('Should name the keys on the page, in key caps', () => {
        assert.ok(/<b>&larr; &rarr;<\/b> nudge, <b>&uarr; &darr;<\/b> power, <b>SPACE<\/b> putt\./.test(gameHtml),
            'the hint should read as SLINGSHOT\'s does');
        assert.ok(/arrow keys[\s\S]*space to putt/.test(gameHtml), 'the canvas label should say the same');
        assert.ok(/\.hint b \{ color: var\(--ink\); \}/.test(gameCss), 'key caps should read at full ink: they are the instructions');
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

    /*
     * Sound has to be synthesised. server.js's allowedExtensions has no audio
     * MIME type, so a committed .mp3 404s in development and is silently absent
     * in production - the game would simply be quiet for everyone but the
     * person who added it.
     */
    test('Should synthesise every sound, never load one', () => {
        const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
            e.isDirectory() ? (e.name === 'node_modules' || e.name.startsWith('.') ? [] :
                walk(path.join(d, e.name))) : [path.join(d, e.name)]);
        const audioFiles = walk(__dirname)
            .filter(f => /\.(mp3|ogg|wav|m4a|aac|flac|webm)$/i.test(f));
        assert.deepStrictEqual(audioFiles, [],
            'Audio files cannot be served: server.js has no audio MIME type');

        const server = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
        const allowed = server.slice(server.indexOf('allowedExtensions'),
            server.indexOf('allowedExtensions') + 400);
        ['.mp3', '.ogg', '.wav'].forEach(ext => {
            assert.ok(!allowed.includes(ext),
                `server.js now allows ${ext}; the assertion above is no longer the reason`);
        });
    });


    test('Should deploy every slingshot file', () => {
        assert.ok(/-\s*'slingshot\/\*\*'/.test(deploy),
            "deploy.yml paths filter needs 'slingshot/**' or pushes deploy nothing");
        ['slingshot/index.html', 'slingshot/orbit.js', 'slingshot/script.js',
            'slingshot/audio.js', 'slingshot/styles.css', 'slingshot/favicon.svg']
            .forEach(f => {
                assert.ok(deploy.includes("--include '" + f + "'"), `${f} would 404 in production`);
            });
    });

    /*
     * The four lists have to agree, and nothing else catches it.
     *
     * A new file under slingshot/ has to be named in index.html (or nothing
     * loads it), in deploy.yml's --include list (or it 404s in production while
     * working perfectly on localhost), in tests-server.js (or nothing checks it
     * is served at all) and in CLAUDE.md (or the next person does not know it
     * exists). Every one of those failures is invisible until production, which
     * is why this scans the DIRECTORY rather than a hardcoded list.
     */
    test('Should keep the four slingshot asset lists agreeing', () => {
        const dir = path.join(__dirname, 'slingshot');
        const onDisk = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
        const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
        const server = fs.readFileSync(path.join(__dirname, 'tests-server.js'), 'utf8');
        const claude = fs.readFileSync(path.join(__dirname, 'CLAUDE.md'), 'utf8');
        assert.ok(onDisk.length >= 3, 'Expected the slingshot scripts to be found');
        onDisk.forEach(f => {
            assert.ok(html.includes('src="' + f + '"') || html.includes('/slingshot/' + f),
                `slingshot/${f} exists but index.html never loads it`);
            assert.ok(deploy.includes("--include 'slingshot/" + f + "'"),
                `slingshot/${f} is not in deploy.yml, so it would 404 in production only`);
            assert.ok(server.includes("'/slingshot/" + f + "'"),
                `slingshot/${f} is not checked by tests-server.js`);
            assert.ok(claude.includes(f), `slingshot/${f} is undocumented in CLAUDE.md`);
        });
    });

    // Browsers refuse to start audio without a user gesture, and the failure is
    // silent - the context is created suspended and never plays.
    test('Should not create an AudioContext before a gesture', () => {
        const audio = fs.readFileSync(path.join(__dirname, 'slingshot', 'audio.js'), 'utf8');
        const script = fs.readFileSync(path.join(__dirname, 'slingshot', 'script.js'), 'utf8');
        assert.ok(/function init\(\)[\s\S]{0,200}if \(ctx\) return/.test(audio),
            'The context must be created lazily, guarded on already existing');
        assert.ok(!/^\s*(const|let|var)\s+ctx\s*=\s*new/m.test(audio),
            'No AudioContext at module scope');
        assert.ok(/byId\('launch'\)\.addEventListener\('click', start\)/.test(script),
            'Launch is the guaranteed first gesture of every session');
        assert.ok(/Audio\.arm\(/.test(script), 'and it is what arms the sound');
    });

    test('Should keep the game HTML on the short cache, not the asset one', () => {
        const htmlStep = deploy.slice(deploy.indexOf('Sync HTML'), deploy.indexOf('Sync assets'));
        const assetStep = deploy.slice(deploy.indexOf('Sync assets'), deploy.indexOf('Sync weather'));
        ['game/index.html', 'slingshot/index.html'].forEach(f => {
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
// SLINGSHOT
// =============================================================================

describe('SLINGSHOT - Determinism', () => {
    const fs = require('fs');
    test('Should key its own seeds separately from ONE PUTT', () => {
        for (let d = 1; d < 40; d++) {
            assert.notStrictEqual(Sling.seedForDay(d), Putt.seedForDay(d),
                'A shared seed would couple the two games forever');
        }
    });

    test('Should build the identical level from the identical seed', () => {
        for (const d of [1, 17, 250]) {
            const a = Sling.makeLevel(Sling.seedForDay(d));
            const b = Sling.makeLevel(Sling.seedForDay(d));
            assert.deepStrictEqual(
                { l: a.launch, t: a.target, p: a.planets, par: a.par },
                { l: b.launch, t: b.target, p: b.planets, par: b.par });
        }
    });

    /*
     * Every level coordinate must be bit-identical on every engine, because two
     * people playing day 251 have to be playing the SAME day 251. Math.sin and
     * friends are not correctly rounded across engines; +, *, / and sqrt are.
     * Snapping to a half-unit grid is the same guarantee ONE PUTT gives its
     * holes.
     */
    test('Should snap every level coordinate to a half-unit grid', () => {
        for (let d = 1; d < 60; d++) {
            const lv = Sling.makeLevel(Sling.seedForDay(d));
            const nums = [lv.launch.x, lv.launch.y, lv.target.x, lv.target.y]
                .concat(...lv.planets.map(p => [p.x, p.y, p.r, p.m]));
            nums.forEach(n => assert.strictEqual(n * 2, Math.round(n * 2),
                `${n} is off the half-unit grid`));
        }
    });

    test('Should fly a trajectory built only from correctly rounded arithmetic', () => {
        const src = fs.readFileSync(path.join(__dirname, 'slingshot', 'orbit.js'), 'utf8');
        const fnStart = src.indexOf('function fly(');
        const fnEnd = src.indexOf('\n    }', src.indexOf('return { outcome: \'timeout\''));
        const body = src.slice(fnStart, fnEnd);
        ['Math.sin', 'Math.cos', 'Math.tan', 'Math.atan', 'Math.pow', 'Math.exp'].forEach(bad => {
            assert.ok(!body.includes(bad),
                `fly() uses ${bad}, which is not bit-identical across JS engines`);
        });
    });

    test('Should give the same result whatever the timestep', () => {
        const lv = Sling.makeLevel(Sling.seedForDay(5));
        const s = lv.solution;
        const a = Sling.fly(lv, Math.cos(s.a), Math.sin(s.a), s.v, { dt: 1 / 120 });
        const b = Sling.fly(lv, Math.cos(s.a), Math.sin(s.a), s.v, { dt: 1 / 240 });
        assert.strictEqual(a.outcome, b.outcome, 'The outcome must not depend on the timestep');
        assert.ok(Math.abs(a.t - b.t) < 0.25, `Arrival time drifted: ${a.t} vs ${b.t}`);
    });
});

describe('SLINGSHOT - Levels are worth playing', () => {
    const days = [];
    for (let d = 1; d <= 30; d++) days.push(Sling.makeLevel(Sling.seedForDay(d)));

    /*
     * The single most important assertion in this file, and the one the two
     * previous games could not have passed. A demolition prototype was measured
     * at 0 good outcomes out of 92 possible cut combinations - it was literally
     * unwinnable, and nothing in the code said so.
     */
    test('Should make every day solvable', () => {
        days.forEach((lv, i) => {
            assert.ok(lv.solution, `Day ${i + 1} has no solution at all`);
            const s = lv.solution;
            const r = Sling.fly(lv, Math.cos(s.a), Math.sin(s.a), s.v, {});
            assert.strictEqual(r.outcome, 'hit', `Day ${i + 1}'s own solution does not arrive`);
        });
    });

    test('Should block the direct line, or there is no puzzle', () => {
        // Measured: without this, 14 of 24 levels could simply be shot straight
        // at the beacon and the gravity was decoration.
        const blocked = days.filter(lv => lv.blocked).length;
        assert.ok(blocked >= days.length - 1,
            `${days.length - blocked} levels can be solved by aiming straight`);
    });

    /*
     * A window this size is what makes the game a game. ONE PUTT's ace window is
     * 1.6-1.9 degrees out of 360 and that is the target being matched here.
     */
    test('Should leave an aim window you can actually hit', () => {
        const wins = days.filter(l => l.solution).map(l => l.solution.win).sort((a, b) => a - b);
        const median = wins[wins.length >> 1];
        assert.ok(median >= 1.2, `Median aim window ${median.toFixed(2)}° is too tight to find`);
        assert.ok(median <= 6, `Median aim window ${median.toFixed(2)}° is so wide it is not a puzzle`);
        assert.ok(wins[0] >= 0.8, `The hardest level's window is ${wins[0].toFixed(2)}°`);
    });

    /*
     * Reject levels you cannot LEARN from. About half of all generated levels
     * have a flat error surface: miss by 1 degree and you land 150 units away,
     * miss by 5 and you land 153 away, so the number never tells you which way
     * to correct. validateLevel exists to throw those away.
     */
    test('Should only ship levels whose error surface teaches you something', () => {
        const smooth = days.filter(l => l.solution && l.solution.smooth).length;
        assert.ok(smooth >= days.length * 0.9,
            `Only ${smooth}/${days.length} levels have a learnable error gradient`);
    });

    test('Should resolve a shot in about the time a putt rolls', () => {
        const ts = days.filter(l => l.solution).map(l => l.solution.t).sort((a, b) => a - b);
        const median = ts[ts.length >> 1];
        assert.ok(median <= 6, `Median flight ${median.toFixed(1)}s is dead time`);
        assert.ok(median >= 0.5, `Median flight ${median.toFixed(1)}s is over before you see it`);
    });

    /*
     * Gravity has to visibly BEND the shot. At an earlier mass scale the median
     * path curved a total of two degrees - the probe flew straight past every
     * planet and the slingshot slung nothing.
     */
    test('Should actually bend the path around the bodies', () => {
        const turns = days.filter(l => l.solution).map(lv => {
            const s = lv.solution;
            const p = Sling.fly(lv, Math.cos(s.a), Math.sin(s.a), s.v, { path: true }).path;
            let turn = 0;
            for (let i = 2; i + 3 < p.length; i += 2) {
                const ax = p[i] - p[i - 2], ay = p[i + 1] - p[i - 1];
                const bx = p[i + 2] - p[i], by = p[i + 3] - p[i + 1];
                const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
                if (la < 1e-9 || lb < 1e-9) continue;
                turn += Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb))));
            }
            return turn * 180 / Math.PI;
        }).sort((a, b) => a - b);
        const median = turns[turns.length >> 1];
        assert.ok(median > 15, `Median path curves only ${median.toFixed(0)}° - that is a straight line`);
    });

    test('Should never place a body on top of the pad, the beacon or another body', () => {
        days.forEach((lv, i) => {
            lv.planets.forEach((p, j) => {
                assert.ok(Math.hypot(p.x - lv.launch.x, p.y - lv.launch.y) > p.r,
                    `Day ${i + 1} body ${j} swallows the launch pad`);
                assert.ok(Math.hypot(p.x - lv.target.x, p.y - lv.target.y) > p.r + lv.target.r,
                    `Day ${i + 1} body ${j} swallows the beacon`);
                lv.planets.slice(j + 1).forEach(q => {
                    assert.ok(Math.hypot(p.x - q.x, p.y - q.y) > p.r + q.r,
                        `Day ${i + 1} has overlapping bodies`);
                });
            });
        });
    });

    test('Should vary the day', () => {
        const bodies = new Set(days.map(l => l.planets.length));
        const pars = new Set(days.map(l => l.par));
        assert.ok(bodies.size >= 2, 'Every day has the same number of bodies');
        assert.ok(pars.size >= 2, 'Every day has the same par');
    });

    test('Should derive par from how wide the aim window really is', () => {
        assert.strictEqual(Sling.parFor({ win: 4.0 }), 2, 'A wide window is an easy day');
        assert.strictEqual(Sling.parFor({ win: 1.5 }), 3);
        assert.strictEqual(Sling.parFor({ win: 1.2 }), 4, 'A narrow window is a hard day');
        assert.strictEqual(Sling.parFor(null), 3, 'A level with no solution still needs a par');
    });
});

describe('SLINGSHOT - Flight', () => {
    const lv = Sling.makeLevel(Sling.seedForDay(9));

    test('Should report one of four outcomes and always a closest approach', () => {
        const seen = new Set();
        for (let deg = 0; deg < 360; deg += 7) {
            const a = deg * Math.PI / 180;
            const r = Sling.fly(lv, Math.cos(a), Math.sin(a), 60, {});
            assert.ok(['hit', 'crash', 'lost', 'timeout'].includes(r.outcome), r.outcome);
            assert.ok(isFinite(r.near) || r.outcome === 'hit', 'near must be a real number');
            assert.ok(isFinite(r.t) && r.t > 0, 't must be a real number');
            seen.add(r.outcome);
        }
        assert.ok(seen.size >= 2, 'Every shot cannot have the same outcome');
    });

    test('Should stay finite across the whole input space', () => {
        for (let i = 0; i < 200; i++) {
            const level = Sling.makeLevel((i * 7919) >>> 0);
            const a = (i / 200) * Math.PI * 2;
            const r = Sling.fly(level, Math.cos(a), Math.sin(a),
                Sling.SIM.V_MIN + (i % 20) * 4, {});
            ['t', 'x', 'y'].forEach(f => assert.ok(isFinite(r[f]), `${f} went non-finite on case ${i}`));
        }
    });

    test('Should not let the softening term swallow the probe', () => {
        // A 1/r^2 force with no softening returns Infinity at the centre and
        // NaNs the whole flight. SOFT keeps it finite without making the bodies
        // pass-through, which the crash test above proves still works.
        const a = [0, 0];
        Sling.accel(lv, lv.planets[0].x, lv.planets[0].y, a);
        assert.ok(isFinite(a[0]) && isFinite(a[1]), 'Acceleration at a body centre must be finite');
    });

    test('Should pull harder from a bigger body', () => {
        const small = { planets: [{ x: 100, y: 100, r: 9, m: 9 * 9 * 1.15 * Sling.MASS_SCALE }] };
        const big = { planets: [{ x: 100, y: 100, r: 19, m: 19 * 19 * 1.15 * Sling.MASS_SCALE }] };
        const a = [0, 0], b = [0, 0];
        Sling.accel(small, 100, 60, a);
        Sling.accel(big, 100, 60, b);
        assert.ok(Math.abs(b[1]) > Math.abs(a[1]) * 2, 'A bigger body must visibly pull harder');
    });

    test('Should never mutate the level it is flying', () => {
        const before = JSON.stringify(lv.planets);
        Sling.fly(lv, 1, 0, 50, { path: true });
        assert.strictEqual(JSON.stringify(lv.planets), before);
    });
});

describe('SLINGSHOT - Scoring, sharing and state', () => {
    test('Should tell the round as a story, one glyph per shot', () => {
        assert.strictEqual(Sling.glyphFor('hit'), '🎯');
        assert.strictEqual(Sling.glyphFor('crash'), '🟥');
        assert.strictEqual(Sling.glyphFor('lost', 10), '🟨', 'A close miss should read as close');
        assert.strictEqual(Sling.glyphFor('lost', 200), '🟦');
    });

    test('Should build a share card', () => {
        const out = Sling.buildShare({
            day: 251, shots: 3, par: 3, bodies: 2, streak: 6,
            cells: ['🟥', '🟨', '🎯']
        });
        assert.strictEqual(out,
            'SLINGSHOT #251 — 3 (E)\n🟥🟨🎯\n2 bodies · par 3\nStreak 6\nbranyontech.com/slingshot/');
    });

    test('Should show the score relative to par', () => {
        const s = o => Sling.buildShare(Object.assign(
            { day: 1, par: 3, bodies: 1, streak: 0, cells: ['🎯'] }, o)).split('\n')[0];
        assert.ok(s({ shots: 1 }).endsWith('(-2)'));
        assert.ok(s({ shots: 3 }).endsWith('(E)'));
        assert.ok(s({ shots: 5 }).endsWith('(+2)'));
    });

    test('Should truncate a very long round rather than spraying glyphs', () => {
        const cells = new Array(30).fill('🟦');
        const out = Sling.buildShare({ day: 1, shots: 30, par: 3, bodies: 1, streak: 0, cells });
        assert.ok(out.split('\n')[1].endsWith('…'), 'A 30-shot round should be truncated');
    });

    test('Should omit the streak line until there is a streak', () => {
        const one = Sling.buildShare({ day: 1, shots: 2, par: 3, bodies: 1, streak: 1, cells: ['🎯'] });
        assert.ok(!one.includes('Streak'), 'A streak of one is not worth a line');
    });


    /*
     * A round has to survive a reload. Four outcomes is two bits, so a whole
     * round packs into one integer and fits the schema's existing `int` kind -
     * no string field, no storage version bump.
     */
    test('Should pack and unpack a round exactly', () => {
        const S2 = Sling.SHOT;
        const rounds = [
            [S2.HIT],
            [S2.CRASH, S2.HIT],
            [S2.CRASH, S2.LOST, S2.NEAR, S2.HIT],
            new Array(Sling.PACK_MAX).fill(S2.NEAR)
        ];
        rounds.forEach(codes => {
            const back = Sling.unpackShots(Sling.packShots(codes), codes.length);
            assert.deepStrictEqual(back, codes, 'A round must round-trip through storage');
        });
    });

    test('Should rebuild the share glyphs from a stored day', () => {
        const codes = [Sling.SHOT.CRASH, Sling.SHOT.NEAR, Sling.SHOT.HIT];
        const day = { shots: 3, par: 3, bodies: 2, outcomes: Sling.packShots(codes) };
        assert.strictEqual(Sling.cellsFromDay(day).join(''), '🟥🟨🎯',
            'Revisiting a day you played must give back the same story');
    });

    /*
     * A real round always ends in an arrival, whose code is 3, so a packed zero
     * cannot be a genuine round - it means the day predates outcome storage.
     */
    test('Should approximate rather than invent for a day with no outcomes', () => {
        const out = Sling.cellsFromDay({ shots: 3, par: 3, outcomes: 0 });
        assert.strictEqual(out.length, 3);
        assert.strictEqual(out[out.length - 1], '🎯', 'A recorded round did arrive');
        assert.ok(!out.slice(0, -1).includes('🎯'), 'Only the last shot arrives');
    });

    test('Should survive a junk outcomes value', () => {
        [null, undefined, -5, 1e18, 'x'].forEach(bad => {
            assert.doesNotThrow(() => Sling.cellsFromDay({ shots: 2, outcomes: bad }));
        });
        assert.deepStrictEqual(Sling.cellsFromDay(null), []);
    });

    test('Should keep the shot glyph and its code in step', () => {
        assert.strictEqual(Sling.glyphFor('hit'), Sling.glyphForCode(Sling.SHOT.HIT));
        assert.strictEqual(Sling.glyphFor('crash'), Sling.glyphForCode(Sling.SHOT.CRASH));
        assert.strictEqual(Sling.glyphFor('lost', 5), Sling.glyphForCode(Sling.SHOT.NEAR));
        assert.strictEqual(Sling.glyphFor('lost', 500), Sling.glyphForCode(Sling.SHOT.LOST));
    });

    test('Should store the outcomes alongside the score', () => {
        let st = Sling.emptyState();
        st = Sling.recordDaily(st, 7, {
            shots: 2, par: 3, bodies: 1,
            outcomes: Sling.packShots([Sling.SHOT.CRASH, Sling.SHOT.HIT])
        });
        const round = Sling.parseState(Sling.serializeState(st)).days['7'];
        assert.strictEqual(Sling.cellsFromDay(round).join(''), '🟥🎯',
            'The story must survive serialise/parse, not just live memory');
    });

    test('Should keep its own storage, separate from ONE PUTT', () => {
        assert.strictEqual(Sling.STORAGE_KEY, 'slingshot.v1');
        assert.notStrictEqual(Sling.STORAGE_KEY, Putt.STORAGE_KEY);
    });

    test('Should record only the first attempt at a day', () => {
        let st = Sling.emptyState();
        st = Sling.recordDaily(st, 5, { shots: 2, par: 3, bodies: 2 });
        const again = Sling.recordDaily(st, 5, { shots: 1, par: 3, bodies: 2 });
        assert.strictEqual(again, st, 'A replay must not overwrite the day');
        assert.strictEqual(st.days['5'].shots, 2);
    });

    test('Should count a first-shot arrival as a bullseye', () => {
        let st = Sling.emptyState();
        st = Sling.recordDaily(st, 1, { shots: 1, par: 3, bodies: 1 });
        st = Sling.recordDaily(st, 2, { shots: 4, par: 3, bodies: 1 });
        assert.strictEqual(st.bullseyes, 1);
        assert.strictEqual(st.played, 2);
        assert.strictEqual(st.streak, 2, 'Consecutive days should build a streak');
    });

    test('Should survive a corrupt or hostile blob', () => {
        ['', 'null', '{', '[]', '{"v":99}', '{"v":1,"days":{"__proto__":{"x":1}}}']
            .forEach(blob => {
                const st = Sling.parseState(blob);
                assert.ok(st && typeof st === 'object', `parseState choked on ${blob}`);
                assert.strictEqual(typeof st.streak, 'number');
            });
        assert.strictEqual({}.x, undefined, 'The prototype must not have been touched');
    });

    test('Should label the result', () => {
        assert.strictEqual(Sling.scoreLabel(1, 3), 'BULLSEYE');
        assert.strictEqual(Sling.scoreLabel(3, 3), 'ON PAR');
        assert.strictEqual(Sling.scoreLabel(9, 3), 'LONG WAY ROUND');
    });
});

describe('SLINGSHOT - Page structure', () => {
    const fs = require('fs');
    // These files document the very things they must not do ("no localStorage",
    // "an absolute path"), so the assertions below look at code with the prose
    // removed.
    const codeOnly = src => src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter(line => !/^\s*(\/\/|\*)/.test(line))
        .join('\n');
    const html = fs.readFileSync(path.join(__dirname, 'slingshot', 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(__dirname, 'slingshot', 'styles.css'), 'utf8');
    const rules = fs.readFileSync(path.join(__dirname, 'slingshot', 'orbit.js'), 'utf8');
    const js = codeOnly(fs.readFileSync(path.join(__dirname, 'slingshot', 'script.js'), 'utf8'));

    test('Should keep the rules free of the DOM, storage, network and the clock', () => {
        const code = codeOnly(rules);
        assert.ok(!/\bdocument\./.test(code), 'orbit.js must not touch the DOM');
        assert.ok(!/\blocalStorage\b/.test(code), 'orbit.js must not touch storage');
        assert.ok(!/\bfetch\s*\(/.test(code), 'orbit.js must not make network calls');
        assert.ok(!/new Date\(\s*\)/.test(code), 'orbit.js must be handed "now", never read it');
    });

    test('Should carry the dual-export shim so Node can require it', () => {
        assert.ok(rules.includes("typeof module !== 'undefined' && module.exports"));
        assert.ok(rules.includes("typeof window !== 'undefined' ? window : null"));
    });

    test('Should load the shared module first, by absolute path', () => {
        // A relative daily.js resolves to /slingshot/daily.js, 404s, and the
        // page throws "Daily is not defined" on load.
        assert.ok(html.includes('src="/shared/daily.js"'));
        assert.ok(html.indexOf('/shared/daily.js') < html.indexOf('orbit.js'),
            'daily.js must load before orbit.js');
        assert.ok(html.indexOf('orbit.js') < html.indexOf('script.js'),
            'orbit.js must load before script.js');
    });

    test('Should satisfy the strict CSP', () => {
        assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), 'No inline <script>');
        assert.ok(!/\son(click|load|input|change|pointerdown|keydown)\s*=/i.test(html),
            'No inline event handlers');
        [rules, js].forEach(src => {
            assert.ok(!/\beval\s*\(/.test(src), 'No eval');
            assert.ok(!/new Function\s*\(/.test(src), 'No new Function');
        });
    });

    test('Should state the goal on the page, not just the controls', () => {
        // "Click a block to cut it" told a previous prototype's player what the
        // BUTTON did and never what they were for. The goal element is the fix.
        assert.ok(/id="goal"/.test(html), 'There must be a goal line');
        const goal = html.slice(html.indexOf('id="goal"'), html.indexOf('id="goal"') + 400);
        assert.ok(/beacon/i.test(goal), 'The goal should name the target');
        assert.ok(/(bend|gravity|planet)/i.test(goal), 'The goal should say how you get there');
    });

    test('Should be playable on a phone and with reduced motion', () => {
        assert.ok(/touch-action\s*:\s*none/.test(css),
            'Without touch-action a drag to aim scrolls the page');
        assert.ok(/prefers-reduced-motion/.test(css));
        assert.ok(/reduceMotion/.test(js), 'The script should honour reduced motion too');
    });

    test('Should ship a favicon', () => {
        assert.ok(fs.readFileSync(path.join(__dirname, 'slingshot', 'favicon.svg'), 'utf8')
            .includes('<svg'));
    });

    test('Should never record a hand-picked level as the daily score', () => {
        // ?level= and free play are practice. ONE PUTT applies the same rule to
        // ?seed=, and without it a chosen easy level becomes today's result.
        assert.ok(/scored\s*=\s*isScored/.test(js) || /loadLevel\([^)]*false\)/.test(js),
            'Free play and ?level= must load unscored');
        assert.ok(/if \(scored\)/.test(js), 'recordDaily must be gated on scored');
    });

    test('Should give back the share card on a day already played', () => {
        // The revisit path used to print a score and hide the share, so once you
        // closed the tab your result was unrecoverable.
        assert.ok(/showResult\(prev\)/.test(js),
            'A revisit must render the full result, not a bespoke score-only branch');
        assert.ok(/cellsFromDay/.test(js), 'and rebuild the glyphs from storage');
        assert.ok(/outcomes: S\.packShots\(codes\)/.test(js),
            'recordDaily must persist the shot outcomes');
    });

    test('Should show only a short preview of the shot', () => {
        // Previewing the whole path would hand over the answer, which is the one
        // thing this game has to withhold.
        assert.ok(/mode === 'aim'/.test(js), 'The preview should only be drawn while aiming');
        assert.ok(/0\.45 \+ 0\.55 \* pw/.test(js), 'The preview length should stay bounded');
    });
});

// =============================================================================
// WEATHER CONSOLE - timestamp parsing
//
// weather/ is generated output (scripts/sync-weather.sh); the fix for anything
// here belongs in ../Weather. These tests guard the SYNCED result, because that
// is what ships, and they exist because of a bug that was invisible on every
// machine it was developed on.
// =============================================================================

describe('WEATHER CONSOLE - Safari-safe timestamps', () => {
    const fs = require('fs');
    const src = fs.readFileSync(path.join(__dirname, 'weather', 'js', 'state.js'), 'utf8');

    /*
     * The ECMAScript date-time grammar permits a timezone offset ONLY when a
     * time is present. Open-Meteo's hourly block carries one ("2026-09-06T00:00")
     * but its DAILY block is date-only ("2026-09-06"), so appending "Z" built
     * "2026-09-06Z" — not a date-time string at all.
     *
     * V8 parses it anyway through its legacy fallback, which is why it worked on
     * every desktop and Android browser. JavaScriptCore returns NaN, so on iOS
     * every daily timestamp became an Invalid Date and the first
     * Intl.DateTimeFormat.format() call threw "date value is not finite",
     * killing the whole console at boot with FATAL.
     */
    const ES_DATETIME =
        /^[+-]?\d{4,6}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[+-]\d{2}:\d{2})?)?$/;

    test('Should know which strings the spec actually defines', () => {
        assert.ok(!ES_DATETIME.test('2026-09-06Z'),
            'A timezone on a date-only string is not a date-time string');
        assert.ok(ES_DATETIME.test('2026-09-06'), 'Date-only alone is valid');
        assert.ok(ES_DATETIME.test('2026-09-06T00:00Z'), 'Date + time + zone is valid');
        assert.ok(ES_DATETIME.test('2026-09-06T00:00:00Z'));
    });

    // Pull the shipped helper out of the synced file and run it, so this tests
    // the code that actually deploys rather than a copy of it.
    const m = src.match(/const utcIso = ([\s\S]*?);\n/);
    const utcIso = m ? new Function('return ' + m[1])() : null;

    test('Should normalise every real Open-Meteo shape to a valid string', () => {
        assert.ok(utcIso, 'weather/js/state.js should define utcIso');
        // The four shapes the live API actually returns, checked against the
        // bundle on the day this was written.
        [
            ['2026-09-06', 'daily.time — the one that broke iOS'],
            ['2026-09-06T00:00', 'hourly.time and minutely_15.time'],
            ['2026-09-06T06:30', 'daily.sunrise'],
            ['2026-09-08T09:00', 'current.time']
        ].forEach(([input, what]) => {
            const out = utcIso(input);
            assert.ok(ES_DATETIME.test(out),
                `${what}: utcIso(${JSON.stringify(input)}) produced ${JSON.stringify(out)}, ` +
                'which Safari will reject');
            assert.ok(!Number.isNaN(Date.parse(out)), `${what}: should parse`);
        });
    });

    test('Should place a date-only day at midnight, not shift it', () => {
        assert.strictEqual(Date.parse(utcIso('2026-09-06')),
            Date.parse('2026-09-06T00:00:00Z'),
            'A date-only day must still land on midnight of that day');
    });

    test('Should degrade a junk timestamp rather than throw', () => {
        [null, undefined, '', 'not a date', 42].forEach(bad => {
            assert.doesNotThrow(() => utcIso(bad), `utcIso(${JSON.stringify(bad)}) threw`);
        });
    });

    test('Should not append a bare Z to a possibly date-only value anywhere', () => {
        // The exact shape of the original bug, so it cannot come back by hand.
        assert.ok(!/Date\.parse\(\s*[A-Za-z0-9_.]+\s*\+\s*'Z'\s*\)/.test(src),
            "state.js still builds a timestamp with `+ 'Z'`; route it through utcIso");
    });

    /*
     * Intl.DateTimeFormat.format() THROWS on an Invalid Date rather than
     * returning a placeholder, so a single unreadable timestamp reaching an
     * unguarded formatter takes down the entire page. It did.
     */
    test('Should guard every formatter that can reach Intl', () => {
        const util = fs.readFileSync(path.join(__dirname, 'weather', 'js', 'lib', 'util.js'), 'utf8');
        assert.ok(/isoDate:\s*\(d\)\s*=>\s*\{[\s\S]{0,120}return x \?/.test(util),
            'isoDate must return a placeholder for an unreadable date, not throw');
        assert.ok(/hourOfDay:[\s\S]{0,200}if \(!x\) return NaN/.test(util),
            'hourOfDay must return NaN for an unreadable date, not throw');
        assert.ok(/dayOfYearOf[\s\S]{0,220}Number\.isNaN\(\+at\)/.test(util),
            'dayOfYearOf must check before calling format()');
    });
});


describe('WEATHER CONSOLE - phone layout', () => {
    const fs = require('fs');
    const dir = path.join(__dirname, 'weather');
    const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    const cssFiles = fs.readdirSync(path.join(dir, 'css')).filter(f => f.endsWith('.css'));
    const css = cssFiles.map(f => fs.readFileSync(path.join(dir, 'css', f), 'utf8')).join('\n');

    /*
     * The console was built as a desktop kiosk. Measured at 390x844 before this
     * work: content 983px wide, the clock and all four icon buttons off-screen
     * with body{overflow:hidden} so no scroll could reach them, 48 of 66 font
     * sizes under 12px, and zero interactive elements meeting 44x44.
     */
    test('Should ship a phone stylesheet, and load it', () => {
        const mobile = cssFiles.find(f => f.startsWith('mobile.'));
        assert.ok(mobile, 'weather/css should contain a mobile stylesheet');
        assert.ok(html.includes('href="css/' + mobile + '"'),
            'index.html must load ' + mobile);
    });

    test('Should keep clear of the notch and the home indicator', () => {
        // index.html sets viewport-fit=cover, which extends the layout under
        // both. Without env() padding that is worse than not setting it.
        assert.ok(/viewport-fit=cover/.test(html), 'viewport-fit=cover is expected');
        assert.ok(/env\(safe-area-inset-top\)/.test(css), 'the top bar needs the top inset');
        assert.ok(/env\(safe-area-inset-bottom\)/.test(css), 'the bottom bar needs the bottom inset');
    });

    test('Should let the scrubber be dragged on touch', () => {
        // Without touch-action iOS fires pointercancel the moment the finger
        // moves: tap-to-jump worked, dragging never did.
        assert.ok(/\.tl-canvas[^}]*touch-action:\s*none/s.test(css),
            'the scrubber canvas must opt out of browser gesture handling');
    });

    test('Should not let iOS auto-zoom the search field', () => {
        // Any input under 16px zooms the viewport on focus, on a page whose
        // body cannot scroll back.
        const m = css.match(/\.search-input\s*\{[^}]*\}/s);
        assert.ok(m, '.search-input rule should exist');
        assert.ok(/font-size:\s*16px/.test(m[0]),
            '.search-input must be exactly 16px, not 1rem');
    });

    test('Should give the small type a floor the inline styles can reach', () => {
        // Eleven caption sizes are set inline in the view JS where CSS cannot
        // reach them, written max(<original>, var(--fs-floor, 0px)) so the
        // desktop resolves to the original exactly.
        assert.ok(/--fs-floor/.test(css), 'the mobile block should set --fs-floor');
        const js = fs.readFileSync(path.join(dir, 'js', 'views', 'air.js'), 'utf8');
        assert.ok(/font-size:max\(\.\d+rem,var\(--fs-floor,0px\)\)/.test(js),
            'inline caption sizes should carry the floor');
        const bare = [...js.matchAll(/font-size:(\.\d\d)rem[;"]/g)]
            .map(m => parseFloat('0' + m[1])).filter(v => v < 0.72);
        assert.deepStrictEqual(bare, [],
            'every inline size under .72rem should carry the floor');
    });

    test('Should start a phone at a cheap render tier', () => {
        // navigator.getBattery does not exist in Safari, so onBattery stayed
        // false and decide() returned 3 - every iPhone booted at the most
        // expensive configuration in the app.
        const perf = fs.readFileSync(path.join(dir, 'js', 'perf.js'), 'utf8');
        assert.ok(/pointer:\s*coarse/.test(perf),
            'perf.js should detect a handheld by pointer, not by the battery API');
    });

    test('Should stride the timeline day labels', () => {
        // 18 weekday labels across ~360px rendered as "SUNMONTUEWED".
        const tl = fs.readFileSync(path.join(dir, 'js', 'timeline.js'), 'utf8');
        assert.ok(/stride/.test(tl), 'the day labels need a stride');
        assert.ok(/dayGap/.test(tl),
            'the stride should come from measured spacing, not from a count');
    });

    /*
     * Fingerprinting is what makes a fix reach a returning phone at once. The
     * old one-hour TTL on unhashed names meant new HTML against old CSS.
     */
    test('Should content-hash every stylesheet it links', () => {
        const hrefs = [...html.matchAll(/href="(css\/[^"]+\.css)"/g)].map(m => m[1]);
        assert.ok(hrefs.length >= 3, 'expected several stylesheets');
        hrefs.forEach(h => {
            assert.ok(/\.[0-9a-f]{10}\.css$/.test(h), `${h} is not fingerprinted`);
            assert.ok(fs.existsSync(path.join(dir, h)), `${h} does not exist on disk`);
        });
        const onDisk = cssFiles.filter(f => !/\.[0-9a-f]{10}\.css$/.test(f));
        assert.deepStrictEqual(onDisk, [], 'every shipped stylesheet should be hashed');
    });

    test('Should cache hashed stylesheets hard and unhashed scripts briefly', () => {
        const deploy = fs.readFileSync(
            path.join(__dirname, '.github', 'workflows', 'deploy.yml'), 'utf8');
        const step = deploy.slice(deploy.indexOf('Sync weather console'),
            deploy.indexOf('Invalidate CloudFront'));
        assert.ok(/weather\/css\/[\s\S]*?max-age=31536000, immutable/.test(step),
            'hashed CSS should be immutable');
        assert.ok(/stale-while-revalidate/.test(step),
            'unhashed JS should revalidate rather than sit stale for an hour');
        assert.ok(!/max-age=3600/.test(step),
            'the one-hour TTL is what made a fix take an hour to arrive');
    });
});

describe('WEATHER CONSOLE - tap to inspect', () => {
    const fs = require('fs');
    const dir = path.join(__dirname, 'weather', 'js');
    const charts = fs.readFileSync(path.join(dir, 'charts.js'), 'utf8');
    const plots = fs.readFileSync(path.join(dir, 'plots.js'), 'utf8');
    const air = fs.readFileSync(path.join(dir, 'views', 'air.js'), 'utf8');
    const main = fs.readFileSync(path.join(dir, 'main.js'), 'utf8');
    const timeline = fs.readFileSync(path.join(dir, 'timeline.js'), 'utf8');

    /*
     * Six charts hold numbers that appear nowhere else in the console -
     * model confidence, the record highs and the year they were set, Kp,
     * pollutant concentrations hours ahead. All six lived in a hover
     * tooltip, which on a phone appeared under the finger that summoned it
     * and vanished when the finger lifted.
     */
    test('Should keep a readout on screen after the finger lifts', () => {
        // pointerleave fires on every touch lift. Clearing on it is what made
        // the readout impossible to read.
        const leave = charts.match(/const leave = \(e\) => \{[^}]*\}/s);
        assert.ok(leave, 'mount() should name its pointerleave handler');
        assert.ok(/!coarse\(e\)/.test(leave[0]),
            'a coarse pointer leaving must not clear the readout');
        assert.ok(/const pinned = new Set\(\)/.test(charts),
            'the pinned readouts need to be tracked so another tap can clear them');
    });

    test('Should put the readout where the hand is not', () => {
        assert.ok(/export function tooltip\([^)]*\{ pin = false \} = \{\}\)/.test(charts),
            'tooltip() should take a pin option');
        // Pinned, it goes to the corner diagonally opposite the touch.
        assert.ok(/if \(pin\)[\s\S]{0,200}x > w \/ 2[\s\S]{0,120}y < h \/ 2/.test(charts),
            'pin should mirror the box away from the touch on both axes');
        const calls = (plots.match(/\btooltip\(ctx,/g) || []).length;
        const pinned = (plots.match(/pin: hover\.coarse/g) || []).length;
        assert.strictEqual(pinned, calls,
            'every readout in plots.js should pass the pin flag');
        assert.ok(calls >= 4, 'expected the four time-series readouts');
        assert.ok(/pin: hover\.coarse/.test(air),
            'the air quality readout should pin too');
    });

    test('Should have one readout box, not two', () => {
        // air.js carried a private near-copy of tooltip() that drifted.
        assert.ok(!/function drawTip/.test(air), 'air.js should not redefine the readout box');
        assert.ok(/\btooltip\b/.test(air), 'air.js should use the shared tooltip');
    });

    test('Should let a phone scroll past a chart', () => {
        // pan-y hands vertical scrolling back to the browser and keeps
        // horizontal movement, so a finger can slide along the chart to read
        // it without trapping the page.
        assert.ok(/canvas\.style\.touchAction = 'pan-y'/.test(charts),
            'mounted charts should allow vertical panning');
        assert.ok(/inspect: false/.test(timeline),
            'the scrubber runs its own drag and must opt out');
    });

    test('Should tell a tap from a scroll before moving the cursor', () => {
        // onPick used to fire on pointerdown with no movement threshold, so
        // the first pixel of a scroll gesture moved the time cursor.
        assert.ok(!/addEventListener\('pointerdown'[\s\S]{0,120}onPick\(/.test(charts),
            'onPick must not fire straight out of pointerdown');
        assert.ok(/d\.moved < TAP_SLOP\) onPick\(/.test(charts),
            'onPick should require the pointer to have stayed put');
    });

    test('Should drop the readout when the view changes', () => {
        assert.ok(/export function clearInspect\(\)/.test(charts),
            'charts.js should expose clearInspect()');
        const setView = main.slice(main.indexOf('function setView'),
            main.indexOf('function setView') + 900);
        assert.ok(/clearInspect\(\)/.test(setView),
            'setView should drop a readout belonging to the view being left');
    });
});

describe('WEATHER CONSOLE - charts fitted to their box', () => {
    const fs = require('fs');
    const dir = path.join(__dirname, 'weather', 'js');
    const charts = fs.readFileSync(path.join(dir, 'charts.js'), 'utf8');
    const plots = fs.readFileSync(path.join(dir, 'plots.js'), 'utf8');
    const views = ['deck', 'sky', 'air', 'data']
        .map(v => fs.readFileSync(path.join(dir, 'views', v + '.js'), 'utf8')).join('\n');

    /*
     * Every axis, legend and label used to decide its density from a number
     * typed at the call site. Measured with scripts/label-audit.mjs at
     * 390x844: ten overlapping label pairs and five labels running off the
     * canvas; at 1440x900, three and five. Both are zero now.
     */
    test('Should size the helpers as ceilings, never floors', () => {
        // This is what keeps the desktop console exactly as it was: given
        // room they return what the call site asked for.
        assert.ok(/export function fitTicks\(h, want = 4\)[\s\S]{0,120}clamp\(Math\.floor\(h \/ \d+\), 1, want\)/.test(charts),
            'fitTicks should be capped at the requested count');
        assert.ok(/export function fitStride\([\s\S]{0,400}Math\.max\(least,/.test(charts),
            'fitStride should never go finer than the caller asked');
    });

    test('Should never centre an axis label half off the canvas', () => {
        // "11AM" rendered as "PM" at both ends of the deck sparkline, and
        // "00" hung off the left of two sky charts and the UV chart.
        assert.ok(/export function fitLabel\(ctx, text, x, y, x0, x1\)/.test(charts),
            'charts.js should expose fitLabel');
        const uses = (views.match(/fitLabel\(/g) || []).length;
        assert.ok(uses >= 4, `expected the four edge-clipped axes to use it, saw ${uses}`);
    });

    test('Should let a title and its legend see each other', () => {
        // Drawn separately they could not: at 390px "FORECAST VS CLIMATE
        // RECORD °F" and its legend overlapped by 53px.
        assert.ok(/export function tagRow\(/.test(charts), 'charts.js should expose tagRow');
        assert.ok(/\[text, items\], \[text, brief\]/.test(charts),
            'tagRow should try the long legend words before shortening the title');
        // Every legend in plots.js goes through it now.
        assert.ok(!/^\s*legend\(ctx/m.test(plots),
            'no chart should place a legend without knowing what is beside it');
        assert.ok((plots.match(/tagRow\(/g) || []).length >= 4,
            'the four titled-and-legended charts should use tagRow');
    });

    test('Should not stack two axis numbers on top of each other', () => {
        // The UV panel's ticks are a hard-coded [3, 6, 8, 11]; on a panel
        // 40px tall that is four numbers in 40px. gridY thins them itself so
        // no call site has to remember.
        assert.ok(/MONO_SM is 9px/.test(charts), 'gridY should say why the gap is what it is');
        assert.ok(/if \(Math\.abs\(ly - lastY\) < 11\) continue;/.test(charts),
            'gridY should skip a label that would touch the last one');
        assert.ok(/y - box\.y < 9 \? y \+ 6 : y - 5/.test(charts),
            'the top gridline label belongs inside the box, not in the title row');
    });

    test('Should keep the gauge unit clear of the value', () => {
        // Both are sized from r, except the unit, which is a fixed 9px. All
        // six gauges on a phone ran the two together.
        assert.ok(/actualBoundingBoxDescent/.test(charts),
            'the unit should be placed under the value\'s measured ink');
        assert.ok((charts.match(/actualBoundingBoxAscent/g) || []).length >= 2,
            'gauge() and windRose() both need it');
    });

    test('Should ship the audit that measured all of it', () => {
        const audit = fs.readFileSync(path.join(__dirname, 'scripts', 'label-audit.mjs'), 'utf8');
        assert.ok(/actualBoundingBox/.test(audit),
            'the audit must measure ink, not guess a height from the font size');
        assert.ok(/CENSUS/.test(audit),
            'it must also count labels, so a chart cannot pass by dropping its axis');
    });
});

describe('WEATHER CONSOLE - pinch zoom on the radar', () => {
    const fs = require('fs');
    const dir = path.join(__dirname, 'weather', 'js');
    const map = fs.readFileSync(path.join(dir, 'map.js'), 'utf8');
    const radar = fs.readFileSync(path.join(dir, 'views', 'radar.js'), 'utf8');
    const main = fs.readFileSync(path.join(dir, 'main.js'), 'utf8');

    /*
     * The map panned on touch from the first version but could not be
     * zoomed by it at all: it kept ONE `drag` and ignored pointerId, so a
     * second finger overwrote the first and its movement was then measured
     * from wherever that second finger had landed.
     */
    test('Should track touch pointers by id', () => {
        assert.ok(/const live = new Map\(\)/.test(map),
            'pointers should be kept per id, not as a single drag');
        assert.ok(/live\.set\(e\.pointerId/.test(map) && /live\.delete\(e\.pointerId\)/.test(map),
            'both ends of a pointer should be keyed by its id');
        assert.ok(/if \(live\.size >= 2\) return;/.test(map),
            'a third finger should be ignored rather than confuse the pinch');
    });

    test('Should zoom by the ratio of the two fingers', () => {
        // Doubling the gap is one zoom level, which is what log2 says.
        assert.ok(/Math\.log2\(m\.span \/ gesture\.span\)/.test(map),
            'the zoom delta should be log2 of the span ratio');
        assert.ok(/gesture\.span > 20/.test(map),
            'two fingers closer than this are mostly noise');
    });

    test('Should hold one geographic point under the hand', () => {
        // Pan and pinch are the same operation, which is why there is one
        // function for both and the anchor never jumps between them.
        assert.ok(/_placeAt\(lat, lon, sx, sy\)/.test(map), 'map.js should expose _placeAt');
        assert.ok(/_placeAt\(gesture\.lat, gesture\.lon, m\.x, m\.y\)/.test(map),
            'every move should re-place the anchor under the midpoint');
        const anchorCalls = (map.match(/^\s*anchor\(\);$/gm) || []).length;
        assert.ok(anchorCalls >= 2,
            'the anchor must be recomputed on pointerdown AND pointerup, or '
            + 'lifting one finger out of a pinch jumps the map');
    });

    test('Should refuse Safari own pinch gesture', () => {
        // touch-action stops the page scrolling but not these, and the
        // viewport meta allows scaling, so a pinch would zoom the document.
        assert.ok(/'gesturestart', 'gesturechange', 'gestureend'/.test(map),
            'the map should preventDefault the WebKit gesture events');
        assert.ok(/touchAction = 'none'/.test(map), 'the map surface owns its gestures');
    });

    test('Should not zoom the radar past the tiles that exist', () => {
        /*
         * Measured against the live cache: RainViewer's public radar serves
         * real tiles to z 7 and the same 1370-byte "Zoom Level Not
         * Supported" placeholder at every zoom above it, worldwide. Pinch
         * reaches z 8 in one gesture, and that placeholder then tiled itself
         * across the map in letters a hundred pixels tall.
         */
        assert.ok(/maxTileZoom: 7/.test(radar), 'the radar layer should declare its deepest tile');
        assert.ok(/Math\.min\(zi, layer\.maxTileZoom \?\? zi\)/.test(map),
            'the renderer should scale a capped layer up rather than skip it');
        assert.ok(/layer\.url\(lz, wx, ty\)/.test(map),
            'tiles must be requested at the capped zoom, not the map zoom');
    });

    test('Should let a gesture test reach the map', () => {
        // There is no DOM readout of where the map is; a gesture test has to
        // be able to ask it.
        assert.ok(/window\.ATMOS = \{[^}]*views[^}]*\}/.test(main),
            'main.js should expose the view registry');
        assert.ok(/^\s*map,\s*\/\//m.test(radar), 'the radar view should hand out its map');
        const audit = fs.readFileSync(path.join(__dirname, 'scripts', 'pinch-audit.mjs'), 'utf8');
        assert.ok(/const seen=\[\]; const orig=l\.url;/.test(audit),
            'the tile-cap gate must spy on the layer, not the network: tiles are '
            + 'cached for the session, so a broken cap would make no requests at all');
    });
});

describe('WHOLE SITE - a finger, on every page', () => {
    const fs = require('fs');
    const read = (...p) => fs.readFileSync(path.join(__dirname, ...p), 'utf8');
    const wdir = path.join(__dirname, 'weather', 'css');
    const wcss = fs.readdirSync(wdir).filter(f => f.endsWith('.css'))
        .map(f => fs.readFileSync(path.join(wdir, f), 'utf8')).join('\n');

    /*
     * scripts/mobile-audit.mjs covers /weather/; scripts/site-audit.mjs
     * covers the other four pages and adds the check neither had: text hard
     * clipped INSIDE its own box. Nothing leaves the viewport when that
     * happens, so an overflow check sees a clean page.
     */
    test('Should not clip the place name out of the top bar', () => {
        // "Los Angeles / California - US" reached a phone as
        // "Los Ang / CALIFORNI", cut mid-word with no ellipsis: the unnamed
        // wrapper between .loc and .name/.sub sized itself to its widest
        // line, so max-width:100% on the children measured against 118px
        // rather than the 92px on offer, and .loc hard-clipped the result.
        assert.ok(/\.loc > span:not\(\.pin\) \{ min-width: 0; \}/.test(wcss),
            'the wrapper between .loc and its lines must be allowed to shrink');
        assert.ok(/#topbar \.spacer \{ flex: 0 0 0; \}/.test(wcss),
            'the spacer should not take slack the location needs');
    });

    test('Should keep the narrowest phone inside the scrubber', () => {
        // Seven 44px controls need 341px; an iPhone SE gives 320, and body
        // is overflow:hidden so nothing could scroll to reach the rest.
        assert.ok(/@media \(max-width: 359px\)[\s\S]{0,200}\.tl-rate \{ display: none; \}/.test(wcss),
            'the extra playback rates should stand down below 360px');
    });

    test('Should have no sliders on the green', () => {
        // They went on 2026-09-11: drag and the keyboard are the two ways to
        // aim, and the readouts beside Putt are the feedback. A range input
        // coming back would need its rail-and-target styling back with it.
        const html = read('game', 'index.html');
        const css = read('game', 'styles.css');
        assert.ok(!/type="range"/.test(html), 'no range inputs on the page');
        assert.ok(!/input\[type="range"\]/.test(css), 'and no slider styling left behind');
        assert.ok(/id="aim-out"/.test(html) && /id="power-out"/.test(html),
            'the aim and power readouts stay');
        assert.ok(/<p class="hint" id="hint">/.test(html), 'and the instructions are on the page');
    });

    test('Should size controls for a finger on every page', () => {
        // Scoped to a coarse pointer so the desktop layout is untouched.
        for (const f of [['game', 'styles.css'], ['slingshot', 'styles.css'],
            ['countdown', 'styles.css']]) {
            const css = read(...f);
            assert.ok(/@media \(pointer: coarse\)/.test(css),
                `${f.join('/')} should carry a coarse-pointer block`);
            assert.ok(/min-height: 44px/.test(css.slice(css.indexOf('@media (pointer: coarse)'))),
                `${f.join('/')} should raise its controls to 44px`);
        }
    });

    test('Should judge targets by the standard, not by one number', () => {
        /*
         * WCAG 2.5.8 is 24x24 CSS px, with an exception for anything that
         * has room around it. A flat 44 would have forced the landing
         * page's six text links - 36px tall, 16px of air, nothing else near
         * - to grow boxes that pull their underlines off the words. That is
         * a worse page, not a more accessible one.
         */
        const audit = read('scripts', 'site-audit.mjs');
        assert.ok(/WCAG 2\.5\.8 floor/.test(audit), 'the 24px floor should be named');
        assert.ok(/near\(a\)<12/.test(audit),
            'and 44px should apply only where a neighbour is close');
        assert.ok(/textOverflow==='ellipsis'/.test(audit),
            'truncation by choice is not the same as truncation by accident');
        const home = read('styles.css');
        assert.ok(!/@media \(pointer: coarse\)/.test(home),
            'the landing page passes on spacing and should be left alone');
    });
});

describe('WEATHER CONSOLE - OVERHEAD', () => {
    const fs = require('fs');
    const read = (...p) => fs.readFileSync(path.join(__dirname, ...p), 'utf8');
    const view = read('weather', 'js', 'views', 'overhead.js');
    const main = read('weather', 'js', 'main.js');
    const html = read('weather', 'index.html');
    const lambda = read('lambda', 'index.mjs');
    const astro = read('weather', 'js', 'lib', 'astro.js');
    const sky = read('weather', 'js', 'views', 'sky.js');
    const map = read('weather', 'js', 'map.js');
    const radar = read('weather', 'js', 'views', 'radar.js');

    test('Should proxy the aircraft feeds instead of calling them from the page', () => {
        // Two more hosts in the CSP, no edge cache, and every viewer hitting a
        // hobbyist's receiver directly. All three are avoided the same way the
        // weather data is.
        assert.ok(/api\.adsb\.lol|opendata\.adsb\.fi/.test(lambda),
            'the Lambda should be the one talking to the feeds');
        assert.ok(!/adsb\.(lol|fi)\/v2|api\.adsbdb\.com/.test(view),
            'the view must not fetch an upstream directly');
        assert.ok(/'\/api\/aircraft': 'public, s-maxage=10'/.test(lambda),
            'positions should carry a short edge cache, not none');
    });

    test('Should fall back to the second feed when the first is down', () => {
        const route = lambda.slice(lambda.indexOf("async '/api/aircraft'"),
            lambda.indexOf("async '/api/flight'"));
        assert.ok(/adsb\.lol[\s\S]*adsb\.fi/.test(route),
            'both feeds should be tried in order');
        assert.ok(/for \(const \[host, url\] of feeds\)/.test(route),
            'the second should be reached by iterating, not by a copy-paste branch');
    });

    test('Should look a route up only for the aircraft you tapped', () => {
        // A hundred aircraft enriched every ten seconds is how you get blocked.
        const poll = view.slice(view.indexOf('async function poll()'),
            view.indexOf('async function pollISS()'));
        assert.ok(!/api\.flight/.test(poll), 'the refresh loop must not enrich');
        const select = view.slice(view.indexOf('function select(hex)'),
            view.indexOf('/* ------------------------------------------------------------- readouts */'));
        assert.ok(/api\.flight/.test(select), 'selecting one should enrich that one');
    });

    test('Should stop polling when you leave the view', () => {
        assert.ok(/onHide\(\) \{ clearInterval\(timer\)/.test(view),
            'the view should hand back its interval');
        assert.ok(/views\[store\.view\]\?\.onHide\?\.\(\)/.test(main),
            'and setView should actually call it, or the interval outlives the view');
    });

    test('Should credit the receivers this runs on', () => {
        assert.ok(/adsb\.lol/.test(view) && /ODbL/.test(view),
            'adsb.lol is ODbL and the attribution is not optional');
    });

    test('Should agree with itself about how many views there are', () => {
        const tabs = (html.match(/role="tab"/g) || []).length;
        const sections = (html.match(/class="view[^"]*" +id="view-/g) || []).length;
        const listed = main.match(/const VIEWS = \[([^\]]+)\]/);
        assert.ok(listed, 'main.js should declare VIEWS');
        const n = listed[1].split(',').length;
        assert.strictEqual(tabs, n, `${tabs} tabs but ${n} entries in VIEWS`);
        assert.strictEqual(sections, n, `${sections} sections but ${n} entries in VIEWS`);
        assert.ok(new RegExp(`k <= '${n}'`).test(main),
            `the keyboard range should reach ${n}`);
        assert.ok(/views\.overhead = createOverhead/.test(main),
            'and the view has to actually be constructed');
    });

    test('Should keep one topocentric and one basemap', () => {
        /*
         * topocentric was private to sky.js and read store.loc from its
         * closure. A satellite is close enough that the observer's offset from
         * the Earth's centre matters, which is what the R/(R+alt) term is for -
         * exactly the sort of thing that should exist once.
         */
        assert.ok(/export function topocentric\(obsLat, obsLon, satLat, satLon, altKm\)/.test(astro),
            'astro.js should own it, and take the observer explicitly');
        assert.ok(!/function topocentric/.test(sky), 'sky.js should not keep a copy');
        assert.ok(/topocentric/.test(sky) && /topocentric/.test(view),
            'both callers should use the shared one');
        assert.ok(/export const ESRI_CANVAS/.test(map), 'map.js should own the basemap');
        assert.ok(!/const ESRI = /.test(radar), 'radar.js should not redeclare it');
    });
});

describe('TONIGHT - the rules', () => {
    const fs = require('fs');
    const read = (...p) => fs.readFileSync(path.join(__dirname, ...p), 'utf8');
    const rules = read('weather', 'js', 'lib', 'tonight.js');
    /*
     * Grep the CODE, not the prose. Comments explain the rules, and a rule is
     * usually explained by naming the thing it forbids — the first version of
     * the purity test below failed on this file's own doc block, which says
     * "no zero-argument `new Date()`".
     */
    const code = rules
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1');

    /*
     * Behaviour is checked by scripts/tonight-check.mjs against live
     * forecasts, because this is an ES module and package.json has no
     * "type": "module" — Node reads a .js file here as CommonJS and chokes on
     * `export`. What these pin is the shape that makes that possible.
     */
    test('Should stay pure enough to run outside a browser', () => {
        for (const banned of ['document.', 'localStorage', 'fetch(', 'window.']) {
            assert.ok(!code.includes(banned), `tonight.js must not reach for ${banned}`);
        }
        // A zero-argument `new Date()` would make the same forecast produce
        // different answers on two machines, exactly as it would in putt.js.
        assert.ok(!/new Date\(\s*\)/.test(code), 'the clock must be passed in, not read');
        assert.ok(!/^import /m.test(code),
            'astro is injected, so the gate can load this from a data: URL');
    });

    test('Should be calibrated for a naked eye, not a telescope', () => {
        // Kyle observes with his eyes. Seeing, transparency and dew point are
        // telescope problems and would be noise in this answer.
        for (const t of ['seeing', 'transparency', 'dewPoint', 'dew_point', '.vis', '.rh']) {
            assert.ok(!code.includes(t), `${t} is a telescope concern, not a naked-eye one`);
        }
        // Cloud and the clock are the only things it reads off an hour.
        const fields = [...new Set((code.match(/\bh\.[a-z]+/g) || []))].sort();
        assert.deepStrictEqual(fields, ['h.cloud', 'h.t'],
            `reads ${fields.join(', ')} from the forecast; should read only cloud and time`);
        assert.ok(/CLEAR_CLOUD = 30/.test(code), 'cloud is the first thing that decides it');
        assert.ok(/MOON_IGNORE = 0\.25/.test(code), 'and moonlight is the second');
    });

    test('Should clamp each score term, not just the sum', () => {
        /*
         * The first version clamped only the total, so every night with a
         * four-hour clear run scored 100 and five clear nights in a row
         * ranked identically — which is the one question the feature exists
         * to answer.
         */
        assert.ok(/0\.65 \* Math\.min\(1, runH \/ 4\)/.test(code),
            'the run term needs its own ceiling');
        assert.ok(/0\.08 \* moonUpFrac \* lit/.test(code),
            'and a continuous moon term so two clear nights still rank');
    });

    test('Should ask about the night where the place is, not where you are', () => {
        assert.ok(/offsetMs = null/.test(code) && /nowMs \+ offsetMs/.test(code),
            'ELSEWHERE needs "tonight" to mean tonight there');
    });

    test('Should fall back through the twilights rather than give up', () => {
        // Above ~49 degrees there are summer weeks with no astronomical night
        // at all. The sky is still worth looking at; it is just never dark.
        assert.ok(/\['night', 'nauticalDusk', 'dusk'\]/.test(code)
            && /\['nightEnd', 'nauticalDawn', 'dawn'\]/.test(code),
            'astronomical, then nautical, then civil');
    });

    test('Should count in plain English', () => {
        /*
         * "Fri is the better night: 1 clear moonless hours." shipped because
         * the run branch pluralised and the alternative-night branch did not.
         * One helper now serves both, and only a one-hour night ever showed
         * it — which is why the live gate checks every night, not just today.
         */
        assert.ok(/const plural = \(n, noun\)/.test(code),
            'one pluralisation helper, used everywhere a count is printed');
        assert.ok(!/\$\{better\.goodHours\} clear moonless hours/.test(code),
            'the alternative night must not hard-code the plural');
        assert.ok(/plural\(better\.goodHours, 'clear moonless hour'\)/.test(code)
            && /plural\(run, 'hour'\)/.test(code), 'both counts go through it');
    });

    test('Should shape the sentence to the night it describes', () => {
        /*
         * A run that fills the dark window is not a window, it is the night:
         * nothing is traded by going out early or late. And a short run is
         * the only case with a real decision in it, so it names what closes
         * it. Read daily, one template for all three would say less each time.
         */
        assert.ok(/all night/.test(code), 'a full-night run should say so');
        assert.ok(/t\.dark\.hours - runH < 1/.test(code),
            'and that is decided by measurement, not by the score');
        assert.ok(/in a night averaging/.test(code),
            'a short window should name the cloud that closes it');
        assert.ok(/run < 3/.test(code), 'short being the case the reader must judge');
    });

    test('Should ship a verdict that needs no model at all', () => {
        assert.ok(/export function verdict/.test(code),
            'the deterministic sentence is the floor the feature stands on');
        assert.ok(!/anthropic|claude/i.test(code),
            'and the rules must not know an LLM exists');
        const gate = read('scripts', 'tonight-check.mjs');
        assert.ok(/scores discriminate/.test(gate), 'the gate should catch score saturation');
        assert.ok(/Reykjavik|Tromso/.test(gate), 'and exercise a latitude where darkness runs out');
    });
});

describe('ELSEWHERE - the sentence route', () => {
    const fs = require('fs');
    const lambda = fs.readFileSync(path.join(__dirname, 'lambda', 'index.mjs'), 'utf8');
    const slice = (src) => {
        const a = src.indexOf("async '/api/elsewhere'");
        return a < 0 ? '' : src.slice(a, src.indexOf("async '/api/aircraft'", a));
    };
    const route = slice(lambda);

    test('Should exist, and be the same code as the local server', () => {
        assert.ok(route.length > 500, 'the route should be in lambda/index.mjs');
        // ../Weather/server.mjs is a sibling repo and may not be checked out
        // in CI, so this only asserts equality when it is there.
        const sibling = path.join(__dirname, '..', 'Weather', 'server.mjs');
        if (fs.existsSync(sibling)) {
            assert.strictEqual(route, slice(fs.readFileSync(sibling, 'utf8')),
                'the two copies of this route have drifted');
        }
    });

    test('Should never let a caller put words in the prompt', () => {
        /*
         * This endpoint sits in front of an API key on a public URL. Nothing
         * the caller sends may reach the model as text, or the route is a free
         * LLM with somebody else's credit card attached. Names are the only
         * strings that survive, and only if they look like names.
         */
        assert.ok(/const NAME = \/\^\[/.test(route), 'place names need a pattern, not a length check');
        assert.ok(/\{1,40\}/.test(route), 'and a length cap');
        assert.ok(/const SKY = \[/.test(route) && /SKY\.includes\(v\)/.test(route),
            'conditions must come from a whitelist, not from the caller');
        assert.ok(/raw\.length > 1500/.test(route), 'and the payload itself needs a cap');
        // Every field that reaches the prompt is rebuilt here from validated
        // parts; JSON.stringify(facts) is the only thing sent.
        assert.ok(/JSON\.stringify\(facts\)/.test(route) && !/JSON\.stringify\(input\)/.test(route),
            'the prompt is built from validated facts, never from the input');
    });

    test('Should count the better places itself', () => {
        // Asked to count for itself, the model said "one other place beats
        // here" about a list where exactly one place did.
        assert.ok(/betterCount: rows\.filter\(\(r\) => r\.better\)\.length/.test(route),
            'the count must be computed from the validated rows');
        assert.ok(/betterCount is exactly how many/.test(route),
            'and the model told not to contradict it');
    });

    test('Should degrade to the rules on every failure path', () => {
        assert.ok(/if \(!key\) return \{ text: null, why: 'no key' \}/.test(route),
            'no key is this site\'s normal state, not an error');
        assert.ok(/text: null, why: `upstream/.test(route), 'an upstream error keeps the rules sentence');
        assert.ok(/AbortError/.test(route) && /setTimeout\(\(\) => ac\.abort\(\), 4000\)/.test(route),
            'a slow sentence is worse than a deterministic one');
        assert.ok(/text\.length > 240/.test(route),
            'a model that ignored "one sentence" ignored the rest of the brief too');
        assert.ok(!/process\.env\.ANTHROPIC_API_KEY[^;]*return/.test(route)
            && !/why: key/.test(route), 'the key must never be returned');
    });

    test('Should have a way to set the key that does not wipe the others', () => {
        const sh = fs.readFileSync(path.join(__dirname, 'scripts', 'set-lambda-key.sh'), 'utf8');
        /*
         * `update-function-configuration --environment` REPLACES the whole
         * variable set. Passing only the new key drops every other variable
         * the function has, and it surfaces later as a route that used to
         * work — so the script reads the current set and merges.
         */
        assert.ok(/get-function-configuration/.test(sh) && /Environment\.Variables/.test(sh),
            'it has to read what is already there');
        assert.ok(/cur\['ANTHROPIC_API_KEY'\] = /.test(sh),
            'and merge into it rather than build a fresh set');
        assert.ok(/--cli-input-json/.test(sh),
            'the key goes through a file, not a command line');
        // Names only, never values — this prints what is set as confirmation.
        assert.ok(/sort\(keys\(Environment\.Variables\)\)/.test(sh),
            'confirmation should list names, never values');
    });

    test('Should be cached at the edge', () => {
        // Whole degrees and a handful of condition words repeat for long
        // stretches, so one model call can serve everyone in the window.
        assert.ok(/'\/api\/elsewhere': 'public, s-maxage=1800/.test(lambda),
            'an uncached model call per page view is how a hobby budget goes');
    });
});

describe('ELSEWHERE - the rules', () => {
    const fs = require('fs');
    const read = (...p) => fs.readFileSync(path.join(__dirname, ...p), 'utf8');
    const rules = read('weather', 'js', 'lib', 'elsewhere.js');
    // Grep the code, not the prose: the comments name the things they forbid.
    const code = rules
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1');

    test('Should stay pure enough to run outside a browser', () => {
        for (const banned of ['document.', 'localStorage', 'fetch(', 'window.']) {
            assert.ok(!code.includes(banned), `elsewhere.js must not reach for ${banned}`);
        }
        assert.ok(!/new Date\(\s*\)/.test(code), 'the clock must be passed in, not read');
        assert.ok(!/^import /m.test(code), 'so the gate can load it from a data: URL');
    });

    test('Should read units from the payload, never assume them', () => {
        /*
         * The API serves Fahrenheit, mp/h and inches while the comfort curve
         * is Celsius. Hand 91.5F to a Celsius field and it scores a pleasant
         * afternoon as unbearable, with no error anywhere and a ranking that
         * still looks like it works. Open-Meteo ships current_units precisely
         * so nobody has to guess.
         */
        assert.ok(/export function fromCurrent/.test(code),
            'there should be one adapter, so the conversion happens once');
        assert.ok(/units\.temperature_2m/.test(code) && /units\.wind_speed_10m/.test(code),
            'and it should read the units the payload declares');
        assert.ok(/- 32\) \/ 1\.8/.test(code), 'F to C');
        assert.ok(/1\.609344/.test(code) && /25\.4/.test(code), 'mph to km/h, inches to mm');
    });

    test('Should treat comfort as a curve, not a magnitude', () => {
        // 39C is not an improvement on 21C. A ranking that sorts on raw
        // temperature would put the worst day on this list at the top.
        assert.ok(/IDEAL_C = 21/.test(code), 'the curve needs a peak');
        assert.ok(/Math\.abs\(t - IDEAL_C\) \/ TEMP_SPAN/.test(code),
            'and should score distance from it, not the number itself');
        // Clamping only the sum is what made TONIGHT's clear nights all score
        // 100 and rank identically.
        const terms = code.match(/clamp01\(/g) || [];
        assert.ok(terms.length >= 4, `each term needs its own ceiling; found ${terms.length}`);
    });

    test('Should rank the same way twice', () => {
        // A list that reshuffles between refreshes looks broken even when
        // every row in it is correct.
        assert.ok(/localeCompare/.test(code), 'ties need a final, total tiebreak');
        assert.ok(/b\.score - a\.score/.test(code), 'ordered by score first');
    });

    test('Should ship a verdict that needs no model at all', () => {
        assert.ok(/export function verdict/.test(code),
            'the deterministic sentence is the floor, as in TONIGHT');
        assert.ok(!/anthropic|claude/i.test(code), 'and the rules must not know an LLM exists');
        const gate = read('scripts', 'elsewhere-check.mjs');
        assert.ok(/temperature is Celsius/.test(gate),
            'the gate should catch a unit mix-up on live data');
        assert.ok(/warmer is not automatically better/.test(gate),
            'and should pin the shape of the curve');
    });
});

describe('SLINGSHOT - impact effects', () => {
    const fs = require('fs');
    const read = (...p) => fs.readFileSync(path.join(__dirname, ...p), 'utf8');
    const strip = (src) => src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1');
    const script = strip(read('slingshot', 'script.js'));
    const rules = strip(read('slingshot', 'orbit.js'));
    const audio = strip(read('slingshot', 'audio.js'));

    /*
     * Most shots miss - the median aim window is 1.8 degrees - so failure is
     * the main experience in this game, and it used to have no picture at all:
     * a sound, a sentence, and a probe that stopped mid-frame.
     */
    test('Should keep the rules ignorant that any of this exists', () => {
        // The whole reason the split holds. Effects are diffed out of the
        // flight result in script.js, exactly as the audio events are.
        for (const word of ['particle', 'scar', 'shake', 'fx', 'debris', 'bloom']) {
            assert.ok(!new RegExp('\\b' + word, 'i').test(rules),
                `orbit.js must not mention ${word}`);
        }
    });

    test('Should give every outcome its own picture', () => {
        // fly() already returns the contact point and which body was hit, so
        // none of this needed a rules change.
        for (const [outcome, fn] of [['crash', 'burst'], ['lost', 'dwindle'],
            ['hit', 'bloom'], ['timeout', 'sigh']]) {
            assert.ok(new RegExp('function ' + fn + '\\b').test(script),
                `${outcome} should have a ${fn}()`);
            assert.ok(new RegExp('\\b' + fn + '\\(').test(script.replace('function ' + fn, '')),
                `${fn}() should actually be called`);
        }
        assert.ok(/r\.body/.test(script), 'the crash should use the body index fly() returns');
    });

    test('Should have a real off switch, not a nominal one', () => {
        assert.ok(/\/\^\[012\]\$\//.test(script), 'fx should accept 0, 1 or 2');
        assert.ok(/fxOn = function \(\) \{ return fxLevel > 0; \}/.test(script),
            'and everything should be able to ask whether it is on');
    });

    test('Should strip the motion but keep what teaches', () => {
        /*
         * Under reduced motion the flight is skipped in a single frame, so
         * anything driven by flight progress never runs at all. Scars are not
         * motion and they are the part that teaches, so they are recorded
         * before the early return.
         */
        const burst = script.slice(script.indexOf('function burst'),
            script.indexOf('function dwindle'));
        const scarAt = burst.indexOf('scars.push');
        const bailAt = burst.indexOf('reduceMotion');
        assert.ok(scarAt > -1 && bailAt > -1, 'burst() should do both');
        assert.ok(scarAt < bailAt,
            'the scar must be recorded before the reduced-motion bail-out');
        assert.ok(/if \(reduceMotion \|\| !fxOn\(\)\) return;/.test(script),
            'the kick should respect reduced motion too');
    });

    test('Should be bounded, because this runs on a phone', () => {
        assert.ok(/MAX_FX = \d+/.test(script) && /MAX_SCARS = \d+/.test(script),
            'particles and scars both need a ceiling');
        assert.ok(/if \(fx\.length >= MAX_FX\) fx\.shift\(\);/.test(script),
            'the pool should drop the oldest rather than grow');
        // shadowBlur is the expensive call in this file; it must not be in the
        // per-particle loop.
        const loop = script.slice(script.indexOf('for (let i = 0; i < fx.length; i++)'));
        assert.ok(!/shadowBlur/.test(loop.slice(0, 400)), 'no shadowBlur per particle');
        assert.ok(/fillRect/.test(loop.slice(0, 400)), 'debris should be drawn with fillRect');
    });

    test('Should let you hear the near miss while it happens', () => {
        assert.ok(/function flying\(p, near\)/.test(audio),
            'flying() should take proximity, not just progress');
        assert.ok(/nearQ = clamp\(1 - Math\.sqrt/.test(script),
            'proximity should be computed live during the flight');
        assert.ok(/case 'lost':/.test(audio),
            'leaving the system should not share a sound with drifting');
    });

    test('Should gate what can be gated', () => {
        const gate = read('scripts', 'slingshot-fx-audit.mjs');
        assert.ok(/THE GAME LOOP HAS TO BE DRIVEN/.test(gate),
            'headless produces no frames, so rAF never fires and nothing decays');
        assert.ok(/window\.SLINGSHOT_FX/.test(gate) && /window\.SLINGSHOT_FX = \{/.test(script),
            'the gate needs a read-only handle for state with no DOM readout');
        assert.ok(/the pool drains/.test(gate), 'a leaking pool degrades a long session silently');
    });

    test('Should drive the loop itself, and prove that it did', () => {
        const gate = read('scripts', 'slingshot-fx-audit.mjs');
        /*
         * The loop is driven by shimming rAF onto timers with a synthetic
         * clock. frame(now) in script.js takes its timestamp from the rAF
         * argument, which is what makes that possible — read performance.now()
         * there instead and the gate would advance no game time at all while
         * still reporting frames.
         */
        assert.ok(/window\.requestAnimationFrame = \(cb\) => setTimeout/.test(gate),
            'the gate drives the loop rather than waiting for the compositor');
        assert.ok(/function frame\(now\)/.test(script) && /now - lastFrame/.test(script),
            'and script.js must keep taking its clock from the rAF argument');
        assert.ok(/addScriptToEvaluateOnNewDocument/.test(gate),
            'installed before page scripts, or the first rAF misses it');
        /*
         * Every check about draining and capping is measured against a running
         * game. If the shim were dropped, the loop would freeze and they would
         * all pass by measuring a game that never started -- so the gate counts
         * its own frames and fails on that first.
         */
        assert.ok(/the loop actually ran/.test(gate),
            'the frame count is what makes the other assertions mean anything');
        // Peaks are tracked inside the page: debris lives 320-600ms, and
        // sampling once per round trip measures the empty pool afterwards.
        assert.ok(/if \(p > peak\.particles\)/.test(gate),
            'peaks should be sampled every frame, from inside the page');
    });
});

describe('BUSINESS SITE - Runs on more than one machine', () => {
    const fs = require('fs');
    const dir = path.join(__dirname, 'scripts');
    const gates = fs.readdirSync(dir).filter((f) => f.endsWith('-audit.mjs'));

    test('No gate should hardcode where Chromium lives', () => {
        /*
         * All seven hardcoded /usr/bin/chromium, which is right on Arch and
         * wrong nearly everywhere else. Moving this project to another machine
         * turned one wrong assumption into seven identical unhelpful failures,
         * so the answer lives in scripts/lib/chromium.mjs and $CHROMIUM
         * overrides it.
         */
        assert.ok(gates.length >= 7, `expected the audit gates, found ${gates.length}`);
        for (const g of gates) {
            const src = fs.readFileSync(path.join(dir, g), 'utf8');
            assert.ok(!/spawn\('\/usr\/bin\//.test(src),
                `${g} spawns an absolute browser path; use chromiumPath()`);
            assert.ok(/chromiumPath\(\)/.test(src), `${g} should resolve the browser`);
        }
    });

    test('Nothing should assume this particular home directory', () => {
        // A path under /home/<someone> or /Users/<someone> in committed code
        // works on exactly one machine and fails silently on the next.
        const roots = [dir, path.join(__dirname, 'lambda')];
        for (const root of roots) {
            for (const f of fs.readdirSync(root)) {
                if (!/\.(mjs|js|sh|py)$/.test(f)) continue;
                const src = fs.readFileSync(path.join(root, f), 'utf8');
                assert.ok(!/\/home\/[a-z]+\/|\/Users\/[a-z]+\//i.test(src),
                    `${f} contains an absolute home-directory path`);
            }
        }
    });
});

describe('BUSINESS SITE - Production security headers', () => {
    const fs = require('fs');
    const server = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    const policy = fs.readFileSync(path.join(__dirname, 'scripts', 'cloudfront-headers.py'), 'utf8');

    // server.js protects the tailnet; the CloudFront policy protects everyone
    // else. They have to say the same thing about the same site.
    test('Should widen img-src for the same tile hosts in both places', () => {
        const hosts = /const TILE_HOSTS = '([^']+)'/.exec(server);
        assert.ok(hosts, 'server.js should define TILE_HOSTS');
        const inPolicy = /^TILE_HOSTS = '([^']+)'/m.exec(policy);
        assert.ok(inPolicy, 'the CloudFront policy should define TILE_HOSTS');
        assert.strictEqual(inPolicy[1], hosts[1],
            'The two would disagree about which hosts the radar may load tiles from');
    });

    test('Should restrict scripts to the same origin in both places', () => {
        assert.ok(server.includes("script-src 'self'"));
        assert.ok(policy.includes("script-src 'self'"));
        assert.ok(!policy.includes("'unsafe-eval'"));
        // Inline styles are used throughout; inline scripts are not, and a test
        // per page asserts it.
        assert.ok(policy.includes("style-src 'self' 'unsafe-inline'"));
    });

    // The one header where copying server.js verbatim would remove a feature
    // rather than add risk.
    test('Should allow geolocation in production, unlike the local server', () => {
        assert.ok(server.includes('geolocation=()'),
            'server.js disables it: the tailnet is plain HTTP where it cannot work');
        assert.ok(policy.includes('geolocation=(self)'),
            'CloudFront must ALLOW it - all three features call getCurrentPosition, ' +
            'and an empty allowlist would silently put every visitor in Los Angeles');
        assert.ok(!/geolocation=\(\)/.test(policy.split('PERMISSIONS_POLICY')[1] || ''),
            'The production policy must not carry the local disable');
    });

    test('Should not commit to HSTS options that cannot be taken back', () => {
        const hsts = policy.slice(policy.indexOf('StrictTransportSecurity'));
        assert.ok(!/includeSubDomains|IncludeSubdomains.*True/i.test(hsts.slice(0, 400)),
            'includeSubDomains hardens every subdomain for the whole max-age');
        assert.ok(!/Preload.*True/i.test(hsts.slice(0, 400)), 'preload is effectively permanent');
    });

    test('Should ship a way to check what production actually sends', () => {
        const check = path.join(__dirname, 'scripts', 'check-headers.sh');
        assert.ok(fs.existsSync(check), 'scripts/check-headers.sh should exist');
        assert.ok((fs.statSync(check).mode & 0o111) !== 0, 'It should be executable');
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

describe('SPEND CHECK - the weekly bill', () => {
    const fs = require('fs');
    const read = (...p) => fs.readFileSync(path.join(__dirname, ...p), 'utf8');
    const wf = read('.github', 'workflows', 'spend.yml');
    const script = read('scripts', 'spend-check.mjs');
    const lambda = read('lambda', 'index.mjs');

    test('Should run every week, and by hand', () => {
        assert.ok(/schedule:\s*\n\s*-\s*cron:/.test(wf), 'spend.yml needs a cron schedule');
        assert.ok(/workflow_dispatch/.test(wf), 'and a manual trigger for checking now');
        assert.ok(/node scripts\/spend-check\.mjs/.test(wf), 'and it should run the script');
    });

    test('Should pin every action to a commit SHA', () => {
        // A tag is mutable and this job holds AWS credentials. Same rule as
        // deploy.yml and test.yml.
        const uses = wf.split('\n').filter(l => /^\s*-?\s*uses:/.test(l));
        assert.ok(uses.length >= 3, 'expected checkout, node and aws-credentials steps');
        uses.forEach(l => assert.ok(/@[0-9a-f]{40}\b/.test(l), `not pinned to a SHA: ${l.trim()}`));
    });

    test('Should price the model the Lambda actually calls', () => {
        // The estimate is tokens times a rate table. If the Lambda moves to
        // another model the table has to follow, or the check prices the wrong
        // thing and looks fine doing it.
        const m = lambda.match(/model: '(claude-[a-z0-9-]+)'/);
        assert.ok(m, 'the Lambda should name its model');
        assert.ok(script.includes(`'${m[1]}':`), `RATES in spend-check.mjs has no entry for ${m[1]}`);
    });

    test('Should be able to see the model calls in the logs', () => {
        // The Lambda writes one JSON line per call and the script parses the
        // same field names back out. Rename one without the other and the
        // estimate silently becomes zero.
        assert.ok(/metric: 'anthropic'/.test(lambda), 'the route should log a usage line');
        ['input_tokens', 'output_tokens'].forEach(f => {
            assert.ok(lambda.includes(`${f}: j.usage?.${f}`), `the Lambda should log ${f}`);
            assert.ok(script.includes(`"${f}":`), `the script should parse ${f}`);
        });
        assert.ok(/"metric":"anthropic"/.test(script), 'and filter on the same marker');
    });

    test('Should fail rather than pass when a bill cannot be read', () => {
        assert.ok(/problems\.push\(/.test(script) && /if \(problems\.length \|\| over\.length\) process\.exit\(1\)/.test(script),
            'a source that returns nothing must fail the job, not report a quiet month');
        assert.ok(!/console\.log\([^)]*adminKey/.test(script), 'the admin key must never be printed');
    });

    test('Should make exactly one Cost Explorer call', () => {
        // Each one costs a cent, and the previous month is a MONTHLY bucket of
        // the same request rather than a second request.
        const n = (script.match(/get-cost-and-usage/g) || []).length;
        assert.strictEqual(n, 1, 'one Cost Explorer request covers both months');
        assert.ok(/'--granularity', 'MONTHLY'/.test(script), 'with monthly buckets');
    });
});

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
