"use client";

import { useState, useEffect, useCallback } from "react";

const MAX_RECENT = 10;
const STORAGE_KEY = "quicktools-recent";

export function useRecentTools() {
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentSlugs(JSON.parse(stored));
      } catch {
        setRecentSlugs([]);
      }
    }
  }, []);

  const addRecent = useCallback((slug: string) => {
    if (!slug) return;
    setRecentSlugs((prev) => {
      if (prev[0] === slug) return prev;
      const filtered = prev.filter((s) => s !== slug);
      const updated = [slug, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recentSlugs, addRecent };
}
