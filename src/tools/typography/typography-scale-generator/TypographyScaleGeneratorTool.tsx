"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, Copy, Check, Sliders, Code } from "lucide-react";

interface ScaleRatio {
  name: string;
  ratio: number;
  description: string;
}

const SCALE_RATIOS: ScaleRatio[] = [
  { name: "Minor Second", ratio: 1.067, description: "Subtle, compact hierarchy" },
  { name: "Major Second", ratio: 1.125, description: "Gentle step progression" },
  { name: "Minor Third", ratio: 1.200, description: "Classic, balanced mobile scale" },
  { name: "Major Third", ratio: 1.250, description: "Modern web standard (Popular)" },
  { name: "Perfect Fourth", ratio: 1.333, description: "Clear, authoritative headings" },
  { name: "Augmented Fourth", ratio: 1.414, description: "High contrast (Silver Ratio)" },
  { name: "Perfect Fifth", ratio: 1.500, description: "Dramatic contrast for editorial" },
  { name: "Golden Ratio", ratio: 1.618, description: "Maximum mathematical contrast" },
];

export default function TypographyScaleGeneratorTool() {
  const [baseSize, setBaseSize] = useState<number>(16);
  const [selectedRatio, setSelectedRatio] = useState<number>(1.25);
  const [copied, setCopied] = useState<boolean>(false);

  const steps = useMemo(() => {
    const labels = [
      { step: -2, name: "Caption Small", tag: "small" },
      { step: -1, name: "Caption / Fine Print", tag: "span" },
      { step: 0, name: "Body Base", tag: "p" },
      { step: 1, name: "Lead Paragraph / H5", tag: "h5" },
      { step: 2, name: "Section Heading / H4", tag: "h4" },
      { step: 3, name: "Subheading / H3", tag: "h3" },
      { step: 4, name: "Page Heading / H2", tag: "h2" },
      { step: 5, name: "Article Title / H1", tag: "h1" },
      { step: 6, name: "Hero / Display", tag: "h1" },
    ];

    return labels.map((item) => {
      const px = baseSize * Math.pow(selectedRatio, item.step);
      const rem = px / baseSize;
      return {
        ...item,
        px: Math.round(px * 100) / 100,
        rem: Math.round(rem * 1000) / 1000,
      };
    });
  }, [baseSize, selectedRatio]);

  const cssVariables = useMemo(() => {
    return `:root {
  /* Typographic Modular Scale (Ratio: ${selectedRatio}) */
${steps
  .map(
    (s) =>
      `  --fs-${s.step < 0 ? `neg-${Math.abs(s.step)}` : s.step}: ${s.rem}rem; /* ${s.px}px - ${s.name} */`
  )
  .join("\n")}
}`;
  }, [steps, selectedRatio]);

  const copyCss = () => {
    navigator.clipboard.writeText(cssVariables);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Controls */}
      <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black">Modular Scale Controls</h2>
          </div>
          <button
            onClick={copyCss}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy CSS Variables"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Base Body Size: <span className="font-mono text-purple-700">{baseSize}px</span>
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={baseSize}
              onChange={(e) => setBaseSize(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-xs font-bold text-gray-500 mt-1">
              <span>12px</span>
              <span>16px (Default)</span>
              <span>24px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Typographic Scale Ratio
            </label>
            <select
              value={selectedRatio}
              onChange={(e) => setSelectedRatio(Number(e.target.value))}
              className="w-full px-4 py-2 border-2 border-black rounded-xl font-bold text-sm bg-gray-50 focus:bg-white"
            >
              {SCALE_RATIOS.map((r) => (
                <option key={r.ratio} value={r.ratio}>
                  {r.name} ({r.ratio}) — {r.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual Scale Hierarchy */}
        <div className="lg:col-span-8 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <h3 className="text-lg font-black border-b-2 border-black pb-2">Visual Scale Hierarchy</h3>
          <div className="space-y-6 divide-y divide-gray-100">
            {steps
              .slice()
              .reverse()
              .map((item) => (
                <div key={item.step} className="pt-4 first:pt-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-purple-700">
                      Step {item.step > 0 ? `+${item.step}` : item.step} ({item.name})
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      {item.px}px / {item.rem}rem
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: `${item.px}px`,
                      lineHeight: item.step >= 3 ? 1.15 : 1.4,
                    }}
                    className="font-bold text-gray-900 truncate"
                  >
                    QuickTools Typography
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Code Snippet */}
        <div className="lg:col-span-4 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-1.5 font-black text-sm border-b-2 border-black pb-2">
              <Code className="w-4 h-4 text-purple-600" /> CSS Custom Properties
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Ready to paste into your design system or global stylesheet:
            </p>
            <pre className="mt-3 p-3 bg-gray-900 text-purple-300 font-mono text-xs rounded-xl overflow-x-auto border-2 border-black max-h-[420px]">
              {cssVariables}
            </pre>
          </div>

          <button
            onClick={copyCss}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy Variables"}
          </button>
        </div>
      </div>
    </div>
  );
}
