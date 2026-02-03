import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "Arwin AI Solutions - Solving Real-Life Problems with AI",
    template: "%s | Arwin AI Solutions",
  },
  description:
    "Arwin AI Solutions: 14+ years of digital transformation. Specializing in government, education, and enterprise solutions. Now equipped with AI capabilities through WTAI, Maya Design System, and JobReady.ai.",
  keywords: [
    "Arwin AI Solutions",
    "Digital Transformation",
    "AI Solutions",
    "Government Technology",
    "Education Technology",
    "Maya Design System",
    "WTAI",
    "JobReady.ai",
    "Hyderabad",
    "India",
  ],
  authors: [{ name: "Arwin AI Solutions" }],
  creator: "Arwin AI Solutions",
  publisher: "Arwin AI Solutions",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "256x256" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.png",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Arwin AI Solutions - Solving Real-Life Problems with AI",
    description:
      "14+ years of digital transformation across government, education, and enterprise sectors. Now equipped with AI capabilities.",
    url: "https://arwinaisolutions.com",
    siteName: "Arwin AI Solutions",
    locale: "en_US",
    type: "website",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
