"use client";

import React, { useState, useEffect } from "react";
import {
  Hash,
  Copy,
  Check,
  Fingerprint,
  Info,
  ShieldCheck,
} from "lucide-react";
import { computeHash } from "@/lib/cryptoUtils";

interface HashResultItem {
  algorithm: string;
  bits: number;
  hexLength: number;
  hash: string;
}

export default function TextToHashConverterTool() {
  const [input, setInput] = useState("QuickTools Security");
  const [hashes, setHashes] = useState<HashResultItem[]>([]);
  const [isUppercase, setIsUppercase] = useState(false);
  const [copiedAlg, setCopiedAlg] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function run() {
      if (!input) {
        setHashes([]);
        return;
      }

      try {
        const textBuf = new TextEncoder().encode(input).buffer;

        // Compute SHA-1, SHA-256, SHA-384, SHA-512 using Web Crypto API
        const [h1, h256, h384, h512] = await Promise.all([
          computeHash(input, "SHA-1"),
          computeHash(input, "SHA-256"),
          (async () => {
            const buf = await window.crypto.subtle.digest("SHA-384", textBuf);
            return Array.from(new Uint8Array(buf))
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("");
          })(),
          computeHash(input, "SHA-512"),
        ]);

        if (!isCancelled) {
          setHashes([
            { algorithm: "SHA-256", bits: 256, hexLength: 64, hash: h256 },
            { algorithm: "SHA-512", bits: 512, hexLength: 128, hash: h512 },
            { algorithm: "SHA-384", bits: 384, hexLength: 96, hash: h384 },
            { algorithm: "SHA-1 (Legacy)", bits: 160, hexLength: 40, hash: h1 },
          ]);
        }
      } catch {
        // ignore
      }
    }

    run();

    return () => {
      isCancelled = true;
    };
  }, [input]);

  const copyHash = (h: string, alg: string) => {
    const formatted = isUppercase ? h.toUpperCase() : h.toLowerCase();
    navigator.clipboard.writeText(formatted);
    setCopiedAlg(alg);
    setTimeout(() => setCopiedAlg(null), 2000);
  };

  const formatHash = (h: string) =>
    isUppercase ? h.toUpperCase() : h.toLowerCase();

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="neo-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-heading font-bold text-xs uppercase text-text-secondary">
            Input Text
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-heading font-semibold uppercase">
            <input
              type="checkbox"
              checked={isUppercase}
              onChange={(e) => setIsUppercase(e.target.checked)}
              className="accent-accent w-4 h-4"
            />
            Uppercase Hex
          </label>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste any text to compute all cryptographic hashes simultaneously..."
          className="neo-input min-h-[120px] font-mono text-sm p-4"
        />

        <div className="flex justify-between items-center text-xs text-text-secondary">
          <span>{input.length} characters</span>
          <span>UTF-8 Encoding</span>
        </div>
      </div>

      {/* Multi-Hash Comparison Grid */}
      <div className="space-y-4">
        {hashes.map((item) => (
          <div key={item.algorithm} className="neo-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-accent" />
                <span className="font-heading font-bold text-sm uppercase">
                  {item.algorithm}
                </span>
                <span className="text-[11px] font-mono text-text-secondary">
                  ({item.bits} bits, {item.hexLength} hex chars)
                </span>
              </div>

              <button
                onClick={() => copyHash(item.hash, item.algorithm)}
                className="neo-btn neo-btn-secondary text-[11px] py-1 px-3"
              >
                {copiedAlg === item.algorithm ? (
                  <Check size={12} className="text-green-600" />
                ) : (
                  <Copy size={12} />
                )}
                {copiedAlg === item.algorithm ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="p-3 neo-border rounded bg-surface font-mono text-xs break-all select-all font-semibold">
              {formatHash(item.hash)}
            </div>
          </div>
        ))}
      </div>

      {/* Cryptographic properties explanation */}
      <div className="neo-card p-4 bg-accent-light flex items-start gap-3">
        <Info size={20} className="text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-text font-heading uppercase tracking-wide">
            One-Way Avalanche Effect:
          </strong>{" "}
          Cryptographic hash functions are deterministic yet irreversible. Changing a single letter or punctuation mark in your input changes approximately 50% of the output hash bits. All hashes are calculated locally via <code>crypto.subtle.digest</code>.
        </div>
      </div>
    </div>
  );
}
