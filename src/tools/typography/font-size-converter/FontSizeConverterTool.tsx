"use client";

import React, { useState } from "react";
import { Ruler, Copy, Check, Sliders, ArrowRightLeft } from "lucide-react";

export default function FontSizeConverterTool() {
  const [basePx, setBasePx] = useState<number>(16);
  const [pxValue, setPxValue] = useState<string>("24");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const numericPx = parseFloat(pxValue) || 0;
  const remValue = basePx > 0 ? (numericPx / basePx).toFixed(4).replace(/\.?0+$/, "") : "0";
  const emValue = remValue; // Assuming 1em = base for root
  const ptValue = (numericPx * 0.75).toFixed(2).replace(/\.?0+$/, "");
  const percentValue = basePx > 0 ? ((numericPx / basePx) * 100).toFixed(1).replace(/\.?0+$/, "") : "0";

  const handlePxChange = (val: string) => setPxValue(val);
  const handleRemChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setPxValue((num * basePx).toFixed(2).replace(/\.?0+$/, ""));
  };
  const handlePtChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setPxValue((num / 0.75).toFixed(2).replace(/\.?0+$/, ""));
  };
  const handlePercentChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setPxValue(((num / 100) * basePx).toFixed(2).replace(/\.?0+$/, ""));
  };

  const copySnippet = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const STANDARD_SCALE = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Configuration bar */}
      <div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-black">Base Root Font Size (1rem = X px):</h2>
        </div>
        <div className="flex items-center gap-2">
          {[14, 16, 18, 20].map((b) => (
            <button
              key={b}
              onClick={() => setBasePx(b)}
              className={`px-3 py-1 border-2 border-black rounded-lg text-xs font-black transition-colors ${
                basePx === b ? "bg-purple-600 text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {b}px
            </button>
          ))}
          <input
            type="number"
            min="1"
            value={basePx}
            onChange={(e) => setBasePx(Number(e.target.value) || 16)}
            className="w-16 px-2 py-1 border-2 border-black rounded-lg text-xs font-bold text-center font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Converter Inputs */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-black">Bidirectional Size Units</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Pixels (px)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={pxValue}
                  onChange={(e) => handlePxChange(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold font-mono text-lg bg-gray-50 focus:bg-white"
                />
                <button
                  onClick={() => copySnippet(`${pxValue}px`, "px")}
                  className="px-3 py-2.5 border-2 border-black rounded-xl bg-gray-100 hover:bg-purple-100 font-bold text-xs"
                >
                  {copiedText === "px" ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Root Element Units (rem)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={remValue}
                  onChange={(e) => handleRemChange(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold font-mono text-lg bg-gray-50 focus:bg-white"
                />
                <button
                  onClick={() => copySnippet(`${remValue}rem`, "rem")}
                  className="px-3 py-2.5 border-2 border-black rounded-xl bg-gray-100 hover:bg-purple-100 font-bold text-xs"
                >
                  {copiedText === "rem" ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Points (pt) — Print & Document
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={ptValue}
                  onChange={(e) => handlePtChange(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold font-mono text-lg bg-gray-50 focus:bg-white"
                />
                <button
                  onClick={() => copySnippet(`${ptValue}pt`, "pt")}
                  className="px-3 py-2.5 border-2 border-black rounded-xl bg-gray-100 hover:bg-purple-100 font-bold text-xs"
                >
                  {copiedText === "pt" ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Percentage (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={percentValue}
                  onChange={(e) => handlePercentChange(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold font-mono text-lg bg-gray-50 focus:bg-white"
                />
                <button
                  onClick={() => copySnippet(`${percentValue}%`, "percent")}
                  className="px-3 py-2.5 border-2 border-black rounded-xl bg-gray-100 hover:bg-purple-100 font-bold text-xs"
                >
                  {copiedText === "percent" ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Size Rendering Preview */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xl font-black border-b-2 border-black pb-3">Visual Render Preview</h3>
            <div className="mt-6 p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-[200px] flex flex-col justify-center items-center text-center overflow-hidden">
              <span
                style={{ fontSize: `${Math.min(numericPx, 72)}px`, lineHeight: 1.2 }}
                className="font-bold text-gray-900 break-words max-w-full"
              >
                Aa QuickTools
              </span>
              <span className="text-xs font-mono text-gray-500 mt-2 block">
                {numericPx}px / {remValue}rem ({ptValue}pt)
              </span>
            </div>
          </div>

          <div className="p-4 border-2 border-black rounded-xl bg-purple-50 text-xs text-purple-950 space-y-1">
            <strong>Conversion Formulas:</strong>
            <p>• REM = Pixels / Base ({basePx}px)</p>
            <p>• Points (pt) = Pixels × 0.75 (standard 72pt/96dpi screen)</p>
            <p>• Percent = (Pixels / Base) × 100</p>
          </div>
        </div>
      </div>

      {/* Standard Scale Reference Table */}
      <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <h3 className="text-lg font-black">Standard Typography Scale Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 border-b-2 border-black font-black uppercase">
              <tr>
                <th className="py-2.5 px-3">Pixels (px)</th>
                <th className="py-2.5 px-3">REM (Base {basePx}px)</th>
                <th className="py-2.5 px-3">Points (pt)</th>
                <th className="py-2.5 px-3">Percent (%)</th>
                <th className="py-2.5 px-3">Preview</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {STANDARD_SCALE.map((px) => {
                const rem = (px / basePx).toFixed(4).replace(/\.?0+$/, "");
                const pt = (px * 0.75).toFixed(2).replace(/\.?0+$/, "");
                const pct = ((px / basePx) * 100).toFixed(0);
                return (
                  <tr key={px} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-bold">{px}px</td>
                    <td className="py-2 px-3 text-purple-700 font-bold">{rem}rem</td>
                    <td className="py-2 px-3">{pt}pt</td>
                    <td className="py-2 px-3">{pct}%</td>
                    <td className="py-2 px-3 font-sans">
                      <span style={{ fontSize: `${px}px` }} className="font-bold line-clamp-1">
                        Typography
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => setPxValue(px.toString())}
                        className="px-2 py-1 bg-gray-100 hover:bg-purple-100 border border-black rounded text-[11px] font-bold"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
