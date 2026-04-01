"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  resumeDataToBackend,
} from "./types";

interface ResumeEditorProps {
  initialData?: ResumeData | null;
  onReset?: () => void;
}

const STEPS = [
  { id: 1, label: "Personal", desc: "Add your contact details and online presence." },
  { id: 2, label: "Experience", desc: "List your work history with measurable achievements." },
  { id: 3, label: "Education", desc: "Add your academic background." },
  { id: 4, label: "Skills", desc: "Highlight your technical and professional skills." },
  { id: 5, label: "Summary", desc: "Write a compelling professional summary." },
];

export default function ResumeEditor({ initialData, onReset }: ResumeEditorProps) {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [data, setData] = useState<ResumeData>(
    initialData || createInitialResumeData(user || null)
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showATS, setShowATS] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasMountedRef = useRef(false);

  // Set initial data on mount (only once)
  useEffect(() => {
    if (initialData && !hasMountedRef.current) {
      setData(initialData);
      hasMountedRef.current = true;
    } else if (!initialData && user && !hasMountedRef.current) {
      setData(createInitialResumeData(user));
      hasMountedRef.current = true;
    }
  }, [initialData, user]);

  // Auto-save to DATABASE with debounce — no localStorage
  const saveToDatabase = useCallback(async (resumeData: ResumeData) => {
    setSaving(true);
    setSaveError(null);
    const result = await resumeApi.save(resumeDataToBackend(resumeData), "draft");
    setSaving(false);
    if (result.error) {
      setSaveError(result.error);
    }
  }, []);

  useEffect(() => {
    // Don't auto-save on first render
    if (!hasMountedRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToDatabase(data);
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, saveToDatabase]);

  const handleFieldChange = (field: string, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep < 5) {
      setActiveStep(activeStep + 1);
    } else {
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

  const handleReset = async () => {
    setShowResetConfirm(false);
    if (onReset) {
      onReset();
    }
  };

  const { score, hint } = calculateScore(data);

  const renderStep = () => {
    switch (activeStep) {
      case 1: return <PersonalInfoStep data={data} onChange={handleFieldChange} />;
      case 2: return <ExperienceStep data={data} onUpdate={(e) => handleFieldChange("experiences", e)} />;
      case 3: return <EducationStep data={data} onUpdate={(e) => handleFieldChange("education", e)} />;
      case 4: return <SkillsStep data={data} onUpdate={(s) => handleFieldChange("skills", s)} />;
      case 5: return <SummaryStep data={data} onChange={handleFieldChange} />;
      default: return null;
    }
  };

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
          <div className="jr-resume-section">
            <h2 className="jr-resume-section-title">ATS Compatibility</h2>
            <p className="jr-resume-section-desc">
              Check how your resume performs with Applicant Tracking Systems.
            </p>
            <ATSScoreCard data={data} />
            <RoleSuggestions data={data} />
          </div>
        ) : (
          <div className="jr-resume-section">
            <h2 className="jr-resume-section-title">{stepInfo.label}</h2>
            <p className="jr-resume-section-desc">{stepInfo.desc}</p>

            {/* AI Analyzer — keyed by step so it resets when step changes */}
            <ResumeAnalyzer
              key={`analyzer-step-${activeStep}`}
              data={data}
              currentStep={activeStep}
              onApplySuggestion={handleFieldChange}
            />

            {renderStep()}
          </div>
        )}

        {/* Navigation Actions */}
        <div className="jr-resume-actions">
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={handleBack}
              disabled={activeStep === 1 && !showATS}
              className="jr-btn jr-btn-secondary"
            >
              Back
            </button>
            {onReset && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="jr-btn jr-btn-ghost"
                style={{ color: "var(--jr-error)", fontSize: "var(--jr-text-xs)" }}
              >
                Start over
              </button>
            )}
          </div>
          <div className="jr-resume-actions-right">
            {saving && <span className="jr-text-muted">Saving...</span>}
            {saveError && <span style={{ color: "var(--jr-error)", fontSize: "var(--jr-text-xs)" }}>Save failed</span>}
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

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="jr-modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="jr-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "var(--jr-text-base)", fontWeight: 600 }}>
              Start over?
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "var(--jr-text-sm)", color: "var(--jr-gray-500)" }}>
              This will delete your current resume and all saved data. You&apos;ll start fresh from the creation options. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button className="jr-btn jr-btn-secondary" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button
                className="jr-btn"
                style={{ background: "var(--jr-error)", color: "white" }}
                onClick={handleReset}
              >
                Delete &amp; start over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
