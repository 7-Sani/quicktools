"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Settings2,
  Info,
} from "lucide-react";

const SAMPLE_CSV = `id,name,role,department,salary,active
101,Sarah Connor,Lead Architect,Engineering,145000,true
102,John Doe,Product Manager,Product,130000,true
103,"Smith, Jane",UX Researcher,Design,115000,false`;

const SAMPLE_NESTED_CSV = `id,user.name,user.email,location.city,location.country,skills
1,Alex Mercer,alex@example.com,Seattle,USA,"[""TypeScript"",""React""]"
2,Elena Rostova,elena@example.com,Berlin,Germany,"[""Python"",""Docker""]"`;

// Robust RFC 4180 CSV parser supporting quotes, delimiters, newlines inside cells
function parseRFC4180Csv(
  text: string,
  delimiter: string
): { rows: string[][]; error: string | null; errorLine?: number } {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;
  let lineNum = 1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentCell += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      // Cell boundary
      currentRow.push(currentCell);
      currentCell = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      // Row boundary
      if (char === "\r" && nextChar === "\n") {
        i++; // skip \n
      }
      currentRow.push(currentCell);
      currentCell = "";

      // Only push non-empty rows or if it has content
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      lineNum++;
    } else {
      currentCell += char;
    }
  }

  // If there's an unclosed quote at EOF
  if (insideQuotes) {
    return {
      rows: [],
      error: `Unclosed quote detected around line ${lineNum}. Ensure every quoted field has a matching closing quote.`,
      errorLine: lineNum,
    };
  }

  // Push final cell/row if remaining
  if (currentCell !== "" || currentRow.length > 0) {
    currentRow.push(currentCell);
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== "")) {
      rows.push(currentRow);
    }
  }

  return { rows, error: null };
}

// Auto-detect delimiter
function detectDelimiter(text: string): string {
  const firstLines = text.split("\n").slice(0, 5).join("\n");
  const commaCount = (firstLines.match(/,/g) || []).length;
  const semicolonCount = (firstLines.match(/;/g) || []).length;
  const tabCount = (firstLines.match(/\t/g) || []).length;
  const pipeCount = (firstLines.match(/\|/g) || []).length;

  const max = Math.max(commaCount, semicolonCount, tabCount, pipeCount);
  if (max === 0) return ",";
  if (max === tabCount) return "\t";
  if (max === semicolonCount) return ";";
  if (max === pipeCount) return "|";
  return ",";
}

// Helper to parse scalar values
function parseValue(val: string, parseTypes: boolean): any {
  if (!parseTypes) return val;
  const trimmed = val.trim();
  if (trimmed === "") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;

  // Check if valid JSON array or object inside cell
  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // not JSON, keep as string
    }
  }

  // Check if numeric
  if (!isNaN(Number(trimmed)) && trimmed !== "" && !trimmed.includes(" ")) {
    return Number(trimmed);
  }

  return val;
}

// Set deep nested property by dot path (e.g. "user.name" -> { user: { name: ... } })
function setDeepProperty(obj: any, path: string, value: any) {
  const parts = path.split(".");
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!curr[part] || typeof curr[part] !== "object") {
      curr[part] = {};
    }
    curr = curr[part];
  }
  curr[parts[parts.length - 1]] = value;
}

