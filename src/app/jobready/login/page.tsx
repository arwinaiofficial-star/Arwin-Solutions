"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BriefcaseIcon } from "@/components/icons/Icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSocialLogin = (provider: string) => {
    // Social OAuth flow — requires Google/LinkedIn app credentials in .env
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in requires OAuth credentials.\n\nSet ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET in your .env file.`);
  };

  useEffect(() => {
    if (isAuthenticated) router.push("/jobready/dashboard");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/jobready/dashboard");
      } else {
        setError(result.error || "Invalid email or password.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{authStyles}</style>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <BriefcaseIcon size={24} color="#3b82f6" />
              <span>JobReady<span className="auth-logo-ai">.ai</span></span>
            </div>
            <h1>Welcome back</h1>
            <p>Sign in to your account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                type="email" id="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                type="password" id="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" required minLength={6}
              />
            </div>
            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-divider"><span>or continue with</span></div>

          <div className="auth-social">
            <button className="auth-social-btn auth-social-google" onClick={() => handleSocialLogin("google")}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="auth-social-btn auth-social-linkedin" onClick={() => handleSocialLogin("linkedin")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
          </div>

          <div className="auth-footer">
            <p>Don&apos;t have an account? <Link href="/jobready/signup">Sign up</Link></p>
            <Link href="/jobready" className="auth-back">Back to JobReady.ai</Link>
          </div>
        </div>
      </div>
    </>
  );
}

const authStyles = `
  .auth-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #0a0a0f; padding: 20px;
  }
  .auth-card {
    width: 100%; max-width: 400px;
    background: #111318; border: 1px solid #1e293b; border-radius: 16px;
    padding: 40px 32px;
  }
  .auth-header { text-align: center; margin-bottom: 32px; }
  .auth-logo {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 1.125rem; font-weight: 700; color: #f1f5f9;
    margin-bottom: 24px;
  }
  .auth-logo-ai { color: #3b82f6; }
  .auth-header h1 { font-size: 1.375rem; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; }
  .auth-header p { font-size: 0.875rem; color: #64748b; margin: 0; }

  .auth-error {
    background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px; padding: 10px 14px; margin-bottom: 20px;
    font-size: 0.8125rem; color: #f87171;
  }

  .auth-form { display: flex; flex-direction: column; gap: 16px; }
  .auth-field { display: flex; flex-direction: column; gap: 6px; }
  .auth-field label {
    font-size: 0.75rem; font-weight: 500; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  .auth-field input {
    padding: 10px 14px; border-radius: 8px;
    background: #0a0a0f; border: 1px solid #2d3748;
    color: #e2e8f0; font-size: 0.875rem;
    transition: border-color 0.15s ease;
  }
  .auth-field input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  .auth-field input::placeholder { color: #475569; }

  .auth-submit {
    padding: 12px; border-radius: 8px; border: none;
    background: #3b82f6; color: white;
    font-size: 0.875rem; font-weight: 600;
    cursor: pointer; transition: background 0.15s ease;
    margin-top: 4px;
  }
  .auth-submit:hover { background: #2563eb; }
  .auth-submit:disabled { background: #1e3a5f; color: #64748b; cursor: not-allowed; }

  .auth-divider {
    display: flex; align-items: center; margin: 24px 0 16px;
    font-size: 0.75rem; color: #475569;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: #1e293b;
  }
  .auth-divider span { padding: 0 12px; }

  .auth-social { display: flex; gap: 10px; margin-bottom: 20px; }
  .auth-social-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 10px; border-radius: 8px;
    font-size: 0.8125rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s ease;
    border: 1px solid #2d3748; background: #0a0a0f; color: #e2e8f0;
  }
  .auth-social-btn:hover { background: #1e293b; border-color: #3b82f6; }

  .auth-footer { text-align: center; margin-top: 24px; }
  .auth-footer p { font-size: 0.8125rem; color: #64748b; margin: 0 0 12px; }
  .auth-footer a { color: #3b82f6; text-decoration: none; font-weight: 600; }
  .auth-footer a:hover { text-decoration: underline; }
  .auth-back { font-size: 0.75rem !important; color: #475569 !important; font-weight: 400 !important; }
`;
