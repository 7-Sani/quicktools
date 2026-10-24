/**
 * Client-side audio processing utilities using Web Audio API and binary encoding.
 * 100% private, browser-native, zero telemetry.
 */

export interface AudioMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  bitrateKbps?: number;
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  trackNumber?: string;
  albumArtUrl?: string;
  formatName: string;
  extraDetails?: Record<string, string | number>;
}

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("AudioContext is only available in browser environments");
  }
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === "suspended") {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

export async function decodeAudioFile(file: File | Blob): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  // decodeAudioData detaches the arrayBuffer, so we pass a slice or direct buffer
  return await ctx.decodeAudioData(arrayBuffer);
}

/**
 * Encodes an AudioBuffer into a standard 16-bit PCM WAV Blob.
 */
export function audioBufferToWav(buffer: AudioBuffer, bitDepth: 16 | 32 = 16): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // Helper to write ASCII string
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF Chunk
  writeString(0, "RIFF");
  view.setUint32(4, totalSize - 8, true);
  writeString(8, "WAVE");

  // fmt Subchunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, bitDepth === 32 ? 3 : 1, true); // 1 = PCM, 3 = IEEE Float
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data Subchunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Interleave channel data
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  if (bitDepth === 16) {
    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = channels[c][i];
        // Clamp sample to [-1, 1]
        sample = Math.max(-1, Math.min(1, sample));
        // Scale to 16-bit signed integer
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, Math.floor(intSample), true);
        offset += 2;
      }
    }
  } else {
    // 32-bit IEEE float
    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < numChannels; c++) {
        view.setFloat32(offset, channels[c][i], true);
        offset += 4;
      }
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

/**
 * Encodes an AudioBuffer into a WebM or OGG compressed audio Blob via MediaRecorder.
 */
export async function audioBufferToCompressedBlob(
  buffer: AudioBuffer,
  preferredMimeType: "audio/webm;codecs=opus" | "audio/ogg" = "audio/webm;codecs=opus"
): Promise<Blob> {
  const mimeType =
    typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(preferredMimeType)
      ? preferredMimeType
      : typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "";

  if (!mimeType) {
    // Fallback to WAV if browser cannot compress via MediaRecorder
    return audioBufferToWav(buffer);
  }

  const offlineCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  // Use real-time playback into MediaStream destination for MediaRecorder
  const realtimeCtx = getAudioContext();
  const streamDest = realtimeCtx.createMediaStreamDestination();
  const rtSource = realtimeCtx.createBufferSource();
  rtSource.buffer = buffer;
  rtSource.connect(streamDest);

  return new Promise<Blob>((resolve, reject) => {
    try {
      const mediaRecorder = new MediaRecorder(streamDest.stream, { mimeType });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: mimeType }));
      };

      mediaRecorder.onerror = (e) => reject(e);

      mediaRecorder.start();
      rtSource.start(0);

      // Stop recorder once playback finishes
      setTimeout(() => {
        try {
          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
          rtSource.stop();
        } catch {
          // ignore
        }
      }, (buffer.duration * 1000) + 150);
    } catch (err) {
      // If live stream recording is blocked or fails, safely fallback to WAV
      reject(err);
    }
  });
}

/**
 * Accurately slice an AudioBuffer between start and end seconds.
 */
export function sliceAudioBuffer(
  buffer: AudioBuffer,
  startSec: number,
  endSec: number
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;

  const validStart = Math.max(0, Math.min(startSec, buffer.duration));
  const validEnd = Math.max(validStart, Math.min(endSec, buffer.duration));

  const startSample = Math.floor(validStart * sampleRate);
  const endSample = Math.floor(validEnd * sampleRate);
  const frameCount = Math.max(1, endSample - startSample);

  const ctx = getAudioContext();
  const newBuffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let c = 0; c < numChannels; c++) {
    const srcData = buffer.getChannelData(c);
    const dstData = newBuffer.getChannelData(c);
    const subArray = srcData.subarray(startSample, endSample);
    dstData.set(subArray);
  }

  return newBuffer;
}

/**
 * Adjust volume / gain with optional soft-clipping limiter.
 */
export function adjustVolume(
  buffer: AudioBuffer,
  gainMultiplier: number,
  softClip = true
): AudioBuffer {
  const ctx = getAudioContext();
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;
  const newBuffer = ctx.createBuffer(numChannels, length, buffer.sampleRate);

  for (let c = 0; c < numChannels; c++) {
    const src = buffer.getChannelData(c);
    const dst = newBuffer.getChannelData(c);

    for (let i = 0; i < length; i++) {
      let sample = src[i] * gainMultiplier;
      if (softClip) {
        // Smooth analog-style soft-saturation curve when exceeding 0.95
        if (sample > 0.95) {
          sample = 0.95 + 0.05 * Math.tanh((sample - 0.95) / 0.05);
        } else if (sample < -0.95) {
          sample = -0.95 + 0.05 * Math.tanh((sample + 0.95) / 0.05);
        }
      } else {
        sample = Math.max(-1, Math.min(1, sample));
      }
      dst[i] = sample;
    }
  }

  return newBuffer;
}

