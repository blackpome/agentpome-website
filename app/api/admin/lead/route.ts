/**
 * app/api/admin/lead/route.ts
 *
 * Server-side proxy for admin phone lookup.
 * Auth is handled entirely by middleware.ts (admin_session cookie).
 * By the time a request reaches here, the middleware has already verified it.
 *
 * Request:  GET /api/admin/lead?phone=9876543210
 * Response: { ok: true,  lead: { "Name": "...", ... } }
 *        or { ok: false, error: "..." }
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone") ?? "";
  if (!/^\d{10}$/.test(phone)) {
    return NextResponse.json(
      { ok: false, error: "Valid 10-digit phone required" },
      { status: 400 }
    );
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const adminToken = process.env.ADMIN_REVIEW_TOKEN ?? "";

  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, error: "Webhook not configured" },
      { status: 500 }
    );
  }

  try {
    const params = new URLSearchParams({ action: "lead", phone });
    if (adminToken) params.set("token", adminToken);

    const res  = await fetch(`${webhookUrl}?${params.toString()}`);
    const data = await res.json() as { ok: boolean; lead?: Record<string, string>; error?: string };
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/admin/lead] fetch error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to reach data source" },
      { status: 502 }
    );
  }
}