import Link from "next/link";
import { jobreadyContent } from "@/lib/content";
import type { Metadata } from "next";
import {
  SearchIcon,
  UserIcon,
  BotIcon,
  DocumentIcon,
  ClipboardIcon,
  RocketIcon,
  CheckIcon,
  BuildingIcon,
  LocationIcon,
  ArrowRightIcon,
} from "@/components/icons/Icons";

export const metadata: Metadata = {
  title: "JobReady.ai - Find Jobs in India",
  description:
    "AI-powered job search platform for India. Create ATS-friendly CV with our AI assistant. Auto-apply with one click. Jobs from Infosys, TCS, Flipkart, and more.",
};

export default function JobReadyPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center max-w-screen-lg mx-auto">
            <div className="badge badge-success mb-md" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-xs)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
              Now Live in India
            </div>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            <h1 className="hero-title">{jobreadyContent.hero.title}</h1>
            <p className="hero-subtitle mx-auto mb-xl">
              Your AI-powered career assistant. Create an ATS-friendly CV through our intelligent chat, 
              find matching jobs at top Indian companies, and apply with one click.
            </p>
            <div className="flex gap-md justify-center flex-wrap">
              <Link href="/jobready/signup" className="btn btn-primary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-xs)" }}>
                <RocketIcon size={20} />
                Get Started Free
              </Link>
              <Link href="/jobready/login" className="btn btn-outline btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-xs)" }}>
                <UserIcon size={20} />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* India Focus Banner */}
      <section 
        className="india-focus-banner"
        style={{ 
          background: "linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)", 
          padding: "var(--space-md) 0" 
        }}
      >
        <div className="container">
          <div className="text-center" style={{ color: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-sm)" }}>
            <BuildingIcon size={20} />
            <p style={{ margin: 0, fontWeight: 600 }}>
              Jobs from: Infosys • TCS • Flipkart • Razorpay • Paytm • Swiggy • Google India • Amazon India & more
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Agentic Flow */}
      <section id="how-it-works" className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className="mb-md">How JobReady.ai Works</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.125rem" }}>
              A simple, AI-powered process to get you job-ready
            </p>
          </div>

          <div className="grid grid-2">
            {[
              {
                step: 1,
                title: "Sign Up & Chat with AI",
                description: "Create your account and start chatting with our AI assistant. It will guide you through creating your profile and CV.",
                icon: BotIcon,
              },
              {
                step: 2,
                title: "AI Creates Your CV",
                description: "Answer a few questions and our AI generates an ATS-optimized CV. Preview it, make changes, and approve.",
                icon: DocumentIcon,
              },
              {
                step: 3,
                title: "Find & Apply to Jobs",
                description: "Search jobs from top Indian companies. Your CV is automatically attached when you apply with one click.",
                icon: SearchIcon,
              },
              {
                step: 4,
                title: "Track Applications",
                description: "Monitor all your applications in your personal dashboard. Get updates on views, shortlists, and interviews.",
                icon: ClipboardIcon,
              },
            ].map((step, index) => (
              <div
                key={index}
                className="card"
                style={{
                  borderTop: `4px solid ${index < 2 ? "var(--color-primary)" : "var(--color-accent)"}`,
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
                      flexShrink: 0,
                    }}
                  >
                    <step.icon size={24} color="white" />
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

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-xl">
              <div className="badge badge-success mb-md">
                All Features Live
              </div>
              <h2 className="mb-md">What You Get</h2>
              <p className="text-muted" style={{ fontSize: "1.125rem" }}>
                Everything you need to land your dream job in India
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
                {[
                  "Intelligent AI chat assistant",
                  "ATS-optimized CV generation",
                  "Jobs from top Indian companies",
                  "Salaries displayed in INR",
                  "One-click job applications",
                  "Personal application dashboard",
                  "Real-time status tracking",
                  "Secure user accounts",
                ].map((feature, index) => (
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
                      }}
                    >
                      <CheckIcon size={18} color="white" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: 0 }}>{feature}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Indian Cities */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "var(--space-xs)",
                }}
              >
                <LocationIcon size={24} color="var(--color-primary)" />
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
              Ready to Find Your Dream Job?
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "1.125rem",
                maxWidth: "700px",
                margin: "0 auto var(--space-xl)",
              }}
            >
              Join thousands of job seekers using JobReady.ai to land roles at India&apos;s top companies.
              Create your AI-powered CV and start applying today.
            </p>
            <div className="flex gap-md justify-center flex-wrap">
              <Link
                href="/jobready/signup"
                className="btn btn-lg"
                style={{
                  background: "white",
                  color: "var(--color-primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-xs)",
                }}
              >
                <RocketIcon size={20} />
                Get Started Free
              </Link>
              <Link
                href="/jobready/login"
                className="btn btn-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "2px solid white",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-xs)",
                }}
              >
                Sign In
                <ArrowRightIcon size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ/Contact */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="text-center">
            <h2 style={{ marginBottom: "var(--space-md)" }}>
              Questions About JobReady.ai?
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-lg)" }}>
              Get in touch with our team to learn more
            </p>
            <div className="flex gap-md justify-center">
              <Link href="/contact" className="btn btn-primary">
                Contact Us
              </Link>
              <Link href="/about" className="btn btn-secondary">
                About Arwin AI
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
