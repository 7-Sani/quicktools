"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Eye,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Copy,
  Check,
  Sparkles,
  Info,
  Star,
  ExternalLink,
  Shield,
  Download,
} from "lucide-react";

export default function SerpSnippetPreviewTool() {
  const [title, setTitle] = useState("Best Free Online Developer & SEO Tools – QuickTools");
  const [url, setUrl] = useState("https://quicktools.app/seo/serp-snippet-preview");
  const [description, setDescription] = useState(
    "Explore fast, private, browser-based online tools for SEO, text formatting, media conversion, and web development. No login required, 100% free."
  );
  const [targetQuery, setTargetQuery] = useState("free online tools");
  const [showDate, setShowDate] = useState(true);
  const [dateStr, setDateStr] = useState("Oct 20, 2026");
  const [showRating, setShowRating] = useState(true);
  const [rating, setRating] = useState("4.9");
  const [reviewCount, setReviewCount] = useState("1,420");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [serpTheme, setSerpTheme] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState(false);

  // Measure title pixel width using HTML Canvas Arial 20px (Google Desktop title font)
  const titlePixelWidth = useMemo(() => {
    if (typeof window === "undefined") return title.length * 9;
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return title.length * 9;
      // Google desktop title uses ~20px Arial/Roboto; mobile uses ~16px
      ctx.font = device === "desktop" ? "20px Arial, sans-serif" : "16px Arial, sans-serif";
      return Math.round(ctx.measureText(title).width);
    } catch {
      return title.length * 9;
    }
  }, [title, device]);

  // Max pixel widths before Google typically truncates
  const maxTitlePixels = device === "desktop" ? 600 : 550;
  const maxDescChars = device === "desktop" ? 160 : 130;

  // Compute breadcrumb path display
  const breadcrumb = useMemo(() => {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      const domain = parsed.hostname.replace(/^www\./, "");
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      if (pathParts.length === 0) return domain;
      return `${domain} › ${pathParts.join(" › ")}`;
    } catch {
      return url;
    }
  }, [url]);

  // Highlight query keywords helper in preview
  const highlightKeywords = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const words = query
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 1)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (words.length === 0) return <span>{text}</span>;

    const regex = new RegExp(`(${words.join("|")})`, "gi");
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <strong key={i} className="font-bold underline decoration-accent/40">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Generated Meta Tags HTML
  const generatedMetaHtml = useMemo(() => {
    return [
      `<!-- Primary Search Engine Meta Tags -->`,
      `<title>${title}</title>`,
      `<meta name="description" content="${description}">`,
      `<link rel="canonical" href="${url}">`,
    ].join("\n");
  }, [title, description, url]);

  const handleCopyMeta = () => {
    navigator.clipboard.writeText(generatedMetaHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([generatedMetaHtml], { type: "text/html;charset=utf-8;" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "serp-meta-tags.html";
    a.click();
    URL.revokeObjectURL(u);
  };

  const loadPreset = (type: "ecommerce" | "blog" | "saas") => {
    if (type === "saas") {
      setTitle("QuickTools – 90+ Free Fast Online Tools for Creators & Developers");
      setUrl("https://quicktools.app");
      setDescription("All-in-one suite of free web tools for SEO, audio trimming, video conversion, and text formatting. Zero installations, 100% in-browser processing.");
      setTargetQuery("free online tools");
    } else if (type === "blog") {
      setTitle("Complete On-Page SEO Checklist for 2026: Boost Organic Rankings");
      setUrl("https://quicktools.app/blog/on-page-seo-checklist-2026");
      setDescription("Step-by-step actionable guide to mastering title tags, meta descriptions, heading hierarchy, JSON-LD schema, and keyword density for higher Google rankings.");
      setTargetQuery("seo checklist 2026");
    } else {
      setTitle("Ergonomic Mechanical Keyboard with RGB Backlight – TechStore");
      setUrl("https://techstore.example.com/keyboards/ergonomic-pro");
      setDescription("Experience ultra-fast typing with custom mechanical switches, wireless multi-device Bluetooth, hot-swappable keys, and ergonomic split layout. Free shipping.");
      setTargetQuery("mechanical keyboard ergonomic");
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Disclaimer & Local analysis note */}
      <div className="p-3.5 neo-border rounded-lg bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-accent shrink-0" />
          <span>
            <strong>Disclaimer:</strong> Realistic simulation for preview purposes only. Google dynamically formats titles and snippets based on search queries, device screen width, and testing algorithms.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => loadPreset("saas")}
            className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            SaaS Preset
          </button>
          <button
            onClick={() => loadPreset("blog")}
            className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Blog Preset
          </button>
          <button
            onClick={() => loadPreset("ecommerce")}
            className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Product Preset
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left column: Inputs & Controls (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Target Query */}
          <div className="neo-card p-4 space-y-2">
            <label className="font-heading font-bold text-xs uppercase text-text-secondary flex items-center justify-between">
              <span>Target Search Query (For Keyword Bold Preview)</span>
              <span className="text-[11px] font-normal lowercase">simulates Google bolding</span>
            </label>
            <input
              type="text"
              value={targetQuery}
              onChange={(e) => setTargetQuery(e.target.value)}
              placeholder="e.g. online developer tools"
              className="w-full neo-input py-1.5 px-3 text-xs font-medium"
            />
          </div>

          {/* Title input */}
          <div className="neo-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-heading font-bold uppercase text-text-secondary">
                Page Title Tag (&lt;title&gt;)
              </label>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className={title.length > 60 ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>
                  {title.length} chars
                </span>
                <span className="text-text-secondary">|</span>
                <span className={titlePixelWidth > maxTitlePixels ? "text-red-500 font-bold" : "text-text-secondary"}>
                  ~{titlePixelWidth}px / {maxTitlePixels}px
                </span>
              </div>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter page title tag..."
              className="w-full neo-input py-2 px-3 text-sm font-medium"
            />
            {/* Progress gauge */}
            <div className="w-full h-1.5 bg-border/20 rounded overflow-hidden">
              <div
                className={`h-full transition-all ${
                  titlePixelWidth > maxTitlePixels
                    ? "bg-red-500"
                    : titlePixelWidth > maxTitlePixels * 0.85
                    ? "bg-emerald-500"
                    : "bg-accent"
                }`}
                style={{ width: `${Math.min((titlePixelWidth / maxTitlePixels) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* URL / Path input */}
          <div className="neo-card p-4 space-y-2">
            <label className="font-heading font-bold text-xs uppercase text-text-secondary">
              Canonical URL / Page Path
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page-path"
              className="w-full neo-input py-1.5 px-3 text-xs font-mono"
            />
          </div>

          {/* Description input */}
          <div className="neo-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-heading font-bold uppercase text-text-secondary">
                Meta Description
              </label>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className={description.length > maxDescChars ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>
                  {description.length} / {maxDescChars} chars
                </span>
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter meta description summary..."
              rows={3}
              className="w-full neo-input p-3 text-xs leading-relaxed"
            />
            {/* Description progress gauge */}
            <div className="w-full h-1.5 bg-border/20 rounded overflow-hidden">
              <div
                className={`h-full transition-all ${
                  description.length > maxDescChars
                    ? "bg-amber-500"
                    : description.length >= 120
                    ? "bg-emerald-500"
                    : "bg-accent"
                }`}
                style={{ width: `${Math.min((description.length / maxDescChars) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Rich Snippets / Extra options */}
          <div className="neo-card p-4 space-y-3">
            <div className="font-heading font-bold text-xs uppercase text-text-secondary border-b-2 border-border pb-2">
              Rich Snippet Extensions
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showDate}
                  onChange={(e) => setShowDate(e.target.checked)}
                  className="rounded accent-accent"
                />
                <span>Include Publish Date</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showRating}
                  onChange={(e) => setShowRating(e.target.checked)}
                  className="rounded accent-accent"
                />
                <span>Star Ratings &amp; Reviews</span>
              </label>
            </div>

            {showDate && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-secondary">Date Label:</span>
                <input
                  type="text"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="neo-input py-1 px-2 text-xs w-36"
                />
              </div>
            )}

            {showRating && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-secondary block mb-1">Score (0–5):</span>
                  <input
                    type="text"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="neo-input py-1 px-2 text-xs w-full font-mono"
                  />
                </div>
                <div>
                  <span className="text-text-secondary block mb-1">Reviews Count:</span>
                  <input
                    type="text"
                    value={reviewCount}
                    onChange={(e) => setReviewCount(e.target.value)}
                    className="neo-input py-1 px-2 text-xs w-full font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Interactive SERP Preview (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-4 space-y-4">
            {/* Preview controls: device and theme toggles */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border pb-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDevice("desktop")}
                  className={`px-3 py-1 neo-border rounded text-xs font-heading font-bold uppercase transition-colors flex items-center gap-1.5 ${
                    device === "desktop" ? "bg-accent text-white" : "bg-surface hover:bg-accent/10"
                  }`}
                >
                  <Monitor size={13} /> Desktop
                </button>
                <button
                  onClick={() => setDevice("mobile")}
                  className={`px-3 py-1 neo-border rounded text-xs font-heading font-bold uppercase transition-colors flex items-center gap-1.5 ${
                    device === "mobile" ? "bg-accent text-white" : "bg-surface hover:bg-accent/10"
                  }`}
                >
                  <Smartphone size={13} /> Mobile
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSerpTheme(serpTheme === "light" ? "dark" : "light")}
                  className="px-2.5 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1.5"
                >
                  {serpTheme === "light" ? <Moon size={13} /> : <Sun size={13} />}
                  <span>{serpTheme === "light" ? "Dark SERP" : "Light SERP"}</span>
                </button>
              </div>
            </div>

            {/* Google SERP Simulated Container */}
            <div
              className={`p-5 rounded-lg border transition-all ${
                serpTheme === "dark"
                  ? "bg-[#202124] text-[#bdc1c6] border-[#3c4043]"
                  : "bg-white text-[#4d5156] border-gray-200"
              } ${device === "mobile" ? "max-w-sm mx-auto shadow-md" : "w-full"}`}
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {/* Google Brand / Favicon line */}
              <div className="flex items-center gap-3 mb-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    serpTheme === "dark" ? "bg-[#303134] text-white" : "bg-[#f1f3f4] text-[#202124]"
                  }`}
                >
                  🌐
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className={`text-xs truncate ${serpTheme === "dark" ? "text-[#dadce0]" : "text-[#202124]"}`}>
                    {url.split("//")[1]?.split("/")[0] || "example.com"}
                  </div>
                  <div className={`text-[11px] truncate ${serpTheme === "dark" ? "text-[#9aa0a6]" : "text-[#4d5156]"}`}>
                    {breadcrumb}
                  </div>
                </div>
              </div>

              {/* Title line */}
              <div className="mb-1.5">
                <h3
                  className={`hover:underline cursor-pointer leading-snug line-clamp-2 ${
                    device === "desktop" ? "text-[20px]" : "text-[16px]"
                  } ${
                    serpTheme === "dark"
                      ? "text-[#8ab4f8] font-normal"
                      : "text-[#1a0dab] font-normal"
                  }`}
                >
                  {highlightKeywords(title || "Page Title Here", targetQuery)}
                </h3>
              </div>

              {/* Rich snippet stars if enabled */}
              {showRating && (
                <div className="flex items-center gap-1.5 text-xs mb-1.5 text-amber-500 font-medium">
                  <div className="flex items-center">
                    {"★".repeat(5)}
                  </div>
                  <span className={serpTheme === "dark" ? "text-[#bdc1c6]" : "text-[#4d5156]"}>
                    Rating: {rating} · ‎{reviewCount} votes
                  </span>
                </div>
              )}

              {/* Description snippet */}
              <div
                className={`text-[14px] leading-relaxed line-clamp-3 ${
                  serpTheme === "dark" ? "text-[#bdc1c6]" : "text-[#4d5156]"
                }`}
              >
                {showDate && (
                  <span className={`font-normal ${serpTheme === "dark" ? "text-[#9aa0a6]" : "text-[#70757a]"}`}>
                    {dateStr} —{" "}
                  </span>
                )}
                {highlightKeywords(
                  description || "Meta description provides a brief summary of page contents in search engine results...",
                  targetQuery
                )}
              </div>
            </div>

            {/* Generated HTML Output */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold uppercase text-text-secondary">
                  HTML Output Code
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMeta}
                    className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy Tags"}
                  </button>
                  <button
                    onClick={handleDownloadHtml}
                    className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
                  >
                    <Download size={12} />
                    Download
                  </button>
                </div>
              </div>
              <pre className="p-3 neo-border rounded bg-surface font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed text-text">
                {generatedMetaHtml}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
