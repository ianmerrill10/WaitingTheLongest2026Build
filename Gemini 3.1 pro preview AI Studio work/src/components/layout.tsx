import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { label: "Browse Dogs", href: "/dogs" },
    { label: "About", href: "/about" },
    { label: "For Shelters", href: "/shelters/join" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-gray-900 group">
          <div className="bg-coral-500 text-white p-1.5 rounded-lg group-hover:bg-coral-600 transition-colors">
            <PawPrint className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">WaitingTheLongest</span>
        </Link>
        <nav className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-coral-500",
                location.pathname.startsWith(item.href) && item.href !== "/" 
                  ? "text-coral-500" 
                  : "text-gray-600"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Mobile menu could go here */}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-12">
      <div className="container mx-auto px-4 text-center space-y-4">
        <div className="flex justify-center text-coral-500 mb-4">
          <PawPrint className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-gray-900 text-lg">WaitingTheLongest.com</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          We believe the dogs who have waited the longest deserve the most visibility. 
          Our platform helps shelters highlight their hardest-to-place animals.
        </p>
        <div className="flex justify-center gap-6 text-sm font-medium mt-6">
          <Link to="/about" className="text-gray-600 hover:text-coral-500">About</Link>
          <Link to="/dogs" className="text-gray-600 hover:text-coral-500">Browse Dogs</Link>
          <Link to="/shelters/join" className="text-gray-600 hover:text-coral-500">For Shelters</Link>
        </div>
        <p className="text-gray-400 text-xs pt-8">
          &copy; {new Date().getFullYear()} WaitingTheLongest.com
        </p>
      </div>
    </footer>
  );
}
