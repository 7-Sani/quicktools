import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: 10 requests per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(`ai_remove_bg:${clientIp}`, 10, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Rate limit exceeded. Please wait before submitting more background removal requests.",
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

    // 2. Content-Type and Payload Validation
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "BAD_REQUEST", message: "Expected multipart/form-data request with an 'image' file." },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "BAD_REQUEST", message: "No image file provided." },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "PAYLOAD_TOO_LARGE", message: "Image exceeds 10MB limit." },
        { status: 413 }
      );
    }

    // Validate MIME type
    const fileMime = imageFile.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(fileMime)) {
      return NextResponse.json(
        {
          success: false,
          error: "BAD_REQUEST",
          message: `Unsupported file type "${fileMime}". Only JPEG, PNG, and WebP images are supported.`,
        },
        { status: 400 }
      );
    }

    const removeBgKey = process.env.REMOVE_BG_API_KEY || process.env.CLIPDROP_API_KEY;

    if (!removeBgKey) {
      return NextResponse.json(
        {
          success: false,
          error: "CREDENTIALS_MISSING",
          message:
            "Neural background removal requires an external model API key. Please set REMOVE_BG_API_KEY or CLIPDROP_API_KEY in your server environment (.env.local). Alternatively, use the built-in local color-threshold cutout tool.",
        },
        { status: 503 }
      );
    }

    // Call Remove.bg API if configured
    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", imageFile);
    removeBgFormData.append("size", "auto");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": removeBgKey,
        },
        body: removeBgFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson.errors?.[0]?.title || `Remove.bg API returned HTTP ${response.status}`;
        return NextResponse.json(
          { success: false, error: "API_ERROR", message: errMsg },
          { status: response.status }
        );
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;

      return NextResponse.json({
        success: true,
        resultUrl: dataUrl,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isTimeout = err instanceof Error && err.name === "AbortError";
      return NextResponse.json(
        {
          success: false,
          error: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
          message: isTimeout ? "Request timed out after 20s." : "Network error contacting remove.bg.",
        },
        { status: 504 }
      );
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 }
    );
  }
}
