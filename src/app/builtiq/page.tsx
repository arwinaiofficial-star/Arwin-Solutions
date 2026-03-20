import Link from "next/link";
import { builtiqContent } from "@/lib/content";
import {
  BarChart3Icon,
  HomeIcon,
  ShieldIcon,
  ArrowRightIcon,
  LightbulbIcon,
} from "@/components/icons/SiteIcons";
import { BuiltIQWaveIcon } from "@/components/icons/SiteIcons";
import { CheckIcon } from "@/components/icons/Icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BuiltIQ — Intelligence for the Built Environment",
  description:
    "Free construction calculators, BIM guides, and expert-led tools — built to help architects, engineers, and developers make smarter building decisions. Acoustics, materials, area, and carbon footprint tools.",
};

const calcIcons = [BuiltIQWaveIcon, BarChart3Icon, HomeIcon, ShieldIcon];
const calcColors = ["#f59e0b", "#2563eb", "#10b981", "#7c3aed"];

const highlights = [
  "100% free tools",
  "No signup needed",
  "Expert-curated content",
  "India-focused standards",
];

export default function BuiltIQPage() {
  return (
    <>
      {/* Hero */}
      <section className="bi-hero">
        <div className="bi-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
            alt=""
            className="bi-hero-bg-img"
          />
          <div className="bi-hero-bg-overlay" />
        </div>
        <div className="container bi-hero-content">
          <div className="bi-hero-badge">BuiltIQ &bull; Arwin Group</div>
          <h1 className="bi-hero-title">Intelligence for the<br />Built Environment</h1>
          <p className="bi-hero-sub">
            Free construction calculators, BIM guides, and expert-led tools &mdash;
            built to help architects, engineers, and developers make smarter building decisions.
          </p>
          <div className="bi-hero-highlights">
            {highlights.map((h) => (
              <span key={h} className="bi-highlight">
                <span className="bi-highlight-check"><CheckIcon size={12} color="white" /></span>
                {h}
              </span>
            ))}
          </div>
          <div className="bi-hero-actions">
            <Link href="#tools" className="btn btn-primary btn-lg">
              Explore Tools
              <ArrowRightIcon size={18} />
            </Link>
            <Link href="#topics" className="btn btn-outline btn-lg">
              Browse Topics
            </Link>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="text-center mb-xl">
            <div className="eyebrow mb-sm">Free Tools</div>
            <h2>Construction &amp; Design Calculators</h2>
            <p className="text-muted max-w-screen-md mx-auto" style={{ fontSize: "1.0625rem" }}>
              Practical, accurate, no-signup-needed tools for architects, engineers, and builders in India.
            </p>
          </div>

          <div className="bi-calc-grid">
            {builtiqContent.calculators.map((calc, index) => {
              const Icon = calcIcons[index];
              const color = calcColors[index];
              return (
                <Link key={index} href={calc.url} className="bi-calc-card">
                  <div className="bi-calc-icon" style={{ background: `${color}14`, border: `1px solid ${color}25` }}>
                    <Icon size={28} color={color} />
                  </div>
                  <h3 className="bi-calc-title">{calc.name}</h3>
                  <p className="bi-calc-desc">{calc.description}</p>
                  <span className="bi-calc-link" style={{ color }}>
                    Use Tool <ArrowRightIcon size={14} />
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
              Expert-curated content on BIM, acoustics, sustainability, and the future of construction.
            </p>
          </div>

          <div className="bi-topics">
            {builtiqContent.topics.map((topic, index) => (
              <div key={index} className="bi-topic">
                <div className="bi-topic-icon">
                  <LightbulbIcon size={20} color="#f59e0b" />
                </div>
                <p className="bi-topic-name">{topic}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="bi-cta">
            <h2 className="bi-cta-title">Start Building Smarter</h2>
            <p className="bi-cta-sub">
              Free tools. Expert guidance. No signup required.
            </p>
            <div className="bi-cta-actions">
              <Link href="#tools" className="btn btn-lg bi-cta-btn-primary">
                Explore Tools
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
