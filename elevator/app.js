(function () {
  'use strict';
  const E = window.Elevator86, $ = id => document.getElementById(id), canvas = $('game');
  const renderer = new window.ElevatorRenderer(canvas), sound = new window.ElevatorSound();
  const stored = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, String(value)); } catch { /* Private/storage-full browsers remain playable. */ } };
  let best = Math.max(0, Math.min(999999999, Number(stored('elevator86.best', '0')) || 0));
  let state = E.createGame(Date.now() >>> 0), overlayMode = 'ready', paused = false, accumulator = 0, last = 0, hudClock = 0;
  const keys = new Set(), touches = new Map(), edges = new Set();
  const binding = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'jump', KeyZ: 'jump', KeyX: 'fire', KeyJ: 'fire', KeyE: 'use' };
  sound.mute(stored('elevator86.muted', 'false') === 'true');
  function soundLabel() { $('sound').textContent = sound.muted ? 'Sound off' : 'Sound on'; $('sound').setAttribute('aria-pressed', String(sound.muted)); $('sound').setAttribute('aria-label', sound.muted ? 'Unmute sound' : 'Mute sound'); }
  soundLabel();
  function clearInput() { keys.clear(); touches.clear(); edges.clear(); document.querySelectorAll('[data-action]').forEach(b => b.classList.remove('held')); }
  function held(action) { return [...keys].some(k => binding[k] === action) || [...touches.values()].includes(action); }
  function input() { const o = {}; for (const action of ['left', 'right', 'up', 'down', 'fire', 'use']) o[action] = held(action); o.jumpPressed = edges.has('jump'); o.usePressed = edges.has('use'); edges.clear(); return o; }
  function updateBest() { if (state.score > best) { best = state.score; save('elevator86.best', best); } }
  function newRun() { state = E.createGame(Date.now() >>> 0); E.start(state); paused = false; hidePanel(); renderer.cam = { x: 0, y: 0 }; accumulator = 0; refresh(); }
  function hidePanel() { overlayMode = null; $('overlay').hidden = true; $('screen').classList.remove('covered'); clearInput(); $('pause').disabled = false; $('restart').disabled = false; $('pause').textContent = 'Pause'; canvas.focus({ preventScroll: true }); }
  function panel(kind) {
    clearInput(); overlayMode = kind; $('overlay').hidden = false; $('intro-steps').hidden = kind !== 'ready'; $('secondary').hidden = kind !== 'restart';
    const upcoming = E.missionPlan(state.level + 1);
    const nextBrief = `Next: ${upcoming.floors} floors, ${upcoming.files} files.${upcoming.floors === state.floors ? ' New routes and guard patrols.' : ''}`;
    const data = {
      ready: ['TRANSMISSION 001 / CLASSIFIED', 'NIGHT SHIFT.', 'The building is crawling with agents. Steal every red-door file, ride the lifts down, and reach your getaway car.', 'Begin mission →', '3 lives · unlimited ammo · no downloads'],
      paused: ['TRANSMISSION ON HOLD', 'TAKE A BREATHER.', 'Your mission is safe. Resume when you’re ready.', 'Resume mission →', 'P or Escape to resume'],
      restart: ['NEW ASSIGNMENT', 'START OVER?', 'This resets your current mission, lives, and score. Your best score is saved.', 'Restart mission →', 'Or keep your current run'],
      escaped: ['TRANSMISSION COMPLETE', 'CLEAN GETAWAY.', `Mission ${state.level} complete. ${state.docs.length} files secured. +${state.bonus || 0} escape bonus. ${nextBrief}`, 'Next mission →', `Score ${state.score.toLocaleString()} · +1 life and +1 health next mission`],
      gameover: ['SIGNAL LOST / MISSION ENDED', 'BUSTED.', `You secured ${state.totalDocs} files and took down ${state.kills} agents across ${state.level} mission${state.level === 1 ? '' : 's'}. Ready for another run?`, 'Try again →', `Score ${state.score.toLocaleString()} · Best ${best.toLocaleString()}`]
    }[kind];
    $('panel-kicker').textContent = data[0]; $('panel-title').textContent = data[1]; $('panel-copy').textContent = data[2]; $('primary').textContent = data[3]; $('panel-note').textContent = data[4];
    $('pause').disabled = kind === 'ready' || kind === 'escaped' || kind === 'gameover'; $('restart').disabled = kind === 'ready'; $('pause').textContent = kind === 'paused' ? 'Resume' : 'Pause';
    $('primary').focus({ preventScroll: true });
  }
  function pause() {
    if (state.mode !== 'playing' || overlayMode === 'restart') return;
    paused = !paused; if (paused) panel('paused'); else hidePanel(); accumulator = 0;
  }
  function restart() { if (state.mode === 'ready') return; paused = true; panel('restart'); }
  function activate() {
    sound.unlock();
    if (overlayMode === 'paused') { paused = false; hidePanel(); }
    else if (overlayMode === 'escaped') { E.next(state); paused = false; hidePanel(); renderer.cam = { x: 0, y: 0 }; refresh(); }
    else newRun();
  }
  $('primary').addEventListener('click', activate);
  $('secondary').addEventListener('click', () => { paused = false; if (state.mode === 'escaped' || state.mode === 'gameover') panel(state.mode); else hidePanel(); });
  $('pause').addEventListener('click', pause); $('restart').addEventListener('click', restart);
  function mute() { sound.unlock(); sound.mute(!sound.muted); save('elevator86.muted', sound.muted); soundLabel(); if (!overlayMode) canvas.focus({ preventScroll: true }); }
  $('sound').addEventListener('click', mute);
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'Tab' && overlayMode) {
      const focusable = [...$('overlay').querySelectorAll('button')].filter(b => !b.hidden); const first = focusable[0], final = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); final.focus(); } else if (!e.shiftKey && document.activeElement === final) { e.preventDefault(); first.focus(); } return;
    }
    if (e.code === 'KeyM' && !e.repeat) { mute(); return; }
    if (e.code === 'KeyP' || e.code === 'Escape') { e.preventDefault(); if (!e.repeat) { if (overlayMode === 'restart') $('secondary').click(); else pause(); } return; }
    if (e.code === 'KeyR' && !e.repeat) { restart(); return; }
    if (!binding[e.code] || overlayMode || state.mode !== 'playing') return;
    if (document.activeElement?.tagName === 'BUTTON') return;
    e.preventDefault(); sound.unlock(); if (!keys.has(e.code)) edges.add(binding[e.code]); keys.add(e.code);
  });
  document.addEventListener('keyup', e => { if (binding[e.code]) { keys.delete(e.code); if (!overlayMode) e.preventDefault(); } });
  for (const button of document.querySelectorAll('[data-action]')) {
    button.addEventListener('pointerdown', e => {
      e.preventDefault(); if (overlayMode || state.mode !== 'playing') return; sound.unlock(); button.setPointerCapture(e.pointerId); touches.set(e.pointerId, button.dataset.action); edges.add(button.dataset.action); button.classList.add('held');
    });
    const release = e => { touches.delete(e.pointerId); if (![...touches.values()].includes(button.dataset.action)) button.classList.remove('held'); };
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
    button.addEventListener('contextmenu', e => e.preventDefault());
  }
  function background() { clearInput(); if (state.mode === 'playing' && !paused) { paused = true; panel('paused'); } }
  window.addEventListener('blur', background); document.addEventListener('visibilitychange', () => { if (document.hidden) background(); });
  window.addEventListener('resize', () => renderer.resize());
  function refresh() {
    $('score').textContent = String(state.score).padStart(6, '0'); $('best').textContent = String(best).padStart(6, '0'); $('level').textContent = String(state.level).padStart(2, '0');
    $('health').textContent = Array.from({ length: 3 }, (_, i) => i < state.health ? '♥' : '♡').join(' '); $('health').setAttribute('aria-label', `${state.health} health`); $('lives').textContent = `${state.lives} ${state.lives === 1 ? 'LIFE' : 'LIVES'}`;
    const count = state.docs.filter(d => d.taken).length, floor = state.floors - state.player.floor;
    $('floor').textContent = 'F' + String(floor).padStart(2, '0');
    let objective = 'YOUR MISSION: ALL FILES. GROUND FLOOR. GETAWAY.';
    if (state.mode !== 'ready') objective = count === state.docs.length ? 'ALL FILES SECURED. REACH THE CAR ON F01 →' : `${count}/${state.docs.length} FILES · FIND RED DOORS · HOLD ↑ / USE TO STEAL`;
    if ($('objective').textContent !== objective) $('objective').textContent = objective;
    const map = Array.from({ length: state.floors }, (_, f) => {
      const doc = state.docs.find(d => d.floor === f); return `<div class="map-floor${f === state.player.floor ? ' current' : ''}" aria-label="Floor ${state.floors - f}${doc ? doc.taken ? ', file secured' : ', secret file' : ''}${f === state.player.floor ? ', your position' : ''}"><span>${String(state.floors - f).padStart(2, '0')}</span><div class="track">${doc ? `<i class="marker${doc.taken ? ' taken' : ''}"></i>` : ''}${f === state.player.floor ? '<i class="you"></i>' : ''}</div></div>`;
    }).join(''); if ($('building-map').innerHTML !== map) $('building-map').innerHTML = map;
  }
  function frame(ms) {
    const dt = last ? Math.min(.1, (ms - last) / 1000) : 0; last = ms;
    if (state.mode === 'playing' && !paused) {
      accumulator += dt;
      while (accumulator >= E.STEP) { E.update(state, input(), E.STEP); accumulator -= E.STEP; }
      updateBest();
      if (state.mode === 'escaped' || state.mode === 'gameover') { panel(state.mode); refresh(); }
    }
    for (const event of state.events) sound.event(event.type); state.events.length = 0;
    sound.tick(state.mode === 'playing' && !paused); renderer.draw(state, dt || E.STEP);
    hudClock += dt; if (hudClock > .1) { refresh(); hudClock = 0; }
    requestAnimationFrame(frame);
  }
  // Read-only diagnostics for audits; gameplay is driven solely by real inputs.
  window.Elevator86App = Object.freeze({ snapshot: () => JSON.parse(JSON.stringify({ mode: state.mode, paused, level: state.level, score: state.score, best, lives: state.lives, health: state.health, time: state.time, player: state.player, docs: state.docs, lifts: state.lifts, enemies: state.enemies, bullets: state.bullets, floors: state.floors, muted: sound.muted, audio: sound.ctx?.state || 'locked', overlay: overlayMode })) });
  renderer.resize(); refresh(); panel('ready'); requestAnimationFrame(frame);
})();
