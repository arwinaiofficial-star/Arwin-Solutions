/**
 * Central content repository for Arwin Group
 * All copy, stats, and data live here for easy maintenance
 *
 * Structure:
 *   Solutions — Arwin Forge | FinLens | WTAI
 *   Products  — JobReady | Maya Design System
 */

// ===== COMPANY INFO =====
export const companyInfo = {
  name: "Arwin Group",
  founded: 2011,
  tagline: "Technology & Intelligence Partner",
  address:
    "258D, Prajay Sai Gardens Rd, Kundanpally, Cheeriyal, Hyderabad, Telangana 501301",
  city: "Hyderabad",
  phone: "094909 37683",
  email: {
    official: "hr@arwinai.com",
    hr: "hr@arwinai.com",
  },
  founders: {
    founder: "Narender Raju Chakrahari",
    ceo: "Aravind Chakrahari",
    coo: "Chaithanya Bonthala",
  },
};

// ===== HOME PAGE CONTENT =====
export const homeContent = {
  hero: {
    badge: "15+ Years of Digital Excellence",
    title: "Building India\u2019s Digital Future",
    subtitle:
      "From government institutions to ambitious startups \u2014 we craft digital solutions, build intelligent products, and empower individuals through technology. 15 years of trust. One ecosystem.",
    stats: [
      {
        value: "15+",
        label: "Years of Trust",
        detail: "Since 2011",
      },
      {
        value: "26+",
        label: "Projects Delivered",
        detail: "Government, Education, Enterprise",
      },
      {
        value: "3",
        label: "Solutions",
        detail: "Forge \u00b7 FinLens \u00b7 WTAI",
      },
      {
        value: "2",
        label: "Products",
        detail: "JobReady \u00b7 Maya",
      },
    ],
  },

  // Solutions \u2014 What we offer
  solutions: [
    {
      name: "Arwin Forge",
      tagline: "AI-Powered Digital Solutions",
      description:
        "We take your business challenges and forge them into powerful digital solutions. From web platforms to AI integrations \u2014 crafted with 15 years of proven expertise.",
      url: "/work",
      external: false,
      features: [
        "Web & mobile applications",
        "AI-powered integrations",
        "CMS & e-commerce platforms",
        "Enterprise digital transformation",
      ],
    },
    {
      name: "FinLens",
      tagline: "See Your Finances Clearly",
      description:
        "Free financial tools, calculators, and expert-led guides to help you make smarter money decisions. No jargon. No paywalls. Just clarity.",
      url: "/finlens",
      external: false,
      features: [
        "SIP & Step-up SIP calculators",
        "Home loan EMI calculator",
        "Financial guides & tips",
        "Expert-led content by Sai Vinil",
      ],
    },
    {
      name: "WTAI",
      tagline: "AI Community Platform",
      description:
        "What The AI \u2014 a community-driven platform for learning, exploring, and implementing AI. Education resources, practical guides, and real-world applications.",
      url: "https://wtai.in/",
      external: true,
      features: [
        "AI education resources",
        "Practical implementation guides",
        "Community-driven learning",
        "Real-world AI applications",
      ],
    },
  ],

  // Products \u2014 What we build
  products: [
    {
      name: "JobReady",
      tagline: "AI-Powered Career Platform",
      description:
        "One-stop platform for job seekers in India. AI agents build your CV, match you with top companies, and auto-apply \u2014 so you focus on preparing, not searching.",
      url: "/jobready",
      external: false,
      status: "Phase 1 & 2 Live",
    },
    {
      name: "Maya Design System",
      tagline: "Flexible Design System",
      description:
        "A modular, token-driven design system powering UX across all our client and in-house products. CSS-first, built for scale.",
      url: "https://wtai.in/design-system/",
      external: true,
      status: "v2.0.0 Released",
    },
  ],

  philosophy: {
    title: "Goodwill First",
    description:
      "For most of our work, it\u2019s about goodwill \u2014 not just money. We help small-scale to large-scale businesses establish their digital footprint, reaching more people and making real impact. That\u2019s how we\u2019ve earned trust from government institutions, educational organizations, and enterprises across India for over 15 years.",
  },

  cta: {
    title: "Ready to Build Something That Matters?",
    description:
      "Whether you need a digital platform for your business, want to explore AI solutions, or have an idea that needs the right team \u2014 let\u2019s talk.",
  },
};

