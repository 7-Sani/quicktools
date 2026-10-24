"use client";

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileDown, Plus, File as FileIcon, CheckSquare } from 'lucide-react';

export default function ExtractPdfPagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  
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
        setSelectedPages(new Set());
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

  const togglePage = (index: number) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedPages.size === pageCount) {
      setSelectedPages(new Set());
    } else {
      const newSet = new Set<number>();
      for (let i = 0; i < pageCount; i++) {
        newSet.add(i);
      }
      setSelectedPages(newSet);
    }
  };

  const processExtract = async () => {
    if (!file || selectedPages.size === 0) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const indicesToCopy = Array.from(selectedPages).sort((a, b) => a - b);
      const copiedPages = await newPdf.copyPages(sourcePdf, indicesToCopy);
      
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while extracting pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setSelectedPages(new Set());
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
          <h2 className="text-2xl font-heading font-bold text-text">Pages Extracted!</h2>
          <p className="text-text-secondary">Your selected pages have been saved into a new PDF.</p>
          
          <div className="flex justify-center gap-4 pt-4">
            <a 
              href={resultUrl} 
              download={`extracted-${file?.name || 'document.pdf'}`}
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
                {pageCount} total pages
              </p>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="neo-btn neo-btn-secondary text-sm py-1.5 px-3"
            >
              Change File
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="font-heading font-semibold text-sm uppercase tracking-wide">
                Select Pages to Extract
              </label>
              <button 
                onClick={toggleAll}
                className="text-sm font-medium text-accent hover:underline"
              >
                {selectedPages.size === pageCount ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto p-2 bg-bg border-2 border-border rounded-lg">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => togglePage(i)}
                  className={`aspect-square flex items-center justify-center font-medium border-2 rounded transition-colors ${
                    selectedPages.has(i) 
                      ? 'bg-accent text-white border-accent' 
                      : 'bg-surface border-border text-text hover:border-accent'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <p className="text-sm text-text-secondary font-medium">
              Selected: {selectedPages.size} page(s)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          <div className="pt-4 border-t-2 border-border">
            <button
              onClick={processExtract}
              disabled={isProcessing || selectedPages.size === 0}
              className="neo-btn neo-btn-primary w-full flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Extracting...' : <><CheckSquare className="w-5 h-5" /> Extract {selectedPages.size} Page(s)</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
