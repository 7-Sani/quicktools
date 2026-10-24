"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { SearchModal } from "./SearchModal";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { href: "/tools", label: "Tools" },
  { href: "/categories", label: "Categories" },
  { href: "/popular", label: "Popular" },
];

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link
              href="/"
              className="font-heading text-lg font-bold tracking-tight uppercase"
            >
              QuickTools
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1 text-xs font-semibold font-heading uppercase tracking-wide rounded transition-colors ${
                    pathname === link.href || pathname.startsWith(link.href + "/")
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:text-text hover:bg-surface"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="px-2.5 py-1 neo-border rounded-lg neo-hover bg-surface hidden sm:flex items-center gap-2 text-xs text-text-secondary"
                aria-label="Search tools"
              >
                <Search size={14} />
                <span className="hidden lg:inline">Search...</span>
                <kbd className="hidden lg:inline text-[10px] bg-bg px-1 py-0.5 rounded border border-border font-mono">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={() => setSearchOpen(true)}
                className="p-1.5 neo-border rounded-lg neo-hover bg-surface sm:hidden"
                aria-label="Search tools"
              >
                <Search size={16} />
              </button>

              <ThemeSwitcher />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-1.5 neo-border rounded-lg neo-hover bg-surface md:hidden"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
