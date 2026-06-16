"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Heart, Lock } from "lucide-react";

function PasswordForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get("from") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.replace(from);
      } else {
        setError("Wrong password. Try again.");
        setPassword("");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <div className="flex justify-center mb-4">
        <Lock className="w-8 h-8 text-wtl-muted" />
      </div>
      <h1 className="text-xl font-bold text-wtl-navy text-center mb-1">
        Site Preview
      </h1>
      <p className="text-sm text-wtl-muted text-center mb-6">
        Enter the password to access the site.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-wtl-coral transition-colors disabled:opacity-50"
        />

        {error && (
          <p className="text-xs text-red-600 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="w-full bg-wtl-coral hover:bg-wtl-coral/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}

export default function PasswordGate() {
  return (
    <div className="min-h-screen bg-wtl-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="w-7 h-7 text-wtl-coral" />
          <span className="font-display text-2xl font-bold text-wtl-navy">
            WaitingTheLongest
          </span>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-sm text-wtl-muted">Loading…</div>}>
          <PasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
