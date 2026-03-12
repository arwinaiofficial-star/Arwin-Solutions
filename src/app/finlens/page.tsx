import Link from "next/link";
import { finlensContent } from "@/lib/content";
import {
  BarChart3Icon,
  TrendingUpIcon,
  HomeIcon,
  ShieldIcon,
  ArrowRightIcon,
  LightbulbIcon,
} from "@/components/icons/SiteIcons";
import { CheckIcon } from "@/components/icons/Icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FinLens — See Your Finances Clearly",
  description:
    "Free financial calculators, expert guides, and actionable tips — built to help you make smarter money decisions. SIP, Step-up SIP, EMI calculators, and term insurance guide.",
};

const calcIcons = [BarChart3Icon, TrendingUpIcon, HomeIcon, ShieldIcon];
const calcColors = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b"];

const highlights = [
  "100% free calculators",
  "No signup needed",
  "Expert-curated content",
  "INR-focused tools",
];

export default function FinLensPage() {
  return (
    <>
      {/* Hero */}
      <section className="fl-hero">
        <div className="fl-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80"
            alt=""
            className="fl-hero-bg-img"
          />
          <div className="fl-hero-bg-overlay" />
        </div>
        <div className="container fl-hero-content">
          <div className="fl-hero-badge">FinLens &bull; Arwin Group</div>
          <h1 className="fl-hero-title">See Your Finances<br />Clearly</h1>
          <p className="fl-hero-sub">
            Free financial calculators, expert guides, and actionable tips &mdash; 
            built to help you make smarter money decisions. No jargon. No paywalls. Just clarity.
          </p>
          <div className="fl-hero-highlights">
            {highlights.map((h) => (
              <span key={h} className="fl-highlight">
                <span className="fl-highlight-check"><CheckIcon size={12} color="white" /></span>
                {h}
              </span>
            ))}
          </div>
          <div className="fl-hero-actions">
            <Link href="#calculators" className="btn btn-primary btn-lg">
              Explore Calculators
              <ArrowRightIcon size={18} />
            </Link>
            <Link href="#topics" className="btn btn-outline btn-lg">
              Browse Topics
            </Link>
          </div>
        </div>
      </section>

      {/* Expert — Split Layout */}
      <section className="section">
        <div className="container">
          <div className="fl-expert-split">
            <div className="fl-expert-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                alt="Financial analysis"
                className="fl-expert-img"
              />
            </div>
            <div className="fl-expert-content">
              <div className="eyebrow mb-sm">Meet Our Expert</div>
              <h2 className="mb-sm">{finlensContent.expert.name}</h2>
              <p className="fl-expert-role">{finlensContent.expert.role}</p>
              <p className="text-muted" style={{ fontSize: "1.0625rem", lineHeight: 1.7 }}>
                {finlensContent.expert.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calculators */}
      <section id="calculators" className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Free Tools</div>
            <h2>Financial Calculators</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Simple, accurate, no-signup-needed calculators to plan your investments and loans.
            </p>
          </div>

          <div className="fl-calc-grid">
            {finlensContent.calculators.map((calc, index) => {
              const Icon = calcIcons[index];
              const color = calcColors[index];
              return (
                <Link key={index} href={calc.url} className="fl-calc-card">
                  <div className="fl-calc-icon" style={{ background: `${color}14`, border: `1px solid ${color}25` }}>
                    <Icon size={28} color={color} />
                  </div>
                  <h3 className="fl-calc-title">{calc.name}</h3>
                  <p className="fl-calc-desc">{calc.description}</p>
                  <span className="fl-calc-link" style={{ color }}>
                    Use Calculator <ArrowRightIcon size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section id="topics" className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Knowledge Base</div>
            <h2>Topics We Cover</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Expert-curated content on the financial topics that matter most.
            </p>
          </div>

          <div className="fl-topics">
            {finlensContent.topics.map((topic, index) => (
              <div key={index} className="fl-topic">
                <div className="fl-topic-icon">
                  <LightbulbIcon size={20} color="var(--color-primary-light)" />
                </div>
                <p className="fl-topic-name">{topic}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="fl-cta">
            <h2 className="fl-cta-title">Start Making Smarter Money Decisions</h2>
            <p className="fl-cta-sub">
              Free calculators. Expert guidance. No signup required.
            </p>
            <div className="fl-cta-actions">
              <Link href="#calculators" className="btn btn-lg fl-cta-btn-primary">
                Explore Calculators
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
