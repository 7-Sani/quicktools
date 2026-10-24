"use client";

import React, { useState } from "react";
import { isValidIPv4, ipToInt, intToIp, intToBinary, intToHex } from "@/lib/networkUtils";
import { ArrowRightLeft, Copy, Check, Binary, Hash, Code } from "lucide-react";

export default function Ipv4AddressConverterTool() {
  const [dottedDec, setDottedDec] = useState<string>("192.168.1.1");
  const [binaryStr, setBinaryStr] = useState<string>("11000000.10101000.00000001.00000001");
  const [hexStr, setHexStr] = useState<string>("0xC0A80101");
  const [decimalInt, setDecimalInt] = useState<string>("3232235777");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const updateFromInt = (intVal: number) => {
    const validInt = intVal >>> 0;
    setDottedDec(intToIp(validInt));
    setBinaryStr(intToBinary(validInt));
    setHexStr(intToHex(validInt));
    setDecimalInt(validInt.toString());
  };

  const handleDottedDecChange = (val: string) => {
    setDottedDec(val);
    if (isValidIPv4(val)) {
      const intVal = ipToInt(val);
      setBinaryStr(intToBinary(intVal));
      setHexStr(intToHex(intVal));
      setDecimalInt(intVal.toString());
    }
  };

  const handleBinaryChange = (val: string) => {
    setBinaryStr(val);
    const clean = val.replace(/[^01]/g, "");
    if (clean.length === 32) {
      const intVal = parseInt(clean, 2) >>> 0;
      setDottedDec(intToIp(intVal));
      setHexStr(intToHex(intVal));
      setDecimalInt(intVal.toString());
    }
  };

  const handleHexChange = (val: string) => {
    setHexStr(val);
    const clean = val.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length === 8) {
      const intVal = parseInt(clean, 16) >>> 0;
      setDottedDec(intToIp(intVal));
      setBinaryStr(intToBinary(intVal));
      setDecimalInt(intVal.toString());
    }
  };

  const handleIntChange = (val: string) => {
    setDecimalInt(val);
    const num = Number(val);
    if (!isNaN(num) && num >= 0 && num <= 4294967295) {
      updateFromInt(num);
    }
  };

  const copyValue = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const currentInt = isValidIPv4(dottedDec) ? ipToInt(dottedDec) : 3232235777;
  const octets = [
    (currentInt >>> 24) & 255,
    (currentInt >>> 16) & 255,
    (currentInt >>> 8) & 255,
    currentInt & 255,
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Bidirectional Converters */}
      <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <ArrowRightLeft className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-black">Bidirectional IPv4 Formats</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dotted Decimal */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-gray-700">
                1. Dotted Decimal Notation
              </label>
              <button
                onClick={() => copyValue(dottedDec, "dotted")}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                {copiedField === "dotted" ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === "dotted" ? "Copied" : "Copy"}
              </button>
            </div>
            <input
              type="text"
              value={dottedDec}
              onChange={(e) => handleDottedDecChange(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-mono font-bold text-base bg-gray-50 focus:bg-white"
            />
            <span className="text-[11px] text-gray-500">Standard notation: e.g. 192.168.1.1</span>
          </div>

          {/* 32-bit Integer */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-gray-700">
                2. 32-bit Decimal Integer
              </label>
              <button
                onClick={() => copyValue(decimalInt, "int")}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                {copiedField === "int" ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === "int" ? "Copied" : "Copy"}
              </button>
            </div>
            <input
              type="number"
              min="0"
              max="4294967295"
              value={decimalInt}
              onChange={(e) => handleIntChange(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-mono font-bold text-base bg-gray-50 focus:bg-white"
            />
            <span className="text-[11px] text-gray-500">Range: 0 to 4,294,967,295 (2^32 - 1)</span>
          </div>

          {/* Hexadecimal */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-gray-700">
                3. Hexadecimal Format
              </label>
              <button
                onClick={() => copyValue(hexStr, "hex")}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                {copiedField === "hex" ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === "hex" ? "Copied" : "Copy"}
              </button>
            </div>
            <input
              type="text"
              value={hexStr}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-mono font-bold text-base bg-gray-50 focus:bg-white uppercase"
            />
            <span className="text-[11px] text-gray-500">8 hex characters: 0x00000000 to 0xFFFFFFFF</span>
          </div>

          {/* 32-bit Binary */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-gray-700">
                4. Dotted 32-Bit Binary
              </label>
              <button
                onClick={() => copyValue(binaryStr, "bin")}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                {copiedField === "bin" ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === "bin" ? "Copied" : "Copy"}
              </button>
            </div>
            <input
              type="text"
              value={binaryStr}
              onChange={(e) => handleBinaryChange(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-mono font-bold text-sm bg-gray-50 focus:bg-white"
            />
            <span className="text-[11px] text-gray-500">4 groups of 8 binary bits</span>
          </div>
        </div>
      </div>

      {/* Octet by Octet Breakdown */}
      <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <h3 className="text-lg font-black flex items-center gap-2">
          <Binary className="w-5 h-5 text-blue-600" /> Octet-by-Octet Bitwise Anatomy
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 border-b-2 border-black font-black uppercase">
              <tr>
                <th className="py-2 px-3">Octet Position</th>
                <th className="py-2 px-3">Decimal</th>
                <th className="py-2 px-3">Hexadecimal</th>
                <th className="py-2 px-3">8-Bit Binary</th>
                <th className="py-2 px-3 font-mono">128 64 32 16 8 4 2 1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {octets.map((oct, idx) => {
                const bin = oct.toString(2).padStart(8, "0");
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-bold font-sans">Octet {idx + 1} (Bits {(3 - idx) * 8 + 1}-{(4 - idx) * 8})</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700 text-sm">{oct}</td>
                    <td className="py-2.5 px-3">0x{oct.toString(16).toUpperCase().padStart(2, "0")}</td>
                    <td className="py-2.5 px-3 text-emerald-800 font-bold">{bin}</td>
                    <td className="py-2.5 px-3 tracking-widest text-gray-600">
                      {bin.split("").join(" ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
