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
    text: "Someone in your family WhatsApp group shares a link - 'Free Jio recharge, click now!' What do you do?",
    options: [
      { label: "Ignore it - these are always fake", score: 0 },
      { label: "Check the URL before clicking", score: 1 },
      { label: "Click it - it's from a family member so it's probably safe", score: 4 },
      { label: "Click and enter my number to try my luck", score: 6 },
    ],
  },
  {
    id: "q2", category: "Online Behaviour",
    text: "You get an SMS: 'Your KYC is expired. Click here to update or your account will be blocked.' What do you do?",
    options: [
      { label: "Delete it - banks never send links like this", score: 0 },
      { label: "Call my bank directly to check", score: 1 },
      { label: "Click the link to see what it says", score: 5 },
      { label: "Click and fill in my details to be safe", score: 6 },
    ],
  },
  {
    id: "q3", category: "Online Behaviour",
    text: "You're at a café and need to pay a bill via GPay. The café has free WiFi. What do you do?",
    options: [
      { label: "Switch to mobile data before paying", score: 0 },
      { label: "It depends - small amount, I'll use WiFi", score: 3 },
      { label: "Pay on WiFi - it's faster", score: 5 },
      { label: "I never thought about this", score: 6 },
    ],
  },

  // Account Security
  {
    id: "q4", category: "Account Security",
    text: "Your Gmail, Instagram, and bank app - do they all have different passwords?",
    options: [
      { label: "Yes - all different, I use a password manager", score: 0 },
      { label: "Mostly different, but a few are the same", score: 2 },
      { label: "I have 2-3 passwords I rotate between", score: 4 },
      { label: "Same password everywhere - easier to remember", score: 6 },
    ],
  },
  {
    id: "q5", category: "Account Security",
    text: "If someone got your Gmail password right now, could they log in without your phone?",
    options: [
      { label: "No - I have 2FA, they'd need my phone too", score: 0 },
      { label: "I have SMS OTP enabled", score: 2 },
      { label: "I'm not sure how to check", score: 4 },
      { label: "Yes, password alone is enough to get in", score: 6 },
    ],
  },
  {
    id: "q6", category: "Account Security",
    text: "How do you find out if your email or phone number has been leaked in a data breach?",
    options: [
      { label: "I check haveibeenpwned.com regularly", score: 0 },
      { label: "I've checked once before", score: 2 },
      { label: "I wait for my bank or app to notify me", score: 4 },
      { label: "I didn't know this was possible", score: 6 },
    ],
  },

  // Device Security
  {
    id: "q7", category: "Device Security",
    text: "Your phone shows a pending software update. You're busy. What usually happens?",
    options: [
      { label: "I install it the same day", score: 0 },
      { label: "I do it within a few days", score: 1 },
      { label: "I keep postponing - sometimes for weeks", score: 4 },
      { label: "I skip updates, they slow my phone down", score: 6 },
    ],
  },
  {
    id: "q8", category: "Device Security",
    text: "Someone sends you an APK file on WhatsApp and says 'install this app, it's better than the Play Store version.' What do you do?",
    options: [
      { label: "Never install - APKs outside Play Store are dangerous", score: 0 },
      { label: "Only if I trust the person who sent it", score: 3 },
      { label: "Check what the app does, then decide", score: 4 },
      { label: "Install it - if something goes wrong I'll uninstall", score: 6 },
    ],
  },
  {
    id: "q9", category: "Device Security",
    text: "Someone picks up your phone while you step away. How protected is it?",
    options: [
      { label: "PIN + biometric - they can't do anything", score: 0 },
      { label: "PIN only", score: 1 },
      { label: "Swipe pattern", score: 3 },
      { label: "No lock - I trust the people around me", score: 6 },
    ],
  },

  // Financial Exposure
  {
    id: "q10", category: "Financial Exposure",
    text: "A call comes: 'I'm from SBI fraud team. Your account was used in a suspicious transaction. Share your OTP to block it.' What do you do?",
    options: [
      { label: "Hang up immediately - banks never ask for OTP", score: 0 },
      { label: "Ask for their employee ID before deciding", score: 2 },
      { label: "Stay on the call - it sounds official", score: 5 },
      { label: "Share the OTP to protect my account", score: 6 },
    ],
  },
  {
    id: "q11", category: "Financial Exposure",
    text: "How often do you check your bank or UPI transaction history?",
    options: [
      { label: "Every few days - I'd notice anything unusual fast", score: 0 },
      { label: "Once a month", score: 2 },
      { label: "Only when I feel something is off", score: 4 },
      { label: "Rarely - I trust the alerts will come to me", score: 6 },
    ],
  },
  {
    id: "q12", category: "Financial Exposure",
    text: "You get a GPay 'collect money' request from an unknown number for ₹10. It says 'scratch card reward.' What do you do?",
    options: [
      { label: "Decline immediately - collect requests take money from you", score: 0 },
      { label: "Verify who sent it before deciding", score: 2 },
      { label: "Accept - it's only ₹10, what's the risk?", score: 5 },
      { label: "I didn't know accepting a collect request takes money from me", score: 6 },
    ],
  },

  // Social Media
  {
    id: "q13", category: "Social Media",
    text: "Can a stranger on Instagram or Facebook see your phone number, city, or workplace?",
    options: [
      { label: "No - my profile is private and I share nothing personal", score: 0 },
      { label: "My profile is private but some details might be visible", score: 2 },
      { label: "My profile is public - I post regularly", score: 4 },
      { label: "I've never checked what's visible to strangers", score: 6 },
    ],
  },
  {
    id: "q14", category: "Social Media",
    text: "Someone on Instagram DMs you: 'I'm from a brand, we want to collaborate. Send your Aadhaar for verification.' What do you do?",
    options: [
      { label: "Block and report - this is a common scam", score: 0 },
      { label: "Ask for their official email before responding", score: 2 },
      { label: "Check their profile - if it looks real, I'd consider it", score: 4 },
      { label: "Send it - brand collaborations ask for this", score: 6 },
    ],
  },

  // Scam Vulnerability
  {
    id: "q15", category: "Scam Vulnerability",
    text: "You get a call: 'Congratulations! You've won a KBC prize of ₹25 lakhs. Pay ₹5,000 processing fee to claim.' How do you react?",
    options: [
      { label: "Hang up - this is a classic scam script", score: 0 },
      { label: "Ask them to send details in writing first", score: 2 },
      { label: "Feel excited and want to know more", score: 4 },
      { label: "Consider paying - ₹5K for ₹25 lakhs sounds worth it", score: 6 },
    ],
  },
  {
    id: "q16", category: "Scam Vulnerability",
    text: "A message says: 'Your Aadhaar has been used to open a suspicious account. Call this number immediately or face arrest.' What do you do?",
    options: [
      { label: "Ignore and delete - government never contacts this way", score: 0 },
      { label: "Call the official UIDAI helpline (1947) to verify", score: 1 },
      { label: "Call the number to find out what's happening", score: 5 },
      { label: "Panic and call the number immediately", score: 6 },
    ],
  },
  {
    id: "q17", category: "Scam Vulnerability",
    text: "What is the national helpline number to report a cyber fraud or money stolen online?",
    options: [
      { label: "1930 - I know this and have it saved", score: 0 },
      { label: "I've heard of it but don't remember the number", score: 2 },
      { label: "I'd Google it if something happened", score: 4 },
      { label: "I had no idea there was a helpline for this", score: 6 },
    ],
  },
  {
    id: "q18", category: "Scam Vulnerability",
    text: "Money just disappeared from your bank account without your permission. What do you do in the next 10 minutes?",
    options: [
      { label: "Call 1930, block my card, and file a complaint immediately", score: 0 },
      { label: "Call my bank's customer care first", score: 2 },
      { label: "Wait to see if it's a delayed transaction before panicking", score: 4 },
      { label: "I wouldn't know what to do first", score: 6 },
    ],
  },
];

