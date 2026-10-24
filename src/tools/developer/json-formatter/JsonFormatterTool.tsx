"use client";
import React, { useState } from 'react';

export default function JsonFormatterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Invalid JSON');
    }
  };

  const handleMinify = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Invalid JSON');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Input JSON</label>
          <textarea
            className="neo-input w-full min-h-[400px] resize-y p-4 font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
          />
        </div>
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Output</label>
          <textarea
            className={`neo-input w-full min-h-[400px] resize-y p-4 font-mono text-sm bg-surface ${error ? 'border-red-500 focus:border-red-500' : ''}`}
            value={error ? '' : output}
            readOnly
            placeholder="Formatted JSON will appear here..."
          />
        </div>
      </div>
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-500 rounded-lg p-4 text-red-700 dark:text-red-400 font-mono text-sm">
          Error: {error}
        </div>
      )}
      <div className="neo-card p-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <label className="font-semibold flex items-center gap-2">
            Indent:
            <select 
              value={indent} 
              onChange={(e) => setIndent(Number(e.target.value))}
              className="neo-input p-2 bg-white ml-2"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button className="neo-btn neo-btn-primary" onClick={handleFormat}>Format</button>
          <button className="neo-btn neo-btn-secondary" onClick={handleMinify}>Minify</button>
          <button className="neo-btn neo-btn-secondary" onClick={copyToClipboard} disabled={!output || !!error}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
