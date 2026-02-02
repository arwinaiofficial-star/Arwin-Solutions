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
  tagline?: string;
  summary?: string;
  highlights?: string[];
  metrics?: { value: string; label: string }[];
  ctaLabel?: string;
  external?: boolean;
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
    helper: "14 years of civic, education, and enterprise launches",
  },
  {
    label: "AI stack",
    value: "3 pillars",
    helper: "JobReady.ai · Maya DS · WTAI",
  },
  {
    label: "Launches",
    value: "26+",
    helper: "Multi-sector transformations",
  },
];

export const heroPlaybook = [
  {
    title: "Clarity sprints",
    copy: "Stakeholder goals → AI use cases in under 10 days.",
  },
  {
    title: "Design guardrails",
    copy: "Maya tokens keep accessibility, speed, and truth in sync.",
  },
  {
    title: "AI in production",
    copy: "Pods own copilots, telemetry, and adoption rituals post launch.",
  },
];

export const marqueeClients = [
  "Govt. of Telangana",
  "NTPC",
  "Indian Railways",
  "Kendriya Vidyalayas",
  "TTD Board",
  "Vidyabharati SVP",
  "Lion's Club",
  "Kapil Group",
];

export const ctaContent = {
  eyebrow: "Next step",
  title: "Brief us once. We’ll choreograph the pod.",
  copy:
    "Share the audience, stakes, and timeline. We’ll align JobReady.ai pilots, Maya governance, and WTAI enablement so the next launch stays focused and measurable.",
  primaryLabel: "Start a strategy call",
  primaryHref: "mailto:hello@arwinaisolutions.com",
  secondaryLabel: "Meet the team",
  secondaryHref: "/about",
};

export const pillars: Pillar[] = [
  {
    name: "WTAI",
    status: "Phase 1 - Live",
    phase: "Community",
    description:
      "AI learning platform democratizing education through structured cohorts, hands-on labs, and practitioner-led sessions.",
    url: "https://wtai.in/",
    accent: "Community & Learning",
    tagline: "Community + cohorts",
    summary: "Structured cohorts, labs, and AMAs help teams practise AI responsibly.",
    highlights: [
      "Hands-on labs for GenAI, ASR, and CV",
      "Peer accountability and office hours",
    ],
    metrics: [
      { value: "Phase 1", label: "resource hub live" },
      { value: "3", label: "program formats" },
    ],
    ctaLabel: "Enter wtai.in",
    external: true,
  },
  {
    name: "Maya Design System",
    status: "v2.0.0 - npm",
    phase: "Design System",
    description:
      "Token-driven design system ensuring consistent, accessible experiences across all Arwin AI products and client engagements.",
    url: "https://www.npmjs.com/package/@maya-design-system/design-system",
    accent: "Design Language",
    tagline: "Design governance",
    summary: "Semantic tokens and review rituals keep accessibility, speed, and honesty intact.",
    highlights: [
      "White-label tokens per client",
      "Accessibility + audit kits",
    ],
    metrics: [
      { value: "v2.0", label: "current release" },
      { value: "7+", label: "touchpoints per rollout" },
    ],
    ctaLabel: "Review Maya on npm",
    external: true,
  },
  {
    name: "JobReady.ai",
    status: "Phase 1 - In Development",
    phase: "Product",
    description:
      "AI co-pilot for career acceleration: resume intelligence, personal branding, interview prep, and automated job search.",
    url: "/jobready",
    accent: "Career Platform",
    tagline: "AI career workspace",
    summary: "Copilots for resumes, branding, and outreach unify career workflows.",
    highlights: [
      "Resume intelligence scoring",
      "Interview rehearsal + pipelines",
    ],
    metrics: [
      { value: "4", label: "copilots in prototype" },
      { value: "Phase 1", label: "orchestration builds" },
    ],
    ctaLabel: "Follow the build",
  },
];

export const focusPillars = [
  {
    title: "Career Solutions",
    content:
      "Resume optimization, employer branding, interview intelligence, and custom career accelerators for individuals and businesses.",
    tags: ["Advisory", "Enablement", "AI Tooling"],
  },
  {
    title: "JobReady.ai",
    content:
      "SaaS platform unifying job search, application tracking, and outreach automation with AI-powered intelligence.",
    tags: ["Product", "Automation", "Hiring"],
  },
  {
    title: "WTAI Community",
    content:
      "Structured cohorts, resource libraries, and practitioner sessions driving continuous AI upskilling.",
    tags: ["Community", "Learning", "Playbooks"],
  },
];

