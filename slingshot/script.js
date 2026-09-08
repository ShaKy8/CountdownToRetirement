/*
 * SLINGSHOT - canvas, input, storage, flow.
 *
 * Everything that touches the DOM lives here; orbit.js has the rules and knows
 * nothing about any of this. Shot events are DIFFED out of the flight result in
 * this file rather than returned by the rules, so the pure-rules split holds.
 */
(function () {
    'use strict';

    const S = window.Slingshot;
    const Audio = window.SlingshotAudio;
    const clamp = window.Daily.clamp;

    const byId = function (id) { return document.getElementById(id); };
    const stage = byId('stage');
    const ctx = stage.getContext('2d');

    const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, dpr = 1, k = 1, ox = 0, oy = 0;
    let level = null, day = 0, saved = null;
    let shots = 0, best = Infinity, codes = [], ghosts = [], probe = null;
    let aim = { a: 0, v: 60 };
    let mode = 'preflight';       // preflight | aim | flying | done
    let scored = true;            // does this level count for the daily?
    let stars = [];

    // ------------------------------------------------------------------
    // Storage
    // ------------------------------------------------------------------

    function readState() {
        let raw = null;
        try { raw = window.localStorage.getItem(S.STORAGE_KEY); } catch (e) { raw = null; }
        return S.parseState(raw);
    }
    function writeState() {
        try { window.localStorage.setItem(S.STORAGE_KEY, S.serializeState(saved)); } catch (e) { /* private mode */ }
    }

    // ------------------------------------------------------------------
    // View
    // ------------------------------------------------------------------

    function fit() {
        const r = stage.getBoundingClientRect();
        if (!r.width || !r.height) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = r.width; H = r.height;
        const bw = Math.round(W * dpr), bh = Math.round(H * dpr);
        if (stage.width !== bw || stage.height !== bh) { stage.width = bw; stage.height = bh; }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Reserve room for the HUD above and the hint below.
        const top = 200, bottom = 70;
        k = Math.min(W / (S.WORLD.w + 24), (H - top - bottom) / (S.WORLD.h + 24));
        ox = (W - S.WORLD.w * k) / 2;
        oy = top + ((H - top - bottom) - S.WORLD.h * k) / 2;
        if (!stars.length) {
            const rr = window.Daily.makeRng(7);
            for (let i = 0; i < 150; i++) stars.push({ x: rr(), y: rr(), b: 0.2 + rr() * 0.7 });
        }
    }
    const X = function (x) { return ox + x * k; };
    const Y = function (y) { return oy + y * k; };
    function toWorld(sx, sy) { return [(sx - ox) / k, (sy - oy) / k]; }

    // ------------------------------------------------------------------
    // Flow
    // ------------------------------------------------------------------

    function loadLevel(seed, isScored) {
        level = S.makeLevel(seed);
        scored = isScored;
        shots = 0; best = Infinity; codes = []; ghosts = []; probe = null;
        // Open aimed straight at the beacon. It is the guess anyone would make,
        // and the first shot then demonstrates exactly why it does not work.
        aim = {
            a: Math.atan2(level.target.y - level.launch.y, level.target.x - level.launch.x),
            v: (S.SIM.V_MIN + S.SIM.V_MAX) / 2
        };
        paintHud();
        paintGauges();
    }

    function say(text, cls) {
        const e = byId('say');
        e.textContent = text;
        e.className = 'say' + (cls ? ' ' + cls : '');
    }

    function fire() {
        if (mode !== 'aim') return;
        const r = S.fly(level, Math.cos(aim.a), Math.sin(aim.a), aim.v, { path: true });
        shots++;
        mode = 'flying';
        probe = { path: r.path || [], i: 0, res: r };
        Audio.event('launch', aim.v / S.SIM.V_MAX);
        say('Away…', '');
        paintGauges();
    }

    function land() {
        const r = probe.res;
        ghosts.push({ path: probe.path, outcome: r.outcome });
        if (ghosts.length > 6) ghosts.shift();
        codes.push(S.shotCode(r.outcome, r.near));

        if (r.outcome === 'hit') {
            mode = 'done';
            Audio.event('arrive');
            if (scored) {
                saved = S.recordDaily(saved, day, {
                    shots: shots, par: level.par, bodies: level.planets.length,
                    outcomes: S.packShots(codes)
                });
                writeState();
            }
            say('Arrived in ' + shots + '.', 'good');
            paintGauges();
            // Hold the card back for a beat. The completed arc is the reward and
            // the card sits right on top of it; showing them together means you
            // never actually see the shot you just made.
            window.setTimeout(showResult, reduceMotion ? 0 : 1100);
            return;
        }

        best = Math.min(best, r.near);
        mode = 'aim';
        /*
         * Name the failure. This is the whole reason the design was chosen: "I
         * missed, and here is how far, and here is which way" is a sentence you
         * can act on. THERMAL could only ever report three aggregate statistics
         * about a two-minute flight.
         */
        if (r.outcome === 'crash') {
            Audio.event('crash');
            say('Into the planet. Go wider, or slower so it turns sooner.', 'bad');
        } else if (r.outcome === 'lost') {
            Audio.event('miss');
            say('Out of the system — closest approach ' + Math.round(r.near) +
                '. Too fast to be caught.', 'warn');
        } else {
            Audio.event('miss');
            say('Drifted. Closest approach ' + Math.round(r.near) + '.',
                r.near < S.NEAR_MISS ? 'good' : 'warn');
        }
        paintGauges();
    }

    /**
     * One renderer for both a fresh arrival and a day you already played.
     *
     * Splitting them is how the share card went missing: the revisit path used
     * to print a score and hide the share, so once you closed the tab your
     * result was unrecoverable.
     */
    function showResult(stored) {
        const n = stored ? stored.shots : shots;
        const par = stored ? stored.par : level.par;
        const bodies = stored ? stored.bodies : level.planets.length;
        const glyphs = stored ? S.cellsFromDay(stored) : codes.map(S.glyphForCode);
        byId('card-title').textContent = S.scoreEmoji(n, par) + ' ' + S.scoreLabel(n, par);
        byId('card-line').textContent = n + (n === 1 ? ' shot' : ' shots') + ' · par ' + par +
            (stored ? ' · already played today' : (scored ? '' : ' · not scored'));
        if (scored) {
            byId('card-share').textContent = S.buildShare({
                day: day, shots: n, par: par, bodies: bodies,
                cells: glyphs, streak: saved.streak
            });
            byId('card-share').hidden = false;
            byId('share').hidden = false;
        } else {
            byId('card-share').hidden = true;
            byId('share').hidden = true;
        }
        byId('free').hidden = false;
        byId('launch').hidden = true;
        byId('card').hidden = false;
        paintGauges();
    }

    function showPreflight() {
        mode = 'preflight';
        const prev = scored ? saved.days[String(day)] : null;
        if (prev) {
            // Already played today. Show the whole result, share included, so
            // you can still copy it hours later.
            shots = prev.shots;
            showResult(prev);
            return;
        }
        byId('card-title').textContent = 'Launch #' + day;
        byId('card-line').textContent = level.planets.length +
            (level.planets.length === 1 ? ' body' : ' bodies') + ' · par ' + level.par +
            (scored ? '' : ' · free play');
        byId('launch').hidden = false;
        byId('free').hidden = true;
        byId('share').hidden = true;
        byId('card-share').hidden = true;
        byId('card').hidden = false;
    }

    function start() {
        byId('card').hidden = true;
        mode = 'aim';
        Audio.arm(saved.settings.sound);
        say('Drag from the pad to aim, then let go. Watch what the planets do to it.', '');
    }

    // ------------------------------------------------------------------
    // HUD
    // ------------------------------------------------------------------

    function paintHud() {
        byId('puzzle-no').textContent = '#' + day;
        byId('mode-label').textContent = scored ? "today's launch" : 'free play';
        byId('b-bodies').textContent = '🪐 ' + level.planets.length +
            (level.planets.length === 1 ? ' body' : ' bodies');
        byId('b-streak').textContent = '🔥 ' + saved.streak;
    }

    function paintGauges() {
        byId('g-shots').textContent = shots;
        byId('g-par').textContent = 'par ' + (level ? level.par : '—');
        byId('g-shots').className = 'g-v' + (level && shots > level.par ? ' warn' : '');
        byId('g-near').textContent = best === Infinity ? '—' : Math.round(best);
        byId('g-near').className = 'g-v' +
            (best === Infinity ? '' : best < S.NEAR_MISS ? ' good' : best < 70 ? ' warn' : '');
        byId('g-speed').textContent = Math.round(aim.v);
        const pw = (aim.v - S.SIM.V_MIN) / (S.SIM.V_MAX - S.SIM.V_MIN);
        byId('pow-fill').style.width = Math.round(pw * 100) + '%';
    }

    function tickCountdown() {
        const ms = S.msUntilNextPuzzle(new Date());
        const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60;
        byId('next-in').textContent = h + 'h ' + m + 'm';
    }

    // ------------------------------------------------------------------
    // Draw
    // ------------------------------------------------------------------

    function draw() {
        if (!W) fit();
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#04070f';
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            ctx.fillStyle = 'rgba(200,220,255,' + (s.b * 0.5).toFixed(2) + ')';
            ctx.fillRect(s.x * W, s.y * H, 1.4, 1.4);
        }
        if (!level) return;

        // Bodies, each with a falloff halo so the pull is legible before you fly
        // through it. The halo is the only cue that a big body pulls harder.
        for (let i = 0; i < level.planets.length; i++) {
            const p = level.planets[i];
            const g = ctx.createRadialGradient(X(p.x), Y(p.y), p.r * k, X(p.x), Y(p.y), p.r * k * 4.2);
            g.addColorStop(0, 'rgba(120,160,255,.20)');
            g.addColorStop(1, 'rgba(120,160,255,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r * k * 4.2, 0, 6.283); ctx.fill();
            ctx.fillStyle = '#4b5a75';
            ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r * k, 0, 6.283); ctx.fill();
            ctx.strokeStyle = 'rgba(160,190,255,.5)'; ctx.lineWidth = 1.5; ctx.stroke();
        }

        /*
         * Ghosts of earlier attempts. This is the error gradient made visible,
         * and it is what makes the game learnable rather than guessy: you can
         * see the last path and where it went wrong, not just a number.
         */
        for (let i = 0; i < ghosts.length; i++) {
            const g = ghosts[i];
            const a = 0.10 + 0.18 * (i / Math.max(1, ghosts.length - 1));
            ctx.strokeStyle = (g.outcome === 'crash' ? 'rgba(255,59,87,' : 'rgba(159,182,200,') +
                a.toFixed(3) + ')';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            for (let j = 0; j + 1 < g.path.length; j += 2) {
                if (j === 0) ctx.moveTo(X(g.path[0]), Y(g.path[1]));
                else ctx.lineTo(X(g.path[j]), Y(g.path[j + 1]));
            }
            ctx.stroke();
        }

        // Beacon.
        const t = level.target;
        const pulse = reduceMotion ? 1 : 1 + 0.12 * Math.sin(Date.now() / 320);
        ctx.strokeStyle = 'rgba(109,255,74,.85)'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(X(t.x), Y(t.y), t.r * k * pulse, 0, 6.283); ctx.stroke();
        ctx.strokeStyle = 'rgba(109,255,74,.28)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(X(t.x), Y(t.y), t.r * k * 1.7 * pulse, 0, 6.283); ctx.stroke();
        ctx.fillStyle = 'rgba(109,255,74,.9)';
        ctx.beginPath(); ctx.arc(X(t.x), Y(t.y), 3, 0, 6.283); ctx.fill();

        // Launch pad.
        const L = level.launch;
        ctx.fillStyle = '#00eaff';
        ctx.beginPath(); ctx.arc(X(L.x), Y(L.y), 5, 0, 6.283); ctx.fill();
        ctx.strokeStyle = 'rgba(0,234,255,.35)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(X(L.x), Y(L.y), 10, 0, 6.283); ctx.stroke();

        /*
         * The aim: direction, and a SHORT look at the opening arc.
         *
         * Deliberately short. ONE PUTT previews most of a putt because a putt is
         * predictable; here the whole product is not knowing what the gravity
         * will do, so previewing the full path would hand over the answer.
         */
        if (mode === 'aim') {
            const pk = S.fly(level, Math.cos(aim.a), Math.sin(aim.a), aim.v, { path: true });
            const pw = (aim.v - S.SIM.V_MIN) / (S.SIM.V_MAX - S.SIM.V_MIN);
            const n = Math.min(pk.path.length, Math.round(2 * 22 * (0.45 + 0.55 * pw)));
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'rgba(0,234,255,.75)'; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let j = 0; j + 1 < n; j += 2) {
                if (j === 0) ctx.moveTo(X(pk.path[0]), Y(pk.path[1]));
                else ctx.lineTo(X(pk.path[j]), Y(pk.path[j + 1]));
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // The probe, in flight and after arrival.
        if (probe && (mode === 'flying' || mode === 'done')) {
            const p = probe.path;
            if (p.length >= 2) {
                const e = clamp(probe.i, 0, p.length - 2);
                ctx.strokeStyle = 'rgba(0,234,255,.9)'; ctx.lineWidth = 2;
                ctx.beginPath();
                for (let j = 0; j <= e; j += 2) {
                    if (j === 0) ctx.moveTo(X(p[0]), Y(p[1]));
                    else ctx.lineTo(X(p[j]), Y(p[j + 1]));
                }
                ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(X(p[e]), Y(p[e + 1]), 3.5, 0, 6.283); ctx.fill();
            }
        }
    }

    // ------------------------------------------------------------------
    // Loop
    // ------------------------------------------------------------------

    let lastFrame = 0;
    function frame(now) {
        const dtMs = Math.min(now - lastFrame, 100);
        lastFrame = now;
        if (mode === 'flying' && probe) {
            // Replay the precomputed path. Reduced motion skips straight to the
            // end rather than removing the result.
            probe.i += reduceMotion ? probe.path.length : Math.round(dtMs / 1000 * 44) * 2;
            if (probe.i >= probe.path.length - 2) {
                probe.i = Math.max(0, probe.path.length - 2);
                land();
            } else {
                Audio.flying(probe.i / Math.max(1, probe.path.length));
            }
        }
        draw();
        window.requestAnimationFrame(frame);
    }

    // ------------------------------------------------------------------
    // Input
    // ------------------------------------------------------------------

    let dragging = false;
    function aimFromPointer(e) {
        const r = stage.getBoundingClientRect();
        const w = toWorld(e.clientX - r.left, e.clientY - r.top);
        const dx = w[0] - level.launch.x, dy = w[1] - level.launch.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1) return;
        aim.a = Math.atan2(dy, dx);
        aim.v = S.SIM.V_MIN + (S.SIM.V_MAX - S.SIM.V_MIN) * clamp(d / 130, 0, 1);
        paintGauges();
    }

    stage.addEventListener('pointerdown', function (e) {
        if (mode !== 'aim') return;
        dragging = true;
        stage.setPointerCapture(e.pointerId);
        aimFromPointer(e);
    });
    stage.addEventListener('pointermove', function (e) { if (dragging) aimFromPointer(e); });
    stage.addEventListener('pointerup', function () {
        if (!dragging) return;
        dragging = false;
        fire();
    });
    stage.addEventListener('pointercancel', function () { dragging = false; });

    window.addEventListener('keydown', function (e) {
        if (mode !== 'aim') return;
        const step = (e.shiftKey ? 0.15 : 0.6) * Math.PI / 180;
        if (e.key === 'ArrowLeft') { aim.a -= step; paintGauges(); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { aim.a += step; paintGauges(); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { aim.v = Math.min(S.SIM.V_MAX, aim.v + 2); paintGauges(); e.preventDefault(); }
        else if (e.key === 'ArrowDown') { aim.v = Math.max(S.SIM.V_MIN, aim.v - 2); paintGauges(); e.preventDefault(); }
        else if (e.key === ' ' || e.key === 'Spacebar') { fire(); e.preventDefault(); }
    });

    byId('launch').addEventListener('click', start);
    byId('free').addEventListener('click', function () {
        // Free play never records: a hand-picked level must not become the day's
        // score, the same rule ONE PUTT applies to ?seed=.
        loadLevel(S.seedForDay(day) ^ (Math.floor(Math.random() * 1e9) >>> 0), false);
        byId('card').hidden = true;
        start();
    });
    byId('share').addEventListener('click', function () {
        const text = byId('card-share').textContent;
        const done = function () {
            byId('share').textContent = 'Copied';
            window.setTimeout(function () { byId('share').textContent = 'Copy result'; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, done);
        } else { done(); }
    });

    const soundBtn = byId('sound');
    function paintSound() {
        const on = !!saved.settings.sound;
        soundBtn.textContent = (on ? '🔊' : '🔇') + ' SOUND';
        soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    if (!Audio || !Audio.available()) {
        soundBtn.hidden = true;
    } else {
        soundBtn.addEventListener('click', function () {
            saved.settings.sound = Audio.setEnabled(!saved.settings.sound);
            writeState();
            paintSound();
        });
    }

    window.addEventListener('resize', function () { fit(); });

    // ------------------------------------------------------------------
    // Boot
    // ------------------------------------------------------------------

    function boot() {
        saved = readState();
        const params = new URLSearchParams(window.location.search);
        const forced = params.get('level');
        day = S.puzzleDay(new Date());
        if (forced !== null && /^\d{1,7}$/.test(forced)) {
            loadLevel(S.seedForDay(Number(forced)), false);
        } else {
            loadLevel(S.seedForDay(day), true);
        }
        paintSound();
        fit();
        showPreflight();
        tickCountdown();
        window.setInterval(tickCountdown, 30000);
        lastFrame = window.performance.now();
        window.requestAnimationFrame(frame);
    }

    boot();
})();
