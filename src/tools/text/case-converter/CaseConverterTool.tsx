"use client";
import React, { useState } from 'react';

export default function CaseConverterTool() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleConvert = (type: string) => {
    let result = text;
    switch (type) {
      case 'upper': result = text.toUpperCase(); break;
      case 'lower': result = text.toLowerCase(); break;
      case 'title': 
        result = text.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); 
        break;
      case 'sentence': 
        result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()); 
        break;
      case 'camel': 
        result = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); 
        break;
      case 'snake': 
        result = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || ''; 
        break;
      case 'kebab': 
        result = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || ''; 
        break;
      case 'constant': 
        result = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toUpperCase()).join('_') || ''; 
        break;
    }
    setText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Input / Output</label>
        <textarea
          className="neo-input w-full min-h-[200px] resize-y p-4"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="neo-btn neo-btn-secondary" onClick={() => handleConvert('sentence')}>Sentence case</button>
        <button className="neo-btn neo-btn-secondary" onClick={() => handleConvert('lower')}>lowercase</button>
        <button className="neo-btn neo-btn-secondary" onClick={() => handleConvert('upper')}>UPPERCASE</button>
        <button className="neo-btn neo-btn-secondary" onClick={() => handleConvert('title')}>Title Case</button>
        <button className="neo-btn neo-btn-secondary" onClick={() => handleConvert('camel')}>camelCase</button>
        <button className="neo-btn neo-btn-secondary" onClick={() => handleConvert('snake')}>snake_case</button>
        <button className="neo-btn neo-btn-secondary" onClick={() => handleConvert('kebab')}>kebab-case</button>
        <button className="neo-btn neo-btn-secondary" onClick={() => handleConvert('constant')}>CONSTANT_CASE</button>
      </div>
      <div className="flex justify-end">
        <button className="neo-btn neo-btn-primary" onClick={copyToClipboard}>
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
}
