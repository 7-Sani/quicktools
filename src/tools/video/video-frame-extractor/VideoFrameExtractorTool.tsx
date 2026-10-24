"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  RotateCcw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Archive,
  Camera,
  Play,
  Pause,
} from "lucide-react";
import JSZip from "jszip";
import { FileUploader } from "@/components/FileUploader";
import {
  loadVideo,
  captureFrameAt,
  formatVideoTime,
  formatBytes,
} from "@/lib/videoUtils";

interface ExtractedFrame {
  id: string;
  timestamp: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

export default function VideoFrameExtractorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    duration: number;
    width: number;
    height: number;
    srcUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Playback
  const [currentTime, setCurrentTime] = useState(0);

  // Extraction settings
  const [extractMode, setExtractMode] = useState<"current" | "interval" | "count">("current");
  const [intervalSec, setIntervalSec] = useState<number>(2);
  const [frameCount, setFrameCount] = useState<number>(10);
  const [imageFormat, setImageFormat] = useState<"image/png" | "image/jpeg">("image/png");

  // Results
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isZipping, setIsZipping] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoInfo?.srcUrl) URL.revokeObjectURL(videoInfo.srcUrl);
    };
  }, [videoInfo]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setFrames([]);
    setIsLoading(true);
    setFile(selected);

    try {
      const video = await loadVideo(selected);
      setVideoInfo({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        srcUrl: video.src,
      });
      setCurrentTime(0);
    } catch {
      setError("Unable to load video. Codec or format may not be supported by this browser.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const captureSingleFrame = async () => {
    if (!videoRef.current || !videoInfo) return;
    setIsExtracting(true);
    setError(null);

    try {
      const frame = await captureFrameAt(
        videoRef.current,
        currentTime,
        imageFormat,
        0.95
      );

      const newFrame: ExtractedFrame = {
        id: `frame-${Date.now()}-${Math.random()}`,
        timestamp: currentTime,
        dataUrl: frame.dataUrl,
        blob: frame.blob,
        width: frame.width,
        height: frame.height,
      };

      setFrames((prev) => [newFrame, ...prev]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to capture frame.";
      setError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const batchExtract = async () => {
    if (!file || !videoInfo) return;

    setIsExtracting(true);
    setProgress(0);
    setError(null);

    try {
      const video = document.createElement("video");
      video.src = videoInfo.srcUrl;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((res) => {
        video.onloadeddata = () => res();
      });

      const timestamps: number[] = [];
      if (extractMode === "interval") {
        for (let t = 0; t < videoInfo.duration; t += intervalSec) {
          timestamps.push(t);
        }
      } else {
        const step = videoInfo.duration / Math.max(1, frameCount);
        for (let i = 0; i < frameCount; i++) {
          timestamps.push(i * step);
        }
      }

      // Limit to max 60 frames for browser DOM and memory safety
      const capped = timestamps.slice(0, 60);
      const extracted: ExtractedFrame[] = [];

      for (let i = 0; i < capped.length; i++) {
        const t = capped[i];
        const res = await captureFrameAt(video, t, imageFormat, 0.92);
        extracted.push({
          id: `frame-${i}-${Date.now()}`,
          timestamp: t,
          dataUrl: res.dataUrl,
          blob: res.blob,
          width: res.width,
          height: res.height,
        });
        setProgress(Math.round(((i + 1) / capped.length) * 100));
      }

      URL.revokeObjectURL(video.src);
      setFrames(extracted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Batch extraction failed.";
      setError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadAllAsZip = async () => {
    if (frames.length === 0 || !file) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const ext = imageFormat === "image/png" ? "png" : "jpg";
      const baseName = file.name.replace(/\.[^/.]+$/, "");

      frames.forEach((f, idx) => {
        const paddedIdx = String(idx + 1).padStart(3, "0");
        const timeStr = f.timestamp.toFixed(1).replace(".", "_");
        zip.file(`${baseName}_frame_${paddedIdx}_${timeStr}s.${ext}`, f.blob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}_frames.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to create ZIP archive.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "video/*": [".mp4", ".webm", ".mov", ".mkv"],
          }}
          label="Drop a video to extract high-res frames"
          description="Capture single snapshots or bulk image sequences as PNG/JPEG (Up to 300MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Loading video stream...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {videoInfo && file && (
        <div className="space-y-6">
          {/* File summary */}
          <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center neo-border rounded-lg bg-accent/10 text-accent shrink-0">
                <FileVideo size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-sm truncate uppercase">
                  {file.name}
                </p>
                <p className="text-xs text-text-secondary">
                  Native Resolution: {videoInfo.width}x{videoInfo.height}px •{" "}
                  {formatVideoTime(videoInfo.duration)} • {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setVideoInfo(null);
                setFrames([]);
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Choose Another
            </button>
          </div>

          {/* Interactive Player with Scrubber */}
          <div className="neo-card p-4 space-y-2">
            <video
              ref={videoRef}
              controls
              src={videoInfo.srcUrl}
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
              }}
              className="w-full max-h-[340px] neo-border rounded bg-black mx-auto"
            />
            <div className="flex items-center justify-between text-xs text-text-secondary font-mono pt-1">
              <span>Current Time: {formatVideoTime(currentTime, true)}</span>
              <span>Total: {formatVideoTime(videoInfo.duration, true)}</span>
            </div>
          </div>

          {/* Extraction Mode Controls */}
          <div className="neo-card p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-1 neo-card">
              <button
                onClick={() => setExtractMode("current")}
                className={`py-2 px-3 text-xs font-heading font-semibold uppercase rounded transition-colors ${
                  extractMode === "current"
                    ? "bg-accent text-white neo-shadow-sm"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                Snapshot Current Frame
              </button>
              <button
                onClick={() => setExtractMode("interval")}
                className={`py-2 px-3 text-xs font-heading font-semibold uppercase rounded transition-colors ${
                  extractMode === "interval"
                    ? "bg-accent text-white neo-shadow-sm"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                Extract Every X Seconds
              </button>
              <button
                onClick={() => setExtractMode("count")}
                className={`py-2 px-3 text-xs font-heading font-semibold uppercase rounded transition-colors ${
                  extractMode === "count"
                    ? "bg-accent text-white neo-shadow-sm"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                Extract N Evenly Spaced
              </button>
            </div>

            {/* Mode Specific Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {extractMode === "interval" && (
                <div>
                  <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                    Capture Interval (seconds)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    max="60"
                    value={intervalSec}
                    onChange={(e) => setIntervalSec(Math.max(0.5, parseFloat(e.target.value) || 1))}
                    className="neo-input text-sm font-mono"
                  />
                  <span className="text-[11px] text-text-secondary block mt-1">
                    Will extract ~{Math.min(60, Math.floor(videoInfo.duration / intervalSec))} frames
                  </span>
                </div>
              )}

              {extractMode === "count" && (
                <div>
                  <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                    Total Frames Count
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={frameCount}
                    onChange={(e) => setFrameCount(Math.min(60, Math.max(2, parseInt(e.target.value) || 5)))}
                    className="neo-input text-sm font-mono"
                  />
                  <span className="text-[11px] text-text-secondary block mt-1">
                    Evenly distributes {frameCount} frames across {formatVideoTime(videoInfo.duration)}
                  </span>
                </div>
              )}

              <div>
                <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                  Image Output Format
                </label>
                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value as typeof imageFormat)}
                  className="neo-input text-xs font-semibold py-2"
                >
                  <option value="image/png">PNG (Lossless Quality)</option>
                  <option value="image/jpeg">JPEG (Compact File Size)</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="text-center pt-2">
              {extractMode === "current" ? (
                <button
                  onClick={captureSingleFrame}
                  disabled={isExtracting}
                  className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
                >
                  <Camera size={16} />
                  Capture Frame at {formatVideoTime(currentTime, true)}
                </button>
              ) : (
                <button
                  onClick={batchExtract}
                  disabled={isExtracting}
                  className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
                >
                  <ImageIcon size={16} />
                  {isExtracting ? `Extracting Frames (${progress}%)...` : "Extract Frames Sequence"}
                </button>
              )}
            </div>

            {isExtracting && (
              <div className="w-full bg-border/20 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-accent h-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Extracted Frames Gallery */}
          {frames.length > 0 && (
            <div className="neo-card p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-border pb-3">
                <span className="font-heading font-bold text-base uppercase">
                  Captured Frames ({frames.length} Images)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadAllAsZip}
                    disabled={isZipping}
                    className="neo-btn neo-btn-primary text-xs"
                  >
                    <Archive size={14} />
                    {isZipping ? "Creating ZIP..." : "Download All (ZIP)"}
                  </button>

                  <button
                    onClick={() => setFrames([])}
                    className="neo-btn neo-btn-secondary text-xs"
                  >
                    Clear Frames
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {frames.map((frame, idx) => (
                  <div
                    key={frame.id}
                    className="neo-card p-2 space-y-2 group neo-hover overflow-hidden"
                  >
                    <div className="relative aspect-video border-2 border-border rounded overflow-hidden bg-black">
                      <img
                        src={frame.dataUrl}
                        alt={`Frame at ${frame.timestamp.toFixed(2)}s`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {formatVideoTime(frame.timestamp, true)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
                      <span>#{idx + 1}</span>
                      <span>{frame.width}x{frame.height}</span>
                    </div>

                    <a
                      href={frame.dataUrl}
                      download={`frame_${frame.timestamp.toFixed(1)}s.${imageFormat === "image/png" ? "png" : "jpg"}`}
                      className="neo-btn neo-btn-secondary text-[11px] w-full py-1"
                    >
                      <Download size={12} />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
