"use client";

import { ResumeData, EducationEntry } from "./types";

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

  return (
    <div>
      {data.education.map((edu) => (
        <div key={edu.id} className="jr-entry-card">
          <div className="jr-entry-card-header">
            <div>
              <div className="jr-entry-card-title">
                <input type="text" className="jr-input" placeholder="Degree (e.g., B.S.)" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
              </div>
              <div className="jr-entry-card-subtitle">
                <input type="text" className="jr-input" placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(edu.id, "institution", e.target.value)} />
              </div>
            </div>
            <button onClick={() => removeEducation(edu.id)} className="jr-btn-ghost jr-btn-sm">Remove</button>
          </div>
          <div className="jr-resume-form-grid">
            <input type="text" className="jr-input" placeholder="Location" value={edu.location} onChange={(e) => updateEducation(edu.id, "location", e.target.value)} />
            <input type="text" className="jr-input" placeholder="Year (e.g., 2023)" value={edu.graduationYear} onChange={(e) => updateEducation(edu.id, "graduationYear", e.target.value)} />
            <input type="text" className="jr-input" placeholder="GPA" value={edu.gpa} onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)} />
          </div>
        </div>
      ))}

      <button
        onClick={addEducation}
        className="jr-btn-primary"
      >
        + Add Education
      </button>
    </div>
  );
}
