import Link from "next/link";
import { aboutContent, timeline, stats } from "@/lib/content";
import {
  ForgeIcon,
  FinLensIcon,
  CommunityIcon,
  JobReadyIcon,
  DesignSystemIcon,
  TargetIcon,
  GlobeIcon,
  ShieldIcon,
  HeartHandshakeIcon,
  LightbulbIcon,
  UsersIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@/components/icons/SiteIcons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Arwin Group — 15+ years of digital transformation across government, education, and enterprise sectors. Our story, mission, vision, and team.",
};

const valueIcons = [HeartHandshakeIcon, ShieldIcon, LightbulbIcon, GlobeIcon, TargetIcon, UsersIcon];
const valueColors = ["#2563eb", "#10b981", "#f59e0b", "#7c3aed", "#ef4444", "#06b6d4"];
const teamColors = ["#2563eb", "#7c3aed", "#10b981"];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="text-center max-w-screen-lg mx-auto">
            <div className="badge mb-md" style={{ margin: "0 auto var(--space-md)" }}>About Arwin Group</div>
            <h1 className="hero-title">
              15+ Years of Building India&apos;s Digital Infrastructure
            </h1>
            <p className="hero-subtitle mx-auto">
              From a digital solutions studio in 2011 to an integrated technology ecosystem —
              serving government, education, and enterprise with proven excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container">
          <div className="max-w-screen-lg mx-auto">
            <h2 className="mb-lg">{aboutContent.story.title}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              {aboutContent.story.content.map((paragraph, index) => (
                <p key={index} style={{ fontSize: "1.0625rem", lineHeight: 1.8, color: "var(--color-text-muted)" }}>
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
          <div className="grid grid-2" style={{ gap: "var(--space-lg)", maxWidth: "900px", margin: "0 auto" }}>
            <div className="card" style={{ borderTop: "2px solid var(--color-primary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-lg)", background: "rgba(37, 99, 235, 0.1)", border: "1px solid rgba(37, 99, 235, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TargetIcon size={22} color="#2563eb" />
                </div>
                <h3 style={{ marginBottom: 0 }}>Mission</h3>
              </div>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--color-text-muted)" }}>
                {aboutContent.mission}
              </p>
            </div>
            <div className="card" style={{ borderTop: "2px solid var(--color-accent)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-lg)", background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <GlobeIcon size={22} color="#7c3aed" />
                </div>
                <h3 style={{ marginBottom: 0 }}>Vision</h3>
              </div>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--color-text-muted)" }}>
                {aboutContent.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Overview */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Our Ecosystem</div>
            <h2>Solutions &amp; Products</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Two dimensions, one purpose — solving meaningful problems.
            </p>
          </div>

          <div className="grid grid-2" style={{ maxWidth: "900px", margin: "0 auto", gap: "var(--space-lg)" }}>
            <div className="solution-card">
              <h3 style={{ marginBottom: "var(--space-md)" }}>Solutions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                {[
                  { icon: ForgeIcon, color: "#2563eb", name: "Arwin Forge", desc: "AI-Powered Digital Solutions" },
                  { icon: FinLensIcon, color: "#10b981", name: "FinLens", desc: "Financial Tools & Education" },
                  { icon: CommunityIcon, color: "#7c3aed", name: "WTAI", desc: "AI Community Platform" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: `${item.color}14`, border: `1px solid ${item.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon size={18} color={item.color} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.9375rem" }}>{item.name}</span>
                      <span style={{ color: "var(--color-text-light)", fontSize: "0.8125rem", marginLeft: "0.375rem" }}>— {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="product-card">
              <h3 style={{ marginBottom: "var(--space-md)" }}>Products</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                {[
                  { icon: JobReadyIcon, color: "#2563eb", name: "JobReady", desc: "AI Career Platform" },
                  { icon: DesignSystemIcon, color: "#7c3aed", name: "Maya Design System", desc: "Token-driven Design System" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: `${item.color}14`, border: `1px solid ${item.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon size={18} color={item.color} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.9375rem" }}>{item.name}</span>
                      <span style={{ color: "var(--color-text-light)", fontSize: "0.8125rem", marginLeft: "0.375rem" }}>— {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2>Our Core Values</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Principles that guide every decision and every project we undertake.
            </p>
          </div>

          <div className="grid grid-3">
            {aboutContent.values.map((value, index) => {
              const Icon = valueIcons[index % valueIcons.length];
              const color = valueColors[index % valueColors.length];
              return (
                <div key={index} className="card text-center">
                  <div style={{ width: 48, height: 48, borderRadius: "var(--radius-lg)", background: `${color}14`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-md)" }}>
                    <Icon size={24} color={color} />
                  </div>
                  <p style={{ fontWeight: 600, fontSize: "1rem", color: "var(--color-text)" }}>{value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Our Journey</div>
            <h2>{stats.yearsInBusiness}+ Years of Excellence</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              From founding in 2011 to a full technology ecosystem in 2026.
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

      {/* Team */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2>Leadership Team</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              The people driving Arwin Group forward.
            </p>
          </div>

          <div className="grid grid-3">
            {aboutContent.team.map((member, index) => {
              const color = teamColors[index % teamColors.length];
              return (
                <div key={index} className="card text-center">
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${color}18`, border: `2px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: color, margin: "0 auto var(--space-md)", letterSpacing: "0.05em" }}>
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 style={{ marginBottom: "0.25rem", fontSize: "1.125rem" }}>{member.name}</h3>
                  <p style={{ color: "var(--color-text-light)", fontWeight: 500, fontSize: "0.875rem", marginBottom: "var(--space-md)" }}>
                    {member.role}
                  </p>
                  <p className="text-muted" style={{ fontSize: "0.9375rem" }}>{member.bio}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <SparklesIcon size={32} color="var(--color-primary-light)" />
            <h2 style={{ marginTop: "var(--space-md)", marginBottom: "var(--space-md)" }}>
              Let&apos;s Build Something That Matters
            </h2>
            <p className="text-muted" style={{ fontSize: "1.0625rem", maxWidth: "640px", margin: "0 auto var(--space-xl)" }}>
              15+ years of experience. A growing ecosystem. The right team for your next project.
            </p>
            <div className="flex gap-md justify-center" style={{ flexWrap: "wrap" }}>
              <Link href="/enquiry" className="btn btn-primary btn-lg">
                Start a Project
                <ArrowRightIcon size={18} />
              </Link>
              <Link href="/work" className="btn btn-outline btn-lg">
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
