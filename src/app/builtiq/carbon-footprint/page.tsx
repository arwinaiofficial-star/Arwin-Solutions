"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: decimals }).format(value);
}

/* ── Material carbon intensities (kgCO₂e per unit) ── */
const materialData = [
  { key: "concrete", label: "Concrete", unit: "m³", factor: 200, color: "#2563eb", max: 500 },
  { key: "steel", label: "Steel", unit: "tonnes", factor: 1850, color: "#f59e0b", max: 100 },
  { key: "bricks", label: "Bricks", unit: "thousands", factor: 240, color: "#ef4444", max: 200 },
  { key: "glass", label: "Glass", unit: "m²", factor: 25, color: "#10b981", max: 1000 },
  { key: "aluminium", label: "Aluminium", unit: "tonnes", factor: 8240, color: "#7c3aed", max: 50 },
  { key: "timber", label: "Timber", unit: "m³", factor: -460, color: "#22c55e", max: 200 },
] as const;

type MaterialKey = (typeof materialData)[number]["key"];

interface CarbonResult {
  breakdown: { key: string; label: string; value: number; color: string }[];
  totalCarbon: number;
  treesNeeded: number;
  carKmEquivalent: number;
}

function calculateCarbon(quantities: Record<MaterialKey, number>): CarbonResult {
  const breakdown = materialData.map((m) => ({
    key: m.key,
    label: m.label,
    value: Math.round(quantities[m.key] * m.factor),
    color: m.color,
  }));

  const totalCarbon = breakdown.reduce((sum, b) => sum + b.value, 0);
  const treesNeeded = Math.max(0, Math.round(totalCarbon / 22)); // ~22 kgCO2/tree/year
  const carKmEquivalent = Math.max(0, Math.round(totalCarbon / 0.21)); // ~0.21 kgCO2/km

  return { breakdown, totalCarbon, treesNeeded, carKmEquivalent };
}

export default function CarbonFootprintPage() {
  const [quantities, setQuantities] = useState<Record<MaterialKey, number>>({
    concrete: 120,
    steel: 12,
    bricks: 24,
    glass: 100,
    aluminium: 2,
    timber: 15,
  });

  const result = useMemo(() => calculateCarbon(quantities), [quantities]);

  const updateQty = (key: MaterialKey, value: number) =>
    setQuantities((prev) => ({ ...prev, [key]: value }));

  /* Bar chart data */
  const positiveBreakdown = result.breakdown.filter((b) => b.value > 0);
  const maxValue = Math.max(...positiveBreakdown.map((b) => b.value), 1);

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
            <div className="eyebrow mb-sm">BuiltIQ &bull; Sustainability Guide</div>
            <h1 className="hero-title">Embodied Carbon Calculator</h1>
            <p className="hero-subtitle" style={{ maxWidth: 720 }}>
              Estimate the carbon footprint of your building materials and
              discover how much nature needs to offset it.
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
                  {materialData.map((m) => (
                    <div key={m.key} className="slider-group">
                      <div className="slider-header">
                        <span className="slider-label">{m.label}</span>
                        <span className="slider-value">
                          {formatNumber(quantities[m.key])} {m.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={m.max}
                        step={m.max <= 50 ? 1 : m.max <= 200 ? 5 : 10}
                        value={quantities[m.key]}
                        onChange={(e) => updateQty(m.key, Number(e.target.value))}
                      />
                      <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        <span>0</span>
                        <span>{formatNumber(m.max)} {m.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Results */}
                <div>
                  <div
                    className="bi-carbon-display"
                    style={{ borderColor: result.totalCarbon > 0 ? "var(--color-warning)" : "var(--color-success)" }}
                  >
                    <span className="bi-carbon-label">Total Embodied Carbon</span>
                    <span className="bi-carbon-value">
                      {formatNumber(result.totalCarbon / 1000, 1)} tCO₂e
                    </span>
                    <span className="bi-carbon-sub">
                      ({formatNumber(result.totalCarbon)} kgCO₂e)
                    </span>
                  </div>

                  {/* Horizontal bar chart */}
                  <div className="bi-h-bar-chart mt-lg">
                    {result.breakdown.map((b) => (
                      <div key={b.key} className="bi-h-bar-row">
                        <span className="bi-h-bar-label">{b.label}</span>
                        <div className="bi-h-bar-track">
                          <div
                            className="bi-h-bar-fill"
                            style={{
                              width: `${Math.max(0, (b.value / maxValue) * 100)}%`,
                              background: b.value >= 0 ? b.color : "var(--color-success)",
                            }}
                          />
                        </div>
                        <span className="bi-h-bar-value" style={{ color: b.value < 0 ? "var(--color-success)" : "var(--color-text-muted)" }}>
                          {b.value < 0 ? "−" : ""}{formatNumber(Math.abs(b.value))} kg
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Equivalents */}
                  <div className="result-card mt-lg">
                    <div className="result-item">
                      <span className="result-label">Trees Needed to Offset (1 year)</span>
                      <span className="result-value highlight">{formatNumber(result.treesNeeded)} 🌳</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Equivalent Car Travel</span>
                      <span className="result-value">{formatNumber(result.carKmEquivalent)} km 🚗</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carbon factors reference */}
            <div className="card mt-xl">
              <h3 style={{ marginBottom: "var(--space-md)" }}>
                Embodied Carbon Factors Used
              </h3>
              <p className="text-muted" style={{ marginBottom: "var(--space-md)" }}>
                Carbon intensity values based on ICE Database (Inventory of Carbon &amp; Energy)
                and Indian Green Building Council data.
              </p>
              <div className="bi-carbon-table">
                <div className="bi-carbon-table-header">
                  <span>Material</span>
                  <span>Carbon Factor</span>
                  <span>Unit</span>
                </div>
                {materialData.map((m) => (
                  <div key={m.key} className="bi-carbon-table-row">
                    <span style={{ fontWeight: 600 }}>{m.label}</span>
                    <span style={{ color: m.factor < 0 ? "var(--color-success)" : "var(--color-text-muted)" }}>
                      {m.factor < 0 ? `−${Math.abs(m.factor)}` : m.factor} kgCO₂e
                    </span>
                    <span className="text-muted">per {m.unit.replace("tonnes", "tonne")}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted mt-md" style={{ fontSize: "0.8125rem" }}>
                <strong>Note:</strong> Timber has a <strong>negative</strong> carbon factor
                because trees absorb CO₂ during growth. Using sustainably sourced timber
                can significantly reduce your building&apos;s embodied carbon.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
