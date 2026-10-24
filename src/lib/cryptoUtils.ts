/**
 * Client-side cryptographic utilities using Web Crypto API.
 * 100% private, local in-browser processing, zero external transmission.
 */

function getCrypto(): Crypto {
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto;
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto) {
    return globalThis.crypto as Crypto;
  }
  throw new Error("Web Crypto API is not available in the current runtime environment.");
}

// ── 1. SECURE PASSWORD GENERATION ──────────────────────────────
export interface PasswordOptions {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  excludeAmbiguous: boolean; // e.g. 0, O, l, 1, I
}

export function generateSecurePassword(opts: PasswordOptions): string {
  let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lower = "abcdefghijklmnopqrstuvwxyz";
  let numbers = "0123456789";
  let symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  if (opts.excludeAmbiguous) {
    upper = upper.replace(/[OI]/g, "");
    lower = lower.replace(/[ol]/g, "");
    numbers = numbers.replace(/[01]/g, "");
    symbols = symbols.replace(/[|:;]/g, "");
  }

  let pool = "";
  const guaranteed: string[] = [];

  const getSecureRandomChar = (charset: string): string => {
    const array = new Uint32Array(1);
    getCrypto().getRandomValues(array);
    return charset[array[0] % charset.length];
  };

  if (opts.useUpper) {
    pool += upper;
    guaranteed.push(getSecureRandomChar(upper));
  }
  if (opts.useLower) {
    pool += lower;
    guaranteed.push(getSecureRandomChar(lower));
  }
  if (opts.useNumbers) {
    pool += numbers;
    guaranteed.push(getSecureRandomChar(numbers));
  }
  if (opts.useSymbols) {
    pool += symbols;
    guaranteed.push(getSecureRandomChar(symbols));
  }

  if (pool.length === 0) {
    pool = lower;
    guaranteed.push(getSecureRandomChar(lower));
  }

  const result: string[] = [...guaranteed];
  const remaining = Math.max(0, opts.length - guaranteed.length);
  const randomValues = new Uint32Array(remaining);
  getCrypto().getRandomValues(randomValues);

  for (let i = 0; i < remaining; i++) {
    result.push(pool[randomValues[i] % pool.length]);
  }

  // Fisher-Yates shuffle with crypto random
  for (let i = result.length - 1; i > 0; i--) {
    const rand = new Uint32Array(1);
    getCrypto().getRandomValues(rand);
    const j = rand[0] % (i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result.join("");
}

// ── 2. PASSWORD STRENGTH & ENTROPY ─────────────────────────────
export interface StrengthResult {
  entropyBits: number;
  score: 0 | 1 | 2 | 3 | 4; // Very Weak, Weak, Fair, Strong, Very Strong
  label: string;
  crackTimeOffline: string;
  crackTimeOnline: string;
  warnings: string[];
  suggestions: string[];
}

export function evaluatePasswordStrength(password: string): StrengthResult {
  if (!password) {
    return {
      entropyBits: 0,
      score: 0,
      label: "None",
      crackTimeOffline: "Instant",
      crackTimeOnline: "Instant",
      warnings: [],
      suggestions: ["Enter a password to evaluate strength."],
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  const entropy = Math.max(0, Math.round(password.length * Math.log2(Math.max(1, poolSize))));

  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (password.length < 8) {
    warnings.push("Password is critically short (less than 8 characters).");
  } else if (password.length < 12) {
    suggestions.push("Increase length to at least 14-16 characters for significantly higher security.");
  }

  if (!/[A-Z]/.test(password)) suggestions.push("Add uppercase letters.");
  if (!/[a-z]/.test(password)) suggestions.push("Add lowercase letters.");
  if (!/[0-9]/.test(password)) suggestions.push("Add numeric digits.");
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push("Add special characters / symbols.");

  // Check repeating chars
  if (/(.)\1{2,}/.test(password)) {
    warnings.push("Contains repeated characters (e.g. 'aaa' or '111').");
  }

  // Common simple patterns
  const lower = password.toLowerCase();
  if (["password", "123456", "qwerty", "admin", "welcome", "letmein"].some((s) => lower.includes(s))) {
    warnings.push("Contains common dictionary patterns or keyboard sequences.");
  }

  let score: 0 | 1 | 2 | 3 | 4 = 0;
  let label = "Very Weak";

  if (entropy < 28) {
    score = 0;
    label = "Very Weak";
  } else if (entropy < 45) {
    score = 1;
    label = "Weak";
  } else if (entropy < 65) {
    score = 2;
    label = "Fair";
  } else if (entropy < 85) {
    score = 3;
    label = "Strong";
  } else {
    score = 4;
    label = "Very Strong";
  }

  // Format crack times (Offline fast hash attack @ 10^10 hashes/sec vs Online throttled @ 100/sec)
  const totalCombinations = Math.pow(Math.max(1, poolSize), password.length);
  const secondsOffline = totalCombinations / 1e10;
  const secondsOnline = totalCombinations / 100;

  const formatDuration = (sec: number): string => {
    if (sec < 1) return "Instant (< 1 sec)";
    if (sec < 60) return `${Math.round(sec)} seconds`;
    if (sec < 3600) return `${Math.round(sec / 60)} minutes`;
    if (sec < 86400) return `${Math.round(sec / 3600)} hours`;
    if (sec < 86400 * 30) return `${Math.round(sec / 86400)} days`;
    if (sec < 86400 * 365) return `${Math.round(sec / (86400 * 30))} months`;
    if (sec < 86400 * 365 * 100) return `${Math.round(sec / (86400 * 365))} years`;
    if (sec < 86400 * 365 * 1e6) return `${Math.round(sec / (86400 * 365 * 1000))} thousand years`;
    return "Millions of years";
  };

  return {
    entropyBits: entropy,
    score,
    label,
    crackTimeOffline: formatDuration(secondsOffline),
    crackTimeOnline: formatDuration(secondsOnline),
    warnings,
    suggestions,
  };
}

// ── 3. AUTHENTICATED AES-GCM ENCRYPTION / DECRYPTION ────────────
const PBKDF2_ITERATIONS = 100000;
const BASE64_CHUNK_SIZE = 0x8000; // 32,768 elements per chunk: prevents stack overflow and avoids huge intermediate strings

/**
 * Encodes an ArrayBuffer to a standard base64 string using safe chunking.
 * Handles large buffers without Call Stack Overflow or memory thrashing.
 */
export function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  if (len === 0) return "";

  // Use Node.js Buffer in server / testing environments
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buf).toString("base64");
  }

  // Safe chunked processing in browser environments
  const chunks: string[] = [];
  for (let i = 0; i < len; i += BASE64_CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + BASE64_CHUNK_SIZE, len));
    chunks.push(String.fromCharCode.apply(null, chunk as unknown as number[]));
  }
  return window.btoa(chunks.join(""));
}

