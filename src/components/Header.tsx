"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ForgeIcon,
  FinLensIcon,
  BuiltIQIcon,
  CommunityIcon,
  JobReadyIcon,
  DesignSystemIcon,
  ArrowRightIcon,
} from "@/components/icons/SiteIcons";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeAll = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-container">
          {/* Logo */}
          <Link href="/" className="logo" aria-label="Arwin Group home">
            <img
              src="/arwin_logo_only.svg"
              alt="Arwin Group"
              className="logo-mark"
            />
            <div className="logo-copy">
              <span className="logo-text">Arwin Group</span>
              <span className="logo-tagline">Technology &amp; Intelligence</span>
            </div>
          </Link>

          {/* Mobile toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setOpenDropdown(null); }}
            aria-label="Toggle mobile menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          {/* Navigation */}
          <nav className={`nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
            <Link href="/" className="nav-link" onClick={closeAll}>
              Home
            </Link>
            <Link href="/about" className="nav-link" onClick={closeAll}>
              About
            </Link>

            {/* Solutions Dropdown */}
            <div className={`nav-dropdown ${openDropdown === "solutions" ? "dropdown-open" : ""}`}>
              <button
                className="nav-dropdown-trigger"
                onClick={() => toggleDropdown("solutions")}
                type="button"
              >
                Solutions <span className="dropdown-arrow">&#9662;</span>
              </button>
              <div className="nav-dropdown-menu">
                <Link href="/work" className="dropdown-item" onClick={closeAll}>
                  <div className="dropdown-item-header">
                    <span className="dropdown-icon" style={{ background: "rgba(37, 99, 235, 0.1)" }}>
                      <ForgeIcon size={16} color="var(--color-primary-light)" />
                    </span>
                    <div>
                      <strong>Arwin Forge</strong>
                      <span>AI-Powered Digital Solutions</span>
                    </div>
                  </div>
                </Link>
                <Link href="/finlens" className="dropdown-item" onClick={closeAll}>
                  <div className="dropdown-item-header">
                    <span className="dropdown-icon" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                      <FinLensIcon size={16} color="var(--color-success)" />
                    </span>
                    <div>
                      <strong>FinLens</strong>
                      <span>Financial Tools &amp; Education</span>
                    </div>
                  </div>
                </Link>
                <Link href="/builtiq" className="dropdown-item" onClick={closeAll}>
                  <div className="dropdown-item-header">
                    <span className="dropdown-icon" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
                      <BuiltIQIcon size={16} color="#f59e0b" />
                    </span>
                    <div>
                      <strong>BuiltIQ</strong>
                      <span>Construction &amp; BIM Intelligence</span>
                    </div>
                  </div>
                </Link>
                <a href="https://wtai.in/" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                  <div className="dropdown-item-header">
                    <span className="dropdown-icon" style={{ background: "rgba(124, 58, 237, 0.1)" }}>
                      <CommunityIcon size={16} color="var(--color-accent-light)" />
                    </span>
                    <div>
                      <strong>WTAI</strong>
                      <span>AI Community Platform</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Products Dropdown */}
            <div className={`nav-dropdown ${openDropdown === "products" ? "dropdown-open" : ""}`}>
              <button
                className="nav-dropdown-trigger"
                onClick={() => toggleDropdown("products")}
                type="button"
              >
                Products <span className="dropdown-arrow">&#9662;</span>
              </button>
              <div className="nav-dropdown-menu">
                <Link href="/jobready" className="dropdown-item" onClick={closeAll}>
                  <div className="dropdown-item-header">
                    <span className="dropdown-icon" style={{ background: "rgba(37, 99, 235, 0.1)" }}>
                      <JobReadyIcon size={16} color="var(--color-primary-light)" />
                    </span>
                    <div>
                      <strong>JobReady</strong>
                      <span>AI Career Platform</span>
                    </div>
                  </div>
                </Link>
                <a href="https://wtai.in/design-system/" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                  <div className="dropdown-item-header">
                    <span className="dropdown-icon" style={{ background: "rgba(124, 58, 237, 0.1)" }}>
                      <DesignSystemIcon size={16} color="var(--color-accent-light)" />
                    </span>
                    <div>
                      <strong>Maya Design System</strong>
                      <span>Token-driven Design System</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <Link href="/contact" className="nav-link" onClick={closeAll}>
              Contact
            </Link>
            <Link href="/contact?intent=project" className="btn btn-primary" onClick={closeAll}>
              Get Started
              <ArrowRightIcon size={14} />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
