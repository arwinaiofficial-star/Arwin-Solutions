"use client";

import { JobResult } from "./types";
import {
  LocationIcon,
  ClockIcon,
  ExternalLinkIcon,
  BriefcaseIcon,
} from "@/components/icons/Icons";

interface JobCardProps {
  job: JobResult;
  onSave?: (job: JobResult) => void;
  onApply?: (job: JobResult) => void;
  onViewDetails?: (job: JobResult) => void;
  trackingStatus?: string | null;
  actionLoading?: "save" | "apply" | null;
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
  if (cleaned.length <= 160) return cleaned;
  return `${cleaned.slice(0, 157).trimEnd()}...`;
}

export default function JobCard({
  job,
  onSave,
  onApply,
  onViewDetails,
  trackingStatus = null,
  actionLoading = null,
}: JobCardProps) {
  const matchLevel = getMatchClass(job.relevanceScore);
  const isTracked = Boolean(trackingStatus);
  const saveLabel =
    trackingStatus === "applied" || trackingStatus === "interview" || trackingStatus === "offer"
      ? "Tracked"
      : trackingStatus === "saved"
        ? "Saved"
        : "Save";
  const applyLabel =
    trackingStatus === "applied" || trackingStatus === "interview" || trackingStatus === "offer"
      ? "Open role"
      : "Open & apply";

  return (
    <div className="jr-job-card">
      <div className="jr-job-card-header">
        <div className="jr-job-card-info">
          <div className="jr-job-card-topline">
            <span className={`jr-match-pill jr-match-pill-${matchLevel}`}>
              {matchLevel === "high" ? "Strong match" : matchLevel === "medium" ? "Good match" : "Stretch match"}
            </span>
            {job.source && (
              <span className="jr-badge jr-badge-gray">{job.source}</span>
            )}
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
        <div className="jr-job-card-match">
          <div className={`jr-match-circle ${matchLevel}`}>
            {job.relevanceScore}%
          </div>
          <span className="jr-match-label">Match</span>
        </div>
      </div>

      {job.description && (
        <p className="jr-job-card-desc">{summarizeDescription(job.description)}</p>
      )}

      {job.tags && job.tags.length > 0 && (
        <div className="jr-job-card-tags">
          {job.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="jr-badge jr-badge-blue">{tag}</span>
          ))}
          {job.tags.length > 4 && (
            <span className="jr-badge jr-badge-gray">+{job.tags.length - 4}</span>
          )}
        </div>
      )}

      <div className="jr-job-card-actions">
        {onViewDetails && (
          <button
            className="jr-btn jr-btn-secondary jr-btn-sm"
            onClick={() => onViewDetails(job)}
          >
            Details
          </button>
        )}
        {onSave && (
          <button
            className={`jr-btn ${isTracked ? "jr-btn-secondary" : "jr-btn-primary"} jr-btn-sm`}
            onClick={() => onSave(job)}
            disabled={isTracked || actionLoading !== null}
          >
            {actionLoading === "save" ? "Saving..." : saveLabel}
          </button>
        )}
        <button
          type="button"
          className="jr-btn jr-btn-ghost jr-btn-sm jr-job-card-cta"
          onClick={() => onApply?.(job)}
          disabled={!onApply || actionLoading !== null}
        >
          <ExternalLinkIcon size={14} />
          {actionLoading === "apply" ? "Opening..." : applyLabel}
        </button>
      </div>
    </div>
  );
}
