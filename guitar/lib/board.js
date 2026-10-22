/*
 * One fretboard renderer for every tool under /guitar/.
 *
 * GuitarBoard.draw(svg, options) replaces the SVG's contents with a neck from
 * fret `lo` to fret `hi`, strings top to bottom (high E first, as tab reads),
 * and the dots, bands and lane labels it is given. Colours are passed as CSS
 * values -- usually var(--token) -- so the page's light and dark themes reach
 * every mark without the renderer knowing either.
 *
 * Clickable dots and lanes carry data-key; the page listens on the SVG once and
 * finds the mark with closest('[data-key]'), rather than wiring a handler per
 * dot on every redraw. They are deliberately NOT role=button: dots on one fret
 * sit 6px apart, which no touch-target rule allows for a row of buttons, so
 * every page offers the same choices as real buttons beside the neck (the
 * selected-note stepper, the shape chain) and the keyboard drives those.
 *
 * options:
 *   lo, hi        fret range (lo 0 adds an open-string column and a nut)
 *   W, SG         fret width and string gap in SVG units
 *   dots          [{ si, f, fill, stroke, sw, text, tc, op, r, ring, ringDash,
 *                    key, title, cls }]
 *   bands         [{ lo, hi, color }] shaded fret windows behind the dots
 *   lanes         [{ lo, hi, lane, color, text, on, key }] tabs above the neck
 *   mutes         [si] strings drawn with an x
 *   numbers       fret numbers under the neck (default true)
 */
