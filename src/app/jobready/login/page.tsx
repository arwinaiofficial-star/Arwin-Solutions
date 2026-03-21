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

  .auth-footer { text-align: center; margin-top: 24px; }
  .auth-footer p { font-size: 0.8125rem; color: #64748b; margin: 0 0 12px; }
  .auth-footer a { color: #3b82f6; text-decoration: none; font-weight: 600; }
  .auth-footer a:hover { text-decoration: underline; }
  .auth-back { font-size: 0.75rem !important; color: #475569 !important; font-weight: 400 !important; }
`;
