"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Download,
  Sparkles,
  Layers,
} from "lucide-react";
import { hexToRgb } from "../colorUtils";

interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

const PRESET_SHADOWS = [
  {
    name: "Subtle Elevation",
    layers: [
      { id: "1", x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 0.1, inset: false },
      { id: "2", x: 0, y: 2, blur: 4, spread: -2, color: "#000000", opacity: 0.1, inset: false },
    ],
  },
  {
    name: "Modern Float (Soft)",
    layers: [
      { id: "1", x: 0, y: 20, blur: 25, spread: -5, color: "#000000", opacity: 0.15, inset: false },
      { id: "2", x: 0, y: 8, blur: 10, spread: -6, color: "#000000", opacity: 0.1, inset: false },
    ],
  },
  {
    name: "Neo-Brutalist Hard",
    layers: [
      { id: "1", x: 5, y: 5, blur: 0, spread: 0, color: "#111111", opacity: 1, inset: false },
    ],
  },
  {
    name: "Cyan Glow",
    layers: [
      { id: "1", x: 0, y: 0, blur: 20, spread: 4, color: "#06B6D4", opacity: 0.6, inset: false },
    ],
  },
  {
    name: "Inner Well (Inset)",
    layers: [
      { id: "1", x: 2, y: 2, blur: 6, spread: 0, color: "#000000", opacity: 0.25, inset: true },
    ],
  },
];

export default function CssBoxShadowGeneratorTool() {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: "1", x: 0, y: 10, blur: 20, spread: -3, color: "#000000", opacity: 0.15, inset: false },
  ]);
  const [cardBg, setCardBg] = useState("#FFFFFF");
  const [stageBg, setStageBg] = useState("#F1F5F9");
  const [copied, setCopied] = useState(false);

  // Compute CSS box-shadow string
  const boxShadowValue = useMemo(() => {
    return layers
      .map((l) => {
        const rgb = hexToRgb(l.color) || { r: 0, g: 0, b: 0 };
        const colorStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${l.opacity.toFixed(2)})`;
        const insetText = l.inset ? "inset " : "";
        return `${insetText}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${colorStr}`;
      })
      .join(",\n  ");
  }, [layers]);

  const cssDeclaration = useMemo(() => {
    return `box-shadow:\n  ${boxShadowValue};`;
  }, [boxShadowValue]);

  const addLayer = () => {
    setLayers([
      ...layers,
      {
        id: Date.now().toString(),
        x: 0,
        y: 4,
        blur: 10,
        spread: 0,
        color: "#000000",
        opacity: 0.1,
        inset: false,
      },
    ]);
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter((l) => l.id !== id));
  };

  const updateLayer = (id: string, updates: Partial<ShadowLayer>) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cssDeclaration);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `.shadow-card {\n  ${cssDeclaration}\n}\n`;
    const blob = new Blob([content], { type: "text/css;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "box-shadow.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setLayers([
      { id: "1", x: 0, y: 10, blur: 20, spread: -3, color: "#000000", opacity: 0.15, inset: false },
    ]);
    setCardBg("#FFFFFF");
    setStageBg("#F1F5F9");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Box size={14} /> Multi-Layer CSS Box Shadow Generator
          </span>
          <span className="text-xs text-text-secondary">
            Offset • Blur • Spread • Color • Opacity • Inset
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
        {/* Left Controls & Layers (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Shadow Layers Header */}
          <div className="neo-card p-4 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-border pb-2.5">
              <span className="font-heading font-bold uppercase text-xs text-text-secondary">
                Shadow Layers ({layers.length})
              </span>
              <button
                onClick={addLayer}
                className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold flex items-center gap-1"
              >
                <Plus size={12} /> Add Layer
              </button>
            </div>

            {/* Layer Accordions */}
            <div className="space-y-3">
              {layers.map((layer, idx) => (
                <div key={layer.id} className="p-3.5 neo-border rounded bg-surface space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-1.5">
                    <span className="font-heading font-bold text-xs">
                      Layer #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                        <input
                          type="checkbox"
                          checked={layer.inset}
                          onChange={(e) => updateLayer(layer.id, { inset: e.target.checked })}
                          className="rounded accent-accent"
                        />
                        <span>Inset</span>
                      </label>

                      {layers.length > 1 && (
                        <button
                          onClick={() => removeLayer(layer.id)}
                          className="text-red-500 hover:text-red-700 p-0.5"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Horizontal & Vertical Sliders */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between font-mono font-bold mb-1">
                        <span>X Offset:</span>
                        <span>{layer.x}px</span>
                      </div>
                      <input
                        type="range"
                        min={-60}
                        max={60}
                        value={layer.x}
                        onChange={(e) => updateLayer(layer.id, { x: parseInt(e.target.value) })}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-mono font-bold mb-1">
                        <span>Y Offset:</span>
                        <span>{layer.y}px</span>
                      </div>
                      <input
                        type="range"
                        min={-60}
                        max={60}
                        value={layer.y}
                        onChange={(e) => updateLayer(layer.id, { y: parseInt(e.target.value) })}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Blur & Spread Sliders */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between font-mono font-bold mb-1">
                        <span>Blur Radius:</span>
                        <span>{layer.blur}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={layer.blur}
                        onChange={(e) => updateLayer(layer.id, { blur: parseInt(e.target.value) })}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-mono font-bold mb-1">
                        <span>Spread:</span>
                        <span>{layer.spread}px</span>
                      </div>
                      <input
                        type="range"
                        min={-30}
                        max={40}
                        value={layer.spread}
                        onChange={(e) => updateLayer(layer.id, { spread: parseInt(e.target.value) })}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Color & Opacity */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-secondary">Color:</span>
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                        className="w-7 h-7 rounded neo-border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={layer.color}
                        onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                        className="w-20 neo-input py-0.5 px-1.5 text-xs font-mono uppercase"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-mono font-bold mb-1">
                        <span>Opacity:</span>
                        <span>{Math.round(layer.opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={layer.opacity}
                        onChange={(e) => updateLayer(layer.id, { opacity: parseFloat(e.target.value) })}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="neo-card p-4 space-y-2">
            <span className="font-heading font-bold uppercase text-xs text-text-secondary block">
              Curated Elevation Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_SHADOWS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setLayers([...p.layers])}
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
            {/* Stage Background & Card Color Controls */}
            <div className="flex items-center justify-between text-xs pb-2 border-b-2 border-border">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-bold">Stage:</span>
                <input
                  type="color"
                  value={stageBg}
                  onChange={(e) => setStageBg(e.target.value)}
                  className="w-6 h-6 rounded neo-border cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-bold">Card:</span>
                <input
                  type="color"
                  value={cardBg}
                  onChange={(e) => setCardBg(e.target.value)}
                  className="w-6 h-6 rounded neo-border cursor-pointer"
                />
              </div>
            </div>

            {/* Interactive Preview Canvas */}
            <div
              className="aspect-video w-full rounded-lg neo-border flex items-center justify-center p-8 transition-colors"
              style={{ backgroundColor: stageBg }}
            >
              <div
                className="w-48 h-32 rounded-xl flex flex-col items-center justify-center p-4 text-center transition-all"
                style={{
                  backgroundColor: cardBg,
                  boxShadow: boxShadowValue,
                }}
              >
                <span className="font-heading font-bold text-sm mb-1 text-slate-800">
                  Preview Card
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {layers.length} {layers.length === 1 ? "layer" : "layers"}
                </span>
              </div>
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
                {cssDeclaration}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
