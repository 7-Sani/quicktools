"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  RotateCcw,
  Film,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Play,
  Pause,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  loadVideo,
  SimpleGifEncoder,
  formatVideoTime,
  formatBytes,
} from "@/lib/videoUtils";

export default function VideoToGifTool() {
  const [file, setFile] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    duration: number;
    width: number;
    height: number;
    srcUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GIF segment controls
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [gifWidth, setGifWidth] = useState<number>(400);
  const [fps, setFps] = useState<number>(10);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifSize, setGifSize] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoInfo?.srcUrl) URL.revokeObjectURL(videoInfo.srcUrl);
      if (gifUrl) URL.revokeObjectURL(gifUrl);
    };
  }, [videoInfo, gifUrl]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setGifUrl(null);
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

      setStartTime(0);
      // Default to 5 seconds max initial selection
      setEndTime(Math.min(5, video.duration));
    } catch {
      setError("Unable to load video. Please ensure the file is a valid video format.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGif = async () => {
    if (!file || !videoInfo) return;

    const segmentDuration = endTime - startTime;
    if (segmentDuration <= 0) {
      setError("End time must be after start time.");
      return;
    }
    if (segmentDuration > 15) {
      setError("For browser memory performance, please select a segment under 15 seconds.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const video = document.createElement("video");
      video.src = videoInfo.srcUrl;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      await new Promise<void>((res) => {
        video.onloadeddata = () => res();
      });

      // Calculate canvas dimensions
      const aspect = video.videoWidth / video.videoHeight;
      const targetW = gifWidth;
      const targetH = Math.round(targetW / aspect);

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Could not initialize canvas context");

      const delayMs = Math.round(1000 / fps);
      const encoder = new SimpleGifEncoder(targetW, targetH, delayMs);

      const totalFrames = Math.max(1, Math.round(segmentDuration * fps));
      const frameInterval = segmentDuration / totalFrames;

      for (let i = 0; i < totalFrames; i++) {
        const frameTime = startTime + i * frameInterval;
        video.currentTime = frameTime;

        await new Promise<void>((res) => {
          const onSeek = () => {
            video.removeEventListener("seeked", onSeek);
            res();
          };
          video.addEventListener("seeked", onSeek);
        });

        ctx.drawImage(video, 0, 0, targetW, targetH);
        const imgData = ctx.getImageData(0, 0, targetW, targetH);
        encoder.addFrame(imgData);

        setProgress(Math.round(((i + 1) / totalFrames) * 100));
      }

      const gifBlob = encoder.finish();
      setGifSize(gifBlob.size);

      if (gifUrl) URL.revokeObjectURL(gifUrl);
      const url = URL.createObjectURL(gifBlob);
      setGifUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate GIF.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "video/*": [".mp4", ".webm", ".mov"],
          }}
          label="Drop a video to convert to animated GIF"
          description="Supports MP4, WebM, MOV (Up to 150MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Loading video frames...
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
                  {formatBytes(file.size)} • {formatVideoTime(videoInfo.duration)} •{" "}
                  {videoInfo.width}x{videoInfo.height}px
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setVideoInfo(null);
                setGifUrl(null);
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Choose Another
            </button>
          </div>

          {/* Video Preview Player */}
          <div className="neo-card p-4">
            <video
              ref={videoRef}
              controls
              src={videoInfo.srcUrl}
              className="w-full max-h-[300px] neo-border rounded bg-black mx-auto"
            />
          </div>

          {/* GIF Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                Start Time (sec)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max={endTime}
                value={Number(startTime.toFixed(2))}
                onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value) || 0))}
                className="neo-input text-sm font-mono"
              />
              <span className="text-[11px] text-text-secondary block mt-1 font-mono">
                {formatVideoTime(startTime, true)}
              </span>
            </div>

            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                End Time (sec)
              </label>
              <input
                type="number"
                step="0.1"
                min={startTime}
                max={videoInfo.duration}
                value={Number(endTime.toFixed(2))}
                onChange={(e) =>
                  setEndTime(
                    Math.min(videoInfo.duration, parseFloat(e.target.value) || 0)
                  )
                }
                className="neo-input text-sm font-mono"
              />
              <span className="text-[11px] text-text-secondary block mt-1 font-mono">
                {formatVideoTime(endTime, true)}
              </span>
            </div>

            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                GIF Width
              </label>
              <select
                value={gifWidth}
                onChange={(e) => setGifWidth(parseInt(e.target.value))}
                className="neo-input text-xs font-semibold py-2"
              >
                <option value={320}>320 px (Small / Fast)</option>
                <option value={400}>400 px (Standard)</option>
                <option value={480}>480 px (Medium)</option>
                <option value={600}>600 px (Large / Crisp)</option>
              </select>
            </div>

            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                Frame Rate (FPS)
              </label>
              <select
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                className="neo-input text-xs font-semibold py-2"
              >
                <option value={5}>5 FPS (Compact)</option>
                <option value={10}>10 FPS (Recommended)</option>
                <option value={15}>15 FPS (Smooth Motion)</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <div className="space-y-3">
            <div className="text-center">
              <button
                onClick={handleCreateGif}
                disabled={isProcessing || endTime <= startTime}
                className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
              >
                <Film size={16} />
                {isProcessing
                  ? `Encoding GIF (${progress}%)...`
                  : `Convert ${(endTime - startTime).toFixed(1)}s to GIF`}
              </button>
            </div>

            {isProcessing && (
              <div className="neo-card p-4 space-y-2">
                <div className="flex justify-between text-xs font-heading font-bold uppercase">
                  <span>Sampling frames & generating LZW palette...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-border/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* GIF Result */}
          {gifUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Animated GIF Created Successfully!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Size: {formatBytes(gifSize)} • {gifWidth}px width • {fps} FPS
                  </p>
                </div>
              </div>

              {/* Native animated GIF preview */}
              <div className="text-center">
                <img
                  src={gifUrl}
                  alt="Converted Animated GIF"
                  className="mx-auto max-h-[360px] neo-border rounded bg-white"
                />
              </div>

              <a
                href={gifUrl}
                download={`${file.name.replace(/\.[^/.]+$/, "")}.gif`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Animated GIF (.gif)
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
