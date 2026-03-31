"use client";

import { useState } from "react";
import { resumeApi } from "@/lib/api/client";
import { ResumeData } from "./types";

interface SummaryStepProps {
  data: ResumeData;
  onChange: (field: string, value: string) => void;
}

export default function SummaryStep({
  data,
  onChange,
}: SummaryStepProps) {
  const [generating, setGenerating] = useState(false);

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const result = await resumeApi.chat(
        "",
        "generate_summary",
        {
          fullName: data.fullName,
          skills: data.skills,
          experiences: data.experiences.map((e) => ({
            title: e.title,
            company: e.company,
            highlights: e.highlights,
          })),
          education: data.education.map((e) => ({
            degree: e.degree,
            institution: e.institution,
          })),
        }
      );
      if (result.data?.reply) {
        onChange("summary", result.data.reply);
      }
    } catch {
      // Silently fail
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="jr-input-group">
        <label className="jr-label">Professional Summary</label>
        <textarea
          className="jr-input"
          placeholder="Write a brief professional summary highlighting your key strengths and career goals..."
          rows={6}
          value={data.summary}
          onChange={(e) => onChange("summary", e.target.value)}
        />
      </div>

      <button
        onClick={generateSummary}
        disabled={generating || data.skills.length === 0}
        className="jr-ai-btn"
      >
        {generating ? "Generating..." : "✨ Generate with AI"}
      </button>
    </div>
  );
}
