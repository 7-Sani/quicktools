"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  RotateCcw,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Music,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  decodeAudioFile,
  audioBufferToWav,
  audioBufferToCompressedBlob,
  formatTime,
  formatBytes,
} from "@/lib/audioUtils";

type AudioFormat = "wav" | "webm";

export default function VideoToMp3Tool() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [targetFormat, setTargetFormat] = useState<AudioFormat>("wav");

  // Output
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null);
  const [extractedSize, setExtractedSize] = useState(0);

  useEffect(() => {
    return () => {
      if (extractedUrl) URL.revokeObjectURL(extractedUrl);
    };
  }, [extractedUrl]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setExtractedUrl(null);
    setIsLoading(true);
    setFile(selected);

    try {
      const buffer = await decodeAudioFile(selected);
      setAudioBuffer(buffer);
    } catch {
      setError("Could not find or decode an audio track in this video file. The video may be silent or use an unsupported audio codec.");
      setAudioBuffer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!audioBuffer || !file) return;

    setIsExtracting(true);
    setError(null);

    try {
      let blob: Blob;

      if (targetFormat === "wav") {
        blob = audioBufferToWav(audioBuffer, 16);
      } else {
        blob = await audioBufferToCompressedBlob(audioBuffer, "audio/webm;codecs=opus");
      }

      setExtractedSize(blob.size);

      if (extractedUrl) URL.revokeObjectURL(extractedUrl);
      const url = URL.createObjectURL(blob);
      setExtractedUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to extract audio track.";
      setError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "video/*": [".mp4", ".webm", ".mov", ".mkv"],
          }}
          label="Drop a video file to extract audio"
          description="Extracts crystal-clear sound from MP4, WebM, MOV (Up to 200MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Extracting audio soundtrack from video container...
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
                <FileVideo size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-sm truncate uppercase">
                  {file.name}
                </p>
                <p className="text-xs text-text-secondary">
                  Video Size: {formatBytes(file.size)} • Audio Duration: {formatTime(audioBuffer.duration)} •{" "}
                  {audioBuffer.numberOfChannels === 1 ? "Mono" : "Stereo"} • {audioBuffer.sampleRate} Hz
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setAudioBuffer(null);
                setExtractedUrl(null);
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Choose Another
            </button>
          </div>

          {/* Format selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="neo-card p-4 space-y-2">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary">
                Output Audio Format
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as AudioFormat)}
                className="neo-input text-xs font-semibold py-2"
              >
                <option value="wav">WAV (16-bit PCM - Universal Master Quality)</option>
                <option value="webm">WebM Audio (Opus Compressed)</option>
              </select>
              <p className="text-[11px] text-text-secondary">
                WAV delivers uncompressed studio sound playable in any media player or DAW.
              </p>
            </div>

            <div className="neo-card p-4 flex flex-col justify-center">
              <span className="text-xs uppercase font-heading font-semibold text-text-secondary">
                Audio Stream Details
              </span>
              <span className="text-lg font-bold font-mono">
                {audioBuffer.sampleRate} Hz • {audioBuffer.numberOfChannels} ch
              </span>
              <span className="text-[11px] text-text-secondary">
                Playtime: {formatTime(audioBuffer.duration)}
              </span>
            </div>
          </div>

          {/* Action button */}
          <div className="text-center pt-2">
            <button
              onClick={handleExtract}
              disabled={isExtracting}
              className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
            >
              <Music size={16} />
              {isExtracting ? "Extracting Soundtrack..." : "Extract Audio Now"}
            </button>
          </div>

          {/* Extracted Result Card */}
          {extractedUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Audio Soundtrack Extracted!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Exported as {targetFormat.toUpperCase()} ({formatBytes(extractedSize)})
                  </p>
                </div>
              </div>

              <audio
                controls
                src={extractedUrl}
                className="w-full neo-border rounded"
              />

              <a
                href={extractedUrl}
                download={`${file.name.replace(/\.[^/.]+$/, "")}_soundtrack.${targetFormat}`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Extracted Audio (.{targetFormat})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
