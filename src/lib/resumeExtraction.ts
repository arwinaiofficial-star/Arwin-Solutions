export interface NormalizedEducationEntry {
  degree: string;
  institution: string;
  location: string;
  graduationYear: string;
  gpa: string;
}

export interface NormalizedExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface StructuredResumeExtraction {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  summary: string;
  skills: string[];
  experiences: NormalizedExperienceEntry[];
  education: NormalizedEducationEntry[];
}

function pickFirstString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

export function normalizeEducationRecord(input: unknown): NormalizedEducationEntry | null {
  if (!input || typeof input !== "object") return null;

  const record = input as Record<string, unknown>;
  const normalized: NormalizedEducationEntry = {
    degree: pickFirstString(record, ["degree", "degreeName", "education_degree", "course", "program", "qualification", "fieldOfStudy"]),
    institution: pickFirstString(record, ["institution", "school", "college", "university", "institute", "education_institution"]),
    location: pickFirstString(record, ["location", "city", "campus", "education_location"]),
    graduationYear: pickFirstString(record, ["graduationYear", "graduation_year", "year", "endYear", "education_year"]),
    gpa: pickFirstString(record, ["gpa", "grade", "cgpa", "score", "education_gpa"]),
  };

  return normalized.degree || normalized.institution || normalized.location || normalized.graduationYear || normalized.gpa
    ? normalized
    : null;
}

export function normalizeEducationRecords(input: unknown): NormalizedEducationEntry[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((entry) => normalizeEducationRecord(entry))
    .filter((entry): entry is NormalizedEducationEntry => Boolean(entry));
}

const SECTION_HEADINGS = [
  "executive summary",
  "professional summary",
  "summary",
  "profile",
  "objective",
  "about",
  "professional experience",
  "work experience",
  "experience",
  "employment",
  "career history",
  "projects",
  "entrepreneurship & projects",
  "key projects",
  "education",
  "skills",
  "technical skills",
  "core skills",
  "awards & recognition",
  "awards",
  "certifications",
  "languages",
  "references",
];

const MONTH_PATTERN = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*";
const DATE_RANGE_RE = new RegExp(
  `\\b(${MONTH_PATTERN}\\s+\\d{4}|\\d{4})\\s*[\\u2013\\u2014-]\\s*(Present|Current|${MONTH_PATTERN}\\s+\\d{4}|\\d{4})\\b`,
  "i"
);

const COMMON_SKILLS = new Set([
  "react",
  "angular",
  "vue",
  "javascript",
  "typescript",
  "html",
  "css",
  "storybook",
  "figma",
  "sketch",
  "adobe xd",
  "wcag",
  "design systems",
  "design system",
  "git",
  "jira",
  "agile",
  "laravel",
  "php",
  "python",
  "java",
  "c++",
  "node.js",
  "node",
  "sql",
  "ux research",
  "user testing",
  "hci",
  "accessibility",
  "prototyping",
  "governance",
  "stakeholder management",
  "leadership",
  "product design",
  "frontend engineering",
  "ui/ux",
]);

function normalizeLine(line: string): string {
  return line
    .replace(/\u00a0/g, " ")
    .replace(/[•●▪◦]/g, "•")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(rawText: string): string {
  return rawText
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "\n");
}

function toLines(rawText: string): string[] {
  return normalizeText(rawText)
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean);
}

function titleCaseIfUpper(text: string): string {
  if (!text) return "";
  if (text === text.toUpperCase()) {
    return text
      .toLowerCase()
      .split(/\s+/)
      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
      .join(" ");
  }
  return text;
}

function looksLikeHeading(line: string): boolean {
  const lower = line.toLowerCase().trim();
  return SECTION_HEADINGS.includes(lower);
}

function collectSection(lines: string[], headingAliases: string[]): string[] {
  const aliases = new Set(headingAliases.map((value) => value.toLowerCase()));
  const startIndex = lines.findIndex((line) => aliases.has(line.toLowerCase()));
  if (startIndex === -1) return [];

  const section: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (looksLikeHeading(line)) break;
    section.push(line);
  }
  return section;
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function extractEmail(rawText: string): string {
  return rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
}

