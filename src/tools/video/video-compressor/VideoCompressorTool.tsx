"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  RotateCcw,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Play,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  loadVideo,
  getBestVideoMimeType,
  formatVideoTime,
  formatBytes,
} from "@/lib/videoUtils";

export default function VideoCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    duration: number;
    width: number;
    height: number;
    srcUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [targetResolution, setTargetResolution] = useState<"original" | "1080p" | "720p" | "480p" | "360p">("720p");
  const [targetBitrate, setTargetBitrate] = useState<number>(1000000); // 1 Mbps

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedExt, setCompressedExt] = useState("webm");

  const stopRequestedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (videoInfo?.srcUrl) URL.revokeObjectURL(videoInfo.srcUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [videoInfo, compressedUrl]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setCompressedUrl(null);
    setIsLoading(true);
    setFile(selected);

    try {
      const video = await loadVideo(selected);
      const url = video.src;
      setVideoInfo({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        srcUrl: url,
      });

      // Default bitrate depending on resolution
      if (video.videoHeight <= 480) {
        setTargetBitrate(600000);
      } else if (video.videoHeight <= 720) {
        setTargetBitrate(1000000);
      } else {
        setTargetBitrate(1500000);
      }
    } catch {
      setError("Unable to load video. Please ensure the file is a valid browser-supported video.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompress = async () => {
    if (!file || !videoInfo) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    stopRequestedRef.current = false;

    try {
      const video = document.createElement("video");
      video.src = videoInfo.srcUrl;
      video.muted = false;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      await new Promise<void>((res, rej) => {
        video.onloadeddata = () => res();
        video.onerror = () => rej(new Error("Video playback error"));
      });

      // Compute target dimensions
      let outWidth = video.videoWidth;
      let outHeight = video.videoHeight;
      const aspect = outWidth / outHeight;

      if (targetResolution === "1080p" && outHeight > 1080) {
        outHeight = 1080;
        outWidth = Math.round(outHeight * aspect);
      } else if (targetResolution === "720p" && outHeight > 720) {
        outHeight = 720;
        outWidth = Math.round(outHeight * aspect);
      } else if (targetResolution === "480p" && outHeight > 480) {
        outHeight = 480;
        outWidth = Math.round(outHeight * aspect);
      } else if (targetResolution === "360p" && outHeight > 360) {
        outHeight = 360;
        outWidth = Math.round(outHeight * aspect);
      }

      // Ensure dimensions are even (required by some encoders)
      outWidth = outWidth % 2 === 0 ? outWidth : outWidth - 1;
      outHeight = outHeight % 2 === 0 ? outHeight : outHeight - 1;

      const canvas = document.createElement("canvas");
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas context");

      // Setup audio and stream capture
      const stream = canvas.captureStream(30);

      // Try capturing audio from video
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
      } catch {
        // Continue without separate audio stream if cross-origin or already captured
      }

      const { mimeType, extension } = getBestVideoMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: targetBitrate,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const recordPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };
        recorder.onerror = (e) => reject(e);
      });

      recorder.start(100);
      video.currentTime = 0;
      await video.play();

      // Render loop
      const render = () => {
        if (stopRequestedRef.current || video.ended || video.paused) {
          if (recorder.state === "recording") recorder.stop();
          return;
        }

        ctx.drawImage(video, 0, 0, outWidth, outHeight);
        const currentProg = Math.min(99, Math.round((video.currentTime / videoInfo.duration) * 100));
        setProgress(currentProg);

        requestAnimationFrame(render);
      };

      render();

      const blob = await recordPromise;
      video.pause();

      setProgress(100);
      setCompressedSize(blob.size);
      setCompressedExt(extension);

      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Compression failed.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const estimatedSize = videoInfo
    ? Math.round((targetBitrate / 8) * videoInfo.duration)
    : 0;

  const reductionPercent =
    file && compressedSize > 0
      ? Math.round(((file.size - compressedSize) / file.size) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "video/*": [".mp4", ".webm", ".mov", ".mkv"],
          }}
          label="Drop a video file to compress"
          description="Supports MP4, WebM, MOV (Up to 200MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Inspecting video stream...
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
                  Original: {formatBytes(file.size)} • {formatVideoTime(videoInfo.duration)} •{" "}
                  {videoInfo.width}x{videoInfo.height}px
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setVideoInfo(null);
                setCompressedUrl(null);
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Choose Another
            </button>
          </div>

          {/* Original Preview Player */}
          <div className="neo-card p-4">
            <video
              controls
              src={videoInfo.srcUrl}
              className="w-full max-h-[340px] neo-border rounded bg-black mx-auto"
            />
          </div>

          {/* Compression Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-2">
                Target Resolution
              </label>
              <select
                value={targetResolution}
                onChange={(e) => setTargetResolution(e.target.value as typeof targetResolution)}
                className="neo-input text-xs font-semibold py-2"
              >
                <option value="original">Original ({videoInfo.height}p)</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="720p">720p (HD - Recommended)</option>
                <option value="480p">480p (Standard Definition)</option>
                <option value="360p">360p (Smallest File)</option>
              </select>
            </div>

            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-2">
                Target Bitrate
              </label>
              <select
                value={targetBitrate}
                onChange={(e) => setTargetBitrate(parseInt(e.target.value))}
                className="neo-input text-xs font-semibold py-2"
              >
                <option value={500000}>500 kbps (Maximum Compression)</option>
                <option value={1000000}>1.0 Mbps (Balanced Quality)</option>
                <option value={1500000}>1.5 Mbps (Clear / Sharp)</option>
                <option value={2500000}>2.5 Mbps (High Bitrate)</option>
              </select>
            </div>

            <div className="neo-card p-4 flex flex-col justify-center">
              <span className="text-xs uppercase font-heading font-semibold text-text-secondary">
                Estimated Output Size
              </span>
              <span className="text-2xl font-bold font-mono text-accent">
                ~{formatBytes(estimatedSize)}
              </span>
              <span className="text-[11px] text-text-secondary">
                {(file.size > estimatedSize) ? `${Math.round(((file.size - estimatedSize) / file.size) * 100)}% estimated reduction` : "Similar or larger"}
              </span>
            </div>
          </div>

          {/* Action Button & Progress */}
          <div className="space-y-3">
            <div className="text-center">
              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
              >
                <Minimize2 size={16} />
                {isProcessing ? `Compressing (${progress}%)...` : "Compress Video Now"}
              </button>
            </div>

            {isProcessing && (
              <div className="neo-card p-4 space-y-2">
                <div className="flex justify-between text-xs font-heading font-bold uppercase">
                  <span>Re-encoding video stream...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-border/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-text-secondary text-center">
                  Video is played through the hardware-accelerated canvas encoder in real-time.
                </p>
              </div>
            )}
          </div>

          {/* Compressed Result */}
          {compressedUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Video Compressed Successfully!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Original: {formatBytes(file.size)} → Compressed: {formatBytes(compressedSize)} (
                    {reductionPercent > 0 ? `${reductionPercent}% smaller` : "Optimized"})
                  </p>
                </div>
              </div>

              <video
                controls
                src={compressedUrl}
                className="w-full max-h-[340px] neo-border rounded bg-black mx-auto"
              />

              <a
                href={compressedUrl}
                download={`${file.name.replace(/\.[^/.]+$/, "")}_compressed.${compressedExt}`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Compressed Video (.{compressedExt})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
