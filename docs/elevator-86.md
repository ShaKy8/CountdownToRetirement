# Elevator ’86

An original, dependency-free spy arcade game at `/elevator/`, inspired by the
multi-floor infiltration/escape loop of classic elevator arcade games. All art
is drawn from original canvas shapes; all audio is synthesized with Web Audio.
No commercial sprites, recordings, fonts, remote assets, or game libraries.

## Play

Collect every red-door file, then reach the car on the bottom floor. Arrow keys
or WASD move; Up/E holds to collect; Up/Down calls and rides lifts; Down away
from a shaft crouches; Space/Z jumps; X/J fires. P/Escape pauses, R opens a
restart confirmation, M toggles sound. Pointer controls support simultaneous
movement and fire, with per-pointer cancellation and focus-loss cleanup.

The first mission has eight floors and four files. Each completed mission adds
one floor, up to twenty. One required red document door is added every other
mission, up to ten files. Mission 2 is 9 floors / 4 files; mission 3 is 10 / 5;
mission 12 is 19 / 9; mission 13 reaches 20 / 10.

Documents are spread throughout the tower, including a file on the floor just
above the getaway. The first document stays beside the starting position.
After the cap, four repeating route arrangements shift document floors and
sides, mirror guard posts and alternate patrolling guards with sentries. Floors,
file quotas and enemy speed/fire/reinforcement limits stay bounded even on very
high missions. All files remain collectible through the same controls.

Taller buildings also get more time before the security alert and a larger
escape-time bonus budget: the alarm starts at 150 seconds on eight floors and
270 seconds on twenty, while the time bonus starts at 1,800 and 2,400 points
respectively. This keeps extra traversal from automatically consuming the
original eight-floor allowance. Health, life caps, checkpoint behavior, controls,
and the existing best-score/sound storage keys are unchanged.
Every successful escape grants one life and one health, within caps. Guards
telegraph their shots; crouching and jumping evade them. Jump-shoot a ceiling
lamp for a falling-lamp takedown and nearby stun. Medkits restore health once.
Quick takedowns chain up to ×5. Files become respawn checkpoints. Each life has
three health; three lives start a run. Ammo is unlimited. After the security alert,
patrolling guards move faster. Files score 500, guards 100 times the chain, lamps 250
times the chain; escape adds a time/health bonus. Scores and sound preference
are browser-local; active missions do not persist across reloads.

## Structure

- `engine.js`: deterministic fixed-step rules, CommonJS/browser-compatible.
- `render.js`: original pixel art, camera, parallax skyline, effects.
- `audio.js`: synthesized effects and original bass sequence, gesture-unlocked.
- `app.js`: keyboard/pointer input, menus, storage, HUD and animation loop.
- `styles.css`: cabinet, desktop manual, portrait and short-landscape layouts.

The animation loop advances rules at 60 Hz and caps catch-up after a stall.
Pause freezes simulation. Blur and hidden-document events pause automatically.
Storage/audio failures do not prevent play. Reduced-motion mode removes shake,
sparks and camera easing. A read-only `Elevator86App.snapshot()` supports audits;
there is no production mutation/cheat interface.

## Verification

```sh
node scripts/bake-home.mjs
node scripts/stamp-assets.mjs
PORT=8237 npm test
PORT=8137 node scripts/dev-server.mjs
node scripts/home-audit.mjs http://localhost:8137
node scripts/elevator-audit.mjs http://localhost:8137 /tmp/elevator-progression-qa
```

Open `/tests/elevator-browser.html` on the local dev server and choose **Run
browser integration tests**. This harness is excluded from deployment. It
uses the real app, keyboard/pointer events and explicit isolated fixtures for
win/loss boundary states. The fixture capture wraps `start` only in the test
iframe. It tests movement, collection, jumping, lift rides, ducking, combat,
pause/resume, repeat/cancel restart, victory/next mission, death/retry, storage,
blur, simultaneous pointers, release/cancellation and layout at 320×700,
390×844, 768×1024 and 844×390. Touch is emulated; this is not real-device testing.

`scripts/elevator-audit.mjs` runs that harness, then a separate ordinary-input
mission and clearly isolated local fixtures for mission 2→3, the 20-floor cap,
lower checkpoints, camera traversal, capped route changes and mission 1,000,000.
It also checks keyboard and emulated touch, saves screenshots and results, and
supports a fixture-free `--live` smoke test against the public site. The test
iframe stays onscreen as results grow so Chromium does not throttle its frames.

A separate normal browser playthrough, with no fixtures, collected all four
files and escaped mission 1 with 4,765 points. On-screen controls were also
used to collect a file and ride to the next floor at a 320×700 viewport.

## Release and rollback

The existing `.github/workflows/deploy.yml` publishes to S3 `branyontech.com`
and invalidates CloudFront distribution `E1MBTRO86GIH7E`. Only static-file
includes and the `elevator/**` trigger were added; credentials, IAM, network,
headers and deployment permissions are unchanged. CI runs the pure rules and
asset wiring tests. The existing server suite restarts its own test server
before the added route tests to stay within the unchanged rate-limit budget.

Before release, `rollback/pre-elevator-20261026` records the exact prior main
commit. To restore the old site, revert the release commit on main and let the
same workflow run. Main and S3 sync do not delete unrelated files. A revert
removes new discovery links but leaves the unlinked `/elevator/` S3 objects;
removing those objects is a separate operation if ever desired. Do not reset
main or change AWS policy to roll back.

For the October 27 progression update, the newer rollback branch is
`rollback/pre-elevator-progression-20261027`, pointing to
`e3f8cbfe622355d84153b8f319c97eecc3cab5af`. This includes Starfall, Ironwing and
the Games/Music navigation split. Revert only the progression release to undo
this update; the older pre-Elevator reference predates those games.
