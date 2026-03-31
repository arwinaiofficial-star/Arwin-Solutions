"use client";

import { JobResult } from "./types";
import {
  XIcon,
  LocationIcon,
  BriefcaseIcon,
  ExternalLinkIcon,
} from "@/components/icons/Icons";

interface JobDetailModalProps {
  job: JobResult;
  onClose: () => void;
  onSave: (job: JobResult) => void;
}

export default function JobDetailModal({ job, onClose, onSave }: JobDetailModalProps) {
  return (
    <div className="jr-modal-overlay" onClick={onClose}>
      <div className="jr-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
        <div className="jr-modal-header">
          <h2 className="jr-modal-title">{job.title}</h2>
          <button className="jr-btn jr-btn-ghost jr-btn-sm" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="jr-job-detail">
          <div>
            <p className="jr-job-detail-company">{job.company}</p>
            <div className="jr-job-card-meta" style={{ marginTop: "8px" }}>
              {job.location && (
                <span><LocationIcon size={12} /> {job.location}</span>
              )}
              {job.salary && (
                <span><BriefcaseIcon size={12} /> {job.salary}</span>
              )}
              {job.jobType && (
                <span>{job.jobType}</span>
              )}
              <span className="jr-badge jr-badge-gray">{job.source}</span>
            </div>
          </div>

          {job.tags && job.tags.length > 0 && (
            <div className="jr-job-detail-skills">
              {job.tags.map((tag) => (
                <span key={tag} className="jr-badge jr-badge-blue">{tag}</span>
              ))}
            </div>
          )}

          {job.description && (
            <div className="jr-job-detail-body">
              {job.description}
            </div>
          )}

          <div className="jr-job-detail-actions">
            <button
              className="jr-btn jr-btn-primary"
              onClick={() => { onSave(job); onClose(); }}
            >
              Save to Tracker
            </button>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="jr-btn jr-btn-secondary"
            >
              <ExternalLinkIcon size={14} />
              Apply on {job.source}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
