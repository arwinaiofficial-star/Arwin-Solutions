/**
 * Agentic AI Framework Types for JobReady.ai
 * 
 * This defines the core types for the agent-based job application system.
 * The framework supports a conversational flow with state management,
 * allowing users to create CVs and apply for jobs through an AI assistant.
 */

export type AgentState = 
  | "idle"
  | "collecting_info"
  | "reviewing_cv"
  | "searching_jobs"
  | "applying_job"
  | "awaiting_confirmation"
  | "completed"
  | "error";

export type AgentIntent = 
  | "create_cv"
  | "edit_cv"
  | "search_jobs"
  | "apply_job"
  | "view_applications"
  | "help"
  | "unknown";

export interface AgentMessage {
  id: string;
  role: "agent" | "user";
  content: string;
  timestamp: string;
  metadata?: {
    intent?: AgentIntent;
    stepId?: string;
    isEditable?: boolean;
    field?: string;
    options?: string[];
    inputType?: "text" | "textarea" | "select" | "multiselect" | "confirm";
    selectOptions?: string[];
    actions?: AgentAction[];
  };
}

export interface AgentAction {
  id: string;
  label: string;
  type: "primary" | "secondary" | "danger";
  action: string;
  icon?: string;
}

export interface AgentContext {
  state: AgentState;
  intent: AgentIntent | null;
  currentStep: number;
  totalSteps: number;
  collectedData: Record<string, unknown>;
  cvData: CVData | null;
  selectedJob: JobData | null;
  errors: string[];
}

export interface CVData {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    portfolio?: string;
  };
  summary: string;
  skills: string[];
  experience: WorkExperienceData[];
  education: EducationData[];
  certifications?: string[];
  languages?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperienceData {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface EducationData {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationYear: string;
  gpa?: string;
}

export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  url: string;
  source: string;
  matchScore?: number;
  tags?: string[];
}

export interface ApplicationData {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary?: string;
  appliedAt: string;
  status: ApplicationStatus;
  cvUsed: string;
}

export type ApplicationStatus = 
  | "pending"
  | "submitted"
  | "viewed"
  | "shortlisted"
  | "interview"
  | "rejected";

export interface AgentStep {
  id: string;
  field: string;
  question: string;
  inputType: "text" | "textarea" | "select" | "confirm";
  options?: string[];
  selectOptions?: string[];
  placeholder?: string;
  optional?: boolean;
  validation?: (value: string) => string | null;
}

export const CV_CREATION_STEPS: AgentStep[] = [
  {
    id: "welcome",
    field: "hasExistingCV",
    question: "Welcome to JobReady.ai! I'm your AI career assistant. I'll help you create an ATS-optimized CV and apply for jobs automatically. Do you have an existing CV, or shall I help you create one from scratch?",
    inputType: "select",
    selectOptions: ["Create a new CV for me", "I have a CV to upload"],
  },
  {
    id: "fullName",
    field: "fullName",
    question: "Great! Let's start building your CV. What's your full name as it should appear professionally?",
    inputType: "text",
    placeholder: "e.g., Rahul Sharma",
    validation: (v) => v.length < 2 ? "Name must be at least 2 characters" : null,
  },
  {
    id: "email",
    field: "email",
    question: "What's your professional email address?",
    inputType: "text",
    placeholder: "e.g., rahul.sharma@email.com",
    validation: (v) => !v.includes("@") ? "Please enter a valid email" : null,
  },
  {
    id: "phone",
    field: "phone",
    question: "Your contact phone number?",
    inputType: "text",
    placeholder: "e.g., +91 98765 43210",
  },
  {
    id: "location",
    field: "location",
    question: "Where are you currently located?",
    inputType: "select",
    selectOptions: ["Bangalore", "Hyderabad", "Mumbai", "Pune", "Chennai", "Delhi NCR", "Noida", "Gurgaon", "Remote", "Other"],
  },
  {
    id: "linkedIn",
    field: "linkedIn",
    question: "Do you have a LinkedIn profile? (Optional - you can skip this)",
    inputType: "text",
    placeholder: "e.g., linkedin.com/in/yourprofile",
    optional: true,
  },
  {
    id: "yearsOfExperience",
    field: "yearsOfExperience",
    question: "How many years of work experience do you have?",
    inputType: "select",
    selectOptions: ["Fresher (0-1 years)", "1-3 years", "3-5 years", "5-8 years", "8-12 years", "12+ years"],
  },
  {
    id: "skills",
    field: "skills",
    question: "List your key technical skills (comma-separated). These will be highlighted in your CV for ATS optimization.",
    inputType: "textarea",
    placeholder: "e.g., React, Node.js, Python, SQL, AWS, Git, JavaScript, TypeScript",
    validation: (v) => v.split(",").filter(s => s.trim()).length < 1 ? "Please enter at least one skill" : null,
  },
  {
    id: "experience_count",
    field: "experience_count",
    question: "How many work experiences would you like to add? Enter a number (0 if you're a fresher).",
    inputType: "text",
    placeholder: "e.g., 2",
    validation: (v) => isNaN(parseInt(v)) ? "Please enter a valid number" : null,
  },
  {
    id: "education_degree",
    field: "education_degree",
    question: "What is your highest degree/qualification?",
    inputType: "text",
    placeholder: "e.g., B.Tech in Computer Science",
  },
  {
    id: "education_institution",
    field: "education_institution",
    question: "Which institution did you graduate from?",
    inputType: "text",
    placeholder: "e.g., IIT Delhi",
  },
  {
    id: "education_year",
    field: "education_year",
    question: "What year did you graduate?",
    inputType: "text",
    placeholder: "e.g., 2022",
  },
  {
    id: "summary",
    field: "summary",
    question: "Finally, write a brief professional summary (2-3 sentences) highlighting your key strengths and career goals. Type 'auto' and I'll generate one based on your information!",
    inputType: "textarea",
    placeholder: "e.g., Experienced Full Stack Developer with 5+ years...",
  },
];

export const EXPERIENCE_FIELDS = [
  { id: "title", field: "title", question: "Job Title:", inputType: "text" as const, placeholder: "e.g., Software Engineer" },
  { id: "company", field: "company", question: "Company:", inputType: "text" as const, placeholder: "e.g., Infosys" },
  { id: "location", field: "location", question: "Location:", inputType: "text" as const, placeholder: "e.g., Bangalore" },
  { id: "startDate", field: "startDate", question: "Start Date:", inputType: "text" as const, placeholder: "e.g., Jan 2020" },
  { id: "endDate", field: "endDate", question: "End Date (or 'Present'):", inputType: "text" as const, placeholder: "e.g., Present" },
  { id: "highlights", field: "highlights", question: "Key achievements (comma-separated):", inputType: "textarea" as const, placeholder: "e.g., Led team of 5, Increased efficiency by 30%" },
];
