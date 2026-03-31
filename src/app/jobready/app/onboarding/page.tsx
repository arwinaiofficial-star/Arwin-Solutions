"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Step = 1 | 2 | 3;
type Goal = "job" | "resume" | "career" | null;
type Experience = "fresh" | "mid" | "senior" | null;
type StartMethod = "upload" | "build" | "search" | null;

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
    if (step > 1) setStep((step - 1) as Step);
  };

  const completeOnboarding = () => {
    if (startMethod === "upload" || startMethod === "build") {
      router.push("/jobready/app/documents");
    } else if (startMethod === "search") {
      router.push("/jobready/app/jobs");
    }
  };

  const canContinue =
    (step === 1 && goal) ||
    (step === 2 && experience) ||
    (step === 3 && startMethod);

  return (
    <div className="jr-onboarding">
      <div className="jr-onboarding-container">
        {/* Progress Dots */}
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

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="jr-onboarding-step">
            <div className="jr-onboarding-emoji">💼</div>
            <h1 className="jr-onboarding-title">What brings you here?</h1>
            <p className="jr-onboarding-text">
              Tell us what you'd like to focus on
            </p>
            <div className="jr-onboarding-options">
              {[
                {
                  id: "job",
                  icon: "💼",
                  title: "Looking for a job",
                  desc: "I want to find and apply to jobs",
                },
                {
                  id: "resume",
                  icon: "📄",
                  title: "Updating my resume",
                  desc: "I need a polished, ATS-friendly resume",
                },
                {
                  id: "career",
                  icon: "🧭",
                  title: "Exploring career options",
                  desc: "I'm considering a career change",
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  className={`jr-onboarding-option ${
                    goal === opt.id ? "jr-onboarding-option-selected" : ""
                  }`}
                  onClick={() => setGoal(opt.id as Goal)}
                >
                  <span className="jr-onboarding-option-icon">{opt.icon}</span>
                  <div className="jr-onboarding-option-content">
                    <div className="jr-onboarding-option-title">{opt.title}</div>
                    <div className="jr-onboarding-option-desc">{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="jr-onboarding-step">
            <div className="jr-onboarding-emoji">📊</div>
            <h1 className="jr-onboarding-title">What's your experience level?</h1>
            <p className="jr-onboarding-text">
              This helps us personalize your journey
            </p>
            <div className="jr-onboarding-options">
              {[
                {
                  id: "fresh",
                  icon: "🎓",
                  title: "Fresh graduate / Student",
                  desc: "Less than 2 years of experience",
                },
                {
                  id: "mid",
                  icon: "💻",
                  title: "Mid-career professional",
                  desc: "2-10 years of experience",
                },
                {
                  id: "senior",
                  icon: "⭐",
                  title: "Senior / Leadership",
                  desc: "10+ years of experience",
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  className={`jr-onboarding-option ${
                    experience === opt.id
                      ? "jr-onboarding-option-selected"
                      : ""
                  }`}
                  onClick={() => setExperience(opt.id as Experience)}
                >
                  <span className="jr-onboarding-option-icon">{opt.icon}</span>
                  <div className="jr-onboarding-option-content">
                    <div className="jr-onboarding-option-title">{opt.title}</div>
                    <div className="jr-onboarding-option-desc">{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Start Method */}
        {step === 3 && (
          <div className="jr-onboarding-step">
            <div className="jr-onboarding-emoji">🚀</div>
            <h1 className="jr-onboarding-title">How would you like to start?</h1>
            <p className="jr-onboarding-text">
              Choose what works best for you
            </p>
            <div className="jr-onboarding-options">
              {[
                {
                  id: "upload",
                  icon: "📤",
                  title: "Upload my resume",
                  desc: "I have an existing resume to import",
                },
                {
                  id: "build",
                  icon: "✏️",
                  title: "Build from scratch",
                  desc: "I'll create a new resume step by step",
                },
                {
                  id: "search",
                  icon: "🔍",
                  title: "Search jobs first",
                  desc: "I want to browse opportunities",
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  className={`jr-onboarding-option ${
                    startMethod === opt.id
                      ? "jr-onboarding-option-selected"
                      : ""
                  }`}
                  onClick={() => setStartMethod(opt.id as StartMethod)}
                >
                  <span className="jr-onboarding-option-icon">{opt.icon}</span>
                  <div className="jr-onboarding-option-content">
                    <div className="jr-onboarding-option-title">{opt.title}</div>
                    <div className="jr-onboarding-option-desc">{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
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
            {step === 3 ? "Get Started" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
