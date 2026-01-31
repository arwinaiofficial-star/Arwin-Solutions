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
];

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
    <div className="section">
      <div className="container">
        <div className="grid gap-8" style={{ gridTemplateColumns: '1fr', maxWidth: '900px', margin: '0 auto' }}>
          {/* Form Section */}
          <section className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <span className="tag tag-primary mb-3">JobReady.ai</span>
                <h1 className="mb-2">AI-Powered Job Discovery</h1>
                <p className="text-secondary">
                  Fill out your details and our AI orchestrates a multi-platform search across
                  Remotive, Arbeitnow, LinkedIn, Indeed, and Naukri.
                </p>
              </div>

              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    required
                    type="text"
                    className="input"
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    required
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    className="input"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="+1 555 010 0101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Desired Role *</label>
                  <input
                    required
                    type="text"
                    className="input"
                    value={form.role}
                    onChange={handleChange("role")}
                    placeholder="AI Product Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Location *</label>
                  <input
                    required
                    type="text"
                    className="input"
                    value={form.location}
                    onChange={handleChange("location")}
                    placeholder="City name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <input
                    type="text"
                    className="input"
                    value={form.country}
                    onChange={handleChange("country")}
                    placeholder="India"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Experience Level</label>
                  <select
                    className="input"
                    value={form.experienceLevel}
                    onChange={handleChange("experienceLevel")}
                  >
                    <option value="">Select</option>
                    {experienceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Focus Keywords</label>
                  <input
                    type="text"
                    className="input"
                    value={form.keywords}
                    onChange={handleChange("keywords")}
                    placeholder="GenAI, fintech, remote"
                  />
                </div>
              </div>

              <div>
                <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Searching..." : "Search Jobs"}
                </button>
                {error && <p className="mt-3 text-sm text-error">{error}</p>}
              </div>

              <p className="text-xs text-tertiary">
                By continuing, you agree that we will fetch public listings from job platforms
                and direct you to the original source for applications.
              </p>
            </form>
          </section>

          {/* Results Section */}
          <section className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Results</h2>
                <p className="text-sm text-secondary">Live opportunities</p>
              </div>
              {meta && (
                <div className="text-right text-sm text-secondary">
                  <p>{meta.total} matches</p>
                  <p>From: {meta.fromNetwork.join(", ")}</p>
                </div>
              )}
            </div>

            {results.length === 0 ? (
              <p className="text-secondary text-sm">
                Submit the form to search across multiple job platforms.
              </p>
            ) : (
              <div className="space-y-4">
                {results.map((job) => (
                  <div key={job.id} className="card-muted">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-xs text-secondary">{job.company}</p>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-secondary">{job.location}</p>
                      </div>
                      <span className="tag tag-primary text-xs">{job.source}</span>
                    </div>
                    <p className="text-sm text-secondary mb-3">{job.description}</p>
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.tags.map((tag) => (
                          <span key={tag} className="tag text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      View on {job.source}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Links */}
          <section className="card">
            <h3 className="font-semibold mb-2">Quick Links to Job Platforms</h3>
            <p className="text-sm text-secondary mb-4">
              These links use your role and location to search other platforms.
            </p>
            <div className="space-y-2">
              {quickPlatforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="font-medium">{platform.name}</span>
                  <span className="text-secondary">→</span>
                </a>
              ))}
            </div>
          </section>

          {/* Back Link */}
          <div className="text-center">
            <Link href="/" className="text-sm text-secondary hover:text-primary">
              ← Back to Arwin AI Solutions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
