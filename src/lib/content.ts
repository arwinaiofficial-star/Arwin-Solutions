/**
 * Central content repository for Arwin AI Solutions
 * All copy, stats, and data live here for easy maintenance
 */

// ===== COMPANY INFO =====
export const companyInfo = {
  name: "Arwin AI Solutions",
  founded: 2011,
  tagline: "Solving Real-Life Problems with AI-Enabled Solutions",
  address: "258D, Prajay Sai Gardens Rd, Kundanpally, Cheeriyal, Hyderabad, Telangana 501301",
  city: "Hyderabad",
  phone: "094909 37683",
  email: {
    official: "arwinai.official@gmail.com",
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
    badge: "Established 2011 • AI-Enabled Since 2024",
    title: "Solving Real-Life Problems with AI-Powered Solutions",
    subtitle: "For almost 14 years, Arwin Solutions has been transforming businesses and communities through digital innovation. Now rebranded as Arwin AI Solutions, we're equipped with AI capabilities to solve your challenges smarter and faster.",
    stats: [
      { value: "14+", label: "Years of Excellence", detail: "Since 2011" },
      { value: "26+", label: "Projects Delivered", detail: "Government, Education, Enterprise" },
      { value: "3", label: "AI Pillars", detail: "WTAI • Maya • JobReady.ai" },
    ],
  },
  
  philosophy: {
    title: "Our Philosophy",
    description: "Our main aim has always been to solve real-life problems, challenges, and legacy procedures by providing digital solutions. For most of our firm's work, it's about goodwill, not just money. We help small-scale to large-scale businesses establish their digital footprint, reaching more people and making a real impact.",
  },

  pillars: [
    {
      name: "WTAI",
      tagline: "AI Learning Platform",
      description: "Comprehensive AI learning and resource platform. We're building the future of AI education and practical implementation.",
      url: "https://wtai.in/",
      external: true,
      phase: "Live",
      features: [
        "AI education resources",
        "Practical implementation guides",
        "Community-driven learning",
        "Future of AI education",
      ],
    },
    {
      name: "Maya Design System",
      tagline: "Design System 2.0",
      description: "Built on a modular, token-driven architecture. CSS-first design system made to use in all our projects according to their needs.",
      url: "https://wtai.in/design-system/",
      external: true,
      phase: "v2.0.0 Released",
      features: [
        "Modular architecture",
        "Token-driven design",
        "CSS-first approach",
        "NPM: @maya-design-system/design-system",
      ],
    },
    {
      name: "JobReady.ai",
      tagline: "AI Job Application Platform for India",
      description: "Phase 1 & 2 are live: Search jobs from top Indian companies, auto-apply with one click, and track all your applications. Salaries in INR, jobs in Bangalore, Hyderabad, Mumbai & more.",
      url: "/jobready",
      external: false,
      phase: "Phase 1 & 2 Live",
      features: [
        "Indian job market focused",
        "Auto-apply feature",
        "Application tracking",
        "Resume upload support",
      ],
    },
  ],
};

// ===== ABOUT PAGE CONTENT =====
export const aboutContent = {
  story: {
    title: "Our Journey: From Solutions to AI Solutions",
    content: [
      "Arwin Solutions was established in 2011 with a clear mission: to solve real-life problems and challenges through digital transformation. For almost 14 years, we've worked with government institutions, educational organizations, and enterprises across India.",
      "In 2024, we rebranded as Arwin AI Solutions, embracing AI capabilities to provide even smarter, more competitive services. Our philosophy remains unchanged - we work for goodwill first, with money being a by-product of the value we create.",
      "We've helped small-scale to large-scale businesses establish their digital footprint, enabling them to reach more people and make a greater impact. Our work spans critical sectors including government, education, healthcare, and enterprise.",
    ],
  },

  mission: "To solve real-life problems and business challenges through AI-enabled digital solutions, helping organizations compete and thrive in the digital age.",
  
  vision: "To be the most trusted AI-powered digital transformation partner for government, education, and enterprise sectors across India.",

  values: [
    "Goodwill First - Money is a by-product of value created",
    "Real Impact - Solving genuine problems, not creating unnecessary complexity",
    "Innovation - Embracing AI and modern technologies",
    "Quality - Excellence in every project, big or small",
    "Partnership - Long-term relationships over short-term gains",
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
      bio: "Driving the company's strategic direction and AI transformation, leading Arwin AI Solutions into the future.",
    },
    {
      name: "Chaithanya Bonthala",
      role: "COO",
      bio: "Ensuring operational excellence and delivery of high-quality solutions across all projects.",
    },
  ],
};

