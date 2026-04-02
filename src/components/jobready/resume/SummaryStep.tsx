"use client";

import { useState } from "react";
import { resumeApi } from "@/lib/api/client";
import { SparklesIcon } from "@/components/icons/Icons";
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
          experiences: data.experiences.map((entry) => ({
            title: entry.title,
            company: entry.company,
            highlights: entry.highlights,
          })),
          education: data.education.map((entry) => ({
            degree: entry.degree,
            institution: entry.institution,
          })),
        }
      );
      if (result.data?.reply) {
        onChange("summary", result.data.reply);
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="jr-resume-stack">
      <div className="jr-entry-empty jr-entry-empty-compact">
        <h3>Write a short summary that frames your value clearly.</h3>
        <p>Two or three sentences is enough. Focus on what you do, what you are strongest at, and the type of role or impact you are targeting next.</p>
      </div>

      <div className="jr-input-group">
        <label className="jr-label">Professional summary</label>
        <textarea
          className="jr-input jr-textarea"
          placeholder="Product designer with 5+ years of experience shaping B2B workflows, leading discovery, and shipping systems that improve adoption and reduce operational friction..."
          rows={7}
          value={data.summary}
          onChange={(e) => onChange("summary", e.target.value)}
        />
        <div className="jr-input-hint">
          Aim for 90-180 characters of dense value per sentence, not a long autobiography.
        </div>
      </div>

      <button
        onClick={generateSummary}
        disabled={generating || data.skills.length === 0}
        className="jr-ai-btn"
      >
        <SparklesIcon size={14} />
        {generating ? "Generating..." : "Generate with AI"}
      </button>
    </div>
  );
}
