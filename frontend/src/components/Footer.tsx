"use client";

import Link from "next/link";
import { Heart, Mail } from "lucide-react";
import { useState } from "react";

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer_form" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
        <Heart className="w-4 h-4" />
        You&apos;re on the list — thank you!
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <p className="text-sm text-wtl-muted">
        Get alerts when long-waiters near you need a home.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={state === "loading"}
          className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-wtl-coral transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="bg-wtl-coral hover:bg-wtl-coral/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
        >
          <Mail className="w-3.5 h-3.5" />
          {state === "loading" ? "…" : "Notify Me"}
        </button>
      </div>
      {state === "error" && (
        <p className="text-xs text-red-600">Something went wrong. Try again.</p>
      )}
      <p className="text-xs text-gray-400">No spam. Unsubscribe anytime.</p>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-wtl-coral" />
              <span className="font-display text-lg font-bold text-wtl-navy">
                WaitingTheLongest
              </span>
            </div>
            <p className="text-sm text-wtl-muted leading-relaxed">
              Connecting the longest-waiting shelter dogs with loving homes.
              Every day counts.
            </p>
          </div>

          {/* Explore links */}
          <div>
            <h3 className="font-semibold text-wtl-navy mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dogs" className="text-wtl-muted hover:text-wtl-coral transition-colors">
                  Browse Dogs
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-wtl-muted hover:text-wtl-coral transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/dogs?sort=days_waiting_desc" className="text-wtl-muted hover:text-wtl-coral transition-colors">
                  Longest Waiting
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-wtl-coral hover:text-wtl-coral/70 transition-colors font-semibold">
                  Submit a Dog
                </Link>
              </li>
            </ul>
          </div>

          {/* For Shelters + Legal */}
          <div>
            <h3 className="font-semibold text-wtl-navy mb-3">For Shelters</h3>
            <p className="text-sm text-wtl-muted leading-relaxed mb-2">
              Rescue or shelter? List your longest-waiting dogs for free.
            </p>
            <a
              href="mailto:shelters@waitingthelongest.com"
              className="text-sm text-wtl-sky hover:text-wtl-coral transition-colors mb-4 inline-block"
            >
              shelters@waitingthelongest.com
            </a>
            <h3 className="font-semibold text-wtl-navy mb-2 mt-4">Legal</h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="/terms/submission" className="text-wtl-muted hover:text-wtl-coral transition-colors">
                  Submission Terms
                </Link>
              </li>
              <li>
                <a href="mailto:privacy@waitingthelongest.com" className="text-wtl-muted hover:text-wtl-coral transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="mailto:abuse@waitingthelongest.com" className="text-wtl-muted hover:text-wtl-coral transition-colors">
                  Report Abuse
                </a>
              </li>
            </ul>
          </div>

          {/* Email capture */}
          <div>
            <h3 className="font-semibold text-wtl-navy mb-3">Stay in the Loop</h3>
            <EmailCapture />
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8 text-center text-xs text-wtl-muted">
          <p>&copy; {new Date().getFullYear()} WaitingTheLongest.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
