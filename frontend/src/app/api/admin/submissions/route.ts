import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Admin Submissions API
//
// GET  /api/admin/submissions?status=pending  — list submissions
// POST /api/admin/submissions                 — approve or reject a submission
//
// Protected by ADMIN_SECRET env var (simple bearer token).
// Full NextAuth replaced by this env-var gate until auth is added.
// ---------------------------------------------------------------------------

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false; // lock down if env var not set
  const auth = req.headers.get("x-admin-secret") ?? req.nextUrl.searchParams.get("secret");
  return auth === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status") ?? "pending";
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("dog_submissions")
    .select("*")
    .eq("status", status)
    .order("submitted_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data, count: data.length });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id: string; action: "approve" | "reject"; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id || !["approve", "reject"].includes(body.action)) {
    return NextResponse.json({ error: "id and action (approve|reject) required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("dog_submissions")
    .update({
      status: body.action === "approve" ? "approved" : "rejected",
      reviewed_by: "admin",
      reviewed_at: now,
      review_notes: body.notes ?? null,
      updated_at: now,
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: body.id, action: body.action });
}
