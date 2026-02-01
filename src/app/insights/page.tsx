import Link from "next/link";

const insightPrompts = [
  "AI procurement checklists",
  "Telemetry rituals after launch",
  "Playbooks for vernacular UX",
];

export default function InsightsPage() {
  return (
    <main className="section-shell">
      <div className="shell stack-lg">
        <div>
          <p className="eyebrow">Insights</p>
          <h1 className="hero-title">Resources and essays are being refreshed.</h1>
          <p className="copy" style={{ maxWidth: "560px" }}>
            We are rewriting our case notes and playbooks to match the new site. Drop your email and we will send the
            updated guides once they ship.
          </p>
        </div>
        <div className="surface-card stack-md" style={{ maxWidth: "520px" }}>
          <p className="text-sm text-tertiary">Coming soon</p>
          <ul className="stack-sm" style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {insightPrompts.map((title) => (
              <li key={title} className="copy">{title}</li>
            ))}
          </ul>
          <Link href="mailto:hello@arwinaisolutions.com" className="btn btn-primary btn-full">
            Get notified
          </Link>
        </div>
      </div>
    </main>
  );
}
