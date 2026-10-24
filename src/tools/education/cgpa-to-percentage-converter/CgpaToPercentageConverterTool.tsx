"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Info,
  Building,
} from "lucide-react";
import { CGPA_FORMULA_PRESETS, CgpaFormulaPreset } from "@/lib/educationUtils";

export default function CgpaToPercentageConverterTool() {
  const [cgpa, setCgpa] = useState<number>(8.6);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("cbse-9.5");

  // Custom formula parameters: (CGPA - offset) * multiplier + intercept
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customMultiplier, setCustomMultiplier] = useState<number>(9.5);
  const [customOffset, setCustomOffset] = useState<number>(0);
  const [customIntercept, setCustomIntercept] = useState<number>(0);

  const [copied, setCopied] = useState(false);

  const selectedPreset = CGPA_FORMULA_PRESETS.find((p) => p.id === selectedPresetId) || CGPA_FORMULA_PRESETS[0];

  // Calculated percentage
  const { percentage, formulaExplanation } = useMemo(() => {
    if (isCustomMode) {
      const result = Math.min(
        100,
        Math.max(0, (cgpa - customOffset) * customMultiplier + customIntercept)
      );
      let desc = `Percentage = `;
      if (customOffset !== 0) {
        desc += `(CGPA - ${customOffset}) × ${customMultiplier}`;
      } else {
        desc += `CGPA × ${customMultiplier}`;
      }
      if (customIntercept !== 0) {
        desc += ` + ${customIntercept}`;
      }
      desc += `\n= (${cgpa} - ${customOffset}) × ${customMultiplier} + ${customIntercept}\n= ${result.toFixed(2)}%`;

      return {
        percentage: Number(result.toFixed(2)),
        formulaExplanation: desc,
      };
    }

    const calculated = selectedPreset.calculate(cgpa);
    return {
      percentage: Number(calculated.toFixed(2)),
      formulaExplanation: `${selectedPreset.formulaDescription}\n= ${selectedPreset.formulaDescription.replace(
        "CGPA",
        cgpa.toString()
      )}\n= ${calculated.toFixed(2)}%`,
    };
  }, [cgpa, isCustomMode, selectedPreset, customMultiplier, customOffset, customIntercept]);

  const handlePresetSelect = (preset: CgpaFormulaPreset) => {
    setSelectedPresetId(preset.id);
    setIsCustomMode(false);
  };

  const handleReset = () => {
    setCgpa(8.6);
    setSelectedPresetId("cbse-9.5");
    setIsCustomMode(false);
    setCustomMultiplier(9.5);
    setCustomOffset(0);
    setCustomIntercept(0);
  };

  const handleCopy = () => {
    const text = `CGPA to Percentage Conversion:\nCGPA: ${cgpa}\nPercentage: ${percentage}%\nFormula: ${
      isCustomMode ? "Custom Formula" : selectedPreset.name
    }\nDetails: ${formulaExplanation}`;
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
          <strong>Configurable University Conversion Rules:</strong> Institutions do not use a single universal formula. This tool allows you to select official institutional formulas (CBSE 9.5×, Mumbai University, VTU Karnataka, US 4.0) or configure custom mathematical multipliers.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: CGPA Input & Presets */}
        <div className="lg:col-span-7 space-y-6">
          <div className="neo-card p-6 bg-white space-y-5">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" /> CGPA & Institutional Formula
            </h2>

            {/* CGPA input */}
            <div>
              <label className="text-xs font-bold uppercase text-text-secondary block mb-1">
                Enter Your CGPA Score:
              </label>
              <input
                type="number"
                step="0.01"
                value={cgpa}
                onChange={(e) => setCgpa(Number(e.target.value))}
                placeholder="e.g. 8.5"
                className="neo-input w-full p-3 text-lg font-mono font-bold"
              />
            </div>

            {/* Official University Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase text-text-secondary flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-primary" /> Select Institutional Standard:
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" /> {isCustomMode ? "Use Official Preset" : "Configure Custom Formula"}
                </button>
              </div>

              {!isCustomMode ? (
                <div className="space-y-2">
                  {CGPA_FORMULA_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    const sampleResult = preset.calculate(cgpa).toFixed(2);

                    return (
                      <div
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset)}
                        className={`p-3 rounded-lg neo-border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected ? "bg-primary text-white" : "bg-surface/50 hover:bg-surface text-gray-900"
                        }`}
                      >
                        <div>
                          <span className="font-bold text-xs block">{preset.name}</span>
                          <span className={`text-[11px] ${isSelected ? "text-white/80" : "text-text-secondary"}`}>
                            {preset.institution} • {preset.formulaDescription}
                          </span>
                        </div>
                        <div className="text-right pl-3 shrink-0">
                          <span className="text-sm font-black font-mono">{sampleResult}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Custom Formula Builder */
                <div className="p-4 bg-surface/50 neo-border rounded-lg space-y-3">
                  <span className="text-xs font-bold uppercase text-gray-800 block">
                    Custom Formula: (CGPA - Offset) × Multiplier + Intercept
                  </span>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary block mb-1">
                        Multiplier (M)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={customMultiplier}
                        onChange={(e) => setCustomMultiplier(Number(e.target.value))}
                        className="neo-input w-full p-2 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary block mb-1">
                        Offset (Subtract)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={customOffset}
                        onChange={(e) => setCustomOffset(Number(e.target.value))}
                        className="neo-input w-full p-2 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary block mb-1">
                        Intercept (Add)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={customIntercept}
                        onChange={(e) => setCustomIntercept(Number(e.target.value))}
                        className="neo-input w-full p-2 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2 pt-2 border-t border-dark/10">
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Default
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Converted Percentage Hero */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              Equivalent Percentage
            </h3>

            {/* Percentage Display */}
            <div className="p-6 bg-surface/50 neo-border rounded-xl text-center space-y-1">
              <span className="text-xs font-bold uppercase text-text-secondary block">
                Calculated Percentage
              </span>
              <div className="text-5xl font-black font-mono text-primary">
                {percentage}%
              </div>
              <span className="text-xs text-text-secondary font-mono block">
                From CGPA {cgpa}
              </span>
            </div>

            {/* Formula Breakdown */}
            <div className="p-3 bg-surface/30 neo-border rounded-lg space-y-1 text-xs font-mono">
              <span className="font-bold block text-gray-800">Formula Calculation:</span>
              <pre className="whitespace-pre-wrap text-[11px] text-gray-700 leading-tight">
                {formulaExplanation}
              </pre>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="neo-btn w-full py-2.5 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Conversion!" : "Copy Conversion Result"}
            </button>
          </div>

          {/* Quick Cross-Comparison Table */}
          <div className="neo-card p-5 bg-white space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              All Institutions Comparison for CGPA {cgpa}
            </h4>
            <div className="space-y-1.5 text-xs">
              {CGPA_FORMULA_PRESETS.map((p) => (
                <div key={p.id} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-none">
                  <span className="text-gray-700 truncate pr-2">{p.name}</span>
                  <span className="font-mono font-bold text-gray-900 shrink-0">
                    {p.calculate(cgpa).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
