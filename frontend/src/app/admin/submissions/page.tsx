"use client";

// ---------------------------------------------------------------------------
// Admin Approval Queue — /admin/submissions
//
// Protected by ADMIN_SECRET env var. Access via:
//   /admin/submissions?secret=YOUR_ADMIN_SECRET
//
// Shows pending dog submissions. Approve or reject each one.
// No framework auth — replace with NextAuth when ready.
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from "react";
import { Check, X, Clock, Dog, RefreshCw, ExternalLink } from "lucide-react";

interface Submission {
  id: string;
  submitter_type: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string | null;
  org_name: string | null;
  dog_name: string;
  intake_date: string;
  breed_primary: string;
  breed_secondary: string | null;
  age_months: number | null;
  size: string | null;
  sex: string | null;
  description: string | null;
  location_city: string;
  location_state: string;
  photo_urls: string[];
  primary_photo_url: string | null;
  status: string;
  submitted_at: string;
  listing_url: string | null;
  special_needs: boolean;
}

type Filter = "pending" | "approved" | "rejected";

export default function AdminSubmissionsPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  // Read secret from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("secret") ?? "";
    if (s) { setSecret(s); setAuthed(true); }
  }, []);

  const load = useCallback(async (s: string, f: Filter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions?status=${f}`, {
        headers: { "x-admin-secret": s },
      });
      if (res.status === 401) { setError("Invalid secret"); setAuthed(false); return; }
      const data = await res.json();
      setSubmissions(data.submissions ?? []);
    } catch {
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed && secret) load(secret, filter);
  }, [authed, secret, filter, load]);

  async function act(id: string, action: "approve" | "reject") {
    setActioning(id);
    const res = await fetch("/api/admin/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ id, action, notes: noteMap[id] ?? "" }),
    });
    if (res.ok) {
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } else {
      const d = await res.json();
      alert(d.error ?? "Action failed");
    }
    setActioning(null);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Admin Access</h1>
          <input
            type="password"
            placeholder="Admin secret"
            className="w-full border rounded-lg px-4 py-2 text-sm mb-4 outline-none focus:border-blue-500"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setAuthed(true)}
          />
          <button
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-semibold hover:bg-gray-700"
            onClick={() => setAuthed(true)}
          >
            Enter
          </button>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submission Queue</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review and approve dog submissions</p>
          </div>
          <button
            onClick={() => load(secret, filter)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg px-3 py-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "rejected"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-white border text-gray-600 hover:border-gray-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading && (
          <div className="text-center text-gray-400 py-16 text-sm">Loading…</div>
        )}

        {!loading && submissions.length === 0 && (
          <div className="bg-white rounded-xl border p-16 text-center text-gray-400 text-sm">
            <Dog className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No {filter} submissions
          </div>
        )}

        <div className="space-y-4">
          {submissions.map(s => (
            <div key={s.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {/* Photos strip */}
              {s.photo_urls.length > 0 && (
                <div className="flex gap-2 p-3 bg-gray-50 border-b overflow-x-auto">
                  {s.photo_urls.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`${s.dog_name} photo ${i + 1}`}
                      className="h-24 w-24 object-cover rounded-lg flex-shrink-0 border"
                    />
                  ))}
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  {/* Dog info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-gray-900">{s.dog_name}</h2>
                      {s.special_needs && (
                        <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                          Special Needs
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {s.breed_primary}{s.breed_secondary ? ` / ${s.breed_secondary}` : ""} ·{" "}
                      {s.location_city}, {s.location_state}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Intake: {new Date(s.intake_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      {s.age_months && <span>~{Math.round(s.age_months / 12 * 10) / 10} yrs</span>}
                      {s.size && <span className="capitalize">{s.size}</span>}
                      {s.sex && <span className="capitalize">{s.sex}</span>}
                    </div>

                    {s.description && (
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3 leading-relaxed">
                        {s.description}
                      </p>
                    )}

                    {/* Submitter info */}
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p>
                        <span className="font-semibold capitalize">{s.submitter_type}</span>:{" "}
                        {s.submitter_name}
                        {s.org_name ? ` · ${s.org_name}` : ""}
                      </p>
                      <p>{s.submitter_email}{s.submitter_phone ? ` · ${s.submitter_phone}` : ""}</p>
                      {s.listing_url && (
                        <a
                          href={s.listing_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          External listing
                        </a>
                      )}
                      <p className="text-gray-400">
                        Submitted: {new Date(s.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {filter === "pending" && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => act(s.id, "approve")}
                        disabled={actioning === s.id}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => act(s.id, "reject")}
                        disabled={actioning === s.id}
                        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Notes field — pending only */}
                {filter === "pending" && (
                  <div className="mt-3 pt-3 border-t">
                    <input
                      type="text"
                      placeholder="Review notes (optional)"
                      className="w-full border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-gray-400"
                      value={noteMap[s.id] ?? ""}
                      onChange={e => setNoteMap(prev => ({ ...prev, [s.id]: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
