import { NextRequest, NextResponse } from "next/server";

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

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

// Demo jobs for when external APIs are unavailable
function getDemoJobs(skills: string[]): Job[] {
  const skillsLower = skills.map(s => s.toLowerCase());
  const allDemoJobs: Job[] = [
    {
      id: "demo-1",
      title: "Senior React Developer",
      company: "TechCorp Inc",
      location: "Remote",
      description: "We are looking for a Senior React Developer to join our growing team. You will be responsible for building and maintaining web applications using React, TypeScript, and modern frontend technologies. Experience with state management, testing, and CI/CD is a plus.",
      url: "https://remotive.com",
      source: "JobReady Demo",
      salary: "$120k - $150k",
      jobType: "Full-time",
      postedAt: "2 days ago",
      tags: ["React", "TypeScript", "Frontend", "Remote"],
    },
    {
      id: "demo-2",
      title: "Full Stack JavaScript Engineer",
      company: "StartupX",
      location: "Remote (US/EU)",
      description: "Join our innovative startup as a Full Stack Engineer! Work with Node.js, React, and PostgreSQL to build scalable SaaS products. We offer competitive salary, equity, and a collaborative remote-first culture.",
      url: "https://arbeitnow.com",
      source: "JobReady Demo",
      salary: "$100k - $130k",
      jobType: "Full-time",
      postedAt: "1 week ago",
      tags: ["JavaScript", "Node.js", "React", "PostgreSQL"],
    },
    {
      id: "demo-3",
      title: "Python Backend Developer",
      company: "DataFlow Systems",
      location: "Remote",
      description: "Looking for an experienced Python developer to work on our data processing pipelines. You will work with Django, FastAPI, and various AWS services. Experience with machine learning frameworks is a bonus.",
      url: "https://remotive.com",
      source: "JobReady Demo",
      salary: "$110k - $140k",
      jobType: "Full-time",
      postedAt: "3 days ago",
      tags: ["Python", "Django", "FastAPI", "AWS"],
    },
    {
      id: "demo-4",
      title: "DevOps Engineer",
      company: "CloudNine Technologies",
      location: "Remote (Worldwide)",
      description: "We need a DevOps Engineer to manage our cloud infrastructure. Experience with AWS, Kubernetes, Terraform, and CI/CD pipelines required. Join a team that values automation and infrastructure as code.",
      url: "https://arbeitnow.com",
      source: "JobReady Demo",
      salary: "$130k - $160k",
      jobType: "Full-time",
      postedAt: "5 days ago",
      tags: ["DevOps", "AWS", "Kubernetes", "Terraform"],
    },
    {
      id: "demo-5",
      title: "Mobile Developer (React Native)",
      company: "AppVenture Labs",
      location: "Remote",
      description: "Build beautiful mobile applications using React Native. We are looking for someone passionate about mobile UX and performance optimization. Knowledge of iOS and Android native development is a plus.",
      url: "https://remotive.com",
      source: "JobReady Demo",
      salary: "$95k - $125k",
      jobType: "Full-time",
      postedAt: "1 day ago",
      tags: ["React Native", "Mobile", "iOS", "Android"],
    },
    {
      id: "demo-6",
      title: "AI/ML Engineer",
      company: "IntelliTech AI",
      location: "Remote (US preferred)",
      description: "Join our AI team to develop and deploy machine learning models. Experience with TensorFlow, PyTorch, and large language models preferred. Work on cutting-edge AI products that impact millions of users.",
      url: "https://arbeitnow.com",
      source: "JobReady Demo",
      salary: "$150k - $200k",
      jobType: "Full-time",
      postedAt: "4 days ago",
      tags: ["AI", "Machine Learning", "Python", "TensorFlow"],
    },
    {
      id: "demo-7",
      title: "Frontend Developer (Vue.js)",
      company: "WebCraft Studios",
      location: "Remote (EU)",
      description: "We are seeking a talented Vue.js developer to join our creative team. You will build responsive web applications and collaborate with designers to create exceptional user experiences.",
      url: "https://remotive.com",
      source: "JobReady Demo",
      salary: "$80k - $110k",
      jobType: "Full-time",
      postedAt: "6 days ago",
      tags: ["Vue.js", "JavaScript", "CSS", "Frontend"],
    },
    {
      id: "demo-8",
      title: "Java Backend Developer",
      company: "Enterprise Solutions Ltd",
      location: "Remote",
      description: "Looking for an experienced Java developer to work on enterprise applications. Spring Boot, microservices architecture, and cloud deployment experience required. Competitive benefits package included.",
      url: "https://arbeitnow.com",
      source: "JobReady Demo",
      salary: "$105k - $135k",
      jobType: "Full-time",
      postedAt: "2 weeks ago",
      tags: ["Java", "Spring Boot", "Microservices", "Backend"],
    },
    {
      id: "demo-9",
      title: "Data Engineer",
      company: "BigData Corp",
      location: "Remote (Worldwide)",
      description: "Design and build data pipelines using modern tools like Apache Spark, Kafka, and Airflow. Work with petabytes of data to enable analytics and machine learning across the organization.",
      url: "https://remotive.com",
      source: "JobReady Demo",
      salary: "$125k - $155k",
      jobType: "Full-time",
      postedAt: "1 week ago",
      tags: ["Data Engineering", "Spark", "Kafka", "Python"],
    },
    {
      id: "demo-10",
      title: "Product Manager - Technical",
      company: "InnovateTech",
      location: "Remote",
      description: "Lead product development for our developer tools platform. Strong technical background required, along with experience in agile methodologies. Work closely with engineering and design teams.",
      url: "https://arbeitnow.com",
      source: "JobReady Demo",
      salary: "$140k - $175k",
      jobType: "Full-time",
      postedAt: "3 days ago",
      tags: ["Product Management", "Technical", "Agile", "SaaS"],
    },
  ];

  // Filter and score demo jobs based on skills
  return allDemoJobs.filter(job => {
    const jobText = `${job.title} ${job.description} ${job.tags?.join(" ") || ""}`.toLowerCase();
    return skillsLower.some(skill => jobText.includes(skill));
  });
}