const CATEGORIES = [
  "Online Behaviour", "Account Security", "Device Security",
  "Financial Exposure", "Social Media", "Scam Vulnerability",
];

// ─── Score Helpers ─────────────────────────────────────────────────────────────

function toScore10(raw: number): number {
  return Math.min(10, Math.max(1, Math.round((raw / 108) * 10)));
}

function catFraction(cat: string, answers: Answers): number {
  const qs = questions.filter((q) => q.category === cat);
  const sum = qs.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
  return sum / (qs.length * 6);
}

// ─── Result ───────────────────────────────────────────────────────────────────
// No pricing anywhere. CTA is always the free check via WhatsApp.
// Low scorers (raw < 25) get a softer message — no push, just an open door.

function getResult(raw: number) {
  const s10 = toScore10(raw);
  const isLow = raw < 25;

  if (isLow) return {
    level:     "Low Risk",
    color:     "text-emerald-400",
    bg:        "bg-emerald-400/10 border-emerald-400/30",
    icon:      ShieldCheck,
    headline:  "Your setup is solid.",
    body:      "You're more aware than most people. Keep the habits going — they're working.",
    softNote:  "If you ever want a second opinion or a fresh set of eyes on your setup, I'm here.",
    cta:       "Message AgentPome on WhatsApp",
    score10:   s10,
  };

  if (s10 <= 6) return {
    level:     "Medium Risk",
    color:     "text-amber-400",
    bg:        "bg-amber-400/10 border-amber-400/30",
    icon:      AlertTriangle,
    headline:  "You're exposed in ways you might not realise.",
    body:      "Several fixable gaps. One session is all it takes to close them.",
    softNote:  null,
    cta:       "Get a free 30-minute check",
    score10:   s10,
  };

  return {
    level:     "High Risk",
    color:     "text-red-400",
    bg:        "bg-red-400/10 border-red-400/30",
    icon:      ShieldAlert,
    headline:  "Your current setup puts your money and accounts at risk.",
    body:      "The gaps found here are the exact ones attackers look for. Let's fix this together.",
    softNote:  null,
    cta:       "Talk to AgentPome — free check",
    score10:   s10,
  };
}

