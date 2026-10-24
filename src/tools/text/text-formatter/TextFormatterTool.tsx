"use client";
import React, { useState } from 'react';

export default function TextFormatterTool() {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    trim: true,
    removeExtraSpaces: true,
    removeEmptyLines: false,
    removeLineBreaks: false,
    addLineNumbers: false,
  });

  const handleApply = () => {
    let result = text;
    
    if (options.removeLineBreaks) {
      result = result.replace(/\n/g, ' ');
    }
    if (options.removeEmptyLines) {
      result = result.split('\n').filter(line => line.trim() !== '').join('\n');
    }
    if (options.removeExtraSpaces) {
      result = result.replace(/ +/g, ' ');
    }
    if (options.trim) {
      result = result.split('\n').map(line => line.trim()).join('\n').trim();
    }
    if (options.addLineNumbers) {
      result = result.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
    }
    
    setOutput(result);
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
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Input</label>
          <textarea
            className="neo-input w-full min-h-[200px] resize-y p-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here..."
          />
        </div>
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Output</label>
          <textarea
            className="neo-input w-full min-h-[200px] resize-y p-4 bg-surface"
            value={output}
            readOnly
            placeholder="Formatted text will appear here..."
          />
        </div>
      </div>
      <div className="neo-card p-6 flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={options.trim} onChange={(e) => setOptions({...options, trim: e.target.checked})} className="w-5 h-5 border-2 border-border" />
          Trim whitespace
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={options.removeExtraSpaces} onChange={(e) => setOptions({...options, removeExtraSpaces: e.target.checked})} className="w-5 h-5 border-2 border-border" />
          Remove extra spaces
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={options.removeEmptyLines} onChange={(e) => setOptions({...options, removeEmptyLines: e.target.checked})} className="w-5 h-5 border-2 border-border" />
          Remove empty lines
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={options.removeLineBreaks} onChange={(e) => setOptions({...options, removeLineBreaks: e.target.checked})} className="w-5 h-5 border-2 border-border" />
          Remove line breaks
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={options.addLineNumbers} onChange={(e) => setOptions({...options, addLineNumbers: e.target.checked})} className="w-5 h-5 border-2 border-border" />
          Add line numbers
        </label>
      </div>
      <div className="flex justify-between items-center">
        <button className="neo-btn neo-btn-primary" onClick={handleApply}>Apply Formatting</button>
        <button className="neo-btn neo-btn-secondary" onClick={copyToClipboard} disabled={!output}>
          {copied ? 'Copied!' : 'Copy Output'}
        </button>
      </div>
    </div>
  );
}
