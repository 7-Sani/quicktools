"use client";

import React, { useState, useMemo } from "react";
import {
  Code2,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Settings2,
  Minimize2,
} from "lucide-react";

const SAMPLE_VALID_XML = `<?xml version="1.0" encoding="UTF-8"?>
<store name="QuickTools Catalog" version="2.0">
  <category id="cat-1" name="Developer Utilities">
    <item sku="SKU-001" available="true">
      <title>JSON Suite</title>
      <price currency="USD">0.00</price>
      <features>
        <feature>Formatter</feature>
        <feature>Validator</feature>
        <feature>CSV Converter</feature>
      </features>
    </item>
    <item sku="SKU-002" available="true">
      <title>XML Suite</title>
      <price currency="USD">0.00</price>
      <features>
        <feature>Beautifier</feature>
        <feature>DOM Parser</feature>
      </features>
    </item>
  </category>
</store>`;

const SAMPLE_INVALID_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <!-- Missing closing book tag -->
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
  </book>
</catalog>`;

// Recursive XML formatter from DOM Document / Node
function formatXmlNode(node: Node, indentStr: string, currentIndent = 0): string {
  if (node.nodeType === Node.COMMENT_NODE) {
    return `${indentStr.repeat(currentIndent)}<!--${node.nodeValue?.trim()}-->\n`;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue?.trim();
    return text ? `${indentStr.repeat(currentIndent)}${text}\n` : "";
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const elem = node as Element;
    const tagName = elem.tagName;
    const attrs = Array.from(elem.attributes)
      .map((a) => `${a.name}="${a.value.replace(/"/g, "&quot;")}"`)
      .join(" ");
    const attrString = attrs ? ` ${attrs}` : "";

    const children = Array.from(elem.childNodes).filter((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        return (child.nodeValue || "").trim().length > 0;
      }
      return true;
    });

    if (children.length === 0) {
      return `${indentStr.repeat(currentIndent)}<${tagName}${attrString}/>\n`;
    }

    // If only a single text child, keep on one line
    if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
      const textVal = children[0].nodeValue?.trim() || "";
      return `${indentStr.repeat(currentIndent)}<${tagName}${attrString}>${textVal}</${tagName}>\n`;
    }

    let inner = "";
    children.forEach((child) => {
      inner += formatXmlNode(child, indentStr, currentIndent + 1);
    });

    return `${indentStr.repeat(currentIndent)}<${tagName}${attrString}>\n${inner}${indentStr.repeat(
      currentIndent
    )}</${tagName}>\n`;
  }

  return "";
}

// Minify XML
function minifyXml(xml: string): string {
  return xml
    .replace(/>\s+</g, "><")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
}

