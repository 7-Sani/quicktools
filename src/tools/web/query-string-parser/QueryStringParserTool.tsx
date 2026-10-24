"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ListFilter,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Plus,
  ArrowUpDown,
  Download,
  CopyPlus,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";

interface ParamItem {
  id: string;
  key: string;
  value: string;
}

export default function QueryStringParserTool() {
  const [inputRaw, setInputRaw] = useState(
    "https://store.example.com/search?q=wireless+headphones&brand=sony&category=audio&in_stock=true&sort=price_asc&filter=noise_cancelling#results"
  );
  const [params, setParams] = useState<ParamItem[]>([]);
  const [baseUri, setBaseUri] = useState("https://store.example.com/search");
  const [hashFragment, setHashFragment] = useState("#results");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSorted, setIsSorted] = useState(false);

  // Parse input string when input changes
  useEffect(() => {
    const trimmed = inputRaw.trim();
    if (!trimmed) {
      setParams([]);
      setBaseUri("");
      setHashFragment("");
      return;
    }

    try {
      let queryPart = "";
      let basePart = "";
      let hashPart = "";

      // Check if it's a full URL or just a query string
      if (trimmed.includes("://") || trimmed.startsWith("//") || trimmed.includes("/")) {
        try {
          const urlObj = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
          basePart = `${urlObj.origin}${urlObj.pathname}`;
          queryPart = urlObj.search;
          hashPart = urlObj.hash;
        } catch {
          // Fallback manual split
          const hashIdx = trimmed.indexOf("#");
          let withoutHash = trimmed;
          if (hashIdx !== -1) {
            hashPart = trimmed.slice(hashIdx);
            withoutHash = trimmed.slice(0, hashIdx);
          }
          const qIdx = withoutHash.indexOf("?");
          if (qIdx !== -1) {
            basePart = withoutHash.slice(0, qIdx);
            queryPart = withoutHash.slice(qIdx);
          } else {
            queryPart = withoutHash;
          }
        }
      } else {
        const hashIdx = trimmed.indexOf("#");
        let withoutHash = trimmed;
        if (hashIdx !== -1) {
          hashPart = trimmed.slice(hashIdx);
          withoutHash = trimmed.slice(0, hashIdx);
        }
        queryPart = withoutHash;
      }

      setBaseUri(basePart);
      setHashFragment(hashPart);

      // Clean leading '?' for URLSearchParams
      const cleanSearch = queryPart.startsWith("?") ? queryPart.slice(1) : queryPart;
      const searchParams = new URLSearchParams(cleanSearch);

      const items: ParamItem[] = [];
      searchParams.forEach((value, key) => {
        items.push({
          id: Math.random().toString(36).substring(2, 9),
          key,
          value,
        });
      });

      setParams(items);
    } catch {
      // Ignored for raw user typing
    }
  }, [inputRaw]);

  // Reconstruct updated query string & URL
  const reconstructed = useMemo(() => {
    const listToUse = isSorted
      ? [...params].sort((a, b) => a.key.localeCompare(b.key))
      : params;

    const sp = new URLSearchParams();
    listToUse.forEach((p) => {
      if (p.key.trim()) {
        sp.append(p.key.trim(), p.value);
      }
    });

    const queryString = sp.toString() ? `?${sp.toString()}` : "";
    let fullUrl = "";

    if (baseUri.trim()) {
      fullUrl = `${baseUri.trim()}${queryString}${hashFragment}`;
    } else {
      fullUrl = queryString;
    }

    // JSON map
    const jsonMap: Record<string, string | string[]> = {};
    listToUse.forEach((p) => {
      const k = p.key.trim();
      if (!k) return;
      if (jsonMap[k] !== undefined) {
        if (Array.isArray(jsonMap[k])) {
          (jsonMap[k] as string[]).push(p.value);
        } else {
          jsonMap[k] = [jsonMap[k] as string, p.value];
        }
      } else {
        jsonMap[k] = p.value;
      }
    });

    return {
      queryString,
      fullUrl,
      jsonString: JSON.stringify(jsonMap, null, 2),
      count: listToUse.length,
    };
  }, [params, baseUri, hashFragment, isSorted]);

  const addParam = () => {
    setParams([
      ...params,
      { id: Math.random().toString(36).substring(2, 9), key: "", value: "" },
    ]);
  };

  const removeParam = (id: string) => {
    setParams(params.filter((p) => p.id !== id));
  };

  const duplicateParam = (item: ParamItem) => {
    setParams([
      ...params,
      { id: Math.random().toString(36).substring(2, 9), key: item.key, value: item.value },
    ]);
  };

  const updateParam = (id: string, field: "key" | "value", val: string) => {
    setParams(
      params.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadExample = (type: "ecommerce" | "oauth" | "pagination") => {
    if (type === "ecommerce") {
      setInputRaw(
        "https://store.example.com/search?q=wireless+headphones&brand=sony&category=audio&in_stock=true&sort=price_asc&filter=noise_cancelling#results"
      );
    } else if (type === "oauth") {
      setInputRaw(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id=123456789.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fmyapp.com%2Fcallback&response_type=code&scope=openid%20profile%20email&state=security_token_987"
      );
    } else {
      setInputRaw(
        "page=1&limit=50&sort_by=created_at&order=desc&status=active&status=pending&role=developer"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="neo-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-3">
          <label className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
            <ListFilter size={16} className="text-accent" />
            Input URL or Raw Query String
          </label>

          {/* Quick Examples */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-heading uppercase font-semibold">Examples:</span>
            <button
              onClick={() => loadExample("ecommerce")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              Full E-Commerce URL
            </button>
            <button
              onClick={() => loadExample("oauth")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              OAuth 2.0 Auth
            </button>
            <button
              onClick={() => loadExample("pagination")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              Raw Query Only
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={inputRaw}
            onChange={(e) => setInputRaw(e.target.value)}
            placeholder="Paste complete URL or raw query string (e.g. ?search=laptop&sort=asc)..."
            rows={3}
            className="w-full neo-input p-3 font-mono text-sm resize-y"
          />
          {inputRaw && (
            <button
              onClick={() => setInputRaw("")}
              className="absolute right-3 bottom-3 text-xs neo-btn neo-btn-secondary px-2 py-1 text-red-600"
              title="Clear input"
            >
              <Trash2 size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Editor & Reconstruction Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Interactive Parameter Editor Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="neo-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-3">
              <div>
                <span className="font-heading font-bold uppercase text-sm tracking-wide">
                  Parsed Parameters ({params.length})
                </span>
                <span className="text-xs text-text-secondary block mt-0.5">
                  Edit keys or values in real time to rebuild your query
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSorted(!isSorted)}
                  className={`text-xs neo-btn px-2.5 py-1 flex items-center gap-1 ${
                    isSorted ? "neo-btn-primary" : "neo-btn-secondary"
                  }`}
                  title="Sort alphabetically by parameter key"
                >
                  <ArrowUpDown size={12} />
                  <span>{isSorted ? "Sorted A-Z" : "Sort A-Z"}</span>
                </button>

                <button
                  type="button"
                  onClick={addParam}
                  className="text-xs neo-btn neo-btn-primary px-2.5 py-1 flex items-center gap-1 font-heading uppercase"
                >
                  <Plus size={13} />
                  <span>Add Param</span>
                </button>
              </div>
            </div>

            {params.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-secondary bg-surface/50 rounded-lg space-y-2">
                <p>No query parameters found in the current string.</p>
                <button
                  onClick={addParam}
                  className="neo-btn neo-btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Add First Parameter</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {params.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 p-2 rounded neo-border bg-surface/30 hover:bg-surface/70 transition-colors"
                  >
                    <span className="w-5 text-center font-mono text-xs text-text-secondary font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={p.key}
                      onChange={(e) => updateParam(p.id, "key", e.target.value)}
                      placeholder="key"
                      className="neo-input py-1.5 px-2.5 text-xs font-mono font-bold text-accent w-2/5"
                    />
                    <span className="text-text-secondary font-mono">=</span>
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => updateParam(p.id, "value", e.target.value)}
                      placeholder="value"
                      className="neo-input py-1.5 px-2.5 text-xs font-mono flex-1"
                    />

                    <button
                      type="button"
                      onClick={() => duplicateParam(p)}
                      className="p-1.5 neo-border rounded hover:bg-surface text-text-secondary"
                      title="Duplicate parameter"
                    >
                      <CopyPlus size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeParam(p.id)}
                      className="p-1.5 neo-border rounded hover:bg-red-50 text-red-600"
                      title="Delete parameter"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Reconstructed URL & Query Output (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-5 space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <span className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
                <LinkIcon size={16} className="text-accent" />
                Rebuilt URL & Query
              </span>

              <button
                onClick={() => {
                  setInputRaw("");
                  setParams([]);
                  setBaseUri("");
                  setHashFragment("");
                }}
                className="text-xs hover:underline flex items-center gap-1 text-text-secondary"
                title="Reset all"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>

            {/* Rebuilt Full URL */}
            {baseUri && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-heading font-bold uppercase text-text-secondary">
                    Full Reconstructed URL
                  </span>
                  <button
                    onClick={() => copyToClipboard(reconstructed.fullUrl, "full-url")}
                    className="hover:text-accent font-semibold text-xs flex items-center gap-1"
                  >
                    {copiedKey === "full-url" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === "full-url" ? "Copied" : "Copy URL"}</span>
                  </button>
                </div>
                <textarea
                  value={reconstructed.fullUrl}
                  readOnly
                  rows={4}
                  className="w-full neo-input p-2.5 font-mono text-xs bg-surface/50 text-text resize-y"
                />
              </div>
            )}

            {/* Rebuilt Query String Only */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold uppercase text-text-secondary">
                  Query String Only
                </span>
                <button
                  onClick={() => copyToClipboard(reconstructed.queryString, "query-string")}
                  className="hover:text-accent font-semibold text-xs flex items-center gap-1"
                >
                  {copiedKey === "query-string" ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedKey === "query-string" ? "Copied" : "Copy Query"}</span>
                </button>
              </div>
              <textarea
                value={reconstructed.queryString}
                readOnly
                rows={3}
                className="w-full neo-input p-2.5 font-mono text-xs font-semibold text-accent bg-surface/50 resize-y"
              />
            </div>

            {/* JSON Representation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold uppercase text-text-secondary">
                  Parsed JSON Representation
                </span>
                <button
                  onClick={() => copyToClipboard(reconstructed.jsonString, "json")}
                  className="hover:text-accent font-semibold text-xs flex items-center gap-1"
                >
                  {copiedKey === "json" ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedKey === "json" ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>
              <textarea
                value={reconstructed.jsonString}
                readOnly
                rows={6}
                className="w-full neo-input p-2.5 font-mono text-xs bg-surface/50 text-text resize-y"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
