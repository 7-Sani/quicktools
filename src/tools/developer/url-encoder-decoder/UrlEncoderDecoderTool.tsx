"use client";
import React, { useState } from 'react';

export default function UrlEncoderDecoderTool() {
  const [decoded, setDecoded] = useState('');
  const [encoded, setEncoded] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEncode = () => {
    try {
      setEncoded(encodeURIComponent(decoded));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDecode = () => {
    try {
      setDecoded(decodeURIComponent(encoded));
      setError(null);
    } catch (e: any) {
      setError("Failed to decode: Invalid URL encoded string");
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
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block">Decoded URL</label>
          <textarea
            className="neo-input w-full min-h-[250px] resize-y p-4 font-mono text-sm break-all"
            value={decoded}
            onChange={(e) => setDecoded(e.target.value)}
            placeholder="https://example.com/search?q=hello world"
          />
          <button className="neo-btn neo-btn-primary w-full" onClick={handleEncode}>Encode →</button>
        </div>
        <div className="space-y-2">
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block">Encoded URL</label>
          <textarea
            className="neo-input w-full min-h-[250px] resize-y p-4 font-mono text-sm break-all"
            value={encoded}
            onChange={(e) => setEncoded(e.target.value)}
            placeholder="https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world"
          />
          <button className="neo-btn neo-btn-secondary w-full" onClick={handleDecode}>← Decode</button>
        </div>
      </div>
    </div>
  );
}
