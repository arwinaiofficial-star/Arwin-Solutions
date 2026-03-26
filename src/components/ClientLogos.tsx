"use client";

import Image from "next/image";
import { stats } from "@/lib/content";
import { clientLogos, clientLogoRows, type ClientLogo } from "@/lib/clientLogos";

type MarqueeVariant = "compact" | "detailed";

function LogoCard({
  client,
  variant,
}: {
  client: ClientLogo;
  variant: MarqueeVariant;
}) {
  return (
    <article
      className={`client-logo-card client-logo-card-${variant}`}
      aria-label={client.name}
      data-sector={client.sector.toLowerCase()}
    >
      {variant === "detailed" ? (
        <span className="client-logo-sector">{client.sector}</span>
      ) : null}

      <div className={`client-logo-panel client-logo-panel-${variant}`}>
        <Image
          src={client.image}
          alt={client.name}
          width={220}
          height={110}
          className="client-logo-image"
          style={client.imageScale ? { transform: `scale(${client.imageScale})` } : undefined}
        />
      </div>

      {variant === "compact" ? (
        <div className="client-logo-copy client-logo-copy-compact">
          <span className="client-logo-title client-logo-title-compact">{client.name}</span>
        </div>
      ) : null}

      {variant === "detailed" ? (
        <div className="client-logo-copy">
          <span className="client-logo-title">{client.name}</span>
          <span className="client-logo-subtitle">{client.highlight}</span>
        </div>
      ) : null}
    </article>
  );
}

function LogoTrack({
  logos,
  variant,
  reverse = false,
}: {
  logos: ClientLogo[];
  variant: MarqueeVariant;
  reverse?: boolean;
}) {
  const doubled = [...logos, ...logos];

  return (
    <div className={`client-marquee client-marquee-${variant}`}>
      <div
        className={[
          "client-marquee-track",
          `client-marquee-track-${variant}`,
          reverse ? "client-marquee-track-reverse" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {doubled.map((client, index) => (
          <LogoCard
            key={`${variant}-${reverse ? "r" : "f"}-${client.slug}-${index}`}
            client={client}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}

export function TrustSection() {
  const statItems = [
    { value: `${stats.yearsInBusiness}+`, label: "Years" },
    { value: `${stats.projectsCompleted}+`, label: "Projects" },
    { value: `${stats.solutions}`, label: "Solutions" },
    { value: `${stats.products}`, label: "Products" },
  ];

  return (
    <section className="trust-section">
      <div className="container">
        <div className="trust-stats">
          {statItems.map((item, index) => (
            <div key={index} className="trust-stat">
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

      <LogoTrack logos={clientLogos} variant="compact" />
    </section>
  );
}

export function WorkLogoShowcase() {
  return (
    <div className="work-logo-showcase">
      <LogoTrack logos={clientLogoRows[0]} variant="detailed" />
      <LogoTrack logos={clientLogoRows[1]} variant="detailed" reverse />
    </div>
  );
}

export const ClientLogos = TrustSection;
export const StatsRibbon = () => null;
