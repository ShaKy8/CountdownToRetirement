# CLAUDE.md

The rulebook for working in this repository. It is short on purpose, so it is
read in full every session. The long record of every decision is
`docs/project-notes.md` (2,100 lines) plus one file per newer feature in
`docs/`: **read the section for the area you are about to change before you
change it** (the table in section 10 says which).

Order of trust when two things disagree: what Kyle says now, then the tests
and the code, then this file, then the notes in `docs/`.

## 1. What this project is

**BranyonTech** is Kyle Shaver's personal site, https://branyontech.com. Kyle
retired on February 27, 2026. The site is a one-screen text homepage that
links to things he built:

| Path | What it is |
|---|---|
| `/` | Homepage: name, one sentence with counted numbers, fourteen links in six groups (Retirement, Weather, Games, Music, Property, Reach me). Its colours follow the visitor's time of day and weather. |
| `/countdown/` | The retirement clock. Counts up since retirement (default), counts down if a visitor sets a future date. Also the trips, concerts, projects and books lists, the map of places and the bookshelf. |
| `/year/` | Year in review: ten full-screen slides built from the same data. |
| `/weather/` | ATMOS//NET, a live weather console with six views (deck, radar, sky, air, data, overhead), satellites and a hurricane atlas. |
| `/game/` | ONE PUTT: one mini-golf hole a day, played in the visitor's real wind. |
| `/slingshot/` | SLINGSHOT: one orbital puzzle a day. |
| `/ironwing/` | IRONWING: a low-poly carrier flight game. |
| `/asteroids/` | Starfall: a vector arcade game in the Asteroids genre. |
| `/elevator/` | Elevator '86: a retro spy arcade game. |
| `/postcards-in-sound/` | Six chord sketches with synthesised playback. |
| `/guitar/` | Four guitar theory tools on one shared fretboard. |
| `/mustang-micro-plus/` | Kyle's 70 amp presets: search, filters, favourites, notes. |
| `/fish-hatchery/` | A before/after property showcase with 34 photographs. |

**Who it is for:** Kyle himself, people sizing him up for consulting by
referral, and friends and family. Not strangers. So: no growth mechanics, no
leaderboards, no analytics, no accounts.

**Hard limits Kyle set:**

- **Under $5 a month, total.** Static hosting plus one Lambda. Anything that
  could cost money per request needs a cap and Kyle's approval.
- **No dependencies.** No `node_modules`, no framework, no bundler in the
  repo. The one vendored library is satellite.js's SGP4 under
  `weather/js/lib/satellite/`.
- **Working things, not essays.** He wants features he can use, not write-ups.

## 2. How it is built

