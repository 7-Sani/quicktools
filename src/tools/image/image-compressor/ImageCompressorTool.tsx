"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import imageCompression from "browser-image-compression";

export default function ImageCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [maxSizeMB, setMaxSizeMB] = useState<number>(1);
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
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setFile(selectedFile);
    setCompressedFile(null);
    setError(null);
  };

  const compressImage = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const options = {
      maxSizeMB: maxSizeMB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: quality,
    };

    try {
      const compressedBlob = await imageCompression(file, options);
      const newFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
      });
      setCompressedFile(newFile);
    } catch (err) {
      console.error(err);
      setError("Failed to compress the image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setCompressedFile(null);
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

      {file && !compressedFile && (
        <div className="neo-card p-6 space-y-6">
          <div>
            <h3 className="font-heading font-bold text-lg mb-2">Original File</h3>
            <p className="text-sm">
              Name: {file.name} <br />
              Size: {formatSize(file.size)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">
                Quality: {Math.round(quality * 100)}%
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
            <div>
              <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">
                Max Size (MB): {maxSizeMB} MB
              </label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={maxSizeMB}
                onChange={(e) => setMaxSizeMB(parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={compressImage}
              disabled={isProcessing}
              className="neo-btn neo-btn-primary flex-1"
            >
              {isProcessing ? "Compressing..." : "Compress Image"}
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

      {compressedFile && (
        <div className="neo-card p-6 space-y-6 text-center">
          <h3 className="font-heading font-bold text-xl text-green-600 dark:text-green-400">
            Compression Successful!
          </h3>
          
          <div className="flex justify-center gap-8 text-left max-w-md mx-auto">
            <div className="neo-border p-4 rounded-lg flex-1">
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wide mb-2 text-text-secondary">Original</h4>
              <p className="font-bold">{formatSize(file!.size)}</p>
            </div>
            <div className="neo-border p-4 rounded-lg flex-1 bg-accent/10 border-accent">
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wide mb-2 text-text-secondary">Compressed</h4>
              <p className="font-bold text-accent">{formatSize(compressedFile.size)}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <a
              href={URL.createObjectURL(compressedFile)}
              download={`compressed_${file!.name}`}
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
