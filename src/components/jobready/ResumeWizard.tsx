"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useAuth, GeneratedCV } from "@/context/AuthContext";
import { resumeApi } from "@/lib/api/client";
import { normalizeEducationRecord, normalizeEducationRecords } from "@/lib/resumeExtraction";
import {
  CheckIcon,
  BriefcaseIcon,
  UserIcon,
  UploadIcon,
  DownloadIcon,
  SearchIcon,
  ArrowRightIcon,
  PlusIcon,
  XIcon,
  ChatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  ResetIcon,
  DocumentIcon,
  AlertIcon,
} from "@/components/icons/Icons";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationYear: string;
  gpa: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  summary: string;
  skills: string[];
  experiences: ExperienceEntry[];
  education: EducationEntry[];
}

const STEP_LABELS = ["Start", "Personal", "Experience", "Education", "Skills", "Preview"];

type ResumeTheme = "classic" | "modern" | "minimal";

export interface ResumeWizardHandle {
  triggerUpload: () => void;
  openStoryComposer: () => void;
  setStep: (s: number) => void;
  setField: (field: string, value: unknown) => void;
  enhanceExperience: () => void;
  generateSummary: () => void;
  runATS: () => void;
  downloadPDF: () => void;
  resetResume: () => Promise<void>;
  getStep: () => number;
  getData: () => ResumeData;
}

