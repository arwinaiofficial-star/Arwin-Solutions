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

function calculateEMI(principal: number, rate: number, years: number) {
  const n = years * 12;
  const r = rate / 100 / 12;
  if (r === 0) {
    const emi = principal / n;
    return { emi: Math.round(emi), totalPayment: principal, totalInterest: 0 };
  }
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = Math.round(emi * n);
  return {
    emi: Math.round(emi),
    totalPayment,
    totalInterest: totalPayment - principal,
  };
}

export default function EMICalculatorPage() {
  const [principal, setPrincipal] = useState(3000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const result = useMemo(
    () => calculateEMI(principal, rate, years),
    [principal, rate, years]
  );

  const principalPercent =
    result.totalPayment > 0
      ? (principal / result.totalPayment) * 100
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
            <h1 className="hero-title">EMI Calculator</h1>
            <p className="hero-subtitle">
              Plan your home loan, car loan, or personal loan EMIs with clarity.
              Know exactly what you&apos;ll pay every month.
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
                      <span className="slider-label">Loan Amount</span>
                      <span className="slider-value">
                        {formatCurrency(principal)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={50000000}
                      step={100000}
                      value={principal}
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                    />
                    <div
                      className="flex justify-between text-light"
                      style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                    >
                      <span>₹1L</span>
                      <span>₹5Cr</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">Interest Rate (p.a.)</span>
                      <span className="slider-value">{rate}%</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={0.1}
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                    />
                    <div
                      className="flex justify-between text-light"
                      style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                    >
                      <span>1%</span>
                      <span>20%</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">Loan Tenure</span>
                      <span className="slider-value">{years} years</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                    />
                    <div
                      className="flex justify-between text-light"
                      style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                    >
                      <span>1 yr</span>
                      <span>30 yrs</span>
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
                        strokeDasharray={`${principalPercent * 5.026} ${503 - principalPercent * 5.026}`}
                        strokeDashoffset="125.7"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="var(--color-warning)"
                        strokeWidth="30"
                        strokeDasharray={`${(100 - principalPercent) * 5.026} ${503 - (100 - principalPercent) * 5.026}`}
                        strokeDashoffset={`${125.7 - principalPercent * 5.026}`}
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
                      <span>Principal</span>
                    </div>
                    <div className="legend-item">
                      <div
                        className="legend-dot"
                        style={{ background: "var(--color-warning)" }}
                      />
                      <span>Interest</span>
                    </div>
                  </div>

                  <div className="result-card mt-lg">
                    <div className="result-item">
                      <span className="result-label">Monthly EMI</span>
                      <span className="result-value highlight">
                        {formatCurrency(result.emi)}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Principal Amount</span>
                      <span className="result-value">
                        {formatCurrency(principal)}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Total Interest</span>
                      <span className="result-value">
                        {formatCurrency(result.totalInterest)}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Total Payment</span>
                      <span className="result-value">
                        {formatCurrency(result.totalPayment)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formula */}
            <div className="card mt-xl">
              <h3 style={{ marginBottom: "var(--space-md)" }}>
                How EMI Is Calculated
              </h3>
              <p className="text-muted" style={{ marginBottom: "var(--space-md)" }}>
                EMI is calculated using the <strong>reducing balance method</strong>:
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
                EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
              </div>
              <ul
                className="text-muted mt-md"
                style={{ paddingLeft: "var(--space-md)", lineHeight: 2 }}
              >
                <li>
                  <strong>P</strong> = Loan principal amount
                </li>
                <li>
                  <strong>R</strong> = Monthly interest rate (annual rate / 12)
                </li>
                <li>
                  <strong>N</strong> = Total number of monthly installments
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
