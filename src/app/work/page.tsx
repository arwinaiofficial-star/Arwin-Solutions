import Link from "next/link";
import { recentProjects, legacyGroups, timeline } from "@/lib/content";

export default function WorkPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section-lg section-alt">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="tag tag-primary mb-6">Our Portfolio</span>
            <h1 className="mb-6">
              <span className="text-highlight">26+ Digital Transformations</span><br />
              Across India Since 2011
            </h1>
            <p className="lead">
              From government portals serving millions to educational platforms 
              transforming how students learn — we&rsquo;ve delivered meaningful impact 
              across India&rsquo;s most critical sectors.
            </p>
          </div>
          
          {/* Impact Stats */}
          <div className="grid gap-6 mt-12" style={{ gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: '800px', margin: '3rem auto 0' }}>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">9+</div>
              <div className="text-sm text-secondary">Government Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">11+</div>
              <div className="text-sm text-secondary">Education Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">6+</div>
              <div className="text-sm text-secondary">Enterprise Solutions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">14+</div>
              <div className="text-sm text-secondary">Years of Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Launches - Post Rebrand */}
      <section className="section">
        <div className="container">
          <div className="mb-12">
            <span className="tag tag-success mb-4">2025 — Post-Rebrand</span>
            <h2 className="mb-4">Latest Success Stories</h2>
            <p className="lead max-w-2xl">
              Our newest launches showcasing AI-powered capabilities, Maya Design System tokens, 
              and modern architecture.
            </p>
          </div>

          <div className="grid gap-8" style={{ gridTemplateColumns: '1fr' }}>
            {recentProjects.map((project) => (
              <div key={project.name} className="card" style={{ padding: '2rem' }}>
                <div className="grid gap-8" style={{ gridTemplateColumns: '2fr 1fr' }}>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="tag tag-primary">{project.tagline}</span>
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Visit Live Site ↗
                      </a>
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">{project.name}</h3>
                    <p className="text-secondary leading-relaxed mb-6">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.focus.map((item) => (
                        <span key={item} className="tag">{item}</span>
                      ))}
                    </div>
                  </div>
                  <div className="card-muted" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4 className="text-sm font-semibold text-tertiary uppercase tracking-wide mb-2">Outcome</h4>
                    <p className="text-secondary text-sm leading-relaxed">{project.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Portfolio by Sector */}
      <section className="section section-alt">
        <div className="container">
          <div className="mb-12">
            <span className="tag tag-primary mb-4">2011–2024 — Legacy Portfolio</span>
            <h2 className="mb-4">14 Years of Digital Excellence</h2>
            <p className="lead max-w-2xl">
              The foundation projects that established Arwin Solutions as a trusted partner 
              for India&rsquo;s government, education, and enterprise sectors.
            </p>
          </div>

          {/* Government Sector */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-box icon-box-blue">G</div>
              <div>
                <h3 className="text-xl font-semibold">Government & Civic</h3>
                <p className="text-sm text-secondary">9+ digital transformation projects for public sector</p>
              </div>
            </div>
            <div className="grid grid-3 gap-4">
              {legacyGroups[0].items.map((item) => (
                <div key={item} className="card" style={{ padding: '1rem 1.25rem' }}>
                  <div className="flex items-center gap-3">
                    <span className="list-dot flex-shrink-0"></span>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Sector */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-box icon-box-teal">E</div>
              <div>
                <h3 className="text-xl font-semibold">Education & Philanthropy</h3>
                <p className="text-sm text-secondary">11+ institutional and learning platforms</p>
              </div>
            </div>
            <div className="grid grid-3 gap-4">
              {legacyGroups[1].items.map((item) => (
                <div key={item} className="card" style={{ padding: '1rem 1.25rem' }}>
                  <div className="flex items-center gap-3">
                    <span className="list-dot flex-shrink-0" style={{ backgroundColor: 'var(--accent-500)' }}></span>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Sector */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-box icon-box-gray">B</div>
              <div>
                <h3 className="text-xl font-semibold">Enterprise & Social Impact</h3>
                <p className="text-sm text-secondary">6+ business and community platforms</p>
              </div>
            </div>
            <div className="grid grid-3 gap-4">
              {legacyGroups[2].items.map((item) => (
                <div key={item} className="card" style={{ padding: '1rem 1.25rem' }}>
                  <div className="flex items-center gap-3">
                    <span className="list-dot flex-shrink-0" style={{ backgroundColor: 'var(--gray-500)' }}></span>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <span className="tag tag-primary mb-4">Our Journey</span>
            <h2 className="mb-4">14+ Years of Evolution</h2>
            <p className="lead max-w-2xl mx-auto">
              From a custom software studio to an AI-powered solutions provider.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-0">
              {timeline.map((item, index) => (
                <div 
                  key={index} 
                  className="relative pl-8 pb-8"
                  style={{ 
                    borderLeft: item.milestone ? '2px solid var(--primary-500)' : '1px solid var(--border-light)' 
                  }}
                >
                  <div 
                    className="absolute -left-1.5 top-0 w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.milestone ? 'var(--primary-500)' : 'var(--gray-300)' }}
                  />
                  <div className="mb-1">
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: item.milestone ? 'var(--primary-600)' : 'var(--text-tertiary)' }}
                    >
                      {item.year}
                    </span>
                  </div>
                  <h4 className={`font-semibold mb-2 ${item.milestone ? '' : 'text-secondary'}`}>
                    {item.label}
                  </h4>
                  <p className="text-secondary text-sm leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gray-900">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-white mb-4">Ready to Join Our Success Stories?</h2>
            <p className="text-gray-400 mb-8">
              Let&rsquo;s discuss how we can transform your organization with our proven 
              digital transformation expertise and AI-powered solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="mailto:hello@arwinaisolutions.com" className="btn btn-accent">
                Start a Project
              </a>
              <Link href="/solutions" className="btn btn-outline-light">
                Explore Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
