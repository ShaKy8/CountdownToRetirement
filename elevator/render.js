/* Hand-drawn canvas pixel art. All shapes, sprites, lighting and effects are original. */
(function () {
  'use strict';
  const E = window.Elevator86, C = { mint: '#78e8cf', gold: '#f5ce72', red: '#ec796a', dark: '#101b29' };
  class Renderer {
    constructor(canvas) { this.canvas = canvas; this.c = canvas.getContext('2d', { alpha: false }); this.cam = { x: 0, y: 0 }; this.w = 768; this.h = 500; this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; }
    resize() {
      const r = this.canvas.getBoundingClientRect(); this.w = r.width < 600 ? 384 : 768; this.h = Math.round(this.w * r.height / Math.max(1, r.width));
      this.canvas.width = this.w; this.canvas.height = this.h; this.c.imageSmoothingEnabled = false;
    }
    rect(x, y, w, h, color) { this.c.fillStyle = color; this.c.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h)); }
    text(text, x, y, size = 10, color = C.gold, align = 'left') { this.c.fillStyle = color; this.c.font = `bold ${size}px monospace`; this.c.textAlign = align; this.c.fillText(text, Math.round(x), Math.round(y)); }
    draw(s, dt = 1 / 60) {
      const c = this.c, p = s.player, maxY = Math.max(0, s.worldH - this.h);
      const tx = E.clamp(p.x - this.w / 2, 0, E.W - this.w), ty = E.clamp(p.y - this.h * .48, 0, maxY);
      const ease = this.reduced ? 1 : Math.min(1, dt * 10);
      this.cam.x += (tx - this.cam.x) * ease; this.cam.y += (ty - this.cam.y) * ease;
      this.rect(0, 0, this.w, this.h, '#101b2b');
      // Distant city moves more slowly than the tower.
      for (let i = 0; i < 18; i++) {
        const x = i * 63 - (this.cam.x * .18 % 63), y = 75 + ((i * 43) % 115) - this.cam.y * .12;
        this.rect(x, y, 47, this.h, i % 2 ? '#20323f' : '#1a2a39');
        for (let row = 0; row < 18; row++) for (let col = 0; col < 3; col++) if ((i + row * 3 + col) % 4) this.rect(x + 7 + col * 12, y + 12 + row * 20, 5, 7, '#36505a');
      }
      c.save(); c.translate(-Math.round(this.cam.x), -Math.round(this.cam.y));
      if (s.shake > 0 && !this.reduced) c.translate(Math.round(Math.sin(s.time * 123) * 3), 0);
      this.rect(25, 77, 718, s.worldH - 77, '#2d424a');
      // Roof and illuminated identity plate.
      this.rect(22, 70, 724, 10, '#75867d'); this.rect(35, 80, 698, 18, '#182b35');
      this.rect(297, 38, 175, 32, '#344852'); this.rect(302, 42, 165, 24, '#16252d'); this.text('HELIOS  /  86', 384, 59, 16, C.gold, 'center');
      this.rect(59, 33, 47, 37, '#263945'); this.rect(65, 27, 34, 6, '#52656a');
      for (let i = 0; i < 5; i++) this.rect(63, 36 + i * 6, 36, 2, '#435963');
      this.rect(687, 18, 3, 52, '#4c676b'); this.rect(678, 29, 22, 2, '#4c676b'); this.rect(690, 14, 4, 4, C.red);
      for (let f = 0; f < s.floors; f++) {
        const y = E.floorY(f); if (y < this.cam.y - 40 || y - 112 > this.cam.y + this.h) continue;
        const dark = s.lights[f].broken;
        this.rect(35, y - 72, 698, 72, dark ? '#27363e' : f % 2 ? '#465455' : '#3c5056');
        this.rect(35, y - 100, 698, 28, dark ? '#1c2c36' : '#2b3c45');
        this.rect(35, y - 15, 698, 15, '#263c46');
        for (let x = 42; x < 730; x += 56) { this.rect(x, y - 51, 1, 27, '#506065'); this.rect(x + 1, y - 38, 53, 1, '#3b4b50'); }
        // Recessed blue windows and mullions.
        for (const x of [156, 418, 574]) {
          this.rect(x, y - 68, 36, 44, '#192c3c'); this.rect(x + 3, y - 65, 30, 36, '#254757');
          this.rect(x + 16, y - 65, 3, 36, '#172d3a'); this.rect(x + 3, y - 48, 30, 3, '#172d3a');
          this.rect(x + 5, y - 62, 8, 3, '#3c6470');
        }
        // Secret doors are red; ordinary doors are slate and clearly unmarked.
        for (const x of [98, 365, 664]) {
          const d = s.docs.find(d => d.floor === f && d.x === x);
          this.rect(x - 24, y - 66, 48, 66, '#172c36'); this.rect(x - 21, y - 63, 42, 62, d ? d.taken ? '#314f4b' : '#a9534b' : '#31414c');
          this.rect(x - 18, y - 60, 3, 55, d && !d.taken ? '#cf7765' : '#4d6365');
          this.rect(x + 12, y - 28, 4, 4, C.gold);
          this.rect(x - 14, y - 55, 28, 12, d && !d.taken ? '#542f34' : '#22343c');
          this.text(d ? d.taken ? 'OK' : 'FILE' : `${s.floors - f}0${x % 3 + 1}`, x, y - 46, 8, d ? C.gold : '#9eb2b1', 'center');
          if (d && !d.taken) {
            this.rect(x - 5, y - 35, 10, 12, '#f3dab1'); this.rect(x - 2, y - 32, 6, 1, '#9e6a5b'); this.rect(x - 2, y - 29, 6, 1, '#9e6a5b');
            if (d.progress) { this.rect(x - 22, y - 77, 44, 5, '#172733'); this.rect(x - 22, y - 77, 44 * d.progress / .55, 5, C.gold); }
          }
        }
        // Lift shafts, safety grate floor, and call indicators.
        for (const lift of s.lifts) {
          this.rect(lift.x - 39, y - 104, 78, 104, '#162b37');
          this.rect(lift.x - 34, y - 104, 3, 104, '#4a6269'); this.rect(lift.x + 32, y - 104, 3, 104, '#4a6269');
          this.rect(lift.x - 5, y - 104, 2, 104, '#304550'); this.rect(lift.x + 5, y - 104, 2, 104, '#304550');
          this.rect(lift.x - 34, y - 3, 68, 3, '#72817b');
          for (let x = lift.x - 30; x < lift.x + 30; x += 8) this.rect(x, y - 3, 3, 3, '#233d46');
          this.rect(lift.x + 41, y - 37, 9, 19, '#172a35'); this.rect(lift.x + 44, y - 33, 3, 3, C.mint); this.rect(lift.x + 44, y - 25, 3, 3, C.gold);
        }
        this.rect(28, y, 712, 8, '#8a9180'); this.rect(28, y + 8, 712, 6, '#182e3a'); this.rect(35, y + 1, 698, 2, '#b5b39a');
        this.rect(29, y - 90, 22, 15, '#1a2d36'); this.text(String(s.floors - f).padStart(2, '0'), 40, y - 79, 10, '#bbc7b5', 'center');
        const item = s.supplies.find(item => item.floor === f);
        if (item && !item.taken) { this.rect(item.x - 13, y - 31, 26, 28, '#b89455'); this.rect(item.x - 10, y - 28, 20, 22, '#e9c171'); this.rect(item.x - 2, y - 25, 5, 16, '#45625d'); this.rect(item.x - 7, y - 20, 15, 5, '#45625d'); }
      }
      // Cars move over the shaft rails. A bright platform is always the actual car.
      for (const l of s.lifts) {
        this.rect(l.x - 31, l.y - 72, 62, 72, '#44716f'); this.rect(l.x - 27, l.y - 67, 54, 61, '#34514f');
        this.rect(l.x - 24, l.y - 65, 22, 57, '#46736b'); this.rect(l.x + 2, l.y - 65, 22, 57, '#3c635f');
        this.rect(l.x - 31, l.y - 75, 62, 5, C.mint); this.rect(l.x - 34, l.y - 4, 68, 7, '#a3cead');
        this.rect(l.x - 25, l.y - 61, 50, 3, '#81a995'); this.text('↕', l.x, l.y - 42, 16, '#a5d5ba', 'center');
        this.rect(l.x - 13, l.y - 89, 26, 11, '#172b34'); this.text(String(s.floors - l.floor).padStart(2, '0'), l.x, l.y - 80, 9, C.mint, 'center');
      }
      for (const l of s.lights) if (!l.broken) {
        if (!l.falling) { c.fillStyle = '#e4e9af0b'; c.beginPath(); c.moveTo(l.x - 17, l.y); c.lineTo(l.x - 55, l.y + 63); c.lineTo(l.x + 55, l.y + 63); c.lineTo(l.x + 17, l.y); c.fill(); }
        this.rect(l.x - 19, l.y - 6, 38, 4, '#19343e'); this.rect(l.x - 16, l.y - 2, 32, 5, '#e3e8ae');
      }
      // Original midnight-blue getaway coupe.
      const carY = E.floorY(s.floors - 1);
      this.rect(615, carY - 21, 107, 17, '#143443'); this.rect(638, carY - 36, 53, 17, '#39727b');
      this.rect(643, carY - 33, 18, 13, '#8ab8b0'); this.rect(665, carY - 33, 21, 13, '#69a3a5');
      this.rect(611, carY - 14, 115, 6, '#558d91'); this.rect(715, carY - 20, 10, 5, C.gold);
      for (const x of [632, 696]) { this.rect(x - 7, carY - 10, 14, 14, '#0c1823'); this.rect(x - 3, carY - 6, 6, 6, '#839190'); }
      const cleared = s.docs.every(d => d.taken); this.text(cleared ? 'GETAWAY →' : 'ALL FILES REQUIRED', 669, carY - 48, 9, cleared ? C.mint : '#bdc7b9', 'center');
      for (const e of s.enemies) {
        this.agent(e.x, e.y, e.dir, false, e.walk, false, e.aim > 0, e.stun > 0);
        if (e.aim > 0) { this.text('!', e.x, e.y - 47, 14, C.red, 'center'); this.rect(e.x - 12, e.y - 42, 24 * (1 - e.aim / .65), 2, C.red); }
        if (e.stun > 0) this.text('···', e.x, e.y - 43, 12, C.gold, 'center');
      }
      if (s.respawn <= 0 && (p.invul <= 0 || Math.floor(s.time * 12) % 3 !== 0)) this.agent(p.x, p.y, p.dir, true, p.walk, p.crouch, p.fire > .12, false, !p.grounded);
      for (const b of s.bullets) { this.rect(b.x - Math.sign(b.vx) * 8, b.y - 1, 10, 3, b.hostile ? '#ff9984' : '#ffedba'); this.rect(b.x, b.y - 1, 3, 3, '#fff9df'); }
      if (!this.reduced) for (const a of s.particles) this.rect(a.x, a.y, 3, 3, a.color);
      for (const t of s.texts) this.text(t.text, t.x, t.y, 12, t.color, 'center');
      if (s.mode === 'playing' && s.respawn <= 0 && p.grounded && p.riding === null) {
        let label = '';
        const d = s.docs.find(d => !d.taken && d.floor === p.floor && Math.abs(d.x - p.x) < 40);
        const l = s.lifts.find(l => Math.abs(l.x - p.x) < 36);
        if (d) label = 'HOLD ↑ / USE : STEAL'; else if (l) label = l.floor !== p.floor ? '↑ / ↓ : CALL LIFT' : '↑ / ↓ : RIDE';
        if (label) { const x = E.clamp(p.x, this.cam.x + 83, this.cam.x + this.w - 83); this.rect(x - 83, p.y - 103, 166, 18, '#0f202be8'); this.text(label, x, p.y - 91, 9, C.gold, 'center'); }
      }
      c.restore();
      // Screen furniture stays legible while the world scrolls.
      this.rect(9, 9, 121, 25, '#0b1726dc'); this.text(`FILES ${s.docs.filter(d => d.taken).length} / ${s.docs.length}`, 18, 26, 13, C.gold);
      if (s.chain > 1 && s.chainTime > 0) this.text(`CHAIN ×${s.chain}`, this.w - 12, 27, 12, C.mint, 'right');
      else this.text(s.time > s.alarmAt ? 'SECURITY ALERT' : 'HELIOS TOWER', this.w - 12, 26, 10, s.time > s.alarmAt ? C.red : '#afc4bf', 'right');
      if (s.respawn > 0) { this.rect(this.w / 2 - 100, this.h / 2 - 25, 200, 50, '#101f2beb'); this.text('REDEPLOYING…', this.w / 2, this.h / 2 + 5, 16, C.gold, 'center'); }
    }
    agent(x, y, dir, player, walk, crouch, firing, stunned, airborne = false) {
      const c = this.c; c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(dir, 1);
      const coat = player ? '#74cfb6' : '#bc7b85', shadow = player ? '#3c8d83' : '#784c64', skin = '#e9c6a4';
      const leg = walk ? Math.round(Math.sin(walk) * 5) : 0, h = crouch ? 17 : 35;
      this.rect(-10, -2, 22, 3, '#102633');
      if (crouch) { this.rect(-10, -10, 15, 7, shadow); this.rect(1, -7, 13, 6, '#172e3b'); this.rect(-9, -2, 12, 3, '#10212d'); }
      else { this.rect(-7 - leg, -12, 6, 12, '#233b45'); this.rect(3 + leg, -12, 6, airborne ? 8 : 12, '#29414a'); this.rect(-8 - leg, -3, 9, 3, '#0e2530'); this.rect(3 + leg, airborne ? -7 : -3, 11, 3, '#0e2530'); }
      this.rect(-9, -h + 12, 19, crouch ? 10 : 14, coat); this.rect(-9, -h + 12, 5, crouch ? 10 : 14, shadow);
      this.rect(-6, -h + 8, 12, 6, skin); this.rect(-7, -h, 14, 10, skin); this.rect(5, -h + 4, 4, 4, skin);
      this.rect(-8, -h - 2, 16, 5, player ? '#273c46' : '#443344'); this.rect(-9, -h + 1, 6, 6, player ? '#273c46' : '#443344');
      this.rect(0, -h + 4, 9, 3, '#152a35'); this.rect(1, -h + 4, 3, 1, '#b1e0cc');
      this.rect(1, -h + 13, 3, 7, player ? '#e6d8b0' : '#e3b890');
      const armY = crouch ? -12 : -25; this.rect(4, armY, 12, 5, coat); this.rect(13, armY + 1, 5, 4, skin); this.rect(16, armY, 12, 3, '#132936'); this.rect(18, armY + 2, 3, 5, '#1e3541');
      if (firing) { this.rect(28, armY - 1, 6, 5, C.gold); this.rect(31, armY, 6, 3, '#fff3bd'); }
      if (stunned) this.rect(-5, -h + 3, 13, 3, '#78979d'); c.restore();
    }
  }
  window.ElevatorRenderer = Renderer;
})();
