"use client";
/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import ShareFlow from "./ShareFlow";
import { useMusic } from "./useMusic";
import { relationLabel, type Memory } from "../../lib/memoryTypes";
import type { MediaItem } from "../../lib/mediaTypes";
import styles from "./remembering.module.css";

type Float = {
  id: number;
  kind: "m" | "p";
  key: string;
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  d: number;
  dl: number;
  out: boolean;
  mine: boolean;
};
type Particle = { left: number; size: number; dur: number; delay: number };

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// Spreads items evenly over the first screen, then shuffles which item gets which place.
function makeSlots(cols: number, rows: number) {
  const slots: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({ x: -6 + (c + 0.5) * (84 / cols) + rnd(-3, 3), y: 1 + (r + 0.5) * (88 / rows) + rnd(-4, 4) });
    }
  }
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return slots;
}
function cloudinaryImageUrl(publicId: string, width: number, quality: "auto" | "low" = "auto") {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "uyn1yhjd";
  const q = quality === "low" ? "q_auto:low" : "q_auto";
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,${q},w_${width}/${encodeURIComponent(publicId)}`;
}

// Fades an element in the first time it scrolls into view.
function Reveal({ className, style, children }: { className: string; style?: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${className} ${shown ? styles.in : ""}`} style={style}>
      {children}
    </div>
  );
}

// A small looping, muted preview that plays while it is on screen.
function VideoTile({ item, onOpen }: { item: MediaItem; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <button type="button" className={styles.phBtn} onClick={onOpen} aria-label="Play video">
      <video ref={ref} className={styles.vid} src={item.thumb} poster={item.poster} muted loop playsInline preload="metadata" />
      <span className={styles.play} aria-hidden="true">
        ▶
      </span>
    </button>
  );
}

