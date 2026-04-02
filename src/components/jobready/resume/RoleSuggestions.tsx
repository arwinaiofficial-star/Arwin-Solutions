"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resumeApi } from "@/lib/api/client";
import { ResumeData } from "./types";
import { SparklesIcon, SearchIcon, ArrowRightIcon } from "@/components/icons/Icons";

interface RoleSuggestionsProps {
  data: ResumeData;
}

interface SuggestedRole {
  title: string;
  reason: string;
  matchStrength: "strong" | "moderate" | "stretch";
}

export default function RoleSuggestions({ data }: RoleSuggestionsProps) {
  const router = useRouter();
  const [roles, setRoles] = useState<SuggestedRole[]>([]);
  const [customRole, setCustomRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const result = await resumeApi.chat(
        "Based on this resume, suggest 5-6 job roles this person is well-suited for. For each role, provide the title, a brief reason why they're a fit, and rate the match as strong/moderate/stretch. Return JSON array with objects: {title, reason, matchStrength}.",
        "suggest_roles",
        { resumeData: data as unknown as Record<string, unknown> }
      );

      if (result.data?.reply) {
        const parsed = parseRoles(result.data.reply);
        setRoles(parsed);
      } else {
        setRoles(localRoleSuggestions(data));
      }
    } catch {
      setRoles(localRoleSuggestions(data));
    } finally {
      setLoading(false);
      setGenerated(true);
    }
  };

  const searchForRole = (role: string) => {
    // Navigate to jobs page — the search query will be set via URL state
    router.push(`/jobready/app/jobs?q=${encodeURIComponent(role)}`);
  };

  const matchColors: Record<string, string> = {
    strong: "green",
    moderate: "blue",
    stretch: "yellow",
  };

  if (!generated) {
    return (
      <div className="jr-role-suggestions">
        <div className="jr-role-prompt">
          <h3>What roles should you target?</h3>
          <p>Let AI analyze your resume and suggest job roles that match your skills and experience.</p>
          <button
            className="jr-btn jr-btn-primary jr-btn-sm"
            onClick={generateSuggestions}
            disabled={loading}
          >
            <SparklesIcon size={14} />
            {loading ? "Analyzing..." : "Suggest Roles"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jr-role-suggestions">
      <div className="jr-role-list">
        {roles.map((role, i) => (
          <div key={i} className="jr-role-card">
            <div className="jr-role-card-info">
              <div className="jr-role-card-header">
                <h4>{role.title}</h4>
                <span className={`jr-badge jr-badge-${matchColors[role.matchStrength] || "gray"}`}>
                  {role.matchStrength}
                </span>
              </div>
              <p>{role.reason}</p>
            </div>
            <button
              className="jr-btn jr-btn-ghost jr-btn-sm"
              onClick={() => searchForRole(role.title)}
              title="Search for this role"
            >
              <SearchIcon size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Custom role input */}
      <div className="jr-role-custom">
        <input
          type="text"
          className="jr-input"
          placeholder="Or enter a specific role..."
          value={customRole}
          onChange={(e) => setCustomRole(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && customRole.trim() && searchForRole(customRole)}
        />
        <button
          className="jr-btn jr-btn-primary jr-btn-sm"
          onClick={() => searchForRole(customRole)}
          disabled={!customRole.trim()}
        >
          <ArrowRightIcon size={14} />
        </button>
      </div>

      <button
        className="jr-btn jr-btn-ghost jr-btn-sm"
        onClick={generateSuggestions}
        disabled={loading}
        style={{ marginTop: "8px" }}
      >
        {loading ? "Regenerating..." : "Regenerate suggestions"}
      </button>
    </div>
  );
}

function parseRoles(reply: string): SuggestedRole[] {
  try {
    const jsonMatch = reply.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as SuggestedRole[];
      return parsed.filter((r) => r.title && r.reason).slice(0, 6);
    }
  } catch { /* fall through */ }

  // Parse unstructured text as roles
  const lines = reply.split("\n").filter((l) => l.trim().length > 5);
  return lines.slice(0, 5).map((line) => ({
    title: line.replace(/^[-•*\d.]+\s*/, "").split(/[-–:]/).shift()?.trim() || line.trim(),
    reason: "Based on your skills and experience.",
    matchStrength: "moderate" as const,
  }));
}

function localRoleSuggestions(data: ResumeData): SuggestedRole[] {
  const skills = data.skills.map((s) => s.toLowerCase());
  const suggestions: SuggestedRole[] = [];

  // Infer from skills
  if (skills.some((s) => ["react", "javascript", "typescript", "next.js", "vue", "angular"].includes(s))) {
    suggestions.push({ title: "Frontend Developer", reason: "Your JavaScript/React skills are directly relevant.", matchStrength: "strong" });
  }
  if (skills.some((s) => ["python", "django", "flask", "fastapi", "node.js", "express"].includes(s))) {
    suggestions.push({ title: "Backend Developer", reason: "Your server-side framework experience is a strong fit.", matchStrength: "strong" });
  }
  if (skills.some((s) => ["react", "node.js", "python", "sql", "aws", "docker"].includes(s)) && skills.length >= 6) {
    suggestions.push({ title: "Full Stack Developer", reason: "You have both frontend and backend skills.", matchStrength: "strong" });
  }
  if (skills.some((s) => ["machine learning", "python", "tensorflow", "pytorch", "data science"].includes(s))) {
    suggestions.push({ title: "ML Engineer", reason: "Your machine learning and data skills align well.", matchStrength: "strong" });
  }
  if (skills.some((s) => ["product management", "agile", "scrum", "roadmap"].includes(s))) {
    suggestions.push({ title: "Product Manager", reason: "Your product and agile experience is relevant.", matchStrength: "moderate" });
  }

  // Always suggest a few generic ones based on experience level
  if (data.experiences.length >= 3) {
    suggestions.push({ title: "Technical Lead", reason: "Your experience level suggests readiness for leadership.", matchStrength: "stretch" });
  }
  if (data.experiences.length <= 1) {
    suggestions.push({ title: "Associate Software Engineer", reason: "A great entry point to build your career.", matchStrength: "moderate" });
  }

  return suggestions.slice(0, 6);
}
