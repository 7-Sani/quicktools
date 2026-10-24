"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import { PDFDocument } from "pdf-lib";

export default function ImageToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type.startsWith("image/"));
    if (validFiles.length !== newFiles.length) {
      setError("Some files were rejected. Only images are allowed.");
    } else {
      setError(null);
    }
    setFiles(prev => [...prev, ...validFiles]);
    setPdfUrl(null);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPdfUrl(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setFiles(newFiles);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setFiles(newFiles);
  };

  const generatePdf = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        
        if (file.type === "image/png") {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else {
          // If unsupported, skip or throw
          throw new Error(`Unsupported image type: ${file.type}. Please use JPG or PNG.`);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setPdfUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <p className="font-heading font-semibold text-lg">Drop your images here</p>
        <p className="text-text-secondary mt-2">or click to browse</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {files.length > 0 && !pdfUrl && (
        <div className="neo-card p-6 space-y-6">
          <h3 className="font-heading font-bold text-lg">Selected Images ({files.length})</h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 neo-border rounded bg-surface">
                <span className="truncate flex-1 text-sm">{file.name}</span>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="px-2 py-1 bg-bg neo-border rounded text-xs disabled:opacity-50">↑</button>
                  <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="px-2 py-1 bg-bg neo-border rounded text-xs disabled:opacity-50">↓</button>
                  <button onClick={() => removeFile(i)} className="px-2 py-1 bg-red-100 text-red-700 neo-border rounded text-xs">✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={generatePdf}
              disabled={isProcessing}
              className="neo-btn neo-btn-primary flex-1"
            >
              {isProcessing ? "Generating PDF..." : "Generate PDF"}
            </button>
            <button
              onClick={reset}
              disabled={isProcessing}
              className="neo-btn neo-btn-secondary"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {pdfUrl && (
        <div className="neo-card p-6 space-y-6 text-center">
          <h3 className="font-heading font-bold text-xl text-green-600 dark:text-green-400">
            PDF Generated Successfully!
          </h3>
          
          <div className="flex gap-4 justify-center mt-6">
            <a
              href={pdfUrl}
              download="images.pdf"
              className="neo-btn neo-btn-primary inline-block"
            >
              Download PDF
            </a>
            <button onClick={reset} className="neo-btn neo-btn-secondary">
              Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
