"use client";

import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from "react";

export default function ImageCropperTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  // Crop state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null); // null means free

  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    { label: "Free", ratio: null },
    { label: "1:1", ratio: 1 },
    { label: "4:3", ratio: 4 / 3 },
    { label: "16:9", ratio: 16 / 9 },
    { label: "3:2", ratio: 3 / 2 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setCroppedBlob(null);
      setCropBox(null);
      
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        drawCanvas();
      };
      img.src = url;
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to a manageable size (max 600px width/height for display)
    const MAX_SIZE = 600;
    let scale = 1;
    if (img.width > MAX_SIZE || img.height > MAX_SIZE) {
      scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);
    }
    
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (cropBox) {
      // Draw dim overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear cropped area
      ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
      ctx.drawImage(
        img,
        cropBox.x / scale, cropBox.y / scale, cropBox.w / scale, cropBox.h / scale,
        cropBox.x, cropBox.y, cropBox.w, cropBox.h
      );

      // Draw border
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [cropBox]);

  const handleMouseDown = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (croppedBlob) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setStartX(e.clientX - rect.left);
    setStartY(e.clientY - rect.top);
    setIsDragging(true);
    setCropBox(null);
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || croppedBlob) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    let w = currentX - startX;
    let h = currentY - startY;

    if (aspectRatio) {
       if (Math.abs(w) > Math.abs(h * aspectRatio)) {
         h = Math.sign(h) * Math.abs(w / aspectRatio);
       } else {
         w = Math.sign(w) * Math.abs(h * aspectRatio);
       }
    }

    const newBox = {
      x: w < 0 ? startX + w : startX,
      y: h < 0 ? startY + h : startY,
      w: Math.abs(w),
      h: Math.abs(h),
    };

    // Constrain to canvas
    if (newBox.x < 0) { newBox.w += newBox.x; newBox.x = 0; }
    if (newBox.y < 0) { newBox.h += newBox.y; newBox.y = 0; }
    if (newBox.x + newBox.w > canvas.width) newBox.w = canvas.width - newBox.x;
    if (newBox.y + newBox.h > canvas.height) newBox.h = canvas.height - newBox.y;

    setCropBox(newBox);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const applyCrop = () => {
    if (!cropBox || !imgRef.current || !canvasRef.current) return;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate original image scale
    const displayCanvas = canvasRef.current;
    const scaleX = imgRef.current.width / displayCanvas.width;
    const scaleY = imgRef.current.height / displayCanvas.height;

    const actualX = cropBox.x * scaleX;
    const actualY = cropBox.y * scaleY;
    const actualW = cropBox.w * scaleX;
    const actualH = cropBox.h * scaleY;

    if (actualW <= 0 || actualH <= 0) return;

    canvas.width = actualW;
    canvas.height = actualH;

    ctx.drawImage(
      imgRef.current,
      actualX, actualY, actualW, actualH,
      0, 0, actualW, actualH
    );

    canvas.toBlob((blob) => {
      if (blob) setCroppedBlob(blob);
    }, file?.type || "image/jpeg", 1);
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setCroppedBlob(null);
    setCropBox(null);
    setError(null);
    imgRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {!file && (
        <div
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <p className="font-heading font-semibold text-lg">Click to browse your image</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 neo-border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {file && !croppedBlob && (
        <div className="neo-card p-6 space-y-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
               <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Aspect Ratio</label>
               <div className="flex gap-2">
                 {presets.map(p => (
                   <button
                     key={p.label}
                     onClick={() => { setAspectRatio(p.ratio); setCropBox(null); }}
                     className={`px-3 py-1 text-sm neo-border rounded transition-colors ${aspectRatio === p.ratio ? 'bg-accent text-white' : 'bg-surface hover:bg-accent/10'}`}
                   >
                     {p.label}
                   </button>
                 ))}
               </div>
            </div>
            {cropBox && (
              <div className="text-sm font-semibold">
                Crop Size: {Math.round(cropBox.w)} x {Math.round(cropBox.h)} (scaled)
              </div>
            )}
          </div>

          <div className="flex justify-center bg-bg border neo-border overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="max-w-full"
            />
          </div>
          <p className="text-center text-sm text-text-secondary">Click and drag to select crop area.</p>

          <div className="flex gap-4">
            <button
              onClick={applyCrop}
              disabled={!cropBox}
              className="neo-btn neo-btn-primary flex-1"
            >
              Apply Crop
            </button>
            <button onClick={reset} className="neo-btn neo-btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {croppedBlob && (
        <div className="neo-card p-6 space-y-6 text-center">
          <h3 className="font-heading font-bold text-xl text-green-600 dark:text-green-400">
            Image Cropped!
          </h3>
          
          <div className="flex justify-center">
            <img src={URL.createObjectURL(croppedBlob)} alt="Cropped" className="max-w-full max-h-[300px] border neo-border" />
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <a
              href={URL.createObjectURL(croppedBlob)}
              download={`cropped_${file!.name}`}
              className="neo-btn neo-btn-primary inline-block"
            >
              Download
            </a>
            <button onClick={reset} className="neo-btn neo-btn-secondary">
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
