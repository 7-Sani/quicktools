"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Code,
  Sparkles,
} from "lucide-react";

export default function ImageAltTextChecklistTool() {
  const [altText, setAltText] = useState<string>(
    "Software engineer reviewing code on a multi-monitor workstation in a sunlit office."
  );
  const [imageType, setImageType] = useState<"informative" | "decorative" | "functional" | "complex">("informative");
  const [copied, setCopied] = useState(false);

  // Quality checks
  const lowerAlt = altText.toLowerCase().trim();

  // 1. Redundant words check
  const redundantPhrases = ["image of", "picture of", "photo of", "graphic of", "icon of", "logo of"];
  const matchedRedundant = redundantPhrases.filter((p) => lowerAlt.startsWith(p) || lowerAlt.includes(` ${p} `));

  // 2. Filename check
  const hasFilename = /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(lowerAlt) || /image\d+/i.test(lowerAlt) || /screenshot/i.test(lowerAlt);

  // 3. Length checks
  const charLength = altText.length;
  const isOverlyLong = charLength > 125;
  const isTooShort = charLength > 0 && charLength < 5 && imageType !== "decorative";
  const hasPeriodEnding = altText.trim().endsWith(".") || altText.trim().endsWith("!") || altText.trim().endsWith("?");

  // Snippet generator
  const generatedCode = (() => {
    switch (imageType) {
      case "decorative":
        return `<img src="/images/accent-shape.png" alt="" aria-hidden="true" />`;
      case "functional":
        return `<button aria-label="Search documentation">\n  <img src="/icons/search.svg" alt="" />\n</button>`;
      case "complex":
        return `<figure>\n  <img src="/charts/sales-growth.png" alt="${altText}" aria-describedby="chart-data" />\n  <figcaption id="chart-data">\n    Full table data accessible below.\n  </figcaption>\n</figure>`;
      default:
        return `<img src="/images/workplace.jpg" alt="${altText.replace(/"/g, "&quot;")}" />`;
    }
  })();

  const handleReset = () => {
    setAltText("Software engineer reviewing code on a multi-monitor workstation in a sunlit office.");
    setImageType("informative");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-teal-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <strong>WCAG 1.1.1 Non-Text Content:</strong> Screen readers announce image tags automatically (e.g. <em>&quot;Graphic, ...&quot;</em>). High quality alt text provides equivalent meaning without redundant filler phrases.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Image Category & Alt Text Drafter */}
        <div className="lg:col-span-7 space-y-6">
          <div className="neo-card p-6 bg-white space-y-5">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> Alt Text Inspector
            </h2>

            {/* Image Category Selector */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-1.5">
                Image Purpose Category:
              </label>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  { id: "informative", label: "Informative (Adds Content)", desc: "Conveys real information or context" },
                  { id: "decorative", label: "Decorative (Visual Flair Only)", desc: "Backgrounds, dividers, ambient shapes" },
                  { id: "functional", label: "Functional (Button / Link)", desc: "Triggers actions or navigates" },
                  { id: "complex", label: "Complex (Chart / Graph)", desc: "Requires detailed data tables" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setImageType(t.id as never)}
                    className={`p-2.5 rounded-lg neo-border text-left transition-all ${
                      imageType === t.id
                        ? "bg-primary text-white"
                        : "bg-surface/50 hover:bg-surface text-gray-900"
                    }`}
                  >
                    <span className="font-bold text-xs block">{t.label}</span>
                    <span className={`text-[10px] ${imageType === t.id ? "text-white/80" : "text-text-secondary"}`}>
                      {t.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Draft */}
            {imageType !== "decorative" ? (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase text-text-secondary">
                    Draft Image Alt Text:
                  </label>
                  <span className={`text-xs font-mono font-bold ${isOverlyLong ? "text-rose-600" : "text-gray-500"}`}>
                    {charLength} / 125 chars recommended
                  </span>
                </div>
                <textarea
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  rows={4}
                  placeholder="Describe the image content and purpose concisely..."
                  className="neo-input w-full p-3 text-sm leading-relaxed"
                />
              </div>
            ) : (
              <div className="p-4 bg-amber-50 neo-border rounded-lg text-xs text-amber-950 space-y-1">
                <span className="font-bold block">Decorative Image Rule:</span>
                <p>
                  Decorative images must have an empty <code>alt=&quot;&quot;</code> attribute. Omitting the <code>alt</code> attribute entirely causes screen readers to read the raw file URL!
                </p>
              </div>
            )}

            {/* Real-time Quality Checks */}
            {imageType !== "decorative" && (
              <div className="p-4 bg-surface/40 neo-border rounded-lg space-y-2 text-xs">
                <span className="font-black uppercase tracking-wider text-text-secondary block text-[11px]">
                  Quality Diagnostics
                </span>

                {/* Redundant check */}
                <div className="flex items-center justify-between">
                  <span>Redundant Phrases (&quot;image of&quot;, &quot;photo of&quot;):</span>
                  <span className={`font-bold flex items-center gap-1 ${matchedRedundant.length === 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {matchedRedundant.length === 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {matchedRedundant.length === 0 ? "Pass (No redundancy)" : `Found "${matchedRedundant.join(", ")}"`}
                  </span>
                </div>

                {/* Filename check */}
                <div className="flex items-center justify-between">
                  <span>Filename Placeholder Detection:</span>
                  <span className={`font-bold flex items-center gap-1 ${!hasFilename ? "text-emerald-700" : "text-rose-600"}`}>
                    {!hasFilename ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {!hasFilename ? "Pass (Human descriptive)" : "Warning: Looks like raw filename"}
                  </span>
                </div>

                {/* Length check */}
                <div className="flex items-center justify-between">
                  <span>Length Guidance (Under 125 chars):</span>
                  <span className={`font-bold flex items-center gap-1 ${!isOverlyLong && !isTooShort ? "text-emerald-700" : "text-amber-700"}`}>
                    {!isOverlyLong && !isTooShort ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {isOverlyLong ? "Long (Consider summarizing)" : isTooShort ? "Too short" : "Concise (Pass)"}
                  </span>
                </div>

                {/* Sentence ending check */}
                <div className="flex items-center justify-between">
                  <span>Ends with Punctuation (.):</span>
                  <span className={`font-bold flex items-center gap-1 ${hasPeriodEnding ? "text-emerald-700" : "text-text-secondary"}`}>
                    {hasPeriodEnding ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                    {hasPeriodEnding ? "Yes (Screen reader will pause)" : "Recommended to end with period"}
                  </span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2 pt-2 border-t border-dark/10">
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-1.5 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Default
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Code Generator & Checklist Guide */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Code className="w-4 h-4 text-primary" /> Generated HTML Element
            </h3>

            <pre className="p-3 bg-dark text-white rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
              {generatedCode}
            </pre>

            <button
              onClick={handleCopyCode}
              className="neo-btn w-full py-2 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied HTML Code!" : "Copy HTML Code"}
            </button>

            {/* Quick Checklist Rules */}
            <div className="p-4 bg-surface/30 neo-border rounded-lg space-y-2 text-xs">
              <span className="font-bold text-gray-800 uppercase text-[11px] block">
                WCAG Image Alt Checklist
              </span>
              <ul className="space-y-1.5 text-text-secondary list-disc pl-4 leading-relaxed text-[11px]">
                <li>Never write &quot;image of&quot; or &quot;graphic of&quot; — screen readers already announce the element type.</li>
                <li>For icons inside links/buttons, put the label on the button or link (e.g. <code>aria-label=&quot;Close&quot;</code>) and use <code>alt=&quot;&quot;</code> on the SVG/PNG.</li>
                <li>For charts and infographics, provide a brief summary in the alt attribute and link to a full table.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
