#!/usr/bin/env node
/**
 * ATMOS//NET — local weather console server.
 *
 * Serves the static portal and acts as a caching proxy for every upstream
 * feed. Proxying buys us three things the browser can't do alone: no CORS
 * problems, a shared cache so a page reload doesn't re-hammer the APIs, and
 * one place to degrade gracefully when a single upstream is down.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

/*
 * Lambda gives each execution environment a writable /tmp that survives warm
 * invocations, which is exactly the property the local server's on-disk cache
 * wanted: the 33-year climate archive is fetched once and reused, rather than
 * re-fetched on every request.
 */
const CACHE_DIR = '/tmp/atmos-cache';
const UA = 'ATMOS-NET/1.0 (personal weather portal)';

/*
 * A neutral starting point for the public site — NOT the operator's home.
 * A real city rather than (0,0): an ocean point has no NWS coverage, so
 * alerts and station observations would render dead on first impression.
 * The visitor is offered their own location immediately after first paint.
 */
const HOME = {
  name: 'Los Angeles',
  admin1: 'California',
  country_code: 'US',
  latitude: 34.0522,
  longitude: -118.2437,
  timezone: 'America/Los_Angeles',
};

const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR;

/* ------------------------------------------------------------------ cache */

const mem = new Map();

function memGet(key) {
  const hit = mem.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) { mem.delete(key); return null; }
  return hit.data;
}
function memSet(key, data, ttl) {
  mem.set(key, { data, exp: Date.now() + ttl });
  // Keep the map from growing without bound over long uptimes.
  if (mem.size > 400) {
    const now = Date.now();
    for (const [k, v] of mem) if (now > v.exp) mem.delete(k);
  }
}

const diskPath = (key) => path.join(CACHE_DIR, key.replace(/[^a-z0-9._-]/gi, '_') + '.json');

async function diskGet(key, ttl) {
  try {
    const p = diskPath(key);
    const st = await fs.stat(p);
    if (Date.now() - st.mtimeMs > ttl) return null;
    return JSON.parse(await fs.readFile(p, 'utf8'));
  } catch { return null; }
}
async function diskSet(key, data) {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(diskPath(key), JSON.stringify(data));
  } catch { /* cache writes are best-effort */ }
}

/**
 * Fetch JSON with layered caching. `disk: true` survives restarts, which is
 * what we want for the 31-year climate archive (expensive, changes yearly).
 */
async function cachedJSON(key, ttl, url, { disk = false, text = false } = {}) {
  const hit = memGet(key);
  if (hit) return hit;
  if (disk) {
    const d = await diskGet(key, ttl);
    if (d) { memSet(key, d, Math.min(ttl, HOUR)); return d; }
  }
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: text ? 'text/plain' : 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} :: ${url.slice(0, 120)}`);
  const data = text ? await res.text() : await res.json();
  memSet(key, data, ttl);
  if (disk) await diskSet(key, data);
  return data;
}

/** Wrap a fetch so one dead upstream degrades a panel instead of the page. */
async function soft(label, fn) {
  try { return { ok: true, data: await fn() }; }
  catch (err) { return { ok: false, error: String(err.message || err), label }; }
}

/* ---------------------------------------------------------------- upstream */

const om = (host, params) => {
  const u = new URL(`https://${host}`);
  for (const [k, v] of Object.entries(params)) if (v != null) u.searchParams.set(k, v);
  return u.toString();
};

const IMPERIAL = {
  temperature_unit: 'fahrenheit',
  wind_speed_unit: 'mph',
  precipitation_unit: 'inch',
  timezone: 'auto',
};

const HOURLY = [
  'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature',
  'precipitation_probability', 'precipitation', 'rain', 'showers', 'snowfall', 'snow_depth',
  'weather_code', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low',
  'cloud_cover_mid', 'cloud_cover_high', 'visibility', 'vapour_pressure_deficit',
  'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m', 'uv_index', 'uv_index_clear_sky',
  'is_day', 'sunshine_duration', 'cape', 'lifted_index', 'convective_inhibition',
  'freezing_level_height', 'boundary_layer_height', 'wet_bulb_temperature_2m',
  'soil_temperature_0cm', 'soil_moisture_0_to_1cm', 'et0_fao_evapotranspiration',
].join(',');

