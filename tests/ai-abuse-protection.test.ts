import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "../src/lib/rateLimiter";
import { POST as textRoute } from "../src/app/api/ai/text/route";
import { POST as visionRoute } from "../src/app/api/ai/vision/route";
import { POST as removeBgRoute } from "../src/app/api/ai/remove-bg/route";
import { NextRequest } from "next/server";

describe("AI API Abuse Protection & Input Validation", () => {
  describe("Rate Limiter", () => {
    it("tracks and restricts requests exceeding limit", async () => {
      const testKey = `test_rate_limit_${Date.now()}`;
      const limit = 3;
      const windowSeconds = 10;

      const res1 = await checkRateLimit(testKey, limit, windowSeconds);
      assert.strictEqual(res1.success, true);
      assert.strictEqual(res1.remaining, 2);

      const res2 = await checkRateLimit(testKey, limit, windowSeconds);
      assert.strictEqual(res2.success, true);
      assert.strictEqual(res2.remaining, 1);

      const res3 = await checkRateLimit(testKey, limit, windowSeconds);
      assert.strictEqual(res3.success, true);
      assert.strictEqual(res3.remaining, 0);

      // Exceeded
      const res4 = await checkRateLimit(testKey, limit, windowSeconds);
      assert.strictEqual(res4.success, false);
      assert.strictEqual(res4.remaining, 0);
    });
  });

  describe("AI Text Route Validation", () => {
    it("rejects empty text / prompt requests with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "   " }),
      });
      const res = await textRoute(req);
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.error, "BAD_REQUEST");
    });

    it("rejects oversized input text exceeding 12,000 characters with 413", async () => {
      const hugeText = "A".repeat(12500);
      const req = new NextRequest("http://localhost:3000/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: hugeText }),
      });
      const res = await textRoute(req);
      assert.strictEqual(res.status, 413);
      const json = await res.json();
      assert.strictEqual(json.error, "PAYLOAD_TOO_LARGE");
    });

    it("rejects invalid actions with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Valid text", action: "malicious_exploit" }),
      });
      const res = await textRoute(req);
      assert.strictEqual(res.status, 400);
    });
  });

  describe("AI Vision Route Validation", () => {
    it("rejects requests missing image with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Hello" }),
      });
      const res = await visionRoute(req);
      assert.strictEqual(res.status, 400);
    });

    it("rejects unsupported MIME types with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" }),
      });
      const res = await visionRoute(req);
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.ok(json.error.includes("Unsupported image MIME type"));
    });
  });

  describe("AI Remove Background Route Validation", () => {
    it("rejects non-multipart requests with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await removeBgRoute(req);
      assert.strictEqual(res.status, 400);
    });
  });
});
