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
  onApply: (job: JobResult) => void;
  trackingStatus?: string | null;
  actionLoading?: "save" | "apply" | null;
}

export default function JobDetailModal({
  job,
  onClose,
  onSave,
  onApply,
  trackingStatus = null,
  actionLoading = null,
}: JobDetailModalProps) {
  return (
    <div className="jr-modal-overlay" onClick={onClose}>
      <div className="jr-modal jr-job-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="jr-modal-header">
          <div className="jr-modal-title-group">
            <span className="jr-badge jr-badge-blue">Role preview</span>
            <h2 className="jr-modal-title">{job.title}</h2>
          </div>
          <button className="jr-btn jr-btn-ghost jr-btn-sm" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="jr-job-detail">
          <div className="jr-job-detail-summary">
            <p className="jr-job-detail-company">{job.company}</p>
            <div className="jr-job-card-meta">
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
            <div className="jr-job-detail-section">
              <h3>Key skills</h3>
              <div className="jr-job-detail-skills">
              {job.tags.map((tag) => (
                <span key={tag} className="jr-badge jr-badge-blue">{tag}</span>
              ))}
            </div>
            </div>
          )}

          {job.description && (
            <div className="jr-job-detail-section">
              <h3>Role overview</h3>
              <div className="jr-job-detail-body">
              {job.description}
            </div>
            </div>
          )}

          <div className="jr-job-detail-actions">
            <button
              className="jr-btn jr-btn-primary"
              onClick={() => { onSave(job); }}
              disabled={Boolean(trackingStatus) || actionLoading !== null}
            >
              {actionLoading === "save"
                ? "Saving..."
                : trackingStatus
                  ? "Tracked"
                  : "Save to Tracker"}
            </button>
            <button
              type="button"
              className="jr-btn jr-btn-secondary"
              onClick={() => {
                onApply(job);
                onClose();
              }}
              disabled={actionLoading !== null}
            >
              <ExternalLinkIcon size={14} />
              {actionLoading === "apply"
                ? "Opening..."
                : trackingStatus === "applied" || trackingStatus === "interview" || trackingStatus === "offer"
                  ? "Open role"
                  : `Open & apply`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
