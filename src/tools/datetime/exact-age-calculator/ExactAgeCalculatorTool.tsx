"use client";

import React, { useState, useMemo } from "react";
import {
  Cake,
  Copy,
  Check,
  Calendar,
  Sparkles,
  Clock,
  Heart,
  Star,
  Award,
  AlertTriangle,
} from "lucide-react";

// Western Zodiac Sign calculation
function getZodiacSign(day: number, month: number): { sign: string; element: string; symbol: string } {
  // month is 1-indexed
  const zodiacs = [
    { sign: "Capricorn", element: "Earth", symbol: "♑", cutoff: 19 },
    { sign: "Aquarius", element: "Air", symbol: "♒", cutoff: 18 },
    { sign: "Pisces", element: "Water", symbol: "♓", cutoff: 20 },
    { sign: "Aries", element: "Fire", symbol: "♈", cutoff: 19 },
    { sign: "Taurus", element: "Earth", symbol: "♉", cutoff: 20 },
    { sign: "Gemini", element: "Air", symbol: "♊", cutoff: 20 },
    { sign: "Cancer", element: "Water", symbol: "♋", cutoff: 22 },
    { sign: "Leo", element: "Fire", symbol: "♌", cutoff: 22 },
    { sign: "Virgo", element: "Earth", symbol: "♍", cutoff: 22 },
    { sign: "Libra", element: "Air", symbol: "♎", cutoff: 22 },
    { sign: "Scorpio", element: "Water", symbol: "♏", cutoff: 21 },
    { sign: "Sagittarius", element: "Fire", symbol: "♐", cutoff: 21 },
    { sign: "Capricorn", element: "Earth", symbol: "♑", cutoff: 31 },
  ];

  const mIndex = month - 1;
  if (day <= zodiacs[mIndex].cutoff) {
    return zodiacs[mIndex];
  }
  return zodiacs[mIndex + 1] || zodiacs[0];
}

// Chinese Zodiac calculation
function getChineseZodiac(year: number): string {
  const animals = [
    "Rat 🐀",
    "Ox 🐂",
    "Tiger 🐅",
    "Rabbit 🐇",
    "Dragon 🐉",
    "Snake 🐍",
    "Horse 🐎",
    "Goat 🐐",
    "Monkey 🐒",
    "Rooster 🐓",
    "Dog 🐕",
    "Pig 🐖",
  ];
  return animals[(year - 4) % 12] || "Dragon";
}

interface AgeSuccess {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  remainingDaysAfterWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  nextBdayDays: number;
  nextBdayWeekday: string;
  birthWeekday: string;
  westernZodiac: { sign: string; element: string; symbol: string };
  chineseZodiac: string;
  milestones: { age?: number; label?: string; date: Date }[];
}

