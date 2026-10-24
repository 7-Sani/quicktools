"use client";

import React, { useState } from "react";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import { computeHash } from "@/lib/cryptoUtils";
import { formatBytes } from "@/lib/audioUtils";

export default function FileChecksumCalculatorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [sha256, setSha256] = useState("");
  const [sha512, setSha512] = useState("");
  const [sha1, setSha1] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification input
  const [expectedHash, setExpectedHash] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setExpectedHash("");
    setIsLoading(true);
    setFile(selected);

    try {
      const buffer = await selected.arrayBuffer();
      const [h256, h512, h1] = await Promise.all([
        computeHash(buffer, "SHA-256"),
        computeHash(buffer, "SHA-512"),
        computeHash(buffer, "SHA-1"),
      ]);

      setSha256(h256);
      setSha512(h512);
      setSha1(h1);
    } catch {
      setError("Failed to compute file checksum. File may be too large for browser memory.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyChecksum = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Compare expected hash
  const trimmedExpected = expectedHash.trim().toLowerCase();
  const isMatch =
    trimmedExpected.length > 0 &&
    (trimmedExpected === sha256.toLowerCase() ||
      trimmedExpected === sha512.toLowerCase() ||
      trimmedExpected === sha1.toLowerCase());

  const isMismatch =
    trimmedExpected.length > 0 &&
    !isMatch &&
    (trimmedExpected.length === 64 ||
      trimmedExpected.length === 128 ||
      trimmedExpected.length === 40);

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          label="Drop any file to calculate checksum"
          description="Computes SHA-256, SHA-512, and SHA-1 hashes (Up to 500MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Calculating cryptographic checksums in browser memory...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {file && sha256 && (
        <div className="space-y-6">
          {/* File summary */}
          <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center neo-border rounded-lg bg-accent/10 text-accent shrink-0">
                <FileCheck size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-sm truncate uppercase">
                  {file.name}
                </p>
                <p className="text-xs text-text-secondary">
                  Size: {formatBytes(file.size)} • Type: {file.type || "binary/octet-stream"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setSha256("");
                setSha512("");
                setSha1("");
                setExpectedHash("");
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Verify Another File
            </button>
          </div>

          {/* Checksum Verification Box */}
          <div className="neo-card p-6 space-y-3">
            <h3 className="font-heading font-bold text-sm uppercase text-text-secondary">
              Verify Integrity Against Expected Checksum
            </h3>
            <p className="text-xs text-text-secondary">
              Paste the checksum provided by the software publisher or download source:
            </p>

            <input
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder="Paste expected SHA-256, SHA-512, or SHA-1 hash here..."
              className="neo-input font-mono text-xs sm:text-sm py-2.5"
            />

            {isMatch && (
              <div className="p-3 neo-border rounded-lg bg-green-50 border-green-500 text-green-800 flex items-center gap-2 text-xs font-heading font-bold uppercase">
                <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                Checksum Match Verified! The file is genuine, unmodified, and authentic.
              </div>
            )}

            {isMismatch && (
              <div className="p-3 neo-border rounded-lg bg-red-50 border-red-500 text-red-800 flex items-center gap-2 text-xs font-heading font-bold uppercase">
                <XCircle size={18} className="text-red-600 shrink-0" />
                Checksum Mismatch! The file does NOT match the expected hash. It may be corrupt or tampered.
              </div>
            )}
          </div>

          {/* Checksums Breakdown */}
          <div className="space-y-4">
            {/* SHA-256 */}
            <div className="neo-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase text-accent">
                  SHA-256 Checksum (Standard)
                </span>
                <button
                  onClick={() => copyChecksum(sha256, "sha256")}
                  className="neo-btn neo-btn-secondary text-[11px] py-1 px-2.5"
                >
                  {copiedKey === "sha256" ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  {copiedKey === "sha256" ? "Copied" : "Copy SHA-256"}
                </button>
              </div>
              <div className="p-3 neo-border rounded bg-surface font-mono text-xs break-all font-bold">
                {sha256}
              </div>
            </div>

            {/* SHA-512 */}
            <div className="neo-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase text-text-secondary">
                  SHA-512 Checksum
                </span>
                <button
                  onClick={() => copyChecksum(sha512, "sha512")}
                  className="neo-btn neo-btn-secondary text-[11px] py-1 px-2.5"
                >
                  {copiedKey === "sha512" ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  {copiedKey === "sha512" ? "Copied" : "Copy SHA-512"}
                </button>
              </div>
              <div className="p-3 neo-border rounded bg-surface font-mono text-xs break-all">
                {sha512}
              </div>
            </div>

            {/* SHA-1 */}
            <div className="neo-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase text-text-secondary">
                  SHA-1 Checksum (Legacy)
                </span>
                <button
                  onClick={() => copyChecksum(sha1, "sha1")}
                  className="neo-btn neo-btn-secondary text-[11px] py-1 px-2.5"
                >
                  {copiedKey === "sha1" ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  {copiedKey === "sha1" ? "Copied" : "Copy SHA-1"}
                </button>
              </div>
              <div className="p-3 neo-border rounded bg-surface font-mono text-xs break-all">
                {sha1}
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="neo-card p-4 bg-accent-light flex items-start gap-3">
            <ShieldCheck size={20} className="text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary leading-relaxed">
              <strong className="text-text font-heading uppercase tracking-wide">
                Local In-Browser Processing:
              </strong>{" "}
              Your file is processed entirely in your computer&apos;s memory using the native Web Crypto API. No bytes are uploaded to any server.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
