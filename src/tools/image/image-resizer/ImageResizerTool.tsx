"use client";

import React, { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";

export default function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const presets = [
    { label: "Thumbnail", w: 150, h: 150 },
    { label: "Social", w: 1080, h: 1080 },
    { label: "HD", w: 1920, h: 1080 },
    { label: "4K", w: 3840, h: 2160 },
  ];

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResizedBlob(null);

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = url;
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspectRatio && originalWidth > 0) {
      setHeight(Math.round(val * (originalHeight / originalWidth)));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspectRatio && originalHeight > 0) {
      setWidth(Math.round(val * (originalWidth / originalHeight)));
    }
  };

  const applyPreset = (w: number, h: number) => {
    if (lockAspectRatio) {
      // Fit within preset bounds while maintaining aspect ratio
      const ratio = Math.min(w / originalWidth, h / originalHeight);
      setWidth(Math.round(originalWidth * ratio));
      setHeight(Math.round(originalHeight * ratio));
    } else {
      setWidth(w);
      setHeight(h);
    }
  };

  const processResize = () => {
    if (!previewUrl || width <= 0 || height <= 0) return;

    setIsProcessing(true);
    setError(null);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          setResizedBlob(blob);
          setIsProcessing(false);
        } else {
          setError("Failed to resize image.");
          setIsProcessing(false);
        }
      }, file?.type || "image/jpeg", 0.9);
    };
    img.src = previewUrl;
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResizedBlob(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cleanup blob urls
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {!file && (
        <div
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <p className="font-heading font-semibold text-lg">Drop your image here</p>
          <p className="text-text-secondary mt-2">or click to browse</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {file && !resizedBlob && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="neo-card p-4 flex items-center justify-center bg-bg">
            <img src={previewUrl!} alt="Preview" className="max-w-full max-h-[300px] object-contain border neo-border" />
          </div>

          <div className="neo-card p-6 space-y-6">
            <div>
              <p className="text-sm mb-4">Original Size: {originalWidth} x {originalHeight}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lockAspectRatio}
                    onChange={(e) => setLockAspectRatio(e.target.checked)}
                    className="w-4 h-4 accent-accent"
                  />
                  Lock Aspect Ratio
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="neo-input"
                  />
                </div>
                <div>
                  <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="neo-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Presets</label>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.w, p.h)}
                    className="px-3 py-1 text-sm neo-border rounded bg-surface hover:bg-accent/10 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t neo-border border-dashed">
              <button
                onClick={processResize}
                disabled={isProcessing}
                className="neo-btn neo-btn-primary flex-1"
              >
                {isProcessing ? "Resizing..." : "Resize Image"}
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
                className="neo-btn neo-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {resizedBlob && (
        <div className="neo-card p-6 space-y-6 text-center">
          <h3 className="font-heading font-bold text-xl text-green-600 dark:text-green-400">
            Image Resized!
          </h3>
          
          <div className="flex justify-center gap-8 text-left max-w-md mx-auto">
             <div className="neo-border p-4 rounded-lg flex-1 text-center">
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wide mb-2 text-text-secondary">New Dimensions</h4>
              <p className="font-bold">{width} x {height}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <a
              href={URL.createObjectURL(resizedBlob)}
              download={`resized_${file!.name}`}
              className="neo-btn neo-btn-primary inline-block"
            >
              Download
            </a>
            <button onClick={reset} className="neo-btn neo-btn-secondary">
              Process Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
