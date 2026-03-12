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
  title: "JobReady.ai - Find Jobs in India",
  description:
    "AI-powered job search platform for India. Create ATS-friendly CV with our AI assistant. Auto-apply with one click. Jobs from Infosys, TCS, Flipkart, and more.",
};

const steps = [
  {
    step: "01",
    title: "Sign Up & Chat with AI",
    description: "Create your account and start an intelligent conversation. Our AI guides you through building your professional profile.",
    icon: BotIcon,
    color: "#2563eb",
  },
  {
    step: "02",
    title: "AI Creates Your CV",
    description: "Answer focused questions and get an ATS-optimized, professionally formatted CV generated in seconds.",
    icon: DocumentIcon,
    color: "#7c3aed",
  },
  {
    step: "03",
    title: "Find & Apply to Jobs",
    description: "Browse matched positions from India's top companies. One-click apply with your CV automatically attached.",
    icon: SearchIcon,
    color: "#10b981",
  },
  {
    step: "04",
    title: "Track Applications",
    description: "Monitor every application in your personal dashboard. Real-time updates on views, shortlists, and interviews.",
    icon: ClipboardIcon,
    color: "#f59e0b",
  },
];

const features = [
  "Intelligent AI chat assistant",
  "ATS-optimized CV generation",
  "Jobs from top Indian companies",
  "Salaries displayed in INR (\u20b9)",
  "One-click job applications",
  "Personal application dashboard",
  "Real-time status tracking",
  "Secure user accounts",
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
            Now Live in India
          </div>
          <h1 className="jr-hero-title">
            Your AI-Powered<br />Career Platform
          </h1>
          <p className="jr-hero-sub">
            Create an ATS-friendly CV through intelligent chat, find matching jobs 
            at India&apos;s top companies, and apply with one click.
          </p>
          <div className="jr-hero-actions">
            <Link href="/jobready/signup" className="btn btn-primary btn-lg">
              <RocketIcon size={18} />
              Get Started Free
            </Link>
            <Link href="/jobready/login" className="btn btn-outline btn-lg">
              <UserIcon size={18} />
              Sign In
            </Link>
          </div>
          <div className="jr-hero-companies">
            <span className="jr-companies-label">Jobs from:</span>
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
            <h2>Four Simple Steps</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              A streamlined, AI-powered process to get you job-ready
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
              <h2 className="mb-md">Everything You Need</h2>
              <p className="text-muted mb-lg" style={{ fontSize: "1.0625rem" }}>
                Land your dream job in India with tools built for you.
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
            <h2>Jobs Across India</h2>
            <p className="text-muted" style={{ fontSize: "1.0625rem" }}>
              Opportunities in India&apos;s top tech hubs
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
            <h2 className="jr-cta-title">Ready to Find Your Dream Job?</h2>
            <p className="jr-cta-sub">
              Join thousands of job seekers landing roles at India&apos;s top companies. 
              Create your AI-powered CV and start applying today.
            </p>
            <div className="jr-cta-actions">
              <Link href="/jobready/signup" className="btn btn-lg jr-cta-btn-primary">
                <RocketIcon size={18} />
                Get Started Free
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
