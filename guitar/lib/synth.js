/*
 * The guitar tools' sound: a small plucked-string synth on Web Audio.
 *
 * Synthesised, never sampled -- server.js serves no audio MIME type, so an
 * audio file would 404 locally and vanish in production (see CLAUDE.md). The
 * AudioContext is created on the first Play press, the gesture browsers
 * require before sound.
 *
 * One "session" plays at a time. start() stops whatever was playing, every
 * note and timer belongs to the session's gain node, and stop() fades that
 * node and clears its timers, so Stop is always immediate and complete.
 * Pages subscribe with onChange(fn) to keep their Play/Stop buttons honest.
 */
(function (root) {
    'use strict';

    let ctx = null, master = null, noise = null, sess = null, kind = null;
    const listeners = [];
    const notify = () => listeners.forEach(fn => { try { fn(kind); } catch (e) { /* a page's handler must not stop the sound */ } });

    function ensure() {
        if (!ctx) {
            const AC = root.AudioContext || root.webkitAudioContext;
            if (!AC) return null;
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = 0.55;
            const comp = ctx.createDynamicsCompressor();
            master.connect(comp); comp.connect(ctx.destination);
            noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
            const d = noise.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    const mf = m => 440 * Math.pow(2, (m - 69) / 12);

    /** Begin a new session, ending any other. Returns the start time, or null with no audio. */
    function start(name) {
        stop();
        if (!ensure()) return null;
        const g = ctx.createGain();
        g.connect(master);
        sess = { g, timers: [] };
        kind = name || 'play';
        notify();
        return ctx.currentTime + 0.06;
    }

    function stop() {
        if (sess) {
            const g = sess.g;
            try { g.gain.setTargetAtTime(0, ctx.currentTime, 0.03); } catch (e) { /* already closed */ }
            setTimeout(() => { try { g.disconnect(); } catch (e) { /* gone */ } }, 400);
            sess.timers.forEach(clearTimeout);
            sess = null;
        }
        if (kind !== null) { kind = null; notify(); }
    }

    /** Run fn at audio time t (for highlighting what is sounding). */
    function at(t, fn) {
        if (!sess) return;
        sess.timers.push(setTimeout(fn, Math.max(0, (t - ctx.currentTime) * 1000)));
    }
    /** End the session at audio time t. */
    const endAt = t => at(t, stop);

    function pluck(m, t, dur, vol) {
        if (!sess) return;
        const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
        o1.type = 'sawtooth'; o2.type = 'triangle';
        o1.frequency.value = mf(m); o2.frequency.value = mf(m) * 1.004;
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass'; f.Q.value = 1.4;
        f.frequency.setValueAtTime(2800, t);
        f.frequency.exponentialRampToValueAtTime(420, t + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o1.connect(f); o2.connect(f); f.connect(g); g.connect(sess.g);
        o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    }

    function pad(m, t, dur, vol) {
        if (!sess) return;
        const o = ctx.createOscillator();
        o.type = 'triangle'; o.frequency.value = mf(m);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.4);
        g.gain.setValueAtTime(vol, t + dur - 0.4);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(sess.g); o.start(t); o.stop(t + dur + 0.05);
    }

    function hat(t, vol) {
        if (!sess) return;
        const s = ctx.createBufferSource(); s.buffer = noise;
        const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        s.connect(f); f.connect(g); g.connect(sess.g); s.start(t); s.stop(t + 0.06);
    }

    /** Strum MIDI notes low to high, a few milliseconds apart. */
    function strum(notes, t, dur, vol) { notes.forEach((m, j) => pluck(m, t + j * 0.022, dur, vol)); }

    const api = {
        start, stop, at, endAt, pluck, pad, hat, strum,
        playing: () => kind,
        onChange: fn => listeners.push(fn)
    };
    if (root) root.GuitarSynth = api;
})(typeof window !== 'undefined' ? window : null);
