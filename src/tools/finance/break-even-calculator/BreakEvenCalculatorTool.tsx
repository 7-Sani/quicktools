"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Scale, AlertCircle, DollarSign, Target, TrendingUp } from "lucide-react";

export default function BreakEvenCalculatorTool() {
  const [fixedCosts, setFixedCosts] = useState<string>("12000");
  const [variableCost, setVariableCost] = useState<string>("35");
  const [sellingPrice, setSellingPrice] = useState<string>("75");
  const [targetProfit, setTargetProfit] = useState<string>("5000");
  const [copied, setCopied] = useState(false);

  const parsedFixed = parseFloat(fixedCosts) || 0;
  const parsedVariable = parseFloat(variableCost) || 0;
  const parsedPrice = parseFloat(sellingPrice) || 0;
  const parsedTargetProfit = parseFloat(targetProfit) || 0;

  const result = useMemo(() => {
    if (parsedFixed < 0 || parsedVariable < 0 || parsedPrice <= 0) {
      return { error: "Selling price must be greater than 0, and costs must be non-negative." };
    }

    const unitContribution = parsedPrice - parsedVariable;

    if (unitContribution <= 0) {
      return {
        error: "Selling price must be strictly greater than variable cost per unit to achieve break-even.",
      };
    }

    const contributionMarginRatio = (unitContribution / parsedPrice) * 100;
    const breakEvenUnits = Math.ceil(parsedFixed / unitContribution);
    const breakEvenRevenue = breakEvenUnits * parsedPrice;

    // Target profit calculation
    const unitsForTarget = Math.ceil((parsedFixed + parsedTargetProfit) / unitContribution);
    const revenueForTarget = unitsForTarget * parsedPrice;

    return {
      unitContribution,
      contributionMarginRatio,
      breakEvenUnits,
      breakEvenRevenue,
      unitsForTarget,
      revenueForTarget,
      isValid: true,
    };
  }, [parsedFixed, parsedVariable, parsedPrice, parsedTargetProfit]);

  const copyBreakdown = () => {
    if (!result.isValid || "error" in result) return;
    const text = `Break-Even Analysis:
Fixed Costs: $${parsedFixed.toFixed(2)}
Variable Cost / Unit: $${parsedVariable.toFixed(2)}
Selling Price / Unit: $${parsedPrice.toFixed(2)}
Contribution Margin: $${result.unitContribution.toFixed(2)} (${result.contributionMarginRatio.toFixed(1)}%)
Break-Even Point: ${result.breakEvenUnits.toLocaleString()} units
Break-Even Revenue: $${result.breakEvenRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
For Target Profit of $${parsedTargetProfit}: ${result.unitsForTarget.toLocaleString()} units ($${result.revenueForTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Disclaimer */}
      <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong>Estimate Disclaimer:</strong> This break-even analysis assumes a constant sales price and uniform variable costs. In real operations, volume discounts, capacity constraints, and stepped fixed costs may apply.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Scale className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-black">Cost & Pricing Data</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Total Fixed Costs ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(e.target.value)}
                placeholder="e.g. 12000"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <span className="text-xs text-gray-500 block mt-1">Rent, administrative salaries, insurance, software.</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Variable Cost per Unit ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={variableCost}
                onChange={(e) => setVariableCost(e.target.value)}
                placeholder="e.g. 35"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <span className="text-xs text-gray-500 block mt-1">Direct materials, manufacturing, shipping per unit.</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Selling Price per Unit ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="e.g. 75"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div className="pt-2 border-t border-gray-200">
              <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" /> Target Profit Goal ($) (Optional)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={targetProfit}
                onChange={(e) => setTargetProfit(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-4 py-2 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Break-Even Point</h2>
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
            ) : (
              <div className="mt-6 space-y-5">
                <div className="p-4 rounded-xl border-2 border-black bg-emerald-50 text-emerald-950">
                  <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Break-Even Units</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-700">{result.breakEvenUnits.toLocaleString()}</span>
                    <span className="text-sm font-bold text-gray-700">units to sell</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border-2 border-black rounded-xl bg-blue-50 text-blue-950">
                    <span className="text-xs text-gray-600 font-bold block">Break-Even Revenue</span>
                    <span className="font-mono font-black text-lg">${result.breakEvenRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>

                  <div className="p-3 border-2 border-black rounded-xl bg-purple-50 text-purple-950">
                    <span className="text-xs text-gray-600 font-bold block">Contribution Margin</span>
                    <span className="font-mono font-black text-lg">${result.unitContribution.toFixed(2)}/unit ({result.contributionMarginRatio.toFixed(1)}%)</span>
                  </div>
                </div>

                {parsedTargetProfit > 0 && (
                  <div className="p-4 border-2 border-dashed border-indigo-400 bg-indigo-50 rounded-xl text-indigo-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-sm">
                      <Target className="w-4 h-4 text-indigo-700" />
                      Target Profit Goal: ${parsedTargetProfit.toLocaleString()}
                    </div>
                    <p className="text-xs text-indigo-800 font-semibold">
                      Must sell <strong>{result.unitsForTarget.toLocaleString()} units</strong> ($
                      {result.revenueForTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })} in revenue) to achieve this profit.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formula Card */}
      <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
        <h3 className="text-sm font-black text-gray-800">Formula Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-50 p-2.5 border border-gray-300 rounded font-mono">
            <strong>Break-Even Units</strong> = Fixed Costs / (Selling Price - Variable Cost)
          </div>
          <div className="bg-gray-50 p-2.5 border border-gray-300 rounded font-mono">
            <strong>Break-Even Sales ($)</strong> = Break-Even Units × Selling Price
          </div>
        </div>
      </div>
    </div>
  );
}
