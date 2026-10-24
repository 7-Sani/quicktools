"use client";

import React, { useState, useMemo } from "react";
import {
  ListTree,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  FileCode,
  FileText,
} from "lucide-react";

const SAMPLE_HTML_OPTIMAL = `<!DOCTYPE html>
<html>
<body>
  <h1>The Ultimate Guide to Technical SEO in 2026</h1>
  <p>Introduction to search engine architecture and modern ranking factors.</p>

  <h2>1. Crawlability & Indexing</h2>
  <p>Ensuring bots can discover your web content efficiently.</p>
  <h3>1.1 Configuring Robots.txt</h3>
  <p>How to format allow and disallow directives.</p>
  <h3>1.2 XML Sitemap Architecture</h3>
  <p>Organizing standard and index sitemaps for fast discovery.</p>

  <h2>2. On-Page HTML Architecture</h2>
  <p>Formatting meta tags and heading trees.</p>
  <h3>2.1 Proper Heading Hierarchy (H1 to H6)</h3>
  <p>Organizing headings like a book outline.</p>
  <h3>2.2 Canonical Tag Best Practices</h3>
  <p>Preventing duplicate content indexation.</p>

  <h2>3. Core Web Vitals & Speed</h2>
  <p>Measuring INP, LCP, and CLS performance.</p>
</body>
</html>`;

const SAMPLE_HTML_BROKEN = `<!DOCTYPE html>
<html>
<body>
  <h1>First Main Heading</h1>
  <p>Some intro text.</p>

  <!-- Error: Multiple H1 tags -->
  <h1>Second Main Heading on Same Page</h1>

  <!-- Error: Skipped level H1 -> H4 without H2 or H3 -->
  <h4>Deep Sub-heading without Parent H2</h4>

  <!-- Error: Empty heading -->
  <h2></h2>

  <h2>Another Valid Section</h2>
  <!-- Error: Excessively long heading -->
  <h3>This is an absurdly long heading that spans dozens and dozens of words and really should have been regular body paragraph copy rather than an HTML headline tag for search engine indexing</h3>
</body>
</html>`;

interface HeadingItem {
  id: number;
  level: number; // 1 to 6
  tag: string;
  text: string;
  charCount: number;
  issues: string[];
}

