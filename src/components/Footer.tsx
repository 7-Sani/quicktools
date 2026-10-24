import Link from "next/link";
import { CATEGORIES } from "@/config/categories";

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="font-heading text-xl font-bold tracking-tight uppercase"
            >
              QuickTools
            </Link>
            <p className="text-sm text-text-secondary mt-2">
              Simple Tools. Fast Results.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-3">
              Tools
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.id}`}
                    className="text-sm text-text-secondary hover:text-text transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-3">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/tools"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  All Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/popular"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  Popular
                </Link>
              </li>
              <li>
                <Link
                  href="/recent"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  Recent
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t-2 border-border text-center text-sm text-text-secondary">
          © {new Date().getFullYear()} QuickTools. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
