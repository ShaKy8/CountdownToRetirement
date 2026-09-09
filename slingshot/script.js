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

    /*
     * Effects level. `?fx=0` is exactly the game as it was, which is what makes
     * the comparison real rather than nominal; 1 is restrained and the default;
     * 2 is full. Read at module scope so draw() and land() see it without it
     * being threaded through everything.
     */
    const fxLevel = (function () {
        const v = new URLSearchParams(window.location.search).get('fx');
        return v !== null && /^[012]$/.test(v) ? Number(v) : 1;
    })();
    /* A screen kick that reads as punchy on a desktop is horrible in the hand. */
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    const MAX_FX = 120;              // particles alive at once
    const MAX_SCARS = 10;            // per planet, oldest dropped
    const FX_RED = '255,59,87';      // the crash red the ghost trails already use
    const FX_GREY = '159,182,200';
    const FX_GREEN = '109,255,74';

    let W = 0, H = 0, dpr = 1, k = 1, ox = 0, oy = 0;
    let level = null, day = 0, saved = null;
    let shots = 0, best = Infinity, codes = [], ghosts = [], probe = null;
    let aim = { a: 0, v: 60 };
    let mode = 'preflight';       // preflight | aim | flying | done
    let scored = true;            // does this level count for the daily?
    let stars = [];

    /*
     * Impact effects. All of it lives here; orbit.js does not know it exists.
     * Positions are in WORLD units so X()/Y() apply and a resize does not move
     * anything, exactly as the ghost trails work.
     */
    let fx = [];                  // {x,y,vx,vy,life,ttl,r,col} debris
    let rings = [];               // {x,y,r0,r1,life,ttl,col,w} shockwaves
    let scars = [];               // {body,angle,t} a crash leaves a mark
    let halo = [];                // per-body flare 0..1, decays
    let shake = 0;                // screen kick amplitude, px
    let beaconFlare = 0;          // 0..1, driven live by proximity
    let nearQ = 0;                // how close the probe is to the beacon, now

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
    // ------------------------------------------------------------------
    // Impact
    // ------------------------------------------------------------------

    const fxOn = function () { return fxLevel > 0; };
    const fxScale = function () { return fxLevel === 2 ? 1 : 0.6; };

    function addParticle(x, y, vx, vy, ttl, r, col) {
        if (fx.length >= MAX_FX) fx.shift();
        fx.push({ x: x, y: y, vx: vx, vy: vy, life: ttl, ttl: ttl, r: r, col: col });
    }
    function addRing(x, y, r0, r1, ttl, col, w) {
        rings.push({ x: x, y: y, r0: r0, r1: r1, life: ttl, ttl: ttl, col: col, w: w });
    }
    function kick(px) {
        if (reduceMotion || !fxOn()) return;
        shake = Math.max(shake, px * fxScale() * (coarse ? 0.55 : 1));
    }

    /*
     * A crash. The asymmetry is the whole point: the probe is destroyed and the
     * planet shrugs it off. Debris leaves along a cone facing away from the
     * surface, the halo the planet already draws flares and settles, and the
     * mark stays for the rest of the day.
     *
     * The scar is recorded even under reduced motion — it is not motion, and it
     * is the part that teaches.
     */
    function burst(r) {
        const p = level.planets[r.body];
        if (!p) return;
        const ang = Math.atan2(r.y - p.y, r.x - p.x);
        scars.push({ body: r.body, angle: ang, t: 0 });
        let n = 0;
        for (let i = 0; i < scars.length; i++) if (scars[i].body === r.body) n++;
        while (n > MAX_SCARS) {
            for (let i = 0; i < scars.length; i++) {
                if (scars[i].body === r.body) { scars.splice(i, 1); break; }
            }
            n--;
        }
        if (!fxOn() || reduceMotion) return;
        halo[r.body] = 1;
        addRing(r.x, r.y, p.r * 0.35, p.r * (1.8 + 1.6 * fxScale()), 460, FX_RED, 2.2);
        const count = fxLevel === 2 ? 20 : 12;
        for (let i = 0; i < count; i++) {
            const a = ang + (Math.random() - 0.5) * 1.9;
            const sp = p.r * (0.7 + Math.random() * 2.4) * fxScale();
            addParticle(r.x, r.y, Math.cos(a) * sp, Math.sin(a) * sp,
                320 + Math.random() * 280, 0.6 + Math.random() * 1.1, FX_RED);
        }
        kick(9);
    }

    /* Out of the system. It does not bang, it dwindles. */
    function dwindle(r) {
        if (!fxOn() || reduceMotion) return;
        const p = probe.path, n = p.length;
        let vx = 1, vy = 0;
        if (n >= 4) { vx = p[n - 2] - p[n - 4]; vy = p[n - 1] - p[n - 3]; }
        const m = Math.sqrt(vx * vx + vy * vy) || 1;
        for (let i = 0; i < 5; i++) {
            const sp = 16 * (0.5 + i * 0.18) * fxScale();
            addParticle(r.x, r.y, (vx / m) * sp, (vy / m) * sp,
                700 + i * 130, 1.4 - i * 0.2, FX_GREY);
        }
    }

    /* Ran out of time. A sigh, not an event. */
    function sigh(r) {
        if (!fxOn() || reduceMotion) return;
        for (let i = 0; i < 7; i++) {
            const a = Math.random() * 6.283, sp = (2 + Math.random() * 5) * fxScale();
            addParticle(r.x, r.y, Math.cos(a) * sp, Math.sin(a) * sp,
                520 + Math.random() * 280, 0.7 + Math.random() * 0.8, FX_GREY);
        }
    }

    /* Arrival: the beacon blooms. Joy, so a smaller kick than the crash. */
    function bloom() {
        const t = level.target;
        beaconFlare = 1;
        if (!fxOn() || reduceMotion) return;
        for (let i = 0; i < 3; i++) {
            addRing(t.x, t.y, t.r * 0.8, t.r * (3.2 + i * 1.6), 620 + i * 180, FX_GREEN, 2.4 - i * 0.6);
        }
        const count = fxLevel === 2 ? 18 : 10;
        for (let i = 0; i < count; i++) {
            const a = Math.random() * 6.283, sp = t.r * (0.8 + Math.random() * 2.4) * fxScale();
            addParticle(t.x, t.y, Math.cos(a) * sp, Math.sin(a) * sp,
                520 + Math.random() * 320, 0.6 + Math.random() * 1.0, FX_GREEN);
        }
        kick(4);
    }

    function stepFx(dtMs) {
        const dt = dtMs / 1000;
        for (let i = fx.length - 1; i >= 0; i--) {
            const q = fx[i];
            q.life -= dtMs;
            if (q.life <= 0) { fx.splice(i, 1); continue; }
            q.x += q.vx * dt; q.y += q.vy * dt;
            q.vx *= 0.985; q.vy *= 0.985;      // a little drag, so debris settles
        }
        for (let i = rings.length - 1; i >= 0; i--) {
            rings[i].life -= dtMs;
            if (rings[i].life <= 0) rings.splice(i, 1);
        }
        for (let i = 0; i < halo.length; i++) {
            if (halo[i] > 0) halo[i] = Math.max(0, halo[i] - dtMs / 620);
        }
        for (let i = 0; i < scars.length; i++) {
            if (scars[i].t < 1) scars[i].t = Math.min(1, scars[i].t + dtMs / 300);
        }
        if (shake > 0) shake = Math.max(0, shake - dtMs * 0.036);
        if (beaconFlare > nearQ) beaconFlare = Math.max(nearQ, beaconFlare - dtMs / 700);
    }

    function clearFx() {
        fx = []; rings = []; scars = []; halo = [];
        shake = 0; beaconFlare = 0; nearQ = 0;
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
        clearFx();
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
            bloom();
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
            burst(r);
            say('Into the planet. Go wider, or slower so it turns sooner.', 'bad');
        } else if (r.outcome === 'lost') {
            Audio.event('lost');
            dwindle(r);
            say('Out of the system — closest approach ' + Math.round(r.near) +
                '. Too fast to be caught.', 'warn');
        } else {
            Audio.event('miss');
            sigh(r);
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

        /*
         * Everything below shakes together, stars included. The background is
         * filled first in screen space, so a kick can never expose an edge.
         */
        ctx.save();
        if (shake > 0.2) {
            ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        }
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            ctx.fillStyle = 'rgba(200,220,255,' + (s.b * 0.5).toFixed(2) + ')';
            ctx.fillRect(s.x * W, s.y * H, 1.4, 1.4);
        }
        if (!level) { ctx.restore(); return; }

        // Bodies, each with a falloff halo so the pull is legible before you fly
        // through it. The halo is the only cue that a big body pulls harder.
        for (let i = 0; i < level.planets.length; i++) {
            const p = level.planets[i];
            const flare = halo[i] || 0;
            const g = ctx.createRadialGradient(X(p.x), Y(p.y), p.r * k, X(p.x), Y(p.y), p.r * k * 4.2);
            g.addColorStop(0, 'rgba(120,160,255,' + (0.20 + 0.35 * flare).toFixed(3) + ')');
            g.addColorStop(1, 'rgba(120,160,255,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r * k * 4.2, 0, 6.283); ctx.fill();
            ctx.fillStyle = '#4b5a75';
            ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r * k, 0, 6.283); ctx.fill();
            /*
             * Scars. Ghost trails make your misses visible in the space; these
             * make them visible on the thing you hit, and they stay all day.
             */
            for (let sI = 0; sI < scars.length; sI++) {
                const sc = scars[sI];
                if (sc.body !== i) continue;
                const rr = p.r * k;
                ctx.fillStyle = 'rgba(18,24,38,' + (0.6 * sc.t).toFixed(3) + ')';
                ctx.beginPath();
                ctx.arc(X(p.x) + Math.cos(sc.angle) * rr * 0.78,
                    Y(p.y) + Math.sin(sc.angle) * rr * 0.78,
                    Math.max(1.5, rr * 0.19) * sc.t, 0, 6.283);
                ctx.fill();
            }
            ctx.strokeStyle = 'rgba(160,190,255,.5)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r * k, 0, 6.283); ctx.stroke();
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

        // Shockwaves and debris.
        for (let i = 0; i < rings.length; i++) {
            const q = rings[i], u = 1 - q.life / q.ttl;
            ctx.strokeStyle = 'rgba(' + q.col + ',' + (0.55 * (1 - u)).toFixed(3) + ')';
            ctx.lineWidth = q.w;
            ctx.beginPath();
            ctx.arc(X(q.x), Y(q.y), (q.r0 + (q.r1 - q.r0) * u) * k, 0, 6.283);
            ctx.stroke();
        }
        for (let i = 0; i < fx.length; i++) {
            const q = fx[i], a = q.life / q.ttl;
            // fillRect, not arc: this is the only per-frame allocation in the
            // game and it runs on a phone.
            ctx.fillStyle = 'rgba(' + q.col + ',' + (0.85 * a).toFixed(3) + ')';
            const sz = Math.max(1, q.r * k * a);
            ctx.fillRect(X(q.x) - sz / 2, Y(q.y) - sz / 2, sz, sz);
        }

        // Beacon. Its rings answer to how close the probe came.
        const t = level.target;
        const pulse = reduceMotion ? 1 : 1 + 0.12 * Math.sin(Date.now() / 320);
        const fl = beaconFlare;
        ctx.strokeStyle = 'rgba(109,255,74,' + (0.85 + 0.15 * fl).toFixed(3) + ')';
        ctx.lineWidth = 2.5 + 2.5 * fl;
        ctx.beginPath(); ctx.arc(X(t.x), Y(t.y), t.r * k * pulse, 0, 6.283); ctx.stroke();
        ctx.strokeStyle = 'rgba(109,255,74,' + (0.28 + 0.4 * fl).toFixed(3) + ')'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(X(t.x), Y(t.y), t.r * k * 1.7 * pulse, 0, 6.283); ctx.stroke();
        if (fl > 0.02) {
            ctx.strokeStyle = 'rgba(109,255,74,' + (0.45 * fl).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(X(t.x), Y(t.y), t.r * k * (2.2 + 1.8 * fl), 0, 6.283);
            ctx.stroke();
        }
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
        ctx.restore();
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
                nearQ = 0;
                land();
            } else {
                /*
                 * "Ooh, so close" while it is happening. The game already knew
                 * the closest approach, but only reported it afterwards as a
                 * number you had to interpret; this is the same fact, felt.
                 */
                const pth = probe.path, e = clamp(probe.i, 0, pth.length - 2);
                const tg = level.target;
                const dx = pth[e] - tg.x, dy = pth[e + 1] - tg.y;
                nearQ = clamp(1 - Math.sqrt(dx * dx + dy * dy) / (S.NEAR_MISS * 2.5), 0, 1);
                if (nearQ > beaconFlare) beaconFlare = nearQ;
                Audio.flying(probe.i / Math.max(1, probe.path.length), nearQ);
            }
        } else {
            nearQ = 0;
        }
        stepFx(dtMs);
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

    /*
     * Read-only handle for scripts/slingshot-fx-audit.mjs. None of this has a
     * DOM readout, and a leaking particle pool is exactly the sort of thing
     * that degrades a game the longer it is played without ever erroring.
     * Same precedent as window.ATMOS.views in the console.
     */
    window.SLINGSHOT_FX = {
        level: function () { return fxLevel; },
        particles: function () { return fx.length; },
        rings: function () { return rings.length; },
        scars: function () { return scars.length; },
        shake: function () { return shake; },
        near: function () { return nearQ; }
    };

    boot();
})();
