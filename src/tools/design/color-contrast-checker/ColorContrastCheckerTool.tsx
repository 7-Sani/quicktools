"use client";

import React, { useState, useMemo } from "react";
import {
  Eye,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Shield,
  Info,
} from "lucide-react";
import { hexToRgb, getContrastRatio } from "../colorUtils";

const CONTRAST_PRESETS = [
  { label: "High Contrast (Default)", fg: "#111111", bg: "#FFFFFF" },
  { label: "Dark Mode Contrast", fg: "#FFFFFF", bg: "#1A1A1A" },
  { label: "Brand Accent on White", fg: "#315CFF", bg: "#FFFFFF" },
  { label: "White on Brand Accent", fg: "#FFFFFF", bg: "#315CFF" },
  { label: "Failing Example (Low Contrast)", fg: "#94A3B8", bg: "#FFFFFF" },
];

export default function ColorContrastCheckerTool() {
  const [fgHex, setFgHex] = useState("#111111");
  const [bgHex, setBgHex] = useState("#FFFFFF");
  const [copied, setCopied] = useState(false);

  // Parse RGB
  const fgRgb = useMemo(() => hexToRgb(fgHex) || { r: 17, g: 17, b: 17 }, [fgHex]);
  const bgRgb = useMemo(() => hexToRgb(bgHex) || { r: 255, g: 255, b: 255 }, [bgHex]);

  // Calculate contrast ratio
  const ratio = useMemo(() => {
    return getContrastRatio(fgRgb, bgRgb);
  }, [fgRgb, bgRgb]);

  // WCAG 2.1 Criteria checks
  const wcag = useMemo(() => {
    return {
      normalAa: ratio >= 4.5,
      normalAaa: ratio >= 7.0,
      largeAa: ratio >= 3.0,
      largeAaa: ratio >= 4.5,
      uiAa: ratio >= 3.0,
    };
  }, [ratio]);

  const swapColors = () => {
    const temp = fgHex;
    setFgHex(bgHex);
    setBgHex(temp);
  };

  const handleCopyCss = () => {
    const css = `color: ${fgHex};\nbackground-color: ${bgHex};`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFgHex("#111111");
    setBgHex("#FFFFFF");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Eye size={14} /> WCAG 2.1 Color Contrast Checker
          </span>
          <span className="text-xs text-text-secondary">
            Accurate relative luminance &amp; accessibility compliance
          </span>
        </div>

        <button
          onClick={handleReset}
          className="text-xs px-2.5 py-1.5 neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* Preset Pairings */}
      <div className="neo-card p-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-heading font-bold uppercase text-text-secondary mr-1">
          Preset Pairings:
        </span>
        {CONTRAST_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setFgHex(p.fg);
              setBgHex(p.bg);
            }}
            className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1.5"
          >
            <span
              className="w-3 h-3 rounded-full neo-border"
              style={{ backgroundColor: p.fg }}
            />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Color Selectors & Score Display */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Inputs (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-border pb-2.5">
              <span className="font-heading font-bold uppercase text-xs text-text-secondary">
                Foreground &amp; Background Selectors
              </span>
              <button
                onClick={swapColors}
                className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1"
                title="Swap foreground and background"
              >
                <ArrowRightLeft size={12} /> Swap
              </button>
            </div>

            {/* Foreground (Text) */}
            <div className="space-y-2">
              <label className="font-heading font-bold text-xs uppercase text-text-secondary">
                Foreground Color (Text)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={fgHex}
                  onChange={(e) => setFgHex(e.target.value.toUpperCase())}
                  className="w-10 h-10 rounded neo-border cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={fgHex}
                  onChange={(e) => setFgHex(e.target.value.toUpperCase())}
                  className="w-full neo-input py-2 px-3 font-mono font-bold text-sm"
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2 pt-2 border-t-2 border-border">
              <label className="font-heading font-bold text-xs uppercase text-text-secondary">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value.toUpperCase())}
                  className="w-10 h-10 rounded neo-border cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value.toUpperCase())}
                  className="w-full neo-input py-2 px-3 font-mono font-bold text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Score & Summary (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-6 text-center space-y-3">
            <span className="font-heading font-bold uppercase text-xs text-text-secondary block">
              Calculated Contrast Ratio
            </span>

            <div className="text-5xl font-heading font-bold text-accent tracking-tight">
              {ratio}:1
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              {ratio >= 4.5 ? (
                <span className="px-3 py-1 neo-border rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Passes WCAG AA
                </span>
              ) : ratio >= 3.0 ? (
                <span className="px-3 py-1 neo-border rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase flex items-center gap-1.5">
                  Passes Large Text Only
                </span>
              ) : (
                <span className="px-3 py-1 neo-border rounded bg-red-500/10 text-red-600 font-bold text-xs uppercase flex items-center gap-1.5">
                  <XCircle size={14} /> Fails Accessibility
                </span>
              )}
            </div>

            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              WCAG 2.1 recommends a minimum contrast ratio of 4.5:1 for normal body text and 3:1 for large text and UI components.
            </p>
          </div>
        </div>
      </div>

      {/* WCAG Compliance Matrix */}
      <div className="neo-card p-5 space-y-3">
        <div className="font-heading font-bold uppercase text-xs text-text-secondary border-b-2 border-border pb-2.5">
          Detailed WCAG 2.1 Criteria Results
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          {/* Normal Text */}
          <div className="p-3.5 neo-border rounded bg-surface space-y-2">
            <span className="font-heading font-bold uppercase block text-sm">
              Normal Text (&lt;18pt)
            </span>
            <div className="flex items-center justify-between">
              <span>Level AA (4.5:1):</span>
              {wcag.normalAa ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> PASS
                </span>
              ) : (
                <span className="text-red-500 font-bold flex items-center gap-1">
                  <XCircle size={14} /> FAIL
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Level AAA (7.0:1):</span>
              {wcag.normalAaa ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> PASS
                </span>
              ) : (
                <span className="text-red-500 font-bold flex items-center gap-1">
                  <XCircle size={14} /> FAIL
                </span>
              )}
            </div>
          </div>

          {/* Large Text */}
          <div className="p-3.5 neo-border rounded bg-surface space-y-2">
            <span className="font-heading font-bold uppercase block text-sm">
              Large Text (&ge;18pt / 14pt Bold)
            </span>
            <div className="flex items-center justify-between">
              <span>Level AA (3.0:1):</span>
              {wcag.largeAa ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> PASS
                </span>
              ) : (
                <span className="text-red-500 font-bold flex items-center gap-1">
                  <XCircle size={14} /> FAIL
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Level AAA (4.5:1):</span>
              {wcag.largeAaa ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> PASS
                </span>
              ) : (
                <span className="text-red-500 font-bold flex items-center gap-1">
                  <XCircle size={14} /> FAIL
                </span>
              )}
            </div>
          </div>

          {/* UI Components */}
          <div className="p-3.5 neo-border rounded bg-surface space-y-2">
            <span className="font-heading font-bold uppercase block text-sm">
              UI Components &amp; Icons
            </span>
            <div className="flex items-center justify-between">
              <span>Level AA (3.0:1):</span>
              {wcag.uiAa ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> PASS
                </span>
              ) : (
                <span className="text-red-500 font-bold flex items-center gap-1">
                  <XCircle size={14} /> FAIL
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-secondary pt-1">
              Applies to button borders, input fields, checkboxes, and interactive controls.
            </p>
          </div>
        </div>
      </div>

      {/* Live Readability Preview Box */}
      <div className="neo-card p-5 space-y-3">
        <div className="flex items-center justify-between border-b-2 border-border pb-2.5">
          <span className="font-heading font-bold uppercase text-xs text-text-secondary">
            Live Readability Preview
          </span>
          <button
            onClick={handleCopyCss}
            className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1"
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            <span>{copied ? "Copied" : "Copy CSS"}</span>
          </button>
        </div>

        {/* Live rendering container using user fg and bg colors */}
        <div
          className="p-6 rounded-lg neo-border space-y-4 transition-colors"
          style={{ backgroundColor: bgHex, color: fgHex }}
        >
          <div>
            <h2 className="text-2xl font-bold font-heading mb-1" style={{ color: fgHex }}>
              Large Headline Text Preview
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: fgHex }}>
              This paragraph demonstrates how regular body copy renders against the chosen background color.
              Accessible color pairings ensure that visitors with visual impairments or reading on mobile screens under direct sunlight can read comfortably.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              className="px-4 py-2 rounded font-semibold text-xs neo-border"
              style={{ backgroundColor: fgHex, color: bgHex, borderColor: fgHex }}
            >
              Interactive Button
            </button>
            <span
              className="text-xs px-2.5 py-1 rounded neo-border"
              style={{ borderColor: fgHex }}
            >
              Bordered Badge
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
