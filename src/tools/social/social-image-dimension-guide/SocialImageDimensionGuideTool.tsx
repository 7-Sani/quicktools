"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Info,
  Maximize2,
  Filter,
} from "lucide-react";
import { SOCIAL_IMAGE_DIMENSIONS, DimensionEntry } from "@/lib/socialUtils";

export default function SocialImageDimensionGuideTool() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom dimension checker state
  const [customWidth, setCustomWidth] = useState<number>(1080);
  const [customHeight, setCustomHeight] = useState<number>(1080);

  const PLATFORMS = ["All", "Instagram", "YouTube", "X (Twitter)", "LinkedIn", "TikTok", "Facebook", "Pinterest"];

  const filteredEntries = useMemo(() => {
    return SOCIAL_IMAGE_DIMENSIONS.filter((item) => {
      const matchesPlatform = selectedPlatform === "All" || item.platform === selectedPlatform;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.assetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.aspectRatio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [selectedPlatform, searchQuery]);

  const handleCopy = (entry: DimensionEntry, id: string) => {
    const text = `${entry.platform} - ${entry.assetType}: ${entry.width} x ${entry.height} px (${entry.aspectRatio}) | Max size: ${entry.maxFileSize}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyDimensionsOnly = (entry: DimensionEntry, id: string) => {
    navigator.clipboard.writeText(`${entry.width}x${entry.height}`);
    setCopiedId(id + "-dim");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setSelectedPlatform("All");
    setSearchQuery("");
    setCustomWidth(1080);
    setCustomHeight(1080);
  };

  // Custom ratio calculation
  const customRatio = customHeight > 0 ? (customWidth / customHeight).toFixed(2) : "0";

  return (
    <div className="space-y-6">
      {/* Disclaimer Alert */}
      <div className="neo-card p-4 bg-amber-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Reference Information Notice:</strong> Supported image dimensions and aspect ratios provided below are curated reference guidelines and best practices, not guarantees of acceptance by third-party platforms. Social networks regularly update compression algorithms, mobile viewport layouts, and crop behaviors without notice.
        </div>
      </div>

      {/* Top Filter and Search Bar */}
      <div className="neo-card p-5 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by format, asset type, ratio (e.g. story, banner, 16:9)..."
              className="neo-input w-full pl-9 pr-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="neo-btn text-xs px-3 py-2 bg-surface flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        </div>

        {/* Platform filter tabs */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-dark/10">
          <span className="text-xs font-bold uppercase text-text-secondary flex items-center gap-1 mr-2 self-center">
            <Filter className="w-3.5 h-3.5" /> Platform:
          </span>
          {PLATFORMS.map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`px-3 py-1 text-xs font-bold rounded neo-border transition-all ${
                selectedPlatform === plat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface hover:bg-surface/80 text-dark"
              }`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Dimension Ratio Inspector */}
      <div className="neo-card p-5 bg-surface/50 border border-dark/20 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-primary" /> Custom Aspect Ratio & Fit Inspector
        </h3>
        <p className="text-xs text-text-secondary">
          Enter your current graphic dimensions to check its aspect ratio and see how it compares to standard platform templates.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold">Width:</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(Math.max(1, parseInt(e.target.value) || 0))}
              className="neo-input w-24 p-1.5 text-xs text-center font-mono"
            />
            <span className="text-xs text-text-secondary">px</span>
          </div>

          <span className="text-text-secondary font-bold">×</span>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold">Height:</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(Math.max(1, parseInt(e.target.value) || 0))}
              className="neo-input w-24 p-1.5 text-xs text-center font-mono"
            />
            <span className="text-xs text-text-secondary">px</span>
          </div>

          <div className="bg-white neo-border px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-2">
            <span>Ratio: {customRatio}:1</span>
            <span className="text-text-secondary font-normal">
              ({customRatio === "1.00"
                ? "Square 1:1"
                : customRatio === "1.78"
                ? "Landscape 16:9"
                : customRatio === "0.56"
                ? "Vertical 9:16"
                : customRatio === "0.80"
                ? "Portrait 4:5"
                : "Custom"})
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Dimension Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntries.map((item, index) => {
          const cardId = `${item.platform}-${item.assetType}-${index}`;
          const isCopied = copiedId === cardId;
          const isCopiedDim = copiedId === cardId + "-dim";

          // Calculate aspect ratio for visualizer box
          const boxRatio = item.width / item.height;

          return (
            <div
              key={cardId}
              className="neo-card p-5 bg-white flex flex-col justify-between hover:border-primary transition-colors"
            >
              <div>
                {/* Platform badge & Ratio */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-surface neo-border">
                    {item.platform}
                  </span>
                  <span className="text-xs font-mono font-bold text-primary">
                    {item.aspectRatio}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-bold text-base text-gray-900 mb-2">
                  {item.assetType}
                </h4>

                {/* Dimension callout */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-black font-mono tracking-tight text-gray-900">
                    {item.width} × {item.height}
                  </span>
                  <span className="text-xs text-text-secondary">px</span>
                </div>

                {/* Mini Aspect Ratio Preview Box */}
                <div className="w-full h-24 bg-surface/60 neo-border rounded-lg flex items-center justify-center p-2 mb-3 overflow-hidden">
                  <div
                    className="bg-primary/20 border border-primary flex items-center justify-center rounded text-[10px] font-mono font-bold text-primary max-h-full max-w-full"
                    style={{
                      aspectRatio: `${item.width} / ${item.height}`,
                      width: boxRatio > 1 ? "80%" : "auto",
                      height: boxRatio <= 1 ? "80%" : "auto",
                    }}
                  >
                    <Maximize2 className="w-3 h-3 opacity-60" />
                  </div>
                </div>

                {/* Specs list */}
                <div className="space-y-1 text-xs text-text-secondary mb-3">
                  <div className="flex justify-between">
                    <span>Max File Size:</span>
                    <span className="font-mono font-semibold text-gray-800">{item.maxFileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="font-mono font-semibold text-gray-800">{item.format}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 italic pt-1 border-t border-gray-100">
                    {item.notes}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-dark/10">
                <button
                  onClick={() => handleCopyDimensionsOnly(item, cardId)}
                  className="neo-btn flex-1 text-xs py-1.5 bg-surface hover:bg-gray-100 flex items-center justify-center gap-1"
                >
                  {isCopiedDim ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {isCopiedDim ? "Copied!" : "Copy Dimensions"}
                </button>
                <button
                  onClick={() => handleCopy(item, cardId)}
                  className="neo-btn text-xs px-2.5 py-1.5 bg-primary text-white flex items-center justify-center gap-1"
                  title="Copy full specification"
                >
                  {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {isCopied ? "Done" : "Specs"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="neo-card p-8 text-center bg-white space-y-2">
          <p className="font-bold text-base">No matching dimensions found</p>
          <p className="text-xs text-text-secondary">Try a different search keyword or select &quot;All&quot; platforms.</p>
        </div>
      )}
    </div>
  );
}
