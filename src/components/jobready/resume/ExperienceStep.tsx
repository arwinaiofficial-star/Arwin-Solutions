"use client";

import { useState } from "react";
import { resumeApi } from "@/lib/api/client";
import { ResumeData, ExperienceEntry } from "./types";

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
      highlights: [],
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
      ...(data.experiences.find((e) => e.id === expId)?.highlights || []),
      "",
    ]);
  };

  const removeHighlight = (expId: string, index: number) => {
    const exp = data.experiences.find((e) => e.id === expId);
    if (exp) {
      const newHighlights = exp.highlights.filter((_, i) => i !== index);
      updateExperience(expId, "highlights", newHighlights);
    }
  };

  const updateHighlight = (expId: string, index: number, value: string) => {
    const exp = data.experiences.find((e) => e.id === expId);
    if (exp) {
      const newHighlights = [...exp.highlights];
      newHighlights[index] = value;
      updateExperience(expId, "highlights", newHighlights);
    }
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
    } catch {
      // Silently fail
    } finally {
      setEnhancingId(null);
    }
  };

  return (
    <div>
      {data.experiences.map((exp) => (
        <div key={exp.id} className="jr-entry-card">
          <div className="jr-entry-card-header">
            <div>
              <div className="jr-entry-card-title">
                <input type="text" className="jr-input" placeholder="Job Title" value={exp.title} onChange={(e) => updateExperience(exp.id, "title", e.target.value)} />
              </div>
              <div className="jr-entry-card-subtitle">
                <input type="text" className="jr-input" placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
              </div>
            </div>
            <button onClick={() => removeExperience(exp.id)} className="jr-btn-ghost jr-btn-sm">Remove</button>
          </div>

          <div className="jr-resume-form-grid">
            <input type="text" className="jr-input" placeholder="Location" value={exp.location} onChange={(e) => updateExperience(exp.id, "location", e.target.value)} />
            <input type="month" className="jr-input" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} />
            {!exp.current && <input type="month" className="jr-input" value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} />}
            <label className="jr-label">
              <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, "current", e.target.checked)} />
              {" "}Currently working here
            </label>
          </div>

          <div className="jr-highlights">
            <h4 className="jr-label">Highlights & Achievements</h4>
            {exp.highlights.map((highlight, idx) => (
              <div key={idx} className="jr-highlight-row">
                <span className="jr-highlight-bullet">•</span>
                <input type="text" className="jr-input" placeholder="Achievement or responsibility" value={highlight} onChange={(e) => updateHighlight(exp.id, idx, e.target.value)} />
                <button onClick={() => removeHighlight(exp.id, idx)} className="jr-btn-ghost jr-btn-sm">✕</button>
              </div>
            ))}
            <button onClick={() => addHighlight(exp.id)} className="jr-btn-secondary jr-btn-sm">+ Add Highlight</button>
            <button onClick={() => enhanceHighlights(exp)} disabled={enhancingId === exp.id || !exp.title || exp.highlights.length === 0} className="jr-ai-btn">
              {enhancingId === exp.id ? "Enhancing..." : "✨ AI Enhance"}
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addExperience}
        className="jr-btn-primary"
      >
        + Add Experience
      </button>
    </div>
  );
}
