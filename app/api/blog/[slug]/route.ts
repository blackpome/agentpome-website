// app/api/blog/[slug]/route.ts
import { NextResponse } from "next/server";

// Same posts array (duplicate for now)
const posts = [
  {
    slug: "zero-trust-architecture",
    title: "Understanding Zero Trust Architecture",
    excerpt: "A beginner-friendly explanation of Zero Trust and why modern security depends on it.",
    content: `# Zero Trust Architecture

Zero Trust means **never trust, always verify**.

## Key Principles
- Continuous verification
- Least privilege access
- Assume breach`,
    ogImage: "/og-default.png",
  },
  {
    slug: "siem-complete-guide",
    title: "How SIEM Works: A Complete Guide",
    excerpt: "Learn what SIEM is, how it works, and why every SOC relies on it.",
    content: `# SIEM Guide

Security Information and Event Management (SIEM) collects logs...`,
    ogImage: "/og-default.png",
  },
  {
    slug: "android-network-monitoring",
    title: "Android Network Monitoring Internals",
    excerpt: "Deep dive into packet capturing, VPN service, and traffic analysis on Android.",
    content: `# Android Network Monitoring

You can capture packets using VPN-based tunneling...`,
    ogImage: "/og-default.png",
  },
  {
    slug: "digital-forensics-basics",
    title: "Digital Forensics Basics",
    excerpt: "Understanding chain of custody, evidence collection, and forensic imaging.",
    content: `# Digital Forensics

Forensics involves identification, preservation, analysis...`,
    ogImage: "/og-default.png",
  },
  {
    slug: "soc-vs-siem",
    title: "SOC vs SIEM - Key Differences",
    excerpt: "SOC is a team, SIEM is a tool. Understand how they work together.",
    content: `# SOC vs SIEM

They are not the same...`,
    ogImage: "/og-default.png",
  },
  {
    slug: "security-automation-python",
    title: "Security Automation Using Python",
    excerpt: "Automate log analysis, alerts, and threat detection using Python scripts.",
    content: `# Security Automation

Python can automate repetitive tasks...`,
    ogImage: "/og-default.png",
  },
];

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json(post);
}
