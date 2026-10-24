"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, DollarSign, Briefcase, AlertCircle, Clock } from "lucide-react";

type PayFrequency = "hourly" | "daily" | "weekly" | "biweekly" | "monthly" | "annually";

export default function SalaryCalculatorTool() {
  const [amount, setAmount] = useState<string>("75000");
  const [frequency, setFrequency] = useState<PayFrequency>("annually");
  const [hoursPerWeek, setHoursPerWeek] = useState<string>("40");
  const [daysPerWeek, setDaysPerWeek] = useState<string>("5");
  const [estimatedTaxRate, setEstimatedTaxRate] = useState<string>("20");
  const [copied, setCopied] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const parsedHours = Math.max(1, parseFloat(hoursPerWeek) || 40);
  const parsedDays = Math.max(1, parseFloat(daysPerWeek) || 5);
  const parsedTaxRate = Math.max(0, Math.min(60, parseFloat(estimatedTaxRate) || 0));

  const result = useMemo(() => {
    if (parsedAmount <= 0) {
      return { error: "Please enter a positive compensation amount." };
    }

    // Step 1: Normalize everything to annual gross base
    let annualGross = 0;
    const workingWeeksPerYear = 52;
    const totalWorkingHoursPerYear = workingWeeksPerYear * parsedHours;

    switch (frequency) {
      case "hourly":
        annualGross = parsedAmount * totalWorkingHoursPerYear;
        break;
      case "daily":
        annualGross = parsedAmount * (parsedDays * workingWeeksPerYear);
        break;
      case "weekly":
        annualGross = parsedAmount * 52;
        break;
      case "biweekly":
        annualGross = parsedAmount * 26;
        break;
      case "monthly":
        annualGross = parsedAmount * 12;
        break;
      case "annually":
        annualGross = parsedAmount;
        break;
    }

    const hourly = annualGross / totalWorkingHoursPerYear;
    const daily = annualGross / (parsedDays * workingWeeksPerYear);
    const weekly = annualGross / 52;
    const biweekly = annualGross / 26;
    const semimonthly = annualGross / 24;
    const monthly = annualGross / 12;

    const taxAmount = annualGross * (parsedTaxRate / 100);
    const annualNet = annualGross - taxAmount;
    const monthlyNet = annualNet / 12;
    const biweeklyNet = annualNet / 26;

    return {
      annualGross,
      monthly,
      biweekly,
      semimonthly,
      weekly,
      daily,
      hourly,
      taxAmount,
      annualNet,
      monthlyNet,
      biweeklyNet,
      totalWorkingHoursPerYear,
      isValid: true,
    };
  }, [parsedAmount, frequency, parsedHours, parsedDays, parsedTaxRate]);

  const copyBreakdown = () => {
    if (!result.isValid || "error" in result) return;
    const text = `Salary Breakdown (${parsedHours} hrs/week):
Annual Gross: $${result.annualGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Monthly: $${result.monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Bi-Weekly: $${result.biweekly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Weekly: $${result.weekly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Hourly: $${result.hourly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hr
Estimated Annual Net (@ ${parsedTaxRate}% tax): $${result.annualNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
          <strong>Estimate Disclaimer:</strong> Calculations provide unadjusted gross conversions and basic net estimations. Exact take-home pay is affected by local income brackets, FICA/social contributions, healthcare, 401(k)/pension contributions, and pretax deductions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-black">Compensation Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Pay Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 75000"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold text-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Pay Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as PayFrequency)}
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <option value="annually">Per Year (Annual Salary)</option>
                <option value="monthly">Per Month</option>
                <option value="biweekly">Bi-Weekly (Every 2 weeks)</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Hours / Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Days / Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Estimated Effective Tax Rate: <span className="text-emerald-700">{parsedTaxRate}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={estimatedTaxRate}
                onChange={(e) => setEstimatedTaxRate(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs text-gray-500 block mt-1">Rough estimate for take-home pay comparison.</span>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Pay Conversion Summary</h2>
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
                  <span className="text-xs font-black uppercase tracking-wider block text-gray-600">Annual Gross Salary</span>
                  <span className="text-3xl font-black text-emerald-700">
                    ${result.annualGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 border-2 border-black rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500 font-bold block">Monthly</span>
                    <span className="font-mono font-black text-base text-gray-900">${result.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="p-3 border-2 border-black rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500 font-bold block">Bi-Weekly (26/yr)</span>
                    <span className="font-mono font-black text-base text-gray-900">${result.biweekly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="p-3 border-2 border-black rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500 font-bold block">Weekly (52/yr)</span>
                    <span className="font-mono font-black text-base text-gray-900">${result.weekly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="p-3 border-2 border-black rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500 font-bold block">Daily ({parsedDays}d/wk)</span>
                    <span className="font-mono font-black text-base text-gray-900">${result.daily.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="p-3 border-2 border-black rounded-xl bg-emerald-50 sm:col-span-2">
                    <span className="text-xs text-emerald-800 font-bold block">Hourly Equivalent ({parsedHours} hrs/wk)</span>
                    <span className="font-mono font-black text-lg text-emerald-700">${result.hourly.toFixed(2)} / hr</span>
                  </div>
                </div>

                {/* Estimated Take-Home Net */}
                {parsedTaxRate > 0 && (
                  <div className="p-4 border-2 border-dashed border-gray-400 rounded-xl bg-blue-50 text-blue-950 space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span>Estimated Take-Home (Net @ {parsedTaxRate}% Tax):</span>
                      <span className="font-mono font-black text-base">${result.annualNet.toLocaleString(undefined, { maximumFractionDigits: 0 })} / yr</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-900 font-mono">
                      <div>Monthly Net: <strong>${result.monthlyNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></div>
                      <div>Bi-Weekly Net: <strong>${result.biweeklyNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
