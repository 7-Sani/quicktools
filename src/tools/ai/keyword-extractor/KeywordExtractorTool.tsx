"use client";

import React, { useState } from "react";
import { Key, Copy, Check, RotateCcw, AlertCircle, Info, Cpu, Zap, Tag } from "lucide-react";
import { extractKeywordsLocal, ExtractedKeyword } from "@/lib/aiUtils";

const SAMPLE_TEXT = `Next.js is a flexible React framework that gives you building blocks to create fast, full-stack web applications. By framework, we mean Next.js handles the tooling and configuration needed for React, and provides additional structure, features, and optimizations for your application.

You can use React to build your user interface, then incrementally adopt Next.js features to solve common application requirements such as routing, data fetching, and performance rendering. Next.js supports Server Components, Turbopack, and automated SEO metadata generation.`;

export default function KeywordExtractorTool() {
  const [inputText, setInputText] = useState("");
  const [engine, setEngine] = useState<"local" | "cloud">("local");
  const [ngramType, setNgramType] = useState<"both" | "unigram" | "bigram">("both");
  const [maxKeywords, setMaxKeywords] = useState<number>(15);
  const [keywords, setKeywords] = useState<ExtractedKeyword[]>([]);
  const [cloudEntities, setCloudEntities] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleExtract = async () => {
    if (!inputText.trim()) {
      setErrorMsg("Please enter text to extract keywords from.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    if (engine === "local") {
      try {
        const found = extractKeywordsLocal(inputText, maxKeywords, ngramType);
        setKeywords(found);
        setCloudEntities("");
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Error extracting keywords");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Cloud AI extraction
      try {
        const response = await fetch("/api/ai/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Analyze the following text and extract:
1. Primary Keywords & Keyphrases (sorted by importance)
2. Named Entities (Organizations, Products, Technologies, Concepts)
3. Main Topic Categories

Text:
${inputText}`,
            systemPrompt: "You are an expert NLP keyword and entity extraction engine. Output structured, clean markdown.",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMsg(data.details ? `${data.error}: ${data.details}` : data.error || "Keyword extraction failed");
          setKeywords([]);
          setCloudEntities("");
        } else {
          setCloudEntities(data.result);
          setKeywords([]);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to connect to extraction service.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopyCommaSeparated = () => {
    let textToCopy = "";
    if (engine === "local" && keywords.length > 0) {
      textToCopy = keywords.map((k) => k.term).join(", ");
    } else if (cloudEntities) {
      textToCopy = cloudEntities;
    }
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
    setErrorMsg(null);
  };

  const handleReset = () => {
    setInputText("");
    setKeywords([]);
    setCloudEntities("");
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Key className="w-5 h-5 text-accent" />
              Keyword &amp; Entity Extractor
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Identify core keywords, n-grams, and semantic entities using local frequency scoring or cloud NLP models.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setEngine("local")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                engine === "local" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              Local TF-IDF (Free)
            </button>
            <button
              onClick={() => setEngine("cloud")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                engine === "cloud" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Cloud AI (Server API)
            </button>
          </div>
        </div>

        {engine === "local" ? (
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/60">
            <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Local TF-IDF Mode:</strong> Computes token frequency, filters common stop words, and scores unigrams and bigrams entirely inside your browser. Zero cloud dependencies.
            </span>
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/60">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Cloud AI Mode:</strong> Employs large language models for named-entity recognition (NER), topic categorization, and contextual salience.
            </span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-medium text-foreground">Content to Analyze</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              Load Sample Text
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste articles, blog posts, product pages, or research abstracts..."
          className="w-full p-3.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
        />

        {/* Options if engine === local */}
        {engine === "local" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Keyword Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNgramType("both")}
                  className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                    ngramType === "both" ? "bg-accent/15 border-accent text-accent font-semibold" : "border-border text-muted-foreground"
                  }`}
                >
                  All (1 &amp; 2 Words)
                </button>
                <button
                  type="button"
                  onClick={() => setNgramType("unigram")}
                  className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                    ngramType === "unigram" ? "bg-accent/15 border-accent text-accent font-semibold" : "border-border text-muted-foreground"
                  }`}
                >
                  Single Words
                </button>
                <button
                  type="button"
                  onClick={() => setNgramType("bigram")}
                  className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                    ngramType === "bigram" ? "bg-accent/15 border-accent text-accent font-semibold" : "border-border text-muted-foreground"
                  }`}
                >
                  Two-Word Phrases
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-foreground mb-1.5">
                <span>Maximum Keywords</span>
                <span className="text-muted-foreground">{maxKeywords}</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={maxKeywords}
                onChange={(e) => setMaxKeywords(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleExtract}
          disabled={isLoading || !inputText.trim()}
          className="w-full py-2.5 px-4 bg-accent text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Extracting Keywords...</span>
            </>
          ) : (
            <>
              <Key className="w-4 h-4" />
              <span>Extract Keywords &amp; Entities</span>
            </>
          )}
        </button>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Extraction Notice</p>
            <p className="text-xs text-destructive/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {(keywords.length > 0 || cloudEntities) && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in-50">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Extracted Results</span>
              {engine === "local" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium">
                  {keywords.length} terms found
                </span>
              )}
            </div>
            <button
              onClick={handleCopyCommaSeparated}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{engine === "local" ? "Copy as Comma-Separated" : "Copy Output"}</span>
                </>
              )}
            </button>
          </div>

          {/* Local Tags & Table */}
          {engine === "local" && keywords.length > 0 && (
            <div className="space-y-4">
              {/* Badges cloud */}
              <div className="flex flex-wrap gap-2">
                {keywords.map((k, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-accent/10 border border-accent/20 text-accent font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{k.term}</span>
                    <span className="text-[10px] px-1 rounded bg-accent/20 text-accent font-mono">
                      {k.count}x
                    </span>
                  </span>
                ))}
              </div>

              {/* Data Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-medium text-[10px]">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Term</th>
                      <th className="p-2.5">Occurrences</th>
                      <th className="p-2.5">Relative Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {keywords.map((k, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="p-2.5 text-muted-foreground">{i + 1}</td>
                        <td className="p-2.5 font-medium text-foreground">{k.term}</td>
                        <td className="p-2.5 text-muted-foreground">{k.count}</td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-accent h-full rounded-full"
                                style={{ width: `${Math.min(100, Math.round(k.score * 20))}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {k.score.toFixed(2)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cloud Entities */}
          {cloudEntities && (
            <div className="text-sm text-foreground/95 leading-relaxed p-4 bg-muted/20 rounded-lg border border-border/50 whitespace-pre-wrap font-sans">
              {cloudEntities}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
