"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { applicationsApi, type JobApplicationData } from "@/lib/api/client";
import { ArrowRightIcon, ExternalLinkIcon, TrashIcon } from "@/components/icons/Icons";
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

function formatStatusLabel(status: Status): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function ApplicationTracker() {
  const [apps, setApps] = useState<JobApplicationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await applicationsApi.list();
      if (cancelled) return;
      if (res.data) setApps(res.data);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
      <section className="jr-page-hero jr-applications-hero jr-page-hero-compact">
        <div className="jr-page-hero-copy">
          <span className="jr-page-eyebrow">Pipeline tracking</span>
          <h2>Keep every opportunity moving.</h2>
          <p>Move saved roles through applied, interview, and offer in one place.</p>
        </div>
      </section>

      {apps.length === 0 ? (
        <section className="jr-start-card">
          <div className="jr-start-card-copy">
            <span className="jr-page-eyebrow">Start here</span>
            <h3>Search and save the first role you want to track.</h3>
            <p>Once you save a role from Jobs, it will appear here with stage controls for applied, interview, and offer.</p>
          </div>
          <Link href="/jobready/app/jobs" className="jr-btn jr-btn-primary">
            Browse jobs
          </Link>
        </section>
      ) : (
        <>
          <div className="jr-tracker-stats">
            {COLUMNS.map((col) => (
              <div key={col.key} className="jr-tracker-stat">
                <div className="jr-tracker-stat-value">{counts[col.key]}</div>
                <div className="jr-tracker-stat-label">{col.label}</div>
              </div>
            ))}
          </div>

          <div className="jr-board-wrap">
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
                        <div className="jr-kanban-empty">No roles in this stage yet</div>
                      ) : (
                        colApps.map((app) => {
                          const next = getNextStatus(app.status as Status);
                          return (
                            <div key={app.id} className="jr-kanban-card">
                              <h4 className="jr-kanban-card-title">{app.job_title}</h4>
                              <p className="jr-kanban-card-company">{app.company}</p>
                              {app.location && <p className="jr-kanban-card-location">{app.location}</p>}
                              <div className="jr-kanban-card-footer">
                                <span className="jr-kanban-card-date">
                                  {formatDate(app.applied_at)}
                                </span>
                                <div className="jr-kanban-card-actions">
                                  {next && (
                                    <button
                                      className="jr-kanban-action jr-kanban-action-primary"
                                      onClick={() => moveApp(app.id, next)}
                                      title={`Move to ${formatStatusLabel(next)}`}
                                    >
                                      <ArrowRightIcon size={12} />
                                      <span>{formatStatusLabel(next)}</span>
                                    </button>
                                  )}
                                  {app.job_url && (
                                    <a
                                      href={app.job_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="jr-kanban-action"
                                    >
                                      <ExternalLinkIcon size={10} />
                                    </a>
                                  )}
                                  <button
                                    className="jr-kanban-action"
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
          </div>
        </>
      )}
    </div>
  );
}