// ===== WORK/PROJECTS CONTENT =====
export const recentProjects = [
  {
    name: "Bhatraju Lakalyana Vedika",
    category: "Community Matrimony Platform",
    url: "https://bhatrajulakalyanavedika.com/",
    description: "Created a comprehensive matrimony platform from scratch for the Bhatraju community, boosting registrations and providing an easy-to-use matchmaking process with strong foundation for data communication.",
    year: 2025,
    features: [
      "Complete registration system",
      "Advanced matchmaking algorithm",
      "Profile management",
      "Communication tools",
      "Community-focused features",
    ],
    technologies: ["Maya Design System", "Next.js", "AI-Enhanced UX"],
    outcome: "Significantly increased community registrations and simplified the matchmaking process",
  },
  {
    name: "Vidyabharati SVP",
    category: "Educational Institution",
    url: "https://vidyabharatisvp.com/",
    description: "Complete website rebrand with new design language and in-house CMS panel for content management, resulting in boosted admissions and improved user experience.",
    year: 2025,
    features: [
      "Modern design language",
      "Custom CMS panel",
      "Content management system",
      "Admissions portal",
      "Parent communication",
    ],
    technologies: ["Maya Design System", "Custom CMS", "Next.js"],
    outcome: "Boosted admissions through improved branding and streamlined content management",
  },
];

export const legacyProjects = {
  government: {
    title: "Government & Public Sector",
    count: 9,
    projects: [
      {
        name: "Kendriya Vidyalayas",
        description: "Developed robust, scalable educational portals for India's largest chain of government schools, supporting their mission for quality and uniform education across the country.",
      },
      {
        name: "Govt of Telangana & Andhra Pradesh",
        description: "Engineered digital solutions for major state departments, streamlining citizen services and showcasing government initiatives efficiently and securely.",
      },
      {
        name: "NTPC",
        description: "Crafted dynamic websites for NTPC, India's premier power company, enabling public access to information, project updates, and sustainability reports.",
      },
      {
        name: "Tirumala Tirupati Devasthanam Board",
        description: "Engineered high-traffic, feature-rich portals handling pilgrim services, bookings, and temple information for one of the world's most visited religious sites.",
      },
      {
        name: "Indian Railways",
        description: "Contributed to public-facing modules enhancing information dissemination and digital access for one of India's largest employers.",
      },
      {
        name: "NIC, National Informatics Centre",
        description: "Designed secure, standards-compliant government portals collaborating with India's premier digital ICT solutions provider.",
      },
      {
        name: "DRDA",
        description: "Designed result-oriented platforms for government rural development organizations, driving project visibility and public participation.",
      },
      {
        name: "Travancore Devaswom Board",
        description: "Developed informative websites to improve transparency and service delivery for this prestigious temple board managing major heritage temples.",
      },
      {
        name: "Telugu Film Chambers Of Commerce",
        description: "Created professional portals to facilitate communication and digital processes among film industry stakeholders.",
      },
    ],
  },

  education: {
    title: "Education & Institutions",
    count: 11,
    projects: [
      {
        name: "CBIT (Chaitanya Bharathi Institute of Technology)",
        description: "Built interactive, user-centric academic websites that boost institutional outreach and streamline student-faculty engagement.",
      },
      {
        name: "Geetanjali Group Of Institutions",
        description: "Implemented integrated digital solutions for education institutions, enabling admissions, resource access, and activity management online.",
      },
      {
        name: "St. Ann's Schools",
        description: "Engineered modern school portals for information sharing, admissions, and parent interaction.",
      },
      {
        name: "St. John's Institutions",
        description: "Created comprehensive websites for multisectoral educational campuses, focused on ease-of-use and rich content integration.",
      },
      {
        name: "Carmel Convents",
        description: "Provided dynamic, community-driven digital platforms for convent schools to showcase achievements and streamline communication.",
      },
      {
        name: "Nirmala Convents",
        description: "Built engaging class-to-community online platforms for convent schools, integrating secure content and announcements.",
      },
      {
        name: "Jeeyar Educational Trust",
        description: "Designed comprehensive educational sites to enhance visibility, event registrations, and contribution tracking for this philanthropic educational trust.",
      },
      {
        name: "Akshara Group",
        description: "Built robust websites for educational groups, focusing on admissions, courses, and academic highlights.",
      },
      {
        name: "Lion's Club",
        description: "Built engaging and community-driven platforms to amplify social outreach and charitable projects for this international service organization.",
      },
      {
        name: "Telangana Bhatraju Community",
        description: "Launched community-specific networking portals promoting social and cultural programs digitally.",
      },
      {
        name: "Cheeryal Laxminarsimha Swamy Devasthanam",
        description: "Digitally enabled temple management with informative and booking-friendly portals supporting traditions and pilgrim needs.",
      },
    ],
  },

  enterprise: {
    title: "Enterprise & Healthcare",
    count: 6,
    projects: [
      {
        name: "Kapil Group",
        description: "Implemented interactive web solutions for a leading conglomerate, highlighting their multifaceted business profile and facilitating seamless communication.",
      },
      {
        name: "Adarsha Motors",
        description: "Developed responsive business websites for automotive dealerships, streamlining lead generation and customer support.",
      },
      {
        name: "Soorya Hospitals",
        description: "Delivered robust, patient-friendly hospital websites enabling appointment scheduling, service enquiry, and resource information.",
      },
      {
        name: "Amrutha IVF Centers",
        description: "Created tailored medical web platforms for IVF and healthcare institutions to drive awareness, appointment, and education efforts.",
      },
      {
        name: "Aditya Ayur Gram, Chapadu, Cuddapah",
        description: "Crafted wellness domain portals to showcase Ayurvedic healthcare practices, treatments, and booking options.",
      },
      {
        name: "Keesara Devasthanam",
        description: "Developed engaging, mobile-optimized religious websites for local temples, facilitating event updates and donor engagement.",
      },
    ],
  },
};