- **Frontend:** plain HTML, CSS and JavaScript. No build step for the site
  itself. Two small generation steps exist: `bake-home.mjs` (writes the
  homepage's counts) and `stamp-assets.mjs` (writes `?v=` content hashes).
- **Hosting:** S3 bucket `branyontech.com` behind CloudFront
  `E1MBTRO86GIH7E`, region `us-east-1`.
- **API:** one Lambda, `atmos-weather-api` (`lambda/index.mjs`, Node 22),
  behind an API Gateway HTTP API, reached same-origin at `/weather/api/*`.
  HTTP GET only, no datastore. It proxies free weather, aircraft and
  hurricane feeds and sets `Cache-Control` so CloudFront's edge cache does
  the caching.
- **The weather console is generated.** Its source is the sibling repo
  `~/Projects/Weather`. `scripts/sync-weather.sh` copies it into `weather/`,
  rewrites paths, hashes the stylesheets and bundles the JS into
  `weather/dist/`. The output is committed.
- **Deploy is a push to `main`** that touches a deployed path.
  `.github/workflows/deploy.yml` bakes, stamps, syncs an explicit `--include`
  list of files to S3, syncs `weather/`, updates the Lambda and invalidates
  CloudFront. It also runs daily at 09:17 UTC so date-based counts roll over.
  **The test workflow does not gate the deploy**: a push with failing tests
  still ships.
- **Other workflows:** `test.yml` (on push and PR), `sats.yml` (satellite
  elements every 2 hours, behind a shared cooldown), `storms.yml` (hurricane
  archive daily), `storms-watch.yml` (emails when a storm is listed),
  `spend.yml` (weekly bill check).
- **Tests:** a hand-written runner in `tests.js` using only Node built-ins,
  `tests-server.js` for the local server, `node:test` files under `tests/`,
  and seventeen headless-browser gates in `scripts/*-audit.mjs` that speak
  CDP over Node's global `WebSocket`.
- **Kyle works on this repo from more than one machine and more than one
  session.** `origin/main` moves while a checkout sits still.

## 3. Map of the folders

```
index.html  home.js  styles.css   Homepage. home.js is its only script.
404.html  robots.txt  sitemap.xml  favicon.svg
countdown/        Retirement clock
  calc.js           pure date math (shared with tests and /year/)
  journal.js        pure: what counts, what is coming up (one rule, used everywhere)
  script.js         DOM, modes, list panels
  extras.js places.js journal.css   coming up, the map, the bookshelf
  stats.json        THE DATA: trips, concerts, projects, books, home
  land.json         coastline for the offline map (generated by make-land.mjs)
year/             Year in review: index.html, year.js, styles.css
game/             ONE PUTT: putt.js (pure rules), script.js (canvas, input), audio.js, styles.css
slingshot/        SLINGSHOT: orbit.js (pure rules), script.js (canvas, input), audio.js, styles.css
shared/daily.js   Seeding, wind sampling, storage: shared by the two daily games
ironwing/ asteroids/ elevator/
                  The three arcade games. Each: engine.js (pure rules), render.js,
                  audio.js, app.js (input, menus, storage, loop), styles.css
guitar/           index.html, lib/{theory.js (pure), board.js, synth.js, guitar.css},
                  pentatonic/ modes/ chord-modes/ caged/ (each index.html + app.js)
postcards-in-sound/  index.html, app.js, content.json
mustang-micro-plus/  index.html, app.js (the 70 presets live in it), styles.css
fish-hatchery/    index.html, app.js, styles.css, assets/*.webp
weather/          GENERATED. Never edit by hand (see section 8, mistake 2)
  js/               unbundled sources, kept because /countdown/ and /year/ import js/lib/*
  dist/ css/        hashed bundle and stylesheets the page actually loads
lambda/           index.mjs (the API), atcf.mjs (hurricane file parsers)
scripts/          dev-server.mjs, sync-weather.sh, bake-home.mjs, stamp-assets.mjs,
                  *-audit.mjs (browser gates), *-check.mjs (live checks),
                  fetch-sats.mjs, sats-cooldown.mjs, fetch-storms.mjs,
                  AWS setup scripts, lib/ (chromium.mjs, arcade-browser.mjs, sats-http.mjs, ...)
tests.js          Main suite (617 tests)
tests-server.js   Local server suite (94 tests)
tests/            node:test files (*.test.cjs, fetch-sats.test.mjs), fixtures/, and
                  elevator-browser.html + .js, a local-only harness that is never deployed
server.js         Original static server with security headers (runs as a systemd service)
docs/             project-notes.md (the long record), one file per newer feature
                  (elevator-86, starfall, ironwing, mustang-micro-plus, satellite-fetch),
                  aws-setup.md, site-404.md, fish-hatchery/HANDOFF.md, qa-fixes-2026-10-09.md
.github/workflows/  deploy, test, sats, storms, storms-watch, spend
sats/  storms/    Git-ignored local data. In production they are built by CI into S3.
archive/          The 2018 site. Leave it alone.
```

`TEST_README.md`, `TEST_SUMMARY.md` and `.test-quickstart` date from January
2026, when the suite had 101 tests. Their numbers are wrong. Do not trust or
update them.

## 4. Commands

Needs **Node 22 or newer** and a Chromium for the gates
(`scripts/lib/chromium.mjs` finds one; `$CHROMIUM` overrides).

### Run

```bash
# The site as production serves it: static files plus the API routed to the
# Lambda handler. Use this one. Port 8000 is usually taken (see below).
PORT=8137 node scripts/dev-server.mjs      # http://localhost:8137

node server.js                             # the original static server (no API)
```

Port 8000 on Kyle's main machine is a systemd service running `server.js`
from this checkout. It has no API, so the weather console and the games' wind
do not work there. Do not test against it.

### Build (generation steps)

```bash
node scripts/bake-home.mjs       # rewrite the homepage's "N trips, N concerts..." from stats.json
node scripts/stamp-assets.mjs    # refresh ?v= hashes after changing any .js, .css or photograph
node scripts/stamp-assets.mjs --check
./scripts/sync-weather.sh ~/Projects/Weather/public   # regenerate weather/ (always pass the path)
```

### Test

```bash
node tests.js                    # main suite; prints a summary, exits 1 on any failure
PORT=8237 node tests-server.js   # server suite; starts its own server on that port
node --test tests/postcards-integration.test.cjs tests/elevator.test.cjs \
  tests/asteroids.test.cjs tests/ironwing.test.cjs tests/fetch-sats.test.mjs
```

`PORT=8237 npm test` runs the same three in that order and stops at the first
one that fails. `tests.js` already runs the other `tests/*.test.cjs` files
itself. CI runs bake and stamp first, then all of these.

### Browser gates

Each takes the server's address. Start the dev server first, then:

```bash
node scripts/site-audit.mjs    http://localhost:8137          # phone check of /, clock, year, both daily games,
                                                              #   console, showcase, guitar, Elevator; again with: 320 700
node scripts/home-audit.mjs    http://localhost:8137          # homepage: one screen at nine sizes, contrast, links
node scripts/lists-audit.mjs   http://localhost:8137          # clock list panels; again with: 320 700
node scripts/figures-audit.mjs http://localhost:8137          # clock sky arc and milestone trail
node scripts/journal-audit.mjs http://localhost:8137          # coming up, places, bookshelf, /year/
node scripts/oneputt-fx-audit.mjs   http://localhost:8137     # ONE PUTT effects
node scripts/slingshot-fx-audit.mjs http://localhost:8137     # SLINGSHOT effects
node scripts/mobile-audit.mjs  http://localhost:8137/weather/ # console phone layout
node scripts/read-audit.mjs    http://localhost:8137/weather/ # console contrast and type size
node scripts/label-audit.mjs   http://localhost:8137/weather/ # chart labels; again with: 1440 900
node scripts/tap-audit.mjs     http://localhost:8137/weather/ # chart readouts on touch
node scripts/pinch-audit.mjs   http://localhost:8137/weather/ # radar map gestures
node scripts/transport-audit.mjs http://localhost:8137        # radar and scrubber share one cursor

# The arcade games' gates also take a folder for screenshots and results.
# Give them one outside the repo. Never commit or deploy what they write.
node scripts/elevator-audit.mjs  http://localhost:8137 OUT_DIR   # add --live for a fixture-free public check
node scripts/asteroids-audit.mjs http://localhost:8137 OUT_DIR
node scripts/ironwing-audit.mjs  http://localhost:8137 OUT_DIR
node scripts/ironwing-circuit-audit.mjs http://localhost:8137 OUT_DIR   # flies a whole sortie in real time: minutes
```

Run the gates for the area you changed, not all seventeen. Run slow ones in
the background, once, and wait for them to finish. Postcards in Sound and the
Mustang page have no browser gate: look at them yourself.

**All seventeen gates pass on Kyle's main machine as of November 13, 2026**
(run on November 12 and 13, against the dev server, at the sizes above). So a
gate that fails there now is news: suspect your change first. Two failed
before that date and were fixed: Elevator '86's title wrapped at 320px wide
(`docs/elevator-86.md`), and the Ironwing bank check timed itself by the wall
clock (`docs/ironwing.md`). The arcade gates play in real time, and a headless
browser there runs a game at about 75-85% of real speed; a wait in a gate
should read the game's own clock from `snapshot()`.

## 5. How to work here

1. **Start from the current `main`.** `git fetch`, then `git status -sb`. If
   it says `behind`, bring the checkout up to date before reading anything.
   Do it again just before you commit.
2. **Read before you write.** Open the file, read the comment at its top, and
   read the matching notes (section 10). Most odd-looking code here is a fix
   for a bug that was measured. If something looks wrong, find out why it is
   that way before changing it.
3. **Find the test first.** `grep -n "describe(" tests.js` lists the areas.
   Nearly every rule in this file is pinned by a test. A test that fails after
   your change is usually telling you about a rule you did not know.
4. **Make the smallest change that does the job.** Do not refactor, rename,
   reformat or "modernise" nearby code. Do not add a dependency, a framework,
   a build step or a new file where an existing one fits.
5. **Add a test for what you changed, and prove it bites:** break the code,
   watch the test fail, restore the code. A test that has never failed proves
   nothing.
6. **For anything Kyle will judge by eye or feel** (a layout, a game, a
   colour), show him a small throwaway first, or offer three or four
   directions and let him pick. Do not build the whole thing and then ask.
7. **Show, then ask to push.** When a visible change is done and verified,
   leave the dev server running, give Kyle the URL and the window size to
   look at, and ask before committing. A push to `main` is a deploy.
8. **Report exactly what happened.** Say which commands you ran and what they
   printed. If a test fails, say so and show it. If you did not run something,
   say that. Never write "should work".

**Ask Kyle before any of these:** commit or push; running any script with
`--apply` (they change AWS); anything touching IAM, the Lambda's environment
or the API key; deleting anything from S3; adding, removing, renaming or
moving a homepage link; dispatching `sats.yml` by hand; anything that can
cost money.

**To undo a release:** `git revert` the commit and push, so the same workflow
redeploys. Never reset or force-push `main`. The `rollback/pre-*` branches and
tag mark the commit before each recent release; leave them alone.

## 6. Coding rules

- **Pure rules are separate from the page.** Each feature has a rules file
  with no DOM, no network and no storage, where time and random seeds come in
  as arguments: `calc.js`, `journal.js`, `putt.js`, `orbit.js`, `daily.js`,
  `theory.js`, each arcade game's `engine.js`, and in the console
  `weather/js/lib/` (`tonight.js`, `elsewhere.js`, `sats.js`, `storms.js`,
  `stormpack.js`, `astro.js`). The page file next to it does the drawing and
  input. Put new logic in the rules file so the tests run the exact code the
  browser runs. Effects, sound and animation never go in a rules file; tests
  grep the rules files for the words.
- **Match the file's module style.** Rules files are classic scripts wrapped
  so they set a global in the browser and `module.exports` in Node (see the
  end of `countdown/calc.js`); the tests `require()` them. Page scripts are
  classic scripts too. ES modules: the weather console, `lambda/`, the `.mjs`
  scripts, `year/year.js`, `countdown/extras.js`, `countdown/places.js`. Do
  not convert one to the other.
- **Match the file's formatting.** Look at the file you are in. Most of the
  site's scripts, `server.js` and the test files indent four spaces; `.mjs`
  files, the weather console, `countdown/places.js` and `fish-hatchery/app.js`
  indent two. The three arcade games are written much more densely. Leave
  each file's style as it is. Semicolons. Single quotes.
- **Comments say why, not what.** The existing comments name the bug that a
  line prevents. Write yours the same way, and keep the ones that are there.
- **The CSP is `script-src 'self'`, `font-src 'self'`, `connect-src 'self'`.**
  So: no inline `<script>`, no inline event handlers, no CDN, no web fonts
  from another host, no fetch to another origin from the browser. A third
  party feed goes through the Lambda.
- **Untrusted text never reaches `innerHTML` raw.** That means anything from
  `stats.json`, an API, a header, a URL or `localStorage`. On most pages,
  build elements and set `textContent`. Where a file already builds HTML
  strings (the weather console, Postcards), every outside value goes through
  that file's escape helper (`escapeHtml` in `weather/js/lib/util.js`, `esc`
  in Postcards). A URL from data is kept only if it is root-relative or
  `https://`.
