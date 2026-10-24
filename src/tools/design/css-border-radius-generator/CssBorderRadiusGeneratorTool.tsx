"use client";

import React, { useState, useMemo } from "react";
import {
  Square,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Link,
  Unlink,
  Download,
} from "lucide-react";

const RADIUS_PRESETS = [
  { name: "Gentle (8px)", tl: 8, tr: 8, br: 8, bl: 8, unit: "px" },
  { name: "Smooth Card (16px)", tl: 16, tr: 16, br: 16, bl: 16, unit: "px" },
  { name: "Pill / Capsule", tl: 9999, tr: 9999, br: 9999, bl: 9999, unit: "px" },
  { name: "Teardrop", tl: 0, tr: 50, br: 50, bl: 50, unit: "%" },
  { name: "Leaf", tl: 0, tr: 60, br: 0, bl: 60, unit: "%" },
  { name: "Diagonal Round", tl: 40, tr: 0, br: 40, bl: 0, unit: "px" },
];

export default function CssBorderRadiusGeneratorTool() {
  const [isAdvancedBlob, setIsAdvancedBlob] = useState(false);
  const [allLinked, setAllLinked] = useState(true);
  const [unit, setUnit] = useState<"px" | "%">("px");

  // Simple 4-corner mode values
  const [allVal, setAllVal] = useState(16);
  const [tl, setTl] = useState(16);
  const [tr, setTr] = useState(16);
  const [br, setBr] = useState(16);
  const [bl, setBl] = useState(16);

  // Advanced 8-value blob mode values (horizontal % / vertical %)
  const [h1, setH1] = useState(60);
  const [h2, setH2] = useState(40);
  const [h3, setH3] = useState(30);
  const [h4, setH4] = useState(70);
  const [v1, setV1] = useState(60);
  const [v2, setV2] = useState(30);
  const [v3, setV3] = useState(70);
  const [v4, setV4] = useState(40);

  // Visual preview styling
  const [fillColor, setFillColor] = useState("#315CFF");
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState("#111111");
  const [copied, setCopied] = useState(false);

  // Compute CSS border-radius value
  const borderRadiusValue = useMemo(() => {
    if (isAdvancedBlob) {
      return `${h1}% ${h2}% ${h3}% ${h4}% / ${v1}% ${v2}% ${v3}% ${v4}%`;
    }
    if (allLinked) {
      return `${allVal}${unit}`;
    }
    return `${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit}`;
  }, [isAdvancedBlob, allLinked, allVal, unit, tl, tr, br, bl, h1, h2, h3, h4, v1, v2, v3, v4]);

  const cssDeclaration = `border-radius: ${borderRadiusValue};`;

  const handleAllSlider = (val: number) => {
    setAllVal(val);
    setTl(val);
    setTr(val);
    setBr(val);
    setBl(val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cssDeclaration);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `.custom-shape {\n  ${cssDeclaration}\n}\n`;
    const blob = new Blob([content], { type: "text/css;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "border-radius.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setIsAdvancedBlob(false);
    setAllLinked(true);
    setUnit("px");
    setAllVal(16);
    setTl(16);
    setTr(16);
    setBr(16);
    setBl(16);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Square size={14} /> CSS Border Radius &amp; Blob Shape Generator
          </span>
          <span className="text-xs text-text-secondary">
            4-corner independent radii &amp; advanced 8-value organic blobs
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
        {/* Left: Interactive Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            {/* Mode Selector */}
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <span className="font-heading font-bold uppercase text-xs text-text-secondary">
                Configuration Mode
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAdvancedBlob(false)}
                  className={`px-2.5 py-1 text-xs neo-border rounded font-semibold ${
                    !isAdvancedBlob ? "bg-accent text-white" : "bg-surface hover:bg-accent/10"
                  }`}
                >
                  Standard 4-Corner
                </button>
                <button
                  onClick={() => setIsAdvancedBlob(true)}
                  className={`px-2.5 py-1 text-xs neo-border rounded font-semibold ${
                    isAdvancedBlob ? "bg-accent text-white" : "bg-surface hover:bg-accent/10"
                  }`}
                >
                  Organic Blob (8-Value)
                </button>
              </div>
            </div>

            {/* Standard 4-Corner Controls */}
            {!isAdvancedBlob ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAllLinked(!allLinked)}
                      className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      {allLinked ? <Link size={12} className="text-accent" /> : <Unlink size={12} />}
                      <span>{allLinked ? "Linked Corners" : "Individual Corners"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 font-mono">
                    <button
                      onClick={() => setUnit("px")}
                      className={`px-2 py-0.5 neo-border rounded text-[11px] ${
                        unit === "px" ? "bg-accent text-white font-bold" : "bg-surface"
                      }`}
                    >
                      px
                    </button>
                    <button
                      onClick={() => setUnit("%")}
                      className={`px-2 py-0.5 neo-border rounded text-[11px] ${
                        unit === "%" ? "bg-accent text-white font-bold" : "bg-surface"
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>

                {allLinked ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span>All Corners:</span>
                      <span className="text-accent">{allVal}{unit}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={unit === "px" ? 150 : 50}
                      value={allVal}
                      onChange={(e) => handleAllSlider(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {/* Top Left */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono font-bold">
                        <span>Top-Left:</span>
                        <span>{tl}{unit}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={unit === "px" ? 150 : 50}
                        value={tl}
                        onChange={(e) => setTl(parseInt(e.target.value))}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>

                    {/* Top Right */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono font-bold">
                        <span>Top-Right:</span>
                        <span>{tr}{unit}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={unit === "px" ? 150 : 50}
                        value={tr}
                        onChange={(e) => setTr(parseInt(e.target.value))}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>

                    {/* Bottom Left */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono font-bold">
                        <span>Bottom-Left:</span>
                        <span>{bl}{unit}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={unit === "px" ? 150 : 50}
                        value={bl}
                        onChange={(e) => setBl(parseInt(e.target.value))}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>

                    {/* Bottom Right */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono font-bold">
                        <span>Bottom-Right:</span>
                        <span>{br}{unit}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={unit === "px" ? 150 : 50}
                        value={br}
                        onChange={(e) => setBr(parseInt(e.target.value))}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Organic Blob Mode (8-value sliders) */
              <div className="space-y-3 text-xs">
                <span className="font-bold text-text-secondary block">
                  Horizontal Radii (X-axis)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] block">Top-X: {h1}%</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={h1}
                      onChange={(e) => setH1(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] block">Right-X: {h2}%</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={h2}
                      onChange={(e) => setH2(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] block">Bottom-X: {h3}%</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={h3}
                      onChange={(e) => setH3(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] block">Left-X: {h4}%</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={h4}
                      onChange={(e) => setH4(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>
                </div>

                <span className="font-bold text-text-secondary block pt-2 border-t border-border">
                  Vertical Radii (Y-axis)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] block">Top-Y: {v1}%</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={v1}
                      onChange={(e) => setV1(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] block">Right-Y: {v2}%</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={v2}
                      onChange={(e) => setV2(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] block">Bottom-Y: {v3}%</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={v3}
                      onChange={(e) => setV3(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] block">Left-Y: {v4}%</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={v4}
                      onChange={(e) => setV4(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Presets */}
          <div className="neo-card p-4 space-y-2">
            <span className="font-heading font-bold uppercase text-xs text-text-secondary block">
              Corner Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RADIUS_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setIsAdvancedBlob(false);
                    setAllLinked(false);
                    setUnit(p.unit as "px" | "%");
                    setTl(p.tl);
                    setTr(p.tr);
                    setBr(p.br);
                    setBl(p.bl);
                  }}
                  className="p-2 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold text-left truncate"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Shape Preview & CSS (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            {/* Visual Customization Bar */}
            <div className="flex items-center justify-between text-xs pb-2 border-b-2 border-border">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-bold">Fill:</span>
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="w-6 h-6 rounded neo-border cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-bold">Border ({borderWidth}px):</span>
                <input
                  type="range"
                  min={0}
                  max={8}
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                  className="w-20 accent-accent cursor-pointer"
                />
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-6 h-6 rounded neo-border cursor-pointer"
                />
              </div>
            </div>

            {/* Shape Preview Canvas */}
            <div className="aspect-video w-full rounded-lg neo-border bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-8">
              <div
                className="w-44 h-44 flex flex-col items-center justify-center text-center p-4 transition-all shadow-md"
                style={{
                  borderRadius: borderRadiusValue,
                  backgroundColor: fillColor,
                  border: `${borderWidth}px solid ${borderColor}`,
                  color: "#FFFFFF",
                }}
              >
                <span className="font-heading font-bold text-sm drop-shadow">
                  Live Shape
                </span>
                <span className="text-[10px] font-mono opacity-90 truncate max-w-full drop-shadow">
                  {borderRadiusValue}
                </span>
              </div>
            </div>

            {/* CSS Box */}
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
                {cssDeclaration}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
