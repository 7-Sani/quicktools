"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  RotateCcw,
  FastForward,
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

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export default function VideoSpeedChangerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    duration: number;
    width: number;
    height: number;
    srcUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Speed state
  const [speed, setSpeed] = useState<number>(1.5);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportSize, setExportSize] = useState(0);
  const [exportExt, setExportExt] = useState("webm");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoInfo?.srcUrl) URL.revokeObjectURL(videoInfo.srcUrl);
      if (exportUrl) URL.revokeObjectURL(exportUrl);
    };
  }, [videoInfo, exportUrl]);

  // Update preview video element's playbackRate in real time
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setExportUrl(null);
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
    } catch {
      setError("Unable to load video. Codec or format may not be supported by this browser.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!file || !videoInfo) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const renderVideo = document.createElement("video");
      renderVideo.src = videoInfo.srcUrl;
      renderVideo.muted = false;
      renderVideo.playbackRate = speed;
      renderVideo.playsInline = true;
      renderVideo.crossOrigin = "anonymous";

      await new Promise<void>((res) => {
        renderVideo.onloadeddata = () => res();
      });

      const width = renderVideo.videoWidth % 2 === 0 ? renderVideo.videoWidth : renderVideo.videoWidth - 1;
      const height = renderVideo.videoHeight % 2 === 0 ? renderVideo.videoHeight : renderVideo.videoHeight - 1;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
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
        // continue without audio stream if restricted
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

        ctx.drawImage(renderVideo, 0, 0, width, height);
        setProgress(Math.min(99, Math.round((renderVideo.currentTime / videoInfo.duration) * 100)));

        requestAnimationFrame(render);
      };

      render();

      const blob = await recordPromise;
      setProgress(100);
      setExportSize(blob.size);
      setExportExt(extension);

      if (exportUrl) URL.revokeObjectURL(exportUrl);
      const url = URL.createObjectURL(blob);
      setExportUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change video speed.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const estimatedNewDuration = videoInfo ? videoInfo.duration / speed : 0;

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "video/*": [".mp4", ".webm", ".mov"],
          }}
          label="Drop a video to change speed"
          description="Supports slow-motion and timelapse speedup (Up to 150MB)"
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
                  {formatBytes(file.size)} • {formatVideoTime(videoInfo.duration)} •{" "}
                  {videoInfo.width}x{videoInfo.height}px
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setVideoInfo(null);
                setExportUrl(null);
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Choose Another
            </button>
          </div>

          {/* Interactive Player with Live Speed Control */}
          <div className="neo-card p-4 space-y-2">
            <span className="font-heading font-bold text-xs uppercase text-text-secondary block">
              Live Preview Player ({speed}x Speed)
            </span>
            <video
              ref={videoRef}
              controls
              src={videoInfo.srcUrl}
              className="w-full max-h-[320px] neo-border rounded bg-black mx-auto"
            />
          </div>

          {/* Speed settings card */}
          <div className="neo-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base uppercase">
                  Speed Multiplier: {speed.toFixed(2)}x
                </h3>
                <p className="text-xs text-text-secondary">
                  New estimated runtime: {formatVideoTime(estimatedNewDuration)}
                </p>
              </div>

              <span className="text-3xl font-bold font-mono text-accent">
                {speed >= 1.0 ? `+${Math.round((speed - 1) * 100)}%` : `-${Math.round((1 - speed) * 100)}%`}
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0.25"
              max="2.0"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {SPEED_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setSpeed(p)}
                  className={`text-xs px-3 py-1 neo-border rounded-full font-heading font-semibold transition-colors ${
                    Math.abs(speed - p) < 0.01
                      ? "bg-accent text-white"
                      : "bg-surface hover:bg-accent/10"
                  }`}
                >
                  {p}x {p === 1.0 ? "(Normal)" : p < 1.0 ? "(Slow-mo)" : "(Timelapse)"}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="space-y-3">
            <div className="text-center">
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
              >
                <FastForward size={16} />
                {isProcessing
                  ? `Rendering Video (${progress}%)...`
                  : `Export Video at ${speed}x Speed`}
              </button>
            </div>

            {isProcessing && (
              <div className="neo-card p-4 space-y-2">
                <div className="flex justify-between text-xs font-heading font-bold uppercase">
                  <span>Re-rendering video stream at {speed}x...</span>
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
          {exportUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Video Speed Adjusted!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Exported at {speed}x speed ({formatBytes(exportSize)}) • Duration: {formatVideoTime(estimatedNewDuration)}
                  </p>
                </div>
              </div>

              <video
                controls
                src={exportUrl}
                className="w-full max-h-[340px] neo-border rounded bg-black mx-auto"
              />

              <a
                href={exportUrl}
                download={`${file.name.replace(/\.[^/.]+$/, "")}_${speed}x.${exportExt}`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Speed-Adjusted Video (.{exportExt})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
