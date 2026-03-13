"use client";

import { useState, useEffect } from "react";

type Intent = "message" | "project" | "partnership" | "careers";
type FormStatus = "idle" | "submitting" | "success" | "error";

interface ConnectHubProps {
  defaultIntent?: Intent;
}

const intentOptions: {
  id: Intent;
  title: string;
  description: string;
}[] = [
  {
    id: "message",
    title: "Quick Message",
    description: "Say hello, ask a question, or share feedback",
  },
  {
    id: "project",
    title: "Start a Project",
    description: "Tell us about your project requirements",
  },
  {
    id: "partnership",
    title: "Partnership",
    description: "Explore business collaboration",
  },
  {
    id: "careers",
    title: "Careers",
    description: "Join our team or explore opportunities",
  },
];

const projectTypes = [
  { value: "government", label: "Government & Public Sector" },
  { value: "education", label: "Education & Institution" },
  { value: "enterprise", label: "Enterprise & Corporate" },
  { value: "ecommerce", label: "E-commerce & Retail" },
  { value: "healthcare", label: "Healthcare & Medical" },
  { value: "real-estate", label: "Real Estate & Property" },
  { value: "community", label: "Community & Social" },
  { value: "startup", label: "Startup & MVP" },
  { value: "nonprofit", label: "Non-profit & NGO" },
  { value: "custom", label: "Custom" },
];

const budgetRanges = [
  { value: "under-50k", label: "Under ₹50,000" },
  { value: "50k-1L", label: "₹50,000 – ₹1 Lakh" },
  { value: "1-2L", label: "₹1 – ₹2 Lakhs" },
  { value: "2-3L", label: "₹2 – ₹3 Lakhs" },
  { value: "3-5L", label: "₹3 – ₹5 Lakhs" },
  { value: "above-5L", label: "Above ₹5 Lakhs" },
  { value: "not-sure", label: "Not Sure Yet" },
  { value: "custom", label: "Custom" },
];

const timelines = [
  { value: "urgent", label: "Urgent (1–2 months)" },
  { value: "standard", label: "Standard (3–6 months)" },
  { value: "flexible", label: "Flexible (6+ months)" },
  { value: "not-decided", label: "Not Decided Yet" },
  { value: "custom", label: "Custom" },
];

const services = [
  "Website Development",
  "Web Application Development",
  "Mobile App Development",
  "AI Integration & Solutions",
  "Design System Implementation",
  "Custom CMS Development",
  "E-commerce Solutions",
  "Portal Development",
  "Legacy System Modernization",
  "Consulting & Strategy",
];

const partnershipTypes = [
  { value: "technology", label: "Technology Partner" },
  { value: "reseller", label: "Reseller / White-label" },
  { value: "referral", label: "Referral Partner" },
  { value: "strategic", label: "Strategic Alliance" },
  { value: "custom", label: "Custom" },
];

