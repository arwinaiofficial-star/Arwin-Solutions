import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@/components/icons/SiteIcons";

export const metadata: Metadata = {
  title: "JobReady — AI-Powered Career Platform | Arwin",
  description:
    "Build ATS-optimized resumes with AI, search jobs across India, and track every application — all in one intelligent workspace. By Arwin.",
};

const features = [
  {
    num: "01",
    title: "AI Resume Builder",
    desc: "Guided editor with real-time ATS scoring, AI suggestions, and live preview. Create resumes that pass modern applicant tracking systems.",
    color: "#2563eb",
  },
  {
    num: "02",
    title: "Smart Job Search",
    desc: "Aggregated listings from top platforms. Every result scored against your profile for relevance, so you apply where it matters.",
    color: "#10b981",
  },
  {
    num: "03",
    title: "Application Tracker",
    desc: "Visual pipeline from Saved to Offer. Track status, deadlines, and follow-ups — never lose sight of an opportunity.",
    color: "#7c3aed",
  },
];

const capabilities = [
  "ATS-optimized resume templates with real-time scoring",
  "AI-powered content suggestions and bullet point enhancement",
  "LinkedIn profile import for instant resume creation",
  "Multi-source job search with skill-based matching",
  "Kanban-style application tracking pipeline",
  "Built for the Indian job market — INR salaries, local platforms",
];

export default function JobReadyPage() {
  return (
    <>
      {/* Hero */}
      <section className="jr-pg-hero">
        <div className="jr-pg-hero-bg">
          <div className="jr-pg-hero-glow" />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div className="badge" style={{ marginBottom: "var(--space-md)" }}>
            <SparklesIcon size={14} />
            AI-Powered Career Platform
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5.5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: "var(--space-md)" }}>
            Your career, intelligently<br />managed.
          </h1>
          <p className="text-muted" style={{ fontSize: "1.125rem", maxWidth: "560px", margin: "0 auto var(--space-xl)", lineHeight: 1.7 }}>
            Resume building, job search, and application tracking — unified in one
            workspace. Powered by AI. Designed for professionals.
          </p>
          <div className="flex gap-md justify-center" style={{ flexWrap: "wrap" }}>
            <Link href="/jobready/signup" className="btn btn-primary btn-lg">
              Get Started Free
              <ArrowRightIcon size={18} />
            </Link>
            <Link href="/jobready/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">How It Works</div>
            <h2>Three tools. One workspace.</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Everything you need to go from resume to offer — without switching between five different platforms.
            </p>
          </div>

          <div className="grid grid-3">
            {features.map((feature) => (
              <div key={feature.num} className="solution-card">
                <div
                  className="icon-container mb-md"
                  style={{
                    background: `${feature.color}14`,
                    border: `1px solid ${feature.color}25`,
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: "0.875rem", color: feature.color }}>
                    {feature.num}
                  </span>
                </div>
                <h3 className="card-title">{feature.title}</h3>
                <p className="card-description">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container"><div className="section-divider" /></div>

      {/* Capabilities */}
      <section className="section">
        <div className="container">
          <div className="jr-pg-capabilities">
            <div>
              <div className="eyebrow mb-sm">Platform Capabilities</div>
              <h2>Built for how hiring<br />actually works in 2026.</h2>
              <p className="text-muted" style={{ fontSize: "1.0625rem", maxWidth: "460px" }}>
                Modern ATS systems reject 75% of resumes before a human sees them.
                JobReady ensures yours gets through — then helps you track every application to completion.
              </p>
            </div>
            <div className="jr-pg-capabilities-list">
              {capabilities.map((item) => (
                <div key={item} className="jr-pg-capability-item">
                  <CheckCircleIcon size={18} color="#10b981" className="feature-icon" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <SparklesIcon size={32} color="var(--color-primary-light)" />
            <h2 style={{ marginTop: "var(--space-md)", marginBottom: "var(--space-md)" }}>
              Ready to take control of your career?
            </h2>
            <p className="text-muted" style={{ fontSize: "1.0625rem", maxWidth: "640px", margin: "0 auto var(--space-xl)" }}>
              Create your free workspace and start with a resume that&apos;s
              built to get past ATS filters and land interviews.
            </p>
            <div className="flex gap-md justify-center" style={{ flexWrap: "wrap" }}>
              <Link href="/jobready/signup" className="btn btn-primary btn-lg">
                Create Your Workspace
                <ArrowRightIcon size={18} />
              </Link>
              <Link href="/jobready/login" className="btn btn-outline btn-lg">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
