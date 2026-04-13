/**
 * AgentPome KYR — Google Apps Script
 * ─────────────────────────────────────────────────────────
 * SETUP (one-time):
 *  1. sheets.google.com → new sheet → rename tab "Leads"
 *  2. Extensions → Apps Script → paste this file → Save
 *  3. Run → setupHeaders  (once — creates styled header row)
 *  4. Deploy → New deployment → Web App
 *       Execute as: Me
 *       Who has access: Anyone
 *  5. Copy the Web App URL → GOOGLE_SHEETS_WEBHOOK_URL in .env.local
 *
 * Endpoints:
 *   POST  → save lead (called by /api/leads)
 *   GET   ?action=lead&phone=XXXXXXXXXX&token=TOKEN → fetch lead for admin
 *   GET   (no params) → health check
 */

// ── Config — fill these before deploying ─────────────────────────────────────
var SHEET_NAME   = "Leads";
var SECRET_TOKEN = "agentpome_sheets_secret_2026"; // POST guard  — match SHEETS_WEBHOOK_SECRET in .env.local
var ADMIN_TOKEN  = "agentpome_review_token_2026"; // GET guard   — match ADMIN_REVIEW_TOKEN    in .env.local

// ── Schema ────────────────────────────────────────────────────────────────────

var HEADERS = [
  "Timestamp (IST)",        // A 1
  "Name",                   // B 2
  "Phone",                  // C 3
  "Email",                  // D 4
  "Score (/10)",            // E 5
  "Raw Score (/108)",       // F 6
  "Risk Level",             // G 7
  "Online Behaviour %",     // H 8
  "Account Security %",     // I 9
  "Device Security %",      // J 10
  "Financial Exposure %",   // K 11
  "Social Media %",         // L 12
  "Scam Vulnerability %",   // M 13
  // Q14 onward: individual answers
  "Q1: Free Jio recharge link in family WhatsApp group",
  "Q2: KYC expired SMS — click to update or account blocked",
  "Q3: GPay payment at café — public WiFi available",
  "Q4: Gmail / Instagram / bank app — same or different passwords",
  "Q5: Could someone log into Gmail with just your password?",
  "Q6: How do you check if your data was leaked in a breach?",
  "Q7: Phone shows pending software update — what happens?",
  "Q8: APK file sent on WhatsApp — better than Play Store version",
  "Q9: Someone picks up your phone while you step away",
  "Q10: SBI fraud team calls — share OTP to block transaction",
  "Q11: How often do you check bank / UPI transaction history?",
  "Q12: GPay collect request from unknown — ₹10 scratch card",
  "Q13: Can a stranger see your phone number / city on Instagram?",
  "Q14: Instagram DM — brand wants to collaborate, send Aadhaar",
  "Q15: Call — won KBC ₹25 lakh prize, pay ₹5000 to claim",
  "Q16: Message — Aadhaar used for suspicious account, face arrest",
  "Q17: What is the national cyber fraud helpline number?",
  "Q18: Money disappeared from account — what do you do next?",
];

var CATEGORIES = [
  "Online Behaviour", "Account Security", "Device Security",
  "Financial Exposure", "Social Media", "Scam Vulnerability",
];

var Q_IDS = [
  "q1","q2","q3","q4","q5","q6",
  "q7","q8","q9","q10","q11","q12",
  "q13","q14","q15","q16","q17","q18",
];

// ── One-time setup ────────────────────────────────────────────────────────────

function setupHeaders() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getRange(1,1).getValue() !== "") {
    Logger.log("Headers exist — delete row 1 to re-run.");
    return;
  }

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1,1,1,7).setBackground("#111").setFontColor("#fff").setFontWeight("bold").setFontSize(9);
  sheet.getRange(1,8,1,6).setBackground("#0d1f0d").setFontColor("#4ade80").setFontWeight("bold").setFontSize(9);
  sheet.getRange(1,14,1,18).setBackground("#0d0d1f").setFontColor("#93c5fd").setFontWeight("bold").setFontSize(9);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4);
  sheet.autoResizeColumns(1, HEADERS.length);
  
  // Set score columns to text format from the start
  sheet.getRange(2, 5, sheet.getMaxRows() - 1, 1).setNumberFormat("@");  // Score (/10)
  sheet.getRange(2, 6, sheet.getMaxRows() - 1, 1).setNumberFormat("@");  // Raw Score (/108)
  
  Logger.log("Done — " + HEADERS.length + " columns.");
}

