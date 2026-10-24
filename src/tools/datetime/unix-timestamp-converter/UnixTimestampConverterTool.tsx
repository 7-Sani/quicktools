"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  Globe,
  Play,
  Pause,
  ArrowRightLeft,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function UnixTimestampConverterTool() {
  // Live ticker
  const [liveEpoch, setLiveEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [tickerActive, setTickerActive] = useState<boolean>(true);

  // Conversion mode: "timestampToDate" | "dateToTimestamp"
  const [mode, setMode] = useState<"timestampToDate" | "dateToTimestamp">("timestampToDate");

  // Timestamp to Date inputs
  const [inputTimestamp, setInputTimestamp] = useState<string>(String(Math.floor(Date.now() / 1000)));
  const [unitMode, setUnitMode] = useState<"auto" | "seconds" | "milliseconds">("auto");

  // Date to Timestamp inputs
  const [inputDateTime, setInputDateTime] = useState<string>(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [dateIsUtc, setDateIsUtc] = useState<boolean>(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live ticker interval
  useEffect(() => {
    if (!tickerActive) return;
    const interval = setInterval(() => {
      setLiveEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [tickerActive]);

  // Detected user local timezone
  const userTimeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  // Parse Timestamp to Date
  const timestampConversion = useMemo(() => {
    const raw = inputTimestamp.trim();
    if (!raw) {
      return { isValid: false, error: null, date: null, unit: "seconds" };
    }

    if (!/^-?\d+$/.test(raw)) {
      return { isValid: false, error: "Please enter a valid numeric Unix timestamp.", date: null, unit: "seconds" };
    }

    const num = Number(raw);
    let ms = num;
    let detectedUnit: "seconds" | "milliseconds" = "seconds";

    if (unitMode === "seconds") {
      ms = num * 1000;
      detectedUnit = "seconds";
    } else if (unitMode === "milliseconds") {
      ms = num;
      detectedUnit = "milliseconds";
    } else {
      // Auto: if length >= 12 digits, treat as ms
      if (Math.abs(num) >= 1e11) {
        ms = num;
        detectedUnit = "milliseconds";
      } else {
        ms = num * 1000;
        detectedUnit = "seconds";
      }
    }

    const d = new Date(ms);
    if (isNaN(d.getTime())) {
      return { isValid: false, error: "Timestamp value is out of valid calendar range.", date: null, unit: detectedUnit };
    }

    return { isValid: true, error: null, date: d, unit: detectedUnit };
  }, [inputTimestamp, unitMode]);

  // Parse Date to Timestamp
  const dateToTimestampConversion = useMemo(() => {
    if (!inputDateTime) return null;
    try {
      let d: Date;
      if (dateIsUtc) {
        // append Z to treat as UTC
        d = new Date(`${inputDateTime}:00Z`);
      } else {
        d = new Date(inputDateTime);
      }

      if (isNaN(d.getTime())) return null;

      const sec = Math.floor(d.getTime() / 1000);
      const ms = d.getTime();

      return {
        seconds: sec,
        milliseconds: ms,
        iso: d.toISOString(),
        utc: d.toUTCString(),
      };
    } catch {
      return null;
    }
  }, [inputDateTime, dateIsUtc]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Calculations on parsed date
  const dateDetails = useMemo(() => {
    const d = timestampConversion.date;
    if (!d) return null;

    // Relative calculation
    const now = Date.now();
    const diffSec = Math.round((d.getTime() - now) / 1000);
    let relative = "";
    const absSec = Math.abs(diffSec);

    if (absSec < 5) {
      relative = "Just now";
    } else if (absSec < 60) {
      relative = diffSec < 0 ? `${absSec} seconds ago` : `in ${absSec} seconds`;
    } else if (absSec < 3600) {
      const m = Math.floor(absSec / 60);
      relative = diffSec < 0 ? `${m} minute${m > 1 ? "s" : ""} ago` : `in ${m} minute${m > 1 ? "s" : ""}`;
    } else if (absSec < 86400) {
      const h = Math.floor(absSec / 3600);
      relative = diffSec < 0 ? `${h} hour${h > 1 ? "s" : ""} ago` : `in ${h} hour${h > 1 ? "s" : ""}`;
    } else {
      const days = Math.floor(absSec / 86400);
      relative = diffSec < 0 ? `${days} day${days > 1 ? "s" : ""} ago` : `in ${days} day${days > 1 ? "s" : ""}`;
    }

    // Day of year
    const startOfYear = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000) + 1;

    // Leap year
    const year = d.getUTCFullYear();
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

    // Local string with user timezone
    const localStr = d.toLocaleString(undefined, {
      dateStyle: "full",
      timeStyle: "long",
    });

    // Timezone offset
    const offsetMin = -d.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMin) / 60);
    const offsetRemainingMin = Math.abs(offsetMin) % 60;
    const offsetSign = offsetMin >= 0 ? "+" : "-";
    const offsetFormatted = `UTC${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetRemainingMin).padStart(2, "0")}`;

    return {
      relative,
      utc: d.toUTCString(),
      iso: d.toISOString(),
      local: localStr,
      dayOfYear,
      isLeap,
      offsetFormatted,
    };
  }, [timestampConversion.date]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner with Live Epoch Ticker */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0D9488] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Unix Timestamp Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Convert epoch timestamps in seconds and milliseconds with timezone intelligence
            </p>
          </div>
        </div>

        {/* Live Ticker Bar */}
        <div className="flex items-center gap-2 bg-[#FEF08A] px-3.5 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-gray-600">Current Epoch:</span>
            <span className="font-mono text-sm font-black text-black">{liveEpoch}</span>
          </div>
          <button
            onClick={() => setTickerActive(!tickerActive)}
            title={tickerActive ? "Pause live ticking" : "Resume live ticking"}
            className="p-1 bg-white border border-black hover:bg-gray-100 ml-1"
          >
            {tickerActive ? <Pause className="w-3 h-3 text-black" /> : <Play className="w-3 h-3 text-green-700" />}
          </button>
          <button
            onClick={() => handleCopy(String(liveEpoch), "live")}
            title="Copy current timestamp"
            className="p-1 bg-white border border-black hover:bg-gray-100"
          >
            {copiedKey === "live" ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-black" />}
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode("timestampToDate")}
          className={`px-4 py-2 text-xs font-black uppercase border-3 border-black transition-all ${
            mode === "timestampToDate"
              ? "bg-[#0D9488] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-0.5"
              : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          Timestamp &rarr; Human Date
        </button>
        <button
          onClick={() => setMode("dateToTimestamp")}
          className={`px-4 py-2 text-xs font-black uppercase border-3 border-black transition-all ${
            mode === "dateToTimestamp"
              ? "bg-[#0D9488] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-0.5"
              : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          Human Date &rarr; Timestamp
        </button>
      </div>

      {/* MODE 1: TIMESTAMP TO DATE */}
      {mode === "timestampToDate" && (
        <div className="space-y-6">
          {/* Input Box */}
          <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-black">
                Enter Unix Epoch Timestamp:
              </label>
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setInputTimestamp(String(Math.floor(Date.now() / 1000)))}
                  className="px-2.5 py-1 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none"
                >
                  Now
                </button>
                <button
                  onClick={() => setInputTimestamp("946684800")}
                  className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
                >
                  Y2K (2000)
                </button>
                <button
                  onClick={() => setInputTimestamp("2147483647")}
                  className="px-2.5 py-1 text-xs font-black uppercase bg-[#FED7AA] border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none"
                >
                  Year 2038 (32-bit max)
                </button>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <input
                type="text"
                value={inputTimestamp}
                onChange={(e) => setInputTimestamp(e.target.value)}
                placeholder="e.g. 1771408000 (seconds) or 1771408000000 (ms)"
                className="flex-1 font-mono text-base font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black"
              />

              <select
                value={unitMode}
                onChange={(e: any) => setUnitMode(e.target.value)}
                className="w-full sm:w-56 font-black text-xs p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer focus:outline-none"
              >
                <option value="auto">Auto-Detect ({timestampConversion.unit})</option>
                <option value="seconds">Seconds (10 digits)</option>
                <option value="milliseconds">Milliseconds (13 digits)</option>
              </select>
            </div>

            <div className="text-[11px] font-bold text-gray-500">
              Your detected local timezone: <strong className="text-black font-mono">{userTimeZone}</strong>
            </div>
          </div>

          {/* Error Message */}
          {timestampConversion.error && (
            <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-red-900 uppercase">Invalid Timestamp</h3>
                <p className="text-xs font-bold text-red-800 mt-0.5">{timestampConversion.error}</p>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {dateDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Relative Time Card */}
              <div className="bg-[#FEF08A] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-700">Relative Time</div>
                  <div className="text-lg font-black text-black mt-1">{dateDetails.relative}</div>
                </div>
                <button
                  onClick={() => handleCopy(dateDetails.relative, "rel")}
                  className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
                >
                  {copiedKey === "rel" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "rel" ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Local Time Card */}
              <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-700">
                    Local Time ({userTimeZone} - {dateDetails.offsetFormatted})
                  </div>
                  <div className="text-sm font-black text-black mt-1 font-mono">{dateDetails.local}</div>
                </div>
                <button
                  onClick={() => handleCopy(dateDetails.local, "local")}
                  className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
                >
                  {copiedKey === "local" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "local" ? "Copied" : "Copy"}
                </button>
              </div>

              {/* UTC / GMT String */}
              <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-700">GMT / UTC String (RFC 2822)</div>
                  <div className="text-sm font-black text-black mt-1 font-mono">{dateDetails.utc}</div>
                </div>
                <button
                  onClick={() => handleCopy(dateDetails.utc, "utc")}
                  className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
                >
                  {copiedKey === "utc" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "utc" ? "Copied" : "Copy"}
                </button>
              </div>

              {/* ISO 8601 */}
              <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-700">ISO 8601 String</div>
                  <div className="text-sm font-black text-black mt-1 font-mono">{dateDetails.iso}</div>
                </div>
                <button
                  onClick={() => handleCopy(dateDetails.iso, "iso")}
                  className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
                >
                  {copiedKey === "iso" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "iso" ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Calendar Details */}
              <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] col-span-1 md:col-span-2">
                <div className="text-[11px] font-black uppercase text-gray-700 mb-2">Calendar Metrics</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-2.5 border border-black">
                    <div className="text-[10px] uppercase font-bold text-gray-500">Day of Year</div>
                    <div className="text-base font-black text-black">Day {dateDetails.dayOfYear} of 365</div>
                  </div>
                  <div className="bg-white p-2.5 border border-black">
                    <div className="text-[10px] uppercase font-bold text-gray-500">Leap Year</div>
                    <div className="text-base font-black text-black">{dateDetails.isLeap ? "Yes (366 days)" : "No"}</div>
                  </div>
                  <div className="bg-white p-2.5 border border-black">
                    <div className="text-[10px] uppercase font-bold text-gray-500">Raw Seconds</div>
                    <div className="text-base font-mono font-black text-black">
                      {Math.floor(timestampConversion.date!.getTime() / 1000)}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 border border-black">
                    <div className="text-[10px] uppercase font-bold text-gray-500">Raw Milliseconds</div>
                    <div className="text-base font-mono font-black text-black">
                      {timestampConversion.date!.getTime()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: DATE TO TIMESTAMP */}
      {mode === "dateToTimestamp" && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Pick Date and Time:
            </label>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
              <input
                type="datetime-local"
                step="1"
                value={inputDateTime}
                onChange={(e) => setInputDateTime(e.target.value)}
                className="flex-1 font-mono text-base font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black"
              />

              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none">
                <input
                  type="checkbox"
                  checked={dateIsUtc}
                  onChange={(e) => setDateIsUtc(e.target.checked)}
                  className="w-4 h-4 accent-[#0D9488] border-2 border-black cursor-pointer"
                />
                <span className="text-xs font-black uppercase">Interpret as UTC</span>
              </label>
            </div>
          </div>

          {dateToTimestampConversion && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Epoch Seconds */}
              <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-700">Unix Timestamp (Seconds)</div>
                  <div className="text-xl font-mono font-black text-black mt-1">
                    {dateToTimestampConversion.seconds}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(String(dateToTimestampConversion.seconds), "sec")}
                  className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
                >
                  {copiedKey === "sec" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "sec" ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Epoch Milliseconds */}
              <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-700">Unix Timestamp (Milliseconds)</div>
                  <div className="text-xl font-mono font-black text-black mt-1">
                    {dateToTimestampConversion.milliseconds}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(String(dateToTimestampConversion.milliseconds), "ms")}
                  className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
                >
                  {copiedKey === "ms" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "ms" ? "Copied" : "Copy"}
                </button>
              </div>

              {/* ISO 8601 */}
              <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-700">ISO 8601 Representation</div>
                  <div className="text-sm font-mono font-bold text-black mt-1">
                    {dateToTimestampConversion.iso}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(dateToTimestampConversion.iso, "iso2")}
                  className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
                >
                  {copiedKey === "iso2" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "iso2" ? "Copied" : "Copy"}
                </button>
              </div>

              {/* UTC RFC 2822 */}
              <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-700">UTC / GMT Header String</div>
                  <div className="text-sm font-mono font-bold text-black mt-1">
                    {dateToTimestampConversion.utc}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(dateToTimestampConversion.utc, "utc2")}
                  className="px-2.5 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
                >
                  {copiedKey === "utc2" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "utc2" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
