"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth, GeneratedCV, WorkExperience, Education } from "@/context/AuthContext";
import { resumeApi } from "@/lib/api/client";
import {
  SendIcon,
  BotIcon,
  UserIcon,
  CheckIcon,
  SearchIcon,
  ArrowRightIcon,
  DownloadIcon,
  DocumentIcon,
} from "@/components/icons/Icons";

interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  options?: string[];
  inputType?: "text" | "textarea" | "select";
  selectOptions?: string[];
  field?: string;
}

interface CVFormData {
  hasExistingCV: boolean | null;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  summary: string;
  yearsOfExperience: string;
  skills: string[];
  experiences: WorkExperience[];
  education: Education[];
  education_degree: string;
  education_institution: string;
  education_year: string;
  certifications: string[];
  languages: string[];
}

const STEPS = [
  { id: "welcome", question: "Hi! I'm your AI resume assistant. I'll help you create an ATS-friendly resume in minutes. Ready to start?", options: ["Create a new resume", "I have a CV to upload"], field: "hasExistingCV" },
  { id: "fullName", question: "What's your full name?", inputType: "text" as const, field: "fullName", placeholder: "e.g., Rahul Sharma" },
  { id: "email", question: "Professional email address?", inputType: "text" as const, field: "email", placeholder: "e.g., rahul@email.com" },
  { id: "phone", question: "Contact number?", inputType: "text" as const, field: "phone", placeholder: "e.g., +91 98765 43210" },
  { id: "location", question: "Current location?", inputType: "select" as const, field: "location", selectOptions: ["Bangalore", "Hyderabad", "Mumbai", "Pune", "Chennai", "Delhi NCR", "Noida", "Gurgaon", "Kolkata", "Remote", "Other"] },
  { id: "linkedIn", question: "LinkedIn profile URL? (Enter to skip)", inputType: "text" as const, field: "linkedIn", placeholder: "linkedin.com/in/yourprofile", optional: true },
  { id: "yearsOfExperience", question: "Years of work experience?", inputType: "select" as const, field: "yearsOfExperience", selectOptions: ["Fresher (0-1 years)", "1-3 years", "3-5 years", "5-8 years", "8-12 years", "12+ years"] },
  { id: "skills", question: "List your key skills (comma-separated). These will be highlighted for ATS optimization.", inputType: "textarea" as const, field: "skills", placeholder: "e.g., React, Node.js, Python, SQL, AWS" },
  { id: "experience_count", question: "How many work experiences to add? (0 if fresher)", inputType: "text" as const, field: "experience_count", placeholder: "e.g., 2" },
  { id: "education_degree", question: "Highest degree/qualification?", inputType: "text" as const, field: "education_degree", placeholder: "e.g., B.Tech in Computer Science" },
  { id: "education_institution", question: "Institution?", inputType: "text" as const, field: "education_institution", placeholder: "e.g., IIT Delhi" },
  { id: "education_year", question: "Graduation year?", inputType: "text" as const, field: "education_year", placeholder: "e.g., 2022" },
  { id: "summary", question: "Write a 2-3 sentence professional summary, or type 'auto' for AI-generated.", inputType: "textarea" as const, field: "summary", placeholder: "Your career highlights..." },
];

interface AgenticChatProps {
  onNavigateToSearch?: () => void;
}

