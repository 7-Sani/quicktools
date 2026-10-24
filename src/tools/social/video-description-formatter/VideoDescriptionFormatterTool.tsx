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
  Clock,
  Link2,
  ShieldCheck,
  Eye,
} from "lucide-react";

export default function VideoDescriptionFormatterTool() {
  // Above the fold
  const [hook, setHook] = useState(
    "Learn how to build a full-stack SaaS application from scratch using Next.js 16, TypeScript, and Tailwind CSS. Complete source code included!"
  );

  // Timestamps / Chapters
  const [chaptersText, setChaptersText] = useState(
    "00:00 - Overview & Demo\n01:45 - Project Architecture\n05:12 - Setting up Next.js\n12:30 - Authentication Setup\n21:05 - Database Integration\n32:15 - Deployment & Launch"
  );

  // Links & Resources
  const [linksText, setLinksText] = useState(
    "🔗 Source Code: https://github.com/example/saas-starter\n🌐 Live Demo: https://quicktools.dev\n🐦 Follow on X: https://x.com/quicktools"
  );

  // Affiliate & Gear
  const [disclaimerText, setDisclaimerText] = useState(
    "Affiliate Disclosure: Some of the links above may be affiliate links. If you purchase through them, I may earn a small commission at no extra cost to you."
  );

  // Hashtags
  const [hashtags, setHashtags] = useState("#webdev #nextjs #fullstack #programming");

  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedChapters, setCopiedChapters] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  // Assembled full description
  const fullDescription = useMemo(() => {
    const parts = [
      hook.trim(),
      "\n⏱️ TIMESTAMPS / CHAPTERS:\n" + chaptersText.trim(),
      "\n🔗 LINKS & RESOURCES:\n" + linksText.trim(),
      "\n⚠️ DISCLAIMER:\n" + disclaimerText.trim(),
      "\n" + hashtags.trim(),
    ].filter(Boolean);

    return parts.join("\n\n");
  }, [hook, chaptersText, linksText, disclaimerText, hashtags]);

  // Timestamp Validator Logic
  const chapterValidation = useMemo(() => {
    const lines = chaptersText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return { valid: false, errors: ["No chapters entered."] };
    }

    const errors: string[] = [];
    const timestampRegex = /^(\d{1,2}:)?\d{2}:\d{2}/;

    // 1. YouTube requires first timestamp to be 00:00 or 0:00
    if (!lines[0].startsWith("00:00") && !lines[0].startsWith("0:00")) {
      errors.push("YouTube requires the first chapter to start at 00:00.");
    }

    // 2. Minimum 3 chapters for scrubber bar
    if (lines.length < 3) {
      errors.push("YouTube requires at least 3 chapters to enable scrubber markers.");
    }

    // 3. Time progression check
    let lastSeconds = -1;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(timestampRegex);
      if (!match) {
        errors.push(`Line ${i + 1} ("${lines[i]}") does not start with valid timestamp (MM:SS or HH:MM:SS).`);
        continue;
      }
      const parts = match[0].split(":").map(Number);
      let seconds = 0;
      if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
      }

      if (seconds <= lastSeconds && lastSeconds !== -1) {
        errors.push(`Timestamp "${match[0]}" at line ${i + 1} must be later than previous chapter.`);
      }
      lastSeconds = seconds;
    }

    return {
      valid: errors.length === 0,
      errors,
      count: lines.length,
    };
  }, [chaptersText]);

  const charLength = fullDescription.length;
  const isOverLimit = charLength > 5000;

  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullDescription);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyChapters = () => {
    navigator.clipboard.writeText(chaptersText);
    setCopiedChapters(true);
    setTimeout(() => setCopiedChapters(false), 2000);
  };

  const handleReset = () => {
    setHook(
      "Learn how to build a full-stack SaaS application from scratch using Next.js 16, TypeScript, and Tailwind CSS. Complete source code included!"
    );
    setChaptersText(
      "00:00 - Overview & Demo\n01:45 - Project Architecture\n05:12 - Setting up Next.js\n12:30 - Authentication Setup\n21:05 - Database Integration\n32:15 - Deployment & Launch"
    );
    setLinksText(
      "🔗 Source Code: https://github.com/example/saas-starter\n🌐 Live Demo: https://quicktools.dev\n🐦 Follow on X: https://x.com/quicktools"
    );
    setDisclaimerText(
      "Affiliate Disclosure: Some of the links above may be affiliate links. If you purchase through them, I may earn a small commission at no extra cost to you."
    );
    setHashtags("#webdev #nextjs #fullstack #programming");
  };

  const handleClear = () => {
    setHook("");
    setChaptersText("");
    setLinksText("");
    setDisclaimerText("");
    setHashtags("");
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="neo-card p-4 bg-amber-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>YouTube Description Formatter:</strong> Structures descriptions with above-the-fold hooks, validates chapter timestamp rules (such as mandatory 00:00 start for video scrubbing), and formats links. Purely client-side formatting without accessing YouTube creator accounts.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Structured Section Editors */}
        <div className="lg:col-span-7 space-y-6">
          <div className="neo-card p-6 bg-white space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-primary" /> Description Sections
              </h2>
              <span className={`text-xs font-mono font-bold ${isOverLimit ? "text-rose-600 font-black" : "text-gray-600"}`}>
                {charLength} / 5,000 Chars
              </span>
            </div>

            {/* Section 1: Above-the-fold Hook */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-text-secondary">
                  1. Above-The-Fold Hook (~150 Chars)
                </label>
                <span className="text-[11px] text-text-secondary font-mono">{hook.length} chars</span>
              </div>
              <textarea
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                rows={3}
                placeholder="Hook viewers before the '...more' button. Include key search terms and CTA..."
                className="neo-input w-full p-2.5 text-xs leading-relaxed"
              />
            </div>

            {/* Section 2: Timestamp Chapters */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-text-secondary flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" /> 2. Timestamps / Chapters
                </label>
                <span className="text-[11px] text-text-secondary font-mono">
                  {chapterValidation.count || 0} chapters
                </span>
              </div>
              <textarea
                value={chaptersText}
                onChange={(e) => setChaptersText(e.target.value)}
                rows={5}
                placeholder="00:00 - Introduction&#10;02:15 - Chapter Name"
                className="neo-input w-full p-2.5 text-xs font-mono leading-relaxed"
              />

              {/* Chapter validation alert */}
              <div className="mt-2 text-xs">
                {chapterValidation.valid ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Chapters valid: Meets YouTube requirements (starts at 00:00, chronological, ≥3 chapters).
                  </span>
                ) : (
                  <div className="p-2.5 bg-rose-50 neo-border rounded text-rose-800 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Chapter Formatting Warnings:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {chapterValidation.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Links & Socials */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-1 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-primary" /> 3. Important Links & Socials
              </label>
              <textarea
                value={linksText}
                onChange={(e) => setLinksText(e.target.value)}
                rows={3}
                placeholder="🔗 Links to repo, website, newsletter, socials..."
                className="neo-input w-full p-2.5 text-xs leading-relaxed"
              />
            </div>

            {/* Section 4: Affiliate / Gear Disclaimer */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> 4. FTC Affiliate / Gear Disclaimer
              </label>
              <textarea
                value={disclaimerText}
                onChange={(e) => setDisclaimerText(e.target.value)}
                rows={2}
                placeholder="Affiliate disclosure text..."
                className="neo-input w-full p-2.5 text-xs leading-relaxed"
              />
            </div>

            {/* Section 5: Hashtags */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                5. Top Video Hashtags (YouTube displays up to 3)
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#tag1 #tag2 #tag3"
                className="neo-input w-full p-2 text-xs font-mono"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-dark/10">
              <button
                onClick={handleCopyAll}
                className="neo-btn text-xs px-4 py-2 bg-primary text-white font-bold flex items-center gap-1.5"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAll ? "Copied All!" : "Copy Full Description"}
              </button>
              <button
                onClick={handleCopyChapters}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                {copiedChapters ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedChapters ? "Copied Chapters!" : "Copy Chapters Only"}
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

        {/* Right Column: YouTube Live Description Box Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-primary" /> YouTube Video Player Box
              </h3>
              <button
                onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                className="text-xs font-bold text-primary hover:underline"
              >
                {isPreviewExpanded ? "Show Collapsed" : "Show Expanded"}
              </button>
            </div>

            {/* Simulated YouTube description drawer */}
            <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 text-xs text-gray-800 leading-relaxed font-sans">
              <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <span>182K views</span>
                <span>•</span>
                <span>Premiered 3 days ago</span>
                <span className="text-blue-600 font-normal">{hashtags.split(" ").slice(0, 3).join(" ")}</span>
              </div>

              {/* Collapsed state */}
              {!isPreviewExpanded ? (
                <div>
                  <p className="line-clamp-2 text-gray-800">
                    {hook || "Description text hook goes here."}
                  </p>
                  <button
                    onClick={() => setIsPreviewExpanded(true)}
                    className="text-gray-900 font-bold hover:underline mt-1 block"
                  >
                    ...more
                  </button>
                </div>
              ) : (
                /* Expanded state */
                <div className="space-y-3 pt-1">
                  <pre className="whitespace-pre-wrap font-sans text-xs text-gray-800 leading-relaxed max-h-96 overflow-y-auto">
                    {fullDescription}
                  </pre>
                  <button
                    onClick={() => setIsPreviewExpanded(false)}
                    className="text-gray-900 font-bold hover:underline block pt-2 border-t border-gray-200"
                  >
                    Show less
                  </button>
                </div>
              )}
            </div>

            {/* Specs notice */}
            <div className="p-3 bg-surface/50 neo-border rounded text-[11px] text-text-secondary space-y-1">
              <span className="font-bold block text-gray-800">YouTube Description Rules:</span>
              <p>• Max 5,000 characters total across all lines.</p>
              <p>• Only the first 3 hashtags in the description are indexed above the title.</p>
              <p>• Always put 00:00 as the first chapter or video markers will fail to display.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
