"use client";

import React, { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import {
  FileText,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  Trash2,
  Eye,
  Code,
  ShieldCheck,
} from "lucide-react";

/**
 * Validates link targets against an explicit protocol allowlist.
 * Blocks javascript:, data:, vbscript:, and malicious schemes.
 */
export function isSafeUrl(urlStr: string): boolean {
  const trimmed = urlStr.trim();
  if (!trimmed) return false;

  // Disallow any whitespace, quotes, angle brackets, or dangerous pseudo-schemes anywhere in the link
  if (/["'<>\s]/.test(trimmed) || /javascript:|data:|vbscript:/i.test(trimmed)) {
    return false;
  }

  // Permit fragment or relative paths (e.g. #section or /docs)
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    return protocol === "https:" || protocol === "http:" || protocol === "mailto:";
  } catch {
    return false;
  }
}

const SAMPLE_MARKDOWN = `# QuickTools Markdown Guide

Welcome to the **Markdown to HTML Converter**! This tool processes GitHub Flavored Markdown (GFM) client-side.

## Key Features

- **Rich Formatting:** *Italic*, **Bold**, ~~Strikethrough~~, and \`Inline Code\`
- **Blockquotes:**
  > "The secret to building great tools is simplicity and zero latency."
- **Task Lists:**
  - [x] Fast client-side conversion
  - [x] XSS protection & sanitization
  - [ ] Add your custom content

### Code Example
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Data Table
| Tool Name | Category | Status |
| :--- | :--- | :--- |
| JSON Formatter | File & Data | Active |
| Markdown Converter | File & Data | Active |
| ZIP Extractor | File & Data | Active |

Learn more at [QuickTools Home](https://quicktools.local).
`;

// Basic safe Markdown parser handling GFM elements without unsafe external vulnerabilities
export function parseMarkdownToHtml(md: string, standalone: boolean): { html: string; safePreview: string } {
  // First escape raw HTML angle brackets to prevent direct XSS from raw markdown input
  let escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks ```lang ... ```
  escaped = escaped.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code `code`
  escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headings
  escaped = escaped.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
  escaped = escaped.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  escaped = escaped.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  escaped = escaped.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  escaped = escaped.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  escaped = escaped.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold & Italic
  escaped = escaped.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
  escaped = escaped.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // Blockquotes
  escaped = escaped.replace(/^&gt; (.*$)/gim, "<blockquote><p>$1</p></blockquote>");

  // Task lists
  escaped = escaped.replace(
    /^- \[x\] (.*$)/gim,
    '<li class="task-list-item"><input type="checkbox" checked disabled /> $1</li>'
  );
  escaped = escaped.replace(
    /^- \[ \] (.*$)/gim,
    '<li class="task-list-item"><input type="checkbox" disabled /> $1</li>'
  );

  // Unordered lists
  escaped = escaped.replace(/^[*-] (.*$)/gim, "<li>$1</li>");
  // Wrap sequential <li> in <ul>
  escaped = escaped.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>\n${match}</ul>\n`);

  // Simple tables
  escaped = escaped.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (tableBlock) => {
    const lines = tableBlock.trim().split("\n");
    if (lines.length < 2) return tableBlock;

    const headerLine = lines[0];
    const isSeparator = /^\|(?:\s*:?-+:?\s*\|)+$/.test(lines[1].trim());
    if (!isSeparator) return tableBlock;

    const headers = headerLine
      .split("|")
      .slice(1, -1)
      .map((h) => `<th>${h.trim()}</th>`)
      .join("");

    const bodyRows = lines
      .slice(2)
      .map((line) => {
        const cells = line
          .split("|")
          .slice(1, -1)
          .map((c) => `<td>${c.trim()}</td>`)
          .join("");
        return `  <tr>${cells}</tr>`;
      })
      .join("\n");

    return `<table>\n<thead>\n  <tr>${headers}</tr>\n</thead>\n<tbody>\n${bodyRows}\n</tbody>\n</table>\n`;
  });

  // Links [text](url) - strictly enforce allowed schemes and attribute encoding
  escaped = escaped.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, href) => {
      const cleanHref = href.trim();
      if (!isSafeUrl(cleanHref)) {
        return text;
      }
      const safeHref = cleanHref
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
  );

  // Paragraphs
  const blocks = escaped.split(/\n\s*\n/);
  const formattedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<pre") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("<ol") ||
      trimmed.startsWith("<table") ||
      trimmed.startsWith("<blockquote")
    ) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
  });

  const rawFragment = formattedBlocks.filter(Boolean).join("\n\n");

  // Sanitize markup using DOMPurify with strict allowlist
  const purifyConfig = {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr", "strong", "em", "del",
      "code", "pre", "blockquote",
      "ul", "ol", "li", "input",
      "table", "thead", "tbody", "tr", "th", "td",
      "a"
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "type", "checked", "disabled"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|#|\/)/i,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "base", "svg", "math"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "style"],
  };

  const safePreview = typeof window !== "undefined" && DOMPurify.sanitize
    ? DOMPurify.sanitize(rawFragment, purifyConfig)
    : rawFragment;

  let rawHtml = safePreview;

  if (standalone) {
    rawHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Markdown</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; margin-top: 1.5rem; }
    pre { background: #f1f5f9; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    code { font-family: monospace; background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; }
    blockquote { border-left: 4px solid #0284c7; margin-left: 0; padding-left: 1rem; color: #475569; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    a { color: #0284c7; }
  </style>
</head>
<body>
${safePreview}
</body>
</html>`;
  }

  return { html: rawHtml, safePreview };
}

