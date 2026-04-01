"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ChevronRight, ChevronLeft, Check,
  AlertTriangle, ShieldAlert, ShieldCheck, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Question = {
  id: string;
  category: string;
  text: string;
  options: { label: string; score: number }[];
};

type UserInfo = { name: string; phone: string; email: string };
type Answers  = Record<string, number>;

// ─── Questions ─────────────────────────────────────────────────────────────────

const questions: Question[] = [
  // Online Behaviour
  {
    id: "q1", category: "Online Behaviour",
    text: "How often do you click links received on WhatsApp or SMS without checking them?",
    options: [
      { label: "Never — I always verify first", score: 0 },
      { label: "Sometimes, if it looks familiar", score: 2 },
      { label: "Often, especially from contacts", score: 4 },
      { label: "Always — I don't think twice", score: 6 },
    ],
  },
  {
    id: "q2", category: "Online Behaviour",
    text: "Do you share personal details (Aadhaar, PAN, OTP) over phone/WhatsApp when asked?",
    options: [
      { label: "Never", score: 0 },
      { label: "Only with people I trust", score: 2 },
      { label: "Sometimes, if they sound official", score: 4 },
      { label: "Yes, if they ask politely", score: 6 },
    ],
  },
  {
    id: "q3", category: "Online Behaviour",
    text: "How often do you use public WiFi (café, mall, metro) for banking or UPI payments?",
    options: [
      { label: "Never", score: 0 },
      { label: "Rarely", score: 2 },
      { label: "Sometimes", score: 4 },
      { label: "Regularly", score: 6 },
    ],
  },
  // Account Security
  {
    id: "q4", category: "Account Security",
    text: "Do you use the same password across multiple accounts?",
    options: [
      { label: "No — every account has a unique password", score: 0 },
      { label: "A few accounts share passwords", score: 2 },
      { label: "Most accounts use the same password", score: 4 },
      { label: "All my accounts use one password", score: 6 },
    ],
  },
  {
    id: "q5", category: "Account Security",
    text: "Is two-factor authentication enabled on your primary email?",
    options: [
      { label: "Yes, and I use an authenticator app", score: 0 },
      { label: "Yes, via SMS OTP", score: 1 },
      { label: "Not sure", score: 3 },
      { label: "No", score: 6 },
    ],
  },
  {
    id: "q6", category: "Account Security",
    text: "Have you checked if your email/phone has appeared in any data breach?",
    options: [
      { label: "Yes, and I've taken action", score: 0 },
      { label: "Yes, but I didn't do anything", score: 3 },
      { label: "No, but I'm curious", score: 4 },
      { label: "I didn't know this was possible", score: 6 },
    ],
  },
  // Device Security
  {
    id: "q7", category: "Device Security",
    text: "How often do you update your phone's OS and apps?",
    options: [
      { label: "Immediately when available", score: 0 },
      { label: "Within a week", score: 1 },
      { label: "Only when forced to", score: 4 },
      { label: "I avoid updates", score: 6 },
    ],
  },
  {
    id: "q8", category: "Device Security",
    text: "Do you install apps from outside the official Play Store / App Store?",
    options: [
      { label: "Never", score: 0 },
      { label: "Rarely, for specific needs", score: 3 },
      { label: "Often — I find apps on WhatsApp/Telegram", score: 5 },
      { label: "Yes, regularly", score: 6 },
    ],
  },
  {
    id: "q9", category: "Device Security",
    text: "Is your phone screen protected with a strong PIN or biometric lock?",
    options: [
      { label: "Yes, biometric + strong PIN", score: 0 },
      { label: "Yes, PIN only", score: 1 },
      { label: "Swipe pattern (no PIN)", score: 3 },
      { label: "No lock", score: 6 },
    ],
  },
  // Financial Exposure
  {
    id: "q10", category: "Financial Exposure",
    text: "Have you received calls from 'bank officials' asking for account details or OTPs?",
    options: [
      { label: "Yes, and I disconnected immediately", score: 0 },
      { label: "Yes, and I was cautious but stayed on the call", score: 3 },
      { label: "Yes, and I shared some details", score: 5 },
      { label: "Yes, and I shared OTP/card details", score: 6 },
    ],
  },
  {
    id: "q11", category: "Financial Exposure",
    text: "Do you check your bank statements/UPI history regularly?",
    options: [
      { label: "Yes, weekly or more", score: 0 },
      { label: "Monthly", score: 1 },
      { label: "Only when something feels wrong", score: 4 },
      { label: "Rarely or never", score: 6 },
    ],
  },
  {
    id: "q12", category: "Financial Exposure",
    text: "Have you ever sent money via UPI after receiving a 'collect request' without fully understanding it?",
    options: [
      { label: "No — I always verify before accepting", score: 0 },
      { label: "Once, by mistake", score: 3 },
      { label: "A couple of times", score: 5 },
      { label: "I didn't know collect requests could be scams", score: 6 },
    ],
  },
  // Social Media
  {
    id: "q13", category: "Social Media",
    text: "Is your Instagram / Facebook profile set to public?",
    options: [
      { label: "No — fully private", score: 0 },
      { label: "Partially public", score: 2 },
      { label: "Mostly public", score: 4 },
      { label: "Fully public and I post frequently", score: 6 },
    ],
  },
  {
    id: "q14", category: "Social Media",
    text: "Have you posted your phone number, Aadhaar, or address publicly on social media?",
    options: [
      { label: "Never", score: 0 },
      { label: "Once or twice, now deleted", score: 2 },
      { label: "It might still be there", score: 5 },
      { label: "Yes, and I don't see the issue", score: 6 },
    ],
  },
  // Scam Vulnerability
  {
    id: "q15", category: "Scam Vulnerability",
    text: "Have you ever received a prize/lottery message and clicked the link?",
    options: [
      { label: "I always ignore such messages", score: 0 },
      { label: "I looked at it but didn't click", score: 1 },
      { label: "I clicked but didn't fill anything", score: 4 },
      { label: "I clicked and filled in my details", score: 6 },
    ],
  },
  {
    id: "q16", category: "Scam Vulnerability",
    text: "If a 'government officer' calls saying your SIM will be blocked unless you verify Aadhaar — what do you do?",
    options: [
      { label: "Disconnect and report it", score: 0 },
      { label: "Ask for their ID and then disconnect", score: 1 },
      { label: "Panic and listen to what they say", score: 4 },
      { label: "Comply to avoid trouble", score: 6 },
    ],
  },
  {
    id: "q17", category: "Scam Vulnerability",
    text: "Have you or someone close to you lost money to an online scam in the last 2 years?",
    options: [
      { label: "No", score: 0 },
      { label: "Not me, but I know someone who has", score: 2 },
      { label: "I almost did", score: 3 },
      { label: "Yes, I have", score: 6 },
    ],
  },
  {
    id: "q18", category: "Scam Vulnerability",
    text: "Do you know what to do immediately if your UPI or bank account is compromised?",
    options: [
      { label: "Yes — I know the exact steps", score: 0 },
      { label: "Roughly, I'd figure it out", score: 2 },
      { label: "Not really", score: 4 },
      { label: "No idea", score: 6 },
    ],
  },
];

