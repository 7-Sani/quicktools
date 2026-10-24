"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import {
  Archive,
  Upload,
  Download,
  File,
  Folder,
  FileText,
  FileCode,
  Image as ImageIcon,
  ShieldCheck,
  AlertTriangle,
  Search,
  Eye,
  Trash2,
  Sparkles,
  CheckCircle2,
  HardDrive,
} from "lucide-react";

interface ZipEntryInfo {
  name: string;
  cleanPath: string;
  dir: boolean;
  size: number;
  date: Date;
  isUnsafe: boolean;
  zipObject: JSZip.JSZipObject;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Sanitize and detect path traversal (Zip Slip vulnerability prevention)
function sanitizeZipEntryPath(rawPath: string): { cleanPath: string; isUnsafe: boolean } {
  // Normalize backslashes to forward slashes
  const normalized = rawPath.replace(/\\/g, "/");

  // Check for dangerous traversal sequences
  const segments = normalized.split("/");
  const hasDotDot = segments.includes("..") || segments.includes(".");
  const isAbsolute = normalized.startsWith("/") || /^[a-zA-Z]:/.test(normalized);

  // Clean path removes traversal elements safely
  const cleanSegments = segments.filter((s) => s !== ".." && s !== "." && s.trim() !== "");
  const cleanPath = cleanSegments.join("/");

  const isUnsafe = hasDotDot || isAbsolute;
  return { cleanPath: cleanPath || "extracted_file", isUnsafe };
}

export default function ZipFileExtractorTool() {
  const [zipName, setZipName] = useState<string | null>(null);
  const [entries, setEntries] = useState<ZipEntryInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unsafeCount, setUnsafeCount] = useState(0);

  // Preview modal / sheet state
  const [previewContent, setPreviewContent] = useState<{
    name: string;
    type: "text" | "image" | "binary";
    data: string;
  } | null>(null);

  const processZipData = async (data: ArrayBuffer | Blob, fileName: string) => {
    setLoading(true);
    setErrorMessage(null);
    setUnsafeCount(0);
    setPreviewContent(null);

    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(data);

      const items: ZipEntryInfo[] = [];
      let unsafeDetected = 0;

      const keys = Object.keys(loadedZip.files);
      for (const key of keys) {
        const obj = loadedZip.files[key];
        const { cleanPath, isUnsafe } = sanitizeZipEntryPath(obj.name);

        if (isUnsafe) {
          unsafeDetected++;
        }

        // JSZip stores compressed/uncompressed size in _data or metadata
        // For accurate size we can read length
        const size = (obj as any)._data?.uncompressedSize || 0;

        items.push({
          name: obj.name,
          cleanPath,
          dir: obj.dir,
          size,
          date: obj.date,
          isUnsafe,
          zipObject: obj,
        });
      }

      setZipName(fileName);
      setEntries(items);
      setUnsafeCount(unsafeDetected);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse ZIP archive. Ensure it is a valid, uncorrupted ZIP file.");
      setEntries([]);
      setZipName(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processZipData(file, file.name);
    e.target.value = "";
  };

  // Generate an in-memory sample ZIP so user can test right away
  const handleLoadSampleZip = async () => {
    const zip = new JSZip();
    zip.file("README.md", "# QuickTools Sample Archive\n\nThis archive was generated locally in your browser memory!");
    zip.file(
      "config/settings.json",
      JSON.stringify({ app: "QuickTools", version: "1.0", localOnly: true }, null, 2)
    );
    zip.file(
      "notes/todo.txt",
      "1. Verify ZIP extraction\n2. Prevent Zip-Slip traversal\n3. Enjoy fast client-side tools!"
    );
    const content = await zip.generateAsync({ type: "blob" });
    processZipData(content, "sample-project.zip");
  };

  // Extract / Download single entry safely
  const handleDownloadEntry = async (entry: ZipEntryInfo) => {
    if (entry.dir) return;
    try {
      const blob = await entry.zipObject.async("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Use clean sanitized name to prevent path traversal
      const downloadFilename = entry.cleanPath.split("/").pop() || "extracted_file";
      a.download = downloadFilename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Error extracting file: " + err.message);
    }
  };

  // Preview file content
  const handlePreviewEntry = async (entry: ZipEntryInfo) => {
    if (entry.dir) return;

    const lower = entry.name.toLowerCase();
    const isImage = lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".webp") || lower.endsWith(".svg");
    const isText =
      lower.endsWith(".txt") ||
      lower.endsWith(".md") ||
      lower.endsWith(".json") ||
      lower.endsWith(".csv") ||
      lower.endsWith(".js") ||
      lower.endsWith(".ts") ||
      lower.endsWith(".tsx") ||
      lower.endsWith(".html") ||
      lower.endsWith(".css") ||
      lower.endsWith(".xml") ||
      lower.endsWith(".yaml") ||
      lower.endsWith(".yml");

    if (isImage) {
      const base64 = await entry.zipObject.async("base64");
      const ext = lower.split(".").pop();
      const mime = ext === "svg" ? "image/svg+xml" : `image/${ext}`;
      setPreviewContent({
        name: entry.name,
        type: "image",
        data: `data:${mime};base64,${base64}`,
      });
    } else if (isText || entry.size < 50000) {
      const text = await entry.zipObject.async("text");
      setPreviewContent({
        name: entry.name,
        type: "text",
        data: text,
      });
    } else {
      setPreviewContent({
        name: entry.name,
        type: "binary",
        data: "Binary file preview not supported. Use Download to inspect locally.",
      });
    }
  };

  // Filtered entries
  const filteredEntries = entries.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFiles = entries.filter((e) => !e.dir).length;
  const totalDirs = entries.filter((e) => e.dir).length;
  const totalUncompressedSize = entries.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0284C7] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              ZIP File Extractor
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Inspect, preview, and safely extract ZIP files client-side with Zip Slip traversal protection
            </p>
          </div>
        </div>

