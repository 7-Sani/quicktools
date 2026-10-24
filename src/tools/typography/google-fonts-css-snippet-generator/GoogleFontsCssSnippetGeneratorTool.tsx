"use client";

import React, { useState, useMemo } from "react";
import { ExternalLink, Copy, Check, Globe, Sliders, Code, Info } from "lucide-react";

interface PopularFont {
  name: string;
  category: "sans-serif" | "serif" | "monospace" | "display";
  defaultWeights: number[];
}

const GOOGLE_FONTS_CATALOG: PopularFont[] = [
  { name: "Inter", category: "sans-serif", defaultWeights: [400, 500, 600, 700] },
  { name: "Roboto", category: "sans-serif", defaultWeights: [300, 400, 500, 700] },
  { name: "Poppins", category: "sans-serif", defaultWeights: [300, 400, 600, 700] },
  { name: "Open Sans", category: "sans-serif", defaultWeights: [400, 600, 700] },
  { name: "Montserrat", category: "sans-serif", defaultWeights: [400, 500, 700, 800] },
  { name: "Playfair Display", category: "serif", defaultWeights: [400, 600, 700, 900] },
  { name: "Merriweather", category: "serif", defaultWeights: [300, 400, 700] },
  { name: "Space Grotesk", category: "display", defaultWeights: [400, 600, 700] },
  { name: "Fira Code", category: "monospace", defaultWeights: [400, 500, 700] },
  { name: "DM Sans", category: "sans-serif", defaultWeights: [400, 500, 700] },
  { name: "Lora", category: "serif", defaultWeights: [400, 600, 700] },
  { name: "Oswald", category: "sans-serif", defaultWeights: [400, 600, 700] },
];

const ALL_WEIGHTS = [
  { weight: 100, label: "100 Thin" },
  { weight: 200, label: "200 Extra Light" },
  { weight: 300, label: "300 Light" },
  { weight: 400, label: "400 Regular" },
  { weight: 500, label: "500 Medium" },
  { weight: 600, label: "600 Semi-Bold" },
  { weight: 700, label: "700 Bold" },
  { weight: 800, label: "800 Extra-Bold" },
  { weight: 900, label: "900 Black" },
];

