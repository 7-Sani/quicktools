"use client";

import React, { useState, useMemo } from "react";
import {
  Bot,
  Copy,
  Check,
  Download,
  Upload,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  FileText,
  Sparkles,
} from "lucide-react";

const PRESET_STANDARD = `# Standard robots.txt
User-agent: *
Disallow: /admin/
Disallow: /private/
Disallow: /temp/
Allow: /public/

Sitemap: https://example.com/sitemap.xml`;

const PRESET_WORDPRESS = `# WordPress robots.txt
User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Disallow: /wp-includes/
Disallow: /readme.html

Sitemap: https://example.com/wp-sitemap.xml`;

const PRESET_BLOCK_AI = `# Block aggressive scrapers and AI crawlers
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Anthropic-AI
Disallow: /

User-agent: *
Disallow: /internal/
Allow: /

Sitemap: https://example.com/sitemap.xml`;

interface RuleRecord {
  type: "disallow" | "allow";
  path: string;
  lineNumber: number;
}

interface UserAgentBlock {
  agents: string[];
  rules: RuleRecord[];
  crawlDelay?: number;
}

export default function RobotsTxtValidatorTool() {
  const [content, setContent] = useState(PRESET_STANDARD);
  const [testAgent, setTestAgent] = useState("Googlebot");
  const [testPath, setTestPath] = useState("/admin/settings");
  const [copied, setCopied] = useState(false);

  // File upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) setContent(text);
      };
      reader.readAsText(file);
    }
  };

  // Parse robots.txt lines and directives
  const parsed = useMemo(() => {
    const lines = content.split("\n");
    const blocks: UserAgentBlock[] = [];
    const sitemaps: string[] = [];
    const issues: { line: number; text: string; message: string; severity: "error" | "warning" }[] = [];

    let currentAgents: string[] = [];
    let currentRules: RuleRecord[] = [];
    let currentDelay: number | undefined = undefined;

    const commitBlock = () => {
      if (currentAgents.length > 0) {
        blocks.push({
          agents: [...currentAgents],
          rules: [...currentRules],
          crawlDelay: currentDelay,
        });
        currentAgents = [];
        currentRules = [];
        currentDelay = undefined;
      }
    };

    lines.forEach((rawLine, idx) => {
      const lineNum = idx + 1;
      // Strip comments
      const commentIndex = rawLine.indexOf("#");
      const cleanLine = (commentIndex >= 0 ? rawLine.slice(0, commentIndex) : rawLine).trim();

      if (!cleanLine) return; // Empty line

      const colonIdx = cleanLine.indexOf(":");
      if (colonIdx === -1) {
        issues.push({
          line: lineNum,
          text: rawLine,
          message: "Missing colon separator in directive.",
          severity: "error",
        });
        return;
      }

      const directive = cleanLine.slice(0, colonIdx).trim().toLowerCase();
      const value = cleanLine.slice(colonIdx + 1).trim();

      switch (directive) {
        case "user-agent":
          if (currentRules.length > 0) {
            commitBlock();
          }
          currentAgents.push(value.toLowerCase());
          break;

        case "disallow":
          if (currentAgents.length === 0) {
            issues.push({
              line: lineNum,
              text: rawLine,
              message: "Disallow directive found before any User-agent declaration.",
              severity: "error",
            });
          } else {
            currentRules.push({ type: "disallow", path: value, lineNumber: lineNum });
          }
          break;

        case "allow":
          if (currentAgents.length === 0) {
            issues.push({
              line: lineNum,
              text: rawLine,
              message: "Allow directive found before any User-agent declaration.",
              severity: "error",
            });
          } else {
            currentRules.push({ type: "allow", path: value, lineNumber: lineNum });
          }
          break;

        case "sitemap":
          sitemaps.push(value);
          if (!/^https?:\/\//i.test(value)) {
            issues.push({
              line: lineNum,
              text: rawLine,
              message: "Sitemap URL must be an absolute URL starting with http:// or https://",
              severity: "warning",
            });
          }
          break;

        case "crawl-delay":
          const delayNum = parseFloat(value);
          if (isNaN(delayNum) || delayNum < 0) {
            issues.push({
              line: lineNum,
              text: rawLine,
              message: "Invalid Crawl-delay numeric value.",
              severity: "warning",
            });
          } else {
            currentDelay = delayNum;
          }
          break;

        default:
          issues.push({
            line: lineNum,
            text: rawLine,
            message: `Unrecognized or deprecated directive "${directive}".`,
            severity: "warning",
          });
          break;
      }
    });

    commitBlock();

    return {
      blocks,
      sitemaps,
      issues,
      linesCount: lines.length,
    };
  }, [content]);

  // Test URL Simulator against Robots.txt rules
  const simulation = useMemo(() => {
    const agent = testAgent.toLowerCase().trim();
    let path = testPath.trim();
    if (!path.startsWith("/")) path = "/" + path;

    // 1. Find matching block for specific user agent, otherwise fallback to '*'
    let targetBlock = parsed.blocks.find((b) => b.agents.includes(agent));
    if (!targetBlock) {
      targetBlock = parsed.blocks.find((b) => b.agents.includes("*"));
    }

    if (!targetBlock || targetBlock.rules.length === 0) {
      return {
        allowed: true,
        matchedRule: null,
        reason: "No matching Disallow rules applied to this User-agent. Crawling is allowed by default.",
      };
    }

    // Convert robots path pattern into RegExp
    const matchRule = (pattern: string, testStr: string) => {
      if (!pattern) return false;
      // Handle wildcard * and end-anchor $
      let regexStr = "^" + pattern
        .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*");

      if (pattern.endsWith("$")) {
        regexStr = regexStr.slice(0, -2) + "$";
      }

      const regex = new RegExp(regexStr);
      return regex.test(testStr);
    };

    // Evaluate matching rules based on longest-match rule
    let bestMatch: RuleRecord | null = null;
    let longestLength = -1;

    for (const rule of targetBlock.rules) {
      if (!rule.path) {
        // Empty disallow means allow all
        if (rule.type === "disallow" && longestLength < 0) {
          bestMatch = rule;
          longestLength = 0;
        }
        continue;
      }

      if (matchRule(rule.path, path)) {
        if (rule.path.length > longestLength) {
          bestMatch = rule;
          longestLength = rule.path.length;
        } else if (rule.path.length === longestLength) {
          // If lengths are equal, Allow takes precedence over Disallow
          if (rule.type === "allow") {
            bestMatch = rule;
          }
        }
      }
    }

    if (!bestMatch) {
      return {
        allowed: true,
        matchedRule: null,
        reason: "No path match found in block. Crawling is allowed.",
      };
    }

    const isAllowed = bestMatch.type === "allow";

    return {
      allowed: isAllowed,
      matchedRule: bestMatch,
      reason: isAllowed
        ? `Matched Allow directive "${bestMatch.path}" on line ${bestMatch.lineNumber}.`
        : `Matched Disallow directive "${bestMatch.path}" on line ${bestMatch.lineNumber}.`,
    };
  }, [parsed.blocks, testAgent, testPath]);

  // Total metrics
  const totalUserAgents = parsed.blocks.reduce((acc, b) => acc + b.agents.length, 0);
  const totalDisallow = parsed.blocks.reduce(
    (acc, b) => acc + b.rules.filter((r) => r.type === "disallow").length,
    0
  );
  const totalAllow = parsed.blocks.reduce(
    (acc, b) => acc + b.rules.filter((r) => r.type === "allow").length,
    0
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "robots.txt";
    a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer banner */}
      <div className="p-3.5 neo-border rounded-lg bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-accent shrink-0" />
          <span>
            <strong>Local Robots.txt Parser:</strong> Validates syntax and tests crawl permissions according to standard Robots Exclusion Protocols on your device.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setContent(PRESET_STANDARD)}
            className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Standard Preset
          </button>
          <button
            onClick={() => setContent(PRESET_WORDPRESS)}
            className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            WordPress
          </button>
          <button
            onClick={() => setContent(PRESET_BLOCK_AI)}
            className="px-2 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
          >
            Block AI Bots
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border pb-2.5">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-accent" />
            <span className="font-heading font-bold uppercase text-xs">
              Robots.txt Content
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-semibold cursor-pointer flex items-center gap-1.5">
              <Upload size={12} className="text-accent" />
              <span>Upload .txt</span>
              <input
                type="file"
                accept=".txt,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-medium flex items-center gap-1"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 text-xs font-medium flex items-center gap-1"
            >
              <Download size={12} />
              Export
            </button>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={9}
          placeholder="User-agent: *&#10;Disallow: /admin/&#10;Allow: /"
          className="w-full neo-input p-3 font-mono text-xs leading-relaxed resize-y"
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            User-Agents
          </div>
          <div className="text-2xl font-heading font-bold text-accent">
            {totalUserAgents}
          </div>
        </div>

        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Disallow Rules
          </div>
          <div className="text-2xl font-heading font-bold text-red-500">
            {totalDisallow}
          </div>
        </div>

        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Allow Rules
          </div>
          <div className="text-2xl font-heading font-bold text-emerald-600">
            {totalAllow}
          </div>
        </div>

        <div className="neo-card p-3.5 text-center">
          <div className="text-xs font-heading font-bold uppercase text-text-secondary mb-1">
            Sitemaps Declared
          </div>
          <div className="text-2xl font-heading font-bold">
            {parsed.sitemaps.length}
          </div>
        </div>
      </div>

      {/* Interactive URL Tester */}
      <div className="neo-card p-5 space-y-4">
        <div className="font-heading font-bold text-xs uppercase text-text-secondary border-b-2 border-border pb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Play size={14} className="text-accent" /> URL Path Crawler Tester
          </span>
          <span className="text-[11px] font-normal lowercase">simulates crawler access rule</span>
        </div>

        <div className="grid sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-4 space-y-1">
            <label className="font-bold text-text-secondary block">User-Agent</label>
            <input
              type="text"
              value={testAgent}
              onChange={(e) => setTestAgent(e.target.value)}
              placeholder="e.g. Googlebot or *"
              className="w-full neo-input py-2 px-3 text-xs font-mono"
            />
          </div>

          <div className="sm:col-span-8 space-y-1">
            <label className="font-bold text-text-secondary block">Test URL Path</label>
            <input
              type="text"
              value={testPath}
              onChange={(e) => setTestPath(e.target.value)}
              placeholder="e.g. /admin/settings or /blog/post-1"
              className="w-full neo-input py-2 px-3 text-xs font-mono"
            />
          </div>
        </div>

        {/* Result Callout */}
        <div
          className={`p-4 neo-border rounded-lg flex items-start gap-3 ${
            simulation.allowed
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300"
              : "bg-red-500/10 border-red-500/40 text-red-800 dark:text-red-300"
          }`}
        >
          {simulation.allowed ? (
            <CheckCircle2 size={24} className="shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <XCircle size={24} className="shrink-0 text-red-600 mt-0.5" />
          )}
          <div className="space-y-1 text-xs">
            <div className="font-heading font-bold text-sm uppercase">
              {simulation.allowed ? "Access ALLOWED" : "Access BLOCKED"}
            </div>
            <p className="font-medium">{simulation.reason}</p>
            {simulation.matchedRule && (
              <div className="text-[11px] opacity-80 font-mono">
                Line {simulation.matchedRule.lineNumber}: {simulation.matchedRule.type.toUpperCase()}: {simulation.matchedRule.path}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Syntax Issues if any */}
      {parsed.issues.length > 0 && (
        <div className="neo-card p-4 space-y-3">
          <div className="font-heading font-bold text-xs uppercase text-text-secondary border-b-2 border-border pb-2 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-500" /> Syntax Notices &amp; Warnings ({parsed.issues.length})
          </div>

          <div className="space-y-2 text-xs">
            {parsed.issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded neo-border bg-surface flex items-start justify-between gap-2"
              >
                <div>
                  <span className="font-bold font-mono text-accent mr-2">Line {issue.line}:</span>
                  <span className="font-mono bg-border/20 px-1.5 py-0.5 rounded text-[11px] mr-2">
                    {issue.text}
                  </span>
                  <span className={issue.severity === "error" ? "text-red-500" : "text-amber-600"}>
                    {issue.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