const CATEGORIES = [
  "Online Behaviour", "Account Security", "Device Security",
  "Financial Exposure", "Social Media", "Scam Vulnerability",
];

// ─── Score Helpers ─────────────────────────────────────────────────────────────

/** Map raw 0–108 score to 1–10 risk score (higher = more risk) */
function toScore10(raw: number): number {
  return Math.min(10, Math.max(1, Math.round((raw / 108) * 10)));
}

function catFraction(cat: string, answers: Answers): number {
  const qs = questions.filter((q) => q.category === cat);
  const sum = qs.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
  return sum / (qs.length * 6);
}

/** Derive smart doing-right and risk-area bullets from answers */
function deriveInsights(answers: Answers) {
  const doingRight: string[] = [];
  const riskAreas: string[] = [];
  const actions: string[] = [];

  const g = (id: string) => answers[id] ?? 0;

  // Online behaviour
  if (g("q1") === 0) doingRight.push("Verifies links before clicking");
  else if (g("q1") >= 4) { riskAreas.push("Clicks unverified WhatsApp/SMS links"); actions.push("Stop clicking unverified links — check with sender first"); }

  if (g("q3") === 0) doingRight.push("Avoids public WiFi for payments");
  else if (g("q3") >= 4) { riskAreas.push("Uses public WiFi for UPI/banking"); actions.push("Never make payments on public WiFi — use mobile data"); }

  // Account security
  if (g("q4") === 0) doingRight.push("Unique passwords across all accounts");
  else if (g("q4") >= 4) { riskAreas.push("Weak / reused password habits"); actions.push("Password audit & manager setup (use Bitwarden or 1Password)"); }

  if (g("q5") <= 1) doingRight.push("Two-factor authentication enabled");
  else if (g("q5") >= 3) { riskAreas.push("Email lacks two-factor authentication"); actions.push("Enable 2FA on email immediately — use Google Authenticator"); }

  if (g("q6") === 0) doingRight.push("Monitors accounts for data breaches");
  else if (g("q6") >= 4) { riskAreas.push("Never checked for data breach exposure"); actions.push("Check haveibeenpwned.com for your email & phone"); }

  // Device security
  if (g("q7") <= 1) doingRight.push("Keeps device OS and apps updated");
  else if (g("q7") >= 4) { riskAreas.push("Delays critical security updates"); actions.push("Enable automatic updates for OS and banking apps"); }

  if (g("q8") === 0) doingRight.push("Only installs apps from official stores");
  else if (g("q8") >= 3) { riskAreas.push("Installs unverified apps from third-party sources"); actions.push("Uninstall all apps not from Play Store / App Store"); }

  if (g("q9") <= 1) doingRight.push("Phone lock is active and secure");
  else if (g("q9") >= 3) { riskAreas.push("Phone screen lock is weak or absent"); actions.push("Set a 6-digit PIN + biometric lock on your phone"); }

  // Financial
  if (g("q11") <= 1) doingRight.push("Reviews bank statements regularly");
  else if (g("q11") >= 4) { riskAreas.push("Rarely monitors bank/UPI transactions"); actions.push("Set weekly transaction alerts in your banking app"); }

  if (g("q12") === 0) doingRight.push("Never accepts unverified UPI collect requests");
  else if (g("q12") >= 3) { riskAreas.push("Has accepted suspicious UPI collect requests"); actions.push("Never accept UPI collect requests from unknown numbers"); }

  // Social media
  if (g("q13") === 0) doingRight.push("Social media profiles are set to private");
  else if (g("q13") >= 4) { riskAreas.push("Social profiles are public — personal data exposed"); actions.push("Set Instagram and Facebook profiles to Private now"); }

  // Scam
  if (g("q18") === 0) doingRight.push("Knows how to respond to account compromise");
  else if (g("q18") >= 3) { riskAreas.push("Unprepared for banking/UPI account compromise"); actions.push("Save your bank's fraud helpline (1930) in your contacts"); }

  return { doingRight, riskAreas, actions };
}

