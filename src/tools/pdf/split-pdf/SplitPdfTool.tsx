"use client";

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { Upload, FileDown, Plus, File as FileIcon, Scissors } from 'lucide-react';

export default function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState<'every' | 'range'>('every');
  const [pageRanges, setPageRanges] = useState<string>('');
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

  const processSplit = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const totalPages = sourcePdf.getPageCount();
      
      const zip = new JSZip();
      
      if (splitMode === 'every') {
        // Split every page into a separate PDF
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          zip.file(`page-${i + 1}.pdf`, pdfBytes);
        }
      } else {
        // Parse ranges (e.g., "1-3, 5, 7-10")
        const ranges = pageRanges.split(',').map(r => r.trim()).filter(Boolean);
        if (ranges.length === 0) {
          throw new Error("Please enter valid page ranges.");
        }
        
        for (let idx = 0; idx < ranges.length; idx++) {
          const range = ranges[idx];
          const newPdf = await PDFDocument.create();
          const indicesToCopy: number[] = [];
          
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n, 10));
            if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
              throw new Error(`Invalid range: ${range}`);
            }
            for (let i = start - 1; i <= end - 1; i++) {
              indicesToCopy.push(i);
            }
          } else {
            const pageNum = parseInt(range, 10);
            if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
              throw new Error(`Invalid page number: ${range}`);
            }
            indicesToCopy.push(pageNum - 1);
          }
          
          const copiedPages = await newPdf.copyPages(sourcePdf, indicesToCopy);
          copiedPages.forEach(p => newPdf.addPage(p));
          
          const pdfBytes = await newPdf.save();
          zip.file(`split-${range}.pdf`, pdfBytes);
        }
      }

      // Generate Zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      setResultUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while splitting the PDF.");
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
          <h2 className="text-2xl font-heading font-bold text-text">PDF Split Successfully!</h2>
          <p className="text-text-secondary">Your split PDFs have been packaged into a ZIP file.</p>
          
          <div className="flex justify-center gap-4 pt-4">
            <a 
              href={resultUrl} 
              download="split-pdfs.zip"
              className="neo-btn neo-btn-primary flex items-center gap-2"
            >
              <FileDown className="w-5 h-5" /> Download ZIP
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
                {(file.size / 1024 / 1024).toFixed(2)} MB • {pageCount} pages
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
            <div>
              <label className="font-heading font-semibold text-sm uppercase tracking-wide mb-2 block">Split Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSplitMode('every')}
                  className={`p-4 border-2 rounded-lg font-medium transition-all ${
                    splitMode === 'every' 
                      ? 'border-accent bg-accent/5 text-accent shadow-[4px_4px_0_var(--color-accent)]' 
                      : 'border-border bg-surface text-text hover:bg-bg'
                  }`}
                >
                  Extract Every Page
                </button>
                <button
                  onClick={() => setSplitMode('range')}
                  className={`p-4 border-2 rounded-lg font-medium transition-all ${
                    splitMode === 'range' 
                      ? 'border-accent bg-accent/5 text-accent shadow-[4px_4px_0_var(--color-accent)]' 
                      : 'border-border bg-surface text-text hover:bg-bg'
                  }`}
                >
                  Custom Ranges
                </button>
              </div>
            </div>

            {splitMode === 'range' && (
              <div className="space-y-2">
                <label className="font-heading font-semibold text-sm uppercase tracking-wide block">
                  Page Ranges
                </label>
                <input
                  type="text"
                  value={pageRanges}
                  onChange={(e) => setPageRanges(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="neo-input w-full"
                />
                <p className="text-sm text-text-secondary">
                  Enter page numbers and/or ranges separated by commas. Max page: {pageCount}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          <div className="pt-4 border-t-2 border-border">
            <button
              onClick={processSplit}
              disabled={isProcessing}
              className="neo-btn neo-btn-primary w-full flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Splitting...' : <><Scissors className="w-5 h-5" /> Split PDF</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
