import "./globals.css";
import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";

export const viewport: Viewport = {
  colorScheme: "light",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Waqas Qureshi - Portfolio",
    template: "%s | Waqas Qureshi",
  },
  description:
    "Portfolio of Waqas Qureshi - Frontend Developer and Creative Engineer from DG Khan, Pakistan.",
  generator: "Next.js",
  applicationName: "Waqas Qureshi Portfolio",
  referrer: "origin-when-cross-origin",
  keywords: [
    "freelance",
    "developer",
    "freelance developer",
    "frontend",
    "react",
    "frontend developer",
    "frontend engineer",
    "creative",
    "creative developer",
    "creative engineer",
    "tech",
    "pakistan",
    "software",
    "software developer",
    "portfolio",
    "frontend developer portfolio",
    "creative developer portfolio",
    "web developer",
    "next.js developer",
  ],
  authors: [{ name: "Waqas Qureshi" }],
  creator: "Waqas Qureshi",
  publisher: "Waqas Qureshi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Waqas Qureshi Portfolio",
    title: "Waqas Qureshi - Portfolio",
    description: "Portfolio of Waqas Qureshi - Frontend Developer and Creative Engineer from DG Khan, Pakistan.",
    images: [
      {
        url: "https://user-images.githubusercontent.com/84178696/228620835-e3cc5c9b-72fc-4f54-a628-407ef7b650f5.png",
        width: 1200,
        height: 630,
        alt: "Waqas Qureshi Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Waqas Qureshi - Portfolio",
    description: "Portfolio of Waqas Qureshi - Frontend Developer and Creative Engineer from DG Khan, Pakistan.",
    images: [
      "https://user-images.githubusercontent.com/84178696/228620835-e3cc5c9b-72fc-4f54-a628-407ef7b650f5.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  alternates: {
    canonical: siteUrl,
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`scroll-smooth scrollbar-thin scrollbar-track-[#d5cfbe] scrollbar-thumb-[#8b8575]`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
