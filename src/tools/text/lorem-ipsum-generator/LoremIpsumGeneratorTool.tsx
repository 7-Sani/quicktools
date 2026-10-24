"use client";
import React, { useState } from 'react';

const LOREM_WORDS = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"];

export default function LoremIpsumGeneratorTool() {
  const [type, setType] = useState('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generateWords = (num: number, startFirst = false) => {
    let result = [];
    if (startFirst && num >= 5) {
      result.push("Lorem", "ipsum", "dolor", "sit", "amet,");
      num -= 5;
    }
    for (let i = 0; i < num; i++) {
      result.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    }
    return result.join(' ');
  };

  const generateSentence = (startFirst = false) => {
    const wordCount = Math.floor(Math.random() * 8) + 5;
    let sentence = generateWords(wordCount, startFirst);
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    return sentence;
  };

  const generateParagraph = (startFirst = false) => {
    const sentenceCount = Math.floor(Math.random() * 4) + 4;
    let sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence(startFirst && i === 0));
    }
    return sentences.join(' ');
  };

  const handleGenerate = () => {
    let result = [];
    for (let i = 0; i < count; i++) {
      const isFirst = i === 0 && startWithLorem;
      if (type === 'paragraphs') result.push(generateParagraph(isFirst));
      else if (type === 'sentences') result.push(generateSentence(isFirst));
      else if (type === 'words') result.push(generateWords(count, startWithLorem));
    }
    if (type === 'words') {
      setOutput(result[0] || ''); // result has single element for words
    } else {
      setOutput(result.join(type === 'paragraphs' ? '\n\n' : ' '));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="neo-card p-6 flex flex-wrap gap-6 items-center">
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Generate</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={count} 
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="neo-input w-24 p-2 text-center"
            />
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="neo-input p-2 bg-white"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <label className="flex items-center gap-2 cursor-pointer font-semibold">
            <input type="checkbox" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)} className="w-5 h-5 border-2 border-border" />
            Start with 'Lorem ipsum...'
          </label>
        </div>
        <div className="mt-6 ml-auto">
          <button className="neo-btn neo-btn-primary" onClick={handleGenerate}>Generate</button>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-heading font-semibold text-sm uppercase tracking-wide">Output</label>
          <button className="neo-btn neo-btn-secondary px-3 py-1 text-sm" onClick={copyToClipboard} disabled={!output}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          className="neo-input w-full min-h-[300px] resize-y p-4 bg-surface"
          value={output}
          readOnly
          placeholder="Generated text will appear here..."
        />
      </div>
    </div>
  );
}
