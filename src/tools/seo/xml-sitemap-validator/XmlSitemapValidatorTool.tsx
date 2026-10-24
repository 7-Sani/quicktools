"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Download,
  Upload,
  FileCode,
  Shield,
  Trash2,
  Sparkles,
  ExternalLink,
} from "lucide-react";

const SAMPLE_VALID_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://quicktools.app/</loc>
    <lastmod>2026-10-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://quicktools.app/categories/seo</loc>
    <lastmod>2026-10-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://quicktools.app/tools/serp-snippet-preview</loc>
    <lastmod>2026-10-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

const SAMPLE_INDEX_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://quicktools.app/sitemap-tools.xml</loc>
    <lastmod>2026-10-20</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://quicktools.app/sitemap-blog.xml</loc>
    <lastmod>2026-10-15</lastmod>
  </sitemap>
</sitemapindex>`;

const SAMPLE_ERROR_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <!-- Error: Relative URL instead of absolute URL -->
    <loc>/tools/audio-compressor</loc>
    <!-- Error: Invalid date format -->
    <lastmod>20/10/2026</lastmod>
    <!-- Error: Invalid changefreq value -->
    <changefreq>sometimes</changefreq>
    <!-- Error: Priority out of 0.0 - 1.0 range -->
    <priority>1.5</priority>
  </url>
  <url>
    <!-- Warning: Insecure HTTP instead of HTTPS -->
    <loc>http://example.com/insecure-page</loc>
  </url>
</urlset>`;

interface UrlItem {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  errors: string[];
  warnings: string[];
}

