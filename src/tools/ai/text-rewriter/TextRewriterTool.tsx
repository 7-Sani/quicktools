"use client";

import React, { useState } from "react";
import { RefreshCw, Copy, Check, RotateCcw, AlertCircle, Info, Cpu, Zap, ArrowRightLeft } from "lucide-react";
import { rewriteToneLocal } from "@/lib/aiUtils";

type RewriteTone = "professional" | "casual" | "academic" | "concise" | "creative" | "simplified";

const TONES: { id: RewriteTone; label: string; desc: string }[] = [
  { id: "professional", label: "Professional", desc: "Polished, courteous, and business-ready" },
  { id: "casual", label: "Casual", desc: "Warm, conversational, and accessible" },
  { id: "academic", label: "Academic", desc: "Scholarly, objective, and analytical" },
  { id: "concise", label: "Concise", desc: "Direct, punchy, and free of fluff" },
  { id: "creative", label: "Creative", desc: "Vivid, engaging, and expressive" },
  { id: "simplified", label: "Simplified", desc: "Clear, plain English with simple words" },
];

const SAMPLE_TEXT = `We are writing this communication to let you know that we have decided to postpone the scheduled product deployment until further notice due to unanticipated technical bottlenecks that were encountered by our development crew. We apologize for any inconvenience this may cause to you and your teams.`;

export default function TextRewriterTool() {
  const [inputText, setInputText] = useState("");
  const [tone, setTone] = useState<RewriteTone>("professional");
  const [engine, setEngine] = useState<"local" | "cloud">("local");
  const [rewrittenText, setRewrittenText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const inputWords = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const outputWords = rewrittenText.trim() ? rewrittenText.trim().split(/\s+/).length : 0;

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      setErrorMsg("Please enter text to rewrite.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    if (engine === "local") {
      try {
        const result = rewriteToneLocal(inputText, tone);
        setRewrittenText(result);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Error rewriting text locally");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Cloud AI rewrite
      try {
        const response = await fetch("/api/ai/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Rewrite the following text in a ${tone.toUpperCase()} tone (${TONES.find((t) => t.id === tone)?.desc}). Preserve the original intent and core facts while adopting the desired style:\n\n${inputText}`,
            systemPrompt: "You are a master writer and editor. Rewrite the given text smoothly and naturally without echoing instructions or meta-comments.",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMsg(data.details ? `${data.error}: ${data.details}` : data.error || "Rewriting failed");
          setRewrittenText("");
        } else {
          setRewrittenText(data.result);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to connect to rewriting service.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopy = () => {
    if (!rewrittenText) return;
    navigator.clipboard.writeText(rewrittenText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
    setErrorMsg(null);
  };

  const handleReset = () => {
    setInputText("");
    setRewrittenText("");
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header and Engine Toggle */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-accent" />
              Text Rewriter &amp; Tone Changer
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Adapt your writing to Professional, Casual, Academic, Concise, or Creative voices.
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
              Local Rules (Free)
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
              <strong>Local Mode:</strong> Replaces corporate jargon, expands contractions or strips filler phrases offline in real-time.
            </span>
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/60">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Cloud AI Mode:</strong> Generates fluid, context-aware paraphrasing powered by LLMs. Requires API keys on server.
            </span>
          </div>
        )}
      </div>

      {/* Tone Picker */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
        <label className="text-sm font-medium text-foreground">Select Target Tone</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              className={`p-3 text-left rounded-lg border transition-all ${
                tone === t.id
                  ? "border-accent bg-accent/10 shadow-sm"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="text-xs font-semibold text-foreground">{t.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-medium text-foreground">Original Text</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              Load Sample
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
          placeholder="Paste text you want to rewrite or transform..."
          className="w-full p-3.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{inputWords} words &bull; {inputText.length} characters</span>
          <span>Target tone: <strong className="capitalize">{tone}</strong></span>
        </div>

        <button
          onClick={handleRewrite}
          disabled={isLoading || !inputText.trim()}
          className="w-full py-2.5 px-4 bg-accent text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Rewriting Text...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Rewrite in {TONES.find((t) => t.id === tone)?.label} Tone</span>
            </>
          )}
        </button>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Rewriting Notice</p>
            <p className="text-xs text-destructive/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Output Comparison */}
      {rewrittenText && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in-50">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Rewritten Result</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium capitalize">
                {tone}
              </span>
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
                  <span>Copy Result</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                Original ({inputWords} words)
              </span>
              <div className="p-3.5 rounded-lg bg-muted/20 border border-border/50 text-xs text-muted-foreground leading-relaxed font-mono min-h-[120px] whitespace-pre-wrap">
                {inputText}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-foreground flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-accent" />
                Rewritten ({outputWords} words)
              </span>
              <div className="p-3.5 rounded-lg bg-accent/5 border border-accent/20 text-xs text-foreground leading-relaxed font-mono min-h-[120px] whitespace-pre-wrap">
                {rewrittenText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
