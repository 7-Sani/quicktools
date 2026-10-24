"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  Upload,
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Eye,
  Smartphone,
  Monitor,
  Sidebar,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react";

export default function YoutubeThumbnailPreviewTool() {
  // Thumbnail source
  const [imageSrc, setImageSrc] = useState<string>(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&q=80"
  );
  const [fileName, setFileName] = useState<string>("default-sample.jpg");
  const [fileSizeKb, setFileSizeKb] = useState<number>(450);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number }>({
    width: 1280,
    height: 720,
  });

  // Video meta inputs
  const [title, setTitle] = useState("I Built a Full Stack SaaS App in 24 Hours! (Beginner Guide)");
  const [channelName, setChannelName] = useState("CodeCraft Studios");
  const [views, setViews] = useState("142K views");
  const [timestamp, setTimestamp] = useState("3 days ago");
  const [duration, setDuration] = useState("18:42");
  const [isVerified, setIsVerified] = useState(true);

  // Preview Mode
  const [previewTab, setPreviewTab] = useState<"desktop" | "mobile" | "sidebar">("desktop");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset thumbnails
  const PRESETS = [
    {
      name: "Abstract Gradient",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&q=80",
      sizeKb: 380,
    },
    {
      name: "Tech Setup",
      url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1280&q=80",
      sizeKb: 520,
    },
    {
      name: "Modern Studio",
      url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1280&q=80",
      sizeKb: 610,
    },
  ];

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSizeKb(Math.round(file.size / 1024));

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setImageSrc("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&q=80");
    setFileName("default-sample.jpg");
    setFileSizeKb(450);
    setImgDimensions({ width: 1280, height: 720 });
    setTitle("I Built a Full Stack SaaS App in 24 Hours! (Beginner Guide)");
    setChannelName("CodeCraft Studios");
    setViews("142K views");
    setTimestamp("3 days ago");
    setDuration("18:42");
    setIsVerified(true);
  };

  const handleClear = () => {
    setImageSrc("");
    setFileName("");
    setFileSizeKb(0);
    setImgDimensions({ width: 0, height: 0 });
    setTitle("");
    setChannelName("");
    setViews("");
    setTimestamp("");
    setDuration("");
  };

  const handleCopyMeta = () => {
    const metaText = `Title: ${title}\nChannel: ${channelName}\nDuration: ${duration}\nViews: ${views} • ${timestamp}`;
    navigator.clipboard.writeText(metaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculations & checks
  const isOversized = fileSizeKb > 2048; // YouTube hard limit is 2MB
  const aspectRatio = imgDimensions.width > 0 ? (imgDimensions.width / imgDimensions.height).toFixed(2) : "0";
  const is16by9 = Math.abs(Number(aspectRatio) - 1.78) < 0.05;
  const isMinResolutionMet = imgDimensions.width >= 640 && imgDimensions.height >= 360;

  return (
    <div className="space-y-6">
      {/* Disclaimer banner */}
      <div className="neo-card p-4 bg-amber-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Client-Side Preview Tool:</strong> This tool simulates standard YouTube UI placements (Desktop, Mobile, and Watch Sidebar) using your uploaded or chosen thumbnail. It operates entirely locally in your browser and does not access private platform data or bypass platform upload restrictions.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Inputs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upload card */}
          <div className="neo-card p-6 bg-white space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" /> Thumbnail Image
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-dark/30 hover:border-dark p-6 rounded-lg text-center cursor-pointer transition-colors bg-surface/50 hover:bg-surface flex flex-col items-center justify-center gap-2"
            >
              <Upload className="w-8 h-8 text-text-secondary" />
              <p className="text-sm font-bold">Click to upload thumbnail</p>
              <p className="text-xs text-text-secondary">JPG, PNG, WebP (Max 2MB, 1280×720 recommended)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Presets */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-2">
                Or pick a sample:
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setImageSrc(p.url);
                      setFileName(p.name);
                      setFileSizeKb(p.sizeKb);
                      setImgDimensions({ width: 1280, height: 720 });
                    }}
                    className="neo-btn text-xs px-3 py-1.5 bg-surface hover:bg-amber-100 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" /> {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Video Metadata Inputs */}
          <div className="neo-card p-6 bg-white space-y-4">
            <h2 className="text-lg font-black uppercase tracking-tight">Video Metadata</h2>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-text-secondary">Video Title</label>
                <span className={`text-xs font-bold ${title.length > 100 ? "text-rose-500" : "text-text-secondary"}`}>
                  {title.length}/100
                </span>
              </div>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={2}
                placeholder="Enter video title..."
                className="neo-input w-full p-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">Channel Name</label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Channel Name"
                  className="neo-input w-full p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">Duration Badge</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="18:42"
                  className="neo-input w-full p-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">Views Text</label>
                <input
                  type="text"
                  value={views}
                  onChange={(e) => setViews(e.target.value)}
                  placeholder="142K views"
                  className="neo-input w-full p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">Time Ago</label>
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="3 days ago"
                  className="neo-input w-full p-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="verifiedCheck"
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 rounded border-dark accent-primary"
              />
              <label htmlFor="verifiedCheck" className="text-xs font-bold cursor-pointer">
                Show Verified Channel Badge
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-dark/10">
              <button
                onClick={handleCopyMeta}
                className="neo-btn text-xs px-3 py-2 bg-primary text-white flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Details"}
              </button>
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-2 bg-surface flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                onClick={handleClear}
                className="neo-btn text-xs px-3 py-2 bg-rose-50 text-rose-700 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          {/* Technical Specs & Diagnostics */}
          <div className="neo-card p-5 bg-surface/40 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              YouTube Thumbnail Specs Checker
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Aspect Ratio (16:9):</span>
                <span className={`font-mono font-bold flex items-center gap-1 ${is16by9 ? "text-emerald-700" : "text-amber-700"}`}>
                  {is16by9 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {aspectRatio}:1 {is16by9 ? "(Pass)" : "(Non-standard)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Resolution ({imgDimensions.width}×{imgDimensions.height}):</span>
                <span className={`font-mono font-bold flex items-center gap-1 ${isMinResolutionMet ? "text-emerald-700" : "text-amber-700"}`}>
                  {isMinResolutionMet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {isMinResolutionMet ? ">= 640px (Pass)" : "< 640px (Too Small)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>File Size (~{fileSizeKb} KB):</span>
                <span className={`font-mono font-bold flex items-center gap-1 ${!isOversized ? "text-emerald-700" : "text-rose-700"}`}>
                  {!isOversized ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {!isOversized ? "< 2MB (Valid)" : "> 2MB (Exceeds YouTube limit)"}
                </span>
              </div>
              <div className="p-2.5 bg-white neo-border rounded text-[11px] text-text-secondary leading-tight mt-2">
                <strong>CTR Tip:</strong> YouTube places the duration badge in the bottom-right corner. Keep critical faces, text, and logos away from the lower right 15% of your artwork.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Previews */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tab selector */}
          <div className="flex items-center justify-between border-b border-dark/10 pb-3">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> Live UI Previews
            </h2>
            <div className="flex gap-1.5 bg-surface p-1 neo-border rounded-lg">
              <button
                onClick={() => setPreviewTab("desktop")}
                className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${
                  previewTab === "desktop" ? "bg-white neo-border text-dark" : "text-text-secondary"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                onClick={() => setPreviewTab("mobile")}
                className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${
                  previewTab === "mobile" ? "bg-white neo-border text-dark" : "text-text-secondary"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
              <button
                onClick={() => setPreviewTab("sidebar")}
                className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${
                  previewTab === "sidebar" ? "bg-white neo-border text-dark" : "text-text-secondary"
                }`}
              >
                <Sidebar className="w-3.5 h-3.5" /> Sidebar
              </button>
            </div>
          </div>

          {/* VIEW 1: DESKTOP CARD PREVIEW */}
          {previewTab === "desktop" && (
            <div className="neo-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
                  YouTube Desktop Home Feed Card
                </span>
                <span className="text-[11px] text-text-secondary font-mono">16:9 Aspect Ratio</span>
              </div>

              {/* Card Container */}
              <div className="max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No image uploaded</span>
                  )}
                  {duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded tracking-wide font-mono">
                      {duration}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-3.5 flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {channelName ? channelName.charAt(0).toUpperCase() : "Y"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2">
                      {title || "Untitled Video Title Goes Here"}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <span className="truncate">{channelName || "Channel Name"}</span>
                      {isVerified && <CheckCircle2 className="w-3 h-3 text-gray-400 shrink-0" />}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {views || "0 views"} • {timestamp || "just now"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: MOBILE FEED CARD PREVIEW */}
          {previewTab === "mobile" && (
            <div className="neo-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
                  YouTube Mobile Feed Card
                </span>
                <span className="text-[11px] text-text-secondary font-mono">Mobile Full-Width</span>
              </div>

              {/* Simulated Mobile Screen */}
              <div className="max-w-xs mx-auto bg-gray-50 rounded-2xl p-2 border-2 border-gray-300 shadow-md">
                <div className="bg-white rounded-xl overflow-hidden">
                  <div className="relative aspect-video w-full bg-black overflow-hidden">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt="Mobile Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                    {duration && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[10px] font-bold px-1 py-0.2 rounded font-mono">
                        {duration}
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {channelName ? channelName.charAt(0) : "C"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-gray-900 line-clamp-2 leading-tight">
                        {title || "Untitled Video"}
                      </h4>
                      <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                        <span className="truncate">{channelName}</span>
                        {isVerified && <CheckCircle2 className="w-2.5 h-2.5 text-gray-400 shrink-0" />}
                        <span>•</span>
                        <span>{views}</span>
                        <span>•</span>
                        <span>{timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: WATCH SIDEBAR RECOMMENDED VIDEO */}
          {previewTab === "sidebar" && (
            <div className="neo-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
                  YouTube Watch Page Sidebar (Suggested Video)
                </span>
                <span className="text-[11px] text-text-secondary font-mono">Compact 168×94px</span>
              </div>

              <div className="max-w-md mx-auto bg-white p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex gap-2.5 cursor-pointer">
                <div className="relative w-40 aspect-video rounded-md overflow-hidden bg-black shrink-0">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt="Sidebar Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                      No Image
                    </div>
                  )}
                  {duration && (
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1 rounded">
                      {duration}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-start">
                  <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {title || "Untitled Video Title"}
                  </h4>
                  <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                    <span className="truncate">{channelName}</span>
                    {isVerified && <CheckCircle2 className="w-2.5 h-2.5 text-gray-400 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {views} • {timestamp}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
