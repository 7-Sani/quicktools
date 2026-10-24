"use client";
import React, { useState } from 'react';

export default function UuidGeneratorTool() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = () => {
    const newUuids = [];
    for (let i = 0; i < count; i++) {
      let id = crypto.randomUUID();
      if (uppercase) id = id.toUpperCase();
      if (noHyphens) id = id.replace(/-/g, '');
      newUuids.push(id);
    }
    setUuids(newUuids);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const copyOne = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  return (
    <div className="space-y-6">
      <div className="neo-card p-6 flex flex-wrap gap-6 items-center">
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Count</label>
          <input 
            type="number" 
            min="1" 
            max="1000" 
            value={count} 
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="neo-input w-24 p-2 text-center"
          />
        </div>
        <div className="flex gap-4 mt-6">
          <label className="flex items-center gap-2 cursor-pointer font-semibold">
            <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="w-5 h-5 border-2 border-border" />
            Uppercase
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-semibold">
            <input type="checkbox" checked={noHyphens} onChange={(e) => setNoHyphens(e.target.checked)} className="w-5 h-5 border-2 border-border" />
            No Hyphens
          </label>
        </div>
        <div className="mt-6 ml-auto flex gap-2">
          <button className="neo-btn neo-btn-primary" onClick={generate}>Generate UUIDs</button>
          <button className="neo-btn neo-btn-secondary" onClick={copyAll} disabled={uuids.length === 0}>
            {copiedAll ? 'Copied All!' : 'Copy All'}
          </button>
        </div>
      </div>

      {uuids.length > 0 && (
        <div className="neo-card p-0 overflow-hidden">
          <ul className="max-h-[500px] overflow-y-auto">
            {uuids.map((id, idx) => (
              <li key={idx} className="flex justify-between items-center p-4 border-b-2 border-border last:border-b-0 hover:bg-surface transition-colors">
                <span className="font-mono text-sm">{id}</span>
                <button 
                  className="text-xs font-bold uppercase hover:text-accent"
                  onClick={() => copyOne(id)}
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
