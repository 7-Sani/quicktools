"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  RotateCcw,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Info,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  decodeAudioFile,
  audioBufferToWav,
  audioBufferToCompressedBlob,
  formatTime,
  formatBytes,
} from "@/lib/audioUtils";

type OutputFormat = "wav_16" | "wav_32" | "webm" | "ogg";

export default function AudioFormatConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conversion options
  const [targetFormat, setTargetFormat] = useState<OutputFormat>("wav_16");
  const [sampleRate, setSampleRate] = useState<number>(44100);
  const [channels, setChannels] = useState<number>(2);

  // Conversion state
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [convertedExt, setConvertedExt] = useState<string>("wav");

  useEffect(() => {
    return () => {
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [convertedUrl]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setConvertedUrl(null);
    setIsLoading(true);
    setFile(selected);

    try {
      const buffer = await decodeAudioFile(selected);
      setAudioBuffer(buffer);
      setSampleRate(buffer.sampleRate);
      setChannels(buffer.numberOfChannels >= 2 ? 2 : 1);
    } catch {
      setError("Unable to decode the audio file. Please ensure it is a valid audio format.");
      setAudioBuffer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!audioBuffer || !file) return;

    setIsConverting(true);
    setError(null);

    try {
      // Create resampled/channel-adjusted buffer if necessary
      let workingBuffer = audioBuffer;
      if (
        audioBuffer.sampleRate !== sampleRate ||
        audioBuffer.numberOfChannels !== channels
      ) {
        const offlineCtx = new OfflineAudioContext(
          channels,
          Math.max(1, Math.round(audioBuffer.duration * sampleRate)),
          sampleRate
        );
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start(0);
        workingBuffer = await offlineCtx.startRendering();
      }

      let blob: Blob;
      let ext = "wav";

      if (targetFormat === "wav_16") {
        blob = audioBufferToWav(workingBuffer, 16);
        ext = "wav";
      } else if (targetFormat === "wav_32") {
        blob = audioBufferToWav(workingBuffer, 32);
        ext = "wav";
      } else if (targetFormat === "webm") {
        blob = await audioBufferToCompressedBlob(workingBuffer, "audio/webm;codecs=opus");
        ext = "webm";
      } else if (targetFormat === "ogg") {
        blob = await audioBufferToCompressedBlob(workingBuffer, "audio/ogg");
        ext = "ogg";
      } else {
        blob = audioBufferToWav(workingBuffer, 16);
      }

      setConvertedSize(blob.size);
      setConvertedExt(ext);

      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Conversion failed.";
      setError(msg);
    } finally {
      setIsConverting(false);
    }
  };

  const isWebMSupported =
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported("audio/webm");
  const isOggSupported =
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported("audio/ogg");

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".webm", ".flac"],
          }}
          label="Drop an audio file to convert"
          description="Converts between browser-supported formats (Up to 100MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Decoding input audio...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Honest Formats Transparency Note */}
      <div className="neo-card p-4 bg-accent-light flex items-start gap-3">
        <Info size={18} className="text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-text font-heading uppercase tracking-wide">
            Genuine Client-Side Conversion:
          </strong>{" "}
          QuickTools never renames file extensions. Every converted file is genuinely re-encoded in your browser. Lossless WAV (16-bit / 32-bit PCM) is universally compatible across all media players, while WebM/Opus offers high compression for web streaming.
        </div>
      </div>

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
                  Source: {formatBytes(file.size)} • {formatTime(audioBuffer.duration)} •{" "}
                  {audioBuffer.numberOfChannels === 1 ? "Mono" : "Stereo"} •{" "}
                  {audioBuffer.sampleRate} Hz
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setAudioBuffer(null);
                setConvertedUrl(null);
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Choose Another
            </button>
          </div>

          {/* Conversion Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-2">
                Target Format
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as OutputFormat)}
                className="neo-input text-xs font-semibold py-2"
              >
                <option value="wav_16">WAV (16-bit PCM - Universal)</option>
                <option value="wav_32">WAV (32-bit Float - Studio)</option>
                <option value="webm" disabled={!isWebMSupported}>
                  WebM (Opus Compressed){!isWebMSupported ? " - Unsupported" : ""}
                </option>
                <option value="ogg" disabled={!isOggSupported}>
                  OGG (Opus/Vorbis){!isOggSupported ? " - Unsupported in Browser" : ""}
                </option>
              </select>
            </div>

            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-2">
                Sample Rate
              </label>
              <select
                value={sampleRate}
                onChange={(e) => setSampleRate(parseInt(e.target.value))}
                className="neo-input text-xs font-semibold py-2"
              >
                <option value={22050}>22,050 Hz (Low / Voice)</option>
                <option value={44100}>44,100 Hz (Standard CD)</option>
                <option value={48000}>48,000 Hz (Pro Audio / Video)</option>
                <option value={96000}>96,000 Hz (High-Res Studio)</option>
              </select>
            </div>

            <div className="neo-card p-4">
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-2">
                Audio Channels
              </label>
              <select
                value={channels}
                onChange={(e) => setChannels(parseInt(e.target.value))}
                className="neo-input text-xs font-semibold py-2"
              >
                <option value={2}>Stereo (2 Channels)</option>
                <option value={1}>Mono (1 Channel)</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <div className="text-center pt-2">
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
            >
              <ArrowRightLeft size={16} />
              {isConverting ? "Encoding Audio..." : "Convert Audio Now"}
            </button>
          </div>

          {/* Download Result */}
          {convertedUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Conversion Complete!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Format: {convertedExt.toUpperCase()} • Sample Rate: {sampleRate} Hz •{" "}
                    Channels: {channels === 1 ? "Mono" : "Stereo"} • Output Size:{" "}
                    {formatBytes(convertedSize)}
                  </p>
                </div>
              </div>

              <audio
                controls
                src={convertedUrl}
                className="w-full neo-border rounded"
              />

              <a
                href={convertedUrl}
                download={`${file.name.replace(/\.[^/.]+$/, "")}.${convertedExt}`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Converted Audio (.{convertedExt})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
