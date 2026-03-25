"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { BotIcon, SearchIcon, SendIcon, SparklesIcon, XIcon } from "@/components/icons/Icons";
import { resumeApi } from "@/lib/api/client";
import { normalizeEducationRecord, normalizeEducationRecords } from "@/lib/resumeExtraction";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "ai" | "user" | "action";
  text: string;
  time: string;
  actions?: CopilotAction[];
}

export interface CopilotAction {
  type: "navigate" | "fill_field" | "enhance" | "generate" | "download" | "analyze" | "command";
  label: string;
  payload: Record<string, unknown>;
}

export interface AICopilotProps {
  context: string; // "resume" | "jobs" | "tracker" | "settings" | "coverletter"
  cvData?: Record<string, unknown> | null;
  isOpen: boolean;
  onClose: () => void;
  // Action callbacks — this is what makes the copilot action-coupled
  onNavigate?: (view: string) => void;
  onUpdateField?: (field: string, value: unknown) => void;
  onTriggerAction?: (action: string, payload?: Record<string, unknown>) => void;
  // Resume wizard state for deep coupling
  resumeStep?: number;
  resumeData?: Record<string, unknown>;
}
const contextLabels: Record<string, string> = {
  resume: "Resume Builder",
  jobs: "Job Search",
  tracker: "Application Tracker",
  settings: "Settings",
  coverletter: "Cover Letter",
};

function normalizeEducationUpdates(parsed: Record<string, unknown>): Record<string, unknown>[] {
  const normalizedEducation = normalizeEducationRecords(parsed.education);
  if (normalizedEducation.length > 0) {
    return normalizedEducation.map((entry) => ({ ...entry }));
  }

  const normalizedSingle = normalizeEducationRecord(parsed);
  return normalizedSingle ? [{ ...normalizedSingle }] : [];
}

function buildResumeFillActions(parsed: unknown): CopilotAction[] {
  if (!parsed || typeof parsed !== "object") return [];

  const data = parsed as Record<string, unknown>;
  const actions: CopilotAction[] = [];
  const simpleFields = ["fullName", "email", "phone", "location", "linkedIn", "portfolio", "summary"];

  for (const field of simpleFields) {
    const value = data[field];
    if (typeof value === "string" && value.trim()) {
      actions.push({
        type: "fill_field",
        label: `Apply ${field}`,
        payload: { field, value: value.trim() },
      });
    }
  }

  if (Array.isArray(data.skills) && data.skills.some((skill) => typeof skill === "string" && skill.trim())) {
    actions.push({
      type: "fill_field",
      label: "Apply skills",
      payload: { field: "skills", value: data.skills },
    });
  }

  if (Array.isArray(data.experiences) && data.experiences.length > 0) {
    actions.push({
      type: "fill_field",
      label: "Apply experience",
      payload: { field: "experiences", value: data.experiences },
    });
  }

  const educationUpdates = normalizeEducationUpdates(data);
  if (educationUpdates.length > 0) {
    actions.push({
      type: "fill_field",
      label: "Apply education",
      payload: { field: "education", value: educationUpdates },
    });
  }

  return actions;
}

function parseResumeUpdateLocally(text: string): Record<string, unknown> | null {
  const updates: Record<string, unknown> = {};

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) updates.email = emailMatch[0];

  const phoneMatch = text.match(/(?:\+?\d[\d\s()-]{7,}\d)/);
  if (phoneMatch) updates.phone = phoneMatch[0].trim();

  const nameMatch = text.match(/(?:my name is|i am|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i);
  if (nameMatch) updates.fullName = nameMatch[1].trim();

  const locationMatch = text.match(/(?:location|based in|live in|located in)\s+(?:is\s+)?([^.,;\n]+?)(?=\s+(?:and|with|while)\b|[.?!]|$)/i);
  if (locationMatch) updates.location = locationMatch[1].trim();

  const linkedInMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s]+|linkedin\.com\/[^\s]+/i);
  if (linkedInMatch) updates.linkedIn = linkedInMatch[0].trim();

  const portfolioMatch = text.match(/https?:\/\/(?!.*linkedin\.com)[^\s]+/i);
  if (portfolioMatch) updates.portfolio = portfolioMatch[0].trim();

  const skillsMatch = text.match(/skills?(?: include| are|:)?\s+([^.\n]+)/i);
  if (skillsMatch) {
    const skills = skillsMatch[1]
      .split(/,| and /i)
      .map((skill) => skill.trim())
      .filter(Boolean);
    if (skills.length > 0) updates.skills = skills;
  }

  return Object.keys(updates).length > 0 ? updates : null;
}

