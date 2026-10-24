"use client";
import React, { useState, useEffect } from 'react';

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  
  const generatePasswords = () => {
    let charset = '';
    if (uppercase) charset += excludeAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) charset += excludeAmbiguous ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += excludeAmbiguous ? '23456789' : '0123456789';
    if (symbols) charset += excludeAmbiguous ? '!@#$%^&*=' : '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (!charset) {
      setPasswords([]);
      return;
    }

    const newPasswords: string[] = [];
    for (let j = 0; j < count; j++) {
      let pwd = '';
      const randomValues = new Uint32Array(length);
      window.crypto.getRandomValues(randomValues);
      for (let i = 0; i < length; i++) {
        pwd += charset[randomValues[i] % charset.length];
      }
      newPasswords.push(pwd);
    }
    setPasswords(newPasswords);
  };

  useEffect(() => {
    generatePasswords();
  }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, count]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const calculateStrength = () => {
    if (!passwords.length) return { label: 'None', color: 'bg-surface', width: '0%' };
    let score = 0;
    if (length > 8) score += 1;
    if (length > 12) score += 1;
    if (length >= 16) score += 1;
    if (uppercase) score += 1;
    if (numbers) score += 1;
    if (symbols) score += 1;

    if (score < 3) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score < 5) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
    if (score < 6) return { label: 'Strong', color: 'bg-blue-500', width: '75%' };
    return { label: 'Very Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = calculateStrength();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="neo-card p-6 space-y-4">
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Length: {length}</label>
          <input type="range" min="8" max="128" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-accent" />
        </div>
        
        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="w-5 h-5 accent-accent border-2 border-border" />
            <span className="font-heading font-semibold text-sm tracking-wide">Uppercase (A-Z)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="w-5 h-5 accent-accent border-2 border-border" />
            <span className="font-heading font-semibold text-sm tracking-wide">Lowercase (a-z)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} className="w-5 h-5 accent-accent border-2 border-border" />
            <span className="font-heading font-semibold text-sm tracking-wide">Numbers (0-9)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} className="w-5 h-5 accent-accent border-2 border-border" />
            <span className="font-heading font-semibold text-sm tracking-wide">Symbols (!@#$...)</span>
          </label>
          <div className="h-px bg-border my-2"></div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={excludeAmbiguous} onChange={(e) => setExcludeAmbiguous(e.target.checked)} className="w-5 h-5 accent-accent border-2 border-border" />
            <span className="font-heading font-semibold text-sm tracking-wide">Exclude Ambiguous Characters</span>
          </label>
        </div>

        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Number of Passwords</label>
          <input type="number" min="1" max="50" value={count} onChange={(e) => setCount(Number(e.target.value))} className="neo-input w-full" />
        </div>

        <button className="neo-btn neo-btn-primary w-full" onClick={generatePasswords}>Generate</button>
      </div>

      <div className="space-y-4">
        <div className="neo-card p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-heading font-semibold text-sm uppercase tracking-wide">Strength: {strength.label}</span>
          </div>
          <div className="w-full h-3 border-2 border-border bg-surface rounded overflow-hidden">
            <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }}></div>
          </div>
        </div>

        <div className="neo-card p-6 space-y-3 max-h-[400px] overflow-y-auto">
          {passwords.map((pwd, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" readOnly value={pwd} className="neo-input flex-1 font-mono" />
              <button className="neo-btn neo-btn-secondary px-4" onClick={() => copyToClipboard(pwd)} title="Copy">
                Copy
              </button>
            </div>
          ))}
          {!passwords.length && <div className="text-center text-text-secondary">Select at least one character set</div>}
        </div>
      </div>
    </div>
  );
}
