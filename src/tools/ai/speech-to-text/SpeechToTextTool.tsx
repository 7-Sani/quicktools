"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Copy, Check, RotateCcw, Download, Info, AlertCircle, CheckCircle2 } from "lucide-react";

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

const LANGUAGES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "es-ES", name: "Spanish (Spain)" },
  { code: "fr-FR", name: "French (France)" },
  { code: "de-DE", name: "German (Germany)" },
  { code: "hi-IN", name: "Hindi (India)" },
  { code: "zh-CN", name: "Chinese (Mandarin)" },
  { code: "ja-JP", name: "Japanese" },
  { code: "pt-BR", name: "Portuguese (Brazil)" },
  { code: "it-IT", name: "Italian" },
];

export default function SpeechToTextTool() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [continuous, setContinuous] = useState(true);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as unknown as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        setIsSupported(false);
      }
    }
  }, []);

  const startListening = () => {
    setErrorMsg(null);
    if (typeof window === "undefined") return;

    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMsg("Web Speech Recognition is not supported by your current browser. Please try Google Chrome, Microsoft Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = language;
      recognition.continuous = continuous;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + " ";
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalChunk) {
          setTranscript((prev) => (prev ? `${prev.trim()} ${finalChunk.trim()}` : finalChunk.trim()));
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMsg("Microphone permission denied. Please allow microphone access in your browser settings to dictate speech.");
        } else if (event.error === "no-speech") {
          // Normal timeout if user was silent
        } else {
          setErrorMsg(`Recognition error: ${event.error}`);
        }
        setIsRecording(false);
        setInterimText("");
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Could not initialize microphone recognition");
      setIsRecording(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
      }
      setIsRecording(false);
      setInterimText("");
    }
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setTranscript("");
    setInterimText("");
    setErrorMsg(null);
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Mic className="w-5 h-5 text-accent" />
              Speech-to-Text Dictation
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Transcribe speech to text directly via your device microphone using browser-native Web Speech Recognition.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Client-Side Dictation (Free)
          </div>
        </div>

        {!isSupported && (
          <div className="mt-4 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Your browser doesn&apos;t support the Web Speech Recognition API. Google Chrome, Microsoft Edge, and Safari have full support.
            </span>
          </div>
        )}
      </div>

      {/* Main Dictation Console */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        {/* Settings Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Spoken Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isRecording}
                className="p-1.5 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-accent"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none text-muted-foreground">
                <input
                  type="checkbox"
                  checked={continuous}
                  onChange={(e) => setContinuous(e.target.checked)}
                  disabled={isRecording}
                  className="rounded border-border"
                />
                <span>Continuous Dictation</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              disabled={isRecording || (!transcript && !interimText)}
              className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
            <button
              onClick={handleCopy}
              disabled={!transcript}
              className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-40 flex items-center gap-1"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              Copy
            </button>
            <button
              onClick={handleDownload}
              disabled={!transcript}
              className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-40 flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download .TXT
            </button>
          </div>
        </div>

        {/* Big Record Button */}
        <div className="flex flex-col items-center justify-center py-6 bg-muted/15 rounded-xl border border-dashed border-border/80">
          <button
            onClick={isRecording ? stopListening : startListening}
            disabled={!isSupported}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isRecording
                ? "bg-destructive text-white animate-pulse ring-8 ring-destructive/20"
                : "bg-accent text-white hover:opacity-90 ring-4 ring-accent/15"
            } disabled:opacity-40`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <div className="mt-3 text-center">
            <span className="text-sm font-semibold text-foreground">
              {isRecording ? "Listening to your microphone..." : "Click microphone to start transcribing"}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRecording ? "Speak clearly into your mic. Click again to stop." : "Audio is transcribed natively by your browser."}
            </p>
          </div>
        </div>

        {/* Transcript Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Transcript</span>
            <span>{wordCount} words &bull; {transcript.length} characters</span>
          </div>

          <div className="min-h-[160px] p-4 rounded-lg bg-background border border-input text-sm leading-relaxed font-mono whitespace-pre-wrap focus-within:ring-2 focus-within:ring-ring">
            {transcript ? (
              <span>
                {transcript}
                {interimText && <span className="text-muted-foreground/60 italic"> {interimText}</span>}
              </span>
            ) : interimText ? (
              <span className="text-muted-foreground/60 italic">{interimText}</span>
            ) : (
              <span className="text-muted-foreground/40 italic">Transcribed words will appear here in real-time as you speak...</span>
            )}
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Microphone Notice</p>
            <p className="text-xs text-destructive/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Browser Compatibility Matrix */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Info className="w-4 h-4 text-accent" />
          Browser Support &amp; Permissions
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Speech Recognition relies on the browser standard <code>webkitSpeechRecognition</code> or <code>SpeechRecognition</code>. When prompted, you must grant microphone permissions.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div className="p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="font-semibold text-foreground">Google Chrome</div>
            <div className="text-emerald-500 font-medium mt-0.5">Native Support</div>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="font-semibold text-foreground">Microsoft Edge</div>
            <div className="text-emerald-500 font-medium mt-0.5">Native Support</div>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="font-semibold text-foreground">Apple Safari</div>
            <div className="text-emerald-500 font-medium mt-0.5">iOS 14.5+ &amp; macOS</div>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="font-semibold text-foreground">Mozilla Firefox</div>
            <div className="text-amber-500 font-medium mt-0.5">Limited / Experimental</div>
          </div>
        </div>
      </div>
    </div>
  );
}
