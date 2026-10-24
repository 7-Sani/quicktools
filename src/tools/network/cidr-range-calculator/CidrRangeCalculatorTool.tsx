"use client";

import React, { useState, useMemo } from "react";
import { cidrToMaskInt, intToIp, isValidIPv4, calculateSubnet } from "@/lib/networkUtils";
import { Hash, Search, Copy, Check, Info, Sliders } from "lucide-react";

export default function CidrRangeCalculatorTool() {
  const [selectedCidr, setSelectedCidr] = useState<number>(24);
  const [baseIp, setBaseIp] = useState<string>("10.0.0.0");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const cidrTable = useMemo(() => {
    return Array.from({ length: 33 }, (_, i) => {
      const c = i;
      const maskInt = cidrToMaskInt(c);
      const maskStr = intToIp(maskInt);
      const wildcardStr = intToIp((~maskInt) >>> 0);
      const total = Math.pow(2, 32 - c);
      let usable = 0;
      if (c === 32) usable = 1;
      else if (c === 31) usable = 2;
      else usable = Math.max(0, total - 2);

      let classNote = "Subnet";
      if (c === 8) classNote = "Class A (Default)";
      else if (c === 16) classNote = "Class B (Default)";
      else if (c === 24) classNote = "Class C (Default)";
      else if (c === 31) classNote = "Point-to-Point (RFC 3021)";
      else if (c === 32) classNote = "Single Host (/32)";

      return {
        cidr: c,
        mask: maskStr,
        wildcard: wildcardStr,
        total,
        usable,
        classNote,
      };
    });
  }, []);

  const activeSubnet = useMemo(() => {
    const validIp = isValidIPv4(baseIp) ? baseIp : "10.0.0.0";
    return calculateSubnet(validIp, selectedCidr);
  }, [baseIp, selectedCidr]);

  const filteredTable = useMemo(() => {
    if (!searchFilter.trim()) return cidrTable;
    const q = searchFilter.toLowerCase();
    return cidrTable.filter(
      (row) =>
        row.cidr.toString().includes(q) ||
        row.mask.includes(q) ||
        row.classNote.toLowerCase().includes(q) ||
        row.usable.toString().includes(q)
    );
  }, [cidrTable, searchFilter]);

  const copyRow = (row: typeof cidrTable[0]) => {
    const text = `/${row.cidr} - Netmask: ${row.mask} - Usable Hosts: ${row.usable.toLocaleString()} - Total IPs: ${row.total.toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Interactive Inspector */}
      <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <Hash className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-black">CIDR Prefix Inspector</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-5">
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Base IP Address (Optional)
            </label>
            <input
              type="text"
              value={baseIp}
              onChange={(e) => setBaseIp(e.target.value.trim())}
              placeholder="e.g. 10.0.0.0 or 192.168.0.0"
              className="w-full px-4 py-2.5 border-2 border-black rounded-xl font-mono font-bold bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="md:col-span-7">
            <div className="flex justify-between items-center text-sm font-bold mb-1">
              <span>Select CIDR Prefix:</span>
              <span className="font-mono text-blue-700 font-black text-lg">/{selectedCidr}</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              value={selectedCidr}
              onChange={(e) => setSelectedCidr(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Selected CIDR Quick Cards */}
        {activeSubnet && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border-2 border-black rounded-xl bg-blue-50/50">
            <div>
              <span className="text-[11px] font-bold text-gray-600 block uppercase">Subnet Mask</span>
              <span className="font-mono font-black text-base text-gray-900">{activeSubnet.netmask}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-600 block uppercase">Usable Hosts</span>
              <span className="font-mono font-black text-base text-blue-700">
                {activeSubnet.usableHosts.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-600 block uppercase">Network Address</span>
              <span className="font-mono font-black text-base text-gray-900">{activeSubnet.networkAddress}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-600 block uppercase">Broadcast Address</span>
              <span className="font-mono font-black text-base text-gray-900">{activeSubnet.broadcastAddress}</span>
            </div>
          </div>
        )}
      </div>

      {/* Complete CIDR Lookup Table */}
      <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-3">
          <h3 className="text-xl font-black">Complete IPv4 CIDR Reference Table (/0 to /32)</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search prefix, mask, hosts..."
              className="w-full pl-9 pr-3 py-1.5 border-2 border-black rounded-xl font-bold text-xs bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto border-2 border-black rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 border-b-2 border-black sticky top-0 font-black uppercase">
              <tr>
                <th className="py-2.5 px-3">CIDR</th>
                <th className="py-2.5 px-3">Subnet Mask</th>
                <th className="py-2.5 px-3">Wildcard Mask</th>
                <th className="py-2.5 px-3">Usable Hosts</th>
                <th className="py-2.5 px-3">Total Addresses</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {filteredTable.map((row) => (
                <tr
                  key={row.cidr}
                  className={`hover:bg-blue-50/50 ${
                    row.cidr === selectedCidr ? "bg-blue-100/60 font-bold" : ""
                  }`}
                >
                  <td className="py-2 px-3 text-blue-700 font-black">/{row.cidr}</td>
                  <td className="py-2 px-3 font-semibold">{row.mask}</td>
                  <td className="py-2 px-3 text-gray-600">{row.wildcard}</td>
                  <td className="py-2 px-3 font-bold text-emerald-800">
                    {row.usable.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-gray-700">{row.total.toLocaleString()}</td>
                  <td className="py-2 px-3 font-sans text-[11px] text-gray-600">{row.classNote}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedCidr(row.cidr);
                        copyRow(row);
                      }}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-blue-100 border border-black rounded text-[10px] font-bold"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
