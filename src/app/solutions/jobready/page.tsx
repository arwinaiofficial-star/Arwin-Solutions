import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JobReady.ai - Arwin AI Solutions",
  description: "End-to-end AI platform for job seekers to land their dream roles. Automated job search across multiple platforms with AI-powered matching.",
};

export default function JobReadyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="tag tag-accent text-lg mb-6">JobReady.ai</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-gradient">AI-Powered</span> Job Search
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            End-to-end AI co-pilot for job seekers: resume intelligence, personal branding, 
            interview coaching, and live job search automation across multiple platforms.
          </p>
          <div className="mt-8">
            <a 
              href="/jobready" 
              className="btn btn-primary btn-lg"
            >
              Try JobReady.ai
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Ideation - Phase 1</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                JobReady.ai is our end-to-end AI platform for job seekers to land their dream roles. 
                The platform features:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>Automated job search across LinkedIn, Indeed, Naukri, and more</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>AI-powered resume optimization and personal branding</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>Interview coaching with personalized feedback</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">✓</span>
                  <span>Application tracking and smart follow-ups</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="text-6xl mb-4 text-center">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Career Platform</h3>
              <p className="text-gray-600 text-center">
                End-to-end AI co-pilot for job seekers: resume intelligence, personal branding, 
                interview coaching, and live job search automation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}