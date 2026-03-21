"use client";

import { useState, useRef, useEffect } from "react";
import { SendIcon, XIcon } from "@/components/icons/Icons";
import { resumeApi } from "@/lib/api/client";

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  time: string;
}

interface AICopilotProps {
  context: string; // "resume" | "jobs" | "tracker" | "settings"
  cvData?: Record<string, unknown> | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AICopilot({ context, cvData, isOpen, onClose }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "ai", text: "👋 Welcome to JobReady! I'm your AI career copilot. Upload your CV or start building — I'm here to help at every step.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

  // Context-aware suggestions
  const suggestions = {
    resume: ["✨ Improve my bullet points", "📝 Generate professional summary", "🎯 Make it ATS-friendly"],
    jobs: ["🔍 Find jobs matching my skills", "📊 Analyze this job match", "✉️ Write a cover letter"],
    tracker: ["📋 Review my applications", "💡 Interview prep tips", "📈 Suggest next steps"],
    settings: ["🔧 Update my preferences", "📄 Export my data"],
  }[context] || [];

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: `u_${Date.now()}`, role: "user", text: text.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await resumeApi.chat(text, "chat", cvData || undefined);
      const reply = result.data?.reply || "I couldn't process that right now. Please try again.";
      setMessages(prev => [...prev, { id: `a_${Date.now()}`, role: "ai", text: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } catch {
      setMessages(prev => [...prev, { id: `a_${Date.now()}`, role: "ai", text: "Sorry, I'm having trouble connecting. Please try again.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{copilotCSS}</style>
      <div className="cop">
        <div className="cop-header">
          <div className="cop-header-left">
            <span className="cop-dot" />
            <span>AI Copilot</span>
          </div>
          <button className="cop-close" onClick={onClose}><XIcon size={14} /></button>
        </div>

        <div className="cop-messages">
          {messages.map(m => (
            <div key={m.id} className={`cop-msg cop-msg-${m.role}`}>
              {m.role === "ai" && <div className="cop-avatar">AI</div>}
              <div className="cop-bubble">
                <p>{m.text}</p>
                <span className="cop-time">{m.time}</span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="cop-msg cop-msg-ai">
              <div className="cop-avatar">AI</div>
              <div className="cop-bubble cop-typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {suggestions.length > 0 && messages.length < 3 && (
          <div className="cop-suggestions">
            {suggestions.map(s => (
              <button key={s} className="cop-sug" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>
        )}

        <div className="cop-input">
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage(input)} placeholder="Ask your AI copilot..." disabled={isLoading} />
          <button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}><SendIcon size={16} /></button>
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
  .cop-close { background:none; border:none; color:#64748b; cursor:pointer; padding:4px; border-radius:4px; display:flex; }
  .cop-close:hover { color:#e2e8f0; background:#1e293b; }
  .cop-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; }
  .cop-msg { display:flex; gap:8px; align-items:flex-start; animation:cop-in 0.2s ease; }
  @keyframes cop-in { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
  .cop-msg-user { flex-direction:row-reverse; }
  .cop-avatar { width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); color:#fff; font-size:0.625rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .cop-bubble { padding:10px 14px; border-radius:12px; max-width:85%; }
  .cop-msg-ai .cop-bubble { background:#111827; border:1px solid #1e293b; }
  .cop-msg-user .cop-bubble { background:#1e3a5f; border:1px solid #2563eb30; }
  .cop-bubble p { margin:0; font-size:0.8125rem; color:#cbd5e1; line-height:1.55; white-space:pre-wrap; }
  .cop-time { font-size:0.625rem; color:#475569; margin-top:4px; display:block; }
  .cop-typing { display:flex; gap:4px; padding:14px !important; }
  .cop-typing span { width:6px; height:6px; border-radius:50%; background:#475569; animation:cop-bounce 1.2s infinite; }
  .cop-typing span:nth-child(2) { animation-delay:0.15s; }
  .cop-typing span:nth-child(3) { animation-delay:0.3s; }
  @keyframes cop-bounce { 0%,80%,100%{transform:scale(0.7)} 40%{transform:scale(1.1)} }
  .cop-suggestions { display:flex; flex-wrap:wrap; gap:6px; padding:0 16px 12px; }
  .cop-sug { padding:6px 12px; border-radius:8px; background:#111827; border:1px solid #1e293b; color:#94a3b8; font-size:0.6875rem; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
  .cop-sug:hover { border-color:#3b82f6; color:#60a5fa; background:#131a2b; }
  .cop-input { display:flex; gap:8px; padding:12px 16px; border-top:1px solid #1a1f2e; }
  .cop-input input { flex:1; padding:10px 14px; border-radius:8px; background:#080a10; border:1px solid #1e293b; color:#e2e8f0; font-size:0.8125rem; outline:none; transition:border-color 0.15s; }
  .cop-input input:focus { border-color:#3b82f6; }
  .cop-input input::placeholder { color:#475569; }
  .cop-input button { width:36px; height:36px; border-radius:8px; background:#3b82f6; border:none; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; }
  .cop-input button:hover { background:#2563eb; }
  .cop-input button:disabled { background:#1e293b; color:#475569; cursor:not-allowed; }
`;