export default function XmlFormatterAndValidatorTool() {
  const [inputXml, setInputXml] = useState(SAMPLE_VALID_XML);
  const [indentOption, setIndentOption] = useState<"2" | "4" | "tab" | "min">("2");
  const [copied, setCopied] = useState(false);

  // Parse and Validate XML
  const validation = useMemo(() => {
    if (!inputXml.trim()) {
      return {
        isValid: false,
        error: null,
        formatted: "",
        stats: null,
      };
    }

    if (typeof window === "undefined") {
      return { isValid: false, error: null, formatted: "", stats: null };
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(inputXml, "application/xml");

      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        const errorText = parserError.textContent || "XML Parsing Error";
        // Clean error text from browser internal details
        const cleanedError = errorText.split("\n")[0] || errorText;
        return {
          isValid: false,
          error: cleanedError,
          formatted: "",
          stats: null,
        };
      }

      // Collect statistics
      const allElements = doc.querySelectorAll("*");
      let totalAttributes = 0;
      let maxDepth = 0;

      const calcDepth = (node: Element, current = 1): number => {
        let max = current;
        Array.from(node.children).forEach((child) => {
          max = Math.max(max, calcDepth(child, current + 1));
        });
        return max;
      };

      if (doc.documentElement) {
        maxDepth = calcDepth(doc.documentElement);
      }

      allElements.forEach((el) => {
        totalAttributes += el.attributes.length;
      });

      // Format XML
      let formatted = "";
      if (indentOption === "min") {
        formatted = minifyXml(inputXml);
      } else {
        const indentStr = indentOption === "tab" ? "\t" : " ".repeat(Number(indentOption));
        let xmlDeclaration = "";
        const declMatch = inputXml.match(/^<\?xml[^>]*\?>/i);
        if (declMatch) {
          xmlDeclaration = declMatch[0] + "\n";
        }

        if (doc.documentElement) {
          formatted = xmlDeclaration + formatXmlNode(doc.documentElement, indentStr, 0).trim();
        } else {
          formatted = inputXml;
        }
      }

      return {
        isValid: true,
        error: null,
        formatted,
        stats: {
          elementsCount: allElements.length,
          attributesCount: totalAttributes,
          maxDepth,
          charactersCount: formatted.length,
        },
      };
    } catch (err: any) {
      return {
        isValid: false,
        error: err.message || "Failed to parse XML document.",
        formatted: "",
        stats: null,
      };
    }
  }, [inputXml, indentOption]);

  const handleCopy = () => {
    if (!validation.formatted) return;
    navigator.clipboard.writeText(validation.formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!validation.formatted) return;
    const blob = new Blob([validation.formatted], { type: "application/xml;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.xml";
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
        setInputXml(text);
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
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              XML Formatter and Validator
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Format, inspect, and validate XML markup with strict DOMParser compliance
            </p>
          </div>
        </div>

        {/* Sample actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setInputXml(SAMPLE_VALID_XML)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Valid XML
          </button>
          <button
            onClick={() => setInputXml(SAMPLE_INVALID_XML)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FEE2E2] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            Broken XML
          </button>
          <button
            onClick={() => setInputXml("")}
            className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            Clear
          </button>
        </div>
      </div>

      {/* Formatting & Status Bar */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-black" />
            <span className="text-xs font-black uppercase tracking-wider text-black">Indentation:</span>
            <div className="flex items-center gap-1">
              {(["2", "4", "tab", "min"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIndentOption(opt)}
                  className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-black transition-all ${
                    indentOption === opt
                      ? "bg-[#0284C7] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  {opt === "tab" ? "Tab" : opt === "min" ? "Minify" : `${opt} Spaces`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Validation Status Indicator */}
        {inputXml.trim() && (
          <div>
            {validation.isValid ? (
              <div className="flex items-center gap-2 text-xs font-black uppercase bg-[#BBF7D0] text-black px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="w-4 h-4 text-green-700" />
                <span>Well-Formed XML Document</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-black uppercase bg-[#FEE2E2] text-red-900 px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Invalid XML Syntax</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Callout */}
      {validation.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-black text-red-900 uppercase">XML Syntax Error Details</h3>
            <p className="text-xs font-mono font-bold text-red-800 break-words">{validation.error}</p>
          </div>
        </div>
      )}

      {/* Stats Counter if Valid */}
      {validation.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[11px] font-black uppercase text-gray-600">Total Elements</div>
            <div className="text-xl font-black text-black">{validation.stats.elementsCount}</div>
          </div>
          <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[11px] font-black uppercase text-gray-600">Attributes</div>
            <div className="text-xl font-black text-black">{validation.stats.attributesCount}</div>
          </div>
          <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[11px] font-black uppercase text-gray-600">Max Tree Depth</div>
            <div className="text-xl font-black text-black">{validation.stats.maxDepth}</div>
          </div>
          <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[11px] font-black uppercase text-gray-600">Total Characters</div>
            <div className="text-xl font-black text-black">{validation.stats.charactersCount}</div>
          </div>
        </div>
      )}

      {/* Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Raw Input */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Raw XML Input
            </label>
            <label className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload .xml
              <input
                type="file"
                accept=".xml,application/xml,text/xml,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={inputXml}
            onChange={(e) => setInputXml(e.target.value)}
            placeholder="Paste your XML document here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black resize-y"
            spellCheck={false}
          />
        </div>

        {/* Formatted Output */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Formatted XML Output
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!validation.formatted}
                className="px-3 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy XML"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!validation.formatted}
                className="px-3 py-1 text-xs font-black uppercase bg-[#A7F3D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#86EFAC] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download .xml
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={validation.formatted}
            placeholder="Formatted XML will display here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-y"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
