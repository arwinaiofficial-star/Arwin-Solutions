"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, type GeneratedCV } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import {
  applicationsApi,
  jobPrepareApi,
  resumeApi,
  type JobApplicationData,
} from "@/lib/api/client";
import {
  buildSafeCoverLetterSnippet,
  computeResumeJobMatch,
} from "@/lib/jobMatch";
import {
  BriefcaseIcon,
  ClipboardIcon,
  ClockIcon,
  DocumentIcon,
  DownloadIcon,
  EditIcon,
  ExternalLinkIcon,
  LocationIcon,
  ResetIcon,
  SearchIcon,
  SparklesIcon,
  TrashIcon,
  XIcon,
} from "@/components/icons/Icons";

type ToastType = "success" | "error" | "info";

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

interface TrackedJob {
  id: string;
  title: string;
  company: string;
  url: string;
  location?: string;
  salary?: string;
  source?: string;
  status: "saved" | "applied" | "interview" | "offer";
  addedAt: string;
  notes?: string;
  description?: string;
}

interface PrepareData {
  aiTips: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  coverLetterSnippet: string;
}

function buildResumeFacts(cvData?: GeneratedCV | null): string {
  if (!cvData) return "No resume facts available.";

  const latestExperience = cvData.experience
    ?.slice(0, 3)
    .map((entry) => {
      const highlights = (entry.highlights || []).filter(Boolean).slice(0, 3).join(" | ");
      return `${entry.title} at ${entry.company}${highlights ? `: ${highlights}` : ""}`;
    })
    .join("\n");

  return [
    `Name: ${cvData.personalInfo?.name || "Not provided"}`,
    `Location: ${cvData.personalInfo?.location || "Not provided"}`,
    `Summary: ${cvData.summary || "Not provided"}`,
    `Skills: ${(cvData.skills || []).join(", ") || "Not provided"}`,
    `Experience:\n${latestExperience || "Not provided"}`,
  ].join("\n");
}

function buildFallbackPrepareData(job: JobResult, cvData: GeneratedCV | null | undefined): PrepareData {
  const insights = computeResumeJobMatch(cvData, job);

  return {
    aiTips: [
      insights.matchedSkills.length > 0
        ? `Lead with your strongest overlap: ${insights.matchedSkills.slice(0, 3).join(", ")}.`
        : `Lead with adjacent experience that supports a move into the ${job.title} role.`,
      `Rewrite your summary so the first line clearly targets ${job.title}.`,
      insights.missingKeywords.length > 0
        ? `Address missing keywords like ${insights.missingKeywords.slice(0, 3).join(", ")} only where you can support them truthfully.`
        : "Quantify outcomes in your most relevant bullets to strengthen the application.",
    ].filter(Boolean).join("\n"),
    matchedSkills: insights.matchedSkills,
    missingSkills: insights.missingKeywords,
    matchScore: insights.matchScore,
    coverLetterSnippet: buildSafeCoverLetterSnippet(cvData, job.title, job.company),
  };
}

function mergePrepareData(job: JobResult, cvData: GeneratedCV | null | undefined, prepareData: PrepareData): PrepareData {
  if (!cvData) return prepareData;

  const fallback = buildFallbackPrepareData(job, cvData);
  return {
    ...prepareData,
    matchedSkills: prepareData.matchedSkills.length > 0 ? prepareData.matchedSkills : fallback.matchedSkills,
    missingSkills: prepareData.missingSkills.length > 0 ? prepareData.missingSkills : fallback.missingSkills,
    matchScore: Math.max(prepareData.matchScore, fallback.matchScore),
    coverLetterSnippet: prepareData.coverLetterSnippet?.trim() ? prepareData.coverLetterSnippet : fallback.coverLetterSnippet,
  };
}

function dbAppToTrackedJob(app: JobApplicationData): TrackedJob {
  return {
    id: app.id,
    title: app.job_title,
    company: app.company,
    url: app.job_url || "",
    location: app.location || undefined,
    salary: app.salary || undefined,
    source: app.source || undefined,
    status: (app.status as TrackedJob["status"]) || "saved",
    addedAt: app.applied_at,
    notes: app.notes || undefined,
    description: app.description || undefined,
  };
}

function scoreJob(job: JobResult, cvData?: GeneratedCV | null) {
  if (!cvData) return job.relevanceScore || 0;
  return Math.max(job.relevanceScore || 0, computeResumeJobMatch(cvData, job).matchScore);
}

function SectionIntro() {
  return (
    <div className="jsw-intro">
      <span className="jsw-eyebrow">Job search hub</span>
      <h2>Search, prepare, tailor, and track from one route.</h2>
      <p>
        This is the migrated core workflow from the legacy dashboard. Pick a target role, prepare against it,
        tailor your resume and cover letter, then keep pipeline state trustworthy.
      </p>
    </div>
  );
}

