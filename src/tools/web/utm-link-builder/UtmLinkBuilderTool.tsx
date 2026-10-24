"use client";

import React, { useState, useMemo } from "react";
import {
  Share2,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  ExternalLink,
  Plus,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface CustomParam {
  id: string;
  key: string;
  value: string;
}

export default function UtmLinkBuilderTool() {
  const [baseUrl, setBaseUrl] = useState("https://example.com/landing-page");
  const [utmSource, setUtmSource] = useState("newsletter");
  const [utmMedium, setUtmMedium] = useState("email");
  const [utmCampaign, setUtmCampaign] = useState("spring_launch_2026");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("cta_button_hero");
  const [utmId, setUtmId] = useState("");
  const [customParams, setCustomParams] = useState<CustomParam[]>([]);
  const [autoLowercase, setAutoLowercase] = useState(true);
  const [spaceChar, setSpaceChar] = useState<"_" | "-" | "+">("_");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const formatParam = (val: string): string => {
    let result = val.trim();
    if (autoLowercase) {
      result = result.toLowerCase();
    }
    if (spaceChar === "_") {
      result = result.replace(/\s+/g, "_");
    } else if (spaceChar === "-") {
      result = result.replace(/\s+/g, "-");
    } else if (spaceChar === "+") {
      result = result.replace(/\s+/g, "+");
    }
    return result;
  };

  const addCustomParam = () => {
    setCustomParams([
      ...customParams,
      { id: Math.random().toString(36).substring(2, 9), key: "", value: "" },
    ]);
  };

  const removeCustomParam = (id: string) => {
    setCustomParams(customParams.filter((p) => p.id !== id));
  };

  const updateCustomParam = (id: string, field: "key" | "value", val: string) => {
    setCustomParams(
      customParams.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  // Build the final URL using native URL and URLSearchParams APIs
  const buildResult = useMemo(() => {
    const rawUrl = baseUrl.trim();
    if (!rawUrl) {
      return { isValid: false, finalUrl: "", utmQuery: "", error: "Please enter a destination URL." };
    }

    let urlObj: URL;
    try {
      if (!rawUrl.includes("://")) {
        urlObj = new URL(`https://${rawUrl}`);
      } else {
        urlObj = new URL(rawUrl);
      }
    } catch {
      return {
        isValid: false,
        finalUrl: "",
        utmQuery: "",
        error: "Invalid website URL format. Please include a valid domain (e.g. https://example.com).",
      };
    }

    const searchParams = new URLSearchParams(urlObj.search);

    // Apply UTMs
    if (utmSource.trim()) searchParams.set("utm_source", formatParam(utmSource));
    else searchParams.delete("utm_source");

    if (utmMedium.trim()) searchParams.set("utm_medium", formatParam(utmMedium));
    else searchParams.delete("utm_medium");

    if (utmCampaign.trim()) searchParams.set("utm_campaign", formatParam(utmCampaign));
    else searchParams.delete("utm_campaign");

    if (utmTerm.trim()) searchParams.set("utm_term", formatParam(utmTerm));
    else searchParams.delete("utm_term");

    if (utmContent.trim()) searchParams.set("utm_content", formatParam(utmContent));
    else searchParams.delete("utm_content");

    if (utmId.trim()) searchParams.set("utm_id", formatParam(utmId));
    else searchParams.delete("utm_id");

    // Apply custom parameters
    for (const p of customParams) {
      const k = p.key.trim();
      if (k) {
        searchParams.set(formatParam(k), formatParam(p.value));
      }
    }

    // Assign search
    urlObj.search = searchParams.toString();
    const finalUrl = urlObj.toString();
    const utmQuery = searchParams.toString() ? `?${searchParams.toString()}` : "";

    return {
      isValid: true,
      finalUrl,
      utmQuery,
      error: null,
    };
  }, [
    baseUrl,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    utmId,
    customParams,
    autoLowercase,
    spaceChar,
  ]);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const applyPreset = (preset: "google" | "facebook" | "newsletter" | "linkedin") => {
    if (preset === "google") {
      setUtmSource("google");
      setUtmMedium("cpc");
      setUtmCampaign("summer_sale_search");
      setUtmTerm("cloud_hosting_tools");
      setUtmContent("textlink_variant_1");
    } else if (preset === "facebook") {
      setUtmSource("facebook");
      setUtmMedium("paid_social");
      setUtmCampaign("spring_promo_carousel");
      setUtmTerm("retargeting_cart_abandoners");
      setUtmContent("carousel_slide_2");
    } else if (preset === "newsletter") {
      setUtmSource("substack");
      setUtmMedium("newsletter");
      setUtmCampaign("weekly_digest_issue_42");
      setUtmTerm("");
      setUtmContent("featured_tool_button");
    } else {
      setUtmSource("linkedin");
      setUtmMedium("social_post");
      setUtmCampaign("b2b_lead_generation");
      setUtmTerm("devops_engineers");
      setUtmContent("infographic_download");
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Campaign Bar */}
      <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <span className="font-heading font-bold uppercase text-xs tracking-wide">
            Quick Campaign Presets:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset("google")}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Google Ads (CPC)
          </button>
          <button
            onClick={() => applyPreset("facebook")}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Facebook Ads
          </button>
          <button
            onClick={() => applyPreset("newsletter")}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Email Newsletter
          </button>
          <button
            onClick={() => applyPreset("linkedin")}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            LinkedIn Post
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Base URL Card */}
          <div className="neo-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-1.5">
                Target Website URL <span className="text-red-500">*</span>
              </label>
              <button
                onClick={() => setBaseUrl("")}
                disabled={!baseUrl}
                className="text-xs text-red-600 hover:underline disabled:opacity-30"
              >
                Clear URL
              </button>
            </div>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com/pricing"
              className="w-full neo-input py-2.5 px-3 font-mono text-sm"
            />
            {buildResult.error && (
              <div className="text-xs text-red-600 flex items-center gap-1.5 font-medium">
                <AlertCircle size={14} className="shrink-0" />
                <span>{buildResult.error}</span>
              </div>
            )}
          </div>

          {/* Standard UTM Parameters */}
          <div className="neo-card p-5 space-y-4">
            <div className="font-heading font-bold uppercase text-sm tracking-wide border-b-2 border-border pb-3">
              Standard Campaign Parameters (Google Analytics & Meta)
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* utm_source */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  utm_source <span className="text-red-500">*</span> (e.g. google, newsletter)
                </label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="google, twitter, blog"
                  className="w-full neo-input py-2 px-3 text-xs font-mono"
                />
              </div>

              {/* utm_medium */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  utm_medium <span className="text-red-500">*</span> (e.g. cpc, email, social)
                </label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="cpc, banner, email"
                  className="w-full neo-input py-2 px-3 text-xs font-mono"
                />
              </div>

              {/* utm_campaign */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  utm_campaign (e.g. spring_sale)
                </label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="spring_launch_2026"
                  className="w-full neo-input py-2 px-3 text-xs font-mono"
                />
              </div>

              {/* utm_id */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  utm_id (Campaign ID / Ads ID)
                </label>
                <input
                  type="text"
                  value={utmId}
                  onChange={(e) => setUtmId(e.target.value)}
                  placeholder="98234"
                  className="w-full neo-input py-2 px-3 text-xs font-mono"
                />
              </div>

              {/* utm_term */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  utm_term (Search keyword or audience)
                </label>
                <input
                  type="text"
                  value={utmTerm}
                  onChange={(e) => setUtmTerm(e.target.value)}
                  placeholder="running shoes, saas tools"
                  className="w-full neo-input py-2 px-3 text-xs font-mono"
                />
              </div>

              {/* utm_content */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase mb-1 text-text-secondary">
                  utm_content (Ad variation or link button)
                </label>
                <input
                  type="text"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  placeholder="hero_banner, footer_link"
                  className="w-full neo-input py-2 px-3 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Custom Parameters */}
          <div className="neo-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <div>
                <div className="font-heading font-bold uppercase text-sm tracking-wide">
                  Custom Query Parameters
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  Add non-standard tracking keys (e.g. ref, affiliate_id, promo_code)
                </div>
              </div>

              <button
                type="button"
                onClick={addCustomParam}
                className="text-xs neo-btn neo-btn-secondary px-2.5 py-1 flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add Parameter</span>
              </button>
            </div>

            {customParams.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-secondary bg-surface/50 rounded-lg">
                No custom parameters added yet. Click &quot;Add Parameter&quot; to append custom tracking keys.
              </div>
            ) : (
              <div className="space-y-2">
                {customParams.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p.key}
                      onChange={(e) => updateCustomParam(p.id, "key", e.target.value)}
                      placeholder={`Key (e.g. ref)`}
                      className="neo-input py-1.5 px-3 text-xs font-mono w-1/3"
                    />
                    <span className="text-text-secondary">=</span>
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => updateCustomParam(p.id, "value", e.target.value)}
                      placeholder={`Value (e.g. partner_123)`}
                      className="neo-input py-1.5 px-3 text-xs font-mono flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomParam(p.id)}
                      className="p-1.5 neo-border rounded hover:bg-red-50 text-red-600"
                      title="Remove parameter"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formatting Rules */}
          <div className="neo-card p-4 space-y-3 bg-surface">
            <div className="font-heading font-bold uppercase text-xs tracking-wide">
              Tag Normalization Options
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wide">
                <input
                  type="checkbox"
                  checked={autoLowercase}
                  onChange={(e) => setAutoLowercase(e.target.checked)}
                  className="w-4 h-4 rounded neo-border accent-accent cursor-pointer"
                />
                Auto-convert all values to lowercase
              </label>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold uppercase tracking-wide">Space Replacement:</span>
                {(["_", "-", "+"] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSpaceChar(ch)}
                    className={`px-2 py-0.5 rounded neo-border font-mono font-bold ${
                      spaceChar === ch ? "bg-accent text-white" : "bg-bg text-text"
                    }`}
                  >
                    &apos;{ch}&apos;
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Result & Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-5 space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <span className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
                <Share2 size={16} className="text-accent" />
                Generated Campaign URL
              </span>

              <button
                onClick={() => {
                  setBaseUrl("https://example.com/landing-page");
                  setUtmSource("newsletter");
                  setUtmMedium("email");
                  setUtmCampaign("spring_launch_2026");
                  setUtmTerm("");
                  setUtmContent("cta_button_hero");
                  setUtmId("");
                  setCustomParams([]);
                }}
                className="text-xs hover:underline flex items-center gap-1 text-text-secondary"
                title="Reset all fields"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>

            {/* URL Output Box */}
            <div className="space-y-2">
              <textarea
                value={buildResult.finalUrl}
                readOnly
                placeholder="Your generated UTM campaign link will appear here..."
                rows={6}
                className="w-full neo-input p-3 font-mono text-xs font-semibold text-accent bg-surface/50 resize-y"
              />

              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>
                  Length: <strong className="font-mono text-text">{buildResult.finalUrl.length}</strong> chars
                </span>
                <span>
                  Status:{" "}
                  {buildResult.isValid ? (
                    <strong className="text-emerald-600">Valid URL</strong>
                  ) : (
                    <strong className="text-red-500">Incomplete</strong>
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => copyToClipboard(buildResult.finalUrl, "url")}
                disabled={!buildResult.finalUrl || !buildResult.isValid}
                className="w-full neo-btn neo-btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {copiedKey === "url" ? <Check size={16} /> : <Copy size={16} />}
                <span className="font-heading uppercase tracking-wide text-xs">
                  {copiedKey === "url" ? "Full URL Copied!" : "Copy Full Campaign URL"}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(buildResult.utmQuery, "query")}
                  disabled={!buildResult.utmQuery}
                  className="neo-btn neo-btn-secondary py-2 flex items-center justify-center gap-1.5 text-xs disabled:opacity-40"
                >
                  {copiedKey === "query" ? <Check size={13} /> : <Copy size={13} />}
                  <span>Copy Query Only</span>
                </button>

                <a
                  href={buildResult.isValid ? buildResult.finalUrl : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`neo-btn neo-btn-secondary py-2 flex items-center justify-center gap-1.5 text-xs ${
                    !buildResult.isValid ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <ExternalLink size={13} />
                  <span>Test in Tab</span>
                </a>
              </div>
            </div>

            {/* Educational Help */}
            <div className="p-3.5 neo-border rounded-lg bg-surface text-xs text-text-secondary space-y-2 mt-4">
              <div className="font-heading font-bold uppercase text-text flex items-center gap-1.5">
                <HelpCircle size={14} className="text-accent" />
                UTM Parameters Guide:
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>utm_source:</strong> Identifies which platform sent traffic (e.g. google, meta, twitter, newsletter).</li>
                <li><strong>utm_medium:</strong> Identifies the marketing channel type (e.g. cpc, banner, email, organic).</li>
                <li><strong>utm_campaign:</strong> Names your strategic campaign or promotion (e.g. summer_2026_promo).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
