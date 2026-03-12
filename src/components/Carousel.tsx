"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons/SiteIcons";

interface CarouselProps {
  children: React.ReactNode[];
  title?: string;
}

export default function Carousel({ children, title }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, children.length - itemsPerView);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, maxIndex));
      setCurrentIndex(clamped);
    },
    [maxIndex]
  );

  const prev = () => goTo(currentIndex - 1);
  const next = () => goTo(currentIndex + 1);

  const totalPages = Math.ceil(children.length / itemsPerView);
  const currentPage = Math.floor(currentIndex / itemsPerView);

  return (
    <div className="carousel-wrapper">
      {title && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
          <h3 style={{ marginBottom: 0 }}>{title}</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="carousel-btn" onClick={prev} disabled={currentIndex === 0} style={{ position: "static", transform: "none", opacity: currentIndex === 0 ? 0.3 : 1 }}>
              <ChevronLeftIcon size={20} />
            </button>
            <button className="carousel-btn" onClick={next} disabled={currentIndex >= maxIndex} style={{ position: "static", transform: "none", opacity: currentIndex >= maxIndex ? 0.3 : 1 }}>
              <ChevronRightIcon size={20} />
            </button>
          </div>
        </div>
      )}

      <div style={{ overflow: "hidden" }}>
        <div
          ref={trackRef}
          className="carousel-track"
          style={{
            transform: `translateX(calc(-${currentIndex} * (100% / ${itemsPerView} + ${16 / itemsPerView}px)))`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              style={{
                minWidth: `calc(${100 / itemsPerView}% - ${(16 * (itemsPerView - 1)) / itemsPerView}px)`,
                flexShrink: 0,
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="carousel-dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === currentPage ? "active" : ""}`}
              onClick={() => goTo(i * itemsPerView)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
