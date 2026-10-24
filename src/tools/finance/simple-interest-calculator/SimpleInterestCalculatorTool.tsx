"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, DollarSign, Percent, AlertCircle, Clock, BookOpen } from "lucide-react";

export default function SimpleInterestCalculatorTool() {
  const [principal, setPrincipal] = useState<string>("5000");
  const [rate, setRate] = useState<string>("6");
  const [time, setTime] = useState<string>("3");
  const [timeUnit, setTimeUnit] = useState<"years" | "months" | "days">("years");
  const [copied, setCopied] = useState(false);

  const parsedPrincipal = parseFloat(principal) || 0;
  const parsedRate = parseFloat(rate) || 0;
  const parsedTime = parseFloat(time) || 0;

  const result = useMemo(() => {
    if (parsedPrincipal < 0 || parsedRate < 0 || parsedTime < 0) {
      return { error: "Please enter non-negative numbers for all fields." };
    }

    // Convert time to years
    let timeInYears = parsedTime;
    if (timeUnit === "months") timeInYears = parsedTime / 12;
    if (timeUnit === "days") timeInYears = parsedTime / 365;

    // Simple interest formula: I = (P * R * T) / 100
    const interest = (parsedPrincipal * parsedRate * timeInYears) / 100;
    const totalAmount = parsedPrincipal + interest;

    // Equivalent annual and monthly interest
    const annualInterest = (parsedPrincipal * parsedRate) / 100;
    const monthlyInterest = annualInterest / 12;

    // Compound interest comparison (compounded annually)
    const compoundAmount = parsedPrincipal * Math.pow(1 + parsedRate / 100, timeInYears);
    const compoundInterest = compoundAmount - parsedPrincipal;

    return {
      timeInYears,
      interest,
      totalAmount,
      annualInterest,
      monthlyInterest,
      compoundDifference: compoundInterest - interest,
      isValid: true,
    };
  }, [parsedPrincipal, parsedRate, parsedTime, timeUnit]);

  const copyBreakdown = () => {
    if (!result.isValid || "error" in result) return;
    const text = `Simple Interest Breakdown:
Principal Amount (P): $${parsedPrincipal.toFixed(2)}
Annual Rate (R): ${parsedRate}%
Time (T): ${parsedTime} ${timeUnit} (${result.timeInYears.toFixed(2)} years)
Total Simple Interest (I): $${result.interest.toFixed(2)}
Total Maturity Amount (A): $${result.totalAmount.toFixed(2)}
Formula: I = (P × R × T) / 100`;
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
          <strong>Estimate Disclaimer:</strong> Simple interest applies only to non-compounding debt instruments, promissory notes, or specific short-term loans. Most modern commercial bank accounts and credit cards use compound interest.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-black">Loan / Deposit Values</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Principal Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold text-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Annual Interest Rate (% per year)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g. 6.0"
                className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold text-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Time Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold text-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value as "years" | "months" | "days")}
                  className="w-full px-3 py-3 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Percent className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-black">Interest & Maturity</h2>
              </div>
              {result.isValid && !("error" in result) && (
                <button
                  onClick={copyBreakdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-blue-700" /> : <Copy className="w-3.5 h-3.5" />}
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
                <div className="p-4 rounded-xl border-2 border-black bg-blue-50 text-blue-950">
                  <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Total Interest (I)</span>
                  <span className="text-3xl font-black text-blue-700">${result.interest.toFixed(2)}</span>
                </div>

                <div className="p-4 rounded-xl border-2 border-black bg-emerald-50 text-emerald-950">
                  <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Total Maturity Value (P + I)</span>
                  <span className="text-3xl font-black text-emerald-700">${result.totalAmount.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-gray-500 font-bold block">Annual Interest</span>
                    <span className="font-mono font-bold text-sm text-gray-900">${result.annualInterest.toFixed(2)} / yr</span>
                  </div>
                  <div className="p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-gray-500 font-bold block">Monthly Equivalent</span>
                    <span className="font-mono font-bold text-sm text-gray-900">${result.monthlyInterest.toFixed(2)} / mo</span>
                  </div>
                </div>

                {result.compoundDifference > 0.01 && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900">
                    <strong>Compound Difference:</strong> If this compounded annually instead, you would earn an extra <strong>${result.compoundDifference.toFixed(2)}</strong>.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formula Reference */}
      <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex items-center gap-2 border-b-2 border-black pb-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-black">Mathematical Formula Breakdown</h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-700">
          Simple interest is calculated exclusively on the original principal amount, without reinvesting earned interest:
        </p>
        <div className="bg-gray-100 p-3 rounded-lg border border-black font-mono text-sm font-bold">
          I = (P × R × T) / 100
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
          <div>• <strong>P</strong>: Principal sum ($)</div>
          <div>• <strong>R</strong>: Annual rate of interest (%)</div>
          <div>• <strong>T</strong>: Time period in years</div>
        </div>
      </div>
    </div>
  );
}
