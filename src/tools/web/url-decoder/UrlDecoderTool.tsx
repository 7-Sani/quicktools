"use client";

import React, { useState } from "react";
import {
  Unlink,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Download,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function UrlDecoderTool() {
  const [input, setInput] = useState("");
  const [decodeMode, setDecodeMode] = useState<"component" | "uri">("component");
  const [plusAsSpace, setPlusAsSpace] = useState(true);
  const [lineByLine, setLineByLine] = useState(false);
  const [safeFallback, setSafeFallback] = useState(true);
  const [copied, setCopied] = useState(false);

  // Safe fallback decoder that decodes valid % sequences without throwing URIError on invalid ones
  const safeDecodeSegment = (str: string, mode: "component" | "uri", plus: boolean): string => {
    let working = str;
    if (plus) {
      working = working.replace(/\+/g, " ");
    }

    try {
      if (mode === "component") {
        return decodeURIComponent(working);
      } else {
        return decodeURI(working);
      }
    } catch {
      if (!safeFallback) {
        throw new Error("Malformed URI sequence found in input.");
      }

      // Fallback: replace valid percent-encoded bytes and leave malformed ones intact
      return working.replace(/(%[0-9A-Fa-f]{2})+/g, (match) => {
        try {
          return decodeURIComponent(match);
        } catch {
          return match;
        }
      });
    }
  };

  const { output, errorMsg } = React.useMemo(() => {
    if (!input) {
      return { output: "", errorMsg: null };
    }

    try {
      if (lineByLine) {
        const decoded = input
          .split("\n")
          .map((line) => safeDecodeSegment(line, decodeMode, plusAsSpace))
          .join("\n");
        return { output: decoded, errorMsg: null };
      }
      return { output: safeDecodeSegment(input, decodeMode, plusAsSpace), errorMsg: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Malformed URI sequence.";
      return { output: "", errorMsg: msg };
    }
  }, [input, decodeMode, plusAsSpace, lineByLine, safeFallback]);

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
    a.download = "decoded-url.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = (type: "search" | "unicode" | "oauth") => {
    if (type === "search") {
      setInput("https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Drunning%2Bshoes%26sort%3Dprice%2Basc%26filter%3Dbrand%3Anike%26tags%3Dsale%23top");
      setDecodeMode("component");
      setPlusAsSpace(true);
    } else if (type === "unicode") {
      setInput("Caf%C3%A9%20M%C3%BCnster%20%26%20Partners%20(CEO)%20%2F%20100%25%20Guaranteed!");
      setDecodeMode("component");
      setPlusAsSpace(false);
    } else {
      setInput("https%3A%2F%2Faccounts.google.com%2Fo%2Foauth2%2Fauth%3Fclient_id%3D123456789.apps.googleusercontent.com%26redirect_uri%3Dhttps%253A%252F%252Fapp.example.com%252Foauth%252Fcallback%26response_type%3Dcode%26scope%3Dopenid%2Bemail%2Bprofile");
      setDecodeMode("component");
      setPlusAsSpace(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls */}
      <div className="neo-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-3">
          <span className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
            <Unlink size={16} className="text-accent" />
            Decoding Settings
          </span>

          {/* Quick Examples */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-heading uppercase font-semibold">Examples:</span>
            <button
              onClick={() => loadExample("search")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              Encoded URL
            </button>
            <button
              onClick={() => loadExample("unicode")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              Unicode & Symbols
            </button>
            <button
              onClick={() => loadExample("oauth")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              OAuth Parameters
            </button>
          </div>
        </div>

        {/* Decoder Mode selection */}
        <div className="grid sm:grid-cols-2 gap-3">
          <label
            onClick={() => setDecodeMode("component")}
            className={`cursor-pointer p-3.5 neo-border rounded-lg text-left transition-all ${
              decodeMode === "component"
                ? "bg-accent/10 border-accent font-semibold text-text"
                : "bg-surface hover:bg-bg text-text-secondary"
            }`}
          >
            <div className="text-sm font-heading uppercase font-bold text-text mb-1">
              Component Mode (decodeURIComponent)
            </div>
            <div className="text-xs text-text-secondary">
              Decodes all percent-encoded hex sequences including reserved characters (: / ? # [ ] @ ! $ & &apos; ( ) * + , ; =).
            </div>
          </label>

          <label
            onClick={() => setDecodeMode("uri")}
            className={`cursor-pointer p-3.5 neo-border rounded-lg text-left transition-all ${
              decodeMode === "uri"
                ? "bg-accent/10 border-accent font-semibold text-text"
                : "bg-surface hover:bg-bg text-text-secondary"
            }`}
          >
            <div className="text-sm font-heading uppercase font-bold text-text mb-1">
              Full URI Mode (decodeURI)
            </div>
            <div className="text-xs text-text-secondary">
              Decodes percent-encoded characters while leaving protocol and URL structural delimiters in place.
            </div>
          </label>
        </div>

        {/* Checkbox Toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wide">
            <input
              type="checkbox"
              checked={plusAsSpace}
              onChange={(e) => setPlusAsSpace(e.target.checked)}
              className="w-4 h-4 rounded neo-border accent-accent cursor-pointer"
            />
            Decode &apos;+&apos; as space (application/x-www-form-urlencoded)
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wide">
            <input
              type="checkbox"
              checked={safeFallback}
              onChange={(e) => setSafeFallback(e.target.checked)}
              className="w-4 h-4 rounded neo-border accent-accent cursor-pointer"
            />
            Resilient mode (preserve malformed byte sequences instead of failing)
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
              Encoded URL or String
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
            placeholder="Paste percent-encoded URL (e.g. https%3A%2F%2Fexample.com%3Fq%3Dtest)..."
            rows={8}
            className="w-full neo-input p-3 font-mono text-sm resize-y flex-1"
          />

          <div className="text-xs text-text-secondary flex items-center justify-between pt-1">
            <span>Hex sequences like %20, %2F, %3F will be decoded.</span>
          </div>
        </div>

        {/* Output Card */}
        <div className="neo-card p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="font-heading font-bold uppercase text-sm tracking-wide">
              Decoded Result
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
                title="Download decoded result"
              >
                <Download size={13} />
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 neo-border rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <textarea
            value={output}
            readOnly
            placeholder="Decoded text will appear here automatically..."
            rows={8}
            className="w-full neo-input p-3 font-mono text-sm bg-surface/50 resize-y flex-1"
          />

          <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
            <span>
              {input.length > 0 && output.length > 0
                ? `Decoded: -${Math.max(0, input.length - output.length)} bytes (${(
                    (output.length / (input.length || 1)) *
                    100
                  ).toFixed(0)}% of original)`
                : "Live decoding active"}
            </span>
            <button
              onClick={() => {
                setInput("");
                setPlusAsSpace(true);
                setDecodeMode("component");
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
            Handling Plus Signs (+) in URLs:
          </p>
          <p>
            In the query string portion of a URL (after &apos;?&apos;), web standards define that spaces may be encoded as &apos;+&apos; according to the <code className="font-mono">application/x-www-form-urlencoded</code> specification. In path segments, however, a &apos;+&apos; is a literal character and spaces must be represented as <code className="font-mono">%20</code>. Use the toggle above depending on whether your string came from a form submission or a raw path.
          </p>
        </div>
      </div>
    </div>
  );
}
