import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import NavigationMenu from "@/components/NavigationMenu";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap", // Improves font loading performance
});

export const metadata: Metadata = {
  title: {
    default: "AgentPome - Cybersecurity | Penetration Testing & SOC Services",
    template: "%s | AgentPome",
  },
  description: "A CyberSecurity startup specializing in penetration testing, SIEM implementation, and SOC services. Protect your business before it's too late. Expert security assessments and monitoring solutions.",
  keywords: [
    "AgentPome",
    "cybersecurity",
    "startup",
    "penetration testing",
    "pen testing",
    "SIEM",
    "SOC",
    "security operations center",
    "vulnerability assessment",
    "ethical hacking",
    "security monitoring",
    "threat detection",
    "incident response",
    "security consulting",
    "network security",
    "web application security",
    "cyber threats",
    "security audit",
    "compliance testing",
    "information security"
  ],
  authors: [{ name: "AgentPome Team" }],
  creator: "AgentPome",
  publisher: "AgentPome",
  category: "Technology",
  classification: "Cybersecurity Services",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://agentpome.com",
    siteName: "AgentPome",
    title: "AgentPome - Cybersecurity | Penetration Testing & SOC Services",
    description: "A CyberSecurity startup specializing in penetration testing, SIEM implementation, and SOC services. Protect your business before it's too late.",
    images: [
      {
        url: "https://agentpome.com/bP_Right.png",
        width: 150,
        height: 150,
        alt: "AgentPome - A Cybersecurity Startup",
      },
      {
        url: "https://agentpome.com/og-image.png", // Add a larger OG image
        width: 1200,
        height: 630,
        alt: "AgentPome Cybersecurity Services - Penetration Testing & SOC",
      },
    ],
  },

  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
    // other: "your-other-verification-code",
  },
  alternates: {
    canonical: "https://agentpome.com",
    languages: {
      "en-US": "https://agentpome.com",
      // Add other language versions if available
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml", sizes: "any" }, // SVG
      { url: "/favicon.ico?v=2", type: "image/x-icon" },                         // ICO
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
        color: "#000000", // Adjust to match your brand color
      },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    contact: "https://agentpome.com/contact",
    "theme-color": "#1d1d1d", // Matches your background color
    "msapplication-TileColor": "#1d1d1d",
    "msapplication-config": "/browserconfig.xml",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AgentPome",
              description: "A CyberSecurity startup specializing in penetration testing, SIEM implementation, and SOC services.",
              url: "https://agentpome.com",
              logo: "https://agentpome.com/bP_Right.png",
              contactPoint: {
                "@type": "ContactPoint",
                url: "https://agentpome.com/contact",
                contactType: "sales",
              },
              sameAs: [
                // Add your social media profiles
                "https://linkedin.com/company/agentpome",
              ],
              foundingDate: "2024", // Adjust as needed
              industry: "Cybersecurity",
              knowsAbout: [
                "Penetration Testing",
                "SIEM Implementation",
                "SOC Services",
                "Vulnerability Assessment",
                "Cybersecurity Consulting"
              ],
            }),
          }}
        />
      </head>
      <body className={`${publicSans.variable} antialiased`}>
        <Navbar />
        <main className="flex flex-col min-h-screen bg-[#1d1d1d] text-white">
          {children}
        </main>
        <NavigationMenu />
      </body>
    </html>
  );
}