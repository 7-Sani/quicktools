"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Play,
  Pause,
  Download,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileAudio,
} from "lucide-react";
import {
  decodeAudioFile,
  mergeAudioBuffers,
  audioBufferToWav,
  formatTime,
  formatBytes,
  getAudioContext,
} from "@/lib/audioUtils";

interface AudioTrack {
  id: string;
  file: File;
  buffer: AudioBuffer;
}

export default function AudioMergerTool() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [crossfade, setCrossfade] = useState<number>(0);

  // Per-track preview
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const trackSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Merged output
  const [isMerging, setIsMerging] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergedBlobSize, setMergedBlobSize] = useState<number>(0);
  const [mergedDuration, setMergedDuration] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopPreview = () => {
    if (trackSourceRef.current) {
      try {
        trackSourceRef.current.stop();
      } catch {
        // ignore
      }
      trackSourceRef.current = null;
    }
    setPlayingTrackId(null);
  };

  useEffect(() => {
    return () => {
      stopPreview();
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    };
  }, [mergedUrl]);

  const handleFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setError(null);
    setIsLoading(true);

    const loadedTracks: AudioTrack[] = [];
    const errors: string[] = [];

    for (const file of fileList) {
      try {
        const buffer = await decodeAudioFile(file);
        loadedTracks.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          buffer,
        });
      } catch {
        errors.push(`Could not decode "${file.name}"`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join(". "));
    }

    if (loadedTracks.length > 0) {
      setTracks((prev) => [...prev, ...loadedTracks]);
    }

    setIsLoading(false);
  };

  const moveTrack = (index: number, direction: "up" | "down") => {
    stopPreview();
    const newTracks = [...tracks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newTracks.length) return;

    const temp = newTracks[index];
    newTracks[index] = newTracks[targetIndex];
    newTracks[targetIndex] = temp;
    setTracks(newTracks);
  };

  const removeTrack = (index: number) => {
    stopPreview();
    setTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTrackPreview = (track: AudioTrack) => {
    if (playingTrackId === track.id) {
      stopPreview();
    } else {
      stopPreview();
      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = track.buffer;
      source.connect(ctx.destination);
      trackSourceRef.current = source;
      setPlayingTrackId(track.id);

      source.start(0);
      source.onended = () => {
        setPlayingTrackId(null);
      };
    }
  };

  const handleMerge = async () => {
    if (tracks.length < 2) {
      setError("Please add at least 2 audio tracks to merge.");
      return;
    }

    stopPreview();
    setIsMerging(true);
    setError(null);

    try {
      const mergedBuffer = await mergeAudioBuffers(
        tracks.map((t) => t.buffer),
        crossfade
      );

      const wavBlob = audioBufferToWav(mergedBuffer, 16);
      setMergedBlobSize(wavBlob.size);
      setMergedDuration(mergedBuffer.duration);

      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
      const url = URL.createObjectURL(wavBlob);
      setMergedUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to merge audio files.";
      setError(msg);
    } finally {
      setIsMerging(false);
    }
  };

  const totalRawDuration = tracks.reduce((acc, t) => acc + t.buffer.duration, 0);

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.webm,.flac"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Upload size={36} className="mx-auto mb-3 text-text-secondary" />
        <p className="font-heading font-semibold text-base uppercase mb-1">
          Click or drop audio files to merge
        </p>
        <p className="text-xs text-text-secondary">
          Upload 2 or more files (MP3, WAV, OGG, M4A, AAC, FLAC)
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-accent border-r-transparent mb-2" />
          <p className="font-heading font-semibold uppercase text-xs">
            Decoding audio tracks...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {tracks.length > 0 && (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-heading font-bold text-sm uppercase block">
                Track List ({tracks.length} Files)
              </span>
              <span className="text-xs text-text-secondary">
                Cumulative Playtime: ~{formatTime(totalRawDuration, false)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-heading font-semibold uppercase flex items-center gap-2">
                Crossfade:
                <select
                  value={crossfade}
                  onChange={(e) => setCrossfade(parseFloat(e.target.value))}
                  className="neo-input text-xs py-1 px-2 w-auto"
                >
                  <option value={0}>None (0s)</option>
                  <option value={1}>1.0 second</option>
                  <option value={2}>2.0 seconds</option>
                  <option value={3}>3.0 seconds</option>
                  <option value={5}>5.0 seconds</option>
                </select>
              </label>

              <button
                onClick={() => {
                  stopPreview();
                  setTracks([]);
                  setMergedUrl(null);
                }}
                className="neo-btn neo-btn-secondary text-xs"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Tracks list */}
          <div className="space-y-2">
            {tracks.map((track, idx) => (
              <div
                key={track.id}
                className="neo-card p-3 flex items-center justify-between gap-3 neo-hover"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-mono text-xs font-bold w-6 h-6 flex items-center justify-center neo-border rounded-full bg-accent/10 text-accent shrink-0">
                    {idx + 1}
                  </span>

                  <button
                    onClick={() => toggleTrackPreview(track)}
                    className="p-1.5 neo-border rounded hover:bg-surface transition-colors shrink-0"
                    title={playingTrackId === track.id ? "Stop Preview" : "Preview Track"}
                  >
                    {playingTrackId === track.id ? (
                      <Pause size={14} className="text-accent" />
                    ) : (
                      <Play size={14} />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-semibold text-xs truncate">
                      {track.file.name}
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      {formatTime(track.buffer.duration)} •{" "}
                      {formatBytes(track.file.size)} • {track.buffer.sampleRate} Hz
                    </p>
                  </div>
                </div>

                {/* Move & Remove */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveTrack(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 neo-border rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={() => moveTrack(idx, "down")}
                    disabled={idx === tracks.length - 1}
                    className="p-1.5 neo-border rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    onClick={() => removeTrack(idx)}
                    className="p-1.5 neo-border rounded text-red-600 hover:bg-red-50"
                    title="Remove Track"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge button */}
          <div className="text-center pt-2">
            <button
              onClick={handleMerge}
              disabled={isMerging || tracks.length < 2}
              className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
            >
              <Layers size={16} />
              {isMerging
                ? "Merging Audio Files..."
                : `Merge ${tracks.length} Audio Tracks`}
            </button>
          </div>

          {/* Result */}
          {mergedUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Tracks Merged Successfully!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Total Duration: {formatTime(mergedDuration)} • Size:{" "}
                    {formatBytes(mergedBlobSize)} • Lossless 16-bit PCM WAV
                  </p>
                </div>
              </div>

              <audio
                controls
                src={mergedUrl}
                className="w-full neo-border rounded"
              />

              <a
                href={mergedUrl}
                download="merged_audio.wav"
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Merged Audio (.wav)
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