function IntentIcon({ intent, active }: { intent: Intent; active: boolean }) {
  const color = active ? "white" : "var(--color-primary-light)";
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (intent) {
    case "message":
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "project":
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "partnership":
      return (
        <svg {...props}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "careers":
      return (
        <svg {...props}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
  }
}

export default function ConnectHub({ defaultIntent }: ConnectHubProps) {
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(
    defaultIntent || null
  );
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    organization: "",
    projectType: "",
    budget: "",
    timeline: "",
    projectDescription: "",
    services: [] as string[],
    howFound: "",
    partnershipType: "",
    customProjectType: "",
    customBudget: "",
    customTimeline: "",
    customPartnershipType: "",
    position: "",
    portfolio: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const selectIntent = (intent: Intent) => {
    setSelectedIntent(intent);
    setFormStatus("idle");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntent) return;

    setFormStatus("submitting");
    setErrorMessage("");

    const payload: Record<string, unknown> = {
      intent: selectedIntent,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    switch (selectedIntent) {
      case "message":
        payload.subject = formData.subject;
        payload.message = formData.message;
        break;
      case "project":
        payload.organization = formData.organization;
        payload.projectType = formData.projectType;
        if (formData.projectType === "custom") payload.customProjectType = formData.customProjectType;
        payload.budget = formData.budget;
        if (formData.budget === "custom") payload.customBudget = formData.customBudget;
        payload.timeline = formData.timeline;
        if (formData.timeline === "custom") payload.customTimeline = formData.customTimeline;
        payload.projectDescription = formData.projectDescription;
        payload.services = formData.services;
        payload.howFound = formData.howFound;
        break;
      case "partnership":
        payload.organization = formData.organization;
        payload.partnershipType = formData.partnershipType;
        if (formData.partnershipType === "custom") payload.customPartnershipType = formData.customPartnershipType;
        payload.message = formData.message;
        break;
      case "careers":
        payload.position = formData.position;
        payload.portfolio = formData.portfolio;
        payload.message = formData.message;
        break;
    }

    try {
      const response = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setReferenceId(data.referenceId);
      setFormStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setFormStatus("error");
    }
  };

  const resetForm = () => {
    setSelectedIntent(null);
    setFormStatus("idle");
    setErrorMessage("");
    setReferenceId("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      organization: "",
      projectType: "",
      budget: "",
      timeline: "",
      projectDescription: "",
      services: [],
      howFound: "",
      partnershipType: "",
      customProjectType: "",
      customBudget: "",
      customTimeline: "",
      customPartnershipType: "",
      position: "",
      portfolio: "",
    });
  };

  // ── Success State ──
  // (rendered as modal overlay below the form)

  // ── Main Form ──
  return (
    <div className="connect-hub">
      {/* Success Modal */}
      {formStatus === "success" && (
        <SuccessModal referenceId={referenceId} onClose={resetForm} />
      )}

      {/* Intent Selection */}
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h3
          style={{
            textAlign: "center",
            marginBottom: "var(--space-lg)",
            color: "var(--color-text)",
          }}
        >
          How can we help?
        </h3>
        <div className="connect-intent-grid">
          {intentOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`connect-intent-card${selectedIntent === option.id ? " active" : ""}`}
              onClick={() => selectIntent(option.id)}
            >
              <div className="connect-intent-icon">
                <IntentIcon
                  intent={option.id}
                  active={selectedIntent === option.id}
                />
              </div>
              <h4 style={{ marginBottom: "var(--space-2xs)", fontSize: "0.9375rem" }}>
                {option.title}
              </h4>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-light)",
                  marginBottom: 0,
                  lineHeight: 1.4,
                }}
              >
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {selectedIntent && (
        <div className="connect-form-wrapper" key={selectedIntent}>
          <div className="card" style={{ maxWidth: "720px", margin: "0 auto" }}>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              {/* Common Fields */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "var(--space-md)",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="ch-name" className="form-label">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="ch-name"
                    name="name"
                    className="form-input"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="ch-email" className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="ch-email"
                    name="email"
                    className="form-input"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={254}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="ch-phone" className="form-label">
                  Phone
                </label>
                <input
                  type="tel"
                  id="ch-phone"
                  name="phone"
                  className="form-input"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={20}
                />
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--color-border)",
                }}
              />

              {/* Intent-specific fields */}
              {selectedIntent === "message" && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="ch-subject" className="form-label">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="ch-subject"
                      name="subject"
                      className="form-input"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      maxLength={200}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="ch-message" className="form-label">
                      Message *
                    </label>
                    <textarea
                      id="ch-message"
                      name="message"
                      className="form-textarea"
                      placeholder="Tell us what's on your mind..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      maxLength={5000}
                    />
                  </div>
                </>
              )}

              {selectedIntent === "project" && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="ch-org" className="form-label">
                      Organization *
                    </label>
                    <input
                      type="text"
                      id="ch-org"
                      name="organization"
                      className="form-input"
                      placeholder="Your company or institution"
                      value={formData.organization}
                      onChange={handleChange}
                      required
                      maxLength={200}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "var(--space-md)",
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="ch-project-type" className="form-label">
                        Project Type *
                      </label>
                      <select
                        id="ch-project-type"
                        name="projectType"
                        className="form-input"
                        value={formData.projectType}
                        onChange={handleChange}
                        required
                        style={{ cursor: "pointer" }}
                      >
                        <option value="">Select type</option>
                        {projectTypes.map((pt) => (
                          <option key={pt.value} value={pt.value}>
                            {pt.label}
                          </option>
                        ))}
                      </select>
                      {formData.projectType === "custom" && (
                        <input
                          type="text"
                          name="customProjectType"
                          className="form-input"
                          placeholder="Describe your project type"
                          value={formData.customProjectType}
                          onChange={handleChange}
                          required
                          maxLength={200}
                          style={{ marginTop: "var(--space-xs)" }}
                        />
                      )}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="ch-budget" className="form-label">
                        Budget Range
                      </label>
                      <select
                        id="ch-budget"
                        name="budget"
                        className="form-input"
                        value={formData.budget}
                        onChange={handleChange}
                        style={{ cursor: "pointer" }}
                      >
                        <option value="">Select budget</option>
                        {budgetRanges.map((b) => (
                          <option key={b.value} value={b.value}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                      {formData.budget === "custom" && (
                        <input
                          type="text"
                          name="customBudget"
                          className="form-input"
                          placeholder="Enter your budget"
                          value={formData.customBudget}
                          onChange={handleChange}
                          required
                          maxLength={200}
                          style={{ marginTop: "var(--space-xs)" }}
                        />
                      )}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="ch-timeline" className="form-label">
                        Timeline
                      </label>
                      <select
                        id="ch-timeline"
                        name="timeline"
                        className="form-input"
                        value={formData.timeline}
                        onChange={handleChange}
                        style={{ cursor: "pointer" }}
                      >
                        <option value="">Select timeline</option>
                        {timelines.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      {formData.timeline === "custom" && (
                        <input
                          type="text"
                          name="customTimeline"
                          className="form-input"
                          placeholder="Describe your timeline"
                          value={formData.customTimeline}
                          onChange={handleChange}
                          required
                          maxLength={200}
                          style={{ marginTop: "var(--space-xs)" }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label
                      htmlFor="ch-project-desc"
                      className="form-label"
                    >
                      Project Description *
                    </label>
                    <textarea
                      id="ch-project-desc"
                      name="projectDescription"
                      className="form-textarea"
                      placeholder="Tell us about your project, goals, and challenges you're trying to solve..."
                      value={formData.projectDescription}
                      onChange={handleChange}
                      required
                      maxLength={5000}
                      style={{ minHeight: "140px" }}
                    />
                  </div>

                  {/* Services chips */}
                  <div>
                    <p
                      className="form-label"
                      style={{ marginBottom: "var(--space-sm)" }}
                    >
                      Services Interested In
                    </p>
                    <div className="connect-chips">
                      {services.map((service) => (
                        <button
                          key={service}
                          type="button"
                          className={`connect-chip${formData.services.includes(service) ? " active" : ""}`}
                          onClick={() => toggleService(service)}
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="ch-how-found" className="form-label">
                      How did you find us?
                    </label>
                    <input
                      type="text"
                      id="ch-how-found"
                      name="howFound"
                      className="form-input"
                      placeholder="e.g., Google Search, Referral, Social Media"
                      value={formData.howFound}
                      onChange={handleChange}
                      maxLength={200}
                    />
                  </div>
                </>
              )}

              {selectedIntent === "partnership" && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="ch-partner-org" className="form-label">
                      Organization *
                    </label>
                    <input
                      type="text"
                      id="ch-partner-org"
                      name="organization"
                      className="form-input"
                      placeholder="Your company name"
                      value={formData.organization}
                      onChange={handleChange}
                      required
                      maxLength={200}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label
                      htmlFor="ch-partnership-type"
                      className="form-label"
                    >
                      Partnership Type *
                    </label>
                    <select
                      id="ch-partnership-type"
                      name="partnershipType"
                      className="form-input"
                      value={formData.partnershipType}
                      onChange={handleChange}
                      required
                      style={{ cursor: "pointer" }}
                    >
                      <option value="">Select type</option>
                      {partnershipTypes.map((pt) => (
                        <option key={pt.value} value={pt.value}>
                          {pt.label}
                        </option>
                      ))}
                    </select>
                    {formData.partnershipType === "custom" && (
                      <input
                        type="text"
                        name="customPartnershipType"
                        className="form-input"
                        placeholder="Describe the partnership type"
                        value={formData.customPartnershipType}
                        onChange={handleChange}
                        required
                        maxLength={200}
                        style={{ marginTop: "var(--space-xs)" }}
                      />
                    )}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="ch-partner-msg" className="form-label">
                      Tell us about the collaboration *
                    </label>
                    <textarea
                      id="ch-partner-msg"
                      name="message"
                      className="form-textarea"
                      placeholder="What kind of collaboration are you looking for?"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      maxLength={5000}
                      style={{ minHeight: "120px" }}
                    />
                  </div>
                </>
              )}

              {selectedIntent === "careers" && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="ch-position" className="form-label">
                      Position of Interest *
                    </label>
                    <input
                      type="text"
                      id="ch-position"
                      name="position"
                      className="form-input"
                      placeholder="e.g., Frontend Developer, UI/UX Designer"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      maxLength={200}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="ch-portfolio" className="form-label">
                      Portfolio / LinkedIn URL
                    </label>
                    <input
                      type="url"
                      id="ch-portfolio"
                      name="portfolio"
                      className="form-input"
                      placeholder="https://linkedin.com/in/your-profile"
                      value={formData.portfolio}
                      onChange={handleChange}
                      maxLength={500}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="ch-career-msg" className="form-label">
                      Tell us about yourself *
                    </label>
                    <textarea
                      id="ch-career-msg"
                      name="message"
                      className="form-textarea"
                      placeholder="Share your experience, skills, and what excites you about Arwin Group..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      maxLength={5000}
                      style={{ minHeight: "120px" }}
                    />
                  </div>
                </>
              )}

              {/* Error message */}
              {formStatus === "error" && (
                <div
                  style={{
                    padding: "var(--space-sm) var(--space-md)",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-error)",
                    fontSize: "0.875rem",
                  }}
                >
                  {errorMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={formStatus === "submitting"}
                style={{
                  width: "100%",
                  opacity: formStatus === "submitting" ? 0.7 : 1,
                  cursor:
                    formStatus === "submitting" ? "not-allowed" : "pointer",
                }}
              >
                {formStatus === "submitting" ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--space-xs)",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="60"
                        strokeDashoffset="20"
                        strokeLinecap="round"
                      />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  getSubmitLabel(selectedIntent)
                )}
              </button>

              <p
                style={{
                  textAlign: "center",
                  color: "var(--color-text-light)",
                  fontSize: "0.8125rem",
                  marginBottom: 0,
                }}
              >
                We typically respond within 24 hours.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getSubmitLabel(intent: Intent): string {
  switch (intent) {
    case "message":
      return "Send Message";
    case "project":
      return "Submit Project Enquiry";
    case "partnership":
      return "Submit Partnership Enquiry";
    case "careers":
      return "Submit Application";
  }
}

function SuccessModal({
  referenceId,
  onClose,
}: {
  referenceId: string;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div className="connect-modal-overlay" onClick={onClose}>
      <div
        className="connect-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Submission confirmation"
      >
        {/* Close button */}
        <button
          type="button"
          className="connect-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Check icon */}
        <div className="connect-success-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 style={{ marginBottom: "var(--space-xs)", fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}>
          Message Received!
        </h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-lg)", fontSize: "0.9375rem" }}>
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>

        {/* Reference ID */}
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-light)", marginBottom: "var(--space-xs)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            Reference ID
          </p>
          <div className="connect-ref">{referenceId}</div>
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", gap: "var(--space-sm)", marginBottom: "var(--space-xl)", textAlign: "left" }}>
          <div style={{ flex: 1, padding: "var(--space-sm)", background: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--color-primary-light)", fontWeight: 600, marginBottom: "2px" }}>Within 2 Hours</p>
            <p style={{ fontSize: "0.8125rem", marginBottom: 0, lineHeight: 1.4 }}>Acknowledgment from our team</p>
          </div>
          <div style={{ flex: 1, padding: "var(--space-sm)", background: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--color-primary-light)", fontWeight: 600, marginBottom: "2px" }}>Within 24 Hours</p>
            <p style={{ fontSize: "0.8125rem", marginBottom: 0, lineHeight: 1.4 }}>Detailed response or meeting invite</p>
          </div>
        </div>

        <button type="button" className="btn btn-primary" onClick={onClose} style={{ width: "100%" }}>
          Done
        </button>
      </div>
    </div>
  );
}
