/**
 * STORMS — what tropical cyclones have done near a place, from NHC's
 * best-track archive.
 *
 * Pure rules, in the spirit of sats.js and tonight.js: no DOM, no network, no
 * zero-argument `new Date()`. Storms come in as stormpack.js's decoded
 * columns; "today" is always a millisecond argument.
 *
 * Wording is part of the rules. The archive records where a storm's centre
 * was every six hours, not what a place felt, so nothing here says "hit" or
 * "felt": a storm *passed within* some distance, and its wind is the wind
 * *when it was nearest*. The distances are to the straight line between
 * fixes, which is how a track is drawn and the best the data allows.
 */

export const KM_PER_MI = 1.609344;
const EARTH_KM = 6371;
const RAD = Math.PI / 180;
const DAY = 86400000;

/** Saffir-Simpson thresholds, knots. Below 34 is a depression (or unknown). */
export const CATEGORIES = [
  { key: 'TD', min: 0, label: 'Tropical depression', color: '#7fb2f0', width: 1.2 },
  { key: 'TS', min: 34, label: 'Tropical storm', color: '#3fd0d8', width: 1.6 },
  { key: 'C1', min: 64, label: 'Category 1', color: '#8fdc6a', width: 2 },
  { key: 'C2', min: 83, label: 'Category 2', color: '#f2b45a', width: 2.4 },
  { key: 'C3', min: 96, label: 'Category 3', color: '#f09a5a', width: 2.8 },
  { key: 'C4', min: 113, label: 'Category 4', color: '#f47171', width: 3.2 },
  { key: 'C5', min: 137, label: 'Category 5', color: '#f07aa6', width: 3.6 },
];

/** The category for a wind in knots, or null when the archive has no wind. */
export function category(kt) {
  if (kt == null || !(kt >= 0)) return null;
  let c = CATEGORIES[0];
  for (const x of CATEGORIES) if (kt >= x.min) c = x;
  return c;
}

/** Great-circle distance, km. */
export function gcKm(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * RAD, dLon = (lon2 - lon1) * RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Degrees of longitude difference folded into [-180, 180]. */
const wrap180 = (d) => ((((d + 180) % 360) + 360) % 360) - 180;

/** Wind in knots at fix i, or null. */
export const windAt = (storm, i) => (storm.wind[i] === -99 ? null : storm.wind[i]);

/**
 * The nearest the storm's track came to a point: the closest point on the
 * straight lines between fixes, with position, time and wind interpolated to
 * it. Not limited to the fixes themselves, because a six-hour step is 100 km
 * or more and the track passes between them.
 */
export function closestApproach(storm, lat, lon) {
  const cosLat = Math.cos(lat * RAD);
  let best = null;
  const n = storm.n;
  for (let i = 0; i < n; i++) {
    const x1 = wrap180(storm.lon[i] - lon) * cosLat * 111.32, y1 = (storm.lat[i] - lat) * 110.574;
    let u = 0, x = x1, y = y1;
    if (i + 1 < n) {
      const x2 = x1 + wrap180(storm.lon[i + 1] - storm.lon[i]) * cosLat * 111.32;
      const y2 = (storm.lat[i + 1] - lat) * 110.574;
      const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy;
      u = len2 > 0 ? Math.max(0, Math.min(1, -(x1 * dx + y1 * dy) / len2)) : 0;
      x = x1 + u * dx; y = y1 + u * dy;
    }
    const approx = Math.hypot(x, y);
    if (!best || approx < best.approx) best = { i, u, approx };
  }
  const { i, u } = best;
  const j = Math.min(i + 1, n - 1);
  const pLat = storm.lat[i] + u * (storm.lat[j] - storm.lat[i]);
  const pLon = storm.lon[i] + u * (storm.lon[j] - storm.lon[i]);
  const w1 = windAt(storm, i), w2 = windAt(storm, j);
  const wind = w1 == null ? w2 : w2 == null ? w1 : w1 + u * (w2 - w1);
  return {
    km: gcKm(lat, lon, pLat, wrap180(pLon)),
    i, u, lat: pLat, lon: wrap180(pLon),
    t: storm.t[i] + u * (storm.t[j] - storm.t[i]),
    wind,
  };
}

/** Storms whose track came within `radiusKm` of a point, nearest first. */
export function nearbyStorms(storms, lat, lon, radiusKm) {
  const out = [];
  for (const storm of storms) {
    const c = closestApproach(storm, lat, lon);
    if (c.km <= radiusKm) out.push({ storm, ...c });
  }
  return out.sort((a, b) => a.km - b.km);
}

/** Display name: "Katrina 2005", or "Unnamed 1851" for the early storms. */
export function titleOf(storm) {
  const name = storm.name ? storm.name.toLowerCase().replace(/(^|[ -])([a-z])/g, (_, a, b) => a + b.toUpperCase()) : 'Unnamed';
  return `${name} ${storm.year}`;
}

/**
 * The headline facts for a place. `near` is nearbyStorms() output for a
 * radius of at least 150 miles.
 *   closest   - the storm that passed nearest, with its wind when nearest
 *   within100 - how many passed within 100 miles
 *   strongest - the greatest wind-when-nearest among those within 150 miles
 */
export function facts(near) {
  const mi = (x) => x.km / KM_PER_MI;
  const within150 = near.filter((x) => mi(x) <= 150);
  const strongest = within150.reduce((b, x) => (x.wind != null && (!b || x.wind > b.wind) ? x : b), null);
  return {
    closest: near[0] || null,
    within100: near.filter((x) => mi(x) <= 100).length,
    within150: within150.length,
    strongest,
  };
}

/** Day of the year (1-366) in UTC for a millisecond time. */
export function dayOfYear(ms) {
  const d = new Date(ms);
  return Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 1)) / DAY) + 1;
}

