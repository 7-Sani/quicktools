"use client";

import { useState } from "react";
import {
  Keyboard,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
  Play,
  X,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  wcagCriteria: string;
  checked: boolean;
}

export default function KeyboardAccessibilityChecklistTool() {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "focus-visible",
      title: "Focus is Clearly Visible",
      description: "Every interactive element has a high-contrast focus outline or ring. CSS never uses 'outline: none' without an accessible replacement.",
      wcagCriteria: "WCAG 2.4.7 (Level AA)",
      checked: true,
    },
    {
      id: "tab-order",
      title: "Logical Tab Sequence",
      description: "Tabbing through the page follows the visual reading order (left-to-right, top-to-bottom). Positive 'tabindex' values (>0) are avoided.",
      wcagCriteria: "WCAG 2.4.3 (Level A)",
      checked: true,
    },
    {
      id: "no-traps",
      title: "No Keyboard Traps",
      description: "Users can navigate into and out of all components using only the keyboard. Modals allow pressing 'Escape' to dismiss.",
      wcagCriteria: "WCAG 2.1.2 (Level A)",
      checked: true,
    },
    {
      id: "all-operable",
      title: "All Functions Available from Keyboard",
      description: "Buttons, menus, dropdowns, sliders, and drag-and-drops can be fully operated without a mouse.",
      wcagCriteria: "WCAG 2.1.1 (Level A)",
      checked: false,
    },
    {
      id: "enter-space",
      title: "Standard Activation Keys",
      description: "Links open on 'Enter'. Buttons activate on both 'Enter' and 'Space'. Custom widgets emulate native key behaviors.",
      wcagCriteria: "WAI-ARIA Authoring Practices",
      checked: true,
    },
    {
      id: "skip-link",
      title: "Bypass Blocks (Skip to Content)",
      description: "A hidden skip link appears on first Tab press, allowing screen reader and keyboard users to bypass top navigation headers.",
      wcagCriteria: "WCAG 2.4.1 (Level A)",
      checked: false,
    },
    {
      id: "modal-focus",
      title: "Modal Dialog Focus Management",
      description: "When a modal opens, focus moves directly to the dialog. When dismissed, focus returns to the initiating trigger button.",
      wcagCriteria: "WCAG 2.4.3 (Level A)",
      checked: false,
    },
  ]);

  // Simulated playground modal state
  const [isSimulatedModalOpen, setIsSimulatedModalOpen] = useState(false);
  const [skipClicked, setSkipClicked] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const completedCount = items.filter((i) => i.checked).length;
  const scorePct = Math.round((completedCount / items.length) * 100);

  const handleReset = () => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: false })));
  };

  const handleCopyReport = () => {
    const report = `KEYBOARD ACCESSIBILITY AUDIT CHECKLIST:\n` +
      `----------------------------------------\n` +
      `Audit Score: ${completedCount}/${items.length} criteria passed (${scorePct}%)\n\n` +
      items
        .map(
          (i) =>
            `[${i.checked ? "PASS" : "FAIL / TODO"}] ${i.title} (${i.wcagCriteria})\n  ${i.description}`
        )
        .join("\n\n");
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-teal-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <strong>Keyboard Accessibility (WCAG Principle 2: Operable):</strong> Many users with motor disabilities, tremors, or blindness rely exclusively on keyboard navigation. Test your controls with <code>Tab</code>, <code>Shift+Tab</code>, <code>Enter</code>, <code>Space</code>, and <code>Escape</code>.
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Checklist */}
        <div className="lg:col-span-7 space-y-4">
          <div className="neo-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" /> Audit Checklist
              </h2>
              <span className="text-xs font-mono font-bold text-gray-600">
                {completedCount} / {items.length} passed
              </span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3.5 rounded-lg neo-border cursor-pointer transition-all flex items-start gap-3 ${
                    item.checked ? "bg-emerald-50/70 border-emerald-600" : "bg-surface/30 hover:bg-surface border-dark/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 rounded border-dark accent-primary cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${item.checked ? "text-emerald-950" : "text-gray-900"}`}>
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-text-secondary px-1.5 py-0.5 rounded bg-white neo-border">
                        {item.wcagCriteria}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-dark/10">
              <button
                onClick={handleReset}
                className="neo-btn text-xs px-3 py-1.5 bg-surface hover:bg-gray-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All
              </button>
              <button
                onClick={handleCopyReport}
                className="neo-btn text-xs px-4 py-2 bg-primary text-white flex items-center gap-1.5 font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied Report!" : "Copy Audit Checklist"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Keyboard Testing Playground */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Play className="w-4 h-4 text-primary" /> Live Keyboard Test Playground
            </h3>
            <p className="text-xs text-text-secondary">
              Click into the box below and use your <kbd className="px-1 py-0.5 bg-gray-200 rounded text-[10px] font-mono">Tab</kbd> key to navigate between elements. Notice the clear blue focus indicator!
            </p>

            {/* Simulated Playground Container */}
            <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl space-y-4">
              {/* Skip link */}
              <a
                href="#playground-content"
                onClick={(e) => {
                  e.preventDefault();
                  setSkipClicked(true);
                  setTimeout(() => setSkipClicked(false), 2000);
                }}
                className="sr-only focus:not-sr-only focus:inline-block px-3 py-1.5 bg-dark text-white text-xs font-bold rounded neo-border"
              >
                Skip to Content Link (Visible on Focus)
              </a>

              {skipClicked && (
                <div className="p-2 bg-emerald-100 text-emerald-900 text-xs font-bold rounded">
                  ✓ Skip Link activated! Focus shifted past navigation.
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold block" htmlFor="sample-input">
                  1. Accessible Text Input:
                </label>
                <input
                  id="sample-input"
                  type="text"
                  placeholder="Focus with Tab key..."
                  className="neo-input w-full p-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="neo-btn text-xs px-3 py-2 bg-primary text-white focus:ring-4 focus:ring-primary/40"
                  onClick={() => alert("Button triggered via Space or Enter!")}
                >
                  2. Accessible Button
                </button>
                <button
                  type="button"
                  onClick={() => setIsSimulatedModalOpen(true)}
                  className="neo-btn text-xs px-3 py-2 bg-surface hover:bg-gray-100 focus:ring-4 focus:ring-dark/40"
                >
                  3. Open Test Modal
                </button>
              </div>

              {/* Simulated Accessible Modal */}
              {isSimulatedModalOpen && (
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="modal-title"
                  className="p-4 bg-white neo-border rounded-lg shadow-lg space-y-3 mt-3 animate-in fade-in"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsSimulatedModalOpen(false);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 id="modal-title" className="font-bold text-sm">
                      Accessible Modal Window
                    </h4>
                    <button
                      onClick={() => setIsSimulatedModalOpen(false)}
                      className="p-1 text-gray-500 hover:text-rose-600 focus:ring-2 focus:ring-rose-500"
                      aria-label="Close modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Notice: Pressing <kbd className="font-mono bg-gray-100 px-1 rounded">Escape</kbd> closes this dialog immediately, fulfilling WCAG 2.1.2 No Keyboard Trap criteria.
                  </p>
                  <button
                    onClick={() => setIsSimulatedModalOpen(false)}
                    className="neo-btn text-xs px-3 py-1.5 bg-dark text-white font-bold w-full"
                  >
                    Dismiss (Escape)
                  </button>
                </div>
              )}
            </div>

            {/* Scorecard */}
            <div className="p-3 bg-surface/30 neo-border rounded-lg flex justify-between items-center text-xs">
              <span className="font-bold text-gray-800">Checklist Completion:</span>
              <span className="font-mono font-black text-primary text-sm">{scorePct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
