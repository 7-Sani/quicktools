"use client";

import React, { useState, useMemo } from "react";
import {
  Sliders,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
} from "lucide-react";
import { hslToRgb, rgbToHex } from "../colorUtils";

const PRESET_HSLS = [
  { name: "Royal Blue", h: 227, s: 100, l: 60 },
  { name: "Vibrant Emerald", h: 160, s: 84, l: 39 },
  { name: "Sunset Orange", h: 24, s: 95, l: 53 },
  { name: "Electric Purple", h: 262, s: 83, l: 58 },
  { name: "Neon Pink", h: 330, s: 81, l: 60 },
  { name: "Crimson Red", h: 355, s: 78, l: 60 },
];

export default function HslColorConverterTool() {
  const [h, setH] = useState(227);
  const [s, setS] = useState(100);
  const [l, setL] = useState(60);
  const [alpha, setAlpha] = useState(1);
  const [pasteString, setPasteString] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Convert HSL to RGB
  const rgb = useMemo(() => {
    return hslToRgb(h, s, l, alpha);
  }, [h, s, l, alpha]);

  const hexValue = useMemo(() => {
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }, [rgb]);

  const hexAlphaValue = useMemo(() => {
    return rgbToHex(rgb.r, rgb.g, rgb.b, alpha);
  }, [rgb, alpha]);

  const hslCss = `hsl(${h}, ${s}%, ${l}%)`;
  const hslaCss = `hsla(${h}, ${s}%, ${l}%, ${alpha.toFixed(2)})`;
  const rgbCss = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const rgbaCss = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`;

  // Parse pasted HSL string
  const handlePasteChange = (val: string) => {
    setPasteString(val);
    const match = val.match(/hsla?\(?\s*(\d{1,3})\s*(?:deg)?\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%(?:\s*,\s*([\d.]+))?\s*\)?/i);
    if (match) {
      setH(Math.min(360, Math.max(0, parseInt(match[1]))));
      setS(Math.min(100, Math.max(0, parseInt(match[2]))));
      setL(Math.min(100, Math.max(0, parseInt(match[3]))));
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
    setH(227);
    setS(100);
    setL(60);
    setAlpha(1);
    setPasteString("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Sliders size={14} /> HSL &amp; HSLA Color Converter
          </span>
          <span className="text-xs text-text-secondary">
            Hue (0–360°) • Saturation (0–100%) • Lightness (0–100%)
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
        {/* Left: Sliders with Gradient Tracks (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            <div className="font-heading font-bold uppercase text-xs text-text-secondary border-b-2 border-border pb-2 flex items-center justify-between">
              <span>HSL Component Controls</span>
              <span className="text-[11px] font-normal lowercase">instant sync</span>
            </div>

            {/* Quick paste */}
            <div className="space-y-1">
              <label className="font-heading font-bold uppercase text-[11px] text-text-secondary">
                Paste hsl(...) String (Optional)
              </label>
              <input
                type="text"
                value={pasteString}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="e.g. hsl(227, 100%, 60%)"
                className="w-full neo-input py-1 px-2.5 text-xs font-mono"
              />
            </div>

            {/* Hue Slider (with rainbow track) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span>Hue (H):</span>
                <span className="text-accent">{h}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={h}
                onChange={(e) => setH(parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                }}
              />
            </div>

            {/* Saturation Slider (with grayscale to saturated track) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span>Saturation (S):</span>
                <span>{s}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={s}
                onChange={(e) => setS(parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`,
                }}
              />
            </div>

            {/* Lightness Slider (with black to white track) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span>Lightness (L):</span>
                <span>{l}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={l}
                onChange={(e) => setL(parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #000000, hsl(${h}, ${s}%, 50%), #ffffff)`,
                }}
              />
            </div>

            {/* Alpha Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span>Alpha (Opacity):</span>
                <span>{Math.round(alpha * 100)}% ({alpha.toFixed(2)})</span>
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

          {/* Preset Buttons */}
          <div className="neo-card p-4 space-y-2">
            <span className="font-heading font-bold uppercase text-[11px] text-text-secondary block">
              Sample HSL Presets:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_HSLS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setH(preset.h);
                    setS(preset.s);
                    setL(preset.l);
                    setAlpha(1);
                  }}
                  className="p-2 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1.5 text-left"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full neo-border shrink-0"
                    style={{ backgroundColor: `hsl(${preset.h}, ${preset.s}%, ${preset.l}%)` }}
                  />
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Swatch & Outputs (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            {/* Swatch */}
            <div className="relative aspect-video rounded-lg neo-border overflow-hidden bg-[repeating-conic-gradient(#cbd5e1_0%_25%,#f8fafc_0%_50%)] bg-[length:16px_16px]">
              <div
                className="w-full h-full flex flex-col justify-end p-4 transition-colors"
                style={{ backgroundColor: hslaCss }}
              >
                <div className="bg-black/70 backdrop-blur-md text-white p-2.5 rounded neo-border border-white/20 flex items-center justify-between">
                  <span className="font-mono font-bold text-sm">{hslCss}</span>
                  <span className="font-mono text-xs opacity-80">{hexAlphaValue}</span>
                </div>
              </div>
            </div>

            {/* Generated Formats */}
            <div className="space-y-2.5 pt-1">
              {[
                { id: "hsl", label: "CSS hsl()", val: hslCss },
                { id: "hsla", label: "CSS hsla()", val: hslaCss },
                { id: "hex", label: "HEX Code", val: hexValue },
                { id: "hex-alpha", label: "HEX with Alpha (8-Digit)", val: hexAlphaValue },
                { id: "rgb", label: "RGB Syntax", val: rgbCss },
                { id: "rgba", label: "RGBA Syntax", val: rgbaCss },
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
