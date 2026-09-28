/*
 * The sky right now.
 *
 * The landing page's colours follow the visitor's local time of day -- the
 * navy of the favicon at night, the retirement clock's dawn at sunrise, the
 * cream it has always been by mid-morning, gold and dusk in the evening. The
 * clock on the visitor's device decides the time of day; since 2026-09-28 the
 * visitor's WEATHER decides what that sky is doing (see "the weather" below):
 * one same-origin request to /weather/api/here, located by the CDN, never by
 * a permission prompt.
 *
 * SKY AND INK ARE SEPARATE THINGS. The sky interpolates by the minute. The
 * ink -- text, muted, accent -- is chosen from the sky's LUMINANCE, never
 * from the hour: interpolating plum text toward cream text across dusk
 * passes through a band where no ink reads at all (at the midpoint text and
 * sky are both grey, 1:1). So the ink flips polarity once at dusk and once
 * at dawn, on a deliberately flat "blue hour" sky, and within a polarity it
 * blends toward black or white as the sky approaches the flip. FLIP is the
 * one luminance where pure black and pure white BOTH clear 4.5:1.
 *
 * Every minute of the day is a state the page can paint, so tests.js checks
 * all 1,440 of them for contrast -- a census, not a sample.
 *
 * Nothing here transitions. A colour transition through the flip is seconds
 * of grey on grey, exactly the state the census forbids. One discrete step a
 * minute is imperceptible, and the flip is one step per dusk and per dawn.
 *
 * Under prefers-contrast: more and forced-colors: active this does nothing
 * and undoes itself: inline custom properties on <html> would beat the
 * stylesheet's @media :root override.
 *
 * Exported the way countdown/calc.js is, so tests can call the pure parts.
 */
