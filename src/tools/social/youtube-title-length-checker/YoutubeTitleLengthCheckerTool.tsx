"use client";

import { useState } from "react";
import {
  Video,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  Smartphone,
  Monitor,
  Sidebar,
  Type,
} from "lucide-react";

export default function YoutubeTitleLengthCheckerTool() {
  const [title, setTitle] = useState<string>(
    "How to Build a Modern SaaS Application with Next.js in 2026 (Full Course)"
  );
  const [channelName, setChannelName] = useState<string>("CodeCraft Studios");
  const [copied, setCopied] = useState(false);

  // Power / Emotional trigger words for CTR
  const POWER_WORDS = [
    "how to", "guide", "free", "best", "top", "ultimate", "secret", "step by step",
    "course", "tutorial", "beginner", "advanced", "fast", "easy", "simple", "review",
    "vs", "new", "never", "why", "stop", "mistake", "warning"
  ];

  const charCount = title.length;
  const wordCount = title.trim() ? title.trim().split(/\s+/).length : 0;

  // Uppercase ratio check
  const lettersOnly = title.replace(/[^a-zA-Z]/g, "");
  const uppercaseLetters = title.replace(/[^A-Z]/g, "").length;
  const uppercaseRatio = lettersOnly.length > 0 ? (uppercaseLetters / lettersOnly.length) * 100 : 0;
  const isAllCapsSpam = uppercaseRatio > 60 && title.length > 15;

  // Numbers detection
  const hasNumbers = /\d/.test(title);

  // Power words found
  const lowerTitle = title.toLowerCase();
  const matchedPowerWords = POWER_WORDS.filter((word) => lowerTitle.includes(word));

  // Limits
  const MAX_LIMIT = 100;
  const SWEET_SPOT_MIN = 50;
  const SWEET_SPOT_MAX = 70;

  const isOverHardLimit = charCount > MAX_LIMIT;
  const isInSweetSpot = charCount >= SWEET_SPOT_MIN && charCount <= SWEET_SPOT_MAX;

  // Title Case Converter
  const handleTitleCase = () => {
    const minorWords = new Set(["a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "by", "with", "in", "of"]);
    const words = title.split(" ");
    const titleCased = words
      .map((word, index) => {
        const lower = word.toLowerCase();
        if (index > 0 && minorWords.has(lower)) {
          return lower;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
    setTitle(titleCased);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setTitle("How to Build a Modern SaaS Application with Next.js in 2026 (Full Course)");
    setChannelName("CodeCraft Studios");
  };

  const handleClear = () => {
    setTitle("");
  };

  // Truncation approximations
  const desktopTruncated = title.length > 65 ? title.slice(0, 65) + "..." : title;
  const mobileTruncated = title.length > 50 ? title.slice(0, 50) + "..." : title;
  const sidebarTruncated = title.length > 55 ? title.slice(0, 55) + "..." : title;

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-amber-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>YouTube Title Optimizer:</strong> YouTube permits up to 100 characters in video titles, but mobile and desktop search results truncate titles longer than 60–70 characters. This tool checks your title locally and previews cutoff points without modifying your YouTube channel.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Diagnostics */}
        <div className="lg:col-span-7 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> YouTube Video Title
              </h2>
              <span className={`text-xs font-mono font-bold ${isOverHardLimit ? "text-rose-600 font-black" : "text-gray-600"}`}>
                {charCount} / {MAX_LIMIT} Chars
              </span>
            </div>

            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={3}
              placeholder="Enter your YouTube video title..."
              className={`neo-input w-full p-3 text-base leading-relaxed ${
                isOverHardLimit ? "border-rose-500 bg-rose-50/20" : ""
              }`}
            />

            {/* Character meter */}
            <div className="space-y-1">
              <div className="w-full h-3 bg-gray-100 neo-border rounded-full overflow-hidden flex">
                {/* 0 to 50 */}
                <div
                  className="h-full bg-blue-400 transition-all"
                  style={{ width: `${Math.min(50, charCount)}%` }}
                />
                {/* 50 to 70 (Sweet spot) */}
                {charCount > 50 && (
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.min(20, charCount - 50)}%` }}
                  />
                )}
                {/* 70 to 100 */}
                {charCount > 70 && (
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${Math.min(30, charCount - 70)}%` }}
                  />
                )}
                {/* > 100 Over limit */}
                {charCount > 100 && (
                  <div
                    className="h-full bg-rose-500 transition-all"
                    style={{ width: `${Math.min(20, charCount - 100)}%` }}
                  />
                )}
              </div>
              <div className="flex justify-between text-[11px] text-text-secondary font-mono">
                <span>0</span>
                <span className="text-emerald-700 font-bold">50-70 Sweet Spot</span>
                <span>100 Max</span>
              </div>
            </div>

            {/* Diagnostics checklist */}
            <div className="p-4 bg-surface/40 neo-border rounded-lg space-y-2 text-xs">
              <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider">
                CTR & SEO Analysis
              </h4>

              <div className="flex items-center justify-between">
                <span>Length Status:</span>
                <span className="font-bold flex items-center gap-1">
                  {isOverHardLimit ? (
                    <span className="text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Exceeds 100 Max Limit!
                    </span>
                  ) : isInSweetSpot ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Length (50–70 chars)
                    </span>
                  ) : charCount < 50 ? (
                    <span className="text-blue-600 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Short Title (Leaves room for keywords)
                    </span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Long (May truncate on mobile)
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>ALL CAPS Detection:</span>
                <span className={`font-bold flex items-center gap-1 ${isAllCapsSpam ? "text-rose-600" : "text-emerald-600"}`}>
                  {isAllCapsSpam ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isAllCapsSpam ? "Too many uppercase letters (Spam risk)" : "Balanced casing"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Contains Numbers:</span>
                <span className={`font-bold flex items-center gap-1 ${hasNumbers ? "text-emerald-600" : "text-gray-500"}`}>
                  {hasNumbers ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                  {hasNumbers ? "Includes numbers (Proven to lift CTR)" : "No numbers detected"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                <span>Hook / Power Words:</span>
                <span className="font-bold text-gray-800">
                  {matchedPowerWords.length > 0 ? (
                    <span className="text-emerald-700">
                      Found: {matchedPowerWords.join(", ")}
                    </span>
                  ) : (
                    <span className="text-gray-500">None detected</span>
                  )}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={handleTitleCase}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
                title="Format to Title Case"
              >
                <Type className="w-3.5 h-3.5" /> Title Case
              </button>
              <button
                onClick={handleCopy}
                className="neo-btn text-xs px-3 py-2 bg-primary text-white font-bold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Title"}
              </button>
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                onClick={handleClear}
                className="neo-btn text-xs px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulated Cutoff Previews */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-800">
              Cutoff & Truncation Previews
            </h3>

            {/* Preview 1: Desktop Search Cutoff */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                <span className="flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-primary" /> Desktop Search Result (~65 chars)
                </span>
                <span className="font-mono text-[11px]">{desktopTruncated.length} chars</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer leading-snug">
                  {desktopTruncated}
                </h4>
                <div className="text-[11px] text-gray-500 mt-1">
                  {channelName} • 180K views • 2 weeks ago
                </div>
              </div>
            </div>

            {/* Preview 2: Mobile Search Cutoff */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-primary" /> Mobile App Feed (~50 chars)
                </span>
                <span className="font-mono text-[11px]">{mobileTruncated.length} chars</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg max-w-sm">
                <h4 className="text-xs font-semibold text-gray-900 leading-snug">
                  {mobileTruncated}
                </h4>
                <div className="text-[10px] text-gray-500 mt-1">
                  {channelName} • 180K views
                </div>
              </div>
            </div>

            {/* Preview 3: Suggested Videos Sidebar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                <span className="flex items-center gap-1">
                  <Sidebar className="w-3.5 h-3.5 text-primary" /> Suggested / Up Next Sidebar (~55 chars)
                </span>
                <span className="font-mono text-[11px]">{sidebarTruncated.length} chars</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex gap-2.5 items-center">
                <div className="w-24 aspect-video bg-gray-300 rounded shrink-0 flex items-center justify-center text-[9px] text-gray-600 font-mono">
                  16:9
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {sidebarTruncated}
                  </h5>
                  <div className="text-[10px] text-gray-500 mt-0.5 truncate">{channelName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
