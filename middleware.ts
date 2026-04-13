import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login endpoint must be publicly reachable — never intercept it
  if (pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const session = req.cookies.get("admin_session")?.value;
  const valid   = !!session && session === process.env.ADMIN_SESSION_SECRET;

  // Protect /admin/* pages (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !valid) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Protect admin API routes
  if (
    (pathname.startsWith("/api/admin") || pathname === "/api/report/admin") &&
    !valid
  ) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/report/admin"],
};