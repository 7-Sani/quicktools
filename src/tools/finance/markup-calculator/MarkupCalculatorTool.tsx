"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, DollarSign, Percent, AlertCircle, ArrowRight } from "lucide-react";

export default function MarkupCalculatorTool() {
  const [cost, setCost] = useState<string>("80");
  const [markupPercent, setMarkupPercent] = useState<string>("35");
  const [copied, setCopied] = useState(false);

  const parsedCost = parseFloat(cost) || 0;
  const parsedMarkup = parseFloat(markupPercent) || 0;

  const result = useMemo(() => {
    if (parsedCost < 0 || parsedMarkup < 0) {
      return { error: "Cost and markup percentage must be positive numbers." };
    }

    const profit = parsedCost * (parsedMarkup / 100);
    const sellingPrice = parsedCost + profit;
    const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

    return {
      profit,
      sellingPrice,
      margin,
      isValid: true,
    };
  }, [parsedCost, parsedMarkup]);

  const copyBreakdown = () => {
    if (!result.isValid || "error" in result) return;
    const text = `Markup Calculation:
Cost Price: $${parsedCost.toFixed(2)}
Markup: ${parsedMarkup.toFixed(2)}%
Profit Amount: $${result.profit.toFixed(2)}
Recommended Selling Price: $${result.sellingPrice.toFixed(2)}
Equivalent Profit Margin: ${result.margin.toFixed(2)}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong>Estimate Disclaimer:</strong> This markup calculator provides estimates based on standard retail pricing formulas. Actual profitability may vary based on overhead, sales tax, shipping, and payment processing fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <DollarSign className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black">Cost & Target Markup</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Cost Price (COGS) ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 80"
                className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold text-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <span className="text-xs text-gray-500 mt-1 block">Your purchase or wholesale unit cost.</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Desired Markup (%)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(e.target.value)}
                placeholder="e.g. 35"
                className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold text-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <span className="text-xs text-gray-500 mt-1 block">Percentage added over the base cost.</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-bold text-gray-600 self-center">Popular:</span>
              {[
                { val: "20", label: "20% (Grocery)" },
                { val: "50", label: "50% (Standard)" },
                { val: "100", label: "100% (Keystone)" },
                { val: "200", label: "200% (Boutique)" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setMarkupPercent(item.val)}
                  className="px-2.5 py-1 text-xs font-bold bg-gray-100 hover:bg-purple-100 border border-black rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Percent className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-black">Target Price & Profit</h2>
              </div>
              {result.isValid && !("error" in result) && (
                <button
                  onClick={copyBreakdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            {"error" in result ? (
              <div className="mt-6 p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-800 font-bold">
                {result.error}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl border-2 border-black bg-purple-50 text-purple-950">
                  <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Recommended Selling Price</span>
                  <span className="text-3xl font-black text-purple-700">${result.sellingPrice.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-black bg-emerald-50 text-emerald-950">
                    <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Gross Profit</span>
                    <span className="text-2xl font-black">${result.profit.toFixed(2)}</span>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-black bg-blue-50 text-blue-950">
                    <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Equivalent Margin</span>
                    <span className="text-2xl font-black">{result.margin.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Base Cost:</span>
                    <span>${parsedCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-purple-700">
                    <span>+ Markup ({parsedMarkup}%):</span>
                    <span>+${result.profit.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black border-t border-gray-300 pt-2 text-black">
                    <span>= Selling Price:</span>
                    <span>${result.sellingPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formula & Conversions */}
      <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <h3 className="text-lg font-black border-b-2 border-black pb-2">Pricing Formulas & Equivalent Conversions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="p-4 border-2 border-black rounded-xl bg-gray-50">
            <h4 className="font-bold text-black mb-1">Selling Price Formula</h4>
            <div className="font-mono bg-white p-2 border border-gray-300 rounded text-xs font-bold text-gray-900">
              Selling Price = Cost × (1 + Markup / 100)
            </div>
            <p className="text-xs text-gray-500 mt-2">
              For a 50% markup on $100: $100 × 1.50 = $150
            </p>
          </div>

          <div className="p-4 border-2 border-black rounded-xl bg-gray-50">
            <h4 className="font-bold text-black mb-1">Markup to Margin Conversion</h4>
            <div className="font-mono bg-white p-2 border border-gray-300 rounded text-xs font-bold text-gray-900">
              Margin % = (Markup % / (100 + Markup %)) × 100
            </div>
            <p className="text-xs text-gray-500 mt-2">
              A 100% markup (keystone pricing) results in a 50% gross profit margin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
