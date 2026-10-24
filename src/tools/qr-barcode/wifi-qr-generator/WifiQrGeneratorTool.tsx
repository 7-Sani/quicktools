"use client";

import React, { useState, useRef, useMemo } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Wifi, Download, Copy, Check, Eye, EyeOff, ShieldCheck, Palette } from "lucide-react";

export default function WifiQrGeneratorTool() {
  const [ssid, setSsid] = useState("Home-Network-5G");
  const [password, setPassword] = useState("SecretPassword123");
  const [authType, setAuthType] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Customization
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  // Standard WIFI string escape
  const escapeWifiString = (str: string) => {
    return str.replace(/([\\;,:"])/g, "\\$1");
  };

  const wifiPayload = useMemo(() => {
    if (!ssid.trim()) return "";
    const escapedSsid = escapeWifiString(ssid);
    const escapedPass = authType !== "nopass" ? escapeWifiString(password) : "";
    return `WIFI:S:${escapedSsid};T:${authType};P:${escapedPass};H:${hidden ? "true" : "false"};;`;
  }, [ssid, password, authType, hidden]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `wifi-qr-${ssid || "network"}.png`;
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
    link.download = `wifi-qr-${ssid || "network"}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyPayload = () => {
    if (!wifiPayload) return;
    navigator.clipboard.writeText(wifiPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Wifi className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black">Wi-Fi Network Credentials</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Network Name (SSID)
              </label>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="e.g. MyHomeWiFi"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Security Encryption
              </label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <option value="WPA">WPA / WPA2 / WPA3 (Standard Recommended)</option>
                <option value="WEP">WEP (Legacy)</option>
                <option value="nopass">None / Open (No Password Required)</option>
              </select>
            </div>

            {authType !== "nopass" && (
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Wi-Fi Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter network password"
                    className="w-full px-4 py-2.5 pr-11 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="hiddenNetwork"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-black accent-purple-600 cursor-pointer"
              />
              <label htmlFor="hiddenNetwork" className="text-xs font-bold text-gray-800 cursor-pointer">
                This is a hidden Wi-Fi network (SSID not broadcasted)
              </label>
            </div>

            {/* Styling */}
            <div className="pt-3 border-t-2 border-gray-200">
              <label className="block text-xs font-black uppercase text-gray-700 mb-2">QR Appearance</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Foreground</label>
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
                  <label className="block text-xs font-bold text-gray-600 mb-1">Background</label>
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
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Scannable QR</h2>
              <button
                onClick={copyPayload}
                disabled={!wifiPayload}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg font-bold text-xs transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-[280px]">
              {wifiPayload ? (
                <>
                  <div ref={canvasRef} className="flex justify-center items-center">
                    <QRCodeCanvas
                      value={wifiPayload}
                      size={240}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level="H"
                      marginSize={4}
                    />
                  </div>
                  <div ref={svgRef} className="hidden">
                    <QRCodeSVG
                      value={wifiPayload}
                      size={300}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level="H"
                      marginSize={4}
                    />
                  </div>
                  <p className="mt-3 text-xs font-bold text-gray-600 text-center">
                    Guests can scan this with any smartphone camera to connect instantly.
                  </p>
                </>
              ) : (
                <div className="text-center text-gray-400 font-bold text-sm">
                  Enter network SSID to generate QR.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadPng}
                disabled={!wifiPayload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!wifiPayload}
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
