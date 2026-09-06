/**
 * Canvas chart primitives for the console.
 *
 * Conventions that hold across every chart here:
 *  - One measure per plot area. Temperature and precipitation share an
 *    x-axis but never a y-axis; they are stacked panels, not a dual axis.
 *  - Categorical series use SERIES in fixed order and are never cycled.
 *  - Status colors (lime/amber/orange/red) are reserved for state and always
 *    ship beside a text label, never as the only signal.
 *  - Grid and axes are recessive; the data is the brightest thing drawn.
 *  - Every plot gets a hover crosshair and a readout.
 */

import { clamp, lerp } from './lib/util.js';

/* ---------------------------------------------------------------- palette */

// Fixed categorical order. Lime is deliberately absent: against amber it
// falls to dE 6.6 under deuteranopia, so it is reserved for status, where it
// always appears with a word next to it.
export const SERIES = ['#00eaff', '#ff2d8f', '#ffb02e', '#a75cff', '#8ab6ff'];
export const STATUS = { good: '#6dff4a', warn: '#ffe14e', serious: '#ffa040', crit: '#ff3b57' };
export const INK = '#d6ecfa';
export const DIM = '#7b97ad';
export const FAINT = '#3a5064';
export const GHOST = 'rgba(255,255,255,.055)';
export const SURFACE = '#03050b';

export const MONO = "500 10px 'JetBrains Mono', ui-monospace, monospace";
export const MONO_SM = "500 9px 'JetBrains Mono', ui-monospace, monospace";
export const UI_LBL = "600 9px 'Chakra Petch', system-ui, sans-serif";

/** Temperature -> color. A single perceptual ramp, cold blue to hot magenta. */
export function tempColor(f) {
  if (f == null) return DIM;
  const stops = [
    [-20, '#7b5cff'], [10, '#4aa8ff'], [32, '#00eaff'], [50, '#3ce0c0'],
    [65, '#8dea4a'], [78, '#ffe14e'], [88, '#ffa040'], [100, '#ff3b57'], [115, '#ff2d8f'],
  ];
  if (f <= stops[0][0]) return stops[0][1];
  if (f >= stops.at(-1)[0]) return stops.at(-1)[1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i], [b, cb] = stops[i + 1];
    if (f >= a && f <= b) return mixHex(ca, cb, (f - a) / (b - a));
  }
  return DIM;
}

export function mixHex(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const p = pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(t, 0, 1))));
  return `#${p.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function alpha(hex, a) {
  const p = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${p[0]},${p[1]},${p[2]},${a})`;
}

/* ------------------------------------------------------------------ mount */

/**
 * Bind a draw function to a canvas: handles device-pixel ratio, resize, and
 * pointer tracking. `draw(ctx, w, h, hover)` is called whenever anything
 * that affects the picture changes.
 */
export function mount(canvas, draw, { onPick } = {}) {
  const ctx = canvas.getContext('2d');
  const chart = { canvas, ctx, hover: null, data: null, draw, dirty: true };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw; canvas.height = ch;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    chart.w = w; chart.h = h;
    chart.render();
  };

  chart.render = () => {
    if (!chart.w || !chart.h) return;
    ctx.clearRect(0, 0, chart.w, chart.h);
    try { draw(ctx, chart.w, chart.h, chart.hover, chart.data); }
    catch (e) { console.error('[chart]', e.stack || e); }
  };

  chart.update = (data) => { chart.data = data; chart.render(); };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const move = (e) => {
    const r = canvas.getBoundingClientRect();
    chart.hover = { x: e.clientX - r.left, y: e.clientY - r.top };
    chart.render();
  };
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerleave', () => { chart.hover = null; chart.render(); });
  if (onPick) {
    canvas.addEventListener('pointerdown', (e) => {
      const r = canvas.getBoundingClientRect();
      onPick({ x: e.clientX - r.left, y: e.clientY - r.top, w: chart.w, h: chart.h }, e);
    });
    canvas.style.cursor = 'crosshair';
  }

  chart.destroy = () => { ro.disconnect(); canvas.removeEventListener('pointermove', move); };
  resize();
  return chart;
}

/* ------------------------------------------------------------- primitives */

