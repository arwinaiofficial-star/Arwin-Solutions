"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import ResumeWizard, {
  type ResumeData,
  type ResumeTheme,
  type ResumeWizardHandle,
} from "@/components/jobready/ResumeWizard";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckIcon,
  DocumentIcon,
  SearchIcon,
  SparklesIcon,
} from "@/components/icons/Icons";

type VariantId = "master" | "product" | "engineering" | "leadership";

type VariantSnapshot = {
  data: ResumeData;
  theme: ResumeTheme;
  updatedAt: string;
  atsScore: number | null;
};

const templates: Array<{
  id: ResumeTheme;
  label: string;
  accent: string;
  summary: string;
  useCase: string;
}> = [
  {
    id: "classic",
    label: "Classic",
    accent: "rgba(59,130,246,0.22)",
    summary: "Balanced for ATS readability and broad hiring workflows.",
    useCase: "Base resume and cross-functional applications",
  },
  {
    id: "modern",
    label: "Studio",
    accent: "rgba(8,145,178,0.22)",
    summary: "Stronger visual hierarchy for modern digital roles.",
    useCase: "Product, design, analytics, growth",
  },
  {
    id: "minimal",
    label: "Minimal",
    accent: "rgba(148,163,184,0.22)",
    summary: "Tighter executive presentation with less ornamentation.",
    useCase: "Senior IC, leadership, consulting-style briefs",
  },
];

const variantDefinitions: Array<{
  id: VariantId;
  label: string;
  description: string;
  goal: string;
  theme: ResumeTheme;
}> = [
  {
    id: "master",
    label: "Master Resume",
    description: "The source-of-truth version with the full factual career story.",
    goal: "Keep this broad, complete, and reusable.",
    theme: "classic",
  },
  {
    id: "product",
    label: "Product Variant",
    description: "Prioritize cross-functional delivery, customer insight, and roadmap execution.",
    goal: "Use when targeting PM, strategy, growth, or ops roles.",
    theme: "modern",
  },
  {
    id: "engineering",
    label: "Engineering Variant",
    description: "Lead with depth, systems ownership, stack evidence, and delivery outcomes.",
    goal: "Use when targeting backend, frontend, platform, or full-stack roles.",
    theme: "classic",
  },
  {
    id: "leadership",
    label: "Leadership Variant",
    description: "Compress detail and elevate scope, metrics, and org-level impact.",
    goal: "Use for staff, manager, principal, or consulting conversations.",
    theme: "minimal",
  },
];

function hasMeaningfulData(data: ResumeData | null) {
  if (!data) return false;
  return Boolean(
    data.fullName.trim() ||
    data.summary.trim() ||
    data.skills.length ||
    data.experiences.some((item) => item.title.trim() || item.company.trim())
  );
}

