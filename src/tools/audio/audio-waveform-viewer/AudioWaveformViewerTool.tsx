"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  AudioWaveform,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  decodeAudioFile,
  formatTime,
  formatBytes,
  getAudioContext,
} from "@/lib/audioUtils";

export default function AudioWaveformViewerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Viewer options
  const [zoom, setZoom] = useState<number>(1);
  const [showStereo, setShowStereo] = useState<boolean>(true);
  const [colorTheme, setColorTheme] = useState<"blue" | "dark" | "gradient">("blue");

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Peak and RMS stats
  const [peakAmp, setPeakAmp] = useState<number>(0);
  const [rmsVal, setRmsVal] = useState<number>(0);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackStartTimestampRef = useRef<number>(0);
  const playbackStartOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

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
    };
  }, [stopPlayback]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    stopPlayback();
    setIsLoading(true);
    setFile(selected);

    try {
      const buffer = await decodeAudioFile(selected);
      setAudioBuffer(buffer);
      setCurrentTime(0);

      // Compute Peak & RMS
      let maxPeak = 0;
      let sumSquares = 0;
      const data = buffer.getChannelData(0);
      const sampleStep = Math.max(1, Math.floor(data.length / 50000));
      let samplesCount = 0;

      for (let i = 0; i < data.length; i += sampleStep) {
        const absVal = Math.abs(data[i]);
        if (absVal > maxPeak) maxPeak = absVal;
        sumSquares += absVal * absVal;
        samplesCount++;
      }

      setPeakAmp(maxPeak);
      setRmsVal(Math.sqrt(sumSquares / samplesCount));
    } catch {
      setError("Unable to render audio waveform. Please verify the audio file.");
      setAudioBuffer(null);
    } finally {
      setIsLoading(false);
    }
  };

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

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playFromOffset(currentTime < (audioBuffer?.duration || 0) ? currentTime : 0);
    }
  };

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200 * zoom;
    const height = canvas.height;
    canvas.width = width;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = colorTheme === "dark" ? "#111111" : "#F7F7F5";
    ctx.fillRect(0, 0, width, height);

    // Center divider
    ctx.strokeStyle = colorTheme === "dark" ? "#333333" : "#E5E5E5";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const isMultiChannel = showStereo && audioBuffer.numberOfChannels >= 2;
    const channelsToRender = isMultiChannel ? 2 : 1;
    const channelHeight = height / channelsToRender;

    for (let c = 0; c < channelsToRender; c++) {
      const channelData = audioBuffer.getChannelData(c);
      const step = Math.ceil(channelData.length / width);
      const yCenter = c * channelHeight + channelHeight / 2;
      const amp = (channelHeight / 2) * 0.95;

      for (let x = 0; x < width; x++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
          const datum = channelData[x * step + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }

        if (colorTheme === "blue") {
          ctx.fillStyle = "#315CFF";
        } else if (colorTheme === "dark") {
          ctx.fillStyle = "#10B981";
        } else {
          // gradient
          const intensity = Math.min(1, Math.max(0.2, (max - min) / 2));
          ctx.fillStyle = `rgba(232, 72, 85, ${intensity})`;
        }

        const yTop = yCenter - max * amp;
        const barHeight = Math.max(1, (max - min) * amp);
        ctx.fillRect(x, yTop, 1, barHeight);
      }
    }

    // Playhead line
    const playheadX = (currentTime / audioBuffer.duration) * width;
    ctx.fillStyle = colorTheme === "dark" ? "#FFFFFF" : "#111111";
    ctx.fillRect(playheadX - 1, 0, 2, height);
  }, [audioBuffer, zoom, showStereo, colorTheme, currentTime]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioBuffer || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * audioBuffer.duration;

    setCurrentTime(targetTime);
    if (isPlaying) {
      playFromOffset(targetTime);
    }
  };

  const exportWaveformImage = () => {
    if (!canvasRef.current || !file) return;
    const link = document.createElement("a");
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}_waveform.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".webm", ".flac"],
          }}
          label="Drop an audio file to view waveform"
          description="High-resolution visualizer with zoom and audio scrubbing (Up to 100MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Computing high-resolution audio waveform...
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
                  {audioBuffer.numberOfChannels} Channel(s) • {audioBuffer.sampleRate} Hz
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportWaveformImage}
                className="neo-btn neo-btn-secondary text-xs"
              >
                <Download size={14} />
                Export PNG
              </button>
              <button
                onClick={() => {
                  stopPlayback();
                  setFile(null);
                  setAudioBuffer(null);
                }}
                className="neo-btn neo-btn-secondary text-xs"
              >
                <RotateCcw size={14} />
                Load Another
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="neo-card p-4 text-center">
              <span className="text-[11px] font-heading font-bold uppercase text-text-secondary block">
                Peak Amplitude
              </span>
              <span className="text-xl font-bold font-mono">
                {(peakAmp * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-text-secondary font-mono block">
                {(20 * Math.log10(Math.max(0.0001, peakAmp))).toFixed(1)} dBFS
              </span>
            </div>

            <div className="neo-card p-4 text-center">
              <span className="text-[11px] font-heading font-bold uppercase text-text-secondary block">
                RMS Energy
              </span>
              <span className="text-xl font-bold font-mono">
                {(rmsVal * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-text-secondary font-mono block">
                {(20 * Math.log10(Math.max(0.0001, rmsVal))).toFixed(1)} dBFS
              </span>
            </div>

            <div className="neo-card p-4 text-center">
              <span className="text-[11px] font-heading font-bold uppercase text-text-secondary block">
                Zoom Level
              </span>
              <span className="text-xl font-bold font-mono text-accent">
                {zoom}x
              </span>
              <div className="flex justify-center gap-2 mt-1">
                <button
                  onClick={() => setZoom((z) => Math.max(1, z - 1))}
                  disabled={zoom <= 1}
                  className="p-1 neo-border rounded hover:bg-surface disabled:opacity-30"
                  title="Zoom Out"
                >
                  <ZoomOut size={12} />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(8, z + 1))}
                  disabled={zoom >= 8}
                  className="p-1 neo-border rounded hover:bg-surface disabled:opacity-30"
                  title="Zoom In"
                >
                  <ZoomIn size={12} />
                </button>
              </div>
            </div>

            <div className="neo-card p-4 text-center">
              <span className="text-[11px] font-heading font-bold uppercase text-text-secondary block">
                Channels & Theme
              </span>
              <div className="flex justify-center items-center gap-1 mt-2">
                <button
                  onClick={() => setShowStereo(!showStereo)}
                  className={`text-[11px] px-2 py-0.5 neo-border rounded font-heading font-semibold ${
                    showStereo ? "bg-accent text-white" : "bg-surface"
                  }`}
                >
                  {showStereo ? "Stereo" : "Merged"}
                </button>
                <button
                  onClick={() =>
                    setColorTheme((c) =>
                      c === "blue" ? "dark" : c === "dark" ? "gradient" : "blue"
                    )
                  }
                  className="text-[11px] px-2 py-0.5 neo-border rounded bg-surface font-heading font-semibold"
                >
                  {colorTheme.toUpperCase()}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Waveform Viewport */}
          <div className="neo-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-text-secondary font-mono">
              <span className="font-bold">{formatTime(currentTime)}</span>
              <span className="text-[11px] uppercase tracking-wider text-accent font-heading font-semibold">
                Click anywhere along waveform to scrub & play
              </span>
              <span>{formatTime(audioBuffer.duration)}</span>
            </div>

            <div
              ref={containerRef}
              className="border-2 border-border rounded overflow-x-auto overflow-y-hidden cursor-crosshair bg-bg"
            >
              <canvas
                ref={canvasRef}
                height={200}
                className="block"
                onClick={handleCanvasClick}
              />
            </div>
          </div>

          {/* Player controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 neo-card">
            <button
              onClick={togglePlay}
              className="neo-btn neo-btn-primary text-xs"
            >
              {isPlaying ? (
                <>
                  <Pause size={14} /> Pause Audio
                </>
              ) : (
                <>
                  <Play size={14} /> Play From Cursor
                </>
              )}
            </button>

            <span className="text-xs text-text-secondary font-mono">
              Playhead: {currentTime.toFixed(2)}s / {audioBuffer.duration.toFixed(2)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
