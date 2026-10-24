"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, RotateCcw, AlertCircle, Info, Zap, Cpu } from "lucide-react";
import { extractSummary, extractBulletPoints } from "@/lib/aiUtils";

const SAMPLE_TEXT = `Artificial Intelligence (AI) has rapidly transformed modern society, driving innovations across healthcare, finance, transportation, and creative industries. In healthcare, machine learning algorithms analyze medical imagery to detect anomalies earlier and more accurately than traditional methods. In finance, automated trading systems and fraud detection platforms safeguard transactions across global markets at microsecond speeds.

Autonomous vehicles leverage advanced computer vision and sensor fusion to navigate complex road environments, promising to dramatically reduce traffic accidents caused by human error. Meanwhile, generative AI models can draft essays, compose music, generate computer code, and synthesize realistic imagery.

However, the rapid ascension of AI introduces pressing challenges. Algorithmic bias can perpetuate historical prejudices if training datasets are uncurated. The displacement of routine jobs demands extensive workforce reskilling. Additionally, energy consumption from training massive deep learning models raises environmental sustainability concerns. Establishing transparent governance, ethical guidelines, and robust regulatory frameworks will be vital to ensuring AI continues to benefit humanity as a whole.`;

export default function AiTextSummarizerTool() {
  const [inputText, setInputText] = useState("");
  const [engine, setEngine] = useState<"local" | "cloud">("local");
  const [summaryFormat, setSummaryFormat] = useState<"paragraph" | "bullets">("bullets");
  const [targetRatio, setTargetRatio] = useState<number>(0.35); // 35% length
  const [result, setResult] = useState<string>("");
  const [bulletResults, setBulletResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const resultWordCount = result.trim() ? result.trim().split(/\s+/).length : (bulletResults.length > 0 ? bulletResults.join(" ").split(/\s+/).length : 0);
  const reductionPercent = inputWordCount > 0 && resultWordCount > 0 ? Math.round(((inputWordCount - resultWordCount) / inputWordCount) * 100) : 0;

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setErrorMsg("Please enter or paste some text to summarize.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    if (engine === "local") {
      try {
        if (summaryFormat === "bullets") {
          const bullets = extractBulletPoints(inputText, 4);
          setBulletResults(bullets);
          setResult(bullets.map((b: string) => `• ${b}`).join("\n"));
        } else {
          const sentencesCount = Math.max(2, Math.round(targetRatio * 6));
          const summary = extractSummary(inputText, sentencesCount);
          setResult(summary);
          setBulletResults([]);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Error generating summary");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Cloud AI Provider API
      try {
        const response = await fetch("/api/ai/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Summarize the following text ${summaryFormat === "bullets" ? "as 4-5 concise, impactful bullet points" : "into a coherent summary paragraph representing about " + Math.round(targetRatio * 100) + "% of the original length"}:\n\n${inputText}`,
            systemPrompt: "You are an expert AI summarizer. Provide concise, clear, factual summaries without preamble.",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMsg(data.details ? `${data.error}: ${data.details}` : data.error || "Cloud AI request failed");
          setResult("");
          setBulletResults([]);
        } else {
          setResult(data.result);
          if (summaryFormat === "bullets") {
            const lines = data.result.split("\n").filter((l: string) => l.trim().length > 0);
            setBulletResults(lines.map((l: string) => l.replace(/^[•\-\*\d\.]+\s*/, "")));
          } else {
            setBulletResults([]);
          }
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to connect to AI summarizer service.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopy = () => {
    const textToCopy = summaryFormat === "bullets" && bulletResults.length > 0 ? bulletResults.map((b) => `• ${b}`).join("\n") : result;
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
    setResult("");
    setBulletResults([]);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner / Engine Mode selection */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              AI Text Summarizer
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Choose between instant client-side extractive summarization or deep neural cloud models.
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
              Local Extractive (Free)
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
              <strong>Local Mode:</strong> Runs 100% offline in your browser using sentence salience heuristics &amp; word frequency ranking. Zero data leaves your machine.
            </span>
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/60">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Cloud AI Mode:</strong> Connects securely to the server endpoint with your configured AI API key (OpenAI, Gemini, or Groq).
            </span>
          </div>
        )}
      </div>

      {/* Input controls & options */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-medium text-foreground">Source Text</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              Load Sample Article
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
          rows={8}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste articles, research notes, essays, or documents here..."
          className="w-full p-3.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{inputWordCount} words &bull; {inputText.length} characters</span>
          <span>Recommended minimum: 40 words</span>
        </div>

        {/* Configuration settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Output Format</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSummaryFormat("bullets")}
                className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                  summaryFormat === "bullets"
                    ? "bg-accent/15 border-accent text-accent font-semibold"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Key Takeaways (Bullets)
              </button>
              <button
                type="button"
                onClick={() => setSummaryFormat("paragraph")}
                className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                  summaryFormat === "paragraph"
                    ? "bg-accent/15 border-accent text-accent font-semibold"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Summary Paragraph
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Summary Depth: {targetRatio <= 0.25 ? "Concise (25%)" : targetRatio <= 0.5 ? "Balanced (50%)" : "Detailed (75%)"}
            </label>
            <input
              type="range"
              min="0.2"
              max="0.75"
              step="0.05"
              value={targetRatio}
              onChange={(e) => setTargetRatio(parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
        </div>

        <button
          onClick={handleSummarize}
          disabled={isLoading || !inputText.trim()}
          className="w-full py-2.5 px-4 bg-accent text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Summary...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Summarize Text</span>
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Summarization Alert</p>
            <p className="text-xs text-destructive/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Output card */}
      {(result || bulletResults.length > 0) && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in-50">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Summary Result</span>
              {reductionPercent > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium">
                  {reductionPercent}% shorter
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
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
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>

          {summaryFormat === "bullets" && bulletResults.length > 0 ? (
            <ul className="space-y-2.5 text-sm text-foreground/90 leading-relaxed">
              {bulletResults.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line bg-muted/20 p-4 rounded-lg border border-border/50">
              {result}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
            <span>Result: {resultWordCount} words</span>
            <span>Engine: {engine === "local" ? "Local Heuristic" : "Cloud AI"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
