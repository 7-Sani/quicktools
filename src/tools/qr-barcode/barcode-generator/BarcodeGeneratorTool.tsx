"use client";

import React, { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { Barcode, Download, Copy, Check, AlertCircle, Sliders, Palette } from "lucide-react";

type BarcodeFormat = "CODE128" | "EAN13" | "UPC" | "CODE39" | "ITF" | "MSI" | "pharmacode";

export default function BarcodeGeneratorTool() {
  const [value, setValue] = useState("QUICKTOOLS-2026");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [barWidth, setBarWidth] = useState(2);
  const [height, setHeight] = useState(80);
  const [displayValue, setDisplayValue] = useState(true);
  const [lineColor, setLineColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [margin, setMargin] = useState(10);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setErrorMsg(null);
    if (!value.trim()) return;

    try {
      if (svgRef.current) {
        JsBarcode(svgRef.current, value, {
          format: format,
          width: barWidth,
          height: height,
          displayValue: displayValue,
          lineColor: lineColor,
          background: bgColor,
          margin: margin,
          fontSize: 14,
        });
      }

      if (canvasRef.current) {
        JsBarcode(canvasRef.current, value, {
          format: format,
          width: barWidth,
          height: height,
          displayValue: displayValue,
          lineColor: lineColor,
          background: bgColor,
          margin: margin,
          fontSize: 14,
        });
      }
    } catch (err: any) {
      console.warn("Barcode rendering error:", err);
      setErrorMsg(
        err?.message || `The value "${value}" is not valid for ${format} encoding.`
      );
    }
  }, [value, format, barWidth, height, displayValue, lineColor, bgColor, margin]);

  const handleFormatChange = (newFormat: BarcodeFormat) => {
    setFormat(newFormat);
    // Provide sensible default value for format if current value is invalid
    if (newFormat === "EAN13" && !/^\d{12,13}$/.test(value)) {
      setValue("590123412345");
    } else if (newFormat === "UPC" && !/^\d{11,12}$/.test(value)) {
      setValue("012345678905");
    } else if (newFormat === "ITF" && (!/^\d+$/.test(value) || value.length % 2 !== 0)) {
      setValue("123456");
    } else if (newFormat === "pharmacode" && !/^\d+$/.test(value)) {
      setValue("1234");
    }
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current || errorMsg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `barcode-${format.toLowerCase()}-${value}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current || errorMsg) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `barcode-${format.toLowerCase()}-${value}.png`;
    link.href = url;
    link.click();
  };

  const copyValue = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Barcode className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black">Barcode Generator Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Barcode Format Standard
              </label>
              <select
                value={format}
                onChange={(e) => handleFormatChange(e.target.value as BarcodeFormat)}
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white"
              >
                <option value="CODE128">CODE128 (Universal Alphanumeric - Recommended)</option>
                <option value="EAN13">EAN-13 (12-13 Digits International Retail)</option>
                <option value="UPC">UPC-A (11-12 Digits North America Retail)</option>
                <option value="CODE39">CODE39 (Uppercase alphanumeric & special chars)</option>
                <option value="ITF">ITF (Interleaved 2 of 5 - Even number of digits)</option>
                <option value="MSI">MSI (Modified Plessey - Numbers only)</option>
                <option value="pharmacode">Pharmacode (Pharmaceutical Numeric)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Data Value / Text to Encode
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter barcode value"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold font-mono bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Bar Width:</span>
                  <span className="font-mono text-purple-700">{barWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={barWidth}
                  onChange={(e) => setBarWidth(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Bar Height:</span>
                  <span className="font-mono text-purple-700">{height}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="150"
                  step="5"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bar Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-8 h-8 border-2 border-black rounded-lg cursor-pointer bg-white"
                  />
                  <span className="font-mono text-xs font-bold uppercase">{lineColor}</span>
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

            {/* Display text */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="displayValue"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-black accent-purple-600 cursor-pointer"
              />
              <label htmlFor="displayValue" className="text-xs font-bold text-gray-800 cursor-pointer">
                Display Human-Readable Text Beneath Barcode
              </label>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Live Barcode</h2>
              <button
                onClick={copyValue}
                disabled={!value.trim()}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg font-bold text-xs transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Value"}
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-[260px] overflow-x-auto">
              {errorMsg ? (
                <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-start gap-2 text-red-900 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              ) : value.trim() ? (
                <>
                  <svg ref={svgRef} className="max-w-full" />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              ) : (
                <div className="text-center text-gray-400 font-bold text-sm">
                  Enter data to render barcode.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadPng}
                disabled={Boolean(errorMsg) || !value.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={Boolean(errorMsg) || !value.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
              >
                <Download className="w-4 h-4" /> Download SVG
              </button>
            </div>
            <p className="text-center text-xs text-gray-500">
              High quality, laser-scanner compliant linear barcode output.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
