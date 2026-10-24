"use client";

import { useState, useMemo } from "react";
import {
  Clock,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
  BookOpen,
} from "lucide-react";

export default function StudyTimeCalculatorTool() {
  const [chapters, setChapters] = useState<number>(10);
  const [hoursPerChapter, setHoursPerChapter] = useState<number>(3.5);
  const [difficulty, setDifficulty] = useState<number>(1.2); // 0.8=Easy, 1.0=Moderate, 1.2=Challenging, 1.5=Hard
  const [revisionPasses, setRevisionPasses] = useState<number>(2);
  const [daysRemaining, setDaysRemaining] = useState<number>(14);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState<number>(6);

  const [copied, setCopied] = useState(false);

  // Math calculations
  const {
    baseStudyHours,
    revisionHours,
    totalRequiredHours,
    effectiveStudyDays,
    dailyHours,
    weeklyHours,
    isBurnoutRisk,
  } = useMemo(() => {
    // 1. Base hours = chapters * hoursPerChapter * difficulty
    const base = chapters * hoursPerChapter * difficulty;

    // 2. Revision buffer = 25% extra per additional revision pass beyond 1
    const revisionBuffer = base * (revisionPasses * 0.25);
    const totalHours = base + revisionBuffer;

    // 3. Days available: account for studyDaysPerWeek
    // Fraction of days active = studyDaysPerWeek / 7
    const activeFraction = Math.min(7, Math.max(1, studyDaysPerWeek)) / 7;
    const effectiveDays = Math.max(1, Math.round(daysRemaining * activeFraction));

    // 4. Daily study hours
    const daily = totalHours / effectiveDays;
    const weekly = daily * studyDaysPerWeek;

    const isBurnoutRisk = daily > 8.0;

    return {
      baseStudyHours: Number(base.toFixed(1)),
      revisionHours: Number(revisionBuffer.toFixed(1)),
      totalRequiredHours: Number(totalHours.toFixed(1)),
      effectiveStudyDays: effectiveDays,
      dailyHours: Number(daily.toFixed(1)),
      weeklyHours: Number(weekly.toFixed(1)),
      isBurnoutRisk,
    };
  }, [chapters, hoursPerChapter, difficulty, revisionPasses, daysRemaining, studyDaysPerWeek]);

  const handleReset = () => {
    setChapters(10);
    setHoursPerChapter(3.5);
    setDifficulty(1.2);
    setRevisionPasses(2);
    setDaysRemaining(14);
    setStudyDaysPerWeek(6);
  };

  const handleClear = () => {
    setChapters(0);
    setHoursPerChapter(0);
    setDifficulty(1.0);
    setRevisionPasses(1);
    setDaysRemaining(1);
    setStudyDaysPerWeek(5);
  };

  const handleCopyPlan = () => {
    const text = `EXAM PREPARATION STUDY PLAN:\n` +
      `---------------------------\n` +
      `Total Chapters: ${chapters}\n` +
      `Total Required Study Hours: ${totalRequiredHours} hrs (${baseStudyHours} hrs base + ${revisionHours} hrs revision)\n` +
      `Days Remaining: ${daysRemaining} days (${effectiveStudyDays} active study days)\n` +
      `Recommended Daily Study Time: ${dailyHours} hours/day\n` +
      `Weekly Target: ${weeklyHours} hours/week\n` +
      `Burnout Status: ${isBurnoutRisk ? "High intensity pace" : "Balanced sustainable schedule"}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-indigo-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <strong>Exam Study Time Planner:</strong> Calculates the realistic hours required to prepare for tests, distributes study loads across available days, and flags burnout risks. All calculations are performed on device.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Syllabus & Schedule Parameters
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Total Chapters / Modules
                </label>
                <input
                  type="number"
                  value={chapters}
                  onChange={(e) => setChapters(Math.max(1, Number(e.target.value)))}
                  className="neo-input w-full p-2.5 text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Est. Hours per Chapter
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={hoursPerChapter}
                  onChange={(e) => setHoursPerChapter(Math.max(0.5, Number(e.target.value)))}
                  className="neo-input w-full p-2.5 text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Subject Difficulty Multiplier
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="neo-input w-full p-2.5 text-xs font-bold"
                >
                  <option value={0.8}>Easy / Review Material (0.8×)</option>
                  <option value={1.0}>Moderate / Standard Subject (1.0×)</option>
                  <option value={1.2}>Challenging / Problem-Solving (1.2×)</option>
                  <option value={1.5}>Very Hard / Heavy Memorization (1.5×)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Revision Passes Desired
                </label>
                <select
                  value={revisionPasses}
                  onChange={(e) => setRevisionPasses(Number(e.target.value))}
                  className="neo-input w-full p-2.5 text-xs font-bold"
                >
                  <option value={0}>0 (First pass only)</option>
                  <option value={1}>1 Revision Pass (+25% buffer)</option>
                  <option value={2}>2 Revision Passes (+50% buffer)</option>
                  <option value={3}>3 Thorough Passes (+75% buffer)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Days Remaining Until Exam
                </label>
                <input
                  type="number"
                  value={daysRemaining}
                  onChange={(e) => setDaysRemaining(Math.max(1, Number(e.target.value)))}
                  className="neo-input w-full p-2.5 text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                  Study Days Per Week
                </label>
                <select
                  value={studyDaysPerWeek}
                  onChange={(e) => setStudyDaysPerWeek(Number(e.target.value))}
                  className="neo-input w-full p-2.5 text-xs font-bold"
                >
                  <option value={5}>5 Days / Week (2 Rest Days)</option>
                  <option value={6}>6 Days / Week (1 Rest Day)</option>
                  <option value={7}>7 Days / Week (Daily Prep)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-dark/10">
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Default
              </button>
              <button
                onClick={handleClear}
                className="neo-btn text-xs px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output Schedule & Feasibility */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Recommended Daily Target
            </h3>

            {/* Daily study hours hero */}
            <div className="p-6 bg-surface/50 neo-border rounded-xl text-center space-y-1">
              <span className="text-xs font-bold uppercase text-text-secondary block">
                Required Daily Study Time
              </span>
              <div className={`text-5xl font-black font-mono ${isBurnoutRisk ? "text-rose-600" : "text-primary"}`}>
                {dailyHours} hrs
              </div>
              <span className="text-xs text-text-secondary font-mono block">
                (~{Math.round(dailyHours * 60)} minutes/day)
              </span>
            </div>

            {/* Burnout Risk Assessment */}
            <div className={`p-3 neo-border rounded-lg text-xs space-y-1 ${
              isBurnoutRisk ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {isBurnoutRisk ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    High Burnout Pace Warning (&gt;8 hrs/day)
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Healthy & Sustainable Schedule
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {isBurnoutRisk
                  ? "Studying over 8 hours a day leads to steep cognitive fatigue. Consider reducing revision buffer or prioritizing high-yield exam chapters."
                  : `Your plan requires ${dailyHours} hours per study day across ${effectiveStudyDays} active days. This allows ample retention and sleep.`}
              </p>
            </div>

            {/* Detailed Totals */}
            <div className="p-3 bg-surface/30 neo-border rounded-lg space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Base Reading & Study:</span>
                <span className="font-mono font-bold text-gray-800">{baseStudyHours} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Revision & Practice Buffer:</span>
                <span className="font-mono font-bold text-gray-800">{revisionHours} hours</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-1 font-bold">
                <span>Total Prep Hours:</span>
                <span className="font-mono text-primary">{totalRequiredHours} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Weekly Commitment:</span>
                <span className="font-mono text-gray-800">{weeklyHours} hours/week</span>
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyPlan}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Study Plan!" : "Copy Study Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
