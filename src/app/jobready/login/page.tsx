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
  const [retryCountdown, setRetryCountdown] = useState(0);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSocialLogin = (provider: string) => {
    alert(
      `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in requires OAuth credentials.\n\nSet ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET in your .env file.`
    );
  };

  useEffect(() => {
    if (isAuthenticated) router.push("/jobready/dashboard");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setRetryCountdown(0);

    const attemptLogin = async (attemptsLeft: number): Promise<void> => {
      const result = await login(email, password);
      if (result.success) {
        router.push("/jobready/dashboard");
        return;
      }

      if (result.error?.includes("connect to backend") && attemptsLeft > 0) {
        setError("Backend is waking up. Retrying in 30 seconds.");
        let secs = 30;
        setRetryCountdown(secs);
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            secs -= 1;
            setRetryCountdown(secs);
            if (secs <= 0) {
              clearInterval(interval);
              resolve();
            }
          }, 1000);
        });
        setError("");
        setRetryCountdown(0);
        return attemptLogin(attemptsLeft - 1);
      }

      setError(result.error || "Invalid email or password.");
    };

    try {
      await attemptLogin(2);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setRetryCountdown(0);
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
                {retryCountdown > 0 ? `Retrying in ${retryCountdown}s` : isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && retryCountdown === 0 && <ArrowRightIcon size={16} />}
              </button>
            </form>

            <div className="auth-divider"><span>or continue with</span></div>

            <div className="auth-social">
              <button className="auth-social-btn" onClick={() => handleSocialLogin("google")}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button className="auth-social-btn" onClick={() => handleSocialLogin("linkedin")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </button>
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
