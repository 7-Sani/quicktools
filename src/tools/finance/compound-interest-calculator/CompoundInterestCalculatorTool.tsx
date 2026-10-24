"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, TrendingUp, AlertCircle, Calendar, DollarSign, Percent } from "lucide-react";

interface ScheduleYear {
  year: number;
  principalDeposited: number;
  totalInterest: number;
  endBalance: number;
}

export default function CompoundInterestCalculatorTool() {
  const [principal, setPrincipal] = useState<string>("10000");
  const [rate, setRate] = useState<string>("7.5");
  const [years, setYears] = useState<string>("10");
  const [compounding, setCompounding] = useState<string>("12"); // 12 = monthly
  const [monthlyContribution, setMonthlyContribution] = useState<string>("200");
  const [copied, setCopied] = useState(false);

  const parsedPrincipal = parseFloat(principal) || 0;
  const parsedRate = parseFloat(rate) || 0;
  const parsedYears = Math.min(50, Math.max(1, parseInt(years) || 1));
  const parsedFreq = parseInt(compounding) || 12;
  const parsedMonthly = parseFloat(monthlyContribution) || 0;

  const result = useMemo(() => {
    if (parsedPrincipal < 0 || parsedRate < 0 || parsedYears <= 0 || parsedMonthly < 0) {
      return { error: "Please enter non-negative values for all fields." };
    }

    const r = parsedRate / 100;
    const n = parsedFreq;
    const t = parsedYears;

    let balance = parsedPrincipal;
    let totalInvested = parsedPrincipal;
    const schedule: ScheduleYear[] = [];

    // Simulate year by year for accurate compounding with monthly deposits
    const monthlyRate = r / 12;

    for (let y = 1; y <= t; y++) {
      for (let m = 1; m <= 12; m++) {
        balance += parsedMonthly;
        totalInvested += parsedMonthly;
        balance += balance * monthlyRate;
      }
      const interestEarnedSoFar = balance - totalInvested;
      schedule.push({
        year: y,
        principalDeposited: totalInvested,
        totalInterest: interestEarnedSoFar,
        endBalance: balance,
      });
    }

    const totalInterest = balance - totalInvested;

    return {
      finalBalance: balance,
      totalInvested,
      totalInterest,
      schedule,
      isValid: true,
    };
  }, [parsedPrincipal, parsedRate, parsedYears, parsedFreq, parsedMonthly]);

  const copyBreakdown = () => {
    if (!result.isValid || "error" in result) return;
    const text = `Compound Interest Summary:
Initial Principal: $${parsedPrincipal.toLocaleString()}
Annual Rate: ${parsedRate}%
Time Horizon: ${parsedYears} years
Monthly Contribution: $${parsedMonthly.toLocaleString()}
Total Invested: $${result.totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}
Total Interest Earned: $${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
Final Maturity Value: $${result.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Disclaimer */}
      <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong>Estimate Disclaimer:</strong> Projected balances do not account for inflation, taxes, or capital market fluctuations. Actual investment returns vary. Not professional investment advice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-black">Investment Parameters</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Initial Principal ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="e.g. 10000"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g. 7.5"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Investment Duration (Years): <span className="text-emerald-700">{parsedYears}</span>
              </label>
              <input
                type="range"
                min="1"
                max="40"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-gray-500 mt-1">
                <span>1 Year</span>
                <span>20 Years</span>
                <span>40 Years</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Regular Monthly Deposit ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                placeholder="e.g. 200"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <span className="text-xs text-gray-500 mt-1 block">Added at the start of each month.</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Compounding Frequency
              </label>
              <select
                value={compounding}
                onChange={(e) => setCompounding(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <option value="12">Monthly (12 times / year)</option>
                <option value="4">Quarterly (4 times / year)</option>
                <option value="2">Semi-Annually (2 times / year)</option>
                <option value="1">Annually (1 time / year)</option>
                <option value="365">Daily (365 times / year)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Maturity Breakdown</h2>
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
              <div className="mt-6 space-y-6">
                <div className="p-5 rounded-2xl border-3 border-black bg-emerald-50 text-emerald-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xs font-black uppercase tracking-wider block text-emerald-800">Total Future Balance</span>
                  <span className="text-3xl sm:text-4xl font-black text-emerald-700">
                    ${result.finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-black bg-blue-50 text-blue-950">
                    <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Total Invested</span>
                    <span className="text-xl sm:text-2xl font-black">
                      ${result.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-black bg-purple-50 text-purple-950">
                    <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Total Interest Earned</span>
                    <span className="text-xl sm:text-2xl font-black">
                      ${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Invested Capital: {result.finalBalance > 0 ? ((result.totalInvested / result.finalBalance) * 100).toFixed(1) : 0}%</span>
                    <span className="text-emerald-700">Interest: {result.finalBalance > 0 ? ((result.totalInterest / result.finalBalance) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 border-2 border-black rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${Math.min(100, (result.totalInvested / result.finalBalance) * 100)}%` }}
                    />
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${Math.min(100, (result.totalInterest / result.finalBalance) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Growth Table */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-gray-800">Year-by-Year Growth Schedule</h3>
                  <div className="max-h-56 overflow-y-auto border-2 border-black rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-100 border-b-2 border-black sticky top-0 font-black">
                        <tr>
                          <th className="py-2 px-3">Year</th>
                          <th className="py-2 px-3">Invested ($)</th>
                          <th className="py-2 px-3">Interest ($)</th>
                          <th className="py-2 px-3">Balance ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 font-mono">
                        {result.schedule.map((row) => (
                          <tr key={row.year} className="hover:bg-gray-50">
                            <td className="py-1.5 px-3 font-bold">{row.year}</td>
                            <td className="py-1.5 px-3">{row.principalDeposited.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            <td className="py-1.5 px-3 text-emerald-700 font-bold">+{row.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            <td className="py-1.5 px-3 font-bold">{row.endBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
