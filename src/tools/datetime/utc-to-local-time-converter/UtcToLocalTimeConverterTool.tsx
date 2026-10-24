"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Globe,
  Clock,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface UtcLocalSuccess {
  utcFull: string;
  utcIso: string;
  localFull: string;
  local24h: string;
  offsetFormatted: string;
  epochSeconds: number;
  serverLogFormat: string;
}

export default function UtcToLocalTimeConverterTool() {
  const [direction, setDirection] = useState<"utcToLocal" | "localToUtc">("utcToLocal");

  // Date and Time state
  const [inputDateTime, setInputDateTime] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}T${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // User local timezone
  const userLocalTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  // Conversion calculations
  const conversion = useMemo<({ error: string } | ({ error?: never } & UtcLocalSuccess)) | null>(() => {
    if (!inputDateTime) return null;

    try {
      let utcDate: Date;
      let localDate: Date;

      if (direction === "utcToLocal") {
        // Input is UTC
        utcDate = new Date(`${inputDateTime}:00Z`);
        localDate = new Date(utcDate.getTime());
      } else {
        // Input is Local
        localDate = new Date(inputDateTime);
        utcDate = new Date(localDate.getTime());
      }

      if (isNaN(utcDate.getTime())) {
        return { error: "Please enter a valid date and time string." };
      }

      // Format UTC representations
      const utcFull = utcDate.toUTCString();
      const utcIso = utcDate.toISOString();

      // Format Local representations
      const localFull = new Intl.DateTimeFormat("en-US", {
        timeZone: userLocalTz,
        dateStyle: "full",
        timeStyle: "medium",
      }).format(localDate);

      const local24h = new Intl.DateTimeFormat("en-US", {
        timeZone: userLocalTz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(localDate);

      // Local offset
      const offsetMin = -localDate.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offsetMin) / 60);
      const offsetRem = Math.abs(offsetMin) % 60;
      const offsetSign = offsetMin >= 0 ? "+" : "-";
      const offsetFormatted = `UTC${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetRem).padStart(2, "0")}`;

      // Server Log Format (Common Log Format: 20/Oct/2026:09:09:44 +0000)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const pad = (n: number) => String(n).padStart(2, "0");
      const serverLogFormat = `${pad(utcDate.getUTCDate())}/${months[utcDate.getUTCMonth()]}/${utcDate.getUTCFullYear()}:${pad(utcDate.getUTCHours())}:${pad(utcDate.getUTCMinutes())}:${pad(utcDate.getUTCSeconds())} +0000`;

      return {
        utcFull,
        utcIso,
        localFull,
        local24h,
        offsetFormatted,
        epochSeconds: Math.floor(utcDate.getTime() / 1000),
        serverLogFormat,
      };
    } catch {
      return { error: "Failed to parse date." };
    }
  }, [inputDateTime, direction, userLocalTz]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSetCurrentUtc = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    if (direction === "utcToLocal") {
      setInputDateTime(`${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}T${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`);
    } else {
      setInputDateTime(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0D9488] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              UTC to Local Time Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Convert universal UTC timestamps, server logs, and ISO strings to your local timezone
            </p>
          </div>
        </div>

        <button
          onClick={handleSetCurrentUtc}
          className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Set to Right Now
        </button>
      </div>

      {/* Direction Switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDirection("utcToLocal")}
          className={`px-4 py-2 text-xs font-black uppercase border-3 border-black transition-all ${
            direction === "utcToLocal"
              ? "bg-[#0D9488] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-0.5"
              : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          UTC / GMT &rarr; Local Time ({userLocalTz})
        </button>
        <button
          onClick={() => setDirection("localToUtc")}
          className={`px-4 py-2 text-xs font-black uppercase border-3 border-black transition-all ${
            direction === "localToUtc"
              ? "bg-[#0D9488] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-0.5"
              : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          Local Time ({userLocalTz}) &rarr; UTC / GMT
        </button>
      </div>

      {/* Input Section */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0D9488]" />
            Enter {direction === "utcToLocal" ? "UTC / GMT Time" : "Local Time"}:
          </label>
          <input
            type="datetime-local"
            value={inputDateTime}
            onChange={(e) => setInputDateTime(e.target.value)}
            className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
          />
        </div>

        <div className="text-[11px] font-bold text-gray-500">
          Your browser location is mapped to timezone: <strong className="text-black font-mono">{userLocalTz}</strong>
        </div>
      </div>

      {/* Error Callout */}
      {conversion?.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase">Input Error</h3>
            <p className="text-xs font-bold text-red-800 mt-0.5">{conversion.error}</p>
          </div>
        </div>
      )}

      {/* Output Grid */}
      {conversion && !("error" in conversion) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Converted Target Time */}
          <div className="bg-[#FEF08A] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="text-xs font-black uppercase text-gray-700">
                {direction === "utcToLocal" ? `Local Time (${userLocalTz})` : "Universal UTC Time"}
              </div>
              <div className="text-xl sm:text-2xl font-black text-black mt-1 font-mono">
                {direction === "utcToLocal" ? conversion.localFull : conversion.utcFull}
              </div>
              <div className="text-xs font-bold text-gray-700 mt-1">
                Offset: {conversion.offsetFormatted}
              </div>
            </div>

            <div className="pt-3 border-t border-black/15 flex justify-end mt-3">
              <button
                onClick={() =>
                  handleCopy(
                    direction === "utcToLocal" ? conversion.localFull : conversion.utcFull,
                    "main"
                  )
                }
                className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
              >
                {copiedKey === "main" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "main" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* ISO 8601 String */}
          <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="text-xs font-black uppercase text-gray-600">ISO 8601 (Universal Standard)</div>
              <div className="text-lg font-black font-mono text-black mt-1 break-words">
                {conversion.utcIso}
              </div>
            </div>

            <div className="pt-3 border-t border-black/15 flex justify-end mt-3">
              <button
                onClick={() => handleCopy(conversion.utcIso, "iso")}
                className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
              >
                {copiedKey === "iso" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "iso" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* 24-Hour Military Format */}
          <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="text-xs font-black uppercase text-gray-600">24-Hour Datetime</div>
              <div className="text-lg font-black font-mono text-black mt-1">
                {conversion.local24h}
              </div>
            </div>

            <div className="pt-3 border-t border-black/15 flex justify-end mt-3">
              <button
                onClick={() => handleCopy(conversion.local24h, "24h")}
                className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
              >
                {copiedKey === "24h" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "24h" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Common Web Server Log Timestamp */}
          <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="text-xs font-black uppercase text-gray-600">Nginx / Apache Server Log Format</div>
              <div className="text-lg font-black font-mono text-black mt-1 break-words">
                {conversion.serverLogFormat}
              </div>
            </div>

            <div className="pt-3 border-t border-black/15 flex justify-end mt-3">
              <button
                onClick={() => handleCopy(conversion.serverLogFormat, "log")}
                className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
              >
                {copiedKey === "log" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "log" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
