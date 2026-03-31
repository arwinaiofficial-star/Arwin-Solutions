import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  CheckIcon,
  DocumentIcon,
  SearchIcon,
  ClipboardIcon,
} from "@/components/icons/Icons";

export const metadata: Metadata = {
  title: "JobReady — Your career, simplified",
  description:
    "Build your resume, find matching jobs, and track applications — all in one clean workspace. No clutter, no confusion.",
};

const steps = [
  {
    num: "01",
    title: "Build your resume",
    desc: "A guided editor with live preview and AI suggestions. See your progress as you go.",
    icon: DocumentIcon,
  },
  {
    num: "02",
    title: "Find the right jobs",
    desc: "Search across multiple sources. Every result is scored against your skills.",
    icon: SearchIcon,
  },
  {
    num: "03",
    title: "Track applications",
    desc: "Kanban board from Saved to Offer. Always know where you stand.",
    icon: ClipboardIcon,
  },
];

const benefits = [
  "One workspace, not five scattered tools",
  "Resume score shows exactly what to improve",
  "Job match % based on your actual skills",
  "No hidden upsells or cluttered dashboards",
  "Works for fresh grads and experienced professionals",
  "Built for simplicity, not feature count",
];

export default function JobReadyPage() {
  return (
    <div className="jr-landing">
      {/* Hero */}
      <section className="jr-landing-hero">
        <div className="jr-landing-container">
          <p className="jr-landing-eyebrow">Career tools, simplified</p>
          <h1 className="jr-landing-h1">
            Your job search deserves<br />a cleaner system.
          </h1>
          <p className="jr-landing-subtitle">
            Build your resume, search for jobs, and track every application
            in one focused workspace. No clutter, no confusion.
          </p>
          <div className="jr-landing-actions">
            <Link href="/jobready/signup" className="jr-btn jr-btn-primary">
              Get started free
              <ArrowRightIcon size={16} />
            </Link>
            <Link href="/jobready/login" className="jr-btn jr-btn-secondary">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="jr-landing-section">
        <div className="jr-landing-container">
          <p className="jr-landing-eyebrow">How it works</p>
          <h2 className="jr-landing-h2">Three steps. One workspace.</h2>
          <div className="jr-landing-steps">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="jr-landing-step-card">
                  <div className="jr-landing-step-icon">
                    <Icon size={20} />
                  </div>
                  <span className="jr-landing-step-num">{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why JobReady */}
      <section className="jr-landing-section jr-landing-section-alt">
        <div className="jr-landing-container">
          <div className="jr-landing-split">
            <div>
              <p className="jr-landing-eyebrow">Why JobReady</p>
              <h2 className="jr-landing-h2">Clarity over features.</h2>
              <p className="jr-landing-body">
                Most career platforms overwhelm you with tools you never use.
                JobReady focuses on the three things that actually move your
                career forward — and does them well.
              </p>
            </div>
            <div className="jr-landing-benefits">
              {benefits.map((b) => (
                <div key={b} className="jr-landing-benefit">
                  <span className="jr-landing-check">
                    <CheckIcon size={14} />
                  </span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="jr-landing-section">
        <div className="jr-landing-container">
          <div className="jr-landing-cta">
            <h2 className="jr-landing-h2">Ready to simplify your job search?</h2>
            <p className="jr-landing-body">
              Start with your resume, then search and track — all from one place.
            </p>
            <div className="jr-landing-actions">
              <Link href="/jobready/signup" className="jr-btn jr-btn-primary">
                Create your workspace
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{landingStyles}</style>
    </div>
  );
}

const landingStyles = `
  .jr-landing {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #111827;
    -webkit-font-smoothing: antialiased;
  }

  .jr-landing-container {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Hero */
  .jr-landing-hero {
    padding: 120px 0 80px;
    text-align: center;
    background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
  }

  .jr-landing-eyebrow {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #2563eb;
    margin: 0 0 16px 0;
  }

  .jr-landing-h1 {
    font-size: clamp(2.5rem, 5vw, 3.75rem);
    font-weight: 700;
    line-height: 1.08;
    color: #111827;
    margin: 0 0 20px 0;
    letter-spacing: -0.02em;
  }

  .jr-landing-subtitle {
    font-size: 1.125rem;
    color: #6b7280;
    max-width: 560px;
    margin: 0 auto 32px;
    line-height: 1.6;
  }

  .jr-landing-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  /* Sections */
  .jr-landing-section {
    padding: 80px 0;
  }

  .jr-landing-section-alt {
    background: #f9fafb;
  }

  .jr-landing-h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 12px 0;
    letter-spacing: -0.01em;
  }

  .jr-landing-body {
    font-size: 1rem;
    color: #6b7280;
    line-height: 1.6;
    max-width: 520px;
    margin: 0;
  }

  /* Steps */
  .jr-landing-steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 48px;
  }

  .jr-landing-step-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 32px 24px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
  }

  .jr-landing-step-card:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .jr-landing-step-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eff6ff;
    color: #2563eb;
    margin-bottom: 16px;
  }

  .jr-landing-step-num {
    font-size: 0.75rem;
    font-weight: 700;
    color: #2563eb;
    letter-spacing: 0.05em;
  }

  .jr-landing-step-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 8px 0;
  }

  .jr-landing-step-card p {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
    margin: 0;
  }

  /* Split */
  .jr-landing-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: start;
  }

  .jr-landing-benefits {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .jr-landing-benefit {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.9375rem;
    color: #374151;
  }

  .jr-landing-check {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #d1fae5;
    color: #059669;
    flex-shrink: 0;
  }

  /* CTA */
  .jr-landing-cta {
    text-align: center;
    max-width: 560px;
    margin: 0 auto;
  }

  .jr-landing-cta .jr-landing-body {
    margin: 0 auto 28px;
  }

  /* Buttons — reuse design system values */
  .jr-landing .jr-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.15s ease;
    text-decoration: none;
    border: none;
  }

  .jr-landing .jr-btn-primary {
    background: #2563eb;
    color: #ffffff;
  }

  .jr-landing .jr-btn-primary:hover {
    background: #1d4ed8;
  }

  .jr-landing .jr-btn-secondary {
    background: #ffffff;
    color: #374151;
    border: 1px solid #e5e7eb;
  }

  .jr-landing .jr-btn-secondary:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .jr-landing-hero {
      padding: 80px 0 56px;
    }

    .jr-landing-h1 {
      font-size: 2rem;
    }

    .jr-landing-steps {
      grid-template-columns: 1fr;
    }

    .jr-landing-split {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .jr-landing-section {
      padding: 56px 0;
    }
  }
`;
