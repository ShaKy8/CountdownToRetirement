/**
 * Activity intelligence.
 *
 * Turns raw numbers into the thing you actually wanted to know: when to go
 * outside. Each activity declares which conditions matter and how much, then
 * every forecast hour is scored 0-100 and the best windows are extracted.
 *
 * Scores are deliberately opinionated — a "perfect" run is 45-60°F, dry, low
 * wind, low UV — and every score ships with the reason it lost points, so the
 * number is never the only output.
 */

import { clamp } from './lib/util.js';

/**
 * Triangular preference: 1.0 inside [best0,best1], ramping to 0 at min and
 * max. When max === best1 the band is open-ended above (more is simply
 * better) — without that case a "higher is better" band collapses to 0 for
 * any value past best1, which is the opposite of what it means.
 */
function band(v, min, best0, best1, max) {
  if (v == null) return 0.5;
  if (v >= best0 && v <= best1) return 1;
  if (v < best0) {
    if (min >= best0) return 1;                 // open-ended below
    return clamp((v - min) / (best0 - min), 0, 1);
  }
  if (max <= best1) return 1;                   // open-ended above
  return clamp((max - v) / (max - best1), 0, 1);
}

const ACTIVITIES = {
  run: {
    label: 'RUN', icon: '🏃', color: '#00eaff',
    score(h) {
      return [
        ['temperature', band(h.feels ?? h.temp, 15, 45, 62, 92), 0.30],
        ['dry', 1 - clamp((h.pop ?? 0) / 100, 0, 1) * 0.9, 0.20],
        ['humidity', band(h.dew, -20, 20, 55, 74), 0.15],
        ['wind', band(h.wind, -1, 0, 9, 26), 0.13],
        ['UV', band(h.uv, -1, 0, 3, 10), 0.09],
        ['air quality', band(h.air?.aqi, -1, 0, 50, 160), 0.05],
        // A nudge, not a veto: plenty of people run after dark.
        ['daylight', h.isDay ? 1 : 0.45, 0.08],
      ];
    },
  },
  bike: {
    label: 'BIKE', icon: '🚲', color: '#6dff4a',
    score(h) {
      return [
        ['temperature', band(h.feels ?? h.temp, 25, 58, 78, 98), 0.26],
        ['dry', 1 - clamp((h.pop ?? 0) / 100, 0, 1), 0.22],
        // Wind matters far more on a bike than on foot.
        ['wind', band(h.gust ?? h.wind, -1, 0, 8, 24), 0.24],
        ['visibility', band(h.vis, 0, 8000, Infinity, Infinity), 0.08],
        ['UV', band(h.uv, -1, 0, 5, 11), 0.05],
        ['air quality', band(h.air?.aqi, -1, 0, 50, 150), 0.05],
        // Riding in the dark is doable but rarely the best hour of the day.
        ['daylight', h.isDay ? 1 : 0.35, 0.10],
      ];
    },
  },
  grill: {
    label: 'GRILL', icon: '🔥', color: '#ffb02e',
    score(h) {
      return [
        ['dry', 1 - clamp((h.pop ?? 0) / 100, 0, 1) * 1.0, 0.34],
        ['temperature', band(h.temp, 35, 62, 88, 104), 0.24],
        ['wind', band(h.wind, -1, 0, 10, 22), 0.24],
        ['daylight or dusk', h.isDay ? 1 : 0.55, 0.10],
        ['humidity', band(h.dew, -20, 20, 64, 78), 0.08],
      ];
    },
  },
  stargaze: {
    label: 'STARGAZE', icon: '✦', color: '#a75cff',
    score(h, ctx) {
      // Only meaningful after astronomical dusk.
      const dark = h.isDay ? 0 : 1;
      return [
        ['darkness', dark, 0.26],
        ['clear sky', 1 - clamp((h.cloud ?? 0) / 100, 0, 1), 0.32],
        ['no moon', 1 - clamp(ctx?.moonFraction ?? 0.5, 0, 1) * (ctx?.moonUp ? 1 : 0.15), 0.18],
        ['transparency', band(h.vis, 0, 20000, Infinity, Infinity), 0.10],
        ['low humidity', band(h.rh, -1, 0, 65, 100), 0.08],
        ['calm', band(h.wind, -1, 0, 8, 28), 0.06],
      ];
    },
  },
  photo: {
    label: 'PHOTO', icon: '◎', color: '#ff2d8f',
    score(h, ctx) {
      // Golden hour with texture in the sky is the goal; flat blue is boring.
      const goldenness = ctx?.sunAltDeg == null ? 0.4
        : Math.exp(-Math.pow((ctx.sunAltDeg - 3) / 7, 2));
      const drama = 1 - Math.abs((h.cloud ?? 50) / 100 - 0.45) * 1.6;
      return [
        ['golden light', clamp(goldenness, 0, 1), 0.40],
        ['sky texture', clamp(drama, 0, 1), 0.26],
        ['dry', 1 - clamp((h.pop ?? 0) / 100, 0, 1) * 0.7, 0.18],
        ['clarity', band(h.vis, 0, 15000, Infinity, Infinity), 0.16],
      ];
    },
  },
  laundry: {
    label: 'LINE DRY', icon: '≋', color: '#8ab6ff',
    score(h) {
      return [
        ['dry', 1 - clamp((h.pop ?? 0) / 100, 0, 1), 0.34],
        // Evaporative demand is the real driver here.
        ['evaporation', band(h.et0, -0.01, 0.012, Infinity, Infinity), 0.24],
        ['low humidity', band(h.rh, -1, 0, 50, 95), 0.20],
        ['breeze', band(h.wind, -1, 5, 16, 32), 0.14],
        ['daylight', h.isDay ? 1 : 0.2, 0.08],
      ];
    },
  },
  openWindows: {
    label: 'OPEN UP', icon: '⌷', color: '#3ce0c0',
    score(h) {
      return [
        ['comfortable air', band(h.temp, 40, 62, 76, 90), 0.34],
        ['dry air', band(h.dew, -20, 25, 58, 70), 0.24],
        ['clean air', band(h.air?.aqi, -1, 0, 50, 130), 0.22],
        ['no rain', 1 - clamp((h.pop ?? 0) / 100, 0, 1), 0.12],
        ['calm', band(h.wind, -1, 0, 14, 34), 0.08],
      ];
    },
  },
};

