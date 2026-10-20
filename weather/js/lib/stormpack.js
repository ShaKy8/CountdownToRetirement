/**
 * STORM ARCHIVE — the compact form of NHC's best-track history, and the way
 * back out of it.
 *
 * Pure, like sats.js and tonight.js: no DOM, no network, no clock. The build
 * script (scripts/fetch-storms.mjs in the site repo) encodes HURDAT2 with
 * this file and the console decodes it with the same file, so the two halves
 * cannot disagree about the format.
 *
 * HURDAT2 is 0.1 degree and 1 knot to begin with, so storing tenths of a
 * degree as integers loses nothing, and storing each fix as a difference from
 * the last turns a long run of nearly equal numbers into small ones that gzip
 * flattens. A storm is one row of columns:
 *
 *   [id, name, t0, dts, lat, lon, wind, status, land]
 *
 *   t0      first fix, minutes since the epoch (UTC)
 *   dts     minutes since the previous fix (360 almost always; a landfall
 *           record sits at its own odd time)
 *   lat     tenths of a degree: the first value, then differences
 *   lon     tenths, east-positive and UNWRAPPED: a storm that crosses the
 *           dateline carries on past 180 (181, 182...) instead of jumping to
 *           -179, so differences stay small and a track is one polyline.
 *           Drawing wraps with modulo.
 *   wind    knots: first value, then differences; NO_WIND where unknown
 *   status  one character per fix, see STATUS
 *   land    indices of the 'L' (landfall) records
 */

export const NO_WIND = -99;

/** HURDAT2 status -> the one character stored. */
export const STATUS = { TD: 'T', TS: 'S', HU: 'H', EX: 'E', SD: 'U', SS: 'X', LO: 'L', WV: 'W', DB: 'D' };
export const STATUS_NAME = {
  T: 'Tropical depression', S: 'Tropical storm', H: 'Hurricane', E: 'Extratropical',
  U: 'Subtropical depression', X: 'Subtropical storm', L: 'Low', W: 'Tropical wave', D: 'Disturbance',
  '?': 'Unclassified',
};

const MIN = 60000;

/** Shift lon by a multiple of 360 so it lies within 180 of the previous one. */
export function unwrapLon(prev, lon) {
  let d = lon - prev;
  while (d > 180) { lon -= 360; d = lon - prev; }
  while (d < -180) { lon += 360; d = lon - prev; }
  return lon;
}

/** Storms as the parser makes them -> the columnar archive object. */
export function encodeArchive(storms, meta = {}) {
  return {
    v: 1,
    ...meta,
    storms: storms.map((s) => {
      const f = s.fixes;
      const dts = [], lat = [], lon = [], wind = [], land = [];
      let status = '';
      let pLat = 0, pLon = 0, pWind = 0, pT = 0, uLon = 0;
      f.forEach((x, i) => {
        const la = Math.round(x.lat * 10);
        uLon = i === 0 ? x.lon : unwrapLon(uLon, x.lon);
        const lo = Math.round(uLon * 10);
        const w = x.wind == null ? NO_WIND : Math.round(x.wind);
        const t = Math.round(x.t / MIN);
        dts.push(i === 0 ? 0 : t - pT);
        lat.push(i === 0 ? la : la - pLat);
        lon.push(i === 0 ? lo : lo - pLon);
        wind.push(i === 0 ? w : w - pWind);
        status += STATUS[x.status] || '?';
        if (x.rec === 'L') land.push(i);
        pLat = la; pLon = lo; pWind = w; pT = t;
      });
      return [s.id, s.name, Math.round(f[0].t / MIN), dts, lat, lon, wind, status, land];
    }),
  };
}

/**
 * The archive object -> storms with typed, absolute columns. `t` is in
 * milliseconds so it feeds `new Date(t)` and the cursor directly; `lon` is
 * the unwrapped degrees.
 */
export function decodeArchive(archive) {
  const out = [];
  for (const row of Array.isArray(archive && archive.storms) ? archive.storms : []) {
    // One bad row must not blank the archive: it is dropped, like a bad OMM record in sats.js.
    if (!Array.isArray(row)) continue;
    const [id, name, t0, dts, lat, lon, wind, status, land] = row;
    if (!id || ![dts, lat, lon, wind].every(Array.isArray) || typeof status !== 'string') continue;
    const n = lat.length;
    if (!n || dts.length !== n || lon.length !== n || wind.length !== n || status.length !== n) continue;
    const t = new Float64Array(n), la = new Float32Array(n), lo = new Float32Array(n), w = new Int16Array(n);
    let tm = t0, a = 0, b = 0, c = 0;
    for (let i = 0; i < n; i++) {
      tm += dts[i]; a += lat[i]; b += lon[i]; c += wind[i];
      t[i] = tm * MIN; la[i] = a / 10; lo[i] = b / 10; w[i] = c;
    }
    out.push({
      id, name, basin: id.slice(0, 2), year: Number(id.slice(4)),
      n, t, lat: la, lon: lo, wind: w, status, land: land || [],
    });
  }
  return out;
}
