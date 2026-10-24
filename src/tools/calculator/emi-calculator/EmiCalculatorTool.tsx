"use client";
import React, { useState, useEffect } from 'react';

export default function EmiCalculatorTool() {
  const [amount, setAmount] = useState<string>('10000');
  const [rate, setRate] = useState<string>('5');
  const [tenure, setTenure] = useState<string>('1');
  const [isYears, setIsYears] = useState<boolean>(true);
  
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  useEffect(() => {
    const p = parseFloat(amount);
    const r = parseFloat(rate) / 12 / 100;
    const n = isYears ? parseFloat(tenure) * 12 : parseFloat(tenure);

    if (p > 0 && r > 0 && n > 0) {
      const e = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      setEmi(e);
      setTotalPayment(e * n);
      setTotalInterest(e * n - p);
    } else if (p > 0 && n > 0 && r === 0) {
      setEmi(p / n);
      setTotalPayment(p);
      setTotalInterest(0);
    } else {
      setEmi(0);
      setTotalPayment(0);
      setTotalInterest(0);
    }
  }, [amount, rate, tenure, isYears]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="neo-card p-6 space-y-4">
          <div>
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Loan Amount</label>
            <input type="number" className="neo-input w-full" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" />
          </div>
          <div>
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Interest Rate (% per annum)</label>
            <input type="number" className="neo-input w-full" value={rate} onChange={(e) => setRate(e.target.value)} min="0" step="0.1" />
          </div>
          <div>
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2 flex justify-between">
              <span>Tenure</span>
              <div className="flex gap-2">
                <button className={`text-xs px-2 py-1 border-2 border-border font-bold ${isYears ? 'bg-accent text-white' : 'bg-surface'}`} onClick={() => setIsYears(true)}>Years</button>
                <button className={`text-xs px-2 py-1 border-2 border-border font-bold ${!isYears ? 'bg-accent text-white' : 'bg-surface'}`} onClick={() => setIsYears(false)}>Months</button>
              </div>
            </label>
            <input type="number" className="neo-input w-full" value={tenure} onChange={(e) => setTenure(e.target.value)} min="0" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="neo-card p-6 flex flex-col gap-4">
          <div className="text-center p-4 bg-accent/5 border-2 border-accent rounded">
            <div className="font-heading font-semibold text-sm uppercase tracking-wide text-text-secondary mb-1">Monthly EMI</div>
            <div className="text-3xl font-mono font-bold text-accent">${emi.toFixed(2)}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border-2 border-border rounded">
              <div className="font-heading font-semibold text-xs uppercase tracking-wide text-text-secondary mb-1">Total Interest</div>
              <div className="text-lg font-mono font-bold">${totalInterest.toFixed(2)}</div>
            </div>
            <div className="text-center p-3 border-2 border-border rounded">
              <div className="font-heading font-semibold text-xs uppercase tracking-wide text-text-secondary mb-1">Total Payment</div>
              <div className="text-lg font-mono font-bold">${totalPayment.toFixed(2)}</div>
            </div>
          </div>

          {emi > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-border">
              <div className="flex justify-between text-sm font-mono mb-2">
                <span>Principal: {((parseFloat(amount) / totalPayment) * 100).toFixed(1)}%</span>
                <span>Interest: {((totalInterest / totalPayment) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-4 flex border-2 border-border rounded overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${(parseFloat(amount) / totalPayment) * 100}%` }}></div>
                <div className="h-full bg-yellow-400" style={{ width: `${(totalInterest / totalPayment) * 100}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
