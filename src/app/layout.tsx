import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | WAYRO AI",
    default: "WAYRO AI — Find Your Way. Make It Happen.",
  },
  description:
    "WAYRO AI is an AI-powered student opportunity platform. Discover internships, hackathons, scholarships, and build the skills to succeed.",
  keywords: ["student opportunities", "internships", "hackathons", "scholarships", "AI career platform"],
  openGraph: {
    title: "WAYRO AI — Find Your Way. Make It Happen.",
    description: "AI-powered student opportunity-to-achievement platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
