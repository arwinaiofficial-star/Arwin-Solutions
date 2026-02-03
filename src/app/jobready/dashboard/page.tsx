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
  BriefcaseIcon,
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
    <div style={{ display: "flex", minHeight: "calc(100vh - 80px)" }}>
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
            <AgenticChat />
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
              <div className="card">
                <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                  Job search functionality coming soon! Your CV is ready for applications.
                </p>
              </div>
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
  );
}
