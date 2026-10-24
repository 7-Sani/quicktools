"use client";
import React, { useState } from 'react';

const ADJECTIVES = ['swift', 'cosmic', 'silent', 'golden', 'dark', 'neon', 'frozen', 'wild', 'cyber', 'retro', 'stellar', 'toxic', 'epic', 'phantom', 'shadow', 'lunar', 'solar', 'quantum', 'mystic', 'crimson'];
const NOUNS = ['wolf', 'phoenix', 'storm', 'ninja', 'dragon', 'tiger', 'blade', 'wizard', 'ghost', 'raven', 'cobra', 'knight', 'falcon', 'viper', 'rider', 'hunter', 'samurai', 'glitch', 'nomad', 'legend'];

export default function UsernameGeneratorTool() {
  const [style, setStyle] = useState<'random' | 'cool' | 'gamer' | 'professional'>('random');
  const [lengthPref, setLengthPref] = useState<'short' | 'medium' | 'long'>('medium');
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [usernames, setUsernames] = useState<string[]>([]);

  const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const getRandomNumber = (max: number) => Math.floor(Math.random() * max);

  const generateSingleUsername = () => {
    let base = '';
    const adj = getRandomItem(ADJECTIVES);
    const noun = getRandomItem(NOUNS);

    if (style === 'professional') {
      const names = ['smith', 'jones', 'taylor', 'williams', 'brown', 'davis', 'miller', 'wilson'];
      const first = getRandomItem(['j', 'm', 'a', 'c', 'e', 'r', 't', 's']);
      base = `${first}${getRandomItem(names)}`;
    } else if (style === 'gamer') {
      const prefix = getRandomItem(['Xx', 'Pro', 'TTV', 'FaZe', 'Optic', '']);
      const suffix = getRandomItem(['xX', 'HD', 'Gaming', 'Plays', '']);
      base = `${prefix}${noun}${suffix}`;
    } else if (style === 'cool') {
      base = `${adj}${noun}`;
    } else {
      // random
      base = Math.random() > 0.5 ? `${adj}_${noun}` : `${noun}${adj}`;
    }

    if (lengthPref === 'short') base = base.substring(0, 6);
    else if (lengthPref === 'long') base = `${base}${getRandomItem(ADJECTIVES)}`;

    if (includeNumbers) {
      base += getRandomNumber(9999).toString().padStart(style === 'gamer' ? 4 : 2, '0');
    }

    return base.toLowerCase().replace(/[^a-z0-9_]/g, '');
  };

  const generate = () => {
    const newNames = Array.from({ length: 10 }, () => generateSingleUsername());
    setUsernames(newNames);
  };

  const copyName = (name: string) => {
    navigator.clipboard.writeText(name);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="neo-card p-6 space-y-6">
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Style</label>
          <select className="neo-input w-full" value={style} onChange={(e) => setStyle(e.target.value as any)}>
            <option value="random">Random (Adjective+Noun)</option>
            <option value="cool">Cool</option>
            <option value="gamer">Gamer / Tryhard</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Length</label>
          <div className="flex gap-2">
            {['short', 'medium', 'long'].map(l => (
              <button 
                key={l} 
                className={`flex-1 text-xs px-2 py-2 border-2 border-border font-bold uppercase tracking-wider ${lengthPref === l ? 'bg-accent text-white' : 'bg-surface hover:bg-border/10'}`}
                onClick={() => setLengthPref(l as any)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="w-5 h-5 accent-accent border-2 border-border" />
          <span className="font-heading font-semibold text-sm tracking-wide">Include Numbers</span>
        </label>

        <button className="neo-btn neo-btn-primary w-full" onClick={generate}>Generate Usernames</button>
      </div>

      <div className="neo-card p-6 flex flex-col">
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wide mb-4 text-text-secondary">Generated Usernames</h3>
        <div className="flex-1 space-y-2 max-h-[350px] overflow-y-auto pr-2">
          {usernames.length > 0 ? usernames.map((name, i) => (
            <div key={i} className="flex gap-2 items-center group">
              <div className="flex-1 p-3 bg-surface border-2 border-border rounded font-mono font-bold text-lg group-hover:border-accent transition-colors">
                {name}
              </div>
              <button className="neo-btn neo-btn-secondary px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyName(name)}>
                Copy
              </button>
            </div>
          )) : (
            <div className="h-full flex items-center justify-center text-text-secondary border-2 border-dashed border-border rounded p-8 text-center">
              Click Generate to get some cool usernames!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
