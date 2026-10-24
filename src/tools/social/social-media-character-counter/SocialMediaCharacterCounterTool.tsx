"use client";

import { useState, useMemo } from "react";
import {
  Type,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Filter,
} from "lucide-react";
import { PLATFORM_LIMITS, PlatformLimit } from "@/lib/socialUtils";

export default function SocialMediaCharacterCounterTool() {
  const [inputText, setInputText] = useState<string>(
    "🚀 Excited to introduce our new open-source Social Media Suite! 100% free, runs locally in your browser, and built for modern creators & devs. Check it out at https://quicktools.dev #webdev #indiehackers @quicktools"
  );
  const [filterCategory, setFilterCategory] = useState<"all" | "post" | "bio" | "title" | "desc">("all");
  const [copied, setCopied] = useState(false);

  // General text statistics
  const charCount = inputText.length;
  const charCountNoSpaces = inputText.replace(/\s/g, "").length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const lineCount = inputText ? inputText.split(/\r?\n/).length : 0;
  const hashtagsCount = (inputText.match(/#[\p{L}\p{N}_]+/gu) || []).length;
  const mentionsCount = (inputText.match(/@[\p{L}\p{N}_]+/gu) || []).length;
  const urlsCount = (inputText.match(/https?:\/\/[^\s]+/g) || []).length;

  // Filtered limits list
  const filteredPlatforms = useMemo(() => {
    if (filterCategory === "all") return PLATFORM_LIMITS;
    return PLATFORM_LIMITS.filter((p) => p.category === filterCategory);
  }, [filterCategory]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInputText(
      "🚀 Excited to introduce our new open-source Social Media Suite! 100% free, runs locally in your browser, and built for modern creators & devs. Check it out at https://quicktools.dev #webdev #indiehackers @quicktools"
    );
    setFilterCategory("all");
  };

  const handleClear = () => {
    setInputText("");
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-amber-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Multi-Platform Character Tracker:</strong> Test your social copy simultaneously across 10+ social network character limits. Computations run locally without transmitting your draft text to any external server.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Detailed Metrics */}
        <div className="lg:col-span-6 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Type className="w-5 h-5 text-primary" /> Draft Your Post
              </h2>
              <span className="text-xs font-mono font-bold text-gray-500">
                {charCount} characters
              </span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              placeholder="Paste or write your social copy here..."
              className="neo-input w-full p-3 text-sm leading-relaxed"
            />

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 border-t border-dark/10">
              <div className="p-2.5 bg-surface/50 neo-border rounded text-center">
                <span className="text-lg font-black font-mono block text-gray-900">{charCount}</span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Total Chars</span>
              </div>
              <div className="p-2.5 bg-surface/50 neo-border rounded text-center">
                <span className="text-lg font-black font-mono block text-gray-900">{charCountNoSpaces}</span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">No Spaces</span>
              </div>
              <div className="p-2.5 bg-surface/50 neo-border rounded text-center">
                <span className="text-lg font-black font-mono block text-gray-900">{wordCount}</span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Words</span>
              </div>
              <div className="p-2.5 bg-surface/50 neo-border rounded text-center">
                <span className="text-lg font-black font-mono block text-gray-900">{lineCount}</span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Lines</span>
              </div>
              <div className="p-2.5 bg-surface/50 neo-border rounded text-center">
                <span className="text-lg font-black font-mono block text-primary">{hashtagsCount}</span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Hashtags (#)</span>
              </div>
              <div className="p-2.5 bg-surface/50 neo-border rounded text-center">
                <span className="text-lg font-black font-mono block text-primary">{mentionsCount}</span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Mentions (@)</span>
              </div>
              <div className="p-2.5 bg-surface/50 neo-border rounded text-center col-span-2">
                <span className="text-lg font-black font-mono block text-primary">{urlsCount}</span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Links / URLs</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-dark/10">
              <button
                onClick={handleCopy}
                className="neo-btn text-xs px-4 py-2 bg-primary text-white font-bold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Post Text"}
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

        {/* Right Column: Platform Countdown Meters */}
        <div className="lg:col-span-6 space-y-4">
          <div className="neo-card p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-primary" /> Platform Progress Meters
              </h3>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "all", label: "All" },
                  { id: "post", label: "Posts" },
                  { id: "bio", label: "Bios" },
                  { id: "title", label: "Titles" },
                  { id: "desc", label: "Descs" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterCategory(f.id as never)}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded neo-border ${
                      filterCategory === f.id
                        ? "bg-primary text-white"
                        : "bg-surface hover:bg-surface/80 text-dark"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Platform Meters */}
            <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredPlatforms.map((platform) => {
                const remaining = platform.maxChars - charCount;
                const isOver = remaining < 0;
                const percent = Math.min(100, Math.round((charCount / platform.maxChars) * 100));

                let barColor = "bg-emerald-500";
                if (isOver) {
                  barColor = "bg-rose-500";
                } else if (percent > 85) {
                  barColor = "bg-amber-500";
                }

                return (
                  <div key={platform.id} className="p-3 bg-surface/30 neo-border rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">{platform.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold ${isOver ? "text-rose-600" : "text-gray-700"}`}>
                          {charCount} / {platform.maxChars}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-1.5 py-0.2 rounded neo-border ${
                            isOver
                              ? "bg-rose-100 text-rose-800"
                              : remaining < 20
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isOver ? `${Math.abs(remaining)} over` : `${remaining} left`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-150 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-secondary">
                      <span>{platform.description}</span>
                      {platform.maxHashtags && hashtagsCount > platform.maxHashtags && (
                        <span className="text-rose-600 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> &gt;{platform.maxHashtags} tags!
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
