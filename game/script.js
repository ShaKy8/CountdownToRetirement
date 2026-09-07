/**
 * ONE PUTT - canvas, input, weather, storage.
 *
 * All the rules live in putt.js. This file draws them, listens for a drag, and
 * talks to the network. Nothing here decides anything the tests would want to
 * check.
 */
(function () {
    'use strict';

    const P = window.OnePutt;
    const FIELD = P.FIELD;
    const SIM = P.SIM;

    const byId = function (id) { return document.getElementById(id); };
    const canvas = byId('board');
    const ctx = canvas.getContext('2d');

    // ------------------------------------------------------------------
    // Session state
    // ------------------------------------------------------------------

    const params = new URLSearchParams(window.location.search);

    let saved = readState();
    let day = P.puzzleDay(new Date());
    let mode = 'daily';          // daily | daily-done | replay | practice
    let hole = null;
    let ball = null;
    let wind = null;
    let liveWind = null;         // parked until the next hole if it lands late
    let strokes = 0;
    let cells = [];
    let aim = { angle: -Math.PI / 2, power: 0.5 };
    let dragging = false;
    let animating = false;
    let lastFrame = 0;
    let acc = 0;
    let simTime = 0;
    let trail = [];

    const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function readState() {
        let raw = null;
        try { raw = localStorage.getItem(P.STORAGE_KEY); } catch (e) { raw = null; }
        return P.parseState(raw);
    }

    function writeState() {
        // Private mode is not an error condition; a lost streak is survivable.
        try { localStorage.setItem(P.STORAGE_KEY, P.serializeState(saved)); } catch (e) { /* ignore */ }
    }

    // ------------------------------------------------------------------
    // Boot - synchronous, so the game is playable before the network answers
    // ------------------------------------------------------------------

    function startHole(seed, nextMode) {
        hole = P.generateHole(seed);
        ball = P.createBall(hole);
        strokes = 0;
        cells = [];
        trail = [];
        simTime = 0;
        mode = nextMode;
        aim = { angle: -Math.PI / 2, power: 0.5 };
        byId('aim').value = 270;
        byId('power').value = 50;
        if (liveWind && nextMode !== 'daily') { wind = liveWind; }
        syncControls();
        paintHud();
        byId('result').hidden = true;
        setEnabled(true);
        draw();
    }

    function boot() {
        const forcedSeed = params.get('seed');
        const forcedWind = parseWindParam(params.get('wind'));

        const seed = P.seedForDay(day);
        wind = forcedWind || P.syntheticWind(seed);

        if (forcedSeed !== null && /^\d+$/.test(forcedSeed)) {
            // A hand-picked hole must never be recorded as the day's result.
            startHole(Number(forcedSeed) >>> 0, 'practice');
        } else if (Object.prototype.hasOwnProperty.call(saved.days, String(day))) {
            startHole(seed, 'daily-done');
            showResult(saved.days[String(day)], true);
        } else {
            startHole(seed, 'daily');
        }

        if (!forcedWind) fetchWind(seed);
        tickCountdown();
        window.setInterval(tickCountdown, 1000);
    }

    function parseWindParam(v) {
        if (!v) return null;
        const m = /^(\d+(?:\.\d+)?)@(\d+(?:\.\d+)?)$/.exec(v);
        if (!m) return null;
        return P.clampWind({ mph: Number(m[1]), deg: Number(m[2]), gustMph: Number(m[1]), source: 'live' });
    }

    // ------------------------------------------------------------------
    // Weather
    // ------------------------------------------------------------------

    function getJSON(url, ms) {
        const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
        const timer = window.setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
        return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (j) { window.clearTimeout(timer); return j; })
            .catch(function (e) { window.clearTimeout(timer); throw e; });
    }

    /**
     * Geolocation, raced against a timer.
     *
     * An unanswered permission prompt fires NEITHER callback, ever - so without
     * the race, a player who ignores the dialog would leave the wind badge
     * pending for the whole session.
     */
    function locate(cfg) {
        const home = { lat: cfg.home.latitude, lon: cfg.home.longitude };
        if (!cfg.public || !window.isSecureContext || !navigator.geolocation ||
            saved.settings.geo === 'denied') {
            return Promise.resolve(home);
        }
        return new Promise(function (resolve) {
            let settled = false;
            const done = function (v) { if (!settled) { settled = true; resolve(v); } };
            window.setTimeout(function () { done(home); }, 6500);
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    saved.settings.geo = 'set';
                    writeState();
                    done({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                },
                function () {
                    saved.settings.geo = 'denied';
                    writeState();
                    done(home);
                },
                { timeout: 6000, maximumAge: 1800000 }
            );
        });
    }

    function fetchWind(seed) {
        // Absolute path. A relative './api/bundle' from /game/ would resolve to
        // /game/api/bundle, which is not routed to the Lambda - and it would
        // fail quietly into synthetic wind, looking exactly like a slow day.
        const deadline = new Promise(function (_, reject) {
            window.setTimeout(function () { reject(new Error('deadline')); }, 10000);
        });

        const chain = getJSON('/weather/api/config', 3500)
            .then(function (cfg) {
                if (!cfg || !cfg.home) throw new Error('no config');
                return locate(cfg);
            })
            .then(function (loc) {
                return getJSON('/weather/api/bundle?lat=' + encodeURIComponent(loc.lat.toFixed(3)) +
                    '&lon=' + encodeURIComponent(loc.lon.toFixed(3)), 6000);
            })
            .then(function (bundle) {
                const spec = P.extractWind(bundle, new Date());
                if (!spec) return;
                liveWind = spec;
                // Only swap before the first stroke. Changing the wind under a
                // round in progress would make the score meaningless.
                if (strokes === 0) {
                    wind = spec;
                    paintHud();
                    draw();
                }
            });

        Promise.race([chain, deadline]).catch(function () { /* synthetic stands */ });
    }

    // ------------------------------------------------------------------
    // Rendering
    // ------------------------------------------------------------------

    function fitCanvas() {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.width * (FIELD.h / FIELD.w) * dpr);
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
        const s = (rect.width / FIELD.w) * dpr;
        ctx.setTransform(s, 0, 0, s, 0, 0);
    }

    function draw() {
        fitCanvas();
        ctx.clearRect(0, 0, FIELD.w, FIELD.h);

        // green
        ctx.fillStyle = '#0e3323';
        ctx.fillRect(0, 0, FIELD.w, FIELD.h);
        ctx.strokeStyle = 'rgba(109,255,74,0.07)';
        ctx.lineWidth = 0.3;
        for (let y = 8; y < FIELD.h; y += 8) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FIELD.w, y); ctx.stroke();
        }

        (hole.hazards || []).forEach(function (z) {
            ctx.fillStyle = z.kind === 'water' ? 'rgba(0,120,220,0.55)' : 'rgba(255,205,110,0.45)';
            ctx.fillRect(z.x, z.y, z.w, z.h);
        });

        hole.walls.forEach(function (w) {
            ctx.fillStyle = '#1d3a5a';
            ctx.fillRect(w.x, w.y, w.w, w.h);
            ctx.strokeStyle = 'rgba(0,234,255,0.55)';
            ctx.lineWidth = 0.4;
            ctx.strokeRect(w.x, w.y, w.w, w.h);
        });

        // cup
        ctx.fillStyle = '#04121d';
        ctx.beginPath();
        ctx.arc(hole.cup.x, hole.cup.y, SIM.CUP_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00eaff';
        ctx.lineWidth = 0.45;
        ctx.stroke();
        ctx.strokeStyle = '#ff2d8f';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(hole.cup.x, hole.cup.y);
        ctx.lineTo(hole.cup.x, hole.cup.y - 9);
        ctx.lineTo(hole.cup.x + 5.5, hole.cup.y - 7.2);
        ctx.lineTo(hole.cup.x, hole.cup.y - 5.4);
        ctx.stroke();

        if (!reduceMotion && trail.length > 1) {
            ctx.strokeStyle = 'rgba(255,255,255,0.16)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        }

        if (!animating && !ball.sunk && mode !== 'daily-done') drawAim();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, SIM.BALL_R, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawAim() {
        // The preview runs the real stepBall, so it cannot lie about the wind.
        const preview = P.simulateShot(hole, ball, aim, wind, { maxSteps: 90, trace: true });
        ctx.strokeStyle = 'rgba(0,234,255,0.5)';
        ctx.lineWidth = 0.35;
        ctx.setLineDash([1.6, 1.6]);
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        preview.marks.forEach(function (m) { ctx.lineTo(m.x, m.y); });
        ctx.stroke();
        ctx.setLineDash([]);

        const len = 6 + aim.power * 14;
        ctx.strokeStyle = '#ffb02e';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x + Math.cos(aim.angle) * len, ball.y + Math.sin(aim.angle) * len);
        ctx.stroke();
    }

    // ------------------------------------------------------------------
    // Loop
    // ------------------------------------------------------------------

    function frame(now) {
        if (!animating) return;
        // A tab restored after five minutes would otherwise run 36,000 steps in
        // one frame and teleport the ball through the level.
        acc += Math.min(now - lastFrame, 100);
        lastFrame = now;

        const stepMs = SIM.DT * 1000;
        let event = 'moving';
        while (acc >= stepMs && event === 'moving') {
            const r = P.stepBall(hole, ball, wind, simTime, SIM.DT);
            ball = r.ball;
            simTime += SIM.DT;
            acc -= stepMs;
            event = r.event;
            if (r.bounces > 0 && cells[cells.length - 1] === 'green') cells[cells.length - 1] = 'wall';
            if (!reduceMotion) {
                trail.push({ x: ball.x, y: ball.y });
                if (trail.length > 220) trail.shift();
            }
        }

        draw();

        if (event === 'moving') {
            window.requestAnimationFrame(frame);
            return;
        }
        // Ball at rest: stop burning a core while the player thinks.
        animating = false;
        settle(event);
    }

    function settle(event) {
        const surface = P.surfaceAt(hole, ball.x, ball.y);
        if (event === 'water') {
            strokes += 1;                       // penalty stroke
            cells[cells.length - 1] = 'water';
            cells.push('green');
            say('In the water. Penalty stroke, playing again from where you were.');
        } else if (event === 'sunk') {
            cells[cells.length - 1] = 'sunk';
            finish();
            return;
        } else if (surface === 'sand') {
            cells[cells.length - 1] = 'sand';
        }
        if (event !== 'water') {
            const away = Math.round(Math.hypot(ball.x - hole.cup.x, ball.y - hole.cup.y));
            say('Stroke ' + strokes + '. ' + (surface === 'sand' ? 'In the sand, ' : '') + away + ' from the cup.');
        }
        // Water pushed an extra cell on; keep the count honest either way.
        if (event === 'water') cells.pop();
        paintHud();
        setEnabled(true);
        draw();
    }

    function finish() {
        const result = {
            day: day,
            strokes: strokes,
            par: hole.par,
            cells: cells.slice(),
            windMph: Math.round(wind.mph),
            windDeg: Math.round(wind.deg),
            source: wind.source,
            streak: saved.streak
        };
        if (mode === 'daily') {
            saved = P.recordDaily(saved, day, {
                strokes: strokes, par: hole.par,
                windMph: result.windMph, windDeg: result.windDeg, source: wind.source
            });
            writeState();
            result.streak = saved.streak;
            mode = 'daily-done';
        }
        paintHud();
        say('In the hole. ' + P.scoreLabel(strokes, hole.par) + ', ' + strokes +
            (strokes === 1 ? ' stroke.' : ' strokes.'));
        showResult(result, false);
        draw();
    }

    function showResult(stored, fromStorage) {
        const strokeCount = stored.strokes;
        const par = stored.par;
        byId('result-score').textContent =
            P.scoreEmoji(strokeCount, par) + ' ' + P.scoreLabel(strokeCount, par);
        byId('result-line').textContent = strokeCount + (strokeCount === 1 ? ' stroke' : ' strokes') +
            ' · par ' + par + (fromStorage ? ' · already played today' : '');
        const share = P.buildShare({
            day: day,
            strokes: strokeCount,
            par: par,
            cells: stored.cells || new Array(strokeCount).fill('green'),
            windMph: stored.windMph,
            windDeg: stored.windDeg,
            streak: saved.streak
        });
        byId('result-share').textContent = share;
        byId('result').hidden = false;
        setEnabled(false);
    }

    // ------------------------------------------------------------------
    // HUD
    // ------------------------------------------------------------------

    function paintHud() {
        byId('puzzle-no').textContent = '#' + day;
        byId('par-label').textContent = 'par ' + hole.par;
        byId('mode-label').textContent =
            mode === 'practice' ? 'practice hole' :
                (mode === 'replay' ? 'replay' : "today's hole");
        byId('stroke-count').textContent = String(strokes);
        byId('streak-value').textContent = String(saved.streak);
        byId('wind-value').textContent = P.formatWind(wind);
        const src = byId('wind-source');
        src.textContent = wind.source === 'live' ? 'LIVE' : 'SIM';
        src.className = 'chip-src' + (wind.source === 'live' ? ' live' : '');
    }

    function tickCountdown() {
        const ms = P.msUntilNextPuzzle(new Date());
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        byId('next-in').textContent =
            String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function say(msg) { byId('say').textContent = msg; }

    function setEnabled(on) {
        byId('putt').disabled = !on;
        byId('aim').disabled = !on;
        byId('power').disabled = !on;
    }

    function syncControls() {
        let deg = Math.round(aim.angle * 180 / Math.PI);
        deg = ((deg % 360) + 360) % 360;
        byId('aim').value = String(deg);
        byId('power').value = String(Math.round(aim.power * 100));
        byId('aim-out').textContent = deg + '°';
        byId('power-out').textContent = Math.round(aim.power * 100) + '%';
    }

    // ------------------------------------------------------------------
    // Input
    // ------------------------------------------------------------------

    function toField(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * FIELD.w,
            y: ((e.clientY - rect.top) / rect.height) * FIELD.h
        };
    }

    canvas.addEventListener('pointerdown', function (e) {
        if (animating || byId('putt').disabled) return;
        dragging = true;
        canvas.setPointerCapture(e.pointerId);
        updateAimFromPointer(e);
    });

    canvas.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        updateAimFromPointer(e);
    });

    canvas.addEventListener('pointerup', function (e) {
        if (!dragging) return;
        dragging = false;
        canvas.releasePointerCapture(e.pointerId);
        putt();
    });

    canvas.addEventListener('pointercancel', function () { dragging = false; draw(); });

    function updateAimFromPointer(e) {
        const p = toField(e);
        // Slingshot: pull back from the ball, the shot goes the other way.
        const dx = ball.x - p.x, dy = ball.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.5) return;
        aim.angle = Math.atan2(dy, dx);
        aim.power = Math.max(0.05, Math.min(1, d / 42));
        syncControls();
        draw();
    }

    canvas.addEventListener('keydown', function (e) {
        if (byId('putt').disabled) return;
        const fine = e.shiftKey ? 0.5 : 2;
        if (e.key === 'ArrowLeft') { aim.angle -= fine * Math.PI / 180; }
        else if (e.key === 'ArrowRight') { aim.angle += fine * Math.PI / 180; }
        else if (e.key === 'ArrowUp') { aim.power = Math.min(1, aim.power + 0.04); }
        else if (e.key === 'ArrowDown') { aim.power = Math.max(0.05, aim.power - 0.04); }
        else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); putt(); return; }
        else return;
        e.preventDefault();
        syncControls();
        draw();
    });

    byId('aim').addEventListener('input', function (e) {
        aim.angle = Number(e.target.value) * Math.PI / 180;
        syncControls();
        draw();
    });

    byId('power').addEventListener('input', function (e) {
        aim.power = Number(e.target.value) / 100;
        syncControls();
        draw();
    });

    byId('putt').addEventListener('click', putt);

    byId('replay').addEventListener('click', function () {
        startHole(P.seedForDay(day), 'replay');
        say('Replaying today’s hole. This one is not scored.');
    });

    byId('random').addEventListener('click', function () {
        startHole((Math.random() * 0xffffffff) >>> 0, 'practice');
        say('A random hole, just for the practice.');
    });

    byId('share').addEventListener('click', function () {
        const text = byId('result-share').textContent;
        const done = function () { byId('share').textContent = 'Copied'; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, fallbackCopy);
        } else {
            fallbackCopy();
        }
        function fallbackCopy() {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); done(); } catch (err) { /* nothing to do */ }
            document.body.removeChild(ta);
        }
    });

    function putt() {
        if (animating || ball.sunk || byId('putt').disabled) return;
        const v = P.aimToVelocity(aim);
        ball = {
            x: ball.x, y: ball.y, vx: v.vx, vy: v.vy,
            resting: false, sunk: false, overCup: false,
            strokeOrigin: { x: ball.x, y: ball.y }
        };
        strokes += 1;
        cells.push('green');
        trail = [];
        animating = true;
        setEnabled(false);
        paintHud();
        lastFrame = window.performance.now();
        acc = 0;
        window.requestAnimationFrame(frame);
    }

    // A tab left in the background accumulates no simulation debt.
    document.addEventListener('visibilitychange', function () {
        lastFrame = window.performance.now();
        acc = 0;
    });

    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(function () { draw(); }).observe(canvas);
    } else {
        window.addEventListener('resize', draw);
    }

    boot();
})();
