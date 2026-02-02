import Link from "next/link";
import { aboutContent, timeline, stats } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Arwin AI Solutions - our journey from 2011 to becoming an AI-powered digital transformation leader. Meet our team and discover our philosophy.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center max-w-screen-lg mx-auto">
            {/* <div className="badge mb-md">About Arwin AI Solutions</div> */}
            <h1 className="hero-title">
              Transforming India's Digital Landscape Since 2011
            </h1>
            <p className="hero-subtitle mx-auto">
              From a custom software studio to an AI-powered solutions provider, serving
              government, education, and enterprise sectors with excellence and integrity.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section">
        <div className="container">
          <div className="max-w-screen-lg mx-auto">
            <h2 className="mb-lg">{aboutContent.story.title}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              {aboutContent.story.content.map((paragraph, index) => (
                <p
                  key={index}
                  style={{
                    fontSize: "1.125rem",
                    lineHeight: 1.8,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="grid grid-2" style={{ gap: "var(--space-xl)" }}>
            <div className="card" style={{ borderLeft: "4px solid var(--color-primary)" }}>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: "var(--color-primary)",
                  marginBottom: "var(--space-md)",
                }}
              >
                Mission
              </div>
              <p style={{ fontSize: "1.125rem", lineHeight: 1.8, color: "var(--color-text-muted)" }}>
                {aboutContent.mission}
              </p>
            </div>
            <div className="card" style={{ borderLeft: "4px solid var(--color-accent)" }}>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: "var(--color-accent)",
                  marginBottom: "var(--space-md)",
                }}
              >
                Vision
              </div>
              <p style={{ fontSize: "1.125rem", lineHeight: 1.8, color: "var(--color-text-muted)" }}>
                {aboutContent.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className="mb-md">Our Core Values</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.125rem" }}>
              Principles that guide every decision and every project we undertake.
            </p>
          </div>

          <div className="grid grid-3">
            {aboutContent.values.map((value, index) => (
              <div
                key={index}
                className="card"
                style={{
                  textAlign: "center",
                  background: "var(--color-background-alt)",
                  border: "none",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "var(--color-primary)",
                    marginBottom: "var(--space-md)",
                  }}
                >
                  {index + 1}
                </div>
                <p style={{ fontWeight: 600, fontSize: "1.125rem" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="text-center mb-xl">
            {/* <div className="badge badge-accent mb-md">Our Journey</div> */}
            <h2 className="mb-md">{stats.yearsInBusiness}+ Years of Excellence</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.125rem" }}>
              From our founding in 2011 to becoming an AI-powered solutions leader in 2024.
            </p>
          </div>

          <div className="max-w-screen-md mx-auto">
            <div className="timeline">
              {timeline.map((item, index) => (
                <div key={index} className={`timeline-item ${item.milestone ? "milestone" : ""}`}>
                  <div className="timeline-year">{item.year}</div>
                  <div className="timeline-title">{item.title}</div>
                  <div className="timeline-description">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className="mb-md">Leadership Team</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.125rem" }}>
              Meet the visionaries driving Arwin AI Solutions forward.
            </p>
          </div>

          <div className="grid grid-3">
            {aboutContent.team.map((member, index) => (
              <div key={index} className="card text-center">
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "white",
                    margin: "0 auto var(--space-md)",
                  }}
                >
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 style={{ marginBottom: "var(--space-xs)" }}>{member.name}</h3>
                <p
                  style={{
                    color: "var(--color-accent)",
                    fontWeight: 600,
                    marginBottom: "var(--space-md)",
                  }}
                >
                  {member.role}
                </p>
                <p className="text-muted">{member.bio}</p>
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
              Let's Build Something Amazing Together
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "1.125rem",
                maxWidth: "700px",
                margin: "0 auto var(--space-xl)",
              }}
            >
              Ready to transform your organization with our proven expertise and AI-powered solutions?
            </p>
            <div className="flex gap-md justify-center">
              <Link
                href="/enquiry"
                className="btn btn-lg"
                style={{
                  background: "white",
                  color: "var(--color-primary)",
                }}
              >
                Start a Project
              </Link>
              <Link
                href="/work"
                className="btn btn-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "2px solid white",
                }}
              >
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
