import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";

const VALID_ACTIONS = new Set(["summarize", "grammar", "rewrite", "translate", "keywords", "assist"]);
const MAX_INPUT_CHARS = 12000;

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: 20 requests per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(`ai_text:${clientIp}`, 20, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Rate limit exceeded. Please wait before submitting more AI text requests.",
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
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "BAD_REQUEST", message: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { action, text, targetLang, tone, prompt } = body;

    const userRawText = (typeof text === "string" ? text : typeof prompt === "string" ? prompt : "").trim();

    if (!userRawText) {
      return NextResponse.json(
        { success: false, error: "BAD_REQUEST", message: "Text or prompt input is required." },
        { status: 400 }
      );
    }

    // Input length limit to prevent quota exhaustion attacks
    if (userRawText.length > MAX_INPUT_CHARS) {
      return NextResponse.json(
        {
          success: false,
          error: "PAYLOAD_TOO_LARGE",
          message: `Input text exceeds maximum allowed length of ${MAX_INPUT_CHARS} characters.`,
        },
        { status: 413 }
      );
    }

    // Validate action parameter
    const actionStr = typeof action === "string" ? action.trim().toLowerCase() : "";
    if (actionStr && !VALID_ACTIONS.has(actionStr)) {
      return NextResponse.json(
        { success: false, error: "BAD_REQUEST", message: `Invalid action specified: "${actionStr}".` },
        { status: 400 }
      );
    }

    // Sanitize optional tone and language parameters
    const safeTone = typeof tone === "string" ? tone.slice(0, 50).replace(/[^\w\s-]/g, "") : "professional";
    const safeLang = typeof targetLang === "string" ? targetLang.slice(0, 50).replace(/[^\w\s-]/g, "") : "Spanish";

    // 3. Provider Credentials check (Server-Side only)
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const customBaseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

    if (!openaiKey && !geminiKey && !groqKey) {
      const msg = "No AI provider API key is configured on the server. Please set OPENAI_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY in server-side environment variables (.env.local).";
      return NextResponse.json(
        {
          success: false,
          error: "CREDENTIALS_MISSING",
          message: msg,
          details: msg,
          missingCredentials: true,
        },
        { status: 503 }
      );
    }

    // 4. Enforce STRICT server-controlled system instructions (NEVER allow arbitrary client systemPrompt overrides)
    let systemInstruction = "You are a helpful, concise AI assistant for text processing.";

    switch (actionStr) {
      case "summarize":
        systemInstruction = "You are an expert summarizer. Provide a clean, accurate executive summary of the provided text, followed by 3 key takeaway bullet points.";
        break;
      case "grammar":
        systemInstruction = "You are a professional grammar and copy editor. Correct all grammatical, spelling, and punctuation errors. Return the corrected text, followed by a bulleted list of fixes made.";
        break;
      case "rewrite":
        systemInstruction = `Rewrite the provided text in a ${safeTone || "professional"} tone while preserving all factual information. Keep formatting clean.`;
        break;
      case "translate":
        systemInstruction = `Translate the provided text accurately into ${safeLang || "Spanish"}. Preserve formatting and tone.`;
        break;
      case "keywords":
        systemInstruction = "Extract the top primary keywords, technical entities, and core concepts from the text. Return as a clean comma-separated list and bulleted categories.";
        break;
      case "assist":
        systemInstruction = "You are a versatile writing assistant. Follow the prompt instructions precisely and generate polished, production-ready copy.";
        break;
    }

    // 5. Call OpenAI or compatible provider if configured
    if (openaiKey || groqKey) {
      const apiKey = openaiKey || groqKey;
      const endpoint = groqKey && !openaiKey ? "https://api.groq.com/openai/v1/chat/completions" : `${customBaseUrl}/chat/completions`;
      const model = groqKey && !openaiKey ? "llama-3.3-70b-versatile" : "gpt-4o-mini";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: userRawText },
            ],
            temperature: 0.3,
            max_tokens: 1500,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `Provider returned HTTP ${response.status}`;
          return NextResponse.json(
            { success: false, error: "API_ERROR", message: `AI Provider Error: ${errMsg}` },
            { status: response.status }
          );
        }

        const data = await response.json();
        const output = data.choices?.[0]?.message?.content || "";

        return NextResponse.json({
          success: true,
          result: output,
          provider: openaiKey ? "openai" : "groq",
          model,
        });
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const isTimeout = err instanceof Error && err.name === "AbortError";
        return NextResponse.json(
          {
            success: false,
            error: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
            message: isTimeout
              ? "AI request timed out after 15 seconds. Please try again with shorter text."
              : "Failed to connect to AI provider API.",
          },
          { status: 504 }
        );
      }
    }

    // 6. Call Google Gemini API if geminiKey exists
    if (geminiKey) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemInstruction}\n\nUser Input:\n${userRawText}` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1500,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `Gemini returned HTTP ${response.status}`;
          return NextResponse.json(
            { success: false, error: "API_ERROR", message: `Gemini API Error: ${errMsg}` },
            { status: response.status }
          );
        }

        const data = await response.json();
        const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return NextResponse.json({
          success: true,
          result: output,
          provider: "gemini",
          model: "gemini-1.5-flash",
        });
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const isTimeout = err instanceof Error && err.name === "AbortError";
        return NextResponse.json(
          {
            success: false,
            error: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
            message: isTimeout ? "Gemini request timed out after 15s." : "Network failure connecting to Gemini.",
          },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "NO_PROVIDER", message: "No compatible provider configured." },
      { status: 500 }
    );
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
