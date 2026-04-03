"use client";

import { useEffect, useMemo, useState } from "react";
import { resumeApi } from "@/lib/api/client";
import { ResumeData } from "./types";
import { SparklesIcon, CheckIcon, AlertIcon } from "@/components/icons/Icons";

interface ATSScoreCardProps {
  data: ResumeData;
  onResultChange?: (result: ATSResult) => void;
}

export interface ATSResult {
  score: number;
  verdict: "proceed" | "improve";
  strengths: string[];
  weaknesses: string[];
  keywords: string[];
  missingKeywords: string[];
}

export default function ATSScoreCard({ data, onResultChange }: ATSScoreCardProps) {
  const localResult = useMemo(() => buildLocalATSScore(data), [data]);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const activeResult = result ?? localResult;

  useEffect(() => {
    setResult(null);
  }, [data]);

  useEffect(() => {
    onResultChange?.(activeResult);
  }, [activeResult, onResultChange]);

  const calculateATS = async () => {
    setLoading(true);
    try {
      const res = await resumeApi.chat(
        "Calculate the ATS compatibility score for this resume. Consider formatting, keyword density, section completeness, and standard ATS requirements. Return JSON with: score (0-100), strengths (array), weaknesses (array), keywords (found), missingKeywords (commonly expected but absent).",
        "ats_score",
        { resumeData: data as unknown as Record<string, unknown> }
      );

      if (res.data?.reply) {
        setResult(parseATSResult(res.data.reply, data));
      } else {
        setResult(localResult);
      }
    } catch {
      setResult(localResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="jr-ats-card">
      <div className="jr-ats-card-top">
        <div className="jr-ats-card-copy">
          <span className="jr-page-eyebrow">ATS review</span>
          <h3>Check whether this draft is ready for live applications.</h3>
          <p>
            Start with the instant local read, then run a deeper AI scan when you want a second pass.
          </p>
        </div>
        <div
          className="jr-ats-score-block"
          data-level={activeResult.score >= 80 ? "high" : activeResult.score >= 50 ? "medium" : "low"}
        >
          <strong>{activeResult.score}</strong>
          <span>ATS score</span>
        </div>
      </div>

      <div className="jr-ats-score-meter" aria-hidden="true">
        <div style={{ width: `${activeResult.score}%` }} />
      </div>

      <div className={`jr-ats-verdict jr-ats-verdict-${activeResult.verdict}`} role="status">
        {activeResult.verdict === "proceed" ? (
          <>
            <CheckIcon size={14} /> Strong enough to start applying while you keep refining.
          </>
        ) : (
          <>
            <AlertIcon size={14} /> Tighten the flagged areas before relying on this draft for live applications.
          </>
        )}
      </div>

      <div className="jr-ats-grid">
        <div className="jr-ats-section">
          <h4>Working well</h4>
          <div className="jr-ats-item-list">
            {activeResult.strengths.length > 0 ? (
              activeResult.strengths.map((strength, index) => (
                <div key={index} className="jr-ats-item jr-ats-strength">
                  <CheckIcon size={12} />
                  <span>{strength}</span>
                </div>
              ))
            ) : (
              <div className="jr-ats-item">
                <span>Add more detail to surface concrete strengths.</span>
              </div>
            )}
          </div>
        </div>

        <div className="jr-ats-section">
          <h4>Fix before sending</h4>
          <div className="jr-ats-item-list">
            {activeResult.weaknesses.length > 0 ? (
              activeResult.weaknesses.map((weakness, index) => (
                <div key={index} className="jr-ats-item jr-ats-weakness">
                  <AlertIcon size={12} />
                  <span>{weakness}</span>
                </div>
              ))
            ) : (
              <div className="jr-ats-item jr-ats-strength">
                <CheckIcon size={12} />
                <span>No critical ATS gaps detected in the current draft.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeResult.missingKeywords.length > 0 && (
        <div className="jr-ats-section">
          <h4>Common keywords to add honestly</h4>
          <div className="jr-ats-keywords">
            {activeResult.missingKeywords.map((keyword) => (
              <span key={keyword} className="jr-badge jr-badge-yellow">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="jr-ats-actions">
        <div className="jr-text-muted">
          {result ? "AI scan included." : "Instant assessment shown."}
        </div>
        <button
          className="jr-btn jr-btn-secondary jr-btn-sm"
          onClick={calculateATS}
          disabled={loading}
        >
          <SparklesIcon size={14} />
          {loading ? "Scanning..." : result ? "Refresh AI scan" : "Run AI scan"}
        </button>
      </div>
    </section>
  );
}

function parseATSResult(reply: string, data: ResumeData): ATSResult {
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.score === "number") {
        const score = Math.min(100, Math.max(0, parsed.score));
        return {
          score,
          verdict: score >= 60 ? "proceed" : "improve",
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          keywords: parsed.keywords || [],
          missingKeywords: parsed.missingKeywords || [],
        };
      }
    }
  } catch {
    // Fall through to local scoring.
  }

  return buildLocalATSScore(data);
}

export function buildLocalATSScore(data: ResumeData): ATSResult {
  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (data.fullName && data.email && data.phone) {
    score += 15;
    strengths.push("Complete contact information");
  } else {
    weaknesses.push("Complete your core contact details");
  }

  if (data.summary.length >= 80) {
    score += 15;
    strengths.push("Professional summary is present");
  } else if (data.summary.length > 0) {
    score += 8;
    weaknesses.push("Expand the summary into 2-3 focused sentences");
  } else {
    weaknesses.push("Add a professional summary");
  }

  if (data.experiences.length > 0) {
    score += 10;
    const withHighlights = data.experiences.filter((experience) => experience.highlights.length >= 2);
    if (withHighlights.length === data.experiences.length) {
      score += 15;
      strengths.push("Experience entries have supporting bullet points");
    } else {
      score += 5;
      weaknesses.push("Strengthen experience entries with 2-4 outcome bullets");
    }

    const withDates = data.experiences.filter((experience) => experience.startDate);
    if (withDates.length === data.experiences.length) {
      score += 5;
    } else {
      weaknesses.push("Add dates to every experience entry");
    }
  } else {
    weaknesses.push("Add at least one work experience entry");
  }

  if (data.education.length > 0) {
    score += 10;
    strengths.push("Education section is present");
  } else {
    weaknesses.push("Add your education history");
  }

  if (data.skills.length >= 5) {
    score += 15;
    strengths.push(`${data.skills.length} skills captured`);
  } else if (data.skills.length > 0) {
    score += 8;
    weaknesses.push("Add more relevant skills and tools");
  } else {
    weaknesses.push("Add your core skills");
  }

  if (data.linkedIn) {
    score += 5;
    strengths.push("LinkedIn profile included");
  }

  score += 10;
  strengths.push("Editor formatting is ATS-friendly by default");

  const finalScore = Math.min(100, score);

  return {
    score: finalScore,
    verdict: finalScore >= 60 ? "proceed" : "improve",
    strengths,
    weaknesses,
    keywords: data.skills.slice(0, 10),
    missingKeywords: finalScore < 70 ? ["Quantified outcomes", "Action verbs", "Role keywords"] : [],
  };
}
