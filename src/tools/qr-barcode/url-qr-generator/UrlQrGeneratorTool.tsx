"use client";

import React, { useState, useRef, useMemo } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Globe, Download, Copy, Check, ExternalLink, Sliders, Palette } from "lucide-react";

export default function UrlQrGeneratorTool() {
  const [rawUrl, setRawUrl] = useState("https://quicktools.dev");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("Q");
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  const formattedUrl = useMemo(() => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }, [rawUrl]);

  const isValidUrl = useMemo(() => {
    if (!formattedUrl) return false;
    try {
      new URL(formattedUrl);
      return true;
    } catch {
      return false;
    }
  }, [formattedUrl]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `url-qr-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `url-qr-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(formattedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input & Options */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Globe className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black">Website Link / URL</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Target Web Address
              </label>
              <input
                type="text"
                value={rawUrl}
                onChange={(e) => setRawUrl(e.target.value)}
                placeholder="example.com or https://yourlink.com"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500 font-semibold">
                <span>Auto-prefixes https:// if omitted.</span>
                {isValidUrl && (
                  <a
                    href={formattedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline flex items-center gap-1 font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Test URL
                  </a>
                )}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex justify-between items-center text-sm font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-600" /> Resolution:
                </span>
                <span className="font-mono text-purple-700">{size}px × {size}px</span>
              </div>
              <input
                type="range"
                min="128"
                max="512"
                step="16"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" /> QR Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 border-2 border-black rounded-lg cursor-pointer bg-white"
                  />
                  <span className="font-mono text-xs font-bold uppercase">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" /> Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 border-2 border-black rounded-lg cursor-pointer bg-white"
                  />
                  <span className="font-mono text-xs font-bold uppercase">{bgColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Error Correction Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs bg-gray-50 focus:bg-white"
              >
                <option value="L">L - Low (7% redundancy - smaller matrix)</option>
                <option value="M">M - Medium (15% redundancy - standard)</option>
                <option value="Q">Q - Quartile (25% redundancy - high clarity)</option>
                <option value="H">H - High (30% redundancy - print & stickers)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Preview & Download */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Scannable Preview</h2>
              <button
                onClick={copyUrl}
                disabled={!formattedUrl}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg font-bold text-xs transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-[280px]">
              {formattedUrl ? (
                <>
                  <div ref={canvasRef} className="flex justify-center items-center">
                    <QRCodeCanvas
                      value={formattedUrl}
                      size={240}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level={level}
                      marginSize={4}
                    />
                  </div>
                  <div ref={svgRef} className="hidden">
                    <QRCodeSVG
                      value={formattedUrl}
                      size={size}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level={level}
                      marginSize={4}
                    />
                  </div>
                  <span className="mt-3 text-xs font-mono font-bold text-gray-700 text-center break-all max-w-[240px]">
                    {formattedUrl}
                  </span>
                </>
              ) : (
                <div className="text-center text-gray-400 font-bold text-sm">
                  Enter a URL above to generate QR code.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadPng}
                disabled={!formattedUrl}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!formattedUrl}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
              >
                <Download className="w-4 h-4" /> Download SVG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
