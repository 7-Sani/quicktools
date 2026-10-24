"use client";

import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Table as TableIcon,
  HelpCircle,
  Settings2,
} from "lucide-react";

const SAMPLE_SIMPLE = `[
  {
    "id": 101,
    "name": "Sarah Connor",
    "role": "Lead Architect",
    "department": "Engineering",
    "salary": 145000,
    "active": true
  },
  {
    "id": 102,
    "name": "John Doe",
    "role": "Product Manager",
    "department": "Product",
    "salary": 130000,
    "active": true
  },
  {
    "id": 103,
    "name": "Jane Smith",
    "role": "UX Researcher",
    "department": "Design",
    "salary": 115000,
    "active": false
  }
]`;

const SAMPLE_NESTED = `[
  {
    "id": "U001",
    "user": {
      "name": "Alex Mercer",
      "email": "alex@example.com"
    },
    "location": {
      "city": "Seattle",
      "country": "USA",
      "geo": { "lat": 47.6062, "lng": -122.3321 }
    },
    "skills": ["TypeScript", "React", "Node.js"]
  },
  {
    "id": "U002",
    "user": {
      "name": "Elena Rostova",
      "email": "elena@example.com"
    },
    "location": {
      "city": "Berlin",
      "country": "Germany",
      "geo": { "lat": 52.52, "lng": 13.405 }
    },
    "skills": ["Python", "Docker"]
  }
]`;

// Flatten object helper with dot notation
function flattenObject(obj: any, prefix = "", delimiter = "."): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const newKey = prefix ? `${prefix}${delimiter}${key}` : key;

    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, newKey, delimiter));
    } else {
      result[newKey] = val;
    }
  }

  return result;
}

