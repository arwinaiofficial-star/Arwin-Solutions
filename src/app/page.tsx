import Link from "next/link";
import { recentProjects, pillars } from "@/lib/content";

export default function Home() {
  return (
    <main>
      {/* Hero - Minimal & Bold */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <p className="text-secondary mb-4" style={{ fontSize: '1rem', fontWeight: 500 }}>
              Arwin AI Solutions
            </p>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
              We build digital
              <br />
              products that matter.
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '560px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              14 years of transforming government, education, and enterprise 
              across India. Now powered by AI.
            </p>
            <div className="flex gap-4">
              <Link href="/work" className="btn btn-primary btn-lg">
                See our work
              </Link>
              <a href="mailto:hello@arwinaisolutions.com" className="btn btn-secondary btn-lg">
                Get in touch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers - Simple Grid */}
      <section style={{ borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '4rem 0' }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.5rem' }}>26+</div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Projects shipped</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.5rem' }}>14</div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Years of delivery</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.5rem' }}>3</div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>AI-first products</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.5rem' }}>100+</div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Clients served</div>
            </div>
          </div>
        </div>
      </section>

      {/* What We're Building */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div style={{ marginBottom: '4rem' }}>
            <p className="text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              What we're building
            </p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, maxWidth: '600px', lineHeight: 1.2 }}>
              Three pillars powering the next generation of digital experiences.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border-light)' }}>
            {pillars.map((pillar, index) => (
              <div key={pillar.name} style={{ background: 'white', padding: '2.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  0{index + 1}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                  {pillar.name}
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  {pillar.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: 'var(--gray-100)', borderRadius: '9999px', color: 'var(--text-secondary)' }}>
                    {pillar.status}
                  </span>
                  <Link href={pillar.url} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Learn more &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Work */}
      <section style={{ padding: '6rem 0', background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <p className="text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recent work
              </p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 }}>
                Latest launches
              </h2>
            </div>
            <Link href="/work" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              View all projects &rarr;
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            {recentProjects.map((project) => (
              <a 
                key={project.name} 
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'block',
                  background: 'white', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: '12px',
                  padding: '2rem',
                  transition: 'all 0.2s ease'
                }}
                className="card-hover"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {project.tagline}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>&nearr;</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {project.name}
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  {project.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section style={{ padding: '5rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <p className="text-center" style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '2rem' }}>
            Trusted by leading organizations across India
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {['Govt. of Telangana', 'NTPC', 'Indian Railways', 'Kendriya Vidyalayas', 'TTD Board', 'NIC'].map((client) => (
              <span key={client} style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {client}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '8rem 0' }}>
        <div className="container">
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.75rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.2 }}>
              Ready to build something meaningful?
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
              Let's talk about how we can help transform your organization 
              with AI-powered digital solutions.
            </p>
            <div className="flex justify-center gap-4">
              <a href="mailto:hello@arwinaisolutions.com" className="btn btn-primary btn-lg">
                Start a conversation
              </a>
              <Link href="/about" className="btn btn-secondary btn-lg">
                About us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
