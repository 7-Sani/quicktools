"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Copy,
  Check,
  Download,
  FileVideo,
  AlertCircle,
  Clock,
  Maximize2,
  Tv,
  Volume2,
  VolumeX,
  Gauge,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  getVideoMetadata,
  VideoInfo,
  captureFrameAt,
  formatVideoTime,
  formatBytes,
} from "@/lib/videoUtils";

export default function VideoMetadataViewerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setPosterUrl(null);
    setIsLoading(true);
    setFile(selected);

    try {
      const meta = await getVideoMetadata(selected);
      setInfo(meta);

      // Capture poster snapshot
      const video = document.createElement("video");
      video.src = URL.createObjectURL(selected);
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((res) => {
        video.onloadeddata = () => res();
      });

      const frameTime = Math.min(1.0, meta.duration / 2);
      const frame = await captureFrameAt(video, frameTime, "image/jpeg", 0.9);
      setPosterUrl(frame.dataUrl);

      URL.revokeObjectURL(video.src);
    } catch {
      setError("Failed to extract metadata from this video file.");
      setInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAsJson = () => {
    if (!info) return;
    const jsonStr = JSON.stringify(
      {
        fileName: info.name,
        fileSizeBytes: info.size,
        fileSizeFormatted: formatBytes(info.size),
        durationSeconds: info.duration,
        durationFormatted: formatVideoTime(info.duration, true),
        width: info.width,
        height: info.height,
        aspectRatio: info.aspectRatio,
        mimeType: info.mimeType,
        hasAudio: info.hasAudio,
        bitrateKbps: info.bitrateKbps,
      },
      null,
      2
    );

    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "video/*": [".mp4", ".webm", ".mov", ".mkv"],
          }}
          label="Drop a video to inspect metadata"
          description="Analyzes resolution, duration, aspect ratio, bitrate & extracts poster frame (Up to 500MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Analyzing video container streams...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {info && file && (
        <div className="space-y-6">
          {/* Header */}
          <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center neo-border rounded-lg bg-accent/10 text-accent shrink-0">
                <FileVideo size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-sm truncate uppercase">
                  {info.name}
                </p>
                <p className="text-xs text-text-secondary">
                  MIME: {info.mimeType} • Size: {formatBytes(info.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAsJson}
                className="neo-btn neo-btn-secondary text-xs"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? "Copied JSON" : "Copy JSON"}
              </button>

              <button
                onClick={() => {
                  setFile(null);
                  setInfo(null);
                }}
                className="neo-btn neo-btn-secondary text-xs"
              >
                <RotateCcw size={14} />
                Inspect Another
              </button>
            </div>
          </div>

          {/* Poster & Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Poster Thumbnail */}
            <div className="neo-card p-6 flex flex-col items-center justify-center text-center">
              {posterUrl ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="relative border-2 border-border rounded-lg overflow-hidden shadow-md max-w-full">
                    <img
                      src={posterUrl}
                      alt="Video Poster Frame"
                      className="w-full h-auto object-contain max-h-52 bg-black"
                    />
                  </div>
                  <span className="text-xs text-text-secondary font-heading font-semibold uppercase">
                    Captured Poster Snapshot
                  </span>
                  <a
                    href={posterUrl}
                    download={`${file.name.replace(/\.[^/.]+$/, "")}_poster.jpg`}
                    className="neo-btn neo-btn-secondary text-[11px] py-1 px-3 w-full"
                  >
                    <Download size={12} />
                    Download Poster Frame
                  </a>
                </div>
              ) : (
                <div className="py-8 space-y-2 text-text-secondary">
                  <ImageIcon size={48} className="mx-auto opacity-30" />
                  <p className="font-heading font-semibold text-xs uppercase">
                    Loading Poster Frame...
                  </p>
                </div>
              )}
            </div>

            {/* Properties Grid */}
            <div className="md:col-span-2 neo-card p-6 space-y-4">
              <h3 className="font-heading font-bold text-base uppercase border-b border-border pb-2">
                Technical Video Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Maximize2 size={12} /> Dimensions (Resolution)
                  </span>
                  <p className="font-bold text-sm font-mono">
                    {info.width} x {info.height} px
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Tv size={12} /> Aspect Ratio
                  </span>
                  <p className="font-bold text-sm font-mono">{info.aspectRatio}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Clock size={12} /> Runtime Duration
                  </span>
                  <p className="font-bold text-sm font-mono">
                    {formatVideoTime(info.duration, true)} ({info.duration.toFixed(2)}s)
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Gauge size={12} /> Estimated Bitrate
                  </span>
                  <p className="font-bold text-sm font-mono">
                    {info.bitrateKbps.toLocaleString()} kbps (~{(info.bitrateKbps / 1000).toFixed(2)} Mbps)
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    {info.hasAudio ? <Volume2 size={12} /> : <VolumeX size={12} />}{" "}
                    Audio Track
                  </span>
                  <p className="font-bold text-sm">
                    {info.hasAudio ? "Detected (Embedded Audio)" : "Silent / No Audio Detected"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Layers size={12} /> Container Format
                  </span>
                  <p className="font-bold text-sm font-mono">
                    {file.name.split(".").pop()?.toUpperCase()} ({info.mimeType})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
