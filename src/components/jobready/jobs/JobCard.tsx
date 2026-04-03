"use client";

import { JobResult } from "./types";
import {
  LocationIcon,
  ClockIcon,
  BriefcaseIcon,
  SearchIcon,
} from "@/components/icons/Icons";

interface JobCardProps {
  job: JobResult;
  onSave?: (job: JobResult) => void;
  onViewDetails?: (job: JobResult) => void;
  trackingStatus?: string | null;
  actionLoading?: "save" | "apply" | null;
  selected?: boolean;
}

function getMatchClass(score: number): string {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function summarizeDescription(description: string): string {
  const cleaned = description.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 130) return cleaned;
  return `${cleaned.slice(0, 127).trimEnd()}...`;
}

function formatStatus(status: string | null) {
  if (!status) return "Not tracked";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function JobCard({
  job,
  onSave,
  onViewDetails,
  trackingStatus = null,
  actionLoading = null,
  selected = false,
}: JobCardProps) {
  const matchLevel = getMatchClass(job.relevanceScore);
  const isTracked = Boolean(trackingStatus);

  return (
    <div className={`jr-job-card ${selected ? "jr-job-card-selected" : ""}`}>
      <div className="jr-job-card-header">
        <div className="jr-job-card-info">
          <div className="jr-job-card-topline">
            <span className={`jr-match-pill jr-match-pill-${matchLevel}`}>
              {matchLevel === "high" ? "Strong fit" : matchLevel === "medium" ? "Good fit" : "Stretch"}
            </span>
            <span className={`jr-job-card-status jr-job-card-status-${trackingStatus || "none"}`}>
              {formatStatus(trackingStatus)}
            </span>
          </div>
          <h3 className="jr-job-card-title">{job.title}</h3>
          <p className="jr-job-card-company">{job.company}</p>
          <div className="jr-job-card-meta">
            {job.location && (
              <span>
                <LocationIcon size={12} />
                {job.location}
              </span>
            )}
            {job.salary && (
              <span>
                <BriefcaseIcon size={12} />
                {job.salary}
              </span>
            )}
            {job.postedAt && (
              <span>
                <ClockIcon size={12} />
                {timeAgo(job.postedAt)}
              </span>
            )}
            {job.jobType && (
              <span>
                <BriefcaseIcon size={12} />
                {job.jobType}
              </span>
            )}
          </div>
        </div>

        <div className={`jr-job-card-score jr-job-card-score-${matchLevel}`}>
          <strong>{job.relevanceScore}%</strong>
          <span>match</span>
        </div>
      </div>

      {job.description && <p className="jr-job-card-desc">{summarizeDescription(job.description)}</p>}

      {job.tags && job.tags.length > 0 && (
        <div className="jr-job-card-tags">
          {job.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="jr-badge jr-badge-blue">
              {tag}
            </span>
          ))}
          {job.tags.length > 4 && (
            <span className="jr-badge jr-badge-gray">+{job.tags.length - 4}</span>
          )}
        </div>
      )}

      <div className="jr-job-card-actions">
        <button
          className={`jr-btn ${selected ? "jr-btn-primary" : "jr-btn-secondary"} jr-btn-sm`}
          onClick={() => onViewDetails?.(job)}
        >
          <SearchIcon size={14} />
          {selected ? "Selected" : "Review"}
        </button>
        {onSave && (
          <button
            className={`jr-btn ${isTracked ? "jr-btn-secondary" : "jr-btn-ghost"} jr-btn-sm`}
            onClick={() => onSave(job)}
            disabled={isTracked || actionLoading !== null}
          >
            {actionLoading === "save" ? "Saving..." : isTracked ? "Tracked" : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}
