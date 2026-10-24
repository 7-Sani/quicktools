"use client";

import React, { useState, useMemo } from "react";
import {
  AlignLeft,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  Shield,
  Smartphone,
  Monitor,
} from "lucide-react";

const SAMPLE_DESCRIPTIONS = [
  {
    label: "Optimal SaaS Description",
    text: "Convert, compress, and edit audio, video, and PDF files directly in your web browser. Fast, 100% private, and completely free. Start editing now!",
  },
  {
    label: "Too Short Example",
    text: "Best developer tools website with free utilities.",
  },
  {
    label: "Truncated / Overly Long Example",
    text: "Welcome to QuickTools, the absolute ultimate number one destination for every single digital creator, developer, designer, and content publisher on the internet! We offer over ninety completely free, high-performance browser-based tools including video compressors, MP3 cutters, JSON formatters, and much more without requiring any signups, credit cards, or hidden fees whatsoever.",
  },
];

const CTA_WORDS = [
  "buy", "shop", "get", "try", "start", "learn", "discover", "explore",
  "find", "download", "check", "see", "read", "sign up", "join", "save",
  "compare", "calculate", "convert", "generate",
];

export default function MetaDescriptionLengthCheckerTool() {
  const [description, setDescription] = useState(
    "Explore 90+ free fast online tools for audio, video, PDF, text, and web development. No login required, 100% private in-browser processing. Try it today!"
  );
  const [copied, setCopied] = useState(false);

  // Character length
  const charCount = description.length;
  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;

  // Approximate pixel width in Arial 14px (standard Google snippet font)
  const estimatedPixelWidth = useMemo(() => {
    if (typeof window === "undefined") return Math.round(charCount * 8.4);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return Math.round(charCount * 8.4);
      ctx.font = "14px Arial, sans-serif";
      return Math.round(ctx.measureText(description).width);
    } catch {
      return Math.round(charCount * 8.4);
    }
  }, [description, charCount]);

  // Desktop max safe: ~960px (~158-160 chars)
  // Mobile max safe: ~680px (~120-130 chars)
  const DESKTOP_MAX_PIXELS = 960;
  const DESKTOP_OPTIMAL_MIN = 120;
  const DESKTOP_OPTIMAL_MAX = 158;

  // Length status classification
  const status = useMemo(() => {
    if (charCount === 0) {
      return {
        label: "Empty",
        color: "text-text-secondary",
        badge: "bg-surface text-text-secondary",
        message: "Enter a meta description to analyze its length and quality.",
      };
    }
    if (charCount < 70) {
      return {
        label: "Too Short",
        color: "text-amber-600",
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
        message: "Search engines may ignore descriptions that are too brief and generate their own automated snippet.",
      };
    }
    if (charCount < DESKTOP_OPTIMAL_MIN) {
      return {
        label: "Slightly Short",
        color: "text-blue-600",
        badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
        message: "Acceptable for mobile, but you have space for more persuasive keywords and benefits on desktop.",
      };
    }
    if (charCount <= DESKTOP_OPTIMAL_MAX) {
      return {
        label: "Optimal Length",
        color: "text-emerald-600",
        badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        message: "Perfect length! Likely to display fully without truncation on most desktop search result pages.",
      };
    }
    if (charCount <= 165) {
      return {
        label: "Risk of Truncation",
        color: "text-amber-600",
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
        message: "Borderline. Depending on character width (e.g. 'W' vs 'i'), Google may cut off the end with ellipses (...).",
      };
    }
    return {
      label: "Truncated",
      color: "text-red-600",
      badge: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
      message: "Exceeds Google's display limit. The end of this description will almost certainly be truncated in search results.",
    };
  }, [charCount]);

  // Checklist audit
  const audit = useMemo(() => {
    const hasCta = CTA_WORDS.some((word) =>
      new RegExp(`\\b${word}\\b`, "i").test(description)
    );
    const hasUnescapedQuotes = description.includes('"');
    const endsWithPeriod = /[.!?]$/.test(description.trim());
    const hasGoodWordCount = wordCount >= 15 && wordCount <= 30;

    return {
      hasCta,
      hasUnescapedQuotes,
      endsWithPeriod,
      hasGoodWordCount,
    };
  }, [description, wordCount]);

  // Safe HTML output
  const safeHtmlTag = useMemo(() => {
    const escaped = description.replace(/"/g, "&quot;");
    return `<meta name="description" content="${escaped}">`;
  }, [description]);

  const handleCopyTag = () => {
    navigator.clipboard.writeText(safeHtmlTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([safeHtmlTag], { type: "text/html;charset=utf-8;" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "meta-description.html";
    a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Shield size={14} /> Client-Side Metric Checker
          </span>
          <span className="text-xs text-text-secondary">
            Recommended: 120–158 characters (max ~960px)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDescription("")}
            disabled={!description}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-red-500/10 text-red-600 font-medium flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="neo-card p-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-heading font-bold uppercase text-text-secondary mr-1">
          Sample Templates:
        </span>
        {SAMPLE_DESCRIPTIONS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setDescription(preset.text)}
            className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="neo-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-border pb-3">
          <div className="flex items-center gap-2">
            <AlignLeft size={16} className="text-accent" />
            <span className="font-heading font-bold uppercase text-sm">
              Meta Description Content
            </span>
          </div>

          <div className={`px-2.5 py-0.5 neo-border rounded text-xs font-heading font-bold uppercase ${status.badge}`}>
            {status.label}
          </div>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter or paste your meta description here to check character count, pixel width, and truncation..."
          rows={4}
          className="w-full neo-input p-3 text-sm leading-relaxed"
        />

        {/* Live Gauges */}
        <div className="space-y-3 pt-2">
          {/* Character progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-heading font-bold uppercase text-text-secondary">
                Character Count: <span className={status.color}>{charCount} / 158</span> chars
              </span>
              <span className="text-text-secondary">
                Words: {wordCount}
              </span>
            </div>
            <div className="w-full h-2.5 bg-border/20 rounded overflow-hidden relative">
              {/* Optimal zone guide markers (120 to 158) */}
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"
                style={{ left: `${(120 / 200) * 100}%`, width: `${((158 - 120) / 200) * 100}%` }}
              />
              <div
                className={`h-full transition-all ${
                  charCount > 165
                    ? "bg-red-500"
                    : charCount >= 120 && charCount <= 158
                    ? "bg-emerald-500"
                    : charCount < 70
                    ? "bg-amber-500"
                    : "bg-accent"
                }`}
                style={{ width: `${Math.min((charCount / 200) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Pixel progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-heading font-bold uppercase text-text-secondary">
                Estimated Desktop Width: <span className="font-mono font-bold">~{estimatedPixelWidth}px</span> / {DESKTOP_MAX_PIXELS}px
              </span>
              <span className="text-text-secondary">
                {estimatedPixelWidth > DESKTOP_MAX_PIXELS ? "Cutoff on Desktop" : "Fits Desktop Width"}
              </span>
            </div>
            <div className="w-full h-2 bg-border/20 rounded overflow-hidden">
              <div
                className={`h-full transition-all ${
                  estimatedPixelWidth > DESKTOP_MAX_PIXELS ? "bg-red-500" : "bg-accent"
                }`}
                style={{ width: `${Math.min((estimatedPixelWidth / DESKTOP_MAX_PIXELS) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-text-secondary pt-1">{status.message}</p>
      </div>

      {/* Truncation Previews: Desktop vs Mobile */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Desktop Preview */}
        <div className="neo-card p-4 space-y-2">
          <div className="flex items-center gap-1.5 font-heading font-bold text-xs uppercase text-text-secondary border-b-2 border-border pb-2">
            <Monitor size={14} className="text-accent" /> Desktop Snippet Simulation
          </div>
          <div className="p-3 bg-surface rounded neo-border text-xs leading-relaxed font-sans text-text">
            <span className="font-bold text-accent block text-sm mb-1 hover:underline cursor-pointer">
              Your Page Title Appears Here Online
            </span>
            <p className="text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
              {description || "Meta description snippet will render here..."}
            </p>
          </div>
          <div className="text-[11px] text-text-secondary">
            Desktop display typically clips descriptions longer than 158–160 characters.
          </div>
        </div>

        {/* Mobile Preview */}
        <div className="neo-card p-4 space-y-2">
          <div className="flex items-center gap-1.5 font-heading font-bold text-xs uppercase text-text-secondary border-b-2 border-border pb-2">
            <Smartphone size={14} className="text-accent" /> Mobile Snippet Simulation
          </div>
          <div className="p-3 bg-surface rounded neo-border text-xs leading-relaxed font-sans text-text">
            <span className="font-bold text-accent block text-sm mb-1 hover:underline cursor-pointer">
              Your Page Title Appears Here Online
            </span>
            <p className="text-[#4d5156] dark:text-[#bdc1c6] line-clamp-3">
              {description || "Meta description snippet will render here..."}
            </p>
          </div>
          <div className="text-[11px] text-text-secondary">
            Mobile displays can show 2–3 shorter lines (roughly 120–130 characters max).
          </div>
        </div>
      </div>

      {/* Quality Audit Checklist */}
      <div className="neo-card p-4 space-y-3">
        <div className="font-heading font-bold text-xs uppercase text-text-secondary border-b-2 border-border pb-2">
          SEO Quality Best Practices Checklist
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded neo-border bg-surface">
            {charCount >= 120 && charCount <= 160 ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">Optimal Length (120–160 Chars)</span>
              <span className="text-text-secondary">
                Current: {charCount} chars. {charCount >= 120 && charCount <= 160 ? "Great job!" : "Adjust for maximum SERP visibility."}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded neo-border bg-surface">
            {audit.hasCta ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">Action-Oriented Call-to-Action (CTA)</span>
              <span className="text-text-secondary">
                {audit.hasCta
                  ? "Contains action verb to improve organic Click-Through Rate (CTR)."
                  : "Consider adding action verbs like 'Explore', 'Discover', 'Get', or 'Try'."}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded neo-border bg-surface">
            {!audit.hasUnescapedQuotes ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">HTML Quotes Safety</span>
              <span className="text-text-secondary">
                {audit.hasUnescapedQuotes
                  ? "Contains double quotes (\") which can prematurely terminate HTML attributes. We will automatically escape them."
                  : "No dangerous double quotes detected in text."}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded neo-border bg-surface">
            {audit.endsWithPeriod ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">Punctuation &amp; Sentence Ending</span>
              <span className="text-text-secondary">
                {audit.endsWithPeriod
                  ? "Ends with proper punctuation mark (. ! ?)."
                  : "Finish with a closing punctuation mark for complete presentation."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Meta Tag HTML */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b-2 border-border pb-2">
          <span className="font-heading font-bold uppercase text-xs text-text-secondary">
            Generated HTML Tag
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTag}
              className="px-2.5 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy Tag"}
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
            >
              <Download size={12} />
              Download
            </button>
          </div>
        </div>

        <pre className="p-3 neo-border rounded bg-surface font-mono text-xs overflow-x-auto text-text">
          {safeHtmlTag}
        </pre>
      </div>
    </div>
  );
}
