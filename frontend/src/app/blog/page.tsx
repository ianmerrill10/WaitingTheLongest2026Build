import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { BLOG_POSTS, CATEGORY_COLORS } from "./_data";

export const metadata: Metadata = {
  title: "Stories — WaitingTheLongest.com",
  description: "Real stories of shelter dogs who waited the longest — and found their forever homes. Every day counts.",
};

export default function BlogPage() {
  return (
    <div className="bg-wtl-cream min-h-screen">
      {/* Header */}
      <div className="border-b-4 border-wtl-navy bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <span className="font-display font-black uppercase tracking-widest text-sm text-wtl-muted block mb-3">Stories &amp; Research</span>
          <h1 className="font-display font-black text-5xl md:text-6xl text-wtl-navy uppercase leading-tight mb-4">
            Every Dog Has a Story
          </h1>
          <p className="text-xl text-wtl-muted max-w-2xl">
            Education, data, and real stories about shelter dogs who wait the longest — and what happens when someone finally sees them.
          </p>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card group flex flex-col">
              {/* Category bar */}
              <div className="p-4 border-b-2 border-wtl-navy bg-wtl-navy">
                <span className={`inline-block text-xs font-bold uppercase tracking-widest px-2 py-1 border ${CATEGORY_COLORS[post.category] || "bg-white text-wtl-navy border-wtl-navy"}`}>
                  {post.category}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h2 className="font-display font-black text-2xl text-wtl-navy uppercase leading-tight mb-3 group-hover:text-wtl-coral transition-colors">
                  {post.title}
                </h2>
                <p className="text-wtl-muted text-sm leading-relaxed flex-grow mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t-2 border-wtl-warm">
                  <div className="flex items-center gap-2 text-xs text-wtl-muted font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                    <span>&bull;</span>
                    <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-wtl-coral group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