// ===== TIMELINE =====
export const timeline = [
  {
    year: "2011",
    title: "Foundation",
    description: "Arwin Solutions established with a mission to solve real-life problems through digital transformation.",
    milestone: true,
  },
  {
    year: "2011-2024",
    title: "14 Years of Excellence",
    description: "Delivered 26+ digital transformation projects across government, education, and enterprise sectors throughout India.",
    milestone: false,
  },
  {
    year: "2024",
    title: "AI Transformation",
    description: "Rebranded as Arwin AI Solutions, introducing AI-enabled capabilities and modern solutions.",
    milestone: true,
  },
  {
    year: "2024-2025",
    title: "Three Pillars Launch",
    description: "Launched WTAI AI learning platform, Maya Design System 2.0, and JobReady.ai Phase 1.",
    milestone: false,
  },
  {
    year: "2025",
    title: "Recent Success",
    description: "Successfully delivered Bhatraju Lakalyana Vedika matrimony platform and Vidyabharati SVP school website rebrand.",
    milestone: true,
  },
];

// ===== JOBREADY.AI CONTENT =====
export const jobreadyContent = {
  hero: {
    title: "JobReady.ai",
    tagline: "Simplifying Job Applications with AI for India",
    description: "Fill out a form once, and let AI find relevant job opportunities across India's top platforms. Both Phase 1 (Job Search) and Phase 2 (Auto-Apply) are now live!",
  },

  currentPhase: {
    phase: "Phase 1 & 2",
    status: "Live",
    features: [
      "Simple profile form submission",
      "AI-powered skill matching for Indian job market",
      "Real-time job search from top Indian companies",
      "Relevance-scored job recommendations",
      "Salaries displayed in INR (₹)",
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
      description: "Complete a simple form with your skills, experience, and job preferences. Upload your resume for better matching.",
    },
    {
      step: 2,
      title: "AI Matches Jobs",
      description: "Our AI scans top Indian companies and job platforms to find matching opportunities in cities like Bangalore, Hyderabad, Mumbai, and more.",
    },
    {
      step: 3,
      title: "Auto-Apply with One Click",
      description: "Review AI-ranked job matches and use our auto-apply feature to submit applications instantly. Track all your applications in one place.",
    },
    {
      step: 4,
      title: "Track & Manage",
      description: "View all your applications in the dashboard. Get notified about status updates and interview invitations.",
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
};
