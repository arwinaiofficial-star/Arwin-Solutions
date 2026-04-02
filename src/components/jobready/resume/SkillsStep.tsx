"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons/Icons";
import { ResumeData } from "./types";

interface SkillsStepProps {
  data: ResumeData;
  onUpdate: (skills: string[]) => void;
}

const SUGGESTED_SKILLS = [
  "Communication",
  "Leadership",
  "Project Management",
  "Figma",
  "SQL",
  "Python",
  "React",
  "TypeScript",
  "Customer Research",
  "Stakeholder Management",
];

export default function SkillsStep({
  data,
  onUpdate,
}: SkillsStepProps) {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = (value = newSkill) => {
    const normalized = value.trim();
    if (normalized && !data.skills.includes(normalized)) {
      onUpdate([...data.skills, normalized]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    onUpdate(data.skills.filter((entry) => entry !== skill));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="jr-resume-stack">
      <div className="jr-entry-empty jr-entry-empty-compact">
        <h3>List the skills recruiters and ATS systems should notice.</h3>
        <p>Keep the list specific to the work you want now. Mix tools, domain knowledge, and the professional strengths that repeatedly show up in target job descriptions.</p>
      </div>

      <div className="jr-skill-input-row">
        <input
          type="text"
          className="jr-input"
          placeholder="Add a skill such as React, Product Analytics, or Customer Support"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          onClick={() => addSkill()}
          disabled={!newSkill.trim()}
          className="jr-btn jr-btn-primary jr-btn-sm"
        >
          <PlusIcon size={14} />
          Add
        </button>
      </div>

      <div className="jr-chip-row">
        {SUGGESTED_SKILLS.filter((skill) => !data.skills.includes(skill)).slice(0, 8).map((skill) => (
          <button
            key={skill}
            type="button"
            className="jr-filter-chip"
            onClick={() => addSkill(skill)}
          >
            <PlusIcon size={12} />
            <span>{skill}</span>
          </button>
        ))}
      </div>

      <div className="jr-skills-tags">
        {data.skills.map((skill) => (
          <div key={skill} className="jr-skill-tag">
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="jr-skill-tag-remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
