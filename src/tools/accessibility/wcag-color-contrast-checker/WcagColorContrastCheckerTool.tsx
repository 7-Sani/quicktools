"use client";

import { useState, useMemo } from "react";
import {
  Contrast,
  Copy,
  Check,
  RotateCcw,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
} from "lucide-react";
import { calculateContrastRatio, WcagCompliance } from "@/lib/a11yUtils";

export default function WcagColorContrastCheckerTool() {
  const [fgColor, setFgColor] = useState<string>("#1E293B"); // Slate-800
  const [bgColor, setBgColor] = useState<string>("#F8FAFC"); // Slate-50
  const [copied, setCopied] = useState(false);

  // Quick accessible presets
  const PRESETS = [
    { name: "Slate on Light", fg: "#0F172A", bg: "#F8FAFC" },
    { name: "Navy & Gold", fg: "#FACC15", bg: "#0F172A" },
    { name: "Teal Brand", fg: "#042F2E", bg: "#CCFBF1" },
    { name: "Pure Contrast", fg: "#000000", bg: "#FFFFFF" },
    { name: "Terminal Green", fg: "#4ADE80", bg: "#052E16" },
  ];

  const compliance: WcagCompliance = useMemo(() => {
    return calculateContrastRatio(fgColor, bgColor);
  }, [fgColor, bgColor]);

  const handleSwap = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  const handleReset = () => {
    setFgColor("#1E293B");
    setBgColor("#F8FAFC");
  };

  const handleCopyReport = () => {
    const report = `WCAG COLOR CONTRAST AUDIT:\n` +
      `---------------------------\n` +
      `Foreground Color: ${fgColor}\n` +
      `Background Color: ${bgColor}\n` +
      `Calculated Contrast Ratio: ${compliance.ratio}:1\n\n` +
      `WCAG 2.1 Standards Breakdown:\n` +
      `• Level AA Normal Text (≥4.5:1): ${compliance.aaNormal ? "PASS" : "FAIL"}\n` +
      `• Level AA Large Text (≥3.0:1): ${compliance.aaLarge ? "PASS" : "FAIL"}\n` +
      `• Level AAA Normal Text (≥7.0:1): ${compliance.aaaNormal ? "PASS" : "FAIL"}\n` +
      `• Level AAA Large Text (≥4.5:1): ${compliance.aaaLarge ? "PASS" : "FAIL"}\n` +
      `• UI Components / Icons (≥3.0:1): ${compliance.uiComponent ? "PASS" : "FAIL"}`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-teal-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <strong>WCAG 2.1 Contrast Standards:</strong> This tool calculates the exact relative luminance contrast ratio between foreground and background colors according to the W3C Web Content Accessibility Guidelines (WCAG 2.1).
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Color Controls & Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="neo-card p-6 bg-white space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Contrast className="w-5 h-5 text-primary" /> Color Selection
              </h2>
              <button
                onClick={handleSwap}
                className="neo-btn text-xs px-2.5 py-1.5 bg-surface hover:bg-gray-100 flex items-center gap-1 font-bold"
                title="Swap Foreground & Background"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Swap
              </button>
            </div>

            {/* Color Pickers Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Foreground (Text) */}
              <div className="p-4 bg-surface/50 neo-border rounded-lg space-y-2">
                <label className="text-xs font-bold uppercase text-text-secondary block">
                  Text / Foreground Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-2 border-dark"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="neo-input flex-1 p-2 text-sm font-mono font-bold uppercase"
                  />
                </div>
              </div>

              {/* Background */}
              <div className="p-4 bg-surface/50 neo-border rounded-lg space-y-2">
                <label className="text-xs font-bold uppercase text-text-secondary block">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-2 border-dark"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="neo-input flex-1 p-2 text-sm font-mono font-bold uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-1.5">
                Popular Accessible Color Pairs:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setFgColor(p.fg);
                      setBgColor(p.bg);
                    }}
                    className="neo-btn text-xs px-2.5 py-1 bg-surface hover:bg-gray-100 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" /> {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-dark/10">
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Default
              </button>
            </div>
          </div>

          {/* WCAG Explanation Table */}
          <div className="neo-card p-5 bg-white space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              WCAG 2.1 Contrast Ratio Requirements
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-surface/40 neo-border rounded">
                <span className="font-bold">WCAG AA Normal Text:</span>
                <span className="font-mono font-bold text-gray-800">Minimum 4.5:1</span>
              </div>
              <div className="flex justify-between p-2 bg-surface/40 neo-border rounded">
                <span className="font-bold">WCAG AA Large Text (≥18pt or 14pt bold):</span>
                <span className="font-mono font-bold text-gray-800">Minimum 3.0:1</span>
              </div>
              <div className="flex justify-between p-2 bg-surface/40 neo-border rounded">
                <span className="font-bold">WCAG AAA Normal Text (Enhanced):</span>
                <span className="font-mono font-bold text-gray-800">Minimum 7.0:1</span>
              </div>
              <div className="flex justify-between p-2 bg-surface/40 neo-border rounded">
                <span className="font-bold">WCAG UI Elements & Icons:</span>
                <span className="font-mono font-bold text-gray-800">Minimum 3.0:1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contrast Score & Live Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="neo-card p-6 bg-white space-y-5">
            {/* Contrast Hero Score */}
            <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
              <span className="text-xs font-bold uppercase text-text-secondary block">
                Contrast Ratio
              </span>
              <div className="text-5xl font-black font-mono text-primary">
                {compliance.ratio}:1
              </div>
              <span className="text-xs font-bold text-gray-700 block">
                {compliance.aaNormal ? "Passes Standard AA" : "Fails Standard AA Normal Text"}
              </span>
            </div>

            {/* Compliance Matrix Checklist */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-3 neo-border rounded-lg flex items-center justify-between ${
                compliance.aaNormal ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"
              }`}>
                <div>
                  <span className="font-bold block">AA Normal Text</span>
                  <span className="text-[10px] opacity-80">&gt;= 4.5:1</span>
                </div>
                {compliance.aaNormal ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
              </div>

              <div className={`p-3 neo-border rounded-lg flex items-center justify-between ${
                compliance.aaLarge ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"
              }`}>
                <div>
                  <span className="font-bold block">AA Large Text</span>
                  <span className="text-[10px] opacity-80">&gt;= 3.0:1 (18pt+)</span>
                </div>
                {compliance.aaLarge ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
              </div>

              <div className={`p-3 neo-border rounded-lg flex items-center justify-between ${
                compliance.aaaNormal ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"
              }`}>
                <div>
                  <span className="font-bold block">AAA Normal Text</span>
                  <span className="text-[10px] opacity-80">&gt;= 7.0:1</span>
                </div>
                {compliance.aaaNormal ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
              </div>

              <div className={`p-3 neo-border rounded-lg flex items-center justify-between ${
                compliance.uiComponent ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"
              }`}>
                <div>
                  <span className="font-bold block">UI Components</span>
                  <span className="text-[10px] opacity-80">&gt;= 3.0:1</span>
                </div>
                {compliance.uiComponent ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
              </div>
            </div>

            {/* Live Component Preview */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-text-secondary block">
                Live UI Rendering Preview
              </span>

              <div
                className="p-5 rounded-xl border-2 border-dark space-y-3 transition-colors"
                style={{ backgroundColor: bgColor, color: fgColor }}
              >
                <h3 className="text-xl font-bold tracking-tight">
                  Headline Text Sample (Large 20px)
                </h3>
                <p className="text-sm leading-relaxed">
                  This paragraph demonstrates how body text renders on the selected background. Good contrast ensures reading clarity for users with low vision or color vision deficiencies.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    className="px-3 py-1.5 text-xs font-bold rounded border"
                    style={{ borderColor: fgColor, color: fgColor }}
                  >
                    Button Action
                  </button>
                  <span
                    className="px-2.5 py-0.5 text-xs font-bold rounded-full"
                    style={{ backgroundColor: fgColor + "25", color: fgColor }}
                  >
                    UI Badge
                  </span>
                </div>
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyReport}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Contrast Report!" : "Copy Contrast Audit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
