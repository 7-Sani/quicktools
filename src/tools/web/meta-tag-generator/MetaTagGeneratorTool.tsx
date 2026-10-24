"use client";

import React, { useState, useMemo } from "react";
import {
  Code2,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Download,
  Eye,
  Globe,
  Share2,
  Sparkles,
  Info,
} from "lucide-react";

export default function MetaTagGeneratorTool() {
  const [title, setTitle] = useState("QuickTools – Free Fast Online Tools for Developers & Creators");
  const [description, setDescription] = useState(
    "Over 90 free web utilities for audio, video, text, security, and developer workflows. No signup required, fast processing, and 100% private."
  );
  const [canonicalUrl, setCanonicalUrl] = useState("https://quicktools.app");
  const [keywords, setKeywords] = useState("web tools, online utilities, free developer tools, audio cutter, video compressor");
  const [author, setAuthor] = useState("QuickTools Team");
  const [robots, setRobots] = useState("index, follow");
  const [ogType, setOgType] = useState<"website" | "article" | "product">("website");
  const [siteName, setSiteName] = useState("QuickTools");
  const [imageUrl, setImageUrl] = useState("https://quicktools.app/og-image.png");
  const [twitterCard, setTwitterCard] = useState<"summary_large_image" | "summary">("summary_large_image");
  const [twitterSite, setTwitterSite] = useState("@quicktools");
  const [activePreview, setActivePreview] = useState<"google" | "social">("google");
  const [copied, setCopied] = useState(false);

  // Generate full HTML meta tags block
  const generatedHtml = useMemo(() => {
    const lines: string[] = [
      `<!-- Primary Meta Tags -->`,
      `<title>${title}</title>`,
      `<meta name="title" content="${title}">`,
      `<meta name="description" content="${description}">`,
    ];

    if (keywords.trim()) {
      lines.push(`<meta name="keywords" content="${keywords}">`);
    }
    if (author.trim()) {
      lines.push(`<meta name="author" content="${author}">`);
    }
    if (robots.trim()) {
      lines.push(`<meta name="robots" content="${robots}">`);
    }
    if (canonicalUrl.trim()) {
      lines.push(`<link rel="canonical" href="${canonicalUrl}">`);
    }

    lines.push(
      ``,
      `<!-- Open Graph / Facebook / LinkedIn -->`,
      `<meta property="og:type" content="${ogType}">`,
      `<meta property="og:url" content="${canonicalUrl || "https://example.com"}">`,
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${description}">`
    );

    if (imageUrl.trim()) {
      lines.push(`<meta property="og:image" content="${imageUrl}">`);
    }
    if (siteName.trim()) {
      lines.push(`<meta property="og:site_name" content="${siteName}">`);
    }

    lines.push(
      ``,
      `<!-- Twitter / X Cards -->`,
      `<meta name="twitter:card" content="${twitterCard}">`,
      `<meta name="twitter:url" content="${canonicalUrl || "https://example.com"}">`,
      `<meta name="twitter:title" content="${title}">`,
      `<meta name="twitter:description" content="${description}">`
    );

    if (imageUrl.trim()) {
      lines.push(`<meta name="twitter:image" content="${imageUrl}">`);
    }
    if (twitterSite.trim()) {
      lines.push(`<meta name="twitter:site" content="${twitterSite}">`);
    }

    return lines.join("\n");
  }, [
    title,
    description,
    canonicalUrl,
    keywords,
    author,
    robots,
    ogType,
    siteName,
    imageUrl,
    twitterCard,
    twitterSite,
  ]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meta-tags.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadPreset = (type: "saas" | "blog" | "ecommerce") => {
    if (type === "saas") {
      setTitle("NextGen Cloud Analytics – Real-Time Telemetry & APM Platform");
      setDescription("Monitor, trace, and debug distributed microservices with zero overhead. Automated latency alerts and AI-driven root cause detection for high-scale teams.");
      setCanonicalUrl("https://nextgenanalytics.io");
      setKeywords("analytics, observability, apm, telemetry, cloud monitoring");
      setOgType("website");
      setSiteName("NextGen Analytics");
      setImageUrl("https://nextgenanalytics.io/static/og-banner.jpg");
      setTwitterCard("summary_large_image");
      setTwitterSite("@nextgenanalytics");
    } else if (type === "blog") {
      setTitle("Mastering TypeScript in 2026: Comprehensive Architecture Guide");
      setDescription("A deep-dive tutorial covering advanced generic inference, template literal types, and enterprise architecture patterns in modern TypeScript.");
      setCanonicalUrl("https://devinsights.com/articles/mastering-typescript-2026");
      setKeywords("typescript, javascript, web development, software engineering");
      setOgType("article");
      setSiteName("DevInsights");
      setImageUrl("https://devinsights.com/images/articles/ts-guide-cover.png");
      setTwitterCard("summary_large_image");
      setTwitterSite("@devinsights");
    } else {
      setTitle("Ergonomic Mechanical Keyboard (Hot-Swappable RGB) – KeyCraft");
      setDescription("Premium custom aluminum mechanical keyboard featuring hot-swappable tactile switches, double-shot PBT keycaps, and wireless Bluetooth 5.3.");
      setCanonicalUrl("https://keycraft.store/products/ergonomic-keyboard");
      setKeywords("mechanical keyboard, custom keyboard, tactile switches, keycaps");
      setOgType("product");
      setSiteName("KeyCraft Store");
      setImageUrl("https://keycraft.store/media/keyboard-hero.jpg");
      setTwitterCard("summary_large_image");
      setTwitterSite("@keycraft");
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Bar */}
      <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <span className="font-heading font-bold uppercase text-xs tracking-wide">
            Template Presets:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadPreset("saas")}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            SaaS Landing Page
          </button>
          <button
            onClick={() => loadPreset("blog")}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Blog Article
          </button>
          <button
            onClick={() => loadPreset("ecommerce")}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            E-Commerce Product
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Form: Meta Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Basic Search Engine Meta */}
          <div className="neo-card p-5 space-y-4">
            <div className="font-heading font-bold uppercase text-sm tracking-wide border-b-2 border-border pb-3 flex items-center justify-between">
              <span>Basic SEO Information</span>
              <span className="text-xs text-text-secondary">Standard HTML &lt;head&gt;</span>
            </div>

            {/* Page Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-heading font-bold uppercase text-text-secondary">
                  Page Title (&lt;title&gt;) <span className="text-red-500">*</span>
                </label>
                <span
                  className={`font-mono text-xs ${
                    title.length > 60
                      ? "text-amber-600 font-bold"
                      : title.length >= 30
                      ? "text-emerald-600 font-bold"
                      : "text-text-secondary"
                  }`}
                >
                  {title.length}/60 chars (Recommended 50–60)
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Catchy, relevant page title for search engines"
                className="w-full neo-input py-2 px-3 text-sm font-medium"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-heading font-bold uppercase text-text-secondary">
                  Meta Description <span className="text-red-500">*</span>
                </label>
                <span
                  className={`font-mono text-xs ${
                    description.length > 160
                      ? "text-amber-600 font-bold"
                      : description.length >= 120
                      ? "text-emerald-600 font-bold"
                      : "text-text-secondary"
                  }`}
                >
                  {description.length}/160 chars (Recommended 150–160)
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the page content that appears in search results..."
                rows={3}
                className="w-full neo-input p-3 text-xs leading-relaxed"
              />
            </div>

            {/* Canonical URL & Author */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className="w-full neo-input py-2 px-3 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  Robots Indexing
                </label>
                <select
                  value={robots}
                  onChange={(e) => setRobots(e.target.value)}
                  className="w-full neo-input py-2 px-3 text-xs bg-bg"
                >
                  <option value="index, follow">index, follow (Default, recommended)</option>
                  <option value="noindex, follow">noindex, follow (Hide page, follow links)</option>
                  <option value="index, nofollow">index, nofollow (Index page, ignore links)</option>
                  <option value="noindex, nofollow">noindex, nofollow (Completely block search)</option>
                </select>
              </div>
            </div>

            {/* Keywords & Author */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="tools, productivity, software"
                  className="w-full neo-input py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  Author / Organization
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author or Company Name"
                  className="w-full neo-input py-2 px-3 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Social Graph Tags (OG & Twitter) */}
          <div className="neo-card p-5 space-y-4">
            <div className="font-heading font-bold uppercase text-sm tracking-wide border-b-2 border-border pb-3 flex items-center justify-between">
              <span>Social Media Meta (Open Graph & Twitter)</span>
              <span className="text-xs text-text-secondary">Rich Share Cards</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  Open Graph Type
                </label>
                <select
                  value={ogType}
                  onChange={(e) => setOgType(e.target.value as "website" | "article" | "product")}
                  className="w-full neo-input py-2 px-3 text-xs bg-bg"
                >
                  <option value="website">website</option>
                  <option value="article">article (blog post)</option>
                  <option value="product">product</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="My Brand Name"
                  className="w-full neo-input py-2 px-3 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                Featured OG / Social Image URL (1200 x 630 recommended)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/images/og-share.jpg"
                className="w-full neo-input py-2 px-3 text-xs font-mono"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  Twitter Card Format
                </label>
                <select
                  value={twitterCard}
                  onChange={(e) => setTwitterCard(e.target.value as "summary_large_image" | "summary")}
                  className="w-full neo-input py-2 px-3 text-xs bg-bg"
                >
                  <option value="summary_large_image">summary_large_image (Large Hero Banner)</option>
                  <option value="summary">summary (Small Square Thumbnail)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  Twitter / X @Handle
                </label>
                <input
                  type="text"
                  value={twitterSite}
                  onChange={(e) => setTwitterSite(e.target.value)}
                  placeholder="@yourcompany"
                  className="w-full neo-input py-2 px-3 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Live Previews (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Switcher Card */}
          <div className="neo-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <span className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
                <Eye size={16} className="text-accent" />
                Live Snippet Preview
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActivePreview("google")}
                  className={`text-xs px-2.5 py-1 neo-border rounded font-heading font-semibold uppercase ${
                    activePreview === "google"
                      ? "bg-accent text-white"
                      : "bg-surface hover:bg-bg text-text-secondary"
                  }`}
                >
                  Google SERP
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreview("social")}
                  className={`text-xs px-2.5 py-1 neo-border rounded font-heading font-semibold uppercase ${
                    activePreview === "social"
                      ? "bg-accent text-white"
                      : "bg-surface hover:bg-bg text-text-secondary"
                  }`}
                >
                  Social Card
                </button>
              </div>
            </div>

            {/* Google Search Result Preview */}
            {activePreview === "google" && (
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm font-sans text-left space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    G
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-gray-900">{siteName || "example.com"}</span>
                    <span className="text-gray-500 text-[11px] block truncate">
                      {canonicalUrl || "https://example.com"}
                    </span>
                  </div>
                </div>

                <div className="text-blue-800 hover:underline cursor-pointer text-base font-medium leading-snug line-clamp-2 pt-1">
                  {title || "Untitled Document"}
                </div>

                <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed pt-0.5">
                  {description || "No description provided for search engines."}
                </div>
              </div>
            )}

            {/* Social Share Card Preview */}
            {activePreview === "social" && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans text-left">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Social Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    className="w-full h-40 object-cover bg-gray-100 border-b border-gray-100"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-mono">
                    No image URL provided
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                    {siteName ? siteName.toUpperCase() : "EXAMPLE.COM"}
                  </div>
                  <div className="font-bold text-gray-900 text-sm line-clamp-1">
                    {title || "Page Title Preview"}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2 leading-normal">
                    {description || "Description preview text..."}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Code Output Card */}
          <div className="neo-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <span className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
                <Code2 size={16} className="text-accent" />
                Generated HTML Tags
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="text-xs neo-btn neo-btn-primary px-2.5 py-1 flex items-center gap-1.5"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? "Copied!" : "Copy HTML"}</span>
                </button>
                <button
                  type="button"
                  onClick={downloadHtml}
                  className="text-xs neo-btn neo-btn-secondary px-2 py-1"
                  title="Download HTML file"
                >
                  <Download size={13} />
                </button>
              </div>
            </div>

            <textarea
              value={generatedHtml}
              readOnly
              rows={12}
              className="w-full neo-input p-3 font-mono text-xs bg-surface/50 text-text resize-y"
            />

            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Paste inside your &lt;head&gt; element</span>
              <button
                onClick={() => {
                  setTitle("");
                  setDescription("");
                  setCanonicalUrl("");
                  setKeywords("");
                  setAuthor("");
                  setImageUrl("");
                  setTwitterSite("");
                }}
                className="hover:underline flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