// ─── Derive Insights ───────────────────────────────────────────────────────────

function deriveInsights(answers: Answers) {
  const doingRight: string[] = [];
  const riskAreas:  string[] = [];
  const actions:    string[] = [];

  const g = (id: string) => answers[id] ?? 0;

  // Online Behaviour
  if (g("q1") <= 1)
    doingRight.push("Doesn't fall for fake recharge / prize links in family groups");
  else if (g("q1") >= 4)
    { riskAreas.push("Clicks links in WhatsApp groups without verifying"); actions.push("Never click links in group chats — even from family. Scammers hack contacts."); }

  if (g("q2") <= 1)
    doingRight.push("Recognises and ignores KYC/account-block SMS phishing");
  else if (g("q2") >= 5)
    { riskAreas.push("Clicks bank/KYC links received over SMS"); actions.push("Delete any SMS with a link from 'your bank'. Call the 1800-number on your card instead."); }

  if (g("q3") === 0)
    doingRight.push("Always uses mobile data for UPI/banking — not public WiFi");
  else if (g("q3") >= 5)
    { riskAreas.push("Makes UPI/banking payments on public WiFi"); actions.push("Turn off WiFi before opening any payment or banking app in public."); }

  // Account Security
  if (g("q4") === 0)
    doingRight.push("Uses unique passwords and a password manager");
  else if (g("q4") >= 4)
    { riskAreas.push("Reuses the same password across multiple accounts"); actions.push("Set up Bitwarden (free) — one strong master password protects everything else."); }

  if (g("q5") === 0)
    doingRight.push("Gmail is protected with two-factor authentication");
  else if (g("q5") >= 4)
    { riskAreas.push("Gmail has no two-factor authentication — one password is all it takes"); actions.push("Enable 2FA on Gmail today: Settings → Security → 2-Step Verification."); }

  if (g("q6") <= 1)
    doingRight.push("Proactively checks for data breach exposure");
  else if (g("q6") >= 4)
    { riskAreas.push("Has never checked if personal data was leaked in a breach"); actions.push("Visit haveibeenpwned.com and search your email and phone number right now."); }

  // Device Security
  if (g("q7") <= 1)
    doingRight.push("Installs phone updates promptly — patches known vulnerabilities");
  else if (g("q7") >= 4)
    { riskAreas.push("Delays or skips security updates on phone"); actions.push("Enable auto-updates: Settings → Software Update → Auto Download & Install."); }

  if (g("q8") === 0)
    doingRight.push("Never installs APK files from outside the Play Store");
  else if (g("q8") >= 3)
    { riskAreas.push("Open to installing APK files sent over WhatsApp — high malware risk"); actions.push("Never install APKs. If someone you trust sends one, their phone may already be compromised."); }

  if (g("q9") <= 1)
    doingRight.push("Phone is secured with PIN and biometric lock");
  else if (g("q9") >= 3)
    { riskAreas.push("Phone screen lock is weak or missing"); actions.push("Set a 6-digit PIN + fingerprint lock: Settings → Biometrics and Security."); }

  // Financial Exposure
  if (g("q10") === 0)
    doingRight.push("Knows banks never ask for OTP — hangs up on fraud calls immediately");
  else if (g("q10") >= 5)
    { riskAreas.push("Would stay on a call with someone claiming to be from the bank's fraud team"); actions.push("Rule: no bank ever asks for OTP. The moment they do, hang up and call your bank directly."); }

  if (g("q11") <= 1)
    doingRight.push("Monitors bank and UPI transactions regularly");
  else if (g("q11") >= 4)
    { riskAreas.push("Rarely checks bank or UPI transaction history"); actions.push("Set up instant SMS/email alerts in your bank app — catch fraud within minutes."); }

  if (g("q12") === 0)
    doingRight.push("Understands UPI collect requests and declines unknown ones");
  else if (g("q12") >= 5)
    { riskAreas.push("Would accept a UPI collect request from an unknown number"); actions.push("Collect requests TAKE money — only accept from people you know. Decline everything else."); }

  // Social Media
  if (g("q13") === 0)
    doingRight.push("Social media profiles are private — strangers can't see personal details");
  else if (g("q13") >= 4)
    { riskAreas.push("Personal details visible publicly on social media"); actions.push("Go to Instagram → Settings → Account Privacy → set to Private. Check Facebook too."); }

  if (g("q14") <= 1)
    doingRight.push("Recognises fake brand collaboration DM scams");
  else if (g("q14") >= 4)
    { riskAreas.push("Would consider sharing Aadhaar with an Instagram DM from a 'brand'"); actions.push("No legitimate brand asks for Aadhaar over Instagram DM. Block and report immediately."); }

  // Scam Vulnerability
  if (g("q15") <= 1)
    doingRight.push("Immediately recognises and rejects advance-fee / prize scam calls");
  else if (g("q15") >= 4)
    { riskAreas.push("Could be taken in by a KBC prize / lottery phone scam"); actions.push("Any call asking you to pay first to receive a prize is a scam — 100% of the time."); }

  if (g("q16") <= 1)
    doingRight.push("Stays calm and doesn't engage with fake government arrest threats");
  else if (g("q16") >= 5)
    { riskAreas.push("Would call back a number from a fake government arrest threat"); actions.push("CBI/police/UIDAI never send WhatsApp messages. Delete and block. Call 1930 if unsure."); }

  if (g("q17") === 0)
    doingRight.push("Knows the cyber fraud helpline 1930 and has it saved");
  else if (g("q17") >= 4)
    { riskAreas.push("Doesn't know the national cyber fraud helpline number (1930)"); actions.push("Save 1930 in your contacts right now. Every minute matters when money is stolen."); }

  if (g("q18") === 0)
    doingRight.push("Has a clear action plan if money is stolen — call 1930, block card immediately");
  else if (g("q18") >= 4)
    { riskAreas.push("No clear plan if money disappears from bank account"); actions.push("If money is stolen: (1) Call 1930, (2) Block your card via app or bank call, (3) File complaint at cybercrime.gov.in."); }

  return { doingRight, riskAreas, actions };
}

