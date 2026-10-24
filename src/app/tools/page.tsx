"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { TOOLS } from "@/config/tools";
import { CATEGORIES } from "@/config/categories";
import { ToolCard } from "@/components/ToolCard";
import { CategoryId } from "@/types/tool";

type SortOption = "popular" | "az" | "za";

export default function AllToolsPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
  const [sort, setSort] = useState<SortOption>("popular");

  const filteredTools = useMemo(() => {
    let tools = [...TOOLS];

    // Filter by category
    if (activeCategory !== "all") {
      tools = tools.filter((t) => t.category === activeCategory);
    }

    // Filter by search
    if (query.trim()) {
      const q = query.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q))
      );
    }

    // Sort
    if (sort === "popular") {
      tools.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    } else if (sort === "az") {
      tools.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "za") {
      tools.sort((a, b) => b.name.localeCompare(a.name));
    }

    return tools;
  }, [query, activeCategory, sort]);

  // Group by letter for A-Z sort
  const groupedTools = useMemo(() => {
    if (sort !== "az") return null;
    const groups: Record<string, typeof filteredTools> = {};
    filteredTools.forEach((tool) => {
      const letter = tool.name[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(tool);
    });
    return groups;
  }, [filteredTools, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      {/* Header */}
      <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-2">
        All Tools
      </h1>
      <p className="text-text-secondary mb-8">
        {TOOLS.length} tools for everyday digital work.
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools..."
          className="neo-input pl-11"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory("all")}
          className={`neo-btn text-xs ${
            activeCategory === "all" ? "neo-btn-primary" : "neo-btn-secondary"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`neo-btn text-xs ${
              activeCategory === cat.id
                ? "neo-btn-primary"
                : "neo-btn-secondary"
            }`}
          >
            {cat.name.replace(" Tools", "")}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-sm text-text-secondary font-heading font-semibold uppercase tracking-wide">
          Sort:
        </span>
        {[
          { value: "popular" as SortOption, label: "Popular" },
          { value: "az" as SortOption, label: "A-Z" },
          { value: "za" as SortOption, label: "Z-A" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`text-xs px-3 py-1.5 neo-border rounded font-heading font-semibold uppercase transition-colors ${
              sort === opt.value
                ? "bg-accent text-white"
                : "bg-surface text-text-secondary hover:text-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {filteredTools.length === 0 && (
        <div className="neo-card p-12 text-center">
          <p className="font-heading font-bold text-lg mb-2">No tools found</p>
          <p className="text-text-secondary">Try a different search or category</p>
        </div>
      )}

      {groupedTools ? (
        // A-Z grouped view
        Object.entries(groupedTools).map(([letter, tools]) => (
          <div key={letter} className="mb-8">
            <h2 className="font-heading text-xl font-bold uppercase mb-4 text-accent">
              {letter}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
