"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  RotateCcw,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileAudio,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  decodeAudioFile,
  changeAudioSpeed,
  audioBufferToWav,
  formatTime,
  formatBytes,
} from "@/lib/audioUtils";

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

export default function AudioSpeedChangerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Speed state
  const [speed, setSpeed] = useState<number>(1.25);
  const [preservePitch, setPreservePitch] = useState<boolean>(true);

  // Preview element
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);

  // Export state
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);

  useEffect(() => {
    return () => {
      if (previewAudioUrl) URL.revokeObjectURL(previewAudioUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [previewAudioUrl, downloadUrl]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setDownloadUrl(null);
    setIsLoading(true);
    setFile(selected);

    try {
      const buffer = await decodeAudioFile(selected);
      setAudioBuffer(buffer);

      if (previewAudioUrl) URL.revokeObjectURL(previewAudioUrl);
      const url = URL.createObjectURL(selected);
      setPreviewAudioUrl(url);
    } catch {
      setError("Unable to decode the audio file.");
      setAudioBuffer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!audioBuffer || !file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const modifiedBuffer = await changeAudioSpeed(audioBuffer, speed);
      const wavBlob = audioBufferToWav(modifiedBuffer, 16);
      setOutputSize(wavBlob.size);

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(wavBlob);
      setDownloadUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change audio speed.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const estimatedNewDuration = audioBuffer ? audioBuffer.duration / speed : 0;

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".webm", ".flac"],
          }}
          label="Drop an audio file to change speed"
          description="Supports all browser audio formats (Up to 100MB)"
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
                  Original: {formatBytes(file.size)} • {formatTime(audioBuffer.duration)}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
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

          {/* Speed Controls */}
          <div className="neo-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base uppercase">
                  Playback Speed: {speed.toFixed(2)}x
                </h3>
                <p className="text-xs text-text-secondary">
                  New estimated duration: {formatTime(estimatedNewDuration)}
                </p>
              </div>
              <span className="text-2xl font-bold font-mono text-accent">
                {speed >= 1.0 ? `+${Math.round((speed - 1) * 100)}%` : `-${Math.round((1 - speed) * 100)}%`}
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0.25"
              max="3.0"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {SPEED_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setSpeed(p)}
                  className={`text-xs px-2.5 py-1 neo-border rounded-full font-heading font-semibold transition-colors ${
                    Math.abs(speed - p) < 0.01
                      ? "bg-accent text-white"
                      : "bg-surface hover:bg-accent/10"
                  }`}
                >
                  {p}x
                </button>
              ))}
            </div>

            {/* Pitch preservation toggle note */}
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-secondary">
              <label className="flex items-center gap-2 cursor-pointer font-heading font-semibold uppercase text-text">
                <input
                  type="checkbox"
                  checked={preservePitch}
                  onChange={(e) => setPreservePitch(e.target.checked)}
                  className="accent-accent w-4 h-4"
                />
                Live Pitch Correction Preview
              </label>
              <span>{preservePitch ? "Maintains musical pitch" : "Classic tape/vinyl pitch change"}</span>
            </div>
          </div>

          {/* Live Preview Player */}
          {previewAudioUrl && (
            <div className="neo-card p-4 space-y-2">
              <span className="font-heading font-bold text-xs uppercase text-text-secondary block">
                Live Preview Player (Adjusts Speed in Real-Time)
              </span>
              <audio
                controls
                src={previewAudioUrl}
                ref={(el) => {
                  if (el) {
                    el.playbackRate = speed;
                    el.preservesPitch = preservePitch;
                  }
                }}
                className="w-full neo-border rounded"
              />
            </div>
          )}

          {/* Action button */}
          <div className="text-center pt-2">
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
            >
              <Activity size={16} />
              {isProcessing ? "Processing Resampled Audio..." : "Render & Export Audio"}
            </button>
          </div>

          {/* Result Card */}
          {downloadUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Audio Speed Changed Successfully!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Exported as {speed}x speed WAV ({formatBytes(outputSize)}) • Duration: {formatTime(estimatedNewDuration)}
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
                download={`${file.name.replace(/\.[^/.]+$/, "")}_${speed}x.wav`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Speed-Adjusted Audio (.wav)
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
