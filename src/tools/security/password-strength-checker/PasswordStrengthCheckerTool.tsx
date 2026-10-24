"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Gauge,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { evaluatePasswordStrength } from "@/lib/cryptoUtils";

export default function PasswordStrengthCheckerTool() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const result = evaluatePasswordStrength(password);

  const getScoreColor = () => {
    switch (result.score) {
      case 4:
        return {
          bar: "bg-green-600",
          badge: "bg-green-100 text-green-800 border-green-300",
        };
      case 3:
        return {
          bar: "bg-blue-600",
          badge: "bg-blue-100 text-blue-800 border-blue-300",
        };
      case 2:
        return {
          bar: "bg-yellow-500",
          badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
        };
      case 1:
        return {
          bar: "bg-orange-500",
          badge: "bg-orange-100 text-orange-800 border-orange-300",
        };
      default:
        return {
          bar: "bg-red-500",
          badge: "bg-red-100 text-red-800 border-red-300",
        };
    }
  };

  const colors = getScoreColor();

  const criteria = [
    { label: "At least 12 characters", met: password.length >= 12 },
    { label: "Contains uppercase letters (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letters (a-z)", met: /[a-z]/.test(password) },
    { label: "Contains numbers (0-9)", met: /[0-9]/.test(password) },
    {
      label: "Contains special symbols (!@#$...)",
      met: /[^a-zA-Z0-9]/.test(password),
    },
    {
      label: "No repeated character sequences",
      met: password.length > 0 && !/(.)\1{2,}/.test(password),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="neo-card p-6 space-y-4">
        <label className="font-heading font-bold text-xs uppercase block text-text-secondary">
          Enter Password to Analyze
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type or paste a password here..."
            className="neo-input text-base sm:text-xl font-mono pr-12 py-3"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text p-1.5"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Strength Meter Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-heading font-bold uppercase">
              Strength Rating:{" "}
              <span className={`px-2 py-0.5 neo-border rounded-full text-[11px] ${colors.badge}`}>
                {password ? result.label : "Awaiting input"}
              </span>
            </span>
            <span className="font-mono text-text-secondary font-semibold">
              {password.length} chars • {result.entropyBits} bits entropy
            </span>
          </div>

          <div className="w-full bg-border/20 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${colors.bar}`}
              style={{
                width: password ? `${Math.min(100, Math.max(5, (result.entropyBits / 100) * 100))}%` : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Metrics & Crack Times */}
      {password && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="neo-card p-4">
            <span className="text-[11px] font-heading font-bold uppercase text-text-secondary flex items-center gap-1.5 mb-1">
              <Gauge size={14} className="text-accent" /> Entropy Rating
            </span>
            <span className="text-2xl font-bold font-mono text-accent">
              {result.entropyBits} bits
            </span>
            <span className="text-xs text-text-secondary block mt-0.5">
              {result.entropyBits >= 80 ? "Sufficient for high security" : "Low entropy; vulnerable to brute-force"}
            </span>
          </div>

          <div className="neo-card p-4">
            <span className="text-[11px] font-heading font-bold uppercase text-text-secondary flex items-center gap-1.5 mb-1">
              <Clock size={14} className="text-accent" /> Offline Brute-Force
            </span>
            <span className="text-xl font-bold font-mono">
              {result.crackTimeOffline}
            </span>
            <span className="text-xs text-text-secondary block mt-0.5">
              Assumes fast hardware attack (~10¹⁰ attempts/sec)
            </span>
          </div>

          <div className="neo-card p-4">
            <span className="text-[11px] font-heading font-bold uppercase text-text-secondary flex items-center gap-1.5 mb-1">
              <Clock size={14} className="text-accent" /> Online Throttled
            </span>
            <span className="text-xl font-bold font-mono">
              {result.crackTimeOnline}
            </span>
            <span className="text-xs text-text-secondary block mt-0.5">
              Assumes web service rate limit (~100 attempts/sec)
            </span>
          </div>
        </div>
      )}

      {/* Criteria Breakdown */}
      <div className="neo-card p-6 space-y-4">
        <h3 className="font-heading font-bold text-base uppercase border-b border-border pb-3">
          Security Criteria Checklist
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {criteria.map((c) => (
            <div
              key={c.label}
              className={`p-3 neo-border rounded-lg flex items-center gap-3 text-xs font-semibold ${
                c.met ? "bg-green-50 text-green-900" : "bg-surface text-text-secondary"
              }`}
            >
              {c.met ? (
                <CheckCircle2 size={16} className="text-green-600 shrink-0" />
              ) : (
                <XCircle size={16} className="text-text-secondary/50 shrink-0" />
              )}
              <span>{c.label}</span>
            </div>
          ))}
        </div>

        {/* Warnings & Suggestions */}
        {result.warnings.length > 0 && (
          <div className="p-4 neo-border rounded-lg bg-red-50 text-red-700 space-y-1">
            <div className="flex items-center gap-2 font-heading font-bold text-xs uppercase">
              <AlertTriangle size={14} /> Vulnerability Warnings
            </div>
            <ul className="list-disc list-inside text-xs space-y-1 pl-2">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {result.suggestions.length > 0 && (
          <div className="p-4 neo-border rounded-lg bg-accent-light text-text space-y-1">
            <div className="flex items-center gap-2 font-heading font-bold text-xs uppercase text-accent">
              <Info size={14} /> Improvement Suggestions
            </div>
            <ul className="list-disc list-inside text-xs text-text-secondary space-y-1 pl-2">
              {result.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Honest Security Disclaimer */}
      <div className="neo-card p-4 bg-accent-light flex items-start gap-3">
        <ShieldAlert size={20} className="text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-text font-heading uppercase tracking-wide">
            Honest Security Disclosure:
          </strong>{" "}
          Password strength meters calculate theoretical mathematical entropy. A &quot;Very Strong&quot; score does NOT guarantee safety against credential stuffing, phishing, keyloggers, or database breaches. Always use unique passwords for every account and enable Multi-Factor Authentication (MFA). All checking occurs strictly within your browser.
        </div>
      </div>
    </div>
  );
}
