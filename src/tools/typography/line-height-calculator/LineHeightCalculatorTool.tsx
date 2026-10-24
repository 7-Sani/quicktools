"use client";

import React, { useState, useMemo } from "react";
import { AlignJustify, Copy, Check, Sliders, BookOpen, AlertCircle } from "lucide-react";

export default function LineHeightCalculatorTool() {
  const [fontSize, setFontSize] = useState<number>(18);
  const [contentCategory, setContentCategory] = useState<"body" | "heading" | "caption">("body");
  const [measureChars, setMeasureChars] = useState<number>(65); // optimal reading length 45-75 chars
  const [copied, setCopied] = useState(false);

  const calculated = useMemo(() => {
    let unitless = 1.5;

    if (contentCategory === "heading") {
      // Headings need tighter leading as size increases
      unitless = Math.max(1.05, Math.min(1.3, 1.35 - (fontSize - 24) * 0.005));
    } else if (contentCategory === "caption") {
      unitless = 1.4;
    } else {
      // Body copy: scales with line length (Bringhurst formula)
      // Ideal line length is ~66 characters (range 45 - 85)
      const lengthAdjustment = (measureChars - 45) * 0.004;
      unitless = Math.max(1.35, Math.min(1.85, 1.45 + lengthAdjustment));
    }

    const roundedUnitless = Math.round(unitless * 100) / 100;
    const pixelLineHeight = Math.round(fontSize * roundedUnitless * 10) / 10;
    const percentage = Math.round(roundedUnitless * 100);

    return {
      unitless: roundedUnitless,
      pixel: pixelLineHeight,
      percentage: percentage,
    };
  }, [fontSize, contentCategory, measureChars]);

  const cssSnippet = `font-size: ${fontSize}px;
line-height: ${calculated.unitless}; /* ${calculated.pixel}px / ${calculated.percentage}% */`;

  const copyCss = () => {
    navigator.clipboard.writeText(cssSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <AlignJustify className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-black">Typographic Parameters</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Content Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "heading", label: "Heading" },
                  { id: "body", label: "Body Text" },
                  { id: "caption", label: "Caption / UI" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setContentCategory(type.id as any);
                      if (type.id === "heading") setFontSize(36);
                      if (type.id === "body") setFontSize(18);
                      if (type.id === "caption") setFontSize(13);
                    }}
                    className={`py-2 px-2 border-2 border-black rounded-xl font-bold text-xs transition-all ${
                      contentCategory === type.id
                        ? "bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-gray-50 hover:bg-purple-50 text-gray-800"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-sm font-bold mb-1">
                <span>Font Size:</span>
                <span className="font-mono text-purple-700">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            {contentCategory === "body" && (
              <div>
                <div className="flex justify-between items-center text-sm font-bold mb-1">
                  <span>Line Length (Measure):</span>
                  <span className="font-mono text-purple-700">{measureChars} characters</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="100"
                  value={measureChars}
                  onChange={(e) => setMeasureChars(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Ideal ergonomic readability is between 45 and 75 characters per line.
                </span>
              </div>
            )}
          </div>

          {/* Results Summary Box */}
          <div className="p-4 border-2 border-black rounded-xl bg-purple-50 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-purple-900 block">
              Calculated Optimal Leading
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 border border-black rounded-lg">
                <span className="text-[10px] text-gray-500 font-bold block">Unitless (CSS)</span>
                <span className="font-mono font-black text-lg text-purple-700">{calculated.unitless}</span>
              </div>
              <div className="bg-white p-2 border border-black rounded-lg">
                <span className="text-[10px] text-gray-500 font-bold block">Pixels (px)</span>
                <span className="font-mono font-black text-lg text-gray-900">{calculated.pixel}px</span>
              </div>
              <div className="bg-white p-2 border border-black rounded-lg">
                <span className="text-[10px] text-gray-500 font-bold block">Percent (%)</span>
                <span className="font-mono font-black text-lg text-gray-900">{calculated.percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Reading Comparison Preview */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Vertical Rhythm Preview</h2>
              <button
                onClick={copyCss}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy CSS"}
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Calculated Ideal */}
              <div className="p-4 border-2 border-black rounded-xl bg-green-50/50">
                <div className="flex justify-between items-center text-xs font-bold text-green-900 mb-2">
                  <span>✓ Optimal Calculated Rhythm (line-height: {calculated.unitless})</span>
                  <span>{calculated.pixel}px</span>
                </div>
                <p
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: calculated.unitless,
                    maxWidth: `${measureChars * 0.55}em`,
                  }}
                  className="font-medium text-gray-900"
                >
                  Typography exists to honor content. Good typography establishes a vigorous vertical rhythm that allows readers to move from the end of one line to the beginning of the next without hesitation or eye strain.
                </p>
              </div>

              {/* Too tight comparison */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 opacity-80">
                <div className="flex justify-between items-center text-xs font-bold text-red-700 mb-1">
                  <span>✕ Too Tight (line-height: 1.1)</span>
                  <span>Colliding ascenders/descenders</span>
                </div>
                <p
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.1,
                    maxWidth: `${measureChars * 0.55}em`,
                  }}
                  className="font-medium text-gray-700"
                >
                  Typography exists to honor content. Good typography establishes a vigorous vertical rhythm that allows readers to move from the end of one line to the beginning of the next without hesitation or eye strain.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-900 text-purple-300 font-mono text-xs rounded-xl border-2 border-black">
            {cssSnippet}
          </div>
        </div>
      </div>
    </div>
  );
}
