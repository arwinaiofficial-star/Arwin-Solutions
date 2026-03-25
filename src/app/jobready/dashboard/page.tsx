"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, GeneratedCV } from "@/context/AuthContext";
import ResumeWizard, { ResumeWizardHandle } from "@/components/jobready/ResumeWizard";
import AICopilot from "@/components/jobready/AICopilot";
import CommandPalette from "@/components/jobready/CommandPalette";
import {
  AlertIcon,
  BotIcon,
  BriefcaseIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ClipboardIcon,
  DocumentIcon,
  DownloadIcon,
  EditIcon,
  ExternalLinkIcon,
  HomeIcon,
  InfoIcon,
  LocationIcon,
  LogoutIcon,
  ResetIcon,
  RocketIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  TrashIcon,
  XIcon,
} from "@/components/icons/Icons";
import { authApi, resumeApi, jobPrepareApi, applicationsApi, JobApplicationData } from "@/lib/api/client";
import { buildSafeCoverLetterSnippet, computeResumeJobMatch } from "@/lib/jobMatch";
import { computeJobReadyWorkflow, type WorkflowStage } from "@/lib/jobreadyWorkflow";

type ViewType = "home" | "resume" | "jobs" | "tailor" | "tracker" | "settings";

interface JobResult {
  id: string; title: string; company: string; location: string;
  description: string; url: string; source: string; salary?: string;
  jobType?: string; postedAt?: string; tags?: string[]; relevanceScore: number;
}

interface TrackedJob {
  id: string; title: string; company: string; url: string;
  location?: string; salary?: string; source?: string;
  status: "saved" | "applied" | "interview" | "offer";
  addedAt: string; notes?: string; description?: string;
}

interface Toast {
  id: string; message: string; type: "success" | "error" | "info";
}

interface PrepareData {
  aiTips: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  coverLetterSnippet: string;
}

interface WorkflowDraftState {
  atsBaselineComplete: boolean;
  targetJob: JobResult | null;
  coverLetterText: string;
  coverLetterJobId: string | null;
  tailoredResumeJobId: string | null;
}

function buildFallbackPrepareData(job: JobResult, cvData: GeneratedCV | null | undefined): PrepareData {
  const insights = computeResumeJobMatch(cvData, job);

  return {
    aiTips: [
      insights.matchedSkills.length > 0
        ? `Lead with your strongest overlap: ${insights.matchedSkills.slice(0, 3).join(", ")}.`
        : `Lead with adjacent experience that supports a move into the ${job.title} role.`,
      `Rewrite your summary so the first line clearly targets ${job.title}.`,
      insights.missingKeywords.length > 0
        ? `Address missing keywords like ${insights.missingKeywords.slice(0, 3).join(", ")} only where you can support them truthfully.`
        : "Quantify outcomes in your most relevant bullets to strengthen the application.",
    ].filter(Boolean).join("\n"),
    matchedSkills: insights.matchedSkills,
    missingSkills: insights.missingKeywords,
    matchScore: insights.matchScore,
    coverLetterSnippet: buildSafeCoverLetterSnippet(cvData, job.title, job.company),
  };
}

function mergePrepareData(job: JobResult, cvData: GeneratedCV | null | undefined, prepareData: PrepareData): PrepareData {
  if (!cvData) return prepareData;

  const fallback = buildFallbackPrepareData(job, cvData);
  const coverLetterSnippet = isPlaceholderCoverLetter(prepareData.coverLetterSnippet)
    ? fallback.coverLetterSnippet
    : prepareData.coverLetterSnippet;

  return {
    ...prepareData,
    matchedSkills: prepareData.matchedSkills.length > 0
      ? prepareData.matchedSkills
      : fallback.matchedSkills,
    missingSkills: prepareData.missingSkills.length > 0
      ? prepareData.missingSkills
      : fallback.missingSkills,
    matchScore: Math.max(prepareData.matchScore, fallback.matchScore),
    coverLetterSnippet,
  };
}

function isPlaceholderCoverLetter(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return !normalized ||
    normalized.includes("[your name]") ||
    normalized.includes("the candidate") ||
    normalized.includes("dear hiring manager");
}

function buildResumeFacts(cvData?: GeneratedCV | null): string {
  if (!cvData) return "No resume facts available.";

  const latestExperience = cvData.experience
    ?.slice(0, 3)
    .map((entry) => {
      const highlights = (entry.highlights || []).filter(Boolean).slice(0, 3).join(" | ");
      return `${entry.title} at ${entry.company}${highlights ? `: ${highlights}` : ""}`;
    })
    .join("\n");

  return [
    `Name: ${cvData.personalInfo?.name || "Not provided"}`,
    `Location: ${cvData.personalInfo?.location || "Not provided"}`,
    `Summary: ${cvData.summary || "Not provided"}`,
    `Skills: ${(cvData.skills || []).join(", ") || "Not provided"}`,
    `Experience:\n${latestExperience || "Not provided"}`,
  ].join("\n");
}

// ─── DB ↔ Frontend mappers ───────────────────────────────────────────────────

function dbAppToTrackedJob(app: JobApplicationData): TrackedJob {
  return {
    id: app.id,
    title: app.job_title,
    company: app.company,
    url: app.job_url || "",
    location: app.location || undefined,
    salary: app.salary || undefined,
    source: app.source || undefined,
    status: (app.status as TrackedJob["status"]) || "saved",
    addedAt: app.applied_at,
    notes: app.notes || undefined,
    description: app.description || undefined,
  };
}

