"use client";

import React, { useState } from "react";
import { Search, Globe, Copy, Check, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA"];

export default function DnsRecordLookupTool() {
  const [domain, setDomain] = useState<string>("google.com");
  const [recordType, setRecordType] = useState<string>("A");
  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<DnsAnswer[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedData, setCopiedData] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<string | null>(null);

  const cleanDomain = (d: string) => {
    return d.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
  };

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const hostname = cleanDomain(domain);
    if (!hostname) {
      setErrorMsg("Please enter a valid domain name (e.g. example.com).");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setRecords(null);
    setResponseStatus(null);

    try {
      // Use Cloudflare DNS-over-HTTPS (DoH) API with Google DoH fallback
      const cfUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${recordType}`;
      const res = await fetch(cfUrl, {
        headers: { Accept: "application/dns-json" },
      });

      if (!res.ok) {
        throw new Error(`DNS gateway returned HTTP ${res.status}`);
      }

      const json = await res.json();

      // Check standard DNS response codes
      // 0 = NOERROR, 3 = NXDOMAIN, 2 = SERVFAIL
      if (json.Status === 3) {
        setResponseStatus("NXDOMAIN (Domain Not Found)");
        setErrorMsg(`The domain "${hostname}" does not exist (NXDOMAIN).`);
      } else if (json.Status === 2) {
        setResponseStatus("SERVFAIL (Server Failure)");
        setErrorMsg("The authoritative name servers returned a server failure (SERVFAIL).");
      } else if (json.Answer && json.Answer.length > 0) {
        setResponseStatus("NOERROR (Success)");
        setRecords(json.Answer);
      } else {
        setResponseStatus("NOERROR (0 Records)");
        setRecords([]);
      }
    } catch (err: any) {
      console.warn("Primary DoH failed, trying Google DoH fallback:", err);
      try {
        const googleUrl = `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=${recordType}`;
        const gRes = await fetch(googleUrl);
        const gJson = await gRes.json();
        if (gJson.Answer && gJson.Answer.length > 0) {
          setResponseStatus("NOERROR (Success)");
          setRecords(gJson.Answer);
        } else {
          setResponseStatus("NOERROR (0 Records)");
          setRecords([]);
        }
      } catch (fallbackErr: any) {
        setErrorMsg(
          "Network request to public DNS-over-HTTPS providers failed. Please check your internet connection or verify if an ad-blocker or firewall is restricting DoH requests."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const copyRecord = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedData(text);
    setTimeout(() => setCopiedData(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Transparency Banner */}
      <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(59,130,246,1)]">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
          <strong>DNS-over-HTTPS (DoH) Architecture:</strong> Web browsers cannot initiate raw UDP port 53 packets. Queries are dispatched transparently through standards-compliant, public DNS-over-HTTPS (DoH) JSON resolvers (Cloudflare &amp; Google Public DNS).
        </p>
      </div>

      {/* Query Form */}
      <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Domain Name
              </label>
              <div className="relative">
                <Globe className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. wikipedia.org or github.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Record Type
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded-xl font-black bg-gray-50 focus:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {RECORD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t} Record
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Querying DNS..." : "Lookup DNS Records"}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-start gap-3 text-red-900 text-sm font-bold">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {records !== null && (
        <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
            <h3 className="text-xl font-black">
              {recordType} Records for <span className="text-blue-700">{cleanDomain(domain)}</span>
            </h3>
            {responseStatus && (
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-gray-100 border border-black rounded-full">
                Status: {responseStatus}
              </span>
            )}
          </div>

          {records.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-bold border-2 border-dashed border-gray-300 rounded-xl">
              No {recordType} records found for this domain.
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-black rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 border-b-2 border-black font-black uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">TTL</th>
                    <th className="py-2.5 px-3">Data / Value</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono">
                  {records.map((r, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-semibold">{r.name}</td>
                      <td className="py-2.5 px-3 text-gray-500">{r.TTL}s</td>
                      <td className="py-2.5 px-3 font-black text-gray-900 break-all select-all">
                        {r.data}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => copyRecord(r.data)}
                          className="px-2 py-1 bg-gray-100 hover:bg-blue-100 border border-black rounded text-[10px] font-bold"
                        >
                          {copiedData === r.data ? "Copied" : "Copy"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