export const ACTIVITY_KEYS = Object.keys(ACTIVITIES);
export const activityMeta = (k) => ACTIVITIES[k];

/** Score one hour, returning the number plus its worst contributing factor. */
export function scoreHour(key, h, ctx) {
  const act = ACTIVITIES[key];
  if (!act || !h) return null;
  const parts = act.score(h, ctx);
  let total = 0;
  for (const [, v, w] of parts) total += clamp(v, 0, 1) * w;
  // Identify the limiting factor: the largest weighted shortfall.
  let worst = null, worstLoss = 0;
  for (const [name, v, w] of parts) {
    const loss = (1 - clamp(v, 0, 1)) * w;
    if (loss > worstLoss) { worstLoss = loss; worst = name; }
  }
  return {
    score: Math.round(clamp(total, 0, 1) * 100),
    limiter: worstLoss > 0.06 ? worst : null,
    parts: parts.map(([name, v, w]) => ({ name, value: clamp(v, 0, 1), weight: w })),
  };
}

/**
 * Best contiguous windows for an activity over the next `hours` hours.
 * Returns at most `limit` windows, sorted by quality.
 */
export function bestWindows(key, store, { hours = 36, limit = 3, minScore = 55 } = {}) {
  const now = Date.now();
  const end = now + hours * 3600e3;
  const rows = store.hours.filter((h) => h.t >= now - 1800e3 && h.t <= end);
  if (!rows.length) return [];

  const scored = rows.map((h) => {
    const ctx = contextFor(store, h.t);
    return { t: h.t, ...scoreHour(key, { ...h, air: sampleAir(store, h.t) }, ctx) };
  });

  /*
   * Grow windows outward from local peaks rather than reporting every
   * contiguous run above the threshold. A run can span twelve hours whose
   * quality varies enormously — reporting "19:00-07:00" for grilling because
   * one hour of it scored well is useless. A window here stays within
   * NEAR_PEAK points of its own peak, so it describes hours you would
   * actually use.
   */
  const NEAR_PEAK = 12;
  const used = new Array(scored.length).fill(false);
  const windows = [];

  for (let pass = 0; pass < limit; pass++) {
    let bi = -1;
    for (let i = 0; i < scored.length; i++) {
      if (used[i] || scored[i].score < minScore) continue;
      if (bi < 0 || scored[i].score > scored[bi].score) bi = i;
    }
    if (bi < 0) break;

    const peak = scored[bi].score;
    const floor = Math.max(minScore, peak - NEAR_PEAK);
    let lo = bi, hi = bi;
    while (lo - 1 >= 0 && !used[lo - 1] && scored[lo - 1].score >= floor) lo--;
    while (hi + 1 < scored.length && !used[hi + 1] && scored[hi + 1].score >= floor) hi++;
    for (let i = lo; i <= hi; i++) used[i] = true;

    let sum = 0;
    for (let i = lo; i <= hi; i++) sum += scored[i].score;
    windows.push({
      start: scored[lo].t,
      end: scored[hi].t + 3600e3,
      peakAt: scored[bi].t,
      peak,
      avg: Math.round(sum / (hi - lo + 1)),
      hours: hi - lo + 1,
      limiter: scored[bi].limiter,
    });
  }

  return windows.sort((a, b) => b.peak - a.peak || a.start - b.start);
}

