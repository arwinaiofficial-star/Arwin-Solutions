import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  BotIcon,
  BriefcaseIcon,
  CheckIcon,
  DocumentIcon,
  LocationIcon,
  RocketIcon,
  SparklesIcon,
} from "@/components/icons/Icons";

export const metadata: Metadata = {
  title: "JobReady - India-first Career Platform",
  description:
    "JobReady helps job seekers in India build stronger documents, search better roles, prepare for interviews, benchmark salaries, and plan career moves in one cleaner system.",
};

const pillars = [
  {
    title: "Documents Studio",
    body: "Resume, CV, and cover-letter workflows that stay grounded in real experience instead of disconnected copy generation.",
    icon: DocumentIcon,
  },
  {
    title: "Job Search Hub",
    body: "Search India-first roles, set a target job, and keep application tracking attached to actual decisions.",
    icon: BriefcaseIcon,
  },
  {
    title: "Interview & Salary",
    body: "Role-focused practice packs, answer framing, and transparent salary benchmarks for offer conversations.",
    icon: BotIcon,
  },
  {
    title: "Career Growth",
    body: "Pathways, skill-gap analysis, and role-transition guidance to move beyond one-off applications.",
    icon: SparklesIcon,
  },
];

const promises = [
  "No vague auto-apply promises",
  "No hidden recruiter outreach upsells",
  "No fake 'free' wording that converts later without clarity",
  "India-first role, city, and salary framing",
];

const roleTracks = [
  "Software and data roles",
  "Product, design, and operations",
  "Business, sales, and customer growth",
  "Career switches and next-role planning",
];

