"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface AreaResult {
  superBuiltUp: number;
  builtUp: number;
  carpetArea: number;
  utilization: number;
  priceSuperBuiltUp: number;
  priceBuiltUp: number;
  priceCarpet: number;
}

function calculateAreas(
  superBuiltUp: number,
  loadingPct: number,
  wallPct: number,
  pricePerSqft: number
): AreaResult {
  const builtUp = Math.round(superBuiltUp / (1 + loadingPct / 100));
  const carpetArea = Math.round(builtUp * (1 - wallPct / 100));
  const utilization = superBuiltUp > 0 ? (carpetArea / superBuiltUp) * 100 : 0;

  return {
    superBuiltUp,
    builtUp,
    carpetArea,
    utilization,
    priceSuperBuiltUp: pricePerSqft,
    priceBuiltUp: superBuiltUp > 0 ? Math.round((pricePerSqft * superBuiltUp) / builtUp) : 0,
    priceCarpet: carpetArea > 0 ? Math.round((pricePerSqft * superBuiltUp) / carpetArea) : 0,
  };
}

export default function CarpetAreaCalculatorPage() {
  const [superBuiltUp, setSuperBuiltUp] = useState(1500);
  const [loading, setLoading] = useState(25);
  const [wallPct, setWallPct] = useState(10);
  const [price, setPrice] = useState(6000);

  const result = useMemo(
    () => calculateAreas(superBuiltUp, loading, wallPct, price),
    [superBuiltUp, loading, wallPct, price]
  );

  /* Stacked bar data */
  const commonArea = superBuiltUp - result.builtUp;
  const wallArea = result.builtUp - result.carpetArea;
  const segments = [
    { label: "Carpet Area", value: result.carpetArea, color: "var(--color-success)" },
    { label: "Wall Area", value: wallArea, color: "var(--color-warning)" },
    { label: "Common Area", value: commonArea, color: "var(--color-primary)" },
  ];

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
            <h1 className="hero-title">Carpet Area Calculator</h1>
            <p className="hero-subtitle">
              Understand what you actually get when buying property in India.
              Convert between Super Built-up, Built-up, and Carpet Area.
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
                      <span className="slider-label">Super Built-up Area</span>
                      <span className="slider-value">{formatNumber(superBuiltUp)} sq ft</span>
                    </div>
                    <input
                      type="range"
                      min={300}
                      max={5000}
                      step={50}
                      value={superBuiltUp}
                      onChange={(e) => setSuperBuiltUp(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>300 sq ft</span><span>5,000 sq ft</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">Loading Factor (Common Area %)</span>
                      <span className="slider-value">{loading}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={45}
                      step={1}
                      value={loading}
                      onChange={(e) => setLoading(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>10%</span><span>45%</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">Wall Thickness (%)</span>
                      <span className="slider-value">{wallPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={20}
                      step={1}
                      value={wallPct}
                      onChange={(e) => setWallPct(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>5%</span><span>20%</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">Price per sq ft (Super Built-up)</span>
                      <span className="slider-value">{formatCurrency(price)}</span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={25000}
                      step={500}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>₹1,000</span><span>₹25,000</span>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div>
                  {/* Stacked horizontal bar */}
                  <div className="bi-stacked-bar-wrap">
                    <div className="bi-stacked-bar">
                      {segments.map((seg, i) => (
                        <div
                          key={i}
                          className="bi-stacked-segment"
                          style={{
                            width: `${superBuiltUp > 0 ? (seg.value / superBuiltUp) * 100 : 33}%`,
                            background: seg.color,
                          }}
                          title={`${seg.label}: ${formatNumber(seg.value)} sq ft`}
                        />
                      ))}
                    </div>
                    <div className="chart-legend mt-md">
                      {segments.map((seg, i) => (
                        <div key={i} className="legend-item">
                          <div className="legend-dot" style={{ background: seg.color }} />
                          <span>{seg.label} ({formatNumber(seg.value)} sq ft)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="result-card mt-lg">
                    <div className="result-item">
                      <span className="result-label">Super Built-up Area</span>
                      <span className="result-value">{formatNumber(result.superBuiltUp)} sq ft</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Built-up Area</span>
                      <span className="result-value">{formatNumber(result.builtUp)} sq ft</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Carpet Area (Usable)</span>
                      <span className="result-value highlight">{formatNumber(result.carpetArea)} sq ft</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Space Utilization</span>
                      <span className="result-value" style={{ color: result.utilization >= 65 ? "var(--color-success)" : "var(--color-warning)" }}>
                        {result.utilization.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Price comparison */}
                  <div className="bi-price-compare mt-lg">
                    <h4 style={{ marginBottom: "var(--space-sm)", fontSize: "0.9375rem" }}>
                      Effective Price per sq ft
                    </h4>
                    <div className="bi-price-row">
                      <span>Super Built-up</span>
                      <span>{formatCurrency(result.priceSuperBuiltUp)}/sq ft</span>
                    </div>
                    <div className="bi-price-row">
                      <span>Built-up</span>
                      <span style={{ color: "var(--color-warning)" }}>{formatCurrency(result.priceBuiltUp)}/sq ft</span>
                    </div>
                    <div className="bi-price-row bi-price-row-highlight">
                      <span>Carpet Area (what you use)</span>
                      <span style={{ color: "var(--color-error)" }}>{formatCurrency(result.priceCarpet)}/sq ft</span>
                    </div>
                    <p className="text-muted" style={{ fontSize: "0.8125rem", marginTop: "var(--space-sm)" }}>
                      Total property cost: <strong>{formatCurrency(result.priceSuperBuiltUp * result.superBuiltUp)}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RERA explainer */}
            <div className="card mt-xl" style={{ borderLeft: "4px solid var(--color-success)" }}>
              <h3 style={{ marginBottom: "var(--space-md)" }}>What RERA Says</h3>
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                Under RERA (Real Estate Regulatory Authority), developers in India
                must sell properties based on <strong>carpet area</strong> — the
                net usable floor area excluding walls, balconies, and common areas.
                This protects buyers from inflated &quot;super built-up&quot; figures.
              </p>
              <ul className="text-muted mt-md" style={{ paddingLeft: "var(--space-md)", lineHeight: 2 }}>
                <li><strong>Carpet Area</strong> = Net usable area inside the apartment</li>
                <li><strong>Built-up Area</strong> = Carpet Area + wall thickness + balcony</li>
                <li><strong>Super Built-up Area</strong> = Built-up + proportionate common area (lobby, lift, stairs)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
