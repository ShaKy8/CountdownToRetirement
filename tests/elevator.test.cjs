const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const E = require('../elevator/engine.js');
const run = (s, input = {}, seconds = 1) => { for (let i = 0; i < Math.round(seconds * 60); i++) E.update(s, { ...input, jumpPressed: input.jumpPressed && i === 0 }); };
const game = (quiet = true) => { const s = E.createGame(86); E.start(s); if (quiet) { s.enemies = []; s.spawnClock = 1e6; } return s; };
const place = (s, x, floor = 0) => Object.assign(s.player, { x, floor, y: E.floorY(floor), vy: 0, grounded: true, riding: null, invul: 0 });
const guard = (x, floor = 0) => ({ x, y: E.floorY(floor), floor, dir: -1, speed: 0, cool: 99, aim: 0, alive: true, stun: 0, walk: 0 });

test('seeded missions are reproducible and have a reachable exit and distinct files', () => {
  const a = E.createGame(86), b = E.createGame(86); assert.deepEqual(a.enemies, b.enemies); assert.equal(a.floors, 8); assert.equal(a.docs.length, 4); assert.equal(a.lives, 3); assert.ok(a.docs.every(d => d.floor < a.floors - 1));
});
test('ready, escaped and gameover states freeze simulation', () => { for (const mode of ['ready', 'escaped', 'gameover']) { const s = game(); s.mode = mode; const before = JSON.stringify(s); run(s, { right: true, fire: true }); assert.equal(JSON.stringify(s), before); } });
test('walking is frame-rate independent at fixed simulation steps and clamped to walls', () => { const s = game(); run(s, { right: true }); assert.ok(Math.abs(s.player.x - 273) < .001); run(s, { left: true }, 20); assert.equal(s.player.x, 30); run(s, { right: true }, 20); assert.equal(s.player.x, 738); });
test('jump rises above head-height shots and returns to the same floor', () => { const s = game(); run(s, { jumpPressed: true }, .2); assert.ok(s.player.y < E.floorY(0) - 35); assert.equal(s.player.grounded, false); run(s, {}, 1); assert.equal(s.player.y, E.floorY(0)); assert.equal(s.player.grounded, true); });
test('ducking slows movement and a standing-height enemy shot passes over', () => { const s = game(); place(s, 150); s.bullets.push({ x: 100, y: E.floorY(0) - 24, vx: 210, hostile: true, life: 2 }); run(s, { down: true }, .5); assert.equal(s.health, 3); assert.equal(s.player.crouch, true); const x = s.player.x; run(s, { down: true, right: true }, .2); assert.ok(s.player.x - x < 15); });
test('standing takes a hit, invulnerability prevents burst deaths', () => { const s = game(); place(s, 150); for (let i = 0; i < 4; i++) s.bullets.push({ x: 120 - i, y: E.floorY(0) - 24, vx: 210, hostile: true, life: 2 }); run(s, {}, .4); assert.equal(s.health, 2); assert.ok(s.player.invul > 0); });
test('holding fire rate-limits shots; bullets kill and score', () => { const s = game(); s.enemies = [guard(240)]; run(s, { fire: true }, .6); assert.equal(s.kills, 1); assert.equal(s.score, 100); assert.ok(s.events.filter(e => e.type === 'shot').length <= 3); });
test('fast consecutive kills build a score chain and timeout resets it', () => { const s = game(); s.enemies = [guard(240), guard(340)]; run(s, { fire: true }, 1); assert.equal(s.kills, 2); assert.equal(s.score, 300); run(s, {}, 5); s.enemies = [guard(240)]; run(s, { fire: true }); assert.equal(s.chain, 1); assert.equal(s.score, 400); });
test('enemy telegraphs before firing and difficulty remains bounded', () => { const s = game(); place(s, 150); const e = guard(300); e.cool = 0; s.enemies = [e]; run(s, {}, .1); assert.ok(e.aim > 0); assert.equal(s.bullets.length, 0); run(s, {}, .6); assert.ok(s.bullets.some(b => b.hostile)); });
test('jump shots drop ceiling lights, killing underneath and stunning nearby guards', () => { const s = game(); const l = s.lights[0]; s.enemies = [guard(l.x), guard(l.x + 90)]; s.bullets = [{ x: l.x - 30, y: l.y, vx: 560, hostile: false, life: 2 }]; run(s, {}, .8); assert.equal(l.broken, true); assert.equal(s.kills, 1); assert.equal(s.score, 250); assert.ok(s.enemies[0].stun > 0); });
test('file requires a deliberate hold, can be cancelled, and scores only once', () => { const s = game(); run(s, { use: true }, .2); assert.equal(s.docs[0].taken, false); run(s, {}, .3); assert.equal(s.docs[0].progress, 0); run(s, { up: true }, .7); assert.equal(s.docs[0].taken, true); assert.equal(s.score, 500); run(s, { use: true }, 2); assert.equal(s.score, 500); assert.equal(s.checkpoint.floor, 0); });
test('a lift takes the player exactly one floor and can be ridden repeatedly', () => { const s = game(); place(s, 246); run(s, { down: true }, .1); assert.equal(s.player.riding, 0); run(s, {}, 1); assert.equal(s.player.floor, 1); assert.equal(s.player.y, E.floorY(1)); run(s, { down: true }, 1.1); assert.ok(s.player.floor >= 2); });
test('an absent lift can be called, arrives without moving its caller, then boards', () => { const s = game(); place(s, 514, 0); run(s, { down: true }, .05); assert.equal(s.lifts[1].target, 0); assert.equal(s.player.riding, null); run(s, {}, 3); assert.equal(s.lifts[1].floor, 0); assert.equal(s.player.floor, 0); run(s, { down: true }, .1); assert.equal(s.player.riding, 1); });
test('E calls a nearby car and does not teleport to a distant lift', () => { const s = game(); place(s, 470, 0); E.update(s, { usePressed: true }); assert.equal(s.lifts[1].target, 0); assert.equal(s.player.x, 470); });
test('lifts stop at roof and ground; jumping cannot detach from a moving car', () => { const s = game(); place(s, 246); run(s, { up: true }, 1); assert.equal(s.player.floor, 0); run(s, { down: true }, .2); E.update(s, { jumpPressed: true, right: true }); assert.equal(s.player.grounded, true); assert.equal(s.player.x, 246); run(s, { down: true }, 20); assert.equal(s.player.floor, 7); assert.equal(s.player.riding, null); });
test('medkits are one-shot and health is capped', () => { const s = game(); place(s, 370, 3); s.health = 2; run(s, {}, .1); assert.equal(s.health, 3); assert.equal(s.score, 100); s.health = 1; run(s, {}, .2); assert.equal(s.health, 1); });
test('death spends one life, respawns at last document, and preserves files', () => { const s = game(); place(s, 664, 2); run(s, { use: true }, .7); assert.equal(s.docs[1].taken, true); place(s, 500, 3); s.health = 1; s.bullets = [{ x: 485, y: s.player.y - 24, vx: 210, hostile: true, life: 2 }]; run(s, {}, .1); assert.equal(s.lives, 2); run(s, {}, 2); assert.equal(s.health, 3); assert.equal(s.player.floor, 2); assert.equal(s.player.x, 664); assert.ok(s.player.invul > 0); assert.ok(s.docs[1].taken); });
test('last life shows gameover without a negative life or score', () => { const s = game(); place(s, 150); s.health = 1; s.lives = 1; s.bullets = [{ x: 130, y: s.player.y - 24, vx: 210, hostile: true, life: 2 }]; run(s, {}, 1); assert.equal(s.mode, 'gameover'); assert.equal(s.lives, 0); assert.equal(s.health, 0); });
test('escape is locked until every file has been secured', () => { const s = game(); place(s, 690, 7); run(s, {}, .1); assert.equal(s.mode, 'playing'); s.docs.forEach(d => d.taken = true); run(s, {}, .1); assert.equal(s.mode, 'escaped'); assert.ok(s.bonus > 0); const score = s.score; run(s, {}, 5); assert.equal(s.score, score); });
test('next mission increases floors and guards, preserves score, and replenishes life/health', () => { const s = game(); s.mode = 'escaped'; s.score = 4200; s.health = 2; E.next(s); assert.equal(s.level, 2); assert.equal(s.floors, 9); assert.equal(s.score, 4200); assert.equal(s.lives, 4); assert.equal(s.health, 3); assert.equal(s.mode, 'playing'); assert.ok(s.enemies.length > 8); assert.ok(s.docs.every(d => !d.taken)); });
test('twenty missions remain bounded; enemies and projectiles do not grow without limit', () => { const s = game(); for (let i = 0; i < 20; i++) { s.mode = 'escaped'; E.next(s); } assert.equal(s.floors, 20); assert.equal(s.lives, 5); run(s, { fire: true }, 30); assert.ok(s.enemies.length <= s.floors * 3); assert.ok(s.bullets.length < 50); assert.ok(s.particles.length < 250); });
test('entire mission is traversable using only movement, lift and use inputs', () => {
  const s = game();
  const walk = x => { let limit = 600; while (s.mode === 'playing' && Math.abs(s.player.x - x) > 2 && limit--) E.update(s, { left: s.player.x > x, right: s.player.x < x }); assert.ok(limit > 0); };
  const ride = f => { walk(246); let limit = 1800; while ((s.player.floor !== f || s.player.riding !== null) && limit--) E.update(s, { down: s.player.floor < f, up: s.player.floor > f }); assert.ok(limit > 0); };
  for (const d of s.docs) { ride(d.floor); walk(d.x); run(s, { use: true }, .7); assert.equal(d.taken, true); }
  ride(s.floors - 1); walk(665); assert.equal(s.mode, 'escaped'); assert.equal(s.totalDocs, 4); assert.ok(s.score >= 2000);
});
test('every game asset is explicitly deployed, stamped and discoverable', () => {
  const root = path.join(__dirname, '..'), deploy = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
  for (const file of fs.readdirSync(path.join(root, 'elevator'))) assert.ok(deploy.includes(`--include 'elevator/${file}'`), `${file} must deploy`);
  assert.ok(deploy.includes("- 'elevator/**'"));
  for (const file of ['index.html', '404.html', 'sitemap.xml']) assert.ok(fs.readFileSync(path.join(root, file), 'utf8').includes('/elevator/'));
  assert.ok(fs.readFileSync(path.join(root, 'scripts/stamp-assets.mjs'), 'utf8').includes("'elevator/index.html'"));
});

