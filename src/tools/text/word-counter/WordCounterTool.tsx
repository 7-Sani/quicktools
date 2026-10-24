"use client";
import React, { useState, useEffect } from 'react';

export default function WordCounterTool() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({ words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0, lines: 0, keywords: [] as {word: string, count: number}[] });
  
  useEffect(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, '').length;
    const wordsMatch = text.match(/\b\w+\b/g);
    const words = wordsMatch ? wordsMatch.length : 0;
    const sentencesMatch = text.match(/[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/g);
    const sentences = sentencesMatch ? sentencesMatch.length : 0;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '').length;
    const lines = text ? text.split('\n').length : 0;
    
    const wordCounts: Record<string, number> = {};
    if (wordsMatch) {
      wordsMatch.forEach(w => {
        const lower = w.toLowerCase();
        wordCounts[lower] = (wordCounts[lower] || 0) + 1;
      });
    }
    const keywords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word, count]) => ({word, count}));
    
    setStats({ words, chars, charsNoSpaces, sentences, paragraphs, lines, keywords });
  }, [text]);

  const readTime = Math.ceil(stats.words / 200);
  const speakTime = Math.ceil(stats.words / 130);

  return (
    <div className="space-y-6">
      <div>
        <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Input Text</label>
        <textarea
          className="neo-input w-full min-h-[200px] resize-y p-4"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="neo-card p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">{stats.words}</span>
          <span className="text-text-secondary uppercase text-sm font-semibold">Words</span>
        </div>
        <div className="neo-card p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">{stats.chars}</span>
          <span className="text-text-secondary uppercase text-sm font-semibold">Characters</span>
        </div>
        <div className="neo-card p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">{stats.charsNoSpaces}</span>
          <span className="text-text-secondary uppercase text-sm font-semibold">Chars (No Spaces)</span>
        </div>
        <div className="neo-card p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">{stats.sentences}</span>
          <span className="text-text-secondary uppercase text-sm font-semibold">Sentences</span>
        </div>
        <div className="neo-card p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">{stats.paragraphs}</span>
          <span className="text-text-secondary uppercase text-sm font-semibold">Paragraphs</span>
        </div>
        <div className="neo-card p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">{stats.lines}</span>
          <span className="text-text-secondary uppercase text-sm font-semibold">Lines</span>
        </div>
      </div>
      <div className="neo-card p-6">
        <h3 className="font-heading font-semibold text-lg mb-4">Reading & Speaking Time</h3>
        <p>Reading Time (200 wpm): ~{readTime} minute{readTime !== 1 ? 's' : ''}</p>
        <p>Speaking Time (130 wpm): ~{speakTime} minute{speakTime !== 1 ? 's' : ''}</p>
      </div>
      {stats.keywords.length > 0 && (
        <div className="neo-card p-6">
          <h3 className="font-heading font-semibold text-lg mb-4">Top Keywords</h3>
          <ul className="flex flex-wrap gap-2">
            {stats.keywords.map(kw => (
              <li key={kw.word} className="px-3 py-1 bg-surface border-2 border-border rounded-full text-sm font-semibold">
                {kw.word} <span className="text-text-secondary">({kw.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
