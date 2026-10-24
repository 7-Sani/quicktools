"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { Scissors, Upload, Download, RotateCcw, AlertCircle, Info, CheckCircle2, Sliders, Image as ImageIcon } from "lucide-react";

export default function ImageBackgroundRemoverTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [method, setMethod] = useState<"local" | "cloud">("local");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local chroma / threshold settings
  const [colorThreshold, setColorThreshold] = useState<number>(30); // 0 to 100
  const [smoothing, setSmoothing] = useState<number>(10);
  const [keyColor, setKeyColor] = useState<string>("#ffffff"); // target color to remove

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPEG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File exceeds the 10MB size limit. Please upload a smaller image.");
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setOriginalImageUrl(url);
    setResultImageUrl(null);

    // Auto-detect corner pixel color for local cutout
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 1;
      c.height = 1;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);
        const p = ctx.getImageData(0, 0, 1, 1).data;
        const hex = `#${((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1)}`;
        setKeyColor(hex);
      }
    };
    img.src = url;
  };

  const handleProcessLocal = () => {
    if (!originalImageUrl) return;
    setIsLoading(true);
    setErrorMsg(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setIsLoading(false);
        setErrorMsg("Failed to initialize canvas context.");
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Parse keyColor hex
      const rKey = parseInt(keyColor.slice(1, 3), 16) || 255;
      const gKey = parseInt(keyColor.slice(3, 5), 16) || 255;
      const bKey = parseInt(keyColor.slice(5, 7), 16) || 255;

      const tolerance = (colorThreshold / 100) * 441.67; // max distance between RGB vectors is sqrt(255^2 * 3) ~= 441.67
      const feather = (smoothing / 100) * 441.67;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance in RGB color space
        const dist = Math.sqrt(
          (r - rKey) ** 2 + (g - gKey) ** 2 + (b - bKey) ** 2
        );

        if (dist <= tolerance) {
          // Transparent
          data[i + 3] = 0;
        } else if (dist < tolerance + feather) {
          // Feathered edge alpha
          const alphaFactor = (dist - tolerance) / feather;
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const cutoutDataUrl = canvas.toDataURL("image/png");
      setResultImageUrl(cutoutDataUrl);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      setErrorMsg("Failed to read image source.");
    };

    img.src = originalImageUrl;
  };

  const handleProcessCloud = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/ai/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setErrorMsg(errData.details ? `${errData.error}: ${errData.details}` : errData.error || "Cloud background removal failed.");
        setIsLoading(false);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultImageUrl(url);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error contacting background removal service.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImageUrl) return;
    const a = document.createElement("a");
    a.href = resultImageUrl;
    a.download = `cutout-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setOriginalImageUrl(null);
    setResultImageUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hidden canvas for local processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header and Method Selection */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Scissors className="w-5 h-5 text-accent" />
              Image Background Remover
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Extract subjects and remove backdrops into transparent PNGs using local color cutout or cloud AI.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setMethod("local")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                method === "local" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Local Chroma Cutout (Free)
            </button>
            <button
              onClick={() => setMethod("cloud")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                method === "cloud" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cloud Neural AI (Server API)
            </button>
          </div>
        </div>

        {method === "local" ? (
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/60">
            <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Local Mode:</strong> Analyzes pixel color distance and edge smoothing directly on an HTML5 canvas. Ideal for solid backgrounds (white, green screen, uniform color). 100% free and client-side.
            </span>
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/60">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Cloud Neural AI:</strong> Dispatches to official background matting endpoints (requires <code>REMOVE_BG_API_KEY</code> on server). Handles complex human hair, fuzzy clothing, and photorealistic depth.
            </span>
          </div>
        )}
      </div>

      {/* Upload Box */}
      {!originalImageUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-accent rounded-xl p-8 text-center cursor-pointer bg-card transition-colors flex flex-col items-center justify-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Click to upload an image or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, WebP up to 10MB</p>
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
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">{selectedFile?.name || "Uploaded Image"}</span>
              <span className="text-xs text-muted-foreground">
                ({selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB" : ""})
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Replace Image
            </button>
          </div>

          {/* Local Settings if method === local */}
          {method === "local" && (
            <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-3">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Chroma Cutout Tuning
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-muted-foreground mb-1">Target Color to Remove</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={keyColor}
                      onChange={(e) => setKeyColor(e.target.value)}
                      className="w-8 h-8 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={keyColor}
                      onChange={(e) => setKeyColor(e.target.value)}
                      className="p-1 text-xs border border-input rounded bg-background font-mono w-20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Color Tolerance</span>
                    <span>{colorThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={colorThreshold}
                    onChange={(e) => setColorThreshold(parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Edge Feathering</span>
                    <span>{smoothing}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={smoothing}
                    onChange={(e) => setSmoothing(parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={method === "local" ? handleProcessLocal : handleProcessCloud}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-accent text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Removing Background...</span>
              </>
            ) : (
              <>
                <Scissors className="w-4 h-4" />
                <span>{method === "local" ? "Remove Background Locally" : "Remove with Cloud AI"}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Background Removal Notice</p>
            <p className="text-xs text-destructive/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {originalImageUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2 shadow-sm">
            <div className="text-xs font-semibold text-muted-foreground">Original Image</div>
            <div className="h-64 rounded-lg overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={originalImageUrl} alt="Original" className="max-h-full max-w-full object-contain" />
            </div>
          </div>

          {/* Cutout Result */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Transparent Cutout Result
              </span>
              {resultImageUrl && (
                <button
                  onClick={handleDownload}
                  className="text-xs px-2.5 py-1 rounded bg-accent text-white hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Download PNG
                </button>
              )}
            </div>

            <div
              className="h-64 rounded-lg overflow-hidden border border-border flex items-center justify-center relative"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
            >
              {resultImageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={resultImageUrl} alt="Cutout Result" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-xs text-muted-foreground bg-background/80 p-3 rounded-md backdrop-blur-sm">
                  Click &ldquo;Remove Background&rdquo; to generate cutout
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
