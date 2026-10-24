"use client";

import { useState, useMemo } from "react";
import {
  Hash,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Sparkles,
  Shuffle,
  AlertTriangle,
  Info,
  CheckCircle2,
  ListFilter,
} from "lucide-react";
import {
  cleanAndFormatHashtags,
  HashtagSortOption,
  HashtagCaseOption,
} from "@/lib/socialUtils";

export default function HashtagOrganizerTool() {
  const [inputText, setInputText] = useState<string>(
    "#socialmedia marketing #digitalmarketing #contentcreator #SocialMedia #seo branding #marketingtips, entrepreneur, growth"
  );
  const [sortOption, setSortOption] = useState<HashtagSortOption>("original");
  const [caseOption, setCaseOption] = useState<HashtagCaseOption>("pascal");
  const [delimiter, setDelimiter] = useState<"space" | "newline" | "comma">("space");
  const [copied, setCopied] = useState(false);

  // Niche Presets
  const PRESET_BUNDLES = [
    {
      name: "Tech & Dev",
      tags: "#webdev #coding #javascript #reactjs #programming #frontend #developer #typescript #tech",
    },
    {
      name: "Digital Marketing",
      tags: "#digitalmarketing #socialmediamarketing #contentcreator #marketingstrategy #seo #branding #growthhacking #smallbusiness",
    },
    {
      name: "Photography",
      tags: "#photography #photooftheday #naturephotography #portraitphotography #streetphotography #visuals #photographer #art",
    },
    {
      name: "Fitness & Health",
      tags: "#fitness #workout #gymmotivation #healthylifestyle #fitnessjourney #training #wellness #fitfam #nutrition",
    },
    {
      name: "Travel",
      tags: "#travel #wanderlust #travelphotography #explore #adventure #travelgram #vacation #beautifuldestinations",
    },
  ];

  const { tags, count, duplicatesRemoved } = useMemo(() => {
    return cleanAndFormatHashtags(inputText, sortOption, caseOption);
  }, [inputText, sortOption, caseOption]);

  const outputString = useMemo(() => {
    if (delimiter === "space") return tags.join(" ");
    if (delimiter === "newline") return tags.join("\n");
    if (delimiter === "comma") return tags.join(", ");
    return tags.join(" ");
  }, [tags, delimiter]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText("");
  };

  const handleReset = () => {
    setInputText(
      "#socialmedia marketing #digitalmarketing #contentcreator #SocialMedia #seo branding #marketingtips, entrepreneur, growth"
    );
    setSortOption("original");
    setCaseOption("pascal");
    setDelimiter("space");
  };

  const handleShuffle = () => {
    const shuffled = [...tags].sort(() => Math.random() - 0.5);
    setInputText(shuffled.join(" "));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const remaining = tags.filter((t) => t !== tagToRemove);
    setInputText(remaining.join(" "));
  };

  // Status checks
  const isInstagramOverLimit = count > 30;

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-amber-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Local Formatting Tool:</strong> Clean and format hashtags directly in your browser. Deduplication, casing normalization, and limit tracking are calculated offline without accessing third-party account data or scraping Instagram/X APIs.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Preset Selector */}
        <div className="lg:col-span-6 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" /> Input Hashtags or Text
              </h2>
              <span className="text-xs text-text-secondary font-bold">
                {duplicatesRemoved > 0 && (
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded neo-border">
                    {duplicatesRemoved} duplicates removed
                  </span>
                )}
              </span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              placeholder="Paste hashtags, lists, or raw text separated by spaces, commas, or returns..."
              className="neo-input w-full p-3 text-sm font-mono"
            />

            {/* Presets */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-2">
                Popular Niche Presets:
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_BUNDLES.map((bundle) => (
                  <button
                    key={bundle.name}
                    onClick={() => setInputText(bundle.tags)}
                    className="neo-btn text-xs px-2.5 py-1 bg-surface hover:bg-amber-100 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" /> {bundle.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Formatting Controls */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dark/10">
              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Casing Style:
                </label>
                <select
                  value={caseOption}
                  onChange={(e) => setCaseOption(e.target.value as HashtagCaseOption)}
                  className="neo-input w-full p-2 text-xs"
                >
                  <option value="pascal">PascalCase (#WebDesign)</option>
                  <option value="lowercase">lowercase (#webdesign)</option>
                  <option value="uppercase">UPPERCASE (#WEBDESIGN)</option>
                  <option value="preserve">Preserve Original</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Sorting Order:
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as HashtagSortOption)}
                  className="neo-input w-full p-2 text-xs"
                >
                  <option value="original">Original Order</option>
                  <option value="alpha">Alphabetical (A → Z)</option>
                  <option value="length">Length (Short → Long)</option>
                  <option value="reverse">Reverse Order</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={handleShuffle}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1"
              >
                <Shuffle className="w-3.5 h-3.5" /> Shuffle
              </button>
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                onClick={handleClear}
                className="neo-btn text-xs px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output & Platform Counters */}
        <div className="lg:col-span-6 space-y-6">
          {/* Platform Limits Monitor */}
          <div className="neo-card p-5 bg-white space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-primary" /> Platform Limit Trackers
            </h3>

            {/* Instagram Tracker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Instagram (Max 30 Tags)</span>
                <span className={isInstagramOverLimit ? "text-rose-600 font-black" : "text-gray-700"}>
                  {count} / 30 tags
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 neo-border rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isInstagramOverLimit
                      ? "bg-rose-500"
                      : count >= 25
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (count / 30) * 100)}%` }}
                />
              </div>
              {isInstagramOverLimit && (
                <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Exceeds Instagram limit by {count - 30} tags!
                </p>
              )}
            </div>

            {/* Twitter & LinkedIn Guidance */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
              <div className="p-2.5 bg-surface/50 neo-border rounded">
                <span className="font-bold block text-gray-900">X (Twitter) Best Practice</span>
                <span className="text-text-secondary text-[11px]">
                  Optimal: 1–3 tags. Current: {count} {count > 5 ? "⚠️ High" : "✅ Good"}
                </span>
              </div>
              <div className="p-2.5 bg-surface/50 neo-border rounded">
                <span className="font-bold block text-gray-900">LinkedIn Best Practice</span>
                <span className="text-text-secondary text-[11px]">
                  Optimal: 3–5 tags. Current: {count} {count > 5 ? "⚠️ High" : "✅ Good"}
                </span>
              </div>
            </div>
          </div>

          {/* Cleaned Hashtags Output Card */}
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tight">
                Organized Tags ({count})
              </h3>
              {/* Delimiter toggle */}
              <div className="flex gap-1 bg-surface p-1 neo-border rounded">
                <button
                  onClick={() => setDelimiter("space")}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${
                    delimiter === "space" ? "bg-white neo-border text-dark" : "text-text-secondary"
                  }`}
                >
                  Space
                </button>
                <button
                  onClick={() => setDelimiter("newline")}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${
                    delimiter === "newline" ? "bg-white neo-border text-dark" : "text-text-secondary"
                  }`}
                >
                  Lines
                </button>
                <button
                  onClick={() => setDelimiter("comma")}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${
                    delimiter === "comma" ? "bg-white neo-border text-dark" : "text-text-secondary"
                  }`}
                >
                  Comma
                </button>
              </div>
            </div>

            {/* Output preview */}
            <textarea
              readOnly
              value={outputString}
              rows={4}
              placeholder="No tags generated yet..."
              className="neo-input w-full p-3 text-sm font-mono bg-surface/30"
            />

            {/* Interactive tag pills */}
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-surface/40 neo-border rounded-lg">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-white neo-border rounded hover:bg-rose-50 transition-colors group cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                  title="Click to remove tag"
                >
                  <span>{tag}</span>
                  <span className="text-gray-400 group-hover:text-rose-600 text-[10px]">×</span>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-text-secondary italic">No valid tags to display</span>
              )}
            </div>

            {/* Copy button */}
            <div className="pt-2">
              <button
                onClick={handleCopy}
                disabled={tags.length === 0}
                className="neo-btn w-full py-2.5 bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied to Clipboard!" : "Copy All Hashtags"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