// ── doPost: receive & store lead ──────────────────────────────────────────────

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (SECRET_TOKEN && data.token !== SECRET_TOKEN)
      return respond({ ok: false, error: "Unauthorized" });

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) setupHeaders();

    var ts        = new Date(data.submittedAt || new Date().toISOString());
    var timestamp = Utilities.formatDate(ts, "Asia/Kolkata", "dd MMM yyyy, hh:mm a");

    var catCols = CATEGORIES.map(function(cat) {
      var frac = (data.categoryScores && data.categoryScores[cat]) || 0;
      return Math.round(frac * 100) + "%";
    });

    var answerCols = Q_IDS.map(function(qid) {
      return (data.answerLabels && data.answerLabels[qid]) || "";
    });

    // Format scores as text to prevent date conversion
    var score10Str = (data.score10 || 0) + "/10";
    var score108Str = (data.score || 0) + "/108";

    var row = [
      timestamp,
      data.name      || "",
      "+91" + (data.phone || ""),
      data.email     || "",
      score10Str,
      score108Str,
      data.riskLevel || "",
    ].concat(catCols).concat(answerCols);

    sheet.appendRow(row);
    var lr = sheet.getLastRow();

    // Force score columns to text format to prevent date conversion
    sheet.getRange(lr, 5).setNumberFormat("@");  // Score (/10)
    sheet.getRange(lr, 6).setNumberFormat("@");  // Raw Score (/108)

    // Colour: risk level cell
    var rc = sheet.getRange(lr, 7);
    if      (data.riskLevel === "High Risk")   rc.setBackground("#f87171").setFontColor("#fff").setFontWeight("bold");
    else if (data.riskLevel === "Medium Risk") rc.setBackground("#fbbf24").setFontColor("#000").setFontWeight("bold");
    else                                       rc.setBackground("#4ade80").setFontColor("#000").setFontWeight("bold");

    // Colour: category %
    CATEGORIES.forEach(function(cat, i) {
      var frac = (data.categoryScores && data.categoryScores[cat]) || 0;
      var c    = sheet.getRange(lr, 8 + i);
      if      (frac >= 0.7) c.setBackground("#fde8e8").setFontColor("#b91c1c");
      else if (frac >= 0.4) c.setBackground("#fef9e7").setFontColor("#92400e");
      else                  c.setBackground("#f0fdf4").setFontColor("#166534");
    });

    // Colour: score
    var sc = sheet.getRange(lr, 5);
    if      (data.riskLevel === "High Risk")   sc.setFontColor("#b91c1c").setFontWeight("bold");
    else if (data.riskLevel === "Medium Risk") sc.setFontColor("#92400e").setFontWeight("bold");
    else                                       sc.setFontColor("#166534").setFontWeight("bold");

    return respond({ ok: true, row: lr });
  } catch (err) {
    Logger.log("doPost: " + err);
    return respond({ ok: false, error: err.toString() });
  }
}

// ── doGet: health check or lead lookup ───────────────────────────────────────

function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};

  if (!p.action)
    return respond({ ok: true, service: "AgentPome KYR", status: "live" });

  if (p.action === "lead") {
    if (ADMIN_TOKEN && p.token !== ADMIN_TOKEN)
      return respond({ ok: false, error: "Unauthorized" });

    var phone = (p.phone || "").replace(/\D/g, "");
    if (!phone) return respond({ ok: false, error: "Phone required" });

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return respond({ ok: false, error: "Sheet not found" });

    var rows    = sheet.getDataRange().getValues();
    var headers = rows[0];

    for (var i = 1; i < rows.length; i++) {
      var rp = String(rows[i][2]).replace(/\D/g, ""); // col C, strip "+91"
      if (rp.endsWith(phone)) {
        var lead = {};
        headers.forEach(function(h, j) {
          var val = rows[i][j];
          // Only convert Date objects to IST string for the Timestamp column (index 0)
          // All other Date objects are mistakes (like score converted to date) - keep as raw value
          if (val instanceof Date && j === 0) {
            lead[h] = Utilities.formatDate(val, "Asia/Kolkata", "dd MMM yyyy, hh:mm a");
          } else if (val instanceof Date) {
            // Score was mistakenly stored as date - convert back to intended format
            // For columns 4 and 5 (Score /10 and Raw Score /108), extract the value
            if (j === 4) {
              // Score (/10) - if it's a date, it's wrong, just return as string
              lead[h] = String(val);
            } else if (j === 5) {
              // Raw Score (/108)
              lead[h] = String(val);
            } else {
              lead[h] = String(val);
            }
          } else {
            lead[h] = val;
          }
        });
        return respond({ ok: true, lead: lead });
      }
    }
    return respond({ ok: false, error: "No lead found for that number" });
  }

  return respond({ ok: false, error: "Unknown action" });
}

// ── Util ──────────────────────────────────────────────────────────────────────

function respond(obj) {
  var out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}