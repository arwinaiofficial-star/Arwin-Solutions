import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import logger from "@/lib/logger";

const MAX_SKILL_LENGTH = 50;
const MAX_SKILLS_COUNT = 20;
const API_TIMEOUT_MS = 10000;

// Adzuna API credentials
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || "";
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || "";

// JSearch API credentials
const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY || "";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  salary?: string;
  jobType?: string;
  postedAt?: string;
  tags?: string[];
}

// ─── Adzuna API (India endpoint) ────────────────────────────────────────────

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  company: { display_name: string };
  location: { display_name: string; area?: string[] };
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  contract_type?: string;
  created: string;
  category?: { label: string; tag: string };
}

async function fetchAdzunaJobs(skills: string[], location: string): Promise<Job[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return [];

  try {
    const query = skills.slice(0, 5).join(" ");
    const locationParam = location && location !== "Remote" ? `&where=${encodeURIComponent(location)}` : "";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=50&what=${encodeURIComponent(query)}${locationParam}&content-type=application/json`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.error("Adzuna API error", { status: response.status });
      return [];
    }

    const data = await response.json();
    const results: AdzunaJob[] = data.results || [];

    return results.map((job) => {
      let salary: string | undefined;
      if (job.salary_min && job.salary_max) {
        const minLPA = (job.salary_min / 100000).toFixed(1);
        const maxLPA = (job.salary_max / 100000).toFixed(1);
        salary = `₹${minLPA}L - ₹${maxLPA}L per annum`;
      } else if (job.salary_min) {
        salary = `₹${(job.salary_min / 100000).toFixed(1)}L+ per annum`;
      }

      const tags: string[] = [];
      if (job.category?.label) tags.push(job.category.label);
      if (job.contract_type) tags.push(job.contract_type);
      for (const skill of skills) {
        if (job.title.toLowerCase().includes(skill.toLowerCase()) || job.description.toLowerCase().includes(skill.toLowerCase())) {
          if (!tags.includes(skill)) tags.push(skill);
        }
        if (tags.length >= 5) break;
      }

      return {
        id: `adzuna-${job.id}`,
        title: job.title,
        company: job.company?.display_name || "Company",
        location: job.location?.display_name || "India",
        description: stripHtml(job.description).slice(0, 300),
        url: job.redirect_url,
        source: "Adzuna",
        salary,
        jobType: job.contract_time === "full_time" ? "Full-time" : job.contract_time === "part_time" ? "Part-time" : job.contract_type || undefined,
        postedAt: formatDate(job.created),
        tags: tags.slice(0, 5),
      };
    });
  } catch (error) {
    logger.error("Error fetching Adzuna jobs", { error: error instanceof Error ? error.message : "Unknown" });
    return [];
  }
}

// ─── JSearch API (RapidAPI - LinkedIn, Indeed, Glassdoor aggregator) ─────────

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_description: string;
  job_apply_link: string;
  job_employment_type: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_posted_at_datetime_utc: string;
  job_is_remote: boolean;
  employer_logo: string | null;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
  };
}

async function fetchJSearchJobs(skills: string[], location: string): Promise<Job[]> {
  if (!JSEARCH_API_KEY) return [];

  try {
    const query = `${skills.slice(0, 3).join(", ")} in India`;
    const locationParam = location && location !== "Remote" ? ` ${location}` : "";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query + locationParam)}&page=1&num_pages=2&country=in&date_posted=month`;

    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": JSEARCH_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.error("JSearch API error", { status: response.status });
      return [];
    }

    const data = await response.json();
    const results: JSearchJob[] = data.data || [];

    return results.map((job) => {
      let salary: string | undefined;
      if (job.job_min_salary && job.job_max_salary) {
        const currency = job.job_salary_currency === "INR" ? "₹" : "$";
        const period = job.job_salary_period === "YEAR" ? "per annum" : job.job_salary_period?.toLowerCase() || "";
        if (currency === "₹") {
          salary = `₹${(job.job_min_salary / 100000).toFixed(1)}L - ₹${(job.job_max_salary / 100000).toFixed(1)}L ${period}`;
        } else {
          salary = `${currency}${job.job_min_salary.toLocaleString()} - ${currency}${job.job_max_salary.toLocaleString()} ${period}`;
        }
      }

      const locationStr = job.job_is_remote
        ? "Remote"
        : [job.job_city, job.job_state].filter(Boolean).join(", ") || "India";

      const tags: string[] = [];
      if (job.job_employment_type) tags.push(job.job_employment_type.replace("_", " "));
      if (job.job_is_remote) tags.push("Remote");
      for (const skill of skills) {
        if (job.job_title.toLowerCase().includes(skill.toLowerCase())) {
          if (!tags.includes(skill)) tags.push(skill);
        }
        if (tags.length >= 5) break;
      }

      return {
        id: `jsearch-${job.job_id}`,
        title: job.job_title,
        company: job.employer_name || "Company",
        location: locationStr,
        description: stripHtml(job.job_description).slice(0, 300),
        url: job.job_apply_link,
        source: "JSearch",
        salary,
        jobType: job.job_employment_type?.replace("_", " ") || undefined,
        postedAt: formatDate(job.job_posted_at_datetime_utc),
        tags: tags.slice(0, 5),
      };
    });
  } catch (error) {
    logger.error("Error fetching JSearch jobs", { error: error instanceof Error ? error.message : "Unknown" });
    return [];
  }
}

