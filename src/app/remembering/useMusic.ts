"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCALE = [261.63, 293.66, 329.63, 392, 440, 523.25];

// Soft ambient music generated in the browser (no audio file needed).
// Browsers only allow sound after a first tap or key press, so it starts then.
export function useMusic() {
  const ctx = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flags = useRef({ on: false, off: false, was: false, dk: 0 });
  const [on, setOn] = useState(false);
  const [off, setOff] = useState(false);

  const build = useCallback(() => {
    const ac = ctx.current;
    if (!ac) return;
    const m = ac.createGain();
    m.gain.value = 0;
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1100;
    const out = ac.createGain();
    out.gain.value = 0.25; // overall volume: kept low
    const dl = ac.createDelay(1);
    dl.delayTime.value = 0.42;
    const fb = ac.createGain();
    fb.gain.value = 0.5;
    const wet = ac.createGain();
    wet.gain.value = 0.55;
    m.connect(lp);
    lp.connect(out);
    lp.connect(dl);
    dl.connect(fb);
    fb.connect(dl);
    dl.connect(wet);
    wet.connect(out);
    out.connect(ac.destination);
    const voices: [number, number, number][] = [
      [130.81, 0.5, 1],
      [196, 0.34, 1],
      [261.63, 0.3, 1],
      [130.81, 0.4, 1.004],
    ];
    voices.forEach(([freq, level, detune]) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const l = ac.createOscillator();
      const lg = ac.createGain();
      o.type = "triangle";
      o.frequency.value = freq * detune;
      g.gain.value = level * 0.5;
      l.frequency.value = 0.07 + Math.random() * 0.08;
      lg.gain.value = level * 0.3;
      l.connect(lg);
      lg.connect(g.gain);
      o.connect(g);
      g.connect(m);
      o.start();
      l.start();
    });
    master.current = m;
  }, []);

  const note = useCallback(() => {
    const ac = ctx.current;
    const m = master.current;
    if (!flags.current.on || !ac || !m) return;
    const t0 = ac.currentTime;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = SCALE[Math.floor(Math.random() * SCALE.length)];
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.16, t0 + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 5);
    o.connect(g);
    g.connect(m);
    o.start(t0);
    o.stop(t0 + 5.2);
    timer.current = setTimeout(note, 3500 + Math.random() * 4000);
  }, []);

  const start = useCallback(() => {
    const f = flags.current;
    if (f.on || f.off) return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!ctx.current) ctx.current = new AC();
    const ac = ctx.current;
    if (ac.state === "suspended") void ac.resume();
    if (!master.current) build();
    const m = master.current;
    if (!m) return;
    m.gain.cancelScheduledValues(ac.currentTime);
    m.gain.setTargetAtTime(1, ac.currentTime, 2.5);
    f.on = true;
    setOn(true);
    if (timer.current) clearTimeout(timer.current);
    note();
  }, [build, note]);

  const stop = useCallback(() => {
    const f = flags.current;
    if (!f.on) return;
    if (timer.current) clearTimeout(timer.current);
    const ac = ctx.current;
    const m = master.current;
    if (ac && m) m.gain.setTargetAtTime(0, ac.currentTime, 0.6);
    f.on = false;
    setOn(false);
  }, []);

  const toggle = useCallback(() => {
    if (flags.current.on) {
      flags.current.off = true;
      setOff(true);
      stop();
    } else {
      flags.current.off = false;
      setOff(false);
      start();
    }
  }, [start, stop]);

  // Pause while someone records their voice, then resume.
  const duck = useCallback(
    (quiet: boolean) => {
      const f = flags.current;
      if (quiet) {
        if (f.dk++ === 0) {
          f.was = f.on;
          stop();
        }
      } else if (f.dk > 0 && --f.dk === 0 && f.was && !f.off) {
        f.was = false;
        start();
      }
    },
    [start, stop],
  );

  // Start on the visitor's first tap or key press anywhere on the page.
  useEffect(() => {
    const events = ["pointerup", "keydown", "touchend"];
    const remove = () => events.forEach((ev) => window.removeEventListener(ev, handler));
    const handler = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (el && el.closest && el.closest("[data-music-btn]")) return;
      start();
      if (flags.current.on) remove();
    };
    events.forEach((ev) => window.addEventListener(ev, handler, { passive: true }));
    return remove;
  }, [start]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (ctx.current) void ctx.current.close();
      ctx.current = null;
      master.current = null;
      flags.current.on = false;
    };
  }, []);

  return { on, off, toggle, duck };
}
