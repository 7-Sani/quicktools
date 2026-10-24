"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, TrendingUp, TrendingDown, Percent, AlertCircle, ArrowRight } from "lucide-react";

export default function PercentageChangeCalculatorTool() {
  const [initialValue, setInitialValue] = useState<string>("80");
  const [finalValue, setFinalValue] = useState<string>("120");
  const [copied, setCopied] = useState(false);

  const parsedInitial = parseFloat(initialValue);
  const parsedFinal = parseFloat(finalValue);

  const result = useMemo(() => {
    if (isNaN(parsedInitial) || isNaN(parsedFinal)) {
      return { error: "Please enter valid numeric values for both fields." };
    }

    if (parsedInitial === 0) {
      return {
        error: "Initial value cannot be 0 because division by zero is mathematically undefined.",
      };
    }

    const difference = parsedFinal - parsedInitial;
    const percentageChange = (difference / Math.abs(parsedInitial)) * 100;
    const multiplier = parsedFinal / parsedInitial;

    // Relative percentage difference (symmetric midpoint formula)
    const average = (Math.abs(parsedInitial) + Math.abs(parsedFinal)) / 2;
    const percentageDifference = average > 0 ? (Math.abs(difference) / average) * 100 : 0;

    return {
      difference,
      percentageChange,
      multiplier,
      percentageDifference,
      isIncrease: percentageChange >= 0,
      isValid: true,
    };
  }, [parsedInitial, parsedFinal]);

  const copyBreakdown = () => {
    if (!result.isValid || "error" in result) return;
    const text = `Percentage Change Breakdown:
Initial Value: ${parsedInitial}
Final Value: ${parsedFinal}
Absolute Change: ${result.difference > 0 ? "+" : ""}${result.difference.toFixed(4)}
Percentage Change: ${result.percentageChange > 0 ? "+" : ""}${result.percentageChange.toFixed(2)}% (${result.isIncrease ? "Increase" : "Decrease"})
Multiplier Factor: ${result.multiplier.toFixed(4)}x
Formula: ((Final - Initial) / |Initial|) × 100`;
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
          <strong>Calculation Note:</strong> In financial metrics (e.g., revenue growth, portfolio ROI), percentage change indicates relative performance compared to the baseline period. Note that a 50% drop requires a 100% gain to return to parity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Percent className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-black">Values to Compare</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Initial Value (Baseline / Old)
              </label>
              <input
                type="number"
                step="any"
                value={initialValue}
                onChange={(e) => setInitialValue(e.target.value)}
                placeholder="e.g. 80"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Final Value (Current / New)
              </label>
              <input
                type="number"
                step="any"
                value={finalValue}
                onChange={(e) => setFinalValue(e.target.value)}
                placeholder="e.g. 120"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-bold text-gray-600 self-center">Quick Tests:</span>
              {[
                { init: "100", fin: "150", label: "+50% Gain" },
                { init: "200", fin: "100", label: "-50% Loss" },
                { init: "50", fin: "100", label: "+100% Double" },
              ].map((test, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInitialValue(test.init);
                    setFinalValue(test.fin);
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-gray-100 hover:bg-indigo-100 border border-black rounded-lg transition-colors"
                >
                  {test.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Change Result</h2>
              {result.isValid && !("error" in result) && (
                <button
                  onClick={copyBreakdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-indigo-700" /> : <Copy className="w-3.5 h-3.5" />}
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
                <div
                  className={`p-5 rounded-2xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                    result.isIncrease ? "bg-emerald-50 text-emerald-950" : "bg-rose-50 text-rose-950"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {result.isIncrease ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="text-xs font-black uppercase tracking-wider">
                      {result.isIncrease ? "Percentage Increase" : "Percentage Decrease"}
                    </span>
                  </div>
                  <span className={`text-4xl font-black ${result.isIncrease ? "text-emerald-700" : "text-rose-700"}`}>
                    {result.percentageChange > 0 ? "+" : ""}
                    {result.percentageChange.toFixed(2)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border-2 border-black rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-600 font-bold block">Absolute Difference</span>
                    <span className="font-mono font-black text-lg">
                      {result.difference > 0 ? "+" : ""}
                      {result.difference.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 border-2 border-black rounded-xl bg-purple-50 text-purple-950">
                    <span className="text-xs text-gray-600 font-bold block">Multiplier Ratio</span>
                    <span className="font-mono font-black text-lg">{result.multiplier.toFixed(4)}x</span>
                  </div>
                </div>

                <div className="p-3 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-xs text-gray-700">
                  <strong>Symmetric % Difference (Midpoint):</strong> {result.percentageDifference.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step by Step Breakdown */}
      <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
        <h3 className="text-sm font-black text-gray-800">Mathematical Step-by-Step Breakdown</h3>
        <div className="font-mono text-xs space-y-2 bg-gray-50 p-4 border border-gray-300 rounded-xl">
          <div>Step 1: Calculate Difference = Final ({parsedFinal || 0}) - Initial ({parsedInitial || 0}) = {(parsedFinal - parsedInitial) || 0}</div>
          <div>Step 2: Divide by |Initial| = {((parsedFinal - parsedInitial) || 0)} / {Math.abs(parsedInitial) || 1}</div>
          <div>Step 3: Multiply by 100 = <strong>{result.isValid && !("error" in result) ? `${result.percentageChange.toFixed(2)}%` : "--"}</strong></div>
        </div>
      </div>
    </div>
  );
}
