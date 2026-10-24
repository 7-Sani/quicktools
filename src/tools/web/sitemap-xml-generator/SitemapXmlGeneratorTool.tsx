"use client";

import React, { useState, useMemo } from "react";
import {
  FileCode2,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Download,
  Plus,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Layers,
} from "lucide-react";

interface SitemapEntry {
  id: string;
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
}

const TODAY_STR = new Date().toISOString().split("T")[0];

export default function SitemapXmlGeneratorTool() {
  const [entries, setEntries] = useState<SitemapEntry[]>([
    {
      id: "entry-1",
      loc: "https://example.com/",
      lastmod: TODAY_STR,
      changefreq: "daily",
      priority: "1.0",
    },
    {
      id: "entry-2",
      loc: "https://example.com/about",
      lastmod: TODAY_STR,
      changefreq: "monthly",
      priority: "0.8",
    },
    {
      id: "entry-3",
      loc: "https://example.com/pricing",
      lastmod: TODAY_STR,
      changefreq: "weekly",
      priority: "0.9",
    },
    {
      id: "entry-4",
      loc: "https://example.com/contact",
      lastmod: TODAY_STR,
      changefreq: "yearly",
      priority: "0.5",
    },
  ]);

  const [bulkMode, setBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [copied, setCopied] = useState(false);

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: Math.random().toString(36).substring(2, 9),
        loc: "https://example.com/new-page",
        lastmod: TODAY_STR,
        changefreq: "weekly",
        priority: "0.7",
      },
    ]);
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return;
    setEntries(entries.filter((e) => e.id !== id));
  };

  const updateEntry = (
    id: string,
    field: "loc" | "lastmod" | "changefreq" | "priority",
    val: string
  ) => {
    setEntries(
      entries.map((e) => (e.id === id ? { ...e, [field]: val } : e))
    );
  };

  const handleBulkImport = () => {
    if (!bulkInput.trim()) return;
    const lines = bulkInput
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const newItems: SitemapEntry[] = lines.map((line) => {
      let url = line;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }
      return {
        id: Math.random().toString(36).substring(2, 9),
        loc: url,
        lastmod: TODAY_STR,
        changefreq: "weekly",
        priority: "0.8",
      };
    });

    setEntries(newItems);
    setBulkMode(false);
  };

  // Generate valid XML sitemap standard
  const generatedXml = useMemo(() => {
    const lines: string[] = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ];

    entries.forEach((item) => {
      let loc = item.loc.trim();
      if (!loc) return;
      if (!loc.startsWith("http://") && !loc.startsWith("https://")) {
        loc = `https://${loc}`;
      }

      // XML escape special characters in URL
      const escapedLoc = loc
        .replace(/&/g, "&amp;")
        .replace(/'/g, "&apos;")
        .replace(/"/g, "&quot;")
        .replace(/>/g, "&gt;")
        .replace(/</g, "&lt;");

      lines.push(`  <url>`);
      lines.push(`    <loc>${escapedLoc}</loc>`);
      if (item.lastmod.trim()) {
        lines.push(`    <lastmod>${item.lastmod.trim()}</lastmod>`);
      }
      if (item.changefreq) {
        lines.push(`    <changefreq>${item.changefreq}</changefreq>`);
      }
      if (item.priority) {
        lines.push(`    <priority>${item.priority}</priority>`);
      }
      lines.push(`  </url>`);
    });

    lines.push(`</urlset>`);
    return lines.join("\n");
  }, [entries]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadXml = () => {
    const blob = new Blob([generatedXml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadPreset = (type: "saas" | "blog" | "ecommerce") => {
    if (type === "saas") {
      setEntries([
        { id: "s1", loc: "https://example.com/", lastmod: TODAY_STR, changefreq: "daily", priority: "1.0" },
        { id: "s2", loc: "https://example.com/features", lastmod: TODAY_STR, changefreq: "weekly", priority: "0.9" },
        { id: "s3", loc: "https://example.com/pricing", lastmod: TODAY_STR, changefreq: "weekly", priority: "0.9" },
        { id: "s4", loc: "https://example.com/docs", lastmod: TODAY_STR, changefreq: "daily", priority: "0.8" },
        { id: "s5", loc: "https://example.com/blog", lastmod: TODAY_STR, changefreq: "daily", priority: "0.8" },
        { id: "s6", loc: "https://example.com/contact", lastmod: TODAY_STR, changefreq: "monthly", priority: "0.5" },
      ]);
    } else if (type === "blog") {
      setEntries([
        { id: "b1", loc: "https://myblog.com/", lastmod: TODAY_STR, changefreq: "daily", priority: "1.0" },
        { id: "b2", loc: "https://myblog.com/categories/technology", lastmod: TODAY_STR, changefreq: "daily", priority: "0.8" },
        { id: "b3", loc: "https://myblog.com/categories/design", lastmod: TODAY_STR, changefreq: "weekly", priority: "0.8" },
        { id: "b4", loc: "https://myblog.com/posts/getting-started-with-nextjs", lastmod: TODAY_STR, changefreq: "monthly", priority: "0.7" },
        { id: "b5", loc: "https://myblog.com/posts/web-security-best-practices", lastmod: TODAY_STR, changefreq: "monthly", priority: "0.7" },
      ]);
    } else {
      setEntries([
        { id: "e1", loc: "https://mystore.com/", lastmod: TODAY_STR, changefreq: "daily", priority: "1.0" },
        { id: "e2", loc: "https://mystore.com/products", lastmod: TODAY_STR, changefreq: "daily", priority: "0.9" },
        { id: "e3", loc: "https://mystore.com/categories/footwear", lastmod: TODAY_STR, changefreq: "weekly", priority: "0.8" },
        { id: "e4", loc: "https://mystore.com/categories/apparel", lastmod: TODAY_STR, changefreq: "weekly", priority: "0.8" },
        { id: "e5", loc: "https://mystore.com/sale", lastmod: TODAY_STR, changefreq: "daily", priority: "0.9" },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset & Mode Switcher Bar */}
      <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <span className="font-heading font-bold uppercase text-xs tracking-wide">
            Presets & Bulk Import:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadPreset("saas")}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            SaaS Website
          </button>
          <button
            onClick={() => loadPreset("blog")}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Blog & Articles
          </button>
          <button
            onClick={() => loadPreset("ecommerce")}
            className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            E-Commerce Store
          </button>
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className={`text-xs px-2.5 py-1 neo-border rounded font-heading font-semibold uppercase ${
              bulkMode ? "bg-accent text-white" : "bg-surface hover:bg-bg"
            }`}
          >
            {bulkMode ? "Close Bulk Paste" : "Paste Multiple URLs"}
          </button>
        </div>
      </div>

      {/* Bulk Import Modal / Box */}
      {bulkMode && (
        <div className="neo-card p-5 space-y-3 bg-accent/5 border-accent">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold uppercase text-sm tracking-wide">
              Paste URLs in Bulk (1 per line)
            </span>
            <button
              onClick={() => setBulkMode(false)}
              className="text-xs hover:underline text-text-secondary"
            >
              Cancel
            </button>
          </div>
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder={`https://example.com/\nhttps://example.com/about\nhttps://example.com/pricing\nhttps://example.com/blog`}
            rows={5}
            className="w-full neo-input p-3 font-mono text-xs resize-y"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-text-secondary">
              All parsed URLs will default to weekly frequency and 0.8 priority.
            </span>
            <button
              onClick={handleBulkImport}
              disabled={!bulkInput.trim()}
              className="neo-btn neo-btn-primary px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Import URLs into Sitemap
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Form: URL Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="neo-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <div>
                <span className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
                  <FileCode2 size={16} className="text-accent" />
                  Sitemap URLs ({entries.length})
                </span>
                <span className="text-xs text-text-secondary block mt-0.5">
                  Configure change frequency, priority rating, and last modification date
                </span>
              </div>

              <button
                type="button"
                onClick={addEntry}
                className="text-xs neo-btn neo-btn-secondary px-2.5 py-1 flex items-center gap-1 font-heading uppercase"
              >
                <Plus size={13} />
                <span>Add URL</span>
              </button>
            </div>

            {/* Entries List */}
            <div className="space-y-3">
              {entries.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 neo-border rounded-lg bg-surface/40 space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-mono text-xs text-text-secondary font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.loc}
                      onChange={(e) => updateEntry(item.id, "loc", e.target.value)}
                      placeholder="https://example.com/page-url"
                      className="flex-1 neo-input py-1.5 px-3 text-xs font-mono font-medium"
                    />
                    {entries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEntry(item.id)}
                        className="p-1.5 neo-border rounded hover:bg-red-50 text-red-600"
                        title="Remove URL"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Metadata Row: Date, ChangeFreq, Priority */}
                  <div className="grid grid-cols-3 gap-2 pl-7">
                    <div>
                      <label className="block text-[10px] font-heading font-bold uppercase text-text-secondary mb-0.5">
                        Lastmod
                      </label>
                      <input
                        type="date"
                        value={item.lastmod}
                        onChange={(e) => updateEntry(item.id, "lastmod", e.target.value)}
                        className="w-full neo-input py-1 px-2 text-xs font-mono bg-bg"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-heading font-bold uppercase text-text-secondary mb-0.5">
                        Changefreq
                      </label>
                      <select
                        value={item.changefreq}
                        onChange={(e) =>
                          updateEntry(
                            item.id,
                            "changefreq",
                            e.target.value as SitemapEntry["changefreq"]
                          )
                        }
                        className="w-full neo-input py-1 px-1.5 text-xs bg-bg"
                      >
                        <option value="always">always</option>
                        <option value="hourly">hourly</option>
                        <option value="daily">daily</option>
                        <option value="weekly">weekly</option>
                        <option value="monthly">monthly</option>
                        <option value="yearly">yearly</option>
                        <option value="never">never</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-heading font-bold uppercase text-text-secondary mb-0.5">
                        Priority (0.0–1.0)
                      </label>
                      <select
                        value={item.priority}
                        onChange={(e) => updateEntry(item.id, "priority", e.target.value)}
                        className="w-full neo-input py-1 px-1.5 text-xs bg-bg font-mono"
                      >
                        <option value="1.0">1.0 (Highest - Homepage)</option>
                        <option value="0.9">0.9 (Key Landing Page)</option>
                        <option value="0.8">0.8 (Main Category)</option>
                        <option value="0.7">0.7 (Sub-category)</option>
                        <option value="0.6">0.6 (Articles/Posts)</option>
                        <option value="0.5">0.5 (Standard Content)</option>
                        <option value="0.3">0.3 (Archive/Old)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output: XML Display & Download (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-5 space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <span className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
                <FileCode2 size={16} className="text-accent" />
                sitemap.xml Output
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="text-xs neo-btn neo-btn-primary px-2.5 py-1 flex items-center gap-1.5"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? "Copied!" : "Copy XML"}</span>
                </button>
                <button
                  type="button"
                  onClick={downloadXml}
                  className="text-xs neo-btn neo-btn-secondary px-2 py-1"
                  title="Download sitemap.xml file"
                >
                  <Download size={13} />
                </button>
              </div>
            </div>

            <textarea
              value={generatedXml}
              readOnly
              rows={16}
              className="w-full neo-input p-3 font-mono text-xs bg-surface/50 text-text resize-y leading-relaxed"
            />

            <div className="p-3.5 neo-border rounded-lg bg-surface text-xs text-text-secondary space-y-2">
              <div className="font-heading font-bold uppercase text-text flex items-center gap-1.5">
                <HelpCircle size={14} className="text-accent" />
                Publishing Your Sitemap:
              </div>
              <p>
                Save this file as <strong>sitemap.xml</strong> in your website&apos;s root directory or public folder. Then submit its location in Google Search Console:
              </p>
              <code className="block p-2 rounded bg-bg neo-border font-mono text-[11px] text-accent">
                https://yourdomain.com/sitemap.xml
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