// ===== ABOUT PAGE CONTENT =====
export const aboutContent = {
  story: {
    title: "Our Story",
    content: [
      "Arwin Solutions was established in 2011 with a clear mission: solve real-life problems through digital transformation. For over a decade, we worked with government institutions like Indian Railways, NTPC, and Kendriya Vidyalayas \u2014 building robust platforms that serve millions.",
      "In 2024, we evolved. Rebranding as Arwin Group, we expanded from pure digital services into an ecosystem \u2014 launching AI-powered products, a design system, a community platform, and now financial education tools. The philosophy hasn\u2019t changed: goodwill first, excellence always.",
      "Today, Arwin operates across two dimensions: Solutions (Arwin Forge, FinLens, WTAI) and Products (JobReady, Maya Design System) \u2014 each designed to solve a specific, meaningful problem.",
    ],
  },

  mission:
    "To empower businesses, professionals, and individuals through an integrated ecosystem of digital solutions, intelligent products, and financial clarity \u2014 built on 15+ years of proven trust and real-world impact.",

  vision:
    "To be India\u2019s most trusted technology and intelligence partner \u2014 transforming how organizations grow, professionals build careers, and people achieve financial well-being.",

  values: [
    "Goodwill First \u2014 Money is a by-product of value created",
    "Real Impact \u2014 Solving genuine problems, not creating unnecessary complexity",
    "Craftsmanship \u2014 Every project, big or small, is forged with excellence",
    "Trust \u2014 15+ years of government, education, and enterprise partnerships",
    "Long-Term Thinking \u2014 Relationships over transactions, always",
  ],

  team: [
    {
      name: "Narender Raju Chakrahari",
      role: "Founder",
      bio: "Visionary leader who established Arwin Solutions in 2011 with a mission to solve real-world problems through technology.",
    },
    {
      name: "Aravind Chakrahari",
      role: "CEO",
      bio: "Driving strategic direction and the AI transformation \u2014 leading Arwin Group into the future of intelligent technology.",
    },
    {
      name: "Chaithanya Bonthala",
      role: "COO",
      bio: "Ensuring operational excellence and the delivery of high-quality solutions across all projects and products.",
    },
    {
      name: "Krishna Chaitanya",
      role: "Managing Director",
      bio: "Overseeing business operations and driving strategic growth initiatives across the organization.",
    },
    {
      name: "Sai Vinil",
      role: "Financial Expert \u2014 FinLens",
      bio: "Leading Arwin\u2019s financial education initiative, bringing expert-level financial knowledge to make personal finance accessible for everyone.",
    },
  ],
};

// ===== WORK/PROJECTS CONTENT =====
export const recentProjects = [
  {
    name: "Bhatrajula Kalyana Vedika",
    category: "Community Matrimony Platform",
    url: "https://bhatrajulakalyanavedika.com/",
    description:
      "Created a comprehensive matrimony platform from scratch for the Bhatraju community, boosting registrations and providing an easy-to-use matchmaking process with strong foundation for data communication.",
    year: 2025,
    features: [
      "Complete registration system",
      "Advanced matchmaking algorithm",
      "Profile management",
      "Communication tools",
      "Community-focused features",
    ],
    technologies: ["Maya Design System", "Next.js", "AI-Enhanced UX"],
    outcome:
      "Significantly increased community registrations and simplified the matchmaking process",
  },
  {
    name: "Vidya Bharati Vignana Kendra",
    category: "Educational Institution",
    url: "https://vidyabharatisvp.com/",
    description:
      "Complete website rebrand with new design language and in-house CMS panel for content management, resulting in boosted admissions and improved user experience.",
    year: 2025,
    features: [
      "Modern design language",
      "Custom CMS panel",
      "Content management system",
      "Admissions portal",
      "Parent communication",
    ],
    technologies: ["Maya Design System", "Custom CMS", "Next.js"],
    outcome:
      "Boosted admissions through improved branding and streamlined content management",
  },
];

