/*
 * Chord-to-Mode Matcher: a chord on the neck, every mode tested against its
 * notes, and a practice drill. The music is in ../lib/theory.js.
 */
(function () {
    'use strict';
    const T = window.GuitarTheory, B = window.GuitarBoard, A = window.GuitarSynth;
    const $ = id => document.getElementById(id);
    const ROOTS = T.ALL_ROOTS;
    const S = {
        root: ROOTS.findIndex(r => r.n === 'A'), chord: 2, mode: 3, overlay: 'on',
        q: { item: null, pick: null, right: 0, total: 0, labels: 'on', last: -1 }
    };
    const R = () => ROOTS[S.root], C = () => T.CHORDS[S.chord], Mo = () => T.MODES[S.mode];
    const famCls = m => 'fam-' + m.fam;
    const ct = t => T.CT_LABEL[t];

    /* The neck: the chord big, the mode's other notes small, clashes red. */
    function drawChord(svg, r, chord, mode, opts) {
        const rf = T.chordRootFret(r.p), from = rf - 2, to = rf + 4, dots = [], mutes = [];
        if (mode && opts.overlay) {
            for (let si = 0; si < 6; si++) for (let f = from; f <= to; f++) {
                const v = chord.v[si];
                if (v !== null && rf + v === f) continue;
                const iv = T.ivAt(r.p, si, f);
                if (!mode.iv.includes(iv)) continue;
                const culprit = chord.tones.some(t => !mode.iv.includes(t) && T.insteadOf(t, mode) === iv);
                dots.push({ si, f, r: 10, fill: culprit ? 'var(--bad)' : 'var(--surface)', stroke: culprit ? 'var(--bad)' : 'var(--c)', sw: 2,
                    text: iv === 0 ? 'R' : T.degLabel(iv, mode), tc: culprit ? '#ffffff' : 'var(--c)' });
            }
        }
        chord.v.forEach((v, si) => {
            if (v === null) { mutes.push(si); return; }
            const f = rf + v, iv = T.ivAt(r.p, si, f), isR = iv === 0;
            const clash = mode && opts.overlay && !mode.iv.includes(iv);
            dots.push({ si, f, r: 14, fill: isR ? 'var(--root)' : 'var(--note)', tc: isR ? '#ffffff' : 'var(--note-text)',
                text: opts.labels ? ct(iv) : '', ring: clash ? 'var(--bad)' : null, ringDash: true, ringW: 3, ringGap: 5 });
        });
        B.draw(svg, { lo: from, hi: to, W: 66, SG: 32, dots, mutes });
    }

    function renderTypes() {
        $('types').innerHTML = T.CHORDS.map((c, i) => {
            const kt = T.keyTones(c.tones);
            return `<button type="button" class="type" data-i="${i}" aria-pressed="${i === S.chord}">
              <span class="tn">${c.label}</span>
              <span class="tf">${c.tones.map(t => kt.includes(t) ? `<b>${ct(t)}</b>` : ct(t)).join(' ')}</span>
              <span class="tm">${T.fitModes(c).map(m => `<span class="mchip ${famCls(m)}">${m.name}</span>`).join('')}</span></button>`;
        }).join('');
        $('types').querySelectorAll('.type').forEach(b => {
            b.onclick = () => { S.chord = +b.dataset.i; const f = T.fitModes(C()); if (!f.includes(Mo())) S.mode = T.MODES.indexOf(f[0]); A.stop(); render(); };
        });
    }

    function renderMain() {
        const r = R(), c = C(), m = Mo(), kt = T.keyTones(c.tones);
        $('cname').textContent = `${r.n}${c.sym}`;
        $('tones').innerHTML = c.tones.map(t => `<span class="${t === 0 ? 'rt' : kt.includes(t) ? 'key' : ''}">${ct(t)} ${T.spell(r, T.CT_STEPS[t], t)}</span>`).join('');
        const card = $('board').closest('.card');
        card.classList.remove('fam-major', 'fam-minor', 'fam-dim'); card.classList.add(famCls(m));
        drawChord($('board'), r, c, m, { overlay: S.overlay === 'on', labels: true });
        const ok = T.fits(c, m);
        $('legend').innerHTML = `<span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="var(--root)"/></svg>Chord root</span>
          <span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="var(--note)"/></svg>Chord tone</span>
          ${S.overlay === 'on' ? `<span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="var(--surface)" stroke="var(--c)" stroke-width="2"/></svg>Other ${m.name} notes</span>
          <span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="var(--bad)"/></svg>The note that clashes</span>` : ''}`;
        $('hint').textContent = ok
            ? `${m.name} fits: every chord tone is in the scale, so any ${m.name} note you play belongs.`
            : `${m.name} clashes. Listen for the red note rubbing against the chord, then pick a mode marked Fits and compare.`;
        $('fit').innerHTML = T.MODES.map((md, i) => {
            const f = T.fits(c, md);
            return `<button type="button" class="frow ${famCls(md)}" data-i="${i}" aria-pressed="${i === S.mode}">
              <span class="mn">${md.name}</span>
              <span class="checks">${c.tones.map(t => {
                  if (md.iv.includes(t)) return `<span class="chk y">✓ ${ct(t)}</span>`;
                  const ins = T.insteadOf(t, md);
                  return `<span class="chk n">✗ has ${ins === null ? 'nothing near' : T.degLabel(ins, md)}, not ${ct(t)}</span>`;
              }).join('')}</span>
              <span class="verdict ${f ? 'y' : 'n'}">${f ? 'Fits' : 'Clash'}</span></button>`;
        }).join('');
        $('fit').querySelectorAll('.frow').forEach(b => { b.onclick = () => { S.mode = +b.dataset.i; A.stop(); renderMain(); }; });
        const fm = T.fitModes(c).map(x => x.name);
        const has3 = c.tones.includes(4) ? 'a major 3rd (3)' : 'a minor 3rd (♭3)';
        const has7 = c.tones.includes(11) ? ' and a major 7th (7)' : c.tones.includes(10) ? ' and a flat 7th (♭7)' : '';
        const has5 = c.tones.includes(6) ? ', plus a ♭5' : '';
        $('summary').innerHTML = `<b>${r.n}${c.sym}</b> has ${has3}${has7}${has5}. That leaves ${fm.length === 1 ? 'one mode' : fm.length + ' modes'}: <b>${fm.join(', ')}</b>.${c.tones.length === 3 ? ' With no 7th in the chord, more modes fit.' : ''}`;
        document.querySelectorAll('#overlay button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S.overlay));
    }
    function render() { renderTypes(); renderMain(); $('root').value = S.root; $('chord').value = S.chord; }

    /* ---------------- Practice: generated, never copied ---------------- */
    const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    function makeItem() {
        let chord;
        do { chord = Math.floor(Math.random() * 4); } while (chord === S.q.last && Math.random() < 0.7);
        S.q.last = chord;
        const c = T.CHORDS[chord], good = T.fitModes(c), bad = T.MODES.filter(m => !T.fits(c, m));
        const right = good[Math.floor(Math.random() * good.length)];
        const opts = shuffle([right, ...shuffle(bad).slice(0, 2)]).map(m => m.name);
        return { root: Math.floor(Math.random() * ROOTS.length), chord, opts };
    }
    function renderQuiz() {
        const it = S.q.item, r = ROOTS[it.root], c = T.CHORDS[it.chord], done = S.q.pick !== null;
        drawChord($('qboard'), r, c, null, { overlay: false, labels: S.q.labels === 'on' });
        $('qtext').textContent = `Which of these modes could you play over this chord? The root is red${S.q.labels === 'on' ? '.' : '; work the intervals out from the shape.'}`;
        $('qopts').innerHTML = it.opts.map((n, j) => {
            const m = T.modeByName(n); let cls = '';
            if (done) { if (T.fits(c, m)) cls = 'right'; else if (j === S.q.pick) cls = 'wrong'; }
            return `<button type="button" data-j="${j}" class="${cls}"${done ? ' disabled' : ''}>${n}<small>${m.iv.map(s => T.degLabel(s, m)).join(' ')}</small></button>`;
        }).join('');
        $('qopts').querySelectorAll('button').forEach(b => {
            b.onclick = () => { S.q.pick = +b.dataset.j; S.q.total++; if (T.fits(c, T.modeByName(it.opts[S.q.pick]))) S.q.right++; renderQuiz(); };
        });
        if (done) {
            const ok = T.fits(c, T.modeByName(it.opts[S.q.pick]));
            const lines = it.opts.map(n => {
                const m = T.modeByName(n);
                if (T.fits(c, m)) return `<li><b>${n}</b> contains ${c.tones.map(ct).join(' ')}. Fits.</li>`;
                const miss = c.tones.filter(t => !m.iv.includes(t)).map(t => `${T.degLabel(T.insteadOf(t, m), m)} instead of ${ct(t)}`);
                return `<li><b>${n}</b> has ${miss.join(' and ')}. Clashes.</li>`;
            }).join('');
            $('qexp').innerHTML = `<p><span class="${ok ? 'verdict-ok' : 'verdict-no'}">${ok ? 'Right.' : 'Not quite.'}</span> This is <b>${r.n}${c.sym}</b> (${c.label.toLowerCase()}): ${c.tones.map(ct).join(' ')}.</p>
              <ul style="margin:8px 0 10px;padding-left:1.2em;display:grid;gap:4px">${lines}</ul>
              <button type="button" class="btn" id="qload">Open this chord in the matcher</button>`;
            $('qload').onclick = () => { S.root = it.root; S.chord = it.chord; S.mode = T.MODES.indexOf(T.modeByName(it.opts[S.q.pick])); A.stop(); render(); $('board').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
        } else $('qexp').innerHTML = '';
        $('score').textContent = S.q.total ? `${S.q.right} / ${S.q.total}` : '';
        document.querySelectorAll('#qlabels button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S.q.labels));
    }
    function nextQ() { S.q.item = makeItem(); S.q.pick = null; renderQuiz(); }

    /* ---------------- Sound ---------------- */
    function voicing(r, c) {
        const rf = T.chordRootFret(r.p);
        return c.v.map((v, si) => v === null ? null : T.midiAt(si, rf + v)).filter(x => x !== null).sort((a, b) => a - b);
    }
    function playChord() { const t = A.start('chord'); if (t === null) return; A.strum(voicing(R(), C()), t, 2.8, 0.12); A.endAt(t + 3); }
    function playMode() {
        const r = R(), m = Mo(), t0 = A.start('mode'); if (t0 === null) return;
        const v = voicing(r, C()), base = 40 + T.chordRootFret(r.p) + 12, b = 0.3;
        const seq = [...m.iv, 12, ...m.iv.slice().reverse()], total = seq.length * b + 1;
        for (let t = 0; t < total; t += 1.8) A.strum(v, t0 + t, 2.2, 0.075);
        seq.forEach((s, i) => A.pluck(base + s, t0 + 0.2 + i * b, 0.55, 0.2));
        A.endAt(t0 + total + 0.4);
    }
    A.onChange(kind => {
        $('p-chord').classList.toggle('on', kind === 'chord');
        $('p-mode').classList.toggle('on', kind === 'mode');
        $('p-stop').disabled = !kind;
    });

    $('root').innerHTML = ROOTS.map((r, i) => `<option value="${i}">${r.n}</option>`).join('');
    $('chord').innerHTML = T.CHORDS.map((c, i) => `<option value="${i}">${c.label} (${c.sym || 'maj'})</option>`).join('');
    $('root').onchange = e => { S.root = +e.target.value; A.stop(); render(); };
    $('chord').onchange = e => { S.chord = +e.target.value; A.stop(); render(); };
    document.querySelectorAll('#overlay button').forEach(b => { b.onclick = () => { S.overlay = b.dataset.v; renderMain(); }; });
    document.querySelectorAll('#qlabels button').forEach(b => { b.onclick = () => { S.q.labels = b.dataset.v; renderQuiz(); }; });
    $('p-chord').onclick = playChord; $('p-mode').onclick = playMode; $('p-stop').onclick = () => A.stop();
    $('qnext').onclick = nextQ;
    S.q.item = makeItem();
    render(); renderQuiz();
})();
