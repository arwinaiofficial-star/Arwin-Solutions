"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

/* ── Sabine RT60 Formula ── */
/*  RT60 = 0.161 × V / A
    V = Room volume (m³)
    A = Σ(αᵢ × Sᵢ) — total absorption (sabins)  */

const materials: { name: string; alpha: number }[] = [
  { name: "Concrete / Plaster", alpha: 0.02 },
  { name: "Brick (unpainted)", alpha: 0.03 },
  { name: "Glass (window)", alpha: 0.04 },
  { name: "Gypsum Board", alpha: 0.05 },
  { name: "Wood Panel", alpha: 0.10 },
  { name: "Carpet (heavy)", alpha: 0.30 },
  { name: "Acoustic Ceiling Tile", alpha: 0.70 },
  { name: "Heavy Curtains / Drapes", alpha: 0.55 },
];

interface RoomResult {
  volume: number;
  totalSurface: number;
  totalAbsorption: number;
  rt60: number;
  rating: string;
  ratingColor: string;
}

function calculateRT60(
  length: number,
  width: number,
  height: number,
  floorAlpha: number,
  wallAlpha: number,
  ceilingAlpha: number
): RoomResult {
  const volume = length * width * height;
  const floorArea = length * width;
  const ceilingArea = floorArea;
  const wallArea = 2 * height * (length + width);
  const totalSurface = 2 * floorArea + wallArea;

  const totalAbsorption =
    floorArea * floorAlpha + ceilingArea * ceilingAlpha + wallArea * wallAlpha;

  const rt60 = totalAbsorption > 0 ? (0.161 * volume) / totalAbsorption : 0;

  let rating: string;
  let ratingColor: string;
  if (rt60 < 0.3) {
    rating = "Very Dead — ideal for recording studios";
    ratingColor = "var(--color-primary)";
  } else if (rt60 < 0.6) {
    rating = "Controlled — ideal for classrooms & offices";
    ratingColor = "var(--color-success)";
  } else if (rt60 < 1.0) {
    rating = "Balanced — good for conference rooms";
    ratingColor = "var(--color-success)";
  } else if (rt60 < 1.8) {
    rating = "Live — suitable for auditoriums";
    ratingColor = "var(--color-warning)";
  } else {
    rating = "Very Reverberant — needs acoustic treatment";
    ratingColor = "var(--color-error)";
  }

  return { volume, totalSurface, totalAbsorption, rt60, rating, ratingColor };
}

const idealRanges = [
  { space: "Recording Studio", min: 0.2, max: 0.4 },
  { space: "Classroom", min: 0.6, max: 0.8 },
  { space: "Office / Conference", min: 0.5, max: 0.7 },
  { space: "Lecture Hall", min: 0.8, max: 1.2 },
  { space: "Concert Hall", min: 1.5, max: 2.5 },
  { space: "Worship Space", min: 2.0, max: 4.0 },
];