// ─── Remotive API (Remote jobs) ─────────────────────────────────────────────

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

async function fetchRemotiveJobs(skills: string[]): Promise<Job[]> {
  try {
    const searchTerm = skills.slice(0, 3).join(",").toLowerCase();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const response = await fetch(
      `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchTerm)}&limit=30`,
      {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const data = await response.json();
    const jobs: RemotiveJob[] = data.jobs || [];

    return jobs.map((job) => ({
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      description: stripHtml(job.description).slice(0, 300),
      url: job.url,
      source: "Remotive",
      salary: job.salary || undefined,
      jobType: job.job_type,
      postedAt: formatDate(job.publication_date),
      tags: job.tags?.slice(0, 5) || [],
    }));
  } catch (error) {
    logger.error("Error fetching Remotive jobs", { error: error instanceof Error ? error.message : "Unknown" });
    return [];
  }
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  let text = html.replace(/<[^>]*>/g, " ");
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
  return text.replace(/\s+/g, " ").trim();
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function scoreJob(job: Job, skills: string[], preferences: string): number {
  let score = 0;
  const jobText = `${job.title} ${job.description} ${job.tags?.join(" ") || ""}`.toLowerCase();
  const prefLower = preferences.toLowerCase();

  for (const skill of skills) {
    if (jobText.includes(skill.toLowerCase().trim())) {
      score += 10;
    }
  }

  const prefWords = prefLower.split(/\s+/).filter((w) => w.length > 3);
  for (const word of prefWords) {
    if (jobText.includes(word)) score += 5;
  }

  if (prefLower.includes("remote") && job.location.toLowerCase().includes("remote")) {
    score += 15;
  }

  // Boost jobs with salary info
  if (job.salary) score += 5;

  // Boost jobs with apply links
  if (job.url && !job.url.includes("naukri.com") && !job.url.includes("linkedin.com/jobs")) {
    score += 3; // direct apply links get a small boost
  }

  return score;
}

// ─── Route Handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request.headers);

  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    logger.warn("Rate limit exceeded", { ip: clientIP });
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { skills, preferences, location } = body;

    if (!skills || typeof skills !== "string") {
      return NextResponse.json({ error: "Skills are required" }, { status: 400 });
    }

    const skillArray = skills
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && s.length <= MAX_SKILL_LENGTH)
      .slice(0, MAX_SKILLS_COUNT);

    if (skillArray.length === 0) {
      return NextResponse.json({ error: "At least one skill is required" }, { status: 400 });
    }

    const locationStr = location || preferences || "";

    // Fetch from all three sources concurrently
    const [adzunaJobs, jsearchJobs, remotiveJobs] = await Promise.all([
      fetchAdzunaJobs(skillArray, locationStr),
      fetchJSearchJobs(skillArray, locationStr),
      fetchRemotiveJobs(skillArray),
    ]);

    const allJobs = [...adzunaJobs, ...jsearchJobs, ...remotiveJobs];

    // Score and sort
    const scoredJobs = allJobs.map((job) => ({
      ...job,
      relevanceScore: scoreJob(job, skillArray, preferences || ""),
    }));

    scoredJobs.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Deduplicate by title+company
    const uniqueJobs = scoredJobs.reduce(
      (acc, job) => {
        const key = `${job.title.toLowerCase().replace(/\s+/g, "")}-${job.company.toLowerCase().replace(/\s+/g, "")}`;
        if (!acc.seen.has(key)) {
          acc.seen.add(key);
          acc.jobs.push(job);
        }
        return acc;
      },
      { seen: new Set<string>(), jobs: [] as typeof scoredJobs }
    ).jobs;

    const duration = Date.now() - startTime;
    const sources = [...new Set(uniqueJobs.map((j) => j.source))];
    logger.jobSearch(skillArray, uniqueJobs.length, sources);
    logger.apiRequest("POST", "/api/jobs", duration, 200);

    return NextResponse.json({
      success: true,
      totalJobs: uniqueJobs.length,
      jobs: uniqueJobs,
      sources: {
        adzuna: adzunaJobs.length,
        jsearch: jsearchJobs.length,
        remotive: remotiveJobs.length,
      },
      searchCriteria: {
        skills: skillArray,
        location: locationStr || "India",
        preferences: preferences || "Not specified",
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Job search error", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration}ms`,
    });
    return NextResponse.json({ error: "Failed to search for jobs. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "JobReady.ai API - Use POST to search for jobs",
    version: "2.0.0",
    sources: ["Adzuna (India)", "JSearch (LinkedIn/Indeed/Glassdoor)", "Remotive (Remote)"],
    endpoints: {
      search: {
        method: "POST",
        body: {
          skills: "string (comma-separated, required)",
          location: "string (optional, e.g. 'Bangalore')",
          preferences: "string (optional)",
        },
      },
    },
  });
}
