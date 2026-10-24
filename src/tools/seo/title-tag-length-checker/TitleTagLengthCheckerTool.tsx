"use client";

import React, { useState, useMemo } from "react";
import {
  Heading1,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Shield,
  Monitor,
  Smartphone,
  Plus,
} from "lucide-react";

const SAMPLE_TITLES = [
  {
    label: "Optimal SEO Title",
    text: "Free Online Video Compressor – Reduce File Size Without Quality Loss | QuickTools",
  },
  {
    label: "Too Short Example",
    text: "Video Compressor",
  },
  {
    label: "Excessive Length (Cutoff)",
    text: "Best Free Online Video Compressor 2026: Compress MP4, WebM, MOV, and AVI Files Easily Without Watermarks or Limits for YouTube and Instagram Video Uploads",
  },
];

const SEPARATORS = ["|", "–", "—", "-", "•", "»"];

export default function TitleTagLengthCheckerTool() {
  const [title, setTitle] = useState(
    "Keyword Density Checker – Free SEO Content Analyzer | QuickTools"
  );
  const [brandSuffix, setBrandSuffix] = useState("QuickTools");
  const [copied, setCopied] = useState(false);

  // Character count
  const charCount = title.length;

  // Pixel measurement using Canvas font 20px Arial (Google desktop)
  const pixelWidth = useMemo(() => {
    if (typeof window === "undefined") return Math.round(charCount * 9.5);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return Math.round(charCount * 9.5);
      ctx.font = "20px Arial, sans-serif";
      return Math.round(ctx.measureText(title).width);
    } catch {
      return Math.round(charCount * 9.5);
    }
  }, [title, charCount]);

  const DESKTOP_MAX_PIXELS = 600;
  const MOBILE_MAX_PIXELS = 550;

  // Status computation
  const status = useMemo(() => {
    if (charCount === 0) {
      return {
        label: "Empty",
        color: "text-text-secondary",
        badge: "bg-surface text-text-secondary",
        message: "Enter a title tag to analyze its pixel width and character length.",
      };
    }
    if (charCount < 30) {
      return {
        label: "Too Short",
        color: "text-amber-600",
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
        message: "Title is very short (<30 characters). You have plenty of room to include descriptive keywords or your brand name.",
      };
    }
    if (charCount < 50) {
      return {
        label: "Good / Slightly Short",
        color: "text-blue-600",
        badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
        message: "Good title length. Won't be truncated, though you can still add a secondary keyword or brand suffix.",
      };
    }
    if (charCount <= 60 && pixelWidth <= DESKTOP_MAX_PIXELS) {
      return {
        label: "Optimal Length",
        color: "text-emerald-600",
        badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        message: "Optimal length! Between 50–60 characters and within Google's ~600px pixel boundary.",
      };
    }
    if (pixelWidth > DESKTOP_MAX_PIXELS) {
      return {
        label: "Truncated by Google",
        color: "text-red-600",
        badge: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
        message: `Exceeds 600px limit (${pixelWidth}px). Search engines will cut off this title with an ellipsis (...).`,
      };
    }
    return {
      label: "Borderline Length",
      color: "text-amber-600",
      badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
      message: "Over 60 characters. It might display fully if it uses narrow characters (like 'l' or 'i'), but risks truncation.",
    };
  }, [charCount, pixelWidth]);

  // Quality Audit
  const audit = useMemo(() => {
    const isAllCaps = title.length > 5 && title === title.toUpperCase();
    const hasSeparator = SEPARATORS.some((sep) => title.includes(sep));
    const words = title.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];
    const wordCounts = new Map<string, number>();
    let duplicateWord: string | null = null;

    for (const w of words) {
      if (w.length > 3) {
        const count = (wordCounts.get(w) || 0) + 1;
        wordCounts.set(w, count);
        if (count >= 3 && !duplicateWord) {
          duplicateWord = w;
        }
      }
    }

    return {
      isAllCaps,
      hasSeparator,
      duplicateWord,
    };
  }, [title]);

  // Truncate title simulation based on ~600px limit
  const truncatedPreview = useMemo(() => {
    if (pixelWidth <= DESKTOP_MAX_PIXELS) return title;
    let truncated = "";
    if (typeof window === "undefined") return title.slice(0, 58) + "...";
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return title.slice(0, 58) + "...";
      ctx.font = "20px Arial, sans-serif";
      for (let i = 0; i < title.length; i++) {
        const testStr = title.slice(0, i + 1) + "...";
        if (ctx.measureText(testStr).width > DESKTOP_MAX_PIXELS) {
          break;
        }
        truncated = title.slice(0, i + 1);
      }
      return truncated + "...";
    } catch {
      return title.slice(0, 58) + "...";
    }
  }, [title, pixelWidth]);

  // Append separator & brand
  const handleAppendBrand = (separator: string) => {
    if (!brandSuffix.trim()) return;
    const cleanCurrent = title.trim();
    setTitle(`${cleanCurrent} ${separator} ${brandSuffix.trim()}`);
  };

  // Safe HTML tags
  const generatedHtml = useMemo(() => {
    const escaped = title.replace(/"/g, "&quot;");
    return `<title>${escaped}</title>\n<meta name="title" content="${escaped}">`;
  }, [title]);

  const handleCopyTag = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedHtml], { type: "text/html;charset=utf-8;" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "title-tags.html";
    a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Shield size={14} /> Real-Time Pixel &amp; Character Meter
          </span>
          <span className="text-xs text-text-secondary">
            Recommended: 50–60 characters (max 600px desktop / 550px mobile)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTitle("")}
            disabled={!title}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-red-500/10 text-red-600 font-medium flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="neo-card p-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-heading font-bold uppercase text-text-secondary mr-1">
          Preset Examples:
        </span>
        {SAMPLE_TITLES.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setTitle(preset.text)}
            className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Title Tag Input Card */}
      <div className="neo-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-border pb-3">
          <div className="flex items-center gap-2">
            <Heading1 size={18} className="text-accent" />
            <span className="font-heading font-bold uppercase text-sm">
              Page Title (&lt;title&gt;) Tag
            </span>
          </div>

          <div className={`px-2.5 py-0.5 neo-border rounded text-xs font-heading font-bold uppercase ${status.badge}`}>
            {status.label}
          </div>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter or paste your page title tag here..."
          className="w-full neo-input py-2.5 px-3 text-base font-medium"
        />

        {/* Meters */}
        <div className="grid sm:grid-cols-2 gap-4 pt-1">
          {/* Character meter */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-heading font-bold uppercase text-text-secondary">
                Characters: <span className={status.color}>{charCount} / 60</span>
              </span>
              <span className="text-[11px] text-text-secondary">Optimal: 50–60</span>
            </div>
            <div className="w-full h-2.5 bg-border/20 rounded overflow-hidden relative">
              {/* Optimal zone guide 50-60 */}
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"
                style={{ left: `${(50 / 80) * 100}%`, width: `${(10 / 80) * 100}%` }}
              />
              <div
                className={`h-full transition-all ${
                  charCount > 60
                    ? "bg-red-500"
                    : charCount >= 50
                    ? "bg-emerald-500"
                    : charCount >= 30
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${Math.min((charCount / 80) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Pixel width meter */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-heading font-bold uppercase text-text-secondary">
                Pixel Width: <span className={pixelWidth > DESKTOP_MAX_PIXELS ? "text-red-500 font-bold" : "font-mono font-bold"}>
                  ~{pixelWidth}px / {DESKTOP_MAX_PIXELS}px
                </span>
              </span>
              <span className="text-[11px] text-text-secondary">
                {pixelWidth > DESKTOP_MAX_PIXELS ? "Cutoff (+ " + (pixelWidth - DESKTOP_MAX_PIXELS) + "px)" : "Safe"}
              </span>
            </div>
            <div className="w-full h-2.5 bg-border/20 rounded overflow-hidden">
              <div
                className={`h-full transition-all ${
                  pixelWidth > DESKTOP_MAX_PIXELS ? "bg-red-500" : "bg-accent"
                }`}
                style={{ width: `${Math.min((pixelWidth / DESKTOP_MAX_PIXELS) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-text-secondary pt-1">{status.message}</p>
      </div>

      {/* Brand & Separator Insertion Helper */}
      <div className="neo-card p-4 space-y-3">
        <div className="font-heading font-bold text-xs uppercase text-text-secondary border-b-2 border-border pb-2">
          Brand Suffix &amp; Separator Helper
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">Brand Name:</span>
            <input
              type="text"
              value={brandSuffix}
              onChange={(e) => setBrandSuffix(e.target.value)}
              placeholder="e.g. QuickTools"
              className="neo-input py-1 px-2 text-xs w-36"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-text-secondary mr-1">Append with:</span>
            {SEPARATORS.map((sep) => (
              <button
                key={sep}
                onClick={() => handleAppendBrand(sep)}
                disabled={!brandSuffix.trim()}
                className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-mono font-bold text-xs disabled:opacity-40"
              >
                {sep} {brandSuffix}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Truncation Simulation */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b-2 border-border pb-2">
          <span className="font-heading font-bold uppercase text-xs text-text-secondary flex items-center gap-1.5">
            <Monitor size={14} className="text-accent" /> Simulated Google SERP Cutoff (Desktop ~600px)
          </span>
          {pixelWidth > DESKTOP_MAX_PIXELS && (
            <span className="text-red-500 text-xs font-semibold">
              Truncation Occurring
            </span>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-[#202124] rounded neo-border">
          <div className="text-xs text-[#202124] dark:text-[#dadce0] mb-1">
            example.com › tools › page
          </div>
          <h3
            className="text-[20px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {truncatedPreview || "Page Title Will Render Here"}
          </h3>
          <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] mt-1" style={{ fontFamily: "Arial, sans-serif" }}>
            The snippet preview simulates whether your title tag fits within Google&apos;s standard desktop display boundaries.
          </p>
        </div>
      </div>

      {/* Quality Best Practices */}
      <div className="neo-card p-4 space-y-3">
        <div className="font-heading font-bold text-xs uppercase text-text-secondary border-b-2 border-border pb-2">
          SEO Title Best Practices
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded neo-border bg-surface">
            {charCount >= 50 && charCount <= 60 && pixelWidth <= DESKTOP_MAX_PIXELS ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">Safe Character &amp; Pixel Limit</span>
              <span className="text-text-secondary">
                {charCount >= 50 && charCount <= 60
                  ? "Ideal length avoids Google truncating your title in SERPs."
                  : "Aim for 50–60 characters to maximize CTR and visibility."}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded neo-border bg-surface">
            {audit.hasSeparator ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">Brand Separator Format</span>
              <span className="text-text-secondary">
                {audit.hasSeparator
                  ? "Good clean separation between primary topic and brand."
                  : "Consider using a pipe (|) or dash (–) to separate your page topic and site brand."}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded neo-border bg-surface">
            {!audit.isAllCaps ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">Capitalization Cleanliness</span>
              <span className="text-text-secondary">
                {audit.isAllCaps
                  ? "ALL CAPS titles look like spam and consume excessive pixel width. Use Title Case."
                  : "Normal casing maintains professional credibility."}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded neo-border bg-surface">
            {!audit.duplicateWord ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">Keyword Cannibalization</span>
              <span className="text-text-secondary">
                {audit.duplicateWord
                  ? `Noticeably repeating "${audit.duplicateWord}" 3+ times. Avoid keyword stuffing in titles.`
                  : "No repetitive keyword stuffing detected."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated HTML Code */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b-2 border-border pb-2">
          <span className="font-heading font-bold uppercase text-xs text-text-secondary">
            Generated Title HTML Tags
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTag}
              className="px-2.5 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy Tags"}
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
          {generatedHtml}
        </pre>
      </div>
    </div>
  );
}