export default function JobSearchWorkspace() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [prepareJob, setPrepareJob] = useState<JobResult | null>(null);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [coverLetterJobId, setCoverLetterJobId] = useState<string | null>(null);
  const [tailoredResumeJobId, setTailoredResumeJobId] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<"search" | "tailor" | "tracker">("search");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const currentTrackedJob = selectedJob
    ? trackedJobs.find((tracked) => tracked.title === selectedJob.title && tracked.company === selectedJob.company) || null
    : null;

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({ message, type });
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    applicationsApi.list().then((result) => {
      if (result.data) {
        setTrackedJobs(result.data.map(dbAppToTrackedJob));
      }
    });
  }, []);

  const saveToTracker = useCallback(async (job: JobResult) => {
    if (trackedJobs.find((tracked) => tracked.title === job.title && tracked.company === job.company)) {
      addToast("Already in tracker", "info");
      return;
    }

    const result = await applicationsApi.create({
      job_title: job.title,
      company: job.company,
      location: job.location,
      job_url: job.url,
      salary: job.salary,
      source: job.source,
      status: "saved",
      description: job.description,
    });

    if (result.data) {
      setTrackedJobs((prev) => [dbAppToTrackedJob(result.data!), ...prev]);
      setActivePane("tracker");
      trackEvent("jobready_tracker_saved", {
        jobId: job.id,
        title: job.title,
        company: job.company,
        source: job.source,
      });
      addToast(`Saved "${job.title}" to tracker`, "success");
    } else {
      addToast(result.error || "Failed to save", "error");
    }
  }, [addToast, trackedJobs]);

  const logApplication = useCallback(async (job: JobResult) => {
    const existing = trackedJobs.find((tracked) => tracked.title === job.title && tracked.company === job.company);

    if (existing) {
      if (existing.status !== "saved") {
        addToast(`Already logged in ${existing.status}`, "info");
        return;
      }

      const result = await applicationsApi.update(existing.id, { status: "applied" });
      if (result.data) {
        setTrackedJobs((prev) => prev.map((tracked) => tracked.id === existing.id ? { ...tracked, status: "applied" } : tracked));
        setActivePane("tracker");
        trackEvent("jobready_application_logged", {
          jobId: job.id,
          title: job.title,
          company: job.company,
          mode: "update",
        });
        addToast(`Logged "${job.title}" as applied`, "success");
      } else {
        addToast(result.error || "Failed to log application", "error");
      }
      return;
    }

    const created = await applicationsApi.create({
      job_title: job.title,
      company: job.company,
      location: job.location,
      job_url: job.url,
      salary: job.salary,
      source: job.source,
      status: "applied",
      description: job.description,
    });

    if (created.data) {
      setTrackedJobs((prev) => [dbAppToTrackedJob(created.data!), ...prev]);
      setActivePane("tracker");
      trackEvent("jobready_application_logged", {
        jobId: job.id,
        title: job.title,
        company: job.company,
        mode: "create",
      });
      addToast(`Logged "${job.title}" as applied`, "success");
    } else {
      addToast(created.error || "Failed to log application", "error");
    }
  }, [addToast, trackedJobs]);

  return (
    <>
      <style>{workspaceStyles}</style>
      <SectionIntro />

      <div className="jsw-tabbar">
        <button className={activePane === "search" ? "jsw-tab-active" : ""} onClick={() => setActivePane("search")}>Match</button>
        <button className={activePane === "tailor" ? "jsw-tab-active" : ""} onClick={() => setActivePane("tailor")}>Tailor</button>
        <button className={activePane === "tracker" ? "jsw-tab-active" : ""} onClick={() => setActivePane("tracker")}>Tracker</button>
      </div>

      {activePane === "search" && (
        <JobBoard
          user={{ cvData: user?.cvData || null, name: user?.name || "", email: user?.email || "" }}
          jobs={jobs}
          selectedJob={selectedJob}
          onSaveToTracker={saveToTracker}
          onSelectJob={(job, options) => {
            setSelectedJob(job);
            if (typeof options?.coverLetter === "string") {
              setCoverLetterText(options.coverLetter);
              setCoverLetterJobId(job.id);
            }
            if (options?.openTailor) {
              setActivePane("tailor");
            }
          }}
          onJobsChange={setJobs}
          onJobCountChange={() => undefined}
          onOpenCoverLetter={(job, text) => {
            setSelectedJob(job);
            setCoverLetterText(text);
            setCoverLetterJobId(job.id);
            setActivePane("tailor");
          }}
          onTailoredResumeApplied={setTailoredResumeJobId}
          addToast={addToast}
        />
      )}

      {activePane === "tailor" && (
        <TailorStudio
          job={selectedJob}
          initialText={coverLetterJobId === selectedJob?.id ? coverLetterText : ""}
          cvData={user?.cvData}
          onNavigateToJobs={() => setActivePane("search")}
          onSaveToTracker={saveToTracker}
          onLogApplication={logApplication}
          onTailoredResumeApplied={setTailoredResumeJobId}
          onCoverLetterChange={(text, jobId) => {
            setCoverLetterText(text);
            setCoverLetterJobId(jobId);
          }}
          trackedJob={currentTrackedJob}
          addToast={addToast}
        />
      )}

      {activePane === "tracker" && (
        <Tracker trackedJobs={trackedJobs} onUpdate={setTrackedJobs} addToast={addToast} />
      )}

      {prepareJob && (
        <PrepareModal
          job={prepareJob}
          cvData={user?.cvData}
          onClose={() => setPrepareJob(null)}
          onSaveToTracker={saveToTracker}
          onOpenCoverLetter={(job, text) => {
            setSelectedJob(job);
            setCoverLetterText(text);
            setCoverLetterJobId(job.id);
            setActivePane("tailor");
          }}
          onTailoredResumeApplied={setTailoredResumeJobId}
          addToast={addToast}
        />
      )}

      {activePane === "search" && selectedJob && (
        <div className="jsw-target-bar">
          <div>
            <span className="jsw-eyebrow">Current target</span>
            <strong>{selectedJob.title} at {selectedJob.company}</strong>
            <p>{tailoredResumeJobId === selectedJob.id ? "Tailored resume ready for this target." : "Open Tailor to adapt your resume and cover letter around this job."}</p>
          </div>
          <button className="jsw-secondary-btn" onClick={() => setActivePane("tailor")}>Open Tailor Studio</button>
        </div>
      )}

      {activePane === "search" && jobs.length > 0 && (
        <div className="jsw-legacy-actions">
          <button className="jsw-secondary-btn" onClick={() => setPrepareJob(selectedJob || jobs[0])}>
            <SparklesIcon size={14} />
            Prepare the current best fit
          </button>
        </div>
      )}

      {toast && <div className={`jsw-toast jsw-toast-${toast.type}`}>{toast.message}</div>}
    </>
  );
}

