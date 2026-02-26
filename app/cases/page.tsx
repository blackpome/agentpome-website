import type { Metadata } from "next";
import CasesPage from "./cases"; // replace with your actual component
import Script from "next/script";

export const metadata: Metadata = {
  title: "Cases",
  description:
    "Explore real-world cybersecurity cases and research by AgentPome. See how we tackle threats, build defenses, and secure digital systems.",
  keywords: [
    "AgentPome case studies",
    "cybersecurity case files",
    "real-world hacks",
    "pentesting examples",
    "cyber incident reports",
    "network breaches",
    "ethical hacking cases",
    "SIEM use cases",
    "SOC operations case study"
  ],
  openGraph: {
    title: "Cases | AgentPome",
    description:
      "Dive into real-world cybersecurity incidents and case studies from AgentPome’s experience — learn how attacks were stopped.",
    url: "https://agentpome.com/cases",
    siteName: "AgentPome",
    images: [
      {
        url: "https://agentpome.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgentPome Cybersecurity Case Studies",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cases | AgentPome",
    description:
      "See how AgentPome handles real threats. Explore cybersecurity incidents, fixes, and lessons.",
    images: ["https://agentpome.com/og-image.png"],
  },
  alternates: {
    canonical: "https://agentpome.com/cases",
    languages: {
      "en-US": "https://agentpome.com/cases",
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
  classification: "Cybersecurity Case Studies",
};

export default function Cases() {
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
        item: "https://agentpome.com/cases"
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
      <CasesPage />
    </>
  )
}
