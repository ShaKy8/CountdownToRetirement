(function () {
  'use strict';
  const $ = id => document.getElementById(id), canvas = $('game'), renderer = StarfallRender.make(canvas);
  const keys = new Set(), pointers = new Map(), KEY = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'thrust', KeyW: 'thrust', ArrowDown: 'brake', KeyS: 'brake', Space: 'fire', KeyJ: 'fire' };
  const STORE = 'branyon.starfall.v1';
  let best = 0, muted = false, storageOK = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || '{}');
    if (Number.isSafeInteger(saved.best) && saved.best >= 0) best = saved.best;
    muted = saved.muted === true;
  } catch (_) { storageOK = false; }
  function save() { try { localStorage.setItem(STORE, JSON.stringify({ best, muted })); } catch (_) { storageOK = false; } }
  let state = Starfall.create(86), mode = 'ready', priorMode = 'playing', previous = 0, accumulator = 0, lastHud = '';
  function dimensions() {
    const rect = canvas.getBoundingClientRect(), width = rect.width < 500 ? 720 : 960;
    return { width, height: Math.round(width * rect.height / rect.width) };
  }
  function announce(text) { $('announcer').textContent = text; }
  function clearInput() {
    keys.clear(); pointers.clear();
    document.querySelectorAll('[data-control]').forEach(el => el.classList.remove('held'));
    state.ship.thrusting = false;
  }
  function input() {
    const out = {};
    for (const key of keys) if (KEY[key]) out[KEY[key]] = true;
    for (const value of pointers.values()) out[value] = true;
    return out;
  }
  function soundUI() { $('mute').innerHTML = (muted ? 'Sound off' : 'Sound on') + ' <kbd>M</kbd>'; $('mute').setAttribute('aria-pressed', String(muted)); StarfallAudio.setMuted(muted); }
  function hud() {
    const value = [state.score, best, state.wave, state.lives, mode, state.ship.shield > 0].join(':');
    if (value === lastHud) return; lastHud = value;
    $('score').textContent = String(state.score).padStart(6, '0'); $('best').textContent = String(best).padStart(6, '0');
    $('wave').textContent = String(state.wave).padStart(2, '0'); $('lives').textContent = String(state.lives);
    $('pause').disabled = mode === 'ready' || mode === 'over' || mode === 'confirm'; $('restart').disabled = mode === 'ready' || mode === 'confirm';
    $('pause').innerHTML = (mode === 'paused' ? 'Resume' : 'Pause') + ' <kbd>P</kbd>';
    $('flight-status').textContent = mode === 'ready' ? 'ALL SYSTEMS READY' : mode === 'playing' ? (state.ship.shield > 0 ? 'RE-ENTRY SHIELD ACTIVE' : 'DEEP SPACE / LIVE') : mode.toUpperCase();
  }
  function menu(next, focus = true) {
    mode = next; clearInput(); accumulator = 0; $('overlay').hidden = mode === 'playing';
    $('secondary').hidden = mode !== 'confirm'; $('panel-hint').hidden = mode !== 'ready';
    if (mode === 'paused') { $('panel-kicker').textContent = 'HOLDING ORBIT'; $('panel-title').textContent = 'Take a breath.'; $('panel-copy').textContent = 'Your ship is safe here. Resume when you’re ready.'; $('primary').textContent = 'Resume flight ↗'; announce('Game paused.'); }
    if (mode === 'confirm') { $('panel-kicker').textContent = 'NEW FLIGHT'; $('panel-title').textContent = 'Start fresh?'; $('panel-copy').textContent = 'This run will end. Your best score stays with you.'; $('primary').textContent = 'Restart flight'; $('secondary').textContent = 'Keep this run'; announce('Confirm restart or keep this run.'); }
    if (mode === 'over') { $('panel-kicker').textContent = 'SIGNAL LOST / WAVE ' + state.wave; $('panel-title').textContent = state.score > 0 && state.score >= best ? 'A stellar run.' : 'One more flight?'; $('panel-copy').textContent = state.score.toLocaleString() + ' points · ' + state.kills + ' rocks cleared. ' + (storageOK ? 'Your best is saved on this device.' : 'Best score kept for this visit; device storage is unavailable.'); $('primary').textContent = 'Fly again ↗'; announce('Flight over. Score ' + state.score + '. Wave ' + state.wave + '.'); }
    hud();
    if (focus) (mode === 'playing' ? canvas : $('primary')).focus({ preventScroll: true });
  }
  function start() {
    StarfallAudio.unlock(); const size = dimensions(); state = Starfall.create(Math.floor(Math.random() * 4294967296), size.width, size.height);
    renderer.clear(); menu('playing'); StarfallAudio.event({ type: 'wave' }); announce('Flight started. Three ships. Wave one.');
  }
  function pause() { if (mode === 'playing') menu('paused'); else if (mode === 'paused') { StarfallAudio.unlock(); menu('playing'); } }
  function restart() { if (mode === 'playing' || mode === 'paused' || mode === 'over') { priorMode = mode; menu('confirm'); } }
  $('primary').addEventListener('click', () => { if (mode === 'paused') pause(); else start(); });
  $('secondary').addEventListener('click', () => menu(priorMode));
  $('pause').addEventListener('click', pause); $('restart').addEventListener('click', restart);
  function mute() { muted = !muted; StarfallAudio.unlock(); soundUI(); save(); }
  $('mute').addEventListener('click', () => { mute(); if (mode === 'playing') canvas.focus({ preventScroll: true }); });
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (['KeyP', 'Escape', 'KeyM', 'KeyR'].includes(e.code)) {
      e.preventDefault(); if (e.repeat) return;
      if (e.code === 'KeyM') mute();
      else if (e.code === 'KeyR') restart();
      else if (mode === 'confirm') menu(priorMode);
      else pause();
      return;
    }
    if (KEY[e.code] && mode === 'playing' && !e.target.closest('button,a')) { e.preventDefault(); keys.add(e.code); StarfallAudio.unlock(); }
  });
  document.addEventListener('keyup', e => { keys.delete(e.code); if (KEY[e.code] && e.target === canvas) e.preventDefault(); });
  for (const el of document.querySelectorAll('[data-control]')) {
    el.addEventListener('pointerdown', e => {
      if (mode !== 'playing' || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault(); StarfallAudio.unlock(); pointers.set(e.pointerId, el.dataset.control); el.classList.add('held');
      try { el.setPointerCapture(e.pointerId); } catch (_) { /* Synthetic events have no pointer capture. */ }
    });
    const release = e => { pointers.delete(e.pointerId); if (![...pointers.values()].includes(el.dataset.control)) el.classList.remove('held'); };
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(name, release);
    el.addEventListener('contextmenu', e => e.preventDefault());
  }
  window.addEventListener('pointerup', e => { pointers.delete(e.pointerId); });
  window.addEventListener('blur', () => { clearInput(); if (mode === 'playing') menu('paused', false); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); if (mode === 'playing') menu('paused', false); } });
  window.addEventListener('pagehide', () => { clearInput(); if (mode === 'playing') menu('paused', false); save(); });
  new ResizeObserver(() => {
    const size = dimensions(); if (!size.width || !size.height || (size.width === state.width && size.height === state.height)) return;
    const sx = size.width / state.width, sy = size.height / state.height;
    for (const obj of [state.ship, ...state.rocks, ...state.bullets]) { obj.x *= sx; obj.y *= sy; }
    Object.assign(state, size); renderer.clear(); if (mode === 'playing') menu('paused');
  }).observe(canvas);
  function frame(now) {
    const dt = Math.min((now - (previous || now)) / 1000, 0.1); previous = now;
    if (mode === 'playing') {
      accumulator += dt;
      while (accumulator >= 1 / 60 && mode === 'playing') {
        Starfall.step(state, input()); accumulator -= 1 / 60;
        for (const event of state.events) {
          renderer.effect(event); StarfallAudio.event(event);
          if (event.type === 'wave') announce('Wave ' + state.wave + '.');
          if (event.type === 'clear') announce('Wave ' + state.wave + ' cleared.');
          if (event.type === 'death') announce(state.lives + ' ships remaining.');
          if (event.type === 'life') announce('Extra ship earned.');
        }
        if (state.score > best) { best = state.score; save(); }
        if (state.phase === 'over') menu('over');
      }
    }
    renderer.paint(state, dt, mode === 'playing'); hud(); requestAnimationFrame(frame);
  }
  // Read-only copies for diagnostics; no live state or gameplay mutations.
  window.StarfallApp = Object.freeze({ snapshot: () => JSON.parse(JSON.stringify({ mode, muted, best, storageOK, input: input(), state })) });
  soundUI(); hud(); requestAnimationFrame(frame);
})();
