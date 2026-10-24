"use client";

import React, { useState, useEffect } from "react";
import { TYPOGRAPHY_FONTS, loadExternalFont } from "@/lib/typographyUtils";
import { Columns, Copy, Check, Sliders, Globe, Laptop, Sparkles } from "lucide-react";

const PAIRING_PRESETS = [
  {
    name: "Modern Editorial",
    headingId: "playfair",
    bodyId: "inter",
    desc: "Sophisticated editorial serif paired with crisp neutral sans.",
  },
  {
    name: "Tech & Product",
    headingId: "space-grotesk",
    bodyId: "system-sans",
    desc: "Punchy geometric display paired with clean system UI sans.",
  },
  {
    name: "Classic Publication",
    headingId: "georgia",
    bodyId: "trebuchet",
    desc: "100% offline, zero-network system fonts with timeless contrast.",
  },
  {
    name: "Developer Documentation",
    headingId: "poppins",
    bodyId: "fira-code",
    desc: "Modern rounded sans headings paired with developer monospace.",
  },
];

export default function FontPairingPreviewTool() {
  const [headingFontId, setHeadingFontId] = useState("playfair");
  const [bodyFontId, setBodyFontId] = useState("inter");
  const [headingSize, setHeadingSize] = useState(36);
  const [bodySize, setBodySize] = useState(16);
  const [headingWeight, setHeadingWeight] = useState(700);
  const [bodyWeight, setBodyWeight] = useState(400);
  const [headingSpacing, setHeadingSpacing] = useState(0);
  const [bodyLineHeight, setBodyLineHeight] = useState(1.6);
  const [copied, setCopied] = useState(false);

  const headingFont = TYPOGRAPHY_FONTS.find((f) => f.id === headingFontId) || TYPOGRAPHY_FONTS[0];
  const bodyFont = TYPOGRAPHY_FONTS.find((f) => f.id === bodyFontId) || TYPOGRAPHY_FONTS[1];

  // Load external fonts on demand
  useEffect(() => {
    loadExternalFont(headingFont);
    loadExternalFont(bodyFont);
  }, [headingFont, bodyFont]);

  const cssCode = `/* Headings */
h1, h2, h3, .heading {
  font-family: ${headingFont.fontFamily};
  font-size: ${headingSize}px;
  font-weight: ${headingWeight};
  letter-spacing: ${headingSpacing}px;
}

/* Body Text */
p, body, .copy {
  font-family: ${bodyFont.fontFamily};
  font-size: ${bodySize}px;
  font-weight: ${bodyWeight};
  line-height: ${bodyLineHeight};
}`;

  const copyCss = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset: typeof PAIRING_PRESETS[0]) => {
    setHeadingFontId(preset.headingId);
    setBodyFontId(preset.bodyId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Notice regarding font source */}
      {(headingFont.isExternal || bodyFont.isExternal) && (
        <div className="bg-blue-50 border-2 border-blue-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-blue-900 font-semibold shadow-[2px_2px_0px_0px_rgba(59,130,246,1)]">
          <Globe className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>External Font Notice:</strong> One or both selected fonts are loaded dynamically from Google Fonts CDN. No large offline libraries are bundled.
          </span>
        </div>
      )}

      {/* Quick Presets */}
      <div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-1.5 font-black text-sm mb-3">
          <Sparkles className="w-4 h-4 text-purple-600" /> Curated Type Pairings:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PAIRING_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="text-left p-3 border-2 border-black rounded-xl hover:bg-purple-50 transition-colors bg-gray-50 flex flex-col justify-between"
            >
              <div>
                <span className="font-bold text-xs block text-black">{p.name}</span>
                <span className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{p.desc}</span>
              </div>
              <span className="text-[10px] font-mono text-purple-700 font-bold mt-2">
                Apply &rarr;
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Sliders className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-black">Typography Controls</h2>
          </div>

          {/* Heading Settings */}
          <div className="space-y-3 p-4 border-2 border-black rounded-xl bg-purple-50/40">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-purple-950">Heading Font</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                headingFont.isExternal ? "bg-blue-100 text-blue-900 border-blue-400" : "bg-green-100 text-green-900 border-green-500"
              }`}>
                {headingFont.isExternal ? "🌐 Google Font" : "💻 Local System"}
              </span>
            </div>

            <select
              value={headingFontId}
              onChange={(e) => setHeadingFontId(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded-lg font-bold text-sm bg-white"
            >
              <optgroup label="System & Local Fonts">
                {TYPOGRAPHY_FONTS.filter((f) => !f.isExternal).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Local)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Web / Google Fonts">
                {TYPOGRAPHY_FONTS.filter((f) => f.isExternal).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Google Font)
                  </option>
                ))}
              </optgroup>
            </select>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Size: {headingSize}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="64"
                  value={headingSize}
                  onChange={(e) => setHeadingSize(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Weight: {headingWeight}
                </label>
                <select
                  value={headingWeight}
                  onChange={(e) => setHeadingWeight(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-black rounded font-bold text-xs bg-white"
                >
                  {headingFont.weights.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Letter Spacing: {headingSpacing}px
              </label>
              <input
                type="range"
                min="-2"
                max="8"
                step="0.5"
                value={headingSpacing}
                onChange={(e) => setHeadingSpacing(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          {/* Body Settings */}
          <div className="space-y-3 p-4 border-2 border-black rounded-xl bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-gray-800">Body Font</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                bodyFont.isExternal ? "bg-blue-100 text-blue-900 border-blue-400" : "bg-green-100 text-green-900 border-green-500"
              }`}>
                {bodyFont.isExternal ? "🌐 Google Font" : "💻 Local System"}
              </span>
            </div>

            <select
              value={bodyFontId}
              onChange={(e) => setBodyFontId(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded-lg font-bold text-sm bg-white"
            >
              <optgroup label="System & Local Fonts">
                {TYPOGRAPHY_FONTS.filter((f) => !f.isExternal).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Local)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Web / Google Fonts">
                {TYPOGRAPHY_FONTS.filter((f) => f.isExternal).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Google Font)
                  </option>
                ))}
              </optgroup>
            </select>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Size: {bodySize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={bodySize}
                  onChange={(e) => setBodySize(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Line Height: {bodyLineHeight}
                </label>
                <input
                  type="range"
                  min="1.2"
                  max="2.0"
                  step="0.05"
                  value={bodyLineHeight}
                  onChange={(e) => setBodyLineHeight(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Live Type Preview</h2>
              <button
                onClick={copyCss}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy CSS"}
              </button>
            </div>

            {/* Editorial Showcase */}
            <div className="space-y-4 p-6 border-2 border-gray-200 rounded-xl bg-white">
              <span className="text-xs font-mono font-bold text-purple-600 uppercase tracking-widest block">
                Featured Editorial
              </span>
              <h1
                style={{
                  fontFamily: headingFont.fontFamily,
                  fontSize: `${headingSize}px`,
                  fontWeight: headingWeight,
                  letterSpacing: `${headingSpacing}px`,
                  lineHeight: 1.15,
                }}
                className="text-gray-900"
              >
                The Art of Typographic Balance and Rhythm
              </h1>
              <p
                style={{
                  fontFamily: bodyFont.fontFamily,
                  fontSize: `${bodySize}px`,
                  fontWeight: bodyWeight,
                  lineHeight: bodyLineHeight,
                }}
                className="text-gray-700"
              >
                Typography is the craft of endowing human language with a durable visual form. When heading and body typefaces harmonize, content reads effortlessly, drawing the reader into the narrative while sustaining visual authority across responsive viewports.
              </p>
              <div className="pt-2">
                <button
                  style={{ fontFamily: bodyFont.fontFamily }}
                  className="px-4 py-2 bg-black text-white font-bold text-xs rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Continue Reading &rarr;
                </button>
              </div>
            </div>

            {/* CSS Snippet Box */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-gray-700 block">Generated CSS:</span>
              <pre className="p-3 bg-gray-900 text-purple-300 font-mono text-xs rounded-xl overflow-x-auto border-2 border-black">
                {cssCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
