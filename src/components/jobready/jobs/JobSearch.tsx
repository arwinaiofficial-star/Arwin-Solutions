"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { applicationsApi } from "@/lib/api/client";
import {
  LocationIcon,
  SearchIcon,
} from "@/components/icons/Icons";
import { JobResult, JobSearchState } from "./types";
import JobCard from "./JobCard";
import JobDetailModal from "./JobDetailModal";
import "@/app/jobready/jobready.css";

export default function JobSearch() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [state, setState] = useState<JobSearchState>({
    query: "",
    location: "",
    results: [],
    loading: false,
    searched: false,
    sortBy: "relevance",
  });
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [savedJobUrls, setSavedJobUrls] = useState<Set<string>>(new Set());
  const lastAutoSearchRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    applicationsApi.list().then((res) => {
      if (cancelled || !res.data) return;
      const savedUrls = res.data
        .map((application) => application.job_url)
        .filter((value): value is string => Boolean(value));
      setSavedJobUrls(new Set(savedUrls));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const urlQuery = searchParams.get("q") || "";
  const prefilledQuery = urlQuery || (user?.cvData?.skills || []).slice(0, 5).join(", ");
  const currentQuery = state.query || prefilledQuery;

  const handleSearch = useCallback(async (queryOverride?: string) => {
    const effectiveQuery = (queryOverride ?? (state.query || prefilledQuery)).trim();
    if (!effectiveQuery) return;

    setState((prev) => ({ ...prev, loading: true, searched: true }));

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: effectiveQuery,
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
  }, [prefilledQuery, state.location, state.query]);

  useEffect(() => {
    if (!urlQuery || state.searched || lastAutoSearchRef.current === urlQuery) return;
    lastAutoSearchRef.current = urlQuery;

    const timeoutId = window.setTimeout(() => {
      void handleSearch(urlQuery);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [handleSearch, state.searched, urlQuery]);

  const handleSave = useCallback(
    async (job: JobResult) => {
      if (savedJobUrls.has(job.url)) return;

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

      setSavedJobUrls((prev) => new Set(prev).add(job.url));
    },
    [savedJobUrls]
  );

  const sortedResults = [...state.results].sort((a, b) => {
    if (state.sortBy === "relevance") return b.relevanceScore - a.relevanceScore;
    if (!a.postedAt || !b.postedAt) return 0;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  const roleSummary = user?.cvGenerated
    ? "Search by title, skill, or tool. Save roles that belong in your pipeline."
    : "Search by title or skill now. Matching improves after you finish your resume.";

  return (
    <div className="jr-jobs-page">
      <section className="jr-page-hero jr-jobs-hero jr-page-hero-compact">
        <div className="jr-page-hero-copy">
          <span className="jr-page-eyebrow">Role discovery</span>
          <h2>Find roles that fit your current profile.</h2>
          <p>{roleSummary}</p>
        </div>
      </section>

      <div className="jr-search-panel jr-search-panel-inline">
        <div className="jr-search-bar">
          <div className="jr-search-field jr-search-field-wide">
            <label>Role, skills, or tools</label>
              <input
                type="text"
                placeholder="Product Manager, React, Python..."
                value={currentQuery}
                onChange={(e) => setState((prev) => ({ ...prev, query: e.target.value }))}
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleSearch();
                }
              }}
            />
          </div>
          <div className="jr-search-field">
            <label>Location</label>
            <div className="jr-search-input-icon">
              <LocationIcon size={14} />
              <input
                type="text"
                placeholder="City, region, or Remote"
                value={state.location}
                onChange={(e) => setState((prev) => ({ ...prev, location: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleSearch();
                  }
                }}
              />
            </div>
          </div>
          <button
            className="jr-btn jr-btn-primary"
            onClick={() => {
              void handleSearch();
            }}
            disabled={state.loading || !currentQuery.trim()}
          >
            <SearchIcon size={16} />
            {state.loading ? "Searching..." : "Search roles"}
          </button>
        </div>
        {!state.searched && !state.loading && (
          <p className="jr-search-inline-note">
            Search by job title, skills, or tools. Saved roles move straight into Applications.
          </p>
        )}
      </div>

      {state.searched && !state.loading && (
        <div className="jr-search-meta">
          <span className="jr-search-results-count">
            {sortedResults.length} job{sortedResults.length !== 1 ? "s" : ""} found
          </span>
          <div className="jr-search-sort">
            <button
              type="button"
              className={state.sortBy === "relevance" ? "active" : ""}
              onClick={() => setState((prev) => ({ ...prev, sortBy: "relevance" }))}
            >
              Best match
            </button>
            <button
              type="button"
              className={state.sortBy === "date" ? "active" : ""}
              onClick={() => setState((prev) => ({ ...prev, sortBy: "date" }))}
            >
              Most recent
            </button>
          </div>
        </div>
      )}

      {state.loading && (
        <div className="jr-jobs-list">
          {[1, 2, 3].map((item) => (
            <div key={item} className="jr-skeleton-card">
              <div className="jr-skeleton jr-skeleton-line long" />
              <div className="jr-skeleton jr-skeleton-line medium" />
              <div className="jr-skeleton jr-skeleton-line short" />
            </div>
          ))}
        </div>
      )}

      {!state.loading && sortedResults.length > 0 && (
        <div className="jr-jobs-list">
          {sortedResults.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSave={handleSave}
              onViewDetails={setSelectedJob}
              isSaved={savedJobUrls.has(job.url)}
            />
          ))}
        </div>
      )}

      {state.searched && !state.loading && sortedResults.length === 0 && (
        <div className="jr-empty jr-empty-compact">
          <div className="jr-empty-icon">
            <SearchIcon size={24} />
          </div>
          <h2 className="jr-empty-title">No roles matched this search</h2>
          <p className="jr-empty-text">
            Try a broader title, a different skill cluster, or a wider location to surface more opportunities.
          </p>
        </div>
      )}

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
