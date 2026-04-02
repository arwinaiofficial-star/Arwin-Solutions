"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
    text: "We’ll use this to choose the right first screen and keep the workspace focused.",
    options: [
      {
        id: "job",
        icon: SearchIcon,
        title: "I’m actively looking for a job",
        desc: "I want to improve my profile and start finding roles quickly.",
      },
      {
        id: "resume",
        icon: DocumentIcon,
        title: "I need to fix or rebuild my resume",
        desc: "I want an ATS-friendly document before I start applying.",
      },
      {
        id: "career",
        icon: SparklesIcon,
        title: "I’m exploring career direction",
        desc: "I want guidance on the right kinds of roles to target next.",
      },
    ],
  },
  2: {
    icon: SparklesIcon,
    title: "What’s your current experience level?",
    text: "This helps us tune the guidance, prompts, and the first actions we recommend.",
    options: [
      {
        id: "fresh",
        icon: DocumentIcon,
        title: "Student or early-career",
        desc: "Less than 2 years of experience and building early career momentum.",
      },
      {
        id: "mid",
        icon: BriefcaseIcon,
        title: "Mid-career professional",
        desc: "2 to 10 years of experience and ready for stronger role targeting.",
      },
      {
        id: "senior",
        icon: ArrowRightIcon,
        title: "Senior or leadership",
        desc: "10+ years of experience and optimizing for scope, impact, or transition.",
      },
    ],
  },
  3: {
    icon: ArrowRightIcon,
    title: "How do you want to start?",
    text: "Choose the fastest path into the redesigned workflow.",
    options: [
      {
        id: "upload",
        icon: DocumentIcon,
        title: "Upload an existing resume",
        desc: "Bring in what you already have and refine it inside the editor.",
      },
      {
        id: "build",
        icon: SparklesIcon,
        title: "Build from scratch",
        desc: "Use the guided editor and AI help to create a stronger profile.",
      },
      {
        id: "search",
        icon: SearchIcon,
        title: "Browse jobs first",
        desc: "Start discovering roles and come back to tailor the resume afterwards.",
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
