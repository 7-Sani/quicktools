"use client";
import React, { useState } from 'react';

export default function CharacterCounterTool() {
  const [text, setText] = useState('');
  const [limit, setLimit] = useState<number | null>(null);

  const chars = text.length;
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  const wordsMatch = text.match(/\b\w+\b/g);
  const words = wordsMatch ? wordsMatch.length : 0;
  const lines = text ? text.split('\n').length : 0;

  const presets = [
    { name: 'None', value: null },
    { name: 'Twitter (280)', value: 280 },
    { name: 'Instagram (2200)', value: 2200 },
    { name: 'SMS (160)', value: 160 },
    { name: 'LinkedIn (3000)', value: 3000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Preset Limits</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map(p => (
            <button
              key={p.name}
              onClick={() => setLimit(p.value)}
              className={`neo-btn ${limit === p.value ? 'neo-btn-primary' : 'neo-btn-secondary'} px-3 py-1 text-sm`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <textarea
          className="neo-input w-full min-h-[200px] resize-y p-4"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
        />
        {limit && (
          <div className="mt-2">
            <div className="w-full bg-surface border-2 border-border h-4 rounded-full overflow-hidden">
              <div 
                className={`h-full ${chars > limit ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min((chars / limit) * 100, 100)}%` }}
              ></div>
            </div>
            <p className={`text-sm mt-1 font-semibold ${chars > limit ? 'text-red-500' : 'text-text-secondary'}`}>
              {chars} / {limit} characters
            </p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="neo-card p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">{chars}</span>
          <span className="text-text-secondary uppercase text-sm font-semibold">Characters</span>
        </div>
        <div className="neo-card p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">{charsNoSpaces}</span>
          <span className="text-text-secondary uppercase text-sm font-semibold">Chars (No Spaces)</span>
        </div>
        <div className="neo-card p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">{words}</span>
          <span className="text-text-secondary uppercase text-sm font-semibold">Words</span>
        </div>
        <div className="neo-card p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">{lines}</span>
          <span className="text-text-secondary uppercase text-sm font-semibold">Lines</span>
        </div>
      </div>
    </div>
  );
}
