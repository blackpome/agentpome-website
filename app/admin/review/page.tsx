"use client";

/**
 * app/admin/review/page.tsx
 *
 * Auth: middleware.ts checks the admin_session httpOnly cookie on every request.
 * Unauthenticated users are redirected to /admin/login before this page loads.
 *
 * Layout after a lead loads:
 *   Top row:  identity card | category bars
 *   Bottom:   PDF viewer (left) | Q&A answers (right) — side by side
 */

import { useState, useEffect, useRef } from "react";
import {
  Shield, Search, Download, RefreshCw,
  ChevronDown, ChevronUp, AlertTriangle,
  ShieldAlert, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportData } from "@/lib/generate-report";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Online Behaviour", "Account Security", "Device Security",
  "Financial Exposure", "Social Media", "Scam Vulnerability",
] as const;

const Q_HEADERS: [number, string][] = [
  [1,  "Q1: Free Jio recharge link in family WhatsApp group"],
  [2,  "Q2: KYC expired SMS — click to update or account blocked"],
  [3,  "Q3: GPay payment at café — public WiFi available"],
  [4,  "Q4: Gmail / Instagram / bank app — same or different passwords"],
  [5,  "Q5: Could someone log into Gmail with just your password?"],
  [6,  "Q6: How do you check if your data was leaked in a breach?"],
  [7,  "Q7: Phone shows pending software update — what happens?"],
  [8,  "Q8: APK file sent on WhatsApp — better than Play Store version"],
  [9,  "Q9: Someone picks up your phone while you step away"],
  [10, "Q10: SBI fraud team calls — share OTP to block transaction"],
  [11, "Q11: How often do you check bank / UPI transaction history?"],
  [12, "Q12: GPay collect request from unknown — ₹10 scratch card"],
  [13, "Q13: Can a stranger see your phone number / city on Instagram?"],
  [14, "Q14: Instagram DM — brand wants to collaborate, send Aadhaar"],
  [15, "Q15: Call — won KBC ₹25 lakh prize, pay ₹5000 to claim"],
  [16, "Q16: Message — Aadhaar used for suspicious account, face arrest"],
  [17, "Q17: What is the national cyber fraud helpline number?"],
  [18, "Q18: Money disappeared from account — what do you do next?"],
];

// ─── Insight rules ─────────────────────────────────────────────────────────────
// goodPrefixes/badPrefixes must match EXACT option label text from app/kyr/page.tsx
// Multiple prefixes per question handle all good/bad options correctly.

