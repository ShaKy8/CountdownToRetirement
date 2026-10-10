/* LIGHT LASSO: same-origin, no network calls, no build step. */
(function () {
  'use strict';
  const L = window.Lasso;
  const $ = (id) => document.getElementById(id);
  const canvas = $('field');
  const ctx = canvas.getContext('2d');
  if (!L || !ctx) { $('status').textContent = 'This browser cannot open the meadow. Please try a current browser.'; return; }
  const W = L.WIDTH, H = L.HEIGHT;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const RECORD_KEY = 'branyon.light-lasso.v1', SOUND_KEY = 'branyon.light-lasso.sound';
  let records, storageOK = true, sound = false;
  try { records = L.parseRecords(localStorage.getItem(RECORD_KEY)); sound = localStorage.getItem(SOUND_KEY) === 'on'; }
  catch (_) { records = L.parseRecords(null); storageOK = false; }
  let mode = 'daily', day = L.localDay(new Date()), seed = L.dailySeed(day);
  let game = L.create(seed), phase = 'intro', previousPhase = null;
  let stroke = [], pointer = null, preview = null, lastFrame = 0, lastHud = '';
  let particles = [], rings = [], labels = [], flash = null;
  let keyboard = false, cursor = { x: W / 2, y: H / 2 }, keys = new Set();
  let audio = null, helpReturn = null, activeReturn = null;
  
  const C = { light: '#d9f4b8', mint: '#9ce1c7', gold: '#f5d490', ember: '#ef927e', white: '#e7efdf', faint: '#527276' };

  function say(text) { if ($('status').textContent !== text) $('status').textContent = text; }
  function setHidden(id, hidden) { $(id).hidden = hidden; }
  function soundButton() { $('sound').setAttribute('aria-pressed', String(sound)); $('sound').textContent = sound ? 'Sound on' : 'Sound off'; }
  function persist() {
    try { localStorage.setItem(RECORD_KEY, JSON.stringify(records)); }
    catch (_) { storageOK = false; }
    storageNote();
  }
  function storageNote() { if ($('storage-note')) $('storage-note').textContent = storageOK ? 'Your best stays on this browser. No account needed.' : 'Storage is unavailable. Your best lasts for this visit.'; }
  function best() { return mode === 'daily' ? (records.days[day] || 0) : records.best; }
  function fmt(n) { return Math.round(n).toLocaleString(); }
  function audioOn() {
    if (!sound) return;
    try { const A = window.AudioContext || window.webkitAudioContext; if (!A) return; audio = audio || new A(); if (audio.state === 'suspended') audio.resume().catch(function () {}); }
    catch (_) { audio = null; }
  }
  function tone(kind, count) {
    if (!sound) return;
    audioOn(); if (!audio || audio.state !== 'running') return;
    try {
      const now = audio.currentTime;
      const notes = kind === 'burn' ? [155, 105] : kind === 'end' ? [392, 523, 659] : [440, 554, 659, 880].slice(0, Math.min(4, count || 1));
      notes.forEach(function (hz, i) {
        const osc = audio.createOscillator(), gain = audio.createGain(), at = now + i * 0.045;
        osc.type = kind === 'burn' ? 'triangle' : 'sine'; osc.frequency.setValueAtTime(hz, at);
        gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(0.045, at + 0.015); gain.gain.exponentialRampToValueAtTime(0.001, at + 0.24);
        osc.connect(gain); gain.connect(audio.destination); osc.start(at); osc.stop(at + 0.25);
        osc.onended = function () { osc.disconnect(); gain.disconnect(); };
      });
    } catch (_) { /* Sound must never interrupt a catch. */ }
  }
  function cancelStroke() {
    game.drawing = false; stroke = []; preview = null;
    const capturedPointer = pointer; pointer = null;
    if (capturedPointer !== null) { try { canvas.releasePointerCapture(capturedPointer); } catch (_) {} }
 $('thread-label').textContent = 'Thread ready'; $('thread-fill').style.width = '0%';
  }
  function refreshMode() {
    $('daily-label').textContent = mode === 'daily' ? 'DAILY MEADOW · ' + day : 'SHUFFLE MEADOW';
    $('best').textContent = fmt(best());
  }
  function shuffleSeed() {
    try { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0]; }
    catch (_) { return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0; }
  }
  function start(which, sameSeed) {
    cancelStroke(); keys.clear();
    mode = which || mode;
    if (mode === 'daily') { day = L.localDay(new Date()); seed = L.dailySeed(day); }
    else if (!sameSeed) seed = shuffleSeed();
    game = L.create(seed); phase = 'ready'; particles = []; rings = []; labels = []; flash = null;
    ['intro', 'result', 'pause-panel', 'help-panel'].forEach(function (id) { setHidden(id, true); });
    $('pause').disabled = false; $('restart').disabled = false;
    $('pause').textContent = 'Pause';
    refreshMode(); updateHud();
    say('Draw your first loop to start the 75-second clock. Release to catch.');
    audioOn(); canvas.focus({ preventScroll: true });
  }
  function showIntro() {
    cancelStroke(); keys.clear(); phase = 'intro'; mode = 'daily'; day = L.localDay(new Date()); seed = L.dailySeed(day); game = L.create(seed); refreshMode();
    ['result', 'pause-panel', 'help-panel'].forEach(function (id) { setHidden(id, true); }); setHidden('intro', false);
    $('pause').disabled = true; $('restart').disabled = true; $('start').focus({ preventScroll: true });
    say('Circle the lights. Release to catch. Keep red embers out.'); updateHud();
  }
  function pause() {
    if (phase !== 'playing' && phase !== 'ready') return;
    previousPhase = phase; cancelStroke(); keys.clear(); phase = 'paused'; setHidden('pause-panel', false);
    say('Paused. Your meadow will wait.'); $('resume').focus({ preventScroll: true });
    if (audio) audio.suspend().catch(function () {});
  }
  function resume() {
    if (phase !== 'paused') return;
    phase = previousPhase || 'ready'; lastFrame = 0; setHidden('pause-panel', true); audioOn(); canvas.focus({ preventScroll: true });
    say(phase === 'ready' ? 'Draw your first loop to start the clock.' : 'Circle the lights. Keep red embers out.');
  }
  function openHelp() {
    if (phase === 'help') return;
    helpReturn = phase; activeReturn = document.activeElement;
    cancelStroke(); keys.clear(); phase = 'help'; setHidden('help-panel', false); $('close-help').focus({ preventScroll: true });
  }
  function closeHelp() {
    if (phase !== 'help') return;
    phase = helpReturn || 'intro'; lastFrame = 0; setHidden('help-panel', true);
    if (phase === 'paused') $('resume').focus({ preventScroll: true });
    else if (activeReturn && !activeReturn.hidden) activeReturn.focus({ preventScroll: true });
  }
  function finish() {
    if (phase === 'result') return;
    cancelStroke(); keys.clear(); phase = 'result';
    const oldBest = best();
    // Shuffle contributes to the all-time best; daily records keep their date.
    records = L.record(records, mode === 'daily' ? day : null, game.score); persist();
    $('result-title').textContent = game.score > oldBest ? 'A new glow.' : game.score ? 'Beautifully caught.' : 'The night is young.';
    $('result-score').textContent = fmt(game.score);
    $('result-detail').textContent = game.caught + ' lights caught · ' + game.loops + ' loops · best chain ×' + Math.max(1, game.bestCombo);
    $('result-best').textContent = game.score > oldBest ? (mode === 'daily' ? 'New daily best on this browser' : 'New all-time best on this browser') : (mode === 'daily' ? 'Daily best ' : 'All-time best ') + fmt(best());
    $('again').textContent = mode === 'daily' ? 'Play this meadow again' : 'Try this meadow again';
    setHidden('result', false); $('pause').disabled = true;
    say('Time. ' + fmt(game.score) + ' points. ' + $('result-best').textContent + '.');
    $('again').focus({ preventScroll: true }); tone('end', 3); updateHud();
  }
  function updateHud() {
    if ($('chain-fill')) $('chain-fill').style.width = (game.combo ? Math.max(0, 1 - (game.time - game.lastCatch) / L.COMBO_WINDOW) * 100 : 0) + '%';
    const signature = [game.score, Math.ceil(Math.max(0, L.DURATION - game.time)), game.combo, best()].join(':');
    if (signature === lastHud) return;
    lastHud = signature; $('score').textContent = fmt(game.score); $('time').textContent = Math.ceil(Math.max(0, L.DURATION - game.time));
    $('combo').textContent = '×' + Math.max(1, game.combo); $('best').textContent = fmt(best());
    $('time').classList.toggle('is-low', game.time >= 65);
  }
  function begin(p) {
    if (phase !== 'playing' && phase !== 'ready') return;
    if (phase === 'ready') phase = 'playing';
    stroke = [p]; game.drawing = true; preview = null;
  }
  function extend(p) {
    if (!stroke.length) return;
    const last = stroke[stroke.length - 1];
    if (Math.hypot(last.x - p.x, last.y - p.y) >= 4) {
      if (stroke.length >= 260) { stroke = stroke.filter(function (_, i) { return i === 0 || i % 2 === 0; }); }
      stroke.push(p);
    }
  }
  function release() {
    if (!stroke.length) return;
    const line = stroke.slice(); game.drawing = false;
    const hit = L.capture(game, line); cancelStroke();
    if (!hit.valid) { say(hit.reason === 'too-long' ? 'A little smaller: keep your loop within the thread meter.' : hit.reason === 'crossed' ? 'One simple loop. Try without crossing your thread.' : 'Draw a loop around a light, then release.'); return; }
    if (hit.reason === 'catch') {
      flash = { line: hit.polygon, color: C.mint, age: 0 };
      labels.push({ x: hit.x, y: hit.y, text: '+' + fmt(hit.points), sub: hit.lights.length + ' LIGHTS' + (hit.multiplier > 1 ? ' · ×' + hit.multiplier : ''), color: C.light, age: 0 });
      hit.lights.forEach(function (e) { burst(e.x, e.y, C.light, Math.min(10, 3 + hit.lights.length)); });
      rings.push({ x: hit.x, y: hit.y, r: 10, color: C.mint, age: 0 });
      say(hit.lights.length + ' lights! +' + fmt(hit.points) + ' · Catch again quickly to build your chain.'); tone('catch', hit.lights.length);
    } else if (hit.reason === 'ember') {
      flash = { line: hit.polygon, color: C.ember, age: 0 }; hit.embers.forEach(function (e) { burst(e.x, e.y, C.ember, 7); });
      labels.push({ x: hit.x, y: hit.y, text: 'EMBER', sub: 'YOUR SCORE IS SAFE', color: C.ember, age: 0 });
      say('Ember in the loop. No points lost. Try a smaller catch.'); tone('burn', 2);
    } else { say('Just missed. Circle the bright centers and try again.'); }
    updateHud();
  }
  function position(e) {
    const r = canvas.getBoundingClientRect();
    return { x: Math.max(0, Math.min(W, (e.clientX - r.left) / r.width * W)), y: Math.max(0, Math.min(H, (e.clientY - r.top) / r.height * H)) };
  }
  canvas.addEventListener('pointerdown', function (e) {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0) || pointer !== null || (phase !== 'ready' && phase !== 'playing')) return;
    e.preventDefault(); keyboard = false; $('keyboard-mode').setAttribute('aria-pressed', 'false');
    canvas.focus({ preventScroll: true }); pointer = e.pointerId; try { canvas.setPointerCapture(pointer); } catch (_) {}
    begin(position(e));
  });
  canvas.addEventListener('pointermove', function (e) { if (e.pointerId === pointer) { e.preventDefault(); extend(position(e)); } });
  canvas.addEventListener('pointerup', function (e) { if (e.pointerId === pointer) { extend(position(e)); release(); } });
  canvas.addEventListener('pointercancel', function (e) { if (e.pointerId === pointer) { cancelStroke(); say('Loop cancelled. Keep going.'); } });
  canvas.addEventListener('lostpointercapture', function (e) { if (e.pointerId === pointer) cancelStroke(); });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  canvas.addEventListener('keydown', function (e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter', 'Escape'].indexOf(e.code) < 0) return;
    e.preventDefault();
    if (e.code === 'Escape') { if (stroke.length) { cancelStroke(); say('Loop cancelled.'); } else pause(); return; }
    if (phase !== 'ready' && phase !== 'playing') return;
    keyboard = true; $('keyboard-mode').setAttribute('aria-pressed', 'true');
    if (e.code.startsWith('Arrow')) { keys.add(e.code); return; }
    if (e.repeat) return;
    if (stroke.length) release(); else if (e.code === 'Space') begin({ x: cursor.x, y: cursor.y });
  });
  window.addEventListener('keyup', function (e) { keys.delete(e.code); });
  canvas.addEventListener('blur', function () { keys.clear(); if (keyboard && stroke.length) cancelStroke(); });
  window.addEventListener('blur', function () { if (phase === 'playing' || phase === 'ready') pause(); keys.clear(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { if (phase === 'help' && (helpReturn === 'playing' || helpReturn === 'ready')) { previousPhase = helpReturn; helpReturn = 'paused'; setHidden('pause-panel', false); } else pause(); } });
  window.addEventListener('pagehide', function () { pause(); });
  window.addEventListener('pageshow', function () { lastFrame = 0; });
  document.addEventListener('keydown', function (e) { if (e.code !== 'Escape' || e.defaultPrevented) return; if (phase === 'help') closeHelp(); else if (phase === 'paused') resume(); });
  $('start').addEventListener('click', function () { start('daily'); });
  $('shuffle').addEventListener('click', function () { start('shuffle'); });
  $('again').addEventListener('click', function () { start(mode, true); });
  $('result-shuffle').addEventListener('click', function () { start('shuffle'); });
  $('pause').addEventListener('click', pause); $('resume').addEventListener('click', resume);
  $('restart').addEventListener('click', function () { start(mode, true); });
  $('quit').addEventListener('click', showIntro); $('help').addEventListener('click', openHelp); $('close-help').addEventListener('click', closeHelp);
  $('sound').addEventListener('click', function () { sound = !sound; soundButton(); if (sound) { audioOn(); tone('catch', 2); } else if (audio) audio.suspend().catch(function () {}); try { localStorage.setItem(SOUND_KEY, sound ? 'on' : 'off'); } catch (_) {} });
  $('keyboard-mode').addEventListener('click', function () { keyboard = !keyboard; cancelStroke(); $('keyboard-mode').setAttribute('aria-pressed', String(keyboard)); canvas.focus({ preventScroll: true }); say(keyboard ? 'Arrows move the cursor. Space starts a loop; Space or Enter closes it. Escape cancels.' : 'Drag to draw a loop. Release to catch.'); });

  function burst(x, y, color, count) {
    if (reduced.matches) return;
    for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2, speed = 25 + Math.random() * 75; particles.push({ x: x, y: y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 30, color: color, age: 0 }); }
    if (particles.length > 180) particles.splice(0, particles.length - 180);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr)), height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  }
  new ResizeObserver(resize).observe(canvas); window.addEventListener('resize', resize);
  function trace(points) { ctx.beginPath(); points.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); }
  function circle(x, y, r, color) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
  function renderBackground(t) {
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0b202a'); bg.addColorStop(0.62, '#143331'); bg.addColorStop(1, '#193c35'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const pool = ctx.createRadialGradient(W * 0.48, H * 0.42, 0, W * 0.48, H * 0.42, W * 0.72); pool.addColorStop(0, 'rgba(110,175,137,.10)'); pool.addColorStop(1, 'rgba(110,175,137,0)'); ctx.fillStyle = pool; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 54; i++) { const x = (i * 193.71 + 37) % W, y = (i * 107.23 + 73) % H; const a = 0.07 + (Math.sin(i + (reduced.matches ? 0 : t * 0.4)) + 1) * 0.035; circle(x, y, i % 5 === 0 ? 1.8 : 1, 'rgba(192,225,187,' + a + ')'); }
    ctx.strokeStyle = 'rgba(119,174,133,.12)'; ctx.lineWidth = 1.3;
    for (let i = 0; i < 31; i++) { const x = i * 25 - 15, h = 24 + ((i * 43) % 72); ctx.beginPath(); ctx.moveTo(x, H); ctx.quadraticCurveTo(x + 7, H - h * 0.6, x + Math.sin(i * 7) * 20, H - h); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(179,219,180,.09)'; ctx.lineWidth = 1; ctx.strokeRect(18.5, 18.5, W - 37, H - 37);
    ctx.fillStyle = '#739991'; ctx.font = '11px ui-monospace, monospace'; ctx.textAlign = 'left'; ctx.fillText('NIGHT GARDEN / 01', 34, 42);
    ctx.textAlign = 'right'; ctx.fillText('75 SECONDS TO GLOW', W - 34, 42);
  }
  function renderEntity(e, t, selected, dangerous) {
    const active = L.isActive(game, e), bornFade = Math.min(1, Math.max(0.12, (game.time - e.born) / (e.type === 'ember' ? 0.6 : 0.3)));
    ctx.save(); ctx.translate(e.x, e.y); ctx.globalAlpha = bornFade;
    if (e.type === 'ember') {
      const pulse = reduced.matches ? 1 : 0.92 + Math.sin(t * 2 + e.phase) * 0.08;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 23); glow.addColorStop(0, 'rgba(240,123,96,.24)'); glow.addColorStop(1, 'rgba(240,123,96,0)'); circle(0, 0, 24 * pulse, glow);
      ctx.rotate(Math.PI / 4); ctx.strokeStyle = active ? C.ember : '#967e73'; ctx.lineWidth = 2; ctx.strokeRect(-10, -10, 20, 20); ctx.rotate(-Math.PI / 4);
      ctx.lineCap = 'round'; ctx.lineWidth = 3.5; ctx.strokeStyle = active ? '#ffd1aa' : '#967e73'; ctx.beginPath(); ctx.moveTo(-4.7, -4.7); ctx.lineTo(4.7, 4.7); ctx.moveTo(4.7, -4.7); ctx.lineTo(-4.7, 4.7); ctx.stroke();
      if (dangerous) { ctx.strokeStyle = C.ember; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 23, 0, Math.PI * 2); ctx.stroke(); }
    } else {
      const pulse = reduced.matches ? 1 : 0.88 + Math.sin(t * 3 + e.phase) * 0.12;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, selected ? 33 : 24); glow.addColorStop(0, selected ? 'rgba(213,243,162,.45)' : 'rgba(204,234,157,.25)'); glow.addColorStop(1, 'rgba(183,224,139,0)'); circle(0, 0, (selected ? 33 : 24) * pulse, glow);
      ctx.rotate(reduced.matches ? 0 : Math.sin(t * 0.7 + e.phase) * 0.3);
      ctx.fillStyle = 'rgba(185,225,175,.52)'; ctx.beginPath(); ctx.ellipse(-5, -2, 7, 3.5, -0.6, 0, Math.PI * 2); ctx.ellipse(5, -2, 7, 3.5, 0.6, 0, Math.PI * 2); ctx.fill();
      circle(0, 0, 5.8, selected ? '#f3ffca' : C.light); circle(-1, -1.5, 2, '#ffffff');
      if (selected) { ctx.strokeStyle = C.light; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.restore();
  }
  function previewText(p) {
    if (p.reason === 'too-long') return 'Thread is full. Draw a smaller loop.';
    if (p.reason === 'crossed') return 'Uncross your thread for one simple loop.';
    if (p.embers.length) return 'Ember inside! Keep the X outside your loop.';
    if (p.lights.length && p.valid) return p.lights.length + ' lights inside · release for +' + fmt(p.points);
    return 'Draw around the bright centers. Release to close.';
  }
  function render(dt) {
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0); ctx.globalAlpha = 1;
    const t = game.time;
    renderBackground(t);
    preview = stroke.length > 2 ? L.preview(game, stroke) : null;
    if (stroke.length > 1) {
      const danger = preview && preview.embers.length > 0, invalid = preview && !preview.valid && preview.reason !== 'too-small';
      const color = danger ? C.ember : invalid ? C.gold : C.mint;
      const outline = preview && preview.polygon.length > 2 ? preview.polygon : stroke;
      trace(outline); ctx.closePath(); ctx.fillStyle = danger ? 'rgba(239,146,126,.13)' : 'rgba(166,228,200,.065)'; ctx.fill('evenodd');
      trace(stroke); ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = color; ctx.shadowBlur = reduced.matches ? 0 : 9; ctx.shadowColor = color; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.setLineDash([7, 9]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(outline[outline.length - 1].x, outline[outline.length - 1].y); ctx.lineTo(outline[0].x, outline[0].y); ctx.stroke(); ctx.setLineDash([]);
      circle(stroke[0].x, stroke[0].y, 4.5, color);
      const fraction = Math.min(1, (preview ? preview.perimeter : L.pathLength(stroke)) / L.MAX_PERIMETER); $('thread-fill').style.width = (fraction * 100).toFixed(1) + '%'; $('thread-fill').style.background = color;
      $('thread-label').textContent = fraction >= 1 ? 'Thread full · go smaller' : Math.round((1 - fraction) * 100) + '% thread left';
      if (preview) say(previewText(preview));
    }
    game.entities.forEach(function (e) { renderEntity(e, t, preview && preview.lights.some(function (x) { return x.id === e.id; }), preview && preview.embers.some(function (x) { return x.id === e.id; })); });
    if (flash) { flash.age += dt; ctx.globalAlpha = Math.max(0, 1 - flash.age / 0.42) * 0.2; trace(flash.line); ctx.closePath(); ctx.fillStyle = flash.color; ctx.fill('evenodd'); ctx.globalAlpha = 1; if (flash.age > 0.42) flash = null; }
    rings = rings.filter(function (r) { r.age += dt; if (r.age > 0.5) return false; if (!reduced.matches) { ctx.globalAlpha = (1 - r.age / 0.5) * 0.6; ctx.lineWidth = 1.8; ctx.strokeStyle = r.color; ctx.beginPath(); ctx.arc(r.x, r.y, 15 + r.age * 160, 0, Math.PI * 2); ctx.stroke(); } return true; }); ctx.globalAlpha = 1;
    particles = particles.filter(function (p) { p.age += dt; if (p.age > 0.6) return false; p.x += p.vx * dt; p.y += p.vy * dt; ctx.globalAlpha = 1 - p.age / 0.6; circle(p.x, p.y, 1.5, p.color); return true; }); ctx.globalAlpha = 1;
    labels = labels.filter(function (l) { l.age += dt; if (l.age > 1) return false; ctx.globalAlpha = Math.min(1, (1 - l.age) * 3); const y = l.y - 18 - (reduced.matches ? 0 : l.age * 28); ctx.textAlign = 'center'; ctx.fillStyle = l.color; ctx.font = '600 35px system-ui, sans-serif'; ctx.fillText(l.text, Math.max(90, Math.min(W - 90, l.x)), Math.max(95, y)); ctx.font = '11px ui-monospace, monospace'; ctx.fillText(l.sub, Math.max(130, Math.min(W - 130, l.x)), Math.max(115, y + 20)); return true; }); ctx.globalAlpha = 1;
    if (keyboard && (phase === 'ready' || phase === 'playing')) { ctx.strokeStyle = '#f1ead5'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(cursor.x, cursor.y, 10, 0, Math.PI * 2); ctx.moveTo(cursor.x - 17, cursor.y); ctx.lineTo(cursor.x - 6, cursor.y); ctx.moveTo(cursor.x + 6, cursor.y); ctx.lineTo(cursor.x + 17, cursor.y); ctx.moveTo(cursor.x, cursor.y - 17); ctx.lineTo(cursor.x, cursor.y - 6); ctx.moveTo(cursor.x, cursor.y + 6); ctx.lineTo(cursor.x, cursor.y + 17); ctx.stroke(); }
  }
  function tick(now) {
    const dt = lastFrame ? Math.min(0.05, Math.max(0, (now - lastFrame) / 1000)) : 0; lastFrame = now;
    if ((phase === 'playing' || phase === 'ready') && keyboard && keys.size) {
      const dx = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0), dy = (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0);
      const n = Math.hypot(dx, dy) || 1; cursor.x = Math.max(12, Math.min(W - 12, cursor.x + dx / n * 350 * dt)); cursor.y = Math.max(50, Math.min(H - 12, cursor.y + dy / n * 350 * dt)); if (stroke.length) extend({ x: cursor.x, y: cursor.y });
    }
    if (phase === 'playing') { L.step(game, dt); if (game.ended) finish(); updateHud(); }
    render(phase === 'paused' || phase === 'help' ? 0 : dt);
    requestAnimationFrame(tick);
  }
  soundButton(); storageNote(); refreshMode(); updateHud(); resize(); requestAnimationFrame(tick);
})();
