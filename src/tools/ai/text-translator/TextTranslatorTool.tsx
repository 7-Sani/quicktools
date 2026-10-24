"use client";

import React, { useState } from "react";
import { Languages, Copy, Check, RotateCcw, ArrowRightLeft, AlertCircle, Info, Sparkles } from "lucide-react";

const LANGUAGES = [
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "it", name: "Italian (Italiano)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "ru", name: "Russian (Русский)" },
  { code: "zh", name: "Chinese Simplified (中文)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "ko", name: "Korean (한국어)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "nl", name: "Dutch (Nederlands)" },
  { code: "pl", name: "Polish (Polski)" },
  { code: "tr", name: "Turkish (Türkçe)" },
  { code: "vi", name: "Vietnamese (Tiếng Việt)" },
  { code: "th", name: "Thai (ไทย)" },
  { code: "id", name: "Indonesian (Bahasa Indonesia)" },
  { code: "el", name: "Greek (Ελληνικά)" },
  { code: "sv", name: "Swedish (Svenska)" },
  { code: "da", name: "Danish (Dansk)" },
  { code: "fi", name: "Finnish (Suomi)" },
  { code: "he", name: "Hebrew (עברית)" },
  { code: "cs", name: "Czech (Čeština)" },
  { code: "en", name: "English" },
];

const SAMPLE_TEXT = `Welcome to our platform! We provide lightning-fast, privacy-conscious productivity utilities for developers, writers, students, and businesses worldwide.`;

export default function TextTranslatorTool() {
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setErrorMsg("Please enter text to translate.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const sourceName = sourceLang === "auto" ? "the automatically detected source language" : LANGUAGES.find((l) => l.code === sourceLang)?.name || sourceLang;
    const targetName = LANGUAGES.find((l) => l.code === targetLang)?.name || targetLang;

    try {
      const response = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Translate the following text from ${sourceName} into ${targetName}. Preserve formatting, nuance, and terminology accurately without adding conversational commentary:\n\n${inputText}`,
          systemPrompt: "You are a professional multilingual translator. Provide strictly the accurate, natural translation without introductory greetings or meta-text.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.details ? `${data.error}: ${data.details}` : data.error || "Translation request failed");
        setTranslatedText("");
      } else {
        setTranslatedText(data.result);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to connect to translation service.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang === "auto") {
      setSourceLang(targetLang);
      setTargetLang("en");
    } else {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
    setErrorMsg(null);
  };

  const handleReset = () => {
    setInputText("");
    setTranslatedText("");
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Languages className="w-5 h-5 text-accent" />
          AI Text Translator
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Translate text across 25+ global languages while preserving tone, idiom, and technical terms.
        </p>

        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/60">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span>
            <strong>Requirement:</strong> Powered by server AI models (OpenAI, Gemini, or Groq). Configured via server environment variables.
          </span>
        </div>
      </div>

      {/* Language Bar & Input */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        {/* Language selector controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex-1">
            <label className="text-xs font-medium text-foreground block mb-1">Source Language</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-accent"
            >
              <option value="auto">Auto-Detect Language</option>
              {LANGUAGES.map((l) => (
                <option key={`src-${l.code}`} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center pt-2 sm:pt-4">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap languages"
              className="p-2 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            <label className="text-xs font-medium text-foreground block mb-1">Target Language</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-accent"
            >
              {LANGUAGES.map((l) => (
                <option key={`tgt-${l.code}`} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Text Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Original Text</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                Load Sample
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste sentences or paragraphs to translate..."
            className="w-full p-3.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words &bull; {inputText.length} characters</span>
            <span>Target: {LANGUAGES.find((l) => l.code === targetLang)?.name}</span>
          </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="w-full py-2.5 px-4 bg-accent text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Translating Content...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Translate Text</span>
            </>
          )}
        </button>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Translation Notice</p>
            <p className="text-xs text-destructive/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Translated Result */}
      {translatedText && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in-50">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Translation Output</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
                {LANGUAGES.find((l) => l.code === targetLang)?.name}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Translation</span>
                </>
              )}
            </button>
          </div>

          <div className="text-sm text-foreground/95 leading-relaxed p-4 bg-muted/20 rounded-lg border border-border/50 whitespace-pre-wrap font-sans">
            {translatedText}
          </div>
        </div>
      )}
    </div>
  );
}
