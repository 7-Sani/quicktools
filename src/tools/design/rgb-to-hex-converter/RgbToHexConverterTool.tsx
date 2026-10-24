"use client";

import React, { useState, useMemo } from "react";
import {
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { rgbToHex } from "../colorUtils";

export default function RgbToHexConverterTool() {
  const [r, setR] = useState(49);
  const [g, setG] = useState(92);
  const [b, setB] = useState(255);
  const [alpha, setAlpha] = useState(1);
  const [pasteString, setPasteString] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Compute HEX codes
  const hex6 = useMemo(() => {
    return rgbToHex(r, g, b);
  }, [r, g, b]);

  const hex8 = useMemo(() => {
    return rgbToHex(r, g, b, alpha);
  }, [r, g, b, alpha]);

  const rgbaString = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;

  // Parse pasted rgb(r, g, b) string
  const handlePasteChange = (val: string) => {
    setPasteString(val);
    const match = val.match(/rgba?\(?\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?\s*\)?/i);
    if (match) {
      setR(Math.min(255, Math.max(0, parseInt(match[1]))));
      setG(Math.min(255, Math.max(0, parseInt(match[2]))));
      setB(Math.min(255, Math.max(0, parseInt(match[3]))));
      if (match[4] !== undefined) {
        setAlpha(Math.min(1, Math.max(0, parseFloat(match[4]))));
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleReset = () => {
    setR(49);
    setG(92);
    setB(255);
    setAlpha(1);
    setPasteString("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <RefreshCw size={14} /> RGB &amp; RGBA to HEX Converter
          </span>
          <span className="text-xs text-text-secondary">
            Converts channel values (0–255) to 6-digit &amp; 8-digit HEX
          </span>
        </div>

        <button
          onClick={handleReset}
          className="text-xs px-2.5 py-1.5 neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: RGB Sliders & Inputs (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            <div className="font-heading font-bold uppercase text-xs text-text-secondary border-b-2 border-border pb-2 flex items-center justify-between">
              <span>RGB Channel Inputs</span>
              <span className="text-[11px] font-normal lowercase">drag sliders or type values</span>
            </div>

            {/* Quick Paste String Input */}
            <div className="space-y-1">
              <label className="font-heading font-bold uppercase text-[11px] text-text-secondary">
                Paste rgb(...) String (Optional)
              </label>
              <input
                type="text"
                value={pasteString}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="e.g. rgb(49, 92, 255) or 49, 92, 255"
                className="w-full neo-input py-1 px-2.5 text-xs font-mono"
              />
            </div>

            {/* Red Channel */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-red-600">Red (0–255)</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={r}
                  onChange={(e) => setR(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-16 neo-input py-0.5 px-2 text-xs font-mono text-right"
                />
              </div>
              <input
                type="range"
                min={0}
                max={255}
                value={r}
                onChange={(e) => setR(parseInt(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>

            {/* Green Channel */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-emerald-600">Green (0–255)</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={g}
                  onChange={(e) => setG(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-16 neo-input py-0.5 px-2 text-xs font-mono text-right"
                />
              </div>
              <input
                type="range"
                min={0}
                max={255}
                value={g}
                onChange={(e) => setG(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Blue Channel */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-blue-600">Blue (0–255)</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={b}
                  onChange={(e) => setB(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-16 neo-input py-0.5 px-2 text-xs font-mono text-right"
                />
              </div>
              <input
                type="range"
                min={0}
                max={255}
                value={b}
                onChange={(e) => setB(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Alpha */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-text-secondary">Alpha (Opacity 0–1)</span>
                <span className="font-mono font-bold text-accent">
                  {Math.round(alpha * 100)}% ({alpha.toFixed(2)})
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Swatch & HEX Outputs (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            {/* Color Swatch */}
            <div className="relative aspect-video rounded-lg neo-border overflow-hidden bg-[repeating-conic-gradient(#cbd5e1_0%_25%,#f8fafc_0%_50%)] bg-[length:16px_16px]">
              <div
                className="w-full h-full flex flex-col justify-end p-4 transition-colors"
                style={{ backgroundColor: rgbaString }}
              >
                <div className="bg-black/70 backdrop-blur-md text-white p-2.5 rounded neo-border border-white/20 flex items-center justify-between">
                  <span className="font-mono font-bold text-base">{hex6}</span>
                  <span className="font-mono text-xs opacity-80">{rgbaString}</span>
                </div>
              </div>
            </div>

            {/* HEX Syntaxes Output List */}
            <div className="space-y-2.5 pt-1">
              {[
                { id: "hex-upper", label: "HEX (Uppercase)", val: hex6 },
                { id: "hex-lower", label: "HEX (Lowercase)", val: hex6.toLowerCase() },
                { id: "hex8", label: "HEX with Alpha (8-Digit)", val: hex8 },
                {
                  id: "css-var",
                  label: "CSS Variable Syntax",
                  val: `--color-primary: ${hex6};`,
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
    </div>
  );
}
