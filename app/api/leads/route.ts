import { NextRequest, NextResponse } from "next/server";

// ─── Question metadata ────────────────────────────────────────────────────────

const QUESTION_META = [
  { id: "q1",  short: "Clicks unverified links"       },
  { id: "q2",  short: "Shares personal details"       },
  { id: "q3",  short: "Uses public WiFi for payments" },
  { id: "q4",  short: "Reuses passwords"              },
  { id: "q5",  short: "2FA on email"                  },
  { id: "q6",  short: "Checks data breach status"     },
  { id: "q7",  short: "Updates OS/apps"               },
  { id: "q8",  short: "Installs unverified apps"      },
  { id: "q9",  short: "Phone screen lock"             },
  { id: "q10", short: "Responds to bank scam calls"   },
  { id: "q11", short: "Monitors bank/UPI statements"  },
  { id: "q12", short: "Accepts unknown UPI collects"  },
  { id: "q13", short: "Social media visibility"       },
  { id: "q14", short: "Posted personal info publicly" },
  { id: "q15", short: "Clicked prize/lottery links"   },
  { id: "q16", short: "Responds to SIM block scam"    },
  { id: "q17", short: "Lost money to scam"            },
  { id: "q18", short: "Knows account recovery steps"  },
];

const CATEGORIES = [
  "Online Behaviour",
  "Account Security",
  "Device Security",
  "Financial Exposure",
  "Social Media",
  "Scam Vulnerability",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeadPayload {
  name:           string;
  phone:          string;
  email:          string;
  score:          number;                       // raw 0–108
  score10:        number;                       // mapped 1–10
  riskLevel:      string;
  answers:        Record<string, number>;       // { q1: 4, ... }
  answerLabels:   Record<string, string>;       // { q1: "Sometimes...", ... }
  categoryScores: Record<string, number>;       // { "Online Behaviour": 0.6, ... }
  submittedAt:    string;                       // ISO string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function istTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function riskEmoji(level: string) {
  return level === "High Risk" ? "🔴" : level === "Medium Risk" ? "🟡" : "🟢";
}

// ─── 1. TELEGRAM ─────────────────────────────────────────────────────────────

async function sendTelegram(lead: LeadPayload) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[Telegram] env vars not set — skipping");
    return { ok: false, skipped: true };
  }

  const catLines = CATEGORIES.map((cat) => {
    const frac  = lead.categoryScores[cat] ?? 0;
    const pct   = Math.round(frac * 100);
    const emoji = frac < 0.4 ? "🟢" : frac < 0.7 ? "🟡" : "🔴";
    return `${emoji} ${cat}: ${pct}%`;
  }).join("\n");

  const riskyAnswers = QUESTION_META
    .filter((q) => (lead.answers[q.id] ?? 0) >= 4)
    .map((q) => `• ${q.short}: _${lead.answerLabels[q.id] ?? "—"}_`)
    .join("\n");

  const message = [
    `${riskEmoji(lead.riskLevel)} *New KYR Lead — AgentPome*`,
    ``,
    `👤 *Name:* ${lead.name}`,
    `📱 *Phone:* +91 ${lead.phone}`,
    `📧 *Email:* ${lead.email}`,
    `🕐 *Time:* ${istTime(lead.submittedAt)}`,
    ``,
    `📊 *Risk Score:* ${lead.score10}/10  _(raw ${lead.score}/108)_`,
    `⚠️ *Risk Level:* ${lead.riskLevel}`,
    ``,
    `*Category Breakdown:*`,
    catLines,
    ...(riskyAnswers ? [``, `*High-Risk Answers:*`, riskyAnswers] : []),
  ].join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
  });

  return res.json();
}

// ─── 2. GOOGLE SHEETS (via Apps Script webhook) ───────────────────────────────
//
// No service accounts. No OAuth. No private keys.
// Just one URL from your deployed Apps Script web app.
//
// Setup:
//   1. Open the file: agentpome-kyr-sheets-script.gs
//   2. In Google Sheets: Extensions → Apps Script → paste → Save
//   3. Run setupHeaders() once
//   4. Deploy → New deployment → Web App → Execute as: Me → Anyone → Deploy
//   5. Copy the URL → paste as GOOGLE_SHEETS_WEBHOOK_URL in .env.local

