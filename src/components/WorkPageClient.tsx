"use client";

import Link from "next/link";
import { recentProjects, legacyProjects, stats } from "@/lib/content";
import {
  GovernmentIcon,
  EducationIcon,
  EnterpriseIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  ArrowRightIcon,
  SparklesIcon,
  ForgeIcon,
} from "@/components/icons/SiteIcons";

/* Flatten all legacy projects with sector metadata for the scrolling showcase */
const allProjects = [
  ...legacyProjects.government.projects.map((p) => ({ ...p, sector: "Government", color: "#2563eb" })),
  ...legacyProjects.education.projects.map((p) => ({ ...p, sector: "Education", color: "#10b981" })),
  ...legacyProjects.enterprise.projects.map((p) => ({ ...p, sector: "Enterprise", color: "#7c3aed" })),
];

export default function WorkPageClient() {
  /* Double the array for seamless infinite scroll */
  const doubled = [...allProjects, ...allProjects];

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="text-center max-w-screen-lg mx-auto">
            <div className="badge mb-md" style={{ margin: "0 auto var(--space-md)" }}>
              <ForgeIcon size={14} /> Arwin Forge — Portfolio
            </div>
            <h1 className="hero-title">
              {stats.projectsCompleted}+ Digital Transformations
            </h1>
            <p className="hero-subtitle mx-auto">
              From government portals serving millions to educational platforms transforming
              learning — Arwin Forge delivers measurable impact across India&apos;s critical sectors since 2011.
            </p>
          </div>

          <div className="stats-grid mt-xl">
            {[
              { icon: GovernmentIcon, color: "#2563eb", value: `${stats.governmentProjects}+`, label: "Government" },
              { icon: EducationIcon, color: "#10b981", value: `${stats.educationProjects}+`, label: "Education" },
              { icon: EnterpriseIcon, color: "#7c3aed", value: `${stats.enterpriseProjects}+`, label: "Enterprise" },
              { icon: ForgeIcon, color: "#f59e0b", value: `${stats.yearsInBusiness}+`, label: "Years" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: `${s.color}14`, border: `1px solid ${s.color}25`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-xs)" }}>
                  <s.icon size={18} color={s.color} />
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Projects — Featured */}
      <section className="section">
        <div className="container">
          <div className="mb-xl">
            <div className="eyebrow mb-sm">Featured Work</div>
            <h2>Latest Success Stories</h2>
            <p className="text-muted" style={{ fontSize: "1.0625rem", maxWidth: "700px" }}>
              Recent Arwin Forge launches showcasing AI-powered capabilities and modern development practices.
            </p>
          </div>

          <div className="grid grid-2">
            {recentProjects.map((project, index) => (
              <div key={index} className="project-card">
                <div className="project-card-image">
                  <div className="browser-chrome">
                    <span className="browser-dot" />
                    <span className="browser-dot" />
                    <span className="browser-dot" />
                    <span className="browser-url">{project.url.replace(/^https?:\/\//, '')}</span>
                  </div>
                  <img src={project.image} alt={project.name} className="project-card-img" />
                </div>
                <div className="project-card-body">
                  <div style={{ marginBottom: "var(--space-sm)" }}>
                    <span className="badge badge-accent" style={{ marginBottom: "var(--space-xs)" }}>{project.category}</span>
                    <h3 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{project.name}</h3>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--color-primary-light)", fontWeight: 500, fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                    >
                      Visit Live <ExternalLinkIcon size={14} />
                    </a>
                  </div>

                  <p className="card-description mb-md" style={{ fontSize: "0.9375rem" }}>{project.description}</p>

                  <ul className="feature-list mb-md">
                    {project.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} style={{ fontSize: "0.875rem" }}>
                        <CheckCircleIcon size={14} color="var(--color-success)" className="feature-icon" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div style={{ background: "var(--color-surface-elevated)", padding: "var(--space-sm)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-md)" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "var(--color-text-light)", marginBottom: "0.25rem" }}>Outcome</div>
                    <p style={{ color: "var(--color-text-muted)", marginBottom: 0, fontSize: "0.875rem" }}>{project.outcome}</p>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.375rem", marginTop: "auto" }}>
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Portfolio — Scrolling Showcase */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="mb-xl text-center">
            <div className="eyebrow mb-sm">Legacy Portfolio</div>
            <h2>{stats.yearsInBusiness} Years of Digital Excellence</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Foundation projects that established Arwin Forge as a trusted partner across India&apos;s critical sectors.
            </p>
          </div>

          {/* Sector legend */}
          <div className="project-scroll-legend">
            {[
              { label: "Government", color: "#2563eb", count: stats.governmentProjects },
              { label: "Education", color: "#10b981", count: stats.educationProjects },
              { label: "Enterprise", color: "#7c3aed", count: stats.enterpriseProjects },
            ].map((s) => (
              <span key={s.label} className="project-scroll-legend-item">
                <span className="project-scroll-legend-dot" style={{ background: s.color }} />
                {s.label} ({s.count})
              </span>
            ))}
          </div>
        </div>

        {/* Scrolling project cards — row 1 (left to right) */}
        <div className="project-marquee">
          <div className="project-marquee-track">
            {doubled.map((p, i) => (
              <div key={`a-${i}`} className="project-scroll-card">
                <div className="project-scroll-stripe" style={{ background: p.color }} />
                <span className="project-scroll-sector" style={{ color: p.color }}>{p.sector}</span>
                <h4 className="project-scroll-name">{p.name}</h4>
                <p className="project-scroll-desc">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scrolling project cards — row 2 (right to left, offset) */}
        <div className="project-marquee">
          <div className="project-marquee-track project-marquee-reverse">
            {[...doubled].reverse().map((p, i) => (
              <div key={`b-${i}`} className="project-scroll-card">
                <div className="project-scroll-stripe" style={{ background: p.color }} />
                <span className="project-scroll-sector" style={{ color: p.color }}>{p.sector}</span>
                <h4 className="project-scroll-name">{p.name}</h4>
                <p className="project-scroll-desc">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <SparklesIcon size={32} color="var(--color-primary-light)" />
            <h2 style={{ marginTop: "var(--space-md)", marginBottom: "var(--space-md)" }}>
              Interested in Partnerships? Contact the Founder.
            </h2>
            <p className="text-muted" style={{ fontSize: "1.0625rem", maxWidth: "640px", margin: "0 auto var(--space-xl)" }}>
              15+ years of proven expertise. Let&apos;s discuss how Arwin Forge can support your goals.
            </p>
            <div className="flex gap-md justify-center" style={{ flexWrap: "wrap" }}>
              <Link href="/contact?intent=partnership" className="btn btn-primary btn-lg">
                Contact the Founder
                <ArrowRightIcon size={18} />
              </Link>
              <Link href="/about" className="btn btn-outline btn-lg">
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
