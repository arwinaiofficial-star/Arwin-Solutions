"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateSIP(monthly: number, rate: number, years: number) {
  const n = years * 12;
  const i = rate / 100 / 12;
  if (i === 0) {
    return { totalInvested: monthly * n, totalValue: monthly * n, wealthGained: 0 };
  }
  const totalValue = monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const totalInvested = monthly * n;
  return {
    totalInvested,
    totalValue: Math.round(totalValue),
    wealthGained: Math.round(totalValue - totalInvested),
  };
}

export default function SIPCalculatorPage() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(
    () => calculateSIP(monthly, rate, years),
    [monthly, rate, years]
  );

  const investedPercent =
    result.totalValue > 0
      ? (result.totalInvested / result.totalValue) * 100
      : 50;

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="max-w-screen-lg mx-auto">
            <Link
              href="/finlens"
              style={{
                color: "var(--color-text-muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                marginBottom: "var(--space-md)",
                fontWeight: 500,
              }}
            >
              ← Back to FinLens
            </Link>
            <div className="eyebrow mb-sm">FinLens Calculator</div>
            <h1 className="hero-title">SIP Calculator</h1>
            <p className="hero-subtitle">
              Calculate how much your monthly SIP investments can grow over time
              with the power of compounding.
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
                      <span className="slider-label">Monthly Investment</span>
                      <span className="slider-value">
                        {formatCurrency(monthly)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={200000}
                      step={500}
                      value={monthly}
                      onChange={(e) => setMonthly(Number(e.target.value))}
                    />
                    <div
                      className="flex justify-between text-light"
                      style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                    >
                      <span>₹500</span>
                      <span>₹2,00,000</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">
                        Expected Return Rate (p.a.)
                      </span>
                      <span className="slider-value">{rate}%</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={0.5}
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                    />
                    <div
                      className="flex justify-between text-light"
                      style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                    >
                      <span>1%</span>
                      <span>30%</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">Time Period</span>
                      <span className="slider-value">{years} years</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={40}
                      step={1}
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                    />
                    <div
                      className="flex justify-between text-light"
                      style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                    >
                      <span>1 yr</span>
                      <span>40 yrs</span>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div>
                  {/* Donut Chart */}
                  <div className="donut-chart">
                    <svg viewBox="0 0 200 200">
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="var(--color-surface-highlight)"
                        strokeWidth="30"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="30"
                        strokeDasharray={`${investedPercent * 5.026} ${503 - investedPercent * 5.026}`}
                        strokeDashoffset="125.7"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="30"
                        strokeDasharray={`${(100 - investedPercent) * 5.026} ${503 - (100 - investedPercent) * 5.026}`}
                        strokeDashoffset={`${125.7 - investedPercent * 5.026}`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div className="chart-legend">
                    <div className="legend-item">
                      <div
                        className="legend-dot"
                        style={{ background: "var(--color-primary)" }}
                      />
                      <span>Invested</span>
                    </div>
                    <div className="legend-item">
                      <div
                        className="legend-dot"
                        style={{ background: "var(--color-accent)" }}
                      />
                      <span>Returns</span>
                    </div>
                  </div>

                  <div className="result-card mt-lg">
                    <div className="result-item">
                      <span className="result-label">Invested Amount</span>
                      <span className="result-value">
                        {formatCurrency(result.totalInvested)}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Est. Returns</span>
                      <span className="result-value">
                        {formatCurrency(result.wealthGained)}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Total Value</span>
                      <span className="result-value highlight">
                        {formatCurrency(result.totalValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="card mt-xl">
              <h3 style={{ marginBottom: "var(--space-md)" }}>
                How SIP Returns Are Calculated
              </h3>
              <p className="text-muted" style={{ marginBottom: "var(--space-md)" }}>
                SIP returns use the <strong>future value of annuity</strong>{" "}
                formula:
              </p>
              <div
                style={{
                  background: "var(--color-surface-elevated)",
                  padding: "var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.95rem",
                  color: "var(--color-primary-light)",
                  overflowX: "auto",
                }}
              >
                M = P × ((1 + i)^n - 1) / i × (1 + i)
              </div>
              <ul
                className="text-muted mt-md"
                style={{
                  paddingLeft: "var(--space-md)",
                  lineHeight: 2,
                }}
              >
                <li>
                  <strong>M</strong> = Future value of investment
                </li>
                <li>
                  <strong>P</strong> = Monthly investment amount
                </li>
                <li>
                  <strong>i</strong> = Monthly rate of return (annual rate / 12)
                </li>
                <li>
                  <strong>n</strong> = Total number of months
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