export const legacyProjects = {
  government: {
    title: "Government & Public Sector",
    count: 9,
    projects: [
      {
        name: "Kendriya Vidyalayas",
        description:
          "Developed robust, scalable educational portals for India\u2019s largest chain of government schools, supporting their mission for quality and uniform education across the country.",
      },
      {
        name: "Govt of Telangana & Andhra Pradesh",
        description:
          "Engineered digital solutions for major state departments, streamlining citizen services and showcasing government initiatives efficiently and securely.",
      },
      {
        name: "NTPC",
        description:
          "Crafted dynamic websites for NTPC, India\u2019s premier power company, enabling public access to information, project updates, and sustainability reports.",
      },
      {
        name: "Tirumala Tirupati Devasthanam Board",
        description:
          "Engineered high-traffic, feature-rich portals handling pilgrim services, bookings, and temple information for one of the world\u2019s most visited religious sites.",
      },
      {
        name: "Indian Railways",
        description:
          "Contributed to public-facing modules enhancing information dissemination and digital access for one of India\u2019s largest employers.",
      },
      {
        name: "NIC, National Informatics Centre",
        description:
          "Designed secure, standards-compliant government portals collaborating with India\u2019s premier digital ICT solutions provider.",
      },
      {
        name: "DRDA",
        description:
          "Designed result-oriented platforms for government rural development organizations, driving project visibility and public participation.",
      },
      {
        name: "Travancore Devaswom Board",
        description:
          "Developed informative websites to improve transparency and service delivery for this prestigious temple board managing major heritage temples.",
      },
      {
        name: "Telugu Film Chambers Of Commerce",
        description:
          "Created professional portals to facilitate communication and digital processes among film industry stakeholders.",
      },
    ],
  },

  education: {
    title: "Education & Institutions",
    count: 11,
    projects: [
      {
        name: "CBIT (Chaitanya Bharathi Institute of Technology)",
        description:
          "Built interactive, user-centric academic websites that boost institutional outreach and streamline student-faculty engagement.",
      },
      {
        name: "Geetanjali Group Of Institutions",
        description:
          "Implemented integrated digital solutions for education institutions, enabling admissions, resource access, and activity management online.",
      },
      {
        name: "St. Ann\u2019s Schools",
        description:
          "Engineered modern school portals for information sharing, admissions, and parent interaction.",
      },
      {
        name: "St. John\u2019s Institutions",
        description:
          "Created comprehensive websites for multisectoral educational campuses, focused on ease-of-use and rich content integration.",
      },
      {
        name: "Carmel Convents",
        description:
          "Provided dynamic, community-driven digital platforms for convent schools to showcase achievements and streamline communication.",
      },
      {
        name: "Nirmala Convents",
        description:
          "Built engaging class-to-community online platforms for convent schools, integrating secure content and announcements.",
      },
      {
        name: "Jeeyar Educational Trust",
        description:
          "Designed comprehensive educational sites to enhance visibility, event registrations, and contribution tracking for this philanthropic educational trust.",
      },
      {
        name: "Akshara Group",
        description:
          "Built robust websites for educational groups, focusing on admissions, courses, and academic highlights.",
      },
      {
        name: "Lion\u2019s Club",
        description:
          "Built engaging and community-driven platforms to amplify social outreach and charitable projects for this international service organization.",
      },
      {
        name: "Telangana Bhatraju Community",
        description:
          "Launched community-specific networking portals promoting social and cultural programs digitally.",
      },
      {
        name: "Cheeryal Laxminarsimha Swamy Devasthanam",
        description:
          "Digitally enabled temple management with informative and booking-friendly portals supporting traditions and pilgrim needs.",
      },
    ],
  },

  enterprise: {
    title: "Enterprise & Healthcare",
    count: 6,
    projects: [
      {
        name: "Kapil Group",
        description:
          "Implemented interactive web solutions for a leading conglomerate, highlighting their multifaceted business profile and facilitating seamless communication.",
      },
      {
        name: "Adarsha Motors",
        description:
          "Developed responsive business websites for automotive dealerships, streamlining lead generation and customer support.",
      },
      {
        name: "Soorya Hospitals",
        description:
          "Delivered robust, patient-friendly hospital websites enabling appointment scheduling, service enquiry, and resource information.",
      },
      {
        name: "Amrutha IVF Centers",
        description:
          "Created tailored medical web platforms for IVF and healthcare institutions to drive awareness, appointment, and education efforts.",
      },
      {
        name: "Aditya Ayur Gram, Chapadu, Cuddapah",
        description:
          "Crafted wellness domain portals to showcase Ayurvedic healthcare practices, treatments, and booking options.",
      },
      {
        name: "Keesara Devasthanam",
        description:
          "Developed engaging, mobile-optimized religious websites for local temples, facilitating event updates and donor engagement.",
      },
    ],
  },
};