/** Neon stroke: a wide soft pass under a crisp 2px pass. */
export function neonLine(ctx, pts, color, { width = 2, glow = 12, closed = false } = {}) {
  if (pts.length < 2) return;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (closed) ctx.closePath();
  };
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (glow) {
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = glow;
    ctx.strokeStyle = alpha(color, 0.55); ctx.lineWidth = width;
    path(); ctx.stroke();
    ctx.restore();
  }
  ctx.strokeStyle = color; ctx.lineWidth = width;
  path(); ctx.stroke();
}

/** Smooth path through points using Catmull-Rom -> bezier. */
export function smoothPath(ctx, pts) {
  if (pts.length < 2) return;
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    ctx.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
      p2[0], p2[1]);
  }
}

/** Recessive horizontal gridlines with right-edge value labels. */
export function gridY(ctx, box, ticks, fmt = String, { color = GHOST, label = true } = {}) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 1;
  ctx.font = MONO_SM; ctx.fillStyle = FAINT;
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const { v, y } of ticks) {
    ctx.beginPath();
    ctx.moveTo(box.x, Math.round(y) + 0.5);
    ctx.lineTo(box.x + box.w, Math.round(y) + 0.5);
    ctx.stroke();
    if (label) ctx.fillText(fmt(v), box.x + box.w - 2, y - 5);
  }
  ctx.restore();
}

/** A bar with a 4px rounded far end, anchored to the baseline. */
export function capBar(ctx, x, yTop, w, yBase, color, r = 3) {
  const h = Math.abs(yBase - yTop);
  if (h < 0.4) return;
  const rr = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, yBase);
  ctx.lineTo(x, yTop + rr);
  ctx.quadraticCurveTo(x, yTop, x + rr, yTop);
  ctx.lineTo(x + w - rr, yTop);
  ctx.quadraticCurveTo(x + w, yTop, x + w, yTop + rr);
  ctx.lineTo(x + w, yBase);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/** Small caps label, used for axis titles and panel names inside plots. */
export function tag(ctx, x, y, text, color = FAINT, align = 'left') {
  ctx.save();
  ctx.font = UI_LBL; ctx.fillStyle = color;
  ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.letterSpacing = '1.4px';
  ctx.fillText(text.toUpperCase(), x, y);
  ctx.restore();
}

/** Floating readout box. Flips side near the right edge so it never clips. */
export function tooltip(ctx, x, y, lines, w, h, accent = '#00eaff') {
  const pad = 7, lh = 13;
  ctx.save();
  ctx.font = MONO;
  const tw = Math.max(...lines.map((l) => ctx.measureText(l.replace(/\|/g, '  ')).width)) + pad * 2;
  const th = lines.length * lh + pad * 2 - 2;
  let bx = x + 12, by = clamp(y - th - 10, 4, h - th - 4);
  if (bx + tw > w - 4) bx = x - tw - 12;
  bx = clamp(bx, 4, Math.max(4, w - tw - 4));

  ctx.fillStyle = 'rgba(4,9,19,.94)';
  ctx.strokeStyle = alpha(accent, 0.5);
  ctx.lineWidth = 1;
  const c = 5;
  ctx.beginPath();
  ctx.moveTo(bx, by + c); ctx.lineTo(bx + c, by);
  ctx.lineTo(bx + tw, by); ctx.lineTo(bx + tw, by + th - c);
  ctx.lineTo(bx + tw - c, by + th); ctx.lineTo(bx, by + th);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.textBaseline = 'top';
  lines.forEach((l, i) => {
    const [a, b] = l.split('|');
    ctx.textAlign = 'left';
    ctx.fillStyle = i === 0 ? accent : DIM;
    ctx.fillText(a, bx + pad, by + pad + i * lh);
    if (b != null) {
      ctx.textAlign = 'right';
      ctx.fillStyle = i === 0 ? accent : INK;
      ctx.fillText(b, bx + tw - pad, by + pad + i * lh);
    }
  });
  ctx.restore();
}

/** Inline legend chip row. Present whenever two or more series are drawn. */
export function legend(ctx, x, y, items, { align = 'left' } = {}) {
  ctx.save();
  ctx.font = UI_LBL;
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '1.2px';
  let total = 0;
  const widths = items.map((it) => {
    const w = ctx.measureText(it.label.toUpperCase()).width + 16;
    total += w; return w;
  });
  let cx = align === 'right' ? x - total : x;
  items.forEach((it, i) => {
    ctx.fillStyle = it.color;
    if (it.dash) {
      ctx.strokeStyle = it.color; ctx.lineWidth = 2;
      ctx.setLineDash([3, 2]);
      ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx + 9, y); ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.fillRect(cx, y - 3, 9, 3);
    }
    ctx.fillStyle = DIM;
    ctx.textAlign = 'left';
    ctx.fillText(it.label.toUpperCase(), cx + 13, y);
    cx += widths[i];
  });
  ctx.restore();
}

