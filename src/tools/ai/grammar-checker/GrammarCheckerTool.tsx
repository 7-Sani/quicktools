"use client";

import React, { useState } from "react";
import { CheckCheck, Copy, Check, RotateCcw, AlertCircle, Info, Cpu, Zap, ArrowRight } from "lucide-react";
import { checkGrammarLocal, GrammarIssue } from "@/lib/aiUtils";

const SAMPLE_TEXT = `Their are several issues with this document. In order to fix them we should meet up at 5pm. Its very important that we do not make the the same mistake again!

A vast majority of people believes that AI will change everything. We should utilize this technology to make our work more easier.`;

export default function GrammarCheckerTool() {
  const [inputText, setInputText] = useState("");
  const [engine, setEngine] = useState<"local" | "cloud">("local");
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [correctedText, setCorrectedText] = useState("");
  const [cloudExplanation, setCloudExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasAudited, setHasAudited] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCheck = async () => {
    if (!inputText.trim()) {
      setErrorMsg("Please enter text to check.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    setHasAudited(true);

    if (engine === "local") {
      try {
        const found = checkGrammarLocal(inputText);
        setIssues(found);

        // Compute local auto-corrected text by applying non-conflicting suggestions
        let runningText = inputText;
        // Sort reverse by offset to not corrupt indices
        const sorted = [...found].sort((a, b) => b.offset - a.offset);
        for (const item of sorted) {
          if (item.offset >= 0 && item.offset + item.length <= runningText.length) {
            runningText =
              runningText.slice(0, item.offset) +
              item.suggestion +
              runningText.slice(item.offset + item.length);
          }
        }
        setCorrectedText(runningText);
        setCloudExplanation("");
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Error analyzing grammar");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Cloud AI model
      try {
        const response = await fetch("/api/ai/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Check and correct the grammar, spelling, punctuation, and phrasing in the following text. 
Return your response in two clearly marked sections:
### CORRECTED TEXT:
<the revised text>

### EXPLANATION OF CHANGES:
<bulleted list of specific corrections made and why>

Text:
${inputText}`,
            systemPrompt: "You are an expert copy editor and English grammar specialist. Provide rigorous corrections with clear rationale.",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMsg(data.details ? `${data.error}: ${data.details}` : data.error || "Grammar check request failed");
          setCorrectedText("");
          setCloudExplanation("");
          setIssues([]);
        } else {
          const raw = data.result;
          const splitParts = raw.split(/###\s*EXPLANATION OF CHANGES:/i);
          const revised = splitParts[0]?.replace(/###\s*CORRECTED TEXT:/i, "").trim() || raw;
          const expl = splitParts[1]?.trim() || "";

          setCorrectedText(revised);
          setCloudExplanation(expl);
          setIssues([]);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to connect to grammar service.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleApplySingleIssue = (issue: GrammarIssue) => {
    if (issue.offset >= 0 && issue.offset + issue.length <= inputText.length) {
      const next =
        inputText.slice(0, issue.offset) +
        issue.suggestion +
        inputText.slice(issue.offset + issue.length);
      setInputText(next);
      // Re-run local check
      const remaining = checkGrammarLocal(next);
      setIssues(remaining);
    }
  };

  const handleApplyAll = () => {
    if (correctedText) {
      setInputText(correctedText);
      setIssues([]);
    }
  };

  const handleCopy = () => {
    const textToCopy = correctedText || inputText;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
    setErrorMsg(null);
    setHasAudited(false);
    setIssues([]);
    setCorrectedText("");
    setCloudExplanation("");
  };

  const handleReset = () => {
    setInputText("");
    setIssues([]);
    setCorrectedText("");
    setCloudExplanation("");
    setErrorMsg(null);
    setHasAudited(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Engine Selector */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-accent" />
              Grammar &amp; Style Checker
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Identify typos, duplicate words, wordy expressions, and grammatical issues with local rules or cloud AI.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => {
                setEngine("local");
                setHasAudited(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                engine === "local" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              Rule-Based (Free &amp; Offline)
            </button>
            <button
              onClick={() => {
                setEngine("cloud");
                setHasAudited(false);
              }}
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
              <strong>Rule-Based Diagnostics:</strong> Instantly catches repeated words, commonly confused homophones (their/there/they&apos;re, its/it&apos;s), redundant wordy fillers, and subject-verb disagreements without sending text over the network.
            </span>
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/60">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Cloud AI Engine:</strong> Uses advanced LLMs to detect complex syntax errors, tone inconsistencies, and subtle contextual slips. Requires an API key on the backend.
            </span>
          </div>
        )}
      </div>

      {/* Editor & Input */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-medium text-foreground">Text to Inspect</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              Load Sample with Errors
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
          rows={7}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setHasAudited(false);
          }}
          placeholder="Type or paste content to review for grammar, spelling, and phrasing..."
          className="w-full p-3.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words &bull; {inputText.length} characters</span>
          <span>Engine: {engine === "local" ? "Offline Heuristics" : "Cloud AI"}</span>
        </div>

        <button
          onClick={handleCheck}
          disabled={isLoading || !inputText.trim()}
          className="w-full py-2.5 px-4 bg-accent text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Text...</span>
            </>
          ) : (
            <>
              <CheckCheck className="w-4 h-4" />
              <span>Check Grammar &amp; Phrasing</span>
            </>
          )}
        </button>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Grammar Check Notice</p>
            <p className="text-xs text-destructive/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Local Rule Issues List */}
      {hasAudited && engine === "local" && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in-50">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Rule-Based Findings</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  issues.length === 0
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}
              >
                {issues.length} {issues.length === 1 ? "issue" : "issues"} detected
              </span>
            </div>
            {issues.length > 0 && (
              <button
                onClick={handleApplyAll}
                className="text-xs px-3 py-1.5 rounded-md bg-accent text-white hover:opacity-90 transition-opacity"
              >
                Apply All Fixes
              </button>
            )}
          </div>

          {issues.length === 0 ? (
            <div className="text-center py-6 text-sm text-emerald-600 dark:text-emerald-400 flex flex-col items-center gap-2">
              <Check className="w-8 h-8 rounded-full bg-emerald-500/10 p-1.5" />
              <p className="font-medium">No rule-based grammar or spelling issues detected!</p>
              <p className="text-xs text-muted-foreground">For deep stylistic nuances, try switching to the Cloud AI mode.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3.5 rounded-lg border border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {issue.category}
                      </span>
                      <span className="line-through text-destructive font-mono font-medium">{issue.original}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{issue.suggestion}</span>
                    </div>
                    <p className="text-muted-foreground">{issue.message}</p>
                  </div>
                  <button
                    onClick={() => handleApplySingleIssue(issue)}
                    className="shrink-0 px-2.5 py-1 rounded bg-accent/15 border border-accent/30 text-accent hover:bg-accent hover:text-white transition-colors"
                  >
                    Accept Fix
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cloud AI Results or Corrected Output */}
      {correctedText && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in-50">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Revised &amp; Polished Text</span>
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
                  <span>Copy Corrected</span>
                </>
              )}
            </button>
          </div>

          <div className="text-sm leading-relaxed p-4 bg-muted/20 rounded-lg border border-border/50 font-mono whitespace-pre-wrap">
            {correctedText}
          </div>

          {cloudExplanation && (
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-xs font-semibold text-foreground">Explanation of Corrections</span>
              <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/10 p-3 rounded-md">
                {cloudExplanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
