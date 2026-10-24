"use client";

import { useState } from "react";
import {
  Palette,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Info,
  Sparkles,
} from "lucide-react";
import { calculateContrastRatio } from "@/lib/a11yUtils";

export default function AccessibleColorPairPreviewTool() {
  const [textColors, setTextColors] = useState<string[]>([
    "#0F172A", // Dark Slate
    "#2563EB", // Blue
    "#64748B", // Slate-500
    "#FFFFFF", // White
  ]);

  const [bgColors, setBgColors] = useState<string[]>([
    "#FFFFFF", // Pure White
    "#F8FAFC", // Light Slate
    "#0F172A", // Dark Slate
    "#1E293B", // Slate-800
  ]);

  const [activeFg, setActiveFg] = useState<string>("#0F172A");
  const [activeBg, setActiveBg] = useState<string>("#FFFFFF");
  const [copied, setCopied] = useState(false);

  // Palettes presets
  const handleApplyPreset = (preset: { text: string[]; bg: string[] }) => {
    setTextColors(preset.text);
    setBgColors(preset.bg);
    setActiveFg(preset.text[0]);
    setActiveBg(preset.bg[0]);
  };

  const handleReset = () => {
    setTextColors(["#0F172A", "#2563EB", "#64748B", "#FFFFFF"]);
    setBgColors(["#FFFFFF", "#F8FAFC", "#0F172A", "#1E293B"]);
    setActiveFg("#0F172A");
    setActiveBg("#FFFFFF");
  };

  const handleCopyCss = () => {
    const lines = [
      "/* Accessible Design System Color Pairs */",
      ":root {",
      ...textColors.map((c, i) => `  --color-text-${i + 1}: ${c};`),
      ...bgColors.map((c, i) => `  --color-bg-${i + 1}: ${c};`),
      "}",
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPairRatio = calculateContrastRatio(activeFg, activeBg);

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-teal-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <strong>Design System Color Matrix:</strong> Test your UI color palette across multiple background permutations simultaneously. Click any cell in the matrix to preview component rendering.
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase text-text-secondary mr-1">
          Preset Palettes:
        </span>
        <button
          onClick={() =>
            handleApplyPreset({
              text: ["#0F172A", "#0369A1", "#475569", "#FFFFFF"],
              bg: ["#FFFFFF", "#F0F9FF", "#0C4A6E", "#0F172A"],
            })
          }
          className="neo-btn text-xs px-2.5 py-1 bg-surface hover:bg-gray-100 flex items-center gap-1 font-bold"
        >
          <Sparkles className="w-3 h-3 text-amber-500" /> Ocean SaaS
        </button>
        <button
          onClick={() =>
            handleApplyPreset({
              text: ["#000000", "#DC2626", "#16A34A", "#FFFFFF"],
              bg: ["#FFFFFF", "#FEF08A", "#18181B", "#000000"],
            })
          }
          className="neo-btn text-xs px-2.5 py-1 bg-surface hover:bg-gray-100 flex items-center gap-1 font-bold"
        >
          <Sparkles className="w-3 h-3 text-amber-500" /> Neo-Brutalist
        </button>
        <button
          onClick={() =>
            handleApplyPreset({
              text: ["#22C55E", "#38BDF8", "#F8FAFC", "#94A3B8"],
              bg: ["#022C22", "#0F172A", "#000000", "#1E293B"],
            })
          }
          className="neo-btn text-xs px-2.5 py-1 bg-surface hover:bg-gray-100 flex items-center gap-1 font-bold"
        >
          <Sparkles className="w-3 h-3 text-amber-500" /> Terminal Dark
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Matrix Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" /> Accessibility Contrast Matrix
              </h2>
              <button
                onClick={handleCopyCss}
                className="neo-btn text-xs px-3 py-1.5 bg-primary text-white flex items-center gap-1 font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied CSS!" : "Copy CSS Tokens"}
              </button>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border border-dark text-left bg-surface/50 font-bold uppercase text-[10px]">
                      Text \ BG
                    </th>
                    {bgColors.map((bg, bIndex) => (
                      <th
                        key={bIndex}
                        className="p-2 border border-dark font-mono text-[11px] font-bold"
                        style={{ backgroundColor: bg, color: calculateContrastRatio("#000000", bg).ratio > 4.5 ? "#000000" : "#FFFFFF" }}
                      >
                        {bg}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {textColors.map((fg, fIndex) => (
                    <tr key={fIndex}>
                      <td
                        className="p-2 border border-dark text-left font-mono text-[11px] font-bold"
                        style={{ backgroundColor: fg, color: calculateContrastRatio("#000000", fg).ratio > 4.5 ? "#000000" : "#FFFFFF" }}
                      >
                        {fg}
                      </td>
                      {bgColors.map((bg, bIndex) => {
                        const { ratio, aaNormal, aaLarge } = calculateContrastRatio(fg, bg);
                        const isSelected = activeFg === fg && activeBg === bg;

                        return (
                          <td
                            key={bIndex}
                            onClick={() => {
                              setActiveFg(fg);
                              setActiveBg(bg);
                            }}
                            className={`p-2.5 border border-dark cursor-pointer transition-all ${
                              isSelected ? "ring-2 ring-primary ring-inset font-black" : "hover:opacity-90"
                            }`}
                            style={{ backgroundColor: bg, color: fg }}
                          >
                            <div className="font-mono font-bold text-xs">{ratio}:1</div>
                            <span
                              className={`text-[9px] font-bold px-1 py-0.2 rounded inline-block mt-0.5 ${
                                aaNormal
                                  ? "bg-emerald-600 text-white"
                                  : aaLarge
                                  ? "bg-amber-500 text-black"
                                  : "bg-rose-600 text-white"
                              }`}
                            >
                              {aaNormal ? "AA PASS" : aaLarge ? "AA LARGE" : "FAIL"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Color List Customizers */}
            <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-dark/10 text-xs">
              <div>
                <label className="font-bold uppercase text-text-secondary block mb-1">
                  Text Colors (Row Headers)
                </label>
                <div className="flex flex-wrap gap-2">
                  {textColors.map((c, i) => (
                    <div key={i} className="flex items-center gap-1 bg-surface p-1 neo-border rounded">
                      <input
                        type="color"
                        value={c}
                        onChange={(e) => {
                          const updated = [...textColors];
                          updated[i] = e.target.value;
                          setTextColors(updated);
                        }}
                        className="w-5 h-5 rounded cursor-pointer"
                      />
                      <span className="font-mono text-[11px]">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-text-secondary block mb-1">
                  Background Colors (Column Headers)
                </label>
                <div className="flex flex-wrap gap-2">
                  {bgColors.map((c, i) => (
                    <div key={i} className="flex items-center gap-1 bg-surface p-1 neo-border rounded">
                      <input
                        type="color"
                        value={c}
                        onChange={(e) => {
                          const updated = [...bgColors];
                          updated[i] = e.target.value;
                          setBgColors(updated);
                        }}
                        className="w-5 h-5 rounded cursor-pointer"
                      />
                      <span className="font-mono text-[11px]">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-1.5 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Palette
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Pair Preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Selected Color Pair Details
            </h3>

            {/* Score */}
            <div className="p-4 bg-surface/50 neo-border rounded-xl text-center space-y-1">
              <div className="text-3xl font-black font-mono text-primary">
                {currentPairRatio.ratio}:1
              </div>
              <span className="text-xs font-bold text-gray-700 block">
                {currentPairRatio.aaNormal ? "Passes WCAG AA Normal Text" : "Fails AA Normal Text"}
              </span>
              <span className="text-[11px] font-mono text-text-secondary block">
                {activeFg} on {activeBg}
              </span>
            </div>

            {/* Live Component Box */}
            <div
              className="p-5 rounded-xl border-2 border-dark space-y-3 transition-colors"
              style={{ backgroundColor: activeBg, color: activeFg }}
            >
              <h4 className="font-bold text-base">Interactive Card Title</h4>
              <p className="text-xs leading-relaxed">
                Clicking any cell in the matrix loads that combination right into this live card component.
              </p>
              <div className="pt-2 flex gap-2">
                <button
                  className="px-3 py-1 text-xs font-bold rounded border"
                  style={{ borderColor: activeFg, color: activeFg }}
                >
                  Primary Action
                </button>
              </div>
            </div>

            {/* WCAG Badges List */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center p-2 bg-surface/30 neo-border rounded">
                <span>WCAG AA Normal:</span>
                <span className={`font-bold ${currentPairRatio.aaNormal ? "text-emerald-700" : "text-rose-600"}`}>
                  {currentPairRatio.aaNormal ? "PASS (≥4.5)" : "FAIL"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-surface/30 neo-border rounded">
                <span>WCAG AA Large:</span>
                <span className={`font-bold ${currentPairRatio.aaLarge ? "text-emerald-700" : "text-rose-600"}`}>
                  {currentPairRatio.aaLarge ? "PASS (≥3.0)" : "FAIL"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-surface/30 neo-border rounded">
                <span>WCAG AAA Normal:</span>
                <span className={`font-bold ${currentPairRatio.aaaNormal ? "text-emerald-700" : "text-rose-600"}`}>
                  {currentPairRatio.aaaNormal ? "PASS (≥7.0)" : "FAIL"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
