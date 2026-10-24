"use client";

import React, { useState, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Upload, FileDown, Plus, File as FileIcon, RotateCw } from 'lucide-react';

export default function RotatePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [targetPages, setTargetPages] = useState<'all' | 'custom'>('all');
  const [customPagesStr, setCustomPagesStr] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError("Please select a valid PDF file.");
        return;
      }
      
      try {
        setFile(selectedFile);
        setError(null);
        // Load PDF to get page count
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setPageCount(pdf.getPageCount());
      } catch (err) {
        setError("Could not read the PDF file.");
        setFile(null);
      }
    }
  };

  const processRotate = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();
      
      const pagesToRotate = new Set<number>();
      
      if (targetPages === 'all') {
        for (let i = 0; i < totalPages; i++) {
          pagesToRotate.add(i);
        }
      } else {
        const parts = customPagesStr.split(',').map(p => p.trim()).filter(Boolean);
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n, 10));
            if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
              for (let i = start; i <= end; i++) {
                pagesToRotate.add(i - 1);
              }
            }
          } else {
            const num = parseInt(part, 10);
            if (!isNaN(num) && num >= 1 && num <= totalPages) {
              pagesToRotate.add(num - 1);
            }
          }
        }
      }

      if (pagesToRotate.size === 0) {
        throw new Error("No valid pages selected to rotate.");
      }

      const pdfPages = pdf.getPages();
      pagesToRotate.forEach(index => {
        const page = pdfPages[index];
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotationAngle));
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while rotating the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }
    setResultUrl(null);
    setError(null);
  };

  if (resultUrl) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="neo-card p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent">
            <FileDown className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-text">PDF Rotated Successfully!</h2>
          <p className="text-text-secondary">Your changes have been saved.</p>
          
          <div className="flex justify-center gap-4 pt-4">
            <a 
              href={resultUrl} 
              download={`rotated-${file?.name || 'document.pdf'}`}
              className="neo-btn neo-btn-primary flex items-center gap-2"
            >
              <FileDown className="w-5 h-5" /> Download PDF
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
                {pageCount} pages
              </p>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="neo-btn neo-btn-secondary text-sm py-1.5 px-3"
            >
              Change File
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="font-heading font-semibold text-sm uppercase tracking-wide block">
                Rotation Angle
              </label>
              <div className="flex flex-col gap-3">
                {[90, 180, 270].map(angle => (
                  <label key={angle} className="flex items-center gap-2 p-3 border-2 border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                    <input
                      type="radio"
                      name="angle"
                      value={angle}
                      checked={rotationAngle === angle}
                      onChange={() => setRotationAngle(angle)}
                      className="w-4 h-4 text-accent border-border"
                    />
                    <span className="font-medium">Rotate {angle}° Right</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-heading font-semibold text-sm uppercase tracking-wide block">
                Pages to Rotate
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-2 p-3 border-2 border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                  <input
                    type="radio"
                    name="targetPages"
                    value="all"
                    checked={targetPages === 'all'}
                    onChange={() => setTargetPages('all')}
                    className="w-4 h-4 text-accent border-border"
                  />
                  <span className="font-medium">All Pages</span>
                </label>
                
                <label className="flex items-center gap-2 p-3 border-2 border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                  <input
                    type="radio"
                    name="targetPages"
                    value="custom"
                    checked={targetPages === 'custom'}
                    onChange={() => setTargetPages('custom')}
                    className="w-4 h-4 text-accent border-border"
                  />
                  <span className="font-medium">Specific Pages</span>
                </label>
                
                {targetPages === 'custom' && (
                  <input
                    type="text"
                    value={customPagesStr}
                    onChange={(e) => setCustomPagesStr(e.target.value)}
                    placeholder="e.g. 1, 3, 5-8"
                    className="neo-input w-full"
                  />
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          <div className="pt-4 border-t-2 border-border">
            <button
              onClick={processRotate}
              disabled={isProcessing || (targetPages === 'custom' && !customPagesStr.trim())}
              className="neo-btn neo-btn-primary w-full flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Rotating...' : <><RotateCw className="w-5 h-5" /> Apply Rotation</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
