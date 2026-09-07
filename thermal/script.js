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
    const Audio = window.ThermalAudio;
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
    // The previous flight state, kept only so script.js can DIFF consecutive
    // states into events. flight.js never learns that audio exists - the
    // pure-rules / DOM split is asserted by tests.js.
    let prev = null;
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

    /*
     * The camera is a DEADZONE box, not a follower.
     *
     * Two earlier versions both failed the same way. Sitting at the glider's
     * exact altitude pinned the sprite to one pixel forever. Replacing that
     * with an exponential follower was no better in practice: against a steady
     * climb an exponential converges to a CONSTANT offset, so it is a rate
     * meter, not a position display. Measured, a typical 1.6 m/s climb parked
     * the glider 7.9 px off centre and held it there - the sprite moved 0.8 px
     * in the quarter second the nose swung its entire 32 degrees of pitch.
     *
     * A deadzone does not saturate. camH does not move at all until the glider
     * leaves the box, so a climb spends its whole first 30 seconds visibly
     * rising - measured at 13-93 px, median ~50, against the follower's 15.
     * Geometry says the glider needs 372 m at D=700 to reach the top edge, so
     * nothing can fly out of frame.
     */
    const CAM = { BOX: 120, CATCH: 0.7, D_HALF: 9.0 };
    // Sim seconds of flight the energy trace remembers.
    const TRAIL_SPAN = 26;
    let camH = null, camD = 700;

    function targetD() {
        // Deliberately does NOT grow with altitude. It used to add 0.55 m of
        // standoff per metre climbed, which quietly ate 17% of the one channel
        // that showed height - the same class of bug twice over.
        return 700;
    }

    function easeCam(dtSec) {
        if (camH === null) { camH = flight.h; camD = targetD(); return; }
        // Pixels the glider currently sits off the rest line, at this standoff.
        const px = Math.atan2(flight.h - camH, camD) * (H / (2 * Sky.EL_PER_NDC));
        if (Math.abs(px) > CAM.BOX) {
            // Outside the box: ease the camera just enough to put the glider
            // back ON the edge, never past it, so it keeps moving with you.
            const edge = camD * Math.tan((px > 0 ? CAM.BOX : -CAM.BOX) /
                (H / (2 * Sky.EL_PER_NDC)));
            const want = flight.h - edge;
            camH = want + (camH - want) * Math.pow(0.5, dtSec / CAM.CATCH);
        }
        camD = targetD() + (camD - targetD()) * Math.pow(0.5, dtSec / CAM.D_HALF);
    }

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

    function project(xt, ht, D) {
        const el = Math.atan2(ht - camH, D);
        const az = Math.atan2(xt - flight.x, D);
        return {
            x: W / 2 + az * (H / (2 * Sky.AZ_PER_NDC)),
            y: HORIZON_FRAC * H - el * (H / (2 * Sky.EL_PER_NDC))
        };
    }

    function draw() {
        if (!W) fitStage();
        ctx.clearRect(0, 0, W, H);
        const D = camD;
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
        const pulse = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 4);
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

            /*
             * The ring stack.
             *
             * A horizontal hoop seen from the side projects as an ellipse whose
             * flattening IS the elevation cue: level with you it is a line, and
             * it opens as you climb past it. That, plus the fact that the stack
             * sits at fixed altitudes while you move, is the strongest signal in
             * the game that you are going up.
             *
             * Drawn outside any reduced-motion guard - the rings are the game,
             * only the pulse on the next one is decoration.
             */
            const rs = T.ringsFor(th);
            for (let r = 0; r < rs.length; r++) {
                const alt = ground + rs[r].agl;
                const rx = T.ringX(th, rs[r], cond.windAlong);
                const cpt = project(rx, alt, D);
                if (cpt.x < -80 || cpt.x > W + 80) continue;
                const rr = T.ringRadius(th);
                const halfW = (rr / D) * (H / (2 * Sky.AZ_PER_NDC));
                const halfH = Math.max(1.2,
                    Math.abs(project(rx, alt, D - rr).y - project(rx, alt, D + rr).y) / 2);
                const got = (flight.taken[th.id] || 0) & (1 << r);
                if (got) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                    ctx.lineWidth = 1;
                } else {
                    const reach = clamp(1 - Math.abs(alt - flight.h) / 400, 0.12, 1);
                    const next = !got && alt > flight.h && alt - flight.h < 160;
                    ctx.strokeStyle = next
                        ? 'rgba(255,176,46,' + (0.55 + 0.35 * pulse).toFixed(2) + ')'
                        : 'rgba(0,234,255,' + (0.30 + 0.5 * reach).toFixed(2) + ')';
                    ctx.lineWidth = next ? 3 : 2;
                }
                ctx.beginPath();
                ctx.ellipse(cpt.x, cpt.y, halfW, halfH, 0, 0, Math.PI * 2);
                ctx.stroke();
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

        /*
         * The trail, as an ENERGY TRACE.
         *
         * It used to be one constant-alpha cyan polyline over the whole 15 km
         * flight, which during a glide rose 4.5 px over its nearest 500 m - a
         * two-degree slope, i.e. a horizontal rule - while 78% of its points
         * were crushed by atan2 into a 64 px smear at the left edge. It said
         * nothing, and it was the thing on screen Kyle could not identify.
         *
         * Now it is short, it fades, and it is coloured by the air it flew
         * through: green where the air was lifting, red where it was sinking.
         * That is the one thing the player cannot otherwise see, and it is a
         * map of where to come back to.
         */
        if (!reduceMotion && trace.length > 1) {
            ctx.lineCap = 'round';
            for (let i = 1; i < trace.length; i++) {
                const a = trace[i - 1], b = trace[i];
                const age = (flight.t - b.t) / TRAIL_SPAN;
                if (age > 1) continue;
                const fade = (1 - age) * 0.55;
                const lift = clamp(b.wa / 2, -1, 1);
                const col = lift > 0
                    ? '109,255,74'      // --lm, rising
                    : (lift < -0.25 ? '255,59,87' : '159,182,200');
                ctx.strokeStyle = 'rgba(' + col + ',' + (fade * (0.4 + 0.6 * Math.abs(lift))).toFixed(3) + ')';
                ctx.lineWidth = 1 + 2.2 * clamp((b.v - 20) / 35, 0, 1);
                const pa = project(a.x, a.h, D), pb = project(b.x, b.h, D);
                ctx.beginPath();
                ctx.moveTo(pa.x, pa.y);
                ctx.lineTo(pb.x, pb.y);
                ctx.stroke();
            }
            ctx.lineCap = 'butt';
        }

        // The glider is projected like everything else, so it rises and falls in
        // frame as it climbs and sinks.
        const gp = project(flight.x, flight.h, camD);
        const gspeed = Math.max(8, flight.v + cond.windAlong);
        // canvas +rotate is clockwise, which is nose-DOWN for a sprite pointing
        // +x, and gamma is negative when sinking - so the rotation is -gamma.
        const gamma = Math.atan2(flight.w, gspeed);
        const pitch = clamp(-gamma * 1.6, -0.5, 0.5);

        ctx.save();
        ctx.translate(gp.x, gp.y);
        ctx.rotate(pitch);
        if (flight.w > 0.2) {
            ctx.shadowColor = '#6dff4a';
            ctx.shadowBlur = Math.min(26, 8 + flight.w * 4);
        } else if (flight.stalled) {
            ctx.shadowColor = '#ff3b57';
            ctx.shadowBlur = 22;
        }
        const lit = flight.stalled ? '#ff8fa0' : (flight.w > 0.2 ? '#d8ffcc' : '#ffffff');
        // A straight wing seen from the side. The airspeed is shown by the
        // streaks off the tips rather than by the shape, so the silhouette
        // stays readable at 40 m AGL against terrain.
        const S = 15;
        // A dark outline under the whole silhouette. Without it the glider
        // vanishes against the terrain exactly when it matters most - at 40 m
        // AGL, which is where the game is meant to be played.
        ctx.strokeStyle = 'rgba(2,8,16,0.9)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-S, 0);
        ctx.lineTo(S * 0.6, 0);
        ctx.stroke();
        ctx.strokeStyle = lit;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-S, 0);
        ctx.lineTo(S * 0.6, 0);
        ctx.stroke();
        ctx.fillStyle = 'rgba(2,8,16,0.9)';
        ctx.fillRect(-5, -3.5, 16, 7);
        ctx.fillStyle = lit;
        ctx.fillRect(-3, -2, 12, 4);
        // A tail fin, so the nose direction is unambiguous when it pitches.
        // Drawn as a triangle off the tail rather than a bar above it, which
        // read as a hook hanging in mid-air.
        ctx.beginPath();
        ctx.moveTo(-S + 1, 0);
        ctx.lineTo(-S + 1, -6);
        ctx.lineTo(-S + 6, 0);
        ctx.closePath();
        ctx.fill();
        // Speed streaks: nothing at min sink, a hard rake at 55.
        const fast = clamp((flight.v - 30) / 25, 0, 1);
        if (fast > 0.02 && !reduceMotion) {
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.35 * fast).toFixed(2) + ')';
            ctx.lineWidth = 1;
            for (let i = -1; i <= 1; i += 2) {
                ctx.beginPath();
                ctx.moveTo(-S - 2, i * 4);
                ctx.lineTo(-S - 2 - 26 * fast, i * 4);
                ctx.stroke();
            }
        }
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
        // flight.w is the GLIDER's climb rate. This used to read flight.w when
        // step() returned the AIR's velocity in that field, so the tape did not
        // respond to the button at all - measured, a held step dropped the
        // glider at -17.98 m/s while the tape showed -1.21.
        const w = flight.w || 0;
        const air = flight.wAir || 0;
        // Skipped on a phone: at 360 px the tape lands on top of the gauge
        // block, and the VARIO gauge is already showing the same number.
        if (W < 520) return;
        const x = W - 30, top = H * 0.28, bot = H * 0.72, mid = (top + bot) / 2;

        ctx.fillStyle = 'rgba(4,10,20,0.55)';
        ctx.fillRect(x - 9, top - 10, 18, bot - top + 20);
        ctx.strokeStyle = 'rgba(0,234,255,0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 9, top - 10, 18, bot - top + 20);

        ctx.strokeStyle = 'rgba(255,255,255,0.30)';
        ctx.beginPath(); ctx.moveTo(x - 9, mid); ctx.lineTo(x + 9, mid); ctx.stroke();

        const f = clamp(w / 5, -1, 1);
        const h = Math.abs(f) * (mid - top);
        ctx.fillStyle = w >= 0 ? '#6dff4a' : '#ff3b57';
        ctx.fillRect(x - 7, w >= 0 ? mid - h : mid, 14, h);

        // The air's own climb, as a hairline. The gap between the two IS the
        // cost of flying slow, drawn.
        const af = clamp(air / 5, -1, 1);
        ctx.strokeStyle = 'rgba(160,255,140,0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 9, mid - af * (mid - top));
        ctx.lineTo(x + 9, mid - af * (mid - top));
        ctx.stroke();

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
            // Sampled by PATH, and kept only for TRAIL_SPAN seconds of flight.
            // The old 900-point buffer held the whole 15 km flight, of which
            // 78% ended up in a 64 px smear against the left edge.
            const last = trace[trace.length - 1];
            if (!last || Math.hypot(flight.x - last.x, flight.h - last.h) > 18 ||
                flight.t - last.t > 0.6) {
                trace.push({ x: flight.x, h: flight.h, t: flight.t,
                             wa: flight.wAir, v: flight.v });
                while (trace.length && flight.t - trace[0].t > TRAIL_SPAN) trace.shift();
            }
            if (!flight.alive) finish();
        }

        // dtSec, not dtMs: sky.render eases with pow(0.0016, dt), and
        // milliseconds underflow that to zero so every parameter snaps and the
        // easing silently dies.
        easeCam(dtSec);
        if (skyOk) sky.render(now, dtSec);
        draw();
        paintGauges();
        emitEvents(dtSec);
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
        // The Launch button is the guaranteed first user gesture of every
        // session - the card is shown at boot and nothing flies before it is
        // clicked - which is exactly what a browser requires before audio.
        if (saved.settings.sound) Audio.setEnabled(true);
        Audio.event('launch');
        prev = null;
        say('HOLD to pull up and climb — let go to dive and go fast.');
    }

    function finish() {
        const score = T.scoreFlight(flight);
        // Read the old best BEFORE recordDaily bumps it, or every flight is a
        // personal best.
        const wasBest = scored && score.distance > saved.best;
        if (scored) {
            saved = T.recordDaily(saved, day, {
                dist: score.distance, glide: Math.round(score.glide * 10),
                climb: score.climb, dur: score.duration,
                solar: Math.round(cond.solar * 100), wind: Math.round(cond.windMps / T.MPH_TO_MPS),
                rings: flight.rings, chain: flight.bestChain,
                source: raw.source
            });
            writeState();
        }
        mode = scored ? 'done' : 'free';
        if (wasBest) Audio.event('pb');
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
            'HOLD to pull up: you trade speed for height and climb. ' +
            'LET GO to dive: you trade height for speed. ' +
            'Green air lifts, red air sinks — be slow in the green and fast through the red. ' +
            'Hold too long and you stall.';
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
        Audio.event('land');
        Audio.quiet();
        say('Down after ' + T.formatDistance(score.distance) + '.');
    }

    /**
     * Turn consecutive flight states into sound.
     *
     * Every event is a DIFF computed here, never something step() returns:
     * flight.js has no notion of audio, of the DOM, or of wall-clock time, and
     * a test asserts it stays that way.
     */
    function emitEvents(dtSec) {
        if (!flight || !Audio) return;
        Audio.update({
            v: flight.v, w: flight.w,
            agl: flight.h - T.terrain(world.seed, flight.x),
            stalled: flight.stalled
        }, dtSec);
        if (prev) {
            if (flight.rings > prev.rings) Audio.event('ring', flight.chain - 1);
            if (flight.chain > prev.chain && (flight.chain === 3 || flight.chain === 5 ||
                flight.chain === 8)) Audio.event('chain');
            // A hard pull-up: the move the whole control scheme exists for.
            if (flight.v < prev.v - 4 * dtSec * FLY.TIME_SCALE && prev.v > 38 &&
                flight.v <= 38) Audio.event('pullup');
        }
        prev = flight;
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
        const agl = flight.h - T.terrain(world.seed, flight.x);
        const alt = byId('g-alt');
        alt.textContent = Math.round(agl) + ' m';
        // Under 60 m the ground is the thing about to end the flight, so the
        // altimeter stops being a statistic and starts being a warning.
        alt.style.color = agl < 60 ? 'var(--rd)' : (agl < 120 ? 'var(--am)' : '');
        const spd = byId('g-spd');
        spd.textContent = Math.round(flight.v) + '';
        spd.style.color = flight.v < FLY.V_STALL ? 'var(--rd)'
            : (flight.v < FLY.V_STALL + 3 ? 'var(--am)' : '');
        byId('g-spd-sub').textContent = flight.v < FLY.V_STALL ? 'STALL'
            : (flight.v < FLY.V_STALL + 3 ? 'slow' : 'm/s');
        const w = flight.w || 0;
        byId('g-vario').textContent = (w >= 0 ? '+' : '') + w.toFixed(1);
        const mult = Math.min(T.RING.MAX_MULT, 1 + 0.25 * Math.max(0, flight.chain - 1));
        byId('g-chain').textContent = '×' + mult.toFixed(1);
        byId('g-rings').textContent = flight.rings + ' rings';
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

    // Sound. The toggle is itself a valid gesture, so a player who turns it on
    // from the pre-flight card gets audio immediately rather than on the next
    // click. Persisted through the settings field that has existed in the
    // storage schema, unread, since the first version.
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
            const want = !saved.settings.sound;
            saved.settings.sound = want ? Audio.setEnabled(true) : (Audio.setEnabled(false), false);
            writeState();
            paintSound();
        });
    }
    paintSound();
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
