import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";

const MAX_BASE64_LENGTH = 14 * 1024 * 1024; // ~10MB image in base64
const MAX_PROMPT_CHARS = 500;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: 15 requests per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(`ai_vision:${clientIp}`, 15, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before submitting more vision requests." },
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
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
    }

    const { image, prompt } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Missing required 'image' (base64 data URL string)." }, { status: 400 });
    }

    if (image.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: "Image exceeds maximum allowed payload size of 10MB." },
        { status: 413 }
      );
    }

    // Validate data URL structure and MIME type
    const dataUrlMatch = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      return NextResponse.json(
        { error: "Invalid image format. Expected a valid data URL (e.g. data:image/jpeg;base64,...)." },
        { status: 400 }
      );
    }

    const mimeType = dataUrlMatch[1].toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported image MIME type: "${mimeType}". Supported: JPEG, PNG, WebP, GIF.` },
        { status: 400 }
      );
    }

    const base64Data = dataUrlMatch[2];

    const safePrompt = typeof prompt === "string" ? prompt.trim().slice(0, MAX_PROMPT_CHARS) : "";
    const userPromptText = safePrompt || "Describe this image in detail and suggest 5 relevant hashtags or captions.";

    // 3. Server-Controlled System Prompt (Reject arbitrary client systemPrompt)
    const serverSystemPrompt =
      "You are a professional image caption generator and computer vision analyst. Generate accurate, engaging descriptions, hashtags, and social captions.";

    // 4. Provider Credentials Check
    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!openAiKey && !geminiKey) {
      return NextResponse.json(
        {
          error: "No AI vision provider configured on server.",
          details: "Set OPENAI_API_KEY or GEMINI_API_KEY in your server environment (.env.local) to enable neural vision captioning.",
          missingCredentials: true,
        },
        { status: 503 }
      );
    }

    const timeoutMs = 15000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // 1. Google Gemini Vision
      if (geminiKey) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${serverSystemPrompt}\n\n${userPromptText}` },
                  {
                    inlineData: {
                      mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 600,
              temperature: 0.3,
            },
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          return NextResponse.json(
            { error: `Gemini API error (${response.status})`, details: errData.error?.message || response.statusText },
            { status: response.status }
          );
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No description generated.";
        return NextResponse.json({ result: text, provider: "Google Gemini Vision" });
      }

      // 2. OpenAI Vision (gpt-4o-mini)
      if (openAiKey) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: serverSystemPrompt,
              },
              {
                role: "user",
                content: [
                  { type: "text", text: userPromptText },
                  { type: "image_url", image_url: { url: image } },
                ],
              },
            ],
            max_tokens: 600,
            temperature: 0.3,
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          return NextResponse.json(
            { error: `OpenAI API error (${response.status})`, details: errData.error?.message || response.statusText },
            { status: response.status }
          );
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "No caption generated.";
        return NextResponse.json({ result: text, provider: "OpenAI GPT-4o-mini Vision" });
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json({ error: "Vision request timed out after 15 seconds." }, { status: 504 });
      }
      throw err;
    }

    return NextResponse.json({ error: "No vision provider could process the request" }, { status: 500 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
