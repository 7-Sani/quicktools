import { NextRequest, NextResponse } from "next/server";
import http from "node:http";
import https from "node:https";
import { validateAndResolveTarget, ValidatedTarget } from "@/lib/ssrfProtection";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";

interface HttpResponseResult {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  redirectLocation: string | null;
  contentType: string;
  server: string;
}

/**
 * Executes a safe, bounded HTTP/HTTPS request with IP pinning.
 * Pinning the IP address in Agent.lookup eliminates DNS-rebinding attacks.
 */
function requestWithPinnedIp(
  target: ValidatedTarget,
  method: "HEAD" | "GET",
  timeoutMs: number
): Promise<HttpResponseResult> {
  return new Promise((resolve, reject) => {
    const isHttps = target.url.protocol === "https:";
    const transport = isHttps ? https : http;

    const customLookup: https.AgentOptions["lookup"] = (
      _hostname: string,
      options: unknown,
      callback: (
        err: NodeJS.ErrnoException | null,
        address: string | Array<{ address: string; family: number }>,
        family?: number
      ) => void
    ) => {
      const cb = (typeof options === "function" ? options : callback) as (
        err: NodeJS.ErrnoException | null,
        address: string | Array<{ address: string; family: number }>,
        family?: number
      ) => void;
      const opts = typeof options === "object" && options !== null ? (options as { all?: boolean }) : {};
      if (opts.all) {
        cb(null, [{ address: target.resolvedIp, family: target.ipFamily }]);
      } else {
        cb(null, target.resolvedIp, target.ipFamily);
      }
    };

    const agent = isHttps
      ? new https.Agent({ lookup: customLookup, keepAlive: false })
      : new http.Agent({ lookup: customLookup, keepAlive: false });

    const port = target.url.port ? parseInt(target.url.port, 10) : isHttps ? 443 : 80;

    const req = transport.request(
      {
        protocol: target.url.protocol,
        hostname: target.url.hostname,
        port,
        path: `${target.url.pathname}${target.url.search}`,
        method,
        headers: {
          Host: target.url.host,
          "User-Agent": "QuickTools-HTTP-Checker/1.0 (+https://quicktools.app)",
          Accept: "*/*",
          Connection: "close",
        },
        servername: target.url.hostname, // TLS SNI
        agent,
        timeout: timeoutMs,
      },
      (res) => {
        const headersRecord: Record<string, string> = {};
        for (const [key, val] of Object.entries(res.headers)) {
          if (val !== undefined) {
            headersRecord[key] = Array.isArray(val) ? val.join(", ") : val;
          }
        }

        const statusCode = res.statusCode || 200;
        const statusText = res.statusMessage || "OK";
        const redirectLocation = (res.headers["location"] as string) || null;
        const contentType = (res.headers["content-type"] as string) || "unknown";
        const server = (res.headers["server"] as string) || "unknown";

        // Consume and discard response stream with maximum size bound (1MB)
        let totalBytes = 0;
        res.on("data", (chunk: Buffer) => {
          totalBytes += chunk.length;
          if (totalBytes > 1024 * 1024) {
            res.destroy(); // Protect against oversized responses
          }
        });

        res.on("end", () => {
          resolve({
            statusCode,
            statusText,
            headers: headersRecord,
            redirectLocation,
            contentType,
            server,
          });
        });

        res.on("error", (err) => {
          reject(err);
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error(`Connection timed out after ${timeoutMs}ms.`));
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: 30 requests per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(`check_status:${clientIp}`, 30, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Too many status check requests from this IP. Please wait before retrying.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSeconds),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        }
      );
    }

    // 2. Body Validation
    let body: { url?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const targetUrl = body?.url;
    if (!targetUrl || typeof targetUrl !== "string") {
      return NextResponse.json({ error: "URL is required and must be a string." }, { status: 400 });
    }

    // Max URL length check
    if (targetUrl.length > 2048) {
      return NextResponse.json({ error: "URL exceeds maximum allowed length of 2048 characters." }, { status: 400 });
    }

    // 3. SSRF & DNS validation
    let validatedTarget: ValidatedTarget;
    try {
      validatedTarget = await validateAndResolveTarget(targetUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "SSRF validation failed";
      return NextResponse.json({ error: msg }, { status: 403 });
    }

    // 4. Request Dispatch with Connection Pinning & Timing
    const startTime = Date.now();
    const timeoutMs = 6000;

    try {
      // First try lightweight HEAD request
      let result: HttpResponseResult;
      try {
        result = await requestWithPinnedIp(validatedTarget, "HEAD", timeoutMs);
        if (result.statusCode === 405) {
          // If HEAD is not allowed by server, retry with GET
          result = await requestWithPinnedIp(validatedTarget, "GET", timeoutMs);
        }
      } catch {
        // Some servers reject HEAD with 501 or disconnect; fallback to GET
        result = await requestWithPinnedIp(validatedTarget, "GET", timeoutMs);
      }

      const responseTimeMs = Date.now() - startTime;

      return NextResponse.json({
        url: validatedTarget.url.toString(),
        status: result.statusCode,
        statusText: result.statusText,
        responseTimeMs,
        headers: result.headers,
        redirectLocation: result.redirectLocation,
        contentType: result.contentType,
        server: result.server,
      });
    } catch (err: unknown) {
      const responseTimeMs = Date.now() - startTime;
      const msg = err instanceof Error ? err.message : "Network error";

      if (msg.includes("timed out") || msg.includes("Timeout")) {
        return NextResponse.json(
          { error: "Connection timed out after 6 seconds. The target host did not respond." },
          { status: 504 }
        );
      }

      return NextResponse.json(
        {
          error: `Could not connect to server: ${msg}`,
          responseTimeMs,
        },
        { status: 502 }
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: `Internal error checking status: ${msg}` },
      { status: 500 }
    );
  }
}
