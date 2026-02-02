import Link from "next/link";
import { companyInfo } from "@/lib/content";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-section">
            <h3>Arwin AI Solutions</h3>
            <p style={{ color: "var(--color-gray-400)", lineHeight: 1.6 }}>
              Solving real-life problems with AI-enabled solutions since 2011.
            </p>
            <p style={{ color: "var(--color-gray-400)", marginTop: "var(--space-md)" }}>
              <strong>Phone:</strong> {companyInfo.phone}
              <br />
              <strong>Email:</strong>{" "}
              <a href={`mailto:${companyInfo.email.official}`}>
                {companyInfo.email.official}
              </a>
            </p>
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
            <address style={{ color: "var(--color-gray-400)", fontStyle: "normal", lineHeight: 1.6 }}>
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
