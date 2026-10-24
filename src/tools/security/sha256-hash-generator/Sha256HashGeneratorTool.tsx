"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Fingerprint,
  Info,
  Shield,
  FileText,
} from "lucide-react";
import { computeHash } from "@/lib/cryptoUtils";

export default function Sha256HashGeneratorTool() {
  const [input, setInput] = useState("");
  const [sha256Hash, setSha256Hash] = useState("");
  const [sha512Hash, setSha512Hash] = useState("");
  const [sha1Hash, setSha1Hash] = useState("");
  const [isUppercase, setIsUppercase] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function run() {
      if (!input) {
        setSha256Hash("");
        setSha512Hash("");
        setSha1Hash("");
        return;
      }

      try {
        const [h256, h512, h1] = await Promise.all([
          computeHash(input, "SHA-256"),
          computeHash(input, "SHA-512"),
          computeHash(input, "SHA-1"),
        ]);

        if (!isCancelled) {
          setSha256Hash(h256);
          setSha512Hash(h512);
          setSha1Hash(h1);
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

  const copyHash = (hash: string, key: string) => {
    const formatted = isUppercase ? hash.toUpperCase() : hash.toLowerCase();
    navigator.clipboard.writeText(formatted);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatOutput = (h: string) =>
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
          placeholder="Type or paste text to compute SHA-256 hash digest..."
          className="neo-input min-h-[140px] font-mono text-sm p-4"
        />

        <div className="flex justify-between items-center text-xs text-text-secondary">
          <span>{input.length} characters</span>
          <span>UTF-8 Encoded</span>
        </div>
      </div>

      {/* Primary SHA-256 Result */}
      <div className="neo-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-sm uppercase flex items-center gap-2 text-accent">
            <Fingerprint size={18} /> SHA-256 Digest (256-bit, 64 hex chars)
          </span>
          <button
            onClick={() => copyHash(sha256Hash, "sha256")}
            disabled={!sha256Hash}
            className="neo-btn neo-btn-primary text-xs"
          >
            {copiedKey === "sha256" ? <Check size={14} /> : <Copy size={14} />}
            {copiedKey === "sha256" ? "Copied" : "Copy SHA-256"}
          </button>
        </div>

        <div className="p-4 neo-border rounded-lg bg-surface font-mono text-xs sm:text-sm break-all font-bold">
          {sha256Hash ? (
            formatOutput(sha256Hash)
          ) : (
            <span className="text-text-secondary font-normal italic">
              Type text above to compute SHA-256 hash...
            </span>
          )}
        </div>
      </div>

      {/* Related Hashes */}
      {sha256Hash && (
        <div className="space-y-4">
          {/* SHA-512 */}
          <div className="neo-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs uppercase text-text-secondary">
                SHA-512 (512-bit, 128 hex chars)
              </span>
              <button
                onClick={() => copyHash(sha512Hash, "sha512")}
                className="neo-btn neo-btn-secondary text-[11px] py-1 px-2.5"
              >
                {copiedKey === "sha512" ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                {copiedKey === "sha512" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="p-3 neo-border rounded bg-surface font-mono text-xs break-all">
              {formatOutput(sha512Hash)}
            </div>
          </div>

          {/* SHA-1 */}
          <div className="neo-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs uppercase text-text-secondary">
                SHA-1 (Legacy 160-bit, 40 hex chars)
              </span>
              <button
                onClick={() => copyHash(sha1Hash, "sha1")}
                className="neo-btn neo-btn-secondary text-[11px] py-1 px-2.5"
              >
                {copiedKey === "sha1" ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                {copiedKey === "sha1" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="p-3 neo-border rounded bg-surface font-mono text-xs break-all">
              {formatOutput(sha1Hash)}
            </div>
          </div>
        </div>
      )}

      {/* Educational Hashing vs Encryption Note */}
      <div className="neo-card p-4 bg-accent-light flex items-start gap-3">
        <Info size={20} className="text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-text font-heading uppercase tracking-wide">
            One-Way Cryptographic Hashing:
          </strong>{" "}
          A cryptographic hash is a one-way mathematical function. It cannot be &quot;decrypted&quot; or reversed back to the original text. Even a single character change in the input produces a completely different hash (the avalanche effect).
        </div>
      </div>
    </div>
  );
}
