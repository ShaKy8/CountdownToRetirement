# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BranyonTech** - Kyle Shaver's personal site at branyontech.com. The homepage is a one-screen, text-only landing page (name, one sentence, six links). The retirement clock at `/countdown/` is the original feature: Kyle retired on February 27, 2026, so it runs in count-up mode (days since retirement) by default and only counts down when a visitor sets a future date. `/weather/` is a live weather console, and `/game/` is ONE PUTT — a daily mini-golf hole played against the real wind wherever the visitor is, which is what ties the two together. `/slingshot/` is SLINGSHOT — a daily orbital puzzle where gravity bends your shot to a beacon.

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

# Run client-side tests (248 tests)
node tests.js

# Run server integration tests (53 tests)
# Note: Stop any running server first, tests start their own
node tests-server.js
```

## Deployment

### Production (AWS)
- **S3 Bucket:** `branyontech.com`
- **CloudFront Distribution:** `E1MBTRO86GIH7E`
- **URL:** https://branyontech.com
- **Countdown URL:** https://branyontech.com/countdown/index.html
- **Game URL:** https://branyontech.com/game/
- **Slingshot URL:** https://branyontech.com/slingshot/

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
  --include "countdown/stats.json" \
  --include "game/index.html" \
  --include "game/putt.js" \
  --include "game/script.js" \
  --include "game/styles.css" \
  --include "game/favicon.svg" \
  --include "shared/daily.js" \
  --include "slingshot/index.html" \
  --include "slingshot/orbit.js" \
  --include "slingshot/script.js" \
  --include "slingshot/audio.js" \
  --include "slingshot/styles.css" \
  --include "slingshot/favicon.svg" \
  --include "shared/daily.js" \
  --include "slingshot/index.html" \
  --include "slingshot/orbit.js" \
  --include "slingshot/script.js" \
  --include "slingshot/audio.js" \
  --include "slingshot/styles.css" \
  --include "slingshot/favicon.svg"

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
├── game/                   # ONE PUTT - the daily putting game
│   ├── index.html          # Board, HUD, sliders, result card
│   ├── putt.js             # Pure rules: seeding, holes, physics, wind, state
│   ├── script.js           # Canvas, input, weather fetch, localStorage
│   ├── styles.css          # Console palette, borrowed from weather/css/core.css
│   └── favicon.svg
├── shared/daily.js         # Seeding, API sampling, storage - shared by the games
├── slingshot/              # SLINGSHOT - a daily orbital puzzle
│   ├── index.html          # One canvas, HUD, result card
│   ├── orbit.js            # Pure rules: level generation + validation, gravity,
│   │                       #   flight, par, scoring, share, storage schema
│   ├── script.js           # Canvas, aiming, ghost trails, localStorage
│   ├── audio.js            # Web Audio synthesis - NO audio files, see below
│   ├── styles.css
│   └── favicon.svg
├── tests.js                # Client-side unit tests (248 tests)
├── tests-server.js         # Server integration tests (53 tests)
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

### ONE PUTT (/game/)
- **One hole a day, rolling over at LOCAL midnight.** `putt.js` `puzzleDay()` keys
  off the player's local calendar date, as Wordle does. This still gives everyone
  the identical hole, because the seed comes from the date (2026-09-07) rather
  than from an instant: two people both playing their own Sep 7 derive the same
  seed, even though Tokyo starts sixteen hours before Los Angeles — and the
  puzzle number travels with the date, so "#249" is never ambiguous.
  `Date.UTC()` of the local y/m/d normalises each date to a UTC-midnight instant
  before subtracting, which keeps the count exact across DST, where a local day
  is 23 or 25 hours long. The tests are built from local date parts so they pass
  in any zone; CI runs UTC and the author's machine does not.
- **The wind is the player's real wind.** `extractWind()` interpolates
  `forecast.data.hourly` from `/weather/api/bundle` — never `current`, which
  `weather/js/state.js` documents as the noisy 15-minute model step. Direction
  interpolates the short way around the circle; averaging 350° and 10°
  arithmetically gives 180°, exactly backwards.
- **It is playable before the network answers.** Boot is synchronous on
  `syntheticWind(seed)`; live wind upgrades it only *before the first stroke*,
  because changing the wind mid-round would make the score meaningless. Every
  malformed payload resolves to synthetic rather than an error path.
- **Daily vs practice.** `recordDaily()` is idempotent per day and refuses days
  at or before `lastDay`, so "the first attempt is the one that counts" is a
  property of the data, not a rule the UI has to remember. `?seed=` forces
  practice mode so a hand-picked hole can never be recorded.
- **Holes are parameterised archetypes, not free-form geometry**, so the space is
  bounded by construction. `generateHole()` validates and retries 32 times before
  a hand-authored fallback, and cannot return an invalid hole. All coordinates
  snap to a half-unit grid: `Math.sin/cos/pow` are not bit-identical across JS
  engines, and the hole must be.
- **Dev overrides:** `?seed=1234` and `?wind=12@210`.

### Two things that will silently break it

1. **`makeRng` and `ARCHETYPES` are frozen.** Changing either rewrites every hole
   ever played and invalidates every share string ever posted. A test pins the
   PRNG's first five outputs so it cannot happen by accident; a deliberate change
   means a new `oneputt.v2` storage epoch.
2. **The API must be called by absolute path.** A relative `./api/bundle` from
   `/game/` resolves to `/game/api/bundle`, which CloudFront does not route to the
   Lambda — and it fails *quietly* into synthetic wind, indistinguishable from a
   slow API day. Asserted by a test rather than remembered.

### SLINGSHOT (/slingshot/)

One orbital puzzle a day. Launch a probe from the pad and reach the beacon; the
direct line is always blocked by a body, so every level has to be flown *around*
something and gravity is what gets you there. **Score is shots, exactly as ONE
PUTT scores strokes**, against a par derived from the level.

- **You cannot lose.** Keep firing until you arrive; a bad day is a high score,
  not a game over.
- **Predictable aim, unpredictable consequence.** The preview shows only the
  first fraction of the path. You know exactly where you are pointing; what the
  planets do about it is the entire product, and previewing the whole trajectory
  would hand over the answer.
- **Ghost trails are the teaching mechanism.** Every previous attempt stays on
  screen, faint, red if it hit a body. That turns the error gradient into
  something you can see rather than a number you have to interpret.
- **Failure is nameable** — "into the planet, go wider", "out of the system,
  closest approach 40". This is the property THERMAL never had.
- **`?level=N`** loads a specific level as unscored practice, and free play never
  records; a hand-picked level must never become the day's score.

### The three constants that decide whether it is a game

Every one of these was measured, and each has a failure mode that looks like
working code:

1. **`MASS_SCALE = 70`.** Deflection of a flyby is `tan(θ/2) = GM/(b·v²)`. At
   MASS_SCALE 1 that is about one degree, and measured across 30 levels **the
   median path curved a total of 2°** — the probe flew straight past every planet
   and the slingshot slung nothing. At 70 the median path curves 41°. Raising it
   trades drama for chaos: stronger gravity bends more but fewer levels pass
   `validateLevel`, which only costs generation retries.
2. **The timescale (`G`, `V_MIN`, `V_MAX`).** Trajectory shape depends only on
   speed over `sqrt(GM)`, so scaling speeds by *k* and `G` by *k²* leaves paths
   identical and flies them *k* times faster. An earlier scale put a solved shot
   at a median 14.5 s with the hard ones at 25–37 s, which is dead time you
   cannot influence. It is now about 2 s — a ONE PUTT roll.
3. **`validateLevel`'s smoothness test.** About half of all generated levels have
   a *flat* error surface: miss by 1° and you land 150 units away, miss by 5° and
   you land 153 away, so nothing tells you which way to correct. Those are thrown
   away. Generation retries up to 14 times, at ~19 ms and a median of 2 attempts.

Measured over 40 daily levels: **40/40 playable, median aim window 1.8°** (ONE
PUTT's ace window is 1.6–1.9°), median flight 2.0 s, median 48 distinct
solutions per level. `node tests.js` asserts all of it — reverting MASS_SCALE to
1 fails two tests by name.

### Two things that will silently break it

1. **The rules must stay pure** and the level must stay bit-identical. `fly()`
   takes a unit vector rather than an angle, and every coordinate snaps to a
   half-unit grid, because `Math.sin` is not correctly rounded across JS engines
   while `+ - * /` and `sqrt` are. Two people playing day 251 must fly the same
   day 251. A test greps `fly()` for transcendentals.
2. **Sound must be synthesised.** `server.js`'s `allowedExtensions` has no audio
   MIME type, so any `.mp3` 404s in dev and is silently absent in production. A
   test walks the whole repo and fails on one. The `AudioContext` is created
   lazily on the Launch click — the guaranteed first gesture of a session.

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

**The stylesheets are content-hashed by the sync** (`core.<hash>.css`), so a CSS
change is a new URL and is cached for a year. The JS cannot be — 21 ES modules
importing each other by relative specifier with no bundler — so it ships with
`max-age=60, stale-while-revalidate`. That combination is what stops a deploy
serving new HTML against hour-old CSS and JS.

### It has a phone layout, and it is easy to break

`css/mobile.css` is a second form factor behind one `max-width: 700px` query;
the desktop console is untouched. Run `node scripts/mobile-audit.mjs` before
changing any console layout — it loads all five views at 390x844 and checks for
overflow, unreachable controls, sub-44px targets and sub-12px text.

**Audit the DEPLOYED copy** (`localhost:8000/weather/` via `dev-server.mjs`),
never `../Weather`'s own server. `inject-backlink.py` adds a top-bar child that
the source does not have, and that one extra element pushed the settings button
off screen and widened every view by 26px — the source passed while production
failed.

Three things there are load-bearing and non-obvious:

1. **The phone views are flex columns, not reflowed grids.** An `auto` grid
   track sizes from the item's intrinsic contribution, and these panels are
   nested flex columns whose contribution resolved to 61px against content
   needing 418 — they overflowed their own tracks and drew on top of each other.
2. **`#app` sets `grid-template-columns: minmax(0, 100%)`.** An implicit column
   is `auto`, so an overflowing top bar silently widened the entire shell.
