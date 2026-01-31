import Image from "next/image";
import Link from "next/link";
import {
  capabilityTracks,
  executiveSummary,
  focusPillars,
  heroStats,
  legacyGroups,
  pillars,
  recentProjects,
  timeline,
} from "@/lib/content";

const navLinks = [
  { label: "Solutions", href: "#pillars" },
  { label: "Expertise", href: "#expertise" },
  { label: "Delivery", href: "#delivery" },
  { label: "JobReady.ai", href: "#jobready" },
];

const primaryButtonClass =
  "maya-button maya-button--variant-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm transition";

const secondaryButtonClass =
  "maya-button maya-button--variant-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm";

export function HeroSection() {
  return (
    <section>
      <div className="section-shell py-12 space-y-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/arwin_logo.jpeg"
              alt="Arwin AI Solutions logo"
              width={56}
              height={56}
              className="rounded-xl border border-slate-200 bg-white object-contain p-2"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                Arwin AI Solutions
              </p>
              <p className="text-sm text-slate-500">AI touch in delivery since 2011</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-slate-900">
                {link.label}
              </a>
            ))}
            <a href="#contact" className="hover:text-slate-900">
              Contact
            </a>
          </nav>
        </div>
        <div className="corporate-card flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <p className="section-kicker">AI-first digital partner</p>
            <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
              Practical AI, solid engineering, and Maya Design System craft for every launch
            </h1>
            <p className="text-lg text-slate-600">
              We operate like a modern corporate studio: clear governance, reusable systems, and
              measurable impact across services, product, and community. Arwin Solutions rebranded as
              Arwin AI Solutions to embed an AI touch in every engagement.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link className={primaryButtonClass} href="/jobready">
                Launch JobReady.ai
              </Link>
              <a className={secondaryButtonClass} href="#contact" aria-label="Contact team">
                Speak with our team
              </a>
            </div>
          </div>
          <div className="flex-1 grid gap-4 sm:grid-cols-2">
            {heroStats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <p className="stat-card__label">{stat.label}</p>
                <p className="stat-card__value">{stat.value}</p>
                {stat.helper && <p className="stat-card__helper">{stat.helper}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PillarsSection() {
  return (
    <section id="pillars" className="section-shell mt-20 space-y-6">
      <div>
        <p className="section-kicker">Solutions & platforms</p>
        <h2 className="section-title">Three pillars, one operating system</h2>
        <p className="section-subtitle">
          Services, in-house design language, and a SaaS product line up behind a shared delivery
          framework so that research, design, and engineering move in unison.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {pillars.map((pillar) => (
          <div key={pillar.name} className="corporate-card flex h-full flex-col gap-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span className="chip chip--accent text-xs uppercase tracking-[0.3em]">
                {pillar.phase}
              </span>
              <span>{pillar.status}</span>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">{pillar.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{pillar.accent}</p>
            </div>
            <p className="text-slate-600">{pillar.description}</p>
            <Link href={pillar.url} className="text-sm font-semibold brand-link">
              Learn more ↗
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FocusTracksSection() {
  return (
    <section id="expertise" className="section-shell mt-24 space-y-10">
      <div>
        <p className="section-kicker">Operating model</p>
        <h2 className="section-title">How we deliver with an AI touch</h2>
        <p className="section-subtitle">
          Every brief starts with business clarity, Maya Design System alignment, and a responsible AI
          review. That structure gives us the room to innovate while keeping enterprise-grade rigour.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {focusPillars.map((pillar) => (
          <article key={pillar.title} className="corporate-card flex flex-col gap-4">
            <h3 className="text-2xl font-semibold text-slate-900">{pillar.title}</h3>
            <p className="text-slate-600">{pillar.content}</p>
            <div className="flex flex-wrap gap-2">
              {pillar.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="corporate-card space-y-4">
          <h3 className="text-2xl font-semibold text-slate-900">Vision & Mission</h3>
          <p className="text-slate-700">{executiveSummary.vision}</p>
          <p className="text-slate-700">{executiveSummary.mission}</p>
        </div>
        <div className="corporate-card space-y-3">
          <h3 className="text-2xl font-semibold text-slate-900">Values we operate by</h3>
          <ul className="space-y-3 text-slate-700">
            {executiveSummary.values.map((value) => (
              <li key={value} className="flex items-start gap-3">
                <span className="brand-dot mt-1 h-2 w-2 rounded-full" />
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function RecentDeliverySection() {
  return (
    <section id="delivery" className="section-shell mt-24 space-y-8">
      <div>
        <p className="section-kicker">Recent delivery</p>
        <h2 className="section-title">Post-rebrand projects already in market</h2>
        <p className="section-subtitle">
          We continue to launch civic, education, and community experiences with the updated Maya
          Design System and AI copilots layered where they create measurable value.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {recentProjects.map((project) => (
          <article key={project.name} className="corporate-card flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{project.tagline}</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-900">{project.name}</h3>
              </div>
              <Link
                href={project.url}
                className="chip chip--accent text-xs"
                target="_blank"
                rel="noreferrer"
              >
                Visit ↗
              </Link>
            </div>
            <p className="text-slate-700">{project.description}</p>
            <p className="text-sm text-slate-500">{project.outcome}</p>
            <div className="flex flex-wrap gap-2">
              {project.focus.map((item) => (
                <span key={item} className="chip text-xs">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CapabilityTracksSection() {
  return (
    <section className="section-shell mt-24 space-y-6">
      <div>
        <p className="section-kicker">Capabilities</p>
        <h2 className="section-title">End-to-end partnership tracks</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {capabilityTracks.map((track) => (
          <div key={track.title} className="corporate-card space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">{track.title}</h3>
            <ul className="space-y-3 text-slate-700">
              {track.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-1 block h-2 w-2 rounded-full bg-slate-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LegacySection() {
  return (
    <section id="legacy" className="section-shell mt-24 space-y-8">
      <div>
        <p className="section-kicker">Legacy portfolio</p>
        <h2 className="section-title">26 launches that shaped our rebrand</h2>
        <p className="section-subtitle">
          Years of shipping for government departments, education networks, healthcare providers, and
          enterprises taught us how to operate at scale before bringing AI deeper into the stack.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {legacyGroups.map((group) => (
          <div key={group.title} className="corporate-card space-y-3">
            <h3 className="text-xl font-semibold text-slate-900">{group.title}</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="brand-dot mt-1 h-1.5 w-1.5 rounded-full" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TimelineSection() {
  return (
    <section className="section-shell mt-24 space-y-6">
      <div>
        <p className="section-kicker">Momentum</p>
        <h2 className="section-title">From 2011 foundations to the AI era</h2>
      </div>
      <div className="corporate-card timeline-panel space-y-6">
        {timeline.map((entry) => (
          <div key={entry.year} className="pl-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {entry.year}
            </p>
            <h3 className="text-lg font-semibold text-slate-900">{entry.label}</h3>
            <p className="text-slate-700">{entry.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function JobReadyPreviewSection() {
  return (
    <section id="jobready" className="section-shell mt-24">
      <div className="corporate-card flex flex-col gap-8 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <p className="section-kicker">JobReady.ai preview</p>
          <h2 className="text-3xl font-semibold text-slate-900">
            Guided intake + automated search across LinkedIn-style networks
          </h2>
          <p className="text-slate-700">
            When prospects click JobReady.ai we capture context, automate searches across Remotive,
            Arbeitnow, LinkedIn, Indeed, Naukri, Simplify, and JobRight, then hand them rich metadata
            to continue applications on native platforms.
          </p>
          <ul className="space-y-3 text-slate-700">
            <li>
              <strong>1. Intake -&gt;</strong> capture name, role focus, geography, and priorities.
            </li>
            <li>
              <strong>2. Search -&gt;</strong> the Next.js API route fans out to public job APIs and
              builds deep links for other marketplaces.
            </li>
            <li>
              <strong>3. Results -&gt;</strong> clean cards with company, description, and outbound
              links.
            </li>
          </ul>
          <Link className={primaryButtonClass} href="/jobready">
            Try the workflow
          </Link>
        </div>
        <div className="flex-1 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Flow overview</p>
          <ol className="space-y-3 text-sm text-slate-600">
            <li>Automated API aggregation from Remotive & Arbeitnow.</li>
            <li>Fallback deep links for LinkedIn, Indeed, Naukri, Simplify, JobRight.</li>
            <li>Maya Design System forms keep UX consistent across ventures.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <footer id="contact" className="section-shell mt-24">
      <div className="corporate-card grid gap-8 lg:grid-cols-3">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Contact</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">Let&apos;s build responsibly</h3>
          <p className="mt-3 text-slate-700">
            hello@arwinaisolutions.com
            <br />
            +91 90000 00000
          </p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Preferred stack</p>
          <ul className="mt-3 space-y-2 text-slate-700">
            <li>Next.js 16 · React 19 · App Router</li>
            <li>Tailwind CSS v4 · Maya Design System v2.0.0</li>
            <li>Deployed on Vercel</li>
          </ul>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Follow</p>
          <ul className="mt-3 space-y-2 text-slate-700">
            <li>
              <a href="https://wtai.in/" target="_blank" rel="noreferrer" className="hover:text-slate-900">
                WTAI Community
              </a>
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/@maya-design-system/design-system"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900"
              >
                Maya Design System @ npm
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Arwin AI Solutions · Crafted on Maya Design System
      </p>
    </footer>
  );
}
