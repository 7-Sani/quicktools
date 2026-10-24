"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { hexToRgb } from "../colorUtils";

const SCENE_BACKGROUNDS = [
  {
    name: "Aurora Borealis",
    bg: "linear-gradient(135deg, #FF6B6B 0%, #556270 50%, #4ECDC4 100%)",
  },
  {
    name: "Cyber Neon",
    bg: "radial-gradient(circle at 20% 20%, #D946EF 0%, #315CFF 50%, #0F172A 100%)",
  },
  {
    name: "Sunset Orange",
    bg: "linear-gradient(45deg, #FA709A 0%, #FEE140 100%)",
  },
  {
    name: "Dark Tech Mesh",
    bg: "linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #020617 100%)",
  },
];

export default function GlassmorphismCssGeneratorTool() {
  const [blur, setBlur] = useState(16);
  const [opacity, setOpacity] = useState(0.25);
  const [glassColor, setGlassColor] = useState("#FFFFFF");
  const [borderWidth, setBorderWidth] = useState(1);
  const [borderOpacity, setBorderOpacity] = useState(0.2);
  const [borderRadius, setBorderRadius] = useState(16);
  const [shadowElevation, setShadowElevation] = useState(20);
  const [activeScene, setActiveScene] = useState(SCENE_BACKGROUNDS[0].bg);
  const [copied, setCopied] = useState(false);

  // Compute CSS
  const glassRgb = useMemo(() => hexToRgb(glassColor) || { r: 255, g: 255, b: 255 }, [glassColor]);

  const cssDeclaration = useMemo(() => {
    const bgStr = `rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b}, ${opacity.toFixed(2)})`;
    const borderStr = borderWidth > 0
      ? `${borderWidth}px solid rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b}, ${borderOpacity.toFixed(2)})`
      : "none";
    const shadowStr = shadowElevation > 0
      ? `0 8px ${shadowElevation}px 0 rgba(0, 0, 0, ${(shadowElevation / 80).toFixed(2)})`
      : "none";

    return [
      `background: ${bgStr};`,
      `backdrop-filter: blur(${blur}px);`,
      `-webkit-backdrop-filter: blur(${blur}px);`,
      `border-radius: ${borderRadius}px;`,
      `border: ${borderStr};`,
      `box-shadow: ${shadowStr};`,
    ].join("\n");
  }, [glassRgb, opacity, blur, borderRadius, borderWidth, borderOpacity, shadowElevation]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssDeclaration);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `.glass-card {\n  ${cssDeclaration.split("\n").map((l) => "  " + l).join("\n")}\n}\n`;
    const blob = new Blob([content], { type: "text/css;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "glassmorphism.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setBlur(16);
    setOpacity(0.25);
    setGlassColor("#FFFFFF");
    setBorderWidth(1);
    setBorderOpacity(0.2);
    setBorderRadius(16);
    setShadowElevation(20);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Layers size={14} /> Frosted Glassmorphism CSS Generator
          </span>
          <span className="text-xs text-text-secondary">
            Backdrop filter blur, transparency, border reflections, and elevations
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
        {/* Left: Sliders & Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            <div className="font-heading font-bold uppercase text-xs text-text-secondary border-b-2 border-border pb-2 flex items-center justify-between">
              <span>Glass Properties</span>
              <span className="text-[11px] font-normal lowercase">real-time adjustment</span>
            </div>

            {/* Blur Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span>Backdrop Blur:</span>
                <span className="text-accent">{blur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={blur}
                onChange={(e) => setBlur(parseInt(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span>Background Opacity:</span>
                <span className="text-accent">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>

            {/* Tint Color */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="font-bold text-text-secondary">Glass Tint Color:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={glassColor}
                  onChange={(e) => setGlassColor(e.target.value)}
                  className="w-7 h-7 rounded neo-border cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={glassColor}
                  onChange={(e) => setGlassColor(e.target.value)}
                  className="w-20 neo-input py-0.5 px-2 text-xs font-mono uppercase"
                />
              </div>
            </div>

            {/* Border Width & Border Opacity */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-mono font-bold">
                  <span>Border Width:</span>
                  <span>{borderWidth}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono font-bold">
                  <span>Border Opacity:</span>
                  <span>{Math.round(borderOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={borderOpacity}
                  onChange={(e) => setBorderOpacity(parseFloat(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>

            {/* Border Radius & Shadow */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-mono font-bold">
                  <span>Border Radius:</span>
                  <span>{borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono font-bold">
                  <span>Shadow Blur:</span>
                  <span>{shadowElevation}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={shadowElevation}
                  onChange={(e) => setShadowElevation(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Background Scene Selector */}
          <div className="neo-card p-4 space-y-2">
            <span className="font-heading font-bold uppercase text-xs text-text-secondary block">
              Test Backdrop Backgrounds:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {SCENE_BACKGROUNDS.map((scene) => (
                <button
                  key={scene.name}
                  onClick={() => setActiveScene(scene.bg)}
                  className={`p-2 neo-border rounded font-semibold text-left flex items-center gap-2 ${
                    activeScene === scene.bg ? "ring-2 ring-accent" : ""
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full neo-border shrink-0"
                    style={{ background: scene.bg }}
                  />
                  <span className="truncate">{scene.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Preview & CSS (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            {/* Live Backdrop Canvas with Glass Card */}
            <div
              className="aspect-video w-full rounded-lg neo-border overflow-hidden p-6 flex items-center justify-center transition-all shadow-md relative"
              style={{ background: activeScene }}
            >
              {/* Floating decorative geometric spheres behind glass */}
              <div className="absolute top-4 left-6 w-16 h-16 rounded-full bg-yellow-400/80 animate-pulse pointer-events-none" />
              <div className="absolute bottom-6 right-8 w-24 h-24 rounded-full bg-pink-500/80 pointer-events-none" />

              {/* The Glassmorphic Card */}
              <div
                className="p-5 max-w-sm w-full transition-all relative z-10"
                style={{
                  background: `rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b}, ${opacity})`,
                  backdropFilter: `blur(${blur}px)`,
                  WebkitBackdropFilter: `blur(${blur}px)`,
                  borderRadius: `${borderRadius}px`,
                  border:
                    borderWidth > 0
                      ? `${borderWidth}px solid rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b}, ${borderOpacity})`
                      : "none",
                  boxShadow:
                    shadowElevation > 0
                      ? `0 8px ${shadowElevation}px 0 rgba(0, 0, 0, ${(shadowElevation / 80).toFixed(2)})`
                      : "none",
                  color: glassColor === "#000000" ? "#FFFFFF" : "#111111",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading font-bold text-sm tracking-wide">
                    Glass Card UI
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/30 backdrop-blur font-mono font-bold">
                    PRO
                  </span>
                </div>

                <p className="text-xs leading-relaxed opacity-90 mb-4">
                  Experience true frosted glass aesthetics with real-time backdrop blur filtering.
                </p>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-md bg-white/40 hover:bg-white/60 backdrop-blur text-xs font-semibold shadow-sm transition-colors">
                    Action Button
                  </button>
                  <span className="text-[11px] opacity-75 font-mono">
                    blur({blur}px)
                  </span>
                </div>
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
