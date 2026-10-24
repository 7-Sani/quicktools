"use client";

import React, { useState, useMemo } from "react";
import {
  Braces,
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  FileCode,
  Minimize2,
} from "lucide-react";

const SAMPLE_VALID = `{
  "projectName": "QuickTools",
  "version": "1.0.0",
  "active": true,
  "stats": {
    "totalTools": 120,
    "rating": 4.9,
    "tags": ["web", "seo", "design", "data"]
  },
  "contributors": [
    { "id": 1, "name": "Biplab Sarkar", "role": "Maintainer" },
    { "id": 2, "name": "Alex Dev", "role": "Contributor" }
  ]
}`;

const SAMPLE_INVALID = `{
  "projectName": "Broken Example",
  "missingComma": true
  "syntaxError": "no comma on previous line"
  "unclosedBrace": {
}`;

export default function JsonFormatterAndValidatorTool() {
  const [inputJson, setInputJson] = useState(SAMPLE_VALID);
  const [indentOption, setIndentOption] = useState<"2" | "4" | "tab" | "min">("2");
  const [copied, setCopied] = useState(false);

  // Parse and validate
  const validation = useMemo(() => {
    if (!inputJson.trim()) {
      return { isValid: false, error: null, formatted: "", stats: null };
    }

    try {
      const parsed = JSON.parse(inputJson);

      let formatted = "";
      if (indentOption === "min") {
        formatted = JSON.stringify(parsed);
      } else if (indentOption === "tab") {
        formatted = JSON.stringify(parsed, null, "\t");
      } else {
        formatted = JSON.stringify(parsed, null, parseInt(indentOption));
      }

      // Calculate depth and key count
      let totalKeys = 0;
      let maxDepth = 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inspect = (obj: any, depth = 1) => {
        if (depth > maxDepth) maxDepth = depth;
        if (typeof obj === "object" && obj !== null) {
          if (Array.isArray(obj)) {
            obj.forEach((item) => inspect(item, depth + 1));
          } else {
            const keys = Object.keys(obj);
            totalKeys += keys.length;
            keys.forEach((k) => inspect(obj[k], depth + 1));
          }
        }
      };
      inspect(parsed);

      return {
        isValid: true,
        error: null,
        formatted,
        stats: {
          sizeBytes: new Blob([formatted]).size,
          keys: totalKeys,
          depth: maxDepth,
          isArray: Array.isArray(parsed),
        },
      };
    } catch (err: unknown) {
      let errorMsg = "Invalid JSON syntax.";
      let line: number | null = null;
      let column: number | null = null;

      if (err instanceof Error) {
        errorMsg = err.message;
        // Extract line and column from Chrome/V8 error message (e.g., "at position 45" or "line 4 column 3")
        const lineMatch = errorMsg.match(/line (\d+) column (\d+)/i);
        if (lineMatch) {
          line = parseInt(lineMatch[1]);
          column = parseInt(lineMatch[2]);
        } else {
          const posMatch = errorMsg.match(/position (\d+)/i);
          if (posMatch) {
            const pos = parseInt(posMatch[1]);
            const upToError = inputJson.slice(0, pos);
            const lines = upToError.split("\n");
            line = lines.length;
            column = lines[lines.length - 1].length + 1;
          }
        }
      }

      return {
        isValid: false,
        error: { message: errorMsg, line, column },
        formatted: inputJson,
        stats: null,
      };
    }
  }, [inputJson, indentOption]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) setInputJson(text);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(validation.formatted || inputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([validation.formatted || inputJson], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = indentOption === "min" ? "data.min.json" : "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Braces size={14} /> JSON Formatter &amp; Validator
          </span>
          <span className="text-xs text-text-secondary">
            100% Client-Side Syntax Validation &amp; Beautifier
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInputJson(SAMPLE_VALID)}
            className="text-xs px-2.5 py-1.5 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Sample Valid
          </button>
          <button
            onClick={() => setInputJson(SAMPLE_INVALID)}
            className="text-xs px-2.5 py-1.5 neo-border rounded bg-surface hover:bg-red-500/10 text-red-600 font-medium"
          >
            Sample Invalid
          </button>
          <button
            onClick={() => setInputJson("")}
            disabled={!inputJson}
            className="text-xs px-2.5 py-1.5 neo-border rounded bg-surface hover:bg-red-500/10 text-red-600 font-medium flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Indentation & Actions Toolbar */}
      <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold uppercase text-xs text-text-secondary">
            Indentation:
          </span>
          {(
            [
              { id: "2", label: "2 Spaces" },
              { id: "4", label: "4 Spaces" },
              { id: "tab", label: "Tabs" },
              { id: "min", label: "Minified (Compact)" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setIndentOption(opt.id)}
              className={`px-2.5 py-1 text-xs neo-border rounded font-semibold transition-colors ${
                indentOption === opt.id ? "bg-accent text-white" : "bg-surface hover:bg-accent/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold cursor-pointer flex items-center gap-1.5">
            <Upload size={13} className="text-accent" />
            <span>Upload .json</span>
            <input
              type="file"
              accept=".json,application/json,text/plain"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleCopy}
            disabled={!inputJson.trim()}
            className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!validation.isValid}
            className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
          >
            <Download size={12} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Validation Status Banner */}
      {validation.isValid ? (
        <div className="p-3 neo-border rounded-lg bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Valid JSON Structure</span>
          </div>
          {validation.stats && (
            <div className="font-mono text-[11px] opacity-80 flex items-center gap-3">
              <span>Keys: {validation.stats.keys}</span>
              <span>Depth: {validation.stats.depth}</span>
              <span>Size: {(validation.stats.sizeBytes / 1024).toFixed(2)} KB</span>
            </div>
          )}
        </div>
      ) : validation.error ? (
        <div className="p-3.5 neo-border rounded-lg bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-300 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-bold font-heading uppercase text-sm">
            <AlertTriangle size={16} className="text-red-600 shrink-0" />
            <span>Syntax Error Detected</span>
          </div>
          <p className="font-mono text-xs">{validation.error.message}</p>
          {validation.error.line && (
            <p className="font-bold text-accent">
              Problem located near Line {validation.error.line}, Column {validation.error.column}
            </p>
          )}
        </div>
      ) : null}

      {/* Editor Columns: Raw Input on Left, Formatted Output on Right */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="neo-card p-4 space-y-2">
          <div className="flex items-center justify-between border-b-2 border-border pb-2">
            <span className="font-heading font-bold uppercase text-xs text-text-secondary">
              Input JSON
            </span>
            <span className="font-mono text-[11px] text-text-secondary">
              {inputJson.length} characters
            </span>
          </div>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            rows={15}
            placeholder="Paste your JSON here to format and validate..."
            className="w-full neo-input p-3 font-mono text-xs leading-relaxed resize-y"
          />
        </div>

        {/* Output */}
        <div className="neo-card p-4 space-y-2">
          <div className="flex items-center justify-between border-b-2 border-border pb-2">
            <span className="font-heading font-bold uppercase text-xs text-text-secondary">
              Formatted &amp; Cleaned Output
            </span>
            {validation.isValid && (
              <span className="text-[11px] font-semibold text-emerald-600">
                Ready to Use
              </span>
            )}
          </div>
          <textarea
            readOnly
            value={validation.isValid ? validation.formatted : ""}
            rows={15}
            placeholder={validation.isValid ? "" : "Formatted output will appear here once JSON syntax is valid."}
            className="w-full neo-input p-3 font-mono text-xs leading-relaxed resize-y bg-surface/50 text-text"
          />
        </div>
      </div>
    </div>
  );
}
