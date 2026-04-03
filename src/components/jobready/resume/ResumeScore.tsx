"use client";

export interface ResumeScoreSection {
  label: string;
  status: "complete" | "current" | "attention" | "pending";
  note: string;
}

interface ResumeScoreProps {
  score: number;
  hint: string;
  sections: ResumeScoreSection[];
  nextActionLabel: string;
  nextActionCopy: string;
}

export default function ResumeScore({
  score,
  hint,
  sections,
  nextActionLabel,
  nextActionCopy,
}: ResumeScoreProps) {
  let tone: "low" | "mid" | "high" = "low";
  if (score >= 40 && score < 70) tone = "mid";
  else if (score >= 70) tone = "high";

  return (
    <section className="jr-score" data-tone={tone}>
      <div className="jr-score-header">
        <div>
          <span className="jr-page-eyebrow">Resume health</span>
          <h3>{score >= 80 ? "Ready to move forward" : "Still tightening key sections"}</h3>
          <p>{hint}</p>
        </div>
        <div className="jr-score-badge">
          <strong>{score}%</strong>
          <span>complete</span>
        </div>
      </div>

      <div className="jr-score-progress" aria-hidden="true">
        <div className="jr-score-progress-bar" style={{ width: `${score}%` }} />
      </div>

      <div className="jr-score-info">
        <div className="jr-score-label">What to focus on next</div>
        <div className="jr-score-hint">
          <strong>{nextActionLabel}</strong>
          <span>{nextActionCopy}</span>
        </div>
      </div>

      <div className="jr-score-section-list">
        {sections.map((section) => (
          <div key={section.label} className={`jr-score-section jr-score-section-${section.status}`}>
            <div className="jr-score-section-top">
              <span className="jr-score-section-dot" aria-hidden="true" />
              <strong>{section.label}</strong>
            </div>
            <span>{section.note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
