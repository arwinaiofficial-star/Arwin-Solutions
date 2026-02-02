"use client";

import { useState } from "react";
import Link from "next/link";
import { contactInfo } from "@/lib/content";

type FormData = {
  name: string;
  email: string;
  phone: string;
  organization: string;
  projectType: string;
  message: string;
};

type FormErrors = {
  [key in keyof FormData]?: string;
};

export default function EnquiryPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    organization: "",
    projectType: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = "Please enter a valid phone number (at least 10 digits)";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "Organization name is required";
    }

    if (!formData.projectType) {
      newErrors.projectType = "Please select a project type";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please describe your requirements";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Please provide at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Create mailto link with form data
      const subject = encodeURIComponent(
        `Enquiry from ${formData.name} - ${formData.projectType}`
      );
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nOrganization: ${formData.organization}\nProject Type: ${formData.projectType}\n\nMessage:\n${formData.message}`
      );

      // Open mailto link
      window.location.href = `mailto:${contactInfo.generalEmail}?subject=${subject}&body=${body}`;

      // Show success message
      setIsSubmitted(true);

      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          organization: "",
          projectType: "",
          message: "",
        });
        setIsSubmitted(false);
      }, 3000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section-lg section-alt">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="tag tag-primary mb-6">Project Enquiry</span>
            <h1 className="mb-6">
              Tell Us About<br />
              <span className="text-highlight">Your Project</span>
            </h1>
            <p className="lead mb-8">
              Share your vision with us, and we&rsquo;ll help bring it to life with AI-powered solutions tailored to your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="section">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            {isSubmitted ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center text-4xl" aria-hidden="true">
                  ✓
                </div>
                <h2 className="mb-4 text-success" role="status" aria-live="polite">Thank You!</h2>
                <p className="lead mb-6">
                  Your enquiry has been submitted successfully. We&rsquo;ll get back to you within 24-48 hours.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/" className="btn btn-primary">
                    Back to Home
                  </Link>
                  <Link href="/work" className="btn btn-secondary">
                    View Our Work
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem' }}>
                <div className="mb-8">
                  <h2 className="mb-2">Project Details</h2>
                  <p className="text-secondary text-sm">
                    Fill out the form below and our team will reach out to you shortly.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-2">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input ${errors.name ? 'border-error' : ''}`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-error text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold mb-2">
                        Email Address <span className="text-error">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input ${errors.email ? 'border-error' : ''}`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-error text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold mb-2">
                        Phone Number <span className="text-error">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`input ${errors.phone ? 'border-error' : ''}`}
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <p className="text-error text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Organization */}
                  <div>
                    <label htmlFor="organization" className="block text-sm font-semibold mb-2">
                      Organization Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className={`input ${errors.organization ? 'border-error' : ''}`}
                      placeholder="Your Company or Institution"
                    />
                    {errors.organization && (
                      <p className="text-error text-xs mt-1">{errors.organization}</p>
                    )}
                  </div>

                  {/* Project Type */}
                  <div>
                    <label htmlFor="projectType" className="block text-sm font-semibold mb-2">
                      Project Type <span className="text-error">*</span>
                    </label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      className={`input ${errors.projectType ? 'border-error' : ''}`}
                    >
                      <option value="">Select a project type</option>
                      <option value="Government">Government</option>
                      <option value="Education">Education</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.projectType && (
                      <p className="text-error text-xs mt-1">{errors.projectType}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold mb-2">
                      Project Requirements <span className="text-error">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`input ${errors.message ? 'border-error' : ''}`}
                      placeholder="Tell us about your project goals, timeline, and any specific requirements..."
                      rows={6}
                    />
                    {errors.message && (
                      <p className="text-error text-xs mt-1">{errors.message}</p>
                    )}
                    <p className="text-tertiary text-xs mt-1" aria-live="polite">
                      {formData.message.length < 20 
                        ? `${formData.message.length}/20 characters (minimum 20)`
                        : `${formData.message.length} characters`
                      }
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button type="submit" className="btn btn-primary btn-lg btn-full">
                      Submit Enquiry
                    </button>
                    <p className="text-center text-tertiary text-xs mt-3">
                      We typically respond within 24-48 hours
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="section section-alt">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="mb-4">Prefer to Reach Out Directly?</h2>
              <p className="lead">
                You can also contact us via email or phone.
              </p>
            </div>

            <div className="grid grid-3 gap-4">
              <a
                href={`mailto:${contactInfo.generalEmail}`}
                className="card text-center hover:shadow-md transition-shadow"
                style={{ padding: '1.5rem' }}
              >
                <div className="text-2xl mb-2">✉️</div>
                <p className="text-sm font-semibold mb-1">Email</p>
                <p className="text-xs text-secondary">{contactInfo.generalEmail}</p>
              </a>

              <a
                href={`tel:${contactInfo.phone}`}
                className="card text-center hover:shadow-md transition-shadow"
                style={{ padding: '1.5rem' }}
              >
                <div className="text-2xl mb-2">📞</div>
                <p className="text-sm font-semibold mb-1">Call</p>
                <p className="text-xs text-secondary">{contactInfo.phone}</p>
              </a>

              <Link
                href="/contact"
                className="card text-center hover:shadow-md transition-shadow"
                style={{ padding: '1.5rem' }}
              >
                <div className="text-2xl mb-2">📍</div>
                <p className="text-sm font-semibold mb-1">Visit</p>
                <p className="text-xs text-secondary">View Location</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