- **Every `localStorage` access is inside `try/catch`,** and the page must
  work when it throws.
- **Storage keys and record shapes are permanent.** `oneputt.v1`,
  `slingshot.v1`, `starfall.v1`, `ironwing-v1`, `elevator86.best`,
  `elevator86.muted`, `mmp-presets-v1`, `postcards-in-sound-v1`,
  `branyon.sky.v1`, `atmos.sats.v1`, `retirementDate`. Renaming one throws
  away what a visitor saved.
- **Call the API by absolute path:** `/weather/api/bundle`, never
  `./api/bundle`. A relative path from `/game/` fails silently.
- **Every failure has a quiet, correct fallback.** No network gives synthetic
  wind; no API key gives the rules-written sentence; a bad `stats.json` hides
  its section; blocked storage or audio never stops a game. But a fallback
  must never say something false: "could not check" must never display as
  "none" or "0".
- **Validate every API input in the Lambda:** coordinates through `point(q)`,
  ids against a pattern, before any URL is built. Nothing a caller sends goes
  to the model as text. Every upstream fetch has a deadline.
- **No audio files, ever.** Sound is synthesised with Web Audio, and the
  `AudioContext` is created on the first user gesture. A test fails on any
  `.mp3`, `.wav` or `.ogg` in the working folder that git does not ignore,
  which is every audio file that could be committed.
