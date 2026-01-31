import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WTAI Platform - Arwin AI Solutions",
  description: "WhatTheAI (WTAI) - Comprehensive AI learning and resource platform. Building the future of AI education and practical implementation.",
};

export default function WTAIPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="tag tag-accent text-lg mb-6">WTAI Platform</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-gradient">WhatTheAI</span> Learning Platform
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Comprehensive AI learning and resource platform. Building the future of AI education 
            and practical implementation with structured cohorts, resource libraries, and practitioner AMAs.
          </p>
          <div className="mt-8">
            <a 
              href="https://wtai.in/" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-primary btn-lg inline-flex items-center"
            >
              Visit WTAI Platform
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Phase 1 - Live Platform</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                WTAI is our comprehensive AI learning and resource platform built to democratize 
                AI education, labs, and peer collaboration. The platform features:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>Structured learning cohorts with expert mentors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>Comprehensive resource libraries and documentation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>Practitioner AMAs and community discussions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>Hands-on labs and practical implementation guides</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="text-6xl mb-4 text-center">🎓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Community & Learning</h3>
              <p className="text-gray-600 text-center">
                Global hub for AI learning with structured cohorts, resource libraries, 
                and practitioner AMAs powering continuous upskilling.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}