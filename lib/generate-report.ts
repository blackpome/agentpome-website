/**
 * AgentPome — Personal Cyber Risk Report
 * Pure pdf-lib. No Python. Vercel-compatible.
 *
 * Header coordinate plan (H=842, PAD=36):
 *   797 — tiny label baseline   (cap top ≈ 802)
 *   761 — name baseline         (cap top = 780)
 *   748 — score number baseline (cap top = 780) ← same visual top as name
 *   767 — '/10' baseline        (cap top = 780)
 *   735 — subtitle / badge row
 *   715 — divider
 *   700 — spectrum bar top
 *   681 — spectrum labels
 *   671 — body divider → body sections flow down from here
 */

import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, RGB } from "pdf-lib";

// ─── Public types ──────────────────────────────────────────────────────────────

export interface ReportData {
  name: string;
  phone?: string;
  email?: string;
  score10: number;           // 1–10
  riskLevel: "Low Risk" | "Medium Risk" | "High Risk";
  categoryScores: Record<string, number>; // 0–1
  doingRight: string[];
  riskAreas:  string[];
  actions:    string[];
}

// ─── Palette ───────────────────────────────────────────────────────────────────

const hex = (h: string): RGB => {
  const n = parseInt(h.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const C = {
  bg:     hex("#1a1a1a"),
  srf2:   hex("#2e2e2e"),
  border: hex("#383838"),
  white:  hex("#ffffff"),
  w70:    hex("#b3b3b3"),
  w50:    hex("#808080"),
  green:  hex("#4ade80"),
  amber:  hex("#fbbf24"),
  red:    hex("#f87171"),
  black:  hex("#000000"),
};

const RISK_CLR: Record<string, RGB> = {
  "Low Risk":    C.green,
  "Medium Risk": C.amber,
  "High Risk":   C.red,
};

const CATEGORIES = [
  "Online Behaviour",
  "Account Security",
  "Device Security",
  "Financial Exposure",
  "Social Media",
  "Scam Vulnerability",
];

const BAR_COLORS = [
  "#22c55e","#22c55e","#22c55e",
  "#f59e0b","#f59e0b",
  "#f97316","#ef4444","#ef4444",
  "#323232","#323232",
];

// ─── Drawing primitives ────────────────────────────────────────────────────────

function fillRect(p: PDFPage, x: number, y: number, w: number, h: number, color: RGB) {
  p.drawRectangle({ x, y, width: w, height: h, color });
}

function circle(p: PDFPage, cx: number, cy: number, r: number, color: RGB) {
  p.drawEllipse({ x: cx, y: cy, xScale: r, yScale: r, color });
}

function hline(p: PDFPage, y: number, x1 = 36, x2 = 559) {
  p.drawLine({ start: { x: x1, y }, end: { x: x2, y }, color: C.border, thickness: 0.5 });
}

function txt(
  p: PDFPage, s: string, x: number, y: number,
  size: number, font: PDFFont, color: RGB = C.white, maxW?: number
) {
  if (!s) return;
  let v = s;
  if (maxW) {
    while (v.length > 2 && font.widthOfTextAtSize(v, size) > maxW) v = v.slice(0, -1);
    if (v !== s) v = v.slice(0, -1) + "...";
  }
  p.drawText(v, { x, y, size, font, color });
}

function txtR(p: PDFPage, s: string, rightX: number, y: number, size: number, font: PDFFont, color: RGB = C.white) {
  txt(p, s, rightX - font.widthOfTextAtSize(s, size), y, size, font, color);
}

function txtC(p: PDFPage, s: string, cx: number, y: number, size: number, font: PDFFont, color: RGB = C.white) {
  txt(p, s, cx - font.widthOfTextAtSize(s, size) / 2, y, size, font, color);
}

function sLabel(p: PDFPage, s: string, y: number, bold: PDFFont) {
  txt(p, s, 36, y, 6.5, bold, C.w50);
}


// ─── Text sanitiser ────────────────────────────────────────────────────────────
// pdf-lib StandardFonts use WinAnsi (Latin-1) encoding.
// Any char outside that range throws "WinAnsi cannot encode".
// Map the common offenders to safe ASCII equivalents, then strip the rest.

const CHAR_MAP: Record<string, string> = {
  "→": "->",   // →
  "←": "<-",  // ←
  "•": "-",   // •
  "–": "-",   // en dash
  "—": "--",  // em dash
  "‘": "'",   // left single quote
  "’": "'",   // right single quote
  "“": '"',   // left double quote
  "”": '"',   // right double quote
  "₹": "Rs.", // ₹  (rupee sign)
  "…": "...", // …
  "·": ".",   // middle dot ·
  "×": "x",   // ×
  "é": "e",   // é
  "à": "a",   // à
  "è": "e",   // è
};

function san(input: string): string {
  if (!input) return "";
  let out = "";
  for (const ch of input) {
    if (CHAR_MAP[ch]) {
      out += CHAR_MAP[ch];
    } else if (ch.charCodeAt(0) > 255) {
      // Drop anything else outside Latin-1
      out += "?";
    } else {
      out += ch;
    }
  }
  return out;
}

// ─── Generator ────────────────────────────────────────────────────────────────

export async function generateReport(data: ReportData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  const W = 595, H = 842, PAD = 36, CW = W - PAD * 2;

  const page = doc.addPage([W, H]);
  const reg    = await doc.embedFont(StandardFonts.Helvetica);
  const bold   = await doc.embedFont(StandardFonts.HelveticaBold);

  // ── Background ──────────────────────────────────────────────────────────────
  fillRect(page, 0, 0, W, H, C.bg);

  // ════════════════════════════════════════════════════════════════════════════
  // HEADER  (fixed absolute Y coords — no overlap possible)
  // ════════════════════════════════════════════════════════════════════════════

  // Row 1 — tiny labels  (baseline 797, cap top ≈ 802)
  txt(page,  "PERSONAL  CYBER  RISK  REPORT", PAD,      797, 6.5, bold, C.w50);
  txtR(page, "Risk  score",                   W - PAD,  797, 6.5, bold, C.w50);

  // Row 2 — Name (size 26, baseline 761) + Score (size 44, baseline 748)
  //          Both have cap-top = 780, so they appear visually top-aligned.
  txt(page, san(data.name), PAD, 761, 26, bold, C.white);

  const scoreStr = String(data.score10);
  const scoreW   = bold.widthOfTextAtSize(scoreStr, 44);
  const slashW   = reg.widthOfTextAtSize("/10", 18);
  const scoreX   = W - PAD - scoreW - slashW - 4;
  txt(page,  scoreStr, scoreX,             748, 44, bold, RISK_CLR[data.riskLevel]);
  txt(page,  "/10",    scoreX + scoreW + 3, 767, 18, reg,  C.w50);

  // Row 3 — subtitle (phone + email) + risk badge  (y=735)
  const sub = [data.phone ? `+91 ${data.phone}` : "", data.email ?? ""]
    .filter(Boolean).join("   ·   ");
  txt(page, san(sub), PAD, 735, 8.5, reg, C.w50);

  const rColor   = RISK_CLR[data.riskLevel];
  const badgeTxt = data.riskLevel.toUpperCase();
  const badgeTW  = bold.widthOfTextAtSize(badgeTxt, 7.5);
  const badgeW   = badgeTW + 22;
  const badgeX   = W - PAD - badgeW;
  const badgeY   = 728;  // bottom of 18px badge → top at 746, centre at 737 ≈ row 3
  fillRect(page, badgeX, badgeY, badgeW, 18, rColor);
  txt(page, badgeTxt,
    badgeX + (badgeW - badgeTW) / 2, badgeY + 5.5,
    7.5, bold,
    data.riskLevel === "High Risk" ? C.white : C.black
  );

  // Divider below header
  hline(page, 715);

  // ── Spectrum bar  (bar top = 700, height 9) ─────────────────────────────────
  const barY   = 700;
  const bwEach = (CW - 9 * 4) / 10;
  for (let i = 0; i < 10; i++) {
    const col = i < data.score10 ? hex(BAR_COLORS[i]) : C.srf2;
    fillRect(page, PAD + i * (bwEach + 4), barY, bwEach, 9, col);
  }
  txt(page,  "Low risk",   PAD,     barY - 13, 6.5, reg, C.w50);
  txtC(page, "Medium risk", W / 2,  barY - 13, 6.5, reg, C.w50);
  txtR(page, "High risk",  W - PAD, barY - 13, 6.5, reg, C.w50);

  // Body starts here, flowing downward
  let y = barY - 30;   // ≈ 670
  hline(page, y);
  y -= 16;

  // ════════════════════════════════════════════════════════════════════════════
  // BODY  (y cursor flows downward)
  // ════════════════════════════════════════════════════════════════════════════

  // ── Doing right ─────────────────────────────────────────────────────────────
  if (data.doingRight.length > 0) {
    sLabel(page, "WHAT YOU'RE DOING RIGHT", y, bold);
    y -= 14;
    for (const item of data.doingRight.slice(0, 4)) {
      circle(page, PAD + 5, y - 1, 3, C.green);
      txt(page, san(item), PAD + 16, y - 4, 8.5, reg, C.w70, CW - 24);
      y -= 14;
    }
    y -= 6;
    hline(page, y);
    y -= 16;
  }

  // ── Risk areas ──────────────────────────────────────────────────────────────
  if (data.riskAreas.length > 0) {
    sLabel(page, "RISK AREAS FOUND", y, bold);
    y -= 14;
    for (const item of data.riskAreas.slice(0, 5)) {
      circle(page, PAD + 5, y - 1, 3, C.red);
      txt(page, san(item), PAD + 16, y - 4, 8.5, reg, C.w70, CW - 24);
      y -= 14;
    }
    y -= 6;
    hline(page, y);
    y -= 16;
  }

  // ── Actions ─────────────────────────────────────────────────────────────────
  if (data.actions.length > 0) {
    sLabel(page, "WHAT NEEDS ATTENTION", y, bold);
    y -= 14;
    data.actions.slice(0, 5).forEach((action, i) => {
      fillRect(page, PAD, y - 17, 20, 19, C.srf2);
      txtC(page, String(i + 1), PAD + 10, y - 11, 8, bold, C.w70);
      txt(page, san(action), PAD + 26, y - 11, 8.5, reg, C.w70, CW - 32);
      y -= 23;
    });
    y -= 4;
    hline(page, y);
    y -= 16;
  }

  // ── Categories ──────────────────────────────────────────────────────────────
  sLabel(page, "RISK BY CATEGORY", y, bold);
  y -= 14;

  for (const cat of CATEGORIES) {
    const frac   = Math.min(1, Math.max(0, data.categoryScores[cat] ?? 0));
    const pts    = Math.round(frac * 18);
    const barCol = frac < 0.4 ? C.green : frac < 0.7 ? C.amber : C.red;

    txt(page, cat, PAD, y - 3, 8, reg, C.w50);
    fillRect(page, PAD,      y - 13, CW,                    7, C.srf2);
    fillRect(page, PAD,      y - 13, Math.max(10, CW * frac), 7, barCol);
    txtR(page, `${pts}/18`, W - PAD, y - 9, 7, reg, C.w50);
    y -= 22;
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  hline(page, 30);
  txt(page,  "AgentPome  ·  Personal Cybersecurity  ·  agentpome.com", PAD,     19, 7, reg, C.w50);
  txtR(page, "Confidential — For Recipient Only",                        W - PAD, 19, 7, reg, C.w50);

  return doc.save();
}