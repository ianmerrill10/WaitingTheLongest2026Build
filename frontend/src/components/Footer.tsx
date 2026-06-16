"use client";

import Link from "next/link";
import { AlertOctagon, Mail, Heart } from "lucide-react";
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
      <div className="flex items-center gap-2 text-sm text-wtl-sage font-bold uppercase tracking-widest font-display">
        <Heart className="w-4 h-4" />
        You&apos;re on the list.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <p className="text-sm text-white/60">
        Get alerts when long-waiters near you need a home.
      </p>
      <div className="flex gap-0">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={state === "loading"}
          className="flex-1 min-w-0 border-2 border-white bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-wtl-coral transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="bg-wtl-coral hover:bg-wtl-coral-dark text-white text-xs font-display font-bold uppercase tracking-widest px-4 py-2 border-2 border-wtl-coral transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
        >
          <Mail className="w-3.5 h-3.5" />
          {state === "loading" ? "…" : "Notify Me"}
        </button>
      </div>
      {state === "error" && (
        <p className="text-xs text-wtl-coral">Something went wrong. Try again.</p>
      )}
      <p className="text-xs text-white/30">No spam. Unsubscribe anytime.</p>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="bg-wtl-navy border-t-4 border-wtl-coral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertOctagon className="w-6 h-6 text-wtl-coral" strokeWidth={2.5} />
              <span className="font-display font-black text-xl text-white uppercase tracking-tight">
                Waiting<span className="text-wtl-coral">The</span>Longest
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Surfacing the shelter dogs who have been waiting the longest.
              Every second counts.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a href="https://tiktok.com/@waitingthelongest" target="_blank" rel="noopener noreferrer"
                className="text-xs font-display font-bold uppercase tracking-widest text-white/50 hover:text-wtl-coral transition-colors">
                TikTok
              </a>
              <span className="text-white/20">|</span>
              <a href="https://instagram.com/waitingthelongest" target="_blank" rel="noopener noreferrer"
                className="text-xs font-display font-bold uppercase tracking-widest text-white/50 hover:text-wtl-coral transition-colors">
                Instagram
              </a>
              <span className="text-white/20">|</span>
              <a href="https://facebook.com/waitingthelongest" target="_blank" rel="noopener noreferrer"
                className="text-xs font-display font-bold uppercase tracking-widest text-white/50 hover:text-wtl-coral transition-colors">
                Facebook
              </a>
            </div>
          </div>

          {/* Explore links */}
          <div>
            <h3 className="font-display font-black uppercase tracking-widest text-xs text-white/40 mb-4">Explore</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/dogs", label: "Browse Dogs" },
                { href: "/dogs?sort=days_waiting_desc", label: "Longest Waiting" },
                { href: "/about", label: "About Us" },
                { href: "/blog", label: "Stories" },
                { href: "/faq", label: "FAQ" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/60 hover:text-white transition-colors font-medium">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Shelters + Legal */}
          <div>
            <h3 className="font-display font-black uppercase tracking-widest text-xs text-white/40 mb-4">For Shelters</h3>
            <ul className="space-y-2.5 mb-6">
              <li>
                <Link href="/submit" className="text-sm text-wtl-coral hover:text-white transition-colors font-bold">
                  + Submit a Dog (Free)
                </Link>
              </li>
              <li>
                <a href="mailto:shelters@waitingthelongest.com" className="text-sm text-white/60 hover:text-white transition-colors">
                  shelters@waitingthelongest.com
                </a>
              </li>
            </ul>
            <h3 className="font-display font-black uppercase tracking-widest text-xs text-white/40 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms/submission" className="text-sm text-white/50 hover:text-white transition-colors">
                  Submission Terms
                </Link>
              </li>
              <li>
                <a href="mailto:privacy@waitingthelongest.com" className="text-sm text-white/50 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="mailto:abuse@waitingthelongest.com" className="text-sm text-white/50 hover:text-white transition-colors">
                  Report Abuse
                </a>
              </li>
            </ul>
          </div>

          {/* Email capture */}
          <div>
            <h3 className="font-display font-black uppercase tracking-widest text-xs text-white/40 mb-4">Stay in the Loop</h3>
            <EmailCapture />
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>&copy; {new Date().getFullYear()} WaitingTheLongest.com. All rights reserved.</p>
          <p>Every day counts.</p>
        </div>
      </div>
    </footer>
  );
}
