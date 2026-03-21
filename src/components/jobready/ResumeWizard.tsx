"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth, GeneratedCV, WorkExperience, Education } from "@/context/AuthContext";
import { resumeApi } from "@/lib/api/client";
import {
  CheckIcon,
  UserIcon,
  BriefcaseIcon,
  UploadIcon,
  DownloadIcon,
  SearchIcon,
  ArrowRightIcon,
  PlusIcon,
  XIcon,
} from "@/components/icons/Icons";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationYear: string;
  gpa: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  summary: string;
  skills: string[];
  experiences: ExperienceEntry[];
  education: EducationEntry[];
}

const STEP_LABELS = ["Start", "Personal", "Experience", "Education", "Skills", "Preview"];

interface ResumeWizardProps {
  onNavigateToSearch?: () => void;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ResumeWizard({ onNavigateToSearch }: ResumeWizardProps) {
  const { user, saveGeneratedCV, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: "",
    linkedIn: "",
    portfolio: "",
    summary: "",
    skills: [],
    experiences: [],
    education: [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null); // ID of item being enhanced
  const [generatedCV, setGeneratedCV] = useState<GeneratedCV | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Data Helpers ────────────────────────────────────────────────────────

  const updateField = useCallback(<K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const uid = () => `_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        id: uid(), title: "", company: "", location: "",
        startDate: "", endDate: "", current: false, highlights: [""],
      }],
    }));
  };

  const updateExperience = (id: string, field: string, value: unknown) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experiences: prev.experiences.filter(e => e.id !== id) }));
  };

  const addHighlight = (expId: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e =>
        e.id === expId ? { ...e, highlights: [...e.highlights, ""] } : e
      ),
    }));
  };

  const updateHighlight = (expId: string, idx: number, value: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e =>
        e.id === expId ? { ...e, highlights: e.highlights.map((h, i) => i === idx ? value : h) } : e
      ),
    }));
  };

  const removeHighlight = (expId: string, idx: number) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e =>
        e.id === expId ? { ...e, highlights: e.highlights.filter((_, i) => i !== idx) } : e
      ),
    }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { id: uid(), degree: "", institution: "", location: "", graduationYear: "", gpa: "" }],
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  // ─── Skill Tag Input ────────────────────────────────────────────────────

  const [skillInput, setSkillInput] = useState("");

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !data.skills.includes(trimmed)) {
      updateField("skills", [...data.skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    updateField("skills", data.skills.filter(s => s !== skill));
  };

  // ─── Upload Handler ─────────────────────────────────────────────────────

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadFileName(file.name);

    try {
      const result = await resumeApi.uploadCV(file);

      if (result.data?.extractedData) {
        const ext = result.data.extractedData as Record<string, unknown>;
        setData(prev => ({
          ...prev,
          fullName: (ext.fullName as string) || prev.fullName,
          email: (ext.email as string) || prev.email,
          phone: (ext.phone as string) || prev.phone,
          location: (ext.location as string) || prev.location,
          linkedIn: (ext.linkedIn as string) || prev.linkedIn,
          summary: (ext.summary as string) || prev.summary,
          skills: (ext.skills as string[]) || prev.skills,
          experiences: ((ext.experiences as Array<Record<string, unknown>>)?.map(e => ({
            id: uid(), title: (e.title as string) || "", company: (e.company as string) || "",
            location: (e.location as string) || "", startDate: (e.startDate as string) || "",
            endDate: (e.endDate as string) || "", current: (e.endDate as string)?.toLowerCase() === "present",
            highlights: (e.highlights as string[]) || [""],
          }))) || prev.experiences,
          education: ((ext.education as Array<Record<string, unknown>>)?.map(e => ({
            id: uid(), degree: (e.degree as string) || "", institution: (e.institution as string) || "",
            location: (e.location as string) || "", graduationYear: (e.graduationYear as string) || "",
            gpa: (e.gpa as string) || "",
          }))) || prev.education,
        }));
        setStep(1); // Jump to personal info for review
      } else if (result.data?.rawText) {
        // LLM extraction failed but we have raw text — store as summary for now
        setData(prev => ({ ...prev, summary: result.data!.rawText.slice(0, 500) }));
        setStep(1);
      } else {
        setUploadFileName(null);
        alert(result.error || "Failed to process file. Please try again or start from scratch.");
      }
    } catch {
      setUploadFileName(null);
      alert("Upload failed. Please try again.");
    }

    setIsUploading(false);
  };

  // ─── AI Enhance ─────────────────────────────────────────────────────────

  const enhanceExperience = async (expId: string) => {
    const exp = data.experiences.find(e => e.id === expId);
    if (!exp || !exp.highlights.some(h => h.trim())) return;

    setIsEnhancing(expId);
    try {
      const result = await resumeApi.chat(
        `Rewrite these bullet points to be achievement-oriented with metrics where possible. Job title: ${exp.title} at ${exp.company}. Current bullets:\n${exp.highlights.filter(h => h.trim()).join("\n")}`,
        "enhance_cv"
      );
      if (result.data?.reply) {
        const enhanced = result.data.reply.split("\n").filter((l: string) => l.trim()).map((l: string) => l.replace(/^[-•*]\s*/, "").trim());
        if (enhanced.length > 0) {
          updateExperience(expId, "highlights", enhanced);
        }
      }
    } catch { /* silent */ }
    setIsEnhancing(null);
  };

  const generateSummary = async () => {
    setIsEnhancing("summary");
    try {
      const result = await resumeApi.chat("", "generate_summary", {
        fullName: data.fullName,
        skills: data.skills,
        experiences: data.experiences.map(e => ({ title: e.title, company: e.company })),
        education: data.education.map(e => ({ degree: e.degree, institution: e.institution })),
      });
      if (result.data?.reply) {
        updateField("summary", result.data.reply);
      }
    } catch { /* silent */ }
    setIsEnhancing(null);
  };

  // ─── Generate Final CV ──────────────────────────────────────────────────

  const buildCV = useCallback((): GeneratedCV => {
    let summary = data.summary;
    if (!summary) {
      const topSkills = data.skills.slice(0, 3).join(", ");
      summary = `Results-driven professional specializing in ${topSkills || "technology"}. Committed to delivering impactful solutions.`;
    }

    return {
      id: `cv_${crypto.randomUUID()}`,
      personalInfo: {
        name: data.fullName, email: data.email, phone: data.phone,
        location: data.location, linkedIn: data.linkedIn || undefined,
        portfolio: data.portfolio || undefined,
      },
      summary,
      skills: data.skills,
      experience: data.experiences.map(e => ({
        title: e.title, company: e.company, location: e.location,
        startDate: e.startDate, endDate: e.current ? "Present" : e.endDate,
        current: e.current, highlights: e.highlights.filter(h => h.trim()),
      })),
      education: data.education.map(e => ({
        degree: e.degree, institution: e.institution,
        location: e.location, graduationYear: e.graduationYear, gpa: e.gpa,
      })),
      createdAt: new Date().toISOString(),
    };
  }, [data]);

  const finishAndSave = () => {
    const cv = buildCV();
    setGeneratedCV(cv);
    saveGeneratedCV(cv);
    updateProfile({ name: data.fullName, phone: data.phone, skills: data.skills });
    resumeApi.save(cv as unknown as Record<string, unknown>, "final").catch(() => {});
    setStep(5);
  };

  const goToStep = (s: number) => {
    // Auto-save on step transitions
    if (step === 4 && s === 5) {
      finishAndSave();
      return;
    }
    setStep(s);
  };

  const downloadPDF = () => {
    const cv = generatedCV || buildCV();
    const html = buildResumeHTML(cv);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  };

  // ─── Validation ─────────────────────────────────────────────────────────

  const canProceed = (s: number): boolean => {
    switch (s) {
      case 1: return !!(data.fullName.trim() && data.email.trim());
      case 2: return true; // Experience is optional
      case 3: return true; // Education is optional
      case 4: return data.skills.length > 0;
      default: return true;
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      <style>{wizardStyles}</style>
      <div className="rw">
        {/* Stepper */}
        {step > 0 && step < 5 && (
          <div className="rw-stepper">
            {STEP_LABELS.slice(1, 5).map((label, i) => {
              const stepNum = i + 1;
              return (
                <button key={label} className={`rw-step ${step === stepNum ? "rw-step-active" : step > stepNum ? "rw-step-done" : ""}`} onClick={() => step > stepNum && goToStep(stepNum)}>
                  <span className="rw-step-num">{step > stepNum ? <CheckIcon size={12} /> : stepNum}</span>
                  <span className="rw-step-label">{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />

        {/* ── Step 0: Start ──────────────────────────────────────────── */}
        {step === 0 && (
          <div className="rw-start">
            <div className="rw-start-icon">📄</div>
            <h2>Build Your Professional Resume</h2>
            <p>Create an ATS-optimized resume that gets you noticed by recruiters.</p>

            <div className="rw-start-options">
              <button className="rw-option" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <UploadIcon size={24} />
                <strong>{isUploading ? "Processing..." : "Upload my CV"}</strong>
                <span>Upload a PDF and I&apos;ll extract your details into the form</span>
                {uploadFileName && <span className="rw-option-file">📎 {uploadFileName}</span>}
              </button>

              <button className="rw-option" onClick={() => { if (data.experiences.length === 0) addExperience(); if (data.education.length === 0) addEducation(); setStep(1); }}>
                <UserIcon size={24} />
                <strong>Start from scratch</strong>
                <span>Fill in your details step by step — I&apos;ll help format everything</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Personal Info ──────────────────────────────────── */}
        {step === 1 && (
          <div className="rw-section">
            <h3 className="rw-section-title">Personal Information</h3>
            <p className="rw-section-sub">Basic contact details for your resume header.</p>

            <div className="rw-form-grid">
              <div className="rw-field rw-field-half">
                <label>Full Name *</label>
                <input value={data.fullName} onChange={e => updateField("fullName", e.target.value)} placeholder="John Doe" />
              </div>
              <div className="rw-field rw-field-half">
                <label>Email *</label>
                <input type="email" value={data.email} onChange={e => updateField("email", e.target.value)} placeholder="john@example.com" />
              </div>
              <div className="rw-field rw-field-half">
                <label>Phone</label>
                <input value={data.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+91 9876543210" />
              </div>
              <div className="rw-field rw-field-half">
                <label>Location</label>
                <input value={data.location} onChange={e => updateField("location", e.target.value)} placeholder="Bangalore, India" />
              </div>
              <div className="rw-field rw-field-half">
                <label>LinkedIn</label>
                <input value={data.linkedIn} onChange={e => updateField("linkedIn", e.target.value)} placeholder="linkedin.com/in/johndoe" />
              </div>
              <div className="rw-field rw-field-half">
                <label>Portfolio / Website</label>
                <input value={data.portfolio} onChange={e => updateField("portfolio", e.target.value)} placeholder="johndoe.dev" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Experience ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="rw-section">
            <div className="rw-section-header">
              <div>
                <h3 className="rw-section-title">Work Experience</h3>
                <p className="rw-section-sub">Add your work history. Most recent first.</p>
              </div>
              <button className="rw-btn-add" onClick={addExperience}><PlusIcon size={14} /> Add Role</button>
            </div>

            {data.experiences.length === 0 && (
              <div className="rw-empty">
                <BriefcaseIcon size={32} color="#475569" />
                <p>No experience added yet</p>
                <button className="rw-btn-add" onClick={addExperience}><PlusIcon size={14} /> Add Your First Role</button>
              </div>
            )}

            {data.experiences.map(exp => (
              <div key={exp.id} className="rw-card">
                <div className="rw-card-header">
                  <strong>{exp.title || "New Role"}</strong>
                  <button className="rw-card-remove" onClick={() => removeExperience(exp.id)}><XIcon size={14} /></button>
                </div>

                <div className="rw-form-grid">
                  <div className="rw-field rw-field-half">
                    <label>Job Title</label>
                    <input value={exp.title} onChange={e => updateExperience(exp.id, "title", e.target.value)} placeholder="Software Engineer" />
                  </div>
                  <div className="rw-field rw-field-half">
                    <label>Company</label>
                    <input value={exp.company} onChange={e => updateExperience(exp.id, "company", e.target.value)} placeholder="Google" />
                  </div>
                  <div className="rw-field rw-field-third">
                    <label>Location</label>
                    <input value={exp.location} onChange={e => updateExperience(exp.id, "location", e.target.value)} placeholder="Bangalore" />
                  </div>
                  <div className="rw-field rw-field-third">
                    <label>Start Date</label>
                    <input value={exp.startDate} onChange={e => updateExperience(exp.id, "startDate", e.target.value)} placeholder="Jan 2022" />
                  </div>
                  <div className="rw-field rw-field-third">
                    <label>{exp.current ? "Current" : "End Date"}</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input value={exp.current ? "Present" : exp.endDate} onChange={e => updateExperience(exp.id, "endDate", e.target.value)} placeholder="Dec 2023" disabled={exp.current} style={{ flex: 1 }} />
                      <label style={{ display: "flex", gap: 4, alignItems: "center", fontSize: "0.75rem", color: "#94a3b8", whiteSpace: "nowrap", cursor: "pointer" }}>
                        <input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, "current", e.target.checked)} /> Current
                      </label>
                    </div>
                  </div>
                </div>

                <div className="rw-highlights">
                  <div className="rw-highlights-header">
                    <label>Key Achievements / Responsibilities</label>
                    <button className="rw-btn-ai" onClick={() => enhanceExperience(exp.id)} disabled={isEnhancing === exp.id}>
                      {isEnhancing === exp.id ? <><span className="rw-spinner" /> Enhancing...</> : "✨ AI Enhance"}
                    </button>
                  </div>
                  {exp.highlights.map((h, i) => (
                    <div key={i} className="rw-highlight-row">
                      <span className="rw-bullet">•</span>
                      <input value={h} onChange={e => updateHighlight(exp.id, i, e.target.value)} placeholder="Describe what you did and the impact..." />
                      {exp.highlights.length > 1 && (
                        <button className="rw-highlight-remove" onClick={() => removeHighlight(exp.id, i)}><XIcon size={12} /></button>
                      )}
                    </div>
                  ))}
                  <button className="rw-btn-text" onClick={() => addHighlight(exp.id)}><PlusIcon size={12} /> Add bullet</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Step 3: Education ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="rw-section">
            <div className="rw-section-header">
              <div>
                <h3 className="rw-section-title">Education</h3>
                <p className="rw-section-sub">Add your degrees and certifications.</p>
              </div>
              <button className="rw-btn-add" onClick={addEducation}><PlusIcon size={14} /> Add Education</button>
            </div>

            {data.education.length === 0 && (
              <div className="rw-empty">
                <p>No education added yet</p>
                <button className="rw-btn-add" onClick={addEducation}><PlusIcon size={14} /> Add Education</button>
              </div>
            )}

            {data.education.map(edu => (
              <div key={edu.id} className="rw-card">
                <div className="rw-card-header">
                  <strong>{edu.degree || "New Education"}</strong>
                  <button className="rw-card-remove" onClick={() => removeEducation(edu.id)}><XIcon size={14} /></button>
                </div>
                <div className="rw-form-grid">
                  <div className="rw-field rw-field-half">
                    <label>Degree / Qualification</label>
                    <input value={edu.degree} onChange={e => updateEducation(edu.id, "degree", e.target.value)} placeholder="B.Tech in Computer Science" />
                  </div>
                  <div className="rw-field rw-field-half">
                    <label>Institution</label>
                    <input value={edu.institution} onChange={e => updateEducation(edu.id, "institution", e.target.value)} placeholder="IIT Delhi" />
                  </div>
                  <div className="rw-field rw-field-third">
                    <label>Location</label>
                    <input value={edu.location} onChange={e => updateEducation(edu.id, "location", e.target.value)} placeholder="New Delhi" />
                  </div>
                  <div className="rw-field rw-field-third">
                    <label>Graduation Year</label>
                    <input value={edu.graduationYear} onChange={e => updateEducation(edu.id, "graduationYear", e.target.value)} placeholder="2022" />
                  </div>
                  <div className="rw-field rw-field-third">
                    <label>GPA (optional)</label>
                    <input value={edu.gpa} onChange={e => updateEducation(edu.id, "gpa", e.target.value)} placeholder="8.5/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Step 4: Skills & Summary ───────────────────────────────── */}
        {step === 4 && (
          <div className="rw-section">
            <h3 className="rw-section-title">Skills & Professional Summary</h3>
            <p className="rw-section-sub">Add your technical skills and let AI generate your summary.</p>

            <div className="rw-field">
              <label>Skills *</label>
              <div className="rw-skills-input">
                {data.skills.map(skill => (
                  <span key={skill} className="rw-skill-tag">
                    {skill}
                    <button onClick={() => removeSkill(skill)}><XIcon size={10} /></button>
                  </span>
                ))}
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(skillInput); } }}
                  placeholder={data.skills.length === 0 ? "Type a skill and press Enter (e.g. React, Python, AWS)" : "Add more..."}
                  className="rw-skills-text"
                />
              </div>
              <span className="rw-field-hint">Press Enter or comma to add each skill</span>
            </div>

            <div className="rw-field" style={{ marginTop: 24 }}>
              <div className="rw-highlights-header">
                <label>Professional Summary</label>
                <button className="rw-btn-ai" onClick={generateSummary} disabled={isEnhancing === "summary"}>
                  {isEnhancing === "summary" ? <><span className="rw-spinner" /> Generating...</> : "✨ AI Generate"}
                </button>
              </div>
              <textarea value={data.summary} onChange={e => updateField("summary", e.target.value)} placeholder="A brief professional summary highlighting your experience, skills, and career goals. Click 'AI Generate' to create one automatically." rows={5} className="rw-textarea" />
            </div>
          </div>
        )}

        {/* ── Step 5: Preview ───────────────────────────────────────── */}
        {step === 5 && generatedCV && (
          <div className="rw-section">
            <div className="rw-preview-actions">
              <button className="rw-btn rw-btn-primary" onClick={downloadPDF}><DownloadIcon size={14} /> Download PDF</button>
              <button className="rw-btn rw-btn-primary" onClick={() => onNavigateToSearch?.()}>
                <SearchIcon size={14} /> Find Matching Jobs <ArrowRightIcon size={14} />
              </button>
              <button className="rw-btn rw-btn-ghost" onClick={() => setStep(1)}>Edit Resume</button>
            </div>

            <div className="rw-preview">
              <h1 className="rw-cv-name">{generatedCV.personalInfo.name}</h1>
              <div className="rw-cv-contact">
                {[generatedCV.personalInfo.email, generatedCV.personalInfo.phone, generatedCV.personalInfo.location, generatedCV.personalInfo.linkedIn].filter(Boolean).join(" · ")}
              </div>

              {generatedCV.summary && (
                <>
                  <div className="rw-cv-heading">Professional Summary</div>
                  <p className="rw-cv-text">{generatedCV.summary}</p>
                </>
              )}

              {generatedCV.skills.length > 0 && (
                <>
                  <div className="rw-cv-heading">Technical Skills</div>
                  <p className="rw-cv-text">{generatedCV.skills.join(" · ")}</p>
                </>
              )}

              {generatedCV.experience.length > 0 && (
                <>
                  <div className="rw-cv-heading">Work Experience</div>
                  {generatedCV.experience.map((exp, i) => (
                    <div key={i} className="rw-cv-exp">
                      <div className="rw-cv-exp-row">
                        <strong>{exp.title}</strong>
                        <span>{exp.startDate} – {exp.endDate}</span>
                      </div>
                      <div className="rw-cv-exp-company">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                      {exp.highlights.length > 0 && (
                        <ul className="rw-cv-list">{exp.highlights.map((h, j) => <li key={j}>{h}</li>)}</ul>
                      )}
                    </div>
                  ))}
                </>
              )}

              {generatedCV.education.length > 0 && (
                <>
                  <div className="rw-cv-heading">Education</div>
                  {generatedCV.education.map((edu, i) => (
                    <div key={i} className="rw-cv-edu">
                      <strong>{edu.degree}</strong> — {edu.institution}{edu.graduationYear ? `, ${edu.graduationYear}` : ""}
                      {edu.gpa && <span className="rw-cv-gpa"> (GPA: {edu.gpa})</span>}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Navigation ────────────────────────────────────────────── */}
        {step > 0 && step < 5 && (
          <div className="rw-nav">
            <button className="rw-btn rw-btn-ghost" onClick={() => goToStep(step - 1)}>
              ← {step === 1 ? "Start" : "Back"}
            </button>
            <button className="rw-btn rw-btn-primary" onClick={() => goToStep(step + 1)} disabled={!canProceed(step)}>
              {step === 4 ? "Generate Resume" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── PDF Builder ────────────────────────────────────────────────────────────

function buildResumeHTML(cv: GeneratedCV): string {
  const exp = cv.experience.map(e => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between"><strong>${e.title}</strong><span style="color:#666;font-size:0.85em">${e.startDate} – ${e.endDate}</span></div>
      <div style="color:#444">${e.company}${e.location ? ` · ${e.location}` : ""}</div>
      ${e.highlights.length > 0 ? `<ul style="margin:6px 0;padding-left:20px">${e.highlights.map(h => `<li>${h}</li>`).join("")}</ul>` : ""}
    </div>`).join("");

  const edu = cv.education.map(e =>
    `<p><strong>${e.degree}</strong> — ${e.institution}${e.graduationYear ? `, ${e.graduationYear}` : ""}${e.gpa ? ` (GPA: ${e.gpa})` : ""}</p>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${cv.personalInfo.name} - Resume</title>
<style>@page{margin:0.7in;size:A4}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,sans-serif;color:#1a1a2e;font-size:10.5pt;line-height:1.5;padding:40px}h1{font-size:22pt;font-weight:700;margin-bottom:4px}.contact{color:#555;font-size:9.5pt;margin-bottom:16px}.heading{font-size:11pt;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #2563eb;padding-bottom:3px;margin:18px 0 10px}p{margin-bottom:6px}ul{margin:4px 0}li{margin-bottom:2px}</style></head><body>
<h1>${cv.personalInfo.name}</h1>
<div class="contact">${[cv.personalInfo.email, cv.personalInfo.phone, cv.personalInfo.location, cv.personalInfo.linkedIn].filter(Boolean).join(" · ")}</div>
${cv.summary ? `<div class="heading">Professional Summary</div><p>${cv.summary}</p>` : ""}
${cv.skills.length > 0 ? `<div class="heading">Technical Skills</div><p>${cv.skills.join(" · ")}</p>` : ""}
${cv.experience.length > 0 ? `<div class="heading">Work Experience</div>${exp}` : ""}
${cv.education.length > 0 ? `<div class="heading">Education</div>${edu}` : ""}
</body></html>`;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const wizardStyles = `
  .rw { max-width: 720px; margin: 0 auto; }

  /* Stepper */
  .rw-stepper { display: flex; gap: 4px; margin-bottom: 28px; }
  .rw-step {
    flex: 1; display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; border-radius: 8px;
    background: #111318; border: 1px solid #1e293b;
    color: #64748b; font-size: 0.8125rem; font-weight: 500;
    cursor: default; transition: all 0.2s;
  }
  .rw-step-active { border-color: #3b82f6; color: #e2e8f0; background: #131a2b; }
  .rw-step-done { color: #22c55e; cursor: pointer; }
  .rw-step-done:hover { background: #151a24; }
  .rw-step-num {
    width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.6875rem; font-weight: 700;
    background: #1e293b; color: #94a3b8;
  }
  .rw-step-active .rw-step-num { background: #3b82f6; color: white; }
  .rw-step-done .rw-step-num { background: rgba(34,197,94,0.15); color: #22c55e; }
  .rw-step-label { white-space: nowrap; }

  /* Start */
  .rw-start { text-align: center; padding: 48px 24px; }
  .rw-start-icon { font-size: 3rem; margin-bottom: 16px; }
  .rw-start h2 { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; }
  .rw-start p { color: #64748b; margin: 0 0 32px; font-size: 0.9375rem; }
  .rw-start-options { display: flex; gap: 16px; max-width: 500px; margin: 0 auto; }
  .rw-option {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 28px 20px; border-radius: 12px;
    background: #111318; border: 2px solid #1e293b;
    color: #94a3b8; cursor: pointer; transition: all 0.2s;
    text-align: center;
  }
  .rw-option:hover { border-color: #3b82f6; background: #131a2b; color: #e2e8f0; transform: translateY(-2px); }
  .rw-option:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .rw-option strong { color: #f1f5f9; font-size: 0.9375rem; }
  .rw-option span { font-size: 0.75rem; line-height: 1.4; }
  .rw-option-file { font-size: 0.6875rem; color: #3b82f6; margin-top: 4px; }

  /* Sections */
  .rw-section { animation: rw-in 0.2s ease; }
  @keyframes rw-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .rw-section-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
  .rw-section-title { font-size: 1.125rem; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; }
  .rw-section-sub { font-size: 0.8125rem; color: #64748b; margin: 0 0 20px; }

  /* Forms */
  .rw-form-grid { display: flex; flex-wrap: wrap; gap: 14px; }
  .rw-field { display: flex; flex-direction: column; gap: 5px; width: 100%; }
  .rw-field-half { width: calc(50% - 7px); }
  .rw-field-third { width: calc(33.33% - 10px); }
  .rw-field label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  .rw-field input, .rw-textarea {
    padding: 10px 14px; border-radius: 8px;
    background: #0a0a0f; border: 1px solid #2d3748;
    color: #e2e8f0; font-size: 0.875rem; font-family: inherit;
    transition: border-color 0.15s;
  }
  .rw-field input:focus, .rw-textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .rw-field input::placeholder, .rw-textarea::placeholder { color: #475569; }
  .rw-field input:disabled { opacity: 0.5; }
  .rw-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
  .rw-field-hint { font-size: 0.6875rem; color: #475569; }

  /* Cards */
  .rw-card {
    background: #111318; border: 1px solid #1e293b; border-radius: 10px;
    padding: 18px; margin-bottom: 12px;
  }
  .rw-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .rw-card-header strong { font-size: 0.875rem; color: #e2e8f0; }
  .rw-card-remove {
    width: 28px; height: 28px; border-radius: 6px; border: none;
    background: transparent; color: #64748b; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .rw-card-remove:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

  /* Highlights */
  .rw-highlights { margin-top: 14px; }
  .rw-highlights-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .rw-highlight-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .rw-bullet { color: #3b82f6; font-weight: 700; flex-shrink: 0; }
  .rw-highlight-row input { flex: 1; }
  .rw-highlight-remove {
    width: 24px; height: 24px; border-radius: 4px; border: none; flex-shrink: 0;
    background: transparent; color: #475569; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .rw-highlight-remove:hover { color: #ef4444; }

  /* Skills Tag Input */
  .rw-skills-input {
    display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px;
    background: #0a0a0f; border: 1px solid #2d3748; border-radius: 8px;
    min-height: 44px; align-items: center;
    transition: border-color 0.15s;
  }
  .rw-skills-input:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .rw-skill-tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 6px;
    background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
    color: #60a5fa; font-size: 0.75rem; font-weight: 600;
  }
  .rw-skill-tag button {
    background: none; border: none; color: #60a5fa; cursor: pointer; padding: 0;
    display: flex; align-items: center; opacity: 0.6;
  }
  .rw-skill-tag button:hover { opacity: 1; }
  .rw-skills-text { flex: 1; min-width: 120px; background: transparent; border: none; color: #e2e8f0; font-size: 0.875rem; outline: none; }
  .rw-skills-text::placeholder { color: #475569; }

  /* Buttons */
  .rw-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 8px;
    font-size: 0.8125rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
    border: none;
  }
  .rw-btn-primary { background: #3b82f6; color: white; }
  .rw-btn-primary:hover { background: #2563eb; }
  .rw-btn-primary:disabled { background: #1e3a5f; color: #64748b; cursor: not-allowed; }
  .rw-btn-ghost { background: transparent; color: #94a3b8; border: 1px solid #2d3748; }
  .rw-btn-ghost:hover { background: #1e293b; color: #e2e8f0; }
  .rw-btn-add {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 8px 14px; border-radius: 8px;
    background: #131a2b; border: 1px solid rgba(59,130,246,0.3);
    color: #60a5fa; font-size: 0.8125rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .rw-btn-add:hover { background: #1a2440; border-color: #3b82f6; }
  .rw-btn-text {
    background: none; border: none; color: #64748b; font-size: 0.75rem;
    cursor: pointer; padding: 4px 0; display: inline-flex; align-items: center; gap: 4px;
  }
  .rw-btn-text:hover { color: #94a3b8; }
  .rw-btn-ai {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 5px 12px; border-radius: 6px;
    background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15));
    border: 1px solid rgba(139,92,246,0.3);
    color: #a78bfa; font-size: 0.75rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .rw-btn-ai:hover { background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.25)); border-color: #8b5cf6; }
  .rw-btn-ai:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Empty State */
  .rw-empty {
    text-align: center; padding: 40px 20px;
    background: #111318; border: 1px dashed #1e293b; border-radius: 10px;
  }
  .rw-empty p { color: #64748b; margin: 12px 0 16px; font-size: 0.875rem; }

  /* Navigation */
  .rw-nav {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 28px; padding-top: 20px; border-top: 1px solid #1e293b;
  }

  /* Preview */
  .rw-preview-actions { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
  .rw-preview {
    background: #fafafa; color: #1a1a2e; padding: 32px;
    border-radius: 10px; font-size: 0.8125rem; line-height: 1.6;
  }
  .rw-cv-name { font-size: 1.375rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
  .rw-cv-contact { font-size: 0.75rem; color: #64748b; margin-bottom: 18px; }
  .rw-cv-heading {
    font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 3px; margin: 18px 0 10px;
  }
  .rw-cv-text { margin: 0 0 4px; color: #334155; }
  .rw-cv-exp { margin-bottom: 14px; }
  .rw-cv-exp-row { display: flex; justify-content: space-between; align-items: baseline; }
  .rw-cv-exp-row strong { color: #0f172a; }
  .rw-cv-exp-row span { font-size: 0.75rem; color: #64748b; }
  .rw-cv-exp-company { font-size: 0.8125rem; color: #3b82f6; margin-bottom: 4px; }
  .rw-cv-list { padding-left: 18px; margin: 4px 0; }
  .rw-cv-list li { color: #475569; margin-bottom: 2px; }
  .rw-cv-edu { margin-bottom: 6px; color: #334155; }
  .rw-cv-edu strong { color: #0f172a; }
  .rw-cv-gpa { color: #64748b; font-size: 0.75rem; }

  /* Spinner */
  .rw-spinner {
    width: 12px; height: 12px; border: 2px solid rgba(167,139,250,0.3);
    border-top-color: #a78bfa; border-radius: 50%;
    animation: rw-spin 0.6s linear infinite; display: inline-block;
  }
  @keyframes rw-spin { to { transform: rotate(360deg); } }

  /* Mobile */
  @media (max-width: 640px) {
    .rw-stepper { flex-wrap: wrap; }
    .rw-step-label { display: none; }
    .rw-start-options { flex-direction: column; }
    .rw-field-half, .rw-field-third { width: 100%; }
    .rw-cv-exp-row { flex-direction: column; }
  }
`;