export default function XmlSitemapValidatorTool() {
  const [xmlContent, setXmlContent] = useState(SAMPLE_VALID_SITEMAP);
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "errors" | "valid">("all");

  // Handle XML file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) setXmlContent(text);
      };
      reader.readAsText(file);
    }
  };

  // Perform client-side XML validation using DOMParser
  const validationResult = useMemo(() => {
    const globalErrors: string[] = [];
    const globalWarnings: string[] = [];
    const urls: UrlItem[] = [];

    if (!xmlContent.trim()) {
      return {
        isParsed: false,
        rootType: "unknown",
        globalErrors: ["Empty XML document."],
        globalWarnings: [],
        urls: [],
      };
    }

    let xmlDoc: Document;
    try {
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlContent, "application/xml");
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        return {
          isParsed: false,
          rootType: "unknown",
          globalErrors: [`XML Parsing Error: ${parseError[0].textContent?.slice(0, 200)}...`],
          globalWarnings: [],
          urls: [],
        };
      }
    } catch (err: unknown) {
      return {
        isParsed: false,
        rootType: "unknown",
        globalErrors: [`Parser exception: ${err instanceof Error ? err.message : String(err)}`],
        globalWarnings: [],
        urls: [],
      };
    }

    const root = xmlDoc.documentElement;
    const rootName = root.nodeName.toLowerCase();

    // Check root tag
    if (rootName !== "urlset" && rootName !== "sitemapindex") {
      globalErrors.push(`Invalid root element <${root.nodeName}>. Must be <urlset> or <sitemapindex>.`);
    }

    // Check namespace
    const namespace = root.getAttribute("xmlns");
    if (!namespace) {
      globalWarnings.push('Missing XML namespace. Standard: xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    } else if (namespace !== "http://www.sitemaps.org/schemas/sitemap/0.9") {
      globalWarnings.push(`Non-standard namespace "${namespace}". Standard is "http://www.sitemaps.org/schemas/sitemap/0.9".`);
    }

    // Standard valid changefreq values
    const validChangefreqs = new Set(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]);

    // If sitemap index
    if (rootName === "sitemapindex") {
      const sitemaps = root.getElementsByTagName("sitemap");
      if (sitemaps.length === 0) {
        globalWarnings.push("No <sitemap> entries found inside <sitemapindex>.");
      }

      for (let i = 0; i < sitemaps.length; i++) {
        const item = sitemaps[i];
        const locElem = item.getElementsByTagName("loc")[0];
        const lastmodElem = item.getElementsByTagName("lastmod")[0];

        const loc = locElem?.textContent?.trim() || "";
        const lastmod = lastmodElem?.textContent?.trim();

        const itemErrors: string[] = [];
        const itemWarnings: string[] = [];

        if (!loc) {
          itemErrors.push("Missing required <loc> tag.");
        } else if (!/^https?:\/\//i.test(loc)) {
          itemErrors.push("Must be an absolute URL starting with http:// or https://");
        }

        urls.push({
          loc: loc || "(missing loc)",
          lastmod,
          errors: itemErrors,
          warnings: itemWarnings,
        });
      }
    } else {
      // Standard urlset
      const urlNodes = root.getElementsByTagName("url");
      if (urlNodes.length === 0) {
        globalWarnings.push("No <url> entries found in <urlset>.");
      }

      if (urlNodes.length > 50000) {
        globalErrors.push(`Sitemap contains ${urlNodes.length} URLs. Google limits sitemaps to 50,000 URLs per file.`);
      }

      for (let i = 0; i < urlNodes.length; i++) {
        const node = urlNodes[i];
        const locElem = node.getElementsByTagName("loc")[0];
        const lastmodElem = node.getElementsByTagName("lastmod")[0];
        const changefreqElem = node.getElementsByTagName("changefreq")[0];
        const priorityElem = node.getElementsByTagName("priority")[0];

        const loc = locElem?.textContent?.trim() || "";
        const lastmod = lastmodElem?.textContent?.trim();
        const changefreq = changefreqElem?.textContent?.trim();
        const priority = priorityElem?.textContent?.trim();

        const itemErrors: string[] = [];
        const itemWarnings: string[] = [];

        // Loc validation
        if (!loc) {
          itemErrors.push("Missing required <loc> element.");
        } else if (!/^https?:\/\//i.test(loc)) {
          itemErrors.push("URL must be absolute (must start with https:// or http://). Relative paths are prohibited.");
        } else if (loc.startsWith("http://")) {
          itemWarnings.push("Insecure protocol (HTTP). HTTPS is strongly recommended.");
        }

        // Lastmod validation (W3C Datetime format check)
        if (lastmod) {
          const isIsoDate = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(lastmod);
          if (!isIsoDate) {
            itemErrors.push(`Invalid lastmod format "${lastmod}". Must follow W3C Datetime (YYYY-MM-DD or ISO 8601).`);
          }
        }

        // Changefreq validation
        if (changefreq && !validChangefreqs.has(changefreq.toLowerCase())) {
          itemErrors.push(`Invalid changefreq "${changefreq}". Allowed: always, hourly, daily, weekly, monthly, yearly, never.`);
        }

        // Priority validation
        if (priority) {
          const num = parseFloat(priority);
          if (isNaN(num) || num < 0.0 || num > 1.0) {
            itemErrors.push(`Invalid priority "${priority}". Must be a floating point number between 0.0 and 1.0.`);
          }
        }

        urls.push({
          loc: loc || "(missing loc)",
          lastmod,
          changefreq,
          priority,
          errors: itemErrors,
          warnings: itemWarnings,
        });
      }
    }

    return {
      isParsed: true,
      rootType: rootName,
      globalErrors,
      globalWarnings,
      urls,
    };
  }, [xmlContent]);

  // Totals
  const totalUrls = validationResult.urls.length;
  const errorUrlsCount = validationResult.urls.filter((u) => u.errors.length > 0).length;
  const warningUrlsCount = validationResult.urls.filter((u) => u.warnings.length > 0 && u.errors.length === 0).length;
  const validUrlsCount = totalUrls - errorUrlsCount;
  const hasGlobalErrors = validationResult.globalErrors.length > 0;

  // Filtered URLs for table
  const displayedUrls = useMemo(() => {
    if (filterType === "errors") {
      return validationResult.urls.filter((u) => u.errors.length > 0);
    }
    if (filterType === "valid") {
      return validationResult.urls.filter((u) => u.errors.length === 0);
    }
    return validationResult.urls;
  }, [validationResult.urls, filterType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8;" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <div className="space-y-6">
      {/* Local analysis disclaimer */}
      <div className="p-3.5 neo-border rounded-lg bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-accent shrink-0" />
          <span>
            <strong>Local In-Browser Validation:</strong> Validates XML structure, namespaces, date formats, and tag rules locally without pinging external servers.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setXmlContent(SAMPLE_VALID_SITEMAP)}
            className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Sample Valid
          </button>
          <button
            onClick={() => setXmlContent(SAMPLE_INDEX_SITEMAP)}
            className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Sample Index
          </button>
          <button
            onClick={() => setXmlContent(SAMPLE_ERROR_SITEMAP)}
            className="px-2 py-1 neo-border rounded bg-surface hover:bg-red-500/10 text-red-600 font-medium"
          >
            Sample with Errors
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border pb-2.5">
          <div className="flex items-center gap-2">
            <FileCode size={16} className="text-accent" />
            <span className="font-heading font-bold uppercase text-xs">
              Paste XML Sitemap or Upload .xml File
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold cursor-pointer flex items-center gap-1.5">
              <Upload size={12} className="text-accent" />
              <span>Upload XML File</span>
              <input
                type="file"
                accept=".xml,text/xml"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-medium flex items-center gap-1"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-medium flex items-center gap-1"
            >
              <Download size={12} />
              Export XML
            </button>
          </div>
        </div>

        <textarea
          value={xmlContent}
          onChange={(e) => setXmlContent(e.target.value)}
          rows={7}
          placeholder="Paste XML sitemap code here..."
          className="w-full neo-input p-3 font-mono text-xs leading-relaxed resize-y"
        />
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Total URLs Found
          </div>
          <div className="text-2xl font-heading font-bold text-accent">
            {totalUrls}
          </div>
        </div>

        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Valid URLs
          </div>
          <div className="text-2xl font-heading font-bold text-emerald-600">
            {validUrlsCount}
          </div>
        </div>

        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Issues / Errors
          </div>
          <div className={`text-2xl font-heading font-bold ${errorUrlsCount > 0 || hasGlobalErrors ? "text-red-500" : "text-text-secondary"}`}>
            {errorUrlsCount + (hasGlobalErrors ? 1 : 0)}
          </div>
        </div>

        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Sitemap Type
          </div>
          <div className="text-lg font-heading font-bold truncate">
            {validationResult.rootType === "sitemapindex" ? "Index Sitemap" : "URL Set"}
          </div>
        </div>
      </div>

      {/* Global Errors or Warnings if any */}
      {(validationResult.globalErrors.length > 0 || validationResult.globalWarnings.length > 0) && (
        <div className="neo-card p-4 space-y-2 border-red-500/40 bg-red-500/5">
          <div className="font-heading font-bold text-xs uppercase text-red-600 flex items-center gap-1.5">
            <XCircle size={15} /> Document-Level Issues Detected
          </div>
          <ul className="text-xs space-y-1 list-disc list-inside text-red-700 dark:text-red-300">
            {validationResult.globalErrors.map((err, i) => (
              <li key={`err-${i}`}>
                <strong>Error:</strong> {err}
              </li>
            ))}
            {validationResult.globalWarnings.map((warn, i) => (
              <li key={`warn-${i}`} className="text-amber-700 dark:text-amber-300">
                <strong>Warning:</strong> {warn}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed URLs Inspection Table */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border pb-2.5">
          <div className="font-heading font-bold uppercase text-xs text-text-secondary">
            Inspected Sitemap Entries ({totalUrls})
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-0.5 neo-border rounded font-semibold ${
                filterType === "all" ? "bg-accent text-white" : "bg-surface"
              }`}
            >
              All ({totalUrls})
            </button>
            <button
              onClick={() => setFilterType("errors")}
              className={`px-2.5 py-0.5 neo-border rounded font-semibold ${
                filterType === "errors" ? "bg-red-500 text-white" : "bg-surface text-red-600"
              }`}
            >
              Errors ({errorUrlsCount})
            </button>
            <button
              onClick={() => setFilterType("valid")}
              className={`px-2.5 py-0.5 neo-border rounded font-semibold ${
                filterType === "valid" ? "bg-emerald-600 text-white" : "bg-surface text-emerald-600"
              }`}
            >
              Valid ({validUrlsCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 border-2 border-border rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-surface neo-border border-x-0 border-t-0 font-heading font-bold uppercase text-text-secondary">
              <tr>
                <th className="p-2.5 w-10 text-center">#</th>
                <th className="p-2.5">URL Location (&lt;loc&gt;)</th>
                <th className="p-2.5 w-28">Lastmod</th>
                <th className="p-2.5 w-24">Changefreq</th>
                <th className="p-2.5 w-20">Priority</th>
                <th className="p-2.5 w-28 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedUrls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-text-secondary">
                    No URLs found matching filter.
                  </td>
                </tr>
              ) : (
                displayedUrls.map((item, idx) => {
                  const hasErr = item.errors.length > 0;
                  const hasWarn = item.warnings.length > 0;

                  return (
                    <tr key={idx} className={hasErr ? "bg-red-500/5" : "hover:bg-accent/5"}>
                      <td className="p-2.5 text-center text-text-secondary font-mono">{idx + 1}</td>
                      <td className="p-2.5 font-mono">
                        <div className="font-semibold break-all">{item.loc}</div>
                        {hasErr && (
                          <div className="text-[11px] text-red-600 mt-0.5">
                            ✕ {item.errors.join("; ")}
                          </div>
                        )}
                        {hasWarn && (
                          <div className="text-[11px] text-amber-600 mt-0.5">
                            ⚠ {item.warnings.join("; ")}
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 font-mono text-text-secondary">{item.lastmod || "—"}</td>
                      <td className="p-2.5 font-mono text-text-secondary">{item.changefreq || "—"}</td>
                      <td className="p-2.5 font-mono text-text-secondary">{item.priority || "—"}</td>
                      <td className="p-2.5 text-center">
                        {hasErr ? (
                          <span className="inline-block px-2 py-0.5 neo-border rounded bg-red-500/10 text-red-600 font-bold text-[10px]">
                            INVALID
                          </span>
                        ) : hasWarn ? (
                          <span className="inline-block px-2 py-0.5 neo-border rounded bg-amber-500/10 text-amber-700 font-bold text-[10px]">
                            WARNING
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 neo-border rounded bg-emerald-500/10 text-emerald-700 font-bold text-[10px]">
                            VALID
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
