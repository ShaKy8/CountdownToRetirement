/* STARFALL — original toroidal arcade physics. No DOM, assets or dependencies. */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2, RADII = [14, 26, 44], POINTS = [100, 50, 20];
  const wrap = (n, max) => ((n % max) + max) % max;
  const delta = (a, b, size) => wrap(a - b + size / 2, size) - size / 2;
  function distance(a, b, s) { return Math.hypot(delta(a.x, b.x, s.width), delta(a.y, b.y, s.height)); }
  function random(s) { let t = s.seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function rock(s, x, y, size, angle) {
    const speed = (35 + Math.min(s.wave, 15) * 6 + random(s) * 17) * (1 + (2 - size) * 0.32);
    return { id: s.nextId++, x, y, size, radius: RADII[size], vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      angle: random(s) * TAU, spin: (random(s) - 0.5) * 1.1, shape: Array.from({ length: 11 }, () => 0.76 + random(s) * 0.24) };
  }
  function spawnShip(s) {
    // Prefer the centre, then the safest point on a 5×5 grid; toroidal distances
    // include rocks across the seam. A visible three-second shield buys a launch.
    let best = { x: s.width / 2, y: s.height / 2 }, clearance = -1;
    const candidates = [best];
    for (let x = 1; x <= 5; x++) for (let y = 1; y <= 5; y++) candidates.push({ x: s.width * x / 6, y: s.height * y / 6 });
    for (const p of candidates) {
      const d = Math.min(...s.rocks.map(r => distance(p, r, s) - r.radius), 10000);
      if (d > clearance) { best = p; clearance = d; }
    }
    s.ship = { ...best, vx: 0, vy: 0, angle: -Math.PI / 2, radius: 10, shield: 3, alive: true, thrusting: false };
    s.cooldown = 0;
  }
  function wave(s) {
    s.wave++; s.rocks = []; s.bullets = []; s.waveDelay = 0; s.banner = 2.2;
    for (let i = 0; i < Math.min(3 + s.wave - 1, 11); i++) {
      const angle = random(s) * TAU;
      const x = wrap(s.ship.x + Math.cos(angle) * s.width * 0.43, s.width);
      const y = wrap(s.ship.y + Math.sin(angle) * s.height * 0.43, s.height);
      s.rocks.push(rock(s, x, y, 2, angle + Math.PI + (random(s) - 0.5)));
    }
    s.ship.shield = Math.max(s.ship.shield, 2.2);
    s.events.push({ type: 'wave', wave: s.wave });
  }
  function create(seed = Date.now(), width = 960, height = 640) {
    const s = { seed: seed >>> 0, width, height, time: 0, wave: 0, score: 0, lives: 3, nextLife: 10000,
      nextId: 1, rocks: [], bullets: [], events: [], phase: 'playing', waveDelay: 0, respawn: 0, cooldown: 0, kills: 0, shots: 0, deaths: 0 };
    spawnShip(s); wave(s); return s;
  }
  function hit(s, r) {
    s.score += POINTS[r.size]; s.kills++;
    s.events.push({ type: 'hit', x: r.x, y: r.y, size: r.size, points: POINTS[r.size] });
    if (r.size > 0) {
      const heading = Math.atan2(r.vy, r.vx);
      for (const side of [-1, 1]) {
        const child = rock(s, r.x, r.y, r.size - 1, heading + side * (0.65 + random(s) * 0.45));
        child.x = wrap(child.x + Math.cos(heading + side * Math.PI / 2) * child.radius * 0.5, s.width);
        child.y = wrap(child.y + Math.sin(heading + side * Math.PI / 2) * child.radius * 0.5, s.height);
        s.rocks.push(child);
      }
    }
    while (s.score >= s.nextLife) {
      s.nextLife += 10000;
      if (s.lives < 5) { s.lives++; s.events.push({ type: 'life' }); }
    }
  }
  // Swept bullet segment, measured against the nearest image of the asteroid.
  function strikes(b, r, dx, dy, s) {
    const rx = delta(r.x, b.x, s.width), ry = delta(r.y, b.y, s.height);
    const t = Math.max(0, Math.min(1, (rx * dx + ry * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(rx - t * dx, ry - t * dy) < r.radius + 2;
  }
  function step(s, input = {}, dt = 1 / 60) {
    s.events = [];
    if (s.phase !== 'playing') return;
    dt = Math.min(Math.max(Number(dt) || 0, 0), 1 / 30);
    s.time += dt; s.banner = Math.max(0, s.banner - dt);
    const p = s.ship;
    if (p.alive) {
      p.shield = Math.max(0, p.shield - dt);
      p.angle += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 4.1 * dt;
      p.thrusting = !!input.thrust;
      if (input.thrust) { p.vx += Math.cos(p.angle) * 245 * dt; p.vy += Math.sin(p.angle) * 245 * dt; }
      const damping = Math.exp(-(input.brake ? 3.2 : 0.13) * dt);
      p.vx *= damping; p.vy *= damping;
      const speed = Math.hypot(p.vx, p.vy), cap = 330;
      if (speed > cap) { p.vx *= cap / speed; p.vy *= cap / speed; }
      p.x = wrap(p.x + p.vx * dt, s.width); p.y = wrap(p.y + p.vy * dt, s.height);
      s.cooldown = Math.max(0, s.cooldown - dt);
      if (input.fire && s.cooldown <= 0) {
        const c = Math.cos(p.angle), n = Math.sin(p.angle);
        s.bullets.push({ x: wrap(p.x + c * 17, s.width), y: wrap(p.y + n * 17, s.height), vx: c * 590 + p.vx, vy: n * 590 + p.vy, life: 1.25 });
        s.cooldown = 0.16; s.shots++; s.events.push({ type: 'shot' });
      }
    } else if (s.lives > 0) {
      s.respawn -= dt;
      if (s.respawn <= 0) { spawnShip(s); s.events.push({ type: 'respawn' }); }
    }
    for (const r of s.rocks) { r.x = wrap(r.x + r.vx * dt, s.width); r.y = wrap(r.y + r.vy * dt, s.height); r.angle += r.spin * dt; }
    for (const b of s.bullets) {
      b.life -= dt;
      if (b.life <= 0) continue;
      const dx = b.vx * dt, dy = b.vy * dt;
      const index = s.rocks.findIndex(r => strikes(b, r, dx, dy, s));
      if (index >= 0) { const [r] = s.rocks.splice(index, 1); b.life = 0; hit(s, r); }
      b.x = wrap(b.x + dx, s.width); b.y = wrap(b.y + dy, s.height);
    }
    s.bullets = s.bullets.filter(b => b.life > 0);
    if (p.alive && p.shield <= 0 && s.rocks.some(r => distance(p, r, s) < p.radius + r.radius * 0.86)) {
      p.alive = false; p.thrusting = false; s.lives--; s.deaths++; s.respawn = 1.1;
      s.events.push({ type: 'death', x: p.x, y: p.y });
      if (s.lives === 0) { s.phase = 'over'; s.events.push({ type: 'over' }); }
    }
    if (!s.rocks.length && s.phase === 'playing') {
      if (!s.waveDelay) { s.waveDelay = 2.2; s.events.push({ type: 'clear', wave: s.wave }); }
      else { s.waveDelay -= dt; if (s.waveDelay <= 0 && s.ship.alive) wave(s); }
    }
  }
  const api = { create, step, distance, wrap, RADII, POINTS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Starfall = api;
})(typeof window !== 'undefined' ? window : null);
