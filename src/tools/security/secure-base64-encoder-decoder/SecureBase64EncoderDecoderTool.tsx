"use client";

import React, { useState } from "react";
import {
  Binary,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  ArrowRightLeft,
  ShieldAlert,
} from "lucide-react";
import { utf8ToBase64, base64ToUtf8 } from "@/lib/cryptoUtils";

export default function SecureBase64EncoderDecoderTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
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
        let b64 = utf8ToBase64(input);
        if (urlSafe) {
          b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }
        setOutput(b64);
      } else {
        let normal = input.trim().replace(/-/g, "+").replace(/_/g, "/");
        while (normal.length % 4) {
          normal += "=";
        }
        const text = base64ToUtf8(normal);
        setOutput(text);
      }
    } catch {
      setError(
        mode === "encode"
          ? "Failed to encode input text to Base64."
          : "Invalid Base64 string. Please check that the input contains valid Base64 characters."
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
          Base64 Encode
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
          Base64 Decode
        </button>
      </div>

      {/* Prominent Educational Security Notice */}
      <div className="neo-card p-4 bg-amber-50 border-amber-400 text-amber-900 flex items-start gap-3">
        <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-heading font-bold uppercase tracking-wide block mb-0.5">
            Security Warning: Base64 is NOT Encryption!
          </strong>
          Encoding simply translates binary or UTF-8 data into ASCII characters for HTTP/network transmission. Base64 provides <strong>ZERO confidentiality or protection</strong>. Anyone can decode it instantaneously without a key. To protect confidential data, use authenticated encryption (such as AES-GCM).
        </div>
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
            {mode === "encode" ? "Plaintext / Unicode Input" : "Base64 Input"}
          </label>

          {mode === "encode" && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-heading font-semibold uppercase">
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => setUrlSafe(e.target.checked)}
                className="accent-accent w-4 h-4"
              />
              URL-Safe Base64 (- and _)
            </label>
          )}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "Type or paste UTF-8 text to encode into Base64..."
              : "Paste Base64 string to decode..."
          }
          className="neo-input min-h-[140px] font-mono text-sm p-4"
        />

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-text-secondary">
            {input.length} characters
          </span>
          <button onClick={handleProcess} className="neo-btn neo-btn-primary text-xs">
            <ArrowRightLeft size={14} />
            {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
          </button>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="neo-card p-6 space-y-3 bg-accent/5 border-accent">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-xs uppercase text-accent">
              {mode === "encode" ? "Base64 Output" : "Decoded Text"}
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
    </div>
  );
}
