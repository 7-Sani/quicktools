"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Copy, Check, Barcode, AlertCircle, StopCircle, RefreshCw } from "lucide-react";

export default function BarcodeScannerTool() {
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload");
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scannedFormat, setScannedFormat] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerInstanceRef = useRef<any>(null);
  const barcodeRegionId = "barcode-reader-region";

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
    setScannedFormat(null);

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

      // Configure to support both 1D barcodes and QR codes
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      if (!scannerInstanceRef.current) {
        scannerInstanceRef.current = new Html5Qrcode(barcodeRegionId, {
          formatsToSupport,
          verbose: false,
        });
      }

      setIsScanning(true);

      await scannerInstanceRef.current.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 300, height: 160 },
          aspectRatio: 1.777778,
        },
        (decodedText: string, decodedResult: any) => {
          setScannedResult(decodedText);
          const formatName = decodedResult?.result?.format?.formatName || "1D Barcode";
          setScannedFormat(formatName);
          stopCamera();
        },
        (errorMessage: string) => {
          // ignore transient video frame misses
        }
      );
    } catch (err: any) {
      setIsScanning(false);
      console.error("Barcode camera scan error:", err);
      if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
        setErrorMsg("Camera access was denied. Please allow camera permissions in your browser or use the image file upload option.");
      } else if (err?.name === "NotFoundError" || err?.message?.includes("No camera")) {
        setErrorMsg("No camera device was detected on this device. Please upload an image of the barcode instead.");
      } else {
        setErrorMsg(err?.message || "Failed to initialize barcode scanner. Please try uploading an image.");
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setScannedResult(null);
    setScannedFormat(null);

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file containing a barcode.");
      return;
    }

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      const html5QrCode = new Html5Qrcode("barcode-hidden-file-reader", {
        formatsToSupport,
        verbose: false,
      });

      const result = await html5QrCode.scanFile(file, true);
      setScannedResult(result);
      setScannedFormat("Decoded Barcode");
      html5QrCode.clear();
    } catch (err: any) {
      console.error("Barcode file decode error:", err);
      setErrorMsg("Could not detect or decode a linear barcode in the uploaded image. Please ensure the barcode is clearly oriented horizontally, adequately lit, and high resolution.");
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div id="barcode-hidden-file-reader" className="hidden" />

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

      {/* Main Scanner Box */}
      <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        {activeTab === "upload" ? (
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
            <Barcode className="w-14 h-14 mx-auto text-purple-600 mb-3" />
            <h3 className="text-lg font-black text-gray-900 mb-1">
              Drop barcode photo or label image here
            </h3>
            <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
              Decodes EAN-13, UPC-A, Code 128, Code 39, ITF, and QR codes locally inside your browser.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
              <div id={barcodeRegionId} className="w-full max-w-md rounded-lg overflow-hidden" />

              {!isScanning && (
                <div className="text-center space-y-3 py-6">
                  <Barcode className="w-12 h-12 mx-auto text-purple-600 opacity-60" />
                  <p className="text-sm font-bold text-gray-700 max-w-xs">
                    Point your camera directly at the linear barcode bars.
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                  >
                    Start Camera Barcode Scan
                  </button>
                </div>
              )}

              {isScanning && (
                <div className="mt-4">
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <StopCircle className="w-4 h-4" /> Stop Scanner
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-start gap-3 text-red-900 text-sm font-bold">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {scannedResult && (
          <div className="border-3 border-black p-5 rounded-xl bg-emerald-50 text-emerald-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-emerald-300 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  Decoded Barcode Result
                </span>
                {scannedFormat && (
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-200 border border-emerald-500 rounded-full text-emerald-900">
                    {scannedFormat}
                  </span>
                )}
              </div>
              <button
                onClick={copyResult}
                className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-emerald-100 border-2 border-black rounded-lg font-bold text-xs text-black transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Value"}
              </button>
            </div>

            <div className="bg-white p-4 border-2 border-black rounded-lg font-mono text-base break-all select-all text-gray-900 font-bold">
              {scannedResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
