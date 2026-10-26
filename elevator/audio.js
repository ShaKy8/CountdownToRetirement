/* Web Audio only: original synth patches and a quiet eight-note espionage loop. */
(function () {
  'use strict';
  class Sound {
    constructor() { this.ctx = null; this.muted = false; this.music = false; this.beat = 0; this.next = 0; }
    unlock() {
      try {
        if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : .16; this.master.connect(this.ctx.destination); }
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      } catch { /* Audio unavailable: the game still works. */ }
    }
    mute(value) { this.muted = value; if (this.ctx) this.master.gain.setTargetAtTime(value ? 0 : .16, this.ctx.currentTime, .015); }
    tone(freq, duration = .1, type = 'square', volume = .2, slide = 0, delay = 0) {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = type;
      o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + duration);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volume, t + .005); g.gain.exponentialRampToValueAtTime(.001, t + duration);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + duration + .01); o.onended = () => { o.disconnect(); g.disconnect(); };
    }
    event(type) {
      const t = (...args) => this.tone(...args);
      if (type === 'shot') t(210, .07, 'sawtooth', .25, 70);
      else if (type === 'enemyShot') t(145, .08, 'square', .13, 55);
      else if (type === 'jump') t(170, .15, 'triangle', .3, 470);
      else if (type === 'kill') { t(110, .1, 'sawtooth', .23, 40); t(440, .08, 'triangle', .2, 220, .05); }
      else if (type === 'hurt') { t(98, .24, 'sawtooth', .35, 35); t(103, .25, 'square', .2, 39); }
      else if (type === 'document' || type === 'heal') [440, 554, 659, 880].forEach((f, i) => t(f, .17, 'triangle', .45, 0, i * .075));
      else if (type === 'ding') { t(740, .2, 'sine', .4); t(988, .3, 'sine', .18, 0, .12); }
      else if (type === 'lift' || type === 'call') t(88, .3, 'triangle', .25, 122);
      else if (type === 'glass') [1200, 1850, 2400].forEach((f, i) => t(f, .13, 'triangle', .15, 400, i * .04));
      else if (type === 'escaped') [330, 440, 554, 659, 880, 1109].forEach((f, i) => t(f, .28, 'triangle', .4, 0, i * .12));
      else if (type === 'gameover') [220, 196, 164, 110].forEach((f, i) => t(f, .4, 'triangle', .4, 0, i * .18));
    }
    tick(playing) {
      if (!this.ctx || this.muted || !playing) { this.next = 0; return; }
      const now = this.ctx.currentTime;
      if (now >= this.next) {
        const notes = [82.41, 0, 82.41, 98, 110, 0, 98, 73.42, 82.41, 0, 123.47, 110, 98, 0, 73.42, 0];
        const n = notes[this.beat % notes.length]; if (n) this.tone(n, .18, 'triangle', .24);
        if (this.beat % 4 === 2) this.tone(660, .025, 'triangle', .075, 80);
        this.beat++; this.next = now + .25;
      }
    }
  }
  window.ElevatorSound = Sound;
})();
