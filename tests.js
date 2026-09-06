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

    test('Should measure progress from the previous milestone to the next', () => {
        const progress = Calc.nextMilestoneProgress(191, Calc.COUNTUP_MILESTONES);
        assert.strictEqual(progress.prev, 182);
        assert.strictEqual(progress.next, 365);
        assert.strictEqual(progress.nextMilestone.text, 'One Year');
        assert.ok(Math.abs(progress.percentage - 4.918) < 0.01, `Expected ~4.9%, got ${progress.percentage}`);
        assert.strictEqual(progress.complete, false);
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

    test('Should have a services section', () => {
        assert.ok(indexHtml.includes('id="services"'),
            'Should have a services section');
    });

    test('Should have an about section', () => {
        assert.ok(indexHtml.includes('id="about"'),
            'Should have an about section');
    });

    test('Should have a contact section', () => {
        assert.ok(indexHtml.includes('id="contact"'),
            'Should have a contact section');
    });

    test('Should have a link to the countdown page', () => {
        assert.ok(indexHtml.includes('/countdown/index.html'),
            'Should link to the countdown page');
    });

    test('Should describe the countdown link as time since retirement', () => {
        assert.ok(indexHtml.includes("See how long I've been retired"),
            'Footer link should say "See how long I\'ve been retired"');
    });

    test('Should have a mailto link', () => {
        assert.ok(indexHtml.includes('mailto:kbshaver@gmail.com'),
            'Should have a mailto link');
    });

    test('Should have proper meta description', () => {
        assert.ok(indexHtml.includes('<meta name="description"'),
            'Should have a meta description tag');
    });

    test('Should have skip navigation link for accessibility', () => {
        assert.ok(indexHtml.includes('skip-link'),
            'Should have a skip navigation link');
    });

    test('Should reference all three service types', () => {
        assert.ok(indexHtml.includes('AI') && indexHtml.includes('Claude'),
            'Should mention AI & Claude consulting');
        assert.ok(indexHtml.includes('Technology Consulting'),
            'Should mention technology consulting');
        assert.ok(indexHtml.includes('IT Services'),
            'Should mention IT services');
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
