"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { markOnboardingCompleted } from "@/lib/jobreadyOnboarding";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  DocumentIcon,
  SearchIcon,
  SparklesIcon,
} from "@/components/icons/Icons";

type Step = 1 | 2 | 3;
type Goal = "job" | "resume" | "career" | null;
type Experience = "fresh" | "mid" | "senior" | null;
type StartMethod = "upload" | "build" | "search" | null;

const STEP_CONTENT = {
  1: {
    icon: BriefcaseIcon,
    title: "What brings you to JobReady?",
    text: "Choose your starting point.",
    options: [
      {
        id: "job",
        icon: SearchIcon,
        title: "I’m actively looking for a job",
        desc: "I want to find roles and start applying soon.",
      },
      {
        id: "resume",
        icon: DocumentIcon,
        title: "I need to fix or rebuild my resume",
        desc: "I want to finish my resume before I apply.",
      },
      {
        id: "career",
        icon: SparklesIcon,
        title: "I’m exploring career direction",
        desc: "I want help deciding what roles to target.",
      },
    ],
  },
  2: {
    icon: SparklesIcon,
    title: "What’s your current experience level?",
    text: "This helps us choose the right defaults.",
    options: [
      {
        id: "fresh",
        icon: DocumentIcon,
        title: "Student or early-career",
        desc: "Less than 2 years of experience.",
      },
      {
        id: "mid",
        icon: BriefcaseIcon,
        title: "Mid-career professional",
        desc: "2 to 10 years of experience.",
      },
      {
        id: "senior",
        icon: ArrowRightIcon,
        title: "Senior or leadership",
        desc: "10+ years of experience.",
      },
    ],
  },
  3: {
    icon: ArrowRightIcon,
    title: "How do you want to start?",
    text: "Pick the first screen you want to use.",
    options: [
      {
        id: "upload",
        icon: DocumentIcon,
        title: "Upload an existing resume",
        desc: "Import your current resume and edit it here.",
      },
      {
        id: "build",
        icon: SparklesIcon,
        title: "Build from scratch",
        desc: "Start with an empty resume and fill it section by section.",
      },
      {
        id: "search",
        icon: SearchIcon,
        title: "Browse jobs first",
        desc: "Search first and come back to the resume later.",
      },
    ],
  },
} as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [goal, setGoal] = useState<Goal>(null);
  const [experience, setExperience] = useState<Experience>(null);
  const [startMethod, setStartMethod] = useState<StartMethod>(null);

  const handleNext = () => {
    if (step === 1 && goal) {
      setStep(2);
    } else if (step === 2 && experience) {
      setStep(3);
    } else if (step === 3 && startMethod) {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const completeOnboarding = () => {
    markOnboardingCompleted(user?.id);
    if (startMethod === "upload" || startMethod === "build") {
      router.push("/jobready/app/documents");
      return;
    }
    router.push("/jobready/app/jobs");
  };

  const canContinue =
    (step === 1 && goal) ||
    (step === 2 && experience) ||
    (step === 3 && startMethod);

  const current = STEP_CONTENT[step];
  const Icon = current.icon;

  return (
    <div className="jr-onboarding">
      <div className="jr-onboarding-container">
        <div className="jr-onboarding-progress">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`jr-onboarding-dot ${
                num < step ? "jr-onboarding-dot-completed" : ""
              } ${num === step ? "jr-onboarding-dot-active" : ""}`}
            />
          ))}
        </div>

        <div className="jr-onboarding-step">
          <div className="jr-onboarding-emoji">
            <Icon size={22} />
          </div>
          <h1 className="jr-onboarding-title">
            {user?.name ? `${user.name.split(" ")[0]}, ${current.title}` : current.title}
          </h1>
          <p className="jr-onboarding-text">{current.text}</p>

          <div className="jr-onboarding-options">
            {current.options.map((opt) => {
              const OptionIcon = opt.icon;
              const isSelected =
                (step === 1 && goal === opt.id) ||
                (step === 2 && experience === opt.id) ||
                (step === 3 && startMethod === opt.id);

              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`jr-onboarding-option ${isSelected ? "jr-onboarding-option-selected" : ""}`}
                  onClick={() => {
                    if (step === 1) setGoal(opt.id as Goal);
                    if (step === 2) setExperience(opt.id as Experience);
                    if (step === 3) setStartMethod(opt.id as StartMethod);
                  }}
                >
                  <span className="jr-onboarding-option-icon">
                    <OptionIcon size={18} />
                  </span>
                  <div className="jr-onboarding-option-content">
                    <div className="jr-onboarding-option-title">{opt.title}</div>
                    <div className="jr-onboarding-option-desc">{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="jr-onboarding-actions">
          {step > 1 && (
            <button className="jr-btn jr-btn-secondary" onClick={handleBack}>
              Back
            </button>
          )}
          <button
            className="jr-btn jr-btn-primary"
            onClick={handleNext}
            disabled={!canContinue}
          >
            {step === 3 ? "Enter workspace" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
