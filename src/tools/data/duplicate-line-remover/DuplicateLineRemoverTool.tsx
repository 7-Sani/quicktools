"use client";

import React, { useState, useMemo } from "react";
import {
  ListFilter,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  Trash2,
  Settings2,
  BarChart2,
} from "lucide-react";

const SAMPLE_LIST = `apple
orange
banana
Apple
apple
grape
banana
orange
watermelon
pineapple
apple
banana
mango`;

export default function DuplicateLineRemoverTool() {
  const [inputText, setInputText] = useState(SAMPLE_LIST);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);
  const [sortOrder, setSortOrder] = useState<"original" | "asc" | "desc" | "frequency">("original");
  const [filterMode, setFilterMode] = useState<"dedupe" | "duplicatesOnly" | "uniqueOnly">("dedupe");
  const [copied, setCopied] = useState(false);

  // Deduplication & analysis
  const analysis = useMemo(() => {
    if (!inputText) {
      return {
        output: "",
        originalCount: 0,
        outputCount: 0,
        duplicatesRemoved: 0,
        freqMap: [] as { line: string; count: number }[],
      };
    }

    let rawLines = inputText.split(/\r?\n/);
    const originalCount = rawLines.length;

    // Normalize lines
    let processedLines = rawLines.map((line) => (trimWhitespace ? line.trim() : line));

    if (removeEmptyLines) {
      processedLines = processedLines.filter((l) => l.length > 0);
    }

    // Build frequency count using normalized comparison key
    const freq = new Map<string, { originalLine: string; count: number; firstIndex: number }>();

    processedLines.forEach((line, index) => {
      const key = caseSensitive ? line : line.toLowerCase();
      if (freq.has(key)) {
        const item = freq.get(key)!;
        item.count++;
      } else {
        freq.set(key, { originalLine: line, count: 1, firstIndex: index });
      }
    });

    let resultItems = Array.from(freq.values());

    // Apply Filter Mode
    if (filterMode === "duplicatesOnly") {
      resultItems = resultItems.filter((i) => i.count > 1);
    } else if (filterMode === "uniqueOnly") {
      resultItems = resultItems.filter((i) => i.count === 1);
    }

    // Apply Sorting
    if (sortOrder === "original") {
      resultItems.sort((a, b) => a.firstIndex - b.firstIndex);
    } else if (sortOrder === "asc") {
      resultItems.sort((a, b) => a.originalLine.localeCompare(b.originalLine));
    } else if (sortOrder === "desc") {
      resultItems.sort((a, b) => b.originalLine.localeCompare(a.originalLine));
    } else if (sortOrder === "frequency") {
      resultItems.sort((a, b) => b.count - a.count);
    }

    const outputLines = resultItems.map((i) => i.originalLine);
    const outputString = outputLines.join("\n");
    const outputCount = outputLines.length;
    const duplicatesRemoved = Math.max(0, originalCount - outputCount);

    const freqList = Array.from(freq.values())
      .filter((i) => i.count > 1)
      .sort((a, b) => b.count - a.count)
      .map((i) => ({ line: i.originalLine, count: i.count }))
      .slice(0, 5);

    return {
      output: outputString,
      originalCount,
      outputCount,
      duplicatesRemoved,
      freqMap: freqList,
    };
  }, [inputText, caseSensitive, trimWhitespace, removeEmptyLines, sortOrder, filterMode]);

  const handleCopy = () => {
    if (!analysis.output) return;
    navigator.clipboard.writeText(analysis.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!analysis.output) return;
    const blob = new Blob([analysis.output], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deduplicated.txt";
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
        setInputText(text);
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
            <ListFilter className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Duplicate Line Remover
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Clean and deduplicate lists, datasets, logs, and email lists with case and sort control
            </p>
          </div>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setInputText(SAMPLE_LIST)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sample List
          </button>
          <button
            onClick={() => setInputText("")}
            className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            Clear
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center gap-6 text-sm font-black">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-black" />
          <span className="uppercase text-xs tracking-wider">Mode:</span>
          <select
            value={filterMode}
            onChange={(e: any) => setFilterMode(e.target.value)}
            className="px-2.5 py-1 text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <option value="dedupe">Deduplicate (Keep unique + 1st duplicate)</option>
            <option value="duplicatesOnly">Duplicates Only (Lines with &gt; 1 copy)</option>
            <option value="uniqueOnly">Unique Only (Lines with exactly 1 copy)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="uppercase text-xs tracking-wider">Sort:</span>
          <select
            value={sortOrder}
            onChange={(e: any) => setSortOrder(e.target.value)}
            className="px-2.5 py-1 text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <option value="original">Original Order</option>
            <option value="asc">Alphabetical (A &rarr; Z)</option>
            <option value="desc">Alphabetical (Z &rarr; A)</option>
            <option value="frequency">Most Frequent First</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
          />
          <span className="text-xs uppercase">Case-Sensitive</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={trimWhitespace}
            onChange={(e) => setTrimWhitespace(e.target.checked)}
            className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
          />
          <span className="text-xs uppercase">Trim Whitespace</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={removeEmptyLines}
            onChange={(e) => setRemoveEmptyLines(e.target.checked)}
            className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
          />
          <span className="text-xs uppercase">Strip Empty Lines</span>
        </label>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[11px] font-black uppercase text-gray-600">Original Lines</div>
          <div className="text-xl font-black text-black">{analysis.originalCount}</div>
        </div>
        <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[11px] font-black uppercase text-gray-600">Remaining Lines</div>
          <div className="text-xl font-black text-[#0284C7]">{analysis.outputCount}</div>
        </div>
        <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[11px] font-black uppercase text-gray-600">Duplicates Removed</div>
          <div className="text-xl font-black text-red-600">{analysis.duplicatesRemoved}</div>
        </div>
        <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[11px] font-black uppercase text-gray-600">Reduction</div>
          <div className="text-xl font-black text-green-700">
            {analysis.originalCount > 0
              ? `${Math.round((analysis.duplicatesRemoved / analysis.originalCount) * 100)}%`
              : "0%"}
          </div>
        </div>
      </div>

      {/* Top Duplicates Quick View */}
      {analysis.freqMap.length > 0 && (
        <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 flex-wrap text-xs font-black">
          <span className="uppercase text-gray-700 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-[#0284C7]" /> Top Duplicates:
          </span>
          {analysis.freqMap.map((f, i) => (
            <span
              key={i}
              className="bg-white px-2 py-1 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5"
            >
              <code className="text-black font-mono">{f.line}</code>
              <span className="bg-[#FEF08A] px-1 rounded text-[10px] font-black">
                {f.count}x
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Dual Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Original Text List
            </label>
            <label className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload .txt
              <input
                type="file"
                accept=".txt,.csv,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your lines of text here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black resize-y"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Cleaned Output
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!analysis.output}
                className="px-3 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Output"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!analysis.output}
                className="px-3 py-1 text-xs font-black uppercase bg-[#A7F3D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#86EFAC] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download .txt
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={analysis.output}
            placeholder="Deduplicated text will appear here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-y"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
