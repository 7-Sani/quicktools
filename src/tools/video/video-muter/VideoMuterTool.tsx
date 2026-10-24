"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  RotateCcw,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  FileVideo,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import {
  loadVideo,
  getBestVideoMimeType,
  formatVideoTime,
  formatBytes,
} from "@/lib/videoUtils";

export default function VideoMuterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    duration: number;
    width: number;
    height: number;
    srcUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Muting state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mutedUrl, setMutedUrl] = useState<string | null>(null);
  const [mutedSize, setMutedSize] = useState(0);
  const [mutedExt, setMutedExt] = useState("webm");

  useEffect(() => {
    return () => {
      if (videoInfo?.srcUrl) URL.revokeObjectURL(videoInfo.srcUrl);
      if (mutedUrl) URL.revokeObjectURL(mutedUrl);
    };
  }, [videoInfo, mutedUrl]);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setMutedUrl(null);
    setIsLoading(true);
    setFile(selected);

    try {
      const video = await loadVideo(selected);
      setVideoInfo({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        srcUrl: video.src,
      });
    } catch {
      setError("Unable to load video. Please ensure the file is a valid video format.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMute = async () => {
    if (!file || !videoInfo) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const renderVideo = document.createElement("video");
      renderVideo.src = videoInfo.srcUrl;
      renderVideo.muted = true; // Mute video completely
      renderVideo.playsInline = true;
      renderVideo.crossOrigin = "anonymous";

      await new Promise<void>((res) => {
        renderVideo.onloadeddata = () => res();
      });

      const width = renderVideo.videoWidth % 2 === 0 ? renderVideo.videoWidth : renderVideo.videoWidth - 1;
      const height = renderVideo.videoHeight % 2 === 0 ? renderVideo.videoHeight : renderVideo.videoHeight - 1;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas context");

      // Pure video stream with ZERO audio tracks
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
      renderVideo.currentTime = 0;
      await renderVideo.play();

      const render = () => {
        if (renderVideo.ended || renderVideo.paused) {
          if (recorder.state === "recording") recorder.stop();
          return;
        }

        ctx.drawImage(renderVideo, 0, 0, width, height);
        setProgress(Math.min(99, Math.round((renderVideo.currentTime / videoInfo.duration) * 100)));

        requestAnimationFrame(render);
      };

      render();

      const blob = await recordPromise;
      setProgress(100);
      setMutedSize(blob.size);
      setMutedExt(extension);

      if (mutedUrl) URL.revokeObjectURL(mutedUrl);
      const url = URL.createObjectURL(blob);
      setMutedUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to mute video.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploader
          onFilesSelected={handleFile}
          accept={{
            "video/*": [".mp4", ".webm", ".mov"],
          }}
          label="Drop a video to remove audio"
          description="Strips background sound and audio tracks (Up to 200MB)"
        />
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-3" />
          <p className="font-heading font-semibold uppercase text-sm">
            Loading video stream...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {videoInfo && file && (
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
                  {formatBytes(file.size)} • {formatVideoTime(videoInfo.duration)} •{" "}
                  {videoInfo.width}x{videoInfo.height}px
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setVideoInfo(null);
                setMutedUrl(null);
              }}
              className="neo-btn neo-btn-secondary text-xs"
            >
              <RotateCcw size={14} />
              Choose Another
            </button>
          </div>

          {/* Original Player Preview */}
          <div className="neo-card p-4 space-y-2">
            <span className="font-heading font-bold text-xs uppercase text-text-secondary block">
              Original Video (With Audio)
            </span>
            <video
              controls
              src={videoInfo.srcUrl}
              className="w-full max-h-[340px] neo-border rounded bg-black mx-auto"
            />
          </div>

          {/* Action button */}
          <div className="space-y-3">
            <div className="text-center">
              <button
                onClick={handleMute}
                disabled={isProcessing}
                className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
              >
                <VolumeX size={16} />
                {isProcessing ? `Stripping Audio (${progress}%)...` : "Mute Video (Remove Audio Track)"}
              </button>
            </div>

            {isProcessing && (
              <div className="neo-card p-4 space-y-2">
                <div className="flex justify-between text-xs font-heading font-bold uppercase">
                  <span>Re-encoding video with zero audio tracks...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-border/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Result Card */}
          {mutedUrl && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-base uppercase">
                    Audio Track Removed!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Exported as silent video ({formatBytes(mutedSize)}) • 0 audio streams
                  </p>
                </div>
              </div>

              <video
                controls
                src={mutedUrl}
                className="w-full max-h-[340px] neo-border rounded bg-black mx-auto"
              />

              <a
                href={mutedUrl}
                download={`${file.name.replace(/\.[^/.]+$/, "")}_muted.${mutedExt}`}
                className="neo-btn neo-btn-primary text-xs block text-center"
              >
                <Download size={14} />
                Download Muted Video (.{mutedExt})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