async function sendToSheets(lead: LeadPayload) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[Sheets] GOOGLE_SHEETS_WEBHOOK_URL not set — skipping");
    return { ok: false, skipped: true };
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Send everything — the Apps Script extracts what it needs
    body: JSON.stringify({
      name:           lead.name,
      phone:          lead.phone,
      email:          lead.email,
      score:          lead.score,
      score10:        lead.score10,
      riskLevel:      lead.riskLevel,
      categoryScores: lead.categoryScores,
      answerLabels:   lead.answerLabels,
      submittedAt:    lead.submittedAt,
      // Optional secret — set SECRET_TOKEN in the Apps Script to match
      token: process.env.SHEETS_WEBHOOK_SECRET ?? "",
    }),
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: res.ok, raw: text };
  }
}

// ─── 3. SUPABASE ─────────────────────────────────────────────────────────────
//
// Run this SQL in Supabase SQL Editor once, then fill env vars:
//
// create table kyr_leads (
//   id                     uuid primary key default gen_random_uuid(),
//   submitted_at           timestamptz not null,
//   name                   text not null,
//   phone                  text not null,
//   email                  text not null,
//   score10                integer not null,
//   score_raw              integer not null,
//   risk_level             text not null,
//   cat_online_behaviour   numeric(4,2),
//   cat_account_security   numeric(4,2),
//   cat_device_security    numeric(4,2),
//   cat_financial_exposure numeric(4,2),
//   cat_social_media       numeric(4,2),
//   cat_scam_vulnerability numeric(4,2),
//   q1  text, q2  text, q3  text, q4  text, q5  text, q6  text,
//   q7  text, q8  text, q9  text, q10 text, q11 text, q12 text,
//   q13 text, q14 text, q15 text, q16 text, q17 text, q18 text,
//   answers_raw            jsonb,
//   created_at             timestamptz default now()
// );
//
// Export CSV: Supabase dashboard → Table Editor → kyr_leads → ⋮ → Export CSV

async function saveToSupabase(lead: LeadPayload) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[Supabase] env vars not set — skipping");
    return { ok: false, skipped: true };
  }

  const cs = lead.categoryScores;
  const qCols: Record<string, string> = {};
  QUESTION_META.forEach((q) => { qCols[q.id] = lead.answerLabels[q.id] ?? ""; });

  const res = await fetch(`${url}/rest/v1/kyr_leads`, {
    method: "POST",
    headers: {
      apikey:         key,
      Authorization:  `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer:         "return=minimal",
    },
    body: JSON.stringify({
      submitted_at:            lead.submittedAt,
      name:                    lead.name,
      phone:                   lead.phone,
      email:                   lead.email,
      score10:                 lead.score10,
      score_raw:               lead.score,
      risk_level:              lead.riskLevel,
      cat_online_behaviour:    cs["Online Behaviour"]   ?? 0,
      cat_account_security:    cs["Account Security"]   ?? 0,
      cat_device_security:     cs["Device Security"]    ?? 0,
      cat_financial_exposure:  cs["Financial Exposure"] ?? 0,
      cat_social_media:        cs["Social Media"]       ?? 0,
      cat_scam_vulnerability:  cs["Scam Vulnerability"] ?? 0,
      ...qCols,
      answers_raw: lead.answers,
    }),
  });

  return { ok: res.ok, status: res.status };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadPayload;

    if (!body.name || !body.phone || !body.email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // All three run in parallel — failure in one never blocks the others
    const [telegramResult, sheetsResult, supabaseResult] = await Promise.allSettled([
      sendTelegram(body),
      sendToSheets(body),
      saveToSupabase(body),
    ]);

    const results = {
      telegram: telegramResult.status === "fulfilled"
        ? telegramResult.value
        : { ok: false, error: (telegramResult.reason as Error)?.message },
      sheets: sheetsResult.status === "fulfilled"
        ? sheetsResult.value
        : { ok: false, error: (sheetsResult.reason as Error)?.message },
      supabase: supabaseResult.status === "fulfilled"
        ? supabaseResult.value
        : { ok: false, error: (supabaseResult.reason as Error)?.message },
    };

    console.log("[/api/leads]", {
      name: body.name, score10: body.score10, riskLevel: body.riskLevel, results,
    });

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/leads] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
