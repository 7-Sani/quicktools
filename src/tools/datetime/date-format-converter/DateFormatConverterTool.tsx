"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarCheck2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  Settings2,
  AlertTriangle,
} from "lucide-react";

const SAMPLES = [
  { label: "ISO 8601", value: "2026-10-20T14:39:44Z" },
  { label: "US Format", value: "10/20/2026 02:39 PM" },
  { label: "European", value: "20/10/2026 14:39:44" },
  { label: "Human Words", value: "October 20, 2026 2:39 PM" },
  { label: "SQL Datetime", value: "2026-10-20 14:39:44" },
];

// Custom token formatter
function formatWithTokens(d: Date, pattern: string): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ampm = hours24 >= 12 ? "PM" : "AM";

  const monthNamesLong = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthNamesShort = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const dayNamesLong = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];
  const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return pattern
    .replace(/YYYY/g, String(year))
    .replace(/YY/g, String(year).slice(-2))
    .replace(/MMMM/g, monthNamesLong[d.getMonth()])
    .replace(/MMM/g, monthNamesShort[d.getMonth()])
    .replace(/MM/g, pad(month))
    .replace(/M\b/g, String(month))
    .replace(/dddd/g, dayNamesLong[d.getDay()])
    .replace(/ddd/g, dayNamesShort[d.getDay()])
    .replace(/DD/g, pad(date))
    .replace(/D\b/g, String(date))
    .replace(/HH/g, pad(hours24))
    .replace(/H\b/g, String(hours24))
    .replace(/hh/g, pad(hours12))
    .replace(/h\b/g, String(hours12))
    .replace(/mm/g, pad(minutes))
    .replace(/m\b/g, String(minutes))
    .replace(/ss/g, pad(seconds))
    .replace(/s\b/g, String(seconds))
    .replace(/A/g, ampm)
    .replace(/a/g, ampm.toLowerCase());
}

export default function DateFormatConverterTool() {
  const [inputDateStr, setInputDateStr] = useState<string>("2026-10-20T14:39:44");
  const [customPattern, setCustomPattern] = useState<string>("YYYY-MM-DD [at] hh:mm A");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Parsing date
  const parsed = useMemo(() => {
    const raw = inputDateStr.trim();
    if (!raw) return { isValid: false, error: null, date: null };

    // Check if European DD/MM/YYYY or DD.MM.YYYY
    let d: Date;
    if (/^\d{1,2}[/.-]\d{1,2}[/.-]\d{4}/.test(raw)) {
      const parts = raw.split(/[/.-]/);
      const day = Number(parts[0]);
      const month = Number(parts[1]);
      const yearWithRest = parts[2].split(" ");
      const year = Number(yearWithRest[0]);
      const rest = yearWithRest.slice(1).join(" ");

      if (day > 12 && month <= 12) {
        // Definitely DD/MM/YYYY
        d = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${rest}`.trim());
      } else {
        d = new Date(raw);
      }
    } else {
      d = new Date(raw);
    }

    if (isNaN(d.getTime())) {
      return { isValid: false, error: "Unable to parse this date format. Check your input syntax.", date: null };
    }

    return { isValid: true, error: null, date: d };
  }, [inputDateStr]);

  // Generate All Output Formats
  const outputFormats = useMemo(() => {
    const d = parsed.date;
    if (!d) return [];

    const pad = (n: number) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const h24 = pad(d.getHours());
    const min = pad(d.getMinutes());
    const sec = pad(d.getSeconds());

    // Day of year
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 3600 * 1000)) + 1;
    const weekNumber = Math.ceil(dayOfYear / 7);

    return [
      { label: "ISO 8601 (Universal UTC)", value: d.toISOString(), key: "iso" },
      { label: "SQL Datetime (YYYY-MM-DD HH:mm:ss)", value: `${y}-${m}-${day} ${h24}:${min}:${sec}`, key: "sql" },
      { label: "US Format (MM/DD/YYYY)", value: `${m}/${day}/${y}`, key: "us" },
      { label: "European Format (DD/MM/YYYY)", value: `${day}/${m}/${y}`, key: "eu" },
      { label: "Dotted Date (DD.MM.YYYY)", value: `${day}.${m}.${y}`, key: "dot" },
      { label: "RFC 2822 / HTTP Header", value: d.toUTCString(), key: "rfc" },
      {
        label: "Full Written Date",
        value: d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        key: "written",
      },
      {
        label: "Short Written Date",
        value: d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
        key: "shortWritten",
      },
      {
        label: "12-Hour Time with AM/PM",
        value: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }),
        key: "time12",
      },
      { label: "24-Hour Military Time", value: `${h24}:${min}:${sec}`, key: "time24" },
      { label: "Unix Epoch (Seconds)", value: String(Math.floor(d.getTime() / 1000)), key: "epochSec" },
      { label: "Unix Epoch (Milliseconds)", value: String(d.getTime()), key: "epochMs" },
      { label: "Calendar Position", value: `Day ${dayOfYear} of 365 (Week ${weekNumber})`, key: "calPos" },
    ];
  }, [parsed.date]);

  // Custom output evaluation
  const customOutput = useMemo(() => {
    if (!parsed.date) return "";
    return formatWithTokens(parsed.date, customPattern);
  }, [parsed.date, customPattern]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0D9488] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Date Format Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Parse any date notation and transform it into standard formats or custom template tokens
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {SAMPLES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setInputDateStr(s.value)}
              className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-100 transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0D9488]" />
              Enter Date String (Any Format):
            </label>
            <button
              onClick={() => {
                const now = new Date();
                const pad = (n: number) => String(n).padStart(2, "0");
                setInputDateStr(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
              }}
              className="text-[10px] font-black uppercase underline hover:text-[#0D9488]"
            >
              Use Current Time
            </button>
          </div>
          <input
            type="text"
            value={inputDateStr}
            onChange={(e) => setInputDateStr(e.target.value)}
            placeholder="e.g. 2026-10-20T14:39:44, 10/20/2026, or October 20, 2026"
            className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
          />
        </div>
      </div>

      {/* Error Callout */}
      {parsed.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase">Invalid Date Input</h3>
            <p className="text-xs font-bold text-red-800 mt-0.5">{parsed.error}</p>
          </div>
        </div>
      )}

      {/* Custom Token Builder */}
      {parsed.date && (
        <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-[#0D9488]" />
              Custom Format Pattern Builder
            </h3>
            <div className="text-[10px] font-bold text-gray-500">
              Tokens: YYYY, MM, DD, MMMM, dddd, hh, mm, ss, A
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <input
              type="text"
              value={customPattern}
              onChange={(e) => setCustomPattern(e.target.value)}
              placeholder="e.g. YYYY-MM-DD hh:mm A"
              className="flex-1 font-mono text-sm font-bold p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
            <div className="flex items-center gap-2 bg-[#FEF08A] px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-mono font-black text-sm text-black">{customOutput}</span>
              <button
                onClick={() => handleCopy(customOutput, "custom")}
                className="p-1 bg-white border border-black hover:bg-gray-100 ml-1"
                title="Copy custom formatted string"
              >
                {copiedKey === "custom" ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-black" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Output Grid */}
      {outputFormats.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-black">
            Standard Format Matrix
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outputFormats.map((fmt) => (
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