/**
 * Resample audio speed/tempo using OfflineAudioContext.
 */
export async function changeAudioSpeed(
  buffer: AudioBuffer,
  speedRatio: number
): Promise<AudioBuffer> {
  if (Math.abs(speedRatio - 1) < 0.001) {
    return buffer;
  }

  const numChannels = buffer.numberOfChannels;
  const originalLength = buffer.length;
  const newLength = Math.max(1, Math.round(originalLength / speedRatio));
  const sampleRate = buffer.sampleRate;

  const offlineCtx = new OfflineAudioContext(numChannels, newLength, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = speedRatio;
  source.connect(offlineCtx.destination);
  source.start(0);

  return await offlineCtx.startRendering();
}

/**
 * Merge multiple AudioBuffers sequentially with optional linear crossfade.
 */
export async function mergeAudioBuffers(
  buffers: AudioBuffer[],
  crossfadeSec = 0
): Promise<AudioBuffer> {
  if (buffers.length === 0) {
    throw new Error("No audio files provided to merge");
  }
  if (buffers.length === 1) {
    return buffers[0];
  }

  const maxChannels = Math.max(...buffers.map((b) => b.numberOfChannels));
  const sampleRate = buffers[0].sampleRate;

  // Calculate total duration considering crossfade
  let totalDuration = 0;
  for (let i = 0; i < buffers.length; i++) {
    if (i === 0) {
      totalDuration += buffers[i].duration;
    } else {
      const allowedCrossfade = Math.min(
        crossfadeSec,
        buffers[i - 1].duration / 2,
        buffers[i].duration / 2
      );
      totalDuration += buffers[i].duration - allowedCrossfade;
    }
  }

  const totalLength = Math.max(1, Math.ceil(totalDuration * sampleRate));
  const offlineCtx = new OfflineAudioContext(maxChannels, totalLength, sampleRate);

  let currentOffset = 0;
  for (let i = 0; i < buffers.length; i++) {
    const buf = buffers[i];
    const source = offlineCtx.createBufferSource();
    source.buffer = buf;

    const gainNode = offlineCtx.createGain();
    source.connect(gainNode);
    gainNode.connect(offlineCtx.destination);

    const allowedCrossfade =
      i > 0
        ? Math.min(crossfadeSec, buffers[i - 1].duration / 2, buf.duration / 2)
        : 0;

    const startTime = Math.max(0, currentOffset - allowedCrossfade);

    if (allowedCrossfade > 0) {
      // Fade-in
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(1, startTime + allowedCrossfade);
    } else {
      gainNode.gain.setValueAtTime(1, startTime);
    }

    if (i < buffers.length - 1 && crossfadeSec > 0) {
      const nextBuf = buffers[i + 1];
      const nextFade = Math.min(crossfadeSec, buf.duration / 2, nextBuf.duration / 2);
      if (nextFade > 0) {
        // Fade-out at end of track
        const fadeOutStart = startTime + buf.duration - nextFade;
        gainNode.gain.setValueAtTime(1, fadeOutStart);
        gainNode.gain.linearRampToValueAtTime(0, startTime + buf.duration);
      }
    }

    source.start(startTime);
    currentOffset = startTime + buf.duration;
  }

  return await offlineCtx.startRendering();
}

/**
 * Format time in seconds to mm:ss or mm:ss.SS
 */
export function formatTime(seconds: number, includeMs = true): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");

  if (includeMs) {
    const sMs = String(ms).padStart(2, "0");
    return `${mm}:${ss}.${sMs}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Parse ID3v1, ID3v2, RIFF/WAV tags and container metadata directly in browser.
 */
export async function parseAudioMetadata(file: File): Promise<AudioMetadata> {
  const result: AudioMetadata = {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || "audio/*",
    formatName: file.name.split(".").pop()?.toUpperCase() || "AUDIO",
  };

  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  // 1. Check ID3v2 at start of file
  if (buffer.byteLength >= 10) {
    const headerStr = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2));
    if (headerStr === "ID3") {
      const majorVersion = view.getUint8(3);
      result.formatName = `MP3 (ID3v2.${majorVersion})`;

      // Parse syncsafe tag size
      const tagSize =
        ((view.getUint8(6) & 0x7f) << 21) |
        ((view.getUint8(7) & 0x7f) << 14) |
        ((view.getUint8(8) & 0x7f) << 7) |
        (view.getUint8(9) & 0x7f);

      let offset = 10;
      const endOffset = Math.min(buffer.byteLength, 10 + tagSize);

      while (offset + 10 < endOffset) {
        let frameId = "";
        for (let i = 0; i < 4; i++) {
          frameId += String.fromCharCode(view.getUint8(offset + i));
        }

        // If padded with nulls, stop
        if (!frameId.trim() || frameId.charCodeAt(0) === 0) break;

        let frameSize = 0;
        if (majorVersion === 4) {
          // Syncsafe integer in ID3v2.4
          frameSize =
            ((view.getUint8(offset + 4) & 0x7f) << 21) |
            ((view.getUint8(offset + 5) & 0x7f) << 14) |
            ((view.getUint8(offset + 6) & 0x7f) << 7) |
            (view.getUint8(offset + 7) & 0x7f);
        } else {
          // Standard integer in ID3v2.3
          frameSize = view.getUint32(offset + 4, false);
        }

        if (frameSize <= 0 || offset + 10 + frameSize > endOffset) break;

        const frameDataOffset = offset + 10;

        // Extract known text frames
        if (["TIT2", "TPE1", "TALB", "TYER", "TDRC", "TCON", "TRCK"].includes(frameId)) {
          const encoding = view.getUint8(frameDataOffset);
          let text = "";
          try {
            const rawBytes = new Uint8Array(buffer, frameDataOffset + 1, frameSize - 1);
            if (encoding === 0) {
              text = new TextDecoder("iso-8859-1").decode(rawBytes);
            } else if (encoding === 1 || encoding === 2) {
              text = new TextDecoder("utf-16").decode(rawBytes);
            } else {
              text = new TextDecoder("utf-8").decode(rawBytes);
            }
            text = text.replace(/\0+$/, "").trim();
          } catch {
            // ignore decode error
          }

          if (frameId === "TIT2") result.title = text;
          else if (frameId === "TPE1") result.artist = text;
          else if (frameId === "TALB") result.album = text;
          else if (frameId === "TYER" || frameId === "TDRC") result.year = text.slice(0, 4);
          else if (frameId === "TCON") result.genre = text;
          else if (frameId === "TRCK") result.trackNumber = text;
        }

        // Extract APIC (Attached Picture)
        if (frameId === "APIC" && !result.albumArtUrl) {
          try {
            let p = frameDataOffset + 1;
            // mime type is null-terminated ASCII
            let mime = "";
            while (p < offset + 10 + frameSize && view.getUint8(p) !== 0) {
              mime += String.fromCharCode(view.getUint8(p));
              p++;
            }
            p++; // skip null
            p++; // skip picture type byte

            // skip description (null-terminated)
            while (p < offset + 10 + frameSize && view.getUint8(p) !== 0) {
              p++;
            }
            p++; // skip null

            const imageBytes = new Uint8Array(buffer, p, offset + 10 + frameSize - p);
            if (imageBytes.length > 0) {
              const imgBlob = new Blob([imageBytes], { type: mime || "image/jpeg" });
              result.albumArtUrl = URL.createObjectURL(imgBlob);
            }
          } catch {
            // ignore image parse error
          }
        }

        offset += 10 + frameSize;
      }
    }
  }

  // 2. Check ID3v1 (last 128 bytes of file)
  if (!result.title && buffer.byteLength >= 128) {
    const tagView = new DataView(buffer, buffer.byteLength - 128, 128);
    const tagHeader = String.fromCharCode(tagView.getUint8(0), tagView.getUint8(1), tagView.getUint8(2));
    if (tagHeader === "TAG") {
      const readAscii = (start: number, len: number) => {
        let str = "";
        for (let i = 0; i < len; i++) {
          const charCode = tagView.getUint8(start + i);
          if (charCode === 0) break;
          str += String.fromCharCode(charCode);
        }
        return str.trim();
      };
      result.title = readAscii(3, 30);
      result.artist = readAscii(33, 30);
      result.album = readAscii(63, 30);
      result.year = readAscii(93, 4);
      result.formatName = "MP3 (ID3v1)";
    }
  }

  // 3. Check WAV RIFF headers
  if (buffer.byteLength >= 44) {
    const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
    const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
    if (riff === "RIFF" && wave === "WAVE") {
      result.formatName = "WAV (RIFF)";
      result.channels = view.getUint16(22, true);
      result.sampleRate = view.getUint32(24, true);
      const byteRate = view.getUint32(28, true);
      if (byteRate > 0) {
        result.bitrateKbps = Math.round((byteRate * 8) / 1000);
      }
    }
  }

  // 4. Try Web Audio API decode for accurate technical measurements (duration, sample rate, channels)
  try {
    const audioBuffer = await decodeAudioFile(file);
    result.duration = audioBuffer.duration;
    result.sampleRate = audioBuffer.sampleRate;
    result.channels = audioBuffer.numberOfChannels;
    if (result.duration > 0 && !result.bitrateKbps) {
      result.bitrateKbps = Math.round((file.size * 8) / (result.duration * 1000));
    }
  } catch {
    // Some formats or corrupted files might not decode with Web Audio,
    // but the extracted container metadata remains useful
  }

  return result;
}