3. **`viewport-fit=cover` requires `env(safe-area-inset-*)`.** Without it the
   top bar sits under the status bar and the scrubber under the home indicator,
   which is exactly where its drag gesture lives.

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
2. **Lambda Function URLs return 403 in this account** for every auth mode,
   even with an explicit public grant, and requests never reach the function.
   The API is therefore fronted by an API Gateway HTTP API. If you ever rebuild
   it, note the invoke permission's source ARN must be `${API}/*` — the
   `apiid/*/*/*` form used for REST APIs does not match an HTTP API and causes
   a 500 with no Lambda log entry.
3. **The CSP must allow the map tile hosts under `/weather`.** The console draws
   Esri and RainViewer tiles into a canvas, and the site-wide
   `img-src 'self' data:` blocks them, leaving the radar blank with only a
   console error. `server.js` handles this with `headersFor()`, and the
   CloudFront policy in `scripts/cloudfront-headers.py` mirrors it. A test keeps
   the two lists of tile hosts identical.

## Security headers in production

`server.js` only ever protected the tailnet. `scripts/cloudfront-headers.py`
creates and attaches the CloudFront response-headers policies (dry run unless
`--apply`), and `scripts/check-headers.sh` reports what production actually
sends. Full runbook in `docs/aws-setup.md`.

**The one header that must NOT be copied from `server.js`:** it sends
`Permissions-Policy: geolocation=()`, which is right for plain-HTTP local use
and would silently break the site in production. The console and ONE PUTT both call `getCurrentPosition`; an empty allowlist disables it with no
error, and every visitor quietly gets Los Angeles weather. Production sends
`geolocation=(self)`.
