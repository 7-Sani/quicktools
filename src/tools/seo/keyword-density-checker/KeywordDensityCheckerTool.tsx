"use client";

import React, { useState, useMemo } from "react";
import {
  FileSearch,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  Search,
  Filter,
  Shield,
  FileText,
  Code,
  AlertTriangle,
} from "lucide-react";

// Standard English stop words
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
  "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
  "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
  "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves",
]);

const SAMPLE_TEXT = `Search engine optimization (SEO) is the process of improving the quality and quantity of website traffic from search engines. SEO targets unpaid traffic rather than direct traffic or paid traffic. Unpaid traffic may originate from different kinds of searches, including image search, video search, academic search, news search, and industry-specific vertical search engines.

As an internet marketing strategy, SEO considers how search engines work, the computer-programmed algorithms that dictate search engine behavior, what people search for, the actual search terms or keywords typed into search engines, and which search engines are preferred by their targeted audience. SEO is performed because a website will receive more visitors from a search engine when websites rank higher on the search engine results page (SERP).

Optimizing a website may involve editing its content, adding content, and modifying HTML and associated coding to both increase its relevance to specific keywords and remove barriers to the indexing activities of search engines. Promoting a site to increase the number of backlinks, or inbound links, is another SEO tactic.`;

type NGram = 1 | 2 | 3 | 4;

