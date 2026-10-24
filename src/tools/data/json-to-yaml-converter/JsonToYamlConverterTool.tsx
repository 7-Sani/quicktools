"use client";

import React, { useState, useMemo } from "react";
import * as yaml from "js-yaml";
import {
  FileCode,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Settings2,
} from "lucide-react";

const SAMPLE_JSON = `{
  "apiVersion": "v1",
  "kind": "ConfigMap",
  "metadata": {
    "name": "game-demo",
    "namespace": "default",
    "labels": {
      "app": "pacman",
      "tier": "frontend"
    }
  },
  "data": {
    "player_initial_lives": 3,
    "ui_properties_file_name": "user-interface.properties",
    "game_properties": {
      "enemies": 4,
      "lives": 3,
      "enemies_cheat": false,
      "allowed_maps": ["map_01", "map_02", "map_bonus"]
    }
  }
}`;

export default function JsonToYamlConverterTool() {
  const [inputJson, setInputJson] = useState(SAMPLE_JSON);
  const [indentOption, setIndentOption] = useState<2 | 4>(2);
  const [quoteType, setQuoteType] = useState<"none" | "single" | "double">("none");
  const [noRefs, setNoRefs] = useState(true);
  const [copied, setCopied] = useState(false);

  // Parse and dump to YAML
  const conversion = useMemo(() => {
    if (!inputJson.trim()) {
      return {
        isValid: false,
        error: null,
        yaml: "",
      };
    }

    try {
      const parsed = JSON.parse(inputJson);

      const dumpOptions: yaml.DumpOptions = {
        indent: indentOption,
        noRefs,
        quoteStyle: quoteType === "none" ? undefined : quoteType,
        forceQuotes: quoteType !== "none",
        lineWidth: -1, // prevent unwanted arbitrary line wrapping
      };

      const yamlString = yaml.dump(parsed, dumpOptions);

      return {
        isValid: true,
        error: null,
        yaml: yamlString,
      };
    } catch (err: any) {
      return {
        isValid: false,
        error: err.message || "Invalid JSON syntax.",
        yaml: "",
      };
    }
  }, [inputJson, indentOption, quoteType, noRefs]);

  const handleCopy = () => {
    if (!conversion.yaml) return;
    navigator.clipboard.writeText(conversion.yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!conversion.yaml) return;
    const blob = new Blob([conversion.yaml], { type: "text/yaml;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.yaml";
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
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0284C7] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              JSON to YAML Converter
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Convert JSON objects into clean, human-readable YAML configurations
            </p>
          </div>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setInputJson(SAMPLE_JSON)}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Kubernetes JSON
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

      {/* Control Bar */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center gap-6 text-sm font-black">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-black" />
          <span className="uppercase text-xs tracking-wider">Indent:</span>
          <select
            value={indentOption}
            onChange={(e) => setIndentOption(Number(e.target.value) as 2 | 4)}
            className="px-2.5 py-1 text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="uppercase text-xs tracking-wider">Quotes:</span>
          <select
            value={quoteType}
            onChange={(e: any) => setQuoteType(e.target.value)}
            className="px-2.5 py-1 text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <option value="none">Auto (Unquoted when possible)</option>
            <option value="single">Single Quotes (&apos;)</option>
            <option value="double">Double Quotes (&quot;)</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={noRefs}
            onChange={(e) => setNoRefs(e.target.checked)}
            className="w-4 h-4 accent-[#0284C7] border-2 border-black cursor-pointer"
          />
          <span className="text-xs uppercase">Avoid Duplicate Anchors (&amp;ref)</span>
        </label>

        {conversion.isValid && (
          <div className="ml-auto flex items-center gap-2 text-xs font-black uppercase bg-[#BBF7D0] text-black px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <span>Valid JSON &bull; Ready</span>
          </div>
        )}
      </div>

      {/* Error Callout */}
      {conversion.error && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase">JSON Syntax Error</h3>
            <p className="text-xs font-mono font-bold text-red-800 mt-1">{conversion.error}</p>
          </div>
        </div>
      )}

      {/* Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JSON Input */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Source JSON Input
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
            placeholder="Paste your JSON string here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black resize-y"
            spellCheck={false}
          />
        </div>

        {/* YAML Output */}
        <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              YAML Output
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!conversion.yaml}
                className="px-3 py-1 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy YAML"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!conversion.yaml}
                className="px-3 py-1 text-xs font-black uppercase bg-[#A7F3D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#86EFAC] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download .yaml
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={conversion.yaml}
            placeholder="Generated YAML will appear here..."
            rows={18}
            className="w-full font-mono text-xs sm:text-sm p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-y"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
