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
            <Link href="/" className="footer-logo" aria-label="Arwin Group home">
              <img
                src="/arwin_logo_only.svg"
                alt="Arwin Group logo"
                className="footer-logo-mark"
              />
              <div className="footer-logo-copy">
                <span className="footer-logo-title">Arwin Group</span>
                <span className="footer-logo-tagline">Technology &amp; Intelligence Partner</span>
              </div>
            </Link>
            <p className="footer-highlight">
              15+ years of trust. One ecosystem.
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

          {/* Solutions */}
          <div className="footer-section">
            <h3>Solutions</h3>
            <ul className="footer-links">
              <li><Link href="/work">Arwin Forge</Link></li>
              <li><Link href="/finlens">FinLens</Link></li>
              <li><Link href="/builtiq">BuiltIQ</Link></li>
              <li><a href="https://wtai.in/" target="_blank" rel="noopener noreferrer">WTAI</a></li>
            </ul>

            <h3 style={{ marginTop: "var(--space-lg)" }}>Products</h3>
            <ul className="footer-links">
              <li><Link href="/jobready">JobReady</Link></li>
              <li><a href="https://wtai.in/design-system/" target="_blank" rel="noopener noreferrer">Maya Design System</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Company</h3>
            <ul className="footer-links">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/work">Our Work</Link></li>
              <li><Link href="/contact">Arwin Connect</Link></li>
              <li><Link href="/contact?intent=project">Start a Project</Link></li>
            </ul>
          </div>

          {/* Address */}
          <div className="footer-section">
            <h3>Location</h3>
            <address className="footer-address">
              {companyInfo.address}
              <br /><br />
              <strong>HR:</strong>{" "}
              <a href={`mailto:${companyInfo.email.hr}`}>{companyInfo.email.hr}</a>
            </address>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ marginBottom: 0 }}>
            &copy; {currentYear} Arwin Group. All rights reserved. | Founded in {companyInfo.founded}
          </p>
        </div>
      </div>
    </footer>
  );
}
