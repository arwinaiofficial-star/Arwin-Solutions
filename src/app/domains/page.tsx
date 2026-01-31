import { focusPillars, pillars, capabilityTracks } from "@/lib/content";

export default function DomainsPage() {
  return (
    <div className="space-y-6">
      <header className="card space-y-3">
        <p className="tag tag-accent">Domain areas</p>
        <h1 className="text-3xl font-semibold">Where we operate</h1>
        <p className="lead">
          Arwin AI Solutions ties together services, in-house platforms, and community initiatives.
          Choose a lane or combine them for a full-stack engagement.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Primary pillars</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.name} className="card-muted space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--page-muted)]">{pillar.phase}</p>
              <h3 className="text-xl font-semibold">{pillar.name}</h3>
              <p className="text-sm text-[var(--page-muted)]">{pillar.status}</p>
              <p className="lead">{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Service programs</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {focusPillars.map((pillar) => (
            <article key={pillar.title} className="card space-y-3">
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

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Capability tracks</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {capabilityTracks.map((track) => (
            <article key={track.title} className="card-muted space-y-3">
              <h3 className="text-lg font-semibold">{track.title}</h3>
              <ul className="space-y-2 text-sm text-[var(--page-muted)]">
                {track.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="list-dot" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
