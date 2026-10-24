"use client";

import { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Target,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface GradeComponent {
  id: string;
  name: string;
  weight: number; // e.g. 20%
  score: number; // e.g. 88%
}

export default function GradeCalculatorTool() {
  const [components, setComponents] = useState<GradeComponent[]>([
    { id: "1", name: "Homework & Assignments", weight: 20, score: 94 },
    { id: "2", name: "Quizzes", weight: 15, score: 88 },
    { id: "3", name: "Midterm Exam", weight: 25, score: 82 },
    { id: "4", name: "Project & Lab Work", weight: 15, score: 90 },
  ]);

  // Final Exam Weight & Desired Grade
  const [finalWeight, setFinalWeight] = useState<number>(25);
  const [targetGradePct, setTargetGradePct] = useState<number>(90); // 90% for A

  const [copied, setCopied] = useState(false);

  // Calculations
  const currentTotalWeight = components.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const currentEarnedPoints = components.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0);

  // Current grade so far (normalized to weight completed)
  const currentGradeSoFar = currentTotalWeight > 0 ? (currentEarnedPoints / currentTotalWeight) * 100 : 0;

  // Final exam score needed:
  // (currentEarnedPoints + (neededOnFinal/100) * finalWeight) / (currentTotalWeight + finalWeight) * 100 = targetGradePct
  // Let totalPossibleWeight = currentTotalWeight + finalWeight
  // neededPointsOnFinal = (targetGradePct / 100) * totalPossibleWeight - currentEarnedPoints
  // neededPercentageOnFinal = (neededPointsOnFinal / finalWeight) * 100
  const totalCourseWeight = currentTotalWeight + finalWeight;
  const targetTotalPointsNeeded = (targetGradePct / 100) * (totalCourseWeight / 100) * 100;
  const pointsNeededOnFinal = targetTotalPointsNeeded - currentEarnedPoints;
  const finalScoreRequired = finalWeight > 0 ? (pointsNeededOnFinal / finalWeight) * 100 : 0;

  const isFinalAchievable = finalScoreRequired <= 100;
  const isAlreadySecured = finalScoreRequired <= 0;

  // Letter grade mapping
  const getLetterGrade = (pct: number) => {
    if (pct >= 93) return "A (4.0)";
    if (pct >= 90) return "A- (3.7)";
    if (pct >= 87) return "B+ (3.3)";
    if (pct >= 83) return "B (3.0)";
    if (pct >= 80) return "B- (2.7)";
    if (pct >= 77) return "C+ (2.3)";
    if (pct >= 70) return "C (2.0)";
    if (pct >= 60) return "D (1.0)";
    return "F (0.0)";
  };

  const handleAddComponent = () => {
    setComponents((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: `Component ${prev.length + 1}`,
        weight: 10,
        score: 85,
      },
    ]);
  };

  const handleRemoveComponent = (id: string) => {
    if (components.length <= 1) return;
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdate = (id: string, field: keyof GradeComponent, value: string | number) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleReset = () => {
    setComponents([
      { id: "1", name: "Homework & Assignments", weight: 20, score: 94 },
      { id: "2", name: "Quizzes", weight: 15, score: 88 },
      { id: "3", name: "Midterm Exam", weight: 25, score: 82 },
      { id: "4", name: "Project & Lab Work", weight: 15, score: 90 },
    ]);
    setFinalWeight(25);
    setTargetGradePct(90);
  };

  const handleClear = () => {
    setComponents([{ id: "1", name: "Coursework", weight: 50, score: 0 }]);
    setFinalWeight(50);
  };

  const handleCopyReport = () => {
    const text = `COURSE GRADE SUMMARY:\n` +
      `Current Average: ${currentGradeSoFar.toFixed(2)}% (${getLetterGrade(currentGradeSoFar)})\n` +
      `Completed Weight: ${currentTotalWeight}%\n\n` +
      `FINAL EXAM TARGET PLAN:\n` +
      `Final Exam Weight: ${finalWeight}%\n` +
      `Target Desired Grade: ${targetGradePct}%\n` +
      `Required Score on Final: ${finalScoreRequired.toFixed(1)}%\n` +
      `Status: ${isAlreadySecured ? "Already Secured!" : isFinalAchievable ? "Achievable" : "Requires >100% (Extra credit needed)"}`;
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
          <strong>Weighted Grade & Final Exam Calculator:</strong> Computes weighted course averages and solves for the exact final exam score needed to earn an A, B, or C. Calculated locally on your machine.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Grade Categories */}
        <div className="lg:col-span-7 space-y-4">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Completed Coursework
              </h2>
              <button
                onClick={handleAddComponent}
                className="neo-btn text-xs px-3 py-1.5 bg-primary text-white flex items-center gap-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-dark text-text-secondary uppercase">
                    <th className="py-2 pr-2">Assessment Name</th>
                    <th className="py-2 px-2 w-28">Weight (%)</th>
                    <th className="py-2 px-2 w-28">Your Score (%)</th>
                    <th className="py-2 pl-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {components.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/30">
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdate(item.id, "name", e.target.value)}
                          className="neo-input w-full p-1.5 text-xs font-semibold"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={item.weight}
                          onChange={(e) => handleUpdate(item.id, "weight", Math.max(0, Number(e.target.value)))}
                          className="neo-input w-full p-1.5 text-xs text-center font-mono font-bold"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={item.score}
                          onChange={(e) => handleUpdate(item.id, "score", Math.max(0, Number(e.target.value)))}
                          className="neo-input w-full p-1.5 text-xs text-center font-mono font-bold"
                        />
                      </td>
                      <td className="py-2 pl-2 text-center">
                        <button
                          onClick={() => handleRemoveComponent(item.id)}
                          disabled={components.length <= 1}
                          className="text-gray-400 hover:text-rose-600 disabled:opacity-30 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final Exam Parameters */}
            <div className="p-4 bg-surface/50 neo-border rounded-lg space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Target className="w-4 h-4 text-primary" /> Upcoming Final Exam Planning
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                    Final Exam Weight (%)
                  </label>
                  <input
                    type="number"
                    value={finalWeight}
                    onChange={(e) => setFinalWeight(Math.max(1, Number(e.target.value)))}
                    className="neo-input w-full p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                    Target Course Grade (%)
                  </label>
                  <input
                    type="number"
                    value={targetGradePct}
                    onChange={(e) => setTargetGradePct(Number(e.target.value))}
                    className="neo-input w-full p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-dark/10">
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

        {/* Right Column: Grade Output & Solver */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Course Standing & Final Score Solver
            </h3>

            {/* Current Grade Hero */}
            <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
              <span className="text-xs font-bold uppercase text-text-secondary block">
                Current Average So Far
              </span>
              <div className="text-4xl font-black font-mono text-primary">
                {currentGradeSoFar.toFixed(1)}%
              </div>
              <span className="text-xs font-bold text-gray-700 block">
                Letter Grade: {getLetterGrade(currentGradeSoFar)}
              </span>
              <span className="text-[11px] text-text-secondary">
                ({currentTotalWeight}% of course syllabus completed)
              </span>
            </div>

            {/* Final Exam Required Solver Box */}
            <div className={`p-4 neo-border rounded-xl space-y-2 ${
              isAlreadySecured
                ? "bg-emerald-50 text-emerald-900"
                : isFinalAchievable
                ? "bg-indigo-50 text-indigo-900"
                : "bg-rose-50 text-rose-900"
            }`}>
              <span className="text-xs font-black uppercase tracking-wider block">
                Target Score Solver (For {targetGradePct}% Overall)
              </span>

              <div className="text-3xl font-black font-mono">
                {finalScoreRequired.toFixed(1)}%
              </div>
              <span className="text-xs font-bold block">
                Score needed on the Final Exam ({finalWeight}% weight)
              </span>

              <p className="text-[11px] leading-relaxed pt-1 border-t border-dark/10">
                {isAlreadySecured
                  ? "🎉 You have already secured your target grade even with 0% on the final exam!"
                  : isFinalAchievable
                  ? `✅ Scoring at least ${finalScoreRequired.toFixed(1)}% on your ${finalWeight}% final exam secures your ${targetGradePct}% target grade.`
                  : `⚠️ Mathematically unreachable without extra credit: You would need ${finalScoreRequired.toFixed(1)}% on the final exam.`}
              </p>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyReport}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Grade Summary!" : "Copy Grade Summary"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
