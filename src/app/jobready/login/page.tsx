"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserIcon, AlertIcon } from "@/components/icons/Icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/jobready/dashboard");
      } else {
        setError("Invalid email or password. Please try again.");
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
              <h1 style={{ marginBottom: "var(--space-xs)" }}>Welcome Back</h1>
              <p style={{ color: "var(--color-text-muted)" }}>
                Sign in to your JobReady.ai account
              </p>
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
                  placeholder="Enter your password"
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
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div style={{ marginTop: "var(--space-lg)", textAlign: "center" }}>
              <p style={{ color: "var(--color-text-muted)" }}>
                Don&apos;t have an account?{" "}
                <Link href="/jobready/signup" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                  Sign up
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
