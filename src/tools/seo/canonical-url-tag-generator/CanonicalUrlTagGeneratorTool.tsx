"use client";

import React, { useState, useMemo } from "react";
import {
  Link2,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Plus,
  Globe,
  Server,
  Layers,
} from "lucide-react";

interface HreflangItem {
  id: string;
  lang: string;
  url: string;
}

const COMMON_LANGUAGES = [
  { code: "x-default", label: "x-default (Default / Fallback)" },
  { code: "en", label: "en (English - Global)" },
  { code: "en-US", label: "en-US (English - United States)" },
  { code: "en-GB", label: "en-GB (English - United Kingdom)" },
  { code: "es", label: "es (Spanish - Global)" },
  { code: "fr", label: "fr (French - Global)" },
  { code: "de", label: "de (German - Global)" },
  { code: "ja", label: "ja (Japanese)" },
  { code: "zh-CN", label: "zh-CN (Chinese - Simplified)" },
  { code: "pt-BR", label: "pt-BR (Portuguese - Brazil)" },
];

export default function CanonicalUrlTagGeneratorTool() {
  const [rawUrl, setRawUrl] = useState("https://quicktools.app/seo/canonical-url-tag-generator?utm_source=twitter&utm_medium=social");
  const [enforceHttps, setEnforceHttps] = useState(true);
  const [enforceLowercase, setEnforceLowercase] = useState(true);
  const [trailingSlash, setTrailingSlash] = useState<"strip" | "enforce" | "preserve">("strip");
  const [stripTrackingParams, setStripTrackingParams] = useState(true);
  const [includeHreflang, setIncludeHreflang] = useState(false);
  const [hreflangItems, setHreflangItems] = useState<HreflangItem[]>([
    { id: "1", lang: "x-default", url: "https://quicktools.app/seo/canonical-url-tag-generator" },
    { id: "2", lang: "en", url: "https://quicktools.app/seo/canonical-url-tag-generator" },
    { id: "3", lang: "es", url: "https://quicktools.app/es/seo/canonical-url-tag-generator" },
  ]);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState(false);

  // Normalize Canonical URL based on settings
  const { cleanUrl, issues } = useMemo(() => {
    const detectedIssues: string[] = [];
    if (!rawUrl.trim()) {
      return { cleanUrl: "", issues: ["Please enter a URL."] };
    }

    let workingUrl = rawUrl.trim();

    // Check if relative
    if (!workingUrl.startsWith("http://") && !workingUrl.startsWith("https://")) {
      detectedIssues.push("Relative path detected. Canonical URLs must be fully-qualified absolute URLs.");
      workingUrl = (enforceHttps ? "https://" : "http://") + workingUrl;
    }

    try {
      const parsed = new URL(workingUrl);

      // Protocol enforcement
      if (enforceHttps && parsed.protocol === "http:") {
        parsed.protocol = "https:";
      }

      // Domain lowercase
      if (enforceLowercase) {
        parsed.hostname = parsed.hostname.toLowerCase();
      }

      // Tracking parameters to strip
      if (stripTrackingParams) {
        const trackingKeys = [
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_term",
          "utm_content",
          "fbclid",
          "gclid",
          "msclkid",
          "ref",
          "_ga",
        ];
        trackingKeys.forEach((key) => parsed.searchParams.delete(key));
      }

      let pathname = parsed.pathname;
      if (trailingSlash === "strip" && pathname.length > 1 && pathname.endsWith("/")) {
        pathname = pathname.slice(0, -1);
      } else if (trailingSlash === "enforce" && !pathname.endsWith("/") && !pathname.includes(".")) {
        pathname = pathname + "/";
      }

      parsed.pathname = pathname;

      return {
        cleanUrl: parsed.toString(),
        issues: detectedIssues,
      };
    } catch {
      return {
        cleanUrl: workingUrl,
        issues: ["Invalid URL format. Please enter a valid web address."],
      };
    }
  }, [rawUrl, enforceHttps, enforceLowercase, trailingSlash, stripTrackingParams]);

  // Generated HTML Tags
  const generatedHtmlTags = useMemo(() => {
    if (!cleanUrl) return "";
    const lines = [`<!-- Canonical URL Tag -->`, `<link rel="canonical" href="${cleanUrl}">`];

    if (includeHreflang && hreflangItems.length > 0) {
      lines.push(``, `<!-- International Hreflang Tags -->`);
      hreflangItems.forEach((item) => {
        lines.push(`<link rel="alternate" hreflang="${item.lang}" href="${item.url || cleanUrl}">`);
      });
    }

    return lines.join("\n");
  }, [cleanUrl, includeHreflang, hreflangItems]);

  // Generated HTTP Link Header
  const generatedHttpHeader = useMemo(() => {
    if (!cleanUrl) return "";
    let header = `Link: <${cleanUrl}>; rel="canonical"`;
    if (includeHreflang) {
      hreflangItems.forEach((item) => {
        header += `,\n      <${item.url || cleanUrl}>; rel="alternate"; hreflang="${item.lang}"`;
      });
    }
    return header;
  }, [cleanUrl, includeHreflang, hreflangItems]);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(generatedHtmlTags);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleCopyHeader = () => {
    navigator.clipboard.writeText(generatedHttpHeader);
    setCopiedHeader(true);
    setTimeout(() => setCopiedHeader(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedHtmlTags], { type: "text/html;charset=utf-8;" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "canonical-tags.html";
    a.click();
    URL.revokeObjectURL(u);
  };

  const addHreflang = () => {
    setHreflangItems([
      ...hreflangItems,
      { id: Date.now().toString(), lang: "fr", url: cleanUrl },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Shield size={14} /> Canonical &amp; Hreflang Normalizer
          </span>
          <span className="text-xs text-text-secondary">
            Prevents duplicate content indexing penalties
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setRawUrl("https://quicktools.app/seo/canonical-url-tag-generator?utm_source=twitter&utm_medium=social")
            }
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Sample Tracking URL
          </button>
          <button
            onClick={() => setRawUrl("")}
            disabled={!rawUrl}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-red-500/10 text-red-600 font-medium flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Input URL Card */}
      <div className="neo-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-border pb-2.5">
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-accent" />
            <span className="font-heading font-bold uppercase text-xs">
              Primary Page URL (Original or Dynamic)
            </span>
          </div>
          <span className="text-[11px] text-text-secondary">
            Enter URL to normalize into canonical format
          </span>
        </div>

        <input
          type="text"
          value={rawUrl}
          onChange={(e) => setRawUrl(e.target.value)}
          placeholder="https://example.com/products/shoes?utm_source=google&color=red"
          className="w-full neo-input py-2.5 px-3 text-sm font-mono"
        />

        {/* Cleaning & Normalization Options */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none neo-border p-2 rounded bg-surface">
            <input
              type="checkbox"
              checked={enforceHttps}
              onChange={(e) => setEnforceHttps(e.target.checked)}
              className="rounded accent-accent"
            />
            <span className="font-semibold">Enforce HTTPS (https://)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none neo-border p-2 rounded bg-surface">
            <input
              type="checkbox"
              checked={stripTrackingParams}
              onChange={(e) => setStripTrackingParams(e.target.checked)}
              className="rounded accent-accent"
            />
            <span className="font-semibold">Strip UTM &amp; Tracking</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none neo-border p-2 rounded bg-surface">
            <input
              type="checkbox"
              checked={enforceLowercase}
              onChange={(e) => setEnforceLowercase(e.target.checked)}
              className="rounded accent-accent"
            />
            <span className="font-semibold">Lowercase Domain</span>
          </label>

          <div className="neo-border p-2 rounded bg-surface flex items-center justify-between">
            <span className="font-semibold">Trailing Slash:</span>
            <select
              value={trailingSlash}
              onChange={(e) => setTrailingSlash(e.target.value as "strip" | "enforce" | "preserve")}
              className="bg-transparent font-medium border-0 focus:outline-none"
            >
              <option value="strip">Strip (/)</option>
              <option value="enforce">Enforce (/)</option>
              <option value="preserve">As Is</option>
            </select>
          </div>
        </div>

        {/* Issues list if any */}
        {issues.length > 0 && (
          <div className="p-2.5 neo-border rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{issues.join(" ")}</span>
          </div>
        )}
      </div>

      {/* Normalized Result Callout */}
      <div className="neo-card p-4 bg-accent-light space-y-2">
        <span className="font-heading font-bold uppercase text-xs text-accent block">
          Normalized Canonical Destination:
        </span>
        <div className="p-3 neo-border rounded bg-surface font-mono text-sm font-semibold text-text break-all">
          {cleanUrl || "Enter a URL above to inspect canonical format."}
        </div>
      </div>

      {/* Optional Hreflang Multi-Language Extension */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b-2 border-border pb-2.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeHreflang}
              onChange={(e) => setIncludeHreflang(e.target.checked)}
              className="rounded accent-accent"
            />
            <span className="font-heading font-bold uppercase text-xs">
              Include Multi-Language Hreflang Tags
            </span>
          </label>

          {includeHreflang && (
            <button
              onClick={addHreflang}
              className="px-2 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
            >
              <Plus size={12} /> Add Locale
            </button>
          )}
        </div>

        {includeHreflang && (
          <div className="space-y-2 text-xs">
            {hreflangItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <select
                  value={item.lang}
                  onChange={(e) => {
                    const copy = [...hreflangItems];
                    copy[idx].lang = e.target.value;
                    setHreflangItems(copy);
                  }}
                  className="w-44 neo-input py-1 px-2 text-xs"
                >
                  {COMMON_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => {
                    const copy = [...hreflangItems];
                    copy[idx].url = e.target.value;
                    setHreflangItems(copy);
                  }}
                  placeholder="https://example.com/locale/page"
                  className="flex-1 neo-input py-1 px-2 text-xs font-mono"
                />

                {hreflangItems.length > 1 && (
                  <button
                    onClick={() => setHreflangItems(hreflangItems.filter((h) => h.id !== item.id))}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Output 1: HTML Meta Tag */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b-2 border-border pb-2">
          <span className="font-heading font-bold uppercase text-xs text-text-secondary flex items-center gap-1.5">
            <Globe size={14} className="text-accent" /> HTML &lt;head&gt; Link Tag
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyHtml}
              className="px-2.5 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
            >
              {copiedHtml ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copiedHtml ? "Copied" : "Copy HTML"}
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

        <pre className="p-3 neo-border rounded bg-surface font-mono text-xs overflow-x-auto text-text leading-relaxed whitespace-pre-wrap">
          {generatedHtmlTags}
        </pre>
      </div>

      {/* Output 2: HTTP Link Header Format */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b-2 border-border pb-2">
          <div>
            <span className="font-heading font-bold uppercase text-xs text-text-secondary flex items-center gap-1.5">
              <Server size={14} className="text-accent" /> HTTP Response Header Format
            </span>
            <span className="text-[11px] text-text-secondary">
              Ideal for non-HTML files like PDFs, Word docs, images, or API endpoints.
            </span>
          </div>

          <button
            onClick={handleCopyHeader}
            className="px-2.5 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
          >
            {copiedHeader ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            {copiedHeader ? "Copied" : "Copy Header"}
          </button>
        </div>

        <pre className="p-3 neo-border rounded bg-surface font-mono text-xs overflow-x-auto text-text leading-relaxed whitespace-pre-wrap">
          {generatedHttpHeader}
        </pre>
      </div>
    </div>
  );
}
