"use client";

import { useState } from "react";
import { ResumeData } from "./types";

interface SkillsStepProps {
  data: ResumeData;
  onUpdate: (skills: string[]) => void;
}

export default function SkillsStep({
  data,
  onUpdate,
}: SkillsStepProps) {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      onUpdate([...data.skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    onUpdate(data.skills.filter((s) => s !== skill));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div>
      <div className="jr-skill-input-row">
        <input
          type="text"
          className="jr-input"
          placeholder="Add a skill (e.g., React, Project Management)"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className="jr-btn-primary jr-btn-sm"
        >
          Add
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
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
