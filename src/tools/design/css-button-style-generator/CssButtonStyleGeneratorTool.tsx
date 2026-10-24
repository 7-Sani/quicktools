"use client";

import React, { useState, useMemo } from "react";
import {
  MousePointer,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  ArrowRight,
  Heart,
  Download as DownloadIcon,
} from "lucide-react";

type HoverEffect = "translate" | "scale" | "glow" | "invert" | "none";

const BUTTON_PRESETS = [
  {
    name: "Neo-Brutalist Hard",
    bg: "#315CFF",
    text: "#FFFFFF",
    borderColor: "#111111",
    borderWidth: 2,
    radius: 6,
    shadowX: 4,
    shadowY: 4,
    shadowBlur: 0,
    shadowColor: "#111111",
    hover: "translate" as HoverEffect,
    isUppercase: true,
  },
  {
    name: "Modern Floating (Soft)",
    bg: "#10B981",
    text: "#FFFFFF",
    borderColor: "transparent",
    borderWidth: 0,
    radius: 9999,
    shadowX: 0,
    shadowY: 8,
    shadowBlur: 20,
    shadowColor: "rgba(16, 185, 129, 0.4)",
    hover: "scale" as HoverEffect,
    isUppercase: false,
  },
  {
    name: "Minimalist Outline",
    bg: "transparent",
    text: "#111111",
    borderColor: "#111111",
    borderWidth: 2,
    radius: 8,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    shadowColor: "transparent",
    hover: "invert" as HoverEffect,
    isUppercase: true,
  },
  {
    name: "Neon Glow",
    bg: "#D946EF",
    text: "#FFFFFF",
    borderColor: "transparent",
    borderWidth: 0,
    radius: 12,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 25,
    shadowColor: "rgba(217, 70, 239, 0.7)",
    hover: "glow" as HoverEffect,
    isUppercase: false,
  },
];

