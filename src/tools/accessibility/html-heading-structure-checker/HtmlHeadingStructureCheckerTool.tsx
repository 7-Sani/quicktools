"use client";

import { useState, useMemo } from "react";
import {
  ListOrdered,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Code,
  ShieldAlert,
} from "lucide-react";
import { analyzeHeadingStructure, HeadingAnalysisResult } from "@/lib/a11yUtils";

export default function HtmlHeadingStructureCheckerTool() {
  const [htmlCode, setHtmlCode] = useState<string>(
    `<header>
  <h1>QuickTools Developer Documentation</h1>
</header>
<main>
  <h2>Getting Started</h2>
  <p>Learn how to install and setup tools.</p>
  
  <h3>Prerequisites</h3>
  <p>Node.js and modern browsers.</p>
  
  <h3>Installation</h3>
  <p>Run npm install.</p>
  
  <h2>API Reference</h2>
  <p>Explore all available endpoints.</p>
  
  <h3>Authentication</h3>
  <h4>OAuth2 Flow</h4>
  
  <h2>Community & Support</h2>
</main>`
  );

  const [copied, setCopied] = useState(false);

  const analysis: HeadingAnalysisResult = useMemo(() => {
    return analyzeHeadingStructure(htmlCode);
  }, [htmlCode]);

  const handleReset = () => {
    setHtmlCode(
      `<header>
  <h1>QuickTools Developer Documentation</h1>
</header>
<main>
  <h2>Getting Started</h2>
  <p>Learn how to install and setup tools.</p>
  
  <h3>Prerequisites</h3>
  <p>Node.js and modern browsers.</p>
  
  <h3>Installation</h3>
  <p>Run npm install.</p>
  
  <h2>API Reference</h2>
  <p>Explore all available endpoints.</p>
  
  <h3>Authentication</h3>
  <h4>OAuth2 Flow</h4>
  
  <h2>Community & Support</h2>
</main>`
    );
  };

  const handleClear = () => {
    setHtmlCode("");
  };

  const handleLoadSampleWithErrors = () => {
    setHtmlCode(
      `<header>
  <!-- Missing H1! Starts directly with H2 -->
  <h2>Welcome to the Portal</h2>
</header>
<main>
  <!-- Skipped level: H2 directly to H4 without H3 -->
  <h4>Features Overview</h4>
  
  <!-- Empty heading tag -->
  <h3></h3>
  
  <h1>Second H1 on the page</h1>
</main>`
    );
  };

  const handleCopyReport = () => {
    const report = `HTML HEADING ACCESSIBILITY AUDIT REPORT:\n` +
      `-----------------------------------------\n` +
      `Total Headings Found: ${analysis.totalCount}\n` +
      `H1 Count: ${analysis.h1Count}\n` +
      `Status: ${analysis.passed ? "PASSED (Clean Hierarchy)" : "ISSUES FOUND"}\n\n` +
      `Issues Detected:\n` +
      (analysis.issues.length > 0
        ? analysis.issues.map((iss) => `• ${iss}`).join("\n")
        : "• No hierarchy errors detected.\n") +
      `\nHeading Hierarchy Outline:\n` +
      analysis.headings
        .map((h) => `${"  ".repeat(h.level - 1)}<${h.tag}>: "${h.text || "(empty)"}" ${h.issues.length > 0 ? `[⚠️ ${h.issues.join(", ")}]` : ""}`)
        .join("\n") +
      `\n\n* Note: Local HTML snippet inspection cannot guarantee full website accessibility certification. Comprehensive audits require manual keyboard testing, screen reader verification, and full-site DOM validation.`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Scope & Certification Limitation Notice */}
      <div className="neo-card p-4 bg-teal-50 neo-border flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <strong>Audit Scope & Certification Notice:</strong> This tool parses pasted HTML markup locally to check heading rank continuity (h1 through h6), single h1 best practices, and empty tags. <em>A pasted-HTML checker cannot fully audit an entire live website or guarantee accessibility compliance certification.</em> Complete WCAG audits require screen reader testing (NVDA, VoiceOver) and full page context.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Code Input */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" /> Paste HTML Markup
              </h2>
              <span className="text-xs font-mono font-bold text-gray-500">
                {analysis.totalCount} headings found
              </span>
            </div>

            <textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              rows={12}
              placeholder="Paste HTML containing <h1>, <h2>, <h3>... tags here..."
              className="neo-input w-full p-3 text-xs font-mono leading-relaxed"
            />

            {/* Actions & Sample buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-dark/10">
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="neo-btn text-xs px-3 py-1.5 bg-surface hover:bg-gray-100 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Default Valid Sample
                </button>
                <button
                  onClick={handleLoadSampleWithErrors}
                  className="neo-btn text-xs px-3 py-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 flex items-center gap-1 font-bold"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Test Bad Hierarchy
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

          {/* Heading Best Practice Guide */}
          <div className="neo-card p-5 bg-white space-y-3 text-xs">
            <h3 className="font-black uppercase tracking-wider text-text-secondary">
              WCAG Heading Rules
            </h3>
            <ul className="space-y-1.5 text-gray-700 list-disc pl-4 leading-relaxed">
              <li>
                <strong>One Main Title:</strong> Use a single <code>&lt;h1&gt;</code> that describes the overall page topic.
              </li>
              <li>
                <strong>Don&apos;t Skip Levels:</strong> Never jump from <code>&lt;h1&gt;</code> to <code>&lt;h3&gt;</code> for visual styling. Use CSS classes for font sizing.
              </li>
              <li>
                <strong>Screen Reader Outlines:</strong> Screen readers offer heading-list navigation shortcuts (e.g. pressing &apos;H&apos; in NVDA/JAWS). Broken hierarchy causes disorientation.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Hierarchy Tree & Audit Findings */}
        <div className="lg:col-span-6 space-y-6">
          <div className="neo-card p-6 bg-white space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
                Heading Tree Outline
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded neo-border flex items-center gap-1 ${
                analysis.passed ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
              }`}>
                {analysis.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {analysis.passed ? "Valid Hierarchy" : `${analysis.issues.length} Issues Detected`}
              </span>
            </div>

            {/* Issues Callout */}
            {analysis.issues.length > 0 && (
              <div className="p-3.5 bg-rose-50 neo-border rounded-lg space-y-1.5 text-xs text-rose-950">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Accessibility Issues Found:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                  {analysis.issues.map((iss, i) => (
                    <li key={i}>{iss}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tree Diagram */}
            <div className="p-4 bg-surface/40 neo-border rounded-lg space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
              {analysis.headings.map((h) => {
                const hasIssues = h.issues.length > 0;
                const indent = (h.level - 1) * 20;

                return (
                  <div
                    key={h.id}
                    className={`p-2 rounded border transition-colors flex items-start gap-2 ${
                      hasIssues
                        ? "bg-rose-50 border-rose-300 text-rose-900"
                        : "bg-white border-dark/20 text-gray-900"
                    }`}
                    style={{ marginLeft: `${indent}px` }}
                  >
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-dark text-white shrink-0 uppercase">
                      {h.tag}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold block truncate">
                        {h.text || <em className="text-rose-600">(Empty heading)</em>}
                      </span>
                      {hasIssues && (
                        <div className="text-[10px] text-rose-700 font-sans mt-0.5">
                          {h.issues.join(" • ")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {analysis.headings.length === 0 && (
                <div className="text-center text-text-secondary text-xs italic py-6">
                  No headings detected. Paste an HTML snippet to visualize its hierarchy.
                </div>
              )}
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyReport}
              disabled={analysis.headings.length === 0}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Audit Report!" : "Copy Heading Audit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
