"use client";

import { useState, type FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RocketIcon } from "@/components/icons/Icons";
import SocialAuthButtons from "@/components/jobready/auth/SocialAuthButtons";
import "@/app/jobready/jobready.css";

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
    if (isAuthenticated) router.push("/jobready/app");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signup(email, password, name);
      if (result.success) {
        router.push("/jobready/app");
      } else {
        setError(result.error || "An account with this email already exists.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="jr-auth-page">
      <div className="jr-auth-card">
        <Link href="/jobready" className="jr-auth-logo" aria-label="Back to JobReady">
          <div className="jr-auth-logo-icon">
            <RocketIcon size={20} />
          </div>
          <div className="jr-auth-logo-text">JobReady</div>
        </Link>

        <h1 className="jr-auth-title">Create Account</h1>
        <p className="jr-auth-subtitle">Set up access to your resume, matched roles, and application pipeline.</p>

        {error && (
          <div className="jr-input-error-text" style={{ marginBottom: "16px", padding: "12px", backgroundColor: "var(--jr-error-light)", borderRadius: "8px" }}>
            {error}
          </div>
        )}

        <SocialAuthButtons />

        <form onSubmit={handleSubmit} className="jr-auth-form">
          <div className="jr-input-group">
            <label htmlFor="name" className="jr-label">Full Name</label>
            <input
              type="text"
              id="name"
              className="jr-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

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
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>

          <div className="jr-input-group">
            <label htmlFor="confirmPassword" className="jr-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="jr-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="jr-btn jr-btn-primary jr-btn-full jr-btn-lg" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="jr-auth-footer">
          <p>Already have an account? <Link href="/jobready/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
