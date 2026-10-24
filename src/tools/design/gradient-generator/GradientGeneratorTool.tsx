"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Download,
  Layers,
  ArrowRight,
} from "lucide-react";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

type GradientType = "linear" | "radial" | "conic";

const GRADIENT_PRESETS = [
  {
    name: "Oceanic Blue",
    type: "linear" as GradientType,
    angle: 135,
    stops: [
      { id: "1", color: "#2E3192", position: 0 },
      { id: "2", color: "#1BFFFF", position: 100 },
    ],
  },
  {
    name: "Sunset Ember",
    type: "linear" as GradientType,
    angle: 90,
    stops: [
      { id: "1", color: "#FF512F", position: 0 },
      { id: "2", color: "#F09819", position: 100 },
    ],
  },
  {
    name: "Cyber Neon",
    type: "linear" as GradientType,
    angle: 45,
    stops: [
      { id: "1", color: "#D946EF", position: 0 },
      { id: "2", color: "#315CFF", position: 50 },
      { id: "3", color: "#06B6D4", position: 100 },
    ],
  },
  {
    name: "Emerald Glow",
    type: "radial" as GradientType,
    angle: 0,
    stops: [
      { id: "1", color: "#10B981", position: 0 },
      { id: "2", color: "#064E3B", position: 100 },
    ],
  },
  {
    name: "Conic Rainbow",
    type: "conic" as GradientType,
    angle: 0,
    stops: [
      { id: "1", color: "#EF4444", position: 0 },
      { id: "2", color: "#F59E0B", position: 25 },
      { id: "3", color: "#10B981", position: 50 },
      { id: "4", color: "#3B82F6", position: 75 },
      { id: "5", color: "#EF4444", position: 100 },
    ],
  },
];

