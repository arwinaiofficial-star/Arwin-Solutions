import Link from "next/link";
import {
  heroStats,
  heroPlaybook,
  pillars,
  recentProjects,
  testimonials,
  marqueeClients,
  ctaContent,
} from "@/lib/content";
import { SectionShell } from "@/components/ui/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";

const proofProjects = recentProjects.slice(0, 2);
const proofTestimonials = testimonials.slice(0, 2);
const clientLogos = marqueeClients.slice(0, 6);

export default function Home() {

  return (
    <>
      <SectionShell tone="brand" bleed="wide" className="home-hero">
        <div className="home-hero__grid">
          <div className="home-hero__lead">
            <div className="stack-sm">
              <p className="brand-badge">Honest AI-native delivery</p>
              <h1 className="hero-title">AI-native products for civic, education, and enterprise teams.</h1>
              <p className="home-hero__lede">
                Advisory pods, Maya design guardrails, and resilient engineering so every launch is measurable from day one.
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

      <SectionShell id="system">
        <SectionHeading
          eyebrow="Operating system"
          title="Three pillars, one accountable stack."
          description="Service pods, Maya design governance, and WTAI enablement stay synced so delivery never fractures."
        />
        <div className="product-grid">
          {pillars.map((product) => (
            <article key={product.name} className="surface-card product-card" data-state="interactive">
              <div className="product-card__chips">
                <span className="chip chip--accent">{product.phase}</span>
                <span className="chip">{product.status}</span>
              </div>
              <div className="stack-sm">
                <h3>{product.name}</h3>
                {product.tagline && <p className="product-card__tagline">{product.tagline}</p>}
                <p className="copy">{product.summary ?? product.description}</p>
              </div>
              {product.highlights && (
                <ul className="product-card__list">
                  {product.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              )}
              {product.metrics && (
                <div className="product-card__metrics">
                  {product.metrics.map((metric) => (
                    <div key={metric.label} className="metric-pill">
                      <span className="metric-pill__value">{metric.value}</span>
                      <span className="metric-pill__label">{metric.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {product.ctaLabel && (
                product.external ? (
                  <a href={product.url} className="btn btn-secondary btn-full" target="_blank" rel="noreferrer">
                    {product.ctaLabel}
                  </a>
                ) : (
                  <Link href={product.url} className="btn btn-secondary btn-full">
                    {product.ctaLabel}
                  </Link>
                )
              )}
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="proof" tone="muted">
        <SectionHeading
          eyebrow="Proof"
          title="Recent launches and why leaders stay."
          description="A snapshot of shipped programs plus the voices behind them."
        />
        <div className="proof-grid">
          <div className="proof-projects">
            {proofProjects.map((project) => (
              <article key={project.name} className="surface-card proof-project">
                <div className="proof-project__eyebrow">{project.tagline}</div>
                <h3>{project.name}</h3>
                <p className="copy">{project.description}</p>
                <p className="proof-project__outcome">{project.outcome}</p>
                <a href={project.url} className="brand-link" target="_blank" rel="noreferrer">
                  View live ↗
                </a>
              </article>
            ))}
          </div>
          <div className="proof-side">
            <div className="stack-md">
              {proofTestimonials.map((testimonial) => (
                <figure key={testimonial.quote} className="surface-card proof-testimonial">
                  <blockquote>“{testimonial.quote}”</blockquote>
                  <figcaption>
                    {testimonial.author}, {testimonial.company}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="logo-cloud">
              {clientLogos.map((client) => (
                <span key={client}>{client}</span>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="contact" tone="brand">
        <div className="cta-panel surface-card" data-tone="brand">
          <div>
            <p className="section-eyebrow text-white">{ctaContent.eyebrow}</p>
            <h2>{ctaContent.title}</h2>
            <p>{ctaContent.copy}</p>
          </div>
          <div className="cta-actions">
            <a href={ctaContent.primaryHref} className="btn btn-primary btn-lg">
              {ctaContent.primaryLabel}
            </a>
            <Link href={ctaContent.secondaryHref} className="btn btn-secondary btn-lg">
              {ctaContent.secondaryLabel}
            </Link>
          </div>
        </div>
      </SectionShell>
    </>
  );
}
