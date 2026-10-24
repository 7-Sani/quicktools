"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  Download,
  Sparkles,
  ShieldCheck,
  Key,
} from "lucide-react";
import { generateSecureToken, TokenType } from "@/lib/cryptoUtils";

export default function RandomTokenGeneratorTool() {
  const [tokenType, setTokenType] = useState<TokenType>("hex");
  const [length, setLength] = useState<number>(32);
  const [count, setCount] = useState<number>(5);
  const [tokens, setTokens] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generateTokens = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(generateSecureToken(tokenType, length));
    }
    setTokens(list);
  };

  useEffect(() => {
    generateTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenType, length, count]);

  const copyOne = (tok: string, idx: number) => {
    navigator.clipboard.writeText(tok);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(tokens.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const downloadTokens = () => {
    const blob = new Blob([tokens.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tokens_${tokenType}_${length}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const applyPreset = (type: TokenType, len: number) => {
    setTokenType(type);
    setLength(len);
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="neo-card p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-bold text-base uppercase flex items-center gap-2">
              <Sparkles size={18} className="text-accent" /> Secure Random Token Generator
            </h3>
            <p className="text-xs text-text-secondary">
              Generate cryptographic API keys, session tokens, and authentication secrets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyAll}
              disabled={tokens.length === 0}
              className="neo-btn neo-btn-primary text-xs"
            >
              {copiedAll ? <Check size={14} /> : <Copy size={14} />}
              {copiedAll ? "Copied All" : "Copy All"}
            </button>
            <button
              onClick={generateTokens}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <span className="text-xs font-heading font-semibold uppercase text-text-secondary py-1">
            Presets:
          </span>
          {[
            { label: "API Key (32-byte Hex)", type: "hex" as TokenType, len: 64 },
            { label: "Session Secret (32-char Alphanumeric)", type: "alphanumeric" as TokenType, len: 32 },
            { label: "Base64 Secret (48-char)", type: "base64" as TokenType, len: 48 },
            { label: "6-Digit OTP / PIN", type: "numeric" as TokenType, len: 6 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.type, preset.len)}
              className="text-xs px-2.5 py-1 neo-border rounded-full bg-surface hover:bg-accent/10 font-heading font-semibold transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
              Token Character Type
            </label>
            <select
              value={tokenType}
              onChange={(e) => setTokenType(e.target.value as TokenType)}
              className="neo-input text-xs font-semibold py-2"
            >
              <option value="hex">Hexadecimal (0-9, a-f)</option>
              <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
              <option value="base64">Base64 URL-Safe</option>
              <option value="numeric">Numeric Digits (0-9)</option>
            </select>
          </div>

          <div>
            <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
              Token Length: {length}
            </label>
            <input
              type="number"
              min="4"
              max="256"
              value={length}
              onChange={(e) => setLength(Math.min(256, Math.max(4, parseInt(e.target.value) || 16)))}
              className="neo-input text-sm font-mono py-1.5"
            />
          </div>

          <div>
            <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
              Number of Tokens
            </label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="neo-input text-xs font-semibold py-2"
            >
              <option value={1}>1 Token</option>
              <option value={5}>5 Tokens</option>
              <option value={10}>10 Tokens</option>
              <option value={20}>20 Tokens</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generated Tokens Display */}
      <div className="neo-card p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-accent/5">
          <span className="font-heading font-bold text-xs uppercase">
            Generated Tokens ({tokens.length})
          </span>
          <button
            onClick={downloadTokens}
            className="neo-btn neo-btn-secondary text-[11px] py-1 px-3"
          >
            <Download size={12} />
            Download .TXT
          </button>
        </div>

        <ul className="divide-y divide-border max-h-[460px] overflow-y-auto">
          {tokens.map((token, idx) => (
            <li
              key={idx}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-accent/5 transition-colors font-mono text-xs sm:text-sm select-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] text-text-secondary font-mono w-5">
                  {idx + 1}.
                </span>
                <span className="truncate">{token}</span>
              </div>
              <button
                onClick={() => copyOne(token, idx)}
                className="neo-btn neo-btn-secondary text-[11px] py-1 px-2.5 shrink-0"
              >
                {copiedIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                {copiedIdx === idx ? "Copied" : "Copy"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Security Privacy Notice */}
      <div className="neo-card p-4 bg-accent-light flex items-start gap-3">
        <ShieldCheck size={20} className="text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-text font-heading uppercase tracking-wide">
            CSPRNG Entropy:
          </strong>{" "}
          Tokens are generated using the browser&apos;s Cryptographically Secure Pseudo-Random Number Generator (CSPRNG via <code>crypto.getRandomValues</code>). Safe for API tokens, secret keys, password reset links, and salts.
        </p>
      </div>
    </div>
  );
}
