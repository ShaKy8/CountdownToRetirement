/*
 * Build countdown/land.json, the coastline the Places map is drawn on.
 *
 * Source: Natural Earth 1:110m land (public domain, naturalearthdata.com), via
 * the project's GitHub mirror. The map cannot use tiles: the site's CSP allows
 * tile hosts only under /weather/, deliberately, so the outline ships with the
 * page instead, and needs no network and no third party at view time.
 *
 * Each ring is quantized to a tenth of a degree (about 11 km, far finer than
 * the map ever draws) and consecutive duplicate points are dropped. Output:
 *   { "v": 1, "q": 10, "rings": [[lon*10, lat*10, lon*10, lat*10, ...], ...] }
 *
 *   node scripts/make-land.mjs        # fetch, quantize, write countdown/land.json
 *
 * Run it only to change the outline; the result is committed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson';
const Q = 10;

const res = await fetch(SRC);
if (!res.ok) throw new Error(`${SRC} -> ${res.status}`);
const geo = await res.json();

const rings = [];
for (const f of geo.features) {
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  for (const poly of polys) {
    const outer = poly[0];                       // 110m land has no lakes worth holes
    const flat = [];
    let px = null, py = null;
    for (const [lon, lat] of outer) {
      const x = Math.round(lon * Q), y = Math.round(lat * Q);
      if (x === px && y === py) continue;
      flat.push(x, y); px = x; py = y;
    }
    if (flat.length >= 8) rings.push(flat);      // at least four points
  }
}
// Antarctica is the one ring the map will never frame and the largest; keep
// it anyway (it is the world), it costs a few hundred bytes after quantizing.
const out = JSON.stringify({ v: 1, q: Q, source: 'Natural Earth 1:110m land, public domain', rings });
fs.writeFileSync(path.join(ROOT, 'countdown', 'land.json'), out);
console.log(`land.json: ${rings.length} rings, ${rings.reduce((s, r) => s + r.length / 2, 0)} points, ${out.length} bytes`);
