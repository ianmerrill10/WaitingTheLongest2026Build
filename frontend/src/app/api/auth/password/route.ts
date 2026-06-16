import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// POST /api/auth/password
// Validates the site preview password and sets the auth cookie.
// ---------------------------------------------------------------------------

const COOKIE_NAME = "wtl_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;

  // If no password configured, always allow
  if (!sitePassword) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, "", { maxAge: COOKIE_MAX_AGE, path: "/" });
    return res;
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.password !== sitePassword) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, sitePassword, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
