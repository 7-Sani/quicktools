"use client";
import React, { useState } from 'react';

export default function RandomNumberGeneratorTool() {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [count, setCount] = useState<number>(1);
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);
  const [sortResults, setSortResults] = useState<boolean>(false);
  const [results, setResults] = useState<number[]>([]);

  const generate = () => {
    if (min >= max) {
      alert("Min must be less than Max");
      return;
    }

    if (!allowDuplicates && count > (max - min + 1)) {
      alert(`Cannot generate ${count} unique numbers in range ${min}-${max}`);
      return;
    }

    const nums: number[] = [];
    const maxRetries = count * 10;
    let retries = 0;

    while (nums.length < count && retries < maxRetries) {
      const range = max - min + 1;
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      const randomValue = array[0] / (0xffffffff + 1);
      const num = Math.floor(randomValue * range) + min;

      if (allowDuplicates || !nums.includes(num)) {
        nums.push(num);
      }
      retries++;
    }

    if (sortResults) {
      nums.sort((a, b) => a - b);
    }
    setResults(nums);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(results.join(', '));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="neo-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Min Number</label>
            <input type="number" className="neo-input w-full" value={min} onChange={(e) => setMin(Number(e.target.value))} />
          </div>
          <div>
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Max Number</label>
            <input type="number" className="neo-input w-full" value={max} onChange={(e) => setMax(Number(e.target.value))} />
          </div>
        </div>

        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">How Many Numbers?</label>
          <input type="number" className="neo-input w-full" value={count} onChange={(e) => setCount(Number(e.target.value))} min="1" max="10000" />
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={allowDuplicates} onChange={(e) => setAllowDuplicates(e.target.checked)} className="w-5 h-5 accent-accent border-2 border-border" />
            <span className="font-heading font-semibold text-sm tracking-wide">Allow Duplicates</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={sortResults} onChange={(e) => setSortResults(e.target.checked)} className="w-5 h-5 accent-accent border-2 border-border" />
            <span className="font-heading font-semibold text-sm tracking-wide">Sort Results</span>
          </label>
        </div>

        <button className="neo-btn neo-btn-primary w-full mt-4" onClick={generate}>Generate</button>
      </div>

      <div className="neo-card p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wide">Results</h3>
          {results.length > 0 && (
            <button className="text-sm font-bold text-accent hover:underline" onClick={copyAll}>Copy All</button>
          )}
        </div>
        
        <div className="flex-1 bg-surface border-2 border-border rounded p-4 overflow-y-auto font-mono max-h-[300px]">
          {results.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {results.map((r, i) => (
                <span key={i} className="bg-accent/10 text-accent font-bold px-2 py-1 rounded border border-accent/20">
                  {r}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-text-secondary h-full flex items-center justify-center">Click generate to see numbers</div>
          )}
        </div>
      </div>
    </div>
  );
}
