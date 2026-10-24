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
  Sliders,
  Type,
  Eye,
} from "lucide-react";
import {
  formatCaptionLineBreaks,
  convertToUnicodeFont,
  UNICODE_STYLES,
  UnicodeStyleKey,
  SpacingMethod,
} from "@/lib/socialUtils";

export default function CaptionFormatterTool() {
  const [captionText, setCaptionText] = useState<string>(
    "🚀 3 Game-Changing Tools for Creators\n\nStop wasting hours formatting social posts manually.\n\nHere are 3 tools that will 10x your content workflow:\n1. QuickTools Social Suite\n2. AI Thumbnail Previewer\n3. UTM Campaign Generator\n\nWhich one are you testing first?\n\n#contentcreation #creatorgrowth #socialmediatips"
  );

  const [spacingMethod, setSpacingMethod] = useState<SpacingMethod>("invisible");
  const [selectedStyle, setSelectedStyle] = useState<UnicodeStyleKey>("normal");
  const [copied, setCopied] = useState(false);

  // Formatted output
  const formattedOutput = useMemo(() => {
    // 1. Convert font style
    const styled = convertToUnicodeFont(captionText, selectedStyle);
    // 2. Format line breaks with spacer character
    return formatCaptionLineBreaks(styled, spacingMethod);
  }, [captionText, selectedStyle, spacingMethod]);

  // Statistics
  const charCount = formattedOutput.length;
  const wordCount = captionText.trim() ? captionText.trim().split(/\s+/).length : 0;
  const lineCount = captionText.split(/\r?\n/).length;
  const hashtagCount = (captionText.match(/#[\p{L}\p{N}_]+/gu) || []).length;
  const mentionCount = (captionText.match(/@[\p{L}\p{N}_]+/gu) || []).length;

  // First 125 characters (Instagram above-the-fold cutoff)
  const instagramPreview = captionText.slice(0, 125);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setCaptionText("");
  };

  const handleReset = () => {
    setCaptionText(
      "🚀 3 Game-Changing Tools for Creators\n\nStop wasting hours formatting social posts manually.\n\nHere are 3 tools that will 10x your content workflow:\n1. QuickTools Social Suite\n2. AI Thumbnail Previewer\n3. UTM Campaign Generator\n\nWhich one are you testing first?\n\n#contentcreation #creatorgrowth #socialmediatips"
    );
    setSpacingMethod("invisible");
    setSelectedStyle("normal");
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="neo-card p-4 bg-amber-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Local Formatting Tool:</strong> Fixes Instagram, TikTok, and LinkedIn caption line collapsing by inserting invisible whitespace spacers into empty lines. Processes locally in your browser.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Input & Style Tools */}
        <div className="lg:col-span-7 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Edit Caption
              </h2>
              <span className="text-xs text-text-secondary font-mono font-bold">
                {charCount} characters
              </span>
            </div>

            <textarea
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              rows={10}
              placeholder="Type or paste your caption here with blank lines between paragraphs..."
              className="neo-input w-full p-3 text-sm leading-relaxed"
            />

            {/* Line Spacing Mode */}
            <div className="space-y-2 pt-2 border-t border-dark/10">
              <label className="text-xs font-bold uppercase text-text-secondary flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" /> Blank Line Preservation Method:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "invisible", label: "Invisible Spacer (Recommended)" },
                  { id: "bullet", label: "Bullet Point (•)" },
                  { id: "dot", label: "Clean Dot (.)" },
                  { id: "dash", label: "Em Dash (—)" },
                  { id: "tilde", label: "Tilde (~)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSpacingMethod(item.id as SpacingMethod)}
                    className={`p-2 text-xs font-bold rounded neo-border text-left transition-all ${
                      spacingMethod === item.id
                        ? "bg-primary text-white"
                        : "bg-surface hover:bg-gray-100 text-dark"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Unicode Font Converter */}
            <div className="space-y-2 pt-3 border-t border-dark/10">
              <label className="text-xs font-bold uppercase text-text-secondary flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-primary" /> Unicode Font Style Converter:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {UNICODE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2 text-xs rounded neo-border text-center transition-all ${
                      selectedStyle === style.id
                        ? "bg-dark text-white font-bold"
                        : "bg-white hover:bg-surface text-gray-800"
                    }`}
                  >
                    <div className="text-[11px] truncate">{style.sample}</div>
                    <div className="text-[10px] opacity-70 truncate">{style.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-dark/10">
              <button
                onClick={handleCopy}
                className="neo-btn text-xs px-4 py-2 bg-primary text-white font-bold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied Formatted Caption!" : "Copy Formatted Caption"}
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

        {/* Right Column: Statistics & Feed Previews */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Metrics */}
          <div className="neo-card p-5 bg-white space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Caption Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-surface/50 neo-border rounded-lg">
                <span className="text-2xl font-black font-mono text-gray-900 block">
                  {charCount}
                </span>
                <span className="text-[11px] uppercase font-bold text-text-secondary">
                  Characters
                </span>
              </div>
              <div className="p-3 bg-surface/50 neo-border rounded-lg">
                <span className="text-2xl font-black font-mono text-gray-900 block">
                  {wordCount}
                </span>
                <span className="text-[11px] uppercase font-bold text-text-secondary">
                  Words
                </span>
              </div>
              <div className="p-2.5 bg-surface/30 neo-border rounded">
                <span className="text-sm font-black font-mono text-gray-800">{lineCount}</span>
                <span className="text-[10px] uppercase font-bold text-text-secondary block">
                  Total Lines
                </span>
              </div>
              <div className="p-2.5 bg-surface/30 neo-border rounded">
                <span className="text-sm font-black font-mono text-gray-800">{hashtagCount}</span>
                <span className="text-[10px] uppercase font-bold text-text-secondary block">
                  Hashtags
                </span>
              </div>
            </div>
          </div>

          {/* Instagram Feed Above-The-Fold Cutoff Simulator */}
          <div className="neo-card p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-primary" /> Instagram Cutoff Preview (~125 chars)
              </h3>
            </div>
            <p className="text-[11px] text-text-secondary">
              Instagram clips captions after ~125 characters in the home feed. Hook readers before the &quot;...more&quot; link!
            </p>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs leading-relaxed text-gray-800">
              <span className="font-bold mr-1.5">your_brand</span>
              <span>{instagramPreview}</span>
              {captionText.length > 125 && (
                <span className="text-gray-400 font-bold ml-1 cursor-pointer">... more</span>
              )}
            </div>
          </div>

          {/* Formatted Text Preview */}
          <div className="neo-card p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
                Ready-to-Paste Output
              </h3>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Ready for Instagram & TikTok
              </span>
            </div>

            <pre className="p-3 bg-surface/30 neo-border rounded-lg text-xs font-sans whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
              {formattedOutput || "(Empty caption)"}
            </pre>

            <button
              onClick={handleCopy}
              className="neo-btn w-full py-2 bg-dark text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Formatted Output"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
