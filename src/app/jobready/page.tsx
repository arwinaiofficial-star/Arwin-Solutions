import Link from "next/link";
import type { Metadata } from "next";
import {
  SearchIcon,
  UserIcon,
  BotIcon,
  DocumentIcon,
  ClipboardIcon,
  RocketIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@/components/icons/Icons";

export const metadata: Metadata = {
  title: "JobReady.ai - Resume, Match, Apply",
  description:
    "Build a sharper resume, match the right roles, and track every application in one workflow.",
};

const steps = [
  {
    step: "01",
    title: "Set Up Your Profile",
    description: "Import your resume, tell your story, or start clean. JobReady turns it into structured career data.",
    icon: BotIcon,
    color: "#2563eb",
  },
  {
    step: "02",
    title: "Strengthen Your Resume",
    description: "Refine summary, experience, skills, and ATS quality without leaving the workflow.",
    icon: DocumentIcon,
    color: "#1d4ed8",
  },
  {
    step: "03",
    title: "Match the Right Roles",
    description: "See ranked roles, tailor the resume to the job, and prepare a stronger application package.",
    icon: SearchIcon,
    color: "#3b82f6",
  },
  {
    step: "04",
    title: "Run the Pipeline",
    description: "Save, apply, follow up, and track progress from one dashboard instead of scattered spreadsheets.",
    icon: ClipboardIcon,
    color: "#60a5fa",
  },
];

const features = [
  "Structured resume import",
  "ATS-focused resume editing",
  "Matched jobs in one workspace",
  "Tailored resume and cover letter flow",
  "Application tracking by stage",
  "Secure account and resume storage",
];

const cities = ["Bangalore", "Hyderabad", "Mumbai", "Pune", "Chennai", "Delhi NCR", "Noida", "Gurgaon"];

export default function JobReadyPage() {
  return (
    <>
      {/* Hero */}
      <section className="jr-hero">
        <div className="jr-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80"
            alt=""
            className="jr-hero-bg-img"
          />
          <div className="jr-hero-bg-overlay" />
        </div>
        <div className="container jr-hero-content">
          <div className="jr-hero-badge">
            <span className="jr-pulse" />
            Guided Application Workflow
          </div>
          <h1 className="jr-hero-title">
            Resume to application,<br />in one system
          </h1>
          <p className="jr-hero-sub">
            Build an ATS-ready resume, match stronger roles, tailor for each opportunity,
            and track the full pipeline without switching tools.
          </p>
          <div className="jr-hero-actions">
            <Link href="/jobready/signup" className="btn btn-primary btn-lg">
              <RocketIcon size={18} />
              Start Free
            </Link>
            <Link href="/jobready/login" className="btn btn-outline btn-lg">
              <UserIcon size={18} />
              Sign In
            </Link>
          </div>
          <div className="jr-hero-companies">
            <span className="jr-companies-label">Coverage:</span>
            <span className="jr-companies-list">
              Infosys &bull; TCS &bull; Flipkart &bull; Razorpay &bull; Paytm &bull; Swiggy &bull; Google India &bull; Amazon India
            </span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">How It Works</div>
            <h2>One Clear Flow</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Import, improve, match, tailor, and track without breaking context.
            </p>
          </div>

          <div className="jr-steps">
            {steps.map((s, index) => (
              <div key={index} className="jr-step">
                <div className="jr-step-number" style={{ color: s.color }}>{s.step}</div>
                <div className="jr-step-icon" style={{ background: `${s.color}14`, border: `1px solid ${s.color}25` }}>
                  <s.icon size={24} color={s.color} />
                </div>
                <h3 className="jr-step-title">{s.title}</h3>
                <p className="jr-step-desc">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — Split with image */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="jr-features-split">
            <div className="jr-features-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
                alt="JobReady platform"
                className="jr-features-img"
              />
            </div>
            <div className="jr-features-content">
              <div className="eyebrow mb-sm">Features</div>
              <h2 className="mb-md">Built for focused applications</h2>
              <p className="text-muted mb-lg" style={{ fontSize: "1.0625rem" }}>
                Cleaner workflow, stronger documents, better job targeting.
              </p>
              <ul className="jr-feature-list">
                {features.map((feature, index) => (
                  <li key={index} className="jr-feature-item">
                    <span className="jr-feature-check">
                      <CheckIcon size={14} color="white" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Coverage</div>
            <h2>Across India&apos;s hiring hubs</h2>
            <p className="text-muted" style={{ fontSize: "1.0625rem" }}>
              Roles across product, engineering, design, and operations.
            </p>
          </div>
          <div className="jr-cities">
            {cities.map((city) => (
              <div key={city} className="jr-city">
                <span className="jr-city-dot" />
                {city}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="jr-cta">
            <h2 className="jr-cta-title">Ready to run a sharper search?</h2>
            <p className="jr-cta-sub">
              Set up your profile, tighten the resume, and move into matched roles with less friction.
            </p>
            <div className="jr-cta-actions">
              <Link href="/jobready/signup" className="btn btn-lg jr-cta-btn-primary">
                <RocketIcon size={18} />
                Start Free
              </Link>
              <Link href="/jobready/login" className="btn btn-lg jr-cta-btn-secondary">
                Sign In
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
