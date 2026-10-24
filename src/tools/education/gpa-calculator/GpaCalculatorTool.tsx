"use client";

import { useState, useMemo } from "react";
import {
  GraduationCap,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Info,
  BookOpen,
} from "lucide-react";
import {
  calculateGPA,
  CourseEntry,
  GRADING_SCALES,
  GradingScaleType,
} from "@/lib/educationUtils";

export default function GpaCalculatorTool() {
  const [scaleType, setScaleType] = useState<GradingScaleType>("4.0");

  const [courses, setCourses] = useState<CourseEntry[]>([
    { id: "1", name: "Data Structures & Algorithms", credits: 4, gradePoints: 4.0, gradeLabel: "A" },
    { id: "2", name: "Operating Systems", credits: 4, gradePoints: 3.7, gradeLabel: "A-" },
    { id: "3", name: "Linear Algebra", credits: 3, gradePoints: 3.3, gradeLabel: "B+" },
    { id: "4", name: "Technical Writing", credits: 2, gradePoints: 4.0, gradeLabel: "A" },
    { id: "5", name: "Physics Lab", credits: 1, gradePoints: 3.7, gradeLabel: "A-" },
  ]);

  const [copied, setCopied] = useState(false);

  const scaleTable = GRADING_SCALES[scaleType];

  // When scale changes, ensure course grade points match
  const handleScaleChange = (newScale: GradingScaleType) => {
    setScaleType(newScale);
    const defaultGrade = GRADING_SCALES[newScale][0];
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        gradePoints: defaultGrade.points,
        gradeLabel: defaultGrade.grade,
      }))
    );
  };

  const handleAddCourse = () => {
    const defaultGrade = scaleTable[0];
    setCourses((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: `Course ${prev.length + 1}`,
        credits: 3,
        gradePoints: defaultGrade.points,
        gradeLabel: defaultGrade.grade,
      },
    ]);
  };

  const handleRemoveCourse = (id: string) => {
    if (courses.length <= 1) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateGrade = (id: string, gradeGrade: string) => {
    const found = scaleTable.find((g) => g.grade === gradeGrade);
    if (!found) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, gradeLabel: found.grade, gradePoints: found.points } : c
      )
    );
  };

  const handleUpdateCredits = (id: string, credits: number) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, credits: Math.max(0, credits) } : c))
    );
  };

  const handleUpdateName = (id: string, name: string) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  // GPA calculation
  const { gpa, totalCredits, totalQualityPoints, formulaBreakdown } = useMemo(() => {
    return calculateGPA(courses);
  }, [courses]);

  const handleReset = () => {
    setScaleType("4.0");
    setCourses([
      { id: "1", name: "Data Structures & Algorithms", credits: 4, gradePoints: 4.0, gradeLabel: "A" },
      { id: "2", name: "Operating Systems", credits: 4, gradePoints: 3.7, gradeLabel: "A-" },
      { id: "3", name: "Linear Algebra", credits: 3, gradePoints: 3.3, gradeLabel: "B+" },
      { id: "4", name: "Technical Writing", credits: 2, gradePoints: 4.0, gradeLabel: "A" },
      { id: "5", name: "Physics Lab", credits: 1, gradePoints: 3.7, gradeLabel: "A-" },
    ]);
  };

  const handleClear = () => {
    setCourses([
      { id: "1", name: "Course 1", credits: 3, gradePoints: scaleTable[0].points, gradeLabel: scaleTable[0].grade },
    ]);
  };

  const handleCopySummary = () => {
    const text = `GPA Calculation Summary:\nGrading Scale: ${scaleType} Scale\nCalculated GPA: ${gpa.toFixed(3)}\nTotal Credits: ${totalCredits}\nQuality Points: ${totalQualityPoints}\n\nCourses:\n${courses
      .map((c) => `• ${c.name} (${c.credits} cr): ${c.gradeLabel} [${c.gradePoints} pts]`)
      .join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="neo-card p-4 bg-indigo-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <strong>Semester GPA Calculator:</strong> Calculate weighted GPA using US 4.0, Indian 10.0, or 5.0 grading scales. Credits and quality points are computed entirely in your browser without transmitting student records.
        </div>
      </div>

      {/* Scale Selector */}
      <div className="neo-card p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase text-gray-800">Grading Scale:</span>
        </div>
        <div className="flex gap-2">
          {[
            { id: "4.0", label: "US 4.0 Scale" },
            { id: "10.0", label: "10.0 Scale (India/Global)" },
            { id: "5.0", label: "5.0 Scale" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => handleScaleChange(s.id as GradingScaleType)}
              className={`px-3 py-1.5 text-xs font-bold rounded neo-border transition-all ${
                scaleType === s.id ? "bg-primary text-white" : "bg-surface hover:bg-gray-100 text-dark"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Courses Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> Course Credits & Grades
              </h2>
              <button
                onClick={handleAddCourse}
                className="neo-btn text-xs px-3 py-1.5 bg-primary text-white flex items-center gap-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Course
              </button>
            </div>

            {/* Course rows */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-dark text-text-secondary uppercase tracking-wider">
                    <th className="py-2 pr-2">Course Name</th>
                    <th className="py-2 px-2 w-28">Credit Hours</th>
                    <th className="py-2 px-2 w-44">Grade</th>
                    <th className="py-2 px-2 w-24 text-center">Quality Pts</th>
                    <th className="py-2 pl-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.map((course) => {
                    const qualityPoints = (course.credits * course.gradePoints).toFixed(1);

                    return (
                      <tr key={course.id} className="hover:bg-surface/30">
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => handleUpdateName(course.id, e.target.value)}
                            className="neo-input w-full p-1.5 text-xs font-semibold"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.5"
                            value={course.credits}
                            onChange={(e) => handleUpdateCredits(course.id, Number(e.target.value))}
                            className="neo-input w-full p-1.5 text-xs text-center font-mono font-bold"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={course.gradeLabel}
                            onChange={(e) => handleUpdateGrade(course.id, e.target.value)}
                            className="neo-input w-full p-1.5 text-xs"
                          >
                            {scaleTable.map((g) => (
                              <option key={g.grade} value={g.grade}>
                                {g.grade} ({g.points} pts)
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-gray-800">
                          {qualityPoints}
                        </td>
                        <td className="py-2 pl-2 text-center">
                          <button
                            onClick={() => handleRemoveCourse(course.id)}
                            disabled={courses.length <= 1}
                            className="text-gray-400 hover:text-rose-600 disabled:opacity-30 p-1"
                            title="Remove Course"
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

          {/* Scale Documentation Card */}
          <div className="neo-card p-5 bg-surface/40 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Grading Scale Reference Table ({scaleType} Scale)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {scaleTable.map((g) => (
                <div key={g.grade} className="p-2 bg-white neo-border rounded">
                  <span className="font-bold block text-gray-900">{g.grade}</span>
                  <span className="text-[11px] text-primary font-mono font-bold block">{g.points} points</span>
                  <span className="text-[10px] text-text-secondary">{g.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: GPA Output */}
        <div className="lg:col-span-4 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Semester GPA
            </h3>

            {/* GPA Hero display */}
            <div className="p-6 bg-surface/50 neo-border rounded-xl text-center space-y-1">
              <span className="text-xs font-bold uppercase text-text-secondary block">
                Calculated GPA
              </span>
              <div className="text-5xl font-black font-mono text-primary">
                {gpa.toFixed(2)}
              </div>
              <span className="text-xs font-mono text-text-secondary block">
                {gpa.toFixed(3)} / {scaleType}
              </span>
            </div>

            {/* Summary metrics */}
            <div className="p-3 bg-surface/30 neo-border rounded-lg space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Total Credits Attempted:</span>
                <span className="font-mono font-bold text-gray-900">{totalCredits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Quality Points:</span>
                <span className="font-mono font-bold text-gray-900">{totalQualityPoints}</span>
              </div>
            </div>

            {/* Mathematical Formula Breakdown */}
            <div className="p-3 bg-surface/30 neo-border rounded-lg space-y-1 text-xs font-mono">
              <span className="font-bold block text-gray-800">Formula Breakdown:</span>
              <pre className="whitespace-pre-wrap text-[11px] text-gray-700 leading-tight">
                {formulaBreakdown}
              </pre>
            </div>

            <button
              onClick={handleCopySummary}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied GPA Report!" : "Copy GPA Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
