"use client";

import React, { useState, useMemo } from "react";
import { isValidIPv4, ipToInt, intToIp, intToBinary, cidrToMaskInt, calculateSubnet } from "@/lib/networkUtils";
import { Binary, Copy, Check, Calculator, ArrowDown, HelpCircle } from "lucide-react";

export default function NetworkAddressCalculatorTool() {
  const [ip, setIp] = useState<string>("172.16.45.100");
  const [cidr, setCidr] = useState<number>(20);
  const [copied, setCopied] = useState<boolean>(false);

  const calc = useMemo(() => {
    return calculateSubnet(ip, cidr);
  }, [ip, cidr]);

  const copyResult = () => {
    if (!calc) return;
    const text = `Network Address Calculation:
Host IP: ${calc.ip}
Subnet Mask: ${calc.netmask} (/${calc.cidr})
Operation: (Host IP & Subnet Mask)
Network Address: ${calc.networkAddress}
Broadcast Address: ${calc.broadcastAddress}
Usable Host Range: ${calc.firstUsableIp} - ${calc.lastUsableIp}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Input Form */}
      <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <Binary className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-black">Network ID &amp; Broadcast Math</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-6">
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Host IP Address
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value.trim())}
              placeholder="e.g. 172.16.45.100"
              className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-mono font-bold bg-gray-50 focus:bg-white text-base"
            />
          </div>

          <div className="md:col-span-6">
            <div className="flex justify-between items-center text-sm font-bold mb-1">
              <span>Subnet Mask Prefix:</span>
              <span className="font-mono text-blue-700 font-black">/{cidr} ({intToIp(cidrToMaskInt(cidr))})</span>
            </div>
            <input
              type="range"
              min="1"
              max="32"
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {calc && (
        <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-3">
            <h3 className="text-xl font-black">Step-by-Step Bitwise Breakdown</h3>
            <button
              onClick={copyResult}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 hover:bg-blue-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-blue-700" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Math"}
            </button>
          </div>

          {/* Logic Steps */}
          <div className="space-y-6">
            {/* Step 1: Bitwise AND for Network Address */}
            <div className="p-5 border-2 border-black rounded-xl bg-gray-50 space-y-3">
              <span className="text-xs font-black uppercase text-blue-700 block">
                Step 1: Bitwise AND Logic (Host IP &amp; Subnet Mask = Network Address)
              </span>
              <p className="text-xs text-gray-600">
                A bit in the Network Address is 1 only when the corresponding bit in BOTH the IP and the Mask is 1.
              </p>
              <div className="p-3 bg-gray-900 text-gray-100 font-mono text-xs rounded-xl overflow-x-auto space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400 w-32">Host IP ({calc.ip}):</span>
                  <span className="text-blue-300 font-bold">{calc.ipBinary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 w-32">&amp; Mask ({calc.netmask}):</span>
                  <span className="text-yellow-300 font-bold">{calc.netmaskBinary}</span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-1 text-green-400 font-black">
                  <span className="w-32">= Network ID:</span>
                  <span>{calc.networkBinary}</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between text-sm font-bold pt-1">
                <span>Resulting Network Address:</span>
                <span className="font-mono text-lg font-black text-green-700">{calc.networkAddress}</span>
              </div>
            </div>

            {/* Step 2: Bitwise OR for Broadcast Address */}
            <div className="p-5 border-2 border-black rounded-xl bg-gray-50 space-y-3">
              <span className="text-xs font-black uppercase text-blue-700 block">
                Step 2: Bitwise OR Logic (Network ID | Wildcard = Broadcast Address)
              </span>
              <p className="text-xs text-gray-600">
                The wildcard mask is the bitwise NOT of the subnet mask (~Mask). Setting all host bits to 1 yields the broadcast address.
              </p>
              <div className="p-3 bg-gray-900 text-gray-100 font-mono text-xs rounded-xl overflow-x-auto space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400 w-32">Network ID:</span>
                  <span className="text-green-300 font-bold">{calc.networkBinary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 w-32">| Wildcard ({calc.wildcard}):</span>
                  <span className="text-purple-300 font-bold">{intToBinary((~cidrToMaskInt(calc.cidr)) >>> 0)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-1 text-rose-400 font-black">
                  <span className="w-32">= Broadcast:</span>
                  <span>{calc.broadcastBinary}</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between text-sm font-bold pt-1">
                <span>Resulting Broadcast Address:</span>
                <span className="font-mono text-lg font-black text-rose-700">{calc.broadcastAddress}</span>
              </div>
            </div>

            {/* Step 3: Usable Range */}
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-blue-50/50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-gray-600 block">Usable Host Range:</span>
                <span className="font-mono font-black text-base text-gray-900">
                  {calc.firstUsableIp} &rarr; {calc.lastUsableIp}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-600 block">Usable Host Capacity:</span>
                <span className="font-mono font-black text-base text-blue-700">
                  {calc.usableHosts.toLocaleString()} Hosts
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