function extractPhone(rawText: string): string {
  const match = rawText.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)\d{3,5}[\s-]?\d{3,5}/);
  return match?.[0]?.trim() || "";
}

function extractUrls(rawText: string): string[] {
  return dedupe(
    Array.from(rawText.matchAll(/https?:\/\/[^\s<>()]+/gi)).map((match) =>
      match[0].replace(/[),.;]+$/, "")
    )
  );
}

function extractLocation(lines: string[], email: string, phone: string): string {
  const contactLine = lines
    .slice(0, 6)
    .find((line) => line.includes(email) || (phone && line.includes(phone)));
  if (contactLine) {
    const firstPart = contactLine.split("|")[0]?.trim();
    if (firstPart && firstPart !== email && firstPart !== phone) {
      return firstPart;
    }
  }

  const fallback = lines
    .slice(0, 10)
    .find((line) => /,/.test(line) && !/@|https?:\/\//i.test(line));
  return fallback || "";
}

function extractName(lines: string[], email: string, phone: string): string {
  const topLines = lines.slice(0, 5);
  const candidate = topLines.find((line) => {
    if (!line) return false;
    if (line.includes(email) || (phone && line.includes(phone))) return false;
    if (/@|https?:\/\//i.test(line)) return false;
    if (looksLikeHeading(line)) return false;
    const words = line.split(/\s+/);
    return words.length >= 2 && words.length <= 5;
  });
  return titleCaseIfUpper(candidate || "");
}

function extractSummary(lines: string[]): string {
  const summaryLines = collectSection(lines, [
    "executive summary",
    "professional summary",
    "summary",
    "profile",
    "objective",
    "about",
  ]);

  if (summaryLines.length > 0) {
    return summaryLines.join(" ").trim();
  }

  const firstHeadingIndex = lines.findIndex((line) => looksLikeHeading(line));
  const start = firstHeadingIndex > 0 ? 1 : 0;
  const preHeading = lines.slice(start, firstHeadingIndex === -1 ? 6 : firstHeadingIndex);
  const longLines = preHeading.filter((line) => line.length > 50 && !/@|https?:\/\//i.test(line));
  return longLines.join(" ").trim();
}

function extractSkills(lines: string[], rawText: string): string[] {
  const sectionLines = collectSection(lines, ["skills", "technical skills", "core skills"]);
  const fromSection = dedupe(
    sectionLines
      .flatMap((line) => line.split(/[,|]/))
      .map((entry) => normalizeLine(entry))
      .filter((entry) => entry && !looksLikeHeading(entry))
      .flatMap((entry) =>
        entry.includes(":")
          ? entry.split(":").slice(1).join(":").split(",")
          : [entry]
      )
      .map((entry) => normalizeLine(entry))
      .filter((entry) => entry.length > 1 && entry.length < 40)
  );

  if (fromSection.length > 0) {
    return dedupe(
      fromSection
        .flatMap((entry) => entry.split(/,\s*/))
        .map((entry) => entry.replace(/\.$/, "").trim())
        .filter(Boolean)
    ).slice(0, 20);
  }

  const lower = rawText.toLowerCase();
  const inferred = Array.from(COMMON_SKILLS).filter((skill) => lower.includes(skill.toLowerCase()));
  return inferred.slice(0, 20);
}

function parseTitleAndDates(line: string): {
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
} {
  const match = line.match(
    new RegExp(`^(.*?)(?:\\s+)(${MONTH_PATTERN}\\s+\\d{4}|\\d{4})\\s*[\\u2013\\u2014-]\\s*(Present|Current|${MONTH_PATTERN}\\s+\\d{4}|\\d{4})$`, "i")
  );

  if (match) {
    const [, title, startDate, rawEndDate] = match;
    const endDate = /present|current/i.test(rawEndDate) ? "" : rawEndDate;
    return {
      title: title.trim(),
      startDate: startDate.trim(),
      endDate,
      current: !endDate,
    };
  }

  return {
    title: line.trim(),
    startDate: "",
    endDate: "",
    current: false,
  };
}

function isExperienceStart(line: string, nextLine?: string): boolean {
  if (!line || line.startsWith("•") || looksLikeHeading(line)) return false;
  if (DATE_RANGE_RE.test(line)) return true;
  return Boolean(
    nextLine &&
    !nextLine.startsWith("•") &&
    nextLine.length < 120 &&
    /[|•·]/.test(nextLine)
  );
}

function extractExperiences(lines: string[]): NormalizedExperienceEntry[] {
  const sectionLines = collectSection(lines, [
    "professional experience",
    "work experience",
    "experience",
    "employment",
    "career history",
    "projects",
    "entrepreneurship & projects",
    "key projects",
  ]);
  if (sectionLines.length === 0) return [];

  const blocks: string[][] = [];
  let current: string[] = [];

  sectionLines.forEach((line, index) => {
    const nextLine = sectionLines[index + 1];
    if (isExperienceStart(line, nextLine)) {
      if (current.length > 0) blocks.push(current);
      current = [line];
      return;
    }
    if (current.length === 0) {
      current = [line];
      return;
    }
    current.push(line);
  });

  if (current.length > 0) blocks.push(current);

  return blocks
    .map((block, index) => {
      const [titleLine = "", companyLine = "", ...rest] = block;
      const { title, startDate, endDate, current } = parseTitleAndDates(titleLine);
      const companyBits = companyLine
        .split(/[•|]/)
        .map((part) => normalizeLine(part))
        .filter(Boolean);
      const highlights = rest
        .map((line) => line.replace(/^•\s*/, "").trim())
        .filter((line) => line.length > 12)
        .slice(0, 6);

      if (!title && companyBits.length === 0 && highlights.length === 0) return null;

      return {
        id: `exp_${index}`,
        title,
        company: companyBits[0] || "",
        location: companyBits.slice(1).join(", "),
        startDate,
        endDate,
        current,
        highlights,
      };
    })
    .filter((entry): entry is NormalizedExperienceEntry => Boolean(entry));
}

function extractEducation(lines: string[]): NormalizedEducationEntry[] {
  const sectionLines = collectSection(lines, ["education"]);
  if (sectionLines.length === 0) return [];

  const blocks: string[][] = [];
  let current: string[] = [];

  sectionLines.forEach((line) => {
    const startsNewBlock =
      current.length > 0 &&
      (DATE_RANGE_RE.test(line) ||
        /\b(PhD|Master|MSc|MS|BSc|Bachelor|BTech|MBA|Diploma|Certificate)\b/i.test(line));

    if (startsNewBlock) {
      blocks.push(current);
      current = [line];
      return;
    }

    current.push(line);
  });

  if (current.length > 0) blocks.push(current);

  return blocks
    .map((block) => {
      const joined = block.join(" ");
      const yearMatch = joined.match(/\b(19|20)\d{2}\b(?:\s*[–-]\s*\b(19|20)\d{2}\b)?/);
      const degreeLine = block.find((line) =>
        /\b(PhD|Master|MSc|MS|BSc|Bachelor|BTech|MBA|Diploma|Certificate)\b/i.test(line)
      ) || block[0] || "";
      const institutionLine = block.find((line, index) =>
        index > 0 &&
        !/\b(PhD|Master|MSc|MS|BSc|Bachelor|BTech|MBA|Diploma|Certificate)\b/i.test(line) &&
        !DATE_RANGE_RE.test(line)
      ) || "";

      const location = institutionLine.includes(",")
        ? institutionLine.split(",").slice(1).join(",").trim()
        : "";

      const institution = institutionLine.includes(",")
        ? institutionLine.split(",")[0].trim()
        : institutionLine;

      const normalized = {
        degree: degreeLine.replace(DATE_RANGE_RE, "").trim(),
        institution,
        location,
        graduationYear: yearMatch?.[0]?.split(/[–-]/).pop()?.trim() || "",
        gpa: "",
      };

      return normalized.degree || normalized.institution ? normalized : null;
    })
    .filter((entry): entry is NormalizedEducationEntry => Boolean(entry));
}

function pickUrl(urls: string[], matcher: (url: string) => boolean): string {
  return urls.find(matcher) || "";
}

export function buildResumeDataFromRawText(rawText: string): StructuredResumeExtraction {
  const lines = toLines(rawText);
  const email = extractEmail(rawText);
  const phone = extractPhone(rawText);
  const urls = extractUrls(rawText);

  return {
    fullName: extractName(lines, email, phone),
    email,
    phone,
    location: extractLocation(lines, email, phone),
    linkedIn: pickUrl(urls, (url) => /linkedin\.com/i.test(url)),
    portfolio: pickUrl(urls, (url) => !/linkedin\.com/i.test(url)),
    summary: extractSummary(lines),
    skills: extractSkills(lines, rawText),
    experiences: extractExperiences(lines),
    education: extractEducation(lines),
  };
}

function normalizeExperienceRecord(input: unknown, index: number): NormalizedExperienceEntry | null {
  if (!input || typeof input !== "object") return null;

  const record = input as Record<string, unknown>;
  const highlights = Array.isArray(record.highlights)
    ? record.highlights.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];

  const normalized: NormalizedExperienceEntry = {
    id: pickFirstString(record, ["id"]) || `exp_${index}`,
    title: pickFirstString(record, ["title", "role", "jobTitle"]),
    company: pickFirstString(record, ["company", "employer", "organization"]),
    location: pickFirstString(record, ["location", "city"]),
    startDate: pickFirstString(record, ["startDate", "start_date", "from"]),
    endDate: pickFirstString(record, ["endDate", "end_date", "to"]),
    current: Boolean(record.current),
    highlights,
  };

  return normalized.title || normalized.company || normalized.highlights.length > 0 ? normalized : null;
}

function normalizeExperienceRecords(input: unknown): NormalizedExperienceEntry[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((entry, index) => normalizeExperienceRecord(entry, index))
    .filter((entry): entry is NormalizedExperienceEntry => Boolean(entry));
}

export function mergeResumeExtraction(
  primary: Record<string, unknown> | null | undefined,
  fallback: StructuredResumeExtraction
): StructuredResumeExtraction {
  if (!primary) return fallback;

  const record = primary as Record<string, unknown>;
  const experiences = normalizeExperienceRecords(record.experiences);
  const education = normalizeEducationRecords(record.education);
  const skills = Array.isArray(record.skills)
    ? record.skills.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];

  return {
    fullName: pickFirstString(record, ["fullName", "name"]) || fallback.fullName,
    email: pickFirstString(record, ["email"]) || fallback.email,
    phone: pickFirstString(record, ["phone"]) || fallback.phone,
    location: pickFirstString(record, ["location"]) || fallback.location,
    linkedIn: pickFirstString(record, ["linkedIn", "linkedin", "linkedin_url"]) || fallback.linkedIn,
    portfolio: pickFirstString(record, ["portfolio", "website"]) || fallback.portfolio,
    summary: pickFirstString(record, ["summary", "about"]) || fallback.summary,
    skills: skills.length > 0 ? dedupe(skills) : fallback.skills,
    experiences: experiences.length > 0 ? experiences : fallback.experiences,
    education: education.length > 0 ? education : fallback.education,
  };
}

export function hasMeaningfulResumeExtraction(
  input: Record<string, unknown> | StructuredResumeExtraction | null | undefined
): boolean {
  if (!input) return false;
  const record = input as Record<string, unknown>;
  const skills = Array.isArray(record.skills) ? record.skills.length : 0;
  const experiences = Array.isArray(record.experiences) ? record.experiences.length : 0;
  const education = Array.isArray(record.education) ? record.education.length : 0;
  return Boolean(
    pickFirstString(record, ["fullName", "name", "email", "phone", "location", "summary"]) ||
    skills > 0 ||
    experiences > 0 ||
    education > 0
  );
}
