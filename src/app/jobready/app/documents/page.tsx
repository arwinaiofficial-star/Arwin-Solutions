"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { resumeApi } from "@/lib/api/client";
import { ResumeEditor } from "@/components/jobready/resume";
import ResumeCreationFlow from "@/components/jobready/resume/ResumeCreationFlow";
import AIResumeWizard from "@/components/jobready/resume/AIResumeWizard";
import ExampleTemplates from "@/components/jobready/resume/ExampleTemplates";
import type { ResumeData } from "@/components/jobready/resume/types";
import type { CreationMethod } from "@/components/jobready/resume/ResumeCreationFlow";

type View = "loading" | "choose" | "ai-wizard" | "examples" | "editor";

export default function DocumentsPage() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("loading");
  const [initialData, setInitialData] = useState<ResumeData | null>(null);

  // Check if user already has resume data
  useEffect(() => {
    if (user === undefined) return; // still loading auth
    const hasResume = !!user?.cvData || !!user?.cvGenerated;
    if (hasResume) {
      setView("editor");
    } else {
      setView("choose");
    }
  }, [user]);

  const startEditor = useCallback((data?: ResumeData) => {
    if (data) setInitialData(data);
    setView("editor");
  }, []);

  const handleMethodSelect = useCallback(
    (method: CreationMethod) => {
      switch (method) {
        case "new":
          startEditor();
          break;
        case "ai-assisted":
          setView("ai-wizard");
          break;
        case "example":
          setView("examples");
          break;
        default:
          startEditor();
      }
    },
    [startEditor]
  );

  const handleLinkedInImport = useCallback(
    async (url: string) => {
      try {
        const result = await resumeApi.chat(
          `Extract resume data from this LinkedIn profile URL: ${url}`,
          "linkedin_import"
        );
        const content =
          typeof result.data === "string"
            ? result.data
            : (result.data as Record<string, unknown>)?.response || "";
        const text = typeof content === "string" ? content : JSON.stringify(content);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as ResumeData;
          startEditor(parsed);
        } else {
          // Fallback — just start editor
          startEditor();
        }
      } catch {
        startEditor();
      }
    },
    [startEditor]
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        const result = await resumeApi.uploadCV(file);
        if (result.data) {
          const cv = result.data as Record<string, unknown>;
          const pi = (cv.personalInfo ?? {}) as Record<string, string>;
          const parsed: ResumeData = {
            fullName: pi.name || "",
            email: pi.email || "",
            phone: pi.phone || "",
            location: pi.location || "",
            linkedIn: pi.linkedIn || "",
            portfolio: pi.portfolio || "",
            summary: (cv.summary as string) || "",
            skills: (cv.skills as string[]) || [],
            experiences: (cv.experience as ResumeData["experiences"]) || [],
            education: (cv.education as ResumeData["education"]) || [],
          };
          startEditor(parsed);
        } else {
          startEditor();
        }
      } catch {
        startEditor();
      }
    },
    [startEditor]
  );

  if (view === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--jr-gray-400)" }}>Loading...</p>
      </div>
    );
  }

  if (view === "choose") {
    return (
      <ResumeCreationFlow
        onSelect={handleMethodSelect}
        onLinkedInImport={handleLinkedInImport}
        onFileUpload={handleFileUpload}
      />
    );
  }

  if (view === "ai-wizard") {
    return (
      <AIResumeWizard
        onComplete={(data) => startEditor(data)}
        onCancel={() => setView("choose")}
      />
    );
  }

  if (view === "examples") {
    return (
      <ExampleTemplates
        onSelect={(data) => startEditor(data)}
        onCancel={() => setView("choose")}
      />
    );
  }

  return <ResumeEditor initialData={initialData} />;
}