/**
 * Decodes a base64 string back into an ArrayBuffer.
 */
export function base64ToBuffer(b64: string): ArrayBuffer {
  const cleanB64 = b64.trim();
  if (!cleanB64) return new ArrayBuffer(0);

  // Use Node.js Buffer in server / testing environments
  if (typeof Buffer !== "undefined") {
    const nodeBuf = Buffer.from(cleanB64, "base64");
    return nodeBuf.buffer.slice(nodeBuf.byteOffset, nodeBuf.byteOffset + nodeBuf.byteLength);
  }

  const binary = window.atob(cleanB64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptAesGcm(plainText: string, passphrase: string): Promise<string> {
  if (!passphrase) {
    throw new Error("A secure passphrase is required for encryption.");
  }

  const cryptoInstance = getCrypto();

  const salt = new Uint8Array(16);
  cryptoInstance.getRandomValues(salt);

  const iv = new Uint8Array(12); // Standard 96-bit nonce for AES-GCM
  cryptoInstance.getRandomValues(iv);

  const enc = new TextEncoder();
  const passwordKey = await cryptoInstance.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const aesKey = await cryptoInstance.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const cipherBuffer = await cryptoInstance.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    enc.encode(plainText)
  );

  const payload = {
    v: 1,
    alg: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iter: PBKDF2_ITERATIONS,
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer),
    data: bufferToBase64(cipherBuffer),
  };

  return JSON.stringify(payload);
}

