"use client";

import Link from "next/link";
import { ChevronRight, Shield } from "lucide-react";
import { ToolMeta } from "@/types/tool";
import { CATEGORY_MAP } from "@/config/categories";
import { getRelatedTools } from "@/config/tools";
import { ToolCard } from "./ToolCard";
import { useRecentTools } from "@/hooks/useRecentTools";
import { useEffect } from "react";

interface ToolShellProps {
  tool: ToolMeta;
  children: React.ReactNode;
}

export function ToolShell({ tool, children }: ToolShellProps) {
  const category = CATEGORY_MAP.get(tool.category);
  const relatedTools = getRelatedTools(tool.slug);
  const { addRecent } = useRecentTools();

  useEffect(() => {
    addRecent(tool.slug);
  }, [tool.slug, addRecent]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-text transition-colors">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link
          href={`/categories/${tool.category}`}
          className="hover:text-text transition-colors"
        >
          {category?.name || tool.category}
        </Link>
        <ChevronRight size={14} />
        <span className="text-text font-semibold">{tool.name}</span>
      </nav>

      {/* Title */}
      <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-3">
        {tool.name}
      </h1>
      <p className="text-text-secondary text-lg mb-8">{tool.longDescription}</p>

      {/* Tool Area */}
      <div className="neo-card p-6 sm:p-8 mb-8">{children}</div>

      {/* Privacy Note */}
      {tool.isClientSide && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-accent-light mb-8">
          <Shield size={20} className="text-accent shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">Your files stay on your device.</span>{" "}
            This tool processes everything in your browser. Nothing is uploaded to any server.
          </p>
        </div>
      )}

      {/* How to Use */}
      <div className="mb-12">
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">
          How to Use
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Input", desc: tool.acceptedFormats ? "Upload your file or drag and drop" : "Enter your text or data" },
            { step: "2", title: "Process", desc: "Click the action button to process" },
            { step: "3", title: "Result", desc: "Download or copy your result" },
          ].map((item) => (
            <div key={item.step} className="neo-card p-4">
              <div className="w-8 h-8 flex items-center justify-center neo-border rounded-lg bg-accent text-white font-heading font-bold text-sm mb-3">
                {item.step}
              </div>
              <h3 className="font-heading font-bold text-sm uppercase mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div>
          <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">
            Related Tools
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTools.slice(0, 6).map((rt) => (
              <ToolCard key={rt.id} tool={rt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
