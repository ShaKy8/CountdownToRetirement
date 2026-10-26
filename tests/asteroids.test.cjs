'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const E = require('../asteroids/engine.js'), root = path.resolve(__dirname, '..');
function target(s, size = 2, x = 500, y = 250) { return { id: s.nextId++, x, y, size, radius: E.RADII[size], vx: 0, vy: 0, angle: 0, spin: 0, shape: Array(11).fill(1) }; }
function shootAt(s, rock) { s.bullets.push({ x: rock.x - 50, y: rock.y, vx: 600, vy: 0, life: 1 }); for (let i = 0; i < 8; i++) E.step(s); }
test('seeded runs are repeatable; dimensions and initial spawn are safe', () => {
  const a = E.create(15), b = E.create(15); assert.deepEqual(a, b);
  assert.equal(a.lives, 3); assert.equal(a.rocks.length, 3);
  for (const r of a.rocks) assert.ok(E.distance(a.ship, r, a) > r.radius + 170);
  for (let t = 0; t < 600; t++) { const input = { fire: true, right: t % 50 < 25, thrust: t % 80 < 40 }; E.step(a, input); E.step(b, input); }
  assert.deepEqual(a, b);
});
test('rotation, inertia, speed cap, brake and wraparound are real physics', () => {
  const s = E.create(3); s.rocks = [target(s, 2, 0, 0)]; s.ship.shield = 100;
  const angle = s.ship.angle; E.step(s, { right: true }); assert.ok(s.ship.angle > angle);
  for (let i = 0; i < 180; i++) E.step(s, { thrust: true });
  let speed = Math.hypot(s.ship.vx, s.ship.vy); assert.ok(speed > 320 && speed <= 330.001);
  E.step(s); assert.ok(Math.hypot(s.ship.vx, s.ship.vy) > 300, 'coasts after releasing thrust');
  for (let i = 0; i < 60; i++) E.step(s, { brake: true }); assert.ok(Math.hypot(s.ship.vx, s.ship.vy) < 15);
  Object.assign(s.ship, { x: 959, vx: 200, vy: 0 }); E.step(s); assert.ok(s.ship.x < 5);
});
test('one rock splits into two, then two small rocks, with size-based scores', () => {
  const s = E.create(1); s.ship.shield = 100; s.rocks = [target(s)]; shootAt(s, s.rocks[0]);
  assert.equal(s.score, 20); assert.equal(s.rocks.length, 2); assert.ok(s.rocks.every(r => r.size === 1));
  s.rocks = [target(s, 1)]; shootAt(s, s.rocks[0]); assert.equal(s.score, 70); assert.ok(s.rocks.every(r => r.size === 0));
  s.rocks = [target(s, 0)]; shootAt(s, s.rocks[0]); assert.equal(s.score, 170); assert.equal(s.rocks.length, 0);
});
test('swept bullets hit small rocks and wrap across the seam', () => {
  const s = E.create(1); s.ship.shield = 100; s.rocks = [target(s, 0, 2, 100)];
  s.bullets = [{ x: 950, y: 100, vx: 1500, vy: 0, life: 1 }]; E.step(s); assert.equal(s.rocks.length, 0); assert.equal(s.score, 100);
});
test('held fire is rate limited, bullets expire, opposite turn inputs cancel', () => {
  const s = E.create(2); s.ship.shield = 100; s.rocks = [target(s, 0, 1, 1)]; const a = s.ship.angle;
  for (let i = 0; i < 120; i++) E.step(s, { fire: true, left: true, right: true });
  assert.equal(s.ship.angle, a); assert.ok(s.shots >= 10 && s.shots <= 13); assert.ok(s.bullets.length <= 9);
  for (let i = 0; i < 100; i++) E.step(s); assert.equal(s.bullets.length, 0);
});
test('collisions take one life, wait to respawn and restore a protective shield', () => {
  const s = E.create(1); s.ship.shield = 0; s.rocks = [target(s, 2, s.ship.x, s.ship.y)]; E.step(s);
  assert.equal(s.lives, 2); assert.equal(s.ship.alive, false); assert.equal(s.events.filter(e => e.type === 'death').length, 1);
  for (let i = 0; i < 20; i++) E.step(s); assert.equal(s.lives, 2); assert.equal(s.ship.alive, false);
  for (let i = 0; i < 60; i++) E.step(s); assert.equal(s.ship.alive, true); assert.ok(s.ship.shield > 2);
  s.rocks = [target(s, 2, s.ship.x, s.ship.y)]; E.step(s); assert.equal(s.lives, 2);
});
test('toroidal collision sees rocks across the edge and game over is terminal', () => {
  const s = E.create(1); Object.assign(s.ship, { x: 1, y: 100, shield: 0 }); s.lives = 1; s.rocks = [target(s, 0, 959, 100)]; E.step(s);
  assert.equal(s.phase, 'over'); assert.equal(s.lives, 0); const time = s.time;
  for (let i = 0; i < 300; i++) E.step(s, { fire: true, thrust: true }); assert.equal(s.time, time);
  const fresh = E.create(2); assert.equal(fresh.score, 0); assert.equal(fresh.lives, 3); assert.equal(fresh.wave, 1);
});
test('wave transition gives breathing room, grows density and grants protection', () => {
  const s = E.create(4); s.rocks = []; E.step(s); assert.equal(s.wave, 1); assert.equal(s.events[0].type, 'clear');
  for (let i = 0; i < 120; i++) E.step(s); assert.equal(s.wave, 1);
  for (let i = 0; i < 20; i++) E.step(s); assert.equal(s.wave, 2); assert.equal(s.rocks.length, 4); assert.ok(s.ship.shield > 1.9);
});
test('extra ship crosses each 10,000-point threshold only once and caps at five', () => {
  const s = E.create(5); s.ship.shield = 100; s.score = 9990; s.rocks = [target(s, 0)]; shootAt(s, s.rocks[0]);
  assert.equal(s.lives, 4); assert.equal(s.nextLife, 20000);
  s.score = 19990; s.rocks = [target(s, 0)]; shootAt(s, s.rocks[0]); assert.equal(s.lives, 5);
  s.score = 29990; s.rocks = [target(s, 0)]; shootAt(s, s.rocks[0]); assert.equal(s.lives, 5); assert.equal(s.nextLife, 40000);
});
test('normal fixed inputs can clear early waves without state manipulation', () => {
  let successes = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const s = E.create(seed);
    for (let t = 0; t < 10800 && s.phase === 'playing' && s.wave < 3; t++) E.step(s, { right: true, fire: true, thrust: t % 180 < 30 });
    if (s.wave >= 3) successes++;
  }
  assert.ok(successes >= 20, `first two waves should be approachable: ${successes}/30 cleared`);
});
test('long portrait and landscape runs stay finite and bounded', () => {
  for (const [w, h] of [[960, 640], [720, 900]]) {
    const s = E.create(8, w, h);
    for (let t = 0; t < 20000; t++) E.step(s, { right: t % 70 < 40, thrust: t % 110 < 45, fire: true });
    for (const o of [s.ship, ...s.rocks, ...s.bullets]) { assert.ok(Number.isFinite(o.x + o.y + o.vx + o.vy)); assert.ok(o.x >= 0 && o.x < w && o.y >= 0 && o.y < h); }
    assert.ok(s.bullets.length < 20); assert.ok(s.rocks.length <= 44);
  }
});
test('all production game files are deployed, discoverable and stamped', () => {
  const deploy = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
  for (const f of fs.readdirSync(path.join(root, 'asteroids'))) assert.ok(deploy.includes(`--include 'asteroids/${f}'`), f);
  assert.ok(deploy.includes("- 'asteroids/**'"));
  for (const file of ['index.html', '404.html', 'sitemap.xml']) assert.ok(fs.readFileSync(path.join(root, file), 'utf8').includes('/asteroids/'));
  assert.ok(fs.readFileSync(path.join(root, 'scripts/stamp-assets.mjs'), 'utf8').includes("'asteroids/index.html'"));
});
