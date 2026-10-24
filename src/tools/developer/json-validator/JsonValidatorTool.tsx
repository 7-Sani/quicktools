"use client";
import React, { useState } from 'react';

export default function JsonValidatorTool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{valid: boolean; message: string} | null>(null);

  const handleValidate = () => {
    if (!input.trim()) {
      setResult(null);
      return;
    }
    try {
      JSON.parse(input);
      setResult({ valid: true, message: 'Valid JSON' });
    } catch (e: any) {
      setResult({ valid: false, message: e.message || 'Invalid JSON' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">JSON Input</label>
        <textarea
          className="neo-input w-full min-h-[300px] resize-y p-4 font-mono text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
        />
      </div>
      
      <div className="flex justify-center">
        <button className="neo-btn neo-btn-primary px-12" onClick={handleValidate}>Validate JSON</button>
      </div>

      {result && (
        <div className={`border-2 rounded-lg p-6 font-mono text-sm font-semibold flex items-start gap-4 ${result.valid ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-50 border-red-500 text-red-700 dark:bg-red-950/30 dark:text-red-400'}`}>
          <span className="text-2xl">{result.valid ? '✓' : '✗'}</span>
          <div className="pt-1">
            {result.message}
          </div>
        </div>
      )}
    </div>
  );
}
