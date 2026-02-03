"use client";

import { useState, FormEvent } from "react";

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

export default function JobSearchClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skills: "",
    experience: "",
    preferences: "",
  });
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div>
      {/* Search Form */}
      <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}
        >
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
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
              Email Address
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

          <div className="form-group">
            <label htmlFor="skills" className="form-label">
              Key Skills <span style={{ color: "var(--color-text-muted)" }}>(comma-separated)</span>
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

          <div className="form-group">
            <label htmlFor="experience" className="form-label">
              Years of Experience
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
              placeholder="Tell us about your ideal job (e.g., remote, full-time, startup, specific industry...)"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                <LoadingSpinner />
                Searching Jobs...
              </span>
            ) : (
              "Find Matching Jobs"
            )}
          </button>

          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-light)",
              fontSize: "0.875rem",
            }}
          >
            Your information is used to find the best matching jobs across multiple platforms.
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
            Searching across multiple job platforms...
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-light)" }}>
            This may take a few seconds
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
                  ? `Found ${results.totalJobs} Matching Jobs`
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
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <div
      className="card"
      style={{
        borderLeft: "4px solid var(--color-primary)",
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
              background:
                job.source === "Remotive"
                  ? "var(--color-primary)"
                  : "var(--color-accent)",
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

      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
        style={{ width: "100%" }}
      >
        View Job & Apply ↗
      </a>
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