export default function MarkdownToHtmlConverterTool() {
  const [inputMarkdown, setInputMarkdown] = useState(SAMPLE_MARKDOWN);
  const [standalone, setStandalone] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "preview">("preview");
  const [copied, setCopied] = useState(false);

  const { html, safePreview } = useMemo(() => {
    if (!inputMarkdown.trim()) {
      return { html: "", safePreview: "" };
    }
    return parseMarkdownToHtml(inputMarkdown, standalone);
  }, [inputMarkdown, standalone]);

  const handleCopy = () => {
    if (!html) return;
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = standalone ? "document.html" : "fragment.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setInputMarkdown(text);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0284C7] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Markdown to HTML Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Convert GitHub-flavored Markdown into clean, sanitized HTML markup
            </p>
          </div>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setInputMarkdown(SAMPLE_MARKDOWN)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sample Markdown
          </button>
          <button
            onClick={() => setInputMarkdown("")}
            className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            Clear
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-black uppercase">
            <input
              type="checkbox"
              checked={standalone}
              onChange={(e) => setStandalone(e.target.checked)}
              className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
            />
            <span>Full Standalone Document (include &lt;!DOCTYPE html&gt; &amp; &lt;head&gt;)</span>
          </label>
        </div>

        <div className="flex items-center gap-1.5 bg-[#BBF7D0] px-2.5 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
          <span>XSS Protected Sanitization</span>
        </div>
      </div>

      {/* Dual Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Markdown Input */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Markdown Input
            </label>
            <label className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload .md
              <input
                type="file"
                accept=".md,.markdown,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={inputMarkdown}
            onChange={(e) => setInputMarkdown(e.target.value)}
            placeholder="Write or paste your markdown text here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black resize-y"
            spellCheck={false}
          />
        </div>

        {/* HTML Output / Preview */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 text-xs font-black uppercase border-2 border-black transition-all flex items-center gap-1.5 ${
                  activeTab === "preview"
                    ? "bg-[#0284C7] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab("html")}
                className={`px-3 py-1 text-xs font-black uppercase border-2 border-black transition-all flex items-center gap-1.5 ${
                  activeTab === "html"
                    ? "bg-[#0284C7] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                HTML Code
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!html}
                className="px-3 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy HTML"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!html}
                className="px-3 py-1 text-xs font-black uppercase bg-[#A7F3D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#86EFAC] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download .html
              </button>
            </div>
          </div>

          {activeTab === "html" ? (
            <textarea
              readOnly
              value={html}
              placeholder="Generated HTML code will appear here..."
              rows={18}
              className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-y"
              spellCheck={false}
            />
          ) : (
            <div className="h-[430px] overflow-auto border-2 border-black bg-white p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] prose prose-sm max-w-none">
              {safePreview ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: safePreview,
                  }}
                  className="space-y-3 font-sans text-gray-800 [&_h1]:text-2xl [&_h1]:font-black [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:border [&_pre]:border-black [&_pre]:font-mono [&_code]:bg-gray-100 [&_code]:px-1 [&_blockquote]:border-l-4 [&_blockquote]:border-black [&_blockquote]:pl-3 [&_blockquote]:italic [&_table]:border-collapse [&_table]:w-full [&_th]:border [&_th]:border-black [&_th]:p-1.5 [&_th]:bg-gray-100 [&_td]:border [&_td]:border-black [&_td]:p-1.5 [&_a]:text-[#0284C7] [&_a]:underline"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-400 font-bold text-xs">
                  No preview available. Enter markdown to see live preview.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
