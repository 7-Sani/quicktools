"use client";

import React, { useState, useMemo } from "react";
import {
  HardDrive,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Wifi,
  Disc,
} from "lucide-react";

type UnitKey =
  | "b"
  | "B"
  | "KB"
  | "KiB"
  | "MB"
  | "MiB"
  | "GB"
  | "GiB"
  | "TB"
  | "TiB"
  | "PB"
  | "PiB";

interface UnitDef {
  key: UnitKey;
  label: string;
  name: string;
  standard: "SI (Decimal)" | "IEC (Binary)" | "Bit";
  bytesFactor: number; // multiplier to convert to bytes
}

const UNITS: UnitDef[] = [
  { key: "b", label: "b", name: "Bit", standard: "Bit", bytesFactor: 1 / 8 },
  { key: "B", label: "B", name: "Byte", standard: "SI (Decimal)", bytesFactor: 1 },
  { key: "KB", label: "KB", name: "Kilobyte (1,000 B)", standard: "SI (Decimal)", bytesFactor: 1e3 },
  { key: "KiB", label: "KiB", name: "Kibibyte (1,024 B)", standard: "IEC (Binary)", bytesFactor: 1024 },
  { key: "MB", label: "MB", name: "Megabyte (1,000 KB)", standard: "SI (Decimal)", bytesFactor: 1e6 },
  { key: "MiB", label: "MiB", name: "Mebibyte (1,024 KiB)", standard: "IEC (Binary)", bytesFactor: Math.pow(1024, 2) },
  { key: "GB", label: "GB", name: "Gigabyte (1,000 MB)", standard: "SI (Decimal)", bytesFactor: 1e9 },
  { key: "GiB", label: "GiB", name: "Gibibyte (1,024 MiB)", standard: "IEC (Binary)", bytesFactor: Math.pow(1024, 3) },
  { key: "TB", label: "TB", name: "Terabyte (1,000 GB)", standard: "SI (Decimal)", bytesFactor: 1e12 },
  { key: "TiB", label: "TiB", name: "Tebibyte (1,024 GiB)", standard: "IEC (Binary)", bytesFactor: Math.pow(1024, 4) },
  { key: "PB", label: "PB", name: "Petabyte (1,000 TB)", standard: "SI (Decimal)", bytesFactor: 1e15 },
  { key: "PiB", label: "PiB", name: "Pebibyte (1,024 TiB)", standard: "IEC (Binary)", bytesFactor: Math.pow(1024, 5) },
];

const PRESETS = [
  { label: "1.44 MB (Floppy)", value: 1.44, unit: "MB" as UnitKey },
  { label: "700 MB (CD-ROM)", value: 700, unit: "MB" as UnitKey },
  { label: "4.7 GB (DVD)", value: 4.7, unit: "GB" as UnitKey },
  { label: "16 GiB (RAM)", value: 16, unit: "GiB" as UnitKey },
  { label: "1 TB (SSD)", value: 1, unit: "TB" as UnitKey },
];

