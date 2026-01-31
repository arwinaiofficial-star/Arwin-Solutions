import { NextResponse } from "next/server";

type SearchPayload = {
  role: string;
  location: string;
  country?: string;
  keywords?: string;
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
  postedAt?: string;
};

const USER_AGENT = "ArwinAISolutions/1.0 (https://arwin-ai-solutions.vercel.app)";
const MAX_RESULTS = 18;
type ArbeitnowJob = {
  slug: string;
  title: string;
  company_name: string;
  location: string;
  description?: string;
  url: string;
  tags?: string[];
  created_at?: number;
};

type RemotiveJob = {
  id: number | string;
  title: string;
  company_name: string;
  candidate_required_location?: string;
  description?: string;
  url: string;
  tags?: string[];
  publication_date?: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, role, location, country, keywords } = body;
    if (!fullName || !email || !role || !location) {
      return NextResponse.json(
        { error: "Full name, email, desired role, and location are required." },
        { status: 400 }
      );
    }

    const query: SearchPayload = { role, location, country, keywords };

    const providers = [fetchArbeitNowJobs(query), fetchRemotiveJobs(query)];
    const settled = await Promise.allSettled(providers);
    const liveJobs = settled.flatMap((result) =>
      result.status === "fulfilled" ? result.value : []
    );
    const filtered = filterJobs(liveJobs, query).slice(0, MAX_RESULTS);
    const fallback = filtered.length > 0 ? [] : buildFallback(query);
    const results = filtered.length > 0 ? filtered : fallback;

    return NextResponse.json({
      results,
      meta: {
        total: results.length,
        fromNetwork: Array.from(new Set(results.map((job) => job.source))),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Job search failed", error);
    return NextResponse.json(
      { error: "Unable to search jobs right now. Please try again soon." },
      { status: 500 }
    );
  }
}

async function fetchArbeitNowJobs(query: SearchPayload): Promise<JobResult[]> {
  const endpoint = new URL("https://www.arbeitnow.com/api/job-board-api");
  endpoint.searchParams.set("search", query.role);
  endpoint.searchParams.set("location", query.location || query.country || "global");

  const response = await fetch(endpoint, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Arbeitnow feed unavailable");
  }

  const payload = await response.json();
  const data: ArbeitnowJob[] = Array.isArray(payload.data) ? payload.data : [];
  return data.map((job) => ({
    id: `arbeitnow-${job.slug}`,
    title: job.title,
    company: job.company_name,
    location: job.location || "Remote",
    description: truncate(stripHtml(job.description || ""), 260),
    url: job.url,
    source: "Arbeitnow",
    tags: job.tags || [],
    postedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : undefined,
  }));
}

async function fetchRemotiveJobs(query: SearchPayload): Promise<JobResult[]> {
  const endpoint = new URL("https://remotive.com/api/remote-jobs");
  endpoint.searchParams.set("search", query.role);
  endpoint.searchParams.set("limit", "50");

  const response = await fetch(endpoint, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Remotive feed unavailable");
  }

  const payload = await response.json();
  const jobs: RemotiveJob[] = Array.isArray(payload.jobs) ? payload.jobs : [];
  return jobs.map((job) => ({
    id: `remotive-${job.id}`,
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location || "Remote",
    description: truncate(stripHtml(job.description || ""), 260),
    url: job.url,
    source: "Remotive",
    tags: Array.isArray(job.tags) ? job.tags.slice(0, 4) : [],
    postedAt: job.publication_date,
  }));
}

function filterJobs(jobs: JobResult[], query: SearchPayload) {
  const roleTokens = tokenize(query.role);
  const keywordTokens = tokenize(query.keywords || "");
  const locationTokens = tokenize(query.location || "");
  const countryTokens = tokenize(query.country || "");

  return jobs.filter((job) => {
    const haystack = `${job.title} ${job.description} ${job.company} ${job.location}`.toLowerCase();
    const matchesRole = roleTokens.every((token) => haystack.includes(token));
    const matchesKeywords =
      keywordTokens.length === 0 || keywordTokens.some((token) => haystack.includes(token));
    const locationHaystack = job.location.toLowerCase();
    const matchesLocation =
      locationTokens.length === 0 ||
      locationTokens.some((token) => locationHaystack.includes(token)) ||
      locationHaystack.includes("remote") ||
      countryTokens.some((token) => locationHaystack.includes(token));

    return matchesRole && matchesKeywords && matchesLocation;
  });
}

function buildFallback(query: SearchPayload): JobResult[] {
  const searchRole = encodeURIComponent(query.role);
  const searchLocation = encodeURIComponent(query.location || query.country || "global");
  const naukriRole = (query.role || "AI").replace(/\s+/g, "-");
  const naukriLocation = (query.location || query.country || "India").replace(/\s+/g, "-");

  const deepLinks = [
    {
      source: "LinkedIn",
      url: `https://www.linkedin.com/jobs/search/?keywords=${searchRole}&location=${searchLocation}`,
    },
    {
      source: "Indeed",
      url: `https://www.indeed.com/jobs?q=${searchRole}&l=${searchLocation}`,
    },
    {
      source: "Naukri",
      url: `https://www.naukri.com/${naukriRole}-jobs-in-${naukriLocation}`,
    },
    {
      source: "Simplify",
      url: `https://simplify.jobs/search?q=${searchRole}&l=${searchLocation}`,
    },
    {
      source: "JobRight",
      url: `https://www.jobright.ai/jobs?search=${searchRole}&location=${searchLocation}`,
    },
  ];

  return deepLinks.map((link, index) => ({
    id: `fallback-${link.source}-${index}`,
    title: `${query.role} roles`,
    company: link.source,
    location: query.location || query.country || "Multiple regions",
    description:
      "Direct search link generated automatically so you can continue exploring this network with filters applied.",
    url: link.url,
    source: link.source,
    tags: ["Deep Link"],
  }));
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(value: string, length: number) {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trim()}...`;
}
