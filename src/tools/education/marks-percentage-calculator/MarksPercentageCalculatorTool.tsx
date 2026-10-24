"use client";

import { useState } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Info,
  Award,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface SubjectRow {
  id: string;
  name: string;
  obtained: number;
  maxMarks: number;
  passMarks: number;
}

export default function MarksPercentageCalculatorTool() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([
    { id: "1", name: "Mathematics", obtained: 92, maxMarks: 100, passMarks: 35 },
    { id: "2", name: "Physics", obtained: 85, maxMarks: 100, passMarks: 35 },
    { id: "3", name: "Computer Science", obtained: 96, maxMarks: 100, passMarks: 35 },
    { id: "4", name: "Chemistry", obtained: 78, maxMarks: 100, passMarks: 35 },
    { id: "5", name: "English Language", obtained: 88, maxMarks: 100, passMarks: 35 },
  ]);

  const [copied, setCopied] = useState(false);

  // Add subject row
  const handleAddSubject = () => {
    setSubjects((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: `Subject ${prev.length + 1}`,
        obtained: 80,
        maxMarks: 100,
        passMarks: 35,
      },
    ]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdate = (id: string, field: keyof SubjectRow, value: string | number) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Calculations
  const totalObtained = subjects.reduce((sum, s) => sum + (Number(s.obtained) || 0), 0);
  const totalMax = subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0);
  const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  // Pass / Fail detection
  const failedSubjects = subjects.filter((s) => s.obtained < s.passMarks);
  const isAllPassed = failedSubjects.length === 0;

  // Grade / Division
  let division = "Fail";
  if (isAllPassed) {
    if (overallPercentage >= 75) division = "First Class with Distinction";
    else if (overallPercentage >= 60) division = "First Division";
    else if (overallPercentage >= 50) division = "Second Division";
    else if (overallPercentage >= 35) division = "Third / Pass Division";
  }

  // Highest & Lowest
  const sortedSubjects = [...subjects].sort((a, b) => b.obtained - a.obtained);
  const highestSubject = sortedSubjects[0];
  const lowestSubject = sortedSubjects[sortedSubjects.length - 1];

  const handleReset = () => {
    setSubjects([
      { id: "1", name: "Mathematics", obtained: 92, maxMarks: 100, passMarks: 35 },
      { id: "2", name: "Physics", obtained: 85, maxMarks: 100, passMarks: 35 },
      { id: "3", name: "Computer Science", obtained: 96, maxMarks: 100, passMarks: 35 },
      { id: "4", name: "Chemistry", obtained: 78, maxMarks: 100, passMarks: 35 },
      { id: "5", name: "English Language", obtained: 88, maxMarks: 100, passMarks: 35 },
    ]);
  };

  const handleClear = () => {
    setSubjects([
      { id: "1", name: "Subject 1", obtained: 0, maxMarks: 100, passMarks: 35 },
    ]);
  };

  const handleCopyReport = () => {
    const lines = [
      "ACADEMIC MARKS REPORT",
      "---------------------",
      ...subjects.map(
        (s) => `${s.name}: ${s.obtained}/${s.maxMarks} (${((s.obtained / s.maxMarks) * 100).toFixed(1)}%) - ${s.obtained >= s.passMarks ? "PASS" : "FAIL"}`
      ),
      "---------------------",
      `Total Marks: ${totalObtained} / ${totalMax}`,
      `Percentage: ${overallPercentage.toFixed(2)}%`,
      `Result: ${isAllPassed ? "PASSED" : "FAILED / COMPARTMENT"} (${division})`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-indigo-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <strong>Marks Percentage Calculator:</strong> Calculate subject aggregates, overall percentage, and pass/fail standings with individual subject thresholds. All marks are computed locally in your browser.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Subject Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" /> Subject Scores
              </h2>
              <button
                onClick={handleAddSubject}
                className="neo-btn text-xs px-3 py-1.5 bg-primary text-white flex items-center gap-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subject
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-dark text-text-secondary uppercase tracking-wider">
                    <th className="py-2 pr-2">Subject Name</th>
                    <th className="py-2 px-2 w-28">Marks Obtained</th>
                    <th className="py-2 px-2 w-24">Max Marks</th>
                    <th className="py-2 px-2 w-24">Pass Mark</th>
                    <th className="py-2 px-2 w-20 text-center">Score %</th>
                    <th className="py-2 pl-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjects.map((sub) => {
                    const pct = sub.maxMarks > 0 ? (sub.obtained / sub.maxMarks) * 100 : 0;
                    const isPassed = sub.obtained >= sub.passMarks;
                    const isExceeding = sub.obtained > sub.maxMarks;

                    return (
                      <tr key={sub.id} className="hover:bg-surface/30">
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) => handleUpdate(sub.id, "name", e.target.value)}
                            className="neo-input w-full p-1.5 text-xs font-semibold"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={sub.obtained}
                            onChange={(e) => handleUpdate(sub.id, "obtained", Math.max(0, Number(e.target.value)))}
                            className={`neo-input w-full p-1.5 text-xs text-center font-mono font-bold ${
                              isExceeding ? "border-rose-500 bg-rose-50 text-rose-700" : ""
                            }`}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={sub.maxMarks}
                            onChange={(e) => handleUpdate(sub.id, "maxMarks", Math.max(1, Number(e.target.value)))}
                            className="neo-input w-full p-1.5 text-xs text-center font-mono"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={sub.passMarks}
                            onChange={(e) => handleUpdate(sub.id, "passMarks", Math.max(0, Number(e.target.value)))}
                            className="neo-input w-full p-1.5 text-xs text-center font-mono"
                          />
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold">
                          <span className={isPassed ? "text-emerald-700" : "text-rose-600"}>
                            {pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2 pl-2 text-center">
                          <button
                            onClick={() => handleRemoveSubject(sub.id)}
                            disabled={subjects.length <= 1}
                            className="text-gray-400 hover:text-rose-600 disabled:opacity-30 p-1"
                            title="Remove Subject"
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
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Default
              </button>
              <button
                onClick={handleClear}
                className="neo-btn text-xs px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Scorecard Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" /> Examination Summary
            </h3>

            {/* Percentage Display */}
            <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
              <span className="text-xs font-bold uppercase text-text-secondary block">
                Total Percentage
              </span>
              <div className="text-4xl font-black font-mono text-primary">
                {overallPercentage.toFixed(2)}%
              </div>
              <span className="text-xs font-bold text-gray-700">
                {totalObtained} / {totalMax} Marks
              </span>
            </div>

            {/* Status & Division */}
            <div className="p-3 bg-surface/30 neo-border rounded-lg space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Result Status:</span>
                <span className={`font-bold flex items-center gap-1 ${isAllPassed ? "text-emerald-700" : "text-rose-600"}`}>
                  {isAllPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {isAllPassed ? "PASSED" : "FAILED / COMPARTMENT"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Academic Division:</span>
                <span className="font-bold text-gray-800">{division}</span>
              </div>
              {highestSubject && (
                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                  <span>Top Subject:</span>
                  <span className="font-bold text-emerald-700">
                    {highestSubject.name} ({highestSubject.obtained})
                  </span>
                </div>
              )}
              {lowestSubject && (
                <div className="flex justify-between items-center">
                  <span>Lowest Subject:</span>
                  <span className="font-bold text-amber-700">
                    {lowestSubject.name} ({lowestSubject.obtained})
                  </span>
                </div>
              )}
            </div>

            {/* Copy Report Button */}
            <button
              onClick={handleCopyReport}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Marks Report!" : "Copy Full Marks Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
