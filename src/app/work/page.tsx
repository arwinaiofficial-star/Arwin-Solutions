import Link from "next/link";
import { recentProjects, legacyProjects, stats } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Explore 26+ digital transformation projects delivered by Arwin AI Solutions across government, education, and enterprise sectors since 2011.",
};

export default function WorkPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center max-w-screen-lg mx-auto">
            <div className="badge mb-md">Portfolio</div>
            <h1 className="hero-title">
              {stats.projectsCompleted}+ Digital Transformations
            </h1>
            <p className="hero-subtitle mx-auto">
              From government portals serving millions to educational platforms transforming
              learning—delivering measurable impact across India's critical sectors since 2011.
            </p>
          </div>

          {/* Impact Stats */}
          <div className="stats-grid mt-xl">
            <div className="stat-card">
              <div className="stat-value">{stats.governmentProjects}+</div>
              <div className="stat-label">Government Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.educationProjects}+</div>
              <div className="stat-label">Education Platforms</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.enterpriseProjects}+</div>
              <div className="stat-label">Enterprise Solutions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.yearsInBusiness}+</div>
              <div className="stat-label">Years of Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects - Post Rebrand */}
      <section className="section">
        <div className="container">
          <div className="mb-xl">
            <div className="badge badge-success mb-md">2025 — Post-Rebrand Era</div>
            <h2 className="mb-md">Latest Success Stories</h2>
            <p className="text-muted" style={{ fontSize: "1.125rem", maxWidth: "800px" }}>
              Recent launches showcasing our AI-powered capabilities, Maya Design System
              integration, and modern development practices.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
            {recentProjects.map((project, index) => (
              <div key={index} className="card">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "var(--space-lg)",
                  }}
                >
                  <div>
                    <div style={{ marginBottom: "var(--space-md)" }}>
                      <span className="badge badge-accent mb-sm">{project.category}</span>
                      <h3 style={{ fontSize: "1.75rem", marginBottom: "var(--space-xs)" }}>
                        {project.name}
                      </h3>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--color-primary)",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        Visit Live Site ↗
                      </a>
                    </div>

                    <p
                      style={{
                        fontSize: "1.125rem",
                        lineHeight: 1.7,
                        color: "var(--color-text-muted)",
                        marginBottom: "var(--space-md)",
                      }}
                    >
                      {project.description}
                    </p>

                    <div style={{ marginBottom: "var(--space-md)" }}>
                      <h4
                        style={{
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          color: "var(--color-text-light)",
                          marginBottom: "var(--space-sm)",
                        }}
                      >
                        Key Features
                      </h4>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                          gap: "var(--space-xs)",
                        }}
                      >
                        {project.features.map((feature, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-xs)",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            <span style={{ color: "var(--color-primary)" }}>✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      style={{
                        background: "var(--color-background-alt)",
                        padding: "var(--space-md)",
                        borderRadius: "var(--radius-md)",
                        borderLeft: "4px solid var(--color-success)",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          color: "var(--color-text-light)",
                          marginBottom: "var(--space-xs)",
                        }}
                      >
                        Outcome
                      </h4>
                      <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                        {project.outcome}
                      </p>
                    </div>

                    <div style={{ marginTop: "var(--space-md)" }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "var(--space-xs)",
                        }}
                      >
                        {project.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: "0.25rem 0.75rem",
                              background: "var(--color-primary-light)",
                              color: "white",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Portfolio */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="mb-xl text-center">
            <div className="badge mb-md">2011–2024 — Legacy Portfolio</div>
            <h2 className="mb-md">{stats.yearsInBusiness} Years of Digital Excellence</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.125rem" }}>
              Foundation projects that established Arwin Solutions as a trusted partner for India's
              government, education, and enterprise sectors.
            </p>
          </div>

          {/* Government Sector */}
          <div style={{ marginBottom: "var(--space-3xl)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-md)",
                marginBottom: "var(--space-lg)",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                G
              </div>
              <div>
                <h3 style={{ marginBottom: "0.25rem" }}>{legacyProjects.government.title}</h3>
                <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                  {legacyProjects.government.count}+ digital transformation projects for public sector
                </p>
              </div>
            </div>
            <div className="grid grid-2">
              {legacyProjects.government.projects.map((project, idx) => (
                <div key={idx} className="card">
                  <h4 style={{ marginBottom: "var(--space-sm)" }}>{project.name}</h4>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: 0, fontSize: "0.95rem" }}>
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Education Sector */}
          <div style={{ marginBottom: "var(--space-3xl)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-md)",
                marginBottom: "var(--space-lg)",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                E
              </div>
              <div>
                <h3 style={{ marginBottom: "0.25rem" }}>{legacyProjects.education.title}</h3>
                <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                  {legacyProjects.education.count}+ institutional and learning platforms
                </p>
              </div>
            </div>
            <div className="grid grid-2">
              {legacyProjects.education.projects.map((project, idx) => (
                <div key={idx} className="card">
                  <h4 style={{ marginBottom: "var(--space-sm)" }}>{project.name}</h4>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: 0, fontSize: "0.95rem" }}>
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Sector */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-md)",
                marginBottom: "var(--space-lg)",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, var(--color-success) 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                B
              </div>
              <div>
                <h3 style={{ marginBottom: "0.25rem" }}>{legacyProjects.enterprise.title}</h3>
                <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                  {legacyProjects.enterprise.count}+ business and community platforms
                </p>
              </div>
            </div>
            <div className="grid grid-2">
              {legacyProjects.enterprise.projects.map((project, idx) => (
                <div key={idx} className="card">
                  <h4 style={{ marginBottom: "var(--space-sm)" }}>{project.name}</h4>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: 0, fontSize: "0.95rem" }}>
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div
            className="card text-center"
            style={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
              border: "none",
              padding: "var(--space-2xl)",
            }}
          >
            <h2 style={{ color: "white", marginBottom: "var(--space-md)" }}>
              Ready to Join Our Success Stories?
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "1.125rem",
                maxWidth: "700px",
                margin: "0 auto var(--space-xl)",
              }}
            >
              Let's discuss how our proven expertise and AI-powered solutions can transform your
              organization.
            </p>
            <div className="flex gap-md justify-center">
              <Link
                href="/enquiry"
                className="btn btn-lg"
                style={{
                  background: "white",
                  color: "var(--color-primary)",
                }}
              >
                Start a Project
              </Link>
              <Link
                href="/about"
                className="btn btn-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "2px solid white",
                }}
              >
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
