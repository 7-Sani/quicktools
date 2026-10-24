"use client";

import React, { useState, useRef } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Download, Sliders, Palette, Check, QrCode, FileImage, ShieldCheck } from "lucide-react";

type ExportFormat = "png" | "svg" | "webp" | "jpeg";
type ErrorCorrection = "L" | "M" | "Q" | "H";

export default function QrCodeImageDownloaderTool() {
  const [content, setContent] = useState("https://quicktools.dev/tools");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [resolution, setResolution] = useState<number>(1024);
  const [customResolution, setCustomResolution] = useState<string>("1024");
  const [margin, setMargin] = useState<number>(4);
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>("H");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [downloading, setDownloading] = useState(false);

  const hiddenCanvasRef = useRef<HTMLDivElement>(null);
  const hiddenSvgRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!content.trim()) return;
    setDownloading(true);

    const targetSize = parseInt(customResolution) || resolution;

    if (exportFormat === "svg") {
      if (!hiddenSvgRef.current) return;
      const svg = hiddenSvgRef.current.querySelector("svg");
      if (!svg) return;

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `qrcode-${targetSize}px.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Raster formats (PNG, WEBP, JPEG)
      if (!hiddenCanvasRef.current) return;
      const canvas = hiddenCanvasRef.current.querySelector("canvas");
      if (!canvas) return;

      const mimeType = exportFormat === "webp" ? "image/webp" : exportFormat === "jpeg" ? "image/jpeg" : "image/png";
      const quality = 0.95;
      const url = canvas.toDataURL(mimeType, quality);
      const link = document.createElement("a");
      link.download = `qrcode-${targetSize}px.${exportFormat}`;
      link.href = url;
      link.click();
    }

    setTimeout(() => setDownloading(false), 800);
  };

  const currentSize = parseInt(customResolution) || resolution;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Export Configuration Form */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Download className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black">Export Specifications</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Data to Encode
              </label>
              <textarea
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter text, URL, or data payload..."
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-medium bg-gray-50 focus:bg-white resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Export File Format
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["png", "svg", "webp", "jpeg"] as ExportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportFormat(fmt)}
                    className={`py-2 px-3 border-2 border-black rounded-xl font-black text-xs uppercase transition-all ${
                      exportFormat === fmt
                        ? "bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-gray-50 hover:bg-purple-50 text-gray-800"
                    }`}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution selection */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Resolution Output (Pixels)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[512, 1024, 1500, 2048].map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => {
                      setResolution(res);
                      setCustomResolution(res.toString());
                    }}
                    className={`py-1.5 px-2 border-2 border-black rounded-xl font-bold text-xs ${
                      currentSize === res ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {res}px
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">Custom Size:</span>
                <input
                  type="number"
                  min="128"
                  max="4096"
                  step="32"
                  value={customResolution}
                  onChange={(e) => setCustomResolution(e.target.value)}
                  className="w-28 px-3 py-1 border-2 border-black rounded-lg font-mono font-bold text-xs"
                />
                <span className="text-xs text-gray-500">pixels (width × height)</span>
              </div>
            </div>

            {/* Margin & Error Correction */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Margin (Quiet Zone)
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs bg-gray-50"
                >
                  <option value={0}>0 (No margin)</option>
                  <option value={2}>2 modules</option>
                  <option value={4}>4 modules (Standard)</option>
                  <option value={6}>6 modules (Wide)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Error Correction Level
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrection)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs bg-gray-50"
                >
                  <option value="L">L - Low (7%)</option>
                  <option value="M">M - Medium (15%)</option>
                  <option value="Q">Q - Quartile (25%)</option>
                  <option value="H">H - High (30% Print Ready)</option>
                </select>
              </div>
            </div>

            {/* Color Palette */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">QR Modules Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 border-2 border-black rounded-lg cursor-pointer bg-white"
                  />
                  <span className="font-mono text-xs font-bold uppercase">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 border-2 border-black rounded-lg cursor-pointer bg-white"
                  />
                  <span className="font-mono text-xs font-bold uppercase">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Download Button */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Export Preview</h2>
              <span className="text-xs font-mono font-bold uppercase bg-purple-100 text-purple-900 border border-purple-400 px-2 py-0.5 rounded-full">
                {currentSize}px • .{exportFormat.toUpperCase()}
              </span>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-[260px]">
              {/* Display preview (scaled to 220px for viewport) */}
              <div className="flex justify-center items-center">
                <QRCodeCanvas
                  value={content || "QuickTools"}
                  size={220}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={errorCorrection}
                  marginSize={margin}
                />
              </div>

              {/* Full-resolution hidden canvas for high-DPI raster download */}
              <div ref={hiddenCanvasRef} className="hidden">
                <QRCodeCanvas
                  value={content || "QuickTools"}
                  size={currentSize}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={errorCorrection}
                  marginSize={margin}
                />
              </div>

              {/* Vector SVG container for genuine SVG download */}
              <div ref={hiddenSvgRef} className="hidden">
                <QRCodeSVG
                  value={content || "QuickTools"}
                  size={currentSize}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={errorCorrection}
                  marginSize={margin}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDownload}
              disabled={!content.trim() || downloading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-base border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
            >
              <Download className="w-5 h-5" />
              Download High-Res .{exportFormat.toUpperCase()} ({currentSize}px)
            </button>
            <p className="text-center text-xs text-gray-500 font-semibold">
              Client-side generation with zero watermark, unlimited free downloads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
