"use client";

import { useId, useRef, useState, type ComponentType } from "react";
import {
  ArrowRightIcon,
  DocumentIcon,
  PlusIcon,
  SparklesIcon,
  UploadIcon,
  UserIcon,
} from "@/components/icons/Icons";
import "@/app/jobready/jobready.css";

export type CreationMethod =
  | "new"
  | "ai-assisted"
  | "upload"
  | "linkedin"
  | "example";

interface Props {
  onSelect: (method: CreationMethod) => void;
  onLinkedInImport: (url: string) => void;
  onFileUpload: (file: File) => void;
}

const METHODS: {
  id: CreationMethod;
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
  tag?: string;
}[] = [
  {
    id: "new",
    icon: PlusIcon,
    title: "Start from scratch",
    desc: "Write it section by section in the editor.",
  },
  {
    id: "ai-assisted",
    icon: SparklesIcon,
    title: "Create with AI",
    desc: "Answer a few questions and generate a first draft.",
    tag: "Recommended",
  },
  {
    id: "upload",
    icon: UploadIcon,
    title: "Upload existing resume",
    desc: "Import a PDF or DOCX into the editor.",
  },
  {
    id: "linkedin",
    icon: UserIcon,
    title: "Import from LinkedIn",
    desc: "Pull your public profile into the editor.",
  },
  {
    id: "example",
    icon: DocumentIcon,
    title: "Start from an example",
    desc: "Open a template and replace the sample content.",
  },
];

export default function ResumeCreationFlow({
  onSelect,
  onLinkedInImport,
  onFileUpload,
}: Props) {
  const [activePanel, setActivePanel] = useState<"upload" | "linkedin" | null>(
    null
  );
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [linkedInError, setLinkedInError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputId = useId();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const scrollPanelIntoView = () => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleMethodClick = (id: CreationMethod) => {
    setLinkedInError("");
    setUploadError("");

    if (id === "linkedin" || id === "upload") {
      setActivePanel((prev) => {
        const nextPanel = prev === id ? null : id;
        if (nextPanel) {
          scrollPanelIntoView();
        }
        return nextPanel;
      });
      return;
    }

    setActivePanel(null);
    onSelect(id);
  };

  const handleLinkedInSubmit = () => {
    const url = linkedInUrl.trim();
    if (!url) {
      setLinkedInError("Please enter your LinkedIn URL.");
      return;
    }
    if (
      !url.includes("linkedin.com/in/") &&
      !url.includes("linkedin.com/pub/")
    ) {
      setLinkedInError(
        "Please enter a valid LinkedIn profile URL (e.g. linkedin.com/in/yourname)."
      );
      return;
    }
    setLinkedInError("");
    onLinkedInImport(url);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const validateAndUpload = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ];
    const extension = file.name.toLowerCase().split(".").pop();
    const validExtensions = ["pdf", "docx"];

    if (
      !validTypes.includes(file.type) &&
      !validExtensions.includes(extension || "")
    ) {
      setUploadError("Please upload a PDF or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be under 10 MB.");
      return;
    }
    setUploadError("");
    onFileUpload(file);
  };

  return (
    <div className="jr-creation-flow">
      <div className="jr-page-hero jr-resume-entry-hero jr-page-hero-compact">
        <div className="jr-page-hero-copy">
          <span className="jr-page-eyebrow">Resume studio</span>
          <h1 className="jr-creation-title">Choose a starting point.</h1>
          <p className="jr-creation-subtitle">
            Every path lands in the same editor. Use the fastest route to get your resume on screen.
          </p>
        </div>
      </div>

      {activePanel === "linkedin" && (
        <section
          ref={panelRef}
          id={panelId}
          className="jr-creation-panel-shell"
        >
          <div className="jr-creation-panel-header">
            <div>
              <span className="jr-page-eyebrow">LinkedIn import</span>
              <h2 className="jr-creation-panel-title">Paste your public profile URL.</h2>
            </div>
            <button
              type="button"
              className="jr-btn jr-btn-ghost jr-btn-sm"
              onClick={() => setActivePanel(null)}
            >
              Close
            </button>
          </div>
          <p className="jr-creation-panel-desc">
            We’ll import the profile into the editor so you can clean it up there.
          </p>
          <div className="jr-creation-panel-row">
            <input
              type="url"
              className="jr-input"
              placeholder="https://linkedin.com/in/yourname"
              value={linkedInUrl}
              onChange={(e) => {
                setLinkedInUrl(e.target.value);
                setLinkedInError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLinkedInSubmit()}
            />
            <button
              type="button"
              className="jr-btn jr-btn-primary"
              onClick={handleLinkedInSubmit}
            >
              Import profile
            </button>
          </div>
          {linkedInError && (
            <p className="jr-input-error-text" role="alert">
              {linkedInError}
            </p>
          )}
        </section>
      )}

      {activePanel === "upload" && (
        <section
          ref={panelRef}
          id={panelId}
          className="jr-creation-panel-shell"
        >
          <div className="jr-creation-panel-header">
            <div>
              <span className="jr-page-eyebrow">Resume upload</span>
              <h2 className="jr-creation-panel-title">Upload a PDF or DOCX.</h2>
            </div>
            <button
              type="button"
              className="jr-btn jr-btn-ghost jr-btn-sm"
              onClick={() => setActivePanel(null)}
            >
              Close
            </button>
          </div>
          <p className="jr-creation-panel-desc">
            We’ll parse the file, prefill the editor, and let you finish the cleanup there.
          </p>
          <div
            className={`jr-upload-zone ${dragOver ? "jr-upload-zone-active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById(fileInputId)?.click()}
          >
            <div className="jr-upload-zone-icon">
              <UploadIcon size={22} />
            </div>
            <p className="jr-upload-zone-text">
              Drag and drop your file here, or <span>browse</span>
            </p>
            <p className="jr-upload-zone-hint">PDF or DOCX, max 10 MB</p>
            <input
              id={fileInputId}
              type="file"
              accept=".pdf,.docx"
              hidden
              onChange={handleFileInput}
            />
          </div>
          {uploadError && (
            <p className="jr-input-error-text jr-upload-error" role="alert">
              {uploadError}
            </p>
          )}
        </section>
      )}

      <div className="jr-creation-grid">
        {METHODS.map((m) => {
          const isActive = activePanel === m.id;
          const stateLabel =
            m.id === "linkedin" || m.id === "upload"
              ? isActive
                ? "Setup open"
                : "Open setup"
              : "Open editor";

          return (
            <article
              id={`jr-creation-${m.id}`}
              key={m.id}
              className={`jr-creation-card ${
                isActive ? "jr-creation-card-active" : ""
              }`}
            >
              <button
                type="button"
                className="jr-creation-card-trigger"
                onClick={() => handleMethodClick(m.id)}
                aria-expanded={
                  m.id === "linkedin" || m.id === "upload" ? isActive : undefined
                }
                aria-controls={
                  m.id === "linkedin" || m.id === "upload" ? panelId : undefined
                }
              >
                <div className="jr-creation-card-icon">
                  <m.icon size={22} className="jr-creation-card-icon-svg" />
                </div>
                <div className="jr-creation-card-content">
                  <div className="jr-creation-card-title">
                    {m.title}
                    {m.tag && <span className="jr-creation-tag">{m.tag}</span>}
                  </div>
                  <p className="jr-creation-card-desc">{m.desc}</p>
                </div>
                <div className="jr-creation-card-arrow">
                  <ArrowRightIcon size={16} />
                </div>
              </button>
              <span className="jr-creation-card-state">{stateLabel}</span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
