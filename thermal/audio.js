/**
 * THERMAL - sound.
 *
 * Nothing here is a sample, and nothing can be: server.js's allowedExtensions
 * has no audio MIME type, so an .mp3 404s in development and is silently absent
 * in production. Everything is synthesised from oscillators and one shared
 * noise buffer, which also means it makes no network requests and needs nothing
 * from the CSP.
 *
 * The design follows the instruments a real glider pilot flies by, because the
 * player is flying by them too and the screen cannot show everything at once:
 *
 *   airflow  - the loudest channel, and the one that matters most. Airspeed IS
 *              the control variable, and the rush tells you where it is without
 *              looking away from the ground.
 *   vario    - pitch and beep rate rise with climb, continuous tone in sink.
 *   stall    - a reed buzz from 24 m/s and hard below 21. This is the fail
 *              state, and it is about three seconds from any held button.
 *   ground   - a pulse that quickens under 60 m AGL. The other fail state.
 *
 * The context is created lazily on a user gesture (the Launch button), which
 * every browser requires. Structured as a classic-script IIFE attaching a
 * global, not an ES module: index.html loads it with a plain <script src>, the
 * way sky.js, astro.js and flight.js are loaded.
 */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ThermalAudio = api;
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    let ctx = null;
    let master = null;
    let enabled = false;
    let v = null;             // the continuous voices
    let nextBeep = 0;
    let nextGround = 0;

    function noiseBuffer(ac, seconds) {
        const buf = ac.createBuffer(1, ac.sampleRate * (seconds || 4), ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        return buf;
    }

    /**
     * Re-anchor before ramping.
     *
     * cancelScheduledValues followed by setValueAtTime(param.value) is what
     * makes it safe to call this every animation frame: each ramp starts from
     * wherever the parameter actually is, so overlapping ramps never step and
     * never click. Without it, driving a tone from the vario at 60 fps buzzes.
     */
    function ramp(param, value, seconds) {
        const now = ctx.currentTime;
        param.cancelScheduledValues(now);
        param.setValueAtTime(param.value, now);
        param.linearRampToValueAtTime(value, now + (seconds === undefined ? 0.08 : seconds));
    }

    function clamp(x, lo, hi) { return x < lo ? lo : (x > hi ? hi : x); }

    function init() {
        if (ctx) return true;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        try { ctx = new AC(); } catch (e) { return false; }

        master = ctx.createGain();
        master.gain.value = 0;
        // A limiter, so a ring chime landing on top of the airflow and the vario
        // cannot clip the mix.
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16;
        comp.ratio.value = 6;
        comp.attack.value = 0.004;
        comp.release.value = 0.25;
        master.connect(comp).connect(ctx.destination);

        const buf = noiseBuffer(ctx, 4);

        // Airflow: a bandpass sweep over looping noise. Cutoff and gain both
        // track airspeed, so 55 m/s roars and 24 m/s is nearly silent.
        const air = ctx.createBufferSource();
        air.buffer = buf;
        air.loop = true;
        const airFilt = ctx.createBiquadFilter();
        airFilt.type = 'bandpass';
        airFilt.frequency.value = 420;
        airFilt.Q.value = 0.7;
        const airGain = ctx.createGain();
        airGain.gain.value = 0;
        air.connect(airFilt).connect(airGain).connect(master);
        air.start();

        // Vario. One oscillator, gated by its own gain: in sink it is a steady
        // low tone, in lift the beep() below chops it.
        const vo = ctx.createOscillator();
        vo.type = 'triangle';
        vo.frequency.value = 400;
        const vg = ctx.createGain();
        vg.gain.value = 0;
        vo.connect(vg).connect(master);
        vo.start();

        // Stall warning: a reed, deliberately unpleasant.
        const so = ctx.createOscillator();
        so.type = 'sawtooth';
        so.frequency.value = 210;
        const sf = ctx.createBiquadFilter();
        sf.type = 'lowpass';
        sf.frequency.value = 1400;
        const sg = ctx.createGain();
        sg.gain.value = 0;
        so.connect(sf).connect(sg).connect(master);
        so.start();

        v = { buf: buf, airFilt: airFilt, airGain: airGain, vo: vo, vg: vg, sg: sg, so: so };
        return true;
    }

    function setEnabled(on) {
        enabled = !!on;
        if (enabled && !init()) { enabled = false; return false; }
        if (!ctx) return enabled;
        // Browsers suspend the context when the tab is hidden; resume before
        // ramping or the fade-in happens silently and never comes back.
        if (enabled && ctx.state === 'suspended' && ctx.resume) ctx.resume();
        // Asymmetric: slow in so it does not announce itself, quicker out.
        ramp(master.gain, enabled ? 0.5 : 0, enabled ? 1.0 : 0.35);
        return enabled;
    }

    function isEnabled() { return enabled; }

    /** A short pitched blip. The building block for every one-shot. */
    function blip(freq, dur, peak, type) {
        if (!ctx || !enabled) return;
        const now = ctx.currentTime;
        const o = ctx.createOscillator();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, now);
        const g = ctx.createGain();
        // exponentialRampToValueAtTime throws on 0, so the floor is 0.0001.
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(Math.max(0.02, peak), now + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        o.connect(g).connect(master);
        o.start(now);
        o.stop(now + dur + 0.05);
    }

    /** A filtered noise swell - wind, impact, the whoomph of a hard pull-up. */
    function swell(cut, dur, peak) {
        if (!ctx || !enabled) return;
        const now = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = v.buf;
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(cut, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(Math.max(0.02, peak), now + dur * 0.22);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        src.connect(f).connect(g).connect(master);
        src.start(now);
        src.stop(now + dur + 0.1);
    }

    /**
     * Discrete events, diffed out of consecutive flight states by script.js.
     * Nothing in flight.js knows this file exists - the rules stay pure.
     */
    function event(kind, arg) {
        if (!ctx || !enabled) return;
        switch (kind) {
        case 'ring':
            // Pitched up by the chain, so a run audibly climbs a scale.
            blip(660 * Math.pow(2, Math.min(8, arg || 0) / 12), 0.28, 0.16, 'sine');
            break;
        case 'chain':
            blip(880, 0.18, 0.14, 'triangle');
            setTimeout(function () { blip(1320, 0.3, 0.12, 'triangle'); }, 90);
            break;
        case 'pullup': swell(900, 0.55, 0.20); break;
        case 'top':
            blip(520, 0.22, 0.13, 'square');
            setTimeout(function () { blip(392, 0.42, 0.12, 'square'); }, 130);
            break;
        case 'pb':
            [523, 659, 784, 1046].forEach(function (f, i) {
                setTimeout(function () { blip(f, 0.35, 0.15, 'sine'); }, i * 95);
            });
            break;
        case 'launch': swell(1600, 0.8, 0.18); break;
        case 'land': swell(320, 1.4, 0.30); break;
        }
    }

    /**
     * Called every frame with the live flight state. Does nothing but ramp
     * continuous parameters, so it is cheap and cannot click.
     *
     * `s` needs { v, w, agl, stalled }; `dtSec` is wall time.
     */
    function update(s, dtSec) {
        if (!ctx || !enabled || !v) return;

        // Airflow. Nothing below min sink, a roar at V_FAST.
        const fast = clamp((s.v - 20) / 38, 0, 1);
        ramp(v.airFilt.frequency, 300 + 900 * fast, 0.12);
        ramp(v.airGain.gain, 0.02 + 0.30 * fast * fast, 0.12);

        // Stall. Audible from 24 m/s so the warning arrives BEFORE the stall,
        // which is the only way a warning is useful.
        const st = clamp((24 - s.v) / 4, 0, 1);
        ramp(v.sg.gain, st * 0.20, 0.06);
        if (st > 0) ramp(v.so.frequency, 190 + 90 * st, 0.06);

        // Vario. In sink, a steady low tone. In lift, a beep whose pitch and
        // rate both rise with the climb - a real vario, and the reason a pilot
        // can centre a thermal without looking at anything.
        const w = s.w;
        if (w > 0.25) {
            const f = 420 + 150 * clamp(w, 0, 6);
            ramp(v.vo.frequency, f, 0.05);
            const period = 0.62 / (0.5 + clamp(w, 0, 6) * 0.55);
            nextBeep -= dtSec;
            if (nextBeep <= 0) {
                nextBeep = period;
                const now = ctx.currentTime;
                v.vg.gain.cancelScheduledValues(now);
                v.vg.gain.setValueAtTime(0.0001, now);
                v.vg.gain.exponentialRampToValueAtTime(0.10, now + 0.012);
                v.vg.gain.exponentialRampToValueAtTime(0.0001, now + period * 0.55);
            }
        } else {
            nextBeep = 0;
            ramp(v.vo.frequency, 250 + 30 * clamp(w, -5, 0), 0.15);
            ramp(v.vg.gain, w < -1.6 ? 0.045 : 0, 0.25);
        }

        // Ground proximity, quickening under 60 m. The other way to die.
        if (s.agl < 60 && s.agl > 0) {
            nextGround -= dtSec;
            if (nextGround <= 0) {
                nextGround = 0.16 + 0.5 * (s.agl / 60);
                blip(1500, 0.09, 0.09, 'square');
            }
        } else {
            nextGround = 0;
        }
    }

    /** Silence everything without tearing the context down (tab hidden, landing). */
    function quiet() {
        if (!ctx || !v) return;
        ramp(v.airGain.gain, 0, 0.3);
        ramp(v.vg.gain, 0, 0.3);
        ramp(v.sg.gain, 0, 0.2);
    }

    return {
        setEnabled: setEnabled,
        isEnabled: isEnabled,
        available: function () {
            return typeof window !== 'undefined' &&
                !!(window.AudioContext || window.webkitAudioContext);
        },
        update: update,
        event: event,
        quiet: quiet
    };
});
