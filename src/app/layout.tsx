import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arwin AI Solutions",
  description:
    "Arwin AI Solutions delivers AI-enabled products, domain services, and community programs across India and beyond.",
};

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Projects", href: "/projects/post" },
  { label: "Legacy", href: "/projects/legacy" },
  { label: "Domains", href: "/domains" },
  { label: "JobReady.ai", href: "/jobready" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="page-frame">
          <header className="nav-bar">
            <div className="page-shell nav-inner">
              <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-[var(--page-muted)]">
                <Image
                  src="/arwin_logo.jpeg"
                  alt="Arwin AI Solutions logo"
                  width={40}
                  height={40}
                  className="rounded-lg border border-[var(--page-border)] bg-white p-1"
                />
                <span>Arwin AI Solutions</span>
              </Link>
              <nav className="nav-links">
                {navItems.map((item) => (
                  <Link key={item.label} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <a href="mailto:hello@arwinaisolutions.com" className="btn btn-outline text-sm">
                Contact
              </a>
            </div>
          </header>
          <main className="flex-1">
            <div className="page-shell stack-lg">{children}</div>
          </main>
          <footer className="footer">
            <div className="page-shell flex flex-wrap items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} Arwin AI Solutions. Built with Maya Design System.</p>
              <div className="flex gap-3">
                <a href="https://wtai.in/" target="_blank" rel="noreferrer">
                  WTAI
                </a>
                <a
                  href="https://www.npmjs.com/package/@maya-design-system/design-system"
                  target="_blank"
                  rel="noreferrer"
                >
                  Maya Design System
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