(function (root) {
    'use strict';

    const INLAY_ONE = [3, 5, 7, 9, 15, 17, 19, 21];
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    function geometry(o) {
        const lo = o.lo, hi = o.hi, W = o.W || 52, SG = o.SG || 30;
        const hasOpen = lo === 0, first = Math.max(lo, 1);
        const LX = 30, openX = LX + 16, nutX = hasOpen ? LX + 34 : LX;
        const laneH = 22, laneRows = o.lanes && o.lanes.length ? 2 : 0;
        const TOP = (laneRows ? laneRows * laneH + 10 : 4) + 16;
        const yOf = si => TOP + si * SG;
        const xOf = f => f === 0 ? openX : nutX + (f - first + 0.5) * W;
        const xL = f => f <= 0 ? openX - 14 : nutX + (f - first) * W;
        const xR = f => f === 0 ? nutX : nutX + (f - first + 1) * W;
        const right = nutX + (hi - first + 1) * W;
        return { lo, hi, W, SG, hasOpen, first, LX, openX, nutX, laneH, TOP, yOf, xOf, xL, xR, right, bot: yOf(5) };
    }

    function draw(svg, o) {
        const g = geometry(o);
        const { TOP, yOf, xOf, xL, xR, nutX, right, bot, first, hi, W, hasOpen, LX, openX, laneH } = g;
        let h = '';

        (o.lanes || []).forEach(l => {
            const y = 4 + l.lane * laneH, x1 = xL(l.lo) + 2, x2 = xR(l.hi) - 2;
            h += `<g class="lane" data-key="${esc(l.key)}">`
                + `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${laneH - 4}" rx="6" fill="${l.color}" fill-opacity="${l.on ? 1 : 0.22}" stroke="${l.color}" stroke-width="1.5"/>`
                + `<text class="lane-text" x="${x1 + 9}" y="${y + 13}" font-size="12" fill="${l.on ? 'var(--on-color)' : l.color}">${esc(l.text)}</text></g>`;
        });

        h += `<rect x="${nutX}" y="${TOP - 12}" width="${right - nutX}" height="${bot - TOP + 24}" fill="var(--board)" stroke="var(--board-edge)"/>`;
        (o.bands || []).forEach(b => {
            h += `<rect x="${xL(b.lo)}" y="${TOP - 14}" width="${xR(b.hi) - xL(b.lo)}" height="${bot - TOP + 28}" rx="6" fill="${b.color}" fill-opacity=".16" stroke="${b.color}" stroke-width="2"${b.dash ? ' stroke-dasharray="6 5" fill-opacity="0"' : ''}/>`;
        });

        const mid = (yOf(2) + yOf(3)) / 2;
        for (let f = first; f <= hi; f++) {
            if (INLAY_ONE.includes(f)) h += `<circle cx="${xOf(f)}" cy="${mid}" r="5" fill="var(--inlay)" opacity=".6"/>`;
            if (f === 12) [(yOf(1) + yOf(2)) / 2, (yOf(3) + yOf(4)) / 2]
                .forEach(y => { h += `<circle cx="${xOf(f)}" cy="${y}" r="5" fill="var(--inlay)" opacity=".6"/>`; });
        }
        for (let k = 1; k <= hi - first + 1; k++) {
            const x = nutX + k * W;
            h += `<line x1="${x}" x2="${x}" y1="${TOP - 12}" y2="${bot + 12}" stroke="var(--fret)" stroke-width="2"/>`;
        }
        if (o.numbers !== false) {
            for (let f = first; f <= hi; f++) {
                const on = o.hiFrets && f >= o.hiFrets[0] && f <= o.hiFrets[1];
                h += `<text class="num${on ? ' on' : ''}" x="${xOf(f)}" y="${bot + 30}" text-anchor="middle" font-size="12">${f}</text>`;
            }
            if (hasOpen) h += `<text class="num" x="${openX}" y="${bot + 30}" text-anchor="middle" font-size="10">open</text>`;
        }
        [0, 1, 2, 3, 4, 5].forEach(si => {
            const y = yOf(si);
            h += `<line x1="${hasOpen ? LX + 4 : nutX}" x2="${right}" y1="${y}" y2="${y}" stroke="var(--string)" stroke-width="${(0.9 + si * 0.45).toFixed(2)}"/>`;
            h += `<text class="num" x="${LX - 14}" y="${y + 4}" text-anchor="middle" font-size="12">${['e', 'B', 'G', 'D', 'A', 'E'][si]}</text>`;
        });
        h += `<rect x="${nutX - (hasOpen ? 5 : 1)}" y="${TOP - 12}" width="${hasOpen ? 6 : 2}" height="${bot - TOP + 24}" fill="${hasOpen ? 'var(--ink)' : 'var(--fret)'}"/>`;
        (o.mutes || []).forEach(si => {
            h += `<text class="num" x="${hasOpen ? openX : nutX - 12}" y="${yOf(si) + 4}" text-anchor="middle" font-size="12">×</text>`;
        });

        (o.dots || []).forEach(d => {
            const x = xOf(d.f), y = yOf(d.si), r = d.r || 12;
            const attrs = d.key !== undefined ? ` data-key="${esc(d.key)}"` : '';
            h += `<g class="dot${d.cls ? ' ' + d.cls : ''}"${attrs} opacity="${d.op === undefined ? 1 : d.op}">`;
            if (d.ring) h += `<circle cx="${x}" cy="${y}" r="${r + (d.ringGap || 4)}" fill="none" stroke="${d.ring}" stroke-width="${d.ringW || 2.5}"${d.ringDash ? ' stroke-dasharray="4 3"' : ''}/>`;
            h += `<circle cx="${x}" cy="${y}" r="${r}" fill="${d.fill}" stroke="${d.stroke || 'none'}" stroke-width="${d.sw || 0}"/>`;
            if (d.text) h += `<text class="dot-text" x="${x}" y="${y + 4}" text-anchor="middle" font-size="${String(d.text).length > 2 ? 9 : 11}" fill="${d.tc}">${esc(d.text)}</text>`;
            if (d.title) h += `<title>${esc(d.title)}</title>`;
            h += '</g>';
        });

        svg.setAttribute('viewBox', `0 0 ${right + 10} ${bot + 40}`);
        svg.innerHTML = h;
        return g;
    }

    /** Call fn(key, element) when a dot or lane is clicked or tapped. */
    function onPick(svg, fn) {
        svg.addEventListener('click', e => {
            const t = e.target.closest && e.target.closest('[data-key]');
            if (t) fn(t.getAttribute('data-key'), t);
        });
    }

    const api = { draw, onPick, geometry };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.GuitarBoard = api;
})(typeof window !== 'undefined' ? window : null);
