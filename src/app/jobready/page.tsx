import Link from "next/link";
import { jobreadyContent } from "@/lib/content";
import JobSearchClient from "@/components/jobready/JobSearchClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JobReady.ai - Find Jobs in India",
  description:
    "AI-powered job search platform for India. Find jobs at Infosys, TCS, Flipkart, and more. Auto-apply with one click. Salaries in INR.",
};

export default function JobReadyPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center max-w-screen-lg mx-auto">
            <div className="badge badge-success mb-md">
              Phase 1 & 2 - Live in India 🇮🇳
            </div>
            <h1 className="hero-title">{jobreadyContent.hero.title}</h1>
            <p className="hero-subtitle mx-auto mb-xl">
              {jobreadyContent.hero.description}
            </p>
            <div className="flex gap-md justify-center flex-wrap">
              <a href="#get-started" className="btn btn-primary btn-lg">
                🔍 Find Jobs Now
              </a>
              <a href="#how-it-works" className="btn btn-outline btn-lg">
                How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* India Focus Banner - Using Indian flag colors (saffron, white, green) */}
      <section 
        className="india-focus-banner"
        style={{ 
          background: "linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)", 
          padding: "var(--space-md) 0" 
        }}
      >
        <div className="container">
          <div className="text-center" style={{ color: "#1a1a2e" }}>
            <p style={{ margin: 0, fontWeight: 600 }}>
              🏢 Jobs from: Infosys • TCS • Flipkart • Razorpay • Paytm • Swiggy • Google India • Amazon India & more
            </p>
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
              <h2 className="mb-md">What&apos;s Available Now</h2>
              <p className="text-muted" style={{ fontSize: "1.125rem" }}>
                Our AI-powered job matching platform is live and helping job seekers find
                opportunities at top Indian companies. Now with auto-apply!
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
              A simple, streamlined process to connect you with job opportunities in India.
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

      {/* Get Started - Job Search */}
      <section id="get-started" className="section">
        <div className="container">
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-xl">
              <h2 className="mb-md">Find Your Next Opportunity in India</h2>
              <p className="text-muted" style={{ fontSize: "1.125rem" }}>
                Enter your skills and preferences below. Our AI will search across top Indian companies
                and show you matching jobs with salaries in INR.
              </p>
            </div>

            <JobSearchClient />
          </div>
        </div>
      </section>

      {/* Future Phase */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-xl">
              <div className="badge mb-md">
                {jobreadyContent.futurePhase.phase} - {jobreadyContent.futurePhase.status}
              </div>
              <h2 className="mb-md">What&apos;s Coming Next</h2>
              <p className="text-muted" style={{ fontSize: "1.125rem" }}>
                We&apos;re building the future of job applications with agentic AI and direct platform integrations.
              </p>
            </div>

            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent-light) 100%)",
                border: "none",
                color: "white",
              }}
            >
              <h3 style={{ color: "white", marginBottom: "var(--space-md)" }}>
                Phase 3: Advanced Automation
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

      {/* Indian Cities */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className="mb-md">Jobs Across India</h2>
            <p className="text-muted" style={{ fontSize: "1.125rem" }}>
              Find opportunities in India&apos;s top tech hubs
            </p>
          </div>
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            justifyContent: "center", 
            gap: "var(--space-md)",
          }}>
            {["Bangalore", "Hyderabad", "Mumbai", "Pune", "Chennai", "Delhi NCR", "Noida", "Gurgaon"].map((city) => (
              <div 
                key={city} 
                className="card" 
                style={{ 
                  padding: "var(--space-md) var(--space-lg)", 
                  textAlign: "center",
                  minWidth: "140px",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>📍</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div
            className="card text-center"
            style={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
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
                fontSize: "1.125rem",
                maxWidth: "700px",
                margin: "0 auto var(--space-xl)",
              }}
            >
              Get in touch with our team to learn more about how JobReady.ai can help you find your
              next opportunity in India.
            </p>
            <div className="flex gap-md justify-center">
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
