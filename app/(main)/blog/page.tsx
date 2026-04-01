import type { Metadata } from "next";
import BlogPage from "./blog"; // replace with your actual component
import Script from "next/script";
import Navbar from "@/components/Navbar";
import NavigationMenu from "@/components/NavigationMenu";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Stay updated with AgentPome's take on cybersecurity trends, breach breakdowns, research drops, and tools we love using.",
  keywords: [
    "AgentPome blog",
    "cybersecurity news",
    "infosec insights",
    "ethical hacking blog",
    "SIEM tips",
    "penetration testing writeups",
    "zero-day discussions",
    "SOC insights",
    "cybersecurity breakdowns"
  ],
  openGraph: {
    title: "Blog | AgentPome",
    description:
      "Ideas, stories, breakdowns, and tech tips straight from the AgentPome team. Dive into the world of modern cybersecurity.",
    url: "https://agentpome.com/blog",
    siteName: "AgentPome",
    images: [
      {
        url: "https://agentpome.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgentPome Cybersecurity Blog",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | AgentPome",
    description:
      "Read AgentPome’s latest thoughts on hacking trends, defenses, and how we break stuff (legally).",
    images: ["https://agentpome.com/og-image.png"],
  },
  alternates: {
    canonical: "https://agentpome.com/blog",
    languages: {
      "en-US": "https://agentpome.com/blog",
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
  classification: "Cybersecurity Blog",
};

export default function Blog() {

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
        item: "https://agentpome.com/blog"
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
      <BlogPage />
    </>
  )
}
