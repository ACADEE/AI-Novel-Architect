import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
// Allow up to 5 minutes for large plan audits
export const maxDuration = 300;

export interface ChapterAudit {
  chapterNumber: number;
  title: string;
  feedback: string;
  suggestions: string[];
  score: number; // 1-10
}

export interface AuditResult {
  generalFeedback: string;
  strengths: string[];
  weaknesses: string[];
  overallScore: number;
  chapters: ChapterAudit[];
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { planText, characters, chapters } = body as {
    planText: string;
    characters?: string;
    chapters?: Array<{ number: number; title: string; summary: string }>;
  };

  const chaptersBlock = chapters
    ? chapters
        .map((c) => `Chapitre ${c.number}: ${c.title}\nRésumé: ${c.summary}`)
        .join("\n\n")
    : "";

  const prompt = `Tu es un éditeur littéraire expert. Analyse le plan détaillé du roman suivant et fournis un audit structuré.

PLAN DU ROMAN:
${planText}

${characters ? `PERSONNAGES:\n${characters}\n` : ""}
${chaptersBlock ? `CHAPITRES EXISTANTS:\n${chaptersBlock}\n` : ""}

Réponds UNIQUEMENT avec un objet JSON valide (aucun texte avant ou après) respectant exactement ce schéma:
{
  "generalFeedback": "Feedback global sur le plan (2-3 paragraphes)",
  "strengths": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "weaknesses": ["Point faible 1", "Point faible 2", "Point faible 3"],
  "overallScore": 7,
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Titre du chapitre",
      "feedback": "Commentaire spécifique sur ce chapitre",
      "suggestions": ["Suggestion 1", "Suggestion 2"],
      "score": 8
    }
  ]
}

Sois précis, constructif et francophone. Si les chapitres ne sont pas listés dans le plan, génère des commentaires basés sur les chapitres mentionnés dans le texte.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message ?? `Gemini HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];

    if (!candidate || candidate.finishReason === "SAFETY") {
      return NextResponse.json(
        { error: "Gemini returned empty response (safety filter or quota)" },
        { status: 502 }
      );
    }

    const rawText = candidate?.content?.parts?.[0]?.text ?? "";

    // Strip potential markdown code fences
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let audit: AuditResult;
    try {
      audit = JSON.parse(jsonText);
    } catch {
      // Gemini sometimes returns slightly malformed JSON — attempt a best-effort parse
      return NextResponse.json(
        { error: "Gemini returned malformed JSON. Raw response: " + rawText.slice(0, 300) },
        { status: 502 }
      );
    }

    return NextResponse.json(audit);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Network error contacting Gemini",
      },
      { status: 503 }
    );
  }
}
