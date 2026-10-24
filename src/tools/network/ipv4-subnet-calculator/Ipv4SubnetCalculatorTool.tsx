"use client";

import React, { useState, useMemo } from "react";
import { calculateSubnet, isValidIPv4, cidrToMaskInt, intToIp, maskIntToCidr } from "@/lib/networkUtils";
import { Calculator, Copy, Check, Binary, Network, ShieldCheck, AlertCircle } from "lucide-react";

export default function Ipv4SubnetCalculatorTool() {
  const [ipInput, setIpInput] = useState<string>("192.168.1.50");
  const [cidr, setCidr] = useState<number>(24);
  const [copied, setCopied] = useState<boolean>(false);

  const subnet = useMemo(() => {
    return calculateSubnet(ipInput, cidr);
  }, [ipInput, cidr]);

  const copyBreakdown = () => {
    if (!subnet) return;
    const text = `IPv4 Subnet Calculation:
IP Address: ${subnet.ip}/${subnet.cidr}
Network Address: ${subnet.networkAddress}
Broadcast Address: ${subnet.broadcastAddress}
Usable Host Range: ${subnet.firstUsableIp} - ${subnet.lastUsableIp}
Total Addresses: ${subnet.totalAddresses.toLocaleString()}
Usable Hosts: ${subnet.usableHosts.toLocaleString()}
Subnet Mask: ${subnet.netmask}
Wildcard Mask: ${subnet.wildcard}
Class: Class ${subnet.ipClass} (${subnet.scope})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Input Panel */}
      <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-black">Subnet Parameters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-7">
            <label className="block text-sm font-bold text-gray-800 mb-1">
              IPv4 Address
            </label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value.trim())}
              placeholder="e.g. 192.168.1.1 or 10.0.0.1"
              className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-mono font-bold text-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
            {!isValidIPv4(ipInput) && ipInput.length > 0 && (
              <span className="text-xs font-bold text-red-600 mt-1 block">
                Please enter a valid IPv4 address (e.g. 192.168.1.1, octets between 0 and 255).
              </span>
            )}
          </div>

          <div className="md:col-span-5">
            <div className="flex justify-between items-center text-sm font-bold mb-1">
              <span>Prefix Length (CIDR):</span>
              <span className="font-mono text-blue-700 font-black text-base">/{cidr} ({intToIp(cidrToMaskInt(cidr))})</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Quick CIDR Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200">
          <span className="text-xs font-bold text-gray-600">Common Subnets:</span>
          {[
            { c: 8, label: "/8 (Class A)" },
            { c: 16, label: "/16 (Class B)" },
            { c: 24, label: "/24 (Class C)" },
            { c: 28, label: "/28 (14 hosts)" },
            { c: 30, label: "/30 (2 hosts)" },
            { c: 32, label: "/32 (Host)" },
          ].map((preset) => (
            <button
              key={preset.c}
              onClick={() => setCidr(preset.c)}
              className={`px-2.5 py-1 text-xs font-bold border-2 border-black rounded-lg transition-colors ${
                cidr === preset.c ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-blue-100"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Panel */}
      {subnet ? (
        <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
            <div>
              <span className="text-xs font-black uppercase text-blue-700 tracking-wider block">
                Calculated Subnet Summary
              </span>
              <h3 className="text-2xl font-black font-mono">
                {subnet.networkAddress} / {subnet.cidr}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border-2 border-black ${
                subnet.isPrivate ? "bg-amber-100 text-amber-950" : "bg-green-100 text-green-950"
              }`}>
                {subnet.scope}
              </span>
              <button
                onClick={copyBreakdown}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 hover:bg-blue-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-blue-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Breakdown"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50">
              <span className="text-xs font-bold text-gray-500 block uppercase">Network Address</span>
              <span className="font-mono font-black text-lg text-gray-900">{subnet.networkAddress}</span>
            </div>

            <div className="p-4 border-2 border-black rounded-xl bg-gray-50">
              <span className="text-xs font-bold text-gray-500 block uppercase">Broadcast Address</span>
              <span className="font-mono font-black text-lg text-gray-900">{subnet.broadcastAddress}</span>
            </div>

            <div className="p-4 border-2 border-black rounded-xl bg-gray-50">
              <span className="text-xs font-bold text-gray-500 block uppercase">Subnet Mask</span>
              <span className="font-mono font-black text-lg text-gray-900">{subnet.netmask}</span>
            </div>

            <div className="p-4 border-2 border-black rounded-xl bg-gray-50">
              <span className="text-xs font-bold text-gray-500 block uppercase">Wildcard Mask</span>
              <span className="font-mono font-black text-lg text-gray-900">{subnet.wildcard}</span>
            </div>

            <div className="p-4 border-2 border-black rounded-xl bg-blue-50 text-blue-950">
              <span className="text-xs font-bold text-blue-700 block uppercase">Usable Hosts</span>
              <span className="font-mono font-black text-2xl text-blue-700">
                {subnet.usableHosts.toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-500 block">Total IPs: {subnet.totalAddresses.toLocaleString()}</span>
            </div>

            <div className="p-4 border-2 border-black rounded-xl bg-emerald-50 text-emerald-950">
              <span className="text-xs font-bold text-emerald-800 block uppercase">Usable Host Range</span>
              <span className="font-mono font-bold text-sm text-emerald-950 block">
                {subnet.firstUsableIp}
              </span>
              <span className="text-xs text-emerald-700">to</span>
              <span className="font-mono font-bold text-sm text-emerald-950 block">
                {subnet.lastUsableIp}
              </span>
            </div>
          </div>

          {/* Binary Alignment Table */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-black flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-blue-600" /> 32-Bit Binary Alignment
            </h4>
            <div className="p-4 bg-gray-900 text-gray-100 rounded-xl font-mono text-xs overflow-x-auto border-2 border-black space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400 w-24">IP Address:</span>
                <span className="text-blue-300 font-bold">{subnet.ipBinary}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400 w-24">Subnet Mask:</span>
                <span className="text-yellow-300 font-bold">{subnet.netmaskBinary}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-700 pt-1">
                <span className="text-gray-400 w-24">Network ID:</span>
                <span className="text-green-300 font-bold">{subnet.networkBinary}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400 w-24">Broadcast:</span>
                <span className="text-rose-300 font-bold">{subnet.broadcastBinary}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-4 border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center text-gray-500 font-bold">
          Enter a valid IPv4 address to calculate subnet ranges.
        </div>
      )}
    </div>
  );
}
