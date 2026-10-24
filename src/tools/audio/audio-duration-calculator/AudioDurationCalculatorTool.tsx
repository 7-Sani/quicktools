"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Clock,
  Trash2,
  Download,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import {
  decodeAudioFile,
  formatTime,
  formatBytes,
} from "@/lib/audioUtils";

interface TrackItem {
  id: string;
  name: string;
  size: number;
  duration: number;
  channels: number;
  sampleRate: number;
}

export default function AudioDurationCalculatorTool() {
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    setError(null);
    setIsLoading(true);

    const loaded: TrackItem[] = [];
    const errors: string[] = [];

    for (const file of list) {
      try {
        const buffer = await decodeAudioFile(file);
        loaded.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          duration: buffer.duration,
          channels: buffer.numberOfChannels,
          sampleRate: buffer.sampleRate,
        });
      } catch {
        errors.push(`Could not read duration for "${file.name}"`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join(". "));
    }

    if (loaded.length > 0) {
      setTracks((prev) => [...prev, ...loaded]);
    }

    setIsLoading(false);
  };

  const removeTrack = (index: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setTracks([]);
    setError(null);
  };

  // Calculations
  const totalDuration = tracks.reduce((acc, t) => acc + t.duration, 0);
  const totalSize = tracks.reduce((acc, t) => acc + t.size, 0);
  const avgDuration = tracks.length > 0 ? totalDuration / tracks.length : 0;

  const sortedByDuration = [...tracks].sort((a, b) => b.duration - a.duration);
  const longestTrack = sortedByDuration[0];
  const shortestTrack = sortedByDuration[sortedByDuration.length - 1];

  const formatTotalTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const copySummary = () => {
    if (tracks.length === 0) return;
    const summary = `Audio Playlist Duration Summary
Total Tracks: ${tracks.length}
Total Duration: ${formatTotalTime(totalDuration)} (${totalDuration.toFixed(1)} seconds)
Average Track: ${formatTime(avgDuration)}
Total Size: ${formatBytes(totalSize)}

Track Breakdown:
${tracks
  .map(
    (t, i) =>
      `${i + 1}. ${t.name} - ${formatTime(t.duration)} (${formatBytes(t.size)})`
  )
  .join("\n")}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCsv = () => {
    if (tracks.length === 0) return;
    let csv = "Track Number,File Name,Duration (sec),Duration (mm:ss),File Size (bytes),Sample Rate,Channels\n";
    tracks.forEach((t, i) => {
      csv += `"${i + 1}","${t.name.replace(/"/g, '""')}","${t.duration.toFixed(
        2
      )}","${formatTime(t.duration)}","${t.size}","${t.sampleRate}","${
        t.channels
      }"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "playlist_duration_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
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
          Upload audio tracks or batch playlist
        </p>
        <p className="text-xs text-text-secondary">
          Supports multi-file upload of MP3, WAV, FLAC, M4A, OGG
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-accent border-r-transparent mb-2" />
          <p className="font-heading font-semibold uppercase text-xs">
            Calculating track durations...
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
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="neo-card p-4">
              <span className="text-[11px] font-heading font-bold uppercase text-text-secondary block">
                Total Cumulative Time
              </span>
              <span className="text-2xl font-bold font-mono text-accent">
                {formatTotalTime(totalDuration)}
              </span>
              <span className="text-xs text-text-secondary block mt-0.5">
                {totalDuration.toFixed(1)} seconds
              </span>
            </div>

            <div className="neo-card p-4">
              <span className="text-[11px] font-heading font-bold uppercase text-text-secondary block">
                Total Tracks & Size
              </span>
              <span className="text-2xl font-bold font-mono">
                {tracks.length} Files
              </span>
              <span className="text-xs text-text-secondary block mt-0.5">
                {formatBytes(totalSize)} total
              </span>
            </div>

            <div className="neo-card p-4">
              <span className="text-[11px] font-heading font-bold uppercase text-text-secondary block">
                Average Track Length
              </span>
              <span className="text-2xl font-bold font-mono">
                {formatTime(avgDuration)}
              </span>
              <span className="text-xs text-text-secondary block mt-0.5">
                ~{avgDuration.toFixed(1)}s per track
              </span>
            </div>

            <div className="neo-card p-4">
              <span className="text-[11px] font-heading font-bold uppercase text-text-secondary block">
                Longest / Shortest
              </span>
              <span className="text-sm font-bold font-mono block">
                Max: {longestTrack ? formatTime(longestTrack.duration) : "-"}
              </span>
              <span className="text-xs text-text-secondary block mt-0.5 font-mono">
                Min: {shortestTrack ? formatTime(shortestTrack.duration) : "-"}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={copySummary}
                className="neo-btn neo-btn-secondary text-xs"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? "Copied Report" : "Copy Summary"}
              </button>

              <button
                onClick={downloadCsv}
                className="neo-btn neo-btn-secondary text-xs"
              >
                <FileSpreadsheet size={14} />
                Export CSV
              </button>
            </div>

            <button
              onClick={clearAll}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Clear Playlist
            </button>
          </div>

          {/* Track Listing Table */}
          <div className="neo-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b-2 border-border bg-accent/5 font-heading font-bold uppercase text-text">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Track Name</th>
                    <th className="p-3 text-right">Duration</th>
                    <th className="p-3 text-right">Size</th>
                    <th className="p-3 text-right hidden sm:table-cell">Sample Rate</th>
                    <th className="p-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tracks.map((track, i) => (
                    <tr key={track.id} className="hover:bg-accent/5 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-text-secondary">
                        {i + 1}
                      </td>
                      <td className="p-3 font-semibold truncate max-w-[200px] sm:max-w-xs">
                        {track.name}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-accent">
                        {formatTime(track.duration)}
                      </td>
                      <td className="p-3 text-right text-text-secondary">
                        {formatBytes(track.size)}
                      </td>
                      <td className="p-3 text-right text-text-secondary hidden sm:table-cell font-mono">
                        {track.sampleRate} Hz
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeTrack(i)}
                          className="p-1 rounded text-red-600 hover:bg-red-50"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
