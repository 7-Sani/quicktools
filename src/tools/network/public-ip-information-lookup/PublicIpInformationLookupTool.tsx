"use client";

import React, { useState, useEffect } from "react";
import { isValidIPv4, getIpClassification } from "@/lib/networkUtils";
import { Globe, ShieldCheck, Copy, Check, RefreshCw, AlertCircle, Loader2, MapPin, Server } from "lucide-react";

interface IpData {
  ip: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  org?: string;
  asn?: string;
  timezone?: string;
}

export default function PublicIpInformationLookupTool() {
  const [queryIp, setQueryIp] = useState<string>("");
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchPublicIp = async (targetIp?: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const endpoint = targetIp && targetIp.trim()
        ? `https://ipapi.co/${encodeURIComponent(targetIp.trim())}/json/`
        : `https://ipapi.co/json/`;

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`API returned HTTP status ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.reason || "Failed to locate IP information");
      }

      setIpData(data);
    } catch (err: any) {
      console.warn("ipapi.co query failed, attempting ipify fallback:", err);
      // Fallback to ipify if ipapi.co rate limit or ad-blocker occurs
      try {
        const ipifyRes = await fetch("https://api64.ipify.org?format=json");
        const ipifyData = await ipifyRes.json();
        setIpData({
          ip: ipifyData.ip,
          org: "Public Network Provider",
        });
      } catch (fallbackErr) {
        setErrorMsg(
          "Could not retrieve public IP information. If you are using an ad-blocker or strict tracking protection, requests to public IP lookup APIs may be blocked."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicIp();
  }, []);

  const handleCustomLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryIp.trim()) return;

    const classification = getIpClassification(queryIp.trim());
    if (classification.isPrivate) {
      setErrorMsg(
        `"${queryIp}" is a ${classification.scope}. Private local network addresses cannot be resolved via public Internet routing APIs.`
      );
      return;
    }

    fetchPublicIp(queryIp.trim());
  };

  const copyIp = () => {
    if (!ipData?.ip) return;
    navigator.clipboard.writeText(ipData.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Privacy Notice */}
      <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(59,130,246,1)]">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-blue-900 leading-relaxed space-y-1">
          <p>
            <strong>Browser Sandboxing Notice:</strong> Browser JavaScript can only view public edge routing returned by external lookup APIs. It cannot inspect private LAN hardware, scan internal ports, or breach firewall boundaries.
          </p>
        </div>
      </div>

      {/* Main Display & Search Card */}
      <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 block">
              Your Public IP Address
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-2xl sm:text-3xl font-black text-gray-900">
                {loading ? "Detecting IP..." : ipData?.ip || "Unknown"}
              </span>
              {ipData?.ip && (
                <button
                  onClick={copyIp}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 hover:bg-blue-200 border-2 border-black rounded-lg font-bold text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-blue-700" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy IP"}
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setQueryIp("");
              fetchPublicIp();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 border-2 border-black rounded-xl font-bold text-xs bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {/* Custom IP Query Form */}
        <form onSubmit={handleCustomLookup} className="flex gap-2">
          <input
            type="text"
            value={queryIp}
            onChange={(e) => setQueryIp(e.target.value)}
            placeholder="Inspect any public IP (e.g. 8.8.8.8 or 1.1.1.1)..."
            className="flex-1 px-4 py-2.5 border-2 border-black rounded-xl font-bold font-mono text-sm bg-gray-50 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading || !queryIp.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Lookup
          </button>
        </form>

        {errorMsg && (
          <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-start gap-3 text-red-900 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Information Grid */}
        {ipData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50">
              <span className="text-xs font-bold text-gray-500 block uppercase flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-blue-600" /> ISP / Organization
              </span>
              <span className="font-bold text-sm text-gray-900 block mt-1">
                {ipData.org || "Internet Service Provider"}
              </span>
            </div>

            <div className="p-4 border-2 border-black rounded-xl bg-gray-50">
              <span className="text-xs font-bold text-gray-500 block uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Location
              </span>
              <span className="font-bold text-sm text-gray-900 block mt-1">
                {[ipData.city, ipData.region, ipData.country_name].filter(Boolean).join(", ") || "Public Global"}
              </span>
            </div>

            <div className="p-4 border-2 border-black rounded-xl bg-gray-50">
              <span className="text-xs font-bold text-gray-500 block uppercase">Autonomous System (ASN)</span>
              <span className="font-mono font-bold text-sm text-blue-700 block mt-1">
                {ipData.asn || "Standard Public Route"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
