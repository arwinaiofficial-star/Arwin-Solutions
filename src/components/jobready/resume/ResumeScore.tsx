"use client";

interface ResumeScoreProps {
  score: number;
  hint: string;
}

export default function ResumeScore({ score, hint }: ResumeScoreProps) {
  let scoreClass = "jr-score-low";
  if (score >= 40 && score < 70) scoreClass = "jr-score-mid";
  else if (score >= 70) scoreClass = "jr-score-high";

  return (
    <div className="jr-score">
      <div className={`jr-score-circle ${scoreClass}`}>
        {score}
      </div>
      <div className="jr-score-info">
        <div className="jr-score-label">Resume Completeness</div>
        <div className="jr-score-hint">{hint}</div>
      </div>
    </div>
  );
}