function sampleAir(store, t) {
  if (!store.air?.length) return null;
  let best = null, bd = Infinity;
  for (const a of store.air) {
    const d = Math.abs(a.t - t);
    if (d < bd) { bd = d; best = a; }
  }
  return bd < 3600e3 * 2 ? best : null;
}

function contextFor(store, t) {
  const f = store.frame(t);
  if (!f) return {};
  return {
    sunAltDeg: f.sun.altDeg,
    moonFraction: f.moon.fraction,
    moonUp: f.moon.altDeg > 0,
  };
}

/* ------------------------------------------------------------- nowcast */

/**
 * Minute-resolution answer to "is it about to rain, and how long have I got?"
 * Uses the 15-minute series where it exists, falling back to hourly.
 */
export function precipNowcast(store) {
  const now = Date.now();
  const horizon = now + 6 * 3600e3;
  const series = (store.min15?.length ? store.min15 : store.hours)
    .filter((d) => d.t >= now - 900e3 && d.t <= horizon);
  if (series.length < 2) return null;

  const WET = 0.002; // in/hr — below this is a trace, not rain
  const nowWet = (series[0].precip ?? 0) >= WET;

  let change = null;
  for (const d of series) {
    const wet = (d.precip ?? 0) >= WET;
    if (wet !== nowWet) { change = d; break; }
  }

  // Peak intensity in the window, for describing what's coming.
  const peak = series.reduce((a, c) => ((c.precip ?? 0) > (a.precip ?? 0) ? c : a), series[0]);

  return {
    raining: nowWet,
    changeAt: change?.t ?? null,
    minutes: change ? Math.round((change.t - now) / 60000) : null,
    peak: peak.precip ?? 0,
    peakAt: peak.t,
    resolution: store.min15?.length ? 15 : 60,
    series: series.map((d) => ({ t: d.t, p: d.precip ?? 0 })),
  };
}

/**
 * One-line human summary of the nowcast, or null when nothing is imminent.
 */
export function nowcastPhrase(nc, tf) {
  if (!nc) return null;
  if (nc.raining) {
    return nc.minutes != null
      ? `Rain now — easing in about ${nc.minutes} min`
      : 'Rain now — no let-up in the next 6 hours';
  }
  if (nc.minutes != null && nc.minutes <= 240) {
    const heavy = nc.peak > 0.08 ? 'Heavy rain' : nc.peak > 0.02 ? 'Rain' : 'Light rain';
    return `${heavy} starting in ${nc.minutes} min (${tf.hm(nc.changeAt)})`;
  }
  return null;
}
