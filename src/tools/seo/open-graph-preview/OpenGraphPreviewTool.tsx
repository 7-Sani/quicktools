"use client";

import React, { useState, useMemo } from "react";
import {
  Share2,
  Copy,
  Check,
  Download,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Info,
  Shield,
  Layers,
  Trash2,
} from "lucide-react";

type Platform = "facebook" | "twitter-large" | "twitter-small" | "linkedin" | "discord";

const PRESETS = [
  {
    name: "SaaS Product",
    title: "QuickTools – 90+ Free Online Web Tools for Developers",
    desc: "Lightning fast utilities for image compression, video processing, audio trimming, PDF manipulation, and SEO optimization. 100% private in-browser.",
    url: "https://quicktools.app",
    siteName: "QuickTools",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop",
    twitterHandle: "@quicktools",
  },
  {
    name: "Blog Article",
    title: "Mastering On-Page SEO in 2026: An Actionable Guide",
    desc: "Discover how to optimize title tags, heading structure, JSON-LD schema, and Open Graph previews to skyrocket your organic search traffic.",
    url: "https://quicktools.app/blog/on-page-seo-guide-2026",
    siteName: "QuickTools Blog",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
    twitterHandle: "@quicktools",
  },
];

export default function OpenGraphPreviewTool() {
  const [title, setTitle] = useState("QuickTools – 90+ Free Online Web Tools for Developers");
  const [description, setDescription] = useState(
    "Lightning fast utilities for image compression, video processing, audio trimming, PDF manipulation, and SEO optimization. 100% private in-browser."
  );
  const [url, setUrl] = useState("https://quicktools.app");
  const [siteName, setSiteName] = useState("QuickTools");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop"
  );
  const [twitterHandle, setTwitterHandle] = useState("@quicktools");
  const [activePlatform, setActivePlatform] = useState<Platform>("facebook");
  const [copied, setCopied] = useState(false);

  // Handle local image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    }
  };

  // Domain extractor
  const domain = useMemo(() => {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      return parsed.hostname.toUpperCase();
    } catch {
      return "EXAMPLE.COM";
    }
  }, [url]);

  // Generated Meta HTML code
  const generatedMetaHtml = useMemo(() => {
    const lines = [
      `<!-- Open Graph / Facebook / LinkedIn -->`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:title" content="${title.replace(/"/g, "&quot;")}">`,
      `<meta property="og:description" content="${description.replace(/"/g, "&quot;")}">`,
    ];

    if (imageUrl) {
      lines.push(`<meta property="og:image" content="${imageUrl}">`);
    }
    if (siteName) {
      lines.push(`<meta property="og:site_name" content="${siteName}">`);
    }

    lines.push(
      ``,
      `<!-- Twitter / X Cards -->`,
      `<meta name="twitter:card" content="${activePlatform === "twitter-small" ? "summary" : "summary_large_image"}">`,
      `<meta name="twitter:url" content="${url}">`,
      `<meta name="twitter:title" content="${title.replace(/"/g, "&quot;")}">`,
      `<meta name="twitter:description" content="${description.replace(/"/g, "&quot;")}">`
    );

    if (imageUrl) {
      lines.push(`<meta name="twitter:image" content="${imageUrl}">`);
    }
    if (twitterHandle) {
      lines.push(`<meta name="twitter:site" content="${twitterHandle}">`);
    }

    return lines.join("\n");
  }, [title, description, url, imageUrl, siteName, twitterHandle, activePlatform]);

  const handleCopyMeta = () => {
    navigator.clipboard.writeText(generatedMetaHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedMetaHtml], { type: "text/html;charset=utf-8;" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "open-graph-tags.html";
    a.click();
    URL.revokeObjectURL(u);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setDescription(preset.desc);
    setUrl(preset.url);
    setSiteName(preset.siteName);
    setImageUrl(preset.image);
    setTwitterHandle(preset.twitterHandle);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Shield size={14} /> Multi-Platform Social Media Emulator
          </span>
          <span className="text-xs text-text-secondary">
            Recommended image size: 1200 × 630 px (1.91:1 ratio)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* OG Title */}
          <div className="neo-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-heading font-bold uppercase text-text-secondary">
                OG Title (&lt;og:title&gt;)
              </label>
              <span className={`font-mono text-[11px] ${title.length > 70 ? "text-amber-600 font-bold" : "text-text-secondary"}`}>
                {title.length}/70 chars
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Catchy social title..."
              className="w-full neo-input py-2 px-3 text-sm font-medium"
            />
          </div>

          {/* OG Description */}
          <div className="neo-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-heading font-bold uppercase text-text-secondary">
                OG Description (&lt;og:description&gt;)
              </label>
              <span className={`font-mono text-[11px] ${description.length > 200 ? "text-amber-600 font-bold" : "text-text-secondary"}`}>
                {description.length}/200 chars
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Engaging social post summary..."
              rows={3}
              className="w-full neo-input p-3 text-xs leading-relaxed"
            />
          </div>

          {/* Image URL & Upload */}
          <div className="neo-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-border pb-2">
              <label className="font-heading font-bold uppercase text-xs text-text-secondary">
                OG Image (&lt;og:image&gt;)
              </label>
              <span className="text-[11px] text-text-secondary">
                1200 x 630 px
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/social-share.jpg"
                className="w-full neo-input py-1.5 px-3 text-xs font-mono"
              />

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                  <Upload size={13} className="text-accent" />
                  <span>Upload Local Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {imageUrl && (
                  <button
                    onClick={() => setImageUrl("")}
                    className="px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded"
                  >
                    Clear Image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Canonical URL & Site Name */}
          <div className="neo-card p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-heading font-bold uppercase text-text-secondary block mb-1">
                  Target URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className="w-full neo-input py-1.5 px-2.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="font-heading font-bold uppercase text-text-secondary block mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. QuickTools"
                  className="w-full neo-input py-1.5 px-2.5 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-heading font-bold uppercase text-text-secondary block mb-1 text-xs">
                Twitter / X Creator Handle
              </label>
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@username"
                className="w-full neo-input py-1.5 px-2.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Preview Column (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-4 space-y-4">
            {/* Platform Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b-2 border-border pb-3">
              {[
                { id: "facebook", label: "Facebook" },
                { id: "twitter-large", label: "X / Large Card" },
                { id: "twitter-small", label: "X / Small Card" },
                { id: "linkedin", label: "LinkedIn" },
                { id: "discord", label: "Discord / Slack" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id as Platform)}
                  className={`px-2.5 py-1 text-xs neo-border rounded font-heading font-bold uppercase transition-colors ${
                    activePlatform === p.id
                      ? "bg-accent text-white"
                      : "bg-surface hover:bg-accent/10"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Live Social Preview Frame */}
            <div className="p-4 bg-[#f0f2f5] dark:bg-[#18191a] rounded-lg border border-border">
              {/* FACEBOOK PREVIEW */}
              {activePlatform === "facebook" && (
                <div className="bg-white dark:bg-[#242526] rounded-lg overflow-hidden border border-[#ced0d4] dark:border-[#3e4042] max-w-md mx-auto shadow-sm">
                  {/* Image */}
                  <div className="aspect-[1.91/1] bg-gray-200 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="OG Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-text-secondary text-xs p-4">
                        <ImageIcon size={32} className="mx-auto mb-1 opacity-40" />
                        No OG Image Provided
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-3 bg-[#f0f2f5] dark:bg-[#3a3b3c]">
                    <div className="text-[11px] text-[#65676b] dark:text-[#b0b3b8] uppercase font-sans tracking-wide truncate">
                      {domain}
                    </div>
                    <div className="font-bold text-sm text-[#050505] dark:text-[#e4e6eb] font-sans line-clamp-2 mt-0.5 leading-snug">
                      {title || "Open Graph Title"}
                    </div>
                    <div className="text-xs text-[#65676b] dark:text-[#b0b3b8] font-sans line-clamp-1 mt-0.5">
                      {description || "Meta description summary..."}
                    </div>
                  </div>
                </div>
              )}

              {/* TWITTER / X LARGE CARD PREVIEW */}
              {activePlatform === "twitter-large" && (
                <div className="bg-black text-white rounded-2xl overflow-hidden border border-[#2f3336] max-w-md mx-auto shadow-sm">
                  {/* Image */}
                  <div className="aspect-[1.91/1] bg-gray-900 relative overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="Twitter Card" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-500 text-xs p-4">
                        <ImageIcon size={32} className="mx-auto mb-1 opacity-40" />
                        No Card Image
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[11px] text-white">
                      {domain.toLowerCase()}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-3 bg-black">
                    <div className="font-bold text-sm text-[#e7e9ea] font-sans line-clamp-1">
                      {title || "Twitter Large Image Card Title"}
                    </div>
                    <div className="text-xs text-[#71767b] font-sans line-clamp-2 mt-1">
                      {description || "Twitter card description summary..."}
                    </div>
                  </div>
                </div>
              )}

              {/* TWITTER / X SMALL SUMMARY CARD */}
              {activePlatform === "twitter-small" && (
                <div className="bg-black text-white rounded-2xl overflow-hidden border border-[#2f3336] max-w-md mx-auto flex shadow-sm">
                  {/* Square Image */}
                  <div className="w-28 h-28 bg-gray-900 shrink-0 flex items-center justify-center overflow-hidden border-r border-[#2f3336]">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="Twitter Summary" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={24} className="text-gray-600" />
                    )}
                  </div>
                  {/* Text */}
                  <div className="p-3 flex flex-col justify-center min-w-0 flex-1">
                    <div className="text-[11px] text-[#71767b] truncate">
                      {domain.toLowerCase()}
                    </div>
                    <div className="font-bold text-xs text-[#e7e9ea] font-sans truncate mt-0.5">
                      {title || "Twitter Summary Card Title"}
                    </div>
                    <div className="text-[11px] text-[#71767b] font-sans line-clamp-2 mt-1">
                      {description || "Summary card description snippet..."}
                    </div>
                  </div>
                </div>
              )}

              {/* LINKEDIN PREVIEW */}
              {activePlatform === "linkedin" && (
                <div className="bg-white dark:bg-[#1b1f23] rounded-lg overflow-hidden border border-[#e0e0e0] dark:border-[#383b40] max-w-md mx-auto shadow-sm">
                  <div className="aspect-[1.91/1] bg-gray-200 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="LinkedIn Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div className="p-3 bg-white dark:bg-[#1b1f23] border-t border-[#e0e0e0] dark:border-[#383b40]">
                    <div className="font-semibold text-sm text-[#000000e6] dark:text-[#ffffff] font-sans line-clamp-2 leading-snug">
                      {title || "LinkedIn Post Preview Title"}
                    </div>
                    <div className="text-[11px] text-[#00000099] dark:text-[#ffffff99] mt-1 font-sans">
                      {domain.toLowerCase()}
                    </div>
                  </div>
                </div>
              )}

              {/* DISCORD / SLACK PREVIEW */}
              {activePlatform === "discord" && (
                <div className="bg-[#2f3136] text-[#dcddde] p-3 rounded-lg border-l-4 border-accent max-w-md mx-auto text-xs font-sans shadow-sm space-y-2">
                  <div className="text-[11px] text-[#b9bbbe]">
                    {siteName || "QuickTools"}
                  </div>
                  <div className="font-bold text-sm text-[#00aff4] hover:underline cursor-pointer">
                    {title || "Discord Rich Embed Preview"}
                  </div>
                  <div className="text-[#dcddde] text-xs leading-relaxed">
                    {description || "Discord embed description text will display here..."}
                  </div>
                  {imageUrl && (
                    <div className="rounded overflow-hidden max-h-48 mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Discord Embed" className="rounded object-cover max-h-48 w-full" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Generated Meta HTML */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold uppercase text-text-secondary">
                  Generated Open Graph &amp; Twitter Meta Tags
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
                    onClick={handleDownload}
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
