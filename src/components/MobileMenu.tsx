"use client";

import Link from "next/link";
import { X, Home, Wrench, Grid3X3, Star, Clock, Info } from "lucide-react";
import { useEffect } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tools", label: "All Tools", icon: Wrench },
  { href: "/categories", label: "Categories", icon: Grid3X3 },
  { href: "/popular", label: "Popular Tools", icon: Star },
  { href: "/recent", label: "Recently Used", icon: Clock },
  { href: "/about", label: "About", icon: Info },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="absolute top-0 right-0 w-72 h-full bg-bg border-l-2 border-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border">
          <span className="font-heading font-bold text-lg uppercase">Menu</span>
          <button
            onClick={onClose}
            className="p-2 neo-border rounded-lg bg-surface"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            {MENU_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 neo-border rounded-lg bg-surface font-heading font-semibold text-sm uppercase tracking-wide neo-hover"
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
