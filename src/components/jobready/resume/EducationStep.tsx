"use client";

import { PlusIcon, TrashIcon } from "@/components/icons/Icons";
import { EducationEntry, ResumeData } from "./types";

interface EducationStepProps {
  data: ResumeData;
  onUpdate: (education: EducationEntry[]) => void;
}

export default function EducationStep({
  data,
  onUpdate,
}: EducationStepProps) {
  const addEducation = () => {
    const newEdu: EducationEntry = {
      id: `edu_${Date.now()}`,
      degree: "",
      institution: "",
      location: "",
      graduationYear: "",
      gpa: "",
    };
    onUpdate([...data.education, newEdu]);
  };

  const removeEducation = (id: string) => {
    onUpdate(data.education.filter((edu) => edu.id !== id));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onUpdate(
      data.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  if (data.education.length === 0) {
    return (
      <div className="jr-entry-empty">
        <h3>Add the education that supports your target role.</h3>
        <p>Include degrees, diplomas, or certifications that recruiters expect to see for the jobs you want.</p>
        <button onClick={addEducation} className="jr-btn jr-btn-primary">
          <PlusIcon size={16} />
          Add education
        </button>
      </div>
    );
  }

  return (
    <div className="jr-entry-stack">
      {data.education.map((edu, index) => (
        <div key={edu.id} className="jr-entry-card">
          <div className="jr-entry-card-header">
            <div>
              <div className="jr-entry-card-title">Education {index + 1}</div>
              <div className="jr-entry-card-subtitle">List the credential exactly as you want recruiters and ATS systems to read it.</div>
            </div>
            <button onClick={() => removeEducation(edu.id)} className="jr-btn jr-btn-ghost jr-btn-sm">
              <TrashIcon size={14} />
              Remove
            </button>
          </div>

          <div className="jr-resume-form-grid">
            <div className="jr-input-group">
              <label className="jr-label">Degree or program</label>
              <input
                type="text"
                className="jr-input"
                placeholder="B.Tech in Computer Science"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
              />
            </div>
            <div className="jr-input-group">
              <label className="jr-label">Institution</label>
              <input
                type="text"
                className="jr-input"
                placeholder="University name"
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
              />
            </div>
            <div className="jr-input-group">
              <label className="jr-label">Location</label>
              <input
                type="text"
                className="jr-input"
                placeholder="City, Country"
                value={edu.location}
                onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
              />
            </div>
            <div className="jr-input-group">
              <label className="jr-label">Graduation year</label>
              <input
                type="text"
                className="jr-input"
                placeholder="2024"
                value={edu.graduationYear}
                onChange={(e) => updateEducation(edu.id, "graduationYear", e.target.value)}
              />
            </div>
            <div className="jr-input-group">
              <label className="jr-label">GPA or score</label>
              <input
                type="text"
                className="jr-input"
                placeholder="Optional"
                value={edu.gpa}
                onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <button onClick={addEducation} className="jr-btn jr-btn-primary">
        <PlusIcon size={16} />
        Add another qualification
      </button>
    </div>
  );
}
