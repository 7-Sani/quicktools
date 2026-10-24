"use client";

import React, { useState } from "react";
import { PenTool, Copy, Check, RotateCcw, Sparkles, AlertCircle, Info, Clock, AlignLeft, FileText } from "lucide-react";

interface Template {
  id: string;
  title: string;
  category: string;
  prompt: string;
  draft: string;
}

const TEMPLATES: Template[] = [
  {
    id: "cold-email",
    title: "Cold Email Pitch",
    category: "Business",
    prompt: "Write a high-converting cold outreach email to a prospect.",
    draft: `Hi [First Name],

I noticed that your team at [Company] has been expanding your product footprint recently. 

We recently helped a similar company scale their development workflow while cutting build times by 40%. Given your recent focus on engineering velocity, I thought this might be top of mind for you.

Would you be open to a brief 10-minute chat this Thursday to see if there might be a fit?

Best regards,
[Your Name]`,
  },
  {
    id: "blog-outline",
    title: "Blog Post Outline",
    category: "Marketing",
    prompt: "Create an outline with an engaging hook and subheadings.",
    draft: `# Title: The Future of Server-Side Rendering in Modern Web Apps

## Hook:
Why modern developers are leaving single-page client rendering behind in favor of edge architectures.

## Key Sections:
1. The Latency Bottleneck: Why client-side bundle bloat costs revenue.
2. Server Components Explained: Moving computation to the edge.
3. Caching Strategies: Stale-while-revalidate and static generation.
4. Step-by-Step Migration Guide for existing applications.
5. Conclusion and Actionable Checklist.`,
  },
  {
    id: "bug-report",
    title: "Bug Report & Spec",
    category: "Engineering",
    prompt: "Generate a technical bug report template with reproducibility steps.",
    draft: `### Bug Title: Memory leak in long-running WebSocket connection

**Severity:** High  
**Environment:** Production (v2.4.1), Chrome 124, Windows 11

#### Steps to Reproduce:
1. Open application dashboard and subscribe to live feed.
2. Leave tab idle in background for 30 minutes.
3. Monitor heap allocation via DevTools Performance tab.

#### Expected Behavior:
Memory footprint should stabilize under 80 MB.

#### Actual Behavior:
Heap size grows unbounded at ~15 MB/min due to retained event listeners.`,
  },
];

export default function WritingAssistantTool() {
  const [content, setContent] = useState(TEMPLATES[0].draft);
  const [instruction, setInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const readingTimeMin = Math.max(1, Math.ceil(words / 200));

  const handleApplyTemplate = (tmpl: Template) => {
    setContent(tmpl.draft);
    setErrorMsg(null);
  };

  const handleAiAction = async (actionType: "continue" | "polish" | "persuade" | "custom") => {
    if (!content.trim() && actionType !== "custom") {
      setErrorMsg("Please enter some draft text in the editor first.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    let finalPrompt = "";
    if (actionType === "continue") {
      finalPrompt = `Continue and expand the following draft logically, adding the next paragraphs:\n\n${content}`;
    } else if (actionType === "polish") {
      finalPrompt = `Polish the following draft. Enhance sentence flow, eliminate fluff, and sharpen the vocabulary while preserving the original message:\n\n${content}`;
    } else if (actionType === "persuade") {
      finalPrompt = `Rewrite the following draft to make it more compelling, persuasive, and action-oriented:\n\n${content}`;
    } else {
      if (!instruction.trim()) {
        setErrorMsg("Please enter a custom instruction.");
        setIsLoading(false);
        return;
      }
      finalPrompt = `Instruction: ${instruction}\n\nDraft:\n${content}`;
    }

    try {
      const response = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          systemPrompt: "You are an elite executive writing assistant and copy editor. Return only the revised or expanded text with no introductory pleasantries or meta notes.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.details ? `${data.error}: ${data.details}` : data.error || "Assistant request failed");
      } else {
        setContent(data.result);
        if (actionType === "custom") setInstruction("");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to connect to writing assistant service.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setContent("");
    setInstruction("");
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <PenTool className="w-5 h-5 text-accent" />
          AI Writing Assistant
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Compose cold emails, blog outlines, technical specs, and articles with live editing tools and AI completions.
        </p>

        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/60">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span>
            <strong>Server AI Powered:</strong> Requires server AI keys (OpenAI, Gemini, or Groq) in <code>.env.local</code>. Features instant templates that work offline.
          </span>
        </div>
      </div>

      {/* Template Starter Cards */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-accent" />
          Starter Templates
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="p-3 text-left rounded-lg border border-border hover:border-accent/60 hover:bg-muted/30 transition-all text-xs space-y-1"
            >
              <div className="font-semibold text-foreground">{tmpl.title}</div>
              <div className="text-[11px] text-muted-foreground line-clamp-2">{tmpl.prompt}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Main */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5" /> {words} words
            </span>
            <span>{chars} characters</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ~{readingTimeMin} min read
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!content}
              className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-40 flex items-center gap-1"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              Copy Draft
            </button>
          </div>
        </div>

        <textarea
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Draft your content here or pick a template above..."
          className="w-full p-4 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono leading-relaxed"
        />

        {/* 1-Click AI Quick Actions */}
        <div className="space-y-3 pt-2 border-t border-border">
          <label className="text-xs font-medium text-foreground">AI Polish &amp; Extend Actions</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isLoading || !content.trim()}
              onClick={() => handleAiAction("polish")}
              className="px-3 py-1.5 rounded-md bg-accent/10 border border-accent/20 hover:bg-accent hover:text-white text-accent text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              Polish &amp; Fix Flow
            </button>

            <button
              type="button"
              disabled={isLoading || !content.trim()}
              onClick={() => handleAiAction("persuade")}
              className="px-3 py-1.5 rounded-md bg-accent/10 border border-accent/20 hover:bg-accent hover:text-white text-accent text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              Make More Persuasive
            </button>

            <button
              type="button"
              disabled={isLoading || !content.trim()}
              onClick={() => handleAiAction("continue")}
              className="px-3 py-1.5 rounded-md bg-accent/10 border border-accent/20 hover:bg-accent hover:text-white text-accent text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              Continue Writing
            </button>
          </div>

          {/* Custom Prompt Box */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Custom AI instruction (e.g. 'Add 3 bullet point benefits', 'Simplify for teenagers')..."
              className="flex-1 p-2 bg-background border border-input rounded-lg text-xs focus:ring-1 focus:ring-accent"
            />
            <button
              type="button"
              disabled={isLoading || !instruction.trim()}
              onClick={() => handleAiAction("custom")}
              className="px-4 py-2 bg-accent text-white font-medium text-xs rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 shadow-sm shrink-0"
            >
              {isLoading ? "Thinking..." : "Apply Prompt"}
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Writing Assistant Notice</p>
            <p className="text-xs text-destructive/90">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
