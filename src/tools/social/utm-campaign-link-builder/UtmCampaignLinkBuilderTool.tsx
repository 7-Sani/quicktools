"use client";

import { useState, useMemo } from "react";
import {
  Link2,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Sparkles,
  Info,
  ExternalLink,
  Code,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function UtmCampaignLinkBuilderTool() {
  const [baseUrl, setBaseUrl] = useState<string>("https://quicktools.dev");
  const [source, setSource] = useState<string>("twitter");
  const [medium, setMedium] = useState<string>("social");
  const [campaign, setCampaign] = useState<string>("launch_2026");
  const [term, setTerm] = useState<string>("");
  const [content, setContent] = useState<string>("header_link");
  const [anchorText, setAnchorText] = useState<string>("Check out QuickTools");

  const [forceLowercase, setForceLowercase] = useState<boolean>(true);
  const [spaceReplacement, setSpaceReplacement] = useState<"-" | "_">("_");

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // Social Presets
  const SOCIAL_PRESETS = [
    { name: "X (Twitter)", source: "twitter", medium: "social" },
    { name: "Instagram Bio", source: "instagram", medium: "bio" },
    { name: "Instagram Story", source: "instagram", medium: "story" },
    { name: "LinkedIn Post", source: "linkedin", medium: "social" },
    { name: "YouTube Desc", source: "youtube", medium: "video_description" },
    { name: "TikTok Bio", source: "tiktok", medium: "bio" },
    { name: "Facebook Feed", source: "facebook", medium: "social" },
    { name: "Reddit Community", source: "reddit", medium: "community" },
  ];

  // Helper to sanitize parameter values
  const sanitizeParam = (val: string): string => {
    let s = val.trim();
    if (forceLowercase) s = s.toLowerCase();
    s = s.replace(/\s+/g, spaceReplacement);
    return s;
  };

  // Build generated URL
  const { generatedUrl, isValidUrl, errorMsg } = useMemo(() => {
    let trimmedBase = baseUrl.trim();
    if (!trimmedBase) {
      return { generatedUrl: "", isValidUrl: false, errorMsg: "Base URL is required." };
    }

    if (!trimmedBase.startsWith("http://") && !trimmedBase.startsWith("https://")) {
      trimmedBase = "https://" + trimmedBase;
    }

    try {
      const url = new URL(trimmedBase);

      const s = sanitizeParam(source);
      const m = sanitizeParam(medium);
      const c = sanitizeParam(campaign);
      const t = sanitizeParam(term);
      const cnt = sanitizeParam(content);

      if (s) url.searchParams.set("utm_source", s);
      if (m) url.searchParams.set("utm_medium", m);
      if (c) url.searchParams.set("utm_campaign", c);
      if (t) url.searchParams.set("utm_term", t);
      if (cnt) url.searchParams.set("utm_content", cnt);

      return { generatedUrl: url.toString(), isValidUrl: true, errorMsg: null };
    } catch {
      return {
        generatedUrl: "",
        isValidUrl: false,
        errorMsg: "Please enter a valid base URL (e.g. https://yourdomain.com).",
      };
    }
  }, [baseUrl, source, medium, campaign, term, content, forceLowercase, spaceReplacement]);

  const markdownLink = `[${anchorText || "Link"}](${generatedUrl})`;
  const htmlLink = `<a href="${generatedUrl}">${anchorText || "Link"}</a>`;

  const handleApplyPreset = (preset: { source: string; medium: string }) => {
    setSource(preset.source);
    setMedium(preset.medium);
  };

  const handleCopyUrl = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyMarkdown = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(markdownLink);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleReset = () => {
    setBaseUrl("https://quicktools.dev");
    setSource("twitter");
    setMedium("social");
    setCampaign("launch_2026");
    setTerm("");
    setContent("header_link");
    setAnchorText("Check out QuickTools");
    setForceLowercase(true);
    setSpaceReplacement("_");
  };

  const handleClear = () => {
    setBaseUrl("");
    setSource("");
    setMedium("");
    setCampaign("");
    setTerm("");
    setContent("");
    setAnchorText("");
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="neo-card p-4 bg-amber-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Client-Side UTM Builder:</strong> Creates standard Google Analytics 4 (GA4) campaign tracking parameters with 1-click social media presets. No third-party redirect or URL shortening servers are involved; links are constructed safely in your browser.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Presets */}
        <div className="lg:col-span-7 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" /> UTM Campaign Parameters
            </h2>

            {/* Base Website URL */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                Website URL * (Required)
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://yourwebsite.com/product"
                className="neo-input w-full p-2.5 text-sm font-mono"
              />
            </div>

            {/* Quick 1-Click Social Presets */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-1.5">
                1-Click Social Media Presets:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SOCIAL_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="neo-btn text-xs px-2.5 py-1 bg-surface hover:bg-amber-100 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" /> {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Fields */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Campaign Source * (utm_source)
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. twitter, instagram, newsletter"
                  className="neo-input w-full p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Campaign Medium * (utm_medium)
                </label>
                <input
                  type="text"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  placeholder="e.g. social, bio, story, cpc"
                  className="neo-input w-full p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Campaign Name * (utm_campaign)
                </label>
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="e.g. spring_sale, launch_2026"
                  className="neo-input w-full p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Campaign Content (utm_content)
                </label>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="e.g. hero_btn, banner_v1"
                  className="neo-input w-full p-2 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Campaign Term (utm_term - for paid search keywords)
                </label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g. react+tools, web+development"
                  className="neo-input w-full p-2 text-xs"
                />
              </div>
            </div>

            {/* Auto-sanitization Settings */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-dark/10 text-xs">
              <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceLowercase}
                  onChange={(e) => setForceLowercase(e.target.checked)}
                  className="rounded border-dark accent-primary"
                />
                Force Lowercase
              </label>

              <div className="flex items-center gap-2">
                <span className="font-bold">Space Separator:</span>
                <button
                  type="button"
                  onClick={() => setSpaceReplacement("_")}
                  className={`px-2 py-0.5 rounded neo-border font-mono font-bold ${
                    spaceReplacement === "_" ? "bg-primary text-white" : "bg-surface"
                  }`}
                >
                  Underscore (_)
                </button>
                <button
                  type="button"
                  onClick={() => setSpaceReplacement("-")}
                  className={`px-2 py-0.5 rounded neo-border font-mono font-bold ${
                    spaceReplacement === "-" ? "bg-primary text-white" : "bg-surface"
                  }`}
                >
                  Hyphen (-)
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-dark/10">
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
        </div>

        {/* Right Column: Output & Link Formats */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h3 className="text-base font-black uppercase tracking-tight flex items-center justify-between">
              <span>Generated Tracking URL</span>
              {isValidUrl ? (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid URL
                </span>
              ) : (
                <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Incomplete
                </span>
              )}
            </h3>

            {/* Generated output box */}
            <div className="relative">
              <textarea
                readOnly
                value={generatedUrl || errorMsg || ""}
                rows={4}
                className={`neo-input w-full p-3 text-xs font-mono break-all leading-relaxed ${
                  !isValidUrl ? "bg-rose-50 text-rose-700" : "bg-surface/30"
                }`}
              />
            </div>

            {/* Copy button */}
            <div className="flex gap-2">
              <button
                onClick={handleCopyUrl}
                disabled={!isValidUrl}
                className="neo-btn flex-1 py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? "Copied URL!" : "Copy Full Tracking URL"}
              </button>
              {isValidUrl && (
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neo-btn p-2.5 bg-surface hover:bg-gray-100 flex items-center justify-center text-dark"
                  title="Test link in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Parameter Breakdown Table */}
            <div className="p-3 bg-surface/40 neo-border rounded-lg space-y-2 text-xs">
              <span className="font-bold text-gray-800 uppercase text-[11px] tracking-wider block">
                Parameter Breakdown
              </span>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between border-b border-gray-200 pb-0.5">
                  <span className="text-gray-500">utm_source:</span>
                  <span className="font-bold text-gray-800">{sanitizeParam(source) || "(empty)"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-0.5">
                  <span className="text-gray-500">utm_medium:</span>
                  <span className="font-bold text-gray-800">{sanitizeParam(medium) || "(empty)"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-0.5">
                  <span className="text-gray-500">utm_campaign:</span>
                  <span className="font-bold text-gray-800">{sanitizeParam(campaign) || "(empty)"}</span>
                </div>
                {content && (
                  <div className="flex justify-between border-b border-gray-200 pb-0.5">
                    <span className="text-gray-500">utm_content:</span>
                    <span className="font-bold text-gray-800">{sanitizeParam(content)}</span>
                  </div>
                )}
                {term && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">utm_term:</span>
                    <span className="font-bold text-gray-800">{sanitizeParam(term)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Markdown & HTML Snippet Generator */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-text-secondary flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-primary" /> Markdown Embed Link
                </label>
                <input
                  type="text"
                  value={anchorText}
                  onChange={(e) => setAnchorText(e.target.value)}
                  placeholder="Anchor text"
                  className="neo-input p-1 text-[11px] w-36"
                />
              </div>

              <div className="p-2.5 bg-gray-50 neo-border rounded flex items-center justify-between text-xs font-mono truncate">
                <span className="truncate pr-2">{markdownLink}</span>
                <button
                  onClick={handleCopyMarkdown}
                  disabled={!isValidUrl}
                  className="text-primary hover:underline font-bold shrink-0 disabled:opacity-50 text-[11px]"
                >
                  {copiedMarkdown ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
