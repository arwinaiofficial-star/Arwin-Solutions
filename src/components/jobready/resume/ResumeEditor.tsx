"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { resumeApi } from "@/lib/api/client";
import { DocumentIcon, EyeIcon, SparklesIcon } from "@/components/icons/Icons";
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
  const [mobilePane, setMobilePane] = useState<"form" | "preview">("form");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const didInitSaveRef = useRef(false);

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
    if (!didInitSaveRef.current) {
      didInitSaveRef.current = true;
      return;
    }

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
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep < STEPS.length) {
      setActiveStep((prev) => prev + 1);
      setMobilePane("form");
    } else {
      setShowATS(true);
      setMobilePane("form");
    }
  };

  const handleBack = () => {
    if (showATS) {
      setShowATS(false);
      return;
    }
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
      setMobilePane("form");
    }
  };

  const handleReset = async () => {
    setShowResetConfirm(false);
    if (onReset) {
      await onReset();
    }
  };

  const { score, hint } = calculateScore(data);
  const stepInfo = showATS
    ? {
        label: "ATS & role targeting",
        desc: "Check resume readiness and move into suggested role paths.",
      }
    : STEPS[activeStep - 1];
  const progressPercent = ((showATS ? STEPS.length + 1 : activeStep) / (STEPS.length + 1)) * 100;

  return (
    <div className="jr-resume-editor">
      <section className="jr-page-hero jr-resume-hero">
        <div className="jr-page-hero-copy">
          <span className="jr-page-eyebrow">Resume workspace</span>
          <h2>Build a profile that is easy to trust and easy to screen.</h2>
          <p>Work section by section, review the live preview as you go, and use AI help when you need a sharper draft instead of blank-page friction.</p>
        </div>
        <div className="jr-page-hero-aside">
          <div className="jr-mini-metric">
            <div className="jr-mini-metric-icon">
              <DocumentIcon size={16} />
            </div>
            <div>
              <strong>{showATS ? "ATS review" : `${activeStep} of ${STEPS.length} sections`}</strong>
              <span>{stepInfo.label}</span>
            </div>
          </div>
          <div className="jr-mini-metric">
            <div className="jr-mini-metric-icon">
              <SparklesIcon size={16} />
            </div>
            <div>
              <strong>{saving ? "Saving draft..." : saveError ? "Save issue" : "Auto-save active"}</strong>
              <span>{saveError || "Changes are saved automatically while you work."}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="jr-resume-workspace">
        <div className={`jr-resume-form ${mobilePane === "preview" ? "jr-resume-form-hidden" : ""}`}>
          <div className="jr-resume-toolbar">
            <div>
              <span className="jr-page-eyebrow">Editing</span>
              <h3>{stepInfo.label}</h3>
              <p>{stepInfo.desc}</p>
            </div>
            <div className="jr-resume-toolbar-actions">
              <button
                type="button"
                className={`jr-btn jr-btn-secondary jr-btn-sm ${mobilePane === "form" ? "jr-btn-current" : ""}`}
                onClick={() => setMobilePane("form")}
              >
                <DocumentIcon size={14} />
                Form
              </button>
              <button
                type="button"
                className={`jr-btn jr-btn-secondary jr-btn-sm ${mobilePane === "preview" ? "jr-btn-current" : ""}`}
                onClick={() => setMobilePane("preview")}
              >
                <EyeIcon size={14} />
                Preview
              </button>
            </div>
          </div>

          <div className="jr-progress">
            <div className="jr-progress-bar">
              <div className="jr-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="jr-progress-text">{Math.round(progressPercent)}% complete</span>
          </div>

          <div className="jr-resume-steps">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStep(step.id);
                  setShowATS(false);
                  setMobilePane("form");
                }}
                className={`jr-resume-step-btn ${
                  activeStep === step.id && !showATS ? "jr-resume-step-btn-active" : ""
                } ${activeStep > step.id ? "jr-resume-step-completed" : ""}`}
              >
                <div className="jr-resume-step-num">{step.id}</div>
                <span>{step.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowATS(true);
                setMobilePane("form");
              }}
              className={`jr-resume-step-btn ${showATS ? "jr-resume-step-btn-active" : ""} ${showATS ? "jr-resume-step-completed" : ""}`}
            >
              <div className="jr-resume-step-num">6</div>
              <span>ATS</span>
            </button>
          </div>

          <div className="jr-resume-section">
            {!showATS && (
              <ResumeAnalyzer
                key={`analyzer-step-${activeStep}`}
                data={data}
                currentStep={activeStep}
                onApplySuggestion={handleFieldChange}
              />
            )}

            {showATS ? (
              <div className="jr-resume-stack">
                <ATSScoreCard data={data} />
                <RoleSuggestions data={data} />
              </div>
            ) : (
              renderStep({
                activeStep,
                data,
                onFieldChange: handleFieldChange,
              })
            )}
          </div>

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
                  style={{ color: "var(--jr-error)" }}
                >
                  Start over
                </button>
              )}
            </div>

            <div className="jr-resume-actions-right">
              {saving && <span className="jr-text-muted">Saving…</span>}
              {saveError && <span className="jr-text-error">Save failed</span>}
              {!showATS && (
                <button
                  onClick={handleNext}
                  className="jr-btn jr-btn-primary"
                >
                  {activeStep === STEPS.length ? "Check ATS score" : "Next section"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={`jr-resume-preview-pane ${mobilePane === "form" ? "jr-resume-preview-pane-hidden" : ""}`}>
          <ResumeScore score={score} hint={hint} />
          <ResumePreview data={data} />
        </div>
      </div>

      {showResetConfirm && (
        <div className="jr-modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="jr-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Start over?</h3>
            <p>
              This clears the current draft and returns you to the resume start options. Use this only if you want a clean slate.
            </p>
            <div className="jr-modal-actions">
              <button className="jr-btn jr-btn-secondary" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button
                className="jr-btn jr-btn-danger"
                onClick={handleReset}
              >
                Delete draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderStep({
  activeStep,
  data,
  onFieldChange,
}: {
  activeStep: number;
  data: ResumeData;
  onFieldChange: (field: string, value: unknown) => void;
}) {
  switch (activeStep) {
    case 1:
      return <PersonalInfoStep data={data} onChange={onFieldChange} />;
    case 2:
      return <ExperienceStep data={data} onUpdate={(value) => onFieldChange("experiences", value)} />;
    case 3:
      return <EducationStep data={data} onUpdate={(value) => onFieldChange("education", value)} />;
    case 4:
      return <SkillsStep data={data} onUpdate={(value) => onFieldChange("skills", value)} />;
    case 5:
      return <SummaryStep data={data} onChange={onFieldChange} />;
    default:
      return null;
  }
}
