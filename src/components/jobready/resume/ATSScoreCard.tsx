"use client";

import { useState } from "react";
import { resumeApi } from "@/lib/api/client";
import { ResumeData } from "./types";
import { SparklesIcon, CheckIcon, AlertIcon } from "@/components/icons/Icons";

interface ATSScoreCardProps {
  data: ResumeData;
}

interface ATSResult {
  score: number;
  verdict: "proceed" | "improve";
  strengths: string[];
  weaknesses: string[];
  keywords: string[];
  missingKeywords: string[];
}

export default function ATSScoreCard({ data }: ATSScoreCardProps) {
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateATS = async () => {
    setLoading(true);
    try {
      const res = await resumeApi.chat(
        "Calculate the ATS compatibility score for this resume. Consider formatting, keyword density, section completeness, and standard ATS requirements. Return JSON with: score (0-100), strengths (array), weaknesses (array), keywords (found), missingKeywords (commonly expected but absent).",
        "ats_score",
        { resumeData: data as unknown as Record<string, unknown> }
      );

      if (res.data?.reply) {
        const parsed = parseATSResult(res.data.reply, data);
        setResult(parsed);
      } else {
        setResult(localATSScore(data));
      }
    } catch {
      setResult(localATSScore(data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jr-ats-card">
      {!result ? (
        <div className="jr-ats-prompt">
          <h3>ATS Compatibility Check</h3>
          <p>See how your resume performs with Applicant Tracking Systems used by 75% of employers.</p>
          <button
            className="jr-btn jr-btn-primary jr-btn-sm"
            onClick={calculateATS}
            disabled={loading}
          >
            <SparklesIcon size={14} />
            {loading ? "Scanning..." : "Check ATS Score"}
          </button>
        </div>
      ) : (
        <div className="jr-ats-result">
          <div className="jr-ats-score-ring" data-level={
            result.score >= 80 ? "high" : result.score >= 50 ? "medium" : "low"
          }>
            <span className="jr-ats-score-value">{result.score}</span>
            <span className="jr-ats-score-label">ATS Score</span>
          </div>

          <div className={`jr-ats-verdict ${result.verdict}`}>
            {result.verdict === "proceed" ? (
              <><CheckIcon size={14} /> Your resume is ready for applications</>
            ) : (
              <><AlertIcon size={14} /> Consider improving before applying</>
            )}
          </div>

          {result.strengths.length > 0 && (
            <div className="jr-ats-section">
              <h4>Strengths</h4>
              {result.strengths.map((s, i) => (
                <div key={i} className="jr-ats-item jr-ats-strength">
                  <CheckIcon size={12} /> <span>{s}</span>
                </div>
              ))}
            </div>
          )}

          {result.weaknesses.length > 0 && (
            <div className="jr-ats-section">
              <h4>To Improve</h4>
              {result.weaknesses.map((w, i) => (
                <div key={i} className="jr-ats-item jr-ats-weakness">
                  <AlertIcon size={12} /> <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {result.missingKeywords.length > 0 && (
            <div className="jr-ats-section">
              <h4>Consider Adding</h4>
              <div className="jr-ats-keywords">
                {result.missingKeywords.map((k) => (
                  <span key={k} className="jr-badge jr-badge-yellow">{k}</span>
                ))}
              </div>
            </div>
          )}

          <button
            className="jr-btn jr-btn-ghost jr-btn-sm jr-ats-card-refresh"
            onClick={calculateATS}
            disabled={loading}
          >
            {loading ? "Re-scanning..." : "Re-check Score"}
          </button>
        </div>
      )}
    </div>
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
  } catch { /* fall through */ }
  return localATSScore(data);
}

function localATSScore(data: ResumeData): ATSResult {
  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Contact info
  if (data.fullName && data.email && data.phone) {
    score += 15;
    strengths.push("Complete contact information");
  } else {
    weaknesses.push("Incomplete contact information");
  }

  // Summary
  if (data.summary.length >= 80) {
    score += 15;
    strengths.push("Professional summary present");
  } else if (data.summary.length > 0) {
    score += 8;
    weaknesses.push("Summary is too brief — aim for 2-3 sentences");
  } else {
    weaknesses.push("Missing professional summary");
  }

  // Experience
  if (data.experiences.length > 0) {
    score += 10;
    const withHighlights = data.experiences.filter((e) => e.highlights.length >= 2);
    if (withHighlights.length === data.experiences.length) {
      score += 15;
      strengths.push("Experience entries have detailed bullet points");
    } else {
      score += 5;
      weaknesses.push("Some experience entries need more bullet points");
    }
    const withDates = data.experiences.filter((e) => e.startDate);
    if (withDates.length === data.experiences.length) {
      score += 5;
    } else {
      weaknesses.push("Add dates to all experience entries");
    }
  } else {
    weaknesses.push("No work experience listed");
  }

  // Education
  if (data.education.length > 0) {
    score += 10;
    strengths.push("Education section present");
  } else {
    weaknesses.push("No education listed");
  }

  // Skills
  if (data.skills.length >= 5) {
    score += 15;
    strengths.push(`${data.skills.length} skills listed`);
  } else if (data.skills.length > 0) {
    score += 8;
    weaknesses.push("Add more skills — aim for 8-15");
  } else {
    weaknesses.push("No skills listed");
  }

  // LinkedIn
  if (data.linkedIn) {
    score += 5;
    strengths.push("LinkedIn profile included");
  }

  // Formatting: ATS-friendly checks
  score += 10; // Our editor uses clean formatting by default
  strengths.push("Clean, ATS-compatible formatting");

  const finalScore = Math.min(100, score);

  return {
    score: finalScore,
    verdict: finalScore >= 60 ? "proceed" : "improve",
    strengths,
    weaknesses,
    keywords: data.skills.slice(0, 10),
    missingKeywords: finalScore < 70 ? ["Quantified achievements", "Action verbs", "Industry keywords"] : [],
  };
}
