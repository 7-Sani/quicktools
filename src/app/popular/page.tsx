import { getPopularTools } from "@/config/tools";
import { ToolCard } from "@/components/ToolCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Popular Tools",
  description: "The most popular tools on QuickTools — Image Compressor, PDF Merger, JSON Formatter, and more.",
};

export default function PopularPage() {
  const popular = getPopularTools();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-2">
        Popular Tools
      </h1>
      <p className="text-text-secondary mb-8">
        The tools people use the most.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {popular.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