export default function ExactAgeCalculatorTool() {
  const [dob, setDob] = useState<string>("1998-05-15");
  const [asOfDate, setAsOfDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const ageData = useMemo<({ error: string } | ({ error?: never } & AgeSuccess)) | null>(() => {
    if (!dob || !asOfDate) return null;

    const birthDate = new Date(dob);
    const targetDate = new Date(asOfDate);

    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) {
      return { error: "Please enter valid calendar dates." };
    }

    if (birthDate > targetDate) {
      return { error: "Date of birth cannot be after the 'Age As Of' date." };
    }

    // Exact years, months, days calculation
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Totals
    const diffMs = targetDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 3600 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const remainingDaysAfterWeeks = totalDays % 7;
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    // Next Birthday Calculation
    const nextBday = new Date(targetDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBday < targetDate) {
      nextBday.setFullYear(targetDate.getFullYear() + 1);
    }
    const nextBdayDiff = nextBday.getTime() - targetDate.getTime();
    const nextBdayDays = Math.ceil(nextBdayDiff / (1000 * 3600 * 24));
    const nextBdayWeekday = nextBday.toLocaleDateString(undefined, { weekday: "long" });

    // Day of week born
    const birthWeekday = birthDate.toLocaleDateString(undefined, { weekday: "long" });

    // Zodiac
    const westernZodiac = getZodiacSign(birthDate.getDate(), birthDate.getMonth() + 1);
    const chineseZodiac = getChineseZodiac(birthDate.getFullYear());

    // Milestones
    const milestones = [
      { age: 18, date: new Date(birthDate.getFullYear() + 18, birthDate.getMonth(), birthDate.getDate()) },
      { age: 21, date: new Date(birthDate.getFullYear() + 21, birthDate.getMonth(), birthDate.getDate()) },
      { age: 30, date: new Date(birthDate.getFullYear() + 30, birthDate.getMonth(), birthDate.getDate()) },
      { age: 50, date: new Date(birthDate.getFullYear() + 50, birthDate.getMonth(), birthDate.getDate()) },
      {
        label: "10,000 Days",
        date: new Date(birthDate.getTime() + 10000 * 24 * 3600 * 1000),
      },
      {
        label: "20,000 Days",
        date: new Date(birthDate.getTime() + 20000 * 24 * 3600 * 1000),
      },
    ];

    return {
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      remainingDaysAfterWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      nextBdayDays,
      nextBdayWeekday,
      birthWeekday,
      westernZodiac,
      chineseZodiac,
      milestones,
    };
  }, [dob, asOfDate]);

  const handleCopySummary = () => {
    if (!ageData || "error" in ageData) return;
    const summary = `Age: ${ageData.years} years, ${ageData.months} months, ${ageData.days} days
Total Days Lived: ${ageData.totalDays.toLocaleString()} days
Day Born: ${ageData.birthWeekday}
Next Birthday: in ${ageData.nextBdayDays} days (${ageData.nextBdayWeekday})
Zodiac: ${ageData.westernZodiac.sign} ${ageData.westernZodiac.symbol} | Chinese Zodiac: ${ageData.chineseZodiac}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0D9488] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Cake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              Age Calculator
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Calculate exact chronological age, next birthday countdown, total days lived, and zodiac profile
            </p>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDob("2000-01-01")}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none"
          >
            Millennium Baby (2000)
          </button>
          <button
            onClick={() => setDob("1995-10-24")}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:shadow-none"
          >
            Mid-90s (1995)
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Cake className="w-4 h-4 text-[#0D9488]" />
              Date of Birth:
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0D9488]" />
              Age as of Date (Default: Today):
            </label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full font-mono text-sm font-bold p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Error Callout */}
      {ageData?.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase">Input Error</h3>
            <p className="text-xs font-bold text-red-800 mt-0.5">{ageData.error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {ageData && !("error" in ageData) && (
        <div className="space-y-6">
          {/* Main Exact Age Card */}
          <div className="bg-[#FEF08A] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase text-gray-700">Chronological Age</div>
              <div className="text-3xl sm:text-4xl font-black text-black mt-1">
                {ageData.years} <span className="text-lg font-bold text-gray-700">Years,</span>{" "}
                {ageData.months} <span className="text-lg font-bold text-gray-700">Months,</span>{" "}
                {ageData.days} <span className="text-lg font-bold text-gray-700">Days</span>
              </div>
              <div className="text-xs font-bold text-gray-700 mt-2 flex items-center gap-2">
                <span>Born on a <strong className="text-black">{ageData.birthWeekday}</strong></span>
                <span>&bull;</span>
                <span>Next Birthday: <strong className="text-black">{ageData.nextBdayDays} days</strong> ({ageData.nextBdayWeekday})</span>
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-black" />}
              {copied ? "Copied" : "Copy Age Summary"}
            </button>
          </div>

          {/* Alternate Age Units */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-[#FAF8F5] border-3 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[10px] font-black uppercase text-gray-500">Months</div>
              <div className="text-lg font-black text-black mt-0.5">{ageData.totalMonths}</div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[10px] font-black uppercase text-gray-500">Weeks</div>
              <div className="text-lg font-black text-black mt-0.5">{ageData.totalWeeks.toLocaleString()}</div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[10px] font-black uppercase text-gray-500">Days Lived</div>
              <div className="text-lg font-black text-[#0D9488] mt-0.5">{ageData.totalDays.toLocaleString()}</div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[10px] font-black uppercase text-gray-500">Hours Lived</div>
              <div className="text-base font-mono font-black text-black mt-0.5">{ageData.totalHours.toLocaleString()}</div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[10px] font-black uppercase text-gray-500">Minutes</div>
              <div className="text-base font-mono font-black text-black mt-0.5">{ageData.totalMinutes.toLocaleString()}</div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[10px] font-black uppercase text-gray-500">Seconds</div>
              <div className="text-base font-mono font-black text-black mt-0.5">{ageData.totalSeconds.toLocaleString()}</div>
            </div>
          </div>

          {/* Zodiac & Milestones Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Zodiac Profile */}
            <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500" />
                Zodiac Signs
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-[10px] font-black uppercase text-gray-500">Western Zodiac</div>
                  <div className="text-base font-black text-black mt-1">
                    {ageData.westernZodiac.symbol} {ageData.westernZodiac.sign}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500">
                    Element: {ageData.westernZodiac.element}
                  </div>
                </div>

                <div className="bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-[10px] font-black uppercase text-gray-500">Chinese Zodiac</div>
                  <div className="text-base font-black text-black mt-1">
                    {ageData.chineseZodiac}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500">Lunar Animal</div>
                </div>
              </div>
            </div>

            {/* Life Milestones */}
            <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#0D9488]" />
                Key Life Milestones
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {ageData.milestones.map((m, idx) => (
                  <div key={idx} className="bg-white p-2 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-[10px] font-black uppercase text-gray-600">
                      {m.age ? `Turning ${m.age}` : m.label}
                    </div>
                    <div className="font-mono font-bold text-black text-[11px] mt-0.5">
                      {m.date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