export default function AcousticsCalculatorPage() {
  const [length, setLength] = useState(8);
  const [width, setWidth] = useState(6);
  const [height, setHeight] = useState(3);
  const [floorMat, setFloorMat] = useState(5); // Carpet
  const [wallMat, setWallMat] = useState(0); // Concrete
  const [ceilingMat, setCeilingMat] = useState(6); // Acoustic tile

  const result = useMemo(
    () =>
      calculateRT60(
        length,
        width,
        height,
        materials[floorMat].alpha,
        materials[wallMat].alpha,
        materials[ceilingMat].alpha
      ),
    [length, width, height, floorMat, wallMat, ceilingMat]
  );

  /* Bar chart for ideal ranges */
  const maxRT = 4.5;

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="max-w-screen-lg mx-auto">
            <Link
              href="/builtiq"
              style={{
                color: "var(--color-text-muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                marginBottom: "var(--space-md)",
                fontWeight: 500,
              }}
            >
              ← Back to BuiltIQ
            </Link>
            <div className="eyebrow mb-sm">BuiltIQ Calculator</div>
            <h1 className="hero-title">Room Acoustics Calculator</h1>
            <p className="hero-subtitle">
              Calculate the reverberation time (RT60) of any room using the
              Sabine equation. Optimize acoustic comfort for any space type.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="calculator-container">
            <div className="calculator-card">
              <div className="calculator-grid">
                {/* Inputs */}
                <div>
                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">Room Length</span>
                      <span className="slider-value">{length} m</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={30}
                      step={0.5}
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>2 m</span><span>30 m</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">Room Width</span>
                      <span className="slider-value">{width} m</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={20}
                      step={0.5}
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>2 m</span><span>20 m</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">Room Height</span>
                      <span className="slider-value">{height} m</span>
                    </div>
                    <input
                      type="range"
                      min={2.4}
                      max={8}
                      step={0.1}
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>2.4 m</span><span>8 m</span>
                    </div>
                  </div>

                  {/* Material selectors */}
                  <div className="slider-group">
                    <span className="slider-label">Floor Material</span>
                    <select
                      value={floorMat}
                      onChange={(e) => setFloorMat(Number(e.target.value))}
                      className="bi-select"
                    >
                      {materials.map((m, i) => (
                        <option key={i} value={i}>{m.name} (α = {m.alpha})</option>
                      ))}
                    </select>
                  </div>

                  <div className="slider-group">
                    <span className="slider-label">Wall Material</span>
                    <select
                      value={wallMat}
                      onChange={(e) => setWallMat(Number(e.target.value))}
                      className="bi-select"
                    >
                      {materials.map((m, i) => (
                        <option key={i} value={i}>{m.name} (α = {m.alpha})</option>
                      ))}
                    </select>
                  </div>

                  <div className="slider-group">
                    <span className="slider-label">Ceiling Material</span>
                    <select
                      value={ceilingMat}
                      onChange={(e) => setCeilingMat(Number(e.target.value))}
                      className="bi-select"
                    >
                      {materials.map((m, i) => (
                        <option key={i} value={i}>{m.name} (α = {m.alpha})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results */}
                <div>
                  <div
                    className="bi-rt60-display"
                    style={{ borderColor: result.ratingColor }}
                  >
                    <span className="bi-rt60-label">Reverberation Time (RT60)</span>
                    <span className="bi-rt60-value" style={{ color: result.ratingColor }}>
                      {result.rt60.toFixed(2)}s
                    </span>
                    <span className="bi-rt60-rating" style={{ color: result.ratingColor }}>
                      {result.rating}
                    </span>
                  </div>

                  <div className="result-card mt-lg">
                    <div className="result-item">
                      <span className="result-label">Room Volume</span>
                      <span className="result-value">
                        {result.volume.toFixed(1)} m³
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Total Surface Area</span>
                      <span className="result-value">
                        {result.totalSurface.toFixed(1)} m²
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Total Absorption</span>
                      <span className="result-value">
                        {result.totalAbsorption.toFixed(2)} sabins
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ideal RT60 Ranges Chart */}
            <div className="card mt-xl">
              <h3 style={{ marginBottom: "var(--space-md)" }}>
                Ideal RT60 Ranges by Space Type
              </h3>
              <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
                Your room&apos;s RT60 of <strong>{result.rt60.toFixed(2)}s</strong> is
                shown as the amber line. Compare it against recommended ranges.
              </p>
              <div className="bi-range-chart">
                {idealRanges.map((range, i) => {
                  const leftPct = (range.min / maxRT) * 100;
                  const widthPct = ((range.max - range.min) / maxRT) * 100;
                  const yourPct = (result.rt60 / maxRT) * 100;
                  return (
                    <div key={i} className="bi-range-row">
                      <span className="bi-range-label">{range.space}</span>
                      <div className="bi-range-bar-track">
                        <div
                          className="bi-range-bar-fill"
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                          }}
                        />
                        <div
                          className="bi-range-your-line"
                          style={{ left: `${Math.min(yourPct, 100)}%` }}
                        />
                      </div>
                      <span className="bi-range-values">
                        {range.min}–{range.max}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formula */}
            <div className="card mt-xl">
              <h3 style={{ marginBottom: "var(--space-md)" }}>
                How RT60 Is Calculated
              </h3>
              <p className="text-muted" style={{ marginBottom: "var(--space-md)" }}>
                RT60 is calculated using the <strong>Sabine equation</strong>:
              </p>
              <div
                style={{
                  background: "var(--color-surface-elevated)",
                  padding: "var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.95rem",
                  color: "#f59e0b",
                  overflowX: "auto",
                }}
              >
                RT60 = 0.161 × V / A
              </div>
              <ul className="text-muted mt-md" style={{ paddingLeft: "var(--space-md)", lineHeight: 2 }}>
                <li><strong>V</strong> = Room volume in cubic meters (L × W × H)</li>
                <li><strong>A</strong> = Total absorption = Σ(αᵢ × Sᵢ)</li>
                <li><strong>αᵢ</strong> = Absorption coefficient of each surface material</li>
                <li><strong>Sᵢ</strong> = Surface area of that material (m²)</li>
                <li><strong>0.161</strong> = Constant derived from the speed of sound</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
