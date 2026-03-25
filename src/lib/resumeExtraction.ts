export interface NormalizedEducationEntry {
  degree: string;
  institution: string;
  location: string;
  graduationYear: string;
  gpa: string;
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
