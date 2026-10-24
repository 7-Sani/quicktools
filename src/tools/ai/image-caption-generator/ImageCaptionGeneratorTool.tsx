"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { Image as ImageIcon, Upload, Copy, Check, RotateCcw, AlertCircle, Info, Sparkles, Hash } from "lucide-react";

type CaptionStyle = "alt-text" | "social" | "detailed" | "ecommerce";

const STYLES: { id: CaptionStyle; label: string; desc: string }[] = [
  { id: "alt-text", label: "Accessibility Alt Text", desc: "Concise, objective screen-reader description" },
  { id: "social", label: "Social Media Post", desc: "Engaging hook, storytelling, emojis & hashtags" },
  { id: "detailed", label: "Visual Breakdown", desc: "Composition, lighting, colors, and subject analysis" },
  { id: "ecommerce", label: "Product Listing", desc: "Commercial features, angles, and sales copy" },
];

export default function ImageCaptionGeneratorTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; size: string } | null>(null);
  const [style, setStyle] = useState<CaptionStyle>("social");
  const [captionResult, setCaptionResult] = useState<string>("");
  const [providerUsed, setProviderUsed] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 8MB. Please select a smaller photo.");
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    setCaptionResult("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);

      const img = new Image();
      img.onload = () => {
        setImageMeta({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imagePreview) {
      setErrorMsg("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const promptsByStyle: Record<CaptionStyle, string> = {
      "alt-text": "Generate a concise, objective WCAG-compliant image alt text describing what is visible in the photo without preamble or filler phrases like 'image of'.",
      "social": "Write an engaging social media caption for Instagram/Twitter with an attention-grabbing hook, 2-3 short body sentences, relevant emojis, and 5-8 trending hashtags.",
      "detailed": "Analyze this image in depth. Describe the primary subject, background setting, lighting, color palette, mood, and compositional balance.",
      "ecommerce": "Write an e-commerce product description highlighting the key visual features, design quality, styling details, and appealing selling points.",
    };

    try {
      const response = await fetch("/api/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imagePreview,
          prompt: promptsByStyle[style],
          systemPrompt: "You are an expert AI vision analyst and creative copywriter. Output clear, polished responses directly.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.details ? `${data.error}: ${data.details}` : data.error || "Vision analysis failed");
        setCaptionResult("");
      } else {
        setCaptionResult(data.result);
        setProviderUsed(data.provider || "Neural Vision AI");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to connect to AI vision endpoint.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!captionResult) return;
    navigator.clipboard.writeText(captionResult);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setImageMeta(null);
    setCaptionResult("");
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          AI Image Caption Generator
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Inspect photos and graphics with multimodal AI vision models (Gemini / OpenAI) to create alt text, social captions, and product descriptions.
        </p>

        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/60">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span>
            <strong>Requirement:</strong> Requires <code>GEMINI_API_KEY</code> or <code>OPENAI_API_KEY</code> on your server. Images are securely sent to the configured neural provider.
          </span>
        </div>
      </div>

      {/* Upload & Style Selector */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        {!imagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-accent rounded-xl p-8 text-center cursor-pointer bg-background transition-colors flex flex-col items-center justify-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Click to upload photo or screenshot</p>
              <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, WebP up to 8MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs">
                <ImageIcon className="w-4 h-4 text-accent" />
                <span className="font-semibold text-foreground">{selectedFile?.name}</span>
                {imageMeta && (
                  <span className="text-muted-foreground">
                    ({imageMeta.width} &times; {imageMeta.height} px &bull; {imageMeta.size})
                  </span>
                )}
              </div>
              <button
                onClick={handleReset}
                className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Change Image
              </button>
            </div>

            <div className="h-64 rounded-lg overflow-hidden bg-muted/30 border border-border flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
            </div>

            {/* Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Caption Generation Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className={`p-2.5 text-left rounded-lg border text-xs transition-colors ${
                      style === s.id
                        ? "border-accent bg-accent/10 font-semibold text-foreground"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div>{s.label}</div>
                    <div className="text-[10px] text-muted-foreground font-normal mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-accent text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Image with Vision AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Caption</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Vision AI Alert</p>
            <p className="text-xs text-destructive/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Caption Result */}
      {captionResult && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in-50">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Generated Caption</span>
              {providerUsed && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
                  {providerUsed}
                </span>
              )}
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
                  <span>Copy Caption</span>
                </>
              )}
            </button>
          </div>

          <div className="text-sm text-foreground/95 leading-relaxed p-4 bg-muted/20 rounded-lg border border-border/50 whitespace-pre-wrap font-sans">
            {captionResult}
          </div>
        </div>
      )}
    </div>
  );
}
