"use client";

import React, { useState } from "react";
import {
  Activity,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Clock,
  ArrowRight,
  Server,
  AlertTriangle,
  Info,
  Sparkles,
  Layers,
} from "lucide-react";

interface StatusResponse {
  url: string;
  status: number;
  statusText: string;
  responseTimeMs: number;
  headers: Record<string, string>;
  redirectLocation: string | null;
  contentType: string;
  server: string;
}

export default function HttpStatusCheckerTool() {
  const [inputUrl, setInputUrl] = useState("https://httpbin.org/status/200");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StatusResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const checkStatus = async (overrideUrl?: string) => {
    const target = overrideUrl || inputUrl;
    if (!target.trim()) {
      setErrorMsg("Please enter a URL to check.");
      setResult(null);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch("/api/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || `HTTP ${res.status}: Failed to inspect target URL.`);
      } else {
        setResult(data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network failure communicating with verification server.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-600", light: "bg-emerald-50" };
    if (status >= 300 && status < 400) return { bg: "bg-blue-500", text: "text-blue-700", border: "border-blue-600", light: "bg-blue-50" };
    if (status >= 400 && status < 500) return { bg: "bg-amber-500", text: "text-amber-800", border: "border-amber-600", light: "bg-amber-50" };
    return { bg: "bg-red-500", text: "text-red-700", border: "border-red-600", light: "bg-red-50" };
  };

  const loadExample = (url: string) => {
    setInputUrl(url);
    checkStatus(url);
  };

  return (
    <div className="space-y-6">
      {/* Honesty & SSRF Security Banner */}
      <div className="neo-card p-4 bg-surface text-xs text-text-secondary flex items-start gap-3">
        <Info size={16} className="text-accent shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-text">
            Transparent HTTP Inspection &amp; Architecture:
          </p>
          <p>
            Standard browsers block direct cross-origin HTTP status inspection due to browser CORS policies. To provide genuine status codes and headers, requests are routed through our secure server-side endpoint with strict SSRF protection (arbitrary private networks, localhost, 127.0.0.1, and RFC 1918 subnets are strictly blocked).
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="neo-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-3">
          <label className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
            <Activity size={16} className="text-accent" />
            Check Target URL
          </label>

          {/* Quick Examples */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-secondary font-heading uppercase font-semibold">
              Test Presets:
            </span>
            <button
              onClick={() => loadExample("https://httpbin.org/status/200")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              200 OK
            </button>
            <button
              onClick={() => loadExample("https://httpbin.org/status/301")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              301 Redirect
            </button>
            <button
              onClick={() => loadExample("https://httpbin.org/status/404")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              404 Not Found
            </button>
            <button
              onClick={() => loadExample("https://httpbin.org/status/500")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              500 Error
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkStatus()}
              placeholder="https://example.com"
              className="w-full neo-input py-3 pl-3 pr-10 font-mono text-sm"
            />
            {inputUrl && (
              <button
                onClick={() => setInputUrl("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-red-600"
                title="Clear"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => checkStatus()}
            disabled={loading || !inputUrl.trim()}
            className="neo-btn neo-btn-primary px-6 py-3 font-heading uppercase font-bold text-xs tracking-wider flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Activity size={16} />
                <span>Check Status</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 neo-border rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Status Header Badge Card */}
          {(() => {
            const colors = getStatusColor(result.status);
            return (
              <div
                className={`neo-card p-6 border-2 ${colors.border} ${colors.light} space-y-4`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-2xl sm:text-4xl font-heading font-black tracking-tight px-4 py-2 rounded-lg text-white neo-border ${colors.bg}`}
                    >
                      {result.status}
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-xl uppercase tracking-tight text-text">
                        {result.statusText}
                      </h2>
                      <div className="font-mono text-xs text-text-secondary break-all mt-0.5">
                        {result.url}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded neo-border bg-white text-xs font-mono font-semibold">
                      <Clock size={14} className="text-accent" />
                      <span>{result.responseTimeMs} ms</span>
                    </div>

                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-btn neo-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
                    >
                      <ExternalLink size={13} />
                      <span>Visit</span>
                    </a>
                  </div>
                </div>

                {/* Redirect Notice */}
                {result.redirectLocation && (
                  <div className="p-3 rounded neo-border bg-white text-xs flex items-center gap-2">
                    <span className="font-heading font-bold uppercase text-accent">Redirect Destination:</span>
                    <span className="font-mono break-all">{result.redirectLocation}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Quick Metrics */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="neo-card p-4 space-y-1">
              <span className="text-xs text-text-secondary font-heading uppercase font-semibold flex items-center gap-1.5">
                <Server size={14} className="text-accent" />
                Server Software
              </span>
              <div className="text-sm font-mono font-bold text-text truncate">
                {result.server || "Not Disclosed"}
              </div>
            </div>

            <div className="neo-card p-4 space-y-1">
              <span className="text-xs text-text-secondary font-heading uppercase font-semibold flex items-center gap-1.5">
                <Layers size={14} className="text-accent" />
                Content-Type
              </span>
              <div className="text-sm font-mono font-bold text-text truncate">
                {result.contentType || "Unknown"}
              </div>
            </div>

            <div className="neo-card p-4 space-y-1">
              <span className="text-xs text-text-secondary font-heading uppercase font-semibold flex items-center gap-1.5">
                <Clock size={14} className="text-accent" />
                Response Latency
              </span>
              <div className="text-sm font-mono font-bold text-text">
                {result.responseTimeMs} milliseconds
              </div>
            </div>
          </div>

          {/* Response Headers Table */}
          <div className="neo-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <div>
                <h3 className="font-heading font-bold uppercase text-sm tracking-wide">
                  Response Headers ({Object.keys(result.headers).length})
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Raw headers returned by the remote server
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyToClipboard(JSON.stringify(result.headers, null, 2), "headers-json")
                }
                className="text-xs neo-btn neo-btn-secondary px-2.5 py-1 flex items-center gap-1"
              >
                {copiedKey === "headers-json" ? <Check size={13} /> : <Copy size={13} />}
                <span>Copy Headers JSON</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-border bg-surface">
                    <th className="p-2.5 font-heading font-bold uppercase w-1/3">Header Name</th>
                    <th className="p-2.5 font-heading font-bold uppercase">Value</th>
                    <th className="p-2.5 font-heading font-bold uppercase w-16 text-center">Copy</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.headers).map(([key, val], idx) => (
                    <tr
                      key={key}
                      className="border-b border-border/40 hover:bg-surface/50 transition-colors"
                    >
                      <td className="p-2.5 font-mono font-bold text-accent break-all">
                        {key}
                      </td>
                      <td className="p-2.5 font-mono text-text break-all">
                        {val}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => copyToClipboard(`${key}: ${val}`, `h-${idx}`)}
                          className="p-1 neo-border rounded hover:bg-surface inline-block"
                          title="Copy header"
                        >
                          {copiedKey === `h-${idx}` ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
