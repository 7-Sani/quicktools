"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { calculateReadability, ReadabilityMetrics } from "@/lib/a11yUtils";

export default function TextReadabilityCalculatorTool() {
  const [inputText, setInputText] = useState<string>(
    "QuickTools makes everyday computing simple and accessible. We build fast, lightweight web tools that run directly in your browser without requiring an account. You can format code, check color contrast, convert files, and calculate metrics in seconds. Your personal information always stays private on your own device."
  );

  const [copied, setCopied] = useState(false);

  const metrics: ReadabilityMetrics = useMemo(() => {
    return calculateReadability(inputText);
  }, [inputText]);

  const handleReset = () => {
    setInputText(
      "QuickTools makes everyday computing simple and accessible. We build fast, lightweight web tools that run directly in your browser without requiring an account. You can format code, check color contrast, convert files, and calculate metrics in seconds. Your personal information always stays private on your own device."
    );
  };

  const handleClear = () => {
    setInputText("");
  };

  const handleLoadAcademicSample = () => {
    setInputText(
      "Notwithstanding the aforementioned stipulations regarding algorithmic computational efficiency, heterogeneous architectural implementations inevitably experience non-deterministic latency ramifications subsequent to asynchronous multi-threaded data pipeline synchronization bottlenecks across distributed cluster topologies."
    );
  };

  const handleCopyReport = () => {
    const report = `TEXT READABILITY & ACCESSIBILITY REPORT:\n` +
      `----------------------------------------\n` +
      `Flesch Reading Ease: ${metrics.fleschReadingEase} / 100 (${metrics.readingEaseDescription})\n` +
      `Flesch-Kincaid Grade Level: Grade ${metrics.fleschKincaidGrade}\n` +
      `Gunning Fog Index: ${metrics.gunningFog}\n\n` +
      `Text Statistics:\n` +
      `• Words: ${metrics.wordsCount}\n` +
      `• Sentences: ${metrics.sentencesCount}\n` +
      `• Syllables: ${metrics.syllablesCount}\n` +
      `• Complex Words (3+ syllables): ${metrics.complexWordsCount} (${metrics.wordsCount > 0 ? ((metrics.complexWordsCount / metrics.wordsCount) * 100).toFixed(1) : 0}%)\n` +
      `• Avg Sentence Length: ${metrics.sentencesCount > 0 ? (metrics.wordsCount / metrics.sentencesCount).toFixed(1) : 0} words/sentence\n\n` +
      `WCAG Guideline 3.1 Recommendation:\n` +
      (metrics.fleschReadingEase >= 60
        ? "✓ Meets plain English accessibility standards (accessible to broad audiences)."
        : "⚠️ High cognitive load: Consider breaking into shorter sentences and using simpler everyday vocabulary.");
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status color
  const isAccessibleReading = metrics.fleschReadingEase >= 60;

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-teal-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <strong>Cognitive Accessibility (WCAG 3.1.5 Reading Level):</strong> Clear, plain language benefits people with cognitive disabilities, non-native speakers, and users reading under stress or fatigue. Aim for a Flesch Reading Ease score of 60 or higher (approx. 8th-grade level).
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Text Input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Input Text
              </h2>
              <span className="text-xs font-mono font-bold text-gray-500">
                {metrics.wordsCount} words • {metrics.sentencesCount} sentences
              </span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              placeholder="Paste or write text here to analyze its reading level..."
              className="neo-input w-full p-3 text-sm leading-relaxed"
            />

            {/* Presets and actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-dark/10">
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="neo-btn text-xs px-3 py-1.5 bg-surface hover:bg-gray-100 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Plain Language Sample
                </button>
                <button
                  onClick={handleLoadAcademicSample}
                  className="neo-btn text-xs px-3 py-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 flex items-center gap-1 font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Dense Academic Sample
                </button>
              </div>

              <button
                onClick={handleClear}
                className="neo-btn text-xs px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          {/* Plain Language Writing Tips */}
          <div className="neo-card p-5 bg-white space-y-3 text-xs">
            <h3 className="font-black uppercase tracking-wider text-text-secondary">
              Plain Language Best Practices
            </h3>
            <ul className="space-y-1.5 text-gray-700 list-disc pl-4 leading-relaxed">
              <li>Keep sentences under 20-25 words. Break long compound sentences into two.</li>
              <li>Avoid dense bureaucratic jargon and latinates (e.g. use &quot;use&quot; instead of &quot;utilize&quot;).</li>
              <li>Use bullet points to break down complex lists or multi-step processes.</li>
              <li>Write in active voice (&quot;You can download files&quot; rather than &quot;Files can be downloaded by users&quot;).</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Scores & Metrics */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Readability Assessment
            </h3>

            {/* Flesch Reading Ease Hero */}
            <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
              <span className="text-xs font-bold uppercase text-text-secondary block">
                Flesch Reading Ease Score
              </span>
              <div className={`text-5xl font-black font-mono ${
                isAccessibleReading ? "text-emerald-600" : "text-rose-600"
              }`}>
                {metrics.fleschReadingEase}
              </div>
              <span className="text-xs font-bold text-gray-800 block">
                {metrics.readingEaseDescription}
              </span>
              <span className="text-[11px] text-text-secondary font-mono">
                Scale: 0 (Very Difficult) to 100 (Very Easy)
              </span>
            </div>

            {/* Compliance Callout */}
            <div className={`p-3 neo-border rounded-lg text-xs space-y-1 ${
              isAccessibleReading ? "bg-emerald-50 text-emerald-950" : "bg-rose-50 text-rose-950"
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {isAccessibleReading ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Accessible Plain Language (Score ≥60)
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    High Cognitive Barrier (Score &lt;60)
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {isAccessibleReading
                  ? "This content is easy to comprehend for general audiences and conforms to WCAG cognitive clarity guidance."
                  : "This text requires high reading effort. Consider shortening sentences and substituting multi-syllable vocabulary."}
              </p>
            </div>

            {/* Detailed Grade Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-surface/40 neo-border rounded">
                <span className="text-[10px] uppercase font-bold text-text-secondary block">
                  Grade Level (US)
                </span>
                <span className="font-mono font-bold text-sm text-gray-900">
                  Grade {metrics.fleschKincaidGrade}
                </span>
              </div>
              <div className="p-2.5 bg-surface/40 neo-border rounded">
                <span className="text-[10px] uppercase font-bold text-text-secondary block">
                  Gunning Fog Index
                </span>
                <span className="font-mono font-bold text-sm text-gray-900">
                  {metrics.gunningFog}
                </span>
              </div>
              <div className="p-2.5 bg-surface/40 neo-border rounded">
                <span className="text-[10px] uppercase font-bold text-text-secondary block">
                  Complex Words (3+ Syl)
                </span>
                <span className="font-mono font-bold text-sm text-gray-900">
                  {metrics.complexWordsCount} ({metrics.wordsCount > 0 ? ((metrics.complexWordsCount / metrics.wordsCount) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="p-2.5 bg-surface/40 neo-border rounded">
                <span className="text-[10px] uppercase font-bold text-text-secondary block">
                  Avg Sentence Length
                </span>
                <span className="font-mono font-bold text-sm text-gray-900">
                  {metrics.sentencesCount > 0 ? (metrics.wordsCount / metrics.sentencesCount).toFixed(1) : 0} words
                </span>
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyReport}
              disabled={metrics.wordsCount === 0}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Readability Report!" : "Copy Readability Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
