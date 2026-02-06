import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import logger from "@/lib/logger";

// API input validation constants
const MAX_SKILL_LENGTH = 50;
const MAX_SKILLS_COUNT = 20;

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

// Demo jobs for Indian market - used when external APIs are unavailable
function getDemoJobs(skills: string[]): Job[] {
  const skillsLower = skills.map(s => s.toLowerCase());
  const allDemoJobs: Job[] = [
    {
      id: "demo-1",
      title: "Senior React Developer",
      company: "Infosys",
      location: "Bangalore, Karnataka",
      description: "We are looking for a Senior React Developer to join our growing team at our Bangalore office. You will be responsible for building and maintaining web applications using React, TypeScript, and modern frontend technologies. Experience with state management, testing, and CI/CD is a plus.",
      url: "https://www.naukri.com",
      source: "JobReady India",
      salary: "₹18L - ₹28L per annum",
      jobType: "Full-time",
      postedAt: "2 days ago",
      tags: ["React", "TypeScript", "Frontend", "Bangalore"],
    },
    {
      id: "demo-2",
      title: "Full Stack JavaScript Engineer",
      company: "Flipkart",
      location: "Bangalore, Karnataka",
      description: "Join Flipkart as a Full Stack Engineer! Work with Node.js, React, and PostgreSQL to build scalable e-commerce products. We offer competitive salary, ESOPs, and excellent work-life balance at India's leading e-commerce company.",
      url: "https://www.naukri.com",
      source: "JobReady India",
      salary: "₹20L - ₹35L per annum",
      jobType: "Full-time",
      postedAt: "1 week ago",
      tags: ["JavaScript", "Node.js", "React", "E-commerce"],
    },
    {
      id: "demo-3",
      title: "Python Backend Developer",
      company: "Tata Consultancy Services",
      location: "Hyderabad, Telangana",
      description: "Looking for an experienced Python developer to work on our data processing pipelines at TCS Hyderabad. You will work with Django, FastAPI, and various AWS services. Experience with machine learning frameworks is a bonus.",
      url: "https://www.naukri.com",
      source: "JobReady India",
      salary: "₹12L - ₹22L per annum",
      jobType: "Full-time",
      postedAt: "3 days ago",
      tags: ["Python", "Django", "FastAPI", "AWS"],
    },
    {
      id: "demo-4",
      title: "DevOps Engineer",
      company: "Wipro",
      location: "Pune, Maharashtra",
      description: "We need a DevOps Engineer to manage our cloud infrastructure at Wipro Pune. Experience with AWS, Kubernetes, Terraform, and CI/CD pipelines required. Join a team that values automation and infrastructure as code.",
      url: "https://www.linkedin.com/jobs",
      source: "JobReady India",
      salary: "₹15L - ₹25L per annum",
      jobType: "Full-time",
      postedAt: "5 days ago",
      tags: ["DevOps", "AWS", "Kubernetes", "Terraform"],
    },
    {
      id: "demo-5",
      title: "Mobile Developer (React Native)",
      company: "Paytm",
      location: "Noida, Uttar Pradesh",
      description: "Build beautiful mobile applications using React Native at Paytm. We are looking for someone passionate about mobile UX and performance optimization. Knowledge of iOS and Android native development is a plus.",
      url: "https://www.naukri.com",
      source: "JobReady India",
      salary: "₹14L - ₹24L per annum",
      jobType: "Full-time",
      postedAt: "1 day ago",
      tags: ["React Native", "Mobile", "iOS", "Android"],
    },
    {
      id: "demo-6",
      title: "AI/ML Engineer",
      company: "Razorpay",
      location: "Bangalore, Karnataka",
      description: "Join our AI team at Razorpay to develop and deploy machine learning models for fraud detection and payment optimization. Experience with TensorFlow, PyTorch, and large language models preferred.",
      url: "https://www.linkedin.com/jobs",
      source: "JobReady India",
      salary: "₹25L - ₹45L per annum",
      jobType: "Full-time",
      postedAt: "4 days ago",
      tags: ["AI", "Machine Learning", "Python", "TensorFlow"],
    },
    {
      id: "demo-7",
      title: "Frontend Developer (Vue.js)",
      company: "Freshworks",
      location: "Chennai, Tamil Nadu",
      description: "We are seeking a talented Vue.js developer to join our creative team at Freshworks Chennai. You will build responsive web applications and collaborate with designers to create exceptional user experiences.",
      url: "https://www.naukri.com",
      source: "JobReady India",
      salary: "₹10L - ₹18L per annum",
      jobType: "Full-time",
      postedAt: "6 days ago",
      tags: ["Vue.js", "JavaScript", "CSS", "Frontend"],
    },
    {
      id: "demo-8",
      title: "Java Backend Developer",
      company: "HCL Technologies",
      location: "Noida, Uttar Pradesh",
      description: "Looking for an experienced Java developer to work on enterprise applications at HCL. Spring Boot, microservices architecture, and cloud deployment experience required. Competitive benefits package included.",
      url: "https://www.linkedin.com/jobs",
      source: "JobReady India",
      salary: "₹12L - ₹20L per annum",
      jobType: "Full-time",
      postedAt: "2 weeks ago",
      tags: ["Java", "Spring Boot", "Microservices", "Backend"],
    },
    {
      id: "demo-9",
      title: "Data Engineer",
      company: "Myntra",
      location: "Bangalore, Karnataka",
      description: "Design and build data pipelines at Myntra using modern tools like Apache Spark, Kafka, and Airflow. Work with petabytes of fashion e-commerce data to enable analytics and machine learning.",
      url: "https://www.naukri.com",
      source: "JobReady India",
      salary: "₹18L - ₹32L per annum",
      jobType: "Full-time",
      postedAt: "1 week ago",
      tags: ["Data Engineering", "Spark", "Kafka", "Python"],
    },
    {
      id: "demo-10",
      title: "Product Manager - Technical",
      company: "PhonePe",
      location: "Bangalore, Karnataka",
      description: "Lead product development for PhonePe's payment platform. Strong technical background required, along with experience in agile methodologies. Work closely with engineering and design teams on India's leading UPI app.",
      url: "https://www.linkedin.com/jobs",
      source: "JobReady India",
      salary: "₹30L - ₹50L per annum",
      jobType: "Full-time",
      postedAt: "3 days ago",
      tags: ["Product Management", "Technical", "Agile", "Fintech"],
    },
    {
      id: "demo-11",
      title: "Software Engineer",
      company: "Google India",
      location: "Hyderabad, Telangana",
      description: "Join Google's Hyderabad office as a Software Engineer. Work on large-scale distributed systems and cutting-edge products used by billions of users worldwide. Strong problem-solving skills required.",
      url: "https://www.linkedin.com/jobs",
      source: "JobReady India",
      salary: "₹35L - ₹60L per annum",
      jobType: "Full-time",
      postedAt: "1 day ago",
      tags: ["Software Engineering", "Distributed Systems", "C++", "Python"],
    },
    {
      id: "demo-12",
      title: "Backend Developer (Node.js)",
      company: "Swiggy",
      location: "Bangalore, Karnataka",
      description: "Build scalable backend services for India's largest food delivery platform. Experience with Node.js, MongoDB, and microservices architecture required. Work on systems handling millions of daily orders.",
      url: "https://www.naukri.com",
      source: "JobReady India",
      salary: "₹16L - ₹28L per annum",
      jobType: "Full-time",
      postedAt: "5 days ago",
      tags: ["Node.js", "MongoDB", "Microservices", "Food-tech"],
    },
    {
      id: "demo-13",
      title: "QA Engineer",
      company: "Zoho",
      location: "Chennai, Tamil Nadu",
      description: "Join Zoho's QA team to ensure quality of our enterprise software products. Experience with test automation, Selenium, and API testing required. Great opportunity to work on products used globally.",
      url: "https://www.naukri.com",
      source: "JobReady India",
      salary: "₹8L - ₹15L per annum",
      jobType: "Full-time",
      postedAt: "4 days ago",
      tags: ["QA", "Selenium", "Test Automation", "API Testing"],
    },
    {
      id: "demo-14",
      title: "Cloud Solutions Architect",
      company: "Amazon India",
      location: "Mumbai, Maharashtra",
      description: "Design and implement cloud solutions for enterprise customers as an AWS Solutions Architect. Help organizations migrate to cloud and optimize their infrastructure. AWS certification preferred.",
      url: "https://www.linkedin.com/jobs",
      source: "JobReady India",
      salary: "₹40L - ₹70L per annum",
      jobType: "Full-time",
      postedAt: "2 days ago",
      tags: ["AWS", "Cloud Architecture", "Solutions Architect", "Enterprise"],
    },
    {
      id: "demo-15",
      title: "Angular Developer",
      company: "Tech Mahindra",
      location: "Hyderabad, Telangana",
      description: "Looking for an Angular developer to work on enterprise web applications at Tech Mahindra Hyderabad. Experience with Angular 14+, TypeScript, and RxJS required. Good communication skills needed.",
      url: "https://www.naukri.com",
      source: "JobReady India",
      salary: "₹10L - ₹18L per annum",
      jobType: "Full-time",
      postedAt: "1 week ago",
      tags: ["Angular", "TypeScript", "RxJS", "Frontend"],
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
  const startTime = Date.now();
  const clientIP = getClientIP(request.headers);
  
  // Rate limiting check
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
    const { skills, experience, preferences } = body;

    // Input validation
    if (!skills || typeof skills !== "string") {
      return NextResponse.json(
        { error: "Skills are required" },
        { status: 400 }
      );
    }

    // Sanitize and validate skills input
    const skillArray = skills
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && s.length <= MAX_SKILL_LENGTH)
      .slice(0, MAX_SKILLS_COUNT);

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

    // Log successful job search
    const duration = Date.now() - startTime;
    const sources = [...new Set(uniqueJobs.map(j => j.source))];
    logger.jobSearch(skillArray, uniqueJobs.length, sources);
    logger.apiRequest("POST", "/api/jobs", duration, 200);

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
    const duration = Date.now() - startTime;
    logger.error("Job search error", { 
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration}ms`,
    });
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