export default function HeadingStructureAnalyzerTool() {
  const [content, setContent] = useState(SAMPLE_HTML_OPTIMAL);
  const [copied, setCopied] = useState(false);

  // Parse headings from HTML or Markdown
  const parsedHeadings = useMemo(() => {
    if (!content.trim()) return [];

    const headings: HeadingItem[] = [];
    let idCounter = 1;

    // Check if input is markdown or HTML
    const isProbablyHtml = /<\/?[a-z][\s\S]*>/i.test(content);

    if (isProbablyHtml) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        const headingElements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");

        headingElements.forEach((el) => {
          const tag = el.tagName.toLowerCase();
          const level = parseInt(tag.charAt(1));
          const text = (el.textContent || "").trim();

          headings.push({
            id: idCounter++,
            level,
            tag,
            text,
            charCount: text.length,
            issues: [],
          });
        });
      } catch {
        // Fallback regex if parser fails
        const regex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
          const level = parseInt(match[1]);
          const text = match[2].replace(/<[^>]*>/g, "").trim();
          headings.push({
            id: idCounter++,
            level,
            tag: `h${level}`,
            text,
            charCount: text.length,
            issues: [],
          });
        }
      }
    } else {
      // Markdown headings (# Header, ## Header, etc.)
      const lines = content.split("\n");
      lines.forEach((line) => {
        const match = line.match(/^(#{1,6})\s+(.*)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2].trim();
          headings.push({
            id: idCounter++,
            level,
            tag: `h${level}`,
            text,
            charCount: text.length,
            issues: [],
          });
        }
      });
    }

    // Now validate hierarchy rules across the sequence
    const seenTexts = new Map<string, number>();

    headings.forEach((h, idx) => {
      // 1. Empty heading check
      if (!h.text) {
        h.issues.push("Empty heading tag with no text content.");
      }

      // 2. Length check
      if (h.text.length > 70) {
        h.issues.push(`Overly long heading (${h.text.length} chars). Keep under 70 characters.`);
      } else if (h.text && h.text.length < 3) {
        h.issues.push("Overly short heading (<3 chars).");
      }

      // 3. Duplicate heading check
      if (h.text) {
        const lower = h.text.toLowerCase();
        const count = (seenTexts.get(lower) || 0) + 1;
        seenTexts.set(lower, count);
        if (count > 1) {
          h.issues.push(`Duplicate heading text (appears ${count} times).`);
        }
      }

      // 4. Hierarchy skip check (e.g. H1 -> H3 or H2 -> H4)
      if (idx > 0) {
        const prevLevel = headings[idx - 1].level;
        if (h.level > prevLevel + 1) {
          h.issues.push(`Skipped heading level: jumped from <h${prevLevel}> directly to <h${h.level}>.`);
        }
      } else if (h.level !== 1) {
        h.issues.push(`First heading is <${h.tag}> instead of <h1>.`);
      }
    });

    return headings;
  }, [content]);

  // Overall audit stats
  const audit = useMemo(() => {
    const h1Count = parsedHeadings.filter((h) => h.level === 1).length;
    const h2Count = parsedHeadings.filter((h) => h.level === 2).length;
    const h3Count = parsedHeadings.filter((h) => h.level === 3).length;
    const h46Count = parsedHeadings.filter((h) => h.level >= 4).length;
    const totalIssues = parsedHeadings.reduce((acc, h) => acc + h.issues.length, 0);

    const globalErrors: string[] = [];
    if (h1Count === 0) {
      globalErrors.push("Missing <h1> tag. Every webpage should have exactly one primary <h1> heading for SEO.");
    } else if (h1Count > 1) {
      globalErrors.push(`Multiple <h1> tags detected (${h1Count} found). Recommended best practice is a single <h1> heading.`);
    }

    return {
      h1Count,
      h2Count,
      h3Count,
      h46Count,
      totalIssues,
      globalErrors,
    };
  }, [parsedHeadings]);

  // Markdown outline export
  const markdownOutline = useMemo(() => {
    return parsedHeadings
      .map((h) => `${"  ".repeat(h.level - 1)}- [${h.tag.toUpperCase()}] ${h.text || "(empty)"}`)
      .join("\n");
  }, [parsedHeadings]);

  const handleCopyOutline = () => {
    navigator.clipboard.writeText(markdownOutline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadOutline = () => {
    const blob = new Blob([markdownOutline], { type: "text/markdown;charset=utf-8;" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "heading-outline.md";
    a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Shield size={14} /> Client-Side Heading Hierarchy Analyzer
          </span>
          <span className="text-xs text-text-secondary">
            Validates H1–H6 logical nesting &amp; SEO best practices
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setContent(SAMPLE_HTML_OPTIMAL)}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Sample Optimal
          </button>
          <button
            onClick={() => setContent(SAMPLE_HTML_BROKEN)}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-red-500/10 text-red-600 font-medium"
          >
            Sample Broken
          </button>
          <button
            onClick={() => setContent("")}
            disabled={!content}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-red-500/10 text-red-600 font-medium flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Input Code Area */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b-2 border-border pb-2.5">
          <div className="flex items-center gap-2">
            <FileCode size={16} className="text-accent" />
            <span className="font-heading font-bold uppercase text-xs">
              Paste Webpage HTML Source Code or Markdown Headings
            </span>
          </div>
          <span className="font-mono text-xs text-text-secondary">
            {parsedHeadings.length} Headings Extracted
          </span>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Paste full HTML page, body markup, or markdown (# Heading, ## Heading)..."
          className="w-full neo-input p-3 font-mono text-xs leading-relaxed resize-y"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="neo-card p-3 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            H1 Tags
          </div>
          <div className={`text-2xl font-heading font-bold ${audit.h1Count === 1 ? "text-emerald-600" : "text-amber-600"}`}>
            {audit.h1Count}
          </div>
          <div className="text-[10px] text-text-secondary">Expected: 1</div>
        </div>

        <div className="neo-card p-3 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            H2 Sections
          </div>
          <div className="text-2xl font-heading font-bold text-accent">
            {audit.h2Count}
          </div>
          <div className="text-[10px] text-text-secondary">Main topics</div>
        </div>

        <div className="neo-card p-3 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            H3 Subtopics
          </div>
          <div className="text-2xl font-heading font-bold">
            {audit.h3Count}
          </div>
          <div className="text-[10px] text-text-secondary">Sub-sections</div>
        </div>

        <div className="neo-card p-3 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            H4–H6 Tags
          </div>
          <div className="text-2xl font-heading font-bold">
            {audit.h46Count}
          </div>
          <div className="text-[10px] text-text-secondary">Deep details</div>
        </div>

        <div className="neo-card p-3 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Issues Detected
          </div>
          <div className={`text-2xl font-heading font-bold ${audit.totalIssues > 0 || audit.globalErrors.length > 0 ? "text-red-500" : "text-emerald-600"}`}>
            {audit.totalIssues + audit.globalErrors.length}
          </div>
          <div className="text-[10px] text-text-secondary">Hierarchy warnings</div>
        </div>
      </div>

      {/* Global Issues Alert */}
      {audit.globalErrors.length > 0 && (
        <div className="p-3.5 neo-border rounded-lg bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-600" />
          <div className="text-xs space-y-1">
            <div className="font-bold font-heading text-sm uppercase">
              H1 Structure Warning
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              {audit.globalErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Visual Hierarchy Tree Outline */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border pb-2.5">
          <div className="flex items-center gap-2">
            <ListTree size={16} className="text-accent" />
            <span className="font-heading font-bold uppercase text-xs">
              Sequential Heading Hierarchy Outline
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyOutline}
              disabled={parsedHeadings.length === 0}
              className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy Outline"}
            </button>
            <button
              onClick={handleDownloadOutline}
              disabled={parsedHeadings.length === 0}
              className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
            >
              <Download size={12} />
              Export Markdown
            </button>
          </div>
        </div>

        {parsedHeadings.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-xs">
            No headings detected in input content.
          </div>
        ) : (
          <div className="space-y-2">
            {parsedHeadings.map((h) => {
              const hasIssue = h.issues.length > 0;
              const indentPadding = (h.level - 1) * 24;

              let tagBadgeColor = "bg-accent text-white";
              if (h.level === 1) tagBadgeColor = "bg-[#315CFF] text-white";
              else if (h.level === 2) tagBadgeColor = "bg-[#10B981] text-white";
              else if (h.level === 3) tagBadgeColor = "bg-[#F59E0B] text-white";
              else tagBadgeColor = "bg-gray-600 text-white";

              return (
                <div
                  key={h.id}
                  style={{ marginLeft: `${indentPadding}px` }}
                  className={`p-3 rounded neo-border transition-colors ${
                    hasIssue ? "bg-red-500/5 border-red-500/40" : "bg-surface hover:bg-accent/5"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase shrink-0 ${tagBadgeColor}`}>
                        {h.tag}
                      </span>
                      <span className="font-heading font-bold text-xs truncate">
                        {h.text || <em className="text-red-500 font-normal">&lt;empty heading&gt;</em>}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[11px] text-text-secondary font-mono">
                      <span>{h.charCount} chars</span>
                    </div>
                  </div>

                  {/* Issues flagged on this heading */}
                  {hasIssue && (
                    <div className="mt-2 pt-2 border-t border-red-500/20 text-xs space-y-0.5 text-red-600 dark:text-red-400">
                      {h.issues.map((issue, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <XCircle size={12} className="shrink-0" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