export default function CssButtonStyleGeneratorTool() {
  const [btnText, setBtnText] = useState("Get Started Now");
  const [iconType, setIconType] = useState<"arrow" | "sparkles" | "download" | "none">("arrow");
  const [padY, setPadY] = useState(14);
  const [padX, setPadX] = useState(28);
  const [fontSize, setFontSize] = useState(15);
  const [fontWeight, setFontWeight] = useState("700");
  const [isUppercase, setIsUppercase] = useState(true);

  const [bg, setBg] = useState("#315CFF");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [borderColor, setBorderColor] = useState("#111111");
  const [borderWidth, setBorderWidth] = useState(2);
  const [radius, setRadius] = useState(6);

  const [shadowX, setShadowX] = useState(4);
  const [shadowY, setShadowY] = useState(4);
  const [shadowBlur, setShadowBlur] = useState(0);
  const [shadowColor, setShadowColor] = useState("#111111");

  const [hoverEffect, setHoverEffect] = useState<HoverEffect>("translate");
  const [copied, setCopied] = useState(false);

  // Compute CSS
  const baseCss = useMemo(() => {
    return [
      `display: inline-flex;`,
      `align-items: center;`,
      `justify-content: center;`,
      `gap: 8px;`,
      `padding: ${padY}px ${padX}px;`,
      `font-size: ${fontSize}px;`,
      `font-weight: ${fontWeight};`,
      isUppercase ? `text-transform: uppercase;` : `text-transform: none;`,
      `letter-spacing: 0.04em;`,
      `color: ${textColor};`,
      `background-color: ${bg};`,
      borderWidth > 0 ? `border: ${borderWidth}px solid ${borderColor};` : `border: none;`,
      `border-radius: ${radius}px;`,
      `box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor};`,
      `cursor: pointer;`,
      `transition: all 180ms ease;`,
      `text-decoration: none;`,
    ]
      .filter(Boolean)
      .join("\n  ");
  }, [
    padY,
    padX,
    fontSize,
    fontWeight,
    isUppercase,
    textColor,
    bg,
    borderWidth,
    borderColor,
    radius,
    shadowX,
    shadowY,
    shadowBlur,
    shadowColor,
  ]);

  const hoverCss = useMemo(() => {
    switch (hoverEffect) {
      case "translate":
        return `transform: translate(-2px, -2px);\n  box-shadow: ${shadowX + 2}px ${shadowY + 2}px ${shadowBlur}px ${shadowColor};`;
      case "scale":
        return `transform: scale(1.05);\n  filter: brightness(1.08);`;
      case "glow":
        return `box-shadow: 0 0 ${shadowBlur + 15}px ${shadowColor};\n  transform: translateY(-2px);`;
      case "invert":
        return `background-color: ${textColor};\n  color: ${bg === "transparent" ? "#FFFFFF" : bg};`;
      case "none":
        return `filter: brightness(0.92);`;
    }
  }, [hoverEffect, shadowX, shadowY, shadowBlur, shadowColor, textColor, bg]);

  const fullCssSnippet = useMemo(() => {
    return `.custom-btn {\n  ${baseCss}\n}\n\n.custom-btn:hover {\n  ${hoverCss}\n}\n\n.custom-btn:active {\n  transform: translate(0, 0);\n  box-shadow: 1px 1px 0 ${shadowColor};\n}`;
  }, [baseCss, hoverCss, shadowColor]);

  const htmlSnippet = useMemo(() => {
    return `<button class="custom-btn">\n  ${btnText}\n</button>`;
  }, [btnText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCssSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `${fullCssSnippet}\n`;
    const blob = new Blob([content], { type: "text/css;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "button-styles.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setBtnText("Get Started Now");
    setPadY(14);
    setPadX(28);
    setFontSize(15);
    setFontWeight("700");
    setIsUppercase(true);
    setBg("#315CFF");
    setTextColor("#FFFFFF");
    setBorderColor("#111111");
    setBorderWidth(2);
    setRadius(6);
    setShadowX(4);
    setShadowY(4);
    setShadowBlur(0);
    setShadowColor("#111111");
    setHoverEffect("translate");
  };

  const applyPreset = (p: typeof BUTTON_PRESETS[0]) => {
    setBg(p.bg);
    setTextColor(p.text);
    setBorderColor(p.borderColor);
    setBorderWidth(p.borderWidth);
    setRadius(p.radius);
    setShadowX(p.shadowX);
    setShadowY(p.shadowY);
    setShadowBlur(p.shadowBlur);
    setShadowColor(p.shadowColor);
    setHoverEffect(p.hover);
    setIsUppercase(p.isUppercase);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <MousePointer size={14} /> CSS Button Style Generator
          </span>
          <span className="text-xs text-text-secondary">
            Typography • Hover Transitions • Shadows • Production CSS
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
            {/* Button Label & Icon */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-heading font-bold uppercase text-text-secondary block">
                  Button Text
                </label>
                <input
                  type="text"
                  value={btnText}
                  onChange={(e) => setBtnText(e.target.value)}
                  className="w-full neo-input py-1.5 px-2.5 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-heading font-bold uppercase text-text-secondary block">
                  Trailing Icon
                </label>
                <select
                  value={iconType}
                  onChange={(e) => setIconType(e.target.value as "arrow" | "sparkles" | "download" | "none")}
                  className="w-full neo-input py-1.5 px-2 text-xs"
                >
                  <option value="arrow">Arrow (→)</option>
                  <option value="sparkles">Sparkles (✦)</option>
                  <option value="download">Download (⤓)</option>
                  <option value="none">No Icon</option>
                </select>
              </div>
            </div>

            {/* Colors Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t-2 border-border text-xs">
              <div>
                <span className="font-bold text-text-secondary block mb-1">Background:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={bg.startsWith("#") ? bg : "#315CFF"}
                    onChange={(e) => setBg(e.target.value)}
                    className="w-7 h-7 rounded neo-border cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    className="w-full neo-input py-0.5 px-1 text-[11px] font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <span className="font-bold text-text-secondary block mb-1">Text Color:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={textColor.startsWith("#") ? textColor : "#FFFFFF"}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-7 h-7 rounded neo-border cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full neo-input py-0.5 px-1 text-[11px] font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <span className="font-bold text-text-secondary block mb-1">Border Color:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={borderColor.startsWith("#") ? borderColor : "#111111"}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-7 h-7 rounded neo-border cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-full neo-input py-0.5 px-1 text-[11px] font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Padding Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t-2 border-border text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-mono font-bold">
                  <span>Padding Y (Vertical):</span>
                  <span>{padY}px</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={30}
                  value={padY}
                  onChange={(e) => setPadY(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono font-bold">
                  <span>Padding X (Horizontal):</span>
                  <span>{padX}px</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={60}
                  value={padX}
                  onChange={(e) => setPadX(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>

            {/* Border Radius & Width */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-mono font-bold">
                  <span>Corner Radius:</span>
                  <span>{radius}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

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
            </div>

            {/* Hover Effect & Typography */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t-2 border-border text-xs">
              <div className="space-y-1">
                <span className="font-bold text-text-secondary block">Hover Animation:</span>
                <select
                  value={hoverEffect}
                  onChange={(e) => setHoverEffect(e.target.value as HoverEffect)}
                  className="w-full neo-input py-1 px-2 text-xs"
                >
                  <option value="translate">Translate Shift (Neo-Brutalist)</option>
                  <option value="scale">Subtle Scale &amp; Lift</option>
                  <option value="glow">Neon Glow Spread</option>
                  <option value="invert">Invert Colors</option>
                  <option value="none">Standard Brightness</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isUppercase}
                    onChange={(e) => setIsUppercase(e.target.checked)}
                    className="rounded accent-accent"
                  />
                  <span className="font-semibold">Uppercase Text</span>
                </label>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="neo-card p-4 space-y-2">
            <span className="font-heading font-bold uppercase text-xs text-text-secondary block">
              Curated Button Presets:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {BUTTON_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
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
            <span className="font-heading font-bold uppercase text-xs text-text-secondary block border-b-2 border-border pb-2">
              Interactive Button Stage (Hover &amp; Click Me!)
            </span>

            {/* Live Interactive Stage */}
            <div className="aspect-video w-full rounded-lg neo-border bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-8 transition-colors">
              <button
                className="group select-none"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: `${padY}px ${padX}px`,
                  fontSize: `${fontSize}px`,
                  fontWeight: parseInt(fontWeight),
                  textTransform: isUppercase ? "uppercase" : "none",
                  letterSpacing: "0.04em",
                  color: textColor,
                  backgroundColor: bg,
                  border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
                  borderRadius: `${radius}px`,
                  boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`,
                  cursor: "pointer",
                  transition: "all 180ms ease",
                }}
              >
                <span>{btnText || "Button"}</span>
                {iconType === "arrow" && <ArrowRight size={16} className="shrink-0" />}
                {iconType === "sparkles" && <Sparkles size={16} className="shrink-0" />}
                {iconType === "download" && <DownloadIcon size={16} className="shrink-0" />}
              </button>
            </div>

            {/* CSS Output */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold uppercase text-text-secondary">
                  Ready-to-Use CSS
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

              <pre className="p-3 neo-border rounded bg-surface font-mono text-xs overflow-x-auto text-text whitespace-pre-wrap leading-relaxed max-h-56">
                {fullCssSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