const STEPS = ["Your Info", "Assessment", "Your Risk"];

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KYRPage() {
  const [step, setStep]               = useState<"info" | "quiz" | "result">("info");
  const [userInfo, setUserInfo]       = useState<UserInfo>({ name: "", phone: "", email: "" });
  const [currentQ, setCurrentQ]       = useState(0);
  const [answers, setAnswers]         = useState<Answers>({});
  const [submitting, setSubmitting]   = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [infoErrors, setInfoErrors]   = useState<Partial<UserInfo>>({});

  const shuffledQuestions = useMemo(
    () => questions.map((q) => ({ ...q, options: shuffleArr(q.options) })),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const result     = getResult(totalScore);
  const ResultIcon = result.icon;
  const insights   = deriveInsights(answers);

  function validateInfo() {
    const errors: Partial<UserInfo> = {};
    if (!userInfo.name.trim())                                      errors.name  = "Please enter your name";
    if (!/^\d{10}$/.test(userInfo.phone.trim()))                    errors.phone = "Enter a valid 10-digit number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email.trim())) errors.email = "Enter a valid email";
    setInfoErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleInfoNext() {
    if (validateInfo()) setStep("quiz");
  }

  async function saveLead(newAnswers: Answers) {
    const raw = Object.values(newAnswers).reduce((a, b) => a + b, 0);
    const res = getResult(raw);
    const answerLabels: Record<string, string> = {};
    questions.forEach((q) => {
      const picked = newAnswers[q.id];
      if (picked !== undefined) {
        const opt = q.options.find((o) => o.score === picked);
        answerLabels[q.id] = opt?.label ?? String(picked);
      }
    });
    const catScoresForLead: Record<string, number> = {};
    CATEGORIES.forEach((cat) => { catScoresForLead[cat] = catFraction(cat, newAnswers); });
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userInfo.name, phone: userInfo.phone, email: userInfo.email,
          score: raw, score10: res.score10, riskLevel: res.level,
          answers: newAnswers, answerLabels, categoryScores: catScoresForLead,
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

  async function handleDownload() {
    setDownloading(true);
    try {
      const catScores: Record<string, number> = {};
      CATEGORIES.forEach((cat) => { catScores[cat] = catFraction(cat, answers); });
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userInfo.name, phone: userInfo.phone, email: userInfo.email,
          score: totalScore, score10: result.score10, riskLevel: result.level,
          categoryScores: catScores,
          riskAreas:  insights.riskAreas.slice(0, 5),
          doingRight: insights.doingRight.slice(0, 5),
          actions:    insights.actions.slice(0, 5),
        }),
      });
      if (!res.ok) throw new Error("Report generation failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a      = document.createElement("a");
      a.href       = url;
      a.download   = `AgentPome_Risk_Report_${userInfo.name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_")}.pdf`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Don't revoke the URL - let browser handle cleanup
      // If user wants to start new assessment, they can reload the page
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  }

  // WhatsApp message carries score + risk level but NO plan name or price
  function handleWhatsApp() {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "918270094307";
    const isLow  = totalScore < 25;
    const msg    = isLow
      ? encodeURIComponent(
          `Hi, I'm ${userInfo.name}. I completed the AgentPome KYR assessment and scored ${result.score10}/10 (${result.level}). Just wanted to connect.`
        )
      : encodeURIComponent(
          `Hi, I'm ${userInfo.name}. I just completed the AgentPome KYR assessment and scored ${result.score10}/10 (${result.level}). I'd like to know more about the free check.`
        );
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
  }

  const progress  = step === "info" ? 0 : step === "quiz" ? ((currentQ + 1) / questions.length) * 100 : 100;
  const stepIndex = step === "info" ? 0 : step === "quiz" ? 1 : 2;

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
              i < stepIndex    ? "bg-white text-black"
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
                        <button key={i}
                          onClick={() => handleAnswer(shuffledQuestions[currentQ].id, opt.score)}
                          disabled={submitting}
                          className={cn(
                            "w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 text-sm leading-snug",
                            "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-white/70 hover:text-white",
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
                <div className="mb-8">
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">{userInfo.name}'s Risk Report</p>
                  <div className="flex items-start justify-between mb-6">
                    <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium", result.bg, result.color)}>
                      <ResultIcon className="w-4 h-4" />
                      {result.level}
                    </div>
                    <div className="text-right">
                      <span className={cn("text-5xl font-bold tabular-nums leading-none", result.color)}>{result.score10}</span>
                      <span className="text-lg text-white/25 font-normal">/10</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight leading-snug mb-2">{result.headline}</h2>
                  <p className="text-white/40 text-sm leading-relaxed">{result.body}</p>

                  {/* Soft note for low scorers only */}
                  {result.softNote && (
                    <p className="text-white/25 text-sm leading-relaxed mt-3 italic">{result.softNote}</p>
                  )}
                </div>

                {/* Category bars */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-5">
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

                {/* Risk areas — hidden for low scorers with no risks */}
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

                {/* Actions — hidden for low scorers with no actions */}
                {insights.actions.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-6">
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-3">What needs attention</p>
                    <div className="space-y-2.5">
                      {insights.actions.slice(0, 5).map((action, i) => (
                        <div key={action} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded bg-white/[0.08] flex items-center justify-center text-[10px] text-white/40 font-bold shrink-0 mt-0.5">{i + 1}</div>
                          <span className="text-sm text-white/70">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTAs — no pricing, no plan names */}
                <div className="space-y-3 pb-12">
                  <Button onClick={handleDownload} disabled={downloading}
                    className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium text-sm">
                    {downloading ? (
                      <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />Generating report…</>
                    ) : (
                      <><Download className="w-4 h-4 mr-2" />Download Your Report (PDF)</>
                    )}
                  </Button>
                  <Button onClick={handleWhatsApp}
                    className="w-full h-12 bg-transparent border border-white/15 text-white/70 hover:bg-white/5 hover:text-white font-medium text-sm">
                    {result.cta} →
                  </Button>
                  {/* No pricing line here — removed */}
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