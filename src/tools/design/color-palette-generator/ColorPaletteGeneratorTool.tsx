"use client";

import React, { useState, useMemo } from "react";
import {
  Palette,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  Download,
  Sparkles,
  Sliders,
} from "lucide-react";
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex, getTintsAndShades } from "../colorUtils";

interface SwatchItem {
  id: string;
  hex: string;
  locked: boolean;
}

const PRESET_MODES = [
  "Random Palette",
  "Analogous",
  "Monochromatic",
  "Triadic",
  "Complementary",
  "Pastel Vibe",
];

export default function ColorPaletteGeneratorTool() {
  const [swatches, setSwatches] = useState<SwatchItem[]>([
    { id: "1", hex: "#315CFF", locked: false },
    { id: "2", hex: "#6366F1", locked: false },
    { id: "3", hex: "#8B5CF6", locked: false },
    { id: "4", hex: "#D946EF", locked: false },
    { id: "5", hex: "#F43F5E", locked: false },
  ]);
  const [activeMode, setActiveMode] = useState("Random Palette");
  const [selectedSwatchHex, setSelectedSwatchHex] = useState("#315CFF");
  const [copied, setCopied] = useState<string | null>(null);

  // Generate random HEX
  const getRandomHex = (isPastel = false) => {
    if (isPastel) {
      const h = Math.floor(Math.random() * 360);
      const s = 65 + Math.floor(Math.random() * 25);
      const l = 75 + Math.floor(Math.random() * 15);
      const rgb = hslToRgb(h, s, l);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    }
    const h = Math.floor(Math.random() * 360);
    const s = 60 + Math.floor(Math.random() * 40);
    const l = 40 + Math.floor(Math.random() * 35);
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  // Generate new palette based on activeMode
  const generatePalette = (mode = activeMode) => {
    const baseHue = Math.floor(Math.random() * 360);

    setSwatches((prev) => {
      return prev.map((swatch, idx) => {
        if (swatch.locked) return swatch;

        if (mode === "Pastel Vibe") {
          return { ...swatch, hex: getRandomHex(true) };
        }

        if (mode === "Monochromatic") {
          const l = 20 + idx * 16;
          const rgb = hslToRgb(baseHue, 75, l);
          return { ...swatch, hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
        }

        if (mode === "Analogous") {
          const h = (baseHue + (idx - 2) * 25 + 360) % 360;
          const rgb = hslToRgb(h, 80, 55);
          return { ...swatch, hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
        }

        if (mode === "Complementary") {
          const h = idx < 3 ? (baseHue + idx * 15) % 360 : (baseHue + 180 + (idx - 3) * 15) % 360;
          const rgb = hslToRgb(h, 80, 50 + (idx % 2) * 10);
          return { ...swatch, hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
        }

        if (mode === "Triadic") {
          const h = (baseHue + (idx % 3) * 120 + Math.floor(idx / 3) * 20) % 360;
          const rgb = hslToRgb(h, 80, 55);
          return { ...swatch, hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
        }

        // Random modern
        return { ...swatch, hex: getRandomHex(false) };
      });
    });
  };

  const toggleLock = (id: string) => {
    setSwatches(
      swatches.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s))
    );
  };

  const updateSwatchHex = (id: string, hex: string) => {
    setSwatches(swatches.map((s) => (s.id === id ? { ...s, hex } : s)));
    setSelectedSwatchHex(hex);
  };

  // Tints and shades for selected swatch
  const { tints, shades } = useMemo(() => {
    return getTintsAndShades(selectedSwatchHex, 5);
  }, [selectedSwatchHex]);

  // CSS variables text
  const cssVariables = useMemo(() => {
    return `:root {\n${swatches.map((s, i) => `  --color-${i + 1}: ${s.hex};`).join("\n")}\n}`;
  }, [swatches]);

  const jsonArray = useMemo(() => {
    return JSON.stringify(swatches.map((s) => s.hex), null, 2);
  }, [swatches]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([cssVariables], { type: "text/css;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "color-palette.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Generation Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Palette size={14} /> 5-Color Harmony Palette Generator
          </span>
          <span className="text-xs text-text-secondary">
            Lock favorites, generate harmonies, and export CSS tokens
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => generatePalette()}
            className="neo-btn neo-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <RefreshCw size={13} /> Generate New Palette
          </button>
        </div>
      </div>

      {/* Mode Buttons */}
      <div className="neo-card p-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-heading font-bold uppercase text-text-secondary mr-1">
          Harmony Rule:
        </span>
        {PRESET_MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setActiveMode(mode);
              generatePalette(mode);
            }}
            className={`px-2.5 py-1 neo-border rounded font-semibold transition-colors ${
              activeMode === mode
                ? "bg-accent text-white"
                : "bg-surface hover:bg-accent/10"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Main Palette 5-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {swatches.map((swatch, idx) => (
          <div
            key={swatch.id}
            onClick={() => setSelectedSwatchHex(swatch.hex)}
            className={`neo-card overflow-hidden flex flex-col cursor-pointer transition-transform hover:-translate-y-1 ${
              selectedSwatchHex === swatch.hex ? "ring-2 ring-accent" : ""
            }`}
          >
            {/* Color Swatch Block */}
            <div
              className="h-44 w-full relative p-3 flex flex-col justify-between transition-colors"
              style={{ backgroundColor: swatch.hex }}
            >
              <div className="flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(swatch.id);
                  }}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  title={swatch.locked ? "Unlock color" : "Lock color"}
                >
                  {swatch.locked ? <Lock size={14} /> : <Unlock size={14} className="opacity-60" />}
                </button>
              </div>

              <span className="text-[11px] font-mono font-bold bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded self-start">
                #{idx + 1}
              </span>
            </div>

            {/* Swatch Controls */}
            <div className="p-3 bg-surface space-y-2 border-t-2 border-border">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs uppercase">{swatch.hex}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(swatch.hex, swatch.id);
                  }}
                  className="text-text-secondary hover:text-accent p-1"
                  title="Copy HEX"
                >
                  {copied === swatch.id ? (
                    <Check size={13} className="text-emerald-600" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={swatch.hex}
                  onChange={(e) => updateSwatchHex(swatch.id, e.target.value.toUpperCase())}
                  className="w-6 h-6 rounded neo-border cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={swatch.hex}
                  onChange={(e) => updateSwatchHex(swatch.id, e.target.value.toUpperCase())}
                  className="w-full neo-input py-0.5 px-1.5 text-[11px] font-mono"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Swatch Tints & Shades */}
      <div className="neo-card p-4 space-y-3">
        <div className="font-heading font-bold text-xs uppercase text-text-secondary border-b-2 border-border pb-2 flex items-center justify-between">
          <span>Tints &amp; Shades for {selectedSwatchHex}</span>
          <span className="text-[11px] font-normal lowercase">click any swatch to inspect</span>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-2 h-10">
            {tints.map((hex) => (
              <button
                key={hex}
                onClick={() => setSelectedSwatchHex(hex)}
                className="rounded neo-border text-[10px] font-mono font-bold text-black/80 flex items-center justify-center hover:scale-105 transition-transform"
                style={{ backgroundColor: hex }}
              >
                {hex}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 h-10">
            {shades.map((hex) => (
              <button
                key={hex}
                onClick={() => setSelectedSwatchHex(hex)}
                className="rounded neo-border text-[10px] font-mono font-bold text-white/90 flex items-center justify-center hover:scale-105 transition-transform"
                style={{ backgroundColor: hex }}
              >
                {hex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="neo-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border pb-2.5">
          <span className="font-heading font-bold uppercase text-xs text-text-secondary">
            Palette Export Formats
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(cssVariables, "css-vars")}
              className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1"
            >
              {copied === "css-vars" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied === "css-vars" ? "Copied" : "Copy CSS Variables"}</span>
            </button>
            <button
              onClick={() => handleCopy(jsonArray, "json")}
              className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1"
            >
              {copied === "json" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied === "json" ? "Copied" : "Copy JSON"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1"
            >
              <Download size={12} />
              <span>Download .css</span>
            </button>
          </div>
        </div>

        <pre className="p-3 neo-border rounded bg-surface font-mono text-xs overflow-x-auto text-text leading-relaxed">
          {cssVariables}
        </pre>
      </div>
    </div>
  );
}
