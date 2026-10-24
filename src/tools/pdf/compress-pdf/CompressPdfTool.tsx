"use client";

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileDown, Plus, File as FileIcon, Minimize2 } from 'lucide-react';

export default function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError("Please select a valid PDF file.");
        return;
      }
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setError(null);
    }
  };

  const processCompress = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Loading and re-saving often strips unused objects/metadata, basic compression
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pdfBytes = await pdf.save({ useObjectStreams: true });
      
      setCompressedSize(pdfBytes.length);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      setError("An error occurred while compressing the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setOriginalSize(0);
    setCompressedSize(0);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }
    setResultUrl(null);
    setError(null);
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  if (resultUrl) {
    const savings = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : 0;
    
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="neo-card p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent">
            <FileDown className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-text">PDF Compressed!</h2>
          
          <div className="flex justify-center gap-8 py-4">
            <div>
              <p className="text-sm text-text-secondary uppercase tracking-wide font-semibold">Original</p>
              <p className="text-xl font-bold">{formatSize(originalSize)}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary uppercase tracking-wide font-semibold">Compressed</p>
              <p className="text-xl font-bold text-accent">{formatSize(compressedSize)}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary uppercase tracking-wide font-semibold">Saved</p>
              <p className="text-xl font-bold text-green-600">{savings}%</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 pt-4 border-t-2 border-border mt-4">
            <a 
              href={resultUrl} 
              download={`compressed-${file?.name || 'document.pdf'}`}
              className="neo-btn neo-btn-primary flex items-center gap-2"
            >
              <FileDown className="w-5 h-5" /> Download Compressed PDF
            </a>
            <button 
              onClick={reset}
              className="neo-btn neo-btn-secondary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Process Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {!file ? (
        <div 
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".pdf" 
            className="hidden" 
            onChange={handleFileChange} 
          />
          <Upload className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-heading font-bold text-text mb-2">Upload PDF File</h3>
          <p className="text-text-secondary">Drop your PDF here or click to browse</p>
        </div>
      ) : (
        <div className="neo-card p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-surface border-2 border-border rounded-lg">
            <FileIcon className="w-8 h-8 text-accent flex-shrink-0" />
            <div className="flex-grow min-w-0">
              <p className="font-medium text-text truncate">{file.name}</p>
              <p className="text-sm text-text-secondary">
                {formatSize(file.size)}
              </p>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="neo-btn neo-btn-secondary text-sm py-1.5 px-3"
            >
              Change File
            </button>
          </div>

          <div className="bg-bg border-2 border-border p-4 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> This tool performs basic PDF optimization by stripping unused objects and optimizing streams. It does not heavily downsample images to avoid severe quality loss.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          <div className="pt-4 border-t-2 border-border">
            <button
              onClick={processCompress}
              disabled={isProcessing}
              className="neo-btn neo-btn-primary w-full flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Compressing...' : <><Minimize2 className="w-5 h-5" /> Compress PDF</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
