"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  RotateCcw,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  FileVideo,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  loadVideo,
  getBestVideoMimeType,
  formatVideoTime,
  formatBytes,
} from "@/lib/videoUtils";

type ScalingMode = "fit" | "fill" | "stretch";

export default function VideoResolutionConverterTool() {
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
  const [targetWidth, setTargetWidth] = useState<number>(1280);
  const [targetHeight, setTargetHeight] = useState<number>(720);
  const [scalingMode, setScalingMode] = useState<ScalingMode>("fit");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState(0);
  const [convertedExt, setConvertedExt] = useState("webm");

  useEffect(() => {
    return () => {
      if (videoInfo?.srcUrl) URL.revokeObjectURL(videoInfo.srcUrl);
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [videoInfo, convertedUrl]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setConvertedUrl(null);
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

      // Default to 720p or keep proportion
      const aspect = video.videoWidth / video.videoHeight;
      if (video.videoHeight > 720) {
        setTargetHeight(720);
        setTargetWidth(Math.round(720 * aspect));
      } else {
        setTargetHeight(video.videoHeight);
        setTargetWidth(video.videoWidth);
      }
    } catch {
      setError("Unable to load video. Please ensure the file is a valid video format.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setPreset = (w: number, h: number) => {
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const handleConvert = async () => {
    if (!file || !videoInfo) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const renderVideo = document.createElement("video");
      renderVideo.src = videoInfo.srcUrl;
      renderVideo.muted = false;
      renderVideo.playsInline = true;
      renderVideo.crossOrigin = "anonymous";

      await new Promise<void>((res) => {
        renderVideo.onloadeddata = () => res();
      });

      // Even dimensions required
      const outW = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
      const outH = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas context");

      const stream = canvas.captureStream(30);

      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(renderVideo);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
      } catch {
        // continue without audio if restricted
      }

      const { mimeType, extension } = getBestVideoMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const recordPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        recorder.onerror = (e) => reject(e);
      });

      recorder.start(100);
      renderVideo.currentTime = 0;
      await renderVideo.play();

      const render = () => {
        if (renderVideo.ended || renderVideo.paused) {
          if (recorder.state === "recording") recorder.stop();
          return;
        }

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, outW, outH);

        if (scalingMode === "stretch") {
          ctx.drawImage(renderVideo, 0, 0, outW, outH);
        } else if (scalingMode === "fill") {
          // Crop to fill
          const scale = Math.max(outW / renderVideo.videoWidth, outH / renderVideo.videoHeight);
          const w = renderVideo.videoWidth * scale;
          const h = renderVideo.videoHeight * scale;
          const x = (outW - w) / 2;
          const y = (outH - h) / 2;
          ctx.drawImage(renderVideo, x, y, w, h);
        } else {
          // Fit (Letterbox/Pillarbox)
          const scale = Math.min(outW / renderVideo.videoWidth, outH / renderVideo.videoHeight);
          const w = renderVideo.videoWidth * scale;
          const h = renderVideo.videoHeight * scale;
          const x = (outW - w) / 2;
          const y = (outH - h) / 2;
          ctx.drawImage(renderVideo, x, y, w, h);
        }

        setProgress(Math.min(99, Math.round((renderVideo.currentTime / videoInfo.duration) * 100)));

        requestAnimationFrame(render);
      };

      render();

      const blob = await recordPromise;
      setProgress(100);
      setConvertedSize(blob.size);
      setConvertedExt(extension);

      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to convert video resolution.";
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
          label="Drop a video to change resolution"
          description="Scale to 1080p, 720p, 480p, 360p or custom dimensions (Up to 150MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Reading video dimensions...
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
                  Current Resolution: {videoInfo.width}x{videoInfo.height}px •{" "}
                  {formatVideoTime(videoInfo.duration)} • {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setVideoInfo(null);
                setConvertedUrl(null);
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Choose Another
            </button>
          </div>

          {/* Quick Resolution Presets */}
          <div className="neo-card p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm uppercase text-text-secondary">
              Standard Resolution Presets
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "1080p Full HD", w: 1920, h: 1080 },
                { label: "720p HD", w: 1280, h: 720 },
                { label: "480p SD", w: 854, h: 480 },
                { label: "360p Mobile", w: 640, h: 360 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPreset(p.w, p.h)}
                  className={`p-3 neo-border rounded-lg text-left transition-colors ${
                    targetWidth === p.w && targetHeight === p.h
                      ? "bg-accent text-white"
                      : "bg-surface hover:bg-accent/5"
                  }`}
                >
                  <span className="font-heading font-bold text-xs uppercase block">
                    {p.label}
                  </span>
                  <span className="text-[11px] font-mono opacity-80">
                    {p.w} x {p.h}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Input & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
              <div>
                <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  step="2"
                  min="160"
                  max="3840"
                  value={targetWidth}
                  onChange={(e) => setTargetWidth(parseInt(e.target.value) || 640)}
                  className="neo-input text-sm font-mono"
                />
              </div>

              <div>
                <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  step="2"
                  min="120"
                  max="2160"
                  value={targetHeight}
                  onChange={(e) => setTargetHeight(parseInt(e.target.value) || 360)}
                  className="neo-input text-sm font-mono"
                />
              </div>

              <div>
                <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                  Scaling Fit Mode
                </label>
                <select
                  value={scalingMode}
                  onChange={(e) => setScalingMode(e.target.value as ScalingMode)}
                  className="neo-input text-xs font-semibold py-2"
                >
                  <option value="fit">Preserve Ratio (Letterbox)</option>
                  <option value="fill">Crop to Fill Frame</option>
                  <option value="stretch">Stretch to Fit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="space-y-3">
            <div className="text-center">
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
              >
                <Maximize2 size={16} />
                {isProcessing
                  ? `Scaling Video (${progress}%)...`
                  : `Convert to ${targetWidth}x${targetHeight}px`}
              </button>
            </div>

            {isProcessing && (
              <div className="neo-card p-4 space-y-2">
                <div className="flex justify-between text-xs font-heading font-bold uppercase">
                  <span>Re-rendering video frames at new resolution...</span>
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

          {/* Result Card */}
          {convertedUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Video Resized Successfully!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    New Dimensions: {targetWidth}x{targetHeight}px • Output Size: {formatBytes(convertedSize)}
                  </p>
                </div>
              </div>

              <video
                controls
                src={convertedUrl}
                className="w-full max-h-[340px] neo-border rounded bg-black mx-auto"
              />

              <a
                href={convertedUrl}
                download={`${file.name.replace(/\.[^/.]+$/, "")}_${targetWidth}x${targetHeight}.${convertedExt}`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Resized Video (.{convertedExt})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