async function fetchRemotiveJobs(skills: string[]): Promise<Job[]> {
  try {
    // Use first 3 skills for search to avoid overly specific queries that return few results
    const searchTerm = skills.slice(0, 3).join(",").toLowerCase();
    const controller = new AbortController();
    // 10 second timeout to prevent hanging requests
    const API_TIMEOUT_MS = 10000;
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    
    const response = await fetch(
      `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchTerm)}&limit=10`,
      {
        headers: { Accept: "application/json" },
        signal: controller.signal,
        next: { revalidate: 300 },
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Remotive API error:", response.status);
      return [];
    }

    const data = await response.json();
    const jobs: RemotiveJob[] = data.jobs || [];

    return jobs.map((job) => ({
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      description: stripHtml(job.description).slice(0, 300) + "...",
      url: job.url,
      source: "Remotive",
      salary: job.salary || undefined,
      jobType: job.job_type,
      postedAt: formatDate(job.publication_date),
      tags: job.tags?.slice(0, 5) || [],
    }));
  } catch (error) {
    console.error("Error fetching Remotive jobs:", error);
    return [];
  }
}

async function fetchArbeitnowJobs(skills: string[]): Promise<Job[]> {
  try {
    const searchTerm = skills[0]?.toLowerCase() || "developer";
    const controller = new AbortController();
    // 10 second timeout to prevent hanging requests
    const API_TIMEOUT_MS = 10000;
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    
    const response = await fetch(
      `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(searchTerm)}`,
      {
        headers: { Accept: "application/json" },
        signal: controller.signal,
        next: { revalidate: 300 },
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Arbeitnow API error:", response.status);
      return [];
    }

    const data = await response.json();
    const jobs: ArbeitnowJob[] = data.data || [];

    return jobs.slice(0, 10).map((job) => ({
      id: `arbeitnow-${job.slug}`,
      title: job.title,
      company: job.company_name,
      location: job.remote ? "Remote" : job.location || "Not specified",
      description: stripHtml(job.description).slice(0, 300) + "...",
      url: job.url,
      source: "Arbeitnow",
      jobType: job.job_types?.[0] || undefined,
      tags: job.tags?.slice(0, 5) || [],
    }));
  } catch (error) {
    console.error("Error fetching Arbeitnow jobs:", error);
    return [];
  }
}

function stripHtml(html: string): string {
  // First remove HTML tags and replace with spaces
  let text = html.replace(/<[^>]*>/g, " ");
  
  // Then decode HTML entities (order matters to prevent double-unescaping)
  // Replace named entities with their literal values
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&"); // Must be last to prevent double-unescaping
  
  // Normalize whitespace
  return text.replace(/\s+/g, " ").trim();
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function scoreJob(job: Job, skills: string[], preferences: string): number {
  let score = 0;
  const jobText = `${job.title} ${job.description} ${job.tags?.join(" ") || ""}`.toLowerCase();
  const prefLower = preferences.toLowerCase();

  // Score based on skill matches
  for (const skill of skills) {
    const skillLower = skill.toLowerCase().trim();
    if (jobText.includes(skillLower)) {
      score += 10;
    }
  }

  // Score based on preferences - filter out short words (<=3 chars) like "a", "the", "for"
  // to focus on meaningful preference keywords
  const MIN_WORD_LENGTH = 3;
  const prefWords = prefLower.split(/\s+/).filter((w) => w.length > MIN_WORD_LENGTH);
  for (const word of prefWords) {
    if (jobText.includes(word)) {
      score += 5;
    }
  }

  // Bonus for remote if mentioned in preferences
  if (
    prefLower.includes("remote") &&
    job.location.toLowerCase().includes("remote")
  ) {
    score += 15;
  }

  return score;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skills, experience, preferences } = body;

    if (!skills || typeof skills !== "string") {
      return NextResponse.json(
        { error: "Skills are required" },
        { status: 400 }
      );
    }

    const skillArray = skills
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    if (skillArray.length === 0) {
      return NextResponse.json(
        { error: "At least one skill is required" },
        { status: 400 }
      );
    }

    // Fetch jobs from multiple sources concurrently
    const [remotiveJobs, arbeitnowJobs] = await Promise.all([
      fetchRemotiveJobs(skillArray),
      fetchArbeitnowJobs(skillArray),
    ]);

    // Combine jobs from external APIs
    let allJobs = [...remotiveJobs, ...arbeitnowJobs];
    
    // If no external jobs found, use demo jobs to demonstrate functionality
    if (allJobs.length === 0) {
      const demoJobs = getDemoJobs(skillArray);
      allJobs = demoJobs;
    }

    // Score and sort jobs based on relevance
    const scoredJobs = allJobs.map((job) => ({
      ...job,
      relevanceScore: scoreJob(job, skillArray, preferences || ""),
    }));

    scoredJobs.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Remove duplicates by title and company
    const uniqueJobs = scoredJobs.reduce(
      (acc, job) => {
        const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
        if (!acc.seen.has(key)) {
          acc.seen.add(key);
          acc.jobs.push(job);
        }
        return acc;
      },
      { seen: new Set<string>(), jobs: [] as typeof scoredJobs }
    ).jobs;

    return NextResponse.json({
      success: true,
      totalJobs: uniqueJobs.length,
      jobs: uniqueJobs.slice(0, 20),
      searchCriteria: {
        skills: skillArray,
        experience: experience || "Not specified",
        preferences: preferences || "Not specified",
      },
    });
  } catch (error) {
    console.error("Job search error:", error);
    return NextResponse.json(
      { error: "Failed to search for jobs. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "JobReady.ai API - Use POST to search for jobs",
    version: "1.0.0",
    endpoints: {
      search: {
        method: "POST",
        body: {
          skills: "string (comma-separated, required)",
          experience: "number (optional)",
          preferences: "string (optional)",
        },
      },
    },
  });
}
