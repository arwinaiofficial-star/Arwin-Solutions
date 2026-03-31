"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { GeneratedCV } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import { applicationsApi, type JobApplicationData } from "@/lib/api/client";
import { interviewApi, pathwaysApi, salaryApi, type InterviewPrepData, type PathwayData, type SalaryBenchmarkData } from "@/lib/api/platform";
import { computeResumeJobMatch } from "@/lib/jobMatch";
import {
  ArrowRightIcon,
  BotIcon,
  BriefcaseIcon,
  CheckIcon,
  ClipboardIcon,
  DocumentIcon,
  ExternalLinkIcon,
  LocationIcon,
  SearchIcon,
  SparklesIcon,
} from "@/components/icons/Icons";

type JobResult = {
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
};

function PanelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`jp-card ${className}`}>{children}</div>;
}

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="jp-intro">
      <span className="jp-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

function scoreJob(job: JobResult, resumeData?: GeneratedCV | null) {
  if (!resumeData) return job.relevanceScore || 0;
  return Math.max(job.relevanceScore || 0, computeResumeJobMatch(resumeData, job).matchScore);
}

function mapTrackedApplication(item: JobApplicationData) {
  return {
    id: item.id,
    title: item.job_title,
    company: item.company,
    status: item.status,
    location: item.location || "",
    salary: item.salary || "",
    url: item.job_url || "",
    notes: item.notes || "",
  };
}

export function OverviewPanel() {
  const { user } = useAuth();
  const steps = [
    {
      title: "Documents Studio",
      body: "Import once, then refine resume, CV, and cover letters in a single high-trust workspace.",
      href: "/jobready/app/documents",
      icon: DocumentIcon,
    },
    {
      title: "Job Search Hub",
      body: "Search India-first roles, choose target jobs, and keep pipeline state attached to real opportunities.",
      href: "/jobready/app/jobs",
      icon: BriefcaseIcon,
    },
    {
      title: "Interview & Salary",
      body: "Practice the right questions and calibrate compensation with a transparent benchmark model.",
      href: "/jobready/app/interview",
      icon: BotIcon,
    },
    {
      title: "Career Growth",
      body: "Map adjacent roles, skill gaps, and the story you need for the next move.",
      href: "/jobready/app/pathways",
      icon: SparklesIcon,
    },
  ];

  return (
    <>
      <style>{panelStyles}</style>
      <SectionIntro
        eyebrow="Command center"
        title={`Run a clearer hiring system${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`}
        body="This platform is intentionally opinionated: fewer gimmicks, cleaner flows, and stronger evidence before every application move."
      />

      <div className="jp-grid jp-grid-2">
        <PanelCard className="jp-hero-card">
          <span className="jp-eyebrow">Current baseline</span>
          <h3>{user?.cvGenerated ? "Resume foundation exists" : "Profile setup is the blocker"}</h3>
          <p>{user?.cvData?.summary || "Once the resume baseline is strong, JobReady can improve matching, interview prep, and salary guidance across the rest of the platform."}</p>
        </PanelCard>
        <PanelCard>
          <span className="jp-eyebrow">Trust posture</span>
          <ul className="jp-checklist">
            <li><CheckIcon size={14} /> No hidden recruiter outreach</li>
            <li><CheckIcon size={14} /> No auto-apply behind vague wording</li>
            <li><CheckIcon size={14} /> India-first language for roles, pay, and hiring motion</li>
          </ul>
        </PanelCard>
      </div>

      <div className="jp-grid jp-grid-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <a key={step.title} href={step.href} className="jp-link-card">
              <div className="jp-link-icon"><Icon size={18} /></div>
              <div>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
              <ArrowRightIcon size={16} />
            </a>
          );
        })}
      </div>
    </>
  );
}

