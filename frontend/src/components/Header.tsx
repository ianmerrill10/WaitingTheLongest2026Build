"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, X, Search } from "lucide-react";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="w-7 h-7 text-wtl-coral group-hover:scale-110 transition-transform" />
            <span className="font-display text-xl font-bold text-wtl-navy">
              Waiting<span className="text-wtl-coral">The</span>Longest
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/dogs"
              className="text-wtl-navy hover:text-wtl-coral transition-colors font-medium"
            >
              Find Dogs
            </Link>
            <Link
              href="/about"
              className="text-wtl-navy hover:text-wtl-coral transition-colors font-medium"
            >
              About
            </Link>
            <Link
              href="/dogs?sort=days_waiting_desc"
              className="btn-primary text-sm"
            >
              <Search className="w-4 h-4 mr-1.5" />
              Browse All Dogs
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-wtl-navy"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/dogs"
                className="text-wtl-navy font-medium px-2"
                onClick={() => setMobileOpen(false)}
              >
                Find Dogs
              </Link>
              <Link
                href="/about"
                className="text-wtl-navy font-medium px-2"
                onClick={() => setMobileOpen(false)}
              >
                About
              </Link>
              <Link
                href="/dogs?sort=days_waiting_desc"
                className="btn-primary text-sm text-center"
                onClick={() => setMobileOpen(false)}
              >
                Browse All Dogs
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
