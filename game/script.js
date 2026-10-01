/**
 * ONE PUTT - canvas, input, weather, storage, and the feel.
 *
 * All the rules live in putt.js. This file draws them, listens for a drag, and
 * talks to the network. Nothing here decides anything the tests would want to
 * check - and nothing here changes a physics step. Every effect below is read
 * off events the loop already produces (stepBall's event, bounces, overCup):
 * the putter's windup delays the first step, slow motion at the cup changes
 * how many steps a frame consumes, and the drop plays after the sink has
 * already happened. ?fx=0 is the game exactly as it was, 1 the default, 2
 * full; everything degrades under prefers-reduced-motion.
 */
(function () {
    'use strict';

    const P = window.OnePutt;
    const Audio = window.OnePuttAudio || null;
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
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    // ?fx=0 is the game as it was; 1 the default; 2 everything.
    const fxLevel = (function () {
        const v = params.get('fx');
        if (v === '0') return 0;
        if (v === '2') return 2;
        return 1;
    })();
    const fxOn = function () { return fxLevel > 0; };
    const fxScale = function () { return fxLevel === 2 ? 1 : 0.6; };
    const motion = function () { return fxOn() && !reduceMotion; };

    // The feel. None of it is rules; all of it is read off the roll.
    const MAX_FX = 120;
    const MAX_RINGS = 16;
    const WINDUP_MS = 140;       // the putter's sweep before the first step
    const DROP_MS = 280;         // the ball going in
    const SPLASH_MS = 400;       // fading out of the water, in at the origin
    const RESULT_DELAY_MS = 900; // so the drop is seen before the card
    const SLOW_RADIUS = 10;      // units from the cup where time dilates
    const SLOW_RATE = 0.4;
    let fx = [];                 // {x,y,vx,vy,age,life,size,color}
    let rings = [];              // {x,y,r,vr,age,life,width,color}
    let shake = 0;               // screen kick amplitude, px
    let windup = 0;              // ms of blade sweep left
    let drop = null;             // {t} 0..1 while the ball goes in
    let splash = null;           // {x,y,t} while the ball fades back from water
    let wallFlash = null;        // {wall,t}
    let flagQuiver = 0;          // 1..0 after a drop
    let near = 0;                // 0..1 how close the ball is to the cup, this frame
    let rate = 1;                // 1, or SLOW_RATE at the cup
    let lipped = false;          // this stroke touched the cup and stayed out
    let wasOver = false;
    let ghosts = [];             // earlier strokes: {points,end}
    let lineShow = null;         // {marks,i,done,since} the revealed ace line
    let resultTimer = null;
    let sandTex = null;          // the speckle, drawn once per hole
    let streaks = [];            // the wind, drifting across the green
    let idleHandle = 0;
    let idleLast = 0;
    let idleT = 0;
    let idleFrames = 0;
    let lastEvent = null;

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
        ghosts = [];
        simTime = 0;
        mode = nextMode;
        aim = { angle: -Math.PI / 2, power: 0.5 };
        if (liveWind && nextMode !== 'daily') { wind = liveWind; }
        fx = []; rings = []; shake = 0; windup = 0; drop = null; splash = null;
        wallFlash = null; flagQuiver = 0; near = 0; rate = 1; lipped = false; wasOver = false;
        lineShow = null;
        if (resultTimer) { window.clearTimeout(resultTimer); resultTimer = null; }
        sandTex = buildSandTexture(hole, seed);
        streaks = buildStreaks(seed);
        syncControls();
        paintHud();
        byId('result').hidden = true;
        byId('line').disabled = true;
        setEnabled(true);
        draw();
        ensureIdle();
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
            // The chip says what you shot, not the 0 it shipped with.
            strokes = saved.days[String(day)].strokes;
            paintHud();
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
    // The wind, as something you can see
    // ------------------------------------------------------------------

    // Downwind: the direction windVector pushes. deg is where it blows FROM.
    function windDir() {
        const radTo = (((wind && wind.deg) || 0) + 180) * Math.PI / 180;
        return { x: Math.sin(radTo), y: -Math.cos(radTo) };
    }

    function windStrength() {
        return Math.min(1, ((wind && wind.mph) || 0) / 25);
    }

    function buildStreaks(seed) {
        const rng = P.makeRng((seed ^ 0x57ee) >>> 0);
        const out = [];
        for (let i = 0; i < 12; i++) {
            out.push({ x: rng() * FIELD.w, y: rng() * FIELD.h, phase: rng() * Math.PI * 2 });
        }
        return out;
    }

    function moveStreaks(dtMs) {
        const d = windDir();
        const mph = (wind && wind.mph) || 0;
        const v = (4 + mph * 0.9) * dtMs / 1000;
        for (let i = 0; i < streaks.length; i++) {
            const s = streaks[i];
            s.x += d.x * v;
            s.y += d.y * v;
            if (s.x < -6) s.x += FIELD.w + 12;
            if (s.x > FIELD.w + 6) s.x -= FIELD.w + 12;
            if (s.y < -6) s.y += FIELD.h + 12;
            if (s.y > FIELD.h + 6) s.y -= FIELD.h + 12;
        }
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

    /**
     * Sand is speckled, once per hole, from the hole's own seed - so it is the
     * same texture for everyone and costs nothing per frame.
     */
    function buildSandTexture(h, seed) {
        const sand = (h.hazards || []).filter(function (z) { return z.kind === 'sand'; });
        if (!sand.length || typeof document.createElement !== 'function') return null;
        const scale = 4;
        const off = document.createElement('canvas');
        off.width = FIELD.w * scale;
        off.height = FIELD.h * scale;
        const c = off.getContext('2d');
        if (!c) return null;
        const rng = P.makeRng((seed ^ 0x5a4d) >>> 0);
        sand.forEach(function (z) {
            const n = Math.round(z.w * z.h * 0.35);
            for (let i = 0; i < n; i++) {
                const x = z.x + rng() * z.w, y = z.y + rng() * z.h;
                c.fillStyle = rng() < 0.5 ? 'rgba(255,230,170,0.35)' : 'rgba(120,90,40,0.35)';
                c.fillRect(x * scale, y * scale, scale * 0.6, scale * 0.6);
            }
        });
        return off;
    }

    function draw() {
        fitCanvas();
        ctx.save();
        ctx.clearRect(0, 0, FIELD.w, FIELD.h);
        if (shake > 0.2) {
            ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        }

        // The green: mown bands, not stripe lines.
        ctx.fillStyle = '#0e3323';
        ctx.fillRect(0, 0, FIELD.w, FIELD.h);
        ctx.fillStyle = '#10382a';
        for (let y = 0; y < FIELD.h; y += 16) ctx.fillRect(0, y, FIELD.w, 8);

        (hole.hazards || []).forEach(function (z) {
            if (z.kind === 'water') {
                const g = ctx.createLinearGradient(z.x, z.y, z.x, z.y + z.h);
                g.addColorStop(0, 'rgba(0,140,240,0.6)');
                g.addColorStop(1, 'rgba(0,90,200,0.55)');
                ctx.fillStyle = g;
            } else {
                ctx.fillStyle = 'rgba(255,205,110,0.45)';
            }
            ctx.fillRect(z.x, z.y, z.w, z.h);
        });
        if (sandTex) ctx.drawImage(sandTex, 0, 0, FIELD.w, FIELD.h);

        hole.walls.forEach(function (w) {
            ctx.fillStyle = '#1d3a5a';
            ctx.fillRect(w.x, w.y, w.w, w.h);
            const hot = wallFlash && wallFlash.wall === w ? wallFlash.t : 0;
            ctx.strokeStyle = 'rgba(63,208,216,' + (0.55 + 0.45 * hot).toFixed(3) + ')';
            ctx.lineWidth = 0.4 + 0.5 * hot;
            ctx.strokeRect(w.x, w.y, w.w, w.h);
        });

        // A soft vignette, so the green has a middle.
        const vg = ctx.createRadialGradient(FIELD.w / 2, FIELD.h / 2, FIELD.h * 0.25, FIELD.w / 2, FIELD.h / 2, FIELD.h * 0.72);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.32)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, FIELD.w, FIELD.h);

        if (motion()) drawStreaks();
        drawGhosts();
        drawTrail();
        drawCup();
        drawFlag();
        drawLine();

        if (!animating && !ball.sunk && mode !== 'daily-done' && !lineShow) drawAim();

        drawBall();
        drawBlade();
        drawFx();
        ctx.restore();
    }

    function drawStreaks() {
        const d = windDir();
        const k = windStrength();
        if (k <= 0) return;
        const len = 3 + 12 * k;
        ctx.strokeStyle = 'rgba(200,255,220,' + (0.05 + 0.07 * k).toFixed(3) + ')';
        ctx.lineWidth = 0.35;
        ctx.beginPath();
        for (let i = 0; i < streaks.length; i++) {
            const s = streaks[i];
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - d.x * len, s.y - d.y * len);
        }
        ctx.stroke();
    }

    function drawGhosts() {
        if (reduceMotion) return;
        for (let g = 0; g < ghosts.length; g++) {
            const gh = ghosts[g];
            if (gh.points.length < 2) continue;
            ctx.strokeStyle = gh.end === 'water' ? 'rgba(80,170,255,0.2)'
                : (gh.end === 'sand' ? 'rgba(255,205,110,0.16)' : 'rgba(255,255,255,0.1)');
            ctx.lineWidth = 0.45;
            ctx.beginPath();
            ctx.moveTo(gh.points[0].x, gh.points[0].y);
            for (let i = 1; i < gh.points.length; i++) ctx.lineTo(gh.points[i].x, gh.points[i].y);
            ctx.stroke();
        }
    }

    function drawTrail() {
        if (reduceMotion || trail.length < 2) return;
        // Fading along its length, so the recent path reads over the old.
        const n = trail.length;
        ctx.lineWidth = 0.5;
        for (let i = 1; i < n; i++) {
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.03 + 0.2 * (i / n)).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
            ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        }
    }

    function drawCup() {
        const cx = hole.cup.x, cy = hole.cup.y;
        if (near > 0 && motion()) {
            const g = ctx.createRadialGradient(cx, cy, SIM.CUP_R * 0.5, cx, cy, SIM.CUP_R * 3.2);
            g.addColorStop(0, 'rgba(63,208,216,' + (0.35 * near).toFixed(3) + ')');
            g.addColorStop(1, 'rgba(63,208,216,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cx, cy, SIM.CUP_R * 3.2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#0f1826';
        ctx.beginPath();
        ctx.arc(cx, cy, SIM.CUP_R, 0, Math.PI * 2);
        ctx.fill();
        // The lip: a lighter rim over a dark well.
        ctx.strokeStyle = 'rgba(63,208,216,' + (0.85 + 0.15 * near).toFixed(3) + ')';
        ctx.lineWidth = 0.45 + 0.55 * near;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, SIM.CUP_R - 0.5, 0, Math.PI * 2);
        ctx.stroke();
    }

    function drawFlag() {
        const cx = hole.cup.x, cy = hole.cup.y;
        const q = flagQuiver;
        const topX = cx + (q > 0 ? Math.sin(q * 26) * q * 1.4 : 0);
        const topY = cy - 9;
        ctx.strokeStyle = '#f07aa6';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(topX, topY);
        ctx.stroke();

        // The pennant points downwind, longer in more wind, and flaps.
        const d = windDir();
        const k = windStrength();
        const len = 3.5 + 2.5 * k;
        let flap = 0;
        if (motion()) {
            const period = 420 - 260 * k;
            flap = Math.sin(idleT / period * Math.PI * 2) * (0.35 + 1.0 * k);
        }
        const px = -d.y, py = d.x;   // perpendicular
        const tipX = topX + d.x * len + px * flap;
        const tipY = topY + d.y * len + py * flap;
        ctx.fillStyle = '#f07aa6';
        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(topX + px * 0.2 - d.x * 0.2, topY + py * 0.2 - d.y * 0.2 + 2.4);
        ctx.closePath();
        ctx.fill();
    }

    function drawLine() {
        if (!lineShow || !lineShow.marks.length) return;
        const m = lineShow.marks;
        const upto = Math.min(m.length, Math.max(1, lineShow.i));
        ctx.strokeStyle = 'rgba(255,215,90,0.85)';
        ctx.lineWidth = 0.55;
        ctx.setLineDash([1.2, 1.2]);
        ctx.beginPath();
        ctx.moveTo(hole.tee.x, hole.tee.y);
        for (let i = 0; i < upto; i++) ctx.lineTo(m[i].x, m[i].y);
        ctx.stroke();
        ctx.setLineDash([]);
        if (upto < m.length) {
            // The ghost ball, on its way.
            ctx.fillStyle = 'rgba(255,215,90,0.9)';
            ctx.beginPath();
            ctx.arc(m[upto - 1].x, m[upto - 1].y, SIM.BALL_R, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawAim() {
        // The preview runs the real stepBall, so it cannot lie about the wind -
        // and it starts at the roll's own gust phase, not at zero.
        const preview = P.simulateShot(hole, ball, aim, wind, { maxSteps: 90, trace: true, t0: simTime });
        ctx.strokeStyle = 'rgba(63,208,216,0.5)';
        ctx.lineWidth = 0.35;
        ctx.setLineDash([1.6, 1.6]);
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        preview.marks.forEach(function (m) { ctx.lineTo(m.x, m.y); });
        ctx.stroke();
        ctx.setLineDash([]);

        const len = 6 + aim.power * 14;
        ctx.strokeStyle = '#f2b45a';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x + Math.cos(aim.angle) * len, ball.y + Math.sin(aim.angle) * len);
        ctx.stroke();
    }

    function drawBall() {
        if (splash) {
            // Fading back in at the stroke origin, where the rules put it.
            ctx.fillStyle = 'rgba(255,255,255,' + splash.t.toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, SIM.BALL_R, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        if (ball.sunk) {
            // Going in: smaller and darker, then gone.
            const t = drop ? drop.t : 1;
            if (t >= 1) return;
            const r = SIM.BALL_R * (1 - 0.9 * t);
            const v = Math.round(255 * (1 - 0.8 * t));
            ctx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(ball.x + 0.45, ball.y + 0.6, SIM.BALL_R * 1.05, SIM.BALL_R * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, SIM.BALL_R, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawBlade() {
        if (windup <= 0) return;
        // Back to front through the ball over the windup: behind it at the
        // start, at the ball as the first step lands.
        const p = 1 - windup / WINDUP_MS;
        const back = 5 * (1 - p) * (1 - p);
        const dx = Math.cos(aim.angle), dy = Math.sin(aim.angle);
        const bx = ball.x - dx * (back + 0.6), by = ball.y - dy * (back + 0.6);
        ctx.strokeStyle = 'rgba(242,180,90,0.9)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(bx - dy * 1.7, by + dx * 1.7);
        ctx.lineTo(bx + dy * 1.7, by - dx * 1.7);
        ctx.stroke();
    }

    function drawFx() {
        for (let i = 0; i < rings.length; i++) {
            const r = rings[i];
            const a = 1 - r.age / r.life;
            ctx.strokeStyle = 'rgba(' + r.color + ',' + (0.7 * a).toFixed(3) + ')';
            ctx.lineWidth = r.width;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
            ctx.stroke();
        }
        for (let i = 0; i < fx.length; i++) {
            const p = fx[i];
            const a = 1 - p.age / p.life;
            ctx.fillStyle = 'rgba(' + p.color + ',' + a.toFixed(3) + ')';
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
    }

    // ------------------------------------------------------------------
    // Effects: spawned off events, decayed by the frame
    // ------------------------------------------------------------------

    function kick(px) {
        if (!motion()) return;
        shake = Math.max(shake, px * fxScale() * (coarse ? 0.55 : 1));
    }

    function burst(x, y, count, o) {
        if (!motion()) return;
        const n = Math.round(count * fxScale());
        for (let i = 0; i < n && fx.length < MAX_FX; i++) {
            const ang = o.dir !== undefined ? o.dir + (Math.random() - 0.5) * (o.spread || 1.2)
                : Math.random() * Math.PI * 2;
            const sp = (o.speed || 20) * (0.4 + Math.random() * 0.8);
            fx.push({
                x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
                age: 0, life: (o.life || 420) * (0.6 + Math.random() * 0.6),
                size: o.size || 0.7, color: o.colors[i % o.colors.length]
            });
        }
    }

    function ring(x, y, o) {
        if (!motion()) return;
        if (rings.length >= MAX_RINGS) rings.shift();
        rings.push({ x: x, y: y, r: o.r || 1, vr: o.vr || 12, age: 0, life: o.life || 500,
            width: o.width || 0.4, color: o.color || '63,208,216' });
    }

    function updateFx(dtMs) {
        for (let i = fx.length - 1; i >= 0; i--) {
            const p = fx[i];
            p.age += dtMs;
            if (p.age >= p.life) { fx.splice(i, 1); continue; }
            const k = dtMs / 1000;
            p.x += p.vx * k;
            p.y += p.vy * k;
            p.vx *= (1 - 2.5 * k);
            p.vy *= (1 - 2.5 * k);
        }
        for (let i = rings.length - 1; i >= 0; i--) {
            const r = rings[i];
            r.age += dtMs;
            if (r.age >= r.life) { rings.splice(i, 1); continue; }
            r.r += r.vr * dtMs / 1000;
        }
        if (wallFlash) {
            wallFlash.t = Math.max(0, wallFlash.t - dtMs / 220);
            if (wallFlash.t <= 0) wallFlash = null;
        }
        if (flagQuiver > 0) flagQuiver = Math.max(0, flagQuiver - dtMs / 600);
        if (shake > 0) shake = Math.max(0, shake - dtMs * 0.036);
        if (motion()) moveStreaks(dtMs);
    }

    function nearestWall(x, y) {
        let best = null, bd = Infinity;
        for (let i = 0; i < hole.walls.length; i++) {
            const w = hole.walls[i];
            const dx = Math.max(w.x - x, 0, x - (w.x + w.w));
            const dy = Math.max(w.y - y, 0, y - (w.y + w.h));
            const d = dx * dx + dy * dy;
            if (d < bd) { bd = d; best = w; }
        }
        return best;
    }

    function onWall(prev, now) {
        const dvx = now.vx - prev.vx, dvy = now.vy - prev.vy;
        const dir = Math.atan2(dvy, dvx);
        burst(now.x, now.y, 8, { dir: dir, spread: 1.4, speed: 26, life: 320, size: 0.55, colors: ['63,208,216', '180,240,255'] });
        wallFlash = { wall: nearestWall(now.x, now.y), t: 1 };
        kick(0.6);
        if (Audio) Audio.event('wall');
    }

    function onSandEntry(x, y) {
        burst(x, y, 6, { speed: 8, life: 480, size: 0.6, colors: ['255,205,110', '200,160,90'] });
    }

    function onLipOut() {
        lipped = true;
        ring(hole.cup.x, hole.cup.y, { r: SIM.CUP_R, vr: 10, life: 380, width: 0.5, color: '255,215,90' });
        if (Audio) Audio.event('lipout');
    }

    function onSunk() {
        // Recorded before any motion decision: the ball is in, whatever plays.
        drop = { t: motion() ? 0 : 1 };
        flagQuiver = motion() ? 1 : 0;
        ring(hole.cup.x, hole.cup.y, { r: SIM.CUP_R, vr: 14, life: 520, width: 0.5, color: '63,208,216' });
        if (strokes === 1) {
            burst(hole.cup.x, hole.cup.y, 24, { speed: 34, life: 700, size: 0.8, colors: ['63,208,216', '240,122,166', '242,180,90'] });
            ring(hole.cup.x, hole.cup.y, { r: SIM.CUP_R, vr: 26, life: 700, width: 0.7, color: '242,180,90' });
            kick(1.2);
            if (Audio) Audio.event('ace');
        } else if (Audio) {
            Audio.event('sunk');
        }
    }

    function onWater(entry) {
        splash = { x: entry.x, y: entry.y, t: motion() ? 0 : 1 };
        ring(entry.x, entry.y, { r: 0.8, vr: 16, life: 520, width: 0.5, color: '120,200,255' });
        ring(entry.x, entry.y, { r: 0.4, vr: 9, life: 700, width: 0.35, color: '120,200,255' });
        burst(entry.x, entry.y, 10, { speed: 14, life: 460, size: 0.55, colors: ['160,220,255', '90,170,255'] });
        if (Audio) Audio.event('water');
    }

    // ------------------------------------------------------------------
    // Loop
    // ------------------------------------------------------------------

    function slowMotionRate() {
        if (!motion()) return 1;
        const d = Math.hypot(ball.x - hole.cup.x, ball.y - hole.cup.y);
        const sp = Math.hypot(ball.vx, ball.vy);
        return d < SLOW_RADIUS && sp > 0 ? SLOW_RATE : 1;
    }

    function frame(now) {
        if (!animating) return;
        // A tab restored after five minutes would otherwise run 36,000 steps in
        // one frame and teleport the ball through the level.
        const dtMs = Math.max(0, Math.min(now - lastFrame, 100));
        lastFrame = now;
        idleT += dtMs;

        let event = 'moving';
        if (windup > 0) {
            // The putter is still on its way; the ball waits for the blade.
            windup = Math.max(0, windup - dtMs);
            acc = 0;
        } else if (drop) {
            drop.t = Math.min(1, drop.t + dtMs / DROP_MS);
            if (drop.t >= 1) event = 'sunk';
        } else if (splash) {
            splash.t = Math.min(1, splash.t + dtMs / SPLASH_MS);
            if (splash.t >= 1) event = 'water';
        } else {
            // Slow motion at the cup consumes fewer steps a frame. The steps
            // themselves are the same, so the outcome is.
            rate = slowMotionRate();
            acc += dtMs * rate;
            const stepMs = SIM.DT * 1000;
            while (acc >= stepMs && event === 'moving') {
                const prev = ball;
                const r = P.stepBall(hole, ball, wind, simTime, SIM.DT);
                ball = r.ball;
                simTime += SIM.DT;
                acc -= stepMs;
                event = r.event;
                if (r.bounces > 0) {
                    if (cells[cells.length - 1] === 'green') cells[cells.length - 1] = 'wall';
                    onWall(prev, ball);
                }
                if (wasOver && !ball.overCup && event !== 'sunk') onLipOut();
                wasOver = !!ball.overCup;
                if (event === 'moving' && P.surfaceAt(hole, ball.x, ball.y) === 'sand' &&
                    P.surfaceAt(hole, prev.x, prev.y) !== 'sand') onSandEntry(ball.x, ball.y);
                if (!reduceMotion) {
                    trail.push({ x: ball.x, y: ball.y });
                    if (trail.length > 220) trail.shift();
                }
                if (event === 'sunk') { onSunk(); event = 'moving'; break; }
                if (event === 'water') { onWater(prev); event = 'moving'; break; }
            }
            if (!drop && !splash) {
                const d = Math.hypot(ball.x - hole.cup.x, ball.y - hole.cup.y);
                near = Math.max(0, Math.min(1, 1 - d / 18));
                if (Audio) Audio.rolling(Math.hypot(ball.vx, ball.vy) / SIM.MAX_SPEED, near);
            } else {
                near = 0;
            }
        }

        updateFx(dtMs);
        draw();

        if (event === 'moving') {
            window.requestAnimationFrame(frame);
            return;
        }
        // Ball at rest: stop burning a core while the player thinks.
        animating = false;
        rate = 1;
        near = 0;
        lastEvent = event;
        if (Audio) Audio.quiet();
        settle(event);
    }

    function settle(event) {
        const surface = P.surfaceAt(hole, ball.x, ball.y);
        splash = null;
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
            if (Audio) Audio.event('sand');
        }
        if (event !== 'water') {
            const away = Math.round(Math.hypot(ball.x - hole.cup.x, ball.y - hole.cup.y));
            say('Stroke ' + strokes + '. ' + (lipped ? 'Lipped out, ' : (surface === 'sand' ? 'In the sand, ' : '')) +
                away + ' from the cup.');
        }
        // Water pushed an extra cell on; keep the count honest either way.
        if (event === 'water') cells.pop();
        if (!reduceMotion && trail.length > 1) {
            ghosts.push({ points: trail, end: event === 'water' ? 'water' : surface });
            if (ghosts.length > 6) ghosts.shift();
        }
        trail = [];
        paintHud();
        setEnabled(true);
        draw();
        ensureIdle();
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
                windMph: result.windMph, windDeg: result.windDeg, source: wind.source,
                cells: P.packCells(cells)
            });
            writeState();
            result.streak = saved.streak;
            mode = 'daily-done';
        }
        paintHud();
        say('In the hole. ' + P.scoreLabel(strokes, hole.par) + ', ' + strokes +
            (strokes === 1 ? ' stroke.' : ' strokes.'));
        // The card waits for the drop to be seen. As it was, at fx=0.
        const delay = motion() ? RESULT_DELAY_MS : 0;
        if (resultTimer) window.clearTimeout(resultTimer);
        resultTimer = window.setTimeout(function () {
            resultTimer = null;
            showResult(result, false);
            draw();
        }, delay);
        draw();
        ensureIdle();
    }

    function showResult(stored, fromStorage) {
        const strokeCount = stored.strokes;
        const par = stored.par;
        byId('result-score').textContent =
            P.scoreEmoji(strokeCount, par) + ' ' + P.scoreLabel(strokeCount, par);
        byId('result-line').textContent = strokeCount + (strokeCount === 1 ? ' stroke' : ' strokes') +
            ' · par ' + par + (fromStorage ? ' · already played today' : '');
        byId('result-stats').textContent =
            'Played ' + saved.played + ' · Aces ' + saved.aces + ' · Best streak ' + saved.bestStreak;
        paintWeek();
        const list = Array.isArray(stored.cells) ? stored.cells : P.unpackCells(stored.cells);
        const share = P.buildShare({
            day: day,
            strokes: strokeCount,
            par: par,
            cells: list.length ? list : new Array(strokeCount).fill('green'),
            windMph: stored.windMph,
            windDeg: stored.windDeg,
            streak: saved.streak
        });
        byId('result-share').textContent = share;
        // A practice or replay share carries today's number and is not the
        // day's result; it is not offered.
        const scored = mode === 'daily-done';
        byId('result-share').hidden = !scored;
        byId('share').hidden = !scored;
        byId('line').disabled = false;
        byId('line').textContent = 'Show me the line';
        byId('result').hidden = false;
        setEnabled(false);
    }

    // The last seven days, today on the right.
    function paintWeek() {
        const el = byId('result-week');
        el.textContent = '';
        for (let d = day - 6; d <= day; d++) {
            const rec = saved.days[String(d)];
            const cell = document.createElement('span');
            cell.className = 'week-cell' + (d === day ? ' today' : '') + (rec ? ' played' : '');
            cell.textContent = rec ? P.scoreEmoji(rec.strokes, rec.par) : '·';
            cell.title = '#' + d + (rec ? ': ' + rec.strokes + ' on par ' + rec.par : ': not played');
            el.appendChild(cell);
        }
    }

    // ------------------------------------------------------------------
    // The idle loop: the flag flaps and the wind drifts while you think
    // ------------------------------------------------------------------

    function idleWanted() {
        return motion() && !animating && !!hole && document.visibilityState !== 'hidden';
    }

    function idle(now) {
        idleHandle = 0;
        if (!idleWanted()) { idleLast = 0; return; }
        if (!idleLast) idleLast = now;
        const dt = now - idleLast;
        if (dt >= 40) {
            idleLast = now;
            idleT += dt;
            idleFrames++;
            updateFx(Math.min(dt, 100));
            if (lineShow && !lineShow.done) advanceLine(Math.min(dt, 100));
            draw();
        }
        idleHandle = window.requestAnimationFrame(idle);
    }

    function ensureIdle() {
        if (idleHandle || !idleWanted()) return;
        idleLast = 0;
        idleHandle = window.requestAnimationFrame(idle);
    }

    // ------------------------------------------------------------------
    // The line
    // ------------------------------------------------------------------

    function advanceLine(dtMs) {
        const m = lineShow.marks;
        if (lineShow.i < m.length) {
            lineShow.i = Math.min(m.length, lineShow.i + Math.round(dtMs / 1000 * (1 / SIM.DT)));
            if (lineShow.i >= m.length) lineShow.since = 0;
        } else {
            lineShow.since += dtMs;
            if (lineShow.since >= 1500) endLine();
        }
    }

    function endLine() {
        if (!lineShow || lineShow.done) return;
        lineShow.done = true;
        lineShow.i = lineShow.marks.length;
        byId('result').hidden = false;
    }

    byId('line').addEventListener('click', function () {
        // Only once the hole is done: the button lives on the result card and
        // is disabled until then, so nothing here can spoil a round.
        if (!hole || animating || byId('line').disabled) return;
        const btn = byId('line');
        btn.disabled = true;
        btn.textContent = 'Searching…';
        window.setTimeout(function () {
            const r = P.findAceLine(hole, wind);
            btn.textContent = 'Show me the line';
            if (!r.aim) {
                btn.disabled = false;
                say('No ace found from the tee in this wind. ' + r.tried + ' lines tried.');
                return;
            }
            let deg = Math.round(r.aim.angle * 180 / Math.PI);
            deg = ((deg % 360) + 360) % 360;
            say('The ace was here: ' + deg + '° at ' + r.pct + '%.');
            lineShow = { marks: r.marks, i: motion() ? 0 : r.marks.length, done: false, since: 0 };
            byId('result').hidden = true;
            if (!motion()) {
                // The whole line at once, and the card back after a look.
                draw();
                window.setTimeout(endLine, 1500);
            } else {
                ensureIdle();
            }
        }, 0);
    });

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
        byId('streak-value').textContent = String(saved.streak) + (saved.streak >= 2 ? ' \u{1F525}' : '');
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
    }

    function syncControls() {
        let deg = Math.round(aim.angle * 180 / Math.PI);
        deg = ((deg % 360) + 360) % 360;
        byId('aim-out').textContent = deg + '°';
        byId('power-out').textContent = Math.round(aim.power * 100) + '%';
    }

    // Off until switched on, and remembered. Hidden where there is no audio.
    const soundBtn = byId('sound');
    function paintSound() {
        const on = !!saved.settings.sound;
        soundBtn.textContent = on ? '\u{1F50A}' : '\u{1F507}';
        soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        soundBtn.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
    }
    if (!Audio || !Audio.available()) {
        soundBtn.hidden = true;
    } else {
        paintSound();
        soundBtn.addEventListener('click', function () {
            saved.settings.sound = Audio.setEnabled(!saved.settings.sound);
            writeState();
            paintSound();
        });
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
        if (lineShow && !lineShow.done) { endLine(); draw(); return; }
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

    // The keyboard is SLINGSHOT's: the same keys, the same step, and one
    // listener on window so it works without first clicking the green.
    // Space is left alone on a focused button or link, because there Space
    // IS the button; a focused Putt still putts, once, through its own click.
    window.addEventListener('keydown', function (e) {
        if (byId('putt').disabled) return;
        const step = (e.shiftKey ? 0.15 : 0.6) * Math.PI / 180;
        const onControl = e.target instanceof Element && e.target.matches('button, a');
        if (e.key === 'ArrowLeft') { aim.angle -= step; e.preventDefault(); }
        else if (e.key === 'ArrowRight') { aim.angle += step; e.preventDefault(); }
        else if (e.key === 'ArrowUp') { stepPower(1); e.preventDefault(); }
        else if (e.key === 'ArrowDown') { stepPower(-1); e.preventDefault(); }
        else if ((e.key === ' ' || e.key === 'Spacebar') && !onControl) { e.preventDefault(); putt(); return; }
        else return;
        syncControls();
        draw();
    });

    // Two points a press on the 5-100 readout, as SLINGSHOT's 2 of 18-102.
    // Stepped in whole percent so the readout never drifts by a float's worth.
    function stepPower(dir) {
        const pct = Math.round(aim.power * 100) + 2 * dir;
        aim.power = Math.max(5, Math.min(100, pct)) / 100;
    }

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
        const done = function () {
            byId('share').textContent = 'Copied';
            window.setTimeout(function () { byId('share').textContent = 'Copy result'; }, 1600);
        };
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
        // The guaranteed first gesture of a round: arm the sound here.
        if (Audio) Audio.arm(saved.settings.sound);
        const v = P.aimToVelocity(aim);
        ball = {
            x: ball.x, y: ball.y, vx: v.vx, vy: v.vy,
            resting: false, sunk: false, overCup: false,
            strokeOrigin: { x: ball.x, y: ball.y }
        };
        strokes += 1;
        cells.push('green');
        trail = [];
        lipped = false;
        wasOver = false;
        windup = motion() ? WINDUP_MS : 0;
        animating = true;
        setEnabled(false);
        paintHud();
        if (Audio) Audio.event('putt', aim.power);
        lastFrame = window.performance.now();
        acc = 0;
        window.requestAnimationFrame(frame);
    }

    // A tab left in the background accumulates no simulation debt, and the
    // idle loop stops with it and starts again when it comes back.
    document.addEventListener('visibilitychange', function () {
        lastFrame = window.performance.now();
        acc = 0;
        ensureIdle();
    });

    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(function () { draw(); }).observe(canvas);
    } else {
        window.addEventListener('resize', draw);
    }

    // Read-only, for the gate: none of this has a DOM readout.
    window.ONEPUTT_FX = {
        level: function () { return fxLevel; },
        particles: function () { return fx.length; },
        rings: function () { return rings.length; },
        shake: function () { return shake; },
        rate: function () { return rate; },
        windup: function () { return windup; },
        dropping: function () { return !!drop; },
        idleFrames: function () { return idleFrames; },
        animating: function () { return animating; },
        lastEvent: function () { return lastEvent; },
        lineShown: function () { return !!lineShow; },
        hole: function () { return hole; },
        wind: function () { return wind; },
        mode: function () { return mode; }
    };

    boot();
})();
