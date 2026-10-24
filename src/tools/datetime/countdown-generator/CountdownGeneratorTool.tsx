"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Timer,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  Play,
  Pause,
  PartyPopper,
} from "lucide-react";

export default function CountdownGeneratorTool() {
  const [eventName, setEventName] = useState<string>("New Year Celebration");

  const [targetDate, setTargetDate] = useState<string>(() => {
    const nextYear = new Date().getFullYear() + 1;
    return `${nextYear}-01-01T00:00`;
  });

  const [startDate] = useState<number>(() => Date.now());
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Interval timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Calculations
  const countdown = useMemo(() => {
    const target = new Date(targetDate).getTime();
    if (isNaN(target)) {
      return { isValid: false, isPast: false, days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 };
    }

    const diff = target - currentTime;
    const isPast = diff < 0;
    const absDiff = Math.abs(diff);

    const seconds = Math.floor((absDiff / 1000) % 60);
    const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
    const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

    // Progress percentage
    const totalDuration = target - startDate;
    let progress = 0;
    if (totalDuration > 0) {
      const elapsed = currentTime - startDate;
      progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    }

    return {
      isValid: true,
      isPast,
      days,
      hours,
      minutes,
      seconds,
      progress,
    };
  }, [targetDate, currentTime, startDate]);

  const handleCopyText = () => {
    const statusText = countdown.isPast ? "since" : "until";
    const text = `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s ${statusText} ${eventName} (${targetDate})`;
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
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Countdown Generator
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Create real-time ticking countdown timers and milestone trackers with progress visualization
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const ny = new Date(new Date().getFullYear() + 1, 0, 1, 0, 0);
              setEventName("New Year");
              setTargetDate(`${ny.getFullYear()}-01-01T00:00`);
            }}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none"
          >
            New Year
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59);
              const pad = (n: number) => String(n).padStart(2, "0");
              setEventName("End of Month");
              setTargetDate(`${endOfMonth.getFullYear()}-${pad(endOfMonth.getMonth() + 1)}-${pad(endOfMonth.getDate())}T23:59`);
            }}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none"
          >
            End of Month
          </button>
          <button
            onClick={() => {
              const now = new Date();
              // next Friday 17:00
              const day = now.getDay();
              const diff = (5 - day + 7) % 7 || 7;
              const fri = new Date(now.getTime() + diff * 24 * 3600 * 1000);
              const pad = (n: number) => String(n).padStart(2, "0");
              setEventName("Weekend Kickoff");
              setTargetDate(`${fri.getFullYear()}-${pad(fri.getMonth() + 1)}-${pad(fri.getDate())}T17:00`);
            }}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FED7AA] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none"
          >
            Weekend Kickoff
          </button>
        </div>
      </div>

      {/* Inputs Section */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Event Title:
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Vacation, Product Launch, Wedding..."
              className="w-full font-black text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center justify-between">
              <span>Target Date &amp; Time:</span>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="text-[10px] font-black uppercase text-gray-700 underline flex items-center gap-1"
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isRunning ? "Pause Timer" : "Resume Timer"}
              </button>
            </label>
            <input
              type="datetime-local"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Countdown Display */}
      {countdown.isValid && (
        <div className="space-y-6">
          {/* Status Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black uppercase text-black">{eventName}</span>
              {countdown.isPast ? (
                <span className="text-xs font-black uppercase bg-[#FED7AA] text-black px-2.5 py-0.5 border border-black">
                  Passed (Counting Up)
                </span>
              ) : (
                <span className="text-xs font-black uppercase bg-[#BBF7D0] text-black px-2.5 py-0.5 border border-black flex items-center gap-1">
                  <PartyPopper className="w-3.5 h-3.5" /> Upcoming
                </span>
              )}
            </div>

            <button
              onClick={handleCopyText}
              className="px-3.5 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Status"}
            </button>
          </div>

          {/* Big Number Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="text-4xl sm:text-5xl font-black font-mono text-black">
                {String(countdown.days).padStart(2, "0")}
              </div>
              <div className="text-xs font-black uppercase text-gray-600 mt-2">Days</div>
            </div>

            <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="text-4xl sm:text-5xl font-black font-mono text-black">
                {String(countdown.hours).padStart(2, "0")}
              </div>
              <div className="text-xs font-black uppercase text-gray-600 mt-2">Hours</div>
            </div>

            <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="text-4xl sm:text-5xl font-black font-mono text-black">
                {String(countdown.minutes).padStart(2, "0")}
              </div>
              <div className="text-xs font-black uppercase text-gray-600 mt-2">Minutes</div>
            </div>

            <div className="bg-[#FEF08A] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="text-4xl sm:text-5xl font-black font-mono text-[#0D9488]">
                {String(countdown.seconds).padStart(2, "0")}
              </div>
              <div className="text-xs font-black uppercase text-black mt-2">Seconds</div>
            </div>
          </div>

          {/* Progress Bar (if upcoming) */}
          {!countdown.isPast && (
            <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
              <div className="flex justify-between text-xs font-black uppercase">
                <span>Progress to Target</span>
                <span>{countdown.progress}% Elapsed</span>
              </div>
              <div className="w-full bg-gray-200 border-2 border-black h-4 overflow-hidden">
                <div
                  className="bg-[#0D9488] h-full transition-all duration-500"
                  style={{ width: `${countdown.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