- **No test hooks in a shipped game.** Each arcade game exposes one frozen,
  read-only `snapshot()` for its gate (`Elevator86App`, `StarfallApp`,
  `IronwingApp`). Never add a setter, a cheat, an invulnerability flag or a
  way to speed up time.
- **A count is derived, never stored.** The number on a tile is the length of
  its list. "Coming up" is derived from an entry's date. Do not add a field
  that repeats what can be computed.
- **Tests:** new checks for existing areas go in `tests.js` as
  `describe('AREA - topic', ...)` and `test('Should ...', ...)`, using
  `assert`. A self-contained page may have its own `tests/<name>.test.cjs`
  using `node:test`; then add it to `package.json`'s `test` script and to
  `test.yml`. No test framework.

## 7. Design rules

- **Contrast is measured, on the real pixels.** Text is at least 4.5:1 (3:1
  for large text and for underlines) against the surface it actually sits on.
  In the weather console, small text is also at most 14:1 and never on a
  near-black ground: glare is a failure too.
- **Type floor:** nothing under 12px in the console (11.5px on canvas).
- **Touch targets follow WCAG 2.5.8:** 24x24 CSS px always; 44x44 only when
  another target is within 12px. Do not apply a flat 44px rule to text links.
  Game buttons that sit beside each other are at least 44x44.
