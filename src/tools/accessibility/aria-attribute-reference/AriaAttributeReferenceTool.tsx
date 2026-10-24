"use client";

import { useState, useMemo } from "react";
import {
  Code,
  Search,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Info,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface AriaEntry {
  name: string;
  type: "role" | "state" | "property";
  description: string;
  nativeEquivalent?: string;
  example: string;
}

export default function AriaAttributeReferenceTool() {
  const [search, setSearch] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "role" | "state" | "property">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const ARIA_DATABASE: AriaEntry[] = [
    {
      name: "aria-expanded",
      type: "state",
      description: "Indicates whether a collapsible region, accordion, or dropdown menu is currently expanded (true) or collapsed (false).",
      example: `<button aria-expanded="false" aria-controls="faq-answer">\n  What is QuickTools?\n</button>\n<div id="faq-answer" hidden>\n  QuickTools is a free client-side suite...\n</div>`,
    },
    {
      name: "aria-label",
      type: "property",
      description: "Defines a string value that labels an interactive element when no visible text is present (e.g. icon-only buttons).",
      example: `<button aria-label="Close dialog">\n  <svg aria-hidden="true">...</svg>\n</button>`,
    },
    {
      name: "aria-labelledby",
      type: "property",
      description: "Identifies the element (or elements) by ID that serves as the accessible name for this element.",
      example: `<div role="dialog" aria-labelledby="dialog-title">\n  <h2 id="dialog-title">Confirm Deletion</h2>\n</div>`,
    },
    {
      name: "aria-describedby",
      type: "property",
      description: "Identifies the element(s) by ID that describes the element, such as input helper text or validation error messages.",
      example: `<input type="password" id="pwd" aria-describedby="pwd-help" />\n<span id="pwd-help">Must be at least 8 characters.</span>`,
    },
    {
      name: "aria-hidden",
      type: "state",
      description: "Hides an element from screen readers. Use for purely decorative icons or visually hidden duplicates.",
      example: `<svg aria-hidden="true" focusable="false">...</svg>`,
    },
    {
      name: "aria-live",
      type: "property",
      description: "Indicates that an element will be updated and describes the urgency with which screen readers announce changes (polite, assertive, off).",
      example: `<div aria-live="polite" aria-atomic="true">\n  Item added to cart.\n</div>`,
    },
    {
      name: "role=\"dialog\"",
      type: "role",
      description: "Identifies an overlay window or modal that requires user interaction before returning to the main page.",
      nativeEquivalent: "<dialog> (HTML5 native)",
      example: `<div role="dialog" aria-modal="true" aria-labelledby="modal-head">\n  <h2 id="modal-head">Modal Title</h2>\n  <button>Close</button>\n</div>`,
    },
    {
      name: "role=\"alert\"",
      type: "role",
      description: "A message with important, time-sensitive information. Screen readers immediately announce alerts (implicit aria-live=\"assertive\").",
      example: `<div role="alert">\n  Payment failed. Please verify your card details.\n</div>`,
    },
    {
      name: "role=\"tablist\" / tab / tabpanel",
      type: "role",
      description: "Set of layered sections of content. Tab controls display one panel at a time using arrow key navigation.",
      example: `<div role="tablist" aria-label="Tool tabs">\n  <button role="tab" aria-selected="true" id="tab-1" aria-controls="panel-1">Tab 1</button>\n</div>\n<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">...</div>`,
    },
    {
      name: "aria-current",
      type: "state",
      description: "Indicates the element represents the current item within a container or list of related elements (e.g. page, step, location, date).",
      example: `<nav>\n  <a href="/about" aria-current="page">About Us</a>\n</nav>`,
    },
  ];

  const filteredEntries = useMemo(() => {
    return ARIA_DATABASE.filter((entry) => {
      const matchesType = filterType === "all" || entry.type === filterType;
      const matchesSearch =
        search.trim() === "" ||
        entry.name.toLowerCase().includes(search.toLowerCase()) ||
        entry.description.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [search, filterType]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* First Rule of ARIA Notice */}
      <div className="neo-card p-4 bg-teal-50 neo-border flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <strong>The First Rule of ARIA:</strong> <em>&quot;If you can use a native HTML5 element or attribute with the semantics and behavior you require already built in, then do so instead of re-purposing an element and adding ARIA.&quot;</em> (e.g., use <code>&lt;button&gt;</code> instead of <code>&lt;div role=&quot;button&quot; tabindex=&quot;0&quot;&gt;</code>).
        </div>
      </div>

      {/* Search and Filters */}
      <div className="neo-card p-5 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ARIA attributes (e.g. expanded, live, dialog, label)..."
              className="neo-input w-full pl-9 pr-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-1.5 bg-surface p-1 neo-border rounded-lg self-start sm:self-auto">
            {(["all", "role", "state", "property"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 text-xs font-bold rounded uppercase ${
                  filterType === t ? "bg-primary text-white" : "text-text-secondary hover:text-dark"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of ARIA Entries */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredEntries.map((item, index) => {
          const isCopied = copiedCode === item.name;

          return (
            <div
              key={index}
              className="neo-card p-5 bg-white flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm text-primary">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface neo-border">
                    {item.type}
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed mb-2">
                  {item.description}
                </p>

                {item.nativeEquivalent && (
                  <div className="p-2 bg-amber-50 neo-border rounded text-[11px] text-amber-950 font-semibold mb-2">
                    💡 Native Alternative: {item.nativeEquivalent}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                    Example Implementation
                  </span>
                  <button
                    onClick={() => handleCopyCode(item.example, item.name)}
                    className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {isCopied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-2.5 bg-dark text-white rounded text-[11px] font-mono overflow-x-auto leading-relaxed">
                  {item.example}
                </pre>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="neo-card p-8 bg-white text-center space-y-2">
          <p className="font-bold text-sm">No matching ARIA attributes found.</p>
          <p className="text-xs text-text-secondary">Try searching for &quot;label&quot;, &quot;role&quot;, &quot;dialog&quot;, or select &quot;all&quot;.</p>
        </div>
      )}
    </div>
  );

  function setSearchQuery(val: string) {
    setSearch(val);
  }
}
