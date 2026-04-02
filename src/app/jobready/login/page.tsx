"use client";

import { useState, type FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CheckIcon, RocketIcon, SparklesIcon } from "@/components/icons/Icons";
import SocialAuthButtons from "@/components/jobready/auth/SocialAuthButtons";
import "@/app/jobready/jobready.css";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) router.push("/jobready/app");
  }, [isAuthenticated, router]);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      const messages: Record<string, string> = {
        google_auth_failed: "Google sign-in was cancelled or failed.",
        google_token_failed: "Could not complete Google sign-in. Please try again.",
        linkedin_auth_failed: "LinkedIn sign-in was cancelled or failed.",
        linkedin_token_failed: "Could not complete LinkedIn sign-in. Please try again.",
        auth_failed: "Social sign-in failed. Please try again or use email/password.",
      };
      setError(messages[oauthError] || "Sign-in failed. Please try again.");
    }
  }, [searchParams]);

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
    <div className="jr-auth-shell">
      <section className="jr-auth-side">
        <Link href="/jobready" className="jr-auth-logo" aria-label="Back to JobReady">
          <div className="jr-auth-logo-icon">
            <RocketIcon size={20} />
          </div>
          <div className="jr-auth-logo-text">JobReady</div>
        </Link>

        <div className="jr-auth-side-copy">
          <span className="jr-page-eyebrow">Career workspace</span>
          <h1>Pick up where you left off.</h1>
          <p>Your resume, saved roles, and application tracker stay in one place.</p>
        </div>

        <div className="jr-auth-benefits">
          <div className="jr-auth-benefit">
            <SparklesIcon size={16} />
            <span>Resume draft and ATS score</span>
          </div>
          <div className="jr-auth-benefit">
            <CheckIcon size={16} />
            <span>Role search linked to your profile</span>
          </div>
          <div className="jr-auth-benefit">
            <CheckIcon size={16} />
            <span>Saved jobs and applications in one tracker</span>
          </div>
        </div>
      </section>

      <section className="jr-auth-content">
        <div className="jr-auth-card">
          <h2 className="jr-auth-title">Welcome back</h2>
          <p className="jr-auth-subtitle">Sign in to continue with your resume, jobs, and applications.</p>

          {error && (
            <div className="jr-input-error-text jr-auth-alert">
              {error}
            </div>
          )}

          <SocialAuthButtons />

          <form onSubmit={handleSubmit} className="jr-auth-form">
            <div className="jr-input-group">
              <label htmlFor="email" className="jr-label">Email</label>
              <input
                type="email"
                id="email"
                className="jr-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="jr-input-group">
              <label htmlFor="password" className="jr-label">Password</label>
              <input
                type="password"
                id="password"
                className="jr-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="jr-btn jr-btn-primary jr-btn-full jr-btn-lg" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="jr-auth-footer">
            <p>New to JobReady? <Link href="/jobready/signup">Create your account</Link></p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="jr-auth-page">
      <Suspense fallback={<div className="jr-auth-card" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
