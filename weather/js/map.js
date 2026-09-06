/**
 * A small canvas slippy map.
 *
 * Written rather than imported so the base tiles can be colour-graded into
 * the console's palette and the radar composited exactly how we want. It
 * handles Web Mercator projection, fractional zoom, tile caching, inertia-free
 * panning and wheel zoom — which is all a weather map actually needs.
 */

const TILE = 256;
const MAX_CACHE = 600;

export const proj = {
  lonToWorld: (lon, z) => ((lon + 180) / 360) * Math.pow(2, z) * TILE,
  latToWorld: (lat, z) => {
    const s = Math.sin((Math.max(-85.05, Math.min(85.05, lat)) * Math.PI) / 180);
    return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * Math.pow(2, z) * TILE;
  },
  worldToLon: (x, z) => (x / (Math.pow(2, z) * TILE)) * 360 - 180,
  worldToLat: (y, z) => {
    const n = Math.PI - (2 * Math.PI * y) / (Math.pow(2, z) * TILE);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  },
};

/* Shared image cache across every map instance and layer. */
const cache = new Map();
let pending = 0;

function loadTile(url, onReady) {
  const hit = cache.get(url);
  if (hit) {
    if (hit.state === 'ok') return hit.img;
    return null;
  }
  // Cap concurrency so a fast pan doesn't queue hundreds of requests.
  if (pending > 24) return null;

  const img = new Image();
  const entry = { img, state: 'loading' };
  cache.set(url, entry);
  pending++;
  img.crossOrigin = 'anonymous';
  img.onload = () => { entry.state = 'ok'; pending--; onReady?.(); };
  img.onerror = () => { entry.state = 'err'; pending--; };
  img.src = url;

  if (cache.size > MAX_CACHE) {
    // Evict the oldest quarter; insertion order is good enough here.
    let n = Math.floor(MAX_CACHE / 4);
    for (const k of cache.keys()) { if (n-- <= 0) break; cache.delete(k); }
  }
  return null;
}

export class SlippyMap {
  /**
   * @param layers array of {url(z,x,y)->string|null, opacity, filter, blend, enabled}
   */
  constructor(canvas, { center = [0, 0], zoom = 7, minZoom = 2, maxZoom = 12, onMove } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.lat = center[0];
    this.lon = center[1];
    this.zoom = zoom;
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.onMove = onMove;
    this.layers = [];
    this.overlays = [];      // (ctx, map) => void
    this.dirty = true;
    this.w = 0; this.h = 0;
    this._raf = null;

    this._bind();
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(canvas);
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w; this.h = h;
    this.invalidate();
  }

  invalidate() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = null; this.render(); });
  }

  setView(lat, lon, zoom) {
    this.lat = lat; this.lon = lon;
    if (zoom != null) this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    this.invalidate();
    this.onMove?.(this);
  }

  /* --- projection between screen and geography --- */
  project(lat, lon) {
    const z = this.zoom;
    return [
      proj.lonToWorld(lon, z) - proj.lonToWorld(this.lon, z) + this.w / 2,
      proj.latToWorld(lat, z) - proj.latToWorld(this.lat, z) + this.h / 2,
    ];
  }
  unproject(x, y) {
    const z = this.zoom;
    return [
      proj.worldToLat(proj.latToWorld(this.lat, z) + y - this.h / 2, z),
      proj.worldToLon(proj.lonToWorld(this.lon, z) + x - this.w / 2, z),
    ];
  }

  _bind() {
    const c = this.canvas;
    let drag = null;

    c.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY, lat: this.lat, lon: this.lon };
      c.setPointerCapture(e.pointerId);
      c.style.cursor = 'grabbing';
    });
    c.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const z = this.zoom;
      const wx = proj.lonToWorld(drag.lon, z) - (e.clientX - drag.x);
      const wy = proj.latToWorld(drag.lat, z) - (e.clientY - drag.y);
      this.lon = proj.worldToLon(wx, z);
      this.lat = Math.max(-85, Math.min(85, proj.worldToLat(wy, z)));
      this.invalidate();
      this.onMove?.(this);
    });
    const end = (e) => {
      if (!drag) return;
      drag = null;
      c.style.cursor = 'grab';
      try { c.releasePointerCapture(e.pointerId); } catch { /* fine */ }
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);

    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const r = c.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      // Zoom about the cursor: keep the geographic point under it fixed.
      const [blat, blon] = this.unproject(mx, my);
      const dz = -e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0022);
      this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + dz));
      const [alat, alon] = this.unproject(mx, my);
      this.lon += blon - alon;
      this.lat += blat - alat;
      this.lat = Math.max(-85, Math.min(85, this.lat));
      this.invalidate();
      this.onMove?.(this);
    }, { passive: false });

    c.style.cursor = 'grab';
    c.style.touchAction = 'none';
  }

  render() {
    const { ctx, w, h } = this;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#03050b';
    ctx.fillRect(0, 0, w, h);

    const zi = Math.max(0, Math.min(this.maxZoom, Math.round(this.zoom)));
    const scale = Math.pow(2, this.zoom - zi);
    const size = TILE * scale;
    const n = Math.pow(2, zi);

    // World pixel of the viewport's top-left corner at integer zoom zi.
    const cx = proj.lonToWorld(this.lon, zi) * scale;
    const cy = proj.latToWorld(this.lat, zi) * scale;
    const originX = cx - w / 2;
    const originY = cy - h / 2;

    const x0 = Math.floor(originX / size), x1 = Math.floor((originX + w) / size);
    const y0 = Math.floor(originY / size), y1 = Math.floor((originY + h) / size);

    const again = () => this.invalidate();

    for (const layer of this.layers) {
      if (layer.enabled === false || layer.opacity === 0) continue;
      ctx.save();
      ctx.globalAlpha = layer.opacity ?? 1;
      if (layer.filter) ctx.filter = layer.filter;
      if (layer.blend) ctx.globalCompositeOperation = layer.blend;
      // Slight overdraw avoids hairline seams between tiles.
      const pad = 0.5;
      for (let ty = y0; ty <= y1; ty++) {
        if (ty < 0 || ty >= n) continue;
        for (let tx = x0; tx <= x1; tx++) {
          const wx = ((tx % n) + n) % n;   // wrap east-west
          const url = layer.url(zi, wx, ty);
          if (!url) continue;
          const img = loadTile(url, again);
          if (!img) continue;
          ctx.drawImage(
            img,
            Math.round(tx * size - originX) - pad,
            Math.round(ty * size - originY) - pad,
            Math.ceil(size) + pad * 2,
            Math.ceil(size) + pad * 2,
          );
        }
      }
      ctx.restore();
    }

    for (const fn of this.overlays) {
      ctx.save();
      try { fn(ctx, this); } catch (e) { console.error('[map overlay]', e); }
      ctx.restore();
    }
  }

  destroy() { this._ro.disconnect(); }
}

