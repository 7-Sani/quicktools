"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Copy,
  Check,
  Download,
  FileAudio,
  AlertCircle,
  Tag,
  Disc3,
  Calendar,
  Layers,
  Clock,
  Radio,
  ImageIcon,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  parseAudioMetadata,
  AudioMetadata,
  formatTime,
  formatBytes,
} from "@/lib/audioUtils";

export default function AudioMetadataViewerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setIsLoading(true);
    setFile(selected);

    try {
      const meta = await parseAudioMetadata(selected);
      setMetadata(meta);
    } catch {
      setError("Failed to extract metadata from this audio file.");
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAsJson = () => {
    if (!metadata) return;
    const jsonStr = JSON.stringify(
      {
        fileName: metadata.fileName,
        fileSize: metadata.fileSize,
        format: metadata.formatName,
        title: metadata.title || null,
        artist: metadata.artist || null,
        album: metadata.album || null,
        year: metadata.year || null,
        genre: metadata.genre || null,
        trackNumber: metadata.trackNumber || null,
        durationSeconds: metadata.duration || null,
        durationFormatted: metadata.duration ? formatTime(metadata.duration) : null,
        sampleRate: metadata.sampleRate || null,
        channels: metadata.channels || null,
        bitrateKbps: metadata.bitrateKbps || null,
      },
      null,
      2
    );

    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".flac"],
          }}
          label="Drop an audio file to inspect metadata"
          description="Extracts ID3 tags, album art, sample rate, bitrate & technical specs"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Inspecting audio headers & tags...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {metadata && file && (
        <div className="space-y-6">
          {/* Header */}
          <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center neo-border rounded-lg bg-accent/10 text-accent shrink-0">
                <FileAudio size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-sm truncate uppercase">
                  {metadata.fileName}
                </p>
                <p className="text-xs text-text-secondary">
                  Format: {metadata.formatName} • Size: {formatBytes(metadata.fileSize)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAsJson}
                className="neo-btn neo-btn-secondary text-xs"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? "Copied JSON" : "Copy JSON"}
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setMetadata(null);
                }}
                className="neo-btn neo-btn-secondary text-xs"
              >
                <RotateCcw size={14} />
                Inspect Another
              </button>
            </div>
          </div>

          {/* Main Grid: Album Art & Track Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Album Art Card */}
            <div className="neo-card p-6 flex flex-col items-center justify-center text-center">
              {metadata.albumArtUrl ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="relative border-2 border-border rounded-lg overflow-hidden shadow-md max-w-[200px]">
                    <img
                      src={metadata.albumArtUrl}
                      alt="Album Artwork"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <span className="text-xs text-text-secondary font-heading font-semibold uppercase">
                    Embedded Album Artwork
                  </span>
                  <a
                    href={metadata.albumArtUrl}
                    download={`${file.name.replace(/\.[^/.]+$/, "")}_cover.jpg`}
                    className="neo-btn neo-btn-secondary text-[11px] py-1 px-3 w-full"
                  >
                    <Download size={12} />
                    Download Cover
                  </a>
                </div>
              ) : (
                <div className="py-8 space-y-2 text-text-secondary">
                  <ImageIcon size={48} className="mx-auto opacity-30" />
                  <p className="font-heading font-semibold text-xs uppercase">
                    No Album Art Found
                  </p>
                  <p className="text-[11px]">
                    This file does not have an embedded APIC picture frame.
                  </p>
                </div>
              )}
            </div>

            {/* Tags & ID3 Metadata */}
            <div className="md:col-span-2 neo-card p-6 space-y-4">
              <h3 className="font-heading font-bold text-base uppercase border-b border-border pb-2">
                ID3 / Container Tags
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Tag size={12} /> Title
                  </span>
                  <p className="font-bold text-sm">
                    {metadata.title || <span className="text-text-secondary font-normal italic">Unknown</span>}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Radio size={12} /> Artist
                  </span>
                  <p className="font-bold text-sm">
                    {metadata.artist || <span className="text-text-secondary font-normal italic">Unknown</span>}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Disc3 size={12} /> Album
                  </span>
                  <p className="font-bold text-sm">
                    {metadata.album || <span className="text-text-secondary font-normal italic">Unknown</span>}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Calendar size={12} /> Release Year
                  </span>
                  <p className="font-bold text-sm">
                    {metadata.year || <span className="text-text-secondary font-normal italic">Unknown</span>}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Layers size={12} /> Genre
                  </span>
                  <p className="font-bold text-sm">
                    {metadata.genre || <span className="text-text-secondary font-normal italic">Unknown</span>}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-heading font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Tag size={12} /> Track Number
                  </span>
                  <p className="font-bold text-sm">
                    {metadata.trackNumber || <span className="text-text-secondary font-normal italic">Unknown</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Audio Specs */}
          <div className="neo-card p-6 space-y-4">
            <h3 className="font-heading font-bold text-base uppercase border-b border-border pb-2">
              Technical Audio Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="neo-card p-4 text-center">
                <Clock size={18} className="mx-auto mb-1 text-accent" />
                <span className="text-[11px] font-heading uppercase text-text-secondary font-semibold block">
                  Duration
                </span>
                <span className="text-lg font-bold font-mono">
                  {metadata.duration ? formatTime(metadata.duration) : "N/A"}
                </span>
              </div>

              <div className="neo-card p-4 text-center">
                <Radio size={18} className="mx-auto mb-1 text-accent" />
                <span className="text-[11px] font-heading uppercase text-text-secondary font-semibold block">
                  Sample Rate
                </span>
                <span className="text-lg font-bold font-mono">
                  {metadata.sampleRate ? `${metadata.sampleRate} Hz` : "N/A"}
                </span>
              </div>

              <div className="neo-card p-4 text-center">
                <Layers size={18} className="mx-auto mb-1 text-accent" />
                <span className="text-[11px] font-heading uppercase text-text-secondary font-semibold block">
                  Channels
                </span>
                <span className="text-lg font-bold font-mono">
                  {metadata.channels
                    ? metadata.channels === 1
                      ? "Mono (1ch)"
                      : "Stereo (2ch)"
                    : "N/A"}
                </span>
              </div>

              <div className="neo-card p-4 text-center">
                <Tag size={18} className="mx-auto mb-1 text-accent" />
                <span className="text-[11px] font-heading uppercase text-text-secondary font-semibold block">
                  Est. Bitrate
                </span>
                <span className="text-lg font-bold font-mono">
                  {metadata.bitrateKbps ? `${metadata.bitrateKbps} kbps` : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