interface ResumeWizardProps {
  onNavigateToSearch?: () => void;
  onStepChange?: (step: number) => void;
  onDataChange?: (data: ResumeData) => void;
  onATSComplete?: (result: { score: number | null; feedback: string[] }) => void;
  onReset?: () => void;
  handleRef?: (handle: ResumeWizardHandle) => void;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ResumeWizard({ onNavigateToSearch, onStepChange, onDataChange, onATSComplete, onReset, handleRef }: ResumeWizardProps) {
  const { user, saveGeneratedCV, updateProfile, clearGeneratedCV } = useAuth();
  const [step, setStepRaw] = useState(0);
  const [data, setData] = useState<ResumeData>(createInitialResumeData(user));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [storyMode, setStoryMode] = useState(false);
  const [storyInput, setStoryInput] = useState("");
  const [isStoryImporting, setIsStoryImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvLoadedRef = useRef(false);

  // Preview state
  const [theme, setTheme] = useState<ResumeTheme>("classic");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsFeedback, setAtsFeedback] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Wrapper for setStep that notifies parent
  const setStep = useCallback((s: number) => {
    setStepRaw(s);
    onStepChange?.(s);
  }, [onStepChange]);

  // Notify parent when data changes
  useEffect(() => {
    onDataChange?.(data);
  }, [data, onDataChange]);

  // ── LIVE PREVIEW: Derive CV from data in real-time (no race condition) ──
  const liveCV = useMemo<GeneratedCV>(() => buildCVFromData(data), [data]);

  // If user already has a CV, pre-populate.
  // Runs when user.cvData becomes available (async — loaded after auth completes).
  // Uses a ref guard instead of !data.fullName because data.fullName is pre-seeded
  // from user.name and would always block the load.
  useEffect(() => {
    if (user?.cvData && !cvLoadedRef.current) {
      cvLoadedRef.current = true;
      const cv = user.cvData;
      setData({
        fullName: cv.personalInfo?.name || user.name || "",
        email: cv.personalInfo?.email || user.email || "",
        phone: cv.personalInfo?.phone || user.phone || "",
        location: cv.personalInfo?.location || "",
        linkedIn: cv.personalInfo?.linkedIn || "",
        portfolio: cv.personalInfo?.portfolio || "",
        summary: cv.summary || "",
        skills: cv.skills || [],
        experiences: (cv.experience || []).map(e => ({
          id: uid(), title: e.title, company: e.company, location: e.location,
          startDate: e.startDate, endDate: e.endDate, current: e.current,
          highlights: e.highlights.length > 0 ? e.highlights : [""],
        })),
        education: (cv.education || []).map(e => ({
          id: uid(), degree: e.degree, institution: e.institution,
          location: e.location || "", graduationYear: e.graduationYear, gpa: e.gpa || "",
        })),
      });
      // Returning user with existing CV → go straight to preview
      if (cv.personalInfo?.name || cv.skills?.length || cv.experience?.length) {
        setStep(5);
      }
    }
  }, [user?.cvData]); // eslint-disable-line

  // ─── Data Helpers ────────────────────────────────────────────────────────

  const updateField = useCallback(<K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Generic field setter for copilot auto-fill
  const setField = useCallback((field: string, value: unknown) => {
    setData(prev => {
      if (!(field in prev)) return prev;

      if (field === "skills" && Array.isArray(value)) {
        const mergedSkills = Array.from(
          new Set(
            [...prev.skills, ...value]
              .map((skill) => typeof skill === "string" ? skill.trim() : "")
              .filter(Boolean)
          )
        );
        return { ...prev, skills: mergedSkills };
      }

      if (field === "experiences" && Array.isArray(value)) {
        return {
          ...prev,
          experiences: mergeExperienceEntries(prev.experiences, value),
        };
      }

      if (field === "education" && Array.isArray(value)) {
        return {
          ...prev,
          education: mergeEducationEntries(prev.education, value),
        };
      }

      return { ...prev, [field]: value };
    });
  }, []);

  const resetLocalState = useCallback(() => {
    cvLoadedRef.current = false;
    setUploadError(null);
    setUploadFileName(null);
    setSaveError(null);
    setSaveStatus("idle");
    setStoryMode(false);
    setStoryInput("");
    setAtsScore(null);
    setAtsFeedback([]);
    setData(createInitialResumeData(user));
    setStep(0);
  }, [user, setStep]);

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        id: uid(), title: "", company: "", location: "",
        startDate: "", endDate: "", current: false, highlights: [""],
      }],
    }));
  };

  const updateExperience = (id: string, field: string, value: unknown) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experiences: prev.experiences.filter(e => e.id !== id) }));
  };

  const addHighlight = (expId: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e =>
        e.id === expId ? { ...e, highlights: [...e.highlights, ""] } : e
      ),
    }));
  };

  const updateHighlight = (expId: string, idx: number, value: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e =>
        e.id === expId ? { ...e, highlights: e.highlights.map((h, i) => i === idx ? value : h) } : e
      ),
    }));
  };

  const removeHighlight = (expId: string, idx: number) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e =>
        e.id === expId ? { ...e, highlights: e.highlights.filter((_, i) => i !== idx) } : e
      ),
    }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { id: uid(), degree: "", institution: "", location: "", graduationYear: "", gpa: "" }],
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  // ─── Skill Tag Input ────────────────────────────────────────────────────

  const [skillInput, setSkillInput] = useState("");

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !data.skills.includes(trimmed)) {
      updateField("skills", [...data.skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    updateField("skills", data.skills.filter(s => s !== skill));
  };

  async function applyImportedData(
    extracted: Record<string, unknown> | null,
    rawText?: string
  ) {
    if (extracted) {
      const hasParseError = extracted.parse_error === true;

      if (hasParseError && rawText) {
        setData(prev => ({ ...prev, summary: rawText.slice(0, 500) }));
        setUploadError("Could not fully structure the import. Raw text was loaded into the summary so you can refine it manually.");
        setStep(1);
        return;
      }

      const extractedData = mergeExtractedResumeData(data, extracted);
      const hasName = Boolean(extractedData.fullName.trim());
      const hasExp = extractedData.experiences.some(hasMeaningfulExperience);
      const hasSkills = extractedData.skills.length > 0;

      if (hasName && (hasExp || hasSkills)) {
        const hydratedData = ensureEditableSections(extractedData);
        setData(hydratedData);
        await saveCV("final", hydratedData);
        setStep(5);
      } else if (!hasName) {
        setData(extractedData);
        setStep(1);
      } else if (!hasExp) {
        setData(extractedData);
        setStep(2);
      } else {
        setData(extractedData);
        setStep(4);
      }
      return;
    }

    if (rawText) {
      setData(prev => ({ ...prev, summary: rawText.slice(0, 500) }));
      setUploadError("AI extraction is unavailable. Your text was loaded into the summary. Please fill in the structured fields manually.");
      setStep(1);
      return;
    }

    setUploadError("I couldn't extract usable resume details from that input. Please try again or start from scratch.");
  }

  // ─── Upload Handler ─────────────────────────────────────────────────────

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadFileName(file.name);
    setUploadError(null);

    try {
      const result = await resumeApi.uploadCV(file);
      if (result.data?.extractedData || result.data?.rawText) {
        await applyImportedData(
          (result.data?.extractedData as Record<string, unknown> | null) || null,
          result.data?.rawText,
        );
      } else {
        setUploadError(result.error || "Failed to process file. Please try a different file or start from scratch.");
        setUploadFileName(null);
      }
    } catch {
      setUploadFileName(null);
      setUploadError("Upload failed. Please check your connection and try again.");
    }

    setIsUploading(false);
  };

  async function handleStoryImport() {
    const narrative = storyInput.trim();
    if (!narrative) return;

    setIsStoryImporting(true);
    setUploadError(null);
    setUploadFileName("Story import");

    try {
      const result = await resumeApi.chat(narrative, "extract_cv", { raw_text: narrative });
      const extracted = parseExtractedResumePayload(result.data);
      await applyImportedData(extracted, narrative);
      if (extracted) {
        setStoryMode(false);
      }
    } catch {
      setUploadError("I couldn't read that story right now. Please try again or fill the details manually.");
    }

    setIsStoryImporting(false);
  }

  const resetResume = useCallback(async () => {
    if (typeof window !== "undefined" && !window.confirm("Reset your saved resume data and start again from scratch?")) {
      return;
    }

    setIsResetting(true);
    setUploadError(null);
    const result = await resumeApi.reset();

    if (result.error) {
      setUploadError(result.error);
      setIsResetting(false);
      return;
    }

    clearGeneratedCV();
    updateProfile({ phone: "", location: "" });
    resetLocalState();
    onReset?.();
    setIsResetting(false);
  }, [clearGeneratedCV, onReset, resetLocalState, updateProfile]);

  // ─── AI Enhance ─────────────────────────────────────────────────────────

  const enhanceExperience = async (expId: string) => {
    const exp = data.experiences.find(e => e.id === expId);
    if (!exp || !exp.highlights.some(h => h.trim())) return;

    setIsEnhancing(expId);
    try {
      const result = await resumeApi.chat(
        `Rewrite these bullet points to be achievement-oriented with metrics where possible. Job title: ${exp.title} at ${exp.company}. Current bullets:\n${exp.highlights.filter(h => h.trim()).join("\n")}`,
        "enhance_cv"
      );
      if (result.data?.reply) {
        const enhanced = result.data.reply.split("\n").filter((l: string) => l.trim()).map((l: string) => l.replace(/^[-•*]\s*/, "").trim());
        if (enhanced.length > 0) {
          updateExperience(expId, "highlights", enhanced);
        }
      }
    } catch { /* silent */ }
    setIsEnhancing(null);
  };

  const generateSummary = async () => {
    setIsEnhancing("summary");
    try {
      const result = await resumeApi.chat("", "generate_summary", {
        fullName: data.fullName,
        skills: data.skills,
        experiences: data.experiences.map(e => ({ title: e.title, company: e.company, startDate: e.startDate, endDate: e.endDate })),
        education: data.education.map(e => ({ degree: e.degree, institution: e.institution })),
      });
      if (result.data?.reply) {
        updateField("summary", result.data.reply);
      }
    } catch { /* silent */ }
    setIsEnhancing(null);
  };

  // ─── Save & Finish ────────────────────────────────────────────────────

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function saveCV(status: "draft" | "final" = "final", sourceData?: ResumeData) {
    const nextData = sourceData || data;
    const cv = buildCVFromData(nextData);
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const result = await resumeApi.save(cv as unknown as Record<string, unknown>, status);
      if (result.error) {
        console.error("Resume save failed:", result.error);
        setSaveError(result.error);
        setSaveStatus("error");
        return;
      }
      saveGeneratedCV(cv, { markGenerated: status === "final" });
      updateProfile({
        name: nextData.fullName,
        phone: nextData.phone,
        location: nextData.location,
        skills: nextData.skills,
      });
      setSaveError(null);
      setSaveStatus("saved");
      // Reset indicator after 3s
      setTimeout(() => setSaveStatus(prev => prev === "saved" ? "idle" : prev), 3000);
    } catch {
      setSaveError("Unable to save your resume right now.");
      setSaveStatus("error");
    }
  }

  // Auto-save draft when user changes steps (debounced)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only auto-save if user has entered meaningful data
    if (!data.fullName && !data.email && data.experiences.length === 0) return;
    // Only auto-save during editing steps (1-4)
    if (step < 1 || step > 4) return;

    // Debounce: save 2 seconds after last data change
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      const cv = liveCV;
      // Persist to Neon DB as draft
      resumeApi.save(cv as unknown as Record<string, unknown>, "draft").then(result => {
        if (result.error) {
          console.warn("Auto-save failed:", result.error);
          setSaveError(result.error);
          setSaveStatus("error");
        } else {
          setSaveError(null);
          saveGeneratedCV(cv, { markGenerated: false });
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus(prev => prev === "saved" ? "idle" : prev), 2000);
        }
      });
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, step]);

  const finishAndSave = () => {
    saveCV("final");
    setStep(5);
  };

  const goToStep = (s: number) => {
    if (step === 4 && s === 5) {
      finishAndSave();
      return;
    }
    setStep(s);
  };

  // ─── Preview: ATS Analysis ─────────────────────────────────────────────

  const analyzeATS = async () => {
    const cv = liveCV;
    if (!cv.personalInfo.name) return;
    setIsAnalyzing(true);
    try {
      const result = await resumeApi.chat(
        `Analyze this resume for ATS (Applicant Tracking System) compatibility. Rate it 0-100 and provide specific suggestions. Resume data: Name: ${cv.personalInfo.name}, Skills: ${cv.skills.join(", ")}, Summary: ${cv.summary}, Experience count: ${cv.experience.length}, Education count: ${cv.education.length}. Highlights: ${cv.experience.flatMap(e => e.highlights).join("; ")}. Return ONLY a JSON object: {"score": number, "feedback": ["suggestion1", "suggestion2", ...]}`,
        "chat"
      );
      if (result.data?.reply) {
        try {
          const cleaned = result.data.reply.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
          const parsed = JSON.parse(cleaned);
          setAtsScore(parsed.score || null);
          setAtsFeedback(parsed.feedback || []);
          onATSComplete?.({ score: parsed.score || null, feedback: parsed.feedback || [] });
        } catch {
          const match = result.data.reply.match(/(\d{1,3})/);
          const score = match ? parseInt(match[1]) : 70;
          const feedback = [result.data.reply];
          setAtsScore(score);
          setAtsFeedback(feedback);
          onATSComplete?.({ score, feedback });
        }
      }
    } catch { /* silent */ }
    setIsAnalyzing(false);
  };

  // ─── PDF Download ─────────────────────────────────────────────────────

  const downloadPDF = () => {
    const html = buildResumeHTML(liveCV, theme);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  };

  // ─── Expose handle for copilot integration ───────────────────────────

  useEffect(() => {
    handleRef?.({
      triggerUpload: () => fileInputRef.current?.click(),
      openStoryComposer: () => {
        setStep(0);
        setStoryMode(true);
      },
      setStep,
      setField,
      enhanceExperience: () => {
        if (data.experiences.length > 0) enhanceExperience(data.experiences[0].id);
      },
      generateSummary,
      runATS: analyzeATS,
      downloadPDF,
      resetResume,
      getStep: () => step,
      getData: () => data,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, data, theme, resetResume]);

  // ─── Validation ─────────────────────────────────────────────────────────

  const canProceed = (s: number): boolean => {
    switch (s) {
      case 1: return !!(data.fullName.trim() && data.email.trim());
      case 2: return true;
      case 3: return true;
      case 4: return data.skills.length > 0;
      default: return true;
    }
  };

  // Check if there's enough data to show a meaningful preview
  const hasPreviewData = data.fullName.trim().length > 0 || data.skills.length > 0 || data.experiences.length > 0;

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      <style>{wizardStyles}</style>
      <div className="rw">
        {/* Stepper */}
        {step > 0 && (
          <div className="rw-stepper">
            {STEP_LABELS.slice(1).map((label, i) => {
              const stepNum = i + 1;
              return (
                <button key={label} className={`rw-step ${step === stepNum ? "rw-step-active" : step > stepNum ? "rw-step-done" : ""}`} onClick={() => (step > stepNum || stepNum === 5) && goToStep(stepNum)}>
                  <span className="rw-step-num">{step > stepNum ? <CheckIcon size={12} /> : stepNum}</span>
                  <span className="rw-step-label">{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {(step > 0 || user?.cvGenerated) && (
          <div className="rw-utility-bar">
            <span className="rw-utility-copy">Resume workspace</span>
            <button className="rw-reset-btn" onClick={() => { void resetResume(); }} disabled={isResetting}>
              <ResetIcon size={14} />
              {isResetting ? "Resetting..." : "Start over"}
            </button>
          </div>
        )}

        {/* Upload error banner */}
        {uploadError && (step === 0 || step === 1) && (
          <div className="rw-upload-error">
            <AlertIcon size={16} />
            <p>{uploadError}</p>
            <button onClick={() => setUploadError(null)}><XIcon size={12} /></button>
          </div>
        )}

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />

        {/* ── Step 0: Start ──────────────────────────────────────────── */}
        {step === 0 && (
          <div className="rw-start">
            <div className="rw-start-icon"><DocumentIcon size={34} /></div>
            <h2>Build a sharper resume</h2>
            <p>Import, refine, and finalize a professional resume for real applications.</p>

            <div className="rw-start-options">
              <button className="rw-option" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <UploadIcon size={24} />
                <strong>{isUploading ? "Processing..." : "Upload my CV"}</strong>
                <span>Upload a PDF and I&apos;ll extract your details into the form</span>
                {isUploading && <span className="rw-upload-progress">Extracting with AI...</span>}
                {uploadFileName && !isUploading && <span className="rw-option-file">{uploadFileName}</span>}
              </button>

              <button className="rw-option" onClick={() => { if (data.experiences.length === 0) addExperience(); if (data.education.length === 0) addEducation(); setStep(1); }}>
                <UserIcon size={24} />
                <strong>Start from scratch</strong>
                <span>Fill in your details step by step — I&apos;ll help format everything</span>
              </button>

              <button className={`rw-option ${storyMode ? "rw-option-active" : ""}`} onClick={() => setStoryMode((open) => !open)} disabled={isStoryImporting}>
                <ChatIcon size={24} />
                <strong>Tell your story</strong>
                <span>Paste your story, notes, or rough paragraphs and I&apos;ll turn them into structured resume fields</span>
              </button>
            </div>

            {storyMode && (
              <div className="rw-story-card">
                <div className="rw-story-header">
                  <div>
                    <strong>Share your background</strong>
                    <p>Write naturally. Include work history, skills, education, certifications, and anything worth capturing.</p>
                  </div>
                  <button className="rw-btn-ai" onClick={handleStoryImport} disabled={isStoryImporting || !storyInput.trim()}>
                    {isStoryImporting ? <><span className="rw-spinner" /> Reading...</> : <><SparklesIcon size={14} /> Auto-fill from story</>}
                  </button>
                </div>
                <textarea
                  value={storyInput}
                  onChange={(e) => setStoryInput(e.target.value)}
                  placeholder="Example: I’m a product designer with 5 years of experience across fintech and B2B SaaS. I currently work at..."
                  rows={8}
                  className="rw-textarea rw-story-input"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Split Pane: Form + Live Preview (Steps 1-4) ──────────── */}
        {step >= 1 && step <= 4 && (
          <div className="rw-split">
            {/* Left: Form */}
            <div className={`rw-form-pane ${showPreview ? "" : "rw-form-full"}`}>

              {/* ── Step 1: Personal Info ──────────────────────────── */}
              {step === 1 && (
                <div className="rw-section">
                  <h3 className="rw-section-title">Personal Information</h3>
                  <p className="rw-section-sub">Basic contact details for your resume header.</p>

                  <div className="rw-form-grid">
                    <div className="rw-field rw-field-half">
                      <label>Full Name *</label>
                      <input value={data.fullName} onChange={e => updateField("fullName", e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className="rw-field rw-field-half">
                      <label>Email *</label>
                      <input type="email" value={data.email} onChange={e => updateField("email", e.target.value)} placeholder="john@example.com" />
                    </div>
                    <div className="rw-field rw-field-half">
                      <label>Phone</label>
                      <input value={data.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+91 9876543210" />
                    </div>
                    <div className="rw-field rw-field-half">
                      <label>Location</label>
                      <input value={data.location} onChange={e => updateField("location", e.target.value)} placeholder="Bangalore, India" />
                    </div>
                    <div className="rw-field rw-field-half">
                      <label>LinkedIn</label>
                      <input value={data.linkedIn} onChange={e => updateField("linkedIn", e.target.value)} placeholder="linkedin.com/in/johndoe" />
                    </div>
                    <div className="rw-field rw-field-half">
                      <label>Portfolio / Website</label>
                      <input value={data.portfolio} onChange={e => updateField("portfolio", e.target.value)} placeholder="johndoe.dev" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Experience ─────────────────────────────── */}
              {step === 2 && (
                <div className="rw-section">
                  <div className="rw-section-header">
                    <div>
                      <h3 className="rw-section-title">Work Experience</h3>
                      <p className="rw-section-sub">Add your work history. Most recent first.</p>
                    </div>
                    <button className="rw-btn-add" onClick={addExperience}><PlusIcon size={14} /> Add Role</button>
                  </div>

                  {data.experiences.length === 0 && (
                    <div className="rw-empty">
                      <BriefcaseIcon size={32} color="#475569" />
                      <p>No experience added yet</p>
                      <button className="rw-btn-add" onClick={addExperience}><PlusIcon size={14} /> Add Your First Role</button>
                    </div>
                  )}

                  {data.experiences.map(exp => (
                    <div key={exp.id} className="rw-card">
                      <div className="rw-card-header">
                        <strong>{exp.title || "New Role"}</strong>
                        <button className="rw-card-remove" onClick={() => removeExperience(exp.id)}><XIcon size={14} /></button>
                      </div>

                      <div className="rw-form-grid">
                        <div className="rw-field rw-field-half">
                          <label>Job Title</label>
                          <input value={exp.title} onChange={e => updateExperience(exp.id, "title", e.target.value)} placeholder="Software Engineer" />
                        </div>
                        <div className="rw-field rw-field-half">
                          <label>Company</label>
                          <input value={exp.company} onChange={e => updateExperience(exp.id, "company", e.target.value)} placeholder="Google" />
                        </div>
                        <div className="rw-field rw-field-third">
                          <label>Location</label>
                          <input value={exp.location} onChange={e => updateExperience(exp.id, "location", e.target.value)} placeholder="Bangalore" />
                        </div>
                        <div className="rw-field rw-field-third">
                          <label>Start Date</label>
                          <input value={exp.startDate} onChange={e => updateExperience(exp.id, "startDate", e.target.value)} placeholder="Jan 2022" />
                        </div>
                        <div className="rw-field rw-field-third">
                          <label>{exp.current ? "Current" : "End Date"}</label>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input value={exp.current ? "Present" : exp.endDate} onChange={e => updateExperience(exp.id, "endDate", e.target.value)} placeholder="Dec 2023" disabled={exp.current} style={{ flex: 1 }} />
                            <label style={{ display: "flex", gap: 4, alignItems: "center", fontSize: "0.75rem", color: "#94a3b8", whiteSpace: "nowrap", cursor: "pointer" }}>
                              <input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, "current", e.target.checked)} /> Current
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="rw-highlights">
                        <div className="rw-highlights-header">
                          <label>Key Achievements / Responsibilities</label>
                          <button className="rw-btn-ai" onClick={() => enhanceExperience(exp.id)} disabled={isEnhancing === exp.id}>
                          {isEnhancing === exp.id ? <><span className="rw-spinner" /> Enhancing...</> : <><SparklesIcon size={14} /> AI Enhance</>}
                          </button>
                        </div>
                        {exp.highlights.map((h, i) => (
                          <div key={i} className="rw-highlight-row">
                            <span className="rw-bullet">•</span>
                            <input value={h} onChange={e => updateHighlight(exp.id, i, e.target.value)} placeholder="Describe what you did and the impact..." />
                            {exp.highlights.length > 1 && (
                              <button className="rw-highlight-remove" onClick={() => removeHighlight(exp.id, i)}><XIcon size={12} /></button>
                            )}
                          </div>
                        ))}
                        <button className="rw-btn-text" onClick={() => addHighlight(exp.id)}><PlusIcon size={12} /> Add bullet</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Step 3: Education ──────────────────────────────── */}
              {step === 3 && (
                <div className="rw-section">
                  <div className="rw-section-header">
                    <div>
                      <h3 className="rw-section-title">Education</h3>
                      <p className="rw-section-sub">Add your degrees and certifications.</p>
                    </div>
                    <button className="rw-btn-add" onClick={addEducation}><PlusIcon size={14} /> Add Education</button>
                  </div>

                  {data.education.length === 0 && (
                    <div className="rw-empty">
                      <p>No education added yet</p>
                      <button className="rw-btn-add" onClick={addEducation}><PlusIcon size={14} /> Add Education</button>
                    </div>
                  )}

                  {data.education.map(edu => (
                    <div key={edu.id} className="rw-card">
                      <div className="rw-card-header">
                        <strong>{edu.degree || "New Education"}</strong>
                        <button className="rw-card-remove" onClick={() => removeEducation(edu.id)}><XIcon size={14} /></button>
                      </div>
                      <div className="rw-form-grid">
                        <div className="rw-field rw-field-half">
                          <label>Degree / Qualification</label>
                          <input value={edu.degree} onChange={e => updateEducation(edu.id, "degree", e.target.value)} placeholder="B.Tech in Computer Science" />
                        </div>
                        <div className="rw-field rw-field-half">
                          <label>Institution</label>
                          <input value={edu.institution} onChange={e => updateEducation(edu.id, "institution", e.target.value)} placeholder="IIT Delhi" />
                        </div>
                        <div className="rw-field rw-field-third">
                          <label>Location</label>
                          <input value={edu.location} onChange={e => updateEducation(edu.id, "location", e.target.value)} placeholder="New Delhi" />
                        </div>
                        <div className="rw-field rw-field-third">
                          <label>Graduation Year</label>
                          <input value={edu.graduationYear} onChange={e => updateEducation(edu.id, "graduationYear", e.target.value)} placeholder="2022" />
                        </div>
                        <div className="rw-field rw-field-third">
                          <label>GPA (optional)</label>
                          <input value={edu.gpa} onChange={e => updateEducation(edu.id, "gpa", e.target.value)} placeholder="8.5/10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Step 4: Skills & Summary ───────────────────────── */}
              {step === 4 && (
                <div className="rw-section">
                  <h3 className="rw-section-title">Skills & Professional Summary</h3>
                  <p className="rw-section-sub">Add your technical skills and let AI generate your summary.</p>

                  <div className="rw-field">
                    <label>Skills *</label>
                    <div className="rw-skills-input">
                      {data.skills.map(skill => (
                        <span key={skill} className="rw-skill-tag">
                          {skill}
                          <button onClick={() => removeSkill(skill)}><XIcon size={10} /></button>
                        </span>
                      ))}
                      <input
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(skillInput); } }}
                        placeholder={data.skills.length === 0 ? "Type a skill and press Enter (e.g. React, Python, AWS)" : "Add more..."}
                        className="rw-skills-text"
                      />
                    </div>
                    <span className="rw-field-hint">Press Enter or comma to add each skill</span>
                  </div>

                  <div className="rw-field" style={{ marginTop: 24 }}>
                    <div className="rw-highlights-header">
                      <label>Professional Summary</label>
                      <button className="rw-btn-ai" onClick={generateSummary} disabled={isEnhancing === "summary"}>
                        {isEnhancing === "summary" ? <><span className="rw-spinner" /> Generating...</> : <><SparklesIcon size={14} /> AI Generate</>}
                      </button>
                    </div>
                    <textarea value={data.summary} onChange={e => updateField("summary", e.target.value)} placeholder="A brief professional summary highlighting your experience, skills, and career goals. Click 'AI Generate' to create one automatically." rows={5} className="rw-textarea" />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="rw-nav">
                <button className="rw-btn rw-btn-ghost" onClick={() => goToStep(step - 1)}>
                  <ChevronLeftIcon size={14} /> {step === 1 ? "Start" : "Back"}
                </button>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {saveStatus !== "idle" && (
                    <span className={`rw-save-indicator rw-save-${saveStatus}`}>
                      {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save failed"}
                    </span>
                  )}
                  <button className="rw-btn-toggle-preview" onClick={() => setShowPreview(p => !p)}>
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </button>
                  <button className="rw-btn rw-btn-primary" onClick={() => goToStep(step + 1)} disabled={!canProceed(step)}>
                    {step === 4 ? "Generate Resume" : "Next"} <ChevronRightIcon size={14} />
                  </button>
                </div>
              </div>
              {saveError && <p className="rw-save-error">{saveError}</p>}
            </div>

            {/* Right: Live Preview */}
            {showPreview && (
              <div className="rw-preview-pane">
                <div className="rw-preview-pane-header">
                  <span>Live Preview</span>
                  <div className="rw-theme-picker-sm">
                    {(["classic", "modern", "minimal"] as ResumeTheme[]).map(t => (
                      <button key={t} className={`rw-theme-btn-sm ${theme === t ? "rw-theme-active-sm" : ""}`} onClick={() => setTheme(t)}>{t}</button>
                    ))}
                  </div>
                </div>
                {hasPreviewData ? (
                  <div className={`rw-live-preview rw-theme-${theme}`}>
                    <LivePreviewContent cv={liveCV} theme={theme} />
                  </div>
                ) : (
                  <div className="rw-preview-empty">
                    <p>Start filling in your details to see a live preview here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 5: Full Preview Playground ───────────────────────── */}
        {step === 5 && (
          <div className="rw-section">
            {/* Toolbar */}
            <div className="rw-preview-toolbar">
              <div className="rw-preview-toolbar-left">
                <span className="rw-preview-title">Resume Preview</span>
              </div>
              <div className="rw-preview-toolbar-right">
                <div className="rw-theme-picker">
                  {(["classic", "modern", "minimal"] as ResumeTheme[]).map(t => (
                    <button key={t} className={`rw-theme-btn ${theme === t ? "rw-theme-active" : ""}`} onClick={() => setTheme(t)}>
                      {t === "classic" ? "Classic" : t === "modern" ? "Studio" : "Minimal"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ATS Score */}
            <div className="rw-ats-bar">
              {atsScore !== null ? (
                <div className="rw-ats-result">
                  <div className={`rw-ats-badge ${atsScore >= 70 ? "rw-ats-good" : atsScore >= 40 ? "rw-ats-ok" : "rw-ats-low"}`}>
                    ATS Score: {atsScore}/100
                  </div>
                  {atsFeedback.length > 0 && (
                    <div className="rw-ats-feedback">
                      {atsFeedback.slice(0, 4).map((f, i) => (
                        <div key={i} className="rw-ats-tip">{f}</div>
                      ))}
                    </div>
                  )}
                  <button className="rw-btn-text" onClick={() => { setAtsScore(null); setAtsFeedback([]); }}>Dismiss</button>
                </div>
              ) : (
                <button className="rw-ats-btn" onClick={analyzeATS} disabled={isAnalyzing}>
                  {isAnalyzing ? <><span className="rw-spinner" /> Analyzing...</> : <><SearchIcon size={14} /> Check ATS Compatibility</>}
                </button>
              )}
            </div>

            {/* Actions Bar */}
            <div className="rw-preview-actions">
              <button className="rw-btn rw-btn-primary" onClick={downloadPDF}><DownloadIcon size={14} /> Download PDF</button>
              <button className="rw-btn rw-btn-primary" onClick={() => onNavigateToSearch?.()}>
                <SearchIcon size={14} /> Find Matching Jobs <ArrowRightIcon size={14} />
              </button>
              <button className="rw-btn rw-btn-ghost" onClick={() => setStep(1)}><DocumentIcon size={14} /> Edit Resume</button>
              <button className="rw-btn rw-btn-ghost" onClick={() => saveCV("final")}>
                {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Retry Save" : "Save"}
              </button>
            </div>
            {saveError && <p className="rw-save-error">{saveError}</p>}

            {/* Full Preview */}
            <div className={`rw-preview rw-theme-${theme}`}>
              <LivePreviewContent cv={liveCV} theme={theme} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Live Preview Component (shared between split-pane and full view) ────

function LivePreviewContent({ cv }: { cv: GeneratedCV; theme: ResumeTheme }) {
  if (!cv.personalInfo?.name && cv.skills.length === 0 && cv.experience.length === 0) {
    return <p style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>Fill in your details to see preview</p>;
  }

  return (
    <>
      {cv.personalInfo?.name && (
        <h1 className="rw-cv-name">{cv.personalInfo.name}</h1>
      )}
      {[cv.personalInfo?.email, cv.personalInfo?.phone, cv.personalInfo?.location, cv.personalInfo?.linkedIn].filter(Boolean).length > 0 && (
        <div className="rw-cv-contact">
          {[cv.personalInfo.email, cv.personalInfo.phone, cv.personalInfo.location, cv.personalInfo.linkedIn].filter(Boolean).join(" · ")}
        </div>
      )}
      {cv.summary && (
        <>
          <div className="rw-cv-heading">Professional Summary</div>
          <p className="rw-cv-text">{cv.summary}</p>
        </>
      )}
      {cv.skills.length > 0 && (
        <>
          <div className="rw-cv-heading">Technical Skills</div>
          <p className="rw-cv-text">{cv.skills.join(" · ")}</p>
        </>
      )}
      {cv.experience.length > 0 && (
        <>
          <div className="rw-cv-heading">Work Experience</div>
          {cv.experience.map((exp, i) => (
            <div key={i} className="rw-cv-exp">
              <div className="rw-cv-exp-row">
                <strong>{exp.title || "Untitled Role"}</strong>
                {(exp.startDate || exp.endDate) && <span>{exp.startDate} – {exp.endDate}</span>}
              </div>
              {(exp.company || exp.location) && (
                <div className="rw-cv-exp-company">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
              )}
              {exp.highlights.length > 0 && (
                <ul className="rw-cv-list">{exp.highlights.map((h, j) => <li key={j}>{h}</li>)}</ul>
              )}
            </div>
          ))}
        </>
      )}
      {cv.education.length > 0 && (
        <>
          <div className="rw-cv-heading">Education</div>
          {cv.education.map((edu, i) => (
            <div key={i} className="rw-cv-edu">
              <strong>{edu.degree || "Degree"}</strong>
              {edu.institution && <> — {edu.institution}</>}
              {edu.graduationYear && <>, {edu.graduationYear}</>}
              {edu.gpa && <span className="rw-cv-gpa"> (GPA: {edu.gpa})</span>}
            </div>
          ))}
        </>
      )}
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return `_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createInitialResumeData(user?: {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
} | null): ResumeData {
  return {
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    linkedIn: "",
    portfolio: "",
    summary: "",
    skills: [],
    experiences: [],
    education: [],
  };
}

function parseExtractedResumePayload(
  payload?: { reply?: string; data?: Record<string, unknown> }
): Record<string, unknown> | null {
  if (payload?.data && typeof payload.data === "object") {
    return payload.data;
  }

  if (!payload?.reply) return null;

  try {
    return JSON.parse(payload.reply) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isMeaningfulExperience(exp: {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}) {
  return Boolean(
    exp.title.trim() ||
    exp.company.trim() ||
    exp.location.trim() ||
    exp.startDate.trim() ||
    exp.endDate.trim() ||
    exp.highlights.some((highlight) => highlight.trim())
  );
}

function isMeaningfulEducation(edu: {
  degree: string;
  institution: string;
  location: string;
  graduationYear: string;
  gpa: string;
}) {
  return Boolean(
    edu.degree.trim() ||
    edu.institution.trim() ||
    edu.location.trim() ||
    edu.graduationYear.trim() ||
    edu.gpa.trim()
  );
}

function mergeExperienceEntries(
  current: ExperienceEntry[],
  incoming: unknown[]
): ExperienceEntry[] {
  const normalizedIncoming = incoming
    .map((item) => {
      const experience = item as Partial<ExperienceEntry>;
      return {
        id: uid(),
        title: typeof experience.title === "string" ? experience.title : "",
        company: typeof experience.company === "string" ? experience.company : "",
        location: typeof experience.location === "string" ? experience.location : "",
        startDate: typeof experience.startDate === "string" ? experience.startDate : "",
        endDate: typeof experience.endDate === "string" ? experience.endDate : "",
        current: Boolean(experience.current),
        highlights: Array.isArray(experience.highlights)
          ? experience.highlights
              .map((highlight) => typeof highlight === "string" ? highlight.trim() : "")
              .filter(Boolean)
          : [],
      };
    })
    .filter(isMeaningfulExperience);

  if (normalizedIncoming.length === 0) return current;
  if (current.every((entry) => !isMeaningfulExperience(entry))) {
    return normalizedIncoming;
  }

  const existingKeys = new Set(
    current
      .filter(isMeaningfulExperience)
      .map((entry) => `${entry.title}|${entry.company}|${entry.startDate}|${entry.endDate}`.toLowerCase())
  );
  const dedupedIncoming = normalizedIncoming.filter((entry) => {
    const key = `${entry.title}|${entry.company}|${entry.startDate}|${entry.endDate}`.toLowerCase();
    if (existingKeys.has(key)) return false;
    existingKeys.add(key);
    return true;
  });

  return dedupedIncoming.length > 0 ? [...current, ...dedupedIncoming] : current;
}

function mergeEducationEntries(
  current: EducationEntry[],
  incoming: unknown[]
): EducationEntry[] {
  const normalizedIncoming = incoming
    .map((item) => {
      const education = normalizeEducationRecord(item);
      if (!education) {
        return null;
      }
      return {
        id: uid(),
        degree: education.degree,
        institution: education.institution,
        location: education.location,
        graduationYear: education.graduationYear,
        gpa: education.gpa,
      };
    })
    .filter((entry): entry is EducationEntry => Boolean(entry))
    .filter(isMeaningfulEducation);

  if (normalizedIncoming.length === 0) return current;
  if (current.every((entry) => !isMeaningfulEducation(entry))) {
    return normalizedIncoming;
  }

  const existingKeys = new Set(
    current
      .filter(isMeaningfulEducation)
      .map((entry) => `${entry.degree}|${entry.institution}|${entry.graduationYear}`.toLowerCase())
  );
  const dedupedIncoming = normalizedIncoming.filter((entry) => {
    const key = `${entry.degree}|${entry.institution}|${entry.graduationYear}`.toLowerCase();
    if (existingKeys.has(key)) return false;
    existingKeys.add(key);
    return true;
  });

  return dedupedIncoming.length > 0 ? [...current, ...dedupedIncoming] : current;
}

function mergeExtractedResumeData(current: ResumeData, extracted: Record<string, unknown>): ResumeData {
  const normalizedEducation = normalizeEducationRecords(extracted.education);
  const fallbackEducation = normalizedEducation.length === 0 ? normalizeEducationRecord(extracted) : null;
  const nextEducation = normalizedEducation.length > 0
    ? normalizedEducation
    : fallbackEducation
      ? [fallbackEducation]
      : [];

  return {
    ...current,
    fullName: (extracted.fullName as string) || current.fullName,
    email: (extracted.email as string) || current.email,
    phone: (extracted.phone as string) || current.phone,
    location: (extracted.location as string) || current.location,
    linkedIn: (extracted.linkedIn as string) || current.linkedIn,
    portfolio: (extracted.portfolio as string) || current.portfolio,
    summary: (extracted.summary as string) || current.summary,
    skills: Array.isArray(extracted.skills)
      ? Array.from(new Set((extracted.skills as string[]).map((skill) => skill.trim()).filter(Boolean)))
      : current.skills,
    experiences: Array.isArray(extracted.experiences)
      ? (extracted.experiences as Array<Record<string, unknown>>).map((entry) => ({
          id: uid(),
          title: (entry.title as string) || "",
          company: (entry.company as string) || "",
          location: (entry.location as string) || "",
          startDate: (entry.startDate as string) || "",
          endDate: (entry.endDate as string) || "",
          current: normalizeDateValue(entry.endDate as string) === "present",
          highlights: Array.isArray(entry.highlights)
            ? (entry.highlights as string[]).map((item) => item.trim()).filter(Boolean)
            : [""],
        }))
      : current.experiences,
    education: nextEducation.length > 0
      ? nextEducation.map((entry) => ({
          id: uid(),
          degree: entry.degree,
          institution: entry.institution,
          location: entry.location,
          graduationYear: entry.graduationYear,
          gpa: entry.gpa,
        }))
      : current.education,
  };
}

function hasMeaningfulExperience(entry: ExperienceEntry): boolean {
  return Boolean(
    entry.title.trim() ||
    entry.company.trim() ||
    entry.highlights.some((highlight) => highlight.trim())
  );
}

function ensureEditableSections(data: ResumeData): ResumeData {
  return {
    ...data,
    experiences: data.experiences.length > 0
      ? data.experiences
      : [{
          id: uid(),
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          highlights: [""],
        }],
    education: data.education.length > 0
      ? data.education
      : [{
          id: uid(),
          degree: "",
          institution: "",
          location: "",
          graduationYear: "",
          gpa: "",
        }],
  };
}

function normalizeDateValue(value: string | undefined): string {
  return (value || "").trim().toLowerCase();
}

function buildCVFromData(data: {
  fullName: string; email: string; phone: string; location: string;
  linkedIn: string; portfolio: string; summary: string; skills: string[];
  experiences: { title: string; company: string; location: string; startDate: string; endDate: string; current: boolean; highlights: string[] }[];
  education: { degree: string; institution: string; location: string; graduationYear: string; gpa: string }[];
}): GeneratedCV {
  const filteredExperience = data.experiences.filter(isMeaningfulExperience).map((e) => ({
    title: e.title,
    company: e.company,
    location: e.location,
    startDate: e.startDate,
    endDate: e.current ? "Present" : e.endDate,
    current: e.current,
    highlights: e.highlights.filter(h => h.trim()),
  }));
  const filteredEducation = data.education.filter(isMeaningfulEducation).map((e) => ({
    degree: e.degree,
    institution: e.institution,
    location: e.location,
    graduationYear: e.graduationYear,
    gpa: e.gpa,
  }));

  let summary = data.summary;
  if (!summary && data.skills.length > 0) {
    const topSkills = data.skills.slice(0, 3).join(", ");
    summary = `Results-driven professional specializing in ${topSkills}. Committed to delivering impactful solutions.`;
  }

  return {
    id: `cv_${Date.now()}`,
    personalInfo: {
      name: data.fullName, email: data.email, phone: data.phone,
      location: data.location, linkedIn: data.linkedIn || undefined,
      portfolio: data.portfolio || undefined,
    },
    summary: summary || "",
    skills: data.skills,
    experience: filteredExperience,
    education: filteredEducation,
    createdAt: new Date().toISOString(),
  };
}

// ─── PDF Builder ────────────────────────────────────────────────────────────

function buildResumeHTML(cv: GeneratedCV, theme: ResumeTheme): string {
  const themeStyles: Record<ResumeTheme, { accent: string; headingStyle: string; font: string }> = {
    classic: { accent: "#2563eb", headingStyle: "border-bottom:2px solid #2563eb;padding-bottom:3px;", font: "'Segoe UI',Tahoma,sans-serif" },
    modern: { accent: "#7c3aed", headingStyle: "background:#f5f3ff;padding:6px 12px;border-radius:4px;border-left:4px solid #7c3aed;", font: "'Inter','SF Pro',system-ui,sans-serif" },
    minimal: { accent: "#111827", headingStyle: "border-bottom:1px solid #d1d5db;padding-bottom:2px;", font: "'Georgia','Times New Roman',serif" },
  };
  const t = themeStyles[theme];

  const exp = cv.experience.map(e => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between"><strong>${e.title}</strong><span style="color:#666;font-size:0.85em">${e.startDate} – ${e.endDate}</span></div>
      <div style="color:${t.accent}">${e.company}${e.location ? ` · ${e.location}` : ""}</div>
      ${e.highlights.length > 0 ? `<ul style="margin:6px 0;padding-left:20px">${e.highlights.map(h => `<li>${h}</li>`).join("")}</ul>` : ""}
    </div>`).join("");

  const edu = cv.education.map(e =>
    `<p><strong>${e.degree}</strong> — ${e.institution}${e.graduationYear ? `, ${e.graduationYear}` : ""}${e.gpa ? ` (GPA: ${e.gpa})` : ""}</p>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${cv.personalInfo.name} - Resume</title>
<style>@page{margin:0.7in;size:A4}*{margin:0;padding:0;box-sizing:border-box}body{font-family:${t.font};color:#1a1a2e;font-size:10.5pt;line-height:1.5;padding:40px}h1{font-size:22pt;font-weight:700;margin-bottom:4px;color:${theme === "modern" ? t.accent : "#1a1a2e"}}.contact{color:#555;font-size:9.5pt;margin-bottom:16px}.heading{font-size:11pt;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;${t.headingStyle}margin:18px 0 10px}p{margin-bottom:6px}ul{margin:4px 0}li{margin-bottom:2px}</style></head><body>
<h1>${cv.personalInfo.name}</h1>
<div class="contact">${[cv.personalInfo.email, cv.personalInfo.phone, cv.personalInfo.location, cv.personalInfo.linkedIn].filter(Boolean).join(" · ")}</div>
${cv.summary ? `<div class="heading">Professional Summary</div><p>${cv.summary}</p>` : ""}
${cv.skills.length > 0 ? `<div class="heading">Technical Skills</div><p>${cv.skills.join(" · ")}</p>` : ""}
${cv.experience.length > 0 ? `<div class="heading">Work Experience</div>${exp}` : ""}
${cv.education.length > 0 ? `<div class="heading">Education</div>${edu}` : ""}
</body></html>`;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const wizardStyles = `
  .rw {
    --rw-panel: #0f1b2d;
    --rw-panel-2: #13243a;
    --rw-border: rgba(148,163,184,0.14);
    --rw-border-strong: rgba(96,165,250,0.3);
    --rw-text: #e8eefc;
    --rw-muted: #9eb0cb;
    --rw-soft: #7084a3;
    --rw-accent: #2563eb;
    --rw-accent-2: #60a5fa;
    --rw-success: #60a5fa;
    --rw-paper: #f4f1ea;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* Upload Error Banner */
  .rw-upload-error {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 16px; border-radius: 8px;
    background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3);
    margin-bottom: 16px; animation: rw-in 0.2s ease;
  }
  .rw-upload-error span { flex-shrink: 0; font-size: 1rem; }
  .rw-upload-error p { margin: 0; font-size: 0.8125rem; color: #eab308; line-height: 1.5; flex: 1; }
  .rw-upload-error button { background: none; border: none; color: #eab308; cursor: pointer; padding: 2px; flex-shrink: 0; }
  .rw-upload-progress { font-size: 0.6875rem; color: var(--rw-accent); animation: rw-pulse 1.5s ease infinite; }
  @keyframes rw-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

  .rw-utility-bar {
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    margin-bottom:16px;
  }
  .rw-utility-copy { font-size:0.72rem; text-transform:uppercase; letter-spacing:0.14em; color:var(--rw-muted); }
  .rw-reset-btn {
    display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px;
    border:1px solid var(--rw-border); background:transparent; color:var(--rw-muted);
    font-size:0.74rem; font-weight:700; cursor:pointer; transition:all 0.15s;
  }
  .rw-reset-btn:hover { border-color:#8f5f5f; color:#f0c3c3; background:rgba(143,95,95,0.08); }
  .rw-reset-btn:disabled { opacity:0.6; cursor:not-allowed; }

  /* Stepper */
  .rw-stepper { display: flex; gap: 8px; margin-bottom: 22px; flex-shrink: 0; }
  .rw-step {
    flex: 1; display: flex; align-items: center; gap: 8px;
    padding: 12px 14px; border-radius: 14px;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent 16%), var(--rw-panel);
    border: 1px solid var(--rw-border);
    color: var(--rw-soft); font-size: 0.8125rem; font-weight: 600;
    cursor: default; transition: all 0.2s;
  }
  .rw-step-active { border-color: rgba(37,99,235,0.38); color: var(--rw-text); background: linear-gradient(180deg, rgba(255,255,255,0.024), transparent 16%), var(--rw-panel-2); box-shadow: 0 12px 24px rgba(6,12,16,0.2); }
  .rw-step-done { color: #bfdbfe; cursor: pointer; }
  .rw-step-done:hover { background: var(--rw-panel-2); }
  .rw-step-num {
    width: 24px; height: 24px; border-radius: 999px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.6875rem; font-weight: 700;
    background: rgba(255,255,255,0.03); color: var(--rw-muted); border: 1px solid var(--rw-border);
  }
  .rw-step-active .rw-step-num { background: rgba(37,99,235,0.18); color: #dbeafe; border-color: rgba(37,99,235,0.36); }
  .rw-step-done .rw-step-num { background: rgba(37,99,235,0.14); color: #bfdbfe; border-color: rgba(37,99,235,0.3); }
  .rw-step-label { white-space: nowrap; }

  /* Start */
  .rw-start {
    text-align: center;
    padding: 56px 28px;
    border-radius: 28px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.024), transparent 22%),
      linear-gradient(135deg, rgba(16,26,32,0.98), rgba(20,32,40,0.92));
    border: 1px solid var(--rw-border);
  }
  .rw-start-icon {
    width:68px; height:68px; margin:0 auto 18px; border-radius:20px;
    display:flex; align-items:center; justify-content:center;
    background:rgba(37,99,235,0.14); color:#dbeafe; border:1px solid rgba(37,99,235,0.26);
  }
  .rw-start h2 { font-size: 2rem; font-weight: 700; letter-spacing: -0.04em; color: #f1f5f9; margin: 0 0 10px; }
  .rw-start p { color: var(--rw-muted); margin: 0 0 32px; font-size: 0.98rem; line-height: 1.65; max-width: 620px; margin-left: auto; margin-right: auto; }
  .rw-start-options { display: flex; gap: 16px; max-width: 720px; margin: 0 auto; }
  .rw-option {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 30px 22px; border-radius: 20px;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent 16%), var(--rw-panel);
    border: 1px solid var(--rw-border);
    color: var(--rw-muted); cursor: pointer; transition: all 0.2s;
    text-align: center;
  }
  .rw-option:hover { border-color: rgba(37,99,235,0.34); background: linear-gradient(180deg, rgba(255,255,255,0.024), transparent 16%), var(--rw-panel-2); color: #e2e8f0; transform: translateY(-2px); box-shadow: 0 18px 30px rgba(6,12,16,0.24); }
  .rw-option:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .rw-option-active { border-color: rgba(37,99,235,0.34); background: linear-gradient(180deg, rgba(255,255,255,0.024), transparent 16%), var(--rw-panel-2); }
  .rw-option strong { color: #f1f5f9; font-size: 1rem; }
  .rw-option span { font-size: 0.78rem; line-height: 1.5; }
  .rw-option-file { font-size: 0.6875rem; color: var(--rw-accent-2); margin-top: 4px; }
  .rw-story-card {
    margin:18px auto 0; max-width:720px; text-align:left; padding:20px; border-radius:20px;
    background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent 16%), var(--rw-panel);
    border:1px solid var(--rw-border); box-shadow:0 18px 30px rgba(6,12,16,0.22);
  }
  .rw-story-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:14px; }
  .rw-story-header strong { display:block; font-size:0.98rem; color:#f1f5f9; margin-bottom:6px; }
  .rw-story-header p { margin:0; color:var(--rw-muted); font-size:0.82rem; line-height:1.55; }
  .rw-story-input { min-height:180px; }

  /* Split Pane */
  .rw-split { display: flex; gap: 22px; flex: 1; min-height: 0; overflow: hidden; }
  .rw-form-pane { flex: 1; overflow-y: auto; min-width: 0; display: flex; flex-direction: column; }
  .rw-form-full { max-width: 720px; }
  .rw-preview-pane {
    width: 340px; flex-shrink: 0; display: flex; flex-direction: column;
    border: 1px solid var(--rw-border); border-radius: 20px; overflow: hidden;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent 16%), var(--rw-panel);
    box-shadow: 0 18px 34px rgba(6,12,16,0.24);
  }
  .rw-preview-pane-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px; border-bottom: 1px solid var(--rw-border);
    font-size: 0.75rem; font-weight: 700; color: var(--rw-muted);
  }
  .rw-theme-picker-sm { display: flex; gap: 2px; }
  .rw-theme-btn-sm {
    padding: 2px 8px; border-radius: 4px; font-size: 0.625rem;
    background: transparent; border: 1px solid transparent;
    color: #475569; cursor: pointer; text-transform: capitalize;
  }
  .rw-theme-btn-sm:hover { color: #94a3b8; }
  .rw-theme-active-sm { border-color: var(--rw-accent); color: var(--rw-accent); }
  .rw-live-preview {
    flex: 1; overflow-y: auto; padding: 22px;
    background: var(--rw-paper); color: #1a1a2e;
    font-size: 0.6875rem; line-height: 1.5;
  }
  .rw-live-preview .rw-cv-name { font-size: 1rem; margin-bottom: 2px; }
  .rw-live-preview .rw-cv-contact { font-size: 0.625rem; margin-bottom: 12px; }
  .rw-live-preview .rw-cv-heading { font-size: 0.625rem; margin: 12px 0 6px; }
  .rw-live-preview .rw-cv-text { font-size: 0.6875rem; }
  .rw-live-preview .rw-cv-exp { margin-bottom: 8px; }
  .rw-live-preview .rw-cv-exp-row strong { font-size: 0.6875rem; }
  .rw-live-preview .rw-cv-exp-row span { font-size: 0.5625rem; }
  .rw-live-preview .rw-cv-exp-company { font-size: 0.625rem; }
  .rw-live-preview .rw-cv-list { font-size: 0.625rem; padding-left: 14px; }
  .rw-live-preview .rw-cv-edu { font-size: 0.6875rem; margin-bottom: 4px; }
  .rw-preview-empty {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 20px; text-align: center;
  }
  .rw-preview-empty p { color: #475569; font-size: 0.75rem; line-height: 1.5; }

  /* Toggle Preview Button */
  .rw-btn-toggle-preview {
    padding: 8px 14px; border-radius: 999px;
    background: transparent; border: 1px solid var(--rw-border);
    color: var(--rw-muted); font-size: 0.75rem; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
  }
  .rw-btn-toggle-preview:hover { color: #e2e8f0; border-color: var(--rw-border-strong); }

  /* Save status indicator */
  .rw-save-indicator {
    font-size: 0.7rem; font-weight: 500; padding: 4px 10px;
    border-radius: 6px; transition: all 0.2s;
  }
  .rw-save-saving { color: #94a3b8; }
  .rw-save-saved { color: #93c5fd; }
  .rw-save-error { color: #f87171; }

  /* Sections */
  .rw-section { animation: rw-in 0.2s ease; }
  @keyframes rw-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .rw-section-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
  .rw-section-title { font-size: 1.16rem; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; letter-spacing: -0.02em; }
  .rw-section-sub { font-size: 0.84rem; color: var(--rw-muted); margin: 0 0 20px; line-height: 1.55; }

  /* Forms */
  .rw-form-grid { display: flex; flex-wrap: wrap; gap: 14px; }
  .rw-field { display: flex; flex-direction: column; gap: 5px; width: 100%; }
  .rw-field-half { width: calc(50% - 7px); }
  .rw-field-third { width: calc(33.33% - 10px); }
  .rw-field label { font-size: 0.72rem; color: var(--rw-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
  .rw-field input, .rw-textarea {
    padding: 11px 14px; border-radius: 14px;
    background: #0c1318; border: 1px solid var(--rw-border);
    color: var(--rw-text); font-size: 0.89rem; font-family: inherit;
    transition: border-color 0.15s;
  }
  .rw-field input:focus, .rw-textarea:focus { outline: none; border-color: var(--rw-accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
  .rw-field input::placeholder, .rw-textarea::placeholder { color: #475569; }
  .rw-field input:disabled { opacity: 0.5; }
  .rw-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
  .rw-field-hint { font-size: 0.6875rem; color: #475569; }

  /* Cards */
  .rw-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.018), transparent 16%), var(--rw-panel);
    border: 1px solid var(--rw-border); border-radius: 20px;
    padding: 20px; margin-bottom: 14px;
    box-shadow: 0 12px 26px rgba(6,12,16,0.18);
  }
  .rw-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .rw-card-header strong { font-size: 0.875rem; color: #e2e8f0; }
  .rw-card-remove {
    width: 28px; height: 28px; border-radius: 6px; border: none;
    background: transparent; color: #64748b; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .rw-card-remove:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

  /* Highlights */
  .rw-highlights { margin-top: 14px; }
  .rw-highlights-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .rw-highlight-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .rw-bullet { color: #3b82f6; font-weight: 700; flex-shrink: 0; }
  .rw-highlight-row input { flex: 1; }
  .rw-highlight-remove {
    width: 24px; height: 24px; border-radius: 4px; border: none; flex-shrink: 0;
    background: transparent; color: #475569; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .rw-highlight-remove:hover { color: #ef4444; }

  /* Skills Tag Input */
  .rw-skills-input {
    display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px;
    background: #0c1318; border: 1px solid var(--rw-border); border-radius: 14px;
    min-height: 44px; align-items: center;
    transition: border-color 0.15s;
  }
  .rw-skills-input:focus-within { border-color: var(--rw-accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
  .rw-skill-tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 999px;
    background: rgba(37,99,235,0.12); border: 1px solid rgba(37,99,235,0.22);
    color: #bfdbfe; font-size: 0.75rem; font-weight: 700;
  }
  .rw-skill-tag button {
    background: none; border: none; color: #60a5fa; cursor: pointer; padding: 0;
    display: flex; align-items: center; opacity: 0.6;
  }
  .rw-skill-tag button:hover { opacity: 1; }
  .rw-skills-text { flex: 1; min-width: 120px; background: transparent; border: none; color: #e2e8f0; font-size: 0.875rem; outline: none; }
  .rw-skills-text::placeholder { color: #475569; }

  /* Buttons */
  .rw-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 999px;
    font-size: 0.8125rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
    border: none;
  }
  .rw-btn-primary { background: var(--rw-accent); color: white; box-shadow: 0 12px 24px rgba(14,42,99,0.24); }
  .rw-btn-primary:hover { background:#1d4ed8; transform: translateY(-1px); }
  .rw-btn-primary:disabled { background: #17325c; color: #7f92af; cursor: not-allowed; box-shadow: none; }
  .rw-btn-ghost { background: transparent; color: var(--rw-muted); border: 1px solid var(--rw-border); }
  .rw-btn-ghost:hover { background: var(--rw-panel-2); color: #e2e8f0; }
  .rw-btn-add {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 8px 14px; border-radius: 999px;
    background: #10203a; border: 1px solid rgba(37,99,235,0.3);
    color: #bfdbfe; font-size: 0.8125rem; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
  }
  .rw-btn-add:hover { background: #17325c; border-color: var(--rw-accent); }
  .rw-btn-text {
    background: none; border: none; color: #64748b; font-size: 0.75rem;
    cursor: pointer; padding: 4px 0; display: inline-flex; align-items: center; gap: 4px;
  }
  .rw-btn-text:hover { color: #94a3b8; }
  .rw-btn-ai {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 6px 12px; border-radius: 999px;
    background: rgba(37,99,235,0.12);
    border: 1px solid rgba(37,99,235,0.28);
    color: #bfdbfe; font-size: 0.75rem; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
  }
  .rw-btn-ai:hover { background: rgba(37,99,235,0.18); border-color: var(--rw-accent); }
  .rw-btn-ai:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Empty State */
  .rw-empty {
    text-align: center; padding: 42px 20px;
    background: var(--rw-panel); border: 1px dashed var(--rw-border); border-radius: 18px;
  }
  .rw-empty p { color: var(--rw-muted); margin: 12px 0 16px; font-size: 0.875rem; }

  /* Navigation */
  .rw-nav {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 28px; padding-top: 20px; border-top: 1px solid #1e293b;
    flex-shrink: 0;
  }

  /* Preview Toolbar */
  .rw-preview-toolbar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 12px; flex-wrap: wrap; gap: 10px;
  }
  .rw-preview-toolbar-left { display: flex; align-items: baseline; gap: 12px; }
  .rw-preview-toolbar-right { display: flex; align-items: center; gap: 8px; }
  .rw-preview-title { font-size: 1.125rem; font-weight: 700; color: #f1f5f9; }

  /* Theme Picker */
  .rw-theme-picker { display: flex; gap: 4px; }
  .rw-theme-btn {
    padding: 4px 12px; border-radius: 6px;
    background: #111827; border: 1px solid #1e293b;
    color: #64748b; font-size: 0.6875rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s; text-transform: capitalize;
  }
  .rw-theme-btn:hover { border-color: var(--rw-accent); color: #dbeafe; }
  .rw-theme-active { border-color: var(--rw-accent) !important; color: var(--rw-accent-2) !important; background: #131a2b !important; }

  /* ATS Bar */
  .rw-ats-bar { margin-bottom: 16px; }
  .rw-ats-btn {
    width: 100%; padding: 10px; border-radius: 8px;
    background: #111318; border: 1px dashed #2d3748;
    color: #94a3b8; font-size: 0.8125rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .rw-ats-btn:hover { border-color: #3b82f6; color: #e2e8f0; }
  .rw-ats-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .rw-ats-result { padding: 14px 16px; background: #111318; border: 1px solid #1e293b; border-radius: 8px; }
  .rw-ats-badge {
    display: inline-block; padding: 4px 14px; border-radius: 20px;
    font-size: 0.8125rem; font-weight: 700; margin-bottom: 8px;
  }
  .rw-ats-good { background: rgba(37,99,235,0.14); color: #2563eb; }
  .rw-ats-ok { background: rgba(234,179,8,0.15); color: #eab308; }
  .rw-ats-low { background: rgba(239,68,68,0.15); color: #ef4444; }
  .rw-ats-feedback { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
  .rw-ats-tip { font-size: 0.75rem; color: #94a3b8; padding: 4px 0; }

  /* Preview */
  .rw-preview-actions { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
  .rw-save-error { margin: -8px 0 16px; color: #fca5a5; font-size: 0.75rem; line-height: 1.5; }

  .rw-preview {
    background: var(--rw-paper); color: #1a1a2e; padding: 36px;
    border-radius: 20px; font-size: 0.8125rem; line-height: 1.6;
    box-shadow: 0 18px 36px rgba(6,12,16,0.18);
  }

  .rw-theme-modern .rw-cv-heading {
    background: #f5f3ff; padding: 6px 12px; border-radius: 4px;
    border-left: 4px solid #7c3aed; border-bottom: none;
  }
  .rw-theme-modern .rw-cv-name { color: #7c3aed; }
  .rw-theme-modern .rw-cv-exp-company { color: #7c3aed; }

  .rw-theme-minimal .rw-cv-heading {
    border-bottom: 1px solid #d1d5db; padding-bottom: 2px;
    text-transform: none; letter-spacing: normal; font-size: 0.875rem;
  }
  .rw-theme-minimal .rw-preview, .rw-theme-minimal .rw-live-preview { font-family: Georgia, 'Times New Roman', serif; }

  .rw-cv-name { font-size: 1.375rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
  .rw-cv-contact { font-size: 0.75rem; color: #64748b; margin-bottom: 18px; }
  .rw-cv-heading {
    font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 3px; margin: 18px 0 10px;
  }
  .rw-cv-text { margin: 0 0 4px; color: #334155; }
  .rw-cv-exp { margin-bottom: 14px; }
  .rw-cv-exp-row { display: flex; justify-content: space-between; align-items: baseline; }
  .rw-cv-exp-row strong { color: #0f172a; }
  .rw-cv-exp-row span { font-size: 0.75rem; color: #64748b; }
  .rw-cv-exp-company { font-size: 0.8125rem; color: #3b82f6; margin-bottom: 4px; }
  .rw-cv-list { padding-left: 18px; margin: 4px 0; }
  .rw-cv-list li { color: #475569; margin-bottom: 2px; }
  .rw-cv-edu { margin-bottom: 6px; color: #334155; }
  .rw-cv-edu strong { color: #0f172a; }
  .rw-cv-gpa { color: #64748b; font-size: 0.75rem; }

  /* Spinner */
  .rw-spinner {
    width: 12px; height: 12px; border: 2px solid rgba(167,139,250,0.3);
    border-top-color: #a78bfa; border-radius: 50%;
    animation: rw-spin 0.6s linear infinite; display: inline-block;
  }
  @keyframes rw-spin { to { transform: rotate(360deg); } }

  /* Mobile */
  @media (max-width: 768px) {
    .rw-split { flex-direction: column; }
    .rw-preview-pane { width: 100%; max-height: 340px; }
    .rw-stepper { overflow-x: auto; padding-bottom: 4px; }
    .rw-step { min-width: 132px; }
    .rw-start-options { flex-direction: column; }
    .rw-story-header { flex-direction: column; }
    .rw-utility-bar { flex-direction: column; align-items: stretch; }
    .rw-reset-btn { justify-content: center; }
    .rw-field-half, .rw-field-third { width: 100%; }
    .rw-cv-exp-row { flex-direction: column; }
    .rw-preview-toolbar { flex-direction: column; }
    .rw-theme-picker { flex-wrap: wrap; }
    .rw-nav { flex-direction: column; align-items: stretch; gap: 12px; }
    .rw-nav > div:last-child { justify-content: space-between; width: 100%; }
    .rw-preview-actions { flex-direction: column; }
    .rw-preview-actions > * { width: 100%; justify-content: center; }
  }

  @media (max-width: 480px) {
    .rw-start { padding: 32px 16px; }
    .rw-start h2 { font-size: 1.5rem; }
    .rw-step { min-width: 108px; padding: 10px 12px; }
    .rw-preview { padding: 22px; }
    .rw-story-card { padding: 16px; }
  }
`;
