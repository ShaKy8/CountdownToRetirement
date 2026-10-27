/* Elevator '86 — original deterministic arcade rules. No DOM or assets. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Elevator86 = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const W = 768, GAP = 112, TOP = 170, STEP = 1 / 60;
  const MAX_FLOORS = 20, MAX_FILES = 10;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const floorY = f => TOP + f * GAP;
  function random(seed) { let n = seed >>> 0; return () => { n += 0x6D2B79F5; let t = n; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // Growth is independent of door placement: 8/4, 9/4, 10/5 ... 20/10.
  // Ten files keep capped missions bounded. Routes then rotate through four
  // arrangements, with the first and penultimate floors always represented.
  function missionPlan(level) {
    const mission = clamp(Math.floor(Number(level) || 1), 1, Number.MAX_SAFE_INTEGER);
    const floors = Math.min(MAX_FLOORS, 7 + mission);
    const files = Math.min(MAX_FILES, 4 + Math.floor((mission - 1) / 2));
    const variant = mission < 13 ? 0 : (mission - 13) % 4;
    const documents = Array.from({ length: files }, (_, i) => {
      let floor = Math.round(i * (floors - 2) / (files - 1));
      if (variant && i > 0 && i < files - 1 && (i + variant) % 3 === 0) floor++;
      const side = variant === 3 ? Math.floor(i / 2) % 2 : (i + variant) % 2;
      return { x: i === 0 || side === 0 ? 98 : 664, floor };
    });
    return { floors, files, documents, variant,
      alarmAt: 150 + (floors - 8) * 10,
      escapeBudget: 1800 + (floors - 8) * 50 };
  }
  function createGame(seed = 1986) {
    const s = { seed, rng: random(seed), mode: 'ready', level: 1, score: 0, lives: 3, health: 3, elapsed: 0, kills: 0, totalDocs: 0, chain: 0, chainTime: 0, events: [], bullets: [], particles: [], texts: [], shake: 0 };
    build(s); return s;
  }
  function build(s) {
    const plan = missionPlan(s.level);
    s.floors = plan.floors; s.variant = plan.variant;
    s.alarmAt = plan.alarmAt; s.escapeBudget = plan.escapeBudget;
    s.worldH = floorY(s.floors - 1) + 60;
    s.time = 0; s.spawnClock = 12; s.bullets = []; s.particles = []; s.texts = []; s.docs = plan.documents.map(d => ({ ...d, taken: false, progress: 0 })); s.enemies = []; s.lights = []; s.supplies = [];
    s.player = { x: 115, y: floorY(0), floor: 0, vy: 0, dir: 1, grounded: true, crouch: false, riding: null, invul: 2, fire: 0, hack: 0, walk: 0 };
    s.checkpoint = { x: 115, floor: 0 }; s.respawn = 0;
    s.lifts = [246, 514].map((x, i) => ({ x, y: floorY(i ? 3 : 0), floor: i ? 3 : 0, target: i ? 3 : 0, moving: false, dwell: 0, occupied: false }));
    for (let f = 0; f < s.floors; f++) {
      if (f === 3 || f === s.floors - 2) s.supplies.push({ x: 370, floor: f, taken: false });
      s.lights.push({ x: f % 2 ? 610 : 366, y: floorY(f) - 69, floor: f, falling: false, broken: false, vy: 0 });
      const post = f % 2 ? 650 : 400;
      if (f > 0) addEnemy(s, f, s.variant % 2 ? W - post : post);
      if (f > 2 && s.level > 1) addEnemy(s, f, s.variant % 2 ? W - 115 : 115);
    }
    s.events.push({ type: 'level', level: s.level });
  }
  function start(s) { s.mode = 'playing'; }
  function next(s) { if (s.mode !== 'escaped') return; s.level++; s.health = Math.min(3, s.health + 1); s.lives = Math.min(5, s.lives + 1); s.chain = 0; build(s); s.mode = 'playing'; }
  function addEnemy(s, floor, x) {
    // Capped missions alternate patrol routes and stationary sentry posts.
    // Shot speed, reaction time and reinforcement count retain their ceilings.
    const sentry = s.variant >= 2 && floor % (s.variant === 2 ? 2 : 3) === 0;
    const speed = 24 + Math.min(s.level * 4, 24) + s.rng() * 12;
    s.enemies.push({ x, y: floorY(floor), floor, sentry,
      dir: (x > 384 ? -1 : 1) * (s.variant === 1 ? -1 : 1), speed: sentry ? 0 : speed, cool: 1.4 + s.rng() * 1.8, aim: 0, alive: true, stun: 0, walk: 0, elite: s.level > 2 && s.rng() > .65 });
  }
  function say(s, x, y, text, color = '#f5ce72') { s.texts.push({ x, y, text, color, life: 1.2 }); }
  function burst(s, x, y, color, count = 10) { for (let i = 0; i < count; i++) s.particles.push({ x, y, vx: (s.rng() - .5) * 140, vy: -s.rng() * 130, life: .25 + s.rng() * .5, color }); }
  function score(s, n, x, y) { s.score += n; say(s, x, y, '+' + n); }
  function kill(s, e, trick = false) {
    if (!e.alive) return; e.alive = false; s.kills++; s.chain = s.chainTime > 0 ? Math.min(5, s.chain + 1) : 1; s.chainTime = 4;
    const n = (trick ? 250 : 100) * s.chain; score(s, n, e.x, e.y - 42); burst(s, e.x, e.y - 20, '#fa8a78'); s.events.push({ type: 'kill', chain: s.chain });
  }
  function damage(s) {
    const p = s.player; if (p.invul > 0 || s.respawn > 0 || s.mode !== 'playing') return;
    s.health--; p.invul = 1.6; s.shake = .22; s.chain = 0; burst(s, p.x, p.y - 20, '#70efdc'); s.events.push({ type: 'hurt' });
    if (s.health <= 0) {
      s.lives--; s.bullets = [];
      if (s.lives <= 0) { s.mode = 'gameover'; s.events.push({ type: 'gameover' }); }
      else { s.respawn = 1.5; say(s, p.x, p.y - 45, 'AGENT DOWN', '#fa8a78'); }
    }
  }
  function shot(s, x, y, dir, hostile, elite = false) {
    s.bullets.push({ x, y, vx: dir * (hostile ? 200 + Math.min(65, s.level * 10) : 560), hostile, life: 1.8, elite });
    if (!hostile) burst(s, x + dir * 5, y, '#ffdc8b', 3);
    s.events.push({ type: hostile ? 'enemyShot' : 'shot' });
  }
  function update(s, input = {}, dt = STEP) {
    if (s.mode !== 'playing') return;
    dt = clamp(dt, 0, .05); s.time += dt; s.elapsed += dt; s.shake = Math.max(0, s.shake - dt); s.chainTime -= dt;
    const p = s.player; p.invul = Math.max(0, p.invul - dt); p.fire = Math.max(0, p.fire - dt);
    if (s.respawn > 0) {
      s.respawn -= dt;
      if (s.respawn <= 0) { Object.assign(p, { x: s.checkpoint.x, floor: s.checkpoint.floor, y: floorY(s.checkpoint.floor), vy: 0, riding: null, grounded: true, invul: 3 }); s.health = 3; s.enemies.forEach(e => { if (e.floor === p.floor && Math.abs(e.x - p.x) < 120) e.x = p.x < 384 ? 650 : 115; }); }
    } else {
      const nearDoc = s.docs.find(d => !d.taken && d.floor === p.floor && Math.abs(d.x - p.x) < 27 && p.grounded);
      const liftIndex = s.lifts.findIndex(l => Math.abs(l.x - p.x) < 30);
      const lift = s.lifts[liftIndex];
      const direction = input.down ? 1 : input.up ? -1 : 0;
      // A call always comes to the agent first; holding the direction then rides it.
      if (p.grounded && lift && direction && !nearDoc && !lift.moving && lift.dwell <= 0) {
        if (lift.floor !== p.floor) { lift.target = p.floor; lift.moving = true; s.events.push({ type: 'call' }); }
        else { const target = clamp(p.floor + direction, 0, s.floors - 1); if (target !== p.floor) { p.riding = liftIndex; lift.target = target; lift.moving = true; s.events.push({ type: 'lift' }); } }
      }
      if (input.usePressed && !nearDoc && !direction && p.grounded) {
        const closest = s.lifts.reduce((a, b) => Math.abs(a.x - p.x) < Math.abs(b.x - p.x) ? a : b);
        if (Math.abs(closest.x - p.x) < 95 && !closest.moving && closest.floor !== p.floor) { closest.target = p.floor; closest.moving = true; s.events.push({ type: 'call' }); }
      }
      p.crouch = !!(input.down && p.grounded && p.riding === null && !lift);
      if (p.riding === null) {
        const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        if (dx) { p.dir = dx; p.x = clamp(p.x + dx * (p.crouch ? 65 : 158) * dt, 30, W - 30); p.walk += dt * (p.crouch ? 5 : 12); }
        else p.walk = 0;
        if (input.jumpPressed && p.grounded) { p.vy = -330; p.grounded = false; p.crouch = false; s.events.push({ type: 'jump' }); }
        if (!p.grounded) { p.vy += 960 * dt; p.y += p.vy * dt; if (p.y >= floorY(p.floor)) { p.y = floorY(p.floor); p.vy = 0; p.grounded = true; } }
      }
      if (input.fire && p.fire <= 0) { p.fire = .23; shot(s, p.x + p.dir * 19, p.y - (p.crouch ? 11 : 24), p.dir, false); }
      for (const d of s.docs) {
        if (d === nearDoc && (input.up || input.use)) {
          d.progress += dt;
          if (d.progress >= .55) { d.taken = true; s.totalDocs++; score(s, 500, d.x, floorY(d.floor) - 80); s.checkpoint = { x: d.x, floor: d.floor }; p.invul = Math.max(p.invul, .7); s.events.push({ type: 'document' }); burst(s, d.x, floorY(d.floor) - 32, '#f5ce72', 18); }
        } else if (!d.taken) d.progress = Math.max(0, d.progress - dt * 2);
      }
      for (const item of s.supplies) if (!item.taken && item.floor === p.floor && Math.abs(item.x - p.x) < 23) { item.taken = true; s.health = Math.min(3, s.health + 1); score(s, 100, item.x, p.y - 50); say(s, item.x, p.y - 70, 'MEDKIT', '#70efdc'); s.events.push({ type: 'heal' }); }
      if (p.floor === s.floors - 1 && p.x > 650 && p.grounded && s.docs.every(d => d.taken)) {
        s.bonus = Math.max(0, s.escapeBudget - Math.floor(s.time) * 5) + s.health * 200; s.score += s.bonus; s.mode = 'escaped'; s.events.push({ type: 'escaped' }); return;
      }
    }
    for (let i = 0; i < s.lifts.length; i++) {
      const l = s.lifts[i]; l.dwell -= dt;
      if (!l.moving) continue;
      const targetY = floorY(l.target), delta = targetY - l.y, step = 130 * dt;
      l.y += Math.sign(delta) * Math.min(Math.abs(delta), step);
      if (p.riding === i) { p.x = l.x; p.y = l.y; p.crouch = false; }
      if (Math.abs(l.y - targetY) < .01) {
        l.floor = l.target; l.moving = false; l.dwell = .16;
        if (p.riding === i) { p.floor = l.floor; p.riding = null; p.grounded = true; }
        s.events.push({ type: 'ding' });
      }
    }
    for (const e of s.enemies) {
      if (!e.alive) continue; e.stun -= dt; e.cool -= dt;
      if (e.stun > 0) continue;
      const sees = p.floor === e.floor && p.riding === null && Math.abs(p.x - e.x) < 480 && s.respawn <= 0;
      if (e.aim > 0) {
        e.aim -= dt;
        if (e.aim <= 0) { shot(s, e.x + e.dir * 18, e.y - 24, e.dir, true, e.elite); e.cool = Math.max(.9, 2.3 - s.level * .13) + s.rng() * .7; }
      } else if (sees && e.cool <= 0) { e.dir = p.x > e.x ? 1 : -1; e.aim = e.elite ? .4 : .65; }
      else {
        e.x += e.dir * e.speed * (s.time > s.alarmAt ? 1.3 : 1) * dt; if (e.speed > 0) e.walk += dt * 7;
        if (e.x < 48 || e.x > 720) { e.x = clamp(e.x, 48, 720); e.dir *= -1; }
      }
      if (sees && Math.abs(e.x - p.x) < 19 && Math.abs(e.y - p.y) < 25) damage(s);
    }
    for (const b of s.bullets) {
      const oldX = b.x; b.x += b.vx * dt; b.life -= dt;
      const hitX = x => x >= Math.min(oldX, b.x) - 12 && x <= Math.max(oldX, b.x) + 12;
      if (b.hostile) { if (s.respawn <= 0 && hitX(p.x) && b.y > p.y - (p.crouch ? 17 : 37) && b.y < p.y - 2) { damage(s); b.life = 0; } }
      else {
        for (const e of s.enemies) if (e.alive && hitX(e.x) && b.y > e.y - 38 && b.y < e.y) { kill(s, e); b.life = 0; break; }
        if (b.life > 0) for (const l of s.lights) if (!l.falling && !l.broken && hitX(l.x) && Math.abs(b.y - l.y) < 10) { l.falling = true; b.life = 0; s.events.push({ type: 'glass' }); break; }
      }
    }
    for (const l of s.lights) if (l.falling && !l.broken) {
      l.vy += 520 * dt; l.y += l.vy * dt;
      for (const e of s.enemies) if (e.alive && e.floor === l.floor && Math.abs(e.x - l.x) < 40 && l.y > e.y - 38) kill(s, e, true);
      if (l.y > floorY(l.floor) - 8) { l.broken = true; burst(s, l.x, l.y, '#d2e6af', 15); s.enemies.filter(e => e.floor === l.floor && Math.abs(e.x - l.x) < 180).forEach(e => { e.stun = 2.5; e.aim = 0; }); }
    }
    s.spawnClock -= dt;
    if (s.spawnClock <= 0) {
      s.spawnClock = Math.max(8, 19 - s.level);
      const f = clamp(p.floor + (s.rng() < .5 ? -1 : 1), 1, s.floors - 1);
      if (s.enemies.filter(e => e.alive && e.floor === f).length < 3) addEnemy(s, f, p.x < 384 ? 700 : 60);
    }
    s.bullets = s.bullets.filter(b => b.life > 0 && b.x > 10 && b.x < W - 10);
    s.enemies = s.enemies.filter(e => e.alive);
    for (const a of s.particles) { a.x += a.vx * dt; a.y += a.vy * dt; a.vy += 260 * dt; a.life -= dt; }
    s.particles = s.particles.filter(a => a.life > 0);
    for (const t of s.texts) { t.y -= 22 * dt; t.life -= dt; } s.texts = s.texts.filter(t => t.life > 0);
  }
  return { W, GAP, TOP, STEP, MAX_FLOORS, MAX_FILES, missionPlan, floorY, clamp, random, createGame, start, next, update };
});
