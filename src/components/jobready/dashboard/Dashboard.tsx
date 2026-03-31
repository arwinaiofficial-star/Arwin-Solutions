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
} from "@/components/icons/Icons";
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

  const counts = {
    saved: apps.filter((a) => a.status === "saved").length,
    applied: apps.filter((a) => a.status === "applied").length,
    interview: apps.filter((a) => a.status === "interview").length,
    offer: apps.filter((a) => a.status === "offer").length,
  };

  const recentApps = [...apps]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  // Resume completion percentage
  const resumeScore = (() => {
    if (!user?.cvData) return 0;
    const cv = user.cvData as unknown as Record<string, unknown>;
    let score = 0;
    if (cv.personalInfo) score += 20;
    if (cv.summary) score += 20;
    if (cv.skills && (cv.skills as string[]).length > 0) score += 20;
    if (cv.experience && (cv.experience as unknown[]).length > 0) score += 20;
    if (cv.education && (cv.education as unknown[]).length > 0) score += 20;
    return score;
  })();

  return (
    <div className="jr-dashboard">
      {/* Greeting */}
      <div className="jr-dashboard-greeting">
        <h1>{getGreeting()}, {user?.name?.split(" ")[0] || "there"}</h1>
        <p>Here&apos;s your career progress at a glance.</p>
      </div>

      {/* Stats Row */}
      <div className="jr-stats-row">
        <div className="jr-stat-card">
          <span className="jr-stat-label">Resume</span>
          <span className="jr-stat-value">{resumeScore}%</span>
          <span className="jr-stat-sub">{hasResume ? "Complete" : "Not started"}</span>
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
              No applications yet. Start by searching for jobs.
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
