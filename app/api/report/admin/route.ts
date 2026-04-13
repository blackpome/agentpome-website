/**
 * app/api/report/admin/route.ts
 *
 * Generates a PDF report on demand for the admin review page.
 * Auth is handled entirely by middleware.ts (admin_session cookie).
 * Returns PDF as inline so it renders directly in the iframe.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateReport, ReportData } from "@/lib/generate-report";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReportData;

    const { name, score10, riskLevel } = body;
    if (!name || score10 === undefined || !riskLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pdfBytes = await generateReport(body);
    const safeName = name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `inline; filename="AgentPome_Risk_Report_${safeName}.pdf"`,
        "Content-Length":      pdfBytes.length.toString(),
        "Cache-Control":       "no-store",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/report/admin] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}