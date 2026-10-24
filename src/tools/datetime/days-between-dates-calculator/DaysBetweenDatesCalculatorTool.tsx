"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Copy,
  Check,
  Calendar,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  AlertTriangle,
} from "lucide-react";

interface DaysSuccess {
  isReversed: boolean;
  totalDays: number;
  weeks: number;
  remainingDays: number;
  months: number;
  daysInMonth: number;
  weekdaysTotal: number;
  weekendsTotal: number;
  dayCounts: number[];
}

export default function DaysBetweenDatesCalculatorTool() {
  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  });

  const [endDate, setEndDate] = useState<string>(() => {
    const future = new Date(Date.now() + 60 * 24 * 3600 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}`;
  });

  const [includeEndDate, setIncludeEndDate] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Quick offsets
  const applyOffset = (days: number) => {
    const start = new Date(`${startDate}T00:00:00`);
    if (isNaN(start.getTime())) return;
    const target = new Date(start.getTime() + days * 24 * 3600 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    setEndDate(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`);
  };

  const handleSwap = () => {
    const temp = startDate;
    setStartDate(endDate);
    setEndDate(temp);
  };

  const daysResult = useMemo<({ error: string } | ({ error?: never } & DaysSuccess)) | null>(() => {
    if (!startDate || !endDate) return null;

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { error: "Please enter valid dates." };
    }

    const isReversed = start > end;
    const [early, late] = isReversed ? [end, start] : [start, end];

    let totalDays = Math.round((late.getTime() - early.getTime()) / (24 * 3600 * 1000));
    if (includeEndDate) {
      totalDays += 1;
    }

    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;

    // Month breakdown estimation
    let m = late.getMonth() - early.getMonth() + (late.getFullYear() - early.getFullYear()) * 12;
    let d = late.getDate() - early.getDate();
    if (includeEndDate) d += 1;
    if (d < 0) {
      m--;
      const prevMonth = new Date(late.getFullYear(), late.getMonth(), 0);
      d += prevMonth.getDate();
    }

    // Weekday breakdown
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // 0 = Sun, 1 = Mon ... 6 = Sat
    const cur = new Date(early);
    const stopDate = new Date(late);
    if (!includeEndDate) {
      stopDate.setDate(stopDate.getDate() - 1);
    }

    while (cur <= stopDate) {
      dayCounts[cur.getDay()]++;
      cur.setDate(cur.getDate() + 1);
    }

    const weekdaysTotal = dayCounts[1] + dayCounts[2] + dayCounts[3] + dayCounts[4] + dayCounts[5];
    const weekendsTotal = dayCounts[0] + dayCounts[6];

    return {
      isReversed,
      totalDays,
      weeks,
      remainingDays,
      months: m,
      daysInMonth: d,
      weekdaysTotal,
      weekendsTotal,
      dayCounts,
    };
  }, [startDate, endDate, includeEndDate]);

  const handleCopy = () => {
    if (!daysResult || "error" in daysResult) return;
    const text = `Days Between Dates (${startDate} to ${endDate}):
Total Days: ${daysResult.totalDays} days (${includeEndDate ? "inclusive" : "exclusive"})
Equivalent: ${daysResult.weeks} weeks and ${daysResult.remainingDays} days
Weekdays: ${daysResult.weekdaysTotal} | Weekends: ${daysResult.weekendsTotal}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0D9488] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Days Between Dates Calculator
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Count total calendar days, weeks, and weekday distributions with inclusive/exclusive toggles
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-3.5 py-2 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-black" />}
          {copied ? "Copied" : "Copy Result"}
        </button>
      </div>

      {/* Date Inputs */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0D9488]" />
              Start Date:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0D9488]" />
                End Date:
              </label>
              <button
                onClick={handleSwap}
                className="px-2 py-0.5 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3 h-3 text-black" /> Swap
              </button>
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Offset Shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/15">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black uppercase text-gray-600 mr-1">Quick Offsets:</span>
            {[7, 14, 30, 60, 90, 180, 365].map((d) => (
              <button
                key={d}
                onClick={() => applyOffset(d)}
                className="px-2 py-1 text-xs font-black uppercase bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-100"
              >
                +{d}d
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-black uppercase">
            <input
              type="checkbox"
              checked={includeEndDate}
              onChange={(e) => setIncludeEndDate(e.target.checked)}
              className="w-4 h-4 accent-[#0D9488] border-2 border-black cursor-pointer"
            />
            <span>Include end date in total count</span>
          </label>
        </div>
      </div>

      {/* Error Callout */}
      {daysResult?.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase">Input Error</h3>
            <p className="text-xs font-bold text-red-800 mt-0.5">{daysResult.error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {daysResult && !("error" in daysResult) && (
        <div className="space-y-6">
          {/* Main Total Days Banner */}
          <div className="bg-[#FEF08A] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase text-gray-700">Total Calendar Days Count</div>
              <div className="text-4xl sm:text-5xl font-black text-black mt-1">
                {daysResult.totalDays.toLocaleString()}{" "}
                <span className="text-lg font-bold text-gray-700">Days</span>
              </div>
              <div className="text-xs font-bold text-gray-700 mt-1">
                Equivalent to {daysResult.weeks} weeks and {daysResult.remainingDays} days
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-right">
              <span className="text-xs font-black bg-white px-2.5 py-1 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                {daysResult.weekdaysTotal} Weekdays
              </span>
              <span className="text-xs font-black bg-white px-2.5 py-1 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                {daysResult.weekendsTotal} Weekend Days
              </span>
            </div>
          </div>

          {/* Weekday Breakdown Matrix */}
          <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-black">
              Day of Week Distribution Across Selected Range
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {dayNames.map((name, idx) => (
                <div
                  key={name}
                  className="bg-white border-2 border-black p-2.5 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="text-[10px] font-black uppercase text-gray-500">{name}</div>
                  <div className="text-xl font-black text-black mt-1">{daysResult.dayCounts[idx]}</div>
                  <div className="text-[10px] font-bold text-gray-400">times</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
