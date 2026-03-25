export interface ResumeMatchExperience {
  title?: string;
  company?: string;
  location?: string;
  highlights?: string[];
}

export interface ResumeMatchData {
  skills?: string[];
  summary?: string;
  experience?: ResumeMatchExperience[];
  personalInfo?: {
    name?: string;
    location?: string;
  };
}

export interface JobMatchData {
  title: string;
  description?: string;
  tags?: string[];
  location?: string;
  salary?: string;
  url?: string;
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in",
  "into", "is", "it", "of", "on", "or", "our", "the", "to", "with", "you",
  "your", "we", "will", "this", "that", "their", "they", "them", "about",
  "across", "after", "all", "also", "any", "based", "can", "candidate",
  "company", "contract", "designers", "director", "have", "has", "hiring",
  "ideal", "if", "level", "looking", "more", "not", "per", "role", "strong",
  "team", "teams", "using", "within", "work", "working", "worldwide",
]);

const KEYWORD_HEADS = new Set([
  "accessibility", "ai", "app", "apps", "brand", "brands", "creative",
  "cross", "design", "designer", "designers", "engineering", "experience",
  "figma", "flow", "flows", "frontend", "hardware", "interface", "interfaces",
  "iot", "journey", "journeys", "machine", "mobile", "ml", "platform",
  "platforms", "product", "products", "prototype", "prototypes", "prototyping",
  "research", "source", "strategy", "systems", "user", "users", "ux", "ui",
  "visual", "web", "workflow", "workflows",
]);

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[_/-]+/g, " ")
    .replace(/[^a-z0-9+#.\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeText(text: string): string[] {
  return uniqueStrings(
    normalizeText(text)
      .split(/\s+/)
      .map((token) => stemToken(token.replace(/^[^a-z0-9+#]+|[^a-z0-9+#]+$/g, "")))
      .filter((token) => token.length >= 3 && !STOP_WORDS.has(token) && !/^\d+$/.test(token))
  );
}

export function splitSkillInput(input: string): string[] {
  return input
    .split(/[,\n|]/)
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

function buildResumeTokenSet(resume: ResumeMatchData): Set<string> {
  const parts = [
    resume.summary || "",
    ...(resume.skills || []),
    resume.personalInfo?.location || "",
    ...((resume.experience || []).flatMap((item) => [
      item.title || "",
      item.company || "",
      item.location || "",
      ...(item.highlights || []),
    ])),
  ];

  return new Set(tokenizeText(parts.join(" ")));
}

function buildResumeText(resume: ResumeMatchData): string {
  return normalizeText([
    resume.summary || "",
    ...(resume.skills || []),
    resume.personalInfo?.location || "",
    ...((resume.experience || []).flatMap((item) => [
      item.title || "",
      item.company || "",
      item.location || "",
      ...(item.highlights || []),
    ])),
  ].join(" "));
}

function buildJobText(job: JobMatchData): string {
  return normalizeText([job.title, job.description || "", ...(job.tags || []), job.location || ""].join(" "));
}

function phraseMatchRatio(phrase: string, jobText: string, jobTokens: Set<string>): number {
  const normalizedPhrase = normalizeText(phrase);
  if (!normalizedPhrase) return 0;
  if (normalizedPhrase.length > 4 && jobText.includes(normalizedPhrase)) return 1;

  const phraseTokens = tokenizeText(phrase);
  if (phraseTokens.length === 0) return 0;

  const hits = phraseTokens.filter((token) => jobTokens.has(token)).length;
  if (hits === 0) return 0;
  if (hits === phraseTokens.length) return 1;
  if (phraseTokens.length > 2 && hits >= 2) return 0.67;
  return hits / phraseTokens.length;
}

function stemToken(token: string): string {
  if (token.length <= 4) return token;
  if (token.endsWith("ies") && token.length > 5) return `${token.slice(0, -3)}y`;
  if (token.endsWith("ing") && token.length > 6) return token.slice(0, -3);
  if (token.endsWith("ers") && token.length > 6) return token.slice(0, -3);
  if (token.endsWith("er") && token.length > 5) return token.slice(0, -2);
  if (token.endsWith("ed") && token.length > 5) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 5) return token.slice(0, -1);
  return token;
}

function collectPhrases(text: string, minWords: number, maxWords: number): string[] {
  const tokens = normalizeText(text)
    .split(/\s+/)
    .map((token) => stemToken(token.trim()))
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));

  const phrases: string[] = [];
  for (let size = minWords; size <= maxWords; size += 1) {
    for (let index = 0; index <= tokens.length - size; index += 1) {
      const window = tokens.slice(index, index + size);
      const keywordHits = window.filter((token) => KEYWORD_HEADS.has(token)).length;
      if (keywordHits === 0) continue;
      if (size > 1 && keywordHits < 1) continue;
      phrases.push(window.join(" "));
    }
  }

  return uniqueStrings(phrases);
}

function rankJobKeywords(job: JobMatchData): string[] {
  const phraseScores = new Map<string, number>();
  const weightedSources: Array<{ phrases: string[]; weight: number }> = [
    { phrases: uniqueStrings([normalizeText(job.title), ...collectPhrases(job.title, 2, 3)]), weight: 8 },
    { phrases: uniqueStrings((job.tags || []).map((tag) => normalizeText(tag))), weight: 7 },
    { phrases: collectPhrases(job.description || "", 2, 3), weight: 3 },
  ];

  for (const source of weightedSources) {
    for (const phrase of source.phrases) {
      if (!phrase || phrase.length < 4) continue;
      const keywordHits = tokenizeText(phrase).filter((token) => KEYWORD_HEADS.has(token)).length;
      const phraseWeight = source.weight + Math.min(3, keywordHits);
      phraseScores.set(phrase, (phraseScores.get(phrase) || 0) + phraseWeight);
    }
  }

  return [...phraseScores.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([phrase]) => phrase);
}

export function computeResumeJobMatch(
  resume: ResumeMatchData | null | undefined,
  job: JobMatchData
): {
  matchedSkills: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  matchScore: number;
} {
  const safeResume = resume || {};
  const skills = uniqueStrings((safeResume.skills || []).filter(Boolean));
  const jobText = buildJobText(job);
  const jobTokens = new Set(tokenizeText(jobText));
  const resumeTokens = buildResumeTokenSet(safeResume);
  const resumeText = buildResumeText(safeResume);

  const matchedSkills = skills.filter((skill) => phraseMatchRatio(skill, jobText, jobTokens) >= 0.5);
  const titleTokens = tokenizeText(job.title);
  const rankedKeywords = rankJobKeywords(job).slice(0, 12);
  const matchedKeywords = rankedKeywords.filter((phrase) => phraseMatchRatio(phrase, resumeText, resumeTokens) >= 0.6);
  const missingKeywords = rankedKeywords
    .filter((phrase) =>
      phraseMatchRatio(phrase, resumeText, resumeTokens) < 0.6 &&
      !skills.some((skill) => phraseMatchRatio(phrase, normalizeText(skill), new Set(tokenizeText(skill))) >= 0.6)
    )
    .slice(0, 6);

  const skillCoverage = skills.length > 0 ? matchedSkills.length / skills.length : 0;
  const titleCoverage = titleTokens.length > 0
    ? titleTokens.filter((token) => resumeTokens.has(token)).length / titleTokens.length
    : 0;
  const keywordCoverage = rankedKeywords.length > 0 ? matchedKeywords.length / rankedKeywords.length : 0;

  const hasResumeSignal = skills.length > 0 || resumeTokens.size > 0;
  const matchScore = hasResumeSignal
    ? Math.min(100, Math.round((skillCoverage * 55) + (titleCoverage * 25) + (keywordCoverage * 20)))
    : 0;

  return {
    matchedSkills,
    missingKeywords,
    matchedKeywords: matchedKeywords.slice(0, 8),
    matchScore,
  };
}

export function scoreJobForSearch(
  job: JobMatchData,
  skills: string[],
  preferences: string,
  location: string
): number {
  const insights = computeResumeJobMatch({ skills }, job);
  const jobTokens = new Set(tokenizeText([job.title, job.description || "", ...(job.tags || []), job.location || ""].join(" ")));
  const preferenceTokens = tokenizeText(`${preferences} ${location}`);

  let score = insights.matchScore;

  if (preferenceTokens.length > 0) {
    const preferenceHits = preferenceTokens.filter((token) => jobTokens.has(token)).length;
    score += Math.min(12, Math.round((preferenceHits / preferenceTokens.length) * 12));
  }

  const normalizedLocation = normalizeText(location);
  const normalizedJobLocation = normalizeText(job.location || "");
  if (normalizedLocation && normalizedJobLocation.includes(normalizedLocation)) {
    score += 8;
  }

  if (normalizeText(`${preferences} ${location}`).includes("remote") && normalizedJobLocation.includes("remote")) {
    score += 10;
  }

  if (job.salary) score += 3;
  if (job.url && !job.url.includes("naukri.com") && !job.url.includes("linkedin.com/jobs")) {
    score += 2;
  }

  return Math.min(100, score);
}

export function buildSafeCoverLetterSnippet(
  resume: ResumeMatchData | null | undefined,
  jobTitle: string,
  company?: string
): string {
  const safeResume = resume || {};
  const name = safeResume.personalInfo?.name?.trim();
  const topSkills = uniqueStrings((safeResume.skills || []).filter(Boolean)).slice(0, 3);
  const latestRole = safeResume.experience?.[0];
  const greeting = company ? `Dear Hiring Team at ${company},` : "Dear Hiring Manager,";

  let body = `${greeting}\n\nI am writing to express my interest in the ${jobTitle} role`;
  body += company ? ` at ${company}.` : ".";

  if (latestRole?.title && latestRole.company) {
    body += ` In my recent work as ${latestRole.title} at ${latestRole.company}, I have built experience that maps well to this opportunity.`;
  }

  if (topSkills.length > 0) {
    body += ` My background includes ${topSkills.join(", ")}, and I would be excited to bring that focus to your team.`;
  }

  body += "\n\nI would welcome the opportunity to discuss how my experience can support your goals.\n\nBest regards,";

  if (name) {
    body += `\n${name}`;
  }

  return body;
}
