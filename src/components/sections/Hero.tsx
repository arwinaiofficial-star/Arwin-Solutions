'use client';

import Link from 'next/link';
import { heroStats } from '@/lib/content';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <span className="tag tag-primary">AI-First Digital Transformation</span>
          </div>
          
          <h1 className="mb-6">
            Transforming Government, Education & Enterprise with{' '}
            <span className="text-highlight">AI Solutions</span>
          </h1>
          
          <p className="lead mb-8 max-w-2xl mx-auto">
            Since 2011, we have delivered 26+ AI-powered digital transformations across India. 
            Now rebranded as Arwin AI Solutions, we are building the future with WTAI, 
            Maya Design System, and JobReady.ai.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <Link href="/work" className="btn btn-primary">
              View Our Work
            </Link>
            <Link href="/solutions" className="btn btn-secondary">
              Explore Solutions
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-4 gap-6">
            {heroStats.map((stat) => (
              <div key={stat.label} className="stat">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
