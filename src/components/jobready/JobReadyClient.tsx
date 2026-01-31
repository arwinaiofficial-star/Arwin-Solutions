"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type JobFormState = {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  country: string;
  keywords: string;
  experienceLevel: string;
};

type JobResult = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  tags?: string[];
};

type JobsMeta = {
  total: number;
  fromNetwork: string[];
  generatedAt: string;
};

const initialForm: JobFormState = {
  fullName: "",
  email: "",
  phone: "",
  role: "",
  location: "",
  country: "",
  keywords: "",
  experienceLevel: "",
};

const experienceOptions = [
  "Entry (0-2 years)",
  "Mid-Level (3-7 years)",
  "Senior (8-12 years)",
  "Leadership (12+ years)",
];

type QuickQuery = Pick<JobFormState, "role" | "location" | "country">;

const platformBuilders = [
  {
    name: "LinkedIn",
    build: (form: QuickQuery) =>
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
        form.role || "AI Product"
      )}&location=${encodeURIComponent(form.location || form.country || "Global")}`,
  },
  {
    name: "Indeed",
    build: (form: QuickQuery) =>
      `https://www.indeed.com/jobs?q=${encodeURIComponent(
        form.role || "AI"
      )}&l=${encodeURIComponent(form.location || form.country || "United States")}`,
  },
  {
    name: "Naukri",
    build: (form: QuickQuery) =>
      `https://www.naukri.com/${encodeURIComponent(
        (form.role || "AI Engineer").replace(/\s+/g, "-")
      )}-jobs-in-${encodeURIComponent(form.location || form.country || "India")}`,
  },
  {
    name: "Simplify",
    build: (form: QuickQuery) =>
      `https://simplify.jobs/search?q=${encodeURIComponent(form.role || "AI")}&l=${encodeURIComponent(
        form.location || form.country || "Global"
      )}`,
  },
  {
    name: "JobRight",
    build: (form: QuickQuery) =>
      `https://www.jobright.ai/jobs?search=${encodeURIComponent(
        form.role || "AI"
      )}&location=${encodeURIComponent(form.location || form.country || "Global")}`,
  },
];

const labelClass =
  "block text-xs font-semibold uppercase tracking-[0.3em] text-[var(--page-muted)]";

const inputClass =
  "maya-input maya-input--variant-default maya-input--size-md w-full border-slate-200 bg-white text-slate-900 placeholder:text-slate-400";

export default function JobReadyClient() {
  const [form, setForm] = useState<JobFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<JobResult[]>([]);
  const [meta, setMeta] = useState<JobsMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { role, location, country } = form;
  const quickPlatforms = useMemo(
    () =>
      platformBuilders.map((platform) => ({
        name: platform.name,
        url: platform.build({ role, location, country }),
      })),
    [role, location, country]
  );

  const handleChange =
    (field: keyof JobFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to search for jobs right now.");
      }
      setResults(payload.results || []);
      setMeta(payload.meta || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <p className="tag tag-accent">JobReady.ai</p>
              <h1 className="text-3xl font-semibold text-[var(--page-foreground)]">
                Phase 1 - guided intake -&gt; automated job discovery
              </h1>
              <p className="lead">
                Fill out the essentials and Arwin&apos;s AI touch orchestrates a multi-platform search across
                Remotive, Arbeitnow, and deep links to LinkedIn, Indeed, Naukri, Simplify, and JobRight.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                Full Name
                <input
                  required
                  className={`${inputClass} mt-2`}
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  placeholder="Aisha Dev"
                />
              </label>
              <label className={labelClass}>
                Email
                <input
                  required
                  type="email"
                  className={`${inputClass} mt-2`}
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="you@example.com"
                />
              </label>
              <label className={labelClass}>
                Phone
                <input
                  className={`${inputClass} mt-2`}
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="+1 555 010 0101"
                />
              </label>
              <label className={labelClass}>
                Desired Role
                <input
                  required
                  className={`${inputClass} mt-2`}
                  value={form.role}
                  onChange={handleChange("role")}
                  placeholder="AI Product Manager"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                Preferred Location
                <input
                  required
                  className={`${inputClass} mt-2`}
                  value={form.location}
                  onChange={handleChange("location")}
                  placeholder="Hyderabad"
                />
              </label>
              <label className={labelClass}>
                Country
                <input
                  className={`${inputClass} mt-2`}
                  value={form.country}
                  onChange={handleChange("country")}
                  placeholder="India"
                />
              </label>
              <label className={labelClass}>
                Experience Level
                <select
                  className={`${inputClass} mt-2 bg-white`}
                  value={form.experienceLevel}
                  onChange={handleChange("experienceLevel")}
                >
                  <option value="">Select</option>
                  {experienceOptions.map((option) => (
                    <option className="bg-white text-slate-900" key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Focus Keywords
                <input
                  className={`${inputClass} mt-2`}
                  value={form.keywords}
                  onChange={handleChange("keywords")}
                  placeholder="GenAI copilots, bilingual, fintech"
                />
              </label>
            </div>
            <div>
              <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? "Searching..." : "Search jobs now"}
              </button>
              {error && <p className="mt-3 text-sm text-rose-500">{error} - Try again shortly.</p>}
            </div>
            <div className="card-muted text-sm text-[var(--page-muted)]">
              <p>
                By continuing, you agree that we&apos;ll fetch public listings from Remotive.com and
                Arbeitnow.com and direct you to the original platform for applications.
              </p>
            </div>
          </form>
        </section>
        <section className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--page-muted)]">
                  Results
                </p>
                <h2 className="text-2xl font-semibold text-[var(--page-foreground)]">Live opportunities</h2>
              </div>
              {meta && (
                <div className="text-right text-sm text-[var(--page-muted)]">
                  <p>{meta.total} matches</p>
                  <p>Sources: {meta.fromNetwork.join(", ")}</p>
                </div>
              )}
            </div>
            {results.length === 0 ? (
              <p className="mt-6 text-sm text-[var(--page-muted)]">
                Submit the form to trigger a multi-platform search. We&apos;ll summarize each listing here.
              </p>
            ) : (
              <ul className="mt-6 space-y-4">
                {results.map((job) => (
                  <li key={job.id} className="card-muted">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-[var(--page-muted)]">{job.company}</p>
                        <h3 className="text-lg font-semibold text-[var(--page-foreground)]">{job.title}</h3>
                        <p className="text-sm text-[var(--page-muted)]">{job.location}</p>
                      </div>
                      <span className="tag tag-accent text-xs">{job.source}</span>
                    </div>
                    <p className="mt-3 text-sm text-[var(--page-muted)]">{job.description}</p>
                    {job.tags && job.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.tags.map((tag) => (
                          <span key={tag} className="tag text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary mt-4 inline-flex px-4 py-2 text-sm"
                    >
                      View on {job.source} ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--page-muted)]">
              Fast switches
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--page-foreground)]">
              Deep links to other platforms
            </h3>
            <p className="text-sm text-[var(--page-muted)]">
              These links inherit your role & location so you can keep exploring LinkedIn, Indeed,
              Naukri, Simplify, and JobRight instantly.
            </p>
            <ul className="mt-4 grid gap-3">
              {quickPlatforms.map((platform) => (
                <li key={platform.name}>
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900"
                  >
                    <span>{platform.name}</span>
                    <span className="brand-link">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="card text-sm text-[var(--page-muted)]">
            <p>
              Need adjustments or to send us new sources? Email jobready@arwinaisolutions.com and we&apos;ll
              assess and plug the feed into the workflow.
            </p>
            <Link href="/" className="brand-link mt-3 inline-flex items-center font-semibold">
              ← Back to Arwin AI Solutions
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
