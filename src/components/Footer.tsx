import Image from "next/image";
import Link from "next/link";
import { companyInfo } from "@/lib/content";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const sanitizedPhone = companyInfo.phone.replace(/\s+/g, "");

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-section">
            <Link href="/" className="footer-logo" aria-label="Arwin AI Solutions home">
              <Image
                src="/arwin_logo.jpeg"
                alt="ArwinAI logo"
                width={56}
                height={56}
                className="footer-logo-mark"
              />
              <div className="footer-logo-copy">
                <span className="footer-logo-title">Arwin AI Solutions</span>
                <span className="footer-logo-tagline">AI-powered digital transformation</span>
              </div>
            </Link>
            <p className="footer-highlight">
              Solving real-life problems with AI-enabled solutions since 2011.
            </p>
            <div className="footer-contact">
              <a href={`tel:${sanitizedPhone}`} className="footer-contact-item">
                <strong>Phone:</strong> {companyInfo.phone}
              </a>
              <a href={`mailto:${companyInfo.email.official}`} className="footer-contact-item">
                <strong>Email:</strong> {companyInfo.email.official}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/work">Our Work</Link>
              </li>
              <li>
                <Link href="/jobready">JobReady.ai</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/enquiry">Enquiry</Link>
              </li>
            </ul>
          </div>

          {/* Our Pillars */}
          <div className="footer-section">
            <h3>Our Pillars</h3>
            <ul className="footer-links">
              <li>
                <a href="https://wtai.in/" target="_blank" rel="noopener noreferrer">
                  WTAI - AI Learning Platform ↗
                </a>
              </li>
              <li>
                <a href="https://wtai.in/design-system/" target="_blank" rel="noopener noreferrer">
                  Maya Design System ↗
                </a>
              </li>
              <li>
                <Link href="/jobready">JobReady.ai</Link>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div className="footer-section">
            <h3>Location</h3>
            <address className="footer-address">
              {companyInfo.address}
              <br />
              <br />
              <strong>HR Email:</strong>{" "}
              <a href={`mailto:${companyInfo.email.hr}`}>
                {companyInfo.email.hr}
              </a>
            </address>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {currentYear} Arwin AI Solutions. All rights reserved. | Founded in {companyInfo.founded}
          </p>
        </div>
      </div>
    </footer>
  );
}
