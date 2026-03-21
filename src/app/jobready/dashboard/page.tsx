"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, GeneratedCV } from "@/context/AuthContext";
import ResumeWizard, { ResumeWizardHandle } from "@/components/jobready/ResumeWizard";
import AICopilot from "@/components/jobready/AICopilot";
import CommandPalette from "@/components/jobready/CommandPalette";
import {
  UserIcon, LogoutIcon, SearchIcon, DocumentIcon,
  LocationIcon, CheckIcon, ExternalLinkIcon, BriefcaseIcon,
  SettingsIcon, DownloadIcon, XIcon, SendIcon, PlusIcon,
  ArrowRightIcon,
} from "@/components/icons/Icons";
import { authApi, resumeApi, jobPrepareApi } from "@/lib/api/client";

type ViewType = "resume" | "jobs" | "tracker" | "settings" | "coverletter";

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

// ─── Toast System ────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
          <p>{t.message}</p>
          <button onClick={() => onDismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout, saveGeneratedCV } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>("resume");
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Shared state for cross-component communication
  const [jobCount, setJobCount] = useState(0);
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);
  const [coverLetterJob, setCoverLetterJob] = useState<JobResult | null>(null);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [resumeStep, setResumeStep] = useState(0);
  const [resumeData, setResumeData] = useState<Record<string, unknown>>({});
  const wizardHandleRef = useRef<ResumeWizardHandle | null>(null);

  // Load tracked jobs from localStorage
  useEffect(() => {
    setTrackedJobs(JSON.parse(localStorage.getItem("jr_tracked") || "[]"));
  }, []);

  // Persist tracked jobs
  const updateTrackedJobs = useCallback((jobs: TrackedJob[]) => {
    setTrackedJobs(jobs);
    localStorage.setItem("jr_tracked", JSON.stringify(jobs));
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
    const id = `t_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const saveToTracker = useCallback((job: JobResult) => {
    const tracked: TrackedJob[] = JSON.parse(localStorage.getItem("jr_tracked") || "[]");
    if (tracked.find(t => t.id === job.id)) {
      addToast("Already in tracker", "info");
      return;
    }
    const updated = [...tracked, {
      id: job.id, title: job.title, company: job.company, url: job.url,
      location: job.location, salary: job.salary, source: job.source,
      status: "saved" as const, addedAt: new Date().toISOString(),
      notes: "", description: job.description,
    }];
    updateTrackedJobs(updated);
    addToast(`Saved "${job.title}" to tracker`, "success");
  }, [addToast, updateTrackedJobs]);

  const openCoverLetter = useCallback((job: JobResult, text: string) => {
    setCoverLetterJob(job);
    setCoverLetterText(text);
    setActiveView("coverletter");
  }, []);

  // ── Copilot action handlers ──────────────────────────────────────────
  const handleCopilotNavigate = useCallback((view: string) => {
    if (["resume", "jobs", "tracker", "settings", "coverletter"].includes(view)) {
      setActiveView(view as ViewType);
    }
  }, []);

  const handleCopilotUpdateField = useCallback((field: string, value: unknown) => {
    const handle = wizardHandleRef.current;
    if (handle) {
      handle.setField(field, value);
      addToast(`Updated ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`, "success");
    }
  }, [addToast]);

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
      default:
        console.log("Unknown copilot action:", action, payload);
    }
  }, []);

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

  const cmdActions = [
    { id: "resume", label: "Go to Resume Builder", icon: "📄", action: () => setActiveView("resume") },
    { id: "jobs", label: "Search for Jobs", icon: "💼", action: () => setActiveView("jobs") },
    { id: "tracker", label: "Application Tracker", icon: "📊", action: () => setActiveView("tracker") },
    { id: "settings", label: "Settings & Profile", icon: "⚙", action: () => setActiveView("settings") },
    { id: "coverletter", label: "Cover Letter Generator", icon: "✉️", action: () => { setCoverLetterJob(null); setCoverLetterText(""); setActiveView("coverletter"); } },
    { id: "copilot", label: copilotOpen ? "Hide AI Copilot" : "Show AI Copilot", icon: "🤖", action: () => setCopilotOpen(p => !p) },
    { id: "download", label: "Download Resume as PDF", icon: "📥", action: () => { setActiveView("resume"); addToast("Navigate to Resume Preview to download PDF", "info"); } },
    { id: "logout", label: "Sign Out", icon: "🚪", action: () => { logout(); router.push("/jobready"); } },
  ];

  const sidebarItems: { id: ViewType; icon: React.ReactNode; label: string }[] = [
    { id: "resume", icon: <DocumentIcon size={20} />, label: "Resume" },
    { id: "jobs", icon: <BriefcaseIcon size={20} />, label: "Jobs" },
    { id: "tracker", icon: <SearchIcon size={20} />, label: "Tracker" },
    { id: "coverletter", icon: <SendIcon size={16} />, label: "Cover Letter" },
    { id: "settings", icon: <SettingsIcon size={20} />, label: "Settings" },
  ];

  return (
    <>
      <style>{workspaceCSS}</style>
      <div className="ws">
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="ws-sidebar">
          <div className="ws-logo" title="JobReady.ai">⚡</div>
          {sidebarItems.map(item => (
            <button key={item.id} className={`ws-side-btn ${activeView === item.id ? "ws-side-active" : ""}`}
              onClick={() => setActiveView(item.id)} title={item.label}>
              {item.icon}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className={`ws-side-btn ${copilotOpen ? "ws-side-active" : ""}`}
            onClick={() => setCopilotOpen(p => !p)} title="AI Copilot">
            <span style={{ fontSize: 18 }}>🤖</span>
          </button>
          <button className="ws-side-btn" onClick={() => { logout(); router.push("/jobready"); }} title="Sign out">
            <LogoutIcon size={18} />
          </button>
        </aside>

        {/* ── Main Area ────────────────────────────────────────── */}
        <div className="ws-main">
          {/* Tab Bar */}
          <div className="ws-tabbar">
            <div className="ws-tabs">
              {sidebarItems.filter(i => i.id === activeView).map(i => (
                <div key={i.id} className="ws-tab ws-tab-active">
                  {i.icon}<span>{i.label}</span>
                </div>
              ))}
            </div>
            <div className="ws-tabbar-right">
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
              {activeView === "resume" && (
                <ResumeWizard
                  onNavigateToSearch={() => setActiveView("jobs")}
                  onStepChange={setResumeStep}
                  onDataChange={(d) => setResumeData(d as unknown as Record<string, unknown>)}
                  handleRef={(h) => { wizardHandleRef.current = h; }}
                />
              )}
              {activeView === "jobs" && (
                <JobBoard
                  user={user}
                  onSaveToTracker={saveToTracker}
                  onJobCountChange={setJobCount}
                  onOpenCoverLetter={openCoverLetter}
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
                  addToast={addToast}
                />
              )}
              {activeView === "coverletter" && (
                <CoverLetterGenerator
                  job={coverLetterJob}
                  initialText={coverLetterText}
                  cvData={user.cvData}
                  addToast={addToast}
                />
              )}
            </div>

            {/* AI Copilot */}
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

// ─── Prepare to Apply Modal ─────────────────────────────────────────────────

function PrepareModal({
  job, cvData, onClose, onSaveToTracker, onOpenCoverLetter, addToast,
}: {
  job: JobResult;
  cvData: GeneratedCV | null | undefined;
  onClose: () => void;
  onSaveToTracker: (job: JobResult) => void;
  onOpenCoverLetter: (job: JobResult, text: string) => void;
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
          setData(result.data);
        } else {
          const skills = cvData?.skills || [];
          const desc = `${job.title} ${job.description}`.toLowerCase();
          const matched = skills.filter(s => desc.includes(s.toLowerCase()));
          const missing = skills.filter(s => !desc.includes(s.toLowerCase())).slice(0, 3);
          setData({
            aiTips: "Tailor your resume to match this role. Highlight relevant experience and quantify your achievements.",
            matchedSkills: matched,
            missingSkills: missing,
            matchScore: skills.length > 0 ? Math.round((matched.length / skills.length) * 100) : 0,
            coverLetterSnippet: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${job.title} position at ${job.company}.\n\nWith my experience in ${matched.slice(0, 3).join(", ") || "relevant technologies"}, I am confident I can contribute meaningfully to your team.\n\nI would welcome the opportunity to discuss how my background aligns with your needs.\n\nBest regards,\n${cvData?.personalInfo?.name || "Your Name"}`,
          });
        }
      } catch {
        setData(null);
      }
      setLoading(false);
    };
    load();
  }, [job, cvData]);

  // ── Per-Job Resume Tailoring ──
  const tailorResume = async () => {
    if (!cvData) return;
    setIsTailoring(true);
    try {
      const result = await resumeApi.chat(
        `Tailor this resume for the following job. Return a JSON object with two keys: "summary" (a 2-3 sentence professional summary tailored for this role) and "skills" (an array of skills reordered/augmented to match this job).

Job: ${job.title} at ${job.company}
Job Description: ${job.description?.slice(0, 2000) || "Not provided"}

Current Resume:
Name: ${cvData.personalInfo?.name}
Summary: ${cvData.summary}
Skills: ${cvData.skills?.join(", ")}
Experience: ${cvData.experience?.map(e => `${e.title} at ${e.company}: ${e.highlights?.join("; ")}`).join(" | ")}

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
    } catch { /* silent */ }
    setIsTailoring(false);
  };

  const applyTailoredResume = () => {
    if (!cvData) return;
    const updated = { ...cvData };
    if (tailoredSummary) updated.summary = tailoredSummary;
    if (tailoredSkills) updated.skills = tailoredSkills;
    saveGeneratedCV(updated);
    resumeApi.save(updated as unknown as Record<string, unknown>, "tailored").catch(() => {});
    addToast(`Resume tailored for ${job.title} at ${job.company}`, "success");
  };

  // ── ATS Keyword Gap Analysis ──
  const analyzeAtsKeywords = async () => {
    if (!cvData) return;
    setIsAnalyzingAts(true);
    try {
      const result = await resumeApi.chat(
        `Analyze ATS keyword match between this resume and job posting. Return a JSON object with: "matched" (array of keywords found in both), "missing" (array of important keywords from job NOT in resume), "score" (0-100 ATS compatibility score), "suggestions" (array of 3-5 specific rewrite suggestions to improve ATS score).

Job: ${job.title} at ${job.company}
Job Description: ${job.description?.slice(0, 2000) || "Not provided"}

Resume Skills: ${cvData.skills?.join(", ")}
Resume Summary: ${cvData.summary}
Resume Experience: ${cvData.experience?.map(e => `${e.title}: ${e.highlights?.join("; ")}`).join(" | ")}

Return ONLY valid JSON: {"matched": [...], "missing": [...], "score": number, "suggestions": [...]}`,
        "chat",
      );
      if (result.data?.reply) {
        try {
          const cleaned = result.data.reply.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
          const parsed = JSON.parse(cleaned);
          setAtsKeywords({
            matched: parsed.matched || [],
            missing: parsed.missing || [],
            score: parsed.score || 0,
            suggestions: parsed.suggestions || [],
          });
        } catch {
          setAtsKeywords({ matched: [], missing: [], score: 0, suggestions: [result.data.reply] });
        }
      }
    } catch { /* silent */ }
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
              <button className={activeTab === "tips" ? "prep-tab-active" : ""} onClick={() => setActiveTab("tips")}>💡 Tips</button>
              <button className={activeTab === "skills" ? "prep-tab-active" : ""} onClick={() => setActiveTab("skills")}>🎯 Skills</button>
              <button className={activeTab === "tailor" ? "prep-tab-active" : ""} onClick={() => { setActiveTab("tailor"); if (!tailoredSummary && !isTailoring) tailorResume(); }}>📝 Tailor Resume</button>
              <button className={activeTab === "ats" ? "prep-tab-active" : ""} onClick={() => { setActiveTab("ats"); if (!atsKeywords && !isAnalyzingAts) analyzeAtsKeywords(); }}>📊 ATS Keywords</button>
              <button className={activeTab === "cover" ? "prep-tab-active" : ""} onClick={() => setActiveTab("cover")}>✉ Cover Letter</button>
            </div>

            <div className="prep-content">
              {activeTab === "tips" && (
                <div className="prep-tips">
                  {data.aiTips.split("\n").filter(Boolean).map((tip, i) => (
                    <div key={i} className="prep-tip-item">
                      <span className="prep-tip-bullet">→</span>
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
                      <p className="prep-skill-note">These skills weren&apos;t found in the job description.</p>
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
                          ✓ Apply to My Resume
                        </button>
                        <button className="prep-btn-secondary" onClick={tailorResume}>
                          ↻ Regenerate
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="prep-tailor-empty">
                      <p>Click to generate a tailored version of your resume for this specific job.</p>
                      <button className="prep-btn-primary" onClick={tailorResume}>📝 Tailor My Resume</button>
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
                            <div key={i} className="prep-tip-item"><span className="prep-tip-bullet">→</span><p>{s}</p></div>
                          ))}
                        </div>
                      )}
                      <button className="prep-btn-secondary" style={{ marginTop: 12 }} onClick={analyzeAtsKeywords}>↻ Re-analyze</button>
                    </>
                  ) : (
                    <div className="prep-tailor-empty">
                      <p>Analyze how well your resume keywords match this job for ATS systems.</p>
                      <button className="prep-btn-primary" onClick={analyzeAtsKeywords}>📊 Analyze Keywords</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "cover" && (
                <div className="prep-cover">
                  <div className="prep-cover-text">{data.coverLetterSnippet}</div>
                  <div className="prep-cover-actions">
                    <button className="prep-btn-primary" onClick={() => { onOpenCoverLetter(job, data.coverLetterSnippet); onClose(); }}>
                      ✏ Edit in Cover Letter Builder
                    </button>
                    <button className="prep-btn-secondary" onClick={() => { navigator.clipboard.writeText(data.coverLetterSnippet); addToast("Cover letter copied!", "success"); }}>
                      📋 Copy
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
  user, onSaveToTracker, onJobCountChange, onOpenCoverLetter, addToast,
}: {
  user: { cvData?: GeneratedCV | null; name: string; email: string };
  onSaveToTracker: (job: JobResult) => void;
  onJobCountChange: (count: number) => void;
  onOpenCoverLetter: (job: JobResult, text: string) => void;
  addToast: (msg: string, type: Toast["type"]) => void;
}) {
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [prepareJob, setPrepareJob] = useState<JobResult | null>(null);
  const skills = user.cvData?.skills?.join(", ") || "";
  const loc = user.cvData?.personalInfo?.location || "";
  const [skillsInput, setSkillsInput] = useState(skills);
  const [locationInput, setLocationInput] = useState(loc);

  useEffect(() => { if (skills && !hasSearched) handleSearch(); }, []); // eslint-disable-line

  const handleSearch = async () => {
    if (!skillsInput.trim()) return;
    setIsSearching(true);
    try {
      const r = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skillsInput, location: locationInput, preferences: locationInput }),
      });
      if (r.ok) {
        const d = await r.json();
        const results = d.jobs || [];
        setJobs(results);
        onJobCountChange(results.length);
      }
    } catch { /* */ }
    setHasSearched(true);
    setIsSearching(false);
  };

  const getMatchScore = (job: JobResult) => {
    if (!user.cvData?.skills?.length) return 0;
    const desc = `${job.title} ${job.description} ${job.tags?.join(" ") || ""}`.toLowerCase();
    return Math.round((user.cvData.skills.filter(s => desc.includes(s.toLowerCase())).length / user.cvData.skills.length) * 100);
  };

  return (
    <div className="jb">
      <h2 className="jb-title">💼 Job Search</h2>
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
        <button className="jb-search-btn" onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>

      {!hasSearched && !skills && (
        <div className="jb-empty"><BriefcaseIcon size={40} color="#475569" /><p>Build your resume first, then your skills auto-search for matching jobs.</p></div>
      )}
      {hasSearched && jobs.length === 0 && <div className="jb-empty"><p>No jobs found. Try different keywords.</p></div>}

      {hasSearched && jobs.length > 0 && (
        <div className="jb-result-count">{jobs.length} jobs found from multiple sources</div>
      )}

      <div className="jb-results">
        {jobs.map(job => {
          const score = getMatchScore(job);
          const isExpanded = expandedJob === job.id;
          return (
            <div key={job.id} className={`jb-card ${isExpanded ? "jb-card-exp" : ""}`}>
              <div className="jb-card-top">
                <div className="jb-card-info">
                  <h4>{job.title}</h4>
                  <span className="jb-company">{job.company}</span>
                  <div className="jb-meta">
                    <span><LocationIcon size={12} /> {job.location}</span>
                    {job.salary && <span>💰 {job.salary}</span>}
                    {job.postedAt && <span>🕐 {job.postedAt}</span>}
                    <span className="jb-source">{job.source}</span>
                  </div>
                </div>
                <div className="jb-card-right">
                  {score > 0 && <span className={`jb-score ${score >= 60 ? "jb-score-hi" : score >= 30 ? "jb-score-md" : "jb-score-lo"}`}>{score}% match</span>}
                </div>
              </div>
              <p className="jb-desc">{job.description?.slice(0, 200)}...</p>
              {job.tags?.length ? <div className="jb-tags">{job.tags.slice(0, 6).map(t => <span key={t} className="jb-tag">{t}</span>)}</div> : null}
              <div className="jb-actions">
                <button className="jb-prepare-btn" onClick={() => setPrepareJob(job)}>
                  🚀 Prepare to Apply
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

  const moveJob = (id: string, status: TrackedJob["status"]) => {
    const updated = trackedJobs.map(j => j.id === id ? { ...j, status } : j);
    onUpdate(updated);
    addToast(`Moved to ${status}`, "success");
  };

  const removeJob = (id: string) => {
    const updated = trackedJobs.filter(j => j.id !== id);
    onUpdate(updated);
    addToast("Removed from tracker", "info");
  };

  const saveNote = (id: string) => {
    const updated = trackedJobs.map(j => j.id === id ? { ...j, notes: noteText } : j);
    onUpdate(updated);
    setEditingNote(null);
    addToast("Note saved", "success");
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
      <h2 className="tk-title">📊 Application Tracker</h2>
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
                        <span>📝</span> {job.notes}
                      </div>
                    ) : null}

                    <div className="tk-card-actions">
                      {prevStatus[col.status] && (
                        <button onClick={() => moveJob(job.id, prevStatus[col.status])} title="Move back">←</button>
                      )}
                      {nextStatus[col.status] && (
                        <button onClick={() => moveJob(job.id, nextStatus[col.status])} title="Move forward">→</button>
                      )}
                      <button onClick={() => startEditNote(job)} title="Add note">📝</button>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="tk-link-btn" title="Open job posting">
                          <ExternalLinkIcon size={12} />
                        </a>
                      )}
                      <button onClick={() => removeJob(job.id)} className="tk-remove" title="Remove">✕</button>
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
  job, initialText, cvData, addToast,
}: {
  job: JobResult | null;
  initialText: string;
  cvData?: GeneratedCV | null;
  addToast: (msg: string, type: Toast["type"]) => void;
}) {
  const [text, setText] = useState(initialText || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobTitle, setJobTitle] = useState(job?.title || "");
  const [company, setCompany] = useState(job?.company || "");
  const textRef = useRef<HTMLTextAreaElement>(null);

  const generateLetter = async () => {
    if (!jobTitle.trim()) { addToast("Enter a job title first", "error"); return; }
    setIsGenerating(true);
    try {
      const result = await resumeApi.chat(
        `Write a professional, personalized cover letter for a ${jobTitle} position at ${company || "the company"}. Use my resume data to tailor it. Be specific about skills and experience. Keep it concise (3-4 paragraphs). Do not use placeholders — write the actual letter.`,
        "chat",
        { ...(cvData as unknown as Record<string, unknown> || {}), task: "cover_letter", jobTitle, company },
      );
      if (result.data?.reply) {
        setText(result.data.reply);
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
      <h2 className="cl-title">✉️ Cover Letter Generator</h2>
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
            "✨ Generate with AI"
          )}
        </button>
      </div>

      <div className="cl-editor">
        <textarea
          ref={textRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Your cover letter will appear here. You can also write or paste one manually."
          rows={18}
        />
      </div>

      {text && (
        <div className="cl-actions">
          <button className="cl-btn-primary" onClick={copyToClipboard}>📋 Copy</button>
          <button className="cl-btn-secondary" onClick={downloadAsText}>📥 Download .txt</button>
          <button className="cl-btn-secondary" onClick={() => { setText(""); addToast("Cleared", "info"); }}>🗑 Clear</button>
        </div>
      )}
    </div>
  );
}

// ─── Settings Panel ─────────────────────────────────────────────────────────

function SettingsPanel({
  user, onEditResume, addToast,
}: {
  user: { name: string; email: string; phone?: string; location?: string; cvGenerated?: boolean; cvData?: GeneratedCV | null; createdAt: string };
  onEditResume: () => void;
  addToast: (msg: string, type: Toast["type"]) => void;
}) {
  const { updateProfile, refreshUser } = useAuth();
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

  const exportData = () => {
    const data = {
      profile: { name: user.name, email: user.email, phone: user.phone, location: user.location },
      resume: user.cvData,
      applications: JSON.parse(localStorage.getItem("jr_tracked") || "[]"),
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

  return (
    <div className="sp">
      <h2 className="sp-title">⚙ Settings</h2>

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
        <p className="sp-status">{user.cvGenerated ? "✅ Resume created" : "⚠️ No resume yet"}</p>
        {user.cvGenerated && user.cvData && (
          <div className="sp-resume-info">
            <span>Skills: {user.cvData.skills?.length || 0}</span>
            <span>Experience: {user.cvData.experience?.length || 0} roles</span>
            <span>Education: {user.cvData.education?.length || 0} entries</span>
          </div>
        )}
        <button className="sp-btn" onClick={onEditResume}>{user.cvGenerated ? "Edit Resume" : "Create Resume"}</button>
      </div>

      {/* Data Export */}
      <div className="sp-card">
        <div className="sp-card-header">
          <h3>Data</h3>
        </div>
        <p className="sp-data-desc">Export all your JobReady data including profile, resume, and tracked applications.</p>
        <button className="sp-btn-outline" onClick={exportData}>📥 Export All Data</button>
      </div>
    </div>
  );
}

// ─── CSS ────────────────────────────────────────────────────────────────────

const workspaceCSS = `
  * { box-sizing: border-box; }
  .ws { display:flex; height:100vh; background:#06080d; color:#e2e8f0; font-family:'Inter','SF Pro',system-ui,sans-serif; overflow:hidden; }

  /* Sidebar */
  .ws-sidebar { width:56px; background:#0a0c12; border-right:1px solid #1a1f2e; display:flex; flex-direction:column; align-items:center; padding:12px 0; gap:4px; flex-shrink:0; z-index:10; }
  .ws-logo { font-size:1.25rem; margin-bottom:12px; cursor:default; }
  .ws-side-btn { width:40px; height:40px; border:none; border-radius:8px; background:transparent; color:#64748b; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; position:relative; }
  .ws-side-btn:hover { color:#e2e8f0; background:#111827; }
  .ws-side-active { color:#3b82f6 !important; background:#131a2b !important; }
  .ws-side-active::before { content:''; position:absolute; left:0; top:8px; bottom:8px; width:3px; border-radius:0 3px 3px 0; background:#3b82f6; }

  /* Main Area */
  .ws-main { flex:1; display:flex; flex-direction:column; min-width:0; }

  /* Tab Bar */
  .ws-tabbar { display:flex; align-items:center; justify-content:space-between; background:#0a0c12; border-bottom:1px solid #1a1f2e; padding:0 16px; height:40px; flex-shrink:0; }
  .ws-tabs { display:flex; gap:2px; }
  .ws-tab { display:flex; align-items:center; gap:6px; padding:8px 16px; font-size:0.75rem; color:#94a3b8; border-bottom:2px solid transparent; }
  .ws-tab-active { color:#e2e8f0; border-bottom-color:#3b82f6; }
  .ws-tabbar-right { display:flex; align-items:center; gap:10px; }
  .ws-cmd-btn { padding:4px 10px; border-radius:6px; background:#111827; border:1px solid #1e293b; color:#64748b; font-size:0.6875rem; font-family:monospace; font-weight:600; cursor:pointer; transition:all 0.15s; }
  .ws-cmd-btn:hover { border-color:#3b82f6; color:#60a5fa; }
  .ws-user-pill { display:flex; align-items:center; gap:6px; padding:4px 10px 4px 4px; border-radius:6px; background:#111827; }
  .ws-avatar { width:24px; height:24px; border-radius:6px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); color:#fff; font-size:0.625rem; font-weight:700; display:flex; align-items:center; justify-content:center; }
  .ws-user-pill span { font-size:0.75rem; color:#94a3b8; }

  /* Content */
  .ws-content { flex:1; display:flex; overflow:hidden; }
  .ws-panel { flex:1; overflow-y:auto; padding:24px 32px; min-width:0; }
  .ws-copilot { width:320px; flex-shrink:0; }

  /* Status Bar */
  .ws-statusbar { display:flex; justify-content:space-between; padding:0 16px; height:28px; align-items:center; background:#0a0c12; border-top:1px solid #1a1f2e; font-size:0.6875rem; font-family:'JetBrains Mono','Fira Code',monospace; color:#475569; flex-shrink:0; }
  .ws-status-left, .ws-status-right { display:flex; align-items:center; gap:8px; }
  .ws-status-sep { color:#1e293b; }
  .ws-status-dot { width:8px; height:8px; border-radius:50%; }
  .ws-dot-green { background:#22c55e; box-shadow:0 0 6px rgba(34,197,94,0.4); }
  .ws-dot-blue { background:#3b82f6; box-shadow:0 0 6px rgba(59,130,246,0.4); }

  /* Toast */
  .toast-container { position:fixed; top:16px; right:16px; z-index:200; display:flex; flex-direction:column; gap:8px; }
  .toast { display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:10px; background:#111827; border:1px solid #1e293b; color:#e2e8f0; font-size:0.8125rem; animation:toast-in 0.25s ease; min-width:280px; box-shadow:0 8px 24px rgba(0,0,0,0.4); }
  @keyframes toast-in { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  .toast span { font-size:1rem; flex-shrink:0; }
  .toast p { margin:0; flex:1; }
  .toast button { background:none; border:none; color:#64748b; cursor:pointer; font-size:1rem; padding:0 2px; }
  .toast-success { border-color:#22c55e40; }
  .toast-success span { color:#22c55e; }
  .toast-error { border-color:#ef444440; }
  .toast-error span { color:#ef4444; }
  .toast-info { border-color:#3b82f640; }
  .toast-info span { color:#3b82f6; }

  /* Prepare Modal */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; }
  .modal-prepare { width:100%; max-width:640px; max-height:85vh; overflow-y:auto; background:#0c0e14; border:1px solid #1e293b; border-radius:16px; box-shadow:0 24px 64px rgba(0,0,0,0.5); animation:modal-in 0.2s ease; }
  @keyframes modal-in { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
  .modal-header { display:flex; justify-content:space-between; align-items:flex-start; padding:20px 24px 16px; border-bottom:1px solid #1a1f2e; }
  .modal-header h3 { margin:0; font-size:1.125rem; color:#f1f5f9; }
  .modal-subtitle { margin:4px 0 0; font-size:0.8125rem; color:#64748b; }
  .modal-close { background:none; border:none; color:#64748b; cursor:pointer; padding:4px; border-radius:6px; }
  .modal-close:hover { background:#1e293b; color:#e2e8f0; }
  .modal-loading { padding:48px 24px; text-align:center; color:#64748b; }
  .modal-loading p { margin:12px 0 0; font-size:0.875rem; }

  /* Prepare Score Banner */
  .prep-score-banner { display:flex; align-items:center; gap:16px; padding:16px 24px; margin:0; border-bottom:1px solid #1a1f2e; }
  .prep-score-circle { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .prep-score-hi .prep-score-circle { background:rgba(34,197,94,0.15); border:2px solid #22c55e; }
  .prep-score-md .prep-score-circle { background:rgba(234,179,8,0.15); border:2px solid #eab308; }
  .prep-score-lo .prep-score-circle { background:rgba(239,68,68,0.15); border:2px solid #ef4444; }
  .prep-score-num { font-size:1rem; font-weight:700; }
  .prep-score-hi .prep-score-num { color:#22c55e; }
  .prep-score-md .prep-score-num { color:#eab308; }
  .prep-score-lo .prep-score-num { color:#ef4444; }
  .prep-score-banner strong { display:block; font-size:0.875rem; color:#e2e8f0; }
  .prep-score-banner p { margin:2px 0 0; font-size:0.75rem; color:#94a3b8; }

  /* Prepare Tabs */
  .prep-tabs { display:flex; gap:2px; padding:0 24px; border-bottom:1px solid #1a1f2e; }
  .prep-tabs button { padding:10px 16px; font-size:0.75rem; color:#64748b; background:none; border:none; border-bottom:2px solid transparent; cursor:pointer; transition:all 0.15s; }
  .prep-tabs button:hover { color:#e2e8f0; }
  .prep-tab-active { color:#3b82f6 !important; border-bottom-color:#3b82f6 !important; }

  /* Prepare Content */
  .prep-content { padding:20px 24px; min-height:200px; }
  .prep-tips { display:flex; flex-direction:column; gap:10px; }
  .prep-tip-item { display:flex; gap:10px; align-items:flex-start; }
  .prep-tip-bullet { color:#3b82f6; font-weight:700; flex-shrink:0; margin-top:2px; }
  .prep-tip-item p { margin:0; font-size:0.8125rem; color:#cbd5e1; line-height:1.5; }

  .prep-skills { display:flex; flex-direction:column; gap:16px; }
  .prep-skill-group h4 { margin:0 0 8px; font-size:0.8125rem; color:#e2e8f0; }
  .prep-skill-tags { display:flex; flex-wrap:wrap; gap:6px; }
  .prep-skill-tag { padding:4px 12px; border-radius:6px; font-size:0.75rem; font-weight:500; }
  .prep-skill-matched { background:rgba(34,197,94,0.1); border:1px solid #22c55e40; color:#22c55e; }
  .prep-skill-missing { background:rgba(234,179,8,0.1); border:1px solid #eab30840; color:#eab308; }
  .prep-skill-note { font-size:0.75rem; color:#64748b; margin:8px 0 0; }

  .prep-cover { }
  .prep-cover-text { white-space:pre-wrap; font-size:0.8125rem; color:#cbd5e1; line-height:1.6; background:#080a10; border:1px solid #1e293b; border-radius:8px; padding:16px; max-height:250px; overflow-y:auto; }
  .prep-cover-actions { display:flex; gap:8px; margin-top:12px; }

  .prep-btn-primary { padding:8px 16px; border-radius:8px; background:#3b82f6; border:none; color:#fff; font-size:0.75rem; font-weight:600; cursor:pointer; }
  .prep-btn-primary:hover { background:#2563eb; }
  .prep-btn-secondary { padding:8px 16px; border-radius:8px; background:transparent; border:1px solid #1e293b; color:#94a3b8; font-size:0.75rem; cursor:pointer; }
  .prep-btn-secondary:hover { border-color:#3b82f6; color:#60a5fa; }

  .prep-actions { display:flex; gap:8px; padding:16px 24px; border-top:1px solid #1a1f2e; }
  .prep-btn-apply { display:inline-flex; align-items:center; gap:6px; padding:10px 24px; border-radius:8px; background:#22c55e; color:#fff; font-size:0.8125rem; font-weight:600; text-decoration:none; transition:all 0.15s; }
  .prep-btn-apply:hover { background:#16a34a; }
  .prep-btn-save { padding:10px 20px; border-radius:8px; background:transparent; border:1px solid #1e293b; color:#94a3b8; font-size:0.8125rem; cursor:pointer; }
  .prep-btn-save:hover { border-color:#3b82f6; color:#60a5fa; }

  /* Tailor Resume tab */
  .prep-tailor { display:flex; flex-direction:column; gap:16px; }
  .prep-tailor-loading { display:flex; align-items:center; gap:10px; padding:24px; color:#94a3b8; font-size:0.8125rem; }
  .prep-tailor-loading::before { content:""; width:18px; height:18px; border:2px solid #3b82f640; border-top-color:#3b82f6; border-radius:50%; animation:spin 0.8s linear infinite; }
  .prep-tailor-section { margin-bottom:8px; }
  .prep-tailor-section h4 { margin:0 0 8px; font-size:0.8125rem; color:#e2e8f0; font-weight:600; }
  .prep-tailor-text { white-space:pre-wrap; font-size:0.8125rem; color:#cbd5e1; line-height:1.6; background:#080a10; border:1px solid #1e293b; border-radius:8px; padding:14px; }
  .prep-tailor-actions { display:flex; gap:8px; margin-top:8px; }
  .prep-tailor-empty { text-align:center; padding:32px; color:#475569; font-size:0.8125rem; }

  /* ATS Keywords tab */
  .prep-ats { display:flex; flex-direction:column; gap:16px; }
  .prep-ats-score { display:flex; align-items:center; gap:14px; padding:16px; border-radius:10px; }
  .prep-ats-good { background:rgba(34,197,94,0.08); border:1px solid #22c55e30; }
  .prep-ats-ok { background:rgba(234,179,8,0.08); border:1px solid #eab30830; }
  .prep-ats-low { background:rgba(239,68,68,0.08); border:1px solid #ef444430; }
  .prep-ats-score strong { font-size:1.5rem; }
  .prep-ats-good strong { color:#22c55e; }
  .prep-ats-ok strong { color:#eab308; }
  .prep-ats-low strong { color:#ef4444; }
  .prep-ats-score span { font-size:0.8125rem; color:#94a3b8; }
  .prep-ats-section { margin-bottom:4px; }
  .prep-ats-section h4 { margin:0 0 8px; font-size:0.8125rem; color:#e2e8f0; }
  .prep-ats-tags { display:flex; flex-wrap:wrap; gap:6px; }
  .prep-ats-tag-match { padding:4px 12px; border-radius:6px; font-size:0.75rem; background:rgba(34,197,94,0.1); border:1px solid #22c55e40; color:#22c55e; }
  .prep-ats-tag-miss { padding:4px 12px; border-radius:6px; font-size:0.75rem; background:rgba(239,68,68,0.1); border:1px solid #ef444440; color:#ef4444; }
  .prep-ats-suggestions { display:flex; flex-direction:column; gap:8px; }
  .prep-ats-suggestion { font-size:0.8125rem; color:#cbd5e1; line-height:1.5; padding:10px 14px; background:#080a10; border:1px solid #1e293b; border-radius:8px; }

  /* Job Board */
  .jb { max-width:800px; }
  .jb-title { font-size:1.25rem; font-weight:700; margin:0 0 4px; }
  .jb-sub { color:#64748b; font-size:0.8125rem; margin:0 0 20px; }
  .jb-search { display:flex; gap:10px; margin-bottom:20px; align-items:flex-end; flex-wrap:wrap; }
  .jb-field { display:flex; flex-direction:column; gap:4px; flex:1; min-width:180px; }
  .jb-field-sm { flex:0.4; min-width:120px; }
  .jb-field label { font-size:0.6875rem; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; }
  .jb-field input { padding:9px 12px; border-radius:8px; background:#0a0a0f; border:1px solid #1e293b; color:#e2e8f0; font-size:0.8125rem; }
  .jb-field input:focus { outline:none; border-color:#3b82f6; }
  .jb-search-btn { padding:9px 20px; border-radius:8px; background:#3b82f6; border:none; color:#fff; font-size:0.8125rem; font-weight:600; cursor:pointer; white-space:nowrap; }
  .jb-search-btn:hover { background:#2563eb; }
  .jb-search-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .jb-empty { text-align:center; padding:48px 20px; color:#475569; }
  .jb-empty p { margin:12px 0 0; font-size:0.875rem; }
  .jb-result-count { font-size:0.75rem; color:#64748b; margin-bottom:12px; padding:8px 12px; background:#0a0c12; border-radius:8px; border:1px solid #1a1f2e; }
  .jb-results { display:flex; flex-direction:column; gap:10px; }
  .jb-card { background:#0c0e14; border:1px solid #1a1f2e; border-radius:10px; padding:16px; transition:border-color 0.2s; }
  .jb-card:hover { border-color:#2d3748; }
  .jb-card-exp { border-color:#3b82f6; }
  .jb-card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
  .jb-card-info h4 { margin:0 0 2px; font-size:0.9375rem; color:#f1f5f9; }
  .jb-company { font-size:0.8125rem; color:#3b82f6; }
  .jb-meta { display:flex; gap:12px; margin-top:6px; font-size:0.6875rem; color:#64748b; flex-wrap:wrap; }
  .jb-meta span { display:flex; align-items:center; gap:3px; }
  .jb-source { background:#111827; padding:1px 8px; border-radius:4px; }
  .jb-score { padding:3px 10px; border-radius:12px; font-size:0.6875rem; font-weight:600; }
  .jb-score-hi { background:rgba(34,197,94,0.1); color:#22c55e; }
  .jb-score-md { background:rgba(234,179,8,0.1); color:#eab308; }
  .jb-score-lo { background:rgba(239,68,68,0.1); color:#f87171; }
  .jb-desc { font-size:0.8125rem; color:#94a3b8; margin:10px 0; line-height:1.5; }
  .jb-tags { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:10px; }
  .jb-tag { padding:2px 10px; border-radius:6px; background:#111827; border:1px solid #1e293b; font-size:0.6875rem; color:#94a3b8; }
  .jb-actions { display:flex; gap:8px; flex-wrap:wrap; }
  .jb-prepare-btn { display:inline-flex; align-items:center; gap:4px; padding:7px 16px; border-radius:8px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); border:none; color:#fff; font-size:0.75rem; font-weight:600; cursor:pointer; transition:all 0.15s; }
  .jb-prepare-btn:hover { opacity:0.9; transform:translateY(-1px); }
  .jb-apply-btn { display:inline-flex; align-items:center; gap:4px; padding:7px 16px; border-radius:8px; background:#22c55e; color:#fff; font-size:0.75rem; font-weight:600; text-decoration:none; transition:all 0.15s; }
  .jb-apply-btn:hover { background:#16a34a; }
  .jb-save-btn, .jb-detail-btn { padding:7px 14px; border-radius:8px; background:transparent; border:1px solid #1e293b; color:#94a3b8; font-size:0.75rem; cursor:pointer; transition:all 0.15s; }
  .jb-save-btn:hover, .jb-detail-btn:hover { border-color:#3b82f6; color:#60a5fa; }
  .jb-full-desc { margin-top:12px; padding-top:12px; border-top:1px solid #1a1f2e; }
  .jb-full-desc p { font-size:0.8125rem; color:#cbd5e1; line-height:1.6; white-space:pre-wrap; margin:0; }

  /* Tracker Kanban */
  .tk { }
  .tk-title { font-size:1.25rem; font-weight:700; margin:0 0 4px; }
  .tk-sub { color:#64748b; font-size:0.8125rem; margin:0 0 20px; }
  .tk-empty-state { text-align:center; padding:60px 20px; color:#475569; }
  .tk-empty-state h3 { margin:16px 0 8px; color:#94a3b8; font-size:1rem; }
  .tk-empty-state p { font-size:0.8125rem; max-width:400px; margin:0 auto; }
  .tk-board { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .tk-col { background:#0a0c12; border:1px solid #1a1f2e; border-radius:10px; min-height:300px; }
  .tk-col-header { padding:12px 14px; font-size:0.8125rem; font-weight:600; border-bottom:2px solid; display:flex; justify-content:space-between; align-items:center; }
  .tk-count { background:#111827; padding:2px 8px; border-radius:10px; font-size:0.6875rem; color:#64748b; }
  .tk-col-body { padding:8px; display:flex; flex-direction:column; gap:6px; }
  .tk-card { background:#111827; border:1px solid #1e293b; border-radius:8px; padding:10px 12px; transition:border-color 0.15s; }
  .tk-card:hover { border-color:#2d3748; }
  .tk-card strong { font-size:0.8125rem; color:#e2e8f0; display:block; margin-bottom:2px; }
  .tk-card-co { font-size:0.6875rem; color:#64748b; display:block; }
  .tk-card-loc { font-size:0.625rem; color:#475569; display:block; margin-top:2px; }
  .tk-card-salary { font-size:0.625rem; color:#22c55e; display:block; margin-top:1px; }
  .tk-card-date { font-size:0.5625rem; color:#374151; display:block; margin-top:4px; }
  .tk-note { font-size:0.6875rem; color:#94a3b8; margin-top:6px; padding:6px 8px; background:#0c0e14; border-radius:6px; cursor:pointer; line-height:1.4; }
  .tk-note:hover { background:#131820; }
  .tk-note span { margin-right:4px; }
  .tk-note-edit { margin-top:6px; }
  .tk-note-edit textarea { width:100%; padding:8px; border-radius:6px; background:#080a10; border:1px solid #1e293b; color:#e2e8f0; font-size:0.75rem; resize:none; outline:none; font-family:inherit; }
  .tk-note-edit textarea:focus { border-color:#3b82f6; }
  .tk-note-btns { display:flex; gap:4px; margin-top:4px; }
  .tk-note-btns button { padding:3px 10px; border-radius:4px; border:1px solid #1e293b; background:transparent; color:#94a3b8; font-size:0.625rem; cursor:pointer; }
  .tk-note-btns button:first-child { background:#3b82f6; border-color:#3b82f6; color:#fff; }
  .tk-card-actions { display:flex; gap:4px; margin-top:8px; flex-wrap:wrap; }
  .tk-card-actions button, .tk-link-btn { padding:3px 10px; border-radius:6px; border:1px solid #1e293b; background:transparent; color:#94a3b8; font-size:0.625rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; text-decoration:none; }
  .tk-card-actions button:hover, .tk-link-btn:hover { border-color:#3b82f6; color:#60a5fa; }
  .tk-remove { color:#ef4444 !important; border-color:#3b1a1a !important; }
  .tk-remove:hover { background:rgba(239,68,68,0.1) !important; }
  .tk-empty { text-align:center; padding:20px; color:#2d3748; font-size:0.75rem; }

  /* Cover Letter */
  .cl { max-width:700px; }
  .cl-title { font-size:1.25rem; font-weight:700; margin:0 0 4px; }
  .cl-sub { color:#64748b; font-size:0.8125rem; margin:0 0 20px; }
  .cl-fields { display:flex; gap:10px; margin-bottom:20px; align-items:flex-end; flex-wrap:wrap; }
  .cl-field { display:flex; flex-direction:column; gap:4px; flex:1; min-width:150px; }
  .cl-field label { font-size:0.6875rem; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; }
  .cl-field input { padding:9px 12px; border-radius:8px; background:#0a0a0f; border:1px solid #1e293b; color:#e2e8f0; font-size:0.8125rem; outline:none; }
  .cl-field input:focus { border-color:#3b82f6; }
  .cl-generate-btn { padding:9px 20px; border-radius:8px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); border:none; color:#fff; font-size:0.8125rem; font-weight:600; cursor:pointer; white-space:nowrap; display:flex; align-items:center; gap:6px; }
  .cl-generate-btn:hover { opacity:0.9; }
  .cl-generate-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .cl-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:cospin 0.7s linear infinite; }
  .cl-editor { margin-bottom:16px; }
  .cl-editor textarea { width:100%; padding:16px; border-radius:10px; background:#080a10; border:1px solid #1e293b; color:#e2e8f0; font-size:0.8125rem; line-height:1.6; resize:vertical; outline:none; font-family:inherit; min-height:320px; }
  .cl-editor textarea:focus { border-color:#3b82f6; }
  .cl-editor textarea::placeholder { color:#374151; }
  .cl-actions { display:flex; gap:8px; }
  .cl-btn-primary { padding:9px 18px; border-radius:8px; background:#3b82f6; border:none; color:#fff; font-size:0.8125rem; font-weight:600; cursor:pointer; }
  .cl-btn-primary:hover { background:#2563eb; }
  .cl-btn-secondary { padding:9px 18px; border-radius:8px; background:transparent; border:1px solid #1e293b; color:#94a3b8; font-size:0.8125rem; cursor:pointer; }
  .cl-btn-secondary:hover { border-color:#3b82f6; color:#60a5fa; }

  /* Settings */
  .sp { max-width:600px; }
  .sp-title { font-size:1.25rem; font-weight:700; margin:0 0 20px; }
  .sp-card { background:#0c0e14; border:1px solid #1a1f2e; border-radius:10px; padding:20px; margin-bottom:12px; }
  .sp-card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
  .sp-card-header h3 { font-size:0.9375rem; margin:0; color:#e2e8f0; }
  .sp-edit-btn { padding:4px 12px; border-radius:6px; background:transparent; border:1px solid #1e293b; color:#94a3b8; font-size:0.6875rem; cursor:pointer; }
  .sp-edit-btn:hover { border-color:#3b82f6; color:#60a5fa; }
  .sp-grid { display:flex; flex-direction:column; gap:10px; }
  .sp-item { display:flex; justify-content:space-between; font-size:0.8125rem; }
  .sp-label { color:#64748b; }
  .sp-edit-form { display:flex; flex-direction:column; gap:12px; }
  .sp-field { display:flex; flex-direction:column; gap:4px; }
  .sp-field label { font-size:0.6875rem; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; }
  .sp-field input { padding:9px 12px; border-radius:8px; background:#080a10; border:1px solid #1e293b; color:#e2e8f0; font-size:0.8125rem; outline:none; }
  .sp-field input:focus { border-color:#3b82f6; }
  .sp-disabled { opacity:0.5; cursor:not-allowed; }
  .sp-edit-actions { display:flex; gap:8px; margin-top:4px; }
  .sp-status { font-size:0.8125rem; color:#94a3b8; margin:0 0 12px; }
  .sp-resume-info { display:flex; gap:16px; font-size:0.75rem; color:#64748b; margin-bottom:12px; }
  .sp-data-desc { font-size:0.8125rem; color:#64748b; margin:0 0 12px; }
  .sp-btn { padding:8px 18px; border-radius:8px; background:#3b82f6; border:none; color:#fff; font-size:0.8125rem; font-weight:600; cursor:pointer; }
  .sp-btn:hover { background:#2563eb; }
  .sp-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .sp-btn-cancel { padding:8px 18px; border-radius:8px; background:transparent; border:1px solid #1e293b; color:#94a3b8; font-size:0.8125rem; cursor:pointer; }
  .sp-btn-cancel:hover { border-color:#ef4444; color:#f87171; }
  .sp-btn-outline { padding:8px 18px; border-radius:8px; background:transparent; border:1px solid #1e293b; color:#94a3b8; font-size:0.8125rem; cursor:pointer; }
  .sp-btn-outline:hover { border-color:#3b82f6; color:#60a5fa; }

  /* Mobile */
  @media (max-width: 768px) {
    .ws-sidebar { width:100%; height:52px; flex-direction:row; border-right:none; border-top:1px solid #1a1f2e; order:2; justify-content:space-around; padding:0; position:fixed; bottom:0; left:0; z-index:20; background:#0a0c12; }
    .ws-logo { display:none; }
    .ws-side-active::before { display:none; }
    .ws-main { order:1; height:calc(100vh - 52px); }
    .ws-copilot { display:none; }
    .ws-panel { padding:16px; }
    .tk-board { grid-template-columns:1fr 1fr; }
    .ws-user-pill span { display:none; }
    .jb-search { flex-direction:column; }
    .jb-field, .jb-field-sm { min-width:100%; }
    .cl-fields { flex-direction:column; }
    .cl-field { min-width:100%; }
    .modal-prepare { max-width:100%; margin:0; border-radius:12px; }
    .prep-tabs { overflow-x:auto; }
    .prep-tabs button { white-space:nowrap; }
  }

  @media (max-width: 480px) {
    .tk-board { grid-template-columns:1fr; }
    .jb-actions { flex-direction:column; }
    .jb-actions > * { width:100%; text-align:center; justify-content:center; }
  }
`;
