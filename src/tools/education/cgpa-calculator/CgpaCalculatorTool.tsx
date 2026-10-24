"use client";

import { useState, useMemo } from "react";
import {
  Award,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Info,
  Target,
  Sliders,
} from "lucide-react";
import { calculateCGPA, SemesterEntry } from "@/lib/educationUtils";

export default function CgpaCalculatorTool() {
  const [semesters, setSemesters] = useState<SemesterEntry[]>([
    { id: "1", name: "Semester 1", gpa: 3.65, credits: 20 },
    { id: "2", name: "Semester 2", gpa: 3.80, credits: 22 },
    { id: "3", name: "Semester 3", gpa: 3.70, credits: 21 },
    { id: "4", name: "Semester 4", gpa: 3.90, credits: 20 },
  ]);

  const [weightingMode, setWeightingMode] = useState<"credit" | "simple">("credit");

  // Target Projector
  const [showProjector, setShowProjector] = useState(false);
  const [targetCgpa, setTargetCgpa] = useState<number>(3.80);
  const [upcomingCredits, setUpcomingCredits] = useState<number>(20);

  const [copied, setCopied] = useState(false);

  const handleAddSemester = () => {
    setSemesters((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: `Semester ${prev.length + 1}`,
        gpa: 3.5,
        credits: 20,
      },
    ]);
  };

  const handleRemoveSemester = (id: string) => {
    if (semesters.length <= 1) return;
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdate = (id: string, field: keyof SemesterEntry, value: string | number) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // CGPA calculation
  const { cgpa, totalCredits, totalWeightedGpa, formulaBreakdown } = useMemo(() => {
    if (weightingMode === "simple") {
      const valid = semesters.filter((s) => !isNaN(s.gpa));
      const total = valid.reduce((sum, s) => sum + s.gpa, 0);
      const simpleAvg = valid.length > 0 ? total / valid.length : 0;
      const totalCr = semesters.reduce((sum, s) => sum + s.credits, 0);
      return {
        cgpa: Number(simpleAvg.toFixed(3)),
        totalCredits: totalCr,
        totalWeightedGpa: total,
        formulaBreakdown: `Simple Average CGPA = Σ(Semester GPAs) / Number of Semesters\n= (${valid.map((s) => s.gpa).join(" + ")}) / ${valid.length}\n= ${simpleAvg.toFixed(3)}`,
      };
    }
    return calculateCGPA(semesters);
  }, [semesters, weightingMode]);

  // Target Projector calculation:
  // (currentTotalWeighted + requiredGPA * upcomingCredits) / (totalCredits + upcomingCredits) = targetCgpa
  // requiredGPA = (targetCgpa * (totalCredits + upcomingCredits) - currentTotalWeighted) / upcomingCredits
  const finalTotalCredits = totalCredits + upcomingCredits;
  const targetRequiredWeighted = targetCgpa * finalTotalCredits;
  const currentTotalQuality = semesters.reduce((sum, s) => sum + s.gpa * s.credits, 0);
  const requiredGpaOnUpcoming = upcomingCredits > 0
    ? (targetRequiredWeighted - currentTotalQuality) / upcomingCredits
    : 0;

  const isAchievableTarget = requiredGpaOnUpcoming <= 4.0; // or scale limit

  const handleReset = () => {
    setSemesters([
      { id: "1", name: "Semester 1", gpa: 3.65, credits: 20 },
      { id: "2", name: "Semester 2", gpa: 3.80, credits: 22 },
      { id: "3", name: "Semester 3", gpa: 3.70, credits: 21 },
      { id: "4", name: "Semester 4", gpa: 3.90, credits: 20 },
    ]);
    setWeightingMode("credit");
    setTargetCgpa(3.8);
    setUpcomingCredits(20);
  };

  const handleClear = () => {
    setSemesters([
      { id: "1", name: "Semester 1", gpa: 0, credits: 20 },
    ]);
  };

  const handleCopy = () => {
    const text = `Cumulative GPA Report:\nCGPA: ${cgpa.toFixed(3)}\nTotal Credits: ${totalCredits}\nCalculation Mode: ${weightingMode === "credit" ? "Credit-Weighted" : "Simple Average"}\n\nSemesters:\n${semesters
      .map((s) => `• ${s.name}: GPA ${s.gpa} (${s.credits} credits)`)
      .join("\n")}`;
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
          <strong>Cumulative GPA (CGPA) Calculator:</strong> Calculate your multi-semester CGPA using credit weighting or equal weighting. Includes target graduation CGPA planning. All data is processed client-side.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Semesters Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Semesters Overview
              </h2>
              <div className="flex items-center gap-2">
                {/* Weighting selector */}
                <div className="flex bg-surface p-1 neo-border rounded text-xs">
                  <button
                    onClick={() => setWeightingMode("credit")}
                    className={`px-2.5 py-1 rounded font-bold ${
                      weightingMode === "credit" ? "bg-white neo-border text-dark" : "text-text-secondary"
                    }`}
                  >
                    Credit-Weighted
                  </button>
                  <button
                    onClick={() => setWeightingMode("simple")}
                    className={`px-2.5 py-1 rounded font-bold ${
                      weightingMode === "simple" ? "bg-white neo-border text-dark" : "text-text-secondary"
                    }`}
                  >
                    Equal Weighting
                  </button>
                </div>

                <button
                  onClick={handleAddSemester}
                  className="neo-btn text-xs px-3 py-1.5 bg-primary text-white flex items-center gap-1 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Semester
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-dark text-text-secondary uppercase tracking-wider">
                    <th className="py-2 pr-2">Semester / Term</th>
                    <th className="py-2 px-2 w-32">Semester GPA / SGPA</th>
                    <th className="py-2 px-2 w-28">Total Credits</th>
                    <th className="py-2 px-2 w-28 text-center">Weighted Pts</th>
                    <th className="py-2 pl-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {semesters.map((sem) => {
                    const weighted = (sem.gpa * sem.credits).toFixed(2);
                    return (
                      <tr key={sem.id} className="hover:bg-surface/30">
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={sem.name}
                            onChange={(e) => handleUpdate(sem.id, "name", e.target.value)}
                            className="neo-input w-full p-1.5 text-xs font-semibold"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={sem.gpa}
                            onChange={(e) => handleUpdate(sem.id, "gpa", Number(e.target.value))}
                            className="neo-input w-full p-1.5 text-xs text-center font-mono font-bold"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.5"
                            value={sem.credits}
                            onChange={(e) => handleUpdate(sem.id, "credits", Number(e.target.value))}
                            className="neo-input w-full p-1.5 text-xs text-center font-mono"
                          />
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-gray-800">
                          {weighted}
                        </td>
                        <td className="py-2 pl-2 text-center">
                          <button
                            onClick={() => handleRemoveSemester(sem.id)}
                            disabled={semesters.length <= 1}
                            className="text-gray-400 hover:text-rose-600 disabled:opacity-30 p-1"
                            title="Remove Semester"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-dark/10">
              <button
                onClick={() => setShowProjector(!showProjector)}
                className="neo-btn text-xs px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5 font-bold"
              >
                <Target className="w-3.5 h-3.5" /> {showProjector ? "Hide Target Planner" : "Target CGPA Planner"}
              </button>
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

          {/* Target CGPA Projector Card */}
          {showProjector && (
            <div className="neo-card p-5 bg-surface/50 border border-primary/40 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Target className="w-4 h-4 text-primary" /> Target CGPA Projector
              </h3>
              <p className="text-xs text-text-secondary">
                Calculate the exact GPA you must score in your upcoming semester to graduate with your desired CGPA.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                    Target Cumulative CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={targetCgpa}
                    onChange={(e) => setTargetCgpa(Number(e.target.value))}
                    className="neo-input w-full p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                    Upcoming Semester Credits
                  </label>
                  <input
                    type="number"
                    value={upcomingCredits}
                    onChange={(e) => setUpcomingCredits(Number(e.target.value))}
                    className="neo-input w-full p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-white neo-border rounded-lg text-xs leading-relaxed space-y-1 mt-2">
                <span className="font-bold text-gray-800">Required Upcoming GPA:</span>
                <div className="text-2xl font-black font-mono text-primary">
                  {requiredGpaOnUpcoming.toFixed(2)}
                </div>
                <p className="text-[11px] text-text-secondary">
                  To graduate with a {targetCgpa} CGPA across {finalTotalCredits} total credits, you must maintain a GPA of {requiredGpaOnUpcoming.toFixed(2)} in your next {upcomingCredits} credits.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: CGPA Hero Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Cumulative Result
            </h3>

            {/* CGPA display */}
            <div className="p-6 bg-surface/50 neo-border rounded-xl text-center space-y-1">
              <span className="text-xs font-bold uppercase text-text-secondary block">
                Calculated CGPA
              </span>
              <div className="text-5xl font-black font-mono text-primary">
                {cgpa.toFixed(2)}
              </div>
              <span className="text-xs font-mono text-text-secondary block">
                {cgpa.toFixed(3)} Across {semesters.length} Semesters
              </span>
            </div>

            {/* Metrics */}
            <div className="p-3 bg-surface/30 neo-border rounded-lg space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Total Accumulated Credits:</span>
                <span className="font-mono font-bold text-gray-900">{totalCredits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Weighting Mode:</span>
                <span className="font-bold text-gray-800">
                  {weightingMode === "credit" ? "Credit-Weighted" : "Equal-Weighting"}
                </span>
              </div>
            </div>

            {/* Formula breakdown */}
            <div className="p-3 bg-surface/30 neo-border rounded-lg space-y-1 text-xs font-mono">
              <span className="font-bold block text-gray-800">Formula Breakdown:</span>
              <pre className="whitespace-pre-wrap text-[11px] text-gray-700 leading-tight">
                {formulaBreakdown}
              </pre>
            </div>

            <button
              onClick={handleCopy}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied CGPA Report!" : "Copy CGPA Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