// Escape cell for CSV RFC 4180
function escapeCsvCell(val: any, delimiter: string): string {
  if (val === null || val === undefined) {
    return "";
  }

  let str = "";
  if (typeof val === "object") {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }

  // If contains delimiter, quote, or newline, escape quotes and wrap in quotes
  if (str.includes(delimiter) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function JsonToCsvConverterTool() {
  const [inputJson, setInputJson] = useState(SAMPLE_SIMPLE);
  const [delimiter, setDelimiter] = useState<string>(",");
  const [flattenNested, setFlattenNested] = useState(true);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<"csv" | "table">("csv");

  // Conversion logic
  const conversionResult = useMemo(() => {
    if (!inputJson.trim()) {
      return {
        isValid: false,
        error: null,
        csv: "",
        headers: [],
        rows: [],
        warning: null,
      };
    }

    try {
      const parsed = JSON.parse(inputJson);
      let list: any[] = [];

      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (typeof parsed === "object" && parsed !== null) {
        // Single object or object with array property
        const arrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
        if (arrayKey) {
          list = parsed[arrayKey];
        } else {
          list = [parsed];
        }
      } else {
        return {
          isValid: false,
          error: "Root JSON must be an array of objects or a single JSON object.",
          csv: "",
          headers: [],
          rows: [],
          warning: null,
        };
      }

      if (list.length === 0) {
        return {
          isValid: true,
          error: null,
          csv: "",
          headers: [],
          rows: [],
          warning: "JSON array is empty. No CSV rows generated.",
        };
      }

      // Check for non-object elements
      const hasPrimitives = list.some((item) => typeof item !== "object" || item === null);
      if (hasPrimitives) {
        list = list.map((item) => (typeof item === "object" && item !== null ? item : { value: item }));
      }

      // Process objects
      const processedRows = list.map((item) => {
        if (flattenNested) {
          return flattenObject(item);
        }
        return item;
      });

      // Collect all unique keys across all records to avoid missing columns
      const keySet = new Set<string>();
      processedRows.forEach((row) => {
        Object.keys(row).forEach((k) => keySet.add(k));
      });
      const headers = Array.from(keySet);

      // Warning about nested arrays or inconsistent columns
      let warning: string | null = null;
      const hasArrayValues = processedRows.some((row) =>
        Object.values(row).some((v) => Array.isArray(v))
      );
      if (hasArrayValues) {
        warning =
          "Notice: Nested arrays detected. Array elements are serialized as JSON strings in their CSV cells.";
      }

      // Generate rows data
      const tableRows: string[][] = processedRows.map((row) => {
        return headers.map((header) => {
          const val = row[header];
          if (val === undefined || val === null) return "";
          if (typeof val === "object") return JSON.stringify(val);
          return String(val);
        });
      });

      // Construct CSV string
      const csvLines: string[] = [];
      if (includeHeader) {
        csvLines.push(headers.map((h) => escapeCsvCell(h, delimiter)).join(delimiter));
      }
      processedRows.forEach((row) => {
        const line = headers
          .map((h) => escapeCsvCell(row[h], delimiter))
          .join(delimiter);
        csvLines.push(line);
      });

      return {
        isValid: true,
        error: null,
        csv: csvLines.join("\n"),
        headers,
        rows: tableRows,
        warning,
      };
    } catch (err: any) {
      return {
        isValid: false,
        error: err.message || "Invalid JSON syntax.",
        csv: "",
        headers: [],
        rows: [],
        warning: null,
      };
    }
  }, [inputJson, delimiter, flattenNested, includeHeader]);

  const handleCopy = () => {
    if (!conversionResult.csv) return;
    navigator.clipboard.writeText(conversionResult.csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!conversionResult.csv) return;
    const blob = new Blob([conversionResult.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setInputJson(text);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0284C7] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              JSON to CSV Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Convert JSON arrays or nested objects to standardized tabular CSV data
            </p>
          </div>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setInputJson(SAMPLE_SIMPLE)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simple List
          </button>
          <button
            onClick={() => setInputJson(SAMPLE_NESTED)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FED7AA] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Nested Objects
          </button>
          <button
            onClick={() => setInputJson("")}
            className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            Clear
          </button>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center gap-6 text-sm font-black">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-black" />
          <span className="uppercase text-xs tracking-wider">Delimiter:</span>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="px-2.5 py-1 text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="&#9;">Tab (\t)</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={flattenNested}
            onChange={(e) => setFlattenNested(e.target.checked)}
            className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
          />
          <span className="text-xs uppercase">Flatten Nested Objects (dot.key)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeHeader}
            onChange={(e) => setIncludeHeader(e.target.checked)}
            className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
          />
          <span className="text-xs uppercase">Include Header Row</span>
        </label>

        {conversionResult.isValid && (
          <div className="ml-auto flex items-center gap-2 text-xs font-black bg-[#BBF7D0] text-black px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
            <span>
              {conversionResult.rows.length} Rows &bull; {conversionResult.headers.length} Columns
            </span>
          </div>
        )}
      </div>

      {/* Validation or Warning Notice */}
      {conversionResult.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase">JSON Syntax or Structure Error</h3>
            <p className="text-xs font-mono font-bold text-red-800 mt-1">{conversionResult.error}</p>
          </div>
        </div>
      )}

      {conversionResult.warning && (
        <div className="bg-[#FEF08A] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-black">{conversionResult.warning}</p>
        </div>
      )}

      {/* Main Dual-Panel Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              Input JSON Array or Object
            </label>
            <label className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload .json
              <input
                type="file"
                accept=".json,application/json,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="Paste your JSON array here (e.g. [{ &quot;id&quot;: 1, &quot;name&quot;: &quot;Alice&quot; }])..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black resize-y"
            spellCheck={false}
          />

          <div className="text-[11px] font-bold text-gray-500">
            Tip: You can pass an array of objects or an object wrapping an array.
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPreviewTab("csv")}
                className={`px-3 py-1 text-xs font-black uppercase border-2 border-black transition-all ${
                  previewTab === "csv"
                    ? "bg-[#0284C7] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                CSV Text
              </button>
              <button
                onClick={() => setPreviewTab("table")}
                className={`px-3 py-1 text-xs font-black uppercase border-2 border-black transition-all flex items-center gap-1 ${
                  previewTab === "table"
                    ? "bg-[#0284C7] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                <TableIcon className="w-3 h-3" />
                Table Preview
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!conversionResult.csv}
                className="px-3 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy CSV"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!conversionResult.csv}
                className="px-3 py-1 text-xs font-black uppercase bg-[#A7F3D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#86EFAC] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download .csv
              </button>
            </div>
          </div>

          {previewTab === "csv" ? (
            <textarea
              readOnly
              value={conversionResult.csv}
              placeholder="Generated CSV will appear here..."
              rows={18}
              className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-y"
              spellCheck={false}
            />
          ) : (
            <div className="h-[430px] overflow-auto border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {conversionResult.headers.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#E2E8F0] border-b-2 border-black z-10">
                    <tr>
                      <th className="p-2 border-r border-black font-black uppercase text-gray-700 w-10 text-center">
                        #
                      </th>
                      {conversionResult.headers.map((h, i) => (
                        <th key={i} className="p-2 border-r border-black font-black uppercase whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {conversionResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-gray-200 hover:bg-yellow-50">
                        <td className="p-2 border-r border-black font-mono font-bold text-center text-gray-500 bg-gray-50">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="p-2 border-r border-gray-200 font-mono text-xs text-gray-900 whitespace-nowrap overflow-hidden max-w-[200px] truncate"
                            title={cell}
                          >
                            {cell || <span className="text-gray-400 italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-center text-gray-400 font-bold text-xs">
                  No table data to display. Please provide valid JSON.
                </div>
              )}
            </div>
          )}

          <div className="text-[11px] font-bold text-gray-500">
            Conforms to RFC 4180 standard escaping for fields with quotes, commas, and newlines.
          </div>
        </div>
      </div>

      {/* Limitations and Format Guidance Callout */}
      <div className="bg-[#FAF8F5] border-3 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-sm font-black uppercase text-black mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#0284C7]" />
          JSON to CSV Conversion Guidelines & Limitations
        </h3>
        <ul className="text-xs text-gray-700 font-bold space-y-1.5 list-disc pl-5">
          <li>
            <strong className="text-black">Nested Objects:</strong> With &quot;Flatten Nested Objects&quot; enabled, nested keys are unrolled into dotted paths (e.g. <code className="bg-gray-200 px-1 font-mono">user.address.city</code>).
          </li>
          <li>
            <strong className="text-black">Arrays Inside Records:</strong> CSV is 2-dimensional and cannot natively represent multi-level arrays without normalization. Array properties are safely stringified as JSON strings so no values are lost.
          </li>
          <li>
            <strong className="text-black">Heterogeneous Keys:</strong> All distinct keys across all records are dynamically collected into the header row. Any record lacking a specific key will have an empty cell.
          </li>
          <li>
            <strong className="text-black">100% Client-Side Privacy:</strong> Your JSON files are processed entirely inside your local browser sandbox.
          </li>
        </ul>
      </div>
    </div>
  );
}
