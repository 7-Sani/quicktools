"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, Play, Pause, Square, RotateCcw, Info, CheckCircle2, AlertCircle } from "lucide-react";

export default function TextToSpeechTool() {
  const [text, setText] = useState("Hello! Welcome to the privacy-first Text-to-Speech tool. You can adjust the speaking speed, voice, and pitch in real-time.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        if (!selectedVoiceURI) {
          const defaultVoice = available.find((v) => v.default) || available[0];
          if (defaultVoice) setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoiceURI]);

  const handleSpeak = () => {
    if (!text.trim() || !isSupported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled") {
        console.error("SpeechSynthesis error:", e);
      }
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!isSupported) return;
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleReset = () => {
    handleStop();
    setText("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-accent" />
              Browser-Native Text-to-Speech (TTS)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Read text aloud directly on your device with native operating system voices. Zero network latency &amp; 100% privacy.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Client-Side Execution (Free)
          </div>
        </div>

        {!isSupported && (
          <div className="mt-4 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Your browser does not support the Web Speech API (window.speechSynthesis). Please use Google Chrome, Edge, Safari, or modern Firefox.</span>
          </div>
        )}
      </div>

      {/* Editor & Controls */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Text to Speak</label>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        </div>

        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to speak aloud..."
          className="w-full p-3.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{text.trim() ? text.trim().split(/\s+/).length : 0} words &bull; {text.length} characters</span>
          <span>Status: {isSpeaking ? "Speaking..." : isPaused ? "Paused" : "Idle"}</span>
        </div>

        {/* Audio Tuning Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-border">
          {/* Voice Picker */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium text-foreground mb-1">
              Voice ({voices.length} available)
            </label>
            <select
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-accent"
            >
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed / Rate */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Speed (Rate)</span>
              <span className="text-muted-foreground">{rate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {/* Pitch */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Pitch</span>
              <span className="text-muted-foreground">{pitch}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {/* Volume */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Volume</span>
              <span className="text-muted-foreground">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleSpeak}
            disabled={!isSupported || !text.trim()}
            className="flex-1 min-w-[130px] py-2.5 px-4 bg-accent text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isPaused ? "Resume Speech" : "Speak Now"}</span>
          </button>

          <button
            onClick={handlePause}
            disabled={!isSpeaking}
            className="py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground font-medium text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </button>

          <button
            onClick={handleStop}
            disabled={!isSpeaking && !isPaused}
            className="py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground font-medium text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop</span>
          </button>
        </div>
      </div>

      {/* Browser Compatibility & Privacy Callout */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Info className="w-4 h-4 text-accent" />
          Browser Compatibility &amp; Privacy Architecture
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This tool utilizes the standardized W3C <code>SpeechSynthesis</code> API. Synthesis happens locally on your computer or mobile operating system using system speech voices (Apple Siri voices on macOS/iOS, Microsoft Natural on Windows, Android TTS on mobile).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2">
          <div className="p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="font-semibold text-foreground">Google Chrome</div>
            <div className="text-emerald-500 font-medium mt-0.5">Full Support</div>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="font-semibold text-foreground">Microsoft Edge</div>
            <div className="text-emerald-500 font-medium mt-0.5">Full Support (Natural Voices)</div>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="font-semibold text-foreground">Apple Safari</div>
            <div className="text-emerald-500 font-medium mt-0.5">Full Support (macOS / iOS)</div>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="font-semibold text-foreground">Mozilla Firefox</div>
            <div className="text-emerald-500 font-medium mt-0.5">Full Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}
