"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { hexToRgb, rgbToHex } from "../colorUtils";

const PRESET_HEX = [
  "#315CFF",
  "#10B981",
  "#F59E0B",
  "#E84855",
  "#8B5CF6",
  "#06B6D4",
  "#111827",
  "#F8FAFC",
];

export default function HexToRgbConverterTool() {
  const [hexInput, setHexInput] = useState("#315CFF");
  const [copied, setCopied] = useState<string | null>(null);

  // Parse HEX
  const parsed = useMemo(() => {
    return hexToRgb(hexInput);
  }, [hexInput]);

  const isValid = parsed !== null;
  const rgb = parsed || { r: 49, g: 92, b: 255, a: 1 };
  const alpha = rgb.a ?? 1;

  // Formatted Strings
  const rgbCss = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const rgbaCss = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`;
  const rgbPercentCss = `rgb(${Math.round((rgb.r / 255) * 100)}%, ${Math.round((rgb.g / 255) * 100)}%, ${Math.round((rgb.b / 255) * 100)}%)`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleSliderChange = (channel: "r" | "g" | "b" | "a", val: number) => {
    const newRgb = { ...rgb, [channel]: val };
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b, newRgb.a);
    setHexInput(newHex);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <ArrowRightLeft size={14} /> HEX to RGB &amp; RGBA Converter
          </span>
          <span className="text-xs text-text-secondary">
            Supports #RGB, #RRGGBB, and #RRGGBBAA formats
          </span>
        </div>

        <button
          onClick={() => setHexInput("#315CFF")}
          className="text-xs px-2.5 py-1.5 neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Input & Preview Swatch (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="neo-card p-5 space-y-4">
            {/* Live Color Swatch */}
            <div className="relative aspect-video rounded-lg neo-border overflow-hidden bg-[repeating-conic-gradient(#cbd5e1_0%_25%,#f8fafc_0%_50%)] bg-[length:16px_16px]">
              <div
                className="w-full h-full flex flex-col justify-end p-4 transition-colors"
                style={{ backgroundColor: rgbaCss }}
              >
                <div className="bg-black/70 backdrop-blur-md text-white p-2.5 rounded neo-border border-white/20 flex items-center justify-between">
                  <span className="font-mono font-bold text-sm">{hexInput.toUpperCase()}</span>
                  <span className="font-mono text-xs opacity-80">{rgbaCss}</span>
                </div>
              </div>
            </div>

            {/* HEX Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-heading font-bold uppercase text-text-secondary">
                  HEX Color Code
                </label>
                {isValid ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 size={12} /> Valid HEX
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold flex items-center gap-1 text-[11px]">
                    <AlertTriangle size={12} /> Invalid HEX
                  </span>
                )}
              </div>

              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value.trim())}
                placeholder="#315CFF or #315CFFAA"
                className="w-full neo-input py-2 px-3 font-mono font-bold text-base"
              />
            </div>

            {/* Presets */}
            <div className="space-y-2 pt-1 border-t-2 border-border">
              <span className="font-heading font-bold uppercase text-[11px] text-text-secondary">
                Sample Palettes:
              </span>
              <div className="grid grid-cols-8 gap-1.5">
                {PRESET_HEX.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => setHexInput(hex)}
                    className="aspect-square rounded neo-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: RGB Sliders & Outputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sliders Card */}
          <div className="neo-card p-5 space-y-3">
            <div className="font-heading font-bold uppercase text-xs text-text-secondary border-b-2 border-border pb-2">
              Color Channel Sliders (0–255)
            </div>

            {/* Red */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-red-600">Red (R):</span>
                <span>{rgb.r}</span>
              </div>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb.r}
                onChange={(e) => handleSliderChange("r", parseInt(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>

            {/* Green */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-emerald-600">Green (G):</span>
                <span>{rgb.g}</span>
              </div>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) => handleSliderChange("g", parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Blue */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-blue-600">Blue (B):</span>
                <span>{rgb.b}</span>
              </div>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) => handleSliderChange("b", parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Alpha */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-text-secondary">Alpha (Opacity):</span>
                <span>{Math.round(alpha * 100)}% ({alpha.toFixed(2)})</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={alpha}
                onChange={(e) => handleSliderChange("a", parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>
          </div>

          {/* Formatted Output Results */}
          <div className="neo-card p-5 space-y-3">
            <div className="font-heading font-bold uppercase text-xs text-text-secondary border-b-2 border-border pb-2 flex items-center justify-between">
              <span>RGB Output Syntaxes</span>
              <span className="text-[11px] font-normal lowercase">ready to copy into CSS</span>
            </div>

            {[
              { id: "rgb", label: "CSS rgb() Syntax", val: rgbCss },
              { id: "rgba", label: "CSS rgba() Syntax", val: rgbaCss },
              { id: "percent", label: "RGB Percentages", val: rgbPercentCss },
              {
                id: "separated",
                label: "Comma Separated Values",
                val: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
              },
            ].map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2.5 rounded neo-border bg-surface hover:bg-accent/5 transition-colors gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-bold text-[11px] uppercase text-text-secondary">
                    {f.label}
                  </div>
                  <div className="font-mono text-xs font-bold text-text truncate">
                    {f.val}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(f.val, f.id)}
                  className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  {copied === f.id ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copied === f.id ? "Copied" : "Copy"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
