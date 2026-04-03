/**
 * BFF Route: POST /api/resume/linkedin
 * Proxies LinkedIn profile import to FastAPI backend.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";
import { getAuthorizationHeader } from "@/lib/api/authCookies";

const MONTH_PATTERN =
  "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*";

function normalizeLinkedInUrl(input: string): string {
  const value = input.trim().replace(/\/+$/, "");
  const match = value.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (match) {
    return `https://www.linkedin.com/in/${match[1]}/`;
  }
  if (/^[a-zA-Z0-9_-]+$/.test(value)) {
    return `https://www.linkedin.com/in/${value}/`;
  }
  throw new Error("Invalid LinkedIn URL. Expected format: linkedin.com/in/username");
}

function extractMetaTag(html: string, name: string): string {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+name=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1]
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    }
  }

  return "";
}

function decodeLinkedInText(value: string): string {
  let decoded = value.trim();
  const replacements: Array<[RegExp, string]> = [
    [/&amp;amp;/g, "&"],
    [/&amp;/g, "&"],
    [/&quot;/g, '"'],
    [/&#39;/g, "'"],
    [/&nbsp;/g, " "],
  ];

  for (const [pattern, replacement] of replacements) {
    decoded = decoded.replace(pattern, replacement);
  }

  return decoded.replace(/\s+/g, " ").trim();
}

function looksLikeLinkedInArtifact(line: string): boolean {
  const value = line.trim();
  if (!value) return true;

  const lower = value.toLowerCase();
  if (
    lower.includes("text-[") ||
    lower.includes("group-hover") ||
    lower.includes("leading-") ||
    lower.includes("mb-0") ||
    lower.includes("[&") ||
    lower.includes("text-color-") ||
    lower.includes("rounded-") ||
    lower.includes("px-") ||
    lower.includes("py-")
  ) {
    return true;
  }

  return [
    "skip to main content",
    "top content",
    "people",
    "learning",
    "jobs",
    "games",
    "sign in",
    "join now",
    "new to linkedin",
    "email or phone",
    "password",
    "forgot password",
    "show",
    "show more",
    "show less",
    "recommended based on your profile",
    "people also viewed",
    "view all",
  ].some((fragment) => lower === fragment || lower.startsWith(fragment));
}

function cleanHtmlText(html: string): string[] {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|li|section|h1|h2|h3|h4|h5|h6|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split("\n")
    .map((line) => decodeLinkedInText(line))
    .filter((line) => line.length > 1 && !looksLikeLinkedInArtifact(line));
}

function collectLinesBetween(
  lines: string[],
  startLabel: string,
  stopMarkers: string[]
): string[] {
  const startIndex = lines.indexOf(startLabel);
  if (startIndex === -1) return [];

  const loweredStops = stopMarkers.map((item) => item.toLowerCase());
  const output: string[] = [];

  for (const line of lines.slice(startIndex + 1)) {
    const lower = line.toLowerCase();
    if (loweredStops.some((item) => lower.startsWith(item))) break;
    output.push(line);
  }

  return output;
}

function looksLikeDate(line: string): boolean {
  return new RegExp(`^(?:${MONTH_PATTERN}\\s+\\d{4}|\\d{4})$`, "i").test(line);
}

function extractDateRange(
  line: string
): { startDate: string; endDate: string; current: boolean } | null {
  const normalized = decodeLinkedInText(line).replace(/[•·]/g, " ");
  const match = normalized.match(
    new RegExp(
      `(${MONTH_PATTERN}\\s+\\d{4}|\\d{4})\\s*(?:-|–|—|to)\\s*(Present|Current|${MONTH_PATTERN}\\s+\\d{4}|\\d{4})`,
      "i"
    )
  );

  if (!match) return null;

  const startDate = match[1].trim();
  const endLabel = match[2].trim();
  const current = /present|current/i.test(endLabel);
  return {
    startDate,
    endDate: current ? "" : endLabel,
    current,
  };
}

function isLikelyLinkedInMetaLine(line: string): boolean {
  const lower = line.toLowerCase();
  return (
    lower.length < 100 &&
    !looksLikeDate(lower) &&
    !extractDateRange(lower) &&
    !/\b(year|month)s?\b/i.test(lower)
  );
}

function isLikelyExperienceTitle(line: string): boolean {
  if (!isLikelyLinkedInMetaLine(line)) return false;
  const lower = line.toLowerCase();
  if (
    lower.includes("followers") ||
    lower.includes("connections") ||
    lower.includes("linkedin") ||
    lower.includes("education") ||
    lower.includes("experience")
  ) {
    return false;
  }
  return line.split(" ").length <= 12;
}

function isLikelyLocationLine(line: string): boolean {
  const lower = line.toLowerCase();
  return (
    isLikelyLinkedInMetaLine(line) &&
    (line.includes(",") || /\bremote\b/i.test(line)) &&
    line.split(" ").length <= 10 &&
    !/\b(founder|engineer|manager|chair|board|developer|designer|director|partner|member|advisor|lead|consultant|specialist)\b/i.test(lower)
  );
}

function isDurationLine(line: string): boolean {
  return /\b\d+\s+(?:year|month)s?\b/i.test(line);
}

function parsePublicExperience(lines: string[]) {
  const section = collectLinesBetween(lines, "Experience", [
    "education",
    "view ",
    "other similar profiles",
  ]).filter((line) => !looksLikeLinkedInArtifact(line));

  if (section.length === 0) return [];

  const items: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    highlights: string[];
  }> = [];

  let index = 0;
  while (index < section.length) {
    const title = decodeLinkedInText(section[index]);
    if (!isLikelyExperienceTitle(title)) {
      index += 1;
      continue;
    }

    const nearbyLines = section
      .slice(index + 1, index + 7)
      .map((line) => decodeLinkedInText(line))
      .filter((line) => line.length > 0);

    const company = nearbyLines.find(
      (line) =>
        isLikelyLinkedInMetaLine(line) &&
        !isLikelyLocationLine(line) &&
        !isDurationLine(line)
    ) || "";
    const rangeSource = nearbyLines.find((line) => extractDateRange(line));
    const range = rangeSource ? extractDateRange(rangeSource) : null;
    const location = nearbyLines.find((line) => isLikelyLocationLine(line)) || "";

    if (!company || !range) {
      index += 1;
      continue;
    }

    items.push({
      id: `li-public-exp-${items.length}`,
      title,
      company,
      location,
      startDate: range.startDate,
      endDate: range.endDate,
      current: range.current,
      highlights: [],
    });

    index += Math.max(2, nearbyLines.indexOf(rangeSource || "") + 2);
    if (items.length >= 8) break;
  }

  return items;
}

function parsePublicEducation(lines: string[]) {
  const section = collectLinesBetween(lines, "Education", [
    "view ",
    "other similar profiles",
  ]).filter((line) => !looksLikeLinkedInArtifact(line));

  if (section.length === 0) return [];

  const items: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    graduationYear: string;
    gpa: string;
  }> = [];

  for (let index = 0; index < section.length; index += 1) {
    const institution = decodeLinkedInText(section[index]);
    if (!isLikelyLinkedInMetaLine(institution)) continue;

    const nearbyLines = section
      .slice(index + 1, index + 5)
      .map((line) => decodeLinkedInText(line))
      .filter((line) => line.length > 0);
    const degree = nearbyLines.find((line) =>
      /\b(Bachelor|Master|MSc|MBA|BTech|PhD|Degree|Diploma|Certificate)\b/i.test(line)
    );
    const graduationYear =
      nearbyLines.find((line) => /^(19|20)\d{2}$/.test(line)) || "";

    if (!degree) continue;

    items.push({
      id: `li-public-edu-${items.length}`,
      degree,
      institution,
      location: "",
      graduationYear,
      gpa: "",
    });

    if (items.length >= 4) break;
  }

  return items;
}

async function importPublicLinkedInProfile(linkedinUrl: string) {
  const normalizedUrl = normalizeLinkedInUrl(linkedinUrl);
  const response = await fetch(normalizedUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`LinkedIn public profile returned status ${response.status}.`);
  }

  const html = await response.text();
  const lines = cleanHtmlText(html);
  const firstName = decodeLinkedInText(extractMetaTag(html, "profile:first_name"));
  const lastName = decodeLinkedInText(extractMetaTag(html, "profile:last_name"));
  const ogTitle = decodeLinkedInText(extractMetaTag(html, "og:title"));
  const ogDescription = decodeLinkedInText(extractMetaTag(html, "og:description"));

  let fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (!fullName && ogTitle) {
    fullName = ogTitle.split(" - ", 1)[0].replace(" | LinkedIn", "").trim();
  }

  let headline = "";
  if (ogTitle.includes(" - ")) {
    headline = ogTitle.split(" - ", 2)[1].replace(" | LinkedIn", "").trim();
  }

  let location = "";
  const summaryParts: string[] = [];
  const descriptionParts = decodeLinkedInText(ogDescription)
    .split("·")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const part of descriptionParts) {
    if (part.startsWith("Location:")) {
      location = part.replace("Location:", "").trim();
      continue;
    }
    if (
      part.startsWith("Experience:") ||
      part.includes("connections on LinkedIn")
    ) {
      continue;
    }
    if (!headline) {
      headline = part;
      continue;
    }
    if (part !== headline) {
      summaryParts.push(part);
    }
  }

  const experiences = parsePublicExperience(lines);
  const education = parsePublicEducation(lines);
  const summary = summaryParts.join(" ").trim() || headline;

  if (!fullName || (!summary && experiences.length === 0 && education.length === 0)) {
    throw new Error("Could not extract enough data from the public LinkedIn profile.");
  }

  return {
    data: {
      fullName,
      email: "",
      phone: "",
      location,
      linkedIn: normalizedUrl,
      portfolio: "",
      summary,
      skills: [],
      experiences,
      education,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { linkedin_url?: string };
    const authHeader = getAuthorizationHeader(request).Authorization;

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!body.linkedin_url) {
      return NextResponse.json(
        { error: "LinkedIn URL is required" },
        { status: 400 }
      );
    }

    const response = await fetchBackend("/api/v1/resume/linkedin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ linkedin_url: body.linkedin_url }),
    });

    const data = await response.json();

    if (!response.ok) {
      try {
        const fallbackData = await importPublicLinkedInProfile(
          body.linkedin_url
        );
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        return NextResponse.json(
          {
            error:
              data.detail ||
              (fallbackError instanceof Error
                ? fallbackError.message
                : "LinkedIn import failed"),
          },
          { status: response.status }
        );
      }
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to LinkedIn import service" },
      { status: 503 }
    );
  }
}
