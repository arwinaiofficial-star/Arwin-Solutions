"use client";

import { useState, useEffect, useCallback } from "react";
import { applicationsApi, type JobApplicationData } from "@/lib/api/client";
import { ExternalLinkIcon, TrashIcon } from "@/components/icons/Icons";
import "@/app/jobready/jobready.css";

const COLUMNS = [
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
] as const;

type Status = (typeof COLUMNS)[number]["key"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ApplicationTracker() {
  const [apps, setApps] = useState<JobApplicationData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApps = useCallback(async () => {
    const res = await applicationsApi.list();
    if (res.data) setApps(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadApps(); }, [loadApps]);

  const moveApp = useCallback(async (id: string, newStatus: Status) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    await applicationsApi.update(id, { status: newStatus });
  }, []);

  const removeApp = useCallback(async (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    await applicationsApi.remove(id);
  }, []);

  const getNextStatus = (current: Status): Status | null => {
    const idx = COLUMNS.findIndex((c) => c.key === current);
    return idx < COLUMNS.length - 1 ? COLUMNS[idx + 1].key : null;
  };

  const counts = COLUMNS.reduce(
    (acc, col) => {
      acc[col.key] = apps.filter((a) => a.status === col.key).length;
      return acc;
    },
    {} as Record<Status, number>
  );

  if (loading) {
    return (
      <div className="jr-tracker">
        <div className="jr-kanban">
          {COLUMNS.map((col) => (
            <div key={col.key} className="jr-kanban-col">
              <div className="jr-kanban-col-header">
                <span className="jr-kanban-col-title">{col.label}</span>
              </div>
              <div className="jr-kanban-cards">
                <div className="jr-skeleton-card">
                  <div className="jr-skeleton jr-skeleton-line medium" />
                  <div className="jr-skeleton jr-skeleton-line short" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="jr-tracker">
      {/* Stats Row */}
      <div className="jr-tracker-stats">
        {COLUMNS.map((col) => (
          <div key={col.key} className="jr-tracker-stat">
            <div className="jr-tracker-stat-value">{counts[col.key]}</div>
            <div className="jr-tracker-stat-label">{col.label}</div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="jr-kanban">
        {COLUMNS.map((col) => {
          const colApps = apps.filter((a) => a.status === col.key);
          return (
            <div key={col.key} className="jr-kanban-col">
              <div className="jr-kanban-col-header">
                <span className="jr-kanban-col-title">{col.label}</span>
                <span className="jr-kanban-col-count">{colApps.length}</span>
              </div>
              <div className="jr-kanban-cards">
                {colApps.length === 0 ? (
                  <div className="jr-kanban-empty">No applications</div>
                ) : (
                  colApps.map((app) => {
                    const next = getNextStatus(app.status as Status);
                    return (
                      <div key={app.id} className="jr-kanban-card">
                        <h4 className="jr-kanban-card-title">{app.job_title}</h4>
                        <p className="jr-kanban-card-company">{app.company}</p>
                        <div className="jr-kanban-card-footer">
                          <span className="jr-kanban-card-date">
                            {formatDate(app.applied_at)}
                          </span>
                          <div className="jr-kanban-card-actions">
                            {next && (
                              <button
                                onClick={() => moveApp(app.id, next)}
                                title={`Move to ${next}`}
                              >
                                →
                              </button>
                            )}
                            {app.job_url && (
                              <a
                                href={app.job_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "inline-flex", padding: "2px 6px", fontSize: "10px", border: "1px solid var(--jr-gray-200)", borderRadius: "4px", background: "var(--jr-white)", color: "var(--jr-gray-500)", textDecoration: "none" }}
                              >
                                <ExternalLinkIcon size={10} />
                              </a>
                            )}
                            <button
                              onClick={() => removeApp(app.id)}
                              title="Remove"
                            >
                              <TrashIcon size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State for whole tracker */}
      {apps.length === 0 && (
        <div className="jr-empty" style={{ marginTop: "var(--jr-space-4)" }}>
          <h2 className="jr-empty-title">No applications yet</h2>
          <p className="jr-empty-text">
            Search for jobs and save them to start tracking your applications.
          </p>
        </div>
      )}
    </div>
  );
}
