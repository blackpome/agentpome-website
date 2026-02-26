import type { Metadata } from "next";
import ServicesPage from "./services"; // or whatever your component is named
import Script from "next/script";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore AgentPome's cybersecurity services — penetration testing, SIEM deployment, and SOC operations. Built for modern security challenges.",
  keywords: [
    "AgentPome services",
    "cybersecurity services",
    "penetration testing",
    "SOC setup",
    "SIEM deployment",
    "security audit",
    "ethical hacking",
    "vulnerability assessment",
    "network security",
    "application security",
    "cyber defense solutions"
  ],
  openGraph: {
    title: "Services | AgentPome",
    description:
      "AgentPome delivers tailored cybersecurity services — from pentesting to real-time monitoring and SOC solutions.",
    url: "https://agentpome.com/services",
    siteName: "AgentPome",
    images: [
      {
        url: "https://agentpome.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgentPome Cybersecurity Services",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | AgentPome",
    description:
      "Discover AgentPome's cybersecurity services — Penetration Testing, SOC, SIEM, and more.",
    images: ["https://agentpome.com/og-image.png"],
  },
  alternates: {
    canonical: "https://agentpome.com/services",
    languages: {
      "en-US": "https://agentpome.com/services",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml", sizes: "any" }, // SVG
      { url: "/favicon.ico?v=2", type: "image/x-icon" },
      { url: "/favicon-96x96.png?v=2", sizes: "96x96", type: "image/png" },
      { url: "/android-chrome-192x192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg?v=2",
        color: "#000000",
      },
    ],
  },
  category: "Technology",
  classification: "Cybersecurity Services",
};

export default function Services() {

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://agentpome.com"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: "https://agentpome.com/services"
      }
    ]
  };

  return (
    <>
    <Script
        id="breadcrumb-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    <ServicesPage />
    </>
  )
}
