import { companyInfo } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Arwin AI Solutions. We're here to help transform your business with AI-powered digital solutions.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center max-w-screen-lg mx-auto">
            {/* <div className="badge mb-md">Contact Us</div> */}
            <h1 className="hero-title">Let's Start a Conversation</h1>
            <p className="hero-subtitle mx-auto">
              Have a project in mind? Want to learn more about our AI-powered solutions? We're here
              to help transform your business.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="section">
        <div className="container">
          <div className="grid grid-3 mb-xl">
            {/* Phone */}
            <div className="card text-center">
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto var(--space-md)",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3 style={{ marginBottom: "var(--space-xs)" }}>Phone</h3>
              <a
                href={`tel:${companyInfo.phone.replace(/\s/g, "")}`}
                style={{ color: "var(--color-text-muted)", fontSize: "1.125rem" }}
              >
                {companyInfo.phone}
              </a>
            </div>

            {/* Email */}
            <div className="card text-center">
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto var(--space-md)",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 style={{ marginBottom: "var(--space-xs)" }}>Email</h3>
              <a
                href={`mailto:${companyInfo.email.official}`}
                style={{ color: "var(--color-text-muted)", fontSize: "1.125rem", wordBreak: "break-word" }}
              >
                {companyInfo.email.official}
              </a>
            </div>

            {/* Location */}
            <div className="card text-center">
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto var(--space-md)",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 style={{ marginBottom: "var(--space-xs)" }}>Location</h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "1.125rem", marginBottom: 0 }}>
                {companyInfo.city}
              </p>
            </div>
          </div>

          {/* Full Address */}
          <div className="max-w-screen-md mx-auto">
            <div
              className="card text-center"
              style={{
                background: "var(--color-background-alt)",
                border: "none",
              }}
            >
              <h3 style={{ marginBottom: "var(--space-md)" }}>Office Address</h3>
              <address
                style={{
                  fontStyle: "normal",
                  color: "var(--color-text-muted)",
                  fontSize: "1.125rem",
                  lineHeight: 1.8,
                  marginBottom: 0,
                }}
              >
                {companyInfo.address}
              </address>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Contacts */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-xl">
              <h2 className="mb-md">Additional Contacts</h2>
              <p className="text-muted" style={{ fontSize: "1.125rem" }}>
                Reach the right team for your specific needs.
              </p>
            </div>

            <div className="grid grid-2">
              <div className="card">
                <h3 style={{ marginBottom: "var(--space-md)" }}>HR Department</h3>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-sm)" }}>
                  For career opportunities and recruitment inquiries.
                </p>
                <a
                  href={`mailto:${companyInfo.email.hr}`}
                  style={{
                    color: "var(--color-primary)",
                    fontWeight: 600,
                    fontSize: "1.125rem",
                    wordBreak: "break-word",
                  }}
                >
                  {companyInfo.email.hr}
                </a>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: "var(--space-md)" }}>Leadership</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                    <strong>Founder:</strong> {companyInfo.founders.founder}
                  </p>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                    <strong>CEO:</strong> {companyInfo.founders.ceo}
                  </p>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
                    <strong>COO:</strong> {companyInfo.founders.coo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Form */}
      <section className="section">
        <div className="container">
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-xl">
              <h2 className="mb-md">Send Us a Message</h2>
              <p className="text-muted" style={{ fontSize: "1.125rem" }}>
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="card">
              <form style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                <div className="form-group">
                  <label htmlFor="contact-name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    className="form-input"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    className="form-input"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-subject" className="form-label">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="contact-subject"
                    name="subject"
                    className="form-input"
                    placeholder="What's this about?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message" className="form-label">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="form-textarea"
                    placeholder="Tell us more about your project or inquiry..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
