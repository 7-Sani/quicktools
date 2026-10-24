"use client";
import React, { useState } from 'react';

export default function RemoveDuplicateLinesTool() {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [removedCount, setRemovedCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    caseSensitive: true,
    trimWhitespace: true,
    sortOutput: false,
  });

  const handleProcess = () => {
    let lines = text.split('\n');
    
    if (options.trimWhitespace) {
      lines = lines.map(line => line.trim());
    }

    const seen = new Set<string>();
    const resultLines: string[] = [];
    let removed = 0;

    for (const line of lines) {
      const key = options.caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        resultLines.push(line);
      } else {
        removed++;
      }
    }

    if (options.sortOutput) {
      resultLines.sort((a, b) => {
        if (!options.caseSensitive) return a.toLowerCase().localeCompare(b.toLowerCase());
        return a.localeCompare(b);
      });
    }

    setOutput(resultLines.join('\n'));
    setRemovedCount(removed);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Input Text</label>
          <textarea
            className="neo-input w-full min-h-[200px] resize-y p-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text with duplicate lines here..."
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-heading font-semibold text-sm uppercase tracking-wide">Output Text</label>
            {removedCount > 0 && <span className="text-sm font-semibold text-green-600">Removed {removedCount} duplicate{removedCount !== 1 ? 's' : ''}</span>}
          </div>
          <textarea
            className="neo-input w-full min-h-[200px] resize-y p-4 bg-surface"
            value={output}
            readOnly
            placeholder="Result will appear here..."
          />
        </div>
      </div>
      <div className="neo-card p-6 flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={options.caseSensitive} onChange={(e) => setOptions({...options, caseSensitive: e.target.checked})} className="w-5 h-5 border-2 border-border" />
          Case Sensitive
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={options.trimWhitespace} onChange={(e) => setOptions({...options, trimWhitespace: e.target.checked})} className="w-5 h-5 border-2 border-border" />
          Trim Whitespace
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={options.sortOutput} onChange={(e) => setOptions({...options, sortOutput: e.target.checked})} className="w-5 h-5 border-2 border-border" />
          Sort Output
        </label>
      </div>
      <div className="flex justify-between items-center">
        <button className="neo-btn neo-btn-primary" onClick={handleProcess}>Remove Duplicates</button>
        <button className="neo-btn neo-btn-secondary" onClick={copyToClipboard} disabled={!output}>
          {copied ? 'Copied!' : 'Copy Output'}
        </button>
      </div>
    </div>
  );
}