export default function GoogleFontsCssSnippetGeneratorTool() {
  const [selectedFontName, setSelectedFontName] = useState<string>("Poppins");
  const [customFontInput, setCustomFontInput] = useState<string>("");
  const [selectedWeights, setSelectedWeights] = useState<number[]>([400, 600, 700]);
  const [includeItalics, setIncludeItalics] = useState<boolean>(false);
  const [fontDisplay, setFontDisplay] = useState<string>("swap");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeFontName = customFontInput.trim() || selectedFontName;
  const currentCatalogItem = GOOGLE_FONTS_CATALOG.find(
    (f) => f.name.toLowerCase() === activeFontName.toLowerCase()
  );
  const fallbackCategory = currentCatalogItem ? currentCatalogItem.category : "sans-serif";

  const toggleWeight = (weight: number) => {
    if (selectedWeights.includes(weight)) {
      if (selectedWeights.length > 1) {
        setSelectedWeights(selectedWeights.filter((w) => w !== weight));
      }
    } else {
      setSelectedWeights([...selectedWeights, weight].sort((a, b) => a - b));
    }
  };

  const snippets = useMemo(() => {
    const formattedFamily = activeFontName.replace(/\s+/g, "+");
    const sortedWeights = selectedWeights.slice().sort((a, b) => a - b);

    let weightSpec = "";
    if (includeItalics) {
      const normalPairs = sortedWeights.map((w) => `0,${w}`);
      const italicPairs = sortedWeights.map((w) => `1,${w}`);
      weightSpec = `:ital,wght@${[...normalPairs, ...italicPairs].join(";")}`;
    } else {
      weightSpec = `:wght@${sortedWeights.join(";")}`;
    }

    const fontUrl = `https://fonts.googleapis.com/css2?family=${formattedFamily}${weightSpec}&display=${fontDisplay}`;

    const htmlLinkSnippet = `<!-- Google Fonts Embed Code (Requires External Network Request) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontUrl}" rel="stylesheet">`;

    const cssImportSnippet = `/* CSS @import */
@import url('${fontUrl}');`;

    const cssRuleSnippet = `/* CSS Font Family Declaration */
font-family: '${activeFontName}', ${fallbackCategory};`;

    return {
      fontUrl,
      htmlLinkSnippet,
      cssImportSnippet,
      cssRuleSnippet,
    };
  }, [activeFontName, selectedWeights, includeItalics, fontDisplay, fallbackCategory]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Explicit External Notice */}
      <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]">
        <Globe className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed space-y-1">
          <p>
            <strong>External Service Transparency:</strong> Google Fonts is a third-party typography service hosted on Google CDN servers. Embedding these snippets instructs user web browsers to fetch font assets over the internet from <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">fonts.googleapis.com</code>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Font Configuration Panel */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <ExternalLink className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-black">Font Selection</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Popular Fonts
              </label>
              <select
                value={selectedFontName}
                onChange={(e) => {
                  setSelectedFontName(e.target.value);
                  setCustomFontInput("");
                  const item = GOOGLE_FONTS_CATALOG.find((f) => f.name === e.target.value);
                  if (item) setSelectedWeights(item.defaultWeights);
                }}
                className="w-full px-3 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white text-sm"
              >
                {GOOGLE_FONTS_CATALOG.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} ({f.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Or Type Any Custom Google Font Name
              </label>
              <input
                type="text"
                value={customFontInput}
                onChange={(e) => setCustomFontInput(e.target.value)}
                placeholder="e.g. Plus Jakarta Sans, Outfit..."
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50 text-xs focus:bg-white"
              />
            </div>

            {/* Weights multi-select */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Font Weights to Include
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ALL_WEIGHTS.map(({ weight, label }) => {
                  const isChecked = selectedWeights.includes(weight);
                  return (
                    <button
                      key={weight}
                      type="button"
                      onClick={() => toggleWeight(weight)}
                      className={`py-1.5 px-2 border-2 border-black rounded-lg text-xs font-bold transition-all text-left truncate ${
                        isChecked
                          ? "bg-purple-600 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {weight} {weight === 400 ? "(Regular)" : weight === 700 ? "(Bold)" : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Display & Italics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  font-display
                </label>
                <select
                  value={fontDisplay}
                  onChange={(e) => setFontDisplay(e.target.value)}
                  className="w-full px-2 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
                >
                  <option value="swap">swap (Recommended)</option>
                  <option value="block">block</option>
                  <option value="fallback">fallback</option>
                  <option value="optional">optional</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="includeItalics"
                  checked={includeItalics}
                  onChange={(e) => setIncludeItalics(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-black accent-purple-600 cursor-pointer"
                />
                <label htmlFor="includeItalics" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Include Italics
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Snippets Generator Output */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="text-xl font-black">Embed Snippets</h2>
            <button
              onClick={() => copyText(`${snippets.htmlLinkSnippet}\n\n${snippets.cssRuleSnippet}`, "all")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              {copiedKey === "all" ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === "all" ? "Copied" : "Copy All"}
            </button>
          </div>

          <div className="space-y-4">
            {/* HTML Link */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black uppercase text-gray-700">
                <span>1. HTML &lt;head&gt; Link Tag:</span>
                <button
                  onClick={() => copyText(snippets.htmlLinkSnippet, "link")}
                  className="text-purple-700 hover:underline flex items-center gap-1"
                >
                  {copiedKey === "link" ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "link" ? "Copied" : "Copy HTML"}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-purple-300 font-mono text-xs rounded-xl overflow-x-auto border-2 border-black leading-relaxed">
                {snippets.htmlLinkSnippet}
              </pre>
            </div>

            {/* CSS @import */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black uppercase text-gray-700">
                <span>2. CSS @import (Alternative):</span>
                <button
                  onClick={() => copyText(snippets.cssImportSnippet, "import")}
                  className="text-purple-700 hover:underline flex items-center gap-1"
                >
                  {copiedKey === "import" ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "import" ? "Copied" : "Copy CSS @import"}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-blue-300 font-mono text-xs rounded-xl overflow-x-auto border-2 border-black">
                {snippets.cssImportSnippet}
              </pre>
            </div>

            {/* CSS font-family rule */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black uppercase text-gray-700">
                <span>3. CSS Rule to apply:</span>
                <button
                  onClick={() => copyText(snippets.cssRuleSnippet, "rule")}
                  className="text-purple-700 hover:underline flex items-center gap-1"
                >
                  {copiedKey === "rule" ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "rule" ? "Copied" : "Copy Rule"}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-green-300 font-mono text-xs rounded-xl overflow-x-auto border-2 border-black">
                {snippets.cssRuleSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
