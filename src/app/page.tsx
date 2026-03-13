import Link from "next/link";
import { homeContent, stats } from "@/lib/content";
import {
  ForgeIcon,
  FinLensIcon,
  CommunityIcon,
  JobReadyIcon,
  DesignSystemIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
  GovernmentIcon,
  EducationIcon,
  EnterpriseIcon,
  HeartHandshakeIcon,
  SparklesIcon,
} from "@/components/icons/SiteIcons";
import { TrustSection } from "@/components/ClientLogos";

const solutionIcons = [ForgeIcon, FinLensIcon, CommunityIcon];
const solutionColors = ["#2563eb", "#10b981", "#7c3aed"];
const productIcons = [JobReadyIcon, DesignSystemIcon];
const productColors = ["#2563eb", "#7c3aed"];

export default function HomePage() {
  return (
    <>
      {/* Hero — immersive with background image, extends behind header */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=80"
            alt=""
            className="home-hero-img"
          />
          <div className="home-hero-overlay" />
        </div>
        <div className="container home-hero-content">
          <div className="home-hero-text">
            <h1 className="home-hero-title">{homeContent.hero.title}</h1>
            <p className="home-hero-sub">
              {homeContent.hero.subtitle}
            </p>
            <div className="home-hero-actions">
              <Link href="/contact?intent=project" className="btn btn-primary btn-lg">
                Start a Project
                <ArrowRightIcon size={18} />
              </Link>
              <Link href="/work" className="btn btn-secondary btn-lg">
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust — Stats + Client Logos */}
      <TrustSection />

      {/* Solutions */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Solutions</div>
            <h2>What We Offer</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Three focused solutions — each solving a distinct problem with depth, not breadth.
            </p>
          </div>

          <div className="grid grid-3">
            {homeContent.solutions.map((solution, index) => {
              const Icon = solutionIcons[index];
              const color = solutionColors[index];
              return (
                <div key={index} className="solution-card">
                  <div
                    className="icon-container mb-md"
                    style={{
                      background: `${color}14`,
                      border: `1px solid ${color}25`,
                    }}
                  >
                    <Icon size={24} color={color} />
                  </div>
                  <h3 className="card-title">{solution.name}</h3>
                  <p style={{ color: "var(--color-text-light)", fontWeight: 500, fontSize: "0.875rem", marginBottom: "var(--space-sm)" }}>
                    {solution.tagline}
                  </p>
                  <p className="card-description mb-md">{solution.description}</p>

                  <ul className="feature-list mb-lg">
                    {solution.features.map((feature, idx) => (
                      <li key={idx}>
                        <CheckCircleIcon size={16} color={color} className="feature-icon" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {solution.external ? (
                    <a
                      href={solution.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                    >
                      Visit {solution.name}
                      <ExternalLinkIcon size={16} />
                    </a>
                  ) : (
                    <Link href={solution.url} className="btn btn-primary" style={{ width: "100%" }}>
                      Explore {solution.name}
                      <ArrowRightIcon size={16} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container"><div className="section-divider" /></div>

      {/* Products — Side-by-side with image */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Products</div>
            <h2>What We Build</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Standalone products designed, built, and maintained by Arwin — solving real problems at scale.
            </p>
          </div>

          <div className="products-showcase">
            {homeContent.products.map((product, index) => {
              const Icon = productIcons[index];
              const color = productColors[index];
              return (
                <div key={index} className="product-showcase-card">
                  <div className="product-showcase-visual">
                    <img
                      src={index === 0
                        ? "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80"
                        : "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&q=80"
                      }
                      alt={product.name}
                      className="product-showcase-img"
                    />
                  </div>
                  <div className="product-showcase-info">
                    <div className="flex items-center gap-sm mb-sm">
                      <div
                        className="icon-container"
                        style={{
                          background: `${color}14`,
                          border: `1px solid ${color}25`,
                        }}
                      >
                        <Icon size={24} color={color} />
                      </div>
                      <span className="badge badge-success">{product.status}</span>
                    </div>
                    <h3 className="card-title">{product.name}</h3>
                    <p style={{ color: "var(--color-text-light)", fontWeight: 500, fontSize: "0.875rem", marginBottom: "var(--space-sm)" }}>
                      {product.tagline}
                    </p>
                    <p className="card-description mb-lg">{product.description}</p>
                    {product.external ? (
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        Visit {product.name}
                        <ExternalLinkIcon size={16} />
                      </a>
                    ) : (
                      <Link href={product.url} className="btn btn-secondary">
                        Explore {product.name}
                        <ArrowRightIcon size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Philosophy — full bleed visual quote */}
      <section className="philosophy-section">
        <div className="philosophy-bg">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
            alt=""
            className="philosophy-bg-img"
          />
          <div className="philosophy-bg-overlay" />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="philosophy-content">
            <HeartHandshakeIcon size={36} color="#8b5cf6" />
            <div className="eyebrow mb-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Our Philosophy</div>
            <h2 className="mb-md" style={{ color: "white" }}>{homeContent.philosophy.title}</h2>
            <p style={{ fontSize: "1.125rem", lineHeight: 1.8, color: "rgba(255,255,255,0.8)", maxWidth: "700px", margin: "0 auto" }}>
              {homeContent.philosophy.description}
            </p>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Impact</div>
            <h2>Trusted Across Sectors</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Government, education, healthcare, and enterprise — our work speaks across India&apos;s most critical sectors.
            </p>
          </div>

          <div className="grid grid-3" style={{ maxWidth: "900px", margin: "0 auto" }}>
            {[
              { icon: GovernmentIcon, color: "#2563eb", value: `${stats.governmentProjects}+`, label: "Government Projects", detail: "Railways, NTPC, NIC, TTD" },
              { icon: EducationIcon, color: "#10b981", value: `${stats.educationProjects}+`, label: "Education Platforms", detail: "KVs, CBIT, Geetanjali" },
              { icon: EnterpriseIcon, color: "#7c3aed", value: `${stats.enterpriseProjects}+`, label: "Enterprise & Healthcare", detail: "Hospitals, Automotive, Groups" },
            ].map((item, index) => (
              <div key={index} className="impact-card">
                <div
                  className="impact-icon"
                  style={{
                    background: `${item.color}14`,
                    border: `1px solid ${item.color}25`,
                  }}
                >
                  <item.icon size={24} color={item.color} />
                </div>
                <div className="impact-value">{item.value}</div>
                <div className="impact-label">{item.label}</div>
                <div className="impact-detail">{item.detail}</div>
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
            <h2 style={{ marginTop: "var(--space-md)", marginBottom: "var(--space-md)" }}>{homeContent.cta.title}</h2>
            <p className="text-muted" style={{ fontSize: "1.0625rem", maxWidth: "640px", margin: "0 auto var(--space-xl)" }}>
              {homeContent.cta.description}
            </p>
            <div className="flex gap-md justify-center" style={{ flexWrap: "wrap" }}>
              <Link href="/contact?intent=project" className="btn btn-primary btn-lg">
                Start a Project
                <ArrowRightIcon size={18} />
              </Link>
              <Link href="/contact" className="btn btn-outline btn-lg">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
