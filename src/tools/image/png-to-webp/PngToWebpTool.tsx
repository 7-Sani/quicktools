"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";

export default function PngToWebpTool() {
  const [file, setFile] = useState<File | null>(null);
  const [webpBlob, setWebpBlob] = useState<Blob | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (selectedFile.type !== "image/png") {
      setError("Please select a PNG image file.");
      return;
    }
    setFile(selectedFile);
    setWebpBlob(null);
    setError(null);
  };

  const convertImage = () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const url = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Could not create canvas context.");
        setIsProcessing(false);
        URL.revokeObjectURL(url);
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          setWebpBlob(blob);
        } else {
          setError("Failed to convert image to WebP.");
        }
        setIsProcessing(false);
        URL.revokeObjectURL(url);
      }, "image/webp", quality);
    };

    img.onerror = () => {
      setError("Failed to load image for conversion.");
      setIsProcessing(false);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const reset = () => {
    setFile(null);
    setWebpBlob(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {!file && (
        <div
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/png"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <p className="font-heading font-semibold text-lg">Drop your PNG here</p>
          <p className="text-text-secondary mt-2">or click to browse</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {file && !webpBlob && (
        <div className="neo-card p-6 space-y-6 text-center">
          <div>
            <h3 className="font-heading font-bold text-lg mb-2">Ready to convert</h3>
            <p className="text-sm text-text-secondary">
              {file.name} ({formatSize(file.size)})
            </p>
          </div>

          <div className="max-w-xs mx-auto text-left">
             <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2 text-center">
                WebP Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={convertImage}
              disabled={isProcessing}
              className="neo-btn neo-btn-primary"
            >
              {isProcessing ? "Converting..." : "Convert to WebP"}
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
      )}

      {webpBlob && (
        <div className="neo-card p-6 space-y-6 text-center">
          <h3 className="font-heading font-bold text-xl text-green-600 dark:text-green-400">
            Conversion Successful!
          </h3>
          
          <div className="flex justify-center gap-8 text-left max-w-md mx-auto">
            <div className="neo-border p-4 rounded-lg flex-1">
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wide mb-2 text-text-secondary">Original PNG</h4>
              <p className="font-bold">{formatSize(file!.size)}</p>
            </div>
            <div className="neo-border p-4 rounded-lg flex-1 bg-accent/10 border-accent">
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wide mb-2 text-text-secondary">New WebP</h4>
              <p className="font-bold text-accent">{formatSize(webpBlob.size)}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <a
              href={URL.createObjectURL(webpBlob)}
              download={`${file!.name.split('.')[0]}.webp`}
              className="neo-btn neo-btn-primary inline-block"
            >
              Download WebP
            </a>
            <button onClick={reset} className="neo-btn neo-btn-secondary">
              Convert Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
