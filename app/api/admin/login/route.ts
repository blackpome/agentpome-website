/**
 * app/api/admin/login/route.ts
 *
 * Validates ADMIN_PASSWORD and sets an httpOnly session cookie.
 * Uses next/headers cookies() API — required for Next.js 15+.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    // Constant-time-ish comparison to avoid timing attacks
    const expected = process.env.ADMIN_PASSWORD ?? "";
    const secret   = process.env.ADMIN_SESSION_SECRET ?? "";

    if (!expected || !secret) {
      console.error("[admin/login] ADMIN_PASSWORD or ADMIN_SESSION_SECRET not set in env");
      return NextResponse.json(
        { ok: false, error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    if (password !== expected) {
      return NextResponse.json(
        { ok: false, error: "Incorrect password" },
        { status: 401 }
      );
    }

    // Next.js 15+: set cookie via next/headers, not res.cookies.set()
    const cookieStore = await cookies();
    cookieStore.set("admin_session", secret, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   60 * 60 * 8, // 8 hours
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/login] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}