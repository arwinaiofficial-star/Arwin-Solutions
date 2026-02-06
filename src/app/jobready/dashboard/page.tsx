"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AgenticChat from "@/components/jobready/AgenticChat";
import {
  ChatIcon,
  ClipboardIcon,
  UserIcon,
  LogoutIcon,
  SearchIcon,
  DocumentIcon,
  HomeIcon,
  LocationIcon,
  ClockIcon,
  CheckIcon,
  EyeIcon,
  MenuIcon,
  XIcon,
} from "@/components/icons/Icons";

type TabType = "chat" | "applications" | "profile" | "search";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, applications, logout, updateApplicationStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/jobready/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <section className="section" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <div style={{
            width: "48px",
            height: "48px",
            border: "3px solid var(--color-border)",
            borderTopColor: "var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto",
          }} />
          <p style={{ marginTop: "var(--space-md)", color: "var(--color-text-muted)" }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </section>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/jobready");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "var(--color-primary)";
      case "viewed": return "var(--color-warning)";
      case "shortlisted": return "var(--color-success)";
      case "interview": return "#10b981";
      case "rejected": return "var(--color-error)";
      default: return "var(--color-text-muted)";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pending";
      case "submitted": return "Submitted";
      case "viewed": return "Viewed";
      case "shortlisted": return "Shortlisted";
      case "interview": return "Interview";
      case "rejected": return "Not Selected";
      default: return status;
    }
  };

  const navItems = [
    { id: "chat" as TabType, label: "AI Assistant", icon: ChatIcon },
    { id: "search" as TabType, label: "Find Jobs", icon: SearchIcon },
    { id: "applications" as TabType, label: "My Applications", icon: ClipboardIcon, badge: applications.length },
    { id: "profile" as TabType, label: "My Profile", icon: UserIcon },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 80px)" }}>
      {/* Demo Banner */}
      <div style={{
        background: "linear-gradient(90deg, var(--color-warning) 0%, #f59e0b 100%)",
        color: "#1a1a2e",
        padding: "var(--space-sm) var(--space-md)",
        textAlign: "center",
        fontSize: "0.875rem",
        fontWeight: 500,
      }}>
        🚧 <strong>Demo Mode:</strong> Data is stored in your browser (localStorage). For production, a database backend is needed.
      </div>
      
      <div style={{ display: "flex", flex: 1 }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="btn btn-secondary"
        style={{
          position: "fixed",
          bottom: "var(--space-md)",
          right: "var(--space-md)",
          zIndex: 100,
          display: "none",
          borderRadius: "50%",
          width: "56px",
          height: "56px",
          padding: 0,
          boxShadow: "var(--shadow-lg)",
        }}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
      </button>
      <style>{`
        @media (max-width: 768px) {
          button[aria-label="Toggle menu"] { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: "280px",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        padding: "var(--space-lg)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: "80px",
        height: "calc(100vh - 80px)",
        overflowY: "auto",
        transform: sidebarOpen ? "translateX(0)" : undefined,
        transition: "transform 0.3s ease",
      }}
      className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <style>{`
          @media (max-width: 768px) {
            .dashboard-sidebar {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              height: 100vh !important;
              z-index: 99;
            }
            .dashboard-sidebar.sidebar-open {
              transform: translateX(0) !important;
            }
            .dashboard-sidebar.sidebar-closed {
              transform: translateX(-100%) !important;
            }
          }
        `}</style>

        {/* User Info */}
        <div style={{
          padding: "var(--space-md)",
          background: "var(--color-surface-elevated)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--space-lg)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <UserIcon size={24} color="white" />
            </div>
            <div>
              <h4 style={{ margin: 0 }}>{user.name}</h4>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{user.email}</p>
            </div>
          </div>
          {user.cvGenerated && (
            <div style={{
              marginTop: "var(--space-sm)",
              padding: "var(--space-xs) var(--space-sm)",
              background: "rgba(16, 185, 129, 0.1)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
            }}>
              <CheckIcon size={14} color="var(--color-success)" />
              <span style={{ fontSize: "0.75rem", color: "var(--color-success)" }}>CV Generated</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  style={{
                    width: "100%",
                    padding: "var(--space-sm) var(--space-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-sm)",
                    background: activeTab === item.id ? "var(--color-primary)" : "transparent",
                    color: activeTab === item.id ? "white" : "var(--color-text)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      marginLeft: "auto",
                      background: activeTab === item.id ? "white" : "var(--color-accent)",
                      color: activeTab === item.id ? "var(--color-primary)" : "white",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div style={{ marginTop: "var(--space-lg)" }}>
          <Link
            href="/jobready"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              padding: "var(--space-sm) var(--space-md)",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
              transition: "background 0.2s ease",
            }}
          >
            <HomeIcon size={20} />
            <span>Back to Home</span>
          </Link>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              padding: "var(--space-sm) var(--space-md)",
              color: "var(--color-error)",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              marginTop: "var(--space-xs)",
            }}
          >
            <LogoutIcon size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "var(--space-xl)", maxWidth: "1000px" }}>
        {activeTab === "chat" && (
          <div>
            <div style={{ marginBottom: "var(--space-lg)" }}>
              <h1 style={{ marginBottom: "var(--space-xs)" }}>AI Assistant</h1>
              <p style={{ color: "var(--color-text-muted)" }}>
                Chat with our AI to create your ATS-friendly CV and find the perfect job
              </p>
            </div>
            <AgenticChat onNavigateToSearch={() => setActiveTab("search")} />
          </div>
        )}

        {activeTab === "search" && (
          <div>
            <div style={{ marginBottom: "var(--space-lg)" }}>
              <h1 style={{ marginBottom: "var(--space-xs)" }}>Find Jobs</h1>
              <p style={{ color: "var(--color-text-muted)" }}>
                Search for jobs matching your profile
              </p>
            </div>
            {!user.cvGenerated ? (
              <div className="card text-center" style={{ background: "var(--color-surface-elevated)" }}>
                <DocumentIcon size={48} color="var(--color-text-muted)" />
                <h3 style={{ marginTop: "var(--space-md)" }}>Create Your CV First</h3>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-md)" }}>
                  Before searching for jobs, let&apos;s create your ATS-friendly CV using our AI assistant.
                </p>
                <button onClick={() => setActiveTab("chat")} className="btn btn-primary">
                  <ChatIcon size={16} />
                  <span style={{ marginLeft: "var(--space-xs)" }}>Start CV Creation</span>
                </button>
              </div>
            ) : (
              <JobSearchWithCV user={user} />
            )}
          </div>
        )}

        {activeTab === "applications" && (
          <div>
            <div style={{ marginBottom: "var(--space-lg)" }}>
              <h1 style={{ marginBottom: "var(--space-xs)" }}>My Applications</h1>
              <p style={{ color: "var(--color-text-muted)" }}>
                Track the status of your job applications
              </p>
            </div>

            {applications.length === 0 ? (
              <div className="card text-center" style={{ background: "var(--color-surface-elevated)" }}>
                <ClipboardIcon size={48} color="var(--color-text-muted)" />
                <h3 style={{ marginTop: "var(--space-md)" }}>No Applications Yet</h3>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-md)" }}>
                  Start applying to jobs and track your applications here.
                </p>
                <button onClick={() => setActiveTab("search")} className="btn btn-primary">
                  <SearchIcon size={16} />
                  <span style={{ marginLeft: "var(--space-xs)" }}>Find Jobs</span>
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--space-md)", marginBottom: "var(--space-md)" }}>
                  {[
                    { label: "Total", count: applications.length, color: "var(--color-primary)" },
                    { label: "In Review", count: applications.filter(a => a.status === "viewed").length, color: "var(--color-warning)" },
                    { label: "Shortlisted", count: applications.filter(a => a.status === "shortlisted").length, color: "var(--color-success)" },
                  ].map((stat, idx) => (
                    <div key={idx} className="card" style={{ textAlign: "center", borderTop: `3px solid ${stat.color}` }}>
                      <h2 style={{ marginBottom: 0 }}>{stat.count}</h2>
                      <p style={{ color: "var(--color-text-muted)", marginBottom: 0, fontSize: "0.875rem" }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Application List */}
                {applications.map((app) => (
                  <div key={app.id} className="card" style={{ borderLeft: `4px solid ${getStatusColor(app.status)}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-md)", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <h4 style={{ marginBottom: "var(--space-xs)" }}>{app.jobTitle}</h4>
                        <p style={{ color: "var(--color-accent)", fontWeight: 600, marginBottom: "var(--space-xs)" }}>
                          {app.company}
                        </p>
                        <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <LocationIcon size={14} /> {app.location}
                          </span>
                          {app.salary && (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-success)" }}>
                              {app.salary}
                            </span>
                          )}
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <ClockIcon size={14} /> {new Date(app.appliedAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-xs)" }}>
                        <span
                          className="badge"
                          style={{ background: getStatusColor(app.status) }}
                        >
                          {getStatusText(app.status)}
                        </span>
                        {/* Demo: Update status buttons */}
                        <div style={{ display: "flex", gap: "var(--space-xs)", marginTop: "var(--space-xs)" }}>
                          <button
                            onClick={() => updateApplicationStatus(app.id, "viewed")}
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            title="Mark as Viewed"
                          >
                            <EyeIcon size={12} />
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(app.id, "shortlisted")}
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            title="Mark as Shortlisted"
                          >
                            <CheckIcon size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <div style={{ marginBottom: "var(--space-lg)" }}>
              <h1 style={{ marginBottom: "var(--space-xs)" }}>My Profile</h1>
              <p style={{ color: "var(--color-text-muted)" }}>
                Manage your profile and CV
              </p>
            </div>

            <div className="card" style={{ marginBottom: "var(--space-lg)" }}>
              <h3 style={{ marginBottom: "var(--space-md)" }}>Personal Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)" }}>
                <div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "var(--space-xs)" }}>Full Name</p>
                  <p style={{ fontWeight: 600 }}>{user.name}</p>
                </div>
                <div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "var(--space-xs)" }}>Email</p>
                  <p style={{ fontWeight: 600 }}>{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "var(--space-xs)" }}>Phone</p>
                    <p style={{ fontWeight: 600 }}>{user.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {user.cvGenerated && user.cvData && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
                  <h3 style={{ margin: 0 }}>Generated CV</h3>
                  <span className="badge badge-success">Ready</span>
                </div>
                <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "var(--space-xs)" }}>Skills</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-xs)" }}>
                      {user.cvData.skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} style={{
                          background: "var(--color-surface-highlight)",
                          padding: "4px 8px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.75rem",
                        }}>
                          {skill}
                        </span>
                      ))}
                      {user.cvData.skills.length > 5 && (
                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                          +{user.cvData.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p style={{ marginTop: "var(--space-md)", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                  Created on {new Date(user.cvData.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            )}

            {!user.cvGenerated && (
              <div className="card text-center" style={{ background: "var(--color-surface-elevated)" }}>
                <DocumentIcon size={48} color="var(--color-text-muted)" />
                <h3 style={{ marginTop: "var(--space-md)" }}>No CV Generated Yet</h3>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-md)" }}>
                  Create your ATS-friendly CV using our AI assistant.
                </p>
                <button onClick={() => setActiveTab("chat")} className="btn btn-primary">
                  <ChatIcon size={16} />
                  <span style={{ marginLeft: "var(--space-xs)" }}>Create CV Now</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}

// Job Search Component with CV integration
interface JobSearchWithCVProps {
  user: {
    cvData?: {
      skills: string[];
      personalInfo: {
        name: string;
        email: string;
        phone: string;
        location: string;
      };
    } | null;
    name: string;
    email: string;
  };
}

interface Job {
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

function JobSearchWithCV({ user }: JobSearchWithCVProps) {
  const { addApplication } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [searchError, setSearchError] = useState<string | null>(null);

  // Pre-fill search with user's skills
  const userSkills = user.cvData?.skills?.join(", ") || "";
  const [skillsInput, setSkillsInput] = useState(userSkills);

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
          preferences: user.cvData?.personalInfo?.location || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to search jobs");
      }

      const data = await response.json();
      setJobs(data.jobs || []);
      setHasSearched(true);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Failed to search jobs");
    } finally {
      setIsSearching(false);
    }
  };

  const handleApply = async (job: Job) => {
    setApplyingTo(job.id);
    
    /**
     * DEMO/PROTOTYPE MODE: Application Simulation
     * 
     * In production, this would be replaced with a real API call:
     * 
     * 1. API Endpoint: POST /api/applications
     * 2. Required Payload:
     *    {
     *      jobId: string,
     *      jobDetails: { title, company, location, salary, url },
     *      cvData: user.cvData (full CV object),
     *      userProfile: { name, email, phone },
     *      appliedAt: ISO timestamp
     *    }
     * 3. Error Handling:
     *    - Handle network failures with retry logic
     *    - Validate CV exists before submission
     *    - Handle duplicate application attempts
     *    - Show success/error notifications
     * 4. Integration Options:
     *    - Direct integration with job portal APIs (LinkedIn, Naukri, etc.)
     *    - Email-based application with CV attachment
     *    - ATS integration via API
     * 
     * Current simulation waits 1.5s to mimic network latency
     */
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addApplication({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      status: "submitted",
      cvUsed: user.cvData?.personalInfo?.name || "Generated CV",
    });
    
    setAppliedJobs(prev => new Set([...prev, job.id]));
    setApplyingTo(null);
  };

  return (
    <div>
      {/* CV Summary Card */}
      <div className="card" style={{ 
        marginBottom: "var(--space-lg)", 
        background: "var(--color-surface-elevated)",
        borderLeft: "4px solid var(--color-success)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
          <CheckIcon size={20} color="var(--color-success)" />
          <h4 style={{ margin: 0 }}>Your CV is Ready</h4>
        </div>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-sm)", fontSize: "0.875rem" }}>
          {user.cvData?.personalInfo?.name} • {user.cvData?.personalInfo?.email}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-xs)" }}>
          {user.cvData?.skills?.slice(0, 5).map((skill, idx) => (
            <span key={idx} style={{
              background: "var(--color-surface-highlight)",
              padding: "4px 8px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.75rem",
            }}>
              {skill}
            </span>
          ))}
          {(user.cvData?.skills?.length || 0) > 5 && (
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
              +{(user.cvData?.skills?.length || 0) - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Search Form */}
      <div className="card" style={{ marginBottom: "var(--space-lg)" }}>
        <h4 style={{ marginBottom: "var(--space-md)" }}>🔍 Search for Jobs</h4>
        <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="Enter skills (e.g., React, Node.js, Python)"
            className="form-input"
            style={{ flex: 1, minWidth: "200px" }}
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching || !skillsInput.trim()}
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}
          >
            {isSearching ? (
              <>
                <LoadingSpinner />
                Searching...
              </>
            ) : (
              <>
                <SearchIcon size={16} />
                Search Jobs
              </>
            )}
          </button>
        </div>
        <p style={{ 
          fontSize: "0.75rem", 
          color: "var(--color-text-muted)", 
          marginTop: "var(--space-sm)",
          marginBottom: 0,
        }}>
          Pre-filled with your CV skills. Modify as needed.
        </p>
      </div>

      {/* Search Error */}
      {searchError && (
        <div className="card" style={{ 
          marginBottom: "var(--space-lg)",
          background: "rgba(239, 68, 68, 0.1)",
          borderColor: "var(--color-error)",
        }}>
          <p style={{ color: "var(--color-error)", margin: 0 }}>{searchError}</p>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div>
          <h4 style={{ marginBottom: "var(--space-md)" }}>
            {jobs.length > 0 ? `Found ${jobs.length} matching jobs` : "No jobs found"}
          </h4>
          
          {jobs.length === 0 && (
            <div className="card text-center" style={{ background: "var(--color-surface-elevated)" }}>
              <p style={{ color: "var(--color-text-muted)" }}>
                Try adjusting your skills or search terms to find more opportunities.
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {jobs.map((job) => (
              <div key={job.id} className="card" style={{ 
                borderLeft: appliedJobs.has(job.id) ? "4px solid var(--color-success)" : "4px solid var(--color-primary)" 
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-md)", marginBottom: "var(--space-sm)" }}>
                  <div>
                    <h4 style={{ marginBottom: "var(--space-xs)" }}>{job.title}</h4>
                    <p style={{ color: "var(--color-accent)", fontWeight: 600, marginBottom: "var(--space-xs)" }}>
                      {job.company}
                    </p>
                    <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <LocationIcon size={14} /> {job.location}
                      </span>
                      {job.salary && (
                        <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="badge" style={{ background: "var(--color-primary)" }}>
                    {job.source}
                  </span>
                </div>
                
                <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-md)", fontSize: "0.875rem" }}>
                  {job.description.slice(0, 200)}...
                </p>

                {job.tags && job.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-xs)", marginBottom: "var(--space-md)" }}>
                    {job.tags.slice(0, 4).map((tag, idx) => (
                      <span key={idx} style={{
                        background: "var(--color-surface-highlight)",
                        padding: "2px 6px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.7rem",
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                  {appliedJobs.has(job.id) ? (
                    <button className="btn btn-secondary" disabled style={{ flex: 1 }}>
                      <CheckIcon size={16} />
                      <span style={{ marginLeft: "var(--space-xs)" }}>Applied</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(job)}
                      disabled={applyingTo === job.id}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      {applyingTo === job.id ? (
                        <>
                          <LoadingSpinner />
                          <span style={{ marginLeft: "var(--space-xs)" }}>Applying...</span>
                        </>
                      ) : (
                        <>
                          🚀 Auto Apply with CV
                        </>
                      )}
                    </button>
                  )}
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    View ↗
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

function LoadingSpinner() {
  return (
    <div style={{
      width: "16px",
      height: "16px",
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "white",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
