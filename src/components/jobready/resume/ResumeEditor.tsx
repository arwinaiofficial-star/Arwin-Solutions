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
import ResumeAnalyzer from "./ResumeAnalyzer";
import ATSScoreCard from "./ATSScoreCard";
import RoleSuggestions from "./RoleSuggestions";
import {
  ResumeData,
  createInitialResumeData,
  calculateScore,
} from "./types";

interface ResumeEditorProps {
  initialData?: ResumeData | null;
}

const STEPS = [
  { id: 1, label: "Personal", desc: "Add your contact details and online presence." },
  { id: 2, label: "Experience", desc: "List your work history with measurable achievements." },
  { id: 3, label: "Education", desc: "Add your academic background." },
  { id: 4, label: "Skills", desc: "Highlight your technical and professional skills." },
  { id: 5, label: "Summary", desc: "Write a compelling professional summary." },
];

export default function ResumeEditor({ initialData }: ResumeEditorProps = {}) {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [data, setData] = useState<ResumeData>(
    createInitialResumeData(null)
  );
  const [saving, setSaving] = useState(false);
  const [showATS, setShowATS] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing data on mount — prefer initialData (from creation flow),
  // then user.cvData (previously saved), then blank
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else if (user?.cvData) {
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
  }, [user, initialData]);

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
    if (activeStep < 5) {
      setActiveStep(activeStep + 1);
    } else {
      // On step 5, "Next" shows the ATS score
      setShowATS(true);
    }
  };

  const handleBack = () => {
    if (showATS) {
      setShowATS(false);
    } else if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
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

  const stepInfo = STEPS[activeStep - 1];

  return (
    <div className="jr-resume-editor">
      <div className="jr-resume-form">
        {/* Step Navigation */}
        <div className="jr-resume-steps">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => { setActiveStep(step.id); setShowATS(false); }}
              className={`jr-resume-step-btn ${
                activeStep === step.id && !showATS ? "jr-resume-step-btn-active" : ""
              } ${activeStep > step.id ? "jr-resume-step-completed" : ""}`}
            >
              <div className="jr-resume-step-num">{step.id}</div>
              <span>{step.label}</span>
            </button>
          ))}
        </div>

        {showATS ? (
          /* ATS Score View (after step 5) */
          <div className="jr-resume-section">
            <h2 className="jr-resume-section-title">ATS Compatibility</h2>
            <p className="jr-resume-section-desc">
              Check how your resume performs with Applicant Tracking Systems before applying.
            </p>
            <ATSScoreCard data={data} />

            {/* Role Suggestions — after ATS check */}
            <RoleSuggestions data={data} />
          </div>
        ) : (
          /* Normal Step Content */
          <div className="jr-resume-section">
            <h2 className="jr-resume-section-title">{stepInfo.label}</h2>
            <p className="jr-resume-section-desc">{stepInfo.desc}</p>

            {/* AI Analyzer — appears at every step */}
            <ResumeAnalyzer
              data={data}
              currentStep={activeStep}
              onApplySuggestion={handleFieldChange}
            />

            {renderStep()}
          </div>
        )}

        {/* Navigation Actions */}
        <div className="jr-resume-actions">
          <button
            onClick={handleBack}
            disabled={activeStep === 1 && !showATS}
            className="jr-btn jr-btn-secondary"
          >
            Back
          </button>
          <div className="jr-resume-actions-right">
            {saving && <span className="jr-text-muted">Saving...</span>}
            <button
              onClick={handleNext}
              disabled={showATS}
              className="jr-btn jr-btn-primary"
            >
              {activeStep === 5 && !showATS ? "Check ATS Score" : "Next"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Pane: Preview */}
      <div className="jr-resume-preview-pane">
        <ResumeScore score={score} hint={hint} />
        <ResumePreview data={data} />
      </div>
    </div>
  );
}