function summarizeAppliedUpdates(actions: CopilotAction[]): string {
  const labels = actions
    .map((action) => action.payload.field)
    .filter((field): field is string => typeof field === "string");

  if (labels.length === 0) return "I updated your resume details.";
  return `Updated ${labels.join(", ")}.`;
}

function shouldExtractResumeNarrative(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;

  const cues = [
    "experience", "worked", "currently", "skills", "education", "graduated",
    "degree", "certification", "portfolio", "linkedin", "resume", "cv",
  ];
  const cueHits = cues.filter((cue) => normalized.includes(cue)).length;
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const lineCount = normalized.split("\n").filter((line) => line.trim()).length;

  return wordCount >= 25 || lineCount >= 3 || cueHits >= 2;
}

// ─── Suggestion Actions (these trigger real workspace actions, not just chat) ─

interface Suggestion {
  label: string;
  action: "chat" | "direct";
  chatMessage?: string;
  directAction?: CopilotAction;
}

function getSuggestions(context: string, resumeStep?: number, cvData?: Record<string, unknown> | null): Suggestion[] {
  const hasCv = cvData && (cvData as Record<string, unknown>).skills;

  if (context === "resume") {
    // Different suggestions per wizard step
    if (resumeStep === 0) {
      return [
        { label: "Upload my CV", action: "direct", directAction: { type: "enhance", label: "Upload CV", payload: { trigger: "upload" } } },
        { label: "Start from scratch", action: "direct", directAction: { type: "navigate", label: "Go to Personal Info", payload: { step: 1 } } },
        { label: "Tell my story", action: "direct", directAction: { type: "command", label: "Open story composer", payload: { command: "openStoryComposer" } } },
        ...(hasCv ? [{ label: "Jump to Preview", action: "direct" as const, directAction: { type: "navigate" as const, label: "Preview", payload: { step: 5 } } }] : []),
      ];
    }
    if (resumeStep === 1) {
      return [
        { label: "Auto-fill from LinkedIn", action: "chat", chatMessage: "Can you suggest what to put in my personal info section based on my CV data?" },
        { label: "Next: Experience", action: "direct", directAction: { type: "navigate", label: "Go to Experience", payload: { step: 2 } } },
      ];
    }
    if (resumeStep === 2) {
      return [
        { label: "Enhance bullet points", action: "direct", directAction: { type: "enhance", label: "Enhance", payload: { section: "experience" } } },
        { label: "Add achievement metrics", action: "chat", chatMessage: "Help me add quantified achievement metrics to my experience bullet points" },
        { label: "Next: Education", action: "direct", directAction: { type: "navigate", label: "Go to Education", payload: { step: 3 } } },
      ];
    }
    if (resumeStep === 3) {
      return [
        { label: "Next: Skills", action: "direct", directAction: { type: "navigate", label: "Go to Skills", payload: { step: 4 } } },
      ];
    }
    if (resumeStep === 4) {
      return [
        { label: "Suggest missing skills", action: "direct", directAction: { type: "analyze", label: "Suggest Skills", payload: { analyze: "skills_gap" } } },
        { label: "Preview resume", action: "direct", directAction: { type: "navigate", label: "Preview", payload: { step: 5 } } },
      ];
    }
    if (resumeStep === 5) {
      return [
        { label: "Run ATS analysis", action: "direct", directAction: { type: "analyze", label: "ATS Check", payload: { analyze: "ats" } } },
        { label: "Download as PDF", action: "direct", directAction: { type: "download", label: "Download PDF", payload: {} } },
        { label: "Generate summary", action: "direct", directAction: { type: "generate", label: "Generate Summary", payload: { generate: "summary" } } },
        { label: "Find matching jobs", action: "direct", directAction: { type: "navigate", label: "Go to Jobs", payload: { view: "jobs" } } },
      ];
    }
    // Default resume suggestions
    return [
      { label: "Improve my resume", action: "chat", chatMessage: "How can I improve my resume?" },
      { label: "Preview resume", action: "direct", directAction: { type: "navigate", label: "Preview", payload: { step: 5 } } },
    ];
  }

  if (context === "jobs") {
    return [
      { label: "Find matching jobs", action: "direct", directAction: { type: "enhance", label: "Search", payload: { trigger: "search" } } },
      { label: "Best keywords for my field", action: "chat", chatMessage: "What are the best job search keywords for my skills and experience?" },
      { label: "Write cover letter", action: "direct", directAction: { type: "navigate", label: "Cover Letter", payload: { view: "coverletter" } } },
      ...(hasCv ? [] : [{ label: "Build resume first", action: "direct" as const, directAction: { type: "navigate" as const, label: "Resume", payload: { view: "resume" } } }]),
    ];
  }

  if (context === "tracker") {
    return [
      { label: "Interview prep tips", action: "chat", chatMessage: "Give me interview preparation tips based on my tracked applications" },
      { label: "Follow-up email", action: "direct", directAction: { type: "generate", label: "Follow-up", payload: { generate: "followup_email" } } },
      { label: "Negotiate salary", action: "chat", chatMessage: "How should I negotiate salary for my current offers?" },
    ];
  }

  if (context === "coverletter") {
    return [
      { label: "Make more compelling", action: "chat", chatMessage: "Make my cover letter more compelling with specific achievements" },
      { label: "Adjust to formal tone", action: "chat", chatMessage: "Adjust the tone to be more formal and professional" },
      { label: "Back to resume", action: "direct", directAction: { type: "navigate", label: "Resume", payload: { view: "resume" } } },
    ];
  }

  return [
    { label: "Help me get started", action: "chat", chatMessage: "What should I do first to improve my job search?" },
  ];
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AICopilot({
  context, cvData, isOpen, onClose,
  onNavigate, onUpdateField, onTriggerAction,
  resumeStep, resumeData,
}: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastContext, setLastContext] = useState(context);
  const [lastStep, setLastStep] = useState(resumeStep);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  const ts = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addMessage = useCallback((role: Message["role"], text: string, actions?: CopilotAction[]) => {
    setMessages(prev => [...prev, { id: `${role[0]}_${Date.now()}_${Math.random()}`, role, text, time: ts(), actions }]);
  }, []);

  // ── Execute an action from the copilot ──
  const executeAction = useCallback((action: CopilotAction) => {
    switch (action.type) {
      case "navigate":
        if (action.payload.view) {
          onNavigate?.(action.payload.view as string);
          addMessage("action", `Navigated to ${contextLabels[action.payload.view as string] || action.payload.view}`);
        } else if (action.payload.step !== undefined) {
          onTriggerAction?.("setResumeStep", { step: action.payload.step });
          addMessage("action", `Jumped to ${["Start", "Personal Info", "Experience", "Education", "Skills", "Preview"][action.payload.step as number] || "step"}`);
        }
        break;
      case "enhance":
        if (action.payload.trigger === "upload") {
          onTriggerAction?.("triggerUpload", {});
          addMessage("action", "Opening file upload...");
        } else if (action.payload.trigger === "search") {
          onTriggerAction?.("triggerSearch", {});
          addMessage("action", "Starting job search...");
        } else if (action.payload.section === "experience") {
          onTriggerAction?.("enhanceExperience", {});
          addMessage("action", "Enhancing experience bullet points...");
        }
        break;
      case "generate":
        if (action.payload.generate === "summary") {
          onTriggerAction?.("generateSummary", {});
          addMessage("action", "Generating professional summary...");
        } else if (action.payload.generate === "followup_email") {
          // Send via chat
          sendMessage("Write a professional follow-up email for my job application");
          return;
        }
        break;
      case "analyze":
        if (action.payload.analyze === "ats") {
          onTriggerAction?.("runATS", {});
          addMessage("action", "Running ATS compatibility analysis...");
        } else if (action.payload.analyze === "skills_gap") {
          suggestSkills();
        }
        break;
      case "download":
        onTriggerAction?.("downloadPDF", {});
        addMessage("action", "Downloading resume as PDF...");
        break;
      case "command":
        if (action.payload.command) {
          onTriggerAction?.(action.payload.command as string, action.payload);
          addMessage("action", action.label);
        }
        break;
      case "fill_field":
        if (action.payload.field && action.payload.value !== undefined) {
          onUpdateField?.(action.payload.field as string, action.payload.value);
          addMessage("action", `Updated ${action.payload.field}`);
        }
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNavigate, onTriggerAction, onUpdateField, addMessage]);

  // ── Suggest skills based on CV data ──
  const suggestSkills = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentSkills = (resumeData?.skills as string[]) || (cvData as Record<string, unknown>)?.skills || [];
      const result = await resumeApi.chat(
        `Based on my current skills: ${Array.isArray(currentSkills) ? currentSkills.join(", ") : currentSkills}. What additional skills should I add to make my resume more competitive? List 5-8 specific skills.`,
        "chat",
        { ...(cvData || {}), current_view: context },
      );
      const reply = result.data?.reply || "I couldn't analyze your skills right now.";
      addMessage("ai", `Here are skills you should consider adding:\n\n${reply}`);
    } catch {
      addMessage("ai", "Sorry, I couldn't analyze your skills. Try again.");
    }
    setIsLoading(false);
  }, [resumeData, cvData, context, addMessage]);

  // ── Welcome message ──
  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      hasInitialized.current = true;
      const hasCv = cvData && (cvData as Record<string, unknown>).skills;
      if (hasCv) {
        addMessage("ai", "Welcome back. Your resume is loaded. I can update fields from natural language, tighten content, and move you to the next workflow step.");
      } else {
        addMessage("ai", "Welcome to JobReady. Upload your CV, paste your story, or start from scratch. I can read natural-language background details and turn them into structured resume fields.");
      }
    }
  }, [isOpen, cvData, addMessage]);

  // ── Context-change announcements ──
  useEffect(() => {
    if (context !== lastContext && hasInitialized.current) {
      setLastContext(context);
      const msgs: Record<string, string> = {
        resume: "Resume Builder — I can enhance bullet points, generate summaries, or check ATS compatibility. Use the actions below.",
        jobs: "Job Search — I'll help you find matching roles and prepare applications.",
        tracker: "Application Tracker — Need interview prep or follow-up templates?",
        settings: "Settings — I can help with profile updates.",
        coverletter: "Cover Letter — I'll help craft a tailored letter. Tell me the role!",
      };
      if (msgs[context]) addMessage("ai", msgs[context]);
    }
  }, [context, lastContext, addMessage]);

  // ── Step-change announcements (resume wizard) ──
  useEffect(() => {
    if (context === "resume" && resumeStep !== lastStep && lastStep !== undefined && hasInitialized.current) {
      setLastStep(resumeStep);
      const stepHints: Record<number, string> = {
        1: "Fill in your personal details. I can suggest improvements once you're done.",
        2: "Add your work experience. I can enhance your bullet points — just click the action below.",
        3: "Education section. Add degrees and certifications.",
        4: "Skills section. I can suggest missing skills that employers look for.",
        5: "Preview your resume! Run an ATS check or download as PDF.",
      };
      if (resumeStep !== undefined && stepHints[resumeStep]) {
        addMessage("ai", stepHints[resumeStep]);
      }
    } else if (lastStep === undefined) {
      setLastStep(resumeStep);
    }
  }, [context, resumeStep, lastStep, addMessage]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

  // ── Parse AI response for embedded actions ──
  const parseAIActions = (reply: string, userQuery: string): { text: string; actions: CopilotAction[] } => {
    const actions: CopilotAction[] = [];
    const lower = reply.toLowerCase();
    const queryLower = userQuery.toLowerCase();

    // If user asked for a summary and we're on resume, offer to apply it
    if ((queryLower.includes("summary") || queryLower.includes("professional summary")) && context === "resume") {
      actions.push({ type: "fill_field", label: "Apply as Summary", payload: { field: "summary", value: reply } });
    }

    // If reply contains skills list, offer to add them
    if ((queryLower.includes("skill") || queryLower.includes("add")) && context === "resume") {
      const skillMatches = reply.match(/(?:^|\n)\s*[-•*]\s*(.+)/gm);
      if (skillMatches && skillMatches.length >= 3) {
        const parsed = skillMatches.map(s => s.replace(/^[\s\-•*]+/, "").trim()).filter(s => s.length < 40);
        if (parsed.length > 0) {
          actions.push({ type: "fill_field", label: `Add ${parsed.length} skills`, payload: { field: "skills", value: parsed } });
        }
      }
    }

    // Context-based navigation suggestions
    if (lower.includes("upload") && lower.includes("cv")) {
      actions.push({ type: "enhance", label: "Upload CV now", payload: { trigger: "upload" } });
    }
    if (lower.includes("ats") && (lower.includes("score") || lower.includes("check"))) {
      actions.push({ type: "analyze", label: "Run ATS Check", payload: { analyze: "ats" } });
    }
    if (lower.includes("cover letter") && context !== "coverletter") {
      actions.push({ type: "navigate", label: "Open Cover Letter", payload: { view: "coverletter" } });
    }
    if (lower.includes("job search") || lower.includes("find jobs")) {
      actions.push({ type: "navigate", label: "Search Jobs", payload: { view: "jobs" } });
    }

    return { text: reply, actions: actions.length > 0 ? actions : [] };
  };

  // ── Detect intent and route to appropriate action or LLM ──
  const detectIntent = (text: string): { action: string; prompt: string } | null => {
    const lower = text.toLowerCase();

    // Direct summary generation
    if (context === "resume" && (lower.includes("generate") || lower.includes("write") || lower.includes("create")) && lower.includes("summary")) {
      return { action: "generate_summary", prompt: text };
    }

    // Direct enhancement
    if (context === "resume" && (lower.includes("enhance") || lower.includes("improve")) && lower.includes("bullet")) {
      return { action: "enhance_experience", prompt: text };
    }

    return null;
  };

  // ── Send message ──
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const trimmed = text.trim();
    addMessage("user", trimmed);
    setInput("");
    setIsLoading(true);

    try {
      // Check for direct action intents
      const intent = detectIntent(trimmed);

      if (intent?.action === "generate_summary") {
        // Generate summary directly and offer to apply
        const result = await resumeApi.chat("", "generate_summary", {
          ...(resumeData || {}),
          ...(cvData || {}),
        });
        if (result.data?.reply) {
          addMessage("ai", result.data.reply, [
            { type: "fill_field", label: "Apply as Summary", payload: { field: "summary", value: result.data.reply } },
          ]);
        } else {
          addMessage("ai", "I couldn't generate a summary right now. Please try again.");
        }
      } else if (intent?.action === "enhance_experience") {
        onTriggerAction?.("enhanceExperience", {});
        addMessage("action", "Enhancing your experience bullet points...");
      } else {
        const localParsed = parseResumeUpdateLocally(trimmed);
        const localActions = buildResumeFillActions(localParsed);
        if (localActions.length > 0) {
          addMessage("ai", summarizeAppliedUpdates(localActions));
          localActions.forEach((action) => executeAction(action));
          setIsLoading(false);
          return;
        }

        if (shouldExtractResumeNarrative(trimmed)) {
          const extractedResult = await resumeApi.chat(
            trimmed,
            "extract_cv",
            { raw_text: trimmed, ...(cvData || {}), ...(resumeData || {}) },
          );
          const extractedActions = buildResumeFillActions(extractedResult.data?.data);
          if (extractedActions.length > 0) {
            addMessage("ai", "I turned that story into structured resume fields. Review the form and tighten anything that needs more precision.");
            extractedActions.forEach((action) => executeAction(action));
            setIsLoading(false);
            return;
          }
        }

        if (context === "resume") {
          const parsedResult = await resumeApi.chat(
            trimmed,
            "parse_resume_update",
            { ...(cvData || {}), ...(resumeData || {}) },
          );
          const parsedActions = buildResumeFillActions(parsedResult.data?.data);
          if (parsedActions.length > 0) {
            addMessage("ai", parsedResult.data?.reply || summarizeAppliedUpdates(parsedActions));
            parsedActions.forEach((action) => executeAction(action));
            setIsLoading(false);
            return;
          }
        }

        // General chat with enriched context
        const enrichedContext = {
          ...(cvData || {}),
          ...(resumeData || {}),
          current_view: context,
          view_label: contextLabels[context] || context,
          resume_step: resumeStep,
          task: `copilot_${context}`,
        };

        const result = await resumeApi.chat(
          `[User is on ${contextLabels[context] || context}${resumeStep !== undefined ? `, step ${resumeStep}` : ""}] ${trimmed}`,
          "chat",
          enrichedContext,
        );
        const reply = result.data?.reply || "I couldn't process that right now. Please try again.";
        const { text: cleanText, actions } = parseAIActions(reply, trimmed);
        addMessage("ai", cleanText, actions.length > 0 ? actions : undefined);
      }
    } catch {
      addMessage("ai", "Sorry, I'm having trouble connecting. Please try again.");
    }
    setIsLoading(false);
  };

  const currentSuggestions = getSuggestions(context, resumeStep, cvData);

  if (!isOpen) return null;

  return (
    <>
      <style>{copilotCSS}</style>
        <div className="cop">
        <div className="cop-header">
          <div className="cop-header-left">
            <span className="cop-dot" />
            <span>AI Guide</span>
            <span className="cop-context">{contextLabels[context] || context}</span>
          </div>
          <button className="cop-close" onClick={onClose}><XIcon size={14} /></button>
        </div>

        <div className="cop-messages">
          {messages.map(m => (
            <div key={m.id} className={`cop-msg cop-msg-${m.role}`}>
              {m.role === "ai" && <div className="cop-avatar"><BotIcon size={14} /></div>}
              {m.role === "action" && <div className="cop-avatar cop-avatar-action"><BotIcon size={14} /></div>}
              <div className={`cop-bubble ${m.role === "action" ? "cop-bubble-action" : ""}`}>
                <p>{m.text}</p>
                {m.role !== "action" && <span className="cop-time">{m.time}</span>}
              </div>
            </div>
          ))}
          {/* Inline action buttons from AI responses */}
          {messages.length > 0 && messages[messages.length - 1].actions && (
            <div className="cop-inline-actions">
              {messages[messages.length - 1].actions!.map((a, i) => (
                <button key={i} className="cop-action-btn" onClick={() => executeAction(a)}>
                  {a.type === "navigate" ? <SearchIcon size={12} /> : a.type === "analyze" ? <SearchIcon size={12} /> : a.type === "enhance" ? <SparklesIcon size={12} /> : <BotIcon size={12} />} {a.label}
                </button>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="cop-msg cop-msg-ai">
              <div className="cop-avatar"><BotIcon size={14} /></div>
              <div className="cop-bubble cop-typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Actions — these execute real workspace actions */}
        <div className="cop-suggestions">
          {currentSuggestions.map((s, i) => (
            <button
              key={`${context}_${resumeStep}_${i}`}
              className={`cop-sug ${s.action === "direct" ? "cop-sug-action" : ""}`}
              onClick={() => {
                if (s.action === "direct" && s.directAction) {
                  executeAction(s.directAction);
                } else if (s.chatMessage) {
                  sendMessage(s.chatMessage);
                }
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="cop-input">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask for the next move or update your resume..."
            disabled={isLoading}
          />
          <button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}>
            <SendIcon size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

const copilotCSS = `
  .cop {
    --cop-bg:#0a1317;
    --cop-panel:#101a20;
    --cop-panel-2:#142028;
    --cop-border:#22323c;
    --cop-text:#e7edf0;
    --cop-muted:#8fa2ab;
    --cop-soft:#627983;
    --cop-accent:#2f6e6a;
    --cop-accent-strong:#9ed5cf;
    --cop-warm:#b7844d;
    display:flex; flex-direction:column; height:100%;
    background:var(--cop-bg);
    border-left:1px solid var(--cop-border);
  }
  .cop-header {
    display:flex; align-items:center; justify-content:space-between; padding:16px 18px;
    border-bottom:1px solid var(--cop-border);
    background:#0d161b;
  }
  .cop-header-left { display:flex; align-items:center; gap:10px; font-size:0.84rem; font-weight:700; color:var(--cop-text); letter-spacing:0.01em; flex-wrap:wrap; }
  .cop-dot { width:8px; height:8px; border-radius:50%; background:var(--cop-accent-strong); box-shadow:0 0 10px rgba(123,196,200,0.42); }
  .cop-context {
    font-size:0.62rem; color:var(--cop-muted); background:rgba(255,255,255,0.03);
    padding:4px 8px; border-radius:999px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;
    border:1px solid var(--cop-border);
  }
  .cop-close { background:none; border:none; color:var(--cop-soft); cursor:pointer; padding:8px; border-radius:10px; display:flex; }
  .cop-close:hover { color:var(--cop-text); background:var(--cop-panel-2); }
  .cop-messages { flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:14px; }
  .cop-msg { display:flex; gap:8px; align-items:flex-start; animation:cop-in 0.2s ease; }
  @keyframes cop-in { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
  .cop-msg-user { flex-direction:row-reverse; }
  .cop-msg-action { opacity:0.7; }
  .cop-avatar {
    width:30px; height:30px; border-radius:10px; background:rgba(47,110,106,0.18);
    color:#d8efed; font-size:0.625rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0;
    border:1px solid rgba(47,110,106,0.24);
    box-shadow:0 10px 18px rgba(7,17,21,0.24);
  }
  .cop-avatar-action { background:rgba(77,179,138,0.14); border-color:rgba(77,179,138,0.22); font-size:0.75rem; }
  .cop-bubble { padding:12px 14px; border-radius:16px; max-width:88%; box-shadow:0 10px 20px rgba(4,10,14,0.16); }
  .cop-msg-ai .cop-bubble {
    background:var(--cop-panel);
    border:1px solid var(--cop-border);
  }
  .cop-msg-user .cop-bubble {
    background:#17303a;
    border:1px solid rgba(47,110,106,0.26);
  }
  .cop-bubble-action {
    background:rgba(77,179,138,0.08) !important;
    border:1px solid rgba(77,179,138,0.24) !important;
    padding:8px 12px !important;
    box-shadow:none !important;
  }
  .cop-bubble p { margin:0; font-size:0.83rem; color:#d3dde1; line-height:1.6; white-space:pre-wrap; }
  .cop-bubble-action p { font-size:0.75rem; color:#9fddc0; font-style:italic; }
  .cop-time { font-size:0.625rem; color:var(--cop-soft); margin-top:6px; display:block; }
  .cop-typing { display:flex; gap:4px; padding:14px !important; }
  .cop-typing span { width:6px; height:6px; border-radius:50%; background:var(--cop-soft); animation:cop-bounce 1.2s infinite; }
  .cop-typing span:nth-child(2) { animation-delay:0.15s; }
  .cop-typing span:nth-child(3) { animation-delay:0.3s; }
  @keyframes cop-bounce { 0%,80%,100%{transform:scale(0.7)} 40%{transform:scale(1.1)} }
  .cop-inline-actions { display:flex; flex-wrap:wrap; gap:8px; padding:0 40px; }
  .cop-action-btn {
    padding:7px 12px; border-radius:999px; background:rgba(77,179,138,0.08);
    border:1px solid rgba(77,179,138,0.24); color:#9fddc0; font-size:0.7rem; font-weight:700; cursor:pointer; transition:all 0.15s;
  }
  .cop-action-btn:hover { background:rgba(77,179,138,0.14); border-color:rgba(77,179,138,0.42); }
  .cop-suggestions {
    display:flex; flex-wrap:wrap; gap:8px; padding:12px 18px 14px;
    border-top:1px solid rgba(255,255,255,0.03);
    background:#0d161b;
  }
  .cop-sug {
    padding:7px 12px; border-radius:999px; background:rgba(255,255,255,0.02);
    border:1px solid var(--cop-border); color:var(--cop-muted); font-size:0.7rem; font-weight:700; cursor:pointer; transition:all 0.15s; white-space:nowrap;
  }
  .cop-sug:hover { border-color:var(--cop-accent); color:var(--cop-accent-strong); background:rgba(47,110,106,0.08); }
  .cop-sug-action { border-color:rgba(77,179,138,0.24); color:#9fddc0; }
  .cop-sug-action:hover { border-color:rgba(77,179,138,0.42); background:rgba(77,179,138,0.1); }
  .cop-input {
    display:flex; gap:10px; padding:14px 18px 18px; border-top:1px solid var(--cop-border);
    background:#0d161b;
  }
  .cop-input input {
    flex:1; padding:12px 14px; border-radius:16px; background:#0b1216; border:1px solid var(--cop-border);
    color:var(--cop-text); font-size:0.84rem; outline:none; transition:border-color 0.15s, box-shadow 0.15s;
  }
  .cop-input input:focus { border-color:var(--cop-accent); box-shadow:0 0 0 3px rgba(47,110,106,0.12); }
  .cop-input input::placeholder { color:var(--cop-soft); }
  .cop-input button {
    width:42px; height:42px; border-radius:14px; background:var(--cop-accent);
    border:none; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0;
    box-shadow:0 12px 20px rgba(10,29,34,0.26);
  }
  .cop-input button:hover { background:#285e5a; transform:translateY(-1px); }
  .cop-input button:disabled { background:#1a2a31; color:#5a6d76; cursor:not-allowed; box-shadow:none; }

  @media (max-width: 768px) {
    .cop-header { padding:14px 16px; }
    .cop-messages { padding:16px; }
    .cop-inline-actions { padding:0 0 0 38px; }
    .cop-suggestions { padding:12px 16px; }
    .cop-input { padding:12px 16px 16px; }
  }

  @media (max-width: 480px) {
    .cop-header-left { gap:8px; }
    .cop-context { width:max-content; }
    .cop-bubble { max-width:92%; }
    .cop-inline-actions { padding:0; }
    .cop-suggestions { gap:6px; }
    .cop-sug { white-space:normal; text-align:left; }
  }
`;
