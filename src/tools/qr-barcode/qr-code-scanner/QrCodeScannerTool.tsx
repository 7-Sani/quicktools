"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Copy, Check, ExternalLink, AlertCircle, RefreshCw, StopCircle } from "lucide-react";

export default function QrCodeScannerTool() {
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload");
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerInstanceRef = useRef<any>(null);
  const qrRegionId = "qr-reader-region";

  // Stop camera on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  const stopCamera = async () => {
    if (scannerInstanceRef.current && isScanning) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      setIsScanning(false);
    }
  };

  const startCamera = async () => {
    setErrorMsg(null);
    setScannedResult(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!scannerInstanceRef.current) {
        scannerInstanceRef.current = new Html5Qrcode(qrRegionId);
      }

      setIsScanning(true);

      await scannerInstanceRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          setScannedResult(decodedText);
          stopCamera();
        },
        (errorMessage: string) => {
          // ignore frame-level non-detections
        }
      );
    } catch (err: any) {
      setIsScanning(false);
      console.error("Camera scan error:", err);
      if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
        setErrorMsg("Camera access was denied. Please allow camera permissions in your browser or use the file upload option.");
      } else if (err?.name === "NotFoundError" || err?.message?.includes("No camera")) {
        setErrorMsg("No camera device was found on this system. Please upload a QR code image instead.");
      } else {
        setErrorMsg(err?.message || "Failed to initialize camera scanner. Please try uploading an image.");
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setScannedResult(null);

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WEBP, or SVG).");
      return;
    }

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-hidden-file-reader");
      const result = await html5QrCode.scanFile(file, true);
      setScannedResult(result);
      html5QrCode.clear();
    } catch (err: any) {
      console.error("File decode error:", err);
      setErrorMsg("Could not detect or decode a QR code in the uploaded image. Please ensure the QR code is clearly visible, well-lit, and in focus.");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const copyResult = () => {
    if (!scannedResult) return;
    navigator.clipboard.writeText(scannedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl = scannedResult?.startsWith("http://") || scannedResult?.startsWith("https://");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden container for file decoding */}
      <div id="qr-hidden-file-reader" className="hidden" />

      {/* Tabs */}
      <div className="flex border-4 border-black rounded-2xl p-1 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto">
        <button
          onClick={() => {
            stopCamera();
            setActiveTab("upload");
          }}
          className={`flex-1 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === "upload"
              ? "bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "text-gray-700 hover:text-black"
          }`}
        >
          <Upload className="w-4 h-4" /> Upload Image
        </button>
        <button
          onClick={() => {
            setActiveTab("camera");
          }}
          className={`flex-1 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === "camera"
              ? "bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "text-gray-700 hover:text-black"
          }`}
        >
          <Camera className="w-4 h-4" /> Live Camera
        </button>
      </div>

      {/* Scanner Box */}
      <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        {activeTab === "upload" ? (
          /* File Upload Zone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-purple-600 bg-purple-50"
                : "border-black bg-gray-50 hover:bg-purple-50/50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <Upload className="w-12 h-12 mx-auto text-purple-600 mb-3" />
            <h3 className="text-lg font-black text-gray-900 mb-1">
              Drop your QR code image here, or click to browse
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Supports PNG, JPG, JPEG, WEBP, and SVG formats. Processing runs 100% locally on your device.
            </p>
          </div>
        ) : (
          /* Live Camera Zone */
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
              <div id={qrRegionId} className="w-full max-w-sm rounded-lg overflow-hidden" />

              {!isScanning && (
                <div className="text-center space-y-3 py-6">
                  <Camera className="w-12 h-12 mx-auto text-purple-600 opacity-60" />
                  <p className="text-sm font-bold text-gray-700 max-w-xs">
                    Camera access will only be requested after you click the button below.
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                  >
                    Start Camera Scan
                  </button>
                </div>
              )}

              {isScanning && (
                <div className="mt-4">
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <StopCircle className="w-4 h-4" /> Stop Camera
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-start gap-3 text-red-900 text-sm font-bold">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Decoded Result */}
        {scannedResult && (
          <div className="border-3 border-black p-5 rounded-xl bg-emerald-50 text-emerald-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-emerald-300 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                Decoded QR Code Content
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-emerald-100 border-2 border-black rounded-lg font-bold text-xs text-black transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Content"}
                </button>
                {isUrl && (
                  <a
                    href={scannedResult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 border-2 border-black rounded-lg font-bold text-xs text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Link
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white p-4 border-2 border-black rounded-lg font-mono text-sm break-all select-all text-gray-900 font-semibold max-h-48 overflow-y-auto">
              {scannedResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
