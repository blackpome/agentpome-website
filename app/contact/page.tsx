import type { Metadata } from "next";
import ContactPage from "./contact";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with AgentPome for expert cybersecurity services including penetration testing, SIEM deployment, and SOC operations. Let's build a safer digital future together.",
  keywords: [
    "AgentPome contact",
    "cybersecurity contact",
    "penetration testing contact",
    "SOC contact",
    "SIEM deployment support",
    "contact AgentPome team",
    "cybersecurity partnership",
    "ethical hacking inquiry",
    "security consulting contact"
  ],
  openGraph: {
    title: "Contact | AgentPome",
    description:
      "Have a question or need cybersecurity expertise? Reach out to AgentPome for strategic partnerships, assessments, or security engagement.",
    url: "https://agentpome.com/contact",
    siteName: "AgentPome",
    images: [
      {
        url: "https://agentpome.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact AgentPome - Penetration Testing & SOC Services",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | AgentPome",
    description:
      "Reach out to AgentPome for cutting-edge cybersecurity expertise — from pen testing to SOC implementation.",
    images: ["https://agentpome.com/og-image.png"],
  },
  alternates: {
    canonical: "https://agentpome.com/contact",
    languages: {
      "en-US": "https://agentpome.com/contact",
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

export default function Contact() {

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
        name: "Contact",
        item: "https://agentpome.com/contact"
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
      <ContactPage />
    </>
  )
}
