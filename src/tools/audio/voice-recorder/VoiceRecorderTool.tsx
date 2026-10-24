"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Radio,
} from "lucide-react";
import {
  audioBufferToWav,
  decodeAudioFile,
  formatTime,
  formatBytes,
  getAudioContext,
} from "@/lib/audioUtils";

type RecordState = "idle" | "recording" | "paused" | "stopped";

export default function VoiceRecorderTool() {
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Result
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [wavBlob, setWavBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isConvertingWav, setIsConvertingWav] = useState<boolean>(false);

  // Stream & Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualizerCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const cleanupRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (visualizerCtxRef.current && visualizerCtxRef.current.state !== "closed") {
      visualizerCtxRef.current.close().catch(() => {});
      visualizerCtxRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupRecording();
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    };
  }, [cleanupRecording, recordedAudioUrl]);

  // Visualizer loop
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#F7F7F5";
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.9;

        // Gradient from blue to emerald
        const hue = 220 - (dataArray[i] / 255) * 80;
        ctx.fillStyle = `hsl(${hue}, 90%, 55%)`;

        ctx.fillRect(x, height - barHeight, Math.max(1, barWidth - 1), barHeight);
        x += barWidth;
        if (x > width) break;
      }
    };

    render();
  }, []);

  // Start recording
  const startRecording = async () => {
    setError(null);
    setPermissionDenied(false);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setError("Audio recording is not supported in this browser environment.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Setup audio analyzer for visualizer
      const audioCtx = getAudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Choose supported mimeType
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/ogg")
        ? "audio/ogg"
        : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        cleanupRecording();
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setRecordedBlob(blob);

        if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);

        // Convert to WAV for universal compatibility
        setIsConvertingWav(true);
        try {
          const buffer = await decodeAudioFile(blob);
          setAudioBuffer(buffer);
          const wav = audioBufferToWav(buffer, 16);
          setWavBlob(wav);
        } catch {
          // If browser fails decoding WebM to buffer, user still has the raw recording
        } finally {
          setIsConvertingWav(false);
        }

        setRecordState("stopped");
      };

      recorder.start(100);
      setRecordState("recording");
      setElapsedSeconds(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);

      // Start visualizer
      drawVisualizer();
    } catch (err: unknown) {
      if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
        setPermissionDenied(true);
        setError("Microphone permission was denied. Please allow microphone access in your browser settings to record.");
      } else {
        setError("Failed to access microphone. Please check that a microphone is connected.");
      }
      setRecordState("idle");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordState === "recording") {
      mediaRecorderRef.current.pause();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setRecordState("paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordState === "paused") {
      mediaRecorderRef.current.resume();
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
      setRecordState("recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordState !== "idle") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  const resetRecording = () => {
    cleanupRecording();
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordState("idle");
    setRecordedBlob(null);
    setWavBlob(null);
    setRecordedAudioUrl(null);
    setAudioBuffer(null);
    setElapsedSeconds(0);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">{error}</p>
            {permissionDenied && (
              <p className="mt-1 text-xs opacity-90">
                To fix: Click the lock or camera/mic icon in your browser address bar and switch microphone access to &quot;Allow&quot;.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Recording Console */}
      <div className="neo-card p-6 sm:p-8 text-center space-y-6">
        {/* State Indicator */}
        <div className="flex items-center justify-center gap-2">
          {recordState === "recording" && (
            <span className="flex items-center gap-2 px-3 py-1 neo-border rounded-full bg-red-100 text-red-700 text-xs font-heading font-bold uppercase tracking-wider animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
              Recording In Progress
            </span>
          )}
          {recordState === "paused" && (
            <span className="px-3 py-1 neo-border rounded-full bg-yellow-100 text-yellow-800 text-xs font-heading font-bold uppercase tracking-wider">
              Recording Paused
            </span>
          )}
          {recordState === "idle" && (
            <span className="px-3 py-1 neo-border rounded-full bg-surface text-text-secondary text-xs font-heading font-bold uppercase tracking-wider">
              Ready to Record
            </span>
          )}
          {recordState === "stopped" && (
            <span className="px-3 py-1 neo-border rounded-full bg-green-100 text-green-800 text-xs font-heading font-bold uppercase tracking-wider">
              Recording Complete
            </span>
          )}
        </div>

        {/* Live Timer Display */}
        <div>
          <span className="text-5xl sm:text-6xl font-bold font-mono tracking-tight">
            {formatTime(elapsedSeconds, false)}
          </span>
          <p className="text-xs text-text-secondary mt-1 uppercase font-heading font-semibold">
            {recordState === "recording"
              ? "Live Elapsed Time"
              : recordState === "stopped"
              ? `Total Length: ${formatTime(elapsedSeconds, false)}`
              : "00:00 (HH:MM)"}
          </p>
        </div>

        {/* Live Audio Visualizer Canvas */}
        <div className="relative border-2 border-border rounded-lg overflow-hidden bg-bg max-w-lg mx-auto">
          <canvas
            ref={canvasRef}
            width={600}
            height={100}
            className="w-full h-24 block"
          />
          {recordState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-text-secondary uppercase font-heading font-semibold bg-bg/80">
              Microphone audio visualizer will activate during recording
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {recordState === "idle" && (
            <button
              onClick={startRecording}
              className="neo-btn neo-btn-primary px-6 py-3 text-sm flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <Mic size={18} />
              Start Recording
            </button>
          )}

          {recordState === "recording" && (
            <>
              <button
                onClick={pauseRecording}
                className="neo-btn neo-btn-secondary px-5 py-2.5 text-xs flex items-center gap-2"
              >
                <Pause size={16} />
                Pause
              </button>
              <button
                onClick={stopRecording}
                className="neo-btn neo-btn-primary px-6 py-2.5 text-xs flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <Square size={16} />
                Finish Recording
              </button>
            </>
          )}

          {recordState === "paused" && (
            <>
              <button
                onClick={resumeRecording}
                className="neo-btn neo-btn-primary px-5 py-2.5 text-xs flex items-center gap-2"
              >
                <Play size={16} />
                Resume
              </button>
              <button
                onClick={stopRecording}
                className="neo-btn neo-btn-secondary px-5 py-2.5 text-xs flex items-center gap-2"
              >
                <Square size={16} />
                Finish
              </button>
            </>
          )}

          {recordState === "stopped" && (
            <button
              onClick={resetRecording}
              className="neo-btn neo-btn-secondary px-5 py-2.5 text-xs flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Record Another
            </button>
          )}
        </div>
      </div>

      {/* Playback & Export Card */}
      {recordState === "stopped" && recordedAudioUrl && (
        <div className="neo-card p-6 bg-accent/5 border-accent space-y-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-accent shrink-0" />
            <div>
              <h3 className="font-heading font-bold text-base uppercase">
                Recording Ready!
              </h3>
              <p className="text-xs text-text-secondary">
                Duration: {formatTime(elapsedSeconds, false)} • Processed 100% locally in your browser
              </p>
            </div>
          </div>

          {/* In-browser playback preview */}
          <audio
            controls
            src={recordedAudioUrl}
            className="w-full neo-border rounded"
          />

          {/* Download Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {wavBlob && (
              <a
                href={URL.createObjectURL(wavBlob)}
                download={`voice_recording_${Date.now()}.wav`}
                className="neo-btn neo-btn-primary text-xs flex items-center justify-center gap-2 py-3"
              >
                <Download size={14} />
                Download Lossless WAV ({formatBytes(wavBlob.size)})
              </a>
            )}

            {recordedBlob && (
              <a
                href={recordedAudioUrl}
                download={`voice_recording_${Date.now()}.webm`}
                className="neo-btn neo-btn-secondary text-xs flex items-center justify-center gap-2 py-3"
              >
                <Download size={14} />
                Download WebM ({formatBytes(recordedBlob.size)})
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