/** Shade the hours between sunset and sunrise across a time axis. */
export function nightBands(ctx, box, days, xOf, tz) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.30)';
  for (const d of days) {
    if (!d.sunset || !d.sunrise) continue;
    // Night runs from this day's sunset to the next day's sunrise.
    const next = days[days.indexOf(d) + 1];
    const a = xOf(d.sunset);
    const b = next?.sunrise ? xOf(next.sunrise) : box.x + box.w;
    const x0 = clamp(a, box.x, box.x + box.w);
    const x1 = clamp(b, box.x, box.x + box.w);
    if (x1 > x0) ctx.fillRect(x0, box.y, x1 - x0, box.h);
  }
  ctx.restore();
}

/** Vertical marker with a label flag, used for "now" and the cursor. */
export function marker(ctx, x, box, color, label, { dash = null, flagTop = true } = {}) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 1;
  if (dash) ctx.setLineDash(dash);
  ctx.shadowColor = color; ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(Math.round(x) + 0.5, box.y);
  ctx.lineTo(Math.round(x) + 0.5, box.y + box.h);
  ctx.stroke();
  ctx.restore();
  if (label) {
    ctx.save();
    ctx.font = UI_LBL; ctx.letterSpacing = '1.2px';
    const w = ctx.measureText(label).width + 8;
    const bx = clamp(x - w / 2, box.x, box.x + box.w - w);
    const by = flagTop ? box.y : box.y + box.h - 11;
    ctx.fillStyle = color;
    ctx.fillRect(bx, by, w, 11);
    ctx.fillStyle = SURFACE;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + w / 2, by + 6);
    ctx.restore();
  }
}

/* ------------------------------------------------------------- nice ticks */

/** Human-friendly axis steps (1/2/5 x 10^n) covering [lo, hi]. */
export function niceTicks(lo, hi, count = 4) {
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo === hi) return [lo || 0];
  const span = hi - lo;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}

/* ============================================================ radial gauge */

/**
 * A 240-degree arc gauge. `bands` optionally paints qualitative zones behind
 * the value arc (UV, AQI); each band carries its own label so the color is
 * never the only cue.
 */
export function gauge(ctx, cx, cy, r, {
  value, min = 0, max = 100, color = SERIES[0], label = '', unit = '',
  bands = null, sub = '', decimals = 0, ticks = 5,
}) {
  const A0 = Math.PI * 0.75, A1 = Math.PI * 2.25;
  const frac = value == null ? 0 : clamp((value - min) / (max - min), 0, 1);
  const aVal = A0 + (A1 - A0) * frac;

  ctx.save();
  ctx.lineCap = 'butt';

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, A0, A1);
  ctx.strokeStyle = 'rgba(255,255,255,.07)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Qualitative bands
  if (bands) {
    for (const b of bands) {
      const f0 = clamp((b.from - min) / (max - min), 0, 1);
      const f1 = clamp((b.to - min) / (max - min), 0, 1);
      if (f1 <= f0) continue;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 6, A0 + (A1 - A0) * f0, A0 + (A1 - A0) * f1);
      ctx.strokeStyle = alpha(b.color, 0.55);
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  // Tick marks
  ctx.strokeStyle = 'rgba(255,255,255,.14)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= ticks; i++) {
    const a = A0 + (A1 - A0) * (i / ticks);
    const c = Math.cos(a), s = Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(cx + c * (r - 5), cy + s * (r - 5));
    ctx.lineTo(cx + c * (r - 10), cy + s * (r - 10));
    ctx.stroke();
  }

  // Value arc
  if (value != null && frac > 0.001) {
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, r, A0, aVal);
    ctx.strokeStyle = color; ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // Needle tip
    const c = Math.cos(aVal), s = Math.sin(aVal);
    ctx.beginPath();
    ctx.arc(cx + c * r, cy + s * r, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = color; ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Readout
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  ctx.font = `700 ${Math.round(r * 0.62)}px 'JetBrains Mono', monospace`;
  ctx.fillText(value == null ? '--' : value.toFixed(decimals), cx, cy + r * 0.18);
  if (unit) {
    ctx.font = MONO_SM; ctx.fillStyle = DIM;
    ctx.fillText(unit, cx, cy + r * 0.46);
  }
  if (label) {
    ctx.font = UI_LBL; ctx.fillStyle = FAINT;
    ctx.letterSpacing = '1.4px';
    ctx.fillText(label.toUpperCase(), cx, cy + r + 15);
  }
  if (sub) {
    ctx.font = UI_LBL; ctx.fillStyle = color;
    ctx.letterSpacing = '1.2px';
    ctx.fillText(sub.toUpperCase(), cx, cy - r * 0.42);
  }
  ctx.restore();
}