/**
 * Where `todayMs` falls in a basin's season, from every storm in the archive:
 * each (storm, day) with tropical-storm winds counts once. `behind` is the
 * share of those days that fall on or before today's date, `peakDoy` the
 * busiest day. A season ring needs nothing else.
 */
export function seasonProgress(storms, basin, todayMs) {
  const hist = new Float64Array(367);
  for (const s of storms) {
    if (s.basin !== basin) continue;
    const seen = new Set();
    for (let i = 0; i < s.n; i++) {
      const w = windAt(s, i);
      if (w == null || w < 34) continue;
      seen.add(dayOfYear(s.t[i]));
    }
    for (const d of seen) hist[d]++;
  }
  const total = hist.reduce((a, b) => a + b, 0);
  const doy = dayOfYear(todayMs);
  let upTo = 0, peakDoy = 1;
  for (let d = 1; d <= 366; d++) {
    if (d <= doy) upTo += hist[d];
    if (hist[d] > hist[peakDoy]) peakDoy = d;
  }
  return { doy, peakDoy, behind: total ? upTo / total : 0, days: total, hist };
}

/**
 * Storms that were active within `window` days of today's month and day, in
 * any year, strongest first. Each carries the matched fix date.
 */
export function onThisDate(storms, todayMs, window = 3) {
  const today = new Date(todayMs);
  const out = [];
  for (const s of storms) {
    let peak = null;
    for (let i = 0; i < s.n; i++) {
      const d = new Date(s.t[i]);
      const target = Date.UTC(d.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
      if (Math.abs(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - target) > window * DAY) continue;
      const w = windAt(s, i) ?? 0;
      if (!peak || w > peak.wind) peak = { i, wind: w };
    }
    if (peak) out.push({ storm: s, ...peak });
  }
  return out.sort((a, b) => b.wind - a.wind);
}

/** Position and wind along a storm at time t (ms), clamped to its life. */
export function positionAt(storm, t) {
  const n = storm.n;
  if (t <= storm.t[0]) return { lat: storm.lat[0], lon: storm.lon[0], wind: windAt(storm, 0), i: 0, u: 0 };
  if (t >= storm.t[n - 1]) return { lat: storm.lat[n - 1], lon: storm.lon[n - 1], wind: windAt(storm, n - 1), i: n - 1, u: 0 };
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (storm.t[mid] <= t) lo = mid; else hi = mid; }
  const u = (t - storm.t[lo]) / (storm.t[hi] - storm.t[lo]);
  const w1 = windAt(storm, lo), w2 = windAt(storm, hi);
  return {
    lat: storm.lat[lo] + u * (storm.lat[hi] - storm.lat[lo]),
    lon: storm.lon[lo] + u * (storm.lon[hi] - storm.lon[lo]),
    wind: w1 == null ? w2 : w2 == null ? w1 : w1 + u * (w2 - w1),
    i: lo, u,
  };
}

/**
 * A caveat for how far to trust a storm's track and strength, by year, or
 * null for the modern record. The archive says so itself: its early years are
 * reconstructions.
 */
export function eraNote(year) {
  if (year < 1900) return 'Reconstructed from ship reports and coastal records: position and strength are uncertain.';
  if (year < 1966) return 'Before weather satellites: the track is reconstructed and the strength estimated.';
  return null;
}
