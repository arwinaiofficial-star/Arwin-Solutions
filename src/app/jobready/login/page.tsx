"use client";

import { useState, type FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RocketIcon } from "@/components/icons/Icons";
import "@/app/jobready/jobready.css";

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
    <div className="jr-auth-page">
      <div className="jr-auth-card">
        <Link href="/jobready" className="jr-auth-logo" aria-label="Back to JobReady">
          <div className="jr-auth-logo-icon">
            <RocketIcon size={20} />
          </div>
          <div className="jr-auth-logo-text">JobReady</div>
        </Link>

        <h1 className="jr-auth-title">Sign In</h1>
        <p className="jr-auth-subtitle">Access your resume, job matches, and application pipeline.</p>

        {error && (
          <div className="jr-input-error-text" style={{ marginBottom: "16px", padding: "12px", backgroundColor: "var(--jr-error-light)", borderRadius: "8px" }}>
            {error}
          </div>
        )}

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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="jr-auth-footer">
          <p>New to JobReady? <Link href="/jobready/signup">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
