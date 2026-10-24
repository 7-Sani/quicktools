"use client";

import React, { useState, useRef, useMemo } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Contact, Download, Copy, Check, User, Phone, Mail, Building, MapPin } from "lucide-react";

export default function ContactCardQrGeneratorTool() {
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Morgan");
  const [org, setOrg] = useState("Nexus Digital Labs");
  const [title, setTitle] = useState("Lead Product Architect");
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [email, setEmail] = useState("alex.morgan@nexuslabs.com");
  const [website, setWebsite] = useState("https://nexuslabs.com");
  const [address, setAddress] = useState("123 Innovation Drive, San Francisco, CA");
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  const vCardPayload = useMemo(() => {
    if (!firstName.trim() && !lastName.trim() && !phone.trim() && !email.trim()) {
      return "";
    }

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${lastName.trim()};${firstName.trim()};;;`,
      `FN:${`${firstName.trim()} ${lastName.trim()}`.trim()}`,
    ];

    if (org.trim()) lines.push(`ORG:${org.trim()}`);
    if (title.trim()) lines.push(`TITLE:${title.trim()}`);
    if (phone.trim()) lines.push(`TEL;TYPE=CELL:${phone.trim()}`);
    if (email.trim()) lines.push(`EMAIL:${email.trim()}`);
    if (website.trim()) lines.push(`URL:${website.trim()}`);
    if (address.trim()) lines.push(`ADR;TYPE=WORK:;;${address.trim()};;;;`);

    lines.push("END:VCARD");
    return lines.join("\n");
  }, [firstName, lastName, org, title, phone, email, website, address]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `vcard-${firstName || "contact"}-${lastName || "qr"}.png`;
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
    link.download = `vcard-${firstName || "contact"}-${lastName || "qr"}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyVCard = () => {
    if (!vCardPayload) return;
    navigator.clipboard.writeText(vCardPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <Contact className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black">Digital Business Card Details</h2>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company / Org</label>
                <input
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile / Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Website URL</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Work Address / Location</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">vCard QR Preview</h2>
              <button
                onClick={copyVCard}
                disabled={!vCardPayload}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg font-bold text-xs transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy vCard"}
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-[280px]">
              {vCardPayload ? (
                <>
                  <div ref={canvasRef} className="flex justify-center items-center">
                    <QRCodeCanvas
                      value={vCardPayload}
                      size={240}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                      level="M"
                      marginSize={4}
                    />
                  </div>
                  <div ref={svgRef} className="hidden">
                    <QRCodeSVG
                      value={vCardPayload}
                      size={300}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                      level="M"
                      marginSize={4}
                    />
                  </div>
                  <p className="mt-3 text-xs font-bold text-gray-700 text-center">
                    Scanning adds {firstName} {lastName} to contacts on iOS & Android.
                  </p>
                </>
              ) : (
                <div className="text-center text-gray-400 font-bold text-sm">
                  Fill in your details to create a vCard QR.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadPng}
                disabled={!vCardPayload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!vCardPayload}
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
