/*
 * SLINGSHOT - sound.
 *
 * Nothing here is a sample, and nothing can be: server.js's allowedExtensions
 * lists nine extensions and none of them is audio, so a committed .mp3 would
 * 404 in development and be silently absent in production. Everything is
 * synthesised from oscillators and one shared noise buffer, which also means it
 * makes no network requests and needs nothing from the CSP.
 *
 * Structured as a classic-script IIFE attaching a global, not an ES module:
 * index.html loads it with a plain <script src>, the way orbit.js is loaded.
 */
(function (root) {
    'use strict';

    let ctx = null;
    let master = null;
    let enabled = false;
    let voices = null;

    function noiseBuffer(ac, seconds) {
        const buf = ac.createBuffer(1, ac.sampleRate * (seconds || 3), ac.sampleRate);
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
     * never click.
     */
    function ramp(param, value, seconds) {
        const now = ctx.currentTime;
        param.cancelScheduledValues(now);
        param.setValueAtTime(param.value, now);
        param.linearRampToValueAtTime(value, now + (seconds === undefined ? 0.08 : seconds));
    }

    function init() {
        if (ctx) return true;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        try { ctx = new AC(); } catch (e) { return false; }

        master = ctx.createGain();
        master.gain.value = 0;
        // A limiter, so an arrival chime landing on top of the flight drone
        // cannot clip the mix.
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16;
        comp.ratio.value = 6;
        comp.attack.value = 0.004;
        comp.release.value = 0.25;
        master.connect(comp).connect(ctx.destination);

        const buf = noiseBuffer(ctx, 3);

        // The flight drone: a quiet sine that rises as the probe travels, so a
        // long curving shot builds tension without any visual cue.
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 150;
        const og = ctx.createGain();
        og.gain.value = 0;
        osc.connect(og).connect(master);
        osc.start();

        voices = { buf: buf, osc: osc, og: og };
        return true;
    }

    function setEnabled(on) {
        enabled = !!on;
        if (enabled && !init()) { enabled = false; return false; }
        if (!ctx) return enabled;
        // Browsers suspend the context when the tab is hidden; resume before
        // ramping or the fade-in happens silently and never comes back.
        if (enabled && ctx.state === 'suspended' && ctx.resume) ctx.resume();
        ramp(master.gain, enabled ? 0.5 : 0, enabled ? 0.9 : 0.3);
        return enabled;
    }

    /** Called from the Launch click - the guaranteed first gesture of a session. */
    function arm(want) { if (want) setEnabled(true); }

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

    /** A filtered noise swell - the launch, and the crash. */
    function swell(cut, dur, peak) {
        if (!ctx || !enabled) return;
        const now = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = voices.buf;
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(cut, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(Math.max(0.02, peak), now + dur * 0.18);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        src.connect(f).connect(g).connect(master);
        src.start(now);
        src.stop(now + dur + 0.1);
    }

    /**
     * Discrete events, diffed out of the flight result by script.js. Nothing in
     * orbit.js knows this file exists - the rules stay pure.
     */
    function event(kind, arg) {
        if (!ctx || !enabled) return;
        switch (kind) {
        case 'launch':
            swell(2200, 0.45, 0.20);
            blip(180 + 260 * (arg || 0.5), 0.3, 0.10, 'triangle');
            break;
        case 'arrive':
            [523, 659, 784, 1046].forEach(function (f, i) {
                window.setTimeout(function () { blip(f, 0.4, 0.16, 'sine'); }, i * 85);
            });
            break;
        case 'crash':
            swell(240, 1.0, 0.34);
            blip(70, 0.5, 0.14, 'square');
            break;
        case 'miss':
            blip(300, 0.35, 0.08, 'triangle');
            window.setTimeout(function () { blip(210, 0.5, 0.07, 'triangle'); }, 110);
            break;
        }
        if (kind !== 'launch') quiet();
    }

    /** Called each frame while the probe is in flight; `p` is 0..1 of the path. */
    function flying(p) {
        if (!ctx || !enabled || !voices) return;
        ramp(voices.og.gain, 0.05, 0.1);
        ramp(voices.osc.frequency, 150 + 220 * Math.min(1, Math.max(0, p)), 0.1);
    }

    function quiet() {
        if (!ctx || !voices) return;
        ramp(voices.og.gain, 0, 0.25);
    }

    const api = {
        setEnabled: setEnabled,
        arm: arm,
        isEnabled: function () { return enabled; },
        available: function () {
            return typeof window !== 'undefined' &&
                !!(window.AudioContext || window.webkitAudioContext);
        },
        event: event,
        flying: flying,
        quiet: quiet
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.SlingshotAudio = api;
    }
})(typeof window !== 'undefined' ? window : null);
