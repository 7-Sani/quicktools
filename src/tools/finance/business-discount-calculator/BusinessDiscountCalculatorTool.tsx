"use client";

import React, { useState, useMemo } from "react";
import {
  BadgePercent,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Tag,
  DollarSign,
  Plus,
} from "lucide-react";

export default function BusinessDiscountCalculatorTool() {
  const [originalPrice, setOriginalPrice] = useState<string>("1200");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<string>("20");
  const [hasSecondaryDiscount, setHasSecondaryDiscount] = useState<boolean>(false);
  const [secondaryType, setSecondaryType] = useState<"percentage" | "fixed">("percentage");
  const [secondaryValue, setSecondaryValue] = useState<string>("10");
  const [taxRate, setTaxRate] = useState<string>("0");
  const [currency, setCurrency] = useState<string>("$");
  const [copied, setCopied] = useState<boolean>(false);

  const calc = useMemo(() => {
    const orig = parseFloat(originalPrice);
    const d1 = parseFloat(discountValue) || 0;
    const d2 = hasSecondaryDiscount ? parseFloat(secondaryValue) || 0 : 0;
    const tax = parseFloat(taxRate) || 0;

    if (isNaN(orig) || orig < 0) return null;

    // First discount
    let discount1Amount = 0;
    if (discountType === "percentage") {
      discount1Amount = (orig * Math.min(100, Math.max(0, d1))) / 100;
    } else {
      discount1Amount = Math.min(orig, Math.max(0, d1));
    }
    const priceAfterD1 = Math.max(0, orig - discount1Amount);

    // Secondary / Stacked discount
    let discount2Amount = 0;
    if (hasSecondaryDiscount && priceAfterD1 > 0) {
      if (secondaryType === "percentage") {
        discount2Amount = (priceAfterD1 * Math.min(100, Math.max(0, d2))) / 100;
      } else {
        discount2Amount = Math.min(priceAfterD1, Math.max(0, d2));
      }
    }
    const priceAfterDiscounts = Math.max(0, priceAfterD1 - discount2Amount);

    // Total savings
    const totalSavings = discount1Amount + discount2Amount;
    const effectiveDiscountPercent = orig > 0 ? (totalSavings / orig) * 100 : 0;

    // Tax calculation
    const taxAmount = tax > 0 ? (priceAfterDiscounts * tax) / 100 : 0;
    const finalTotalWithTax = priceAfterDiscounts + taxAmount;

    return {
      orig,
      discount1Amount,
      priceAfterD1,
      discount2Amount,
      priceAfterDiscounts,
      totalSavings,
      effectiveDiscountPercent,
      taxAmount,
      finalTotalWithTax,
    };
  }, [originalPrice, discountType, discountValue, hasSecondaryDiscount, secondaryType, secondaryValue, taxRate]);

  const handleCopy = () => {
    if (!calc) return;
    const summary = `Original Price: ${currency}${calc.orig.toFixed(2)}
Total Discount Savings: ${currency}${calc.totalSavings.toFixed(2)} (${calc.effectiveDiscountPercent.toFixed(1)}% off)
Final Payable Amount: ${currency}${calc.finalTotalWithTax.toFixed(2)}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <BadgePercent className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Discount &amp; Sale Calculator
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Calculate promotional price discounts, stacked coupon deductions, and post-tax billing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-gray-700">Currency:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-2.5 py-1 text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <option value="$">$ (USD)</option>
            <option value="₹">₹ (INR)</option>
            <option value="€">€ (EUR)</option>
            <option value="£">£ (GBP)</option>
            <option value="¥">¥ (JPY/CNY)</option>
          </select>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        {/* Original Price */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-black">
            Original Price (Before Discount):
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-gray-500 font-mono text-base">
              {currency}
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="e.g. 1200"
              className="w-full pl-8 pr-3 py-3 font-mono text-base font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>
        </div>

        {/* Primary Discount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Primary Discount:
            </label>
            {/* Quick Presets */}
            <div className="flex items-center gap-1">
              {[10, 20, 30, 50, 70].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    setDiscountType("percentage");
                    setDiscountValue(String(pct));
                  }}
                  className="px-2 py-0.5 text-xs font-black bg-white border border-black hover:bg-yellow-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="flex-1 p-2.5 font-mono text-sm font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
            <select
              value={discountType}
              onChange={(e: any) => setDiscountType(e.target.value)}
              className="font-black text-xs px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <option value="percentage">% Percentage Off</option>
              <option value="fixed">{currency} Fixed Cash Off</option>
            </select>
          </div>
        </div>

        {/* Secondary Stacked Discount Toggle */}
        <div className="pt-2 border-t border-black/15 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-black uppercase">
            <input
              type="checkbox"
              checked={hasSecondaryDiscount}
              onChange={(e) => setHasSecondaryDiscount(e.target.checked)}
              className="w-4 h-4 accent-[#16A34A] border-2 border-black cursor-pointer"
            />
            <span>Add Secondary Stacked Discount (e.g. promo code or coupon)</span>
          </label>

          {hasSecondaryDiscount && (
            <div className="flex gap-2 pl-6">
              <input
                type="number"
                min="0"
                step="any"
                value={secondaryValue}
                onChange={(e) => setSecondaryValue(e.target.value)}
                placeholder="Secondary discount value"
                className="flex-1 p-2 font-mono text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              />
              <select
                value={secondaryType}
                onChange={(e: any) => setSecondaryType(e.target.value)}
                className="font-black text-xs px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                <option value="percentage">% Percentage Off Remainder</option>
                <option value="fixed">{currency} Fixed Cash Off</option>
              </select>
            </div>
          )}
        </div>

        {/* Tax Rate (Optional) */}
        <div className="pt-2 border-t border-black/15 flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-black">
            Apply Sales Tax / VAT Post-Discount (%):
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-20 p-2 font-mono text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center"
            />
            <span className="font-black text-xs">%</span>
          </div>
        </div>
      </div>

      {/* Results Matrix */}
      {calc && (
        <div className="space-y-6">
          {/* Main Price Card */}
          <div className="bg-[#FEF08A] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase text-gray-700">Final Discounted Price</div>
              <div className="text-4xl font-black text-black mt-1 font-mono">
                {formatCur(calc.finalTotalWithTax)}
              </div>
              <div className="text-xs font-bold text-gray-700 mt-1">
                You save <strong className="text-green-800">{formatCur(calc.totalSavings)}</strong> (Total {calc.effectiveDiscountPercent.toFixed(1)}% savings)
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-black" />}
              {copied ? "Copied" : "Copy Breakdown"}
            </button>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Original Price</div>
              <div className="text-xl font-mono font-black text-black mt-1">{formatCur(calc.orig)}</div>
            </div>

            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Total Savings</div>
              <div className="text-xl font-mono font-black text-green-700 mt-1">
                -{formatCur(calc.totalSavings)}
              </div>
            </div>

            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Sales Tax Added</div>
              <div className="text-xl font-mono font-black text-black mt-1">
                +{formatCur(calc.taxAmount)}
              </div>
            </div>

            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Effective Discount</div>
              <div className="text-xl font-mono font-black text-[#16A34A] mt-1">
                {calc.effectiveDiscountPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
