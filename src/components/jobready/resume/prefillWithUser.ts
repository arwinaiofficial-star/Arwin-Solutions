import type { ResumeData } from "./types";

type ResumeOwner = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
};

const PLACEHOLDER_PATTERN = /^\[[^\]]+\]$/;

function sanitizeField(value: string | null | undefined): string {
  const nextValue = (value || "").trim();
  return PLACEHOLDER_PATTERN.test(nextValue) ? "" : nextValue;
}

export function prefillResumeWithUser(
  data: ResumeData,
  user: ResumeOwner | null | undefined
): ResumeData {
  if (!user) {
    return {
      ...data,
      fullName: sanitizeField(data.fullName),
      email: sanitizeField(data.email),
      phone: sanitizeField(data.phone),
      location: sanitizeField(data.location),
      linkedIn: sanitizeField(data.linkedIn),
      portfolio: sanitizeField(data.portfolio),
    };
  }

  return {
    ...data,
    fullName: sanitizeField(data.fullName) || (user.name || "").trim(),
    email: sanitizeField(data.email) || (user.email || "").trim(),
    phone: sanitizeField(data.phone) || (user.phone || "").trim(),
    location: sanitizeField(data.location) || (user.location || "").trim(),
    linkedIn: sanitizeField(data.linkedIn),
    portfolio: sanitizeField(data.portfolio),
  };
}
