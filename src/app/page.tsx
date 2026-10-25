"use client";

import Link from "next/link";
import { Search, ArrowRight, Shield, Zap, Lock } from "lucide-react";
import { useState } from "react";
import { getHomepagePopularTools } from "@/config/tools";
import { CATEGORIES } from "@/config/categories";
import { ToolCard } from "@/components/ToolCard";
import { SearchModal } from "@/components/SearchModal";
import { getLucideIcon } from "@/lib/icons";

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const popularTools = getHomepagePopularTools();

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-6">
          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-tight">
              Online Tools That Get <span className="text-accent">Things Done.</span>
            </h1>

            <p className="mt-2 text-base sm:text-lg text-text-secondary">
              Simple, useful tools for everyday digital work. No signup required.
            </p>

            {/* Search Bar */}
            <button
              onClick={() => setSearchOpen(true)}
              className="mt-4 w-full max-w-lg flex items-center gap-3 px-4 py-3 neo-card neo-hover text-left"
            >
              <Search size={18} className="text-text-secondary shrink-0" />
              <span className="text-text-secondary flex-1 text-sm sm:text-base">
                Search a tool...
              </span>
              <kbd className="hidden sm:inline text-xs bg-bg px-2 py-0.5 rounded neo-border font-mono text-text-secondary">
                ⌘K
              </kbd>
            </button>

            {/* Quick examples */}
            <div className="mt-3 flex flex-wrap gap-2">
              {["Compress image", "Merge PDF", "Format JSON", "Generate QR", "Count words"].map(
                (example) => (
                  <button
                    key={example}
                    onClick={() => setSearchOpen(true)}
                    className="text-xs px-2.5 py-1 neo-border rounded-full bg-surface text-text-secondary hover:text-text hover:bg-accent/5 transition-colors font-heading font-semibold uppercase tracking-wide"
                  >
                    {example}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Decorative border */}
        <div className="absolute top-0 right-0 w-1/3 h-full border-l-2 border-border/10 hidden lg:block" />
      </section>

      {/* Popular Tools */}
      <section className="border-t-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight">
              Popular Tools
            </h2>
            <Link
              href="/tools"
              className="neo-btn neo-btn-secondary text-xs"
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/tools"
              className="neo-btn neo-btn-secondary"
            >
              View All Tools
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-8">
            Categories
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = getLucideIcon(cat.icon);
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className="group neo-card p-6 neo-hover"
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center neo-border rounded-lg mb-4"
                    style={{ backgroundColor: cat.color + "15", color: cat.color }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="font-heading font-bold text-lg uppercase tracking-tight mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {cat.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-accent font-heading font-semibold text-sm uppercase">
                    Explore
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform duration-150"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Privacy / Trust Section */}
      <section className="border-t-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-8 text-center">
            Why QuickTools?
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "100% Private",
                desc: "Your files never leave your device. All processing happens in your browser.",
              },
              {
                icon: Zap,
                title: "Blazing Fast",
                desc: "No uploads, no waiting. Tools work instantly with client-side processing.",
              },
              {
                icon: Lock,
                title: "No Signup Required",
                desc: "Use any tool immediately. No account needed for core features.",
              },
            ].map((item) => (
              <div key={item.title} className="neo-card p-6 text-center">
                <div className="w-12 h-12 flex items-center justify-center neo-border rounded-lg bg-accent/10 text-accent mx-auto mb-4">
                  <item.icon size={24} />
                </div>
                <h3 className="font-heading font-bold text-sm uppercase tracking-wide mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
            >
              Learn more in our Privacy Policy &rarr;
            </Link>
          </div>
        </div>
      </section>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
