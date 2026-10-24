"use client";

import React, { useState, useMemo } from "react";
import {
  Receipt,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Percent,
  ArrowRightLeft,
  DollarSign,
} from "lucide-react";

export default function GstCalculatorTool() {
  const [amount, setAmount] = useState<string>("10000");
  const [gstRate, setGstRate] = useState<number>(18);
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [customRateInput, setCustomRateInput] = useState<string>("18");
  const [taxMode, setTaxMode] = useState<"exclusive" | "inclusive">("exclusive");
  const [currency, setCurrency] = useState<string>("₹");
  const [isInterState, setIsInterState] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeRate = isCustomRate ? parseFloat(customRateInput) || 0 : gstRate;

  // Calculation logic
  const result = useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0 || isNaN(activeRate) || activeRate < 0) {
      return null;
    }

    let netAmount = 0;
    let gstAmount = 0;
    let grossAmount = 0;

    if (taxMode === "exclusive") {
      // GST Exclusive: Amount is Net
      netAmount = val;
      gstAmount = (val * activeRate) / 100;
      grossAmount = netAmount + gstAmount;
    } else {
      // GST Inclusive: Amount is Gross
      grossAmount = val;
      netAmount = val / (1 + activeRate / 100);
      gstAmount = grossAmount - netAmount;
    }

    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const igst = gstAmount;

    return {
      netAmount,
      gstAmount,
      grossAmount,
      cgst,
      sgst,
      igst,
    };
  }, [amount, activeRate, taxMode]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatCur = (num: number) => {
    return `${currency}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#16A34A] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              GST / VAT Calculator
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Calculate Goods and Services Tax with GST Exclusive (add tax) and GST Inclusive (extract tax) modes
            </p>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-gray-700">Currency:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-2.5 py-1 text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <option value="₹">₹ (INR)</option>
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
            <option value="£">£ (GBP)</option>
            <option value="¥">¥ (JPY/CNY)</option>
          </select>
        </div>
      </div>

      {/* Calculator Inputs Card */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-5">
        {/* Tax Mode Toggles */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTaxMode("exclusive")}
            className={`px-4 py-2 text-xs font-black uppercase border-3 border-black transition-all ${
              taxMode === "exclusive"
                ? "bg-[#16A34A] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-0.5"
                : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            GST Exclusive (Add Tax to Net Price)
          </button>
          <button
            onClick={() => setTaxMode("inclusive")}
            className={`px-4 py-2 text-xs font-black uppercase border-3 border-black transition-all ${
              taxMode === "inclusive"
                ? "bg-[#16A34A] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-0.5"
                : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            GST Inclusive (Extract Tax from Gross Price)
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-black flex items-center justify-between">
            <span>
              {taxMode === "exclusive" ? "Initial / Net Amount (Pre-Tax):" : "Total / Gross Amount (Tax Included):"}
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-gray-500 font-mono text-base">
              {currency}
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full pl-8 pr-3 py-3 font-mono text-base font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>
        </div>

        {/* GST Rate Slabs */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-black">
            Select GST / Tax Rate:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {[3, 5, 12, 18, 28].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  setGstRate(rate);
                  setIsCustomRate(false);
                }}
                className={`px-4 py-2 text-xs font-black uppercase border-2 border-black transition-all ${
                  !isCustomRate && gstRate === rate
                    ? "bg-[#FEF08A] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-extrabold"
                    : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {rate}%
              </button>
            ))}

            <button
              onClick={() => setIsCustomRate(true)}
              className={`px-4 py-2 text-xs font-black uppercase border-2 border-black transition-all ${
                isCustomRate
                  ? "bg-[#FEF08A] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-extrabold"
                  : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              Custom %
            </button>

            {isCustomRate && (
              <div className="flex items-center gap-1.5 ml-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={customRateInput}
                  onChange={(e) => setCustomRateInput(e.target.value)}
                  className="w-24 p-2 text-xs font-mono font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                />
                <span className="font-black text-xs">%</span>
              </div>
            )}
          </div>
        </div>

        {/* Interstate Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-black/15">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-black uppercase">
            <input
              type="checkbox"
              checked={isInterState}
              onChange={(e) => setIsInterState(e.target.checked)}
              className="w-4 h-4 accent-[#16A34A] border-2 border-black cursor-pointer"
            />
            <span>Inter-State Supply (IGST only) instead of Intra-State (CGST + SGST)</span>
          </label>
        </div>
      </div>

      {/* Results Matrix */}
      {result && (
        <div className="space-y-6">
          {/* Main Total Highlight */}
          <div className="bg-[#BBF7D0] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase text-gray-700">Final Gross Total Amount</div>
              <div className="text-3xl sm:text-4xl font-black text-black mt-1 font-mono">
                {formatCur(result.grossAmount)}
              </div>
              <div className="text-xs font-bold text-gray-700 mt-1">
                Net Base Price: {formatCur(result.netAmount)} + Total Tax: {formatCur(result.gstAmount)} ({activeRate}%)
              </div>
            </div>

            <button
              onClick={() => handleCopy(formatCur(result.grossAmount), "total")}
              className="px-3.5 py-2 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1.5"
            >
              {copiedKey === "total" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-black" />}
              {copiedKey === "total" ? "Copied" : "Copy Total"}
            </button>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Net Base Price (Pre-Tax)</div>
              <div className="text-xl font-mono font-black text-black mt-1">{formatCur(result.netAmount)}</div>
            </div>

            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Total GST Tax ({activeRate}%)</div>
              <div className="text-xl font-mono font-black text-[#16A34A] mt-1">{formatCur(result.gstAmount)}</div>
            </div>

            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">
                {isInterState ? "IGST (Integrated)" : "CGST + SGST (Central + State)"}
              </div>
              <div className="text-base font-mono font-black text-black mt-1">
                {isInterState ? (
                  formatCur(result.igst)
                ) : (
                  <span>
                    CGST ({activeRate / 2}%): {formatCur(result.cgst)} <br />
                    SGST ({activeRate / 2}%): {formatCur(result.sgst)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Step-by-Step Formula Card */}
          <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2 text-xs font-bold text-gray-700">
            <div className="text-xs font-black uppercase text-black flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#16A34A]" />
              Formula &amp; Mathematical Breakdown:
            </div>
            {taxMode === "exclusive" ? (
              <p>
                <strong>GST Exclusive Formula:</strong> <code className="bg-gray-200 px-1 font-mono">GST Amount = (Net Price × GST%) / 100</code> &rarr; ({formatCur(result.netAmount)} × {activeRate}%) / 100 = <strong>{formatCur(result.gstAmount)}</strong>.
              </p>
            ) : (
              <p>
                <strong>GST Inclusive Formula:</strong> <code className="bg-gray-200 px-1 font-mono">Net Price = Gross Total / (1 + (GST% / 100))</code> &rarr; {formatCur(result.grossAmount)} / {1 + activeRate / 100} = <strong>{formatCur(result.netAmount)}</strong>.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Financial Advice Disclaimer */}
      <div className="bg-[#FAF8F5] border-2 border-black p-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[11px] font-bold text-gray-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
        <p>
          <strong className="text-black uppercase">Disclaimer:</strong> This calculator provides general mathematical estimates for commercial and educational purposes. It does not constitute certified tax, legal, or professional accounting advice. Verify applicable tax brackets with local revenue authorities.
        </p>
      </div>
    </div>
  );
}
