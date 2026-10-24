"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { Upload, FileDown, Plus, File as FileIcon, Image as ImageIcon } from 'lucide-react';

export default function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError("Please select a valid PDF file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const processConversion = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      
      const zip = new JSZip();
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not create canvas context");
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        } as never).promise;
        
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
        });
        
        if (blob) {
          zip.file(`page-${pageNum}.jpg`, blob);
        }
        
        setProgress(Math.round((pageNum / totalPages) * 100));
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      setResultUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while converting the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setProgress(0);
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
            <ImageIcon className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-text">Converted to JPG!</h2>
          <p className="text-text-secondary">Your pages have been converted to JPGs and packaged in a ZIP file.</p>
          
          <div className="flex justify-center gap-4 pt-4">
            <a 
              href={resultUrl} 
              download={`images-${file?.name.replace('.pdf', '')}.zip`}
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
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="neo-btn neo-btn-secondary text-sm py-1.5 px-3"
            >
              Change File
            </button>
          </div>

          <div className="space-y-2">
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block">
              Image Quality / Scale
            </label>
            <div className="flex gap-4">
              {[
                { label: 'Normal (1x)', value: 1.0 },
                { label: 'High (1.5x)', value: 1.5 },
                { label: 'Ultra (2x)', value: 2.0 },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scale"
                    value={opt.value}
                    checked={scale === opt.value}
                    onChange={() => setScale(opt.value)}
                    className="w-4 h-4 text-accent border-border"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Converting...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-4 bg-surface border-2 border-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t-2 border-border">
            <button
              onClick={processConversion}
              disabled={isProcessing}
              className="neo-btn neo-btn-primary w-full flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Converting...' : <><ImageIcon className="w-5 h-5" /> Convert to JPG</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
