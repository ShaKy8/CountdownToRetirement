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

The first mission has eight floors and four files. Later missions add floors
(up to twelve), more guards, faster shots and shorter guard reaction times.
Every successful escape grants one life and one health, within caps. Guards
telegraph their shots; crouching and jumping evade them. Jump-shoot a ceiling
lamp for a falling-lamp takedown and nearby stun. Medkits restore health once.
Quick takedowns chain up to ×5. Files become respawn checkpoints. Each life has
three health; three lives start a run. Ammo is unlimited. After 150 seconds,
guards patrol faster. Files score 500, guards 100 times the chain, lamps 250
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
```

Open `/tests/elevator-browser.html` on the local dev server and choose **Run
browser integration tests**. This harness is excluded from deployment. It
uses the real app, keyboard/pointer events and explicit isolated fixtures for
win/loss boundary states. The fixture capture wraps `start` only in the test
iframe. It tests movement, collection, jumping, lift rides, ducking, combat,
pause/resume, repeat/cancel restart, victory/next mission, death/retry, storage,
blur, simultaneous pointers, release/cancellation and layout at 320×700,
390×844, 768×1024 and 844×390. Touch is emulated; this is not real-device testing.

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
