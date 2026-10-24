"use client";

import { useState, useMemo } from "react";
import {
  CheckSquare,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Code,
  FileCheck,
} from "lucide-react";

interface FormCheckItem {
  id: string;
  title: string;
  description: string;
  wcagCriteria: string;
  checked: boolean;
}

export default function AccessibleFormChecklistTool() {
  const [tab, setTab] = useState<"checklist" | "inspector" | "template">("checklist");

  // Checklist items
  const [items, setItems] = useState<FormCheckItem[]>([
    {
      id: "explicit-labels",
      title: "Explicit Label Association",
      description: "Every input has a matching <label for=\"inputId\"> element. Screen readers can announce the field purpose on focus.",
      wcagCriteria: "WCAG 3.3.2 (Level A)",
      checked: true,
    },
    {
      id: "no-placeholder-only",
      title: "No Placeholder-as-Label Anti-Pattern",
      description: "Placeholders are not used as substitutes for real labels. Placeholders disappear when typing and fail contrast minimums.",
      wcagCriteria: "WCAG 1.3.1 (Level A)",
      checked: true,
    },
    {
      id: "required-fields",
      title: "Clearly Indicated Required Fields",
      description: "Required fields are communicated both visibly (e.g. * or text) and programmatically via 'required' or 'aria-required=\"true\"'.",
      wcagCriteria: "WCAG 3.3.2 (Level A)",
      checked: true,
    },
    {
      id: "error-linking",
      title: "Accessible Error Descriptions",
      description: "Validation error messages are linked to their inputs via 'aria-describedby=\"error-id\"' and flagged with 'aria-invalid=\"true\"'.",
      wcagCriteria: "WCAG 3.3.1 (Level A)",
      checked: false,
    },
    {
      id: "fieldset-legend",
      title: "Fieldset & Legend for Radio/Checkbox Groups",
      description: "Related radio buttons or multi-checkboxes are wrapped in a <fieldset> with a descriptive <legend> title.",
      wcagCriteria: "WCAG 1.3.1 (Level A)",
      checked: true,
    },
    {
      id: "autocomplete",
      title: "Appropriate Autocomplete Attributes",
      description: "Common inputs (name, email, street-address, tel) use standard 'autocomplete' tokens to help users with cognitive or motor limits.",
      wcagCriteria: "WCAG 1.3.5 (Level AA)",
      checked: false,
    },
  ]);

  // Form HTML Inspector
  const [htmlInput, setHtmlInput] = useState<string>(
    `<form>
  <!-- Good label association -->
  <label for="fullName">Full Name</label>
  <input type="text" id="fullName" autocomplete="name" required />

  <!-- Warning: Unlabelled input with placeholder only -->
  <input type="email" placeholder="Enter your email" />

  <!-- Radio group without fieldset -->
  <p>Select Contact Preference:</p>
  <input type="radio" name="contact" value="email" /> Email
  <input type="radio" name="contact" value="phone" /> Phone
</form>`
  );

  const [copied, setCopied] = useState(false);

  // Inspector analysis
  const inspectorResults = useMemo(() => {
    if (!htmlInput.trim()) return { inputsCount: 0, issues: [] };

    const issues: string[] = [];
    const inputMatches = htmlInput.match(/<input\b[^>]*>/gi) || [];

    // Check 1: inputs with placeholder and no label/id
    for (const tag of inputMatches) {
      const hasId = /\bid=["'][^"']+["']/i.test(tag);
      const hasPlaceholder = /\bplaceholder=["'][^"']+["']/i.test(tag);
      const isHidden = /\btype=["']hidden["']/i.test(tag);
      const isSubmit = /\btype=["'](submit|button|reset)["']/i.test(tag);

      if (!isHidden && !isSubmit && hasPlaceholder && !hasId) {
        issues.push(`Input with placeholder "${tag.slice(0, 40)}..." has no 'id' attribute to connect to a <label for="...">.`);
      }
    }

    // Check 2: Radio or Checkboxes without fieldset
    const hasRadios = /<input[^>]+type=["']radio["']/i.test(htmlInput);
    const hasFieldset = /<fieldset\b[^>]*>/i.test(htmlInput);
    if (hasRadios && !hasFieldset) {
      issues.push("Found radio button inputs without an enclosing <fieldset> and <legend> grouping element.");
    }

    // Check 3: Missing autocomplete
    const hasEmail = /type=["']email["']/i.test(htmlInput);
    const hasEmailAutocomplete = /autocomplete=["']email["']/i.test(htmlInput);
    if (hasEmail && !hasEmailAutocomplete) {
      issues.push("Email input is missing recommended 'autocomplete=\"email\"' attribute (WCAG 1.3.5).");
    }

    return {
      inputsCount: inputMatches.length,
      issues,
    };
  }, [htmlInput]);

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const completedCount = items.filter((i) => i.checked).length;

  const accessibleFormTemplate = `<!-- Accessible, Production-Ready Form Template -->
<form novalidate>
  <!-- Text Field with Label & Help Text -->
  <div class="form-group">
    <label for="user-email">
      Email Address <span aria-hidden="true">*</span>
    </label>
    <input
      type="email"
      id="user-email"
      name="email"
      autocomplete="email"
      required
      aria-required="true"
      aria-describedby="email-help email-error"
      aria-invalid="false"
    />
    <p id="email-help" class="help-text">We'll never share your email address.</p>
    <p id="email-error" class="error-text" role="alert" hidden>Please enter a valid email.</p>
  </div>

  <!-- Radio Group with Fieldset and Legend -->
  <fieldset class="form-group">
    <legend>Preferred Notification Channel</legend>
    <label>
      <input type="radio" name="notification" value="email" checked />
      Email Updates
    </label>
    <label>
      <input type="radio" name="notification" value="sms" />
      SMS Text Messages
    </label>
  </fieldset>

  <button type="submit">Submit Form</button>
</form>`;

  const handleCopyReport = () => {
    const report = `ACCESSIBLE FORM AUDIT CHECKLIST:\n` +
      `--------------------------------\n` +
      `Score: ${completedCount}/${items.length} criteria satisfied\n\n` +
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

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(accessibleFormTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="neo-card p-4 bg-teal-50 neo-border flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <strong>Accessible Forms (WCAG 3.3 Input Assistance):</strong> Screen reader and voice-control users rely on explicitly paired labels, programmatic error descriptions, and fieldset groupings. Inspect your markup or test against the WCAG criteria below.
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("checklist")}
          className={`px-4 py-2 text-xs font-bold rounded neo-border ${
            tab === "checklist" ? "bg-primary text-white" : "bg-white hover:bg-surface text-gray-800"
          }`}
        >
          Audit Checklist
        </button>
        <button
          onClick={() => setTab("inspector")}
          className={`px-4 py-2 text-xs font-bold rounded neo-border ${
            tab === "inspector" ? "bg-primary text-white" : "bg-white hover:bg-surface text-gray-800"
          }`}
        >
          Form HTML Inspector
        </button>
        <button
          onClick={() => setTab("template")}
          className={`px-4 py-2 text-xs font-bold rounded neo-border ${
            tab === "template" ? "bg-primary text-white" : "bg-white hover:bg-surface text-gray-800"
          }`}
        >
          Accessible Template Code
        </button>
      </div>

      {/* VIEW 1: CHECKLIST */}
      {tab === "checklist" && (
        <div className="neo-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" /> Form Accessibility Checklist
            </h2>
            <span className="text-xs font-mono font-bold text-gray-600">
              {completedCount} / {items.length} criteria passed
            </span>
          </div>

          <div className="space-y-3">
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

          <div className="pt-2 flex justify-between items-center border-t border-dark/10">
            <button
              onClick={() => setItems((prev) => prev.map((i) => ({ ...i, checked: false })))}
              className="neo-btn text-xs px-3 py-1.5 bg-surface hover:bg-gray-100 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={handleCopyReport}
              className="neo-btn text-xs px-4 py-2 bg-primary text-white font-bold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Report!" : "Copy Form Audit Checklist"}
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: HTML INSPECTOR */}
      {tab === "inspector" && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="neo-card p-6 bg-white space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" /> Paste Form Markup
              </h3>
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                rows={12}
                placeholder="Paste HTML <form>...</form> code here..."
                className="neo-input w-full p-3 text-xs font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="neo-card p-6 bg-white space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center justify-between">
                <span>Inspector Findings</span>
                <span className="font-mono text-gray-500 font-bold">{inspectorResults.inputsCount} inputs</span>
              </h3>

              {inspectorResults.issues.length > 0 ? (
                <div className="p-3.5 bg-rose-50 neo-border rounded-lg space-y-2 text-xs text-rose-950">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Issues Identified:
                  </span>
                  <ul className="list-disc pl-4 space-y-1.5 text-[11px] leading-relaxed">
                    {inspectorResults.issues.map((iss, i) => (
                      <li key={i}>{iss}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 neo-border rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>No obvious label or fieldset omissions detected in this snippet!</span>
                </div>
              )}

              <p className="text-[11px] text-text-secondary italic">
                * Note: Automated snippet checks cannot verify label phrasing clarity or dynamic client-side ARIA states.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TEMPLATE */}
      {tab === "template" && (
        <div className="neo-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" /> Accessible Form Blueprint
            </h3>
            <button
              onClick={handleCopyTemplate}
              className="neo-btn text-xs px-3 py-1.5 bg-primary text-white font-bold flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Template HTML"}
            </button>
          </div>

          <pre className="p-4 bg-dark text-white rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
            {accessibleFormTemplate}
          </pre>
        </div>
      )}
    </div>
  );
}