function JobBoard({
  user, jobs, selectedJob, onSaveToTracker, onSelectJob, onJobsChange, onJobCountChange, onOpenCoverLetter, onTailoredResumeApplied, addToast,
}: {
  user: { cvData?: GeneratedCV | null; name: string; email: string };
  jobs: JobResult[];
  selectedJob: JobResult | null;
  onSaveToTracker: (job: JobResult) => void;
  onSelectJob: (job: JobResult, options?: { coverLetter?: string; openTailor?: boolean }) => void;
  onJobsChange: (jobs: JobResult[]) => void;
  onJobCountChange: (count: number) => void;
  onOpenCoverLetter: (job: JobResult, text: string) => void;
  onTailoredResumeApplied: (jobId: string) => void;
  addToast: (msg: string, type: ToastType) => void;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [prepareJob, setPrepareJob] = useState<JobResult | null>(null);
  const autoSearchTimerRef = useRef<number | null>(null);
  const resumeSkills = user.cvData?.skills?.join(", ") || "";
  const resumeLocation = user.cvData?.personalInfo?.location || "";
  const hasResumeContext = Boolean(
    user.cvData && (user.cvData.skills?.length || user.cvData.summary?.trim() || user.cvData.experience?.length)
  );
  const [skillsInput, setSkillsInput] = useState(resumeSkills);
  const [locationInput, setLocationInput] = useState(resumeLocation);

  const handleSearch = useCallback(async (override?: { skills?: string; location?: string }) => {
    const nextSkills = (override?.skills ?? skillsInput).trim();
    const nextLocation = (override?.location ?? locationInput).trim();
    if (!nextSkills) return;
    setIsSearching(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: nextSkills, location: nextLocation, preferences: nextLocation }),
      });
      if (response.ok) {
        const data = await response.json();
        const results = data.jobs || [];
        onJobsChange(results);
        onJobCountChange(results.length);
        trackEvent("jobready_job_search_run", {
          query: nextSkills,
          location: nextLocation || "India",
          resultCount: results.length,
        });
      } else {
        addToast("Job search failed. Please try again.", "error");
      }
    } catch {
      addToast("Job search failed. Please check your connection and try again.", "error");
    }
    setHasSearched(true);
    setIsSearching(false);
  }, [addToast, locationInput, onJobCountChange, onJobsChange, skillsInput]);

  useEffect(() => {
    if (resumeSkills.trim() && !hasSearched) {
      autoSearchTimerRef.current = window.setTimeout(() => {
        void handleSearch({ skills: resumeSkills, location: resumeLocation });
      }, 0);
    }
    return () => {
      if (autoSearchTimerRef.current !== null) {
        window.clearTimeout(autoSearchTimerRef.current);
      }
    };
  }, [handleSearch, hasSearched, resumeLocation, resumeSkills]);

  return (
    <div className="jb">
      <h3 className="jb-title">Find better targets before you tailor.</h3>
      <p className="jb-sub">Search with resume context, compare fit, then prepare against the strongest opportunities.</p>

      <div className="jb-search">
        <div className="jb-field">
          <label>Skills & Keywords</label>
          <input value={skillsInput} onChange={(event) => setSkillsInput(event.target.value)} placeholder="React, Python, AWS..." onKeyDown={(event) => event.key === "Enter" && void handleSearch()} />
        </div>
        <div className="jb-field jb-field-sm">
          <label>Location</label>
          <input value={locationInput} onChange={(event) => setLocationInput(event.target.value)} placeholder="India" onKeyDown={(event) => event.key === "Enter" && void handleSearch()} />
        </div>
        <button className="jb-search-btn" onClick={() => { void handleSearch(); }} disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>

      {!hasSearched && !hasResumeContext && !skillsInput.trim() && (
        <div className="jb-empty">
          <BriefcaseIcon size={40} color="#475569" />
          <p style={{ fontWeight: 600, marginBottom: 4 }}>No resume detected</p>
          <p style={{ color: "#64748b", fontSize: "0.8125rem" }}>Build your resume in Documents Studio first so matching and tailoring use real context.</p>
        </div>
      )}

      {hasSearched && jobs.length === 0 && <div className="jb-empty"><p>No jobs found. Try different keywords.</p></div>}

      {hasSearched && jobs.length > 0 && (
        <div className="jb-result-count">
          <strong>{jobs.length}</strong> jobs found
          <span className="jb-result-sources"> from {[...new Set(jobs.map((job) => job.source))].join(", ")}</span>
        </div>
      )}

      {selectedJob && (
        <div className="jb-target-banner">
          <div>
            <span className="jsw-eyebrow">Current target job</span>
            <strong>{selectedJob.title} at {selectedJob.company}</strong>
            <p>Keep one target role in focus, then move into Tailor to adapt your resume and cover letter around it.</p>
          </div>
          <button className="jsw-secondary-btn" onClick={() => onOpenCoverLetter(selectedJob, "")}>Open Tailor</button>
        </div>
      )}

      <div className="jb-results">
        {[...jobs].sort((a, b) => scoreJob(b, user.cvData) - scoreJob(a, user.cvData)).map((job) => {
          const score = scoreJob(job, user.cvData);
          const isExpanded = expandedJob === job.id;
          const descText = job.description || "";
          const truncatedDesc = descText.length > 170 ? `${descText.slice(0, 170)}...` : descText;

          return (
            <div key={job.id} className={`jb-card ${isExpanded ? "jb-card-exp" : ""}`}>
              <div className="jb-card-top">
                <div className="jb-card-info">
                  <h4>{job.title}</h4>
                  <span className="jb-company">{job.company}</span>
                  <div className="jb-meta">
                    <span><LocationIcon size={12} /> {job.location}</span>
                    {job.salary && <span className="jb-salary">{job.salary}</span>}
                    {job.jobType && <span className="jb-type">{job.jobType}</span>}
                    {job.postedAt && <span><ClockIcon size={12} /> {job.postedAt}</span>}
                    <span className="jb-source">{job.source}</span>
                  </div>
                </div>
                <div className="jb-card-right">
                  <span className={`jb-score ${score >= 70 ? "jb-score-hi" : score >= 40 ? "jb-score-md" : "jb-score-lo"}`}>{score}% fit</span>
                </div>
              </div>

              <p className="jb-desc">{truncatedDesc}</p>
              {job.tags?.length ? (
                <div className="jb-tags">
                  {job.tags.slice(0, 8).map((tag) => <span key={tag} className="jb-tag">{tag}</span>)}
                </div>
              ) : null}

              <div className="jb-actions">
                <button className="jb-prepare-btn" onClick={() => { onSelectJob(job); setPrepareJob(job); }}>
                  <SparklesIcon size={14} />
                  Prepare
                </button>
                <button className={`jb-save-btn ${selectedJob?.id === job.id ? "jb-target-active" : ""}`} onClick={() => onSelectJob(job)}>
                  {selectedJob?.id === job.id ? "Current Target" : "Set as Target"}
                </button>
                <button className="jb-save-btn" onClick={() => onSaveToTracker(job)}>
                  <ClipboardIcon size={14} />
                  Save
                </button>
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="jb-apply-btn">
                  Open Role <ExternalLinkIcon size={12} />
                </a>
                <button className="jb-detail-btn" onClick={() => setExpandedJob(isExpanded ? null : job.id)}>
                  {isExpanded ? "Less" : "Details"}
                </button>
              </div>

              {isExpanded && <div className="jb-full-desc"><p>{job.description}</p></div>}
            </div>
          );
        })}
      </div>

      {prepareJob && (
        <PrepareModal
          job={prepareJob}
          cvData={user.cvData}
          onClose={() => setPrepareJob(null)}
          onSaveToTracker={onSaveToTracker}
          onOpenCoverLetter={onOpenCoverLetter}
          onTailoredResumeApplied={onTailoredResumeApplied}
          addToast={addToast}
        />
      )}
    </div>
  );
}

