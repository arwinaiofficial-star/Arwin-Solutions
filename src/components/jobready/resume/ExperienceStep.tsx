"use client";

import { useState } from "react";
import { resumeApi } from "@/lib/api/client";
import { PlusIcon, SparklesIcon, TrashIcon } from "@/components/icons/Icons";
import { ExperienceEntry, ResumeData } from "./types";

interface ExperienceStepProps {
  data: ResumeData;
  onUpdate: (experiences: ExperienceEntry[]) => void;
}

export default function ExperienceStep({
  data,
  onUpdate,
}: ExperienceStepProps) {
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  const addExperience = () => {
    const newExp: ExperienceEntry = {
      id: `exp_${Date.now()}`,
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      highlights: [""],
    };
    onUpdate([...data.experiences, newExp]);
  };

  const removeExperience = (id: string) => {
    onUpdate(data.experiences.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id: string, field: string, value: unknown) => {
    onUpdate(
      data.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const addHighlight = (expId: string) => {
    updateExperience(expId, "highlights", [
      ...(data.experiences.find((entry) => entry.id === expId)?.highlights || []),
      "",
    ]);
  };

  const removeHighlight = (expId: string, index: number) => {
    const exp = data.experiences.find((entry) => entry.id === expId);
    if (!exp) return;
    const newHighlights = exp.highlights.filter((_, i) => i !== index);
    updateExperience(expId, "highlights", newHighlights);
  };

  const updateHighlight = (expId: string, index: number, value: string) => {
    const exp = data.experiences.find((entry) => entry.id === expId);
    if (!exp) return;
    const newHighlights = [...exp.highlights];
    newHighlights[index] = value;
    updateExperience(expId, "highlights", newHighlights);
  };

  const enhanceHighlights = async (exp: ExperienceEntry) => {
    setEnhancingId(exp.id);
    try {
      const result = await resumeApi.chat(
        "",
        "enhance_experience",
        {
          title: exp.title,
          company: exp.company,
          highlights: exp.highlights,
        }
      );
      if (result.data?.suggestions) {
        updateExperience(exp.id, "highlights", result.data.suggestions);
      }
    } finally {
      setEnhancingId(null);
    }
  };

  if (data.experiences.length === 0) {
    return (
      <div className="jr-entry-empty">
        <h3>Add the roles that prove your value.</h3>
        <p>Focus on achievements, scope, and impact. Start with your most recent role and use measurable bullets whenever possible.</p>
        <button onClick={addExperience} className="jr-btn jr-btn-primary">
          <PlusIcon size={16} />
          Add your first role
        </button>
      </div>
    );
  }

  return (
    <div className="jr-entry-stack">
      {data.experiences.map((exp, index) => (
        <div key={exp.id} className="jr-entry-card">
          <div className="jr-entry-card-header">
            <div>
              <div className="jr-entry-card-title">Experience {index + 1}</div>
              <div className="jr-entry-card-subtitle">Describe the work that best supports the roles you want now.</div>
            </div>
            <button onClick={() => removeExperience(exp.id)} className="jr-btn jr-btn-ghost jr-btn-sm">
              <TrashIcon size={14} />
              Remove
            </button>
          </div>

          <div className="jr-resume-form-grid">
            <div className="jr-input-group">
              <label className="jr-label">Job title</label>
              <input
                type="text"
                className="jr-input"
                placeholder="Senior Product Designer"
                value={exp.title}
                onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
              />
            </div>
            <div className="jr-input-group">
              <label className="jr-label">Company</label>
              <input
                type="text"
                className="jr-input"
                placeholder="Company name"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
              />
            </div>
            <div className="jr-input-group">
              <label className="jr-label">Location</label>
              <input
                type="text"
                className="jr-input"
                placeholder="Hyderabad, India"
                value={exp.location}
                onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
              />
            </div>
            <div className="jr-input-group">
              <label className="jr-label">Start date</label>
              <input
                type="month"
                className="jr-input"
                value={exp.startDate}
                onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
              />
            </div>
            {!exp.current && (
              <div className="jr-input-group">
                <label className="jr-label">End date</label>
                <input
                  type="month"
                  className="jr-input"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                />
              </div>
            )}
          </div>

          <label className="jr-inline-toggle">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
            />
            <span>Currently working here</span>
          </label>

          <div className="jr-highlights">
            <div className="jr-highlights-header">
              <div>
                <h4 className="jr-label">Highlights and achievements</h4>
                <p>Use action verbs, outcomes, and metrics where you have them.</p>
              </div>
              <button
                onClick={() => enhanceHighlights(exp)}
                disabled={enhancingId === exp.id || !exp.title || exp.highlights.length === 0}
                className="jr-ai-btn"
              >
                <SparklesIcon size={14} />
                {enhancingId === exp.id ? "Enhancing..." : "AI enhance"}
              </button>
            </div>

            {exp.highlights.map((highlight, idx) => (
              <div key={idx} className="jr-highlight-row">
                <span className="jr-highlight-bullet">•</span>
                <input
                  type="text"
                  className="jr-input"
                  placeholder="Improved conversion by 28% after redesigning the onboarding flow"
                  value={highlight}
                  onChange={(e) => updateHighlight(exp.id, idx, e.target.value)}
                />
                <button onClick={() => removeHighlight(exp.id, idx)} className="jr-btn jr-btn-ghost jr-btn-sm">
                  <TrashIcon size={14} />
                </button>
              </div>
            ))}

            <button onClick={() => addHighlight(exp.id)} className="jr-btn jr-btn-secondary jr-btn-sm">
              <PlusIcon size={14} />
              Add highlight
            </button>
          </div>
        </div>
      ))}

      <button onClick={addExperience} className="jr-btn jr-btn-primary">
        <PlusIcon size={16} />
        Add another role
      </button>
    </div>
  );
}
