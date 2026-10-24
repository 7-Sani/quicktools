"use client";

import { useState, useMemo } from "react";
import {
  BarChart2,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Plus,
  Info,
  TrendingUp,
} from "lucide-react";

interface WeightedItem {
  id: string;
  name: string;
  mark: number;
  weight: number;
}

export default function AverageMarksCalculatorTool() {
  const [mode, setMode] = useState<"quick" | "weighted">("quick");

  // Quick Mode: comma or space separated numbers
  const [quickInput, setQuickInput] = useState<string>("88, 92, 79, 85, 94, 76, 90");
  const [passThreshold, setPassThreshold] = useState<number>(40);

  // Weighted Mode
  const [items, setItems] = useState<WeightedItem[]>([
    { id: "1", name: "Assignment 1", mark: 85, weight: 15 },
    { id: "2", name: "Assignment 2", mark: 90, weight: 15 },
    { id: "3", name: "Midterm Exam", mark: 78, weight: 30 },
    { id: "4", name: "Final Exam", mark: 92, weight: 40 },
  ]);

  const [copied, setCopied] = useState(false);

  // Quick mode calculations
  const quickStats = useMemo(() => {
    const numbers = quickInput
      .split(/[\s,]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));

    if (numbers.length === 0) {
      return {
        count: 0,
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        range: 0,
        stdDev: 0,
        passRate: 0,
        passedCount: 0,
      };
    }

    const count = numbers.length;
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    // Median
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(count / 2);
    const median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    const min = sorted[0];
    const max = sorted[count - 1];
    const range = max - min;

    // Standard deviation
    const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    const passedCount = numbers.filter((n) => n >= passThreshold).length;
    const passRate = (passedCount / count) * 100;

    return {
      count,
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      min,
      max,
      range,
      stdDev: Number(stdDev.toFixed(2)),
      passRate: Number(passRate.toFixed(1)),
      passedCount,
    };
  }, [quickInput, passThreshold]);

  // Weighted mode calculations
  const weightedStats = useMemo(() => {
    const valid = items.filter((i) => !isNaN(i.mark) && !isNaN(i.weight) && i.weight > 0);
    const totalWeight = valid.reduce((sum, i) => sum + i.weight, 0);
    const totalWeightedScore = valid.reduce((sum, i) => sum + i.mark * i.weight, 0);
    const weightedAvg = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      totalWeight,
      weightedAvg: Number(weightedAvg.toFixed(2)),
      formula: `Weighted Average = Σ(Marks × Weight) / Σ(Weights)\n= (${valid
        .map((i) => `${i.mark} × ${i.weight}%`)
        .join(" + ")}) / ${totalWeight}%\n= ${totalWeightedScore.toFixed(1)} / ${totalWeight}\n= ${weightedAvg.toFixed(2)}`,
    };
  }, [items]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: `Assessment ${prev.length + 1}`,
        mark: 80,
        weight: 10,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof WeightedItem, value: string | number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleReset = () => {
    setQuickInput("88, 92, 79, 85, 94, 76, 90");
    setPassThreshold(40);
    setItems([
      { id: "1", name: "Assignment 1", mark: 85, weight: 15 },
      { id: "2", name: "Assignment 2", mark: 90, weight: 15 },
      { id: "3", name: "Midterm Exam", mark: 78, weight: 30 },
      { id: "4", name: "Final Exam", mark: 92, weight: 40 },
    ]);
  };

  const handleClear = () => {
    setQuickInput("");
    setItems([{ id: "1", name: "Item 1", mark: 0, weight: 100 }]);
  };

  const handleCopy = () => {
    const text =
      mode === "quick"
        ? `AVERAGE MARKS SUMMARY:\nMean: ${quickStats.mean}\nMedian: ${quickStats.median}\nHighest: ${quickStats.max}\nLowest: ${quickStats.min}\nStd Dev: ${quickStats.stdDev}\nPassing Rate: ${quickStats.passRate}% (${quickStats.passedCount}/${quickStats.count})`
        : `WEIGHTED AVERAGE SUMMARY:\nWeighted Average: ${weightedStats.weightedAvg}\nTotal Weight: ${weightedStats.totalWeight}%\n\n${weightedStats.formula}`;
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
          <strong>Academic Average Marks Calculator:</strong> Compute simple arithmetic mean, median, spread standard deviation, or syllabus weighted score averages. All calculations run strictly in your browser.
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("quick")}
          className={`px-4 py-2 text-xs font-bold rounded neo-border transition-all ${
            mode === "quick" ? "bg-primary text-white" : "bg-white hover:bg-surface text-gray-800"
          }`}
        >
          Quick Batch Marks List
        </button>
        <button
          onClick={() => setMode("weighted")}
          className={`px-4 py-2 text-xs font-bold rounded neo-border transition-all ${
            mode === "weighted" ? "bg-primary text-white" : "bg-white hover:bg-surface text-gray-800"
          }`}
        >
          Weighted Assessments Table
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="neo-card p-6 bg-white space-y-4">
            {mode === "quick" ? (
              <div className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-primary" /> Enter Exam Scores
                </h2>
                <p className="text-xs text-text-secondary">
                  Type or paste raw test marks separated by commas, spaces, or line breaks.
                </p>

                <textarea
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  rows={6}
                  placeholder="85, 92, 78, 90, 88..."
                  className="neo-input w-full p-3 text-sm font-mono leading-relaxed"
                />

                <div>
                  <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                    Passing Score Threshold:
                  </label>
                  <input
                    type="number"
                    value={passThreshold}
                    onChange={(e) => setPassThreshold(Number(e.target.value))}
                    className="neo-input w-32 p-1.5 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-primary" /> Weighted Assessments
                  </h2>
                  <button
                    onClick={handleAddItem}
                    className="neo-btn text-xs px-3 py-1.5 bg-primary text-white flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Assessment
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-dark text-text-secondary uppercase">
                        <th className="py-2 pr-2">Assessment</th>
                        <th className="py-2 px-2 w-28">Score</th>
                        <th className="py-2 px-2 w-28">Weight (%)</th>
                        <th className="py-2 pl-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                              className="neo-input w-full p-1.5 text-xs font-semibold"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={item.mark}
                              onChange={(e) => handleUpdateItem(item.id, "mark", Number(e.target.value))}
                              className="neo-input w-full p-1.5 text-xs text-center font-mono font-bold"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={item.weight}
                              onChange={(e) => handleUpdateItem(item.id, "weight", Number(e.target.value))}
                              className="neo-input w-full p-1.5 text-xs text-center font-mono"
                            />
                          </td>
                          <td className="py-2 pl-2 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={items.length <= 1}
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

                {weightedStats.totalWeight !== 100 && (
                  <p className="text-xs text-amber-700 font-bold">
                    ⚠️ Total weight is {weightedStats.totalWeight}% (Standard course syllabus total is 100%).
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
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

        {/* Right Column: Statistics Output */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Performance Statistics
            </h3>

            {mode === "quick" ? (
              <div className="space-y-4">
                {/* Mean Hero */}
                <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase text-text-secondary block">
                    Mean / Average Score
                  </span>
                  <div className="text-5xl font-black font-mono text-primary">
                    {quickStats.mean}
                  </div>
                  <span className="text-xs text-text-secondary font-mono block">
                    Across {quickStats.count} Test Scores
                  </span>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-surface/30 neo-border rounded">
                    <span className="text-text-secondary uppercase text-[10px] block font-bold">Median</span>
                    <span className="font-mono font-black text-gray-900 text-sm">{quickStats.median}</span>
                  </div>
                  <div className="p-2.5 bg-surface/30 neo-border rounded">
                    <span className="text-text-secondary uppercase text-[10px] block font-bold">Standard Deviation</span>
                    <span className="font-mono font-black text-gray-900 text-sm">±{quickStats.stdDev}</span>
                  </div>
                  <div className="p-2.5 bg-surface/30 neo-border rounded">
                    <span className="text-text-secondary uppercase text-[10px] block font-bold">Highest Score</span>
                    <span className="font-mono font-black text-emerald-700 text-sm">{quickStats.max}</span>
                  </div>
                  <div className="p-2.5 bg-surface/30 neo-border rounded">
                    <span className="text-text-secondary uppercase text-[10px] block font-bold">Lowest Score</span>
                    <span className="font-mono font-black text-amber-700 text-sm">{quickStats.min}</span>
                  </div>
                  <div className="p-2.5 bg-surface/30 neo-border rounded col-span-2 flex justify-between items-center">
                    <div>
                      <span className="text-text-secondary uppercase text-[10px] block font-bold">Passing Rate (≥{passThreshold})</span>
                      <span className="font-mono font-black text-primary text-sm">{quickStats.passRate}%</span>
                    </div>
                    <span className="text-xs text-text-secondary font-mono">
                      {quickStats.passedCount} / {quickStats.count} Passed
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Weighted Avg Hero */}
                <div className="p-5 bg-surface/50 neo-border rounded-xl text-center space-y-1">
                  <span className="text-xs font-bold uppercase text-text-secondary block">
                    Overall Weighted Grade
                  </span>
                  <div className="text-5xl font-black font-mono text-primary">
                    {weightedStats.weightedAvg}
                  </div>
                  <span className="text-xs text-text-secondary font-mono block">
                    Total Weight: {weightedStats.totalWeight}%
                  </span>
                </div>

                {/* Formula Breakdown */}
                <div className="p-3 bg-surface/30 neo-border rounded-lg space-y-1 text-xs font-mono">
                  <span className="font-bold block text-gray-800">Formula Breakdown:</span>
                  <pre className="whitespace-pre-wrap text-[11px] text-gray-700 leading-tight">
                    {weightedStats.formula}
                  </pre>
                </div>
              </div>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Stats!" : "Copy Average Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
