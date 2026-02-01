import Link from "next/link";
import Image from "next/image";
import { timeline, executiveSummary, teamMembers, capabilityTracks } from "@/lib/content";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section-lg section-alt">
        <div className="container">
          <div className="grid gap-12" style={{ gridTemplateColumns: '1.2fr 1fr', alignItems: 'center' }}>
            <div>
              <span className="tag tag-primary mb-6">About Us</span>
              <h1 className="mb-6">
                Transforming India&rsquo;s Digital Landscape<br />
                <span className="text-highlight">Since 2011</span>
              </h1>
              <p className="lead mb-8">
                From custom software studio to AI-powered solutions provider, serving government, education, and enterprise sectors across India.
              </p>
              <div className="flex gap-3">
                <Link href="/work" className="btn btn-primary">
                  See Our Work
                </Link>
                <a href="mailto:hello@arwinaisolutions.com" className="btn btn-secondary">
                  Get in Touch
                </a>
              </div>
            </div>
            <div className="card" style={{ padding: '2rem' }}>
              <Image 
                src="/arwin_logo.jpeg" 
                alt="Arwin AI Solutions" 
                width={400} 
                height={400}
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2 gap-8">
            <div className="card" style={{ padding: '2rem' }}>
              <div className="icon-box icon-box-blue mb-4">V</div>
              <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
              <p className="text-secondary leading-relaxed">
                {executiveSummary.vision}
              </p>
            </div>
            <div className="card" style={{ padding: '2rem' }}>
              <div className="icon-box icon-box-teal mb-4">M</div>
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="text-secondary leading-relaxed">
                {executiveSummary.mission}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-12">
            <span className="tag tag-primary mb-4">What Drives Us</span>
            <h2 className="mb-4">Our Core Values</h2>
            <p className="lead max-w-2xl mx-auto">
              Principles guiding every engagement and decision.
            </p>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {executiveSummary.values.map((value, index) => (
              <div key={index} className="card text-center" style={{ padding: '1.5rem' }}>
                <div className="text-2xl font-bold text-primary-600 mb-2">{index + 1}</div>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
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
              From custom software studio to AI-powered solutions provider.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
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
      </section>

      {/* Capability Tracks */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-12">
            <span className="tag tag-primary mb-4">How We Work</span>
            <h2 className="mb-4">Our Capability Tracks</h2>
            <p className="lead max-w-2xl mx-auto">
              Structured methodologies for digital transformation.
            </p>
          </div>

          <div className="grid grid-3 gap-6">
            {capabilityTracks.map((track, index) => (
              <div key={index} className="card" style={{ padding: '1.5rem' }}>
                <div className={`icon-box mb-4 ${getTrackColor(index)}`}>
                  {track.title[0]}
                </div>
                <h3 className="text-lg font-semibold mb-4">{track.title}</h3>
                <ul className="space-y-3">
                  {track.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <span 
                        className="list-dot flex-shrink-0 mt-1.5 mr-2"
                        style={{ backgroundColor: getTrackDotColor(index) }}
                      ></span>
                      <span className="text-secondary">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <span className="tag tag-primary mb-4">Leadership</span>
            <h2 className="mb-4">The Team Behind Arwin AI</h2>
            <p className="lead max-w-2xl mx-auto">
              Experienced professionals driving digital transformation.
            </p>
          </div>

          <div className="grid grid-3 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="card text-center" style={{ padding: '2rem' }}>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-600">
                  {getInitials(member.name)}
                </div>
                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                <p className="text-sm text-accent font-medium mb-4">{member.role}</p>
                <p className="text-secondary text-sm leading-relaxed">{member.bio}</p>
                {member.linkedin && (
                  <a 
                    href={member.linkedin} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center text-sm text-accent hover:underline"
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gray-900">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-white mb-4">Let&rsquo;s Build Something Amazing Together</h2>
            <p className="text-gray-400 mb-8">
              Ready to transform your organization with AI-powered solutions? Let&rsquo;s discuss your digital transformation goals.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="mailto:hello@arwinaisolutions.com" className="btn btn-accent">
                Start a Conversation
              </a>
              <Link href="/work" className="btn btn-outline-light">
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function getTrackColor(index: number): string {
  const colors = ['icon-box-blue', 'icon-box-teal', 'icon-box-gray'];
  return colors[index] || 'icon-box-blue';
}

function getTrackDotColor(index: number): string {
  const colors = ['var(--primary-500)', 'var(--accent-500)', 'var(--gray-500)'];
  return colors[index] || 'var(--primary-500)';
}
