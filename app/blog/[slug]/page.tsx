"use client";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { use } from "react";

// ✅ Blog data (server-side)
const posts = [
  {
    slug: "sim-security",
    title: "Understanding SIM Security",
    excerpt: "Why your SIM card is the most critical part of your digital identity and how to protect it.",
    content: `# Your SIM Card Is the Root of Your Digital Identity

Everything important is on your phone:

## What Your Phone Holds

- **Identity** (Aadhar Card, PAN Card)  
- **Banking & Investments**  
- **Your Contacts & Network** (Calls, WhatsApp, LinkedIn, Instagram)  
- **Shopping Accounts** (Amazon, Flipkart, Swiggy, Zepto)

Many people think the common link is **email**.  
Some believe there is no single common factor.  
A few know the answer is the **SIM card** — yet they forget to protect it.

---

## SIM Card = Root Access to Your Digital World

Your SIM card controls:

- OTP authentication  
- Account recovery  
- Banking access  
- Social media resets  
- Identity verification  

If someone gains control of your SIM, they gain control of **you** digitally.

---

## How Cybercriminals Exploit SIM Cards

Attackers use techniques like:

- **Port-out scams**
- **SIM splitting**
- **SIM jacking**
- **SIM swapping**

But forget sophisticated attacks for a moment.

---

## The Real Risk: Mobile Theft

A simple mobile theft can lead to:

- Complete identity compromise  
- Banking & investment fraud  
- Social media takeover  
- Access to your contacts  
- Shopping account abuse  

One device. Total exposure.

---

## The Solution (Takes 2 Minutes)

Enable **SIM Card Lock (SIM PIN)**.

Every mobile device supports this feature.

It adds a critical security layer that prevents unauthorized SIM access — even if your phone is stolen.

---

Protect everything by protecting the one thing that connects it all.

**Take 2 minutes today.**

#Cybersecurity #MobileSecurity #DigitalSafety
`,
    ogImage: "/og-default.png",
  }
];

// ✅ Metadata generation
// export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
//   const { slug } = await props.params;

//   const post = posts.find((p) => p.slug === slug);
//   if (!post) return { title: "Article not found", description: "The requested article does not exist." };

//   return {
//     title: post.title,
//     description: post.excerpt,
//     openGraph: {
//       title: post.title,
//       description: post.excerpt,
//       url: `/blog/${slug}`,
//       images: [post.ogImage || "/og-default.png"],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: post.title,
//       description: post.excerpt,
//       images: [post.ogImage || "/og-default.png"],
//     },
//   };
// }

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = posts.find((p) => p.slug === slug);
  
  if (!post) return notFound();

  return (
  <article className="min-h-screen bg-[#1d1d1d] flex justify-center px-4 sm:px-6 lg:px-8 py-20 pb-72">
    
    <div className="w-full max-w-3xl bg-white text-[#1d1d1d] rounded-2xl shadow-xl p-8 sm:p-12 overflow-y-auto max-h-[60vh] sm:max-h-[70vh] lg:max-h-[75vh]">
      
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-4">
        {post.title}
      </h1>

      {/* Excerpt */}
      <p className="text-gray-600 mb-8 text-base sm:text-lg">
        {post.excerpt}
      </p>

      {/* Divider */}
      <div className="h-px bg-gray-200 mb-8" />

      {/* Content */}
      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {post.content}
        </ReactMarkdown>
      </div>

    </div>

  </article>
  );
}