export default function AgenticChat({ onNavigateToSearch }: AgenticChatProps) {
  const { user, saveGeneratedCV, updateProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "bot",
    content: STEPS[0].question,
    options: STEPS[0].options,
  }]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [formData, setFormData] = useState<CVFormData>({
    hasExistingCV: null, fullName: user?.name || "", email: user?.email || "",
    phone: user?.phone || "", location: "", linkedIn: "", portfolio: "",
    summary: "", yearsOfExperience: "", skills: [], experiences: [],
    education: [], education_degree: "", education_institution: "",
    education_year: "", certifications: [], languages: [],
  });
  const [experienceCount, setExperienceCount] = useState(0);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState(0);
  const [currentExperienceField, setCurrentExperienceField] = useState<string | null>(null);
  const [tempExperience, setTempExperience] = useState<Partial<WorkExperience>>({});
  const [generatedCV, setGeneratedCV] = useState<GeneratedCV | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cvAccepted, setCvAccepted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const msgCounter = useRef(0);

  const progress = Math.min(Math.round((currentStep / (STEPS.length - 1)) * 100), 100);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, [currentStep]);

  const addMsg = useCallback((role: "bot" | "user", content: string, options?: string[], inputType?: Message["inputType"], selectOptions?: string[], field?: string) => {
    msgCounter.current += 1;
    setMessages(prev => [...prev, { id: `m_${Date.now()}_${msgCounter.current}`, role, content, options, inputType, selectOptions, field }]);
  }, []);

  const generateSummaryAI = async (): Promise<string> => {
    try {
      const context = {
        fullName: formData.fullName, yearsOfExperience: formData.yearsOfExperience,
        skills: formData.skills, location: formData.location,
        experiences: formData.experiences, education_degree: formData.education_degree,
        education_institution: formData.education_institution,
      };
      const result = await resumeApi.chat("", "generate_summary", context);
      if (result.data?.reply) return result.data.reply;
    } catch { /* use local */ }

    const years = formData.yearsOfExperience || "experience";
    const topSkills = formData.skills.slice(0, 3).join(", ");
    return `Results-driven professional with ${years} of experience specializing in ${topSkills}. Proven track record of delivering high-quality solutions and collaborating effectively with cross-functional teams.`;
  };

  const proceedToNext = useCallback(() => {
    const next = currentStep + 1;
    if (next >= STEPS.length) { generateCV(); return; }
    setCurrentStep(next);
    const s = STEPS[next];
    addMsg("bot", s.question, s.options, s.inputType, s.selectOptions);
  }, [currentStep, addMsg]);

  const handleExperienceInput = (value: string) => {
    if (!currentExperienceField) {
      const count = parseInt(value) || 0;
      setExperienceCount(count);
      if (count > 0) {
        setCurrentExperienceIndex(0);
        setCurrentExperienceField("title");
        addMsg("user", value);
        addMsg("bot", `Experience #1 — Job title?`, undefined, "text");
      } else {
        addMsg("user", value);
        proceedToNext();
      }
      return;
    }

    const updatedExp = { ...tempExperience, [currentExperienceField]: value };
    setTempExperience(updatedExp);
    addMsg("user", value);

    const fields = [
      { field: "title", next: "company", q: "Company name?" },
      { field: "company", next: "location", q: "Location?" },
      { field: "location", next: "startDate", q: "Start date? (e.g., Jan 2020)" },
      { field: "startDate", next: "endDate", q: "End date? (or 'Present')" },
      { field: "endDate", next: "highlights", q: "Key achievements (comma-separated):" },
    ];

    if (currentExperienceField === "highlights") {
      const exp: WorkExperience = {
        title: updatedExp.title || "", company: updatedExp.company || "",
        location: updatedExp.location || "", startDate: updatedExp.startDate || "",
        endDate: updatedExp.endDate || "", current: updatedExp.endDate?.toLowerCase() === "present",
        highlights: value.split(",").map((h: string) => h.trim()),
      };
      setFormData(prev => ({ ...prev, experiences: [...prev.experiences, exp] }));
      setTempExperience({});

      if (currentExperienceIndex + 1 < experienceCount) {
        setCurrentExperienceIndex(prev => prev + 1);
        setCurrentExperienceField("title");
        addMsg("bot", `Experience #${currentExperienceIndex + 2} — Job title?`, undefined, "text");
      } else {
        setCurrentExperienceField(null);
        proceedToNext();
      }
    } else {
      const idx = fields.findIndex(f => f.field === currentExperienceField);
      if (idx !== -1) {
        setCurrentExperienceField(fields[idx].next);
        addMsg("bot", fields[idx].q, undefined, "text");
      }
    }
  };

  const handleOptionSelect = (option: string) => {
    addMsg("user", option);
    if (currentStep === 0) {
      if (option === "I have a CV to upload") {
        setFormData(prev => ({ ...prev, hasExistingCV: true }));
        addMsg("bot", "CV upload coming soon. For now, let's build one from scratch — it only takes 3 minutes.");
        setTimeout(() => proceedToNext(), 1000);
      } else {
        setFormData(prev => ({ ...prev, hasExistingCV: false }));
        proceedToNext();
      }
    }
  };

  const handleSelectChange = (value: string) => {
    const step = STEPS[currentStep];
    if (step?.field) setFormData(prev => ({ ...prev, [step.field!]: value }));
    addMsg("user", value);
    proceedToNext();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const step = STEPS[currentStep];
    const value = inputValue.trim();

    if (step?.id === "experience_count" || currentExperienceField) {
      handleExperienceInput(value);
      setInputValue("");
      return;
    }

    if (step?.field) {
      if (step.field === "skills") {
        setFormData(prev => ({ ...prev, skills: value.split(",").map(s => s.trim()).filter(Boolean) }));
      } else if (step.field === "summary") {
        addMsg("user", value);
        setInputValue("");
        if (value.toLowerCase() === "auto") {
          setIsGenerating(true);
          addMsg("bot", "Generating AI-powered summary...");
          const summary = await generateSummaryAI();
          setIsGenerating(false);
          setFormData(prev => ({ ...prev, summary }));
          addMsg("bot", `Generated: "${summary}"`);
          setTimeout(() => generateCV(), 500);
        } else {
          setFormData(prev => ({ ...prev, summary: value }));
          setTimeout(() => generateCV(), 300);
        }
        return;
      } else {
        setFormData(prev => ({ ...prev, [step.field!]: value }));
      }
    }

    addMsg("user", value);
    setInputValue("");
    proceedToNext();
  };

  const generateCV = () => {
    setIsGenerating(true);
    addMsg("bot", "Building your ATS-optimized resume...");

    setTimeout(() => {
      const cv: GeneratedCV = {
        id: `cv_${crypto.randomUUID()}`,
        personalInfo: {
          name: formData.fullName, email: formData.email, phone: formData.phone,
          location: formData.location, linkedIn: formData.linkedIn || undefined,
          portfolio: formData.portfolio || undefined,
        },
        summary: formData.summary,
        skills: formData.skills,
        experience: formData.experiences,
        education: [{
          degree: formData.education_degree || "",
          institution: formData.education_institution || "",
          location: formData.location,
          graduationYear: formData.education_year || "",
        }],
        certifications: formData.certifications,
        languages: formData.languages,
        createdAt: new Date().toISOString(),
      };

      setGeneratedCV(cv);
      saveGeneratedCV(cv);
      updateProfile({ name: formData.fullName, phone: formData.phone, skills: formData.skills });
      resumeApi.save(cv as unknown as Record<string, unknown>, "draft").catch((err) => {
        console.warn("Resume draft save failed:", err);
      });

      setIsGenerating(false);
      addMsg("bot", "Your resume is ready! Review it below.");
      setShowPreview(true);
      setIsComplete(true);
    }, 1500);
  };

  const acceptCV = () => {
    if (!generatedCV) return;
    setCvAccepted(true);
    resumeApi.save(generatedCV as unknown as Record<string, unknown>, "final").catch((err) => {
      console.warn("Resume final save failed:", err);
    });
    addMsg("bot", "Resume saved! You can now download it or search for matching jobs.");
  };

  const downloadPDF = () => {
    if (!generatedCV) return;
    // Generate a clean HTML resume and print to PDF
    const html = buildResumeHTML(generatedCV);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const step = STEPS[currentStep];
  const showTextInput = !isComplete && !isGenerating && step && !step.options && !step.selectOptions;

  return (
    <>
      <style>{chatStyles}</style>
      <div className="rc-container">
        {/* Header */}
        <div className="rc-header">
          <div className="rc-header-left">
            <div className="rc-bot-dot" />
            <div>
              <span className="rc-header-title">AI Resume Builder</span>
              <span className="rc-header-sub">
                {cvAccepted ? "Resume ready" : isComplete ? "Review your resume" : `Step ${currentStep + 1} of ${STEPS.length}`}
              </span>
            </div>
          </div>
          {cvAccepted && <span className="rc-ready-badge"><CheckIcon size={12} /> Ready</span>}
        </div>

        {/* Progress */}
        {!isComplete && (
          <div className="rc-progress-bar">
            <div className="rc-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Messages */}
        <div className="rc-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`rc-msg rc-msg-${msg.role}`}>
              <div className="rc-msg-avatar">
                {msg.role === "bot" ? <BotIcon size={14} color="#3b82f6" /> : <UserIcon size={14} color="#a78bfa" />}
              </div>
              <div className="rc-msg-bubble">{msg.content}</div>
            </div>
          ))}

          {/* Options */}
          {step?.options && !isComplete && currentStep === 0 && (
            <div className="rc-options">
              {step.options.map((opt, i) => (
                <button key={i} onClick={() => handleOptionSelect(opt)} className="rc-option-btn">{opt}</button>
              ))}
            </div>
          )}

          {/* Select */}
          {step?.selectOptions && !isComplete && !step.options && (
            <div className="rc-select-wrap">
              <select className="rc-select" onChange={(e) => handleSelectChange(e.target.value)} defaultValue="">
                <option value="" disabled>Select...</option>
                {step.selectOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
          )}

          {/* CV Preview */}
          {showPreview && generatedCV && (
            <div className="rc-cv-section">
              <div className="rc-cv-actions">
                {!cvAccepted ? (
                  <>
                    <button className="jr-btn jr-btn-primary" onClick={acceptCV}><CheckIcon size={14} /> Accept Resume</button>
                    <button className="jr-btn jr-btn-secondary" onClick={downloadPDF}><DownloadIcon size={14} /> Download PDF</button>
                  </>
                ) : (
                  <>
                    <button className="jr-btn jr-btn-primary" onClick={() => onNavigateToSearch?.()}>
                      <SearchIcon size={14} /> Find Jobs <ArrowRightIcon size={14} />
                    </button>
                    <button className="jr-btn jr-btn-secondary" onClick={downloadPDF}><DownloadIcon size={14} /> Download PDF</button>
                  </>
                )}
              </div>

              <div className="rc-cv-preview">
                <div className="rc-cv-name">{generatedCV.personalInfo.name}</div>
                <div className="rc-cv-contact">
                  {generatedCV.personalInfo.email} | {generatedCV.personalInfo.phone} | {generatedCV.personalInfo.location}
                  {generatedCV.personalInfo.linkedIn && ` | ${generatedCV.personalInfo.linkedIn}`}
                </div>

                <div className="rc-cv-section-title">Professional Summary</div>
                <p className="rc-cv-text">{generatedCV.summary}</p>

                <div className="rc-cv-section-title">Technical Skills</div>
                <p className="rc-cv-text">{generatedCV.skills.join(" · ")}</p>

                {generatedCV.experience.length > 0 && (
                  <>
                    <div className="rc-cv-section-title">Work Experience</div>
                    {generatedCV.experience.map((exp, i) => (
                      <div key={i} className="rc-cv-exp">
                        <div className="rc-cv-exp-header">
                          <strong>{exp.title}</strong> — {exp.company}
                        </div>
                        <div className="rc-cv-exp-meta">{exp.startDate} – {exp.endDate} | {exp.location}</div>
                        <ul className="rc-cv-list">
                          {exp.highlights.map((h, j) => <li key={j}>{h}</li>)}
                        </ul>
                      </div>
                    ))}
                  </>
                )}

                <div className="rc-cv-section-title">Education</div>
                {generatedCV.education.map((edu, i) => (
                  <p key={i} className="rc-cv-text"><strong>{edu.degree}</strong> — {edu.institution}, {edu.graduationYear}</p>
                ))}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="rc-generating">
              <span className="jr-spinner" /> Processing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {showTextInput && (
          <form onSubmit={handleSubmit} className="rc-input-bar">
            {step.inputType === "textarea" ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={step.placeholder || "Type your answer..."}
                className="rc-input rc-textarea"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={step.placeholder || "Type your answer..."}
                className="rc-input"
              />
            )}
            <button type="submit" className="rc-send-btn" disabled={!inputValue.trim()}>
              <SendIcon size={18} />
            </button>
          </form>
        )}
      </div>
    </>
  );
}

// ─── PDF HTML Builder ───────────────────────────────────────────────────────

function buildResumeHTML(cv: GeneratedCV): string {
  const expHTML = cv.experience.map(exp => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <strong>${exp.title}</strong>
        <span style="color:#666;font-size:0.85em">${exp.startDate} – ${exp.endDate}</span>
      </div>
      <div style="color:#444">${exp.company} | ${exp.location}</div>
      <ul style="margin:6px 0;padding-left:20px">${exp.highlights.map(h => `<li>${h}</li>`).join("")}</ul>
    </div>
  `).join("");

  const eduHTML = cv.education.map(edu => `
    <p><strong>${edu.degree}</strong> — ${edu.institution}, ${edu.graduationYear}</p>
  `).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${cv.personalInfo.name} - Resume</title>
<style>
  @page { margin: 0.7in; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; font-size: 10.5pt; line-height: 1.5; padding: 40px; }
  h1 { font-size: 22pt; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 4px; }
  .contact { color: #555; font-size: 9.5pt; margin-bottom: 16px; }
  .section-title { font-size: 11pt; font-weight: 700; color: #1a1a2e; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #2563eb; padding-bottom: 3px; margin: 18px 0 10px; }
  p { margin-bottom: 6px; }
  ul { margin: 4px 0; }
  li { margin-bottom: 2px; }
</style></head><body>
  <h1>${cv.personalInfo.name}</h1>
  <div class="contact">${cv.personalInfo.email} | ${cv.personalInfo.phone} | ${cv.personalInfo.location}${cv.personalInfo.linkedIn ? ` | ${cv.personalInfo.linkedIn}` : ""}</div>
  <div class="section-title">Professional Summary</div>
  <p>${cv.summary}</p>
  <div class="section-title">Technical Skills</div>
  <p>${cv.skills.join(" · ")}</p>
  ${cv.experience.length > 0 ? `<div class="section-title">Work Experience</div>${expHTML}` : ""}
  <div class="section-title">Education</div>
  ${eduHTML}
</body></html>`;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const chatStyles = `
  .rc-container {
    display: flex; flex-direction: column; height: 640px;
    background: #0f1117; border: 1px solid #1e293b; border-radius: 12px;
    overflow: hidden;
  }

  /* Header */
  .rc-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid #1e293b;
    background: #111318;
  }
  .rc-header-left { display: flex; align-items: center; gap: 10px; }
  .rc-bot-dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.4); }
  .rc-header-title { display: block; font-size: 0.875rem; font-weight: 600; color: #f1f5f9; }
  .rc-header-sub { display: block; font-size: 0.6875rem; color: #64748b; }
  .rc-ready-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 12px;
    font-size: 0.6875rem; font-weight: 600;
    background: rgba(34, 197, 94, 0.1); color: #22c55e;
  }

  /* Progress */
  .rc-progress-bar { height: 3px; background: #1e293b; }
  .rc-progress-fill { height: 100%; background: #3b82f6; transition: width 0.3s ease; }

  /* Messages */
  .rc-messages { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
  .rc-msg { display: flex; gap: 8px; align-items: flex-start; max-width: 85%; }
  .rc-msg-bot { align-self: flex-start; }
  .rc-msg-user { align-self: flex-end; flex-direction: row-reverse; }
  .rc-msg-avatar {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .rc-msg-bot .rc-msg-avatar { background: #1e293b; }
  .rc-msg-user .rc-msg-avatar { background: #2d1b69; }
  .rc-msg-bubble {
    padding: 10px 14px; border-radius: 12px;
    font-size: 0.8125rem; line-height: 1.5; white-space: pre-wrap;
  }
  .rc-msg-bot .rc-msg-bubble { background: #1e293b; color: #e2e8f0; border-bottom-left-radius: 4px; }
  .rc-msg-user .rc-msg-bubble { background: #3b82f6; color: white; border-bottom-right-radius: 4px; }

  /* Options */
  .rc-options { display: flex; gap: 8px; margin-left: 34px; flex-wrap: wrap; }
  .rc-option-btn {
    padding: 8px 16px; border-radius: 8px;
    background: #1e293b; border: 1px solid #2d3748;
    color: #e2e8f0; font-size: 0.8125rem; font-weight: 500;
    cursor: pointer; transition: all 0.15s ease;
  }
  .rc-option-btn:hover { background: #2d3748; border-color: #3b82f6; }

  /* Select */
  .rc-select-wrap { margin-left: 34px; }
  .rc-select {
    padding: 10px 14px; border-radius: 8px;
    background: #0a0a0f; border: 1px solid #2d3748;
    color: #e2e8f0; font-size: 0.8125rem;
    min-width: 200px; cursor: pointer;
  }
  .rc-select:focus { outline: none; border-color: #3b82f6; }

  /* CV Preview */
  .rc-cv-section { margin-top: 8px; }
  .rc-cv-actions { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
  .rc-cv-preview {
    background: #fafafa; color: #1a1a2e; padding: 28px;
    border-radius: 8px; font-size: 0.8125rem; line-height: 1.6;
  }
  .rc-cv-name { font-size: 1.25rem; font-weight: 700; margin-bottom: 2px; color: #0f172a; }
  .rc-cv-contact { font-size: 0.75rem; color: #64748b; margin-bottom: 16px; }
  .rc-cv-section-title {
    font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: #0f172a;
    border-bottom: 2px solid #3b82f6; padding-bottom: 2px;
    margin: 16px 0 8px;
  }
  .rc-cv-text { margin: 0 0 4px; color: #334155; }
  .rc-cv-exp { margin-bottom: 12px; }
  .rc-cv-exp-header { font-size: 0.8125rem; color: #0f172a; }
  .rc-cv-exp-meta { font-size: 0.75rem; color: #64748b; margin-bottom: 4px; }
  .rc-cv-list { padding-left: 18px; margin: 4px 0; }
  .rc-cv-list li { color: #475569; margin-bottom: 2px; }

  /* Generating */
  .rc-generating {
    display: flex; align-items: center; gap: 8px;
    margin-left: 34px; color: #64748b; font-size: 0.8125rem;
  }

  /* Input Bar */
  .rc-input-bar {
    display: flex; gap: 8px; padding: 14px 20px;
    border-top: 1px solid #1e293b; background: #111318;
  }
  .rc-input {
    flex: 1; padding: 10px 14px; border-radius: 8px;
    background: #0a0a0f; border: 1px solid #2d3748;
    color: #e2e8f0; font-size: 0.8125rem;
  }
  .rc-input:focus { outline: none; border-color: #3b82f6; }
  .rc-input::placeholder { color: #475569; }
  .rc-textarea { min-height: 56px; resize: none; font-family: inherit; }
  .rc-send-btn {
    width: 40px; height: 40px; border-radius: 8px;
    background: #3b82f6; border: none; color: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.15s ease; flex-shrink: 0;
  }
  .rc-send-btn:hover { background: #2563eb; }
  .rc-send-btn:disabled { background: #1e3a5f; cursor: not-allowed; }
`;
