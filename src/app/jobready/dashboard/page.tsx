"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AgenticChat from "@/components/jobready/AgenticChat";
import {
  UserIcon,
  LogoutIcon,
  SearchIcon,
  DocumentIcon,
  LocationIcon,
  CheckIcon,
  ExternalLinkIcon,
  DownloadIcon,
  BriefcaseIcon,
} from "@/components/icons/Icons";

type TabType = "resume" | "jobs" | "profile";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("resume");
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/jobready/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="jr-loading-screen">
        <div className="jr-loading-spinner" />
        <p>Loading your workspace...</p>
        <style>{`
          .jr-loading-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0a0a0f; color: #94a3b8; }
          .jr-loading-spinner { width: 40px; height: 40px; border: 3px solid #1e293b; border-top-color: #3b82f6; border-radius: 50%; animation: jr-spin 0.8s linear infinite; margin-bottom: 16px; }
          @keyframes jr-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/jobready");
  };

  const tabs = [
    { id: "resume" as TabType, label: "Resume Builder", icon: DocumentIcon, description: "Create ATS-optimized resume" },
    { id: "jobs" as TabType, label: "Job Search", icon: SearchIcon, description: "Find jobs across India" },
    { id: "profile" as TabType, label: "Profile", icon: UserIcon, description: "Your account" },
  ];

  return (
    <>
      <style>{dashboardStyles}</style>
      <div className="jr-dashboard">
        {/* Top Navigation Bar */}
        <header className="jr-topbar">
          <div className="jr-topbar-left">
            <div className="jr-brand">
              <BriefcaseIcon size={22} color="#3b82f6" />
              <span>JobReady<span className="jr-brand-ai">.ai</span></span>
            </div>
            <nav className="jr-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`jr-tab ${activeTab === tab.id ? "jr-tab-active" : ""}`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="jr-topbar-right">
            <div className="jr-user-pill">
              <div className="jr-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <span className="jr-user-name">{user.name.split(" ")[0]}</span>
            </div>
            <button onClick={handleLogout} className="jr-btn-icon" title="Sign out">
              <LogoutIcon size={18} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="jr-main">
          {activeTab === "resume" && (
            <div className="jr-content">
              <div className="jr-page-header">
                <div>
                  <h1>Resume Builder</h1>
                  <p>Create an ATS-friendly resume powered by AI</p>
                </div>
                {user.cvGenerated && (
                  <div className="jr-status-badge jr-status-success">
                    <CheckIcon size={14} /> Resume Ready
                  </div>
                )}
              </div>
              <AgenticChat onNavigateToSearch={() => setActiveTab("jobs")} />
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="jr-content">
              <div className="jr-page-header">
                <div>
                  <h1>Job Search</h1>
                  <p>Real jobs from Adzuna, LinkedIn, Indeed, Glassdoor &amp; more</p>
                </div>
              </div>
              {!user.cvGenerated ? (
                <div className="jr-empty-state">
                  <DocumentIcon size={48} color="#475569" />
                  <h3>Create Your Resume First</h3>
                  <p>Build your ATS-optimized resume, then search for matching jobs across India.</p>
                  <button onClick={() => setActiveTab("resume")} className="jr-btn jr-btn-primary">
                    <DocumentIcon size={16} />
                    Create Resume
                  </button>
                </div>
              ) : (
                <JobSearchPanel user={user} />
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="jr-content">
              <div className="jr-page-header">
                <div>
                  <h1>Profile</h1>
                  <p>Your account and resume details</p>
                </div>
              </div>
              <ProfilePanel user={user} onEditResume={() => setActiveTab("resume")} onFindJobs={() => setActiveTab("jobs")} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// ─── Profile Panel ────────────────────────────────────────────────────────

interface ProfilePanelProps {
  user: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    cvGenerated?: boolean;
    cvData?: {
      skills: string[];
      experience: { title: string; company: string }[];
      education: { degree: string; institution: string }[];
      personalInfo: { name: string; email: string; phone: string; location: string };
      summary: string;
    } | null;
    createdAt: string;
  };
  onEditResume: () => void;
  onFindJobs: () => void;
}

function ProfilePanel({ user, onEditResume, onFindJobs }: ProfilePanelProps) {
  return (
    <div className="jr-profile-grid">
      <div className="jr-card">
        <h3 className="jr-card-title">Account Information</h3>
        <div className="jr-info-grid">
          <div className="jr-info-item">
            <span className="jr-info-label">Full Name</span>
            <span className="jr-info-value">{user.name}</span>
          </div>
          <div className="jr-info-item">
            <span className="jr-info-label">Email</span>
            <span className="jr-info-value">{user.email}</span>
          </div>
          {user.phone && (
            <div className="jr-info-item">
              <span className="jr-info-label">Phone</span>
              <span className="jr-info-value">{user.phone}</span>
            </div>
          )}
          {user.location && (
            <div className="jr-info-item">
              <span className="jr-info-label">Location</span>
              <span className="jr-info-value">{user.location}</span>
            </div>
          )}
        </div>
      </div>

      {user.cvGenerated && user.cvData ? (
        <div className="jr-card">
          <div className="jr-card-header-row">
            <h3 className="jr-card-title">Resume</h3>
            <div className="jr-status-badge jr-status-success"><CheckIcon size={12} /> Active</div>
          </div>
          <div className="jr-info-grid">
            <div className="jr-info-item">
              <span className="jr-info-label">Skills</span>
              <div className="jr-tag-list">
                {user.cvData.skills.slice(0, 8).map((skill, i) => (
                  <span key={i} className="jr-tag">{skill}</span>
                ))}
                {user.cvData.skills.length > 8 && (
                  <span className="jr-tag jr-tag-more">+{user.cvData.skills.length - 8}</span>
                )}
              </div>
            </div>
            <div className="jr-info-item">
              <span className="jr-info-label">Experience</span>
              <span className="jr-info-value">{user.cvData.experience.length} role{user.cvData.experience.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="jr-info-item">
              <span className="jr-info-label">Education</span>
              <span className="jr-info-value">
                {user.cvData.education[0]?.degree || "Not specified"}
              </span>
            </div>
          </div>
          <div className="jr-card-actions">
            <button onClick={onEditResume} className="jr-btn jr-btn-secondary">Update Resume</button>
            <button onClick={onFindJobs} className="jr-btn jr-btn-primary">Find Jobs</button>
          </div>
        </div>
      ) : (
        <div className="jr-empty-state">
          <DocumentIcon size={40} color="#475569" />
          <h3>No Resume Yet</h3>
          <p>Create your ATS-optimized resume to get started.</p>
          <button onClick={onEditResume} className="jr-btn jr-btn-primary">
            <DocumentIcon size={16} /> Create Resume
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Job Search Panel ────────────────────────────────────────────────────

interface JobSearchPanelProps {
  user: {
    cvData?: {
      skills: string[];
      personalInfo: { name: string; email: string; phone: string; location: string };
    } | null;
    name: string;
    email: string;
  };
}

interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  salary?: string;
  jobType?: string;
  postedAt?: string;
  tags?: string[];
  relevanceScore: number;
}

function JobSearchPanel({ user }: JobSearchPanelProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({});

  const userSkills = user.cvData?.skills?.join(", ") || "";
  const userLocation = user.cvData?.personalInfo?.location || "";
  const [skillsInput, setSkillsInput] = useState(userSkills);
  const [locationInput, setLocationInput] = useState(userLocation);

  const handleSearch = async () => {
    if (!skillsInput.trim()) return;
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: skillsInput,
          location: locationInput,
          preferences: locationInput,
        }),
      });

      if (!response.ok) throw new Error("Failed to search jobs");

      const data = await response.json();
      setJobs(data.jobs || []);
      setSourceCounts(data.sources || {});
      setHasSearched(true);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Failed to search jobs");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      {/* Search Form */}
      <div className="jr-card jr-search-card">
        <div className="jr-search-form">
          <div className="jr-search-field">
            <label>Skills &amp; Keywords</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. React, Node.js, Python"
              className="jr-input"
            />
          </div>
          <div className="jr-search-field jr-search-field-small">
            <label>Location</label>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="e.g. Bangalore"
              className="jr-input"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !skillsInput.trim()}
            className="jr-btn jr-btn-primary jr-search-btn"
          >
            {isSearching ? (
              <><span className="jr-spinner" /> Searching...</>
            ) : (
              <><SearchIcon size={16} /> Search Jobs</>
            )}
          </button>
        </div>
        <p className="jr-search-hint">
          Searching across Adzuna, LinkedIn, Indeed, Glassdoor &amp; remote boards
        </p>
      </div>

      {/* Error */}
      {searchError && (
        <div className="jr-alert jr-alert-error">{searchError}</div>
      )}

      {/* Results */}
      {hasSearched && (
        <div>
          <div className="jr-results-header">
            <h3>{jobs.length > 0 ? `${jobs.length} jobs found` : "No jobs found"}</h3>
            {Object.keys(sourceCounts).length > 0 && (
              <div className="jr-source-pills">
                {Object.entries(sourceCounts).map(([source, count]) => (
                  count > 0 && <span key={source} className="jr-source-pill">{source}: {count}</span>
                ))}
              </div>
            )}
          </div>

          {jobs.length === 0 && (
            <div className="jr-empty-state">
              <SearchIcon size={40} color="#475569" />
              <h3>No matching jobs</h3>
              <p>Try broadening your skills or changing location.</p>
            </div>
          )}

          <div className="jr-job-list">
            {jobs.map((job) => (
              <div key={job.id} className="jr-job-card">
                <div className="jr-job-header">
                  <div>
                    <h4 className="jr-job-title">{job.title}</h4>
                    <p className="jr-job-company">{job.company}</p>
                  </div>
                  <span className={`jr-source-badge jr-source-${job.source.toLowerCase()}`}>{job.source}</span>
                </div>

                <div className="jr-job-meta">
                  <span><LocationIcon size={14} /> {job.location}</span>
                  {job.salary && <span className="jr-job-salary">{job.salary}</span>}
                  {job.postedAt && <span>{job.postedAt}</span>}
                  {job.jobType && <span>{job.jobType}</span>}
                </div>

                <p className="jr-job-desc">{job.description}</p>

                {job.tags && job.tags.length > 0 && (
                  <div className="jr-tag-list">
                    {job.tags.slice(0, 5).map((tag, idx) => (
                      <span key={idx} className="jr-tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="jr-job-actions">
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="jr-btn jr-btn-primary">
                    Apply Now <ExternalLinkIcon size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const dashboardStyles = `
  /* Reset for dashboard */
  .jr-dashboard { background: #0a0a0f; min-height: 100vh; color: #e2e8f0; }
  .jr-dashboard *, .jr-dashboard *::before, .jr-dashboard *::after { box-sizing: border-box; }

  /* Top Bar */
  .jr-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 56px;
    background: #0f1117; border-bottom: 1px solid #1e293b;
    position: sticky; top: 0; z-index: 50;
  }
  .jr-topbar-left { display: flex; align-items: center; gap: 32px; }
  .jr-topbar-right { display: flex; align-items: center; gap: 12px; }

  .jr-brand { display: flex; align-items: center; gap: 8px; font-size: 1.125rem; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em; }
  .jr-brand-ai { color: #3b82f6; }

  /* Tabs */
  .jr-tabs { display: flex; gap: 4px; }
  .jr-tab {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 8px;
    font-size: 0.8125rem; font-weight: 500;
    color: #94a3b8; background: transparent; border: none;
    cursor: pointer; transition: all 0.15s ease;
  }
  .jr-tab:hover { color: #e2e8f0; background: #1e293b; }
  .jr-tab-active { color: #fff; background: #1e293b; }

  /* User */
  .jr-user-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 12px 4px 4px; border-radius: 20px;
    background: #1e293b;
  }
  .jr-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 700; color: white;
  }
  .jr-user-name { font-size: 0.8125rem; color: #cbd5e1; font-weight: 500; }
  .jr-btn-icon {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: transparent; border: none; color: #64748b;
    cursor: pointer; transition: all 0.15s ease;
  }
  .jr-btn-icon:hover { background: #1e293b; color: #ef4444; }

  /* Main Content */
  .jr-main { max-width: 960px; margin: 0 auto; padding: 32px 24px; }
  .jr-content { animation: jr-fadeIn 0.2s ease; }
  @keyframes jr-fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

  /* Page Header */
  .jr-page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 24px;
  }
  .jr-page-header h1 { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin: 0 0 4px 0; letter-spacing: -0.02em; }
  .jr-page-header p { font-size: 0.875rem; color: #64748b; margin: 0; }

  /* Status Badge */
  .jr-status-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 20px;
    font-size: 0.75rem; font-weight: 600;
  }
  .jr-status-success { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }

  /* Cards */
  .jr-card {
    background: #111318; border: 1px solid #1e293b; border-radius: 12px;
    padding: 24px; margin-bottom: 16px;
  }
  .jr-card-title { font-size: 0.9375rem; font-weight: 600; color: #f1f5f9; margin: 0 0 16px 0; }
  .jr-card-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .jr-card-header-row .jr-card-title { margin: 0; }
  .jr-card-actions { display: flex; gap: 8px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #1e293b; }

  /* Info Grid */
  .jr-info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
  .jr-info-item { display: flex; flex-direction: column; gap: 4px; }
  .jr-info-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500; }
  .jr-info-value { font-size: 0.875rem; color: #e2e8f0; font-weight: 500; }

  /* Profile Grid */
  .jr-profile-grid { display: flex; flex-direction: column; gap: 16px; }

  /* Tags */
  .jr-tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .jr-tag {
    padding: 3px 10px; border-radius: 6px;
    font-size: 0.6875rem; font-weight: 500;
    background: #1e293b; color: #94a3b8;
    border: 1px solid #2d3748;
  }
  .jr-tag-more { color: #64748b; }

  /* Buttons */
  .jr-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 18px; border-radius: 8px;
    font-size: 0.8125rem; font-weight: 600;
    border: none; cursor: pointer; transition: all 0.15s ease;
    text-decoration: none;
  }
  .jr-btn-primary { background: #3b82f6; color: white; }
  .jr-btn-primary:hover { background: #2563eb; }
  .jr-btn-primary:disabled { background: #1e3a5f; color: #64748b; cursor: not-allowed; }
  .jr-btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #2d3748; }
  .jr-btn-secondary:hover { background: #2d3748; }

  /* Empty State */
  .jr-empty-state {
    text-align: center; padding: 48px 24px;
    background: #111318; border: 1px dashed #1e293b; border-radius: 12px;
  }
  .jr-empty-state h3 { font-size: 1.125rem; color: #f1f5f9; margin: 16px 0 8px; }
  .jr-empty-state p { color: #64748b; margin: 0 0 20px; font-size: 0.875rem; }

  /* Search Card */
  .jr-search-card { margin-bottom: 24px; }
  .jr-search-form { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
  .jr-search-field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 200px; }
  .jr-search-field-small { flex: 0 1 180px; min-width: 140px; }
  .jr-search-field label { font-size: 0.75rem; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
  .jr-input {
    padding: 10px 14px; border-radius: 8px;
    background: #0a0a0f; border: 1px solid #2d3748;
    color: #e2e8f0; font-size: 0.875rem;
    transition: border-color 0.15s ease;
  }
  .jr-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  .jr-input::placeholder { color: #475569; }
  .jr-search-btn { white-space: nowrap; height: 42px; }
  .jr-search-hint { font-size: 0.75rem; color: #475569; margin: 12px 0 0; }

  /* Spinner */
  .jr-spinner {
    width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white; border-radius: 50%;
    animation: jr-spin 0.6s linear infinite; display: inline-block;
  }

  /* Results */
  .jr-results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
  .jr-results-header h3 { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin: 0; }
  .jr-source-pills { display: flex; gap: 6px; }
  .jr-source-pill {
    padding: 4px 10px; border-radius: 20px;
    font-size: 0.6875rem; font-weight: 500;
    background: #1e293b; color: #94a3b8;
  }

  /* Alert */
  .jr-alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 0.875rem; }
  .jr-alert-error { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }

  /* Job Cards */
  .jr-job-list { display: flex; flex-direction: column; gap: 12px; }
  .jr-job-card {
    background: #111318; border: 1px solid #1e293b; border-radius: 12px;
    padding: 20px; transition: border-color 0.15s ease;
  }
  .jr-job-card:hover { border-color: #2d3748; }
  .jr-job-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
  .jr-job-title { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin: 0 0 2px; }
  .jr-job-company { font-size: 0.875rem; color: #3b82f6; font-weight: 500; margin: 0; }
  .jr-source-badge {
    padding: 3px 10px; border-radius: 6px;
    font-size: 0.6875rem; font-weight: 600;
    white-space: nowrap; flex-shrink: 0;
  }
  .jr-source-adzuna { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
  .jr-source-jsearch { background: rgba(139, 92, 246, 0.1); color: #a78bfa; }
  .jr-source-remotive { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
  .jr-job-meta {
    display: flex; flex-wrap: wrap; gap: 12px;
    font-size: 0.8125rem; color: #64748b; margin-bottom: 12px;
  }
  .jr-job-meta span { display: flex; align-items: center; gap: 4px; }
  .jr-job-salary { color: #22c55e; font-weight: 600; }
  .jr-job-desc { font-size: 0.8125rem; color: #94a3b8; line-height: 1.5; margin: 0 0 12px; }
  .jr-job-actions { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #1e293b; }
  .jr-job-actions .jr-btn { font-size: 0.8125rem; padding: 8px 16px; }

  /* Mobile */
  @media (max-width: 768px) {
    .jr-topbar { padding: 0 16px; }
    .jr-topbar-left { gap: 16px; }
    .jr-tabs { gap: 2px; }
    .jr-tab { padding: 6px 10px; font-size: 0.75rem; }
    .jr-tab span { display: none; }
    .jr-user-name { display: none; }
    .jr-main { padding: 20px 16px; }
    .jr-page-header { flex-direction: column; gap: 8px; }
    .jr-search-form { flex-direction: column; }
    .jr-search-field-small { flex: 1; }
    .jr-results-header { flex-direction: column; align-items: flex-start; }
  }
`;
