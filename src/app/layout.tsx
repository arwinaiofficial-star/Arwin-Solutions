import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "Arwin Group — Technology & Intelligence Partner",
    template: "%s | Arwin Group",
  },
  description:
    "Arwin Group: 15+ years of digital transformation. Arwin Forge for enterprise solutions, FinLens for financial clarity, JobReady for AI-powered careers, and Maya Design System — serving government, education, and enterprise sectors.",
  keywords: [
    "Arwin Group",
    "Arwin Forge",
    "FinLens",
    "Digital Transformation",
    "AI Solutions",
    "Government Technology",
    "Education Technology",
    "Maya Design System",
    "WTAI",
    "JobReady",
    "SIP Calculator",
    "EMI Calculator",
    "Hyderabad",
    "India",
  ],
  authors: [{ name: "Arwin Group" }],
  creator: "Arwin Group",
  publisher: "Arwin Group",
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
    title: "Arwin Group — Technology & Intelligence Partner",
    description:
      "15+ years of digital transformation. Arwin Forge, FinLens, JobReady, Maya Design System — serving government, education, and enterprise sectors.",
    url: "https://arwinaisolutions.com",
    siteName: "Arwin Group",
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
