"use client";

import { useState } from "react";
import Link from "next/link";
import { recentProjects, stats } from "@/lib/content";
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
import { WorkLogoShowcase } from "@/components/ClientLogos";

function ProjectPreview({
  image,
  index,
  name,
  previewUrl,
}: {
  image: string;
  index: number;
  name: string;
  previewUrl?: string;
}) {
  if (!previewUrl) {
    return <img src={image} alt={name} className="project-card-img" />;
  }

  return (
    <div className="project-live-preview" aria-hidden="true">
      <iframe
        src={previewUrl}
        title={`${name} live website preview`}
        className="project-live-preview-frame"
        loading={index === 0 ? "eager" : "lazy"}
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin"
        scrolling="no"
        tabIndex={-1}
      />
    </div>
  );
}

export default function WorkPageClient() {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const activeProject = recentProjects[activeProjectIndex] ?? recentProjects[0];

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

          <div className="success-story-browser">
            <div className="success-story-nav-wrap">
              <div className="success-story-nav" aria-label="Select a success story">
                {recentProjects.map((project, index) => {
                  const isActive = index === activeProjectIndex;

                  return (
                    <button
                      key={project.url}
                      type="button"
                      className={`success-story-tab${isActive ? " active" : ""}`}
                      aria-pressed={isActive}
                      onClick={() => setActiveProjectIndex(index)}
                    >
                      <span className="success-story-tab-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="success-story-tab-meta">{project.year} · {project.category}</span>
                      <strong>{project.name}</strong>
                      <span className="success-story-tab-url">{project.url.replace(/^https?:\/\//, "")}</span>
                    </button>
                  );
                })}
              </div>

              <div className="success-story-count" aria-live="polite">
                <span>{String(activeProjectIndex + 1).padStart(2, "0")}</span>
                <small>/ {String(recentProjects.length).padStart(2, "0")}</small>
              </div>
            </div>

            <article className="success-story-panel">
              <div className="project-card-image success-story-media">
                <div className="browser-chrome">
                  <span className="browser-dot" />
                  <span className="browser-dot" />
                  <span className="browser-dot" />
                  <span className="browser-url">{activeProject.url.replace(/^https?:\/\//, "")}</span>
                </div>
                <ProjectPreview
                  image={activeProject.image}
                  index={0}
                  name={activeProject.name}
                  previewUrl={activeProject.previewUrl}
                />
              </div>

              <div className="success-story-content">
                <div className="success-story-meta-row">
                  <span className="badge badge-accent">{activeProject.category}</span>
                  <span className="success-story-year">{activeProject.year}</span>
                </div>

                <h3 className="success-story-title">{activeProject.name}</h3>
                <a
                  href={activeProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="success-story-link"
                >
                  Visit Live <ExternalLinkIcon size={14} />
                </a>

                <p className="success-story-description">{activeProject.description}</p>

                <div className="success-story-section-label">Capabilities</div>
                <ul className="feature-list success-story-feature-list">
                  {activeProject.features.map((feature, idx) => (
                    <li key={idx}>
                      <CheckCircleIcon size={14} color="var(--color-success)" className="feature-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="success-story-outcome">
                  <div className="success-story-section-label">Outcome</div>
                  <p>{activeProject.outcome}</p>
                </div>

                <div className="success-story-tech-list">
                  {activeProject.technologies.map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Legacy Portfolio — Scrolling Showcase */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="mb-xl text-center">
            <div className="eyebrow mb-sm">Client Portfolio</div>
            <h2>{stats.yearsInBusiness} Years of Trusted Delivery</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Institutions, public-sector bodies, schools, and enterprise brands that trusted Arwin Forge across long-term digital programs.
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
        <WorkLogoShowcase />
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
