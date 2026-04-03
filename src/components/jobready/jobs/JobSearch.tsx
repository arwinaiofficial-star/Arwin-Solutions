"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { applicationsApi, type JobApplicationData } from "@/lib/api/client";
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
  const [trackedJobs, setTrackedJobs] = useState<Record<string, JobApplicationData>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<{ key: string; mode: "save" | "apply" } | null>(null);
  const lastAutoSearchRef = useRef<string | null>(null);

  const buildFallbackJobKey = useCallback((job: Pick<JobResult, "title" | "company">) => {
    return `${job.title.trim().toLowerCase()}::${job.company.trim().toLowerCase()}`;
  }, []);

  const buildApplicationKey = useCallback((application: Pick<JobApplicationData, "job_url" | "job_title" | "company">) => {
    return application.job_url || `${application.job_title.trim().toLowerCase()}::${application.company.trim().toLowerCase()}`;
  }, []);

  const buildJobKeys = useCallback((job: Pick<JobResult, "url" | "title" | "company">) => {
    const keys = [buildFallbackJobKey(job)];
    if (job.url) keys.unshift(job.url);
    return Array.from(new Set(keys));
  }, [buildFallbackJobKey]);

  const indexTrackedApplication = useCallback((application: JobApplicationData) => {
    setTrackedJobs((prev) => {
      const next = { ...prev };
      const fallbackKey = `${application.job_title.trim().toLowerCase()}::${application.company.trim().toLowerCase()}`;
      next[fallbackKey] = application;
      if (application.job_url) {
        next[application.job_url] = application;
      }
      return next;
    });
  }, []);

  const getTrackedJob = useCallback((job: Pick<JobResult, "url" | "title" | "company">) => {
    for (const key of buildJobKeys(job)) {
      if (trackedJobs[key]) return trackedJobs[key];
    }
    return null;
  }, [buildJobKeys, trackedJobs]);

  const loadTrackedJobs = useCallback(async () => {
    const res = await applicationsApi.list();
    if (!res.data) return;
    const nextState = res.data.reduce<Record<string, JobApplicationData>>((accumulator, application) => {
      const fallbackKey = `${application.job_title.trim().toLowerCase()}::${application.company.trim().toLowerCase()}`;
      accumulator[fallbackKey] = application;
      if (application.job_url) {
        accumulator[application.job_url] = application;
      } else {
        accumulator[buildApplicationKey(application)] = application;
      }
      return accumulator;
    }, {});
    setTrackedJobs(nextState);
  }, [buildApplicationKey]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTrackedJobs();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTrackedJobs]);

  const urlQuery = searchParams.get("q") || "";
  const prefilledQuery = urlQuery || (user?.cvData?.skills || []).slice(0, 5).join(", ");
  const suggestedSearches = Array.from(
    new Set(
      [
        ...(user?.cvData?.skills || [])
          .slice(0, 3)
          .map((skill) => `${skill} roles`),
        "Frontend developer",
        "React developer",
        "UI UX designer",
        "Product designer",
        "Software engineer",
      ].filter(Boolean)
    )
  ).slice(0, 5);

  useEffect(() => {
    if (!prefilledQuery || state.query || state.searched) return;

    const timeoutId = window.setTimeout(() => {
      setState((prev) =>
        prev.query || prev.searched ? prev : { ...prev, query: prefilledQuery }
      );
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [prefilledQuery, state.query, state.searched]);

  const currentQuery = state.query;

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

  const upsertApplication = useCallback(async (job: JobResult, status: "saved" | "applied") => {
    const existing = getTrackedJob(job);

    if (existing) {
      const result = await applicationsApi.update(existing.id, {
        status,
        job_url: job.url,
        salary: job.salary,
      });
      if (result.error || !result.data) {
        return { error: result.error || "Unable to update this role right now." };
      }
      indexTrackedApplication(result.data as JobApplicationData);
      return { data: result.data };
    }

    const result = await applicationsApi.create({
      job_title: job.title,
      company: job.company,
      location: job.location,
      job_url: job.url,
      salary: job.salary,
      source: job.source,
      status,
      description: job.description,
    });

    if (result.error || !result.data) {
      return { error: result.error || "Unable to save this role right now." };
    }

    indexTrackedApplication(result.data as JobApplicationData);
    return { data: result.data };
  }, [getTrackedJob, indexTrackedApplication]);

  const handleSave = useCallback(async (job: JobResult) => {
    const key = buildFallbackJobKey(job);
    if (getTrackedJob(job)) return;

    setActionError(null);
    setActiveAction({ key, mode: "save" });
    const result = await upsertApplication(job, "saved");
    if (result.error) {
      setActionError(result.error);
    }
    setActiveAction(null);
  }, [buildFallbackJobKey, getTrackedJob, upsertApplication]);

  const handleApply = useCallback(async (job: JobResult) => {
    const key = buildFallbackJobKey(job);
    setActionError(null);
    setActiveAction({ key, mode: "apply" });

    const popup =
      typeof window !== "undefined" && job.url
        ? window.open("", "_blank", "noopener,noreferrer")
        : null;

    const result = await upsertApplication(job, "applied");
    if (result.error) {
      popup?.close();
      setActionError(result.error);
      setActiveAction(null);
      return;
    }

    if (job.url) {
      if (popup) {
        popup.location.replace(job.url);
      } else if (typeof window !== "undefined") {
        window.open(job.url, "_blank", "noopener,noreferrer");
      }
    }

    setActiveAction(null);
  }, [buildFallbackJobKey, upsertApplication]);

  const sortedResults = [...state.results].sort((a, b) => {
    if (state.sortBy === "relevance") return b.relevanceScore - a.relevanceScore;
    if (!a.postedAt || !b.postedAt) return 0;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  const roleSummary = user?.cvGenerated
    ? "Search by title, skill, or tool, then track the roles worth pursuing."
    : "Search now and tighten your resume later for stronger matching.";

  return (
    <div className="jr-jobs-page">
      <section className="jr-page-hero jr-jobs-hero jr-page-hero-compact">
        <div className="jr-page-hero-copy">
          <span className="jr-page-eyebrow">Jobs</span>
          <h2>Find roles that fit.</h2>
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
        {!state.searched && !state.loading && suggestedSearches.length > 0 && (
          <div className="jr-chip-row jr-job-suggestion-row" aria-label="Suggested searches">
            {suggestedSearches.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="jr-filter-chip"
                onClick={() => {
                  setState((prev) => ({ ...prev, query: suggestion }));
                  void handleSearch(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        {!state.searched && !state.loading && (
          <p className="jr-search-inline-note">
            Saved roles move straight into Applications.
          </p>
        )}
        {actionError && (
          <p className="jr-input-error-text jr-search-inline-note" role="alert">
            {actionError}
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
              onApply={handleApply}
              onViewDetails={setSelectedJob}
              trackingStatus={getTrackedJob(job)?.status || null}
              actionLoading={
                activeAction?.key === buildFallbackJobKey(job) ? activeAction.mode : null
              }
            />
          ))}
        </div>
      )}

      {!state.searched && !state.loading && (
        <div className="jr-empty jr-jobs-empty-state">
          <div className="jr-empty-icon">
            <SearchIcon size={24} />
          </div>
          <h2 className="jr-empty-title">Start with a focused search</h2>
          <p className="jr-empty-text">
            Search by role title, skill, or tool. Use one of the quick searches above if you want to move fast.
          </p>
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
          onApply={handleApply}
          trackingStatus={getTrackedJob(selectedJob)?.status || null}
          actionLoading={
            activeAction?.key === buildFallbackJobKey(selectedJob)
              ? activeAction.mode
              : null
          }
        />
      )}
    </div>
  );
}