function mission(level, quiet = true) {
  const s = game(false);
  if (level > 1) { s.level = level - 1; s.mode = 'escaped'; E.next(s); }
  if (quiet) { s.enemies = []; s.spawnClock = 1e6; }
  return s;
}

test('approved pacing: one floor each mission, one file every other mission, then 20/10 cap', () => {
  const expected = [[8,4],[9,4],[10,5],[11,5],[12,6],[13,6],[14,7],[15,7],
    [16,8],[17,8],[18,9],[19,9],[20,10],[20,10],[20,10],[20,10]];
  const s = game();
  expected.forEach(([floors, files], i) => {
    assert.equal(s.level, i + 1);
    assert.equal(s.floors, floors, `mission ${i + 1} height`);
    assert.equal(s.docs.length, files, `mission ${i + 1} required files`);
    s.mode = 'escaped'; E.next(s);
  });
});
test('all missions distribute unique reachable documents from roof through the lower floors', () => {
  for (const level of [...Array.from({length:60}, (_,i)=>i+1), 999, 1000000, Number.MAX_SAFE_INTEGER]) {
    const s = mission(level);
    assert.equal(s.docs[0].floor, 0);
    assert.equal(s.docs[0].x, 98, 'familiar first document stays beside spawn');
    assert.equal(s.docs.at(-1).floor, s.floors - 2, `mission ${level} has a file just above getaway`);
    assert.equal(new Set(s.docs.map(d => d.floor)).size, s.docs.length);
    assert.ok(s.docs.every(d => d.floor >= 0 && d.floor < s.floors - 1 && [98,664].includes(d.x)));
    for (let i=1;i<s.docs.length;i++) assert.ok(s.docs[i].floor-s.docs[i-1].floor <= 3, 'no empty stretch longer than two floors');
    assert.equal(s.worldH, E.floorY(s.floors-1)+60);
  }
});
test('capped missions rotate file routes, guard posts and sentry behavior without more height or quotas', () => {
  const capped = [13,14,15,16].map(level=>mission(level,false));
  assert.equal(new Set(capped.map(s=>JSON.stringify(s.docs.map(d=>[d.floor,d.x])))).size, 4);
  assert.notDeepEqual(capped[0].enemies.map(e=>[e.x,e.dir]),capped[1].enemies.map(e=>[e.x,e.dir]));
  assert.ok(capped[2].enemies.some(e=>e.sentry));
  assert.ok(capped[2].enemies.some(e=>!e.sentry));
  assert.notDeepEqual(capped[2].enemies.filter(e=>e.sentry).map(e=>e.floor),capped[3].enemies.filter(e=>e.sentry).map(e=>e.floor));
  for (const s of capped) { assert.equal(s.floors,20); assert.equal(s.docs.length,10); assert.equal(s.enemies.length,36); }
});
test('sentries hold their post and telegraph shots; patrollers keep moving', () => {
  const s=mission(15,false);s.spawnClock=1e6;
  const sentry=s.enemies.find(e=>e.sentry), patrol=s.enemies.find(e=>!e.sentry);
  const sx=sentry.x, px=patrol.x;run(s,{},.5);
  assert.equal(sentry.x,sx);assert.equal(sentry.walk,0);assert.notEqual(patrol.x,px);
  place(s,sentry.x-80,sentry.floor);sentry.cool=0;run(s,{},.05);
  assert.ok(sentry.aim>0);assert.equal(sentry.x,sx);
});
test('very high missions retain bounded difficulty, effects and entity counts', () => {
  const s=mission(1000000,false);s.player.invul=1e6;
  assert.equal(s.floors,20);assert.equal(s.docs.length,10);
  assert.ok(s.enemies.every(e=>Number.isFinite(e.speed)&&e.speed<=60));
  run(s,{fire:true},60);
  assert.ok(s.enemies.length<=57);assert.ok(s.bullets.length<50);assert.ok(s.particles.length<250);
  assert.ok(s.bullets.every(b=>Math.abs(b.vx)<=560));
  assert.ok(s.spawnClock<=8);assert.ok(Number.isFinite(s.player.y));
});
test('both elevators traverse all twenty floors in both directions and stop at boundaries', () => {
  for (const lift of [0,1]) {
    const s=mission(13);place(s,s.lifts[lift].x,0);
    run(s,{down:true},26);assert.equal(s.player.floor,19);assert.equal(s.player.y,E.floorY(19));assert.equal(s.player.riding,null);
    run(s,{up:true},24);assert.equal(s.player.floor,0);assert.equal(s.player.y,E.floorY(0));assert.equal(s.player.riding,null);
  }
});
test('twenty-floor checkpoint deaths preserve the lower-floor objective and cleanly respawn', () => {
  const s=mission(16), file=s.docs.at(-1);place(s,file.x,file.floor);run(s,{use:true},.7);
  assert.ok(file.taken);place(s,500,19);s.health=1;
  s.bullets=[{x:485,y:s.player.y-24,vx:210,hostile:true,life:2}];run(s,{},2);
  assert.equal(s.lives,3);assert.equal(s.player.floor,18);assert.equal(s.player.x,file.x);assert.equal(s.health,3);assert.ok(file.taken);
});
test('expanded building gets proportionate alarm and escape-time budgets', () => {
  const first=mission(1), capped=mission(13);
  assert.equal(first.alarmAt,150);assert.equal(first.escapeBudget,1800);
  assert.equal(capped.alarmAt,270);assert.equal(capped.escapeBudget,2400);
  const later=mission(1000000);assert.equal(later.alarmAt,capped.alarmAt);assert.equal(later.escapeBudget,capped.escapeBudget);
  capped.time=200;capped.docs.forEach(d=>d.taken=true);place(capped,690,19);E.update(capped);
  assert.equal(capped.mode,'escaped');assert.equal(capped.bonus,2000);
});
test('growing and capped layouts can be fully cleared using only walking, lifts and collection', () => {
  for (const level of [2,3,12,13,14,15,16,1000000]) {
    const s=mission(level);
    const walk=x=>{let limit=600;while(s.mode==='playing'&&Math.abs(s.player.x-x)>2&&limit--)E.update(s,{left:s.player.x>x,right:s.player.x<x});assert.ok(limit>0,`mission ${level} walk`);};
    const ride=f=>{walk(246);let limit=1800;while((s.player.floor!==f||s.player.riding!==null)&&limit--)E.update(s,{down:s.player.floor<f,up:s.player.floor>f});assert.ok(limit>0,`mission ${level} lift`);};
    for(const file of s.docs){ride(file.floor);walk(file.x);run(s,{use:true},.7);assert.ok(file.taken);}
    ride(s.floors-1);walk(665);assert.equal(s.mode,'escaped');assert.equal(s.totalDocs,s.docs.length);
  }
});
