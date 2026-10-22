/*
 * Mode Ladder: the seven modes brightest to darkest, the selected one on the
 * neck, its chords, and something to hear. The music is in ../lib/theory.js.
 */
(function () {
    'use strict';
    const T = window.GuitarTheory, B = window.GuitarBoard, A = window.GuitarSynth;
    const $ = id => document.getElementById(id);
    const MAXF = 15;
    const ROOTS = T.ALL_ROOTS;
    const LICKS = {
        minor: { name: 'Minor pentatonic lick', notes: [[12, .5], [10, .5], [7, .5], [5, .5], [7, .5], [5, .25], [3, .25], [0, 1], [3, .5], [5, .5], [7, 1], [10, .5], [7, .5], [5, .25], [3, .25], [0, .5]] },
        major: { name: 'Major pentatonic lick', notes: [[0, .5], [2, .5], [4, .5], [7, .5], [9, .5], [12, .5], [9, .5], [7, .5], [4, .5], [2, .5], [0, .5], [2, .5], [4, 1], [7, .5], [0, .5]] }
    };

    const S = { root: ROOTS.findIndex(r => r.n === 'A'), mode: 3, shared: 'none', labels: 'interval', lick: 'minor', quiz: {} };
    const R = () => ROOTS[S.root];
    const M = () => T.MODES[S.mode];
    const famCls = m => 'fam-' + m.fam;
    const note = (m, s) => T.modeNote(R(), m, s);

    function renderLadder() {
        const shFam = S.shared;
        const shCols = shFam === 'none' ? [] : (shFam === 'major' ? [0, 2, 4, 7, 9] : [0, 3, 5, 7, 10]);
        const famC = shFam === 'major' ? 'fam-major' : 'fam-minor';
        let h = '<div></div>';
        T.COLS.forEach((c, s) => { h += `<div class="colh ${shCols.includes(s) ? 'sh ' + famC : ''}" data-col="${s}">${c}</div>`; });
        T.MODES.forEach((m, i) => {
            const dim = shFam !== 'none' && m.fam !== shFam ? ' row-dim' : '';
            const prev = i > 0 ? T.MODES[i - 1].iv : null;
            h += `<button type="button" class="mname ${famCls(m)}${dim}" data-m="${i}" aria-pressed="${i === S.mode}">
              <b>${m.name}</b><span class="pill">${m.fam === 'dim' ? 'dim' : m.fam}</span><small>${m.mood}</small></button>`;
            for (let s = 0; s < 12; s++) {
                const inM = m.iv.includes(s);
                let cls = 'cell ' + famCls(m) + dim;
                if (inM) {
                    cls += ' in';
                    if (s === m.flavor) cls += ' flavor';
                    if (shCols.includes(s) && m.fam === shFam) cls += ' shared';
                    if (prev && !prev.includes(s)) cls += ' dropped';
                }
                h += `<div class="${cls}" data-row="${i}" data-semi="${s}"${inM ? ` title="${m.name}: ${T.degLabel(s, m)} is ${note(m, s)}"` : ''}>${inM ? T.degLabel(s, m) : ''}</div>`;
            }
        });
        $('ladder').innerHTML = h;
        $('ladder').querySelectorAll('.mname').forEach(b => { b.onclick = () => { A.stop(); selectMode(+b.dataset.m); }; });
    }
    function selectMode(i) { S.mode = i; S.lick = T.MODES[i].fam === 'major' ? 'major' : 'minor'; render(); }

    function renderPlayer() {
        const m = M(), p = $('player'), vamp = T.VAMPS[m.name];
        const core = T.corePentatonic(m), extra = m.iv.filter(s => !core.includes(s));
        const coreName = m.fam === 'major' ? 'major pentatonic' : m.fam === 'minor' ? 'minor pentatonic' : 'minor pentatonic without its 5th';
        const playing = A.playing();
        p.className = 'card ' + famCls(m);
        p.innerHTML = `
          <div class="mode-head"><h3>${R().n} ${m.name}</h3>${m.aka ? `<span class="small">also called ${m.aka.toLowerCase()}</span>` : ''}<span class="pill">${m.fam === 'dim' ? 'diminished' : m.fam}</span></div>
          <div class="formula">${m.iv.map(s => `<span class="${s === 0 ? 'rt' : s === m.flavor ? 'fl' : ''}" title="${note(m, s)}">${T.degLabel(s, m)}</span>`).join('')}</div>
          <p class="small">Notes: ${m.iv.map(s => note(m, s)).join(' · ')}</p>
          <p class="flav"><b style="color:var(--flavor)">Flavor note ${T.degLabel(m.flavor, m)}.</b> ${m.why}</p>
          <p class="small">It is the ${coreName} plus ${extra.map(s => T.degLabel(s, m)).join(' and ')}.</p>
          <h2>A vamp that sounds like it</h2>
          <div class="chords">${vamp.map(([k], j) => `${j ? '<span class="small" aria-hidden="true">→</span>' : ''}<div class="chord" data-ci="${j}"><b>${T.chordName(R(), m, k)}</b><small>${T.roman(m, k)}</small></div>`).join('')}</div>
          <h2>Listen</h2>
          <div class="btns">
            <button type="button" class="btn${playing === 'scale' ? ' on' : ''}" id="p-scale">▶ Scale over a drone</button>
            <button type="button" class="btn${playing === 'vamp' ? ' on' : ''}" id="p-vamp">▶ Vamp</button>
            <button type="button" class="btn${playing === 'lick' ? ' on' : ''}" id="p-lick">▶ Vamp and lick</button>
            <button type="button" class="btn" id="p-stop"${playing ? '' : ' disabled'} style="--c:var(--bad)">■ Stop</button>
          </div>
          <label class="ctl"><span>Lick</span><select id="lick">${Object.keys(LICKS).map(k => `<option value="${k}"${S.lick === k ? ' selected' : ''}>${LICKS[k].name}</option>`).join('')}</select></label>
          <p class="small">Try a lick from the wrong family on purpose, the minor one over Ionian. A note the mode does not have flashes red in the ladder's header.</p>`;
        $('p-scale').onclick = playScale;
        $('p-vamp').onclick = () => playVamp(false);
        $('p-lick').onclick = () => playVamp(true);
        $('p-stop').onclick = () => A.stop();
        $('lick').onchange = e => { S.lick = e.target.value; };
    }

    function renderFret() {
        const m = M(), r = R(), core = T.corePentatonic(m), dots = [];
        for (let si = 0; si < 6; si++) for (let f = 0; f <= MAXF; f++) {
            const iv = T.ivAt(r.p, si, f);
            if (!m.iv.includes(iv)) continue;
            const isRoot = iv === 0, isFl = iv === m.flavor, isCore = core.includes(iv);
            let st;
            if (isRoot) st = { fill: 'var(--root)', tc: '#ffffff' };
            else if (isFl) st = { fill: 'var(--flavor)', tc: '#ffffff' };
            else if (isCore) st = { fill: 'var(--note)', tc: 'var(--note-text)' };
            else st = { fill: 'var(--board)', stroke: 'var(--note)', sw: 2.5, tc: 'var(--note)' };
            dots.push(Object.assign({ si, f, cls: 'iv-' + iv, text: S.labels === 'interval' ? T.degLabel(iv, m) : note(m, iv), title: `${note(m, iv)} (${T.degLabel(iv, m)})` }, st));
        }
        B.draw($('fb'), { lo: 0, hi: MAXF, W: 54, dots });
        $('fb-title').textContent = `${r.n} ${m.name} on the neck`;
    }

    /* ---------------- Check yourself: original questions ---------------- */
    const QUIZ = [
        { q: 'Which mode is the major scale with a raised 4th?', opts: ['Mixolydian', 'Lydian', 'Dorian'], a: 1,
          why: 'Lydian. Its ♯4 is the only difference from Ionian, and it sits at the top of the ladder for that reason: it is the one mode brighter than major.',
          show: 'Show Lydian', act: () => { S.shared = 'none'; selectMode(0); } },
        { q: 'Dorian and Aeolian are one note apart. Which note?', opts: ['The 2nd', 'The 6th', 'The 7th'], a: 1,
          why: 'The 6th. Dorian has a natural 6, Aeolian a ♭6. Look for the ↓ in Aeolian\'s row.',
          show: 'Show Aeolian', act: () => { S.shared = 'none'; selectMode(4); } },
        { q: 'Mixolydian is the major scale with one change. What is it?', opts: ['♭3', '♭7', '♯4'], a: 1,
          why: 'A ♭7. Keep the major 3rd and lower the 7th, and you have the sound of a dominant 7 chord.',
          show: 'Show Mixolydian', act: () => { S.shared = 'none'; selectMode(2); } },
        { q: 'Which mode has a diminished home chord?', opts: ['Phrygian', 'Aeolian', 'Locrian'], a: 2,
          why: 'Locrian. Its 5th is flattened, so the chord on its root is R ♭3 ♭5, a diminished triad, and it never quite feels like home.',
          show: 'Show Locrian', act: () => { S.shared = 'none'; selectMode(6); } },
        { q: 'Between two neighbouring rows of the ladder, how many notes change?', opts: ['One', 'Two', 'It depends'], a: 0,
          why: 'Always one, and always by one fret down. That is why the ladder is ordered by brightness rather than alphabetically.',
          show: 'Highlight the minor family', act: () => { S.shared = 'minor'; render(); } },
        { q: 'Which of these modes is missing a note of the minor pentatonic?', opts: ['Dorian', 'Phrygian', 'Locrian'], a: 2,
          why: 'Locrian: its 5th is flattened, so a pentatonic lick\'s 5 clashes there. Dorian, Aeolian and Phrygian each contain all five notes, so one lick fits all three and the chords underneath change the colour. Hear it.',
          show: '▶ One lick, three modes', act: () => playThree() }
    ];
    function renderQuiz() {
        $('quiz').innerHTML = QUIZ.map((q, i) => {
            const pick = S.quiz[i], done = pick !== undefined;
            return `<div class="q"><div class="num">${String(i + 1).padStart(2, '0')}</div><h4>${q.q}</h4>
              <div class="opts">${q.opts.map((o, j) => {
                  let c = '';
                  if (done) { if (j === q.a) c = 'right'; else if (j === pick) c = 'wrong'; }
                  return `<button type="button" data-q="${i}" data-o="${j}" class="${c}"${done ? ' disabled' : ''}>${o}</button>`;
              }).join('')}</div>
              ${done ? `<p><span class="${pick === q.a ? 'verdict-ok' : 'verdict-no'}">${pick === q.a ? 'Right.' : 'Not quite.'}</span> ${q.why}</p>
              <div><button type="button" class="btn" data-show="${i}">${q.show}</button></div>` : ''}</div>`;
        }).join('');
        $('quiz').querySelectorAll('.opts button').forEach(b => { b.onclick = () => { S.quiz[+b.dataset.q] = +b.dataset.o; renderQuiz(); }; });
        $('quiz').querySelectorAll('[data-show]').forEach(b => { b.onclick = () => QUIZ[+b.dataset.show].act(); });
    }

    /* ---------------- Sound ---------------- */
    const bassRoot = () => 45 + T.mod12(R().p - 9); // A2 up to G#3
    function flash(s) {
        const m = M(), semi = T.mod12(s);
        if (m.iv.includes(semi)) {
            const c = document.querySelector(`.cell[data-row="${S.mode}"][data-semi="${semi}"]`);
            if (c) { c.classList.add('playing'); setTimeout(() => c.classList.remove('playing'), 200); }
        } else {
            const h = document.querySelector(`.colh[data-col="${semi}"]`);
            if (h) { h.classList.add('clash'); setTimeout(() => h.classList.remove('clash'), 350); }
        }
        document.querySelectorAll(`#fb .iv-${semi}`).forEach(d => { d.classList.add('flash'); setTimeout(() => d.classList.remove('flash'), 220); });
    }
    function playScale() {
        const m = M(), t0 = A.start('scale'); if (t0 === null) return;
        const b = 0.32, R0 = bassRoot(), seq = [...m.iv, 12, ...m.iv.slice().reverse()];
        A.pad(R0, t0, seq.length * b + 0.8, 0.12); A.pad(R0 + 7, t0, seq.length * b + 0.8, 0.07);
        seq.forEach((s, i) => { const t = t0 + i * b; A.pluck(R0 + 12 + s, t, 0.6, 0.2); A.at(t, () => flash(s)); });
        A.endAt(t0 + seq.length * b + 0.9);
    }
    function scheduleVamp(m, t0, beat, withLick) {
        const R0 = bassRoot(); let t = t0;
        T.VAMPS[m.name].forEach(([k, len], ci) => {
            const tr = T.triad(m, k);
            let base = R0 + 12 + tr[0]; if (base > R0 + 18) base -= 12;
            A.at(t, () => document.querySelectorAll('.chord').forEach(c => c.classList.toggle('now', +c.dataset.ci === ci)));
            for (let bt = 0; bt < len; bt += 2) A.strum(tr.map(x => base + (x - tr[0])), t + bt * beat, beat * 2.1, 0.085);
            let bass = R0 + tr[0]; if (bass > R0 + 7) bass -= 12;
            for (let bt = 0; bt < len; bt++) A.pluck(bass, t + bt * beat, beat * 0.95, 0.2);
            for (let hb = 0; hb < len * 2; hb++) A.hat(t + hb * beat / 2, hb % 2 ? 0.04 : 0.08);
            t += len * beat;
        });
        if (withLick) {
            let lt = t0;
            LICKS[S.lick].notes.forEach(([s, d]) => { A.pluck(R0 + 12 + s, lt, d * beat * 1.4 + 0.1, 0.24); A.at(lt, () => flash(s)); lt += d * beat; });
        }
        return t;
    }
    function playVamp(withLick) {
        const m = M(); let t = A.start(withLick ? 'lick' : 'vamp'); if (t === null) return;
        t = scheduleVamp(m, t, 0.6, withLick); t = scheduleVamp(m, t, 0.6, withLick);
        A.endAt(t + 0.3);
    }
    function playThree() {
        S.lick = 'minor'; S.shared = 'minor';
        let t = A.start('three'); if (t === null) return;
        [3, 5, 4].forEach(i => {
            const m = T.MODES[i];
            A.at(t, () => {
                S.mode = i; renderLadder(); renderFret(); renderPlayer(); sync();
                $('nowplaying').textContent = `Now: ${R().n} ${m.name}, ${T.VAMPS[m.name].map(([k]) => T.chordName(R(), m, k)).join(' → ')}`;
            });
            t = scheduleVamp(m, t, 0.6, true); t = scheduleVamp(m, t, 0.6, true);
        });
        A.endAt(t + 0.3);
    }
    A.onChange(kind => {
        if (!kind) { $('nowplaying').textContent = ''; document.querySelectorAll('.chord.now').forEach(c => c.classList.remove('now')); }
        renderPlayer();
    });

    function sync() {
        document.querySelectorAll('#shared button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S.shared));
        document.querySelectorAll('#labels button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S.labels));
        $('root').value = S.root;
    }
    function render() { renderLadder(); renderPlayer(); renderFret(); sync(); }

    $('root').innerHTML = ROOTS.map((r, i) => `<option value="${i}">${r.n}</option>`).join('');
    $('root').onchange = e => { A.stop(); S.root = +e.target.value; render(); };
    document.querySelectorAll('#shared button').forEach(b => { b.onclick = () => { S.shared = b.dataset.v; render(); }; });
    document.querySelectorAll('#labels button').forEach(b => { b.onclick = () => { S.labels = b.dataset.v; renderFret(); sync(); }; });
    render(); renderQuiz();
})();
