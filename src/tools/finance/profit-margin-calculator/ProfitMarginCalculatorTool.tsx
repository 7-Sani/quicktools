"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, DollarSign, Percent, AlertCircle, HelpCircle } from "lucide-react";

export default function ProfitMarginCalculatorTool() {
  const [cost, setCost] = useState<string>("150");
  const [revenue, setRevenue] = useState<string>("250");
  const [copied, setCopied] = useState(false);

  const parsedCost = parseFloat(cost) || 0;
  const parsedRevenue = parseFloat(revenue) || 0;

  const result = useMemo(() => {
    if (parsedCost < 0 || parsedRevenue < 0) {
      return { error: "Cost and Revenue must be non-negative values." };
    }
    if (parsedRevenue === 0 && parsedCost === 0) {
      return {
        profit: 0,
        margin: 0,
        markup: 0,
        isValid: false,
      };
    }

    const profit = parsedRevenue - parsedCost;
    const margin = parsedRevenue > 0 ? (profit / parsedRevenue) * 100 : 0;
    const markup = parsedCost > 0 ? (profit / parsedCost) * 100 : 0;

    return {
      profit,
      margin,
      markup,
      isValid: true,
    };
  }, [parsedCost, parsedRevenue]);

  const copyBreakdown = () => {
    if (!result.isValid || "error" in result) return;
    const text = `Profit Margin Breakdown:
Cost of Goods Sold (COGS): $${parsedCost.toFixed(2)}
Revenue (Selling Price): $${parsedRevenue.toFixed(2)}
Gross Profit: $${result.profit.toFixed(2)}
Gross Profit Margin: ${result.margin.toFixed(2)}%
Markup on Cost: ${result.markup.toFixed(2)}%`;
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
          <strong>Estimate Disclaimer:</strong> This calculator provides financial estimates based on standard accounting formulas. It is not professional financial, tax, or legal advice. Consult a certified financial planner or CPA for specialized commercial decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-black">Financial Inputs</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Cost of Goods / Service (COGS) ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 150"
                className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold text-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <span className="text-xs text-gray-500 mt-1 block">What it costs you to produce or buy the product.</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Revenue / Selling Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="e.g. 250"
                className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold text-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <span className="text-xs text-gray-500 mt-1 block">The price at which you sell to the customer.</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-bold text-gray-600 self-center">Presets:</span>
              {[
                { c: "50", r: "100", label: "50% Margin" },
                { c: "120", r: "200", label: "40% Margin" },
                { c: "250", r: "300", label: "16.7% Margin" },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCost(preset.c);
                    setRevenue(preset.r);
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-gray-100 hover:bg-emerald-100 border border-black rounded-lg transition-colors"
                >
                  {preset.label}
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
                <Percent className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-black">Profit & Margin</h2>
              </div>
              {result.isValid && !("error" in result) && (
                <button
                  onClick={copyBreakdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            {"error" in result ? (
              <div className="mt-6 p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-800 font-bold">
                {result.error}
              </div>
            ) : !result.isValid ? (
              <div className="mt-6 p-8 text-center text-gray-500 font-bold border-2 border-dashed border-gray-300 rounded-xl">
                Enter cost and revenue to see the profit margin breakdown.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border-2 border-black ${result.profit >= 0 ? "bg-emerald-50 text-emerald-950" : "bg-red-50 text-red-950"}`}>
                    <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Gross Profit</span>
                    <span className="text-2xl font-black">${result.profit.toFixed(2)}</span>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-black bg-blue-50 text-blue-950">
                    <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Profit Margin</span>
                    <span className="text-2xl font-black">{result.margin.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border-2 border-black bg-purple-50 text-purple-950">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Markup on Cost</span>
                      <span className="text-2xl font-black">{result.markup.toFixed(2)}%</span>
                    </div>
                    <span className="text-xs font-medium text-purple-800 max-w-[150px] text-right">
                      {result.markup >= 100 ? `${(result.markup / 100 + 1).toFixed(1)}x cost price` : `+${result.markup.toFixed(1)}% above cost`}
                    </span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>COGS Share: {parsedRevenue > 0 ? ((parsedCost / parsedRevenue) * 100).toFixed(1) : 0}%</span>
                    <span>Profit Share: {result.margin > 0 ? result.margin.toFixed(1) : 0}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 border-2 border-black rounded-full overflow-hidden flex">
                    <div
                      className="bg-gray-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, parsedRevenue > 0 ? (parsedCost / parsedRevenue) * 100 : 0))}%` }}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${result.profit >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(100, Math.max(0, result.margin > 0 ? result.margin : 0))}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Margin vs Markup Explanation & Formulas */}
      <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <HelpCircle className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-black">Profit Margin vs. Markup: Understanding the Key Difference</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
            <h4 className="font-black text-blue-950 text-base mb-2">Profit Margin (%)</h4>
            <p className="mb-2">
              Profit margin is the percentage of the <strong>selling price (revenue)</strong> that turns into gross profit. It can never exceed 100%.
            </p>
            <div className="bg-white p-2.5 border border-blue-300 rounded font-mono text-xs font-bold text-blue-900">
              Margin = ((Revenue - Cost) / Revenue) × 100
            </div>
            <p className="mt-2 text-xs text-blue-800">
              Example: Sell for $100 with $60 cost &rarr; $40 profit / $100 = <strong>40% Margin</strong>
            </p>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-xl">
            <h4 className="font-black text-purple-950 text-base mb-2">Markup (%)</h4>
            <p className="mb-2">
              Markup is the percentage added to the <strong>cost price</strong> to arrive at the selling price. Markup can easily exceed 100%.
            </p>
            <div className="bg-white p-2.5 border border-purple-300 rounded font-mono text-xs font-bold text-purple-900">
              Markup = ((Revenue - Cost) / Cost) × 100
            </div>
            <p className="mt-2 text-xs text-purple-800">
              Example: Buy for $60 and sell for $100 &rarr; $40 profit / $60 = <strong>66.67% Markup</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
