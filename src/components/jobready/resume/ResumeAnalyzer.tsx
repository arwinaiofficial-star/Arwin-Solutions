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
 * Local fallback analysis (no API needed)
 */
function localAnalysis(step: number, data: ResumeData): AnalysisResult {
  const suggestions: Suggestion[] = [];

  if (step === 1) {
    if (!data.fullName.trim()) suggestions.push({ id: "name", field: "fullName", message: "Add your full name — it's the first thing recruiters see.", severity: "critical" });
    if (!data.email.trim()) suggestions.push({ id: "email", field: "email", message: "Include a professional email address.", severity: "critical" });
    if (!data.phone.trim()) suggestions.push({ id: "phone", field: "phone", message: "Add a phone number for callbacks.", severity: "improvement" });
    if (!data.linkedIn.trim()) suggestions.push({ id: "linkedin", field: "linkedIn", message: "Adding your LinkedIn profile increases callback rates by 40%.", severity: "tip" });
    if (!data.location.trim()) suggestions.push({ id: "location", field: "location", message: "Include your city — many recruiters filter by location.", severity: "improvement" });
  }

  if (step === 2) {
    if (data.experiences.length === 0) suggestions.push({ id: "no_exp", field: "experiences", message: "Add at least one work experience entry.", severity: "critical" });
    data.experiences.forEach((exp, i) => {
      if (exp.highlights.length === 0) suggestions.push({ id: `exp_${i}_hl`, field: "experiences", message: `"${exp.title || `Experience ${i + 1}`}" has no bullet points. Add 3-5 achievements with metrics.`, severity: "critical" });
      else if (exp.highlights.length < 3) suggestions.push({ id: `exp_${i}_few`, field: "experiences", message: `"${exp.title}" could use more bullets. Aim for 3-5 per role.`, severity: "improvement" });
      if (!exp.startDate) suggestions.push({ id: `exp_${i}_date`, field: "experiences", message: `Add start date for "${exp.title || `Experience ${i + 1}`}".`, severity: "improvement" });
    });
  }

  if (step === 3) {
    if (data.education.length === 0) suggestions.push({ id: "no_edu", field: "education", message: "Add your education background.", severity: "critical" });
    data.education.forEach((edu, i) => {
      if (!edu.degree) suggestions.push({ id: `edu_${i}_deg`, field: "education", message: `Specify your degree for "${edu.institution || `Education ${i + 1}`}".`, severity: "improvement" });
    });
  }

  if (step === 4) {
    if (data.skills.length === 0) suggestions.push({ id: "no_skills", field: "skills", message: "Add your technical and professional skills.", severity: "critical" });
    else if (data.skills.length < 5) suggestions.push({ id: "few_skills", field: "skills", message: "Add more skills. Most strong resumes have 8-15 relevant skills.", severity: "improvement" });
    else if (data.skills.length > 20) suggestions.push({ id: "many_skills", field: "skills", message: "Consider narrowing to your strongest 10-15 skills for better impact.", severity: "tip" });
  }

  if (step === 5) {
    if (!data.summary.trim()) suggestions.push({ id: "no_summary", field: "summary", message: "Write a 2-3 sentence professional summary highlighting your value proposition.", severity: "critical" });
    else if (data.summary.length < 80) suggestions.push({ id: "short_summary", field: "summary", message: "Your summary is too brief. Aim for 2-3 impactful sentences.", severity: "improvement" });
    else if (data.summary.length > 500) suggestions.push({ id: "long_summary", field: "summary", message: "Your summary is quite long. Keep it concise — under 3 sentences.", severity: "tip" });
  }

  const score = suggestions.length === 0 ? 95 :
    suggestions.filter((s) => s.severity === "critical").length > 0 ? 30 :
    suggestions.filter((s) => s.severity === "improvement").length > 2 ? 55 : 75;

  return {
    score,
    summary: suggestions.length === 0 ? "This section looks great!" : `Found ${suggestions.length} suggestion${suggestions.length > 1 ? "s" : ""} to improve.`,
    suggestions,
  };
}
