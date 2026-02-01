import Link from "next/link";
import type { Pillar } from "@/lib/content";
import {
  capabilityTracks,
  heroStats,
  pillars,
  recentProjects,
  testimonials,
} from "@/lib/content";
import { SectionShell } from "@/components/ui/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";

const heroPlaybook = [
  {
    title: "Clarity sprints",
    copy: "Stakeholder goals → AI use cases in 10 days.",
  },
  {
    title: "Design guardrails",
    copy: "Maya tokens ensure accessibility, speed, and consistency.",
  },
  {
    title: "AI in production",
    copy: "Teams own copilots, telemetry, and adoption post-launch.",
  },
];

const impactSignals = [
  {
    stat: "26+",
    label: "Launches",
    detail: "Government, education, and enterprise transformations.",
  },
  {
    stat: "7",
    label: "Touchpoints unified",
    detail: "Single Maya design language across channels.",
  },
  {
    stat: "99.9%",
    label: "Uptime",
    detail: "Edge runtime reliability across all platforms.",
  },
];

type ProductDetail = {
  tagline: string;
  summary: string;
  highlights: string[];
  metrics: { value: string; label: string }[];
  ctaLabel: string;
  ctaHref: string;
  external?: boolean;
};

const productDetailMap: Record<string, ProductDetail> = {
  "JobReady.ai": {
    tagline: "AI career acceleration workspace",
    summary:
      "End-to-end co-pilot for resume optimization, personal branding, interview coaching, and automated job search.",
    highlights: [
      "Resume intelligence scores skills and identifies gaps instantly.",
      "Personal branding studio generates portfolios, mailers, and credibility assets.",
      "Interview prep and job tracking in one unified dashboard.",
    ],
    metrics: [
      { value: "4", label: "AI copilots at launch" },
      { value: "Phase 1", label: "orchestration prototypes live in 2026" },
    ],
    ctaLabel: "Follow the JobReady.ai build",
    ctaHref: "/jobready",
  },
  "Maya Design System": {
    tagline: "Design governance for fast, consistent delivery",
    summary:
      "Token-driven, CSS-first system ensuring visual consistency for regulated clients on modern stacks.",
    highlights: [
      "Semantic tokens and white-label theming for all touchpoints.",
      "Component library with built-in accessibility guardrails.",
      "Maya Ops keeps audits, reviews, and brand fidelity tight.",
    ],
    metrics: [
      { value: "v2.0.0", label: "current npm release" },
      { value: "7+", label: "touchpoints powered per rollout" },
    ],
    ctaLabel: "Review Maya on npm",
    ctaHref: "https://www.npmjs.com/package/@maya-design-system/design-system",
    external: true,
  },
  WTAI: {
    tagline: "Community and cohorts for applied AI",
    summary:
      "Open learning platform democratizing AI playbooks, labs, and peer coaching for India-first teams.",
    highlights: [
      "Structured cohorts combining foundational training with practitioner sessions.",
      "Hands-on labs for GenAI, ASR, and computer vision stacks.",
      "Peer accountability ensuring measurable adoption.",
    ],
    metrics: [
      { value: "Phase 1", label: "community live with resource hub" },
      { value: "3", label: "program formats: cohorts, labs, AMAs" },
    ],
    ctaLabel: "Enter wtai.in",
    ctaHref: "https://wtai.in/",
    external: true,
  },
};

const marqueeClients = [
  "Govt. of Telangana",
  "NTPC",
  "Indian Railways",
  "Kendriya Vidyalayas",
  "TTD Board",
  "Vidyabharati SVP",
  "Lion's Club",
  "Kapil Group",
];

type ProductCard = Pillar & ProductDetail;

