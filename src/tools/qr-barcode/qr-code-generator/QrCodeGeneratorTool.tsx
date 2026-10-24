"use client";

import React, { useState, useRef } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Download, Copy, Check, QrCode, Sliders, Palette, RefreshCw } from "lucide-react";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export default function QrCodeGeneratorTool() {
  const [value, setValue] = useState("https://quicktools.dev");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [level, setLevel] = useState<ErrorCorrectionLevel>("M");
  const [includeMargin, setIncludeMargin] = useState(true);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
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
    link.download = `qrcode-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetDefaults = () => {
    setValue("https://quicktools.dev");
    setSize(256);
    setFgColor("#000000");
    setBgColor("#FFFFFF");
    setLevel("M");
    setIncludeMargin(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-black">Content & Options</h2>
            </div>
            <button
              onClick={resetDefaults}
              className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                QR Code Text or URL Content
              </label>
              <textarea
                rows={3}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter any text, website URL, note, or data..."
                className="w-full px-4 py-3 border-2 border-black rounded-xl font-medium text-base bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] resize-none"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Length: {value.length} characters
              </span>
            </div>

            {/* Size Slider */}
            <div>
              <div className="flex justify-between items-center text-sm font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-600" /> Resolution Size:
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
                  <Palette className="w-3.5 h-3.5" /> Foreground (QR)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 border-2 border-black rounded-lg cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-24 px-2 py-1.5 border-2 border-black rounded-lg text-xs font-mono font-bold uppercase"
                  />
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
                    className="w-10 h-10 border-2 border-black rounded-lg cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-24 px-2 py-1.5 border-2 border-black rounded-lg text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Error correction & Margin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Error Correction Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as ErrorCorrectionLevel)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs bg-gray-50 focus:bg-white"
                >
                  <option value="L">Level L (~7% recovery)</option>
                  <option value="M">Level M (~15% recovery)</option>
                  <option value="Q">Level Q (~25% recovery)</option>
                  <option value="H">Level H (~30% recovery - Best for Print)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="includeMargin"
                  checked={includeMargin}
                  onChange={(e) => setIncludeMargin(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-black accent-purple-600 cursor-pointer"
                />
                <label htmlFor="includeMargin" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Quiet Zone (Outer White Margin)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview & Download Column */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Live QR Preview</h2>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg font-bold text-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Content"}
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-[300px]">
              {value.trim() ? (
                <>
                  {/* Canvas representation (used for PNG export and high-DPI display) */}
                  <div ref={canvasRef} className="flex justify-center items-center">
                    <QRCodeCanvas
                      value={value}
                      size={Math.min(size, 280)}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level={level}
                      marginSize={includeMargin ? 4 : 0}
                    />
                  </div>

                  {/* Hidden SVG representation (used for genuine vector SVG download) */}
                  <div ref={svgRef} className="hidden">
                    <QRCodeSVG
                      value={value}
                      size={size}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level={level}
                      marginSize={includeMargin ? 4 : 0}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 font-bold text-sm">
                  <QrCode className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  Enter text or URL to generate QR code.
                </div>
              )}
            </div>
          </div>

          {/* Download Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadPng}
                disabled={!value.trim()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 border-2 border-black rounded-xl font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all text-white"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!value.trim()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 border-2 border-black rounded-xl font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all text-black"
              >
                <Download className="w-4 h-4" /> Download SVG
              </button>
            </div>
            <p className="text-center text-xs text-gray-500">
              Genuine raster PNG & vector SVG downloads with no watermark.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
