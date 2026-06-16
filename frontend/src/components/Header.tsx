"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, AlertOctagon } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-wtl-cream border-b-4 border-wtl-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <AlertOctagon className="w-8 h-8 text-wtl-coral group-hover:animate-pulse" strokeWidth={2.5} />
            <span className="font-display font-black text-2xl tracking-tight text-wtl-navy uppercase">
              Waiting<span className="text-wtl-coral">The</span>Longest
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/dogs" className="font-display font-bold uppercase tracking-widest text-sm text-wtl-navy hover:text-wtl-coral transition-colors">
              Find Dogs
            </Link>
            <Link href="/about" className="font-display font-bold uppercase tracking-widest text-sm text-wtl-navy hover:text-wtl-coral transition-colors">
              About
            </Link>
            <Link href="/blog" className="font-display font-bold uppercase tracking-widest text-sm text-wtl-navy hover:text-wtl-coral transition-colors">
              Stories
            </Link>
            <Link href="/faq" className="font-display font-bold uppercase tracking-widest text-sm text-wtl-navy hover:text-wtl-coral transition-colors">
              FAQ
            </Link>
            <Link href="/submit" className="btn-secondary text-sm py-2 px-4">
              + Submit a Dog
            </Link>
            <Link href="/dogs?sort=days_waiting_desc" className="btn-primary text-sm py-2 px-4">
              Browse All Dogs
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-wtl-navy hover:text-wtl-coral transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b-4 border-wtl-navy">
          <div className="px-4 pt-2 pb-6 flex flex-col gap-1">
            {[
              { href: "/dogs", label: "Find Dogs" },
              { href: "/about", label: "About" },
              { href: "/blog", label: "Stories" },
              { href: "/faq", label: "FAQ" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block py-3 border-b border-wtl-warm font-display font-bold uppercase tracking-widest text-wtl-navy hover:text-wtl-coral transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link href="/submit" className="btn-secondary w-full text-center mt-4" onClick={() => setIsOpen(false)}>
              + Submit a Dog
            </Link>
            <Link href="/dogs?sort=days_waiting_desc" className="btn-primary w-full text-center mt-2" onClick={() => setIsOpen(false)}>
              Browse All Dogs
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
