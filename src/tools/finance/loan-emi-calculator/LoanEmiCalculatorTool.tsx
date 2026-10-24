"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Landmark, AlertCircle, Calendar, ShieldCheck } from "lucide-react";

interface AmortizationYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balanceRemaining: number;
}

export default function LoanEmiCalculatorTool() {
  const [principal, setPrincipal] = useState<string>("250000");
  const [annualRate, setAnnualRate] = useState<string>("6.5");
  const [tenureYears, setTenureYears] = useState<string>("15");
  const [copied, setCopied] = useState(false);
  const [showAmortization, setShowAmortization] = useState(true);

  const parsedPrincipal = parseFloat(principal) || 0;
  const parsedRate = parseFloat(annualRate) || 0;
  const parsedTenureYears = Math.min(40, Math.max(1, parseFloat(tenureYears) || 1));

  const result = useMemo(() => {
    if (parsedPrincipal <= 0 || parsedRate <= 0 || parsedTenureYears <= 0) {
      return { error: "Please enter valid positive values for Principal, Rate, and Duration." };
    }

    const n = Math.round(parsedTenureYears * 12); // total months
    const r = parsedRate / 12 / 100; // monthly rate

    // Standard EMI formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const factor = Math.pow(1 + r, n);
    const emi = (parsedPrincipal * r * factor) / (factor - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - parsedPrincipal;

    // Build yearly amortization schedule
    let remainingPrincipal = parsedPrincipal;
    const yearlySchedule: AmortizationYear[] = [];

    for (let y = 1; y <= Math.ceil(n / 12); y++) {
      let principalPaidThisYear = 0;
      let interestPaidThisYear = 0;

      for (let m = 1; m <= 12; m++) {
        const currentMonthIndex = (y - 1) * 12 + m;
        if (currentMonthIndex > n) break;

        const interestForMonth = remainingPrincipal * r;
        const principalForMonth = Math.min(remainingPrincipal, emi - interestForMonth);

        principalPaidThisYear += principalForMonth;
        interestPaidThisYear += interestForMonth;
        remainingPrincipal = Math.max(0, remainingPrincipal - principalForMonth);
      }

      yearlySchedule.push({
        year: y,
        principalPaid: principalPaidThisYear,
        interestPaid: interestPaidThisYear,
        balanceRemaining: remainingPrincipal,
      });
    }

    return {
      emi,
      totalPayment,
      totalInterest,
      totalMonths: n,
      yearlySchedule,
      interestPercent: (totalInterest / totalPayment) * 100,
      isValid: true,
    };
  }, [parsedPrincipal, parsedRate, parsedTenureYears]);

  const copyBreakdown = () => {
    if (!result.isValid || "error" in result) return;
    const text = `Loan EMI Breakdown:
Loan Principal: $${parsedPrincipal.toLocaleString()}
Annual Interest Rate: ${parsedRate}%
Tenure: ${parsedTenureYears} Years (${result.totalMonths} months)
Monthly EMI: $${result.emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Total Interest Payable: $${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Total Amount Payable: $${result.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Disclaimer */}
      <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed space-y-1">
          <p>
            <strong>Estimate Disclaimer:</strong> This loan calculator provides estimates using standard reducing-balance amortization. It does not account for processing fees, loan insurance, early prepayment penalties, or fluctuating floating interest rates.
          </p>
          <p className="flex items-center gap-1 font-bold text-amber-800">
            <ShieldCheck className="w-4 h-4" /> No bank credentials or payment details are collected or transmitted.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Landmark className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-black">Loan Parameters</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Loan Principal ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="e.g. 250000"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Annual Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                min="0"
                step="0.05"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                placeholder="e.g. 6.5"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Loan Duration: <span className="text-indigo-700">{parsedTenureYears} Years</span> ({Math.round(parsedTenureYears * 12)} Months)
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-gray-500 mt-1">
                <span>1 Year</span>
                <span>15 Years</span>
                <span>30 Years</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-bold text-gray-600 self-center">Presets:</span>
              {[
                { label: "Home (30y @ 6.5%)", p: "300000", r: "6.5", y: "30" },
                { label: "Auto (5y @ 7%)", p: "35000", r: "7", y: "5" },
                { label: "Personal (3y @ 11%)", p: "15000", r: "11", y: "3" },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrincipal(preset.p);
                    setAnnualRate(preset.r);
                    setTenureYears(preset.y);
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-gray-100 hover:bg-indigo-100 border border-black rounded-lg transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Monthly EMI & Summary</h2>
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
              <div className="mt-6 space-y-6">
                <div className="p-5 rounded-2xl border-3 border-black bg-indigo-50 text-indigo-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase tracking-wider block text-indigo-800">Monthly EMI Payment</span>
                  <span className="text-3xl sm:text-4xl font-black text-indigo-700">
                    ${result.emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-indigo-900 block mt-1">Due each month for {result.totalMonths} installments</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-black bg-gray-50 text-gray-900">
                    <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Total Interest</span>
                    <span className="text-xl sm:text-2xl font-black text-rose-700">
                      ${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-black bg-emerald-50 text-emerald-950">
                    <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Total Amount Payable</span>
                    <span className="text-xl sm:text-2xl font-black">
                      ${result.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Principal: {result.totalPayment > 0 ? ((parsedPrincipal / result.totalPayment) * 100).toFixed(1) : 0}%</span>
                    <span className="text-rose-700">Interest: {result.totalPayment > 0 ? (result.interestPercent).toFixed(1) : 0}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 border-2 border-black rounded-full overflow-hidden flex">
                    <div
                      className="bg-indigo-600 h-full"
                      style={{ width: `${Math.min(100, (parsedPrincipal / result.totalPayment) * 100)}%` }}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${Math.min(100, result.interestPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Amortization schedule */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-gray-800">Amortization Schedule (Yearly)</h3>
                    <button
                      onClick={() => setShowAmortization(!showAmortization)}
                      className="text-xs font-bold text-indigo-700 hover:underline"
                    >
                      {showAmortization ? "Hide Schedule" : "Show Schedule"}
                    </button>
                  </div>

                  {showAmortization && (
                    <div className="max-h-56 overflow-y-auto border-2 border-black rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gray-100 border-b-2 border-black sticky top-0 font-black">
                          <tr>
                            <th className="py-2 px-3">Year</th>
                            <th className="py-2 px-3">Principal ($)</th>
                            <th className="py-2 px-3">Interest ($)</th>
                            <th className="py-2 px-3">Balance ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 font-mono">
                          {result.yearlySchedule.map((row) => (
                            <tr key={row.year} className="hover:bg-gray-50">
                              <td className="py-1.5 px-3 font-bold">{row.year}</td>
                              <td className="py-1.5 px-3 text-indigo-700 font-bold">{row.principalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                              <td className="py-1.5 px-3 text-rose-700">{row.interestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                              <td className="py-1.5 px-3">{row.balanceRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
