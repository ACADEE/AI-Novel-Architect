import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

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
  const {
    planText,
    characters,
    ghostwriterName,
    ghostwriterStyle,
    ghostwriterDescription,
    generalFeedback,
    strengths,
    weaknesses,
    chapterFeedbacks,
  } = body as {
    planText: string;
    characters?: string;
    ghostwriterName: string;
    ghostwriterStyle: string;
    ghostwriterDescription: string;
    generalFeedback: string;
    strengths: string[];
    weaknesses: string[];
    chapterFeedbacks: Array<{
      chapterNumber: number;
      title: string;
      feedback: string;
      suggestions: string[];
    }>;
  };

  const chapterFeedbackBlock = chapterFeedbacks
    .map(
      (c) =>
        `Chapitre ${c.chapterNumber} — "${c.title}":\n  Feedback: ${c.feedback}\n  Suggestions: ${c.suggestions.join("; ")}`
    )
    .join("\n\n");

  const prompt = `Tu es ${ghostwriterName}, un ghost writer spécialisé en ${ghostwriterStyle}.

DESCRIPTION DE TON STYLE:
${ghostwriterDescription}

Ta mission: Réécrire intégralement le plan détaillé du roman ci-dessous en:
1. Adoptant pleinement ton style narratif (${ghostwriterStyle})
2. Intégrant TOUS les retours de l'audit littéraire (général et par chapitre)
3. Corrigeant les faiblesses identifiées tout en amplifiant les points forts
4. Enrichissant la structure, les personnages et les arcs narratifs

─── PLAN ORIGINAL ───
${planText}

${characters ? `─── PERSONNAGES ───\n${characters}\n` : ""}

─── RETOURS D'AUDIT GÉNÉRAL ───
Feedback global: ${generalFeedback}

Points forts à conserver: ${strengths.map((s, i) => `\n${i + 1}. ${s}`).join("")}

Points faibles à corriger: ${weaknesses.map((w, i) => `\n${i + 1}. ${w}`).join("")}

─── RETOURS PAR CHAPITRE ───
${chapterFeedbackBlock}

─── INSTRUCTIONS ───
Produis un plan détaillé complet et réécrit. Structure ta réponse avec:
- Un titre réécrit (si nécessaire)
- Une synopsis enrichie (2-3 paragraphes)
- Les personnages réécrits/enrichis
- Le plan chapitre par chapitre avec: résumé enrichi, objectifs narratifs, hook/cliffhanger, scènes principales
- Des notes de l'auteur sur les thèmes et la progression

Réponds en français. Sois créatif, précis et fidèle à ton style de ghost writer.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
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

    const rewrittenPlan = candidate?.content?.parts?.[0]?.text ?? "";

    if (!rewrittenPlan) {
      return NextResponse.json(
        { error: "Gemini returned no text content" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      rewrittenPlan,
      chapterCount: chapterFeedbacks.length,
    });
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
