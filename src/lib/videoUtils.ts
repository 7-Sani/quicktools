/**
 * Client-side video processing utilities using HTML5 Canvas, MediaRecorder, Web Audio API,
 * and pure client-side GIF89a LZW encoding.
 * 100% private, local browser processing.
 */

export interface VideoInfo {
  name: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  aspectRatio: string;
  mimeType: string;
  hasAudio: boolean;
  bitrateKbps: number;
}

/**
 * Determine best genuinely supported video MIME type and extension for MediaRecorder.
 */
export function getBestVideoMimeType(): { mimeType: string; extension: string } {
  if (typeof MediaRecorder === "undefined") {
    return { mimeType: "video/webm", extension: "webm" };
  }

  // Prioritize modern high-efficiency WebM or MP4
  const types = [
    { mime: "video/webm;codecs=vp9,opus", ext: "webm" },
    { mime: "video/webm;codecs=vp8,opus", ext: "webm" },
    { mime: "video/webm", ext: "webm" },
    { mime: "video/mp4;codecs=avc1", ext: "mp4" },
    { mime: "video/mp4", ext: "mp4" },
  ];

  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t.mime)) {
      return { mimeType: t.mime, extension: t.ext };
    }
  }

  return { mimeType: "video/webm", extension: "webm" };
}

/**
 * Load a video file into an HTMLVideoElement and resolve when metadata is ready.
 */
export function loadVideo(file: File | Blob): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.playsInline = true;
    video.muted = false;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      resolve(video);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video file. Codec or format may not be supported by this browser."));
    };
  });
}

/**
 * Calculate greatest common divisor for aspect ratio formatting
 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function calculateAspectRatio(width: number, height: number): string {
  if (!width || !height) return "N/A";
  const divisor = gcd(width, height);
  const w = width / divisor;
  const h = height / divisor;
  if ((w === 16 && h === 9) || (w === 4 && h === 3) || (w === 1 && h === 1) || (w === 9 && h === 16)) {
    return `${w}:${h}`;
  }
  const ratio = (width / height).toFixed(2);
  return `${w}:${h} (~${ratio}:1)`;
}

/**
 * Inspect video technical properties
 */
export async function getVideoMetadata(file: File): Promise<VideoInfo> {
  const video = await loadVideo(file);
  const duration = video.duration || 0;
  const width = video.videoWidth || 0;
  const height = video.videoHeight || 0;
  const bitrateKbps = duration > 0 ? Math.round((file.size * 8) / (duration * 1000)) : 0;

  // Check if audio track exists by inspecting mozHasAudio, webkitAudioDecodedByteCount or audio tracks
  const hasAudio =
    (video as unknown as { mozHasAudio?: boolean }).mozHasAudio ??
    (video as unknown as { webkitAudioDecodedByteCount?: number }).webkitAudioDecodedByteCount !== 0;

  URL.revokeObjectURL(video.src);

  return {
    name: file.name,
    size: file.size,
    duration,
    width,
    height,
    aspectRatio: calculateAspectRatio(width, height),
    mimeType: file.type || "video/mp4",
    hasAudio: Boolean(hasAudio),
    bitrateKbps,
  };
}

/**
 * Capture frame from video at timestamp
 */
export function captureFrameAt(
  video: HTMLVideoElement,
  timeSec: number,
  format: "image/png" | "image/jpeg" = "image/png",
  quality = 0.92
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const handleSeeked = () => {
      video.removeEventListener("seeked", handleSeeked);

      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not initialize canvas context");

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas frame extraction failed"));
              return;
            }
            const dataUrl = canvas.toDataURL(format, quality);
            resolve({ blob, dataUrl, width: canvas.width, height: canvas.height });
          },
          format,
          quality
        );
      } catch (err) {
        reject(err);
      }
    };

    video.addEventListener("seeked", handleSeeked);
    video.currentTime = Math.max(0, Math.min(timeSec, video.duration));
  });
}

/**
 * Simple, self-contained LZW Animated GIF Encoder.
 * Produces genuine, animated GIF89a files in browser without external dependencies.
 */
export class SimpleGifEncoder {
  private width: number;
  private height: number;
  private delay: number; // 1/100ths of second
  private stream: number[] = [];

  constructor(width: number, height: number, delayMs: number) {
    this.width = width;
    this.height = height;
    this.delay = Math.round(delayMs / 10);
    this.writeHeader();
  }

  private writeHeader() {
    // GIF89a signature
    this.writeString("GIF89a");
    // Logical screen descriptor
    this.writeWord(this.width);
    this.writeWord(this.height);
    // GCT Flag: 0, Color Resolution: 7, Sort: 0, GCT Size: 0
    this.stream.push(0x70);
    this.stream.push(0); // Background Color Index
    this.stream.push(0); // Pixel Aspect Ratio

    // Netscape 2.0 loop extension (loop forever)
    this.stream.push(0x21); // Extension Introducer
    this.stream.push(0xff); // Application Extension Label
    this.stream.push(11); // Block Size
    this.writeString("NETSCAPE2.0");
    this.stream.push(3); // Sub-block length
    this.stream.push(1); // loop sub-block ID
    this.writeWord(0); // loop count (0 = infinite)
    this.stream.push(0); // Block Terminator
  }

