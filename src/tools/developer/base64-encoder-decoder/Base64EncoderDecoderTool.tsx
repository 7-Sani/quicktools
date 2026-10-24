"use client";
import React, { useState } from 'react';

export default function Base64EncoderDecoderTool() {
  const [plain, setPlain] = useState('');
  const [base64, setBase64] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedPlain, setCopiedPlain] = useState(false);
  const [copiedBase64, setCopiedBase64] = useState(false);

  const handleEncode = () => {
    try {
      const bytes = new TextEncoder().encode(plain);
      const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
      setBase64(btoa(binString));
      setError(null);
    } catch (e: any) {
      setError("Failed to encode: " + e.message);
    }
  };

  const handleDecode = () => {
    try {
      const binString = atob(base64);
      const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
      setPlain(new TextDecoder().decode(bytes));
      setError(null);
    } catch (e: any) {
      setError("Failed to decode: Invalid Base64 string");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-red-700 font-semibold">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-heading font-semibold text-sm uppercase tracking-wide">Plain Text</label>
            <button 
              className="text-xs font-bold uppercase hover:text-accent transition-colors" 
              onClick={() => { navigator.clipboard.writeText(plain); setCopiedPlain(true); setTimeout(()=>setCopiedPlain(false), 2000); }}
            >
              {copiedPlain ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            className="neo-input w-full min-h-[300px] resize-y p-4"
            value={plain}
            onChange={(e) => setPlain(e.target.value)}
            placeholder="Enter plain text..."
          />
          <button className="neo-btn neo-btn-primary w-full" onClick={handleEncode}>Encode →</button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-heading font-semibold text-sm uppercase tracking-wide">Base64</label>
            <button 
              className="text-xs font-bold uppercase hover:text-accent transition-colors" 
              onClick={() => { navigator.clipboard.writeText(base64); setCopiedBase64(true); setTimeout(()=>setCopiedBase64(false), 2000); }}
            >
              {copiedBase64 ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            className="neo-input w-full min-h-[300px] resize-y p-4 font-mono text-sm break-all"
            value={base64}
            onChange={(e) => setBase64(e.target.value)}
            placeholder="Enter Base64 string..."
          />
          <button className="neo-btn neo-btn-secondary w-full" onClick={handleDecode}>← Decode</button>
        </div>
      </div>
    </div>
  );
}
