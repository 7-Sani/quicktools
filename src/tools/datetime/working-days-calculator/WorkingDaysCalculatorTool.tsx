"use client";

import React, { useState, useMemo } from "react";
import {
  Briefcase,
  Copy,
  Check,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  AlertTriangle,
} from "lucide-react";

type WeekendType = "sat-sun" | "fri-sat" | "sun-only";

interface RangeResultSuccess {
  totalCalendarDays: number;
  workingDays: number;
  weekendDays: number;
  holidayDays: number;
  totalWorkingHours: number;
}

export default function WorkingDaysCalculatorTool() {
  const [calcMode, setCalcMode] = useState<"betweenDates" | "addWorkingDays">("betweenDates");

  // Mode 1: Between Dates
  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  });

  const [endDate, setEndDate] = useState<string>(() => {
    const future = new Date(Date.now() + 30 * 24 * 3600 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}`;
  });

  // Mode 2: Add working days
  const [daysToAdd, setDaysToAdd] = useState<number>(20);

  // General configs
  const [weekendRule, setWeekendRule] = useState<WeekendType>("sat-sun");
  const [dailyHours, setDailyHours] = useState<number>(8);
  const [includeStartDay, setIncludeStartDay] = useState<boolean>(true);

  // Custom Holidays
  const [holidays, setHolidays] = useState<string[]>([]);
  const [newHolidayInput, setNewHolidayInput] = useState<string>("");

  const [copied, setCopied] = useState<boolean>(false);

  // Check if a given date is weekend based on rule
  const isWeekend = (date: Date, rule: WeekendType): boolean => {
    const day = date.getDay(); // 0 = Sun, 6 = Sat
    if (rule === "sat-sun") return day === 0 || day === 6;
    if (rule === "fri-sat") return day === 5 || day === 6;
    if (rule === "sun-only") return day === 0;
    return false;
  };

  // Add holiday handler
  const handleAddHoliday = () => {
    if (!newHolidayInput) return;
    if (!holidays.includes(newHolidayInput)) {
      setHolidays([...holidays, newHolidayInput].sort());
      setNewHolidayInput("");
    }
  };

  const handleRemoveHoliday = (h: string) => {
    setHolidays(holidays.filter((item) => item !== h));
  };

  // Calculation for Mode 1: Between Dates
  const rangeResult = useMemo<({ error: string } | ({ error?: never } & RangeResultSuccess)) | null>(() => {
    if (calcMode !== "betweenDates" || !startDate || !endDate) return null;

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { error: "Please enter valid calendar dates." };
    }

    if (start > end) {
      return { error: "Start date must be before or equal to End date." };
    }

    let workingDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;
    let totalCalendarDays = 0;

    const cur = new Date(start);
    if (!includeStartDay) {
      cur.setDate(cur.getDate() + 1);
    }

    const pad = (n: number) => String(n).padStart(2, "0");

    while (cur <= end) {
      totalCalendarDays++;
      const dateKey = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;

      if (isWeekend(cur, weekendRule)) {
        weekendDays++;
      } else if (holidays.includes(dateKey)) {
        holidayDays++;
      } else {
        workingDays++;
      }

      cur.setDate(cur.getDate() + 1);
    }

    const totalWorkingHours = workingDays * dailyHours;

    return {
      totalCalendarDays,
      workingDays,
      weekendDays,
      holidayDays,
      totalWorkingHours,
    };
  }, [calcMode, startDate, endDate, weekendRule, holidays, dailyHours, includeStartDay]);

  // Calculation for Mode 2: Add N working days
  const forwardResult = useMemo(() => {
    if (calcMode !== "addWorkingDays" || !startDate || isNaN(daysToAdd) || daysToAdd < 1) return null;

    const start = new Date(`${startDate}T00:00:00`);
    if (isNaN(start.getTime())) return null;

    let added = 0;
    let totalDaysStepped = 0;
    const cur = new Date(start);
    const pad = (n: number) => String(n).padStart(2, "0");

    while (added < daysToAdd) {
      cur.setDate(cur.getDate() + 1);
      totalDaysStepped++;

      const dateKey = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
      if (!isWeekend(cur, weekendRule) && !holidays.includes(dateKey)) {
        added++;
      }
    }

    return {
      targetDate: cur.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      totalCalendarDays: totalDaysStepped,
      workingHours: daysToAdd * dailyHours,
    };
  }, [calcMode, startDate, daysToAdd, weekendRule, holidays, dailyHours]);

  const handleCopy = () => {
    let text = "";
    if (calcMode === "betweenDates" && rangeResult && !("error" in rangeResult)) {
      text = `Working Days Summary (${startDate} to ${endDate}):
Working Business Days: ${rangeResult.workingDays} days
Total Calendar Days: ${rangeResult.totalCalendarDays} days
Weekend Days Excluded: ${rangeResult.weekendDays} days
Holidays Excluded: ${rangeResult.holidayDays} days
Billable Working Hours (${dailyHours}h/day): ${rangeResult.totalWorkingHours} hours`;
    } else if (calcMode === "addWorkingDays" && forwardResult) {
      text = `Starting ${startDate} + ${daysToAdd} working days:
Projected End Date: ${forwardResult.targetDate}
Total Calendar Days: ${forwardResult.totalCalendarDays}
Total Billable Hours: ${forwardResult.workingHours}h`;
    }
    if (!text) return;
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
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Working Days Calculator
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Calculate business working days, exclude configurable weekends &amp; custom holidays, and forecast project deadlines
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-3.5 py-2 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-black" />}
          {copied ? "Copied" : "Copy Results"}
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCalcMode("betweenDates")}
          className={`px-4 py-2 text-xs font-black uppercase border-3 border-black transition-all ${
            calcMode === "betweenDates"
              ? "bg-[#0D9488] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-0.5"
              : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          Count Business Days Between Dates
        </button>
        <button
          onClick={() => setCalcMode("addWorkingDays")}
          className={`px-4 py-2 text-xs font-black uppercase border-3 border-black transition-all ${
            calcMode === "addWorkingDays"
              ? "bg-[#0D9488] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-0.5"
              : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          Add Working Days to Date (Target Forecast)
        </button>
      </div>

      {/* Main Configurations */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        {/* Date Inputs */}
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

          {calcMode === "betweenDates" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0D9488]" />
                End Date:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#0D9488]" />
                Number of Working Days to Add:
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={daysToAdd}
                onChange={(e) => setDaysToAdd(Number(e.target.value))}
                className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Schedule & Rules Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-black/15">
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-gray-700">Weekend Days Schedule:</label>
            <select
              value={weekendRule}
              onChange={(e: any) => setWeekendRule(e.target.value)}
              className="w-full font-black text-xs p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <option value="sat-sun">Saturday &amp; Sunday (Standard)</option>
              <option value="fri-sat">Friday &amp; Saturday (Middle East)</option>
              <option value="sun-only">Sunday Only (6-day week)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-gray-700">Daily Work Hours:</label>
            <input
              type="number"
              min="1"
              max="24"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full font-mono font-black text-xs p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div className="flex items-center pt-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-black uppercase">
              <input
                type="checkbox"
                checked={includeStartDay}
                onChange={(e) => setIncludeStartDay(e.target.checked)}
                className="w-4 h-4 accent-[#0D9488] border-2 border-black cursor-pointer"
              />
              <span>Include start day in calculation</span>
            </label>
          </div>
        </div>

        {/* Custom Holidays Manager */}
        <div className="pt-3 border-t border-black/15 space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-black">
            Exclude Custom Public Holidays:
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={newHolidayInput}
              onChange={(e) => setNewHolidayInput(e.target.value)}
              className="font-mono text-xs p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
            <button
              onClick={handleAddHoliday}
              className="px-3 py-2 text-xs font-black uppercase bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FDE047] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-black" /> Add Holiday
            </button>
          </div>

          {holidays.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {holidays.map((h) => (
                <span
                  key={h}
                  className="bg-white px-2 py-1 text-xs font-mono font-bold border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5"
                >
                  {h}
                  <button
                    onClick={() => handleRemoveHoliday(h)}
                    className="text-red-600 hover:text-red-800 ml-1"
                    title="Remove holiday"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calculation Error */}
      {rangeResult?.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase">Invalid Date Range</h3>
            <p className="text-xs font-bold text-red-800 mt-0.5">{rangeResult.error}</p>
          </div>
        </div>
      )}

      {/* Results for Mode 1: Between Dates */}
      {calcMode === "betweenDates" && rangeResult && !("error" in rangeResult) && (
        <div className="space-y-4">
          <div className="bg-[#FEF08A] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-gray-700">Total Working Business Days</div>
              <div className="text-3xl sm:text-4xl font-black text-black mt-1">
                {rangeResult.workingDays} Days
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black uppercase text-gray-700">Total Billable Hours</div>
              <div className="text-2xl font-black text-[#0D9488] mt-1">
                {rangeResult.totalWorkingHours.toLocaleString()} Hours
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Total Calendar Days</div>
              <div className="text-2xl font-black text-black mt-1">{rangeResult.totalCalendarDays}</div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Weekend Days Excluded</div>
              <div className="text-2xl font-black text-amber-700 mt-1">{rangeResult.weekendDays}</div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Holidays Excluded</div>
              <div className="text-2xl font-black text-purple-700 mt-1">{rangeResult.holidayDays}</div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Work Efficiency</div>
              <div className="text-2xl font-black text-green-700 mt-1">
                {rangeResult.totalCalendarDays > 0
                  ? `${Math.round((rangeResult.workingDays / rangeResult.totalCalendarDays) * 100)}%`
                  : "0%"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results for Mode 2: Forward Calculation */}
      {calcMode === "addWorkingDays" && forwardResult && (
        <div className="space-y-4">
          <div className="bg-[#BBF7D0] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-gray-700">Projected Completion Date</div>
              <div className="text-2xl sm:text-3xl font-black text-black mt-1">
                {forwardResult.targetDate}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Calendar Days Span</div>
              <div className="text-2xl font-black text-black mt-1">{forwardResult.totalCalendarDays} Days</div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Total Work Hours</div>
              <div className="text-2xl font-black text-[#0D9488] mt-1">{forwardResult.workingHours} Hours</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