export default function JobReadyPage() {
  return (
    <>
      <style>{jobReadyStyles}</style>
      <section className="jrx-hero">
        <div className="container jrx-hero-shell">
          <div className="jrx-hero-copy">
            <div className="jrx-badge">
              <RocketIcon size={14} />
              India-first career platform
            </div>
            <h1>Career tools that feel enterprise-grade, not stitched together.</h1>
            <p>
              JobReady turns resume work, target-job selection, interview prep, salary benchmarking,
              and career planning into one cleaner system built for job seekers in India.
            </p>
            <div className="jrx-actions">
              <Link href="/jobready/signup" className="jrx-btn jrx-btn-primary">
                Start your workspace
              </Link>
              <Link href="/jobready/login" className="jrx-btn jrx-btn-secondary">
                Sign in
              </Link>
            </div>
            <div className="jrx-proof-grid">
              <div>
                <strong>4 pillars</strong>
                <span>Documents, jobs, interview, pathways</span>
              </div>
              <div>
                <strong>1 system</strong>
                <span>Shared context across every step</span>
              </div>
              <div>
                <strong>0 gimmicks</strong>
                <span>Transparent product boundaries</span>
              </div>
            </div>
          </div>

          <div className="jrx-hero-panel">
            <span className="jrx-panel-label">Why it feels better</span>
            <h2>Clarity beats clutter.</h2>
            <div className="jrx-panel-list">
              {promises.map((item) => (
                <div key={item} className="jrx-panel-item">
                  <span className="jrx-panel-check"><CheckIcon size={13} /></span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
            <div className="jrx-pricing-card">
              <span>Launch pricing</span>
              <strong>INR 1,499 / month</strong>
              <p>Clear monthly billing. No managed applications. No hidden service bundle.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container jrx-section">
          <div className="jrx-section-head">
            <span className="jrx-kicker">Platform pillars</span>
            <h2>A full platform, with one strongest path through it.</h2>
            <p>
              The best hiring systems help you move one opportunity forward with stronger evidence at each step.
              JobReady keeps that workflow central while expanding into interview, salary, and growth tools.
            </p>
          </div>
          <div className="jrx-pillars">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="jrx-pillar-card">
                  <div className="jrx-pillar-icon"><Icon size={18} /></div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section jrx-band">
        <div className="container jrx-band-shell">
          <div className="jrx-band-copy">
            <span className="jrx-kicker">Designed for India</span>
            <h2>Local context should not be an afterthought.</h2>
            <p>
              Salary conversations, hiring timelines, target cities, and role expectations vary. JobReady keeps
              the system calibrated for India-first job seekers instead of forcing a generic global playbook.
            </p>
          </div>
          <div className="jrx-band-grid">
            {roleTracks.map((item) => (
              <div key={item} className="jrx-band-card">
                <LocationIcon size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container jrx-section">
          <div className="jrx-section-head">
            <span className="jrx-kicker">Execution model</span>
            <h2>From first draft to active pipeline.</h2>
          </div>
          <div className="jrx-flow-grid">
            <div className="jrx-flow-step">
              <span>01</span>
              <strong>Build the baseline</strong>
              <p>Import resume details and tighten ATS quality inside Documents Studio.</p>
            </div>
            <div className="jrx-flow-step">
              <span>02</span>
              <strong>Pick better targets</strong>
              <p>Search and rank roles before you waste effort tailoring weak opportunities.</p>
            </div>
            <div className="jrx-flow-step">
              <span>03</span>
              <strong>Prep the conversation</strong>
              <p>Use interview and salary tools to turn a good fit into a stronger offer discussion.</p>
            </div>
            <div className="jrx-flow-step">
              <span>04</span>
              <strong>Plan the next move</strong>
              <p>Map adjacent roles and skill gaps so career growth continues beyond one application cycle.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="jrx-cta">
            <div>
              <span className="jrx-kicker">Ready to switch platforms?</span>
              <h2>Use a clearer career system.</h2>
              <p>Start with the resume workflow, then expand into search, interview prep, salary, and pathways from the same workspace.</p>
            </div>
            <div className="jrx-cta-actions">
              <Link href="/jobready/signup" className="jrx-btn jrx-btn-primary">
                Create account
              </Link>
              <Link href="/jobready/login" className="jrx-btn jrx-btn-secondary">
                Explore the app
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const jobReadyStyles = `
  .jrx-hero {
    padding: 88px 0 48px;
    background:
      radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 28%),
      radial-gradient(circle at bottom right, rgba(16,185,129,0.12), transparent 22%),
      linear-gradient(180deg, rgba(255,255,255,0.02), transparent 20%),
      #04101a;
  }
  .jrx-hero-shell {
    display:grid;
    grid-template-columns:minmax(0,1.35fr) minmax(320px,0.9fr);
    gap:28px;
    align-items:stretch;
  }
  .jrx-badge,
  .jrx-kicker,
  .jrx-panel-label {
    display:inline-flex;
    align-items:center;
    gap:8px;
    font-size:0.7rem;
    text-transform:uppercase;
    letter-spacing:0.18em;
    font-weight:700;
    color:#7dd3fc;
  }
  .jrx-hero-copy h1 {
    max-width: 760px;
    margin: 16px 0 14px;
    color:#fff;
    font-size: clamp(2.8rem, 5vw, 4.6rem);
    line-height: 1.02;
  }
  .jrx-hero-copy p {
    max-width: 720px;
    color:#a7bacd;
    font-size:1.06rem;
  }
  .jrx-actions,
  .jrx-cta-actions {
    display:flex;
    flex-wrap:wrap;
    gap:12px;
    margin-top:20px;
  }
  .jrx-btn {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    min-height:48px;
    padding:0 20px;
    border-radius:999px;
    font-weight:700;
  }
  .jrx-btn-primary {
    background:linear-gradient(135deg,#0ea5e9,#2563eb);
    color:#fff;
    box-shadow:0 24px 44px rgba(14,165,233,0.22);
  }
  .jrx-btn-secondary {
    border:1px solid rgba(148,163,184,0.16);
    background:rgba(7,18,31,0.72);
    color:#e5f2ff;
  }
  .jrx-proof-grid {
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:16px;
    margin-top:28px;
  }
  .jrx-proof-grid div,
  .jrx-hero-panel,
  .jrx-pillar-card,
  .jrx-band-card,
  .jrx-flow-step,
  .jrx-cta {
    border:1px solid rgba(148,163,184,0.12);
    background:rgba(7,18,31,0.72);
    border-radius:24px;
  }
  .jrx-proof-grid div {
    padding:18px;
  }
  .jrx-proof-grid strong {
    display:block;
    color:#fff;
    margin-bottom:6px;
  }
  .jrx-proof-grid span {
    color:#99aec4;
    font-size:0.92rem;
  }
  .jrx-hero-panel {
    padding:24px;
    display:flex;
    flex-direction:column;
    gap:16px;
    background:linear-gradient(180deg, rgba(14,165,233,0.08), rgba(7,18,31,0.78));
  }
  .jrx-hero-panel h2 {
    color:#fff;
    margin:0;
  }
  .jrx-panel-list {
    display:flex;
    flex-direction:column;
    gap:12px;
  }
  .jrx-panel-item {
    display:flex;
    gap:12px;
    align-items:flex-start;
  }
  .jrx-panel-check {
    width:24px;
    height:24px;
    border-radius:999px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    background:rgba(34,197,94,0.16);
    color:#bbf7d0;
    flex-shrink:0;
  }
  .jrx-panel-item p,
  .jrx-pricing-card p {
    margin:0;
    color:#a7bacd;
  }
  .jrx-pricing-card {
    margin-top:auto;
    padding:18px;
    border-radius:20px;
    background:rgba(3,10,19,0.72);
  }
  .jrx-pricing-card span {
    font-size:0.76rem;
    text-transform:uppercase;
    letter-spacing:0.16em;
    color:#7dd3fc;
  }
  .jrx-pricing-card strong {
    display:block;
    margin:10px 0 8px;
    color:#fff;
    font-size:1.4rem;
  }
  .jrx-section {
    display:flex;
    flex-direction:column;
    gap:24px;
  }
  .jrx-section-head p {
    margin:12px 0 0;
    max-width:760px;
  }
  .jrx-pillars,
  .jrx-band-grid,
  .jrx-flow-grid {
    display:grid;
    gap:16px;
  }
  .jrx-pillars {
    grid-template-columns:repeat(4,minmax(0,1fr));
  }
  .jrx-pillar-card,
  .jrx-flow-step {
    padding:20px;
  }
  .jrx-pillar-icon {
    width:48px;
    height:48px;
    border-radius:16px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    background:rgba(14,165,233,0.12);
    color:#7dd3fc;
  }
  .jrx-pillar-card h3,
  .jrx-flow-step strong,
  .jrx-band-copy h2,
  .jrx-cta h2 {
    margin:14px 0 8px;
    color:#fff;
  }
  .jrx-pillar-card p,
  .jrx-band-copy p,
  .jrx-flow-step p,
  .jrx-cta p {
    margin:0;
    color:#9db1c6;
  }
  .jrx-band {
    background:linear-gradient(180deg, rgba(2,8,23,0.65), rgba(7,18,31,0.65));
  }
  .jrx-band-shell {
    display:grid;
    grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);
    gap:24px;
    align-items:start;
  }
  .jrx-band-grid {
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
  .jrx-band-card {
    padding:18px;
    display:flex;
    align-items:center;
    gap:12px;
    color:#dbeafe;
  }
  .jrx-flow-grid {
    grid-template-columns:repeat(4,minmax(0,1fr));
  }
  .jrx-flow-step span {
    color:#7dd3fc;
    font-size:0.86rem;
    font-weight:700;
  }
  .jrx-cta {
    padding:28px;
    display:flex;
    justify-content:space-between;
    gap:24px;
    align-items:center;
    background:linear-gradient(135deg, rgba(14,165,233,0.12), rgba(37,99,235,0.08));
  }
  @media (max-width: 1080px) {
    .jrx-hero-shell,
    .jrx-band-shell,
    .jrx-pillars,
    .jrx-flow-grid {
      grid-template-columns:1fr 1fr;
    }
    .jrx-hero-panel {
      order:-1;
    }
  }
  @media (max-width: 760px) {
    .jrx-hero-shell,
    .jrx-proof-grid,
    .jrx-pillars,
    .jrx-band-shell,
    .jrx-band-grid,
    .jrx-flow-grid,
    .jrx-cta {
      grid-template-columns:1fr;
      display:grid;
    }
    .jrx-cta {
      align-items:flex-start;
    }
  }
`;