export function JobSearchHub() {
  const { user } = useAuth();
  const resumeSkills = user?.cvData?.skills?.join(", ") || "";
  const resumeLocation = user?.cvData?.personalInfo?.location || "Hyderabad";
  const [skills, setSkills] = useState(resumeSkills);
  const [location, setLocation] = useState(resumeLocation);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [tracked, setTracked] = useState<ReturnType<typeof mapTrackedApplication>[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activePane, setActivePane] = useState<"matches" | "tracker">("matches");

  useEffect(() => {
    applicationsApi.list().then((result) => {
      if (result.data) {
        setTracked(result.data.map(mapTrackedApplication));
      }
    });
  }, []);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) || null;

  const search = async () => {
    if (!skills.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, location, preferences: location }),
      });
      const body = await response.json();
      if (response.ok) {
        setJobs(body.jobs || []);
        setActivePane("matches");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const saveJob = async (job: JobResult, status: "saved" | "applied" = "saved") => {
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
    if (result.data) {
      setTracked((prev) => [mapTrackedApplication(result.data!), ...prev]);
      setActivePane("tracker");
    }
  };

  const statusColumns = useMemo(() => {
    const order = ["saved", "applied", "interview", "offer"];
    return order.map((status) => ({
      status,
      jobs: tracked.filter((item) => item.status === status),
    }));
  }, [tracked]);

  return (
    <>
      <style>{panelStyles}</style>
      <SectionIntro
        eyebrow="Job search hub"
        title="Choose better targets before you tailor."
        body="Search with structured resume context, rank roles by fit, and move only the best opportunities into your active pipeline."
      />

      <div className="jp-grid jp-grid-3">
        <PanelCard className="jp-search-card">
          <label className="jp-label">Skills and keywords</label>
          <input className="jp-input" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="React, Python, Product Analytics" />
          <label className="jp-label">Target location</label>
          <input className="jp-input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Hyderabad" />
          <button className="jp-primary-btn" onClick={() => void search()} disabled={isSearching}>
            <SearchIcon size={15} />
            {isSearching ? "Searching..." : "Search India-first roles"}
          </button>
        </PanelCard>

        <PanelCard>
          <span className="jp-eyebrow">Target role</span>
          <h3>{selectedJob ? `${selectedJob.title} at ${selectedJob.company}` : "No target job chosen"}</h3>
          <p>{selectedJob ? "Use this role as the anchor for tailoring, ATS review, and interview preparation." : "Pick one role after search. Strong platforms reduce indecision by pushing one focused target at a time."}</p>
        </PanelCard>

        <PanelCard>
          <span className="jp-eyebrow">Pipeline</span>
          <h3>{tracked.length} tracked opportunities</h3>
          <p>Saved and applied roles live in the same system, so your search quality and follow-through are measurable together.</p>
        </PanelCard>
      </div>

      <div className="jp-tabbar">
        <button className={activePane === "matches" ? "jp-tab-active" : ""} onClick={() => setActivePane("matches")}>Matches</button>
        <button className={activePane === "tracker" ? "jp-tab-active" : ""} onClick={() => setActivePane("tracker")}>Tracker</button>
      </div>

      {activePane === "matches" ? (
        <div className="jp-stack">
          {jobs.length === 0 ? (
            <PanelCard>
              <p className="jp-empty">Search results will appear here once you submit a skill-based query.</p>
            </PanelCard>
          ) : (
            jobs
              .slice()
              .sort((a, b) => scoreJob(b, user?.cvData) - scoreJob(a, user?.cvData))
              .map((job) => {
                const fit = scoreJob(job, user?.cvData);
                return (
                  <PanelCard key={job.id}>
                    <div className="jp-row jp-row-space">
                      <div>
                        <h3>{job.title}</h3>
                        <p>{job.company} · {job.location} · {job.source}</p>
                      </div>
                      <span className="jp-fit-pill">{fit}% fit</span>
                    </div>
                    <p>{job.description.slice(0, 220)}{job.description.length > 220 ? "..." : ""}</p>
                    <div className="jp-tag-row">
                      {(job.tags || []).slice(0, 5).map((tag) => <span key={tag} className="jp-tag">{tag}</span>)}
                    </div>
                    <div className="jp-action-row">
                      <button className="jp-secondary-btn" onClick={() => setSelectedJobId(job.id)}>Set target</button>
                      <button className="jp-secondary-btn" onClick={() => void saveJob(job, "saved")}>
                        <ClipboardIcon size={14} />
                        Save
                      </button>
                      <button className="jp-primary-btn" onClick={() => void saveJob(job, "applied")}>Log application</button>
                      <a className="jp-link-btn" href={job.url} target="_blank" rel="noopener noreferrer">
                        Open role
                        <ExternalLinkIcon size={14} />
                      </a>
                    </div>
                  </PanelCard>
                );
              })
          )}
        </div>
      ) : (
        <div className="jp-grid jp-grid-2">
          {statusColumns.map((column) => (
            <PanelCard key={column.status}>
              <span className="jp-eyebrow">{column.status}</span>
              <h3>{column.jobs.length} roles</h3>
              <div className="jp-mini-stack">
                {column.jobs.length === 0 ? (
                  <p className="jp-empty">No roles in this stage yet.</p>
                ) : (
                  column.jobs.map((job) => (
                    <div key={job.id} className="jp-mini-item">
                      <strong>{job.title}</strong>
                      <span>{job.company}</span>
                    </div>
                  ))
                )}
              </div>
            </PanelCard>
          ))}
        </div>
      )}
    </>
  );
}

