# IRONWING: Carrier Operations

Original browser flight game at `/ironwing/`, added October 26, 2026. No third-party runtime, commercial game files, downloaded executables, textures or recordings. `engine.js` is a deterministic rules module; `render.js` is an original clipped perspective/painter renderer; audio is Web Audio synthesis. Local development uses the existing `node server.js` and `PORT` setting.

## Play

Five starts: landing school, carrier qualification (launch → three gates → recover), fleet defense (launch → three drones → recover), airborne combat practice (two drones → recover), and free flight. All are available immediately. Landing practice is a fresh sortie, never a shortcut that awards a combat completion. A frozen hangar and pause/debrief screens explain the controls.

Keyboard: arrows pitch/bank (down pulls up), A/D bank, Q/E fine rudder, W/S or +/− power, Enter catapult, G gear, F flaps, H hook, B airbrake, Space cannon, X missile, C chaff, T target, V cockpit/chase, P/Escape pause, M mute, R retry with confirmation. Mouse stick is explicitly enabled in the footer and operates by dragging the flight view. Touch uses the onscreen stick, simultaneous power/cannon buttons and system toggles. Release, cancellation, lost capture, focus loss and resize clear held controls; background/focus loss pauses the flight.

Carrier: approach from south, heading 360°, gear/flaps/hook down, 145–175 knots. The HUD flight-path marker, glide ball, carrier bearing/range and contextual radio teach alignment, energy and glide slope. Four separate wires span the deck. A touchdown outside safe speed, sink, heading or bank limits fails with a specific explanation. Missing the wires is a bolter, requiring a power-on go-around. Arrestment awards a recovery and grades the landing. Storage failure simply leaves the local log transient.

The model is intentionally accessible: simplified energy, angle of attack, stalls, coordinated turns and damped controls, with stability augmentation easing bank toward level. It is not a flight-training tool or a full simulation of JetFighter II. There is one fictional aircraft and one procedural coastal area, not the original aircraft roster, geography or campaign. Keyboard/mouse and emulated touch QA do not substitute for testing on a physical phone.

## References that informed the design

- Jim Hoover, *Computer Gaming World*, November 1991, pp. 96–97, firsthand review: https://archive.org/stream/Computer_Gaming_World_Issue_88/Computer_Gaming_World_Issue_88_djvu.txt . The review describes free flight and carrier practice, catapult acceleration, short mnemonic controls, graded recovery, a green HUD and coastal scenery. The design deliberately emphasizes the launch–mission–recovery loop rather than attempting its 125-mission campaign.
- Period screenshots: https://www.mobygames.com/game/5216/jetfighter-ii-advanced-tactical-fighter/screenshots/ and https://www.allvideoclassicgames.com/products/jetfighter-ii-1clk-windows-10-8-7-vista-xp-install . Visual reference only: flat polygon terrain, green instrument typography, cockpit status panels and a graduated sky. No source image or commercial asset is included.

## Validation

`npm test` includes the full existing suite and `tests/ironwing.test.cjs`. Server integration asserts every production file and the strict existing CSP. The rules tests cover actual default approaches and launches, flight inputs, stalls, go-arounds, bolters, unsafe touchdowns, wire geometry, combat lock/interception, cannon cadence, countermeasures and mission progression. Explicit mutation fixtures are labeled as such.

`node scripts/ironwing-audit.mjs http://localhost:8142 /tmp/ironwing-qa` exercises the rendered browser with normal input events and read-only snapshots: landing, launch, turning, combat, crash/retry, go-around, pause, mute, focus loss, resize, localStorage failure, touch cancellation, phone layouts and existing-page smoke checks. It captures screenshots and JSON evidence. No state setter, time acceleration or invulnerability exists in the app telemetry.

`node scripts/ironwing-circuit-audit.mjs http://localhost:8142 /tmp/ironwing-circuit` flies a continuous takeoff, circuit and recovery at real time. Its automated test pilot reads telemetry and moves the ordinary mouse stick/keyboard. This is actual game control evidence, not a hand-flown human session. Full sortie results and telemetry are exported separately from unit fixtures.

`node scripts/home-audit.mjs http://localhost:8142` covers homepage contrast, all thirteen links and responsive fit. The existing compact layout now also applies to phones up to 380px wide and 719px tall, preserving touch spacing while keeping the new link on one screen.

## Deployment and rollback

The existing GitHub Actions workflow bakes homepage counts, stamps content hashes, syncs the explicit static asset list to the same S3 bucket and invalidates CloudFront. Ironwing adds only its route and assets to those lists, and its tests to existing CI. No access, credential or security setting changes.

Pre-game rollback branch: `rollback/pre-ironwing-20261026` at `7884d506fb780cedcf6621e3126f16741f99e4a8`. To roll back the published feature while retaining history, revert the Ironwing feature commit on main and let the existing deployment run. The workflow does not delete old route files from S3, so a revert removes discovery links but direct `/ironwing/` files remain unless deliberately removed via the existing deployment process. Do not force-reset shared main.

### Recorded release validation

- Full suite: 617 client tests, 90 server integration tests, 52 combined game/Postcards checks, all passing. The Ironwing-specific rules/deployment suite contains 13 checks.
- Browser landing-school run: normal keyboard/rudder corrections, excellent wire-1 recovery at about 151 knots and 4.8 m/s sink.
- Continuous free-flight sortie: normal catapult launch, 197-second coastal circuit, excellent wire-2 arrested recovery with full health. The test pilot uses the actual mouse-stick and keyboard controls, reads telemetry, and runs at real time.
- Combat practice: both moving drones destroyed by normal lock and missile controls; recovery stage unlocked. Cannon repeat rate also checked.
- Normal nose-down crash/retry and power-on missed approach; pause, repeat keys, restart confirmation, focus loss, resize, mute persistence and denied localStorage all checked.
- Phone emulation: 320×700, 390×844, 768×1024 and 844×390, no horizontal overflow, controls at least 44×44. Simultaneous stick/power/cannon and independent pointer cancellation checked. Physical iOS/Android devices were not available for this release.
- Existing Elevator ’86 and Starfall start and respond to ordinary movement/thrust/fire. Their production source files remain byte-for-byte unchanged. Homepage contrast and layout audits pass with all thirteen links present.