  public addFrame(imageData: ImageData) {
    const { data } = imageData;
    const pixelCount = this.width * this.height;

    // Build 64-color palette using uniform RGB quantization
    const palette: number[][] = [];
    const colorMap: Map<number, number> = new Map();

    const indexedPixels = new Uint8Array(pixelCount);

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4;
      // Quantize 8-bit to 4-level RGB (64 colors)
      const r = Math.min(255, Math.floor(data[idx] / 64) * 85);
      const g = Math.min(255, Math.floor(data[idx + 1] / 64) * 85);
      const b = Math.min(255, Math.floor(data[idx + 2] / 64) * 85);
      const rgbKey = (r << 16) | (g << 8) | b;

      let colorIndex = colorMap.get(rgbKey);
      if (colorIndex === undefined) {
        colorIndex = palette.length;
        palette.push([r, g, b]);
        colorMap.set(rgbKey, colorIndex);
      }
      indexedPixels[i] = colorIndex;
    }

    // Pad palette to power of 2 (at least 4, max 256)
    let pow = 2;
    while (1 << pow < palette.length && pow < 8) pow++;
    const paletteSize = 1 << pow;
    while (palette.length < paletteSize) {
      palette.push([0, 0, 0]);
    }

    // Graphics Control Extension
    this.stream.push(0x21); // Extension
    this.stream.push(0xf9); // Graphic Control Label
    this.stream.push(4); // Block size
    this.stream.push(0); // Packed fields: disposal 0, no transparent color
    this.writeWord(this.delay); // Delay time
    this.stream.push(0); // Transparent color index
    this.stream.push(0); // Block terminator

    // Image Descriptor
    this.stream.push(0x2c); // Image separator
    this.writeWord(0); // Left position
    this.writeWord(0); // Top position
    this.writeWord(this.width);
    this.writeWord(this.height);
    // Packed fields: Local Color Table flag (1), Interlace (0), Sort (0), Size (pow - 1)
    this.stream.push(0x80 | (pow - 1));

    // Local Color Table
    for (let i = 0; i < paletteSize; i++) {
      this.stream.push(palette[i][0]);
      this.stream.push(palette[i][1]);
      this.stream.push(palette[i][2]);
    }

    // LZW Compression
    this.compressLZW(indexedPixels, Math.max(2, pow));
  }

  private compressLZW(pixels: Uint8Array, colorDepth: number) {
    const initCodeSize = Math.max(2, colorDepth);
    this.stream.push(initCodeSize);

    const clearCode = 1 << initCodeSize;
    const eoiCode = clearCode + 1;

    let codeSize = initCodeSize + 1;
    let nextCode = eoiCode + 1;

    let curBits = 0;
    let curAcc = 0;
    const buffer: number[] = [];

    const emitBits = (code: number) => {
      curAcc |= code << curBits;
      curBits += codeSize;
      while (curBits >= 8) {
        buffer.push(curAcc & 0xff);
        curAcc >>= 8;
        curBits -= 8;
      }
    };

    // Dictionary using map
    const dict = new Map<string, number>();
    const resetDict = () => {
      dict.clear();
      for (let i = 0; i < clearCode; i++) {
        dict.set(String(i), i);
      }
      codeSize = initCodeSize + 1;
      nextCode = eoiCode + 1;
    };

    emitBits(clearCode);
    resetDict();

    let prefix = String(pixels[0]);

    for (let i = 1; i < pixels.length; i++) {
      const k = String(pixels[i]);
      const combo = prefix + "," + k;

      if (dict.has(combo)) {
        prefix = combo;
      } else {
        emitBits(dict.get(prefix)!);

        if (nextCode < 4096) {
          dict.set(combo, nextCode++);
          if (nextCode >= 1 << codeSize && codeSize < 12) {
            codeSize++;
          }
        } else {
          emitBits(clearCode);
          resetDict();
        }
        prefix = k;
      }
    }

    if (prefix) {
      emitBits(dict.get(prefix)!);
    }
    emitBits(eoiCode);

    if (curBits > 0) {
      buffer.push(curAcc & 0xff);
    }

    // Flush buffer in blocks of <= 255 bytes
    let idx = 0;
    while (idx < buffer.length) {
      const blockSize = Math.min(255, buffer.length - idx);
      this.stream.push(blockSize);
      for (let b = 0; b < blockSize; b++) {
        this.stream.push(buffer[idx + b]);
      }
      idx += blockSize;
    }
    this.stream.push(0); // Sub-block terminator
  }

  public finish(): Blob {
    this.stream.push(0x3b); // Trailer
    return new Blob([new Uint8Array(this.stream)], { type: "image/gif" });
  }

  private writeString(s: string) {
    for (let i = 0; i < s.length; i++) {
      this.stream.push(s.charCodeAt(i));
    }
  }

  private writeWord(n: number) {
    this.stream.push(n & 0xff);
    this.stream.push((n >> 8) & 0xff);
  }
}

/**
 * Format seconds to hh:mm:ss or mm:ss
 */
export function formatVideoTime(seconds: number, includeMs = false): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");

  if (hrs > 0) {
    const hh = String(hrs).padStart(2, "0");
    return includeMs
      ? `${hh}:${mm}:${ss}.${String(ms).padStart(2, "0")}`
      : `${hh}:${mm}:${ss}`;
  }

  return includeMs
    ? `${mm}:${ss}.${String(ms).padStart(2, "0")}`
    : `${mm}:${ss}`;
}

/**
 * Format bytes to human readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
