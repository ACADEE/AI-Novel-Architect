import { NextResponse } from "next/server";

// ─── Root causes of "API returned empty response" and their fixes ─────────────
//
// 1. Wrong API version: preview/flash/exp models MUST use v1beta, not v1.
//    Using v1 returns 404 which some callers silently treat as "empty".
//
// 2. Content safety filter: finishReason "SAFETY" returns no .content,
//    so `candidates[0].content.parts[0].text` is undefined → "empty response".
//
// 3. Over-restricted maxOutputTokens (e.g. 0 or 1) → model returns nothing.
//
// 4. Model name mismatch: e.g. "gemini-3-flash-preview" may need the exact
//    name registered in the API (check /v1beta/models endpoint for list).
//
// This route handles all four cases explicitly.
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

  if (!apiKey) {
    return NextResponse.json({
      status: "error",
      apiKeyConfigured: false,
      model,
      errorMessage:
        "GEMINI_API_KEY is not set. Add it to your .env.local file.",
      checkedAt: new Date().toISOString(),
    });
  }

  // FIX 1: Always use v1beta — required for all flash/preview/exp models.
  // v1 only covers a small set of fully-GA models (gemini-1.0-pro, etc.).
  const apiVersion = "v1beta";
  const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

  const start = Date.now();

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          // FIX 3: Minimal prompt that won't trigger safety filters
          { role: "user", parts: [{ text: "Reply with exactly the word: OK" }] },
        ],
        // FIX 4: Give the model enough tokens to actually respond
        generationConfig: { maxOutputTokens: 16, temperature: 0 },
      }),
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      let errMsg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errBody = await res.json();
        errMsg = errBody?.error?.message ?? errMsg;
      } catch {
        // ignore JSON parse failure
      }
      return NextResponse.json({
        status: "error",
        apiKeyConfigured: true,
        model,
        latencyMs,
        errorMessage: errMsg,
        checkedAt: new Date().toISOString(),
      });
    }

    const data = await res.json();

    // FIX 2: Explicit check for empty candidates array
    if (!data.candidates || data.candidates.length === 0) {
      // Can happen when promptFeedback.blockReason is set (safety block before generation)
      const blockReason = data.promptFeedback?.blockReason;
      return NextResponse.json({
        status: "error",
        apiKeyConfigured: true,
        model,
        latencyMs,
        errorMessage: blockReason
          ? `API blocked by safety filter (blockReason: ${blockReason}). Try adjusting the test prompt.`
          : "API returned empty response — no candidates returned. Possible causes: content safety filter, quota exceeded, or model unavailable.",
        checkedAt: new Date().toISOString(),
      });
    }

    const candidate = data.candidates[0];

    // FIX 2b: finishReason SAFETY means content was generated but then filtered
    if (candidate.finishReason === "SAFETY") {
      return NextResponse.json({
        status: "error",
        apiKeyConfigured: true,
        model,
        latencyMs,
        errorMessage:
          "API response blocked by safety filter (finishReason: SAFETY). The test prompt triggered content filtering.",
        checkedAt: new Date().toISOString(),
      });
    }

    // FIX 2c: candidate exists but content/parts are missing
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({
        status: "error",
        apiKeyConfigured: true,
        model,
        latencyMs,
        errorMessage: `API returned a candidate with no text content (finishReason: ${candidate.finishReason ?? "unknown"}). This may be a model quota or capability issue.`,
        checkedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: "connected",
      apiKeyConfigured: true,
      model,
      latencyMs,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json({
      status: "error",
      apiKeyConfigured: true,
      model,
      latencyMs: Date.now() - start,
      errorMessage:
        err instanceof Error
          ? err.message
          : "Network error connecting to Gemini API",
      checkedAt: new Date().toISOString(),
    });
  }
}
