import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Site-wide password gate — protects all pages until SITE_PASSWORD env var
// is set to "" (empty) or removed to open the site to the public.
//
// How it works:
//   1. Any request that doesn't have a valid `wtl_auth` cookie is redirected
//      to /password (the gate page).
//   2. /password POSTs to /api/auth/password which sets the cookie on match.
//   3. API routes (/api/*) are never blocked — needed for the auth POST itself.
//   4. Static assets (_next/*, public/*) are never blocked.
//
// To DISABLE: set SITE_PASSWORD="" in Vercel env vars (empty string = open).
// To ENABLE:  set SITE_PASSWORD=<your secret> in Vercel env vars.
// ---------------------------------------------------------------------------

const COOKIE_NAME = "wtl_auth";
const GATE_PATH = "/password";

export function middleware(req: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;

  // If no password is set (or it's empty), the site is fully open
  if (!sitePassword) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  // Always allow: API routes, the gate page itself, Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname === GATE_PATH
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = req.cookies.get(COOKIE_NAME);
  if (authCookie?.value === sitePassword) {
    return NextResponse.next();
  }

  // Redirect to password gate, preserving the intended destination
  const gateUrl = req.nextUrl.clone();
  gateUrl.pathname = GATE_PATH;
  gateUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(gateUrl);
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.webp$).*)",
  ],
};