export default function FileSizeConverterTool() {
  const [inputValue, setInputValue] = useState<string>("10");
  const [inputUnit, setInputUnit] = useState<UnitKey>("GB");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Total bytes
  const totalBytes = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0) return 0;
    const unitDef = UNITS.find((u) => u.key === inputUnit);
    if (!unitDef) return 0;
    return num * unitDef.bytesFactor;
  }, [inputValue, inputUnit]);

  // Conversion table
  const convertedValues = useMemo(() => {
    return UNITS.map((unit) => {
      const val = totalBytes / unit.bytesFactor;
      let formatted = "";
      if (val === 0) {
        formatted = "0";
      } else if (val < 0.000001 || val > 1e15) {
        formatted = val.toExponential(4);
      } else if (Number.isInteger(val)) {
        formatted = val.toLocaleString();
      } else {
        formatted = val.toLocaleString(undefined, { maximumFractionDigits: 4 });
      }

      return {
        ...unit,
        raw: val,
        formatted,
      };
    });
  }, [totalBytes]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Transfer speeds
  const transferEstimates = useMemo(() => {
    if (totalBytes <= 0) return [];
    const totalBits = totalBytes * 8;

    const speeds = [
      { name: "Mobile 4G (LTE)", bps: 25 * 1e6 },
      { name: "Broadband 100 Mbps", bps: 100 * 1e6 },
      { name: "5G Ultra Wideband", bps: 300 * 1e6 },
      { name: "Gigabit Fiber (1 Gbps)", bps: 1000 * 1e6 },
      { name: "10G Datacenter", bps: 10000 * 1e6 },
    ];

    return speeds.map((s) => {
      const seconds = totalBits / s.bps;
      let timeStr = "";
      if (seconds < 1) {
        timeStr = "< 1 second";
      } else if (seconds < 60) {
        timeStr = `${Math.round(seconds)} seconds`;
      } else if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        const remSecs = Math.round(seconds % 60);
        timeStr = `${mins}m ${remSecs}s`;
      } else {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.round((seconds % 3600) / 60);
        timeStr = `${hrs}h ${mins}m`;
      }

      return {
        name: s.name,
        timeStr,
      };
    });
  }, [totalBytes]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0284C7] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              File Size Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Convert between decimal (SI), binary (IEC), and bits with transfer speed estimates
            </p>
          </div>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setInputValue(String(p.value));
                setInputUnit(p.unit);
              }}
              className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-100 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Converter Section */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-[#0284C7]" />
          Input Value &amp; Source Unit
        </label>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <input
            type="number"
            min="0"
            step="any"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 1024"
            className="flex-1 font-mono text-base font-black p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black"
          />

          <select
            value={inputUnit}
            onChange={(e) => setInputUnit(e.target.value as UnitKey)}
            className="w-full sm:w-64 font-black text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer focus:outline-none"
          >
            {UNITS.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label} - {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Converted Values Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase text-black flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#0284C7]" />
          Instant Conversions Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {convertedValues.map((unit) => {
            const isSource = unit.key === inputUnit;
            return (
              <div
                key={unit.key}
                className={`border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between transition-all ${
                  isSource ? "bg-[#FEF08A]" : "bg-[#FAF8F5]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black uppercase text-gray-700">
                      {unit.name} ({unit.label})
                    </span>
                    <span className="text-[10px] font-black uppercase bg-white px-1.5 py-0.5 border border-black">
                      {unit.standard}
                    </span>
                  </div>

                  <div
                    className="font-mono text-lg font-black text-black break-words my-2"
                    title={unit.formatted}
                  >
                    {unit.formatted} {unit.label}
                  </div>
                </div>

                <div className="pt-2 border-t border-black/20 flex justify-end">
                  <button
                    onClick={() => handleCopy(`${unit.formatted} ${unit.label}`, unit.key)}
                    className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black hover:bg-gray-100 flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {copiedKey === unit.key ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedKey === unit.key ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Download / Transfer Estimations */}
      {totalBytes > 0 && (
        <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <h3 className="text-sm font-black uppercase text-black flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#0284C7]" />
            Estimated Download / Transfer Duration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {transferEstimates.map((est, i) => (
              <div
                key={i}
                className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="text-[11px] font-black uppercase text-gray-500">{est.name}</div>
                <div className="text-base font-black text-[#0284C7] mt-1">{est.timeStr}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clarifying info box */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs text-gray-700 font-bold space-y-1">
        <p>
          <strong className="text-black uppercase">Decimal vs Binary Notice:</strong> Storage manufacturers (HDDs, SSDs, USB drives) typically use decimal units (1 GB = 1,000,000,000 bytes), while operating systems like Windows calculate file sizes in binary units (1 GiB = 1,073,741,824 bytes). This explains why a 1 TB drive shows up as ~931 GiB in Windows Explorer.
        </p>
      </div>
    </div>
  );
}
