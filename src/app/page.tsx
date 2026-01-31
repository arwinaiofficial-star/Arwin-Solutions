import Link from "next/link";
import { heroStats, focusPillars, pillars, recentProjects } from "@/lib/content";

export default function Home() {
  return (
    <>
      <section className="card flex flex-col gap-8 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <p className="tag tag-accent">AI-first consulting studio</p>
          <h1 className="text-4xl font-semibold text-[var(--page-foreground)] md:text-5xl">
            Modern AI delivery for governments, education networks, and ambitious founders.
          </h1>
          <p className="lead">
            Arwin AI Solutions unites strategy services, a proprietary Maya Design System, and product
            accelerators like JobReady.ai. Founded in 2011, rebranded in 2025 to embed AI touchpoints in
            every engagement.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/projects/post" className="btn btn-primary">
              View latest delivery
            </Link>
            <Link href="/domains" className="btn btn-outline">
              Explore domain areas
            </Link>
          </div>
        </div>
        <div className="flex-1 grid gap-4 sm:grid-cols-2">
          {heroStats.map((stat) => (
            <div key={stat.label} className="stat">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
              {stat.helper && <p className="lead">{stat.helper}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="tag">Operating pillars</p>
          <h2 className="text-3xl font-semibold text-[var(--page-foreground)]">
            Three pillars, one delivery rhythm
          </h2>
          <p className="lead">
            Services, Maya Design System, and JobReady.ai share playbooks, tokens, and governance so new
            launches inherit consistent craft and data foundations.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.name} className="card space-y-3">
              <div className="flex items-center justify-between text-sm text-[var(--page-muted)]">
                <span className="tag tag-accent">{pillar.phase}</span>
                <span>{pillar.status}</span>
              </div>
              <h3 className="text-2xl font-semibold">{pillar.name}</h3>
              <p className="text-sm text-[var(--page-muted)]">{pillar.accent}</p>
              <p className="lead">{pillar.description}</p>
              <Link href={pillar.url} className="btn btn-outline text-sm w-fit">
                Learn more ↗
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="tag">Ways we engage</p>
          <h2 className="text-3xl font-semibold">Domain programs & services</h2>
          <p className="lead">
            Consistent consulting tracks so stakeholders know what to expect from workshops through
            launch operations.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {focusPillars.map((pillar) => (
            <article key={pillar.title} className="card-muted space-y-3">
              <h3 className="text-xl font-semibold">{pillar.title}</h3>
              <p className="lead">{pillar.content}</p>
              <div className="flex flex-wrap gap-2">
                {pillar.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="tag">Recent delivery</p>
          <h2 className="text-3xl font-semibold">Highlights after the 2025 rebrand</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {recentProjects.map((project) => (
            <article key={project.name} className="card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--page-muted)]">
                    {project.tagline}
                  </p>
                  <h3 className="text-2xl font-semibold">{project.name}</h3>
                </div>
                <Link href={project.url} className="tag tag-accent" target="_blank" rel="noreferrer">
                  Visit ↗
                </Link>
              </div>
              <p className="lead">{project.description}</p>
              <p className="text-sm text-[var(--page-muted)]">{project.outcome}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Ready to explore JobReady.ai or bespoke AI services?</h2>
        <p className="lead">
          We help governments, academic institutions, and businesses instrument AI responsibly. Tell us
          what you need or try the JobReady.ai workflow now.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/jobready" className="btn btn-primary">
            Open JobReady.ai
          </Link>
          <a href="mailto:hello@arwinaisolutions.com" className="btn btn-outline">
            Email our team
          </a>
        </div>
      </section>
    </>
  );
}
