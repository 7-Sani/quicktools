"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Globe2,
  Clock,
  AlertTriangle,
  Settings2,
} from "lucide-react";

const MAJOR_TIMEZONES = [
  { label: "My Local Timezone", value: "LOCAL" },
  { label: "UTC / GMT", value: "UTC" },
  { label: "London (GMT / BST)", value: "Europe/London" },
  { label: "Paris / Berlin / Rome (CET / CEST)", value: "Europe/Paris" },
  { label: "New York (EST / EDT)", value: "America/New_York" },
  { label: "Chicago (CST / CDT)", value: "America/Chicago" },
  { label: "Los Angeles / San Francisco (PST / PDT)", value: "America/Los_Angeles" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Singapore / Hong Kong / Beijing (SGT / CST)", value: "Asia/Singapore" },
  { label: "India / Mumbai / Delhi (IST)", value: "Asia/Kolkata" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
  { label: "Sydney / Melbourne (AEST / AEDT)", value: "Australia/Sydney" },
  { label: "Auckland (NZST / NZDT)", value: "Pacific/Auckland" },
  { label: "Sao Paulo (BRT)", value: "America/Sao_Paulo" },
];

export default function TimestampToDateConverterTool() {
  const [inputTimestamp, setInputTimestamp] = useState<string>(() =>
    String(Math.floor(Date.now() / 1000))
  );
  const [unitMode, setUnitMode] = useState<"auto" | "s" | "ms">("auto");
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>("LOCAL");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active timezone
  const effectiveTimeZone = useMemo(() => {
    if (selectedTimeZone === "LOCAL") {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      } catch {
        return "UTC";
      }
    }
    return selectedTimeZone;
  }, [selectedTimeZone]);

  // Parse Timestamp
  const parsedData = useMemo(() => {
    const raw = inputTimestamp.trim();
    if (!raw) return { isValid: false, error: null, date: null, unit: "seconds" };

    if (!/^-?\d+$/.test(raw)) {
      return { isValid: false, error: "Please enter a valid numerical Unix timestamp.", date: null, unit: "seconds" };
    }

    const num = Number(raw);
    let ms = num;
    let unitName = "seconds";

    if (unitMode === "s") {
      ms = num * 1000;
      unitName = "seconds";
    } else if (unitMode === "ms") {
      ms = num;
      unitName = "milliseconds";
    } else {
      if (Math.abs(num) >= 1e11) {
        ms = num;
        unitName = "milliseconds";
      } else {
        ms = num * 1000;
        unitName = "seconds";
      }
    }

    const d = new Date(ms);
    if (isNaN(d.getTime())) {
      return { isValid: false, error: "Timestamp value is out of valid calendar bounds.", date: null, unit: unitName };
    }

    return { isValid: true, error: null, date: d, unit: unitName };
  }, [inputTimestamp, unitMode]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate All Formats for Target Timezone
  const formats = useMemo(() => {
    const d = parsedData.date;
    if (!d) return null;

    const tz = effectiveTimeZone;

    const fullLocale = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      dateStyle: "full",
      timeStyle: "long",
    }).format(d);

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(d);

    const partMap: Record<string, string> = {};
    parts.forEach((p) => {
      partMap[p.type] = p.value;
    });

    const y = partMap.year || "1970";
    const m = partMap.month || "01";
    const day = partMap.day || "01";
    const hour = partMap.hour || "00";
    const min = partMap.minute || "00";
    const sec = partMap.second || "00";

    const isoDate = `${y}-${m}-${day}`;
    const sqlDateTime = `${y}-${m}-${day} ${hour}:${min}:${sec}`;
    const usFormat = `${m}/${day}/${y} ${hour}:${min}:${sec}`;
    const euFormat = `${day}/${m}/${y} ${hour}:${min}:${sec}`;

    // Relative elapsed time
    const now = Date.now();
    const diffSec = Math.round((d.getTime() - now) / 1000);
    const absSec = Math.abs(diffSec);
    let relative = "";
    if (absSec < 60) {
      relative = diffSec < 0 ? `${absSec}s ago` : `in ${absSec}s`;
    } else if (absSec < 3600) {
      const mins = Math.floor(absSec / 60);
      relative = diffSec < 0 ? `${mins}m ago` : `in ${mins}m`;
    } else if (absSec < 86400) {
      const hrs = Math.floor(absSec / 3600);
      relative = diffSec < 0 ? `${hrs}h ago` : `in ${hrs}h`;
    } else {
      const days = Math.floor(absSec / 86400);
      relative = diffSec < 0 ? `${days}d ago` : `in ${days}d`;
    }

    return [
      { label: "Target Timezone Date & Time", value: fullLocale, key: "full" },
      { label: "SQL Datetime (YYYY-MM-DD HH:mm:ss)", value: sqlDateTime, key: "sql" },
      { label: "ISO 8601 (UTC Standard)", value: d.toISOString(), key: "iso" },
      { label: "RFC 2822 (Web / HTTP Header)", value: d.toUTCString(), key: "rfc" },
      { label: "US Format (MM/DD/YYYY)", value: usFormat, key: "us" },
      { label: "European / International (DD/MM/YYYY)", value: euFormat, key: "eu" },
      { label: "Date Only (YYYY-MM-DD)", value: isoDate, key: "dateOnly" },
      { label: "Time Only (24-Hour HH:mm:ss)", value: `${hour}:${min}:${sec}`, key: "timeOnly" },
      { label: "Relative Duration", value: relative, key: "rel" },
    ];
  }, [parsedData.date, effectiveTimeZone]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0D9488] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Timestamp to Date Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Convert numeric Unix timestamps into readable international date formats and world timezones
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setInputTimestamp(String(Math.floor(Date.now() / 1000)))}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none"
          >
            Current Time
          </button>
          <button
            onClick={() => {
              const startOfToday = new Date();
              startOfToday.setHours(0, 0, 0, 0);
              setInputTimestamp(String(Math.floor(startOfToday.getTime() / 1000)));
            }}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none"
          >
            Start of Today
          </button>
          <button
            onClick={() => setInputTimestamp("0")}
            className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
          >
            Unix Epoch (1970)
          </button>
        </div>
      </div>

      {/* Input & Timezone Controls */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Timestamp Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#0D9488]" />
              Unix Timestamp Input:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputTimestamp}
                onChange={(e) => setInputTimestamp(e.target.value)}
                placeholder="e.g. 1771408000"
                className="flex-1 font-mono text-sm font-bold p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black"
              />
              <select
                value={unitMode}
                onChange={(e: any) => setUnitMode(e.target.value)}
                className="font-black text-xs p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                <option value="auto">Auto ({parsedData.unit})</option>
                <option value="s">Seconds</option>
                <option value="ms">Milliseconds</option>
              </select>
            </div>
          </div>

          {/* Target Timezone Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-[#0D9488]" />
              Target Display Timezone:
            </label>
            <select
              value={selectedTimeZone}
              onChange={(e) => setSelectedTimeZone(e.target.value)}
              className="w-full font-black text-xs p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer focus:outline-none"
            >
              {MAJOR_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <div className="text-[11px] font-bold text-gray-500">
              Active Timezone: <strong className="text-black font-mono">{effectiveTimeZone}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Error Callout */}
      {parsedData.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase">Input Error</h3>
            <p className="text-xs font-bold text-red-800 mt-0.5">{parsedData.error}</p>
          </div>
        </div>
      )}

      {/* Converted Formats Grid */}
      {formats && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-black">
            Converted International Representations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formats.map((fmt) => (
              <div
                key={fmt.key}
                className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-600 mb-1">
                    {fmt.label}
                  </div>
                  <div className="font-mono text-sm font-black text-black break-words select-all">
                    {fmt.value}
                  </div>
                </div>

                <div className="pt-2 border-t border-black/15 flex justify-end mt-2">
                  <button
                    onClick={() => handleCopy(fmt.value, fmt.key)}
                    className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
                  >
                    {copiedKey === fmt.key ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-black" />
                    )}
                    {copiedKey === fmt.key ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
