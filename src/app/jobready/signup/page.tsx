"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BriefcaseIcon, CheckIcon } from "@/components/icons/Icons";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push("/jobready/dashboard");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setIsLoading(true);
    try {
      const result = await signup(email, password, name);
      if (result.success) {
        router.push("/jobready/dashboard");
      } else {
        setError(result.error || "An account with this email already exists.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "AI-powered ATS resume builder",
    "Jobs from Adzuna, LinkedIn, Indeed, Glassdoor",
    "PDF resume download",
    "Real apply links — no middleman",
  ];

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
            <h1>Create your account</h1>
            <p>Start building your career in minutes</p>
          </div>

          <div className="auth-benefits">
            {benefits.map((b, i) => (
              <div key={i} className="auth-benefit">
                <CheckIcon size={14} color="#22c55e" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" required />
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" required minLength={6} />
            </div>
            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link href="/jobready/login">Sign in</Link></p>
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
    width: 100%; max-width: 420px;
    background: #111318; border: 1px solid #1e293b; border-radius: 16px;
    padding: 36px 32px;
  }
  .auth-header { text-align: center; margin-bottom: 24px; }
  .auth-logo {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 1.125rem; font-weight: 700; color: #f1f5f9;
    margin-bottom: 20px;
  }
  .auth-logo-ai { color: #3b82f6; }
  .auth-header h1 { font-size: 1.375rem; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; }
  .auth-header p { font-size: 0.875rem; color: #64748b; margin: 0; }

  .auth-benefits {
    display: flex; flex-direction: column; gap: 8px;
    padding: 14px 16px; border-radius: 10px;
    background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.1);
    margin-bottom: 24px;
  }
  .auth-benefit { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: #cbd5e1; }

  .auth-error {
    background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px; padding: 10px 14px; margin-bottom: 20px;
    font-size: 0.8125rem; color: #f87171;
  }

  .auth-form { display: flex; flex-direction: column; gap: 14px; }
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
