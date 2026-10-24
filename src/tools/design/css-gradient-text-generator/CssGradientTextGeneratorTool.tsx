"use client";

import React, { useState, useMemo } from "react";
import {
  Type,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Sun,
  Moon,
} from "lucide-react";

const TEXT_GRADIENT_PRESETS = [
  {
    name: "Hyper Violet",
    angle: 135,
    stops: ["#315CFF", "#D946EF", "#F43F5E"],
  },
  {
    name: "Golden Sunrise",
    angle: 90,
    stops: ["#F59E0B", "#EF4444", "#DC2626"],
  },
  {
    name: "Ocean Emerald",
    angle: 45,
    stops: ["#06B6D4", "#10B981", "#3B82F6"],
  },
  {
    name: "Midnight Aurora",
    angle: 120,
    stops: ["#A855F7", "#EC4899", "#3B82F6"],
  },
  {
    name: "Cyberpunk",
    angle: 90,
    stops: ["#00F2FE", "#4FACFE"],
  },
];

export default function CssGradientTextGeneratorTool() {
  const [text, setText] = useState("Make Headlines Pop");
  const [angle, setAngle] = useState(135);
  const [stop1, setStop1] = useState("#315CFF");
  const [stop2, setStop2] = useState("#D946EF");
  const [stop3, setStop3] = useState("#F43F5E");
  const [useStop3, setUseStop3] = useState(true);
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState("800");
  const [previewDark, setPreviewDark] = useState(false);
  const [hasDropShadow, setHasDropShadow] = useState(false);
  const [copied, setCopied] = useState(false);

  // Gradient CSS string
  const gradientString = useMemo(() => {
    const stops = useStop3 ? `${stop1}, ${stop2}, ${stop3}` : `${stop1}, ${stop2}`;
    return `linear-gradient(${angle}deg, ${stops})`;
  }, [angle, stop1, stop2, stop3, useStop3]);

  // Full CSS declaration with cross-browser prefixes
  const fullCssDeclaration = useMemo(() => {
    const lines = [
      `background: ${gradientString};`,
      `-webkit-background-clip: text;`,
      `-webkit-text-fill-color: transparent;`,
      `background-clip: text;`,
      `color: transparent;`,
    ];

    if (hasDropShadow) {
      lines.push(`filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));`);
    }

    return lines.join("\n");
  }, [gradientString, hasDropShadow]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCssDeclaration);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `.gradient-text {\n  ${fullCssDeclaration.split("\n").map((l) => "  " + l).join("\n")}\n}\n`;
    const blob = new Blob([content], { type: "text/css;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gradient-text.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setText("Make Headlines Pop");
    setAngle(135);
    setStop1("#315CFF");
    setStop2("#D946EF");
    setStop3("#F43F5E");
    setUseStop3(true);
    setFontSize(48);
    setFontWeight("800");
    setHasDropShadow(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Type size={14} /> CSS Gradient Text Generator
          </span>
          <span className="text-xs text-text-secondary">
            Cross-browser text clipping with linear angle and color controls
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
        {/* Left: Inputs & Sliders (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            {/* Custom Text input */}
            <div className="space-y-1.5">
              <label className="font-heading font-bold uppercase text-xs text-text-secondary">
                Preview Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your headline..."
                className="w-full neo-input py-2 px-3 font-heading font-bold text-base"
              />
            </div>

            {/* Angle Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span>Gradient Direction (Angle):</span>
                <span className="text-accent">{angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>

            {/* Colors */}
            <div className="space-y-2.5 pt-2 border-t-2 border-border">
              <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                <span>Gradient Colors</span>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useStop3}
                    onChange={(e) => setUseStop3(e.target.checked)}
                    className="rounded accent-accent"
                  />
                  <span>Include 3rd Color</span>
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {/* Stop 1 */}
                <div className="space-y-1">
                  <span className="text-text-secondary block">Color 1</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={stop1}
                      onChange={(e) => setStop1(e.target.value)}
                      className="w-8 h-8 rounded neo-border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={stop1}
                      onChange={(e) => setStop1(e.target.value)}
                      className="w-full neo-input py-1 px-1.5 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Stop 2 */}
                <div className="space-y-1">
                  <span className="text-text-secondary block">Color 2</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={stop2}
                      onChange={(e) => setStop2(e.target.value)}
                      className="w-8 h-8 rounded neo-border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={stop2}
                      onChange={(e) => setStop2(e.target.value)}
                      className="w-full neo-input py-1 px-1.5 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Stop 3 */}
                {useStop3 && (
                  <div className="space-y-1">
                    <span className="text-text-secondary block">Color 3</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={stop3}
                        onChange={(e) => setStop3(e.target.value)}
                        className="w-8 h-8 rounded neo-border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={stop3}
                        onChange={(e) => setStop3(e.target.value)}
                        className="w-full neo-input py-1 px-1.5 text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Typography Controls */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t-2 border-border text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-mono font-bold">
                  <span>Font Size:</span>
                  <span>{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={24}
                  max={80}
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <span className="font-bold text-text-secondary block">Font Weight:</span>
                <select
                  value={fontWeight}
                  onChange={(e) => setFontWeight(e.target.value)}
                  className="w-full neo-input py-1 px-2 text-xs"
                >
                  <option value="400">Normal (400)</option>
                  <option value="600">SemiBold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">ExtraBold (800)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="neo-card p-4 space-y-2">
            <span className="font-heading font-bold uppercase text-xs text-text-secondary block">
              Curated Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEXT_GRADIENT_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setAngle(p.angle);
                    setStop1(p.stops[0]);
                    setStop2(p.stops[1]);
                    if (p.stops[2]) {
                      setStop3(p.stops[2]);
                      setUseStop3(true);
                    } else {
                      setUseStop3(false);
                    }
                  }}
                  className="p-2 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold text-left truncate"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Preview & CSS (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            {/* Preview Theme Toggle & Drop Shadow */}
            <div className="flex items-center justify-between text-xs pb-2 border-b-2 border-border">
              <button
                onClick={() => setPreviewDark(!previewDark)}
                className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 flex items-center gap-1.5 font-medium"
              >
                {previewDark ? <Sun size={13} /> : <Moon size={13} />}
                <span>{previewDark ? "Light Canvas" : "Dark Canvas"}</span>
              </button>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasDropShadow}
                  onChange={(e) => setHasDropShadow(e.target.checked)}
                  className="rounded accent-accent"
                />
                <span>Drop Shadow</span>
              </label>
            </div>

            {/* Live Text Canvas */}
            <div
              className={`aspect-video w-full rounded-lg neo-border p-6 flex items-center justify-center text-center transition-colors overflow-hidden ${
                previewDark ? "bg-[#0F172A]" : "bg-[#F8FAFC]"
              }`}
            >
              <h1
                className="font-heading leading-tight break-words max-w-full"
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: parseInt(fontWeight),
                  backgroundImage: gradientString,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: hasDropShadow ? "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))" : "none",
                }}
              >
                {text || "Headline Text"}
              </h1>
            </div>

            {/* CSS Output */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold uppercase text-text-secondary">
                  Generated CSS Output
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1 text-xs"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy CSS"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1 text-xs"
                  >
                    <Download size={12} />
                    Download
                  </button>
                </div>
              </div>

              <pre className="p-3 neo-border rounded bg-surface font-mono text-xs overflow-x-auto text-text whitespace-pre-wrap leading-relaxed">
                {fullCssDeclaration}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
