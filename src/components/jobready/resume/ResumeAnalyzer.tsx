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
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const analyze = async () => {
    setLoading(true);
    setAnalysis(null);
    setError(null);

    const stepContext = STEP_CONTEXT[currentStep] || "general";

    // Build a focused prompt based on the current step's actual data
    const stepDataSummary = buildStepSummary(currentStep, data);

    const result = await resumeApi.chat(
      `Analyze my resume's ${stepContext} section. Here is the current data:\n${stepDataSummary}\n\nReturn a JSON object with: score (0-100 for this section), summary (one sentence assessment), suggestions (array of objects with id, field, message, severity where severity is "critical", "improvement", or "tip"). Be specific and actionable. Focus on ATS optimization.`,
      "analyze_resume",
      {
        step: stepContext,
        resumeData: { ...data } as unknown as Record<string, unknown>,
        currentStep,
      }
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const reply = result.data?.reply || "";
    const parsed = parseAnalysis(reply, currentStep);
    setAnalysis(parsed);
    setLoading(false);
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

      {error && (
        <p className="jr-resume-analyzer-error">
          Analysis failed: {error}
        </p>
      )}

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
            <p className="jr-analyzer-complete">All suggestions addressed!</p>
          )}
        </div>
      )}

      {analysis && (
        <button
          className="jr-btn jr-btn-ghost jr-btn-sm jr-resume-analyzer-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide" : "Show"} analysis
        </button>
      )}
    </div>
  );
}

/**
 * Build a concise summary of the current step's data for the AI prompt
 */
function buildStepSummary(step: number, data: ResumeData): string {
  switch (step) {
    case 1:
      return `Name: ${data.fullName || "(empty)"}\nEmail: ${data.email || "(empty)"}\nPhone: ${data.phone || "(empty)"}\nLocation: ${data.location || "(empty)"}\nLinkedIn: ${data.linkedIn || "(empty)"}\nPortfolio: ${data.portfolio || "(empty)"}`;
    case 2:
      if (data.experiences.length === 0) return "No work experience entries added yet.";
      return data.experiences.map((e, i) =>
        `Role ${i + 1}: ${e.title || "(no title)"} at ${e.company || "(no company)"}, ${e.startDate || "?"} - ${e.current ? "Present" : e.endDate || "?"}\nBullets: ${e.highlights.length > 0 ? e.highlights.join(" | ") : "(none)"}`
      ).join("\n\n");
    case 3:
      if (data.education.length === 0) return "No education entries added yet.";
      return data.education.map((e, i) =>
        `Education ${i + 1}: ${e.degree || "(no degree)"} at ${e.institution || "(no institution)"}, ${e.graduationYear || "(no year)"}`
      ).join("\n");
    case 4:
      return data.skills.length > 0 ? `Skills (${data.skills.length}): ${data.skills.join(", ")}` : "No skills added yet.";
    case 5:
      return data.summary ? `Summary: ${data.summary}` : "No professional summary written yet.";
    default:
      return "";
  }
}

/**
 * Parse AI response into structured analysis
 */
function parseAnalysis(reply: string, step: number): AnalysisResult {
  // Try JSON extraction first
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.score === "number" && Array.isArray(parsed.suggestions)) {
        return {
          score: Math.min(100, Math.max(0, parsed.score)),
          summary: parsed.summary || "Analysis complete.",
          suggestions: (parsed.suggestions as Suggestion[]).map((s, i) => ({
            id: s.id || `s_${i}`,
            field: s.field || STEP_CONTEXT[step] || "general",
            message: s.message || "",
            severity: s.severity || "improvement",
          })),
        };
      }
    }
  } catch {
    // Fall through to text parsing
  }

  // Parse unstructured text into suggestions
  const lines = reply.split("\n").filter((l) => l.trim().length > 10);
  if (lines.length === 0) {
    return { score: 50, summary: "Could not parse AI response. Try again.", suggestions: [] };
  }

  return {
    score: 60,
    summary: lines[0].replace(/^[-•*\d.]+\s*/, ""),
    suggestions: lines.slice(0, 5).map((line, i) => ({
      id: `ai_${i}`,
      field: STEP_CONTEXT[step] || "general",
      message: line.replace(/^[-•*\d.]+\s*/, ""),
      severity: i === 0 ? "critical" as const : "improvement" as const,
    })),
  };
}
