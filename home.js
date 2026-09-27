/*
 * The sky right now.
 *
 * The landing page's colours follow the visitor's local time of day -- the
 * navy of the favicon at night, the retirement clock's dawn at sunrise, the
 * cream it has always been by mid-morning, gold and dusk in the evening. No
 * location, no permission, no network: the clock on the visitor's device is
 * the only input, so this is "a day", not their day in their sky.
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
    const INK = {
        dark:  { text: '#3a2f45', muted: '#5f5469', accent: '#bd5c43', accentDark: '#a3402a', rule: 'rgba(58, 47, 69, 0.15)',
                 toward: '#000000', from: 0.72 },
        light: { text: '#f4efe6', muted: '#cfc6d8', accent: '#f6d365', accentDark: '#ffe9a8', rule: 'rgba(255, 255, 255, 0.18)',
                 toward: '#ffffff', from: 0.02 }
    };

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
    function bounds(sky) {
        const [gr, gg, gb, ga] = sky.glow;
        const over = rgb => rgb.map((v, i) => v + ([gr, gg, gb][i] - v) * ga);
        const top = hexToRgb(sky.top), bottom = hexToRgb(sky.bottom);
        const corners = [top, bottom, over(top), over(bottom)];
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
            rule: set.rule
        };
    }

    function paletteAt(minute) {
        const sky = skyAt(minute);
        const b = bounds(sky);
        const ink = inkFor(b.min, b.max);
        return Object.assign({ sky, bounds: b, themeColor: sky.top }, ink);
    }

    const VARS = ['--bg', '--bg-soft', '--glow', '--glow-x', '--text', '--muted', '--accent', '--accent-dark', '--rule'];

    function prefersOwnContrast() {
        return typeof root.matchMedia === 'function'
            && (root.matchMedia('(prefers-contrast: more)').matches
                || root.matchMedia('(forced-colors: active)').matches);
    }

    function clear() {
        const s = root.document.documentElement.style;
        VARS.forEach(v => s.removeProperty(v));
    }

    function nowMinute() {
        const d = new Date();
        return d.getHours() * 60 + d.getMinutes();
    }

    // Paint the sky for a minute (now, by default) as custom properties on
    // <html>, which the stylesheet reads with today's cream as the default.
    function apply(minute) {
        if (prefersOwnContrast()) { clear(); return null; }
        const p = paletteAt(minute === undefined ? nowMinute() : minute);
        const s = root.document.documentElement.style;
        s.setProperty('--bg', p.sky.top);
        s.setProperty('--bg-soft', p.sky.bottom);
        s.setProperty('--glow', `rgba(${p.sky.glow.slice(0, 3).map(Math.round).join(', ')}, ${p.sky.glow[3].toFixed(3)})`);
        s.setProperty('--glow-x', `${p.sky.glowX.toFixed(1)}%`);
        s.setProperty('--text', p.text);
        s.setProperty('--muted', p.muted);
        s.setProperty('--accent', p.accent);
        s.setProperty('--accent-dark', p.accentDark);
        s.setProperty('--rule', p.rule);
        const meta = root.document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', p.themeColor);
        return p;
    }

    const BranyonSky = { STOPS, FLIP, INK, mix, luminance, contrast, skyAt, bounds, inkFor, paletteAt, apply, clear };

    if (typeof module !== 'undefined' && module.exports) module.exports = BranyonSky;
    if (root) root.BranyonSky = BranyonSky;

    // Browser only: paint now, then once a minute. A background tab's timers
    // are throttled, so a tab left open overnight would show yesterday's sky
    // until the next tick -- hence visibilitychange and pageshow. And if the
    // contrast preference changes mid-session, undo or redo at once.
    if (root && typeof root.document !== 'undefined') {
        const tick = () => apply();
        tick();
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
