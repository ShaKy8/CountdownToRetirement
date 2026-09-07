/**
 * THERMAL - canvas, input, weather, storage.
 *
 * All the rules live in flight.js. This file draws them, reads the button, and
 * talks to the network. Nothing here decides anything a test would want to
 * check.
 */
(function () {
    'use strict';

    const T = window.Thermal;
    const Sky = window.ThermalSky;
    const Astro = window.ThermalAstro;
    const FLY = T.FLY;
    const clamp = window.Daily.clamp;

    const byId = function (id) { return document.getElementById(id); };
    const skyCanvas = byId('sky');
    const stage = byId('stage');
    const ctx = stage.getContext('2d');
    const params = new URLSearchParams(window.location.search);

    // Exactly one Sky for the life of the page. There is no dispose(), so a new
    // one per flight would leak a WebGL context each time and kill the sky for
    // the session at the browser's ~16 limit.
    const sky = new Sky.Sky(skyCanvas);
    const skyOk = sky.init();
    if (!skyOk) {
        document.documentElement.dataset.nogl = '1';
        console.warn('webgl2 unavailable - flying under the fallback gradient');
    }

    const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ------------------------------------------------------------------
    // Session state
    // ------------------------------------------------------------------

    let saved = readState();
    let day = T.puzzleDay(new Date());
    let mode = 'preflight';      // preflight | flying | done | free
    let scored = true;           // whether this flight counts for the daily
    let loc = { lat: 34.0522, lon: -118.2437 };
    let raw = null;              // the day's weather, live or synthetic
    let cond = null;
    let world = null;
    let flight = null;
    let liveRaw = null;          // parked if it lands mid-flight
    let trace = [];
    let holding = false;
    let running = false;
    let lastFrame = 0;
    let acc = 0;
    let tier = reduceMotion ? 1 : 2;
    let fps = { n: 0, sum: 0, low: 0, high: 0 };

    sky.setQuality(tier);

    function readState() {
        let s = null;
        try { s = localStorage.getItem(T.STORAGE_KEY); } catch (e) { s = null; }
        return T.parseState(s);
    }

    function writeState() {
        try { localStorage.setItem(T.STORAGE_KEY, T.serializeState(saved)); } catch (e) { /* private mode */ }
    }

    function sunAltNow() {
        const forced = params.get('t');
        let when = new Date();
        if (forced && /^\d{1,2}:\d{2}$/.test(forced)) {
            const bits = forced.split(':');
            when = new Date(when.getFullYear(), when.getMonth(), when.getDate(),
                Number(bits[0]), Number(bits[1]));
        }
        return { at: when, alt: Astro.sunPosition(when, loc.lat, loc.lon).altitude };
    }

    // ------------------------------------------------------------------
    // Boot - interactive before the network answers
    // ------------------------------------------------------------------

    function rebuild(seed) {
        const sun = sunAltNow();
        cond = T.buildConditions(raw, sun.alt, 0);
        world = T.makeWorld(seed, cond);
        flight = T.createFlight(world);
        trace = [];
        paintHud();
    }

    function boot() {
        const forcedSeed = params.get('seed');
        const forcedWx = parseWxParam(params.get('wx'));
        const seed = T.seedForDay(day);

        raw = forcedWx || T.syntheticWeather(seed);

        if (forcedSeed !== null && /^\d+$/.test(forcedSeed)) {
            rebuild(Number(forcedSeed) >>> 0);
            mode = 'free';
            scored = false;
        } else {
            rebuild(seed);
            mode = Object.prototype.hasOwnProperty.call(saved.days, String(day))
                ? 'done' : 'preflight';
        }

        showCard();
        if (!forcedWx) fetchWeather(seed);
        tickCountdown();
        window.setInterval(tickCountdown, 1000);
        start();
    }

    // ?wx=<mixing layer m>@<mph>@<deg>@<cloud %>  e.g. ?wx=2200@9@250@20
    // Takes the boundary-layer depth, not CAPE: CAPE stopped driving anything
    // when the model moved to mixing depth, and an override that silently does
    // nothing is worse than no override.
    function parseWxParam(v) {
        if (!v) return null;
        const m = /^(\d+)@(\d+(?:\.\d+)?)@(\d+)@(\d+)$/.exec(v);
        if (!m) return null;
        return {
            blh: Number(m[1]), sunshine: 1, windMph: Number(m[2]), windDeg: Number(m[3]),
            cloudLow: Number(m[4]), tempF: 80, dewF: 50, cape: 0, source: 'live'
        };
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
     * Geolocation, raced against a timer: an unanswered permission prompt fires
     * NEITHER callback, ever, so without the race a player who ignores the
     * dialog leaves the badge pending for the whole session.
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
                    saved.settings.geo = 'set'; writeState();
                    done({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                },
                function () { saved.settings.geo = 'denied'; writeState(); done(home); },
                { timeout: 6000, maximumAge: 1800000 }
            );
        });
    }

    function fetchWeather(seed) {
        // Absolute. A relative './api/bundle' from /thermal/ resolves to
        // /thermal/api/bundle, which CloudFront does not route to the Lambda -
        // and it fails quietly into synthetic, looking like a slow API day.
        const deadline = new Promise(function (_, reject) {
            window.setTimeout(function () { reject(new Error('deadline')); }, 10000);
        });
        const chain = getJSON('/weather/api/config', 3500)
            .then(function (cfg) {
                if (!cfg || !cfg.home) throw new Error('no config');
                return locate(cfg);
            })
            .then(function (where) {
                loc = where;
                return getJSON('/weather/api/bundle?lat=' + encodeURIComponent(where.lat.toFixed(3)) +
                    '&lon=' + encodeURIComponent(where.lon.toFixed(3)), 6000);
            })
            .then(function (bundle) {
                const live = T.extractConditions(bundle, new Date());
                if (!live) return;
                liveRaw = live;
                // Only before launch. Changing the air under a flight in
                // progress would make the distance meaningless.
                if (mode === 'preflight' || mode === 'done' || mode === 'free') {
                    raw = live;
                    rebuild(world.seed);
                    showCard();
                }
            });
        Promise.race([chain, deadline]).catch(function () { /* synthetic stands */ });
    }

    // ------------------------------------------------------------------
    // Sky
    // ------------------------------------------------------------------

    function skyParams() {
        const sun = sunAltNow();
        const s = Astro.sunPosition(sun.at, loc.lat, loc.lon);
        const m = Astro.moonPosition(sun.at, loc.lat, loc.lon);
        const mi = Astro.moonIllumination(sun.at);
        const cf = cond.cloudFrac;
        return {
            // astro.js measures azimuth from due SOUTH; the shader wants 0 =
            // north. Omitting this renders a plausible sky that is 180 wrong.
            sunAlt: s.altitude, sunAz: s.azimuth + Math.PI,
            moonAlt: m.altitude, moonAz: m.azimuth + Math.PI,
            moonPhase: mi.phase, moonFrac: mi.fraction,
            viewAz: Math.PI / 2,
            cloudLow: cf, cloudMid: cf * 0.4, cloudHigh: cf * 0.3,
            precip: 0, snow: 0,
            storm: Math.min(0.5, cond.wStar / 12),
            fog: 0,
            wind: cond.windMps / T.MPH_TO_MPS,
            windDir: cond.windToward,
            kp: 2, lat: loc.lat, haze: 0.14,
            // Open country, not Orange County.
            cityGlow: 0.06, skyline: 0
        };
    }

    // ------------------------------------------------------------------
    // Rendering
    // ------------------------------------------------------------------

    const HORIZON_FRAC = (1 - Sky.HORIZON_Y) / 2;

    let W = 0, H = 0, dpr = 1;

    function fitStage() {
        const rect = stage.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = rect.width; H = rect.height;
        const bw = Math.round(W * dpr), bh = Math.round(H * dpr);
        if (stage.width !== bw || stage.height !== bh) {
            stage.width = bw; stage.height = bh;
        }
        // All geometry below is in CSS pixels.
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /**
     * How far to the side the camera sits, in metres.
     *
     * Grows with height so the ground stays in frame when high and closes in
     * when low, which makes the last hundred metres tense without a number. It
     * also has to be at least comparable to the cloudbase, or the cumulus
     * project enormous and near-vertical - a 2 km cloudbase seen from 900 m
     * away puts them at 62 degrees and filling the sky.
     */
    function standoff() {
        const agl = Math.max(0, flight.h - T.terrain(world.seed, flight.x));
        const forHeight = 600 + 1.1 * agl;
        const forCloud = cond.cloudbase * 0.9;
        return Math.max(700, Math.min(4000, Math.max(forHeight, forCloud)));
    }

    function project(xt, ht, D) {
        const el = Math.atan2(ht - flight.h, D);
        const az = Math.atan2(xt - flight.x, D);
        return {
            x: W / 2 + az * (H / (2 * Sky.AZ_PER_NDC)),
            y: HORIZON_FRAC * H - el * (H / (2 * Sky.EL_PER_NDC))
        };
    }

    function draw() {
        if (!W) fitStage();
        ctx.clearRect(0, 0, W, H);
        const D = standoff();
        const azMax = (W / 2) / (H / (2 * Sky.AZ_PER_NDC));
        const span = D * Math.tan(Math.min(1.4, azMax));

        // terrain
        const cols = 150;
        const ridgePts = [];
        ctx.beginPath();
        for (let i = 0; i <= cols; i++) {
            const xt = flight.x - span + (2 * span * i) / cols;
            const gh = T.terrain(world.seed, xt);
            const p = project(xt, gh, D);
            // Ridge lift sampled just off the surface, where it is strongest.
            ridgePts.push({ p: p, w: T.ridgeW(world.seed, xt, gh + 25, cond.windAlong),
                top: project(xt, gh + FLY.RIDGE_DECAY * 1.1, D) });
            if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.lineTo(W + 10, H + 10);
        ctx.lineTo(-10, H + 10);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, HORIZON_FRAC * H, 0, H);
        g.addColorStop(0, 'rgba(14,32,26,0.96)');
        g.addColorStop(1, 'rgba(4,10,14,1)');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = 'rgba(120,200,150,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        /*
         * Ridge lift, drawn hugging the windward faces.
         *
         * Without this it is invisible, and invisible lift is the exact mistake
         * the thermal columns were fixed for. It matters most on the days
         * thermals do not work - shallow, overcast, or after the sun has gone -
         * when the only way to stay up is to get low and work a slope. The band
         * fades with height because the lift does, which is what makes flying
         * it a real risk rather than a free ride.
         */
        for (let i = 0; i < ridgePts.length; i++) {
            const r = ridgePts[i];
            if (r.w < 0.25) continue;
            const a = clamp(r.w / 3, 0.06, 0.5);
            const g2 = ctx.createLinearGradient(0, r.p.y, 0, r.top.y);
            g2.addColorStop(0, 'rgba(120,255,180,' + (a * 0.85).toFixed(3) + ')');
            g2.addColorStop(1, 'rgba(120,255,180,0)');
            ctx.fillStyle = g2;
            const wpx = (2 * span / cols / D) * (H / (2 * Sky.AZ_PER_NDC)) + 2;
            ctx.fillRect(r.p.x - wpx / 2, r.top.y, wpx, r.p.y - r.top.y);
        }

        /*
         * Draw the lift.
         *
         * This used to render cumulus only, and only when cloud cover happened
         * to fall between 8% and 60% - on the reasoning that real pilots read
         * clouds and a blue day should be harder. That was wrong for a game:
         * on a blue sky, which is most of Los Angeles, there was NOTHING on
         * screen telling you where the rising air was, and the whole thing read
         * as "hold the mouse and descend". You cannot feel lift through a
         * screen. So the columns are always drawn, and the cumulus are a
         * decoration on top of them when the sky has any.
         */
        const ths = T.thermalsNear(world.seed, cond, flight.x);
        const t = window.performance.now() / 1000;
        for (let i = 0; i < ths.length; i++) {
            const th = ths[i];
            const ground = T.terrain(world.seed, th.x);
            // The column leans downwind with height exactly as the physics does,
            // so what you see is where the lift actually is.
            const tiltTop = clamp(cond.windAlong * (th.top - th.base) /
                Math.max(1, th.strength), -600, 600);
            const bl = project(th.x - th.r, ground + th.base, D);
            const br = project(th.x + th.r, ground + th.base, D);
            const tl = project(th.x - th.r + tiltTop, ground + th.top, D);
            const tr = project(th.x + th.r + tiltTop, ground + th.top, D);
            if (Math.max(bl.x, br.x, tl.x, tr.x) < -60 ||
                Math.min(bl.x, br.x, tl.x, tr.x) > W + 60) continue;

            const punch = clamp(th.strength / 4, 0.12, 1);
            const g = ctx.createLinearGradient(0, br.y, 0, tr.y);
            g.addColorStop(0, 'rgba(109,255,74,' + (0.05 * punch).toFixed(3) + ')');
            g.addColorStop(0.45, 'rgba(109,255,74,' + (0.20 * punch).toFixed(3) + ')');
            g.addColorStop(1, 'rgba(109,255,74,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(bl.x, bl.y); ctx.lineTo(br.x, br.y);
            ctx.lineTo(tr.x, tr.y); ctx.lineTo(tl.x, tl.y);
            ctx.closePath();
            ctx.fill();

            // Chevrons drifting up the column: the air is moving, and how fast.
            if (!reduceMotion) {
                const rows = 5;
                ctx.strokeStyle = 'rgba(160,255,140,' + (0.42 * punch).toFixed(3) + ')';
                ctx.lineWidth = 1.4;
                for (let k = 0; k < rows; k++) {
                    const f = ((k / rows) + (t * th.strength * 0.10)) % 1;
                    const y = br.y + (tr.y - br.y) * f;
                    const cx = bl.x + (tl.x - bl.x) * f + (br.x - bl.x) / 2;
                    const half = ((br.x - bl.x) / 2) * (1 - f * 0.35);
                    ctx.beginPath();
                    ctx.moveTo(cx - half * 0.5, y + 5);
                    ctx.lineTo(cx, y);
                    ctx.lineTo(cx + half * 0.5, y + 5);
                    ctx.stroke();
                }
            }

            // Cumulus mark the top when there is enough moisture to make one.
            if (cond.cloudFrac >= 0.08 && th.top > cond.cloudbase * 0.8) {
                const p = project(th.x + tiltTop, ground + th.top, D);
                const r = Math.max(6, Math.min(26, (th.r / D) * (H / (2 * Sky.AZ_PER_NDC)) * 0.55));
                ctx.fillStyle = 'rgba(255,255,255,0.26)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.arc(p.x - r * 0.7, p.y + r * 0.25, r * 0.65, 0, Math.PI * 2);
                ctx.arc(p.x + r * 0.7, p.y + r * 0.25, r * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // trail
        if (!reduceMotion && trace.length > 1) {
            ctx.strokeStyle = 'rgba(0,234,255,0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i < trace.length; i++) {
                const p = project(trace[i].x, trace[i].h, D);
                if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }

        // the glider sits on the horizon line: the camera flies alongside it
        const gx = W / 2, gy = HORIZON_FRAC * H;
        const pitch = Math.max(-0.5, Math.min(0.5, -(flight.v - FLY.V_SOAR) / 40));
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(pitch);
        const w = flight.w || 0;
        if (w > 0.2 && !flight.stalled) {
            ctx.shadowColor = '#6dff4a';
            ctx.shadowBlur = Math.min(26, 8 + w * 5);
        }
        ctx.fillStyle = flight.stalled ? '#ff3b57' : (w > 0.2 ? '#d8ffcc' : '#ffffff');
        ctx.beginPath();
        ctx.moveTo(-13, 0); ctx.lineTo(9, -3); ctx.lineTo(13, 0); ctx.lineTo(9, 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-4, -8, 2.5, 16);
        ctx.shadowBlur = 0;
        ctx.restore();

        drawVarioTape();
    }

    /**
     * The vario, as the primary instrument it is in a real glider.
     *
     * A three-character readout in the corner was not enough to fly by - it was
     * the only channel telling you the air was doing anything at all, and it
     * was the least visible thing on screen. This is a tape down the right-hand
     * edge, centre-zero, green up and red down, which is what a pilot actually
     * watches.
     */
    function drawVarioTape() {
        const w = flight.w || 0;
        const x = W - 30, top = H * 0.28, bot = H * 0.72, mid = (top + bot) / 2;

        ctx.fillStyle = 'rgba(4,10,20,0.55)';
        ctx.fillRect(x - 9, top - 10, 18, bot - top + 20);
        ctx.strokeStyle = 'rgba(0,234,255,0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 9, top - 10, 18, bot - top + 20);

        ctx.strokeStyle = 'rgba(255,255,255,0.30)';
        ctx.beginPath(); ctx.moveTo(x - 9, mid); ctx.lineTo(x + 9, mid); ctx.stroke();

        const f = clamp(w / 4, -1, 1);
        const h = Math.abs(f) * (mid - top);
        ctx.fillStyle = w >= 0 ? '#6dff4a' : '#ff3b57';
        ctx.fillRect(x - 7, w >= 0 ? mid - h : mid, 14, h);

        ctx.font = '600 11px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = w >= 0 ? '#6dff4a' : '#ff3b57';
        ctx.fillText((w >= 0 ? '+' : '') + w.toFixed(1), x, top - 16);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.font = '600 8px ui-monospace, monospace';
        ctx.fillText('LIFT', x, top - 26);
        ctx.textAlign = 'left';
    }

    // ------------------------------------------------------------------
    // Loop
    // ------------------------------------------------------------------

    function frame(now) {
        if (!running) return;
        // A tab restored after five minutes must not run 36,000 steps in one
        // frame and teleport the glider through the ridge.
        const dtMs = Math.min(now - lastFrame, 100);
        lastFrame = now;
        const dtSec = dtMs / 1000;

        if (mode === 'flying') {
            acc += dtMs * FLY.TIME_SCALE;
            const stepMs = FLY.DT * 1000;
            let guard = 0;
            while (acc >= stepMs && flight.alive && guard++ < 600) {
                flight = T.step(world, flight, FLY.DT);
                acc -= stepMs;
            }
            if (guard > 0 && (!trace.length ||
                flight.x - trace[trace.length - 1].x > 60)) {
                trace.push({ x: flight.x, h: flight.h });
                if (trace.length > 400) trace.shift();
            }
            if (!flight.alive) finish();
        }

        // dtSec, not dtMs: sky.render eases with pow(0.0016, dt), and
        // milliseconds underflow that to zero so every parameter snaps and the
        // easing silently dies.
        if (skyOk) sky.render(now, dtSec);
        draw();
        paintGauges();
        sampleFps(dtSec);
        window.requestAnimationFrame(frame);
    }

    function start() {
        if (running) return;
        running = true;
        lastFrame = window.performance.now();
        acc = 0;
        if (skyOk) sky.snap(skyParams());
        window.setInterval(function () { if (skyOk) sky.set(skyParams()); }, 4000);
        window.requestAnimationFrame(frame);
    }

    function sampleFps(dtSec) {
        fps.n++; fps.sum += dtSec;
        if (fps.sum < 1) return;
        const rate = fps.n / fps.sum;
        fps.n = 0; fps.sum = 0;
        if (rate < 40) { fps.low++; fps.high = 0; } else if (rate > 55) { fps.high++; fps.low = 0; }
        if (fps.low >= 3 && tier > 0) { tier--; sky.setQuality(tier); fps.low = 0; }
        else if (fps.high >= 6 && tier < (reduceMotion ? 1 : 3)) { tier++; sky.setQuality(tier); fps.high = 0; }
    }

    document.addEventListener('visibilitychange', function () {
        lastFrame = window.performance.now();
        acc = 0;
        if (document.hidden) { tier = 0; sky.setQuality(0); }
    });

    // ------------------------------------------------------------------
    // Flow
    // ------------------------------------------------------------------

    function launch() {
        flight = T.createFlight(world);
        trace = [];
        acc = 0;
        holding = false;
        scored = mode === 'preflight';
        mode = 'flying';
        byId('card').hidden = true;
        say('Launched. Hold to dive, release to soar.');
    }

    function finish() {
        const score = T.scoreFlight(flight);
        if (scored) {
            saved = T.recordDaily(saved, day, {
                dist: score.distance, glide: Math.round(score.glide * 10),
                climb: score.climb, dur: score.duration,
                solar: Math.round(cond.solar * 100), wind: Math.round(cond.windMps / T.MPH_TO_MPS),
                source: raw.source
            });
            writeState();
        }
        mode = scored ? 'done' : 'free';
        showResult(score, scored);
    }

    function showCard() {
        const card = byId('card');
        byId('card-share').hidden = true;
        byId('card-teach').hidden = true;
        byId('share').hidden = true;
        byId('free').hidden = true;
        byId('launch').hidden = false;

        if (mode === 'done') {
            const d = saved.days[String(day)];
            if (d) {
                showResult({ distance: d.dist, glide: d.glide / 10, climb: d.climb, duration: d.dur }, true);
                return;
            }
        }
        const sun = sunAltNow();
        const times = Astro.sunTimes(sun.at, loc.lat, loc.lon);
        const noon = times.solarNoon ? times.solarNoon.toTimeString().slice(0, 5) : 'midday';
        const pct = Math.round(cond.solar * 100);
        byId('card-title').textContent = mode === 'free' ? 'Free flight' : 'Flight #' + day;
        const conditions = pct < 15
            ? 'Solar ' + pct + '% · thermals asleep · best lift around ' + noon
            : 'Solar ' + pct + '% · ' + (pct > 70 ? 'working well' : 'coming up') +
              ' · cloudbase ' + Math.round(cond.cloudbase) + ' m';
        // The controls were explained and the GAME was not. What the player
        // needs to know before the first launch is that the green columns are
        // the point, not that the mouse does something.
        byId('card-line').textContent = conditions;
        byId('card-teach').textContent =
            'Green columns are rising air. Release inside one to climb; ' +
            'hold between them to cover ground. Fly as far as you can.';
        byId('card-teach').hidden = false;
        byId('launch').textContent = 'Launch';
        card.hidden = false;
    }

    function showResult(score, scored) {
        const spark = T.altitudeSparkline(trace.length ? trace : [{ h: 1 }]);
        byId('card-title').textContent = T.formatDistance(score.distance);
        byId('card-line').textContent =
            'L/D ' + score.glide + ' · climbed ' + score.climb + ' m · ' +
            Math.round(score.duration / FLY.TIME_SCALE) + 's' +
            (scored ? '' : ' · not scored');
        if (scored) {
            byId('card-share').textContent = T.buildShare({
                day: day, distance: score.distance, spark: spark, glide: score.glide,
                solar: cond.solar, windMph: cond.windMps / T.MPH_TO_MPS,
                windAlong: cond.windAlong, cloudFrac: cond.cloudFrac, streak: saved.streak
            });
            byId('card-share').hidden = false;
            byId('share').hidden = false;
        }
        byId('free').hidden = false;
        byId('launch').hidden = true;
        byId('card').hidden = false;
        say('Down after ' + T.formatDistance(score.distance) + '.');
    }

    // ------------------------------------------------------------------
    // HUD
    // ------------------------------------------------------------------

    function paintHud() {
        byId('puzzle-no').textContent = '#' + day;
        byId('mode-label').textContent =
            scored ? "today's flight" : 'free flight';
        byId('b-solar').textContent = '☀ ' + Math.round(cond.solar * 100) + '%';
        byId('b-wind').textContent = '🌬 ' + Math.round(cond.windMps / T.MPH_TO_MPS) + ' mph ' +
            Daily.compassFromDegrees(cond.windToward * 180 / Math.PI + 180);
        byId('b-sky').textContent = T.skyGlyph(cond.cloudFrac);
        const src = byId('b-source');
        src.textContent = cond.source === 'live' ? 'LIVE' : 'SIM';
        src.className = 'badge' + (cond.source === 'live' ? ' live' : '');
    }

    function paintGauges() {
        byId('g-dist').textContent = T.formatDistance(flight.x);
        byId('g-alt').textContent = Math.round(flight.h - T.terrain(world.seed, flight.x)) + ' m';
        const w = flight.w || 0;
        byId('g-vario').textContent = (w >= 0 ? '+' : '') + w.toFixed(1);
        const fill = byId('vario-fill');
        const pct = Math.max(-1, Math.min(1, w / 4)) * 50;
        fill.style.width = Math.abs(pct) + '%';
        fill.style.left = pct >= 0 ? '50%' : (50 + pct) + '%';
        fill.style.background = w >= 0 ? 'var(--lm)' : 'var(--rd)';
    }

    function tickCountdown() {
        const ms = Daily.msUntilNextPuzzle(new Date());
        const p = function (n) { return String(n).padStart(2, '0'); };
        byId('next-in').textContent = p(Math.floor(ms / 3600000)) + ':' +
            p(Math.floor((ms % 3600000) / 60000)) + ':' + p(Math.floor((ms % 60000) / 1000));
    }

    function say(msg) { byId('say').textContent = msg; }

    // ------------------------------------------------------------------
    // Input - one button
    // ------------------------------------------------------------------

    function setHold(on) {
        if (mode !== 'flying') return;
        holding = on;
        flight = Object.assign({}, flight, { hold: on });
    }

    stage.addEventListener('pointerdown', function (e) {
        stage.setPointerCapture(e.pointerId);
        setHold(true);
    });
    stage.addEventListener('pointerup', function () { setHold(false); });
    stage.addEventListener('pointercancel', function () { setHold(false); });

    window.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setHold(true); }
    });
    window.addEventListener('keyup', function (e) {
        if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setHold(false); }
    });

    byId('launch').addEventListener('click', launch);
    byId('free').addEventListener('click', function () {
        mode = 'free';
        scored = false;
        rebuild((Math.random() * 0xffffffff) >>> 0);
        showCard();
    });
    byId('share').addEventListener('click', function () {
        const text = byId('card-share').textContent;
        const done = function () { byId('share').textContent = 'Copied'; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, fallback);
        } else { fallback(); }
        function fallback() {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); done(); } catch (err) { /* nothing to do */ }
            document.body.removeChild(ta);
        }
    });

    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(function () { fitStage(); if (skyOk) sky.resize(); }).observe(stage);
    } else {
        window.addEventListener('resize', function () { fitStage(); if (skyOk) sky.resize(); });
    }

    boot();
})();
