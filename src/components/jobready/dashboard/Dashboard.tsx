"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { applicationsApi, resumeApi, type JobApplicationData } from "@/lib/api/client";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  DocumentIcon,
  SearchIcon,
  SparklesIcon,
} from "@/components/icons/Icons";
import { calculateScore, createInitialResumeData, mapBackendToResumeData } from "@/components/jobready/resume/types";
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
  const [savedResumeData, setSavedResumeData] = useState<ResumeData | null>(
    null
  );

  useEffect(() => {
    applicationsApi.list().then((res) => {
      if (res.data) {
        setApps(res.data);
      }
    });
  }, []);

  useEffect(() => {
    if (!user?.cvGenerated) return;

    resumeApi.getLatest().then((res) => {
      if (res.data?.data) {
        setSavedResumeData(mapBackendToResumeData(res.data.data));
      }
    });
  }, [user]);

  const resumeData: ResumeData =
    savedResumeData || createInitialResumeData(user || null);
  const hasResume = Boolean(savedResumeData);

  const { score: resumeScore } = calculateScore(resumeData);

  const counts = {
    saved: apps.filter((a) => a.status === "saved").length,
    applied: apps.filter((a) => a.status === "applied").length,
    interview: apps.filter((a) => a.status === "interview").length,
    offer: apps.filter((a) => a.status === "offer").length,
  };

  const recentApps = [...apps]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const nextStep = getNextStep(resumeScore, hasResume, counts);

  return (
    <div className="jr-dashboard">
      <section className="jr-home-hero jr-home-hero-compact">
        <div className="jr-home-hero-copy">
          <span className="jr-page-eyebrow">Workspace overview</span>
          <h2>{getGreeting()}, {user?.name?.split(" ")[0] || "there"}.</h2>
          <p>{resumeScore < 50 ? "Start with the resume basics, then move into search and applications." : "Your resume is in progress. Use the next action below to keep things moving."}</p>
          <div className="jr-home-hero-actions">
            <Link href={nextStep.href} className="jr-btn jr-btn-primary">
              <SparklesIcon size={16} />
              {nextStep.cta}
            </Link>
            <Link href="/jobready/app/jobs" className="jr-btn jr-btn-secondary">
              <SearchIcon size={16} />
              Explore roles
            </Link>
          </div>
        </div>
      </section>

      <div className="jr-stats-row">
        <StatCard label="Resume" value={`${resumeScore}%`} sub={resumeScore >= 80 ? "Ready to apply" : hasResume ? "In progress" : "Not started"} />
        <StatCard label="Saved" value={String(counts.saved)} sub="Roles in your shortlist" />
        <StatCard label="Applied" value={String(counts.applied)} sub="Applications sent" />
        <StatCard label="Interviews" value={String(counts.interview)} sub={counts.offer > 0 ? `${counts.offer} offer${counts.offer > 1 ? "s" : ""}` : "No offers yet"} />
      </div>

      <div className="jr-dashboard-grid">
        <section className="jr-dashboard-section">
          <div className="jr-section-header">
            <div>
              <span className="jr-page-eyebrow">Focused actions</span>
              <h2>What to do next</h2>
            </div>
          </div>
          <div className="jr-quick-actions">
            <Link href="/jobready/app/documents" className="jr-quick-action">
              <DocumentIcon size={18} />
              <div>
                <strong>{hasResume ? "Refine resume" : "Build resume"}</strong>
                <span>Add or tighten the essentials.</span>
              </div>
            </Link>
            <Link href="/jobready/app/jobs" className="jr-quick-action">
              <SearchIcon size={18} />
              <div>
                <strong>Search roles</strong>
                <span>Search and save the roles worth applying to.</span>
              </div>
            </Link>
            <Link href="/jobready/app/applications" className="jr-quick-action">
              <BriefcaseIcon size={18} />
              <div>
                <strong>Track applications</strong>
                <span>Move roles from saved to interview.</span>
              </div>
            </Link>
            <Link href="/jobready/app/settings" className="jr-quick-action">
              <ArrowRightIcon size={18} />
              <div>
                <strong>Workspace settings</strong>
                <span>Update your name, location, and password.</span>
              </div>
            </Link>
          </div>
        </section>

        <section className="jr-dashboard-section">
          <div className="jr-section-header">
            <div>
              <span className="jr-page-eyebrow">Recent activity</span>
              <h2>Latest applications</h2>
            </div>
          </div>
          {recentApps.length === 0 ? (
            <p className="jr-section-empty-copy">
              {resumeScore < 50
                ? "Finish the resume basics first, then start saving roles."
                : "No applications yet. Save a role from Jobs to begin tracking."}
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
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="jr-stat-card">
      <span className="jr-stat-label">{label}</span>
      <span className="jr-stat-value">{value}</span>
      <span className="jr-stat-sub">{sub}</span>
    </div>
  );
}

function getNextStep(
  score: number,
  hasResume: boolean,
  counts: { saved: number; applied: number }
): { cta: string; href: string } {
  if (!hasResume) return { cta: "Create your resume", href: "/jobready/app/documents" };
  if (score < 30) return { cta: "Add core details", href: "/jobready/app/documents" };
  if (score < 50) return { cta: "Add experience", href: "/jobready/app/documents" };
  if (score < 70) return { cta: "Complete your resume", href: "/jobready/app/documents" };
  if (counts.saved === 0 && counts.applied === 0) return { cta: "Start job search", href: "/jobready/app/jobs" };
  return { cta: "Review applications", href: "/jobready/app/applications" };
}
