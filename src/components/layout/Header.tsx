'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'About', href: '/about' },
  { name: 'Solutions', href: '/solutions' },
  { name: 'Work', href: '/work' },
  { name: 'Insights', href: '/insights' },
  { name: 'Projects', href: '/projects' },
];

const quickLinks = [
  { name: 'JobReady.ai', href: '/jobready' },
  { name: 'Maya Design System', href: '/solutions/maya' },
  { name: 'WTAI Community', href: '/solutions/wtai' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-banner">
        <div className="container header-banner__inner">
          <span>AI-native transformation partner since 2011 · 100+ organizations</span>
          <div className="header-banner__actions">
            <a href="mailto:hello@arwinaisolutions.com" className="header-banner__link">
              hello@arwinaisolutions.com
            </a>
            <Link href="/work" className="header-banner__link">
              See results →
            </Link>
          </div>
        </div>
      </div>
      <div className="container header-main">
        <Link href="/" className="header-brand">
          <Image
            src="/arwin_logo.jpeg"
            alt="Arwin AI Solutions"
            width={44}
            height={44}
            className="rounded-lg header-logo"
          />
          <div className="header-brand__copy">
            <span className="logo">Arwin AI Solutions</span>
            <span className="header-tagline">Practical AI · Maya Design Ops</span>
          </div>
        </Link>

        <nav className="header-nav hidden md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="header-actions hidden md:flex">
          <Link href="/work" className="btn btn-secondary btn-sm">
            Our impact
          </Link>
          <a href="mailto:hello@arwinaisolutions.com" className="btn btn-primary btn-sm">
            Talk to us
          </a>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden header-menu"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div className="header-quicklinks">
        <div className="container header-quicklinks__inner">
          <span className="header-quicklinks__label">Key offerings</span>
          <div className="header-quicklinks__links">
            {quickLinks.map((link) => (
              <Link key={link.name} href={link.href} className="header-link-pill">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="header-mobile md:hidden">
          <div className="header-mobile__section">
            <p className="header-mobile__label">Navigate</p>
            <div className="flex flex-col">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="header-mobile__section">
            <p className="header-mobile__label">Key offerings</p>
            <div className="flex flex-col gap-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="header-mobile__link"
                  onClick={closeMobileMenu}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="header-mobile__section">
            <p className="header-mobile__label">Connect</p>
            <div className="flex flex-col gap-3">
              <a href="mailto:hello@arwinaisolutions.com" className="btn btn-primary w-full" onClick={closeMobileMenu}>
                Talk to us
              </a>
              <Link href="/work" className="btn btn-secondary w-full" onClick={closeMobileMenu}>
                See our work
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