/* ============================================================== sparkline */

export function spark(ctx, box, values, {
  color = SERIES[0], fill = true, width = 1.8, min = null, max = null, glow = 8,
}) {
  const vals = values.filter((v) => v != null);
  if (vals.length < 2) return;
  const lo = min ?? Math.min(...vals), hi = max ?? Math.max(...vals);
  const span = hi - lo || 1;
  const pts = values.map((v, i) => [
    box.x + (i / (values.length - 1)) * box.w,
    box.y + box.h - ((v ?? lo) - lo) / span * box.h,
  ]);

  if (fill) {
    ctx.save();
    ctx.beginPath();
    smoothPath(ctx, pts);
    ctx.lineTo(pts.at(-1)[0], box.y + box.h);
    ctx.lineTo(pts[0][0], box.y + box.h);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
    g.addColorStop(0, alpha(color, 0.34));
    g.addColorStop(1, alpha(color, 0));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
  ctx.beginPath();
  smoothPath(ctx, pts);
  ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
  return pts;
}

/* ============================================================== bar series */

export function bars(ctx, box, values, {
  color = SERIES[0], max = null, gap = 2, colorFn = null, baseline = 'bottom',
}) {
  const hi = max ?? Math.max(...values.filter((v) => v != null), 1);
  const n = values.length;
  const bw = Math.max(1, box.w / n - gap);
  const base = box.y + box.h;
  values.forEach((v, i) => {
    if (v == null) return;
    const x = box.x + (i * box.w) / n;
    const h = clamp(v / hi, 0, 1) * box.h;
    capBar(ctx, x, base - h, bw, base, colorFn ? colorFn(v, i) : color);
  });
}

/* ========================================================== compass / rose */

/** Wind direction dial with a gust ring. */
export function windRose(ctx, cx, cy, r, { dir, speed, gust, color = SERIES[0] }) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.09)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

  ctx.font = UI_LBL; ctx.fillStyle = FAINT;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const [lab, a] of [['N', -90], ['E', 0], ['S', 90], ['W', 180]]) {
    const rad = a * Math.PI / 180;
    ctx.fillText(lab, cx + Math.cos(rad) * (r + 8), cy + Math.sin(rad) * (r + 8));
  }
  for (let i = 0; i < 16; i++) {
    const a = (i * 22.5 - 90) * Math.PI / 180;
    const long = i % 4 === 0;
    ctx.strokeStyle = long ? 'rgba(255,255,255,.20)' : 'rgba(255,255,255,.09)';
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a) * (r - (long ? 7 : 4)), cy + Math.sin(a) * (r - (long ? 7 : 4)));
    ctx.stroke();
  }

  if (dir != null) {
    // Meteorological direction is where wind comes FROM; the arrow flies with it.
    const a = (dir - 90 + 180) * Math.PI / 180;
    const len = r - 10;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    ctx.shadowColor = color; ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(len, 0);
    ctx.lineTo(len - 9, -5.5);
    ctx.lineTo(len - 6, 0);
    ctx.lineTo(len - 9, 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-len * 0.55, 0); ctx.lineTo(len - 7, 0); ctx.stroke();
    ctx.restore();
  }

  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  ctx.font = `700 ${Math.round(r * 0.44)}px 'JetBrains Mono', monospace`;
  ctx.fillText(speed == null ? '--' : String(Math.round(speed)), cx, cy + r * 0.06);
  ctx.font = MONO_SM; ctx.fillStyle = DIM;
  ctx.fillText('mph', cx, cy + r * 0.30);
  if (gust != null && gust > (speed ?? 0) + 1) {
    ctx.font = MONO_SM; ctx.fillStyle = STATUS.serious;
    ctx.fillText(`G${Math.round(gust)}`, cx, cy - r * 0.26);
  }
  ctx.restore();
}

/* ================================================================ moon disc */

