import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enquiry",
  description:
    "Start your digital transformation journey with Arwin AI Solutions. Fill out our enquiry form to discuss your project.",
};

export default function EnquiryPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center max-w-screen-lg mx-auto">
            {/* <div className="badge mb-md">Project Enquiry</div> */}
            <h1 className="hero-title">Start Your Digital Transformation</h1>
            <p className="hero-subtitle mx-auto">
              Tell us about your project and let's discuss how our AI-powered solutions can help you
              achieve your goals. We typically respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section className="section">
        <div className="container">
          <div className="max-w-screen-md mx-auto">
            <div className="card">
              <form style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
                {/* Basic Information */}
                <div>
                  <h3 style={{ marginBottom: "var(--space-md)" }}>Basic Information</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                    <div className="form-group">
                      <label htmlFor="full-name" className="form-label">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="full-name"
                        name="fullName"
                        className="form-input"
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-input"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-input"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="organization" className="form-label">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        id="organization"
                        name="organization"
                        className="form-input"
                        placeholder="Your company or institution name"
                        required
                      />
                    </div>
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

                {/* Project Details */}
                <div>
                  <h3 style={{ marginBottom: "var(--space-md)" }}>Project Details</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                    <div className="form-group">
                      <label htmlFor="project-type" className="form-label">
                        Project Type *
                      </label>
                      <select
                        id="project-type"
                        name="projectType"
                        className="form-input"
                        required
                        style={{ cursor: "pointer" }}
                      >
                        <option value="">Select a project type</option>
                        <option value="government">Government Portal/Platform</option>
                        <option value="education">Education Website/Portal</option>
                        <option value="enterprise">Enterprise Solution</option>
                        <option value="ecommerce">E-commerce Platform</option>
                        <option value="healthcare">Healthcare Solution</option>
                        <option value="community">Community Platform</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="budget" className="form-label">
                        Estimated Budget
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        className="form-input"
                        style={{ cursor: "pointer" }}
                      >
                        <option value="">Select budget range</option>
                        <option value="under-5">Under ₹5 Lakhs</option>
                        <option value="5-10">₹5-10 Lakhs</option>
                        <option value="10-25">₹10-25 Lakhs</option>
                        <option value="25-50">₹25-50 Lakhs</option>
                        <option value="above-50">Above ₹50 Lakhs</option>
                        <option value="not-sure">Not Sure Yet</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="timeline" className="form-label">
                        Expected Timeline
                      </label>
                      <select
                        id="timeline"
                        name="timeline"
                        className="form-input"
                        style={{ cursor: "pointer" }}
                      >
                        <option value="">Select timeline</option>
                        <option value="urgent">Urgent (1-2 months)</option>
                        <option value="standard">Standard (3-6 months)</option>
                        <option value="flexible">Flexible (6+ months)</option>
                        <option value="not-decided">Not Decided Yet</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="project-description" className="form-label">
                        Project Description *
                      </label>
                      <textarea
                        id="project-description"
                        name="projectDescription"
                        className="form-textarea"
                        placeholder="Tell us about your project, goals, and challenges you're trying to solve..."
                        required
                        style={{ minHeight: "150px" }}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

                {/* Services Interested In */}
                <div>
                  <h3 style={{ marginBottom: "var(--space-md)" }}>Services Interested In</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                    {[
                      "Web Application Development",
                      "Mobile App Development",
                      "AI Integration & Solutions",
                      "Maya Design System Implementation",
                      "Custom CMS Development",
                      "E-commerce Solutions",
                      "Portal Development",
                      "Legacy System Modernization",
                      "Consulting & Strategy",
                    ].map((service, index) => (
                      <label
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-sm)",
                          padding: "var(--space-xs)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="services"
                          value={service}
                          style={{ cursor: "pointer" }}
                        />
                        <span>{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

                {/* Additional Information */}
                <div className="form-group">
                  <label htmlFor="how-found" className="form-label">
                    How did you hear about us?
                  </label>
                  <input
                    type="text"
                    id="how-found"
                    name="howFound"
                    className="form-input"
                    placeholder="e.g., Search Engine, Referral, Social Media"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="additional-notes" className="form-label">
                    Additional Notes
                  </label>
                  <textarea
                    id="additional-notes"
                    name="additionalNotes"
                    className="form-textarea"
                    placeholder="Any additional information or specific requirements..."
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                  Submit Enquiry
                </button>

                <p style={{ textAlign: "center", color: "var(--color-text-light)", fontSize: "0.875rem" }}>
                  * Required fields. We typically respond within 24 hours.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-xl">
              <h2 className="mb-md">Why Choose Arwin AI Solutions?</h2>
            </div>

            <div className="grid grid-2">
              <div className="card">
                <h4 style={{ marginBottom: "var(--space-sm)" }}>14+ Years of Experience</h4>
                <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                  Proven track record delivering 26+ projects across government, education, and
                  enterprise sectors.
                </p>
              </div>

              <div className="card">
                <h4 style={{ marginBottom: "var(--space-sm)" }}>AI-Powered Solutions</h4>
                <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                  Cutting-edge AI capabilities integrated into every solution for smarter, more
                  competitive results.
                </p>
              </div>

              <div className="card">
                <h4 style={{ marginBottom: "var(--space-sm)" }}>Maya Design System</h4>
                <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                  Built with our robust, modular design system ensuring consistency and quality across
                  all projects.
                </p>
              </div>

              <div className="card">
                <h4 style={{ marginBottom: "var(--space-sm)" }}>Goodwill-First Approach</h4>
                <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                  We focus on solving real problems and creating genuine value, not just maximizing
                  profit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact */}
      <section className="section">
        <div className="container">
          <div
            className="card text-center"
            style={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
              border: "none",
              padding: "var(--space-2xl)",
            }}
          >
            <h2 style={{ color: "white", marginBottom: "var(--space-md)" }}>
              Prefer to Talk Directly?
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "1.125rem",
                maxWidth: "700px",
                margin: "0 auto var(--space-xl)",
              }}
            >
              Feel free to reach out directly via phone or email. We're here to help!
            </p>
            <div className="flex gap-md justify-center">
              <Link
                href="/contact"
                className="btn btn-lg"
                style={{
                  background: "white",
                  color: "var(--color-primary)",
                }}
              >
                View Contact Details
              </Link>
              <a
                href="mailto:arwinai.official@gmail.com"
                className="btn btn-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "2px solid white",
                }}
              >
                Email Us Directly
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
