"use client";

import { useState } from "react";
import {
  UserCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
} from "lucide-react";
import { calculateAttendance, AttendanceResult } from "@/lib/educationUtils";

interface SubjectAttendance {
  id: string;
  name: string;
  total: number;
  attended: number;
}

export default function AttendancePercentageCalculatorTool() {
  const [requiredPct, setRequiredPct] = useState<number>(75);

  // Single Quick Mode vs Multi-Subject Mode
  const [mode, setMode] = useState<"single" | "multi">("single");

  // Single mode inputs
  const [singleTotal, setSingleTotal] = useState<number>(48);
  const [singleAttended, setSingleAttended] = useState<number>(40);

  // Multi-subject list
  const [subjects, setSubjects] = useState<SubjectAttendance[]>([
    { id: "1", name: "Data Structures", total: 42, attended: 36 },
    { id: "2", name: "Operating Systems", total: 40, attended: 28 },
    { id: "3", name: "Database Management", total: 38, attended: 32 },
    { id: "4", name: "Discrete Math", total: 35, attended: 24 },
  ]);

  const [copied, setCopied] = useState(false);

  // Single calculation
  const singleResult: AttendanceResult = calculateAttendance(singleTotal, singleAttended, requiredPct);

  // Multi calculations
  const totalHeldAll = subjects.reduce((sum, s) => sum + s.total, 0);
  const totalAttendedAll = subjects.reduce((sum, s) => sum + s.attended, 0);
  const aggregateResult = calculateAttendance(totalHeldAll, totalAttendedAll, requiredPct);

  const handleAddSubject = () => {
    setSubjects((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: `Course ${prev.length + 1}`,
        total: 40,
        attended: 32,
      },
    ]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdate = (id: string, field: keyof SubjectAttendance, value: string | number) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleReset = () => {
    setRequiredPct(75);
    setSingleTotal(48);
    setSingleAttended(40);
    setSubjects([
      { id: "1", name: "Data Structures", total: 42, attended: 36 },
      { id: "2", name: "Operating Systems", total: 40, attended: 28 },
      { id: "3", name: "Database Management", total: 38, attended: 32 },
      { id: "4", name: "Discrete Math", total: 35, attended: 24 },
    ]);
  };

  const handleClear = () => {
    setSingleTotal(0);
    setSingleAttended(0);
    setSubjects([{ id: "1", name: "Course 1", total: 0, attended: 0 }]);
  };

  const handleCopyReport = () => {
    let report = "";
    if (mode === "single") {
      report = `ATTENDANCE REPORT:\n` +
        `Total Classes Held: ${singleTotal}\n` +
        `Classes Attended: ${singleAttended}\n` +
        `Current Attendance: ${singleResult.currentPercentage}%\n` +
        `Required Criteria: ${requiredPct}%\n` +
        `Status: ${singleResult.isEligible ? "ELIGIBLE" : "SHORTAGE / AT RISK"}\n` +
        `Guidance: ${singleResult.statusMessage}`;
    } else {
      report = `MULTI-SUBJECT ATTENDANCE REPORT:\n` +
        `Required Benchmark: ${requiredPct}%\n` +
        `Aggregate: ${aggregateResult.currentPercentage}% (${totalAttendedAll}/${totalHeldAll} classes)\n\n` +
        subjects
          .map((s) => {
            const r = calculateAttendance(s.total, s.attended, requiredPct);
            return `• ${s.name}: ${r.currentPercentage}% (${s.attended}/${s.total}) - ${r.isEligible ? `Can miss ${r.safeBunkCount} classes` : `Need ${r.catchUpRequired} classes`}`;
          })
          .join("\n");
    }
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-indigo-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <strong>Attendance & Safe Absence Calculator:</strong> Calculate exact attendance percentage, check compliance with mandatory thresholds (e.g. 75%), find how many future classes you can safely miss, or calculate recovery classes needed. Processed 100% locally.
        </div>
      </div>

      {/* Mode Toggle & Criteria */}
      <div className="neo-card p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("single")}
            className={`px-3 py-1.5 text-xs font-bold rounded neo-border ${
              mode === "single" ? "bg-primary text-white" : "bg-surface hover:bg-gray-100 text-dark"
            }`}
          >
            Quick Calculator
          </button>
          <button
            onClick={() => setMode("multi")}
            className={`px-3 py-1.5 text-xs font-bold rounded neo-border ${
              mode === "multi" ? "bg-primary text-white" : "bg-surface hover:bg-gray-100 text-dark"
            }`}
          >
            Multi-Subject Tracker
          </button>
        </div>

        {/* Required Percentage Threshold */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-text-secondary">Required Criteria:</span>
          <select
            value={requiredPct}
            onChange={(e) => setRequiredPct(Number(e.target.value))}
            className="neo-input p-1.5 text-xs font-mono font-bold"
          >
            <option value={70}>70% Requirement</option>
            <option value={75}>75% Standard (College Rule)</option>
            <option value={80}>80% Strict Requirement</option>
            <option value={85}>85% High Benchmark</option>
            <option value={90}>90% Distinction Criteria</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="neo-card p-6 bg-white space-y-4">
            {mode === "single" ? (
              <div className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" /> Single Course Attendance
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Total Classes Conducted So Far
                    </label>
                    <input
                      type="number"
                      value={singleTotal}
                      onChange={(e) => setSingleTotal(Math.max(1, Number(e.target.value)))}
                      className="neo-input w-full p-2.5 text-sm font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                      Classes You Attended
                    </label>
                    <input
                      type="number"
                      value={singleAttended}
                      onChange={(e) => setSingleAttended(Math.max(0, Number(e.target.value)))}
                      className="neo-input w-full p-2.5 text-sm font-mono font-bold"
                    />
                  </div>
                </div>

                {singleAttended > singleTotal && (
                  <p className="text-xs text-rose-600 font-bold">
                    ⚠️ Attended classes cannot exceed total classes conducted!
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" /> Subject Attendance List
                  </h2>
                  <button
                    onClick={handleAddSubject}
                    className="neo-btn text-xs px-3 py-1.5 bg-primary text-white flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Course
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-dark text-text-secondary uppercase">
                        <th className="py-2 pr-2">Course Name</th>
                        <th className="py-2 px-2 w-24">Attended</th>
                        <th className="py-2 px-2 w-24">Total Held</th>
                        <th className="py-2 px-2 w-24 text-center">Score %</th>
                        <th className="py-2 pl-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {subjects.map((s) => {
                        const r = calculateAttendance(s.total, s.attended, requiredPct);
                        return (
                          <tr key={s.id}>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={s.name}
                                onChange={(e) => handleUpdate(s.id, "name", e.target.value)}
                                className="neo-input w-full p-1.5 text-xs font-semibold"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                value={s.attended}
                                onChange={(e) => handleUpdate(s.id, "attended", Math.max(0, Number(e.target.value)))}
                                className="neo-input w-full p-1.5 text-xs text-center font-mono font-bold"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                value={s.total}
                                onChange={(e) => handleUpdate(s.id, "total", Math.max(1, Number(e.target.value)))}
                                className="neo-input w-full p-1.5 text-xs text-center font-mono"
                              />
                            </td>
                            <td className="py-2 px-2 text-center font-mono font-bold">
                              <span className={r.isEligible ? "text-emerald-700" : "text-rose-600"}>
                                {r.currentPercentage}%
                              </span>
                            </td>
                            <td className="py-2 pl-2 text-center">
                              <button
                                onClick={() => handleRemoveSubject(s.id)}
                                disabled={subjects.length <= 1}
                                className="text-gray-400 hover:text-rose-600 disabled:opacity-20 p-1"
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
              </div>
            )}

            {/* Controls */}
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
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Status & Action Recommendations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Attendance Standing
            </h3>

            {/* Single Mode Result */}
            {mode === "single" ? (
              <div className="space-y-4">
                <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase text-text-secondary block">
                    Current Attendance
                  </span>
                  <div className={`text-5xl font-black font-mono ${
                    singleResult.isEligible ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {singleResult.currentPercentage}%
                  </div>
                  <span className="text-xs text-text-secondary font-mono block">
                    {singleAttended} attended / {singleTotal} held
                  </span>
                </div>

                {/* Safe Absence vs Catch-up Card */}
                <div className={`p-4 neo-border rounded-xl space-y-2 ${
                  singleResult.isEligible
                    ? "bg-emerald-50 text-emerald-900"
                    : "bg-rose-50 text-rose-900"
                }`}>
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    {singleResult.isEligible ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Criteria Satisfied (≥{requiredPct}%)
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Attendance Shortage (&lt;{requiredPct}%)
                      </>
                    )}
                  </div>

                  <div className="text-2xl font-black font-mono">
                    {singleResult.isEligible
                      ? `${singleResult.safeBunkCount} Classes Safe to Miss`
                      : `${singleResult.catchUpRequired} Consecutive Classes Needed`}
                  </div>

                  <p className="text-[11px] leading-relaxed pt-1 border-t border-dark/10">
                    {singleResult.statusMessage}
                  </p>
                </div>

                {/* Formula Breakdown */}
                <div className="p-3 bg-surface/30 neo-border rounded-lg space-y-1 text-xs font-mono">
                  <span className="font-bold block text-gray-800">Calculation Formula:</span>
                  <p>{singleResult.formula}</p>
                </div>
              </div>
            ) : (
              /* Multi-Subject Aggregate Result */
              <div className="space-y-4">
                <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase text-text-secondary block">
                    Aggregate Attendance
                  </span>
                  <div className={`text-5xl font-black font-mono ${
                    aggregateResult.isEligible ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {aggregateResult.currentPercentage}%
                  </div>
                  <span className="text-xs text-text-secondary font-mono block">
                    {totalAttendedAll} of {totalHeldAll} across all courses
                  </span>
                </div>

                {/* Per-Course Summary */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 text-xs">
                  {subjects.map((sub) => {
                    const r = calculateAttendance(sub.total, sub.attended, requiredPct);
                    return (
                      <div key={sub.id} className="p-2.5 bg-surface/40 neo-border rounded flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-gray-900">{sub.name}</span>
                          <span className="text-[10px] text-text-secondary">
                            {r.isEligible ? `Can miss ${r.safeBunkCount} more` : `Must attend next ${r.catchUpRequired}`}
                          </span>
                        </div>
                        <span className={`font-mono font-bold text-sm ${r.isEligible ? "text-emerald-700" : "text-rose-600"}`}>
                          {r.currentPercentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopyReport}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Attendance Report!" : "Copy Attendance Summary"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