- **Check phones first:** 390x844 and 320x700, plus 375x667 and 360x640 for
  the homepage. Nothing may scroll sideways, and no text may be cut off
  without an ellipsis.
- **The homepage fits one screen, has exactly fourteen links in six groups,
  and loads exactly one script.** Kyle chose the groups, their order and
  every link. When a link was added, the room came from the chrome (padding,
  margins, the size of the name and tagline) and never from the links' height
  or the vertical gaps between them. `404.html` shares the stylesheet and
  carries most of the same links, so it has to fit as well.
- **Honour `prefers-reduced-motion`, `prefers-contrast: more` and
  `forced-colors`.** Every animation has a static end state.
- **Where a fade would pass through an unreadable state, do not fade.** The
  homepage sky steps once a minute; the clock's sky arc has no transition.
- **Words and emoji are HTML; SVG and canvas are for geometry.** Emoji in SVG
  text sit differently on every platform, and SVG text cannot wrap.
- **Palettes are tokens.** Homepage: warm cream, plum text, coral `#bd5c43`,
  system fonts. Console, ONE PUTT and SLINGSHOT: "Midnight Slate"
  (`--void #0f1826`, `--ink #dde2e8`, jewel-tone accents), defined once in the
  console's `core.css` (in the Weather repo; here it is
  `weather/css/core.<hash>.css`) and repeated in `charts.js`; a test keeps
  the copies equal. Never type a new hex colour where a token exists.
- **Chart density comes from measured pixels,** through `fitTicks`,
  `fitStride`, `fitLabel` and `tagRow` in `charts.js`, never a typed constant.
- **Hover is never the only way.** Anything shown on hover must also work by
  tap and by keyboard. Interactive things are real `<button>` and `<a>`
  elements.
- **Words are part of the design.** Plain, exact, no hype. Hurricane history
  says "centre within 100 mi", never "hit" or "felt". The forecast card says
  "closest forecast approach", never "arrival", "landfall" or "safe". Analog
  storms are "similarity, not a forecast". Tests grep for the forbidden words.
- **The games are original.** All art is drawn in code and all sound is
  synthesised. A game may belong to a classic genre; it never uses another
  game's name, characters, art, sound or levels, and never a downloaded asset.

## 8. Mistakes a weaker model would make here, and how to avoid each

**Before you start**

1. **Working from a stale checkout.** Kyle and other sessions push to `main`
   from other machines. This file was first drafted on a checkout seven
   commits behind, and it described a homepage that no longer existed.
   *Instead:* `git fetch` and `git status -sb` first; if behind, update with
   `git merge --ff-only origin/main` on a clean tree. Check again before you
   commit.

**Generated and duplicated files**

2. **Editing `weather/` by hand.** The next sync deletes the edit. *Instead:*
   edit `~/Projects/Weather/public`, run
   `./scripts/sync-weather.sh ~/Projects/Weather/public`, and commit both
   repos. The script's default path does not exist on this machine, so always
   pass the path.
3. **Changing `lambda/index.mjs` and not `~/Projects/Weather/server.mjs`.**
   The route bodies are the same code in both, `atcf.mjs` is byte-identical in
   both, and `tests/weather-reliability.test.cjs` is identical in both. Tests
   compare them. *Instead:* make the same edit in both places.
4. **Forgetting to stamp.** After changing any `.js`, `.css` or photograph
   under a stamped page, `tests.js` fails until you run
   `node scripts/stamp-assets.mjs`. *Also:* when a test looks for a script by
   name, match `src="name.js` followed by `?` or `"`, because of the stamp.
5. **Typing the homepage's numbers.** The clause between `<!-- since -->` and
   `<!-- /since -->` is written by `bake-home.mjs`. *Instead:* edit
   `countdown/stats.json` and run the bake. The count also changes by itself
   when a dated entry's day arrives, so "The tagline's counts should be the
   clock's lists" can fail on a clean checkout: run the bake, do not edit the
   test.
