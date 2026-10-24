"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { searchTools } from "@/lib/search";
import { getPopularTools } from "@/config/tools";
import { CATEGORY_MAP } from "@/config/categories";
import { ToolMeta } from "@/types/tool";
import { getLucideIcon } from "@/lib/icons";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ToolMeta[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const popularTools = getPopularTools().slice(0, 6);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Search
  useEffect(() => {
    if (query.trim()) {
      const found = searchTools(query);
      setResults(found);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setSelectedIndex(0);
    }
  }, [query]);

  const navigateToTool = useCallback(
    (slug: string) => {
      router.push(`/tools/${slug}`);
      onClose();
    },
    [router, onClose]
  );

  // Keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query.trim() ? results : popularTools;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selectedIndex]) {
        navigateToTool(items[selectedIndex].slug);
      }
    }
  };

  if (!isOpen) return null;

  const displayItems = query.trim() ? results : popularTools;

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-full max-w-xl mx-4">
        <div className="neo-card overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b-2 border-border">
            <Search size={20} className="text-text-secondary shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search a tool..."
              className="flex-1 bg-transparent text-text text-lg font-body outline-none placeholder:text-text-secondary/60"
              autoComplete="off"
            />
            <button
              onClick={onClose}
              className="p-1.5 neo-border rounded bg-surface text-text-secondary hover:text-text"
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {!query.trim() && (
              <div className="px-4 py-2 text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <TrendingUp size={14} />
                Popular Tools
              </div>
            )}

            {query.trim() && results.length === 0 && (
              <div className="p-8 text-center text-text-secondary">
                <p className="font-heading font-semibold">No tools found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}

            {displayItems.map((tool, index) => {
              const Icon = getLucideIcon(tool.icon);
              const category = CATEGORY_MAP.get(tool.category);
              return (
                <button
                  key={tool.id}
                  onClick={() => navigateToTool(tool.slug)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-accent/10"
                      : "hover:bg-surface"
                  }`}
                >
                  <div className="w-9 h-9 flex items-center justify-center neo-border rounded bg-surface shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-sm truncate">
                      {tool.name}
                    </div>
                    <div className="text-xs text-text-secondary truncate">
                      {tool.description}
                    </div>
                  </div>
                  {category && (
                    <span className="text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary shrink-0">
                      {category.name.replace(" Tools", "")}
                    </span>
                  )}
                  <ArrowRight size={14} className="text-text-secondary shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t-2 border-border flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-surface neo-border rounded font-mono text-[10px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-surface neo-border rounded font-mono text-[10px]">↵</kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-surface neo-border rounded font-mono text-[10px]">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