function TailorStudio({
  job,
  initialText,
  cvData,
  onNavigateToJobs,
  onSaveToTracker,
  onLogApplication,
  onTailoredResumeApplied,
  onCoverLetterChange,
  trackedJob,
  addToast,
}: {
  job: JobResult | null;
  initialText: string;
  cvData?: GeneratedCV | null;
  onNavigateToJobs: () => void;
  onSaveToTracker: (job: JobResult) => void;
  onLogApplication: (job: JobResult) => void;
  onTailoredResumeApplied: (jobId: string) => void;
  onCoverLetterChange: (text: string, jobId: string) => void;
  trackedJob: TrackedJob | null;
  addToast: (msg: string, type: ToastType) => void;
}) {
  const { saveGeneratedCV } = useAuth();
  const [tailoredSummary, setTailoredSummary] = useState<string | null>(null);
  const [tailoredSkills, setTailoredSkills] = useState<string[] | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);

  if (!job) {
    return (
      <div className="ts-empty">
        <span className="jsw-eyebrow">Tailor studio</span>
        <h2>Select one target job first.</h2>
        <p>Tailoring should happen around a single chosen opportunity. Pick a role from Match, then carry that context through ATS guidance, cover letter generation, and application tracking.</p>
        <button className="jsw-primary-btn" onClick={onNavigateToJobs}>Open Match</button>
      </div>
    );
  }

  const insights = computeResumeJobMatch(cvData, job);

  const tailorResume = async () => {
    if (!cvData) {
      addToast("Save your resume first so tailoring has real source data.", "error");
      return;
    }

    setIsTailoring(true);
    try {
      const result = await resumeApi.chat(
        `Tailor this resume for the following job. Return a JSON object with two keys: "summary" (a factual 2-3 sentence professional summary tailored for this role) and "skills" (an array of existing resume skills reordered by relevance, plus only directly supported adjacent keywords already evidenced by the resume).

Job: ${job.title} at ${job.company}
Job Description: ${job.description?.slice(0, 2000) || "Not provided"}

Resume Facts:
${buildResumeFacts(cvData)}

Rules:
- Use only facts present in the resume facts above.
- Do not invent years of experience, tools, companies, metrics, or placeholders.
- Keep the summary concise and ATS-friendly.

Return ONLY valid JSON: {"summary": "...", "skills": ["skill1", "skill2", ...]}`,
        "chat",
      );

      if (result.data?.reply) {
        const cleaned = result.data.reply.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
        try {
          const parsed = JSON.parse(cleaned);
          setTailoredSummary(parsed.summary || null);
          setTailoredSkills(Array.isArray(parsed.skills) ? parsed.skills : null);
          trackEvent("jobready_resume_tailored", {
            source: "tailor_studio",
            jobId: job.id,
            title: job.title,
            company: job.company,
          });
        } catch {
          setTailoredSummary(result.data.reply);
          setTailoredSkills(null);
        }
      }
    } catch {
      addToast("Tailoring failed. Please try again.", "error");
    }
    setIsTailoring(false);
  };

  const applyTailoredResume = async () => {
    if (!cvData) return;

    const updated = { ...cvData };
    if (tailoredSummary) updated.summary = tailoredSummary;
    if (tailoredSkills) updated.skills = tailoredSkills;

    saveGeneratedCV(updated);
    await resumeApi.save(updated as unknown as Record<string, unknown>, "final").catch(() => undefined);
    onTailoredResumeApplied(job.id);
    trackEvent("jobready_tailored_resume_applied", {
      source: "tailor_studio",
      jobId: job.id,
      title: job.title,
      company: job.company,
    });
    addToast(`Resume tailored for ${job.title}`, "success");
  };

  return (
    <div className="ts">
      <div className="ts-hero">
        <div>
          <span className="jsw-eyebrow">Selected job</span>
          <h2>{job.title}</h2>
          <p>{job.company} · {job.location} · {job.source}</p>
        </div>
        <div className="ts-actions">
          <button className="jsw-secondary-btn" onClick={() => onSaveToTracker(job)}>Save to Tracker</button>
          <button className="jsw-secondary-btn" onClick={() => onLogApplication(job)} disabled={trackedJob?.status === "applied" || trackedJob?.status === "interview" || trackedJob?.status === "offer"}>
            {trackedJob?.status === "applied" || trackedJob?.status === "interview" || trackedJob?.status === "offer" ? "Already Logged" : "Log Application"}
          </button>
          <a className="jsw-primary-btn" href={job.url} target="_blank" rel="noopener noreferrer">Open Apply Link</a>
        </div>
      </div>

      <div className="ts-grid">
        <div className="ts-card">
          <span className="jsw-eyebrow">Match overview</span>
          <strong>{insights.matchScore}% current fit</strong>
          <p>Use this as the job-focused workspace. The goal is to make one target application better, not jump between tools.</p>
        </div>
        <div className="ts-card">
          <span className="jsw-eyebrow">Matched skills</span>
          <div className="prep-skill-tags">
            {insights.matchedSkills.length > 0
              ? insights.matchedSkills.slice(0, 4).map((skill) => <span key={skill} className="prep-skill-tag prep-skill-matched">{skill}</span>)
              : <span className="ts-empty-copy">Run Match and Prepare to deepen tailoring.</span>}
          </div>
        </div>
        <div className="ts-card">
          <span className="jsw-eyebrow">Keywords to address</span>
          <div className="prep-skill-tags">
            {insights.missingKeywords.length > 0
              ? insights.missingKeywords.slice(0, 4).map((skill) => <span key={skill} className="prep-skill-tag prep-skill-missing">{skill}</span>)
              : <span className="ts-empty-copy">Your current resume already covers the strongest signals we detected.</span>}
          </div>
        </div>
      </div>

      <div className="ts-card">
        <span className="jsw-eyebrow">Tailored resume</span>
        <strong>{tailoredSummary ? "Tailored resume draft ready" : "Tailor this resume for the target job"}</strong>
        <p>{tailoredSummary ? "Review the tailored summary and apply it to your resume version before moving to Apply." : "This stage is only complete when a tailored resume version exists for the selected job."}</p>
        {tailoredSummary && <div className="prep-tailor-text">{tailoredSummary}</div>}
        {tailoredSkills && tailoredSkills.length > 0 && (
          <div className="prep-skill-tags">
            {tailoredSkills.map((skill) => <span key={skill} className="prep-skill-tag prep-skill-matched">{skill}</span>)}
          </div>
        )}
        <div className="ts-actions">
          <button className="jsw-primary-btn" onClick={tailorResume} disabled={isTailoring}>
            {isTailoring ? "Tailoring..." : tailoredSummary ? "Regenerate Tailoring" : "Tailor Resume"}
          </button>
          {tailoredSummary && <button className="jsw-secondary-btn" onClick={applyTailoredResume}>Apply Tailored Resume</button>}
        </div>
      </div>

      <CoverLetterGenerator
        key={`${job.id}:${initialText}`}
        job={job}
        initialText={initialText}
        cvData={cvData}
        onTextChange={(text) => onCoverLetterChange(text, job.id)}
        addToast={addToast}
      />
    </div>
  );
}

