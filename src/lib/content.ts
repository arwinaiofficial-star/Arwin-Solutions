export type HeroStat = {
  label: string;
  value: string;
  helper?: string;
  icon?: string;
};

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  image?: string;
  linkedin?: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  company: string;
  role: string;
  logo?: string;
};

export type Pillar = {
  name: string;
  description: string;
  status: string;
  phase: string;
  url: string;
  accent: string;
};

export type Project = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  focus: string[];
  outcome: string;
};

export type LegacyGroup = {
  title: string;
  items: string[];
};

export const heroStats: HeroStat[] = [
  {
    label: "Founded",
    value: "2011",
    helper: "14+ years of delivery, now evolved as Arwin AI Solutions",
    icon: "📅",
  },
  {
    label: "AI Initiatives",
    value: "3 pillars",
    helper: "WTAI - Maya Design System - JobReady.ai",
    icon: "🤖",
  },
  {
    label: "Launch Velocity",
    value: "26+",
    helper: "Government, education & enterprise launches pre-rebrand",
    icon: "🚀",
  },
  {
    label: "Clients Served",
    value: "100+",
    helper: "Across government, education, and enterprise sectors",
    icon: "👥",
  },
];

export const pillars: Pillar[] = [
  {
    name: "WTAI",
    status: "Phase 1 - Live",
    phase: "Community",
    description:
      "WhatTheAI (WTAI) is our comprehensive AI learning and resource platform built to democratize AI education, labs, and peer collaboration.",
    url: "https://wtai.in/",
    accent: "Community & Learning",
  },
  {
    name: "Maya Design System",
    status: "v2.0.0 - npm",
    phase: "In-house Design System",
    description:
      "A modular, token-driven, CSS-first system powering every Arwin AI experience with semantic tokens, ready-to-use components, and theme controls.",
    url: "https://www.npmjs.com/package/@maya-design-system/design-system",
    accent: "Design Language",
  },
  {
    name: "JobReady.ai",
    status: "Ideation - Phase 1",
    phase: "Product",
    description:
      "End-to-end AI co-pilot for job seekers: resume intelligence, personal branding, interview coaching, and live job search automation.",
    url: "/jobready",
    accent: "Career Platform",
  },
];

export const focusPillars = [
  {
    title: "AI-Powered Career Solutions",
    content:
      "Services for individuals and businesses spanning resume optimization, employer branding, interview intelligence, and custom career accelerators.",
    tags: ["Advisory", "Enablement", "AI Tooling"],
  },
  {
    title: "JobReady.ai Product",
    content:
      "A SaaS layer that unifies orchestration of applications, tracking, and tailored outreach. Phase 1 prioritizes job intelligence search and guided workflows.",
    tags: ["Product", "Automation", "Hiring"],
  },
  {
    title: "WTAI Community",
    content:
      "Global hub for AI learning with structured cohorts, resource libraries, and practitioner AMAs powering continuous upskilling.",
    tags: ["Community", "Learning", "Playbooks"],
  },
];

export const recentProjects: Project[] = [
  {
    name: "Bhatraju Lakshminaidu Kalyana Vedika",
    tagline: "Community Matrimony - 2025",
    description:
      "Modernized matchmaking for the Telangana Bhatraju community with AI-aided profiles, trust workflows, and vernacular UX.",
    focus: ["Community Platforms", "Responsible AI"],
    outcome:
      "Phase 1 launched with verified onboarding, progressive profiling, and analytics dashboards for organizers.",
    url: "https://bhatrajulakalyanavedika.com/",
  },
  {
    name: "Vidyabharati (SVP) Group",
    tagline: "K-12 Digital Campus - 2025",
    description:
      "Built a future-ready school experience covering admissions, announcements, transport, and alumni engagement with Maya tokens for brand fidelity.",
    focus: ["Education", "Design Systems"],
    outcome:
      "Unified 7+ touchpoints into a single parent-first portal with 99.9% uptime on Vercel edge runtime.",
    url: "https://vidyabharatisvp.com/",
  },
];

export const legacyGroups: LegacyGroup[] = [
  {
    title: "Government & Civic",
    items: [
      "Govt. of Telangana & Andhra Pradesh",
      "NTPC",
      "Indian Railways",
      "DRDA",
      "NIC (National Informatics Centre)",
      "Travancore Devaswom Board",
      "Tirumala Tirupati Devasthanam Board",
      "Keesara Devasthanam",
      "Cheeryal Laxminarsimha Swamy Devasthanam",
    ],
  },
  {
    title: "Education & Philanthropy",
    items: [
      "Kendriya Vidyalayas",
      "Jeeyar Educational Trust",
      "CBIT",
      "Geetanjali Group of Institutions",
      "St. Ann's Schools",
      "St. John's Institutions",
      "Carmel Convents",
      "Nirmala Convents",
      "Telangana Bhatraju Community",
      "Akshara Group",
      "Aditya Ayur Gram, Chapadu, Cuddapah",
    ],
  },
  {
    title: "Enterprise & Social Impact",
    items: [
      "Lion's Club",
      "Kapil Group",
      "Telugu Film Chambers of Commerce",
      "Soorya Hospitals",
      "Amrutha IVF Centers",
      "Adarsha Motors",
      "Maya Design System (in-house)",
      "JobReady.ai (phase 1)",
    ],
  },
];

