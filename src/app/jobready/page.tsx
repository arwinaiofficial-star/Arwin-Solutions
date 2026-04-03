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
    "Create a resume, search jobs, and track applications in one connected workflow with JobReady by Arwin.",
};

const featureCards = [
  {
    num: "01",
    title: "Resume builder",
    desc: "Start from scratch, upload a file, import LinkedIn, or open a template in one editor.",
    color: "#2563eb",
  },
  {
    num: "02",
    title: "Job search",
    desc: "Search by title, skill, or tool, then keep only the roles worth pursuing.",
    color: "#10b981",
  },
  {
    num: "03",
    title: "Application tracker",
    desc: "Move each role through saved, applied, interview, and offer in one place.",
    color: "#7c3aed",
  },
];

const workflowSteps = [
  "Bring in a resume or create one from scratch.",
  "Search roles and keep the shortlist tight.",
  "Open, apply, and track every role in one workspace.",
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
              Create a resume, find matching roles, and track every application in one workflow.
            </h1>
            <p
              className="text-muted max-w-screen-md mx-auto"
              style={{ fontSize: "1.0625rem", maxWidth: "720px", marginBottom: "var(--space-xl)" }}
            >
              JobReady keeps the candidate journey in one place so users do not jump between separate resume, search, and tracker tools.
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
            <h2>One product, three working parts.</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Each part does one clear job and hands context to the next step instead of making users start over.
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
              <h2>A clean three-step flow.</h2>
              <p className="text-muted" style={{ fontSize: "1.0625rem", maxWidth: "460px" }}>
                Users start with the resume, move into jobs, and keep the pipeline current without leaving the workspace.
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
          <div className="cta-card">
            <SparklesIcon size={32} color="var(--color-primary-light)" />
            <h2 style={{ marginTop: "var(--space-md)", marginBottom: "var(--space-md)" }}>
              Open JobReady and run the full flow in one account.
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
