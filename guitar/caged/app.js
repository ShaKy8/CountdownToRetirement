/*
 * CAGED Explorer: the five shapes chained up the neck, the planner and the
 * shape-spotting drill. The shapes themselves are in ../lib/theory.js.
 */
(function () {
    'use strict';
    const T = window.GuitarTheory, B = window.GuitarBoard, A = window.GuitarSynth;
    const $ = id => document.getElementById(id);
    const MAXF = 17;
    const KEYS = T.MAJOR_ROOTS;
    const SH = T.CAGED, ORDER = T.CAGED_ORDER;
    const LAYERS = { chord: null, arp: [0, 4, 7], pent: [0, 2, 4, 7, 9], scale: [0, 2, 4, 5, 7, 9, 11] };
    const LAYER_NOTE = {
        chord: 'Chords: each coloured group is one playable shape. All five are the same chord in five places.',
        arp: 'Arpeggios: every root, 3rd and 5th. Each shape\'s chord sits inside this map, and soloing on these notes outlines the chord.',
        pent: 'Major pentatonic: R 2 3 5 6 around each shape. Chord tones are solid, the two extra notes hollow.',
        scale: 'Major scale: all seven notes in each position. Learn the chord shape first, then the notes around it.'
    };
    const LAYER_WORD = { chord: 'chord', arp: 'arpeggio', pent: 'pentatonic', scale: 'scale' };
    const PRESETS = [
        { name: 'I–IV–V in G (G C D)', ch: ['G', 'C', 'D', 'G'] },
        { name: 'I–IV–V in E (E A B)', ch: ['E', 'A', 'B', 'E'] },
        { name: 'I–V–IV in C (C G F)', ch: ['C', 'G', 'F', 'C'] },
        { name: 'Up a whole step (G C D → A D E)', ch: ['G', 'C', 'D', 'A', 'D', 'E'] },
        { name: 'Up a half step (E A B → F B♭ C)', ch: ['E', 'A', 'B', 'F', 'B♭', 'C'] }
    ];

    const S = { key: 0, layer: 'chord', labels: 'iv', focus: null, preset: 0, zone: 5, d: { right: 0, total: 0 } };
    const K = () => KEYS[S.key];
    const inst = () => T.cagedInstances(K().p, MAXF);
    const lab = (key, iv) => S.labels === 'iv' ? T.MAJOR_LABEL[iv] : T.spell(key, T.MAJOR_STEPS[iv], iv);
    function sty(iv) {
        if (iv === 0) return { fill: 'var(--root)', tc: '#ffffff' };
        if (iv === 4 || iv === 7) return { fill: 'var(--note)', tc: 'var(--note-text)' };
        return { fill: 'var(--board)', stroke: 'var(--note)', sw: 2.5, tc: 'var(--note)' };
    }

    function renderChain() {
        const key = K(), all = inst();
        $('chain-title').textContent = `${key.n} major, up the neck`;
        let h = '';
        all.forEach((it, i) => {
            if (i > 0) h += `<div class="gap" aria-hidden="true"><span>→</span>+${it.p - all[i - 1].p}</div>`;
            h += `<button type="button" class="link sh-${it.s}" data-i="${i}" aria-pressed="${S.focus === i}" aria-label="${it.s} shape at fret ${it.p}"><b>${it.s}</b><small>fret ${it.p}</small></button>`;
        });
        h += `<button type="button" class="btn" id="show-all" style="margin-left:8px"${S.focus === null ? ' disabled' : ''}>Show all</button>`;
        $('chain').innerHTML = h;
        $('chain').querySelectorAll('.link').forEach(b => { b.onclick = () => { A.stop(); focus(S.focus === +b.dataset.i ? null : +b.dataset.i); }; });
        $('show-all').onclick = () => focus(null);
    }
    function focus(i) { S.focus = i; renderAll(); }

    function renderMain() {
        const key = K(), ins = inst(), set = LAYERS[S.layer], dots = [], bands = [];
        const lanes = ins.map((it, i) => {
            const [lo, hi] = T.cagedWindow(it, MAXF);
            return { lo, hi, lane: i % 2, key: String(i), on: S.focus === i, color: `var(--s${it.s})`, text: `${it.s} shape` };
        });
        if (S.focus === null) {
            if (S.layer === 'chord') {
                ins.forEach(it => SH[it.s].v.forEach((v, si) => {
                    if (v === null) return;
                    const f = it.p + v, iv = T.ivAt(key.p, si, f);
                    dots.push({ si, f, fill: `var(--s${it.s})`, tc: 'var(--on-color)', text: lab(key, iv), ring: iv === 0 ? 'var(--ink)' : null, ringGap: 3 });
                }));
            } else {
                for (let si = 0; si < 6; si++) for (let f = 0; f <= MAXF; f++) {
                    const iv = T.ivAt(key.p, si, f);
                    if (set.includes(iv)) dots.push(Object.assign({ si, f, text: lab(key, iv) }, sty(iv)));
                }
            }
        } else {
            const it = ins[S.focus], [lo, hi] = T.cagedWindow(it, MAXF);
            bands.push({ lo, hi, color: `var(--s${it.s})` });
            if (S.layer === 'chord') {
                SH[it.s].v.forEach((v, si) => {
                    if (v === null) return;
                    const f = it.p + v, iv = T.ivAt(key.p, si, f);
                    dots.push(Object.assign({ si, f, text: lab(key, iv) }, sty(iv)));
                });
            } else {
                for (let si = 0; si < 6; si++) for (let f = 0; f <= MAXF; f++) {
                    const iv = T.ivAt(key.p, si, f);
                    if (!set.includes(iv)) continue;
                    const inside = f >= lo && f <= hi;
                    dots.push(Object.assign({ si, f, text: inside ? lab(key, iv) : '', op: inside ? 1 : 0.16, r: inside ? 12 : 9 }, sty(iv)));
                }
            }
        }
        B.draw($('main-board'), { lo: 0, hi: MAXF, W: 50, dots, bands, lanes });
        $('layer-note').textContent = LAYER_NOTE[S.layer];
        const lg = [];
        if (S.focus === null && S.layer === 'chord') {
            ORDER.forEach(s => lg.push(`<span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="var(--s${s})"/></svg>${s} shape</span>`));
            lg.push('<span><svg width="18" height="18" aria-hidden="true"><circle cx="9" cy="9" r="5" fill="var(--muted)"/><circle cx="9" cy="9" r="8" fill="none" stroke="var(--ink)" stroke-width="2"/></svg>Root (ringed)</span>');
        } else {
            lg.push('<span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="var(--root)"/></svg>Root</span>',
                '<span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="var(--note)"/></svg>3rd or 5th</span>');
            if (S.layer === 'pent' || S.layer === 'scale') lg.push('<span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="var(--board)" stroke="var(--note)" stroke-width="2"/></svg>Other scale note</span>');
        }
        $('legend').innerHTML = lg.join('');
        $('p-shape').textContent = S.focus === null ? '▶ Play (pick a shape first)' : `▶ Play the ${ins[S.focus].s} shape ${LAYER_WORD[S.layer]}`;
        $('p-shape').disabled = S.focus === null;
    }

    function miniOpen(svg, s) {
        const key = KEYS.find(k => k.p === SH[s].root), dots = [], mutes = [];
        SH[s].v.forEach((f, si) => {
            if (f === null) { mutes.push(si); return; }
            const iv = T.ivAt(key.p, si, f);
            dots.push(Object.assign({ si, f, r: 10, text: T.MAJOR_LABEL[iv] }, sty(iv)));
        });
        B.draw(svg, { lo: 0, hi: 3, W: 30, SG: 20, dots, mutes });
    }

    function renderDetail() {
        const el = $('detail'), key = K(), ins = inst();
        if (S.focus === null) {
            el.className = 'card';
            el.innerHTML = `<h2>How the shapes connect</h2>
              <p>Each shape hands over to the next through a shared root, like a relay: the top of one shape is the bottom of the next.</p>
              <dl class="facts">${ORDER.map(s => `<dt><b style="color:var(--s${s})">${s} → ${SH[s].next}</b></dt><dd>share a root on the ${T.STRINGS[SH[s].hand.si].name} string</dd>`).join('')}</dl>
              <p class="small">In every key the shapes sit 3, 2, 3, 2 and 2 frets apart, which adds up to 12. Then the pattern repeats an octave higher.</p>`;
            return;
        }
        const it = ins[S.focus], sh = SH[it.s], [lo, hi] = T.cagedWindow(it, MAXF);
        const roots = [];
        sh.v.forEach((v, si) => { if (v !== null && T.ivAt(key.p, si, it.p + v) === 0) roots.push(`${T.STRINGS[si].name} (fret ${it.p + v})`); });
        const nxt = ins[S.focus + 1], prv = ins[S.focus - 1];
        el.className = 'card sh-' + it.s;
        el.innerHTML = `<div class="shape-head"><div class="bigletter" aria-hidden="true">${it.s}</div><div><h3>${it.s} shape</h3><p class="small">${key.n} major · starts at ${it.p === 0 ? 'the open strings' : 'fret ' + it.p}</p></div></div>
          <div class="origin"><svg class="board" id="mini" role="img" aria-label="The ${sh.origin}"></svg>
            <p>${it.p === 0 ? `This is the ${sh.origin} itself, so no barre is needed.` : `The ${sh.origin}, slid up ${it.p} fret${it.p > 1 ? 's' : ''}. Your first finger, or a barre, takes the nut's place at fret ${it.p}.`}</p></div>
          <dl class="facts"><dt>Roots</dt><dd>${roots.join(', ')}</dd><dt>Position</dt><dd>frets ${lo}–${hi}</dd></dl>
          <p class="handoff">Hands over to the <b>${sh.next} shape</b> through the root on the ${T.STRINGS[sh.hand.si].name} string, fret ${it.p + sh.hand.off}.</p>
          <div class="btns"><button type="button" class="btn" id="prev-s"${prv ? '' : ' disabled'}>◀ ${prv ? prv.s + ' shape' : 'Previous'}</button><button type="button" class="btn" id="next-s"${nxt ? '' : ' disabled'}>${nxt ? nxt.s + ' shape' : 'Next'} ▶</button></div>`;
        miniOpen($('mini'), it.s);
        $('prev-s').onclick = () => { A.stop(); focus(S.focus - 1); };
        $('next-s').onclick = () => { A.stop(); focus(S.focus + 1); };
    }

    function sync() {
        document.querySelectorAll('#layer button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S.layer));
        document.querySelectorAll('#labels button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S.labels));
        $('key').value = S.key;
    }
    function renderAll() { renderChain(); renderMain(); renderDetail(); sync(); }

    /* ---------------- Planner ---------------- */
    function planned() {
        return PRESETS[S.preset].ch.map(n => { const k = T.makeRoot(n); return Object.assign({ n, k }, T.nearestShape(k.p, S.zone, MAXF)); });
    }
    function renderPlanner() {
        const pl = planned(), lo = Math.max(0, Math.min(...pl.map(c => c.p))), hi = Math.max(...pl.map(c => c.p + 3));
        $('zone-val').textContent = S.zone; $('zone').value = S.zone; $('preset').value = S.preset;
        $('prog').innerHTML = pl.map((c, i) => `<div class="pc sh-${c.s}" data-i="${i}"><div class="pn"><b>${c.n}</b><span class="chip">${c.s} shape</span></div>
          <svg class="board" id="pc${i}" role="img" aria-label="${c.n} as a ${c.s} shape at fret ${c.p}"></svg><span class="small">fret ${c.p}</span></div>`).join('');
        pl.forEach((c, i) => {
            const dots = [], mutes = [];
            SH[c.s].v.forEach((v, si) => {
                if (v === null) { mutes.push(si); return; }
                const f = c.p + v, iv = T.ivAt(c.k.p, si, f);
                dots.push({ si, f, r: 10, fill: `var(--s${c.s})`, tc: 'var(--on-color)', text: T.MAJOR_LABEL[iv], ring: iv === 0 ? 'var(--ink)' : null, ringGap: 3 });
            });
            B.draw($('pc' + i), { lo, hi, W: 26, SG: 18, dots, mutes });
        });
        let cMove = 0, eMove = 0, ePrev = null, cPrev = null;
        pl.forEach(c => {
            const ep = T.mod12(c.k.p - 4);
            if (ePrev !== null) eMove += Math.abs(ep - ePrev); ePrev = ep;
            if (cPrev !== null) cMove += Math.abs(c.p - cPrev); cPrev = c.p;
        });
        $('metric').innerHTML = `<div><span class="small">Hand travel with CAGED</span><b class="good">${cMove} frets</b></div>
          <div><span class="small">The same chords as E-shape barres only</span><b class="bad">${eMove} frets</b></div>
          <div style="align-self:center;max-width:46ch"><span class="small">Move the slider: the chords stay the same, and each one switches to whichever shape is nearest your hand.</span></div>`;
    }

    /* ---------------- Drill ---------------- */
    let D = null;
    function newDrill() {
        const key = KEYS[Math.floor(Math.random() * 12)], s = ORDER[Math.floor(Math.random() * 5)];
        let p = T.mod12(key.p - SH[s].root); if (p < 2) p += 12;
        const type = Math.random() < 0.5 ? 'shape' : 'chord';
        let opts;
        if (type === 'shape') opts = ORDER.slice();
        else {
            const pool = KEYS.filter(k => k !== key).sort(() => Math.random() - 0.5).slice(0, 3);
            opts = [key, ...pool].sort(() => Math.random() - 0.5).map(k => k.n);
        }
        D = { key, s, p, type, opts, pick: null };
        renderDrill();
    }
    function renderDrill() {
        const { key, s, p, type } = D, done = D.pick !== null, dots = [], mutes = [];
        SH[s].v.forEach((v, si) => {
            if (v === null) { mutes.push(si); return; }
            const f = p + v, iv = T.ivAt(key.p, si, f);
            dots.push(Object.assign({ si, f, text: done ? T.MAJOR_LABEL[iv] : '' }, iv === 0 ? { fill: 'var(--root)', tc: '#fff' } : { fill: 'var(--note)', tc: 'var(--note-text)' }));
        });
        B.draw($('d-board'), { lo: Math.max(1, p - 1), hi: p + 4, W: 56, dots, mutes, bands: done ? [{ lo: p, hi: p + 3, color: `var(--s${s})` }] : [] });
        $('dq').textContent = type === 'shape' ? 'Which CAGED shape is this chord?' : `This is a ${s} shape. Which chord is it?`;
        const correct = type === 'shape' ? s : key.n;
        $('dopts').innerHTML = D.opts.map(o => {
            let c = '';
            if (done) { if (o === correct) c = 'right'; else if (o === D.pick) c = 'wrong'; }
            return `<button type="button" data-o="${o}" class="${c}"${done ? ' disabled' : ''}>${o}</button>`;
        }).join('');
        $('dopts').querySelectorAll('button').forEach(b => { b.onclick = () => { D.pick = b.dataset.o; S.d.total++; if (D.pick === correct) S.d.right++; renderDrill(); }; });
        if (done) {
            const sh = SH[s], rs = [];
            sh.v.forEach((v, si) => { if (v !== null && T.ivAt(key.p, si, p + v) === 0) rs.push(`${T.STRINGS[si].name} fret ${p + v}`); });
            const ok = D.pick === correct;
            $('dexp').innerHTML = `<span class="${ok ? 'verdict-ok' : 'verdict-no'}">${ok ? 'Right.' : 'Not quite.'}</span> It is <b>${key.n} major, ${s} shape</b>: the ${sh.origin} moved up to fret ${p}, with roots on ${rs.join(' and ')}.
              <br><span class="small">${type === 'shape' ? 'Tip: find the lowest root. On the A string it is a C or A shape, on the low E a G or E shape, on the D string a D shape.' : 'Tip: name the root on the lowest string that has one, from its fret number.'}</span>`;
        } else $('dexp').innerHTML = '';
        $('score').textContent = S.d.total ? `${S.d.right} / ${S.d.total}` : '';
    }

    /* ---------------- Sound ---------------- */
    function playFocus() {
        if (S.focus === null) return;
        const key = K(), it = inst()[S.focus], t0 = A.start('shape'); if (t0 === null) return;
        if (S.layer === 'chord') { A.strum(T.cagedVoicing(it.s, it.p), t0, 2.6, 0.12); A.endAt(t0 + 2.8); return; }
        const [lo, hi] = T.cagedWindow(it, MAXF), set = LAYERS[S.layer], ns = new Set();
        for (let si = 0; si < 6; si++) for (let f = lo; f <= hi; f++) if (set.includes(T.ivAt(key.p, si, f))) ns.add(T.midiAt(si, f));
        const up = [...ns].sort((a, b) => a - b), seq = [...up, ...up.slice(0, -1).reverse()], b = 0.2;
        A.strum(T.cagedVoicing(it.s, it.p), t0, 1.6, 0.1);
        seq.forEach((m, i) => A.pluck(m, t0 + 1 + i * b, 0.4, 0.18));
        A.endAt(t0 + 1 + seq.length * b + 0.5);
    }
    function playAll() {
        const ins = inst(); let t = A.start('all'); if (t === null) return;
        ins.forEach((it, i) => { A.at(t, () => focus(i)); A.strum(T.cagedVoicing(it.s, it.p), t, 1.4, 0.11); t += 1.1; });
        A.endAt(t + 0.6);
    }
    function playProg() {
        const pl = planned(); let t = A.start('prog'); if (t === null) return;
        pl.forEach((c, i) => {
            A.at(t, () => document.querySelectorAll('.pc').forEach(x => x.classList.toggle('now', +x.dataset.i === i)));
            A.strum(T.cagedVoicing(c.s, c.p), t, 1.8, 0.11); A.strum(T.cagedVoicing(c.s, c.p), t + 0.8, 1.2, 0.07);
            t += 1.6;
        });
        A.endAt(t + 0.4);
    }
    function playDrill() { const t = A.start('drill'); if (t === null) return; A.strum(T.cagedVoicing(D.s, D.p), t, 2.4, 0.12); A.endAt(t + 2.6); }
    A.onChange(kind => {
        $('p-stop').disabled = !kind;
        ['p-shape', 'p-all', 'p-prog', 'dplay'].forEach(id => $(id).classList.toggle('on', kind === { 'p-shape': 'shape', 'p-all': 'all', 'p-prog': 'prog', dplay: 'drill' }[id]));
        if (!kind) document.querySelectorAll('.pc.now').forEach(x => x.classList.remove('now'));
    });

    /* ---------------- Wiring ---------------- */
    $('key').innerHTML = KEYS.map((k, i) => `<option value="${i}">${k.n} major</option>`).join('');
    $('key').onchange = e => { A.stop(); S.key = +e.target.value; S.focus = null; renderAll(); };
    document.querySelectorAll('#layer button').forEach(b => { b.onclick = () => { S.layer = b.dataset.v; renderAll(); }; });
    document.querySelectorAll('#labels button').forEach(b => { b.onclick = () => { S.labels = b.dataset.v; renderAll(); }; });
    B.onPick($('main-board'), key => { A.stop(); const i = +key; focus(S.focus === i ? null : i); });
    $('preset').innerHTML = PRESETS.map((p, i) => `<option value="${i}">${p.name}</option>`).join('');
    $('preset').onchange = e => { A.stop(); S.preset = +e.target.value; renderPlanner(); };
    $('zone').oninput = e => { S.zone = +e.target.value; renderPlanner(); };
    $('p-shape').onclick = playFocus; $('p-all').onclick = playAll; $('p-stop').onclick = () => A.stop(); $('p-prog').onclick = playProg;
    $('dnext').onclick = () => { A.stop(); newDrill(); }; $('dplay').onclick = playDrill;
    renderAll(); renderPlanner(); newDrill();
})();