const DAILY = [
  'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'apparent_temperature_max',
  'apparent_temperature_min', 'sunrise', 'sunset', 'daylight_duration', 'sunshine_duration',
  'uv_index_max', 'precipitation_sum', 'rain_sum', 'showers_sum', 'snowfall_sum',
  'precipitation_hours', 'precipitation_probability_max', 'wind_speed_10m_max',
  'wind_gusts_10m_max', 'wind_direction_10m_dominant', 'shortwave_radiation_sum',
  'et0_fao_evapotranspiration',
].join(',');

const CURRENT = [
  'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day', 'precipitation',
  'rain', 'showers', 'snowfall', 'weather_code', 'cloud_cover', 'pressure_msl',
  'surface_pressure', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
].join(',');

// 15-minute resolution is only published where HRRR / ICON-D2 reach, which
// covers North America and central Europe. Elsewhere these arrays come back
// null-filled and the nowcast falls back to hourly interpolation.
const MIN15 = ['precipitation', 'weather_code', 'cape', 'visibility', 'wind_gusts_10m', 'is_day'].join(',');

const AQ_VARS = [
  'us_aqi', 'pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'sulphur_dioxide',
  'ozone', 'aerosol_optical_depth', 'dust', 'uv_index', 'alder_pollen', 'birch_pollen',
  'grass_pollen', 'mugwort_pollen', 'olive_pollen', 'ragweed_pollen',
].join(',');

function forecastURL(lat, lon) {
  return om('api.open-meteo.com/v1/forecast', {
    latitude: lat, longitude: lon,
    current: CURRENT, minutely_15: MIN15, hourly: HOURLY, daily: DAILY,
    ...IMPERIAL, past_days: 2, forecast_days: 16,
  });
}

function airURL(lat, lon) {
  return om('air-quality-api.open-meteo.com/v1/air-quality', {
    latitude: lat, longitude: lon,
    current: AQ_VARS, hourly: AQ_VARS,
    timezone: 'auto', past_days: 1, forecast_days: 5,
  });
}

function modelsURL(lat, lon) {
  return om('api.open-meteo.com/v1/forecast', {
    latitude: lat, longitude: lon,
    hourly: 'temperature_2m,precipitation,cloud_cover',
    models: 'gfs_seamless,ecmwf_ifs025,icon_seamless,gem_seamless,meteofrance_seamless',
    ...IMPERIAL, forecast_days: 10,
  });
}

function climateURL(lat, lon) {
  const end = new Date(Date.now() - 6 * DAY).toISOString().slice(0, 10); // archive lags ~5d
  return om('archive-api.open-meteo.com/v1/archive', {
    latitude: lat, longitude: lon,
    start_date: '1994-01-01', end_date: end,
    daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum',
    ...IMPERIAL,
  });
}

/* ---------------------------------------------------------------- handlers */

