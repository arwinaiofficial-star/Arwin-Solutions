"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SendIcon, XIcon } from "@/components/icons/Icons";
import { resumeApi } from "@/lib/api/client";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "ai" | "user" | "action";
  text: string;
  time: string;
  actions?: CopilotAction[];
}

export interface CopilotAction {
  type: "navigate" | "fill_field" | "enhance" | "generate" | "download" | "analyze";
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

type ViewType = "resume" | "jobs" | "tracker" | "settings" | "coverletter";

const contextLabels: Record<string, string> = {
  resume: "Resume Builder",
  jobs: "Job Search",
  tracker: "Application Tracker",
  settings: "Settings",
  coverletter: "Cover Letter",
};

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
        addMessage("ai", "Welcome back! Your resume is loaded. I can help you enhance it, find jobs, or prep for interviews. Use the quick actions below or ask me anything.");
      } else {
        addMessage("ai", "Welcome to JobReady! Upload your CV or start from scratch — I'll guide you through every step. Try the quick actions below to get started.");
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
            <span>AI Copilot</span>
            <span className="cop-context">{contextLabels[context] || context}</span>
          </div>
          <button className="cop-close" onClick={onClose}><XIcon size={14} /></button>
        </div>

        <div className="cop-messages">
          {messages.map(m => (
            <div key={m.id} className={`cop-msg cop-msg-${m.role}`}>
              {m.role === "ai" && <div className="cop-avatar">AI</div>}
              {m.role === "action" && <div className="cop-avatar cop-avatar-action">⚡</div>}
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
                  {a.type === "navigate" ? "→" : a.type === "analyze" ? "📊" : a.type === "enhance" ? "✨" : "⚡"} {a.label}
                </button>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="cop-msg cop-msg-ai">
              <div className="cop-avatar">AI</div>
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
            placeholder="Ask or tell me what to do..."
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
  .cop { display:flex; flex-direction:column; height:100%; background:#0c0e14; border-left:1px solid #1a1f2e; }
  .cop-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #1a1f2e; }
  .cop-header-left { display:flex; align-items:center; gap:8px; font-size:0.8125rem; font-weight:600; color:#e2e8f0; }
  .cop-dot { width:8px; height:8px; border-radius:50%; background:#22c55e; box-shadow:0 0 6px rgba(34,197,94,0.4); }
  .cop-context { font-size:0.625rem; color:#64748b; background:#111827; padding:2px 8px; border-radius:4px; font-weight:500; }
  .cop-close { background:none; border:none; color:#64748b; cursor:pointer; padding:4px; border-radius:4px; display:flex; }
  .cop-close:hover { color:#e2e8f0; background:#1e293b; }
  .cop-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; }
  .cop-msg { display:flex; gap:8px; align-items:flex-start; animation:cop-in 0.2s ease; }
  @keyframes cop-in { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
  .cop-msg-user { flex-direction:row-reverse; }
  .cop-msg-action { opacity:0.7; }
  .cop-avatar { width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); color:#fff; font-size:0.625rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .cop-avatar-action { background:linear-gradient(135deg,#22c55e,#14b8a6); font-size:0.75rem; }
  .cop-bubble { padding:10px 14px; border-radius:12px; max-width:85%; }
  .cop-msg-ai .cop-bubble { background:#111827; border:1px solid #1e293b; }
  .cop-msg-user .cop-bubble { background:#1e3a5f; border:1px solid #2563eb30; }
  .cop-bubble-action { background:#0d1f17 !important; border:1px solid #16a34a30 !important; padding:6px 12px !important; }
  .cop-bubble p { margin:0; font-size:0.8125rem; color:#cbd5e1; line-height:1.55; white-space:pre-wrap; }
  .cop-bubble-action p { font-size:0.75rem; color:#86efac; font-style:italic; }
  .cop-time { font-size:0.625rem; color:#475569; margin-top:4px; display:block; }
  .cop-typing { display:flex; gap:4px; padding:14px !important; }
  .cop-typing span { width:6px; height:6px; border-radius:50%; background:#475569; animation:cop-bounce 1.2s infinite; }
  .cop-typing span:nth-child(2) { animation-delay:0.15s; }
  .cop-typing span:nth-child(3) { animation-delay:0.3s; }
  @keyframes cop-bounce { 0%,80%,100%{transform:scale(0.7)} 40%{transform:scale(1.1)} }
  .cop-inline-actions { display:flex; flex-wrap:wrap; gap:6px; padding:0 36px; }
  .cop-action-btn { padding:5px 10px; border-radius:6px; background:#111827; border:1px solid #22c55e30; color:#86efac; font-size:0.6875rem; cursor:pointer; transition:all 0.15s; }
  .cop-action-btn:hover { background:#0d1f17; border-color:#22c55e; }
  .cop-suggestions { display:flex; flex-wrap:wrap; gap:6px; padding:8px 16px 12px; border-top:1px solid #1a1f2e10; }
  .cop-sug { padding:6px 12px; border-radius:8px; background:#111827; border:1px solid #1e293b; color:#94a3b8; font-size:0.6875rem; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
  .cop-sug:hover { border-color:#3b82f6; color:#60a5fa; background:#131a2b; }
  .cop-sug-action { border-color:#22c55e30; color:#86efac; }
  .cop-sug-action:hover { border-color:#22c55e; background:#0d1f17; }
  .cop-input { display:flex; gap:8px; padding:12px 16px; border-top:1px solid #1a1f2e; }
  .cop-input input { flex:1; padding:10px 14px; border-radius:8px; background:#080a10; border:1px solid #1e293b; color:#e2e8f0; font-size:0.8125rem; outline:none; transition:border-color 0.15s; }
  .cop-input input:focus { border-color:#3b82f6; }
  .cop-input input::placeholder { color:#475569; }
  .cop-input button { width:36px; height:36px; border-radius:8px; background:#3b82f6; border:none; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; }
  .cop-input button:hover { background:#2563eb; }
  .cop-input button:disabled { background:#1e293b; color:#475569; cursor:not-allowed; }
`;
