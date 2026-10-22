/*
 * Pentatonic Boxes: the minor pentatonic's five boxes on a 15-fret neck.
 * The music is in ../lib/theory.js; this file is state, drawing and input.
 */
(function () {
    'use strict';
    const T = window.GuitarTheory, B = window.GuitarBoard, A = window.GuitarSynth;
    const $ = id => document.getElementById(id);
    const MAXF = 15;
    const ROOTS = T.MINOR_ROOTS;
    const ORDER = T.PENTA_MINOR;
    const IV = {
        0: { name: 'Root', what: 'Home. The scale is named after this note, and phrases sound finished when they land on it.' },
        3: { name: 'Minor 3rd', what: 'The note that makes it minor. Three frets above the root.' },
        5: { name: 'Perfect 4th', what: 'Open and stable. Five frets above the root, or the same fret one string higher.' },
        7: { name: 'Perfect 5th', what: "The root's strongest partner. Root and 5th together are a power chord." },
        10: { name: 'Minor 7th', what: 'The bluesy pull back to the root. Two frets below the next root up.' }
    };

    const S = {
        key: ROOTS.findIndex(r => r.n === 'A'), box: 1, view: 'box', labels: 'interval', sel: null, hi: null,
        q: { on: false, target: null, answered: false, pick: null, right: 0, total: 0, last: null }
    };
    const R = () => ROOTS[S.key];
    const nn = s => T.spell(R(), T.PENTA_STEPS[s], s);
    const win = () => T.pentaBox(R().p, S.box, MAXF);

    function allNotes() {
        const out = [];
        for (let si = 0; si < 6; si++) for (let f = 0; f <= MAXF; f++) {
            const iv = T.ivAt(R().p, si, f);
            if (ORDER.includes(iv)) out.push({ si, f, iv });
        }
        return out;
    }
    const inBox = n => { const [a, z] = win(); return n.f >= a && n.f <= z; };
    // The box's notes in playing order: low string first, low fret first.
    const boxNotes = () => allNotes().filter(inBox).sort((x, y) => (y.si - x.si) || (x.f - y.f));

    function render() {
        const [a, z] = win(), qt = S.q.on ? S.q.target : null, dots = [];
        allNotes().forEach(n => {
            const boxed = inBox(n);
            if (S.view === 'box' && !boxed) return;
            let op = 1, r = 12;
            if (S.view === 'neck' && !boxed) { op = 0.35; r = 10; }
            if (S.hi !== null && n.iv !== S.hi) op = Math.min(op, 0.15);
            if (qt && !(qt.si === n.si && qt.f === n.f)) op = Math.min(op, 0.3);
            const isSel = !S.q.on && S.sel && S.sel.si === n.si && S.sel.f === n.f;
            const isQ = qt && qt.si === n.si && qt.f === n.f;
            const labels = S.q.on ? (S.q.answered && isQ ? 'interval' : 'blank') : S.labels;
            const text = labels === 'interval' ? T.PENTA_LABEL[n.iv] : labels === 'note' ? nn(n.iv) : '';
            const isRoot = n.iv === 0;
            dots.push({
                si: n.si, f: n.f, r, op, text, key: n.si + ':' + n.f,
                fill: isRoot ? 'var(--root)' : 'var(--note)', tc: isRoot ? '#ffffff' : 'var(--note-text)',
                ring: isSel || isQ ? 'var(--accent)' : null, ringW: 3,
                title: `${nn(n.iv)}, ${T.STRINGS[n.si].name} string, ${n.f ? 'fret ' + n.f : 'open'}`
            });
        });
        B.draw($('fb'), { lo: 0, hi: MAXF, W: 54, dots, bands: [{ lo: a, hi: z, color: 'var(--accent)', dash: true }], hiFrets: [a, z] });
        $('board-title').textContent = `${R().n} minor pentatonic · box ${S.box}`;
        $('range').textContent = `${a === 0 ? 'open' : 'fret ' + a}–${z} · ${ORDER.map(nn).join(' ')}`;
        renderSel(); renderFormula(); renderDrill(); sync();
    }

    function renderSel() {
        const c = $('sel');
        if (!S.sel) { c.innerHTML = '<h2>Selected note</h2><p class="small">Tap any dot on the neck.</p>'; return; }
        const { si, f } = S.sel, s = T.STRINGS[si], iv = T.ivAt(R().p, si, f), I = IV[iv], isRoot = iv === 0;
        c.innerHTML = `<h2>Selected note</h2>
          <div class="sel-big"><div class="badge" style="background:${isRoot ? 'var(--root)' : 'var(--note)'};color:${isRoot ? '#fff' : 'var(--note-text)'}">${T.PENTA_LABEL[iv]}</div>
          <div><h3>${nn(iv)}, the ${I.name.toLowerCase()}</h3><p>${I.what}</p></div></div>
          <dl class="facts">
            <dt>String</dt><dd>${s.num} (${s.name})</dd>
            <dt>Fret</dt><dd>${f === 0 ? 'open' : f}</dd>
            <dt>Above the root</dt><dd>${iv} fret${iv === 1 ? '' : 's'}</dd>
            <dt>In box ${S.box}?</dt><dd>${inBox({ f }) ? 'Yes' : 'No: it belongs to a neighbouring box'}</dd>
          </dl>
          <div class="btns"><button type="button" class="btn" id="prev">◀ Previous note</button><button type="button" class="btn" id="next">Next note ▶</button></div>`;
        $('prev').onclick = () => step(-1);
        $('next').onclick = () => step(1);
    }
    // Walk the selection through the box in playing order: the keyboard route
    // to every dot, since the dots themselves are tap targets only.
    function step(d) {
        const ns = boxNotes();
        let i = ns.findIndex(n => S.sel && n.si === S.sel.si && n.f === S.sel.f);
        i = i < 0 ? 0 : (i + d + ns.length) % ns.length;
        S.sel = { si: ns[i].si, f: ns[i].f };
        render();
        const n = ns[i];
        const go = () => { const t = A.start('note'); if (t !== null) { A.pluck(T.midiAt(n.si, n.f), t, 0.9, 0.22); A.endAt(t + 1); } };
        go();
    }

    function renderFormula() {
        $('formula').innerHTML = ORDER.map(iv => `<button type="button" class="chip${iv === 0 ? ' root' : ''}" data-iv="${iv}" aria-pressed="${S.hi === iv}">
          <b>${T.PENTA_LABEL[iv]}</b><span>${nn(iv)}</span><small>+${iv}</small></button>`).join('');
        $('formula').querySelectorAll('.chip').forEach(b => { b.onclick = () => { const iv = +b.dataset.iv; S.hi = S.hi === iv ? null : iv; render(); }; });
    }

    function newQuestion() {
        const pool = allNotes().filter(inBox).filter(n => !S.q.last || n.si !== S.q.last.si || n.f !== S.q.last.f);
        const t = pool[Math.floor(Math.random() * pool.length)];
        Object.assign(S.q, { target: t, last: t, answered: false, pick: null });
    }
    function renderDrill() {
        const c = $('drill'), q = S.q;
        if (!q.on) {
            c.innerHTML = `<h2>Name that interval</h2><p class="small">One dot in the box is ringed and the labels are hidden. Say which part of the formula it is.</p>
              <div><button type="button" class="btn primary" id="q-start">Start</button></div>`;
            $('q-start').onclick = () => { q.on = true; q.right = 0; q.total = 0; S.hi = null; newQuestion(); render(); };
            return;
        }
        const t = q.target, s = T.STRINGS[t.si];
        c.innerHTML = `<div class="headrow"><h2>Name that interval</h2><span class="score">${q.right} / ${q.total}</span></div>
          <p>The ringed dot is on the <b>${s.name}</b> string, ${t.f === 0 ? 'open' : 'fret ' + t.f}. Which interval is it?</p>
          <div class="opts answers">${ORDER.map(iv => {
              let cls = '';
              if (q.answered) { if (iv === t.iv) cls = 'right'; else if (iv === q.pick) cls = 'wrong'; }
              return `<button type="button" data-iv="${iv}" class="${cls}"${q.answered ? ' disabled' : ''}>${T.PENTA_LABEL[iv]}</button>`;
          }).join('')}</div>
          <p class="${q.answered ? (q.pick === t.iv ? 'verdict-ok' : 'verdict-no') : ''}">${q.answered
              ? (q.pick === t.iv ? `Right: ${nn(t.iv)} is the ${IV[t.iv].name.toLowerCase()}.` : `That one is ${nn(t.iv)}, the ${IV[t.iv].name.toLowerCase()}, ${t.iv} frets above ${nn(0)}.`)
              : '&nbsp;'}</p>
          <div class="btns"><button type="button" class="btn primary" id="q-next"${q.answered ? '' : ' disabled'}>Next dot</button><button type="button" class="btn" id="q-stop">Stop</button></div>`;
        c.querySelectorAll('.answers button').forEach(b => {
            b.onclick = () => { q.pick = +b.dataset.iv; q.answered = true; q.total++; if (q.pick === t.iv) q.right++; render(); };
        });
        $('q-next').onclick = () => { newQuestion(); render(); };
        $('q-stop').onclick = () => { q.on = false; q.target = null; render(); };
    }

    function playBox() {
        const ns = boxNotes(), t0 = A.start('box');
        if (t0 === null) return;
        const seq = [...ns, ...ns.slice(0, -1).reverse()], b = 0.24;
        seq.forEach((n, i) => {
            A.pluck(T.midiAt(n.si, n.f), t0 + i * b, 0.5, 0.2);
            A.at(t0 + i * b, () => { if (!S.q.on) { S.sel = { si: n.si, f: n.f }; render(); } });
        });
        A.endAt(t0 + seq.length * b + 0.4);
    }

    function defaultSel() { const r = allNotes().filter(inBox).find(n => n.iv === 0); S.sel = r ? { si: r.si, f: r.f } : null; }
    function sync() {
        document.querySelectorAll('#box button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.v === S.box));
        document.querySelectorAll('#view button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S.view));
        document.querySelectorAll('#labels button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S.labels));
        $('key').value = S.key;
    }

    $('key').innerHTML = ROOTS.map((r, i) => `<option value="${i}">${r.n} minor</option>`).join('');
    $('box').innerHTML = [1, 2, 3, 4, 5].map(n => `<button type="button" data-v="${n}">${n}</button>`).join('');
    $('key').onchange = e => { A.stop(); S.key = +e.target.value; if (S.q.on) newQuestion(); defaultSel(); render(); };
    document.querySelectorAll('#box button').forEach(b => { b.onclick = () => { A.stop(); S.box = +b.dataset.v; if (S.q.on) newQuestion(); defaultSel(); render(); }; });
    document.querySelectorAll('#view button').forEach(b => { b.onclick = () => { S.view = b.dataset.v; render(); }; });
    document.querySelectorAll('#labels button').forEach(b => { b.onclick = () => { S.labels = b.dataset.v; render(); }; });
    B.onPick($('fb'), key => {
        if (S.q.on) return;
        const [si, f] = key.split(':').map(Number);
        S.sel = { si, f }; render();
        const t = A.start('note'); if (t !== null) { A.pluck(T.midiAt(si, f), t, 0.9, 0.22); A.endAt(t + 1); }
    });
    $('play').onclick = playBox;
    $('stop').onclick = () => A.stop();
    A.onChange(kind => { $('play').classList.toggle('on', kind === 'box'); $('stop').disabled = !kind; });

    defaultSel(); render();
})();
