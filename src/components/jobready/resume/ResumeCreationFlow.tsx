"use client";

import { useState } from "react";
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
  icon: string;
  title: string;
  desc: string;
  tag?: string;
}[] = [
  {
    id: "new",
    icon: "✦",
    title: "Start from scratch",
    desc: "Build your resume step by step with guided prompts and ATS-friendly formatting.",
  },
  {
    id: "ai-assisted",
    icon: "⚡",
    title: "Create with AI",
    desc: "Answer a few questions and let AI generate a polished, job-ready resume for you.",
    tag: "Recommended",
  },
  {
    id: "upload",
    icon: "↑",
    title: "Upload existing resume",
    desc: "Upload a PDF or DOCX and we'll parse it into an editable, ATS-optimized format.",
  },
  {
    id: "linkedin",
    icon: "in",
    title: "Import from LinkedIn",
    desc: "Paste your LinkedIn profile URL and we'll extract your experience and skills.",
  },
  {
    id: "example",
    icon: "◎",
    title: "Start from an example",
    desc: "Choose from professional templates pre-filled with industry-specific content.",
  },
];

export default function ResumeCreationFlow({
  onSelect,
  onLinkedInImport,
  onFileUpload,
}: Props) {
  const [hoveredId, setHoveredId] = useState<CreationMethod | null>(null);
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [linkedInError, setLinkedInError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleMethodClick = (id: CreationMethod) => {
    if (id === "linkedin") {
      setShowLinkedIn(true);
      setShowUpload(false);
      return;
    }
    if (id === "upload") {
      setShowUpload(true);
      setShowLinkedIn(false);
      return;
    }
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
    if (file) validateAndUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  const validateAndUpload = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5 MB.");
      return;
    }
    onFileUpload(file);
  };

  return (
    <div className="jr-creation-flow">
      <div className="jr-page-hero jr-resume-entry-hero">
        <div className="jr-page-hero-copy">
          <span className="jr-page-eyebrow">Resume studio</span>
          <h1 className="jr-creation-title">Choose how you want to start.</h1>
          <p className="jr-creation-subtitle">
            Every path leads to the same guided editor: clean formatting, live preview, and AI help only where it improves the outcome.
          </p>
        </div>
        <div className="jr-page-hero-aside">
          <div className="jr-mini-metric">
            <div className="jr-mini-metric-icon">1</div>
            <div>
              <strong>Import or create</strong>
              <span>Bring existing content in, or start fresh with structured guidance.</span>
            </div>
          </div>
          <div className="jr-mini-metric">
            <div className="jr-mini-metric-icon">2</div>
            <div>
              <strong>Refine with AI</strong>
              <span>Use targeted help for summaries, skills, and stronger achievement bullets.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="jr-creation-grid">
        {METHODS.map((m) => (
          <button
            key={m.id}
            className={`jr-creation-card ${
              hoveredId === m.id ? "jr-creation-card-hover" : ""
            } ${
              (m.id === "linkedin" && showLinkedIn) ||
              (m.id === "upload" && showUpload)
                ? "jr-creation-card-active"
                : ""
            }`}
            onClick={() => handleMethodClick(m.id)}
            onMouseEnter={() => setHoveredId(m.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="jr-creation-card-icon">{m.icon}</div>
            <div className="jr-creation-card-content">
              <div className="jr-creation-card-title">
                {m.title}
                {m.tag && <span className="jr-creation-tag">{m.tag}</span>}
              </div>
              <p className="jr-creation-card-desc">{m.desc}</p>
            </div>
            <div className="jr-creation-card-arrow">→</div>
          </button>
        ))}
      </div>

      {/* LinkedIn URL Input Panel */}
      {showLinkedIn && (
        <div className="jr-creation-panel">
          <h3 className="jr-creation-panel-title">Import from LinkedIn</h3>
          <p className="jr-creation-panel-desc">
            Paste your public LinkedIn profile URL below. We&apos;ll extract your
            experience, education, and skills to pre-fill your resume.
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
              className="jr-btn jr-btn-primary"
              onClick={handleLinkedInSubmit}
            >
              Import
            </button>
          </div>
          {linkedInError && (
            <p className="jr-input-error-text">{linkedInError}</p>
          )}
          <button
            className="jr-creation-panel-cancel"
            onClick={() => setShowLinkedIn(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* File Upload Panel */}
      {showUpload && (
        <div className="jr-creation-panel">
          <h3 className="jr-creation-panel-title">Upload your resume</h3>
          <p className="jr-creation-panel-desc">
            Upload a PDF or Word document. We&apos;ll parse the content and convert
            it into an editable, ATS-optimized format.
          </p>
          <div
            className={`jr-upload-zone ${dragOver ? "jr-upload-zone-active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() =>
              document.getElementById("jr-file-input")?.click()
            }
          >
            <div className="jr-upload-zone-icon">↑</div>
            <p className="jr-upload-zone-text">
              Drag and drop your file here, or <span>browse</span>
            </p>
            <p className="jr-upload-zone-hint">PDF or DOCX, max 5 MB</p>
            <input
              id="jr-file-input"
              type="file"
              accept=".pdf,.docx"
              style={{ display: "none" }}
              onChange={handleFileInput}
            />
          </div>
          <button
            className="jr-creation-panel-cancel"
            onClick={() => setShowUpload(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
