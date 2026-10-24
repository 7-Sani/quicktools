"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileAudio,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  decodeAudioFile,
  sliceAudioBuffer,
  mergeAudioBuffers,
  audioBufferToWav,
  formatTime,
  formatBytes,
  getAudioContext,
} from "@/lib/audioUtils";

type TrimMode = "keep_selection" | "remove_selection";

export default function AudioTrimmerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trim mode
  const [trimMode, setTrimMode] = useState<TrimMode>("keep_selection");

  // Selection points (seconds)
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackStartTimestampRef = useRef<number>(0);
  const playbackStartOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // File loading
  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setDownloadUrl(null);
    stopPlayback();
    setIsLoading(true);
    setFile(selected);

    try {
      const buffer = await decodeAudioFile(selected);
      setAudioBuffer(buffer);
      setStartTime(0);
      setEndTime(buffer.duration);
      setCurrentTime(0);
    } catch {
      setError("Failed to decode audio file. Please check that the file is not corrupted.");
      setAudioBuffer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const stopPlayback = useCallback(() => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch {
        // ignore
      }
      activeSourceRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      stopPlayback();
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [stopPlayback, downloadUrl]);

  const playFromOffset = useCallback(
    (offset: number) => {
      if (!audioBuffer) return;
      stopPlayback();

      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      playbackStartOffsetRef.current = offset;
      playbackStartTimestampRef.current = ctx.currentTime;
      activeSourceRef.current = source;

      setIsPlaying(true);
      source.start(0, offset);

      source.onended = () => {
        stopPlayback();
      };

      const updateProgress = () => {
        if (!source || !audioBuffer) return;
        const currentCtxTime = ctx.currentTime;
        const elapsed = currentCtxTime - playbackStartTimestampRef.current;
        const actualPos = playbackStartOffsetRef.current + elapsed;

        if (actualPos >= audioBuffer.duration) {
          stopPlayback();
          setCurrentTime(audioBuffer.duration);
          return;
        }

        setCurrentTime(actualPos);
        animFrameRef.current = requestAnimationFrame(updateProgress);
      };

      animFrameRef.current = requestAnimationFrame(updateProgress);
    },
    [audioBuffer, stopPlayback]
  );

  const togglePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playFromOffset(currentTime < (audioBuffer?.duration || 0) ? currentTime : 0);
    }
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#F7F7F5";
    ctx.fillRect(0, 0, width, height);

    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / width);
    const amp = height / 2;

    // Base waveform
    ctx.fillStyle = "#A3A3A3";
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      const y1 = (1 + min) * amp;
      const y2 = Math.max(1, (max - min) * amp);
      ctx.fillRect(i, y1, 1, y2);
    }

    const startX = (startTime / audioBuffer.duration) * width;
    const endX = (endTime / audioBuffer.duration) * width;

    if (trimMode === "keep_selection") {
      // Shaded selection to keep
      ctx.fillStyle = "rgba(49, 92, 255, 0.2)";
      ctx.fillRect(startX, 0, Math.max(1, endX - startX), height);

      // Dim outers
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, startX, height);
      ctx.fillRect(endX, 0, width - endX, height);
    } else {
      // Red shaded selection to remove
      ctx.fillStyle = "rgba(232, 72, 85, 0.25)";
      ctx.fillRect(startX, 0, Math.max(1, endX - startX), height);
    }

    // Border markers
    ctx.fillStyle = trimMode === "keep_selection" ? "#315CFF" : "#E84855";
    ctx.fillRect(startX, 0, 2, height);
    ctx.fillRect(endX - 2, 0, 2, height);

    // Playhead
    const currentX = (currentTime / audioBuffer.duration) * width;
    ctx.fillStyle = "#111111";
    ctx.fillRect(currentX - 1, 0, 2, height);
  }, [audioBuffer, startTime, endTime, currentTime, trimMode]);

  // Handle trim processing
  const handleTrim = async () => {
    if (!audioBuffer || !file) return;

    if (startTime >= endTime) {
      setError("Start time must be before end time.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    stopPlayback();

    try {
      let finalBuffer: AudioBuffer;

      if (trimMode === "keep_selection") {
        // Keep inside
        finalBuffer = sliceAudioBuffer(audioBuffer, startTime, endTime);
      } else {
        // Remove inside (concatenate part 1 before start + part 2 after end)
        const parts: AudioBuffer[] = [];
        if (startTime > 0.01) {
          parts.push(sliceAudioBuffer(audioBuffer, 0, startTime));
        }
        if (endTime < audioBuffer.duration - 0.01) {
          parts.push(sliceAudioBuffer(audioBuffer, endTime, audioBuffer.duration));
        }

        if (parts.length === 0) {
          throw new Error("Trimming removed all audio content.");
        }
        finalBuffer = await mergeAudioBuffers(parts, 0.005);
      }

      const wavBlob = audioBufferToWav(finalBuffer, 16);
      setOutputSize(wavBlob.size);

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(wavBlob);
      setDownloadUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trim audio.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const adjustStart = (delta: number) => {
    if (!audioBuffer) return;
    setStartTime((s) => Math.max(0, Math.min(endTime - 0.05, s + delta)));
  };

  const adjustEnd = (delta: number) => {
    if (!audioBuffer) return;
    setEndTime((e) =>
      Math.max(startTime + 0.05, Math.min(audioBuffer.duration, e + delta))
    );
  };

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".webm", ".flac"],
          }}
          label="Drop an audio file to trim"
          description="Supports all browser audio formats (Up to 100MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Loading audio waveform...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {audioBuffer && file && (
        <div className="space-y-6">
          {/* File summary */}
          <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center neo-border rounded-lg bg-accent/10 text-accent shrink-0">
                <FileAudio size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-sm truncate uppercase">
                  {file.name}
                </p>
                <p className="text-xs text-text-secondary">
                  {formatBytes(file.size)} • {formatTime(audioBuffer.duration)} •{" "}
                  {audioBuffer.sampleRate} Hz
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                stopPlayback();
                setFile(null);
                setAudioBuffer(null);
                setDownloadUrl(null);
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Choose Another
            </button>
          </div>

          {/* Mode switch */}
          <div className="grid grid-cols-2 gap-3 p-1 neo-card">
            <button
              onClick={() => setTrimMode("keep_selection")}
              className={`py-2 px-3 text-xs font-heading font-semibold uppercase rounded transition-colors ${
                trimMode === "keep_selection"
                  ? "bg-accent text-white neo-shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              Keep Selected Region
            </button>
            <button
              onClick={() => setTrimMode("remove_selection")}
              className={`py-2 px-3 text-xs font-heading font-semibold uppercase rounded transition-colors ${
                trimMode === "remove_selection"
                  ? "bg-[#E84855] text-white neo-shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              Remove Selected Region
            </button>
          </div>

          {/* Waveform */}
          <div className="neo-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-text-secondary font-mono">
              <span>{formatTime(currentTime)}</span>
              <span className="text-[11px] uppercase tracking-wider text-text-secondary font-heading font-semibold">
                Click waveform to seek
              </span>
              <span>{formatTime(audioBuffer.duration)}</span>
            </div>

            <div className="relative border-2 border-border rounded overflow-hidden cursor-pointer">
              <canvas
                ref={canvasRef}
                width={800}
                height={120}
                className="w-full h-28 block"
                onClick={(e) => {
                  if (!audioBuffer || !canvasRef.current) return;
                  const rect = canvasRef.current.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  const targetTime = pos * audioBuffer.duration;
                  setCurrentTime(targetTime);
                  if (isPlaying) playFromOffset(targetTime);
                }}
              />
            </div>
          </div>

          {/* Start and End controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="neo-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase text-text-secondary">
                  Trim Start Point
                </span>
                <span className="font-mono text-sm font-bold">
                  {formatTime(startTime)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={audioBuffer.duration}
                step="0.01"
                value={startTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setStartTime(Math.min(val, endTime - 0.05));
                }}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => adjustStart(-1)}
                  className="neo-btn neo-btn-secondary text-[11px] px-2 py-1 flex-1"
                >
                  -1.0s
                </button>
                <button
                  onClick={() => adjustStart(-0.1)}
                  className="neo-btn neo-btn-secondary text-[11px] px-2 py-1 flex-1"
                >
                  -0.1s
                </button>
                <button
                  onClick={() => adjustStart(0.1)}
                  className="neo-btn neo-btn-secondary text-[11px] px-2 py-1 flex-1"
                >
                  +0.1s
                </button>
                <button
                  onClick={() => adjustStart(1)}
                  className="neo-btn neo-btn-secondary text-[11px] px-2 py-1 flex-1"
                >
                  +1.0s
                </button>
              </div>
            </div>

            <div className="neo-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase text-text-secondary">
                  Trim End Point
                </span>
                <span className="font-mono text-sm font-bold">
                  {formatTime(endTime)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={audioBuffer.duration}
                step="0.01"
                value={endTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setEndTime(Math.max(val, startTime + 0.05));
                }}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => adjustEnd(-1)}
                  className="neo-btn neo-btn-secondary text-[11px] px-2 py-1 flex-1"
                >
                  -1.0s
                </button>
                <button
                  onClick={() => adjustEnd(-0.1)}
                  className="neo-btn neo-btn-secondary text-[11px] px-2 py-1 flex-1"
                >
                  -0.1s
                </button>
                <button
                  onClick={() => adjustEnd(0.1)}
                  className="neo-btn neo-btn-secondary text-[11px] px-2 py-1 flex-1"
                >
                  +0.1s
                </button>
                <button
                  onClick={() => adjustEnd(1)}
                  className="neo-btn neo-btn-secondary text-[11px] px-2 py-1 flex-1"
                >
                  +1.0s
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 neo-card">
            <button
              onClick={togglePlayPause}
              className="neo-btn neo-btn-secondary text-xs"
            >
              {isPlaying ? (
                <>
                  <Pause size={14} /> Pause
                </>
              ) : (
                <>
                  <Play size={14} /> Play Original
                </>
              )}
            </button>

            <button
              onClick={handleTrim}
              disabled={isProcessing}
              className="neo-btn neo-btn-primary text-xs"
            >
              <Sliders size={14} />
              {isProcessing ? "Processing Trim..." : "Apply Trim & Export"}
            </button>
          </div>

          {/* Result Card */}
          {downloadUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Audio Trimmed Successfully!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Exported as lossless 16-bit PCM WAV ({formatBytes(outputSize)})
                  </p>
                </div>
              </div>

              <audio
                controls
                src={downloadUrl}
                className="w-full neo-border rounded"
              />

              <a
                href={downloadUrl}
                download={`${file.name.replace(/\.[^/.]+$/, "")}_trimmed.wav`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Trimmed Audio (.wav)
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
