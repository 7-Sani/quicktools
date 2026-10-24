"use client";

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, ArrowUp, ArrowDown, X, File as FileIcon, FileDown, Plus } from 'lucide-react';

export default function MergePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      if (newFiles.length === 0) {
        setError("Please select valid PDF files.");
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      return newFiles;
    });
  };

  const processMerge = async () => {
    if (files.length < 2) {
      setError("Please add at least two PDF files to merge.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      setError("An error occurred while merging PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFiles([]);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }
    setResultUrl(null);
    setError(null);
  };

  if (resultUrl) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="neo-card p-6 text-center space-y-4 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent">
            <FileDown className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-text">PDFs Merged Successfully!</h2>
          <p className="text-text-secondary">Your merged PDF is ready for download.</p>
          
          <div className="flex justify-center gap-4 pt-4">
            <a 
              href={resultUrl} 
              download="merged.pdf"
              className="neo-btn neo-btn-primary flex items-center gap-2"
            >
              <FileDown className="w-5 h-5" /> Download Merged PDF
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
      <div 
        className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".pdf" 
          multiple 
          className="hidden" 
          onChange={handleFileChange} 
        />
        <Upload className="w-12 h-12 text-text-secondary mx-auto mb-4" />
        <h3 className="text-xl font-heading font-bold text-text mb-2">Upload PDF Files</h3>
        <p className="text-text-secondary">Drop your PDFs here or click to browse</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="neo-card p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-bold text-lg">Files to Merge ({files.length})</h3>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="neo-btn neo-btn-secondary text-sm py-1 px-3"
            >
              Add More
            </button>
          </div>
          
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-surface border-2 border-border rounded-lg">
                <FileIcon className="w-6 h-6 text-accent flex-shrink-0" />
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-text truncate">{file.name}</p>
                  <p className="text-xs text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button 
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded bg-surface border-2 border-border disabled:opacity-50 hover:bg-bg"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => moveDown(index)}
                    disabled={index === files.length - 1}
                    className="p-1.5 rounded bg-surface border-2 border-border disabled:opacity-50 hover:bg-bg"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => removeFile(index)}
                    className="p-1.5 rounded bg-red-100 border-2 border-red-500 text-red-600 hover:bg-red-200 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t-2 border-border">
            <button
              onClick={processMerge}
              disabled={isProcessing || files.length < 2}
              className="neo-btn neo-btn-primary w-full flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Merging...' : 'Merge PDFs'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
