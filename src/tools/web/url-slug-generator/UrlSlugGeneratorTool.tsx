"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Download,
  Settings2,
  ExternalLink,
  Sparkles,
  Layers,
} from "lucide-react";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "up", "about", "into", "over", "after",
  "is", "it", "this", "that", "are", "was", "were", "be", "been", "has", "have",
]);

// Map accented/latin characters to ascii equivalents
function transliterate(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/ß/g, "ss")
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe")
    .replace(/ø/g, "o")
    .replace(/ð/g, "d")
    .replace(/þ/g, "th")
    .replace(/ł/g, "l");
}

export default function UrlSlugGeneratorTool() {
  const [inputText, setInputText] = useState(
    "10 Proven Tips for Building High-Performance Next.js 16 Web Applications in 2026!"
  );
  const [baseUrl, setBaseUrl] = useState("https://example.com/blog/");
  const [separator, setSeparator] = useState<"-" | "_" | "." | "">("-");
  const [casing, setCasing] = useState<"lower" | "upper" | "preserve">("lower");
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [replaceAmpersand, setReplaceAmpersand] = useState(true);
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [maxLength, setMaxLength] = useState<number>(0);
  const [batchMode, setBatchMode] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const slugifySingle = (text: string): string => {
    if (!text.trim()) return "";

    let processed = transliterate(text);

    if (replaceAmpersand) {
      processed = processed.replace(/&/g, " and ");
    }

    // Convert casing
    if (casing === "lower") {
      processed = processed.toLowerCase();
    } else if (casing === "upper") {
      processed = processed.toUpperCase();
    }

    // Remove numbers if enabled
    if (removeNumbers) {
      processed = processed.replace(/[0-9]/g, "");
    }

    // Replace non-alphanumeric characters with spaces
    processed = processed.replace(/[^a-zA-Z0-9\s-_.]/g, " ");

    // Split into tokens
    let tokens = processed.split(/\s+/).filter(Boolean);

    // Filter stop words if enabled
    if (removeStopWords) {
      const filtered = tokens.filter((t) => !STOP_WORDS.has(t.toLowerCase()));
      if (filtered.length > 0) {
        tokens = filtered;
      }
    }

    // Join with selected separator
    const sep = separator;
    let slug = tokens.join(sep);

    // Apply max length if set
    if (maxLength > 0 && slug.length > maxLength) {
      slug = slug.substring(0, maxLength);
      // clean trailing separator
      if (sep && slug.endsWith(sep)) {
        slug = slug.slice(0, -sep.length);
      }
    }

    return slug;
  };

  const generatedSlug = useMemo(() => {
    if (!inputText) return "";
    if (batchMode) {
      return inputText
        .split("\n")
        .map((line) => slugifySingle(line))
        .join("\n");
    }
    return slugifySingle(inputText);
  }, [
    inputText,
    separator,
    casing,
    removeStopWords,
    replaceAmpersand,
    removeNumbers,
    maxLength,
    batchMode,
  ]);

  const fullUrl = useMemo(() => {
    if (!generatedSlug || batchMode) return "";
    const cleanBase = baseUrl.trim();
    if (!cleanBase) return generatedSlug;
    return cleanBase.endsWith("/")
      ? `${cleanBase}${generatedSlug}`
      : `${cleanBase}/${generatedSlug}`;
  }, [baseUrl, generatedSlug, batchMode]);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadSlugs = () => {
    if (!generatedSlug) return;
    const blob = new Blob([generatedSlug], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "url-slugs.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = (type: "blog" | "product" | "french") => {
    if (type === "blog") {
      setInputText("10 Proven Tips for Building High-Performance Next.js 16 Web Applications in 2026!");
      setSeparator("-");
      setCasing("lower");
      setRemoveStopWords(false);
      setReplaceAmpersand(true);
    } else if (type === "product") {
      setInputText("Nike Air Zoom Pegasus 40 - Men's Road Running Shoes (Sizes 8-13)");
      setSeparator("-");
      setCasing("lower");
      setRemoveStopWords(true);
      setReplaceAmpersand(false);
    } else {
      setInputText("Café & Crème: L'art de vivre à Paris (Guide Complet #1)");
      setSeparator("-");
      setCasing("lower");
      setRemoveStopWords(false);
      setReplaceAmpersand(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Settings */}
      <div className="neo-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-3">
          <span className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
            <Settings2 size={16} className="text-accent" />
            Slug Formatting Options
          </span>

          {/* Quick Examples */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-heading uppercase font-semibold">Examples:</span>
            <button
              onClick={() => loadExample("blog")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              Blog Title
            </button>
            <button
              onClick={() => loadExample("product")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              Product Name
            </button>
            <button
              onClick={() => loadExample("french")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              Accents & Special
            </button>
          </div>
        </div>

        {/* Separator & Casing Row */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-heading font-bold uppercase mb-1.5 text-text-secondary">
              Word Separator
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Hyphen (-)", value: "-" },
                { label: "Underscore (_)", value: "_" },
                { label: "Dot (.)", value: "." },
                { label: "None", value: "" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSeparator(item.value as "-" | "_" | "." | "")}
                  className={`py-2 px-1 text-xs neo-border rounded font-mono font-bold transition-colors ${
                    separator === item.value
                      ? "bg-accent text-white"
                      : "bg-surface hover:bg-bg text-text"
                  }`}
                >
                  {item.value || "none"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-bold uppercase mb-1.5 text-text-secondary">
              Letter Casing
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "lowercase", value: "lower" },
                { label: "UPPERCASE", value: "upper" },
                { label: "Preserve", value: "preserve" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCasing(item.value as "lower" | "upper" | "preserve")}
                  className={`py-2 px-1 text-xs neo-border rounded font-heading font-semibold uppercase transition-colors ${
                    casing === item.value
                      ? "bg-accent text-white"
                      : "bg-surface hover:bg-bg text-text"
                  }`}
                >
                  {item.value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-bold uppercase mb-1.5 text-text-secondary">
              Max Length ({maxLength > 0 ? `${maxLength} chars` : "Unlimited"})
            </label>
            <input
              type="number"
              min={0}
              max={200}
              value={maxLength || ""}
              onChange={(e) => setMaxLength(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="0 = no limit"
              className="w-full neo-input py-1.5 px-3 text-xs font-mono"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wide">
            <input
              type="checkbox"
              checked={removeStopWords}
              onChange={(e) => setRemoveStopWords(e.target.checked)}
              className="w-4 h-4 rounded neo-border accent-accent cursor-pointer"
            />
            Remove stop words (the, a, and, in)
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wide">
            <input
              type="checkbox"
              checked={replaceAmpersand}
              onChange={(e) => setReplaceAmpersand(e.target.checked)}
              className="w-4 h-4 rounded neo-border accent-accent cursor-pointer"
            />
            Convert &apos;&amp;&apos; to &apos;and&apos;
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wide">
            <input
              type="checkbox"
              checked={removeNumbers}
              onChange={(e) => setRemoveNumbers(e.target.checked)}
              className="w-4 h-4 rounded neo-border accent-accent cursor-pointer"
            />
            Remove digits/numbers
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wide">
            <input
              type="checkbox"
              checked={batchMode}
              onChange={(e) => setBatchMode(e.target.checked)}
              className="w-4 h-4 rounded neo-border accent-accent cursor-pointer"
            />
            Batch: Process each line
          </label>
        </div>
      </div>

      {/* Input / Output Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="neo-card p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="font-heading font-bold uppercase text-sm tracking-wide">
              {batchMode ? "Titles / Phrases (1 per line)" : "Original Title or Phrase"}
            </label>
            <button
              onClick={() => setInputText("")}
              disabled={!inputText}
              className="text-xs neo-btn neo-btn-secondary px-2 py-1 text-red-600 disabled:opacity-40"
              title="Clear input"
            >
              <Trash2 size={13} />
              Clear
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              batchMode
                ? "Enter one title per line...\nFirst Title\nSecond Article Headline"
                : "Enter an article headline, product name, or topic to generate a URL slug..."
            }
            rows={6}
            className="w-full neo-input p-3 font-mono text-sm resize-y flex-1"
          />

          {!batchMode && (
            <div className="space-y-1.5 pt-2 border-t border-border/50">
              <label className="block text-xs font-heading font-bold uppercase text-text-secondary">
                Optional Base URL Prefix
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://example.com/posts/"
                className="w-full neo-input py-1.5 px-3 text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* Output Card */}
        <div className="neo-card p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="font-heading font-bold uppercase text-sm tracking-wide">
              Generated Slug Result
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(generatedSlug, "slug")}
                disabled={!generatedSlug}
                className="text-xs neo-btn neo-btn-primary px-2.5 py-1 disabled:opacity-40"
              >
                {copiedKey === "slug" ? <Check size={13} /> : <Copy size={13} />}
                {copiedKey === "slug" ? "Copied Slug" : "Copy Slug"}
              </button>
              {batchMode && (
                <button
                  onClick={downloadSlugs}
                  disabled={!generatedSlug}
                  className="text-xs neo-btn neo-btn-secondary px-2 py-1 disabled:opacity-40"
                  title="Download all slugs"
                >
                  <Download size={13} />
                </button>
              )}
            </div>
          </div>

          <textarea
            value={generatedSlug}
            readOnly
            placeholder="Generated slug will appear here..."
            rows={batchMode ? 8 : 4}
            className="w-full neo-input p-3 font-mono text-sm font-bold text-accent bg-surface/50 resize-y flex-1"
          />

          {/* Full URL permalink preview (when not in batch mode) */}
          {!batchMode && fullUrl && (
            <div className="p-3 neo-border rounded-lg bg-surface space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold uppercase text-text-secondary">
                  Complete Permalink Preview
                </span>
                <button
                  onClick={() => copyToClipboard(fullUrl, "full-url")}
                  className="hover:text-accent font-semibold text-xs flex items-center gap-1"
                >
                  {copiedKey === "full-url" ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedKey === "full-url" ? "Copied" : "Copy Full URL"}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-text break-all">
                {fullUrl}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
            <span>
              Length: <strong className="text-text font-mono">{generatedSlug.length}</strong> chars
            </span>
            <button
              onClick={() => {
                setInputText("");
                setSeparator("-");
                setCasing("lower");
                setRemoveStopWords(false);
                setReplaceAmpersand(true);
                setRemoveNumbers(false);
                setMaxLength(0);
                setBatchMode(false);
              }}
              className="hover:underline flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