6. **Adding a file and listing it in one place.** A new page or asset must be
   named in its HTML, in `deploy.yml` (the `paths` filter and the right
   `--include` list), in `tests-server.js`, in `stamp-assets.mjs`'s `PAGES`
   and `tests.js`'s `STAMPED_PAGES` if it is a page, and in `sitemap.xml` if
   it is public. Miss `deploy.yml` and it works locally and 404s in
   production. Test harness files (`tests/elevator-browser.*`) stay out of
   every one of those lists. The three SLINGSHOT script names (`orbit.js`,
   `script.js`, `audio.js`) must also stay written in this file: a test
   reads it.

**Things that are frozen**

7. **"Improving" the daily games' random numbers, level generators or
   physics.** `makeRng`, `ARCHETYPES`, `generateHole`, `fly()`,
   `MASS_SCALE = 70`, `G`, `V_MIN`, `V_MAX` and the half-unit coordinate grid
   decide every daily puzzle ever played and every share string ever posted.
   Two people must get the same puzzle on different browsers, which is why
   `fly()` uses only `+ - * /` and `sqrt`. *Instead:* leave them. Effects read
   events the physics already produces.
8. **Changing a stored record's shape or key order.** `oneputt` and
   `slingshot` records in `localStorage` are read back by `parseState` and
   golden rows in tests pin them. New fields go last, and old records must
   still parse.
9. **Reordering `stats.json`.** The file is oldest first (the page reverses
   it). Append at the bottom. A trip needs `place`, `when`, `date`
   (`YYYY-MM-DD` or `YYYY-MM`), `lat` and `lon`. Leave an optional key out
   rather than blank. Never add a count field or an `upcoming` list.
10. **Editing the Mustang presets.** The 70 records and their order are
    Kyle's own list, copied exactly from his file. Do not correct, sort or
    "fix the spelling" of any of them.

**Silent failures in production**

11. **Trusting "it works on localhost".** Production differs: files ship only
    if `deploy.yml` lists them; the API is behind CloudFront's cache; deploys
    never delete from S3 except under `weather/`. *Instead:* test on
    `dev-server.mjs` (it routes the API like production), and after a deploy
    check the live URL with `curl`.
12. **Letting the query choose the answer on `/api/here`.** Its edge cache is
    keyed on CloudFront's viewer headers, not the query. A route that read
    `?lat=` would let one request set a whole city's weather. It takes `_q`
    and never reads it. Every other route is keyed on its query string, so a
    new route's cache policy must include the query.
13. **Copying `Permissions-Policy: geolocation=()` from `server.js` to
    production.** It silently disables location, and every visitor gets Los
    Angeles weather. Production sends `geolocation=(self)`.
14. **Showing "0" or "none" when the truth is "unknown".** Before the first
    aircraft answer the count is a dash. When both feeds fail the page says
    so. `/api/storms` throws a 502 when it cannot read NHC, so a failed check
    is never cached as "no storms". Keep these three states apart in any new
    feature: not yet known, known to be empty, could not find out.
15. **Adding a route that can spend or be flooded.** `/api/elsewhere` is
    capped at `MODEL_CALLS_PER_HOUR`, the memory cache is capped at
    `MEM_MAX`, the stage is throttled. A new route needs input validation, a
    deadline, a `Cache-Control` and a test that it reaches no upstream on bad
    input.
16. **Hammering a free upstream.** CelesTrak blocks an IP after repeats;
    RainViewer rate-limits; the aircraft feeds are hobbyists' receivers.
    *Instead:* do not add retries (the fetch scripts stop at the first
    non-200 on purpose), never poll faster than the code already does, and
    stop polling when a view is hidden. Satellite elements are fetched only
    by the `sats.yml` workflow, which holds a shared cooldown in S3: never run
    `fetch-sats.mjs` directly, and never re-dispatch the workflow to clear a
    failure.
17. **Putting a secret in the repo, the browser or a command line.** This
    repository is public. The Anthropic key is set by hand as a Lambda
    environment variable and expires 2027-01-01. An expired key looks exactly
    like the normal fallback.

**Layout and interaction**

18. **Fixing an overflow on the element that overflows.** The cause is nearly
    always an ancestor that was never told it may shrink: an implicit `auto`
    grid column, or an unnamed wrapper sized to its widest child. *Instead:*
    walk up the tree; the fix is usually `minmax(0, 100%)` or `min-width: 0`
    on the ancestor.
