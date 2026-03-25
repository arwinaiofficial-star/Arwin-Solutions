"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { useAuth, GeneratedCV, WorkExperience, Education } from "@/context/AuthContext";
import { resumeApi, chatSessionApi } from "@/lib/api/client";
import {
  SendIcon,
  BotIcon,
  UserIcon,
  CheckIcon,
  SearchIcon,
  ArrowRightIcon,
  DownloadIcon,
  DocumentIcon,
  UploadIcon,
} from "@/components/icons/Icons";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  options?: string[];
  cards?: EntryCard[];
  inputType?: "text" | "textarea" | "select" | "file";
  selectOptions?: string[];
  field?: string;
}

interface EntryCard {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}

interface CVFormData {
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

type AgentPhase =
  | "entry_selection"     // 3 entry options
  | "cv_upload"           // Uploading existing CV
  | "linkedin_import"     // LinkedIn-based import
  | "conversational"      // AI-guided creation
  | "review_extracted"    // Review data extracted from upload
  | "generating"          // Generating final CV
  | "complete";           // CV ready

const REQUIRED_FIELDS = [
  "fullName", "email", "phone", "location", "yearsOfExperience",
  "skills", "education_degree", "education_institution", "education_year",
];

const ENTRY_CARDS: EntryCard[] = [
  {
    id: "upload",
    icon: <DocumentIcon size={20} />,
    title: "I already have a CV",
    description: "Upload your PDF and I'll enhance it into a professional ATS-friendly format",
  },
  {
    id: "linkedin",
    icon: <SearchIcon size={20} />,
    title: "Import from LinkedIn",
    description: "Share your LinkedIn profile and I'll build your CV from your professional data",
  },
  {
    id: "scratch",
    icon: <BotIcon size={20} />,
    title: "Create from scratch",
    description: "Just tell me about yourself naturally — I'll handle the formatting and structure",
  },
];

interface AgenticChatProps {
  onNavigateToSearch?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AgenticChat({ onNavigateToSearch }: AgenticChatProps) {
  const { user, saveGeneratedCV, updateProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [phase, setPhase] = useState<AgentPhase>("entry_selection");
  const [formData, setFormData] = useState<CVFormData>({
    fullName: user?.name || "", email: user?.email || "",
    phone: user?.phone || "", location: "", linkedIn: "", portfolio: "",
    summary: "", yearsOfExperience: "", skills: [], experiences: [],
    education: [], education_degree: "", education_institution: "",
    education_year: "", certifications: [], languages: [],
  });
  const [generatedCV, setGeneratedCV] = useState<GeneratedCV | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [cvAccepted, setCvAccepted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgCounter = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate progress based on filled fields
  const filledFields = REQUIRED_FIELDS.filter(f => {
    const val = formData[f as keyof CVFormData];
    if (Array.isArray(val)) return val.length > 0;
    return typeof val === "string" && val.trim() !== "";
  });
  const progress = phase === "complete" ? 100 : Math.round((filledFields.length / REQUIRED_FIELDS.length) * 100);

  // ─── Auto-scroll & focus ─────────────────────────────────────────────────
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (!isRestoringSession) inputRef.current?.focus(); }, [phase, isRestoringSession]);

  // ─── Session restore on mount ────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const result = await chatSessionApi.getSession();
        if (result.data?.session) {
          const s = result.data.session;
          setSessionId(s.id);
          setMessages(s.messages as Message[]);
          setFormData(prev => ({ ...prev, ...(s.collected_data as Partial<CVFormData>) }));
          const restoredPhase = (s.agent_state as { phase?: AgentPhase })?.phase;
          if (restoredPhase && restoredPhase !== "entry_selection") {
            setPhase(restoredPhase);
          } else {
            showWelcome();
          }
        } else {
          showWelcome();
        }
      } catch {
        showWelcome();
      }
      setIsRestoringSession(false);
    };
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auto-save (debounced) ───────────────────────────────────────────────
  const autoSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const result = await chatSessionApi.saveSession({
          session_id: sessionId || undefined,
          messages: messages as unknown[],
          agent_state: { phase, missing_fields: getMissingFields() },
          collected_data: formData as unknown as Record<string, unknown>,
        });
        if (result.data?.id && !sessionId) {
          setSessionId(result.data.id);
        }
      } catch { /* silent fail for auto-save */ }
    }, 2000);
  }, [messages, formData, phase, sessionId]);

  useEffect(() => {
    if (!isRestoringSession && phase !== "entry_selection" && messages.length > 1) {
      autoSave();
    }
  }, [messages, formData, phase, isRestoringSession, autoSave]);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const addMsg = useCallback((role: "bot" | "user", content: string, extra?: Partial<Message>) => {
    const id = `m_${++msgCounter.current}`;
    setMessages(prev => [...prev, { id, role, content, ...extra }]);
  }, []);

  const getMissingFields = useCallback((): string[] => {
    return REQUIRED_FIELDS.filter(f => {
      const val = formData[f as keyof CVFormData];
      if (Array.isArray(val)) return val.length === 0;
      return typeof val === "string" && val.trim() === "";
    });
  }, [formData]);

  const showWelcome = () => {
    const id = `m_${++msgCounter.current}`;
    setMessages([{
      id,
      role: "bot",
      content: `Hi${user?.name ? ` ${user.name.split(" ")[0]}` : ""}! 👋 I'm your AI resume assistant. I'll help you create a professional, ATS-optimized resume.\n\nHow would you like to get started?`,
      cards: ENTRY_CARDS,
    }]);
  };

  // ─── Entry Card Selection ────────────────────────────────────────────────

  const handleEntrySelect = async (cardId: string) => {
    const card = ENTRY_CARDS.find(c => c.id === cardId);
    if (!card) return;
    addMsg("user", card.title);

    switch (cardId) {
      case "upload":
        setPhase("cv_upload");
        addMsg("bot", "Great! Please upload your CV in PDF format. I'll extract your details and enhance them for ATS compatibility.", { inputType: "file" });
        break;

      case "linkedin":
        setPhase("linkedin_import");
        addMsg("bot",
          "I'll help build your CV from your LinkedIn profile.\n\n" +
          "Please paste your LinkedIn profile URL (e.g., linkedin.com/in/yourname), and then I'll ask you a few quick questions to fill in the details.",
          { inputType: "text" }
        );
        break;

      case "scratch":
        setPhase("conversational");
        // Pre-fill what we know from auth
        const greetName = user?.name ? ` I see your name is ${user.name}.` : "";
        addMsg("bot",
          `Let's build your resume from scratch!${greetName}\n\n` +
          "Just tell me about yourself naturally — your experience, skills, education. " +
          "You can say something like:\n\n" +
          "\"I'm a software developer with 3 years at TCS, skilled in React and Python, B.Tech from IIT Delhi\"\n\n" +
          "Or you can answer one question at a time — whatever feels comfortable!",
          { inputType: "text" }
        );
        break;
    }
  };

  // ─── CV Upload Flow ──────────────────────────────────────────────────────

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    addMsg("user", `Uploaded: ${file.name}`);
    addMsg("bot", "Processing your CV... I'm extracting and structuring your information.");

    try {
      const result = await resumeApi.uploadCV(file);
      if (result.error) {
        addMsg("bot", `⚠️ ${result.error}\n\nPlease try uploading again or choose "Create from scratch" instead.`);
        setIsUploading(false);
        return;
      }

      if (result.data?.extractedData) {
        const extracted = result.data.extractedData as Record<string, unknown>;
        // Map extracted data to form
        setFormData(prev => ({
          ...prev,
          fullName: (extracted.fullName as string) || prev.fullName,
          email: (extracted.email as string) || prev.email,
          phone: (extracted.phone as string) || prev.phone,
          location: (extracted.location as string) || prev.location,
          linkedIn: (extracted.linkedIn as string) || prev.linkedIn,
          summary: (extracted.summary as string) || prev.summary,
          yearsOfExperience: (extracted.yearsOfExperience as string) || prev.yearsOfExperience,
          skills: (extracted.skills as string[]) || prev.skills,
          experiences: (extracted.experiences as WorkExperience[]) || prev.experiences,
          education_degree: ((extracted.education as Array<{degree: string}>)?.[0]?.degree) || prev.education_degree,
          education_institution: ((extracted.education as Array<{institution: string}>)?.[0]?.institution) || prev.education_institution,
          education_year: ((extracted.education as Array<{graduationYear: string}>)?.[0]?.graduationYear) || prev.education_year,
          certifications: (extracted.certifications as string[]) || prev.certifications,
          languages: (extracted.languages as string[]) || prev.languages,
        }));

        setPhase("review_extracted");
        const name = extracted.fullName || "your details";
        const skillCount = (extracted.skills as string[])?.length || 0;
        const expCount = (extracted.experiences as WorkExperience[])?.length || 0;
        addMsg("bot",
          `I've extracted the following from your CV:\n\n` +
          `📛 **Name:** ${name}\n` +
          `💼 **Experience:** ${expCount} role${expCount !== 1 ? "s" : ""}\n` +
          `🛠 **Skills:** ${skillCount} identified\n\n` +
          `Would you like me to proceed and generate your ATS-optimized resume, or would you like to review and update any details first?`,
          { options: ["Generate my resume", "Let me update some details"] }
        );
      } else {
        // No LLM extraction — fall back to conversational with raw text context
        setPhase("conversational");
        addMsg("bot",
          "I've read your CV. Let me ask a few questions to make sure everything is captured correctly.\n\n" +
          "What's your full name and current job title?"
        );
      }
    } catch {
      addMsg("bot", "Something went wrong processing your file. Let's try another approach — just tell me about yourself and I'll build your resume.");
      setPhase("conversational");
    }
    setIsUploading(false);
  };

  // ─── Conversational AI Handler ───────────────────────────────────────────

  const handleConversationalInput = async (value: string) => {
    addMsg("user", value);
    setIsGenerating(true);

    try {
      // Check if this is a LinkedIn URL (for linkedin_import phase)
      if (phase === "linkedin_import" && value.includes("linkedin.com")) {
        setFormData(prev => ({ ...prev, linkedIn: value.trim() }));
        addMsg("bot",
          "Thanks! I've noted your LinkedIn profile. Now let me ask a few questions to build your complete CV.\n\n" +
          "What's your full name and current or most recent job title?"
        );
        setPhase("conversational");
        setIsGenerating(false);
        return;
      }

      // Use LLM to parse the response
      const result = await resumeApi.chat(value, "chat", {
        task: "parse_cv_input",
        current_data: formData,
        missing_fields: getMissingFields(),
        phase,
      });

      if (result.data?.reply) {
        // Try to parse structured extraction from the LLM
        try {
          const parsed = JSON.parse(result.data.reply);
          if (parsed.understood_message) {
            // Update form data with extracted fields
            const updates: Partial<CVFormData> = {};
            if (parsed.fullName) updates.fullName = parsed.fullName;
            if (parsed.email) updates.email = parsed.email;
            if (parsed.phone) updates.phone = parsed.phone;
            if (parsed.location) updates.location = parsed.location;
            if (parsed.linkedIn) updates.linkedIn = parsed.linkedIn;
            if (parsed.yearsOfExperience) updates.yearsOfExperience = parsed.yearsOfExperience;
            if (parsed.skills && Array.isArray(parsed.skills)) updates.skills = parsed.skills;
            if (parsed.summary) updates.summary = parsed.summary;
            if (parsed.education_degree) updates.education_degree = parsed.education_degree;
            if (parsed.education_institution) updates.education_institution = parsed.education_institution;
            if (parsed.education_year) updates.education_year = parsed.education_year;
            if (parsed.experiences && Array.isArray(parsed.experiences)) {
              updates.experiences = parsed.experiences.map((exp: Record<string, unknown>) => ({
                title: (exp.title as string) || "",
                company: (exp.company as string) || "",
                location: (exp.location as string) || "",
                startDate: (exp.startDate as string) || "",
                endDate: (exp.endDate as string) || "",
                current: (exp.endDate as string)?.toLowerCase() === "present",
                highlights: (exp.highlights as string[]) || [],
              }));
            }

            setFormData(prev => ({ ...prev, ...updates }));

            // Check if we have enough data
            const updatedFormData = { ...formData, ...updates };
            const stillMissing = REQUIRED_FIELDS.filter(f => {
              const val = updatedFormData[f as keyof CVFormData];
              if (Array.isArray(val)) return val.length === 0;
              return typeof val === "string" && val.trim() === "";
            });

            if (stillMissing.length === 0) {
              addMsg("bot",
                `${parsed.understood_message}\n\n` +
                "I now have all the information I need! Ready to generate your ATS-optimized resume?",
                { options: ["Generate my resume", "Let me add more details"] }
              );
            } else {
              const nextQ = parsed.next_question || getSmartFollowUp(stillMissing);
              addMsg("bot", `${parsed.understood_message}\n\n${nextQ}`);
            }

            setIsGenerating(false);
            return;
          }
        } catch { /* Not JSON, treat as plain text response */ }

        // Plain text response from LLM
        addMsg("bot", result.data.reply);
      } else {
        // Fallback: try local parsing
        handleLocalParsing(value);
      }
    } catch {
      handleLocalParsing(value);
    }

    setIsGenerating(false);
  };

  const handleLocalParsing = (value: string) => {
    const lower = value.toLowerCase();
    const updates: Partial<CVFormData> = {};

    // Smart local parsing for common patterns
    // Email
    const emailMatch = value.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    if (emailMatch) updates.email = emailMatch[0];

    // Phone
    const phoneMatch = value.match(/[\+]?[\d\s-]{10,}/);
    if (phoneMatch) updates.phone = phoneMatch[0].trim();

    // Years of experience
    const expMatch = lower.match(/(\d+)\s*(?:\+\s*)?(?:years?|yrs?)/);
    if (expMatch) {
      const years = parseInt(expMatch[1]);
      if (years === 0) updates.yearsOfExperience = "Fresher (0-1 years)";
      else if (years <= 3) updates.yearsOfExperience = "1-3 years";
      else if (years <= 5) updates.yearsOfExperience = "3-5 years";
      else if (years <= 8) updates.yearsOfExperience = "5-8 years";
      else if (years <= 12) updates.yearsOfExperience = "8-12 years";
      else updates.yearsOfExperience = "12+ years";
    }

    // Name (if starts like a name and fullName is empty)
    if (!formData.fullName && /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(value.trim())) {
      const nameParts = value.trim().split(/\s+/);
      if (nameParts.length >= 2 && nameParts.length <= 4) {
        updates.fullName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
      }
    }

    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
    }

    const missing = getMissingFields();
    addMsg("bot", `Got it! ${getSmartFollowUp(missing)}`);
  };

  const getSmartFollowUp = (missing: string[]): string => {
    if (missing.length === 0) return "I have everything I need! Shall I generate your resume?";

    const fieldQuestions: Record<string, string> = {
      fullName: "What's your full name?",
      email: "What's your professional email address?",
      phone: "What's your contact number?",
      location: "Where are you currently located? (e.g., Bangalore, Mumbai, Remote)",
      yearsOfExperience: "How many years of work experience do you have?",
      skills: "What are your key skills? (e.g., React, Python, SQL, AWS)",
      education_degree: "What's your highest degree or qualification?",
      education_institution: "Which institution did you study at?",
      education_year: "What year did you graduate?",
    };

    // Prioritize in a natural order
    const priority = ["fullName", "yearsOfExperience", "skills", "location", "education_degree", "education_institution", "education_year", "email", "phone"];
    for (const field of priority) {
      if (missing.includes(field)) {
        return fieldQuestions[field] || `Can you tell me about your ${field}?`;
      }
    }
    return fieldQuestions[missing[0]] || "Tell me more about yourself.";
  };

  // ─── Option Selection ────────────────────────────────────────────────────

  const handleOptionSelect = (option: string) => {
    addMsg("user", option);

    if (option === "Generate my resume") {
      generateCV();
    } else if (option === "Let me update some details" || option === "Let me add more details") {
      setPhase("conversational");
      const missing = getMissingFields();
      if (missing.length > 0) {
        addMsg("bot", `Sure! ${getSmartFollowUp(missing)}`);
      } else {
        addMsg("bot", "All fields are filled! What would you like to update? You can tell me naturally, like \"change my location to Mumbai\" or \"add Python to my skills\".");
      }
    }
  };

  // ─── Submit Handler ──────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating || isUploading) return;
    const value = inputValue.trim();
    setInputValue("");
    await handleConversationalInput(value);
  };

  // ─── CV Generation ──────────────────────────────────────────────────────

  const generateCV = async () => {
    setPhase("generating");
    setIsGenerating(true);
    addMsg("bot", "🔄 Building your ATS-optimized resume...");

    // Generate summary if missing
    let summary = formData.summary;
    if (!summary) {
      try {
        const result = await resumeApi.chat("", "generate_summary", {
          fullName: formData.fullName,
          yearsOfExperience: formData.yearsOfExperience,
          skills: formData.skills,
          location: formData.location,
          experiences: formData.experiences,
          education_degree: formData.education_degree,
          education_institution: formData.education_institution,
        });
        if (result.data?.reply) summary = result.data.reply;
      } catch { /* use fallback */ }

      if (!summary) {
        const topSkills = formData.skills.slice(0, 3).join(", ");
        summary = `Results-driven professional with ${formData.yearsOfExperience || "proven"} experience specializing in ${topSkills || "technology"}. Committed to delivering impactful solutions and collaborating effectively with cross-functional teams.`;
      }
    }

    const cv: GeneratedCV = {
      id: `cv_${crypto.randomUUID()}`,
      personalInfo: {
        name: formData.fullName, email: formData.email, phone: formData.phone,
        location: formData.location, linkedIn: formData.linkedIn || undefined,
        portfolio: formData.portfolio || undefined,
      },
      summary,
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
    resumeApi.save(cv as unknown as Record<string, unknown>, "draft").catch(() => {});

    setIsGenerating(false);
    setPhase("complete");
    addMsg("bot", "Your ATS-optimized resume is ready. Review it below and either accept it or make changes.");
    setShowPreview(true);
  };

  const acceptCV = () => {
    if (!generatedCV) return;
    setCvAccepted(true);
    resumeApi.save(generatedCV as unknown as Record<string, unknown>, "final").catch(() => {});
    addMsg("bot", "Resume saved. You can download it as PDF or search for matching jobs.");
  };

  const downloadPDF = () => {
    if (!generatedCV) return;
    const html = buildResumeHTML(generatedCV);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  const showTextInput = !["entry_selection", "generating", "complete"].includes(phase) && !isGenerating && !isUploading;

  if (isRestoringSession) {
    return (
      <>
        <style>{chatStyles}</style>
        <div className="rc-container">
          <div className="rc-header">
            <div className="rc-header-left">
              <div className="rc-bot-dot" />
              <div>
                <span className="rc-header-title">AI Resume Builder</span>
                <span className="rc-header-sub">Restoring your session...</span>
              </div>
            </div>
          </div>
          <div className="rc-messages" style={{ alignItems: "center", justifyContent: "center" }}>
            <div className="rc-generating"><span className="jr-spinner" /> Loading your progress...</div>
          </div>
        </div>
      </>
    );
  }

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
                {cvAccepted ? "Resume ready" : phase === "complete" ? "Review your resume" : phase === "entry_selection" ? "Choose how to start" : `${progress}% complete`}
              </span>
            </div>
          </div>
          {cvAccepted && <span className="rc-ready-badge"><CheckIcon size={12} /> Ready</span>}
        </div>

        {/* Progress */}
        {!["entry_selection", "complete"].includes(phase) && (
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

          {/* Entry Cards */}
          {phase === "entry_selection" && messages.length > 0 && messages[messages.length - 1].cards && (
            <div className="rc-entry-cards">
              {ENTRY_CARDS.map((card) => (
                <button key={card.id} onClick={() => handleEntrySelect(card.id)} className="rc-entry-card">
                  <span className="rc-entry-icon">{card.icon}</span>
                  <span className="rc-entry-title">{card.title}</span>
                  <span className="rc-entry-desc">{card.description}</span>
                </button>
              ))}
            </div>
          )}

          {/* Options buttons */}
          {messages.length > 0 && messages[messages.length - 1].options && phase !== "complete" && (
            <div className="rc-options">
              {messages[messages.length - 1].options!.map((opt, i) => (
                <button key={i} onClick={() => handleOptionSelect(opt)} className="rc-option-btn">{opt}</button>
              ))}
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

          {(isGenerating || isUploading) && (
            <div className="rc-generating">
              <span className="jr-spinner" /> {isUploading ? "Processing your CV..." : "Thinking..."}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* File Upload Input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
            e.target.value = "";
          }}
        />

        {/* Input Bar */}
        {phase === "cv_upload" && !isUploading && (
          <div className="rc-input-bar">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rc-upload-btn"
            >
              <UploadIcon size={18} /> Choose PDF or DOCX file
            </button>
          </div>
        )}

        {showTextInput && phase !== "cv_upload" && (
          <form onSubmit={handleSubmit} className="rc-input-bar">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                phase === "linkedin_import"
                  ? "Paste your LinkedIn URL..."
                  : "Tell me about yourself..."
              }
              className="rc-input"
              disabled={isGenerating}
            />
            <button type="submit" className="rc-send-btn" disabled={!inputValue.trim() || isGenerating}>
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
  .rc-bot-dot { width: 10px; height: 10px; border-radius: 50%; background: #60a5fa; box-shadow: 0 0 6px rgba(96, 165, 250, 0.4); }
  .rc-header-title { display: block; font-size: 0.875rem; font-weight: 600; color: #f1f5f9; }
  .rc-header-sub { display: block; font-size: 0.6875rem; color: #64748b; }
  .rc-ready-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 12px;
    font-size: 0.6875rem; font-weight: 600;
    background: rgba(37, 99, 235, 0.1); color: #60a5fa;
  }

  /* Progress */
  .rc-progress-bar { height: 3px; background: #1e293b; }
  .rc-progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); transition: width 0.5s ease; }

  /* Messages */
  .rc-messages { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
  .rc-msg { display: flex; gap: 8px; align-items: flex-start; max-width: 85%; animation: rc-fadeIn 0.2s ease; }
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
    font-size: 0.8125rem; line-height: 1.6; white-space: pre-wrap;
  }
  .rc-msg-bot .rc-msg-bubble { background: #1e293b; color: #e2e8f0; border-bottom-left-radius: 4px; }
  .rc-msg-user .rc-msg-bubble { background: #3b82f6; color: white; border-bottom-right-radius: 4px; }

  @keyframes rc-fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  /* Entry Cards */
  .rc-entry-cards {
    display: flex; flex-direction: column; gap: 8px;
    margin-left: 34px; animation: rc-fadeIn 0.3s ease;
  }
  .rc-entry-card {
    display: flex; flex-direction: column; gap: 4px;
    padding: 14px 16px; border-radius: 10px;
    background: #131620; border: 1px solid #1e293b;
    cursor: pointer; transition: all 0.2s ease;
    text-align: left;
  }
  .rc-entry-card:hover { border-color: #3b82f6; background: #151a2a; transform: translateY(-1px); }
  .rc-entry-icon { font-size: 1.25rem; }
  .rc-entry-title { font-size: 0.875rem; font-weight: 600; color: #f1f5f9; }
  .rc-entry-desc { font-size: 0.75rem; color: #64748b; line-height: 1.4; }

  /* Options */
  .rc-options { display: flex; gap: 8px; margin-left: 34px; flex-wrap: wrap; animation: rc-fadeIn 0.3s ease; }
  .rc-option-btn {
    padding: 8px 16px; border-radius: 8px;
    background: #1e293b; border: 1px solid #2d3748;
    color: #e2e8f0; font-size: 0.8125rem; font-weight: 500;
    cursor: pointer; transition: all 0.15s ease;
  }
  .rc-option-btn:hover { background: #2d3748; border-color: #3b82f6; }

  /* CV Preview */
  .rc-cv-section { margin-top: 8px; animation: rc-fadeIn 0.3s ease; }
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
    animation: rc-fadeIn 0.2s ease;
  }

  /* Upload Button */
  .rc-upload-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 14px 20px; border-radius: 10px;
    background: #131620; border: 2px dashed #2d3748;
    color: #94a3b8; font-size: 0.875rem; font-weight: 500;
    cursor: pointer; transition: all 0.2s ease;
  }
  .rc-upload-btn:hover { border-color: #3b82f6; color: #e2e8f0; background: #151a2a; }

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
  .rc-input:disabled { opacity: 0.5; }
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
