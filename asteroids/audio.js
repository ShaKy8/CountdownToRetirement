/* Original, gesture-unlocked Web Audio effects. Silence is a valid fallback. */
(function () {
  'use strict';
  let ctx, master, muted = false, lastShot = 0;
  function unlock() {
    try {
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = muted ? 0 : 0.22; master.connect(ctx.destination); }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    } catch (_) { /* Audio unavailable; the game remains playable. */ }
  }
  function tone(from, to, duration, type = 'sine', volume = 0.3, delay = 0) {
    if (!ctx || muted || ctx.state !== 'running') return;
    try {
      const t = ctx.currentTime + delay, oscillator = ctx.createOscillator(), gain = ctx.createGain();
      oscillator.type = type; oscillator.frequency.setValueAtTime(from, t); oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + duration);
      gain.gain.setValueAtTime(0.001, t); gain.gain.exponentialRampToValueAtTime(volume, t + 0.008); gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      oscillator.connect(gain); gain.connect(master); oscillator.start(t); oscillator.stop(t + duration + 0.02);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch (_) { /* Device interrupted. */ }
  }
  function event(e) {
    if (e.type === 'shot' && (!ctx || ctx.currentTime - lastShot > 0.08)) { lastShot = ctx ? ctx.currentTime : 0; tone(1100, 220, 0.09, 'triangle', 0.18); }
    if (e.type === 'hit') { tone(110 + e.size * 20, 28, 0.16 + e.size * 0.07, 'sawtooth', 0.22); tone(230, 55, 0.12, 'triangle', 0.28); }
    if (e.type === 'death') { tone(180, 24, 0.65, 'sawtooth', 0.3); tone(95, 30, 0.8, 'triangle', 0.45); }
    if (e.type === 'wave' || e.type === 'clear' || e.type === 'life') [220, 330, 440].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.23, i * 0.1));
  }
  window.StarfallAudio = { unlock, event, setMuted(value) { muted = value; if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 0.22, ctx.currentTime, 0.02); } };
})();
