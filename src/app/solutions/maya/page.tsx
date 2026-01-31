import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maya Design System - Arwin AI Solutions",
  description: "In-house design system built on modular, token-driven architecture. CSS-first approach for consistent experiences across all projects.",
};

export default function MayaPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="tag tag-accent text-lg mb-6">Design System</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-gradient">Maya Design</span> System
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Modular, token-driven, CSS-first system powering every Arwin AI experience 
            with semantic tokens, ready-to-use components, and theme controls.
          </p>
          <div className="mt-8">
            <a 
              href="https://www.npmjs.com/package/@maya-design-system/design-system" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-primary btn-lg inline-flex items-center"
            >
              View on npm
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">v2.0.0 - npm Package</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our in-house design system built on modular, token-driven architecture. 
                The system provides:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>Semantic tokens for consistent theming</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>Ready-to-use components with variants</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>CSS-first approach with minimal JavaScript</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>Customizable themes and design tokens</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="text-6xl mb-4 text-center">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Design Language</h3>
              <p className="text-gray-600 text-center">
                A modular, token-driven, CSS-first system powering every Arwin AI experience 
                with semantic tokens, ready-to-use components, and theme controls.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}