const routes = {

  async '/api/config'() {
    // `public: true` is what tells the frontend to offer geolocation; the
    // local server omits it, so the console never prompts on the tailnet.
    return { home: HOME, public: true, version: '1.0.0' };
  },

  /** Everything the console needs for one location, in one round trip. */
  async '/api/bundle'(q) {
    const lat = Number(q.get('lat')), lon = Number(q.get('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new HttpError(400, 'lat/lon required');
    const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;

    const [forecast, air, alerts, space] = await Promise.all([
      soft('forecast', () => cachedJSON(`fc_${key}`, 5 * MIN, forecastURL(lat, lon))),
      soft('air', () => cachedJSON(`aq_${key}`, 20 * MIN, airURL(lat, lon))),
      soft('alerts', () => cachedJSON(`al_${key}`, 2 * MIN,
        `https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`)),
      soft('space', () => spaceWeather()),
    ]);

    return { key, lat, lon, fetched: Date.now(), forecast, air, alerts, space };
  },

  async '/api/models'(q) {
    const lat = Number(q.get('lat')), lon = Number(q.get('lon'));
    return cachedJSON(`md_${lat.toFixed(2)},${lon.toFixed(2)}`, 30 * MIN, modelsURL(lat, lon));
  },

  /**
   * 31 years of daily observations, reduced server-side to day-of-year
   * normals and records so the browser never sees 11k rows.
   */
  async '/api/climate'(q) {
    const lat = Number(q.get('lat')), lon = Number(q.get('lon'));
    const key = `cl_${lat.toFixed(2)},${lon.toFixed(2)}`;
    const hit = memGet(key + '_reduced');
    if (hit) return hit;
    const raw = await cachedJSON(key, 30 * DAY, climateURL(lat, lon), { disk: true });
    const reduced = reduceClimate(raw);
    memSet(key + '_reduced', reduced, 12 * HOUR);
    return reduced;
  },

  async '/api/geocode'(q) {
    const name = (q.get('q') || '').trim();
    if (name.length < 2) return { results: [] };
    return cachedJSON(`gc_${name.toLowerCase()}`, DAY,
      om('geocoding-api.open-meteo.com/v1/search', { name, count: 8, language: 'en', format: 'json' }));
  },

  async '/api/reverse'(q) {
    // Open-Meteo has no reverse geocoder; BigDataCloud's is free and keyless.
    const lat = Number(q.get('lat')), lon = Number(q.get('lon'));
    return cachedJSON(`rv_${lat.toFixed(3)},${lon.toFixed(3)}`, DAY,
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
  },


  /**
   * Pollen. Open-Meteo's pollen model is CAMS Europe, so it returns nulls
   * across the Americas; for US points we fall back to pollen.com's public
   * ZIP endpoint (which needs a Referer to answer).
   */
  async '/api/pollen'(q) {
    const lat = Number(q.get('lat')), lon = Number(q.get('lon'));
    let zip = q.get('zip');
    if (!zip) {
      const rev = await soft('rev', () => cachedJSON(`rv_${lat.toFixed(3)},${lon.toFixed(3)}`, DAY,
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`));
      zip = rev.ok ? rev.data.postcode : null;
      if (rev.ok && rev.data.countryCode !== 'US') return { source: 'none', reason: 'outside US coverage' };
    }
    if (!zip) return { source: 'none', reason: 'no postal code for this point' };
    const key = `pl_${zip}`;
    const hit = memGet(key);
    if (hit) return hit;

    const grab = async (kind) => {
      const res = await fetch(`https://www.pollen.com/api/forecast/${kind}/pollen/${zip}`, {
        headers: {
          Referer: `https://www.pollen.com/forecast/${kind}/pollen/${zip}`,
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)',
        },
      });
      if (!res.ok) throw new Error(`pollen.com ${res.status}`);
      return res.json();
    };
    const [cur, ext] = await Promise.all([soft('cur', () => grab('current')), soft('ext', () => grab('extended'))]);
    if (!cur.ok) return { source: 'none', reason: cur.error };

    const periods = cur.data?.Location?.periods || [];
    const today = periods.find((p) => p.Type === 'Today') || periods[1] || periods[0];
    const out = {
      source: 'pollen.com',
      zip,
      place: cur.data?.Location?.DisplayLocation,
      index: today?.Index ?? null,
      yesterday: periods.find((p) => p.Type === 'Yesterday')?.Index ?? null,
      tomorrow: periods.find((p) => p.Type === 'Tomorrow')?.Index ?? null,
      triggers: (today?.Triggers || []).map((t) => ({ name: t.Name, type: t.PlantType, genus: t.Genus })),
      forecast: ext.ok ? (ext.data?.Location?.periods || []).map((p) => ({ date: p.Period, index: p.Index })) : [],
    };
    memSet(key, out, 3 * HOUR);
    return out;
  },


  /**
   * Nearest real thermometer.
   *
   * Everything else this server returns is model output — including
   * Open-Meteo's "current" block, which is just the current step of its
   * 15-minute forecast, not a measurement. NWS publishes actual station
   * observations, so the console can show what the air is really doing
   * next to what the model thinks.
   */
  async '/api/observations'(q) {
    const lat = Number(q.get('lat')), lon = Number(q.get('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new HttpError(400, 'lat/lon required');
    const key = `obs_${lat.toFixed(3)},${lon.toFixed(3)}`;
    const hit = memGet(key);
    if (hit) return hit;

    // The station list for a point is stable; the observations are not.
    const stations = await cachedJSON(`stn_${lat.toFixed(3)},${lon.toFixed(3)}`, 7 * DAY,
      `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}/stations`, { disk: true });

    const near = (stations.features || [])
      .map((f) => ({
        id: f.properties?.stationIdentifier,
        name: f.properties?.name,
        lon: f.geometry?.coordinates?.[0],
        lat: f.geometry?.coordinates?.[1],
      }))
      .filter((s) => s.id && Number.isFinite(s.lat))
      .map((s) => ({ ...s, distanceMi: haversineMi(lat, lon, s.lat, s.lon) }))
      .sort((a, b) => a.distanceMi - b.distanceMi)
      .slice(0, 5);

    // Walk outward until a station actually reports a temperature. The nearest
    // one frequently returns null on /latest, so fall back to its recent list
    // before giving up on it.
    for (const st of near) {
      const reading = await soft('obs', async () => {
        const latest = await cachedJSON(`obsl_${st.id}`, 5 * MIN,
          `https://api.weather.gov/stations/${st.id}/observations/latest`);
        if (latest?.properties?.temperature?.value != null) return latest.properties;
        const recent = await cachedJSON(`obsr_${st.id}`, 5 * MIN,
          `https://api.weather.gov/stations/${st.id}/observations?limit=3`);
        return (recent.features || [])
          .map((f) => f.properties)
          .find((pr) => pr?.temperature?.value != null) || null;
      });
      if (!reading.ok || !reading.data) continue;

      const pr = reading.data;
      const out = {
        station: st.id,
        name: st.name,
        distanceMi: +st.distanceMi.toFixed(1),
        time: pr.timestamp,
        tempF: cToF(pr.temperature?.value),
        dewpointF: cToF(pr.dewpoint?.value),
        humidity: pr.relativeHumidity?.value == null ? null : Math.round(pr.relativeHumidity.value),
        windMph: pr.windSpeed?.value == null ? null : +(pr.windSpeed.value * 0.621371).toFixed(1),
        description: pr.textDescription || null,
      };
      memSet(key, out, 5 * MIN);
      return out;
    }
    return { station: null, reason: 'no nearby station is reporting a temperature' };
  },

  async '/api/radar'() {
    return cachedJSON('radar_index', 2 * MIN, 'https://api.rainviewer.com/public/weather-maps.json');
  },

  async '/api/space'() { return spaceWeather(); },

  async '/api/aurora'() {
    // ~900 KB of 1-degree grid; downsampled here to keep the wire light.
    const key = 'ovation_reduced';
    const hit = memGet(key);
    if (hit) return hit;
    const raw = await cachedJSON('ovation_raw', 10 * MIN, 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json');
    const out = { observed: raw['Observation Time'], forecast: raw['Forecast Time'], cells: [] };
    for (const [lon, lat, val] of raw.coordinates) {
      if (val >= 3 && Math.abs(lat) > 35) out.cells.push([lon > 180 ? lon - 360 : lon, lat, val]);
    }
    memSet(key, out, 10 * MIN);
    return out;
  },

  /*
   * Aircraft overhead.
   *
   * Two volunteer-run feeds, tried in order -- both are readsb-shaped, so the
   * second is a drop-in when the first is unreachable. Positions cache for ten
   * seconds and the key is snapped to a tenth of a degree, so the site makes
   * one upstream call per ten seconds per neighbourhood however many people
   * are watching. That restraint is for their sake more than ours: these are
   * hobbyists' receivers and nobody is being paid for them.
   *
   * Only the fields the map draws are passed on. The raw feed is 52KB for a
   * hundred aircraft; this is a fraction of that, which matters on a phone.
   */
  /**
   * ELSEWHERE's sentence, written by a model.
   *
   * The rules already produce a serviceable sentence with no key at all
   * (`lib/elsewhere.js` `verdict()`), and that is what the page shows until
   * and unless this answers. This route is the upgrade, never the source of
   * truth: every failure path returns `{ text: null }` and the page keeps
   * what it had.
   *
   * THIS ENDPOINT SITS IN FRONT OF AN API KEY ON A PUBLIC URL, so nothing the
   * caller sends reaches the model as text. The facts are parsed, type-checked
   * and re-rendered into a prompt this file writes; a place name is the only
   * string that survives, and it survives only if it looks like a place name
   * and is under 40 characters. Without that, the route is a free LLM with
   * somebody else's credit card attached.
   */
  async '/api/elsewhere'(q) {
    const raw = q.get('q') || '';
    // A whole prompt cannot hide in 1.5KB of base64 once the fields below
    // have been enforced, but the cap keeps the parse cheap regardless.
    if (raw.length > 1500) throw new HttpError(400, 'too much');

    let input;
    try { input = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')); }
    catch { throw new HttpError(400, 'bad q'); }

    // Letters, spaces and the punctuation that actually appears in place
    // names. Anything else is not a place and is not going anywhere near a
    // prompt.
    const NAME = /^[\p{L}\p{M}0-9 .,'&()\/-]{1,40}$/u;
    const name = (v) => (typeof v === 'string' && NAME.test(v.trim()) ? v.trim() : null);
    const int = (v, lo, hi) => {
      const n = Math.round(Number(v));
      return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : null;
    };
    const SKY = ['clear', 'some cloud', 'cloudy', 'overcast', 'raining', 'drizzling',
      'blowing hard'];
    const sky = (v) => (SKY.includes(v) ? v : null);

    const here = name(input?.here);
    if (!here) throw new HttpError(400, 'here');
    const rows = (Array.isArray(input?.rows) ? input.rows : []).slice(0, 8)
      .map((r) => ({
        name: name(r?.name),
        delta: int(r?.delta, -150, 150),
        sky: sky(r?.sky),
        better: r?.better === true,
        night: r?.night === true,
      }))
      .filter((r) => r.name && r.delta !== null);
    if (!rows.length) throw new HttpError(400, 'rows');

    /*
     * Counted here, from the rows that survived validation, and never taken
     * from the caller. Asked to count for itself the model said "one other
     * place beats here" about a list where exactly one place did — a claim
     * the data contradicts, which is the only kind of wrong that matters.
     */
    const facts = {
      here: { name: here, sky: sky(input?.hereSky), score: int(input?.hereScore, 0, 100) },
      betterCount: rows.filter((r) => r.better).length,
      places: rows,
    };

    const key = process.env.ANTHROPIC_API_KEY;
    // No key configured is the normal state of this site, not an error: the
    // page has a sentence already and simply keeps it.
    if (!key) return { text: null, why: 'no key' };

    const cacheKey = 'ew_' + Buffer.from(JSON.stringify(facts)).toString('base64url').slice(0, 90);
    const hit = memGet(cacheKey);
    if (hit) return hit;

    const system = [
      'You write one sentence for a weather console, answering "is it nicer somewhere else right now?"',
      '',
      'The console has a house voice. Real lines from it:',
      '  "It is raining now and should ease within 12 minutes."',
      '  "Very dry air, dew point 34 degrees. Expect static and chapped lips."',
      '',
      'Declarative, present tense, no evaluative adjectives, figures stated plainly.',
      '',
      'Rules:',
      '- ONE sentence, under 25 words.',
      '- Use ONLY the figures given. Never invent a place, a temperature or a condition.',
      '- Lead with the best place that beats here, and name here too so the comparison is explicit.',
      '- betterCount is exactly how many places beat here. Never state a number that',
      '  disagrees with it, and never imply another place beats here when it is 1.',
      '- If nothing beats here, say that plainly and name here.',
      '- Degrees are relative to here and already signed by the words warmer/colder.',
      '- Never use: perfect, ideal, stunning, beautiful, gorgeous, paradise, escape, "worth it".',
      'No exclamation marks.',
      '- Return the sentence and nothing else.',
    ].join('\n');

    // A slow sentence is worse than a deterministic one, so this gets four
    // seconds and then the page keeps what it had.
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 4000);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: ac.signal,
        headers: {
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': key,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5',
          max_tokens: 120,
          system,
          messages: [{ role: 'user', content: JSON.stringify(facts) }],
        }),
      });
      if (!res.ok) return { text: null, why: `upstream ${res.status}` };
      const j = await res.json();
      // One line per model call, carrying the token counts the API returned,
      // so scripts/spend-check.mjs can price the month from the logs with a
      // CloudWatch Insights query and no Admin key. The local server just
      // prints it.
      console.log(JSON.stringify({
        metric: 'anthropic', model: 'claude-sonnet-5',
        input_tokens: j.usage?.input_tokens ?? null,
        output_tokens: j.usage?.output_tokens ?? null,
      }));
      const text = (j.content || []).filter((b) => b.type === 'text')
        .map((b) => b.text).join('').trim();
      // A model that ignores "one sentence" is a model that ignored the rest
      // of the brief too; the rules sentence is better than a paragraph here.
      if (!text || text.length > 240) return { text: null, why: 'unusable' };
      const out = { text, model: 'claude-sonnet-5' };
      memSet(cacheKey, out, 30 * 60e3);
      return out;
    } catch (e) {
      return { text: null, why: e.name === 'AbortError' ? 'timeout' : 'error' };
    } finally {
      clearTimeout(timer);
    }
  },

  async '/api/aircraft'(q) {
    const lat = Number(q.get('lat')), lon = Number(q.get('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      const e = new Error('lat and lon are required'); e.status = 400; throw e;
    }
    const nm = Math.max(5, Math.min(120, Number(q.get('dist')) || 40));
    const key = `ac_${lat.toFixed(1)}_${lon.toFixed(1)}_${nm}`;
    const hit = memGet(key);
    if (hit) return hit;

    const feeds = [
      ['adsb.lol', `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${nm}`],
      ['adsb.fi', `https://opendata.adsb.fi/api/v2/lat/${lat}/lon/${lon}/dist/${nm}`],
    ];
    let raw = null, source = null;
    for (const [host, url] of feeds) {
      const r = await soft('feed', () => cachedJSON(`${key}_${host}`, 10_000, url));
      if (r.ok && Array.isArray(r.data?.ac)) { raw = r.data; source = host; break; }
    }
    if (!raw) return { source: null, at: Date.now(), centre: [lat, lon], radiusNm: nm, aircraft: [] };

    const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
    const aircraft = raw.ac
      .filter((a) => Number.isFinite(a.lat) && Number.isFinite(a.lon))
      .map((a) => ({
        hex: a.hex || null,
        cs: (a.flight || '').trim() || null,
        reg: a.r || null,
        type: a.t || null,
        lat: a.lat,
        lon: a.lon,
        // alt_baro carries the string "ground" for anything not airborne.
        alt: a.alt_baro === 'ground' ? 0 : num(a.alt_baro),
        gnd: a.alt_baro === 'ground',
        gs: num(a.gs),              // knots
        trk: num(a.track),          // degrees true
        vs: num(a.baro_rate),       // feet per minute
        dst: num(a.dst),            // nautical miles from the query point
        age: num(a.seen),           // seconds since its last message
      }))
      .sort((x, y) => (x.dst ?? 1e9) - (y.dst ?? 1e9));

    const out = { source, at: Date.now(), centre: [lat, lon], radiusNm: nm, aircraft };
    memSet(key, out, 10_000);
    return out;
  },

  /*
   * One aircraft, looked up only when somebody taps it. Enriching all hundred
   * on every refresh would be a hundred requests every ten seconds against a
   * free service, which is how you get blocked and deserve to be.
   *
   * Routes are keyed by callsign, and airlines reuse callsigns across days, so
   * this is usually right and occasionally a stale pairing. The view says
   * "usually" rather than pretending otherwise.
   */
  async '/api/flight'(q) {
    const cs = (q.get('cs') || '').trim().toUpperCase().slice(0, 12);
    const hex = (q.get('hex') || '').trim().toLowerCase().slice(0, 8);
    const okCs = /^[A-Z0-9]{2,12}$/.test(cs), okHex = /^[0-9a-f]{6,8}$/.test(hex);
    if (!okCs && !okHex) {
      const e = new Error('cs or hex is required'); e.status = 400; throw e;
    }
    const [route, frame] = await Promise.all([
      okCs ? soft('route', () => cachedJSON(`fr_${cs}`, HOUR,
        `https://api.adsbdb.com/v0/callsign/${cs}`)) : { ok: false },
      okHex ? soft('frame', () => cachedJSON(`af_${hex}`, DAY,
        `https://api.adsbdb.com/v0/aircraft/${hex}`)) : { ok: false },
    ]);
    const fr = route.ok ? route.data?.response?.flightroute : null;
    const af = frame.ok ? frame.data?.response?.aircraft : null;
    const place = (x) => (x ? {
      iata: x.iata_code || null,
      name: x.name || null,
      city: x.municipality || null,
      country: x.country_name || null,
    } : null);
    return {
      callsign: fr?.callsign || cs || null,
      airline: fr?.airline?.name || null,
      origin: place(fr?.origin),
      destination: place(fr?.destination),
      aircraft: af ? {
        type: af.type || null,
        icao: af.icao_type || null,
        manufacturer: af.manufacturer || null,
        owner: af.registered_owner || null,
        country: af.registered_owner_country_name || null,
      } : null,
    };
  },

  async '/api/iss'() {
    const [pos, tle] = await Promise.all([
      soft('pos', () => cachedJSON('iss_pos', 10_000, 'https://api.wheretheiss.at/v1/satellites/25544')),
      soft('tle', () => cachedJSON('iss_tle', 6 * HOUR,
        'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE', { text: true })),
    ]);
    return { pos, tle };
  },
};

async function spaceWeather() {
  const hit = memGet('space_all');
  if (hit) return hit;
  const B = 'https://services.swpc.noaa.gov/';
  const [kpNow, kpFc, wind, mag, scales, alerts] = await Promise.all([
    soft('kp_now', () => cachedJSON('kp1m', 5 * MIN, B + 'json/planetary_k_index_1m.json')),
    soft('kp_fc', () => cachedJSON('kpfc', 30 * MIN, B + 'products/noaa-planetary-k-index-forecast.json')),
    soft('wind', () => cachedJSON('sw', 5 * MIN, B + 'products/summary/solar-wind-speed.json')),
    soft('mag', () => cachedJSON('mag', 5 * MIN, B + 'products/summary/solar-wind-mag-field.json')),
    soft('scales', () => cachedJSON('scales', 15 * MIN, B + 'products/noaa-scales.json')),
    soft('alerts', () => cachedJSON('spalerts', 15 * MIN, B + 'products/alerts.json')),
  ]);
  const out = { kpNow, kpFc, wind, mag, scales, alerts, fetched: Date.now() };
  memSet('space_all', out, 5 * MIN);
  return out;
}

/**
 * Collapse the daily archive into per-day-of-year statistics: mean high/low
 * (the "normal"), record high/low with the year they occurred, and mean
 * precipitation. Uses a +/-3 day window so a single freak day doesn't make
 * the normals jagged.
 */
function reduceClimate(raw) {
  const d = raw?.daily;
  if (!d?.time?.length) return { doy: [], years: 0 };
  const buckets = Array.from({ length: 366 }, () => ({ hi: [], lo: [], pr: [] }));

  for (let i = 0; i < d.time.length; i++) {
    const [y, m, day] = d.time[i].split('-').map(Number);
    const doy = dayOfYear(m, day);
    const hi = d.temperature_2m_max[i], lo = d.temperature_2m_min[i], pr = d.precipitation_sum[i];
    if (hi != null) buckets[doy].hi.push([hi, y]);
    if (lo != null) buckets[doy].lo.push([lo, y]);
    if (pr != null) buckets[doy].pr.push(pr);
  }

  const win = (idx, key) => {
    const out = [];
    for (let k = -3; k <= 3; k++) out.push(...buckets[(idx + k + 366) % 366][key]);
    return out;
  };

  const doy = buckets.map((_, i) => {
    const hi = win(i, 'hi'), lo = win(i, 'lo'), pr = win(i, 'pr');
    if (!hi.length) return null;
    const maxHi = hi.reduce((a, b) => (b[0] > a[0] ? b : a));
    const minLo = lo.length ? lo.reduce((a, b) => (b[0] < a[0] ? b : a)) : [null, null];
    return {
      normalHigh: +(hi.reduce((s, v) => s + v[0], 0) / hi.length).toFixed(1),
      normalLow: lo.length ? +(lo.reduce((s, v) => s + v[0], 0) / lo.length).toFixed(1) : null,
      recordHigh: maxHi[0], recordHighYear: maxHi[1],
      recordLow: minLo[0], recordLowYear: minLo[1],
      meanPrecip: +(pr.reduce((s, v) => s + v, 0) / Math.max(1, pr.length)).toFixed(3),
      wetFrac: +(pr.filter((v) => v >= 0.01).length / Math.max(1, pr.length)).toFixed(3),
    };
  });

  // Annual mean-temperature series, for the warming-trend chart.
  const byYear = new Map();
  for (let i = 0; i < d.time.length; i++) {
    const y = +d.time[i].slice(0, 4);
    const mean = d.temperature_2m_mean?.[i];
    if (mean == null) continue;
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(mean);
  }
  const annual = [...byYear.entries()]
    .filter(([, v]) => v.length > 300)
    .map(([y, v]) => ({ year: y, mean: +(v.reduce((s, x) => s + x, 0) / v.length).toFixed(2) }))
    .sort((a, b) => a.year - b.year);

  return {
    doy, annual,
    start: d.time[0], end: d.time.at(-1),
    years: new Set(d.time.map((t) => t.slice(0, 4))).size,
  };
}

const cToF = (c) => (c == null ? null : +(c * 9 / 5 + 32).toFixed(1));

/** Great-circle distance in statute miles. */
function haversineMi(lat1, lon1, lat2, lon2) {
  const R = 3958.7613;
  const toR = Math.PI / 180;
  const dLat = (lat2 - lat1) * toR, dLon = (lon2 - lon1) * toR;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * toR) * Math.cos(lat2 * toR) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function dayOfYear(m, d) {
  const cum = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335]; // leap-inclusive
  return cum[m - 1] + d - 1;
}

/* ------------------------------------------------------------ lambda glue */

/*
 * Edge caching does the job the local server's in-memory TTLs did, but better:
 * CloudFront serves one upstream fetch to every visitor worldwide, instead of
 * each Lambda execution environment keeping its own copy. The values mirror
 * the server's TTLs; the climate archive is effectively static once reduced.
 */
const EDGE_CACHE = {
  '/api/config': 'public, max-age=3600',
  '/api/bundle': 'public, s-maxage=300, stale-while-revalidate=600',
  '/api/models': 'public, s-maxage=1800, stale-while-revalidate=3600',
  '/api/climate': 'public, s-maxage=2592000, stale-while-revalidate=86400',
  '/api/geocode': 'public, s-maxage=86400',
  '/api/reverse': 'public, s-maxage=86400',
  '/api/pollen': 'public, s-maxage=10800, stale-while-revalidate=3600',
  '/api/observations': 'public, s-maxage=300, stale-while-revalidate=600',
  '/api/radar': 'public, s-maxage=120',
  '/api/space': 'public, s-maxage=300',
  '/api/aurora': 'public, s-maxage=600',
  '/api/iss': 'public, s-maxage=10',
  // Ten seconds is about 2.5km for a jet -- a pixel or two at the zoom this
  // is watched at, and a hundredfold cut in load on somebody's hobby server.
  '/api/aircraft': 'public, s-maxage=10',
  '/api/flight': 'public, s-maxage=3600',
  // Half an hour. The facts are whole degrees and a handful of condition
  // words, so they repeat for long stretches and one model call serves
  // everyone who loads the page in that window.
  '/api/elsewhere': 'public, s-maxage=1800, stale-while-revalidate=1800',
};

/**
 * Lambda Function URL handler (payload format 2.0).
 *
 * CloudFront forwards the site path (e.g. /weather/api/bundle), so the route
 * is matched on the trailing `/api/<name>` rather than the whole path. No CORS
 * headers: the API is served from the same origin as the page through the same
 * CloudFront distribution, so it is same-origin by construction.
 */
export const handler = async (event) => {
  const rawPath = event?.rawPath || '/';
  const m = rawPath.match(/(\/api\/[a-z]+)\/?$/);
  const route = m && routes[m[1]] ? m[1] : null;

  const reply = (status, body, cache) => ({
    statusCode: status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache || 'no-store',
      'x-content-type-options': 'nosniff',
    },
    body: JSON.stringify(body),
  });

  if ((event?.requestContext?.http?.method || 'GET') !== 'GET') {
    return reply(405, { error: 'method not allowed' });
  }
  if (!route) return reply(404, { error: `no such route: ${rawPath}` });

  const params = new URLSearchParams(event.rawQueryString || '');
  try {
    const body = await routes[route](params);
    return reply(200, body, EDGE_CACHE[route]);
  } catch (err) {
    const status = err.status || 502;
    console.error(`[api] ${route} -> ${status}: ${err.message}`);
    // Do not let a transient upstream failure be cached at the edge.
    return reply(status, { error: err.message });
  }
};

class HttpError extends Error {
  constructor(status, msg) { super(msg); this.status = status; }
}
