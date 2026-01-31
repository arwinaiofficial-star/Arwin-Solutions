'use client';

import Link from 'next/link';
import { pillars } from '@/lib/content';

export default function Pillars() {
  return (
    <section className="section">
      <div className="container">
        <div className="text-center mb-12">
          <span className="tag tag-primary mb-4">Our Core Pillars</span>
          <h2 className="mb-4">
            Three Pillars, One <span className="text-highlight">Delivery Rhythm</span>
          </h2>
          <p className="lead max-w-2xl mx-auto">
            Services, Maya Design System, and JobReady.ai share playbooks, tokens, and governance 
            so new launches inherit consistent craft and data foundations.
          </p>
        </div>

        <div className="grid grid-3 gap-6">
          {pillars.map((pillar) => (
            <div key={pillar.name} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm ${getPillarColor(pillar.name)}`}>
                  {getPillarInitial(pillar.name)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{pillar.name}</h3>
                  <span className="text-xs text-secondary">{pillar.phase}</span>
                </div>
              </div>
              <p className="text-secondary text-sm mb-4 leading-relaxed">
                {pillar.description}
              </p>
              <div className="flex items-center justify-between">
                <span className={`tag ${getStatusTagClass(pillar.status)}`}>
                  {pillar.status}
                </span>
                <Link 
                  href={pillar.url} 
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Learn more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function getPillarInitial(name: string): string {
  if (name === 'WTAI') return 'W';
  if (name === 'Maya Design System') return 'M';
  if (name === 'JobReady.ai') return 'J';
  return name[0];
}

function getPillarColor(name: string): string {
  if (name === 'WTAI') return 'bg-blue-600';
  if (name === 'Maya Design System') return 'bg-emerald-600';
  if (name === 'JobReady.ai') return 'bg-violet-600';
  return 'bg-gray-600';
}

function getStatusTagClass(status: string): string {
  if (status.toLowerCase().includes('active') || status.toLowerCase().includes('live')) {
    return 'tag-success';
  }
  if (status.toLowerCase().includes('beta') || status.toLowerCase().includes('progress')) {
    return 'tag-warning';
  }
  return '';
}
