/*
 * ONE PUTT - sound.
 *
 * Nothing here is a sample, and nothing can be: server.js's allowedExtensions
 * has no audio type, so a committed .mp3 would 404 in development and be
 * silently absent in production. Everything is synthesised from oscillators
 * and one shared noise buffer, so it makes no network requests and needs
 * nothing from the CSP. The structure is slingshot/audio.js's: a classic
 * IIFE attaching a global, a lazy AudioContext created on the first putt
 * gesture, one master gain behind a compressor.
 *
 * The voices are a putting green's, not a probe's: a click for the stroke, a
 * filtered-noise roll whose brightness follows the ball's speed, a tone that
 * lifts as the ball nears the cup, a clack for a wall, a thump for sand, a
 * splash, a ting for a lip-out, and the rattle of a ball dropping in.
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
     * Re-anchor before ramping. cancelScheduledValues then setValueAtTime of
     * the current value is what makes this safe to call every frame: each
     * ramp starts from wherever the parameter is, so nothing steps or clicks.
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
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16;
        comp.ratio.value = 6;
        comp.attack.value = 0.004;
        comp.release.value = 0.25;
        master.connect(comp).connect(ctx.destination);

        const buf = noiseBuffer(ctx, 3);

        // The roll: looped noise through a lowpass whose cutoff follows the
        // ball's speed, so a hard putt hisses and a dying one whispers.
        const roll = ctx.createBufferSource();
        roll.buffer = buf;
        roll.loop = true;
        const rf = ctx.createBiquadFilter();
        rf.type = 'lowpass';
        rf.frequency.value = 400;
        const rg = ctx.createGain();
        rg.gain.value = 0;
        roll.connect(rf).connect(rg).connect(master);
        roll.start();

        // The approach: a quiet tone that lifts as the ball nears the cup.
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 330;
        const og = ctx.createGain();
        og.gain.value = 0;
        osc.connect(og).connect(master);
        osc.start();

        voices = { buf: buf, rf: rf, rg: rg, osc: osc, og: og };
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

    /** Called from the putt - the guaranteed first gesture of a round. */
    function arm(want) { if (want) setEnabled(true); }

    /** A short pitched blip: the building block of every one-shot. */
    function blip(freq, dur, peak, type, at) {
        if (!ctx || !enabled) return;
        const now = ctx.currentTime + (at || 0);
        const o = ctx.createOscillator();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(Math.max(0.02, peak), now + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        o.connect(g).connect(master);
        o.start(now);
        o.stop(now + dur + 0.05);
    }

    /** A filtered noise swell: the click of the putter, a splash, a thump. */
    function swell(cut, dur, peak, at) {
        if (!ctx || !enabled) return;
        const now = ctx.currentTime + (at || 0);
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
     * Discrete events, read off the roll by script.js. Nothing in putt.js
     * knows this file exists; the rules stay pure.
     */
    function event(kind, arg) {
        if (!ctx || !enabled) return;
        const p = Math.min(1, Math.max(0, arg || 0.5));
        switch (kind) {
        case 'putt':
            swell(1800, 0.12, 0.10 + 0.16 * p);
            blip(110 + 90 * p, 0.16, 0.08, 'triangle');
            break;
        case 'wall':
            blip(880, 0.07, 0.13, 'square');
            swell(3200, 0.09, 0.12);
            break;
        case 'sand':
            swell(380, 0.28, 0.11);
            blip(85, 0.22, 0.05, 'sine');
            break;
        case 'water':
            swell(900, 0.6, 0.22);
            blip(320, 0.25, 0.06, 'sine', 0.05);
            blip(190, 0.4, 0.05, 'sine', 0.18);
            break;
        case 'lipout':
            blip(1400, 0.12, 0.10, 'triangle');
            blip(1100, 0.16, 0.06, 'triangle', 0.06);
            break;
        case 'sunk':
            // The rattle: a clunk and two quick bounces off the cup's wall.
            swell(1200, 0.3, 0.14);
            blip(700, 0.12, 0.12, 'triangle');
            blip(520, 0.12, 0.09, 'triangle', 0.07);
            blip(400, 0.2, 0.07, 'triangle', 0.15);
            break;
        case 'ace':
            [523, 659, 784, 1046, 1318].forEach(function (f, i) {
                blip(f, 0.45, 0.15, 'sine', i * 0.08);
            });
            swell(2600, 0.7, 0.12, 0.3);
            break;
        }
        if (kind !== 'putt') quiet();
    }

    /**
     * Called each frame while the ball rolls. `speed` is 0..1 of the launch
     * ceiling and sets the roll's loudness and brightness; `near` is 0..1 for
     * how close the ball is to the cup right now, and lifts the tone as it
     * closes. The game always knew that number; it never let you hear it.
     */
    function rolling(speed, near) {
        if (!ctx || !enabled || !voices) return;
        const s = Math.min(1, Math.max(0, speed || 0));
        const q = Math.min(1, Math.max(0, near || 0));
        ramp(voices.rg.gain, 0.02 + 0.07 * s, 0.08);
        ramp(voices.rf.frequency, 300 + 2600 * s, 0.08);
        ramp(voices.og.gain, 0.05 * q, 0.1);
        ramp(voices.osc.frequency, 330 + 420 * q * q, 0.1);
    }

    function quiet() {
        if (!ctx || !voices) return;
        ramp(voices.rg.gain, 0, 0.2);
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
        rolling: rolling,
        quiet: quiet
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.OnePuttAudio = api;
    }
})(typeof window !== 'undefined' ? window : null);
