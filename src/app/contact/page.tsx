import { companyInfo } from "@/lib/content";
import ConnectHub from "@/components/ConnectHub";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arwin Connect",
  description:
    "Get in touch with Arwin Group. Send a message, start a project, explore partnerships, or join our team — all from one place.",
};

type Intent = "message" | "project" | "partnership" | "careers";
const VALID_INTENTS: Intent[] = ["message", "project", "partnership", "careers"];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const params = await searchParams;
  const defaultIntent = VALID_INTENTS.includes(params.intent as Intent)
    ? (params.intent as Intent)
    : undefined;

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center max-w-screen-lg mx-auto">
            <div className="badge mb-md">Arwin Connect</div>
            <h1 className="hero-title">Let&apos;s Build Something Together</h1>
            <p className="hero-subtitle mx-auto">
              One place for every conversation — whether you&apos;re starting a project,
              exploring a partnership, or just saying hello.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Contact Row */}
      <section className="section-sm">
        <div className="container">
          <div className="grid grid-3" style={{ maxWidth: "900px", margin: "0 auto" }}>
            <a
              href={`tel:${companyInfo.phone.replace(/\s/g, "")}`}
              className="connect-quick-card"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{companyInfo.phone}</span>
            </a>
            <a
              href={`mailto:${companyInfo.email.official}`}
              className="connect-quick-card"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span style={{ wordBreak: "break-word" }}>{companyInfo.email.official}</span>
            </a>
            <div className="connect-quick-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{companyInfo.city}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Connect Hub — The Universal Form */}
      <section className="section">
        <div className="container">
          <div className="max-w-screen-lg mx-auto">
            <ConnectHub defaultIntent={defaultIntent} />
          </div>
        </div>
      </section>

      {/* Office & Team */}
      <section className="section" style={{ background: "var(--color-background-alt)" }}>
        <div className="container">
          <div className="max-w-screen-md mx-auto">
            {/* Address */}
            <div
              className="card text-center"
              style={{ marginBottom: "var(--space-xl)" }}
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

            {/* Department contacts */}
            <div className="grid grid-2">
              <div className="card">
                <h4 style={{ marginBottom: "var(--space-sm)" }}>HR & Careers</h4>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-sm)" }}>
                  For recruitment and career inquiries.
                </p>
                <a
                  href={`mailto:${companyInfo.email.hr}`}
                  style={{
                    color: "var(--color-primary)",
                    fontWeight: 600,
                    wordBreak: "break-word",
                  }}
                >
                  {companyInfo.email.hr}
                </a>
              </div>

              <div className="card">
                <h4 style={{ marginBottom: "var(--space-sm)" }}>Leadership</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: 0, fontSize: "0.9375rem" }}>
                    <strong>Founder:</strong> {companyInfo.founders.founder}
                  </p>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: 0, fontSize: "0.9375rem" }}>
                    <strong>CEO:</strong> {companyInfo.founders.ceo}
                  </p>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: 0, fontSize: "0.9375rem" }}>
                    <strong>COO:</strong> {companyInfo.founders.coo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
