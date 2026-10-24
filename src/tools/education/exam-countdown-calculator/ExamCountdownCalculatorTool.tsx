"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Info,
  AlertCircle,
} from "lucide-react";

interface ExamItem {
  id: string;
  name: string;
  dateStr: string; // YYYY-MM-DDTHH:mm
  location?: string;
}

export default function ExamCountdownCalculatorTool() {
  // Setup default exams relative to current date
  const [exams, setExams] = useState<ExamItem[]>(() => {
    const now = new Date();
    const d1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const d2 = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);
    const d3 = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);

    const format = (d: Date) => d.toISOString().slice(0, 16);

    return [
      { id: "1", name: "Data Structures Midterm", dateStr: format(d1), location: "Hall A - Room 204" },
      { id: "2", name: "Operating Systems Final", dateStr: format(d2), location: "Auditorium 3" },
      { id: "3", name: "Linear Algebra Final Exam", dateStr: format(d3), location: "Science Complex 102" },
    ];
  });

  const [selectedExamId, setSelectedExamId] = useState<string>("1");
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [copied, setCopied] = useState(false);

  // Live timer tick every 1000ms
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Calculate countdown
  const countdown = (() => {
    if (!selectedExam) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, isPast: true };
    const target = new Date(selectedExam.dateStr).getTime();
    const diff = target - nowTime;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const totalHours = Math.round(diff / (1000 * 60 * 60));

    return { days, hours, minutes, seconds, totalHours, isPast: false };
  })();

  const handleAddExam = () => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    const newId = Math.random().toString(36).substring(2, 9);
    setExams((prev) => [
      ...prev,
      {
        id: newId,
        name: `Upcoming Exam ${prev.length + 1}`,
        dateStr: d,
        location: "Main Exam Hall",
      },
    ]);
    setSelectedExamId(newId);
  };

  const handleRemoveExam = (id: string) => {
    if (exams.length <= 1) return;
    setExams((prev) => prev.filter((e) => e.id !== id));
    if (selectedExamId === id) {
      const remaining = exams.filter((e) => e.id !== id);
      setSelectedExamId(remaining[0].id);
    }
  };

  const handleUpdate = (id: string, field: keyof ExamItem, value: string) => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleReset = () => {
    const now = new Date();
    const d1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const d2 = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);
    const d3 = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
    const format = (d: Date) => d.toISOString().slice(0, 16);

    setExams([
      { id: "1", name: "Data Structures Midterm", dateStr: format(d1), location: "Hall A - Room 204" },
      { id: "2", name: "Operating Systems Final", dateStr: format(d2), location: "Auditorium 3" },
      { id: "3", name: "Linear Algebra Final Exam", dateStr: format(d3), location: "Science Complex 102" },
    ]);
    setSelectedExamId("1");
  };

  const handleCopy = () => {
    if (!selectedExam) return;
    const text = `EXAM COUNTDOWN: ${selectedExam.name}\nDate: ${new Date(
      selectedExam.dateStr
    ).toLocaleString()}\nLocation: ${selectedExam.location || "TBD"}\nTime Left: ${
      countdown.isPast
        ? "Exam concluded"
        : `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s (${countdown.totalHours} total hours left)`
    }`;
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
          <strong>Exam Countdown Tracker:</strong> Track precise second-by-second countdowns to your test dates with study pacing hours. All deadlines are kept private on your device.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Exam List & Deadlines */}
        <div className="lg:col-span-7 space-y-4">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Exam Schedule
              </h2>
              <button
                onClick={handleAddExam}
                className="neo-btn text-xs px-3 py-1.5 bg-primary text-white flex items-center gap-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Exam
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {exams.map((exam) => {
                const isSelected = selectedExam?.id === exam.id;
                const examTime = new Date(exam.dateStr).getTime();
                const isOver = examTime <= nowTime;

                return (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`p-3.5 rounded-lg neo-border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary"
                        : "bg-surface/40 hover:bg-surface border-dark/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <input
                        type="text"
                        value={exam.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleUpdate(exam.id, "name", e.target.value)}
                        className="neo-input p-1.5 text-xs font-bold flex-1"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveExam(exam.id);
                        }}
                        disabled={exams.length <= 1}
                        className="text-gray-400 hover:text-rose-600 disabled:opacity-20 p-1"
                        title="Remove Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-text-secondary block mb-0.5">
                          Exam Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={exam.dateStr}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdate(exam.id, "dateStr", e.target.value)}
                          className="neo-input w-full p-1.5 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-text-secondary block mb-0.5">
                          Room / Location
                        </label>
                        <input
                          type="text"
                          value={exam.location || ""}
                          placeholder="e.g. Hall A Room 102"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdate(exam.id, "location", e.target.value)}
                          className="neo-input w-full p-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex gap-2 pt-2 border-t border-dark/10">
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Live Countdown Display */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
                Live Countdown
              </h3>
              <span className="text-xs font-bold text-primary truncate max-w-[180px]">
                {selectedExam?.name}
              </span>
            </div>

            {!countdown.isPast ? (
              /* Countdown Blocks */
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-surface/60 neo-border rounded-xl">
                  <div className="text-3xl font-black font-mono text-gray-900">
                    {countdown.days}
                  </div>
                  <span className="text-[10px] font-bold uppercase text-text-secondary">
                    Days
                  </span>
                </div>
                <div className="p-3 bg-surface/60 neo-border rounded-xl">
                  <div className="text-3xl font-black font-mono text-gray-900">
                    {countdown.hours}
                  </div>
                  <span className="text-[10px] font-bold uppercase text-text-secondary">
                    Hours
                  </span>
                </div>
                <div className="p-3 bg-surface/60 neo-border rounded-xl">
                  <div className="text-3xl font-black font-mono text-gray-900">
                    {countdown.minutes}
                  </div>
                  <span className="text-[10px] font-bold uppercase text-text-secondary">
                    Mins
                  </span>
                </div>
                <div className="p-3 bg-primary/10 border border-primary rounded-xl">
                  <div className="text-3xl font-black font-mono text-primary">
                    {countdown.seconds}
                  </div>
                  <span className="text-[10px] font-bold uppercase text-primary">
                    Secs
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-rose-50 neo-border rounded-xl text-center space-y-1">
                <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                <h4 className="font-bold text-sm text-rose-800">Exam Concluded or Past</h4>
                <p className="text-xs text-rose-600">Select an upcoming exam date to begin countdown.</p>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="p-3 bg-surface/30 neo-border rounded-lg space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Total Hours Remaining:</span>
                <span className="font-mono font-bold text-gray-900">{countdown.totalHours} hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Exact Exam Time:</span>
                <span className="font-mono text-gray-800">
                  {selectedExam ? new Date(selectedExam.dateStr).toLocaleDateString() : ""} at{" "}
                  {selectedExam ? new Date(selectedExam.dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Room / Venue:</span>
                <span className="font-bold text-gray-800">{selectedExam?.location || "Not specified"}</span>
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Countdown!" : "Copy Countdown Summary"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
