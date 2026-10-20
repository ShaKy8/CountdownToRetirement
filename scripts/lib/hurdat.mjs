/**
 * HURDAT2 -> storms. Pure: text in, objects out, nothing read or fetched.
 *
 * HURDAT2 is NHC's best-track archive (Atlantic 1851-, East/Central Pacific
 * 1949-). A storm is a header line, then its rows:
 *
 *   AL122005,            KATRINA,     34,
 *   20050823, 1800,  , TD, 23.1N,  75.1W,  30, 1008, -999, ...
 *
 * Header: id, name, number of rows that follow. Row: date, time (HHMM UTC),
 * record id ('L' = landfall, often at an off-synoptic time), status, lat,
 * lon, max wind (kt), min pressure (mb), then the 34/50/64 kt wind radii in
 * NE SE SW NW order (2004 onward), then the radius of maximum wind (2021 on).
 * -999 is missing.
 *
 * A storm that does not add up (row count, range, time order) is rejected by
 * name and reported, never repaired: a track with a guessed point in it is
 * worse than a track that is not there.
 */

const MISSING = -999;

function coord(text) {
  const m = /^(\d+(?:\.\d+)?)([NSEW])$/.exec(text);
  if (!m) return NaN;
  const v = Number(m[1]);
  return m[2] === 'S' || m[2] === 'W' ? -v : v;
}

function num(text) {
  const v = Number(text);
  return !Number.isFinite(v) || v <= MISSING ? null : v;
}

export function parseHurdat2(text) {
  const storms = [];
  const rejected = [];
  const lines = String(text).split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const head = lines[i].trim();
    i++;
    if (!head) continue;
    const h = head.split(',').map((s) => s.trim());
    if (!/^(AL|EP|CP)\d{6}$/.test(h[0]) || !/^\d+$/.test(h[2] || '')) {
      rejected.push({ id: h[0], why: 'not a header line' });
      continue;
    }
    const [id, name] = h;
    const rows = Number(h[2]);
    const body = lines.slice(i, i + rows);
    i += rows;
    if (body.length !== rows) { rejected.push({ id, why: 'file ends inside the storm' }); continue; }

    const fixes = [];
    let why = null;
    for (const raw of body) {
      const f = raw.split(',').map((s) => s.trim());
      const date = /^(\d{4})(\d{2})(\d{2})$/.exec(f[0] || '');
      const time = /^(\d{2})(\d{2})$/.exec(f[1] || '');
      const lat = coord(f[4] || '');
      const lon = coord(f[5] || '');
      if (!date || !time || !Number.isFinite(lat) || !Number.isFinite(lon)
        || Math.abs(lat) > 90 || Math.abs(lon) > 180) { why = 'a row is malformed or out of range'; break; }
      const t = Date.UTC(+date[1], +date[2] - 1, +date[3], +time[1], +time[2]);
      if (fixes.length && t <= fixes[fixes.length - 1].t) { why = 'rows are not in time order'; break; }
      const radii = f.slice(8, 20).map(num);
      fixes.push({
        t, lat, lon,
        rec: f[2] || '',
        status: f[3] || '',
        wind: num(f[6]),
        pres: num(f[7]),
        // 34/50/64 kt x NE SE SW NW, nm. null when nothing was measured.
        radii: radii.length === 12 && radii.some((r) => r != null) ? radii : null,
        // Radius of maximum wind, nm: a 21st field, present from the 2021 revision on.
        rmw: num(f[20]) > 0 ? num(f[20]) : null,
      });
    }
    if (why) { rejected.push({ id, why }); continue; }
    storms.push({
      id, name: name === 'UNNAMED' ? '' : name, basin: id.slice(0, 2),
      year: Number(id.slice(4)), fixes,
    });
  }
  return { storms, rejected };
}
