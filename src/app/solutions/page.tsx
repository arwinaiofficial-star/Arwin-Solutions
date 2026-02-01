import PillarCard from "@/components/ui/PillarCard";
import { pillars, focusPillars } from "@/lib/content";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section section-alt">
        <div className="container text-center">
          <span className="tag tag-primary mb-6">Our Solutions</span>
          <h1 className="mb-6">
            <span className="text-highlight">AI-Powered</span> Digital Transformation
          </h1>
          <p className="lead max-w-3xl mx-auto">
            Three synergistic pillars: WTAI community, Maya Design System, and JobReady.ai career solutions.
          </p>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <span className="tag tag-primary mb-4">Core Pillars</span>
            <h2 className="mb-4">
              Our <span className="text-highlight">Three Pillars</span>
            </h2>
            <p className="lead max-w-2xl mx-auto">
              Integrated solutions sharing playbooks, tokens, and governance for consistent delivery.
            </p>
          </div>
          
          <div className="grid grid-3 gap-8">
            {pillars.map((pillar, index) => (
              <div key={pillar.name} className="fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <PillarCard
                  title={pillar.name}
                  description={pillar.description}
                  status={pillar.status}
                  phase={pillar.phase}
                  accent={pillar.accent}
                  url={pillar.url}
                  icon={getPillarInitial(pillar.name)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-12">
            <span className="tag tag-primary mb-4">Service Areas</span>
            <h2 className="mb-4">
              How We <span className="text-highlight">Deliver</span>
            </h2>
            <p className="lead max-w-2xl mx-auto">
              Consistent consulting tracks from strategy to implementation.
            </p>
          </div>
          
          <div className="grid grid-3 gap-8">
            {focusPillars.map((pillar, index) => (
              <div 
                key={pillar.title} 
                className="card fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <h3 className="text-lg font-semibold mb-4">{pillar.title}</h3>
                <p className="text-secondary text-sm mb-6 leading-relaxed">{pillar.content}</p>
                <div className="flex flex-wrap gap-2">
                  {pillar.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capability Tracks */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <span className="tag tag-primary mb-4">Our Approach</span>
            <h2 className="mb-4">
              Capability <span className="text-highlight">Tracks</span>
            </h2>
            <p className="lead max-w-2xl mx-auto">
              Structured methodologies for digital transformation.
            </p>
          </div>
          
          <div className="grid grid-3 gap-8">
            <div className="card text-center fade-in-up">
              <div className="icon-box icon-box-blue icon-box-lg mx-auto mb-4">S</div>
              <h3 className="text-lg font-semibold mb-4">Strategy & Planning</h3>
              <ul className="text-left space-y-2 text-secondary text-sm">
                <li className="flex items-start">
                  <span className="list-dot flex-shrink-0 mt-1.5 mr-2"></span>
                  Executive workshops and vision alignment
                </li>
                <li className="flex items-start">
                  <span className="list-dot flex-shrink-0 mt-1.5 mr-2"></span>
                  Service blueprint development
                </li>
                <li className="flex items-start">
                  <span className="list-dot flex-shrink-0 mt-1.5 mr-2"></span>
                  Accessibility and multilingual planning
                </li>
              </ul>
            </div>
            
            <div className="card text-center fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="icon-box icon-box-teal icon-box-lg mx-auto mb-4">A</div>
              <h3 className="text-lg font-semibold mb-4">AI Implementation</h3>
              <ul className="text-left space-y-2 text-secondary text-sm">
                <li className="flex items-start">
                  <span className="list-dot flex-shrink-0 mt-1.5 mr-2" style={{ backgroundColor: 'var(--accent-500)' }}></span>
                  Use-case mining and validation
                </li>
                <li className="flex items-start">
                  <span className="list-dot flex-shrink-0 mt-1.5 mr-2" style={{ backgroundColor: 'var(--accent-500)' }}></span>
                  GenAI, ASR, and computer vision integration
                </li>
                <li className="flex items-start">
                  <span className="list-dot flex-shrink-0 mt-1.5 mr-2" style={{ backgroundColor: 'var(--accent-500)' }}></span>
                  Responsible AI assessments
                </li>
              </ul>
            </div>
            
            <div className="card text-center fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="icon-box icon-box-gray icon-box-lg mx-auto mb-4">O</div>
              <h3 className="text-lg font-semibold mb-4">Operations & Scale</h3>
              <ul className="text-left space-y-2 text-secondary text-sm">
                <li className="flex items-start">
                  <span className="list-dot flex-shrink-0 mt-1.5 mr-2" style={{ backgroundColor: 'var(--gray-500)' }}></span>
                  Community and academy playbooks
                </li>
                <li className="flex items-start">
                  <span className="list-dot flex-shrink-0 mt-1.5 mr-2" style={{ backgroundColor: 'var(--gray-500)' }}></span>
                  Site reliability and performance
                </li>
                <li className="flex items-start">
                  <span className="list-dot flex-shrink-0 mt-1.5 mr-2" style={{ backgroundColor: 'var(--gray-500)' }}></span>
                  Data observability and feedback loops
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gray-900">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-white mb-4">
              Ready to Transform with AI Solutions?
            </h2>
            <p className="text-gray-400 mb-8">
              Let&apos;s discuss how our integrated approach can accelerate your digital transformation.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a 
                href="mailto:hello@arwinaisolutions.com" 
                className="btn btn-accent"
              >
                Schedule Consultation
              </a>
              <a 
                href="/work" 
                className="btn btn-outline-light"
              >
                View Case Studies
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getPillarInitial(name: string): string {
  if (name === 'WTAI') return 'W';
  if (name === 'Maya Design System') return 'M';
  if (name === 'JobReady.ai') return 'J';
  return name[0];
}