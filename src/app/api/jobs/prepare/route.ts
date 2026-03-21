import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobTitle, jobDescription, jobCompany, jobLocation, cvData } = body;

    if (!jobTitle || !cvData) {
      return NextResponse.json(
        { error: "Job details and CV data are required" },
        { status: 400 }
      );
    }

    const token = request.headers.get("authorization");

    // Use the resume chat endpoint with a special action
    const response = await fetch(`${BACKEND_URL}/api/v1/resume/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify({
        message: `Prepare application tips for this job:
Job Title: ${jobTitle}
Company: ${jobCompany || "Not specified"}
Location: ${jobLocation || "Not specified"}
Job Description: ${jobDescription?.slice(0, 1000) || "Not available"}`,
        action: "chat",
        context: {
          cv_skills: cvData.skills || [],
          cv_experience: cvData.experience || [],
          cv_summary: cvData.summary || "",
          cv_name: cvData.personalInfo?.name || "",
          task: "prepare_application",
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();

      // Parse the LLM response into structured tips
      const tips = parseApplicationTips(data.reply, cvData, jobTitle, jobDescription || "");

      return NextResponse.json({ success: true, ...tips });
    }

    // Fallback: generate tips locally
    const tips = generateLocalTips(cvData, jobTitle, jobDescription || "", jobCompany || "");
    return NextResponse.json({ success: true, ...tips });
  } catch (error) {
    logger.error("Prepare apply error", {
      error: error instanceof Error ? error.message : "Unknown",
    });

    return NextResponse.json(
      { error: "Failed to generate application tips" },
      { status: 500 }
    );
  }
}

function parseApplicationTips(
  aiResponse: string,
  cvData: { skills?: string[]; experience?: { title: string; company: string }[]; personalInfo?: { name: string } },
  jobTitle: string,
  jobDescription: string,
) {
  const cvSkills = (cvData.skills || []).map((s: string) => s.toLowerCase());
  const descLower = (jobTitle + " " + jobDescription).toLowerCase();

  const matchedSkills = cvData.skills?.filter((s: string) => descLower.includes(s.toLowerCase())) || [];
  const missingSkills = cvData.skills?.filter((s: string) => !descLower.includes(s.toLowerCase())).slice(0, 3) || [];

  return {
    aiTips: aiResponse,
    matchedSkills,
    missingSkills,
    matchScore: cvSkills.length > 0
      ? Math.round((matchedSkills.length / cvSkills.length) * 100)
      : 0,
    coverLetterSnippet: generateCoverLetterSnippet(cvData, jobTitle),
  };
}

function generateLocalTips(
  cvData: { skills?: string[]; experience?: { title: string; company: string }[]; personalInfo?: { name: string }; summary?: string },
  jobTitle: string,
  jobDescription: string,
  company: string,
) {
  const cvSkills = (cvData.skills || []).map((s: string) => s.toLowerCase());
  const descLower = (jobTitle + " " + jobDescription).toLowerCase();

  const matchedSkills = cvData.skills?.filter((s: string) => descLower.includes(s.toLowerCase())) || [];
  const missingSkills = cvData.skills?.filter((s: string) => !descLower.includes(s.toLowerCase())).slice(0, 3) || [];

  const tips = [
    matchedSkills.length > 0
      ? `Your skills in ${matchedSkills.slice(0, 3).join(", ")} are directly relevant to this role.`
      : "Consider highlighting transferable skills in your application.",
    `Tailor your resume summary to emphasize your fit for the ${jobTitle} position.`,
    company ? `Research ${company}'s recent projects and mention them in your cover letter.` : "",
    "Quantify your achievements with specific metrics where possible.",
    "Follow up within a week of applying to show genuine interest.",
  ].filter(Boolean);

  return {
    aiTips: tips.join("\n\n"),
    matchedSkills,
    missingSkills,
    matchScore: cvSkills.length > 0
      ? Math.round((matchedSkills.length / cvSkills.length) * 100)
      : 0,
    coverLetterSnippet: generateCoverLetterSnippet(cvData, jobTitle),
  };
}

function generateCoverLetterSnippet(
  cvData: { personalInfo?: { name: string }; skills?: string[]; experience?: { title: string; company: string }[] },
  jobTitle: string,
) {
  const name = cvData.personalInfo?.name || "the candidate";
  const topSkills = (cvData.skills || []).slice(0, 3).join(", ");
  const latestRole = cvData.experience?.[0];

  let snippet = `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position.`;

  if (latestRole) {
    snippet += ` With my experience as ${latestRole.title} at ${latestRole.company}`;
  }

  if (topSkills) {
    snippet += `, and expertise in ${topSkills}`;
  }

  snippet += `, I am confident I can make a meaningful contribution to your team.\n\n`;
  snippet += `I would welcome the opportunity to discuss how my background aligns with your needs.\n\nBest regards,\n${name}`;

  return snippet;
}
