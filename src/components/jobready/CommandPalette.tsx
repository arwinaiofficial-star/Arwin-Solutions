"use client";

import { type ReactNode, useState, useEffect, useRef, useCallback } from "react";

interface Action {
  id: string;
  label: string;
  icon: ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: Action[];
}

export default function CommandPalette({ isOpen, onClose, actions }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const closePalette = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen, closePalette]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); closePalette(); }
      if (e.key === "Escape" && isOpen) closePalette();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closePalette, isOpen]);

  if (!isOpen) return null;

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <style>{cmdCSS}</style>
      <div className="cmd-overlay" onClick={closePalette}>
        <div className="cmd" onClick={e => e.stopPropagation()}>
          <div className="cmd-search">
            <span>⌘</span>
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Type a command..." onKeyDown={e => {
              if (e.key === "Enter" && filtered.length > 0) { filtered[0].action(); closePalette(); }
            }} />
          </div>
          <div className="cmd-list">
            {filtered.length === 0 && <div className="cmd-empty">No matching commands</div>}
            {filtered.map(a => (
              <button key={a.id} className="cmd-item" onClick={() => { a.action(); closePalette(); }}>
                <span className="cmd-icon">{a.icon}</span>
                <span className="cmd-label">{a.label}</span>
                {a.shortcut && <span className="cmd-shortcut">{a.shortcut}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const cmdCSS = `
  .cmd-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:flex-start; justify-content:center; padding-top:20vh; }
  .cmd { width:100%; max-width:520px; background:#0d1519; border:1px solid #203038; border-radius:18px; overflow:hidden; box-shadow:0 24px 70px rgba(0,0,0,0.48); animation:cmd-in 0.15s ease; }
  @keyframes cmd-in { from{opacity:0;transform:scale(0.96) translateY(-8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .cmd-search { display:flex; align-items:center; gap:10px; padding:16px 18px; border-bottom:1px solid #203038; }
  .cmd-search span { color:#9ed5cf; font-size:0.8125rem; font-weight:700; width:28px; height:28px; background:#132127; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .cmd-search input { flex:1; background:none; border:none; color:#e2e8f0; font-size:0.9375rem; outline:none; }
  .cmd-search input::placeholder { color:#475569; }
  .cmd-list { max-height:320px; overflow-y:auto; padding:8px; }
  .cmd-empty { padding:20px; text-align:center; color:#475569; font-size:0.8125rem; }
  .cmd-item { display:flex; align-items:center; gap:12px; width:100%; padding:11px 12px; border:none; background:none; color:#cbd5e1; font-size:0.8125rem; cursor:pointer; border-radius:12px; transition:all 0.1s; text-align:left; }
  .cmd-item:hover { background:#132026; color:#f1f5f9; }
  .cmd-icon { width:30px; height:30px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:#132127; color:#9ed5cf; border:1px solid #203038; flex-shrink:0; }
  .cmd-label { flex:1; }
  .cmd-shortcut { font-size:0.6875rem; color:#475569; background:#111827; padding:2px 8px; border-radius:4px; font-family:monospace; }
`;
