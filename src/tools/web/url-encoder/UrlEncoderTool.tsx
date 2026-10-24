"use client";

import React, { useState } from "react";
import {
  Link2,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Download,
  Info,
  Sparkles,
} from "lucide-react";

export default function UrlEncoderTool() {
  const [input, setInput] = useState("");
  const [encodeMode, setEncodeMode] = useState<"component" | "uri" | "strict">("component");
  const [spaceAsPlus, setSpaceAsPlus] = useState(false);
  const [lineByLine, setLineByLine] = useState(false);
  const [copied, setCopied] = useState(false);

  const encodeText = (text: string): string => {
    if (!text) return "";

    const doEncode = (str: string) => {
      let encoded = "";
      if (encodeMode === "component") {
        encoded = encodeURIComponent(str);
      } else if (encodeMode === "uri") {
        encoded = encodeURI(str);
      } else {
        // Strict RFC 3986 (encodes !, ', (, ), * as well)
        encoded = encodeURIComponent(str).replace(
          /[!'()*]/g,
          (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
        );
      }

      if (spaceAsPlus) {
        encoded = encoded.replace(/%20/g, "+");
      }
      return encoded;
    };

    if (lineByLine) {
      return text
        .split("\n")
        .map((line) => doEncode(line))
        .join("\n");
    }

    return doEncode(text);
  };

  const output = encodeText(input);

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "encoded-url.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = (type: "full" | "query" | "json") => {
    if (type === "full") {
      setInput("https://example.com/search?q=running shoes&sort=price asc&filter=brand:nike&tags=sale#top");
      setEncodeMode("uri");
      setSpaceAsPlus(false);
    } else if (type === "query") {
      setInput("John Doe & Partners (CEO) / 100% Guaranteed!");
      setEncodeMode("component");
      setSpaceAsPlus(true);
    } else {
      setInput('{"user":"Biplab","role":"admin","path":"/dashboard/analytics?view=live"}');
      setEncodeMode("strict");
      setSpaceAsPlus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls */}
      <div className="neo-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-3">
          <span className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
            <Link2 size={16} className="text-accent" />
            Encoding Standard
          </span>

          {/* Quick Examples */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-heading uppercase font-semibold">Examples:</span>
            <button
              onClick={() => loadExample("full")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              Full URL
            </button>
            <button
              onClick={() => loadExample("query")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              Query Param
            </button>
            <button
              onClick={() => loadExample("json")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              Strict RFC 3986
            </button>
          </div>
        </div>

        {/* Radio options for encoding type */}
        <div className="grid sm:grid-cols-3 gap-3">
          <label
            onClick={() => setEncodeMode("component")}
            className={`cursor-pointer p-3.5 neo-border rounded-lg text-left transition-all ${
              encodeMode === "component"
                ? "bg-accent/10 border-accent font-semibold text-text"
                : "bg-surface hover:bg-bg text-text-secondary"
            }`}
          >
            <div className="text-sm font-heading uppercase font-bold text-text mb-1">
              Component (Recommended)
            </div>
            <div className="text-xs text-text-secondary">
              Encodes all query & path delimiters (?, &, =, /, #) via <code className="text-xs font-mono">encodeURIComponent</code>.
            </div>
          </label>

          <label
            onClick={() => setEncodeMode("uri")}
            className={`cursor-pointer p-3.5 neo-border rounded-lg text-left transition-all ${
              encodeMode === "uri"
                ? "bg-accent/10 border-accent font-semibold text-text"
                : "bg-surface hover:bg-bg text-text-secondary"
            }`}
          >
            <div className="text-sm font-heading uppercase font-bold text-text mb-1">
              Full URL (encodeURI)
            </div>
            <div className="text-xs text-text-secondary">
              Preserves protocol, hostname, and structural slashes while escaping spaces and unicode characters.
            </div>
          </label>

          <label
            onClick={() => setEncodeMode("strict")}
            className={`cursor-pointer p-3.5 neo-border rounded-lg text-left transition-all ${
              encodeMode === "strict"
                ? "bg-accent/10 border-accent font-semibold text-text"
                : "bg-surface hover:bg-bg text-text-secondary"
            }`}
          >
            <div className="text-sm font-heading uppercase font-bold text-text mb-1">
              Strict RFC 3986
            </div>
            <div className="text-xs text-text-secondary">
              Additionally percent-encodes exclamation marks, apostrophes, parentheses, and asterisks.
            </div>
          </label>
        </div>

        {/* Checkbox Toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wide">
            <input
              type="checkbox"
              checked={spaceAsPlus}
              onChange={(e) => setSpaceAsPlus(e.target.checked)}
              className="w-4 h-4 rounded neo-border accent-accent cursor-pointer"
            />
            Encode spaces as &apos;+&apos; (form URL-encoded)
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wide">
            <input
              type="checkbox"
              checked={lineByLine}
              onChange={(e) => setLineByLine(e.target.checked)}
              className="w-4 h-4 rounded neo-border accent-accent cursor-pointer"
            />
            Batch: Process each line independently
          </label>
        </div>
      </div>

      {/* Input / Output Panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="neo-card p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="font-heading font-bold uppercase text-sm tracking-wide">
              Original Text or URL
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary font-mono">
                {input.length} chars
              </span>
              <button
                onClick={() => setInput("")}
                disabled={!input}
                className="text-xs neo-btn neo-btn-secondary px-2 py-1 text-red-600 disabled:opacity-40"
                title="Clear input"
              >
                <Trash2 size={13} />
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text or URL to percent-encode..."
            rows={8}
            className="w-full neo-input p-3 font-mono text-sm resize-y flex-1"
          />

          <div className="text-xs text-text-secondary flex items-center justify-between pt-1">
            <span>Special chars will be converted to %HEX sequences.</span>
          </div>
        </div>

        {/* Output Card */}
        <div className="neo-card p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="font-heading font-bold uppercase text-sm tracking-wide">
              Encoded Result
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary font-mono">
                {output.length} chars
              </span>
              <button
                onClick={copyToClipboard}
                disabled={!output}
                className="text-xs neo-btn neo-btn-primary px-2.5 py-1 disabled:opacity-40"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={downloadOutput}
                disabled={!output}
                className="text-xs neo-btn neo-btn-secondary px-2 py-1 disabled:opacity-40"
                title="Download encoded result"
              >
                <Download size={13} />
              </button>
            </div>
          </div>

          <textarea
            value={output}
            readOnly
            placeholder="Encoded output will appear here automatically..."
            rows={8}
            className="w-full neo-input p-3 font-mono text-sm bg-surface/50 resize-y flex-1"
          />

          <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
            <span>
              {input.length > 0 && output.length > 0
                ? `Expansion: +${Math.max(0, output.length - input.length)} bytes (${(
                    (output.length / (input.length || 1)) *
                    100
                  ).toFixed(0)}%)`
                : "Live encoding active"}
            </span>
            <button
              onClick={() => {
                setInput("");
                setSpaceAsPlus(false);
                setEncodeMode("component");
                setLineByLine(false);
              }}
              className="hover:underline flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Reset All
            </button>
          </div>
        </div>
      </div>

      {/* Educational Note */}
      <div className="neo-card p-4 bg-surface text-xs text-text-secondary flex items-start gap-3">
        <Info size={16} className="text-accent shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-text">
            RFC 3986 Uniform Resource Identifier (URI) Percent-Encoding:
          </p>
          <p>
            Percent-encoding represents arbitrary byte sequences in standard US-ASCII using a &apos;%&apos; followed by two hexadecimal digits. When passing data as a query parameter value, always use <strong>Component</strong> mode to avoid having characters like &apos;&amp;&apos; or &apos;=&apos; inadvertently misinterpreted as parameter separators.
          </p>
        </div>
      </div>
    </div>
  );
}
