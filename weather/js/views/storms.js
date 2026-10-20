/**
 * STORMS — the hurricane atlas, a mode of RADAR.
 *
 * Every Atlantic and East/Central Pacific tropical cyclone in NHC's
 * best-track archive that came near the visitor, drawn on the radar's map:
 * faint by default, tap one to replay it, or sweep through the years and
 * watch each season's storms grow. The rules (distances, categories, season
 * progress) are in lib/storms.js; this file draws and listens.
 *
 * The archive is a snapshot built by scripts/fetch-storms.mjs and read from
 * our own origin (/storms/), never from NHC. It is loaded when this mode is
 * first opened, and this whole file with it: RADAR's own bundle does not carry
 * it. Without the snapshot (the standalone Weather server has none) the panel
 * says so and RADAR is otherwise unchanged.
 *
 * It owns its own clock. The footer's scrubber is tied to the forecast
 * window, which a storm from 1992 can never be inside, so a replay has its own
 * playhead and the radar's loop stands down while this mode is on.
 */

import { store } from '../state.js';
import { alpha, haloText, DIM, FAINT, INK, SERIES } from '../charts.js';
import { escapeHtml as esc } from '../lib/util.js';
import { decodeArchive, STATUS_NAME } from '../lib/stormpack.js';
import * as S from '../lib/storms.js';

const NEAR_MI = 500;
const RINGS_MI = [100, 150];
const YEARS_PER_SECOND = 5;
const REPLAY_SECONDS = 9;
const PICK_PX = 24;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BASIN_NAME = { AL: 'Atlantic', EP: 'East Pacific', CP: 'Central Pacific' };

/** "Sep 11, 1976, 03Z" — the archive's own UTC, with no locale to get wrong. */
function when(ms, withHour = false) {
  const d = new Date(ms);
  const day = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  return withHour ? `${day}, ${String(d.getUTCHours()).padStart(2, '0')}Z` : day;
}

const mi = (km) => km / S.KM_PER_MI;
const wrap180 = (d) => ((((d + 180) % 360) + 360) % 360) - 180;

