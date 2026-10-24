"use client";

import React, { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";

export default function JpgToPngTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
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
    if (selectedFile.type !== "image/jpeg") {
      setError("Please select a JPG/JPEG image file.");
      return;
    }
    setFile(selectedFile);
    setPngBlob(null);
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
          setPngBlob(blob);
        } else {
          setError("Failed to convert image to PNG.");
        }
        setIsProcessing(false);
        URL.revokeObjectURL(url);
      }, "image/png");
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
    setPngBlob(null);
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
            accept="image/jpeg"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <p className="font-heading font-semibold text-lg">Drop your JPG here</p>
          <p className="text-text-secondary mt-2">or click to browse</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {file && !pngBlob && (
        <div className="neo-card p-6 space-y-6 text-center">
          <div>
            <h3 className="font-heading font-bold text-lg mb-2">Ready to convert</h3>
            <p className="text-sm text-text-secondary">
              {file.name} ({formatSize(file.size)})
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={convertImage}
              disabled={isProcessing}
              className="neo-btn neo-btn-primary"
            >
              {isProcessing ? "Converting..." : "Convert to PNG"}
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

      {pngBlob && (
        <div className="neo-card p-6 space-y-6 text-center">
          <h3 className="font-heading font-bold text-xl text-green-600 dark:text-green-400">
            Conversion Successful!
          </h3>
          
          <div className="flex justify-center gap-8 text-left max-w-md mx-auto">
            <div className="neo-border p-4 rounded-lg flex-1">
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wide mb-2 text-text-secondary">Original JPG</h4>
              <p className="font-bold">{formatSize(file!.size)}</p>
            </div>
            <div className="neo-border p-4 rounded-lg flex-1 bg-accent/10 border-accent">
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wide mb-2 text-text-secondary">New PNG</h4>
              <p className="font-bold text-accent">{formatSize(pngBlob.size)}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <a
              href={URL.createObjectURL(pngBlob)}
              download={`${file!.name.split('.')[0]}.png`}
              className="neo-btn neo-btn-primary inline-block"
            >
              Download PNG
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
