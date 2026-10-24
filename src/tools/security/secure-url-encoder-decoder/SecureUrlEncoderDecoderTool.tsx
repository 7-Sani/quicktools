"use client";

import React, { useState } from "react";
import {
  Link,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  ArrowRightLeft,
  Info,
} from "lucide-react";
import { safeUrlEncode, safeUrlDecode } from "@/lib/cryptoUtils";

export default function SecureUrlEncoderDecoderTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [componentMode, setComponentMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      if (mode === "encode") {
        setOutput(safeUrlEncode(input, componentMode));
      } else {
        setOutput(safeUrlDecode(input, componentMode));
      }
    } catch {
      setError(
        mode === "encode"
          ? "Failed to URL-encode input text."
          : "Invalid percent-encoded URI string. Please verify valid URI encoding syntax."
      );
      setOutput("");
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-3 p-1 neo-card">
        <button
          onClick={() => {
            setMode("encode");
            setError(null);
          }}
          className={`py-2.5 px-4 text-xs font-heading font-bold uppercase rounded transition-colors ${
            mode === "encode"
              ? "bg-accent text-white neo-shadow-sm"
              : "text-text-secondary hover:text-text"
          }`}
        >
          URL Encode
        </button>

        <button
          onClick={() => {
            setMode("decode");
            setError(null);
          }}
          className={`py-2.5 px-4 text-xs font-heading font-bold uppercase rounded transition-colors ${
            mode === "decode"
              ? "bg-accent text-white neo-shadow-sm"
              : "text-text-secondary hover:text-text"
          }`}
        >
          URL Decode
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700 text-sm">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input */}
      <div className="neo-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-heading font-bold text-xs uppercase text-text-secondary">
            {mode === "encode" ? "Raw Text or URL to Encode" : "Percent-Encoded URL String"}
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-heading font-semibold uppercase">
            <input
              type="checkbox"
              checked={componentMode}
              onChange={(e) => setComponentMode(e.target.checked)}
              className="accent-accent w-4 h-4"
            />
            Component Mode (Encodes &amp;, ?, =, /)
          </label>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "https://example.com/search?query=hello world&category=tools"
              : "https%3A%2F%2Fexample.com%2Fsearch%3Fquery%3Dhello%20world"
          }
          className="neo-input min-h-[140px] font-mono text-sm p-4"
        />

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-text-secondary">
            {input.length} characters
          </span>
          <button onClick={handleProcess} className="neo-btn neo-btn-primary text-xs">
            <ArrowRightLeft size={14} />
            {mode === "encode" ? "Encode URL" : "Decode URL"}
          </button>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="neo-card p-6 space-y-3 bg-accent/5 border-accent">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-xs uppercase text-accent">
              {mode === "encode" ? "Percent-Encoded Output" : "Decoded Output"}
            </span>
            <button onClick={copyResult} className="neo-btn neo-btn-secondary text-xs">
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Output"}
            </button>
          </div>

          <textarea
            readOnly
            value={output}
            className="neo-input min-h-[140px] font-mono text-xs p-4 bg-surface select-all"
          />

          <span className="text-xs text-text-secondary block">
            Output Length: {output.length} characters
          </span>
        </div>
      )}

      {/* Educational Notice */}
      <div className="neo-card p-4 bg-accent-light flex items-start gap-3">
        <Info size={20} className="text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-text font-heading uppercase tracking-wide">
            Transmission Encoding vs. Cryptography:
          </strong>{" "}
          Percent-encoding transforms special characters (like spaces into <code>%20</code> or <code>+</code>) into safe ASCII byte sequences so web servers can parse URLs without protocol collisions. It is <strong>NOT encryption</strong> and offers zero confidentiality.
        </div>
      </div>
    </div>
  );
}
