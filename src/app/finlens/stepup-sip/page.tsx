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

function calculateStepUpSIP(
  monthly: number,
  rate: number,
  years: number,
  stepUp: number
) {
  const monthlyRate = rate / 100 / 12;
  let totalInvested = 0;
  let totalValue = 0;
  let currentMonthly = monthly;

  for (let year = 0; year < years; year++) {
    for (let month = 0; month < 12; month++) {
      totalInvested += currentMonthly;
      totalValue = (totalValue + currentMonthly) * (1 + monthlyRate);
    }
    currentMonthly = Math.round(currentMonthly * (1 + stepUp / 100));
  }

  return {
    totalInvested: Math.round(totalInvested),
    totalValue: Math.round(totalValue),
    wealthGained: Math.round(totalValue - totalInvested),
  };
}

function calculateRegularSIP(monthly: number, rate: number, years: number) {
  const n = years * 12;
  const i = rate / 100 / 12;
  if (i === 0) return monthly * n;
  return Math.round(monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i));
}

export default function StepUpSIPPage() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUp, setStepUp] = useState(10);

  const result = useMemo(
    () => calculateStepUpSIP(monthly, rate, years, stepUp),
    [monthly, rate, years, stepUp]
  );

  const regularSIPValue = useMemo(
    () => calculateRegularSIP(monthly, rate, years),
    [monthly, rate, years]
  );

  const extraWealth = result.totalValue - regularSIPValue;

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
            <h1 className="hero-title">Step-up SIP Calculator</h1>
            <p className="hero-subtitle">
              See how increasing your SIP amount every year can dramatically
              accelerate your wealth creation.
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
                      <span className="slider-label">
                        Starting Monthly Investment
                      </span>
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
                      <span className="slider-label">Annual Step-up</span>
                      <span className="slider-value">{stepUp}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={1}
                      value={stepUp}
                      onChange={(e) => setStepUp(Number(e.target.value))}
                    />
                    <div
                      className="flex justify-between text-light"
                      style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                    >
                      <span>0%</span>
                      <span>50%</span>
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
                      <span className="result-label">Total Invested</span>
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

            {/* Comparison Card */}
            <div
              className="card mt-xl"
              style={{
                borderLeft: "4px solid var(--color-success)",
                background: "var(--color-surface)",
              }}
            >
              <h3 style={{ marginBottom: "var(--space-md)" }}>
                Step-up SIP vs Regular SIP
              </h3>
              <div className="grid grid-3">
                <div>
                  <p
                    className="text-muted"
                    style={{ marginBottom: "var(--space-xs)" }}
                  >
                    Regular SIP Value
                  </p>
                  <p style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                    {formatCurrency(regularSIPValue)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-muted"
                    style={{ marginBottom: "var(--space-xs)" }}
                  >
                    Step-up SIP Value
                  </p>
                  <p
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--color-primary)",
                    }}
                  >
                    {formatCurrency(result.totalValue)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-muted"
                    style={{ marginBottom: "var(--space-xs)" }}
                  >
                    Extra Wealth Created
                  </p>
                  <p
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--color-success)",
                    }}
                  >
                    +{formatCurrency(extraWealth)}
                  </p>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="card mt-xl">
              <h3 style={{ marginBottom: "var(--space-md)" }}>
                How Step-up SIP Works
              </h3>
              <p className="text-muted">
                A Step-up SIP (also called a Top-up SIP) increases your monthly
                investment by a fixed percentage every year. For example, with a
                10% annual step-up on ₹5,000/month — in Year 2 you invest
                ₹5,500/month, Year 3 you invest ₹6,050/month, and so on. This
                keeps pace with salary increments and significantly boosts your
                long-term corpus through higher compounding.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
