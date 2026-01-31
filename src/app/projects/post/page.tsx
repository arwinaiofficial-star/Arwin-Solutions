import Link from "next/link";
import { recentProjects } from "@/lib/content";

export default function PostRebrandProjects() {
  return (
    <div className="space-y-6">
      <header className="card space-y-3">
        <p className="tag tag-accent">Projects</p>
        <h1 className="text-3xl font-semibold">After rebranding to Arwin AI Solutions</h1>
        <p className="lead">
          These launches (2024 onward) leverage the updated Maya Design System, Vercel edge runtime, and
          AI copilots baked into operations.
        </p>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        {recentProjects.map((project) => (
          <article key={project.name} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--page-muted)]">
                  {project.tagline}
                </p>
                <h2 className="text-2xl font-semibold">{project.name}</h2>
              </div>
              <Link href={project.url} className="tag tag-accent" target="_blank" rel="noreferrer">
                Visit ↗
              </Link>
            </div>
            <p className="lead">{project.description}</p>
            <p className="text-sm text-[var(--page-muted)]">{project.outcome}</p>
            <div className="flex flex-wrap gap-2">
              {project.focus.map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
