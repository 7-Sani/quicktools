"use client";

import React, { useState, useMemo } from "react";
import * as yaml from "js-yaml";
import {
  FileCode2,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Settings2,
  Layers,
} from "lucide-react";

const SAMPLE_YAML_STANDARD = `# QuickTools Application Config
server:
  port: 8080
  host: "0.0.0.0"
  ssl:
    enabled: true
    certPath: "/etc/ssl/certs/app.crt"

database:
  driver: "postgres"
  poolSize: 20
  timeoutSeconds: 30
  replicas:
    - host: "db-replica-1.internal"
      priority: 1
    - host: "db-replica-2.internal"
      priority: 2

features:
  analytics: true
  fileConverters: true
  rateLimiting: false
  allowedOrigins:
    - "https://quicktools.local"
    - "https://app.quicktools.dev"`;

const SAMPLE_YAML_MULTIDOC = `---
kind: Deployment
apiVersion: apps/v1
metadata:
  name: web-frontend
  labels:
    tier: frontend
spec:
  replicas: 3
---
kind: Service
apiVersion: v1
metadata:
  name: web-service
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 8080`;

const SAMPLE_YAML_BROKEN = `server:
  host: localhost
  port: 8080
  bad_indentation:
    foo: 1
   bar: 2 # Indentation error!`;

export default function YamlToJsonConverterTool() {
  const [inputYaml, setInputYaml] = useState(SAMPLE_YAML_STANDARD);
  const [indentOption, setIndentOption] = useState<"2" | "4" | "min">("2");
  const [copied, setCopied] = useState(false);

  // Conversion logic using js-yaml
  const conversion = useMemo(() => {
    if (!inputYaml.trim()) {
      return {
        isValid: false,
        error: null,
        errorLine: null,
        errorCol: null,
        json: "",
        docCount: 0,
      };
    }

    try {
      // Check if multi-document
      const docs: any[] = [];
      yaml.loadAll(inputYaml, (doc) => {
        if (doc !== undefined) {
          docs.push(doc);
        }
      });

      if (docs.length === 0) {
        return {
          isValid: true,
          error: null,
          errorLine: null,
          errorCol: null,
          json: "null",
          docCount: 0,
        };
      }

      // If single document, output directly. If multiple documents, output array
      const outputData = docs.length === 1 ? docs[0] : docs;

      let jsonStr = "";
      if (indentOption === "min") {
        jsonStr = JSON.stringify(outputData);
      } else if (indentOption === "4") {
        jsonStr = JSON.stringify(outputData, null, 4);
      } else {
        jsonStr = JSON.stringify(outputData, null, 2);
      }

      return {
        isValid: true,
        error: null,
        errorLine: null,
        errorCol: null,
        json: jsonStr,
        docCount: docs.length,
      };
    } catch (err: any) {
      let line: number | null = null;
      let col: number | null = null;
      if (err.mark) {
        line = err.mark.line + 1; // 1-indexed
        col = err.mark.column + 1;
      }

      return {
        isValid: false,
        error: err.reason || err.message || "Invalid YAML syntax.",
        errorLine: line,
        errorCol: col,
        json: "",
        docCount: 0,
      };
    }
  }, [inputYaml, indentOption]);

  const handleCopy = () => {
    if (!conversion.json) return;
    navigator.clipboard.writeText(conversion.json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!conversion.json) return;
    const blob = new Blob([conversion.json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.json";
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
        setInputYaml(text);
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
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              YAML to JSON Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Transform YAML configurations into standardized JSON format with line-error debugging
            </p>
          </div>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setInputYaml(SAMPLE_YAML_STANDARD)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Standard YAML
          </button>
          <button
            onClick={() => setInputYaml(SAMPLE_YAML_MULTIDOC)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            Multi-Doc (K8s)
          </button>
          <button
            onClick={() => setInputYaml(SAMPLE_YAML_BROKEN)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#FEE2E2] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            Bad Syntax
          </button>
          <button
            onClick={() => setInputYaml("")}
            className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            Clear
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-black" />
            <span className="text-xs font-black uppercase tracking-wider text-black">JSON Indent:</span>
            <div className="flex items-center gap-1">
              {(["2", "4", "min"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIndentOption(opt)}
                  className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-black transition-all ${
                    indentOption === opt
                      ? "bg-[#0284C7] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  {opt === "min" ? "Minified" : `${opt} Spaces`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {conversion.isValid && (
          <div className="flex items-center gap-2 text-xs font-black uppercase bg-[#BBF7D0] text-black px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <span>
              Valid YAML &bull; {conversion.docCount} {conversion.docCount === 1 ? "document" : "documents"}
            </span>
          </div>
        )}
      </div>

      {/* Error Callout */}
      {conversion.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-black text-red-900 uppercase">
              YAML Syntax Error
              {conversion.errorLine && ` [Line ${conversion.errorLine}, Col ${conversion.errorCol}]`}
            </h3>
            <p className="text-xs font-mono font-bold text-red-800">{conversion.error}</p>
          </div>
        </div>
      )}

      {/* Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* YAML Input */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              YAML Source Input
            </label>
            <label className="px-2.5 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload .yaml
              <input
                type="file"
                accept=".yaml,.yml,text/yaml,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={inputYaml}
            onChange={(e) => setInputYaml(e.target.value)}
            placeholder="Paste your YAML string here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black resize-y"
            spellCheck={false}
          />
        </div>

        {/* JSON Output */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              JSON Output
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!conversion.json}
                className="px-3 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy JSON"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!conversion.json}
                className="px-3 py-1 text-xs font-black uppercase bg-[#A7F3D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#86EFAC] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download .json
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={conversion.json}
            placeholder="Parsed JSON output will appear here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-y"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
