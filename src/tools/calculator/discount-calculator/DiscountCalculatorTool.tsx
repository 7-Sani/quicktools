"use client";
import React, { useState, useEffect } from 'react';

export default function DiscountCalculatorTool() {
  const [price, setPrice] = useState<string>('');
  const [discount1, setDiscount1] = useState<string>('');
  const [discount2, setDiscount2] = useState<string>('');
  const [hasSecond, setHasSecond] = useState<boolean>(false);
  
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [savedAmount, setSavedAmount] = useState<number>(0);

  useEffect(() => {
    const p = parseFloat(price) || 0;
    const d1 = parseFloat(discount1) || 0;
    const d2 = hasSecond ? (parseFloat(discount2) || 0) : 0;

    const firstDiscountAmount = p * (d1 / 100);
    const priceAfterFirst = p - firstDiscountAmount;
    
    const secondDiscountAmount = priceAfterFirst * (d2 / 100);
    const finalP = priceAfterFirst - secondDiscountAmount;

    setFinalPrice(finalP);
    setSavedAmount(p - finalP);
  }, [price, discount1, discount2, hasSecond]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="neo-card p-6 space-y-4">
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Original Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold">$</span>
            <input type="number" className="neo-input w-full pl-8" value={price} onChange={(e) => setPrice(e.target.value)} min="0" />
          </div>
        </div>
        
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Discount (%)</label>
          <div className="relative">
            <input type="number" className="neo-input w-full pr-8" value={discount1} onChange={(e) => setDiscount1(e.target.value)} min="0" max="100" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold">%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" id="hasSecond" checked={hasSecond} onChange={(e) => setHasSecond(e.target.checked)} className="w-5 h-5 accent-accent border-2 border-border" />
          <label htmlFor="hasSecond" className="font-heading font-semibold text-sm uppercase tracking-wide cursor-pointer">Add Second Discount</label>
        </div>

        {hasSecond && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2">
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Second Discount (%)</label>
            <div className="relative">
              <input type="number" className="neo-input w-full pr-8" value={discount2} onChange={(e) => setDiscount2(e.target.value)} min="0" max="100" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold">%</span>
            </div>
          </div>
        )}
      </div>

      <div className="neo-card p-6 flex flex-col justify-center bg-accent/5 border-accent text-center">
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-text-secondary mb-2">Final Price</h3>
        <div className="text-4xl font-mono font-bold text-accent mb-6">${finalPrice.toFixed(2)}</div>
        
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-text-secondary mb-2">You Save</h3>
        <div className="text-2xl font-mono font-bold text-green-600 mb-2">${savedAmount.toFixed(2)}</div>
        {parseFloat(price) > 0 && (
          <div className="text-sm font-mono text-text-secondary">
            ({((savedAmount / parseFloat(price)) * 100).toFixed(1)}% total discount)
          </div>
        )}
      </div>
    </div>
  );
}