export default function Home() {
  const enrichedProducts = pillars
    .map((pillar) => {
      const detail = productDetailMap[pillar.name];
      if (!detail) return null;
      return { ...pillar, ...detail };
    })
    .filter(Boolean) as ProductCard[];

  const featuredTestimonials = testimonials.slice(0, 3);

  return (
    <>
      <SectionShell tone="brand" bleed="wide" className="home-hero">
        <div className="home-hero__grid">
          <div className="home-hero__lead">
            <div className="stack-sm">
              <p className="brand-badge">Honest AI-native delivery</p>
              <h1 className="hero-title">
                AI-native products for civic, education, and enterprise.
              </h1>
              <p className="home-hero__lede">
                Advisory teams, Maya design systems, and resilient engineering delivering measurable outcomes from day one.
              </p>
            </div>
            <div className="home-hero__actions">
              <a href="mailto:hello@arwinaisolutions.com" className="btn btn-primary btn-lg">
                Book a strategy call
              </a>
              <Link href="/work" className="btn btn-secondary btn-lg">
                See transformations
              </Link>
            </div>
            <div className="stat-grid-modern" data-variant="inverted">
              {heroStats.map((stat) => (
                <div key={stat.label} className="stat-pill">
                  <p className="stat-pill__value">{stat.value}</p>
                  <p className="stat-pill__label">{stat.label}</p>
                  {stat.helper && <p className="stat-pill__helper">{stat.helper}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card home-hero__panel" data-tone="brand">
            <p className="eyebrow">Delivery playbook</p>
            <ul className="playbook-list">
              {heroPlaybook.map((step) => (
                <li key={step.title} className="playbook-item">
                  <p className="playbook-item__title">{step.title}</p>
                  <p className="playbook-item__copy">{step.copy}</p>
                </li>
              ))}
            </ul>
            <p className="playbook-note">
              Outcomes tracked on shared scoreboards before launch, keeping progress transparent.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="why">
        <SectionHeading
          eyebrow="Why partners choose us"
          title="Strategy, design systems, and AI deployment in one accountable team."
          description="Modern studio approach: research, design, engineering, and AI working together. Honest communication, measurable KPIs, and 14+ years of proven delivery."
        />
        <div className="signal-grid">
          {impactSignals.map((signal) => (
            <div key={signal.label} className="surface-card signal-card" data-state="interactive">
              <p className="signal-card__stat">{signal.stat}</p>
              <p className="signal-card__label">{signal.label}</p>
              <p className="copy">{signal.detail}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell tone="muted" id="products">
        <SectionHeading
          eyebrow="Product stack"
          title="JobReady.ai, Maya Design System, and WTAI power AI-native launches."
          description="Services, product, and community work together: talent intelligence shapes interfaces, Maya ensures quality, WTAI enables the teams."
        />
        <div className="product-grid">
          {enrichedProducts.map((product) => (
            <article key={product.name} className="surface-card product-card" data-state="interactive">
              <div className="product-card__chips">
                <span className="chip chip--accent">{product.phase}</span>
                <span className="chip">{product.status}</span>
              </div>
              <div className="stack-sm">
                <h3>{product.name}</h3>
                <p className="product-card__tagline">{product.tagline}</p>
                <p className="copy">{product.summary}</p>
              </div>
              <ul className="product-card__list">
                {product.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <div className="product-card__metrics">
                {product.metrics.map((metric) => (
                  <div key={metric.label} className="metric-pill">
                    <span className="metric-pill__value">{metric.value}</span>
                    <span className="metric-pill__label">{metric.label}</span>
                  </div>
                ))}
              </div>
              {product.external ? (
                <a href={product.ctaHref} className="btn btn-secondary btn-full" target="_blank" rel="noreferrer">
                  {product.ctaLabel}
                </a>
              ) : (
                <Link href={product.ctaHref} className="btn btn-secondary btn-full">
                  {product.ctaLabel}
                </Link>
              )}
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="services" padding="wide">
        <SectionHeading
          eyebrow="Service model"
          title="Strategy, build, and operations without hand-offs."
          description="One team moves from discovery to delivery, maintaining telemetry and support post-launch."
        />
        <div className="service-grid">
          {capabilityTracks.map((track) => (
            <article key={track.title} className="surface-card service-card">
              <h3>{track.title}</h3>
              <ul>
                {track.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="impact" tone="muted">
        <SectionHeading
          eyebrow="Case studies"
          title="AI programs running in production."
          description="Recent launches across community, education, and enterprise sectors."
        />
        <div className="case-grid">
          {recentProjects.map((project) => (
            <article key={project.name} className="surface-card case-card" data-state="interactive">
              <div className="case-card__header">
                <p>{project.tagline}</p>
                <span>&nearr;</span>
              </div>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <p className="case-card__outcome">{project.outcome}</p>
              <div className="case-card__tags">
                {project.focus.map((focus) => (
                  <span key={focus} className="chip">
                    {focus}
                  </span>
                ))}
              </div>
              <a href={project.url} className="brand-link" target="_blank" rel="noreferrer">
                View live ↗
              </a>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="trust">
        <div className="trust-layout">
          <div>
            <SectionHeading
              eyebrow="Proof of trust"
              title="Leaders stay because accountability does."
              description="Teams remain post-launch, telemetry is transparent, and AI guardrails are practical."
              align="start"
            />
            <div className="testimonials-grid">
              {featuredTestimonials.map((testimonial) => (
                <figure key={testimonial.quote} className="surface-card quote-card">
                  <blockquote>“{testimonial.quote}”</blockquote>
                  <figcaption>
                    <strong>{testimonial.author}</strong>, {testimonial.role} – {testimonial.company}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="surface-card logo-card">
            <p className="section-eyebrow text-left">Trusted by</p>
            <div className="logo-grid">
              {marqueeClients.map((client) => (
                <span key={client}>{client}</span>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="contact" tone="brand">
        <div className="cta-panel surface-card" data-tone="brand">
          <div>
            <p className="section-eyebrow text-white">Next step</p>
            <h2>Brief us once. We'll orchestrate the team.</h2>
            <p>
              Share your audience, goals, and timeline. We'll align JobReady.ai pilots, Maya governance, and WTAI enablement
              for a focused, measurable launch.
            </p>
          </div>
          <div className="cta-actions">
            <a href="mailto:hello@arwinaisolutions.com" className="btn btn-primary btn-lg">
              Start a strategy call
            </a>
            <Link href="/about" className="btn btn-secondary btn-lg">
              Meet the team
            </Link>
          </div>
        </div>
      </SectionShell>
    </>
  );
}
