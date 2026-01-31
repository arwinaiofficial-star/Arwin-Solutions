import { legacyGroups } from "@/lib/content";

export default function LegacyProjects() {
  return (
    <div className="space-y-6">
      <header className="card space-y-3">
        <p className="tag tag-accent">Legacy delivery</p>
        <h1 className="text-3xl font-semibold">Before the AI rebrand</h1>
        <p className="lead">
          26 launches between 2011 and 2024 shaped our operating model. They span government portals,
          education networks, healthcare, and enterprise programs across India.
        </p>
      </header>
      <div className="grid gap-5 lg:grid-cols-3">
        {legacyGroups.map((group) => (
          <article key={group.title} className="card space-y-3">
            <h2 className="text-xl font-semibold">{group.title}</h2>
            <ul className="space-y-2 text-sm text-[var(--page-muted)]">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="list-dot" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
