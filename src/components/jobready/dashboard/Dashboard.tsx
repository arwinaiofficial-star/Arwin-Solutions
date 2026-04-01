"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { applicationsApi, type JobApplicationData } from "@/lib/api/client";
import {
  DocumentIcon,
  SearchIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@/components/icons/Icons";
import { calculateScore, createInitialResumeData } from "@/components/jobready/resume/types";
import type { ResumeData } from "@/components/jobready/resume/types";
import "@/app/jobready/jobready.css";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState<JobApplicationData[]>([]);

  useEffect(() => {
    applicationsApi.list().then((res) => {
      if (res.data) setApps(res.data);
    });
  }, []);

  const hasResume = !!user?.cvGenerated || !!user?.cvData;

  // Build resume data for score calculation
  const resumeData: ResumeData = (() => {
    if (!user?.cvData) return createInitialResumeData(user || null);
    const cv = user.cvData as unknown as Record<string, unknown>;
    const pi = (cv?.personalInfo ?? {}) as Record<string, string>;
    return {
      fullName: pi.name || user?.name || "",
      email: pi.email || user?.email || "",
      phone: pi.phone || "",
      location: pi.location || "",
      linkedIn: pi.linkedIn || "",
      portfolio: pi.portfolio || "",
      summary: (cv?.summary as string) || "",
      skills: (cv?.skills as string[]) || [],
      experiences: (cv?.experience as ResumeData["experiences"]) || [],
      education: (cv?.education as ResumeData["education"]) || [],
    };
  })();

  const { score: resumeScore, hint: resumeHint } = calculateScore(resumeData);

  const counts = {
    saved: apps.filter((a) => a.status === "saved").length,
    applied: apps.filter((a) => a.status === "applied").length,
    interview: apps.filter((a) => a.status === "interview").length,
    offer: apps.filter((a) => a.status === "offer").length,
  };

  const recentApps = [...apps]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  // Determine what the user should do next
  const nextStep = getNextStep(resumeScore, hasResume, counts);

  return (
    <div className="jr-dashboard">
      {/* Greeting */}
      <div className="jr-dashboard-greeting">
        <h1>{getGreeting()}, {user?.name?.split(" ")[0] || "there"}</h1>
        <p>{resumeScore < 50 ? "Let's get your resume ready for opportunities." : "Here's your career progress at a glance."}</p>
      </div>

      {/* Resume Journey Card — the key guidance element */}
      <div className="jr-journey-card">
        <div className="jr-journey-header">
          <div className="jr-journey-info">
            <h2>{hasResume ? "Resume Progress" : "Start Your Resume"}</h2>
            <p>{resumeHint}</p>
          </div>
          <div className="jr-journey-score">
            <svg viewBox="0 0 36 36" className="jr-journey-ring">
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--jr-gray-100)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="16" fill="none"
                stroke={resumeScore >= 80 ? "var(--jr-success)" : resumeScore >= 50 ? "var(--jr-blue)" : "var(--jr-warning)"}
                strokeWidth="3"
                strokeDasharray={`${(resumeScore / 100) * 100.53} 100.53`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <span className="jr-journey-score-text">{resumeScore}%</span>
          </div>
        </div>

        {/* Progress checklist */}
        <div className="jr-journey-checklist">
          <JourneyItem done={!!resumeData.fullName && !!resumeData.email} label="Contact information" />
          <JourneyItem done={resumeData.experiences.length > 0} label="Work experience" />
          <JourneyItem done={resumeData.education.length > 0} label="Education" />
          <JourneyItem done={resumeData.skills.length >= 5} label="Skills (5+ added)" />
          <JourneyItem done={resumeData.summary.length >= 80} label="Professional summary" />
        </div>

        <Link
          href="/jobready/app/documents"
          className="jr-btn jr-btn-primary jr-journey-cta"
        >
          <SparklesIcon size={16} />
          {nextStep.cta}
        </Link>
      </div>

      {/* Stats Row */}
      <div className="jr-stats-row">
        <div className="jr-stat-card">
          <span className="jr-stat-label">Resume</span>
          <span className="jr-stat-value">{resumeScore}%</span>
          <span className="jr-stat-sub">{resumeScore >= 80 ? "ATS-ready" : hasResume ? "In progress" : "Not started"}</span>
        </div>
        <div className="jr-stat-card">
          <span className="jr-stat-label">Saved</span>
          <span className="jr-stat-value">{counts.saved}</span>
          <span className="jr-stat-sub">Jobs saved</span>
        </div>
        <div className="jr-stat-card">
          <span className="jr-stat-label">Applied</span>
          <span className="jr-stat-value">{counts.applied}</span>
          <span className="jr-stat-sub">Applications sent</span>
        </div>
        <div className="jr-stat-card">
          <span className="jr-stat-label">Interviews</span>
          <span className="jr-stat-value">{counts.interview}</span>
          <span className="jr-stat-sub">{counts.offer > 0 ? `${counts.offer} offer${counts.offer > 1 ? "s" : ""}` : "Keep going"}</span>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="jr-dashboard-grid">
        {/* Quick Actions */}
        <div className="jr-dashboard-section">
          <h2>Quick Actions</h2>
          <div className="jr-quick-actions">
            <Link href="/jobready/app/documents" className="jr-quick-action">
              <DocumentIcon size={18} />
              {hasResume ? "Edit Resume" : "Build Resume"}
            </Link>
            <Link href="/jobready/app/jobs" className="jr-quick-action">
              <SearchIcon size={18} />
              Search Jobs
            </Link>
            <Link href="/jobready/app/applications" className="jr-quick-action">
              <BriefcaseIcon size={18} />
              Track Applications
            </Link>
            <Link href="/jobready/app/settings" className="jr-quick-action">
              <ArrowRightIcon size={18} />
              Settings
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="jr-dashboard-section">
          <h2>Recent Applications</h2>
          {recentApps.length === 0 ? (
            <p style={{ fontSize: "var(--jr-text-sm)", color: "var(--jr-gray-400)" }}>
              {resumeScore < 50
                ? "Complete your resume first, then start applying to jobs."
                : "No applications yet. Start by searching for jobs."}
            </p>
          ) : (
            <div className="jr-recent-list">
              {recentApps.map((app) => (
                <div key={app.id} className="jr-recent-item">
                  <div className="jr-recent-item-info">
                    <span className="jr-recent-item-title">{app.job_title}</span>
                    <span className="jr-recent-item-sub">{app.company}</span>
                  </div>
                  <span className={`jr-recent-item-badge jr-badge jr-badge-${
                    app.status === "offer" ? "green" :
                    app.status === "interview" ? "blue" :
                    app.status === "applied" ? "yellow" : "gray"
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JourneyItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`jr-journey-item ${done ? "jr-journey-item-done" : ""}`}>
      <div className="jr-journey-item-check">
        {done ? "✓" : "○"}
      </div>
      <span>{label}</span>
    </div>
  );
}

function getNextStep(
  score: number,
  hasResume: boolean,
  counts: { saved: number; applied: number }
): { cta: string } {
  if (!hasResume) return { cta: "Create your resume" };
  if (score < 30) return { cta: "Add your contact info" };
  if (score < 50) return { cta: "Add work experience" };
  if (score < 70) return { cta: "Complete your resume" };
  if (score < 85) return { cta: "Polish your resume" };
  if (counts.saved === 0 && counts.applied === 0) return { cta: "Check ATS score" };
  return { cta: "View your resume" };
}
