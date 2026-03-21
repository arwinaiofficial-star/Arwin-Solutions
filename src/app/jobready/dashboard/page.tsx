"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ResumeWizard from "@/components/jobready/ResumeWizard";
import AICopilot from "@/components/jobready/AICopilot";
import CommandPalette from "@/components/jobready/CommandPalette";
import {
  UserIcon, LogoutIcon, SearchIcon, DocumentIcon,
  LocationIcon, CheckIcon, ExternalLinkIcon, BriefcaseIcon,
  SettingsIcon, DownloadIcon,
} from "@/components/icons/Icons";

type ViewType = "resume" | "jobs" | "tracker" | "settings";

interface JobResult {
  id: string; title: string; company: string; location: string;
  description: string; url: string; source: string; salary?: string;
  jobType?: string; postedAt?: string; tags?: string[]; relevanceScore: number;
}

interface TrackedJob {
  id: string; title: string; company: string; url: string;
  status: "saved" | "applied" | "interview" | "offer";
  addedAt: string;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>("resume");
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);

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

  const cmdActions = [
    { id: "resume", label: "Go to Resume Builder", icon: "📄", action: () => setActiveView("resume") },
    { id: "jobs", label: "Search for Jobs", icon: "💼", action: () => setActiveView("jobs") },
    { id: "tracker", label: "Application Tracker", icon: "📊", action: () => setActiveView("tracker") },
    { id: "copilot", label: copilotOpen ? "Hide AI Copilot" : "Show AI Copilot", icon: "🤖", action: () => setCopilotOpen(p => !p) },
    { id: "logout", label: "Sign Out", icon: "🚪", action: () => { logout(); router.push("/jobready"); } },
  ];

  const sidebarItems: { id: ViewType; icon: React.ReactNode; label: string }[] = [
    { id: "resume", icon: <DocumentIcon size={20} />, label: "Resume" },
    { id: "jobs", icon: <BriefcaseIcon size={20} />, label: "Jobs" },
    { id: "tracker", icon: <SearchIcon size={20} />, label: "Tracker" },
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
              {activeView === "resume" && <ResumeWizard onNavigateToSearch={() => setActiveView("jobs")} />}
              {activeView === "jobs" && <JobBoard user={user} />}
              {activeView === "tracker" && <Tracker />}
              {activeView === "settings" && <SettingsPanel user={user} onEditResume={() => setActiveView("resume")} />}
            </div>

            {/* AI Copilot */}
            {copilotOpen && (
              <div className="ws-copilot">
                <AICopilot context={activeView} cvData={user.cvData as Record<string, unknown> | null} isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="ws-statusbar">
            <div className="ws-status-left">
              <span className={`ws-status-dot ${completionPct === 100 ? "ws-dot-green" : "ws-dot-blue"}`} />
              <span>Resume: {completionPct}%</span>
              <span className="ws-status-sep">│</span>
              <span>View: {activeView}</span>
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
    </>
  );
}

// ─── Job Board ──────────────────────────────────────────────────────────────

function JobBoard({ user }: { user: { cvData?: { skills: string[]; personalInfo: { name: string; location: string } } | null; name: string; email: string } }) {
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const skills = user.cvData?.skills?.join(", ") || "";
  const loc = user.cvData?.personalInfo?.location || "";
  const [skillsInput, setSkillsInput] = useState(skills);
  const [locationInput, setLocationInput] = useState(loc);

  useEffect(() => { if (skills && !hasSearched) handleSearch(); }, []); // eslint-disable-line

  const handleSearch = async () => {
    if (!skillsInput.trim()) return;
    setIsSearching(true);
    try {
      const r = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ skills: skillsInput, location: locationInput, preferences: locationInput }) });
      if (r.ok) { const d = await r.json(); setJobs(d.jobs || []); }
    } catch { /* */ }
    setHasSearched(true); setIsSearching(false);
  };

  const getMatchScore = (job: JobResult) => {
    if (!user.cvData?.skills?.length) return 0;
    const desc = `${job.title} ${job.description} ${job.tags?.join(" ") || ""}`.toLowerCase();
    return Math.round((user.cvData.skills.filter(s => desc.includes(s.toLowerCase())).length / user.cvData.skills.length) * 100);
  };

  const saveToTracker = (job: JobResult) => {
    const tracked: TrackedJob[] = JSON.parse(localStorage.getItem("jr_tracked") || "[]");
    if (!tracked.find(t => t.id === job.id)) {
      tracked.push({ id: job.id, title: job.title, company: job.company, url: job.url, status: "saved", addedAt: new Date().toISOString() });
      localStorage.setItem("jr_tracked", JSON.stringify(tracked));
    }
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
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="jb-apply-btn">Apply <ExternalLinkIcon size={12} /></a>
                <button className="jb-save-btn" onClick={() => saveToTracker(job)}>Save to Tracker</button>
                <button className="jb-detail-btn" onClick={() => setExpandedJob(isExpanded ? null : job.id)}>
                  {isExpanded ? "Less" : "Details"}
                </button>
              </div>
              {isExpanded && <div className="jb-full-desc"><p>{job.description}</p></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Application Tracker (Kanban) ───────────────────────────────────────────

function Tracker() {
  const [tracked, setTracked] = useState<TrackedJob[]>([]);

  useEffect(() => {
    setTracked(JSON.parse(localStorage.getItem("jr_tracked") || "[]"));
  }, []);

  const moveJob = (id: string, status: TrackedJob["status"]) => {
    const updated = tracked.map(j => j.id === id ? { ...j, status } : j);
    setTracked(updated);
    localStorage.setItem("jr_tracked", JSON.stringify(updated));
  };

  const removeJob = (id: string) => {
    const updated = tracked.filter(j => j.id !== id);
    setTracked(updated);
    localStorage.setItem("jr_tracked", JSON.stringify(updated));
  };

  const columns: { status: TrackedJob["status"]; label: string; color: string }[] = [
    { status: "saved", label: "📌 Saved", color: "#3b82f6" },
    { status: "applied", label: "📨 Applied", color: "#8b5cf6" },
    { status: "interview", label: "🎤 Interview", color: "#f59e0b" },
    { status: "offer", label: "🎉 Offer", color: "#22c55e" },
  ];

  return (
    <div className="tk">
      <h2 className="tk-title">📊 Application Tracker</h2>
      <p className="tk-sub">Track your job applications through each stage.</p>
      <div className="tk-board">
        {columns.map(col => (
          <div key={col.status} className="tk-col">
            <div className="tk-col-header" style={{ borderColor: col.color }}>
              <span>{col.label}</span>
              <span className="tk-count">{tracked.filter(j => j.status === col.status).length}</span>
            </div>
            <div className="tk-col-body">
              {tracked.filter(j => j.status === col.status).map(job => (
                <div key={job.id} className="tk-card">
                  <strong>{job.title}</strong>
                  <span className="tk-card-co">{job.company}</span>
                  <div className="tk-card-actions">
                    {col.status !== "offer" && (
                      <button onClick={() => moveJob(job.id, columns[columns.findIndex(c => c.status === col.status) + 1]?.status || "offer")}>Move →</button>
                    )}
                    <button onClick={() => removeJob(job.id)} className="tk-remove">✕</button>
                  </div>
                </div>
              ))}
              {tracked.filter(j => j.status === col.status).length === 0 && (
                <div className="tk-empty">No items</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Panel ─────────────────────────────────────────────────────────

function SettingsPanel({ user, onEditResume }: { user: { name: string; email: string; phone?: string; location?: string; cvGenerated?: boolean; createdAt: string }; onEditResume: () => void }) {
  return (
    <div className="sp">
      <h2 className="sp-title">⚙ Settings</h2>
      <div className="sp-card">
        <h3>Account</h3>
        <div className="sp-grid">
          <div className="sp-item"><span className="sp-label">Name</span><span>{user.name}</span></div>
          <div className="sp-item"><span className="sp-label">Email</span><span>{user.email}</span></div>
          {user.phone && <div className="sp-item"><span className="sp-label">Phone</span><span>{user.phone}</span></div>}
        </div>
      </div>
      <div className="sp-card">
        <h3>Resume</h3>
        <p className="sp-status">{user.cvGenerated ? "✅ Resume created" : "⚠️ No resume yet"}</p>
        <button className="sp-btn" onClick={onEditResume}>{user.cvGenerated ? "Edit Resume" : "Create Resume"}</button>
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
  .jb-results { display:flex; flex-direction:column; gap:10px; }
  .jb-card { background:#0c0e14; border:1px solid #1a1f2e; border-radius:10px; padding:16px; transition:border-color 0.2s; }
  .jb-card:hover { border-color:#2d3748; }
  .jb-card-exp { border-color:#3b82f6; }
  .jb-card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
  .jb-card-info h4 { margin:0 0 2px; font-size:0.9375rem; color:#f1f5f9; }
  .jb-company { font-size:0.8125rem; color:#3b82f6; }
  .jb-meta { display:flex; gap:12px; margin-top:6px; font-size:0.6875rem; color:#64748b; }
  .jb-meta span { display:flex; align-items:center; gap:3px; }
  .jb-source { background:#111827; padding:1px 8px; border-radius:4px; }
  .jb-score { padding:3px 10px; border-radius:12px; font-size:0.6875rem; font-weight:600; }
  .jb-score-hi { background:rgba(34,197,94,0.1); color:#22c55e; }
  .jb-score-md { background:rgba(234,179,8,0.1); color:#eab308; }
  .jb-score-lo { background:rgba(239,68,68,0.1); color:#f87171; }
  .jb-desc { font-size:0.8125rem; color:#94a3b8; margin:10px 0; line-height:1.5; }
  .jb-tags { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:10px; }
  .jb-tag { padding:2px 10px; border-radius:6px; background:#111827; border:1px solid #1e293b; font-size:0.6875rem; color:#94a3b8; }
  .jb-actions { display:flex; gap:8px; }
  .jb-apply-btn { display:inline-flex; align-items:center; gap:4px; padding:7px 16px; border-radius:8px; background:#3b82f6; color:#fff; font-size:0.75rem; font-weight:600; text-decoration:none; transition:all 0.15s; }
  .jb-apply-btn:hover { background:#2563eb; }
  .jb-save-btn, .jb-detail-btn { padding:7px 14px; border-radius:8px; background:transparent; border:1px solid #1e293b; color:#94a3b8; font-size:0.75rem; cursor:pointer; transition:all 0.15s; }
  .jb-save-btn:hover, .jb-detail-btn:hover { border-color:#3b82f6; color:#60a5fa; }
  .jb-full-desc { margin-top:12px; padding-top:12px; border-top:1px solid #1a1f2e; }
  .jb-full-desc p { font-size:0.8125rem; color:#cbd5e1; line-height:1.6; white-space:pre-wrap; margin:0; }

  /* Tracker Kanban */
  .tk { }
  .tk-title { font-size:1.25rem; font-weight:700; margin:0 0 4px; }
  .tk-sub { color:#64748b; font-size:0.8125rem; margin:0 0 20px; }
  .tk-board { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .tk-col { background:#0a0c12; border:1px solid #1a1f2e; border-radius:10px; min-height:300px; }
  .tk-col-header { padding:12px 14px; font-size:0.8125rem; font-weight:600; border-bottom:2px solid; display:flex; justify-content:space-between; align-items:center; }
  .tk-count { background:#111827; padding:2px 8px; border-radius:10px; font-size:0.6875rem; color:#64748b; }
  .tk-col-body { padding:8px; display:flex; flex-direction:column; gap:6px; }
  .tk-card { background:#111827; border:1px solid #1e293b; border-radius:8px; padding:10px 12px; }
  .tk-card strong { font-size:0.8125rem; color:#e2e8f0; display:block; margin-bottom:2px; }
  .tk-card-co { font-size:0.6875rem; color:#64748b; }
  .tk-card-actions { display:flex; gap:4px; margin-top:8px; }
  .tk-card-actions button { padding:3px 10px; border-radius:6px; border:1px solid #1e293b; background:transparent; color:#94a3b8; font-size:0.625rem; cursor:pointer; }
  .tk-card-actions button:hover { border-color:#3b82f6; color:#60a5fa; }
  .tk-remove { color:#ef4444 !important; border-color:#3b1a1a !important; }
  .tk-remove:hover { background:rgba(239,68,68,0.1) !important; }
  .tk-empty { text-align:center; padding:20px; color:#2d3748; font-size:0.75rem; }

  /* Settings */
  .sp { max-width:600px; }
  .sp-title { font-size:1.25rem; font-weight:700; margin:0 0 20px; }
  .sp-card { background:#0c0e14; border:1px solid #1a1f2e; border-radius:10px; padding:20px; margin-bottom:12px; }
  .sp-card h3 { font-size:0.9375rem; margin:0 0 12px; color:#e2e8f0; }
  .sp-grid { display:flex; flex-direction:column; gap:10px; }
  .sp-item { display:flex; justify-content:space-between; font-size:0.8125rem; }
  .sp-label { color:#64748b; }
  .sp-status { font-size:0.8125rem; color:#94a3b8; margin:0 0 12px; }
  .sp-btn { padding:8px 18px; border-radius:8px; background:#3b82f6; border:none; color:#fff; font-size:0.8125rem; font-weight:600; cursor:pointer; }
  .sp-btn:hover { background:#2563eb; }

  /* Mobile */
  @media (max-width: 768px) {
    .ws-sidebar { width:100%; height:52px; flex-direction:row; border-right:none; border-top:1px solid #1a1f2e; order:2; justify-content:space-around; padding:0; position:fixed; bottom:0; left:0; z-index:20; }
    .ws-logo { display:none; }
    .ws-side-active::before { display:none; }
    .ws-main { order:1; height:calc(100vh - 52px); }
    .ws-copilot { display:none; }
    .ws-panel { padding:16px; }
    .tk-board { grid-template-columns:1fr 1fr; }
    .ws-user-pill span { display:none; }
  }
`;
