"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Play,
  Pause,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  decodeAudioFile,
  adjustVolume,
  audioBufferToWav,
  formatTime,
  formatBytes,
  getAudioContext,
} from "@/lib/audioUtils";

const VOLUME_PRESETS = [50, 100, 150, 200, 300, 500];

export default function VolumeBoosterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Volume settings
  const [volumePercent, setVolumePercent] = useState<number>(200);
  const [softLimiter, setSoftLimiter] = useState<boolean>(true);

  // Live preview playback
  const [isPlaying, setIsPlaying] = useState(false);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Export
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);

  const stopPreview = () => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch {
        // ignore
      }
      activeSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopPreview();
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  // Update live gain if currently previewing
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volumePercent / 100;
    }
  }, [volumePercent]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setDownloadUrl(null);
    stopPreview();
    setIsLoading(true);
    setFile(selected);

    try {
      const buffer = await decodeAudioFile(selected);
      setAudioBuffer(buffer);
    } catch {
      setError("Unable to decode the audio file.");
      setAudioBuffer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreview = () => {
    if (!audioBuffer) return;

    if (isPlaying) {
      stopPreview();
    } else {
      stopPreview();
      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      const gain = ctx.createGain();
      gain.gain.value = volumePercent / 100;

      source.connect(gain);
      gain.connect(ctx.destination);

      activeSourceRef.current = source;
      gainNodeRef.current = gain;
      setIsPlaying(true);

      source.start(0);
      source.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const handleProcess = async () => {
    if (!audioBuffer || !file) return;

    stopPreview();
    setIsProcessing(true);
    setError(null);

    try {
      const gainFactor = volumePercent / 100;
      const boostedBuffer = adjustVolume(audioBuffer, gainFactor, softLimiter);
      const wavBlob = audioBufferToWav(boostedBuffer, 16);
      setOutputSize(wavBlob.size);

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(wavBlob);
      setDownloadUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to boost audio volume.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const gainFactor = volumePercent / 100;
  const gainDb = (20 * Math.log10(Math.max(0.001, gainFactor))).toFixed(1);

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".webm", ".flac"],
          }}
          label="Drop an audio file to boost volume"
          description="Amplify quiet recordings and sound files (Up to 100MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Decoding audio...
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
                  {audioBuffer.numberOfChannels === 1 ? "Mono" : "Stereo"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                stopPreview();
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

          {/* Volume Booster Slider Card */}
          <div className="neo-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg uppercase flex items-center gap-2">
                  {volumePercent === 0 ? (
                    <VolumeX size={20} className="text-text-secondary" />
                  ) : (
                    <Volume2 size={20} className="text-accent" />
                  )}
                  Boost Level: {volumePercent}%
                </h3>
                <p className="text-xs text-text-secondary">
                  Relative gain change: {Number(gainDb) >= 0 ? `+${gainDb}` : gainDb} dB
                </p>
              </div>

              <span className="text-3xl font-bold font-mono text-accent">
                {(volumePercent / 100).toFixed(1)}x
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="500"
              step="5"
              value={volumePercent}
              onChange={(e) => setVolumePercent(parseInt(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {VOLUME_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setVolumePercent(p)}
                  className={`text-xs px-3 py-1 neo-border rounded-full font-heading font-semibold transition-colors ${
                    volumePercent === p
                      ? "bg-accent text-white"
                      : "bg-surface hover:bg-accent/10"
                  }`}
                >
                  {p}% {p === 100 ? "(Original)" : ""}
                </button>
              ))}
            </div>

            {/* Limiter Toggle */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-heading font-semibold uppercase text-text">
                <input
                  type="checkbox"
                  checked={softLimiter}
                  onChange={(e) => setSoftLimiter(e.target.checked)}
                  className="accent-accent w-4 h-4"
                />
                <ShieldAlert size={14} className="text-accent" />
                Soft-Clipping Peak Limiter
              </label>
              <span className="text-xs text-text-secondary">
                {softLimiter ? "Protects against harsh digital distortion" : "Raw gain multiplication"}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 neo-card">
            <button
              onClick={togglePreview}
              className="neo-btn neo-btn-secondary text-xs"
            >
              {isPlaying ? (
                <>
                  <Pause size={14} /> Stop Boosted Preview
                </>
              ) : (
                <>
                  <Play size={14} /> Listen with {volumePercent}% Boost
                </>
              )}
            </button>

            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="neo-btn neo-btn-primary text-xs"
            >
              <Volume2 size={14} />
              {isProcessing ? "Processing Amplification..." : "Boost & Export Audio"}
            </button>
          </div>

          {/* Result Card */}
          {downloadUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Volume Boosted Successfully!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Exported at {volumePercent}% volume ({formatBytes(outputSize)}) • 16-bit PCM WAV
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
                download={`${file.name.replace(/\.[^/.]+$/, "")}_boosted_${volumePercent}pct.wav`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Boosted Audio (.wav)
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