export default function GradientGeneratorTool() {
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [radialShape, setRadialShape] = useState<"circle" | "ellipse">("circle");
  const [radialPosition, setRadialPosition] = useState("center");
  const [stops, setStops] = useState<ColorStop[]>([
    { id: "1", color: "#315CFF", position: 0 },
    { id: "2", color: "#D946EF", position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  // Generate CSS string
  const cssBackground = useMemo(() => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(", ");

    switch (gradientType) {
      case "linear":
        return `linear-gradient(${angle}deg, ${stopsStr})`;
      case "radial":
        return `radial-gradient(${radialShape} at ${radialPosition}, ${stopsStr})`;
      case "conic":
        return `conic-gradient(from ${angle}deg at ${radialPosition}, ${stopsStr})`;
    }
  }, [gradientType, angle, radialShape, radialPosition, stops]);

  const fullCssRule = useMemo(() => {
    return `background: ${cssBackground};\n/* Fallback for older browsers */\nbackground: -webkit-${cssBackground};`;
  }, [cssBackground]);

  const addStop = () => {
    const nextPos = Math.min(
      100,
      stops.length > 0 ? Math.round(stops[stops.length - 1].position / 2 + 50) : 50
    );
    setStops([...stops, { id: Date.now().toString(), color: "#10B981", position: nextPos }]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((s) => s.id !== id));
  };

  const updateStopColor = (id: string, color: string) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, color } : s)));
  };

  const updateStopPosition = (id: string, position: number) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, position } : s)));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`background: ${cssBackground};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `.my-gradient {\n  ${fullCssRule}\n}\n`;
    const blob = new Blob([content], { type: "text/css;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gradient.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setGradientType("linear");
    setAngle(135);
    setStops([
      { id: "1", color: "#315CFF", position: 0 },
      { id: "2", color: "#D946EF", position: 100 },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Sparkles size={14} /> CSS Gradient Generator
          </span>
          <span className="text-xs text-text-secondary">
            Linear, Radial, and Conic CSS Gradients with Multi-Stop Control
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
        {/* Left Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Gradient Type */}
          <div className="neo-card p-4 space-y-3">
            <label className="font-heading font-bold text-xs uppercase text-text-secondary">
              Gradient Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["linear", "radial", "conic"] as GradientType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setGradientType(type)}
                  className={`py-2 px-3 neo-border rounded text-xs font-heading font-bold uppercase transition-colors ${
                    gradientType === type
                      ? "bg-accent text-white"
                      : "bg-surface hover:bg-accent/10"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Linear or Conic Angle Slider */}
            {(gradientType === "linear" || gradientType === "conic") && (
              <div className="space-y-2 pt-2 border-t-2 border-border">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span>{gradientType === "linear" ? "Linear Angle" : "Starting Angle"}:</span>
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

                {/* Quick Angle Buttons for Linear */}
                {gradientType === "linear" && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setAngle(deg)}
                        className={`px-2 py-0.5 neo-border rounded text-[11px] font-mono ${
                          angle === deg ? "bg-accent text-white font-bold" : "bg-surface hover:bg-accent/10"
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Radial Options */}
            {gradientType === "radial" && (
              <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t-2 border-border text-xs">
                <div>
                  <label className="font-bold text-text-secondary block mb-1">Shape</label>
                  <select
                    value={radialShape}
                    onChange={(e) => setRadialShape(e.target.value as "circle" | "ellipse")}
                    className="w-full neo-input py-1 px-2 text-xs"
                  >
                    <option value="circle">Circle</option>
                    <option value="ellipse">Ellipse</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-text-secondary block mb-1">Position</label>
                  <select
                    value={radialPosition}
                    onChange={(e) => setRadialPosition(e.target.value)}
                    className="w-full neo-input py-1 px-2 text-xs"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top left">Top Left</option>
                    <option value="bottom right">Bottom Right</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Color Stops Manager */}
          <div className="neo-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-border pb-2">
              <span className="font-heading font-bold uppercase text-xs text-text-secondary">
                Color Stops ({stops.length})
              </span>
              <button
                onClick={addStop}
                className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1"
              >
                <Plus size={12} /> Add Stop
              </button>
            </div>

            <div className="space-y-2.5">
              {stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="p-2.5 neo-border rounded bg-surface flex items-center gap-3"
                >
                  <span className="font-mono text-xs text-text-secondary font-bold w-4">
                    {idx + 1}
                  </span>

                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStopColor(stop.id, e.target.value)}
                    className="w-8 h-8 rounded neo-border cursor-pointer shrink-0"
                  />

                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateStopColor(stop.id, e.target.value)}
                    className="w-20 neo-input py-1 px-2 text-xs font-mono uppercase"
                  />

                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) => updateStopPosition(stop.id, parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold w-9 text-right">
                      {stop.position}%
                    </span>
                  </div>

                  {stops.length > 2 && (
                    <button
                      onClick={() => removeStop(stop.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove color stop"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Curated Presets */}
          <div className="neo-card p-4 space-y-2">
            <span className="font-heading font-bold uppercase text-xs text-text-secondary block">
              Curated Gradient Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GRADIENT_PRESETS.map((p) => {
                const previewBg = `linear-gradient(135deg, ${p.stops.map((s) => `${s.color} ${s.position}%`).join(", ")})`;
                return (
                  <button
                    key={p.name}
                    onClick={() => {
                      setGradientType(p.type);
                      setAngle(p.angle);
                      setStops([...p.stops]);
                    }}
                    className="p-2 neo-border rounded bg-surface hover:scale-[1.02] transition-transform text-left text-xs font-semibold flex items-center gap-2"
                  >
                    <span
                      className="w-5 h-5 rounded-full neo-border shrink-0"
                      style={{ background: previewBg }}
                    />
                    <span className="truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Live Preview & CSS Output (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 space-y-4">
            {/* Live Gradient Preview Container */}
            <div
              className="aspect-video w-full rounded-lg neo-border shadow-md flex items-center justify-center p-6 text-center transition-all"
              style={{ background: cssBackground }}
            >
              <div className="bg-surface/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-lg neo-border shadow-lg max-w-xs">
                <span className="font-heading font-bold uppercase text-sm block mb-1">
                  Gradient Preview
                </span>
                <p className="text-xs text-text-secondary">
                  Ready to copy and paste directly into your modern CSS stylesheet.
                </p>
              </div>
            </div>

            {/* Generated CSS Code Box */}
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
                {`background: ${cssBackground};`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
