"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Play,
  Pause,
} from "lucide-react";
import {
  loadVideo,
  getBestVideoMimeType,
  formatVideoTime,
  formatBytes,
} from "@/lib/videoUtils";

interface VideoItem {
  id: string;
  file: File;
  duration: number;
  width: number;
  height: number;
  srcUrl: string;
}

export default function VideoMergerTool() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Previewing item
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  // Processing state
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [currentMergeIdx, setCurrentMergeIdx] = useState(0);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergedSize, setMergedSize] = useState(0);
  const [mergedExt, setMergedExt] = useState("webm");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.srcUrl));
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    };
  }, [items, mergedUrl]);

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    setError(null);
    setIsLoading(true);

    const loaded: VideoItem[] = [];
    const errors: string[] = [];

    for (const f of list) {
      try {
        const video = await loadVideo(f);
        loaded.push({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          srcUrl: video.src,
        });
      } catch {
        errors.push(`Could not read video "${f.name}"`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join(". "));
    }

    if (loaded.length > 0) {
      setItems((prev) => [...prev, ...loaded]);
    }

    setIsLoading(false);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const item = items[index];
    if (item) URL.revokeObjectURL(item.srcUrl);
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      setError("Please add at least 2 video clips to merge.");
      return;
    }

    setIsMerging(true);
    setMergeProgress(0);
    setError(null);

    try {
      // Base canvas dimensions on the first video
      let targetW = items[0].width;
      let targetH = items[0].height;
      targetW = targetW % 2 === 0 ? targetW : targetW - 1;
      targetH = targetH % 2 === 0 ? targetH : targetH - 1;

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas context");

      const stream = canvas.captureStream(30);
      const { mimeType, extension } = getBestVideoMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const recordPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        recorder.onerror = (e) => reject(e);
      });

      recorder.start(100);

      const totalDuration = items.reduce((acc, it) => acc + it.duration, 0);
      let cumulativeElapsed = 0;

      // Play through each item sequentially
      for (let i = 0; i < items.length; i++) {
        setCurrentMergeIdx(i);
        const item = items[i];

        const video = document.createElement("video");
        video.src = item.srcUrl;
        video.playsInline = true;
        video.muted = false;
        video.crossOrigin = "anonymous";

        await new Promise<void>((res) => {
          video.onloadeddata = () => res();
        });

        video.currentTime = 0;
        await video.play();

        await new Promise<void>((res) => {
          const render = () => {
            if (video.ended || video.paused) {
              cumulativeElapsed += item.duration;
              res();
              return;
            }

            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, targetW, targetH);

            // Fit video into canvas with aspect ratio
            const scale = Math.min(targetW / video.videoWidth, targetH / video.videoHeight);
            const w = video.videoWidth * scale;
            const h = video.videoHeight * scale;
            const x = (targetW - w) / 2;
            const y = (targetH - h) / 2;

            ctx.drawImage(video, x, y, w, h);

            const totalCurrent = cumulativeElapsed + video.currentTime;
            setMergeProgress(Math.min(99, Math.round((totalCurrent / totalDuration) * 100)));

            requestAnimationFrame(render);
          };

          render();
        });
      }

      if (recorder.state === "recording") recorder.stop();

      const blob = await recordPromise;
      setMergeProgress(100);
      setMergedSize(blob.size);
      setMergedExt(extension);

      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to merge videos.";
      setError(msg);
    } finally {
      setIsMerging(false);
    }
  };

  const totalDuration = items.reduce((acc, it) => acc + it.duration, 0);

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,.mp4,.webm,.mov"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Upload size={36} className="mx-auto mb-3 text-text-secondary" />
        <p className="font-heading font-semibold text-base uppercase mb-1">
          Click or drop video clips to merge
        </p>
        <p className="text-xs text-text-secondary">
          Upload 2 or more videos (MP4, WebM, MOV)
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-accent border-r-transparent mb-2" />
          <p className="font-heading font-semibold uppercase text-xs">
            Inspecting video tracks...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-heading font-bold text-sm uppercase block">
                Video Clips ({items.length} Files)
              </span>
              <span className="text-xs text-text-secondary">
                Combined Playtime: ~{formatVideoTime(totalDuration)}
              </span>
            </div>

            <button
              onClick={() => {
                items.forEach((it) => URL.revokeObjectURL(it.srcUrl));
                setItems([]);
                setMergedUrl(null);
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              Clear All
            </button>
          </div>

          {/* Video List */}
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="neo-card p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 neo-hover"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-mono text-xs font-bold w-6 h-6 flex items-center justify-center neo-border rounded-full bg-accent/10 text-accent shrink-0">
                    {idx + 1}
                  </span>

                  <button
                    onClick={() =>
                      setActivePreviewId(activePreviewId === item.id ? null : item.id)
                    }
                    className="p-1.5 neo-border rounded hover:bg-surface transition-colors shrink-0"
                    title={activePreviewId === item.id ? "Close Preview" : "Preview Video"}
                  >
                    {activePreviewId === item.id ? (
                      <Pause size={14} className="text-accent" />
                    ) : (
                      <Play size={14} />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-semibold text-xs truncate">
                      {item.file.name}
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      {formatVideoTime(item.duration)} • {item.width}x{item.height}px •{" "}
                      {formatBytes(item.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveItem(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 neo-border rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={() => moveItem(idx, "down")}
                    disabled={idx === items.length - 1}
                    className="p-1.5 neo-border rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    onClick={() => removeItem(idx)}
                    className="p-1.5 neo-border rounded text-red-600 hover:bg-red-50"
                    title="Remove Clip"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Inline Preview */}
                {activePreviewId === item.id && (
                  <div className="w-full pt-2">
                    <video
                      controls
                      autoPlay
                      src={item.srcUrl}
                      className="w-full max-h-48 neo-border rounded bg-black"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Merge Action */}
          <div className="space-y-3">
            <div className="text-center">
              <button
                onClick={handleMerge}
                disabled={isMerging || items.length < 2}
                className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
              >
                <Layers size={16} />
                {isMerging
                  ? `Merging Video ${currentMergeIdx + 1}/${items.length} (${mergeProgress}%)...`
                  : `Merge ${items.length} Video Clips`}
              </button>
            </div>

            {isMerging && (
              <div className="neo-card p-4 space-y-2">
                <div className="flex justify-between text-xs font-heading font-bold uppercase">
                  <span>Merging clip {currentMergeIdx + 1} of {items.length}...</span>
                  <span>{mergeProgress}%</span>
                </div>
                <div className="w-full bg-border/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-150"
                    style={{ width: `${mergeProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Result Card */}
          {mergedUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Videos Merged Successfully!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Total Duration: {formatVideoTime(totalDuration)} • Output Size: {formatBytes(mergedSize)}
                  </p>
                </div>
              </div>

              <video
                controls
                src={mergedUrl}
                className="w-full max-h-[340px] neo-border rounded bg-black mx-auto"
              />

              <a
                href={mergedUrl}
                download={`merged_video.${mergedExt}`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Merged Video (.{mergedExt})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
