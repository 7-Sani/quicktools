"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Scissors,
  Volume2,
  FileAudio,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  decodeAudioFile,
  sliceAudioBuffer,
  audioBufferToWav,
  formatTime,
  formatBytes,
  getAudioContext,
} from "@/lib/audioUtils";

export default function Mp3CutterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cut points in seconds
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingSelection, setIsPlayingSelection] = useState(false);

  // Output
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputBlobSize, setOutputBlobSize] = useState<number>(0);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackStartTimestampRef = useRef<number>(0);
  const playbackStartOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Handle file drop
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
      setError("Could not decode audio. Please ensure the file is a valid audio format.");
      setAudioBuffer(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop playback cleanly
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
    setIsPlayingSelection(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [stopPlayback, downloadUrl]);

  // Start playback from offset
  const playFromOffset = useCallback(
    (offset: number, maxDuration?: number, isSelection = false) => {
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
      setIsPlayingSelection(isSelection);

      if (maxDuration) {
        source.start(0, offset, maxDuration);
      } else {
        source.start(0, offset);
      }

      source.onended = () => {
        stopPlayback();
        if (isSelection) {
          setCurrentTime(startTime);
        }
      };

      // Progress animation loop
      const updateProgress = () => {
        if (!source || !audioBuffer) return;
        const currentCtxTime = ctx.currentTime;
        const elapsed = currentCtxTime - playbackStartTimestampRef.current;
        const actualPos = playbackStartOffsetRef.current + elapsed;

        if (maxDuration && elapsed >= maxDuration) {
          stopPlayback();
          setCurrentTime(startTime);
          return;
        }

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
    [audioBuffer, startTime, stopPlayback]
  );

  const togglePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playFromOffset(currentTime < (audioBuffer?.duration || 0) ? currentTime : 0);
    }
  };

  const playSelection = () => {
    if (!audioBuffer) return;
    const duration = Math.max(0, endTime - startTime);
    if (duration <= 0) return;
    playFromOffset(startTime, duration, true);
  };

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#F7F7F5";
    ctx.fillRect(0, 0, width, height);

    // Channel data downsampled
    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / width);
    const amp = height / 2;

    // Draw full waveform bars
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

    // Highlight selected region
    const startX = (startTime / audioBuffer.duration) * width;
    const endX = (endTime / audioBuffer.duration) * width;

    ctx.fillStyle = "rgba(49, 92, 255, 0.15)";
    ctx.fillRect(startX, 0, Math.max(1, endX - startX), height);

    // Selection borders
    ctx.fillStyle = "#315CFF";
    ctx.fillRect(startX, 0, 2, height);
    ctx.fillRect(endX - 2, 0, 2, height);

    // Playhead line
    const currentX = (currentTime / audioBuffer.duration) * width;
    ctx.fillStyle = "#111111";
    ctx.fillRect(currentX - 1, 0, 2, height);
  }, [audioBuffer, startTime, endTime, currentTime]);

  // Click on waveform to seek or set markers
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioBuffer || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const clickTime = ratio * audioBuffer.duration;

    if (e.shiftKey) {
      // Shift-click sets end time
      if (clickTime > startTime) setEndTime(clickTime);
    } else if (e.altKey) {
      // Alt-click sets start time
      if (clickTime < endTime) setStartTime(clickTime);
    } else {
      // Normal click seeks playhead
      setCurrentTime(clickTime);
      if (isPlaying) {
        playFromOffset(clickTime);
      }
    }
  };

  // Perform cut & export
  const handleCut = async () => {
    if (!audioBuffer || !file) return;
    if (endTime <= startTime) {
      setError("End time must be greater than start time.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    stopPlayback();

    try {
      const sliced = sliceAudioBuffer(audioBuffer, startTime, endTime);
      const wavBlob = audioBufferToWav(sliced, 16);
      setOutputBlobSize(wavBlob.size);

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(wavBlob);
      setDownloadUrl(url);
    } catch {
      setError("An error occurred while cutting the audio.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset
  const handleReset = () => {
    stopPlayback();
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setAudioBuffer(null);
    setDownloadUrl(null);
    setError(null);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".webm", ".flac"],
          }}
          label="Drop an MP3 or audio file here"
          description="Supports MP3, WAV, OGG, M4A, AAC, FLAC (Up to 100MB)"
        />
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Decoding audio waveform...
          </p>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Workspace */}
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
                  {audioBuffer.numberOfChannels === 1 ? "Mono" : "Stereo"} •{" "}
                  {audioBuffer.sampleRate} Hz
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Choose Another
            </button>
          </div>

          {/* Waveform Canvas */}
          <div className="neo-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-text-secondary font-mono">
              <span>{formatTime(currentTime)}</span>
              <span className="text-[11px] uppercase tracking-wider text-accent font-heading font-semibold">
                Click: Seek • Alt+Click: Set Start • Shift+Click: Set End
              </span>
              <span>{formatTime(audioBuffer.duration)}</span>
            </div>

            <div className="relative border-2 border-border rounded overflow-hidden cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={800}
                height={120}
                className="w-full h-28 block"
                onClick={handleCanvasClick}
              />
            </div>
          </div>

          {/* Selection Time Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                Start Time (sec)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={endTime}
                  value={Number(startTime.toFixed(2))}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setStartTime(Math.max(0, Math.min(val, endTime)));
                  }}
                  className="neo-input text-base font-mono"
                />
                <button
                  onClick={() => setStartTime(currentTime)}
                  className="neo-btn neo-btn-secondary text-xs px-2 py-1 shrink-0"
                  title="Set to Current Position"
                >
                  Current
                </button>
              </div>
              <p className="text-[11px] text-text-secondary mt-1 font-mono">
                {formatTime(startTime)}
              </p>
            </div>

            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-1">
                End Time (sec)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min={startTime}
                  max={audioBuffer.duration}
                  value={Number(endTime.toFixed(2))}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setEndTime(
                      Math.max(startTime, Math.min(val, audioBuffer.duration))
                    );
                  }}
                  className="neo-input text-base font-mono"
                />
                <button
                  onClick={() => setEndTime(currentTime)}
                  className="neo-btn neo-btn-secondary text-xs px-2 py-1 shrink-0"
                  title="Set to Current Position"
                >
                  Current
                </button>
              </div>
              <p className="text-[11px] text-text-secondary mt-1 font-mono">
                {formatTime(endTime)}
              </p>
            </div>

            <div className="neo-card p-4 flex flex-col justify-center">
              <span className="text-xs uppercase font-heading font-semibold text-text-secondary">
                Selected Cut Length
              </span>
              <span className="text-2xl font-bold font-mono text-accent">
                {formatTime(Math.max(0, endTime - startTime))}
              </span>
              <span className="text-[11px] text-text-secondary">
                {(Math.max(0, endTime - startTime)).toFixed(2)} seconds
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
                {isPlaying && !isPlayingSelection ? (
                  <>
                    <Pause size={14} /> Pause
                  </>
                ) : (
                  <>
                    <Play size={14} /> Play All
                  </>
                )}
              </button>

              <button
                onClick={playSelection}
                className="neo-btn neo-btn-secondary text-xs"
              >
                {isPlaying && isPlayingSelection ? (
                  <>
                    <Pause size={14} /> Pause Cut
                  </>
                ) : (
                  <>
                    <Volume2 size={14} /> Preview Cut
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleCut}
              disabled={isProcessing || endTime <= startTime}
              className="neo-btn neo-btn-primary text-xs"
            >
              <Scissors size={14} />
              {isProcessing ? "Processing Cut..." : "Cut Audio"}
            </button>
          </div>

          {/* Download Card */}
          {downloadUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Audio Cut Successfully!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Exported as lossless 16-bit PCM WAV ({formatBytes(outputBlobSize)})
                  </p>
                </div>
              </div>

              {/* Native audio player preview */}
              <audio
                controls
                src={downloadUrl}
                className="w-full neo-border rounded"
              />

              <div className="flex gap-3">
                <a
                  href={downloadUrl}
                  download={`${file.name.replace(/\.[^/.]+$/, "")}_cut.wav`}
                  className="neo-btn neo-btn-primary text-xs flex-1 text-center"
                >
                  <Download size={14} />
                  Download Cut File (.wav)
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