19. **Changing the homepage's links, adding a second script, or adding a
    `@media (pointer: coarse)` block there.** Tests pin the fourteen links,
    the six groups and their order, and the one script. The one-screen budget
    was measured. A link change is Kyle's decision; when he makes one, update
    `index.html` (and `404.html` if it should carry the link), both tests in
    `tests.js`, and the counts in `home-audit.mjs`, then run `home-audit.mjs`
    (nine sizes) and `site-audit.mjs`.
20. **Adding a CSS transition to the homepage sky or the clock's figures.**
    See section 7. The gates assert there are no animations.
21. **Using hover, or `.click()` in a gate, as if it were a finger.** A real
    tap focuses, then clicks, and fires `pointerenter` and `pointerleave`
    around it. Guard hover by `event.pointerType`. In gates, call `focus()`
    before `click()`. In a game, a lifted, cancelled or lost pointer, a blur
    and a hidden tab must each clear the held control.
22. **Building a new weather view without wiring all four places:** the tab
    button and the `<section>` in `index.html`, `VIEWS` in `main.js`, and the
    keyboard range. Heavy modes (satellites, storms) are lazy chunks loaded
    by a dynamic `import()`; keep them out of the main bundle.
23. **Reading units as given.** The API serves Fahrenheit, mph and inches;
    several rules think in Celsius. `fromCurrent()` reads the units off the
    payload. Averaging two compass directions arithmetically gives the
    opposite direction; use the existing interpolation. Anchor a day in the
    place's time zone, not the viewer's.

**Testing and tooling**

24. **Making a test pass by weakening it.** Do not delete an assertion, widen
    a regex or change an expected value to match your output unless Kyle
    asked for the behaviour to change. If a test blocks you, read its comment:
    it names the bug it exists for.
25. **Believing a gate that measured nothing.** Headless Chromium draws no
    frames unless asked, so `requestAnimationFrame` never fires and fade-ins
    stay at opacity 0; a frame that scrolls off screen is throttled. The gates
    shim the clock or pump frames, and assert their own frame counts. A new
    gate must include a "bite proof": break the thing on purpose inside the
    gate and require the measurement to fail.
26. **Testing the Weather repo's own server instead of the synced copy.** The
    sync injects a back link that the source does not have, and it once pushed
    a button off screen. Audit `http://localhost:8137/weather/`.
27. **Starting a slow command twice, or waiting in nested loops.** Start it
    once in the background and wait. To clear a stuck browser, list with
    `pgrep -fa "[c]hrome-linux64/chrome --headless=new"` and kill those PIDs.
    Never `pkill -f` with a pattern that is in your own command line: it
    kills your shell (exit 144).
28. **Treating one timeout or one slow run as a verdict.** A gate can stall
    for reasons that are not the site. Run it again before concluding, and
    say in your report that it was flaky.
29. **Assuming a path or a tool exists.** Run `hostname` first. Kyle uses
    three machines; `~/Projects/Weather`, the Chrome path and the AWS login
    differ between them. `git pull` with uncommitted changes fails, and on a
    machine where `pull.rebase` is set the error talks about rebasing: commit
    or stash first.
30. **Touching Kyle's untracked files.** A file or folder that `git status`
    shows as untracked and that you did not create is his work in progress.
    Never delete, move, tidy or commit it. If it makes a test fail (audio
    samples in a folder git does not ignore trip the no-audio-files test),
    report the failure and leave both the folder and the test alone.

**Scope and honesty**

31. **Doing more than was asked.** No drive-by cleanups, no new docs, no new
    abstractions, no "while I was here". If you see a real problem outside
    the task, tell Kyle; do not fix it unasked.
