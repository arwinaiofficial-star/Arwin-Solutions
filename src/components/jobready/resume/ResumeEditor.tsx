"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { resumeApi } from "@/lib/api/client";
import {
  DocumentIcon,
  EyeIcon,
  SparklesIcon,
  SearchIcon,
  ClipboardIcon,
  CheckIcon,
} from "@/components/icons/Icons";
import "@/app/jobready/jobready.css";

import PersonalInfoStep from "./PersonalInfoStep";
import ExperienceStep from "./ExperienceStep";
import EducationStep from "./EducationStep";
import SkillsStep from "./SkillsStep";
import SummaryStep from "./SummaryStep";
import ResumePreview from "./ResumePreview";
import ResumeScore, { ResumeScoreSection } from "./ResumeScore";
import ResumeAnalyzer from "./ResumeAnalyzer";
import ATSScoreCard, { ATSResult } from "./ATSScoreCard";
import RoleSuggestions, { buildRoleSuggestions } from "./RoleSuggestions";
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
] as const;

type SectionStatus = ResumeScoreSection & {
  id: number | "ats";
  stepId?: number;
};

export default function ResumeEditor({ initialData, onReset }: ResumeEditorProps) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [data, setData] = useState<ResumeData>(
    initialData || createInitialResumeData(user || null)
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showATS, setShowATS] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mobilePane, setMobilePane] = useState<"form" | "preview">("form");
  const [atsResult, setATSResult] = useState<ATSResult | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const didHydrateRef = useRef(false);
  const didStartAutosaveRef = useRef(false);
  const didRefreshUserRef = useRef(false);

  const saveToDatabase = useCallback(async (resumeData: ResumeData) => {
    setSaving(true);
    setSaveError(null);
    const result = await resumeApi.save(resumeDataToBackend(resumeData), "draft");
    setSaving(false);
    if (result.error) {
      setSaveError(result.error);
      return;
    }

    if (!didRefreshUserRef.current && refreshUser) {
      didRefreshUserRef.current = true;
      void refreshUser();
    }
  }, [refreshUser]);

  useEffect(() => {
    if (didHydrateRef.current) return;
    didHydrateRef.current = true;

    const timeoutId = window.setTimeout(() => {
      void saveToDatabase(data);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [data, saveToDatabase]);

  useEffect(() => {
    if (!didHydrateRef.current) return;

    if (!didStartAutosaveRef.current) {
      didStartAutosaveRef.current = true;
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

  const openStep = (stepId: number) => {
    setShowATS(false);
    setATSResult(null);
    setActiveStep(stepId);
    setMobilePane("form");
  };

  const searchQuery = buildSuggestedSearchQuery(data);
  const { score, hint } = calculateScore(data);
  const reviewScore = atsResult?.score ?? score;
  const sectionStatuses = buildSectionStatuses(data, activeStep, showATS, atsResult);
  const completedSections = sectionStatuses.filter((section) => section.status === "complete" && section.id !== "ats").length;
  const attentionSection = sectionStatuses.find(
    (section) => section.id !== "ats" && section.status === "attention"
  );
  const fallbackReviewStep = attentionSection?.stepId ?? 5;
  const atsReady = reviewScore >= 72 && !attentionSection;

  const stepInfo = showATS
    ? {
        label: "Review and handoff",
        desc: "Check ATS readiness, pick a role path, and move into jobs without losing context.",
      }
    : STEPS[activeStep - 1];

  const progressPercent = ((showATS ? STEPS.length + 1 : activeStep) / (STEPS.length + 1)) * 100;

  const reviewPlan = showATS
    ? {
        title: atsReady ? "Move into jobs with this draft" : `Tighten ${attentionSection?.label || "your resume"} first`,
        copy: atsReady
          ? "Use one focused search, save the best roles, and mark a job applied only when you open the real posting."
          : attentionSection?.note || "Fix the weakest section, then rerun the ATS review before you rely on this draft.",
        tone: atsReady ? "ready" : "attention",
        primaryLabel: atsReady ? `Search ${searchQuery}` : `Edit ${attentionSection?.label || "Summary"}`,
        secondaryLabel: atsReady ? "Open applications" : `Search ${searchQuery} anyway`,
      }
    : {
        title: activeStep === STEPS.length ? "Finish with an ATS check" : `Next: ${STEPS[activeStep].label}`,
        copy: activeStep === STEPS.length
          ? "Once this section is solid, review the full resume before you move into jobs."
          : STEPS[activeStep].desc,
      };

  const workflowItems = showATS
    ? [
        atsReady
          ? `Start with ${buildRoleSuggestions(data)[0]?.title || searchQuery}.`
          : `Fix ${attentionSection?.label || "the weakest section"} first.`,
        "Save promising roles to Applications.",
        "Use Apply now when you are ready to open the live posting.",
      ]
    : [
        `Complete ${stepInfo.label.toLowerCase()}.`,
        activeStep < STEPS.length
          ? `Then move into ${STEPS[activeStep].label.toLowerCase()}.`
          : "Then run the ATS review to sanity-check the full draft.",
        "Your draft saves automatically while you work.",
      ];

  const handleReviewPrimaryAction = () => {
    if (!showATS) return;

    if (atsReady) {
      router.push(`/jobready/app/jobs?q=${encodeURIComponent(searchQuery)}`);
      return;
    }

    openStep(fallbackReviewStep);
  };

  const handleReviewSecondaryAction = () => {
    if (!showATS) return;

    if (atsReady) {
      router.push("/jobready/app/applications");
      return;
    }

    router.push(`/jobready/app/jobs?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="jr-resume-editor">
      <section className="jr-page-hero jr-resume-hero">
        <div className="jr-page-hero-copy">
          <span className="jr-page-eyebrow">Resume workspace</span>
          <h2>Build once, review clearly, then move straight into jobs.</h2>
          <p>Each section has one job. When the draft is ready, the workspace tells you what to do next.</p>
        </div>
        <div className="jr-page-hero-aside">
          <div className="jr-mini-metric">
            <div className="jr-mini-metric-icon">
              <DocumentIcon size={16} />
            </div>
            <div>
              <strong>{showATS ? "Review stage" : `${completedSections} of ${STEPS.length} sections ready`}</strong>
              <span>{stepInfo.label}</span>
            </div>
          </div>
          <div className="jr-mini-metric">
            <div className="jr-mini-metric-icon">
              <SparklesIcon size={16} />
            </div>
            <div>
              <strong>{saving ? "Saving draft..." : saveError ? "Save issue" : "Auto-save active"}</strong>
              <span>{saveError || "Your latest draft is kept in sync while you edit."}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="jr-resume-workspace">
        <div className={`jr-resume-form ${mobilePane === "preview" ? "jr-resume-form-hidden" : ""}`}>
          <div className="jr-resume-toolbar">
            <div>
              <span className="jr-page-eyebrow">Current focus</span>
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
                Workspace
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

          <div className="jr-resume-progress-shell">
            <div className="jr-progress">
              <div className="jr-progress-bar">
                <div className="jr-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="jr-progress-text">{Math.round(progressPercent)}% through the flow</span>
            </div>
            <div className="jr-resume-progress-meta">
              <strong>{completedSections} sections are application-ready</strong>
              <span>{showATS ? reviewPlan.copy : reviewPlan.title}</span>
            </div>
          </div>

          <div className="jr-resume-steps">
            {STEPS.map((step) => {
              const section = sectionStatuses.find((item) => item.id === step.id);
              return (
                <button
                  key={step.id}
                  onClick={() => openStep(step.id)}
                  className={`jr-resume-step-btn ${
                    activeStep === step.id && !showATS ? "jr-resume-step-btn-active" : ""
                  } ${
                    section?.status === "complete" ? "jr-resume-step-completed" : ""
                  } ${
                    section?.status === "attention" ? "jr-resume-step-attention" : ""
                  }`}
                >
                  <div className="jr-resume-step-num">{step.id}</div>
                  <div className="jr-resume-step-copy">
                    <span>{step.label}</span>
                    <small>{section?.note}</small>
                  </div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setShowATS(true);
                setMobilePane("form");
              }}
              className={`jr-resume-step-btn ${showATS ? "jr-resume-step-btn-active" : ""} ${
                atsReady ? "jr-resume-step-completed" : ""
              }`}
            >
              <div className="jr-resume-step-num">6</div>
              <div className="jr-resume-step-copy">
                <span>Review</span>
                <small>{showATS ? "ATS and role handoff" : "Final check before jobs"}</small>
              </div>
            </button>
          </div>

          <div className="jr-resume-section">
            {showATS ? (
              <div className="jr-resume-review-shell">
                <div className="jr-resume-review-grid">
                  <ATSScoreCard data={data} onResultChange={setATSResult} />

                  <aside className={`jr-resume-next-panel jr-resume-next-panel-${reviewPlan.tone}`}>
                    <span className="jr-page-eyebrow">Next move</span>
                    <h3>{reviewPlan.title}</h3>
                    <p>{reviewPlan.copy}</p>

                    <div className="jr-resume-next-list">
                      {workflowItems.map((item, index) => (
                        <div key={item} className="jr-resume-next-item">
                          <span>{index + 1}</span>
                          <p>{item}</p>
                        </div>
                      ))}
                    </div>

                    <div className="jr-resume-next-actions">
                      <button className="jr-btn jr-btn-primary" onClick={handleReviewPrimaryAction}>
                        {atsReady ? <SearchIcon size={14} /> : <CheckIcon size={14} />}
                        {reviewPlan.primaryLabel}
                      </button>
                      <button className="jr-btn jr-btn-secondary" onClick={handleReviewSecondaryAction}>
                        <ClipboardIcon size={14} />
                        {reviewPlan.secondaryLabel}
                      </button>
                    </div>
                  </aside>
                </div>

                <RoleSuggestions data={data} />
              </div>
            ) : (
              <>
                {renderStep({
                  activeStep,
                  data,
                  onFieldChange: handleFieldChange,
                })}
                <ResumeAnalyzer
                  key={`analyzer-step-${activeStep}`}
                  data={data}
                  currentStep={activeStep}
                  onApplySuggestion={handleFieldChange}
                />
              </>
            )}
          </div>

          <div className="jr-resume-actions">
            <div className="jr-resume-actions-left">
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
                  className="jr-btn jr-btn-ghost jr-btn-danger-text"
                >
                  Start over
                </button>
              )}
            </div>

            <div className="jr-resume-actions-right">
              {saving && <span className="jr-text-muted">Saving…</span>}
              {saveError && <span className="jr-text-error">Save failed</span>}
              {!showATS && (
                <button onClick={handleNext} className="jr-btn jr-btn-primary">
                  {activeStep === STEPS.length ? "Move to review" : "Next section"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={`jr-resume-preview-pane ${mobilePane === "form" ? "jr-resume-preview-pane-hidden" : ""}`}>
          <ResumeScore
            score={reviewScore}
            hint={hint}
            sections={sectionStatuses}
            nextActionLabel={reviewPlan.title}
            nextActionCopy={reviewPlan.copy}
          />

          <div className="jr-workspace-rail-card">
            <span className="jr-page-eyebrow">{showATS ? "Workflow" : "How this works"}</span>
            <h3>{showATS ? "From resume to jobs" : "Keep one clear path through the editor"}</h3>
            <div className="jr-workspace-rail-list">
              {workflowItems.map((item, index) => (
                <div key={item} className="jr-workspace-rail-item">
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <ResumePreview data={data} />
        </div>
      </div>

      {showResetConfirm && (
        <div className="jr-modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="jr-modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>Start over?</h3>
            <p>
              This clears the current draft and returns you to the resume start options. Use this only if you want a clean slate.
            </p>
            <div className="jr-modal-actions">
              <button className="jr-btn jr-btn-secondary" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button className="jr-btn jr-btn-danger" onClick={handleReset}>
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

function buildSectionStatuses(
  data: ResumeData,
  activeStep: number,
  showATS: boolean,
  atsResult: ATSResult | null
): SectionStatus[] {
  const sections: SectionStatus[] = [
    {
      id: 1,
      stepId: 1,
      label: "Personal",
      ...evaluateSection(
        Boolean(data.fullName.trim() && data.email.trim() && data.phone.trim() && data.location.trim()),
        activeStep === 1 && !showATS,
        activeStep > 1 || showATS,
        data.linkedIn || data.portfolio
          ? "Core details plus profile links are in place."
          : "Add core details and at least one profile link.",
        "Finish your core contact details."
      ),
    },
    {
      id: 2,
      stepId: 2,
      label: "Experience",
      ...evaluateSection(
        data.experiences.length > 0 &&
          data.experiences.every(
            (experience) =>
              experience.title.trim() &&
              experience.company.trim() &&
              experience.startDate.trim() &&
              experience.highlights.filter(Boolean).length >= 2
          ),
        activeStep === 2 && !showATS,
        activeStep > 2 || showATS,
        "Your experience section has measurable detail.",
        "Add bullet-point outcomes for each role."
      ),
    },
    {
      id: 3,
      stepId: 3,
      label: "Education",
      ...evaluateSection(
        data.education.length > 0 &&
          data.education.every(
            (entry) => entry.degree.trim() && entry.institution.trim() && entry.graduationYear.trim()
          ),
        activeStep === 3 && !showATS,
        activeStep > 3 || showATS,
        "Education details are present and readable.",
        "Add degree, institution, and graduation year."
      ),
    },
    {
      id: 4,
      stepId: 4,
      label: "Skills",
      ...evaluateSection(
        data.skills.length >= 5,
        activeStep === 4 && !showATS,
        activeStep > 4 || showATS,
        `${data.skills.length} skills listed.`,
        "Add at least 5 relevant skills and tools."
      ),
    },
    {
      id: 5,
      stepId: 5,
      label: "Summary",
      ...evaluateSection(
        data.summary.trim().length >= 80,
        activeStep === 5 && !showATS,
        showATS,
        "Summary is long enough to support applications.",
        "Write a concise 2-3 sentence summary."
      ),
    },
  ];

  sections.push({
    id: "ats",
    label: "Review",
    status: showATS
      ? (atsResult?.score ?? 0) >= 72 && !sections.some((section) => section.status === "attention")
        ? "complete"
        : "current"
      : "pending",
    note: showATS
      ? (atsResult?.score ?? 0) >= 72
        ? "ATS check done. Ready to move into jobs."
        : "Use ATS feedback to tighten the draft."
      : "Final review before jobs.",
  });

  return sections;
}

function evaluateSection(
  isComplete: boolean,
  isCurrent: boolean,
  wasVisited: boolean,
  completeNote: string,
  attentionNote: string
) {
  if (isComplete) {
    return { status: "complete" as const, note: completeNote };
  }

  if (isCurrent) {
    return { status: "current" as const, note: attentionNote };
  }

  if (wasVisited) {
    return { status: "attention" as const, note: attentionNote };
  }

  return { status: "pending" as const, note: "Not tackled yet." };
}

function buildSuggestedSearchQuery(data: ResumeData) {
  const recommendedRole = buildRoleSuggestions(data)[0]?.title;
  if (recommendedRole) return recommendedRole;

  const latestExperienceTitle = data.experiences.find((experience) => experience.title.trim())?.title;
  if (latestExperienceTitle) return latestExperienceTitle;

  if (data.skills.length > 0) {
    return `${data.skills[0]} roles`;
  }

  return "Software engineer";
}