// ===== TIMELINE =====
export const timeline = [
  {
    year: "2011",
    title: "Foundation",
    description:
      "Arwin Solutions established in Hyderabad with a mission to solve real-life problems through digital transformation.",
    milestone: true,
  },
  {
    year: "2011\u20132024",
    title: "15 Years of Digital Excellence",
    description:
      "Delivered 26+ digital transformation projects across government, education, and enterprise sectors throughout India.",
    milestone: false,
  },
  {
    year: "2024",
    title: "AI Transformation",
    description:
      "Rebranded as Arwin Group. Launched WTAI community platform and Maya Design System. Introduced Arwin Forge as the digital solutions arm.",
    milestone: true,
  },
  {
    year: "2025",
    title: "Products Go Live",
    description:
      "JobReady.ai Phase 1 & 2 launched. Delivered Bhatrajula Kalyana Vedika and Vidya Bharati Vignana Kendra. Maya Design System v2.0 released.",
    milestone: true,
  },
  {
    year: "2026",
    title: "FinLens Launch",
    description:
      "Launched FinLens \u2014 free financial tools and expert-led education. Sai Vinil joins as Financial Expert. Ecosystem expands to 3 Solutions + 2 Products.",
    milestone: true,
  },
];

// ===== FINLENS CONTENT =====
export const finlensContent = {
  hero: {
    title: "FinLens",
    tagline: "See Your Finances Clearly",
    description:
      "Free financial calculators, expert guides, and actionable tips \u2014 built to help you make smarter money decisions. No jargon. No paywalls. Just clarity.",
  },

  expert: {
    name: "Sai Vinil",
    role: "Financial Expert",
    bio: "Sai Vinil brings deep financial expertise to help make personal finance accessible and actionable for everyone. From SIP strategies to home loan planning \u2014 practical knowledge you can use today.",
  },

  calculators: [
    {
      name: "SIP Calculator",
      description:
        "Calculate how much your monthly SIP investments can grow over time.",
      url: "/finlens/sip",
      icon: "chart",
    },
    {
      name: "Step-up SIP Calculator",
      description:
        "See how increasing your SIP annually accelerates your wealth creation.",
      url: "/finlens/stepup-sip",
      icon: "trending",
    },
    {
      name: "EMI Calculator",
      description:
        "Plan your home loan, car loan, or personal loan EMIs with clarity.",
      url: "/finlens/emi",
      icon: "home",
    },
    {
      name: "Term Insurance Guide",
      description:
        "Discover how to make your investments pay your term insurance premium after just 10 years.",
      url: "/finlens/term-insurance",
      icon: "shield",
    },
  ],

  topics: [
    "Mutual Funds & SIP",
    "Home Loan Planning",
    "Tax Saving Strategies",
    "Emergency Fund Building",
    "Insurance Basics",
    "Retirement Planning",
  ],
};

// ===== JOBREADY.AI CONTENT =====
export const jobreadyContent = {
  hero: {
    title: "JobReady",
    tagline: "AI-Powered Career Platform for India",
    description:
      "Fill out a form once, and let AI find relevant job opportunities across India\u2019s top platforms. Both Phase 1 (Job Search) and Phase 2 (Auto-Apply) are now live!",
  },

  currentPhase: {
    phase: "Phase 1 & 2",
    status: "Live",
    features: [
      "Simple profile form submission",
      "AI-powered skill matching for Indian job market",
      "Real-time job search from top Indian companies",
      "Relevance-scored job recommendations",
      "Salaries displayed in INR (\u20b9)",
      "Resume/CV upload support",
      "Auto-apply to matching jobs with one click",
      "Application tracking dashboard",
    ],
  },

  futurePhase: {
    phase: "Phase 3",
    status: "Coming Soon",
    features: [
      "Advanced agentic AI implementation",
      "Direct integration with Naukri & LinkedIn India",
      "Automated interview scheduling",
      "AI-powered resume optimization",
      "Salary negotiation assistant",
      "Company culture matching",
    ],
  },

  howItWorks: [
    {
      step: 1,
      title: "Fill Out Your Profile",
      description:
        "Complete a simple form with your skills, experience, and job preferences. Upload your resume for better matching.",
    },
    {
      step: 2,
      title: "AI Matches Jobs",
      description:
        "Our AI scans top Indian companies and job platforms to find matching opportunities in cities like Bangalore, Hyderabad, Mumbai, and more.",
    },
    {
      step: 3,
      title: "Auto-Apply with One Click",
      description:
        "Review AI-ranked job matches and use our auto-apply feature to submit applications instantly. Track all your applications in one place.",
    },
    {
      step: 4,
      title: "Track & Manage",
      description:
        "View all your applications in the dashboard. Get notified about status updates and interview invitations.",
    },
  ],
};

// ===== STATS =====
export const stats = {
  yearsInBusiness: new Date().getFullYear() - companyInfo.founded,
  projectsCompleted: 26,
  governmentProjects: 9,
  educationProjects: 11,
  enterpriseProjects: 6,
  solutions: 3,
  products: 2,
};