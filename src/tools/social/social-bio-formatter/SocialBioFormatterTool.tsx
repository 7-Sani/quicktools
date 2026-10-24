"use client";

import { useState, useMemo } from "react";
import {
  UserCheck,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Sparkles,
  Info,
  Type,
  AlertTriangle,
  Smartphone,
  Eye,
} from "lucide-react";
import {
  convertToUnicodeFont,
  UNICODE_STYLES,
  UnicodeStyleKey,
} from "@/lib/socialUtils";

export default function SocialBioFormatterTool() {
  const [bioText, setBioText] = useState<string>(
    "✨ Senior Frontend Engineer & Indie Maker\n📍 San Francisco, CA\n🚀 Building modern open-source web tools\n👇 Check out my latest launch below!"
  );

  const [selectedStyle, setSelectedStyle] = useState<UnicodeStyleKey>("normal");
  const [previewPlatform, setPreviewPlatform] = useState<"instagram" | "twitter" | "tiktok">("instagram");
  const [copied, setCopied] = useState(false);

  // Quick Emoji / Bullet Helper
  const QUICK_CHARS = ["✨", "🚀", "📍", "👇", "💼", "✉️", "🔗", "💡", "⚡", "🎯", "•", "—", "★"];

  // Applied bio text
  const transformedBio = useMemo(() => {
    return convertToUnicodeFont(bioText, selectedStyle);
  }, [bioText, selectedStyle]);

  const charLength = transformedBio.length;
  const lineCount = bioText.split(/\r?\n/).length;

  // Platform limits
  const LIMITS = {
    instagram: 150,
    twitter: 160,
    tiktok: 80,
    linkedin: 220,
    threads: 150,
  };

  const handleInsertChar = (char: string) => {
    setBioText((prev) => prev + char);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transformedBio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setBioText(
      "✨ Senior Frontend Engineer & Indie Maker\n📍 San Francisco, CA\n🚀 Building modern open-source web tools\n👇 Check out my latest launch below!"
    );
    setSelectedStyle("normal");
    setPreviewPlatform("instagram");
  };

  const handleClear = () => {
    setBioText("");
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="neo-card p-4 bg-amber-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Bio Formatter:</strong> Formats bios with custom Unicode fonts, line spacing, and checks character limits for Instagram, X, TikTok, and LinkedIn. Operates entirely locally without accessing private account APIs.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Editor & Font Toolbar */}
        <div className="lg:col-span-7 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" /> Edit Your Bio
              </h2>
              <span className="text-xs text-text-secondary font-mono font-bold">
                {charLength} chars • {lineCount} lines
              </span>
            </div>

            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              rows={6}
              placeholder="Write your bio with clean bullet points and line breaks..."
              className="neo-input w-full p-3 text-sm leading-relaxed"
            />

            {/* Quick Symbol / Emoji Toolbar */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-1.5">
                Quick Insert Symbols & Emojis:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHARS.map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleInsertChar(char + " ")}
                    className="w-8 h-8 flex items-center justify-center text-sm bg-surface hover:bg-amber-100 neo-border rounded transition-colors"
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            {/* Unicode Font Converter */}
            <div className="space-y-2 pt-3 border-t border-dark/10">
              <label className="text-xs font-bold uppercase text-text-secondary flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-primary" /> Unicode Font Style:
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
                {copied ? "Copied Bio!" : "Copy Formatted Bio"}
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

        {/* Right Column: Platform Limits & Profile Card Mockups */}
        <div className="lg:col-span-5 space-y-6">
          {/* Platform Countdown Bars */}
          <div className="neo-card p-5 bg-white space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Platform Bio Limits
            </h3>

            {/* Instagram (150) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Instagram Bio</span>
                <span className={charLength > LIMITS.instagram ? "text-rose-600 font-mono" : "text-gray-700 font-mono"}>
                  {charLength} / {LIMITS.instagram}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 neo-border rounded-full overflow-hidden">
                <div
                  className={`h-full ${charLength > LIMITS.instagram ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, (charLength / LIMITS.instagram) * 100)}%` }}
                />
              </div>
            </div>

            {/* X / Twitter (160) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>X (Twitter) Bio</span>
                <span className={charLength > LIMITS.twitter ? "text-rose-600 font-mono" : "text-gray-700 font-mono"}>
                  {charLength} / {LIMITS.twitter}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 neo-border rounded-full overflow-hidden">
                <div
                  className={`h-full ${charLength > LIMITS.twitter ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, (charLength / LIMITS.twitter) * 100)}%` }}
                />
              </div>
            </div>

            {/* TikTok (80) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>TikTok Bio</span>
                <span className={charLength > LIMITS.tiktok ? "text-rose-600 font-mono" : "text-gray-700 font-mono"}>
                  {charLength} / {LIMITS.tiktok}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 neo-border rounded-full overflow-hidden">
                <div
                  className={`h-full ${charLength > LIMITS.tiktok ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, (charLength / LIMITS.tiktok) * 100)}%` }}
                />
              </div>
            </div>

            {/* LinkedIn Headline (220) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>LinkedIn Headline</span>
                <span className={charLength > LIMITS.linkedin ? "text-rose-600 font-mono" : "text-gray-700 font-mono"}>
                  {charLength} / {LIMITS.linkedin}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 neo-border rounded-full overflow-hidden">
                <div
                  className={`h-full ${charLength > LIMITS.linkedin ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, (charLength / LIMITS.linkedin) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Profile Card Mockup */}
          <div className="neo-card p-5 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-primary" /> Profile Preview
              </h3>
              <div className="flex gap-1 bg-surface p-1 neo-border rounded">
                <button
                  onClick={() => setPreviewPlatform("instagram")}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${
                    previewPlatform === "instagram" ? "bg-white neo-border text-dark" : "text-text-secondary"
                  }`}
                >
                  Instagram
                </button>
                <button
                  onClick={() => setPreviewPlatform("twitter")}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${
                    previewPlatform === "twitter" ? "bg-white neo-border text-dark" : "text-text-secondary"
                  }`}
                >
                  X (Twitter)
                </button>
                <button
                  onClick={() => setPreviewPlatform("tiktok")}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${
                    previewPlatform === "tiktok" ? "bg-white neo-border text-dark" : "text-text-secondary"
                  }`}
                >
                  TikTok
                </button>
              </div>
            </div>

            {/* Instagram Profile Box */}
            {previewPlatform === "instagram" && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-gray-800">
                      U
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">your_username</h4>
                    <span className="text-xs text-gray-500">Creator Profile</span>
                  </div>
                </div>
                <div className="text-xs leading-relaxed text-gray-800 whitespace-pre-wrap font-sans">
                  {transformedBio || "Your formatted bio will appear here."}
                </div>
                <div className="text-xs text-blue-600 font-semibold truncate flex items-center gap-1">
                  🔗 quicktools.dev
                </div>
              </div>
            )}

            {/* X (Twitter) Profile Box */}
            {previewPlatform === "twitter" && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-black text-white font-bold flex items-center justify-center text-sm">
                    X
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Your Name</h4>
                    <span className="text-xs text-gray-500">@handle</span>
                  </div>
                </div>
                <div className="text-xs leading-relaxed text-gray-800 whitespace-pre-wrap font-sans">
                  {transformedBio || "Your formatted bio will appear here."}
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-3 pt-1">
                  <span>📍 Internet</span>
                  <span className="text-blue-500">🔗 quicktools.dev</span>
                  <span>🗓 Joined October 2026</span>
                </div>
              </div>
            )}

            {/* TikTok Profile Box */}
            {previewPlatform === "tiktok" && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-rose-500 p-0.5">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-gray-800 text-lg">
                    T
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">@creativetitok</h4>
                  <span className="text-xs text-gray-500">Creator</span>
                </div>
                <div className="text-xs leading-relaxed text-gray-800 whitespace-pre-wrap font-sans px-2">
                  {transformedBio || "Your formatted bio will appear here."}
                </div>
                {charLength > 80 && (
                  <p className="text-[10px] text-rose-600 font-bold flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Exceeds TikTok 80-char limit!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
