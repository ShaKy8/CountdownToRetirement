/*
 * Places: the flight-arc map. Shared by the retirement clock and /year/.
 *
 * Arcs fly out from home to every place visited; a place still to come gets a
 * dashed arc and a pulsing pin. No map tiles -- the site's CSP allows tile
 * hosts only under /weather/, on purpose -- so the coastline is Natural Earth
 * 1:110m land shipped as countdown/land.json (scripts/make-land.mjs).
 *
 * The SVG is geometry only. Every word is HTML over it, as on the clock's sky
 * arc: SVG <text> cannot wrap, and emoji sit differently on every platform.
 * Every pin is a <button>, so the map works by tap, keyboard and screen reader.
 */

const W = 1000, H = 560;
const NS = 'http://www.w3.org/2000/svg';
const rad = Math.PI / 180;

const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + Math.max(-80, Math.min(80, lat)) * rad / 2));

/** A projection that fits every point, padded, into W x H. */
export function fitProjection(points, { pad = 0.16, minSpan = 18 } = {}) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of points) {
    x0 = Math.min(x0, p.lon); x1 = Math.max(x1, p.lon);
    const y = mercY(p.lat); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  // A single trip should not zoom the map to a street: keep some world in view.
  const spanX = Math.max(x1 - x0, minSpan), cx = (x0 + x1) / 2;
  x0 = cx - spanX / 2; x1 = cx + spanX / 2;
  const spanY = Math.max(y1 - y0, minSpan * rad), cy = (y0 + y1) / 2;
  y0 = cy - spanY / 2; y1 = cy + spanY / 2;
  const sx = (W * (1 - 2 * pad)) / ((x1 - x0) * rad), sy = (H * (1 - 2 * pad)) / (y1 - y0);
  const s = Math.min(sx, sy);
  const ox = W / 2 - s * ((x0 + x1) / 2) * rad, oy = H / 2 + s * cy;
  return {
    x: (lon) => ox + s * lon * rad,
    y: (lat) => oy - s * mercY(lat),
    // The lon/lat box the view shows, to skip coastlines nowhere near it.
    bounds: { w: (0 - ox) / s / rad, e: (W - ox) / s / rad },
  };
}

