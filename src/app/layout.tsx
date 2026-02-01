import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Arwin AI Solutions - AI-Powered Digital Transformation",
    template: "%s | Arwin AI Solutions"
  },
  description:
    "Arwin AI Solutions delivers AI-enabled products, domain services, and community programs. Specializing in government, education, and enterprise digital transformation since 2011.",
  keywords: ["AI Solutions", "Digital Transformation", "Government Technology", "Education Technology", "Design System", "JobReady.ai", "WTAI"],
  authors: [{ name: "Arwin AI Solutions" }],
  creator: "Arwin AI Solutions",
  publisher: "Arwin AI Solutions",
  icons: {
    icon: "/icon.png",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Arwin AI Solutions - AI-Powered Digital Transformation",
    description: "Transforming government, education, and enterprise with AI-powered solutions since 2011.",
    url: "https://arwinaisolutions.com",
    siteName: "Arwin AI Solutions",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arwin AI Solutions - AI-Powered Digital Transformation",
    description: "Transforming government, education, and enterprise with AI-powered solutions since 2011.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://arwinaisolutions.com",
  },
};

// Navigation moved to Header component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Header />
          <main className="page-shell">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