export async function decryptAesGcm(encryptedJson: string, passphrase: string): Promise<string> {
  if (!passphrase) {
    throw new Error("A passphrase is required for decryption.");
  }

  let payload: { v: number; salt: string; iv: string; data: string };
  try {
    payload = JSON.parse(encryptedJson.trim());
  } catch {
    throw new Error("Invalid encrypted format. Expected a valid AES-GCM payload JSON.");
  }

  if (!payload.salt || !payload.iv || !payload.data) {
    throw new Error("Missing cryptographic components (salt, iv, or data).");
  }

  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.data);

  const cryptoInstance = getCrypto();
  const enc = new TextEncoder();
  const passwordKey = await cryptoInstance.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const aesKey = await cryptoInstance.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  try {
    const decryptedBuffer = await cryptoInstance.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      aesKey,
      ciphertext
    );
    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    throw new Error("Decryption failed. Incorrect passphrase or corrupted/tampered data.");
  }
}

// ── 4. WEB CRYPTO HASHING ──────────────────────────────────────
export async function computeHash(
  data: string | ArrayBuffer,
  algorithm: "SHA-256" | "SHA-512" | "SHA-1" = "SHA-256"
): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === "string") {
    buffer = new TextEncoder().encode(data).buffer;
  } else {
    buffer = data;
  }

  const hashBuffer = await getCrypto().subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── 5. SECURE TOKENS & RANDOM STRINGS ──────────────────────────
export type TokenType = "hex" | "base64" | "alphanumeric" | "numeric";

export function generateSecureToken(type: TokenType, length: number): string {
  const cryptoInstance = getCrypto();

  if (type === "hex") {
    const bytesCount = Math.ceil(length / 2);
    const bytes = new Uint8Array(bytesCount);
    cryptoInstance.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hex.slice(0, length);
  }

  if (type === "base64") {
    const bytesCount = Math.ceil((length * 3) / 4);
    const bytes = new Uint8Array(bytesCount);
    cryptoInstance.getRandomValues(bytes);
    const b64 = bufferToBase64(bytes.buffer).replace(/[/+=]/g, "");
    return b64.slice(0, length);
  }

  let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  if (type === "alphanumeric") {
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  } else if (type === "numeric") {
    charset = "0123456789";
  }

  const randomValues = new Uint32Array(length);
  cryptoInstance.getRandomValues(randomValues);
  let res = "";
  for (let i = 0; i < length; i++) {
    res += charset[randomValues[i] % charset.length];
  }
  return res;
}

// ── 6. UNICODE-SAFE BASE64 ENCODING / DECODING ─────────────────
export function utf8ToBase64(str: string): string {
  if (!str) return "";
  const bytes = new TextEncoder().encode(str);
  return bufferToBase64(bytes.buffer);
}

export function base64ToUtf8(b64: string): string {
  const clean = b64.trim();
  if (!clean) return "";
  const buf = base64ToBuffer(clean);
  return new TextDecoder().decode(buf);
}

// ── 7. URL ENCODING / DECODING ─────────────────────────────────
export function safeUrlEncode(str: string, componentMode = true): string {
  return componentMode ? encodeURIComponent(str) : encodeURI(str);
}

export function safeUrlDecode(str: string, componentMode = true): string {
  return componentMode ? decodeURIComponent(str) : decodeURI(str);
}