export function InterviewStudio() {
  const [role, setRole] = useState("Product Manager");
  const [experienceYears, setExperienceYears] = useState(4);
  const [focus, setFocus] = useState("stakeholder management");
  const [data, setData] = useState<InterviewPrepData | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const result = await interviewApi.generate({ role, experienceYears, focus });
    if (result.data) {
      setData(result.data);
      trackEvent("jobready_interview_pack_generated", {
        role,
        experienceYears,
        focus,
        questionCount: result.data.questions.length,
      });
    }
    setLoading(false);
  };

  return (
    <>
      <style>{panelStyles}</style>
      <SectionIntro
        eyebrow="Interview prep"
        title="Practice the questions that decide the offer."
        body="Generate India-market interview packs by role, experience level, and prep focus, then turn them into tighter stories."
      />
      <div className="jp-grid jp-grid-3">
        <PanelCard className="jp-search-card">
          <label className="jp-label">Role</label>
          <input className="jp-input" value={role} onChange={(event) => setRole(event.target.value)} />
          <label className="jp-label">Experience</label>
          <input className="jp-input" type="number" min={0} value={experienceYears} onChange={(event) => setExperienceYears(Number(event.target.value) || 0)} />
          <label className="jp-label">Focus area</label>
          <input className="jp-input" value={focus} onChange={(event) => setFocus(event.target.value)} />
          <button className="jp-primary-btn" onClick={() => void generate()} disabled={loading}>
            <BotIcon size={15} />
            {loading ? "Generating..." : "Generate interview pack"}
          </button>
        </PanelCard>
        <PanelCard className="jp-grid-span-2">
          {!data ? (
            <p className="jp-empty">Generate an interview pack to get tailored questions, prep areas, and answer framing guidance.</p>
          ) : (
            <div className="jp-stack">
              <span className="jp-eyebrow">{data.role} · {data.experience_band}</span>
              <h3>{data.intro}</h3>
              <div className="jp-tag-row">
                {data.prep_areas.map((item) => <span key={item} className="jp-tag">{item}</span>)}
              </div>
              {data.questions.map((item) => (
                <div key={item.question} className="jp-question">
                  <strong>{item.question}</strong>
                  <p>{item.what_good_looks_like}</p>
                  <span>{item.focus_area}</span>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </div>
    </>
  );
}

export function SalaryStudio() {
  const [role, setRole] = useState("Software Engineer");
  const [location, setLocation] = useState("Hyderabad");
  const [experienceYears, setExperienceYears] = useState(5);
  const [data, setData] = useState<SalaryBenchmarkData | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const result = await salaryApi.benchmark({ role, location, experienceYears });
    if (result.data) {
      setData(result.data);
      trackEvent("jobready_salary_benchmark_run", {
        role,
        location,
        experienceYears,
        medianLpa: result.data.salary_range.median_lpa,
      });
    }
    setLoading(false);
  };

  return (
    <>
      <style>{panelStyles}</style>
      <SectionIntro
        eyebrow="Salary analyzer"
        title="Benchmark pay with cleaner assumptions."
        body="Use a simple India-first benchmark model to frame compensation, scope, and offer conversations without fake precision."
      />
      <div className="jp-grid jp-grid-3">
        <PanelCard className="jp-search-card">
          <label className="jp-label">Role</label>
          <input className="jp-input" value={role} onChange={(event) => setRole(event.target.value)} />
          <label className="jp-label">Location</label>
          <input className="jp-input" value={location} onChange={(event) => setLocation(event.target.value)} />
          <label className="jp-label">Experience</label>
          <input className="jp-input" type="number" min={0} value={experienceYears} onChange={(event) => setExperienceYears(Number(event.target.value) || 0)} />
          <button className="jp-primary-btn" onClick={() => void run()} disabled={loading}>
            <LocationIcon size={15} />
            {loading ? "Calculating..." : "Run salary benchmark"}
          </button>
        </PanelCard>
        <PanelCard className="jp-grid-span-2">
          {!data ? (
            <p className="jp-empty">Run a benchmark to see a transparent range, comparable titles, and negotiation levers.</p>
          ) : (
            <div className="jp-stack">
              <span className="jp-eyebrow">{data.role} · {data.location}</span>
              <h3>{data.salary_range.min_lpa}L to {data.salary_range.max_lpa}L</h3>
              <p>Median benchmark: {data.salary_range.median_lpa}LPA · {data.market_note}</p>
              <div className="jp-grid jp-grid-2">
                <PanelCard>
                  <span className="jp-eyebrow">Negotiation levers</span>
                  <ul className="jp-checklist">
                    {data.negotiation_levers.map((item) => <li key={item}><CheckIcon size={14} /> {item}</li>)}
                  </ul>
                </PanelCard>
                <PanelCard>
                  <span className="jp-eyebrow">Comparable titles</span>
                  <div className="jp-tag-row">
                    {data.comparable_titles.map((item) => <span key={item} className="jp-tag">{item}</span>)}
                  </div>
                </PanelCard>
              </div>
            </div>
          )}
        </PanelCard>
      </div>
    </>
  );
}

export function PathwaysStudio() {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState("Business Analyst");
  const [targetRole, setTargetRole] = useState("Product Manager");
  const [data, setData] = useState<PathwayData | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const result = await pathwaysApi.recommend({
      currentRole,
      targetRole,
      skills: user?.cvData?.skills || [],
    });
    if (result.data) {
      setData(result.data);
      trackEvent("jobready_pathway_generated", {
        currentRole,
        targetRole,
        missingSkillCount: result.data.missing_skills.length,
      });
    }
    setLoading(false);
  };

  return (
    <>
      <style>{panelStyles}</style>
      <SectionIntro
        eyebrow="Career pathways"
        title="Map the next move before you chase it."
        body="Translate current experience into adjacent roles, missing skills, and a 90-day progression plan that improves your interview story."
      />
      <div className="jp-grid jp-grid-3">
        <PanelCard className="jp-search-card">
          <label className="jp-label">Current role</label>
          <input className="jp-input" value={currentRole} onChange={(event) => setCurrentRole(event.target.value)} />
          <label className="jp-label">Target role</label>
          <input className="jp-input" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} />
          <button className="jp-primary-btn" onClick={() => void run()} disabled={loading}>
            <SparklesIcon size={15} />
            {loading ? "Planning..." : "Generate pathway"}
          </button>
        </PanelCard>
        <PanelCard className="jp-grid-span-2">
          {!data ? (
            <p className="jp-empty">Generate a pathway to see adjacent roles, missing skills, and the narrative for your transition.</p>
          ) : (
            <div className="jp-stack">
              <span className="jp-eyebrow">{data.current_role} → {data.target_role}</span>
              <h3>{data.readiness}</h3>
              <p>{data.story_angle}</p>
              <div className="jp-grid jp-grid-2">
                <PanelCard>
                  <span className="jp-eyebrow">Adjacent roles</span>
                  <div className="jp-tag-row">
                    {data.adjacent_roles.map((item) => <span key={item} className="jp-tag">{item}</span>)}
                  </div>
                </PanelCard>
                <PanelCard>
                  <span className="jp-eyebrow">Missing skills</span>
                  <div className="jp-tag-row">
                    {data.missing_skills.map((item) => <span key={item} className="jp-tag jp-tag-warn">{item}</span>)}
                  </div>
                </PanelCard>
              </div>
              <PanelCard>
                <span className="jp-eyebrow">90-day plan</span>
                <ul className="jp-checklist">
                  {data.ninety_day_plan.map((item) => <li key={item}><CheckIcon size={14} /> {item}</li>)}
                </ul>
              </PanelCard>
            </div>
          )}
        </PanelCard>
      </div>
    </>
  );
}

export function SettingsWorkspace() {
  const { user, logout } = useAuth();

  return (
    <>
      <style>{panelStyles}</style>
      <SectionIntro
        eyebrow="Settings and transparency"
        title="Keep the platform trustworthy."
        body="The fastest way to lose against established products is vague pricing, vague automation, and vague account behavior. This page keeps those rules explicit."
      />
      <div className="jp-grid jp-grid-2">
        <PanelCard>
          <span className="jp-eyebrow">Account</span>
          <h3>{user?.name}</h3>
          <p>{user?.email} · {user?.location || "India-first profile"}</p>
          <button className="jp-secondary-btn" onClick={() => logout()}>
            Sign out
          </button>
        </PanelCard>
        <PanelCard>
          <span className="jp-eyebrow">Platform rules</span>
          <ul className="jp-checklist">
            <li><CheckIcon size={14} /> No social-login placeholders remain in the auth flow</li>
            <li><CheckIcon size={14} /> Session auth now relies on secure server cookies</li>
            <li><CheckIcon size={14} /> Paid automation and assisted services are out of scope for this build</li>
          </ul>
        </PanelCard>
      </div>
    </>
  );
}

const panelStyles = `
  .jp-intro h2 {
    margin: 10px 0 8px;
    color: #fff;
  }
  .jp-intro p {
    margin: 0;
    max-width: 760px;
    color: #a5b8cc;
  }
  .jp-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #7dd3fc;
  }
  .jp-grid {
    display: grid;
    gap: 16px;
  }
  .jp-grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .jp-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .jp-grid-span-2 {
    grid-column: span 2;
  }
  .jp-card,
  .jp-link-card {
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 24px;
    padding: 20px;
    background: rgba(7, 18, 31, 0.72);
    box-shadow: 0 20px 44px rgba(2, 8, 23, 0.18);
  }
  .jp-hero-card {
    background: linear-gradient(145deg, rgba(14,165,233,0.18), rgba(37,99,235,0.1));
  }
  .jp-card h3,
  .jp-link-card strong {
    margin: 10px 0 8px;
    color: #fff;
  }
  .jp-card p,
  .jp-link-card p {
    margin: 0;
    color: #9eb0c4;
  }
  .jp-checklist {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 12px 0 0;
  }
  .jp-checklist li {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #dbeafe;
  }
  .jp-link-card {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    color: inherit;
    text-decoration: none;
  }
  .jp-link-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(14, 165, 233, 0.12);
    color: #7dd3fc;
  }
  .jp-search-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .jp-label {
    font-size: 0.84rem;
    font-weight: 700;
    color: #c7d5e3;
  }
  .jp-input {
    width: 100%;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.14);
    background: rgba(3, 10, 19, 0.9);
    color: #fff;
    padding: 13px 14px;
  }
  .jp-primary-btn,
  .jp-secondary-btn,
  .jp-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: 999px;
    padding: 11px 14px;
    font-weight: 700;
    border: 1px solid rgba(148, 163, 184, 0.16);
  }
  .jp-primary-btn {
    border: none;
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    color: #fff;
  }
  .jp-secondary-btn {
    background: rgba(14, 165, 233, 0.12);
    color: #dbeafe;
  }
  .jp-link-btn {
    background: transparent;
    color: #7dd3fc;
  }
  .jp-fit-pill,
  .jp-tag {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(14, 165, 233, 0.12);
    color: #dbeafe;
    font-size: 0.84rem;
    font-weight: 700;
  }
  .jp-tag-warn {
    background: rgba(245, 158, 11, 0.16);
    color: #fde68a;
  }
  .jp-tag-row,
  .jp-action-row,
  .jp-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .jp-row-space {
    justify-content: space-between;
    align-items: flex-start;
  }
  .jp-stack,
  .jp-mini-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .jp-tabbar {
    display: inline-flex;
    gap: 8px;
    padding: 6px;
    border-radius: 999px;
    background: rgba(7, 18, 31, 0.72);
    width: fit-content;
    border: 1px solid rgba(148, 163, 184, 0.12);
  }
  .jp-tabbar button {
    border: none;
    background: transparent;
    color: #9eb0c4;
    font-weight: 700;
    padding: 10px 14px;
    border-radius: 999px;
  }
  .jp-tabbar .jp-tab-active {
    background: rgba(14, 165, 233, 0.14);
    color: #fff;
  }
  .jp-mini-item,
  .jp-question {
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 18px;
    padding: 14px;
    background: rgba(3, 10, 19, 0.68);
  }
  .jp-mini-item strong,
  .jp-question strong {
    display: block;
    color: #fff;
  }
  .jp-mini-item span,
  .jp-question span {
    color: #7dd3fc;
    font-size: 0.82rem;
  }
  .jp-empty {
    color: #93a6bc;
  }
  @media (max-width: 920px) {
    .jp-grid-2,
    .jp-grid-3 {
      grid-template-columns: 1fr;
    }
    .jp-grid-span-2 {
      grid-column: span 1;
    }
    .jp-link-card {
      grid-template-columns: 1fr;
      justify-items: start;
    }
  }
`;
