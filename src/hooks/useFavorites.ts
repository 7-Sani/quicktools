"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "quicktools-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch {
        setFavorites(new Set());
      }
    }
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.has(slug),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
