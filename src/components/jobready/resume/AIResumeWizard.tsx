"use client";

import { useState } from "react";
import { resumeApi } from "@/lib/api/client";
import type { ResumeData } from "./types";
import "@/app/jobready/jobready.css";

interface Props {
  onComplete: (data: ResumeData) => void;
  onCancel: () => void;
}

interface WizardAnswers {
  targetRole: string;
  experience: string;
  industry: string;
  topSkills: string;
  education: string;
  achievements: string;
}

const QUESTIONS: {
  key: keyof WizardAnswers;
  label: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  {
    key: "targetRole",
    label: "What role are you targeting?",
    placeholder: "e.g. Frontend Developer, Marketing Manager, Data Analyst",
  },
  {
    key: "experience",
    label: "Briefly describe your most recent role and key responsibilities.",
    placeholder:
      "e.g. Software Engineer at Acme Corp — built React dashboards, led migration to TypeScript, mentored 2 junior devs",
    multiline: true,
  },
  {
    key: "industry",
    label: "What industry or field do you work in?",
    placeholder: "e.g. Technology, Healthcare, Finance, Education",
  },
  {
    key: "topSkills",
    label: "List your top skills (comma-separated).",
    placeholder: "e.g. React, TypeScript, Python, Leadership, Data Analysis",
  },
  {
    key: "education",
    label: "What's your highest education?",
    placeholder: "e.g. B.S. Computer Science, University of California, 2020",
  },
  {
    key: "achievements",
    label: "Share 1-2 achievements you're most proud of.",
    placeholder:
      "e.g. Reduced page load time by 40%, Grew team revenue by $200K",
    multiline: true,
  },
];

export default function AIResumeWizard({ onComplete, onCancel }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({
    targetRole: "",
    experience: "",
    industry: "",
    topSkills: "",
    education: "",
    achievements: "",
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const currentQ = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const canProceed = answers[currentQ.key].trim().length > 0;

  const handleNext = async () => {
    if (!isLast) {
      setStep(step + 1);
      return;
    }

    // Generate resume with AI
    setGenerating(true);
    setError("");

    try {
      const prompt = `Generate a complete ATS-friendly resume in JSON format for the following person:
Target Role: ${answers.targetRole}
Recent Experience: ${answers.experience}
Industry: ${answers.industry}
Top Skills: ${answers.topSkills}
Education: ${answers.education}
Key Achievements: ${answers.achievements}

Return ONLY valid JSON with this exact structure:
{
  "fullName": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedIn": "",
  "portfolio": "",
  "summary": "A compelling 2-3 sentence professional summary",
  "skills": ["skill1", "skill2", ...],
  "experiences": [{"id": "exp1", "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "current": false, "highlights": ["bullet1", "bullet2"]}],
  "education": [{"id": "edu1", "degree": "", "institution": "", "location": "", "graduationYear": "", "gpa": ""}]
}

Important:
- Write strong action-verb bullet points with quantifiable results
- Include 8-12 relevant skills for ATS keyword matching
- The summary should highlight key strengths and target the role
- Use industry-standard terminology for better ATS parsing
- Fill in realistic placeholders where info is missing (mark with [Your X])`;

      const result = await resumeApi.chat(prompt, "generate_resume");
      const content =
        typeof result.data === "string"
          ? result.data
          : (result.data as Record<string, unknown>)?.response ||
            (result.data as Record<string, unknown>)?.content ||
            "";

      const text = typeof content === "string" ? content : JSON.stringify(content);

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as ResumeData;
        // Ensure arrays exist
        parsed.skills = parsed.skills || [];
        parsed.experiences = parsed.experiences || [];
        parsed.education = parsed.education || [];
        onComplete(parsed);
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (err) {
      console.error("AI resume generation failed:", err);
      setError(
        "AI generation encountered an issue. Starting with a pre-filled template instead."
      );
      // Fallback: create a template from the answers
      const skills = answers.topSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const fallback: ResumeData = {
        fullName: "[Your Name]",
        email: "[your.email@example.com]",
        phone: "[Your Phone]",
        location: "[Your Location]",
        linkedIn: "",
        portfolio: "",
        summary: `Experienced ${answers.industry} professional targeting ${answers.targetRole} roles. ${answers.achievements || "Passionate about delivering measurable results."}`,
        skills,
        experiences: [
          {
            id: "exp-ai-1",
            title: answers.targetRole || "[Job Title]",
            company: "[Company Name]",
            location: "[City, State]",
            startDate: "",
            endDate: "",
            current: true,
            highlights: answers.experience
              ? answers.experience
                  .split(/[,;.]/)
                  .map((h) => h.trim())
                  .filter((h) => h.length > 5)
              : ["[Describe your key achievement with metrics]"],
          },
        ],
        education: [
          {
            id: "edu-ai-1",
            degree: answers.education || "[Your Degree]",
            institution: "[University Name]",
            location: "[City, State]",
            graduationYear: "",
            gpa: "",
          },
        ],
      };
      setTimeout(() => onComplete(fallback), 1500);
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="jr-ai-wizard">
        <div className="jr-ai-wizard-generating">
          <div className="jr-ai-wizard-spinner" />
          <h2>Generating your resume...</h2>
          <p>
            AI is crafting an ATS-optimized resume based on your answers. This
            usually takes 10-15 seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="jr-ai-wizard">
      <div className="jr-ai-wizard-header">
        <h2>AI Resume Assistant</h2>
        <p>
          Answer {QUESTIONS.length} quick questions and AI will generate a
          complete, ATS-friendly resume for you.
        </p>
        <div className="jr-ai-wizard-progress">
          <div
            className="jr-ai-wizard-progress-bar"
            style={{
              width: `${((step + 1) / QUESTIONS.length) * 100}%`,
            }}
          />
        </div>
        <span className="jr-ai-wizard-step-count">
          {step + 1} of {QUESTIONS.length}
        </span>
      </div>

      <div className="jr-ai-wizard-body">
        <label className="jr-ai-wizard-label">{currentQ.label}</label>
        {currentQ.multiline ? (
          <textarea
            className="jr-input jr-ai-wizard-textarea"
            placeholder={currentQ.placeholder}
            value={answers[currentQ.key]}
            onChange={(e) =>
              setAnswers({ ...answers, [currentQ.key]: e.target.value })
            }
            rows={4}
            autoFocus
          />
        ) : (
          <input
            className="jr-input"
            type="text"
            placeholder={currentQ.placeholder}
            value={answers[currentQ.key]}
            onChange={(e) =>
              setAnswers({ ...answers, [currentQ.key]: e.target.value })
            }
            onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
            autoFocus
          />
        )}
        {error && <p className="jr-input-error-text">{error}</p>}
      </div>

      <div className="jr-ai-wizard-actions">
        <button
          className="jr-btn jr-btn-secondary"
          onClick={step === 0 ? onCancel : () => setStep(step - 1)}
        >
          {step === 0 ? "Back to options" : "Previous"}
        </button>
        <button
          className="jr-btn jr-btn-primary"
          onClick={handleNext}
          disabled={!canProceed}
        >
          {isLast ? "Generate Resume" : "Continue"}
        </button>
      </div>
    </div>
  );
}
