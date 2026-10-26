# Starfall · Asteroids

Original vector arcade game at **https://branyontech.com/asteroids/**. All
artwork is canvas geometry, all sound is synthesized, and the game has no
external dependencies or downloaded assets. It follows the classic rotating,
thrusting, screen-wrapping asteroid-splitting loop with original presentation.

## Rules and controls

Arrows or WASD rotate/thrust/brake. Space or J fires continuously while held.
P/Escape pauses; M mutes; R opens a restart confirmation. Touch buttons accept
simultaneous rotation, thrust and fire, with pointer capture and individual
release/cancellation. Release thrust to coast. Blur, hidden tabs and orientation
changes pause the game and clear held inputs.

Three ships start each flight. Large rocks split into two medium rocks; each
medium splits into two small rocks. Large/medium/small hits award 20/50/100.
Clearing the field starts another wave after 2.2 seconds. The first wave has
three large rocks; each new wave adds one, capped at eleven. Speed increases
through wave fifteen. Each 10,000 points adds a ship, capped at five. Respawn
chooses the safest point from a grid and gives three seconds of shielding;
new waves provide at least 2.2 seconds of protection. Shots and asteroids wrap,
with swept projectile collision detection at seams.

Scores and mute preference are local to the browser. Storage and audio failures
are caught independently and never prevent play. A blocked store retains the
best score for the current visit. No analytics or account is required.

## Structure

- `asteroids/engine.js`: seeded deterministic rules, fixed 60 Hz physics.
- `asteroids/render.js`: original vector art, bounded particles, reduced-motion
  handling, wraparound copies and impact feedback.
- `asteroids/audio.js`: gesture-unlocked synthesis; nothing plays on page load.
- `asteroids/app.js`: real-time loop, input, menus, HUD and resilient persistence.
- `StarfallApp.snapshot()` returns read-only copies for audits. There is no
  production state mutation or cheat interface.

The homepage now contains six sections and twelve links: Retirement, Weather,
Games (Asteroids, Elevator ’86, ONE PUTT, SLINGSHOT), Music (Postcards in Sound,
guitar theory), Property and Reach me. The 404 page mirrors Games/Music. Existing
URLs remain unchanged. Six cards fill two rows on desktop; short viewports use
labelled rows. Compact arcade link names preserve the one-screen phone layout.

## Verification

```sh
node scripts/bake-home.mjs
node scripts/stamp-assets.mjs
PORT=8237 npm test
node --test tests/*.test.cjs
python3 tests/site-404.test.py
PORT=8137 node scripts/dev-server.mjs
node scripts/home-audit.mjs http://localhost:8137
node scripts/asteroids-audit.mjs http://localhost:8137 /tmp/starfall-qa
node scripts/oneputt-fx-audit.mjs http://localhost:8137
node scripts/slingshot-fx-audit.mjs http://localhost:8137
```

The Starfall browser audit drives real Chromium keyboard/mouse/multitouch
input. Its wave-clear playthrough uses only a fixed pattern of held controls:
no target tracking, fixtures, changed seed, invulnerability or accelerated
clock. Separate, explicitly identified fixtures guarantee splitting and final
collision boundary checks. Screenshots cover desktop, 320×700, 360×640,
390×844, 768×1024 and 844×390. The audit checks menu containment, visible
controls, pause/resume, key repeat, restart/cancel, persistence, pointer
cancellation, orientation change and unavailable storage/audio. These are
browser emulations, not physical phone tests. Synthesized effects can be
verified through Web Audio behavior; speaker/listening quality is not covered
by headless automation.

For the existing Elevator integration harness, keep its iframe visible while
running `/tests/elevator-browser.html`: appending results can otherwise push
it offscreen and throttle its animation, invalidating short timed holds.

## Deployment and rollback

Pushes to main use the existing GitHub Actions workflow to S3 `branyontech.com`
and CloudFront `E1MBTRO86GIH7E`. This release adds the `asteroids/**` path trigger
and seven explicit static file includes. Existing credentials, permissions,
security headers, infrastructure and other game files are unchanged. The test
workflow includes the new pure-engine/deployment checks.

`rollback/pre-starfall-20261026` preserves the prior main commit
`78d0798acdee224590ba5b3cb468e1cc71ae9c7b`. Revert the Starfall release commit on
main and push to run the same deployment. Do not reset main. The existing
non-deleting static sync removes discovery links after the revert while leaving
unlinked `/asteroids/` objects in S3; removing those objects would be a separate
explicit cleanup, not part of rollback.
