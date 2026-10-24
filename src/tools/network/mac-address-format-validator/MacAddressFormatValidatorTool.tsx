"use client";

import React, { useState, useMemo } from "react";
import { validateMacAddress } from "@/lib/networkUtils";
import { Cpu, Copy, Check, CheckCircle2, XCircle, Info, ShieldCheck } from "lucide-react";

export default function MacAddressFormatValidatorTool() {
  const [inputMac, setInputMac] = useState<string>("00:1A:2B:3C:4D:5E");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const result = useMemo(() => {
    return validateMacAddress(inputMac);
  }, [inputMac]);

  const copyFormat = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Input Box */}
      <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <Cpu className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-black">MAC Address Input</h2>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Hardware / Physical Address
          </label>
          <input
            type="text"
            value={inputMac}
            onChange={(e) => setInputMac(e.target.value)}
            placeholder="e.g. 00:1A:2B:3C:4D:5E, 00-1A-2B-3C-4D-5E, or 001a.2b3c.4d5e"
            className="w-full px-4 py-3 border-2 border-black rounded-xl font-mono font-bold text-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
          <span className="text-xs text-gray-500 mt-1 block">
            Accepts colon, hyphen, Cisco dot, or unseparated hexadecimal notation.
          </span>
        </div>

        {/* Validation Status Badge */}
        <div className="pt-2">
          {result ? (
            <div className="p-4 bg-green-50 border-2 border-green-500 rounded-xl flex items-center gap-3 text-green-950 font-bold">
              <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
              <span>Valid 48-bit EUI MAC address format.</span>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-center gap-3 text-red-950 font-bold">
              <XCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>Invalid MAC address. Must consist of exactly 12 valid hexadecimal digits (0-9, A-F).</span>
            </div>
          )}
        </div>
      </div>

      {/* Formatted Notations */}
      {result && (
        <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <h3 className="text-xl font-black border-b-2 border-black pb-3">Standard Formatted Notations</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Standard Colon */}
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase">Standard Colon (Linux/macOS)</span>
                <span className="font-mono font-black text-base text-gray-900">{result.standardColon}</span>
              </div>
              <button
                onClick={() => copyFormat(result.standardColon, "colon")}
                className="px-2.5 py-1.5 bg-white border border-black rounded-lg text-xs font-bold hover:bg-gray-100"
              >
                {copiedKey === "colon" ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Windows Hyphen */}
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase">Windows Hyphen Format</span>
                <span className="font-mono font-black text-base text-gray-900">{result.standardHyphen}</span>
              </div>
              <button
                onClick={() => copyFormat(result.standardHyphen, "hyphen")}
                className="px-2.5 py-1.5 bg-white border border-black rounded-lg text-xs font-bold hover:bg-gray-100"
              >
                {copiedKey === "hyphen" ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Cisco Dot */}
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase">Cisco Dot Notation</span>
                <span className="font-mono font-black text-base text-gray-900">{result.ciscoFormat}</span>
              </div>
              <button
                onClick={() => copyFormat(result.ciscoFormat, "cisco")}
                className="px-2.5 py-1.5 bg-white border border-black rounded-lg text-xs font-bold hover:bg-gray-100"
              >
                {copiedKey === "cisco" ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Raw Hex */}
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase">Bare Hexadecimal</span>
                <span className="font-mono font-black text-base text-gray-900">{result.rawHex}</span>
              </div>
              <button
                onClick={() => copyFormat(result.rawHex, "raw")}
                className="px-2.5 py-1.5 bg-white border border-black rounded-lg text-xs font-bold hover:bg-gray-100"
              >
                {copiedKey === "raw" ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bit-level Properties */}
          <div className="pt-2">
            <h4 className="text-sm font-black mb-3">Hardware Address Properties</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 border-2 border-black rounded-xl bg-blue-50">
                <span className="font-bold text-gray-600 block">OUI Prefix (24 Bits)</span>
                <span className="font-mono font-black text-sm text-blue-900">
                  {result.standardColon.slice(0, 8)}
                </span>
                <span className="text-[10px] text-blue-700 block mt-0.5">Identifies hardware manufacturer</span>
              </div>

              <div className="p-3 border-2 border-black rounded-xl bg-purple-50">
                <span className="font-bold text-gray-600 block">I/G Bit (Bit 0)</span>
                <span className="font-bold text-sm text-purple-900">
                  {result.isMulticast ? "Multicast / Broadcast" : "Unicast (Individual Host)"}
                </span>
                <span className="text-[10px] text-purple-700 block mt-0.5">
                  {result.isMulticast ? "Least-significant bit is 1" : "Least-significant bit is 0"}
                </span>
              </div>

              <div className="p-3 border-2 border-black rounded-xl bg-emerald-50">
                <span className="font-bold text-gray-600 block">U/L Bit (Bit 1)</span>
                <span className="font-bold text-sm text-emerald-950">
                  {result.isLocallyAdministered ? "Locally Administered (LAA)" : "Universally Administered (UAA)"}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">
                  {result.isLocallyAdministered ? "Software/user configured MAC" : "Burned-in vendor MAC"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
