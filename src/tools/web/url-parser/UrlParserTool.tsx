"use client";

import React, { useState, useMemo } from "react";
import {
  Globe,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  ExternalLink,
  AlertCircle,
  Hash,
  FileText,
  Key,
  Shield,
  Layers,
} from "lucide-react";

export default function UrlParserTool() {
  const [inputUrl, setInputUrl] = useState(
    "https://api.shop.example.com:8443/v2/products/shoes?category=running&brand=nike&in_stock=true&sort=price_asc#customer-reviews"
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Parse URL using native browser URL API
  const parsedResult = useMemo(() => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      return { isValid: false, error: "Please enter a URL to parse.", url: null, params: [] };
    }

    // Try parsing as-is, or with https:// if no protocol is given
    let urlObj: URL | null = null;
    let autoPrefixed = false;

    try {
      urlObj = new URL(trimmed);
    } catch {
      try {
        if (!trimmed.includes("://") && !trimmed.startsWith("//")) {
          urlObj = new URL(`https://${trimmed}`);
          autoPrefixed = true;
        }
      } catch (err2) {
        const msg = err2 instanceof Error ? err2.message : "Invalid URL structure";
        return { isValid: false, error: `Malformed URL: ${msg}`, url: null, params: [] };
      }
    }

    if (!urlObj) {
      return {
        isValid: false,
        error: "Malformed URL syntax. Could not parse protocol or hostname.",
        url: null,
        params: [],
      };
    }

    const params: { key: string; value: string }[] = [];
    urlObj.searchParams.forEach((value, key) => {
      params.push({ key, value });
    });

    const pathSegments = urlObj.pathname.split("/").filter(Boolean);

    return {
      isValid: true,
      error: null,
      url: urlObj,
      autoPrefixed,
      params,
      pathSegments,
    };
  }, [inputUrl]);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllAsJson = () => {
    if (!parsedResult.url) return;
    const u = parsedResult.url;
    const obj = {
      href: u.href,
      origin: u.origin,
      protocol: u.protocol,
      username: u.username,
      password: u.password,
      host: u.host,
      hostname: u.hostname,
      port: u.port || (u.protocol === "https:" ? "443" : u.protocol === "http:" ? "80" : ""),
      pathname: u.pathname,
      pathSegments: parsedResult.pathSegments,
      search: u.search,
      searchParams: Object.fromEntries(parsedResult.params.map((p) => [p.key, p.value])),
      hash: u.hash,
    };
    copyToClipboard(JSON.stringify(obj, null, 2), "all-json");
  };

  const loadExample = (type: "ecommerce" | "oauth" | "api") => {
    if (type === "ecommerce") {
      setInputUrl(
        "https://api.shop.example.com:8443/v2/products/shoes?category=running&brand=nike&in_stock=true&sort=price_asc#customer-reviews"
      );
    } else if (type === "oauth") {
      setInputUrl(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id=782194829-client.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fmyapp.com%2Fauth%2Fcallback&response_type=code&scope=openid%20profile%20email&state=xyz987"
      );
    } else {
      setInputUrl(
        "https://developer:secret_token@gitlab.company.internal:9090/engineering/core-services/commits/main?ref=feature%2Fauth&limit=50#commit-history"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="neo-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-3">
          <label className="font-heading font-bold uppercase text-sm tracking-wide flex items-center gap-2">
            <Globe size={16} className="text-accent" />
            Enter Target URL
          </label>

          {/* Quick Examples */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-heading uppercase font-semibold">
              Examples:
            </span>
            <button
              onClick={() => loadExample("ecommerce")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              E-Commerce
            </button>
            <button
              onClick={() => loadExample("oauth")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              OAuth 2.0
            </button>
            <button
              onClick={() => loadExample("api")}
              className="text-xs px-2.5 py-1 neo-border rounded bg-surface hover:bg-accent/10 font-medium"
            >
              Auth & Port
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="e.g. https://example.com:8080/path/to/page?query=test#hash"
            className="w-full neo-input py-3 pl-3 pr-24 font-mono text-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => setInputUrl("")}
              disabled={!inputUrl}
              className="text-xs neo-btn neo-btn-secondary px-2 py-1 text-red-600 disabled:opacity-40"
              title="Clear input"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {parsedResult.autoPrefixed && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded neo-border flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>Note: No protocol was provided in your input. Defaulted to &apos;https://&apos; for parsing.</span>
          </div>
        )}

        {!parsedResult.isValid && inputUrl.trim() && (
          <div className="text-xs text-red-600 bg-red-50 p-3 rounded neo-border flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span className="font-medium">{parsedResult.error}</span>
          </div>
        )}
      </div>

      {/* Parsed Output Cards */}
      {parsedResult.isValid && parsedResult.url && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 neo-card p-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-emerald-700">
                Valid URL Structure
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAllAsJson}
                className="text-xs neo-btn neo-btn-primary px-3 py-1.5 flex items-center gap-1.5"
              >
                {copiedKey === "all-json" ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedKey === "all-json" ? "JSON Copied!" : "Copy Full JSON"}</span>
              </button>
              <a
                href={parsedResult.url.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs neo-btn neo-btn-secondary px-3 py-1.5 flex items-center gap-1.5"
              >
                <ExternalLink size={13} />
                <span>Open in Tab</span>
              </a>
            </div>
          </div>

          {/* Grid of Components */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Protocol */}
            <div className="neo-card p-4 space-y-1 relative group">
              <div className="flex items-center justify-between text-xs text-text-secondary font-heading uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <Shield size={14} className="text-accent" />
                  Protocol
                </span>
                <button
                  onClick={() => copyToClipboard(parsedResult.url!.protocol, "protocol")}
                  className="hover:text-accent p-1"
                  title="Copy protocol"
                >
                  {copiedKey === "protocol" ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
              <div className="text-sm font-mono font-bold text-text break-all">
                {parsedResult.url.protocol}
              </div>
              <div className="text-[11px] text-text-secondary">
                {parsedResult.url.protocol === "https:"
                  ? "Secure Transport (TLS/SSL)"
                  : parsedResult.url.protocol === "http:"
                  ? "Unencrypted HTTP"
                  : "Custom Scheme"}
              </div>
            </div>

            {/* Hostname */}
            <div className="neo-card p-4 space-y-1 relative group">
              <div className="flex items-center justify-between text-xs text-text-secondary font-heading uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <Globe size={14} className="text-accent" />
                  Hostname / Domain
                </span>
                <button
                  onClick={() => copyToClipboard(parsedResult.url!.hostname, "hostname")}
                  className="hover:text-accent p-1"
                  title="Copy hostname"
                >
                  {copiedKey === "hostname" ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
              <div className="text-sm font-mono font-bold text-text break-all">
                {parsedResult.url.hostname}
              </div>
              <div className="text-[11px] text-text-secondary">
                Host authority without port
              </div>
            </div>

            {/* Port */}
            <div className="neo-card p-4 space-y-1 relative group">
              <div className="flex items-center justify-between text-xs text-text-secondary font-heading uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <Hash size={14} className="text-accent" />
                  Port
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      parsedResult.url!.port ||
                        (parsedResult.url!.protocol === "https:" ? "443" : "80"),
                      "port"
                    )
                  }
                  className="hover:text-accent p-1"
                  title="Copy port"
                >
                  {copiedKey === "port" ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
              <div className="text-sm font-mono font-bold text-text">
                {parsedResult.url.port ? (
                  <span className="text-accent">{parsedResult.url.port} (explicit)</span>
                ) : (
                  <span>
                    {parsedResult.url.protocol === "https:"
                      ? "443"
                      : parsedResult.url.protocol === "http:"
                      ? "80"
                      : "Default"}{" "}
                    <span className="text-xs text-text-secondary font-normal">(implicit)</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-text-secondary">
                Network destination port
              </div>
            </div>

            {/* Origin */}
            <div className="neo-card p-4 space-y-1 relative group">
              <div className="flex items-center justify-between text-xs text-text-secondary font-heading uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <Layers size={14} className="text-accent" />
                  Origin
                </span>
                <button
                  onClick={() => copyToClipboard(parsedResult.url!.origin, "origin")}
                  className="hover:text-accent p-1"
                  title="Copy origin"
                >
                  {copiedKey === "origin" ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
              <div className="text-sm font-mono font-bold text-text break-all">
                {parsedResult.url.origin}
              </div>
              <div className="text-[11px] text-text-secondary">
                Protocol + Domain + Port (CORS origin)
              </div>
            </div>

            {/* Pathname */}
            <div className="neo-card p-4 space-y-1 relative group">
              <div className="flex items-center justify-between text-xs text-text-secondary font-heading uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <FileText size={14} className="text-accent" />
                  Pathname
                </span>
                <button
                  onClick={() => copyToClipboard(parsedResult.url!.pathname, "pathname")}
                  className="hover:text-accent p-1"
                  title="Copy pathname"
                >
                  {copiedKey === "pathname" ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
              <div className="text-sm font-mono font-bold text-text break-all">
                {parsedResult.url.pathname || "/"}
              </div>
              <div className="text-[11px] text-text-secondary">
                {parsedResult.pathSegments.length} path segment(s)
              </div>
            </div>

            {/* Hash / Fragment */}
            <div className="neo-card p-4 space-y-1 relative group">
              <div className="flex items-center justify-between text-xs text-text-secondary font-heading uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <Hash size={14} className="text-accent" />
                  Hash Fragment
                </span>
                <button
                  onClick={() => copyToClipboard(parsedResult.url!.hash, "hash")}
                  disabled={!parsedResult.url.hash}
                  className="hover:text-accent p-1 disabled:opacity-30"
                  title="Copy hash"
                >
                  {copiedKey === "hash" ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
              <div className="text-sm font-mono font-bold text-text break-all">
                {parsedResult.url.hash || (
                  <span className="text-text-secondary font-normal italic">None</span>
                )}
              </div>
              <div className="text-[11px] text-text-secondary">
                Client-side anchor identifier
              </div>
            </div>
          </div>

          {/* Authentication Credentials (if present) */}
          {(parsedResult.url.username || parsedResult.url.password) && (
            <div className="neo-card p-4 space-y-2 bg-amber-50/50">
              <div className="text-xs font-heading font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Key size={14} />
                Basic Auth Credentials Embedded in URL
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-text-secondary">Username:</span>{" "}
                  <span className="font-bold">{parsedResult.url.username}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Password:</span>{" "}
                  <span className="font-bold">{parsedResult.url.password ? "••••••••" : "None"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Path Segments Visualizer */}
          {parsedResult.pathSegments.length > 0 && (
            <div className="neo-card p-5 space-y-3">
              <div className="font-heading font-bold uppercase text-sm tracking-wide">
                Path Segments Hierarchy
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-1 neo-border rounded bg-surface font-mono font-bold">
                  /
                </span>
                {parsedResult.pathSegments.map((seg, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-text-secondary text-xs">/</span>
                    <span className="text-xs px-2.5 py-1 neo-border rounded bg-accent/10 text-accent font-mono font-semibold">
                      {seg}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Query Parameters Table */}
          <div className="neo-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <div>
                <h3 className="font-heading font-bold uppercase text-sm tracking-wide">
                  Query String Parameters
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {parsedResult.params.length === 0
                    ? "No query parameters found in this URL."
                    : `${parsedResult.params.length} key-value parameter(s) parsed via URLSearchParams.`}
                </p>
              </div>

              {parsedResult.params.length > 0 && (
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(
                        Object.fromEntries(parsedResult.params.map((p) => [p.key, p.value])),
                        null,
                        2
                      ),
                      "params-json"
                    )
                  }
                  className="text-xs neo-btn neo-btn-secondary px-2.5 py-1 flex items-center gap-1.5"
                >
                  {copiedKey === "params-json" ? <Check size={12} /> : <Copy size={12} />}
                  <span>Copy as JSON</span>
                </button>
              )}
            </div>

            {parsedResult.params.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-border bg-surface">
                      <th className="p-2.5 font-heading font-bold uppercase w-12 text-center">#</th>
                      <th className="p-2.5 font-heading font-bold uppercase w-1/3">Key</th>
                      <th className="p-2.5 font-heading font-bold uppercase">Value</th>
                      <th className="p-2.5 font-heading font-bold uppercase w-20 text-center">Copy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedResult.params.map((param, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/40 hover:bg-surface/50 transition-colors"
                      >
                        <td className="p-2.5 text-center text-text-secondary font-mono">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-accent break-all">
                          {param.key}
                        </td>
                        <td className="p-2.5 font-mono text-text break-all">
                          {param.value}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() =>
                              copyToClipboard(`${param.key}=${param.value}`, `param-${idx}`)
                            }
                            className="p-1 neo-border rounded hover:bg-surface inline-block"
                            title="Copy key=value"
                          >
                            {copiedKey === `param-${idx}` ? (
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
            ) : (
              <div className="p-6 text-center text-xs text-text-secondary bg-surface/50 rounded-lg">
                No query parameters (e.g. &apos;?key=value&apos;) detected in the provided URL.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