// ─── Result ───────────────────────────────────────────────────────────────────

function getResult(raw: number) {
  const s10 = toScore10(raw);
  if (s10 <= 3)
    return { level: "Low Risk",    color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30", icon: ShieldCheck,  headline: "You're more aware than most.",                     body: "Solid habits overall. A few blind spots — a quick audit will seal them.", cta: "Book a Free 30-min Audit",      plan: "Basic Audit",          score10: s10 };
  if (s10 <= 6)
    return { level: "Medium Risk", color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/30",     icon: AlertTriangle, headline: "You're exposed in ways you might not realise.",  body: "Several fixable gaps. One session is all it takes to close them.",       cta: "Get a Personal Security Review", plan: "Watch Plan — ₹499/mo", score10: s10 };
  return   { level: "High Risk",   color: "text-red-400",     bg: "bg-red-400/10 border-red-400/30",         icon: ShieldAlert,  headline: "You're an active target.",                        body: "Your current habits put your money and identity at serious risk.",       cta: "Talk to AgentPome Now",          plan: "Guard Plan — ₹999/mo", score10: s10 };
}

const STEPS = ["Your Info", "Assessment", "Your Risk"];

// ─── Shuffle helpers ───────────────────────────────────────────────────────────

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Options are shuffled per user inside the component via useMemo

// ─── Component ────────────────────────────────────────────────────────────────

export default function KYRPage() {
  const [step, setStep]               = useState<"info" | "quiz" | "result">("info");
  const [userInfo, setUserInfo]       = useState<UserInfo>({ name: "", phone: "", email: "" });
  const [currentQ, setCurrentQ]       = useState(0);
  const [answers, setAnswers]         = useState<Answers>({});
  const [submitting, setSubmitting]   = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [infoErrors, setInfoErrors]   = useState<Partial<UserInfo>>({});

  // Shuffle options once per component mount — each user/refresh gets a different order
  const shuffledQuestions = useMemo(
    () => questions.map((q) => ({ ...q, options: shuffleArr(q.options) })),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalScore  = Object.values(answers).reduce((a, b) => a + b, 0);
  const result      = getResult(totalScore);
  const ResultIcon  = result.icon;
  const insights    = deriveInsights(answers);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validateInfo() {
    const errors: Partial<UserInfo> = {};
    if (!userInfo.name.trim())                              errors.name  = "Please enter your name";
    if (!/^\d{10}$/.test(userInfo.phone.trim()))            errors.phone = "Enter a valid 10-digit number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email.trim())) errors.email = "Enter a valid email";
    setInfoErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleInfoNext() {
    if (validateInfo()) setStep("quiz");
  }

  // ── Save lead ───────────────────────────────────────────────────────────────
  async function saveLead(newAnswers: Answers) {
    const raw     = Object.values(newAnswers).reduce((a, b) => a + b, 0);
    const res     = getResult(raw);
    // Build answer labels map: { q1: "Sometimes, if it looks familiar", ... }
    const answerLabels: Record<string, string> = {};
    questions.forEach((q) => {
      const pickedScore = newAnswers[q.id];
      if (pickedScore !== undefined) {
        const opt = q.options.find((o) => o.score === pickedScore);
        answerLabels[q.id] = opt?.label ?? String(pickedScore);
      }
    });

    // Category scores (0–1 fractions)
    const catScoresForLead: Record<string, number> = {};
    CATEGORIES.forEach((cat) => { catScoresForLead[cat] = catFraction(cat, newAnswers); });

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userInfo.name,
          phone: userInfo.phone,
          email: userInfo.email,
          score: raw,
          score10: res.score10,
          riskLevel: res.level,
          answers: newAnswers,          // raw scores { q1: 4, ... }
          answerLabels,                 // human text { q1: "Sometimes...", ... }
          categoryScores: catScoresForLead,
          submittedAt: new Date().toISOString(),
        }),
      });
    } catch { /* silently fail */ }
  }

  function handleAnswer(qId: string, score: number) {
    const newAnswers = { ...answers, [qId]: score };
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ((p) => p + 1), 280);
    } else {
      setSubmitting(true);
      saveLead(newAnswers).finally(() => { setStep("result"); setSubmitting(false); });
    }
  }

  // ── Download PDF ────────────────────────────────────────────────────────────
  async function handleDownload() {
    setDownloading(true);
    try {
      const catScores: Record<string, number> = {};
      CATEGORIES.forEach((cat) => { catScores[cat] = catFraction(cat, answers); });

      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userInfo.name,
          phone: userInfo.phone,
          email: userInfo.email,
          score: totalScore,
          score10: result.score10,
          riskLevel: result.level,
          categoryScores: catScores,
          riskAreas:  insights.riskAreas.slice(0, 5),
          doingRight: insights.doingRight.slice(0, 5),
          actions:    insights.actions.slice(0, 5),
        }),
      });

      if (!res.ok) throw new Error("Report generation failed");

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      const safeName = userInfo.name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
      a.download = `AgentPome_Risk_Report_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  }

  // ── WhatsApp ────────────────────────────────────────────────────────────────
  function handleWhatsApp() {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919876543210";
    const msg = encodeURIComponent(
      `Hi, I'm ${userInfo.name}. I just completed the AgentPome KYR assessment and scored ${result.score10}/10 (${result.level}). I'd like to know more about the ${result.plan}.`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
  }

  const progress  = step === "info" ? 0 : step === "quiz" ? ((currentQ + 1) / questions.length) * 100 : 100;
  const stepIndex = step === "info" ? 0 : step === "quiz" ? 1 : 2;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <a href="https://www.agentpome.com" className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-white" />
          <span className="font-semibold tracking-tight text-sm">AgentPome</span>
        </a>
        <span className="text-xs text-white/30">Know Your Risk</span>
      </nav>

      {/* Progress bar */}
      <div className="w-full h-0.5 bg-white/5">
        <motion.div
          className="h-full bg-white"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Step labels */}
      <div className="flex justify-center gap-8 py-4 border-b border-white/5">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
              i < stepIndex  ? "bg-white text-black"
              : i === stepIndex ? "bg-white/10 text-white ring-1 ring-white/30"
              : "bg-white/5 text-white/20"
            )}>
              {i < stepIndex ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className={cn(
              "text-xs transition-colors hidden sm:block",
              i === stepIndex ? "text-white/70" : i < stepIndex ? "text-white/40" : "text-white/15"
            )}>{s}</span>
          </div>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Info ─────────────────────────────── */}
            {step === "info" && (
              <motion.div key="info" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                <div className="mb-10">
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Free Assessment</p>
                  <h1 className="text-3xl font-semibold tracking-tight leading-snug">Know Your Risk</h1>
                  <p className="text-white/40 mt-3 text-sm leading-relaxed">
                    18 questions. 3 minutes. Find out exactly how exposed you are online — and get a downloadable report.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="name" className="text-xs text-white/40 mb-2 block">Full Name</Label>
                    <Input id="name" placeholder="Ravi Kumar" value={userInfo.name}
                      onChange={(e) => setUserInfo((p) => ({ ...p, name: e.target.value }))}
                      className={cn("bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 focus-visible:ring-white/20 focus-visible:border-white/30", infoErrors.name && "border-red-400/50")}
                    />
                    {infoErrors.name && <p className="text-red-400 text-xs mt-1">{infoErrors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs text-white/40 mb-2 block">Mobile Number</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center h-12 px-3 bg-white/5 border border-white/10 rounded-md text-white/40 text-sm">+91</div>
                      <Input id="phone" placeholder="9876543210" value={userInfo.phone} maxLength={10}
                        onChange={(e) => setUserInfo((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                        className={cn("bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 flex-1 focus-visible:ring-white/20 focus-visible:border-white/30", infoErrors.phone && "border-red-400/50")}
                      />
                    </div>
                    {infoErrors.phone && <p className="text-red-400 text-xs mt-1">{infoErrors.phone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs text-white/40 mb-2 block">Email Address</Label>
                    <Input id="email" type="email" placeholder="ravi@gmail.com" value={userInfo.email}
                      onChange={(e) => setUserInfo((p) => ({ ...p, email: e.target.value }))}
                      className={cn("bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 focus-visible:ring-white/20 focus-visible:border-white/30", infoErrors.email && "border-red-400/50")}
                    />
                    {infoErrors.email && <p className="text-red-400 text-xs mt-1">{infoErrors.email}</p>}
                  </div>

                  <p className="text-white/20 text-xs pt-1">Used only to personalise your risk report — nothing else.</p>

                  <Button onClick={handleInfoNext} className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium text-sm mt-2">
                    Start Assessment <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Quiz ──────────────────────────────── */}
            {step === "quiz" && (
              <motion.div key="quiz" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs text-white/30 uppercase tracking-widest">{shuffledQuestions[currentQ].category}</span>
                  <span className="text-xs text-white/20">{currentQ + 1} / {questions.length}</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    <h2 className="text-xl font-medium leading-snug mb-8 min-h-[72px]">{shuffledQuestions[currentQ].text}</h2>
                    <div className="space-y-3">
                      {shuffledQuestions[currentQ].options.map((opt, i) => (
                        <button key={i} onClick={() => handleAnswer(shuffledQuestions[currentQ].id, opt.score)} disabled={submitting}
                          className={cn(
                            "w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 text-sm leading-snug",
                            "border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/20 text-white/70 hover:text-white",
                            answers[shuffledQuestions[currentQ].id] === opt.score && "bg-white/10 border-white/30 text-white"
                          )}
                        >
                          <span className="text-white/20 mr-3 font-mono text-xs">{String.fromCharCode(65 + i)}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {currentQ > 0 && (
                  <button onClick={() => setCurrentQ((p) => p - 1)}
                    className="flex items-center gap-1 text-xs text-white/20 hover:text-white/40 mt-8 transition-colors">
                    <ChevronLeft className="w-3 h-3" /> Previous
                  </button>
                )}

                {submitting && (
                  <div className="mt-8 flex items-center gap-2 text-sm text-white/30">
                    <div className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                    Calculating your risk profile…
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 3: Result ────────────────────────────── */}
            {step === "result" && (
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

                {/* Header */}
                <div className="mb-8">
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">{userInfo.name}'s Risk Report</p>

                  {/* Score + badge row */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium", result.bg, result.color)}>
                      <ResultIcon className="w-4 h-4" />
                      {result.level}
                    </div>
                    {/* Big score */}
                    <div className="text-right">
                      <span className={cn("text-5xl font-bold tabular-nums leading-none", result.color)}>{result.score10}</span>
                      <span className="text-lg text-white/25 font-normal">/10</span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight leading-snug mb-2">{result.headline}</h2>
                  <p className="text-white/40 text-sm leading-relaxed">{result.body}</p>
                </div>

                {/* Category bars */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-5">
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Risk by category</p>
                  <div className="space-y-3">
                    {CATEGORIES.map((cat) => {
                      const frac = catFraction(cat, answers);
                      const pct  = frac * 100;
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <span className="text-xs text-white/40 w-32 shrink-0">{cat}</span>
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.2, duration: 0.6 }}
                              className={cn("h-full rounded-full", pct < 40 ? "bg-emerald-400" : pct < 70 ? "bg-amber-400" : "bg-red-400")}
                            />
                          </div>
                          <span className={cn("text-xs tabular-nums w-8 text-right",
                            pct < 40 ? "text-emerald-400/60" : pct < 70 ? "text-amber-400/60" : "text-red-400/60"
                          )}>{Math.round(frac * 18)}/18</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Doing right */}
                {insights.doingRight.length > 0 && (
                  <div className="bg-emerald-400/5 border border-emerald-400/15 rounded-2xl p-5 mb-5">
                    <p className="text-xs text-emerald-400/60 uppercase tracking-widest mb-3">What you're doing right</p>
                    <div className="space-y-2">
                      {insights.doingRight.slice(0, 4).map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span className="text-sm text-white/70">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk areas */}
                {insights.riskAreas.length > 0 && (
                  <div className="bg-red-400/5 border border-red-400/15 rounded-2xl p-5 mb-5">
                    <p className="text-xs text-red-400/60 uppercase tracking-widest mb-3">Risk areas found</p>
                    <div className="space-y-2">
                      {insights.riskAreas.slice(0, 5).map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                          <span className="text-sm text-white/70">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* What needs attention */}
                {insights.actions.length > 0 && (
                  <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-6">
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-3">What needs attention</p>
                    <div className="space-y-2.5">
                      {insights.actions.slice(0, 5).map((action, i) => (
                        <div key={action} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded bg-white/8 flex items-center justify-center text-[10px] text-white/40 font-bold shrink-0 mt-0.5">{i + 1}</div>
                          <span className="text-sm text-white/70">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="space-y-3">
                  {/* Download PDF */}
                  <Button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium text-sm"
                  >
                    {downloading ? (
                      <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" /> Generating report…</>
                    ) : (
                      <><Download className="w-4 h-4 mr-2" /> Download Your Report (PDF)</>
                    )}
                  </Button>

                  {/* WhatsApp */}
                  <Button
                    onClick={handleWhatsApp}
                    className="w-full h-12 bg-transparent border border-white/15 text-white/70 hover:bg-white/5 hover:text-white font-medium text-sm"
                  >
                    {result.cta} →
                  </Button>

                  <p className="text-center text-xs text-white/20">
                    Recommended: <span className="text-white/40">{result.plan}</span>
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <footer className="text-center py-6 border-t border-white/5">
        <p className="text-xs text-white/15">© 2025 AgentPome · Personal Cybersecurity</p>
      </footer>
    </div>
  );
}
