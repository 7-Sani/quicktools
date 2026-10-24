"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  RotateCcw,
  Scissors,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Play,
  Pause,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  loadVideo,
  getBestVideoMimeType,
  formatVideoTime,
  formatBytes,
} from "@/lib/videoUtils";

export default function VideoTrimmerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    duration: number;
    width: number;
    height: number;
    srcUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trim timestamps (seconds)
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingTrim, setIsPlayingTrim] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);
  const [trimmedSize, setTrimmedSize] = useState(0);
  const [trimmedExt, setTrimmedExt] = useState("webm");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (videoInfo?.srcUrl) URL.revokeObjectURL(videoInfo.srcUrl);
      if (trimmedUrl) URL.revokeObjectURL(trimmedUrl);
    };
  }, [videoInfo, trimmedUrl]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setTrimmedUrl(null);
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

      setStartTime(0);
      setEndTime(video.duration);
      setCurrentTime(0);
    } catch {
      setError("Unable to load video. Please ensure the file is a valid video format.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pos = videoRef.current.currentTime;
    setCurrentTime(pos);

    if (isPlayingTrim && pos >= endTime) {
      videoRef.current.pause();
      videoRef.current.currentTime = startTime;
      setIsPlaying(false);
      setIsPlayingTrim(false);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setIsPlayingTrim(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setIsPlayingTrim(false);
    }
  };

  const previewTrim = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = startTime;
    videoRef.current.play();
    setIsPlaying(true);
    setIsPlayingTrim(true);
  };

  const handleTrim = async () => {
    if (!file || !videoInfo) return;
    if (endTime <= startTime) {
      setError("End time must be greater than start time.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    stopRequestedRef.current = false;

    try {
      const renderVideo = document.createElement("video");
      renderVideo.src = videoInfo.srcUrl;
      renderVideo.muted = false;
      renderVideo.playsInline = true;
      renderVideo.crossOrigin = "anonymous";

      await new Promise<void>((res, rej) => {
        renderVideo.onloadeddata = () => res();
        renderVideo.onerror = () => rej(new Error("Video loading error"));
      });

      const width = renderVideo.videoWidth;
      const height = renderVideo.videoHeight;
      const canvas = document.createElement("canvas");
      canvas.width = width % 2 === 0 ? width : width - 1;
      canvas.height = height % 2 === 0 ? height : height - 1;
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
        // Continue if audio capture is restricted
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

      renderVideo.currentTime = startTime;
      await new Promise<void>((res) => {
        renderVideo.onseeked = () => res();
      });

      recorder.start(100);
      await renderVideo.play();

      const trimDuration = Math.max(0.1, endTime - startTime);

      const render = () => {
        if (stopRequestedRef.current || renderVideo.currentTime >= endTime || renderVideo.ended) {
          if (recorder.state === "recording") recorder.stop();
          renderVideo.pause();
          return;
        }

        ctx.drawImage(renderVideo, 0, 0, canvas.width, canvas.height);
        const elapsed = renderVideo.currentTime - startTime;
        setProgress(Math.min(99, Math.round((elapsed / trimDuration) * 100)));

        requestAnimationFrame(render);
      };

      render();

      const blob = await recordPromise;
      setProgress(100);
      setTrimmedSize(blob.size);
      setTrimmedExt(extension);

      if (trimmedUrl) URL.revokeObjectURL(trimmedUrl);
      const url = URL.createObjectURL(blob);
      setTrimmedUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trim video.";
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
          label="Drop a video file to trim"
          description="Supports MP4, WebM, MOV (Up to 200MB)"
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
                setTrimmedUrl(null);
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Choose Another
            </button>
          </div>

          {/* Interactive Video Preview Player */}
          <div className="neo-card p-4 space-y-2">
            <video
              ref={videoRef}
              src={videoInfo.srcUrl}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full max-h-[340px] neo-border rounded bg-black mx-auto"
            />
            <div className="flex items-center justify-between text-xs text-text-secondary font-mono pt-1">
              <span>{formatVideoTime(currentTime, true)}</span>
              <span>{formatVideoTime(videoInfo.duration, true)}</span>
            </div>
          </div>

          {/* Timestamp Sliders and Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                Trim Start (sec)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={endTime}
                  value={Number(startTime.toFixed(2))}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setStartTime(Math.max(0, Math.min(val, endTime - 0.1)));
                  }}
                  className="neo-input text-base font-mono"
                />
                <button
                  onClick={() => setStartTime(currentTime)}
                  className="neo-btn neo-btn-secondary text-xs px-2 py-1 shrink-0"
                  title="Set to Current Position"
                >
                  Set
                </button>
              </div>
              <p className="text-[11px] text-text-secondary mt-1 font-mono">
                {formatVideoTime(startTime, true)}
              </p>
            </div>

            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                Trim End (sec)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min={startTime}
                  max={videoInfo.duration}
                  value={Number(endTime.toFixed(2))}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setEndTime(Math.max(startTime + 0.1, Math.min(val, videoInfo.duration)));
                  }}
                  className="neo-input text-base font-mono"
                />
                <button
                  onClick={() => setEndTime(currentTime)}
                  className="neo-btn neo-btn-secondary text-xs px-2 py-1 shrink-0"
                  title="Set to Current Position"
                >
                  Set
                </button>
              </div>
              <p className="text-[11px] text-text-secondary mt-1 font-mono">
                {formatVideoTime(endTime, true)}
              </p>
            </div>

            <div className="neo-card p-4 flex flex-col justify-center">
              <span className="text-xs uppercase font-heading font-semibold text-text-secondary">
                Trimmed Clip Length
              </span>
              <span className="text-2xl font-bold font-mono text-accent">
                {formatVideoTime(Math.max(0, endTime - startTime), true)}
              </span>
              <span className="text-[11px] text-text-secondary">
                {(Math.max(0, endTime - startTime)).toFixed(1)} seconds
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 neo-card">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayPause}
                className="neo-btn neo-btn-secondary text-xs"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? "Pause" : "Play Full"}
              </button>

              <button
                onClick={previewTrim}
                className="neo-btn neo-btn-secondary text-xs"
              >
                <Scissors size={14} />
                Preview Trim
              </button>
            </div>

            <button
              onClick={handleTrim}
              disabled={isProcessing || endTime <= startTime}
              className="neo-btn neo-btn-primary text-xs"
            >
              <Scissors size={14} />
              {isProcessing ? `Trimming (${progress}%)...` : "Trim Video"}
            </button>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="neo-card p-4 space-y-2">
              <div className="flex justify-between text-xs font-heading font-bold uppercase">
                <span>Trimming video segment...</span>
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

          {/* Trimmed Result Card */}
          {trimmedUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Video Trimmed Successfully!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Exported {formatVideoTime(endTime - startTime)} clip ({formatBytes(trimmedSize)})
                  </p>
                </div>
              </div>

              <video
                controls
                src={trimmedUrl}
                className="w-full max-h-[340px] neo-border rounded bg-black mx-auto"
              />

              <a
                href={trimmedUrl}
                download={`${file.name.replace(/\.[^/.]+$/, "")}_trimmed.${trimmedExt}`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Trimmed Video (.{trimmedExt})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
