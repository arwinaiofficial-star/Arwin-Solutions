"use client";

import { stats } from "@/lib/content";

const clients = [
  { name: "Indian Railways", abbr: "IR" },
  { name: "NTPC", abbr: "NTPC" },
  { name: "NIC", abbr: "NIC" },
  { name: "TTD", abbr: "TTD" },
  { name: "CBIT", abbr: "CBIT" },
  { name: "Geetanjali", abbr: "GJ" },
  { name: "KV Schools", abbr: "KV" },
  { name: "SVP", abbr: "SVP" },
];

function LogoPlaceholder({ abbr, name }: { abbr: string; name: string }) {
  return (
    <div className="client-logo" aria-label={name}>
      <div className="client-logo-mark">{abbr}</div>
      <span className="client-logo-name">{name}</span>
    </div>
  );
}

export function TrustSection() {
  const doubled = [...clients, ...clients];

  const statItems = [
    { value: `${stats.yearsInBusiness}+`, label: "Years" },
    { value: `${stats.projectsCompleted}+`, label: "Projects" },
    { value: `${stats.solutions}`, label: "Solutions" },
    { value: `${stats.products}`, label: "Products" },
  ];

  return (
    <section className="trust-section">
      <div className="container">
        {/* Inline stats row */}
        <div className="trust-stats">
          {statItems.map((item, i) => (
            <div key={i} className="trust-stat">
              <span className="trust-stat-value">{item.value}</span>
              <span className="trust-stat-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="trust-divider" />

        <p className="trust-heading">
          Trusted by Government, Education &amp; Enterprise across India
        </p>
      </div>

      {/* Logo marquee */}
      <div className="logo-marquee">
        <div className="logo-marquee-track">
          {doubled.map((c, i) => (
            <LogoPlaceholder key={i} abbr={c.abbr} name={c.name} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* Keep these as named re-exports for backward compat if used elsewhere */
export const ClientLogos = TrustSection;
export const StatsRibbon = () => null;