export const executiveSummary = {
  vision:
    "Become the leading AI-driven ecosystem that bridges career success, lifelong learning, and community-powered innovation.",
  mission:
    "Democratize access to AI tools, playbooks, and talent intelligence so individuals and organizations unlock their full potential.",
  values: [
    "AI touch in every engagement",
    "Modular design-first delivery",
    "Outcome-oriented partnerships",
    "Responsible AI practices",
    "Continuous innovation",
  ],
};

export const teamMembers: TeamMember[] = [
  {
    name: "Arwin Bonthala",
    role: "Founder & CEO",
    bio: "Visionary leader with 14+ years in digital transformation, specializing in AI-powered solutions for government and education sectors.",
    linkedin: "https://linkedin.com/in/arwinbonthala",
  },
  {
    name: "Maya Design Team",
    role: "Design System Engineers",
    bio: "Expert team building modular, token-driven design systems that power all Arwin AI experiences.",
  },
  {
    name: "AI Solutions Team",
    role: "Product & Strategy",
    bio: "Cross-functional team delivering AI-powered career solutions and community platforms.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: "Arwin AI Solutions transformed our digital infrastructure with their Maya Design System. The consistency and scalability have been game-changing.",
    author: "Director of IT",
    company: "Kendriya Vidyalaya",
    role: "Government Education",
  },
  {
    quote: "The JobReady.ai prototype delivered exactly what we needed - intelligent job matching with seamless user experience.",
    author: "HR Director",
    company: "Tech Startup",
    role: "Enterprise Client",
  },
  {
    quote: "Working with Arwin AI on our community platform was exceptional. Their AI-first approach brought modern capabilities to our traditional organization.",
    author: "Community Leader",
    company: "Bhatraju Community",
    role: "Social Impact",
  },
];

export const sectors = [
  {
    id: "government",
    title: "Government & Civic",
    description: "Digital transformation for public sector organizations",
    count: 9,
    projects: [
      "Govt. of Telangana & Andhra Pradesh",
      "NTPC",
      "Indian Railways",
      "DRDA",
      "NIC (National Informatics Centre)",
      "Travancore Devaswom Board",
      "Tirumala Tirupati Devasthanam Board",
      "Keesara Devasthanam",
      "Cheeryal Laxminarsimha Swamy Devasthanam",
    ],
  },
  {
    id: "education",
    title: "Education & Academia",
    description: "Modern learning platforms and institutional websites",
    count: 11,
    projects: [
      "Kendriya Vidyalayas",
      "Jeeyar Educational Trust",
      "CBIT",
      "Geetanjali Group of Institutions",
      "St. Ann's Schools",
      "St. John's Institutions",
      "Carmel Convents",
      "Nirmala Convents",
      "Telangana Bhatraju Community",
      "Akshara Group",
      "Aditya Ayur Gram, Chapadu, Cuddapah",
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise & Social Impact",
    description: "Business solutions and community platforms",
    count: 6,
    projects: [
      "Lion's Club",
      "Kapil Group",
      "Telugu Film Chambers of Commerce",
      "Soorya Hospitals",
      "Amrutha IVF Centers",
      "Adarsha Motors",
    ],
  },
];

export const timeline = [
  {
    year: "2011",
    label: "Arwin Solutions founded",
    detail: "Launched as a custom software studio delivering portals for schools and civic institutions.",
    milestone: true,
  },
  {
    year: "2013",
    label: "First Government Contracts",
    detail: "Secured contracts with Kendriya Vidyalayas and state education departments.",
    milestone: false,
  },
  {
    year: "2015-2020",
    label: "National scale rollouts",
    detail: "Delivered digital services for Kendriya Vidyalayas, NTPC, TTD Board, and multiple state departments.",
    milestone: true,
  },
  {
    year: "2021",
    label: "Design System Initiated",
    detail: "Began development of internal Maya Design System for consistent UI/UX across projects.",
    milestone: false,
  },
  {
    year: "2024",
    label: "Maya Design System v2.0",
    detail: "Internal design system matured to v2.0.0 and rolled out across education & government engagements.",
    milestone: true,
  },
  {
    year: "2025",
    label: "Rebrand -> Arwin AI Solutions",
    detail: "Introduced AI-first positioning with WTAI community, JobReady.ai ideation, and new AI-powered services.",
    milestone: true,
  },
  {
    year: "2025",
    label: "Post-Rebrand Success",
    detail: "Launched Bhatraju Kalyana Vedika and Vidyabharati Group platforms showcasing new AI capabilities.",
    milestone: false,
  },
  {
    year: "2026",
    label: "AI Ecosystem Ops",
    detail: "WTAI phase 1 live, JobReady.ai orchestration prototypes, and continued shipping on Maya 2.0 tokens.",
    milestone: true,
  },
];

export const capabilityTracks = [
  {
    title: "Experience Strategy",
    bullets: [
      "Executive workshops to define AI-assisted journeys",
      "Service blueprints aligned to Maya tokens",
      "Accessibility & multilingual guardrails baked-in",
    ],
  },
  {
    title: "Applied AI Delivery",
    bullets: [
      "Use-case mining sprints",
      "Evaluation sandboxes for GenAI, ASR, and computer vision stacks",
      "Responsible AI assessments & MLOps automation",
    ],
  },
  {
    title: "Sustained Operations",
    bullets: [
      "Playbooks for community & academy launches",
      "Site reliability on Vercel edge runtime",
      "Data observability & feedback loops for personalization",
    ],
  },
];
