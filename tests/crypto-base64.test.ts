import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  bufferToBase64,
  base64ToBuffer,
  utf8ToBase64,
  base64ToUtf8,
  encryptAesGcm,
  decryptAesGcm,
} from "../src/lib/cryptoUtils";

describe("Crypto & Base64 Performance & Authenticity", () => {
  describe("Base64 Safe Chunked Processing", () => {
    it("handles empty buffers correctly", () => {
      const empty = new ArrayBuffer(0);
      const b64 = bufferToBase64(empty);
      assert.strictEqual(b64, "");
      const restored = base64ToBuffer(b64);
      assert.strictEqual(restored.byteLength, 0);
    });

    it("round-trips small buffers accurately", () => {
      const bytes = new Uint8Array([1, 2, 3, 4, 250, 251, 252, 255]);
      const b64 = bufferToBase64(bytes.buffer);
      const restored = new Uint8Array(base64ToBuffer(b64));
      assert.deepStrictEqual(restored, bytes);
    });

    it("processes large buffers (100,000 bytes) without stack overflow or data corruption", () => {
      const size = 100000;
      const largeBytes = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        largeBytes[i] = (i * 37) & 0xff;
      }

      const b64 = bufferToBase64(largeBytes.buffer);
      assert.ok(b64.length > 0);

      const restored = new Uint8Array(base64ToBuffer(b64));
      assert.strictEqual(restored.byteLength, size);
      assert.deepStrictEqual(restored, largeBytes);
    });

    it("correctly round-trips UTF-8 strings including multi-byte Unicode and emojis", () => {
      const sample = "QuickTools 🚀 Confidential Message: 🔐 Привет мир! 日本語 🌍";
      const b64 = utf8ToBase64(sample);
      const restored = base64ToUtf8(b64);
      assert.strictEqual(restored, sample);
    });
  });

  describe("Authenticated AES-256-GCM Encryption / Decryption", () => {
    it("successfully encrypts and decrypts with the correct passphrase", async () => {
      const secret = "TopSecretMessage123!@#";
      const pass = "SuperStrongPassphrase2026!";

      const encryptedPayload = await encryptAesGcm(secret, pass);
      assert.ok(encryptedPayload.includes("AES-256-GCM"));
      assert.ok(encryptedPayload.includes("PBKDF2-SHA256"));

      const decrypted = await decryptAesGcm(encryptedPayload, pass);
      assert.strictEqual(decrypted, secret);
    });

    it("fails decryption when an incorrect passphrase is used", async () => {
      const secret = "Secret";
      const correctPass = "CorrectPass123";
      const wrongPass = "WrongPass456";

      const encryptedPayload = await encryptAesGcm(secret, correctPass);
      await assert.rejects(
        () => decryptAesGcm(encryptedPayload, wrongPass),
        /Decryption failed/
      );
    });

    it("detects tampering and rejects modified encrypted ciphertext", async () => {
      const secret = "AuthenticMessage";
      const pass = "Passphrase";

      const encryptedJson = await encryptAesGcm(secret, pass);
      const parsed = JSON.parse(encryptedJson);

      // Flip characters in the ciphertext data
      const dataStr = parsed.data;
      const tamperedChar = dataStr[0] === "A" ? "B" : "A";
      parsed.data = tamperedChar + dataStr.slice(1);

      await assert.rejects(
        () => decryptAesGcm(JSON.stringify(parsed), pass),
        /Decryption failed/
      );
    });
  });
});