export default function KeywordDensityCheckerTool() {
  const [content, setContent] = useState(SAMPLE_TEXT);
  const [isHtml, setIsHtml] = useState(false);
  const [ignoreStopWords, setIgnoreStopWords] = useState(true);
  const [minWordLength, setMinWordLength] = useState(3);
  const [activeNgram, setActiveNgram] = useState<NGram>(1);
  const [searchFilter, setSearchFilter] = useState("");
  const [minFrequency, setMinFrequency] = useState(1);
  const [copied, setCopied] = useState(false);

  // Strip HTML helper
  const cleanText = useMemo(() => {
    if (!content.trim()) return "";
    if (!isHtml) return content;
    // Strip HTML tags using DOMParser safely in browser
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      return doc.body.textContent || "";
    } catch {
      return content.replace(/<[^>]*>/g, " ");
    }
  }, [content, isHtml]);

  // Tokenize words
  const tokens = useMemo(() => {
    if (!cleanText.trim()) return [];
    // Match alphanumeric words with apostrophes/hyphens inside
    const rawMatches = cleanText.toLowerCase().match(/\b[a-z0-9]+(?:'[a-z0-9]+)?\b/g) || [];
    return rawMatches;
  }, [cleanText]);

  // Overall text statistics
  const stats = useMemo(() => {
    const totalWords = tokens.length;
    const totalChars = cleanText.length;
    const readingTimeMinutes = Math.ceil(totalWords / 200) || 1;
    const uniqueTokens = new Set(tokens);
    return {
      totalWords,
      totalChars,
      uniqueWords: uniqueTokens.size,
      readingTime: `${readingTimeMinutes} min read`,
    };
  }, [tokens, cleanText]);

  // Calculate N-grams frequency and density
  const keywordData = useMemo(() => {
    if (tokens.length === 0) return [];

    const freqMap = new Map<string, number>();
    const n = activeNgram;
    const totalPossibleNgrams = Math.max(tokens.length - n + 1, 1);

    for (let i = 0; i <= tokens.length - n; i++) {
      const slice = tokens.slice(i, i + n);

      // Stop words filtering
      if (ignoreStopWords) {
        if (n === 1) {
          if (STOP_WORDS.has(slice[0])) continue;
        } else {
          // For phrases, skip if first and last are stop words
          if (STOP_WORDS.has(slice[0]) && STOP_WORDS.has(slice[slice.length - 1])) {
            continue;
          }
        }
      }

      // Length filtering on single words
      if (n === 1 && slice[0].length < minWordLength) {
        continue;
      }

      const phrase = slice.join(" ");
      freqMap.set(phrase, (freqMap.get(phrase) || 0) + 1);
    }

    const items = Array.from(freqMap.entries()).map(([phrase, count]) => {
      // Density calculated against total words in document (or total N-gram windows)
      const density = ((count * n) / Math.max(tokens.length, 1)) * 100;
      return {
        keyword: phrase,
        count,
        density: Number(density.toFixed(2)),
      };
    });

    // Sort descending by count, then density
    items.sort((a, b) => b.count - a.count || b.density - a.density);

    return items;
  }, [tokens, activeNgram, ignoreStopWords, minWordLength]);

  // Filtered keywords for table display
  const filteredData = useMemo(() => {
    return keywordData.filter((item) => {
      if (item.count < minFrequency) return false;
      if (searchFilter.trim() && !item.keyword.toLowerCase().includes(searchFilter.toLowerCase().trim())) {
        return false;
      }
      return true;
    });
  }, [keywordData, searchFilter, minFrequency]);

  // Detect potential keyword stuffing
  const highDensityKeywords = useMemo(() => {
    return keywordData.filter((k) => k.density > 3.5 && k.count > 3);
  }, [keywordData]);

  // Copy CSV
  const handleCopyCsv = () => {
    const csvHeader = "Keyword,Count,Density (%)\n";
    const csvRows = filteredData.map((d) => `"${d.keyword}",${d.count},${d.density}%`).join("\n");
    navigator.clipboard.writeText(csvHeader + csvRows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const csvHeader = "Keyword,Count,Density (%)\n";
    const csvRows = filteredData.map((d) => `"${d.keyword}",${d.count},${d.density}%`).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `keyword-density-${activeNgram}words.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header controls & Local badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="neo-border rounded px-2.5 py-1 text-xs font-semibold bg-accent-light text-accent flex items-center gap-1.5">
            <Shield size={14} /> Local Client-Side Analysis
          </span>
          <span className="text-xs text-text-secondary">
            Zero server uploads • Private &amp; Instant
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setContent(SAMPLE_TEXT)}
            className="text-xs px-3 py-1.5 neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1.5"
          >
            <Sparkles size={14} className="text-accent" />
            Load Sample
          </button>
          <button
            onClick={() => setContent("")}
            disabled={!content}
            className="text-xs px-3 py-1.5 neo-border rounded bg-surface hover:bg-red-500/10 text-red-600 font-medium flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Input Text / HTML Area */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b-2 border-border pb-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHtml(false)}
              className={`text-xs px-3 py-1 neo-border rounded font-semibold transition-colors flex items-center gap-1.5 ${
                !isHtml ? "bg-accent text-white" : "bg-surface hover:bg-accent/10"
              }`}
            >
              <FileText size={13} /> Plain Text
            </button>
            <button
              onClick={() => setIsHtml(true)}
              className={`text-xs px-3 py-1 neo-border rounded font-semibold transition-colors flex items-center gap-1.5 ${
                isHtml ? "bg-accent text-white" : "bg-surface hover:bg-accent/10"
              }`}
            >
              <Code size={13} /> Raw HTML Code
            </button>
          </div>
          <span className="font-mono text-xs text-text-secondary">
            {stats.totalWords.toLocaleString()} words • {stats.totalChars.toLocaleString()} characters
          </span>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isHtml ? "Paste HTML snippet or full webpage source code here..." : "Paste your article, blog post, or webpage copy here to analyze keyword density..."}
          rows={7}
          className="w-full neo-input p-3 text-sm font-mono leading-relaxed resize-y"
        />

        {isHtml && (
          <p className="text-xs text-text-secondary flex items-center gap-1">
            <span className="font-semibold text-accent">Note:</span> HTML markup tags (e.g. &lt;p&gt;, &lt;div&gt;, &lt;a&gt;) are automatically stripped so only actual visible text is measured.
          </p>
        )}
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Total Words
          </div>
          <div className="text-2xl font-heading font-bold text-accent">
            {stats.totalWords.toLocaleString()}
          </div>
        </div>
        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Unique Words
          </div>
          <div className="text-2xl font-heading font-bold">
            {stats.uniqueWords.toLocaleString()}
          </div>
        </div>
        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Lexical Diversity
          </div>
          <div className="text-2xl font-heading font-bold">
            {stats.totalWords > 0
              ? `${Math.round((stats.uniqueWords / stats.totalWords) * 100)}%`
              : "0%"}
          </div>
        </div>
        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Reading Time
          </div>
          <div className="text-2xl font-heading font-bold">
            {stats.readingTime}
          </div>
        </div>
      </div>

      {/* Warning banner if keyword stuffing detected */}
      {highDensityKeywords.length > 0 && (
        <div className="p-3.5 neo-border rounded-lg bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-600" />
          <div className="text-xs space-y-1">
            <div className="font-bold font-heading text-sm uppercase">
              Potential Keyword Stuffing Warning
            </div>
            <p>
              Search engines recommend keeping keyword density between 1% and 2.5%. The following keywords exceed 3.5% density:{" "}
              <span className="font-semibold underline">
                {highDensityKeywords.map((k) => `"${k.keyword}" (${k.density}%)`).join(", ")}
              </span>. Consider adding synonyms to improve natural readability.
            </p>
          </div>
        </div>
      )}

      {/* Analysis Settings & N-gram Tabs */}
      <div className="neo-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-3">
          {/* N-Gram Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-bold text-xs uppercase mr-1">Phrase Length:</span>
            {([1, 2, 3, 4] as NGram[]).map((n) => (
              <button
                key={n}
                onClick={() => setActiveNgram(n)}
                className={`px-3 py-1 neo-border rounded text-xs font-heading font-bold uppercase transition-colors ${
                  activeNgram === n
                    ? "bg-accent text-white"
                    : "bg-surface hover:bg-accent/10"
                }`}
              >
                {n === 1 ? "1 Word" : `${n} Words`}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCsv}
              disabled={filteredData.length === 0}
              className="px-2.5 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy CSV"}
            </button>
            <button
              onClick={handleDownloadCsv}
              disabled={filteredData.length === 0}
              className="px-2.5 py-1 text-xs neo-border rounded bg-surface hover:bg-accent/10 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-5 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search keyword..."
              className="w-full neo-input pl-8 py-1.5 text-xs"
            />
          </div>

          <div className="sm:col-span-3 flex items-center gap-2">
            <span className="text-text-secondary shrink-0">Min count:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={minFrequency}
              onChange={(e) => setMinFrequency(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 neo-input py-1 px-2 text-xs"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ignoreStopWords}
                onChange={(e) => setIgnoreStopWords(e.target.checked)}
                className="rounded accent-accent"
              />
              <span>Filter stop words</span>
            </label>

            {activeNgram === 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-text-secondary">Min chars:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={minWordLength}
                  onChange={(e) => setMinWordLength(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 neo-input py-1 px-2 text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Keywords Table */}
        <div className="overflow-x-auto max-h-96 border-2 border-border rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-surface neo-border border-x-0 border-t-0 font-heading font-bold uppercase text-text-secondary">
              <tr>
                <th className="p-2.5 w-12 text-center">#</th>
                <th className="p-2.5">Keyword Phrase</th>
                <th className="p-2.5 w-24 text-right">Frequency</th>
                <th className="p-2.5 w-32 text-right">Density</th>
                <th className="p-2.5 w-36">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    No keywords found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => {
                  let statusColor = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
                  let statusLabel = "Optimal (1–2.5%)";

                  if (item.density > 3.0) {
                    statusColor = "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30";
                    statusLabel = "High / Risk (>3%)";
                  } else if (item.density < 0.8) {
                    statusColor = "bg-gray-500/10 text-text-secondary border-border";
                    statusLabel = "Low (<0.8%)";
                  }

                  return (
                    <tr key={item.keyword} className="hover:bg-accent/5">
                      <td className="p-2.5 text-center text-text-secondary font-mono">{idx + 1}</td>
                      <td className="p-2.5 font-medium">{item.keyword}</td>
                      <td className="p-2.5 text-right font-mono font-semibold">{item.count}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-accent">
                        {item.density.toFixed(2)}%
                      </td>
                      <td className="p-2.5">
                        <span className={`inline-block px-2 py-0.5 neo-border rounded text-[11px] font-medium ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
