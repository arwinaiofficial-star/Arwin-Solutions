import Link from "next/link";
import type { Pillar } from "@/lib/content";
import {
  capabilityTracks,
  heroStats,
  pillars,
  recentProjects,
  testimonials,
} from "@/lib/content";

const heroPlaybook = [
  {
    title: "Clarity sprints",
    copy: "Stakeholder interviews and AI opportunity mapping anchored on executive KPIs.",
  },
  {
    title: "Design system guardrails",
    copy: "Maya tokens and review rituals keep accessibility, speed, and honesty intact.",
  },
  {
    title: "AI-in-production",
    copy: "Applied AI pods embed copilots, observability, and adoption loops into every launch.",
  },
];

const impactSignals = [
  {
    stat: "26+",
    label: "multi-sector launches",
    detail: "Government, education, and enterprise products shipped since 2011.",
  },
  {
    stat: "99.9%",
    label: "experience uptime",
    detail: "Vidyabharati campus portal on Vercel edge runtime with Maya tokens.",
  },
  {
    stat: "7+",
    label: "touchpoints unified",
    detail: "Parent, alumni, transport, and admissions flows orchestrated in one stack.",
  },
  {
    stat: "3",
    label: "AI-first products",
    detail: "JobReady.ai, Maya Design System, and WTAI operating as one growth stack.",
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
      "End-to-end co-pilot guiding resumes, personal branding, interview coaching, and live job search automation for institutes and individuals.",
    highlights: [
      "Resume intelligence scores every skill signal and fills the gaps instantly.",
      "Personal branding studio generates portfolios, mailers, and credibility loops.",
      "Interview rehearsal and job-tracking automation sit in the same dashboard.",
    ],
    metrics: [
      { value: "4", label: "AI copilots at launch" },
      { value: "Phase 1", label: "orchestration prototypes live in 2026" },
    ],
    ctaLabel: "Follow the JobReady.ai build",
    ctaHref: "/jobready",
  },
  "Maya Design System": {
    tagline: "Design governance for honest, fast delivery",
    summary:
      "Token-driven, CSS-first system that keeps regulated clients visually consistent while shipping on modern stacks.",
    highlights: [
      "Semantic tokens + white-label theming for every client touchpoint.",
      "Component library and accessibility guardrails ready for engineering teams.",
      "Maya Ops rituals keep audits, review cycles, and brand fidelity tight.",
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
      "WhatTheAI is the open learning and resource platform democratizing AI playbooks, labs, and peer coaching for India-first teams.",
    highlights: [
      "Structured cohorts blend foundational training with live practitioner AMAs.",
      "Labs and toolkits make GenAI, ASR, and CV stacks hands-on for teams.",
      "Peer accountability keeps adoption honest and measurable.",
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
    <main>
      <section className="hero-shell">
        <div className="container hero-layout">
          <div className="hero-copy">
            <p className="brand-badge">Honest AI-native delivery</p>
            <h1>
              Digital solutions that make businesses feel honest, powerful, and unmistakably modern.
            </h1>
            <p className="hero-lead">
              We pair AI advisory pods, Maya design governance, and resilient engineering so every new
              touchpoint is measurable, multilingual, and ready for scale across government, education,
              and enterprise missions.
            </p>
            <div className="hero-actions">
              <a href="mailto:hello@arwinaisolutions.com" className="btn btn-primary btn-lg">
                Book a strategy call
              </a>
              <Link href="/work" className="btn btn-secondary btn-lg">
                See transformations
              </Link>
            </div>
            <div className="stat-grid">
              {heroStats.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <p className="stat-card-value">{stat.value}</p>
                  <p className="stat-card-label">{stat.label}</p>
                  {stat.helper && <p className="stat-card-helper">{stat.helper}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="hero-panel">
            <p className="hero-panel__title">Delivery playbook</p>
            <ul className="hero-panel__list">
              {heroPlaybook.map((step) => (
                <li key={step.title} className="hero-panel__item">
                  <p className="hero-panel__item-title">{step.title}</p>
                  <p className="hero-panel__item-copy">{step.copy}</p>
                </li>
              ))}
            </ul>
            <p className="hero-panel__note">
              Outcomes lock into shared scoreboards before we ship, so progress stays transparent.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="why">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">Why partners choose us</p>
              <h2 className="section-title">
                Strategy, Maya design craft, and AI deployment inside one accountable team.
              </h2>
            </div>
            <p className="section-subtitle">
              We operate like a modern studio—research, design, engineering, and AI playbooks progressing
              together. You get honest communication, measurable KPIs, and the energy of a team that has
              been shipping for 14+ years.
            </p>
          </div>
          <div className="impact-grid">
            {impactSignals.map((signal) => (
              <div key={signal.label} className="impact-card">
                <p className="impact-card-stat">{signal.stat}</p>
                <p className="impact-card-label">{signal.label}</p>
                <p className="impact-card-detail">{signal.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="products">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">Product stack</p>
              <h2 className="section-title">
                JobReady.ai, Maya Design System, and WTAI make every launch AI-native.
              </h2>
            </div>
            <p className="section-subtitle">
              Services, product, and community feed each other—talent intelligence informs interfaces,
              Maya keeps quality high, and WTAI trains the people who will operate it all.
            </p>
          </div>
          <div className="pillars-grid">
            {enrichedProducts.map((product) => (
              <article key={product.name} className="product-card">
                <div className="product-card__chips">
                  <span className="chip chip--accent">{product.phase}</span>
                  <span className="chip">{product.status}</span>
                </div>
                <h3>{product.name}</h3>
                <p className="product-card__tagline">{product.tagline}</p>
                <p>{product.summary}</p>
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
                  <a href={product.ctaHref} className="btn btn-secondary w-full" target="_blank" rel="noreferrer">
                    {product.ctaLabel}
                  </a>
                ) : (
                  <Link href={product.ctaHref} className="btn btn-secondary w-full">
                    {product.ctaLabel}
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">Service model</p>
              <h2 className="section-title">Plan, build, and scale with one AI-enabled partner.</h2>
            </div>
            <p className="section-subtitle">
              Teams plug into experience strategy, applied AI delivery, and sustained operations. Maya
              tokens and JobReady data loops make sure improvements carry into every release.
            </p>
          </div>
          <div className="service-grid">
            {capabilityTracks.map((track) => (
              <article key={track.title} className="service-card">
                <h3>{track.title}</h3>
                <ul>
                  {track.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="impact">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">Case studies</p>
              <h2 className="section-title">We measure every launch so value is obvious.</h2>
            </div>
            <p className="section-subtitle">
              From matchmaking communities to K-12 digital campuses, our work now bakes in AI copilots,
              Maya tokens, and reliability playbooks by default.
            </p>
          </div>
          <div className="case-grid">
            {recentProjects.map((project) => (
              <article key={project.name} className="case-card">
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
        </div>
      </section>

      <section className="section" id="trust">
        <div className="container trust-layout">
          <div>
            <p className="section-eyebrow">Proof of trust</p>
            <h2 className="section-title">Leaders stay with us because we are transparent and fast.</h2>
            <div className="testimonials-grid">
              {featuredTestimonials.map((testimonial) => (
                <figure key={testimonial.quote} className="quote-card">
                  <blockquote>“{testimonial.quote}”</blockquote>
                  <figcaption>
                    <strong>{testimonial.author}</strong>, {testimonial.role} – {testimonial.company}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="logo-card">
            <p className="section-eyebrow text-left">Trusted by</p>
            <div className="logo-grid">
              {marqueeClients.map((client) => (
                <span key={client}>{client}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section cta-section" id="contact">
        <div className="container">
          <div className="cta-panel">
            <div>
              <p className="section-eyebrow text-white">Next step</p>
              <h2>Ready to co-build the next AI-enabled experience?</h2>
              <p>
                Tell us the problem, the audience, and the stakes. We will align JobReady.ai pilots, Maya
                governance, and WTAI programs so your business looks hardworking, genuine, and powerful.
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
        </div>
      </section>
    </main>
  );
}