export default function CsvToJsonConverterTool() {
  const [inputCsv, setInputCsv] = useState(SAMPLE_CSV);
  const [delimiterMode, setDelimiterMode] = useState<"auto" | "," | ";" | "\t" | "|">("auto");
  const [firstRowHeaders, setFirstRowHeaders] = useState(true);
  const [parseTypes, setParseTypes] = useState(true);
  const [unflattenDots, setUnflattenDots] = useState(true);
  const [indentOption, setIndentOption] = useState<"2" | "4" | "min">("2");
  const [copied, setCopied] = useState(false);

  // Computed Delimiter
  const activeDelimiter = useMemo(() => {
    if (delimiterMode === "auto") {
      return detectDelimiter(inputCsv);
    }
    return delimiterMode;
  }, [delimiterMode, inputCsv]);

  // Conversion
  const result = useMemo(() => {
    if (!inputCsv.trim()) {
      return {
        isValid: false,
        error: null,
        json: "",
        recordCount: 0,
        warnings: [] as string[],
      };
    }

    const { rows, error, errorLine } = parseRFC4180Csv(inputCsv, activeDelimiter);

    if (error) {
      return {
        isValid: false,
        error,
        json: "",
        recordCount: 0,
        warnings: [] as string[],
      };
    }

    if (rows.length === 0) {
      return {
        isValid: true,
        error: null,
        json: "[]",
        recordCount: 0,
        warnings: ["The provided CSV has no data rows."],
      };
    }

    const warnings: string[] = [];
    let headers: string[] = [];
    let dataRows: string[][] = [];

    if (firstRowHeaders) {
      headers = rows[0].map((h, i) => h.trim() || `col_${i + 1}`);
      dataRows = rows.slice(1);
    } else {
      const maxCols = Math.max(...rows.map((r) => r.length));
      headers = Array.from({ length: maxCols }, (_, i) => `field_${i + 1}`);
      dataRows = rows;
    }

    // Check inconsistent column counts
    dataRows.forEach((row, idx) => {
      if (row.length !== headers.length) {
        warnings.push(
          `Row ${idx + (firstRowHeaders ? 2 : 1)} has ${row.length} values, while header has ${
            headers.length
          } columns.`
        );
      }
    });

    const parsedList = dataRows.map((row) => {
      const item: Record<string, any> = {};

      headers.forEach((header, colIndex) => {
        const rawVal = colIndex < row.length ? row[colIndex] : "";
        const parsedVal = parseValue(rawVal, parseTypes);

        if (unflattenDots && header.includes(".")) {
          setDeepProperty(item, header, parsedVal);
        } else {
          item[header] = parsedVal;
        }
      });

      // If row had extra items beyond headers, capture them safely so no data is silently lost
      if (row.length > headers.length) {
        item["_extraColumns"] = row.slice(headers.length).map((v) => parseValue(v, parseTypes));
      }

      return item;
    });

    let jsonString = "";
    if (indentOption === "min") {
      jsonString = JSON.stringify(parsedList);
    } else if (indentOption === "4") {
      jsonString = JSON.stringify(parsedList, null, 4);
    } else {
      jsonString = JSON.stringify(parsedList, null, 2);
    }

    return {
      isValid: true,
      error: null,
      json: jsonString,
      recordCount: parsedList.length,
      warnings: warnings.slice(0, 5), // show at most 5 warnings
    };
  }, [inputCsv, activeDelimiter, firstRowHeaders, parseTypes, unflattenDots, indentOption]);

  const handleCopy = () => {
    if (!result.json) return;
    navigator.clipboard.writeText(result.json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result.json) return;
    const blob = new Blob([result.json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-data.json";
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
        setInputCsv(text);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0284C7] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              CSV to JSON Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Convert CSV tables into structured JSON arrays with automatic type casting
            </p>
          </div>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setInputCsv(SAMPLE_CSV)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Standard CSV
          </button>
          <button
            onClick={() => setInputCsv(SAMPLE_NESTED_CSV)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FED7AA] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Nested Dot-Keys
          </button>
          <button
            onClick={() => setInputCsv("")}
            className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            Clear
          </button>
        </div>
      </div>

      {/* Options Bar */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center gap-6 text-sm font-black">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-black" />
          <span className="uppercase text-xs tracking-wider">Delimiter:</span>
          <select
            value={delimiterMode}
            onChange={(e: any) => setDelimiterMode(e.target.value)}
            className="px-2.5 py-1 text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <option value="auto">Auto-Detect ({activeDelimiter === "\t" ? "\\t" : activeDelimiter})</option>
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="&#9;">Tab (\t)</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={firstRowHeaders}
            onChange={(e) => setFirstRowHeaders(e.target.checked)}
            className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
          />
          <span className="text-xs uppercase">Header in First Row</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={parseTypes}
            onChange={(e) => setParseTypes(e.target.checked)}
            className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
          />
          <span className="text-xs uppercase">Infer Types (Numbers/Booleans)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={unflattenDots}
            onChange={(e) => setUnflattenDots(e.target.checked)}
            className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
          />
          <span className="text-xs uppercase">Expand Dot Keys (user.name)</span>
        </label>

        <div className="flex items-center gap-2 ml-auto">
          <span className="uppercase text-xs tracking-wider">Indent:</span>
          <select
            value={indentOption}
            onChange={(e: any) => setIndentOption(e.target.value)}
            className="px-2.5 py-1 text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <option value="2">2 Spaces</option>
            <option value="4">4 Spaces</option>
            <option value="min">Minified</option>
          </select>
        </div>
      </div>

      {/* Syntax Error Notice */}
      {result.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase">CSV Parsing Error</h3>
            <p className="text-xs font-mono font-bold text-red-800 mt-1">{result.error}</p>
          </div>
        </div>
      )}

      {/* Warnings Callout */}
      {result.warnings.length > 0 && (
        <div className="bg-[#FEF08A] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-900">
            <Info className="w-4 h-4" /> Column Discrepancy Warnings
          </div>
          <ul className="text-xs font-bold text-black list-disc pl-5">
            {result.warnings.map((w, i) => (
              <li key={i}>{w} Extra values are preserved in &quot;_extraColumns&quot;.</li>
            ))}
          </ul>
        </div>
      )}

      {/* Dual Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Input */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              Input CSV Content
            </label>
            <label className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload .csv
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={inputCsv}
            onChange={(e) => setInputCsv(e.target.value)}
            placeholder="Paste your CSV text here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black resize-y"
            spellCheck={false}
          />
        </div>

        {/* JSON Output */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-black">
                JSON Output
              </span>
              {result.isValid && (
                <span className="text-[11px] font-black bg-[#BBF7D0] px-2 py-0.5 border border-black">
                  {result.recordCount} {result.recordCount === 1 ? "record" : "records"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!result.json}
                className="px-3 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy JSON"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!result.json}
                className="px-3 py-1 text-xs font-black uppercase bg-[#A7F3D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#86EFAC] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download .json
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={result.json}
            placeholder="Generated JSON will appear here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-y"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
