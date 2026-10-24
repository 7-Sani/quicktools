"use client";

import React, { useState, useMemo } from "react";
import {
  GitCompare,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  Trash2,
  Columns,
  List,
  Settings2,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";

const SAMPLE_ORIGINAL = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}

// Deprecated logger
console.log("Calculation initialized");`;

const SAMPLE_MODIFIED = `function calculateTotal(items) {
  // Use modern Array.reduce with default fallback
  return items.reduce((sum, item) => sum + (item.price || 0), 0);
}

export default calculateTotal;`;

interface DiffLine {
  type: "added" | "deleted" | "unchanged";
  text: string;
  leftLineNumber?: number;
  rightLineNumber?: number;
}

// Compute line diff via Longest Common Subsequence (LCS)
function computeLcsDiff(
  oldLines: string[],
  newLines: string[],
  ignoreWhitespace: boolean,
  ignoreCase: boolean
): DiffLine[] {
  const norm = (s: string) => {
    let res = s;
    if (ignoreWhitespace) res = res.trim();
    if (ignoreCase) res = res.toLowerCase();
    return res;
  };

  const m = oldLines.length;
  const n = newLines.length;

  // DP table for LCS length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (norm(oldLines[i]) === norm(newLines[j])) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to build diff
  const diff: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && norm(oldLines[i - 1]) === norm(newLines[j - 1])) {
      diff.unshift({
        type: "unchanged",
        text: newLines[j - 1], // prefer new text formatting
        leftLineNumber: i,
        rightLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        type: "added",
        text: newLines[j - 1],
        rightLineNumber: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({
        type: "deleted",
        text: oldLines[i - 1],
        leftLineNumber: i,
      });
      i--;
    }
  }

  return diff;
}

export default function TextDiffCheckerTool() {
  const [originalText, setOriginalText] = useState(SAMPLE_ORIGINAL);
  const [modifiedText, setModifiedText] = useState(SAMPLE_MODIFIED);
  const [viewMode, setViewMode] = useState<"sideBySide" | "unified">("sideBySide");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [copied, setCopied] = useState(false);

  // Compute Diff
  const diffResult = useMemo(() => {
    const oldLines = originalText ? originalText.split(/\r?\n/) : [];
    const newLines = modifiedText ? modifiedText.split(/\r?\n/) : [];

    const lines = computeLcsDiff(oldLines, newLines, ignoreWhitespace, ignoreCase);

    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    lines.forEach((l) => {
      if (l.type === "added") additions++;
      else if (l.type === "deleted") deletions++;
      else unchanged++;
    });

    const totalChanges = additions + deletions;
    const similarity =
      unchanged + totalChanges > 0
        ? Math.round((unchanged / (unchanged + totalChanges)) * 100)
        : 100;

    // Generate Standard Unified Patch format for copy/download
    const patchHeader = `--- Original\n+++ Modified\n@@ -1,${oldLines.length} +1,${newLines.length} @@\n`;
    const patchBody = lines
      .map((l) => {
        if (l.type === "added") return `+ ${l.text}`;
        if (l.type === "deleted") return `- ${l.text}`;
        return `  ${l.text}`;
      })
      .join("\n");
    const patch = patchHeader + patchBody;

    return {
      lines,
      additions,
      deletions,
      unchanged,
      similarity,
      patch,
    };
  }, [originalText, modifiedText, ignoreWhitespace, ignoreCase]);

  const handleCopyPatch = () => {
    if (!diffResult.patch) return;
    navigator.clipboard.writeText(diffResult.patch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPatch = () => {
    if (!diffResult.patch) return;
    const blob = new Blob([diffResult.patch], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "changes.patch";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setter(text);
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
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Text Diff Checker
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Compare differences between texts, code snippets, or configuration files side-by-side
            </p>
          </div>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setOriginalText(SAMPLE_ORIGINAL);
              setModifiedText(SAMPLE_MODIFIED);
            }}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Code Refactor Sample
          </button>
          <button
            onClick={() => {
              setOriginalText("");
              setModifiedText("");
            }}
            className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            Clear
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("sideBySide")}
              className={`px-3 py-1 text-xs font-black uppercase border-2 border-black transition-all flex items-center gap-1.5 ${
                viewMode === "sideBySide"
                  ? "bg-[#0284C7] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Side by Side
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={`px-3 py-1 text-xs font-black uppercase border-2 border-black transition-all flex items-center gap-1.5 ${
                viewMode === "unified"
                  ? "bg-[#0284C7] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Unified Patch
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-black uppercase">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
            />
            <span>Ignore Whitespace</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-black uppercase">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
            />
            <span>Ignore Case</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPatch}
            className="px-3 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Patch"}
          </button>
          <button
            onClick={handleDownloadPatch}
            className="px-3 py-1 text-xs font-black uppercase bg-[#A7F3D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#86EFAC] transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download .patch
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[11px] font-black uppercase text-gray-600 flex items-center gap-1">
            <Plus className="w-3 h-3 text-green-600" /> Additions
          </div>
          <div className="text-xl font-black text-green-700">+{diffResult.additions}</div>
        </div>
        <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[11px] font-black uppercase text-gray-600 flex items-center gap-1">
            <Minus className="w-3 h-3 text-red-600" /> Deletions
          </div>
          <div className="text-xl font-black text-red-600">-{diffResult.deletions}</div>
        </div>
        <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[11px] font-black uppercase text-gray-600">Unchanged Lines</div>
          <div className="text-xl font-black text-black">{diffResult.unchanged}</div>
        </div>
        <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[11px] font-black uppercase text-gray-600">Similarity</div>
          <div className="text-xl font-black text-[#0284C7]">{diffResult.similarity}%</div>
        </div>
      </div>

      {/* Input Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Original Text (Left / Old)
            </label>
            <label className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload Old
              <input
                type="file"
                onChange={(e) => handleFileUpload(e, setOriginalText)}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste original text here..."
            rows={10}
            className="w-full font-mono text-xs p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-y"
            spellCheck={false}
          />
        </div>

        {/* Modified */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Modified Text (Right / New)
            </label>
            <label className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload New
              <input
                type="file"
                onChange={(e) => handleFileUpload(e, setModifiedText)}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste modified text here..."
            rows={10}
            className="w-full font-mono text-xs p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-y"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Diff Visualizer Panel */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#0284C7]" />
            Diff Comparison View ({viewMode === "sideBySide" ? "Side by Side" : "Unified"})
          </h3>
        </div>

        <div className="border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-auto max-h-[500px] font-mono text-xs">
          {viewMode === "sideBySide" ? (
            <div className="grid grid-cols-2 divide-x-2 divide-black">
              {/* Left Column (Original/Old) */}
              <div>
                <div className="bg-gray-100 p-2 font-black border-b-2 border-black text-gray-700">
                  Original
                </div>
                {diffResult.lines.map((line, idx) => {
                  if (line.type === "added") {
                    // Blank placeholder on left when line added on right
                    return (
                      <div key={idx} className="bg-gray-50 text-transparent select-none px-3 py-0.5">
                        &nbsp;
                      </div>
                    );
                  }
                  return (
                    <div
                      key={idx}
                      className={`flex px-2 py-0.5 ${
                        line.type === "deleted"
                          ? "bg-red-100 text-red-900 border-l-4 border-red-500 font-bold"
                          : "text-gray-800"
                      }`}
                    >
                      <span className="w-8 text-gray-400 select-none text-right pr-2">
                        {line.leftLineNumber || ""}
                      </span>
                      <span className="w-4 select-none font-bold">
                        {line.type === "deleted" ? "-" : " "}
                      </span>
                      <span className="whitespace-pre flex-1">{line.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Right Column (Modified/New) */}
              <div>
                <div className="bg-gray-100 p-2 font-black border-b-2 border-black text-gray-700">
                  Modified
                </div>
                {diffResult.lines.map((line, idx) => {
                  if (line.type === "deleted") {
                    // Blank placeholder on right when line deleted on left
                    return (
                      <div key={idx} className="bg-gray-50 text-transparent select-none px-3 py-0.5">
                        &nbsp;
                      </div>
                    );
                  }
                  return (
                    <div
                      key={idx}
                      className={`flex px-2 py-0.5 ${
                        line.type === "added"
                          ? "bg-green-100 text-green-900 border-l-4 border-green-600 font-bold"
                          : "text-gray-800"
                      }`}
                    >
                      <span className="w-8 text-gray-400 select-none text-right pr-2">
                        {line.rightLineNumber || ""}
                      </span>
                      <span className="w-4 select-none font-bold">
                        {line.type === "added" ? "+" : " "}
                      </span>
                      <span className="whitespace-pre flex-1">{line.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Unified View */
            <div>
              <div className="bg-gray-100 p-2 font-black border-b-2 border-black text-gray-700">
                Unified Patch Format
              </div>
              {diffResult.lines.map((line, idx) => {
                let rowBg = "text-gray-800";
                let prefix = " ";
                if (line.type === "added") {
                  rowBg = "bg-green-100 text-green-900 border-l-4 border-green-600 font-bold";
                  prefix = "+";
                } else if (line.type === "deleted") {
                  rowBg = "bg-red-100 text-red-900 border-l-4 border-red-500 font-bold";
                  prefix = "-";
                }

                return (
                  <div key={idx} className={`flex px-2 py-0.5 ${rowBg}`}>
                    <span className="w-8 text-gray-400 select-none text-right pr-1">
                      {line.leftLineNumber || ""}
                    </span>
                    <span className="w-8 text-gray-400 select-none text-right pr-2">
                      {line.rightLineNumber || ""}
                    </span>
                    <span className="w-4 select-none font-black">{prefix}</span>
                    <span className="whitespace-pre flex-1">{line.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
