import Link from "next/link";
import { jobreadyContent } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JobReady.ai",
  description:
    "Simplifying job applications with AI. Fill out a form once, and let AI find and connect you to relevant job opportunities.",
};

export default function JobReadyPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center max-w-screen-lg mx-auto">
            {/* <div className="badge badge-accent mb-md">{jobreadyContent.currentPhase.phase} {jobreadyContent.currentPhase.status}</div> */}
            <h1 className="hero-title">{jobreadyContent.hero.title}</h1>
            <p className="hero-subtitle mx-auto mb-xl">
              {jobreadyContent.hero.description}
            </p>
            <div className="flex gap-md justify-center">
              <a href="#get-started" className="btn btn-primary btn-lg">
                Get Started
              </a>
              <a href="#how-it-works" className="btn btn-outline btn-lg">
                How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Current Phase */}
      <section className="section">
        <div className="container">
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-xl">
              <div className="badge badge-success mb-md">
                {jobreadyContent.currentPhase.phase} - {jobreadyContent.currentPhase.status}
              </div>
              <h2 className="mb-md">What's Available Now</h2>
              <p className="text-muted" style={{ fontSize: "1.125rem" }}>
                Our AI-powered job matching platform is live and helping job seekers find
                opportunities across multiple platforms.
              </p>
            </div>

            <div className="card">
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-md)",
                }}
              >
                {jobreadyContent.currentPhase.features.map((feature, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--space-md)",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "var(--color-success)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{feature}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className="mb-md">How JobReady.ai Works</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.125rem" }}>
              A simple, streamlined process to connect you with job opportunities.
            </p>
          </div>

          <div className="grid grid-2">
            {jobreadyContent.howItWorks.map((step, index) => (
              <div
                key={index}
                className="card"
                style={{
                  borderTop: index < 2 ? "4px solid var(--color-primary)" : "4px solid var(--color-accent)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                    marginBottom: "var(--space-md)",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: index < 2 ? "var(--color-primary)" : "var(--color-accent)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {step.step}
                  </div>
                  <h3 style={{ marginBottom: 0 }}>{step.title}</h3>
                </div>
                <p style={{ color: "var(--color-text-muted)", marginBottom: 0, fontSize: "1.05rem" }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Phase */}
      <section className="section">
        <div className="container">
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-xl">
              <div className="badge mb-md">
                {jobreadyContent.futurePhase.phase} - {jobreadyContent.futurePhase.status}
              </div>
              <h2 className="mb-md">What's Coming Next</h2>
              <p className="text-muted" style={{ fontSize: "1.125rem" }}>
                We're building the future of job applications with agentic AI and advanced automation.
              </p>
            </div>

            <div
              className="card"
              style={{
                background: "var(--color-primary)",
                border: "none",
                color: "white",
              }}
            >
              <h3 style={{ color: "white", marginBottom: "var(--space-md)" }}>
                Automated Job Applications
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-sm)",
                }}
              >
                {jobreadyContent.futurePhase.features.map((feature, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-sm)",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>→</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <p
                style={{
                  marginTop: "var(--space-lg)",
                  opacity: 0.9,
                  fontWeight: 600,
                  fontSize: "1.05rem",
                }}
              >
                Fill the form once. Let AI do the rest. No more repetitive applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section id="get-started" className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-xl">
              <h2 className="mb-md">Ready to Get Started?</h2>
              <p className="text-muted" style={{ fontSize: "1.125rem" }}>
                Sign up now and let our AI help you find your next opportunity.
              </p>
            </div>

            <div className="card">
              <form style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skills" className="form-label">
                    Key Skills
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    className="form-input"
                    placeholder="e.g., React, Node.js, Python"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience" className="form-label">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    className="form-input"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="preferences" className="form-label">
                    Job Preferences
                  </label>
                  <textarea
                    id="preferences"
                    name="preferences"
                    className="form-textarea"
                    placeholder="Tell us about your ideal job (location, role type, etc.)"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                  Find Jobs Now
                </button>

                <p style={{ textAlign: "center", color: "var(--color-text-light)", fontSize: "0.875rem" }}>
                  By submitting this form, you'll receive personalized job matches from our AI.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div
            className="card text-center"
            style={{
              background: "var(--color-primary)",
              border: "none",
              padding: "var(--space-2xl)",
            }}
          >
            <h2 style={{ color: "white", marginBottom: "var(--space-md)" }}>
              Questions About JobReady.ai?
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "clamp(1rem, 2vw, 1.125rem)",
                maxWidth: "700px",
                margin: "0 auto var(--space-xl)",
              }}
            >
              Get in touch with our team to learn more about how JobReady.ai can help you find your
              next opportunity.
            </p>
            <div className="flex gap-md justify-center" style={{ flexWrap: "wrap" }}>
              <Link
                href="/contact"
                className="btn btn-lg"
                style={{
                  background: "white",
                  color: "var(--color-primary)",
                }}
              >
                Contact Us
              </Link>
              <Link
                href="/about"
                className="btn btn-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "2px solid white",
                }}
              >
                About Arwin AI
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
