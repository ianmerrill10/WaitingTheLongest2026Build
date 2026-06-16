import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Supabase client — server-side with service role key (bypasses RLS)
// ---------------------------------------------------------------------------

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars not set: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

// ---------------------------------------------------------------------------
// Rate limiting — simple in-memory per IP (resets on cold start)
// For production: swap with Upstash Redis or Supabase pg function
// ---------------------------------------------------------------------------

const ipSubmissionTimes = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const limit = 5; // max 5 submissions per IP per hour

  const times = (ipSubmissionTimes.get(ip) ?? []).filter(t => now - t < windowMs);
  if (times.length >= limit) return true;

  times.push(now);
  ipSubmissionTimes.set(ip, times);
  return false;
}

// ---------------------------------------------------------------------------
// Email notification (via Resend — optional, skipped if RESEND_API_KEY not set)
// ---------------------------------------------------------------------------

async function sendNotificationEmail(submissionId: string, dogName: string, submitterEmail: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL ?? "hello@waitingthelongest.com";

  if (!resendKey) return; // skip silently if not configured

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "WaitingTheLongest <noreply@waitingthelongest.com>",
        to: [notifyEmail],
        subject: `New dog submission: ${dogName} (${submissionId.slice(0, 8)})`,
        html: `
          <p>A new dog has been submitted for review.</p>
          <ul>
            <li><strong>Dog:</strong> ${dogName}</li>
            <li><strong>Submission ID:</strong> ${submissionId}</li>
            <li><strong>Submitter:</strong> ${submitterEmail}</li>
          </ul>
          <p>Review at the admin dashboard.</p>
        `,
      }),
    });
  } catch {
    // Non-fatal — submission already saved, email is best-effort
    console.warn("Email notification failed (non-fatal)");
  }
}

// ---------------------------------------------------------------------------
// POST /api/submit
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // ---- Rate limiting ----
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait before trying again." },
      { status: 429 }
    );
  }

  // ---- Parse body ----
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ---- Validate required fields ----
  const required = [
    "submitter_type",
    "submitter_name",
    "submitter_email",
    "dog_name",
    "intake_date",
    "breed_primary",
    "location_city",
    "location_state",
    "agreed_accuracy",
    "agreed_terms",
  ];

  const missing = required.filter(f => !body[f]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  // Both legal checkboxes must be true
  if (!body.agreed_accuracy || !body.agreed_terms) {
    return NextResponse.json(
      { error: "Legal agreement checkboxes must be accepted" },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof body.submitter_email !== "string" || !emailRegex.test(body.submitter_email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Validate intake_date — must be a real date, not in the future
  const intakeDate = new Date(body.intake_date as string);
  if (isNaN(intakeDate.getTime()) || intakeDate > new Date()) {
    return NextResponse.json(
      { error: "intake_date must be a valid date in the past" },
      { status: 400 }
    );
  }

  // Validate description length
  if (body.description && typeof body.description === "string" && body.description.length > 500) {
    return NextResponse.json({ error: "Description must be 500 characters or fewer" }, { status: 400 });
  }

  // ---- Build the row ----
  const row = {
    submitter_type: body.submitter_type,
    submitter_name: body.submitter_name,
    submitter_email: (body.submitter_email as string).toLowerCase().trim(),
    submitter_phone: body.submitter_phone ?? null,
    submitter_social: body.submitter_social ?? null,
    org_name: body.org_name ?? null,
    org_website: body.org_website ?? null,
    org_ein: body.org_ein ?? null,
    submitter_ip: ip === "unknown" ? null : ip,
    submitter_ua: req.headers.get("user-agent") ?? null,

    dog_name: (body.dog_name as string).trim(),
    intake_date: (body.intake_date as string),
    breed_primary: body.breed_primary,
    breed_secondary: body.breed_secondary ?? null,
    is_mixed: body.is_mixed ?? false,
    age_months: body.age_months ?? null,
    size: body.size ?? null,
    sex: body.sex ?? null,
    altered: body.altered ?? "unknown",
    description: body.description ?? null,
    good_with_dogs: body.good_with_dogs ?? "unknown",
    good_with_cats: body.good_with_cats ?? "unknown",
    good_with_kids: body.good_with_kids ?? "unknown",
    special_needs: body.special_needs ?? false,
    special_needs_desc: body.special_needs_desc ?? null,
    location_city: body.location_city,
    location_state: (body.location_state as string).toUpperCase(),
    listing_url: body.listing_url ?? null,

    photo_urls: body.photo_urls ?? [],
    primary_photo_url: body.primary_photo_url ?? null,

    agreed_accuracy: true,
    agreed_terms: true,
    agreed_marketing: body.agreed_marketing ?? false,

    status: "pending",
  };

  // ---- Insert into Supabase ----
  let supabase;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error("Supabase not configured:", err);
    return NextResponse.json(
      { error: "Submission service is temporarily unavailable. Please email us directly." },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("dog_submissions")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { error: "Failed to save submission. Please try again." },
      { status: 500 }
    );
  }

  const submissionId: string = data.id;

  // ---- Optional: add to marketing_leads if opted in ----
  if (row.agreed_marketing) {
    await supabase.from("marketing_leads").upsert(
      {
        email: row.submitter_email,
        name: row.submitter_name,
        source: "submission_form",
        ip_address: ip === "unknown" ? null : ip,
        submission_id: submissionId,
      },
      { onConflict: "email" }
    );
  }

  // ---- Email notification (best-effort) ----
  await sendNotificationEmail(submissionId, row.dog_name, row.submitter_email);

  return NextResponse.json(
    {
      success: true,
      submission_id: submissionId,
      message: `${row.dog_name}'s submission has been received. We'll review it within 24 hours.`,
    },
    { status: 201 }
  );
}
