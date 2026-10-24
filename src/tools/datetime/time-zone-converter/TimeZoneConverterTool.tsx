"use client";

import React, { useState, useMemo } from "react";
import {
  Globe,
  Clock,
  Plus,
  Trash2,
  Copy,
  Check,
  Sun,
  Moon,
  Sparkles,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface CityTimeZone {
  id: string;
  city: string;
  zone: string;
  flag: string;
}

const DEFAULT_CITIES: CityTimeZone[] = [
  { id: "utc", city: "UTC / GMT", zone: "UTC", flag: "🌐" },
  { id: "lon", city: "London", zone: "Europe/London", flag: "🇬🇧" },
  { id: "par", city: "Paris / Berlin", zone: "Europe/Paris", flag: "🇪🇺" },
  { id: "nyc", city: "New York", zone: "America/New_York", flag: "🇺🇸" },
  { id: "sfo", city: "San Francisco", zone: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "tok", city: "Tokyo", zone: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "del", city: "New Delhi / Mumbai", zone: "Asia/Kolkata", flag: "🇮🇳" },
  { id: "syd", city: "Sydney", zone: "Australia/Sydney", flag: "🇦🇺" },
  { id: "dxb", city: "Dubai", zone: "Asia/Dubai", flag: "🇦🇪" },
  { id: "sgp", city: "Singapore", zone: "Asia/Singapore", flag: "🇸🇬" },
];

const ALL_AVAILABLE_ZONES: { city: string; zone: string; flag: string }[] = [
  { city: "UTC / GMT", zone: "UTC", flag: "🌐" },
  { city: "London, UK", zone: "Europe/London", flag: "🇬🇧" },
  { city: "Paris, France", zone: "Europe/Paris", flag: "🇫🇷" },
  { city: "Berlin, Germany", zone: "Europe/Berlin", flag: "🇩🇪" },
  { city: "New York, USA", zone: "America/New_York", flag: "🇺🇸" },
  { city: "Chicago, USA", zone: "America/Chicago", flag: "🇺🇸" },
  { city: "Denver, USA", zone: "America/Denver", flag: "🇺🇸" },
  { city: "Los Angeles, USA", zone: "America/Los_Angeles", flag: "🇺🇸" },
  { city: "Toronto, Canada", zone: "America/Toronto", flag: "🇨🇦" },
  { city: "Tokyo, Japan", zone: "Asia/Tokyo", flag: "🇯🇵" },
  { city: "New Delhi, India", zone: "Asia/Kolkata", flag: "🇮🇳" },
  { city: "Dubai, UAE", zone: "Asia/Dubai", flag: "🇦🇪" },
  { city: "Singapore", zone: "Asia/Singapore", flag: "🇸🇬" },
  { city: "Hong Kong", zone: "Asia/Hong_Kong", flag: "🇭🇰" },
  { city: "Sydney, Australia", zone: "Australia/Sydney", flag: "🇦🇺" },
  { city: "Auckland, New Zealand", zone: "Pacific/Auckland", flag: "🇳🇿" },
  { city: "Sao Paulo, Brazil", zone: "America/Sao_Paulo", flag: "🇧🇷" },
  { city: "Johannesburg, South Africa", zone: "Africa/Johannesburg", flag: "🇿🇦" },
  { city: "Cairo, Egypt", zone: "Africa/Cairo", flag: "🇪🇬" },
  { city: "Seoul, South Korea", zone: "Asia/Seoul", flag: "🇰🇷" },
];

// Helper to determine if a date is in Daylight Saving Time for a given timezone
function isDstActive(date: Date, timeZone: string): { isDst: boolean; tzName: string } {
  try {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);

    const getOffset = (d: Date) => {
      const utcDate = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
      const tzDate = new Date(d.toLocaleString("en-US", { timeZone }));
      return (tzDate.getTime() - utcDate.getTime()) / 60000;
    };

    const currentOffset = getOffset(date);
    const janOffset = getOffset(jan);
    const julOffset = getOffset(jul);

    const standardOffset = Math.min(janOffset, julOffset);
    const isDst = currentOffset > standardOffset;

    // Get short timezone name (e.g. EDT, EST, GMT, BST)
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(date);
    const tzName = parts.find((p) => p.type === "timeZoneName")?.value || "";

    return { isDst, tzName };
  } catch {
    return { isDst: false, tzName: "" };
  }
}

