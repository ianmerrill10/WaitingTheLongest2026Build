import React from "react";

export function Section({ children, className = "", noPadding = false }: { children: React.ReactNode, className?: string, noPadding?: boolean }) {
  return (
    <section className={`w-full ${noPadding ? "" : "py-16 md:py-24"} ${className}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {children}
      </div>
    </section>
  );
}

export function Button({ 
  children, 
  variant = 'primary', 
  className = "",
  size = "md",
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline', size?: 'sm' | 'md' | 'lg' }) {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-xl transition-colors disabled:opacity-50";
  
  const variants = {
    primary: "bg-coral-500 text-white hover:bg-coral-600 shadow-sm",
    secondary: "bg-teal-500 text-white hover:bg-teal-600 shadow-sm",
    outline: "bg-transparent border-2 border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