/** The moon at its real phase, with maria and earthshine. */
export function moonDisc(ctx, cx, cy, r, phase, fraction) {
  ctx.save();
  // Dark limb
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#0a1220';
  ctx.fill();
  ctx.strokeStyle = 'rgba(138,182,255,.22)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Lit region, carved by the terminator ellipse.
  const k = 1 - 2 * clamp(fraction, 0, 1);
  const waxing = phase < 0.5;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.beginPath();
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const y = -1 + (2 * i) / steps;
    const x = k * Math.sqrt(Math.max(0, 1 - y * y));
    const px = cx + (waxing ? x : -x) * r;
    if (i === 0) ctx.moveTo(px, cy + y * r); else ctx.lineTo(px, cy + y * r);
  }
  for (let i = steps; i >= 0; i--) {
    const y = -1 + (2 * i) / steps;
    ctx.lineTo(cx + (waxing ? 1 : -1) * Math.sqrt(Math.max(0, 1 - y * y)) * r, cy + y * r);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#f2f6ff');
  g.addColorStop(1, '#b9c6da');
  ctx.fillStyle = g;
  ctx.shadowColor = 'rgba(200,225,255,.7)'; ctx.shadowBlur = r * 0.5;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Maria: a few fixed blotches so the disc reads as the Moon, not a circle.
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(150,165,190,.55)';
  for (const [ox, oy, or] of [[-.28, -.20, .26], [.10, -.34, .18], [.22, .10, .22], [-.15, .30, .16], [-.42, .12, .13]]) {
    ctx.beginPath();
    ctx.arc(cx + ox * r, cy + oy * r, or * r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

/* ============================================================== sky dome */

/**
 * Polar plot of the visible hemisphere: horizon at the rim, zenith at the
 * centre, north up. Used to show where the sun and moon actually are.
 */
export function skyDome(ctx, cx, cy, r, {
  sunTrack = [], moonTrack = [], sun = null, moon = null, iss = null, night = 0,
}) {
  const proj = (azDeg, altDeg) => {
    const rr = (1 - clamp(altDeg, 0, 90) / 90) * r;
    const a = (azDeg - 90) * Math.PI / 180;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  };

  ctx.save();
  // Dome fill
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, night > 0.5 ? 'rgba(6,12,30,.85)' : 'rgba(10,40,72,.55)');
  g.addColorStop(1, night > 0.5 ? 'rgba(2,4,12,.6)' : 'rgba(6,20,40,.4)');
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g; ctx.fill();

  // Altitude rings at 30 and 60 degrees, plus the horizon.
  ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1;
  for (const alt of [30, 60]) {
    ctx.beginPath(); ctx.arc(cx, cy, (1 - alt / 90) * r, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(0,234,255,.28)';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

  // Cardinal spokes
  ctx.font = UI_LBL; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const [lab, az] of [['N', 0], ['E', 90], ['S', 180], ['W', 270]]) {
    const [x1, y1] = proj(az, 0);
    ctx.strokeStyle = 'rgba(255,255,255,.07)';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x1, y1); ctx.stroke();
    const [lx, ly] = proj(az, -9);
    ctx.fillStyle = FAINT;
    ctx.fillText(lab, lx, ly);
  }

  // Tracks (above-horizon segments only)
  const drawTrack = (track, color, dash) => {
    let run = [];
    const flush = () => {
      if (run.length > 1) {
        ctx.save();
        if (dash) ctx.setLineDash(dash);
        neonLine(ctx, run, color, { width: 1.5, glow: 6 });
        ctx.restore();
      }
      run = [];
    };
    for (const p of track) {
      if (p.alt < 0) { flush(); continue; }
      run.push(proj(p.az, p.alt));
    }
    flush();
  };
  drawTrack(sunTrack, '#ffb02e', null);
  drawTrack(moonTrack, '#8ab6ff', [3, 3]);

  // Bodies
  const body = (b, color, rad) => {
    if (!b || b.alt < -2) return;
    const [x, y] = proj(b.az, Math.max(0, b.alt));
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 16;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (b.alt < 0) {
      ctx.strokeStyle = alpha(color, .5);
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.arc(x, y, rad + 3, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
  };
  body(moon, '#c9d8f5', 5);
  body(sun, '#ffd24a', 6.5);
  if (iss) {
    const [x, y] = proj(iss.az, Math.max(0, iss.alt));
    ctx.save();
    ctx.strokeStyle = '#6dff4a'; ctx.lineWidth = 1.5;
    ctx.shadowColor = '#6dff4a'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
