"use client";
import React, { useState } from 'react';
import { md5 } from 'hash-wasm';

export default function HashGeneratorTool() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const generateHashes = async (text: string) => {
    if (!text) {
      setHashes({});
      return;
    }
    setIsProcessing(true);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      const md5Hash = await md5(text);
      
      const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
      const sha1Hash = Array.from(new Uint8Array(sha1Buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
      const sha256Hash = Array.from(new Uint8Array(sha256Buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      const sha512Buffer = await crypto.subtle.digest('SHA-512', data);
      const sha512Hash = Array.from(new Uint8Array(sha512Buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      setHashes({
        'MD5': md5Hash,
        'SHA-1': sha1Hash,
        'SHA-256': sha256Hash,
        'SHA-512': sha512Hash
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    generateHashes(val);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Input Text</label>
        <textarea
          className="neo-input w-full min-h-[150px] p-4"
          value={input}
          onChange={handleInputChange}
          placeholder="Type here to generate hashes..."
        />
      </div>

      <div className="neo-card p-0 overflow-hidden relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-surface/50 flex items-center justify-center backdrop-blur-sm z-10">
            <div className="font-bold animate-pulse">Processing...</div>
          </div>
        )}
        <div className="p-6 border-b-2 border-border bg-surface">
          <h3 className="font-heading font-semibold text-lg">Hashes</h3>
        </div>
        <ul className="divide-y-2 divide-border">
          {['MD5', 'SHA-1', 'SHA-256', 'SHA-512'].map(algo => (
            <li key={algo} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-surface/50 transition-colors">
              <div className="flex-1 w-full overflow-hidden">
                <div className="font-semibold text-sm mb-1">{algo}</div>
                <div className="font-mono text-sm break-all text-text-secondary select-all">
                  {hashes[algo] || '-'}
                </div>
              </div>
              <button 
                className="neo-btn neo-btn-secondary px-3 py-1 text-sm whitespace-nowrap"
                onClick={() => copyHash(hashes[algo])}
                disabled={!hashes[algo]}
              >
                Copy
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
