import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

          {/* Links */}
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
            </ul>
          </div>

          {/* For Shelters */}
          <div>
            <h3 className="font-semibold text-wtl-navy mb-3">For Shelters</h3>
            <p className="text-sm text-wtl-muted leading-relaxed">
              Are you a shelter or rescue? List your longest-waiting dogs for
              free through our Shelter Intake API.
            </p>
            <a
              href="mailto:shelters@waitingthelongest.com"
              className="text-sm text-wtl-sky hover:text-wtl-coral transition-colors mt-2 inline-block"
            >
              shelters@waitingthelongest.com
            </a>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8 text-center text-xs text-wtl-muted">
          <p>&copy; {new Date().getFullYear()} WaitingTheLongest.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