// ─── Toast System ────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === "success" ? <CheckIcon size={14} /> : t.type === "error" ? <AlertIcon size={14} /> : <InfoIcon size={14} />}
          </span>
          <p>{t.message}</p>
          <button onClick={() => onDismiss(t.id)}><XIcon size={12} /></button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout, clearGeneratedCV, updateProfile } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>("home");
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Shared state for cross-component communication
  const [jobCount, setJobCount] = useState(0);
  const [matchedJobs, setMatchedJobs] = useState<JobResult[]>([]);
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);
  const [coverLetterJob, setCoverLetterJob] = useState<JobResult | null>(null);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [coverLetterJobId, setCoverLetterJobId] = useState<string | null>(null);
  const [tailoredResumeJobId, setTailoredResumeJobId] = useState<string | null>(null);
  const [atsBaselineComplete, setAtsBaselineComplete] = useState(false);
  const [resumeStep, setResumeStep] = useState(0);
  const [resumeData, setResumeData] = useState<Record<string, unknown>>({});
  const wizardHandleRef = useRef<ResumeWizardHandle | null>(null);

  const clearWorkflowDraft = useCallback(() => {
    setAtsBaselineComplete(false);
    setCoverLetterJob(null);
    setCoverLetterText("");
    setCoverLetterJobId(null);
    setTailoredResumeJobId(null);
    setMatchedJobs([]);
    setJobCount(0);
    setResumeStep(0);
    setResumeData({});

    if (user?.id && typeof window !== "undefined") {
      window.localStorage.removeItem(`jobready_workflow_${user.id}`);
    }
  }, [user]);

  const restoreWorkflowDraft = useCallback((draft: Partial<WorkflowDraftState>) => {
    setAtsBaselineComplete(Boolean(draft.atsBaselineComplete));
    setCoverLetterJob(draft.targetJob || null);
    setCoverLetterText(draft.coverLetterText || "");
    setCoverLetterJobId(draft.coverLetterJobId || null);
    setTailoredResumeJobId(draft.tailoredResumeJobId || null);
  }, []);

  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;

    const raw = window.localStorage.getItem(`jobready_workflow_${user.id}`);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<WorkflowDraftState>;
      const frame = window.requestAnimationFrame(() => restoreWorkflowDraft(parsed));
      return () => window.cancelAnimationFrame(frame);
    } catch {
      window.localStorage.removeItem(`jobready_workflow_${user.id}`);
    }
  }, [restoreWorkflowDraft, user?.id]);

  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;

    const draftState: WorkflowDraftState = {
      atsBaselineComplete,
      targetJob: coverLetterJob,
      coverLetterText,
      coverLetterJobId,
      tailoredResumeJobId,
    };
    window.localStorage.setItem(`jobready_workflow_${user.id}`, JSON.stringify(draftState));
  }, [atsBaselineComplete, coverLetterJob, coverLetterJobId, coverLetterText, tailoredResumeJobId, user?.id]);

  // Update tracked jobs in DB
  const updateTrackedJobs = useCallback((jobs: TrackedJob[]) => {
    setTrackedJobs(jobs);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/jobready/login");
  }, [isLoading, isAuthenticated, router]);

  // ⌘K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(p => !p); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const resetResumeWorkspace = useCallback(async () => {
    if (typeof window !== "undefined" && !window.confirm("Reset your saved resume data and start again from scratch?")) {
      return false;
    }

    const result = await resumeApi.reset();
    if (result.error) {
      addToast(result.error, "error");
      return false;
    }

    clearGeneratedCV();
    updateProfile({ phone: "", location: "" });
    clearWorkflowDraft();
    setActiveView("resume");
    addToast("Resume data reset. You can start fresh now.", "success");
    return true;
  }, [addToast, clearGeneratedCV, clearWorkflowDraft, updateProfile]);

  useEffect(() => {
    if (!isAuthenticated) return;
    applicationsApi.list().then(result => {
      if (result.data) {
        setTrackedJobs(result.data.map(dbAppToTrackedJob));
      } else if (result.error) {
        addToast(result.error, "error");
      }
    });
  }, [isAuthenticated, addToast]);

  const saveToTracker = useCallback(async (job: JobResult) => {
    if (trackedJobs.find(t => t.title === job.title && t.company === job.company)) {
      addToast("Already in tracker", "info");
      return;
    }
    const result = await applicationsApi.create({
      job_title: job.title,
      company: job.company,
      location: job.location,
      job_url: job.url,
      salary: job.salary,
      source: job.source,
      status: "saved",
      description: job.description,
    });
    if (result.data) {
      setTrackedJobs(prev => [dbAppToTrackedJob(result.data!), ...prev]);
      addToast(`Saved "${job.title}" to tracker`, "success");
    } else {
      addToast(result.error || "Failed to save", "error");
    }
  }, [addToast, trackedJobs]);

  const selectTargetJob = useCallback((job: JobResult, options?: { coverLetter?: string; openTailor?: boolean }) => {
    const isNewTarget = coverLetterJob?.id !== job.id;
    setCoverLetterJob(job);

    if (typeof options?.coverLetter === "string") {
      setCoverLetterText(options.coverLetter);
      setCoverLetterJobId(job.id);
    } else if (isNewTarget) {
      setCoverLetterText("");
      setCoverLetterJobId(null);
    }

    if (options?.openTailor) {
      setActiveView("tailor");
    }
  }, [coverLetterJob?.id]);

  const openCoverLetter = useCallback((job: JobResult, text: string) => {
    selectTargetJob(job, { coverLetter: text, openTailor: true });
  }, [selectTargetJob]);

  const currentTrackedJob = coverLetterJob
    ? trackedJobs.find((tracked) => tracked.title === coverLetterJob.title && tracked.company === coverLetterJob.company) || null
    : null;

  const logApplication = useCallback(async (job: JobResult) => {
    const existing = trackedJobs.find((tracked) => tracked.title === job.title && tracked.company === job.company);

    if (existing) {
      if (existing.status !== "saved") {
        addToast(`Already logged in ${existing.status}`, "info");
        return;
      }

      const result = await applicationsApi.update(existing.id, { status: "applied" });
      if (result.data) {
        setTrackedJobs((prev) => prev.map((tracked) => tracked.id === existing.id ? { ...tracked, status: "applied" } : tracked));
        addToast(`Logged "${job.title}" as applied`, "success");
      } else {
        addToast(result.error || "Failed to log application", "error");
      }
      return;
    }

    const created = await applicationsApi.create({
      job_title: job.title,
      company: job.company,
      location: job.location,
      job_url: job.url,
      salary: job.salary,
      source: job.source,
      status: "applied",
      description: job.description,
    });

    if (created.data) {
      setTrackedJobs((prev) => [dbAppToTrackedJob(created.data!), ...prev]);
      addToast(`Logged "${job.title}" as applied`, "success");
    } else {
      addToast(created.error || "Failed to log application", "error");
    }
  }, [addToast, trackedJobs]);

  // ── Copilot action handlers ──────────────────────────────────────────
  const handleCopilotNavigate = useCallback((view: string) => {
    if (view === "coverletter") {
      setActiveView("tailor");
      return;
    }
    if (["home", "resume", "jobs", "tracker", "settings", "tailor"].includes(view)) {
      setActiveView(view as ViewType);
    }
  }, []);

  const handleCopilotUpdateField = useCallback((field: string, value: unknown) => {
    const handle = wizardHandleRef.current;
    if (activeView !== "resume") {
      setActiveView("resume");
      setTimeout(() => {
        wizardHandleRef.current?.setField(field, value);
      }, 120);
    } else if (handle) {
      handle.setField(field, value);
    }
    addToast(`Updated ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`, "success");
  }, [activeView, addToast]);

  const handleCopilotAction = useCallback((action: string, payload?: Record<string, unknown>) => {
    const handle = wizardHandleRef.current;
    switch (action) {
      case "setResumeStep":
        if (payload?.step !== undefined) {
          setActiveView("resume");
          handle?.setStep(payload.step as number);
        }
        break;
      case "triggerUpload":
        setActiveView("resume");
        setTimeout(() => handle?.triggerUpload(), 100);
        break;
      case "openStoryComposer":
        setActiveView("resume");
        setTimeout(() => handle?.openStoryComposer(), 100);
        break;
      case "triggerSearch":
        setActiveView("jobs");
        break;
      case "enhanceExperience":
        setActiveView("resume");
        handle?.enhanceExperience();
        break;
      case "generateSummary":
        setActiveView("resume");
        handle?.generateSummary();
        break;
      case "runATS":
        setActiveView("resume");
        handle?.runATS();
        break;
      case "downloadPDF":
        handle?.downloadPDF();
        break;
      case "resetResume":
        setActiveView("resume");
        setTimeout(() => { void handle?.resetResume(); }, 100);
        break;
      default:
        console.log("Unknown copilot action:", action, payload);
    }
  }, []);

  const navigateWorkflowStage = useCallback((stage: WorkflowStage) => {
    if (!stage.unlocked) {
      addToast(stage.blocker || `Finish the previous stage before opening ${stage.shortLabel}.`, "info");
      return;
    }
    setActiveView(stage.view);
    if (stage.view === "resume" && stage.resumeStep !== undefined) {
      setTimeout(() => wizardHandleRef.current?.setStep(stage.resumeStep!), 100);
    }
  }, [addToast]);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#06080d", color: "#64748b" }}>
        <div style={{ textAlign: "center" }}>
          <div className="co-spinner" /><p style={{ marginTop: 12 }}>Loading workspace...</p>
          <style>{`.co-spinner{width:32px;height:32px;border:3px solid #1e293b;border-top-color:#3b82f6;border-radius:50%;animation:cospin .7s linear infinite;margin:0 auto}@keyframes cospin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const completionPct = user.cvGenerated ? 100 : user.cvData ? 60 : 0;
  const appCount = trackedJobs.filter(j => j.status !== "saved").length;
  const workflow = computeJobReadyWorkflow({
    savedResume: user.cvData,
    resumeDraft: resumeData,
    atsBaselineComplete,
    matchedJobsCount: matchedJobs.length,
    selectedJob: coverLetterJob,
    trackedTarget: currentTrackedJob,
    trackedJobsCount: trackedJobs.length,
    coverLetterText,
    coverLetterJobId,
    tailoredResumeJobId,
  });
  const workflowStages: WorkflowStage[] = workflow.stages;
  const nextRecommendedStage = workflow.nextRecommendedStage;
  const hasSelectedJob = Boolean(coverLetterJob);
  const hasAppliedTarget = workflow.hasAppliedTarget;
  const tailorComplete = workflow.tailorComplete;
  const currentStage = activeView === "home"
    ? null
    : activeView === "resume"
      ? workflowStages.find((stage) => stage.id === (resumeStep <= 1 ? "import" : "improve")) || workflowStages[0]
      : activeView === "tailor"
        ? workflowStages.find((stage) => stage.id === (tailorComplete && !hasAppliedTarget ? "apply" : "tailor")) || workflowStages[0]
        : workflowStages.find((stage) => stage.view === activeView) || workflowStages[0];
  const focusSummary = activeView === "home"
    ? "Guide users through one hiring pipeline instead of exposing disconnected tools."
    : currentStage?.description || workflowStages[0].description;

  const cmdActions = [
    { id: "home", label: "Open Command Center", icon: <HomeIcon size={16} />, action: () => setActiveView("home") },
    { id: "resume", label: "Build Resume", icon: <DocumentIcon size={16} />, action: () => navigateWorkflowStage(workflowStages[0]) },
    { id: "jobs", label: "Find Matching Jobs", icon: <BriefcaseIcon size={16} />, action: () => navigateWorkflowStage(workflowStages[2]) },
    { id: "tailor", label: "Open Tailor Studio", icon: <SparklesIcon size={16} />, action: () => navigateWorkflowStage(workflowStages[3]) },
    { id: "tracker", label: "Track Applications", icon: <ClipboardIcon size={16} />, action: () => navigateWorkflowStage(workflowStages[5]) },
    { id: "settings", label: "Settings & Profile", icon: <SettingsIcon size={16} />, action: () => setActiveView("settings") },
    { id: "copilot", label: copilotOpen ? "Hide AI Guide" : "Show AI Guide", icon: <BotIcon size={16} />, action: () => setCopilotOpen(p => !p) },
    { id: "download", label: "Download Resume as PDF", icon: <DownloadIcon size={16} />, action: () => { setActiveView("resume"); addToast("Navigate to Resume Preview to download PDF", "info"); } },
    { id: "logout", label: "Sign Out", icon: <LogoutIcon size={16} />, action: () => { logout(); router.push("/jobready"); } },
  ];

  return (
    <>
      <style>{workspaceCSS}</style>
      <div className="ws">
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="ws-sidebar">
          <div className="ws-brand">
            <button className="ws-logo" title="JobReady.ai" onClick={() => setActiveView("home")}><RocketIcon size={18} /></button>
            <div>
              <strong>JobReady</strong>
              <span>Application OS</span>
            </div>
          </div>
          <div className="ws-stage-group">
            {workflowStages.map((stage) => (
              <button
                key={stage.id}
                className={`ws-stage-btn ws-stage-${stage.status} ${currentStage?.id === stage.id ? "ws-stage-active" : ""}`}
                onClick={() => navigateWorkflowStage(stage)}
                title={stage.description}
                disabled={!stage.unlocked}
              >
                <div className={`ws-stage-index ${stage.complete ? "ws-stage-complete" : ""}`}>
                  {stage.label.split(".")[0]}
                </div>
                <div className="ws-stage-copy">
                  <strong>{stage.shortLabel}</strong>
                  <span>{stage.label}</span>
                  <em>{stage.complete ? stage.evidence : stage.blocker || stage.evidence}</em>
                </div>
              </button>
            ))}
          </div>
          <div className="ws-rail-card">
            <span className="ws-rail-eyebrow">Current Objective</span>
            <strong>{nextRecommendedStage.label}</strong>
            <p>{nextRecommendedStage.description}</p>
            <button className="ws-rail-cta" onClick={() => navigateWorkflowStage(nextRecommendedStage)}>Continue</button>
          </div>
          <div style={{ flex: 1 }} />
          <div className="ws-sidebar-actions">
            <button className={`ws-side-icon ${activeView === "settings" ? "ws-side-icon-active" : ""}`} onClick={() => setActiveView("settings")} title="Settings">
              <SettingsIcon size={18} />
            </button>
            <button className={`ws-side-icon ${copilotOpen ? "ws-side-icon-active" : ""}`} onClick={() => setCopilotOpen(p => !p)} title="AI Guide">
              <BotIcon size={18} />
            </button>
            <button className="ws-side-icon" onClick={() => { logout(); router.push("/jobready"); }} title="Sign out">
              <LogoutIcon size={18} />
            </button>
          </div>
        </aside>

        {/* ── Main Area ────────────────────────────────────────── */}
        <div className="ws-main">
          <div className="ws-mobile-shell">
            <div className="ws-mobile-topbar">
              <button className="ws-mobile-brand" title="JobReady.ai" onClick={() => setActiveView("home")}>
                <span className="ws-logo ws-mobile-logo"><RocketIcon size={16} /></span>
                <span className="ws-mobile-brand-copy">
                  <strong>JobReady</strong>
                  <em>{activeView === "home" ? "Command Center" : currentStage?.shortLabel || "Workflow"}</em>
                </span>
              </button>
              <div className="ws-mobile-actions">
                <button className="ws-side-icon" onClick={() => setCmdOpen(true)} title="Command Center">
                  <HomeIcon size={18} />
                </button>
                <button className={`ws-side-icon ${copilotOpen ? "ws-side-icon-active" : ""}`} onClick={() => setCopilotOpen(p => !p)} title="AI Guide">
                  <BotIcon size={18} />
                </button>
                <button className={`ws-side-icon ${activeView === "settings" ? "ws-side-icon-active" : ""}`} onClick={() => setActiveView("settings")} title="Settings">
                  <SettingsIcon size={18} />
                </button>
                <button className="ws-side-icon" onClick={() => { logout(); router.push("/jobready"); }} title="Sign out">
                  <LogoutIcon size={18} />
                </button>
              </div>
            </div>

            <div className="ws-mobile-objective">
              <span className="ws-header-kicker">{hasSelectedJob ? "Selected Job" : "Next Up"}</span>
              <strong>{hasSelectedJob ? `${coverLetterJob?.title} · ${coverLetterJob?.company}` : nextRecommendedStage.shortLabel}</strong>
              <p>{focusSummary}</p>
              <div className="ws-mobile-objective-actions">
                <button className="ws-rail-cta" onClick={() => navigateWorkflowStage(nextRecommendedStage)}>
                  Continue
                </button>
                <button className="wf-secondary" onClick={() => setActiveView("settings")}>
                  Account
                </button>
              </div>
            </div>

            <div className="ws-mobile-stage-strip">
              {workflowStages.map((stage) => (
                <button
                  key={`mobile-${stage.id}`}
                  className={`ws-stage-btn ws-stage-btn-mobile ws-stage-${stage.status} ${currentStage?.id === stage.id ? "ws-stage-active" : ""}`}
                  onClick={() => navigateWorkflowStage(stage)}
                  title={stage.description}
                  disabled={!stage.unlocked}
                >
                  <div className={`ws-stage-index ${stage.complete ? "ws-stage-complete" : ""}`}>
                    {stage.label.split(".")[0]}
                  </div>
                  <div className="ws-stage-copy">
                    <strong>{stage.shortLabel}</strong>
                    <span>{stage.label}</span>
                    <em>{stage.complete ? stage.evidence : stage.blocker || stage.evidence}</em>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="ws-header">
            <div className="ws-header-copy">
              <span className="ws-header-kicker">{activeView === "home" ? "Command Center" : currentStage?.label}</span>
              <h1>{activeView === "home" ? "Run one clear hiring workflow" : currentStage?.shortLabel}</h1>
              <p>{focusSummary}</p>
            </div>
            <div className="ws-header-right">
              <div className="ws-focus-pill">
                <span>{hasSelectedJob ? "Selected Job" : "Next Up"}</span>
                <strong>{hasSelectedJob ? `${coverLetterJob?.title} · ${coverLetterJob?.company}` : nextRecommendedStage.shortLabel}</strong>
              </div>
              <button className="ws-cmd-btn" onClick={() => setCmdOpen(true)} title="Command Palette (⌘K)">
                <span>⌘K</span>
              </button>
              <div className="ws-user-pill">
                <div className="ws-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span>{user.name.split(" ")[0]}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="ws-content">
            <div className="ws-panel">
              {activeView === "home" && (
                <WorkflowHome
                  user={user}
                  stages={workflowStages}
                  nextRecommendedStage={nextRecommendedStage}
                  matchedJobs={matchedJobs}
                  trackedJobs={trackedJobs}
                  selectedJob={coverLetterJob}
                  selectedJobStatus={currentTrackedJob?.status || null}
                  onContinueStage={() => navigateWorkflowStage(nextRecommendedStage)}
                  onOpenStage={navigateWorkflowStage}
                  onSelectJob={selectTargetJob}
                />
              )}
              {activeView === "resume" && (
                <ResumeWizard
                  onNavigateToSearch={() => setActiveView("jobs")}
                  onStepChange={setResumeStep}
                  onDataChange={(d) => setResumeData(d as unknown as Record<string, unknown>)}
                  onATSComplete={() => setAtsBaselineComplete(true)}
                  onReset={clearWorkflowDraft}
                  handleRef={(h) => { wizardHandleRef.current = h; }}
                />
              )}
              {activeView === "jobs" && (
                <JobBoard
                  key={user.cvData?.id || "jobs-empty"}
                  user={user}
                  jobs={matchedJobs}
                  selectedJob={coverLetterJob}
                  onSaveToTracker={saveToTracker}
                  onSelectJob={selectTargetJob}
                  onJobsChange={(jobs) => { setMatchedJobs(jobs); setJobCount(jobs.length); }}
                  onJobCountChange={setJobCount}
                  onOpenCoverLetter={openCoverLetter}
                  onTailoredResumeApplied={(jobId) => setTailoredResumeJobId(jobId)}
                  addToast={addToast}
                />
              )}
              {activeView === "tailor" && (
                <TailorStudio
                  job={coverLetterJob}
                  initialText={coverLetterText}
                  cvData={user.cvData}
                  onNavigateToJobs={() => setActiveView("jobs")}
                  onSaveToTracker={saveToTracker}
                  onLogApplication={logApplication}
                  onTailoredResumeApplied={(jobId) => setTailoredResumeJobId(jobId)}
                  onCoverLetterChange={(text, jobId) => {
                    setCoverLetterText(text);
                    setCoverLetterJobId(jobId);
                  }}
                  trackedJob={currentTrackedJob}
                  addToast={addToast}
                />
              )}
              {activeView === "tracker" && (
                <Tracker
                  trackedJobs={trackedJobs}
                  onUpdate={updateTrackedJobs}
                  addToast={addToast}
                />
              )}
              {activeView === "settings" && (
                <SettingsPanel
                  user={user}
                  onEditResume={() => setActiveView("resume")}
                  onResetResume={resetResumeWorkspace}
                  addToast={addToast}
                />
              )}
            </div>

            {/* AI Guide */}
            {copilotOpen && (
              <div className="ws-copilot">
                <AICopilot
                  context={activeView}
                  cvData={user.cvData as Record<string, unknown> | null}
                  isOpen={copilotOpen}
                  onClose={() => setCopilotOpen(false)}
                  onNavigate={handleCopilotNavigate}
                  onUpdateField={handleCopilotUpdateField}
                  onTriggerAction={handleCopilotAction}
                  resumeStep={resumeStep}
                  resumeData={resumeData}
                />
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="ws-statusbar">
            <div className="ws-status-left">
              <span className={`ws-status-dot ${completionPct === 100 ? "ws-dot-green" : "ws-dot-blue"}`} />
              <span>Resume: {completionPct}%</span>
              <span className="ws-status-sep">│</span>
              <span>{jobCount} matches</span>
              <span className="ws-status-sep">│</span>
              <span>{appCount} applied</span>
              <span className="ws-status-sep">│</span>
              <span>{trackedJobs.length} tracked</span>
            </div>
            <div className="ws-status-right">
              <span>AI: {copilotOpen ? "Active" : "Idle"}</span>
              <span className="ws-status-sep">│</span>
              <span>{user.name}</span>
              <span className="ws-status-sep">│</span>
              <span>JobReady.ai v2.0</span>
            </div>
          </div>
        </div>
      </div>

      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} actions={cmdActions} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

function WorkflowHome({
  user,
  stages,
  nextRecommendedStage,
  matchedJobs,
  trackedJobs,
  selectedJob,
  selectedJobStatus,
  onContinueStage,
  onOpenStage,
  onSelectJob,
}: {
  user: { cvGenerated?: boolean; cvData?: GeneratedCV | null; name: string };
  stages: WorkflowStage[];
  nextRecommendedStage: WorkflowStage;
  matchedJobs: JobResult[];
  trackedJobs: TrackedJob[];
  selectedJob: JobResult | null;
  selectedJobStatus: TrackedJob["status"] | null;
  onContinueStage: () => void;
  onOpenStage: (stage: WorkflowStage) => void;
  onSelectJob: (job: JobResult, options?: { coverLetter?: string; openTailor?: boolean }) => void;
}) {
  const topMatches = [...matchedJobs]
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);
  const stageMap = new Map(stages.map((stage) => [stage.id, stage]));

  return (
    <div className="wf">
      <div className="wf-hero">
        <div>
          <span className="wf-eyebrow">Guided Workflow</span>
          <h2>Move one application forward at a time.</h2>
          <p>JobReady should always answer what to do next. Start from your current stage, then let the workspace carry job context through resume, tailoring, and tracking.</p>
        </div>
        <button className="wf-primary" onClick={onContinueStage}>Continue: {nextRecommendedStage.shortLabel}</button>
      </div>

      <div className="wf-grid">
        {stages.map((stage) => (
          <button key={stage.id} className={`wf-card wf-card-${stage.status}`} onClick={() => onOpenStage(stage)}>
            <div className="wf-card-top">
              <span className={`wf-dot ${stage.complete ? "wf-dot-complete" : ""}`} />
              <strong>{stage.label}</strong>
            </div>
            <p>{stage.description}</p>
            <div className="wf-card-meta">
              <span className={`wf-stage-status wf-stage-${stage.status}`}>{stage.status.replace("_", " ")}</span>
              <span>{stage.complete ? stage.evidence : stage.blocker || stage.evidence}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="wf-panel-grid">
        <div className="wf-panel">
          <span className="wf-panel-label">Resume State</span>
          <strong>{user.cvGenerated ? "Base resume is ready" : "Resume still needs setup"}</strong>
          <p>{user.cvData?.summary ? user.cvData.summary : "Upload a CV or build your profile manually so the rest of the workflow has real data to work with."}</p>
          <button className="wf-secondary" onClick={() => onOpenStage(stageMap.get(user.cvGenerated ? "improve" : "import") || stages[0])}>{user.cvGenerated ? "Improve Resume" : "Start Resume"}</button>
        </div>

        <div className="wf-panel">
          <span className="wf-panel-label">Match State</span>
          <strong>{matchedJobs.length > 0 ? `${matchedJobs.length} matches ready` : "No ranked jobs yet"}</strong>
          <p>{selectedJob ? `${selectedJob.title} at ${selectedJob.company} is the current target job.` : "Choose one target job and keep that context through tailoring and application prep."}</p>
          <button className="wf-secondary" onClick={() => onOpenStage(stageMap.get(selectedJob ? "tailor" : "match") || stages[0])}>{selectedJob ? "Open Tailor Studio" : "Find Matches"}</button>
        </div>

        <div className="wf-panel">
          <span className="wf-panel-label">Pipeline State</span>
          <strong>{selectedJobStatus ? `Target job is ${selectedJobStatus}` : trackedJobs.length > 0 ? `${trackedJobs.length} jobs in tracker` : "Tracker is empty"}</strong>
          <p>{trackedJobs.length > 0 ? "Use the tracker after every real apply event so outcomes stay measurable." : "Once you save or apply to a role, it should land in your pipeline automatically."}</p>
          <button className="wf-secondary" onClick={() => onOpenStage(stageMap.get("track") || stages[stages.length - 1])}>Open Tracker</button>
        </div>
      </div>

      <div className="wf-panel">
        <span className="wf-panel-label">Best Matches</span>
        <strong>{topMatches.length > 0 ? "Best-fit roles ready to review" : "Search results will appear here"}</strong>
        <p>{topMatches.length > 0 ? "Keep one target job in focus. The whole workspace should adapt around it." : "Once Match runs, the strongest roles should surface here with one-click routing into Tailor."}</p>
        {topMatches.length > 0 ? (
          <div className="wf-match-list">
            {topMatches.map((job) => (
              <button key={job.id} className="wf-match-item" onClick={() => { onSelectJob(job, { openTailor: true }); }}>
                <div>
                  <strong>{job.title}</strong>
                  <span>{job.company} · {job.location}</span>
                </div>
                <span className="wf-match-score">{job.relevanceScore}%</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TailorStudio({
  job,
  initialText,
  cvData,
  onNavigateToJobs,
  onSaveToTracker,
  onLogApplication,
  onTailoredResumeApplied,
  onCoverLetterChange,
  trackedJob,
  addToast,
}: {
  job: JobResult | null;
  initialText: string;
  cvData?: GeneratedCV | null;
  onNavigateToJobs: () => void;
  onSaveToTracker: (job: JobResult) => void;
  onLogApplication: (job: JobResult) => void;
  onTailoredResumeApplied: (jobId: string) => void;
  onCoverLetterChange: (text: string, jobId: string) => void;
  trackedJob: TrackedJob | null;
  addToast: (msg: string, type: Toast["type"]) => void;
}) {
  const { saveGeneratedCV } = useAuth();
  const [tailoredSummary, setTailoredSummary] = useState<string | null>(null);
  const [tailoredSkills, setTailoredSkills] = useState<string[] | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);

  if (!job) {
    return (
      <div className="ts-empty">
        <span className="wf-eyebrow">Tailor Studio</span>
        <h2>Select one target job first.</h2>
        <p>Tailoring should happen around a single chosen opportunity. Pick a role from the Match stage, then JobReady can carry that context through ATS guidance, cover letter generation, and application tracking.</p>
        <button className="wf-primary" onClick={onNavigateToJobs}>Open Match Stage</button>
      </div>
    );
  }

  const insights = computeResumeJobMatch(cvData, job);

  const tailorResume = async () => {
    if (!cvData) {
      addToast("Save your resume first so tailoring has real source data.", "error");
      return;
    }

    setIsTailoring(true);
    try {
      const result = await resumeApi.chat(
        `Tailor this resume for the following job. Return a JSON object with two keys: "summary" (a factual 2-3 sentence professional summary tailored for this role) and "skills" (an array of existing resume skills reordered by relevance, plus only directly supported adjacent keywords already evidenced by the resume).

Job: ${job.title} at ${job.company}
Job Description: ${job.description?.slice(0, 2000) || "Not provided"}

Resume Facts:
${buildResumeFacts(cvData)}

Rules:
- Use only facts present in the resume facts above.
- Do not invent years of experience, tools, companies, metrics, or placeholders.
- Keep the summary concise and ATS-friendly.

Return ONLY valid JSON: {"summary": "...", "skills": ["skill1", "skill2", ...]}`,
        "chat",
      );

      if (result.data?.reply) {
        const cleaned = result.data.reply.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
        try {
          const parsed = JSON.parse(cleaned);
          setTailoredSummary(parsed.summary || null);
          setTailoredSkills(Array.isArray(parsed.skills) ? parsed.skills : null);
        } catch {
          setTailoredSummary(result.data.reply);
          setTailoredSkills(null);
        }
      }
    } catch {
      addToast("Tailoring failed. Please try again.", "error");
    }
    setIsTailoring(false);
  };

  const applyTailoredResume = async () => {
    if (!cvData) return;

    const updated = { ...cvData };
    if (tailoredSummary) updated.summary = tailoredSummary;
    if (tailoredSkills) updated.skills = tailoredSkills;

    saveGeneratedCV(updated);
    await resumeApi.save(updated as unknown as Record<string, unknown>, "final").catch(() => {});
    onTailoredResumeApplied(job.id);
    addToast(`Resume tailored for ${job.title}`, "success");
  };

  return (
    <div className="ts">
      <div className="ts-hero">
        <div>
          <span className="wf-eyebrow">Selected Job</span>
          <h2>{job.title}</h2>
          <p>{job.company} · {job.location} · {job.source}</p>
        </div>
        <div className="ts-actions">
          <button className="wf-secondary" onClick={() => onSaveToTracker(job)}>Save to Tracker</button>
          <button className="wf-secondary" onClick={() => onLogApplication(job)} disabled={trackedJob?.status === "applied" || trackedJob?.status === "interview" || trackedJob?.status === "offer"}>
            {trackedJob?.status === "applied" || trackedJob?.status === "interview" || trackedJob?.status === "offer" ? "Already Logged" : "Log Application"}
          </button>
          <a className="wf-primary wf-primary-link" href={job.url} target="_blank" rel="noopener noreferrer">Open Apply Link</a>
        </div>
      </div>

      <div className="ts-grid">
        <div className="ts-card">
          <span className="wf-panel-label">Match Overview</span>
          <strong>{insights.matchScore}% current fit</strong>
          <p>Use this as the job-focused workspace. The goal is to make one target application better, not jump between tools.</p>
        </div>
        <div className="ts-card">
          <span className="wf-panel-label">Matched Skills</span>
          <div className="prep-skill-tags">
            {insights.matchedSkills.length > 0
              ? insights.matchedSkills.slice(0, 4).map((skill) => <span key={skill} className="prep-skill-tag prep-skill-matched">{skill}</span>)
              : <span className="ts-empty-copy">Run the Match stage and prepare flow to deepen tailoring.</span>}
          </div>
        </div>
        <div className="ts-card">
          <span className="wf-panel-label">Keywords To Address</span>
          <div className="prep-skill-tags">
            {insights.missingKeywords.length > 0
              ? insights.missingKeywords.slice(0, 4).map((skill) => <span key={skill} className="prep-skill-tag prep-skill-missing">{skill}</span>)
              : <span className="ts-empty-copy">The current resume already covers the strongest signals we detected.</span>}
          </div>
        </div>
        <div className="ts-card">
          <span className="wf-panel-label">Application State</span>
          <strong>{trackedJob ? trackedJob.status.toUpperCase() : "NOT LOGGED"}</strong>
          <p>{trackedJob ? "The selected target job already exists in your pipeline. Continue from here instead of re-entering context elsewhere." : "After you open the external job page, log the application here so the pipeline stays trustworthy."}</p>
        </div>
      </div>

      <div className="ts-card">
        <span className="wf-panel-label">Tailored Resume</span>
        <strong>{tailoredSummary ? "Tailored resume draft ready" : "Tailor this resume for the target job"}</strong>
        <p>{tailoredSummary ? "Review the tailored summary and apply it to your resume version before moving to Apply." : "This stage is only complete when a tailored resume version exists for the selected job."}</p>
        {tailoredSummary && (
          <div className="prep-tailor-text" style={{ marginBottom: 12 }}>{tailoredSummary}</div>
        )}
        {tailoredSkills && tailoredSkills.length > 0 && (
          <div className="prep-skill-tags" style={{ marginBottom: 12 }}>
            {tailoredSkills.map((skill) => <span key={skill} className="prep-skill-tag prep-skill-matched">{skill}</span>)}
          </div>
        )}
        <div className="ts-actions">
          <button className="wf-primary" onClick={tailorResume} disabled={isTailoring}>{isTailoring ? "Tailoring..." : tailoredSummary ? "Regenerate Tailoring" : "Tailor Resume"}</button>
          {tailoredSummary && <button className="wf-secondary" onClick={applyTailoredResume}>Apply Tailored Resume</button>}
        </div>
      </div>

      <CoverLetterGenerator
        key={`${job.id}:${initialText ? "prefill" : "empty"}`}
        job={job}
        initialText={initialText}
        cvData={cvData}
        onTextChange={(text) => onCoverLetterChange(text, job.id)}
        addToast={addToast}
      />
    </div>
  );
}

// ─── Prepare to Apply Modal ─────────────────────────────────────────────────

function PrepareModal({
  job, cvData, onClose, onSaveToTracker, onOpenCoverLetter, onTailoredResumeApplied, addToast,
}: {
  job: JobResult;
  cvData: GeneratedCV | null | undefined;
  onClose: () => void;
  onSaveToTracker: (job: JobResult) => void;
  onOpenCoverLetter: (job: JobResult, text: string) => void;
  onTailoredResumeApplied: (jobId: string) => void;
  addToast: (msg: string, type: Toast["type"]) => void;
}) {
  const { saveGeneratedCV } = useAuth();
  const [data, setData] = useState<PrepareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tips" | "cover" | "skills" | "tailor" | "ats">("tips");
  const [tailoredSummary, setTailoredSummary] = useState<string | null>(null);
  const [tailoredSkills, setTailoredSkills] = useState<string[] | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [atsKeywords, setAtsKeywords] = useState<{ matched: string[]; missing: string[]; score: number; suggestions: string[] } | null>(null);
  const [isAnalyzingAts, setIsAnalyzingAts] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await jobPrepareApi.prepare({
          jobTitle: job.title,
          jobDescription: job.description,
          jobCompany: job.company,
          jobLocation: job.location,
          cvData: (cvData as unknown as Record<string, unknown>) || { skills: [], experience: [] },
        });
        if (result.data) {
          setData(mergePrepareData(job, cvData, result.data));
        } else {
          setData(buildFallbackPrepareData(job, cvData));
        }
      } catch {
        setData(buildFallbackPrepareData(job, cvData));
      }
      setLoading(false);
    };
    load();
  }, [job, cvData]);

  // ── Per-Job Resume Tailoring ──
  const tailorResume = async () => {
    if (!cvData) {
      addToast("Save your resume first so tailoring has real source data.", "error");
      return;
    }
    setIsTailoring(true);
    try {
      const result = await resumeApi.chat(
        `Tailor this resume for the following job. Return a JSON object with two keys: "summary" (a factual 2-3 sentence professional summary tailored for this role) and "skills" (an array of existing resume skills reordered by relevance, plus only directly supported adjacent keywords already evidenced by the resume).

Job: ${job.title} at ${job.company}
Job Description: ${job.description?.slice(0, 2000) || "Not provided"}

Resume Facts:
${buildResumeFacts(cvData)}

Rules:
- Use only facts present in the resume facts above.
- Do not invent years of experience, tools, companies, metrics, or placeholders.
- Keep the summary concise and ATS-friendly.

Return ONLY valid JSON: {"summary": "...", "skills": ["skill1", "skill2", ...]}`,
        "chat",
      );
      if (result.data?.reply) {
        try {
          const cleaned = result.data.reply.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
          const parsed = JSON.parse(cleaned);
          setTailoredSummary(parsed.summary || null);
          setTailoredSkills(Array.isArray(parsed.skills) ? parsed.skills : null);
        } catch {
          setTailoredSummary(result.data.reply);
        }
      }
    } catch {
      addToast("Tailoring failed. Please try again.", "error");
    }
    setIsTailoring(false);
  };

  const applyTailoredResume = () => {
    if (!cvData) return;
    const updated = { ...cvData };
    if (tailoredSummary) updated.summary = tailoredSummary;
    if (tailoredSkills) updated.skills = tailoredSkills;
    saveGeneratedCV(updated);
    resumeApi.save(updated as unknown as Record<string, unknown>, "final").catch(() => {});
    onTailoredResumeApplied(job.id);
    addToast(`Resume tailored for ${job.title} at ${job.company}`, "success");
  };

  // ── ATS Keyword Gap Analysis ──
  const analyzeAtsKeywords = async () => {
    if (!cvData) {
      addToast("Save your resume first so ATS analysis can run.", "error");
      return;
    }
    setIsAnalyzingAts(true);
    try {
      const result = await resumeApi.chat(
        `Analyze ATS keyword match between this resume and job posting. Return a JSON object with: "matched" (array of keywords found in both), "missing" (array of important keywords from job NOT in resume), "score" (0-100 ATS compatibility score), "suggestions" (array of 3-5 specific rewrite suggestions to improve ATS score).

Job: ${job.title} at ${job.company}
Job Description: ${job.description?.slice(0, 2000) || "Not provided"}

Resume Facts:
${buildResumeFacts(cvData)}

Return ONLY valid JSON: {"matched": [...], "missing": [...], "score": number, "suggestions": [...]}`,
        "chat",
      );
      if (result.data?.reply) {
        try {
          const cleaned = result.data.reply.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
          const parsed = JSON.parse(cleaned);
          const fallback = buildFallbackPrepareData(job, cvData);
          setAtsKeywords({
            matched: Array.isArray(parsed.matched) && parsed.matched.length > 0 ? parsed.matched : fallback.matchedSkills,
            missing: Array.isArray(parsed.missing) && parsed.missing.length > 0 ? parsed.missing : fallback.missingSkills,
            score: typeof parsed.score === "number" ? Math.max(parsed.score, fallback.matchScore) : fallback.matchScore,
            suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
              ? parsed.suggestions
              : fallback.aiTips.split("\n"),
          });
        } catch {
          const fallback = buildFallbackPrepareData(job, cvData);
          setAtsKeywords({
            matched: fallback.matchedSkills,
            missing: fallback.missingSkills,
            score: fallback.matchScore,
            suggestions: [result.data.reply],
          });
        }
      }
    } catch {
      const fallback = buildFallbackPrepareData(job, cvData);
      setAtsKeywords({
        matched: fallback.matchedSkills,
        missing: fallback.missingSkills,
        score: fallback.matchScore,
        suggestions: fallback.aiTips.split("\n"),
      });
      addToast("ATS analysis fallback loaded.", "info");
    }
    setIsAnalyzingAts(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-prepare" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Prepare to Apply</h3>
            <p className="modal-subtitle">{job.title} at {job.company}</p>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={16} /></button>
        </div>

        {loading ? (
          <div className="modal-loading">
            <div className="co-spinner" />
            <p>Analyzing job match with AI...</p>
            <style>{`.co-spinner{width:28px;height:28px;border:3px solid #1e293b;border-top-color:#3b82f6;border-radius:50%;animation:cospin .7s linear infinite;margin:0 auto}@keyframes cospin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : data ? (
          <>
            {/* Match Score Banner */}
            <div className={`prep-score-banner ${data.matchScore >= 60 ? "prep-score-hi" : data.matchScore >= 30 ? "prep-score-md" : "prep-score-lo"}`}>
              <div className="prep-score-circle">
                <span className="prep-score-num">{data.matchScore}%</span>
              </div>
              <div>
                <strong>Match Score</strong>
                <p>{data.matchScore >= 60 ? "Strong match! Your skills align well." : data.matchScore >= 30 ? "Moderate match. Tailor your resume to improve." : "Low match. Consider upskilling or tailoring heavily."}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="prep-tabs">
              <button className={activeTab === "tips" ? "prep-tab-active" : ""} onClick={() => setActiveTab("tips")}>Tips</button>
              <button className={activeTab === "skills" ? "prep-tab-active" : ""} onClick={() => setActiveTab("skills")}>Skills</button>
              <button className={activeTab === "tailor" ? "prep-tab-active" : ""} onClick={() => { setActiveTab("tailor"); if (!tailoredSummary && !isTailoring) tailorResume(); }}>Tailor Resume</button>
              <button className={activeTab === "ats" ? "prep-tab-active" : ""} onClick={() => { setActiveTab("ats"); if (!atsKeywords && !isAnalyzingAts) analyzeAtsKeywords(); }}>ATS Keywords</button>
              <button className={activeTab === "cover" ? "prep-tab-active" : ""} onClick={() => setActiveTab("cover")}>Cover Letter</button>
            </div>

            <div className="prep-content">
              {activeTab === "tips" && (
                <div className="prep-tips">
                  {data.aiTips.split("\n").filter(Boolean).map((tip, i) => (
                    <div key={i} className="prep-tip-item">
                      <span className="prep-tip-bullet" />
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "skills" && (
                <div className="prep-skills">
                  {data.matchedSkills.length > 0 && (
                    <div className="prep-skill-group">
                      <h4>Matched Skills</h4>
                      <div className="prep-skill-tags">
                        {data.matchedSkills.map(s => <span key={s} className="prep-skill-tag prep-skill-matched">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {data.missingSkills.length > 0 && (
                    <div className="prep-skill-group">
                      <h4>Skills to Highlight</h4>
                      <div className="prep-skill-tags">
                        {data.missingSkills.map(s => <span key={s} className="prep-skill-tag prep-skill-missing">{s}</span>)}
                      </div>
                      <p className="prep-skill-note">These keywords look weak or missing in your current resume.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "tailor" && (
                <div className="prep-tailor">
                  {isTailoring ? (
                    <div className="prep-tailor-loading">
                      <div className="co-spinner" />
                      <p>AI is tailoring your resume for this role...</p>
                      <style>{`.co-spinner{width:24px;height:24px;border:3px solid #1e293b;border-top-color:#3b82f6;border-radius:50%;animation:cospin .7s linear infinite;margin:0 auto}@keyframes cospin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                  ) : tailoredSummary ? (
                    <>
                      <div className="prep-tailor-section">
                        <h4>Tailored Summary</h4>
                        <div className="prep-tailor-text">{tailoredSummary}</div>
                      </div>
                      {tailoredSkills && (
                        <div className="prep-tailor-section">
                          <h4>Optimized Skills Order</h4>
                          <div className="prep-skill-tags">
                            {tailoredSkills.map(s => <span key={s} className="prep-skill-tag prep-skill-matched">{s}</span>)}
                          </div>
                        </div>
                      )}
                      <div className="prep-tailor-actions">
                        <button className="prep-btn-primary" onClick={applyTailoredResume}>
                          <DocumentIcon size={14} /> Apply to My Resume
                        </button>
                        <button className="prep-btn-secondary" onClick={tailorResume}>
                          <ResetIcon size={14} /> Regenerate
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="prep-tailor-empty">
                      <p>Click to generate a tailored version of your resume for this specific job.</p>
                      <button className="prep-btn-primary" onClick={tailorResume}><SparklesIcon size={14} /> Tailor My Resume</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "ats" && (
                <div className="prep-ats">
                  {isAnalyzingAts ? (
                    <div className="prep-tailor-loading">
                      <div className="co-spinner" />
                      <p>Analyzing ATS keyword compatibility...</p>
                      <style>{`.co-spinner{width:24px;height:24px;border:3px solid #1e293b;border-top-color:#3b82f6;border-radius:50%;animation:cospin .7s linear infinite;margin:0 auto}@keyframes cospin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                  ) : atsKeywords ? (
                    <>
                      <div className={`prep-ats-score ${atsKeywords.score >= 70 ? "prep-ats-good" : atsKeywords.score >= 40 ? "prep-ats-ok" : "prep-ats-low"}`}>
                        <strong>{atsKeywords.score}%</strong>
                        <span>ATS Compatibility Score</span>
                      </div>
                      {atsKeywords.matched.length > 0 && (
                        <div className="prep-skill-group">
                          <h4>Matched Keywords</h4>
                          <div className="prep-skill-tags">
                            {atsKeywords.matched.map(k => <span key={k} className="prep-skill-tag prep-skill-matched">{k}</span>)}
                          </div>
                        </div>
                      )}
                      {atsKeywords.missing.length > 0 && (
                        <div className="prep-skill-group">
                          <h4>Missing Keywords</h4>
                          <div className="prep-skill-tags">
                            {atsKeywords.missing.map(k => <span key={k} className="prep-skill-tag prep-skill-missing">{k}</span>)}
                          </div>
                        </div>
                      )}
                      {atsKeywords.suggestions.length > 0 && (
                        <div className="prep-skill-group">
                          <h4>Rewrite Suggestions</h4>
                          {atsKeywords.suggestions.map((s, i) => (
                            <div key={i} className="prep-tip-item"><span className="prep-tip-bullet" /><p>{s}</p></div>
                          ))}
                        </div>
                      )}
                      <button className="prep-btn-secondary" style={{ marginTop: 12 }} onClick={analyzeAtsKeywords}><ResetIcon size={14} /> Re-analyze</button>
                    </>
                  ) : (
                    <div className="prep-tailor-empty">
                      <p>Analyze how well your resume keywords match this job for ATS systems.</p>
                      <button className="prep-btn-primary" onClick={analyzeAtsKeywords}><SearchIcon size={14} /> Analyze Keywords</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "cover" && (
                <div className="prep-cover">
                  <div className="prep-cover-text">{data.coverLetterSnippet}</div>
                  <div className="prep-cover-actions">
                    <button className="prep-btn-primary" onClick={() => { onOpenCoverLetter(job, data.coverLetterSnippet); onClose(); }}>
                      <SparklesIcon size={14} /> Edit in Cover Letter Builder
                    </button>
                    <button className="prep-btn-secondary" onClick={() => { navigator.clipboard.writeText(data.coverLetterSnippet); addToast("Cover letter copied!", "success"); }}>
                      <ClipboardIcon size={14} /> Copy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="prep-actions">
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="prep-btn-apply">
                Apply Now <ExternalLinkIcon size={14} />
              </a>
              <button className="prep-btn-save" onClick={() => { onSaveToTracker(job); }}>
                Save to Tracker
              </button>
            </div>
          </>
        ) : (
          <div className="modal-loading"><p>Failed to analyze. Please try again.</p></div>
        )}
      </div>
    </div>
  );
}

// ─── Job Board ──────────────────────────────────────────────────────────────

function JobBoard({
  user, jobs, selectedJob, onSaveToTracker, onSelectJob, onJobsChange, onJobCountChange, onOpenCoverLetter, onTailoredResumeApplied, addToast,
}: {
  user: { cvData?: GeneratedCV | null; name: string; email: string };
  jobs: JobResult[];
  selectedJob: JobResult | null;
  onSaveToTracker: (job: JobResult) => void;
  onSelectJob: (job: JobResult, options?: { coverLetter?: string; openTailor?: boolean }) => void;
  onJobsChange: (jobs: JobResult[]) => void;
  onJobCountChange: (count: number) => void;
  onOpenCoverLetter: (job: JobResult, text: string) => void;
  onTailoredResumeApplied: (jobId: string) => void;
  addToast: (msg: string, type: Toast["type"]) => void;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [prepareJob, setPrepareJob] = useState<JobResult | null>(null);
  const autoSearchTimerRef = useRef<number | null>(null);
  const resumeSkills = user.cvData?.skills?.join(", ") || "";
  const resumeLocation = user.cvData?.personalInfo?.location || "";
  const hasResumeContext = Boolean(
    user.cvData && (
      user.cvData.skills?.length ||
      user.cvData.summary?.trim() ||
      user.cvData.experience?.length
    )
  );
  const [skillsInput, setSkillsInput] = useState(resumeSkills);
  const [locationInput, setLocationInput] = useState(resumeLocation);

  const handleSearch = useCallback(async (override?: { skills?: string; location?: string }) => {
    const nextSkills = (override?.skills ?? skillsInput).trim();
    const nextLocation = (override?.location ?? locationInput).trim();
    if (!nextSkills) return;
    setIsSearching(true);
    try {
      const r = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: nextSkills, location: nextLocation, preferences: nextLocation }),
      });
      if (r.ok) {
        const d = await r.json();
        const results = d.jobs || [];
        onJobsChange(results);
        onJobCountChange(results.length);
      } else {
        addToast("Job search failed. Please try again.", "error");
      }
    } catch {
      addToast("Job search failed. Please check your connection and try again.", "error");
    }
    setHasSearched(true);
    setIsSearching(false);
  }, [addToast, locationInput, onJobCountChange, onJobsChange, skillsInput]);

  useEffect(() => {
    if (resumeSkills.trim() && !hasSearched) {
      autoSearchTimerRef.current = window.setTimeout(() => {
        void handleSearch({ skills: resumeSkills, location: resumeLocation });
      }, 0);
    }
    return () => {
      if (autoSearchTimerRef.current !== null) {
        window.clearTimeout(autoSearchTimerRef.current);
      }
    };
  }, [handleSearch, hasSearched, resumeLocation, resumeSkills]);

  const getMatchScore = (job: JobResult) => {
    if (!user.cvData) return job.relevanceScore || 0;
    const localScore = computeResumeJobMatch(user.cvData, job).matchScore;
    return Math.max(localScore, job.relevanceScore || 0);
  };

  return (
    <div className="jb">
      <h2 className="jb-title">Job Search</h2>
      <p className="jb-sub">Find jobs matched to your skills across top platforms.</p>
      <div className="jb-search">
        <div className="jb-field">
          <label>Skills & Keywords</label>
          <input value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="React, Python, AWS..." onKeyDown={e => e.key === "Enter" && handleSearch()} />
        </div>
        <div className="jb-field jb-field-sm">
          <label>Location</label>
          <input value={locationInput} onChange={e => setLocationInput(e.target.value)} placeholder="India" onKeyDown={e => e.key === "Enter" && handleSearch()} />
        </div>
        <button className="jb-search-btn" onClick={() => { void handleSearch(); }} disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>

      {!hasSearched && !hasResumeContext && !skillsInput.trim() && (
        <div className="jb-empty">
          <BriefcaseIcon size={40} color="#475569" />
          <p style={{ fontWeight: 600, marginBottom: 4 }}>No resume detected</p>
          <p style={{ color: "#64748b", fontSize: "0.8125rem" }}>Build your resume in the Resume tab first. Your skills will be used to auto-search for matching jobs across multiple platforms.</p>
        </div>
      )}
      {hasSearched && jobs.length === 0 && <div className="jb-empty"><p>No jobs found. Try different keywords.</p></div>}

      {hasSearched && jobs.length > 0 && (
        <div className="jb-result-count">
          <strong>{jobs.length}</strong> jobs found
          <span className="jb-result-sources"> from {[...new Set(jobs.map(j => j.source))].join(", ")}</span>
        </div>
      )}

      {selectedJob && (
        <div className="jb-target-banner">
          <div>
            <span className="wf-panel-label">Current Target Job</span>
            <strong>{selectedJob.title} at {selectedJob.company}</strong>
            <p>Keep one target role in focus, then move into Tailor to adapt your resume and cover letter around it.</p>
          </div>
          <button className="wf-secondary" onClick={() => onOpenCoverLetter(selectedJob, "")}>Open Tailor</button>
        </div>
      )}

      <div className="jb-results">
        {[...jobs].sort((a, b) => getMatchScore(b) - getMatchScore(a)).map(job => {
          const score = getMatchScore(job);
          const isExpanded = expandedJob === job.id;
          const descText = job.description || "";
          const truncatedDesc = descText.length > 150 ? descText.slice(0, 150) + "..." : descText;
          return (
            <div key={job.id} className={`jb-card ${isExpanded ? "jb-card-exp" : ""} ${score >= 70 ? "jb-card-hi" : score >= 40 ? "jb-card-md" : ""}`}>
              <div className="jb-card-top">
                <div className="jb-card-info">
                  <h4>{job.title}</h4>
                  <span className="jb-company">{job.company}</span>
                  <div className="jb-meta">
                    <span><LocationIcon size={12} /> {job.location}</span>
                    {job.salary && <span className="jb-salary">{job.salary}</span>}
                    {job.jobType && <span className="jb-type">{job.jobType}</span>}
                    {job.postedAt && <span><ClockIcon size={12} /> {job.postedAt}</span>}
                    <span className="jb-source">{job.source}</span>
                  </div>
                </div>
                <div className="jb-card-right">
                  <span className={`jb-score ${score >= 70 ? "jb-score-hi" : score >= 40 ? "jb-score-md" : "jb-score-lo"}`}>{score}% match</span>
                </div>
              </div>
              <p className="jb-desc">{truncatedDesc}</p>
              {job.tags?.length ? <div className="jb-tags">{job.tags.slice(0, 8).map(t => <span key={t} className="jb-tag">{t}</span>)}</div> : null}
              <div className="jb-actions">
                <button className="jb-prepare-btn" onClick={() => { onSelectJob(job); setPrepareJob(job); }}>
                  🚀 Prepare to Apply
                </button>
                <button className={`jb-save-btn ${selectedJob?.id === job.id ? "jb-target-active" : ""}`} onClick={() => onSelectJob(job)}>
                  {selectedJob?.id === job.id ? "Current Target" : "Set as Target"}
                </button>
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="jb-apply-btn">Apply <ExternalLinkIcon size={12} /></a>
                <button className="jb-save-btn" onClick={() => onSaveToTracker(job)}>Save</button>
                <button className="jb-detail-btn" onClick={() => setExpandedJob(isExpanded ? null : job.id)}>
                  {isExpanded ? "Less" : "Details"}
                </button>
              </div>
              {isExpanded && <div className="jb-full-desc"><p>{job.description}</p></div>}
            </div>
          );
        })}
      </div>

      {/* Prepare to Apply Modal */}
      {prepareJob && (
        <PrepareModal
          job={prepareJob}
          cvData={user.cvData}
          onClose={() => setPrepareJob(null)}
          onSaveToTracker={onSaveToTracker}
          onOpenCoverLetter={onOpenCoverLetter}
          onTailoredResumeApplied={onTailoredResumeApplied}
          addToast={addToast}
        />
      )}
    </div>
  );
}

// ─── Application Tracker (Kanban) ───────────────────────────────────────────

function Tracker({
  trackedJobs, onUpdate, addToast,
}: {
  trackedJobs: TrackedJob[];
  onUpdate: (jobs: TrackedJob[]) => void;
  addToast: (msg: string, type: Toast["type"]) => void;
}) {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const moveJob = async (id: string, status: TrackedJob["status"]) => {
    const result = await applicationsApi.update(id, { status });
    if (result.data) {
      onUpdate(trackedJobs.map(j => j.id === id ? { ...j, status } : j));
      addToast(`Moved to ${status}`, "success");
    } else {
      addToast(result.error || "Failed to update", "error");
    }
  };

  const removeJob = async (id: string) => {
    const result = await applicationsApi.remove(id);
    if (!result.error) {
      onUpdate(trackedJobs.filter(j => j.id !== id));
      addToast("Removed from tracker", "info");
    } else {
      addToast(result.error || "Failed to remove", "error");
    }
  };

  const saveNote = async (id: string) => {
    const result = await applicationsApi.update(id, { notes: noteText });
    if (result.data) {
      onUpdate(trackedJobs.map(j => j.id === id ? { ...j, notes: noteText } : j));
      setEditingNote(null);
      addToast("Note saved", "success");
    } else {
      addToast(result.error || "Failed to save note", "error");
    }
  };

  const startEditNote = (job: TrackedJob) => {
    setEditingNote(job.id);
    setNoteText(job.notes || "");
  };

  const columns: { status: TrackedJob["status"]; label: string; color: string }[] = [
    { status: "saved", label: "📌 Saved", color: "#3b82f6" },
    { status: "applied", label: "📨 Applied", color: "#8b5cf6" },
    { status: "interview", label: "🎤 Interview", color: "#f59e0b" },
    { status: "offer", label: "🎉 Offer", color: "#22c55e" },
  ];

  const nextStatus: Record<string, TrackedJob["status"]> = {
    saved: "applied", applied: "interview", interview: "offer",
  };

  const prevStatus: Record<string, TrackedJob["status"]> = {
    applied: "saved", interview: "applied", offer: "interview",
  };

  return (
    <div className="tk">
      <h2 className="tk-title">Application Tracker</h2>
      <p className="tk-sub">Track your job applications through each stage.</p>

      {trackedJobs.length === 0 && (
        <div className="tk-empty-state">
          <SearchIcon size={48} color="#475569" />
          <h3>No applications tracked yet</h3>
          <p>Search for jobs and click &quot;Save to Tracker&quot; to start tracking your applications.</p>
        </div>
      )}

      <div className="tk-board">
        {columns.map(col => {
          const colJobs = trackedJobs.filter(j => j.status === col.status);
          return (
            <div key={col.status} className="tk-col">
              <div className="tk-col-header" style={{ borderColor: col.color }}>
                <span>{col.label}</span>
                <span className="tk-count">{colJobs.length}</span>
              </div>
              <div className="tk-col-body">
                {colJobs.map(job => (
                  <div key={job.id} className="tk-card">
                    <strong>{job.title}</strong>
                    <span className="tk-card-co">{job.company}</span>
                    {job.location && <span className="tk-card-loc">{job.location}</span>}
                    {job.salary && <span className="tk-card-salary">{job.salary}</span>}
                    <span className="tk-card-date">Added {new Date(job.addedAt).toLocaleDateString()}</span>

                    {/* Notes */}
                    {editingNote === job.id ? (
                      <div className="tk-note-edit">
                        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add notes..." rows={3} />
                        <div className="tk-note-btns">
                          <button onClick={() => saveNote(job.id)}>Save</button>
                          <button onClick={() => setEditingNote(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : job.notes ? (
                      <div className="tk-note" onClick={() => startEditNote(job)}>
                        <EditIcon size={12} /> {job.notes}
                      </div>
                    ) : null}

                    <div className="tk-card-actions">
                      {prevStatus[col.status] && (
                        <button onClick={() => moveJob(job.id, prevStatus[col.status])} title="Move back"><ChevronLeftIcon size={14} /></button>
                      )}
                      {nextStatus[col.status] && (
                        <button onClick={() => moveJob(job.id, nextStatus[col.status])} title="Move forward"><ChevronRightIcon size={14} /></button>
                      )}
                      <button onClick={() => startEditNote(job)} title="Add note"><EditIcon size={14} /></button>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="tk-link-btn" title="Open job posting">
                          <ExternalLinkIcon size={12} />
                        </a>
                      )}
                      <button onClick={() => removeJob(job.id)} className="tk-remove" title="Remove"><XIcon size={14} /></button>
                    </div>
                  </div>
                ))}
                {colJobs.length === 0 && (
                  <div className="tk-empty">No items</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Cover Letter Generator ─────────────────────────────────────────────────

function CoverLetterGenerator({
  job, initialText, cvData, onTextChange, addToast,
}: {
  job: JobResult | null;
  initialText: string;
  cvData?: GeneratedCV | null;
  onTextChange?: (text: string) => void;
  addToast: (msg: string, type: Toast["type"]) => void;
}) {
  const [text, setText] = useState(initialText || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobTitle, setJobTitle] = useState(job?.title || "");
  const [company, setCompany] = useState(job?.company || "");

  useEffect(() => {
    onTextChange?.(text);
  }, [onTextChange, text]);

  const generateLetter = async () => {
    if (!jobTitle.trim()) { addToast("Enter a job title first", "error"); return; }
    setIsGenerating(true);
    try {
      const result = await resumeApi.chat(
        `Write a professional, personalized cover letter for a ${jobTitle} position at ${company || "the company"}.

Use only the factual resume data below. If a detail is missing, omit it. Do not invent years of experience, tools, metrics, employers, or placeholders like [Your Name]. Keep it concise at 3-4 short paragraphs and sign with the candidate's real name if available.

Resume Facts:
${buildResumeFacts(cvData)}`,
        "chat",
        { ...(cvData as unknown as Record<string, unknown> || {}), task: "cover_letter", jobTitle, company },
      );
      if (result.data?.reply) {
        const cleaned = result.data.reply
          .replace(/\[Your Name\]/gi, cvData?.personalInfo?.name || "")
          .replace(/\[Company Name\]/gi, company)
          .trim();
        setText(cleaned);
        addToast("Cover letter generated!", "success");
      } else {
        addToast("Failed to generate. Try again.", "error");
      }
    } catch {
      addToast("Generation failed. Check connection.", "error");
    }
    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    addToast("Copied to clipboard!", "success");
  };

  const downloadAsText = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${company || "job"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Downloaded!", "success");
  };

  return (
    <div className="cl">
      <h2 className="cl-title">Cover Letter Generator</h2>
      <p className="cl-sub">Generate a tailored cover letter using AI and your resume data.</p>

      <div className="cl-fields">
        <div className="cl-field">
          <label>Job Title</label>
          <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Software Engineer" />
        </div>
        <div className="cl-field">
          <label>Company</label>
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Google" />
        </div>
        <button className="cl-generate-btn" onClick={generateLetter} disabled={isGenerating}>
          {isGenerating ? (
            <><span className="cl-spinner" /> Generating...</>
          ) : (
            <><SparklesIcon size={14} /> Generate with AI</>
          )}
        </button>
      </div>

      <div className="cl-editor">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Your cover letter will appear here. You can also write or paste one manually."
          rows={18}
        />
      </div>

      {text && (
        <div className="cl-actions">
          <button className="cl-btn-primary" onClick={copyToClipboard}><ClipboardIcon size={14} /> Copy</button>
          <button className="cl-btn-secondary" onClick={downloadAsText}><DownloadIcon size={14} /> Download .txt</button>
          <button className="cl-btn-secondary" onClick={() => { setText(""); addToast("Cleared", "info"); }}><TrashIcon size={14} /> Clear</button>
        </div>
      )}
    </div>
  );
}

// ─── Settings Panel ─────────────────────────────────────────────────────────

function SettingsPanel({
  user, onEditResume, onResetResume, addToast,
}: {
  user: { name: string; email: string; phone?: string; location?: string; cvGenerated?: boolean; cvData?: GeneratedCV | null; createdAt: string };
  onEditResume: () => void;
  onResetResume: () => Promise<boolean>;
  addToast: (msg: string, type: Toast["type"]) => void;
}) {
  const { updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [location, setLocation] = useState(user.location || "");
  const [saving, setSaving] = useState(false);

  // Password change
  const [showPwChange, setShowPwChange] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const result = await authApi.updateProfile({ name, phone, location });
      if (result.error) {
        addToast(result.error, "error");
      } else {
        updateProfile({ name, phone, location });
        addToast("Profile updated!", "success");
        setEditing(false);
      }
    } catch {
      addToast("Failed to update profile", "error");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { addToast("Passwords don't match", "error"); return; }
    if (newPw.length < 8) { addToast("Password must be at least 8 characters", "error"); return; }
    setPwSaving(true);
    try {
      const result = await authApi.changePassword(currentPw, newPw);
      if (result.error) {
        addToast(result.error, "error");
      } else {
        addToast("Password changed!", "success");
        setShowPwChange(false);
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      }
    } catch {
      addToast("Failed to change password", "error");
    }
    setPwSaving(false);
  };

  const exportData = async () => {
    // Fetch fresh from DB
    const appsResult = await applicationsApi.list();
    const data = {
      profile: { name: user.name, email: user.email, phone: user.phone, location: user.location },
      resume: user.cvData,
      applications: appsResult.data || [],
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobready-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Data exported!", "success");
  };

  const resetResumeData = async () => {
    const didReset = await onResetResume();
    if (didReset) onEditResume();
  };

  return (
    <div className="sp">
      <h2 className="sp-title">Settings</h2>

      {/* Profile Card */}
      <div className="sp-card">
        <div className="sp-card-header">
          <h3>Profile</h3>
          {!editing && <button className="sp-edit-btn" onClick={() => setEditing(true)}>Edit</button>}
        </div>
        {editing ? (
          <div className="sp-edit-form">
            <div className="sp-field">
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="sp-field">
              <label>Email</label>
              <input value={user.email} disabled className="sp-disabled" />
            </div>
            <div className="sp-field">
              <label>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" />
            </div>
            <div className="sp-field">
              <label>Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Bangalore, India" />
            </div>
            <div className="sp-edit-actions">
              <button className="sp-btn" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button className="sp-btn-cancel" onClick={() => { setEditing(false); setName(user.name); setPhone(user.phone || ""); setLocation(user.location || ""); }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="sp-grid">
            <div className="sp-item"><span className="sp-label">Name</span><span>{user.name}</span></div>
            <div className="sp-item"><span className="sp-label">Email</span><span>{user.email}</span></div>
            {user.phone && <div className="sp-item"><span className="sp-label">Phone</span><span>{user.phone}</span></div>}
            {user.location && <div className="sp-item"><span className="sp-label">Location</span><span>{user.location}</span></div>}
            <div className="sp-item"><span className="sp-label">Member since</span><span>{new Date(user.createdAt).toLocaleDateString()}</span></div>
          </div>
        )}
      </div>

      {/* Password Card */}
      <div className="sp-card">
        <div className="sp-card-header">
          <h3>Security</h3>
        </div>
        {showPwChange ? (
          <div className="sp-edit-form">
            <div className="sp-field">
              <label>Current Password</label>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
            </div>
            <div className="sp-field">
              <label>New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 characters" />
            </div>
            <div className="sp-field">
              <label>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
            </div>
            <div className="sp-edit-actions">
              <button className="sp-btn" onClick={handleChangePassword} disabled={pwSaving}>
                {pwSaving ? "Changing..." : "Change Password"}
              </button>
              <button className="sp-btn-cancel" onClick={() => { setShowPwChange(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="sp-btn-outline" onClick={() => setShowPwChange(true)}>Change Password</button>
        )}
      </div>

      {/* Resume Card */}
      <div className="sp-card">
        <div className="sp-card-header">
          <h3>Resume</h3>
        </div>
        <p className="sp-status">{user.cvGenerated ? "Resume created" : "No resume yet"}</p>
        {user.cvGenerated && user.cvData && (
          <div className="sp-resume-info">
            <span>Skills: {user.cvData.skills?.length || 0}</span>
            <span>Experience: {user.cvData.experience?.length || 0} roles</span>
            <span>Education: {user.cvData.education?.length || 0} entries</span>
          </div>
        )}
        <div className="sp-edit-actions">
          <button className="sp-btn" onClick={onEditResume}>{user.cvGenerated ? "Edit Resume" : "Create Resume"}</button>
          {user.cvGenerated && <button className="sp-btn-cancel" onClick={resetResumeData}><ResetIcon size={14} /> Reset Resume Data</button>}
        </div>
      </div>

      {/* Data Export */}
      <div className="sp-card">
        <div className="sp-card-header">
          <h3>Data</h3>
        </div>
        <p className="sp-data-desc">Export all your JobReady data including profile, resume, and tracked applications.</p>
        <button className="sp-btn-outline" onClick={exportData}><DownloadIcon size={14} /> Export All Data</button>
      </div>
    </div>
  );
}

// ─── CSS ────────────────────────────────────────────────────────────────────

const workspaceCSS = `
  * { box-sizing: border-box; }
  .ws {
    --ws-bg:#091115;
    --ws-bg-soft:#0d171d;
    --ws-panel:#101a20;
    --ws-panel-2:#142028;
    --ws-panel-3:#182731;
    --ws-border:#22323c;
    --ws-border-strong:#34505d;
    --ws-text:#e7edf0;
    --ws-muted:#91a4ad;
    --ws-soft:#647983;
    --ws-accent:#2f6e6a;
    --ws-accent-strong:#9ed5cf;
    --ws-warm:#b7844d;
    --ws-success:#4db38a;
    display:flex; height:100vh;
    background:
      radial-gradient(circle at top left, rgba(92,163,168,0.16), transparent 32%),
      radial-gradient(circle at top right, rgba(198,145,83,0.09), transparent 24%),
      linear-gradient(180deg, rgba(255,255,255,0.015), transparent 18%),
      var(--ws-bg);
    color:var(--ws-text);
    font-family:"Avenir Next","Segoe UI","SF Pro Display",system-ui,sans-serif;
    overflow:hidden;
  }

  /* Sidebar */
  .ws-sidebar {
    width:264px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.018), transparent 16%),
      rgba(9,17,21,0.94);
    backdrop-filter:blur(18px);
    border-right:1px solid var(--ws-border);
    display:flex; flex-direction:column;
    padding:20px 16px; gap:18px; flex-shrink:0; z-index:10;
    box-shadow:inset -1px 0 0 rgba(255,255,255,0.02);
  }
  .ws-brand {
    display:flex; align-items:center; gap:12px; padding:10px 12px 14px;
    border-bottom:1px solid rgba(52,80,93,0.62);
  }
  .ws-logo {
    width:42px; height:42px; border-radius:15px;
    background:var(--ws-accent);
    color:#fff; display:flex; align-items:center; justify-content:center;
    font-size:1.05rem; box-shadow:0 14px 30px rgba(8,14,18,0.42);
    border:none; cursor:pointer;
  }
  .ws-brand strong { display:block; font-size:0.98rem; color:#f8fafc; letter-spacing:0.01em; }
  .ws-brand span { display:block; margin-top:2px; font-size:0.68rem; color:var(--ws-muted); text-transform:uppercase; letter-spacing:0.16em; }
  .ws-stage-group { display:flex; flex-direction:column; gap:8px; }
  .ws-stage-btn {
    width:100%; display:flex; align-items:flex-start; gap:12px; text-align:left;
    padding:13px 12px; border-radius:16px; border:1px solid transparent;
    background:transparent; color:#cbd5e1; cursor:pointer; transition:all 0.18s ease;
  }
  .ws-stage-btn:hover { background:rgba(20,32,40,0.9); border-color:var(--ws-border); transform:translateX(2px); }
  .ws-stage-btn:disabled { cursor:not-allowed; opacity:0.72; }
  .ws-stage-btn:disabled:hover { transform:none; }
  .ws-stage-active {
    background:linear-gradient(180deg, rgba(20,32,40,0.98), rgba(16,26,32,0.96));
    border-color:rgba(92,163,168,0.32);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 16px 30px rgba(4,10,14,0.26);
  }
  .ws-stage-locked { opacity:0.6; }
  .ws-stage-ready .ws-stage-index { border-color:rgba(92,163,168,0.28); color:var(--ws-accent-strong); }
  .ws-stage-in_progress .ws-stage-index { border-color:rgba(198,145,83,0.34); color:#deb17a; }
  .ws-stage-index {
    width:30px; height:30px; border-radius:11px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    background:rgba(255,255,255,0.02); border:1px solid var(--ws-border); color:var(--ws-muted);
    font-size:0.76rem; font-weight:700;
  }
  .ws-stage-complete {
    background:rgba(77,179,138,0.12); border-color:rgba(77,179,138,0.32); color:#78d2ac;
  }
  .ws-stage-copy strong { display:block; font-size:0.86rem; color:#f8fafc; letter-spacing:0.01em; }
  .ws-stage-copy span { display:block; margin-top:3px; font-size:0.73rem; color:var(--ws-soft); line-height:1.4; }
  .ws-stage-copy em { display:block; margin-top:8px; font-size:0.7rem; font-style:normal; color:#94a3b8; line-height:1.45; }
  .ws-rail-card {
    padding:18px; border-radius:20px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.028), transparent 32%),
      linear-gradient(180deg, rgba(17,31,38,0.98), rgba(13,22,28,0.98));
    border:1px solid var(--ws-border);
  }
  .ws-rail-eyebrow, .wf-eyebrow, .ws-header-kicker, .wf-panel-label {
    display:inline-block; font-size:0.67rem; text-transform:uppercase; letter-spacing:0.16em; color:var(--ws-muted);
  }
  .ws-rail-card strong { display:block; margin-top:10px; font-size:0.95rem; color:#f8fafc; }
  .ws-rail-card p { margin:8px 0 14px; font-size:0.79rem; color:var(--ws-muted); line-height:1.58; }
  .ws-rail-cta, .wf-primary, .wf-primary-link {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:10px 16px; border:none; border-radius:999px;
    background:var(--ws-accent); color:#fff;
    font-size:0.82rem; font-weight:700; cursor:pointer; text-decoration:none;
    box-shadow:0 16px 28px rgba(11,29,34,0.34); transition:transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }
  .ws-rail-cta:hover, .wf-primary:hover, .wf-primary-link:hover { transform:translateY(-1px); box-shadow:0 20px 34px rgba(11,29,34,0.42); }
  .ws-sidebar-actions { display:flex; gap:8px; }
  .ws-side-icon {
    width:42px; height:42px; border-radius:13px; border:1px solid var(--ws-border);
    background:var(--ws-bg-soft); color:var(--ws-muted); cursor:pointer; display:flex;
    align-items:center; justify-content:center; transition:all 0.18s ease;
  }
  .ws-side-icon:hover { border-color:var(--ws-border-strong); color:#f8fafc; }
  .ws-side-icon-active { background:#0f2025; color:var(--ws-accent-strong); border-color:rgba(92,163,168,0.3); }
  .ws-mobile-shell { display:none; }
  .ws-mobile-topbar { display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .ws-mobile-brand {
    display:flex; align-items:center; gap:10px; padding:0;
    background:none; border:none; color:inherit; cursor:pointer;
  }
  .ws-mobile-logo { width:38px; height:38px; border-radius:13px; font-size:0.95rem; }
  .ws-mobile-brand-copy strong { display:block; font-size:0.92rem; color:#f8fafc; letter-spacing:0.01em; }
  .ws-mobile-brand-copy em {
    display:block; margin-top:2px; font-style:normal; font-size:0.68rem;
    letter-spacing:0.14em; text-transform:uppercase; color:var(--ws-muted);
  }
  .ws-mobile-actions { display:flex; gap:8px; }
  .ws-mobile-objective-actions { display:flex; gap:8px; flex-wrap:wrap; }
  .ws-mobile-objective {
    padding:16px; border-radius:20px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.02), transparent 20%),
      linear-gradient(135deg, rgba(18,30,36,0.98), rgba(24,39,49,0.9));
    border:1px solid rgba(92,163,168,0.14);
    box-shadow:0 16px 28px rgba(4,10,14,0.22);
  }
  .ws-mobile-objective strong {
    display:block; margin:8px 0 6px; font-size:1rem; color:#f8fafc; letter-spacing:-0.02em;
    line-height:1.3;
  }
  .ws-mobile-objective p { margin:0 0 14px; color:var(--ws-muted); font-size:0.82rem; line-height:1.55; }
  .ws-mobile-stage-strip {
    display:flex; gap:8px; overflow-x:auto; padding-bottom:2px;
    scroll-snap-type:x proximity;
  }
  .ws-mobile-stage-strip::-webkit-scrollbar { display:none; }
  .ws-stage-btn-mobile {
    width:auto; min-width:max-content; flex:0 0 auto; scroll-snap-align:start;
    align-items:center; gap:10px; padding:10px 12px; border-radius:14px;
    background:rgba(12,23,28,0.92);
  }
  .ws-stage-btn-mobile .ws-stage-index {
    width:24px; height:24px; border-radius:999px; font-size:0.68rem;
  }
  .ws-stage-btn-mobile .ws-stage-copy strong { font-size:0.76rem; white-space:nowrap; }
  .ws-stage-btn-mobile .ws-stage-copy span,
  .ws-stage-btn-mobile .ws-stage-copy em { display:none; }

  /* Main Area */
  .ws-main { flex:1; display:flex; flex-direction:column; min-width:0; }
  .ws-header {
    display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
    padding:28px 30px 20px; border-bottom:1px solid var(--ws-border);
    background:linear-gradient(180deg, rgba(9,17,21,0.88), rgba(9,17,21,0.58));
  }
  .ws-header-copy h1 { margin:9px 0 6px; font-size:1.92rem; line-height:1.03; letter-spacing:-0.045em; color:#f8fafc; }
  .ws-header-copy p { margin:0; max-width:720px; color:var(--ws-muted); font-size:0.93rem; line-height:1.6; }
  .ws-header-right { display:flex; align-items:center; gap:12px; flex-wrap:wrap; justify-content:flex-end; }
  .ws-focus-pill {
    min-width:240px; padding:12px 14px; border-radius:17px;
    background:rgba(20,32,40,0.82); border:1px solid var(--ws-border);
  }
  .ws-focus-pill span { display:block; font-size:0.67rem; text-transform:uppercase; letter-spacing:0.16em; color:var(--ws-soft); }
  .ws-focus-pill strong { display:block; margin-top:5px; font-size:0.82rem; color:#f8fafc; line-height:1.4; }
  .ws-cmd-btn { padding:6px 11px; border-radius:8px; background:rgba(16,26,32,0.9); border:1px solid var(--ws-border); color:var(--ws-soft); font-size:0.6875rem; font-family:"IBM Plex Mono","SFMono-Regular",monospace; font-weight:600; cursor:pointer; transition:all 0.15s; }
  .ws-cmd-btn:hover { border-color:var(--ws-accent); color:var(--ws-accent-strong); }
  .ws-user-pill { display:flex; align-items:center; gap:8px; padding:4px 12px 4px 4px; border-radius:10px; background:rgba(16,26,32,0.9); border:1px solid var(--ws-border); }
  .ws-avatar { width:28px; height:28px; border-radius:9px; background:var(--ws-accent); color:#fff; font-size:0.7rem; font-weight:700; display:flex; align-items:center; justify-content:center; }
  .ws-user-pill span { font-size:0.76rem; color:var(--ws-muted); }

  /* Content */
  .ws-content { flex:1; display:flex; overflow:hidden; }
  .ws-panel {
    flex:1; overflow-y:auto; padding:30px; min-width:0;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.012), transparent 20%),
      rgba(9,17,21,0.22);
  }
  .ws-copilot { width:340px; flex-shrink:0; border-left:1px solid var(--ws-border); background:rgba(9,17,21,0.88); }

  /* Status Bar */
  .ws-statusbar { display:flex; justify-content:space-between; padding:0 16px; height:28px; align-items:center; background:#0a0c12; border-top:1px solid #1a1f2e; font-size:0.6875rem; font-family:'JetBrains Mono','Fira Code',monospace; color:#475569; flex-shrink:0; }
  .ws-status-left, .ws-status-right { display:flex; align-items:center; gap:8px; }
  .ws-status-sep { color:#1e293b; }
  .ws-status-dot { width:8px; height:8px; border-radius:50%; }
  .ws-dot-green { background:#22c55e; box-shadow:0 0 6px rgba(34,197,94,0.4); }
  .ws-dot-blue { background:#3b82f6; box-shadow:0 0 6px rgba(59,130,246,0.4); }

  /* Workflow Home */
  .wf { display:flex; flex-direction:column; gap:22px; max-width:1120px; }
  .wf-hero {
    display:flex; align-items:flex-end; justify-content:space-between; gap:20px; flex-wrap:wrap;
    padding:28px; border-radius:26px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.025), transparent 28%),
      linear-gradient(135deg, rgba(18,30,36,0.98), rgba(24,39,49,0.9));
    border:1px solid rgba(92,163,168,0.14);
    box-shadow:0 24px 50px rgba(4,10,14,0.24);
  }
  .wf-hero h2 { margin:10px 0 8px; font-size:2.15rem; line-height:1.02; letter-spacing:-0.05em; color:#f8fafc; max-width:580px; }
  .wf-hero p { margin:0; max-width:640px; color:var(--ws-muted); font-size:0.95rem; line-height:1.68; }
  .wf-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
  .wf-card {
    padding:18px; border-radius:20px; text-align:left; cursor:pointer;
    background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%), var(--ws-panel);
    border:1px solid var(--ws-border); color:inherit;
    transition:transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
  }
  .wf-card:hover { transform:translateY(-2px); border-color:var(--ws-border-strong); background:linear-gradient(180deg, rgba(255,255,255,0.026), transparent 18%), var(--ws-panel-2); }
  .wf-card-locked { opacity:0.72; }
  .wf-card-top { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
  .wf-card strong { font-size:0.92rem; color:#f8fafc; }
  .wf-card p { margin:0; color:var(--ws-muted); font-size:0.84rem; line-height:1.58; }
  .wf-card-meta { margin-top:12px; display:flex; flex-direction:column; gap:8px; }
  .wf-card-meta span:last-child { color:var(--ws-muted); font-size:0.76rem; line-height:1.45; }
  .wf-stage-status {
    display:inline-flex; align-items:center; width:max-content; padding:4px 10px;
    border-radius:999px; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.1em;
    border:1px solid var(--ws-border); color:#cbd5e1; background:rgba(11,18,24,0.9);
  }
  .wf-stage-complete { color:#84d4b2; border-color:rgba(77,179,138,0.3); background:rgba(77,179,138,0.08); }
  .wf-stage-in_progress { color:#deb17a; border-color:rgba(198,145,83,0.3); background:rgba(198,145,83,0.08); }
  .wf-stage-ready { color:var(--ws-accent-strong); border-color:rgba(92,163,168,0.3); background:rgba(92,163,168,0.08); }
  .wf-stage-locked { color:var(--ws-muted); border-color:var(--ws-border); background:#0d171d; }
  .wf-dot {
    width:10px; height:10px; border-radius:999px; background:#334155;
    box-shadow:0 0 0 4px rgba(51,65,85,0.18);
  }
  .wf-dot-complete { background:var(--ws-success); box-shadow:0 0 0 4px rgba(77,179,138,0.16); }
  .wf-panel-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
  .wf-panel, .ts-card {
    padding:20px; border-radius:20px; background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%), var(--ws-panel); border:1px solid var(--ws-border);
  }
  .wf-panel strong, .ts-card strong { display:block; margin:10px 0 8px; font-size:1rem; color:#f8fafc; }
  .wf-panel p, .ts-card p { margin:0 0 16px; color:var(--ws-muted); font-size:0.84rem; line-height:1.6; }
  .wf-match-list { display:flex; flex-direction:column; gap:10px; margin-top:16px; }
  .wf-match-item {
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    padding:14px 16px; width:100%; border-radius:16px; border:1px solid var(--ws-border);
    background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%), var(--ws-bg-soft);
    color:inherit; cursor:pointer; text-align:left; transition:all 0.18s ease;
  }
  .wf-match-item:hover { border-color:var(--ws-accent); transform:translateY(-1px); }
  .wf-match-item strong { display:block; margin:0; font-size:0.88rem; color:#f8fafc; }
  .wf-match-item span { display:block; font-size:0.76rem; color:var(--ws-muted); }
  .wf-match-score {
    padding:6px 10px; border-radius:999px; background:rgba(92,163,168,0.12);
    border:1px solid rgba(92,163,168,0.22); color:var(--ws-accent-strong); font-size:0.78rem; font-weight:700;
  }
  .wf-secondary {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 14px; border-radius:999px; border:1px solid var(--ws-border);
    background:rgba(12,23,28,0.9); color:#d3dde1; font-size:0.8rem; font-weight:600; cursor:pointer;
    text-decoration:none; transition:all 0.18s ease;
  }
  .wf-secondary:hover { border-color:var(--ws-accent); color:#f8fafc; background:var(--ws-panel-2); }
  .wf-secondary:disabled { opacity:0.6; cursor:not-allowed; }

  /* Tailor Studio */
  .ts { display:flex; flex-direction:column; gap:18px; max-width:1120px; }
  .ts-empty {
    padding:30px; border-radius:24px; background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%), var(--ws-panel); border:1px solid var(--ws-border);
    text-align:left;
  }
  .ts-empty h2 { margin:10px 0 8px; font-size:1.8rem; letter-spacing:-0.03em; color:#f8fafc; }
  .ts-empty p { margin:0 0 18px; max-width:720px; color:var(--ws-muted); line-height:1.65; }
  .ts-hero {
    display:flex; align-items:flex-end; justify-content:space-between; gap:16px; flex-wrap:wrap;
    padding:24px 26px; border-radius:24px;
    background:linear-gradient(135deg, rgba(18,30,36,0.98), rgba(24,39,49,0.9));
    border:1px solid rgba(92,163,168,0.14);
  }
  .ts-hero h2 { margin:8px 0 6px; font-size:1.9rem; line-height:1.04; letter-spacing:-0.04em; color:#f8fafc; }
  .ts-hero p { margin:0; color:var(--ws-muted); font-size:0.9rem; }
  .ts-actions { display:flex; gap:10px; flex-wrap:wrap; }
  .ts-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
  .ts-empty-copy { color:var(--ws-soft); font-size:0.78rem; line-height:1.55; }

  /* Toast */
  .toast-container { position:fixed; top:16px; right:16px; z-index:200; display:flex; flex-direction:column; gap:8px; }
  .toast {
    display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:16px;
    background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%), var(--ws-panel);
    border:1px solid var(--ws-border); color:#e2e8f0; font-size:0.8125rem; animation:toast-in 0.25s ease;
    min-width:280px; box-shadow:0 18px 34px rgba(4,10,14,0.34);
  }
  @keyframes toast-in { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  .toast-icon { width:26px; height:26px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); }
  .toast p { margin:0; flex:1; }
  .toast button { background:none; border:none; color:var(--ws-soft); cursor:pointer; padding:0 2px; display:flex; align-items:center; justify-content:center; }
  .toast-success { border-color:rgba(77,179,138,0.34); }
  .toast-success .toast-icon { color:#84d4b2; }
  .toast-error { border-color:rgba(194,120,120,0.3); }
  .toast-error .toast-icon { color:#efb4b4; }
  .toast-info { border-color:rgba(92,163,168,0.34); }
  .toast-info .toast-icon { color:var(--ws-accent-strong); }

  /* Prepare Modal */
  .modal-overlay { position:fixed; inset:0; background:rgba(5,9,12,0.78); backdrop-filter:blur(10px); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; }
  .modal-prepare {
    width:100%; max-width:720px; max-height:88vh; overflow-y:auto;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.025), transparent 22%),
      linear-gradient(180deg, rgba(16,26,32,0.98), rgba(11,19,24,0.98));
    border:1px solid var(--ws-border); border-radius:24px; box-shadow:0 30px 70px rgba(0,0,0,0.46); animation:modal-in 0.2s ease;
  }
  @keyframes modal-in { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
  .modal-header { display:flex; justify-content:space-between; align-items:flex-start; padding:22px 24px 18px; border-bottom:1px solid var(--ws-border); }
  .modal-header h3 { margin:0; font-size:1.125rem; color:#f1f5f9; }
  .modal-subtitle { margin:4px 0 0; font-size:0.8125rem; color:var(--ws-muted); }
  .modal-close { background:none; border:none; color:var(--ws-soft); cursor:pointer; padding:8px; border-radius:10px; }
  .modal-close:hover { background:var(--ws-panel-2); color:#e2e8f0; }
  .modal-loading { padding:48px 24px; text-align:center; color:var(--ws-muted); }
  .modal-loading p { margin:12px 0 0; font-size:0.875rem; }

  /* Prepare Score Banner */
  .prep-score-banner { display:flex; align-items:center; gap:16px; padding:18px 24px; margin:0; border-bottom:1px solid var(--ws-border); }
  .prep-score-circle { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .prep-score-hi .prep-score-circle { background:rgba(77,179,138,0.15); border:2px solid var(--ws-success); }
  .prep-score-md .prep-score-circle { background:rgba(198,145,83,0.15); border:2px solid var(--ws-warm); }
  .prep-score-lo .prep-score-circle { background:rgba(194,120,120,0.15); border:2px solid #c27878; }
  .prep-score-num { font-size:1rem; font-weight:700; }
  .prep-score-hi .prep-score-num { color:#84d4b2; }
  .prep-score-md .prep-score-num { color:#deb17a; }
  .prep-score-lo .prep-score-num { color:#efb4b4; }
  .prep-score-banner strong { display:block; font-size:0.875rem; color:#e2e8f0; }
  .prep-score-banner p { margin:2px 0 0; font-size:0.75rem; color:var(--ws-muted); }

  /* Prepare Tabs */
  .prep-tabs { display:flex; gap:6px; padding:0 24px 8px; border-bottom:1px solid var(--ws-border); flex-wrap:wrap; }
  .prep-tabs button {
    padding:10px 14px; font-size:0.75rem; color:var(--ws-soft); background:transparent;
    border:1px solid transparent; border-radius:999px; cursor:pointer; transition:all 0.15s;
  }
  .prep-tabs button:hover { color:#e2e8f0; }
  .prep-tab-active { color:var(--ws-accent-strong) !important; border-color:rgba(92,163,168,0.3) !important; background:rgba(92,163,168,0.08) !important; }

  /* Prepare Content */
  .prep-content { padding:20px 24px; min-height:200px; }
  .prep-tips { display:flex; flex-direction:column; gap:10px; }
  .prep-tip-item { display:flex; gap:10px; align-items:flex-start; }
  .prep-tip-bullet {
    width:8px; height:8px; border-radius:999px; background:var(--ws-accent-strong);
    flex-shrink:0; margin-top:6px; box-shadow:0 0 0 4px rgba(47,110,106,0.12);
  }
  .prep-tip-item p { margin:0; font-size:0.8125rem; color:#d3dde1; line-height:1.6; }

  .prep-skills { display:flex; flex-direction:column; gap:16px; }
  .prep-skill-group h4 { margin:0 0 8px; font-size:0.8125rem; color:#e2e8f0; }
  .prep-skill-tags { display:flex; flex-wrap:wrap; gap:6px; }
  .prep-skill-tag { padding:5px 12px; border-radius:999px; font-size:0.75rem; font-weight:600; }
  .prep-skill-matched { background:rgba(77,179,138,0.1); border:1px solid rgba(77,179,138,0.4); color:#84d4b2; }
  .prep-skill-missing { background:rgba(198,145,83,0.1); border:1px solid rgba(198,145,83,0.34); color:#deb17a; }
  .prep-skill-note { font-size:0.75rem; color:var(--ws-muted); margin:8px 0 0; }

  .prep-cover { }
  .prep-cover-text {
    white-space:pre-wrap; font-size:0.8125rem; color:#d3dde1; line-height:1.65;
    background:rgba(7,12,16,0.76); border:1px solid var(--ws-border); border-radius:16px;
    padding:18px; max-height:250px; overflow-y:auto;
  }
  .prep-cover-actions { display:flex; gap:8px; margin-top:12px; }

  .prep-btn-primary {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:9px 16px; border-radius:999px; background:var(--ws-accent);
    border:none; color:#fff; font-size:0.75rem; font-weight:700; cursor:pointer;
  }
  .prep-btn-primary:hover { background:#285e5a; }
  .prep-btn-secondary { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:9px 16px; border-radius:999px; background:transparent; border:1px solid var(--ws-border); color:var(--ws-muted); font-size:0.75rem; cursor:pointer; }
  .prep-btn-secondary:hover { border-color:var(--ws-accent); color:var(--ws-accent-strong); }

  .prep-actions { display:flex; gap:8px; padding:18px 24px; border-top:1px solid var(--ws-border); }
  .prep-btn-apply {
    display:inline-flex; align-items:center; gap:6px; padding:10px 24px; border-radius:999px;
    background:var(--ws-success); color:#072019; font-size:0.8125rem; font-weight:700; text-decoration:none; transition:all 0.15s;
  }
  .prep-btn-apply:hover { filter:brightness(1.03); }
  .prep-btn-save { padding:10px 20px; border-radius:999px; background:transparent; border:1px solid var(--ws-border); color:var(--ws-muted); font-size:0.8125rem; cursor:pointer; }
  .prep-btn-save:hover { border-color:var(--ws-accent); color:var(--ws-accent-strong); }

  /* Tailor Resume tab */
  .prep-tailor { display:flex; flex-direction:column; gap:16px; }
  .prep-tailor-loading { display:flex; align-items:center; gap:10px; padding:24px; color:var(--ws-muted); font-size:0.8125rem; }
  .prep-tailor-loading::before { content:""; width:18px; height:18px; border:2px solid rgba(92,163,168,0.26); border-top-color:var(--ws-accent); border-radius:50%; animation:spin 0.8s linear infinite; }
  .prep-tailor-section { margin-bottom:8px; }
  .prep-tailor-section h4 { margin:0 0 8px; font-size:0.8125rem; color:#e2e8f0; font-weight:600; }
  .prep-tailor-text { white-space:pre-wrap; font-size:0.8125rem; color:#d3dde1; line-height:1.65; background:rgba(7,12,16,0.76); border:1px solid var(--ws-border); border-radius:16px; padding:16px; }
  .prep-tailor-actions { display:flex; gap:8px; margin-top:8px; }
  .prep-tailor-empty { text-align:center; padding:32px; color:var(--ws-soft); font-size:0.8125rem; }

  /* ATS Keywords tab */
  .prep-ats { display:flex; flex-direction:column; gap:16px; }
  .prep-ats-score { display:flex; align-items:center; gap:14px; padding:18px; border-radius:18px; }
  .prep-ats-good { background:rgba(77,179,138,0.08); border:1px solid rgba(77,179,138,0.3); }
  .prep-ats-ok { background:rgba(198,145,83,0.08); border:1px solid rgba(198,145,83,0.3); }
  .prep-ats-low { background:rgba(194,120,120,0.08); border:1px solid rgba(194,120,120,0.24); }
  .prep-ats-score strong { font-size:1.5rem; }
  .prep-ats-good strong { color:#84d4b2; }
  .prep-ats-ok strong { color:#deb17a; }
  .prep-ats-low strong { color:#efb4b4; }
  .prep-ats-score span { font-size:0.8125rem; color:var(--ws-muted); }
  .prep-ats-section { margin-bottom:4px; }
  .prep-ats-section h4 { margin:0 0 8px; font-size:0.8125rem; color:#e2e8f0; }
  .prep-ats-tags { display:flex; flex-wrap:wrap; gap:6px; }
  .prep-ats-tag-match { padding:4px 12px; border-radius:999px; font-size:0.75rem; background:rgba(77,179,138,0.1); border:1px solid rgba(77,179,138,0.4); color:#84d4b2; }
  .prep-ats-tag-miss { padding:4px 12px; border-radius:999px; font-size:0.75rem; background:rgba(194,120,120,0.1); border:1px solid rgba(194,120,120,0.32); color:#efb4b4; }
  .prep-ats-suggestions { display:flex; flex-direction:column; gap:8px; }
  .prep-ats-suggestion { font-size:0.8125rem; color:#d3dde1; line-height:1.55; padding:12px 14px; background:rgba(7,12,16,0.76); border:1px solid var(--ws-border); border-radius:14px; }

  /* Job Board */
  .jb { max-width:920px; }
  .jb-title { font-size:1.4rem; font-weight:700; letter-spacing:-0.03em; margin:0 0 6px; color:#f1f5f9; }
  .jb-sub { color:var(--ws-muted); font-size:0.84rem; margin:0 0 20px; line-height:1.6; }
  .jb-search {
    display:flex; gap:10px; margin-bottom:20px; align-items:flex-end; flex-wrap:wrap;
    padding:18px; border-radius:20px; background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%), var(--ws-panel);
    border:1px solid var(--ws-border); box-shadow:0 14px 30px rgba(4,10,14,0.18);
  }
  .jb-field { display:flex; flex-direction:column; gap:4px; flex:1; min-width:180px; }
  .jb-field-sm { flex:0.4; min-width:120px; }
  .jb-field label { font-size:0.68rem; color:var(--ws-muted); font-weight:700; text-transform:uppercase; letter-spacing:0.12em; }
  .jb-field input { padding:11px 14px; border-radius:14px; background:#0c1318; border:1px solid var(--ws-border); color:#e2e8f0; font-size:0.84rem; }
  .jb-field input:focus { outline:none; border-color:var(--ws-accent); box-shadow:0 0 0 3px rgba(92,163,168,0.12); }
  .jb-search-btn { padding:11px 22px; border-radius:999px; background:var(--ws-accent); border:none; color:#fff; font-size:0.8125rem; font-weight:700; cursor:pointer; white-space:nowrap; box-shadow:0 12px 20px rgba(10,29,34,0.26); }
  .jb-search-btn:hover { background:#285e5a; transform:translateY(-1px); }
  .jb-search-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .jb-empty { text-align:center; padding:48px 20px; color:var(--ws-soft); }
  .jb-empty p { margin:12px 0 0; font-size:0.875rem; }
  .jb-result-count { font-size:0.8125rem; color:var(--ws-muted); margin-bottom:12px; padding:12px 14px; background:rgba(7,12,16,0.7); border-radius:14px; border:1px solid var(--ws-border); display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .jb-result-count strong { color:#e2e8f0; }
  .jb-result-sources { color:var(--ws-soft); font-size:0.75rem; }
  .jb-target-banner {
    display:flex; align-items:flex-end; justify-content:space-between; gap:14px; flex-wrap:wrap;
    margin-bottom:16px; padding:18px 20px; border-radius:18px;
    background:linear-gradient(135deg, rgba(18,30,36,0.96), rgba(24,39,49,0.9));
    border:1px solid rgba(92,163,168,0.14);
  }
  .jb-target-banner strong { display:block; margin:8px 0 6px; font-size:0.98rem; color:#f8fafc; }
  .jb-target-banner p { margin:0; max-width:620px; color:var(--ws-muted); font-size:0.82rem; line-height:1.6; }
  .jb-results { display:flex; flex-direction:column; gap:10px; }
  .jb-card {
    background:linear-gradient(180deg, rgba(255,255,255,0.018), transparent 18%), var(--ws-panel);
    border:1px solid var(--ws-border); border-radius:18px; padding:18px; transition:border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow:0 10px 24px rgba(4,10,14,0.14);
  }
  .jb-card:hover { border-color:var(--ws-border-strong); transform:translateY(-1px); box-shadow:0 18px 32px rgba(4,10,14,0.22); }
  .jb-card-exp { border-color:var(--ws-accent); }
  .jb-card-hi { border-left:3px solid var(--ws-success); }
  .jb-card-md { border-left:3px solid var(--ws-warm); }
  .jb-card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
  .jb-card-info h4 { margin:0 0 2px; font-size:1rem; color:#f1f5f9; letter-spacing:-0.015em; }
  .jb-company { font-size:0.8125rem; color:var(--ws-accent-strong); }
  .jb-meta { display:flex; gap:12px; margin-top:7px; font-size:0.6875rem; color:var(--ws-soft); flex-wrap:wrap; }
  .jb-meta span { display:flex; align-items:center; gap:3px; }
  .jb-source { background:rgba(255,255,255,0.03); padding:2px 8px; border-radius:999px; border:1px solid var(--ws-border); }
  .jb-score { padding:5px 12px; border-radius:12px; font-size:0.75rem; font-weight:700; letter-spacing:0.02em; white-space:nowrap; }
  .jb-score-hi { background:rgba(77,179,138,0.15); color:#84d4b2; border:1px solid rgba(77,179,138,0.28); }
  .jb-score-md { background:rgba(198,145,83,0.15); color:#deb17a; border:1px solid rgba(198,145,83,0.28); }
  .jb-score-lo { background:rgba(127,95,95,0.16); color:#efb4b4; border:1px solid rgba(194,120,120,0.24); }
  .jb-salary { color:#84d4b2 !important; font-weight:600; }
  .jb-type { color:#c5b4ef !important; }
  .jb-desc { font-size:0.8125rem; color:var(--ws-muted); margin:12px 0; line-height:1.58; }
  .jb-tags { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
  .jb-tag { padding:4px 12px; border-radius:999px; background:rgba(255,255,255,0.025); border:1px solid var(--ws-border); font-size:0.6875rem; color:var(--ws-muted); transition:border-color 0.15s; }
  .jb-tag:hover { border-color:var(--ws-accent); color:#cbd5e1; }
  .jb-actions { display:flex; gap:8px; flex-wrap:wrap; }
  .jb-prepare-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 20px; border-radius:999px; background:var(--ws-accent); border:none; color:#fff; font-size:0.8125rem; font-weight:700; cursor:pointer; transition:all 0.15s; box-shadow:0 10px 20px rgba(10,29,34,0.26); }
  .jb-prepare-btn:hover { background:#285e5a; transform:translateY(-1px); box-shadow:0 14px 24px rgba(10,29,34,0.34); }
  .jb-apply-btn { display:inline-flex; align-items:center; gap:4px; padding:7px 16px; border-radius:999px; background:transparent; border:1px solid rgba(77,179,138,0.34); color:#84d4b2; font-size:0.75rem; font-weight:700; text-decoration:none; transition:all 0.15s; }
  .jb-apply-btn:hover { background:rgba(77,179,138,0.08); }
  .jb-save-btn, .jb-detail-btn { padding:7px 14px; border-radius:999px; background:transparent; border:1px solid var(--ws-border); color:var(--ws-muted); font-size:0.75rem; cursor:pointer; transition:all 0.15s; }
  .jb-save-btn:hover, .jb-detail-btn:hover { border-color:var(--ws-accent); color:var(--ws-accent-strong); }
  .jb-target-active { border-color:var(--ws-accent); color:var(--ws-accent-strong); background:rgba(92,163,168,0.08); }
  .jb-full-desc { margin-top:12px; padding-top:12px; border-top:1px solid #1a1f2e; }
  .jb-full-desc p { font-size:0.8125rem; color:#d3dde1; line-height:1.65; white-space:pre-wrap; margin:0; }

  /* Tracker Kanban */
  .tk { }
  .tk-title { font-size:1.35rem; font-weight:700; letter-spacing:-0.03em; margin:0 0 6px; }
  .tk-sub { color:var(--ws-muted); font-size:0.84rem; margin:0 0 20px; line-height:1.6; }
  .tk-empty-state { text-align:center; padding:60px 20px; color:var(--ws-soft); }
  .tk-empty-state h3 { margin:16px 0 8px; color:var(--ws-muted); font-size:1rem; }
  .tk-empty-state p { font-size:0.8125rem; max-width:400px; margin:0 auto; }
  .tk-board { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .tk-col { background:linear-gradient(180deg, rgba(255,255,255,0.018), transparent 18%), var(--ws-panel); border:1px solid var(--ws-border); border-radius:18px; min-height:300px; box-shadow:0 10px 24px rgba(4,10,14,0.14); }
  .tk-col-header { padding:12px 14px; font-size:0.8125rem; font-weight:600; border-bottom:2px solid; display:flex; justify-content:space-between; align-items:center; }
  .tk-count { background:rgba(255,255,255,0.03); padding:2px 8px; border-radius:999px; font-size:0.6875rem; color:var(--ws-soft); border:1px solid var(--ws-border); }
  .tk-col-body { padding:8px; display:flex; flex-direction:column; gap:6px; }
  .tk-card { background:var(--ws-panel-2); border:1px solid var(--ws-border); border-radius:14px; padding:12px; transition:border-color 0.15s, transform 0.15s; }
  .tk-card:hover { border-color:var(--ws-border-strong); transform:translateY(-1px); }
  .tk-card strong { font-size:0.8125rem; color:#e2e8f0; display:block; margin-bottom:2px; }
  .tk-card-co { font-size:0.6875rem; color:var(--ws-muted); display:block; }
  .tk-card-loc { font-size:0.625rem; color:var(--ws-soft); display:block; margin-top:2px; }
  .tk-card-salary { font-size:0.625rem; color:#84d4b2; display:block; margin-top:1px; }
  .tk-card-date { font-size:0.5625rem; color:#55656d; display:block; margin-top:4px; }
  .tk-note { display:flex; align-items:flex-start; gap:6px; font-size:0.6875rem; color:var(--ws-muted); margin-top:6px; padding:8px 10px; background:rgba(8,15,19,0.74); border-radius:10px; cursor:pointer; line-height:1.45; border:1px solid rgba(255,255,255,0.03); }
  .tk-note:hover { background:#131e24; }
  .tk-note-edit { margin-top:6px; }
  .tk-note-edit textarea { width:100%; padding:10px; border-radius:10px; background:#080f13; border:1px solid var(--ws-border); color:#e2e8f0; font-size:0.75rem; resize:none; outline:none; font-family:inherit; }
  .tk-note-edit textarea:focus { border-color:var(--ws-accent); }
  .tk-note-btns { display:flex; gap:4px; margin-top:4px; }
  .tk-note-btns button { padding:4px 10px; border-radius:999px; border:1px solid var(--ws-border); background:transparent; color:var(--ws-muted); font-size:0.625rem; cursor:pointer; }
  .tk-note-btns button:first-child { background:var(--ws-accent); border-color:transparent; color:#fff; }
  .tk-card-actions { display:flex; gap:4px; margin-top:8px; flex-wrap:wrap; }
  .tk-card-actions button, .tk-link-btn { padding:4px 10px; border-radius:999px; border:1px solid var(--ws-border); background:transparent; color:var(--ws-muted); font-size:0.625rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; text-decoration:none; }
  .tk-card-actions button:hover, .tk-link-btn:hover { border-color:var(--ws-accent); color:var(--ws-accent-strong); }
  .tk-remove { color:#ef4444 !important; border-color:#3b1a1a !important; }
  .tk-remove:hover { background:rgba(239,68,68,0.1) !important; }
  .tk-empty { text-align:center; padding:20px; color:var(--ws-soft); font-size:0.75rem; }

  /* Cover Letter */
  .cl { max-width:760px; }
  .cl-title { font-size:1.3rem; font-weight:700; letter-spacing:-0.03em; margin:0 0 6px; }
  .cl-sub { color:var(--ws-muted); font-size:0.84rem; margin:0 0 20px; line-height:1.6; }
  .cl-fields {
    display:flex; gap:10px; margin-bottom:20px; align-items:flex-end; flex-wrap:wrap;
    padding:18px; border-radius:20px; background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%), var(--ws-panel);
    border:1px solid var(--ws-border);
  }
  .cl-field { display:flex; flex-direction:column; gap:4px; flex:1; min-width:150px; }
  .cl-field label { font-size:0.68rem; color:var(--ws-muted); font-weight:700; text-transform:uppercase; letter-spacing:0.12em; }
  .cl-field input { padding:11px 14px; border-radius:14px; background:#0c1318; border:1px solid var(--ws-border); color:#e2e8f0; font-size:0.84rem; outline:none; }
  .cl-field input:focus { border-color:var(--ws-accent); box-shadow:0 0 0 3px rgba(92,163,168,0.12); }
  .cl-generate-btn { padding:11px 22px; border-radius:999px; background:var(--ws-accent); border:none; color:#fff; font-size:0.8125rem; font-weight:700; cursor:pointer; white-space:nowrap; display:flex; align-items:center; gap:6px; box-shadow:0 12px 20px rgba(10,29,34,0.26); }
  .cl-generate-btn:hover { opacity:0.9; }
  .cl-generate-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .cl-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:cospin 0.7s linear infinite; }
  .cl-editor { margin-bottom:16px; }
  .cl-editor textarea { width:100%; padding:18px; border-radius:18px; background:linear-gradient(180deg, rgba(255,255,255,0.018), transparent 18%), var(--ws-panel); border:1px solid var(--ws-border); color:#e2e8f0; font-size:0.8325rem; line-height:1.7; resize:vertical; outline:none; font-family:inherit; min-height:320px; box-shadow:0 14px 30px rgba(4,10,14,0.18); }
  .cl-editor textarea:focus { border-color:var(--ws-accent); box-shadow:0 0 0 3px rgba(92,163,168,0.12); }
  .cl-editor textarea::placeholder { color:#55656d; }
  .cl-actions { display:flex; gap:8px; }
  .cl-btn-primary { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 18px; border-radius:999px; background:var(--ws-accent); border:none; color:#fff; font-size:0.8125rem; font-weight:700; cursor:pointer; }
  .cl-btn-primary:hover { opacity:0.94; }
  .cl-btn-secondary { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 18px; border-radius:999px; background:transparent; border:1px solid var(--ws-border); color:var(--ws-muted); font-size:0.8125rem; cursor:pointer; }
  .cl-btn-secondary:hover { border-color:var(--ws-accent); color:var(--ws-accent-strong); }

  /* Settings */
  .sp { max-width:600px; }
  .sp-title { font-size:1.25rem; font-weight:700; margin:0 0 20px; }
  .sp-card { background:linear-gradient(180deg, rgba(255,255,255,0.018), transparent 18%), var(--ws-panel); border:1px solid var(--ws-border); border-radius:18px; padding:22px; margin-bottom:14px; box-shadow:0 10px 24px rgba(4,10,14,0.14); }
  .sp-card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
  .sp-card-header h3 { font-size:0.98rem; margin:0; color:#e2e8f0; }
  .sp-edit-btn { padding:6px 12px; border-radius:999px; background:transparent; border:1px solid var(--ws-border); color:var(--ws-muted); font-size:0.6875rem; cursor:pointer; }
  .sp-edit-btn:hover { border-color:var(--ws-accent); color:var(--ws-accent-strong); }
  .sp-grid { display:flex; flex-direction:column; gap:10px; }
  .sp-item { display:flex; justify-content:space-between; font-size:0.8125rem; }
  .sp-label { color:var(--ws-muted); }
  .sp-edit-form { display:flex; flex-direction:column; gap:12px; }
  .sp-field { display:flex; flex-direction:column; gap:4px; }
  .sp-field label { font-size:0.68rem; color:var(--ws-muted); font-weight:700; text-transform:uppercase; letter-spacing:0.12em; }
  .sp-field input { padding:10px 14px; border-radius:14px; background:#080f13; border:1px solid var(--ws-border); color:#e2e8f0; font-size:0.8125rem; outline:none; }
  .sp-field input:focus { border-color:var(--ws-accent); box-shadow:0 0 0 3px rgba(92,163,168,0.12); }
  .sp-disabled { opacity:0.5; cursor:not-allowed; }
  .sp-edit-actions { display:flex; gap:8px; margin-top:4px; }
  .sp-status { font-size:0.8125rem; color:var(--ws-muted); margin:0 0 12px; }
  .sp-resume-info { display:flex; gap:16px; font-size:0.75rem; color:var(--ws-muted); margin-bottom:12px; flex-wrap:wrap; }
  .sp-data-desc { font-size:0.8125rem; color:var(--ws-muted); margin:0 0 12px; }
  .sp-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 18px; border-radius:999px; background:var(--ws-accent); border:none; color:#fff; font-size:0.8125rem; font-weight:700; cursor:pointer; }
  .sp-btn:hover { background:#285e5a; }
  .sp-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .sp-btn-cancel { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 18px; border-radius:999px; background:transparent; border:1px solid var(--ws-border); color:var(--ws-muted); font-size:0.8125rem; cursor:pointer; }
  .sp-btn-cancel:hover { border-color:#ef4444; color:#f87171; }
  .sp-btn-outline { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 18px; border-radius:999px; background:transparent; border:1px solid var(--ws-border); color:var(--ws-muted); font-size:0.8125rem; cursor:pointer; }
  .sp-btn-outline:hover { border-color:var(--ws-accent); color:var(--ws-accent-strong); }

  /* ─── Mobile / Tablet Shell ─── */
  @media (max-width: 900px) {
    .ws {
      display:block;
      height:auto;
      min-height:100dvh;
      overflow-y:auto;
      overflow-x:hidden;
    }
    .ws-sidebar { display:none; }
    .ws-mobile-shell {
      display:flex;
      flex-direction:column;
      gap:12px;
      position:sticky;
      top:0;
      z-index:12;
      padding:12px 12px 0;
      background:linear-gradient(180deg, rgba(9,17,21,0.98), rgba(9,17,21,0.9), rgba(9,17,21,0.72), transparent);
      backdrop-filter:blur(18px);
    }
    .ws-main { min-height:auto; }
    .ws-header { display:none; }
    .ws-mobile-topbar { align-items:flex-start; }
    .ws-content {
      display:block;
      overflow:visible;
    }
    .ws-panel {
      overflow:visible;
      padding:16px 12px 18px;
    }
    .ws-statusbar { display:none; }
    .ws-copilot {
      position: fixed; top: 0; right: 0; bottom: 0; left: 0;
      width: 100% !important; z-index: 30; border-left: none;
    }
    .ws-user-pill span { display: none; }
    .ws-mobile-actions { gap:6px; flex-wrap:wrap; justify-content:flex-end; }
    .ws-mobile-actions .ws-side-icon { width:40px; height:40px; }
    .ws-mobile-objective-actions > * { flex:1; }
    .wf-grid, .wf-panel-grid, .ts-grid { grid-template-columns: 1fr; }
    .wf-hero, .ts-hero { padding: 22px 18px; }
    .wf-hero h2, .ts-empty h2, .ts-hero h2 { font-size: 1.45rem; }
    .wf-match-item { padding: 12px 14px; }

    /* Job Board mobile */
    .jb-search { flex-direction: column; gap: 8px; }
    .jb-field, .jb-field-sm { min-width: 100%; }
    .jb-search-btn { width: 100%; }
    .jb-card-top { flex-direction: column; gap: 8px; }
    .jb-card-right { align-self: flex-start; }
    .jb-meta { flex-wrap: wrap; }
    .jb-actions { flex-wrap: wrap; gap: 6px; }
    .jb-tags { flex-wrap: wrap; }
    .jb-target-banner { padding: 16px; }

    /* Tracker mobile */
    .tk-board { grid-template-columns: 1fr 1fr; gap: 10px; }
    .tk-card { padding: 10px; }
    .tk-title { font-size: 1.1rem; }

    /* Modal mobile */
    .modal-overlay { padding: 0; align-items: flex-end; }
    .modal-prepare { max-width: 100%; margin: 0; border-radius: 20px 20px 0 0; max-height: 92vh; }
    .prep-tabs { overflow-x: auto; gap: 4px; padding-bottom: 8px; flex-wrap: nowrap; }
    .prep-tabs button { white-space: nowrap; font-size: 0.7rem; padding: 6px 10px; }
    .prep-score-banner, .prep-content, .prep-actions, .modal-header { padding-left: 18px; padding-right: 18px; }
    .prep-actions { flex-direction: column; }
    .prep-actions > * { width: 100%; justify-content: center; }

    /* Cover Letter mobile */
    .cl-fields { flex-direction: column; }
    .cl-field { min-width: 100%; }
    .cl-actions { flex-direction: column; }
    .cl-actions > * { width: 100%; justify-content: center; }

    /* Settings mobile */
    .sp-form { padding: 16px; }
    .sp-grid { grid-template-columns: 1fr; }
  }

  /* ─── Mobile: Phone ─── */
  @media (max-width: 480px) {
    .ws-mobile-shell { padding: 10px 10px 0; }
    .ws-mobile-brand { min-width:0; }
    .ws-mobile-brand-copy { min-width:0; }
    .ws-mobile-objective { padding: 14px; }
    .ws-mobile-objective strong { font-size: 0.92rem; }
    .ws-mobile-objective p { font-size: 0.76rem; }
    .ws-mobile-actions { max-width: 188px; }
    .ws-mobile-objective-actions { flex-direction:column; }
    .ws-mobile-objective-actions > * { width:100%; justify-content:center; }
    .ws-stage-btn { padding: 10px; min-width: 188px; flex-basis: 188px; min-height: 78px; }
    .ws-panel { padding: 10px; }
    .wf-hero, .ts-hero, .ts-empty { padding: 18px 14px; }
    .wf-card, .wf-panel, .ts-card, .jb-search, .sp-card { border-radius: 18px; }

    /* Job Board phone */
    .jb-card { padding: 12px; }
    .jb-card h4 { font-size: 0.875rem; }
    .jb-actions { flex-direction: column; }
    .jb-actions > * { width: 100%; text-align: center; justify-content: center; }
    .jb-prepare-btn, .jb-apply-btn, .jb-save-btn, .jb-detail-btn { padding: 10px; font-size: 0.8125rem; }
    .jb-target-banner { padding: 14px; }

    /* Tracker phone */
    .tk-board { grid-template-columns: 1fr; }
    .tk-col-header { font-size: 0.8125rem; }

    /* Modal phone */
    .modal-prepare { border-radius: 0; max-height: 100vh; }
    .prep-body { padding: 12px; }

    /* Settings phone */
    .sp-actions { flex-direction: column; }
    .sp-actions > * { width: 100%; }

    /* Toast phone */
    .toast-container { left: 10px; right: 10px; top: 10px; }
    .toast { min-width: 0; width: 100%; }
  }
`;
