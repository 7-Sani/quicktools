import { NextRequest } from "next/server";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

// In-memory fallback cache for development or when distributed cache is not configured
interface MemoryRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, MemoryRecord>();

// Periodically prune stale in-memory records
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetTime < now) {
      memoryStore.delete(key);
    }
  }
}, 60000).unref?.();

/**
 * Extracts client IP from NextRequest securely.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP from the comma-separated list (client IP)
    const clientIp = forwarded.split(",")[0].trim();
    if (clientIp) return clientIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Checks and increments rate limit counter.
 * Supports Upstash Redis REST API when configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN),
 * and falls back to an in-memory window when running in development.
 *
 * @param identifier Unique key (e.g., `ai_text:${clientIp}`)
 * @param limit Max allowed requests within window
 * @param windowSeconds Window duration in seconds
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. If Upstash Redis is configured, use distributed pipeline
  if (redisUrl && redisToken) {
    try {
      const pipelineUrl = `${redisUrl.replace(/\/$/, "")}/pipeline`;
      const response = await fetch(pipelineUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", identifier],
          ["EXPIRE", identifier, windowSeconds, "NX"],
          ["TTL", identifier],
        ]),
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const results = await response.json();
        const currentCount = Number(results[0]?.result || 1);
        const ttl = Number(results[2]?.result || windowSeconds);
        const resetSeconds = ttl > 0 ? ttl : windowSeconds;
        const remaining = Math.max(0, limit - currentCount);

        return {
          success: currentCount <= limit,
          limit,
          remaining,
          resetSeconds,
        };
      }
    } catch (err) {
      console.warn("Distributed rate limiter unavailable, falling back to local memory store:", err);
    }
  }

  // 2. In-memory rate limiting fallback
  const now = Date.now();
  const existing = memoryStore.get(identifier);

  if (!existing || existing.resetTime <= now) {
    memoryStore.set(identifier, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const resetSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));

  return {
    success: existing.count <= limit,
    limit,
    remaining,
    resetSeconds,
  };
}
