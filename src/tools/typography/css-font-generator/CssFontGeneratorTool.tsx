"use client";

import React, { useState } from "react";
import { Code, Copy, Check, Sliders, Palette, Eye } from "lucide-react";

const FONT_STACKS = [
  {
    name: "System Modern Sans",
    stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  {
    name: "Classic Editorial Serif",
    stack: 'Georgia, Cambria, "Times New Roman", Times, serif',
  },
  {
    name: "Clean Humanist Sans",
    stack: '"Segoe UI", "Open Sans", Calibri, "Trebuchet MS", sans-serif',
  },
  {
    name: "Developer Monospace",
    stack: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
  },
  {
    name: "Geometric / Modern Tech",
    stack: '"Helvetica Neue", Arial, "Liberation Sans", sans-serif',
  },
];

export default function CssFontGeneratorTool() {
  const [selectedStack, setSelectedStack] = useState<string>(FONT_STACKS[0].stack);
  const [fontSize, setFontSize] = useState<number>(20);
  const [sizeUnit, setSizeUnit] = useState<"px" | "rem">("px");
  const [fontWeight, setFontWeight] = useState<number>(600);
  const [fontStyle, setFontStyle] = useState<"normal" | "italic">("normal");
  const [fontVariant, setFontVariant] = useState<"normal" | "small-caps">("normal");
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  const [textTransform, setTextTransform] = useState<"none" | "uppercase" | "capitalize" | "lowercase">("none");
  const [color, setColor] = useState<string>("#111827");
  const [copiedMode, setCopiedMode] = useState<string | null>(null);

  const formattedSize = sizeUnit === "rem" ? `${(fontSize / 16).toFixed(3)}rem` : `${fontSize}px`;

  // Shorthand: font: [style] [variant] [weight] [size]/[line-height] [family]
  const fontShorthand = `font: ${fontStyle !== "normal" ? `${fontStyle} ` : ""}${
    fontVariant !== "normal" ? `${fontVariant} ` : ""
  }${fontWeight} ${formattedSize}/${lineHeight} ${selectedStack};`;

  const individualCss = `font-family: ${selectedStack};
font-size: ${formattedSize};
font-weight: ${fontWeight};
font-style: ${fontStyle};
font-variant: ${fontVariant};
line-height: ${lineHeight};
text-transform: ${textTransform};
color: ${color};`;

  const copyCode = (text: string, mode: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMode(mode);
    setTimeout(() => setCopiedMode(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Code className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-black">CSS Font Properties</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Font Family Fallback Stack
              </label>
              <select
                value={selectedStack}
                onChange={(e) => setSelectedStack(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs bg-gray-50 focus:bg-white"
              >
                {FONT_STACKS.map((s) => (
                  <option key={s.name} value={s.stack}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Size:</span>
                  <span className="font-mono text-purple-700">{formattedSize}</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="64"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Unit</label>
                <div className="flex border-2 border-black rounded-lg overflow-hidden font-bold text-xs">
                  <button
                    type="button"
                    onClick={() => setSizeUnit("px")}
                    className={`flex-1 py-1 ${sizeUnit === "px" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
                  >
                    PX
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeUnit("rem")}
                    className={`flex-1 py-1 ${sizeUnit === "rem" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
                  >
                    REM
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Weight: {fontWeight}
                </label>
                <select
                  value={fontWeight}
                  onChange={(e) => setFontWeight(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border-2 border-black rounded-xl font-bold text-xs bg-white"
                >
                  <option value={300}>300 - Light</option>
                  <option value={400}>400 - Regular</option>
                  <option value={500}>500 - Medium</option>
                  <option value={600}>600 - Semi-Bold</option>
                  <option value={700}>700 - Bold</option>
                  <option value={800}>800 - Extra Bold</option>
                  <option value={900}>900 - Black</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Line Height: {lineHeight}
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="2.2"
                  step="0.05"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Style</label>
                <select
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value as any)}
                  className="w-full px-2 py-1.5 border-2 border-black rounded-xl font-bold text-xs bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Variant</label>
                <select
                  value={fontVariant}
                  onChange={(e) => setFontVariant(e.target.value as any)}
                  className="w-full px-2 py-1.5 border-2 border-black rounded-xl font-bold text-xs bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="small-caps">Small-Caps</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Text Transform</label>
                <select
                  value={textTransform}
                  onChange={(e) => setTextTransform(e.target.value as any)}
                  className="w-full px-2 py-1.5 border-2 border-black rounded-xl font-bold text-xs bg-white"
                >
                  <option value="none">None</option>
                  <option value="uppercase">UPPERCASE</option>
                  <option value="capitalize">Capitalize Words</option>
                  <option value="lowercase">lowercase</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 border-2 border-black rounded-lg cursor-pointer bg-white"
                  />
                  <span className="font-mono text-xs font-bold uppercase">{color}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview & Code Generator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <h3 className="text-xl font-black border-b-2 border-black pb-3">Rendered Visual Preview</h3>

            <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-[160px] flex items-center">
              <div
                style={{
                  fontFamily: selectedStack,
                  fontSize: formattedSize,
                  fontWeight: fontWeight,
                  fontStyle: fontStyle,
                  fontVariant: fontVariant,
                  lineHeight: lineHeight,
                  textTransform: textTransform,
                  color: color,
                }}
                className="w-full break-words"
              >
                The quick brown fox jumps over the lazy dog. 1234567890 &amp; CSS Typography Shorthand.
              </div>
            </div>

            {/* Shorthand Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-gray-700">CSS font Shorthand:</span>
                <button
                  onClick={() => copyCode(fontShorthand, "shorthand")}
                  className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline"
                >
                  {copiedMode === "shorthand" ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedMode === "shorthand" ? "Copied" : "Copy Shorthand"}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-purple-300 font-mono text-xs rounded-xl overflow-x-auto border-2 border-black">
                {fontShorthand}
              </pre>
            </div>

            {/* Individual Properties Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-gray-700">Detailed Declarations:</span>
                <button
                  onClick={() => copyCode(individualCss, "individual")}
                  className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline"
                >
                  {copiedMode === "individual" ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedMode === "individual" ? "Copied" : "Copy All"}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-green-300 font-mono text-xs rounded-xl overflow-x-auto border-2 border-black max-h-40">
                {individualCss}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
