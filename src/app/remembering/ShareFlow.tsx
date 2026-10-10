"use client";

import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent, type KeyboardEvent } from "react";
import { RELATIONS, type Memory } from "../../lib/memoryTypes";
import styles from "./remembering.module.css";

type Data = { m: string; r: string; f: string; n: string; c: string };
const EMPTY: Data = { m: "", r: "", f: "", n: "", c: "" };
const STEPS = 4;
const MAX_AUDIO_BYTES = 600_000;
const MAX_SECONDS = 60;

type Props = {
  onStep: () => void;
  onDone: (memory: Memory) => void;
  onRecording: (recording: boolean) => void;
  onReadAll: () => void;
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Could not read the recording"));
    reader.readAsDataURL(blob);
  });
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function ShareFlow({ onStep, onDone, onRecording, onReadAll }: Props) {
  const [i, setI] = useState(0);
  const [d, setD] = useState<Data>(EMPTY);
  const [audio, setAudio] = useState<{ url: string; blob: Blob } | null>(null);
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState<{ x: number; y: number }[]>([]);
  const [loaded, setLoaded] = useState(false);

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const trapRef = useRef<HTMLInputElement>(null);
  const firstFocus = useRef(true);

  const valid =
    i === 0 ? d.m.trim().length >= 10 || audio !== null : i === 1 ? d.r !== "" : i === 2 ? true : d.n.trim().length > 0;

  // Restore a saved draft (typed text only; a recording cannot be kept).
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rm_draft");
      if (raw) {
        const dr = JSON.parse(raw);
        if (dr && dr.d && (dr.d.m || dr.d.n)) {
          setD({ ...EMPTY, ...dr.d });
          setI(Math.min(Number(dr.i) || 0, STEPS - 1));
          setNote("మీ డ్రాఫ్ట్ భద్రంగా ఉంది · Your draft was saved. (A voice recording is not kept in drafts.)");
        }
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || done) return;
    try {
      localStorage.setItem("rm_draft", JSON.stringify({ i, d }));
    } catch {
      /* ignore */
    }
  }, [i, d, loaded, done]);

  // Grow the text box while typing.
  useEffect(() => {
    const el = fieldRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.max(110, el.scrollHeight)}px`;
    }
  }, [d.m, d.f, i]);

  // Focus the field on each step (on phones, not on the very first screen).
  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        if (!window.matchMedia("(hover:hover)").matches) return;
      }
      const el = i === 3 ? nameRef.current : i === 0 || i === 2 ? fieldRef.current : null;
      el?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(t);
  }, [i, done]);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
      if (recorder.current && recorder.current.state === "recording") recorder.current.stop();
    };
  }, []);

  function go(to: number) {
    setI(to);
    setNote("");
    setErr("");
    onStep();
  }

  function next() {
    if (!valid || recording || sending) return;
    if (i < STEPS - 1) go(i + 1);
    else void submit();
  }

  function stopRec() {
    if (timer.current) clearInterval(timer.current);
    if (recorder.current && recorder.current.state === "recording") recorder.current.stop();
  }

  async function startRec() {
    setErr("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
      setErr("Voice recording is not supported in this browser. Please type your memory.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 32000 });
      chunks.current = [];
      r.ondataavailable = (e) => {
        if (e.data && e.data.size) chunks.current.push(e.data);
      };
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: r.mimeType || mime || "audio/webm" });
        if (blob.size > MAX_AUDIO_BYTES) {
          setErr("That recording is too long. Please record a shorter message (under 1 minute).");
        } else {
          setAudio((prev) => {
            if (prev) URL.revokeObjectURL(prev.url);
            return { blob, url: URL.createObjectURL(blob) };
          });
        }
        setRecording(false);
        onRecording(false);
      };
      recorder.current = r;
      r.start();
      setRecording(true);
      setSecs(0);
      onRecording(true);
      const t0 = Date.now();
      timer.current = setInterval(() => {
        const s = Math.floor((Date.now() - t0) / 1000);
        setSecs(s);
        if (s >= MAX_SECONDS) stopRec();
      }, 250);
    } catch {
      setErr("The microphone is blocked. Please allow it in your browser settings, or type your memory.");
    }
  }

  async function submit() {
    setSending(true);
    setErr("");
    try {
      let data: string | undefined;
      let type: string | undefined;
      if (audio) {
        data = await blobToBase64(audio.blob);
        type = audio.blob.type;
      }
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.n,
          relation: d.r,
          city: d.c,
          first: d.f,
          message: d.m,
          audio: data,
          audioType: type,
          website: trapRef.current ? trapRef.current.value : "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      try {
        localStorage.removeItem("rm_draft");
      } catch {
        /* ignore */
      }
      setBurst(
        Array.from({ length: 26 }, (_, j) => {
          const a = (j / 26) * Math.PI * 2;
          const r = 90 + Math.random() * 90;
          return { x: Math.cos(a) * r, y: Math.sin(a) * r };
        }),
      );
      setDone(true);
      if (json.memory) onDone(json.memory as Memory);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  function again() {
    setI(0);
    setD(EMPTY);
    setAudio(null);
    setDone(false);
    setNote("");
    setErr("");
    onStep();
  }

  const onText = (key: keyof Data) => (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    setD((prev) => ({ ...prev, [key]: e.target.value }));

  const onNameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      cityRef.current?.focus();
    }
  };
  const onCityKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      next();
    }
  };

  const shown = done ? STEPS : i;

  return (
    <div className={styles.card}>
      <div className={styles.pg}>
        <span>
          {Math.min(i + 1, STEPS)} / {STEPS}
        </span>
        <div>
          <i style={{ width: `${(shown / STEPS) * 100}%` }} />
        </div>
        <span>Share your memory</span>
      </div>

      <div className={`${styles.step} ${styles.swap}`} key={done ? "done" : i}>
        {done ? (
          <>
            <p className={styles.qt}>ధన్యవాదాలు</p>
            <p className={styles.qe}>Thank you. Your memory is now floating on the wall above.</p>
            {burst.map((b, j) => (
              <span
                key={j}
                className={styles.bu}
                style={{ "--x": `${b.x}px`, "--y": `${b.y}px` } as CSSProperties}
              />
            ))}
          </>
        ) : i === 0 ? (
          <>
            <p className={styles.qt}>ఆయనతో గడిపిన ఒక మరపురాని క్షణం ఏది? ఆయనలో మీరు మెచ్చిన విషయం ఏమిటి?</p>
            <p className={styles.qe}>
              Share a memorable moment with him, or something you liked and admired about him. Type it, record your
              voice, or both
            </p>
            <textarea
              ref={fieldRef}
              className={`${styles.fld} ${!d.m ? styles.hint : ""}`}
              value={d.m}
              onChange={onText("m")}
              placeholder="A moment I remember, or what I admired about him…"
              maxLength={3000}
              rows={4}
            />
            <div className={styles.rb}>
              {recording ? (
                <>
                  <span className={styles.rd} />
                  <span className={styles.rt}>రికార్డింగ్… {fmt(secs)} / 1:00</span>
                  <button type="button" className={`${styles.go} ${styles.sm}`} onClick={stopRec}>
                    ఆపండి · Stop
                  </button>
                </>
              ) : audio ? (
                <>
                  <audio controls src={audio.url} />
                  <button
                    type="button"
                    className={styles.gh}
                    onClick={() => {
                      URL.revokeObjectURL(audio.url);
                      setAudio(null);
                    }}
                  >
                    తొలగించండి · Remove
                  </button>
                </>
              ) : (
                <button type="button" className={styles.mic} onClick={startRec}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="3" width="6" height="12" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                  </svg>
                  గొంతుతో చెప్పండి · Record your voice (1 min)
                </button>
              )}
            </div>
          </>
        ) : i === 1 ? (
          <>
            <p className={styles.qt}>ఆయనతో మీకు ఎలా పరిచయం?</p>
            <p className={styles.qe}>How did you know him? Tap one</p>
            <div className={styles.chips}>
              {RELATIONS.map(([en, te]) => (
                <button
                  key={en}
                  type="button"
                  className={`${styles.chip} ${d.r === en ? styles.chipSel : ""}`}
                  onClick={() => {
                    setD((prev) => ({ ...prev, r: en }));
                    setTimeout(() => {
                      setI((cur) => {
                        if (cur !== 1) return cur;
                        onStep();
                        return 2;
                      });
                    }, 380);
                  }}
                >
                  {en} · {te}
                </button>
              ))}
            </div>
          </>
        ) : i === 2 ? (
          <>
            <p className={styles.qt}>ఆయనతో మీ మొదటి పరిచయం ఎలా జరిగింది?</p>
            <p className={styles.qe}>
              How did you first meet him? What do you remember of that first interaction? (optional)
            </p>
            <textarea
              ref={fieldRef}
              className={styles.fld}
              value={d.f}
              onChange={onText("f")}
              placeholder="It was…"
              maxLength={1500}
              rows={4}
            />
          </>
        ) : (
          <>
            <p className={styles.qt}>ఈ జ్ఞాపకం ఎవరిది?</p>
            <p className={styles.qe}>Whose memory is this? Your name will be shown with it</p>
            <input
              ref={nameRef}
              className={`${styles.fld} ${styles.center}`}
              value={d.n}
              onChange={onText("n")}
              onKeyDown={onNameKey}
              placeholder="Type your name here"
              maxLength={80}
              autoComplete="name"
            />
            <input
              ref={cityRef}
              className={`${styles.fld} ${styles.center} ${styles.gap}`}
              value={d.c}
              onChange={onText("c")}
              onKeyDown={onCityKey}
              placeholder="City / ఊరు (optional)"
              maxLength={80}
              autoComplete="address-level2"
            />
            {/* Spam trap: hidden from people, bots tend to fill it */}
            <div className={styles.trap} aria-hidden="true">
              <label htmlFor="rm-website">Website</label>
              <input id="rm-website" ref={trapRef} tabIndex={-1} autoComplete="off" />
            </div>
          </>
        )}
      </div>

      <p className={styles.er} style={err ? undefined : note ? { color: "var(--gt)" } : undefined} role={err ? "alert" : undefined}>
        {err || note}
      </p>

      <div className={styles.nav}>
        {done ? (
          <>
            <button type="button" className={styles.gh} onClick={again}>
              Add another
            </button>
            <button type="button" className={styles.go} onClick={onReadAll}>
              Read all memories ↓
            </button>
          </>
        ) : (
          <>
            {i > 0 ? (
              <button type="button" className={styles.gh} onClick={() => go(i - 1)}>
                ← వెనుకకు · Back
              </button>
            ) : (
              <span />
            )}
            <div className={styles.navR}>
              {i === 2 && (
                <button type="button" className={styles.gh} onClick={() => go(3)}>
                  దాటవేయండి · Skip
                </button>
              )}
              <button type="button" className={styles.go} onClick={next} disabled={!valid || recording || sending}>
                {sending ? "Sending…" : i === STEPS - 1 ? "పంచుకోండి · Share" : "తరువాత · Next"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
