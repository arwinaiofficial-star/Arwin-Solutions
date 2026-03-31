"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { resumeApi } from "@/lib/api/client";
import "@/app/jobready/jobready.css";

import PersonalInfoStep from "./PersonalInfoStep";
import ExperienceStep from "./ExperienceStep";
import EducationStep from "./EducationStep";
import SkillsStep from "./SkillsStep";
import SummaryStep from "./SummaryStep";
import ResumePreview from "./ResumePreview";
import ResumeScore from "./ResumeScore";
import {
  ResumeData,
  createInitialResumeData,
  calculateScore,
} from "./types";

const STEPS = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Experience" },
  { id: 3, label: "Education" },
  { id: 4, label: "Skills" },
  { id: 5, label: "Summary" },
];

export default function ResumeEditor() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [data, setData] = useState<ResumeData>(
    createInitialResumeData(null)
  );
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing data on mount
  useEffect(() => {
    if (user?.cvData) {
      const cv = user.cvData as unknown as Record<string, unknown>;
      const pi = (cv?.personalInfo ?? {}) as Record<string, string>;
      setData({
        fullName: pi.name || user.name || "",
        email: pi.email || user.email || "",
        phone: pi.phone || "",
        location: pi.location || "",
        linkedIn: pi.linkedIn || "",
        portfolio: pi.portfolio || "",
        summary: (cv?.summary as string) || "",
        skills: (cv?.skills as string[]) || [],
        experiences: (cv?.experience as ResumeData["experiences"]) || [],
        education: (cv?.education as ResumeData["education"]) || [],
      });
    } else {
      setData(createInitialResumeData(user || null));
    }
  }, [user]);

  // Auto-save with debounce
  useEffect(() => {
    setSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      await resumeApi.save(data as unknown as Record<string, unknown>, "draft");
      setSaving(false);
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data]);

  const handleFieldChange = (field: string, value: unknown) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (activeStep < 5) setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const { score, hint } = calculateScore(data);

  const steps = [
    () => <PersonalInfoStep data={data} onChange={handleFieldChange} />,
    () => <ExperienceStep data={data} onUpdate={(e) => handleFieldChange("experiences", e)} />,
    () => <EducationStep data={data} onUpdate={(e) => handleFieldChange("education", e)} />,
    () => <SkillsStep data={data} onUpdate={(s) => handleFieldChange("skills", s)} />,
    () => <SummaryStep data={data} onChange={handleFieldChange} />,
  ];
  const renderStep = () => (activeStep > 0 && activeStep <= 5 ? steps[activeStep - 1]() : null);

  return (
    <div className="jr-resume-editor">
      <div className="jr-resume-form">
        <div className="jr-resume-steps">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`jr-resume-step-btn ${
                activeStep === step.id ? "jr-resume-step-btn-active" : ""
              } ${activeStep > step.id ? "jr-resume-step-completed" : ""}`}
            >
              <div className="jr-resume-step-num">{step.id}</div>
              <span>{step.label}</span>
            </button>
          ))}
        </div>

        <div className="jr-resume-section">
          <h2 className="jr-resume-section-title">{STEPS[activeStep - 1].label}</h2>
          <p className="jr-resume-section-desc">
            Complete your {STEPS[activeStep - 1].label.toLowerCase()} information
          </p>
          {renderStep()}
        </div>

        <div className="jr-resume-actions">
          <button onClick={handleBack} disabled={activeStep === 1} className="jr-btn-secondary">Back</button>
          <div className="jr-resume-actions-right">
            {saving && <span>Saving...</span>}
            <button onClick={handleNext} disabled={activeStep === 5} className="jr-btn-primary">Next</button>
          </div>
        </div>
      </div>

      <div className="jr-resume-preview-pane">
        <ResumeScore score={score} hint={hint} />
        <ResumePreview data={data} />
      </div>
    </div>
  );
}
