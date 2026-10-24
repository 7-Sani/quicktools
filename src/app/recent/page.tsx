"use client";

import { useRecentTools } from "@/hooks/useRecentTools";
import { TOOL_MAP } from "@/config/tools";
import { ToolCard } from "@/components/ToolCard";

export default function RecentPage() {
  const { recentSlugs } = useRecentTools();
  const recentTools = recentSlugs
    .map((slug) => TOOL_MAP.get(slug))
    .filter((t) => t !== undefined);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-2">
        Recently Used
      </h1>
      <p className="text-text-secondary mb-8">
        Tools you&apos;ve used recently. Stored locally in your browser.
      </p>

      {recentTools.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <p className="font-heading font-bold text-lg mb-2">No recent tools</p>
          <p className="text-text-secondary">
            Start using tools and they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
