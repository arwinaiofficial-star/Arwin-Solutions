"use client";

import { useState, type FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowRightIcon, BotIcon, CheckIcon, RocketIcon } from "@/components/icons/Icons";

const highlights = [
  "Resume import, editing, and ATS checks stay in one workspace.",
  "Matched roles, tailored assets, and tracking stay connected.",
  "Return directly to the next application step instead of starting over.",
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push("/jobready/app");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/jobready/app");
      } else {
        setError(result.error || "Invalid email or password.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{authStyles}</style>
      <div className="auth-shell">
        <div className="auth-background" />
        <div className="auth-layout">
          <section className="auth-story">
            <Link href="/jobready" className="auth-brand" aria-label="Back to JobReady">
              <span className="auth-brand-mark"><RocketIcon size={18} /></span>
              <span className="auth-brand-copy">
                <strong>JobReady</strong>
                <em>Application OS</em>
              </span>
            </Link>

            <div className="auth-story-copy">
              <span className="auth-eyebrow">Sign In</span>
              <h1>Return to your application workflow.</h1>
              <p>
                Resume edits, matched roles, tailored documents, and tracking stay connected in one workspace.
              </p>
            </div>

            <div className="auth-story-panel">
              <div className="auth-story-kicker">
                <BotIcon size={15} />
                <span>What you come back to</span>
              </div>
              <div className="auth-highlight-list">
                {highlights.map((item) => (
                  <div key={item} className="auth-highlight-item">
                    <span className="auth-highlight-icon"><CheckIcon size={14} /></span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="auth-card">
            <div className="auth-card-header">
              <span className="auth-card-eyebrow">Welcome back</span>
              <h2>Sign in</h2>
              <p>Access your resume, job matches, and application pipeline.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && <ArrowRightIcon size={16} />}
              </button>
            </form>

            <div className="auth-inline-note">
              Social sign-in is intentionally hidden until the real OAuth flow is wired end to end.
            </div>

            <div className="auth-footer">
              <p>New to JobReady? <Link href="/jobready/signup">Create an account</Link></p>
              <Link href="/jobready" className="auth-back">Back to overview</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

const authStyles = `
  .auth-shell {
    --auth-bg:#07111f;
    --auth-panel:#0f1b2d;
    --auth-panel-soft:#13243a;
    --auth-border:rgba(148,163,184,0.14);
    --auth-text:#e8eefc;
    --auth-muted:#9eb0cb;
    --auth-soft:#7084a3;
    --auth-accent:#2563eb;
    --auth-accent-strong:#93c5fd;
    min-height:100vh;
    position:relative;
    overflow:hidden;
    background:
      radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 32%),
      radial-gradient(circle at bottom right, rgba(96,165,250,0.16), transparent 28%),
      linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%),
      var(--auth-bg);
    color:var(--auth-text);
    padding:32px 20px;
  }
  .auth-background {
    position:absolute; inset:0;
    background:
      linear-gradient(135deg, rgba(17,24,39,0.16) 0%, transparent 52%),
      radial-gradient(circle at 20% 20%, rgba(147,197,253,0.08), transparent 20%);
    pointer-events:none;
  }
  .auth-layout {
    position:relative;
    max-width:1140px;
    margin:0 auto;
    min-height:calc(100vh - 64px);
    display:grid;
    grid-template-columns:minmax(0,1.1fr) minmax(360px,460px);
    gap:28px;
    align-items:stretch;
  }
  .auth-story,
  .auth-card {
    border:1px solid var(--auth-border);
    background:rgba(9,18,32,0.78);
    backdrop-filter:blur(18px);
    box-shadow:0 24px 60px rgba(0,0,0,0.34);
  }
  .auth-story {
    border-radius:32px;
    padding:32px;
    display:flex;
    flex-direction:column;
    justify-content:space-between;
    gap:32px;
  }
  .auth-brand {
    display:inline-flex;
    align-items:center;
    gap:12px;
    color:inherit;
    text-decoration:none;
    width:max-content;
  }
  .auth-brand-mark {
    width:42px;
    height:42px;
    border-radius:15px;
    display:flex;
    align-items:center;
    justify-content:center;
    background:var(--auth-accent);
    color:#fff;
    box-shadow:0 16px 28px rgba(12,30,60,0.34);
  }
  .auth-brand-copy strong {
    display:block;
    font-size:1rem;
    letter-spacing:0.01em;
    color:#f8fbff;
  }
  .auth-brand-copy em {
    display:block;
    margin-top:2px;
    font-style:normal;
    font-size:0.68rem;
    text-transform:uppercase;
    letter-spacing:0.16em;
    color:var(--auth-muted);
  }
  .auth-eyebrow,
  .auth-card-eyebrow {
    display:inline-flex;
    align-items:center;
    gap:8px;
    font-size:0.68rem;
    text-transform:uppercase;
    letter-spacing:0.16em;
    color:var(--auth-accent-strong);
  }
  .auth-story-copy h1 {
    margin:12px 0 12px;
    font-size:clamp(2.3rem, 4vw, 3.8rem);
    line-height:0.96;
    letter-spacing:-0.055em;
    color:#f8fbff;
    max-width:560px;
  }
  .auth-story-copy p {
    margin:0;
    max-width:560px;
    font-size:1rem;
    line-height:1.75;
    color:var(--auth-muted);
  }
  .auth-story-panel {
    border-radius:24px;
    padding:22px;
    background:rgba(18,34,58,0.78);
    border:1px solid rgba(147,197,253,0.14);
  }
  .auth-story-kicker {
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:7px 12px;
    border-radius:999px;
    background:rgba(37,99,235,0.12);
    color:var(--auth-accent-strong);
    border:1px solid rgba(37,99,235,0.18);
    font-size:0.75rem;
    font-weight:700;
  }
  .auth-highlight-list {
    display:flex;
    flex-direction:column;
    gap:12px;
    margin-top:18px;
  }
  .auth-highlight-item {
    display:flex;
    align-items:flex-start;
    gap:10px;
  }
  .auth-highlight-icon {
    width:24px;
    height:24px;
    border-radius:999px;
    display:flex;
    align-items:center;
    justify-content:center;
    background:rgba(37,99,235,0.14);
    color:var(--auth-accent-strong);
    flex-shrink:0;
    margin-top:2px;
  }
  .auth-highlight-item p {
    margin:0;
    color:var(--auth-muted);
    font-size:0.9rem;
    line-height:1.65;
  }
  .auth-card {
    border-radius:28px;
    padding:30px;
    display:flex;
    flex-direction:column;
    justify-content:center;
  }
  .auth-card-header h2 {
    margin:10px 0 6px;
    font-size:2rem;
    line-height:1;
    letter-spacing:-0.04em;
    color:#f8fbff;
  }
  .auth-card-header p {
    margin:0 0 24px;
    color:var(--auth-muted);
    line-height:1.65;
    font-size:0.92rem;
  }
  .auth-error {
    background:rgba(239,68,68,0.08);
    border:1px solid rgba(239,68,68,0.18);
    border-radius:16px;
    padding:12px 14px;
    margin-bottom:18px;
    font-size:0.82rem;
    line-height:1.55;
    color:#f7b4b4;
  }
  .auth-form { display:flex; flex-direction:column; gap:16px; }
  .auth-field { display:flex; flex-direction:column; gap:6px; }
  .auth-field label {
    font-size:0.7rem;
    font-weight:700;
    color:var(--auth-muted);
    text-transform:uppercase;
    letter-spacing:0.14em;
  }
  .auth-field input {
    padding:13px 15px;
    border-radius:16px;
    background:rgba(10,18,31,0.82);
    border:1px solid rgba(148,163,184,0.18);
    color:var(--auth-text);
    font-size:0.92rem;
    transition:border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }
  .auth-field input:focus {
    outline:none;
    border-color:rgba(96,165,250,0.55);
    box-shadow:0 0 0 4px rgba(37,99,235,0.12);
    background:rgba(11,21,36,0.92);
  }
  .auth-field input::placeholder { color:var(--auth-soft); }
  .auth-submit {
    margin-top:6px;
    width:100%;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    padding:13px 16px;
    border:none;
    border-radius:16px;
    background:var(--auth-accent);
    color:#fff;
    font-size:0.92rem;
    font-weight:700;
    cursor:pointer;
    transition:transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    box-shadow:0 16px 28px rgba(14,42,99,0.32);
  }
  .auth-submit:hover { background:#1d4ed8; transform:translateY(-1px); }
  .auth-submit:disabled {
    background:#17325c;
    color:#7f92af;
    cursor:not-allowed;
    box-shadow:none;
    transform:none;
  }
  .auth-divider {
    display:flex;
    align-items:center;
    margin:24px 0 18px;
    font-size:0.74rem;
    color:var(--auth-soft);
  }
  .auth-divider::before,
  .auth-divider::after {
    content:"";
    flex:1;
    height:1px;
    background:rgba(148,163,184,0.16);
  }
  .auth-divider span { padding:0 12px; }
  .auth-inline-note {
    margin-top:18px;
    border:1px solid rgba(148,163,184,0.12);
    border-radius:16px;
    padding:14px 16px;
    background:rgba(10,18,31,0.76);
    color:var(--auth-muted);
    font-size:0.84rem;
    line-height:1.55;
  }
  .auth-social { display:flex; gap:10px; }
  .auth-social-btn {
    flex:1;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    padding:12px;
    border-radius:16px;
    border:1px solid rgba(148,163,184,0.18);
    background:rgba(10,18,31,0.76);
    color:var(--auth-text);
    font-size:0.84rem;
    font-weight:600;
    cursor:pointer;
    transition:border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
  }
  .auth-social-btn:hover {
    background:rgba(16,28,47,0.9);
    border-color:rgba(96,165,250,0.38);
    transform:translateY(-1px);
  }
  .auth-footer {
    margin-top:24px;
    text-align:center;
  }
  .auth-footer p {
    margin:0 0 12px;
    color:var(--auth-muted);
    font-size:0.84rem;
  }
  .auth-footer a {
    color:var(--auth-accent-strong);
    text-decoration:none;
    font-weight:700;
  }
  .auth-footer a:hover { text-decoration:underline; }
  .auth-back {
    font-size:0.76rem !important;
    color:var(--auth-soft) !important;
    font-weight:500 !important;
  }
  @media (max-width: 980px) {
    .auth-layout {
      grid-template-columns:1fr;
      min-height:auto;
    }
    .auth-story { padding:26px 22px; }
    .auth-card { max-width:560px; width:100%; margin:0 auto; }
  }
  @media (max-width: 640px) {
    .auth-shell { padding:18px 12px; }
    .auth-story,
    .auth-card { border-radius:24px; }
    .auth-story { gap:24px; }
    .auth-card { padding:22px; }
    .auth-story-copy h1 { font-size:2rem; }
    .auth-social { flex-direction:column; }
  }
`;
