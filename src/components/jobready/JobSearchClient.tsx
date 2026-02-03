"use client";

import { useState, FormEvent, useRef } from "react";

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

interface SearchCriteria {
  skills: string[];
  experience: string;
  preferences: string;
}

interface SearchResults {
  success: boolean;
  totalJobs: number;
  jobs: Job[];
  searchCriteria: SearchCriteria;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: "pending" | "submitted" | "viewed" | "shortlisted" | "rejected";
}

export default function JobSearchClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    experience: "",
    preferences: "",
    expectedSalary: "",
    preferredLocation: "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applyingToJob, setApplyingToJob] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "applications">("search");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: formData.skills,
          experience: formData.experience,
          preferences: formData.preferences,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch jobs");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  // Phase 2: Auto-apply functionality
  const handleAutoApply = async (job: Job) => {
    if (!formData.name || !formData.email) {
      setError("Please fill in your name and email to apply");
      return;
    }

    setApplyingToJob(job.id);
    
    // TODO: Replace with actual API call to submit application in production
    // This simulates a 1.5 second delay to mimic real API response time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newApplication: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      appliedAt: new Date().toISOString(),
      status: "submitted",
    };

    setApplications(prev => [...prev, newApplication]);
    setApplyingToJob(null);
  };

  const isJobApplied = (jobId: string) => {
    return applications.some(app => app.jobId === jobId);
  };

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "submitted": return "var(--color-primary)";
      case "viewed": return "var(--color-warning)";
      case "shortlisted": return "var(--color-success)";
      case "rejected": return "var(--color-error)";
      default: return "var(--color-text-muted)";
    }
  };

  const getStatusText = (status: Application["status"]) => {
    switch (status) {
      case "pending": return "Pending";
      case "submitted": return "Application Submitted";
      case "viewed": return "Viewed by Recruiter";
      case "shortlisted": return "Shortlisted!";
      case "rejected": return "Not Selected";
      default: return status;
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ 
        display: "flex", 
        gap: "var(--space-sm)", 
        marginBottom: "var(--space-lg)",
        borderBottom: "2px solid var(--color-border)",
        paddingBottom: "var(--space-sm)",
      }}>
        <button
          onClick={() => setActiveTab("search")}
          className={`btn ${activeTab === "search" ? "btn-primary" : "btn-secondary"}`}
          style={{ flex: 1 }}
        >
          🔍 Find Jobs
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`btn ${activeTab === "applications" ? "btn-primary" : "btn-secondary"}`}
          style={{ flex: 1, position: "relative" }}
        >
          📋 My Applications
          {applications.length > 0 && (
            <span style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              background: "var(--color-accent)",
              color: "white",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}>
              {applications.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "applications" ? (
        // Applications Dashboard
        <div>
          <h3 style={{ marginBottom: "var(--space-lg)" }}>Your Job Applications</h3>
          {applications.length === 0 ? (
            <div className="card text-center" style={{ background: "var(--color-background-alt)" }}>
              <p style={{ fontSize: "1.125rem", marginBottom: "var(--space-md)" }}>
                No applications yet
              </p>
              <p style={{ color: "var(--color-text-muted)" }}>
                Search for jobs and use the &quot;Auto Apply&quot; button to submit applications instantly.
              </p>
              <button 
                onClick={() => setActiveTab("search")} 
                className="btn btn-primary"
                style={{ marginTop: "var(--space-md)" }}
              >
                Find Jobs Now
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              {applications.map((app) => (
                <div key={app.id} className="card" style={{ borderLeft: `4px solid ${getStatusColor(app.status)}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-md)" }}>
                    <div>
                      <h4 style={{ marginBottom: "var(--space-xs)" }}>{app.jobTitle}</h4>
                      <p style={{ color: "var(--color-accent)", fontWeight: 600, marginBottom: "var(--space-xs)" }}>
                        {app.company}
                      </p>
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: 0 }}>
                        Applied: {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span 
                        className="badge" 
                        style={{ background: getStatusColor(app.status) }}
                      >
                        {getStatusText(app.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Search Form */}
          <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)" }}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)" }}>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience" className="form-label">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="skills" className="form-label">
                  Key Skills * <span style={{ color: "var(--color-text-muted)" }}>(comma-separated)</span>
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., React, Node.js, Python, JavaScript"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)" }}>
                <div className="form-group">
                  <label htmlFor="expectedSalary" className="form-label">
                    Expected Salary (₹ LPA)
                  </label>
                  <select
                    id="expectedSalary"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">Select range</option>
                    <option value="0-5">₹0 - ₹5 LPA</option>
                    <option value="5-10">₹5 - ₹10 LPA</option>
                    <option value="10-15">₹10 - ₹15 LPA</option>
                    <option value="15-25">₹15 - ₹25 LPA</option>
                    <option value="25-40">₹25 - ₹40 LPA</option>
                    <option value="40+">₹40+ LPA</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="preferredLocation" className="form-label">
                    Preferred Location
                  </label>
                  <select
                    id="preferredLocation"
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">Any Location</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="pune">Pune</option>
                    <option value="chennai">Chennai</option>
                    <option value="delhi-ncr">Delhi NCR</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="preferences" className="form-label">
                  Job Preferences
                </label>
                <textarea
                  id="preferences"
                  name="preferences"
                  value={formData.preferences}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Tell us about your ideal job (e.g., product company, startup, specific industry, work from home...)"
                  required
                ></textarea>
              </div>

              {/* Resume Upload */}
              <div className="form-group">
                <label className="form-label">
                  Resume/CV (PDF, DOC, DOCX)
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-lg)",
                    textAlign: "center",
                    cursor: "pointer",
                    background: resume ? "var(--color-surface-highlight)" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  {resume ? (
                    <div>
                      <span style={{ fontSize: "2rem" }}>📄</span>
                      <p style={{ marginTop: "var(--space-sm)", marginBottom: 0, fontWeight: 600 }}>
                        {resume.name}
                      </p>
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: 0 }}>
                        Click to change file
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: "2rem" }}>📤</span>
                      <p style={{ marginTop: "var(--space-sm)", marginBottom: 0, color: "var(--color-text-muted)" }}>
                        Click to upload your resume
                      </p>
                      <p style={{ color: "var(--color-text-light)", fontSize: "0.875rem", marginBottom: 0 }}>
                        Helps AI match you with better opportunities
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: "100%" }}
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", justifyContent: "center" }}>
                    <LoadingSpinner />
                    Searching Jobs in India...
                  </span>
                ) : (
                  "🔍 Find Matching Jobs in India"
                )}
              </button>

              <p
                style={{
                  textAlign: "center",
                  color: "var(--color-text-light)",
                  fontSize: "0.875rem",
                }}
              >
                Your information is used to find the best matching jobs from top Indian companies.
              </p>
            </form>
          </div>

          {/* Error State */}
          {error && (
            <div
              className="card"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                borderColor: "var(--color-error)",
                marginBottom: "var(--space-xl)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "var(--color-error)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: "white", fontSize: "1.25rem" }}>!</span>
                </div>
                <div>
                  <h4 style={{ marginBottom: "var(--space-xs)" }}>Error Finding Jobs</h4>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>{error}</p>
                </div>
              </div>
              <button
                onClick={clearResults}
                className="btn btn-secondary"
                style={{ marginTop: "var(--space-md)" }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="card text-center" style={{ marginBottom: "var(--space-xl)" }}>
              <LoadingSpinner size="large" />
              <p style={{ marginTop: "var(--space-md)", color: "var(--color-text-muted)" }}>
                Searching jobs from top Indian companies...
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-light)" }}>
                Infosys, TCS, Flipkart, Razorpay, and more
              </p>
            </div>
          )}

          {/* Results Section */}
          {results && !loading && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-lg)",
                  flexWrap: "wrap",
                  gap: "var(--space-md)",
                }}
              >
                <div>
                  <h3 style={{ marginBottom: "var(--space-xs)" }}>
                    {results.totalJobs > 0
                      ? `Found ${results.totalJobs} Jobs in India`
                      : "No Jobs Found"}
                  </h3>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                    Based on: {results.searchCriteria.skills.join(", ")}
                  </p>
                </div>
                <button onClick={clearResults} className="btn btn-secondary">
                  New Search
                </button>
              </div>

              {results.totalJobs === 0 ? (
                <div
                  className="card text-center"
                  style={{
                    background: "var(--color-background-alt)",
                  }}
                >
                  <p style={{ fontSize: "1.125rem", marginBottom: "var(--space-md)" }}>
                    No jobs found matching your criteria.
                  </p>
                  <p style={{ color: "var(--color-text-muted)" }}>
                    Try adjusting your skills or preferences to find more opportunities.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                  {results.jobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onAutoApply={handleAutoApply}
                      isApplied={isJobApplied(job.id)}
                      isApplying={applyingToJob === job.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  onAutoApply: (job: Job) => void;
  isApplied: boolean;
  isApplying: boolean;
}

function JobCard({ job, onAutoApply, isApplied, isApplying }: JobCardProps) {
  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${isApplied ? "var(--color-success)" : "var(--color-primary)"}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "var(--space-md)",
          marginBottom: "var(--space-md)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <h4 style={{ marginBottom: "var(--space-xs)" }}>{job.title}</h4>
          <p
            style={{
              color: "var(--color-accent)",
              fontWeight: 600,
              marginBottom: "var(--space-xs)",
            }}
          >
            {job.company}
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--space-md)",
              flexWrap: "wrap",
              color: "var(--color-text-muted)",
              fontSize: "0.875rem",
            }}
          >
            <span>📍 {job.location}</span>
            {job.jobType && <span>💼 {job.jobType}</span>}
            {job.postedAt && <span>🕐 {job.postedAt}</span>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-xs)" }}>
          <span
            className="badge"
            style={{
              background: "var(--color-primary)",
            }}
          >
            {job.source}
          </span>
          {job.salary && (
            <span style={{ fontSize: "0.875rem", color: "var(--color-success)", fontWeight: 600 }}>
              {job.salary}
            </span>
          )}
        </div>
      </div>

      <p
        style={{
          color: "var(--color-text-muted)",
          marginBottom: "var(--space-md)",
          lineHeight: 1.6,
        }}
      >
        {job.description}
      </p>

      {job.tags && job.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-xs)",
            marginBottom: "var(--space-md)",
          }}
        >
          {job.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                background: "var(--color-surface-highlight)",
                padding: "0.25rem 0.5rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "var(--space-sm)" }}>
        {isApplied ? (
          <button
            className="btn btn-secondary"
            style={{ flex: 1, cursor: "default" }}
            disabled
          >
            ✓ Applied
          </button>
        ) : (
          <button
            onClick={() => onAutoApply(job)}
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={isApplying}
          >
            {isApplying ? (
              <span style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", justifyContent: "center" }}>
                <LoadingSpinner />
                Applying...
              </span>
            ) : (
              "🚀 Auto Apply"
            )}
          </button>
        )}
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ flex: 1 }}
        >
          View Details ↗
        </a>
      </div>
    </div>
  );
}

function LoadingSpinner({ size = "small" }: { size?: "small" | "large" }) {
  const dimensions = size === "large" ? "40px" : "20px";
  return (
    <div
      style={{
        width: dimensions,
        height: dimensions,
        border: "3px solid var(--color-border)",
        borderTopColor: "var(--color-primary)",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: size === "large" ? "0 auto" : "0",
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
