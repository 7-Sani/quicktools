"use client";

import React, { useState, useMemo } from "react";
import {
  Pipette,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Layers,
  Palette,
} from "lucide-react";
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToCmyk,
  getColorHarmonies,
  getTintsAndShades,
} from "../colorUtils";

const PRESET_PALETTES = [
  { name: "Accent Blue", hex: "#315CFF" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Amber Gold", hex: "#F59E0B" },
  { name: "Coral Red", hex: "#E84855" },
  { name: "Fuchsia", hex: "#D946EF" },
  { name: "Violet", hex: "#8B5CF6" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Dark Surface", hex: "#1E293B" },
];

export default function ColorPickerTool() {
  const [hexInput, setHexInput] = useState("#315CFF");
  const [alpha, setAlpha] = useState(1);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Parse color
  const rgb = useMemo(() => {
    return hexToRgb(hexInput) || { r: 49, g: 92, b: 255, a: 1 };
  }, [hexInput]);

  const hexValue = useMemo(() => {
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }, [rgb]);

  const hexAlphaValue = useMemo(() => {
    return rgbToHex(rgb.r, rgb.g, rgb.b, alpha);
  }, [rgb, alpha]);

  const hsl = useMemo(() => {
    return rgbToHsl(rgb.r, rgb.g, rgb.b, alpha);
  }, [rgb, alpha]);

  const hsv = useMemo(() => {
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
  }, [rgb]);

  const cmyk = useMemo(() => {
    return rgbToCmyk(rgb.r, rgb.g, rgb.b);
  }, [rgb]);

  // Formatted CSS Strings
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const rgbaString = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  const hslaString = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha.toFixed(2)})`;
  const hsvString = `hsv(${hsv.h}°, ${hsv.s}%, ${hsv.v}%)`;
  const cmykString = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

  // Color harmonies
  const harmonies = useMemo(() => {
    return getColorHarmonies(hexValue);
  }, [hexValue]);

  // Tints & Shades
  const { tints, shades } = useMemo(() => {
    return getTintsAndShades(hexValue, 6);
  }, [hexValue]);

  const handleCopy = (text: string, formatId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatId);
    setTimeout(() => setCopiedFormat(null), 1800);
  };

  const handleNativeEyeDropper = async () => {
    // Check if browser supports EyeDropper API
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          setHexInput(result.sRGBHex.toUpperCase());
        }
      } catch {
        // User cancelled eyedropper
      }
    }
  };

  const handleReset = () => {
    setHexInput("#315CFF");
    setAlpha(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Palette size={14} /> Comprehensive Color Inspector
          </span>
          <span className="text-xs text-text-secondary">
            HEX • RGB • HSL • HSV • CMYK • Harmonies
          </span>
        </div>

        <div className="flex items-center gap-2">
          {typeof window !== "undefined" && "EyeDropper" in window && (
            <button
              onClick={handleNativeEyeDropper}
              className="text-xs px-2.5 py-1.5 neo-border rounded bg-surface hover:bg-accent/10 font-semibold flex items-center gap-1.5"
            >
              <Pipette size={13} className="text-accent" /> EyeDropper Sample
            </button>
          )}
          <button
            onClick={handleReset}
            className="text-xs px-2.5 py-1.5 neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Main Interactive Color Studio */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Swatch & Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="neo-card p-5 space-y-4">
            {/* Visual Color Preview Swatch with Checkered Alpha Pattern */}
            <div className="relative aspect-video rounded-lg neo-border overflow-hidden bg-[repeating-conic-gradient(#cbd5e1_0%_25%,#f8fafc_0%_50%)] bg-[length:16px_16px]">
              <div
                className="w-full h-full flex flex-col justify-end p-4 transition-colors"
                style={{ backgroundColor: rgbaString }}
              >
                <div className="bg-black/70 backdrop-blur-md text-white p-2.5 rounded neo-border border-white/20 flex items-center justify-between">
                  <span className="font-mono font-bold text-sm">{hexAlphaValue}</span>
                  <span className="font-mono text-xs opacity-80">{rgbaString}</span>
                </div>
              </div>
            </div>

            {/* Native Color Picker & Hex Input */}
            <div className="flex items-center gap-3">
              <label className="w-12 h-12 rounded neo-border cursor-pointer shrink-0 overflow-hidden relative shadow-inner">
                <input
                  type="color"
                  value={hexValue}
                  onChange={(e) => setHexInput(e.target.value.toUpperCase())}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <div className="w-full h-full" style={{ backgroundColor: hexValue }} />
              </label>

              <div className="flex-1 space-y-1">
                <label className="font-heading font-bold uppercase text-[11px] text-text-secondary">
                  HEX Code
                </label>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  placeholder="#315CFF"
                  className="w-full neo-input py-1.5 px-3 font-mono font-bold text-sm"
                />
              </div>
            </div>

            {/* Opacity / Alpha Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold uppercase text-text-secondary">
                  Alpha / Opacity
                </span>
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

            {/* Quick Swatch Palette */}
            <div className="space-y-2 pt-1 border-t-2 border-border">
              <span className="font-heading font-bold uppercase text-[11px] text-text-secondary">
                Curated Presets:
              </span>
              <div className="grid grid-cols-8 gap-1.5">
                {PRESET_PALETTES.map((p) => (
                  <button
                    key={p.hex}
                    onClick={() => {
                      setHexInput(p.hex);
                      setAlpha(1);
                    }}
                    title={p.name}
                    className="aspect-square rounded neo-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: p.hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Color Values Table & Copy (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="neo-card p-5 space-y-3">
            <div className="font-heading font-bold uppercase text-xs text-text-secondary border-b-2 border-border pb-2 flex items-center justify-between">
              <span>CSS Color Formats</span>
              <span className="text-[11px] font-normal lowercase">click copy icon to use in code</span>
            </div>

            {/* Formats rows */}
            {[
              { id: "hex", label: "HEX", val: hexValue },
              { id: "hex-alpha", label: "HEX with Alpha", val: hexAlphaValue },
              { id: "rgb", label: "RGB", val: rgbString },
              { id: "rgba", label: "RGBA", val: rgbaString },
              { id: "hsl", label: "HSL", val: hslString },
              { id: "hsla", label: "HSLA", val: hslaString },
              { id: "hsv", label: "HSV", val: hsvString },
              { id: "cmyk", label: "CMYK (Print)", val: cmykString },
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
                  {copiedFormat === f.id ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copiedFormat === f.id ? "Copied" : "Copy"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color Harmonies & Color Theory */}
      <div className="neo-card p-5 space-y-4">
        <div className="font-heading font-bold text-xs uppercase text-text-secondary border-b-2 border-border pb-2.5 flex items-center gap-1.5">
          <Sparkles size={14} className="text-accent" /> Color Harmony Palettes (Click Swatch to Select)
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Complementary */}
          <div className="p-3 neo-border rounded bg-surface space-y-2">
            <span className="font-heading font-bold uppercase block text-text-secondary">
              Complementary (180°)
            </span>
            <div className="grid grid-cols-2 gap-2 h-14">
              <button
                onClick={() => setHexInput(hexValue)}
                className="rounded neo-border"
                style={{ backgroundColor: hexValue }}
                title={hexValue}
              />
              <button
                onClick={() => setHexInput(harmonies.complementary)}
                className="rounded neo-border"
                style={{ backgroundColor: harmonies.complementary }}
                title={harmonies.complementary}
              />
            </div>
            <div className="font-mono text-[11px] text-center font-bold text-text-secondary">
              {harmonies.complementary}
            </div>
          </div>

          {/* Analogous */}
          <div className="p-3 neo-border rounded bg-surface space-y-2">
            <span className="font-heading font-bold uppercase block text-text-secondary">
              Analogous (±30°)
            </span>
            <div className="grid grid-cols-3 gap-1.5 h-14">
              <button
                onClick={() => setHexInput(harmonies.analogous[0])}
                className="rounded neo-border"
                style={{ backgroundColor: harmonies.analogous[0] }}
                title={harmonies.analogous[0]}
              />
              <button
                onClick={() => setHexInput(hexValue)}
                className="rounded neo-border"
                style={{ backgroundColor: hexValue }}
                title={hexValue}
              />
              <button
                onClick={() => setHexInput(harmonies.analogous[1])}
                className="rounded neo-border"
                style={{ backgroundColor: harmonies.analogous[1] }}
                title={harmonies.analogous[1]}
              />
            </div>
            <div className="font-mono text-[10px] text-center text-text-secondary">
              {harmonies.analogous[0]} · {harmonies.analogous[1]}
            </div>
          </div>

          {/* Triadic */}
          <div className="p-3 neo-border rounded bg-surface space-y-2">
            <span className="font-heading font-bold uppercase block text-text-secondary">
              Triadic (120°)
            </span>
            <div className="grid grid-cols-3 gap-1.5 h-14">
              <button
                onClick={() => setHexInput(hexValue)}
                className="rounded neo-border"
                style={{ backgroundColor: hexValue }}
                title={hexValue}
              />
              <button
                onClick={() => setHexInput(harmonies.triadic[0])}
                className="rounded neo-border"
                style={{ backgroundColor: harmonies.triadic[0] }}
                title={harmonies.triadic[0]}
              />
              <button
                onClick={() => setHexInput(harmonies.triadic[1])}
                className="rounded neo-border"
                style={{ backgroundColor: harmonies.triadic[1] }}
                title={harmonies.triadic[1]}
              />
            </div>
            <div className="font-mono text-[10px] text-center text-text-secondary">
              {harmonies.triadic[0]} · {harmonies.triadic[1]}
            </div>
          </div>

          {/* Tetradic */}
          <div className="p-3 neo-border rounded bg-surface space-y-2">
            <span className="font-heading font-bold uppercase block text-text-secondary">
              Tetradic (90°)
            </span>
            <div className="grid grid-cols-4 gap-1 h-14">
              <button
                onClick={() => setHexInput(hexValue)}
                className="rounded neo-border"
                style={{ backgroundColor: hexValue }}
              />
              <button
                onClick={() => setHexInput(harmonies.tetradic[0])}
                className="rounded neo-border"
                style={{ backgroundColor: harmonies.tetradic[0] }}
              />
              <button
                onClick={() => setHexInput(harmonies.tetradic[1])}
                className="rounded neo-border"
                style={{ backgroundColor: harmonies.tetradic[1] }}
              />
              <button
                onClick={() => setHexInput(harmonies.tetradic[2])}
                className="rounded neo-border"
                style={{ backgroundColor: harmonies.tetradic[2] }}
              />
            </div>
            <div className="font-mono text-[10px] text-center text-text-secondary">
              {harmonies.tetradic[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Tints & Shades Scales */}
      <div className="neo-card p-5 space-y-3">
        <div className="font-heading font-bold text-xs uppercase text-text-secondary border-b-2 border-border pb-2 flex items-center justify-between">
          <span>Tints (Lighter) &amp; Shades (Darker)</span>
          <span className="text-[11px] font-normal lowercase">click to select any variation</span>
        </div>

        <div className="space-y-2">
          {/* Tints */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-text-secondary">Tints (Mix with White):</span>
            <div className="grid grid-cols-6 gap-2 h-10">
              {tints.map((hex) => (
                <button
                  key={hex}
                  onClick={() => setHexInput(hex)}
                  className="rounded neo-border hover:scale-105 transition-transform"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>

          {/* Shades */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-semibold text-text-secondary">Shades (Mix with Black):</span>
            <div className="grid grid-cols-6 gap-2 h-10">
              {shades.map((hex) => (
                <button
                  key={hex}
                  onClick={() => setHexInput(hex)}
                  className="rounded neo-border hover:scale-105 transition-transform"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
