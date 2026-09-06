# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BranyonTech** - Kyle Shaver's personal site at branyontech.com. The homepage is a one-screen, text-only landing page (name, one sentence, four links). The retirement clock at `/countdown/` is the main feature: Kyle retired on February 27, 2026, so it runs in count-up mode (days since retirement) by default and only counts down when a visitor sets a future date.

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Node.js HTTP server (for local development)
- **Hosting:** AWS S3 + CloudFront (production)
- **Testing:** Custom test framework using Node.js built-in modules (no external dependencies)

## Development Commands

```bash
# Serve the site the way production does — static files plus the weather API
# routed to the Lambda handler, so /weather/ can be exercised from its real
# subpath. This is what catches absolute-path bugs before they ship.
node scripts/dev-server.mjs        # http://localhost:8000

# Re-copy the weather console out of ../Weather after changing it there
./scripts/sync-weather.sh

# Original static server (site + countdown; sets the security headers)
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
├── weather/                # ATMOS//NET console (generated — scripts/sync-weather.sh)
├── lambda/index.mjs        # Weather API, derived from ../Weather/server.mjs
├── scripts/                # dev-server.mjs, sync-weather.sh, inject-backlink.py
├── docs/aws-setup.md       # One-time IAM / Lambda / CloudFront setup
├── 404.html  robots.txt  sitemap.xml
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
- **Content:** "Kyle Shaver", the tagline "Retired technologist. Occasional AI and IT consulting, mostly by referral.", and four text links: email, GitHub, the retirement clock, and the weather console
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

## Weather console (`/weather/`)

ATMOS//NET — a live weather console (WebGL sky, five views, a time scrubber).
Developed in the sibling repo `../Weather`; `scripts/sync-weather.sh` copies its
`public/` tree into `weather/` and adapts it:

- **Absolute asset paths become relative.** `/css/…`, `/js/…` and `/assets/…`
  resolve to the apex when served from `/weather/`, so every one would 404 and
  the page would render unstyled with no JS. The script rewrites them and then
  *fails* if any survive.
- **`wallpaper.html` is dropped** — it drives a desktop wallpaper renderer.
- **A back-link to the site is injected**, rather than committed upstream: the
  console is a standalone app in its own repo and shouldn't carry this site's
  chrome.

`weather/` is generated output. Change the console in `../Weather`, re-run the
sync, commit the result.

### API — `lambda/index.mjs`

Derived from `../Weather/server.mjs`, so the twelve route bodies are the same
code and response shapes cannot drift. `state.js` names every Open-Meteo field
by its exact upstream key, so a single dropped variable would null an entire
data column silently; and `bundle.space` is double-enveloped in a way that
blanks every space-weather readout if flattened.

Differences from the local server, all deliberate:

- `/api/config` returns a neutral Los Angeles default plus `public: true`. It
  must **never** carry a home address. The flag tells the frontend to offer the
  visitor geolocation — the local server omits it, so the console never prompts
  on the tailnet (where it also couldn't: geolocation needs a secure context).
- The on-disk cache points at `/tmp`, which Lambda keeps across warm invocations.
- Each route sets `Cache-Control`, so CloudFront's edge cache does the job the
  local server's in-memory TTLs do — one upstream fetch serves every visitor.
- No CORS headers: the API is same-origin through the same distribution.

### Two things that will silently break it

1. **The CloudFront cache policy for `/weather/api/*` must include query strings
   in the cache key.** Every route is keyed by `?lat=…&lon=…`, and the default
   `CachingOptimized` policy ignores them — CloudFront would cache one visitor's
   city and serve it worldwide, looking like it worked.
2. **The CSP must allow the map tile hosts under `/weather`.** The console draws
   Esri and RainViewer tiles into a canvas, and the site-wide
   `img-src 'self' data:` blocks them, leaving the radar blank with only a
   console error. `server.js` handles this with `headersFor()`; any CloudFront
   response-headers policy must do the same.
