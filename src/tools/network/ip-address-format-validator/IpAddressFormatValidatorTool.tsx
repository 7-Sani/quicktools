"use client";

import React, { useState, useMemo } from "react";
import { isValidIPv4, getIpClassification, ipToInt, intToBinary, intToHex } from "@/lib/networkUtils";
import { CheckCircle2, XCircle, ShieldCheck, Copy, Check, Info } from "lucide-react";

export default function IpAddressFormatValidatorTool() {
  const [ipInput, setIpInput] = useState<string>("192.168.1.1");
  const [copied, setCopied] = useState<boolean>(false);

  const evaluation = useMemo(() => {
    const raw = ipInput.trim();
    if (!raw) return null;

    // Check IPv4
    if (isValidIPv4(raw)) {
      const classification = getIpClassification(raw);
      const intVal = ipToInt(raw);
      return {
        isValid: true,
        version: "IPv4",
        ip: raw,
        scope: classification.scope,
        isPrivate: classification.isPrivate,
        type: classification.type,
        binary: intToBinary(intVal),
        hex: intToHex(intVal),
        integer: intVal,
      };
    }

    // Check basic IPv6 regex
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?::(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?$/;
    if (ipv6Regex.test(raw)) {
      let scope = "Public IPv6 (Globally Routable)";
      let isPrivate = false;
      const lower = raw.toLowerCase();
      if (lower === "::1") {
        scope = "IPv6 Loopback (localhost)";
        isPrivate = true;
      } else if (lower.startsWith("fe80:")) {
        scope = "IPv6 Link-Local (fe80::/10)";
        isPrivate = true;
      } else if (lower.startsWith("fc") || lower.startsWith("fd")) {
        scope = "IPv6 Unique Local Address (ULA / RFC 4193)";
        isPrivate = true;
      } else if (lower.startsWith("ff")) {
        scope = "IPv6 Multicast (ff00::/8)";
        isPrivate = false;
      }

      return {
        isValid: true,
        version: "IPv6",
        ip: raw,
        scope,
        isPrivate,
        type: "128-bit Internet Protocol v6",
      };
    }

    // Diagnostic on why it failed IPv4
    const parts = raw.split(".");
    let reason = "Invalid address format.";
    if (parts.length === 4) {
      for (const p of parts) {
        if (!/^\d+$/.test(p)) {
          reason = `Octet "${p}" contains non-numeric characters.`;
          break;
        }
        if (p.length > 1 && p.startsWith("0")) {
          reason = `Octet "${p}" contains illegal leading zero.`;
          break;
        }
        const n = parseInt(p, 10);
        if (n < 0 || n > 255) {
          reason = `Octet value "${p}" is out of allowable range (0-255).`;
          break;
        }
      }
    } else if (parts.length > 1) {
      reason = `IPv4 requires exactly 4 octets separated by dots (found ${parts.length}).`;
    }

    return {
      isValid: false,
      reason,
    };
  }, [ipInput]);

  const copyDetails = () => {
    if (!evaluation || !evaluation.isValid) return;
    const text = `IP Address Validation:
Address: ${evaluation.ip}
Version: ${evaluation.version}
Scope: ${evaluation.scope}
Type: ${evaluation.type}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Input Box */}
      <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <CheckCircle2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-black">IP Address Validation</h2>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            IP Address (IPv4 or IPv6)
          </label>
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value.trim())}
            placeholder="e.g. 192.168.1.1, 8.8.8.8, or 2001:db8::1"
            className="w-full px-4 py-3 border-2 border-black rounded-xl font-mono font-bold text-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200">
          <span className="text-xs font-bold text-gray-600">Quick Test Cases:</span>
          {[
            { ip: "192.168.1.1", label: "Private LAN (192.168)" },
            { ip: "10.0.0.1", label: "Private Intranet (10.0)" },
            { ip: "1.1.1.1", label: "Public (Cloudflare)" },
            { ip: "127.0.0.1", label: "Loopback" },
            { ip: "169.254.1.1", label: "APIPA Link-Local" },
            { ip: "224.0.0.1", label: "Multicast" },
            { ip: "::1", label: "IPv6 Localhost" },
          ].map((t) => (
            <button
              key={t.ip}
              onClick={() => setIpInput(t.ip)}
              className="px-2.5 py-1 text-xs font-bold bg-gray-100 hover:bg-blue-100 border border-black rounded-lg transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Validation Result Box */}
      {evaluation && (
        <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-3">
            <h3 className="text-xl font-black">Syntax &amp; Classification Analysis</h3>
            {evaluation.isValid && (
              <button
                onClick={copyDetails}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 hover:bg-blue-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-blue-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Analysis"}
              </button>
            )}
          </div>

          {evaluation.isValid ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border-2 border-green-500 rounded-xl flex items-center gap-3 text-green-950 font-bold">
                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                <div>
                  <span className="text-base block">Valid {evaluation.version} Address</span>
                  <span className="text-xs text-green-800 font-normal">
                    Passed all syntax, delimiter, and octet boundary checks.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 border-2 border-black rounded-xl bg-gray-50">
                  <span className="text-xs text-gray-500 font-bold block uppercase">IP Version</span>
                  <span className="font-mono font-black text-xl text-blue-700">{evaluation.version}</span>
                </div>

                <div className="p-4 border-2 border-black rounded-xl bg-gray-50 sm:col-span-2">
                  <span className="text-xs text-gray-500 font-bold block uppercase">Routing Scope / Classification</span>
                  <span className="font-bold text-base text-gray-900 block mt-0.5">{evaluation.scope}</span>
                  <span className="text-xs text-gray-600 font-mono">{evaluation.type}</span>
                </div>
              </div>

              {evaluation.binary && (
                <div className="p-4 border-2 border-black rounded-xl bg-gray-900 text-gray-100 font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Binary:</span>
                    <span className="text-blue-300 font-bold">{evaluation.binary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hexadecimal:</span>
                    <span className="text-yellow-300 font-bold">{evaluation.hex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Decimal Integer:</span>
                    <span className="text-green-300 font-bold">{evaluation.integer}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-start gap-3 text-red-950 font-bold">
              <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-base block">Invalid IP Address Format</span>
                <span className="text-xs text-red-800 font-normal mt-0.5 block">
                  {evaluation.reason}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
