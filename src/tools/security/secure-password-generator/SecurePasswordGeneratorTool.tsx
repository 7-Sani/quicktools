"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  Shield,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  generateSecurePassword,
  evaluatePasswordStrength,
  PasswordOptions,
} from "@/lib/cryptoUtils";

export default function SecurePasswordGeneratorTool() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    useUpper: true,
    useLower: true,
    useNumbers: true,
    useSymbols: true,
    excludeAmbiguous: false,
  });

  const [count, setCount] = useState<number>(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generate = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(generateSecurePassword(options));
    }
    setPasswords(list);
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, count]);

  const copyPassword = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const primaryPassword = passwords[0] || "";
  const strength = evaluatePasswordStrength(primaryPassword);

  const strengthColor =
    strength.score === 4
      ? "text-green-600 bg-green-50 border-green-300"
      : strength.score === 3
      ? "text-blue-600 bg-blue-50 border-blue-300"
      : strength.score === 2
      ? "text-yellow-600 bg-yellow-50 border-yellow-300"
      : "text-red-600 bg-red-50 border-red-300";

  return (
    <div className="space-y-6">
      {/* Primary Password Display Card */}
      <div className="neo-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-xs uppercase text-text-secondary">
            Generated Secure Password
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 border rounded-full font-heading font-bold uppercase ${strengthColor}`}
          >
            {strength.label} ({strength.entropyBits} bits entropy)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value={primaryPassword}
            className="neo-input text-lg sm:text-2xl font-mono tracking-wider font-bold py-3 bg-surface select-all"
          />
          <button
            onClick={() => copyPassword(primaryPassword, 0)}
            className="neo-btn neo-btn-primary shrink-0 py-3 px-4"
            title="Copy Password"
          >
            {copiedIndex === 0 ? <Check size={18} /> : <Copy size={18} />}
            <span className="hidden sm:inline">
              {copiedIndex === 0 ? "Copied" : "Copy"}
            </span>
          </button>
          <button
            onClick={generate}
            className="neo-btn neo-btn-secondary shrink-0 py-3 px-3"
            title="Regenerate"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Entropy & Security Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="w-full bg-border/20 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                strength.score >= 4
                  ? "bg-green-600"
                  : strength.score === 3
                  ? "bg-accent"
                  : strength.score === 2
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, (strength.entropyBits / 100) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-text-secondary">
            <span>Offline attack resistance: {strength.crackTimeOffline}</span>
            <span>Online attack resistance: {strength.crackTimeOnline}</span>
          </div>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="neo-card p-6 space-y-6">
        <h3 className="font-heading font-bold text-base uppercase border-b border-border pb-3">
          Password Settings
        </h3>

        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-heading font-bold text-xs uppercase text-text-secondary">
              Password Length: {options.length} Characters
            </label>
            <span className="text-xl font-bold font-mono text-accent">
              {options.length}
            </span>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, length: parseInt(e.target.value) }))
            }
            className="w-full accent-accent cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-text-secondary font-mono">
            <span>8 (Minimum)</span>
            <span>16 (Recommended)</span>
            <span>32 (Strong)</span>
            <span>64 (Maximum)</span>
          </div>
        </div>

        {/* Character Set Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3 neo-border rounded-lg bg-surface cursor-pointer neo-hover">
            <input
              type="checkbox"
              checked={options.useUpper}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, useUpper: e.target.checked }))
              }
              className="accent-accent w-4 h-4"
            />
            <div>
              <span className="font-heading font-bold text-xs uppercase block">
                Uppercase Letters (A-Z)
              </span>
              <span className="text-[11px] text-text-secondary font-mono">
                ABCDEFGH...
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 neo-border rounded-lg bg-surface cursor-pointer neo-hover">
            <input
              type="checkbox"
              checked={options.useLower}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, useLower: e.target.checked }))
              }
              className="accent-accent w-4 h-4"
            />
            <div>
              <span className="font-heading font-bold text-xs uppercase block">
                Lowercase Letters (a-z)
              </span>
              <span className="text-[11px] text-text-secondary font-mono">
                abcdefgh...
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 neo-border rounded-lg bg-surface cursor-pointer neo-hover">
            <input
              type="checkbox"
              checked={options.useNumbers}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, useNumbers: e.target.checked }))
              }
              className="accent-accent w-4 h-4"
            />
            <div>
              <span className="font-heading font-bold text-xs uppercase block">
                Numbers (0-9)
              </span>
              <span className="text-[11px] text-text-secondary font-mono">
                0123456789
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 neo-border rounded-lg bg-surface cursor-pointer neo-hover">
            <input
              type="checkbox"
              checked={options.useSymbols}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, useSymbols: e.target.checked }))
              }
              className="accent-accent w-4 h-4"
            />
            <div>
              <span className="font-heading font-bold text-xs uppercase block">
                Special Symbols (!@#$%^&*)
              </span>
              <span className="text-[11px] text-text-secondary font-mono">
                !@#$%^&*()_+-=[]
              </span>
            </div>
          </label>
        </div>

        {/* Ambiguous characters toggle */}
        <label className="flex items-center gap-2 text-xs font-heading font-semibold uppercase cursor-pointer">
          <input
            type="checkbox"
            checked={options.excludeAmbiguous}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, excludeAmbiguous: e.target.checked }))
            }
            className="accent-accent w-4 h-4"
          />
          Exclude Ambiguous Characters (0, O, o, 1, l, I)
        </label>
      </div>

      {/* Bulk Passwords Option */}
      <div className="neo-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm uppercase">
            Bulk Generate Passwords
          </h3>
          <div className="flex items-center gap-2">
            {[1, 5, 10].map((num) => (
              <button
                key={num}
                onClick={() => setCount(num)}
                className={`text-xs px-3 py-1 neo-border rounded-full font-heading font-semibold ${
                  count === num ? "bg-accent text-white" : "bg-surface"
                }`}
              >
                {num} {num === 1 ? "Password" : "Passwords"}
              </button>
            ))}
          </div>
        </div>

        {count > 1 && (
          <div className="space-y-2">
            {passwords.map((pwd, idx) => (
              <div
                key={idx}
                className="neo-card p-3 flex items-center justify-between gap-3 font-mono text-sm"
              >
                <span className="truncate">{pwd}</span>
                <button
                  onClick={() => copyPassword(pwd, idx)}
                  className="neo-btn neo-btn-secondary text-[11px] py-1 px-2.5 shrink-0"
                >
                  {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                  {copiedIndex === idx ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Privacy Notice */}
      <div className="neo-card p-4 bg-accent-light flex items-start gap-3">
        <ShieldCheck size={20} className="text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-text font-heading uppercase tracking-wide">
            100% Cryptographically Secure &amp; Private:
          </strong>{" "}
          Passwords are generated on your device using the browser&apos;s Web Crypto API (<code>window.crypto.getRandomValues</code>) which uses hardware-level entropy. Passwords are never sent across the internet, logged, or saved anywhere.
        </p>
      </div>
    </div>
  );
}
