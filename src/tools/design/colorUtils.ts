/**
 * Comprehensive Color & Design Utilities for Web Applications
 * Supports HEX, RGB, HSL, HSV, CMYK conversions, WCAG 2.1 contrast calculations, and harmonies.
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
  a?: number;
}

export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

export interface CmykColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

// ─── HEX to RGB ─────────────────────────────────────────────────
export function hexToRgb(hexStr: string): RgbColor | null {
  let hex = hexStr.replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) return null;

  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (hex.length === 6) {
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      a: 1,
    };
  }

  if (hex.length === 8) {
    const num = parseInt(hex, 16);
    return {
      r: (num >> 24) & 255,
      g: (num >> 16) & 255,
      b: (num >> 8) & 255,
      a: Number(((num & 255) / 255).toFixed(2)),
    };
  }

  return null;
}

// ─── RGB to HEX ─────────────────────────────────────────────────
export function rgbToHex(r: number, g: number, b: number, a?: number): string {
  const clampR = Math.min(255, Math.max(0, Math.round(r)));
  const clampG = Math.min(255, Math.max(0, Math.round(g)));
  const clampB = Math.min(255, Math.max(0, Math.round(b)));

  const hexR = clampR.toString(16).padStart(2, "0");
  const hexG = clampG.toString(16).padStart(2, "0");
  const hexB = clampB.toString(16).padStart(2, "0");

  if (a !== undefined && a < 1) {
    const clampA = Math.min(255, Math.max(0, Math.round(a * 255)));
    const hexA = clampA.toString(16).padStart(2, "0");
    return `#${hexR}${hexG}${hexB}${hexA}`.toUpperCase();
  }

  return `#${hexR}${hexG}${hexB}`.toUpperCase();
}

// ─── RGB to HSL ─────────────────────────────────────────────────
export function rgbToHsl(r: number, g: number, b: number, a?: number): HslColor {
  const rNorm = Math.min(255, Math.max(0, r)) / 255;
  const gNorm = Math.min(255, Math.max(0, g)) / 255;
  const bNorm = Math.min(255, Math.max(0, b)) / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: a ?? 1,
  };
}

// ─── HSL to RGB ─────────────────────────────────────────────────
export function hslToRgb(h: number, s: number, l: number, a?: number): RgbColor {
  const hNorm = (((h % 360) + 360) % 360) / 360;
  const sNorm = Math.min(100, Math.max(0, s)) / 100;
  const lNorm = Math.min(100, Math.max(0, l)) / 100;

  let r: number, g: number, b: number;

  if (sNorm === 0) {
    r = g = b = lNorm;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tNorm = t;
      if (tNorm < 0) tNorm += 1;
      if (tNorm > 1) tNorm -= 1;
      if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
      if (tNorm < 1 / 2) return q;
      if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
      return p;
    };

    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: a ?? 1,
  };
}

// ─── RGB to HSV ─────────────────────────────────────────────────
export function rgbToHsv(r: number, g: number, b: number): HsvColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

// ─── RGB to CMYK ────────────────────────────────────────────────
export function rgbToCmyk(r: number, g: number, b: number): CmykColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

// ─── WCAG 2.1 Relative Luminance ─────────────────────────────────
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    const norm = v / 255;
    return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

// ─── WCAG 2.1 Contrast Ratio ─────────────────────────────────────
export function getContrastRatio(rgb1: RgbColor, rgb2: RgbColor): number {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Number(ratio.toFixed(2));
}

// ─── Color Harmonies ────────────────────────────────────────────
export function getColorHarmonies(hex: string): {
  complementary: string;
  analogous: [string, string];
  triadic: [string, string];
  tetradic: [string, string, string];
  splitComplementary: [string, string];
} {
  const rgb = hexToRgb(hex) || { r: 49, g: 92, b: 255 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const getHexFromHue = (hShift: number) => {
    const newHue = (hsl.h + hShift + 360) % 360;
    const newRgb = hslToRgb(newHue, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  };

  return {
    complementary: getHexFromHue(180),
    analogous: [getHexFromHue(-30), getHexFromHue(30)],
    triadic: [getHexFromHue(120), getHexFromHue(240)],
    tetradic: [getHexFromHue(90), getHexFromHue(180), getHexFromHue(270)],
    splitComplementary: [getHexFromHue(150), getHexFromHue(210)],
  };
}

// ─── Tints and Shades Generator ──────────────────────────────────
export function getTintsAndShades(hex: string, steps = 5): { tints: string[]; shades: string[] } {
  const rgb = hexToRgb(hex) || { r: 49, g: 92, b: 255 };
  const tints: string[] = [];
  const shades: string[] = [];

  for (let i = 1; i <= steps; i++) {
    const factor = i / (steps + 1);
    // Tint: mix with white (255)
    const tR = Math.round(rgb.r + (255 - rgb.r) * factor);
    const tG = Math.round(rgb.g + (255 - rgb.g) * factor);
    const tB = Math.round(rgb.b + (255 - rgb.b) * factor);
    tints.push(rgbToHex(tR, tG, tB));

    // Shade: mix with black (0)
    const sR = Math.round(rgb.r * (1 - factor));
    const sG = Math.round(rgb.g * (1 - factor));
    const sB = Math.round(rgb.b * (1 - factor));
    shades.push(rgbToHex(sR, sG, sB));
  }

  return { tints, shades };
}
