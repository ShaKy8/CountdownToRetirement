# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BranyonTech** - Kyle Shaver's personal site at branyontech.com. The homepage is a one-screen, text-only landing page (name, one sentence, three links). The retirement clock at `/countdown/` is the main feature: Kyle retired on February 27, 2026, so it runs in count-up mode (days since retirement) by default and only counts down when a visitor sets a future date.

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Node.js HTTP server (for local development)
- **Hosting:** AWS S3 + CloudFront (production)
- **Testing:** Custom test framework using Node.js built-in modules (no external dependencies)

## Development Commands

```bash
# Start local development server (port 8000)
node server.js

# Run client-side tests (125 tests)
node tests.js

# Run server integration tests (44 tests)
# Note: Stop any running server first, tests start their own
node tests-server.js
```

## Deployment

### Production (AWS)
- **S3 Bucket:** `branyontech.com`
- **CloudFront Distribution:** `E1MBTRO86GIH7E`
- **URL:** https://branyontech.com
- **Countdown URL:** https://branyontech.com/countdown/index.html

```bash
# Deploy to S3
aws s3 sync . s3://branyontech.com/ \
  --exclude "*" \
  --include "index.html" \
  --include "styles.css" \
  --include "favicon.svg" \
  --include "countdown/index.html" \
  --include "countdown/script.js" \
  --include "countdown/calc.js" \
  --include "countdown/styles.css" \
  --include "countdown/favicon.svg" \
  --include "countdown/stats.json"

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1MBTRO86GIH7E --paths "/*"
```

### Local Server (Systemd)
```bash
# Install systemd service
sudo cp countdown-retirement.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable countdown-retirement
sudo systemctl start countdown-retirement

# Check status
sudo systemctl status countdown-retirement
```

## Project Structure

```
CountdownToRetirement/
├── index.html              # One-screen personal landing page (no JS)
├── styles.css              # Landing page styles (warm cream, plum text, coral accent)
├── favicon.svg             # Professional "BT" monogram favicon
├── server.js               # Node.js HTTP server with security headers
├── countdown/              # Retirement clock (easter egg)
│   ├── index.html          # Dual-mode page (countdown / count-up) with back link
│   ├── calc.js             # Pure date math, shared by the page and tests.js
│   ├── script.js           # DOM rendering, mode switching, celebration
│   ├── stats.json          # Personal counters shown in count-up mode (edit + push)
│   ├── styles.css          # Night theme (countdown) + dawn theme (count-up)
│   └── favicon.svg         # Beach/sunset themed favicon
├── tests.js                # Client-side unit tests (125 tests)
├── tests-server.js         # Server integration tests (44 tests)
├── countdown-retirement.service  # Systemd service file
└── .github/workflows/      # GitHub Actions for CI/CD
    ├── deploy.yml          # Auto-deploy on push to main
    └── test.yml            # Run tests on PRs
```

## Key Features

### Landing Page (/)
- **Content:** "Kyle Shaver", the tagline "Retired technologist. Occasional AI and IT consulting, mostly by referral.", and three text links: email, GitHub, and the retirement clock
- **Design:** Light warm palette matching the retirement page's dawn theme, serif name, system fonts only (CSP blocks external fonts), no graphics, no JavaScript
- **Layout:** Fits one screen; body grid pins the footer to the bottom. `prefers-reduced-motion` and `prefers-contrast` handled in styles.css

### Retirement Clock (/countdown/)
- **Dual mode:** `calc.js` `getMode()` picks count-up when the target date is in the past (the default, Feb 27, 2026) and countdown when it is in the future. Mode-specific markup carries `data-mode="countdown|countup"` and is toggled with the `hidden` attribute; per-mode labels use `data-text-countdown` / `data-text-countup`.
- **Count-up mode:** Big day count with a months/days breakdown, dawn color palette (`body.mode-countup`), freedom metrics (weekends enjoyed, workdays skipped, work hours reclaimed, Mondays dodged, commutes avoided, meetings skipped, alarms not set), "Retired longer than..." comparisons, and milestones at 7, 30, 100, 182, 365, 500, 730, 1000, 1095, 1826, 3652 days. Hourglass, thermometer, and progress bar fill toward the next milestone.
- **Personal counters:** `countdown/stats.json` (trips, books, projects, naps, plus an `updated` date). Edit the numbers, push to main, and the deploy publishes them. A missing or invalid file simply hides that section.
- **Countdown mode:** Unchanged days/hours/minutes/seconds timer, original metrics and milestones, purple night theme.
- **Celebration:** The CONGRATULATIONS overlay only plays when a countdown reaches zero while the page is open, then transitions to count-up without a reload.
- **Customizable Date:** Collapsed behind "Not retired yet? Set your date"; accepts 1950-01-01 through 50 years ahead (stored in localStorage).
- **Metric assumptions:** 8 work hours/day, 2 commutes of 30 minutes, 3 meetings and 1 alarm per workday, as constants at the top of `calc.js`.

## Security Features

The server implements:
- Rate limiting (100 requests/minute/IP)
- Path traversal protection with URL decoding
- Dotfile/dotdirectory blocking (.env, .git, etc.)
- File extension whitelist
- Subdirectory index.html resolution
- Security headers (X-Frame-Options, CSP, X-Content-Type-Options, etc.)
- HTTP method validation (GET/HEAD only)
