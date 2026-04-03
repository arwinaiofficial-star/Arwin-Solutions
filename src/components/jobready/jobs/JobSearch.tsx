"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  applicationsApi,
  jobPrepareApi,
  type JobApplicationData,
} from "@/lib/api/client";
import {
  LocationIcon,
  SearchIcon,
  BriefcaseIcon,
  ExternalLinkIcon,
  ClipboardIcon,
  SparklesIcon,
  CheckIcon,
} from "@/components/icons/Icons";
import { JobResult, JobSearchState } from "./types";
import JobCard from "./JobCard";
import "@/app/jobready/jobready.css";

interface PreparationState {
  loading: boolean;
  error: string | null;
  data: {
    aiTips: string;
    matchedSkills: string[];
    missingSkills: string[];
    matchScore: number;
    coverLetterSnippet: string;
  } | null;
  jobKey: string | null;
}

export default function JobSearch() {
  const router = useRouter();
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
  const [selectedJobKey, setSelectedJobKey] = useState<string | null>(null);
  const [trackedJobs, setTrackedJobs] = useState<Record<string, JobApplicationData>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<{ key: string; mode: "save" | "apply" } | null>(null);
  const [preparation, setPreparation] = useState<PreparationState>({
    loading: false,
    error: null,
    data: null,
    jobKey: null,
  });
  const lastAutoSearchRef = useRef<string | null>(null);

  const buildFallbackJobKey = useCallback((job: Pick<JobResult, "title" | "company">) => {
    return `${job.title.trim().toLowerCase()}::${job.company.trim().toLowerCase()}`;
  }, []);

  const buildApplicationKey = useCallback((application: Pick<JobApplicationData, "job_url" | "job_title" | "company">) => {
    return application.job_url || `${application.job_title.trim().toLowerCase()}::${application.company.trim().toLowerCase()}`;
  }, []);

  const buildJobSelectionKey = useCallback((job: Pick<JobResult, "url" | "title" | "company">) => {
    return job.url || buildFallbackJobKey(job);
  }, [buildFallbackJobKey]);

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
        ...(user?.cvData?.skills || []).slice(0, 3).map((skill) => `${skill} roles`),
        "Frontend developer",
        "Software engineer",
        "Product manager",
        "UI UX designer",
        "Backend developer",
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

    setActionError(null);
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
    if (!job.url) {
      setActionError("This job source did not provide a live application link.");
      return;
    }

    const key = buildFallbackJobKey(job);
    setActionError(null);
    setActiveAction({ key, mode: "apply" });

    const popup =
      typeof window !== "undefined"
        ? window.open("", "_blank", "noopener,noreferrer")
        : null;

    const result = await upsertApplication(job, "applied");
    if (result.error) {
      popup?.close();
      setActionError(result.error);
      setActiveAction(null);
      return;
    }

    if (popup) {
      popup.location.replace(job.url);
    } else if (typeof window !== "undefined") {
      window.open(job.url, "_blank", "noopener,noreferrer");
    }

    setActiveAction(null);
  }, [buildFallbackJobKey, upsertApplication]);

  const sortedResults = useMemo(() => {
    const next = [...state.results];
    next.sort((a, b) => {
      if (state.sortBy === "relevance") return b.relevanceScore - a.relevanceScore;
      if (!a.postedAt || !b.postedAt) return 0;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
    return next;
  }, [state.results, state.sortBy]);

  const selectedJob = useMemo(() => {
    if (sortedResults.length === 0) return null;
    if (!selectedJobKey) return sortedResults[0];
    return sortedResults.find((job) => buildJobSelectionKey(job) === selectedJobKey) || sortedResults[0];
  }, [buildJobSelectionKey, selectedJobKey, sortedResults]);

  const activeSelectedJobKey = selectedJob ? buildJobSelectionKey(selectedJob) : null;

  useEffect(() => {
    if (!selectedJob || !activeSelectedJobKey || !user?.cvData) {
      return;
    }

    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;
      setPreparation({
        loading: true,
        error: null,
        data: null,
        jobKey: activeSelectedJobKey,
      });
    });

    void jobPrepareApi.prepare({
      jobTitle: selectedJob.title,
      jobDescription: selectedJob.description,
      jobCompany: selectedJob.company,
      jobLocation: selectedJob.location,
      cvData: user.cvData as unknown as Record<string, unknown>,
    }).then((result) => {
      if (cancelled) return;

      if (result.error || !result.data) {
        setPreparation({
          loading: false,
          error: result.error || "Unable to prepare this application right now.",
          data: null,
          jobKey: activeSelectedJobKey,
        });
        return;
      }

      setPreparation({
        loading: false,
        error: null,
        data: result.data,
        jobKey: activeSelectedJobKey,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [activeSelectedJobKey, selectedJob, user?.cvData]);

  const selectedTracking = selectedJob ? getTrackedJob(selectedJob) : null;
  const selectedActionLoading =
    selectedJob && activeAction?.key === buildFallbackJobKey(selectedJob)
      ? activeAction.mode
      : null;
  const prepMatchesSelection = preparation.jobKey === activeSelectedJobKey;
  const visiblePreparation = prepMatchesSelection ? preparation.data : null;
  const visiblePreparationError = prepMatchesSelection ? preparation.error : null;
  const visiblePreparationLoading =
    Boolean(selectedJob && user?.cvData) && (!prepMatchesSelection || preparation.loading);

  const roleSummary = user?.cvGenerated
    ? "Search roles, review the fit with your resume, then save or apply from one place."
    : "Search now, then connect your resume to unlock match guidance and application prep.";

  return (
    <div className="jr-jobs-page">
      <section className="jr-page-hero jr-jobs-hero jr-page-hero-compact">
        <div className="jr-page-hero-copy">
          <span className="jr-page-eyebrow">Jobs</span>
          <h2>Search, review, then take action.</h2>
          <p>{roleSummary}</p>
        </div>
      </section>

      <div className="jr-search-panel jr-search-panel-inline">
        <div className="jr-search-bar">
          <div className="jr-search-field jr-search-field-wide">
            <label>Role, skills, or tools</label>
            <input
              type="text"
              placeholder="Frontend developer, Product manager, React..."
              value={currentQuery}
              onChange={(event) => setState((prev) => ({ ...prev, query: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
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
                onChange={(event) => setState((prev) => ({ ...prev, location: event.target.value }))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
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
            Saved roles go into Applications. Apply now marks the role as applied and opens the live posting.
          </p>
        )}

        {actionError && (
          <p className="jr-input-error-text jr-search-inline-note" role="alert">
            {actionError}
          </p>
        )}
      </div>

      <div className="jr-jobs-workspace">
        <div className="jr-jobs-results">
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
                  onViewDetails={(jobToReview) => setSelectedJobKey(buildJobSelectionKey(jobToReview))}
                  trackingStatus={getTrackedJob(job)?.status || null}
                  actionLoading={activeAction?.key === buildFallbackJobKey(job) ? activeAction.mode : null}
                  selected={selectedJob ? buildJobSelectionKey(selectedJob) === buildJobSelectionKey(job) : false}
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
                Search by role title or skill cluster, then use the review panel to decide whether to save or apply.
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
                Try a broader title, a simpler skill phrase, or a wider location to surface more opportunities.
              </p>
            </div>
          )}
        </div>

        <aside className="jr-job-focus">
          {!selectedJob ? (
            <div className="jr-job-focus-card jr-job-focus-empty">
              <span className="jr-page-eyebrow">Workflow</span>
              <h3>Search, review, then apply.</h3>
              <div className="jr-workspace-rail-list">
                <div className="jr-workspace-rail-item">
                  <span>1</span>
                  <p>Run one focused search.</p>
                </div>
                <div className="jr-workspace-rail-item">
                  <span>2</span>
                  <p>Select a role to review the fit, matched skills, and application prep.</p>
                </div>
                <div className="jr-workspace-rail-item">
                  <span>3</span>
                  <p>Save the role or apply now, then continue in Applications.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="jr-job-focus-card">
              <div className="jr-job-focus-head">
                <div>
                  <div className="jr-job-focus-topline">
                    <span className={`jr-match-pill jr-match-pill-${matchTone(selectedJob.relevanceScore)}`}>
                      {selectedJob.relevanceScore >= 70
                        ? "Strong fit"
                        : selectedJob.relevanceScore >= 40
                          ? "Good fit"
                          : "Stretch"}
                    </span>
                    <span className={`jr-job-focus-status jr-job-focus-status-${selectedTracking?.status || "none"}`}>
                      {formatTrackingStatus(selectedTracking?.status || null)}
                    </span>
                  </div>
                  <h3>{selectedJob.title}</h3>
                  <p className="jr-job-focus-company">{selectedJob.company}</p>
                  <div className="jr-job-focus-meta">
                    {selectedJob.location && (
                      <span>
                        <LocationIcon size={12} />
                        {selectedJob.location}
                      </span>
                    )}
                    {selectedJob.salary && (
                      <span>
                        <BriefcaseIcon size={12} />
                        {selectedJob.salary}
                      </span>
                    )}
                    {selectedJob.jobType && <span>{selectedJob.jobType}</span>}
                  </div>
                </div>

                <div className={`jr-job-focus-score jr-job-focus-score-${matchTone(selectedJob.relevanceScore)}`}>
                  <strong>{selectedJob.relevanceScore}%</strong>
                  <span>match</span>
                </div>
              </div>

              <div className="jr-job-focus-actions">
                <button
                  className={`jr-btn ${selectedTracking ? "jr-btn-secondary" : "jr-btn-ghost"}`}
                  onClick={() => void handleSave(selectedJob)}
                  disabled={Boolean(selectedTracking) || selectedActionLoading !== null}
                >
                  <ClipboardIcon size={14} />
                  {selectedActionLoading === "save" ? "Saving..." : selectedTracking ? "Tracked" : "Save to Applications"}
                </button>
                <button
                  className="jr-btn jr-btn-primary"
                  onClick={() => void handleApply(selectedJob)}
                  disabled={selectedActionLoading !== null || !selectedJob.url}
                >
                  <ExternalLinkIcon size={14} />
                  {selectedActionLoading === "apply"
                    ? "Opening..."
                    : selectedTracking?.status === "applied" || selectedTracking?.status === "interview" || selectedTracking?.status === "offer"
                      ? "Open role again"
                      : "Apply now"}
                </button>
                <button className="jr-btn jr-btn-secondary" onClick={() => router.push("/jobready/app/applications")}>
                  <CheckIcon size={14} />
                  Applications
                </button>
              </div>

              {!selectedJob.url && (
                <p className="jr-text-error">This result does not include a live application link.</p>
              )}

              <div className="jr-job-prep-card">
                <div className="jr-job-prep-header">
                  <div>
                    <span className="jr-page-eyebrow">Application prep</span>
                    <h4>Use your resume before you apply.</h4>
                  </div>
                  {visiblePreparation && (
                    <div className={`jr-job-prep-score jr-job-prep-score-${matchTone(visiblePreparation.matchScore)}`}>
                      <strong>{visiblePreparation.matchScore}%</strong>
                      <span>fit</span>
                    </div>
                  )}
                </div>

                {!user?.cvData && (
                  <p className="jr-text-muted">
                    Finish a resume in the builder to unlock matched skills, missing skills, and cover-letter prep here.
                  </p>
                )}

                {user?.cvData && visiblePreparationLoading && (
                  <div className="jr-job-prep-loading">
                    <SparklesIcon size={14} />
                    Preparing tailored guidance from your resume...
                  </div>
                )}

                {user?.cvData && visiblePreparationError && !visiblePreparationLoading && (
                  <p className="jr-text-error">{visiblePreparationError}</p>
                )}

                {user?.cvData && visiblePreparation && !visiblePreparationLoading && (
                  <>
                    <div className="jr-job-prep-bar" aria-hidden="true">
                      <div style={{ width: `${visiblePreparation.matchScore}%` }} />
                    </div>

                    <div className="jr-job-prep-grid">
                      <div className="jr-job-prep-section">
                        <h5>Matched skills</h5>
                        <div className="jr-job-prep-tags">
                          {visiblePreparation.matchedSkills.length > 0 ? (
                            visiblePreparation.matchedSkills.slice(0, 6).map((skill) => (
                              <span key={skill} className="jr-badge jr-badge-green">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="jr-text-muted">No direct skill overlaps surfaced yet.</span>
                          )}
                        </div>
                      </div>

                      <div className="jr-job-prep-section">
                        <h5>Missing signals</h5>
                        <div className="jr-job-prep-tags">
                          {visiblePreparation.missingSkills.length > 0 ? (
                            visiblePreparation.missingSkills.slice(0, 6).map((skill) => (
                              <span key={skill} className="jr-badge jr-badge-yellow">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="jr-text-muted">No critical keyword gaps detected.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="jr-job-prep-section">
                      <h5>What to emphasize</h5>
                      <div className="jr-job-prep-list">
                        {extractTips(visiblePreparation.aiTips).map((tip) => (
                          <div key={tip} className="jr-job-prep-tip">
                            <span />
                            <p>{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {visiblePreparation.coverLetterSnippet && (
                      <div className="jr-job-prep-section">
                        <h5>Cover letter snippet</h5>
                        <div className="jr-job-prep-snippet">{visiblePreparation.coverLetterSnippet}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="jr-job-focus-section">
                <h4>Role snapshot</h4>
                <p className="jr-job-focus-description">{selectedJob.description || "No description was provided for this role."}</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function matchTone(score: number) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function formatTrackingStatus(status: string | null) {
  if (!status) return "Not tracked";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function extractTips(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*\d.]+\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}