function PrepareModal({
  job, cvData, onClose, onSaveToTracker, onOpenCoverLetter, onTailoredResumeApplied, addToast,
}: {
  job: JobResult;
  cvData: GeneratedCV | null | undefined;
  onClose: () => void;
  onSaveToTracker: (job: JobResult) => void;
  onOpenCoverLetter: (job: JobResult, text: string) => void;
  onTailoredResumeApplied: (jobId: string) => void;
  addToast: (msg: string, type: ToastType) => void;
}) {
  const { saveGeneratedCV } = useAuth();
  const [data, setData] = useState<PrepareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tips" | "cover" | "skills" | "tailor" | "ats">("tips");
  const [tailoredSummary, setTailoredSummary] = useState<string | null>(null);
  const [tailoredSkills, setTailoredSkills] = useState<string[] | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [atsKeywords, setAtsKeywords] = useState<{ matched: string[]; missing: string[]; score: number; suggestions: string[] } | null>(null);
  const [isAnalyzingAts, setIsAnalyzingAts] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await jobPrepareApi.prepare({
          jobTitle: job.title,
          jobDescription: job.description,
          jobCompany: job.company,
          jobLocation: job.location,
          cvData: (cvData as unknown as Record<string, unknown>) || { skills: [], experience: [] },
        });
        if (result.data) {
          setData(mergePrepareData(job, cvData, result.data));
          trackEvent("jobready_job_prepare_loaded", {
            jobId: job.id,
            title: job.title,
            company: job.company,
            source: "api",
          });
        } else {
          setData(buildFallbackPrepareData(job, cvData));
        }
      } catch {
        setData(buildFallbackPrepareData(job, cvData));
      }
      setLoading(false);
    };
    void load();
  }, [job, cvData]);

  const tailorResume = async () => {
    if (!cvData) {
      addToast("Save your resume first so tailoring has real source data.", "error");
      return;
    }
    setIsTailoring(true);
    try {
      const result = await resumeApi.chat(
        `Tailor this resume for the following job. Return a JSON object with two keys: "summary" (a factual 2-3 sentence professional summary tailored for this role) and "skills" (an array of existing resume skills reordered by relevance, plus only directly supported adjacent keywords already evidenced by the resume).

Job: ${job.title} at ${job.company}
Job Description: ${job.description?.slice(0, 2000) || "Not provided"}

Resume Facts:
${buildResumeFacts(cvData)}

Rules:
- Use only facts present in the resume facts above.
- Do not invent years of experience, tools, companies, metrics, or placeholders.
- Keep the summary concise and ATS-friendly.

Return ONLY valid JSON: {"summary": "...", "skills": ["skill1", "skill2", ...]}`,
        "chat",
      );
      if (result.data?.reply) {
        try {
          const cleaned = result.data.reply.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
          const parsed = JSON.parse(cleaned);
          setTailoredSummary(parsed.summary || null);
          setTailoredSkills(Array.isArray(parsed.skills) ? parsed.skills : null);
          trackEvent("jobready_resume_tailored", {
            source: "prepare_modal",
            jobId: job.id,
            title: job.title,
            company: job.company,
          });
        } catch {
          setTailoredSummary(result.data.reply);
        }
      }
    } catch {
      addToast("Tailoring failed. Please try again.", "error");
    }
    setIsTailoring(false);
  };

  const applyTailoredResume = () => {
    if (!cvData) return;
    const updated = { ...cvData };
    if (tailoredSummary) updated.summary = tailoredSummary;
    if (tailoredSkills) updated.skills = tailoredSkills;
    saveGeneratedCV(updated);
    void resumeApi.save(updated as unknown as Record<string, unknown>, "final");
    onTailoredResumeApplied(job.id);
    trackEvent("jobready_tailored_resume_applied", {
      source: "prepare_modal",
      jobId: job.id,
      title: job.title,
      company: job.company,
    });
    addToast(`Resume tailored for ${job.title} at ${job.company}`, "success");
  };

  const analyzeAtsKeywords = async () => {
    if (!cvData) {
      addToast("Save your resume first so ATS analysis can run.", "error");
      return;
    }
    setIsAnalyzingAts(true);
    try {
      const result = await resumeApi.chat(
        `Analyze ATS keyword match between this resume and job posting. Return a JSON object with: "matched" (array of keywords found in both), "missing" (array of important keywords from job NOT in resume), "score" (0-100 ATS compatibility score), "suggestions" (array of 3-5 specific rewrite suggestions to improve ATS score).

Job: ${job.title} at ${job.company}
Job Description: ${job.description?.slice(0, 2000) || "Not provided"}

Resume Facts:
${buildResumeFacts(cvData)}

Return ONLY valid JSON: {"matched": [...], "missing": [...], "score": number, "suggestions": [...]}`,
        "chat",
      );
      if (result.data?.reply) {
        try {
          const cleaned = result.data.reply.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
          const parsed = JSON.parse(cleaned);
          const fallback = buildFallbackPrepareData(job, cvData);
          setAtsKeywords({
            matched: Array.isArray(parsed.matched) && parsed.matched.length > 0 ? parsed.matched : fallback.matchedSkills,
            missing: Array.isArray(parsed.missing) && parsed.missing.length > 0 ? parsed.missing : fallback.missingSkills,
            score: typeof parsed.score === "number" ? Math.max(parsed.score, fallback.matchScore) : fallback.matchScore,
            suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 ? parsed.suggestions : fallback.aiTips.split("\n"),
          });
          trackEvent("jobready_job_ats_analyzed", {
            jobId: job.id,
            title: job.title,
            company: job.company,
            score: typeof parsed.score === "number" ? Math.max(parsed.score, fallback.matchScore) : fallback.matchScore,
          });
        } catch {
          const fallback = buildFallbackPrepareData(job, cvData);
          setAtsKeywords({
            matched: fallback.matchedSkills,
            missing: fallback.missingSkills,
            score: fallback.matchScore,
            suggestions: [result.data.reply],
          });
        }
      }
    } catch {
      const fallback = buildFallbackPrepareData(job, cvData);
      setAtsKeywords({
        matched: fallback.matchedSkills,
        missing: fallback.missingSkills,
        score: fallback.matchScore,
        suggestions: fallback.aiTips.split("\n"),
      });
      addToast("Unable to complete ATS analysis right now.", "error");
    }
    setIsAnalyzingAts(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-prepare" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Prepare to Apply</h3>
            <p className="modal-subtitle">{job.title} at {job.company}</p>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={16} /></button>
        </div>

        {loading ? (
          <div className="modal-loading"><p>Analyzing job match with AI...</p></div>
        ) : data ? (
          <>
            <div className={`prep-score-banner ${data.matchScore >= 60 ? "prep-score-hi" : data.matchScore >= 30 ? "prep-score-md" : "prep-score-lo"}`}>
              <div className="prep-score-circle"><span className="prep-score-num">{data.matchScore}%</span></div>
              <div>
                <strong>Match Score</strong>
                <p>{data.matchScore >= 60 ? "Strong match. Tighten the application package." : data.matchScore >= 30 ? "Moderate match. Tailor the resume before applying." : "Low match. Consider heavier tailoring or a different target."}</p>
              </div>
            </div>

            <div className="prep-tabs">
              <button className={activeTab === "tips" ? "prep-tab-active" : ""} onClick={() => setActiveTab("tips")}>Tips</button>
              <button className={activeTab === "skills" ? "prep-tab-active" : ""} onClick={() => setActiveTab("skills")}>Skills</button>
              <button className={activeTab === "tailor" ? "prep-tab-active" : ""} onClick={() => { setActiveTab("tailor"); if (!tailoredSummary && !isTailoring) void tailorResume(); }}>Tailor Resume</button>
              <button className={activeTab === "ats" ? "prep-tab-active" : ""} onClick={() => { setActiveTab("ats"); if (!atsKeywords && !isAnalyzingAts) void analyzeAtsKeywords(); }}>ATS Keywords</button>
              <button className={activeTab === "cover" ? "prep-tab-active" : ""} onClick={() => setActiveTab("cover")}>Cover Letter</button>
            </div>

            <div className="prep-content">
              {activeTab === "tips" && (
                <div className="prep-tips">
                  {data.aiTips.split("\n").filter(Boolean).map((tip, index) => (
                    <div key={index} className="prep-tip-item">
                      <span className="prep-tip-bullet" />
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "skills" && (
                <div className="prep-skills">
                  {data.matchedSkills.length > 0 && (
                    <div className="prep-skill-group">
                      <h4>Matched Skills</h4>
                      <div className="prep-skill-tags">
                        {data.matchedSkills.map((skill) => <span key={skill} className="prep-skill-tag prep-skill-matched">{skill}</span>)}
                      </div>
                    </div>
                  )}
                  {data.missingSkills.length > 0 && (
                    <div className="prep-skill-group">
                      <h4>Skills to Highlight</h4>
                      <div className="prep-skill-tags">
                        {data.missingSkills.map((skill) => <span key={skill} className="prep-skill-tag prep-skill-missing">{skill}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "tailor" && (
                <div className="prep-tailor">
                  {isTailoring ? (
                    <div className="prep-tailor-loading"><p>AI is tailoring your resume for this role...</p></div>
                  ) : tailoredSummary ? (
                    <>
                      <div className="prep-tailor-section">
                        <h4>Tailored Summary</h4>
                        <div className="prep-tailor-text">{tailoredSummary}</div>
                      </div>
                      {tailoredSkills && (
                        <div className="prep-tailor-section">
                          <h4>Optimized Skills Order</h4>
                          <div className="prep-skill-tags">
                            {tailoredSkills.map((skill) => <span key={skill} className="prep-skill-tag prep-skill-matched">{skill}</span>)}
                          </div>
                        </div>
                      )}
                      <div className="prep-tailor-actions">
                        <button className="prep-btn-primary" onClick={applyTailoredResume}><DocumentIcon size={14} /> Apply to My Resume</button>
                        <button className="prep-btn-secondary" onClick={() => void tailorResume()}><ResetIcon size={14} /> Regenerate</button>
                      </div>
                    </>
                  ) : (
                    <div className="prep-tailor-empty">
                      <p>Generate a tailored version of your resume for this specific job.</p>
                      <button className="prep-btn-primary" onClick={() => void tailorResume()}><SparklesIcon size={14} /> Tailor My Resume</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "ats" && (
                <div className="prep-ats">
                  {isAnalyzingAts ? (
                    <div className="prep-tailor-loading"><p>Analyzing ATS keyword compatibility...</p></div>
                  ) : atsKeywords ? (
                    <>
                      <div className={`prep-ats-score ${atsKeywords.score >= 70 ? "prep-ats-good" : atsKeywords.score >= 40 ? "prep-ats-ok" : "prep-ats-low"}`}>
                        <strong>{atsKeywords.score}%</strong>
                        <span>ATS Compatibility Score</span>
                      </div>
                      {atsKeywords.matched.length > 0 && (
                        <div className="prep-skill-group">
                          <h4>Matched Keywords</h4>
                          <div className="prep-skill-tags">
                            {atsKeywords.matched.map((keyword) => <span key={keyword} className="prep-skill-tag prep-skill-matched">{keyword}</span>)}
                          </div>
                        </div>
                      )}
                      {atsKeywords.missing.length > 0 && (
                        <div className="prep-skill-group">
                          <h4>Missing Keywords</h4>
                          <div className="prep-skill-tags">
                            {atsKeywords.missing.map((keyword) => <span key={keyword} className="prep-skill-tag prep-skill-missing">{keyword}</span>)}
                          </div>
                        </div>
                      )}
                      {atsKeywords.suggestions.length > 0 && (
                        <div className="prep-skill-group">
                          <h4>Rewrite Suggestions</h4>
                          {atsKeywords.suggestions.map((suggestion, index) => (
                            <div key={index} className="prep-tip-item"><span className="prep-tip-bullet" /><p>{suggestion}</p></div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="prep-tailor-empty">
                      <p>Analyze how well your resume keywords match this job for ATS systems.</p>
                      <button className="prep-btn-primary" onClick={() => void analyzeAtsKeywords()}><SearchIcon size={14} /> Analyze Keywords</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "cover" && (
                <div className="prep-cover">
                  <div className="prep-cover-text">{data.coverLetterSnippet}</div>
                  <div className="prep-cover-actions">
                    <button className="prep-btn-primary" onClick={() => { onOpenCoverLetter(job, data.coverLetterSnippet); onClose(); }}>
                      <SparklesIcon size={14} /> Edit in Cover Letter Builder
                    </button>
                    <button className="prep-btn-secondary" onClick={() => { void navigator.clipboard.writeText(data.coverLetterSnippet); addToast("Cover letter copied!", "success"); }}>
                      <ClipboardIcon size={14} /> Copy
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="prep-actions">
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="prep-btn-apply">Apply Now <ExternalLinkIcon size={14} /></a>
              <button className="prep-btn-save" onClick={() => { onSaveToTracker(job); }}>Save to Tracker</button>
            </div>
          </>
        ) : (
          <div className="modal-loading"><p>Failed to analyze. Please try again.</p></div>
        )}
      </div>
    </div>
  );
}

function CoverLetterGenerator({
  job, initialText, cvData, onTextChange, addToast,
}: {
  job: JobResult | null;
  initialText: string;
  cvData?: GeneratedCV | null;
  onTextChange?: (text: string) => void;
  addToast: (msg: string, type: ToastType) => void;
}) {
  const [text, setText] = useState(initialText || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobTitle, setJobTitle] = useState(job?.title || "");
  const [company, setCompany] = useState(job?.company || "");

  useEffect(() => {
    onTextChange?.(text);
  }, [onTextChange, text]);

  const generateLetter = async () => {
    if (!jobTitle.trim()) {
      addToast("Enter a job title first", "error");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await resumeApi.chat(
        `Write a professional, personalized cover letter for a ${jobTitle} position at ${company || "the company"}.

Use only the factual resume data below. If a detail is missing, omit it. Do not invent years of experience, tools, metrics, employers, or placeholders like [Your Name]. Keep it concise at 3-4 short paragraphs and sign with the candidate's real name if available.

Resume Facts:
${buildResumeFacts(cvData)}`,
        "chat",
        { ...((cvData as unknown as Record<string, unknown>) || {}), task: "cover_letter", jobTitle, company },
      );
      if (result.data?.reply) {
        const cleaned = result.data.reply
          .replace(/\[Your Name\]/gi, cvData?.personalInfo?.name || "")
          .replace(/\[Company Name\]/gi, company)
          .trim();
        setText(cleaned);
        trackEvent("jobready_cover_letter_generated", {
          jobTitle,
          company,
          source: job?.id || "manual",
        });
        addToast("Cover letter generated!", "success");
      } else {
        addToast("Failed to generate. Try again.", "error");
      }
    } catch {
      addToast("Generation failed. Check connection.", "error");
    }
    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(text);
    addToast("Copied to clipboard!", "success");
  };

  const downloadAsText = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cover-letter-${company || "job"}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    addToast("Downloaded!", "success");
  };

  return (
    <div className="cl">
      <h3 className="cl-title">Cover Letter Generator</h3>
      <p className="cl-sub">Generate a tailored cover letter using AI and your resume data.</p>

      <div className="cl-fields">
        <div className="cl-field">
          <label>Job Title</label>
          <input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="Software Engineer" />
        </div>
        <div className="cl-field">
          <label>Company</label>
          <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Google" />
        </div>
        <button className="cl-generate-btn" onClick={() => void generateLetter()} disabled={isGenerating}>
          {isGenerating ? "Generating..." : <><SparklesIcon size={14} /> Generate with AI</>}
        </button>
      </div>

      <div className="cl-editor">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Your cover letter will appear here. You can also write or paste one manually."
          rows={16}
        />
      </div>

      {text && (
        <div className="cl-actions">
          <button className="cl-btn-primary" onClick={copyToClipboard}><ClipboardIcon size={14} /> Copy</button>
          <button className="cl-btn-secondary" onClick={downloadAsText}><DownloadIcon size={14} /> Download .txt</button>
          <button className="cl-btn-secondary" onClick={() => { setText(""); addToast("Cleared", "info"); }}><TrashIcon size={14} /> Clear</button>
        </div>
      )}
    </div>
  );
}

function Tracker({
  trackedJobs, onUpdate, addToast,
}: {
  trackedJobs: TrackedJob[];
  onUpdate: (jobs: TrackedJob[]) => void;
  addToast: (msg: string, type: ToastType) => void;
}) {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const moveJob = async (id: string, status: TrackedJob["status"]) => {
    const result = await applicationsApi.update(id, { status });
    if (result.data) {
      onUpdate(trackedJobs.map((job) => job.id === id ? { ...job, status } : job));
      trackEvent("jobready_tracker_status_changed", { applicationId: id, status });
      addToast(`Moved to ${status}`, "success");
    } else {
      addToast(result.error || "Failed to update", "error");
    }
  };

  const removeJob = async (id: string) => {
    const result = await applicationsApi.remove(id);
    if (!result.error) {
      onUpdate(trackedJobs.filter((job) => job.id !== id));
      trackEvent("jobready_tracker_removed", { applicationId: id });
      addToast("Removed from tracker", "info");
    } else {
      addToast(result.error || "Failed to remove", "error");
    }
  };

  const saveNote = async (id: string) => {
    const result = await applicationsApi.update(id, { notes: noteText });
    if (result.data) {
      onUpdate(trackedJobs.map((job) => job.id === id ? { ...job, notes: noteText } : job));
      setEditingNote(null);
      trackEvent("jobready_tracker_note_saved", { applicationId: id });
      addToast("Note saved", "success");
    } else {
      addToast(result.error || "Failed to save note", "error");
    }
  };

  const startEditNote = (job: TrackedJob) => {
    setEditingNote(job.id);
    setNoteText(job.notes || "");
  };

  const columns: { status: TrackedJob["status"]; label: string }[] = [
    { status: "saved", label: "Saved" },
    { status: "applied", label: "Applied" },
    { status: "interview", label: "Interview" },
    { status: "offer", label: "Offer" },
  ];

  const nextStatus: Partial<Record<TrackedJob["status"], TrackedJob["status"]>> = {
    saved: "applied",
    applied: "interview",
    interview: "offer",
  };

  const prevStatus: Partial<Record<TrackedJob["status"], TrackedJob["status"]>> = {
    applied: "saved",
    interview: "applied",
    offer: "interview",
  };

  return (
    <div className="tk">
      <h3 className="tk-title">Application Tracker</h3>
      <p className="tk-sub">Track each target role through the stages that matter.</p>

      {trackedJobs.length === 0 && (
        <div className="tk-empty-state">
          <SearchIcon size={44} color="#475569" />
          <h3>No applications tracked yet</h3>
          <p>Search for jobs and click &quot;Save&quot; or &quot;Log application&quot; to start tracking your pipeline.</p>
        </div>
      )}

      <div className="tk-board">
        {columns.map((column) => {
          const items = trackedJobs.filter((job) => job.status === column.status);
          return (
            <div key={column.status} className="tk-col">
              <div className="tk-col-header">
                <span>{column.label}</span>
                <span className="tk-count">{items.length}</span>
              </div>
              <div className="tk-col-body">
                {items.map((job) => (
                  <div key={job.id} className="tk-card">
                    <strong>{job.title}</strong>
                    <span className="tk-card-co">{job.company}</span>
                    {job.location && <span className="tk-card-loc">{job.location}</span>}
                    <span className="tk-card-date">Added {new Date(job.addedAt).toLocaleDateString()}</span>

                    {editingNote === job.id ? (
                      <div className="tk-note-edit">
                        <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Add notes..." rows={3} />
                        <div className="tk-note-btns">
                          <button onClick={() => void saveNote(job.id)}>Save</button>
                          <button onClick={() => setEditingNote(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : job.notes ? (
                      <div className="tk-note" onClick={() => startEditNote(job)}>
                        <EditIcon size={12} /> {job.notes}
                      </div>
                    ) : null}

                    <div className="tk-card-actions">
                      {prevStatus[column.status] && (
                        <button onClick={() => void moveJob(job.id, prevStatus[column.status] as TrackedJob["status"])} title="Move back">◀</button>
                      )}
                      {nextStatus[column.status] && (
                        <button onClick={() => void moveJob(job.id, nextStatus[column.status] as TrackedJob["status"])} title="Move forward">▶</button>
                      )}
                      <button onClick={() => startEditNote(job)} title="Add note"><EditIcon size={14} /></button>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="tk-link-btn" title="Open job posting">
                          <ExternalLinkIcon size={12} />
                        </a>
                      )}
                      <button onClick={() => void removeJob(job.id)} className="tk-remove" title="Remove"><XIcon size={14} /></button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div className="tk-empty">No items</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const workspaceStyles = `
  .jsw-intro h2 {
    margin: 10px 0 8px;
    color: #fff;
  }
  .jsw-intro p {
    margin: 0;
    max-width: 780px;
    color: #a5b8cc;
  }
  .jsw-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #7dd3fc;
  }
  .jsw-tabbar {
    display: inline-flex;
    gap: 8px;
    padding: 6px;
    border-radius: 999px;
    background: rgba(7,18,31,0.72);
    border: 1px solid rgba(148,163,184,0.12);
    width: fit-content;
  }
  .jsw-tabbar button {
    border: none;
    background: transparent;
    color: #9eb0c4;
    font-weight: 700;
    padding: 10px 14px;
    border-radius: 999px;
  }
  .jsw-tabbar .jsw-tab-active {
    background: rgba(14,165,233,0.14);
    color: #fff;
  }
  .jsw-primary-btn,
  .jsw-secondary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 999px;
    font-weight: 700;
  }
  .jsw-primary-btn {
    border: none;
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    color: #fff;
  }
  .jsw-secondary-btn {
    border: 1px solid rgba(148,163,184,0.14);
    background: rgba(7,18,31,0.72);
    color: #dbeafe;
  }
  .jsw-toast {
    position: fixed;
    right: 20px;
    bottom: 20px;
    padding: 12px 16px;
    border-radius: 14px;
    border: 1px solid rgba(148,163,184,0.14);
    background: rgba(7,18,31,0.96);
    color: #fff;
    z-index: 80;
    box-shadow: 0 22px 42px rgba(2,8,23,0.34);
  }
  .jsw-toast-success { border-color: rgba(34,197,94,0.28); }
  .jsw-toast-error { border-color: rgba(239,68,68,0.28); }
  .jsw-toast-info { border-color: rgba(59,130,246,0.28); }
  .jsw-target-bar,
  .jsw-legacy-actions {
    margin-top: 16px;
  }
  .jsw-target-bar {
    display:flex;
    align-items:flex-end;
    justify-content:space-between;
    gap:16px;
    padding:18px 20px;
    border-radius:22px;
    border:1px solid rgba(148,163,184,0.12);
    background:rgba(7,18,31,0.72);
  }
  .jsw-target-bar strong {
    display:block;
    color:#fff;
    margin:10px 0 6px;
  }
  .jsw-target-bar p {
    margin:0;
    color:#9eb0c4;
  }
  .jb, .ts, .tk {
    display:flex;
    flex-direction:column;
    gap:16px;
    max-width:1120px;
  }
  .jb-title, .tk-title, .cl-title {
    margin:0;
    color:#fff;
  }
  .jb-sub, .tk-sub, .cl-sub {
    margin:0;
    color:#9eb0c4;
  }
  .jb-search, .cl-fields {
    display:grid;
    grid-template-columns:minmax(0,1fr) 220px auto;
    gap:12px;
    padding:18px;
    border-radius:22px;
    border:1px solid rgba(148,163,184,0.12);
    background:rgba(7,18,31,0.72);
  }
  .jb-field, .cl-field {
    display:flex;
    flex-direction:column;
    gap:8px;
  }
  .jb-field label, .cl-field label {
    font-size:0.82rem;
    font-weight:700;
    color:#c7d5e3;
  }
  .jb-field input, .cl-field input, .cl-editor textarea, .tk-note-edit textarea {
    width:100%;
    border-radius:14px;
    border:1px solid rgba(148,163,184,0.14);
    background:rgba(3,10,19,0.9);
    color:#fff;
    padding:13px 14px;
  }
  .jb-search-btn, .cl-generate-btn, .cl-btn-primary, .cl-btn-secondary, .prep-btn-primary, .prep-btn-secondary, .prep-btn-save, .prep-btn-apply {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    border-radius:999px;
    padding:11px 14px;
    font-weight:700;
  }
  .jb-search-btn, .cl-generate-btn, .cl-btn-primary, .prep-btn-primary, .prep-btn-apply {
    border:none;
    background:linear-gradient(135deg,#0ea5e9,#2563eb);
    color:#fff;
  }
  .cl-btn-secondary, .prep-btn-secondary, .prep-btn-save, .jb-save-btn, .jb-detail-btn {
    border:1px solid rgba(148,163,184,0.14);
    background:rgba(7,18,31,0.72);
    color:#dbeafe;
  }
  .jb-result-count {
    color:#a7bacd;
    font-size:0.92rem;
  }
  .jb-result-count strong { color:#fff; }
  .jb-target-banner, .ts-card, .ts-empty, .cl, .tk-empty-state {
    padding:20px;
    border-radius:22px;
    border:1px solid rgba(148,163,184,0.12);
    background:rgba(7,18,31,0.72);
  }
  .jb-target-banner strong, .ts-card strong {
    display:block;
    color:#fff;
    margin:10px 0 8px;
  }
  .jb-target-banner p, .ts-card p, .ts-empty p {
    margin:0;
    color:#9eb0c4;
  }
  .jb-results {
    display:flex;
    flex-direction:column;
    gap:14px;
  }
  .jb-card {
    padding:18px;
    border-radius:22px;
    border:1px solid rgba(148,163,184,0.12);
    background:rgba(7,18,31,0.72);
  }
  .jb-card-top {
    display:flex;
    justify-content:space-between;
    gap:12px;
  }
  .jb-card-info h4 {
    margin:0 0 4px;
    color:#fff;
  }
  .jb-company, .jb-meta, .jb-desc, .jb-full-desc p {
    color:#9eb0c4;
  }
  .jb-meta, .jb-tags, .jb-actions, .prep-skill-tags, .cl-actions {
    display:flex;
    gap:8px;
    flex-wrap:wrap;
  }
  .jb-tag, .prep-skill-tag {
    display:inline-flex;
    align-items:center;
    padding:8px 12px;
    border-radius:999px;
    background:rgba(14,165,233,0.12);
    color:#dbeafe;
    font-size:0.82rem;
  }
  .prep-skill-missing {
    background:rgba(245,158,11,0.16);
    color:#fde68a;
  }
  .jb-score {
    display:inline-flex;
    align-items:center;
    padding:8px 12px;
    border-radius:999px;
    font-weight:700;
  }
  .jb-score-hi { background:rgba(34,197,94,0.16); color:#bbf7d0; }
  .jb-score-md { background:rgba(59,130,246,0.16); color:#bfdbfe; }
  .jb-score-lo { background:rgba(245,158,11,0.16); color:#fde68a; }
  .jb-actions {
    margin-top:14px;
  }
  .jb-prepare-btn, .jb-apply-btn {
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:11px 14px;
    border-radius:999px;
    border:none;
    background:linear-gradient(135deg,#0ea5e9,#2563eb);
    color:#fff;
    font-weight:700;
  }
  .jb-apply-btn {
    text-decoration:none;
  }
  .jb-save-btn, .jb-detail-btn {
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:11px 14px;
    border-radius:999px;
    font-weight:700;
  }
  .jb-target-active {
    border-color:rgba(14,165,233,0.26);
    color:#7dd3fc;
  }
  .ts-grid, .tk-board {
    display:grid;
    gap:14px;
  }
  .ts-grid {
    grid-template-columns:repeat(3,minmax(0,1fr));
  }
  .ts-hero {
    display:flex;
    align-items:flex-end;
    justify-content:space-between;
    gap:16px;
    padding:24px 26px;
    border-radius:24px;
    background:linear-gradient(135deg, rgba(15,27,45,0.98), rgba(19,36,58,0.9));
    border:1px solid rgba(37,99,235,0.14);
  }
  .ts-hero h2, .ts-empty h2 {
    margin:8px 0 6px;
    color:#fff;
  }
  .ts-actions, .prep-actions {
    display:flex;
    flex-wrap:wrap;
    gap:10px;
  }
  .prep-tailor-text, .prep-cover-text {
    padding:14px;
    border-radius:18px;
    background:rgba(3,10,19,0.68);
    border:1px solid rgba(148,163,184,0.12);
    color:#dbeafe;
    white-space:pre-wrap;
  }
  .modal-overlay {
    position:fixed;
    inset:0;
    background:rgba(2,8,23,0.68);
    backdrop-filter:blur(8px);
    display:flex;
    align-items:center;
    justify-content:center;
    padding:24px;
    z-index:70;
  }
  .modal-prepare {
    width:min(920px,100%);
    max-height:90vh;
    overflow:auto;
    border-radius:26px;
    border:1px solid rgba(148,163,184,0.14);
    background:#081220;
    padding:22px;
    box-shadow:0 30px 70px rgba(2,8,23,0.44);
  }
  .modal-header {
    display:flex;
    justify-content:space-between;
    gap:16px;
    align-items:flex-start;
    margin-bottom:16px;
  }
  .modal-header h3 { margin:0; color:#fff; }
  .modal-subtitle { margin:6px 0 0; color:#9eb0c4; }
  .modal-close {
    border:none;
    background:rgba(7,18,31,0.72);
    color:#dbeafe;
    width:36px;
    height:36px;
    border-radius:12px;
  }
  .prep-score-banner,
  .prep-ats-score,
  .tk-col,
  .tk-card,
  .tk-empty,
  .prep-tailor-loading {
    border:1px solid rgba(148,163,184,0.12);
    background:rgba(7,18,31,0.72);
    border-radius:20px;
  }
  .prep-score-banner {
    display:flex;
    gap:14px;
    align-items:center;
    padding:18px;
  }
  .prep-score-circle {
    width:68px;
    height:68px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    background:rgba(14,165,233,0.12);
  }
  .prep-score-num {
    font-size:1.1rem;
    font-weight:800;
    color:#fff;
  }
  .prep-tabs {
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    margin:16px 0;
  }
  .prep-tabs button {
    border:1px solid rgba(148,163,184,0.14);
    background:rgba(7,18,31,0.72);
    color:#dbeafe;
    border-radius:999px;
    padding:9px 12px;
    font-weight:700;
  }
  .prep-tab-active {
    border-color:rgba(14,165,233,0.26) !important;
    color:#7dd3fc !important;
  }
  .prep-content {
    display:flex;
    flex-direction:column;
    gap:14px;
  }
  .prep-tip-item {
    display:flex;
    gap:10px;
    align-items:flex-start;
  }
  .prep-tip-bullet {
    width:8px;
    height:8px;
    border-radius:50%;
    background:#38bdf8;
    margin-top:8px;
    flex-shrink:0;
  }
  .prep-tip-item p, .prep-skill-group h4, .prep-tailor-section h4 {
    margin:0;
    color:#dbeafe;
  }
  .prep-tailor-actions, .prep-cover-actions {
    display:flex;
    flex-wrap:wrap;
    gap:10px;
    margin-top:14px;
  }
  .prep-ats-score {
    display:inline-flex;
    gap:8px;
    align-items:center;
    padding:14px;
    width:fit-content;
  }
  .prep-ats-score strong {
    color:#fff;
  }
  .prep-ats-score span {
    color:#9eb0c4;
  }
  .cl {
    padding:20px;
    border-radius:22px;
    border:1px solid rgba(148,163,184,0.12);
    background:rgba(7,18,31,0.72);
  }
  .cl-editor textarea {
    min-height:280px;
    margin-top:14px;
  }
  .tk-board {
    grid-template-columns:repeat(4,minmax(0,1fr));
  }
  .tk-col {
    padding:14px;
  }
  .tk-col-header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    color:#fff;
    padding-bottom:10px;
    margin-bottom:10px;
    border-bottom:1px solid rgba(148,163,184,0.12);
  }
  .tk-col-body {
    display:flex;
    flex-direction:column;
    gap:10px;
  }
  .tk-card {
    padding:14px;
  }
  .tk-card strong {
    display:block;
    color:#fff;
    margin-bottom:6px;
  }
  .tk-card-co, .tk-card-loc, .tk-card-date {
    display:block;
    color:#9eb0c4;
    font-size:0.84rem;
  }
  .tk-note {
    margin-top:10px;
    color:#dbeafe;
    font-size:0.82rem;
    cursor:pointer;
  }
  .tk-card-actions, .tk-note-btns {
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    margin-top:12px;
  }
  .tk-card-actions button, .tk-note-btns button, .tk-link-btn {
    border:1px solid rgba(148,163,184,0.14);
    background:rgba(7,18,31,0.72);
    color:#dbeafe;
    border-radius:10px;
    padding:8px 10px;
  }
  .tk-link-btn {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    text-decoration:none;
  }
  .tk-empty, .tk-empty-state, .jb-empty {
    color:#9eb0c4;
    text-align:center;
    padding:20px;
  }
  @media (max-width: 920px) {
    .jb-search, .cl-fields, .ts-grid, .tk-board {
      grid-template-columns:1fr;
    }
    .ts-hero, .jsw-target-bar {
      flex-direction:column;
      align-items:flex-start;
    }
  }
`;
