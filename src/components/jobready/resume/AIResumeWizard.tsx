"use client";

import { useState } from "react";
import { resumeApi } from "@/lib/api/client";
import type { ResumeData } from "./types";
import { mapBackendToResumeData } from "./types";
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

    // Generate resume with AI using the backend enhance_cv action
    setGenerating(true);
    setError("");

    const prompt = `Generate a complete ATS-friendly resume as JSON for:
Target Role: ${answers.targetRole}
Recent Experience: ${answers.experience}
Industry: ${answers.industry}
Top Skills: ${answers.topSkills}
Education: ${answers.education}
Key Achievements: ${answers.achievements}

Return ONLY valid JSON with this structure:
{
  "fullName": "[Your Name]",
  "email": "[your.email@example.com]",
  "phone": "[Your Phone]",
  "location": "[City, State]",
  "linkedIn": "",
  "portfolio": "",
  "summary": "A compelling 2-3 sentence professional summary targeting the role",
  "skills": ["skill1", "skill2"],
  "experiences": [{"title": "", "company": "", "location": "", "startDate": "", "endDate": "", "current": false, "highlights": ["achievement with metrics"]}],
  "education": [{"degree": "", "institution": "", "location": "", "graduationYear": "", "gpa": ""}]
}

Write strong action-verb bullet points with quantifiable results. Include 8-12 relevant skills. Use industry-standard terminology.`;

    const result = await resumeApi.chat(prompt, "extract_cv");

    if (result.error) {
      setError(`AI generation failed: ${result.error}. Please try again.`);
      setGenerating(false);
      return;
    }

    // Try structured data first, then parse from reply
    const dataObj = result.data?.data;
    if (dataObj) {
      onComplete(mapBackendToResumeData(dataObj));
      return;
    }

    const reply = result.data?.reply || "";
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        onComplete(mapBackendToResumeData(parsed));
        return;
      } catch {
        // fall through
      }
    }

    setError("AI could not generate structured data. Please try again or start from scratch.");
    setGenerating(false);
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
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
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
        {error && (
          <p className="jr-input-error-text" style={{ marginTop: 8 }}>{error}</p>
        )}
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
