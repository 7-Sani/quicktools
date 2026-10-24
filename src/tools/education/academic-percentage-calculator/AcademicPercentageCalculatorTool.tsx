"use client";

import { useState } from "react";
import {
  Percent,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Info,
  Target,
  TrendingUp,
  HelpCircle,
} from "lucide-react";

export default function AcademicPercentageCalculatorTool() {
  const [tab, setTab] = useState<"standard" | "part" | "target" | "change">("standard");

  // Mode 1: Standard Score Percentage (Obtained / Total)
  const [obtained, setObtained] = useState<number>(442);
  const [total, setTotal] = useState<number>(500);

  // Mode 2: Percentage of Total (X% of Total)
  const [pctInput, setPctInput] = useState<number>(75);
  const [totalMarksPart, setTotalMarksPart] = useState<number>(600);

  // Mode 3: Target Marks Goal Finder
  const [currentObtained, setCurrentObtained] = useState<number>(140);
  const [currentMax, setCurrentMax] = useState<number>(200);
  const [finalWeightMax, setFinalWeightMax] = useState<number>(100);
  const [targetPercentage, setTargetPercentage] = useState<number>(80);

  // Mode 4: Percentage Change (Test 1 vs Test 2)
  const [test1, setTest1] = useState<number>(68);
  const [test2, setTest2] = useState<number>(84);

  const [copied, setCopied] = useState(false);

  // Calculations
  // 1. Standard
  const isValidStandard = total > 0 && obtained >= 0;
  const standardPct = isValidStandard ? (obtained / total) * 100 : 0;
  const standardFormula = `Percentage = (${obtained} / ${total}) × 100 = ${standardPct.toFixed(2)}%`;

  // 2. Part
  const marksFromPct = (pctInput / 100) * totalMarksPart;
  const partFormula = `Marks = (${pctInput}% / 100) × ${totalMarksPart} = ${marksFromPct.toFixed(2)}`;

  // 3. Target Finder
  // Total possible = currentMax + finalWeightMax
  // Target total needed = targetPercentage% of (currentMax + finalWeightMax)
  // Marks needed on remaining = Target total needed - currentObtained
  const totalCourseMax = currentMax + finalWeightMax;
  const targetTotalMarksNeeded = (targetPercentage / 100) * totalCourseMax;
  const marksNeededOnFinal = targetTotalMarksNeeded - currentObtained;
  const pctNeededOnFinal = finalWeightMax > 0 ? (marksNeededOnFinal / finalWeightMax) * 100 : 0;
  const isTargetAchievable = marksNeededOnFinal <= finalWeightMax;
  const isAlreadyAchieved = marksNeededOnFinal <= 0;

  // 4. Change
  const diff = test2 - test1;
  const pctChange = test1 > 0 ? (diff / test1) * 100 : 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setObtained(442);
    setTotal(500);
    setPctInput(75);
    setTotalMarksPart(600);
    setCurrentObtained(140);
    setCurrentMax(200);
    setFinalWeightMax(100);
    setTargetPercentage(80);
    setTest1(68);
    setTest2(84);
  };

  const handleClear = () => {
    setObtained(0);
    setTotal(0);
    setPctInput(0);
    setTotalMarksPart(0);
    setCurrentObtained(0);
    setCurrentMax(0);
    setFinalWeightMax(0);
    setTargetPercentage(0);
    setTest1(0);
    setTest2(0);
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-indigo-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <strong>Academic Percentage Calculator:</strong> Compute exam score percentages, find required marks to reach your desired target percentage, and track score changes between terms. All calculations occur strictly in your browser.
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "standard", label: "Marks to %", icon: Percent },
          { id: "part", label: "Score of Total", icon: HelpCircle },
          { id: "target", label: "Target Goal Finder", icon: Target },
          { id: "change", label: "Score Improvement %", icon: TrendingUp },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id as never)}
              className={`px-4 py-2 text-xs font-bold rounded neo-border flex items-center gap-1.5 transition-all ${
                tab === item.id ? "bg-primary text-white" : "bg-white hover:bg-surface text-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            {/* TAB 1: STANDARD MARKS TO PERCENTAGE */}
            {tab === "standard" && (
              <div className="space-y-4">
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Marks to Percentage
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Marks Obtained
                    </label>
                    <input
                      type="number"
                      value={obtained}
                      onChange={(e) => setObtained(Number(e.target.value))}
                      className="neo-input w-full p-2.5 text-sm font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Total Maximum Marks
                    </label>
                    <input
                      type="number"
                      value={total}
                      onChange={(e) => setTotal(Number(e.target.value))}
                      className="neo-input w-full p-2.5 text-sm font-mono font-bold"
                    />
                  </div>
                </div>

                {obtained > total && (
                  <p className="text-xs text-rose-600 font-bold">
                    ⚠️ Obtained marks ({obtained}) exceed maximum marks ({total}). Please verify your input.
                  </p>
                )}
              </div>
            )}

            {/* TAB 2: SCORE OF TOTAL */}
            {tab === "part" && (
              <div className="space-y-4">
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Calculate Marks from Percentage
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Required Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={pctInput}
                      onChange={(e) => setPctInput(Number(e.target.value))}
                      className="neo-input w-full p-2.5 text-sm font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Total Course Marks
                    </label>
                    <input
                      type="number"
                      value={totalMarksPart}
                      onChange={(e) => setTotalMarksPart(Number(e.target.value))}
                      className="neo-input w-full p-2.5 text-sm font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TARGET GOAL FINDER */}
            {tab === "target" && (
              <div className="space-y-4">
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Target Marks Goal Finder
                </h2>
                <p className="text-xs text-text-secondary">
                  Find the exact score needed on your remaining assignments or final exam to reach your target percentage.
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Current Marks Obtained
                    </label>
                    <input
                      type="number"
                      value={currentObtained}
                      onChange={(e) => setCurrentObtained(Number(e.target.value))}
                      className="neo-input w-full p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Current Completed Max Marks
                    </label>
                    <input
                      type="number"
                      value={currentMax}
                      onChange={(e) => setCurrentMax(Number(e.target.value))}
                      className="neo-input w-full p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Upcoming / Final Exam Max Marks
                    </label>
                    <input
                      type="number"
                      value={finalWeightMax}
                      onChange={(e) => setFinalWeightMax(Number(e.target.value))}
                      className="neo-input w-full p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Target Overall Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={targetPercentage}
                      onChange={(e) => setTargetPercentage(Number(e.target.value))}
                      className="neo-input w-full p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SCORE IMPROVEMENT / CHANGE */}
            {tab === "change" && (
              <div className="space-y-4">
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Score Improvement Percentage
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Initial Exam Marks (Test 1)
                    </label>
                    <input
                      type="number"
                      value={test1}
                      onChange={(e) => setTest1(Number(e.target.value))}
                      className="neo-input w-full p-2.5 text-sm font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Subsequent Exam Marks (Test 2)
                    </label>
                    <input
                      type="number"
                      value={test2}
                      onChange={(e) => setTest2(Number(e.target.value))}
                      className="neo-input w-full p-2.5 text-sm font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2 pt-3 border-t border-dark/10">
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
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

        {/* Right Column: Output & Formula */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Calculation Result
            </h3>

            {/* Standard Result */}
            {tab === "standard" && (
              <div className="space-y-4">
                <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase text-text-secondary block">
                    Your Percentage
                  </span>
                  <div className="text-4xl font-black font-mono text-primary">
                    {standardPct.toFixed(2)}%
                  </div>
                  <span className="text-xs text-text-secondary">
                    {obtained} out of {total} marks
                  </span>
                </div>

                <div className="p-3 bg-surface/30 neo-border rounded text-xs font-mono space-y-1">
                  <span className="font-bold block text-gray-700">Formula Breakdown:</span>
                  <p>{standardFormula}</p>
                </div>

                <button
                  onClick={() => handleCopy(`${standardPct.toFixed(2)}% (${obtained}/${total})`)}
                  className="neo-btn w-full py-2 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied Result!" : "Copy Result"}
                </button>
              </div>
            )}

            {/* Part Result */}
            {tab === "part" && (
              <div className="space-y-4">
                <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase text-text-secondary block">
                    Marks Equivalent to {pctInput}%
                  </span>
                  <div className="text-4xl font-black font-mono text-primary">
                    {marksFromPct.toFixed(2)}
                  </div>
                  <span className="text-xs text-text-secondary">
                    out of {totalMarksPart} total marks
                  </span>
                </div>

                <div className="p-3 bg-surface/30 neo-border rounded text-xs font-mono space-y-1">
                  <span className="font-bold block text-gray-700">Formula Breakdown:</span>
                  <p>{partFormula}</p>
                </div>

                <button
                  onClick={() => handleCopy(`${marksFromPct.toFixed(2)} marks (${pctInput}% of ${totalMarksPart})`)}
                  className="neo-btn w-full py-2 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied Result!" : "Copy Result"}
                </button>
              </div>
            )}

            {/* Target Goal Result */}
            {tab === "target" && (
              <div className="space-y-4">
                <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase text-text-secondary block">
                    Score Needed on Upcoming Exam
                  </span>
                  <div className={`text-3xl font-black font-mono ${isTargetAchievable ? "text-primary" : "text-rose-600"}`}>
                    {marksNeededOnFinal.toFixed(1)} / {finalWeightMax}
                  </div>
                  <span className="text-xs text-text-secondary block">
                    ({pctNeededOnFinal.toFixed(1)}% needed on the remaining test)
                  </span>
                </div>

                <div className="p-3 bg-surface/30 neo-border rounded text-xs space-y-1">
                  <div className="font-bold text-gray-800">Goal Feasibility:</div>
                  {isAlreadyAchieved ? (
                    <p className="text-emerald-700 font-semibold">
                      🎉 You have already secured your target score based on completed assignments!
                    </p>
                  ) : isTargetAchievable ? (
                    <p className="text-emerald-700 font-semibold">
                      ✅ Achievable! Scoring {marksNeededOnFinal.toFixed(1)} marks ({pctNeededOnFinal.toFixed(1)}%) achieves your overall {targetPercentage}% goal.
                    </p>
                  ) : (
                    <p className="text-rose-700 font-semibold">
                      ⚠️ Math Alert: Reaching {targetPercentage}% requires {marksNeededOnFinal.toFixed(1)} marks, which exceeds the {finalWeightMax} maximum marks available.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleCopy(`Needed: ${marksNeededOnFinal.toFixed(1)}/${finalWeightMax} (${pctNeededOnFinal.toFixed(1)}%) for target ${targetPercentage}%`)}
                  className="neo-btn w-full py-2 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied Goal!" : "Copy Goal Summary"}
                </button>
              </div>
            )}

            {/* Change Result */}
            {tab === "change" && (
              <div className="space-y-4">
                <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase text-text-secondary block">
                    Score Difference
                  </span>
                  <div className={`text-4xl font-black font-mono ${pctChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {pctChange >= 0 ? `+${pctChange.toFixed(2)}%` : `${pctChange.toFixed(2)}%`}
                  </div>
                  <span className="text-xs text-text-secondary">
                    {diff >= 0 ? `Gain of +${diff} marks` : `Drop of ${diff} marks`}
                  </span>
                </div>

                <div className="p-3 bg-surface/30 neo-border rounded text-xs font-mono space-y-1">
                  <span className="font-bold block text-gray-700">Formula Breakdown:</span>
                  <p>Change = (({test2} - {test1}) / {test1}) × 100 = {pctChange.toFixed(2)}%</p>
                </div>

                <button
                  onClick={() => handleCopy(`Score Change: ${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}% (${test1} → ${test2})`)}
                  className="neo-btn w-full py-2 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied Result!" : "Copy Result"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
