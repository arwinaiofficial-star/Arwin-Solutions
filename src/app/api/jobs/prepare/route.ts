import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";
import { fetchBackend } from "@/lib/api/backend";
import { buildSafeCoverLetterSnippet, computeResumeJobMatch, ResumeMatchData } from "@/lib/jobMatch";

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
    const response = await fetchBackend("/api/v1/resume/chat", {
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
      const tips = parseApplicationTips(data.reply, cvData, jobTitle, jobDescription || "", jobCompany || "");

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
  cvData: ResumeMatchData,
  jobTitle: string,
  jobDescription: string,
  jobCompany: string,
) {
  const insights = computeResumeJobMatch(cvData, {
    title: jobTitle,
    description: jobDescription,
  });

  return {
    aiTips: aiResponse,
    matchedSkills: insights.matchedSkills,
    missingSkills: insights.missingKeywords,
    matchScore: insights.matchScore,
    coverLetterSnippet: generateCoverLetterSnippet(cvData, jobTitle, jobCompany),
  };
}

function generateLocalTips(
  cvData: ResumeMatchData,
  jobTitle: string,
  jobDescription: string,
  company: string,
) {
  const insights = computeResumeJobMatch(cvData, {
    title: jobTitle,
    description: jobDescription,
  });

  const tips = [
    insights.matchedSkills.length > 0
      ? `Your background in ${insights.matchedSkills.slice(0, 3).join(", ")} maps directly to this role.`
      : "Consider highlighting transferable skills in your application.",
    `Tailor your resume summary to emphasize your fit for the ${jobTitle} position.`,
    company ? `Research ${company}'s recent projects and mention them in your cover letter.` : "",
    insights.missingKeywords.length > 0
      ? `Address missing job keywords like ${insights.missingKeywords.slice(0, 3).join(", ")} where you can support them honestly.`
      : "",
    "Quantify your achievements with specific metrics where possible.",
    "Follow up within a week of applying to show genuine interest.",
  ].filter(Boolean);

  return {
    aiTips: tips.join("\n\n"),
    matchedSkills: insights.matchedSkills,
    missingSkills: insights.missingKeywords,
    matchScore: insights.matchScore,
    coverLetterSnippet: generateCoverLetterSnippet(cvData, jobTitle, company),
  };
}

function generateCoverLetterSnippet(
  cvData: ResumeMatchData,
  jobTitle: string,
  company: string,
) {
  return buildSafeCoverLetterSnippet(cvData, jobTitle, company);
}