const INSIGHT_RULES: {
  qNum:         number;
  goodPrefixes: string[];
  badPrefixes:  string[];
  good:         string;
  bad:          string;
  action:       string;
}[] = [
  {
    qNum: 1,
    goodPrefixes: ["Ignore it", "Check the URL before clicking"],
    badPrefixes:  ["Click it", "Click and enter"],
    good:   "Doesn't fall for fake recharge / prize links in family groups",
    bad:    "Clicks links in WhatsApp groups without verifying",
    action: "Never click links in group chats -- even from family. Scammers hack contacts.",
  },
  {
    qNum: 2,
    goodPrefixes: ["Delete it", "Call my bank directly"],
    badPrefixes:  ["Click the link to see", "Click and fill in"],
    good:   "Recognises and ignores KYC/account-block SMS phishing",
    bad:    "Clicks bank/KYC links received over SMS",
    action: "Delete any SMS with a link from 'your bank'. Call the 1800-number on your card instead.",
  },
  {
    qNum: 3,
    goodPrefixes: ["Switch to mobile data"],
    badPrefixes:  ["Pay on WiFi", "I never thought about this"],
    good:   "Always uses mobile data for UPI/banking -- not public WiFi",
    bad:    "Makes UPI/banking payments on public WiFi",
    action: "Turn off WiFi before opening any payment or banking app in public.",
  },
  {
    qNum: 4,
    goodPrefixes: ["Yes - all different, I use a password manager"],
    badPrefixes:  ["I have 2-3 passwords", "Same password everywhere"],
    good:   "Uses unique passwords and a password manager",
    bad:    "Reuses the same password across multiple accounts",
    action: "Set up Bitwarden (free) -- one strong master password protects everything else.",
  },
  {
    qNum: 5,
    goodPrefixes: ["No - I have 2FA"],
    badPrefixes:  ["I'm not sure how to check", "Yes, password alone"],
    good:   "Gmail is protected with two-factor authentication",
    bad:    "Gmail has no two-factor authentication -- one password is all it takes",
    action: "Enable 2FA on Gmail today: Settings -> Security -> 2-Step Verification.",
  },
  {
    qNum: 6,
    goodPrefixes: ["I check haveibeenpwned.com regularly", "I've checked once before"],
    badPrefixes:  ["I wait for my bank", "I didn't know this was possible"],
    good:   "Proactively checks for data breach exposure",
    bad:    "Has never checked if personal data was leaked in a breach",
    action: "Visit haveibeenpwned.com and search your email and phone number right now.",
  },
  {
    qNum: 7,
    goodPrefixes: ["I install it the same day", "I do it within a few days"],
    badPrefixes:  ["I keep postponing", "I skip updates"],
    good:   "Installs phone updates promptly -- patches known vulnerabilities",
    bad:    "Delays or skips security updates on phone",
    action: "Enable auto-updates: Settings -> Software Update -> Auto Download & Install.",
  },
  {
    qNum: 8,
    goodPrefixes: ["Never install - APKs outside Play Store are dangerous"],
    badPrefixes:  ["Only if I trust the person", "Check what the app does", "Install it - if something"],
    good:   "Never installs APK files from outside the Play Store",
    bad:    "Open to installing APK files sent over WhatsApp -- high malware risk",
    action: "Never install APKs. If someone you trust sends one, their phone may already be compromised.",
  },
  {
    qNum: 9,
    goodPrefixes: ["PIN + biometric", "PIN only"],
    badPrefixes:  ["Swipe pattern", "No lock"],
    good:   "Phone is secured with PIN and biometric lock",
    bad:    "Phone screen lock is weak or missing",
    action: "Set a 6-digit PIN + fingerprint lock: Settings -> Biometrics and Security.",
  },
  {
    qNum: 10,
    goodPrefixes: ["Hang up immediately - banks never ask for OTP"],
    badPrefixes:  ["Ask for their employee ID", "Stay on the call", "Share the OTP"],
    good:   "Knows banks never ask for OTP -- hangs up on fraud calls immediately",
    bad:    "Would stay on a call with someone claiming to be from the bank's fraud team",
    action: "Rule: no bank ever asks for OTP. The moment they do, hang up and call your bank directly.",
  },
  {
    qNum: 11,
    goodPrefixes: ["Every few days - I'd notice anything unusual fast"],
    badPrefixes:  ["Only when I feel something is off", "Rarely - I trust the alerts"],
    good:   "Monitors bank and UPI transactions regularly",
    bad:    "Rarely checks bank or UPI transaction history",
    action: "Set up instant SMS/email alerts in your bank app -- catch fraud within minutes.",
  },
  {
    qNum: 12,
    goodPrefixes: ["Decline immediately - collect requests take money from you"],
    badPrefixes:  ["Verify who sent it", "Accept - it's only", "I didn't know accepting"],
    good:   "Understands UPI collect requests and declines unknown ones",
    bad:    "Would accept a UPI collect request from an unknown number",
    action: "Collect requests TAKE money -- only accept from people you know. Decline everything else.",
  },
  {
    qNum: 13,
    goodPrefixes: ["No - my profile is private and I share nothing personal"],
    badPrefixes:  ["My profile is private but some details", "My profile is public", "I've never checked what's visible"],
    good:   "Social media profiles are private -- strangers can't see personal details",
    bad:    "Personal details visible publicly on social media",
    action: "Go to Instagram -> Settings -> Account Privacy -> set to Private. Check Facebook too.",
  },
  {
    qNum: 14,
    goodPrefixes: ["Block and report - this is a common scam"],
    badPrefixes:  ["Ask for their official email", "Check their profile", "Send it - brand"],
    good:   "Recognises fake brand collaboration DM scams",
    bad:    "Would consider sharing Aadhaar with an Instagram DM from a 'brand'",
    action: "No legitimate brand asks for Aadhaar over Instagram DM. Block and report immediately.",
  },
  {
    qNum: 15,
    goodPrefixes: ["Hang up - this is a classic scam script"],
    badPrefixes:  ["Ask them to send details", "Feel excited", "Consider paying"],
    good:   "Immediately recognises and rejects advance-fee / prize scam calls",
    bad:    "Could be taken in by a KBC prize / lottery phone scam",
    action: "Any call asking you to pay first to receive a prize is a scam -- 100% of the time.",
  },
  {
    qNum: 16,
    goodPrefixes: ["Ignore and delete - government never contacts this way", "Call the official UIDAI helpline"],
    badPrefixes:  ["Call the number to find out", "Panic and call the number"],
    good:   "Stays calm and doesn't engage with fake government arrest threats",
    bad:    "Would call back a number from a fake government arrest threat",
    action: "CBI/police/UIDAI never send WhatsApp messages. Delete and block. Call 1930 if unsure.",
  },
  {
    qNum: 17,
    goodPrefixes: ["1930 - I know this and have it saved"],
    badPrefixes:  ["I've heard of it but don't remember", "I'd Google it if something happened", "I had no idea there was a helpline"],
    good:   "Knows the cyber fraud helpline 1930 and has it saved",
    bad:    "Doesn't know the national cyber fraud helpline number (1930)",
    action: "Save 1930 in your contacts right now. Every minute matters when money is stolen.",
  },
  {
    qNum: 18,
    goodPrefixes: ["Call 1930, block my card, and file a complaint immediately"],
    badPrefixes:  ["Call my bank's customer care first", "Wait to see if it's a delayed", "I wouldn't know what to do"],
    good:   "Has a clear action plan if money is stolen -- call 1930, block card immediately",
    bad:    "No clear plan if money disappears from bank account",
    action: "If money is stolen: (1) Call 1930, (2) Block your card via app or bank call, (3) File complaint at cybercrime.gov.in.",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Lead = Record<string, unknown>;

// Safely coerce any Apps Script value to string
function s(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

// ─── Insight derivation ───────────────────────────────────────────────────────

function classifyAnswer(answer: string, rule: typeof INSIGHT_RULES[0]): "good" | "bad" | "neutral" {
  if (rule.goodPrefixes.some((p) => answer.startsWith(p))) return "good";
  if (rule.badPrefixes.some((p)  => answer.startsWith(p))) return "bad";
  return "neutral";
}

function deriveInsights(lead: Lead) {
  const doingRight: string[] = [];
  const riskAreas:  string[] = [];
  const actions:    string[] = [];

  for (const rule of INSIGHT_RULES) {
    const header = Q_HEADERS.find(([n]) => n === rule.qNum)?.[1] ?? "";
    const answer = s(lead[header]);
    if (!answer) continue;
    const cls = classifyAnswer(answer, rule);
    if (cls === "good") { doingRight.push(rule.good); }
    else if (cls === "bad") { riskAreas.push(rule.bad); actions.push(rule.action); }
  }

  return { doingRight, riskAreas, actions };
}

// ─── Build ReportData ─────────────────────────────────────────────────────────

function buildReportPayload(lead: Lead): ReportData {
  const categoryScores: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    const raw = lead[`${cat} %`];
    let frac = 0;
    if (raw != null) {
      if (typeof raw === "number") {
        frac = raw > 1 ? raw / 100 : raw;
      } else {
        const n = parseInt(String(raw).replace("%", ""), 10);
        frac = isNaN(n) ? 0 : n > 1 ? n / 100 : n;
      }
    }
    categoryScores[cat] = Math.min(1, Math.max(0, frac));
  }

  const { doingRight, riskAreas, actions } = deriveInsights(lead);
  const riskLevel = s(lead["Risk Level"]) || "Medium Risk";

  const rawScore = lead["Score (/10)"];
  let score10 = 5;
  if (rawScore != null) {
    if (typeof rawScore === "number") {
      score10 = Math.round(rawScore);
    } else {
      const parsed = parseInt(s(rawScore).split("/")[0].trim(), 10);
      score10 = isNaN(parsed) ? 5 : parsed;
    }
  }

  return {
    name:      s(lead["Name"]),
    phone:     s(lead["Phone"]).replace(/\D/g, "").slice(-10),
    email:     s(lead["Email"]),
    score10:   Math.min(10, Math.max(1, score10)),
    riskLevel: riskLevel as ReportData["riskLevel"],
    categoryScores,
    doingRight: doingRight.slice(0, 4),
    riskAreas:  riskAreas.slice(0, 5),
    actions:    actions.slice(0, 5),
  };
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function riskStyle(level: string) {
  if (level?.includes("High"))   return { text: "text-red-400",     badge: "bg-red-400/10 border-red-400/30"     };
  if (level?.includes("Medium")) return { text: "text-amber-400",   badge: "bg-amber-400/10 border-amber-400/30" };
  return                                { text: "text-emerald-400", badge: "bg-emerald-400/10 border-emerald-400/30" };
}

function RiskIcon({ level, className }: { level: string; className?: string }) {
  if (level?.includes("High"))   return <ShieldAlert   className={cn("w-4 h-4", className)} />;
  if (level?.includes("Medium")) return <AlertTriangle className={cn("w-4 h-4", className)} />;
  return                                <ShieldCheck   className={cn("w-4 h-4", className)} />;
}

// ─── Admin Review UI ──────────────────────────────────────────────────────────

function AdminReview() {
  const [phone,       setPhone]       = useState("");
  const [searching,   setSearching]   = useState(false);
  const [lead,        setLead]        = useState<Lead | null>(null);
  const [searchErr,   setSearchErr]   = useState("");

  const [pdfBlobUrl,  setPdfBlobUrl]  = useState<string | null>(null);
  const [pdfLoading,  setPdfLoading]  = useState(false);
  const [pdfErr,      setPdfErr]      = useState("");
  const [showAnswers, setShowAnswers] = useState(true);

  const prevBlob = useRef<string | null>(null);
  useEffect(() => () => { if (prevBlob.current) URL.revokeObjectURL(prevBlob.current); }, []);

  async function fetchLead() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) { setSearchErr("Enter a valid 10-digit number"); return; }
    setSearching(true); setSearchErr(""); setLead(null); setPdfBlobUrl(null); setPdfErr("");
    try {
      const res  = await fetch(`/api/admin/lead?phone=${digits}`);
      const data = await res.json() as { ok: boolean; lead?: Lead; error?: string };
      if (!data.ok || !data.lead) { setSearchErr(data.error ?? "No lead found for that number"); }
      else { setLead(data.lead); setShowAnswers(true); }
    } catch { setSearchErr("Network error — check your connection and try again"); }
    finally { setSearching(false); }
  }

  async function generatePdf(currentLead: Lead) {
    setPdfLoading(true); setPdfErr("");
    if (prevBlob.current) { URL.revokeObjectURL(prevBlob.current); prevBlob.current = null; setPdfBlobUrl(null); }
    try {
      const res = await fetch("/api/report/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildReportPayload(currentLead)),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      prevBlob.current = url;
      setPdfBlobUrl(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[admin] PDF error:", msg);
      setPdfErr("PDF generation failed — " + msg);
    } finally { setPdfLoading(false); }
  }

  useEffect(() => { if (lead) generatePdf(lead); }, [lead]); // eslint-disable-line

  const riskLevel = s(lead?.["Risk Level"]);
  const style     = riskStyle(riskLevel);
  const safeName  = s(lead?.["Name"] || "report").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");

  return (
    <div className="admin-layout bg-[#111111] text-white min-h-screen">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <nav className="relative flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-white/40" />
          <span className="text-sm font-semibold tracking-tight">AgentPome</span>
        </div>
        <span className="text-[10px] text-white/20 bg-white/[0.04] border border-white/[0.06] px-3 py-1 rounded-full tracking-widest uppercase">
          Admin · Review
        </span>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 py-10 space-y-6">

        {/* Search */}
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">Client Risk Review</h1>
          <p className="text-white/25 text-sm mt-1 mb-6">Enter a phone number to pull the client assessment.</p>
          <div className="flex gap-2.5 flex-wrap">
            <div className="flex items-center h-12 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/30 text-sm font-mono shrink-0">
              +91
            </div>
            <input
              type="tel" inputMode="numeric" placeholder="9876543210"
              value={phone} maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && fetchLead()}
              className="flex-1 min-w-0 h-12 px-4 rounded-xl border border-white/[0.08] bg-white/[0.04]
                         text-white text-sm placeholder:text-white/15 outline-none
                         focus:border-white/20 focus:bg-white/[0.06] transition-colors font-mono"
            />
            <button onClick={fetchLead} disabled={searching}
              className="h-12 px-6 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90
                         disabled:opacity-40 active:scale-[0.98] transition-all flex items-center gap-2 shrink-0">
              {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" />Search</>}
            </button>
          </div>
          {searchErr && <p className="text-red-400 text-sm mt-3">{searchErr}</p>}
        </div>

        {lead && (
          <div className="space-y-4">

            {/* Top row: identity | category bars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Identity */}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{s(lead["Name"])}</p>
                    <p className="text-white/30 text-sm mt-0.5">{s(lead["Phone"])} · {s(lead["Email"])}</p>
                    <p className="text-white/15 text-xs mt-1">{s(lead["Timestamp (IST)"])}</p>
                    <div className="flex flex-col items-start gap-2 mt-3">
                      <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium", style.badge, style.text)}>
                        <RiskIcon level={riskLevel} />
                        {riskLevel}
                      </div>
                      <a
                        href={`https://wa.me/91${s(lead["Phone"]).replace(/\D/g, "").slice(-10)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in WhatsApp"
                        className="inline-flex items-center mt-3 justify-center w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white transition-all active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className={cn("text-5xl font-bold tabular-nums leading-none", style.text)}>
                        {s(lead["Score (/10)"] ?? "—").split("/")[0]}
                      </span>
                      <span className="text-white/20 text-xl">/10</span>
                    </div>
                    <p className="text-white/15 text-xs mt-1">{s(lead["Raw Score (/108)"])}</p>
                  </div>
                </div>
              </div>

              {/* Category bars */}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                <p className="text-[10px] text-white/20 uppercase tracking-widest mb-3">Risk by Category</p>
                <div className="space-y-2.5">
                  {CATEGORIES.map((cat) => {
                    const raw = lead[`${cat} %`];
                    let pct = 0;
                    if (raw != null) {
                      if (typeof raw === "number") { pct = Math.round(raw > 1 ? raw : raw * 100); }
                      else { const n = parseInt(String(raw).replace("%", ""), 10); pct = isNaN(n) ? 0 : n; }
                    }
                    const barColor = pct >= 70 ? "bg-red-400" : pct >= 40 ? "bg-amber-400" : "bg-emerald-400";
                    const txtColor = pct >= 70 ? "text-red-400/60" : pct >= 40 ? "text-amber-400/60" : "text-emerald-400/60";
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-xs text-white/30 w-36 shrink-0">{cat}</span>
                        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-700", barColor)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={cn("text-xs tabular-nums w-9 text-right font-mono", txtColor)}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom row: PDF | Q&A side by side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">

              {/* PDF Viewer */}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                  <span className="text-sm text-white/60 font-medium">PDF Report</span>
                  <div className="flex items-center gap-2">
                    {pdfLoading && (
                      <span className="flex items-center gap-1.5 text-xs text-white/20">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Generating...
                      </span>
                    )}
                    {pdfErr && !pdfLoading && (
                      <span className="text-xs text-red-400/70 max-w-[160px] truncate">{pdfErr}</span>
                    )}
                    {pdfBlobUrl && (
                      <a href={pdfBlobUrl} download={`AgentPome_Risk_Report_${safeName}.pdf`}
                        className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/60
                                   border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
                        <Download className="w-3 h-3" /> Download
                      </a>
                    )}
                    <button onClick={() => generatePdf(lead)} disabled={pdfLoading} title="Regenerate"
                      className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all disabled:opacity-30">
                      <RefreshCw className={cn("w-3.5 h-3.5", pdfLoading && "animate-spin")} />
                    </button>
                  </div>
                </div>

                {pdfLoading && !pdfBlobUrl && (
                  <div className="flex items-center justify-center gap-2 h-64 text-white/20 text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Building report...
                  </div>
                )}
                {pdfBlobUrl && (
                  <iframe src={pdfBlobUrl} title="Risk Report" className="w-full border-none" style={{ height: "860px" }} />
                )}
                {!pdfLoading && !pdfBlobUrl && pdfErr && (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <p className="text-white/25 text-sm text-center max-w-xs">{pdfErr}</p>
                    <button onClick={() => generatePdf(lead)} className="text-xs text-white/35 hover:text-white/60 underline">Try again</button>
                  </div>
                )}
              </div>

              {/* Q&A answers */}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                <button onClick={() => setShowAnswers((p) => !p)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm font-medium text-white/60">All 18 Answers</span>
                  {showAnswers ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                </button>

                {showAnswers && (
                  <div className="border-t border-white/[0.06] px-5 py-5 space-y-4 overflow-y-auto" style={{ maxHeight: "820px" }}>
                    {Q_HEADERS.map(([num, header]) => {
                      const answer = s(lead[header]);
                      const rule   = INSIGHT_RULES.find((r) => r.qNum === num);
                      const cls    = rule ? classifyAnswer(answer, rule) : "neutral";
                      return (
                        <div key={header} className="flex items-start gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold",
                            cls === "bad"  ? "bg-red-400/15 text-red-400"        :
                            cls === "good" ? "bg-emerald-400/15 text-emerald-400" :
                                             "bg-white/[0.06] text-white/20"
                          )}>
                            {num}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-white/20 mb-0.5 leading-snug">
                              {header.split(": ").slice(1).join(": ")}
                            </p>
                            <p className={cn(
                              "text-sm leading-snug",
                              cls === "bad"  ? "text-red-300/75"       :
                              cls === "good" ? "text-emerald-300/75"   :
                                               "text-white/65"
                            )}>
                              {answer || <span className="text-white/15 italic">—</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      <footer className="relative border-t border-white/[0.05] py-5 mt-16 text-center">
        <p className="text-[10px] text-white/10 tracking-widest uppercase">AgentPome · Admin · Restricted Access</p>
      </footer>
    </div>
  );
}

export default function AdminReviewPage() {
  return <AdminReview />;
}