(function (root) {
    'use strict';

    // The sky's keyframes, by minute of the local day. `glow` is the radial
    // glow the page already had -- now the sun (or the moon), and `glowX`
    // is where it sits across the top edge: sunrise left, noon centre,
    // sunset right. The two "blue hour" pairs are FLAT (top = bottom, no
    // glow) so the ink flips on a sky that is one colour.
    const STOPS = [
        { at: 0,    top: '#1a1a2e', bottom: '#0f0f23', glow: [140, 150, 230, 0.18], glowX: 50 }, // night
        { at: 285,  top: '#1a1a2e', bottom: '#0f0f23', glow: [140, 150, 230, 0.18], glowX: 50 }, // 4:45, still night
        { at: 330,  top: '#2e2b4d', bottom: '#1c1a33', glow: [224, 122, 95, 0.22],  glowX: 8 },  // 5:30, pre-dawn
        { at: 365,  top: '#3d3a5e', bottom: '#3d3a5e', glow: [0, 0, 0, 0],          glowX: 10 }, // 6:05, blue hour, dark side
        { at: 380,  top: '#bfb3cf', bottom: '#bfb3cf', glow: [0, 0, 0, 0],          glowX: 12 }, // 6:20, blue hour, light side
        { at: 420,  top: '#ffb88c', bottom: '#f6d365', glow: [224, 122, 95, 0.28],  glowX: 15 }, // 7:00, sunrise (the clock's dawn)
        { at: 510,  top: '#fbf6ef', bottom: '#f3e9dc', glow: [224, 122, 95, 0.14],  glowX: 30 }, // 8:30, morning: the page as it always was
        { at: 780,  top: '#f8f5ef', bottom: '#eef0e8', glow: [161, 196, 253, 0.22], glowX: 50 }, // 13:00, day, a high pale-blue sun
        { at: 1020, top: '#fde7c6', bottom: '#f6c98a', glow: [224, 122, 95, 0.30],  glowX: 78 }, // 17:00, golden hour
        { at: 1110, top: '#f0b7a0', bottom: '#cfa0b8', glow: [224, 122, 95, 0.24],  glowX: 88 }, // 18:30, dusk
        { at: 1150, top: '#bfb3cf', bottom: '#bfb3cf', glow: [0, 0, 0, 0],          glowX: 90 }, // 19:10, blue hour, light side
        { at: 1165, top: '#3d3a5e', bottom: '#3d3a5e', glow: [0, 0, 0, 0],          glowX: 92 }, // 19:25, blue hour, dark side
        { at: 1230, top: '#1a1a2e', bottom: '#0f0f23', glow: [140, 150, 230, 0.18], glowX: 50 }, // 20:30, night
        { at: 1440, top: '#1a1a2e', bottom: '#0f0f23', glow: [140, 150, 230, 0.18], glowX: 50 }  // midnight = stop 0
    ];

    // Where the ink flips. Pure black on a sky of this luminance is 4.6:1,
    // and so is pure white; nowhere else do both hold. Between the two
    // blue-hour stops the sky crosses it in a few minutes, in near-black or
    // near-white ink.
    const FLIP = 0.179;

    // The house inks, one set per polarity. The dark set is the page's own
    // plum on cream; the light set is cream on the favicon's navy, with the
    // clock's sun as the accent -- the one house colour that still clears
    // 3:1 on a dark sky as it brightens toward the flip.
    //
    // The card (the tinted box each group of links sits in) is the OPPOSITE
    // polarity of the ink: white over the sky under dark ink, black under
    // light. In dark polarity every ink is darker than the darkest sky
    // pixel -- an accent lighter than a sky at FLIP could not clear 3:1
    // against it -- so a white fill can only raise every channel of the
    // surface, and so every contrast; symmetric at night. That is what
    // lets the census stay a proof without re-tuning a stop. A fill the
    // ink's own way (white under light ink) fails 4.5:1 at the flip.
    const INK = {
        dark:  { text: '#3a2f45', muted: '#5f5469', accent: '#bd5c43', accentDark: '#a3402a', rule: 'rgba(58, 47, 69, 0.15)',
                 card: [255, 255, 255, 0.42], edge: 'rgba(58, 47, 69, 0.18)',
                 toward: '#000000', from: 0.72 },
        light: { text: '#f4efe6', muted: '#cfc6d8', accent: '#f6d365', accentDark: '#ffe9a8', rule: 'rgba(255, 255, 255, 0.18)',
                 card: [0, 0, 0, 0.22], edge: 'rgba(255, 255, 255, 0.16)',
                 toward: '#ffffff', from: 0.02 }
    };

    const rgba = c => `rgba(${c.slice(0, 3).join(', ')}, ${c[3]})`;

    function hexToRgb(hex) {
        const n = parseInt(hex.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function rgbToHex(rgb) {
        return '#' + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
    }

    // Straight-line mix of two colours (or numbers) by k in 0..1.
    function mix(a, b, k) {
        if (typeof a === 'number') return a + (b - a) * k;
        const x = hexToRgb(a), y = hexToRgb(b);
        return rgbToHex(x.map((v, i) => v + (y[i] - v) * k));
    }

    // WCAG relative luminance of an sRGB colour.
    function channel(v) {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }

    function luminance(rgb) {
        const [r, g, b] = typeof rgb === 'string' ? hexToRgb(rgb) : rgb;
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    }

    function contrast(l1, l2) {
        const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
        return (hi + 0.05) / (lo + 0.05);
    }

    // The sky at a minute of the day: the two neighbouring stops, mixed.
    function skyAt(minute) {
        const m = ((Number.isFinite(minute) ? Math.floor(minute) : 0) % 1440 + 1440) % 1440;
        let i = 0;
        while (STOPS[i + 1].at <= m) i++;
        const a = STOPS[i], b = STOPS[i + 1];
        const k = (m - a.at) / (b.at - a.at);
        return {
            top: mix(a.top, b.top, k),
            bottom: mix(a.bottom, b.bottom, k),
            glow: a.glow.map((v, j) => mix(v, b.glow[j], k)),
            glowX: mix(a.glowX, b.glowX, k)
        };
    }

    /*
     * The darkest and brightest luminance anywhere in a sky, as a bound. The
     * page paints a top-to-bottom line between two colours with the glow
     * composited over it at an alpha that falls from `a` to 0. Both are
     * linear, so per channel the extremes are at the four corners (top,
     * bottom, each with and without the full glow) -- and luminance is a
     * weighted sum of a MONOTONE function of each channel, so summing the
     * per-channel minima is a true lower bound (and maxima an upper), not a
     * guess from the endpoints' own luminances.
     */
    //
    // With an overlay (a card's translucent fill, [r, g, b, a]) the fill is
    // composited over all four corners AFTER the glow -- the page paints
    // gradient, then glow, then card -- and c + (f - c) * a is monotone in
    // c, so the corner extrema still bound the surface the text sits on.
    function bounds(sky, overlay) {
        const [gr, gg, gb, ga] = sky.glow;
        const over = rgb => rgb.map((v, i) => v + ([gr, gg, gb][i] - v) * ga);
        const fill = rgb => overlay ? rgb.map((v, i) => v + (overlay[i] - v) * overlay[3]) : rgb;
        const top = hexToRgb(sky.top), bottom = hexToRgb(sky.bottom);
        const corners = [top, bottom, over(top), over(bottom)].map(fill);
        const lo = [0, 1, 2].map(i => Math.min(...corners.map(c => c[i])));
        const hi = [0, 1, 2].map(i => Math.max(...corners.map(c => c[i])));
        return { min: luminance(lo), max: luminance(hi) };
    }

    /*
     * Ink for a sky: dark ink if even the darkest pixel is bright enough,
     * light ink otherwise. Within a polarity each colour blends toward pure
     * black or pure white as the sky nears the flip -- linearly in the
     * luminance that matters (the darkest pixel for dark ink, the brightest
     * for light), reaching the extreme exactly at FLIP.
     */
    function inkFor(min, max) {
        const dark = min >= FLIP;
        const set = dark ? INK.dark : INK.light;
        const k = dark
            ? Math.max(0, Math.min(1, (set.from - min) / (set.from - FLIP)))
            : Math.max(0, Math.min(1, (max - set.from) / (FLIP - set.from)));
        const blend = c => mix(c, set.toward, k);
        return {
            polarity: dark ? 'dark' : 'light',
            k,
            text: blend(set.text),
            muted: blend(set.muted),
            accent: blend(set.accent),
            accentDark: blend(set.accentDark),
            rule: set.rule,
            card: set.card,
            edge: set.edge
        };
    }

    /* ------------------------------------------------------ the weather
     *
     * conditionFor() turns a WMO 4677 code (and cloud cover) into one of
     * eight conditions; weatherize() turns a clear sky into that condition's
     * sky. Greying mixes toward a grey of the SAME luminance, so a condition
     * changes the character of the sky more than its brightness; storms and
     * rain darken it, fog and snow lighten it.
     *
     * Ink is still chosen from the resulting sky's bounds by inkFor, so the
     * polarity logic is untouched -- with one rule the clear sky never
     * needed. The clear sky only flips polarity on deliberately FLAT stops. A
     * weathered sky can be SLOPED across FLIP (fog at 06:02 spans 0.179 to
     * 0.186), and there no ink clears 4.5:1 against both ends. So a weathered
     * sky whose bounds straddle FLIP is flattened for that minute: one colour,
     * no glow, no overlay.
     *
     * The motion overlay (rain, snow, cloud; drawn by the stylesheet) always
     * takes the polarity OPPOSITE the ink, like the cards: light marks under
     * dark ink, dark under light. Compositing it can only move the sky away
     * from the ink, so it can only raise contrast. The census still includes
     * it rather than trust the argument.
     */
    const CONDITIONS = ['clear', 'partly', 'cloudy', 'fog', 'drizzle', 'rain', 'snow', 'storm'];

    function conditionFor(code, cloud) {
        const c = Number(code);
        if ([95, 96, 99].includes(c)) return 'storm';
        if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'snow';
        if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return 'rain';
        if (c >= 51 && c <= 57) return 'drizzle';
        if (c === 45 || c === 48) return 'fog';
        if (c === 3) return 'cloudy';
        if (c === 2) return 'partly';
        const cc = Number(cloud);
        if (code !== null && code !== undefined && (c === 0 || c === 1)) return cc >= 60 ? 'partly' : 'clear';
        // A code the table does not know: judge by the cloud alone.
        if (cloud !== null && cloud !== undefined && Number.isFinite(cc)) return cc >= 80 ? 'cloudy' : cc >= 40 ? 'partly' : 'clear';
        return 'clear';
    }

    // The words for the caption: "Light rain in Irvine".
    function wordsFor(code) {
        const c = Number(code);
        const W = { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog',
            51: 'Light drizzle', 53: 'Drizzle', 55: 'Drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle',
            61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
            71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Showers', 81: 'Showers',
            82: 'Heavy showers', 85: 'Snow showers', 86: 'Snow showers', 95: 'Thunderstorm',
            96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail' };
        return code === null || code === undefined ? null : (W[c] || null);
    }

    // Per condition: how far toward same-luminance grey, then toward black
    // (darken) or white (lighten), what the glow keeps, and the overlay.
    const WX = {
        clear:   { grey: 0,    darken: 0,    lighten: 0,    glow: 1,   overlay: null,    alpha: 0 },
        partly:  { grey: 0.2,  darken: 0,    lighten: 0,    glow: 0.6, overlay: 'cloud', alpha: 0.10 },
        cloudy:  { grey: 0.5,  darken: 0.04, lighten: 0,    glow: 0,   overlay: 'cloud', alpha: 0.12 },
        fog:     { grey: 0.6,  darken: 0,    lighten: 0.12, glow: 0,   overlay: null,    alpha: 0,   soften: 0.6 },
        drizzle: { grey: 0.55, darken: 0.06, lighten: 0,    glow: 0,   overlay: 'rain',  alpha: 0.12 },
        rain:    { grey: 0.6,  darken: 0.12, lighten: 0,    glow: 0,   overlay: 'rain',  alpha: 0.16 },
        snow:    { grey: 0.4,  darken: 0,    lighten: 0.10, glow: 0.3, overlay: 'snow',  alpha: 0.30 },
        storm:   { grey: 0.7,  darken: 0.28, lighten: 0,    glow: 0,   overlay: 'rain',  alpha: 0.18 }
    };

    // The grey with the same relative luminance as a colour.
    function greyOf(hex) {
        const L = luminance(hex);
        const c = L <= 0.03928 / 12.92 ? L * 12.92 : 1.055 * Math.pow(L, 1 / 2.4) - 0.055;
        return rgbToHex([c * 255, c * 255, c * 255]);
    }

    function weatherize(sky, cond) {
        const w = WX[cond] || WX.clear;
        if (w === WX.clear) return sky;
        const shade = hex => {
            let v = mix(hex, greyOf(hex), w.grey);
            if (w.darken) v = mix(v, '#000000', w.darken);
            if (w.lighten) v = mix(v, '#ffffff', w.lighten);
            return v;
        };
        const top = shade(sky.top);
        let bottom = shade(sky.bottom);
        if (w.soften) bottom = mix(bottom, top, w.soften);   // fog: nearly one colour
        const out = { top, bottom, glow: [sky.glow[0], sky.glow[1], sky.glow[2], sky.glow[3] * w.glow], glowX: sky.glowX, flat: false };
        const b = bounds(out);
        if (b.min < FLIP && b.max >= FLIP) {
            const one = mix(top, bottom, 0.5);
            return { top: one, bottom: one, glow: [0, 0, 0, 0], glowX: sky.glowX, flat: true };
        }
        return out;
    }

    // The union of the bounds of the sky alone and the sky under a mark.
    function unionBounds(a, b) { return { min: Math.min(a.min, b.min), max: Math.max(a.max, b.max) }; }

    // A sky with a translucent layer folded into its own colours.
    function under(sky, layer) {
        const f = hex => rgbToHex(hexToRgb(hex).map((v, i) => v + (layer[i] - v) * layer[3]));
        return { top: f(sky.top), bottom: f(sky.bottom), glow: sky.glow, glowX: sky.glowX };
    }

    function paletteAt(minute, cond) {
        const w = WX[cond] || WX.clear;
        const sky = weatherize(skyAt(minute), cond);
        const base = bounds(sky);
        const ink = inkFor(base.min, base.max);
        // The overlay is opposite the ink, like the card, and absent on a
        // flattened sky.
        const overlay = w.overlay && !sky.flat
            ? (ink.polarity === 'dark' ? [255, 255, 255, w.alpha] : [0, 0, 0, w.alpha]) : null;
        const b = overlay ? unionBounds(base, bounds(sky, overlay)) : base;
        const cardB = overlay
            ? unionBounds(bounds(sky, ink.card), bounds(under(sky, overlay), ink.card))
            : bounds(sky, ink.card);
        return Object.assign({ sky, cond: WX[cond] ? cond : 'clear', overlay, bounds: b, cardBounds: cardB, themeColor: sky.top }, ink);
    }

    const VARS = ['--bg', '--bg-soft', '--glow', '--glow-x', '--text', '--muted', '--accent', '--accent-dark', '--rule', '--card', '--card-edge', '--wx-ink'];

    // The condition the page is painting, set by the weather reading.
    let current = 'clear';

    function prefersOwnContrast() {
        return typeof root.matchMedia === 'function'
            && (root.matchMedia('(prefers-contrast: more)').matches
                || root.matchMedia('(forced-colors: active)').matches);
    }

    function clear() {
        const s = root.document.documentElement.style;
        VARS.forEach(v => s.removeProperty(v));
        root.document.documentElement.removeAttribute('data-wx');
    }

    function nowMinute() {
        const d = new Date();
        return d.getHours() * 60 + d.getMinutes();
    }

    // Paint the sky for a minute (now, by default) as custom properties on
    // <html>, which the stylesheet reads with today's cream as the default.
    function apply(minute) {
        if (prefersOwnContrast()) { clear(); return null; }
        const p = paletteAt(minute === undefined ? nowMinute() : minute, current);
        const s = root.document.documentElement.style;
        // The stylesheet draws the motion from this; none on a clear or
        // flattened sky.
        if (p.overlay) {
            root.document.documentElement.setAttribute('data-wx', WX[p.cond].overlay);
            s.setProperty('--wx-ink', rgba(p.overlay));
        } else {
            root.document.documentElement.removeAttribute('data-wx');
            s.removeProperty('--wx-ink');
        }
        s.setProperty('--bg', p.sky.top);
        s.setProperty('--bg-soft', p.sky.bottom);
        s.setProperty('--glow', `rgba(${p.sky.glow.slice(0, 3).map(Math.round).join(', ')}, ${p.sky.glow[3].toFixed(3)})`);
        s.setProperty('--glow-x', `${p.sky.glowX.toFixed(1)}%`);
        s.setProperty('--text', p.text);
        s.setProperty('--muted', p.muted);
        s.setProperty('--accent', p.accent);
        s.setProperty('--accent-dark', p.accentDark);
        s.setProperty('--rule', p.rule);
        s.setProperty('--card', rgba(p.card));
        s.setProperty('--card-edge', p.edge);
        const meta = root.document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', p.themeColor);
        return p;
    }

    /* ------------------------------------------ reading the weather
     *
     * One same-origin request, located by the CDN. The last reading is kept
     * in this visitor's browser for an hour, so a repeat visit paints the
     * right sky before the request returns; every storage access is
     * wrapped, because a private window or blocked site data throws.
     */
    const STORE_KEY = 'branyon.sky.v1';
    const FRESH_MS = 60 * 60 * 1000;
    const REFETCH_MS = 15 * 60 * 1000;
    let reading = null;
    let lastFetch = 0;

    function useReading(r, minute) {
        if (!r || typeof r !== 'object') return false;
        reading = r;
        current = conditionFor(r.code, r.cloud);
        apply(minute);
        caption();
        return true;
    }

    function recall() {
        try {
            const r = JSON.parse(root.localStorage.getItem(STORE_KEY) || 'null');
            if (r && typeof r.at === 'number' && Date.now() - r.at < FRESH_MS) return r;
        } catch (e) { /* no storage: fine */ }
        return null;
    }

    function remember(r) {
        try { root.localStorage.setItem(STORE_KEY, JSON.stringify(r)); } catch (e) { /* fine */ }
    }

    function fetchWeather() {
        if (typeof root.fetch !== 'function') return;
        lastFetch = Date.now();
        const ctrl = typeof root.AbortController === 'function' ? new root.AbortController() : null;
        const timer = root.setTimeout(() => { if (ctrl) ctrl.abort(); }, 4000);
        root.fetch('/weather/api/here', ctrl ? { signal: ctrl.signal } : undefined)
            .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
            .then(j => {
                root.clearTimeout(timer);
                if (!j || typeof j !== 'object') return;
                const r = { code: j.code, cloud: j.cloud, city: typeof j.city === 'string' ? j.city : null, at: Date.now() };
                remember(r);
                useReading(r);
            })
            .catch(() => { root.clearTimeout(timer); /* the clock's sky stands */ });
    }

    // "Light rain in Irvine", in the footer. Text only, never markup.
    function caption() {
        const el = root.document && root.document.getElementById('wx');
        if (!el) return;
        const words = reading && wordsFor(reading.code);
        if (!words) { el.hidden = true; el.textContent = ''; return; }
        el.textContent = words + (reading.city ? ' in ' + reading.city : ' here');
        el.hidden = false;
    }

    // For the gate and the tests: paint a condition without a network.
    function applyWeather(cond, minute) {
        current = WX[cond] ? cond : 'clear';
        return apply(minute);
    }

    const BranyonSky = { STOPS, FLIP, INK, CONDITIONS, WX, mix, luminance, contrast, skyAt, bounds, inkFor,
        conditionFor, wordsFor, weatherize, paletteAt, apply, applyWeather, clear, STORE_KEY };

    if (typeof module !== 'undefined' && module.exports) module.exports = BranyonSky;
    if (root) root.BranyonSky = BranyonSky;

    // Browser only: paint now, then once a minute. A background tab's timers
    // are throttled, so a tab left open overnight would show yesterday's sky
    // until the next tick -- hence visibilitychange and pageshow. And if the
    // contrast preference changes mid-session, undo or redo at once.
    if (root && typeof root.document !== 'undefined') {
        const tick = () => {
            apply();
            if (!root.document.hidden && Date.now() - lastFetch > REFETCH_MS) fetchWeather();
        };
        // A reading from the last hour paints now, before first paint; the
        // script blocks in <head>, so a repeat visit never shows clear then rain.
        const kept = recall();
        if (kept) { reading = kept; current = conditionFor(kept.code, kept.cloud); }
        apply();
        fetchWeather();
        root.document.addEventListener('DOMContentLoaded', caption);
        root.setInterval(tick, 60000);
        root.document.addEventListener('visibilitychange', () => { if (!root.document.hidden) tick(); });
        root.addEventListener('pageshow', tick);
        if (typeof root.matchMedia === 'function') {
            ['(prefers-contrast: more)', '(forced-colors: active)'].forEach(q => {
                const m = root.matchMedia(q);
                if (m.addEventListener) m.addEventListener('change', tick);
                else if (m.addListener) m.addListener(tick);
            });
        }
    }
})(typeof window !== 'undefined' ? window : null);
