/** Thin client over the local proxy. Every call returns data or throws. */

/*
 * Resolve against the document's directory rather than the origin. Served at
 * `/` locally this is identical, but under `/weather/` on the website
 * `location.origin` would send every call to the apex — a different site.
 */
const API_BASE = new URL('./', location.href);

async function get(path, params) {
  const u = new URL(path.replace(/^\//, ''), API_BASE);
  for (const [k, v] of Object.entries(params || {})) if (v != null) u.searchParams.set(k, v);
  const res = await fetch(u, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

export const api = {
  config: () => get('/api/config'),
  bundle: (lat, lon) => get('/api/bundle', { lat, lon }),
  climate: (lat, lon) => get('/api/climate', { lat, lon }),
  models: (lat, lon) => get('/api/models', { lat, lon }),
  pollen: (lat, lon) => get('/api/pollen', { lat, lon }),
  observations: (lat, lon) => get('/api/observations', { lat, lon }),
  radar: () => get('/api/radar'),
  space: () => get('/api/space'),
  aurora: () => get('/api/aurora'),
  iss: () => get('/api/iss'),
  aircraft: (lat, lon, dist) => get('/api/aircraft', { lat, lon, dist }),
  flight: (cs, hex) => get('/api/flight', { cs, hex }),
  geocode: (q) => get('/api/geocode', { q }),
  reverse: (lat, lon) => get('/api/reverse', { lat, lon }),
};