function formatRelativeDate(iso?: string) {
  if (!iso) return "Not saved yet";
  const date = new Date(iso);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DocumentStudio() {
  const { user } = useAuth();
  const wizardRef = useRef<ResumeWizardHandle | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTheme>("classic");
  const [selectedVariant, setSelectedVariant] = useState<VariantId>("master");
  const [latestData, setLatestData] = useState<ResumeData | null>(null);
  const [atsState, setAtsState] = useState<{ score: number | null; feedback: string[] }>({
    score: null,
    feedback: [],
  });
  const [variantSnapshots, setVariantSnapshots] = useState<Record<string, VariantSnapshot>>({});

  const selectedVariantDefinition = useMemo(
    () => variantDefinitions.find((item) => item.id === selectedVariant) || variantDefinitions[0],
    [selectedVariant]
  );

  const attachHandle = useCallback((handle: ResumeWizardHandle) => {
    wizardRef.current = handle;
  }, []);

  const applyTemplate = useCallback((theme: ResumeTheme) => {
    setSelectedTemplate(theme);
    wizardRef.current?.setTheme(theme);
    setVariantSnapshots((prev) => {
      const current = prev[selectedVariant];
      if (!current) return prev;
      return {
        ...prev,
        [selectedVariant]: {
          ...current,
          theme,
        },
      };
    });
    trackEvent("jobready_document_template_selected", {
      template: theme,
      variant: selectedVariant,
    });
  }, [selectedVariant]);

  const saveCurrentVariant = useCallback(() => {
    const currentData = wizardRef.current?.getData() || latestData;
    if (!hasMeaningfulData(currentData)) return;

    setVariantSnapshots((prev) => ({
      ...prev,
      [selectedVariant]: {
        data: currentData!,
        theme: selectedTemplate,
        updatedAt: new Date().toISOString(),
        atsScore: atsState.score,
      },
    }));
    trackEvent("jobready_document_variant_saved", {
      variant: selectedVariant,
      template: selectedTemplate,
      atsScore: atsState.score,
    });
  }, [atsState.score, latestData, selectedTemplate, selectedVariant]);

  const loadVariant = useCallback((variantId: VariantId) => {
    setSelectedVariant(variantId);
    const nextSnapshot = variantSnapshots[variantId];
    const nextTheme = nextSnapshot?.theme || variantDefinitions.find((item) => item.id === variantId)?.theme || "classic";
    setSelectedTemplate(nextTheme);
    wizardRef.current?.setTheme(nextTheme);
    if (nextSnapshot) {
      wizardRef.current?.replaceData(nextSnapshot.data);
    }
    trackEvent("jobready_document_variant_opened", {
      variant: variantId,
      hasSnapshot: Boolean(nextSnapshot),
    });
  }, [variantSnapshots]);

  const nextActionLabel = user?.cvGenerated ? "Push this variant into Job Search" : "Finish the baseline resume";
  const selectedSnapshot = variantSnapshots[selectedVariant];
  const handleDataChange = useCallback((nextData: ResumeData) => {
    setLatestData(nextData);
    if (!hasMeaningfulData(nextData)) return;
    setVariantSnapshots((prev) => {
      if (prev.master) return prev;
      return {
        ...prev,
        master: {
          data: nextData,
          theme: "classic",
          updatedAt: new Date().toISOString(),
          atsScore: null,
        },
      };
    });
  }, []);

  return (
    <>
      <style>{documentStudioStyles}</style>
      <section className="ds-shell">
        <div className="ds-hero">
          <div>
            <span className="ds-eyebrow">Documents studio</span>
            <h2>Build the document system once, then create role-specific variants from it.</h2>
            <p>
              This workspace now separates template choice, variant management, and resume editing. The goal is a cleaner
              enterprise flow: one factual base, several intentional variants, and clearer handoff into job targeting.
            </p>
          </div>
          <div className="ds-hero-actions">
            <button className="ds-primary-btn" onClick={saveCurrentVariant}>
              <DocumentIcon size={15} />
              Save Current Variant
            </button>
            <Link className="ds-secondary-btn" href="/jobready/app/jobs">
              <BriefcaseIcon size={15} />
              {nextActionLabel}
            </Link>
          </div>
        </div>

        <div className="ds-grid ds-grid-3">
          <article className="ds-card">
            <span className="ds-eyebrow">Current variant</span>
            <strong>{selectedVariantDefinition.label}</strong>
            <p>{selectedVariantDefinition.description}</p>
            <div className="ds-meta-row">
              <span>{selectedVariantDefinition.goal}</span>
            </div>
          </article>
          <article className="ds-card">
            <span className="ds-eyebrow">ATS baseline</span>
            <strong>{atsState.score !== null ? `${atsState.score}/100` : "Run ATS review from Preview"}</strong>
            <p>
              {atsState.feedback[0] || "Use Preview to validate keyword coverage before you push a variant into active applications."}
            </p>
          </article>
          <article className="ds-card">
            <span className="ds-eyebrow">System rule</span>
            <strong>No disconnected document artifacts.</strong>
            <p>Variants should inherit from the same factual story, then get sharper for one hiring motion at a time.</p>
          </article>
        </div>

        <div className="ds-stack">
          <div className="ds-section-header">
            <div>
              <span className="ds-eyebrow">Template system</span>
              <h3>Choose a presentation model with a real use case.</h3>
            </div>
          </div>
          <div className="ds-grid ds-grid-3">
            {templates.map((template) => (
              <button
                key={template.id}
                className={`ds-template-card ${selectedTemplate === template.id ? "ds-template-card-active" : ""}`}
                style={{ background: `linear-gradient(135deg, ${template.accent}, rgba(7,18,31,0.78))` }}
                onClick={() => applyTemplate(template.id)}
              >
                <span className="ds-eyebrow">{template.label}</span>
                <strong>{template.summary}</strong>
                <p>{template.useCase}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="ds-stack">
          <div className="ds-section-header">
            <div>
              <span className="ds-eyebrow">Document variants</span>
              <h3>Keep focused versions instead of rewriting from scratch.</h3>
            </div>
          </div>
          <div className="ds-grid ds-grid-2">
            {variantDefinitions.map((variant) => {
              const snapshot = variantSnapshots[variant.id];
              const isActive = selectedVariant === variant.id;

              return (
                <button
                  key={variant.id}
                  className={`ds-variant-card ${isActive ? "ds-variant-card-active" : ""}`}
                  onClick={() => loadVariant(variant.id)}
                >
                  <div className="ds-variant-top">
                    <div>
                      <span className="ds-eyebrow">{variant.label}</span>
                      <strong>{snapshot ? "Saved and reusable" : "Blueprint ready"}</strong>
                    </div>
                    {snapshot ? <CheckIcon size={16} /> : <SparklesIcon size={16} />}
                  </div>
                  <p>{variant.description}</p>
                  <div className="ds-variant-meta">
                    <span>{variant.goal}</span>
                    <span>{snapshot ? formatRelativeDate(snapshot.updatedAt) : "No snapshot yet"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="ds-grid ds-grid-2">
          <article className="ds-card">
            <span className="ds-eyebrow">Current snapshot</span>
            <strong>{selectedSnapshot ? "Variant state saved" : "Save this variant after editing"}</strong>
            <p>
              {selectedSnapshot
                ? `Last saved on ${formatRelativeDate(selectedSnapshot.updatedAt)} using the ${selectedSnapshot.theme} template.`
                : "Use the save action above once the summary, skills order, and experience framing fit the target role."}
            </p>
          </article>
          <article className="ds-card">
            <span className="ds-eyebrow">Workflow handoff</span>
            <strong>Documents should feed search and tailoring, not compete with them.</strong>
            <p>Once a variant is saved, move into Job Search Hub to set one target role and continue the flow.</p>
            <Link className="ds-inline-link" href="/jobready/app/jobs">
              Open Job Search Hub
              <ArrowRightIcon size={14} />
            </Link>
          </article>
        </div>

        <ResumeWizard
          handleRef={attachHandle}
          initialTheme={selectedTemplate}
          onThemeChange={(theme) => setSelectedTemplate(theme)}
          onDataChange={handleDataChange}
          onATSComplete={(result) => setAtsState(result)}
          onSaveComplete={({ status, data, cv }) => {
            trackEvent("jobready_document_wizard_saved", {
              status,
              template: selectedTemplate,
              variant: selectedVariant,
              skillCount: data.skills.length,
              experienceCount: data.experiences.length,
              hasSummary: Boolean(cv.summary),
            });
          }}
        />

        <div className="ds-footer-note">
          <SearchIcon size={15} />
          <span>Resume drafts can stay local temporarily, but tracker, chat, and application state now require the live platform backend.</span>
        </div>
      </section>
    </>
  );
}

const documentStudioStyles = `
  .ds-shell {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .ds-hero,
  .ds-card,
  .ds-template-card,
  .ds-variant-card {
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 24px;
    background: rgba(7, 18, 31, 0.74);
    box-shadow: 0 20px 44px rgba(2, 8, 23, 0.2);
  }
  .ds-hero {
    padding: 24px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 18px;
    align-items: end;
  }
  .ds-hero h2,
  .ds-section-header h3 {
    margin: 10px 0 8px;
    color: #fff;
  }
  .ds-hero p,
  .ds-card p,
  .ds-template-card p,
  .ds-variant-card p {
    margin: 0;
    color: #9fb3c8;
  }
  .ds-hero-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .ds-primary-btn,
  .ds-secondary-btn,
  .ds-inline-link,
  .ds-template-card,
  .ds-variant-card {
    transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  }
  .ds-primary-btn,
  .ds-secondary-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 999px;
    font-weight: 700;
    border: 1px solid rgba(125, 211, 252, 0.22);
  }
  .ds-primary-btn {
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    color: #fff;
  }
  .ds-secondary-btn,
  .ds-inline-link {
    background: rgba(7, 18, 31, 0.72);
    color: #dbeafe;
    text-decoration: none;
  }
  .ds-grid {
    display: grid;
    gap: 16px;
  }
  .ds-grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .ds-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .ds-card,
  .ds-template-card,
  .ds-variant-card {
    padding: 20px;
  }
  .ds-card strong,
  .ds-template-card strong,
  .ds-variant-card strong {
    display: block;
    margin: 10px 0 8px;
    color: #fff;
  }
  .ds-template-card,
  .ds-variant-card {
    text-align: left;
    cursor: pointer;
  }
  .ds-template-card:hover,
  .ds-template-card-active,
  .ds-variant-card:hover,
  .ds-variant-card-active {
    transform: translateY(-2px);
    border-color: rgba(125, 211, 252, 0.28);
  }
  .ds-variant-top,
  .ds-meta-row,
  .ds-variant-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .ds-variant-meta,
  .ds-meta-row {
    margin-top: 14px;
    color: #8fa4bc;
    font-size: 0.88rem;
  }
  .ds-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .ds-section-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: end;
  }
  .ds-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 0.7rem;
    font-weight: 700;
    color: #7dd3fc;
  }
  .ds-inline-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    margin-top: 14px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.16);
  }
  .ds-footer-note {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #9fb3c8;
    font-size: 0.9rem;
  }
  @media (max-width: 1080px) {
    .ds-grid-3 {
      grid-template-columns: 1fr;
    }
    .ds-hero {
      grid-template-columns: 1fr;
      align-items: start;
    }
    .ds-hero-actions {
      justify-content: flex-start;
    }
  }
  @media (max-width: 920px) {
    .ds-grid-2 {
      grid-template-columns: 1fr;
    }
  }
`;
