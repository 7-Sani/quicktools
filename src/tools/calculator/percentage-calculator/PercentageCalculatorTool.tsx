"use client";
import React, { useState, useEffect } from 'react';

export default function PercentageCalculatorTool() {
  const [mode, setMode] = useState<1 | 2 | 3>(1);
  const [inputX, setInputX] = useState<string>('');
  const [inputY, setInputY] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    const x = parseFloat(inputX);
    const y = parseFloat(inputY);

    if (isNaN(x) || isNaN(y)) {
      setResult(null);
      return;
    }

    if (mode === 1) {
      setResult((x / 100) * y);
    } else if (mode === 2) {
      if (y === 0) {
        setResult(Infinity);
      } else {
        setResult((x / y) * 100);
      }
    } else if (mode === 3) {
      if (x === 0) {
        setResult(Infinity);
      } else {
        setResult(((y - x) / x) * 100);
      }
    }
  }, [mode, inputX, inputY]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button className={`neo-btn ${mode === 1 ? 'neo-btn-primary' : 'neo-btn-secondary'}`} onClick={() => setMode(1)}>What is X% of Y?</button>
        <button className={`neo-btn ${mode === 2 ? 'neo-btn-primary' : 'neo-btn-secondary'}`} onClick={() => setMode(2)}>X is what % of Y?</button>
        <button className={`neo-btn ${mode === 3 ? 'neo-btn-primary' : 'neo-btn-secondary'}`} onClick={() => setMode(3)}>% change from X to Y</button>
      </div>

      <div className="neo-card p-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Input X</label>
          <input type="number" className="neo-input w-full" value={inputX} onChange={e => setInputX(e.target.value)} placeholder="X" />
        </div>
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Input Y</label>
          <input type="number" className="neo-input w-full" value={inputY} onChange={e => setInputY(e.target.value)} placeholder="Y" />
        </div>
      </div>

      <div className="neo-card p-6 text-center min-h-[120px] flex flex-col justify-center">
        <div className="font-heading font-semibold text-sm uppercase tracking-wide text-text-secondary mb-2">Result</div>
        {result !== null && result !== Infinity ? (
          <div className="font-mono text-3xl font-bold text-accent break-all">
            {mode === 1 && `${result.toLocaleString(undefined, { maximumFractionDigits: 4 })}`}
            {mode === 2 && `${result.toLocaleString(undefined, { maximumFractionDigits: 4 })}%`}
            {mode === 3 && `${result > 0 ? '+' : ''}${result.toLocaleString(undefined, { maximumFractionDigits: 4 })}%`}
          </div>
        ) : (
          <div className="font-mono text-xl text-text-secondary">Enter values to calculate</div>
        )}
      </div>

      <button className="neo-btn neo-btn-secondary w-full" onClick={() => { setInputX(''); setInputY(''); setResult(null); }}>Clear Inputs</button>
    </div>
  );
}
