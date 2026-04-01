"use client";

import { useState } from "react";
import { resumeApi } from "@/lib/api/client";
import { ResumeData } from "./types";
import { SparklesIcon } from "@/components/icons/Icons";

interface ResumeAnalyzerProps {
  data: ResumeData;
  currentStep: number;
  onApplySuggestion?: (field: string, value: unknown) => void;
}

interface AnalysisResult {
  score: number;
  suggestions: Suggestion[];
  summary: string;
}

interface Suggestion {
  id: string;
  field: string;
  message: string;
  severity: "critical" | "improvement" | "tip";
  applied?: boolean;
}

const STEP_CONTEXT: Record<number, string> = {
  1: "personal_info",
  2: "experience",
  3: "education",
  4: "skills",
  5: "summary",
};

export default function ResumeAnalyzer({ data, currentStep, onApplySuggestion }: ResumeAnalyzerProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const analyze = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const stepContext = STEP_CONTEXT[currentStep] || "general";
      const result = await resumeApi.chat(
        `Analyze my resume for the ${stepContext} section. Be specific about what's missing or could be improved. Return a JSON object with: score (0-100), summary (one sentence), suggestions (array of objects with id, field, message, severity).`,
        "analyze_resume",
        {
          step: stepContext,
          resumeData: data as unknown as Record<string, unknown>,
          currentStep,
        }
      );

      if (result.data?.reply) {
        const parsed = parseAnalysis(result.data.reply, currentStep, data);
        setAnalysis(parsed);
      } else {
        // Fallback: local analysis
        setAnalysis(localAnalysis(currentStep, data));
      }
    } catch {
      setAnalysis(localAnalysis(currentStep, data));
    } finally {
      setLoading(false);
    }
  };

  const markApplied = (id: string) => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      suggestions: analysis.suggestions.map((s) =>
        s.id === id ? { ...s, applied: true } : s
      ),
    });
  };

  const pendingSuggestions = analysis?.suggestions.filter((s) => !s.applied) || [];
  const appliedCount = (analysis?.suggestions.length || 0) - pendingSuggestions.length;

  return (
    <div className="jr-analyzer">
      <div className="jr-analyzer-header">
        <button
          className="jr-btn jr-btn-secondary jr-btn-sm jr-ai-btn"
          onClick={analyze}
          disabled={loading}
        >
          <SparklesIcon size={14} />
          {loading ? "Analyzing..." : analysis ? "Re-analyze" : "Analyze & Improve"}
        </button>
        {analysis && (
          <span className="jr-analyzer-score" data-level={
            analysis.score >= 80 ? "high" : analysis.score >= 50 ? "medium" : "low"
          }>
            Step Score: {analysis.score}%
          </span>
        )}
      </div>

      {analysis && expanded && (
        <div className="jr-analyzer-results">
          <p className="jr-analyzer-summary">{analysis.summary}</p>

          {appliedCount > 0 && (
            <p className="jr-analyzer-progress">
              {appliedCount} of {analysis.suggestions.length} suggestions addressed
            </p>
          )}

          {pendingSuggestions.length > 0 && (
            <div className="jr-analyzer-suggestions">
              {pendingSuggestions.map((s) => (
                <div key={s.id} className={`jr-analyzer-suggestion jr-analyzer-${s.severity}`}>
                  <div className="jr-analyzer-suggestion-content">
                    <span className="jr-analyzer-severity-dot" />
                    <p>{s.message}</p>
                  </div>
                  {onApplySuggestion && (
                    <button
                      className="jr-btn jr-btn-ghost jr-btn-sm"
                      onClick={() => markApplied(s.id)}
                      title="Mark as addressed"
                    >
                      Done
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {pendingSuggestions.length === 0 && analysis.suggestions.length > 0 && (
            <p className="jr-analyzer-complete">All suggestions addressed. Looking great!</p>
          )}
        </div>
      )}

      {analysis && (
        <button
          className="jr-btn jr-btn-ghost jr-btn-sm"
          onClick={() => setExpanded(!expanded)}
          style={{ marginTop: "4px", fontSize: "11px" }}
        >
          {expanded ? "Hide" : "Show"} analysis
        </button>
      )}
    </div>
  );
}

/**
 * Parse AI response into structured analysis, with fallback
 */
function parseAnalysis(reply: string, step: number, data: ResumeData): AnalysisResult {
  try {
    // Try to extract JSON from the reply
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.score && parsed.suggestions) {
        return {
          score: Math.min(100, Math.max(0, parsed.score)),
          summary: parsed.summary || "Analysis complete.",
          suggestions: (parsed.suggestions as Suggestion[]).map((s, i) => ({
            ...s,
            id: s.id || `s_${i}`,
            severity: s.severity || "improvement",
          })),
        };
      }
    }
  } catch {
    // Fall through to local analysis
  }

  // If AI gave unstructured text, convert to suggestions
  const lines = reply.split("\n").filter((l) => l.trim().length > 10);
  return {
    score: 60,
    summary: lines[0] || "Review the suggestions below to improve your resume.",
    suggestions: lines.slice(0, 5).map((line, i) => ({
      id: `ai_${i}`,
      field: STEP_CONTEXT[step] || "general",
      message: line.replace(/^[-•*\d.]+\s*/, ""),
      severity: i === 0 ? "critical" as const : "improvement" as const,
    })),
  };
}

/**
 * Local fallback analysis with deep ATS intelligence (no API needed)
 * Based on 2026 ATS research: skills-based screening, keyword placement weighting,
 * NLP-powered parsing, and format compliance requirements.
 */
function localAnalysis(step: number, data: ResumeData): AnalysisResult {
  const suggestions: Suggestion[] = [];

  if (step === 1) {
    // Contact info: ATS systems skip headers/footers — 25% fail to parse them
    if (!data.fullName.trim()) suggestions.push({ id: "name", field: "fullName", message: "Add your full name — ATS uses this as the primary identifier. Use your professional name consistently.", severity: "critical" });
    if (!data.email.trim()) suggestions.push({ id: "email", field: "email", message: "Include a professional email address. Avoid nicknames (use firstname.lastname@...).", severity: "critical" });
    else if (data.email.includes("yahoo") || data.email.includes("hotmail")) suggestions.push({ id: "email_pro", field: "email", message: "Consider using a Gmail or custom domain email — it signals professionalism to recruiters.", severity: "tip" });
    if (!data.phone.trim()) suggestions.push({ id: "phone", field: "phone", message: "Add a phone number. ATS systems flag incomplete contact info.", severity: "improvement" });
    if (!data.linkedIn.trim()) suggestions.push({ id: "linkedin", field: "linkedIn", message: "Adding your LinkedIn profile URL increases callback rates by 40%. ATS systems cross-reference LinkedIn data.", severity: "improvement" });
    if (!data.location.trim()) suggestions.push({ id: "location", field: "location", message: "Include city and state/country. Over 60% of ATS systems filter candidates by location.", severity: "improvement" });
    else if (data.location.trim().split(/[,\s]+/).length < 2) suggestions.push({ id: "location_full", field: "location", message: "Use 'City, State' format (e.g. 'San Francisco, CA'). ATS location parsing works best with standard formats.", severity: "tip" });
  }

  if (step === 2) {
    // Experience: ATS reads reverse-chronological, weights recent roles higher
    if (data.experiences.length === 0) {
      suggestions.push({ id: "no_exp", field: "experiences", message: "Add at least one work experience. ATS systems rank resumes with verified experience significantly higher.", severity: "critical" });
    } else {
      data.experiences.forEach((exp, i) => {
        if (exp.highlights.length === 0) suggestions.push({ id: `exp_${i}_hl`, field: "experiences", message: `"${exp.title || `Role ${i + 1}`}" has no bullet points. ATS scores action-verb bullets with metrics much higher. Add 3-5 per role.`, severity: "critical" });
        else {
          if (exp.highlights.length < 3) suggestions.push({ id: `exp_${i}_few`, field: "experiences", message: `"${exp.title}" needs more bullets (aim for 3-5). Each should start with an action verb and include a measurable result.`, severity: "improvement" });
          // Check for weak bullets (no numbers/metrics)
          const weakBullets = exp.highlights.filter(h => !/\d/.test(h));
          if (weakBullets.length > 0 && exp.highlights.length > 0) {
            const pct = Math.round((weakBullets.length / exp.highlights.length) * 100);
            if (pct > 50) suggestions.push({ id: `exp_${i}_metrics`, field: "experiences", message: `${pct}% of bullets in "${exp.title}" lack quantifiable metrics. ATS and recruiters prioritize results like "increased X by 30%" or "managed team of 8".`, severity: "improvement" });
          }
          // Check for action verbs
          const weakStarts = exp.highlights.filter(h => {
            const first = h.trim().split(/\s/)[0]?.toLowerCase() || "";
            return ["i", "my", "the", "was", "worked", "helped", "responsible"].includes(first);
          });
          if (weakStarts.length > 0) suggestions.push({ id: `exp_${i}_verbs`, field: "experiences", message: `Avoid starting bullets with "Responsible for" or "Helped" — use strong action verbs like "Led", "Built", "Reduced", "Launched", "Drove".`, severity: "improvement" });
        }
        if (!exp.startDate) suggestions.push({ id: `exp_${i}_date`, field: "experiences", message: `Add start date for "${exp.title || `Role ${i + 1}`}". ATS systems flag roles without dates.`, severity: "improvement" });
        if (!exp.title.trim()) suggestions.push({ id: `exp_${i}_title`, field: "experiences", message: `Add a job title. ATS matches job titles against the position you're applying for.`, severity: "critical" });
        if (!exp.company.trim()) suggestions.push({ id: `exp_${i}_company`, field: "experiences", message: `Add the company name. Missing company info hurts ATS parsing accuracy.`, severity: "improvement" });
      });
      // Check for reverse chronological order
      const dates = data.experiences.map(e => e.startDate).filter(Boolean);
      if (dates.length >= 2) {
        const isReverse = dates.every((d, i) => i === 0 || d <= dates[i - 1]);
        if (!isReverse) suggestions.push({ id: "exp_order", field: "experiences", message: "List experiences in reverse chronological order (most recent first). This is the format ATS systems expect.", severity: "improvement" });
      }
    }
  }

  if (step === 3) {
    if (data.education.length === 0) {
      suggestions.push({ id: "no_edu", field: "education", message: "Add your education. ATS systems check education level when job descriptions require specific degrees.", severity: "critical" });
    } else {
      data.education.forEach((edu, i) => {
        if (!edu.degree) suggestions.push({ id: `edu_${i}_deg`, field: "education", message: `Specify your degree type (e.g. 'B.S. Computer Science'). ATS filters by degree level.`, severity: "improvement" });
        if (!edu.institution) suggestions.push({ id: `edu_${i}_inst`, field: "education", message: `Add your institution name. ATS systems verify education entries.`, severity: "improvement" });
        if (!edu.graduationYear) suggestions.push({ id: `edu_${i}_year`, field: "education", message: `Add graduation year. Use consistent date formatting across your resume.`, severity: "tip" });
      });
    }
  }

  if (step === 4) {
    // Skills: 60%+ of companies now filter by skills BEFORE reviewing job history
    if (data.skills.length === 0) {
      suggestions.push({ id: "no_skills", field: "skills", message: "Add your skills. In 2026, 60%+ of ATS systems filter by skills before reviewing job history — this section is critical.", severity: "critical" });
    } else if (data.skills.length < 5) {
      suggestions.push({ id: "few_skills", field: "skills", message: `You have ${data.skills.length} skills listed. Strong ATS-optimized resumes include 8-15 relevant skills. Add both technical and professional skills.`, severity: "improvement" });
    } else if (data.skills.length >= 5 && data.skills.length < 8) {
      suggestions.push({ id: "more_skills", field: "skills", message: "Consider adding a few more skills (aim for 10-12). Include both the full term and abbreviation for technical skills (e.g. 'Machine Learning (ML)').", severity: "tip" });
    } else if (data.skills.length > 20) {
      suggestions.push({ id: "many_skills", field: "skills", message: "Too many skills can dilute impact. Narrow to your strongest 10-15 that match your target role.", severity: "tip" });
    }
    // Check if skills also appear in experience bullets (keyword reinforcement)
    if (data.skills.length > 0 && data.experiences.length > 0) {
      const allBullets = data.experiences.flatMap(e => e.highlights).join(" ").toLowerCase();
      const unreinforced = data.skills.filter(s => !allBullets.includes(s.toLowerCase()));
      if (unreinforced.length > data.skills.length * 0.5) {
        suggestions.push({ id: "skill_reinforce", field: "skills", message: `ATS tip: Skills mentioned in both the Skills section AND experience bullets score higher. Try weaving skills like "${unreinforced.slice(0, 2).join('", "')}" into your experience bullets.`, severity: "improvement" });
      }
    }
  }

  if (step === 5) {
    // Summary: second-highest weighted section in ATS after Skills
    if (!data.summary.trim()) {
      suggestions.push({ id: "no_summary", field: "summary", message: "Write a 2-3 sentence professional summary. This is the second-highest weighted section for ATS keyword matching after Skills.", severity: "critical" });
    } else {
      if (data.summary.length < 80) suggestions.push({ id: "short_summary", field: "summary", message: "Your summary is too brief. Aim for 2-3 sentences that include your target role, years of experience, and top 3-4 skills.", severity: "improvement" });
      else if (data.summary.length > 500) suggestions.push({ id: "long_summary", field: "summary", message: "Keep your summary concise (2-3 sentences). ATS may truncate long summaries.", severity: "tip" });
      // Check if summary mentions skills
      if (data.skills.length > 0) {
        const summaryLower = data.summary.toLowerCase();
        const mentionedInSummary = data.skills.filter(s => summaryLower.includes(s.toLowerCase()));
        if (mentionedInSummary.length < 2) {
          suggestions.push({ id: "summary_keywords", field: "summary", message: "Mention 3-4 of your top skills in the summary. Keywords here receive higher ATS weight than in bullet points.", severity: "improvement" });
        }
      }
      // Check for first-person pronouns
      if (/\b(I|me|my)\b/i.test(data.summary)) {
        suggestions.push({ id: "summary_pronouns", field: "summary", message: "Avoid first-person pronouns (I, me, my) in your summary. Use third-person style: 'Experienced engineer with...' instead of 'I am an engineer...'", severity: "tip" });
      }
    }
  }

  const criticals = suggestions.filter((s) => s.severity === "critical").length;
  const improvements = suggestions.filter((s) => s.severity === "improvement").length;
  const score = suggestions.length === 0 ? 95 :
    criticals > 0 ? Math.max(15, 40 - criticals * 10) :
    improvements > 2 ? 55 : 75;

  return {
    score,
    summary: suggestions.length === 0
      ? "This section looks ATS-ready!"
      : criticals > 0
        ? `Found ${criticals} critical issue${criticals > 1 ? "s" : ""} that may cause ATS rejection.`
        : `Found ${suggestions.length} suggestion${suggestions.length > 1 ? "s" : ""} to improve ATS compatibility.`,
    suggestions,
  };
}