        {/* Preset Samples & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadSampleZip}
            className="px-3 py-1.5 text-xs font-black uppercase bg-[#BBF7D0] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample ZIP
          </button>
          {entries.length > 0 && (
            <button
              onClick={() => {
                setEntries([]);
                setZipName(null);
                setPreviewContent(null);
              }}
              className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Security Shield Banner */}
      <div className="bg-[#FAF8F5] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-700" />
          <div className="text-xs font-bold text-gray-800">
            <strong className="text-black uppercase">Zip Slip Hardened:</strong> Dangerous relative paths (`../`) and absolute paths are automatically sanitized before extraction.
          </div>
        </div>
        <div className="text-xs font-black uppercase bg-[#BBF7D0] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          100% In-Browser Memory
        </div>
      </div>

      {/* Error Callout */}
      {errorMessage && (
        <div className="bg-[#FEE2E2] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase">Extraction Error</h3>
            <p className="text-xs font-mono font-bold text-red-800 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Unsafe Path Warning */}
      {unsafeCount > 0 && (
        <div className="bg-[#FEF08A] border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-amber-900 uppercase">Security Traversal Notice</h3>
            <p className="text-xs font-bold text-black mt-1">
              Detected {unsafeCount} entries with potentially dangerous path traversal sequences (`..` or root paths). Paths have been sanitized to safe relative names.
            </p>
          </div>
        </div>
      )}

      {/* Upload Zone if no file loaded */}
      {entries.length === 0 && (
        <div className="bg-[#FAF8F5] border-3 border-dashed border-black p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#0284C7] text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            <Archive className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase text-black">Select or Drop a ZIP Archive</h3>
            <p className="text-xs font-bold text-gray-600 mt-1">
              Files are processed client-side without leaving your browser
            </p>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FEF08A] hover:bg-[#FDE047] text-black font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
              <Upload className="w-4 h-4" />
              Choose ZIP File
              <input
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Archive Explorer View */}
      {entries.length > 0 && (
        <div className="space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Archive Name</div>
              <div className="text-sm font-black text-black truncate" title={zipName || ""}>
                {zipName}
              </div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Total Files</div>
              <div className="text-xl font-black text-black">{totalFiles}</div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Directories</div>
              <div className="text-xl font-black text-black">{totalDirs}</div>
            </div>
            <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[11px] font-black uppercase text-gray-600">Total Uncompressed</div>
              <div className="text-xl font-black text-black">{formatBytes(totalUncompressedSize)}</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-[#FAF8F5] border-3 border-black p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter entries by filename..."
                className="w-full pl-9 pr-3 py-1.5 text-xs font-bold bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              />
            </div>
            <label className="px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Open Another ZIP
              <input
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Entries Table */}
          <div className="bg-[#FAF8F5] border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="max-h-[460px] overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#E2E8F0] border-b-2 border-black z-10 font-black uppercase">
                  <tr>
                    <th className="p-3 border-r border-black">File / Path</th>
                    <th className="p-3 border-r border-black w-28">Size</th>
                    <th className="p-3 border-r border-black w-36">Date</th>
                    <th className="p-3 w-40 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-yellow-50 transition-colors"
                    >
                      <td className="p-3 border-r border-black font-mono flex items-center gap-2">
                        {entry.dir ? (
                          <Folder className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        ) : entry.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) ? (
                          <ImageIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        ) : entry.name.match(/\.(json|js|ts|tsx|html|css|xml|yaml|yml)$/i) ? (
                          <FileCode className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[420px]" title={entry.name}>
                          {entry.name}
                        </span>
                        {entry.isUnsafe && (
                          <span className="text-[10px] font-black bg-red-100 text-red-700 px-1.5 py-0.5 border border-red-400">
                            Sanitized
                          </span>
                        )}
                      </td>
                      <td className="p-3 border-r border-black font-mono">
                        {entry.dir ? "-" : formatBytes(entry.size)}
                      </td>
                      <td className="p-3 border-r border-black font-mono text-gray-600 text-[11px]">
                        {entry.date ? entry.date.toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 text-center">
                        {!entry.dir && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handlePreviewEntry(entry)}
                              title="Preview File"
                              className="p-1.5 bg-white border border-black hover:bg-gray-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDownloadEntry(entry)}
                              title="Download File"
                              className="p-1.5 bg-[#BBF7D0] border border-black hover:bg-[#86EFAC] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <Download className="w-3.5 h-3.5 text-black" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* In-browser preview modal / container */}
          {previewContent && (
            <div className="bg-[#FAF8F5] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#0284C7]" />
                  <span className="text-xs font-black uppercase text-black">
                    Preview: {previewContent.name}
                  </span>
                </div>
                <button
                  onClick={() => setPreviewContent(null)}
                  className="px-2 py-0.5 text-xs font-black uppercase bg-white border border-black hover:bg-gray-100"
                >
                  Close Preview
                </button>
              </div>

              {previewContent.type === "image" ? (
                <div className="flex items-center justify-center p-4 bg-gray-100 border border-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewContent.data}
                    alt={previewContent.name}
                    className="max-h-[350px] object-contain border border-black shadow"
                  />
                </div>
              ) : (
                <textarea
                  readOnly
                  value={previewContent.data}
                  rows={12}
                  className="w-full font-mono text-xs p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
