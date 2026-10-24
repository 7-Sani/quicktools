"use client";
import React, { useState, useEffect } from 'react';

export default function SlugGeneratorTool() {
  const [text, setText] = useState('Hello World! This is a test 123 😊');
  const [separator, setSeparator] = useState<'-' | '_'>('-');
  const [lowercase, setLowercase] = useState(true);
  const [maxLength, setMaxLength] = useState<number>(50);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    let s = text;
    if (lowercase) s = s.toLowerCase();
    
    // Normalize unicode and remove accents
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Replace spaces and special characters with separator
    s = s.replace(/[^\w\s-]/g, '') // Remove all non-word chars
         .replace(/[\s_-]+/g, separator) // Replace spaces and existing separators with chosen separator
         .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), ''); // Trim separators from start/end

    if (maxLength > 0) {
      s = s.substring(0, maxLength);
      // Trim again in case we cut on a separator
      s = s.replace(new RegExp(`${separator}+$`, 'g'), '');
    }

    setSlug(s);
  }, [text, separator, lowercase, maxLength]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="neo-card p-6 space-y-4">
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Input Text</label>
          <textarea 
            className="neo-input w-full h-32 resize-none" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to slug..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Separator</label>
            <select className="neo-input w-full" value={separator} onChange={(e) => setSeparator(e.target.value as any)}>
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
            </select>
          </div>
          <div>
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Max Length</label>
            <input type="number" className="neo-input w-full" value={maxLength} onChange={(e) => setMaxLength(Number(e.target.value))} min="0" />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="w-5 h-5 accent-accent border-2 border-border" />
              <span className="font-heading font-semibold text-sm tracking-wide">Force Lowercase</span>
            </label>
          </div>
        </div>
      </div>

      <div className="neo-card p-6 bg-accent/5 border-accent">
        <div className="flex justify-between items-center mb-4">
          <label className="font-heading font-semibold text-sm uppercase tracking-wide text-text-secondary">Generated Slug</label>
          <span className="text-xs font-mono bg-surface px-2 py-1 rounded border border-border">Length: {slug.length}</span>
        </div>
        <div className="flex gap-2">
          <input type="text" readOnly value={slug} className="neo-input flex-1 font-mono text-lg bg-surface break-all" />
          <button className="neo-btn neo-btn-primary px-6" onClick={() => navigator.clipboard.writeText(slug)} disabled={!slug}>
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