export const recentProjects: Project[] = [
  {
    name: "Bhatraju Lakshminaidu Kalyana Vedika",
    tagline: "Community Matrimony · 2025",
    description:
      "AI-powered matchmaking platform with automated verification, vernacular UX, and real-time organizer dashboards.",
    focus: ["Community Platforms", "Responsible AI"],
    outcome:
      "Live with verified onboarding, progressive profiling, and actionable weekly insights for volunteers.",
    url: "https://bhatrajulakalyanavedika.com/",
  },
  {
    name: "Vidyabharati (SVP) Group",
    tagline: "K-12 Digital Campus · 2025",
    description:
      "Unified parent portal consolidating admissions, transport, alumni, and communications across 7+ touchpoints.",
    focus: ["Education", "Design Systems"],
    outcome:
      "Single design language across all channels with 99.9% uptime on Vercel edge runtime.",
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
    "Bridge career success, lifelong learning, and community innovation through AI.",
  mission:
    "Democratize AI tools and talent intelligence to unlock potential for individuals and organizations.",
  values: [
    "AI-native delivery",
    "Design-first systems",
    "Outcome-driven partnerships",
    "Responsible AI",
    "Continuous innovation",
  ],
};

export const teamMembers: TeamMember[] = [
  {
    name: "Arwin Bonthala",
    role: "Founder & CEO",
    bio: "14+ years leading digital transformation across government, education, and enterprise sectors.",
    linkedin: "https://linkedin.com/in/arwinbonthala",
  },
  {
    name: "Maya Design Team",
    role: "Design System Engineers",
    bio: "Building token-driven design systems that power consistent, accessible experiences.",
  },
  {
    name: "AI Solutions Team",
    role: "Product & Strategy",
    bio: "Delivering AI-powered career solutions and community platforms.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: "Maya Design System unified 40+ campuses with one visual language. Faster shipping, smoother audits.",
    author: "Director of IT",
    company: "Kendriya Vidyalaya",
    role: "Government Education",
  },
  {
    quote: "JobReady.ai prototypes demonstrated how AI can enhance our hiring workflow seamlessly.",
    author: "HR Director",
    company: "Tech Startup",
    role: "Enterprise Client",
  },
  {
    quote: "Their AI-first approach modernized our community portal while preserving our program's authentic warmth.",
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
    detail: "Custom software studio delivering portals for schools and civic institutions.",
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
    label: "National Scale Rollouts",
    detail: "Delivered digital services for Kendriya Vidyalayas, NTPC, TTD Board, and state departments.",
    milestone: true,
  },
  {
    year: "2021",
    label: "Maya Design System Initiated",
    detail: "Began development of internal design system for consistent UI/UX.",
    milestone: false,
  },
  {
    year: "2024",
    label: "Maya Design System v2.0",
    detail: "Design system matured and rolled out across education and government engagements.",
    milestone: true,
  },
  {
    year: "2025",
    label: "Rebrand to Arwin AI Solutions",
    detail: "AI-first positioning with WTAI community, JobReady.ai, and new AI-powered services.",
    milestone: true,
  },
  {
    year: "2025",
    label: "Post-Rebrand Launches",
    detail: "Bhatraju Kalyana Vedika and Vidyabharati Group platforms showcasing AI capabilities.",
    milestone: false,
  },
  {
    year: "2026",
    label: "AI Ecosystem Operations",
    detail: "WTAI phase 1 live, JobReady.ai prototypes, continued delivery on Maya 2.0.",
    milestone: true,
  },
];

export const capabilityTracks = [
  {
    title: "Experience Strategy",
    bullets: [
      "Executive workshops mapping KPIs to AI-ready journeys",
      "Maya token-based service blueprints keeping design and engineering aligned",
      "Accessibility, vernacular, and governance checkpoints pre-build",
    ],
  },
  {
    title: "Applied AI Delivery",
    bullets: [
      "Use-case validation sprints with shared success criteria",
      "GenAI, ASR, and CV sandboxes before procurement",
      "Responsible AI and MLOps guardrails in every sprint",
    ],
  },
  {
    title: "Sustained Operations",
    bullets: [
      "Community launch kits for long-term adoption",
      "Edge runtime reliability and telemetry built-in",
      "Feedback loops ensuring measurable personalization",
    ],
  },
];
