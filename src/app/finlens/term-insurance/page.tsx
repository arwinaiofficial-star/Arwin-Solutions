"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

/* ── helpers ── */
function fmt(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtCompact(value: number): string {
  if (value >= 10_000_000)
    return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  if (value >= 100_000)
    return `₹${(value / 100_000).toFixed(2)} L`;
  return fmt(value);
}

/* ── types ── */
interface Phase1Year {
  year: number;
  opening: number;
  investment: number;
  interest: number;
  closing: number;
}

interface Phase2Year {
  year: number;
  opening: number;
  premiumPaid: number;
  afterPremium: number;
  interest: number;
  closing: number;
}

/* ── core calculation ── */
function calculateStrategy(
  annualPremium: number,
  annualInvestment: number,
  returnRate: number,
  investYears: number,
  totalPremiumYears: number
) {
  const rate = returnRate / 100;

  // Phase 1: Build corpus
  const phase1: Phase1Year[] = [];
  let corpus = 0;
  for (let yr = 1; yr <= investYears; yr++) {
    const opening = corpus;
    const newCorpus = (corpus + annualInvestment) * (1 + rate);
    const interest = newCorpus - opening - annualInvestment;
    phase1.push({
      year: yr,
      opening,
      investment: annualInvestment,
      interest,
      closing: newCorpus,
    });
    corpus = newCorpus;
  }

  const peakCorpus = corpus;

  // Phase 2: Corpus pays premium
  const phase2: Phase2Year[] = [];
  let sustainable = true;
  for (let yr = investYears + 1; yr <= totalPremiumYears; yr++) {
    const opening = corpus;
    const afterPremium = corpus - annualPremium;
    if (afterPremium < 0) {
      sustainable = false;
      phase2.push({
        year: yr,
        opening,
        premiumPaid: annualPremium,
        afterPremium,
        interest: 0,
        closing: 0,
      });
      corpus = 0;
      break;
    }
    const interest = afterPremium * rate;
    corpus = afterPremium + interest;
    phase2.push({
      year: yr,
      opening,
      premiumPaid: annualPremium,
      afterPremium,
      interest,
      closing: corpus,
    });
  }

  const totalInvested = annualInvestment * investYears;
  const totalPremiumWithout = annualPremium * totalPremiumYears;
  const totalOutOfPocket =
    annualPremium * investYears + annualInvestment * investYears;
  const totalSaved = totalPremiumWithout - totalOutOfPocket;

  return {
    phase1,
    phase2,
    totalInvested,
    totalPremiumWithout,
    totalOutOfPocket,
    totalSaved,
    remainingCorpus: corpus,
    peakCorpus,
    premiumsCovered: phase2.filter((p) => p.closing >= 0).length,
    sustainable,
    freeYears: totalPremiumYears - investYears,
  };
}

/* ═══════════════ PAGE ═══════════════ */
export default function TermInsurancePage() {
  const [premium, setPremium] = useState(59416);
  const [investment, setInvestment] = useState(40000);
  const [rate, setRate] = useState(9);
  const [investYears, setInvestYears] = useState(10);
  const [totalYears, setTotalYears] = useState(32);
  const [activeTab, setActiveTab] = useState<"phase1" | "phase2">("phase1");

  const r = useMemo(
    () => calculateStrategy(premium, investment, rate, investYears, totalYears),
    [premium, investment, rate, investYears, totalYears]
  );

  /* chart data */
  const allYears = [
    ...r.phase1.map((y) => ({ year: y.year, corpus: y.closing, phase: 1 as const })),
    ...r.phase2.map((y) => ({ year: y.year, corpus: y.closing, phase: 2 as const })),
  ];
  const maxCorpus = Math.max(...allYears.map((y) => y.corpus), 1);

  /* svg chart dimensions */
  const chartW = 800;
  const chartH = 280;
  const padL = 70;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const barGap = 2;
  const barW = Math.max(
    4,
    (plotW - barGap * allYears.length) / allYears.length
  );

  /* y-axis grid */
  const yTicks = 5;
  const yStep = maxCorpus / yTicks;

  return (
    <>
      {/* ── HERO ── */}
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
            <div className="eyebrow mb-sm">FinLens &bull; Complete Guide</div>
            <h1 className="hero-title">
              The Self-Paying Term Insurance Strategy
            </h1>
            <p className="hero-subtitle" style={{ maxWidth: 720 }}>
              What if you could stop paying your term insurance premium after 10
              years&nbsp;&mdash; and let your investments cover the rest?
              <br />
              <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
                Spoiler: You absolutely can.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ── THE CONCEPT ── */}
      <section
        className="section"
        style={{ background: "var(--color-background-alt)" }}
      >
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">How It Works</div>
            <h2>The Strategy in 3 Steps</h2>
            <p
              className="text-muted"
              style={{ maxWidth: 640, margin: "0 auto", fontSize: "1.0625rem" }}
            >
              Pay your premium + invest a small amount each year. After a few
              years, your investment generates enough to pay the premium itself.
            </p>
          </div>

          <div className="ti-steps-grid">
            {/* Step 1 */}
            <div className="ti-step-card">
              <div className="ti-step-number" style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-light)" }}>1</div>
              <h3 className="ti-step-title">Invest Alongside</h3>
              <p className="ti-step-desc">
                For the first <strong>{investYears} years</strong>, pay your term
                insurance premium <em>and</em> invest{" "}
                <strong>{fmt(investment)}/year</strong> in a disciplined plan
                earning ~{rate}% annual returns.
              </p>
            </div>
            {/* Step 2 */}
            <div className="ti-step-card">
              <div className="ti-step-number" style={{ background: "var(--color-success-subtle)", color: "var(--color-success)" }}>2</div>
              <h3 className="ti-step-title">Corpus Builds Up</h3>
              <p className="ti-step-desc">
                Thanks to the power of compounding, after {investYears} years
                your corpus grows to{" "}
                <strong>{fmtCompact(r.peakCorpus)}</strong>. This is the engine
                that will now work for you.
              </p>
            </div>
            {/* Step 3 */}
            <div className="ti-step-card">
              <div className="ti-step-number" style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent-light)" }}>3</div>
              <h3 className="ti-step-title">Premium on Autopilot</h3>
              <p className="ti-step-desc">
                From year {investYears + 1} onwards, you withdraw{" "}
                <strong>{fmt(premium)}/year</strong> from the corpus to pay the
                premium. {r.sustainable
                  ? `After ${totalYears} years you still have ${fmtCompact(r.remainingCorpus)} left!`
                  : "Adjust the inputs to make this sustainable."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE CALCULATOR ── */}
      <section className="section">
        <div className="container">
          <div className="ti-calc-wrap">
            <div className="text-center mb-xl">
              <div className="eyebrow mb-sm">Interactive Calculator</div>
              <h2>Configure Your Strategy</h2>
              <p className="text-muted" style={{ fontSize: "1.0625rem" }}>
                Adjust the numbers to match your plan and see how the math works out.
              </p>
            </div>

            <div className="calculator-card">
              <div className="ti-calc-grid">
                {/* ── Inputs ── */}
                <div>
                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">Annual Premium</span>
                      <span className="slider-value">{fmt(premium)}</span>
                    </div>
                    <input
                      type="range"
                      min={5000}
                      max={200000}
                      step={1000}
                      value={premium}
                      onChange={(e) => setPremium(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>₹5,000</span>
                      <span>₹2,00,000</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">
                        Yearly Investment (Parallel)
                      </span>
                      <span className="slider-value">{fmt(investment)}</span>
                    </div>
                    <input
                      type="range"
                      min={5000}
                      max={200000}
                      step={1000}
                      value={investment}
                      onChange={(e) => setInvestment(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>₹5,000</span>
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
                      min={4}
                      max={18}
                      step={0.5}
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>4%</span>
                      <span>18%</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">
                        Investment Period (Years)
                      </span>
                      <span className="slider-value">{investYears} yrs</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={20}
                      step={1}
                      value={investYears}
                      onChange={(e) => setInvestYears(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>3 yrs</span>
                      <span>20 yrs</span>
                    </div>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">
                        Total Premium Payment Term
                      </span>
                      <span className="slider-value">{totalYears} yrs</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      step={1}
                      value={totalYears}
                      onChange={(e) => setTotalYears(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-light" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      <span>10 yrs</span>
                      <span>50 yrs</span>
                    </div>
                  </div>
                </div>

                {/* ── Results ── */}
                <div>
                  <div className="ti-yearly-cost">
                    <span className="ti-yearly-label">
                      Your total yearly outgo (Years 1–{investYears})
                    </span>
                    <span className="ti-yearly-amount">
                      {fmt(premium + investment)}
                      <span className="ti-yearly-sub">/year</span>
                    </span>
                    <div className="ti-yearly-breakdown">
                      <span>Premium: {fmt(premium)}</span>
                      <span style={{ color: "var(--color-success)" }}>
                        + Investment: {fmt(investment)}
                      </span>
                    </div>
                  </div>

                  <div className="ti-result-status">
                    {r.sustainable ? (
                      <div className="ti-status-badge ti-status-success">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Strategy Sustainable
                      </div>
                    ) : (
                      <div className="ti-status-badge ti-status-warning">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <circle cx="12" cy="17" r="0.5" fill="currentColor" />
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        Corpus Depletes Early — Adjust Inputs
                      </div>
                    )}
                  </div>

                  <div className="result-card">
                    <div className="result-item">
                      <span className="result-label">
                        Corpus Built (After Yr {investYears})
                      </span>
                      <span className="result-value highlight">
                        {fmt(Math.round(r.peakCorpus))}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Total You Invested</span>
                      <span className="result-value">
                        {fmt(r.totalInvested)}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">
                        Premiums Covered by Corpus
                      </span>
                      <span className="result-value">
                        {r.premiumsCovered} years
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">
                        Remaining Corpus (End)
                      </span>
                      <span
                        className="result-value"
                        style={{
                          color: r.remainingCorpus > 0
                            ? "var(--color-success)"
                            : "var(--color-error)",
                        }}
                      >
                        {fmt(Math.round(r.remainingCorpus))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section
        className="section"
        style={{ background: "var(--color-background-alt)" }}
      >
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">The Difference</div>
            <h2>Without Strategy vs With Strategy</h2>
          </div>

          <div className="ti-compare-grid">
            {/* Without */}
            <div className="ti-compare-card">
              <div className="ti-compare-header" style={{ borderColor: "var(--color-error)" }}>
                <span className="ti-compare-tag" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
                  Without Strategy
                </span>
              </div>
              <div className="ti-compare-body">
                <div className="ti-compare-row">
                  <span>Yearly premium</span>
                  <span>{fmt(premium)}</span>
                </div>
                <div className="ti-compare-row">
                  <span>Payment for</span>
                  <span>{totalYears} years</span>
                </div>
                <div className="ti-compare-row ti-compare-total" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
                  <span>Total out-of-pocket</span>
                  <span style={{ color: "#f87171" }}>
                    {fmt(r.totalPremiumWithout)}
                  </span>
                </div>
                <div className="ti-compare-row">
                  <span>Leftover corpus</span>
                  <span>₹0</span>
                </div>
              </div>
            </div>

            {/* With */}
            <div className="ti-compare-card ti-compare-card--highlight">
              <div className="ti-compare-header" style={{ borderColor: "var(--color-success)" }}>
                <span className="ti-compare-tag" style={{ background: "var(--color-success-subtle)", color: "var(--color-success)" }}>
                  With Strategy ✦
                </span>
              </div>
              <div className="ti-compare-body">
                <div className="ti-compare-row">
                  <span>Yearly outgo (Yrs 1–{investYears})</span>
                  <span>{fmt(premium + investment)}</span>
                </div>
                <div className="ti-compare-row">
                  <span>Pay from pocket for</span>
                  <span>{investYears} years only</span>
                </div>
                <div className="ti-compare-row ti-compare-total" style={{ borderColor: "rgba(16,185,129,0.3)" }}>
                  <span>Total out-of-pocket</span>
                  <span style={{ color: "var(--color-success)" }}>
                    {fmt(r.totalOutOfPocket)}
                  </span>
                </div>
                <div className="ti-compare-row">
                  <span>Leftover corpus</span>
                  <span style={{ color: "var(--color-success)" }}>
                    {fmt(Math.round(r.remainingCorpus))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings highlight */}
          <div className="ti-savings-banner">
            <div className="ti-savings-inner">
              <span className="ti-savings-label">Total Money Saved</span>
              <span className="ti-savings-value">
                {fmt(Math.round(r.totalSaved))}
              </span>
              <span className="ti-savings-note">
                + {fmtCompact(r.remainingCorpus)} remaining corpus
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORPUS JOURNEY CHART ── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Visual Breakdown</div>
            <h2>Your Corpus Journey</h2>
            <p className="text-muted" style={{ fontSize: "1.0625rem" }}>
              Watch the corpus grow during the investment phase, then sustain
              itself while paying your premiums.
            </p>
          </div>

          <div className="ti-chart-wrap">
            <div className="ti-chart-scroll">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="ti-chart-svg"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* grid lines */}
                {Array.from({ length: yTicks + 1 }).map((_, i) => {
                  const y = padT + plotH - (i / yTicks) * plotH;
                  const val = yStep * i;
                  return (
                    <g key={`grid-${i}`}>
                      <line
                        x1={padL}
                        y1={y}
                        x2={chartW - padR}
                        y2={y}
                        stroke="var(--color-border)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padL - 8}
                        y={y + 4}
                        textAnchor="end"
                        fill="var(--color-text-muted)"
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                      >
                        {fmtCompact(Math.round(val))}
                      </text>
                    </g>
                  );
                })}

                {/* bars */}
                {allYears.map((d, i) => {
                  const x = padL + i * (barW + barGap);
                  const h = (d.corpus / maxCorpus) * plotH;
                  const y = padT + plotH - h;
                  const color =
                    d.phase === 1
                      ? "var(--color-primary)"
                      : "var(--color-success)";
                  return (
                    <g key={`bar-${d.year}`}>
                      <rect
                        x={x}
                        y={y}
                        width={barW}
                        height={h}
                        rx={2}
                        fill={color}
                        opacity={0.85}
                      >
                        <title>{`Year ${d.year}: ${fmt(Math.round(d.corpus))}`}</title>
                      </rect>
                      {/* x-axis labels - show every Nth */}
                      {(d.year === 1 ||
                        d.year === investYears ||
                        d.year === totalYears ||
                        d.year % 5 === 0) && (
                        <text
                          x={x + barW / 2}
                          y={chartH - 8}
                          textAnchor="middle"
                          fill="var(--color-text-muted)"
                          fontSize="10"
                          fontFamily="var(--font-mono)"
                        >
                          {d.year}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* phase divider line */}
                {investYears < totalYears && (
                  <line
                    x1={padL + investYears * (barW + barGap) - barGap / 2}
                    y1={padT}
                    x2={padL + investYears * (barW + barGap) - barGap / 2}
                    y2={padT + plotH}
                    stroke="var(--color-warning)"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                )}

                {/* x-axis label */}
                <text
                  x={chartW / 2}
                  y={chartH}
                  textAnchor="middle"
                  fill="var(--color-text-muted)"
                  fontSize="11"
                >
                  Year →
                </text>
              </svg>
            </div>

            {/* chart legend */}
            <div className="chart-legend" style={{ marginTop: "var(--space-md)" }}>
              <div className="legend-item">
                <div
                  className="legend-dot"
                  style={{ background: "var(--color-primary)" }}
                />
                <span>Phase 1 — Investment Period</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-dot"
                  style={{ background: "var(--color-success)" }}
                />
                <span>Phase 2 — Corpus Pays Premium</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-dot"
                  style={{
                    background: "var(--color-warning)",
                    width: 16,
                    height: 2,
                    borderRadius: 1,
                  }}
                />
                <span>Transition Point</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── YEAR-BY-YEAR TABLE ── */}
      <section
        className="section"
        style={{ background: "var(--color-background-alt)" }}
      >
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Detailed Breakdown</div>
            <h2>Year-by-Year Numbers</h2>
          </div>

          <div className="ti-table-wrap">
            {/* tab buttons */}
            <div className="ti-tabs">
              <button
                className={`ti-tab ${activeTab === "phase1" ? "ti-tab--active" : ""}`}
                onClick={() => setActiveTab("phase1")}
              >
                Phase 1 — Building Corpus
                <span className="ti-tab-badge">Yrs 1–{investYears}</span>
              </button>
              <button
                className={`ti-tab ${activeTab === "phase2" ? "ti-tab--active" : ""}`}
                onClick={() => setActiveTab("phase2")}
              >
                Phase 2 — Corpus Pays Premium
                <span className="ti-tab-badge">
                  Yrs {investYears + 1}–{totalYears}
                </span>
              </button>
            </div>

            {/* Phase 1 table */}
            {activeTab === "phase1" && (
              <div className="ti-table-scroll">
                <table className="ti-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Opening Balance</th>
                      <th>Investment</th>
                      <th>Interest Earned</th>
                      <th>Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.phase1.map((row) => (
                      <tr key={row.year}>
                        <td className="ti-td-year">{row.year}</td>
                        <td>{fmt(Math.round(row.opening))}</td>
                        <td style={{ color: "var(--color-success)" }}>
                          +{fmt(row.investment)}
                        </td>
                        <td style={{ color: "var(--color-primary-light)" }}>
                          +{fmt(Math.round(row.interest))}
                        </td>
                        <td className="ti-td-closing">
                          {fmt(Math.round(row.closing))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td></td>
                      <td style={{ color: "var(--color-success)" }}>
                        {fmt(r.totalInvested)}
                      </td>
                      <td style={{ color: "var(--color-primary-light)" }}>
                        {fmt(
                          Math.round(
                            r.phase1.reduce((s, row) => s + row.interest, 0)
                          )
                        )}
                      </td>
                      <td className="ti-td-closing">
                        {fmt(Math.round(r.peakCorpus))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Phase 2 table */}
            {activeTab === "phase2" && (
              <div className="ti-table-scroll">
                <table className="ti-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Opening Balance</th>
                      <th>Premium Paid</th>
                      <th>After Premium</th>
                      <th>Interest Earned</th>
                      <th>Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.phase2.map((row) => (
                      <tr
                        key={row.year}
                        style={
                          row.closing <= 0
                            ? { background: "rgba(239,68,68,0.08)" }
                            : undefined
                        }
                      >
                        <td className="ti-td-year">{row.year}</td>
                        <td>{fmt(Math.round(row.opening))}</td>
                        <td style={{ color: "#f87171" }}>
                          −{fmt(row.premiumPaid)}
                        </td>
                        <td>{fmt(Math.round(row.afterPremium))}</td>
                        <td style={{ color: "var(--color-primary-light)" }}>
                          +{fmt(Math.round(row.interest))}
                        </td>
                        <td className="ti-td-closing">
                          {fmt(Math.round(row.closing))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td></td>
                      <td style={{ color: "#f87171" }}>
                        {fmt(
                          r.phase2.reduce((s, row) => s + row.premiumPaid, 0)
                        )}
                      </td>
                      <td></td>
                      <td style={{ color: "var(--color-primary-light)" }}>
                        {fmt(
                          Math.round(
                            r.phase2.reduce((s, row) => s + row.interest, 0)
                          )
                        )}
                      </td>
                      <td className="ti-td-closing">
                        {fmt(Math.round(r.remainingCorpus))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── KEY TAKEAWAYS ── */}
      <section className="section">
        <div className="container">
          <div className="ti-takeaway-wrap">
            <div className="text-center mb-xl">
              <div className="eyebrow mb-sm">Insights</div>
              <h2>Key Takeaways</h2>
            </div>

            <div className="ti-insights-grid">
              <div className="ti-insight-card">
                <div className="ti-insight-icon" style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-light)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                </div>
                <h4>Invest Just {fmtCompact(r.totalInvested)} Over {investYears} Years</h4>
                <p className="text-muted">
                  A disciplined investment of {fmt(investment)}/year for{" "}
                  {investYears} years is all it takes to set the engine in motion.
                </p>
              </div>

              <div className="ti-insight-card">
                <div className="ti-insight-icon" style={{ background: "var(--color-success-subtle)", color: "var(--color-success)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                </div>
                <h4>Compounding Does the Heavy Lifting</h4>
                <p className="text-muted">
                  At {rate}% returns, your {fmtCompact(r.totalInvested)} grows to{" "}
                  {fmtCompact(r.peakCorpus)} — that&apos;s{" "}
                  {fmtCompact(r.peakCorpus - r.totalInvested)} in pure returns.
                </p>
              </div>

              <div className="ti-insight-card">
                <div className="ti-insight-icon" style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent-light)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <h4>{r.freeYears} Years of Free Coverage</h4>
                <p className="text-muted">
                  From year {investYears + 1} to year {totalYears}, your
                  investment pays {fmt(premium)}/year premium without you
                  spending a rupee.
                </p>
              </div>

              <div className="ti-insight-card">
                <div className="ti-insight-icon" style={{ background: "rgba(249,115,22,0.12)", color: "#fb923c" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M16 8l-8 8M8 8l8 8" /></svg>
                </div>
                <h4>Save {fmtCompact(r.totalSaved)} Overall</h4>
                <p className="text-muted">
                  Instead of paying {fmtCompact(r.totalPremiumWithout)} over{" "}
                  {totalYears} years, you only spend{" "}
                  {fmtCompact(r.totalOutOfPocket)} from your pocket. Plus keep{" "}
                  {fmtCompact(r.remainingCorpus)}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="ti-disclaimer">
            <p>
              <strong>Disclaimer:</strong> This is a mathematical illustration,
              not financial advice. Actual market returns vary and past
              performance is not indicative of future results. Term insurance
              premiums may change based on your provider&apos;s terms. Consult a
              certified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
