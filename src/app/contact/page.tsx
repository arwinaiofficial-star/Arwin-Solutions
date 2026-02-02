import Link from "next/link";
import { contactInfo, teamMembers } from "@/lib/content";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section-lg section-alt">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="tag tag-primary mb-6">Get in Touch</span>
            <h1 className="mb-6">
              Let&rsquo;s Build Something<br />
              <span className="text-highlight">Amazing Together</span>
            </h1>
            <p className="lead mb-8">
              Whether you&rsquo;re looking to transform your organization with AI, discuss a new project, or explore partnership opportunities, we&rsquo;re here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="section">
        <div className="container">
          <div className="grid grid-3 gap-6">
            {/* Address */}
            <div className="card" style={{ padding: '2rem' }}>
              <div className="icon-box icon-box-blue mb-4">📍</div>
              <h3 className="text-lg font-semibold mb-3">Our Office</h3>
              <p className="text-secondary text-sm leading-relaxed mb-3">
                {contactInfo.address}
              </p>
              <p className="text-sm font-medium text-accent">{contactInfo.city}</p>
            </div>

            {/* Phone */}
            <div className="card" style={{ padding: '2rem' }}>
              <div className="icon-box icon-box-teal mb-4">📞</div>
              <h3 className="text-lg font-semibold mb-3">Call Us</h3>
              <a 
                href={`tel:${contactInfo.phone}`}
                className="text-secondary hover:text-accent text-sm leading-relaxed block mb-3"
              >
                {contactInfo.phone}
              </a>
              <p className="text-xs text-tertiary">Mon - Fri: 9:00 AM - 6:00 PM IST</p>
            </div>

            {/* Email */}
            <div className="card" style={{ padding: '2rem' }}>
              <div className="icon-box icon-box-gray mb-4">✉️</div>
              <h3 className="text-lg font-semibold mb-3">Email Us</h3>
              <div className="space-y-2">
                <a 
                  href={`mailto:${contactInfo.generalEmail}`}
                  className="text-secondary hover:text-accent text-sm block"
                >
                  {contactInfo.generalEmail}
                </a>
                <a 
                  href={`mailto:${contactInfo.hrEmail}`}
                  className="text-secondary hover:text-accent text-sm block"
                >
                  {contactInfo.hrEmail}
                </a>
                <a 
                  href={`mailto:${contactInfo.officialEmail}`}
                  className="text-secondary hover:text-accent text-sm block"
                >
                  {contactInfo.officialEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-8">
            <span className="tag tag-primary mb-4">Location</span>
            <h2 className="mb-4">Visit Our Office</h2>
            <p className="lead max-w-2xl mx-auto">
              Located in the heart of Hyderabad&rsquo;s technology corridor.
            </p>
          </div>

          <div className="card overflow-hidden" style={{ padding: 0, height: '450px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3803.8167234567!2d78.5644444!3d17.5789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDM0JzQ0LjAiTiA3OMKwMzMnNTIuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Team Contacts */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <span className="tag tag-primary mb-4">Leadership</span>
            <h2 className="mb-4">Connect With Our Team</h2>
            <p className="lead max-w-2xl mx-auto">
              Our leadership team is always available to discuss your needs.
            </p>
          </div>

          <div className="grid grid-3 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="card text-center" style={{ padding: '2rem' }}>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-600">
                  {getInitials(member.name)}
                </div>
                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                <p className="text-sm text-accent font-medium mb-3">{member.role}</p>
                <p className="text-secondary text-sm leading-relaxed mb-4">{member.bio}</p>
                <a 
                  href={`mailto:${contactInfo.generalEmail}?subject=Inquiry for ${member.name}`}
                  className="btn btn-sm btn-secondary"
                >
                  Contact {member.name.split(' ')[0]}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gray-900">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-white mb-4">Ready to Start Your Project?</h2>
            <p className="text-gray-400 mb-8">
              Fill out our enquiry form and let&rsquo;s discuss how we can help transform your organization with AI-powered solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/enquiry" className="btn btn-accent">
                Submit Enquiry
              </Link>
              <Link href="/about" className="btn btn-outline-light">
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
}
