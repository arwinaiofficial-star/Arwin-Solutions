"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { applicationsApi } from "@/lib/api/client";
import { SearchIcon } from "@/components/icons/Icons";
import { JobResult, JobSearchState } from "./types";
import JobCard from "./JobCard";
import JobDetailModal from "./JobDetailModal";
import "@/app/jobready/jobready.css";

export default function JobSearch() {
  const { user } = useAuth();
  const [state, setState] = useState<JobSearchState>({
    query: "",
    location: "",
    results: [],
    loading: false,
    searched: false,
    sortBy: "relevance",
  });
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);

  // Pre-fill search with user's skills
  useEffect(() => {
    if (user?.cvData) {
      const cv = user.cvData as unknown as Record<string, unknown>;
      const skills = cv?.skills as string[] | undefined;
      if (skills && skills.length > 0) {
        setState((prev) => ({
          ...prev,
          query: skills.slice(0, 5).join(", "),
        }));
      }
    }
  }, [user]);

  const handleSearch = useCallback(async () => {
    if (!state.query.trim()) return;
    setState((prev) => ({ ...prev, loading: true, searched: true }));

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: state.query,
          location: state.location || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.jobs) {
        setState((prev) => ({
          ...prev,
          results: data.jobs as JobResult[],
          loading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, results: [], loading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, results: [], loading: false }));
    }
  }, [state.query, state.location]);

  const handleSave = useCallback(async (job: JobResult) => {
    await applicationsApi.create({
      job_title: job.title,
      company: job.company,
      location: job.location,
      job_url: job.url,
      salary: job.salary,
      source: job.source,
      status: "saved",
      description: job.description,
    });
  }, []);

  const sortedResults = [...state.results].sort((a, b) => {
    if (state.sortBy === "relevance") return b.relevanceScore - a.relevanceScore;
    if (!a.postedAt || !b.postedAt) return 0;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  return (
    <div className="jr-jobs-page">
      {/* Search Bar */}
      <div className="jr-search-bar">
        <div className="jr-search-field" style={{ flex: 2 }}>
          <label>Skills & Keywords</label>
          <input
            type="text"
            placeholder="React, Python, Machine Learning..."
            value={state.query}
            onChange={(e) => setState((prev) => ({ ...prev, query: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div className="jr-search-field">
          <label>Location</label>
          <input
            type="text"
            placeholder="City or Remote"
            value={state.location}
            onChange={(e) => setState((prev) => ({ ...prev, location: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <button
          className="jr-btn jr-btn-primary"
          onClick={handleSearch}
          disabled={state.loading || !state.query.trim()}
        >
          <SearchIcon size={16} />
          {state.loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Results Meta */}
      {state.searched && !state.loading && (
        <div className="jr-search-meta">
          <span>
            {sortedResults.length} job{sortedResults.length !== 1 ? "s" : ""} found
          </span>
          <div className="jr-search-sort">
            <button
              className={state.sortBy === "relevance" ? "active" : ""}
              onClick={() => setState((prev) => ({ ...prev, sortBy: "relevance" }))}
            >
              Best Match
            </button>
            <button
              className={state.sortBy === "date" ? "active" : ""}
              onClick={() => setState((prev) => ({ ...prev, sortBy: "date" }))}
            >
              Most Recent
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {state.loading && (
        <div className="jr-jobs-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="jr-skeleton-card">
              <div className="jr-skeleton jr-skeleton-line long" />
              <div className="jr-skeleton jr-skeleton-line medium" />
              <div className="jr-skeleton jr-skeleton-line short" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!state.loading && sortedResults.length > 0 && (
        <div className="jr-jobs-list">
          {sortedResults.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSave={handleSave}
              onViewDetails={setSelectedJob}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {state.searched && !state.loading && sortedResults.length === 0 && (
        <div className="jr-empty">
          <div className="jr-empty-icon">
            <SearchIcon size={24} />
          </div>
          <h2 className="jr-empty-title">No jobs found</h2>
          <p className="jr-empty-text">
            Try adjusting your keywords or location to find more results.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!state.searched && !state.loading && (
        <div className="jr-empty">
          <div className="jr-empty-icon">
            <SearchIcon size={24} />
          </div>
          <h2 className="jr-empty-title">Search for jobs</h2>
          <p className="jr-empty-text">
            Enter your skills and location to find matching opportunities. Results are aggregated from multiple sources.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
