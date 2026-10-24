"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  Download,
  Binary,
  ShieldCheck,
} from "lucide-react";

export default function SecureUuidGeneratorTool() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState<number>(5);
  const [isUppercase, setIsUppercase] = useState(false);
  const [includeHyphens, setIncludeHyphens] = useState(true);
  const [includeBraces, setIncludeBraces] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = window.crypto.randomUUID ? window.crypto.randomUUID() : "";
      if (!id) {
        // Fallback RFC 4122 v4
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      }

      if (!includeHyphens) {
        id = id.replace(/-/g, "");
      }
      if (isUppercase) {
        id = id.toUpperCase();
      }
      if (includeBraces) {
        id = `{${id}}`;
      }
      list.push(id);
    }
    setUuids(list);
  };

  useEffect(() => {
    generateUuids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, isUppercase, includeHyphens, includeBraces]);

  const copyOne = (id: string, idx: number) => {
    navigator.clipboard.writeText(id);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uuids_${count}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <div className="neo-card p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-bold text-base uppercase flex items-center gap-2">
              <Binary size={18} className="text-accent" /> RFC 4122 v4 UUID Generator
            </h3>
            <p className="text-xs text-text-secondary">
              Generated using cryptographically secure hardware entropy via Web Crypto API.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyAll}
              disabled={uuids.length === 0}
              className="neo-btn neo-btn-primary text-xs"
            >
              {copiedAll ? <Check size={14} /> : <Copy size={14} />}
              {copiedAll ? "Copied All" : "Copy All"}
            </button>
            <button
              onClick={generateUuids}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-border">
          <div>
            <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
              Quantity to Generate
            </label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="neo-input text-xs font-semibold py-2"
            >
              <option value={1}>1 UUID</option>
              <option value={5}>5 UUIDs</option>
              <option value={10}>10 UUIDs</option>
              <option value={25}>25 UUIDs</option>
              <option value={50}>50 UUIDs</option>
              <option value={100}>100 UUIDs</option>
            </select>
          </div>

          <div className="flex items-center pt-5 sm:pt-6">
            <label className="flex items-center gap-2 text-xs font-heading font-semibold uppercase cursor-pointer">
              <input
                type="checkbox"
                checked={includeHyphens}
                onChange={(e) => setIncludeHyphens(e.target.checked)}
                className="accent-accent w-4 h-4"
              />
              Hyphenated
            </label>
          </div>

          <div className="flex items-center pt-5 sm:pt-6">
            <label className="flex items-center gap-2 text-xs font-heading font-semibold uppercase cursor-pointer">
              <input
                type="checkbox"
                checked={isUppercase}
                onChange={(e) => setIsUppercase(e.target.checked)}
                className="accent-accent w-4 h-4"
              />
              Uppercase (A-F)
            </label>
          </div>

          <div className="flex items-center pt-5 sm:pt-6">
            <label className="flex items-center gap-2 text-xs font-heading font-semibold uppercase cursor-pointer">
              <input
                type="checkbox"
                checked={includeBraces}
                onChange={(e) => setIncludeBraces(e.target.checked)}
                className="accent-accent w-4 h-4"
              />
              Wrap with Braces
            </label>
          </div>
        </div>
      </div>

      {/* UUIDs Display List */}
      <div className="neo-card p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-accent/5">
          <span className="font-heading font-bold text-xs uppercase">
            Generated UUIDs ({uuids.length})
          </span>
          <button
            onClick={downloadTxt}
            className="neo-btn neo-btn-secondary text-[11px] py-1 px-3"
          >
            <Download size={12} />
            Download .TXT
          </button>
        </div>

        <ul className="divide-y divide-border max-h-[460px] overflow-y-auto">
          {uuids.map((id, idx) => (
            <li
              key={idx}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-accent/5 transition-colors font-mono text-xs sm:text-sm select-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] text-text-secondary font-mono w-5">
                  {idx + 1}.
                </span>
                <span className="truncate">{id}</span>
              </div>
              <button
                onClick={() => copyOne(id, idx)}
                className="neo-btn neo-btn-secondary text-[11px] py-1 px-2.5 shrink-0"
              >
                {copiedIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                {copiedIdx === idx ? "Copied" : "Copy"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Privacy Guarantee */}
      <div className="neo-card p-4 bg-accent-light flex items-start gap-3">
        <ShieldCheck size={20} className="text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-text font-heading uppercase tracking-wide">
            Cryptographically Random UUIDs:
          </strong>{" "}
          Generated via <code>crypto.randomUUID()</code>. The probability of generating two duplicate UUIDs v4 is mathematically infinitesimal (1 in 5.3 x 10³⁶).
        </p>
      </div>
    </div>
  );
}
