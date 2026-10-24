"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Info,
  Code,
  Share2,
} from "lucide-react";

export default function OpenGraphImagePreviewTool() {
  const [imageSrc, setImageSrc] = useState<string>(
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80"
  );
  const [fileName, setFileName] = useState<string>("og-sample.jpg");
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 630,
  });

  const [title, setTitle] = useState("QuickTools – Free Developer & Social Media Productivity Suite");
  const [description, setDescription] = useState(
    "150+ privacy-friendly browser utilities for web developers, social media creators, and designers. No tracking or sign-up needed."
  );
  const [siteUrl, setSiteUrl] = useState("https://quicktools.dev");
  const [siteName, setSiteName] = useState("quicktools.dev");

  const [activeTab, setActiveTab] = useState<"facebook" | "twitter-large" | "twitter-small" | "linkedin">("facebook");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);

      const img = new Image();
      img.onload = () => {
        setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setImageSrc("https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80");
    setFileName("og-sample.jpg");
    setImgDimensions({ width: 1200, height: 630 });
    setTitle("QuickTools – Free Developer & Social Media Productivity Suite");
    setDescription(
      "150+ privacy-friendly browser utilities for web developers, social media creators, and designers. No tracking or sign-up needed."
    );
    setSiteUrl("https://quicktools.dev");
    setSiteName("quicktools.dev");
    setActiveTab("facebook");
  };

  const handleClear = () => {
    setImageSrc("");
    setFileName("");
    setImgDimensions({ width: 0, height: 0 });
    setTitle("");
    setDescription("");
    setSiteUrl("");
    setSiteName("");
  };

  const metaHtmlSnippet = `<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${siteUrl || "https://example.com"}" />
<meta property="og:title" content="${title.replace(/"/g, "&quot;")}" />
<meta property="og:description" content="${description.replace(/"/g, "&quot;")}" />
<meta property="og:image" content="${imageSrc.startsWith("data:") ? "https://yourdomain.com/og-image.jpg" : imageSrc || "https://yourdomain.com/og-image.jpg"}" />
<meta property="og:image:width" content="${imgDimensions.width || 1200}" />
<meta property="og:image:height" content="${imgDimensions.height || 630}" />

<!-- Twitter / X Cards -->
<meta name="twitter:card" content="${activeTab === "twitter-small" ? "summary" : "summary_large_image"}" />
<meta name="twitter:title" content="${title.replace(/"/g, "&quot;")}" />
<meta name="twitter:description" content="${description.replace(/"/g, "&quot;")}" />
<meta name="twitter:image" content="${imageSrc.startsWith("data:") ? "https://yourdomain.com/og-image.jpg" : imageSrc || "https://yourdomain.com/og-image.jpg"}" />`;

  const handleCopyMetaSnippet = () => {
    navigator.clipboard.writeText(metaHtmlSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Dimensions & ratio check
  const ratio = imgDimensions.width > 0 && imgDimensions.height > 0
    ? (imgDimensions.width / imgDimensions.height).toFixed(2)
    : "0";
  const isRecommended191 = Math.abs(Number(ratio) - 1.91) < 0.1 || Math.abs(Number(ratio) - 1.78) < 0.1;
  const isOptimalResolution = imgDimensions.width >= 1200 && imgDimensions.height >= 627;

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-amber-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Open Graph Visualizer:</strong> Previews how social crawlers render your metadata cards on Facebook, X (Twitter), and LinkedIn. Renders locally using your inputs and does not execute scraper bots or access private platform APIs.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Image Upload */}
        <div className="lg:col-span-5 space-y-6">
          {/* Image Upload Box */}
          <div className="neo-card p-6 bg-white space-y-4">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> OG Image
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-dark/30 hover:border-dark p-5 rounded-lg text-center cursor-pointer transition-colors bg-surface/50 hover:bg-surface flex flex-col items-center justify-center gap-2"
            >
              <Upload className="w-6 h-6 text-text-secondary" />
              <p className="text-xs font-bold">Upload Custom OG Image</p>
              <p className="text-[11px] text-text-secondary">Recommended: 1200 × 630 px (1.91:1)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Direct Image URL input */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                Or Image URL:
              </label>
              <input
                type="text"
                value={imageSrc}
                onChange={(e) => {
                  setImageSrc(e.target.value);
                  const img = new Image();
                  img.onload = () => {
                    setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                  };
                  img.src = e.target.value;
                }}
                placeholder="https://example.com/banner.jpg"
                className="neo-input w-full p-2 text-xs font-mono"
              />
            </div>
          </div>

          {/* Metadata Inputs */}
          <div className="neo-card p-6 bg-white space-y-4">
            <h2 className="text-lg font-black uppercase tracking-tight">Card Metadata</h2>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-text-secondary">Page Title</label>
                <span className="text-[11px] text-text-secondary font-mono">{title.length} chars</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page Title"
                className="neo-input w-full p-2.5 text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-text-secondary">Description</label>
                <span className="text-[11px] text-text-secondary font-mono">{description.length} chars</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Meta description summary..."
                className="neo-input w-full p-2.5 text-sm leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">Domain / Host</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="example.com"
                  className="neo-input w-full p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="neo-input w-full p-2 text-sm"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-dark/10">
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                onClick={handleClear}
                className="neo-btn text-xs px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          {/* Dimension Audit */}
          <div className="neo-card p-5 bg-surface/50 border border-dark/20 space-y-2 text-xs">
            <h3 className="font-black uppercase tracking-wider text-text-secondary">
              Image Audit ({imgDimensions.width} × {imgDimensions.height} px)
            </h3>
            <div className="flex justify-between items-center">
              <span>Aspect Ratio ({ratio}:1):</span>
              <span className={`font-mono font-bold flex items-center gap-1 ${isRecommended191 ? "text-emerald-700" : "text-amber-700"}`}>
                {isRecommended191 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {isRecommended191 ? "Recommended (~1.91:1)" : "Differs from 1.91:1 standard"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Retina Sharpness (≥1200×630):</span>
              <span className={`font-mono font-bold flex items-center gap-1 ${isOptimalResolution ? "text-emerald-700" : "text-amber-700"}`}>
                {isOptimalResolution ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {isOptimalResolution ? "HD (Pass)" : "May appear blurry or downscaled"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Previews & Code Generator */}
        <div className="lg:col-span-7 space-y-6">
          {/* Platform Tab Switcher */}
          <div className="flex items-center justify-between border-b border-dark/10 pb-3">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> Social Share Previews
            </h2>
            <div className="flex gap-1 bg-surface p-1 neo-border rounded-lg">
              <button
                onClick={() => setActiveTab("facebook")}
                className={`px-3 py-1 text-xs font-bold rounded ${
                  activeTab === "facebook" ? "bg-white neo-border text-dark" : "text-text-secondary"
                }`}
              >
                Facebook
              </button>
              <button
                onClick={() => setActiveTab("twitter-large")}
                className={`px-3 py-1 text-xs font-bold rounded ${
                  activeTab === "twitter-large" ? "bg-white neo-border text-dark" : "text-text-secondary"
                }`}
              >
                X Large
              </button>
              <button
                onClick={() => setActiveTab("twitter-small")}
                className={`px-3 py-1 text-xs font-bold rounded ${
                  activeTab === "twitter-small" ? "bg-white neo-border text-dark" : "text-text-secondary"
                }`}
              >
                X Small
              </button>
              <button
                onClick={() => setActiveTab("linkedin")}
                className={`px-3 py-1 text-xs font-bold rounded ${
                  activeTab === "linkedin" ? "bg-white neo-border text-dark" : "text-text-secondary"
                }`}
              >
                LinkedIn
              </button>
            </div>
          </div>

          {/* VIEW: FACEBOOK SHARE CARD */}
          {activeTab === "facebook" && (
            <div className="neo-card p-6 bg-white space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-text-secondary block">
                Facebook Feed Shared Link Card (1.91:1)
              </span>

              <div className="max-w-lg mx-auto bg-gray-100 rounded-xl overflow-hidden border border-gray-300 shadow-sm">
                <div className="relative aspect-[1.91/1] w-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {imageSrc ? (
                    <img src={imageSrc} alt="OG Card" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">No OG Image Provided</span>
                  )}
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  <div className="text-[11px] uppercase tracking-wider text-gray-500 font-mono truncate">
                    {siteName || "example.com"}
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mt-0.5 leading-snug">
                    {title || "Untitled Document"}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-1 mt-1 leading-normal">
                    {description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: TWITTER / X SUMMARY LARGE IMAGE CARD */}
          {activeTab === "twitter-large" && (
            <div className="neo-card p-6 bg-white space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-text-secondary block">
                X (Twitter) Summary Card with Large Image
              </span>

              <div className="max-w-lg mx-auto bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <div className="relative aspect-[2/1] w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {imageSrc ? (
                    <img src={imageSrc} alt="Twitter Card" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                <div className="p-3 bg-white">
                  <div className="text-[11px] text-gray-500 font-mono truncate">
                    {siteName || "example.com"}
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mt-0.5">
                    {title || "Untitled Tweet Card"}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {description || "No summary available."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: TWITTER / X SUMMARY SMALL (1:1) CARD */}
          {activeTab === "twitter-small" && (
            <div className="neo-card p-6 bg-white space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-text-secondary block">
                X (Twitter) Small Summary Card (Compact 1:1)
              </span>

              <div className="max-w-lg mx-auto bg-white rounded-2xl overflow-hidden border border-gray-200 p-2 flex gap-3 items-center">
                <div className="relative w-28 h-28 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {imageSrc ? (
                    <img src={imageSrc} alt="Small Card" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-[10px]">No Image</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-[11px] text-gray-500 font-mono truncate">
                    {siteName || "example.com"}
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mt-0.5">
                    {title || "Untitled Card"}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {description || "No description."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: LINKEDIN FEED CARD */}
          {activeTab === "linkedin" && (
            <div className="neo-card p-6 bg-white space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-text-secondary block">
                LinkedIn Shared Post Link Card (1200×627)
              </span>

              <div className="max-w-lg mx-auto bg-white rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                <div className="relative aspect-[1.91/1] w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {imageSrc ? (
                    <img src={imageSrc} alt="LinkedIn Card" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug">
                    {title || "Untitled Article"}
                  </h4>
                  <div className="text-[11px] text-gray-500 font-mono mt-1">
                    {siteName || "example.com"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generated Meta HTML Code Snippet */}
          <div className="neo-card p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Code className="w-4 h-4 text-primary" /> Generated HTML Meta Tags
              </h3>
              <button
                onClick={handleCopyMetaSnippet}
                className="neo-btn text-xs px-3 py-1.5 bg-primary text-white flex items-center gap-1"
              >
                {copiedSnippet ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedSnippet ? "Copied!" : "Copy Code"}
              </button>
            </div>

            <pre className="p-3 bg-dark text-white rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
              {metaHtmlSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