export default function TimeZoneConverterTool() {
  // Detect local timezone
  const defaultLocalTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const [baseDate, setBaseDate] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  const [sourceTimeZone, setSourceTimeZone] = useState<string>(defaultLocalTz);
  const [activeCities, setActiveCities] = useState<CityTimeZone[]>(DEFAULT_CITIES.slice(0, 6));
  const [newCityZone, setNewCityZone] = useState<string>(ALL_AVAILABLE_ZONES[3].zone);
  const [copied, setCopied] = useState<boolean>(false);

  // Parse source date into standard UTC timestamp
  const baseUtcInstant = useMemo(() => {
    if (!baseDate) return new Date();
    try {
      // Parse baseDate in sourceTimeZone
      const [dPart, tPart] = baseDate.split("T");
      const [y, m, d] = dPart.split("-").map(Number);
      const [hour, min] = (tPart || "12:00").split(":").map(Number);

      // Create an estimated date in UTC
      const guess = new Date(Date.UTC(y, m - 1, d, hour, min));

      // Correct for source timezone offset
      const guessTzStr = guess.toLocaleString("en-US", { timeZone: sourceTimeZone });
      const guessTzDate = new Date(guessTzStr);
      const diffMs = guess.getTime() - guessTzDate.getTime();

      return new Date(guess.getTime() + diffMs);
    } catch {
      return new Date();
    }
  }, [baseDate, sourceTimeZone]);

  // Add City
  const handleAddCity = () => {
    const found = ALL_AVAILABLE_ZONES.find((z) => z.zone === newCityZone);
    if (!found) return;
    if (activeCities.some((c) => c.zone === found.zone)) return;

    setActiveCities([
      ...activeCities,
      {
        id: `${found.zone}-${Date.now()}`,
        city: found.city,
        zone: found.zone,
        flag: found.flag,
      },
    ]);
  };

  // Remove City
  const handleRemoveCity = (id: string) => {
    setActiveCities(activeCities.filter((c) => c.id !== id));
  };

  // Converted results list
  const convertedList = useMemo(() => {
    const sourceOffsetMs = (() => {
      const utc = new Date(baseUtcInstant.toLocaleString("en-US", { timeZone: "UTC" }));
      const src = new Date(baseUtcInstant.toLocaleString("en-US", { timeZone: sourceTimeZone }));
      return src.getTime() - utc.getTime();
    })();

    return activeCities.map((item) => {
      try {
        const fullDateStr = new Intl.DateTimeFormat("en-US", {
          timeZone: item.zone,
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(baseUtcInstant);

        const timeStr = new Intl.DateTimeFormat("en-US", {
          timeZone: item.zone,
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(baseUtcInstant);

        const hour24 = Number(
          new Intl.DateTimeFormat("en-US", {
            timeZone: item.zone,
            hour: "numeric",
            hour12: false,
          }).format(baseUtcInstant)
        );

        const isDaytime = hour24 >= 6 && hour24 < 20;

        // Time difference relative to source
        const targetUtc = new Date(baseUtcInstant.toLocaleString("en-US", { timeZone: "UTC" }));
        const targetTz = new Date(baseUtcInstant.toLocaleString("en-US", { timeZone: item.zone }));
        const targetOffsetMs = targetTz.getTime() - targetUtc.getTime();

        const diffHours = (targetOffsetMs - sourceOffsetMs) / (1000 * 3600);
        const sign = diffHours >= 0 ? "+" : "";
        const diffText = diffHours === 0 ? "Same time" : `${sign}${diffHours}h`;

        const { isDst, tzName } = isDstActive(baseUtcInstant, item.zone);

        return {
          ...item,
          fullDateStr,
          timeStr,
          hour24,
          isDaytime,
          diffText,
          isDst,
          tzName,
        };
      } catch {
        return {
          ...item,
          fullDateStr: "Error",
          timeStr: "-",
          hour24: 12,
          isDaytime: true,
          diffText: "-",
          isDst: false,
          tzName: "",
        };
      }
    });
  }, [baseUtcInstant, activeCities, sourceTimeZone]);

  const handleCopyAll = () => {
    const text = convertedList
      .map((c) => `${c.flag} ${c.city} (${c.tzName || c.zone}): ${c.fullDateStr} at ${c.timeStr} [${c.diffText}]`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0D9488] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Time Zone Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Convert times across global cities with Daylight Saving Time (DST) indicators and business hour tracking
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyAll}
          className="px-3.5 py-2 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-black" />}
          {copied ? "Copied" : "Copy All Times"}
        </button>
      </div>

      {/* Source Controller Bar */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0D9488]" />
              Source Date &amp; Time:
            </label>
            <input
              type="datetime-local"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#0D9488]" />
              Source Time Zone:
            </label>
            <select
              value={sourceTimeZone}
              onChange={(e) => setSourceTimeZone(e.target.value)}
              className="w-full font-black text-xs p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer focus:outline-none"
            >
              {ALL_AVAILABLE_ZONES.map((z) => (
                <option key={z.zone} value={z.zone}>
                  {z.flag} {z.city} ({z.zone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add City Bar */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 pt-3 border-t border-black/15 items-center">
          <span className="text-xs font-black uppercase text-gray-700 whitespace-nowrap">
            Add City to Board:
          </span>
          <select
            value={newCityZone}
            onChange={(e) => setNewCityZone(e.target.value)}
            className="flex-1 font-black text-xs p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            {ALL_AVAILABLE_ZONES.map((z) => (
              <option key={z.zone} value={z.zone}>
                {z.flag} {z.city}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddCity}
            className="px-4 py-2 text-xs font-black uppercase bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FDE047] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-black" /> Add City
          </button>
        </div>
      </div>

      {/* Comparison Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {convertedList.map((item) => (
          <div
            key={item.id}
            className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-black text-black flex items-center gap-1.5">
                  <span>{item.flag}</span>
                  <span>{item.city}</span>
                </div>
                <div className="text-[11px] font-bold text-gray-500 font-mono">
                  {item.zone} {item.tzName && `(${item.tzName})`}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {item.isDaytime ? (
                  <span title="Daytime" className="p-1 bg-[#FEF08A] border border-black text-amber-800">
                    <Sun className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span title="Nighttime" className="p-1 bg-slate-900 border border-black text-amber-200">
                    <Moon className="w-3.5 h-3.5" />
                  </span>
                )}
                {activeCities.length > 1 && (
                  <button
                    onClick={() => handleRemoveCity(item.id)}
                    title="Remove city"
                    className="p-1 bg-white border border-black hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Time Display */}
            <div>
              <div className="text-2xl font-black text-black font-mono tracking-tight">
                {item.timeStr}
              </div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">
                {item.fullDateStr}
              </div>
            </div>

            {/* Badges / Metrics */}
            <div className="pt-2 border-t border-black/15 flex items-center justify-between text-[11px] font-black">
              <span className="bg-white px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                Diff: {item.diffText}
              </span>

              {item.isDst ? (
                <span className="bg-[#FED7AA] text-black px-2 py-0.5 border border-black">
                  DST Active
                </span>
              ) : (
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 border border-black">
                  Standard Time
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
