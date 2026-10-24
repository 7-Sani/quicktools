"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarRange,
  Copy,
  Check,
  ArrowRightLeft,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  Briefcase,
} from "lucide-react";

interface DiffSuccess {
  isNegative: boolean;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalWeeks: number;
  remainingDaysAfterWeeks: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  weekdays: number;
  weekendDays: number;
}

export default function DateDifferenceCalculatorTool() {
  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T09:00`;
  });

  const [endDate, setEndDate] = useState<string>(() => {
    const future = new Date(Date.now() + 45 * 24 * 3600 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}T17:00`;
  });

  const [includeEndDate, setIncludeEndDate] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Swap dates
  const handleSwap = () => {
    const temp = startDate;
    setStartDate(endDate);
    setEndDate(temp);
  };

  // Difference Calculations
  const diff = useMemo<({ error: string } | ({ error?: never } & DiffSuccess)) | null>(() => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { error: "Please provide valid start and end dates." };
    }

    const isNegative = end.getTime() < start.getTime();
    const [early, late] = isNegative ? [end, start] : [start, end];

    // Absolute elapsed milliseconds
    let totalMs = late.getTime() - early.getTime();
    if (includeEndDate) {
      // If inclusive calendar mode, add 1 full day (or remaining time up to day boundary)
      totalMs += 24 * 3600 * 1000;
    }

    // Precise calendar difference calculation
    let years = late.getFullYear() - early.getFullYear();
    let months = late.getMonth() - early.getMonth();
    let days = late.getDate() - early.getDate();
    let hours = late.getHours() - early.getHours();
    let minutes = late.getMinutes() - early.getMinutes();
    let seconds = late.getSeconds() - early.getSeconds();

    if (seconds < 0) {
      minutes--;
      seconds += 60;
    }
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    if (hours < 0) {
      days--;
      hours += 24;
    }
    if (days < 0) {
      months--;
      // Days in previous month
      const prevMonth = new Date(late.getFullYear(), late.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Working days vs Weekends counting
    let weekdays = 0;
    let weekendDays = 0;
    const cur = new Date(early);
    cur.setHours(0, 0, 0, 0);
    const stop = new Date(late);
    stop.setHours(0, 0, 0, 0);

    while (cur <= stop) {
      const dayOfWeek = cur.getDay(); // 0 is Sunday, 6 is Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays++;
      } else {
        weekdays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    const totalSeconds = Math.floor(totalMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);
    const remainingDaysAfterWeeks = totalDays % 7;

    return {
      isNegative,
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalDays,
      totalWeeks,
      remainingDaysAfterWeeks,
      totalHours,
      totalMinutes,
      totalSeconds,
      weekdays,
      weekendDays,
    };
  }, [startDate, endDate, includeEndDate]);

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
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Date Difference Calculator
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Calculate exact duration between dates with clear distinction between calendar days and elapsed hours
            </p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const now = new Date();
              const ny = new Date(now.getFullYear() + 1, 0, 1, 0, 0);
              const pad = (n: number) => String(n).padStart(2, "0");
              setStartDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
              setEndDate(`${ny.getFullYear()}-01-01T00:00`);
            }}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none"
          >
            Until Next New Year
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const future = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
              const pad = (n: number) => String(n).padStart(2, "0");
              setStartDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T09:00`);
              setEndDate(`${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}T17:00`);
            }}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none"
          >
            +30 Days Period
          </button>
        </div>
      </div>

      {/* Inputs Section */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0D9488]" />
              Start Date &amp; Time:
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0D9488]" />
                End Date &amp; Time:
              </label>
              <button
                onClick={handleSwap}
                className="px-2 py-0.5 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
                title="Swap Start and End Dates"
              >
                <ArrowRightLeft className="w-3 h-3 text-black" /> Swap
              </button>
            </div>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>
        </div>

        {/* Option toggles */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-black/15">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-black uppercase">
            <input
              type="checkbox"
              checked={includeEndDate}
              onChange={(e) => setIncludeEndDate(e.target.checked)}
              className="w-4 h-4 accent-[#0D9488] border-2 border-black cursor-pointer"
            />
            <span>Include end day in calculation (+1 full calendar day)</span>
          </label>

          {diff && !("error" in diff) && diff.isNegative && (
            <span className="text-xs font-black bg-[#FED7AA] text-black px-2 py-0.5 border border-black">
              Notice: End date is before Start date (counting backwards)
            </span>
          )}
        </div>
      </div>

      {/* Error Callout */}
      {diff?.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase">Calculation Error</h3>
            <p className="text-xs font-bold text-red-800 mt-0.5">{diff.error}</p>
          </div>
        </div>
      )}

      {/* Results Matrix */}
      {diff && !("error" in diff) && (
        <div className="space-y-6">
          {/* Main Calendar Breakdown Card */}
          <div className="bg-[#FEF08A] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase text-gray-700">Calendar Breakdown</div>
              <div className="text-2xl sm:text-3xl font-black text-black mt-1">
                {diff.years > 0 && `${diff.years} year${diff.years > 1 ? "s" : ""}, `}
                {diff.months > 0 && `${diff.months} month${diff.months > 1 ? "s" : ""}, `}
                {diff.days} day{diff.days !== 1 ? "s" : ""}
                {(diff.hours > 0 || diff.minutes > 0) &&
                  `, ${diff.hours}h ${diff.minutes}m ${diff.seconds}s`}
              </div>
            </div>
            <button
              onClick={() =>
                handleCopy(
                  `${diff.years}y ${diff.months}m ${diff.days}d ${diff.hours}h ${diff.minutes}m`,
                  "cal"
                )
              }
              className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1.5"
            >
              {copiedKey === "cal" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === "cal" ? "Copied" : "Copy Breakdown"}
            </button>
          </div>

          {/* Unit Conversion Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-black uppercase text-gray-600">Total Days</div>
                <div className="text-2xl font-black text-black mt-1">{diff.totalDays.toLocaleString()}</div>
              </div>
              <div className="text-[11px] font-bold text-gray-500 mt-2">
                {diff.totalWeeks} weeks + {diff.remainingDaysAfterWeeks} days
              </div>
            </div>

            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-black uppercase text-gray-600">Total Hours</div>
                <div className="text-2xl font-black text-[#0D9488] mt-1">{diff.totalHours.toLocaleString()}</div>
              </div>
              <div className="text-[11px] font-bold text-gray-500 mt-2">
                Physical elapsed hours
              </div>
            </div>

            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-black uppercase text-gray-600">Total Minutes</div>
                <div className="text-xl font-mono font-black text-black mt-1">
                  {diff.totalMinutes.toLocaleString()}
                </div>
              </div>
              <div className="text-[11px] font-bold text-gray-500 mt-2">
                {diff.totalSeconds.toLocaleString()} seconds
              </div>
            </div>

            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-black uppercase text-gray-600">Working Days</div>
                <div className="text-2xl font-black text-green-700 mt-1">{diff.weekdays}</div>
              </div>
              <div className="text-[11px] font-bold text-gray-500 mt-2">
                + {diff.weekendDays} weekend days
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
