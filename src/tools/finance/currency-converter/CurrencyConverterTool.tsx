"use client";

import React, { useState, useMemo } from "react";
import { ArrowRightLeft, DollarSign, AlertCircle, Copy, Check, Edit3, RefreshCw, ShieldCheck } from "lucide-react";

interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rateToUSD: number; // 1 USD = rateToUSD currency
}

const DEFAULT_RATES: CurrencyRate[] = [
  { code: "USD", name: "US Dollar", symbol: "$", rateToUSD: 1.0 },
  { code: "EUR", name: "Euro", symbol: "€", rateToUSD: 0.92 },
  { code: "GBP", name: "British Pound", symbol: "£", rateToUSD: 0.79 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", rateToUSD: 83.5 },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", rateToUSD: 1.36 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", rateToUSD: 1.52 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rateToUSD: 154.5 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", rateToUSD: 0.91 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", rateToUSD: 1.35 },
  { code: "AED", name: "UAE Dirham", symbol: "AED", rateToUSD: 3.67 },
];

export default function CurrencyConverterTool() {
  const [amount, setAmount] = useState<string>("100");
  const [fromCode, setFromCode] = useState<string>("USD");
  const [toCode, setToCode] = useState<string>("EUR");
  const [isManualRate, setIsManualRate] = useState<boolean>(false);
  const [manualRateInput, setManualRateInput] = useState<string>("0.92");
  const [copied, setCopied] = useState<boolean>(false);

  const parsedAmount = parseFloat(amount) || 0;

  const fromCurrency = DEFAULT_RATES.find((c) => c.code === fromCode) || DEFAULT_RATES[0];
  const toCurrency = DEFAULT_RATES.find((c) => c.code === toCode) || DEFAULT_RATES[1];

  // Benchmark default cross rate: (1 fromCode = X toCode)
  const benchmarkRate = toCurrency.rateToUSD / fromCurrency.rateToUSD;

  // Effective rate used
  const effectiveRate = isManualRate ? (parseFloat(manualRateInput) || 0) : benchmarkRate;

  const convertedValue = parsedAmount * effectiveRate;

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
    if (isManualRate && effectiveRate > 0) {
      setManualRateInput((1 / effectiveRate).toFixed(4));
    }
  };

  const copyResult = () => {
    const text = `${parsedAmount.toLocaleString()} ${fromCode} = ${convertedValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${toCode} (Rate: 1 ${fromCode} = ${effectiveRate.toFixed(4)} ${toCode}${isManualRate ? " [Manual]" : " [Reference]"})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Transparency / Non-Live Notice Banner */}
      <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed space-y-1">
          <p>
            <strong>Transparent Rate Notice:</strong> This converter runs offline with <strong>static benchmark reference rates</strong> or your own custom manual rates. It is <strong>NOT a live ticker</strong> and does not guarantee real-time bank or forex execution quotes.
          </p>
          <p className="flex items-center gap-1 font-bold text-amber-800">
            <ShieldCheck className="w-4 h-4" /> No bank credentials or card details are requested or stored.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Converter Panel */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="text-xl font-black flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              Currency Conversion
            </h2>
            <button
              onClick={copyResult}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Amount to Convert
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold text-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">From Currency</label>
                <select
                  value={fromCode}
                  onChange={(e) => setFromCode(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50"
                >
                  {DEFAULT_RATES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center pb-0.5">
                <button
                  onClick={handleSwap}
                  className="p-2.5 border-2 border-black rounded-xl bg-gray-100 hover:bg-emerald-100 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  title="Swap currencies"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">To Currency</label>
                <select
                  value={toCode}
                  onChange={(e) => setToCode(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50"
                >
                  {DEFAULT_RATES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Manual Rate Mode Toggle */}
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-gray-700 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isManualRate}
                    onChange={(e) => {
                      setIsManualRate(e.target.checked);
                      if (e.target.checked) {
                        setManualRateInput(benchmarkRate.toFixed(4));
                      }
                    }}
                    className="w-4 h-4 rounded border-2 border-black accent-emerald-600"
                  />
                  Enable Custom Manual Exchange Rate
                </label>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isManualRate ? "bg-amber-200 text-amber-900 border border-amber-500" : "bg-gray-200 text-gray-700"}`}>
                  {isManualRate ? "Manual Rate Mode" : "Benchmark Reference"}
                </span>
              </div>

              {isManualRate ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">1 {fromCode} =</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={manualRateInput}
                      onChange={(e) => setManualRateInput(e.target.value)}
                      className="w-32 px-3 py-1.5 border-2 border-black rounded-lg font-bold font-mono bg-white"
                    />
                    <span className="text-xs font-bold">{toCode}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 block">
                    You can enter the exact rate charged by your card issuer or remittance broker.
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                  <span>Reference Benchmark Rate:</span>
                  <span className="font-mono font-bold text-gray-900">
                    1 {fromCode} ≈ {benchmarkRate.toFixed(4)} {toCode}
                  </span>
                </div>
              )}
            </div>

            {/* Result Box */}
            <div className="p-5 border-3 border-black rounded-2xl bg-emerald-50 text-emerald-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
              <span className="text-xs font-black uppercase tracking-wider block text-emerald-800">
                {parsedAmount.toLocaleString()} {fromCode} equals:
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono">
                {toCurrency.symbol}{" "}
                {convertedValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <span className="text-xs text-emerald-900 block pt-1 font-semibold">
                Exchange Rate: 1 {fromCode} = {effectiveRate.toFixed(4)} {toCode}
              </span>
            </div>
          </div>
        </div>

        {/* Currency Rates Table (Benchmark Overview) */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div>
            <h3 className="text-base font-black">Multi-Currency Matrix</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Approximate conversion of {parsedAmount.toLocaleString()} {fromCode} across major global currencies using reference benchmarks.
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto border-2 border-black rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 border-b-2 border-black sticky top-0 font-black">
                <tr>
                  <th className="py-2 px-3">Currency</th>
                  <th className="py-2 px-3 text-right">Rate / {fromCode}</th>
                  <th className="py-2 px-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {DEFAULT_RATES.map((curr) => {
                  const crossRate = curr.rateToUSD / fromCurrency.rateToUSD;
                  const equiv = parsedAmount * crossRate;
                  return (
                    <tr key={curr.code} className={curr.code === toCode ? "bg-emerald-50 font-bold" : "hover:bg-gray-50"}>
                      <td className="py-1.5 px-3">
                        <span className="font-bold">{curr.code}</span> <span className="text-gray-500 font-sans text-[11px]">({curr.symbol})</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-gray-600">
                        {crossRate.toFixed(4)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-black text-gray-900">
                        {equiv.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