export default function Experience({ media, fontClass }: { media: MediaItem[]; fontClass: string }) {
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [floats, setFloats] = useState<Float[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [newId, setNewId] = useState<string | null>(null);

  const counter = useRef(0);
  const grid = useRef({ cols: 3, rows: 4 });
  const built = useRef(false);
  const memRef = useRef<Memory[]>([]);
  const floatsRef = useRef<Float[]>([]);
  const listRef = useRef<HTMLElement>(null);
  const music = useMusic();
  const photos = useMemo(() => media.filter((m) => m.type === "image"), [media]);
  const duck = music.duck;

  const adminKey = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("admin") ?? "",
    () => "",
  );

  const mkFloat = useCallback(
    (kind: "m" | "p", key: string, mine = false): Float => ({
      id: ++counter.current,
      kind,
      key,
      x: rnd(-8, 74),
      y: rnd(1, 88),
      r: rnd(-7, 7),
      dx: rnd(-30, 30),
      dy: rnd(-30, 30),
      dy: rnd(-50, 50),
      d: rnd(9, 17),
      dl: -rnd(0, 12),
      out: false,
      mine,
    }),
    [],
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/memories", { cache: "no-store" });
      const json = await res.json();
      setMemories(Array.isArray(json.memories) ? json.memories : []);
    } catch {
      setMemories([]);
    }
  }, []);

  useEffect(() => {
    void load();
    setParticles(
      Array.from({ length: 10 }, () => ({ left: rnd(0, 100), size: rnd(3, 9), dur: rnd(10, 20), delay: rnd(0, 15) })),
    );
  }, [load]);

  useEffect(() => {
    memRef.current = memories ?? [];
  }, [memories]);
  useEffect(() => {
    floatsRef.current = floats;
  }, [floats]);

  useEffect(() => {
    if (built.current || memories === null) return;
    built.current = true;
    const cols = window.innerWidth < 760 ? 3 : 6;
    const rows = 4;
    grid.current = { cols, rows };
    const total = Math.min(cols * rows, Math.max(8, (memories.length + photos.length) * 3));
    const list: Float[] = [];
    let pi = 0;
    let mi = 0;
    for (let i = 0; i < total; i++) {
      const wantMemory = memories.length > 0 && (photos.length === 0 || i % 2 === 1);
      if (wantMemory) list.push(mkFloat("m", memories[mi++ % memories.length].id));
      else if (photos.length > 0) list.push(mkFloat("p", String(pi++ % photos.length)));
    }
    const slots = makeSlots(cols, rows);
    setFloats(list.map((f, i) => ({ ...f, x: slots[i].x, y: slots[i].y })));
  }, [memories, photos, mkFloat]);

  useEffect(() => {
    const iv = setInterval(() => {
      const cur = floatsRef.current;
      if (!cur.length) return;
      const pick = cur[Math.floor(Math.random() * cur.length)];
      if (pick.mine) return;
      setFloats((c) => c.map((f) => (f.id === pick.id ? { ...f, out: true } : f)));
      setTimeout(() => {
        const ms = memRef.current;
        setFloats((c) =>
          c.map((f) => {
            if (f.id !== pick.id) return f;
            const key =
              f.kind === "m"
                ? ms.length
                  ? ms[Math.floor(Math.random() * ms.length)].id
                  : f.key
                : String(Math.floor(Math.random() * Math.max(photos.length, 1)));
            return { ...f, key, r: rnd(-7, 7), out: false }; 
        );
      }, 750);
    }, 3600);
    return () => clearInterval(iv);
  }, [photos.length]);

  const shuffle = useCallback(() => {
    setFloats((c) => {
      const slots = makeSlots(grid.current.cols, grid.current.rows);
      let k = 0;
      return c.map((f) => {
        if (f.mine) return f;
        const s = slots[k++ % slots.length];
        return { ...f, x: s.x, y: s.y, r: rnd(-7, 7) };
      });
    });
  }, []);

  const handleDone = useCallback(
    (m: Memory) => {
      setMemories((c) => [m, ...(c ?? [])]);
      setNewId(m.id);
      setFloats((c) => [...c, { ...mkFloat("m", m.id, true), x: 4, y: 3, r: -3 }]);
    },
    [mkFloat],
  );

  // Public ID is "photo" in Cloudinary, not "0"
  const profilePhotoUrl = cloudinaryImageUrl("photo", 700);
  const backgroundImg = cloudinaryImageUrl("photo", 1200, "low");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (lightbox && lightbox.type === "video") {
      duck(true);
      return () => duck(false);
    }
  }, [lightbox, duck]);

  const remove = async (id: string) => {
    if (!window.confirm("Delete this memory?")) return;
    try {
      const res = await fetch(`/api/memories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        window.alert(`Could not delete: ${json.error ?? res.status}`);
        return;
      }
    } catch {
      window.alert("Could not delete. Please check your connection.");
      return;
    }
    await load();
  };

  const readAll = () => listRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className={`${styles.page} ${fontClass}`} style={backgroundImg ? { backgroundImage: `url(${backgroundImg})` } : undefined}>
      <div className={styles.backdrop} aria-hidden="true" style={backgroundImg ? { backgroundImage: `url(${backgroundImg})` } : undefined} />

      <section className={styles.stage}>
        {particles.map((p, i) => (
          <span
            key={i}
            className={styles.pt}
            style={{ left: `${p.left}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `-${p.delay}s` }}
          />
        ))}

        {floats.map((f) => {
          const style = {
            "--x": `${f.x}%`,
            "--y": `${f.y}%`,
            "--r": `${f.r}deg`,
            "--dx": `${f.dx}px`,
            "--dy": `${f.dy}px`,
            "--d": `${f.d}s`,
            "--dl": `${f.dl}s`,
          } as CSSProperties;
          const cls = `${styles.fl} ${f.out ? styles.flOut : ""} ${f.mine ? styles.mine : ""}`;
          if (f.kind === "m") {
            const m = memories?.find((x) => x.id === f.key);
            if (!m) return null;
            return (
              <div key={f.id} className={`${cls} ${styles.fm}`} style={style}>
                <div>
                  <b>{m.name}</b>
                  <small>
                    {" · "}
                    {m.relation}
                    {m.hasAudio ? " · voice" : ""}
                  </small>
                </div>
                <p>{m.message || "Voice message"}</p>
              </div>
            );
          }
          if (!photos.length) return null;
          const pic = photos[Number(f.key) % photos.length];
          return (
            <div key={f.id} className={`${cls} ${styles.fp}`} style={style}>
              <div className={styles.fpBox}>
                <img src={pic.thumb} alt="" className={styles.cover} />
              </div>
            </div>
          );
        })}

        <div className={styles.core}>
          <p className={styles.eyebrow}>In loving memory</p>
          {profilePhotoUrl && (
            <div className={styles.frame}>
              <div className={styles.frameIn}>
                <img src={profilePhotoUrl} alt="శ్రీమాన్ చక్రహరి మురళీధర్ రాజు గారు" className={styles.cover} />
              </div>
            </div>
          )}
          <h1 className={styles.name}>
            శ్రీమాన్ చక్రహరి
            <br />
            మురళీధర్ రాజు గారు
          </h1>
          <ShareFlow onStep={shuffle} onDone={handleDone} onRecording={music.duck} onReadAll={readAll} />
        </div>

        <button type="button" className={styles.more} onClick={readAll}>
          Read all memories ↓
        </button>
      </section>

      {media.length > 0 && (
        <section className={styles.sec}>
          <h2 className={styles.h2}>
            క్షణాలు<small>Moments</small>
          </h2>
          <div className={styles.cols}>
            {media.map((item, i) => (
              <Reveal
                key={item.src}
                className={styles.ph}
                style={{ "--r": `${[-1.6, 1.2, -0.8, 1.7][i % 4]}deg` } as CSSProperties}
              >
                {item.type === "video" ? (
                  <VideoTile item={item} onOpen={() => setLightbox(item)} />
                ) : (
                  <button type="button" className={styles.phBtn} onClick={() => setLightbox(item)} aria-label="Open photo">
                    <img src={item.thumb} alt="" loading="lazy" />
                  </button>
                )}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className={`${styles.sec} ${styles.narrow}`} ref={listRef}>
        <h2 className={styles.h2}>
          జ్ఞాపకాల గోడ<small>Wall of Memories{memories ? ` (${memories.length})` : ""}</small>
        </h2>
        {memories === null && <p className={styles.empty}>Loading…</p>}
        {memories !== null && memories.length === 0 && <p className={styles.empty}>Be the first to share a memory.</p>}
        {memories?.map((m, i) => (
          <div key={m.id}>
            <Reveal className={`${styles.mem} ${m.id === newId ? styles.memNew : ""}`}>
              <div className={styles.who}>
                <div className={styles.av}>{Array.from(m.name)[0] ?? "•"}</div>
                <div>
                  <strong>{m.name}</strong>
                  <span>
                    {relationLabel(m.relation)}
                    {m.city ? ` · ${m.city}` : ""}
                    {" · "}
                    {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
              {m.first && (
                <>
                  <p className={styles.lab}>మొదటి పరిచయం · First meeting</p>
                  <p className={styles.msg}>{m.first}</p>
                  {m.message && <p className={styles.lab}>జ్ఞాపకం · Memory</p>}
                </>
              )}
              {m.message && <p className={styles.msg}>{m.message}</p>}
              {m.hasAudio && <audio className={styles.audioEl} controls preload="none" src={`/api/audio?id=${encodeURIComponent(m.id)}`} />}
              {adminKey && (
                <button type="button" className={styles.del} onClick={() => remove(m.id)}>
                  Delete
                </button>
              )}
            </Reveal>
            {i % 2 === 1 && media.length > 0 && (
              <Reveal className={styles.big}>
                {media[(i >> 1) % media.length].type === "video" ? (
                  <video
                    src={media[(i >> 1) % media.length].src}
                    poster={media[(i >> 1) % media.length].poster}
                    controls
                    playsInline
                    preload="none"
                  />
                ) : (
                  <img src={media[(i >> 1) % media.length].thumb} alt="" loading="lazy" />
                )}
              </Reveal>
            )}
          </div>
        ))}
      </section>

      {lightbox && (
        <div className={styles.lb} onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          {lightbox.type === "video" ? (
            <video src={lightbox.src} poster={lightbox.poster} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={lightbox.src} alt="" />
          )}
        </div>
      )}

      <button
        type="button"
        data-music-btn
        className={`${styles.mu} ${music.on ? styles.muOn : ""} ${music.off && !music.on ? styles.muOff : ""}`}
        onClick={music.toggle}
        aria-pressed={music.on}
        aria-label="Toggle soothing music"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span className={styles.muText}>Tap for music</span>
      </button>
    </div>
  );
}
