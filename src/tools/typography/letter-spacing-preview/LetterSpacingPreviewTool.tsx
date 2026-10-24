"use client";

import React, { useState } from "react";
import { TYPOGRAPHY_FONTS } from "@/lib/typographyUtils";
import { Split, Copy, Check, Sliders, Type } from "lucide-react";

export default function LetterSpacingPreviewTool() {
  const [spacingEm, setSpacingEm] = useState<number>(0.08);
  const [fontSize, setFontSize] = useState<number>(28);
  const [fontWeight, setFontWeight] = useState<number>(700);
  const [textTransform, setTextTransform] = useState<"none" | "uppercase" | "lowercase">("uppercase");
  const [sampleText, setSampleText] = useState<string>("EDITORIAL TYPOGRAPHY");
  const [selectedFont, setSelectedFont] = useState<string>(TYPOGRAPHY_FONTS[0].fontFamily);
  const [copied, setCopied] = useState<boolean>(false);

  const cssDeclaration = `letter-spacing: ${spacingEm}em;
text-transform: ${textTransform};
font-size: ${fontSize}px;
font-weight: ${fontWeight};`;

  const copyCss = () => {
    navigator.clipboard.writeText(cssDeclaration);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Split className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-black">Tracking & Kerning</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Sample Text Content
              </label>
              <input
                type="text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-sm font-bold mb-1">
                <span>Letter Spacing:</span>
                <span className="font-mono text-purple-700">{spacingEm}em ({Math.round(spacingEm * fontSize * 10) / 10}px)</span>
              </div>
              <input
                type="range"
                min="-0.08"
                max="0.4"
                step="0.01"
                value={spacingEm}
                onChange={(e) => setSpacingEm(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[11px] font-bold text-gray-500 mt-1">
                <span>Tighter (-0.08em)</span>
                <span>Default (0)</span>
                <span>Expanded (+0.4em)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Font Size ({fontSize}px)
                </label>
                <input
                  type="range"
                  min="14"
                  max="54"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Font Weight ({fontWeight})
                </label>
                <select
                  value={fontWeight}
                  onChange={(e) => setFontWeight(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border-2 border-black rounded-xl font-bold text-xs bg-white"
                >
                  <option value={300}>300 - Light</option>
                  <option value={400}>400 - Regular</option>
                  <option value={600}>600 - Semi-Bold</option>
                  <option value={700}>700 - Bold</option>
                  <option value={800}>800 - Extra Bold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Text Transform</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "none", label: "Normal" },
                  { id: "uppercase", label: "ALL CAPS" },
                  { id: "lowercase", label: "lowercase" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTextTransform(item.id as any)}
                    className={`py-1.5 px-2 border-2 border-black rounded-xl font-bold text-xs transition-all ${
                      textTransform === item.id
                        ? "bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-gray-50 hover:bg-purple-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Font Family</label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs bg-white"
              >
                {TYPOGRAPHY_FONTS.filter((f) => !f.isExternal).map((f) => (
                  <option key={f.id} value={f.fontFamily}>
                    {f.name} (Local)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Comparison Panel */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Live Tracking Comparison</h2>
              <button
                onClick={copyCss}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy CSS"}
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Custom Spacing Box */}
              <div className="p-6 border-2 border-black rounded-xl bg-purple-50/50">
                <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-widest block mb-2">
                  Custom Letter Spacing ({spacingEm}em)
                </span>
                <div
                  style={{
                    fontFamily: selectedFont,
                    fontSize: `${fontSize}px`,
                    fontWeight: fontWeight,
                    letterSpacing: `${spacingEm}em`,
                    textTransform: textTransform,
                    lineHeight: 1.3,
                  }}
                  className="text-gray-900 break-words"
                >
                  {sampleText || "QuickTools Typography"}
                </div>
              </div>

              {/* Default Spacing Box */}
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <span className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-2">
                  Default Zero Spacing (normal)
                </span>
                <div
                  style={{
                    fontFamily: selectedFont,
                    fontSize: `${fontSize}px`,
                    fontWeight: fontWeight,
                    letterSpacing: "normal",
                    textTransform: textTransform,
                    lineHeight: 1.3,
                  }}
                  className="text-gray-600 break-words"
                >
                  {sampleText || "QuickTools Typography"}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-900 text-purple-300 font-mono text-xs rounded-xl border-2 border-black">
            <pre>{cssDeclaration}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
