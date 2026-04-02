import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@/components/icons/SiteIcons";

export const metadata: Metadata = {
  title: "JobReady | Arwin",
  description:
    "Build a resume, search for relevant roles, and track every application in one workflow with JobReady by Arwin.",
};

const featureCards = [
  {
    num: "01",
    title: "Resume builder",
    desc: "Create a resume from scratch, upload an existing file, or import from LinkedIn into one editable source of truth.",
    color: "#2563eb",
  },
  {
    num: "02",
    title: "Job search",
    desc: "Search by title, skill, or tool, then save only the roles worth tracking.",
    color: "#10b981",
  },
  {
    num: "03",
    title: "Application tracker",
    desc: "Move each role from saved to applied, interview, and offer without losing the thread.",
    color: "#7c3aed",
  },
];

const workflowSteps = [
  "Start with a resume or bring in the one you already have.",
  "Search roles and save the shortlist that actually fits.",
  "Track every application in one board until the process is done.",
];

const fitPoints = [
  "One workspace instead of separate resume, search, and tracker tools",
  "Fast mobile flow for checking jobs and updating status on the go",
  "Clear first-run path for new users instead of a noisy dashboard",
  "Simple enough for candidates, structured enough for teams to review",
];

export default function JobReadyPage() {
  return (
    <>
      <section
        className="section"
        style={{ paddingTop: "clamp(120px, 15vw, 168px)" }}
      >
        <div className="container">
          <div className="text-center mb-xl">
            <div className="badge mb-md">
              <SparklesIcon size={14} />
              JobReady by Arwin
            </div>
            <h1 style={{ maxWidth: "920px", margin: "0 auto var(--space-md)" }}>
              Build your resume, shortlist better roles, and track every application in one place.
            </h1>
            <p
              className="text-muted max-w-screen-md mx-auto"
              style={{ fontSize: "1.0625rem", maxWidth: "720px", marginBottom: "var(--space-xl)" }}
            >
              JobReady keeps resume editing, role discovery, and application tracking in one connected workflow.
            </p>
            <div className="flex gap-md justify-center" style={{ flexWrap: "wrap" }}>
              <Link href="/jobready/signup" className="btn btn-primary btn-lg">
                Create an Account
                <ArrowRightIcon size={18} />
              </Link>
              <Link href="/jobready/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Product Overview</div>
            <h2>Three connected parts of the same workflow.</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Each screen does one job well, and the data carries forward instead of making users start over.
            </p>
          </div>

          <div className="grid grid-3">
            {featureCards.map((card) => (
              <div key={card.num} className="solution-card">
                <div
                  className="icon-container mb-md"
                  style={{
                    background: `${card.color}14`,
                    border: `1px solid ${card.color}25`,
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: "0.875rem", color: card.color }}>
                    {card.num}
                  </span>
                </div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container"><div className="section-divider" /></div>

      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "start", gap: "var(--space-xl)" }}>
            <div>
              <div className="eyebrow mb-sm">How It Works</div>
              <h2>Simple enough to explain in one minute.</h2>
              <p className="text-muted" style={{ fontSize: "1.0625rem", maxWidth: "460px" }}>
                Users start with the resume, move into search, and then track progress in one board. Nothing is hidden behind a complex setup.
              </p>
            </div>
            <div className="solution-card">
              <ul className="feature-list" style={{ marginBottom: 0 }}>
                {workflowSteps.map((item) => (
                  <li key={item}>
                    <CheckCircleIcon size={18} color="#10b981" className="feature-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "start", gap: "var(--space-xl)" }}>
            <div>
              <div className="eyebrow mb-sm">Why It Lands</div>
              <h2>Clear enough for candidates, structured enough for reviewers.</h2>
            </div>
            <div className="solution-card">
              <ul className="feature-list" style={{ marginBottom: 0 }}>
                {fitPoints.map((item) => (
                  <li key={item}>
                    <CheckCircleIcon size={18} color="#2563eb" className="feature-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-card">
            <SparklesIcon size={32} color="var(--color-primary-light)" />
            <h2 style={{ marginTop: "var(--space-md)", marginBottom: "var(--space-md)" }}>
              Open JobReady and walk the full flow in one account.
            </h2>
            <p
              className="text-muted"
              style={{ fontSize: "1.0625rem", maxWidth: "640px", margin: "0 auto var(--space-xl)" }}
            >
              Resume, jobs, and tracking stay connected from the first screen to the last.
            </p>
            <div className="flex gap-md justify-center" style={{ flexWrap: "wrap" }}>
              <Link href="/jobready/signup" className="btn btn-primary btn-lg">
                Create an Account
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
