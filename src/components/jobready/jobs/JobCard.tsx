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
  onViewDetails?: (job: JobResult) => void;
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

export default function JobCard({ job, onSave, onViewDetails }: JobCardProps) {
  return (
    <div className="jr-job-card">
      <div className="jr-job-card-header">
        <div className="jr-job-card-info">
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
            {job.source && (
              <span className="jr-badge jr-badge-gray">{job.source}</span>
            )}
          </div>
        </div>
        <div className="jr-job-card-match">
          <div className={`jr-match-circle ${getMatchClass(job.relevanceScore)}`}>
            {job.relevanceScore}%
          </div>
          <span className="jr-match-label">Match</span>
        </div>
      </div>

      {job.description && (
        <p className="jr-job-card-desc">{job.description}</p>
      )}

      {job.tags && job.tags.length > 0 && (
        <div className="jr-job-card-tags">
          {job.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="jr-badge jr-badge-blue">{tag}</span>
          ))}
          {job.tags.length > 5 && (
            <span className="jr-badge jr-badge-gray">+{job.tags.length - 5}</span>
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
            className="jr-btn jr-btn-primary jr-btn-sm"
            onClick={() => onSave(job)}
          >
            Save
          </button>
        )}
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="jr-btn jr-btn-ghost jr-btn-sm"
          style={{ marginLeft: "auto" }}
        >
          <ExternalLinkIcon size={14} />
          Apply
        </a>
      </div>
    </div>
  );
}