32. **Stating something you did not check.** The notes mark what was measured
    and what was not ("not measured", "unknown", "proven by its unit test
    only", "browser emulation, not a physical phone"). Keep that habit: say
    what you ran, on which machine, and what you could not verify. This
    machine's fonts and network are not production's.
33. **Inventing data.** No made-up trips, numbers, model output, storm
    behaviour or wind speeds. If the data does not say, the page says it does
    not know.
34. **Deploying by accident.** `git push` to `main` ships to the live site
    within minutes, tests passing or not. Never push without Kyle's yes.

## 9. Checklist before saying a task is done

Go through every line. Say which ones you ran and paste the result lines.

- [ ] I ran `git fetch` before starting and again now, and this checkout is
      not behind `origin/main`.
- [ ] I read the matching notes (section 10) and the comment at the top of
      every file I changed.
- [ ] The change is only what was asked. `git status` and `git diff --stat`
      show no file I did not mean to touch, and no untracked file of Kyle's
      was moved, deleted or staged.
- [ ] If I changed the weather console: the edit is in `~/Projects/Weather`,
      I ran the sync with the path, and `weather/` was not edited by hand.
- [ ] If I changed the Lambda: the same edit is in
      `~/Projects/Weather/server.mjs`.
- [ ] If I changed `stats.json` or it is a new day:
      `node scripts/bake-home.mjs`.
- [ ] If I changed any `.js`, `.css` or photograph:
      `node scripts/stamp-assets.mjs`.
- [ ] If I added a file: it is in its HTML, `deploy.yml` (paths and
      `--include`), `tests-server.js`, and the stamp lists.
- [ ] `node tests.js` reports zero failed.
- [ ] `PORT=8237 node tests-server.js` reports zero failed.
- [ ] The `node --test` command in section 4 reports zero failed.
- [ ] There is a test for the new behaviour, and I saw it fail with the
      change removed.
- [ ] I ran the browser gates for the area I changed, against
      `PORT=8137 node scripts/dev-server.mjs`, at 390x844 and 320x700 (and a
      desktop size for charts and the console).
- [ ] For a visible change I looked at it: a screenshot or the page itself,
      not only the test output.
- [ ] No headless browser of mine is still running, and I stopped any server
      I started, unless Kyle is going to look at it.
- [ ] I updated the matching notes (and this file, if a rule, command, page
      or folder changed) with what changed and why, including anything I
      measured and anything I could not verify.
- [ ] I did not commit or push. I told Kyle what is ready, where to look
      (URL and window size), what failed or was skipped, and asked.

After Kyle says yes and the push is done: wait for the workflows, check the
live URL, and `git pull` in this checkout.

## 10. What to read before touching each area

Find a heading with `grep -n '^## \|^### ' docs/project-notes.md`, then read
that section in full. The header of that file lists what in it is out of date.

| You are changing | Read |
|---|---|
| `index.html`, `home.js`, `styles.css`, `404.html` | "Landing Page (/)" for the mechanisms, then "Starfall and the Games / Music split" and `docs/mustang-micro-plus.md` for the current links and groups |
| `countdown/` clock, tiles, list panels, figures | "Retirement Clock (/countdown/)" |
| `stats.json`, coming up, the map, the bookshelf | "Coming up · Places · the bookshelf" |
| `year/` | "Year in Review (/year/)" |
| `game/`, `shared/daily.js` | "ONE PUTT (/game/)", "Impact is an event (ONE PUTT)" and the "Two things that will silently break it" after them |
| `slingshot/` | "SLINGSHOT (/slingshot/)" through its "Two things that will silently break it" |
| `elevator/` | `docs/elevator-86.md`, and "Elevator ’86" and "Elevator progression" |
| `asteroids/` | `docs/starfall.md` |
| `ironwing/` | `docs/ironwing.md` |
| `mustang-micro-plus/` | `docs/mustang-micro-plus.md` |
| `fish-hatchery/` | "Fish Hatchery", then `docs/fish-hatchery/HANDOFF.md` |
| Any console layout or CSS | "It has a phone layout, and it is easy to break", "Every word readable", "Midnight Slate" |
| Console charts | "It has a phone layout..." (chart density, sticky readouts) |
| RADAR, the scrubber, map tiles | "One transport", "How the console ships" |
| OVERHEAD, aircraft, satellites | "OVERHEAD", "SATELLITES" |
| `fetch-sats.mjs`, `sats-cooldown.mjs`, `sats.yml` | `docs/satellite-fetch.md`, then "SATELLITES" |
| Hurricanes, `/api/storms`, the storm watch | "HURRICANES" |
| DECK panels | "ACTIVITY WINDOWS", "ELSEWHERE" |
| SKY's observing panel | "TONIGHT" |
| `sync-weather.sh`, the bundle, console load time | "Weather console (`/weather/`)", "How the console ships" |
| `lambda/` | "API — `lambda/index.mjs`", "Abuse limits on the API" |
| Headers, CSP, CloudFront, anything in AWS | "Security headers in production", then `docs/aws-setup.md` |
| The 404 page's routing | `docs/site-404.md` |
| Gates, a new machine, hung browsers | "Working on it from more than one machine", "The whole site on a phone" |

`guitar/` and `postcards-in-sound/` have no notes. For those, the comments at
the top of `guitar/lib/theory.js`, `guitar/lib/synth.js` and
`postcards-in-sound/app.js`, and the "GUITAR THEORY" tests in `tests.js` and
`tests/postcards-integration.test.cjs`, are the record.
