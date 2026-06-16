import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Photo upload endpoint — receives a single image file, uploads to Supabase
// Storage bucket 'submissions', returns the public URL.
//
// Usage: POST /api/upload-photo
//   Content-Type: multipart/form-data
//   Body: { file: <File>, submission_id: <string> }
// ---------------------------------------------------------------------------

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const submissionId = (formData.get("submission_id") as string) || "pending";

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "file must be an image" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  // Sanitize filename — strip special chars, keep extension
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${submissionId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = getSupabase();
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("submissions")
    .upload(safeName, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  const { data } = supabase.storage.from("submissions").getPublicUrl(safeName);

  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
