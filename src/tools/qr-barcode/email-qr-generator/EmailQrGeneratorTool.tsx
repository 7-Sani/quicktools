"use client";

import React, { useState, useRef, useMemo } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Mail, Download, Copy, Check, ExternalLink } from "lucide-react";

export default function EmailQrGeneratorTool() {
  const [recipient, setRecipient] = useState("support@example.com");
  const [subject, setSubject] = useState("Product Inquiry");
  const [body, setBody] = useState("Hi, I would like to learn more about your services.");
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  const mailtoPayload = useMemo(() => {
    if (!recipient.trim()) return "";
    const params: string[] = [];
    if (subject.trim()) params.push(`subject=${encodeURIComponent(subject.trim())}`);
    if (body.trim()) params.push(`body=${encodeURIComponent(body.trim())}`);

    const queryString = params.length > 0 ? `?${params.join("&")}` : "";
    return `mailto:${recipient.trim()}${queryString}`;
  }, [recipient, subject, body]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `email-qr-${recipient || "mailto"}.png`;
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
    link.download = `email-qr-${recipient || "mailto"}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyPayload = () => {
    if (!mailtoPayload) return;
    navigator.clipboard.writeText(mailtoPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Mail className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black">Email Parameters</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. contact@yourbusiness.com"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Email Subject Line (Optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Booking Request"
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Pre-filled Message Body (Optional)
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write the initial message body here..."
                className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">Email QR Code</h2>
              <button
                onClick={copyPayload}
                disabled={!mailtoPayload}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg font-bold text-xs transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-[280px]">
              {mailtoPayload ? (
                <>
                  <div ref={canvasRef} className="flex justify-center items-center">
                    <QRCodeCanvas
                      value={mailtoPayload}
                      size={240}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                      level="M"
                      marginSize={4}
                    />
                  </div>
                  <div ref={svgRef} className="hidden">
                    <QRCodeSVG
                      value={mailtoPayload}
                      size={300}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                      level="M"
                      marginSize={4}
                    />
                  </div>
                  <p className="mt-3 text-xs font-bold text-gray-600 text-center">
                    Scanning opens the mail client with pre-filled message.
                  </p>
                </>
              ) : (
                <div className="text-center text-gray-400 font-bold text-sm">
                  Enter recipient email to generate QR code.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadPng}
                disabled={!mailtoPayload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!mailtoPayload}
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
