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
      <span className={styles.play} aria
