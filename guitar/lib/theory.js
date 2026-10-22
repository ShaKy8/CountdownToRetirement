/*
 * Guitar theory, as pure functions.
 *
 * Everything the four tools under /guitar/ know about music lives here: how a
 * note is spelled, which frets a scale or a mode lands on, which chords a mode
 * builds, which modes fit a chord, and where the five CAGED shapes sit for a
 * key. No DOM, no audio, no network -- so tests.js can require it and check
 * the music itself (a CAGED voicing that contains a note outside its chord is
 * a bug no screenshot would show).
 *
 * Conventions:
 *   - Pitch classes are 0..11 with C = 0.
 *   - A root is { n, L, p }: its display name, its letter index (C = 0 .. B = 6)
 *     and its pitch class. The letter is what lets "E♭" spell its 3rd as "G"
 *     rather than "F𝄪".
 *   - Strings are listed top to bottom as drawn, high E first, like tab.
 *   - Intervals are semitones above the root, 0..11.
 */
(function (root) {
    'use strict';

    const LETTERS = 'CDEFGAB';
    const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
    const ACC = { '-2': '♭♭', '-1': '♭', '0': '', '1': '♯', '2': '♯♯' };

    /** Parse "E♭", "F♯" or "Bb" into a root. */
    function makeRoot(name) {
        const n = name.replace('b', '♭').replace('#', '♯');
        const L = LETTERS.indexOf(n[0]);
        if (L < 0) throw new Error('not a note name: ' + name);
        const acc = n.slice(1) === '♯' ? 1 : n.slice(1) === '♭' ? -1 : 0;
        return { n, L, p: (LETTER_PC[L] + acc + 12) % 12 };
    }

    // The spellings a player expects. Major-family pages offer flats for the
    // black keys (B♭ major, not A♯ major); minor pages offer C♯ and G♯ minor,
    // which is how those keys are written.
    const MAJOR_ROOTS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'].map(makeRoot);
    const MINOR_ROOTS = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'].map(makeRoot);
    const ALL_ROOTS = ['C', 'C♯', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'].map(makeRoot);

    /**
     * Spell the note `semis` above `root`, using the letter `steps` letters up.
     * spell(E♭, 2, 4) is "G" (a major 3rd above E♭ is a G of some kind).
     */
    function spell(r, steps, semis) {
        const letter = (r.L + steps) % 7;
        let diff = ((r.p + semis - LETTER_PC[letter]) % 12 + 12) % 12;
        if (diff > 6) diff -= 12;
        return LETTERS[letter] + ACC[diff];
    }

    // Standard tuning, top to bottom as drawn. midi is the open string's pitch.
    const STRINGS = [
        { n: 'e', name: 'high E', num: 1, open: 4, midi: 64 },
        { n: 'B', name: 'B', num: 2, open: 11, midi: 59 },
        { n: 'G', name: 'G', num: 3, open: 7, midi: 55 },
        { n: 'D', name: 'D', num: 4, open: 2, midi: 50 },
        { n: 'A', name: 'A', num: 5, open: 9, midi: 45 },
        { n: 'E', name: 'low E', num: 6, open: 4, midi: 40 }
    ];

    const mod12 = x => ((x % 12) + 12) % 12;
    /** Pitch class at a string and fret. */
    const pcAt = (si, f) => mod12(STRINGS[si].open + f);
    /** Interval above the root at a string and fret. */
    const ivAt = (rootP, si, f) => mod12(STRINGS[si].open + f - rootP);
    /** MIDI note at a string and fret. */
    const midiAt = (si, f) => STRINGS[si].midi + f;

    /* ------------------------------------------------------------------
       Minor pentatonic: R ♭3 4 5 ♭7, and its five boxes.
       ------------------------------------------------------------------ */
    const PENTA_MINOR = [0, 3, 5, 7, 10];
    // Letter steps for each pentatonic interval, so C minor reads E♭, not D♯.
    const PENTA_STEPS = { 0: 0, 3: 2, 5: 3, 7: 4, 10: 6 };
    const PENTA_LABEL = { 0: 'R', 3: '♭3', 5: '4', 7: '5', 10: '♭7' };
    // Fret windows of the five boxes, relative to the root on the low E string.
    const PENTA_BOXES = [[0, 3], [2, 5], [4, 8], [7, 10], [9, 12]];

    /** Low-E fret of the root, 0..11. */
    const lowERootFret = rootP => mod12(rootP - 4);

    /** The fret window of box `b` (1..5), moved down an octave if it runs off a 15-fret neck. */
    function pentaBox(rootP, b, maxFret) {
        const r = lowERootFret(rootP);
        let [a, z] = PENTA_BOXES[b - 1];
        a += r; z += r;
        if (z > (maxFret || 15)) { a -= 12; z -= 12; }
        return [a, z];
    }

    /* ------------------------------------------------------------------
       The seven modes of the major scale, brightest to darkest. Going down
       the list, each mode flattens exactly one more note than the one above.
       ------------------------------------------------------------------ */
    const MODES = [
        { name: 'Lydian', fam: 'major', iv: [0, 2, 4, 6, 7, 9, 11], flavor: 6, mood: 'Dreamy, floating',
          why: 'The ♯4 removes the pull of the ordinary 4th, so the sound hangs in the air. Common in film music.' },
        { name: 'Ionian', fam: 'major', iv: [0, 2, 4, 5, 7, 9, 11], flavor: 11, mood: 'The plain major scale', aka: 'Major scale',
          why: 'The major 7 sits one fret below the root and leans hard back to it. That pull is what makes major sound settled.' },
        { name: 'Mixolydian', fam: 'major', iv: [0, 2, 4, 5, 7, 9, 10], flavor: 10, mood: 'Bluesy, rock major',
          why: 'Major with a ♭7. That lowered 7th is the sound of a lot of rock and blues riffs over a major chord.' },
        { name: 'Dorian', fam: 'minor', iv: [0, 2, 3, 5, 7, 9, 10], flavor: 9, mood: 'Cool, jazzy minor',
          why: 'Minor with a natural 6. That one raised note makes it brighter and funkier than natural minor.' },
        { name: 'Aeolian', fam: 'minor', iv: [0, 2, 3, 5, 7, 8, 10], flavor: 8, mood: 'Sad, classic minor', aka: 'Natural minor',
          why: 'The ♭6 is the sad, dramatic note. Raise it a fret and you are in Dorian.' },
        { name: 'Phrygian', fam: 'minor', iv: [0, 1, 3, 5, 7, 8, 10], flavor: 1, mood: 'Dark, Spanish, metal',
          why: 'The ♭2 sits one fret above the root. That tight rub is the dark, Spanish edge.' },
        { name: 'Locrian', fam: 'dim', iv: [0, 1, 3, 5, 6, 8, 10], flavor: 6, mood: 'Unstable, rarely used',
          why: 'The ♭5 makes its home chord diminished, so it never feels settled.' }
    ];
    const MAJOR_SCALE = MODES[1].iv;
    const COLS = ['1', '♭2', '2', '♭3', '3', '4', '♯4/♭5', '5', '♭6', '6', '♭7', '7'];

    const modeByName = name => MODES.find(m => m.name === name);

    /** The degree label of an interval within a mode (♯4 in a major mode, ♭5 otherwise). */
    function degLabel(s, m) {
        if (s === 6) return m && m.fam === 'major' ? '♯4' : '♭5';
        return COLS[s];
    }

    /** Name of the note `s` semitones above the root, spelled within mode m. */
    function modeNote(r, m, s) {
        const d = m.iv.indexOf(s);
        return d < 0 ? '?' : spell(r, d, s);
    }

    /** The core pentatonic a mode contains: major modes the major pentatonic, minor the minor. */
    function corePentatonic(m) {
        if (m.fam === 'major') return [0, 2, 4, 7, 9];
        if (m.fam === 'minor') return PENTA_MINOR.slice();
        return [0, 3, 5, 10]; // Locrian has no perfect 5th
    }

    /** The triad built on degree k (0..6) of mode m, as semitones above the mode's root. */
    function triad(m, k) {
        const g = j => m.iv[(k + j) % 7] + ((k + j) >= 7 ? 12 : 0);
        return [g(0), g(2), g(4)];
    }

    function quality(t) {
        const a = t[1] - t[0], b = t[2] - t[0];
        if (a === 4 && b === 7) return 'maj';
        if (a === 3 && b === 7) return 'min';
        if (a === 3 && b === 6) return 'dim';
        return 'aug';
    }

    const QSYM = { maj: '', min: 'm', dim: '°', aug: '+' };

    /** Chord name on degree k of mode m, rooted at r: "Gm", "B♭", "E°". */
    function chordName(r, m, k) {
        return spell(r, k, m.iv[k]) + QSYM[quality(triad(m, k))];
    }

    /** Roman numeral of degree k, measured against the major scale: "♭VII", "iv". */
    function roman(m, k) {
        const q = quality(triad(m, k));
        const d = m.iv[k] - MAJOR_SCALE[k];
        let n = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][k];
        if (q === 'min' || q === 'dim') n = n.toLowerCase();
        return (d < 0 ? '♭' : d > 0 ? '♯' : '') + n + (q === 'dim' ? '°' : q === 'aug' ? '+' : '');
    }

    // A short progression that sounds like each mode: [degree, beats].
    const VAMPS = {
        Lydian: [[0, 4], [1, 4]], Ionian: [[0, 4], [3, 2], [4, 2]], Mixolydian: [[0, 4], [6, 2], [3, 2]],
        Dorian: [[0, 4], [3, 4]], Aeolian: [[0, 4], [5, 2], [6, 2]], Phrygian: [[0, 4], [1, 4]], Locrian: [[0, 4], [1, 4]]
    };

    /* ------------------------------------------------------------------
       Chords, and which modes fit them. A mode fits a chord when it
       contains every one of the chord's notes.
       ------------------------------------------------------------------ */
    const CT_LABEL = { 0: 'R', 3: '♭3', 4: '3', 6: '♭5', 7: '5', 10: '♭7', 11: '7' };
    const CT_STEPS = { 0: 0, 3: 2, 4: 2, 6: 4, 7: 4, 10: 6, 11: 6 };
    // Voicings are frets relative to the root's fret on the low E string,
    // listed top to bottom; null is a muted string.
    const CHORDS = [
        { id: 'maj7', sym: 'maj7', label: 'Major 7', tones: [0, 4, 7, 11], v: [0, 0, 1, 1, 2, 0] },
        { id: 'dom7', sym: '7', label: 'Dominant 7', tones: [0, 4, 7, 10], v: [0, 0, 1, 0, 2, 0] },
        { id: 'm7', sym: 'm7', label: 'Minor 7', tones: [0, 3, 7, 10], v: [0, 0, 0, 0, 2, 0] },
        { id: 'm7b5', sym: 'm7♭5', label: 'Half-diminished', tones: [0, 3, 6, 10], v: [null, -1, 0, 0, null, 0] },
        { id: 'maj', sym: '', label: 'Major triad', tones: [0, 4, 7], v: [0, 0, 1, 2, 2, 0] },
        { id: 'min', sym: 'm', label: 'Minor triad', tones: [0, 3, 7], v: [0, 0, 0, 2, 2, 0] }
    ];

    const fits = (chord, m) => chord.tones.every(t => m.iv.includes(t));
    const fitModes = chord => MODES.filter(m => fits(chord, m));
    /** The 3rd, 5th and 7th that decide a chord's quality (the root rarely helps). */
    const keyTones = tones => tones.filter(x => x === 3 || x === 4 || x === 6 || x === 10 || x === 11);
    /** What a mode has instead of a chord tone it lacks: the neighbour a fret away. */
    function insteadOf(t, m) {
        const order = [3, 6, 10].includes(t) ? [t + 1, t - 1] : [t - 1, t + 1];
        const near = order.map(mod12).find(x => m.iv.includes(x));
        return near === undefined ? null : near;
    }
    /** Fret of the chord's root on low E, kept off the nut so every voicing is fretted. */
    function chordRootFret(rootP) {
        let f = lowERootFret(rootP);
        if (f < 2) f += 12;
        return f;
    }

    /* ------------------------------------------------------------------
       CAGED. Five open major chord shapes, each slid up the neck. Voicings
       are frets above the shape's "nut" position p, top to bottom.
       ------------------------------------------------------------------ */
    const CAGED = {
        C: { root: 0, v: [0, 1, 0, 2, 3, null], win: [0, 3], next: 'A', hand: { si: 4, off: 3 }, origin: 'open C chord' },
        A: { root: 9, v: [0, 2, 2, 2, 0, null], win: [-1, 2], next: 'G', hand: { si: 2, off: 2 }, origin: 'open A chord' },
        G: { root: 7, v: [3, 0, 0, 0, 2, 3], win: [-1, 3], next: 'E', hand: { si: 5, off: 3 }, origin: 'open G chord' },
        E: { root: 4, v: [0, 0, 1, 2, 2, 0], win: [-1, 2], next: 'D', hand: { si: 3, off: 2 }, origin: 'open E chord' },
        D: { root: 2, v: [2, 3, 2, 0, null, null], win: [-1, 3], next: 'C', hand: { si: 1, off: 3 }, origin: 'open D chord' }
    };
    const CAGED_ORDER = ['C', 'A', 'G', 'E', 'D'];
    const MAJOR_STEPS = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
    const MAJOR_LABEL = { 0: 'R', 2: '2', 4: '3', 5: '4', 7: '5', 9: '6', 11: '7' };

    /** Every CAGED shape for a major key on a neck of maxFret frets, sorted up the neck. */
    function cagedInstances(rootP, maxFret) {
        const out = [];
        CAGED_ORDER.forEach(s => {
            const p0 = mod12(rootP - CAGED[s].root);
            [p0, p0 + 12].forEach(p => { if (p + 3 <= maxFret) out.push({ s, p }); });
        });
        return out.sort((a, b) => a.p - b.p);
    }

    /** The fret window a shape's scale position covers. */
    function cagedWindow(inst, maxFret) {
        const w = CAGED[inst.s].win;
        return [Math.max(0, inst.p + w[0]), Math.min(maxFret, inst.p + w[1])];
    }

    /** MIDI notes of a shape's chord, low to high. */
    function cagedVoicing(s, p) {
        return CAGED[s].v.map((v, si) => v === null ? null : midiAt(si, p + v))
            .filter(x => x !== null).sort((a, b) => a - b);
    }

    /** The CAGED shape for a chord nearest a hand position (fret), on a neck of maxFret frets. */
    function nearestShape(rootP, zone, maxFret) {
        let best = null;
        CAGED_ORDER.forEach(s => {
            const p0 = mod12(rootP - CAGED[s].root);
            [p0, p0 + 12].forEach(p => {
                if (p + 3 > maxFret) return;
                const d = Math.abs(p + 1.5 - zone);
                if (!best || d < best.d) best = { s, p, d };
            });
        });
        return best;
    }

    const api = {
        LETTERS, makeRoot, spell, MAJOR_ROOTS, MINOR_ROOTS, ALL_ROOTS, STRINGS, mod12, pcAt, ivAt, midiAt,
        PENTA_MINOR, PENTA_STEPS, PENTA_LABEL, PENTA_BOXES, lowERootFret, pentaBox,
        MODES, MAJOR_SCALE, COLS, modeByName, degLabel, modeNote, corePentatonic, triad, quality, chordName, roman, VAMPS,
        CT_LABEL, CT_STEPS, CHORDS, fits, fitModes, keyTones, insteadOf, chordRootFret,
        CAGED, CAGED_ORDER, MAJOR_STEPS, MAJOR_LABEL, cagedInstances, cagedWindow, cagedVoicing, nearestShape
    };

    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.GuitarTheory = api;
})(typeof window !== 'undefined' ? window : null);