/** A gentle arc from a to b, bowed away from the equator, as great circles look. */
export function arcPath(a, b) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len, ny = dx / len;
  if (ny > 0) { nx = -nx; ny = -ny; }                  // bow upward (north) on screen
  const h = Math.min(160, len * 0.28);
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${(mx + nx * h).toFixed(1)} ${(my + ny * h).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

function landPath(land, proj) {
  const q = land.q || 10;
  const d = [];
  for (const ring of land.rings) {
    let w = Infinity, e = -Infinity;
    for (let i = 0; i < ring.length; i += 2) { w = Math.min(w, ring[i] / q); e = Math.max(e, ring[i] / q); }
    if (e < proj.bounds.w - 30 || w > proj.bounds.e + 30) continue;
    for (let i = 0; i < ring.length; i += 2) {
      d.push(`${i ? 'L' : 'M'}${proj.x(ring[i] / q).toFixed(1)} ${proj.y(ring[i + 1] / q).toFixed(1)}`);
    }
    d.push('Z');
  }
  return d.join('');
}

const el = (tag, attrs = {}, ns = false) => {
  const n = ns ? document.createElementNS(NS, tag) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};

/**
 * Draw the map into `root`.
 *   home:   { place, lat, lon }
 *   places: Journal.places() -- { place, lat, lon, visits[], next }
 *   land:   countdown/land.json
 *   describe(place) -> the sentence shown when its pin is chosen
 *   onSelect(place, sentence) -- the caller decides where the sentence goes
 */
export function drawPlaces(root, { home, places, land, describe, onSelect, drawIn = true }) {
  root.textContent = '';
  if (!home || !places.length || !land) return null;
  const proj = fitProjection([home, ...places]);
  const P = (p) => ({ x: proj.x(p.lon), y: proj.y(p.lat) });
  const h = P(home);

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'places-svg', 'aria-hidden': 'true', focusable: 'false' }, true);
  // Graticule every 10 degrees, faint: it is what makes it read as a map.
  const grat = [];
  for (let lon = Math.ceil(proj.bounds.w / 10) * 10; lon <= proj.bounds.e; lon += 10) grat.push(`M${proj.x(lon).toFixed(1)} 0V${H}`);
  for (let lat = -70; lat <= 80; lat += 10) { const y = proj.y(lat); if (y > 0 && y < H) grat.push(`M0 ${y.toFixed(1)}H${W}`); }
  svg.append(el('path', { d: grat.join(''), class: 'places-grat' }, true));
  svg.append(el('path', { d: landPath(land, proj), class: 'places-land' }, true));

  const arcs = el('g', { class: 'places-arcs' }, true);
  let i = 0;
  for (const p of places) {
    // A cruise's ports fly from the port before; everything else from home.
    const d = arcPath(p.from ? P(p.from) : h, P(p));
    if (p.visits.length) {
      arcs.append(el('path', { d, class: 'places-arc', pathLength: '1', style: `--i:${i++}` }, true));
    } else if (p.next) {
      arcs.append(el('path', { d, class: 'places-arc places-arc--future', pathLength: '1' }, true));
    }
  }
  svg.append(arcs);
  root.append(svg);

  // Home, then the pins: HTML over the SVG, placed by percentage.
  const at = (x, y) => `left:${(x / W * 100).toFixed(2)}%;top:${(y / H * 100).toFixed(2)}%`;
  const homeMark = el('span', { class: 'places-home', style: at(h.x, h.y), title: home.place });
  homeMark.append(el('span', { class: 'places-home-dot', 'aria-hidden': 'true' }));
  const homeLabel = el('span', { class: 'places-label places-label--home' });
  homeLabel.textContent = `🏠 ${home.place.split(',')[0]}`;
  homeMark.append(homeLabel);
  root.append(homeMark);

  /*
   * Places closer together ON SCREEN than a fingertip share one pin. It is
   * measured in rendered pixels, not map units: San Francisco and Alameda are
   * 9 miles apart, and on a phone Vancouver, Grants Pass and the Bay are
   * 15px apart, which is three overlapping 28px targets. 32px keeps every
   * pin's target clear of the next (WCAG 2.5.8). The caller redraws when the
   * width changes, so a desktop map is not clustered like a phone's.
   */
  // A container with no width yet (hidden) must not pass for a desktop one.
  const rendered = root.clientWidth || (root.parentElement && root.parentElement.clientWidth) || Math.min(window.innerWidth, 1000);
  const CLUSTER = 32 * W / rendered;
  const groups = [];
  for (const p of places) {
    const q = P(p);
    const g = groups.find((x) => Math.hypot(x.x - q.x, x.y - q.y) < CLUSTER);
    if (g) g.members.push(p); else groups.push({ x: q.x, y: q.y, members: [p] });
  }

  const pins = [];
  for (const g of groups) {
    const visited = g.members.some((p) => p.visits.length);
    const next = g.members.some((p) => p.next);
    const b = el('button', { type: 'button', class: 'places-pin' + (visited ? '' : ' places-pin--future')
      + (next ? ' places-pin--next' : ''), style: at(g.x, g.y), 'aria-pressed': 'false' });
    const sentence = g.members.map(describe).join(' / ');
    b.setAttribute('aria-label', sentence);
    b.append(el('span', { class: 'places-pin-dot', 'aria-hidden': 'true' }));
    const label = el('span', { class: 'places-label', 'aria-hidden': 'true' });
    label.textContent = g.members.map((p) => p.place.split(',')[0].replace(/ & .*/, '')).join(' · ');
    // Labels sit right of the pin unless that would run off the map.
    if (g.x > W * 0.68) label.classList.add('places-label--left');
    b.append(label);
    b.addEventListener('click', () => {
      for (const o of pins) o.setAttribute('aria-pressed', String(o === b));
      onSelect && onSelect(g.members, sentence);
    });
    pins.push(b);
    root.append(b);
  }

  // The arcs draw in, one after another, the first time the map is seen.
  if (drawIn && 'IntersectionObserver' in window) {
    root.classList.add('places--waiting');
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        root.classList.remove('places--waiting'); root.classList.add('places--drawn'); io.disconnect();
      }
    }, { threshold: 0.35 });
    io.observe(root);
  } else {
    root.classList.add('places--drawn');
  }
  return { pins, proj };
}
