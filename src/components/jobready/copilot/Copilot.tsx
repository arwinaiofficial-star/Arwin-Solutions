"use client";

import { Fragment, useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { resumeApi } from "@/lib/api/client";
import { useAuth } from "@/context/AuthContext";
import { BotIcon, SendIcon, SparklesIcon, XIcon } from "@/components/icons/Icons";
import "@/app/jobready/jobready.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const ROUTE_CONTEXT: Record<string, string> = {
  "/jobready/app": "dashboard",
  "/jobready/app/documents": "resume_builder",
  "/jobready/app/jobs": "job_search",
  "/jobready/app/applications": "application_tracker",
  "/jobready/app/settings": "settings",
};

const QUICK_ACTIONS: Record<string, Array<{ label: string; prompt: string }>> = {
  dashboard: [
    { label: "What should I do next?", prompt: "Based on my profile, what should my next career action be?" },
    { label: "Review my progress", prompt: "Give me a brief review of my job search progress and resume status." },
  ],
  resume_builder: [
    { label: "Improve my summary", prompt: "Help me write a stronger professional summary based on my experience." },
    { label: "Suggest skills to add", prompt: "Based on my experience, what skills should I add to my resume?" },
    { label: "Check for weak bullets", prompt: "Review my experience bullets and suggest improvements with metrics." },
  ],
  job_search: [
    { label: "What roles suit me?", prompt: "Based on my resume, suggest 5 job roles I should be searching for." },
    { label: "Help me search better", prompt: "Suggest better search keywords based on my skills and experience." },
  ],
  application_tracker: [
    { label: "Follow-up advice", prompt: "Give me advice on following up on my pending applications." },
    { label: "Interview prep tips", prompt: "Help me prepare for interviews based on my recent applications." },
  ],
  settings: [],
};

const CONTEXT_LABELS: Record<string, string> = {
  dashboard: "Workspace coach",
  resume_builder: "Resume strategist",
  job_search: "Role matching assistant",
  application_tracker: "Pipeline advisor",
  settings: "Support assistant",
  general: "Career assistant",
};

export default function Copilot() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentContext = ROUTE_CONTEXT[pathname] || "general";
  const quickActions = QUICK_ACTIONS[currentContext] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("jobready:open-copilot", handleOpen);
    return () => window.removeEventListener("jobready:open-copilot", handleOpen);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build context from user data
      const context: Record<string, unknown> = {
        page: currentContext,
        userName: user?.name,
      };

      if (user?.cvData) {
        const cv = user.cvData as unknown as Record<string, unknown>;
        context.hasResume = true;
        context.skills = cv.skills;
        context.experienceCount = (cv.experience as unknown[])?.length || 0;
      }

      const result = await resumeApi.chat(text, "copilot_chat", context);

      const reply = result.data?.reply || "I couldn't process that right now. Try again?";
      const assistantMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, currentContext, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const contextLabel = CONTEXT_LABELS[currentContext] || CONTEXT_LABELS.general;

  return (
    <>
      {open && (
        <div className="jr-copilot-panel">
          <div className="jr-copilot-header">
            <div className="jr-copilot-header-info">
              <div className="jr-copilot-badge">
                <BotIcon size={16} />
              </div>
              <div className="jr-copilot-header-copy">
                <span>{contextLabel}</span>
                <small>{pageTitleFromPath(pathname)}</small>
              </div>
            </div>
            <button className="jr-btn jr-btn-ghost jr-btn-sm" onClick={() => setOpen(false)}>
              <XIcon size={16} />
            </button>
          </div>

          <div className="jr-copilot-messages">
            {messages.length === 0 && (
              <div className="jr-copilot-welcome">
                <div className="jr-copilot-welcome-icon">
                  <SparklesIcon size={18} />
                </div>
                <p>Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. I can help with your resume, job search strategy, interview preparation, and next-best actions.</p>
                {quickActions.length > 0 && (
                  <div className="jr-copilot-quick-actions">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        className="jr-copilot-quick-btn"
                        onClick={() => sendMessage(action.prompt)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`jr-copilot-msg jr-copilot-msg-${msg.role}`}>
                <div className="jr-copilot-msg-content">
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="jr-copilot-msg jr-copilot-msg-assistant">
                <div className="jr-copilot-msg-content jr-copilot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="jr-copilot-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about your resume, role fit, or application plan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="jr-btn jr-btn-primary jr-btn-sm">
              <SendIcon size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function pageTitleFromPath(pathname: string): string {
  if (pathname.startsWith("/jobready/app/documents")) return "Resume";
  if (pathname.startsWith("/jobready/app/jobs")) return "Jobs";
  if (pathname.startsWith("/jobready/app/applications")) return "Applications";
  if (pathname.startsWith("/jobready/app/settings")) return "Settings";
  if (pathname.startsWith("/jobready/app/onboarding")) return "Onboarding";
  return "Home";
}

function renderMessageContent(content: string) {
  const lines = content.split("\n");
  const blocks: Array<{ type: "list" | "paragraph"; lines: string[] }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const isListItem = /^[-*•]\s+/.test(trimmed);
    const blockType = isListItem ? "list" : "paragraph";
    const current = blocks[blocks.length - 1];

    if (current && current.type === blockType) {
      current.lines.push(trimmed);
    } else {
      blocks.push({ type: blockType, lines: [trimmed] });
    }
  }

  return blocks.map((block, index) => {
    if (block.type === "list") {
      return (
        <ul key={`list-${index}`} className="jr-copilot-rich-list">
          {block.lines.map((line, lineIndex) => (
            <li key={`${index}-${lineIndex}`}>{renderInlineTokens(line.replace(/^[-*•]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`p-${index}`} className="jr-copilot-rich-paragraph">
        {renderInlineTokens(block.lines.join(" "))}
      </p>
    );
  });
}

function renderInlineTokens(text: string) {
  const tokenPattern = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(tokenPattern)) {
    const [fullMatch, , boldText, , linkLabel, linkUrl] = match;
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    if (boldText) {
      nodes.push(<strong key={`${start}-bold`}>{boldText}</strong>);
    } else if (linkLabel && linkUrl) {
      nodes.push(
        <a
          key={`${start}-link`}
          href={linkUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          {linkLabel}
        </a>
      );
    } else {
      nodes.push(fullMatch);
    }

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.map((node, index) => (
    <Fragment key={typeof node === "string" ? `${index}-${node}` : index}>{node}</Fragment>
  ));
}