async function getJSON(url) {
  const res = await fetch(url);
  if (res.status === 404) { const e = new Error('absent'); e.absent = true; throw e; }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function createStorms({ map, panel, hud, root }) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let active = false;
  let visible = true;                 // the RADAR view is on screen
  let state = 'idle';                 // idle | loading | ready | absent | fail
  let storms = [];
  let index = null;
  let near = [];                      // nearbyStorms() for the current place
  let selected = null;                // a decoded storm
  let replay = { t: 0, playing: false };
  let sweep = { on: false, p: 0, first: 1851, last: 2025 };
  let loopId = 0, lastFrame = 0;
  let overlayAdded = false;

  const $ = (sel) => panel.querySelector(sel);
  const place = () => store.loc;

  /* ------------------------------------------------------------- data */

  async function load() {
    if (state === 'loading' || state === 'ready') return;
    state = 'loading';
    render();
    try {
      const base = new URL('/storms/', location.origin);
      index = await getJSON(new URL('index.json', base));
      const [al, ep] = await Promise.all(['al', 'ep'].map((b) => getJSON(new URL(index.files[b], base))));
      storms = [...decodeArchive(al), ...decodeArchive(ep)];
      state = 'ready';
      locate();
    } catch (e) {
      state = e.absent ? 'absent' : 'fail';
      if (!e.absent) console.error('[storms]', e);
    }
    render();
    map.invalidate();
  }

  /** Recompute what is near the current place. */
  function locate() {
    const p = place();
    near = state === 'ready' && p ? S.nearbyStorms(storms, p.lat, p.lon, NEAR_MI * S.KM_PER_MI) : [];
    if (near.length) {
      sweep.first = Math.min(...near.map((n) => n.storm.year));
      sweep.last = Math.max(...near.map((n) => n.storm.year));
    }
  }

  /* ----------------------------------------------------------- drawing */

  const colourOf = (w) => (S.category(w) || { color: DIM }).color;

  /**
   * A storm's track in category colours, at the three world copies. `cut`
   * stops it at a time (ms), for the sweep and the replay.
   */
  function drawTrack(ctx, m, s, { a = 1, scale = 1, cut = Infinity, dots = false } = {}) {
    const n = s.n;
    const xs = new Float64Array(n), ys = new Float64Array(n);
    let last = n - 1;
    for (let i = 0; i < n; i++) {
      if (s.t[i] > cut) { last = i - 1; break; }
      [xs[i], ys[i]] = m.project(s.lat[i], s.lon[i]);
    }
    if (last < 0) return;
    const W = 256 * 2 ** m.zoom;
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i <= last; i++) { lo = Math.min(lo, xs[i]); hi = Math.max(hi, xs[i]); }
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const off of [-W, 0, W]) {
      if (hi + off < -40 || lo + off > m.w + 40) continue;
      for (let i = 0; i < last; i++) {
        const c = S.category(S.windAt(s, i));
        ctx.strokeStyle = alpha(c ? c.color : DIM, a);
        ctx.lineWidth = (c ? c.width : 1.2) * scale;
        ctx.beginPath(); ctx.moveTo(xs[i] + off, ys[i]); ctx.lineTo(xs[i + 1] + off, ys[i + 1]); ctx.stroke();
      }
      if (dots) {
        ctx.fillStyle = alpha(INK, a * 0.8);
        for (let i = 0; i <= last; i++) { ctx.beginPath(); ctx.arc(xs[i] + off, ys[i], 1.6, 0, Math.PI * 2); ctx.fill(); }
        // Landfall records: a ring, because that is where the track met land.
        ctx.strokeStyle = alpha(INK, a);
        for (const i of s.land) {
          if (i > last) continue;
          ctx.beginPath(); ctx.arc(xs[i] + off, ys[i], 4.5, 0, Math.PI * 2); ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  /** The storm's centre now: a ring and two spiral arms. */
  function drawEye(ctx, m, lat, lon, wind, spin) {
    const c = colourOf(wind);
    const W = 256 * 2 ** m.zoom;
    const [x0, y] = m.project(lat, lon);
    for (const off of [-W, 0, W]) {
      const x = x0 + off;
      if (x < -30 || x > m.w + 30 || y < -30 || y > m.h + 30) continue;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(spin);
      ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 2;
      ctx.shadowColor = c; ctx.shadowBlur = 8;
      for (let k = 0; k < 2; k++) {
        ctx.beginPath();
        ctx.arc(0, 0, 11, k * Math.PI + 0.2, k * Math.PI + 2.4);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawRings(ctx, m) {
    const p = place();
    if (!p) return;
    const [ox, oy] = m.project(p.lat, p.lon);
    const mPerPx = (156543.03392 * Math.cos(p.lat * Math.PI / 180)) / 2 ** m.zoom;
    ctx.save();
    ctx.strokeStyle = alpha(SERIES[1], 0.45); ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
    ctx.font = "500 11.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = SERIES[1]; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    for (const r of RINGS_MI) {
      const px = (r * S.KM_PER_MI * 1000) / mPerPx;
      if (px < 18 || px > Math.max(m.w, m.h) * 1.5) continue;
      ctx.beginPath(); ctx.arc(ox, oy, px, 0, Math.PI * 2); ctx.stroke();
      haloText(ctx, `${r} MI`, ox, oy - px - 2);
    }
    ctx.restore();
  }

  function overlay(ctx, m) {
    if (!active) return;
    drawRings(ctx, m);
    const now = lastFrame;

    if (sweep.on) {
      const year = sweep.first + Math.floor(sweep.p);
      const cut = Date.UTC(year, 0, 1) + (sweep.p % 1) * 366 * 86400000;
      for (const { storm: s } of near) {
        if (s.year < year) drawTrack(ctx, m, s, { a: 0.16, scale: 0.8 });
        else if (s.year === year) {
          drawTrack(ctx, m, s, { a: 0.95, cut });
          if (s.t[0] <= cut && cut <= s.t[s.n - 1]) {
            const p = S.positionAt(s, cut);
            drawEye(ctx, m, p.lat, p.lon, p.wind, now / 300);
          }
        }
      }
    } else {
      for (const { storm: s } of near) if (s !== selected) drawTrack(ctx, m, s, { a: selected ? 0.18 : 0.5 });
      // Name the closest three where they came nearest, so the map reads without the list.
      if (!selected) {
        ctx.save();
        ctx.font = "600 11.5px 'Chakra Petch', sans-serif";
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        near.slice(0, 3).forEach((n) => {
          const [x, y] = m.project(n.lat, n.lon);
          if (x < 0 || y < 0 || x > m.w || y > m.h) return;
          ctx.fillStyle = INK;
          haloText(ctx, S.titleOf(n.storm), x + 7, y);
        });
        ctx.restore();
      }
    }

    if (selected) {
      drawTrack(ctx, m, selected, { a: 0.35, scale: 1.2, dots: true });
      drawTrack(ctx, m, selected, { a: 1, scale: 1.3, cut: replay.t });
      const p = S.positionAt(selected, replay.t);
      drawEye(ctx, m, p.lat, p.lon, p.wind, now / 300);
    }
  }

  /* ------------------------------------------------------------- panel */

  function shell() {
    panel.innerHTML = `
      <div class="hd">STORMS<span class="rule"></span><span class="val" id="st-src">NHC BEST TRACKS</span></div>
      <div class="body">
        <div id="st-status" class="st-status" role="status"></div>
        <div id="st-facts"></div>
        <div class="oh-chips" id="st-modes">
          <button class="oh-chip" id="st-sweep" aria-pressed="false" style="--chip:var(--vi)">▶ SWEEP THE YEARS</button>
        </div>
        <div id="st-replay" hidden>
          <div class="st-transport">
            <button class="tl-btn" id="st-play" aria-label="Play or pause the replay">❚❚</button>
            <input type="range" id="st-scrub" min="0" max="1000" value="0" aria-label="Replay position">
          </div>
          <div id="st-era" class="st-note"></div>
        </div>
        <div class="st-h">NEAREST TRACKS</div>
        <div id="st-list"></div>
        <div class="st-h">ON THIS DATE</div>
        <div id="st-date"></div>
        <div id="st-season"></div>
        <p class="st-note" id="st-about"></p>
      </div>`;
    $('#st-sweep').addEventListener('click', toggleSweep);
    $('#st-play').addEventListener('click', () => { replay.playing = !replay.playing; paintTransport(); kick(); });
    $('#st-scrub').addEventListener('input', (e) => {
      if (!selected) return;
      replay.playing = false;
      replay.t = selected.t[0] + (e.target.value / 1000) * (selected.t[selected.n - 1] - selected.t[0]);
      paintTransport(); frame();
    });
    if (reduceMotion) $('#st-sweep').hidden = true;
    panel.addEventListener('click', (e) => {
      const b = e.target.closest('[data-storm]');
      if (b) select(storms.find((s) => s.id === b.dataset.storm));
    });
  }

  function row(s, right, sub) {
    const c = S.category(sub);
    return `<button class="st-row" data-storm="${esc(s.id)}" aria-pressed="${s === selected}">
      <span class="st-n">${esc(S.titleOf(s))}</span><span class="st-d">${esc(right)}</span>
      <span class="st-c" style="color:${c ? c.color : 'var(--faint)'}">${c ? esc(c.key) : '—'}</span></button>`;
  }

  function render() {
    if (!$('#st-status')) shell();
    const status = $('#st-status');
    const p = place();
    $('#st-modes').hidden = state !== 'ready' || !near.length || reduceMotion;
    if (state === 'loading' || state === 'idle') {
      status.textContent = 'Loading the archive…';
      $('#st-facts').innerHTML = ''; $('#st-list').innerHTML = ''; $('#st-date').innerHTML = ''; $('#st-season').innerHTML = '';
    } else if (state === 'absent') {
      status.textContent = 'The hurricane archive is not available here.';
    } else if (state === 'fail') {
      status.textContent = 'The hurricane archive could not be loaded. Try again in a moment.';
    } else {
      const through = Math.max(index.through.al, index.through.ep);
      status.textContent = `${storms.length.toLocaleString('en-US')} storms · Atlantic 1851–${index.through.al} · East & Central Pacific 1949–${index.through.ep}`;
      renderFacts(p, through);
      $('#st-list').innerHTML = near.length
        ? near.slice(0, 8).map((n) => row(n.storm, `${Math.round(mi(n.km))} mi`, n.wind)).join('')
        : '<div class="nodata">none within 500 mi</div>';
      const day = S.onThisDate(storms, Date.now(), 3).slice(0, 3);
      $('#st-date').innerHTML = day.length
        ? day.map((d) => row(d.storm, when(d.storm.t[d.i]).replace(/, \d{4}$/, ''), d.wind)).join('')
        : '<div class="nodata">nothing in the archive for these dates</div>';
      renderSeason();
    }
    $('#st-about').innerHTML = 'Source: NHC best-track archive (HURDAT2), a six-hourly record of each storm\'s centre. '
      + 'Distances are to the straight line between positions; wind is the storm\'s wind when nearest, not what a place felt. '
      + 'This is history, not a warning source: for current storms see <a href="https://www.nhc.noaa.gov/" target="_blank" rel="noopener">nhc.noaa.gov</a>.';
    paintHud();
    paintSweep();
  }

  function renderFacts(p, through) {
    const el = $('#st-facts');
    if (!p) { el.innerHTML = ''; return; }
    if (!near.length) {
      el.innerHTML = `<div class="st-note">No storm in this archive passed within ${NEAR_MI} mi of ${esc(p.name)}. `
        + 'It covers the Atlantic and the East and Central Pacific only, so that says nothing about other ocean basins.</div>';
      return;
    }
    const f = S.facts(near);
    const c = f.closest;
    const kv = (k, v) => `<div class="kv"><dt>${k}</dt><dd>${v}</dd></div>`;
    el.innerHTML = `<dl style="margin:0">
      ${kv('Centre within 100 mi', String(f.within100))}
      ${kv('Centre within 150 mi', String(f.within150))}
      ${kv('Nearest', `${esc(S.titleOf(c.storm))}, ${Math.round(mi(c.km))} mi · ${when(c.t)}`)}
      ${kv('Wind when nearest', c.wind == null ? '—' : `${Math.round(c.wind)} kt`)}
      ${f.strongest ? kv('Strongest nearby', `${esc(S.titleOf(f.strongest.storm))}, ${Math.round(f.strongest.wind)} kt at ${Math.round(mi(f.strongest.km))} mi`) : ''}
    </dl>`;
  }

  function renderSeason() {
    const el = $('#st-season');
    // The basin the place belongs to is the one its nearest storm came from.
    const basin = near.length ? near[0].storm.basin : 'AL';
    const p = S.seasonProgress(storms, basin, Date.now());
    const peak = new Date(Date.UTC(2001, 0, p.peakDoy));
    const pct = Math.round(p.behind * 100);
    el.innerHTML = `<div class="st-season">
      <div class="st-ring" style="--p:${pct}" role="img" aria-label="${pct} percent of the season is behind us"><b>${pct}%</b></div>
      <div class="st-note">Of all the tropical-storm days in the ${esc(BASIN_NAME[basin] || basin)} archive, ${pct}% fall on or before today's date.
      The busiest day is ${MONTHS[peak.getUTCMonth()]} ${peak.getUTCDate()}.</div></div>`;
  }

  /* ------------------------------------------------- hud, transport, state */

  function paintHud() {
    const t = hud.querySelector('b'), sub = hud.querySelector('span');
    if (sweep.on) {
      const year = sweep.first + Math.floor(sweep.p);
      const so = near.filter((n) => n.storm.year <= year).length;
      t.textContent = String(year);
      sub.textContent = `${so} of ${near.length} storms so far`;
    } else if (selected) {
      const p = S.positionAt(selected, replay.t);
      const c = S.category(p.wind);
      const st = STATUS_NAME[selected.status[p.i]] || '';
      t.textContent = S.titleOf(selected).toUpperCase();
      sub.textContent = `${c ? c.label : st} · ${p.wind == null ? '—' : Math.round(p.wind) + ' kt'} · ${when(replay.t, true)}`;
    } else {
      t.textContent = 'HURRICANE ATLAS';
      sub.textContent = state === 'ready' ? `${near.length} storms within ${NEAR_MI} mi since 1851` : '';
    }
  }

  function paintTransport() {
    const box = $('#st-replay');
    if (!box) return;
    box.hidden = !selected;
    if (!selected) return;
    $('#st-play').textContent = replay.playing ? '❚❚' : '▶';
    const span = selected.t[selected.n - 1] - selected.t[0];
    $('#st-scrub').value = String(Math.round(((replay.t - selected.t[0]) / span) * 1000));
    $('#st-era').textContent = S.eraNote(selected.year) || '';
  }

  function paintSweep() {
    const b = $('#st-sweep');
    if (!b) return;
    b.setAttribute('aria-pressed', String(sweep.on));
    b.textContent = sweep.on ? '❚❚ STOP SWEEP' : '▶ SWEEP THE YEARS';
  }

  /* --------------------------------------------------------- the loop */

  function frame() {
    paintHud();
    map.invalidate();
  }

  function kick() {
    if (loopId || !active || !visible || document.hidden) return;
    lastFrame = performance.now();
    loopId = requestAnimationFrame(loop);
  }

  function loop(now) {
    loopId = 0;
    if (!active || !visible || document.hidden) return;
    const dt = Math.min(100, now - lastFrame);
    lastFrame = now;
    let moving = false;
    if (sweep.on) {
      sweep.p += (dt / 1000) * YEARS_PER_SECOND;
      if (sweep.first + sweep.p >= sweep.last + 1) { sweep.on = false; sweep.p = 0; paintSweep(); }
      moving = sweep.on;
    }
    if (replay.playing && selected) {
      const end = selected.t[selected.n - 1];
      replay.t += dt * ((end - selected.t[0]) / (REPLAY_SECONDS * 1000));
      if (replay.t >= end) { replay.t = end; replay.playing = false; }
      paintTransport();
      moving = moving || replay.playing;
    }
    frame();
    if (moving || replay.playing || sweep.on) loopId = requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------ interaction */

  function toggleSweep() {
    if (!near.length) return;
    sweep.on = !sweep.on;
    if (sweep.on) { sweep.p = 0; selected = null; replay.playing = false; paintTransport(); }
    paintSweep(); render(); frame(); kick();
  }

  function fit(s) {
    let la0 = 90, la1 = -90, lo0 = Infinity, lo1 = -Infinity;
    for (let i = 0; i < s.n; i++) {
      la0 = Math.min(la0, s.lat[i]); la1 = Math.max(la1, s.lat[i]);
      lo0 = Math.min(lo0, s.lon[i]); lo1 = Math.max(lo1, s.lon[i]);
    }
    const span = Math.max(lo1 - lo0, (la1 - la0) * 1.4, 4) * 1.35;
    const z = Math.max(map.minZoom, Math.min(7, Math.floor(Math.log2((360 * Math.min(map.w, map.h * 1.6)) / (256 * span)))));
    map.setView((la0 + la1) / 2, wrap180((lo0 + lo1) / 2), z);
  }

  function select(s) {
    if (!s) return;
    selected = s;
    sweep.on = false; paintSweep();
    replay = { t: s.t[0], playing: !reduceMotion };
    fit(s);
    render(); paintTransport(); frame(); kick();
  }

  function pick(pt) {
    if (!active || state !== 'ready') return;
    const W = 256 * 2 ** map.zoom;
    let best = null;
    const pool = [...near.map((n) => n.storm), ...(selected && !near.some((n) => n.storm === selected) ? [selected] : [])];
    for (const s of pool) {
      const pts = [];
      for (let i = 0; i < s.n; i++) pts.push(map.project(s.lat[i], s.lon[i]));
      for (const off of [-W, 0, W]) {
        for (let i = 0; i < s.n; i++) {
          const [x1, y1] = pts[i], [x2, y2] = pts[Math.min(i + 1, s.n - 1)];
          const ax = x1 + off, bx = x2 + off, dx = bx - ax, dy = y2 - y1, l2 = dx * dx + dy * dy;
          const u = l2 ? Math.max(0, Math.min(1, ((pt.x - ax) * dx + (pt.y - y1) * dy) / l2)) : 0;
          const d = Math.hypot(pt.x - (ax + u * dx), pt.y - (y1 + u * dy));
          if (d < PICK_PX && (!best || d < best.d)) best = { s, d };
        }
      }
    }
    if (best) select(best.s);
    else if (selected) { selected = null; replay.playing = false; render(); paintTransport(); frame(); }
  }

  store.on('loc', () => {
    if (!active) return;
    locate(); selected = null; sweep.on = false;
    render(); paintTransport();
    if (place()) map.setView(place().lat, place().lon, 5);
  });

  /* ----------------------------------------------------------- lifecycle */

  return {
    enter() {
      active = true;
      if (!overlayAdded) { map.overlays.push(overlay); overlayAdded = true; }
      map.onTap = pick;
      hud.hidden = false;
      panel.hidden = false;
      if (place()) map.setView(place().lat, place().lon, 5);
      load();
      render();
      map.invalidate();
    },
    exit() {
      active = false;
      sweep.on = false; replay.playing = false;
      if (loopId) cancelAnimationFrame(loopId);
      loopId = 0;
      map.onTap = undefined;
      hud.hidden = true;
      panel.hidden = true;
      map.invalidate();
    },
    /** RADAR left the screen or came back. */
    setVisible(v) { visible = v; if (v) { kick(); map.invalidate(); } },
  };
}
