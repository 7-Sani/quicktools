"use client";
import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QrCodeGeneratorTool() {
  const [text, setText] = useState('https://quicktools.app');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  
  const svgRef = useRef<SVGSVGElement>(null);

  const downloadQR = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "qrcode.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="neo-card p-6 space-y-4">
        <div>
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Content (Text or URL)</label>
          <textarea 
            className="neo-input w-full h-24 resize-none" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to encode..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Foreground</label>
            <div className="flex gap-2">
              <input type="color" className="w-10 h-10 border-2 border-border cursor-pointer p-0 rounded-none" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
              <input type="text" className="neo-input flex-1" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Background</label>
            <div className="flex gap-2">
              <input type="color" className="w-10 h-10 border-2 border-border cursor-pointer p-0 rounded-none" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              <input type="text" className="neo-input flex-1" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Size (px)</label>
            <input type="number" className="neo-input w-full" value={size} onChange={(e) => setSize(Number(e.target.value))} min="100" max="1000" step="10" />
          </div>
          <div>
            <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Error Correction</label>
            <select className="neo-input w-full" value={level} onChange={(e) => setLevel(e.target.value as 'L'|'M'|'Q'|'H')}>
              <option value="L">L (7%)</option>
              <option value="M">M (15%)</option>
              <option value="Q">Q (25%)</option>
              <option value="H">H (30%)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="neo-card p-6 flex flex-col items-center justify-center space-y-6">
        <div className="border-4 border-border rounded bg-white p-4 inline-block overflow-hidden max-w-full">
          <QRCodeSVG 
            value={text || ' '} 
            size={Math.min(size, 250)} 
            fgColor={fgColor} 
            bgColor={bgColor} 
            level={level}
            ref={svgRef}
            style={{ width: '100%', height: 'auto', maxWidth: '250px' }}
          />
        </div>
        <button className="neo-btn neo-btn-primary w-full max-w-[250px]" onClick={downloadQR} disabled={!text}>
          Download PNG
        </button>
      </div>
    </div>
  );
}
