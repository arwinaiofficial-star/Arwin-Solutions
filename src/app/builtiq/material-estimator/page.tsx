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

type ConstructionType = "residential" | "commercial" | "industrial";

interface MaterialResult {
  totalArea: number;
  concrete: number;
  steel: number;
  bricks: number;
  cement: number;
  sand: number;
  estimatedCost: number;
}

const coefficients: Record<ConstructionType, {
  concrete: number; steel: number; bricks: number; cement: number; sand: number; costPerSqft: number;
}> = {
  residential: { concrete: 0.038, steel: 4, bricks: 8, cement: 0.4, sand: 0.055, costPerSqft: 1800 },
  commercial:  { concrete: 0.045, steel: 5.5, bricks: 10, cement: 0.5, sand: 0.065, costPerSqft: 2400 },
  industrial:  { concrete: 0.050, steel: 6.5, bricks: 7, cement: 0.45, sand: 0.060, costPerSqft: 2000 },
};

function calculate(areaPerFloor: number, floors: number, type: ConstructionType): MaterialResult {
  const totalArea = areaPerFloor * floors;
  const c = coefficients[type];
  return {
    totalArea,
    concrete: Math.round(totalArea * c.concrete),
    steel: Math.round(totalArea * c.steel),
    bricks: Math.round(totalArea * c.bricks),
    cement: Math.round(totalArea * c.cement),
    sand: Math.round(totalArea * c.sand),
    estimatedCost: Math.round(totalArea * c.costPerSqft),
  };
}

export default function MaterialEstimatorPage() {
  const [area, setArea] = useState(1500);
  const [floors, setFloors] = useState(2);
  const [type, setType] = useState<ConstructionType>("residential");

  const result = useMemo(() => calculate(area, floors, type), [area, floors, type]);

  /* donut data */
  const materialItems = [
    { label: "Concrete", value: result.concrete, unit: "m³", color: "#2563eb" },
    { label: "Steel", value: result.steel, unit: "kg", color: "#f59e0b" },
    { label: "Cement", value: result.cement, unit: "bags", color: "#7c3aed" },
  ];
  const total = materialItems.reduce((s, d) => s + d.value, 0);
  let cumulativePercent = 0;

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
            <h1 className="hero-title">Material Estimator</h1>
            <p className="hero-subtitle">
              Estimate the key construction materials required for your building
              project — concrete, steel, bricks, cement, and sand.
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
                      <span className="slider-label">Built-up Area per Floor</span>
                      <span className="slider-value">{formatNumber(area)} sq ft</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={10000}
                      step={100}
                      value={area}
                      onChange={(e) => setArea(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>500 sq ft</span><span>10,000 sq ft</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">Number of Floors</span>
                      <span className="slider-value">{floors}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={floors}
                      onChange={(e) => setFloors(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>1</span><span>10</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <span className="slider-label">Construction Type</span>
                    <div className="bi-radio-group">
                      {(["residential", "commercial", "industrial"] as ConstructionType[]).map((t) => (
                        <label key={t} className={`bi-radio-pill ${type === t ? "bi-radio-active" : ""}`}>
                          <input
                            type="radio"
                            name="type"
                            value={t}
                            checked={type === t}
                            onChange={() => setType(t)}
                            style={{ display: "none" }}
                          />
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div>
                  <div className="donut-chart">
                    <svg viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="80" fill="none" stroke="var(--color-surface-highlight)" strokeWidth="30" />
                      {materialItems.map((item, i) => {
                        const pct = total > 0 ? (item.value / total) * 100 : 33;
                        const dash = pct * 5.026;
                        const offset = 125.7 - cumulativePercent * 5.026;
                        cumulativePercent += pct;
                        return (
                          <circle
                            key={i}
                            cx="100" cy="100" r="80"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="30"
                            strokeDasharray={`${dash} ${503 - dash}`}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  <div className="chart-legend">
                    {materialItems.map((item, i) => (
                      <div key={i} className="legend-item">
                        <div className="legend-dot" style={{ background: item.color }} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="result-card mt-lg">
                    <div className="result-item">
                      <span className="result-label">Total Built-up Area</span>
                      <span className="result-value highlight">{formatNumber(result.totalArea)} sq ft</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Concrete</span>
                      <span className="result-value">{formatNumber(result.concrete)} m³</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Steel</span>
                      <span className="result-value">{formatNumber(result.steel)} kg</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Bricks</span>
                      <span className="result-value">{formatNumber(result.bricks)} nos</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Cement</span>
                      <span className="result-value">{formatNumber(result.cement)} bags</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Sand</span>
                      <span className="result-value">{formatNumber(result.sand)} m³</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Est. Construction Cost</span>
                      <span className="result-value highlight">{formatCurrency(result.estimatedCost)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card mt-xl">
              <h3 style={{ marginBottom: "var(--space-md)" }}>How Estimation Works</h3>
              <p className="text-muted" style={{ marginBottom: "var(--space-md)" }}>
                Material estimates use industry-standard <strong>thumb rules</strong> widely
                used in Indian construction. Actual quantities depend on structural design,
                soil conditions, and local specifications.
              </p>
              <div style={{
                background: "var(--color-surface-elevated)",
                padding: "var(--space-md)",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: "#f59e0b",
                overflowX: "auto",
              }}>
                Concrete ≈ 0.038 m³/sqft &nbsp;|&nbsp; Steel ≈ 4 kg/sqft &nbsp;|&nbsp; Bricks ≈ 8/sqft (Residential)
              </div>
              <p className="text-muted mt-md" style={{ fontSize: "0.875rem" }}>
                <strong>Note:</strong> These are approximate estimates for planning purposes.
                Always consult a structural engineer for detailed BOQ (Bill of Quantities).
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
