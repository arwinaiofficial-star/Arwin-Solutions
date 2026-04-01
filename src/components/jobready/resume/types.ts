import { UserProfile } from "@/context/AuthContext";

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  summary: string;
  skills: string[];
  experiences: ExperienceEntry[];
  education: EducationEntry[];
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationYear: string;
  gpa: string;
}

/**
 * Create initial resume data from user profile
 */
export function createInitialResumeData(user: UserProfile | null): ResumeData {
  return {
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    linkedIn: "",
    portfolio: "",
    summary: "",
    skills: [],
    experiences: [],
    education: [],
  };
}

/**
 * Map backend DB resume data (various shapes) to our frontend ResumeData.
 * Handles: direct ResumeData shape, backend extractedData shape, and cvData shape.
 */
export function mapBackendToResumeData(raw: Record<string, unknown>): ResumeData {
  // Direct shape (already matches ResumeData)
  if (typeof raw.fullName === "string") {
    return {
      fullName: (raw.fullName as string) || "",
      email: (raw.email as string) || "",
      phone: (raw.phone as string) || "",
      location: (raw.location as string) || "",
      linkedIn: (raw.linkedIn as string) || "",
      portfolio: (raw.portfolio as string) || "",
      summary: (raw.summary as string) || "",
      skills: Array.isArray(raw.skills) ? raw.skills as string[] : [],
      experiences: ensureExperiences(raw.experiences),
      education: ensureEducation(raw.education),
    };
  }

  // Backend cvData shape (has personalInfo nested object)
  const pi = (raw.personalInfo ?? {}) as Record<string, string>;
  return {
    fullName: pi.name || (raw.name as string) || "",
    email: pi.email || (raw.email as string) || "",
    phone: pi.phone || (raw.phone as string) || "",
    location: pi.location || (raw.location as string) || "",
    linkedIn: pi.linkedIn || (raw.linkedIn as string) || "",
    portfolio: pi.portfolio || (raw.portfolio as string) || "",
    summary: (raw.summary as string) || "",
    skills: Array.isArray(raw.skills) ? raw.skills as string[] : [],
    experiences: ensureExperiences(raw.experiences || raw.experience),
    education: ensureEducation(raw.education),
  };
}

function ensureExperiences(raw: unknown): ExperienceEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((e: Record<string, unknown>, i: number) => ({
    id: (e.id as string) || `exp_${i}`,
    title: (e.title as string) || "",
    company: (e.company as string) || "",
    location: (e.location as string) || "",
    startDate: (e.startDate as string) || "",
    endDate: (e.endDate as string) || "",
    current: (e.current as boolean) || false,
    highlights: Array.isArray(e.highlights) ? e.highlights as string[] : [],
  }));
}

function ensureEducation(raw: unknown): EducationEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((e: Record<string, unknown>, i: number) => ({
    id: (e.id as string) || `edu_${i}`,
    degree: (e.degree as string) || "",
    institution: (e.institution as string) || "",
    location: (e.location as string) || "",
    graduationYear: (e.graduationYear as string) || "",
    gpa: (e.gpa as string) || "",
  }));
}

/**
 * Convert frontend ResumeData to the shape the backend expects for saving.
 */
export function resumeDataToBackend(data: ResumeData): Record<string, unknown> {
  return {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    location: data.location,
    linkedIn: data.linkedIn,
    portfolio: data.portfolio,
    summary: data.summary,
    skills: data.skills,
    experiences: data.experiences,
    education: data.education,
    // Also save in the personalInfo shape for backward compat
    personalInfo: {
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      location: data.location,
      linkedIn: data.linkedIn,
      portfolio: data.portfolio,
    },
  };
}

/**
 * Calculate resume completeness score (0-100)
 */
export function calculateScore(data: ResumeData): { score: number; hint: string } {
  const weights = {
    fullName: 5,
    email: 5,
    phone: 5,
    location: 5,
    linkedIn: 5,
    portfolio: 5,
    summary: 10,
    skills: 15,
    experiences: 25,
    education: 20,
  };

  let score = 0;

  if (data.fullName.trim()) score += weights.fullName;
  if (data.email.trim()) score += weights.email;
  if (data.phone.trim()) score += weights.phone;
  if (data.location.trim()) score += weights.location;
  if (data.linkedIn.trim()) score += weights.linkedIn;
  if (data.portfolio.trim()) score += weights.portfolio;
  if (data.summary.trim()) score += weights.summary;

  if (data.skills.length > 0) {
    score += Math.min(weights.skills, (data.skills.length / 10) * weights.skills);
  }

  if (data.experiences.length > 0) {
    const expCompletion =
      data.experiences.reduce((sum, exp) => {
        let completion = 0;
        if (exp.title) completion += 0.2;
        if (exp.company) completion += 0.2;
        if (exp.location) completion += 0.2;
        if (exp.startDate) completion += 0.2;
        if (exp.highlights.length > 0) completion += 0.2;
        return sum + completion;
      }, 0) / data.experiences.length;
    score += expCompletion * weights.experiences;
  }

  if (data.education.length > 0) {
    const eduCompletion =
      data.education.reduce((sum, edu) => {
        let completion = 0;
        if (edu.degree) completion += 0.25;
        if (edu.institution) completion += 0.25;
        if (edu.location) completion += 0.25;
        if (edu.graduationYear) completion += 0.25;
        return sum + completion;
      }, 0) / data.education.length;
    score += eduCompletion * weights.education;
  }

  const finalScore = Math.round(Math.min(100, score));

  let hint = "";
  if (finalScore < 30) hint = "Add basic contact info to get started";
  else if (finalScore < 50) hint = "Include your professional summary";
  else if (finalScore < 70) hint = "Add work experience and education";
  else if (finalScore < 85) hint = "Enhance with more details and highlights";
  else hint = "Excellent! Your resume is nearly complete";

  return { score: finalScore, hint };
}
