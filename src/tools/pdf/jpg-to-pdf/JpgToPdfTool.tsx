"use client";

import React, { useState, useRef } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { Upload, ArrowUp, ArrowDown, X, Image as ImageIcon, FileDown, Plus } from 'lucide-react';

export default function JpgToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Fit'>('A4');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      if (newFiles.length === 0) {
        setError("Please select valid image files (JPG/PNG).");
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

  const processImages = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let pdfImage;
        
        if (file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(arrayBuffer);
        } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        } else {
          continue; // Skip unsupported types silently or add error handling
        }

        const imgDims = pdfImage.scale(1);
        
        let page;
        if (pageSize === 'Fit') {
          page = pdfDoc.addPage([imgDims.width, imgDims.height]);
          page.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: imgDims.width,
            height: imgDims.height,
          });
        } else {
          const dims = pageSize === 'A4' ? PageSizes.A4 : PageSizes.Letter;
          page = pdfDoc.addPage(dims);
          
          // Calculate scale to fit within page while maintaining aspect ratio
          const scale = Math.min(
            dims[0] / imgDims.width,
            dims[1] / imgDims.height
          );
          
          const scaledWidth = imgDims.width * scale;
          const scaledHeight = imgDims.height * scale;
          
          // Center the image
          const x = (dims[0] - scaledWidth) / 2;
          const y = (dims[1] - scaledHeight) / 2;
          
          page.drawImage(pdfImage, {
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while creating the PDF.");
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
          <h2 className="text-2xl font-heading font-bold text-text">PDF Created Successfully!</h2>
          <p className="text-text-secondary">Your images have been converted to a single PDF.</p>
          
          <div className="flex justify-center gap-4 pt-4">
            <a 
              href={resultUrl} 
              download="images-converted.pdf"
              className="neo-btn neo-btn-primary flex items-center gap-2"
            >
              <FileDown className="w-5 h-5" /> Download PDF
            </a>
            <button 
              onClick={reset}
              className="neo-btn neo-btn-secondary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Process More Images
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
          accept="image/jpeg,image/png,image/jpg" 
          multiple 
          className="hidden" 
          onChange={handleFileChange} 
        />
        <Upload className="w-12 h-12 text-text-secondary mx-auto mb-4" />
        <h3 className="text-xl font-heading font-bold text-text mb-2">Upload Image Files</h3>
        <p className="text-text-secondary">Drop your JPG/PNG files here or click to browse</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="neo-card p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-lg">Images ({files.length})</h3>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="neo-btn neo-btn-secondary text-sm py-1 px-3"
            >
              Add More
            </button>
          </div>

          <div className="space-y-2">
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block">
              Page Size
            </label>
            <div className="flex gap-4">
              {[
                { label: 'A4', value: 'A4' },
                { label: 'Letter', value: 'Letter' },
                { label: 'Fit to Image', value: 'Fit' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pageSize"
                    value={opt.value}
                    checked={pageSize === opt.value}
                    onChange={(e) => setPageSize(e.target.value as any)}
                    className="w-4 h-4 text-accent border-border"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-surface border-2 border-border rounded-lg">
                <ImageIcon className="w-6 h-6 text-accent flex-shrink-0" />
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
              onClick={processImages}
              disabled={isProcessing || files.length === 0}
              className="neo-btn neo-btn-primary w-full flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Converting...' : 'Convert to PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