/* --------------------------------------------------------------- helpers */

/** Draw a GeoJSON Polygon / MultiPolygon in map coordinates. */
export function drawGeometry(ctx, map, geom, { stroke, fill, width = 1.5, glow = 8 }) {
  if (!geom) return;
  const rings = geom.type === 'Polygon' ? [geom.coordinates]
    : geom.type === 'MultiPolygon' ? geom.coordinates : null;
  if (!rings) return;

  ctx.beginPath();
  for (const poly of rings) {
    for (const ring of poly) {
      ring.forEach(([lon, lat], i) => {
        const [x, y] = map.project(lat, lon);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
    }
  }
  if (fill) { ctx.fillStyle = fill; ctx.fill('evenodd'); }
  if (stroke) {
    ctx.save();
    if (glow) { ctx.shadowColor = stroke; ctx.shadowBlur = glow; }
    ctx.strokeStyle = stroke; ctx.lineWidth = width;
    ctx.stroke();
    ctx.restore();
  }
}

/** The "you are here" reticle. */
export function drawMarker(ctx, x, y, color = '#ff2d8f', label = null, pulse = 0) {
  ctx.save();
  ctx.shadowColor = color; ctx.shadowBlur = 14;
  ctx.strokeStyle = color; ctx.lineWidth = 1.5;

  const r = 7;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    ctx.moveTo(x + dx * (r + 2), y + dy * (r + 2));
    ctx.lineTo(x + dx * (r + 7), y + dy * (r + 7));
  }
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();

  if (pulse > 0) {
    ctx.globalAlpha = 1 - pulse;
    ctx.beginPath(); ctx.arc(x, y, r + pulse * 26, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (label) {
    ctx.shadowBlur = 0;
    ctx.font = "600 9px 'Chakra Petch', sans-serif";
    ctx.letterSpacing = '1.4px';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(label).width + 10;
    ctx.fillStyle = 'rgba(4,9,19,.85)';
    ctx.fillRect(x + r + 8, y - 7, w, 14);
    ctx.fillStyle = color;
    ctx.fillText(label, x + r + 13, y);
  }
  ctx.restore();
}

/** Scale bar, so distances on the radar mean something. */
export function drawScaleBar(ctx, map, x, y) {
  const metersPerPx = (156543.03392 * Math.cos((map.lat * Math.PI) / 180)) / Math.pow(2, map.zoom);
  const targetPx = 110;
  const targetMi = (metersPerPx * targetPx) / 1609.344;
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  const mi = steps.reduce((a, b) => (Math.abs(b - targetMi) < Math.abs(a - targetMi) ? b : a));
  const px = (mi * 1609.344) / metersPerPx;

  ctx.save();
  ctx.strokeStyle = 'rgba(214,236,250,.75)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - 4); ctx.lineTo(x, y); ctx.lineTo(x + px, y); ctx.lineTo(x + px, y - 4);
  ctx.stroke();
  ctx.font = "500 9px 'JetBrains Mono', monospace";
  ctx.fillStyle = 'rgba(214,236,250,.75)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText(`${mi} mi`, x + px / 2, y - 5);
  ctx.restore();
}
