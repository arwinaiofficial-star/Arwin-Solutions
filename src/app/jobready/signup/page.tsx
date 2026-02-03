"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserIcon, AlertIcon, CheckIcon } from "@/components/icons/Icons";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(email, password, name);
      if (success) {
        router.push("/jobready/dashboard");
      } else {
        setError("An account with this email already exists.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="section" style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}>
      <div className="container">
        <div className="max-w-screen-sm mx-auto">
          <div className="card" style={{ padding: "var(--space-xl)" }}>
            <div className="text-center" style={{ marginBottom: "var(--space-xl)" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-md)",
              }}>
                <UserIcon size={32} color="white" />
              </div>
              <h1 style={{ marginBottom: "var(--space-xs)" }}>Create Account</h1>
              <p style={{ color: "var(--color-text-muted)" }}>
                Join JobReady.ai and find your next opportunity
              </p>
            </div>

            {/* Benefits */}
            <div style={{
              background: "var(--color-surface-highlight)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-md)",
              marginBottom: "var(--space-lg)",
            }}>
              <p style={{ fontWeight: 600, marginBottom: "var(--space-sm)" }}>What you&apos;ll get:</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
                {[
                  "AI-powered CV builder",
                  "One-click job applications",
                  "Application tracking dashboard",
                  "Jobs from top Indian companies",
                ].map((benefit, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                    <CheckIcon size={16} color="var(--color-success)" />
                    <span style={{ fontSize: "0.875rem" }}>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--color-error)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-md)",
                marginBottom: "var(--space-lg)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
              }}>
                <AlertIcon size={20} color="var(--color-error)" />
                <span style={{ color: "var(--color-error)" }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Create a password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", marginTop: "var(--space-sm)" }}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div style={{ marginTop: "var(--space-lg)", textAlign: "center" }}>
              <p style={{ color: "var(--color-text-muted)" }}>
                Already have an account?{" "}
                <Link href="/jobready/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                  Sign in
                </Link>
              </p>
            </div>

            <div style={{ marginTop: "var(--space-md)", textAlign: "center" }}>
              <Link href="/jobready" style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                ← Back to JobReady.ai
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
