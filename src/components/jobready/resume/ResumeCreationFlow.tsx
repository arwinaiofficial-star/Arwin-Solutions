"use client";

import { useId, useState, type ComponentType } from "react";
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
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [linkedInError, setLinkedInError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputId = useId();

  const scrollMethodIntoView = (id: CreationMethod) => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      document.getElementById(`jr-creation-${id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleMethodClick = (id: CreationMethod) => {
    setUploadError("");
    if (id === "linkedin") {
      setShowLinkedIn((prev) => !prev);
      setShowUpload(false);
      scrollMethodIntoView(id);
      return;
    }
    if (id === "upload") {
      setShowUpload((prev) => !prev);
      setShowLinkedIn(false);
      scrollMethodIntoView(id);
      return;
    }
    setShowLinkedIn(false);
    setShowUpload(false);
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
    ];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a PDF or DOCX file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File must be under 5 MB.");
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
          <h1 className="jr-creation-title">Choose how to start your resume.</h1>
          <p className="jr-creation-subtitle">
            Every option opens the same editor. Pick the fastest way to get your content in.
          </p>
        </div>
      </div>

      <div className="jr-creation-grid">
        {METHODS.map((m) => {
          const isActive =
            (m.id === "linkedin" && showLinkedIn) ||
            (m.id === "upload" && showUpload);

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

              {m.id === "linkedin" && showLinkedIn && (
                <div className="jr-creation-inline-panel">
                  <div className="jr-creation-inline-copy">
                    <h3 className="jr-creation-panel-title">Import from LinkedIn</h3>
                    <p className="jr-creation-panel-desc">
                      Paste your public LinkedIn profile URL and we&apos;ll pull it into the editor.
                    </p>
                  </div>
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
                      Import
                    </button>
                  </div>
                  {linkedInError && (
                    <p className="jr-input-error-text" role="alert">{linkedInError}</p>
                  )}
                </div>
              )}

              {m.id === "upload" && showUpload && (
                <div className="jr-creation-inline-panel">
                  <div className="jr-creation-inline-copy">
                    <h3 className="jr-creation-panel-title">Upload your resume</h3>
                    <p className="jr-creation-panel-desc">
                      Upload a PDF or DOCX file. We&apos;ll parse it and open it in the editor.
                    </p>
                  </div>
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
                    <p className="jr-upload-zone-hint">PDF or DOCX, max 5 MB</p>
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
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
