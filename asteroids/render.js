/* Original vector artwork, starfield and lightweight impact effects. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  function make(canvas) {
    const ctx = canvas.getContext('2d'), particles = [], labels = [];
    let shake = 0;
    const stars = Array.from({ length: 120 }, (_, i) => ({ x: ((i * 7919) % 997) / 997, y: ((i * 3571) % 991) / 991, r: i % 5 ? 0.8 : 1.6 }));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    function effect(e) {
      if (e.type !== 'hit' && e.type !== 'death') return;
      if (e.points) labels.push({ x: e.x, y: e.y, text: '+' + e.points, life: 0.7 });
      if (reduced.matches) return;
      shake = e.type === 'death' ? 9 : 2 + e.size;
      const count = e.type === 'death' ? 36 : 9 + e.size * 6;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * TAU, speed = 35 + Math.random() * 160;
        particles.push({ x: e.x, y: e.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.3 + Math.random() * 0.55, color: e.type === 'death' ? '#72f1de' : '#ffc394' });
      }
      if (particles.length > 300) particles.splice(0, particles.length - 300);
    }
    function paint(s, dt, active) {
      const dpr = Math.min(devicePixelRatio || 1, 2), rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width * dpr), h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx.setTransform(w / s.width, 0, 0, h / s.height, 0, 0);
      const bg = ctx.createRadialGradient(s.width * 0.55, s.height * 0.4, 10, s.width / 2, s.height / 2, s.width * 0.8);
      bg.addColorStop(0, '#122332'); bg.addColorStop(1, '#050c15'); ctx.fillStyle = bg; ctx.fillRect(0, 0, s.width, s.height);
      for (const star of stars) { ctx.fillStyle = star.r > 1 ? '#7293a9' : '#395265'; ctx.beginPath(); ctx.arc(star.x * s.width, star.y * s.height, star.r, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = '#223442'; ctx.lineWidth = 1;
      for (const [x, y, sx, sy] of [[18, 18, 1, 1], [s.width - 18, 18, -1, 1], [18, s.height - 18, 1, -1], [s.width - 18, s.height - 18, -1, -1]]) {
        ctx.beginPath(); ctx.moveTo(x, y + sy * 14); ctx.lineTo(x, y); ctx.lineTo(x + sx * 14, y); ctx.stroke();
      }
      ctx.save();
      if (!reduced.matches && active && shake > 0.1) ctx.translate(Math.sin(s.time * 73) * shake, Math.cos(s.time * 61) * shake);
      if (active) shake *= Math.exp(-dt * 12);
      function copies(obj, radius, draw) {
        const xs = [0], ys = [0];
        if (obj.x < radius) xs.push(s.width); if (obj.x > s.width - radius) xs.push(-s.width);
        if (obj.y < radius) ys.push(s.height); if (obj.y > s.height - radius) ys.push(-s.height);
        for (const x of xs) for (const y of ys) { ctx.save(); ctx.translate(obj.x + x, obj.y + y); draw(); ctx.restore(); }
      }
      for (const r of s.rocks) copies(r, r.radius + 3, () => {
        ctx.rotate(r.angle); ctx.lineWidth = 1.8; ctx.strokeStyle = ['#ffc394', '#d9b39b', '#96aabc'][r.size]; ctx.fillStyle = '#182732';
        ctx.beginPath(); r.shape.forEach((n, i) => { const a = TAU * i / r.shape.length, x = Math.cos(a) * r.radius * n, y = Math.sin(a) * r.radius * n; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#42505b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-r.radius * 0.4, -r.radius * 0.2); ctx.lineTo(r.radius * 0.1, -r.radius * 0.4); ctx.lineTo(r.radius * 0.35, r.radius * 0.15); ctx.stroke();
      });
      ctx.shadowColor = '#a1ffe9'; ctx.shadowBlur = reduced.matches ? 0 : 8;
      ctx.strokeStyle = '#bcfff0'; ctx.lineWidth = 2.7;
      for (const b of s.bullets) copies(b, 9, () => { const a = Math.atan2(b.vy, b.vx); ctx.beginPath(); ctx.moveTo(-Math.cos(a) * 8, -Math.sin(a) * 8); ctx.lineTo(0, 0); ctx.stroke(); });
      ctx.shadowBlur = 0;
      const p = s.ship;
      if (p.alive) copies(p, 30, () => {
        if (p.shield > 0) { ctx.strokeStyle = '#397e83'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
        ctx.rotate(p.angle);
        if (p.thrusting && active) { const flame = reduced.matches ? 18 : 18 + Math.sin(s.time * 90) * 7; ctx.fillStyle = '#ffb880'; ctx.beginPath(); ctx.moveTo(-9, -5); ctx.lineTo(-flame - 6, 0); ctx.lineTo(-9, 5); ctx.fill(); ctx.fillStyle = '#fff3cf'; ctx.fillRect(-17, -2, 8, 4); }
        ctx.shadowColor = '#73efda'; ctx.shadowBlur = reduced.matches ? 0 : 9; ctx.strokeStyle = '#a4ffea'; ctx.fillStyle = '#123d42'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(17, 0); ctx.lineTo(-12, -11); ctx.lineTo(-7, 0); ctx.lineTo(-12, 11); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
      });
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; if (active) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
        if (p.life <= 0) { particles.splice(i, 1); continue; } ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 2.5, 2.5);
      }
      ctx.globalAlpha = 1;
      for (let i = labels.length - 1; i >= 0; i--) {
        const l = labels[i]; if (active) { l.life -= dt; if (!reduced.matches) l.y -= dt * 25; } if (l.life <= 0) { labels.splice(i, 1); continue; }
        ctx.fillStyle = '#ffd1a3'; ctx.font = '14px monospace'; ctx.textAlign = 'center'; ctx.fillText(l.text, l.x, l.y);
      }
      ctx.restore();
      if (active && (s.banner > 0 || s.waveDelay > 0 || !p.alive)) {
        const text = !p.alive ? 'RE-ENTRY INCOMING' : s.waveDelay ? 'SECTOR CLEAR' : 'WAVE ' + String(s.wave).padStart(2, '0');
        ctx.textAlign = 'center'; ctx.fillStyle = '#c2e4e8'; ctx.font = '600 21px monospace'; ctx.fillText(text, s.width / 2, s.height * 0.18);
        ctx.font = '13px monospace'; ctx.fillStyle = '#99aebb'; ctx.fillText(s.waveDelay ? 'Catch your breath. More are on the way.' : 'Keep moving. Make some space.', s.width / 2, s.height * 0.18 + 26);
      }
    }
    return { paint, effect, clear() { particles.length = 0; labels.length = 0; shake = 0; } };
  }
  window.StarfallRender = { make };
})();
