import Link from "next/link";
import { homeContent } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center">
            {/* <div className="badge mb-md">{homeContent.hero.badge}</div> */}
            <h1 className="hero-title">{homeContent.hero.title}</h1>
            <p className="hero-subtitle mx-auto mb-xl">
              {homeContent.hero.subtitle}
            </p>
            <div className="flex gap-md justify-center mb-xl">
              <Link href="/work" className="btn btn-primary btn-lg">
                View Our Work
              </Link>
              <Link href="/enquiry" className="btn btn-outline btn-lg">
                Start a Project
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {homeContent.hero.stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-detail">{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section">
        <div className="container">
          <div className="max-w-screen-md mx-auto text-center">
            <h2 className="mb-md">{homeContent.philosophy.title}</h2>
            <p className="text-muted" style={{ fontSize: "1.125rem", lineHeight: 1.8 }}>
              {homeContent.philosophy.description}
            </p>
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="text-center mb-xl">
            {/* <div className="badge badge-accent mb-md">Our AI Pillars</div> */}
            <h2 className="mb-md">Three Pillars Powering Our AI Transformation</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.125rem" }}>
              Discover our ecosystem of AI-enabled products and platforms designed to solve real-world challenges.
            </p>
          </div>

          <div className="grid grid-3">
            {homeContent.pillars.map((pillar, index) => (
              <div key={index} className="card">
                <div className="mb-md">
                  {/* <span className="badge badge-success mb-sm">{pillar.phase}</span> */}
                  <h3 className="card-title">{pillar.name}</h3>
                  <p style={{ color: "var(--color-accent)", fontWeight: 600, marginBottom: "var(--space-sm)" }}>
                    {pillar.tagline}
                  </p>
                </div>
                <p className="card-description mb-md">{pillar.description}</p>
                
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "var(--space-lg)" }}>
                  {pillar.features.map((feature, idx) => (
                    <li
                      key={idx}
                      style={{
                        padding: "var(--space-xs) 0",
                        color: "var(--color-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-xs)",
                      }}
                    >
                      <span style={{ color: "var(--color-primary)" }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {pillar.external ? (
                  <a
                    href={pillar.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                  >
                    Visit {pillar.name} ↗
                  </a>
                ) : (
                  <Link href={pillar.url} className="btn btn-primary" style={{ width: "100%" }}>
                    Explore {pillar.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div
            className="card text-center"
            style={{
              background: "var(--color-primary)",
              border: "none",
              padding: "var(--space-2xl)",
            }}
          >
            <h2 style={{ color: "white", marginBottom: "var(--space-md)" }}>
              Ready to Transform Your Business?
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "clamp(1rem, 2vw, 1.125rem)",
                maxWidth: "700px",
                margin: "0 auto var(--space-xl)",
              }}
            >
              Let&apos;s discuss how our AI-enabled solutions can help solve your real-life challenges.
              From government portals to educational platforms and enterprise solutions, we&apos;ve
              delivered excellence for 14+ years.
            </p>
            <div className="flex gap-md justify-center" style={{ flexWrap: "wrap" }}>
              <Link
                href="/contact"
                className="btn btn-lg"
                style={{
                  background: "white",
                  color: "var(--color-primary)",
                }}
              >
                Contact Us
              </Link>
              <Link
                href="/work"
                className="btn btn-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "2px solid white",
                }}
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
