"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resumeApi } from "@/lib/api/client";
import { ResumeData } from "./types";
import { SparklesIcon, SearchIcon, ArrowRightIcon } from "@/components/icons/Icons";

interface RoleSuggestionsProps {
  data: ResumeData;
}

export interface SuggestedRole {
  title: string;
  reason: string;
  matchStrength: "strong" | "moderate" | "stretch";
}

export default function RoleSuggestions({ data }: RoleSuggestionsProps) {
  const router = useRouter();
  const [roles, setRoles] = useState<SuggestedRole[]>(() => buildRoleSuggestions(data));
  const [customRole, setCustomRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiEnhanced, setAiEnhanced] = useState(false);

  useEffect(() => {
    setRoles(buildRoleSuggestions(data));
    setAiEnhanced(false);
  }, [data]);

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
        setRoles(parsed.length > 0 ? parsed : buildRoleSuggestions(data));
      } else {
        setRoles(buildRoleSuggestions(data));
      }
    } catch {
      setRoles(buildRoleSuggestions(data));
    } finally {
      setLoading(false);
      setAiEnhanced(true);
    }
  };

  const searchForRole = (role: string) => {
    const query = role.trim();
    if (!query) return;
    router.push(`/jobready/app/jobs?q=${encodeURIComponent(query)}`);
  };

  const matchColors: Record<string, string> = {
    strong: "green",
    moderate: "blue",
    stretch: "yellow",
  };

  return (
    <section className="jr-role-suggestions">
      <div className="jr-role-header">
        <div>
          <span className="jr-page-eyebrow">Role paths</span>
          <h3>Start with one focused search path.</h3>
          <p>These suggestions come from your current resume draft, so you can move straight into jobs.</p>
        </div>
        <button
          className="jr-btn jr-btn-secondary jr-btn-sm"
          onClick={generateSuggestions}
          disabled={loading}
        >
          <SparklesIcon size={14} />
          {loading ? "Refreshing..." : aiEnhanced ? "Refresh with AI" : "Improve with AI"}
        </button>
      </div>

      <div className="jr-role-list">
        {roles.map((role) => (
          <div key={role.title} className="jr-role-card">
            <div className="jr-role-card-info">
              <div className="jr-role-card-header">
                <h4>{role.title}</h4>
                <span className={`jr-badge jr-badge-${matchColors[role.matchStrength] || "gray"}`}>
                  {role.matchStrength === "strong"
                    ? "Strong fit"
                    : role.matchStrength === "moderate"
                      ? "Good fit"
                      : "Stretch"}
                </span>
              </div>
              <p>{role.reason}</p>
            </div>
            <button
              className="jr-btn jr-btn-secondary jr-btn-sm"
              onClick={() => searchForRole(role.title)}
            >
              <SearchIcon size={14} />
              Search jobs
            </button>
          </div>
        ))}
      </div>

      <div className="jr-role-custom">
        <input
          type="text"
          className="jr-input"
          placeholder="Or search a specific role title"
          value={customRole}
          onChange={(event) => setCustomRole(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && customRole.trim() && searchForRole(customRole)}
        />
        <button
          className="jr-btn jr-btn-primary jr-btn-sm"
          onClick={() => searchForRole(customRole)}
          disabled={!customRole.trim()}
        >
          <ArrowRightIcon size={14} />
        </button>
      </div>
    </section>
  );
}

function parseRoles(reply: string): SuggestedRole[] {
  try {
    const jsonMatch = reply.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as SuggestedRole[];
      return parsed.filter((role) => role.title && role.reason).slice(0, 6);
    }
  } catch {
    // Fall through to text parsing.
  }

  const lines = reply.split("\n").filter((line) => line.trim().length > 5);
  return lines.slice(0, 5).map((line) => ({
    title: line.replace(/^[-•*\d.]+\s*/, "").split(/[-–:]/).shift()?.trim() || line.trim(),
    reason: "Based on your skills and experience.",
    matchStrength: "moderate" as const,
  }));
}

export function buildRoleSuggestions(data: ResumeData): SuggestedRole[] {
  const skills = data.skills.map((skill) => skill.toLowerCase());
  const suggestions: SuggestedRole[] = [];

  if (skills.some((skill) => ["react", "javascript", "typescript", "next.js", "vue", "angular"].includes(skill))) {
    suggestions.push({
      title: "Frontend Developer",
      reason: "Your frontend stack maps directly to hands-on product roles.",
      matchStrength: "strong",
    });
  }

  if (skills.some((skill) => ["python", "django", "flask", "fastapi", "node.js", "express"].includes(skill))) {
    suggestions.push({
      title: "Backend Developer",
      reason: "Your server-side framework experience supports backend-heavy openings.",
      matchStrength: "strong",
    });
  }

  if (
    skills.some((skill) => ["react", "node.js", "python", "sql", "aws", "docker"].includes(skill)) &&
    skills.length >= 6
  ) {
    suggestions.push({
      title: "Full Stack Developer",
      reason: "You already show both frontend and backend capability in one profile.",
      matchStrength: "strong",
    });
  }

  if (skills.some((skill) => ["machine learning", "python", "tensorflow", "pytorch", "data science"].includes(skill))) {
    suggestions.push({
      title: "ML Engineer",
      reason: "Your ML stack suggests a strong fit for model and platform roles.",
      matchStrength: "strong",
    });
  }

  if (skills.some((skill) => ["product management", "agile", "scrum", "roadmap"].includes(skill))) {
    suggestions.push({
      title: "Product Manager",
      reason: "Your product and delivery language supports PM-oriented searches.",
      matchStrength: "moderate",
    });
  }

  if (data.experiences.length >= 3) {
    suggestions.push({
      title: "Technical Lead",
      reason: "Your experience level points toward leadership or ownership roles.",
      matchStrength: "stretch",
    });
  }

  if (data.experiences.length <= 1) {
    suggestions.push({
      title: "Associate Software Engineer",
      reason: "This is a clean entry point while your profile keeps building depth.",
      matchStrength: "moderate",
    });
  }

  return suggestions.slice(0, 6);
}
