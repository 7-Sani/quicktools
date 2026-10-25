"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { ToolMeta } from "@/types/tool";
import { CATEGORY_MAP } from "@/config/categories";
import { useFavorites } from "@/hooks/useFavorites";
import { LucideIcon } from "@/lib/icons";

interface ToolCardProps {
  tool: ToolMeta;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const category = CATEGORY_MAP.get(tool.category);
  const favorite = isFavorite(tool.slug);

  return (
    <div className="group relative neo-card p-5 neo-hover">
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(tool.slug);
        }}
        className="absolute top-3 right-3 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent/10"
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          size={16}
          className={favorite ? "fill-accent text-accent" : "text-text-secondary"}
        />
      </button>

      <Link href={`/tools/${tool.slug}`} className="block">
        {/* Icon */}
        <div
          className="w-10 h-10 flex items-center justify-center neo-border rounded-lg mb-4"
          style={{ backgroundColor: category?.color + "15" }}
        >
          <LucideIcon name={tool.icon} size={20} />
        </div>

        {/* Name + Arrow */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wide">
            {tool.name}
          </h3>
          <ArrowRight
            size={16}
            className="text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all duration-150"
          />
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed mb-3">
          {tool.description}
        </p>

        {/* Category Badge */}
        <span
          className="inline-block text-xs font-heading font-semibold uppercase tracking-wider px-2 py-1 rounded neo-border"
          style={{ color: category?.color }}
        >
          {category?.name.replace(" Tools", "")}
        </span>
      </Link>
    </div>
  );
}
