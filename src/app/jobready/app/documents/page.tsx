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
import { mapBackendToResumeData } from "@/components/jobready/resume/types";

type View = "loading" | "choose" | "ai-wizard" | "examples" | "editor" | "uploading" | "importing";

export default function DocumentsPage() {
  const { user, isLoading } = useAuth();
  const [view, setView] = useState<View>("loading");
  const [initialData, setInitialData] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prefer the auth payload to avoid probing the resume endpoint for first-time users.
  useEffect(() => {
    if (isLoading) return;
    if (!user?.cvGenerated) return;

    let cancelled = false;
    (async () => {
      const result = await resumeApi.getLatest();
      if (cancelled) return;
      if (result.data?.data) {
        setInitialData(mapBackendToResumeData(result.data.data));
        setView("editor");
      } else {
        // No resume in DB — show creation options
        setView("choose");
      }
    })();
    return () => { cancelled = true; };
  }, [isLoading, user?.cvGenerated]);

  const resolvedView: View =
    view === "loading" && !isLoading && !user?.cvGenerated ? "choose" : view;

  const startEditor = useCallback((data?: ResumeData) => {
    if (data) setInitialData(data);
    else setInitialData(null);
    setView("editor");
  }, []);

  // Reset: delete from DB, go back to choose
  const handleReset = useCallback(async () => {
    await resumeApi.reset();
    setInitialData(null);
    setView("choose");
  }, []);

  const handleMethodSelect = useCallback(
    (method: CreationMethod) => {
      setError(null);
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
      setView("importing");
      setError(null);
      const result = await resumeApi.importLinkedIn(url);

      if (result.error) {
        setError(`LinkedIn import failed: ${result.error}`);
        setView("choose");
        return;
      }

      const extractedData = result.data?.data;
      if (extractedData) {
        startEditor(mapBackendToResumeData(extractedData));
      } else {
        setError("Could not extract LinkedIn profile data. The profile may be private or the URL incorrect.");
        setView("choose");
      }
    },
    [startEditor]
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      setView("uploading");
      setError(null);
      const result = await resumeApi.uploadCV(file);

      if (result.error) {
        setError(`Upload failed: ${result.error}`);
        setView("choose");
        return;
      }

      if (result.data?.extractedData) {
        startEditor(mapBackendToResumeData(result.data.extractedData));
      } else {
        setError("Could not parse the uploaded file. Try a different format or create from scratch.");
        setView("choose");
      }
    },
    [startEditor]
  );

  if (
    resolvedView === "loading" ||
    resolvedView === "uploading" ||
    resolvedView === "importing"
  ) {
    const msg =
      resolvedView === "uploading" ? "Parsing your resume..." :
      resolvedView === "importing" ? "Importing from LinkedIn..." :
      "Loading...";
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px" }}>
        <div className="jr-ai-wizard-spinner" />
        <p style={{ color: "var(--jr-gray-500)", fontSize: "var(--jr-text-sm)" }}>{msg}</p>
      </div>
    );
  }

  if (resolvedView === "choose") {
    return (
      <>
        {error && (
          <div style={{ maxWidth: 720, margin: "16px auto 0", padding: "12px 16px", background: "var(--jr-error-light)", color: "var(--jr-error)", borderRadius: 8, fontSize: "var(--jr-text-sm)" }}>
            {error}
          </div>
        )}
        <ResumeCreationFlow
          onSelect={handleMethodSelect}
          onLinkedInImport={handleLinkedInImport}
          onFileUpload={handleFileUpload}
        />
      </>
    );
  }

  if (resolvedView === "ai-wizard") {
    return (
      <AIResumeWizard
        onComplete={(data) => startEditor(data)}
        onCancel={() => setView("choose")}
      />
    );
  }

  if (resolvedView === "examples") {
    return (
      <ExampleTemplates
        onSelect={(data) => startEditor(data)}
        onCancel={() => setView("choose")}
      />
    );
  }

  return <ResumeEditor initialData={initialData} onReset={handleReset} />;
}
