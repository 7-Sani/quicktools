"use client";

import React, { useState, useMemo } from "react";
import {
  FileCode,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  Trash2,
  FileText,
  RotateCcw,
} from "lucide-react";

const SAMPLE_HTML = `<article>
  <h1>QuickTools Developer Platform</h1>
  <p>QuickTools is a high-speed, local-first utility website designed for engineers and designers.</p>

  <h2>Key Benefits</h2>
  <ul>
    <li><strong>Client-Side Only:</strong> No remote server tracking or data latency.</li>
    <li><em>Neo-Brutalist Design:</em> High contrast and legible UI.</li>
    <li>Reliable tools built with modern standards.</li>
  </ul>

  <blockquote>
    Building lightweight utilities gives developers instant leverage.
  </blockquote>

  <h3>Quick Code Sample</h3>
  <pre><code class="language-javascript">const double = (n) => n * 2;
console.log(double(21)); // 42</code></pre>

  <h3>Supported Formats</h3>
  <table>
    <thead>
      <tr>
        <th>Type</th>
        <th>Input</th>
        <th>Output</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data</td>
        <td>JSON</td>
        <td>CSV / YAML</td>
      </tr>
      <tr>
        <td>Markup</td>
        <td>HTML</td>
        <td>Markdown</td>
      </tr>
    </tbody>
  </table>

  <p>Learn more at <a href="https://quicktools.local">QuickTools Home</a>.</p>
</article>`;

// Recursive DOM to Markdown converter
function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue || "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  // Child content helper
  const innerMd = () => {
    let result = "";
    el.childNodes.forEach((child) => {
      result += nodeToMarkdown(child);
    });
    return result;
  };

  switch (tag) {
    case "h1":
      return `\n\n# ${innerMd().trim()}\n\n`;
    case "h2":
      return `\n\n## ${innerMd().trim()}\n\n`;
    case "h3":
      return `\n\n### ${innerMd().trim()}\n\n`;
    case "h4":
      return `\n\n#### ${innerMd().trim()}\n\n`;
    case "h5":
      return `\n\n##### ${innerMd().trim()}\n\n`;
    case "h6":
      return `\n\n###### ${innerMd().trim()}\n\n`;

    case "p":
      return `\n\n${innerMd().trim()}\n\n`;

    case "strong":
    case "b":
      return `**${innerMd()}**`;

    case "em":
    case "i":
      return `*${innerMd()}*`;

    case "del":
    case "s":
    case "strike":
      return `~~${innerMd()}~~`;

    case "code":
      // If parent is pre, handle in pre
      if (el.parentElement?.tagName.toLowerCase() === "pre") {
        return innerMd();
      }
      return `\`${innerMd()}\``;

    case "pre": {
      const codeElem = el.querySelector("code");
      const langClass = codeElem?.className?.match(/language-([a-zA-Z0-9_-]+)/);
      const lang = langClass ? langClass[1] : "";
      const text = (codeElem ? codeElem.textContent : el.textContent) || "";
      return `\n\n\`\`\`${lang}\n${text.trim()}\n\`\`\`\n\n`;
    }

    case "blockquote":
      return `\n\n> ${innerMd().trim().replace(/\n/g, "\n> ")}\n\n`;

    case "ul": {
      let listOut = "\n\n";
      Array.from(el.children).forEach((li) => {
        if (li.tagName.toLowerCase() === "li") {
          listOut += `- ${nodeToMarkdown(li).trim()}\n`;
        }
      });
      return `${listOut}\n`;
    }

    case "ol": {
      let listOut = "\n\n";
      let idx = 1;
      Array.from(el.children).forEach((li) => {
        if (li.tagName.toLowerCase() === "li") {
          listOut += `${idx}. ${nodeToMarkdown(li).trim()}\n`;
          idx++;
        }
      });
      return `${listOut}\n`;
    }

    case "li":
      return innerMd();

    case "a": {
      const href = el.getAttribute("href") || "#";
      const text = innerMd().trim() || href;
      return `[${text}](${href})`;
    }

    case "img": {
      const alt = el.getAttribute("alt") || "Image";
      const src = el.getAttribute("src") || "";
      return `![${alt}](${src})`;
    }

    case "hr":
      return "\n\n---\n\n";

    case "br":
      return "  \n";

    case "table": {
      const rows: string[][] = [];
      el.querySelectorAll("tr").forEach((tr) => {
        const rowCells: string[] = [];
        tr.querySelectorAll("th, td").forEach((cell) => {
          rowCells.push(cell.textContent?.trim().replace(/\|/g, "\\|") || "");
        });
        if (rowCells.length > 0) {
          rows.push(rowCells);
        }
      });

      if (rows.length === 0) return "";

      const colCount = Math.max(...rows.map((r) => r.length));
      // Pad short rows
      const normalizedRows = rows.map((r) => {
        const padded = [...r];
        while (padded.length < colCount) padded.push("");
        return padded;
      });

      let mdTable = "\n\n";
      // Header row
      mdTable += `| ${normalizedRows[0].join(" | ")} |\n`;
      mdTable += `| ${Array(colCount).fill("---").join(" | ")} |\n`;

      // Body rows
      for (let i = 1; i < normalizedRows.length; i++) {
        mdTable += `| ${normalizedRows[i].join(" | ")} |\n`;
      }
      return `${mdTable}\n`;
    }

    case "script":
    case "style":
      return "";

    default:
      return innerMd();
  }
}

function convertHtmlToMarkdown(htmlString: string): string {
  if (typeof window === "undefined") return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const md = nodeToMarkdown(doc.body);
  // Clean multiple sequential empty lines
  return md.replace(/\n{3,}/g, "\n\n").trim();
}

export default function HtmlToMarkdownConverterTool() {
  const [inputHtml, setInputHtml] = useState(SAMPLE_HTML);
  const [copied, setCopied] = useState(false);

  const markdownResult = useMemo(() => {
    if (!inputHtml.trim()) return "";
    return convertHtmlToMarkdown(inputHtml);
  }, [inputHtml]);

  const handleCopy = () => {
    if (!markdownResult) return;
    navigator.clipboard.writeText(markdownResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!markdownResult) return;
    const blob = new Blob([markdownResult], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
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
        setInputHtml(text);
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
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              HTML to Markdown Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Convert HTML fragments or web pages into clean, portable Markdown syntax
            </p>
          </div>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setInputHtml(SAMPLE_HTML)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Article HTML
          </button>
          <button
            onClick={() => setInputHtml("")}
            className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            Clear
          </button>
        </div>
      </div>

      {/* Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HTML Input */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              HTML Input Code
            </label>
            <label className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload .html
              <input
                type="file"
                accept=".html,.htm,text/html,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={inputHtml}
            onChange={(e) => setInputHtml(e.target.value)}
            placeholder="Paste your HTML markup here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black resize-y"
            spellCheck={false}
          />
        </div>

        {/* Markdown Output */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Markdown Output
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!markdownResult}
                className="px-3 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Markdown"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!markdownResult}
                className="px-3 py-1 text-xs font-black uppercase bg-[#A7F3D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#86EFAC] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download .md
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={markdownResult}
            placeholder="Converted markdown will display here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-y"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
