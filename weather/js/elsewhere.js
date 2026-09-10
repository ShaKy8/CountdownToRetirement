/**
 * ELSEWHERE — the panel.
 *
 * Ranks the places Kyle has been against wherever the visitor is, worst-first
 * being the point: the answer "nowhere is better than here" is as useful as a
 * list, and more common than you would think.
 *
 * The rules live in lib/elsewhere.js and are pure. This file is the part that
 * touches the network and the DOM, and it is deliberately the only part that
 * does — everything it renders comes back out of `rank()` and `phrase()`.
 */

import { api } from './api.js';
import { store } from './state.js';
import { escapeHtml as esc } from './lib/util.js';
import { fromCurrent, rank, comfort, headline, phrase, verdict } from './lib/elsewhere.js';

/*
 * The trip list is the canonical list of Kyle's places and it is already
 * deployed, so it is read rather than copied. Standalone in the Weather repo
 * there is no site around this page and the fetch 404s, which is what the
 * fallback is for — the panel is not worth a build step.
 */
const PLACES_URL = '../countdown/stats.json';
const FALLBACK = [
  { place: 'San Francisco, California', lat: 37.7749, lon: -122.4194 },
  { place: 'Vancouver, Canada', lat: 49.2497, lon: -123.1193 },
  { place: 'Grants Pass, Oregon', lat: 42.4393, lon: -123.3307 },
];

/* Five extra bundles is five extra upstream fetches, so this is not eager. */
const REFRESH_MS = 10 * 60 * 1000;

export function createElsewhere(root) {
  root.className = 'panel elsewhere';
  root.innerHTML = `
    <div class="hd">ELSEWHERE<span class="rule"></span><span class="val" id="ew-count">—</span></div>
    <div class="body">
      <div class="ew-list" id="ew-list"><div class="ew-empty">Looking…</div></div>
      <p class="ew-say" id="ew-say"></p>
    </div>`;

  const $ = (id) => root.querySelector(`#${id}`);
  let places = null;
  let fetchedAt = 0;
  let rows = [];
  let lastKey = '';
  let busy = false;

  async function loadPlaces() {
    if (places) return places;
    try {
      const j = await (await fetch(new URL(PLACES_URL, location.href), { cache: 'no-cache' })).json();
      const list = Array.isArray(j?.trips) ? j.trips : [];
      places = list.filter((t) => t && typeof t.lat === 'number' && typeof t.lon === 'number');
      if (!places.length) {
        console.warn('ELSEWHERE: trip list had no usable coordinates; using the fallback');
        places = FALLBACK;
      }
    } catch (e) {
      // Say so. A silent fallback here looks exactly like a working panel
      // with the wrong places in it, which is the worst of both.
      console.warn('ELSEWHERE: could not read the trip list, using the fallback —', e.message);
      places = FALLBACK;
    }
    return places;
  }

  /** One place's current conditions, or null. A place that fails is dropped. */
  async function conditionsFor(p) {
    try {
      const b = await api.bundle(p.lat, p.lon);
      const d = b?.forecast?.data;
      if (!d?.current) return null;
      const hour = Number(String(d.current.time || '').slice(11, 13));
      return fromCurrent(p.place, d.current, d.current_units,
        { localHour: Number.isFinite(hour) ? hour : null });
    } catch {
      return null;
    }
  }

  async function refresh() {
    const loc = store.loc;
    if (!loc || busy) return;
    // Keyed on the location as well as the clock: moving the map to another
    // city has to re-rank, and sitting still must not re-fetch.
    const key = `${loc.lat?.toFixed(2)},${loc.lon?.toFixed(2)}`;
    if (key === lastKey && Date.now() - fetchedAt < REFRESH_MS) return;

    busy = true;
    try {
      const list = await loadPlaces();
      const here = await conditionsFor({ place: loc.name || 'here', lat: loc.lat, lon: loc.lon });
      if (!here) return;
      const there = (await Promise.all(list.map(conditionsFor))).filter(Boolean);
      rows = rank(here, there);
      lastKey = key;
      fetchedAt = Date.now();
      render(here);
      // The deterministic sentence is already on screen by now. This replaces
      // it only if it comes back, and never blocks the list on the network.
      say(here);
    } finally {
      busy = false;
    }
  }

  function render(here) {
    const hereScore = comfort(here);
    const better = rows.filter((r) => r.better);
    $('ew-count').textContent = rows.length
      ? (better.length ? `${better.length} better` : 'none better')
      : '—';

    if (!rows.length) {
      $('ew-list').innerHTML = '<div class="ew-empty">No places to compare.</div>';
      $('ew-say').textContent = '';
      return;
    }

    const row = (r) => `
      <div class="ew-row${r.better ? ' is-better' : ''}">
        <span class="ew-name">${esc(r.name)}</span>
        <span class="ew-what">${esc(phrase(r))}</span>
      </div>`;

    /*
     * "Here" is drawn as the line the list is split by, rather than as another
     * row. The whole question is which side of it a place falls on, and a
     * highlighted row among rows makes that something you have to look for.
     */
    const hereLine = `
      <div class="ew-here">
        <span class="ew-name">${esc(here.name)}</span>
        <span class="ew-what">here · ${esc(headline(here) || '')}${
          Number.isFinite(hereScore) ? ` · ${hereScore}/100` : ''}</span>
      </div>`;

    $('ew-list').innerHTML =
      better.map(row).join('') + hereLine + rows.filter((r) => !r.better).map(row).join('');
    $('ew-say').textContent = verdict(here.name, rows);
  }

  /**
   * Ask the API for a better sentence than the rules wrote.
   *
   * Everything about this is best-effort. `verdict()` is already rendered, the
   * route answers `{ text: null }` when no key is configured — which is this
   * site's normal state — and any failure at all leaves what is on screen
   * exactly where it is.
   */
  async function say(here) {
    try {
      const facts = {
        here: here.name,
        hereSky: headline(here),
        hereScore: comfort(here),
        rows: rows.map((r) => ({
          name: r.name,
          delta: r.deltaShown ?? r.deltaC,
          sky: r.headline,
          better: r.better,
          night: r.night,
        })),
      };
      const q = btoa(unescape(encodeURIComponent(JSON.stringify(facts))))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const res = await api.elsewhere(q);
      // Only ever an upgrade: no text means keep the rules' sentence.
      if (res?.text && lastKey) $('ew-say').textContent = res.text;
    } catch { /* the sentence on screen stays */ }
  }

  return {
    update() { refresh(); },
    onHide() { /* nothing polls; the throttle does the work */ },
  };
}
