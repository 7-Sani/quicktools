"use client";

import React, { useState } from "react";
import { TYPOGRAPHY_FONTS } from "@/lib/typographyUtils";
import { Type, Sliders, Columns, AlignLeft, AlignCenter, AlignJustify, Moon, Sun, Smartphone, Monitor } from "lucide-react";

export default function TextPreviewPlaygroundTool() {
  const [fontFamily, setFontFamily] = useState(TYPOGRAPHY_FONTS[1].fontFamily); // Georgia
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [fontWeight, setFontWeight] = useState(400);
  const [columns, setColumns] = useState<number>(1);
  const [columnGap, setColumnGap] = useState<number>(32);
  const [enableDropCap, setEnableDropCap] = useState(true);
  const [textAlign, setTextAlign] = useState<"left" | "justify" | "center">("left");
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("light");
  const [viewportWidth, setViewportWidth] = useState<"full" | "mobile" | "tablet">("full");

  const [text, setText] = useState(
    `Typography has one plain duty before it and that is to convey information in writing. No argument or excuse can absolve it from this duty. A printed work which cannot be read becomes a product without purpose.

Good typography begins with the selection of a robust typeface suitable for the communicative task. It builds through consistent vertical rhythm, measured line lengths, and deliberate hierarchical emphasis. Whether rendered on parchment or OLED displays, the timeless principles of legibility remain immutable.`
  );

  const paragraphs = text.split("\n\n").filter(Boolean);

  const themeStyles = {
    light: "bg-white text-gray-900 border-gray-300",
    dark: "bg-gray-950 text-gray-100 border-gray-800",
    sepia: "bg-[#FBF0D9] text-[#433422] border-[#E2D2B0]",
  };

  const viewportWidths = {
    full: "w-full",
    tablet: "max-w-[640px] mx-auto",
    mobile: "max-w-[360px] mx-auto",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Controls Toolbar */}
      <div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-black">Typesetting Controls</h2>
        </div>

        {/* Viewport Width toggles */}
        <div className="flex items-center gap-1 border-2 border-black rounded-xl p-1 bg-gray-50">
          <button
            onClick={() => setViewportWidth("full")}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
              viewportWidth === "full" ? "bg-purple-600 text-white" : "text-gray-700"
            }`}
            title="Desktop / Full Width"
          >
            <Monitor className="w-3.5 h-3.5" /> Full
          </button>
          <button
            onClick={() => setViewportWidth("tablet")}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
              viewportWidth === "tablet" ? "bg-purple-600 text-white" : "text-gray-700"
            }`}
            title="Tablet (640px)"
          >
            Tablet
          </button>
          <button
            onClick={() => setViewportWidth("mobile")}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
              viewportWidth === "mobile" ? "bg-purple-600 text-white" : "text-gray-700"
            }`}
            title="Mobile (360px)"
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>

        {/* Background themes */}
        <div className="flex items-center gap-1 border-2 border-black rounded-xl p-1 bg-gray-50">
          <button
            onClick={() => setTheme("light")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              theme === "light" ? "bg-black text-white" : "text-gray-700"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme("sepia")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              theme === "sepia" ? "bg-[#433422] text-[#FBF0D9]" : "text-gray-700"
            }`}
          >
            Sepia
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              theme === "dark" ? "bg-purple-600 text-white" : "text-gray-700"
            }`}
          >
            Dark
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Column */}
        <div className="lg:col-span-4 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <h3 className="text-lg font-black border-b-2 border-black pb-2">Layout & Typography</h3>

          <div className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-gray-700 mb-1">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-xl bg-gray-50 font-bold"
              >
                {TYPOGRAPHY_FONTS.filter((f) => !f.isExternal).map((f) => (
                  <option key={f.id} value={f.fontFamily}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Font Size:</span>
                <span className="font-mono text-purple-700">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="32"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Line Height:</span>
                <span className="font-mono text-purple-700">{lineHeight}</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="2.2"
                step="0.05"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Columns</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((col) => (
                  <button
                    key={col}
                    onClick={() => setColumns(col)}
                    className={`py-1.5 border-2 border-black rounded-xl font-black ${
                      columns === col ? "bg-purple-600 text-white" : "bg-gray-100"
                    }`}
                  >
                    {col} {col === 1 ? "Col" : "Cols"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Text Alignment</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "left", label: "Left" },
                  { id: "justify", label: "Justify" },
                  { id: "center", label: "Center" },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setTextAlign(a.id as any)}
                    className={`py-1.5 border-2 border-black rounded-xl font-bold ${
                      textAlign === a.id ? "bg-purple-600 text-white" : "bg-gray-100"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <input
                type="checkbox"
                id="dropCap"
                checked={enableDropCap}
                onChange={(e) => setEnableDropCap(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-black accent-purple-600 cursor-pointer"
              />
              <label htmlFor="dropCap" className="text-gray-800 cursor-pointer">
                Enable Editorial Drop Cap (Initial Letter)
              </label>
            </div>
          </div>
        </div>

        {/* Live Playground Showcase */}
        <div className="lg:col-span-8 space-y-6">
          <div
            className={`border-4 border-black p-6 sm:p-10 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
              themeStyles[theme]
            } ${viewportWidths[viewportWidth]}`}
          >
            <div
              style={{
                fontFamily: fontFamily,
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                fontWeight: fontWeight,
                textAlign: textAlign,
                columnCount: columns,
                columnGap: `${columnGap}px`,
              }}
              className="space-y-4"
            >
              {paragraphs.map((p, idx) => {
                if (idx === 0 && enableDropCap && p.length > 0) {
                  const firstLetter = p.charAt(0);
                  const rest = p.slice(1);
                  return (
                    <p key={idx} className="leading-relaxed">
                      <span className="float-left text-5xl leading-none font-bold pr-2 pt-1 font-serif">
                        {firstLetter}
                      </span>
                      {rest}
                    </p>
                  );
                }
                return (
                  <p key={idx} className="leading-relaxed">
                    {p}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
